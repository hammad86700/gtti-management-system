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
        $feeStatus = $request->input('fee_status', 'all');
        $shift = $request->input('shift', 'all');
        $search = $request->input('search');

        $query = Application::with([
            'studentProfile.user',
            'studentProfile.educations',
            'course.trade.program.department',
            'batch',
            'documents',
            'scrutinizer',
            'feeChallan',
        ]);

        if ($courseId) {
            $query->where('course_id', $courseId);
        }

        if ($shift && $shift !== 'all') {
            $query->where('shift', ucfirst(strtolower($shift)));
        }

        if ($status && $status !== 'all') {
            if (in_array($status, ['pending', 'submitted'])) {
                $query->pendingScrutiny();
            } elseif (in_array($status, ['admitted', 'confirmed'])) {
                $query->admitted();
            } elseif (in_array($status, ['selected', 'selected_for_admission'])) {
                $query->whereIn('status', ['selected', 'selected_for_admission']);
            } elseif ($status === 'pending_fee') {
                $query->pendingFeeVerification();
            } elseif ($status === 'challan_issued') {
                $query->where(function ($q) {
                    $q->where('status', 'challan_issued')
                      ->orWhereNotNull('clerk_challan_path');
                })->whereNotIn('status', ['admitted', 'confirmed', 'receipt_submitted']);
            } else {
                $query->where('status', $status);
            }
        }

        if ($feeStatus && $feeStatus !== 'all') {
            if ($feeStatus === 'pending_verification') {
                $query->pendingFeeVerification();
            } elseif ($feeStatus === 'paid') {
                $query->where(function ($q) {
                    $q->where('fee_status', 'paid')
                      ->orWhereIn('status', ['admitted', 'confirmed']);
                });
            } elseif ($feeStatus === 'unpaid') {
                $query->where(function ($q) {
                    $q->where('fee_status', 'unpaid')
                      ->orWhereNull('fee_status');
                })->whereNotIn('status', ['admitted', 'confirmed']);
            }
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
                $q->pendingScrutiny();
            },
            'applications as pending_fee_count' => function ($q) {
                $q->pendingFeeVerification();
            },
        ])->orderBy('name')->get();

        $pendingFeeCount = Application::pendingFeeVerification()->count();
        $pendingScrutinyCount = Application::pendingScrutiny()->count();

        $shiftStats = [
            'total' => Application::count(),
            'morning' => Application::where('shift', 'Morning')->count(),
            'evening' => Application::where('shift', 'Evening')->count(),
        ];

        return Inertia::render('Clerk/Applications/Index', [
            'applications' => $applications,
            'courses' => $courses,
            'pendingFeeCount' => $pendingFeeCount,
            'pendingScrutinyCount' => $pendingScrutinyCount,
            'shiftStats' => $shiftStats,
            'filters' => [
                'course_id' => $courseId,
                'status' => $status,
                'fee_status' => $feeStatus,
                'shift' => $shift,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Mark an applicant's dossier as verified or directly admit for FCFS courses.
     */
    public function verify(Request $request, int $id): RedirectResponse
    {
        $application = Application::with('studentProfile.user', 'course', 'feeChallan')->findOrFail($id);
        $course = $application->course;
        $isFcfs = ($course?->admission_type === 'first_come_first_served') || ($course?->requires_entrance_test === false);

        if ($isFcfs) {
            // FCFS Track: verification immediately transitions to 'challan_issued'
            $application->update([
                'status' => 'challan_issued',
                'fee_status' => 'unpaid',
                'clerk_notice' => 'Application verified. Please deposit fee challan immediately to secure your seat.',
                'scrutinized_by' => auth()->id(),
                'scrutinized_at' => now(),
                'clerk_remarks' => null,
            ]);

            // Ensure FeeChallan exists
            if (!$application->feeChallan) {
                \App\Domains\Finance\Models\FeeChallan::create([
                    'student_profile_id' => $application->student_profile_id,
                    'application_id' => $application->id,
                    'challan_number' => 'CHL-' . date('Y') . '-' . strtoupper(\Illuminate\Support\Str::random(6)),
                    'challan_type' => 'admission',
                    'amount' => 2500.00,
                    'due_date' => now()->addDays(5)->format('Y-m-d'),
                    'payment_deadline' => now()->addDays(5)->format('Y-m-d'),
                    'status' => 'unpaid',
                    'verification_status' => 'unpaid',
                ]);
            }

            if (function_exists('activity')) {
                activity()
                    ->causedBy(auth()->user())
                    ->performedOn($application)
                    ->log("Application verified. Please deposit fee challan immediately to secure your seat.");
            }

            return redirect()->back()->with('success', "Application #{$application->application_number} verified and Fee Challan issued (FCFS track).");
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
     * Issue Fee Challan with payment deadline selectively to a merit-selected candidate.
     */
    public function issueSelectiveChallan(Request $request, int $id): RedirectResponse
    {
        $application = Application::with(['studentProfile.user', 'course', 'feeChallan'])->findOrFail($id);

        $deadline = $request->input('payment_deadline') ?: now()->addDays(5)->toDateString();

        $application->update([
            'status' => 'challan_issued',
            'fee_status' => 'unpaid',
            'clerk_notice' => "Congratulations! You have been selected on open merit. Please deposit your fee challan before {$deadline} to secure your seat.",
            'scrutinized_by' => auth()->id(),
            'scrutinized_at' => now(),
        ]);

        if ($application->feeChallan) {
            $application->feeChallan->update([
                'status' => 'unpaid',
                'verification_status' => 'unpaid',
                'due_date' => $deadline,
                'payment_deadline' => $deadline,
            ]);
        } else {
            \App\Domains\Finance\Models\FeeChallan::create([
                'student_profile_id' => $application->student_profile_id,
                'application_id' => $application->id,
                'challan_number' => 'CHL-' . date('Y') . '-' . strtoupper(\Illuminate\Support\Str::random(6)),
                'challan_type' => 'admission',
                'amount' => 2500.00,
                'due_date' => $deadline,
                'payment_deadline' => $deadline,
                'status' => 'unpaid',
                'verification_status' => 'unpaid',
            ]);
        }

        if (function_exists('activity')) {
            activity()
                ->causedBy(auth()->user())
                ->performedOn($application)
                ->log("Clerk issued selective fee challan to candidate '{$application->studentProfile?->user?->name}' with deadline {$deadline}");
        }

        return redirect()->back()->with('success', "Fee Challan issued to candidate {$application->studentProfile?->user?->name} with payment deadline: {$deadline}.");
    }

    /**
     * Batch issue fee challans to all selected candidates of a course.
     */
    public function batchIssueChallans(Request $request, int $courseId): RedirectResponse
    {
        $course = Course::findOrFail($courseId);
        $deadline = $request->input('payment_deadline') ?: now()->addDays(5)->toDateString();

        $selectedApps = Application::where('course_id', $course->id)
            ->where(function ($q) {
                $q->whereIn('status', ['selected', 'selected_for_admission', 'verified'])
                  ->orWhereHas('entranceTestAttempt', function ($sub) {
                      $sub->where('selection_status', 'selected');
                  });
            })
            ->get();

        $count = 0;
        foreach ($selectedApps as $app) {
            $app->update([
                'status' => 'challan_issued',
                'fee_status' => 'unpaid',
                'clerk_notice' => "Congratulations! You have been selected on open merit. Please deposit your fee challan before {$deadline} to secure your seat.",
                'scrutinized_by' => auth()->id(),
                'scrutinized_at' => now(),
            ]);

            if ($app->feeChallan) {
                $app->feeChallan->update([
                    'status' => 'unpaid',
                    'verification_status' => 'unpaid',
                    'due_date' => $deadline,
                    'payment_deadline' => $deadline,
                ]);
            } else {
                \App\Domains\Finance\Models\FeeChallan::create([
                    'student_profile_id' => $app->student_profile_id,
                    'application_id' => $app->id,
                    'challan_number' => 'CHL-' . date('Y') . '-' . strtoupper(\Illuminate\Support\Str::random(6)),
                    'challan_type' => 'admission',
                    'amount' => 2500.00,
                    'due_date' => $deadline,
                    'payment_deadline' => $deadline,
                    'status' => 'unpaid',
                    'verification_status' => 'unpaid',
                ]);
            }
            $count++;
        }

        return redirect()->back()->with('success', "Batch issued fee challans to {$count} selected candidate(s) of '{$course->name}' with deadline {$deadline}.");
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
     * Switch an applicant's shift (Morning <-> Evening) and dynamically reassign target batch.
     */
    public function switchShift(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'shift' => 'required|in:Morning,Evening,morning,evening',
        ]);

        $application = Application::with(['studentProfile.user', 'course'])->findOrFail($id);
        $course = $application->course;
        $newShift = ucfirst(strtolower($request->shift));

        // Ensure target shift batch exists
        $batch = \App\Domains\Organization\Models\Batch::where('course_id', $course->id)
            ->where('shift', $newShift)
            ->first();

        if (!$batch) {
            $course->ensureShiftBatchesExist();
            $batch = \App\Domains\Organization\Models\Batch::where('course_id', $course->id)
                ->where('shift', $newShift)
                ->first();
        }

        $application->update([
            'shift' => $newShift,
            'batch_id' => $batch?->id,
        ]);

        // If candidate already has an active enrollment, update enrollment's batch as well
        if ($application->student_profile_id) {
            \App\Domains\Student\Models\Enrollment::where('student_profile_id', $application->student_profile_id)
                ->where('course_id', $course->id)
                ->update(['batch_id' => $batch?->id]);
        }

        if (function_exists('activity')) {
            activity()
                ->causedBy(auth()->user())
                ->performedOn($application)
                ->log("Clerk updated candidate '{$application->studentProfile?->user?->name}' shift preference to {$newShift}");
        }

        return redirect()->back()->with('success', "Candidate {$application->studentProfile?->user?->name}'s shift switched to {$newShift} successfully.");
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

        // 1. Mark application and fee challan as paid & admitted
        $commencementDate = $course?->classes_start_date 
            ? $course->classes_start_date->format('l, d F Y')
            : 'Monday, 15 September 2026';

        $notice = "Congratulations! Your admission into '{$course?->name}' is officially confirmed. Classes commence on {$commencementDate}. Please report to the designated trade workshop for induction & biometric onboarding.";

        $permanentRollNo = $application->generateInstitutionalRollNumber();

        $application->update([
            'status' => 'admitted',
            'fee_status' => 'paid',
            'institutional_roll_number' => $permanentRollNo,
            'admission_confirmed_at' => now(),
            'classes_commencement_notice' => $notice,
            'scrutinized_by' => auth()->id(),
            'scrutinized_at' => now(),
        ]);

        if ($application->feeChallan) {
            $application->feeChallan->update([
                'status' => 'paid',
                'verification_status' => 'verified',
                'amount_paid' => $application->feeChallan->amount ?: 2500.00,
                'paid_at' => $application->challan_deposit_date ?: now(),
            ]);
        }

        // 2. Create official Enrollment with is_lms_active = true (Unlocks full LMS cockpit)
        $appShift = ucfirst(strtolower($application->shift ?? 'Morning'));
        $batch = null;
        if ($application->batch_id) {
            $batch = \App\Domains\Organization\Models\Batch::find($application->batch_id);
        }
        if (!$batch) {
            $batch = \App\Domains\Organization\Models\Batch::where('course_id', $course->id)
                ->where(function ($q) use ($appShift) {
                    $q->where('shift', $appShift)
                      ->orWhere('shift', strtolower($appShift));
                })->first();
        }
        if (!$batch) {
            $batch = \App\Domains\Organization\Models\Batch::where('course_id', $course->id)->first();
        }
        if (!$batch) {
            $batch = \App\Domains\Organization\Models\Batch::create([
                'course_id' => $course->id,
                'name' => $course->name . ' - ' . $appShift . ' Batch',
                'session_year' => date('Y') . '-' . (date('Y') + 1),
                'shift' => $appShift,
            ]);
        }

        $enrollment = \App\Domains\Student\Models\Enrollment::firstOrCreate(
            [
                'student_profile_id' => $application->student_profile_id,
                'course_id' => $course->id,
            ],
            [
                'batch_id' => $batch->id,
                'enrollment_number' => $permanentRollNo,
                'enrollment_date' => now()->toDateString(),
                'status' => 'active',
                'is_lms_active' => true,
            ]
        );

        $enrollment->update([
            'status' => 'active',
            'is_lms_active' => true,
            'enrollment_number' => $permanentRollNo,
        ]);

        // Enforce capacity: if confirmed students >= course capacity, automatically lock admissions
        $confirmedCount = Application::where('course_id', $course->id)
            ->whereIn('status', ['admitted', 'confirmed'])
            ->count();
        $capacity = $course->capacity ?: ($course->intake_capacity ?: 25);
        if ($confirmedCount >= $capacity) {
            $course->update(['is_admission_open' => false]);
        }

        // Assign student role to user
        $studentRole = \App\Domains\Identity\Models\Role::where('slug', 'student')->first();
        if ($studentRole && $application->studentProfile?->user) {
            $application->studentProfile->user->roles()->syncWithoutDetaching([$studentRole->id]);
        }

        // Broadcast institutional announcement to student
        \App\Domains\Operations\Models\Announcement::create([
            'created_by' => auth()->id(),
            'title' => "Official Admission Confirmed: {$course->name}",
            'message' => "Candidate {$application->studentProfile?->user?->name} (App #{$application->application_number}) fee payment verified. Permanent Roll No: {$permanentRollNo}. {$notice}",
            'target_audience' => 'students',
        ]);

        if (function_exists('activity')) {
            activity()
                ->causedBy(auth()->user())
                ->performedOn($application)
                ->log("Admission Clerk verified fee receipt and confirmed admission for '{$application->studentProfile?->user?->name}' into '{$course->name}' with Permanent Roll #{$permanentRollNo}");
        }

        return redirect()->back()->with('success', "Admission officially confirmed for applicant {$application->studentProfile?->user?->name}! Permanent Roll #{$permanentRollNo} assigned and LMS access activated.");
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
