import { Download, RefreshCw, WifiOff, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePwa } from '@/hooks/use-pwa';

type NoticeKind = 'install' | 'offline' | 'update';

interface Notice {
    action?: string;
    description: string;
    kind: NoticeKind;
    title: string;
}

export function PwaStatus() {
    const { applyUpdate, canInstall, hasUpdate, install, isOnline } = usePwa();
    const [dismissedInstall, setDismissedInstall] = useState(false);
    const [dismissedUpdate, setDismissedUpdate] = useState(false);
    const [isActing, setIsActing] = useState(false);

    let notice: Notice | null = null;

    if (!isOnline) {
        notice = {
            description:
                'Algunas funciones no están disponibles. Tus datos privados no se guardan en el caché público.',
            kind: 'offline',
            title: 'Sin conexión',
        };
    } else if (hasUpdate && !dismissedUpdate) {
        notice = {
            action: 'Actualizar ahora',
            description:
                'Hay una versión nueva lista. Se recargará AIVEN para aplicarla.',
            kind: 'update',
            title: 'Actualización disponible',
        };
    } else if (canInstall && !dismissedInstall) {
        notice = {
            action: 'Instalar AIVEN',
            description:
                'Añádela a tu dispositivo para abrirla como una aplicación.',
            kind: 'install',
            title: 'Lleva AIVEN contigo',
        };
    }

    if (!notice) {
        return null;
    }

    const Icon =
        notice.kind === 'offline'
            ? WifiOff
            : notice.kind === 'update'
              ? RefreshCw
              : Download;
    const dismiss = () => {
        if (notice.kind === 'update') {
            setDismissedUpdate(true);
        }

        if (notice.kind === 'install') {
            setDismissedInstall(true);
        }
    };
    const performAction = async () => {
        setIsActing(true);

        if (notice.kind === 'update') {
            const updateStarted = applyUpdate();

            if (!updateStarted) {
                setIsActing(false);
            }

            return;
        }

        try {
            await install();
        } finally {
            setIsActing(false);
        }
    };
    const canDismiss = notice.kind !== 'offline';

    return (
        <div className="pointer-events-none fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[100] flex justify-center sm:inset-x-6 sm:bottom-6">
            <section
                className="pointer-events-auto flex w-full max-w-xl items-start gap-3 rounded-2xl border border-white/10 bg-[#0b1020]/95 p-4 text-slate-50 shadow-2xl shadow-black/30 backdrop-blur supports-[backdrop-filter]:bg-[#0b1020]/85"
                role="region"
                aria-labelledby="pwa-status-title"
            >
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-cyan-300">
                    <Icon
                        className={
                            isActing && notice.kind === 'update'
                                ? 'size-5 animate-spin motion-reduce:animate-none'
                                : 'size-5'
                        }
                        aria-hidden="true"
                    />
                </span>

                <div
                    className="min-w-0 flex-1"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <h2 id="pwa-status-title" className="text-sm font-semibold">
                        {notice.title}
                    </h2>
                    <p className="mt-1 text-sm leading-5 text-slate-300">
                        {notice.description}
                    </p>

                    {notice.action && (
                        <Button
                            type="button"
                            size="sm"
                            className="mt-3 bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                            disabled={isActing}
                            onClick={() => void performAction()}
                        >
                            {notice.action}
                        </Button>
                    )}
                </div>

                {canDismiss && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-slate-300 hover:bg-white/10 hover:text-white"
                        aria-label={`Ocultar aviso de ${notice.kind === 'update' ? 'actualización' : 'instalación'}`}
                        onClick={dismiss}
                    >
                        <X aria-hidden="true" />
                    </Button>
                )}
            </section>
        </div>
    );
}
