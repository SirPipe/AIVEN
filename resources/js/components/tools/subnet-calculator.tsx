import {
    Binary,
    Copy,
    Download,
    Network,
    RefreshCcw,
    Share2,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AivenToolLayout } from '@/components/tools/tool-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    historyNumber,
    historyString,
} from '@/lib/tools/history-configuration';
import { calculateSubnet, subnetExamples } from '@/lib/tools/subnet';
import type { SubnetResult } from '@/lib/tools/subnet';
import type { ToolRuntimeProps } from '@/types/tool-runtime';

type SubnetMode = 'advanced' | 'beginner';

function subnetSummary(result: SubnetResult): string {
    return [
        `AIVEN · Calculadora de subredes`,
        `IP: ${result.ip}/${result.cidr}`,
        `Máscara: ${result.mask}`,
        `Red: ${result.network}`,
        `Broadcast: ${result.broadcast}`,
        `Primera utilizable: ${result.firstUsable}`,
        `Última utilizable: ${result.lastUsable}`,
        `Direcciones totales: ${result.totalAddresses}`,
        `Hosts utilizables: ${result.usableHosts}`,
        `Tipo: ${result.addressType.label}`,
        `Clase histórica: ${result.historicalClass}`,
    ].join('\n');
}

function downloadText(content: string): void {
    const url = URL.createObjectURL(
        new Blob([content], { type: 'text/plain;charset=utf-8' }),
    );
    const link = document.createElement('a');

    link.href = url;
    link.download = 'aiven-subred-ipv4.txt';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function ResultItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border bg-background p-3">
            <dt className="text-xs font-medium text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-1 font-mono text-sm font-semibold break-all">
                {value}
            </dd>
        </div>
    );
}

