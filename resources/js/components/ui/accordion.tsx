import { ChevronDown } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

function Accordion({ className, ...props }: ComponentProps<'div'>) {
    return <div className={cn('divide-y', className)} {...props} />;
}

function AccordionItem({ className, ...props }: ComponentProps<'details'>) {
    return <details className={cn('group py-1', className)} {...props} />;
}

function AccordionTrigger({
    className,
    children,
    ...props
}: ComponentProps<'summary'>) {
    return (
        <summary
            className={cn(
                'flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-4 text-left text-sm font-medium outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden motion-reduce:transition-none',
                className,
            )}
            {...props}
        >
            {children}
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" />
        </summary>
    );
}

function AccordionContent({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            className={cn(
                'pb-4 text-sm leading-relaxed text-muted-foreground',
                className,
            )}
            {...props}
        />
    );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
