<?php

namespace App\Domains\Organization\Models;

use App\Domains\Academic\Models\Subject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
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
            'is_active' => 'boolean',
            'is_published' => 'boolean',
            'is_admission_open' => 'boolean',
            'requires_entrance_test' => 'boolean',
            'capacity' => 'integer',
            'intake_capacity' => 'integer',
            'classes_start_date' => 'date',
            'duration_value' => 'integer',
            'total_academic_days' => 'integer',
            'matric_weightage' => 'integer',
            'test_weightage' => 'integer',
            'interview_weightage' => 'integer',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::saving(function (Course $course) {
            if ($course->isDirty('intake_capacity') && !$course->isDirty('capacity')) {
                $course->capacity = $course->intake_capacity;
            } elseif ($course->isDirty('capacity') && !$course->isDirty('intake_capacity')) {
                $course->intake_capacity = $course->capacity;
            } elseif (!empty($course->intake_capacity) && empty($course->attributes['capacity'])) {
                $course->capacity = $course->intake_capacity;
            }
        });
    }

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'formatted_duration',
        'remaining_seats',
        'is_admission_full',
        'current_intake_count'
    ];

    /**
     * Get the human-readable formatted duration string.
     */
    public function getFormattedDurationAttribute(): string
    {
        $val = $this->duration_value ?: 6;
        $type = $this->duration_type ?: 'months';

        if ($type === 'months') {
            if ($val == 3) return '3 Months Short Course';
            if ($val == 6) return '6 Months CBT&A';
            if ($val == 12) return '1 Year Diploma';
            if ($val == 24) return '2-Year G-II Diploma';
            if ($val == 36) return '3-Year DAE Diploma';
            return "{$val} Months Course";
        }

        if ($type === 'weeks') {
            return "{$val} Weeks Training";
        }

        if ($type === 'days') {
            return "{$val} Days Workshop";
        }

        if ($type === 'hours') {
            return "{$val} Hours Fast-Track";
        }

        return "{$val} " . ucfirst($type);
    }

    /**
     * Get the trade that owns the course.
     */
    public function trade(): BelongsTo
    {
        return $this->belongsTo(Trade::class);
    }

    /**
     * Get the batches for the course.
     */
    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class);
    }

    /**
     * Get the subjects taught in this course.
     */
    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class);
    }

    /**
     * Get the enrollments for this course.
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(\App\Domains\Student\Models\Enrollment::class);
    }

    /**
     * Get entrance exams for this course.
     */
    public function entranceExams(): HasMany
    {
        return $this->hasMany(\App\Domains\Admissions\Models\AdmissionEntranceExam::class);
    }

    /**
     * Get admission applications for this course.
     */
    public function applications(): HasMany
    {
        return $this->hasMany(\App\Domains\Admissions\Models\Application::class);
    }

    /**
     * Get interview questions for this course.
     */
    public function interviewQuestions(): HasMany
    {
        return $this->hasMany(\App\Domains\Admissions\Models\InterviewQuestion::class);
    }

    /**
     * Check if course uses merit-based admission.
     */
    public function isMeritBased(): bool
    {
        return ($this->admission_type ?? 'merit_based') === 'merit_based';
    }

    /**
     * Check if course uses first-come-first-served admission.
     */
    public function isFcfs(): bool
    {
        return ($this->admission_type ?? 'merit_based') === 'first_come_first_served' || $this->requires_entrance_test === false;
    }

    /**
     * Get the count of occupied intake seats.
     */
    public function currentIntakeCount(): int
    {
        if ($this->relationLoaded('applications')) {
            return $this->applications->where('status', '!=', 'rejected')->count();
        }

        return $this->applications()->where('status', '!=', 'rejected')->count();
    }

    public function getCurrentIntakeCountAttribute(): int
    {
        return $this->currentIntakeCount();
    }

    /**
     * Get remaining available intake seats.
     */
    public function remainingSeats(): int
    {
        $capacity = $this->intake_capacity ?: ($this->capacity ?: 25);
        return max(0, $capacity - $this->currentIntakeCount());
    }

    public function getRemainingSeatsAttribute(): int
    {
        return $this->remainingSeats();
    }

    /**
     * Determine whether the course admission is full and closed.
     */
    public function isAdmissionFull(): bool
    {
        if ($this->is_admission_open === false) {
            return true;
        }

        $capacity = $this->intake_capacity ?: ($this->capacity ?: 25);
        return $this->currentIntakeCount() >= $capacity;
    }

    public function getIsAdmissionFullAttribute(): bool
    {
        return $this->isAdmissionFull();
    }
}
