<?php

namespace App\Http\Controllers\Clerk;

use App\Domains\Admissions\Models\Application;
use App\Domains\Organization\Models\Course;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationReviewController extends Controller
{
    /**
     * Display the Application Scrutiny & Document Verification Desk.
     */
    public function index(Request $request): Response
    {
        $courseId = $request->input('course_id');
        $status = $request->input('status', 'all');
        $search = $request->input('search');

        $query = Application::with([
            'studentProfile.user',
            'course.trade.program.department',
            'documents',
            'scrutinizer',
            'feeChallan',
        ]);

        if ($courseId) {
            $query->where('course_id', $courseId);
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('application_number', 'like', "%{$search}%")
                  ->orWhereHas('studentProfile.user', function ($sub) use ($search) {
                      $sub->where('name', 'like', "%{$search}%")
                          ->orWhere('cnic', 'like', "%{$search}%");
                  });
            });
        }

        $applications = $query->latest('updated_at')->paginate(25)->withQueryString();

        $courses = Course::withCount([
            'applications as total_count',
            'applications as pending_count' => function ($q) {
                $q->where('status', 'submitted');
            },
        ])->orderBy('name')->get();

        return Inertia::render('Clerk/Applications/Index', [
            'applications' => $applications,
            'courses' => $courses,
            'filters' => [
                'course_id' => $courseId,
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Mark an applicant's dossier as verified or directly admit for FCFS courses.
     */
    public function verify(Request $request, int $id): RedirectResponse
    {
        $application = Application::with('studentProfile.user', 'course')->findOrFail($id);
        $course = $application->course;
        $isFcfs = ($course?->admission_type === 'first_come_first_served') || ($course?->requires_entrance_test === false);

        if ($isFcfs) {
            // Direct admission for FCFS courses
            $application->update([
                'status' => 'selected_for_admission',
                'fee_status' => 'unpaid',
                'scrutinized_by' => auth()->id(),
                'scrutinized_at' => now(),
                'clerk_remarks' => null,
            ]);

            if (function_exists('activity')) {
                activity()
                    ->causedBy(auth()->user())
                    ->performedOn($application)
                    ->log("Admission Clerk approved FCFS applicant '{$application->studentProfile?->user?->name}' directly for admission into '{$course?->name}'");
            }

            return redirect()->back()->with('success', "Application #{$application->application_number} verified and directly selected for admission (FCFS track). Fee challan unlocked.");
        }

        // Merit-based track: mark verified awaiting test schedule, generate roll number
        $rollNumber = $application->entrance_roll_number ?: 'ET-' . date('Y') . '-' . str_pad((string) $application->id, 5, '0', STR_PAD_LEFT);

        $application->update([
            'status' => 'verified',
            'entrance_roll_number' => $rollNumber,
            'scrutinized_by' => auth()->id(),
            'scrutinized_at' => now(),
            'clerk_remarks' => null,
        ]);

        if (function_exists('activity')) {
            activity()
                ->causedBy(auth()->user())
                ->performedOn($application)
                ->log("Admission Clerk verified applicant '{$application->studentProfile?->user?->name}' for {$application->course?->name} with Roll No {$rollNumber}");
        }

        return redirect()->back()->with('success', "Application #{$application->application_number} verified successfully. Entrance Roll No #{$rollNumber} assigned.");
    }

    /**
     * Reject an application with mandatory clerical remarks.
     */
    public function reject(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'clerk_remarks' => 'required|string|min:5|max:1000',
        ]);

        $application = Application::with('studentProfile.user', 'course')->findOrFail($id);

        $application->update([
            'status' => 'rejected',
            'clerk_remarks' => $request->clerk_remarks,
            'scrutinized_by' => auth()->id(),
            'scrutinized_at' => now(),
        ]);

        if (function_exists('activity')) {
            activity()
                ->causedBy(auth()->user())
                ->performedOn($application)
                ->log("Admission Clerk rejected applicant '{$application->studentProfile?->user?->name}' with reason: {$request->clerk_remarks}");
        }

        return redirect()->back()->with('success', "Application #{$application->application_number} has been rejected.");
    }

    /**
     * Download or view detailed dossier for candidate.
     */
    public function downloadDossier(int $id): JsonResponse
    {
        $application = Application::with([
            'studentProfile.user',
            'course.trade.program',
            'documents',
            'scrutinizer',
        ])->findOrFail($id);

        return response()->json([
            'application_number' => $application->application_number,
            'status' => $application->status,
            'candidate' => [
                'name' => $application->studentProfile?->user?->name,
                'cnic' => $application->studentProfile?->user?->cnic,
                'father_name' => $application->studentProfile?->father_name,
                'email' => $application->studentProfile?->user?->email,
                'phone' => $application->studentProfile?->phone_number,
                'address' => $application->studentProfile?->address,
            ],
            'course' => [
                'name' => $application->course?->name,
                'trade' => $application->course?->trade?->name,
                'admission_type' => $application->course?->admission_type,
            ],
            'documents' => $application->documents->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'type' => $doc->document_type,
                    'path' => $doc->file_path,
                    'status' => $doc->status,
                ];
            }),
            'scrutiny' => [
                'scrutinized_by' => $application->scrutinizer?->name,
                'scrutinized_at' => $application->scrutinized_at?->format('Y-m-d H:i'),
                'clerk_remarks' => $application->clerk_remarks,
            ],
            'schedule' => [
                'test_date' => $application->test_date?->format('Y-m-d'),
                'test_time' => $application->test_time,
                'test_venue' => $application->test_venue,
                'clerk_notice' => $application->clerk_notice,
            ],
        ]);
    }

    /**
     * Verify paid bank fee challan receipt, confirm admission, create enrollment, and issue classes commencement notice.
     */
    public function verifyChallanAndConfirm(Request $request, int $id): RedirectResponse
    {
        $application = Application::with(['studentProfile.user', 'course', 'feeChallan'])->findOrFail($id);
        $course = $application->course;

        // 1. Mark application and fee challan as paid & confirmed
        $commencementDate = $course?->classes_start_date 
            ? $course->classes_start_date->format('l, d F Y')
            : 'Monday, 15 September 2026';

        $notice = "Congratulations! Your admission into '{$course?->name}' is officially confirmed. Classes commence on {$commencementDate}. Please report to the designated trade workshop for induction & biometric onboarding.";

        $application->update([
            'status' => 'confirmed',
            'fee_status' => 'paid',
            'classes_commencement_notice' => $notice,
            'scrutinized_by' => auth()->id(),
            'scrutinized_at' => now(),
        ]);

        if ($application->feeChallan) {
            $application->feeChallan->update([
                'status' => 'paid',
                'amount_paid' => $application->feeChallan->amount ?: 2500.00,
                'paid_at' => $application->challan_deposit_date ?: now(),
            ]);
        }

        // 2. Create official Enrollment with is_lms_active = false (Awaiting Teacher first-day orientation activation)
        $batch = \App\Domains\Organization\Models\Batch::where('course_id', $course->id)->first();
        if (!$batch) {
            $batch = \App\Domains\Organization\Models\Batch::create([
                'course_id' => $course->id,
                'name' => $course->name . ' - Session ' . date('Y'),
                'session_year' => date('Y') . '-' . (date('Y') + 1),
                'shift' => 'morning',
            ]);
        }

        $enrollment = \App\Domains\Student\Models\Enrollment::firstOrCreate(
            [
                'student_profile_id' => $application->student_profile_id,
                'course_id' => $course->id,
            ],
            [
                'batch_id' => $batch->id,
                'enrollment_number' => 'GTTI-' . date('Y') . '-' . str_pad((string) rand(1, 9999), 4, '0', STR_PAD_LEFT),
                'enrollment_date' => now()->toDateString(),
                'status' => 'active',
                'is_lms_active' => false,
            ]
        );

        // Assign student role to user
        $studentRole = \App\Domains\Identity\Models\Role::where('slug', 'student')->first();
        if ($studentRole && $application->studentProfile?->user) {
            $application->studentProfile->user->roles()->syncWithoutDetaching([$studentRole->id]);
        }

        // Broadcast institutional announcement to student
        \App\Domains\Operations\Models\Announcement::create([
            'created_by' => auth()->id(),
            'title' => "Official Admission Confirmed: {$course->name}",
            'message' => "Candidate {$application->studentProfile?->user?->name} (App #{$application->application_number}) fee payment verified. {$notice}",
            'target_audience' => 'students',
        ]);

        if (function_exists('activity')) {
            activity()
                ->causedBy(auth()->user())
                ->performedOn($application)
                ->log("Admission Clerk verified fee receipt and confirmed admission for '{$application->studentProfile?->user?->name}' into '{$course->name}'");
        }

        return redirect()->back()->with('success', "Admission officially confirmed for applicant {$application->studentProfile?->user?->name}! Fee marked paid and commencement notice issued.");
    }

    /**
     * Download or view uploaded paid challan receipt file.
     */
    public function downloadReceipt(int $id)
    {
        $application = Application::findOrFail($id);

        if (!$application->challan_receipt_path) {
            return redirect()->back()->with('error', 'Challan payment receipt document not found.');
        }

        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($application->challan_receipt_path)) {
            return response()->file(\Illuminate\Support\Facades\Storage::disk('public')->path($application->challan_receipt_path));
        }

        if (\Illuminate\Support\Facades\Storage::disk('local')->exists($application->challan_receipt_path)) {
            return response()->file(\Illuminate\Support\Facades\Storage::disk('local')->path($application->challan_receipt_path));
        }

        return redirect()->back()->with('error', 'Challan payment receipt document not found.');
    }

    /**
     * Upload an official fee challan voucher document for a student.
     */
    public function uploadCustomChallan(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'challan_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $application = Application::with('studentProfile.user')->findOrFail($id);
        $path = $request->file('challan_file')->store('custom_challans', 'public');

        $updates = [
            'clerk_challan_path' => $path,
            'clerk_challan_uploaded_at' => now(),
        ];

        // When clerk issues an official fee challan, promote candidate to selected status if pending
        if (in_array($application->status, ['submitted', 'verified'])) {
            $updates['status'] = 'selected';
        }

        $application->update($updates);

        return redirect()->back()->with('success', "Official Fee Challan uploaded successfully for candidate '{$application->studentProfile?->user?->name}'! Visible on student portal.");
    }

    /**
     * Download or view the clerk-uploaded custom fee challan.
     */
    public function downloadCustomChallan(int $id)
    {
        $application = Application::findOrFail($id);
        $user = auth()->user();

        // Check authorization: allow admin/clerk/teacher or the candidate themselves
        $isStaff = $user->hasRole(['admin', 'administrator', 'super-admin', 'clerk', 'admission-clerk', 'teacher']);
        $isOwner = $user->studentProfile && $user->studentProfile->id === $application->student_profile_id;

        if (!$isStaff && !$isOwner) {
            abort(403, 'Unauthorized access to fee challan document.');
        }

        if (!$application->clerk_challan_path || !\Illuminate\Support\Facades\Storage::disk('public')->exists($application->clerk_challan_path)) {
            return redirect()->back()->with('error', 'Uploaded fee challan document not found.');
        }

        return response()->file(\Illuminate\Support\Facades\Storage::disk('public')->path($application->clerk_challan_path));
    }
}
