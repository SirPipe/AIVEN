<?php

use App\Models\Tool;
use App\Models\ToolCategory;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
});

test('guests can browse available and upcoming tools but not disabled tools', function () {
    $category = ToolCategory::factory()->create(['name' => 'Seguridad']);
    $available = Tool::factory()->for($category, 'toolCategory')->available()->create([
        'display_order' => 10,
    ]);
    $upcoming = Tool::factory()->for($category, 'toolCategory')->comingSoon()->create([
        'display_order' => 20,
    ]);
    Tool::factory()->for($category, 'toolCategory')->disabled()->create();

    $this->get(route('tools.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('tools/index')
            ->has('categories', 1)
            ->has('tools', 2)
            ->where('tools.0.slug', $available->slug)
            ->where('tools.1.slug', $upcoming->slug)
            ->where('favoriteToolIds', [])
            ->where('recentHistory', []),
        );
});

test('a guest can open a complete tool without signing in', function () {
    $tool = Tool::factory()->available()->create([
        'slug' => 'generador-qr',
        'name' => 'Generador QR',
    ]);

    $this->get(route('tools.show', $tool))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('tools/show')
            ->where('tool.slug', 'generador-qr')
            ->where('tool.historyEnabled', true)
            ->where('isFavorite', false)
            ->where('offlineShell', false),
        );
});

test('a tool that requires login redirects guests and remains available to authenticated users', function () {
    $tool = Tool::factory()->available()->create([
        'slug' => 'generador-qr',
        'requires_login' => true,
    ]);

    $this->get(route('tools.show', $tool))
        ->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create())
        ->get(route('tools.show', $tool))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('tools/show')
            ->where('tool.slug', 'generador-qr')
            ->where('tool.requiresLogin', true),
        );
});

test('inactive categories and disabled tools are not public', function () {
    $inactiveCategory = ToolCategory::factory()->inactive()->create();
    $inactiveTool = Tool::factory()
        ->for($inactiveCategory, 'toolCategory')
        ->available()
        ->create();
    $disabledTool = Tool::factory()->disabled()->create();

    $this->get(route('tools.category', $inactiveCategory))->assertNotFound();
    $this->get(route('tools.show', $inactiveTool))->assertNotFound();
    $this->get(route('tools.show', $disabledTool))->assertNotFound();
});
