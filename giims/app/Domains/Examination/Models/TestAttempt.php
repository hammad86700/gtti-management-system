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
}
