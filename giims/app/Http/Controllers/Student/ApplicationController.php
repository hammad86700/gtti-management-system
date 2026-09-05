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

        // Enforce maximum intake seat quota and admission open state
        if (!$course->is_admission_open || $course->isAdmissionFull()) {
            return redirect()->back()->with('error', "Admissions for '{$course->name}' are currently closed as the seat quota has been filled (Quota Full / Admissions Closed).");
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
            'status' => 'pending',
            'fee_status' => 'unpaid',
            'total_marks' => $matricTotal,
            'obtained_marks' => $matricObtained,
            'matric_total_marks' => $matricTotal,
            'matric_obtained_marks' => $matricObtained,
            'intermediate_total_marks' => $interTotal,
            'intermediate_obtained_marks' => $interObtained,
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

        $message = $isFcfs
            ? "Application submitted under First-Come, First-Served direct intake! Your application is under document scrutiny. Once verified by the Admission Clerk, your fee challan will be unlocked."
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

        $file = $request->file('challan_receipt') ?? $request->file('receipt_document');

        if (!$file) {
            return redirect()->back()->withErrors([
                'challan_receipt' => 'Please select and upload a clear photo or PDF file of your deposited fee challan receipt.',
            ]);
        }

        $request->validate([
            'challan_receipt' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp,heic,heif|max:20480',
            'receipt_document' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp,heic,heif|max:20480',
            'deposit_date' => 'nullable|date',
            'bank_reference' => 'nullable|string|max:100',
        ], [
            'challan_receipt.mimes' => 'The fee challan receipt must be an image (JPG, PNG, WEBP) or PDF file.',
            'challan_receipt.max' => 'The fee challan receipt file must not exceed 20MB.',
            'receipt_document.mimes' => 'The fee challan receipt must be an image (JPG, PNG, WEBP) or PDF file.',
            'receipt_document.max' => 'The fee challan receipt file must not exceed 20MB.',
        ]);

        $receiptPath = $file->store('challan_receipts', 'public');
        $depositDate = $request->input('deposit_date') ?: now()->toDateString();
        $bankRef = $request->input('bank_reference') ?: 'Submitted at Bank';

        $application->update([
            'status' => 'receipt_submitted',
            'challan_receipt_path' => $receiptPath,
            'challan_deposit_date' => $depositDate,
            'challan_bank_reference' => $bankRef,
            'challan_uploaded_at' => now(),
            'fee_status' => 'pending_verification',
        ]);

        if ($application->feeChallan) {
            $application->feeChallan->update([
                'receipt_image_path' => $receiptPath,
                'verification_status' => 'under_review',
                'submission_notes' => $bankRef,
            ]);
        }

        return redirect()->back()->with('success', 'Challan receipt submitted. Please bring the original stamped receipt to the Student Section for physical verification.');
    }
}
