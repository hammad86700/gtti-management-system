<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Operations\Models\DisciplineRecord;
use App\Domains\Student\Models\Enrollment;
use App\Domains\Student\Models\StudentProfile;
use App\Domains\Student\Models\StudentStatusRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DisciplineController extends Controller
{
    /**
     * Display all student disciplinary incident reports, faculty status requests, and active sanctions.
     */
    public function index(): Response
    {
        // 1. Incident Records (Phase 12)
        $records = DisciplineRecord::with([
                'studentProfile.user',
                'studentProfile.enrollments' => function ($query) {
                    $query->with(['course', 'batch']);
                },
                'reporter',
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        // 2. Active candidate students available for direct sanction / logging
        $students = StudentProfile::with([
                'user',
                'enrollments' => function ($query) {
                    $query->with(['course', 'batch']);
                },
            ])
            ->get()
            ->map(function ($st) {
                return [
                    'id' => $st->id,
                    'name' => $st->user?->name ?? 'Candidate',
                    'father_name' => $st->father_name ?? 'N/A',
                    'cnic' => $st->user?->cnic ?? 'N/A',
                    'registration_number' => $st->registration_number,
                    'status' => $st->status,
                    'enrollment' => $st->enrollments->first(),
                    'batch' => $st->enrollments->first()?->batch,
                    'course' => $st->enrollments->first()?->course,
                ];
            });

        // 3. Faculty termination / struck-off requests sent to Principal
        $statusRequests = StudentStatusRequest::with([
                'studentProfile.user',
                'studentProfile.enrollments.course',
                'studentProfile.enrollments.batch',
                'batch.course',
                'requester',
                'reviewer',
            ])
            ->latest()
            ->get();

        // 4. Currently Sanctioned Students Roster (Struck-off or Terminated)
        $sanctionedStudents = StudentProfile::with([
                'user',
                'enrollments.course',
                'enrollments.batch',
            ])
            ->whereIn('status', ['struck_off', 'terminated'])
            ->latest('struck_off_at')
            ->get()
            ->map(function ($p) {
                $isStruckOff = $p->status === 'struck_off';
                $remainingDays = 0;
                $hasExpired = false;

                if ($isStruckOff && $p->struck_off_until) {
                    if (now()->greaterThan($p->struck_off_until)) {
                        $hasExpired = true;
                    } else {
                        $remainingDays = max(0, (int) ceil(now()->diffInSeconds($p->struck_off_until, false) / 86400));
                    }
                }

                return [
                    'id' => $p->id,
                    'user_id' => $p->user_id,
                    'name' => $p->user?->name ?? 'Trainee',
                    'father_name' => $p->father_name ?? 'N/A',
                    'cnic' => $p->user?->cnic ?? 'N/A',
                    'registration_number' => $p->registration_number,
                    'course_name' => $p->enrollments->first()?->course?->name ?? 'General Course',
                    'batch_name' => $p->enrollments->first()?->batch?->name ?? 'Active Batch',
                    'status' => $p->status,
                    'struck_off_at' => $p->struck_off_at?->format('d M Y, h:i A'),
                    'struck_off_until' => $p->struck_off_until?->format('d M Y, h:i A'),
                    'struck_off_days' => $p->struck_off_days,
                    'remaining_days' => $remainingDays,
                    'has_expired' => $hasExpired,
                    'termination_reason' => $p->termination_reason,
                    'order_reference' => $p->order_reference,
                ];
            });

        return Inertia::render('Admin/Discipline/Index', [
            'records' => $records,
            'students' => $students,
            'statusRequests' => $statusRequests,
            'sanctionedStudents' => $sanctionedStudents,
        ]);
    }

    /**
     * Report and log a new disciplinary incident against a student.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_profile_id' => 'required|exists:student_profiles,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:2000',
            'severity' => 'required|in:minor,major,critical',
        ]);

        DisciplineRecord::create([
            'student_profile_id' => $validated['student_profile_id'],
            'reported_by' => auth()->id(),
            'title' => $validated['title'],
            'description' => $validated['description'],
            'severity' => $validated['severity'],
            'status' => 'open',
        ]);

        return redirect()->back()->with('success', 'Disciplinary incident reported and logged successfully.');
    }

    /**
     * Record administrative action and mark incident as resolved.
     */
    public function resolve(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'action_taken' => 'required|string|max:1000',
        ]);

        $record = DisciplineRecord::findOrFail($id);

        $record->update([
            'action_taken' => $validated['action_taken'],
            'status' => 'resolved',
        ]);

        return redirect()->back()->with('success', 'Disciplinary incident marked as resolved.');
    }

    /**
     * Approve teacher's disciplinary request to strike-off or terminate a student.
     */
    public function approveRequest(Request $request, int $id): RedirectResponse
    {
        $statusReq = StudentStatusRequest::with(['studentProfile.user'])->findOrFail($id);

        $validated = $request->validate([
            'action_type' => 'nullable|in:struck_off,terminate',
            'struck_off_days' => 'nullable|integer|min:1|max:365',
            'admin_remarks' => 'required|string|max:2000',
            'order_reference' => 'nullable|string|max:100',
        ]);

        $actionType = $validated['action_type'] ?? $statusReq->request_type;
        $orderRef = $validated['order_reference'] ?? ('GTTI/ORD/' . date('Y') . '/' . str_pad((string) rand(100, 999), 3, '0', STR_PAD_LEFT));
        $profile = $statusReq->studentProfile;

        if ($actionType === 'struck_off') {
            $days = $validated['struck_off_days'] ?? $statusReq->struck_off_days ?? 7;
            $until = now()->addDays($days);

            $profile->update([
                'status' => 'struck_off',
                'struck_off_at' => now(),
                'struck_off_until' => $until,
                'struck_off_days' => $days,
                'termination_reason' => $statusReq->reason . ' - ' . $validated['admin_remarks'],
                'sanctioned_by' => auth()->id(),
                'order_reference' => $orderRef,
            ]);

            // Update student active enrollments
            Enrollment::where('student_profile_id', $profile->id)
                ->where('status', 'active')
                ->update(['status' => 'suspended']);

            $actionDescription = "Officially Struck-off the rolls for {$days} days until {$until->format('d M Y')}. Order: {$orderRef}.";
        } else {
            // Permanent Termination
            $profile->update([
                'status' => 'terminated',
                'struck_off_at' => now(),
                'struck_off_until' => null,
                'struck_off_days' => null,
                'termination_reason' => $statusReq->reason . ' - ' . $validated['admin_remarks'],
                'sanctioned_by' => auth()->id(),
                'order_reference' => $orderRef,
            ]);

            // Deactivate enrollments
            Enrollment::where('student_profile_id', $profile->id)
                ->update(['status' => 'dropped']);

            $actionDescription = "Permanently Terminated & Expelled from College. Order: {$orderRef}.";
        }

        // Update the request status
        $statusReq->update([
            'status' => 'approved',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
            'admin_remarks' => $validated['admin_remarks'],
            'action_duration_days' => $actionType === 'struck_off' ? ($days ?? null) : null,
            'order_reference' => $orderRef,
        ]);

        // Auto-create resolved discipline record for audit trail
        DisciplineRecord::create([
            'student_profile_id' => $profile->id,
            'reported_by' => $statusReq->requested_by,
            'title' => 'Disciplinary Sanction: ' . $statusReq->reason,
            'description' => $statusReq->evidence_notes ?? 'Formal disciplinary action sanctioned by Principal Office.',
            'severity' => 'critical',
            'action_taken' => $actionDescription,
            'status' => 'resolved',
        ]);

        $studentName = $profile->user?->name ?? 'Trainee';
        $sanctionLabel = $actionType === 'struck_off' ? "struck-off for {$days} days" : 'permanently terminated';

        return redirect()->back()->with('success', "Disciplinary request approved. {$studentName} has been officially {$sanctionLabel}. (Order: {$orderRef})");
    }

    /**
     * Reject and dismiss teacher's disciplinary request.
     */
    public function rejectRequest(Request $request, int $id): RedirectResponse
    {
        $statusReq = StudentStatusRequest::with(['studentProfile.user'])->findOrFail($id);

        $validated = $request->validate([
            'admin_remarks' => 'required|string|max:2000',
        ]);

        $statusReq->update([
            'status' => 'rejected',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
            'admin_remarks' => $validated['admin_remarks'],
        ]);

        $studentName = $statusReq->studentProfile?->user?->name ?? 'Trainee';

        return redirect()->back()->with('success', "Disciplinary request for {$studentName} was rejected. Trainee remains in active college status.");
    }

    /**
     * Direct sanction initiated directly by Admin / Principal.
     */
    public function directSanction(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_profile_id' => 'required|exists:student_profiles,id',
            'sanction_type' => 'required|in:struck_off,terminate',
            'struck_off_days' => 'required_if:sanction_type,struck_off|nullable|integer|min:1|max:365',
            'reason' => 'required|string|max:255',
            'order_reference' => 'nullable|string|max:100',
            'admin_remarks' => 'nullable|string|max:2000',
        ]);

        $profile = StudentProfile::with('user')->findOrFail($validated['student_profile_id']);
        $orderRef = $validated['order_reference'] ?? ('GTTI/ORD/' . date('Y') . '/' . str_pad((string) rand(100, 999), 3, '0', STR_PAD_LEFT));
        $notes = $validated['reason'] . ($validated['admin_remarks'] ? ' - ' . $validated['admin_remarks'] : '');

        if ($validated['sanction_type'] === 'struck_off') {
            $days = (int) $validated['struck_off_days'];
            $until = now()->addDays($days);

            $profile->update([
                'status' => 'struck_off',
                'struck_off_at' => now(),
                'struck_off_until' => $until,
                'struck_off_days' => $days,
                'termination_reason' => $notes,
                'sanctioned_by' => auth()->id(),
                'order_reference' => $orderRef,
            ]);

            Enrollment::where('student_profile_id', $profile->id)
                ->where('status', 'active')
                ->update(['status' => 'suspended']);

            $actionDescription = "Direct Administrative Struck-off for {$days} days until {$until->format('d M Y')}. Order: {$orderRef}.";
        } else {
            $profile->update([
                'status' => 'terminated',
                'struck_off_at' => now(),
                'struck_off_until' => null,
                'struck_off_days' => null,
                'termination_reason' => $notes,
                'sanctioned_by' => auth()->id(),
                'order_reference' => $orderRef,
            ]);

            Enrollment::where('student_profile_id', $profile->id)
                ->update(['status' => 'dropped']);

            $actionDescription = "Direct Administrative Permanent Termination & Expulsion. Order: {$orderRef}.";
        }

        DisciplineRecord::create([
            'student_profile_id' => $profile->id,
            'reported_by' => auth()->id(),
            'title' => 'Administrative Sanction: ' . $validated['reason'],
            'description' => $validated['admin_remarks'] ?? 'Direct executive sanction ordered by College Administration.',
            'severity' => 'critical',
            'action_taken' => $actionDescription,
            'status' => 'resolved',
        ]);

        $studentName = $profile->user?->name ?? 'Trainee';
        $sanctionLabel = $validated['sanction_type'] === 'struck_off' ? "struck-off for {$validated['struck_off_days']} days" : 'permanently terminated';

        return redirect()->back()->with('success', "Direct sanction executed successfully. {$studentName} has been {$sanctionLabel}. (Order: {$orderRef})");
    }

    /**
     * Reinstate a struck-off or terminated student back to active college standing.
     */
    public function reinstate(Request $request, int $id): RedirectResponse
    {
        $profile = StudentProfile::with('user')->findOrFail($id);

        $profile->update([
            'status' => 'active',
            'struck_off_at' => null,
            'struck_off_until' => null,
            'struck_off_days' => null,
            'termination_reason' => null,
            'sanctioned_by' => null,
            'order_reference' => null,
        ]);

        // Restore active enrollment status
        Enrollment::where('student_profile_id', $profile->id)
            ->whereIn('status', ['suspended', 'dropped'])
            ->update(['status' => 'active']);

        DisciplineRecord::create([
            'student_profile_id' => $profile->id,
            'reported_by' => auth()->id(),
            'title' => 'Official Reinstatement / Pardon',
            'description' => 'Disciplinary sanction revoked and trainee restored to full active standing by Principal Office.',
            'severity' => 'minor',
            'action_taken' => 'Reinstated to Active Roster. Dashboard access restored.',
            'status' => 'resolved',
        ]);

        $studentName = $profile->user?->name ?? 'Trainee';

        return redirect()->back()->with('success', "Trainee {$studentName} has been officially reinstated to active status. Student dashboard access is fully restored.");
    }
}
