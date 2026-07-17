import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: ReactNode;
    className?: string;
};

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/25 px-5 py-8 text-center',
                className,
            )}
        >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-6" />
            </span>
            <p className="mt-3 text-sm font-medium">{title}</p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                {description}
            </p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
