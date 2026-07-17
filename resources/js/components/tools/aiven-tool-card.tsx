import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { ArrowUpRight, LockKeyhole, MousePointerClick } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ToolSummary } from '@/types/tools';
import { FavoriteButton } from './favorite-button';
import { ToolBadges } from './tool-badges';
import { ToolIcon } from './tool-icon';

type AivenToolCardProps = {
    tool: ToolSummary;
    href: NonNullable<InertiaLinkProps['href']>;
    isFavorite: boolean;
    onFavoriteChange?: (isFavorite: boolean) => void;
    favoritePending?: boolean;
    favoriteDisabled?: boolean;
    requiresFavoriteLogin?: boolean;
    className?: string;
};

export function AivenToolCard({
    tool,
    href,
    isFavorite,
    onFavoriteChange,
    favoritePending = false,
    favoriteDisabled = false,
    requiresFavoriteLogin = false,
    className,
}: AivenToolCardProps) {
    return (
        <Card
            className={cn(
                'group h-full gap-4 rounded-2xl py-5 transition-[transform,border-color,box-shadow] hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none',
                className,
            )}
        >
            <CardHeader className="gap-4 px-5 sm:px-6">
                <div className="flex items-start justify-between gap-3">
                    <Link
                        href={href}
                        prefetch
                        className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/15 to-indigo-500/15 text-primary ring-primary/30 transition-transform outline-none group-hover:scale-105 focus-visible:ring-2 motion-reduce:transform-none motion-reduce:transition-none"
                        aria-label={`Abrir ${tool.name}`}
                    >
                        <ToolIcon icon={tool.icon} className="size-6" />
                    </Link>
                    <FavoriteButton
                        isFavorite={isFavorite}
                        onFavoriteChange={onFavoriteChange}
                        pending={favoritePending}
                        disabled={favoriteDisabled}
                        requiresLogin={requiresFavoriteLogin}
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-primary">
                            {tool.category.name}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>v{tool.version}</span>
                    </div>
                    <CardTitle className="text-lg leading-tight">
                        <Link
                            href={href}
                            prefetch
                            className="rounded-sm outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            {tool.name}
                        </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-3 leading-relaxed">
                        {tool.shortDescription}
                    </CardDescription>
                </div>

                <ToolBadges
                    status={tool.status}
                    isNew={tool.isNew}
                    isOfflineCapable={tool.isOfflineCapable}
                />
            </CardHeader>

            <CardContent className="mt-auto space-y-3 px-5 sm:px-6">
                {tool.tags.length > 0 && (
                    <div
                        className="flex flex-wrap gap-1.5"
                        aria-label="Etiquetas"
                    >
                        {tool.tags.slice(0, 3).map((tag) => (
                            <Badge
                                key={tag}
                                variant="secondary"
                                className="font-normal"
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
                {tool.requiresLogin && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <LockKeyhole className="size-3.5" aria-hidden="true" />
                        Requiere iniciar sesión
                    </p>
                )}
            </CardContent>

            <CardFooter className="justify-between gap-3 px-5 text-xs text-muted-foreground sm:px-6">
                <span className="inline-flex items-center gap-1.5">
                    <MousePointerClick
                        className="size-3.5"
                        aria-hidden="true"
                    />
                    {new Intl.NumberFormat('es-MX', {
                        notation:
                            tool.usageCount >= 10_000 ? 'compact' : 'standard',
                    }).format(tool.usageCount)}{' '}
                    usos
                </span>
                <Link
                    href={href}
                    prefetch
                    className="inline-flex items-center gap-1 font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                    Abrir
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </Link>
            </CardFooter>
        </Card>
    );
}
