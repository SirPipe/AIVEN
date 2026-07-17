import { CircleDot, CloudOff, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ToolStatus } from '@/types/tools';

const statusPresentation: Record<
    ToolStatus,
    { label: string; className: string }
> = {
    available: {
        label: 'Disponible',
        className:
            'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    },
    coming_soon: {
        label: 'Próximamente',
        className:
            'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    },
    maintenance: {
        label: 'Mantenimiento',
        className:
            'border-orange-500/25 bg-orange-500/10 text-orange-700 dark:text-orange-300',
    },
    disabled: {
        label: 'Deshabilitada',
        className:
            'border-slate-500/25 bg-slate-500/10 text-slate-700 dark:text-slate-300',
    },
};

export function ToolStatusBadge({ status }: { status: ToolStatus }) {
    const presentation = statusPresentation[status];

    return (
        <Badge
            variant="outline"
            className={cn('rounded-full', presentation.className)}
        >
            <CircleDot />
            {presentation.label}
        </Badge>
    );
}

export function ToolBadges({
    status,
    isNew,
    isOfflineCapable,
}: {
    status: ToolStatus;
    isNew: boolean;
    isOfflineCapable: boolean;
}) {
    return (
        <div className="flex flex-wrap items-center gap-1.5">
            <ToolStatusBadge status={status} />
            {isNew && (
                <Badge
                    variant="outline"
                    className="rounded-full border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300"
                >
                    <Sparkles />
                    Nueva
                </Badge>
            )}
            {isOfflineCapable && (
                <Badge
                    variant="outline"
                    className="rounded-full border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
                >
                    <CloudOff />
                    Sin conexión
                </Badge>
            )}
        </div>
    );
}
