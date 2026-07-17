import {
    Copy,
    Download,
    ImagePlus,
    QrCode,
    RefreshCcw,
    Share2,
    ShieldCheck,
} from 'lucide-react';
import QRCode from 'qrcode';
import type { QRCodeErrorCorrectionLevel } from 'qrcode';
import { useMemo, useState } from 'react';
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
import {
    historyColor,
    historyNumber,
    historyString,
} from '@/lib/tools/history-configuration';
import { normalizeQrHttpUrl } from '@/lib/tools/qr';
import { cn } from '@/lib/utils';
import type { ToolRuntimeProps } from '@/types/tool-runtime';

type QrContentType =
    | 'email'
    | 'event'
    | 'location'
    | 'phone'
    | 'sms'
    | 'social'
    | 'text'
    | 'url'
    | 'vcard'
    | 'wifi';

type ModuleShape = 'dots' | 'rounded' | 'square';
type ExportFormat = 'png' | 'svg' | 'webp';

type RenderedQr = {
    error?: string;
    outputSize: number;
    svg: string;
};

type QrFields = {
    body: string;
    email: string;
    end: string;
    firstName: string;
    hidden: boolean;
    label: string;
    lastName: string;
    latitude: string;
    location: string;
    longitude: string;
    message: string;
    network: string;
    password: string;
    phone: string;
    security: 'WEP' | 'WPA' | 'nopass';
    socialUrl: string;
    start: string;
    subject: string;
    text: string;
    title: string;
    url: string;
};

const defaultFields: QrFields = {
    body: '',
    email: '',
    end: '',
    firstName: '',
    hidden: false,
    label: '',
    lastName: '',
    latitude: '',
    location: '',
    longitude: '',
    message: '',
    network: '',
    password: '',
    phone: '',
    security: 'WPA',
    socialUrl: '',
    start: '',
    subject: '',
    text: 'AIVEN hace la tecnología más útil.',
    title: '',
    url: 'https://',
};

const contentLabels: Record<QrContentType, string> = {
    email: 'Correo electrónico',
    event: 'Evento',
    location: 'Ubicación',
    phone: 'Número telefónico',
    sms: 'Mensaje SMS',
    social: 'Perfil social',
    text: 'Texto',
    url: 'Dirección web',
    vcard: 'Contacto',
    wifi: 'Red Wi-Fi',
};

const hexColorPattern = /^#[0-9a-f]{6}$/i;

