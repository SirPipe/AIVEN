import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { Clock3, Heart, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToolCategory, ToolIndexMode } from '@/types/tools';
import { ToolIcon } from './tool-icon';

type Href = NonNullable<InertiaLinkProps['href']>;

type CategoryChipsProps = {
    categories: ToolCategory[];
    mode: ToolIndexMode;
    activeCategory?: ToolCategory | null;
    allHref: Href;
    favoritesHref: Href;
    historyHref: Href;
    getCategoryHref: (category: ToolCategory) => Href;
};

const chipClassName =
    'inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-medium outline-none transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none';

export function CategoryChips({
    categories,
    mode,
    activeCategory,
    allHref,
    favoritesHref,
    historyHref,
    getCategoryHref,
}: CategoryChipsProps) {
    return (
        <nav aria-label="Filtrar herramientas" className="-mx-4 sm:mx-0">
            <div className="flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-2 sm:px-0 [&::-webkit-scrollbar]:hidden">
                <Link
                    href={allHref}
                    prefetch
                    aria-current={mode === 'all' ? 'page' : undefined}
                    className={cn(
                        chipClassName,
                        mode === 'all'
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'bg-card text-muted-foreground',
                    )}
                >
                    <LayoutGrid className="size-4" aria-hidden="true" />
                    Todas
                </Link>
                <Link
                    href={favoritesHref}
                    prefetch
                    aria-current={mode === 'favorites' ? 'page' : undefined}
                    className={cn(
                        chipClassName,
                        mode === 'favorites'
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'bg-card text-muted-foreground',
                    )}
                >
                    <Heart className="size-4" aria-hidden="true" />
                    Favoritas
                </Link>
                <Link
                    href={historyHref}
                    prefetch
                    className={cn(
                        chipClassName,
                        'bg-card text-muted-foreground',
                    )}
                >
                    <Clock3 className="size-4" aria-hidden="true" />
                    Historial
                </Link>
                <span
                    aria-hidden="true"
                    className="my-1 w-px shrink-0 bg-border"
                />
                {categories.map((category) => {
                    const isActive =
                        mode === 'category' &&
                        activeCategory?.id === category.id;

                    return (
                        <Link
                            key={category.id}
                            href={getCategoryHref(category)}
                            prefetch
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                chipClassName,
                                isActive
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'bg-card text-muted-foreground',
                            )}
                        >
                            <ToolIcon icon={category.icon} className="size-4" />
                            {category.name}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
