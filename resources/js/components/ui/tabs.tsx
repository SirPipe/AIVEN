import {
    createContext,
    useContext,
    useId,
    useMemo,
    useState,
} from 'react';
import type {
    ComponentProps,
    KeyboardEvent,
    PropsWithChildren,
} from 'react';
import { cn } from '@/lib/utils';

type TabsContextValue = {
    baseId: string;
    value: string;
    setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
    const context = useContext(TabsContext);

    if (!context) {
        throw new Error('Tabs components must be rendered inside Tabs.');
    }

    return context;
}

type TabsProps = PropsWithChildren<{
    defaultValue: string;
    value?: string;
    onValueChange?: (value: string) => void;
    className?: string;
}>;

function Tabs({
    defaultValue,
    value,
    onValueChange,
    className,
    children,
}: TabsProps) {
    const baseId = useId();
    const [internalValue, setInternalValue] = useState(defaultValue);
    const activeValue = value ?? internalValue;
    const context = useMemo<TabsContextValue>(
        () => ({
            baseId,
            value: activeValue,
            setValue: (nextValue) => {
                if (value === undefined) {
                    setInternalValue(nextValue);
                }

                onValueChange?.(nextValue);
            },
        }),
        [activeValue, baseId, onValueChange, value],
    );

    return (
        <TabsContext.Provider value={context}>
            <div className={cn('w-full', className)}>{children}</div>
        </TabsContext.Provider>
    );
}

function TabsList({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            role="tablist"
            className={cn(
                'inline-flex min-h-10 items-center gap-1 rounded-xl bg-muted p-1 text-muted-foreground',
                className,
            )}
            {...props}
        />
    );
}

type TabsTriggerProps = ComponentProps<'button'> & {
    value: string;
};

function TabsTrigger({
    value,
    className,
    onKeyDown,
    ...props
}: TabsTriggerProps) {
    const context = useTabsContext();
    const isActive = context.value === value;

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event);

        if (event.defaultPrevented) {
            return;
        }

        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
            return;
        }

        const tabs = Array.from(
            event.currentTarget
                .closest('[role="tablist"]')
                ?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
        );
        const currentIndex = tabs.indexOf(event.currentTarget);
        let nextIndex = currentIndex;

        if (event.key === 'Home') {
            nextIndex = 0;
        } else if (event.key === 'End') {
            nextIndex = tabs.length - 1;
        } else if (event.key === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % tabs.length;
        } else if (event.key === 'ArrowLeft') {
            nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        }

        const nextTab = tabs[nextIndex];

        if (nextTab) {
            event.preventDefault();
            nextTab.focus();
            nextTab.click();
        }
    };

    return (
        <button
            type="button"
            role="tab"
            id={`${context.baseId}-tab-${value}`}
            aria-controls={`${context.baseId}-panel-${value}`}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={cn(
                'inline-flex min-h-8 items-center justify-center rounded-lg px-3 py-1 text-sm font-medium whitespace-nowrap outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none',
                isActive && 'bg-background text-foreground shadow-sm',
                className,
            )}
            onClick={() => context.setValue(value)}
            onKeyDown={handleKeyDown}
            {...props}
        />
    );
}

type TabsContentProps = ComponentProps<'div'> & {
    value: string;
};

function TabsContent({ value, className, ...props }: TabsContentProps) {
    const context = useTabsContext();
    const isActive = context.value === value;

    return (
        <div
            role="tabpanel"
            id={`${context.baseId}-panel-${value}`}
            aria-labelledby={`${context.baseId}-tab-${value}`}
            hidden={!isActive}
            tabIndex={0}
            className={cn(
                'mt-3 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                className,
            )}
            {...props}
        />
    );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
