import { Head, Link, usePage } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import {
    ArrowRight,
    Binary,
    BookOpen,
    Braces,
    Check,
    CircuitBoard,
    Code2,
    Compass,
    Cpu,
    Gamepad2,
    Globe2,
    Laptop,
    MapPinned,
    MessageSquareText,
    Network,
    Puzzle,
    Rocket,
    Search,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Terminal,
    WifiOff,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    community,
    dashboard,
    games,
    home,
    login,
    map,
    register,
    simulators,
    tools,
} from '@/routes';

const containerClass = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8';

type SectionHeadingProps = {
    eyebrow: string;
    title: string;
    description: string;
    align?: 'left' | 'center';
};

function SectionHeading({
    eyebrow,
    title,
    description,
    align = 'left',
}: SectionHeadingProps) {
    return (
        <div
            className={cn(
                'max-w-3xl',
                align === 'center' && 'mx-auto text-center',
            )}
        >
            <p className="text-sm font-semibold tracking-[0.16em] text-primary uppercase">
                {eyebrow}
            </p>
            <h2 className="mt-4 text-3xl leading-tight font-semibold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">
                {title}
            </h2>
            <p className="mt-5 text-base leading-7 text-pretty text-muted-foreground sm:text-lg">
                {description}
            </p>
        </div>
    );
}

type PreviewCardProps = {
    icon: LucideIcon;
    eyebrow: string;
    title: string;
    description: string;
    iconClassName: string;
    href: NonNullable<InertiaLinkProps['href']>;
    className?: string;
    children: ReactNode;
};

function PreviewCard({
    icon: Icon,
    eyebrow,
    title,
    description,
    iconClassName,
    href,
    className,
    children,
}: PreviewCardProps) {
    return (
        <article
            className={cn(
                'group relative flex min-h-80 flex-col overflow-hidden rounded-[1.75rem] border bg-card/90 p-5 shadow-sm shadow-brand-ink/5 transition-[transform,box-shadow,border-color] duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-xl motion-safe:hover:shadow-brand-violet/10 motion-reduce:transition-none sm:p-6',
                className,
            )}
        >
            <div className="flex items-start justify-between gap-4">
                <div
                    className={cn(
                        'flex size-11 items-center justify-center rounded-2xl',
                        iconClassName,
                    )}
                >
                    <Icon className="size-5" aria-hidden="true" />
                </div>
                <span className="rounded-full border bg-background/70 px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Vista previa
                </span>
            </div>
            <p className="mt-6 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                {eyebrow}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                {title}
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                {description}
            </p>
            <div className="mt-auto space-y-5 pt-7">
                <div>{children}</div>
                <Link
                    href={href}
                    prefetch
                    className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-primary transition-colors outline-none hover:text-primary/75 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 motion-reduce:transition-none"
                >
                    Ver adelanto
                    <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
            </div>
        </article>
    );
}

type TechnologyCardProps = {
    mark: string;
    name: string;
    description: string;
};

function TechnologyCard({ mark, name, description }: TechnologyCardProps) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border bg-card/70 p-4 transition-colors hover:border-primary/35 hover:bg-card motion-reduce:transition-none">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-violet/15 to-brand-cyan/20 font-mono text-sm font-bold text-primary">
                {mark}
            </div>
            <div className="min-w-0">
                <p className="font-semibold">{name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}

