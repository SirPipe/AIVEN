<?php

use App\Models\Tool;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests must sign in before changing favorites', function () {
    $tool = Tool::factory()->available()->create();

    $this->post(route('tools.favorite.store', $tool))
        ->assertRedirect(route('login'));
});

test('a verified user can add a favorite idempotently and remove it', function () {
    $user = User::factory()->create();
    $tool = Tool::factory()->available()->create();

    $this->actingAs($user)
        ->postJson(route('tools.favorite.store', $tool))
        ->assertOk()
        ->assertJson(['toolId' => $tool->id, 'isFavorite' => true]);

    $this->actingAs($user)
        ->postJson(route('tools.favorite.store', $tool))
        ->assertOk();

    expect($user->favoriteTools()->whereKey($tool->id)->count())->toBe(1);

    $this->actingAs($user)
        ->deleteJson(route('tools.favorite.destroy', $tool))
        ->assertOk()
        ->assertJson(['toolId' => $tool->id, 'isFavorite' => false]);

    expect($user->favoriteTools()->whereKey($tool->id)->exists())->toBeFalse();
});

test('favorite collections are private to each user', function () {
    $this->withoutVite();

    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $tool = Tool::factory()->available()->create();
    $owner->favoriteTools()->attach($tool);

    $this->actingAs($otherUser)
        ->get(route('tools.favorites'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('tools/index')
            ->where('mode', 'favorites')
            ->has('tools', 0),
        );
});
