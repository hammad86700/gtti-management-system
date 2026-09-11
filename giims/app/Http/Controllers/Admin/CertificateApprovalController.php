<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Student\Models\Certificate;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CertificateApprovalController extends Controller
{
    /**
     * Display the Executive Certificate Approval & Verification Desk.
     */
    public function index(): Response
    {
        $certificates = Certificate::with([
                'studentProfile.user',
                'course',
                'batch',
                'issuer',
                'approver',
                'enrollment',
            ])
            ->orderByRaw("CASE WHEN status = 'pending_approval' THEN 1 WHEN status = 'requested' THEN 2 ELSE 3 END")
            ->orderBy('id', 'desc')
            ->get();

        $pendingCount = $certificates->where('status', 'pending_approval')->count();
        $approvedCount = $certificates->where('status', 'approved')->count();
        $requestedCount = $certificates->where('status', 'requested')->count();

        return Inertia::render('Admin/Certificates/Index', [
            'certificates' => $certificates,
            'stats' => [
                'pending' => $pendingCount,
                'approved' => $approvedCount,
                'requested' => $requestedCount,
            ],
        ]);
    }

    /**
     * Admin/Principal confirms and officially signs off on student certificate.
     * Unlocks the digital certificate on the Student Dashboard.
     */
    public function approve(Certificate $certificate): RedirectResponse
    {
        $certificate->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'is_digital_released' => true,
        ]);

        if ($certificate->enrollment) {
            $certificate->enrollment->update([
                'status' => 'graduated',
            ]);
        }

        return redirect()->back()->with('success', "Certificate {$certificate->certificate_number} confirmed with Principal Authority. Digital Certificate is now accessible on the student portal, with college collection scheduled for {$certificate->collection_date?->format('d M Y')}.");
    }

    /**
     * Reject or return a drafted certificate back to Clerk with audit notes.
     */
    public function reject(Request $request, Certificate $certificate): RedirectResponse
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $certificate->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'is_digital_released' => false,
        ]);

        return redirect()->back()->with('notice', "Certificate {$certificate->certificate_number} was rejected with remarks and returned to Clerk.");
    }
}
