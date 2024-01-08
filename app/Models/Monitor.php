<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Monitor extends Model
{
    use HasFactory;

    /**
     * The attributes that shoud be cast.
     * 
     * @var array
     */
    protected $casts = [
        'notifications' => AsArrayObject::class,
        'workers' => AsArrayObject::class,
        'frontends' => AsArrayObject::class,
    ];
}
