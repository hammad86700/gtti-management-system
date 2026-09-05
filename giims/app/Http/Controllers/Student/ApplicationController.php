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
        $user = auth()->user();
        $profile = $user->studentProfile;

        if (!$profile) {
            $profile = \App\Domains\Student\Models\StudentProfile::create([
                'user_id' => $user->id,
                'status' => 'applicant',
            ]);
        }

        $campaign = AdmissionCampaign::where('is_active', true)->latest()->first();
        $courses = Course::with('trade.program.department')
            ->where('is_active', true)
            ->where('is_published', true)
            ->orderBy('name')
            ->get();

        $existingApplication = Application::where('student_profile_id', $profile->id)
            ->with(['course.trade.program', 'documents', 'feeChallan'])
            ->latest()
            ->first();

        return Inertia::render('Student/Application/Create', [
            'campaign' => $campaign,
            'courses' => $courses,
            'profile' => $profile,
            'user' => $user,
            'existingApplication' => $existingApplication,
        ]);
    }

    /**
     * Store a newly created application with uploaded verification documents.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'cnic' => 'nullable|string|max:25',
            'father_name' => 'nullable|string|max:255',
            'matric_total_marks' => 'nullable|integer|min:100|max:1500',
            'matric_obtained_marks' => 'nullable|integer|min:0|max:1500',
            'intermediate_total_marks' => 'nullable|integer|min:100|max:1500',
            'intermediate_obtained_marks' => 'nullable|integer|min:0|max:1500',
            'cnic_document' => 'required|file|mimes:pdf,jpg,jpeg,png,webp,heic,heif|max:20480',
            'academic_document' => 'required|file|mimes:pdf,jpg,jpeg,png,webp,heic,heif|max:20480',
        ], [
            'course_id.required' => 'Please select your desired vocational course/trade.',
            'course_id.exists' => 'The selected course does not exist in the active intake registry.',
            'cnic_document.required' => 'Please upload or capture a clear photo of your CNIC / B-Form document (Step 3).',
            'cnic_document.file' => 'The CNIC / B-Form document must be a valid uploaded file.',
            'cnic_document.mimes' => 'The CNIC / B-Form document must be an image (JPG, PNG, WEBP) or PDF file.',
            'cnic_document.max' => 'The CNIC / B-Form document exceeds the 20MB limit. Please capture or compress a smaller image.',
            'academic_document.required' => 'Please upload or capture a clear photo of your Matric / Middle academic certificate (Step 3).',
            'academic_document.file' => 'The academic certificate document must be a valid uploaded file.',
            'academic_document.mimes' => 'The academic certificate document must be an image (JPG, PNG, WEBP) or PDF file.',
            'academic_document.max' => 'The academic certificate document exceeds the 20MB limit. Please capture or compress a smaller image.',
            'matric_obtained_marks.min' => 'Matric obtained marks cannot be negative.',
            'matric_obtained_marks.max' => 'Matric obtained marks cannot exceed 1500.',
        ]);

        $campaign = AdmissionCampaign::where('is_active', true)->latest()->first();

        if (!$campaign) {
            return redirect()->back()->with('error', 'No active admission campaign is currently accepting applications.');
        }

        $user = auth()->user();
        $profile = $user->studentProfile;

        if (!$profile) {
            $profile = \App\Domains\Student\Models\StudentProfile::create([
                'user_id' => $user->id,
                'status' => 'applicant',
            ]);
        }

        // Update CNIC on user if provided
        if (!empty($validated['cnic']) && $validated['cnic'] !== $user->cnic) {
            $user->update(['cnic' => $validated['cnic']]);
        }

        // Synchronize profile details
        $profileUpdates = [];
        if (!empty($validated['father_name'])) {
            $profileUpdates['father_name'] = $validated['father_name'];
        }
        if (isset($validated['matric_total_marks'])) {
            $profileUpdates['matric_total_marks'] = $validated['matric_total_marks'];
        }
        if (isset($validated['matric_obtained_marks'])) {
            $profileUpdates['matric_obtained_marks'] = $validated['matric_obtained_marks'];
        }
        if (isset($validated['intermediate_total_marks'])) {
            $profileUpdates['intermediate_total_marks'] = $validated['intermediate_total_marks'];
        }
        if (isset($validated['intermediate_obtained_marks'])) {
            $profileUpdates['intermediate_obtained_marks'] = $validated['intermediate_obtained_marks'];
        }

        if (!empty($profileUpdates)) {
            $profile->update($profileUpdates);
        }

        $course = Course::findOrFail($validated['course_id']);

        // Enforce maximum intake seat quota
        if ($course->isAdmissionFull()) {
            return redirect()->back()->with('error', "Admissions for '{$course->name}' are currently closed as the maximum capacity limit of {$course->intake_capacity} seats has been filled.");
        }

        $appNumber = 'APP-' . date('Y') . '-' . strtoupper(Str::random(6));
        $isFcfs = $course->isFcfs();

        $matricTotal = $validated['matric_total_marks'] ?? $profile->matric_total_marks ?? 1100;
        $matricObtained = $validated['matric_obtained_marks'] ?? $profile->matric_obtained_marks ?? 850;
        $interTotal = $validated['intermediate_total_marks'] ?? $profile->intermediate_total_marks ?? null;
        $interObtained = $validated['intermediate_obtained_marks'] ?? $profile->intermediate_obtained_marks ?? null;

        $application = Application::create([
            'admission_campaign_id' => $campaign->id,
            'student_profile_id' => $profile->id,
            'course_id' => $course->id,
            'application_number' => $appNumber,
            'status' => 'submitted',
            'fee_status' => 'unpaid',
            'total_marks' => $matricTotal,
            'obtained_marks' => $matricObtained,
            'matric_total_marks' => $matricTotal,
            'matric_obtained_marks' => $matricObtained,
            'intermediate_total_marks' => $interTotal,
            'intermediate_obtained_marks' => $interObtained,
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

        return redirect('/dashboard')->with('success', $message);
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
            $fileKey => 'required|file|mimes:pdf,jpg,jpeg,png,webp,heic,heif|max:20480',
            'deposit_date' => 'required|date|before_or_equal:today',
            'bank_reference' => 'nullable|string|max:100',
        ], [
            "{$fileKey}.required" => 'Please upload or capture a clear photo/receipt of your deposited fee challan.',
            "{$fileKey}.mimes" => 'The fee challan receipt must be an image (JPG, PNG, WEBP) or PDF file.',
            "{$fileKey}.max" => 'The fee challan receipt file must not exceed 20MB.',
            'deposit_date.required' => 'Please provide the fee deposit date as stamped on the bank counter receipt.',
            'deposit_date.before_or_equal' => 'The deposit date cannot be a future date.',
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
