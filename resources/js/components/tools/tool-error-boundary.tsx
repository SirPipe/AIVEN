import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Component } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type ToolErrorBoundaryProps = {
    children: ReactNode;
    onError: () => void;
};

type ToolErrorBoundaryState = {
    failed: boolean;
};

export class ToolErrorBoundary extends Component<
    ToolErrorBoundaryProps,
    ToolErrorBoundaryState
> {
    public state: ToolErrorBoundaryState = { failed: false };

    public static getDerivedStateFromError(): ToolErrorBoundaryState {
        return { failed: true };
    }

    public componentDidCatch(): void {
        this.props.onError();
    }

    public render(): ReactNode {
        if (!this.state.failed) {
            return this.props.children;
        }

        return (
            <div className="mx-auto grid w-full max-w-3xl place-items-center p-4 sm:p-8">
                <Card className="w-full rounded-[1.5rem] border-destructive/25 py-8 text-center">
                    <CardContent className="mx-auto grid max-w-lg justify-items-center gap-4 px-6">
                        <span className="grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
                            <AlertTriangle aria-hidden="true" />
                        </span>
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold">
                                La herramienta encontró un problema
                            </h2>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                AIVEN registró únicamente un código técnico, sin
                                incluir tus datos ni el contenido utilizado.
                                Recarga la herramienta para intentarlo otra vez.
                            </p>
                        </div>
                        <Button
                            type="button"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCcw aria-hidden="true" />
                            Recargar herramienta
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
}
