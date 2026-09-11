<?php

namespace App\Domains\Operations\Models;

use App\Domains\Identity\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class InstitutionalHoliday extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'institutional_holidays';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'holiday_date' => 'date',
            'end_date' => 'date',
            'course_ids' => 'array',
            'is_published' => 'boolean',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    /**
     * Check if a given date is a published holiday for a specific course or institute-wide.
     * Supports both ($date, $courseId) and ($courseId, $date).
     */
    public static function isHolidayForCourse($arg1, $arg2 = null): bool
    {
        if (is_numeric($arg1) && !is_numeric($arg2)) {
            $courseId = (int) $arg1;
            $date = $arg2;
        } elseif (!is_numeric($arg1) && is_numeric($arg2)) {
            $date = $arg1;
            $courseId = (int) $arg2;
        } else {
            $date = $arg1;
            $courseId = $arg2 ? (int) $arg2 : null;
        }

        $dateStr = Carbon::parse($date)->toDateString();

        $holidays = static::published()
            ->where(function ($q) use ($dateStr) {
                $q->whereDate('holiday_date', $dateStr)
                    ->orWhere(function ($sub) use ($dateStr) {
                        $sub->whereDate('holiday_date', '<=', $dateStr)
                            ->whereNotNull('end_date')
                            ->whereDate('end_date', '>=', $dateStr);
                    });
            })
            ->get();

        foreach ($holidays as $h) {
            if ($h->scope === 'all') {
                return true;
            }

            if ($courseId && $h->scope === 'specific_courses' && is_array($h->course_ids)) {
                if (in_array($courseId, $h->course_ids) || in_array((string)$courseId, $h->course_ids)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Check if a given date is a published holiday institute-wide (for teachers / staff).
     */
    public static function isHolidayForInstitute($date): bool
    {
        $dateStr = Carbon::parse($date)->toDateString();

        return static::published()
            ->where('scope', 'all')
            ->where(function ($q) use ($dateStr) {
                $q->whereDate('holiday_date', $dateStr)
                    ->orWhere(function ($sub) use ($dateStr) {
                        $sub->whereDate('holiday_date', '<=', $dateStr)
                            ->whereNotNull('end_date')
                            ->whereDate('end_date', '>=', $dateStr);
                    });
            })
            ->exists();
    }
}
