<?php

namespace App\Models;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class Project extends Eloquent
{
    protected $connection = 'mongodb';
    protected $collection = 'projects';

    protected $fillable = [
       'id', 'name', 'general_info'
    ];
}
