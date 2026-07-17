<?php

namespace App;

enum ToolStatus: string
{
    case Available = 'available';
    case ComingSoon = 'coming_soon';
    case Maintenance = 'maintenance';
    case Disabled = 'disabled';

    public function isPubliclyVisible(): bool
    {
        return $this !== self::Disabled;
    }

    public function isAvailable(): bool
    {
        return $this === self::Available;
    }
}
