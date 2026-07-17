<?php

namespace App\Http\Controllers;

use App\Models\Tool;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ToolFavoriteController extends Controller
{
    public function store(Request $request, Tool $tool): JsonResponse
    {
        Gate::authorize('favorite', $tool);

        $request->user()->favoriteTools()->syncWithoutDetaching([$tool->id]);

        return response()->json([
            'toolId' => $tool->id,
            'isFavorite' => true,
        ]);
    }

    public function destroy(Request $request, Tool $tool): JsonResponse
    {
        $request->user()->favoriteTools()->detach($tool->id);

        return response()->json([
            'toolId' => $tool->id,
            'isFavorite' => false,
        ]);
    }
}
