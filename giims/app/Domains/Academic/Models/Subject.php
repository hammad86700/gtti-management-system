<?php

namespace App\Domains\Academic\Models;

use App\Domains\Identity\Models\User;
use App\Domains\Organization\Models\Course;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subject extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array<string>|bool
     */
    protected $guarded = [];

    /**
     * Get the course that owns the subject.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the lesson plans for this subject.
     */
    public function lessonPlans(): HasMany
    {
        return $this->hasMany(LessonPlan::class);
    }

    /**
     * Get the assignments for this subject.
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    /**
     * Get the teachers assigned to teach this subject.
     */
    public function teachers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'batch_user');
    }

    /**
     * Get the exams conducted for this subject.
     */
    public function exams(): HasMany
    {
        return $this->hasMany(\App\Domains\Examination\Models\Exam::class);
    }
}
