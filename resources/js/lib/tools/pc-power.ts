export interface PowerDraw {
    idleWatts: number;
    loadWatts: number;
    peakWatts: number;
}

export interface PcPowerCatalogEntry extends PowerDraw {
    id: string;
    label: string;
    description: string;
}

export interface PcComponentCatalog {
    version: string;
    updatedAt: string;
    methodology: string;
    cpus: readonly PcPowerCatalogEntry[];
    gpus: readonly PcPowerCatalogEntry[];
}

export type MotherboardSize = 'mini-itx' | 'micro-atx' | 'atx' | 'e-atx';

export interface CustomPcComponent extends PowerDraw {
    name: string;
    quantity?: number;
}

export interface PcPowerInput {
    cpuId?: string;
    gpuId?: string;
    cpuOverride?: PowerDraw & { label?: string };
    gpuOverride?: PowerDraw & { label?: string };
    motherboardSize?: MotherboardSize;
    memoryModules?: number;
    solidStateDrives?: number;
    hardDrives?: number;
    fans?: number;
    liquidCoolingPumps?: number;
    expansionCards?: number;
    usbDevices?: number;
    rgbDevices?: number;
    customComponents?: readonly CustomPcComponent[];
    overclockPercent?: number;
    safetyMarginPercent?: number;
    psuEfficiencyPercent?: number;
    selectedPsuWatts?: number;
    usageHoursPerDay?: number;
    averageLoadPercent?: number;
    electricityPricePerKwh?: number;
    currency?: string;
}

export interface PcPowerBreakdownItem extends PowerDraw {
    id: string;
    label: string;
    quantity: number;
}

export interface PcPowerCostEstimate {
    currency: string;
    pricePerKwh: number;
    usageHoursPerDay: number;
    averageLoadPercent: number;
    averageDcWatts: number;
    averageWallWatts: number;
    dailyKwh: number;
    daily: number;
    monthly: number;
    annual: number;
}

export interface PcPowerResult {
    catalogVersion: string;
    idleWatts: number;
    loadWatts: number;
    peakWatts: number;
    wallIdleWatts: number;
    wallLoadWatts: number;
    wallPeakWatts: number;
    minimumPsuWatts: number;
    recommendedPsuWatts: number;
    safetyMarginPercent: number;
    safetyMarginWatts: number;
    psuEfficiencyPercent: number;
    selectedPsuHeadroomWatts: number | null;
    cost: PcPowerCostEstimate;
    breakdown: PcPowerBreakdownItem[];
    warnings: string[];
    assumptions: string[];
}

const CPU_CATALOG: readonly PcPowerCatalogEntry[] = Object.freeze([
    {
        id: 'cpu-efficient-35',
        label: 'CPU eficiente · perfil 35 W',
        description: 'Procesador compacto o configurado para bajo consumo.',
        idleWatts: 4,
        loadWatts: 35,
        peakWatts: 45,
    },
    {
        id: 'cpu-mainstream-65',
        label: 'CPU estándar · perfil 65 W',
        description: 'Perfil general para equipos domésticos y de oficina.',
        idleWatts: 7,
        loadWatts: 65,
        peakWatts: 90,
    },
    {
        id: 'cpu-performance-125',
        label: 'CPU de alto rendimiento · perfil 125 W',
        description: 'Perfil para cargas sostenidas de creación o juego.',
        idleWatts: 10,
        loadWatts: 125,
        peakWatts: 180,
    },
    {
        id: 'cpu-enthusiast-170',
        label: 'CPU entusiasta · perfil 170 W',
        description: 'Perfil de referencia para plataformas de consumo alto.',
        idleWatts: 14,
        loadWatts: 170,
        peakWatts: 230,
    },
]);

const GPU_CATALOG: readonly PcPowerCatalogEntry[] = Object.freeze([
    {
        id: 'gpu-integrated',
        label: 'Gráficos integrados',
        description: 'Su consumo principal ya está incluido en el perfil CPU.',
        idleWatts: 0,
        loadWatts: 0,
        peakWatts: 0,
    },
    {
        id: 'gpu-entry-75',
        label: 'GPU básica · perfil 75 W',
        description: 'Tarjeta sin alimentación auxiliar o de entrada.',
        idleWatts: 7,
        loadWatts: 75,
        peakWatts: 95,
    },
    {
        id: 'gpu-mainstream-200',
        label: 'GPU estándar · perfil 200 W',
        description: 'Perfil general para juego o creación de contenido.',
        idleWatts: 12,
        loadWatts: 200,
        peakWatts: 260,
    },
    {
        id: 'gpu-performance-320',
        label: 'GPU de alto rendimiento · perfil 320 W',
        description: 'Perfil para tarjetas con alimentación auxiliar elevada.',
        idleWatts: 18,
        loadWatts: 320,
        peakWatts: 430,
    },
    {
        id: 'gpu-enthusiast-450',
        label: 'GPU entusiasta · perfil 450 W',
        description: 'Perfil de referencia con picos transitorios altos.',
        idleWatts: 24,
        loadWatts: 450,
        peakWatts: 600,
    },
]);