export default function SubnetCalculator({
    favoriteAction,
    initialConfiguration,
    offlineShell,
    recordError,
    recordHistory,
    related,
    tool,
}: ToolRuntimeProps) {
    const initialPrefix = historyNumber(
        initialConfiguration,
        'prefixLength',
        24,
        { integer: true, max: 32, min: 0 },
    );
    const [input, setInput] = useState(`192.168.1.10/${initialPrefix}`);
    const [mode, setMode] = useState<SubnetMode>(() =>
        historyString(
            initialConfiguration,
            'mode',
            ['beginner', 'advanced'] as const,
            'beginner',
        ),
    );
    const [result, setResult] = useState<SubnetResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const historyConfiguration = (subnet: SubnetResult) => ({
        mode,
        prefixLength: subnet.cidr,
        totalAddresses: subnet.totalAddresses,
        usableHosts: subnet.usableHosts,
    });

    const calculate = () => {
        try {
            const nextResult = calculateSubnet(input);

            setResult(nextResult);
            setError(null);
            recordHistory('completed', historyConfiguration(nextResult));
        } catch (calculationError) {
            setResult(null);
            setError(
                calculationError instanceof Error
                    ? calculationError.message
                    : 'No fue posible interpretar la dirección IPv4.',
            );
        }
    };
    const copy = async () => {
        if (!result) {
            return;
        }

        try {
            await navigator.clipboard.writeText(subnetSummary(result));
            toast.success('Resumen copiado.');
        } catch {
            toast.error('No fue posible copiar el resumen.');
        }
    };
    const share = async () => {
        if (!result || !navigator.share) {
            toast.error('Tu navegador no permite compartir este resultado.');

            return;
        }

        try {
            await navigator.share({
                title: 'Cálculo de subred AIVEN',
                text: subnetSummary(result),
            });
            recordHistory('shared', historyConfiguration(result));
        } catch (shareError) {
            if (
                shareError instanceof DOMException &&
                shareError.name === 'AbortError'
            ) {
                return;
            }

            recordError('share_failed');
            toast.error('No fue posible compartir el resultado.');
        }
    };
    const reset = () => {
        setInput('192.168.1.10/24');
        setResult(null);
        setError(null);
    };

    const resultPanel = result ? (
        <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="secondary">{result.addressType.label}</Badge>
                <span className="text-xs text-muted-foreground">
                    Clase {result.historicalClass} · dato histórico
                </span>
            </div>

            <dl className="grid gap-2 sm:grid-cols-2">
                <ResultItem label="Dirección IP" value={result.ip} />
                <ResultItem label="Prefijo CIDR" value={`/${result.cidr}`} />
                <ResultItem label="Máscara" value={result.mask} />
                <ResultItem label="Dirección de red" value={result.network} />
                <ResultItem
                    label="Dirección de broadcast"
                    value={result.broadcast}
                />
                <ResultItem
                    label="Primera IP utilizable"
                    value={result.firstUsable}
                />
                <ResultItem
                    label="Última IP utilizable"
                    value={result.lastUsable}
                />
                <ResultItem
                    label="Direcciones totales"
                    value={result.totalAddresses.toLocaleString('es-MX')}
                />
                <ResultItem
                    label="Hosts utilizables"
                    value={result.usableHosts.toLocaleString('es-MX')}
                />
                <ResultItem
                    label="Tipo de dirección"
                    value={result.addressType.label}
                />
            </dl>

            <div className="rounded-2xl border bg-slate-950 p-4 text-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Binary className="size-4" aria-hidden="true" />
                    Bits de red y host
                </div>
                <p
                    className="mt-3 overflow-x-auto font-mono text-sm whitespace-nowrap"
                    aria-label={`${result.cidr} bits de red y ${32 - result.cidr} bits de host`}
                >
                    <span className="text-cyan-300">
                        {result.binary.networkBits || '∅'}
                    </span>
                    <span className="px-1 text-white">|</span>
                    <span className="text-violet-300">
                        {result.binary.hostBits || '∅'}
                    </span>
                </p>
                {mode === 'advanced' && (
                    <dl className="mt-4 grid gap-2 text-xs text-slate-300">
                        <div>
                            <dt className="font-medium text-slate-100">IP</dt>
                            <dd className="overflow-x-auto font-mono whitespace-nowrap">
                                {result.binary.ip}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium text-slate-100">
                                Máscara
                            </dt>
                            <dd className="overflow-x-auto font-mono whitespace-nowrap">
                                {result.binary.mask}
                            </dd>
                        </div>
                    </dl>
                )}
            </div>

            {mode === 'beginner' && (
                <ol className="grid gap-2 rounded-2xl border bg-muted/20 p-4 text-sm leading-relaxed">
                    {result.explanation.map((step, index) => (
                        <li key={step} className="flex gap-3">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                {index + 1}
                            </span>
                            <span>{step}</span>
                        </li>
                    ))}
                </ol>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" onClick={() => void copy()}>
                    <Copy aria-hidden="true" />
                    Copiar resumen
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        downloadText(subnetSummary(result));
                        recordHistory(
                            'downloaded',
                            historyConfiguration(result),
                        );
                    }}
                >
                    <Download aria-hidden="true" />
                    Exportar TXT
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => void share()}
                >
                    <Share2 aria-hidden="true" />
                    Compartir
                </Button>
                <Button type="button" variant="ghost" onClick={reset}>
                    <RefreshCcw aria-hidden="true" />
                    Reiniciar
                </Button>
            </div>
        </div>
    ) : (
        <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed p-8 text-center">
            <div className="space-y-3">
                <Network className="mx-auto size-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                    Introduce una dirección y calcula la subred.
                </p>
            </div>
        </div>
    );

    return (
        <AivenToolLayout
            tool={tool}
            icon={<Network className="size-7" />}
            favoriteAction={favoriteAction}
            offlineShell={offlineShell}
            related={related}
            result={
                <div className="grid gap-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Dirección no válida</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {resultPanel}
                </div>
            }
            resultDescription="Resultados IPv4 calculados localmente, incluidos los casos especiales /31 y /32."
            helpItems={[
                {
                    question: '¿Puedo escribir una máscara decimal?',
                    answer: 'Sí. Usa, por ejemplo, 172.16.20.15/255.255.240.0. AIVEN verifica que sus bits sean contiguos y calcula el prefijo equivalente.',
                },
                {
                    question: '¿Por qué una /31 tiene dos hosts utilizables?',
                    answer: 'RFC 3021 permite usar ambas direcciones en enlaces punto a punto. AIVEN aplica ese comportamiento moderno; una /32 identifica un único host.',
                },
                {
                    question: '¿Siguen importando las clases A, B y C?',
                    answer: 'Sólo como referencia histórica. La asignación y el diseño actuales utilizan prefijos CIDR.',
                },
            ]}
            privacy={
                <Card className="gap-3 rounded-[1.5rem] border-emerald-500/20 bg-emerald-500/[0.035] py-5">
                    <CardHeader className="px-5">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                            Cálculo local
                        </CardTitle>
                        <CardDescription>
                            La dirección no se envía ni se guarda. Si activaste
                            historial, AIVEN conserva únicamente el prefijo y el
                            modo, nunca la IP introducida.
                        </CardDescription>
                    </CardHeader>
                </Card>
            }
        >
            <form
                className="grid gap-6"
                onSubmit={(event) => {
                    event.preventDefault();
                    calculate();
                }}
            >
                <div className="grid gap-2">
                    <Label htmlFor="subnet-input">
                        Dirección IPv4 y prefijo o máscara
                    </Label>
                    <Input
                        id="subnet-input"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="192.168.1.10/24"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                        Ejemplos: 192.168.1.10/24 o 172.16.20.15/255.255.240.0
                    </p>
                </div>

                <fieldset className="grid gap-2">
                    <legend className="mb-1 text-sm font-medium">
                        Nivel de explicación
                    </legend>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            type="button"
                            variant={
                                mode === 'beginner' ? 'default' : 'outline'
                            }
                            onClick={() => setMode('beginner')}
                        >
                            Principiante
                        </Button>
                        <Button
                            type="button"
                            variant={
                                mode === 'advanced' ? 'default' : 'outline'
                            }
                            onClick={() => setMode('advanced')}
                        >
                            Avanzado
                        </Button>
                    </div>
                </fieldset>

                <div className="grid gap-2">
                    <Label>Ejemplos rápidos</Label>
                    <div className="flex flex-wrap gap-2">
                        {subnetExamples.map((example) => (
                            <Button
                                key={example.input}
                                type="button"
                                variant="outline"
                                size="sm"
                                title={example.description}
                                onClick={() => {
                                    setInput(example.input);
                                    setResult(null);
                                    setError(null);
                                }}
                            >
                                {example.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <Button type="submit" size="lg">
                    <Network aria-hidden="true" />
                    Calcular subred
                </Button>
            </form>
        </AivenToolLayout>
    );
}
