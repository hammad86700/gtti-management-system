<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Admissions\Models\Application;
use App\Domains\Operations\Models\Announcement;
use App\Domains\Operations\Models\DisciplineRecord;
use App\Domains\Operations\Models\InventoryItem;
use App\Domains\Organization\Models\Batch;
use App\Domains\Organization\Models\Course;
use App\Domains\Student\Models\Clearance;
use App\Domains\Student\Models\Enrollment;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Executive Admin Dashboard with institutional KPIs and active announcements.
     */
    public function index(): Response
    {
        $user = auth()->user();
        if (! $user || ! $user->roles()->whereIn('slug', ['super-admin', 'principal', 'admin', 'administrator'])->exists()) {
            abort(403, 'Unauthorized access to Executive Admin Dashboard.');
        }

        $totalStudents = Enrollment::where('status', 'active')->count();
        $pendingApplications = Application::pendingScrutiny()->count();
        $totalCourses = Course::count();
        $totalBatches = Batch::count();
        $pendingClearances = Clearance::where('overall_status', 'pending')->count();
        $lowStockItems = InventoryItem::whereColumn('quantity_in_stock', '<=', 'min_threshold')->count();
        $openDiscipline = DisciplineRecord::where('status', 'open')->count();

        // Phase 26: Clerical Operations Oversight
        $scrutinizedToday = Application::whereDate('scrutinized_at', today())->count();
        $testsScheduledByClerk = Application::whereNotNull('test_date')->count();
        $recentRejectedApplications = Application::where('status', 'rejected')
            ->with(['studentProfile.user', 'course', 'scrutinizer'])
            ->latest('scrutinized_at')
            ->take(6)
            ->get()
            ->map(function ($app) {
                return [
                    'id' => $app->id,
                    'application_number' => $app->application_number,
                    'candidate_name' => $app->studentProfile?->user?->name ?? 'Candidate',
                    'cnic' => $app->studentProfile?->user?->cnic ?? 'N/A',
                    'course_name' => $app->course?->name ?? 'Course',
                    'clerk_name' => $app->scrutinizer?->name ?? 'Admission Clerk',
                    'clerk_remarks' => $app->clerk_remarks,
                    'scrutinized_at' => $app->scrutinized_at?->diffForHumans() ?? 'Recently',
                ];
            });

        $recentAnnouncements = Announcement::with('creator')
            ->where(function ($q) {
                $q->where('expires_at', '>=', today())
                  ->orWhereNull('expires_at');
            })
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_students' => $totalStudents,
                'pending_applications' => $pendingApplications,
                'total_courses' => $totalCourses,
                'total_batches' => $totalBatches,
                'pending_clearances' => $pendingClearances,
                'low_stock_items' => $lowStockItems,
                'open_discipline' => $openDiscipline,
                'scrutinized_today' => $scrutinizedToday,
                'tests_scheduled_by_clerk' => $testsScheduledByClerk,
            ],
            'recentAnnouncements' => $recentAnnouncements,
            'recentRejectedApplications' => $recentRejectedApplications,
        ]);
    }
}
