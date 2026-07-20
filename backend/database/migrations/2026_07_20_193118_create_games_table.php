<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unsignedBigInteger('word_id');
            $table->foreign('word_id')->references('id')->on('words')->restrictOnDelete();
            $table->unsignedTinyInteger('attempts_count')->default(0);
            $table->unsignedTinyInteger('max_attempts')->default(6);
            $table->enum('status', ['in_progress','won','lost',])->default('in_progress');
            $table->timestamp('completed_at')->nullable();
            $table->unsignedinteger('score')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'status', 'score']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
