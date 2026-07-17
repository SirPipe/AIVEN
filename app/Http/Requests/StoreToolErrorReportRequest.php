<?php

namespace App\Http\Requests;

use App\Models\Tool;
use App\Support\ToolRuntimeRegistry;
use App\ToolErrorCode;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreToolErrorReportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $tool = $this->route('tool');

        return $tool instanceof Tool
            && ToolRuntimeRegistry::supports($tool->slug)
            && $tool->status->isAvailable()
            && $tool->toolCategory()->where('is_active', true)->exists()
            && (! $tool->requires_login || $this->user() !== null);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'code' => ['required', Rule::enum(ToolErrorCode::class)],
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if (Arr::except($this->all(), ['code']) !== []) {
                    $validator->errors()->add(
                        'payload',
                        'El reporte solo puede incluir un código técnico.',
                    );
                }
            },
        ];
    }

    public function errorCode(): ToolErrorCode
    {
        return ToolErrorCode::from($this->string('code')->toString());
    }
}
