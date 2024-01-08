<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('worker_account_associations', function (Blueprint $table) {
            $table->id();

            $table->string('worker_name');
            $table->string('account_email');

            $table->unique(['worker_name', 'account_email']);

            $table->foreign('worker_name')->references('name')->on('workers')
                ->onDelete('cascade')
                ->onUpdate('cascade');

            $table->foreign('account_email')->references('email')->on('accounts')
                ->onDelete('cascade')
                ->onUpdate('cascade');

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
        Schema::dropIfExists('worker_account_associations');
    }
};
