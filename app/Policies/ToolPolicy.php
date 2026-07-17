<?php

namespace App\Policies;

use App\Models\Tool;
use App\Models\User;

class ToolPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Tool $tool): bool
    {
        return $tool->status->isPubliclyVisible() || $user->isAdministrator();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isAdministrator();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Tool $tool): bool
    {
        return $user->isAdministrator();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Tool $tool): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Tool $tool): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Tool $tool): bool
    {
        return false;
    }

    public function favorite(User $user, Tool $tool): bool
    {
        return $user->hasVerifiedEmail() && $tool->status->isPubliclyVisible();
    }

    public function recordHistory(User $user, Tool $tool): bool
    {
        return $user->hasVerifiedEmail()
            && $tool->status->isAvailable()
            && $tool->history_enabled;
    }
}
