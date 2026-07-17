export type IPv4AddressTypeCode =
    | 'public'
    | 'private'
    | 'loopback'
    | 'link-local'
    | 'cgnat'
    | 'documentation'
    | 'multicast'
    | 'reserved'
    | 'unspecified'
    | 'limited-broadcast';

export interface SubnetInputObject {
    address?: string;
    ip?: string;
    cidr?: number;
    mask?: string;
}

export type SubnetInput = string | SubnetInputObject;

export interface IPv4AddressType {
    code: IPv4AddressTypeCode;
    label: string;
    description: string;
}

export interface SubnetBinaryRepresentation {
    ip: string;
    mask: string;
    network: string;
    broadcast: string;
    networkBits: string;
    hostBits: string;
    annotatedIp: string;
}

export interface SubnetResult {
    ip: string;
    cidr: number;
    mask: string;
    network: string;
    broadcast: string;
    firstUsable: string;
    lastUsable: string;
    totalAddresses: number;
    usableHosts: number;
    historicalClass: 'A' | 'B' | 'C' | 'D' | 'E';
    addressType: IPv4AddressType;
    binary: SubnetBinaryRepresentation;
    explanation: string[];
}

export interface SubnetExample {
    label: string;
    input: string;
    description: string;
}

const MAX_IPV4 = 0xffff_ffffn;
const OCTET_COUNT = 4;

export const subnetExamples: readonly SubnetExample[] = Object.freeze([
    {
        label: 'Red doméstica /24',
        input: '192.168.1.10/24',
        description: 'Ejemplo privado con 254 hosts utilizables.',
    },
    {
        label: 'Enlace punto a punto /31',
        input: '10.0.0.4/31',
        description: 'Ambas direcciones pueden usarse en un enlace RFC 3021.',
    },
    {
        label: 'Ruta de host /32',
        input: '203.0.113.8/32',
        description: 'Representa una única dirección IPv4.',
    },
    {
        label: 'Máscara decimal',
        input: '172.16.20.15/255.255.240.0',
        description: 'El prefijo se obtiene de una máscara contigua.',
    },
]);

export function calculateSubnet(input: SubnetInput): SubnetResult {
    const normalized = normalizeSubnetInput(input);
    const ipValue = parseIPv4(normalized.address);
    const cidr = resolveCidr(normalized.cidr, normalized.mask);
    const maskValue = prefixToMask(cidr);
    const networkValue = ipValue & maskValue;
    const broadcastValue = networkValue | (MAX_IPV4 ^ maskValue);
    const totalAddresses = 2 ** (32 - cidr);
    const usable = calculateUsableRange(networkValue, broadcastValue, cidr);
    const ipBinary = toBinary(ipValue);
    const mask = formatIPv4(maskValue);
    const network = formatIPv4(networkValue);
    const broadcast = formatIPv4(broadcastValue);
    const networkBits = ipBinary.slice(0, cidr);
    const hostBits = ipBinary.slice(cidr);

    return {
        ip: formatIPv4(ipValue),
        cidr,
        mask,
        network,
        broadcast,
        firstUsable: formatIPv4(usable.first),
        lastUsable: formatIPv4(usable.last),
        totalAddresses,
        usableHosts: usable.count,
        historicalClass: getHistoricalClass(ipValue),
        addressType: classifyAddress(ipValue),
        binary: {
            ip: formatBinaryOctets(ipBinary),
            mask: formatBinaryOctets(toBinary(maskValue)),
            network: formatBinaryOctets(toBinary(networkValue)),
            broadcast: formatBinaryOctets(toBinary(broadcastValue)),
            networkBits,
            hostBits,
            annotatedIp: `${networkBits || '∅'} | ${hostBits || '∅'}`,
        },
        explanation: buildExplanation(
            cidr,
            mask,
            network,
            broadcast,
            usable.count,
        ),
    };
}

function normalizeSubnetInput(input: SubnetInput): {
    address: string;
    cidr?: number;
    mask?: string;
} {
    if (typeof input === 'string') {
        return parseCombinedInput(input);
    }

    const suppliedAddress = input.address ?? input.ip;

    if (!suppliedAddress) {
        throw new Error('Introduce una dirección IPv4.');
    }

    const parsed = parseCombinedInput(suppliedAddress);
    const cidr = mergeOptionalValues(
        parsed.cidr,
        input.cidr,
        'El prefijo CIDR aparece con valores diferentes.',
    );
    const mask = mergeOptionalValues(
        parsed.mask,
        input.mask?.trim(),
        'La máscara aparece con valores diferentes.',
    );

    return { address: parsed.address, cidr, mask };
}

