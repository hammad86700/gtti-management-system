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
            if (!Schema::hasColumn('courses', 'requires_entrance_test')) {
                $table->boolean('requires_entrance_test')->default(true)->after('admission_type');
            }
            if (!Schema::hasColumn('courses', 'interview_weightage')) {
                $table->integer('interview_weightage')->default(10)->after('test_weightage');
            }
            if (!Schema::hasColumn('courses', 'interview_max_marks')) {
                $table->integer('interview_max_marks')->default(10)->after('interview_weightage');
            }
            if (!Schema::hasColumn('courses', 'interview_venue')) {
                $table->string('interview_venue')->default('Lab 3 / Interview Room')->after('interview_max_marks');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn([
                'requires_entrance_test',
                'interview_weightage',
                'interview_max_marks',
                'interview_venue',
            ]);
        });
    }
};
