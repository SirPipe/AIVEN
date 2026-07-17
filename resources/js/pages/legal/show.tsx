import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, LockKeyhole, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { home } from '@/routes';

type LegalDocument = {
    kind: 'terms' | 'privacy';
    title: string;
    updatedAt: string;
};

const termsSections = [
    {
        title: 'Uso de AIVEN',
        body: 'AIVEN ofrece herramientas, experiencias de aprendizaje y espacios comunitarios. Debes utilizar la plataforma de forma legal, respetuosa y sin intentar perjudicar a otras personas o al servicio.',
    },
    {
        title: 'Tu cuenta',
        body: 'Eres responsable de mantener seguras tus credenciales y de la actividad realizada desde tu cuenta. La información de registro debe ser correcta y no debe suplantar a otra persona.',
    },
    {
        title: 'Contenido comunitario',
        body: 'Cuando las funciones comunitarias estén disponibles, conservarás la autoría de lo que publiques y otorgarás a AIVEN el permiso necesario para mostrarlo y moderarlo dentro de la plataforma.',
    },
    {
        title: 'Disponibilidad y cambios',
        body: 'La plataforma se desarrolla por etapas. Algunas funciones pueden cambiar, suspenderse o permanecer en preparación mientras se prueban y mejoran.',
    },
];

const privacySections = [
    {
        title: 'Información que utilizamos',
        body: 'Recopilamos los datos necesarios para crear y proteger tu cuenta, como nombre, nombre de usuario, correo, preferencias y datos básicos de sesión. En futuras etapas podremos guardar progreso, favoritos y actividad que decidas realizar.',
    },
    {
        title: 'Para qué se utiliza',
        body: 'Usamos la información para autenticarte, sincronizar tu experiencia, mantener la seguridad, prestar las funciones solicitadas y mejorar AIVEN. No vendemos tus datos personales.',
    },
    {
        title: 'Sesiones y dispositivos',
        body: 'Registramos información técnica limitada, como dirección IP, navegador y última actividad, para mostrarte tus sesiones y permitirte revocarlas cuando sea necesario.',
    },
    {
        title: 'Control de tus datos',
        body: 'Puedes actualizar tu perfil, cambiar tu contraseña, cerrar sesiones y eliminar tu cuenta desde la configuración. Las obligaciones legales o de seguridad podrían requerir conservar temporalmente ciertos registros.',
    },
];

export default function LegalShow({ document }: { document: LegalDocument }) {
    const isPrivacy = document.kind === 'privacy';
    const sections = isPrivacy ? privacySections : termsSections;
    const Icon = isPrivacy ? LockKeyhole : Scale;

    return (
        <>
            <Head title={document.title} />
            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8">
                <Button asChild variant="ghost" className="w-fit rounded-full">
                    <Link href={home()}>
                        <ArrowLeft className="size-4" />
                        Volver a AIVEN
                    </Link>
                </Button>

                <header className="rounded-[1.75rem] border border-primary/15 bg-card px-5 py-8 sm:px-9 sm:py-10">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="size-6" />
                    </span>
                    <h1 className="mt-5 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                        {document.title}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Última actualización: {document.updatedAt}
                    </p>
                </header>

                <Card className="rounded-2xl py-2">
                    <CardContent className="divide-y px-5 sm:px-8">
                        {sections.map((section) => (
                            <section key={section.title} className="py-6">
                                <h2 className="text-lg font-semibold">
                                    {section.title}
                                </h2>
                                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                    {section.body}
                                </p>
                            </section>
                        ))}
                    </CardContent>
                </Card>

                <p className="px-2 text-xs leading-relaxed text-muted-foreground">
                    Este documento describe el funcionamiento inicial de AIVEN y
                    deberá revisarse antes de un lanzamiento público definitivo.
                </p>
            </div>
        </>
    );
}