export const PC_COMPONENT_CATALOG: PcComponentCatalog = Object.freeze({
    version: '2026.07.1',
    updatedAt: '2026-07-17',
    methodology:
        'Perfiles genéricos de diseño para estimación educativa; no representan mediciones de modelos comerciales concretos.',
    cpus: CPU_CATALOG,
    gpus: GPU_CATALOG,
});

const MOTHERBOARD_PROFILES: Record<MotherboardSize, PowerDraw> = {
    'mini-itx': { idleWatts: 15, loadWatts: 30, peakWatts: 40 },
    'micro-atx': { idleWatts: 20, loadWatts: 40, peakWatts: 55 },
    atx: { idleWatts: 25, loadWatts: 50, peakWatts: 70 },
    'e-atx': { idleWatts: 32, loadWatts: 65, peakWatts: 90 },
};

const STANDARD_PSU_CAPACITIES = Object.freeze([
    300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 1_000,
    1_200, 1_300, 1_500, 1_600, 2_000,
]);

export function calculatePcPower(input: PcPowerInput): PcPowerResult {
    const cpu = resolveCatalogComponent(
        'CPU',
        input.cpuId ?? 'cpu-mainstream-65',
        input.cpuOverride,
        PC_COMPONENT_CATALOG.cpus,
    );
    const gpu = resolveCatalogComponent(
        'GPU',
        input.gpuId ?? 'gpu-integrated',
        input.gpuOverride,
        PC_COMPONENT_CATALOG.gpus,
    );
    const motherboardSize = input.motherboardSize ?? 'atx';
    const overclockPercent = validateRange(
        input.overclockPercent ?? 0,
        'overclock',
        0,
        100,
    );
    const safetyMarginPercent = validateRange(
        input.safetyMarginPercent ?? 25,
        'margen de seguridad',
        0,
        100,
    );
    const efficiencyPercent = validateRange(
        input.psuEfficiencyPercent ?? 85,
        'eficiencia de la fuente',
        50,
        98,
    );
    const efficiency = efficiencyPercent / 100;
    const breakdown: PcPowerBreakdownItem[] = [
        createBreakdownItem('cpu', cpu.label, 1, cpu),
        createBreakdownItem('gpu', gpu.label, 1, gpu),
        createBreakdownItem(
            'motherboard',
            `Tarjeta madre ${motherboardSize.toUpperCase()}`,
            1,
            MOTHERBOARD_PROFILES[motherboardSize],
        ),
    ];

    addCountedComponent(
        breakdown,
        'memory',
        'Módulo de memoria RAM',
        input.memoryModules ?? 2,
        { idleWatts: 1, loadWatts: 3, peakWatts: 5 },
    );
    addCountedComponent(
        breakdown,
        'ssd',
        'Unidad SSD',
        input.solidStateDrives ?? 1,
        { idleWatts: 0.3, loadWatts: 3, peakWatts: 6 },
    );
    addCountedComponent(breakdown, 'hdd', 'Disco duro', input.hardDrives ?? 0, {
        idleWatts: 4,
        loadWatts: 8,
        peakWatts: 15,
    });
    addCountedComponent(breakdown, 'fan', 'Ventilador', input.fans ?? 3, {
        idleWatts: 1,
        loadWatts: 2.5,
        peakWatts: 4,
    });
    addCountedComponent(
        breakdown,
        'pump',
        'Bomba de refrigeración líquida',
        input.liquidCoolingPumps ?? 0,
        { idleWatts: 4, loadWatts: 8, peakWatts: 12 },
    );
    addCountedComponent(
        breakdown,
        'expansion',
        'Tarjeta de expansión',
        input.expansionCards ?? 0,
        { idleWatts: 2, loadWatts: 10, peakWatts: 25 },
    );
    addCountedComponent(
        breakdown,
        'usb',
        'Dispositivo USB',
        input.usbDevices ?? 2,
        { idleWatts: 0.5, loadWatts: 2.5, peakWatts: 5 },
    );
    addCountedComponent(
        breakdown,
        'rgb',
        'Conjunto de iluminación RGB',
        input.rgbDevices ?? 0,
        { idleWatts: 1, loadWatts: 3, peakWatts: 5 },
    );
    addCustomComponents(breakdown, input.customComponents ?? []);

    applyOverclock(breakdown, overclockPercent);

    const idleWatts = sumBreakdown(breakdown, 'idleWatts');
    const loadWatts = sumBreakdown(breakdown, 'loadWatts');
    const peakWatts = sumBreakdown(breakdown, 'peakWatts');
    const minimumPsuWatts = roundPsuCapacity(peakWatts * 1.1);
    const recommendedPsuWatts = roundPsuCapacity(
        peakWatts * (1 + safetyMarginPercent / 100),
    );
    const selectedPsu =
        input.selectedPsuWatts === undefined
            ? null
            : validateRange(
                  input.selectedPsuWatts,
                  'potencia de la fuente seleccionada',
                  1,
                  10_000,
              );
    const selectedPsuHeadroomWatts =
        selectedPsu === null ? null : round(selectedPsu - peakWatts);
    const cost = calculateCost(input, idleWatts, loadWatts, efficiency);
    const warnings = buildWarnings({
        gpuPeakWatts: gpu.peakWatts,
        overclockPercent,
        safetyMarginPercent,
        selectedPsu,
        minimumPsuWatts,
        recommendedPsuWatts,
    });

    return {
        catalogVersion: PC_COMPONENT_CATALOG.version,
        idleWatts: round(idleWatts),
        loadWatts: round(loadWatts),
        peakWatts: round(peakWatts),
        wallIdleWatts: round(idleWatts / efficiency),
        wallLoadWatts: round(loadWatts / efficiency),
        wallPeakWatts: round(peakWatts / efficiency),
        minimumPsuWatts,
        recommendedPsuWatts,
        safetyMarginPercent,
        safetyMarginWatts: round(recommendedPsuWatts - peakWatts),
        psuEfficiencyPercent: efficiencyPercent,
        selectedPsuHeadroomWatts,
        cost,
        breakdown,
        warnings,
        assumptions: [
            PC_COMPONENT_CATALOG.methodology,
            'Los vatios de componentes representan carga de corriente continua; el costo usa consumo aproximado en la pared tras aplicar eficiencia.',
            'El pico es una reserva transitoria y no se utiliza directamente para calcular energía diaria.',
            'La recomendación debe verificarse con conectores, rieles, factor de forma y especificaciones del fabricante.',
        ],
    };
}