function escapeWifi(value: string): string {
    return value.replace(/([\\;,:"])/g, '\\$1');
}

function compactDate(value: string): string {
    return value.replace(/[-:]/g, '').replace('.000', '');
}

function buildQrContent(
    contentType: QrContentType,
    fields: QrFields,
): { error?: string; value: string } {
    switch (contentType) {
        case 'url': {
            try {
                return { value: normalizeQrHttpUrl(fields.url) };
            } catch (error) {
                return {
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Escribe una dirección web válida y completa.',
                    value: '',
                };
            }
        }
        case 'wifi':
            if (!fields.network.trim()) {
                return {
                    error: 'Escribe el nombre de la red Wi-Fi.',
                    value: '',
                };
            }

            if (fields.security !== 'nopass' && !fields.password) {
                return {
                    error: 'La contraseña es obligatoria para una red protegida.',
                    value: '',
                };
            }

            return {
                value: `WIFI:T:${fields.security};S:${escapeWifi(fields.network)};P:${escapeWifi(fields.password)};H:${fields.hidden ? 'true' : 'false'};;`,
            };
        case 'email':
            if (!/^\S+@\S+\.\S+$/.test(fields.email.trim())) {
                return {
                    error: 'Escribe un correo electrónico válido.',
                    value: '',
                };
            }

            return {
                value: `mailto:${fields.email.trim()}?${new URLSearchParams({ subject: fields.subject, body: fields.body }).toString()}`,
            };
        case 'phone':
            if (!/^\+?[\d ()-]{7,20}$/.test(fields.phone.trim())) {
                return {
                    error: 'Escribe un número telefónico válido.',
                    value: '',
                };
            }

            return { value: `tel:${fields.phone.replace(/[^+\d]/g, '')}` };
        case 'sms':
            if (!/^\+?[\d ()-]{7,20}$/.test(fields.phone.trim())) {
                return {
                    error: 'Escribe un número telefónico válido.',
                    value: '',
                };
            }

            return {
                value: `SMSTO:${fields.phone.replace(/[^+\d]/g, '')}:${fields.message}`,
            };
        case 'location': {
            const latitude = Number(fields.latitude);
            const longitude = Number(fields.longitude);

            if (
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude) ||
                latitude < -90 ||
                latitude > 90 ||
                longitude < -180 ||
                longitude > 180
            ) {
                return {
                    error: 'La latitud debe estar entre -90 y 90, y la longitud entre -180 y 180.',
                    value: '',
                };
            }

            return {
                value: `geo:${latitude},${longitude}${fields.label ? `?q=${latitude},${longitude}(${encodeURIComponent(fields.label)})` : ''}`,
            };
        }
        case 'vcard':
            if (!fields.firstName.trim() && !fields.lastName.trim()) {
                return { error: 'Escribe el nombre del contacto.', value: '' };
            }

            return {
                value: [
                    'BEGIN:VCARD',
                    'VERSION:3.0',
                    `N:${fields.lastName};${fields.firstName};;;`,
                    `FN:${`${fields.firstName} ${fields.lastName}`.trim()}`,
                    fields.phone ? `TEL:${fields.phone}` : '',
                    fields.email ? `EMAIL:${fields.email}` : '',
                    'END:VCARD',
                ]
                    .filter(Boolean)
                    .join('\n'),
            };
        case 'event':
            if (!fields.title.trim() || !fields.start) {
                return {
                    error: 'El evento necesita un título y una fecha de inicio.',
                    value: '',
                };
            }

            return {
                value: [
                    'BEGIN:VEVENT',
                    `SUMMARY:${fields.title}`,
                    `DTSTART:${compactDate(fields.start)}`,
                    fields.end ? `DTEND:${compactDate(fields.end)}` : '',
                    fields.location ? `LOCATION:${fields.location}` : '',
                    'END:VEVENT',
                ]
                    .filter(Boolean)
                    .join('\n'),
            };
        case 'social':
            try {
                return { value: normalizeQrHttpUrl(fields.socialUrl) };
            } catch (error) {
                return {
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Escribe el enlace completo de tu perfil social.',
                    value: '',
                };
            }
        case 'text':
        default:
            if (!fields.text.trim()) {
                return {
                    error: 'Escribe el texto que deseas convertir.',
                    value: '',
                };
            }

            return { value: fields.text };
    }
}

function luminance(hexColor: string): number {
    const channels = [1, 3, 5].map(
        (offset) =>
            Number.parseInt(hexColor.slice(offset, offset + 2), 16) / 255,
    );
    const [red, green, blue] = channels.map((channel) =>
        channel <= 0.03928
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4,
    );

    return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function contrastRatio(foreground: string, background: string): number {
    if (
        !hexColorPattern.test(foreground) ||
        !hexColorPattern.test(background)
    ) {
        return 1;
    }

    const first = luminance(foreground);
    const second = luminance(background);

    return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function isFinderModule(row: number, column: number, size: number): boolean {
    return (
        (row < 7 && column < 7) ||
        (row < 7 && column >= size - 7) ||
        (row >= size - 7 && column < 7)
    );
}

function renderQrSvg(
    content: string,
    options: {
        backgroundColor: string;
        correction: QRCodeErrorCorrectionLevel;
        foregroundColor: string;
        logoDataUrl: string | null;
        margin: number;
        shape: ModuleShape;
        size: number;
    },
): { outputSize: number; svg: string } {
    const symbol = QRCode.create(content, {
        errorCorrectionLevel: options.correction,
    });
    const moduleCount = symbol.modules.size;
    const dimension = moduleCount + options.margin * 2;
    const pixelsPerModule = Math.max(2, Math.floor(options.size / dimension));
    const outputSize = dimension * pixelsPerModule;
    const modules: string[] = [];

    for (let row = 0; row < moduleCount; row += 1) {
        for (let column = 0; column < moduleCount; column += 1) {
            if (!symbol.modules.get(row, column)) {
                continue;
            }

            const x = column + options.margin;
            const y = row + options.margin;
            const preserveFinder = isFinderModule(row, column, moduleCount);

            if (options.shape === 'dots' && !preserveFinder) {
                modules.push(
                    `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.43"/>`,
                );
            } else if (options.shape === 'rounded' && !preserveFinder) {
                modules.push(
                    `<rect x="${x}" y="${y}" width="1" height="1" rx="0.28"/>`,
                );
            } else {
                modules.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
            }
        }
    }

    const logoSize = dimension * 0.18;
    const logoPosition = (dimension - logoSize) / 2;
    const logo = options.logoDataUrl
        ? `<rect x="${logoPosition - 0.75}" y="${logoPosition - 0.75}" width="${logoSize + 1.5}" height="${logoSize + 1.5}" rx="1" fill="${options.backgroundColor}"/><image href="${options.logoDataUrl}" x="${logoPosition}" y="${logoPosition}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>`
        : '';

    return {
        outputSize,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${outputSize}" height="${outputSize}" viewBox="0 0 ${dimension} ${dimension}" shape-rendering="geometricPrecision"><rect width="${dimension}" height="${dimension}" fill="${options.backgroundColor}"/><g fill="${options.foregroundColor}">${modules.join('')}</g>${logo}</svg>`,
    };
}

function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

async function rasterizeSvg(
    svg: string,
    size: number,
    format: Exclude<ExportFormat, 'svg'>,
): Promise<Blob> {
    const svgUrl = URL.createObjectURL(
        new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
    );

    try {
        const image = new Image();
        image.decoding = 'async';
        image.src = svgUrl;
        await image.decode();

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error('Tu navegador no pudo preparar el archivo.');
        }

        context.imageSmoothingEnabled = false;
        context.drawImage(image, 0, 0, size, size);

        const requestedType = format === 'webp' ? 'image/webp' : 'image/png';
        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, requestedType, 0.95),
        );

        canvas.width = 1;
        canvas.height = 1;

        if (!blob || blob.type !== requestedType) {
            throw new Error(
                format === 'webp'
                    ? 'Este navegador no puede exportar WebP. Usa PNG o SVG.'
                    : 'No fue posible crear el archivo PNG.',
            );
        }

        return blob;
    } finally {
        URL.revokeObjectURL(svgUrl);
    }
}

function Field({
    id,
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
}: {
    id: string;
    label: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    value: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    );
}

export default function QrGenerator({
    favoriteAction,
    initialConfiguration,
    offlineShell,
    recordError,
    recordHistory,
    related,
    tool,
}: ToolRuntimeProps) {
    const [contentType, setContentType] = useState<QrContentType>('text');
    const [fields, setFields] = useState<QrFields>(defaultFields);
    const [size, setSize] = useState(() =>
        historyNumber(initialConfiguration, 'size', 512, {
            integer: true,
            max: 2048,
            min: 128,
        }),
    );
    const [margin, setMargin] = useState(() =>
        historyNumber(initialConfiguration, 'margin', 4, {
            integer: true,
            max: 20,
            min: 0,
        }),
    );
    const [correction, setCorrection] = useState<QRCodeErrorCorrectionLevel>(
        () =>
            historyString(
                initialConfiguration,
                'errorCorrection',
                ['L', 'M', 'Q', 'H'] as const,
                'M',
            ),
    );
    const [shape, setShape] = useState<ModuleShape>(() =>
        historyString(
            initialConfiguration,
            'shape',
            ['square', 'rounded', 'dots'] as const,
            'square',
        ),
    );
    const [foregroundColor, setForegroundColor] = useState(() =>
        historyColor(initialConfiguration, 'foregroundColor', '#101828'),
    );
    const [backgroundColor, setBackgroundColor] = useState(() =>
        historyColor(initialConfiguration, 'backgroundColor', '#ffffff'),
    );
    const [format, setFormat] = useState<ExportFormat>(() =>
        historyString(
            initialConfiguration,
            'format',
            ['png', 'svg', 'webp'] as const,
            'png',
        ),
    );
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
    const content = useMemo(
        () => buildQrContent(contentType, fields),
        [contentType, fields],
    );
    const contrast = contrastRatio(foregroundColor, backgroundColor);
    const colorError =
        !hexColorPattern.test(foregroundColor) ||
        !hexColorPattern.test(backgroundColor)
            ? 'Los colores deben usar el formato hexadecimal #RRGGBB.'
            : contrast < 4.5
              ? 'El contraste es bajo. Usa un color principal más oscuro y un fondo más claro.'
              : undefined;
    const contentError =
        content.value.length > 2_000
            ? 'El contenido supera el límite recomendado de 2,000 caracteres.'
            : content.error;
    const rendered = useMemo<RenderedQr | null>(() => {
        if (!content.value || contentError || colorError) {
            return null;
        }

        try {
            return renderQrSvg(content.value, {
                backgroundColor,
                correction: logoDataUrl ? 'H' : correction,
                foregroundColor,
                logoDataUrl,
                margin,
                shape,
                size,
            });
        } catch (error) {
            return {
                error:
                    error instanceof Error
                        ? error.message
                        : 'No fue posible generar el código QR.',
                outputSize: size,
                svg: '',
            };
        }
    }, [
        backgroundColor,
        colorError,
        content.value,
        contentError,
        correction,
        foregroundColor,
        logoDataUrl,
        margin,
        shape,
        size,
    ]);
    const previewUrl = rendered?.svg
        ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rendered.svg)}`
        : null;
    const historyConfiguration = () => ({
        backgroundColor,
        errorCorrection: logoDataUrl ? 'H' : correction,
        foregroundColor,
        format,
        margin,
        shape,
        size: rendered?.outputSize ?? size,
    });

    const updateField = <K extends keyof QrFields>(
        key: K,
        value: QrFields[K],
    ) => setFields((current) => ({ ...current, [key]: value }));
    const reset = () => {
        setContentType('text');
        setFields(defaultFields);
        setSize(512);
        setMargin(4);
        setCorrection('M');
        setShape('square');
        setForegroundColor('#101828');
        setBackgroundColor('#ffffff');
        setFormat('png');
        setLogoDataUrl(null);
    };
    const loadLogo = (file: File | undefined) => {
        if (!file) {
            return;
        }

        if (
            !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
            file.size > 1024 * 1024
        ) {
            toast.error(
                'El logotipo debe ser PNG, JPG o WebP y pesar menos de 1 MB.',
            );

            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setLogoDataUrl(reader.result);
                setCorrection('H');
            }
        };
        reader.readAsDataURL(file);
    };
    const createExportBlob = async (): Promise<Blob> => {
        if (!rendered?.svg) {
            throw new Error('Completa los campos antes de exportar.');
        }

        if (format === 'svg') {
            return new Blob([rendered.svg], {
                type: 'image/svg+xml;charset=utf-8',
            });
        }

        return rasterizeSvg(rendered.svg, rendered.outputSize, format);
    };
    const download = async () => {
        try {
            const blob = await createExportBlob();
            downloadBlob(blob, `aiven-qr.${format}`);
            recordHistory('downloaded', historyConfiguration());
            toast.success('Código QR descargado.');
        } catch (error) {
            recordError('export_failed');
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'No fue posible descargar el código QR.',
            );
        }
    };
    const share = async () => {
        if (!navigator.share) {
            toast.error('Tu navegador no permite compartir archivos.');

            return;
        }

        try {
            const blob = await createExportBlob();
            const file = new File([blob], `aiven-qr.${format}`, {
                type: blob.type,
            });

            if (navigator.canShare && !navigator.canShare({ files: [file] })) {
                throw new Error(
                    'Este dispositivo no puede compartir este formato.',
                );
            }

            await navigator.share({
                files: [file],
                title: 'Código QR de AIVEN',
            });
            recordHistory('shared', historyConfiguration());
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return;
            }

            recordError('share_failed');
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'No fue posible compartir el código QR.',
            );
        }
    };
    const copyContent = async () => {
        try {
            await navigator.clipboard.writeText(content.value);
            toast.success('Contenido copiado.');
        } catch {
            toast.error('No fue posible copiar el contenido.');
        }
    };

    const contentFields = (() => {
        switch (contentType) {
            case 'url':
                return (
                    <Field
                        id="qr-url"
                        label="Dirección web"
                        type="url"
                        value={fields.url}
                        onChange={(value) => updateField('url', value)}
                        placeholder="https://aiven.example"
                    />
                );
            case 'wifi':
                return (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            id="qr-network"
                            label="Nombre de la red"
                            value={fields.network}
                            onChange={(value) => updateField('network', value)}
                        />
                        <div className="grid gap-2">
                            <Label>Seguridad</Label>
                            <Select
                                value={fields.security}
                                onValueChange={(value) =>
                                    updateField(
                                        'security',
                                        value as QrFields['security'],
                                    )
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WPA">
                                        WPA/WPA2
                                    </SelectItem>
                                    <SelectItem value="WEP">WEP</SelectItem>
                                    <SelectItem value="nopass">
                                        Sin contraseña
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {fields.security !== 'nopass' && (
                            <Field
                                id="qr-wifi-password"
                                label="Contraseña"
                                type="password"
                                value={fields.password}
                                onChange={(value) =>
                                    updateField('password', value)
                                }
                            />
                        )}
                        <label className="flex min-h-10 items-center gap-3 rounded-xl border px-3 text-sm">
                            <input
                                type="checkbox"
                                checked={fields.hidden}
                                onChange={(event) =>
                                    updateField('hidden', event.target.checked)
                                }
                                className="size-4 accent-primary"
                            />
                            Red oculta
                        </label>
                    </div>
                );
            case 'email':
                return (
                    <div className="grid gap-4">
                        <Field
                            id="qr-email"
                            label="Correo electrónico"
                            type="email"
                            value={fields.email}
                            onChange={(value) => updateField('email', value)}
                        />
                        <Field
                            id="qr-subject"
                            label="Asunto"
                            value={fields.subject}
                            onChange={(value) => updateField('subject', value)}
                        />
                        <div className="grid gap-2">
                            <Label htmlFor="qr-body">Mensaje</Label>
                            <textarea
                                id="qr-body"
                                value={fields.body}
                                onChange={(event) =>
                                    updateField('body', event.target.value)
                                }
                                className="min-h-28 rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-input/30"
                            />
                        </div>
                    </div>
                );
            case 'phone':
            case 'sms':
                return (
                    <div className="grid gap-4">
                        <Field
                            id="qr-phone"
                            label="Número telefónico"
                            type="tel"
                            value={fields.phone}
                            onChange={(value) => updateField('phone', value)}
                            placeholder="+52 55 1234 5678"
                        />
                        {contentType === 'sms' && (
                            <Field
                                id="qr-message"
                                label="Mensaje"
                                value={fields.message}
                                onChange={(value) =>
                                    updateField('message', value)
                                }
                            />
                        )}
                    </div>
                );
            case 'location':
                return (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            id="qr-latitude"
                            label="Latitud"
                            type="number"
                            value={fields.latitude}
                            onChange={(value) => updateField('latitude', value)}
                            placeholder="19.4326"
                        />
                        <Field
                            id="qr-longitude"
                            label="Longitud"
                            type="number"
                            value={fields.longitude}
                            onChange={(value) =>
                                updateField('longitude', value)
                            }
                            placeholder="-99.1332"
                        />
                        <div className="sm:col-span-2">
                            <Field
                                id="qr-location-label"
                                label="Nombre del lugar (opcional)"
                                value={fields.label}
                                onChange={(value) =>
                                    updateField('label', value)
                                }
                            />
                        </div>
                    </div>
                );
            case 'vcard':
                return (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            id="qr-first-name"
                            label="Nombre"
                            value={fields.firstName}
                            onChange={(value) =>
                                updateField('firstName', value)
                            }
                        />
                        <Field
                            id="qr-last-name"
                            label="Apellidos"
                            value={fields.lastName}
                            onChange={(value) => updateField('lastName', value)}
                        />
                        <Field
                            id="qr-contact-phone"
                            label="Teléfono (opcional)"
                            type="tel"
                            value={fields.phone}
                            onChange={(value) => updateField('phone', value)}
                        />
                        <Field
                            id="qr-contact-email"
                            label="Correo (opcional)"
                            type="email"
                            value={fields.email}
                            onChange={(value) => updateField('email', value)}
                        />
                    </div>
                );
            case 'event':
                return (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Field
                                id="qr-event-title"
                                label="Título"
                                value={fields.title}
                                onChange={(value) =>
                                    updateField('title', value)
                                }
                            />
                        </div>
                        <Field
                            id="qr-event-start"
                            label="Inicio"
                            type="datetime-local"
                            value={fields.start}
                            onChange={(value) => updateField('start', value)}
                        />
                        <Field
                            id="qr-event-end"
                            label="Fin (opcional)"
                            type="datetime-local"
                            value={fields.end}
                            onChange={(value) => updateField('end', value)}
                        />
                        <div className="sm:col-span-2">
                            <Field
                                id="qr-event-location"
                                label="Lugar (opcional)"
                                value={fields.location}
                                onChange={(value) =>
                                    updateField('location', value)
                                }
                            />
                        </div>
                    </div>
                );
            case 'social':
                return (
                    <Field
                        id="qr-social"
                        label="Enlace del perfil"
                        type="url"
                        value={fields.socialUrl}
                        onChange={(value) => updateField('socialUrl', value)}
                        placeholder="https://..."
                    />
                );
            case 'text':
            default:
                return (
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="qr-text">Texto</Label>
                            <span className="text-xs text-muted-foreground">
                                {fields.text.length}/2,000
                            </span>
                        </div>
                        <textarea
                            id="qr-text"
                            value={fields.text}
                            maxLength={2_001}
                            onChange={(event) =>
                                updateField('text', event.target.value)
                            }
                            className="min-h-32 rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-input/30"
                        />
                    </div>
                );
        }
    })();

    const resultPanel = (
        <div className="grid gap-4">
            {contentError || colorError || rendered?.error ? (
                <Alert variant="destructive">
                    <AlertTitle>Revisa la configuración</AlertTitle>
                    <AlertDescription>
                        {contentError || colorError || rendered?.error}
                    </AlertDescription>
                </Alert>
            ) : previewUrl ? (
                <>
                    <div className="grid place-items-center rounded-2xl border bg-[linear-gradient(45deg,var(--muted)_25%,transparent_25%),linear-gradient(-45deg,var(--muted)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,var(--muted)_75%),linear-gradient(-45deg,transparent_75%,var(--muted)_75%)] bg-[length:18px_18px] bg-[position:0_0,0_9px,9px_-9px,-9px_0px] p-4">
                        <img
                            src={previewUrl}
                            alt="Vista previa del código QR generado"
                            className="aspect-square w-full max-w-sm rounded-xl shadow-lg"
                        />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>
                            {rendered?.outputSize ?? size} ×{' '}
                            {rendered?.outputSize ?? size} px
                        </span>
                        <Badge variant="outline">
                            Contraste {contrast.toFixed(1)}:1
                        </Badge>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <Button type="button" onClick={() => void download()}>
                            <Download aria-hidden="true" />
                            Descargar {format.toUpperCase()}
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
                            variant="outline"
                            onClick={() => void copyContent()}
                        >
                            <Copy aria-hidden="true" />
                            Copiar contenido
                        </Button>
                        <Button type="button" variant="ghost" onClick={reset}>
                            <RefreshCcw aria-hidden="true" />
                            Reiniciar
                        </Button>
                    </div>
                </>
            ) : (
                <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed p-8 text-center">
                    <div className="space-y-3">
                        <QrCode className="mx-auto size-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            Completa los campos para ver el código QR.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <AivenToolLayout
            tool={tool}
            icon={<QrCode className="size-7" />}
            favoriteAction={favoriteAction}
            offlineShell={offlineShell}
            related={related}
            result={resultPanel}
            resultDescription="La vista previa cambia al instante y nunca sale de tu dispositivo."
            helpItems={[
                {
                    question: '¿Qué nivel de corrección debo elegir?',
                    answer: 'M funciona bien para pantallas y uso general. Usa Q o H si el código puede imprimirse, ensuciarse o incluir un logotipo. Con logotipo AIVEN aplica H automáticamente.',
                },
                {
                    question:
                        '¿Por qué el tamaño final puede variar algunos píxeles?',
                    answer: 'AIVEN usa píxeles completos por módulo para mantener bordes nítidos y mejorar el escaneo. El resultado se aproxima al tamaño elegido sin deformar la cuadrícula.',
                },
                {
                    question: '¿Qué formato conviene descargar?',
                    answer: 'PNG es compatible con casi todo. SVG conserva máxima nitidez para impresión. WebP suele pesar menos, pero depende del soporte del navegador.',
                },
            ]}
            privacy={
                <Card className="gap-3 rounded-[1.5rem] border-emerald-500/20 bg-emerald-500/[0.035] py-5">
                    <CardHeader className="px-5">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                            Privado por diseño
                        </CardTitle>
                        <CardDescription>
                            El contenido y el logotipo se procesan localmente.
                            AIVEN sólo puede guardar opciones no sensibles como
                            formato, tamaño y colores.
                        </CardDescription>
                    </CardHeader>
                </Card>
            }
        >
            <div className="grid gap-6">
                <div className="grid gap-2">
                    <Label>Tipo de contenido</Label>
                    <Select
                        value={contentType}
                        onValueChange={(value) =>
                            setContentType(value as QrContentType)
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(contentLabels).map(
                                ([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {contentFields}

                <fieldset className="grid gap-4 rounded-2xl border p-4">
                    <legend className="px-2 text-sm font-semibold">
                        Apariencia
                    </legend>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="qr-size">Tamaño aproximado</Label>
                            <Select
                                value={String(size)}
                                onValueChange={(value) =>
                                    setSize(Number(value))
                                }
                            >
                                <SelectTrigger id="qr-size" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[256, 512, 768, 1024].map((value) => (
                                        <SelectItem
                                            key={value}
                                            value={String(value)}
                                        >
                                            {value} px
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="qr-margin">Margen</Label>
                            <Input
                                id="qr-margin"
                                type="number"
                                min={4}
                                max={10}
                                value={margin}
                                onChange={(event) =>
                                    setMargin(
                                        Math.min(
                                            10,
                                            Math.max(
                                                4,
                                                Number(event.target.value),
                                            ),
                                        ),
                                    )
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Corrección de errores</Label>
                            <Select
                                value={correction}
                                disabled={Boolean(logoDataUrl)}
                                onValueChange={(value) =>
                                    setCorrection(
                                        value as QRCodeErrorCorrectionLevel,
                                    )
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="L">L · 7%</SelectItem>
                                    <SelectItem value="M">M · 15%</SelectItem>
                                    <SelectItem value="Q">Q · 25%</SelectItem>
                                    <SelectItem value="H">H · 30%</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Forma de módulos</Label>
                            <Select
                                value={shape}
                                onValueChange={(value) =>
                                    setShape(value as ModuleShape)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="square">
                                        Cuadrados
                                    </SelectItem>
                                    <SelectItem value="rounded">
                                        Redondeados
                                    </SelectItem>
                                    <SelectItem value="dots">Puntos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="qr-foreground">
                                Color principal
                            </Label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={foregroundColor}
                                    onChange={(event) =>
                                        setForegroundColor(event.target.value)
                                    }
                                    className="h-9 w-12 rounded-md border bg-transparent p-1"
                                    aria-label="Elegir color principal"
                                />
                                <Input
                                    id="qr-foreground"
                                    value={foregroundColor}
                                    onChange={(event) =>
                                        setForegroundColor(event.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="qr-background">
                                Color de fondo
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
                                    id="qr-background"
                                    value={backgroundColor}
                                    onChange={(event) =>
                                        setBackgroundColor(event.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="qr-logo">
                            Logotipo central (opcional)
                        </Label>
                        <label
                            htmlFor="qr-logo"
                            className={cn(
                                'flex min-h-20 cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed px-4 text-sm transition-colors focus-within:ring-2 focus-within:ring-ring hover:border-primary/40 hover:bg-primary/[0.035] motion-reduce:transition-none',
                                logoDataUrl && 'border-emerald-500/30',
                            )}
                        >
                            <ImagePlus className="size-5 text-primary" />
                            {logoDataUrl
                                ? 'Cambiar logotipo · corrección H activa'
                                : 'Elegir PNG, JPG o WebP · máximo 1 MB'}
                            <input
                                id="qr-logo"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="sr-only"
                                onChange={(event) =>
                                    loadLogo(event.target.files?.[0])
                                }
                            />
                        </label>
                        {logoDataUrl && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-fit"
                                onClick={() => setLogoDataUrl(null)}
                            >
                                Quitar logotipo
                            </Button>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label>Formato de descarga</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['png', 'svg', 'webp'] as const).map((value) => (
                                <Button
                                    key={value}
                                    type="button"
                                    variant={
                                        format === value ? 'default' : 'outline'
                                    }
                                    onClick={() => setFormat(value)}
                                >
                                    {value.toUpperCase()}
                                </Button>
                            ))}
                        </div>
                    </div>
                </fieldset>
            </div>
        </AivenToolLayout>
    );
}
