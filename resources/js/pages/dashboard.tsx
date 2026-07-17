import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    Boxes,
    Clock3,
    Compass,
    Gamepad2,
    Heart,
    MapPinned,
    MessagesSquare,
    Sparkles,
    Wrench,
} from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    community,
    dashboard,
    explore,
    games,
    map,
    simulators,
    tools,
} from '@/routes';

const quickAccessItems = [
    {
        title: 'Herramientas',
        description: 'Utilidades prácticas para resolver tareas cotidianas.',
        href: tools(),
        icon: Wrench,
        color: 'text-cyan-600 dark:text-cyan-400',
        background: 'bg-cyan-500/10',
    },
    {
        title: 'Simuladores',
        description: 'Aprende tecnología experimentando paso a paso.',
        href: simulators(),
        icon: Boxes,
        color: 'text-violet-600 dark:text-violet-400',
        background: 'bg-violet-500/10',
    },
    {
        title: 'Juegos',
        description: 'Pon a prueba tus habilidades mientras te diviertes.',
        href: games(),
        icon: Gamepad2,
        color: 'text-amber-600 dark:text-amber-400',
        background: 'bg-amber-500/10',
    },
    {
        title: 'Comunidad',
        description: 'Comparte preguntas, ideas y proyectos tecnológicos.',
        href: community(),
        icon: MessagesSquare,
        color: 'text-emerald-600 dark:text-emerald-400',
        background: 'bg-emerald-500/10',
    },
];

export default function Dashboard() {
    const { auth } = usePage().props;

    if (!auth.user) {
        return null;
    }

    const firstName = auth.user.name.trim().split(/\s+/)[0];

    return (
        <>
            <Head title="Inicio" />
            <div className="mx-auto flex w-full max-w-[96rem] flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8">
                <section className="relative isolate overflow-hidden rounded-[1.75rem] border border-primary/15 bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-9">
                    <div className="pointer-events-none absolute -top-24 -right-12 -z-10 size-72 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-400/10" />
                    <div className="pointer-events-none absolute -bottom-32 left-1/3 -z-10 size-80 rounded-full bg-violet-500/15 blur-3xl dark:bg-violet-500/10" />
                    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                        <div className="max-w-2xl space-y-4">
                            <Badge
                                variant="secondary"
                                className="rounded-full border border-primary/10 bg-primary/8 px-3 py-1 text-primary"
                            >
                                <Sparkles className="size-3.5" />
                                Tu espacio tecnológico
                            </Badge>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">
                                    Hola, {firstName}. ¿Qué quieres descubrir
                                    hoy?
                                </h1>
                                <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                                    AIVEN reúne aprendizaje, utilidades y
                                    comunidad en un solo lugar. Tu progreso
                                    comenzará en cuanto explores tu primer
                                    módulo.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Button asChild className="rounded-full">
                                    <Link href={explore()} prefetch>
                                        Explorar AIVEN
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="rounded-full"
                                >
                                    <Link href={map()} prefetch>
                                        <MapPinned className="size-4" />
                                        Ver mapa tecnológico
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="w-full rounded-2xl border border-border/70 bg-background/75 p-4 backdrop-blur-sm lg:max-w-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        Progreso de bienvenida
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold">
                                        25%
                                    </p>
                                </div>
                                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <Award className="size-5" />
                                </span>
                            </div>
                            <div
                                className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
                                role="progressbar"
                                aria-label="Progreso de bienvenida"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={25}
                            >
                                <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" />
                            </div>
                            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                                Completa tu perfil y elige tus intereses para
                                recibir recomendaciones personales.
                            </p>
                        </div>
                    </div>
                </section>

                <section
                    aria-labelledby="quick-access-title"
                    className="space-y-3"
                >
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
                                Accesos rápidos
                            </p>
                            <h2
                                id="quick-access-title"
                                className="mt-1 text-xl font-semibold tracking-tight"
                            >
                                Todo listo para comenzar
                            </h2>
                        </div>
                        <Button
                            asChild
                            variant="ghost"
                            className="hidden sm:flex"
                        >
                            <Link href={explore()}>
                                Ver todo
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {quickAccessItems.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                prefetch
                                className="group rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <Card className="h-full gap-4 rounded-2xl py-5 transition-[transform,border-color,box-shadow] group-hover:-translate-y-0.5 group-hover:border-primary/25 group-hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none">
                                    <CardHeader className="gap-3 px-5">
                                        <span
                                            className={`flex size-10 items-center justify-center rounded-xl ${item.background} ${item.color}`}
                                        >
                                            <item.icon className="size-5" />
                                        </span>
                                        <CardTitle className="flex items-center justify-between gap-2 text-base">
                                            {item.title}
                                            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                                        </CardTitle>
                                        <CardDescription className="leading-relaxed">
                                            {item.description}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                    <Card className="gap-4 rounded-2xl py-5">
                        <CardHeader className="flex-row items-start justify-between gap-4 px-5 sm:px-6">
                            <div className="space-y-1.5">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Clock3 className="size-4 text-primary" />
                                    Continuar donde te quedaste
                                </CardTitle>
                                <CardDescription>
                                    Tus actividades recientes aparecerán aquí.
                                </CardDescription>
                            </div>
                            <Badge variant="outline">Nuevo</Badge>
                        </CardHeader>
                        <CardContent className="px-5 sm:px-6">
                            <EmptyState
                                icon={Compass}
                                title="Aún no tienes actividad reciente"
                                description="Explora un módulo y AIVEN recordará tu avance para que continúes desde cualquier dispositivo."
                                action={
                                    <Button
                                        asChild
                                        size="sm"
                                        variant="outline"
                                        className="rounded-full"
                                    >
                                        <Link href={explore()}>
                                            Elegir una experiencia
                                        </Link>
                                    </Button>
                                }
                            />
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                        <Card className="gap-4 rounded-2xl py-5">
                            <CardHeader className="px-5">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Heart className="size-4 text-rose-500" />
                                    Tus favoritos
                                </CardTitle>
                                <CardDescription>
                                    Guarda herramientas para encontrarlas al
                                    instante.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-5">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={tools()}>
                                        Descubrir herramientas
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="gap-4 rounded-2xl border-primary/15 bg-primary/[0.035] py-5">
                            <CardHeader className="px-5">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <MessagesSquare className="size-4 text-primary" />
                                    Comunidad AIVEN
                                </CardTitle>
                                <CardDescription>
                                    Muy pronto podrás compartir proyectos,
                                    preguntar y votar respuestas.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-5">
                                <Button asChild variant="secondary" size="sm">
                                    <Link href={community()}>
                                        Conocer la comunidad
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Inicio',
            href: dashboard(),
        },
    ],
};
