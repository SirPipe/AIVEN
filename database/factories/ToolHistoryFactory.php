<?php

namespace Database\Factories;

use App\Models\Tool;
use App\Models\ToolHistory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ToolHistory>
 */
class ToolHistoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'tool_id' => Tool::factory(),
            'summary' => 'Consumo estimado: 12.5 kWh/mes',
            'action' => 'completed',
            'safe_configuration' => [
                'watts' => 500,
                'hoursPerDay' => 2,
                'daysPerMonth' => 30,
                'pricePerKwh' => 1.5,
                'monthlyKwh' => 30,
                'monthlyCost' => 45,
            ],
        ];
    }
}
