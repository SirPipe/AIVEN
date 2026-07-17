import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { edit as editProfile } from '@/routes/profile';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Verificar correo" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    Enviamos un nuevo enlace de verificación al correo que
                    proporcionaste durante el registro.
                </div>
            )}

            <div className="space-y-3 rounded-xl border bg-muted/35 p-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                    La verificación protege tu progreso, la configuración de
                    seguridad y las futuras funciones de la comunidad.
                </p>
                <p>
                    ¿El correo no es correcto?{' '}
                    <TextLink href={editProfile()}>
                        Cámbialo desde tu perfil
                    </TextLink>{' '}
                    y te enviaremos un enlace nuevo.
                </p>
            </div>

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button disabled={processing} variant="secondary">
                            {processing && <Spinner />}
                            Reenviar correo de verificación
                        </Button>

                        <TextLink
                            href={logout()}
                            as="button"
                            className="mx-auto block text-sm"
                        >
                            Cerrar sesión
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verifica tu correo',
    description:
        'Abre el enlace que acabamos de enviarte para activar todas las funciones de AIVEN.',
};