function PublicHeader({ isAuthenticated }: { isAuthenticated: boolean }) {
    return (
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
            <div
                className={cn(
                    containerClass,
                    'flex h-16 items-center justify-between gap-3',
                )}
            >
                <Link
                    href={home()}
                    prefetch
                    className="flex min-w-0 items-center rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                    aria-label="AIVEN, ir al inicio"
                >
                    <AppLogo />
                </Link>

                <nav
                    className="hidden items-center gap-1 lg:flex"
                    aria-label="Navegación principal"
                >
                    {[
                        ['Explorar', '#explorar'],
                        ['Instalar', '#instalar'],
                        ['Tecnologías', '#tecnologias'],
                    ].map(([label, href]) => (
                        <a
                            key={href}
                            href={href}
                            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
                        >
                            {label}
                        </a>
                    ))}
                </nav>

                <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    {isAuthenticated ? (
                        <Button asChild size="sm">
                            <Link href={dashboard()} prefetch>
                                Mi espacio
                                <ArrowRight aria-hidden="true" />
                            </Link>
                        </Button>
                    ) : (
                        <>
                            <Button
                                asChild
                                size="sm"
                                variant="ghost"
                                className="px-2 text-xs sm:px-3 sm:text-sm"
                            >
                                <Link href={login()} prefetch>
                                    Entrar
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="sm"
                                className="px-3 text-xs shadow-sm shadow-primary/20 sm:px-4 sm:text-sm"
                            >
                                <Link href={register()} prefetch>
                                    Crear cuenta
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

function HeroPreview() {
    return (
        <div
            className="relative mx-auto w-full max-w-xl lg:mr-0"
            role="img"
            aria-label="Vista conceptual del espacio personal de AIVEN con herramientas, laboratorios y retos"
        >
            <div
                aria-hidden="true"
                className="absolute -inset-12 -z-10 rounded-full bg-brand-violet/15 blur-3xl motion-safe:animate-[aiven-drift_9s_ease-in-out_infinite]"
            />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-card/85 p-3 shadow-2xl shadow-brand-violet/15 backdrop-blur sm:p-4 dark:border-white/10 dark:bg-card/75">
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.07)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_82%)] bg-[size:32px_32px]"
                />
                <div className="relative rounded-[1.45rem] border bg-background/90 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex gap-1.5" aria-hidden="true">
                            <span className="size-2.5 rounded-full bg-rose-400" />
                            <span className="size-2.5 rounded-full bg-amber-400" />
                            <span className="size-2.5 rounded-full bg-emerald-400" />
                        </div>
                        <div className="flex items-center gap-2 rounded-full border bg-card px-2.5 py-1 text-[0.65rem] font-semibold text-muted-foreground">
                            <span className="size-1.5 rounded-full bg-emerald-400" />
                            Espacio conectado
                        </div>
                    </div>

                    <div className="mt-5 flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm">
                        <Search
                            className="size-4 text-primary"
                            aria-hidden="true"
                        />
                        <span className="flex-1 text-sm text-muted-foreground">
                            Busca una herramienta o tema...
                        </span>
                        <kbd className="hidden rounded-md border bg-muted px-2 py-1 font-mono text-[0.6rem] text-muted-foreground sm:block">
                            Ctrl K
                        </kbd>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-gradient-to-br from-brand-violet to-primary p-4 text-white shadow-lg shadow-brand-violet/20">
                            <div className="flex items-center justify-between">
                                <span className="rounded-full bg-white/15 px-2 py-1 text-[0.6rem] font-semibold tracking-wider uppercase">
                                    Laboratorio
                                </span>
                                <CircuitBoard
                                    className="size-5 text-brand-cyan"
                                    aria-hidden="true"
                                />
                            </div>
                            <p className="mt-8 text-lg font-semibold">
                                Redes sin miedo
                            </p>
                            <p className="mt-1 text-xs leading-5 text-white/70">
                                Aprende conectando cada concepto.
                            </p>
                        </div>

                        <div className="grid gap-3">
                            <div className="flex items-center gap-3 rounded-2xl border bg-card p-3">
                                <div className="flex size-9 items-center justify-center rounded-xl bg-brand-cyan/15 text-cyan-700 dark:text-brand-cyan">
                                    <Binary
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold">
                                        Conversor binario
                                    </p>
                                    <p className="mt-0.5 font-mono text-[0.65rem] text-muted-foreground">
                                        101101 → 45
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-2xl border bg-card p-3">
                                <div className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
                                    <Gamepad2
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex justify-between gap-2 text-xs font-semibold">
                                        <span>Reto lógico</span>
                                        <span className="text-primary">
                                            72%
                                        </span>
                                    </div>
                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                                        <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-brand-violet to-brand-cyan" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-2xl border bg-card p-3">
                        <div className="flex -space-x-2" aria-hidden="true">
                            {['A', 'I', 'V'].map((letter, index) => (
                                <span
                                    key={letter}
                                    className={cn(
                                        'flex size-8 items-center justify-center rounded-full border-2 border-card text-[0.6rem] font-bold text-white',
                                        index === 0 && 'bg-brand-violet',
                                        index === 1 && 'bg-cyan-500',
                                        index === 2 && 'bg-slate-700',
                                    )}
                                >
                                    {letter}
                                </span>
                            ))}
                        </div>
                        <p className="text-right text-xs leading-5 text-muted-foreground">
                            Aprende a tu ritmo.
                            <br />
                            Comparte cuando quieras.
                        </p>
                    </div>
                </div>
            </div>

            <div className="absolute -top-5 -right-2 hidden items-center gap-2 rounded-2xl border bg-card/95 px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur motion-safe:animate-[aiven-float_6s_ease-in-out_infinite] sm:flex">
                <Sparkles
                    className="size-4 text-brand-cyan"
                    aria-hidden="true"
                />
                Todo en un lugar
            </div>
            <div className="absolute -bottom-5 -left-2 hidden items-center gap-2 rounded-2xl border bg-card/95 px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur motion-safe:animate-[aiven-float_7s_ease-in-out_infinite] motion-safe:[animation-delay:700ms] sm:flex">
                <ShieldCheck
                    className="size-4 text-emerald-500"
                    aria-hidden="true"
                />
                Tu progreso, protegido
            </div>
        </div>
    );
}

const platformTechnologies: TechnologyCardProps[] = [
    {
        mark: 'R',
        name: 'React',
        description: 'Interfaces reactivas y componibles.',
    },
    {
        mark: 'TS',
        name: 'TypeScript',
        description: 'Lógica segura de principio a fin.',
    },
    {
        mark: 'I',
        name: 'Inertia.js',
        description: 'Navegación fluida con alma de SPA.',
    },
    {
        mark: 'TW',
        name: 'Tailwind CSS',
        description: 'Un sistema visual flexible y consistente.',
    },
    {
        mark: 'UI',
        name: 'shadcn/ui',
        description: 'Componentes accesibles y reutilizables.',
    },
    {
        mark: 'V',
        name: 'Vite',
        description: 'Desarrollo y entrega a gran velocidad.',
    },
];

const languageTechnologies: TechnologyCardProps[] = [
    {
        mark: '<>',
        name: 'HTML5',
        description: 'Estructura semántica y accesible.',
    },
    {
        mark: '{}',
        name: 'CSS3',
        description: 'Estilos, adaptación y animaciones.',
    },
    {
        mark: 'TS',
        name: 'TypeScript',
        description: 'Toda la lógica del navegador.',
    },
];

const simulatorNodes: { position: string; icon: LucideIcon }[] = [
    { position: 'left-[9%] top-[40%]', icon: Cpu },
    { position: 'left-[36%] top-[10%]', icon: Network },
    { position: 'left-[64%] top-[59%]', icon: Globe2 },
    { position: 'right-[8%] top-[40%]', icon: Laptop },
];

const installedAppShortcuts: { icon: LucideIcon; label: string }[] = [
    { icon: Terminal, label: 'Herramientas' },
    { icon: BookOpen, label: 'Aprender' },
];

export default function Welcome() {
    const { auth } = usePage().props;
    const isAuthenticated = Boolean(auth.user);
    const primaryRoute = isAuthenticated ? dashboard() : register();

    return (
        <>
            <Head title="AIVEN · Tecnología para aprender y crear">
                <meta
                    name="description"
                    content="Herramientas, simuladores, juegos y una comunidad tecnológica en un mismo lugar."
                />
            </Head>

            <a
                href="#contenido-principal"
                className="fixed top-3 left-3 z-[100] -translate-y-20 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition-transform focus:translate-y-0 focus:outline-none motion-reduce:transition-none"
            >
                Saltar al contenido
            </a>

            <div className="min-h-screen overflow-hidden bg-background text-foreground">
                <PublicHeader isAuthenticated={isAuthenticated} />

                <main
                    id="contenido-principal"
                    tabIndex={-1}
                    className="focus:outline-none"
                >
                    <section className="relative isolate py-16 sm:py-24 lg:py-32">
                        <div
                            aria-hidden="true"
                            className="absolute top-0 left-1/2 -z-10 h-[38rem] w-[70rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-violet/14 via-brand-cyan/12 to-transparent blur-3xl"
                        />
                        <div
                            className={cn(
                                containerClass,
                                'grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12',
                            )}
                        >
                            <div className="max-w-3xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
                                    <span className="relative flex size-2">
                                        <span className="absolute inline-flex size-full rounded-full bg-brand-cyan opacity-70 motion-safe:animate-ping" />
                                        <span className="relative inline-flex size-2 rounded-full bg-brand-cyan" />
                                    </span>
                                    Un espacio tecnológico hecho para explorar
                                </div>

                                <h1 className="mt-7 text-4xl leading-[1.04] font-semibold tracking-[-0.05em] text-balance sm:text-6xl lg:text-7xl">
                                    Tecnología para
                                    <span className="block bg-gradient-to-r from-brand-violet via-primary to-cyan-500 bg-clip-text text-transparent">
                                        aprender haciendo.
                                    </span>
                                </h1>
                                <p className="mt-7 max-w-2xl text-lg leading-8 text-pretty text-muted-foreground sm:text-xl">
                                    Herramientas, simuladores, juegos y una
                                    comunidad tecnológica en un mismo lugar.
                                    Entra, prueba y convierte la curiosidad en
                                    conocimiento útil.
                                </p>

                                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="h-12 rounded-xl px-6 shadow-lg shadow-primary/20"
                                    >
                                        <Link href={primaryRoute} prefetch>
                                            {isAuthenticated
                                                ? 'Continuar en AIVEN'
                                                : 'Comenzar gratis'}
                                            <ArrowRight aria-hidden="true" />
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="outline"
                                        className="h-12 rounded-xl border-border/80 bg-card/70 px-6 backdrop-blur"
                                    >
                                        <a href="#explorar">
                                            Explorar la plataforma
                                            <Compass aria-hidden="true" />
                                        </a>
                                    </Button>
                                </div>

                                {!isAuthenticated && (
                                    <p className="mt-5 text-sm text-muted-foreground">
                                        ¿Ya tienes una cuenta?{' '}
                                        <Link
                                            href={login()}
                                            prefetch
                                            className="font-semibold text-foreground underline decoration-primary/35 underline-offset-4 transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
                                        >
                                            Inicia sesión
                                        </Link>
                                    </p>
                                )}

                                <div className="mt-10 flex flex-wrap gap-x-5 gap-y-3 text-xs font-medium text-muted-foreground">
                                    {[
                                        'Acceso público',
                                        'Progreso sincronizado',
                                        'Diseño para cualquier pantalla',
                                    ].map((benefit) => (
                                        <span
                                            key={benefit}
                                            className="inline-flex items-center gap-2"
                                        >
                                            <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                <Check
                                                    className="size-3"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                            {benefit}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <HeroPreview />
                        </div>
                    </section>

                    <section
                        id="explorar"
                        className="scroll-mt-24 py-20 sm:py-28"
                    >
                        <div className={containerClass}>
                            <SectionHeading
                                eyebrow="Explora AIVEN"
                                title="Un punto de partida para cada forma de aprender."
                                description="Cada módulo tendrá una misión clara: resolver algo, comprenderlo mejor o compartir lo aprendido. Estas experiencias crecerán contigo, sin saturar la interfaz."
                            />

                            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                                <PreviewCard
                                    icon={Puzzle}
                                    eyebrow="Herramientas"
                                    title="Resuelve lo cotidiano"
                                    description="Utilidades rápidas para calcular, convertir, diagnosticar y tomar mejores decisiones técnicas."
                                    iconClassName="bg-brand-cyan/15 text-cyan-700 dark:text-brand-cyan"
                                    href={tools()}
                                    className="md:col-span-2 lg:col-span-3"
                                >
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-2xl border bg-background/70 p-4">
                                            <div className="flex items-center gap-2 text-xs font-semibold">
                                                <Binary
                                                    className="size-4 text-primary"
                                                    aria-hidden="true"
                                                />
                                                Conversor de bases
                                            </div>
                                            <p className="mt-4 font-mono text-lg font-semibold">
                                                101101₂ = 45₁₀
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border bg-background/70 p-4">
                                            <div className="flex items-center gap-2 text-xs font-semibold">
                                                <Network
                                                    className="size-4 text-primary"
                                                    aria-hidden="true"
                                                />
                                                Calculadora de red
                                            </div>
                                            <p className="mt-4 font-mono text-lg font-semibold">
                                                /24 · 254 hosts
                                            </p>
                                        </div>
                                    </div>
                                </PreviewCard>

                                <PreviewCard
                                    icon={CircuitBoard}
                                    eyebrow="Simuladores"
                                    title="Experimenta sin miedo"
                                    description="Laboratorios visuales para aprender redes, electrónica y lógica antes de llevarlas al mundo real."
                                    iconClassName="bg-violet-500/10 text-violet-600 dark:text-violet-300"
                                    href={simulators()}
                                    className="md:col-span-2 lg:col-span-3"
                                >
                                    <div
                                        className="relative h-28 overflow-hidden rounded-2xl border bg-background/70"
                                        aria-hidden="true"
                                    >
                                        <svg
                                            className="absolute inset-0 size-full text-primary/25"
                                            viewBox="0 0 420 112"
                                            fill="none"
                                            preserveAspectRatio="none"
                                        >
                                            <path
                                                d="M54 58C112 58 103 25 166 25s48 62 112 62 59-29 96-29"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeDasharray="5 6"
                                            />
                                        </svg>
                                        {simulatorNodes.map(
                                            ({ position, icon: NodeIcon }) => (
                                                <span
                                                    key={position}
                                                    className={cn(
                                                        'absolute flex size-10 items-center justify-center rounded-xl border bg-card text-primary shadow-sm',
                                                        position,
                                                    )}
                                                >
                                                    <NodeIcon className="size-4" />
                                                </span>
                                            ),
                                        )}
                                    </div>
                                </PreviewCard>

                                <PreviewCard
                                    icon={Gamepad2}
                                    eyebrow="Juegos"
                                    title="Pon a prueba tu lógica"
                                    description="Retos breves, progreso visible y nuevas formas de practicar."
                                    iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-300"
                                    href={games()}
                                    className="lg:col-span-2"
                                >
                                    <div className="rounded-2xl border bg-background/70 p-4">
                                        <div className="flex items-center justify-between text-xs font-semibold">
                                            <span>Secuencia binaria</span>
                                            <span className="text-primary">
                                                Nivel 04
                                            </span>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            {['1', '0', '1', '?'].map(
                                                (digit, index) => (
                                                    <span
                                                        key={index}
                                                        className={cn(
                                                            'flex aspect-square flex-1 items-center justify-center rounded-xl border font-mono font-bold',
                                                            digit === '?'
                                                                ? 'border-primary/40 bg-primary/10 text-primary'
                                                                : 'bg-card',
                                                        )}
                                                    >
                                                        {digit}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </PreviewCard>

                                <PreviewCard
                                    icon={MessageSquareText}
                                    eyebrow="Publicaciones"
                                    title="Aprende en comunidad"
                                    description="Historias, guías y preguntas explicadas por personas curiosas como tú."
                                    iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                                    href={community()}
                                    className="lg:col-span-2"
                                >
                                    <div className="space-y-2">
                                        {[
                                            [
                                                'Guía',
                                                'Tu primera red doméstica, paso a paso',
                                            ],
                                            [
                                                'Comunidad',
                                                '¿Qué proyecto estás construyendo?',
                                            ],
                                        ].map(([kind, title]) => (
                                            <div
                                                key={title}
                                                className="rounded-2xl border bg-background/70 p-3.5"
                                            >
                                                <p className="text-[0.6rem] font-semibold tracking-wider text-primary uppercase">
                                                    {kind}
                                                </p>
                                                <p className="mt-1.5 text-xs leading-5 font-semibold">
                                                    {title}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </PreviewCard>

                                <PreviewCard
                                    icon={MapPinned}
                                    eyebrow="Mapa tecnológico"
                                    title="Encuentra tecnología cerca"
                                    description="Descubre espacios, comunidades y puntos de interés tecnológico."
                                    iconClassName="bg-rose-500/10 text-rose-600 dark:text-rose-300"
                                    href={map()}
                                    className="md:col-span-2 lg:col-span-2"
                                >
                                    <div
                                        className="relative h-36 overflow-hidden rounded-2xl border bg-[linear-gradient(to_right,rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.08)_1px,transparent_1px)] bg-[size:24px_24px]"
                                        aria-hidden="true"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/10 via-transparent to-brand-violet/10" />
                                        <span className="absolute top-[30%] left-[28%] flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                                            <MapPinned className="size-4" />
                                        </span>
                                        <span className="absolute right-[20%] bottom-[18%] flex size-7 items-center justify-center rounded-full bg-brand-cyan text-brand-ink shadow-lg">
                                            <Cpu className="size-3.5" />
                                        </span>
                                    </div>
                                </PreviewCard>
                            </div>
                        </div>
                    </section>

                    <section
                        id="instalar"
                        className="scroll-mt-24 py-20 sm:py-28"
                    >
                        <div className={containerClass}>
                            <div className="relative overflow-hidden rounded-[2rem] border bg-brand-ink px-5 py-10 text-white shadow-2xl shadow-brand-violet/15 sm:px-10 sm:py-14 lg:px-16">
                                <div
                                    aria-hidden="true"
                                    className="absolute -top-40 -right-24 size-96 rounded-full bg-brand-violet/35 blur-3xl"
                                />
                                <div
                                    aria-hidden="true"
                                    className="absolute -bottom-40 -left-24 size-96 rounded-full bg-brand-cyan/20 blur-3xl"
                                />
                                <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
                                    <div>
                                        <p className="text-sm font-semibold tracking-[0.16em] text-brand-cyan uppercase">
                                            AIVEN en cualquier lugar
                                        </p>
                                        <h2 className="mt-4 max-w-2xl text-3xl leading-tight font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
                                            Una experiencia web que se siente
                                            como una app.
                                        </h2>
                                        <p className="mt-5 max-w-xl text-base leading-7 text-pretty text-slate-300 sm:text-lg">
                                            Instala AIVEN en tu dispositivo,
                                            entra a pantalla completa y conserva
                                            recursos esenciales para seguir
                                            explorando incluso cuando la
                                            conexión falle.
                                        </p>

                                        <div className="mt-8 grid gap-4 sm:grid-cols-3">
                                            {[
                                                {
                                                    icon: Smartphone,
                                                    title: 'Instalable',
                                                    text: 'Un acceso directo en tu pantalla.',
                                                },
                                                {
                                                    icon: WifiOff,
                                                    title: 'Preparada offline',
                                                    text: 'Recursos esenciales siempre disponibles.',
                                                },
                                                {
                                                    icon: ShieldCheck,
                                                    title: 'Caché segura',
                                                    text: 'Sin exponer información privada.',
                                                },
                                            ].map(
                                                ({
                                                    icon: BenefitIcon,
                                                    title,
                                                    text,
                                                }) => (
                                                    <div
                                                        key={title}
                                                        className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                                                    >
                                                        <BenefitIcon
                                                            className="size-5 text-brand-cyan"
                                                            aria-hidden="true"
                                                        />
                                                        <p className="mt-3 text-sm font-semibold">
                                                            {title}
                                                        </p>
                                                        <p className="mt-1 text-xs leading-5 text-slate-400">
                                                            {text}
                                                        </p>
                                                    </div>
                                                ),
                                            )}
                                        </div>

                                        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-300">
                                            <p className="font-semibold text-white">
                                                Cómo instalarla
                                            </p>
                                            <p className="mt-1">
                                                Usa “Instalar AIVEN” cuando
                                                aparezca el aviso. En iPhone,
                                                abre Compartir y elige “Agregar
                                                a pantalla de inicio”; en
                                                Android o computadora, busca
                                                “Instalar aplicación” en el menú
                                                del navegador.
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className="mx-auto w-full max-w-sm"
                                        role="img"
                                        aria-label="Vista conceptual de AIVEN instalada en un teléfono"
                                    >
                                        <div className="relative rounded-[2.5rem] border border-white/15 bg-slate-950 p-2 shadow-2xl">
                                            <div className="overflow-hidden rounded-[2rem] bg-slate-900">
                                                <div className="mx-auto mt-2 h-5 w-24 rounded-full bg-black" />
                                                <div className="p-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-violet to-brand-cyan">
                                                            <AppLogoIcon className="size-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold tracking-[0.16em]">
                                                                AIVEN
                                                            </p>
                                                            <p className="text-[0.65rem] text-slate-400">
                                                                Listo para
                                                                explorar
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-7 rounded-3xl bg-gradient-to-br from-brand-violet to-indigo-700 p-5">
                                                        <Rocket
                                                            className="size-6 text-brand-cyan"
                                                            aria-hidden="true"
                                                        />
                                                        <p className="mt-8 text-lg font-semibold">
                                                            Continúa donde lo
                                                            dejaste
                                                        </p>
                                                        <p className="mt-1 text-xs leading-5 text-white/65">
                                                            Tus accesos y
                                                            avances, a un toque.
                                                        </p>
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                                        {installedAppShortcuts.map(
                                                            ({
                                                                icon: ItemIcon,
                                                                label,
                                                            }) => (
                                                                <div
                                                                    key={label}
                                                                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                                                                >
                                                                    <ItemIcon className="size-4 text-brand-cyan" />
                                                                    <p className="mt-4 text-xs font-semibold">
                                                                        {label}
                                                                    </p>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section
                        id="tecnologias"
                        className="scroll-mt-24 py-20 sm:py-28"
                    >
                        <div className={containerClass}>
                            <SectionHeading
                                eyebrow="Construida con tecnología moderna"
                                title="Una base veloz, mantenible y preparada para crecer."
                                description="AIVEN combina herramientas modernas del ecosistema web con estándares abiertos. Cada decisión técnica busca una experiencia estable, accesible y agradable."
                                align="center"
                            />

                            <div className="mt-14 grid gap-8 lg:grid-cols-[1.45fr_0.75fr]">
                                <div className="rounded-[1.75rem] border bg-card/60 p-5 sm:p-7">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <Braces
                                                className="size-5"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold">
                                                Plataforma
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                La arquitectura detrás de la
                                                experiencia.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                        {platformTechnologies.map(
                                            (technology) => (
                                                <TechnologyCard
                                                    key={technology.name}
                                                    {...technology}
                                                />
                                            ),
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-[1.75rem] border bg-card/60 p-5 sm:p-7">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-brand-cyan/15 text-cyan-700 dark:text-brand-cyan">
                                            <Code2
                                                className="size-5"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold">
                                                Lenguajes
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Estándares abiertos para la web.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-6 grid gap-3">
                                        {languageTechnologies.map(
                                            (technology) => (
                                                <TechnologyCard
                                                    key={technology.name}
                                                    {...technology}
                                                />
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="py-20 sm:py-28">
                        <div className={containerClass}>
                            <div className="relative overflow-hidden rounded-[2rem] border bg-gradient-to-br from-primary via-brand-violet to-indigo-700 px-5 py-12 text-center text-white shadow-2xl shadow-primary/20 sm:px-10 sm:py-16">
                                <div
                                    aria-hidden="true"
                                    className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.32),transparent_35%)]"
                                />
                                <div className="relative mx-auto max-w-3xl">
                                    <Sparkles
                                        className="mx-auto size-7 text-brand-cyan"
                                        aria-hidden="true"
                                    />
                                    <h2 className="mt-5 text-3xl leading-tight font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
                                        Tu próxima idea puede empezar aquí.
                                    </h2>
                                    <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-pretty text-white/75 sm:text-lg">
                                        Explora como invitado o crea tu cuenta
                                        para guardar avances, personalizar tu
                                        experiencia y crecer con la comunidad.
                                    </p>
                                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="h-12 rounded-xl bg-white px-6 text-brand-ink hover:bg-white/90"
                                        >
                                            <Link href={primaryRoute} prefetch>
                                                {isAuthenticated
                                                    ? 'Ir a mi espacio'
                                                    : 'Crear mi cuenta'}
                                                <ArrowRight aria-hidden="true" />
                                            </Link>
                                        </Button>
                                        {!isAuthenticated && (
                                            <Button
                                                asChild
                                                size="lg"
                                                variant="outline"
                                                className="h-12 rounded-xl border-white/25 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"
                                            >
                                                <Link href={login()} prefetch>
                                                    Iniciar sesión
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t bg-card/35">
                    <div
                        className={cn(
                            containerClass,
                            'flex flex-col gap-8 py-10 sm:flex-row sm:items-center sm:justify-between',
                        )}
                    >
                        <div>
                            <Link
                                href={home()}
                                prefetch
                                className="inline-flex items-center rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                aria-label="AIVEN, volver al inicio"
                            >
                                <AppLogo />
                            </Link>
                            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                                Tecnología clara, útil y abierta a la
                                curiosidad.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-muted-foreground">
                            <a
                                href="#explorar"
                                className="transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
                            >
                                Explorar
                            </a>
                            <a
                                href="#instalar"
                                className="transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
                            >
                                Instalar
                            </a>
                            <a
                                href="#tecnologias"
                                className="transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
                            >
                                Tecnologías
                            </a>
                            {!isAuthenticated && (
                                <Link
                                    href={register()}
                                    prefetch
                                    className="transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
                                >
                                    Crear cuenta
                                </Link>
                            )}
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
