<?php

namespace App\Http\Controllers\Student;

use App\Domains\Student\Models\ApprenticeshipPlacement;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApprenticeshipController extends Controller
{
    /**
     * Display student's apprenticeship & on-the-job training dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $profile = $user->studentProfile;

        $enrollment = $profile?->enrollments()
            ->with(['course.trade.program.department', 'batch'])
            ->latest()
            ->first();

        $placements = ApprenticeshipPlacement::where('student_profile_id', $profile?->id ?? 0)
            ->with('enrollment.course')
            ->latest()
            ->get();

        $industrySectors = [
            'Automotive & Diesel Mechanics',
            'Textile & Garment Manufacturing',
            'Electrical & Power Distribution',
            'Mechanical & CNC Machining',
            'HVACR & Refrigeration',
            'Information Technology & Software',
            'Civil & Building Construction',
            'Chemical & Fertilizer Industries',
            'Solar & Renewable Energy',
            'Other Engineering & Services',
        ];

        return Inertia::render('Student/Apprenticeship/Index', [
            'placements'       => $placements,
            'enrollment'       => $enrollment,
            'industrySectors'  => $industrySectors,
        ]);
    }

    /**
     * Submit an on-the-job training / apprenticeship placement report.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $profile = $user->studentProfile;

        if (!$profile) {
            return redirect()->back()->with('error', 'Student profile required to log apprenticeship.');
        }

        $enrollment = $profile->enrollments()
            ->latest()
            ->first();

        $validated = $request->validate([
            'company_name'     => 'required|string|max:255',
            'industry_sector'  => 'required|string|max:100',
            'supervisor_name'  => 'required|string|max:255',
            'supervisor_phone' => 'required|string|max:50',
            'supervisor_email' => 'nullable|email|max:255',
            'stipend_amount'   => 'nullable|numeric|min:0',
            'start_date'       => 'required|date',
            'end_date'         => 'nullable|date|after_or_equal:start_date',
            'work_location'    => 'required|string|max:255',
            'job_description'  => 'nullable|string|max:1000',
        ]);

        ApprenticeshipPlacement::create([
            'student_profile_id' => $profile->id,
            'enrollment_id'      => $enrollment?->id,
            'company_name'       => $validated['company_name'],
            'industry_sector'    => $validated['industry_sector'],
            'supervisor_name'    => $validated['supervisor_name'],
            'supervisor_phone'   => $validated['supervisor_phone'],
            'supervisor_email'   => $validated['supervisor_email'] ?? null,
            'stipend_amount'     => $validated['stipend_amount'] ?? 0,
            'start_date'         => $validated['start_date'],
            'end_date'           => $validated['end_date'] ?? null,
            'placement_status'   => 'active',
            'tevta_registered'   => false,
            'work_location'      => $validated['work_location'],
            'job_description'    => $validated['job_description'] ?? null,
        ]);

        return redirect()->back()->with(
            'success',
            'Apprenticeship details submitted successfully! Your industry placement is now registered for TEVTA audit verification.'
        );
    }
}
