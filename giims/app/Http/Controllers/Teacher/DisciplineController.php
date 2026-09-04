<?php

namespace App\Http\Controllers\Teacher;

use App\Domains\Student\Models\Enrollment;
use App\Domains\Student\Models\StudentProfile;
use App\Domains\Student\Models\StudentStatusRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DisciplineController extends Controller
{
    /**
     * Display teacher's disciplinary and student termination requests dashboard.
     */
    public function index(): Response
    {
        $user = auth()->user();

        // Get batches assigned to this instructor
        $batches = $user->batches()
            ->with(['course.trade.program.department'])
            ->get();

        $batchIds = $batches->pluck('id')->all();

        // Get all active trainees enrolled in teacher's batches
        $enrollments = Enrollment::with([
                'studentProfile.user',
                'course',
                'batch',
            ])
            ->whereIn('batch_id', $batchIds)
            ->where('status', 'active')
            ->get();

        $students = $enrollments->map(function ($enr) {
            return [
                'profile_id' => $enr->student_profile_id,
                'enrollment_id' => $enr->id,
                'enrollment_number' => $enr->enrollment_number,
                'batch_id' => $enr->batch_id,
                'batch_name' => $enr->batch?->name ?? 'N/A',
                'course_name' => $enr->course?->name ?? 'N/A',
                'name' => $enr->studentProfile?->user?->name ?? 'Trainee',
                'father_name' => $enr->studentProfile?->father_name ?? 'N/A',
                'status' => $enr->studentProfile?->status ?? 'active',
            ];
        })->unique('profile_id')->values();

        // Submitted requests by this teacher
        $requests = StudentStatusRequest::with([
                'studentProfile.user',
                'studentProfile.enrollments.course',
                'batch.course',
                'reviewer',
            ])
            ->where('requested_by', $user->id)
            ->latest()
            ->get();

        return Inertia::render('Teacher/Discipline/Index', [
            'batches' => $batches,
            'students' => $students,
            'requests' => $requests,
        ]);
    }

    /**
     * Submit a formal struck-off (suspension) or permanent termination request to the Principal.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();
        $batchIds = $user->batches()->pluck('batches.id')->all();

        $validated = $request->validate([
            'student_profile_id' => 'required|exists:student_profiles,id',
            'batch_id' => 'nullable|exists:batches,id',
            'request_type' => 'required|in:struck_off,terminate',
            'struck_off_days' => 'required_if:request_type,struck_off|nullable|integer|min:1|max:365',
            'reason_category' => 'required|string|max:100',
            'reason' => 'required|string|max:255',
            'evidence_notes' => 'nullable|string|max:3000',
        ]);

        // Security check: Verify student is enrolled in one of teacher's batches
        $isEnrolledInTeacherBatch = Enrollment::where('student_profile_id', $validated['student_profile_id'])
            ->whereIn('batch_id', $batchIds)
            ->exists();

        if (! $isEnrolledInTeacherBatch && ! $user->hasRole('super-admin|principal')) {
            return redirect()->back()->withErrors([
                'student_profile_id' => 'You may only submit disciplinary requests for students enrolled in your assigned batches.',
            ]);
        }

        // Check if there is already a pending request for this student
        $hasPending = StudentStatusRequest::where('student_profile_id', $validated['student_profile_id'])
            ->where('status', 'pending')
            ->exists();

        if ($hasPending) {
            return redirect()->back()->withErrors([
                'student_profile_id' => 'A pending disciplinary request is already under review by the Principal for this student.',
            ]);
        }

        $studentProfile = StudentProfile::with('user')->findOrFail($validated['student_profile_id']);

        StudentStatusRequest::create([
            'student_profile_id' => $validated['student_profile_id'],
            'batch_id' => $validated['batch_id'] ?? null,
            'requested_by' => $user->id,
            'request_type' => $validated['request_type'],
            'struck_off_days' => $validated['request_type'] === 'struck_off' ? $validated['struck_off_days'] : null,
            'reason_category' => $validated['reason_category'],
            'reason' => $validated['reason'],
            'evidence_notes' => $validated['evidence_notes'] ?? null,
            'status' => 'pending',
        ]);

        $studentName = $studentProfile->user?->name ?? 'Student';
        $typeLabel = $validated['request_type'] === 'struck_off' ? 'Struck-off (Temporary Suspension)' : 'Permanent Termination';

        return redirect()->back()->with('success', "Formal {$typeLabel} request for {$studentName} has been submitted to the Principal Office for decision.");
    }
}
