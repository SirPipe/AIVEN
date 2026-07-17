import type { SafeToolConfiguration } from '@/types/tool-runtime';

type NumberLimits = {
    integer?: boolean;
    max: number;
    min: number;
};

export function historyNumber(
    configuration: SafeToolConfiguration | null | undefined,
    key: string,
    fallback: number,
    limits: NumberLimits,
): number {
    const value = configuration?.[key];

    if (
        typeof value !== 'number' ||
        !Number.isFinite(value) ||
        value < limits.min ||
        value > limits.max ||
        (limits.integer === true && !Number.isInteger(value))
    ) {
        return fallback;
    }

    return value;
}

export function historyString<T extends string>(
    configuration: SafeToolConfiguration | null | undefined,
    key: string,
    allowedValues: readonly T[],
    fallback: T,
): T {
    const value = configuration?.[key];

    return typeof value === 'string' && allowedValues.includes(value as T)
        ? (value as T)
        : fallback;
}

export function historyColor(
    configuration: SafeToolConfiguration | null | undefined,
    key: string,
    fallback: string,
): string {
    const value = configuration?.[key];

    return typeof value === 'string' && /^#[0-9a-f]{6}$/iu.test(value)
        ? value
        : fallback;
}
