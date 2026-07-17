<?php

namespace App\Models;

use App\ToolStatus;
use Database\Factories\ToolFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property ToolStatus $status
 * @property bool $history_enabled
 * @property bool $is_featured
 * @property bool $is_new
 * @property bool $is_offline_capable
 * @property bool $requires_login
 * @property int $display_order
 * @property int $usage_count
 * @property array<int, string>|null $tags
 * @property-read ToolCategory $toolCategory
 */
#[Fillable([
    'tool_category_id',
    'key',
    'slug',
    'implementation',
    'name',
    'short_description',
    'full_description',
    'icon',
    'status',
    'is_featured',
    'is_new',
    'is_offline_capable',
    'requires_login',
    'history_enabled',
    'version',
    'usage_count',
    'tags',
    'display_order',
])]
#[Hidden(['implementation'])]
class Tool extends Model
{
    /** @use HasFactory<ToolFactory> */
    use HasFactory;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => ToolStatus::ComingSoon->value,
        'is_featured' => false,
        'is_new' => false,
        'is_offline_capable' => false,
        'requires_login' => false,
        'history_enabled' => false,
        'version' => '1.0.0',
        'usage_count' => 0,
        'display_order' => 0,
    ];

    /**
     * @return BelongsTo<ToolCategory, $this>
     */
    public function toolCategory(): BelongsTo
    {
        return $this->belongsTo(ToolCategory::class);
    }

    /**
     * @return BelongsToMany<User, $this>
     */
    public function favoritedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'tool_favorites')->withTimestamps();
    }

    /**
     * @return HasMany<ToolHistory, $this>
     */
    public function histories(): HasMany
    {
        return $this->hasMany(ToolHistory::class);
    }

    /**
     * @return HasMany<ToolErrorReport, $this>
     */
    public function errorReports(): HasMany
    {
        return $this->hasMany(ToolErrorReport::class);
    }

    /**
     * @param  Builder<Tool>  $query
     * @return Builder<Tool>
     */
    public function scopePubliclyVisible(Builder $query): Builder
    {
        return $query->whereIn('status', [
            ToolStatus::Available->value,
            ToolStatus::ComingSoon->value,
            ToolStatus::Maintenance->value,
        ]);
    }

    /**
     * @param  Builder<Tool>  $query
     * @return Builder<Tool>
     */
    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('status', ToolStatus::Available->value);
    }

    /**
     * @param  Builder<Tool>  $query
     * @return Builder<Tool>
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
            'history_enabled' => 'boolean',
            'is_featured' => 'boolean',
            'is_new' => 'boolean',
            'is_offline_capable' => 'boolean',
            'requires_login' => 'boolean',
            'status' => ToolStatus::class,
            'tags' => 'array',
            'usage_count' => 'integer',
        ];
    }
}
