import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Boxes,
    CheckCircle2,
    Construction,
    Gamepad2,
    MapPinned,
    MessagesSquare,
    Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard, explore, register } from '@/routes';

type ModuleKey = 'simulators' | 'games' | 'community' | 'map';

type ModulePreview = {
    key: ModuleKey;
    eyebrow: string;
    title: string;
    description: string;
    highlights: string[];
    previews: Array<{
        title: string;
        description: string;
    }>;
};

const moduleIcons: Record<ModuleKey, LucideIcon> = {
    simulators: Boxes,
    games: Gamepad2,
    community: MessagesSquare,
    map: MapPinned,
};

const moduleStyles: Record<
    ModuleKey,
    { icon: string; glow: string; surface: string }
> = {
    simulators: {
        icon: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
        glow: 'bg-violet-500/20',
        surface: 'border-violet-500/20 bg-violet-500/[0.035]',
    },
    games: {
        icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        glow: 'bg-amber-400/20',
        surface: 'border-amber-500/20 bg-amber-500/[0.035]',
    },
    community: {
        icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        glow: 'bg-emerald-400/20',
        surface: 'border-emerald-500/20 bg-emerald-500/[0.035]',
    },
    map: {
        icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        glow: 'bg-rose-400/20',
        surface: 'border-rose-500/20 bg-rose-500/[0.035]',
    },
};

export default function ModuleShow({ module }: { module: ModulePreview }) {
    const { auth } = usePage().props;
    const Icon = moduleIcons[module.key];
    const styles = moduleStyles[module.key];

    return (
        <>
            <Head title={module.title} />
            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
                <Button
                    asChild
                    variant="ghost"
                    className="w-fit rounded-full text-muted-foreground"
                >
                    <Link href={explore()}>
                        <ArrowLeft className="size-4" />
                        Volver a Explorar
                    </Link>
                </Button>

                <section
                    className={`relative isolate overflow-hidden rounded-[1.75rem] border px-5 py-9 sm:px-9 sm:py-12 ${styles.surface}`}
                >
                    <div
                        className={`pointer-events-none absolute -top-28 -right-16 -z-10 size-80 rounded-full blur-3xl ${styles.glow}`}
                    />
                    <div className="max-w-3xl space-y-5">
                        <div className="flex flex-wrap items-center gap-3">
                            <span
                                className={`flex size-12 items-center justify-center rounded-2xl ${styles.icon}`}
                            >
                                <Icon className="size-6" />
                            </span>
                            <Badge variant="outline" className="rounded-full">
                                <Construction className="size-3.5" />
                                En preparación
                            </Badge>
                        </div>
                        <div className="space-y-3">
                            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                                {module.eyebrow}
                            </p>
                            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
                                {module.title}
                            </h1>
                            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                                {module.description}
                            </p>
                        </div>
                    </div>
                </section>

                <div className="grid gap-5 lg:grid-cols-[1.35fr_0.8fr]">
                    <section
                        aria-labelledby="preview-title"
                        className="space-y-3"
                    >
                        <div>
                            <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
                                Vista previa
                            </p>
                            <h2
                                id="preview-title"
                                className="mt-1 text-xl font-semibold tracking-tight"
                            >
                                Lo que estamos preparando
                            </h2>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {module.previews.map((preview, index) => (
                                <Card
                                    key={preview.title}
                                    className="gap-3 rounded-2xl py-5"
                                >
                                    <CardHeader className="gap-3 px-5">
                                        <span className="text-xs font-semibold text-primary">
                                            0{index + 1}
                                        </span>
                                        <CardTitle className="text-base">
                                            {preview.title}
                                        </CardTitle>
                                        <CardDescription className="leading-relaxed">
                                            {preview.description}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </section>

                    <aside className="space-y-4">
                        <Card className="gap-4 rounded-2xl py-5">
                            <CardHeader className="px-5">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Sparkles className="size-4 text-primary" />
                                    Diseñado para ti
                                </CardTitle>
                                <CardDescription>
                                    La primera versión priorizará estas
                                    capacidades.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-3 px-5">
                                {module.highlights.map((highlight) => (
                                    <div
                                        key={highlight}
                                        className="flex items-start gap-2.5 text-sm"
                                    >
                                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                        <span>{highlight}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="gap-3 rounded-2xl border-primary/15 bg-primary/[0.035] py-5">
                            <CardHeader className="px-5">
                                <CardTitle className="text-base">
                                    La calidad va primero
                                </CardTitle>
                                <CardDescription className="leading-relaxed">
                                    Este módulo se habilitará cuando sea
                                    funcional, accesible, responsive y esté
                                    correctamente probado.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-5">
                                <Button
                                    asChild
                                    size="sm"
                                    className="rounded-full"
                                >
                                    <Link
                                        href={
                                            auth.user ? dashboard() : register()
                                        }
                                    >
                                        {auth.user
                                            ? 'Volver a mi inicio'
                                            : 'Crear mi cuenta'}
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </div>
        </>
    );
}

ModuleShow.layout = {
    breadcrumbs: [
        {
            title: 'Explorar',
            href: explore(),
        },
        {
            title: 'Módulo',
            href: explore(),
        },
    ],
};
