import { Link, usePage } from '@inertiajs/react';
import { Boxes, Compass, House, MessagesSquare, UserRound } from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useMobileKeyboard } from '@/hooks/use-mobile-keyboard';
import { cn } from '@/lib/utils';
import {
    community,
    dashboard,
    explore,
    games,
    home,
    login,
    map,
    simulators,
    tools,
} from '@/routes';
import { edit as editProfile } from '@/routes/profile';
import type { NavItem } from '@/types';

const primaryMobileNavItems: NavItem[] = [
    {
        title: 'Inicio',
        href: dashboard(),
        icon: House,
    },
    {
        title: 'Explorar',
        href: explore(),
        icon: Compass,
    },
    {
        title: 'Simular',
        href: simulators(),
        icon: Boxes,
    },
    {
        title: 'Comunidad',
        href: community(),
        icon: MessagesSquare,
    },
];

export function MobileBottomNav() {
    const { currentUrl, isCurrentOrParentUrl } = useCurrentUrl();
    const isKeyboardVisible = useMobileKeyboard();
    const { auth } = usePage().props;
    const mobileNavItems: NavItem[] = [
        ...primaryMobileNavItems.map((item) =>
            item.title === 'Inicio'
                ? { ...item, href: auth.user ? dashboard() : home() }
                : item,
        ),
        {
            title: auth.user ? 'Perfil' : 'Entrar',
            href: auth.user ? editProfile() : login(),
            icon: UserRound,
        },
    ];

    if (isKeyboardVisible) {
        return null;
    }

    return (
        <nav
            aria-label="Navegación principal móvil"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/92 px-2 pt-1 shadow-[0_-12px_40px_-24px_oklch(0.45_0.18_255/0.45)] backdrop-blur-xl md:hidden"
            style={{
                paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom))',
            }}
        >
            <ul className="mx-auto grid max-w-lg grid-cols-5 gap-1">
                {mobileNavItems.map((item) => {
                    const isActive =
                        item.title === 'Explorar'
                            ? [explore(), tools(), games(), map()].some(
                                  (route) => isCurrentOrParentUrl(route),
                              )
                            : item.title === 'Perfil'
                              ? currentUrl === '/settings' ||
                                currentUrl.startsWith('/settings/')
                              : isCurrentOrParentUrl(item.href);
                    const Icon = item.icon;

                    return (
                        <li key={item.title}>
                            <Link
                                href={item.href}
                                prefetch
                                aria-current={isActive ? 'page' : undefined}
                                className={cn(
                                    'flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[0.67rem] font-medium text-muted-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none',
                                    isActive &&
                                        'bg-primary/10 text-primary dark:bg-primary/15',
                                )}
                            >
                                {Icon && <Icon className="size-5" />}
                                <span>{item.title}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
