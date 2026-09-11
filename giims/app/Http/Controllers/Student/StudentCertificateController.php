<?php

namespace App\Http\Controllers\Student;

use App\Domains\Student\Models\Certificate;
use App\Domains\Student\Models\Enrollment;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentCertificateController extends Controller
{
    /**
     * Display the Student Certificate Desk (Digital Certificate & Application Status).
     */
    public function index(): Response
    {
        $user = auth()->user();
        $studentProfile = $user->studentProfile;

        $certificates = $studentProfile
            ? Certificate::with(['course', 'batch', 'approver', 'issuer'])
                ->where('student_profile_id', $studentProfile->id)
                ->orderBy('id', 'desc')
                ->get()
            : collect([]);

        // Enrollments that can be submitted for certificate request
        $enrollments = $studentProfile
            ? Enrollment::with(['course', 'batch'])
                ->where('student_profile_id', $studentProfile->id)
                ->whereIn('status', ['enrolled', 'graduated', 'completed'])
                ->get()
            : collect([]);

        return Inertia::render('Student/Certificates/Index', [
            'certificates' => $certificates,
            'enrollments' => $enrollments,
        ]);
    }

    /**
     * Student submits application for completion certificate at end of course duration.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'enrollment_id' => 'required|exists:enrollments,id',
            'student_notes' => 'nullable|string|max:500',
        ]);

        $user = auth()->user();
        $studentProfile = $user->studentProfile;

        if (!$studentProfile) {
            return redirect()->back()->with('error', 'Student profile record not found.');
        }

        $enrollment = Enrollment::where('student_profile_id', $studentProfile->id)
            ->findOrFail($validated['enrollment_id']);

        // Check if certificate request or certificate already exists
        $existing = Certificate::where('student_profile_id', $studentProfile->id)
            ->where('course_id', $enrollment->course_id)
            ->whereIn('status', ['requested', 'pending_approval', 'approved'])
            ->first();

        if ($existing) {
            return redirect()->back()->with('notice', 'An active certificate application or official certificate already exists for this program.');
        }

        $tempCertNum = 'GTTI-REQ-' . date('Y') . '-' . str_pad((string) rand(100, 999), 4, '0', STR_PAD_LEFT);

        Certificate::create([
            'student_profile_id' => $studentProfile->id,
            'course_id' => $enrollment->course_id,
            'enrollment_id' => $enrollment->id,
            'batch_id' => $enrollment->batch_id,
            'certificate_number' => $tempCertNum,
            'issue_date' => now()->toDateString(),
            'status' => 'requested',
            'request_date' => now()->toDateString(),
            'student_notes' => $validated['student_notes'] ?? null,
            'is_digital_released' => false,
        ]);

        return redirect()->back()->with('success', 'Your certificate issuance application has been submitted to the College Examination & Clerk Desk.');
    }
}
