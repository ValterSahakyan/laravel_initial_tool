<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Computation extends Model
{
    use HasFactory;
    protected $table = 'computations';
    protected $fillable = [
        'name',
        'file',
    ];
}
