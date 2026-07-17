<?php

namespace App\Models;

use Database\Factories\ToolHistoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property array<string, bool|float|int|string|null> $safe_configuration
 */
#[Fillable(['tool_id', 'action', 'summary', 'safe_configuration'])]
#[Hidden(['safe_configuration', 'user_id'])]
class ToolHistory extends Model
{
    /** @use HasFactory<ToolHistoryFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Tool, $this>
     */
    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'safe_configuration' => 'array',
        ];
    }
}
