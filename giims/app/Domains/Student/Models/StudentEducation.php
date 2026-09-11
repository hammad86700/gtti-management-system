<?php

namespace App\Domains\Student\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class StudentEducation extends Model
{
    use HasFactory;

    protected $table = 'student_educations';

    protected $fillable = [
        'student_profile_id',
        'degree_level',
        'degree_title',
        'institute_or_board',
        'passing_year',
        'roll_number',
        'total_marks',
        'obtained_marks',
        'percentage',
        'grade_or_division',
        'transcript_scan_path',
    ];

    protected $casts = [
        'passing_year' => 'integer',
        'total_marks' => 'decimal:2',
        'obtained_marks' => 'decimal:2',
        'percentage' => 'decimal:2',
    ];

    protected $appends = [
        'transcript_scan_url',
    ];

    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class);
    }

    public function getTranscriptScanUrlAttribute(): ?string
    {
        if (!$this->transcript_scan_path) {
            return null;
        }

        if (str_starts_with($this->transcript_scan_path, 'http://') || str_starts_with($this->transcript_scan_path, 'https://')) {
            return $this->transcript_scan_path;
        }

        if (str_starts_with($this->transcript_scan_path, 'private/')) {
            return route('clerk.applications.view-doc', ['path' => $this->transcript_scan_path]);
        }

        return Storage::disk('public')->url($this->transcript_scan_path);
    }
}
