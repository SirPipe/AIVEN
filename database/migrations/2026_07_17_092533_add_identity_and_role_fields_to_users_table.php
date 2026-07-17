<?php

use App\UserRole;
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
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->unique()->after('name');
            $table->string('role')->default(UserRole::User->value)->index()->after('email_verified_at');
            $table->json('interests')->nullable()->after('role');
            $table->timestamp('terms_accepted_at')->nullable()->after('interests');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username',
                'role',
                'interests',
                'terms_accepted_at',
            ]);
        });
    }
};
