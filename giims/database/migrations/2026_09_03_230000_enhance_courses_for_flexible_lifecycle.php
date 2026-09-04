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
            if (!Schema::hasColumn('courses', 'duration_type')) {
                $table->string('duration_type')->default('months')->after('entry_level'); // months, weeks, days, hours
            }
            if (!Schema::hasColumn('courses', 'duration_value')) {
                $table->integer('duration_value')->default(6)->after('duration_type');
            }
            if (!Schema::hasColumn('courses', 'is_published')) {
                $table->boolean('is_published')->default(true)->after('is_active');
            }
            if (!Schema::hasColumn('courses', 'category')) {
                $table->string('category')->default('General Vocational')->after('name');
            }
            if (!Schema::hasColumn('courses', 'overview_description')) {
                $table->text('overview_description')->nullable()->after('category');
            }
            if (!Schema::hasColumn('courses', 'syllabus_document_path')) {
                $table->string('syllabus_document_path')->nullable()->after('overview_description');
            }
            if (!Schema::hasColumn('courses', 'total_academic_days')) {
                $table->integer('total_academic_days')->default(60)->after('duration_value');
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
                'duration_type',
                'duration_value',
                'is_published',
                'category',
                'overview_description',
                'syllabus_document_path',
                'total_academic_days',
            ]);
        });
    }
};
