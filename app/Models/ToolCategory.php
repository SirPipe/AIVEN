<?php

namespace App\Models;

use Database\Factories\ToolCategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'description', 'icon', 'display_order', 'is_active'])]
class ToolCategory extends Model
{
    /** @use HasFactory<ToolCategoryFactory> */
    use HasFactory;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'display_order' => 0,
        'is_active' => true,
    ];

    /**
     * @return HasMany<Tool, $this>
     */
    public function tools(): HasMany
    {
        return $this->hasMany(Tool::class);
    }

    /**
     * @param  Builder<ToolCategory>  $query
     * @return Builder<ToolCategory>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * @param  Builder<ToolCategory>  $query
     * @return Builder<ToolCategory>
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('display_order')->orderBy('name');
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'display_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
