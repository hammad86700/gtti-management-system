<?php

namespace App\Http\Controllers\Student;

use App\Domains\Student\Models\AlumniPlacement;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AlumniController extends Controller
{
    /**
     * Display the student / graduate alumni career placement self-reporting portal.
     */
    public function index(): Response
    {
        $user = auth()->user();
        $profile = $user->studentProfile;

        $graduatedEnrollment = $profile
            ? $profile->enrollments()->where('status', 'graduated')->with(['course', 'batch'])->first()
            : null;

        $activeEnrollment = $profile
            ? $profile->enrollments()->where('status', 'active')->with(['course', 'batch'])->first()
            : null;

        $placement = $profile ? $profile->alumniPlacement : null;

        return Inertia::render('Student/Alumni/Index', [
            'placement' => $placement,
            'isGraduated' => (bool) $graduatedEnrollment,
            'graduatedEnrollment' => $graduatedEnrollment,
            'activeEnrollment' => $activeEnrollment,
        ]);
    }

    /**
     * Save or update the alumni graduate's employment status and job placement details.
     */
    public function store(Request $request): RedirectResponse
    {
        $profile = auth()->user()->studentProfile;

        if (!$profile) {
            return redirect()->back()->with('error', 'Student profile not found.');
        }

        $validated = $request->validate([
            'employment_status' => 'required|in:employed,self_employed,higher_education,unemployed',
            'company_name' => 'nullable|string|max:255',
            'designation' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'monthly_salary' => 'nullable|integer|min:0',
            'placement_date' => 'nullable|date',
        ]);

        $profile->alumniPlacement()->updateOrCreate(
            ['student_profile_id' => $profile->id],
            $validated
        );

        return redirect()->back()->with('success', 'Employment and career placement record updated successfully.');
    }
}
