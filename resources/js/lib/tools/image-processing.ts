export type SupportedImageMimeType = 'image/jpeg' | 'image/png' | 'image/webp';

export type ImageProcessingErrorCode =
    | 'empty-file'
    | 'file-too-large'
    | 'batch-too-large'
    | 'too-many-files'
    | 'unsupported-format'
    | 'mime-mismatch'
    | 'decode-failed'
    | 'resolution-too-large'
    | 'invalid-dimensions'
    | 'canvas-unavailable'
    | 'encode-failed'
    | 'unsupported-output-format';

export class ImageProcessingError extends Error {
    public readonly code: ImageProcessingErrorCode;

    public constructor(code: ImageProcessingErrorCode, message: string) {
        super(message);
        this.code = code;
        this.name = 'ImageProcessingError';
    }
}

export interface ImageInfo {
    fileName: string;
    sizeBytes: number;
    mimeType: SupportedImageMimeType;
    width: number;
    height: number;
    megapixels: number;
    lastModified: number;
}

interface ImageTransformOptions {
    width?: number;
    height?: number;
    maxWidth?: number;
    maxHeight?: number;
    preserveAspectRatio?: boolean;
    allowUpscale?: boolean;
    quality?: number;
    backgroundColor?: string;
    fileName?: string;
}

export interface ImageCompressionOptions extends ImageTransformOptions {
    outputMimeType?: SupportedImageMimeType;
    keepOriginalIfLarger?: boolean;
}

export interface ImageConversionOptions extends ImageTransformOptions {
    targetMimeType: SupportedImageMimeType;
}

export interface ProcessedImage {
    blob: Blob;
    file: File;
    fileName: string;
    objectUrl: string;
    mimeType: SupportedImageMimeType;
    width: number;
    height: number;
    sizeBytes: number;
    original: ImageInfo;
    reductionBytes: number;
    reductionPercent: number;
    wasTransformed: boolean;
    warnings: string[];
}

interface DecodedImage {
    source: CanvasImageSource;
    width: number;
    height: number;
    dispose: () => void;
}

interface InspectedDecodedImage {
    info: ImageInfo;
    decoded: DecodedImage;
}

interface ImageDimensions {
    width: number;
    height: number;
}

export const MAX_IMAGE_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_IMAGE_BATCH_BYTES = 50 * 1024 * 1024;
export const MAX_IMAGE_BATCH_FILES = 5;
export const MAX_IMAGE_PIXELS = 40_000_000;
export const SUPPORTED_IMAGE_MIME_TYPES: readonly SupportedImageMimeType[] =
    Object.freeze(['image/jpeg', 'image/png', 'image/webp']);

const disposedResults = new WeakSet<ProcessedImage>();

export function validateImageBatch(files: readonly File[]): void {
    if (files.length > MAX_IMAGE_BATCH_FILES) {
        throw new ImageProcessingError(
            'too-many-files',
            `Puedes procesar hasta ${MAX_IMAGE_BATCH_FILES} imágenes a la vez.`,
        );
    }

    const totalBytes = files.reduce((total, file) => total + file.size, 0);

    if (totalBytes > MAX_IMAGE_BATCH_BYTES) {
        throw new ImageProcessingError(
            'batch-too-large',
            'El lote supera el límite total de 50 MB. Procesa menos imágenes para reducir el uso de memoria.',
        );
    }
}

export async function inspectImage(file: File): Promise<ImageInfo> {
    const inspected = await inspectAndDecode(file);

    try {
        return inspected.info;
    } finally {
        inspected.decoded.dispose();
    }
}

export async function compressImage(
    file: File,
    options: ImageCompressionOptions = {},
): Promise<ProcessedImage> {
    const inspected = await inspectAndDecode(file);
    const targetMimeType = options.outputMimeType ?? inspected.info.mimeType;

    try {
        const processed = await transformImage(
            file,
            inspected,
            targetMimeType,
            options,
        );
        const dimensionsChanged =
            processed.width !== inspected.info.width ||
            processed.height !== inspected.info.height;
        const canRetainOriginal =
            !dimensionsChanged &&
            targetMimeType === inspected.info.mimeType &&
            !options.backgroundColor;

        if (
            (options.keepOriginalIfLarger ?? true) &&
            canRetainOriginal &&
            processed.blob.size >= file.size
        ) {
            disposeProcessedImage(processed);

            return createProcessedImage({
                blob: file,
                fileName: file.name,
                width: inspected.info.width,
                height: inspected.info.height,
                original: inspected.info,
                wasTransformed: false,
                warnings: [
                    'La recodificación no redujo el tamaño; se conservó el archivo original.',
                ],
            });
        }

        return processed;
    } finally {
        inspected.decoded.dispose();
    }
}

