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
        Schema::create('entrance_test_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('entrance_exam_id')->constrained('admission_entrance_exams')->cascadeOnDelete();
            $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
            $table->foreignId('student_profile_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->integer('matric_marks_obtained')->nullable();
            $table->integer('total_matric_marks')->nullable();
            $table->float('entrance_marks_obtained')->nullable();
            $table->float('composite_merit_score')->nullable();
            $table->boolean('is_present')->default(true);
            $table->json('shuffled_question_order')->nullable();
            $table->json('submitted_answers')->nullable();
            $table->string('status')->default('scheduled'); // scheduled, in_progress, completed, absent
            $table->timestamp('started_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entrance_test_attempts');
    }
};
