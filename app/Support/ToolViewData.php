<?php

namespace App\Support;

use App\Models\Tool;
use App\Models\ToolCategory;
use App\Models\ToolErrorReport;
use App\Models\ToolHistory;
use LogicException;

class ToolViewData
{
    /**
     * @return array{id: int, name: string, slug: string, description: string|null, icon: string|null, displayOrder: int}
     */
    public static function category(ToolCategory $toolCategory): array
    {
        return [
            'id' => $toolCategory->id,
            'name' => $toolCategory->name,
            'slug' => $toolCategory->slug,
            'description' => $toolCategory->description,
            'icon' => $toolCategory->icon,
            'displayOrder' => $toolCategory->display_order,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function tool(Tool $tool, bool $isFavorite = false): array
    {
        return [
            'id' => $tool->id,
            'key' => $tool->key,
            'slug' => $tool->slug,
            'name' => $tool->name,
            'shortDescription' => $tool->short_description,
            'fullDescription' => $tool->full_description,
            'category' => self::category(self::loadedToolCategory($tool)),
            'icon' => $tool->icon,
            'status' => $tool->status->value,
            'isFeatured' => $tool->is_featured,
            'isNew' => $tool->is_new,
            'isOfflineCapable' => $tool->is_offline_capable,
            'requiresLogin' => $tool->requires_login,
            'historyEnabled' => $tool->history_enabled,
            'version' => $tool->version,
            'usageCount' => $tool->usage_count,
            'tags' => $tool->tags ?? [],
            'displayOrder' => $tool->display_order,
            'isFavorite' => $isFavorite,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function history(ToolHistory $history): array
    {
        $tool = $history->getRelation('tool');

        if (! $tool instanceof Tool) {
            throw new LogicException('Tool history must eager load its tool.');
        }

        return [
            'id' => $history->id,
            'toolId' => $history->tool_id,
            'tool' => self::tool($tool),
            'action' => $history->action,
            'summary' => $history->summary,
            'safeConfiguration' => $history->safe_configuration,
            'createdAt' => $history->created_at?->toIso8601String(),
        ];
    }

    /**
     * @return array{id: int, tool: array{id: int, slug: string, name: string, icon: string|null}, code: string, createdAt: string|null}
     */
    public static function errorReport(ToolErrorReport $errorReport): array
    {
        $tool = $errorReport->getRelation('tool');

        if (! $tool instanceof Tool) {
            throw new LogicException('Tool error report must eager load its tool.');
        }

        return [
            'id' => $errorReport->id,
            'tool' => [
                'id' => $tool->id,
                'slug' => $tool->slug,
                'name' => $tool->name,
                'icon' => $tool->icon,
            ],
            'code' => $errorReport->code->value,
            'createdAt' => $errorReport->created_at?->toIso8601String(),
        ];
    }

    private static function loadedToolCategory(Tool $tool): ToolCategory
    {
        $toolCategory = $tool->getRelation('toolCategory');

        if (! $toolCategory instanceof ToolCategory) {
            throw new LogicException('Tool must eager load its tool category.');
        }

        return $toolCategory;
    }
}
