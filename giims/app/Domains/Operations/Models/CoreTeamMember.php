<?php

namespace App\Domains\Operations\Models;

use App\Domains\Identity\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class CoreTeamMember extends Model
{
    use HasFactory;

    protected $table = 'core_team_members';

    protected $fillable = [
        'name',
        'designation',
        'department',
        'experience',
        'phone',
        'email',
        'photo_path',
        'bio',
        'display_order',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    protected $appends = [
        'photo_url',
    ];

    /**
     * Get accessible public URL for the team member photo.
     */
    public function getPhotoUrlAttribute(): string
    {
        if (! $this->photo_path) {
            return '';
        }

        if (str_starts_with($this->photo_path, 'http://') || str_starts_with($this->photo_path, 'https://')) {
            return $this->photo_path;
        }

        if (str_starts_with($this->photo_path, '/images/') || str_starts_with($this->photo_path, 'images/')) {
            return '/' . ltrim($this->photo_path, '/');
        }

        return Storage::disk('public')->url($this->photo_path);
    }

    /**
     * Scope active team members ordered by display order.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->orderBy('display_order', 'asc')
            ->orderBy('id', 'asc');
    }

    /**
     * Creator relation.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
