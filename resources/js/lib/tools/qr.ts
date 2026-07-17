export type QrContentType =
    | 'text'
    | 'url'
    | 'wifi'
    | 'email'
    | 'phone'
    | 'sms'
    | 'location'
    | 'contact'
    | 'event'
    | 'social';

export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type QrOutputFormat = 'png' | 'svg' | 'webp';
export type QrModuleShape = 'square' | 'rounded' | 'dots';

export interface QrTextFields {
    text: string;
}

export interface QrUrlFields {
    url: string;
}

export interface QrWifiFields {
    ssid: string;
    security?: 'WPA' | 'WEP' | 'nopass';
    password?: string;
    hidden?: boolean;
}

export interface QrEmailFields {
    email: string;
    subject?: string;
    body?: string;
}

export interface QrPhoneFields {
    phone: string;
}

export interface QrSmsFields {
    phone: string;
    message?: string;
}

export interface QrLocationFields {
    latitude: number | string;
    longitude: number | string;
    label?: string;
}

export interface QrContactFields {
    firstName: string;
    lastName?: string;
    organization?: string;
    title?: string;
    phone?: string;
    email?: string;
    url?: string;
    address?: string;
    note?: string;
}

export interface QrEventFields {
    title: string;
    start: Date | string;
    end?: Date | string;
    allDay?: boolean;
    location?: string;
    description?: string;
    uid?: string;
    createdAt?: Date | string;
}

export interface QrSocialFields {
    url: string;
    network?: string;
}

export interface QrFieldMap {
    text: QrTextFields;
    url: QrUrlFields;
    wifi: QrWifiFields;
    email: QrEmailFields;
    phone: QrPhoneFields;
    sms: QrSmsFields;
    location: QrLocationFields;
    contact: QrContactFields;
    event: QrEventFields;
    social: QrSocialFields;
}

export interface QrPayloadResult {
    value: string;
    warnings: string[];
}

export interface QrVisualOptions {
    size: number;
    marginModules: number;
    errorCorrection: QrErrorCorrectionLevel;
    foregroundColor: string;
    backgroundColor: string;
    logoSizePercent: number;
    moduleShape: QrModuleShape;
    outputFormat: QrOutputFormat;
}

export interface QrOptionsValidation {
    valid: boolean;
    errors: string[];
    warnings: string[];
    contrastRatio: number | null;
    byteLength: number;
    normalized: QrVisualOptions;
}

export interface QrRasterExportOptions {
    format: 'png' | 'webp';
    size?: number;
    quality?: number;
    backgroundColor?: string;
}

export const DEFAULT_QR_VISUAL_OPTIONS: QrVisualOptions = Object.freeze({
    size: 512,
    marginModules: 4,
    errorCorrection: 'M',
    foregroundColor: '#111827',
    backgroundColor: '#ffffff',
    logoSizePercent: 0,
    moduleShape: 'square',
    outputFormat: 'png',
});

const MAX_QR_BYTES_BY_CORRECTION: Record<QrErrorCorrectionLevel, number> = {
    L: 2_953,
    M: 2_331,
    Q: 1_663,
    H: 1_273,
};

export function buildQrPayload<T extends QrContentType>(
    type: T,
    fields: QrFieldMap[T],
): QrPayloadResult {
    const warnings: string[] = [];
    let value: string;

    switch (type) {
        case 'text':
            value = requireText(
                (fields as QrTextFields).text,
                'Introduce el texto que contendrá el QR.',
            );
            break;
        case 'url':
            value = normalizeQrHttpUrl((fields as QrUrlFields).url, warnings);
            break;
        case 'wifi':
            value = buildWifiPayload(fields as QrWifiFields, warnings);
            break;
        case 'email':
            value = buildEmailPayload(fields as QrEmailFields);
            break;
        case 'phone':
            value = `tel:${normalizePhone((fields as QrPhoneFields).phone)}`;
            break;
        case 'sms':
            value = buildSmsPayload(fields as QrSmsFields);
            break;
        case 'location':
            value = buildLocationPayload(fields as QrLocationFields);
            break;
        case 'contact':
            value = buildContactPayload(fields as QrContactFields, warnings);
            break;
        case 'event':
            value = buildEventPayload(fields as QrEventFields, warnings);
            break;
        case 'social':
            value = normalizeQrHttpUrl(
                (fields as QrSocialFields).url,
                warnings,
            );

            if (!(fields as QrSocialFields).network?.trim()) {
                warnings.push(
                    'El perfil se codificó como una URL sin identificar una red social concreta.',
                );
            }

            break;
    }

    const byteLength = new TextEncoder().encode(value).length;

    if (byteLength > MAX_QR_BYTES_BY_CORRECTION.L) {
        throw new Error(
            `El contenido ocupa ${byteLength.toLocaleString('es-MX')} bytes y supera la capacidad conservadora de un QR.`,
        );
    }

    if (byteLength > 1_000) {
        warnings.push(
            'El contenido es largo; el código tendrá muchos módulos y será más difícil de escanear.',
        );
    }

    return { value, warnings: Array.from(new Set(warnings)) };
}

