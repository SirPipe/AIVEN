<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Interests available during onboarding.
     *
     * @var array<string, string>
     */
    public const INTERESTS = [
        'computers' => 'Computadoras',
        'programming' => 'Programación',
        'networks' => 'Redes',
        'drones' => 'Drones',
        'artificial-intelligence' => 'Inteligencia artificial',
        'gaming' => 'Videojuegos',
        'repair' => 'Reparación',
        'electronics' => 'Electrónica',
    ];

    /**
     * Validate and create a newly registered user.
     *
     * @param  array{
     *     name: string,
     *     username: string,
     *     email: string,
     *     password: string,
     *     password_confirmation: string,
     *     terms: mixed,
     *     interests?: array<int, string>
     * }  $input
     */
    public function create(array $input): User
    {
        $input['email'] = Str::lower(Str::trim($input['email']));
        $input['username'] = Str::lower(Str::trim($input['username']));

        Validator::make($input, [
            ...$this->profileRules(),
            'interests' => ['nullable', 'array', 'max:8'],
            'interests.*' => ['string', Rule::in(array_keys(self::INTERESTS))],
            'password' => $this->passwordRules(),
            'terms' => ['accepted'],
        ])->validate();

        return User::create([
            'name' => $input['name'],
            'username' => $input['username'],
            'email' => $input['email'],
            'interests' => $input['interests'] ?? null,
            'password' => $input['password'],
            'terms_accepted_at' => now(),
        ]);
    }
}
