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
    public function create(): Response
    {
        $user = auth()->user();
        $profile = $user->studentProfile()->with('educations')->first();

        if (!$profile) {
            $profile = \App\Domains\Student\Models\StudentProfile::create([
                'user_id' => $user->id,
                'status' => 'applicant',
            ]);
            $profile->load('educations');
        }

        $campaign = AdmissionCampaign::where('is_active', true)->latest()->first();
        $courses = Course::with([
            'trade.program.department',
            'batches' => function ($q) {
                $q->select('id', 'course_id', 'name', 'session_year', 'shift', 'start_date', 'end_date');
            },
        ])
            ->where('is_active', true)
            ->where('is_published', true)
            ->orderBy('name')
            ->get();

        $existingApplication = Application::where('student_profile_id', $profile->id)
            ->with(['course.trade.program', 'documents', 'feeChallan', 'batch'])
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
        $hasEduTranscript = false;
        if ($request->has('educations') && is_array($request->input('educations'))) {
            foreach ($request->input('educations') as $idx => $edu) {
                if ($request->hasFile("educations.{$idx}.transcript_scan")) {
                    $hasEduTranscript = true;
                    break;
                }
            }
        }

        $academicDocRule = $hasEduTranscript
            ? 'nullable|file|mimes:pdf,jpg,jpeg,png,webp,heic,heif|max:20480'
            : 'required|file|mimes:pdf,jpg,jpeg,png,webp,heic,heif|max:20480';

        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'shift' => 'nullable|string|in:Morning,Evening,morning,evening',
            'batch_id' => 'nullable|exists:batches,id',

            // Biographical Information
            'name' => 'nullable|string|max:255',
            'cnic' => 'nullable|string|max:25',
            'father_name' => 'nullable|string|max:255',
            'guardian_name' => 'nullable|string|max:255',
            'guardian_phone' => 'nullable|string|max:25',
            'dob' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other',
            'domicile_district' => 'nullable|string|max:100',
            'religion' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:1000',
            'permanent_address' => 'nullable|string|max:1000',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:20480',

            // Legacy Academic Marks
            'matric_total_marks' => 'nullable|numeric|min:100|max:1500',
            'matric_obtained_marks' => 'nullable|numeric|min:0|max:1500',
            'intermediate_total_marks' => 'nullable|numeric|min:100|max:1500',
            'intermediate_obtained_marks' => 'nullable|numeric|min:0|max:1500',

            // Multi-tier Dynamic Educational Intake
            'educations' => 'nullable|array',
            'educations.*.degree_level' => 'required_with:educations|in:matric,intermediate,dae,bachelors,diploma_vocational,other',
            'educations.*.degree_title' => 'required_with:educations|string|max:255',
            'educations.*.institute_or_board' => 'required_with:educations|string|max:255',
            'educations.*.passing_year' => 'required_with:educations|integer|min:1970|max:' . (date('Y') + 1),
            'educations.*.roll_number' => 'nullable|string|max:50',
            'educations.*.total_marks' => 'required_with:educations|numeric|min:1',
            'educations.*.obtained_marks' => 'required_with:educations|numeric|min:0',
            'educations.*.grade_or_division' => 'nullable|string|max:50',
            'educations.*.transcript_scan' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp,heic,heif|max:20480',

            // Document Attachments
            'cnic_document' => 'required|file|mimes:pdf,jpg,jpeg,png,webp,heic,heif|max:20480',
            'academic_document' => $academicDocRule,
        ], [
            'course_id.required' => 'Please select your desired vocational course/trade.',
            'course_id.exists' => 'The selected course does not exist in the active intake registry.',
            'cnic_document.required' => 'Please upload or capture a clear photo of your CNIC / B-Form document (Step 3).',
            'cnic_document.file' => 'The CNIC / B-Form document must be a valid uploaded file.',
            'cnic_document.mimes' => 'The CNIC / B-Form document must be an image (JPG, PNG, WEBP) or PDF file.',
            'cnic_document.max' => 'The CNIC / B-Form document exceeds the 20MB limit. Please capture or compress a smaller image.',
            'academic_document.required' => 'Please upload or capture a clear photo of your academic certificate or marksheet document (Step 3).',
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

        // Update candidate name on user if changed
        if (!empty($validated['name']) && $validated['name'] !== $user->name) {
            $user->update(['name' => $validated['name']]);
        }

        // Update CNIC on user if provided
        if (!empty($validated['cnic']) && $validated['cnic'] !== $user->cnic) {
            $user->update(['cnic' => $validated['cnic']]);
        }

        // Synchronize biographical profile details
        $profileUpdates = [];
        if (!empty($validated['father_name'])) {
            $profileUpdates['father_name'] = $validated['father_name'];
        }
        if (!empty($validated['guardian_name'])) {
            $profileUpdates['guardian_name'] = $validated['guardian_name'];
        }
        if (!empty($validated['guardian_phone'])) {
            $profileUpdates['guardian_phone'] = $validated['guardian_phone'];
        }
        if (!empty($validated['dob'])) {
            $profileUpdates['date_of_birth'] = $validated['dob'];
        }
        if (!empty($validated['gender'])) {
            $profileUpdates['gender'] = $validated['gender'];
        }
        if (!empty($validated['domicile_district'])) {
            $profileUpdates['domicile_district'] = $validated['domicile_district'];
        }
        if (!empty($validated['religion'])) {
            $profileUpdates['religion'] = $validated['religion'];
        }
        if (!empty($validated['address'])) {
            $profileUpdates['address'] = $validated['address'];
        }
        if (!empty($validated['permanent_address'])) {
            $profileUpdates['permanent_address'] = $validated['permanent_address'];
        }

        if ($request->hasFile('profile_picture')) {
            $photoPath = $request->file('profile_picture')->store('profile_pictures', 'public');
            $profileUpdates['profile_picture'] = $photoPath;
        }

        // Dynamic educational intake records
        $matricTotal = $validated['matric_total_marks'] ?? $profile->matric_total_marks ?? 1100;
        $matricObtained = $validated['matric_obtained_marks'] ?? $profile->matric_obtained_marks ?? 850;
        $interTotal = $validated['intermediate_total_marks'] ?? $profile->intermediate_total_marks ?? null;
        $interObtained = $validated['intermediate_obtained_marks'] ?? $profile->intermediate_obtained_marks ?? null;
        $matricTranscriptPath = null;

        if (!empty($validated['educations']) && is_array($validated['educations'])) {
            // Refresh educations records for student profile
            $profile->educations()->delete();

            foreach ($validated['educations'] as $idx => $edu) {
                $tot = floatval($edu['total_marks']);
                $obt = floatval($edu['obtained_marks']);
                $pct = $tot > 0 ? round(($obt / $tot) * 100, 2) : 0.00;

                $transcriptScanPath = null;
                if ($request->hasFile("educations.{$idx}.transcript_scan")) {
                    $transcriptScanPath = $request->file("educations.{$idx}.transcript_scan")->store('transcripts', 'public');
                }

                $createdEdu = \App\Domains\Student\Models\StudentEducation::create([
                    'student_profile_id' => $profile->id,
                    'degree_level' => $edu['degree_level'],
                    'degree_title' => $edu['degree_title'],
                    'institute_or_board' => $edu['institute_or_board'],
                    'passing_year' => $edu['passing_year'],
                    'roll_number' => $edu['roll_number'] ?? null,
                    'total_marks' => $tot,
                    'obtained_marks' => $obt,
                    'percentage' => $pct,
                    'grade_or_division' => $edu['grade_or_division'] ?? null,
                    'transcript_scan_path' => $transcriptScanPath,
                ]);

                if ($edu['degree_level'] === 'matric') {
                    $matricTotal = $tot;
                    $matricObtained = $obt;
                    $matricTranscriptPath = $transcriptScanPath;
                } elseif ($edu['degree_level'] === 'intermediate') {
                    $interTotal = $tot;
                    $interObtained = $obt;
                }
            }
        }

        $profileUpdates['matric_total_marks'] = $matricTotal;
        $profileUpdates['matric_obtained_marks'] = $matricObtained;
        $profileUpdates['intermediate_total_marks'] = $interTotal;
        $profileUpdates['intermediate_obtained_marks'] = $interObtained;

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

        $shift = !empty($validated['shift']) ? ucfirst(strtolower($validated['shift'])) : 'Morning';

        // Validate course shift availability
        if (!$course->offersShift($shift)) {
            $offered = $course->offered_shifts ?: 'Both';
            return redirect()->back()->withErrors([
                'shift' => "The course '{$course->name}' is only offered in the {$offered} Shift.",
            ])->with('error', "Invalid Shift: '{$course->name}' is only offered in the {$offered} Shift.");
        }

        $batchId = $validated['batch_id'] ?? null;

        if (!$batchId) {
            $batch = \App\Domains\Organization\Models\Batch::where('course_id', $course->id)
                ->where(function ($q) use ($shift) {
                    $q->where('shift', $shift)
                      ->orWhere('shift', strtolower($shift));
                })->first();

            if (!$batch) {
                $course->ensureShiftBatchesExist();
                $batch = \App\Domains\Organization\Models\Batch::where('course_id', $course->id)
                    ->where('shift', $shift)
                    ->first();
            }

            $batchId = $batch?->id;
        }

        $application = Application::create([
            'admission_campaign_id' => $campaign->id,
            'student_profile_id' => $profile->id,
            'course_id' => $course->id,
            'shift' => $shift,
            'batch_id' => $batchId,
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
        if ($request->hasFile('academic_document')) {
            $academicPath = $request->file('academic_document')->store('private/documents', 'local');
            $application->documents()->create([
                'document_type' => 'academic_certificate',
                'file_path' => $academicPath,
                'status' => 'pending',
            ]);
        } elseif ($matricTranscriptPath) {
            $application->documents()->create([
                'document_type' => 'academic_certificate',
                'file_path' => 'storage/' . $matricTranscriptPath,
                'status' => 'pending',
            ]);
        }

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
