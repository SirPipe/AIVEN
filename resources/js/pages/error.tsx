import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Compass,
    LockKeyhole,
    RefreshCw,
    SearchX,
    ServerCrash,
    TimerReset,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { explore, home } from '@/routes';

type ErrorContent = {
    eyebrow: string;
    title: string;
    description: string;
    icon: LucideIcon;
};

const errorContent: Record<number, ErrorContent> = {
    403: {
        eyebrow: 'Acceso restringido',
        title: 'Este espacio no está disponible para tu cuenta',
        description:
            'Tu sesión funciona correctamente, pero no tienes permiso para entrar en esta sección.',
        icon: LockKeyhole,
    },
    404: {
        eyebrow: 'Página no encontrada',
        title: 'Parece que esta ruta aún no existe',
        description:
            'La dirección pudo cambiar o quizá llegaste antes de que publiquemos este módulo.',
        icon: SearchX,
    },
    419: {
        eyebrow: 'Sesión expirada',
        title: 'Necesitamos actualizar tu sesión',
        description:
            'Recarga la página y vuelve a intentar la acción para mantener tu cuenta protegida.',
        icon: TimerReset,
    },
    500: {
        eyebrow: 'Error del sistema',
        title: 'AIVEN encontró un problema inesperado',
        description:
            'La incidencia quedó registrada. Puedes volver al inicio mientras la revisamos.',
        icon: ServerCrash,
    },
    503: {
        eyebrow: 'Mantenimiento',
        title: 'Estamos afinando la plataforma',
        description:
            'AIVEN estará disponible de nuevo en cuanto terminemos esta actualización.',
        icon: RefreshCw,
    },
};

export default function ErrorPage({ status }: { status: number }) {
    const content = errorContent[status] ?? errorContent[500];
    const Icon = content.icon;

    return (
        <>
            <Head title={`${status} · ${content.eyebrow}`} />
            <div className="relative flex min-h-[calc(100svh-8rem)] items-center justify-center overflow-hidden p-5 sm:p-8">
                <div className="pointer-events-none absolute top-1/4 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
                <div className="relative w-full max-w-2xl rounded-[2rem] border border-primary/15 bg-card p-6 text-center shadow-xl shadow-primary/5 sm:p-10">
                    <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="size-7" />
                    </span>
                    <p className="mt-5 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                        {status} · {content.eyebrow}
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">
                        {content.title}
                    </h1>
                    <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {content.description}
                    </p>
                    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                        <Button asChild className="rounded-full">
                            <Link href={home()}>
                                <ArrowLeft className="size-4" />
                                Volver al inicio
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-full"
                        >
                            <Link href={explore()}>
                                <Compass className="size-4" />
                                Explorar AIVEN
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
