<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Admissions\Models\Application;
use App\Domains\Identity\Models\Role;
use App\Domains\Organization\Models\Batch;
use App\Domains\Student\Models\Enrollment;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EnrollmentController extends Controller
{
    /**
     * Display the student enrollment workbench and active roster.
     */
    public function index(): Response
    {
        $applications = Application::with([
            'studentProfile.user',
            'course.trade.program.department',
        ])
        ->where('status', 'selected')
        ->orderBy('updated_at', 'desc')
        ->get();

        $batches = Batch::with('course')->get();

        $enrollments = Enrollment::with([
            'studentProfile.user',
            'course.trade.program.department',
            'batch',
        ])
        ->orderBy('created_at', 'desc')
        ->get();

        return Inertia::render('Admin/Enrollments/Index', [
            'applications' => $applications,
            'batches' => $batches,
            'enrollments' => $enrollments,
        ]);
    }

    /**
     * Officially enroll a selected candidate into a batch and issue permanent credentials.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'application_id' => 'required|exists:applications,id',
            'batch_id' => 'required|exists:batches,id',
        ]);

        $application = Application::with('studentProfile.user')->findOrFail($validated['application_id']);

        // Generate permanent institute Student Roll / Enrollment ID
        $enrollmentNumber = 'GTTI-' . date('Y') . '-' . str_pad((string) rand(1, 9999), 4, '0', STR_PAD_LEFT);

        // Ensure unique registration number
        while (Enrollment::where('enrollment_number', $enrollmentNumber)->exists()) {
            $enrollmentNumber = 'GTTI-' . date('Y') . '-' . str_pad((string) rand(1, 9999), 4, '0', STR_PAD_LEFT);
        }

        if (empty($application->studentProfile->registration_number)) {
            $application->studentProfile->update([
                'registration_number' => $enrollmentNumber,
            ]);
        }

        // Create official permanent enrollment record
        Enrollment::create([
            'student_profile_id' => $application->student_profile_id,
            'course_id' => $application->course_id,
            'batch_id' => $validated['batch_id'],
            'enrollment_number' => $enrollmentNumber,
            'enrollment_date' => now()->toDateString(),
            'status' => 'active',
        ]);

        // Transition application lifecycle to enrolled
        $application->update([
            'status' => 'enrolled',
        ]);

        // Provision Student RBAC role to master identity
        $studentRole = Role::where('slug', 'student')->first();
        if ($studentRole && $application->studentProfile->user) {
            $application->studentProfile->user->roles()->syncWithoutDetaching([$studentRole->id]);
        }

        $userName = $application->studentProfile->user?->name ?? 'Candidate';

        return redirect()->back()->with('success', "Student {$userName} successfully enrolled into batch. Official Student ID: {$enrollmentNumber}.");
    }
}
