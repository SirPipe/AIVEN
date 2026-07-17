import {
    Download,
    FileImage,
    ImageDown,
    RefreshCcw,
    Share2,
    ShieldCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    AivenComparisonSlider,
    AivenImageDropzone,
    formatFileSize,
    SelectedImage,
    useImageObjectUrl,
} from '@/components/tools/image-tool-parts';
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
import {
    historyNumber,
    historyString,
} from '@/lib/tools/history-configuration';
import {
    compressImage,
    disposeProcessedImage,
    inspectImage,
} from '@/lib/tools/image-processing';
import type {
    ImageInfo,
    ProcessedImage,
    SupportedImageMimeType,
} from '@/lib/tools/image-processing';
import type { ToolRuntimeProps } from '@/types/tool-runtime';

type CompressorFormat = 'original' | SupportedImageMimeType;

function downloadProcessed(result: ProcessedImage): void {
    const link = document.createElement('a');

    link.href = result.objectUrl;
    link.download = result.fileName;
    link.click();
}

export default function ImageCompressor({
    favoriteAction,
    initialConfiguration,
    offlineShell,
    recordError,
    recordHistory,
    related,
    tool,
}: ToolRuntimeProps) {
    const [file, setFile] = useState<File | null>(null);
    const [info, setInfo] = useState<ImageInfo | null>(null);
    const originalUrl = useImageObjectUrl(file);
    const [result, setResult] = useState<ProcessedImage | null>(null);
    const [quality, setQuality] = useState(() =>
        historyNumber(initialConfiguration, 'quality', 78, {
            integer: true,
            max: 100,
            min: 1,
        }),
    );
    const [maxDimension, setMaxDimension] = useState(() =>
        historyNumber(initialConfiguration, 'maxDimension', 2560, {
            integer: true,
            max: 8192,
            min: 64,
        }),
    );
    const [targetKilobytes, setTargetKilobytes] = useState(() =>
        historyNumber(initialConfiguration, 'targetKilobytes', 0, {
            integer: true,
            max: 20480,
            min: 0,
        }),
    );
    const [format, setFormat] = useState<CompressorFormat>(() => {
        if (!initialConfiguration?.format) {
            return 'original';
        }

        const savedFormat = historyString(
            initialConfiguration,
            'format',
            ['jpeg', 'jpg', 'png', 'webp'] as const,
            'webp',
        );

        return `image/${savedFormat === 'jpg' ? 'jpeg' : savedFormat}` as SupportedImageMimeType;
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const historyConfiguration = (processed: ProcessedImage) => ({
        format: processed.mimeType.replace('image/', ''),
        maxDimension,
        originalBytes: processed.original.sizeBytes,
        quality,
        resultBytes: processed.sizeBytes,
        targetKilobytes,
    });

    useEffect(() => {
        return () => {
            if (result) {
                disposeProcessedImage(result);
            }
        };
    }, [result]);

    const chooseFile = async (selectedFile: File) => {
        if (result) {
            disposeProcessedImage(result);
            setResult(null);
        }

        setFile(selectedFile);
        setInfo(null);
        setError(null);

        try {
            const inspected = await inspectImage(selectedFile);
            setInfo(inspected);
        } catch (inspectionError) {
            setFile(null);
            setError(
                inspectionError instanceof Error
                    ? inspectionError.message
                    : 'No fue posible leer la imagen.',
            );
        }
    };
    const process = async () => {
        if (!file || !info) {
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const outputMimeType =
                format === 'original' ? info.mimeType : format;
            const targetBytes = targetKilobytes * 1024;
            let currentQuality = quality / 100;
            let candidate: ProcessedImage | null = null;

            for (let attempt = 0; attempt < 6; attempt += 1) {
                const next = await compressImage(file, {
                    outputMimeType,
                    quality: currentQuality,
                    maxWidth: maxDimension,
                    maxHeight: maxDimension,
                    keepOriginalIfLarger: targetBytes === 0,
                });

                if (candidate) {
                    disposeProcessedImage(candidate);
                }

                candidate = next;

                if (
                    targetBytes === 0 ||
                    next.sizeBytes <= targetBytes ||
                    outputMimeType === 'image/png' ||
                    currentQuality <= 0.35
                ) {
                    break;
                }

                currentQuality = Math.max(0.35, currentQuality - 0.1);
            }

            if (!candidate) {
                throw new Error('No fue posible crear el resultado.');
            }

            if (result) {
                disposeProcessedImage(result);
            }

            setResult(candidate);
            recordHistory('completed', historyConfiguration(candidate));
        } catch (processingError) {
            recordError('processing_failed');
            setError(
                processingError instanceof Error
                    ? processingError.message
                    : 'No fue posible comprimir la imagen.',
            );
        } finally {
            setIsProcessing(false);
        }
    };
    const reset = () => {
        if (result) {
            disposeProcessedImage(result);
        }

        setFile(null);
        setInfo(null);
        setResult(null);
        setError(null);
        setQuality(78);
        setMaxDimension(2560);
        setTargetKilobytes(0);
        setFormat('original');
    };
    const share = async () => {
        if (!result || !navigator.share) {
            toast.error('Tu navegador no permite compartir archivos.');

            return;
        }

        try {
            if (
                navigator.canShare &&
                !navigator.canShare({ files: [result.file] })
            ) {
                throw new Error(
                    'Este dispositivo no puede compartir la imagen.',
                );
            }

            await navigator.share({
                files: [result.file],
                title: result.fileName,
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
            toast.error(
                shareError instanceof Error
                    ? shareError.message
                    : 'No fue posible compartir la imagen.',
            );
        }
    };

    const resultPanel =
        result && originalUrl ? (
            <div className="grid gap-5">
                <AivenComparisonSlider
                    beforeUrl={originalUrl}
                    afterUrl={result.objectUrl}
                />

                <dl className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-xl border p-3">
                        <dt className="text-xs text-muted-foreground">
                            Original
                        </dt>
                        <dd className="mt-1 font-semibold">
                            {formatFileSize(result.original.sizeBytes)}
                        </dd>
                    </div>
                    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.035] p-3">
                        <dt className="text-xs text-muted-foreground">
                            Resultado
                        </dt>
                        <dd className="mt-1 font-semibold">
                            {formatFileSize(result.sizeBytes)}
                        </dd>
                    </div>
                    <div className="rounded-xl border p-3">
                        <dt className="text-xs text-muted-foreground">
                            Reducción
                        </dt>
                        <dd className="mt-1 font-semibold">
                            {result.reductionPercent > 0
                                ? `${result.reductionPercent}%`
                                : 'Sin reducción'}
                        </dd>
                    </div>
                    <div className="rounded-xl border p-3">
                        <dt className="text-xs text-muted-foreground">
                            Resolución
                        </dt>
                        <dd className="mt-1 font-semibold">
                            {result.width} × {result.height}
                        </dd>
                    </div>
                </dl>

                {result.warnings.length > 0 && (
                    <Alert>
                        <FileImage aria-hidden="true" />
                        <AlertTitle>Detalles del procesamiento</AlertTitle>
                        <AlertDescription>
                            {result.warnings.join(' ')}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                        type="button"
                        onClick={() => {
                            downloadProcessed(result);
                            recordHistory(
                                'downloaded',
                                historyConfiguration(result),
                            );
                        }}
                    >
                        <Download aria-hidden="true" />
                        Descargar
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => void share()}
                    >
                        <Share2 aria-hidden="true" />
                        Compartir
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="sm:col-span-2"
                        onClick={reset}
                    >
                        <RefreshCcw aria-hidden="true" />
                        Procesar otra imagen
                    </Button>
                </div>
            </div>
        ) : (
            <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed p-8 text-center">
                <div className="space-y-3">
                    <ImageDown className="mx-auto size-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        El resultado y la comparación aparecerán aquí.
                    </p>
                </div>
            </div>
        );

    return (
        <AivenToolLayout
            tool={tool}
            icon={<ImageDown className="size-7" />}
            favoriteAction={favoriteAction}
            offlineShell={offlineShell}
            related={related}
            result={
                <div className="grid gap-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>No se pudo procesar</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {resultPanel}
                </div>
            }
            resultDescription="Compara el archivo original con el resultado generado localmente."
            helpItems={[
                {
                    question: '¿Qué ocurre con los metadatos?',
                    answer: 'Canvas recodifica los píxeles y elimina metadatos no visuales, como EXIF y ubicación. AIVEN no promete conservarlos porque los navegadores no ofrecen una API uniforme y segura para hacerlo.',
                },
                {
                    question:
                        '¿Por qué PNG no cambia con el control de calidad?',
                    answer: 'El navegador no expone un nivel de compresión PNG. Para fotografías, JPG o WebP suelen reducir mucho más el peso; conserva PNG cuando necesites transparencia o gráficos nítidos.',
                },
                {
                    question: '¿Se admiten imágenes animadas?',
                    answer: 'No. Una imagen animada se convertiría en un solo fotograma. AIVEN trabaja con JPG, PNG y WebP estáticos de hasta 20 MB y 40 megapíxeles.',
                },
            ]}
            privacy={
                <Card className="gap-3 rounded-[1.5rem] border-emerald-500/20 bg-emerald-500/[0.035] py-5">
                    <CardHeader className="px-5">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                            La imagen no se sube
                        </CardTitle>
                        <CardDescription>
                            Lectura, compresión, comparación y descarga ocurren
                            en la memoria de tu navegador. Los archivos se
                            liberan al salir o reiniciar.
                        </CardDescription>
                    </CardHeader>
                </Card>
            }
        >
            <div className="grid gap-6">
                {!file ? (
                    <AivenImageDropzone
                        onFiles={(files) => void chooseFile(files[0])}
                        disabled={isProcessing}
                    />
                ) : (
                    <SelectedImage
                        file={file}
                        onRemove={isProcessing ? undefined : reset}
                        actions={
                            info ? (
                                <Badge variant="outline">
                                    {info.width} × {info.height}
                                </Badge>
                            ) : undefined
                        }
                    />
                )}

                <fieldset
                    className="grid gap-4 rounded-2xl border p-4 disabled:opacity-60"
                    disabled={!file || !info || isProcessing}
                >
                    <legend className="px-2 text-sm font-semibold">
                        Compresión
                    </legend>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="compress-quality">Calidad</Label>
                            <output className="text-sm font-semibold">
                                {quality}%
                            </output>
                        </div>
                        <input
                            id="compress-quality"
                            type="range"
                            min={35}
                            max={95}
                            value={quality}
                            onChange={(event) =>
                                setQuality(Number(event.target.value))
                            }
                            className="w-full accent-primary"
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="compress-max-dimension">
                                Lado máximo
                            </Label>
                            <Input
                                id="compress-max-dimension"
                                type="number"
                                min={320}
                                max={8192}
                                value={maxDimension}
                                onChange={(event) =>
                                    setMaxDimension(Number(event.target.value))
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="compress-target">
                                Peso máximo deseado (KB)
                            </Label>
                            <Input
                                id="compress-target"
                                type="number"
                                min={0}
                                max={20_480}
                                value={targetKilobytes}
                                onChange={(event) =>
                                    setTargetKilobytes(
                                        Number(event.target.value),
                                    )
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                0 desactiva el objetivo. Es aproximado.
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Formato de salida</Label>
                        <Select
                            value={format}
                            onValueChange={(value) =>
                                setFormat(value as CompressorFormat)
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="original">
                                    Conservar formato
                                </SelectItem>
                                <SelectItem value="image/jpeg">JPG</SelectItem>
                                <SelectItem value="image/webp">WebP</SelectItem>
                                <SelectItem value="image/png">PNG</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Alert>
                        <FileImage aria-hidden="true" />
                        <AlertTitle>Metadatos eliminados</AlertTitle>
                        <AlertDescription>
                            El procesamiento local con Canvas no puede conservar
                            EXIF de forma fiable. No se sube ninguna copia al
                            servidor.
                        </AlertDescription>
                    </Alert>
                </fieldset>

                <Button
                    type="button"
                    size="lg"
                    disabled={!file || !info || isProcessing}
                    onClick={() => void process()}
                >
                    <ImageDown aria-hidden="true" />
                    {isProcessing ? 'Comprimiendo…' : 'Comprimir imagen'}
                </Button>
            </div>
        </AivenToolLayout>
    );
}
