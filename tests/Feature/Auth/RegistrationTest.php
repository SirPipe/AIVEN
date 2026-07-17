<?php

use App\Models\User;
use App\UserRole;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    Notification::fake();

    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'username' => 'test-user',
        'email' => 'test@example.com',
        'interests' => ['programming', 'electronics'],
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => 'on',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $user = User::query()->where('email', 'test@example.com')->firstOrFail();

    expect($user->username)->toBe('test-user')
        ->and($user->role)->toBe(UserRole::User)
        ->and($user->interests)->toBe(['programming', 'electronics'])
        ->and($user->terms_accepted_at)->not->toBeNull()
        ->and($user->email_verified_at)->toBeNull();

    Notification::assertSentTo($user, VerifyEmail::class);
});

test('username terms and interests are validated during registration', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'username' => 'invalid username',
        'email' => 'test@example.com',
        'interests' => ['not-allowed'],
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors(['username', 'interests.0', 'terms']);
    $this->assertGuest();
});

test('usernames must be unique', function () {
    User::factory()->create(['username' => 'existing-user']);

    $this->post(route('register.store'), [
        'name' => 'Another User',
        'username' => 'existing-user',
        'email' => 'another@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => 'on',
    ])->assertSessionHasErrors('username');
});
