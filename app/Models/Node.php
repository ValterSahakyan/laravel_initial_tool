<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Node extends Model{

    protected $fillable = [
        'parent_id',
        'type',
        'project',
        'main_run',
        'run',
        'filter_options',
        'in',
        'computation_id',
        'out',
    ];


    public function childs() {
        return $this->hasMany('App\Models\Node','parent_id','id') ;
    }

    public function computation(){
        return $this->hasOne(Computation::class, 'id', 'computation_id');
    }
}
