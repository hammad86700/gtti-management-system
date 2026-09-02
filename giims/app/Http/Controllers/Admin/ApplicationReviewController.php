<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Admissions\Models\Application;
use App\Domains\Admissions\Models\ApplicationDocument;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ApplicationReviewController extends Controller
{
    /**
     * Display a listing of all submitted student applications.
     */
    public function index(): Response
    {
        $applications = Application::with([
            'studentProfile.user',
            'course.trade.program.department',
            'admissionCampaign',
            'documents',
        ])
        ->orderBy('created_at', 'desc')
        ->paginate(20);

        return Inertia::render('Admin/Admissions/Applications/Index', [
            'applications' => $applications,
        ]);
    }

    /**
     * Display the specified application details with attached verification documents.
     */
    public function show(int $id): Response
    {
        $application = Application::with([
            'studentProfile.user',
            'course.trade.program.department',
            'documents',
            'admissionCampaign',
        ])->findOrFail($id);

        return Inertia::render('Admin/Admissions/Applications/Show', [
            'application' => $application,
        ]);
    }

    /**
     * Update the verification status of an application.
     */
    public function updateStatus(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:verified,rejected,under_review,selected,enrolled,submitted',
        ]);

        $application = Application::findOrFail($id);
        $application->update([
            'status' => $validated['status'],
        ]);

        return redirect()->back()->with('success', 'Application status updated to ' . ucfirst(str_replace('_', ' ', $validated['status'])) . '.');
    }

    /**
     * Securely download an uploaded verification document.
     */
    public function downloadDocument(int $id): StreamedResponse|BinaryFileResponse
    {
        $document = ApplicationDocument::findOrFail($id);

        if (Storage::disk('local')->exists($document->file_path)) {
            return Storage::disk('local')->download($document->file_path);
        }

        $directPath = storage_path('app/' . $document->file_path);
        if (file_exists($directPath)) {
            return response()->download($directPath);
        }

        abort(404, 'The requested document file could not be found.');
    }
}
