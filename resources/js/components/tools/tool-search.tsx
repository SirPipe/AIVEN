import { Link, router } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ToolSummary } from '@/types/tools';
import { ToolIcon } from './tool-icon';

type ToolSearchProps = {
    tools: ToolSummary[];
    query: string;
    onQueryChange: (query: string) => void;
    getToolHref: (tool: ToolSummary) => NonNullable<InertiaLinkProps['href']>;
    className?: string;
};

function searchableText(tool: ToolSummary): string {
    return [tool.name, tool.shortDescription, tool.category.name, ...tool.tags]
        .join(' ')
        .toLocaleLowerCase('es-MX');
}

export function ToolSearch({
    tools,
    query,
    onQueryChange,
    getToolHref,
    className,
}: ToolSearchProps) {
    const inputId = useId();
    const listboxId = `${inputId}-suggestions`;
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const normalizedQuery = query.trim().toLocaleLowerCase('es-MX');
    const suggestions = useMemo(
        () =>
            normalizedQuery.length === 0
                ? []
                : tools
                      .filter((tool) =>
                          searchableText(tool).includes(normalizedQuery),
                      )
                      .slice(0, 6),
        [normalizedQuery, tools],
    );

    const activeSuggestion = suggestions[activeIndex];

    return (
        <div
            className={cn('relative', className)}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    setIsOpen(false);
                    setActiveIndex(-1);
                }
            }}
        >
            <label htmlFor={inputId} className="sr-only">
                Buscar herramientas
            </label>
            <Search
                className="pointer-events-none absolute top-1/2 left-4 z-10 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
            />
            <Input
                id={inputId}
                type="search"
                role="combobox"
                autoComplete="off"
                value={query}
                placeholder="Busca por nombre, categoría o etiqueta…"
                aria-autocomplete="list"
                aria-controls={listboxId}
                aria-expanded={isOpen && normalizedQuery.length > 0}
                aria-activedescendant={
                    activeSuggestion
                        ? `${listboxId}-${activeSuggestion.id}`
                        : undefined
                }
                className="h-12 rounded-2xl bg-background pr-11 pl-11 shadow-sm"
                onFocus={() => setIsOpen(normalizedQuery.length > 0)}
                onChange={(event) => {
                    onQueryChange(event.target.value);
                    setIsOpen(true);
                    setActiveIndex(-1);
                }}
                onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        setIsOpen(true);
                        setActiveIndex((current) =>
                            Math.min(current + 1, suggestions.length - 1),
                        );
                    }

                    if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        setActiveIndex((current) => Math.max(current - 1, 0));
                    }

                    if (event.key === 'Enter' && activeSuggestion) {
                        event.preventDefault();
                        setIsOpen(false);
                        router.visit(getToolHref(activeSuggestion));
                    }

                    if (event.key === 'Escape') {
                        setIsOpen(false);
                        setActiveIndex(-1);
                    }
                }}
            />
            {query.length > 0 && (
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute top-1/2 right-1.5 z-10 -translate-y-1/2 rounded-full"
                    aria-label="Limpiar búsqueda"
                    onClick={() => {
                        onQueryChange('');
                        setIsOpen(false);
                        setActiveIndex(-1);
                    }}
                >
                    <X aria-hidden="true" />
                </Button>
            )}

            {isOpen && normalizedQuery.length > 0 && (
                <div
                    id={listboxId}
                    role="listbox"
                    aria-label="Sugerencias de herramientas"
                    className="absolute top-[calc(100%+0.5rem)] right-0 left-0 z-30 overflow-hidden rounded-2xl border bg-popover p-1.5 text-popover-foreground shadow-xl"
                >
                    {suggestions.length === 0 ? (
                        <p className="px-3 py-4 text-sm text-muted-foreground">
                            No encontramos coincidencias. Prueba otra palabra.
                        </p>
                    ) : (
                        suggestions.map((tool, index) => (
                            <Link
                                key={tool.id}
                                id={`${listboxId}-${tool.id}`}
                                role="option"
                                aria-selected={activeIndex === index}
                                href={getToolHref(tool)}
                                prefetch
                                className={cn(
                                    'flex items-center gap-3 rounded-xl px-3 py-2.5 outline-none hover:bg-accent focus-visible:bg-accent',
                                    activeIndex === index && 'bg-accent',
                                )}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => setIsOpen(false)}
                            >
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <ToolIcon
                                        icon={tool.icon}
                                        className="size-4"
                                    />
                                </span>
                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-medium">
                                        {tool.name}
                                    </span>
                                    <span className="block truncate text-xs text-muted-foreground">
                                        {tool.category.name} ·{' '}
                                        {tool.shortDescription}
                                    </span>
                                </span>
                            </Link>
                        ))
                    )}
                </div>
            )}

            <p className="sr-only" aria-live="polite">
                {normalizedQuery.length > 0
                    ? `${suggestions.length} sugerencias disponibles.`
                    : ''}
            </p>
        </div>
    );
}
