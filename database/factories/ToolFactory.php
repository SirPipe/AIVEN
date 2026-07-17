<?php

namespace Database\Factories;

use App\Models\Tool;
use App\Models\ToolCategory;
use App\ToolStatus;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Tool>
 */
class ToolFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = 'Tool '.fake()->unique()->bothify('???? ####');
        $identifier = (string) Str::uuid();

        return [
            'tool_category_id' => ToolCategory::factory(),
            'key' => 'tool-'.$identifier,
            'slug' => Str::slug($name).'-'.fake()->unique()->numerify('####'),
            'implementation' => 'implementation-'.$identifier,
            'name' => Str::title($name),
            'short_description' => fake()->sentence(),
            'full_description' => fake()->paragraph(),
            'icon' => 'wrench',
            'status' => ToolStatus::Available,
            'is_featured' => false,
            'is_new' => false,
            'is_offline_capable' => true,
            'requires_login' => false,
            'history_enabled' => true,
            'version' => '1.0.0',
            'usage_count' => 0,
            'tags' => ['utilidad'],
            'display_order' => fake()->numberBetween(0, 100),
        ];
    }

    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ToolStatus::Available,
        ]);
    }

    public function comingSoon(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ToolStatus::ComingSoon,
            'history_enabled' => false,
            'is_offline_capable' => false,
        ]);
    }

    public function maintenance(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ToolStatus::Maintenance,
        ]);
    }

    public function disabled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ToolStatus::Disabled,
        ]);
    }
}
