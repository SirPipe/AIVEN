<?php

namespace App\Actions;

use App\Models\Tool;
use App\Models\ToolErrorReport;
use App\Models\User;
use App\ToolErrorCode;

class RecordToolErrorReport
{
    private const MAX_REPORTS = 1000;

    public function execute(Tool $tool, ?User $user, ToolErrorCode $code): ToolErrorReport
    {
        $report = $tool->errorReports()->create([
            'user_id' => $user?->getKey(),
            'code' => $code,
        ]);

        $this->pruneOldReports();

        return $report;
    }

    private function pruneOldReports(): void
    {
        $reportIdsToKeep = ToolErrorReport::query()
            ->latest('created_at')
            ->latest('id')
            ->limit(self::MAX_REPORTS)
            ->pluck('id');

        ToolErrorReport::query()
            ->whereNotIn('id', $reportIdsToKeep)
            ->delete();
    }
}
