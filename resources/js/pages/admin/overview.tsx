import { Head } from '@inertiajs/react';
import { ShieldCheck, UserCheck, Users, UserRoundCog } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { overview } from '@/routes/admin';
import type { UserRole } from '@/types';

type Stats = {
    totalUsers: number;
    verifiedUsers: number;
    administrators: number;
    moderators: number;
};

type RecentUser = {
    id: number;
    name: string;
    username: string | null;
    email: string;
    role: UserRole;
    created_at: string;
};

type Props = {
    stats: Stats;
    recentUsers: RecentUser[];
};

const roleLabels: Record<UserRole, string> = {
    user: 'Usuario',
    moderator: 'Moderador',
    administrator: 'Administrador',
};

export default function AdminOverview({ recentUsers, stats }: Props) {
    const cards = [
        {
            label: 'Usuarios totales',
            value: stats.totalUsers,
            icon: Users,
        },
        {
            label: 'Correos verificados',
            value: stats.verifiedUsers,
            icon: UserCheck,
        },
        {
            label: 'Moderadores',
            value: stats.moderators,
            icon: ShieldCheck,
        },
        {
            label: 'Administradores',
            value: stats.administrators,
            icon: UserRoundCog,
        },
    ];

    return (
        <>
            <Head title="Administración" />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
                <div className="space-y-2">
                    <Badge variant="secondary">Acceso administrativo</Badge>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Resumen de AIVEN
                    </h1>
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        Consulta el estado inicial de usuarios y roles. Las
                        acciones de administración se ampliarán en las
                        siguientes etapas.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map((card) => (
                        <Card key={card.label} className="gap-4 py-5">
                            <CardHeader className="flex-row items-center justify-between gap-4 px-5">
                                <div className="space-y-1">
                                    <CardDescription>
                                        {card.label}
                                    </CardDescription>
                                    <CardTitle className="text-3xl">
                                        {card.value}
                                    </CardTitle>
                                </div>
                                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <card.icon className="size-5" />
                                </span>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                <Card className="gap-4 overflow-hidden py-0">
                    <CardHeader className="px-5 pt-5 sm:px-6">
                        <CardTitle>Usuarios recientes</CardTitle>
                        <CardDescription>
                            Las últimas cuentas creadas en la plataforma.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 pb-1">
                        {recentUsers.length === 0 ? (
                            <p className="px-5 pb-5 text-sm text-muted-foreground sm:px-6">
                                Todavía no hay usuarios registrados.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-y bg-muted/50 text-xs text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-5 py-3 font-medium sm:px-6">
                                                Usuario
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Rol
                                            </th>
                                            <th className="px-5 py-3 font-medium sm:px-6">
                                                Registro
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {recentUsers.map((user) => (
                                            <tr key={user.id}>
                                                <td className="px-5 py-4 sm:px-6">
                                                    <p className="font-medium">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        @
                                                        {user.username ??
                                                            'sin-usuario'}{' '}
                                                        · {user.email}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <Badge variant="outline">
                                                        {roleLabels[user.role]}
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-4 text-muted-foreground sm:px-6">
                                                    {new Intl.DateTimeFormat(
                                                        'es-MX',
                                                        {
                                                            dateStyle: 'medium',
                                                        },
                                                    ).format(
                                                        new Date(
                                                            user.created_at,
                                                        ),
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminOverview.layout = {
    breadcrumbs: [
        {
            title: 'Administración',
            href: overview(),
        },
    ],
};
