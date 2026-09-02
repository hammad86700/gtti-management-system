<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Student\Models\AlumniPlacement;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AlumniController extends Controller
{
    /**
     * Display alumni graduate career placements, employment tracking, and institutional statistics.
     */
    public function index(): Response
    {
        $placements = AlumniPlacement::with([
                'studentProfile.user',
                'studentProfile.enrollments' => function ($query) {
                    $query->with(['course', 'batch']);
                },
            ])
            ->latest()
            ->get();

        $totalReported = $placements->count();
        $employed = $placements->where('employment_status', 'employed')->count();
        $selfEmployed = $placements->where('employment_status', 'self_employed')->count();
        $higherEducation = $placements->where('employment_status', 'higher_education')->count();
        $unemployed = $placements->where('employment_status', 'unemployed')->count();
        $totalWorking = $employed + $selfEmployed;

        $employmentRate = $totalReported > 0
            ? round(($totalWorking / $totalReported) * 100, 1)
            : 0;

        $stats = [
            'total_reported' => $totalReported,
            'employed' => $employed,
            'self_employed' => $selfEmployed,
            'total_working' => $totalWorking,
            'higher_education' => $higherEducation,
            'unemployed' => $unemployed,
            'employment_rate' => $employmentRate,
        ];

        return Inertia::render('Admin/Alumni/Index', [
            'placements' => $placements,
            'stats' => $stats,
        ]);
    }
}
