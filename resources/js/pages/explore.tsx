import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Boxes,
    Gamepad2,
    MapPinned,
    MessagesSquare,
    Sparkles,
    Wrench,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { community, explore, games, map, simulators, tools } from '@/routes';

const modules = [
    {
        title: 'Herramientas',
        description:
            'Utilidades rápidas para calcular, convertir, diagnosticar y organizar tareas tecnológicas.',
        href: tools(),
        icon: Wrench,
        color: 'text-cyan-600 dark:text-cyan-400',
        background: 'bg-cyan-500/10',
    },
    {
        title: 'Simuladores',
        description:
            'Entornos interactivos para aprender redes, hardware, electrónica y programación.',
        href: simulators(),
        icon: Boxes,
        color: 'text-violet-600 dark:text-violet-400',
        background: 'bg-violet-500/10',
    },
    {
        title: 'Juegos',
        description:
            'Retos breves que convierten conceptos técnicos en experiencias memorables.',
        href: games(),
        icon: Gamepad2,
        color: 'text-amber-600 dark:text-amber-400',
        background: 'bg-amber-500/10',
    },
    {
        title: 'Comunidad',
        description:
            'Preguntas, respuestas, publicaciones y proyectos creados entre personas curiosas.',
        href: community(),
        icon: MessagesSquare,
        color: 'text-emerald-600 dark:text-emerald-400',
        background: 'bg-emerald-500/10',
    },
    {
        title: 'Mapa tecnológico',
        description:
            'Descubre espacios, talleres, comunidades y oportunidades tecnológicas cercanas.',
        href: map(),
        icon: MapPinned,
        color: 'text-rose-600 dark:text-rose-400',
        background: 'bg-rose-500/10',
    },
];

export default function Explore() {
    return (
        <>
            <Head title="Explorar" />
            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8">
                <header className="relative overflow-hidden rounded-[1.75rem] border border-primary/15 bg-card px-5 py-8 sm:px-8 sm:py-10">
                    <div className="pointer-events-none absolute -top-20 right-0 size-64 rounded-full bg-primary/10 blur-3xl" />
                    <div className="relative max-w-3xl space-y-4">
                        <Badge className="rounded-full" variant="secondary">
                            <Sparkles className="size-3.5" />
                            Universo AIVEN
                        </Badge>
                        <h1 className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl">
                            Un lugar para explorar la tecnología haciendo.
                        </h1>
                        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                            La base ya está lista. Cada módulo se publicará de
                            forma gradual, después de ser funcional, probado y
                            pulido.
                        </p>
                    </div>
                </header>

                <section aria-labelledby="modules-title" className="space-y-4">
                    <div>
                        <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
                            Próximas experiencias
                        </p>
                        <h2
                            id="modules-title"
                            className="mt-1 text-2xl font-semibold tracking-tight"
                        >
                            Elige un área
                        </h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {modules.map((module) => (
                            <Link
                                key={module.title}
                                href={module.href}
                                prefetch
                                className="group rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <Card className="h-full min-h-64 justify-between rounded-2xl py-5 transition-[transform,border-color,box-shadow] group-hover:-translate-y-1 group-hover:border-primary/25 group-hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none">
                                    <CardHeader className="gap-5 px-5 sm:px-6">
                                        <div className="flex items-start justify-between gap-3">
                                            <span
                                                className={`flex size-11 items-center justify-center rounded-2xl ${module.background} ${module.color}`}
                                            >
                                                <module.icon className="size-5" />
                                            </span>
                                            <Badge variant="outline">
                                                En preparación
                                            </Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <CardTitle className="text-lg">
                                                {module.title}
                                            </CardTitle>
                                            <CardDescription className="leading-relaxed">
                                                {module.description}
                                            </CardDescription>
                                        </div>
                                        <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                                            Ver adelanto
                                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
                                        </span>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}

                        <Card className="min-h-64 justify-center rounded-2xl border-dashed bg-muted/20 py-5">
                            <CardHeader className="items-center px-6 text-center">
                                <span className="text-sm font-semibold text-primary">
                                    +{Math.max(0, 12 - modules.length)} ideas en
                                    ruta
                                </span>
                                <CardTitle className="text-lg">
                                    AIVEN seguirá creciendo
                                </CardTitle>
                                <CardDescription className="max-w-xs leading-relaxed">
                                    Nuevas experiencias llegarán únicamente
                                    cuando la base actual esté lista para
                                    sostenerlas.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </section>
            </div>
        </>
    );
}

Explore.layout = {
    breadcrumbs: [
        {
            title: 'Explorar',
            href: explore(),
        },
    ],
};
