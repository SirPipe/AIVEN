import {
    BookOpenText,
    Boxes,
    Compass,
    Gamepad2,
    House,
    ImageDown,
    Images,
    KeyRound,
    MapPinned,
    MessagesSquare,
    Network,
    QrCode,
    Wrench,
    Zap,
} from 'lucide-react';
import {
    community,
    dashboard,
    explore,
    games,
    map,
    simulators,
} from '@/routes';
import toolRoutes, { index as tools } from '@/routes/tools';
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
        title: 'Generador QR',
        href: toolRoutes.show('generador-qr'),
        icon: QrCode,
    },
    {
        title: 'Generador de contraseñas',
        href: toolRoutes.show('generador-contrasenas'),
        icon: KeyRound,
    },
    {
        title: 'Comprimir imagen',
        href: toolRoutes.show('comprimir-imagen'),
        icon: ImageDown,
    },
    {
        title: 'Convertir imagen',
        href: toolRoutes.show('convertir-imagen'),
        icon: Images,
    },
    {
        title: 'Consumo de PC',
        href: toolRoutes.show('consumo-pc'),
        icon: Zap,
    },
    {
        title: 'Calculadora de subredes',
        href: toolRoutes.show('calculadora-subredes'),
        icon: Network,
    },
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
