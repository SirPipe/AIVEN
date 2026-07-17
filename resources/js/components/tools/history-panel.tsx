import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { Clock3, History, RotateCcw, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { ToolHistoryEntry } from '@/types/tools';
import { ToolIcon } from './tool-icon';

type HistoryPanelProps = {
    entries: ToolHistoryEntry[];
    getToolHref: (
        entry: ToolHistoryEntry,
    ) => NonNullable<InertiaLinkProps['href']>;
    onDelete?: (entry: ToolHistoryEntry) => void;
    deletingId?: number | null;
    actionsDisabled?: boolean;
    emptyAction?: ReactNode;
    compact?: boolean;
    className?: string;
};

function formatHistoryDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Fecha no disponible';
    }

    return new Intl.DateTimeFormat('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}

export function HistoryPanel({
    entries,
    getToolHref,
    onDelete,
    deletingId = null,
    actionsDisabled = false,
    emptyAction,
    compact = false,
    className,
}: HistoryPanelProps) {
    if (entries.length === 0) {
        return (
            <EmptyState
                icon={History}
                title="Todavía no hay actividad"
                description="Cuando uses una herramienta, aquí aparecerá un resumen seguro para retomarla fácilmente."
                action={emptyAction}
                className={className}
            />
        );
    }

    return (
        <ol
            className={cn(
                'divide-y overflow-hidden rounded-2xl border bg-card',
                className,
            )}
        >
            {entries.map((entry) => {
                const isDeleting = deletingId === entry.id;

                return (
                    <li
                        key={entry.id}
                        className={cn(
                            'flex items-start gap-3 p-4 sm:items-center sm:px-5',
                            compact && 'p-3 sm:px-4',
                        )}
                    >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <ToolIcon
                                icon={entry.tool.icon}
                                className="size-5"
                            />
                        </span>
                        <div className="min-w-0 flex-1">
                            <Link
                                href={getToolHref(entry)}
                                prefetch
                                className="rounded-sm text-sm font-medium outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {entry.tool.name}
                            </Link>
                            <p
                                className={cn(
                                    'mt-1 text-xs leading-relaxed text-muted-foreground',
                                    compact ? 'line-clamp-1' : 'line-clamp-2',
                                )}
                            >
                                {entry.summary?.trim() ||
                                    'Uso registrado sin datos de configuración.'}
                            </p>
                            <time
                                dateTime={entry.createdAt}
                                className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground"
                            >
                                <Clock3
                                    className="size-3.5"
                                    aria-hidden="true"
                                />
                                {formatHistoryDate(entry.createdAt)}
                            </time>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            <Button
                                asChild
                                size="icon"
                                variant="ghost"
                                className="rounded-full text-muted-foreground hover:text-primary"
                            >
                                <Link
                                    href={getToolHref(entry)}
                                    aria-label={`Repetir configuración: ${entry.tool.name}`}
                                >
                                    <RotateCcw aria-hidden="true" />
                                </Link>
                            </Button>
                            {onDelete && (
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    disabled={actionsDisabled || isDeleting}
                                    className="rounded-full text-muted-foreground hover:text-destructive"
                                    aria-label={`Eliminar del historial: ${entry.tool.name}`}
                                    onClick={() => onDelete(entry)}
                                >
                                    {isDeleting ? (
                                        <Spinner className="motion-reduce:animate-none" />
                                    ) : (
                                        <Trash2 aria-hidden="true" />
                                    )}
                                </Button>
                            )}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
