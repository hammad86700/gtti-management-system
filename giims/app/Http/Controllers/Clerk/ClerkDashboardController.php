<?php

namespace App\Http\Controllers\Clerk;

use App\Domains\Admissions\Models\Application;
use App\Domains\Organization\Models\Course;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClerkDashboardController extends Controller
{
    /**
     * Display the Admission Clerk Operational Dashboard.
     */
    public function index(): Response
    {
        $totalApplications = Application::count();
        $pendingScrutiny = Application::where('status', 'submitted')->count();
        $verifiedApplications = Application::where('status', 'verified')->count();
        $rejectedApplications = Application::where('status', 'rejected')->count();
        $scheduledTestsCount = Application::whereNotNull('test_date')->count();
        $coursesCount = Course::count();

        // Applications scrutinized today
        $scrutinizedToday = Application::whereDate('scrutinized_at', today())->count();

        // Recent applications awaiting scrutiny or recently updated
        $recentApplications = Application::with(['studentProfile.user', 'course'])
            ->latest('updated_at')
            ->take(10)
            ->get()
            ->map(function ($app) {
                return [
                    'id' => $app->id,
                    'application_number' => $app->application_number,
                    'candidate_name' => $app->studentProfile?->user?->name ?? 'Candidate',
                    'cnic' => $app->studentProfile?->user?->cnic ?? 'N/A',
                    'course_name' => $app->course?->name ?? 'Course',
                    'status' => $app->status,
                    'test_date' => $app->test_date?->format('Y-m-d'),
                    'test_venue' => $app->test_venue,
                    'clerk_remarks' => $app->clerk_remarks,
                    'created_at' => $app->created_at->diffForHumans(),
                ];
            });

        // Courses with applicant counts
        $coursesSummary = Course::withCount([
            'applications as total_applicants',
            'applications as pending_applicants' => function ($q) {
                $q->where('status', 'submitted');
            },
            'applications as verified_applicants' => function ($q) {
                $q->where('status', 'verified');
            },
            'applications as scheduled_applicants' => function ($q) {
                $q->whereNotNull('test_date');
            },
        ])->get();

        return Inertia::render('Clerk/Dashboard', [
            'stats' => [
                'total_applications' => $totalApplications,
                'pending_scrutiny' => $pendingScrutiny,
                'verified_applications' => $verifiedApplications,
                'rejected_applications' => $rejectedApplications,
                'scheduled_tests' => $scheduledTestsCount,
                'courses_count' => $coursesCount,
                'scrutinized_today' => $scrutinizedToday,
            ],
            'recentApplications' => $recentApplications,
            'coursesSummary' => $coursesSummary,
        ]);
    }
}
