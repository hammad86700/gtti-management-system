<?php

namespace App\Domains\Organization\Models;

use App\Domains\Academic\Models\Assignment;
use App\Domains\Academic\Models\LessonPlan;
use App\Domains\Identity\Models\User;
use App\Domains\Student\Models\Enrollment;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Batch extends Model
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
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    /**
     * Get the course that owns the batch.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the enrollments assigned to this batch.
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    /**
     * Get the teachers assigned to this batch.
     */
    public function teachers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'batch_user');
    }

    /**
     * Get the users/teachers assigned to this batch.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'batch_user');
    }

    /**
     * Get the lesson plans created for this batch.
     */
    public function lessonPlans(): HasMany
    {
        return $this->hasMany(LessonPlan::class);
    }

    /**
     * Get the assignments created for this batch.
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    /**
     * Get the class attendance sessions for this batch.
     */
    public function attendanceSessions(): HasMany
    {
        return $this->hasMany(\App\Domains\Attendance\Models\AttendanceSession::class);
    }

    /**
     * Get the exams conducted for this batch.
     */
    public function exams(): HasMany
    {
        return $this->hasMany(\App\Domains\Examination\Models\Exam::class);
    }

    /**
     * Get the inventory store transactions issued to this batch.
     */
    public function inventoryTransactions(): HasMany
    {
        return $this->hasMany(\App\Domains\Operations\Models\InventoryTransaction::class);
    }

    /**
     * Get the online CBT tests created for this batch.
     */
    public function onlineTests(): HasMany
    {
        return $this->hasMany(\App\Domains\Examination\Models\OnlineTest::class);
    }
}
