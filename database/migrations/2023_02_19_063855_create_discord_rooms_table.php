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
        Schema::create('discord_rooms', function (Blueprint $table) {
            $table->id();

            $table->string('room_id')->unique();
            $table->string('notification_type');
            $table->json('settings');
            $table->string('server_id')->unique();

            $table->foreign('server_id')->references('server_id')->on('discord_servers')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            

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
        Schema::dropIfExists('discord_rooms');
    }
};
