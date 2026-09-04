<?php

namespace App\Http\Controllers\Security;

use App\Domains\Attendance\Models\GateLog;
use App\Domains\Student\Models\Enrollment;
use App\Domains\Student\Models\StudentProfile;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GateController extends Controller
{
    /**
     * Display the tablet-friendly Gate Security Portal with today's live activity log.
     */
    public function index(): Response
    {
        $todayLogs = GateLog::with([
                'studentProfile.user',
                'studentProfile.enrollments.course',
                'studentProfile.enrollments.batch',
            ])
            ->orderBy('logged_at', 'desc')
            ->take(30)
            ->get();

        return Inertia::render('Security/GatePortal/Index', [
            'todayLogs' => $todayLogs,
        ]);
    }

    /**
     * Verify a student's identity barcode/roll number or CNIC via AJAX.
     */
    public function verify(Request $request): JsonResponse
    {
        $identifier = trim($request->input('identifier', ''));

        if (empty($identifier)) {
            return response()->json([
                'found' => false,
                'message' => 'Please scan a barcode or enter an Enrollment ID / CNIC.',
            ], 422);
        }

        $enrollment = Enrollment::with(['studentProfile.user', 'course', 'batch'])
            ->where('enrollment_number', $identifier)
            ->orWhereHas('studentProfile.user', function ($q) use ($identifier) {
                $q->where('cnic', $identifier)->orWhere('phone', $identifier);
            })
            ->latest()
            ->first();

        if (!$enrollment || !$enrollment->studentProfile) {
            return response()->json([
                'found' => false,
                'message' => "No active student enrollment found for '{$identifier}'. Access Restricted.",
            ]);
        }

        $profile = $enrollment->studentProfile;
        $user = $profile->user;

        $isProfileActive = true;
        $sanctionMessage = null;

        if ($profile->status === 'struck_off') {
            if ($profile->struck_off_until && now()->greaterThan($profile->struck_off_until)) {
                $profile->update([
                    'status' => 'active',
                    'struck_off_at' => null,
                    'struck_off_until' => null,
                    'struck_off_days' => null,
                    'termination_reason' => null,
                ]);
                $enrollment->update(['status' => 'active']);
            } else {
                $isProfileActive = false;
                $sanctionMessage = 'ENTRY DENIED: Trainee is temporarily struck-off until ' . ($profile->struck_off_until?->format('d M Y') ?? 'further notice') . '.';
            }
        } elseif ($profile->status === 'terminated') {
            $isProfileActive = false;
            $sanctionMessage = 'ENTRY FORBIDDEN: Trainee has been permanently terminated / expelled from college.';
        }

        $isActive = $isProfileActive && $enrollment->status === 'active';

        return response()->json([
            'found' => true,
            'student' => [
                'profile_id' => $profile->id,
                'name' => $user->name,
                'father_name' => $profile->father_name ?? 'N/A',
                'cnic' => $user->cnic ?? 'N/A',
                'enrollment_number' => $enrollment->enrollment_number,
                'course' => $enrollment->course->name,
                'batch' => $enrollment->batch->name,
                'shift' => $enrollment->batch->shift,
                'status' => $profile->status !== 'active' ? $profile->status : $enrollment->status,
                'is_active' => $isActive,
                'sanction_message' => $sanctionMessage,
                'domicile' => $profile->domicile_district ?? 'Rahim Yar Khan',
            ],
        ]);
    }

    /**
     * Store a campus gate entry or exit log.
     */
    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'student_profile_id' => 'required|exists:student_profiles,id',
            'type' => 'required|in:entry,exit',
            'gate_name' => 'nullable|string|max:100',
        ]);

        $log = GateLog::create([
            'student_profile_id' => $validated['student_profile_id'],
            'user_id' => auth()->id(),
            'gate_name' => $validated['gate_name'] ?? 'Main Campus Gate',
            'type' => $validated['type'],
            'logged_at' => now(),
        ]);

        $log->load(['studentProfile.user', 'studentProfile.enrollments.course', 'studentProfile.enrollments.batch']);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Gate access log recorded successfully.',
                'log' => $log,
            ]);
        }

        return redirect()->back()->with('success', 'Gate log recorded successfully.');
    }
}
