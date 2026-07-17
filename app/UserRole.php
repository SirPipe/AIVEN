<?php

namespace App;

enum UserRole: string
{
    case User = 'user';
    case Moderator = 'moderator';
    case Administrator = 'administrator';

    public function label(): string
    {
        return match ($this) {
            self::User => 'Usuario',
            self::Moderator => 'Moderador',
            self::Administrator => 'Administrador',
        };
    }
}
