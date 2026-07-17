import { Form, Head } from '@inertiajs/react';
import { Clock3, MapPin, MonitorSmartphone } from 'lucide-react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';
import PasswordInput from '@/components/password-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/security';
import { destroy, destroyOther } from '@/routes/sessions';
import type { ActiveSession } from '@/types';

type Props = {
    passwordRules: string;
    sessions: ActiveSession[];
    status?: string;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const otherSessionCount = props.sessions.filter(
        (session) => !session.is_current,
    ).length;

    const statusMessage =
        props.status === 'session-revoked'
            ? 'La sesión se cerró correctamente.'
            : props.status === 'other-sessions-revoked'
              ? 'Se cerraron todas las demás sesiones.'
              : null;

    return (
        <>
            <Head title="Configuración de seguridad" />

            <h1 className="sr-only">Configuración de seguridad</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Cambiar contraseña"
                    description="Usa una contraseña larga y única para proteger tu cuenta"
                />

                <Form
                    {...SecurityController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnError={[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]}
                    resetOnSuccess
                    onError={(errors) => {
                        if (errors.password) {
                            passwordInput.current?.focus();
                        }

                        if (errors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                    className="space-y-6"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="current_password">
                                    Contraseña actual
                                </Label>

                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    name="current_password"
                                    className="mt-1 block w-full"
                                    autoComplete="current-password"
                                    placeholder="Contraseña actual"
                                />

                                <InputError message={errors.current_password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    Nueva contraseña
                                </Label>

                                <PasswordInput
                                    id="password"
                                    ref={passwordInput}
                                    name="password"
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    placeholder="Nueva contraseña"
                                    passwordrules={props.passwordRules}
                                />

                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirmar contraseña
                                </Label>

                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    placeholder="Repite tu contraseña"
                                    passwordrules={props.passwordRules}
                                />

                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-password-button"
                                >
                                    Actualizar contraseña
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <Heading
                        variant="small"
                        title="Sesiones activas"
                        description="Revisa los dispositivos que han iniciado sesión en tu cuenta"
                    />

                    {otherSessionCount > 0 && (
                        <Form
                            {...destroyOther.form()}
                            options={{ preserveScroll: true }}
                        >
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    variant="outline"
                                    size="sm"
                                    disabled={processing}
                                >
                                    Cerrar las demás sesiones
                                </Button>
                            )}
                        </Form>
                    )}
                </div>

                {statusMessage && (
                    <p
                        role="status"
                        className="rounded-lg border border-green-500/25 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-700 dark:text-green-300"
                    >
                        {statusMessage}
                    </p>
                )}

                {props.sessions.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                        No hay sesiones almacenadas para mostrar.
                    </div>
                ) : (
                    <div className="divide-y overflow-hidden rounded-xl border">
                        {props.sessions.map((session) => (
                            <div
                                key={session.id}
                                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex min-w-0 gap-3">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <MonitorSmartphone className="size-5" />
                                    </span>
                                    <div className="min-w-0 space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate text-sm font-medium">
                                                {session.user_agent ??
                                                    'Dispositivo desconocido'}
                                            </p>
                                            {session.is_current && (
                                                <Badge variant="secondary">
                                                    Este dispositivo
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <MapPin className="size-3.5" />
                                                {session.ip_address ??
                                                    'IP desconocida'}
                                            </span>
                                            <time
                                                dateTime={
                                                    session.last_active_at
                                                }
                                                className="flex items-center gap-1.5"
                                            >
                                                <Clock3 className="size-3.5" />
                                                {new Intl.DateTimeFormat(
                                                    'es-MX',
                                                    {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short',
                                                    },
                                                ).format(
                                                    new Date(
                                                        session.last_active_at,
                                                    ),
                                                )}
                                            </time>
                                        </div>
                                    </div>
                                </div>

                                {!session.is_current && (
                                    <Form
                                        {...destroy.form(session.id)}
                                        options={{ preserveScroll: true }}
                                    >
                                        {({ errors, processing }) => (
                                            <div className="grid justify-items-end gap-1">
                                                <Button
                                                    type="submit"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={processing}
                                                >
                                                    Cerrar sesión
                                                </Button>
                                                <InputError
                                                    message={errors.session}
                                                />
                                            </div>
                                        )}
                                    </Form>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ManageTwoFactor
                canManageTwoFactor={props.canManageTwoFactor}
                requiresConfirmation={props.requiresConfirmation}
                twoFactorEnabled={props.twoFactorEnabled}
            />

            <ManagePasskeys
                canManagePasskeys={props.canManagePasskeys}
                passkeys={props.passkeys}
            />
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Seguridad',
            href: edit(),
        },
    ],
};
