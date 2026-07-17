<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

function createDatabaseSession(User $user, string $id, int $lastActivity = 1): void
{
    DB::table('sessions')->insert([
        'id' => $id,
        'user_id' => $user->id,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'AIVEN test browser',
        'payload' => 'test-payload',
        'last_activity' => $lastActivity,
    ]);
}

test('security settings list only the authenticated users sessions', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $currentSessionId = str_repeat('a', 40);

    $this->app['session']->driver()->setId($currentSessionId);

    createDatabaseSession($user, $currentSessionId, now()->timestamp);
    createDatabaseSession($otherUser, 'other-user-session', now()->subMinute()->timestamp);

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->withCookie((string) config('session.cookie'), $currentSessionId)
        ->get(route('security.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/security')
            ->has('sessions', 1)
            ->where('sessions.0.id', $currentSessionId)
            ->where('sessions.0.ip_address', '127.0.0.1')
            ->where('sessions.0.user_agent', 'AIVEN test browser')
            ->where('sessions.0.is_current', true),
        );
});

test('users can revoke one of their own sessions', function () {
    $user = User::factory()->create();
    createDatabaseSession($user, 'revoked-session');
    $rememberToken = $user->remember_token;

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->delete(route('sessions.destroy', 'revoked-session'))
        ->assertRedirect();

    expect(DB::table('sessions')->where('id', 'revoked-session')->exists())->toBeFalse()
        ->and($user->refresh()->remember_token)->not->toBe($rememberToken);
});

test('users cannot revoke another users session', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    createDatabaseSession($otherUser, 'protected-session');

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->delete(route('sessions.destroy', 'protected-session'))
        ->assertNotFound();

    expect(DB::table('sessions')->where('id', 'protected-session')->exists())->toBeTrue();
});

test('users cannot revoke their current session from the active sessions list', function () {
    $user = User::factory()->create();
    $currentSessionId = str_repeat('c', 40);

    $this->app['session']->driver()->setId($currentSessionId);
    createDatabaseSession($user, $currentSessionId, now()->timestamp);

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->withCookie((string) config('session.cookie'), $currentSessionId)
        ->delete(route('sessions.destroy', $currentSessionId))
        ->assertSessionHasErrors('session');

    expect(DB::table('sessions')->where('id', $currentSessionId)->exists())->toBeTrue();
});

test('users can revoke all their other sessions without affecting other users', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    createDatabaseSession($user, 'first-session');
    createDatabaseSession($user, 'second-session');
    createDatabaseSession($otherUser, 'unrelated-session');

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->delete(route('sessions.destroy-other'))
        ->assertRedirect();

    expect(DB::table('sessions')->where('user_id', $user->id)->exists())->toBeFalse()
        ->and(DB::table('sessions')->where('id', 'unrelated-session')->exists())->toBeTrue();
});
