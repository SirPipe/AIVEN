import {
    Calculator,
    Cpu,
    Gauge,
    RefreshCcw,
    ShieldAlert,
    ShieldCheck,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
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
import { calculatePcPower, PC_COMPONENT_CATALOG } from '@/lib/tools/pc-power';
import type { MotherboardSize, PcPowerResult } from '@/lib/tools/pc-power';
import type { ToolRuntimeProps } from '@/types/tool-runtime';

type PcMode = 'advanced' | 'simple';

function NumberField({
    id,
    label,
    max,
    min = 0,
    onChange,
    step = 1,
    suffix,
    value,
}: {
    id: string;
    label: string;
    max?: number;
    min?: number;
    onChange: (value: number) => void;
    step?: number;
    suffix?: string;
    value: number;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="relative">
                <Input
                    id={id}
                    type="number"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(event) => onChange(Number(event.target.value))}
                    className={suffix ? 'pr-12' : undefined}
                />
                {suffix && (
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
}

function Metric({
    label,
    value,
    emphasis = false,
}: {
    emphasis?: boolean;
    label: string;
    value: string;
}) {
    return (
        <div
            className={
                emphasis
                    ? 'rounded-2xl border border-primary/20 bg-primary/[0.045] p-4'
                    : 'rounded-2xl border bg-background p-4'
            }
        >
            <dt className="text-xs font-medium text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-1 text-2xl font-semibold tracking-tight">
                {value}
            </dd>
        </div>
    );
}

export default function PcPowerCalculator({
    favoriteAction,
    initialConfiguration,
    offlineShell,
    recordHistory,
    related,
    tool,
}: ToolRuntimeProps) {
    const [mode, setMode] = useState<PcMode>(() =>
        historyString(
            initialConfiguration,
            'mode',
            ['simple', 'advanced'] as const,
            'simple',
        ),
    );
    const [cpuId, setCpuId] = useState(() =>
        historyString(
            initialConfiguration,
            'cpuId',
            PC_COMPONENT_CATALOG.cpus.map((cpu) => cpu.id),
            'cpu-mainstream-65',
        ),
    );
    const [gpuId, setGpuId] = useState(() =>
        historyString(
            initialConfiguration,
            'gpuId',
            PC_COMPONENT_CATALOG.gpus.map((gpu) => gpu.id),
            'gpu-mainstream-200',
        ),
    );
    const [motherboardSize, setMotherboardSize] = useState<MotherboardSize>(
        () =>
            historyString(
                initialConfiguration,
                'motherboardSize',
                ['mini-itx', 'micro-atx', 'atx', 'e-atx'] as const,
                'atx',
            ),
    );
    const [memoryModules, setMemoryModules] = useState(() =>
        historyNumber(initialConfiguration, 'memoryModules', 2, {
            integer: true,
            max: 64,
            min: 0,
        }),
    );
    const [solidStateDrives, setSolidStateDrives] = useState(() =>
        historyNumber(initialConfiguration, 'solidStateDrives', 1, {
            integer: true,
            max: 64,
            min: 0,
        }),
    );
    const [hardDrives, setHardDrives] = useState(() =>
        historyNumber(initialConfiguration, 'hardDrives', 0, {
            integer: true,
            max: 64,
            min: 0,
        }),
    );
    const [fans, setFans] = useState(() =>
        historyNumber(initialConfiguration, 'fans', 3, {
            integer: true,
            max: 64,
            min: 0,
        }),
    );
    const [liquidCoolingPumps, setLiquidCoolingPumps] = useState(() =>
        historyNumber(initialConfiguration, 'liquidCoolingPumps', 0, {
            integer: true,
            max: 16,
            min: 0,
        }),
    );
    const [expansionCards, setExpansionCards] = useState(() =>
        historyNumber(initialConfiguration, 'expansionCards', 0, {
            integer: true,
            max: 32,
            min: 0,
        }),
    );
    const [usbDevices, setUsbDevices] = useState(() =>
        historyNumber(initialConfiguration, 'usbDevices', 2, {
            integer: true,
            max: 64,
            min: 0,
        }),
    );
    const [rgbDevices, setRgbDevices] = useState(() =>
        historyNumber(initialConfiguration, 'rgbDevices', 0, {
            integer: true,
            max: 64,
            min: 0,
        }),
    );
    const [manualWatts, setManualWatts] = useState(() =>
        historyNumber(initialConfiguration, 'manualWatts', 0, {
            max: 50000,
            min: 0,
        }),
    );
    const [overclockPercent, setOverclockPercent] = useState(() =>
        historyNumber(initialConfiguration, 'overclockPercent', 0, {
            max: 100,
            min: 0,
        }),
    );
    const [safetyMarginPercent, setSafetyMarginPercent] = useState(() =>
        historyNumber(initialConfiguration, 'safetyMarginPercent', 25, {
            max: 100,
            min: 0,
        }),
    );
    const [psuEfficiencyPercent, setPsuEfficiencyPercent] = useState(() =>
        historyNumber(initialConfiguration, 'psuEfficiencyPercent', 85, {
            max: 98,
            min: 50,
        }),
    );
    const [selectedPsuWatts, setSelectedPsuWatts] = useState(() =>
        historyNumber(initialConfiguration, 'selectedPsuWatts', 650, {
            max: 10000,
            min: 1,
        }),
    );
    const [usageHoursPerDay, setUsageHoursPerDay] = useState(() =>
        historyNumber(initialConfiguration, 'hoursPerDay', 8, {
            max: 24,
            min: 0.1,
        }),
    );
    const [averageLoadPercent, setAverageLoadPercent] = useState(() =>
        historyNumber(initialConfiguration, 'averageLoadPercent', 50, {
            max: 100,
            min: 0,
        }),
    );
    const [electricityPricePerKwh, setElectricityPricePerKwh] = useState(() =>
        historyNumber(initialConfiguration, 'pricePerKwh', 1.2, {
            max: 1000,
            min: 0,
        }),
    );
    const [result, setResult] = useState<PcPowerResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const calculate = () => {
        try {
            const nextResult = calculatePcPower({
                cpuId,
                gpuId,
                motherboardSize,
                memoryModules,
                solidStateDrives,
                hardDrives,
                fans,
                liquidCoolingPumps,
                expansionCards,
                usbDevices,
                rgbDevices,
                customComponents:
                    mode === 'advanced' && manualWatts > 0
                        ? [
                              {
                                  name: 'Consumo manual adicional',
                                  idleWatts: 0,
                                  loadWatts: manualWatts,
                                  peakWatts: manualWatts * 1.2,
                              },
                          ]
                        : [],
                overclockPercent: mode === 'advanced' ? overclockPercent : 0,
                safetyMarginPercent,
                psuEfficiencyPercent,
                selectedPsuWatts,
                usageHoursPerDay,
                averageLoadPercent,
                electricityPricePerKwh,
                currency: 'MXN',
            });

            setResult(nextResult);
            setError(null);
            recordHistory('completed', {
                averageLoadPercent,
                cpuId,
                expansionCards,
                fans,
                gpuId,
                hardDrives,
                watts: nextResult.cost.averageWallWatts,
                hoursPerDay: nextResult.cost.usageHoursPerDay,
                daysPerMonth: 30,
                liquidCoolingPumps,
                manualWatts,
                memoryModules,
                mode,
                pricePerKwh: nextResult.cost.pricePerKwh,
                motherboardSize,
                monthlyKwh: Number(
                    (nextResult.cost.dailyKwh * 30.4375).toFixed(2),
                ),
                monthlyCost: nextResult.cost.monthly,
                overclockPercent,
                psuEfficiencyPercent,
                rgbDevices,
                safetyMarginPercent,
                selectedPsuWatts,
                solidStateDrives,
                usbDevices,
            });
        } catch (calculationError) {
            setResult(null);
            setError(
                calculationError instanceof Error
                    ? calculationError.message
                    : 'No fue posible calcular el consumo.',
            );
        }
    };
    const reset = () => {
        setCpuId('cpu-mainstream-65');
        setGpuId('gpu-mainstream-200');
        setMotherboardSize('atx');
        setMemoryModules(2);
        setSolidStateDrives(1);
        setHardDrives(0);
        setFans(3);
        setLiquidCoolingPumps(0);
        setExpansionCards(0);
        setUsbDevices(2);
        setRgbDevices(0);
        setManualWatts(0);
        setOverclockPercent(0);
        setSafetyMarginPercent(25);
        setPsuEfficiencyPercent(85);
        setSelectedPsuWatts(650);
        setUsageHoursPerDay(8);
        setAverageLoadPercent(50);
        setElectricityPricePerKwh(1.2);
        setResult(null);
        setError(null);
    };

    const resultPanel = result ? (
        <div className="grid gap-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="secondary">
                    Catálogo {result.catalogVersion}
                </Badge>
                <span className="text-xs text-muted-foreground">
                    Estimación educativa
                </span>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
                <Metric
                    label="Reposo estimado"
                    value={`${result.idleWatts} W`}
                />
                <Metric
                    label="Carga estimada"
                    value={`${result.loadWatts} W`}
                />
                <Metric
                    label="Pico aproximado"
                    value={`${result.peakWatts} W`}
                />
                <Metric
                    label="Fuente mínima"
                    value={`${result.minimumPsuWatts} W`}
                />
                <Metric
                    label="Fuente recomendada"
                    value={`${result.recommendedPsuWatts} W`}
                    emphasis
                />
                <Metric
                    label="Margen incluido"
                    value={`${result.safetyMarginWatts} W · ${result.safetyMarginPercent}%`}
                />
            </dl>

            <Card className="gap-3 rounded-2xl py-4">
                <CardHeader className="px-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Zap className="size-4 text-amber-500" />
                        Costo aproximado
                    </CardTitle>
                    <CardDescription>
                        Usa {result.cost.averageWallWatts} W promedio en la
                        pared, {result.cost.usageHoursPerDay} h al día y una
                        carga media de {result.cost.averageLoadPercent}%.
                    </CardDescription>
                </CardHeader>
                <div className="grid grid-cols-3 gap-2 px-4 text-center">
                    <div className="rounded-xl bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Diario</p>
                        <p className="mt-1 font-semibold">
                            ${result.cost.daily.toLocaleString('es-MX')} MXN
                        </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Mensual</p>
                        <p className="mt-1 font-semibold">
                            ${result.cost.monthly.toLocaleString('es-MX')} MXN
                        </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Anual</p>
                        <p className="mt-1 font-semibold">
                            ${result.cost.annual.toLocaleString('es-MX')} MXN
                        </p>
                    </div>
                </div>
            </Card>

            <div className="overflow-x-auto rounded-2xl border">
                <table className="w-full min-w-[32rem] text-left text-sm">
                    <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 font-medium">
                                Componente
                            </th>
                            <th className="px-4 py-3 text-right font-medium">
                                Reposo
                            </th>
                            <th className="px-4 py-3 text-right font-medium">
                                Carga
                            </th>
                            <th className="px-4 py-3 text-right font-medium">
                                Pico
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {result.breakdown.map((item) => (
                            <tr key={item.id}>
                                <td className="px-4 py-3">
                                    {item.label}
                                    {item.quantity > 1 && ` × ${item.quantity}`}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {item.idleWatts} W
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {item.loadWatts} W
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {item.peakWatts} W
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {result.warnings.length > 0 && (
                <Alert>
                    <ShieldAlert aria-hidden="true" />
                    <AlertTitle>Advertencias importantes</AlertTitle>
                    <AlertDescription>
                        <ul className="grid gap-1.5">
                            {result.warnings.map((warning) => (
                                <li key={warning}>• {warning}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            <Button type="button" variant="outline" onClick={reset}>
                <RefreshCcw aria-hidden="true" />
                Reiniciar cálculo
            </Button>
        </div>
    ) : (
        <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed p-8 text-center">
            <div className="space-y-3">
                <Gauge className="mx-auto size-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                    Selecciona los componentes para estimar consumo y fuente.
                </p>
            </div>
        </div>
    );

    return (
        <AivenToolLayout
            tool={tool}
            icon={<Calculator className="size-7" />}
            favoriteAction={favoriteAction}
            offlineShell={offlineShell}
            related={related}
            result={
                <div className="grid gap-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Revisa los valores</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {resultPanel}
                </div>
            }
            resultDescription="Estimación de consumo DC, consumo en pared, picos, fuente y costo de energía."
            helpItems={[
                {
                    question: '¿El TDP equivale al consumo real?',
                    answer: 'No. AIVEN utiliza perfiles genéricos de reposo, carga y pico para orientación. El comportamiento real depende del modelo, límites de potencia, carga y configuración.',
                },
                {
                    question: '¿Una fuente más grande consume más?',
                    answer: 'No necesariamente. El equipo toma la energía que necesita; la eficiencia de la fuente y el punto de carga influyen en el consumo de la pared.',
                },
                {
                    question:
                        '¿Puedo comprar usando únicamente este resultado?',
                    answer: 'Úsalo como punto de partida. Verifica potencia recomendada, conectores, estándar ATX, dimensiones, rieles y picos con los fabricantes de CPU, GPU y fuente.',
                },
            ]}
            privacy={
                <Card className="gap-3 rounded-[1.5rem] border-emerald-500/20 bg-emerald-500/[0.035] py-5">
                    <CardHeader className="px-5">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                            Cálculo transparente
                        </CardTitle>
                        <CardDescription>
                            Todo se calcula en tu dispositivo con un catálogo
                            genérico versionado. Puedes revisar el desglose y
                            modificar cada supuesto.
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
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        type="button"
                        variant={mode === 'simple' ? 'default' : 'outline'}
                        onClick={() => setMode('simple')}
                    >
                        Modo sencillo
                    </Button>
                    <Button
                        type="button"
                        variant={mode === 'advanced' ? 'default' : 'outline'}
                        onClick={() => setMode('advanced')}
                    >
                        Modo avanzado
                    </Button>
                </div>

                <fieldset className="grid gap-4 rounded-2xl border p-4">
                    <legend className="px-2 text-sm font-semibold">
                        Componentes principales
                    </legend>
                    <div className="grid gap-2">
                        <Label>Procesador</Label>
                        <Select value={cpuId} onValueChange={setCpuId}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PC_COMPONENT_CATALOG.cpus.map((cpu) => (
                                    <SelectItem key={cpu.id} value={cpu.id}>
                                        {cpu.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Tarjeta gráfica</Label>
                        <Select value={gpuId} onValueChange={setGpuId}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PC_COMPONENT_CATALOG.gpus.map((gpu) => (
                                    <SelectItem key={gpu.id} value={gpu.id}>
                                        {gpu.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Tarjeta madre</Label>
                        <Select
                            value={motherboardSize}
                            onValueChange={(value) =>
                                setMotherboardSize(value as MotherboardSize)
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mini-itx">
                                    Mini-ITX
                                </SelectItem>
                                <SelectItem value="micro-atx">
                                    Micro-ATX
                                </SelectItem>
                                <SelectItem value="atx">ATX</SelectItem>
                                <SelectItem value="e-atx">E-ATX</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </fieldset>

                <fieldset className="grid gap-4 rounded-2xl border p-4">
                    <legend className="px-2 text-sm font-semibold">
                        Cantidades
                    </legend>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <NumberField
                            id="pc-memory"
                            label="Módulos RAM"
                            max={16}
                            value={memoryModules}
                            onChange={setMemoryModules}
                        />
                        <NumberField
                            id="pc-ssd"
                            label="Unidades SSD"
                            max={16}
                            value={solidStateDrives}
                            onChange={setSolidStateDrives}
                        />
                        <NumberField
                            id="pc-hdd"
                            label="Discos duros"
                            max={16}
                            value={hardDrives}
                            onChange={setHardDrives}
                        />
                        <NumberField
                            id="pc-fans"
                            label="Ventiladores"
                            max={30}
                            value={fans}
                            onChange={setFans}
                        />
                        <NumberField
                            id="pc-pumps"
                            label="Bombas líquidas"
                            max={4}
                            value={liquidCoolingPumps}
                            onChange={setLiquidCoolingPumps}
                        />
                        <NumberField
                            id="pc-expansion"
                            label="Tarjetas adicionales"
                            max={10}
                            value={expansionCards}
                            onChange={setExpansionCards}
                        />
                        <NumberField
                            id="pc-usb"
                            label="Dispositivos USB"
                            max={30}
                            value={usbDevices}
                            onChange={setUsbDevices}
                        />
                        <NumberField
                            id="pc-rgb"
                            label="Conjuntos RGB"
                            max={20}
                            value={rgbDevices}
                            onChange={setRgbDevices}
                        />
                    </div>
                </fieldset>

                {mode === 'advanced' && (
                    <fieldset className="grid gap-4 rounded-2xl border border-primary/15 bg-primary/[0.025] p-4">
                        <legend className="px-2 text-sm font-semibold">
                            Ajustes avanzados
                        </legend>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <NumberField
                                id="pc-manual"
                                label="Consumo manual adicional"
                                max={2_000}
                                suffix="W"
                                value={manualWatts}
                                onChange={setManualWatts}
                            />
                            <NumberField
                                id="pc-overclock"
                                label="Aumento por overclock"
                                max={100}
                                suffix="%"
                                value={overclockPercent}
                                onChange={setOverclockPercent}
                            />
                            <NumberField
                                id="pc-margin"
                                label="Margen de seguridad"
                                max={100}
                                suffix="%"
                                value={safetyMarginPercent}
                                onChange={setSafetyMarginPercent}
                            />
                            <NumberField
                                id="pc-efficiency"
                                label="Eficiencia de la fuente"
                                min={50}
                                max={98}
                                suffix="%"
                                value={psuEfficiencyPercent}
                                onChange={setPsuEfficiencyPercent}
                            />
                            <NumberField
                                id="pc-selected-psu"
                                label="Fuente seleccionada"
                                min={1}
                                max={3_000}
                                suffix="W"
                                value={selectedPsuWatts}
                                onChange={setSelectedPsuWatts}
                            />
                            <NumberField
                                id="pc-hours"
                                label="Horas de uso al día"
                                max={24}
                                step={0.5}
                                suffix="h"
                                value={usageHoursPerDay}
                                onChange={setUsageHoursPerDay}
                            />
                            <NumberField
                                id="pc-average-load"
                                label="Carga promedio"
                                max={100}
                                suffix="%"
                                value={averageLoadPercent}
                                onChange={setAverageLoadPercent}
                            />
                            <NumberField
                                id="pc-electricity"
                                label="Precio de electricidad"
                                max={1_000}
                                step={0.01}
                                suffix="MXN/kWh"
                                value={electricityPricePerKwh}
                                onChange={setElectricityPricePerKwh}
                            />
                        </div>
                    </fieldset>
                )}

                <Alert>
                    <Cpu aria-hidden="true" />
                    <AlertTitle>
                        Perfiles genéricos, no modelos comerciales
                    </AlertTitle>
                    <AlertDescription>
                        Selecciona el perfil de potencia más cercano y verifica
                        después los límites y conectores exactos del fabricante.
                    </AlertDescription>
                </Alert>

                <Button type="submit" size="lg">
                    <Gauge aria-hidden="true" />
                    Calcular consumo y fuente
                </Button>
            </form>
        </AivenToolLayout>
    );
}
