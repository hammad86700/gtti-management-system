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
        Schema::table('certificates', function (Blueprint $table) {
            $table->foreignId('enrollment_id')->nullable()->after('course_id')->constrained('enrollments')->nullOnDelete();
            $table->foreignId('batch_id')->nullable()->after('enrollment_id')->constrained('batches')->nullOnDelete();
            $table->string('status')->default('pending_approval')->after('certificate_number'); // requested, pending_approval, approved, rejected
            $table->date('request_date')->nullable()->after('status');
            $table->text('student_notes')->nullable()->after('request_date');
            $table->date('collection_date')->nullable()->after('issue_date');
            $table->string('grade', 10)->nullable()->after('collection_date');
            $table->integer('marks_obtained')->nullable()->after('grade');
            $table->integer('total_marks')->nullable()->after('marks_obtained');
            $table->foreignId('issued_by')->nullable()->after('total_marks')->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->after('issued_by')->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->text('rejection_reason')->nullable()->after('approved_at');
            $table->boolean('is_digital_released')->default(false)->after('rejection_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->dropForeign(['enrollment_id']);
            $table->dropForeign(['batch_id']);
            $table->dropForeign(['issued_by']);
            $table->dropForeign(['approved_by']);
            $table->dropColumn([
                'enrollment_id',
                'batch_id',
                'status',
                'request_date',
                'student_notes',
                'collection_date',
                'grade',
                'marks_obtained',
                'total_marks',
                'issued_by',
                'approved_by',
                'approved_at',
                'rejection_reason',
                'is_digital_released',
            ]);
        });
    }
};
