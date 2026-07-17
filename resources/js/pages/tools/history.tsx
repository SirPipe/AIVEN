import { Head, Link, useHttp } from '@inertiajs/react';
import { Clock3, ShieldCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { HistoryPanel } from '@/components/tools/history-panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import toolRoutes from '@/routes/tools';
import type {
    LaravelPaginationLink,
    ToolHistoryEntry,
    ToolHistoryPageProps,
} from '@/types/tools';

function paginationLabel(label: string): string {
    if (label.includes('Previous') || label.includes('Anterior')) {
        return 'Anterior';
    }

    if (label.includes('Next') || label.includes('Siguiente')) {
        return 'Siguiente';
    }

    return label.replace(/&laquo;|&raquo;/g, '').trim();
}

export default function ToolHistory({
    history,
    historyEnabled,
}: ToolHistoryPageProps) {
    const sourceEntries = Array.isArray(history) ? history : history.data;
    const paginationLinks = Array.isArray(history) ? [] : history.links;
    const historyRequest = useHttp<
        Record<string, boolean>,
        { historyEnabled?: boolean }
    >({});
    const [entries, setEntries] = useState(sourceEntries);
    const [isEnabled, setIsEnabled] = useState(historyEnabled);
    const [isUpdatingPreference, setIsUpdatingPreference] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isClearing, setIsClearing] = useState(false);
    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const [requestError, setRequestError] = useState<string | null>(null);

    const updateHistoryPreference = (enabled: boolean) => {
        const previousValue = isEnabled;

        setIsEnabled(enabled);
        setIsUpdatingPreference(true);
        setRequestError(null);
        historyRequest.setData({ history_enabled: enabled });

        void historyRequest
            .patch(toolRoutes.history.preference.url(), {
                onSuccess: (response) =>
                    setIsEnabled(response.historyEnabled ?? enabled),
                onError: () => {
                    setIsEnabled(previousValue);
                    setRequestError('No pudimos actualizar tu preferencia.');
                },
                onHttpException: () => {
                    setIsEnabled(previousValue);
                    setRequestError('No pudimos actualizar tu preferencia.');

                    return true;
                },
                onNetworkError: () => {
                    setIsEnabled(previousValue);
                    setRequestError('Revisa tu conexión e inténtalo de nuevo.');

                    return true;
                },
                onFinish: () => {
                    setIsUpdatingPreference(false);
                    historyRequest.setData({});
                },
            })
            .catch(() => undefined);
    };

    const deleteEntry = (entry: ToolHistoryEntry) => {
        setDeletingId(entry.id);
        setRequestError(null);
        historyRequest.setData({});

        void historyRequest
            .delete(toolRoutes.history.destroy.url(entry.id), {
                onSuccess: () =>
                    setEntries((current) =>
                        current.filter((item) => item.id !== entry.id),
                    ),
                onError: () =>
                    setRequestError('No pudimos eliminar ese registro.'),
                onHttpException: () => {
                    setRequestError('No pudimos eliminar ese registro.');

                    return true;
                },
                onNetworkError: () => {
                    setRequestError('Revisa tu conexión e inténtalo de nuevo.');

                    return true;
                },
                onFinish: () => setDeletingId(null),
            })
            .catch(() => undefined);
    };

    const clearHistory = () => {
        setIsClearing(true);
        setRequestError(null);
        historyRequest.setData({});

        void historyRequest
            .delete(toolRoutes.history.clear.url(), {
                onSuccess: () => {
                    setEntries([]);
                    setClearDialogOpen(false);
                },
                onError: () =>
                    setRequestError('No pudimos eliminar el historial.'),
                onHttpException: () => {
                    setRequestError('No pudimos eliminar el historial.');

                    return true;
                },
                onNetworkError: () => {
                    setRequestError('Revisa tu conexión e inténtalo de nuevo.');

                    return true;
                },
                onFinish: () => setIsClearing(false),
            })
            .catch(() => undefined);
    };

    return (
        <>
            <Head title="Historial de herramientas" />

            <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
                <header className="relative isolate overflow-hidden rounded-[1.75rem] border border-primary/15 bg-card px-5 py-8 shadow-sm sm:px-8">
                    <div className="pointer-events-none absolute -top-24 -right-12 -z-10 size-64 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-400/10" />
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                        <div className="max-w-2xl space-y-3">
                            <Badge variant="secondary" className="rounded-full">
                                <Clock3 aria-hidden="true" />
                                Actividad privada
                            </Badge>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                                    Historial de herramientas
                                </h1>
                                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                                    Retoma tus usos recientes. AIVEN conserva
                                    sólo un resumen seguro, nunca entradas
                                    sensibles ni resultados completos.
                                </p>
                            </div>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            className="w-fit rounded-full"
                        >
                            <Link href={toolRoutes.index()}>
                                Explorar herramientas
                            </Link>
                        </Button>
                    </div>
                </header>

                <section
                    aria-labelledby="history-preference-title"
                    className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center"
                >
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck
                                className="size-5"
                                aria-hidden="true"
                            />
                        </span>
                        <div>
                            <h2
                                id="history-preference-title"
                                className="text-sm font-semibold"
                            >
                                Guardar historial seguro
                            </h2>
                            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                                Puedes desactivarlo en cualquier momento. El
                                cambio afecta los próximos usos; tus registros
                                actuales seguirán disponibles hasta que los
                                elimines.
                            </p>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 rounded-xl border bg-muted/25 px-3 py-2.5">
                        {isUpdatingPreference && (
                            <Spinner className="motion-reduce:animate-none" />
                        )}
                        <Checkbox
                            id="history-enabled"
                            checked={isEnabled}
                            disabled={historyRequest.processing}
                            aria-describedby="history-preference-title"
                            onCheckedChange={(checked) =>
                                updateHistoryPreference(checked === true)
                            }
                        />
                        <Label htmlFor="history-enabled">
                            {isEnabled ? 'Activado' : 'Desactivado'}
                        </Label>
                    </div>
                </section>

                <section
                    aria-labelledby="history-list-title"
                    className="space-y-4"
                >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                                Tus últimos usos
                            </p>
                            <h2
                                id="history-list-title"
                                className="mt-1 text-xl font-semibold tracking-tight"
                            >
                                Actividad guardada
                            </h2>
                        </div>

                        {entries.length > 0 && (
                            <Dialog
                                open={clearDialogOpen}
                                onOpenChange={setClearDialogOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={historyRequest.processing}
                                        className="w-fit rounded-full text-destructive hover:text-destructive"
                                    >
                                        <Trash2 aria-hidden="true" />
                                        Eliminar todo
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="motion-reduce:animate-none">
                                    <DialogHeader>
                                        <DialogTitle>
                                            ¿Eliminar todo el historial?
                                        </DialogTitle>
                                        <DialogDescription>
                                            Esta acción borra tus registros de
                                            herramientas y no se puede deshacer.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={isClearing}
                                            onClick={() =>
                                                setClearDialogOpen(false)
                                            }
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            disabled={isClearing}
                                            onClick={clearHistory}
                                        >
                                            {isClearing && (
                                                <Spinner className="motion-reduce:animate-none" />
                                            )}
                                            Eliminar historial
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    {requestError && (
                        <p
                            role="alert"
                            className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                        >
                            {requestError}
                        </p>
                    )}

                    <HistoryPanel
                        entries={entries}
                        deletingId={deletingId}
                        actionsDisabled={historyRequest.processing}
                        onDelete={deleteEntry}
                        getToolHref={(entry) =>
                            toolRoutes.show(entry.tool.slug, {
                                query: { historial: entry.id },
                            })
                        }
                        emptyAction={
                            <Button asChild size="sm" className="rounded-full">
                                <Link href={toolRoutes.index()}>
                                    Elegir una herramienta
                                </Link>
                            </Button>
                        }
                    />

                    {paginationLinks.length > 3 && (
                        <Pagination links={paginationLinks} />
                    )}
                </section>
            </div>
        </>
    );
}

function Pagination({ links }: { links: LaravelPaginationLink[] }) {
    return (
        <nav aria-label="Páginas del historial">
            <ul className="flex flex-wrap justify-center gap-1.5">
                {links.map((link, index) => (
                    <li key={`${link.label}-${index}`}>
                        {link.url ? (
                            <Link
                                href={link.url}
                                preserveScroll
                                aria-current={link.active ? 'page' : undefined}
                                className={cn(
                                    'inline-flex min-w-9 items-center justify-center rounded-lg border px-3 py-2 text-sm outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
                                    link.active &&
                                        'border-primary bg-primary text-primary-foreground',
                                )}
                            >
                                {paginationLabel(link.label)}
                            </Link>
                        ) : (
                            <span className="inline-flex min-w-9 items-center justify-center rounded-lg border px-3 py-2 text-sm text-muted-foreground opacity-50">
                                {paginationLabel(link.label)}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
}

ToolHistory.layout = {
    breadcrumbs: [
        {
            title: 'Herramientas',
            href: toolRoutes.index(),
        },
        {
            title: 'Historial',
            href: toolRoutes.history.index(),
        },
    ],
};
