<?php

namespace App\Http\Controllers;

use App\Actions\RecordToolErrorReport;
use App\Http\Requests\StoreToolErrorReportRequest;
use App\Models\Tool;
use Illuminate\Http\JsonResponse;

class ToolErrorReportController extends Controller
{
    public function __invoke(
        StoreToolErrorReportRequest $request,
        Tool $tool,
        RecordToolErrorReport $recordToolErrorReport,
    ): JsonResponse {
        $recordToolErrorReport->execute($tool, $request->user(), $request->errorCode());

        return response()->json(null, 204);
    }
}
