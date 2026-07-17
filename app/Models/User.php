<?php

namespace App\Models;

use App\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string|null $username
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property UserRole $role
 * @property array<int, string>|null $interests
 * @property Carbon|null $terms_accepted_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'username', 'email', 'password', 'interests', 'terms_accepted_at', 'tool_history_enabled'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail, PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * The model's default values for attributes.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'role' => UserRole::User->value,
        'tool_history_enabled' => true,
    ];

    public function isAdministrator(): bool
    {
        return $this->role === UserRole::Administrator;
    }

    /**
     * @return BelongsToMany<Tool, $this>
     */
    public function favoriteTools(): BelongsToMany
    {
        return $this->belongsToMany(Tool::class, 'tool_favorites')->withTimestamps();
    }

    /**
     * @return HasMany<ToolHistory, $this>
     */
    public function toolHistories(): HasMany
    {
        return $this->hasMany(ToolHistory::class);
    }

    /**
     * @return HasMany<ToolErrorReport, $this>
     */
    public function toolErrorReports(): HasMany
    {
        return $this->hasMany(ToolErrorReport::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'interests' => 'array',
            'password' => 'hashed',
            'role' => UserRole::class,
            'terms_accepted_at' => 'datetime',
            'tool_history_enabled' => 'boolean',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }
}
