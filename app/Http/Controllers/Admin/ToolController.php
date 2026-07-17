<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreToolRequest;
use App\Http\Requests\Admin\UpdateToolRequest;
use App\Models\Tool;
use App\Models\ToolCategory;
use App\Models\ToolErrorReport;
use App\Support\ToolViewData;
use App\ToolStatus;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ToolController extends Controller
{
    public function index(): Response
    {
        $available = Tool::query()->where('status', ToolStatus::Available->value)->count();
        $comingSoon = Tool::query()->where('status', ToolStatus::ComingSoon->value)->count();

        return Inertia::render('admin/tools/index', [
            'tools' => Tool::query()
                ->with('toolCategory')
                ->ordered()
                ->get()
                ->map(fn (Tool $tool): array => ToolViewData::tool($tool))
                ->all(),
            'categories' => ToolCategory::query()
                ->ordered()
                ->get()
                ->map(fn (ToolCategory $toolCategory): array => ToolViewData::category($toolCategory))
                ->all(),
            'stats' => [
                'total' => Tool::query()->count(),
                'published' => $available,
                'draft' => $comingSoon,
                'available' => $available,
                'comingSoon' => $comingSoon,
                'maintenance' => Tool::query()->where('status', ToolStatus::Maintenance->value)->count(),
                'disabled' => Tool::query()->where('status', ToolStatus::Disabled->value)->count(),
                'offlineCapable' => Tool::query()->where('is_offline_capable', true)->count(),
                'errorReports' => ToolErrorReport::query()->count(),
            ],
            'errorReports' => ToolErrorReport::query()
                ->select(['id', 'tool_id', 'code', 'created_at'])
                ->with('tool:id,slug,name,icon')
                ->latest('created_at')
                ->latest('id')
                ->limit(10)
                ->get()
                ->map(fn (ToolErrorReport $errorReport): array => ToolViewData::errorReport($errorReport))
                ->all(),
        ]);
    }

    public function store(StoreToolRequest $request): RedirectResponse
    {
        Tool::query()->create($request->safeToolAttributes());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Herramienta creada como Próximamente.',
        ]);

        return to_route('admin.tools.index');
    }

    public function update(UpdateToolRequest $request, Tool $tool): RedirectResponse
    {
        $tool->update($request->safeToolAttributes());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Herramienta actualizada.',
        ]);

        return back();
    }
}