export function validateQrOptions(
    options: Partial<QrVisualOptions> = {},
    payload = '',
): QrOptionsValidation {
    const normalized: QrVisualOptions = {
        ...DEFAULT_QR_VISUAL_OPTIONS,
        ...options,
    };
    const errors: string[] = [];
    const warnings: string[] = [];
    const byteLength = new TextEncoder().encode(payload).length;

    if (!(['L', 'M', 'Q', 'H'] as const).includes(normalized.errorCorrection)) {
        errors.push('El nivel de corrección debe ser L, M, Q o H.');
        normalized.errorCorrection = DEFAULT_QR_VISUAL_OPTIONS.errorCorrection;
    }

    if (
        !(['square', 'rounded', 'dots'] as const).includes(
            normalized.moduleShape,
        )
    ) {
        errors.push('La forma de los módulos no es válida.');
        normalized.moduleShape = DEFAULT_QR_VISUAL_OPTIONS.moduleShape;
    }

    if (!(['png', 'svg', 'webp'] as const).includes(normalized.outputFormat)) {
        errors.push('El formato de salida debe ser PNG, SVG o WebP.');
        normalized.outputFormat = DEFAULT_QR_VISUAL_OPTIONS.outputFormat;
    }

    if (
        !Number.isInteger(normalized.size) ||
        normalized.size < 128 ||
        normalized.size > 4_096
    ) {
        errors.push('El tamaño debe ser un entero entre 128 y 4,096 píxeles.');
    }

    if (
        !Number.isInteger(normalized.marginModules) ||
        normalized.marginModules < 0 ||
        normalized.marginModules > 32
    ) {
        errors.push('El margen debe estar entre 0 y 32 módulos.');
    } else if (normalized.marginModules < 4) {
        warnings.push(
            'Se recomiendan al menos cuatro módulos de margen silencioso.',
        );
    }

    if (
        !Number.isFinite(normalized.logoSizePercent) ||
        normalized.logoSizePercent < 0 ||
        normalized.logoSizePercent > 30
    ) {
        errors.push('El logotipo debe ocupar entre 0 % y 30 % del ancho.');
    } else if (normalized.logoSizePercent > 20) {
        warnings.push(
            'Un logotipo mayor al 20 % puede ocultar demasiados módulos.',
        );
    }

    if (normalized.logoSizePercent > 0 && normalized.errorCorrection !== 'H') {
        warnings.push(
            'Usa corrección H cuando el código incluya un logotipo central.',
        );
    }

    if (normalized.moduleShape !== 'square') {
        warnings.push(
            'Las formas decorativas deben probarse con varios lectores y tamaños.',
        );
    }

    let contrastRatio: number | null = null;

    try {
        contrastRatio = calculateContrastRatio(
            normalized.foregroundColor,
            normalized.backgroundColor,
        );

        if (contrastRatio < 3) {
            errors.push(
                'El contraste entre módulos y fondo es demasiado bajo para un escaneo confiable.',
            );
        } else if (contrastRatio < 4.5) {
            warnings.push(
                'Conviene aumentar el contraste para mejorar el escaneo en cámaras difíciles.',
            );
        }
    } catch (error) {
        errors.push(
            error instanceof Error
                ? error.message
                : 'Los colores no tienen un formato válido.',
        );
    }

    const maximumBytes = MAX_QR_BYTES_BY_CORRECTION[normalized.errorCorrection];

    if (byteLength > maximumBytes) {
        errors.push(
            `El contenido ocupa ${byteLength.toLocaleString('es-MX')} bytes; el límite conservador para corrección ${normalized.errorCorrection} es ${maximumBytes.toLocaleString('es-MX')}.`,
        );
    } else if (byteLength > maximumBytes * 0.8) {
        warnings.push(
            'El contenido está cerca del límite y producirá un código muy denso.',
        );
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings: Array.from(new Set(warnings)),
        contrastRatio,
        byteLength,
        normalized,
    };
}

