<?php

namespace App\Support;

use App\Models\Tool;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ToolHistoryPayloadSanitizer
{
    private const MAX_PAYLOAD_BYTES = 2048;

    /**
     * @var array<int, string>
     */
    private const PROHIBITED_KEY_SEGMENTS = [
        'password',
        'contrasena',
        'content',
        'contenido',
        'file',
        'archivo',
        'qr',
        'ip',
        'cidr',
        'address',
        'direccion',
    ];

    /**
     * @param  array<string, mixed>  $payload
     * @return array{safe_configuration: array<string, mixed>, summary: string}
     */
    public function sanitize(Tool $tool, array $payload): array
    {
        if (! $tool->status->isAvailable() || ! $tool->history_enabled) {
            throw ValidationException::withMessages([
                'history' => 'Esta herramienta no admite historial en este momento.',
            ]);
        }

        if ($this->containsProhibitedData($payload)) {
            throw ValidationException::withMessages([
                'safe_configuration' => 'El historial no acepta contraseñas, contenido, archivos, códigos QR ni direcciones IP.',
            ]);
        }

        $rules = $this->rulesFor($tool->slug);
        $unknownKeys = array_diff(array_keys($payload), array_keys($rules));

        if ($unknownKeys !== []) {
            throw ValidationException::withMessages([
                'safe_configuration' => 'El historial contiene campos no permitidos para esta herramienta.',
            ]);
        }

        $validated = Validator::make($payload, $rules)->validate();
        $encodedPayload = json_encode($validated, JSON_THROW_ON_ERROR);

        if (mb_strlen($encodedPayload, '8bit') > self::MAX_PAYLOAD_BYTES) {
            throw ValidationException::withMessages([
                'safe_configuration' => 'Los datos del historial superan el tamaño permitido.',
            ]);
        }

        return [
            'safe_configuration' => $validated,
            'summary' => $this->summaryFor($tool->slug, $validated),
        ];
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function rulesFor(string $slug): array
    {
        return match ($slug) {
            'generador-qr' => [
                'size' => ['required', 'integer', 'min:128', 'max:2048'],
                'errorCorrection' => ['sometimes', 'string', Rule::in(['L', 'M', 'Q', 'H'])],
                'format' => ['required', 'string', Rule::in(['png', 'svg', 'webp'])],
                'margin' => ['sometimes', 'integer', 'min:0', 'max:20'],
                'shape' => ['sometimes', 'string', Rule::in(['square', 'rounded', 'dots'])],
                'foregroundColor' => ['sometimes', 'string', 'regex:/^#[0-9a-f]{6}$/i'],
                'backgroundColor' => ['sometimes', 'string', 'regex:/^#[0-9a-f]{6}$/i'],
            ],
            'comprimir-imagen' => [
                'originalBytes' => ['required', 'integer', 'min:1', 'max:52428800'],
                'resultBytes' => ['required', 'integer', 'min:1', 'max:52428800'],
                'quality' => ['sometimes', 'integer', 'min:1', 'max:100'],
                'format' => ['required', 'string', Rule::in(['jpeg', 'jpg', 'png', 'webp', 'avif'])],
                'maxDimension' => ['sometimes', 'integer', 'min:64', 'max:8192'],
                'targetKilobytes' => ['sometimes', 'integer', 'min:0', 'max:20480'],
            ],
            'convertir-imagen' => [
                'sourceFormat' => ['required', 'string', Rule::in(['jpeg', 'jpg', 'png', 'webp', 'avif', 'gif', 'bmp'])],
                'targetFormat' => ['required', 'string', Rule::in(['jpeg', 'png', 'webp', 'avif'])],
                'originalBytes' => ['sometimes', 'integer', 'min:1', 'max:262144000'],
                'resultBytes' => ['sometimes', 'integer', 'min:1', 'max:262144000'],
                'quality' => ['sometimes', 'integer', 'min:1', 'max:100'],
                'backgroundColor' => ['sometimes', 'string', 'regex:/^#[0-9a-f]{6}$/i'],
                'resizeEnabled' => ['sometimes', 'boolean'],
                'maxDimension' => ['sometimes', 'integer', 'min:64', 'max:8192'],
            ],
            'consumo-pc' => [
                'watts' => ['required', 'numeric', 'min:1', 'max:50000'],
                'hoursPerDay' => ['required', 'numeric', 'min:0.1', 'max:24'],
                'daysPerMonth' => ['required', 'integer', 'min:1', 'max:31'],
                'pricePerKwh' => ['required', 'numeric', 'min:0', 'max:1000'],
                'monthlyKwh' => ['sometimes', 'numeric', 'min:0', 'max:1000000'],
                'monthlyCost' => ['sometimes', 'numeric', 'min:0', 'max:100000000'],
                'mode' => ['sometimes', 'string', Rule::in(['simple', 'advanced'])],
                'cpuId' => ['sometimes', 'string', 'max:80', 'regex:/^[a-z0-9-]+$/'],
                'gpuId' => ['sometimes', 'string', 'max:80', 'regex:/^[a-z0-9-]+$/'],
                'motherboardSize' => ['sometimes', 'string', Rule::in(['mini-itx', 'micro-atx', 'atx', 'e-atx'])],
                'memoryModules' => ['sometimes', 'integer', 'min:0', 'max:64'],
                'solidStateDrives' => ['sometimes', 'integer', 'min:0', 'max:64'],
                'hardDrives' => ['sometimes', 'integer', 'min:0', 'max:64'],
                'fans' => ['sometimes', 'integer', 'min:0', 'max:64'],
                'liquidCoolingPumps' => ['sometimes', 'integer', 'min:0', 'max:16'],
                'expansionCards' => ['sometimes', 'integer', 'min:0', 'max:32'],
                'usbDevices' => ['sometimes', 'integer', 'min:0', 'max:64'],
                'rgbDevices' => ['sometimes', 'integer', 'min:0', 'max:64'],
                'manualWatts' => ['sometimes', 'numeric', 'min:0', 'max:50000'],
                'overclockPercent' => ['sometimes', 'numeric', 'min:0', 'max:100'],
                'safetyMarginPercent' => ['sometimes', 'numeric', 'min:0', 'max:100'],
                'psuEfficiencyPercent' => ['sometimes', 'numeric', 'min:50', 'max:98'],
                'selectedPsuWatts' => ['sometimes', 'numeric', 'min:1', 'max:10000'],
                'averageLoadPercent' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            ],
            'calculadora-subredes' => [
                'prefixLength' => ['required', 'integer', 'min:0', 'max:32'],
                'usableHosts' => ['sometimes', 'integer', 'min:0', 'max:4294967294'],
                'totalAddresses' => ['sometimes', 'integer', 'min:1', 'max:4294967296'],
                'mode' => ['sometimes', 'string', Rule::in(['beginner', 'advanced'])],
            ],
            default => throw ValidationException::withMessages([
                'history' => 'La herramienta no tiene una política de historial segura.',
            ]),
        };
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function summaryFor(string $slug, array $data): string
    {
        return match ($slug) {
            'generador-qr' => "Código QR {$data['size']} px · ".Str::upper((string) $data['format']),
            'comprimir-imagen' => "Compresión: {$data['originalBytes']} B → {$data['resultBytes']} B",
            'convertir-imagen' => 'Conversión '.Str::upper((string) $data['sourceFormat']).' → '.Str::upper((string) $data['targetFormat']),
            'consumo-pc' => 'Consumo estimado: '.$this->monthlyKilowattHours($data).' kWh/mes',
            'calculadora-subredes' => $this->subnetSummary($data),
            default => throw ValidationException::withMessages([
                'history' => 'La herramienta no tiene una política de historial segura.',
            ]),
        };
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function monthlyKilowattHours(array $data): float
    {
        $kilowattHours = $data['monthlyKwh'] ?? (
            ((float) $data['watts'] / 1000)
            * (float) $data['hoursPerDay']
            * (int) $data['daysPerMonth']
        );

        return round((float) $kilowattHours, 2);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function subnetSummary(array $data): string
    {
        $summary = "Subred /{$data['prefixLength']}";

        if (isset($data['usableHosts'])) {
            $summary .= " · {$data['usableHosts']} hosts útiles";
        }

        return $summary;
    }

    /**
     * @param  array<array-key, mixed>  $payload
     */
    private function containsProhibitedData(array $payload): bool
    {
        foreach ($payload as $key => $value) {
            $segments = explode('_', Str::snake(Str::ascii((string) $key)));

            if (array_intersect($segments, self::PROHIBITED_KEY_SEGMENTS) !== []) {
                return true;
            }

            if (is_array($value) && $this->containsProhibitedData($value)) {
                return true;
            }

            if (is_string($value) && $this->isIpAddress($value)) {
                return true;
            }
        }

        return false;
    }

    private function isIpAddress(string $value): bool
    {
        $address = Str::before($value, '/');

        return filter_var($address, FILTER_VALIDATE_IP) !== false;
    }
}
