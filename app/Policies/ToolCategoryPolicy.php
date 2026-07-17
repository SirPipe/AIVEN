<?php

namespace App\Policies;

use App\Models\ToolCategory;
use App\Models\User;

class ToolCategoryPolicy
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
    public function view(User $user, ToolCategory $toolCategory): bool
    {
        return $toolCategory->is_active || $user->isAdministrator();
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
    public function update(User $user, ToolCategory $toolCategory): bool
    {
        return $user->isAdministrator();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ToolCategory $toolCategory): bool
    {
        return $user->isAdministrator() && ! $toolCategory->tools()->exists();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ToolCategory $toolCategory): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ToolCategory $toolCategory): bool
    {
        return false;
    }
}
