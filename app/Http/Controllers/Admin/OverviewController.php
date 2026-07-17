<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\UserRole;
use Inertia\Inertia;
use Inertia\Response;

class OverviewController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): Response
    {
        return Inertia::render('admin/overview', [
            'stats' => [
                'totalUsers' => User::query()->count(),
                'verifiedUsers' => User::query()->whereNotNull('email_verified_at')->count(),
                'administrators' => User::query()->where('role', UserRole::Administrator->value)->count(),
                'moderators' => User::query()->where('role', UserRole::Moderator->value)->count(),
            ],
            'recentUsers' => User::query()
                ->latest()
                ->limit(5)
                ->get(['id', 'name', 'username', 'email', 'role', 'created_at']),
        ]);
    }
}
