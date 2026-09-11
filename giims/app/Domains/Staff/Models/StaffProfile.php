<?php

namespace App\Domains\Staff\Models;

use App\Domains\Identity\Models\User;
use App\Domains\Organization\Models\Department;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class StaffProfile extends Model
{
    use HasFactory;

    protected $table = 'staff_profiles';

    protected $fillable = [
        'user_id',
        'father_name',
        'cnic',
        'phone',
        'emergency_contact',
        'dob',
        'gender',
        'designation',
        'department_id',
        'employment_type',
        'salary_or_daily_rate',
        'joining_date',
        'highest_qualification',
        'residential_address',
        'permanent_address',
        'profile_photo_path',
        'cnic_front_path',
        'cnic_back_path',
        'cv_resume_path',
        'experience_certificate_path',
        'status',
    ];

    protected $casts = [
        'dob' => 'date',
        'joining_date' => 'date',
        'salary_or_daily_rate' => 'decimal:2',
    ];

    protected $appends = [
        'profile_photo_url',
        'cnic_front_url',
        'cnic_back_url',
        'cv_resume_url',
        'experience_certificate_url',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    protected function resolveUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        if (str_starts_with($path, '/images/') || str_starts_with($path, 'images/')) {
            return '/' . ltrim($path, '/');
        }

        return Storage::disk('public')->url($path);
    }

    public function getProfilePhotoUrlAttribute(): ?string
    {
        return $this->resolveUrl($this->profile_photo_path);
    }

    public function getCnicFrontUrlAttribute(): ?string
    {
        return $this->resolveUrl($this->cnic_front_path);
    }

    public function getCnicBackUrlAttribute(): ?string
    {
        return $this->resolveUrl($this->cnic_back_path);
    }

    public function getCvResumeUrlAttribute(): ?string
    {
        return $this->resolveUrl($this->cv_resume_path);
    }

    public function getExperienceCertificateUrlAttribute(): ?string
    {
        return $this->resolveUrl($this->experience_certificate_path);
    }
}
