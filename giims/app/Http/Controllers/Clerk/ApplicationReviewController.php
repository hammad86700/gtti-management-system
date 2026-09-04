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
            'course',
            'documents',
            'scrutinizer',
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

        // Merit-based track: mark verified awaiting test schedule
        $application->update([
            'status' => 'verified',
            'scrutinized_by' => auth()->id(),
            'scrutinized_at' => now(),
            'clerk_remarks' => null,
        ]);

        if (function_exists('activity')) {
            activity()
                ->causedBy(auth()->user())
                ->performedOn($application)
                ->log("Admission Clerk verified applicant '{$application->studentProfile?->user?->name}' for {$application->course?->name}");
        }

        return redirect()->back()->with('success', "Application #{$application->application_number} verified successfully.");
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
}
