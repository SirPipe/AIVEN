import type { ReactNode } from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { ToolSummary } from '@/types/tools';
import { AivenToolHeader } from './tool-header';

export type ToolHelpItem = {
    answer: string;
    question: string;
};

type AivenToolLayoutProps = {
    children: ReactNode;
    favoriteAction?: ReactNode;
    helpItems: ToolHelpItem[];
    icon: ReactNode;
    offlineShell?: boolean;
    privacy: ReactNode;
    related?: ReactNode;
    result: ReactNode;
    resultDescription?: string;
    tool: ToolSummary;
};

export function AivenToolLayout({
    children,
    favoriteAction,
    helpItems,
    icon,
    offlineShell = false,
    privacy,
    related,
    result,
    resultDescription = 'El resultado se actualizará con la información que ingreses.',
    tool,
}: AivenToolLayoutProps) {
    return (
        <div className="mx-auto flex w-full max-w-[96rem] min-w-0 flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8">
            <AivenToolHeader
                tool={tool}
                icon={icon}
                favoriteAction={favoriteAction}
                offlineShell={offlineShell}
            />

            <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
                <Card className="min-w-0 gap-4 rounded-[1.5rem] py-5">
                    <CardHeader className="px-5 sm:px-6">
                        <CardTitle className="text-lg">Configura</CardTitle>
                        <CardDescription>
                            Ajusta las opciones y procesa todo directamente
                            desde esta pantalla.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-5 sm:px-6">
                        {children}
                    </CardContent>
                </Card>

                <Card
                    className="min-w-0 gap-4 rounded-[1.5rem] border-primary/15 py-5 xl:sticky xl:top-5"
                    aria-live="polite"
                >
                    <CardHeader className="px-5 sm:px-6">
                        <CardTitle className="text-lg">Resultado</CardTitle>
                        <CardDescription>{resultDescription}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-5 sm:px-6">{result}</CardContent>
                </Card>
            </div>

            <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
                <Card id="ayuda" className="gap-2 rounded-[1.5rem] py-5">
                    <CardHeader className="px-5 sm:px-6">
                        <CardTitle className="text-lg">
                            Instrucciones y preguntas frecuentes
                        </CardTitle>
                        <CardDescription>
                            Detalles importantes para interpretar y aprovechar
                            el resultado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-5 sm:px-6">
                        <Accordion>
                            {helpItems.map((item) => (
                                <AccordionItem key={item.question}>
                                    <AccordionTrigger>
                                        {item.question}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {item.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>

                <div className="grid content-start gap-5">
                    {privacy}
                    {related}
                </div>
            </section>
        </div>
    );
}
