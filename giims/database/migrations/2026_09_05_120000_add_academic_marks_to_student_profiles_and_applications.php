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
        Schema::table('student_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('student_profiles', 'matric_total_marks')) {
                $table->integer('matric_total_marks')->nullable()->after('address');
            }
            if (!Schema::hasColumn('student_profiles', 'matric_obtained_marks')) {
                $table->integer('matric_obtained_marks')->nullable()->after('matric_total_marks');
            }
            if (!Schema::hasColumn('student_profiles', 'matric_board')) {
                $table->string('matric_board')->nullable()->after('matric_obtained_marks');
            }
            if (!Schema::hasColumn('student_profiles', 'intermediate_total_marks')) {
                $table->integer('intermediate_total_marks')->nullable()->after('matric_board');
            }
            if (!Schema::hasColumn('student_profiles', 'intermediate_obtained_marks')) {
                $table->integer('intermediate_obtained_marks')->nullable()->after('intermediate_total_marks');
            }
            if (!Schema::hasColumn('student_profiles', 'intermediate_board')) {
                $table->string('intermediate_board')->nullable()->after('intermediate_obtained_marks');
            }
        });

        Schema::table('applications', function (Blueprint $table) {
            if (!Schema::hasColumn('applications', 'matric_total_marks')) {
                $table->integer('matric_total_marks')->nullable()->after('total_marks');
            }
            if (!Schema::hasColumn('applications', 'matric_obtained_marks')) {
                $table->integer('matric_obtained_marks')->nullable()->after('matric_total_marks');
            }
            if (!Schema::hasColumn('applications', 'intermediate_total_marks')) {
                $table->integer('intermediate_total_marks')->nullable()->after('matric_obtained_marks');
            }
            if (!Schema::hasColumn('applications', 'intermediate_obtained_marks')) {
                $table->integer('intermediate_obtained_marks')->nullable()->after('intermediate_total_marks');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'matric_total_marks',
                'matric_obtained_marks',
                'matric_board',
                'intermediate_total_marks',
                'intermediate_obtained_marks',
                'intermediate_board',
            ]);
        });

        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn([
                'matric_total_marks',
                'matric_obtained_marks',
                'intermediate_total_marks',
                'intermediate_obtained_marks',
            ]);
        });
    }
};
