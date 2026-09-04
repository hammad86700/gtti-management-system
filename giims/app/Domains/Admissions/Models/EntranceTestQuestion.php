<?php

namespace App\Domains\Admissions\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EntranceTestQuestion extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'marks' => 'integer',
        ];
    }

    /**
     * Get the exam that owns this question.
     */
    public function entranceExam(): BelongsTo
    {
        return $this->belongsTo(AdmissionEntranceExam::class, 'entrance_exam_id');
    }
}
