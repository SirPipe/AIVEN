<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('profile.edit'));

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'username' => 'test-user',
            'email' => 'test@example.com',
            'current_password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->username)->toBe('test-user');
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('current password is required to change the email address', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'username' => $user->username,
            'email' => 'new-email@example.com',
        ])
        ->assertSessionHasErrors('current_password');

    expect($user->refresh()->email)->not->toBe('new-email@example.com');
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'username' => $user->username,
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    DB::table('sessions')->insert([
        'id' => 'session-to-delete',
        'user_id' => $user->id,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'AIVEN deletion test',
        'payload' => 'private-session-payload',
        'last_activity' => now()->timestamp,
    ]);
    DB::table('password_reset_tokens')->insert([
        'email' => $user->email,
        'token' => 'token-to-delete',
        'created_at' => now(),
    ]);

    $response = $this
        ->actingAs($user)
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
    expect(DB::table('sessions')->where('user_id', $user->id)->exists())
        ->toBeFalse();
    expect(DB::table('password_reset_tokens')->where('email', $user->email)->exists())
        ->toBeFalse();
});

test('unverified user can delete their account', function () {
    $user = User::factory()->unverified()->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.edit'));

    expect($user->fresh())->not->toBeNull();
});
