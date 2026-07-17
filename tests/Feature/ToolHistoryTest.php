<?php

use App\Models\Tool;
use App\Models\ToolHistory;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function qrHistoryPayload(array $overrides = []): array
{
    return [
        'action' => 'downloaded',
        'safe_configuration' => [
            'size' => 512,
            'errorCorrection' => 'M',
            'format' => 'png',
            ...$overrides,
        ],
    ];
}

test('a safe operation can be recorded without storing its private content', function () {
    $user = User::factory()->create();
    $tool = Tool::factory()->available()->create([
        'slug' => 'generador-qr',
        'history_enabled' => true,
    ]);

    $this->actingAs($user)
        ->postJson(route('tools.history.store', $tool), qrHistoryPayload())
        ->assertCreated()
        ->assertJsonPath('history.action', 'downloaded')
        ->assertJsonPath('history.safeConfiguration.size', 512)
        ->assertJsonMissing(['content' => 'private']);

    $history = ToolHistory::query()->sole();

    expect($history->action)->toBe('downloaded')
        ->and($history->safe_configuration)->toBe([
            'size' => 512,
            'errorCorrection' => 'M',
            'format' => 'png',
        ])
        ->and($history->summary)->toContain('512');
});

test('history rejects content files addresses and unknown configuration', function (array $configuration) {
    $user = User::factory()->create();
    $tool = Tool::factory()->available()->create([
        'slug' => 'generador-qr',
        'history_enabled' => true,
    ]);

    $this->actingAs($user)
        ->postJson(route('tools.history.store', $tool), [
            'action' => 'completed',
            'safe_configuration' => $configuration,
        ])
        ->assertUnprocessable();

    expect(ToolHistory::query()->exists())->toBeFalse();
})->with([
    'private content' => [['content' => 'do not store me']],
    'an IP value' => [['size' => 512, 'format' => 'png', 'note' => '192.168.1.1']],
    'an unknown field' => [['size' => 512, 'format' => 'png', 'trackingId' => 'abc']],
]);

test('password generation can never be written to history', function () {
    $user = User::factory()->create();
    $tool = Tool::factory()->available()->create([
        'slug' => 'generador-contrasenas',
        'history_enabled' => false,
    ]);

    $this->actingAs($user)
        ->postJson(route('tools.history.store', $tool), [
            'action' => 'completed',
            'safe_configuration' => ['length' => 24],
        ])
        ->assertForbidden();

    expect(ToolHistory::query()->exists())->toBeFalse();
});

test('users can disable clear and privately manage their history', function () {
    $this->withoutVite();

    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $entry = ToolHistory::factory()->for($owner)->create();
    ToolHistory::factory()->for($otherUser)->create();

    $this->actingAs($owner)
        ->get(route('tools.history.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('tools/history')
            ->has('history.data', 1)
            ->where('history.data.0.id', $entry->id)
            ->where('history.total', 1),
        );

    $this->actingAs($otherUser)
        ->deleteJson(route('tools.history.destroy', $entry))
        ->assertForbidden();

    $this->actingAs($owner)
        ->patchJson(route('tools.history.preference'), [
            'history_enabled' => false,
        ])
        ->assertOk()
        ->assertJson(['historyEnabled' => false]);

    expect($owner->fresh()->tool_history_enabled)->toBeFalse();

    $this->actingAs($owner)
        ->deleteJson(route('tools.history.clear'))
        ->assertOk()
        ->assertJson(['cleared' => true]);

    expect($owner->toolHistories()->exists())->toBeFalse()
        ->and($otherUser->toolHistories()->exists())->toBeTrue();
});

test('users can resume only their own safe configuration for the same tool', function () {
    $this->withoutVite();

    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $tool = Tool::factory()->available()->create([
        'slug' => 'generador-qr',
        'history_enabled' => true,
    ]);
    $entry = ToolHistory::factory()
        ->for($owner)
        ->for($tool)
        ->create([
            'safe_configuration' => [
                'size' => 768,
                'errorCorrection' => 'H',
                'format' => 'svg',
            ],
        ]);
    $otherEntry = ToolHistory::factory()
        ->for($otherUser)
        ->for($tool)
        ->create([
            'safe_configuration' => [
                'size' => 1024,
                'errorCorrection' => 'Q',
                'format' => 'png',
            ],
        ]);

    $this->actingAs($owner)
        ->get(route('tools.show', [
            'tool' => $tool,
            'historial' => $entry->id,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('initialConfiguration.size', 768)
            ->where('initialConfiguration.errorCorrection', 'H')
            ->where('initialConfiguration.format', 'svg'),
        );

    $this->actingAs($owner)
        ->get(route('tools.show', [
            'tool' => $tool,
            'historial' => $otherEntry->id,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('initialConfiguration', null),
        );
});

test('history is paginated while retaining up to one hundred entries', function () {
    $this->withoutVite();

    $user = User::factory()->create();
    ToolHistory::factory()->count(25)->for($user)->create();

    $this->actingAs($user)
        ->get(route('tools.history.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('history.data', 20)
            ->where('history.total', 25)
            ->where('history.last_page', 2),
        );
});
