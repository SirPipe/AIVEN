<?php

namespace App\Http\Requests\Admin;

use App\Models\Tool;
use App\Models\ToolCategory;
use App\ToolStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreToolRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Tool::class) === true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', Rule::exists(ToolCategory::class, 'id')],
            'name' => ['required', 'string', 'min:3', 'max:120'],
            'slug' => [
                'required',
                'string',
                'min:3',
                'max:120',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique(Tool::class, 'slug'),
            ],
            'short_description' => ['required', 'string', 'min:10', 'max:240'],
            'full_description' => ['nullable', 'string', 'max:4000'],
            'icon' => ['nullable', 'string', 'max:50', 'regex:/^[a-z0-9-]+$/'],
            'tags' => ['nullable', 'array', 'max:8'],
            'tags.*' => ['string', 'min:1', 'max:32', 'distinct', 'regex:/^[\pL\pN][\pL\pN\s-]*$/u'],
            'status' => ['prohibited'],
            'key' => ['prohibited'],
            'implementation' => ['prohibited'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function safeToolAttributes(): array
    {
        $attributes = $this->validated();
        $slug = $attributes['slug'];
        $technicalBase = Str::limit($slug, 40, '');
        $technicalSuffix = Str::lower((string) Str::ulid());

        return [
            'tool_category_id' => $attributes['category_id'],
            'key' => "catalog-{$technicalBase}-{$technicalSuffix}",
            'slug' => $slug,
            'implementation' => "pending-{$technicalBase}-{$technicalSuffix}",
            'name' => $attributes['name'],
            'short_description' => $attributes['short_description'],
            'full_description' => $attributes['full_description'] ?? null,
            'icon' => $attributes['icon'] ?? null,
            'status' => ToolStatus::ComingSoon,
            'is_featured' => false,
            'is_new' => false,
            'is_offline_capable' => false,
            'requires_login' => false,
            'history_enabled' => false,
            'tags' => $attributes['tags'] ?? [],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('slug'))) {
            $this->merge(['slug' => Str::slug($this->string('slug')->toString())]);
        }

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
