<?php

namespace App\Http\Controllers\Teacher;

use App\Domains\Student\Models\Enrollment;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LmsActivationController extends Controller
{
    /**
     * Toggle LMS coursework activation for an enrolled trainee.
     */
    public function toggleLms(Request $request, int $enrollmentId): RedirectResponse
    {
        $user = auth()->user();
        $enrollment = Enrollment::with(['studentProfile.user', 'batch', 'course'])->findOrFail($enrollmentId);

        // Verify teacher authority: Super Admin / Admin or instructor allocated to this batch/course
        $isExecutive = $user->is_super_admin || $user->is_admin || $user->roles()->whereIn('slug', ['super-admin', 'principal', 'admin'])->exists();
        $isBatchTeacher = $user->batches()->where('batches.id', $enrollment->batch_id)->exists();

        if (!$isExecutive && !$isBatchTeacher) {
            abort(403, 'Unauthorized. Only the assigned Trade Instructor or Academic Head can activate student LMS coursework.');
        }

        $newState = !$enrollment->is_lms_active;

        $enrollment->update([
            'is_lms_active' => $newState,
            'lms_activated_at' => $newState ? now() : null,
            'lms_activated_by' => $newState ? $user->id : null,
        ]);

        $studentName = $enrollment->studentProfile?->user?->name ?: 'Trainee';
        $statusText = $newState ? 'activated and fully unlocked' : 'temporarily suspended';

        if (function_exists('activity')) {
            activity()
                ->causedBy($user)
                ->performedOn($enrollment)
                ->log("Instructor {$user->name} {$statusText} LMS Coursework for {$studentName} ({$enrollment->enrollment_number})");
        }

        return redirect()->back()->with('success', "LMS Coursework access {$statusText} for {$studentName}.");
    }

    /**
     * 1-Click activate all trainees in a batch.
     */
    public function activateAllBatch(Request $request, int $batchId): RedirectResponse
    {
        $user = auth()->user();
        $isExecutive = $user->is_super_admin || $user->is_admin || $user->roles()->whereIn('slug', ['super-admin', 'principal', 'admin'])->exists();
        $isBatchTeacher = $user->batches()->where('batches.id', $batchId)->exists();

        if (!$isExecutive && !$isBatchTeacher) {
            abort(403, 'Unauthorized.');
        }

        $count = Enrollment::where('batch_id', $batchId)
            ->where('is_lms_active', false)
            ->update([
                'is_lms_active' => true,
                'lms_activated_at' => now(),
                'lms_activated_by' => $user->id,
            ]);

        return redirect()->back()->with('success', "LMS Coursework access activated for all {$count} trainees in this batch.");
    }
}
