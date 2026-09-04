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
        Schema::table('online_tests', function (Blueprint $table) {
            if (!Schema::hasColumn('online_tests', 'question_pool_size')) {
                $table->unsignedInteger('question_pool_size')->nullable()->after('duration_minutes');
            }
            if (!Schema::hasColumn('online_tests', 'practical_marks')) {
                $table->unsignedInteger('practical_marks')->default(5)->after('question_pool_size');
            }
            if (!Schema::hasColumn('online_tests', 'passing_percentage')) {
                $table->unsignedInteger('passing_percentage')->default(50)->after('practical_marks');
            }
            if (!Schema::hasColumn('online_tests', 'is_live')) {
                $table->boolean('is_live')->default(false)->after('status');
            }
            if (!Schema::hasColumn('online_tests', 'description')) {
                $table->text('description')->nullable()->after('title');
            }
        });

        Schema::table('test_attempts', function (Blueprint $table) {
            if (!Schema::hasColumn('test_attempts', 'practical_marks')) {
                $table->unsignedInteger('practical_marks')->nullable()->after('score');
            }
            if (!Schema::hasColumn('test_attempts', 'practical_remarks')) {
                $table->text('practical_remarks')->nullable()->after('practical_marks');
            }
            if (!Schema::hasColumn('test_attempts', 'interviewer_id')) {
                $table->foreignId('interviewer_id')->nullable()->after('practical_remarks')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('test_attempts', 'grand_total')) {
                $table->unsignedInteger('grand_total')->nullable()->after('interviewer_id');
            }
            if (!Schema::hasColumn('test_attempts', 'percentage')) {
                $table->decimal('percentage', 5, 2)->nullable()->after('grand_total');
            }
            if (!Schema::hasColumn('test_attempts', 'shuffled_question_order')) {
                $table->json('shuffled_question_order')->nullable()->after('answers');
            }
            if (!Schema::hasColumn('test_attempts', 'warning_count')) {
                $table->unsignedInteger('warning_count')->default(0)->after('shuffled_question_order');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('test_attempts', function (Blueprint $table) {
            $table->dropForeign(['interviewer_id']);
            $table->dropColumn([
                'practical_marks',
                'practical_remarks',
                'interviewer_id',
                'grand_total',
                'percentage',
                'shuffled_question_order',
                'warning_count',
            ]);
        });

        Schema::table('online_tests', function (Blueprint $table) {
            $table->dropColumn([
                'question_pool_size',
                'practical_marks',
                'passing_percentage',
                'is_live',
                'description',
            ]);
        });
    }
};
