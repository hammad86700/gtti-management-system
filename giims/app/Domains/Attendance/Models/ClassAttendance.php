<?php

namespace App\Domains\Attendance\Models;

use App\Domains\Student\Models\StudentProfile;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClassAttendance extends Model
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
            'student_lat' => 'float',
            'student_lng' => 'float',
            'distance_meters' => 'float',
            'marked_at' => 'datetime',
            'late_minutes' => 'integer',
            'is_confirmed_by_teacher' => 'boolean',
            'teacher_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Get the attendance session.
     */
    public function attendanceSession(): BelongsTo
    {
        return $this->belongsTo(AttendanceSession::class);
    }

    /**
     * Get the instructor who confirmed this attendance.
     */
    public function confirmedByUser(): BelongsTo
    {
        return $this->belongsTo(\App\Domains\Identity\Models\User::class, 'confirmed_by_user_id');
    }

    /**
     * Get the student profile for this attendance log.
     */
    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class);
    }
}
