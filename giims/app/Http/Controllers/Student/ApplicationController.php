<?php

namespace App\Http\Controllers\Student;

use App\Domains\Admissions\Models\AdmissionCampaign;
use App\Domains\Admissions\Models\Application;
use App\Domains\Organization\Models\Course;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
    /**
     * Show the application submission form for prospective applicants.
     */
    public function create(): Response|RedirectResponse
    {
        $profile = auth()->user()->studentProfile;

        if (!$profile || !$profile->father_name || !$profile->date_of_birth || !$profile->domicile_district) {
            return redirect()->route('student.profile.edit')->with('error', 'Please complete your Master Profile before submitting an application.');
        }

        $campaign = AdmissionCampaign::where('is_active', true)->latest()->first();
        $courses = Course::with('trade.program.department')->where('is_active', true)->get();

        return Inertia::render('Student/Application/Create', [
            'campaign' => $campaign,
            'courses' => $courses,
            'profile' => $profile,
        ]);
    }

    /**
     * Store a newly created application with uploaded verification documents.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'cnic_document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'academic_document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $campaign = AdmissionCampaign::where('is_active', true)->latest()->first();

        if (!$campaign) {
            return redirect()->back()->with('error', 'No active admission campaign is currently accepting applications.');
        }

        $profile = auth()->user()->studentProfile;

        if (!$profile) {
            return redirect()->route('student.profile.edit')->with('error', 'Please complete your profile before applying.');
        }

        $appNumber = 'APP-' . date('Y') . '-' . strtoupper(Str::random(6));

        $application = Application::create([
            'admission_campaign_id' => $campaign->id,
            'student_profile_id' => $profile->id,
            'course_id' => $validated['course_id'],
            'application_number' => $appNumber,
            'status' => 'submitted',
        ]);

        // Securely store CNIC / B-Form document
        $cnicPath = $request->file('cnic_document')->store('private/documents', 'local');
        $application->documents()->create([
            'document_type' => 'cnic',
            'file_path' => $cnicPath,
            'status' => 'pending',
        ]);

        // Securely store Academic certificate document
        $academicPath = $request->file('academic_document')->store('private/documents', 'local');
        $application->documents()->create([
            'document_type' => 'academic_certificate',
            'file_path' => $academicPath,
            'status' => 'pending',
        ]);

        return redirect()->route('dashboard')->with('success', 'Application submitted successfully! Your tracking application number is ' . $appNumber);
    }
}
