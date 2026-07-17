import {
    BookOpenText,
    Boxes,
    Compass,
    Gamepad2,
    House,
    MapPinned,
    MessagesSquare,
    Wrench,
} from 'lucide-react';
import {
    community,
    dashboard,
    explore,
    games,
    map,
    simulators,
    tools,
} from '@/routes';
import type { NavItem } from '@/types';

export const platformNavItems: NavItem[] = [
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
        title: 'Herramientas',
        href: tools(),
        icon: Wrench,
    },
    {
        title: 'Simuladores',
        href: simulators(),
        icon: Boxes,
    },
    {
        title: 'Juegos',
        href: games(),
        icon: Gamepad2,
    },
    {
        title: 'Comunidad',
        href: community(),
        icon: MessagesSquare,
    },
    {
        title: 'Mapa',
        href: map(),
        icon: MapPinned,
    },
];

export const searchableNavItems: NavItem[] = [
    ...platformNavItems,
    {
        title: 'Publicaciones',
        href: community({ query: { section: 'publicaciones' } }),
        icon: BookOpenText,
    },
    {
        title: 'Colecciones',
        href: explore({ query: { section: 'colecciones' } }),
        icon: Boxes,
    },
];
