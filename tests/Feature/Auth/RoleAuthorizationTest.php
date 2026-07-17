<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected from the administrator overview', function () {
    $this->get(route('admin.overview'))
        ->assertRedirect(route('login'));
});

test('registered users cannot visit the administrator overview', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.overview'))
        ->assertForbidden();
});

test('moderators are prepared but cannot visit the administrator overview', function () {
    $moderator = User::factory()->moderator()->create();

    $this->actingAs($moderator)
        ->get(route('admin.overview'))
        ->assertForbidden();
});

test('administrators can visit the administrator overview', function () {
    $this->withoutVite();

    $administrator = User::factory()->administrator()->create();

    $this->actingAs($administrator)
        ->get(route('admin.overview'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/overview')
            ->where('stats.totalUsers', 1)
            ->where('stats.administrators', 1)
            ->has('recentUsers', 1),
        );
});
