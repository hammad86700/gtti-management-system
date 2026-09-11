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
        Schema::table('courses', function (Blueprint $table) {
            if (!Schema::hasColumn('courses', 'offered_shifts')) {
                // Allowed values: 'Both', 'Morning', 'Evening'
                $table->string('offered_shifts')->default('Both')->after('requires_entrance_test');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            if (Schema::hasColumn('courses', 'offered_shifts')) {
                $table->dropColumn('offered_shifts');
            }
        });
    }
};
