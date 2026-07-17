<?php

use App\Models\Tool;
use App\Models\ToolCategory;
use Database\Seeders\ToolCatalogSeeder;

test('the catalog seeder creates the eight initial categories and complete roadmap', function () {
    $this->seed(ToolCatalogSeeder::class);

    expect(ToolCategory::query()->ordered()->pluck('name')->all())
        ->toBe([
            'Imágenes',
            'Texto',
            'Programación',
            'Redes',
            'Computadoras',
            'Productividad',
            'Seguridad',
            'Herramientas generales',
        ])
        ->and(Tool::query()->count())->toBe(18)
        ->and(Tool::query()->available()->count())->toBe(6);

    expect(Tool::query()->available()->ordered()->pluck('slug')->all())
        ->toBe([
            'generador-qr',
            'generador-contrasenas',
            'comprimir-imagen',
            'convertir-imagen',
            'consumo-pc',
            'calculadora-subredes',
        ]);

    $passwordGenerator = Tool::query()
        ->where('slug', 'generador-contrasenas')
        ->firstOrFail();

    expect($passwordGenerator->is_offline_capable)->toBeTrue()
        ->and($passwordGenerator->history_enabled)->toBeFalse();
});

test('the catalog seeder can run repeatedly without duplicate records', function () {
    $this->seed(ToolCatalogSeeder::class);
    $this->seed(ToolCatalogSeeder::class);

    expect(ToolCategory::query()->count())->toBe(8)
        ->and(Tool::query()->count())->toBe(18);
});
