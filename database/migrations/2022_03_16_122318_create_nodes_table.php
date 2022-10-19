<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNodesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('nodes', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('type');
            $table->string('project');
            $table->string('main_run');
            $table->string('run')->nullable();
            $table->enum('executed', [1, 0])->default(0);
            $table->unsignedBigInteger('computation_id')->nullable();
            $table->json('filter_options')->nullable();
            $table->string('in')->nullable();
            $table->string('out')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('nodes');
    }
}
