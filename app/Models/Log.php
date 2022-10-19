<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Jenssegers\Mongodb\Eloquent\HybridRelations;
use Jenssegers\Mongodb\Eloquent\Model;

class Log extends Model
{
    use HasFactory, HybridRelations;

    protected $connection = 'mongodb';
    protected $collection = 'log';


}
