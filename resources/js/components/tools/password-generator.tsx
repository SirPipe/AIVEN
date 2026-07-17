import {
    Check,
    Copy,
    KeyRound,
    RefreshCcw,
    ShieldCheck,
    Sparkles,
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { generatePasswords } from '@/lib/tools/password';
import type {
    PasswordGenerationMode,
    PasswordGenerationResult,
} from '@/lib/tools/password';
import { cn } from '@/lib/utils';
import type { ToolRuntimeProps } from '@/types/tool-runtime';

type CharacterOptions = {
    excludeSimilar: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    uppercase: boolean;
};

const strengthColors = [
    'bg-rose-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-cyan-500',
    'bg-emerald-500',
];

function ToggleOption({
    checked,
    label,
    onChange,
}: {
    checked: boolean;
    label: string;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 text-sm transition-colors focus-within:ring-2 focus-within:ring-ring hover:bg-muted/50 motion-reduce:transition-none">
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="size-4 accent-primary"
            />
            {label}
        </label>
    );
}

export default function PasswordGenerator({
    favoriteAction,
    offlineShell,
    related,
    tool,
}: ToolRuntimeProps) {
    const [mode, setMode] = useState<PasswordGenerationMode>('random');
    const [length, setLength] = useState(20);
    const [count, setCount] = useState(3);
    const [wordCount, setWordCount] = useState(6);
    const [separator, setSeparator] = useState('-');
    const [capitalizeWords, setCapitalizeWords] = useState(false);
    const [includePassphraseNumber, setIncludePassphraseNumber] =
        useState(true);
    const [excludedCharacters, setExcludedCharacters] = useState('');
    const [characterOptions, setCharacterOptions] = useState<CharacterOptions>({
        excludeSimilar: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        uppercase: true,
    });
    const [result, setResult] = useState<PasswordGenerationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const generate = () => {
        try {
            const nextResult =
                mode === 'passphrase'
                    ? generatePasswords({
                          mode,
                          count,
                          wordCount,
                          separator,
                          capitalizeWords,
                          includeNumber: includePassphraseNumber,
                          excludedCharacters,
                      })
                    : generatePasswords({
                          mode,
                          count,
                          length,
                          excludedCharacters,
                          ...characterOptions,
                      });

            setResult(nextResult);
            setError(null);
            setCopiedIndex(null);
        } catch (generationError) {
            setResult(null);
            setError(
                generationError instanceof Error
                    ? generationError.message
                    : 'No fue posible generar las contraseñas.',
            );
        }
    };
    const updateCharacterOption = (
        key: keyof CharacterOptions,
        checked: boolean,
    ) => setCharacterOptions((current) => ({ ...current, [key]: checked }));
    const copyPassword = async (value: string, index: number) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedIndex(index);
            toast.success('Contraseña copiada.');
            window.setTimeout(() => setCopiedIndex(null), 1_500);
        } catch {
            toast.error('No fue posible copiar la contraseña.');
        }
    };
    const copyAll = async () => {
        if (!result) {
            return;
        }

        try {
            await navigator.clipboard.writeText(
                result.passwords.map((password) => password.value).join('\n'),
            );
            toast.success('Contraseñas copiadas.');
        } catch {
            toast.error('No fue posible copiar las contraseñas.');
        }
    };
    const reset = () => {
        setResult(null);
        setError(null);
        setCopiedIndex(null);
        setExcludedCharacters('');
    };

    const resultPanel = result ? (
        <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="secondary">
                    {result.passwords.length}{' '}
                    {result.passwords.length === 1
                        ? 'contraseña'
                        : 'contraseñas'}
                </Badge>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void copyAll()}
                >
                    <Copy aria-hidden="true" />
                    Copiar todas
                </Button>
            </div>

            <div className="grid gap-3">
                {result.passwords.map((password, index) => (
                    <article
                        key={`${password.value}-${index}`}
                        className="grid gap-3 rounded-2xl border bg-muted/20 p-4"
                    >
                        <div className="flex items-start gap-2">
                            <code className="min-w-0 flex-1 rounded-lg bg-background px-3 py-2 font-mono text-sm font-semibold [overflow-wrap:anywhere] select-all">
                                {password.value}
                            </code>
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="shrink-0"
                                aria-label={`Copiar contraseña ${index + 1}`}
                                onClick={() =>
                                    void copyPassword(password.value, index)
                                }
                            >
                                {copiedIndex === index ? (
                                    <Check aria-hidden="true" />
                                ) : (
                                    <Copy aria-hidden="true" />
                                )}
                            </Button>
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between gap-3 text-xs">
                                <span className="font-medium">
                                    {password.strength.label}
                                </span>
                                <span className="text-muted-foreground">
                                    {password.strength.entropyBits} bits
                                    estimados
                                </span>
                            </div>
                            <div
                                className="grid h-1.5 grid-cols-5 gap-1"
                                role="meter"
                                aria-label={`Seguridad estimada: ${password.strength.label}`}
                                aria-valuemin={0}
                                aria-valuemax={4}
                                aria-valuenow={password.strength.score}
                            >
                                {[0, 1, 2, 3, 4].map((score) => (
                                    <span
                                        key={score}
                                        className={cn(
                                            'rounded-full bg-muted',
                                            score <= password.strength.score &&
                                                strengthColors[
                                                    password.strength.score
                                                ],
                                        )}
                                    />
                                ))}
                            </div>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Resistencia orientativa ante intentos sin
                                límite:{' '}
                                {password.strength.estimatedCrackTimeLabel}.
                            </p>
                            {password.strength.warnings.length > 0 && (
                                <ul className="grid gap-1 text-xs text-amber-700 dark:text-amber-300">
                                    {password.strength.warnings.map(
                                        (warning) => (
                                            <li key={warning}>• {warning}</li>
                                        ),
                                    )}
                                </ul>
                            )}
                        </div>
                    </article>
                ))}
            </div>

            {result.warnings.length > 0 && (
                <Alert>
                    <Sparkles aria-hidden="true" />
                    <AlertTitle>Sobre este modo</AlertTitle>
                    <AlertDescription>
                        {result.warnings.join(' ')}
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" onClick={generate}>
                    <RefreshCcw aria-hidden="true" />
                    Generar otras
                </Button>
                <Button type="button" variant="outline" onClick={reset}>
                    Limpiar resultados
                </Button>
            </div>
        </div>
    ) : (
        <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed p-8 text-center">
            <div className="space-y-3">
                <KeyRound className="mx-auto size-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                    Configura las opciones y pulsa “Generar contraseñas”.
                </p>
            </div>
        </div>
    );

    return (
        <AivenToolLayout
            tool={tool}
            icon={<KeyRound className="size-7" />}
            favoriteAction={favoriteAction}
            offlineShell={offlineShell}
            related={related}
            result={
                <div className="grid gap-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>No se pudo generar</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {resultPanel}
                </div>
            }
            resultDescription="Generación criptográfica local. AIVEN no recibe ni guarda el resultado."
            helpItems={[
                {
                    question: '¿Cuál modo es más seguro?',
                    answer: 'Una contraseña aleatoria larga ofrece gran entropía. Una frase con muchas palabras es más fácil de memorizar. El modo pronunciable sacrifica algo de imprevisibilidad por facilidad de escritura.',
                },
                {
                    question: '¿La estimación garantiza que no será vulnerada?',
                    answer: 'No. Es una orientación matemática. Reutilización, filtraciones, ataques dirigidos y límites del servicio cambian el riesgo real. Usa una contraseña única y activa autenticación de dos factores.',
                },
                {
                    question: '¿Dónde debo guardar mis contraseñas?',
                    answer: 'Utiliza un administrador de contraseñas confiable. No las envíes por mensajería ni las guardes en notas sin protección.',
                },
            ]}
            privacy={
                <Card className="gap-3 rounded-[1.5rem] border-emerald-500/20 bg-emerald-500/[0.035] py-5">
                    <CardHeader className="px-5">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                            Cero registro
                        </CardTitle>
                        <CardDescription>
                            Se usa Web Crypto en este dispositivo. Las
                            contraseñas no se envían, no entran al historial y
                            desaparecen al cerrar o limpiar la herramienta.
                        </CardDescription>
                    </CardHeader>
                </Card>
            }
        >
            <div className="grid gap-6">
                <div className="grid gap-2">
                    <Label>Modo de generación</Label>
                    <Select
                        value={mode}
                        onValueChange={(value) => {
                            setMode(value as PasswordGenerationMode);
                            setResult(null);
                            setError(null);
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="random">Aleatoria</SelectItem>
                            <SelectItem value="pronounceable">
                                Pronunciable
                            </SelectItem>
                            <SelectItem value="passphrase">
                                Frase de contraseña
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {mode === 'passphrase' ? (
                    <fieldset className="grid gap-4 rounded-2xl border p-4">
                        <legend className="px-2 text-sm font-semibold">
                            Palabras
                        </legend>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between gap-3">
                                <Label htmlFor="password-word-count">
                                    Cantidad de palabras
                                </Label>
                                <output className="text-sm font-semibold">
                                    {wordCount}
                                </output>
                            </div>
                            <input
                                id="password-word-count"
                                type="range"
                                min={3}
                                max={12}
                                value={wordCount}
                                onChange={(event) =>
                                    setWordCount(Number(event.target.value))
                                }
                                className="w-full accent-primary"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password-separator">
                                Separador
                            </Label>
                            <Input
                                id="password-separator"
                                value={separator}
                                maxLength={3}
                                onChange={(event) =>
                                    setSeparator(event.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <ToggleOption
                                checked={capitalizeWords}
                                label="Iniciales mayúsculas"
                                onChange={setCapitalizeWords}
                            />
                            <ToggleOption
                                checked={includePassphraseNumber}
                                label="Incluir número"
                                onChange={setIncludePassphraseNumber}
                            />
                        </div>
                    </fieldset>
                ) : (
                    <fieldset className="grid gap-4 rounded-2xl border p-4">
                        <legend className="px-2 text-sm font-semibold">
                            Caracteres
                        </legend>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between gap-3">
                                <Label htmlFor="password-length">
                                    Longitud
                                </Label>
                                <output className="text-sm font-semibold">
                                    {length}
                                </output>
                            </div>
                            <input
                                id="password-length"
                                type="range"
                                min={6}
                                max={64}
                                value={length}
                                onChange={(event) =>
                                    setLength(Number(event.target.value))
                                }
                                className="w-full accent-primary"
                            />
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <ToggleOption
                                checked={characterOptions.uppercase}
                                label="Mayúsculas A–Z"
                                onChange={(checked) =>
                                    updateCharacterOption('uppercase', checked)
                                }
                            />
                            <ToggleOption
                                checked={characterOptions.lowercase}
                                label="Minúsculas a–z"
                                onChange={(checked) =>
                                    updateCharacterOption('lowercase', checked)
                                }
                            />
                            <ToggleOption
                                checked={characterOptions.numbers}
                                label="Números 0–9"
                                onChange={(checked) =>
                                    updateCharacterOption('numbers', checked)
                                }
                            />
                            <ToggleOption
                                checked={characterOptions.symbols}
                                label="Símbolos"
                                onChange={(checked) =>
                                    updateCharacterOption('symbols', checked)
                                }
                            />
                            <ToggleOption
                                checked={characterOptions.excludeSimilar}
                                label="Excluir Il1O0o"
                                onChange={(checked) =>
                                    updateCharacterOption(
                                        'excludeSimilar',
                                        checked,
                                    )
                                }
                            />
                        </div>
                    </fieldset>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="password-count">Cantidad</Label>
                        <Input
                            id="password-count"
                            type="number"
                            min={1}
                            max={20}
                            value={count}
                            onChange={(event) =>
                                setCount(Number(event.target.value))
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password-excluded">
                            Excluir caracteres específicos
                        </Label>
                        <Input
                            id="password-excluded"
                            value={excludedCharacters}
                            onChange={(event) =>
                                setExcludedCharacters(event.target.value)
                            }
                            placeholder="Ejemplo: {}[]"
                        />
                    </div>
                </div>

                <Button type="button" size="lg" onClick={generate}>
                    <Sparkles aria-hidden="true" />
                    Generar contraseñas
                </Button>
            </div>
        </AivenToolLayout>
    );
}
