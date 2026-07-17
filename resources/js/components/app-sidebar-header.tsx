import { Breadcrumbs } from '@/components/breadcrumbs';
import { PlatformToolbar } from '@/components/platform-toolbar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 bg-background/85 px-3 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14 sm:px-4">
            <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <div className="min-w-0 truncate">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <PlatformToolbar />
        </header>
    );
}
