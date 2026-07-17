import { useEffect } from 'react';

type OfflineToolCacheOptions = {
    canonicalUrl: string;
    enabled: boolean;
    shellUrl: string;
};

function loadedPublicAssets(): string[] {
    if (typeof window === 'undefined') {
        return [];
    }

    const assetUrls = new Set<string>();
    const addAsset = (candidate: string | null | undefined) => {
        if (!candidate) {
            return;
        }

        const url = new URL(candidate, window.location.origin);

        if (
            url.origin === window.location.origin &&
            url.pathname.startsWith('/build/assets/') &&
            url.search === ''
        ) {
            assetUrls.add(url.pathname);
        }
    };

    performance.getEntriesByType('resource').forEach((entry) => {
        addAsset(entry.name);
    });
    document
        .querySelectorAll<HTMLScriptElement>('script[src]')
        .forEach((element) => addAsset(element.src));
    document
        .querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]')
        .forEach((element) => addAsset(element.href));

    return [...assetUrls];
}

export function useOfflineToolCache({
    canonicalUrl,
    enabled,
    shellUrl,
}: OfflineToolCacheOptions): void {
    useEffect(() => {
        if (
            !enabled ||
            !import.meta.env.PROD ||
            typeof navigator === 'undefined' ||
            !('serviceWorker' in navigator)
        ) {
            return;
        }

        let isCancelled = false;

        const cacheToolShell = async () => {
            const registration = await navigator.serviceWorker.ready;

            if (isCancelled) {
                return;
            }

            const worker =
                navigator.serviceWorker.controller ?? registration.active;

            worker?.postMessage({
                type: 'CACHE_TOOL_SHELL',
                assetUrls: loadedPublicAssets(),
                canonicalUrl,
                shellUrl,
            });
        };

        const timeouts = [750, 2_500].map((delay) =>
            window.setTimeout(() => {
                void cacheToolShell().catch(() => undefined);
            }, delay),
        );

        return () => {
            isCancelled = true;
            timeouts.forEach((timeout) => window.clearTimeout(timeout));
        };
    }, [canonicalUrl, enabled, shellUrl]);
}
