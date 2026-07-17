<?php

namespace App\Http\Requests;

use App\Models\Tool;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreToolHistoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $tool = $this->route('tool');

        return $tool instanceof Tool && $this->user()?->can('recordHistory', $tool) === true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'action' => ['required', 'string', Rule::in(['completed', 'downloaded', 'shared'])],
            'safe_configuration' => ['required', 'array', 'min:1', 'max:12'],
        ];
    }
}
