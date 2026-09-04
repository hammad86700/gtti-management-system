<?php

namespace App\Domains\Examination\Models;

use App\Domains\Identity\Models\User;
use App\Domains\Organization\Models\Batch;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class OnlineTest extends Model
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
            'duration_minutes' => 'integer',
            'scheduled_at' => 'datetime',
            'question_pool_size' => 'integer',
            'practical_marks' => 'integer',
            'passing_percentage' => 'integer',
            'is_live' => 'boolean',
        ];
    }

    /**
     * Get the effective number of questions a student will be tested on.
     */
    public function effectiveQuestionCount(): int
    {
        $totalInBank = $this->questions()->count();
        if ($this->question_pool_size && $this->question_pool_size > 0 && $this->question_pool_size < $totalInBank) {
            return $this->question_pool_size;
        }
        return $totalInBank;
    }

    /**
     * The batch of trainees assigned to take this online test.
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    /**
     * The instructor/teacher who authored this CBT test.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Multiple choice questions belonging to this test.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(TestQuestion::class);
    }

    /**
     * All student attempts recorded for this test.
     */
    public function attempts(): HasMany
    {
        return $this->hasMany(TestAttempt::class);
    }
}
