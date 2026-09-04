<?php

namespace App\Domains\Academic\Models;

use App\Domains\Organization\Models\Batch;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class DailyLesson extends Model
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
            'day_number' => 'integer',
            'scheduled_date' => 'date',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * Get the batch that owns the daily lesson.
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    /**
     * Scope a query to order lessons by sequential day number.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('day_number', 'asc');
    }

    /**
     * Scope a query to only completed lessons.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}
