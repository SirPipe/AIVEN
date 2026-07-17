import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type FavoriteButtonProps = {
    isFavorite: boolean;
    onFavoriteChange?: (isFavorite: boolean) => void;
    pending?: boolean;
    disabled?: boolean;
    requiresLogin?: boolean;
    className?: string;
};

export function FavoriteButton({
    isFavorite,
    onFavoriteChange,
    pending = false,
    disabled = false,
    requiresLogin = false,
    className,
}: FavoriteButtonProps) {
    const action = isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos';
    const label = requiresLogin
        ? `${action}. Requiere iniciar sesión.`
        : action;

    return (
        <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={label}
            aria-pressed={isFavorite}
            title={label}
            disabled={disabled || pending || !onFavoriteChange}
            className={cn(
                'rounded-full text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400',
                isFavorite && 'text-rose-600 dark:text-rose-400',
                className,
            )}
            onClick={() => onFavoriteChange?.(!isFavorite)}
        >
            {pending ? (
                <Spinner className="motion-reduce:animate-none" />
            ) : (
                <Heart
                    aria-hidden="true"
                    className={cn(isFavorite && 'fill-current')}
                />
            )}
        </Button>
    );
}
