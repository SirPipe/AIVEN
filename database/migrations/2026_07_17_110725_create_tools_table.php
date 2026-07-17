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
        Schema::create('tools', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tool_category_id')->constrained()->restrictOnDelete();
            $table->string('key', 80)->unique();
            $table->string('slug', 120)->unique();
            $table->string('implementation', 80)->unique();
            $table->string('name', 120);
            $table->string('short_description', 240);
            $table->text('full_description')->nullable();
            $table->string('icon', 50)->nullable();
            $table->string('status', 20)->default('coming_soon');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_new')->default(false);
            $table->boolean('is_offline_capable')->default(false);
            $table->boolean('requires_login')->default(false);
            $table->boolean('history_enabled')->default(false);
            $table->string('version', 20)->default('1.0.0');
            $table->unsignedBigInteger('usage_count')->default(0);
            $table->json('tags')->nullable();
            $table->unsignedSmallInteger('display_order')->default(0);
            $table->timestamps();

            $table->index(['status', 'display_order']);
            $table->index(['tool_category_id', 'status', 'display_order']);
            $table->index(['is_featured', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tools');
    }
};
