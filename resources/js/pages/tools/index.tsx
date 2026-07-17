import { Head, Link, router, useHttp, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Clock3,
    Heart,
    History,
    Layers3,
    SearchX,
    Sparkles,
    TrendingUp,
    Wrench,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AivenToolCard } from '@/components/tools/aiven-tool-card';
import { CategoryChips } from '@/components/tools/category-chips';
import { HistoryPanel } from '@/components/tools/history-panel';
import { ToolSearch } from '@/components/tools/tool-search';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { login } from '@/routes';
import toolRoutes from '@/routes/tools';
import type {
    ToolCategory,
    ToolIndexPageProps,
    ToolSummary,
} from '@/types/tools';

type ToolSectionProps = {
    id: string;
    eyebrow: string;
    title: string;
    description: string;
    icon: ReactNode;
    children: ReactNode;
};

function ToolSection({
    id,
    eyebrow,
    title,
    description,
    icon,
    children,
}: ToolSectionProps) {
    return (
        <section aria-labelledby={id} className="space-y-4">
            <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {icon}
                </span>
                <div>
                    <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                        {eyebrow}
                    </p>
                    <h2
                        id={id}
                        className="mt-0.5 text-xl font-semibold tracking-tight"
                    >
                        {title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
            {children}
        </section>
    );
}

function matchesQuery(tool: ToolSummary, query: string): boolean {
    if (query.length === 0) {
        return true;
    }

    return [
        tool.name,
        tool.shortDescription,
        tool.fullDescription ?? '',
        tool.category.name,
        ...tool.tags,
    ]
        .join(' ')
        .toLocaleLowerCase('es-MX')
        .includes(query);
}

export default function ToolsIndex({
    categories,
    tools,
    favoriteToolIds,
    recentHistory,
    mode,
    activeCategory,
}: ToolIndexPageProps) {
    const { auth } = usePage().props;
    const favoriteRequest = useHttp<
        Record<string, never>,
        { isFavorite: boolean }
    >({});
    const [query, setQuery] = useState('');
    const [favoriteIds, setFavoriteIds] = useState(
        () =>
            new Set([
                ...favoriteToolIds,
                ...tools
                    .filter((tool) => tool.isFavorite)
                    .map((tool) => tool.id),
            ]),
    );
    const [pendingFavoriteIds, setPendingFavoriteIds] = useState<Set<number>>(
        new Set(),
    );
    const [favoriteError, setFavoriteError] = useState<string | null>(null);

    const normalizedQuery = query.trim().toLocaleLowerCase('es-MX');
    const modeTools = useMemo(() => {
        if (mode === 'favorites') {
            return tools.filter((tool) => favoriteIds.has(tool.id));
        }

        if (mode === 'category' && activeCategory) {
            return tools.filter(
                (tool) => tool.category.id === activeCategory.id,
            );
        }

        return tools;
    }, [activeCategory, favoriteIds, mode, tools]);
    const visibleTools = useMemo(
        () => modeTools.filter((tool) => matchesQuery(tool, normalizedQuery)),
        [modeTools, normalizedQuery],
    );
    const featuredTools = visibleTools
        .filter((tool) => tool.isFeatured)
        .slice(0, 4);
    const mostUsedTools = [...visibleTools]
        .sort((first, second) => second.usageCount - first.usageCount)
        .slice(0, 4);
    const newTools = visibleTools.filter((tool) => tool.isNew).slice(0, 4);
    const favoriteTools = visibleTools
        .filter((tool) => favoriteIds.has(tool.id))
        .slice(0, 4);
    const showCuratedSections = mode === 'all' && normalizedQuery.length === 0;

    const pageTitle =
        mode === 'favorites'
            ? 'Tus herramientas favoritas'
            : mode === 'category' && activeCategory
              ? activeCategory.name
              : 'Herramientas para resolver, aprender y crear';
    const pageDescription =
        mode === 'favorites'
            ? 'Tu colección personal, lista para continuar desde cualquier dispositivo.'
            : mode === 'category' && activeCategory
              ? activeCategory.description ||
                `Explora las herramientas de ${activeCategory.name.toLocaleLowerCase('es-MX')}.`
              : 'Utilidades rápidas y claras para tareas tecnológicas cotidianas. Explora sin registrarte y guarda tus favoritas al iniciar sesión.';

    const updateFavorite = (tool: ToolSummary, isFavorite: boolean) => {
        if (!auth.user) {
            router.visit(login());

            return;
        }

        const previousFavoriteIds = new Set(favoriteIds);

        setFavoriteError(null);
        setFavoriteIds((current) => {
            const next = new Set(current);

            if (isFavorite) {
                next.add(tool.id);
            } else {
                next.delete(tool.id);
            }

            return next;
        });
        setPendingFavoriteIds((current) => new Set(current).add(tool.id));

        const rollback = (message = 'No pudimos actualizar tus favoritos.') => {
            setFavoriteIds(previousFavoriteIds);
            setFavoriteError(message);
        };
        const finish = () => {
            setPendingFavoriteIds((current) => {
                const next = new Set(current);
                next.delete(tool.id);

                return next;
            });
        };
        const options = {
            onError: () => rollback(),
            onHttpException: () => {
                rollback();

                return true;
            },
            onNetworkError: () => {
                rollback('Revisa tu conexión e inténtalo de nuevo.');

                return true;
            },
            onFinish: finish,
        };
        const request = isFavorite
            ? favoriteRequest.post(
                  toolRoutes.favorite.store.url(tool.slug),
                  options,
              )
            : favoriteRequest.delete(
                  toolRoutes.favorite.destroy.url(tool.slug),
                  options,
              );

        void request.catch(() => undefined);
    };

    const renderToolGrid = (sectionTools: ToolSummary[]) => (
        <div
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
            aria-busy={pendingFavoriteIds.size > 0}
        >
            {sectionTools.map((tool) => (
                <AivenToolCard
                    key={tool.id}
                    tool={tool}
                    href={toolRoutes.show(tool.slug)}
                    isFavorite={favoriteIds.has(tool.id)}
                    favoritePending={pendingFavoriteIds.has(tool.id)}
                    favoriteDisabled={pendingFavoriteIds.size > 0}
                    requiresFavoriteLogin={!auth.user}
                    onFavoriteChange={(isFavorite) =>
                        updateFavorite(tool, isFavorite)
                    }
                />
            ))}
        </div>
    );

    const emptyTitle =
        mode === 'favorites' && normalizedQuery.length === 0
            ? 'Aún no tienes favoritas'
            : 'No encontramos herramientas';
    const emptyDescription =
        mode === 'favorites' && normalizedQuery.length === 0
            ? 'Explora el catálogo y usa el corazón para crear una colección a tu medida.'
            : 'Prueba con otra palabra, limpia la búsqueda o explora una de las categorías recomendadas.';

    return (
        <>
            <Head title={pageTitle} />

            <div className="mx-auto flex w-full max-w-[96rem] flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8">
                <header className="relative isolate overflow-visible rounded-[1.75rem] border border-primary/15 bg-card px-5 py-8 shadow-sm sm:px-8 sm:py-10">
                    <div className="pointer-events-none absolute -top-24 right-0 -z-10 size-72 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-400/10" />
                    <div className="mx-auto max-w-4xl space-y-5 text-center">
                        <Badge variant="secondary" className="rounded-full">
                            <Wrench className="size-3.5" aria-hidden="true" />
                            Catálogo AIVEN
                        </Badge>
                        <div className="space-y-3">
                            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
                                {pageTitle}
                            </h1>
                            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                                {pageDescription}
                            </p>
                        </div>
                        <ToolSearch
                            tools={tools}
                            query={query}
                            onQueryChange={setQuery}
                            getToolHref={(tool) => toolRoutes.show(tool.slug)}
                            className="mx-auto max-w-2xl text-left"
                        />
                    </div>
                </header>

                <CategoryChips
                    categories={categories}
                    mode={mode}
                    activeCategory={activeCategory}
                    allHref={toolRoutes.index()}
                    favoritesHref={toolRoutes.favorites()}
                    historyHref={toolRoutes.history.index()}
                    getCategoryHref={(category: ToolCategory) =>
                        toolRoutes.category(category.slug)
                    }
                />

                {favoriteError && (
                    <p
                        role="alert"
                        className="-mt-4 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                    >
                        {favoriteError}
                    </p>
                )}

                {visibleTools.length === 0 ? (
                    <section
                        aria-labelledby="empty-tools-title"
                        className="rounded-[1.75rem] border border-dashed bg-muted/20 px-5 py-10 text-center"
                    >
                        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <SearchX className="size-6" aria-hidden="true" />
                        </span>
                        <h2
                            id="empty-tools-title"
                            className="mt-4 text-lg font-semibold"
                        >
                            {emptyTitle}
                        </h2>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                            {emptyDescription}
                        </p>
                        <div className="mt-5 flex flex-wrap justify-center gap-2">
                            {normalizedQuery.length > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-full"
                                    onClick={() => setQuery('')}
                                >
                                    Limpiar búsqueda
                                </Button>
                            )}
                            {mode !== 'all' && (
                                <Button asChild className="rounded-full">
                                    <Link href={toolRoutes.index()}>
                                        Explorar todas
                                        <ArrowRight aria-hidden="true" />
                                    </Link>
                                </Button>
                            )}
                            {categories.slice(0, 3).map((category) => (
                                <Button
                                    key={category.id}
                                    asChild
                                    variant="ghost"
                                    className="rounded-full"
                                >
                                    <Link
                                        href={toolRoutes.category(
                                            category.slug,
                                        )}
                                    >
                                        {category.name}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    </section>
                ) : (
                    <div className="space-y-10">
                        {showCuratedSections && featuredTools.length > 0 && (
                            <ToolSection
                                id="featured-tools"
                                eyebrow="Selección AIVEN"
                                title="Destacadas"
                                description="Un buen punto de partida para las tareas más comunes."
                                icon={
                                    <Sparkles
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                }
                            >
                                {renderToolGrid(featuredTools)}
                            </ToolSection>
                        )}

                        {showCuratedSections && mostUsedTools.length > 0 && (
                            <ToolSection
                                id="most-used-tools"
                                eyebrow="Tendencias"
                                title="Más utilizadas"
                                description="Las utilidades que más ayudan a la comunidad."
                                icon={
                                    <TrendingUp
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                }
                            >
                                {renderToolGrid(mostUsedTools)}
                            </ToolSection>
                        )}

                        {showCuratedSections && newTools.length > 0 && (
                            <ToolSection
                                id="new-tools"
                                eyebrow="Recién llegadas"
                                title="Nuevas herramientas"
                                description="Experiencias recientes listas para descubrir."
                                icon={
                                    <Layers3
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                }
                            >
                                {renderToolGrid(newTools)}
                            </ToolSection>
                        )}

                        {showCuratedSections && favoriteTools.length > 0 && (
                            <ToolSection
                                id="favorite-tools"
                                eyebrow="Tu colección"
                                title="Favoritas"
                                description="Accesos rápidos a las herramientas que guardaste."
                                icon={
                                    <Heart
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                }
                            >
                                {renderToolGrid(favoriteTools)}
                            </ToolSection>
                        )}

                        <ToolSection
                            id="all-tools"
                            eyebrow={
                                normalizedQuery ? 'Resultados' : 'Catálogo'
                            }
                            title={
                                normalizedQuery
                                    ? `${visibleTools.length} ${visibleTools.length === 1 ? 'resultado' : 'resultados'}`
                                    : mode === 'all'
                                      ? 'Todas las herramientas'
                                      : pageTitle
                            }
                            description={
                                normalizedQuery
                                    ? `Coincidencias para “${query.trim()}”.`
                                    : 'Explora cada utilidad disponible en esta selección.'
                            }
                            icon={
                                <Wrench className="size-4" aria-hidden="true" />
                            }
                        >
                            {renderToolGrid(visibleTools)}
                        </ToolSection>
                    </div>
                )}

                {auth.user && (
                    <section
                        aria-labelledby="recent-history"
                        className="space-y-4"
                    >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                            <div className="flex items-start gap-3">
                                <span className="mt-0.5 flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <History
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </span>
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                                        Continúa donde estabas
                                    </p>
                                    <h2
                                        id="recent-history"
                                        className="mt-0.5 text-xl font-semibold tracking-tight"
                                    >
                                        Actividad reciente
                                    </h2>
                                </div>
                            </div>
                            <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="w-fit rounded-full"
                            >
                                <Link href={toolRoutes.history.index()}>
                                    <Clock3 aria-hidden="true" />
                                    Ver historial
                                </Link>
                            </Button>
                        </div>
                        <HistoryPanel
                            entries={recentHistory.slice(0, 5)}
                            compact
                            getToolHref={(entry) =>
                                toolRoutes.show(entry.tool.slug, {
                                    query: { historial: entry.id },
                                })
                            }
                            emptyAction={
                                <Button
                                    asChild
                                    size="sm"
                                    className="rounded-full"
                                >
                                    <Link href={toolRoutes.index()}>
                                        Elegir una herramienta
                                    </Link>
                                </Button>
                            }
                        />
                    </section>
                )}
            </div>
        </>
    );
}

ToolsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Herramientas',
            href: toolRoutes.index(),
        },
    ],
};
