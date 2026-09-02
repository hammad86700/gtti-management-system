<?php

namespace App\Domains\Admissions\Models;

use App\Domains\Organization\Models\Course;
use App\Domains\Student\Models\StudentProfile;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Application extends Model
{
    use HasFactory, SoftDeletes, \App\Traits\LogsActivity;

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
            'merit_score' => 'decimal:2',
        ];
    }

    /**
     * Get the admission campaign for the application.
     */
    public function admissionCampaign(): BelongsTo
    {
        return $this->belongsTo(AdmissionCampaign::class);
    }

    /**
     * Get the student profile that owns the application.
     */
    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class);
    }

    /**
     * Get the course applied for.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the verification documents for the application.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(ApplicationDocument::class);
    }

    /**
     * Get the merit list that the application is ranked in.
     */
    public function meritList(): BelongsTo
    {
        return $this->belongsTo(MeritList::class);
    }
}
