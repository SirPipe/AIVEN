<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SessionController extends Controller
{
    /**
     * Revoke one of the authenticated user's sessions.
     */
    public function destroy(Request $request, string $session): RedirectResponse
    {
        if (hash_equals($request->session()->getId(), $session)) {
            throw ValidationException::withMessages([
                'session' => __('Usa la opción de cerrar sesión para finalizar la sesión actual.'),
            ]);
        }

        $deletedSessions = DB::table($this->sessionTable())
            ->where('id', $session)
            ->where('user_id', $request->user()->getAuthIdentifier())
            ->delete();

        abort_if($deletedSessions === 0, 404);

        $this->rotateRememberToken($request);

        return back()->with('status', 'session-revoked');
    }

    /**
     * Revoke every session except the current one.
     */
    public function destroyOther(Request $request): RedirectResponse
    {
        DB::table($this->sessionTable())
            ->where('user_id', $request->user()->getAuthIdentifier())
            ->where('id', '!=', $request->session()->getId())
            ->delete();

        $this->rotateRememberToken($request);

        return back()->with('status', 'other-sessions-revoked');
    }

    private function rotateRememberToken(Request $request): void
    {
        $request->user()->forceFill([
            'remember_token' => Str::random(60),
        ])->save();
    }

    private function sessionTable(): string
    {
        return (string) config('session.table', 'sessions');
    }
}
