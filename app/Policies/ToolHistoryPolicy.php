<?php

namespace App\Policies;

use App\Models\ToolHistory;
use App\Models\User;

class ToolHistoryPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasVerifiedEmail();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ToolHistory $toolHistory): bool
    {
        return $toolHistory->user_id === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasVerifiedEmail();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ToolHistory $toolHistory): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ToolHistory $toolHistory): bool
    {
        return $toolHistory->user_id === $user->id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ToolHistory $toolHistory): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ToolHistory $toolHistory): bool
    {
        return false;
    }
}