function parseCombinedInput(value: string): {
    address: string;
    cidr?: number;
    mask?: string;
} {
    if (value !== value.trim() || /\s/u.test(value)) {
        throw new Error('La dirección no debe contener espacios.');
    }

    const parts = value.split('/');

    if (parts.length > 2 || parts[0] === '') {
        throw new Error('Utiliza el formato IPv4/prefijo o IPv4/máscara.');
    }

    const address = parts[0];
    const suffix = parts[1];

    if (suffix === undefined || suffix === '') {
        return { address };
    }

    if (suffix.includes('.')) {
        return { address, mask: suffix };
    }

    if (!/^\d{1,2}$/u.test(suffix)) {
        throw new Error('El prefijo CIDR debe ser un entero entre 0 y 32.');
    }

    return { address, cidr: Number(suffix) };
}

function resolveCidr(cidr?: number, mask?: string): number {
    const prefixFromMask = mask === undefined ? undefined : maskToPrefix(mask);

    if (
        cidr !== undefined &&
        prefixFromMask !== undefined &&
        cidr !== prefixFromMask
    ) {
        throw new Error('La máscara decimal y el prefijo CIDR no coinciden.');
    }

    const resolved = cidr ?? prefixFromMask ?? 32;

    if (!Number.isInteger(resolved) || resolved < 0 || resolved > 32) {
        throw new Error('El prefijo CIDR debe ser un entero entre 0 y 32.');
    }

    return resolved;
}

function maskToPrefix(mask: string): number {
    const maskValue = parseIPv4(mask);
    const bits = toBinary(maskValue);

    if (!/^1*0*$/u.test(bits)) {
        throw new Error('La máscara decimal debe tener bits contiguos.');
    }

    const firstZero = bits.indexOf('0');

    return firstZero === -1 ? 32 : firstZero;
}

function prefixToMask(cidr: number): bigint {
    if (cidr === 0) {
        return 0n;
    }

    return (MAX_IPV4 << BigInt(32 - cidr)) & MAX_IPV4;
}

function parseIPv4(address: string): bigint {
    const octets = address.split('.');

    if (octets.length !== OCTET_COUNT) {
        throw new Error('La dirección IPv4 debe contener cuatro octetos.');
    }

    let value = 0n;

    for (const octet of octets) {
        if (!/^(?:0|[1-9]\d{0,2})$/u.test(octet)) {
            throw new Error(`El octeto “${octet || 'vacío'}” no es válido.`);
        }

        const numericOctet = Number(octet);

        if (numericOctet > 255) {
            throw new Error(`El octeto “${octet}” no puede superar 255.`);
        }

        value = (value << 8n) | BigInt(numericOctet);
    }

    return value;
}

function formatIPv4(value: bigint): string {
    return [24n, 16n, 8n, 0n]
        .map((shift) => Number((value >> shift) & 0xffn).toString())
        .join('.');
}

function toBinary(value: bigint): string {
    return value.toString(2).padStart(32, '0');
}

function formatBinaryOctets(bits: string): string {
    return bits.match(/.{8}/gu)?.join('.') ?? bits;
}

function calculateUsableRange(
    network: bigint,
    broadcast: bigint,
    cidr: number,
): { first: bigint; last: bigint; count: number } {
    if (cidr === 32) {
        return { first: network, last: network, count: 1 };
    }

    if (cidr === 31) {
        return { first: network, last: broadcast, count: 2 };
    }

    return {
        first: network + 1n,
        last: broadcast - 1n,
        count: 2 ** (32 - cidr) - 2,
    };
}

function getHistoricalClass(ip: bigint): 'A' | 'B' | 'C' | 'D' | 'E' {
    const firstOctet = Number((ip >> 24n) & 0xffn);

    if (firstOctet <= 127) {
        return 'A';
    }

    if (firstOctet <= 191) {
        return 'B';
    }

    if (firstOctet <= 223) {
        return 'C';
    }

    if (firstOctet <= 239) {
        return 'D';
    }

    return 'E';
}

