<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Operations\Models\SiteSetting;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SiteSettingsController extends Controller
{
    /**
     * Display the Site Settings & Public CMS Management Desk.
     */
    public function index(Request $request): Response
    {
        $allSettings = SiteSetting::allAsKeyValue();

        // Retrieve raw records to get updater details and timestamps
        $records = SiteSetting::with('updater:id,name,email')->get()->keyBy('key');

        $grouped = [
            'header' => [
                'govt_subheading' => $allSettings['govt_subheading'] ?? '',
                'helpline_phones' => $allSettings['helpline_phones'] ?? '',
                'office_timings' => $allSettings['office_timings'] ?? '',
                'motto' => $allSettings['motto'] ?? '',
            ],
            'notice' => [
                'official_notice_text' => $allSettings['official_notice_text'] ?? '',
                'official_notice_link' => $allSettings['official_notice_link'] ?? '',
            ],
            'quick_cards' => [
                'card_1_title' => $allSettings['card_1_title'] ?? 'Tevta Portal',
                'card_1_subtitle' => $allSettings['card_1_subtitle'] ?? 'Enterprise Access',
                'card_1_url' => $allSettings['card_1_url'] ?? '/login',

                'card_2_title' => $allSettings['card_2_title'] ?? 'Online Admission Form',
                'card_2_subtitle' => $allSettings['card_2_subtitle'] ?? 'Session 2026 Open',
                'card_2_url' => $allSettings['card_2_url'] ?? '/register',

                'card_3_title' => $allSettings['card_3_title'] ?? 'Download Prospectus',
                'card_3_subtitle' => $allSettings['card_3_subtitle'] ?? 'Session 2026 Guide & Eligibility',
                'card_3_url' => $allSettings['card_3_url'] ?? '/download-prospectus',

                'card_4_title' => $allSettings['card_4_title'] ?? 'Merit Lists & Gazette',
                'card_4_subtitle' => $allSettings['card_4_subtitle'] ?? 'Session 2026 Selections',
                'card_4_url' => $allSettings['card_4_url'] ?? '/merit-lists',
            ],
            'files' => [
                'prospectus_pdf_path' => $allSettings['prospectus_pdf_path'] ?? null,
                'prospectus_file_size' => $allSettings['prospectus_file_size'] ?? null,
                'prospectus_uploaded_at' => $allSettings['prospectus_uploaded_at'] ?? null,
                'prospectus_download_url' => !empty($allSettings['prospectus_pdf_path'])
                    ? Storage::disk('public')->url($allSettings['prospectus_pdf_path'])
                    : null,
            ],
            'contact' => [
                'institute_address' => $allSettings['institute_address'] ?? '',
                'official_email' => $allSettings['official_email'] ?? '',
                'affiliation_text' => $allSettings['affiliation_text'] ?? '',
                'google_maps_link' => $allSettings['google_maps_link'] ?? '',
            ],
        ];

        return Inertia::render('Admin/SiteSettings/Index', [
            'settings' => $allSettings,
            'grouped' => $grouped,
            'meta' => [
                'last_updated_at' => SiteSetting::latest('updated_at')->value('updated_at'),
                'updated_by_user' => $records->firstWhere('updated_by', '!=', null)?->updater?->name ?? 'System Administrator',
            ],
        ]);
    }

    /**
     * Update landing page settings and prospectus document.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            // Header
            'govt_subheading' => 'nullable|string|max:500',
            'helpline_phones' => 'nullable|string|max:255',
            'office_timings' => 'nullable|string|max:255',
            'motto' => 'nullable|string|max:255',

            // Notice
            'official_notice_text' => 'nullable|string|max:1000',
            'official_notice_link' => 'nullable|string|max:500',

            // Quick Cards
            'card_1_title' => 'nullable|string|max:100',
            'card_1_subtitle' => 'nullable|string|max:255',
            'card_1_url' => 'nullable|string|max:500',

            'card_2_title' => 'nullable|string|max:100',
            'card_2_subtitle' => 'nullable|string|max:255',
            'card_2_url' => 'nullable|string|max:500',

            'card_3_title' => 'nullable|string|max:100',
            'card_3_subtitle' => 'nullable|string|max:255',
            'card_3_url' => 'nullable|string|max:500',

            'card_4_title' => 'nullable|string|max:100',
            'card_4_subtitle' => 'nullable|string|max:255',
            'card_4_url' => 'nullable|string|max:500',

            // Contact
            'institute_address' => 'nullable|string|max:500',
            'official_email' => 'nullable|string|email|max:255',
            'affiliation_text' => 'nullable|string|max:255',
            'google_maps_link' => 'nullable|string|max:1000',

            // Prospectus PDF upload (Max 10MB)
            'prospectus_pdf' => 'nullable|file|mimes:pdf|max:10240',
            'prospectus_file' => 'nullable|file|mimes:pdf|max:10240',
        ], [
            'prospectus_pdf.mimes' => 'The prospectus document must be a valid PDF file.',
            'prospectus_pdf.max' => 'The prospectus PDF size must not exceed 10MB.',
            'prospectus_file.mimes' => 'The prospectus document must be a valid PDF file.',
            'prospectus_file.max' => 'The prospectus PDF size must not exceed 10MB.',
            'official_email.email' => 'Please provide a valid official email address.',
        ]);

        $userId = auth()->id();

        // Handle Prospectus PDF upload if provided (supports both prospectus_pdf and prospectus_file)
        $file = $request->file('prospectus_pdf') ?? $request->file('prospectus_file');
        if ($file) {
            $oldPath = SiteSetting::get('prospectus_pdf_path');
            if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }

            $path = $file->store('prospectus', 'public');
            $sizeFormatted = number_format($file->getSize() / 1048576, 2) . ' MB';

            SiteSetting::set('prospectus_pdf_path', $path, 'files', $userId);
            SiteSetting::set('prospectus_file_size', $sizeFormatted, 'files', $userId);
            SiteSetting::set('prospectus_uploaded_at', now()->toDateTimeString(), 'files', $userId);
        }

        // Group mapping for organizational clean storage
        $fieldGroups = [
            'govt_subheading' => 'header',
            'helpline_phones' => 'header',
            'office_timings' => 'header',
            'motto' => 'header',

            'official_notice_text' => 'notice',
            'official_notice_link' => 'notice',

            'card_1_title' => 'quick_cards',
            'card_1_subtitle' => 'quick_cards',
            'card_1_url' => 'quick_cards',

            'card_2_title' => 'quick_cards',
            'card_2_subtitle' => 'quick_cards',
            'card_2_url' => 'quick_cards',

            'card_3_title' => 'quick_cards',
            'card_3_subtitle' => 'quick_cards',
            'card_3_url' => 'quick_cards',

            'card_4_title' => 'quick_cards',
            'card_4_subtitle' => 'quick_cards',
            'card_4_url' => 'quick_cards',

            'institute_address' => 'contact',
            'official_email' => 'contact',
            'affiliation_text' => 'contact',
            'google_maps_link' => 'contact',
        ];

        foreach ($fieldGroups as $field => $group) {
            if ($request->has($field)) {
                SiteSetting::set($field, $request->input($field), $group, $userId);
            }
        }

        return redirect()->back()->with('success', 'Landing page settings and CMS configuration updated successfully.');
    }
}
