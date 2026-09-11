<?php

namespace App\Http\Controllers\Clerk;

use App\Domains\Organization\Models\Course;
use App\Domains\Student\Models\Certificate;
use App\Domains\Student\Models\Enrollment;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CertificateController extends Controller
{
    /**
     * Display the Clerk Certificate Management & Issuance Desk.
     */
    public function index(): Response
    {
        $certificates = Certificate::with([
                'studentProfile.user',
                'course',
                'batch',
                'issuer',
                'approver',
            ])
            ->orderBy('id', 'desc')
            ->get();

        // Active and completed student enrollments available for manual certificate issuance
        $eligibleEnrollments = Enrollment::with([
                'studentProfile.user',
                'course',
                'batch',
            ])
            ->whereIn('status', ['enrolled', 'graduated', 'completed'])
            ->orderBy('id', 'desc')
            ->take(100)
            ->get();

        return Inertia::render('Clerk/Certificates/Index', [
            'certificates' => $certificates,
            'eligibleEnrollments' => $eligibleEnrollments,
            'suggestedCertNumber' => 'GTTI-CERT-' . date('Y') . '-' . str_pad((string) rand(1000, 9999), 4, '0', STR_PAD_LEFT),
        ]);
    }

    /**
     * Clerk manually issues/drafts a new certificate for an enrolled student.
     * Sets status to 'pending_approval' awaiting Admin/Principal confirmation.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'enrollment_id' => 'required|exists:enrollments,id',
            'certificate_number' => 'required|string|max:100|unique:certificates,certificate_number',
            'issue_date' => 'required|date',
            'collection_date' => 'required|date|after_or_equal:issue_date',
            'grade' => 'nullable|string|max:10',
            'marks_obtained' => 'nullable|integer|min:0',
            'total_marks' => 'nullable|integer|min:1',
            'student_notes' => 'nullable|string|max:500',
        ]);

        $enrollment = Enrollment::with('studentProfile')->findOrFail($validated['enrollment_id']);

        Certificate::create([
            'student_profile_id' => $enrollment->student_profile_id,
            'course_id' => $enrollment->course_id,
            'enrollment_id' => $enrollment->id,
            'batch_id' => $enrollment->batch_id,
            'certificate_number' => $validated['certificate_number'],
            'status' => 'pending_approval',
            'issue_date' => $validated['issue_date'],
            'collection_date' => $validated['collection_date'],
            'grade' => $validated['grade'] ?? 'A',
            'marks_obtained' => $validated['marks_obtained'] ?? null,
            'total_marks' => $validated['total_marks'] ?? 100,
            'student_notes' => $validated['student_notes'] ?? null,
            'issued_by' => auth()->id(),
            'is_digital_released' => false,
        ]);

        return redirect()->back()->with('success', "Certificate {$validated['certificate_number']} issued and routed to Principal/Admin for mandatory confirmation. Physical collection date scheduled for {$validated['collection_date']}.");
    }

    /**
     * Process an incoming student certificate application and assign collection date.
     */
    public function processRequest(Request $request, Certificate $certificate): RedirectResponse
    {
        $validated = $request->validate([
            'certificate_number' => 'required|string|max:100|unique:certificates,certificate_number,' . $certificate->id,
            'issue_date' => 'nullable|date',
            'collection_date' => 'required|date',
            'grade' => 'nullable|string|max:10',
            'marks_obtained' => 'nullable|integer|min:0',
            'total_marks' => 'nullable|integer|min:1',
        ]);

        $issueDate = $validated['issue_date'] ?? now()->toDateString();

        $certificate->update([
            'certificate_number' => $validated['certificate_number'],
            'issue_date' => $issueDate,
            'collection_date' => $validated['collection_date'],
            'grade' => $validated['grade'] ?? 'A',
            'marks_obtained' => $validated['marks_obtained'] ?? null,
            'total_marks' => $validated['total_marks'] ?? 100,
            'status' => 'pending_approval',
            'issued_by' => auth()->id(),
            'is_digital_released' => false,
        ]);

        return redirect()->back()->with('success', "Certificate application processed and forwarded to Principal for final approval. Collection date: {$validated['collection_date']}.");
    }
}
