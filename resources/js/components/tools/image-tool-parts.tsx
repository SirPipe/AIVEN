import { ClipboardPaste, ImageIcon, UploadCloud, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ClipboardEvent, DragEvent, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function useImageObjectUrl(file: File | null): string | null {
    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        if (!file) {
            queueMicrotask(() => {
                if (isActive) {
                    setObjectUrl(null);
                }
            });

            return () => {
                isActive = false;
            };
        }

        const nextObjectUrl = URL.createObjectURL(file);

        queueMicrotask(() => {
            if (isActive) {
                setObjectUrl(nextObjectUrl);
            }
        });

        return () => {
            isActive = false;
            URL.revokeObjectURL(nextObjectUrl);
        };
    }, [file]);

    return objectUrl;
}

type AivenImageDropzoneProps = {
    description?: string;
    disabled?: boolean;
    maxFiles?: number;
    multiple?: boolean;
    onFiles: (files: File[]) => void;
};

export function AivenImageDropzone({
    description = 'JPG, PNG o WebP · máximo 20 MB y 40 MP por archivo',
    disabled = false,
    maxFiles = 1,
    multiple = false,
    onFiles,
}: AivenImageDropzoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const acceptFiles = (files: File[]) => {
        const images = files
            .filter((file) => acceptedImageTypes.includes(file.type))
            .slice(0, maxFiles);

        if (images.length > 0) {
            onFiles(images);
        }
    };
    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);

        if (!disabled) {
            acceptFiles([...event.dataTransfer.files]);
        }
    };
    const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
        if (disabled) {
            return;
        }

        const files = [...event.clipboardData.items]
            .filter((item) => item.kind === 'file')
            .map((item) => item.getAsFile())
            .filter((file): file is File => file !== null);

        if (files.length > 0) {
            event.preventDefault();
            acceptFiles(files);
        }
    };

    return (
        <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            className={cn(
                'grid min-h-52 cursor-pointer place-items-center rounded-2xl border border-dashed p-6 text-center transition-[border-color,background-color] outline-none hover:border-primary/40 hover:bg-primary/[0.025] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none',
                isDragging && 'border-primary bg-primary/[0.06]',
                disabled && 'cursor-not-allowed opacity-60',
            )}
            onClick={() => !disabled && inputRef.current?.click()}
            onKeyDown={(event) => {
                if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    inputRef.current?.click();
                }
            }}
            onDragEnter={(event) => {
                event.preventDefault();

                if (!disabled) {
                    setIsDragging(true);
                }
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onPaste={handlePaste}
        >
            <div className="space-y-4">
                <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <UploadCloud className="size-6" aria-hidden="true" />
                </span>
                <div className="space-y-1">
                    <p className="text-sm font-semibold">
                        Arrastra {multiple ? 'tus imágenes' : 'una imagen'} o
                        selecciónala
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        {description}
                    </p>
                </div>
                <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <ClipboardPaste className="size-3.5" aria-hidden="true" />
                    También puedes pegar desde el portapapeles
                </span>
            </div>
            <input
                ref={inputRef}
                type="file"
                accept={acceptedImageTypes.join(',')}
                multiple={multiple}
                disabled={disabled}
                className="sr-only"
                onChange={(event) => {
                    acceptFiles([...(event.target.files ?? [])]);
                    event.target.value = '';
                }}
            />
        </div>
    );
}

export function SelectedImage({
    file,
    onRemove,
    actions,
}: {
    actions?: ReactNode;
    file: File;
    onRemove?: () => void;
}) {
    const previewUrl = useImageObjectUrl(file);

    return (
        <div className="flex items-center gap-3 rounded-2xl border p-3">
            <span className="flex size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt="Vista previa de la imagen seleccionada"
                        className="size-full object-cover"
                    />
                ) : (
                    <ImageIcon className="m-auto size-5 text-muted-foreground" />
                )}
            </span>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatFileSize(file.size)} ·{' '}
                    {file.type || 'tipo desconocido'}
                </p>
            </div>
            {actions}
            {onRemove && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    aria-label={`Quitar ${file.name}`}
                    onClick={onRemove}
                >
                    <X aria-hidden="true" />
                </Button>
            )}
        </div>
    );
}

export function AivenComparisonSlider({
    afterUrl,
    beforeUrl,
}: {
    afterUrl: string;
    beforeUrl: string;
}) {
    const [position, setPosition] = useState(50);

    return (
        <div className="grid gap-3">
            <div className="relative aspect-video overflow-hidden rounded-2xl border bg-muted">
                <img
                    src={beforeUrl}
                    alt="Imagen original"
                    className="absolute inset-0 size-full object-contain"
                />
                <div
                    className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white shadow-lg"
                    style={{ width: `${position}%` }}
                >
                    <img
                        src={afterUrl}
                        alt="Imagen procesada"
                        className="absolute inset-y-0 left-0 h-full max-w-none object-contain"
                        style={{ width: `${10000 / position}%` }}
                    />
                </div>
                <span className="absolute top-3 left-3 rounded-full bg-black/70 px-2 py-1 text-[0.65rem] font-semibold text-white">
                    Procesada
                </span>
                <span className="absolute top-3 right-3 rounded-full bg-black/70 px-2 py-1 text-[0.65rem] font-semibold text-white">
                    Original
                </span>
            </div>
            <div className="grid gap-1.5">
                <label
                    htmlFor="image-comparison"
                    className="text-xs font-medium"
                >
                    Comparar antes y después
                </label>
                <input
                    id="image-comparison"
                    type="range"
                    min={5}
                    max={95}
                    value={position}
                    onChange={(event) =>
                        setPosition(Number(event.target.value))
                    }
                    className="w-full accent-primary"
                />
            </div>
        </div>
    );
}
