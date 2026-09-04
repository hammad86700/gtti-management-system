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
        Schema::table('entrance_test_attempts', function (Blueprint $table) {
            if (!Schema::hasColumn('entrance_test_attempts', 'cbt_score')) {
                $table->float('cbt_score')->nullable()->after('entrance_marks_obtained');
            }
            if (!Schema::hasColumn('entrance_test_attempts', 'interview_score')) {
                $table->float('interview_score')->nullable()->after('cbt_score');
            }
            if (!Schema::hasColumn('entrance_test_attempts', 'interview_remarks')) {
                $table->text('interview_remarks')->nullable()->after('interview_score');
            }
            if (!Schema::hasColumn('entrance_test_attempts', 'interview_status')) {
                $table->string('interview_status')->default('waiting')->after('interview_remarks'); // waiting, in_progress, completed
            }
            if (!Schema::hasColumn('entrance_test_attempts', 'evaluated_by')) {
                $table->foreignId('evaluated_by')->nullable()->after('interview_status')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('entrance_test_attempts', 'locked_at')) {
                $table->timestamp('locked_at')->nullable()->after('evaluated_by');
            }
            if (!Schema::hasColumn('entrance_test_attempts', 'composite_score')) {
                $table->decimal('composite_score', 8, 4)->nullable()->after('locked_at');
            }
            if (!Schema::hasColumn('entrance_test_attempts', 'merit_rank')) {
                $table->integer('merit_rank')->nullable()->after('composite_score');
            }
            if (!Schema::hasColumn('entrance_test_attempts', 'selection_status')) {
                $table->string('selection_status')->nullable()->after('merit_rank'); // selected, waiting, disqualified
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('entrance_test_attempts', function (Blueprint $table) {
            $table->dropForeign(['evaluated_by']);
            $table->dropColumn([
                'cbt_score',
                'interview_score',
                'interview_remarks',
                'interview_status',
                'evaluated_by',
                'locked_at',
                'composite_score',
                'merit_rank',
                'selection_status',
            ]);
        });
    }
};
