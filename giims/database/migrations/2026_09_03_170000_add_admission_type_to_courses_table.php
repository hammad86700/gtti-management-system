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
            $table->string('admission_type')->default('merit_based')->after('entry_level');
            $table->integer('matric_weightage')->default(50)->after('admission_type');
            $table->integer('test_weightage')->default(50)->after('matric_weightage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['admission_type', 'matric_weightage', 'test_weightage']);
        });
    }
};
