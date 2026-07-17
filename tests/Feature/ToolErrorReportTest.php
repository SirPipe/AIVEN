<?php

use App\Models\Tool;
use App\Models\ToolCategory;
use App\Models\ToolErrorReport;
use App\Models\User;
use App\ToolErrorCode;
use App\ToolStatus;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;

test('guests can submit only controlled error codes through the named route', function (string $code) {
    $tool = Tool::factory()->available()->create(['slug' => 'generador-qr']);

    expect(route('tools.errors.store', $tool, false))
        ->toBe("/herramientas/{$tool->slug}/errores");

    $this->postJson(route('tools.errors.store', $tool), ['code' => $code])
        ->assertNoContent();

    $report = ToolErrorReport::query()->sole();

    expect($report->tool_id)->toBe($tool->id)
        ->and($report->user_id)->toBeNull()
        ->and($report->code)->toBe(ToolErrorCode::from($code));
})->with([
    'processing failed' => ToolErrorCode::ProcessingFailed->value,
    'export failed' => ToolErrorCode::ExportFailed->value,
    'share failed' => ToolErrorCode::ShareFailed->value,
    'render failed' => ToolErrorCode::RenderFailed->value,
]);

test('authenticated reports retain only nullable ownership', function () {
    $user = User::factory()->create();
    $tool = Tool::factory()->available()->create(['slug' => 'generador-qr']);

    $this->actingAs($user)
        ->postJson(route('tools.errors.store', $tool), [
            'code' => ToolErrorCode::ExportFailed->value,
        ])
        ->assertNoContent();

    $report = ToolErrorReport::query()->sole();

    expect($report->user_id)->toBe($user->id)
        ->and($user->toolErrorReports()->sole()->is($report))->toBeTrue()
        ->and($tool->errorReports()->sole()->is($report))->toBeTrue();
});

test('reports reject private context and the table has no private metadata columns', function () {
    $tool = Tool::factory()->available()->create(['slug' => 'generador-qr']);

    $this->postJson(route('tools.errors.store', $tool), [
        'code' => ToolErrorCode::ProcessingFailed->value,
        'message' => 'El archivo secreto no pudo procesarse.',
        'content' => 'contenido privado',
        'files' => ['documento-privado.pdf'],
        'ip' => '192.0.2.10',
        'user_agent' => 'Navegador privado',
        'context' => ['stack' => 'traza privada'],
    ])->assertJsonValidationErrors('payload');

    expect(ToolErrorReport::query()->exists())->toBeFalse()
        ->and(Schema::getColumnListing('tool_error_reports'))
        ->toEqualCanonicalizing([
            'id',
            'tool_id',
            'user_id',
            'code',
            'created_at',
            'updated_at',
        ]);
});

test('reports require a valid controlled code', function (array $payload) {
    $tool = Tool::factory()->available()->create(['slug' => 'generador-qr']);

    $this->postJson(route('tools.errors.store', $tool), $payload)
        ->assertJsonValidationErrors('code');

    expect(ToolErrorReport::query()->exists())->toBeFalse();
})->with([
    'missing code' => [[]],
    'free message' => [['code' => 'La herramienta dejó de funcionar']],
    'unknown code' => [['code' => 'unknown_failure']],
]);

test('reports are accepted only for available tools', function (ToolStatus $status) {
    $tool = Tool::factory()->create([
        'slug' => 'generador-qr',
        'status' => $status,
    ]);

    $this->postJson(route('tools.errors.store', $tool), [
        'code' => ToolErrorCode::RenderFailed->value,
    ])->assertForbidden();

    expect(ToolErrorReport::query()->exists())->toBeFalse();
})->with([
    ToolStatus::ComingSoon,
    ToolStatus::Maintenance,
    ToolStatus::Disabled,
]);

test('the public report route is limited to ten attempts per minute', function () {
    $tool = Tool::factory()->available()->create(['slug' => 'generador-qr']);
    $client = $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.42']);

    foreach (range(1, 10) as $attempt) {
        $client->postJson(route('tools.errors.store', $tool), [
            'code' => ToolErrorCode::ProcessingFailed->value,
        ])->assertNoContent();
    }

    $client->postJson(route('tools.errors.store', $tool), [
        'code' => ToolErrorCode::ProcessingFailed->value,
    ])->assertTooManyRequests();
});

