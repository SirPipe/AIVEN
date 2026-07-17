<?php

use App\Models\User;
use App\UserRole;
use Database\Seeders\DatabaseSeeder;

test('a registered user can be explicitly promoted to administrator', function () {
    $user = User::factory()->create([
        'email' => 'owner@example.com',
    ]);

    $this->artisan('aiven:promote-administrator', [
        'email' => ' OWNER@EXAMPLE.COM ',
    ])->assertSuccessful();

    expect($user->refresh()->role)->toBe(UserRole::Administrator);
});

test('promoting an unknown user fails without creating an account', function () {
    $this->artisan('aiven:promote-administrator', [
        'email' => 'missing@example.com',
    ])->assertFailed();

    expect(User::query()->count())->toBe(0);
});

test('the default seeder never creates predictable credentials', function () {
    $this->seed(DatabaseSeeder::class);

    expect(User::query()->count())->toBe(0);
});
