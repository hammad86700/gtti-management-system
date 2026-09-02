<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Student\Models\Certificate;
use App\Domains\Student\Models\Clearance;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClearanceController extends Controller
{
    /**
     * Display all candidate clearance requests, departmental statuses, and certificate issuance actions.
     */
    public function index(): Response
    {
        $clearances = Clearance::with([
                'studentProfile.user',
                'studentProfile.certificates',
                'enrollment.course.trade.program.department',
                'enrollment.batch',
            ])
            ->latest()
            ->get();

        return Inertia::render('Admin/Clearance/Index', [
            'clearances' => $clearances,
        ]);
    }

    /**
     * Update departmental dues clearance statuses (Accounts, Library, Workshop).
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $clearance = Clearance::findOrFail($id);

        $validated = $request->validate([
            'fee_status' => 'required|in:pending,cleared',
            'library_status' => 'required|in:pending,cleared',
            'workshop_status' => 'required|in:pending,cleared',
        ]);

        $overall = ($validated['fee_status'] === 'cleared' &&
            $validated['library_status'] === 'cleared' &&
            $validated['workshop_status'] === 'cleared')
            ? 'cleared'
            : 'pending';

        $clearance->update([
            'fee_status' => $validated['fee_status'],
            'library_status' => $validated['library_status'],
            'workshop_status' => $validated['workshop_status'],
            'overall_status' => $overall,
        ]);

        return redirect()->back()->with('success', 'Clearance departmental statuses updated successfully.');
    }

    /**
     * Issue an official Course Completion Certificate and mark student as graduated.
     */
    public function issueCertificate(Request $request, int $id): RedirectResponse
    {
        $clearance = Clearance::with(['studentProfile.user', 'enrollment.course'])->findOrFail($id);

        if ($clearance->overall_status !== 'cleared') {
            return redirect()->back()->with('error', 'All departmental dues (Fee, Library, Workshop) must be cleared prior to certificate issuance.');
        }

        // Check if certificate already exists
        $existingCert = Certificate::where('student_profile_id', $clearance->student_profile_id)
            ->where('course_id', $clearance->enrollment->course_id)
            ->first();

        if ($existingCert) {
            return redirect()->back()->with('notice', "Official Certificate ({$existingCert->certificate_number}) was already issued for this candidate.");
        }

        // Generate Certificate Number
        $certNumber = 'GTTI-CERT-' . date('Y') . '-' . str_pad((string) rand(1, 9999), 4, '0', STR_PAD_LEFT);

        Certificate::create([
            'student_profile_id' => $clearance->student_profile_id,
            'course_id' => $clearance->enrollment->course_id,
            'certificate_number' => $certNumber,
            'issue_date' => now()->toDateString(),
        ]);

        // Mark enrollment as graduated
        $clearance->enrollment->update([
            'status' => 'graduated',
        ]);

        return redirect()->back()->with('success', "Certificate {$certNumber} generated successfully. Student enrollment updated to 'Graduated'.");
    }
}
