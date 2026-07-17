<?php

namespace App\Http\Controllers;

use App\Models\Tool;
use App\Models\ToolCategory;
use App\Models\ToolHistory;
use App\Models\User;
use App\Support\ToolViewData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

use function Illuminate\Support\defer;

class ToolController extends Controller
{
    public function index(Request $request): Response
    {
        $favoriteToolIds = $this->favoriteToolIds($request->user());
        $tools = Tool::query()
            ->publiclyVisible()
            ->whereHas('toolCategory', fn ($query) => $query->where('is_active', true))
            ->with('toolCategory')
            ->ordered()
            ->get()
            ->map(fn (Tool $tool): array => ToolViewData::tool($tool, in_array($tool->id, $favoriteToolIds, true)))
            ->all();

        return $this->catalogResponse($request, $tools, $favoriteToolIds, 'all');
    }

    public function favorites(Request $request): Response
    {
        $favoriteToolIds = $this->favoriteToolIds($request->user());
        $tools = $request->user()
            ->favoriteTools()
            ->publiclyVisible()
            ->whereHas('toolCategory', fn ($query) => $query->where('is_active', true))
            ->with('toolCategory')
            ->orderByPivot('created_at', 'desc')
            ->get()
            ->map(fn (Tool $tool): array => ToolViewData::tool($tool, true))
            ->all();

        return $this->catalogResponse($request, $tools, $favoriteToolIds, 'favorites');
    }

    public function category(Request $request, ToolCategory $toolCategory): Response
    {
        abort_unless($toolCategory->is_active, 404);

        $favoriteToolIds = $this->favoriteToolIds($request->user());
        $tools = Tool::query()
            ->whereBelongsTo($toolCategory)
            ->publiclyVisible()
            ->with('toolCategory')
            ->ordered()
            ->get()
            ->map(fn (Tool $tool): array => ToolViewData::tool($tool, in_array($tool->id, $favoriteToolIds, true)))
            ->all();

        return $this->catalogResponse(
            $request,
            $tools,
            $favoriteToolIds,
            'category',
            ToolViewData::category($toolCategory),
        );
    }

    public function show(Request $request, Tool $tool): Response|RedirectResponse
    {
        $this->ensurePublicTool($tool);

        if ($tool->requires_login && ! $request->user()) {
            return redirect()->guest(route('login'));
        }

        $tool->load('toolCategory');
        $isFavorite = in_array($tool->id, $this->favoriteToolIds($request->user()), true);

        defer(fn () => Tool::query()->whereKey($tool->getKey())->increment('usage_count'));

        return Inertia::render('tools/show', [
            'tool' => ToolViewData::tool($tool, $isFavorite),
            'relatedTools' => $this->relatedTools($tool, $request->user()),
            'isFavorite' => $isFavorite,
            'offlineShell' => false,
            'initialConfiguration' => $this->historyConfiguration($request, $tool),
        ]);
    }

    public function offlineShell(Tool $tool): Response
    {
        $this->ensurePublicTool($tool);
        abort_unless($tool->is_offline_capable, 404);
        abort_if($tool->requires_login, 404);
        $tool->load('toolCategory');

        return Inertia::render('tools/show', [
            'tool' => ToolViewData::tool($tool),
            'relatedTools' => $this->relatedTools($tool),
            'isFavorite' => false,
            'offlineShell' => true,
            'initialConfiguration' => null,
            'auth' => ['user' => null],
        ]);
    }

    /**
     * @param  array<int, array<string, mixed>>  $tools
     * @param  array<int, int>  $favoriteToolIds
     * @param  array<string, mixed>|null  $activeCategory
     */
    private function catalogResponse(
        Request $request,
        array $tools,
        array $favoriteToolIds,
        string $mode,
        ?array $activeCategory = null,
    ): Response {
        return Inertia::render('tools/index', [
            'categories' => ToolCategory::query()
                ->active()
                ->ordered()
                ->get()
                ->map(fn (ToolCategory $toolCategory): array => ToolViewData::category($toolCategory))
                ->all(),
            'tools' => $tools,
            'favoriteToolIds' => $favoriteToolIds,
            'recentHistory' => $this->recentHistory($request->user()),
            'mode' => $mode,
            'activeCategory' => $activeCategory,
        ]);
    }

    /**
     * @return array<int, int>
     */
    private function favoriteToolIds(?User $user): array
    {
        if (! $user) {
            return [];
        }

        return $user->favoriteTools()
            ->pluck((new Tool)->qualifyColumn('id'))
            ->map(fn (int|string $id): int => (int) $id)
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function recentHistory(?User $user): array
    {
        if (! $user?->tool_history_enabled) {
            return [];
        }

        return $user->toolHistories()
            ->with('tool.toolCategory')
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (ToolHistory $history): array => ToolViewData::history($history))
            ->all();
    }

    /**
     * @return array<string, mixed>|null
     */
    private function historyConfiguration(Request $request, Tool $tool): ?array
    {
        $user = $request->user();
        $historyId = $request->integer('historial');

        if (! $user || $historyId < 1) {
            return null;
        }

        $history = $user->toolHistories()
            ->whereBelongsTo($tool)
            ->whereKey($historyId)
            ->first();

        return $history?->safe_configuration;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function relatedTools(Tool $tool, ?User $user = null): array
    {
        $favoriteToolIds = $this->favoriteToolIds($user);

        return Tool::query()
            ->whereBelongsTo($tool->toolCategory)
            ->whereKeyNot($tool->getKey())
            ->publiclyVisible()
            ->with('toolCategory')
            ->ordered()
            ->limit(4)
            ->get()
            ->map(fn (Tool $relatedTool): array => ToolViewData::tool(
                $relatedTool,
                in_array($relatedTool->id, $favoriteToolIds, true),
            ))
            ->all();
    }

    private function ensurePublicTool(Tool $tool): void
    {
        abort_unless($tool->status->isPubliclyVisible(), 404);
        abort_unless($tool->toolCategory()->where('is_active', true)->exists(), 404);
    }
}