export function calculateContrastRatio(
    foregroundColor: string,
    backgroundColor: string,
): number {
    const background = composite(parseColor(backgroundColor), {
        red: 255,
        green: 255,
        blue: 255,
        alpha: 1,
    });
    const foreground = composite(parseColor(foregroundColor), background);
    const foregroundLuminance = relativeLuminance(foreground);
    const backgroundLuminance = relativeLuminance(background);
    const lighter = Math.max(foregroundLuminance, backgroundLuminance);
    const darker = Math.min(foregroundLuminance, backgroundLuminance);

    return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

export function createQrSvgBlob(svg: string): Blob {
    assertSafeQrSvg(svg);

    return new Blob([svg], {
        type: 'image/svg+xml;charset=utf-8',
    });
}

export async function rasterizeQrSvg(
    svg: string,
    options: QrRasterExportOptions,
): Promise<Blob> {
    assertSafeQrSvg(svg);

    if (typeof document === 'undefined') {
        throw new Error('La exportación rasterizada requiere un navegador.');
    }

    const size = options.size ?? 1_024;

    if (!Number.isInteger(size) || size < 128 || size > 4_096) {
        throw new Error(
            'El tamaño de exportación debe estar entre 128 y 4,096.',
        );
    }

    const quality = options.quality ?? 0.92;

    if (!Number.isFinite(quality) || quality < 0 || quality > 1) {
        throw new Error('La calidad debe estar entre 0 y 1.');
    }

    calculateContrastRatio('#000000', options.backgroundColor ?? '#ffffff');

    const sourceUrl = URL.createObjectURL(createQrSvgBlob(svg));
    const canvas = document.createElement('canvas');

    canvas.width = size;
    canvas.height = size;

    try {
        const image = await loadSvgImage(sourceUrl);
        const context = canvas.getContext('2d', { alpha: true });

        if (!context) {
            throw new Error(
                'El navegador no pudo crear el área de exportación.',
            );
        }

        context.imageSmoothingEnabled = false;
        context.fillStyle = options.backgroundColor ?? '#ffffff';
        context.fillRect(0, 0, size, size);
        context.drawImage(image, 0, 0, size, size);

        const requestedMime =
            options.format === 'webp' ? 'image/webp' : 'image/png';
        const result = await canvasToBlob(canvas, requestedMime, quality);

        if (result.type !== requestedMime) {
            throw new Error(
                `El navegador no admite la exportación ${options.format.toUpperCase()}.`,
            );
        }

        return result;
    } finally {
        URL.revokeObjectURL(sourceUrl);
        canvas.width = 0;
        canvas.height = 0;
    }
}

export function createQrFile(blob: Blob, fileName = 'codigo-qr'): File {
    const extensionByMime: Record<string, string> = {
        'image/png': 'png',
        'image/svg+xml': 'svg',
        'image/svg+xml;charset=utf-8': 'svg',
        'image/webp': 'webp',
    };
    const extension = extensionByMime[blob.type];

    if (!extension) {
        throw new Error(`El tipo “${blob.type}” no puede exportarse como QR.`);
    }

    const withoutControlCharacters = Array.from(fileName)
        .map((character) =>
            (character.codePointAt(0) ?? 0) < 32 ? '-' : character,
        )
        .join('');
    const safeName = withoutControlCharacters
        .replace(/[<>:"/\\|?*]/gu, '-')
        .replace(/\.[^.]+$/u, '')
        .trim()
        .slice(0, 120);

    return new File([blob], `${safeName || 'codigo-qr'}.${extension}`, {
        type: blob.type,
        lastModified: Date.now(),
    });
}

function buildWifiPayload(fields: QrWifiFields, warnings: string[]): string {
    const ssid = requireText(
        fields.ssid,
        'Introduce el nombre de la red Wi-Fi.',
    );
    const security = fields.security ?? 'WPA';
    const password = fields.password ?? '';

    if (security !== 'nopass' && !password) {
        throw new Error('La red protegida necesita una contraseña.');
    }

    if (security === 'nopass' && password) {
        warnings.push(
            'La contraseña fue ignorada porque la red se marcó como abierta.',
        );
    }

    const passwordField =
        security === 'nopass' ? '' : `P:${escapeWifiValue(password)};`;

    return `WIFI:T:${security};S:${escapeWifiValue(ssid)};${passwordField}H:${fields.hidden ? 'true' : 'false'};;`;
}

function buildEmailPayload(fields: QrEmailFields): string {
    const email = validateEmail(fields.email);
    const parameters = new URLSearchParams();

    if (fields.subject?.trim()) {
        parameters.set('subject', fields.subject.trim());
    }

    if (fields.body?.trim()) {
        parameters.set('body', fields.body.trim());
    }

    const query = parameters.toString();

    return `mailto:${email}${query ? `?${query}` : ''}`;
}

function buildSmsPayload(fields: QrSmsFields): string {
    const phone = normalizePhone(fields.phone);
    const message = fields.message?.trim();

    return `sms:${phone}${message ? `?body=${encodeURIComponent(message)}` : ''}`;
}

function buildLocationPayload(fields: QrLocationFields): string {
    const latitude = parseCoordinate(fields.latitude, 'latitud', -90, 90);
    const longitude = parseCoordinate(fields.longitude, 'longitud', -180, 180);
    const label = fields.label?.trim();

    return `geo:${latitude},${longitude}${label ? `?q=${encodeURIComponent(`${latitude},${longitude} (${label})`)}` : ''}`;
}

function buildContactPayload(
    fields: QrContactFields,
    warnings: string[],
): string {
    const firstName = requireText(
        fields.firstName,
        'El contacto necesita al menos un nombre.',
    );
    const lastName = fields.lastName?.trim() ?? '';
    const fullName = `${firstName} ${lastName}`.trim();
    const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`,
        `FN:${escapeVCard(fullName)}`,
    ];

    if (fields.organization?.trim()) {
        lines.push(`ORG:${escapeVCard(fields.organization.trim())}`);
    }

    if (fields.title?.trim()) {
        lines.push(`TITLE:${escapeVCard(fields.title.trim())}`);
    }

    if (fields.phone?.trim()) {
        lines.push(`TEL;TYPE=CELL:${normalizePhone(fields.phone)}`);
    }

    if (fields.email?.trim()) {
        lines.push(`EMAIL:${validateEmail(fields.email)}`);
    }

    if (fields.url?.trim()) {
        lines.push(`URL:${normalizeQrHttpUrl(fields.url, warnings)}`);
    }

    if (fields.address?.trim()) {
        lines.push(`ADR:;;${escapeVCard(fields.address.trim())};;;;`);
    }

    if (fields.note?.trim()) {
        lines.push(`NOTE:${escapeVCard(fields.note.trim())}`);
    }

    lines.push('END:VCARD');

    return lines.join('\r\n');
}

function buildEventPayload(fields: QrEventFields, warnings: string[]): string {
    const title = requireText(fields.title, 'El evento necesita un título.');
    const start = parseEventDate(fields.start, 'inicio');
    const end =
        fields.end === undefined
            ? null
            : parseEventDate(fields.end, 'finalización');

    if (end && end.getTime() < start.getTime()) {
        throw new Error('La finalización no puede ser anterior al inicio.');
    }

    const allDay = fields.allDay ?? false;
    const uid =
        fields.uid?.trim() ||
        `aiven-${fnv1a(`${title}|${start.toISOString()}`)}@local`;
    const createdAt = fields.createdAt
        ? parseEventDate(fields.createdAt, 'creación')
        : start;
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//AIVEN//Generador QR//ES',
        'BEGIN:VEVENT',
        `UID:${escapeICalendar(uid)}`,
        `DTSTAMP:${formatEventDate(createdAt, false)}`,
        `${allDay ? 'DTSTART;VALUE=DATE' : 'DTSTART'}:${formatEventDate(start, allDay)}`,
        `SUMMARY:${escapeICalendar(title)}`,
    ];

    if (!fields.createdAt) {
        warnings.push(
            'La fecha de inicio se utilizó como sello de creación del evento.',
        );
    }

    if (end) {
        lines.push(
            `${allDay ? 'DTEND;VALUE=DATE' : 'DTEND'}:${formatEventDate(end, allDay)}`,
        );
    }

    if (fields.location?.trim()) {
        lines.push(`LOCATION:${escapeICalendar(fields.location.trim())}`);
    }

    if (fields.description?.trim()) {
        lines.push(`DESCRIPTION:${escapeICalendar(fields.description.trim())}`);
    }

    lines.push('END:VEVENT', 'END:VCALENDAR');

    return lines.join('\r\n');
}

export function normalizeQrHttpUrl(
    value: string,
    warnings: string[] = [],
): string {
    const raw = requireText(value, 'Introduce una dirección web.');
    const withProtocol = /^[a-z][a-z\d+.-]*:/iu.test(raw)
        ? raw
        : `https://${raw}`;
    let url: URL;

    try {
        url = new URL(withProtocol);
    } catch {
        throw new Error('La dirección web no es válida.');
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('La dirección debe utilizar HTTP o HTTPS.');
    }

    if (!url.hostname) {
        throw new Error('La dirección web necesita un dominio válido.');
    }

    if (withProtocol !== raw) {
        warnings.push('Se añadió https:// a la dirección web.');
    }

    return url.toString();
}

function normalizePhone(value: string): string {
    const compact = requireText(
        value,
        'Introduce un número telefónico.',
    ).replace(/[\s().-]/gu, '');

    if (!/^\+?\d{6,15}$/u.test(compact)) {
        throw new Error(
            'El teléfono debe contener entre 6 y 15 dígitos y puede comenzar con +.',
        );
    }

    return compact;
}

function validateEmail(value: string): string {
    const email = requireText(value, 'Introduce un correo electrónico.');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
        throw new Error('El correo electrónico no es válido.');
    }

    return email;
}

function parseCoordinate(
    value: number | string,
    label: string,
    minimum: number,
    maximum: number,
): number {
    const numeric =
        typeof value === 'string' && value.trim() !== ''
            ? Number(value)
            : value;

    if (
        typeof numeric !== 'number' ||
        !Number.isFinite(numeric) ||
        numeric < minimum ||
        numeric > maximum
    ) {
        throw new Error(
            `La ${label} debe estar entre ${minimum} y ${maximum}.`,
        );
    }

    return numeric;
}

function parseEventDate(value: Date | string, label: string): Date {
    const date =
        value instanceof Date ? new Date(value.getTime()) : new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw new Error(`La fecha de ${label} no es válida.`);
    }

    return date;
}

function formatEventDate(date: Date, allDay: boolean): string {
    const year = date.getUTCFullYear().toString().padStart(4, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');

    if (allDay) {
        return `${year}${month}${day}`;
    }

    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function escapeWifiValue(value: string): string {
    return value.replace(/([\\;,:"])/gu, '\\$1');
}

function escapeVCard(value: string): string {
    return value
        .replace(/\\/gu, '\\\\')
        .replace(/\r?\n/gu, '\\n')
        .replace(/;/gu, '\\;')
        .replace(/,/gu, '\\,');
}

function escapeICalendar(value: string): string {
    return escapeVCard(value);
}

function requireText(value: string, message: string): string {
    const normalized = value.trim();

    if (!normalized) {
        throw new Error(message);
    }

    return normalized;
}

function fnv1a(value: string): string {
    let hash = 0x811c9dc5;

    for (const character of value) {
        hash ^= character.codePointAt(0) ?? 0;
        hash = Math.imul(hash, 0x01000193);
    }

    return (hash >>> 0).toString(16).padStart(8, '0');
}

interface RgbaColor {
    red: number;
    green: number;
    blue: number;
    alpha: number;
}

function parseColor(value: string): RgbaColor {
    const color = value.trim().toLocaleLowerCase('en');

    if (color.startsWith('#')) {
        return parseHexColor(color);
    }

    const match = color.match(
        /^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})(?:\s*[,/]\s*(0(?:\.\d+)?|1(?:\.0+)?))?\s*\)$/u,
    );

    if (!match) {
        throw new Error(
            `El color “${value}” debe estar en formato hexadecimal o RGB.`,
        );
    }

    const red = Number(match[1]);
    const green = Number(match[2]);
    const blue = Number(match[3]);
    const alpha = match[4] === undefined ? 1 : Number(match[4]);

    if ([red, green, blue].some((channel) => channel > 255)) {
        throw new Error(`El color “${value}” contiene un canal mayor que 255.`);
    }

    return { red, green, blue, alpha };
}

function parseHexColor(value: string): RgbaColor {
    const hexadecimal = value.slice(1);

    if (
        ![3, 4, 6, 8].includes(hexadecimal.length) ||
        !/^[\da-f]+$/u.test(hexadecimal)
    ) {
        throw new Error(`El color “${value}” no es hexadecimal válido.`);
    }

    const expanded =
        hexadecimal.length <= 4
            ? Array.from(hexadecimal)
                  .map((character) => character.repeat(2))
                  .join('')
            : hexadecimal;

    return {
        red: Number.parseInt(expanded.slice(0, 2), 16),
        green: Number.parseInt(expanded.slice(2, 4), 16),
        blue: Number.parseInt(expanded.slice(4, 6), 16),
        alpha:
            expanded.length === 8
                ? Number.parseInt(expanded.slice(6, 8), 16) / 255
                : 1,
    };
}

function composite(foreground: RgbaColor, background: RgbaColor): RgbaColor {
    const alpha = foreground.alpha + background.alpha * (1 - foreground.alpha);

    if (alpha === 0) {
        return { red: 0, green: 0, blue: 0, alpha: 0 };
    }

    return {
        red:
            (foreground.red * foreground.alpha +
                background.red * background.alpha * (1 - foreground.alpha)) /
            alpha,
        green:
            (foreground.green * foreground.alpha +
                background.green * background.alpha * (1 - foreground.alpha)) /
            alpha,
        blue:
            (foreground.blue * foreground.alpha +
                background.blue * background.alpha * (1 - foreground.alpha)) /
            alpha,
        alpha,
    };
}

function relativeLuminance(color: RgbaColor): number {
    const channels = [color.red, color.green, color.blue].map((channel) => {
        const normalized = channel / 255;

        return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
    });

    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function assertSafeQrSvg(svg: string): void {
    const trimmed = svg.trim();

    if (!/^<svg[\s>]/iu.test(trimmed)) {
        throw new Error('El contenido no comienza con un elemento SVG.');
    }

    if (
        /<(?:script|foreignObject|iframe|object|embed)\b/iu.test(trimmed) ||
        /\son[a-z]+\s*=/iu.test(trimmed) ||
        /url\s*\(\s*["']?(?:https?:|\/\/|javascript:)/iu.test(trimmed)
    ) {
        throw new Error(
            'El SVG contiene elementos o referencias no permitidas.',
        );
    }

    for (const match of trimmed.matchAll(
        /(?:href|xlink:href)\s*=\s*["']([^"']+)["']/giu,
    )) {
        const reference = match[1].trim();

        if (
            !reference.startsWith('#') &&
            !/^data:image\/(?:png|jpeg|webp);base64,/iu.test(reference)
        ) {
            throw new Error('El SVG contiene una referencia no permitida.');
        }
    }
}

function loadSvgImage(source: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.decoding = 'async';
        image.onload = () => resolve(image);
        image.onerror = () =>
            reject(new Error('No se pudo interpretar el SVG.'));
        image.src = source;
    });
}

function canvasToBlob(
    canvas: HTMLCanvasElement,
    mimeType: 'image/png' | 'image/webp',
    quality: number,
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('El navegador no pudo exportar el QR.'));
                }
            },
            mimeType,
            quality,
        );
    });
}
