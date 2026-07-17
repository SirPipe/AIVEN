<?php

use App\Models\Tool;
use App\Models\ToolHistory;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $this->withoutVite();

    $user = User::factory()->create();
    $favorite = Tool::factory()->available()->create();
    $user->favoriteTools()->attach($favorite);
    ToolHistory::factory()->for($user)->for($favorite)->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('favoriteTools', 1)
            ->where('favoriteTools.0.id', $favorite->id)
            ->has('recentToolHistory', 1)
            ->where('recentToolHistory.0.tool.id', $favorite->id),
        );
});
