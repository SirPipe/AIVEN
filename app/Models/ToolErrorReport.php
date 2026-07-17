<?php

namespace App\Models;

use App\ToolErrorCode;
use Database\Factories\ToolErrorReportFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $tool_id
 * @property int|null $user_id
 * @property ToolErrorCode $code
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['tool_id', 'user_id', 'code'])]
class ToolErrorReport extends Model
{
    /** @use HasFactory<ToolErrorReportFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Tool, $this>
     */
    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'code' => ToolErrorCode::class,
        ];
    }
}
