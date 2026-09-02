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
        $totalStudents = Enrollment::where('status', 'active')->count();
        $pendingApplications = Application::where('status', 'submitted')->count();
        $totalCourses = Course::count();
        $totalBatches = Batch::count();
        $pendingClearances = Clearance::where('overall_status', 'pending')->count();
        $lowStockItems = InventoryItem::whereColumn('quantity_in_stock', '<=', 'min_threshold')->count();
        $openDiscipline = DisciplineRecord::where('status', 'open')->count();

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
            ],
            'recentAnnouncements' => $recentAnnouncements,
        ]);
    }
}
