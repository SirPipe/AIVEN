<?php

namespace Database\Factories;

use App\Models\Tool;
use App\Models\ToolErrorReport;
use App\ToolErrorCode;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ToolErrorReport>
 */
class ToolErrorReportFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tool_id' => Tool::factory(),
            'user_id' => null,
            'code' => ToolErrorCode::ProcessingFailed,
        ];
    }
}
