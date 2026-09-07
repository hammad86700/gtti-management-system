<?php

namespace App\Domains\Student\Models;

use App\Domains\Academic\Models\AssignmentSubmission;
use App\Domains\Admissions\Models\Application;
use App\Domains\Identity\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class StudentProfile extends Model
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
            'date_of_birth' => 'date',
            'struck_off_at' => 'datetime',
            'struck_off_until' => 'datetime',
        ];
    }

    /**
     * Get the master user identity that owns the profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->withTrashed();
    }

    /**
     * Get the applications for the student.
     */
    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    /**
     * Get the enrollments for the student.
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    /**
     * Get the assignment submissions for the student.
     */
    public function assignmentSubmissions(): HasMany
    {
        return $this->hasMany(AssignmentSubmission::class);
    }

    /**
     * Get the gate security access logs for the student.
     */
    public function gateLogs(): HasMany
    {
        return $this->hasMany(\App\Domains\Attendance\Models\GateLog::class);
    }

    /**
     * Get the classroom attendance logs for the student.
     */
    public function classAttendances(): HasMany
    {
        return $this->hasMany(\App\Domains\Attendance\Models\ClassAttendance::class);
    }

    /**
     * Get the formal leave requests submitted by the student.
     */
    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    /**
     * Get all examination results for the student.
     */
    public function examResults(): HasMany
    {
        return $this->hasMany(\App\Domains\Examination\Models\ExamResult::class);
    }

    /**
     * Get the latest clearance request for the student.
     */
    public function clearance(): HasOne
    {
        return $this->hasOne(Clearance::class)->latestOfMany();
    }

    /**
     * Get all clearance requests for the student.
     */
    public function clearances(): HasMany
    {
        return $this->hasMany(Clearance::class);
    }

    /**
     * Get all certificates awarded to the student.
     */
    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    /**
     * Get all disciplinary incidents logged against the student.
     */
    public function disciplineRecords(): HasMany
    {
        return $this->hasMany(\App\Domains\Operations\Models\DisciplineRecord::class);
    }

    /**
     * Get the alumni career placement record for the student.
     */
    public function alumniPlacement(): HasOne
    {
        return $this->hasOne(AlumniPlacement::class);
    }

    /**
     * Get all CBT online test attempts taken by this student.
     */
    public function testAttempts(): HasMany
    {
        return $this->hasMany(\App\Domains\Examination\Models\TestAttempt::class);
    }

    /**
     * Get all status and termination requests for this student.
     */
    public function statusRequests(): HasMany
    {
        return $this->hasMany(StudentStatusRequest::class);
    }

    /**
     * Determine if this student is currently permanently terminated.
     */
    public function isTerminated(): bool
    {
        return $this->status === 'terminated';
    }

    /**
     * Determine if this student is currently temporarily struck off.
     */
    public function isStruckOff(): bool
    {
        if ($this->status !== 'struck_off') {
            return false;
        }

        // If suspension has expired, student is no longer actively struck off
        if ($this->struck_off_until && now()->greaterThan($this->struck_off_until)) {
            return false;
        }

        return true;
    }

    /**
     * Determine if student has any active sanction (struck-off or terminated).
     */
    public function isSanctioned(): bool
    {
        return $this->isTerminated() || $this->isStruckOff();
    }

    /**
     * Calculate remaining days in temporary suspension.
     */
    public function remainingSuspensionDays(): int
    {
        if (!$this->isStruckOff() || !$this->struck_off_until) {
            return 0;
        }

        return max(0, (int) ceil(now()->diffInSeconds($this->struck_off_until, false) / 86400));
    }
}