export async function convertImage(
    file: File,
    options: ImageConversionOptions,
): Promise<ProcessedImage> {
    const inspected = await inspectAndDecode(file);

    try {
        return await transformImage(
            file,
            inspected,
            options.targetMimeType,
            options,
        );
    } finally {
        inspected.decoded.dispose();
    }
}

export function disposeProcessedImage(result: ProcessedImage): void {
    if (disposedResults.has(result)) {
        return;
    }

    URL.revokeObjectURL(result.objectUrl);
    disposedResults.add(result);
}

async function inspectAndDecode(file: File): Promise<InspectedDecodedImage> {
    const mimeType = await validateImageFile(file);
    const encodedDimensions = await readEncodedDimensions(file, mimeType);

    if (encodedDimensions) {
        validateImageDimensions(
            encodedDimensions.width,
            encodedDimensions.height,
        );
    }

    const decoded = await decodeImage(file);

    try {
        validateImageDimensions(decoded.width, decoded.height);

        return {
            info: {
                fileName: file.name,
                sizeBytes: file.size,
                mimeType,
                width: decoded.width,
                height: decoded.height,
                megapixels:
                    Math.round((decoded.width * decoded.height) / 10_000) / 100,
                lastModified: file.lastModified,
            },
            decoded,
        };
    } catch (error) {
        decoded.dispose();

        throw error;
    }
}

async function readEncodedDimensions(
    file: File,
    mimeType: SupportedImageMimeType,
): Promise<ImageDimensions | null> {
    if (mimeType === 'image/png') {
        const bytes = new Uint8Array(await file.slice(0, 24).arrayBuffer());

        if (bytes.length < 24) {
            return null;
        }

        const view = new DataView(
            bytes.buffer,
            bytes.byteOffset,
            bytes.byteLength,
        );

        return {
            width: view.getUint32(16),
            height: view.getUint32(20),
        };
    }

    if (mimeType === 'image/webp') {
        const bytes = new Uint8Array(
            await file.slice(0, Math.min(file.size, 1_048_576)).arrayBuffer(),
        );

        return readWebpDimensions(bytes);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());

    return readJpegDimensions(bytes);
}

function readJpegDimensions(bytes: Uint8Array): ImageDimensions | null {
    const startOfFrameMarkers = new Set([
        0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce,
        0xcf,
    ]);
    let offset = 2;

    while (offset + 8 < bytes.length) {
        if (bytes[offset] !== 0xff) {
            offset += 1;

            continue;
        }

        while (offset < bytes.length && bytes[offset] === 0xff) {
            offset += 1;
        }

        const marker = bytes[offset];

        offset += 1;

        if (marker === 0xd9 || marker === 0xda) {
            break;
        }

        if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
            continue;
        }

        if (offset + 1 >= bytes.length) {
            break;
        }

        const segmentLength = (bytes[offset] << 8) | bytes[offset + 1];

        if (segmentLength < 2 || offset + segmentLength > bytes.length) {
            break;
        }

        if (startOfFrameMarkers.has(marker) && segmentLength >= 7) {
            return {
                height: (bytes[offset + 3] << 8) | bytes[offset + 4],
                width: (bytes[offset + 5] << 8) | bytes[offset + 6],
            };
        }

        offset += segmentLength;
    }

    return null;
}

