<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Admissions\Models\Application;
use App\Domains\Operations\Models\InventoryItem;
use App\Domains\Student\Models\AlumniPlacement;
use App\Domains\Student\Models\Enrollment;
use App\Http\Controllers\Controller;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    /**
     * Display the centralized Reports Hub and TEVTA data export center.
     */
    public function index(): Response
    {
        $counts = [
            'active_students' => Enrollment::where('status', 'active')->count(),
            'total_applications' => Application::count(),
            'inventory_items' => InventoryItem::count(),
            'alumni_placements' => AlumniPlacement::count(),
        ];

        return Inertia::render('Admin/Reports/Index', [
            'counts' => $counts,
        ]);
    }

    /**
     * Export enrolled students roster for TEVTA compliance.
     */
    public function exportStudents(): StreamedResponse
    {
        $enrollments = Enrollment::with([
                'studentProfile.user',
                'course',
                'batch',
            ])
            ->where('status', 'active')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="gtti_active_students_report_' . date('Y_m_d') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($enrollments) {
            $handle = fopen('php://output', 'w');
            fputs($handle, "\xEF\xBB\xBF"); // UTF-8 BOM for Excel compatibility

            fputcsv($handle, [
                'Enrollment No',
                'Student Name',
                'Father Name',
                'CNIC / B-Form',
                'Contact Phone',
                'Course / Trade',
                'Batch Shift',
                'Enrollment Date',
                'Status',
            ]);

            foreach ($enrollments as $enr) {
                fputcsv($handle, [
                    $enr->enrollment_number ?? 'N/A',
                    $enr->studentProfile->user->name ?? 'N/A',
                    $enr->studentProfile->father_name ?? 'N/A',
                    $enr->studentProfile->cnic ?? 'N/A',
                    $enr->studentProfile->phone ?? 'N/A',
                    $enr->course->name ?? 'N/A',
                    $enr->batch->name ?? 'N/A',
                    $enr->enrollment_date ?? 'N/A',
                    ucfirst($enr->status),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Export all admission applications for intake audit.
     */
    public function exportApplications(): StreamedResponse
    {
        $applications = Application::with([
                'studentProfile.user',
                'course',
                'admissionCampaign',
            ])
            ->latest()
            ->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="gtti_admissions_applications_' . date('Y_m_d') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($applications) {
            $handle = fopen('php://output', 'w');
            fputs($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'Application ID',
                'Applicant Name',
                'Father Name',
                'CNIC',
                'Phone',
                'Course Trade',
                'Admission Campaign',
                'Status',
                'Submission Date',
            ]);

            foreach ($applications as $app) {
                fputcsv($handle, [
                    $app->application_number ?? ('APP-' . str_pad($app->id, 5, '0', STR_PAD_LEFT)),
                    $app->studentProfile->user->name ?? 'N/A',
                    $app->studentProfile->father_name ?? 'N/A',
                    $app->studentProfile->cnic ?? 'N/A',
                    $app->studentProfile->phone ?? 'N/A',
                    $app->course->name ?? 'N/A',
                    $app->admissionCampaign->title ?? 'N/A',
                    ucfirst($app->status),
                    $app->created_at->format('Y-m-d'),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Export workshop store inventory & asset registers.
     */
    public function exportInventory(): StreamedResponse
    {
        $items = InventoryItem::latest()->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="gtti_workshop_inventory_' . date('Y_m_d') . '.csv"',
        ];

        return response()->stream(function () use ($items) {
            $handle = fopen('php://output', 'w');
            fputs($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'SKU',
                'Item Name',
                'Category',
                'Quantity In Stock',
                'Unit of Measure',
                'Min Threshold',
                'Stock Status',
            ]);

            foreach ($items as $item) {
                $status = $item->quantity_in_stock <= $item->min_threshold ? 'Low Stock' : 'Adequate';
                fputcsv($handle, [
                    $item->sku ?? 'N/A',
                    $item->name,
                    ucfirst(str_replace('_', ' ', $item->category)),
                    $item->quantity_in_stock,
                    $item->unit,
                    $item->min_threshold,
                    $status,
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Export alumni graduate employment and career tracking data.
     */
    public function exportAlumni(): StreamedResponse
    {
        $placements = AlumniPlacement::with([
                'studentProfile.user',
                'studentProfile.enrollments.course',
            ])
            ->latest()
            ->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="gtti_alumni_placements_' . date('Y_m_d') . '.csv"',
        ];

        return response()->stream(function () use ($placements) {
            $handle = fopen('php://output', 'w');
            fputs($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'Alumnus Name',
                'CNIC',
                'Graduated Trade Course',
                'Employment Status',
                'Organization / University',
                'Designation / Degree',
                'City / Location',
                'Monthly Salary (PKR)',
                'Placement Date',
            ]);

            foreach ($placements as $p) {
                $course = $p->studentProfile?->enrollments?->first()?->course?->name ?? 'Vocational Program';
                fputcsv($handle, [
                    $p->studentProfile->user->name ?? 'N/A',
                    $p->studentProfile->cnic ?? 'N/A',
                    $course,
                    ucfirst(str_replace('_', ' ', $p->employment_status)),
                    $p->company_name ?? 'N/A',
                    $p->designation ?? 'N/A',
                    $p->location ?? 'N/A',
                    $p->monthly_salary ? ('Rs. ' . number_format($p->monthly_salary)) : 'N/A',
                    $p->placement_date ?? 'N/A',
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
