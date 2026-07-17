<?php

namespace App\Http\Controllers;

use App\Models\Tool;
use App\Models\ToolHistory;
use App\Support\ToolViewData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $favoriteTools = $request->user()
            ->favoriteTools()
            ->publiclyVisible()
            ->whereHas('toolCategory', fn ($query) => $query->where('is_active', true))
            ->with('toolCategory')
            ->orderByPivot('created_at', 'desc')
            ->limit(4)
            ->get()
            ->map(fn (Tool $tool): array => ToolViewData::tool($tool, true))
            ->all();

        $recentToolHistory = $request->user()->tool_history_enabled
            ? $request->user()
                ->toolHistories()
                ->with('tool.toolCategory')
                ->latest()
                ->limit(4)
                ->get()
                ->map(fn (ToolHistory $history): array => ToolViewData::history($history))
                ->all()
            : [];

        return Inertia::render('dashboard', [
            'favoriteTools' => $favoriteTools,
            'recentToolHistory' => $recentToolHistory,
        ]);
    }
}