function readWebpDimensions(bytes: Uint8Array): ImageDimensions | null {
    let offset = 12;

    while (offset + 8 <= bytes.length) {
        const chunkType = asciiAt(bytes, offset, offset + 4);
        const chunkSize = readLittleEndianUint32(bytes, offset + 4);
        const dataOffset = offset + 8;

        if (chunkType === 'VP8X' && dataOffset + 10 <= bytes.length) {
            return {
                width:
                    1 +
                    bytes[dataOffset + 4] +
                    (bytes[dataOffset + 5] << 8) +
                    (bytes[dataOffset + 6] << 16),
                height:
                    1 +
                    bytes[dataOffset + 7] +
                    (bytes[dataOffset + 8] << 8) +
                    (bytes[dataOffset + 9] << 16),
            };
        }

        if (
            chunkType === 'VP8L' &&
            dataOffset + 5 <= bytes.length &&
            bytes[dataOffset] === 0x2f
        ) {
            const first = bytes[dataOffset + 1];
            const second = bytes[dataOffset + 2];
            const third = bytes[dataOffset + 3];
            const fourth = bytes[dataOffset + 4];

            return {
                width: 1 + (((second & 0x3f) << 8) | first),
                height:
                    1 +
                    ((fourth & 0x0f) << 10) +
                    (third << 2) +
                    ((second & 0xc0) >> 6),
            };
        }

        if (
            chunkType === 'VP8 ' &&
            dataOffset + 10 <= bytes.length &&
            bytes[dataOffset + 3] === 0x9d &&
            bytes[dataOffset + 4] === 0x01 &&
            bytes[dataOffset + 5] === 0x2a
        ) {
            return {
                width:
                    (bytes[dataOffset + 6] | (bytes[dataOffset + 7] << 8)) &
                    0x3fff,
                height:
                    (bytes[dataOffset + 8] | (bytes[dataOffset + 9] << 8)) &
                    0x3fff,
            };
        }

        offset = dataOffset + chunkSize + (chunkSize % 2);
    }

    return null;
}

function readLittleEndianUint32(bytes: Uint8Array, offset: number): number {
    if (offset + 4 > bytes.length) {
        return 0;
    }

    return (
        (bytes[offset] |
            (bytes[offset + 1] << 8) |
            (bytes[offset + 2] << 16) |
            (bytes[offset + 3] << 24)) >>>
        0
    );
}

async function validateImageFile(file: File): Promise<SupportedImageMimeType> {
    if (file.size === 0) {
        throw new ImageProcessingError('empty-file', 'El archivo está vacío.');
    }

    if (file.size > MAX_IMAGE_FILE_BYTES) {
        throw new ImageProcessingError(
            'file-too-large',
            'El archivo supera el límite de 20 MB.',
        );
    }

    const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const detectedMimeType = detectMimeType(header);

    if (!detectedMimeType) {
        throw new ImageProcessingError(
            'unsupported-format',
            'El contenido no corresponde a una imagen JPG, PNG o WebP válida.',
        );
    }

    const declaredMimeType = normalizeDeclaredMimeType(file.type);

    if (declaredMimeType && declaredMimeType !== detectedMimeType) {
        throw new ImageProcessingError(
            'mime-mismatch',
            `El tipo declarado (${file.type}) no coincide con el contenido (${detectedMimeType}).`,
        );
    }

    if (file.type && !declaredMimeType) {
        throw new ImageProcessingError(
            'unsupported-format',
            `El tipo declarado “${file.type}” no está admitido.`,
        );
    }

    return detectedMimeType;
}

function detectMimeType(header: Uint8Array): SupportedImageMimeType | null {
    if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
        return 'image/jpeg';
    }

    if (
        header[0] === 0x89 &&
        header[1] === 0x50 &&
        header[2] === 0x4e &&
        header[3] === 0x47 &&
        header[4] === 0x0d &&
        header[5] === 0x0a &&
        header[6] === 0x1a &&
        header[7] === 0x0a
    ) {
        return 'image/png';
    }

    if (asciiAt(header, 0, 4) === 'RIFF' && asciiAt(header, 8, 12) === 'WEBP') {
        return 'image/webp';
    }

    return null;
}

function normalizeDeclaredMimeType(
    mimeType: string,
): SupportedImageMimeType | null {
    const normalized = mimeType.toLocaleLowerCase('en');

    if (normalized === 'image/jpg') {
        return 'image/jpeg';
    }

    return (
        SUPPORTED_IMAGE_MIME_TYPES.find((type) => type === normalized) ?? null
    );
}

async function decodeImage(file: File): Promise<DecodedImage> {
    if ('createImageBitmap' in globalThis) {
        try {
            const bitmap = await createImageBitmap(file, {
                imageOrientation: 'from-image',
            });

            return {
                source: bitmap,
                width: bitmap.width,
                height: bitmap.height,
                dispose: () => bitmap.close(),
            };
        } catch {
            // Continue with the HTMLImageElement fallback below.
        }
    }

    if (typeof document === 'undefined') {
        throw new ImageProcessingError(
            'decode-failed',
            'No hay un decodificador de imágenes disponible.',
        );
    }

    const objectUrl = URL.createObjectURL(file);

    try {
        const image = await loadHtmlImage(objectUrl);
        let disposed = false;

        return {
            source: image,
            width: image.naturalWidth,
            height: image.naturalHeight,
            dispose: () => {
                if (!disposed) {
                    image.src = '';
                    URL.revokeObjectURL(objectUrl);
                    disposed = true;
                }
            },
        };
    } catch (error) {
        URL.revokeObjectURL(objectUrl);

        if (error instanceof ImageProcessingError) {
            throw error;
        }

        throw new ImageProcessingError(
            'decode-failed',
            'El navegador no pudo decodificar la imagen.',
        );
    }
}