test('recording a report retains exactly the one thousand most recent reports', function () {
    $tool = Tool::factory()->available()->create(['slug' => 'generador-qr']);
    $oldestCreatedAt = now()->subMinutes(1000);

    $reports = ToolErrorReport::factory()
        ->count(1000)
        ->for($tool)
        ->state(new Sequence(fn (Sequence $sequence): array => [
            'created_at' => $oldestCreatedAt->copy()->addMinutes($sequence->index),
            'updated_at' => $oldestCreatedAt->copy()->addMinutes($sequence->index),
        ]))
        ->create();
    $oldestReportId = $reports->firstOrFail()->id;

    $this->postJson(route('tools.errors.store', $tool), [
        'code' => ToolErrorCode::ShareFailed->value,
    ])->assertNoContent();

    expect(ToolErrorReport::query()->count())->toBe(1000)
        ->and(ToolErrorReport::query()->whereKey($oldestReportId)->exists())->toBeFalse()
        ->and(ToolErrorReport::query()->where('code', ToolErrorCode::ShareFailed)->exists())->toBeTrue();
});

test('administrators receive the total and ten latest safe reports', function () {
    $this->withoutVite();

    $administrator = User::factory()->administrator()->create();
    $tool = Tool::factory()->available()->create([
        'slug' => 'generador-qr',
        'name' => 'Compresor seguro',
    ]);
    $oldestCreatedAt = now()->subMinutes(11);

    $reports = ToolErrorReport::factory()
        ->count(11)
        ->for($tool)
        ->state(new Sequence(fn (Sequence $sequence): array => [
            'code' => $sequence->index === 10
                ? ToolErrorCode::RenderFailed
                : ToolErrorCode::ProcessingFailed,
            'created_at' => $oldestCreatedAt->copy()->addMinutes($sequence->index),
            'updated_at' => $oldestCreatedAt->copy()->addMinutes($sequence->index),
        ]))
        ->create();
    $latestReport = $reports->last();
    assert($latestReport instanceof ToolErrorReport);

    $this->actingAs($administrator)
        ->get(route('admin.tools.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/tools/index')
            ->where('stats.errorReports', 11)
            ->has('errorReports', 10)
            ->where('errorReports.0.id', $latestReport->id)
            ->where('errorReports.0.tool.name', 'Compresor seguro')
            ->where('errorReports.0.code', ToolErrorCode::RenderFailed->value)
            ->where('errorReports.0.createdAt', $latestReport->created_at?->toIso8601String()),
        );
});

test('reports require an implemented runtime in an active category', function () {
    $inactiveCategory = ToolCategory::factory()->inactive()->create();
    $inactiveTool = Tool::factory()->available()->for($inactiveCategory)->create([
        'slug' => 'generador-qr',
    ]);

    $this->postJson(route('tools.errors.store', $inactiveTool), [
        'code' => ToolErrorCode::RenderFailed->value,
    ])->assertForbidden();

    $unsupportedTool = Tool::factory()->available()->create([
        'slug' => 'herramienta-sin-runtime',
    ]);

    $this->postJson(route('tools.errors.store', $unsupportedTool), [
        'code' => ToolErrorCode::RenderFailed->value,
    ])->assertForbidden();

    expect(ToolErrorReport::query()->exists())->toBeFalse();
});

test('reports for login protected tools require an authenticated user', function () {
    $tool = Tool::factory()->available()->create([
        'slug' => 'generador-qr',
        'requires_login' => true,
    ]);

    $payload = ['code' => ToolErrorCode::ProcessingFailed->value];

    $this->postJson(route('tools.errors.store', $tool), $payload)
        ->assertForbidden();

    $this->actingAs(User::factory()->create())
        ->postJson(route('tools.errors.store', $tool), $payload)
        ->assertNoContent();

    expect(ToolErrorReport::query()->count())->toBe(1);
});
