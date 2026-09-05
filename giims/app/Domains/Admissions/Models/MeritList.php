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
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'classes_start_date' => 'date',
            'published_at' => 'datetime',
            'is_publicly_visible' => 'boolean',
        ];
    }

    /**
     * Get the course for this merit list.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the staff user who uploaded / published this merit list.
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(\App\Domains\Identity\Models\User::class, 'uploaded_by');
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

    /**
     * Scope for published merit lists.
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope for publicly visible merit lists.
     */
    public function scopePubliclyVisible($query)
    {
        return $query->where(function ($q) {
            $q->where('is_publicly_visible', true)
              ->orWhere('status', 'published');
        });
    }
}