function loadHtmlImage(source: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.decoding = 'async';
        image.onload = () => resolve(image);
        image.onerror = () =>
            reject(
                new ImageProcessingError(
                    'decode-failed',
                    'El navegador no pudo decodificar la imagen.',
                ),
            );
        image.src = source;
    });
}

function validateImageDimensions(width: number, height: number): void {
    if (
        !Number.isInteger(width) ||
        !Number.isInteger(height) ||
        width < 1 ||
        height < 1
    ) {
        throw new ImageProcessingError(
            'invalid-dimensions',
            'La imagen no tiene dimensiones válidas.',
        );
    }

    if (width * height > MAX_IMAGE_PIXELS) {
        throw new ImageProcessingError(
            'resolution-too-large',
            'La imagen supera el límite de 40 megapíxeles.',
        );
    }
}

async function transformImage(
    originalFile: File,
    inspected: InspectedDecodedImage,
    targetMimeType: SupportedImageMimeType,
    options: ImageTransformOptions,
): Promise<ProcessedImage> {
    assertSupportedMimeType(targetMimeType);

    if (typeof document === 'undefined') {
        throw new ImageProcessingError(
            'canvas-unavailable',
            'La conversión requiere un navegador con Canvas.',
        );
    }

    const dimensions = calculateTargetDimensions(
        inspected.info.width,
        inspected.info.height,
        options,
    );
    validateImageDimensions(dimensions.width, dimensions.height);

    const canvas = document.createElement('canvas');

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    try {
        const context = canvas.getContext('2d', {
            alpha: targetMimeType !== 'image/jpeg',
        });

        if (!context) {
            throw new ImageProcessingError(
                'canvas-unavailable',
                'El navegador no pudo crear el área de procesamiento.',
            );
        }

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        if (targetMimeType === 'image/jpeg' || options.backgroundColor) {
            context.fillStyle = options.backgroundColor ?? '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        context.drawImage(
            inspected.decoded.source,
            0,
            0,
            canvas.width,
            canvas.height,
        );

        const quality = validateQuality(options.quality ?? 0.82);
        const blob = await canvasToBlob(canvas, targetMimeType, quality);

        if (blob.type !== targetMimeType) {
            throw new ImageProcessingError(
                'unsupported-output-format',
                `El navegador devolvió ${blob.type || 'un formato desconocido'} en lugar de ${targetMimeType}.`,
            );
        }

        const warnings: string[] = [
            'La imagen se procesó localmente y no se envió al servidor.',
            'La recodificación mediante Canvas elimina metadatos no visuales.',
        ];

        if (targetMimeType === 'image/png' && options.quality !== undefined) {
            warnings.push(
                'El ajuste de calidad no controla la compresión PNG del navegador.',
            );
        }

        const outputFileName = buildOutputFileName(
            options.fileName ?? originalFile.name,
            targetMimeType,
        );

        return createProcessedImage({
            blob,
            fileName: outputFileName,
            width: dimensions.width,
            height: dimensions.height,
            original: inspected.info,
            wasTransformed: true,
            warnings,
        });
    } finally {
        canvas.width = 0;
        canvas.height = 0;
    }
}

function calculateTargetDimensions(
    originalWidth: number,
    originalHeight: number,
    options: ImageTransformOptions,
): { width: number; height: number } {
    const preserveAspectRatio = options.preserveAspectRatio ?? true;
    const allowUpscale = options.allowUpscale ?? false;
    const width = validateOptionalDimension(options.width, 'ancho');
    const height = validateOptionalDimension(options.height, 'alto');
    const maxWidth = validateOptionalDimension(
        options.maxWidth,
        'ancho máximo',
    );
    const maxHeight = validateOptionalDimension(
        options.maxHeight,
        'alto máximo',
    );

    if (!preserveAspectRatio) {
        let targetWidth = width ?? originalWidth;
        let targetHeight = height ?? originalHeight;

        if (maxWidth !== undefined) {
            targetWidth = Math.min(targetWidth, maxWidth);
        }

        if (maxHeight !== undefined) {
            targetHeight = Math.min(targetHeight, maxHeight);
        }

        if (!allowUpscale) {
            targetWidth = Math.min(targetWidth, originalWidth);
            targetHeight = Math.min(targetHeight, originalHeight);
        }

        return {
            width: Math.max(1, Math.round(targetWidth)),
            height: Math.max(1, Math.round(targetHeight)),
        };
    }

    const scaleCandidates: number[] = [];

    if (width !== undefined) {
        scaleCandidates.push(width / originalWidth);
    }

    if (height !== undefined) {
        scaleCandidates.push(height / originalHeight);
    }

    if (maxWidth !== undefined) {
        scaleCandidates.push(maxWidth / originalWidth);
    }

    if (maxHeight !== undefined) {
        scaleCandidates.push(maxHeight / originalHeight);
    }

    let scale = scaleCandidates.length > 0 ? Math.min(...scaleCandidates) : 1;

    if (!allowUpscale) {
        scale = Math.min(scale, 1);
    }

    return {
        width: Math.max(1, Math.round(originalWidth * scale)),
        height: Math.max(1, Math.round(originalHeight * scale)),
    };
}

