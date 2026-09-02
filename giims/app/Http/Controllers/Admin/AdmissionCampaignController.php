<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Admissions\Models\AdmissionCampaign;
use App\Domains\Organization\Models\Institute;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdmissionCampaignController extends Controller
{
    /**
     * Display a listing of the admission campaigns.
     */
    public function index(): Response
    {
        $campaigns = AdmissionCampaign::with('institute')
            ->withCount('applications')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Admissions/Campaigns', [
            'campaigns' => $campaigns,
        ]);
    }

    /**
     * Store a newly created admission campaign in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ]);

        $institute = Institute::where('code', 'GTTI-RYK')->first() ?? Institute::firstOrFail();

        AdmissionCampaign::create([
            'institute_id' => $institute->id,
            'name' => $validated['name'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'is_active' => $request->boolean('is_active', false),
        ]);

        return redirect()->back()->with('success', 'Admission Campaign created successfully.');
    }
}