function resolveCatalogComponent(
    kind: string,
    id: string,
    override: (PowerDraw & { label?: string }) | undefined,
    catalog: readonly PcPowerCatalogEntry[],
): PcPowerCatalogEntry {
    if (override) {
        validatePowerDraw(override, kind);

        return {
            id: `${kind.toLocaleLowerCase('es')}-manual`,
            label: override.label?.trim() || `${kind} manual`,
            description: 'Valores introducidos manualmente.',
            idleWatts: override.idleWatts,
            loadWatts: override.loadWatts,
            peakWatts: override.peakWatts,
        };
    }

    const component = catalog.find((entry) => entry.id === id);

    if (!component) {
        throw new Error(`No existe el perfil ${kind} “${id}”.`);
    }

    return component;
}

function createBreakdownItem(
    id: string,
    label: string,
    quantity: number,
    draw: PowerDraw,
): PcPowerBreakdownItem {
    validatePowerDraw(draw, label);

    return {
        id,
        label,
        quantity,
        idleWatts: round(draw.idleWatts * quantity),
        loadWatts: round(draw.loadWatts * quantity),
        peakWatts: round(draw.peakWatts * quantity),
    };
}

function addCountedComponent(
    breakdown: PcPowerBreakdownItem[],
    id: string,
    label: string,
    quantity: number,
    draw: PowerDraw,
): void {
    const validatedQuantity = validateInteger(quantity, label, 0, 100);

    if (validatedQuantity > 0) {
        breakdown.push(createBreakdownItem(id, label, validatedQuantity, draw));
    }
}

function addCustomComponents(
    breakdown: PcPowerBreakdownItem[],
    components: readonly CustomPcComponent[],
): void {
    if (components.length > 50) {
        throw new Error('No se permiten más de 50 componentes personalizados.');
    }

    components.forEach((component, index) => {
        const name = component.name.trim();

        if (!name) {
            throw new Error(
                `El componente personalizado ${index + 1} necesita un nombre.`,
            );
        }

        breakdown.push(
            createBreakdownItem(
                `custom-${index + 1}`,
                name,
                validateInteger(component.quantity ?? 1, name, 1, 100),
                component,
            ),
        );
    });
}

function applyOverclock(
    breakdown: PcPowerBreakdownItem[],
    overclockPercent: number,
): void {
    if (overclockPercent === 0) {
        return;
    }

    const factor = 1 + overclockPercent / 100;

    for (const component of breakdown) {
        if (component.id === 'cpu' || component.id === 'gpu') {
            component.loadWatts = round(component.loadWatts * factor);
            component.peakWatts = round(component.peakWatts * factor);
        }
    }
}

