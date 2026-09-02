<?php

namespace App\Http\Controllers\Teacher;

use App\Domains\Student\Models\Enrollment;
use App\Domains\Student\Models\LeaveRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaveController extends Controller
{
    /**
     * Display pending leave requests for students in the teacher's batches.
     */
    public function index(): Response
    {
        $batchIds = auth()->user()->batches()->pluck('batches.id');
        $studentProfileIds = Enrollment::whereIn('batch_id', $batchIds)->pluck('student_profile_id');

        $leaves = LeaveRequest::with([
                'studentProfile.user',
                'studentProfile.enrollments.batch',
                'studentProfile.enrollments.course',
                'approvedBy',
            ])
            ->whereIn('student_profile_id', $studentProfileIds)
            ->latest()
            ->get();

        return Inertia::render('Teacher/Leave/Index', [
            'leaves' => $leaves,
        ]);
    }

    /**
     * Approve or reject a student leave request.
     */
    public function updateStatus(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string|max:1000',
        ]);

        $leave = LeaveRequest::findOrFail($id);

        $leave->update([
            'status' => $validated['status'],
            'rejection_reason' => $validated['status'] === 'rejected' ? $validated['rejection_reason'] : null,
            'approved_by' => auth()->id(),
        ]);

        // Dispatch event to notify student and log parent SMS/Email
        \App\Domains\Student\Events\LeaveProcessed::dispatch($leave, $validated['status']);

        return redirect()->back()->with('success', "Leave request marked as {$validated['status']}.");
    }
}
