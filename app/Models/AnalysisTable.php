<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalysisTable extends Model{

    protected $fillable = ['name', 'columns', 'smiles', 'data'];


}
