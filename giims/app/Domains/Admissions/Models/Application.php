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
            'test_date' => 'date',
            'scrutinized_at' => 'datetime',
            'challan_deposit_date' => 'date',
            'challan_uploaded_at' => 'datetime',
            'clerk_challan_uploaded_at' => 'datetime',
        ];
    }

    /**
     * Generate or get the unique entrance test roll number.
     */
    public function generateEntranceRollNumber(): string
    {
        if ($this->entrance_roll_number) {
            return $this->entrance_roll_number;
        }

        $roll = 'ET-' . date('Y') . '-' . str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
        $this->update(['entrance_roll_number' => $roll]);

        return $roll;
    }

    /**
     * Determine if this application requires an entrance test based on course settings.
     */
    public function requiresEntranceTest(): bool
    {
        return (bool) ($this->course?->requires_entrance_test ?? true);
    }

    /**
     * Generate permanent institutional roll number upon admission confirmation.
     * e.g. GTTI-2026-CO-01
     */
    public function generateInstitutionalRollNumber(): string
    {
        $year = date('Y');
        $code = strtoupper($this->course?->trade?->code ?: 'GEN');
        $seq = str_pad((string) $this->id, 2, '0', STR_PAD_LEFT);
        return "GTTI-{$year}-{$code}-{$seq}";
    }

    public function isPending(): bool
    {
        return in_array($this->status, ['pending', 'submitted']);
    }

    /**
     * Determine if this application has been verified by the clerk.
     */
    public function isVerified(): bool
    {
        return in_array($this->status, ['verified', 'slip_issued', 'tested', 'challan_issued', 'receipt_submitted', 'admitted', 'confirmed', 'selected', 'selected_for_admission']) || !is_null($this->scrutinized_at);
    }

    public function isSlipIssued(): bool
    {
        return $this->status === 'slip_issued' || (!empty($this->test_date) && !empty($this->entrance_roll_number));
    }

    public function isChallanIssued(): bool
    {
        return in_array($this->status, ['challan_issued', 'receipt_submitted', 'admitted', 'confirmed', 'selected_for_admission']) || !empty($this->clerk_challan_path);
    }

    public function isReceiptSubmitted(): bool
    {
        return in_array($this->status, ['receipt_submitted', 'admitted', 'confirmed']) || !empty($this->challan_receipt_path);
    }

    public function isAdmitted(): bool
    {
        return in_array($this->status, ['admitted', 'confirmed']);
    }

    /**
     * Get the fee challan issued for this application.
     */
    public function feeChallan(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(\App\Domains\Finance\Models\FeeChallan::class);
    }

    /**
     * Get the user (clerk or admin) who scrutinized the application.
     */
    public function scrutinizer(): BelongsTo
    {
        return $this->belongsTo(\App\Domains\Identity\Models\User::class, 'scrutinized_by');
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

    /**
     * Get the entrance test attempt for this application.
     */
    public function entranceTestAttempt(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(EntranceTestAttempt::class);
    }
}
