<?php

namespace App\Domains\Finance\Models;

use App\Domains\Admissions\Models\Application;
use App\Domains\Student\Models\Clearance;
use App\Domains\Student\Models\Enrollment;
use App\Domains\Student\Models\StudentProfile;
use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class FeeChallan extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'due_date' => 'date',
            'paid_at' => 'date',
        ];
    }

    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class);
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    /**
     * Mark challan as paid and unlock corresponding application or clearance.
     */
    public function markAsPaid(float $amountPaid, string $depositDate, ?string $branchCode = null): bool
    {
        $this->update([
            'status' => 'paid',
            'amount_paid' => $amountPaid,
            'paid_at' => $depositDate,
            'bank_branch_code' => $branchCode,
        ]);

        // Unlock admission application fee status if linked
        if ($this->application_id && $this->application) {
            $this->application->update(['fee_status' => 'paid']);
        }

        // Unlock departmental clearance fee status if linked to student enrollment
        if ($this->enrollment_id) {
            $clearance = Clearance::where('enrollment_id', $this->enrollment_id)->first();
            if ($clearance) {
                $clearance->update(['fee_status' => 'cleared']);
            }
        }

        return true;
    }
}
