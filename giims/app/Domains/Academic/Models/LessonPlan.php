<?php

namespace App\Domains\Academic\Models;

use App\Domains\Identity\Models\User;
use App\Domains\Organization\Models\Batch;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class LessonPlan extends Model
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
            'planned_date' => 'date',
        ];
    }

    /**
     * Get the batch for this lesson plan.
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    /**
     * Get the subject for this lesson plan.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the teacher who created this lesson plan.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
