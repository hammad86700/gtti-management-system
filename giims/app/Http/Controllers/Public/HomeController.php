<?php

namespace App\Http\Controllers\Public;

use App\Domains\Admissions\Models\AdmissionCampaign;
use App\Domains\Organization\Models\Department;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the public landing page with active campaigns and department courses.
     */
    public function index(): Response
    {
        $activeCampaign = AdmissionCampaign::where('is_active', true)->latest()->first();

        $departments = Department::where('is_active', true)
            ->with(['programs.trades.courses'])
            ->get();

        return Inertia::render('Public/Home', [
            'activeCampaign' => $activeCampaign,
            'departments' => $departments,
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }
}
