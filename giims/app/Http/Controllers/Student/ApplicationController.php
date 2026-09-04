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

        $course = Course::findOrFail($validated['course_id']);

        // Enforce maximum intake seat quota
        if ($course->isAdmissionFull()) {
            return redirect()->back()->with('error', "Admissions for '{$course->name}' are currently closed as the maximum capacity limit of {$course->intake_capacity} seats has been filled.");
        }

        $appNumber = 'APP-' . date('Y') . '-' . strtoupper(Str::random(6));
        $isFcfs = $course->isFcfs();

        $application = Application::create([
            'admission_campaign_id' => $campaign->id,
            'student_profile_id' => $profile->id,
            'course_id' => $course->id,
            'application_number' => $appNumber,
            'status' => 'submitted',
            'fee_status' => $isFcfs ? 'unpaid' : 'unpaid',
        ]);

        // If FCFS direct track, immediately generate the official bank challan
        if ($isFcfs) {
            \App\Domains\Finance\Models\FeeChallan::create([
                'student_profile_id' => $profile->id,
                'application_id' => $application->id,
                'challan_number' => 'CHL-' . date('Y') . '-' . strtoupper(Str::random(6)),
                'challan_type' => 'admission',
                'amount' => 2500.00,
                'due_date' => now()->addDays(5)->format('Y-m-d'),
                'status' => 'unpaid',
            ]);
        }

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

        $message = $isFcfs
            ? "Application submitted under First-Come, First-Served direct intake! Your fee challan is generated below. Deposit and upload your receipt immediately to secure your seat."
            : "Application submitted successfully! Your tracking application number is {$appNumber}. Awaiting scrutiny & test schedule.";

        return redirect()->route('dashboard')->with('success', $message);
    }

    /**
     * Upload paid bank fee challan receipt by applicant.
     */
    public function uploadChallanReceipt(Request $request, int $id): RedirectResponse
    {
        $profile = auth()->user()->studentProfile;
        $application = Application::where('student_profile_id', $profile?->id)->findOrFail($id);

        $fileKey = $request->hasFile('challan_receipt') ? 'challan_receipt' : 'receipt_document';

        $validated = $request->validate([
            $fileKey => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'deposit_date' => 'required|date|before_or_equal:today',
            'bank_reference' => 'nullable|string|max:100',
        ]);

        $receiptPath = $request->file($fileKey)->store('challan_receipts', 'public');

        $application->update([
            'challan_receipt_path' => $receiptPath,
            'challan_deposit_date' => $validated['deposit_date'],
            'challan_bank_reference' => $validated['bank_reference'] ?? null,
            'challan_uploaded_at' => now(),
            'fee_status' => 'pending_verification',
        ]);

        return redirect()->back()->with('success', 'Fee challan payment receipt uploaded successfully! The Admission Clerk will verify your bank scroll and confirm your admission seat.');
    }
}
