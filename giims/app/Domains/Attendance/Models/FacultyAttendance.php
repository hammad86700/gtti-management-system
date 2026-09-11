<?php

namespace App\Domains\Attendance\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class FacultyAttendance extends Model
{
    use HasFactory;

    protected $table = 'faculty_attendances';

    protected $fillable = [
        'user_id',
        'attendance_date',
        'check_in_time',
        'proof_image_path',
        'ip_address',
        'is_ip_verified',
        'status',
        'remarks',
    ];

    protected $appends = [
        'proof_image_url',
    ];

    protected function casts(): array
    {
        return [
            'attendance_date' => 'date:Y-m-d',
            'is_ip_verified' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getProofImageUrlAttribute(): ?string
    {
        if (! $this->proof_image_path) {
            return null;
        }

        return '/storage/' . ltrim($this->proof_image_path, '/');
    }
}
