<?php

namespace App\Enums;

enum UserRole: string
{
    case MANAGER = 'manager';
    case WORKER = 'worker';
}
