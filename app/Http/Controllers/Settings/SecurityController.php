<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PasswordUpdateRequest;
use App\Http\Requests\Settings\TwoFactorAuthenticationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class SecurityController extends Controller
{
    /**
     * Show the user's security settings page.
     */
    public function edit(TwoFactorAuthenticationRequest $request): Response
    {
        $props = [
            'canManageTwoFactor' => Features::canManageTwoFactorAuthentication(),
            'canManagePasskeys' => Features::canManagePasskeys(),
            'passkeys' => Features::canManagePasskeys()
                ? $request->user()
                    ->passkeys()
                    ->select(['id', 'name', 'credential', 'created_at', 'last_used_at'])
                    ->latest()
                    ->get()
                    ->map(fn ($passkey) => [
                        'id' => $passkey->id,
                        'name' => $passkey->name,
                        'authenticator' => $passkey->authenticator,
                        'created_at_diff' => $passkey->created_at->diffForHumans(),
                        'last_used_at_diff' => $passkey->last_used_at?->diffForHumans(),
                    ])
                    ->values()
                    ->all()
                : [],
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
            'sessions' => $this->sessions($request),
            'status' => $request->session()->get('status'),
        ];

        if (Features::canManageTwoFactorAuthentication()) {
            $request->ensureStateIsValid();

            $props['twoFactorEnabled'] = $request->user()->hasEnabledTwoFactorAuthentication();
            $props['requiresConfirmation'] = Features::optionEnabled(Features::twoFactorAuthentication(), 'confirm');
        }

        return Inertia::render('settings/security', $props);
    }

    /**
     * Get the authenticated user's active sessions.
     *
     * @return array<int, array<string, bool|string|null>>
     */
    private function sessions(Request $request): array
    {
        return DB::table((string) config('session.table', 'sessions'))
            ->where('user_id', $request->user()->getAuthIdentifier())
            ->latest('last_activity')
            ->get(['id', 'ip_address', 'user_agent', 'last_activity'])
            ->map(function (object $session) use ($request): array {
                $lastActiveAt = Carbon::createFromTimestamp((int) $session->last_activity);

                return [
                    'id' => $session->id,
                    'ip_address' => $session->ip_address,
                    'user_agent' => $session->user_agent,
                    'is_current' => hash_equals($request->session()->getId(), $session->id),
                    'last_active_at' => $lastActiveAt->toIso8601String(),
                    'last_active_human' => $lastActiveAt->diffForHumans(),
                ];
            })
            ->all();
    }

    /**
     * Update the user's password.
     */
    public function update(PasswordUpdateRequest $request): RedirectResponse
    {
        $request->user()->forceFill([
            'password' => $request->password,
            'remember_token' => Str::random(60),
        ])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Contraseña actualizada.')]);

        return back();
    }
}
