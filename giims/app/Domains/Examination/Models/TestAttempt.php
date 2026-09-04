<?php

namespace App\Domains\Examination\Models;

use App\Domains\Student\Models\StudentProfile;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TestAttempt extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array<string>|bool
     */
    protected $guarded = [];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time' => 'datetime',
            'score' => 'integer',
            'total_questions' => 'integer',
            'answers' => 'array',
            'practical_marks' => 'integer',
            'grand_total' => 'integer',
            'percentage' => 'float',
            'shuffled_question_order' => 'array',
            'warning_count' => 'integer',
        ];
    }

    /**
     * The online test attempted.
     */
    public function onlineTest(): BelongsTo
    {
        return $this->belongsTo(OnlineTest::class);
    }

    /**
     * The student profile who made this attempt.
     */
    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class);
    }

    /**
     * The faculty member or interviewer who evaluated practical / viva marks.
     */
    public function interviewer(): BelongsTo
    {
        return $this->belongsTo(\App\Domains\Identity\Models\User::class, 'interviewer_id');
    }

    /**
     * Recalculate Grand Total (MCQ + Practical) and Percentage.
     */
    public function recalculateGrandTotal(): void
    {
        $mcqScore = (int) ($this->score ?? 0);
        $practical = $this->practical_marks !== null ? (int) $this->practical_marks : 0;
        $mcqTotal = (int) ($this->total_questions ?? $this->onlineTest?->effectiveQuestionCount() ?? 0);
        $practicalMax = (int) ($this->onlineTest?->practical_marks ?? 5);

        $grandTotal = $mcqScore + $practical;
        $maxPossible = $mcqTotal + $practicalMax;

        $pct = $maxPossible > 0 ? round(($grandTotal / $maxPossible) * 100, 2) : 0.0;

        $this->update([
            'grand_total' => $grandTotal,
            'percentage' => $pct,
        ]);
    }

    /**
     * Check if attempt achieved passing criteria.
     */
    public function isPassed(): bool
    {
        $passPct = (int) ($this->onlineTest?->passing_percentage ?? 50);
        return ($this->percentage ?? 0) >= $passPct;
    }
}
