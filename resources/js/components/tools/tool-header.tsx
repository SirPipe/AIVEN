import { Link } from '@inertiajs/react';
import { ArrowLeft, CircleHelp, WifiOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { index as tools } from '@/routes/tools';
import type { ToolSummary } from '@/types/tools';

type AivenToolHeaderProps = {
    favoriteAction?: ReactNode;
    helpAction?: ReactNode;
    icon: ReactNode;
    offlineShell?: boolean;
    tool: ToolSummary;
};

export function AivenToolHeader({
    favoriteAction,
    helpAction,
    icon,
    offlineShell = false,
    tool,
}: AivenToolHeaderProps) {
    return (
        <header className="relative isolate overflow-hidden rounded-[1.75rem] border border-primary/15 bg-card px-5 py-6 shadow-sm sm:px-8 sm:py-8">
            <div className="pointer-events-none absolute -top-24 -right-16 -z-10 size-72 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-400/10" />
            <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="-ml-2 rounded-full text-muted-foreground"
                    >
                        <Link href={tools()}>
                            <ArrowLeft aria-hidden="true" />
                            Todas las herramientas
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        {favoriteAction}
                        {helpAction ?? (
                            <Button
                                asChild
                                type="button"
                                variant="outline"
                                size="icon"
                                className="rounded-full"
                            >
                                <a href="#ayuda">
                                    <CircleHelp aria-hidden="true" />
                                    <span className="sr-only">
                                        Ir a la ayuda de {tool.name}
                                    </span>
                                </a>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/15 to-indigo-500/15 text-primary ring-1 ring-primary/15">
                        {icon}
                    </span>
                    <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">
                                {tool.category.name}
                            </Badge>
                            {tool.isOfflineCapable && (
                                <Badge variant="outline">
                                    <WifiOff aria-hidden="true" />
                                    Funciona sin conexión
                                </Badge>
                            )}
                            {tool.isNew && <Badge>Nueva</Badge>}
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">
                                {tool.name}
                            </h1>
                            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                                {tool.fullDescription || tool.shortDescription}
                            </p>
                        </div>
                    </div>
                </div>

                {offlineShell && (
                    <div
                        className="flex items-start gap-3 rounded-2xl border border-cyan-500/25 bg-cyan-500/8 p-4 text-sm"
                        role="status"
                    >
                        <WifiOff className="mt-0.5 size-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
                        <p className="leading-relaxed">
                            Estás usando la copia sin conexión. El procesamiento
                            local sigue disponible; favoritos e historial se
                            sincronizarán cuando vuelvas a tener internet.
                        </p>
                    </div>
                )}
            </div>
        </header>
    );
}
