<?php

namespace App\Http\Requests\Settings;

use App\Concerns\ProfileValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    use ProfileValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $emailIsChanging = $this->user()->email !== $this->string('email')->toString();

        return [
            ...$this->profileRules($this->user()->id),
            'current_password' => [
                Rule::requiredIf($emailIsChanging),
                'nullable',
                'string',
                'current_password',
            ],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => Str::lower($this->string('email')->trim()->toString()),
            'username' => Str::lower($this->string('username')->trim()->toString()),
        ]);
    }
}