function classifyAddress(ip: bigint): IPv4AddressType {
    if (ip === 0n) {
        return {
            code: 'unspecified',
            label: 'No especificada',
            description: '0.0.0.0 representa una dirección no especificada.',
        };
    }

    if (ip === MAX_IPV4) {
        return {
            code: 'limited-broadcast',
            label: 'Broadcast limitado',
            description: '255.255.255.255 se limita al segmento local.',
        };
    }

    const ranges: Array<{
        network: string;
        cidr: number;
        type: IPv4AddressType;
    }> = [
        {
            network: '10.0.0.0',
            cidr: 8,
            type: privateAddressType(),
        },
        {
            network: '172.16.0.0',
            cidr: 12,
            type: privateAddressType(),
        },
        {
            network: '192.168.0.0',
            cidr: 16,
            type: privateAddressType(),
        },
        {
            network: '127.0.0.0',
            cidr: 8,
            type: {
                code: 'loopback',
                label: 'Loopback',
                description:
                    'Se utiliza para comunicación con el equipo local.',
            },
        },
        {
            network: '169.254.0.0',
            cidr: 16,
            type: {
                code: 'link-local',
                label: 'Enlace local',
                description: 'Dirección autoconfigurada para el enlace local.',
            },
        },
        {
            network: '100.64.0.0',
            cidr: 10,
            type: {
                code: 'cgnat',
                label: 'CGNAT',
                description:
                    'Espacio compartido por operadores para traducción de direcciones.',
            },
        },
        ...documentationRanges(),
        {
            network: '224.0.0.0',
            cidr: 4,
            type: {
                code: 'multicast',
                label: 'Multicast',
                description: 'Dirección destinada a grupos multicast.',
            },
        },
        {
            network: '240.0.0.0',
            cidr: 4,
            type: {
                code: 'reserved',
                label: 'Reservada',
                description:
                    'Espacio reservado para usos especiales o futuros.',
            },
        },
        {
            network: '0.0.0.0',
            cidr: 8,
            type: {
                code: 'reserved',
                label: 'Red actual',
                description: 'Bloque reservado para identificar la red actual.',
            },
        },
        {
            network: '198.18.0.0',
            cidr: 15,
            type: {
                code: 'reserved',
                label: 'Pruebas de rendimiento',
                description:
                    'Bloque reservado para pruebas comparativas de red.',
            },
        },
    ];

    for (const range of ranges) {
        if (isInRange(ip, parseIPv4(range.network), range.cidr)) {
            return range.type;
        }
    }

    return {
        code: 'public',
        label: 'Pública',
        description:
            'No pertenece a uno de los bloques especiales identificados por la calculadora.',
    };
}

function privateAddressType(): IPv4AddressType {
    return {
        code: 'private',
        label: 'Privada',
        description: 'Dirección reservada para redes privadas RFC 1918.',
    };
}

function documentationRanges(): Array<{
    network: string;
    cidr: number;
    type: IPv4AddressType;
}> {
    const type: IPv4AddressType = {
        code: 'documentation',
        label: 'Documentación',
        description: 'Bloque reservado para ejemplos y documentación.',
    };

    return ['192.0.2.0', '198.51.100.0', '203.0.113.0'].map((network) => ({
        network,
        cidr: 24,
        type,
    }));
}

function isInRange(ip: bigint, network: bigint, cidr: number): boolean {
    const mask = prefixToMask(cidr);

    return (ip & mask) === network;
}

function buildExplanation(
    cidr: number,
    mask: string,
    network: string,
    broadcast: string,
    usableHosts: number,
): string[] {
    const explanation = [
        `El prefijo /${cidr} reserva ${cidr} bits para red y ${32 - cidr} para host.`,
        `La máscara contigua equivalente es ${mask}.`,
        `Al aplicar la máscara se obtiene la red ${network}.`,
        `Al activar todos los bits de host se obtiene ${broadcast}.`,
    ];

    if (cidr === 31) {
        explanation.push(
            'En una /31, las dos direcciones pueden representar extremos de un enlace punto a punto RFC 3021.',
        );
    } else if (cidr === 32) {
        explanation.push(
            'Una /32 identifica una sola dirección y no reserva direcciones separadas de red y broadcast.',
        );
    } else {
        explanation.push(
            `Tras reservar red y broadcast quedan ${usableHosts.toLocaleString('es-MX')} hosts utilizables según el modelo tradicional.`,
        );
    }

    explanation.push(
        'La clase A/B/C mostrada es histórica; las redes modernas se dimensionan con CIDR.',
    );

    return explanation;
}

function mergeOptionalValues<T>(
    first: T | undefined,
    second: T | undefined,
    message: string,
): T | undefined {
    if (first !== undefined && second !== undefined && first !== second) {
        throw new Error(message);
    }

    return first ?? second;
}
