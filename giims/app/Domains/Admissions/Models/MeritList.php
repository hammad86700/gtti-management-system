<?php

namespace App\Domains\Admissions\Models;

use App\Domains\Organization\Models\Course;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MeritList extends Model
{
    use HasFactory;

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array<string>|bool
     */
    protected $guarded = [];

    /**
     * Get the course for this merit list.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the admission campaign for this merit list.
     */
    public function admissionCampaign(): BelongsTo
    {
        return $this->belongsTo(AdmissionCampaign::class);
    }

    /**
     * Get the applications ranked in this merit list.
     */
    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }
}
