<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreToolHistoryRequest;
use App\Http\Requests\UpdateToolHistoryPreferenceRequest;
use App\Models\Tool;
use App\Models\ToolHistory;
use App\Models\User;
use App\Support\ToolHistoryPayloadSanitizer;
use App\Support\ToolViewData;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ToolHistoryController extends Controller
{
    private const MAX_ENTRIES_PER_USER = 100;

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', ToolHistory::class);

        $history = $request->user()
            ->toolHistories()
            ->with('tool.toolCategory')
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (ToolHistory $entry): array => ToolViewData::history($entry));

        return Inertia::render('tools/history', [
            'history' => $history,
            'historyEnabled' => $request->user()->tool_history_enabled,
        ]);
    }

    public function store(
        StoreToolHistoryRequest $request,
        Tool $tool,
        ToolHistoryPayloadSanitizer $sanitizer,
    ): JsonResponse {
        if (! $request->user()->tool_history_enabled) {
            throw ValidationException::withMessages([
                'history' => 'Activa el historial para guardar resultados.',
            ]);
        }

        /** @var array<string, mixed> $safeConfiguration */
        $safeConfiguration = $request->validated('safe_configuration');
        $safeHistory = $sanitizer->sanitize($tool, $safeConfiguration);
        $history = $request->user()->toolHistories()->create([
            'tool_id' => $tool->id,
            'action' => $request->validated('action'),
            'summary' => $safeHistory['summary'],
            'safe_configuration' => $safeHistory['safe_configuration'],
        ]);

        $this->pruneHistory($request->user());
        $history->load('tool.toolCategory');

        return response()->json([
            'history' => ToolViewData::history($history),
        ], 201);
    }

    public function destroy(Request $request, ToolHistory $toolHistory): JsonResponse
    {
        Gate::authorize('delete', $toolHistory);
        $toolHistory->delete();

        return response()->json(['deleted' => true]);
    }

    public function clear(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', ToolHistory::class);
        $request->user()->toolHistories()->delete();

        return response()->json(['cleared' => true]);
    }

    public function preference(UpdateToolHistoryPreferenceRequest $request): JsonResponse
    {
        $historyEnabled = $request->boolean('history_enabled');

        $request->user()->forceFill([
            'tool_history_enabled' => $historyEnabled,
        ])->save();

        return response()->json(['historyEnabled' => $historyEnabled]);
    }

    private function pruneHistory(User $user): void
    {
        $historyIdsToKeep = $user->toolHistories()
            ->latest()
            ->limit(self::MAX_ENTRIES_PER_USER)
            ->pluck('id');

        $user->toolHistories()
            ->whereNotIn('id', $historyIdsToKeep)
            ->delete();
    }
}
