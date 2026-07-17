<?php

use App\Models\Tool;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
});

test('an offline capable tool exposes a cacheable anonymous shell', function () {
    $user = User::factory()->create();
    $tool = Tool::factory()->available()->create([
        'slug' => 'calculadora-subredes',
        'is_offline_capable' => true,
    ]);

    $this->actingAs($user)
        ->get(route('tools.offline-shell', $tool))
        ->assertOk()
        ->assertHeader('X-Aiven-Public-Tool-Shell', '1')
        ->assertHeader('Cache-Control', 'max-age=3600, public, stale-while-revalidate=86400')
        ->assertInertia(fn (Assert $page) => $page
            ->component('tools/show')
            ->where('tool.slug', 'calculadora-subredes')
            ->where('offlineShell', true)
            ->where('isFavorite', false)
            ->where('auth.user', null),
        );
});

test('tools without offline support do not expose a public shell', function () {
    $tool = Tool::factory()->available()->create([
        'is_offline_capable' => false,
    ]);

    $this->get(route('tools.offline-shell', $tool))->assertNotFound();
});

test('tools that require login never expose a public offline shell', function () {
    $tool = Tool::factory()->available()->create([
        'slug' => 'generador-qr',
        'is_offline_capable' => true,
        'requires_login' => true,
    ]);

    $this->get(route('tools.offline-shell', $tool))
        ->assertNotFound()
        ->assertHeaderMissing('X-Aiven-Public-Tool-Shell');
});
