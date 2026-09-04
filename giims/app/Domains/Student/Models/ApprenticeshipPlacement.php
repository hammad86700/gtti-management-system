<?php

namespace App\Domains\Student\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ApprenticeshipPlacement extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'start_date'      => 'date',
        'end_date'        => 'date',
        'stipend_amount'  => 'decimal:2',
        'tevta_registered'=> 'boolean',
    ];

    /**
     * Get the student profile associated with this apprenticeship placement.
     */
    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class);
    }

    /**
     * Get the course enrollment associated with this placement.
     */
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }
}
