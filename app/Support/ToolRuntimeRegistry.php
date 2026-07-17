<?php

namespace App\Support;

final class ToolRuntimeRegistry
{
    /**
     * @var list<string>
     */
    private const SUPPORTED_SLUGS = [
        'generador-qr',
        'generador-contrasenas',
        'comprimir-imagen',
        'convertir-imagen',
        'consumo-pc',
        'calculadora-subredes',
    ];

    public static function supports(string $slug): bool
    {
        return in_array($slug, self::SUPPORTED_SLUGS, true);
    }

    /**
     * @return list<string>
     */
    public static function slugs(): array
    {
        return self::SUPPORTED_SLUGS;
    }
}
