<?php

namespace App\Http\Controllers\Student;

use App\Domains\Student\Models\Clearance;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClearanceController extends Controller
{
    /**
     * Display the student's institutional clearance status, checkpoints, and issued certificates.
     */
    public function index(): Response
    {
        $user = auth()->user()->load([
            'studentProfile.enrollments.course.trade.program.department',
            'studentProfile.enrollments.batch',
            'studentProfile.clearances.enrollment.course',
            'studentProfile.certificates.course',
        ]);

        $profile = $user->studentProfile;
        $enrollment = $profile?->enrollments()->latest()->first();
        $clearance = $enrollment ? Clearance::where('enrollment_id', $enrollment->id)->first() : null;
        $certificates = $profile ? $profile->certificates()->with('course')->latest()->get() : [];

        return Inertia::render('Student/Clearance/Index', [
            'enrollment' => $enrollment,
            'clearance' => $clearance,
            'certificates' => $certificates,
        ]);
    }

    /**
     * Submit an institutional clearance request across Accounts, Library, and Workshop wings.
     */
    public function store(Request $request): RedirectResponse
    {
        $profile = auth()->user()->studentProfile;
        if (! $profile) {
            return redirect()->back()->with('error', 'Student profile record not found.');
        }

        $enrollment = $profile->enrollments()->latest()->first();
        if (! $enrollment) {
            return redirect()->back()->with('error', 'No active enrollment found for clearance processing.');
        }

        Clearance::firstOrCreate(
            [
                'student_profile_id' => $profile->id,
                'enrollment_id' => $enrollment->id,
            ],
            [
                'fee_status' => 'pending',
                'library_status' => 'pending',
                'workshop_status' => 'pending',
                'overall_status' => 'pending',
            ]
        );

        return redirect()->back()->with('success', 'Clearance application submitted successfully. Department audits initiated.');
    }
}