function sumBreakdown(
    breakdown: readonly PcPowerBreakdownItem[],
    key: keyof PowerDraw,
): number {
    return breakdown.reduce((total, item) => total + item[key], 0);
}

function roundPsuCapacity(requiredWatts: number): number {
    const standard = STANDARD_PSU_CAPACITIES.find(
        (capacity) => capacity >= requiredWatts,
    );

    return standard ?? Math.ceil(requiredWatts / 50) * 50;
}

function calculateCost(
    input: PcPowerInput,
    idleWatts: number,
    loadWatts: number,
    efficiency: number,
): PcPowerCostEstimate {
    const usageHoursPerDay = validateRange(
        input.usageHoursPerDay ?? 8,
        'horas de uso diario',
        0,
        24,
    );
    const averageLoadPercent = validateRange(
        input.averageLoadPercent ?? 50,
        'carga promedio',
        0,
        100,
    );
    const pricePerKwh = validateRange(
        input.electricityPricePerKwh ?? 0,
        'precio de electricidad',
        0,
        1_000_000,
    );
    const averageDcWatts =
        idleWatts + (loadWatts - idleWatts) * (averageLoadPercent / 100);
    const averageWallWatts = averageDcWatts / efficiency;
    const dailyKwh = (averageWallWatts * usageHoursPerDay) / 1_000;
    const daily = dailyKwh * pricePerKwh;

    return {
        currency: input.currency?.trim() || 'MXN',
        pricePerKwh: round(pricePerKwh, 4),
        usageHoursPerDay,
        averageLoadPercent,
        averageDcWatts: round(averageDcWatts),
        averageWallWatts: round(averageWallWatts),
        dailyKwh: round(dailyKwh, 4),
        daily: round(daily, 2),
        monthly: round(daily * 30.4375, 2),
        annual: round(daily * 365, 2),
    };
}

function buildWarnings(context: {
    gpuPeakWatts: number;
    overclockPercent: number;
    safetyMarginPercent: number;
    selectedPsu: number | null;
    minimumPsuWatts: number;
    recommendedPsuWatts: number;
}): string[] {
    const warnings = [
        'Esta es una estimación educativa, no una medición eléctrica.',
        'Una fuente de mayor capacidad no obliga al equipo a consumir más energía.',
    ];

    if (context.safetyMarginPercent < 20) {
        warnings.push(
            'El margen de seguridad es bajo; revisa picos, envejecimiento y futuras ampliaciones.',
        );
    }

    if (context.overclockPercent > 0) {
        warnings.push(
            'El consumo por overclock varía de forma no lineal; el porcentaje aplicado es sólo una aproximación.',
        );
    }

    if (context.gpuPeakWatts >= 95) {
        warnings.push(
            'Verifica los conectores, cables y requisitos transitorios de la tarjeta gráfica seleccionada.',
        );
    }

    if (
        context.selectedPsu !== null &&
        context.selectedPsu < context.minimumPsuWatts
    ) {
        warnings.push(
            'La fuente seleccionada está por debajo de la capacidad mínima estimada.',
        );
    } else if (
        context.selectedPsu !== null &&
        context.selectedPsu < context.recommendedPsuWatts
    ) {
        warnings.push(
            'La fuente seleccionada supera el mínimo, pero no alcanza la recomendación con margen.',
        );
    }

    return warnings;
}

function validatePowerDraw(draw: PowerDraw, name: string): void {
    const values = [draw.idleWatts, draw.loadWatts, draw.peakWatts];

    if (values.some((value) => !Number.isFinite(value) || value < 0)) {
        throw new Error(`Los consumos de ${name} deben ser números positivos.`);
    }

    if (draw.idleWatts > draw.loadWatts || draw.loadWatts > draw.peakWatts) {
        throw new Error(
            `Los consumos de ${name} deben cumplir reposo ≤ carga ≤ pico.`,
        );
    }
}

function validateInteger(
    value: number,
    name: string,
    minimum: number,
    maximum: number,
): number {
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
        throw new Error(
            `La cantidad de ${name} debe ser un entero entre ${minimum} y ${maximum}.`,
        );
    }

    return value;
}

function validateRange(
    value: number,
    name: string,
    minimum: number,
    maximum: number,
): number {
    if (!Number.isFinite(value) || value < minimum || value > maximum) {
        throw new Error(
            `El valor de ${name} debe estar entre ${minimum} y ${maximum}.`,
        );
    }

    return value;
}

function round(value: number, decimals = 1): number {
    const factor = 10 ** decimals;

    return Math.round((value + Number.EPSILON) * factor) / factor;
}
