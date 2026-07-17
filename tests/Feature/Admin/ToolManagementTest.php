<?php

use App\Models\Tool;
use App\Models\ToolCategory;
use App\Models\User;
use App\ToolStatus;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
});

test('only administrators can access tool management', function () {
    $this->get(route('admin.tools.index'))->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create())
        ->get(route('admin.tools.index'))
        ->assertForbidden();
});

test('administrators can inspect catalog status and usage statistics', function () {
    $administrator = User::factory()->administrator()->create();
    Tool::factory()->available()->create(['usage_count' => 25]);
    Tool::factory()->comingSoon()->create();

    $this->actingAs($administrator)
        ->get(route('admin.tools.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/tools/index')
            ->has('tools', 2)
            ->where('stats.total', 2)
            ->where('stats.available', 1)
            ->where('stats.comingSoon', 1),
        );
});

test('administrators can create a coming soon tool with server managed identifiers', function () {
    $administrator = User::factory()->administrator()->create();
    $category = ToolCategory::factory()->create();

    $this->actingAs($administrator)
        ->post(route('admin.tools.store'), [
            'category_id' => $category->id,
            'name' => 'Conversor de archivos',
            'slug' => 'Conversor de Archivos',
            'short_description' => 'Convierte archivos localmente entre formatos compatibles.',
            'full_description' => 'Una ficha inicial para planear el conversor sin publicar un runtime incompleto.',
            'icon' => 'file-cog',
            'tags' => 'archivos, conversión, archivos',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.tools.index'));

    $tool = Tool::query()->where('slug', 'conversor-de-archivos')->sole();

    expect($tool->tool_category_id)->toBe($category->id)
        ->and($tool->name)->toBe('Conversor de archivos')
        ->and($tool->status)->toBe(ToolStatus::ComingSoon)
        ->and($tool->key)->toStartWith('catalog-conversor-de-archivos-')
        ->and($tool->implementation)->toStartWith('pending-conversor-de-archivos-')
        ->and($tool->tags)->toBe(['archivos', 'conversión'])
        ->and($tool->is_featured)->toBeFalse()
        ->and($tool->is_offline_capable)->toBeFalse()
        ->and($tool->history_enabled)->toBeFalse();
});

test('non administrators cannot create tools', function () {
    $category = ToolCategory::factory()->create();

    $this->actingAs(User::factory()->create())
        ->post(route('admin.tools.store'), [
            'category_id' => $category->id,
            'name' => 'Herramienta privada',
            'slug' => 'herramienta-privada',
            'short_description' => 'Esta herramienta no debe llegar al catálogo.',
        ])
        ->assertForbidden();

    expect(Tool::query()->where('slug', 'herramienta-privada')->exists())->toBeFalse();
});

test('tool creation requires a unique slug and rejects managed fields', function () {
    $administrator = User::factory()->administrator()->create();
    $category = ToolCategory::factory()->create();
    Tool::factory()->for($category, 'toolCategory')->create([
        'slug' => 'utilidad-existente',
    ]);

    $this->actingAs($administrator)
        ->post(route('admin.tools.store'), [
            'category_id' => $category->id,
            'name' => 'Utilidad duplicada',
            'slug' => 'Utilidad Existente',
            'short_description' => 'Intenta reutilizar una identidad que ya existe.',
            'status' => ToolStatus::Available->value,
            'key' => 'manual-key',
            'implementation' => 'manual-runtime',
        ])
        ->assertSessionHasErrors(['slug', 'status', 'key', 'implementation']);

    expect(Tool::query()->where('slug', 'utilidad-existente')->count())->toBe(1);
});

test('tool creation validates its catalog metadata', function () {
    $administrator = User::factory()->administrator()->create();

    $this->actingAs($administrator)
        ->post(route('admin.tools.store'), [
            'category_id' => PHP_INT_MAX,
            'name' => 'No',
            'slug' => '***',
            'short_description' => 'Breve',
            'full_description' => str_repeat('a', 4001),
            'icon' => 'Alert Triangle',
            'tags' => ['válida', '<script>'],
        ])
        ->assertSessionHasErrors([
            'category_id',
            'name',
            'slug',
            'short_description',
            'full_description',
            'icon',
            'tags.1',
        ]);
});

test('administrators can publish configure and reorder a tool without changing its implementation', function () {
    $administrator = User::factory()->administrator()->create();
    $category = ToolCategory::factory()->create();
    $nextCategory = ToolCategory::factory()->create();
    $tool = Tool::factory()->for($category, 'toolCategory')->comingSoon()->create([
        'key' => 'stable-key',
        'slug' => 'generador-qr',
        'implementation' => 'stable-implementation',
        'usage_count' => 41,
    ]);

    $this->actingAs($administrator)
        ->patch(route('admin.tools.update', $tool), [
            'category_id' => $nextCategory->id,
            'name' => 'Herramienta publicada',
            'short_description' => 'Una descripción suficientemente amplia.',
            'status' => ToolStatus::Available->value,
            'display_order' => 15,
            'is_featured' => true,
            'is_new' => true,
            'is_offline_capable' => true,
            'requires_login' => false,
            'tags' => 'útil, conversión',
        ])
        ->assertRedirect();

    $tool->refresh();

    expect($tool->tool_category_id)->toBe($nextCategory->id)
        ->and($tool->name)->toBe('Herramienta publicada')
        ->and($tool->status)->toBe(ToolStatus::Available)
        ->and($tool->display_order)->toBe(15)
        ->and($tool->is_featured)->toBeTrue()
        ->and($tool->is_offline_capable)->toBeTrue()
        ->and($tool->tags)->toBe(['útil', 'conversión'])
        ->and($tool->key)->toBe('stable-key')
        ->and($tool->slug)->toBe('generador-qr')
        ->and($tool->implementation)->toBe('stable-implementation')
        ->and($tool->usage_count)->toBe(41);
});

test('administrators cannot publish or enable offline support without a registered runtime', function (array $attributes, string $errorKey) {
    $administrator = User::factory()->administrator()->create();
    $tool = Tool::factory()->comingSoon()->create([
        'slug' => 'herramienta-sin-runtime',
    ]);

    $this->actingAs($administrator)
        ->patch(route('admin.tools.update', $tool), $attributes)
        ->assertSessionHasErrors($errorKey);

    $tool->refresh();

    expect($tool->status)->toBe(ToolStatus::ComingSoon)
        ->and($tool->is_offline_capable)->toBeFalse();
})->with([
    'publish as available' => [['status' => ToolStatus::Available->value], 'status'],
    'enable offline support' => [['is_offline_capable' => true], 'is_offline_capable'],
]);

test('administrators cannot mutate protected tool identifiers or usage counts', function () {
    $administrator = User::factory()->administrator()->create();
    $tool = Tool::factory()->available()->create();

    $this->actingAs($administrator)
        ->patch(route('admin.tools.update', $tool), [
            'slug' => 'changed',
            'usage_count' => 999999,
        ])
        ->assertSessionHasErrors(['slug', 'usage_count']);
});
