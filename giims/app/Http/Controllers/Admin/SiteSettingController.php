<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Operations\Models\SiteSetting;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SiteSettingController extends Controller
{
    /**
     * Display the dynamic system settings management console.
     */
    public function index(): Response
    {
        $settings = SiteSetting::allAsKeyValue();

        return Inertia::render("Admin/Settings/Index", [
            "settings" => $settings,
        ]);
    }

    /**
     * Update dynamic institutional settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            "institute_name" => "required|string|max:255",
            "institute_short_name" => "required|string|max:50",
            "tagline" => "nullable|string|max:255",
            "phone" => "nullable|string|max:50",
            "email" => "nullable|email|max:100",
            "address" => "nullable|string|max:500",
            "accreditation_text" => "nullable|string|max:255",
            "helpline" => "nullable|string|max:100",
            "motto" => "nullable|string|max:255",
        ]);

        foreach ($validated as $key => $value) {
            SiteSetting::set($key, $value);
        }

        return redirect()->back()->with("success", "Institutional system configuration updated successfully.");
    }
}

