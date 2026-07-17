<?php

namespace App\Http\Requests\Admin;

use App\Models\Tool;
use App\Support\ToolRuntimeRegistry;
use App\ToolStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateToolRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $tool = $this->route('tool');

        return $tool instanceof Tool && $this->user()?->can('update', $tool) === true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['sometimes', 'integer', Rule::exists('tool_categories', 'id')],
            'name' => ['sometimes', 'string', 'min:3', 'max:120'],
            'short_description' => ['sometimes', 'string', 'min:10', 'max:240'],
            'full_description' => ['sometimes', 'nullable', 'string', 'max:4000'],
            'icon' => ['sometimes', 'nullable', 'string', 'max:50', 'regex:/^[a-z0-9-]+$/'],
            'version' => ['sometimes', 'string', 'max:20', 'regex:/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/'],
            'tags' => ['sometimes', 'array', 'max:8'],
            'tags.*' => ['string', 'min:1', 'max:32', 'regex:/^[\pL\pN][\pL\pN\s-]*$/u'],
            'status' => ['sometimes', Rule::enum(ToolStatus::class)],
            'display_order' => ['sometimes', 'integer', 'min:0', 'max:10000'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_new' => ['sometimes', 'boolean'],
            'is_offline_capable' => ['sometimes', 'boolean'],
            'requires_login' => ['sometimes', 'boolean'],
            'slug' => ['prohibited'],
            'key' => ['prohibited'],
            'implementation' => ['prohibited'],
            'usage_count' => ['prohibited'],
            'usageCount' => ['prohibited'],
            'history_enabled' => ['prohibited'],
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $tool = $this->route('tool');

                if (! $tool instanceof Tool || ToolRuntimeRegistry::supports($tool->slug)) {
                    return;
                }

                if ($this->input('status') === ToolStatus::Available->value) {
                    $validator->errors()->add(
                        'status',
                        'No puedes publicar una herramienta sin un runtime disponible.',
                    );
                }

                if ($this->has('is_offline_capable') && $this->boolean('is_offline_capable')) {
                    $validator->errors()->add(
                        'is_offline_capable',
                        'No puedes habilitar el modo sin conexión sin un runtime disponible.',
                    );
                }
            },
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function safeToolAttributes(): array
    {
        $attributes = $this->validated();

        if (array_key_exists('category_id', $attributes)) {
            $attributes['tool_category_id'] = $attributes['category_id'];
            unset($attributes['category_id']);
        }

        return $attributes;
    }

    protected function prepareForValidation(): void
    {
        if (! is_string($this->input('tags'))) {
            return;
        }

        $tags = Str::of($this->string('tags')->toString())
            ->explode(',')
            ->map(fn (string $tag): string => Str::of($tag)->trim()->toString())
            ->filter()
            ->unique()
            ->values()
            ->all();

        $this->merge(['tags' => $tags]);
    }
}
