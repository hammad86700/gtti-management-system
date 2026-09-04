<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Student\Models\ApprenticeshipPlacement;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ApprenticeshipRegistryController extends Controller
{
    /**
     * Display the Admin Apprenticeship & OJT Registry Desk.
     */
    public function index(Request $request): Response
    {
        $query = ApprenticeshipPlacement::with([
            'studentProfile.user',
            'enrollment.course.trade.program.department',
            'enrollment.batch',
        ])->latest();

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhere('supervisor_name', 'like', "%{$search}%")
                  ->orWhere('work_location', 'like', "%{$search}%")
                  ->orWhereHas('studentProfile.user', function ($sub) use ($search) {
                      $sub->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                  })
                  ->orWhereHas('studentProfile', function ($sub) use ($search) {
                      $sub->where('cnic', 'like', "%{$search}%");
                  })
                  ->orWhereHas('enrollment', function ($sub) use ($search) {
                      $sub->where('enrollment_number', 'like', "%{$search}%");
                  });
            });
        }

        // Sector filter
        if ($sector = $request->input('sector')) {
            $query->where('industry_sector', $sector);
        }

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('placement_status', $status);
        }

        $placements = $query->paginate(20)->withQueryString();

        // Statistical aggregates
        $allPlacements = ApprenticeshipPlacement::all();
        $stats = [
            'total'          => $allPlacements->count(),
            'active'         => $allPlacements->where('placement_status', 'active')->count(),
            'completed'      => $allPlacements->where('placement_status', 'completed')->count(),
            'avg_stipend'    => round((float) $allPlacements->where('stipend_amount', '>', 0)->avg('stipend_amount')),
            'tevta_verified' => $allPlacements->where('tevta_registered', true)->count(),
        ];

        $sectors = ApprenticeshipPlacement::distinct()->pluck('industry_sector')->filter()->values();

        return Inertia::render('Admin/Apprenticeships/Index', [
            'placements' => $placements,
            'stats'      => $stats,
            'sectors'    => $sectors,
            'filters'    => $request->only(['search', 'sector', 'status']),
        ]);
    }

    /**
     * Export official TEVTA accreditation compliance CSV report.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $fileName = 'TEVTA_Apprenticeship_OJT_Audit_Report_' . date('Y_m_d_His') . '.csv';

        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM for Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // CSV Header Row
            fputcsv($handle, [
                'Sr #',
                'Roll Number',
                'Trainee Name',
                'Father Name',
                'CNIC / Form-B',
                'Phone Number',
                'Trade / Course',
                'Department',
                'Batch / Shift',
                'Employer / Company',
                'Industry Sector',
                'Work Location',
                'Industry Supervisor',
                'Supervisor Contact',
                'Monthly Stipend (PKR)',
                'Start Date',
                'End Date',
                'Placement Status',
                'TEVTA Compliance Status',
            ]);

            $placements = ApprenticeshipPlacement::with([
                'studentProfile.user',
                'enrollment.course.trade.program.department',
                'enrollment.batch',
            ])->orderBy('id', 'desc')->get();

            $index = 1;
            foreach ($placements as $p) {
                $user = $p->studentProfile?->user;
                $profile = $p->studentProfile;
                $enrollment = $p->enrollment;
                $course = $enrollment?->course;

                fputcsv($handle, [
                    $index++,
                    $enrollment?->enrollment_number ?? $enrollment?->roll_number ?? 'N/A',
                    $user?->name ?? 'Trainee',
                    $profile?->father_name ?? 'N/A',
                    $user?->cnic ?? $profile?->cnic ?? 'N/A',
                    $user?->phone ?? $profile?->emergency_contact ?? 'N/A',
                    $course?->name ?? 'N/A',
                    $course?->trade?->program?->department?->name ?? 'N/A',
                    $enrollment?->batch?->name ?? 'N/A',
                    $p->company_name,
                    $p->industry_sector,
                    $p->work_location ?? 'N/A',
                    $p->supervisor_name,
                    $p->supervisor_phone,
                    $p->stipend_amount ? number_format($p->stipend_amount, 2) : '0.00',
                    $p->start_date ? $p->start_date->format('Y-m-d') : 'N/A',
                    $p->end_date ? $p->end_date->format('Y-m-d') : 'Ongoing',
                    strtoupper($p->placement_status),
                    $p->tevta_registered ? 'VERIFIED' : 'PENDING_AUDIT',
                ]);
            }

            fclose($handle);
        }, $fileName, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
        ]);
    }
}
