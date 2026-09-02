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
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->text('rejection_reason')->nullable()->after('status');
            $table->string('category')->default('General')->nullable()->after('reason');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_visiting_faculty')->default(false)->after('status');
            $table->integer('daily_rate')->nullable()->after('is_visiting_faculty');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropColumn(['rejection_reason', 'category']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_visiting_faculty', 'daily_rate']);
        });
    }
};
