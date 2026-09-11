<?php

namespace App\Domains\Operations\Models;

use App\Domains\Identity\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class InstituteGalleryImage extends Model
{
    use HasFactory;

    protected $table = 'institute_gallery_images';

    protected $fillable = [
        'image_path',
        'title',
        'category',
        'description',
        'event_date',
        'display_order',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'display_order' => 'integer',
        'event_date' => 'date',
    ];

    protected $appends = [
        'image_url',
    ];

    /**
     * Get accessible public URL for the gallery image.
     */
    public function getImageUrlAttribute(): string
    {
        if (! $this->image_path) {
            return '';
        }

        if (str_starts_with($this->image_path, 'http://') || str_starts_with($this->image_path, 'https://')) {
            return $this->image_path;
        }

        if (str_starts_with($this->image_path, '/images/') || str_starts_with($this->image_path, 'images/')) {
            return '/' . ltrim($this->image_path, '/');
        }

        return Storage::disk('public')->url($this->image_path);
    }

    /**
     * Scope only active gallery images.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->orderBy('display_order', 'asc')
            ->orderBy('id', 'desc');
    }

    /**
     * User who uploaded this photo.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
