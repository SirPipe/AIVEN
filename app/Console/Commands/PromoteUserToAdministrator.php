<?php

namespace App\Console\Commands;

use App\Models\User;
use App\UserRole;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

#[Signature('aiven:promote-administrator {email : Correo del usuario registrado}')]
#[Description('Promueve de forma explícita a un usuario registrado como administrador')]
class PromoteUserToAdministrator extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = Str::lower(trim((string) $this->argument('email')));
        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            $this->components->error('No existe un usuario registrado con ese correo.');

            return self::FAILURE;
        }

        if ($user->isAdministrator()) {
            $this->components->info("{$user->email} ya es administrador de AIVEN.");

            return self::SUCCESS;
        }

        $user->forceFill([
            'role' => UserRole::Administrator,
        ])->save();

        $this->components->info("{$user->email} ahora es administrador de AIVEN.");

        return self::SUCCESS;
    }
}
