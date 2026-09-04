<?php

namespace App\Domains\Admissions\Models;

use App\Domains\Student\Models\StudentProfile;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EntranceTestAttempt extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'is_present' => 'boolean',
            'shuffled_question_order' => 'array',
            'submitted_answers' => 'array',
            'matric_marks_obtained' => 'integer',
            'total_matric_marks' => 'integer',
            'entrance_marks_obtained' => 'float',
            'cbt_score' => 'float',
            'interview_score' => 'float',
            'composite_merit_score' => 'float',
            'composite_score' => 'decimal:4',
            'merit_rank' => 'integer',
            'started_at' => 'datetime',
            'submitted_at' => 'datetime',
            'locked_at' => 'datetime',
        ];
    }

    /**
     * Get the exam for this attempt.
     */
    public function entranceExam(): BelongsTo
    {
        return $this->belongsTo(AdmissionEntranceExam::class, 'entrance_exam_id');
    }

    /**
     * Get the course application for this attempt.
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    /**
     * Get the student profile for this attempt.
     */
    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class);
    }

    /**
     * Get the examiner / interviewer who evaluated this candidate.
     */
    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(\App\Domains\Identity\Models\User::class, 'evaluated_by');
    }

    /**
     * Calculate composite merit score based on course weightages.
     * Formula:
     * (MatricObtained / TotalMatric * MatricWeightage) +
     * (CbtScore / TotalExamMarks * TestWeightage) +
     * (InterviewScore / InterviewMax * InterviewWeightage)
     */
    public function calculateCompositeScore(): float
    {
        $exam = $this->entranceExam;
        $course = $exam?->course;

        $matricWeightage = $course?->matric_weightage ?? 50;
        $testWeightage = $course?->test_weightage ?? 40;
        $interviewWeightage = $course?->interview_weightage ?? 10;
        $interviewMax = $course?->interview_max_marks ?? 10;

        $matricComponent = 0.0;
        $matricObt = $this->matric_marks_obtained ?? $this->application?->obtained_marks;
        $matricTot = $this->total_matric_marks ?? $this->application?->total_marks ?? 1100;
        if ($matricTot > 0 && $matricObt !== null) {
            $matricComponent = ($matricObt / $matricTot) * $matricWeightage;
        }

        $testComponent = 0.0;
        $cbtScore = $this->cbt_score ?? $this->entrance_marks_obtained;
        $totalTestMarks = $exam?->total_marks > 0 ? $exam->total_marks : 100;
        if ($cbtScore !== null) {
            $testComponent = ($cbtScore / $totalTestMarks) * $testWeightage;
        }

        $interviewComponent = 0.0;
        if ($this->interview_score !== null && $interviewMax > 0) {
            $interviewComponent = ($this->interview_score / $interviewMax) * $interviewWeightage;
        }

        return round($matricComponent + $testComponent + $interviewComponent, 4);
    }
}
