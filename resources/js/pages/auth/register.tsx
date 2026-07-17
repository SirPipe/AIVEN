import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login, privacy, terms } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    interestOptions: Record<string, string>;
    passwordRules: string;
};

export default function Register({ interestOptions, passwordRules }: Props) {
    return (
        <>
            <Head title="Crear cuenta" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Tu nombre completo"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="username">
                                    Nombre de usuario
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    required
                                    tabIndex={2}
                                    autoComplete="username"
                                    name="username"
                                    minLength={3}
                                    maxLength={30}
                                    pattern="[a-z0-9_-]+"
                                    placeholder="tu_usuario"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Usa de 3 a 30 letras minúsculas, números,
                                    guiones o guiones bajos.
                                </p>
                                <InputError message={errors.username} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    Correo electrónico
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={3}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="tu@correo.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Contraseña"
                                    passwordrules={passwordRules}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirmar contraseña
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={5}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Repite tu contraseña"
                                    passwordrules={passwordRules}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <fieldset className="grid gap-3">
                                <legend className="text-sm font-medium">
                                    ¿Qué temas te interesan?{' '}
                                    <span className="font-normal text-muted-foreground">
                                        (opcional)
                                    </span>
                                </legend>
                                <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
                                    {Object.entries(interestOptions).map(
                                        ([value, label]) => (
                                            <label
                                                key={value}
                                                className="flex cursor-pointer items-center gap-3 text-sm"
                                            >
                                                <Checkbox
                                                    name="interests[]"
                                                    value={value}
                                                    tabIndex={6}
                                                />
                                                <span>{label}</span>
                                            </label>
                                        ),
                                    )}
                                </div>
                                <InputError message={errors.interests} />
                            </fieldset>

                            <div className="grid gap-2">
                                <label className="flex items-start gap-3 text-sm leading-relaxed">
                                    <Checkbox
                                        id="terms"
                                        name="terms"
                                        required
                                        tabIndex={7}
                                        className="mt-0.5"
                                    />
                                    <span>
                                        Acepto los{' '}
                                        <TextLink href={terms()}>
                                            términos de uso
                                        </TextLink>{' '}
                                        y la{' '}
                                        <TextLink href={privacy()}>
                                            política de privacidad
                                        </TextLink>
                                        .
                                    </span>
                                </label>
                                <InputError message={errors.terms} />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={8}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Crear cuenta
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            ¿Ya tienes una cuenta?{' '}
                            <TextLink href={login()} tabIndex={9}>
                                Iniciar sesión
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Crea tu cuenta en AIVEN',
    description: 'Configura tu identidad y elige tus primeros intereses',
};
