import {
    Download,
    FileImage,
    Images,
    RefreshCcw,
    Share2,
    ShieldCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    AivenImageDropzone,
    formatFileSize,
    SelectedImage,
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
    historyColor,
    historyNumber,
    historyString,
} from '@/lib/tools/history-configuration';
import {
    convertImage,
    disposeProcessedImage,
    validateImageBatch,
} from '@/lib/tools/image-processing';
import type {
    ProcessedImage,
    SupportedImageMimeType,
} from '@/lib/tools/image-processing';
import type { ToolRuntimeProps } from '@/types/tool-runtime';

function downloadImage(result: ProcessedImage): void {
    const link = document.createElement('a');

    link.href = result.objectUrl;
    link.download = result.fileName;
    link.click();
}

const formatLabels: Record<SupportedImageMimeType, string> = {
    'image/jpeg': 'JPG',
    'image/png': 'PNG',
    'image/webp': 'WebP',
};

export default function ImageConverter({
    favoriteAction,
    initialConfiguration,
    offlineShell,
    recordError,
    recordHistory,
    related,
    tool,
}: ToolRuntimeProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [results, setResults] = useState<ProcessedImage[]>([]);
    const [targetMimeType, setTargetMimeType] =
        useState<SupportedImageMimeType>(() => {
            const savedFormat = historyString(
                initialConfiguration,
                'targetFormat',
                ['jpeg', 'jpg', 'png', 'webp'] as const,
                'webp',
            );

            return `image/${savedFormat === 'jpg' ? 'jpeg' : savedFormat}` as SupportedImageMimeType;
        });
    const [quality, setQuality] = useState(() =>
        historyNumber(initialConfiguration, 'quality', 88, {
            integer: true,
            max: 100,
            min: 1,
        }),
    );
    const [backgroundColor, setBackgroundColor] = useState(() =>
        historyColor(initialConfiguration, 'backgroundColor', '#ffffff'),
    );
    const [resizeEnabled, setResizeEnabled] = useState(
        initialConfiguration?.resizeEnabled === true,
    );
    const [maxDimension, setMaxDimension] = useState(() =>
        historyNumber(initialConfiguration, 'maxDimension', 1920, {
            integer: true,
            max: 8192,
            min: 64,
        }),
    );
    const [fileName, setFileName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const historyConfiguration = (
        processedImages: readonly ProcessedImage[],
    ) => ({
        backgroundColor,
        maxDimension,
        originalBytes: processedImages.reduce(
            (total, result) => total + result.original.sizeBytes,
            0,
        ),
        quality,
        resizeEnabled,
        resultBytes: processedImages.reduce(
            (total, result) => total + result.sizeBytes,
            0,
        ),
        sourceFormat: processedImages[0].original.mimeType.replace(
            'image/',
            '',
        ),
        targetFormat: processedImages[0].mimeType.replace('image/', ''),
    });

    useEffect(() => {
        return () => {
            results.forEach(disposeProcessedImage);
        };
    }, [results]);

    const addFiles = (newFiles: File[]) => {
        const nextFiles = [...files, ...newFiles];

        try {
            validateImageBatch(nextFiles);
            results.forEach(disposeProcessedImage);
            setResults([]);
            setFiles(nextFiles);
            setError(null);
        } catch (batchError) {
            setError(
                batchError instanceof Error
                    ? batchError.message
                    : 'No fue posible agregar esas imágenes.',
            );
        }
    };
    const reset = () => {
        results.forEach(disposeProcessedImage);
        setFiles([]);
        setResults([]);
        setTargetMimeType('image/webp');
        setQuality(88);
        setBackgroundColor('#ffffff');
        setResizeEnabled(false);
        setMaxDimension(1920);
        setFileName('');
        setProgress(0);
        setError(null);
    };
    const process = async () => {
        if (files.length === 0) {
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setError(null);
        results.forEach(disposeProcessedImage);
        setResults([]);
        const converted: ProcessedImage[] = [];

        try {
            for (let index = 0; index < files.length; index += 1) {
                const source = files[index];
                const processed = await convertImage(source, {
                    targetMimeType,
                    quality: quality / 100,
                    backgroundColor:
                        targetMimeType === 'image/jpeg'
                            ? backgroundColor
                            : undefined,
                    maxWidth: resizeEnabled ? maxDimension : undefined,
                    maxHeight: resizeEnabled ? maxDimension : undefined,
                    fileName:
                        files.length === 1 && fileName.trim()
                            ? fileName.trim()
                            : source.name,
                });

                converted.push(processed);
                setProgress(Math.round(((index + 1) / files.length) * 100));
            }

            setResults(converted);
            recordHistory('completed', historyConfiguration(converted));
        } catch (processingError) {
            converted.forEach(disposeProcessedImage);
            recordError('processing_failed');
            setError(
                processingError instanceof Error
                    ? processingError.message
                    : 'No fue posible convertir las imágenes.',
            );
        } finally {
            setIsProcessing(false);
        }
    };
    const share = async (result: ProcessedImage) => {
        if (!navigator.share) {
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
            recordHistory('shared', historyConfiguration([result]));
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
        results.length > 0 ? (
            <div className="grid gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="secondary">
                        {results.length}{' '}
                        {results.length === 1
                            ? 'imagen convertida'
                            : 'imágenes convertidas'}
                    </Badge>
                    {results.length > 1 && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                results.forEach(downloadImage);
                                recordHistory(
                                    'downloaded',
                                    historyConfiguration(results),
                                );
                            }}
                        >
                            <Download aria-hidden="true" />
                            Descargar todas
                        </Button>
                    )}
                </div>

                <div className="grid gap-3">
                    {results.map((result) => (
                        <article
                            key={result.objectUrl}
                            className="grid gap-3 rounded-2xl border p-3 sm:grid-cols-[6rem_1fr]"
                        >
                            <img
                                src={result.objectUrl}
                                alt={`Vista previa de ${result.fileName}`}
                                className="aspect-square w-full rounded-xl bg-muted object-contain"
                            />
                            <div className="min-w-0 space-y-3">
                                <div>
                                    <p className="truncate text-sm font-semibold">
                                        {result.fileName}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {formatLabels[result.original.mimeType]}{' '}
                                        → {formatLabels[result.mimeType]} ·{' '}
                                        {result.width} × {result.height}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {formatFileSize(
                                            result.original.sizeBytes,
                                        )}{' '}
                                        → {formatFileSize(result.sizeBytes)}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => {
                                            downloadImage(result);
                                            recordHistory(
                                                'downloaded',
                                                historyConfiguration([result]),
                                            );
                                        }}
                                    >
                                        <Download aria-hidden="true" />
                                        Descargar
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => void share(result)}
                                    >
                                        <Share2 aria-hidden="true" />
                                        Compartir
                                    </Button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {results.length > 1 && (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        Las descargas se entregan individualmente. AIVEN no crea
                        un ZIP para evitar añadir tus imágenes a un contenedor
                        temporal.
                    </p>
                )}

                <Button type="button" variant="outline" onClick={reset}>
                    <RefreshCcw aria-hidden="true" />
                    Convertir otras imágenes
                </Button>
            </div>
        ) : (
            <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed p-8 text-center">
                <div className="space-y-3">
                    <Images className="mx-auto size-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        Las imágenes convertidas aparecerán aquí.
                    </p>
                </div>
            </div>
        );

    return (
        <AivenToolLayout
            tool={tool}
            icon={<Images className="size-7" />}
            favoriteAction={favoriteAction}
            offlineShell={offlineShell}
            related={related}
            result={
                <div className="grid gap-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>No se pudo convertir</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {isProcessing && (
                        <div className="grid gap-2" role="status">
                            <div className="flex items-center justify-between text-xs">
                                <span>Procesando localmente…</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-primary transition-[width] motion-reduce:transition-none"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                    {resultPanel}
                </div>
            }
            resultDescription="Conversión por lotes en el navegador, con vista previa y descarga individual."
            helpItems={[
                {
                    question: '¿Qué conversiones funcionan?',
                    answer: 'JPG, PNG y WebP pueden convertirse entre sí cuando el navegador admite el formato de salida. AIVEN verifica el MIME real y no finge una conversión si WebP no está disponible.',
                },
                {
                    question: '¿Qué pasa con la transparencia al usar JPG?',
                    answer: 'JPG no admite transparencia. AIVEN rellena esas áreas con el color de fondo que elijas.',
                },
                {
                    question: '¿Se conservan resolución y metadatos?',
                    answer: 'La resolución se conserva salvo que actives redimensionamiento. Canvas elimina metadatos no visuales y las animaciones se reducirían a un fotograma.',
                },
            ]}
            privacy={
                <Card className="gap-3 rounded-[1.5rem] border-emerald-500/20 bg-emerald-500/[0.035] py-5">
                    <CardHeader className="px-5">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                            Conversión privada
                        </CardTitle>
                        <CardDescription>
                            Hasta cinco imágenes y 50 MB por lote se procesan
                            una por una en tu dispositivo. No se suben, no se
                            guardan y sus nombres no entran al historial.
                        </CardDescription>
                    </CardHeader>
                </Card>
            }
        >
            <div className="grid gap-6">
                {files.length < 5 && (
                    <AivenImageDropzone
                        multiple
                        maxFiles={5 - files.length}
                        disabled={isProcessing}
                        onFiles={addFiles}
                        description={`JPG, PNG o WebP · puedes agregar ${5 - files.length} archivo${5 - files.length === 1 ? '' : 's'} más`}
                    />
                )}

                {files.length > 0 && (
                    <div className="grid gap-2">
                        {files.map((file, index) => (
                            <SelectedImage
                                key={`${file.name}-${file.lastModified}-${index}`}
                                file={file}
                                onRemove={
                                    isProcessing
                                        ? undefined
                                        : () => {
                                              setFiles((current) =>
                                                  current.filter(
                                                      (_, fileIndex) =>
                                                          fileIndex !== index,
                                                  ),
                                              );
                                              results.forEach(
                                                  disposeProcessedImage,
                                              );
                                              setResults([]);
                                          }
                                }
                            />
                        ))}
                    </div>
                )}

                <fieldset
                    className="grid gap-4 rounded-2xl border p-4 disabled:opacity-60"
                    disabled={files.length === 0 || isProcessing}
                >
                    <legend className="px-2 text-sm font-semibold">
                        Salida
                    </legend>
                    <div className="grid gap-2">
                        <Label>Formato final</Label>
                        <Select
                            value={targetMimeType}
                            onValueChange={(value) =>
                                setTargetMimeType(
                                    value as SupportedImageMimeType,
                                )
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="image/jpeg">JPG</SelectItem>
                                <SelectItem value="image/png">PNG</SelectItem>
                                <SelectItem value="image/webp">WebP</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="convert-quality">Calidad</Label>
                            <output className="text-sm font-semibold">
                                {quality}%
                            </output>
                        </div>
                        <input
                            id="convert-quality"
                            type="range"
                            min={35}
                            max={100}
                            value={quality}
                            disabled={targetMimeType === 'image/png'}
                            onChange={(event) =>
                                setQuality(Number(event.target.value))
                            }
                            className="w-full accent-primary disabled:opacity-50"
                        />
                    </div>
                    {targetMimeType === 'image/jpeg' && (
                        <div className="grid gap-2">
                            <Label htmlFor="convert-background">
                                Fondo para transparencia
                            </Label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={backgroundColor}
                                    onChange={(event) =>
                                        setBackgroundColor(event.target.value)
                                    }
                                    className="h-9 w-12 rounded-md border bg-transparent p-1"
                                    aria-label="Elegir color de fondo"
                                />
                                <Input
                                    id="convert-background"
                                    value={backgroundColor}
                                    onChange={(event) =>
                                        setBackgroundColor(event.target.value)
                                    }
                                />
                            </div>
                        </div>
                    )}
                    <label className="flex min-h-11 items-center gap-3 rounded-xl border px-3 text-sm">
                        <input
                            type="checkbox"
                            checked={resizeEnabled}
                            onChange={(event) =>
                                setResizeEnabled(event.target.checked)
                            }
                            className="size-4 accent-primary"
                        />
                        Redimensionar manteniendo proporción
                    </label>
                    {resizeEnabled && (
                        <div className="grid gap-2">
                            <Label htmlFor="convert-max-dimension">
                                Lado máximo en píxeles
                            </Label>
                            <Input
                                id="convert-max-dimension"
                                type="number"
                                min={320}
                                max={8192}
                                value={maxDimension}
                                onChange={(event) =>
                                    setMaxDimension(Number(event.target.value))
                                }
                            />
                        </div>
                    )}
                    {files.length === 1 && (
                        <div className="grid gap-2">
                            <Label htmlFor="convert-file-name">
                                Nombre final (opcional)
                            </Label>
                            <Input
                                id="convert-file-name"
                                value={fileName}
                                onChange={(event) =>
                                    setFileName(event.target.value)
                                }
                                placeholder="mi-imagen"
                            />
                        </div>
                    )}
                    <Alert>
                        <FileImage aria-hidden="true" />
                        <AlertTitle>Metadatos eliminados</AlertTitle>
                        <AlertDescription>
                            La recodificación local elimina EXIF y otros datos
                            no visuales. La imagen completa nunca se guarda en
                            AIVEN.
                        </AlertDescription>
                    </Alert>
                </fieldset>

                <Button
                    type="button"
                    size="lg"
                    disabled={files.length === 0 || isProcessing}
                    onClick={() => void process()}
                >
                    <Images aria-hidden="true" />
                    {isProcessing
                        ? `Convirtiendo ${progress}%…`
                        : `Convertir ${files.length || ''} ${files.length === 1 ? 'imagen' : 'imágenes'}`}
                </Button>
            </div>
        </AivenToolLayout>
    );
}
