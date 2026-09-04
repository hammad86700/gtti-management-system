<?php

namespace App\Domains\Student\Models;

use App\Domains\Organization\Models\Batch;
use App\Domains\Organization\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Enrollment extends Model
{
    use HasFactory, SoftDeletes, \App\Traits\LogsActivity;

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array<string>|bool
     */
    protected $guarded = [];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'enrollment_date' => 'date',
        'struck_off_at' => 'datetime',
        'struck_off_until' => 'datetime',
        'struck_off_days' => 'integer',
    ];

    /**
     * Get the student profile for this enrollment.
     */
    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class);
    }

    /**
     * Get the course for this enrollment.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the batch assigned to this enrollment.
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    /**
     * Get the clearance record associated with this enrollment.
     */
    public function clearance(): HasOne
    {
        return $this->hasOne(Clearance::class);
    }

    /**
     * Get the administrator who sanctioned this enrollment.
     */
    public function disciplinedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disciplined_by');
    }

    /**
     * Check if enrollment is currently struck off.
     */
    public function isStruckOff(): bool
    {
        return $this->status === 'struck_off';
    }

    /**
     * Check if enrollment is permanently terminated.
     */
    public function isTerminated(): bool
    {
        return $this->status === 'terminated';
    }

    /**
     * Calculate remaining days in temporary suspension.
     */
    public function remainingSuspensionDays(): int
    {
        if (! $this->struck_off_until || now()->greaterThan($this->struck_off_until)) {
            return 0;
        }

        return max(1, (int) ceil(now()->diffInRealDays($this->struck_off_until, false)));
    }
}
