import { Link, usePage } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { platformNavItems } from '@/lib/platform-navigation';
import { dashboard, home, login, register } from '@/routes';

export function AppSidebar() {
    const { auth } = usePage().props;
    const closeMobileNavigation = useMobileNavigation();
    const navigationItems = platformNavItems.map((item) =>
        item.title === 'Inicio'
            ? { ...item, href: auth.user ? dashboard() : home() }
            : item,
    );

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r-0">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={auth.user ? dashboard() : home()}
                                prefetch
                                onClick={closeMobileNavigation}
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navigationItems} />
            </SidebarContent>

            <SidebarFooter>
                <div className="mx-1 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/50 px-3 py-2.5 group-data-[collapsible=icon]:hidden">
                    <p className="text-xs font-semibold text-sidebar-foreground">
                        Herramientas AIVEN activas
                    </p>
                    <p className="mt-0.5 text-[0.68rem] leading-relaxed text-sidebar-foreground/60">
                        Resuelve tareas desde cualquier dispositivo.
                    </p>
                </div>
                {auth.user ? (
                    <NavUser />
                ) : (
                    <SidebarMenu className="group-data-[collapsible=icon]:hidden">
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link
                                    href={login()}
                                    onClick={closeMobileNavigation}
                                >
                                    Iniciar sesión
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive>
                                <Link
                                    href={register()}
                                    onClick={closeMobileNavigation}
                                >
                                    Crear cuenta
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
