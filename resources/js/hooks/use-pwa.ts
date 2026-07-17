import { useCallback, useEffect, useRef, useState } from 'react';

type InstallOutcome = 'accepted' | 'dismissed';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{
        outcome: InstallOutcome;
        platform: string;
    }>;
}

interface NavigatorWithStandalone extends Navigator {
    standalone?: boolean;
}

const SERVICE_WORKER_URL = '/service-worker.js';
const SERVICE_WORKER_UPDATE_INTERVAL = 60 * 60 * 1000;

function assetVersion(): string {
    if (typeof document === 'undefined') {
        return 'unversioned';
    }

    return (
        document.querySelector<HTMLMetaElement>(
            'meta[name="aiven-asset-version"]',
        )?.content || 'unversioned'
    );
}

function detectStandaloneMode(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return false;
    }

    const navigatorWithStandalone = navigator as NavigatorWithStandalone;

    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        navigatorWithStandalone.standalone === true
    );
}

export function usePwa() {
    const serviceWorkerUrl = `${SERVICE_WORKER_URL}?v=${encodeURIComponent(assetVersion())}`;
    const installPrompt = useRef<BeforeInstallPromptEvent | null>(null);
    const shouldReloadForUpdate = useRef(false);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(detectStandaloneMode);
    const [isOnline, setIsOnline] = useState(() =>
        typeof navigator === 'undefined' ? true : navigator.onLine,
    );
    const [isStandalone, setIsStandalone] = useState(detectStandaloneMode);
    const [updateWorker, setUpdateWorker] = useState<ServiceWorker | null>(
        null,
    );

    useEffect(() => {
        if (typeof window === 'undefined' || typeof navigator === 'undefined') {
            return;
        }

        const displayMode = window.matchMedia('(display-mode: standalone)');
        const updateDisplayMode = () => {
            const standalone = detectStandaloneMode();

            setIsStandalone(standalone);

            if (standalone) {
                setIsInstalled(true);
                setIsInstallable(false);
                installPrompt.current = null;
            }
        };
        const updateOnlineState = () => setIsOnline(navigator.onLine);
        const handleInstallPrompt = (event: Event) => {
            event.preventDefault();
            installPrompt.current = event as BeforeInstallPromptEvent;
            setIsInstallable(true);
        };
        const handleInstalled = () => {
            installPrompt.current = null;
            setIsInstallable(false);
            setIsInstalled(true);
        };

        displayMode.addEventListener('change', updateDisplayMode);
        window.addEventListener('appinstalled', handleInstalled);
        window.addEventListener('beforeinstallprompt', handleInstallPrompt);
        window.addEventListener('offline', updateOnlineState);
        window.addEventListener('online', updateOnlineState);

        return () => {
            displayMode.removeEventListener('change', updateDisplayMode);
            window.removeEventListener('appinstalled', handleInstalled);
            window.removeEventListener(
                'beforeinstallprompt',
                handleInstallPrompt,
            );
            window.removeEventListener('offline', updateOnlineState);
            window.removeEventListener('online', updateOnlineState);
        };
    }, []);

    useEffect(() => {
        if (
            typeof window === 'undefined' ||
            typeof navigator === 'undefined' ||
            !import.meta.env.PROD ||
            !window.isSecureContext ||
            !('serviceWorker' in navigator)
        ) {
            return;
        }

        let isCancelled = false;
        let removeRegistrationListeners = () => undefined;
        const handleControllerChange = () => {
            if (shouldReloadForUpdate.current) {
                window.location.reload();
            }
        };
        const registerServiceWorker = async () => {
            try {
                const registration = await navigator.serviceWorker.register(
                    serviceWorkerUrl,
                    {
                        scope: '/',
                        updateViaCache: 'none',
                    },
                );

                if (isCancelled) {
                    return;
                }

                let installingWorker: ServiceWorker | null = null;
                let handleInstallingStateChange = () => undefined;
                const showWaitingUpdate = (worker: ServiceWorker | null) => {
                    if (worker && navigator.serviceWorker.controller) {
                        setUpdateWorker(worker);
                    }
                };
                const handleUpdateFound = () => {
                    installingWorker?.removeEventListener(
                        'statechange',
                        handleInstallingStateChange,
                    );
                    installingWorker = registration.installing;
                    handleInstallingStateChange = () => {
                        if (installingWorker?.state === 'installed') {
                            showWaitingUpdate(
                                registration.waiting ?? installingWorker,
                            );
                        }
                    };
                    installingWorker?.addEventListener(
                        'statechange',
                        handleInstallingStateChange,
                    );
                };
                const checkForUpdate = () => {
                    if (document.visibilityState === 'visible') {
                        void registration.update().catch(() => undefined);
                    }
                };
                const updateInterval = window.setInterval(
                    checkForUpdate,
                    SERVICE_WORKER_UPDATE_INTERVAL,
                );

                registration.addEventListener('updatefound', handleUpdateFound);

                if (registration.installing) {
                    handleUpdateFound();
                }

                showWaitingUpdate(registration.waiting);
                document.addEventListener('visibilitychange', checkForUpdate);
                window.addEventListener('online', checkForUpdate);
                checkForUpdate();

                removeRegistrationListeners = () => {
                    window.clearInterval(updateInterval);
                    installingWorker?.removeEventListener(
                        'statechange',
                        handleInstallingStateChange,
                    );
                    registration.removeEventListener(
                        'updatefound',
                        handleUpdateFound,
                    );
                    document.removeEventListener(
                        'visibilitychange',
                        checkForUpdate,
                    );
                    window.removeEventListener('online', checkForUpdate);
                };
            } catch {
                return;
            }
        };
        const startRegistration = () => void registerServiceWorker();

        navigator.serviceWorker.addEventListener(
            'controllerchange',
            handleControllerChange,
        );

        if (document.readyState === 'complete') {
            startRegistration();
        } else {
            window.addEventListener('load', startRegistration, { once: true });
        }

        return () => {
            isCancelled = true;
            removeRegistrationListeners();
            navigator.serviceWorker.removeEventListener(
                'controllerchange',
                handleControllerChange,
            );
            window.removeEventListener('load', startRegistration);
        };
    }, [serviceWorkerUrl]);

    const install = useCallback(async (): Promise<InstallOutcome | null> => {
        const promptEvent = installPrompt.current;

        if (!promptEvent) {
            return null;
        }

        try {
            await promptEvent.prompt();
            const choice = await promptEvent.userChoice;

            if (choice.outcome === 'accepted') {
                setIsInstalled(true);
            }

            return choice.outcome;
        } finally {
            installPrompt.current = null;
            setIsInstallable(false);
        }
    }, []);

    const applyUpdate = useCallback((): boolean => {
        if (!updateWorker) {
            return false;
        }

        shouldReloadForUpdate.current = true;
        updateWorker.postMessage({ type: 'SKIP_WAITING' });

        return true;
    }, [updateWorker]);

    return {
        applyUpdate,
        canInstall: isInstallable && !isInstalled && !isStandalone,
        hasUpdate: updateWorker !== null,
        install,
        isOnline,
        isStandalone,
    };
}