function canvasToBlob(
    canvas: HTMLCanvasElement,
    mimeType: SupportedImageMimeType,
    quality: number,
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(
                        new ImageProcessingError(
                            'encode-failed',
                            'El navegador no pudo codificar la imagen.',
                        ),
                    );

                    return;
                }

                resolve(blob);
            },
            mimeType,
            quality,
        );
    });
}

function createProcessedImage(input: {
    blob: Blob;
    fileName: string;
    width: number;
    height: number;
    original: ImageInfo;
    wasTransformed: boolean;
    warnings: string[];
}): ProcessedImage {
    const mimeType = normalizeDeclaredMimeType(input.blob.type);

    if (!mimeType) {
        throw new ImageProcessingError(
            'unsupported-output-format',
            'El resultado no tiene un formato de imagen admitido.',
        );
    }

    const fileName = buildOutputFileName(input.fileName, mimeType);
    const file = new File([input.blob], fileName, {
        type: mimeType,
        lastModified: Date.now(),
    });
    const reductionBytes = input.original.sizeBytes - file.size;
    const reductionPercent =
        input.original.sizeBytes === 0
            ? 0
            : (reductionBytes / input.original.sizeBytes) * 100;

    return {
        blob: file,
        file,
        fileName,
        objectUrl: URL.createObjectURL(file),
        mimeType,
        width: input.width,
        height: input.height,
        sizeBytes: file.size,
        original: input.original,
        reductionBytes,
        reductionPercent: Math.round(reductionPercent * 100) / 100,
        wasTransformed: input.wasTransformed,
        warnings: input.warnings,
    };
}

function buildOutputFileName(
    requestedName: string,
    mimeType: SupportedImageMimeType,
): string {
    const extension =
        mimeType === 'image/jpeg'
            ? 'jpg'
            : mimeType === 'image/png'
              ? 'png'
              : 'webp';
    const withoutControlCharacters = Array.from(requestedName)
        .map((character) =>
            (character.codePointAt(0) ?? 0) < 32 ? '-' : character,
        )
        .join('');
    const sanitized = withoutControlCharacters
        .replace(/[<>:"/\\|?*]/gu, '-')
        .replace(/\.[^.]+$/u, '')
        .trim()
        .slice(0, 120);

    return `${sanitized || 'imagen'}.${extension}`;
}

function validateOptionalDimension(
    value: number | undefined,
    name: string,
): number | undefined {
    if (value === undefined) {
        return undefined;
    }

    if (!Number.isFinite(value) || value < 1 || value > 65_535) {
        throw new ImageProcessingError(
            'invalid-dimensions',
            `El ${name} debe estar entre 1 y 65,535 píxeles.`,
        );
    }

    return value;
}

function validateQuality(quality: number): number {
    if (!Number.isFinite(quality) || quality < 0 || quality > 1) {
        throw new ImageProcessingError(
            'encode-failed',
            'La calidad debe ser un número entre 0 y 1.',
        );
    }

    return quality;
}

function assertSupportedMimeType(
    mimeType: string,
): asserts mimeType is SupportedImageMimeType {
    if (
        !SUPPORTED_IMAGE_MIME_TYPES.includes(mimeType as SupportedImageMimeType)
    ) {
        throw new ImageProcessingError(
            'unsupported-output-format',
            `El formato de salida “${mimeType}” no está admitido.`,
        );
    }
}

function asciiAt(bytes: Uint8Array, start: number, end: number): string {
    return Array.from(bytes.slice(start, end))
        .map((byte) => String.fromCharCode(byte))
        .join('');
}
