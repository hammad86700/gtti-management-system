<?php

namespace App\Domains\Admissions\Models;

use App\Domains\Identity\Models\User;
use App\Domains\Organization\Models\Course;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AdmissionEntranceExam extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'exam_date' => 'date',
            'is_live' => 'boolean',
            'total_marks' => 'integer',
            'passing_marks' => 'integer',
            'duration_minutes' => 'integer',
        ];
    }

    /**
     * Get the course associated with this entrance exam.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the teacher / examiner in charge of this entrance exam.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Get all questions for this entrance exam.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(EntranceTestQuestion::class, 'entrance_exam_id');
    }

    /**
     * Get all candidate attempts for this entrance exam.
     */
    public function attempts(): HasMany
    {
        return $this->hasMany(EntranceTestAttempt::class, 'entrance_exam_id');
    }

    /**
     * Helper to check if test is CBT online
     */
    public function isCbt(): bool
    {
        return $this->test_type === 'cbt_online';
    }

    /**
     * Helper to check if test is manual practical/interview
     */
    public function isManualPractical(): bool
    {
        return $this->test_type === 'manual_practical';
    }
}
