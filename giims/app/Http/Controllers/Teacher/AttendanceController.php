<?php

namespace App\Http\Controllers\Teacher;

use App\Domains\Academic\Models\Subject;
use App\Domains\Attendance\Models\AttendanceSession;
use App\Domains\Attendance\Models\ClassAttendance;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    /**
     * Standard GTTI Location presets for Labs and Classrooms.
     */
    public array $locationPresets = [
        [
            'name' => 'Computer Lab 1 & 2 (IT Wing)',
            'latitude' => 28.4212000,
            'longitude' => 70.3023000,
            'radius_meters' => 120,
        ],
        [
            'name' => 'Electrical & RAC Workshop',
            'latitude' => 28.4215000,
            'longitude' => 70.3026000,
            'radius_meters' => 150,
        ],
        [
            'name' => 'Mechanical & Welder Lab',
            'latitude' => 28.4210000,
            'longitude' => 70.3020000,
            'radius_meters' => 150,
        ],
        [
            'name' => 'Main Academic Lecture Hall',
            'latitude' => 28.4213000,
            'longitude' => 70.3022000,
            'radius_meters' => 100,
        ],
        [
            'name' => 'GTTI Campus Perimeter (All Buildings)',
            'latitude' => 28.4212000,
            'longitude' => 70.3023000,
            'radius_meters' => 350,
        ],
    ];

    /**
     * Display the classroom roll-call attendance sheet for a batch.
     */
    public function create(int $batchId): Response
    {
        $batch = auth()->user()->batches()
            ->with([
                'course.trade.program.department',
                'enrollments' => function ($q) {
                    $q->where('status', 'active')->with('studentProfile.user');
                },
            ])
            ->findOrFail($batchId);

        $subjects = Subject::where('course_id', $batch->course_id)->get();

        return Inertia::render('Teacher/Attendance/Create', [
            'batch' => $batch,
            'subjects' => $subjects,
            'locationPresets' => $this->locationPresets,
        ]);
    }

    /**
     * Display the real-time Live Geofence Attendance Dashboard for a batch.
     */
    public function liveSession(int $batchId): Response
    {
        $batch = auth()->user()->batches()
            ->with([
                'course.trade.program.department',
                'enrollments' => function ($q) {
                    $q->where('status', 'active')->with('studentProfile.user');
                },
            ])
            ->findOrFail($batchId);

        $today = today();

        // Get or find today's session
        $session = AttendanceSession::where('batch_id', $batch->id)
            ->whereDate('session_date', $today)
            ->with(['classAttendances.studentProfile.user'])
            ->latest()
            ->first();

        // If no session exists yet, initialize a default one so students can check in
        if (!$session) {
            $session = AttendanceSession::create([
                'batch_id' => $batch->id,
                'user_id' => auth()->id(),
                'location_name' => 'Computer Lab 1 & 2 (IT Wing)',
                'latitude' => 28.4212000,
                'longitude' => 70.3023000,
                'radius_meters' => 150,
                'is_geofence_active' => true,
                'session_date' => $today,
                'start_time' => now()->format('H:i:s'),
                'status' => 'active',
            ]);
            $session->load('classAttendances.studentProfile.user');
        }

        // Map all enrolled students to ensure every student shows in the teacher table
        $attendanceMap = $session->classAttendances->keyBy('student_profile_id');

        $traineeList = $batch->enrollments->map(function ($enr) use ($attendanceMap) {
            $profile = $enr->studentProfile;
            $att = $attendanceMap->get($profile->id);

            return [
                'enrollment_id' => $enr->id,
                'student_profile_id' => $profile->id,
                'enrollment_number' => $enr->enrollment_number,
                'name' => $profile->user?->name ?? 'Trainee',
                'father_name' => $profile->father_name ?? 'N/A',
                'status' => $att?->status ?? 'unmarked',
                'method' => $att?->method ?? null,
                'distance_meters' => $att?->distance_meters ?? null,
                'marked_at' => $att?->marked_at?->format('h:i A') ?? null,
                'attendance_id' => $att?->id ?? null,
            ];
        });

        $subjects = Subject::where('course_id', $batch->course_id)->get();

        return Inertia::render('Teacher/Attendance/Live', [
            'batch' => $batch,
            'session' => $session,
            'trainees' => $traineeList,
            'subjects' => $subjects,
            'locationPresets' => $this->locationPresets,
        ]);
    }

    /**
     * Start / Calibrate an Active Geofence Attendance Session with specific area coordinates and radius.
     */
    public function startSession(Request $request, int $batchId): RedirectResponse
    {
        $batch = auth()->user()->batches()->findOrFail($batchId);

        $validated = $request->validate([
            'location_name' => 'required|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius_meters' => 'required|integer|min:20|max:1000',
            'subject_id' => 'nullable|exists:subjects,id',
            'is_geofence_active' => 'boolean',
        ]);

        $today = today();

        $session = AttendanceSession::updateOrCreate(
            [
                'batch_id' => $batch->id,
                'session_date' => $today,
            ],
            [
                'user_id' => auth()->id(),
                'subject_id' => $validated['subject_id'] ?? null,
                'location_name' => $validated['location_name'],
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'radius_meters' => $validated['radius_meters'],
                'is_geofence_active' => $validated['is_geofence_active'] ?? true,
                'start_time' => now()->format('H:i:s'),
                'status' => 'active',
            ]
        );

        return redirect()->back()->with('success', "Active GPS Geofence session started for {$session->location_name} (Radius: {$session->radius_meters}m). Students can now check in.");
    }

    /**
     * Teacher Manual Override: Instantly update an individual student's attendance status.
     */
    public function manualUpdateRecord(Request $request, int $batchId): RedirectResponse
    {
        $batch = auth()->user()->batches()->findOrFail($batchId);

        $validated = $request->validate([
            'session_id' => 'required|exists:attendance_sessions,id',
            'student_profile_id' => 'required|exists:student_profiles,id',
            'status' => 'required|in:present,absent,late,leave',
        ]);

        ClassAttendance::updateOrCreate(
            [
                'attendance_session_id' => $validated['session_id'],
                'student_profile_id' => $validated['student_profile_id'],
            ],
            [
                'status' => $validated['status'],
                'method' => 'manual',
                'marked_at' => now(),
            ]
        );

        return redirect()->back()->with('success', 'Attendance record updated manually.');
    }

    /**
     * Close the active attendance session.
     */
    public function closeSession(int $sessionId): RedirectResponse
    {
        $session = AttendanceSession::where('user_id', auth()->id())->findOrFail($sessionId);
        $session->update([
            'status' => 'closed',
            'end_time' => now()->format('H:i:s'),
        ]);

        return redirect()->back()->with('success', 'Attendance session closed.');
    }

    /**
     * Store bulk classroom attendance records for a batch session.
     */
    public function store(Request $request, int $batchId): RedirectResponse
    {
        $batch = auth()->user()->batches()->findOrFail($batchId);

        $validated = $request->validate([
            'session_date' => 'required|date',
            'start_time' => 'nullable|string',
            'end_time' => 'nullable|string',
            'subject_id' => 'nullable|exists:subjects,id',
            'location_name' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'radius_meters' => 'nullable|integer',
            'attendances' => 'required|array|min:1',
            'attendances.*.student_profile_id' => 'required|exists:student_profiles,id',
            'attendances.*.status' => 'required|in:present,absent,late,leave',
            'attendances.*.late_minutes' => 'nullable|integer|min:0',
        ]);

        $session = AttendanceSession::create([
            'batch_id' => $batch->id,
            'user_id' => auth()->id(),
            'subject_id' => $validated['subject_id'] ?? null,
            'location_name' => $validated['location_name'] ?? 'Classroom / Lab',
            'latitude' => $validated['latitude'] ?? 28.4212,
            'longitude' => $validated['longitude'] ?? 70.3023,
            'radius_meters' => $validated['radius_meters'] ?? 150,
            'session_date' => $validated['session_date'],
            'start_time' => $validated['start_time'] ?? now()->format('H:i:s'),
            'end_time' => $validated['end_time'] ?? null,
            'status' => 'closed',
        ]);

        foreach ($validated['attendances'] as $att) {
            ClassAttendance::create([
                'attendance_session_id' => $session->id,
                'student_profile_id' => $att['student_profile_id'],
                'status' => $att['status'],
                'method' => 'manual',
                'late_minutes' => $att['status'] === 'late' ? intval($att['late_minutes'] ?? 0) : 0,
                'marked_at' => now(),
            ]);
        }

        return redirect()->route('teacher.dashboard')->with('success', 'Classroom attendance for ' . $batch->name . ' saved successfully.');
    }

    /**
     * Generate or regenerate a 4-digit class PIN for mobile self-attendance.
     */
    public function generatePin(int $sessionId): RedirectResponse
    {
        $session = AttendanceSession::findOrFail($sessionId);

        // Verify the authenticated instructor is assigned to this batch or created the session
        $isAssigned = auth()->user()->batches()->where('batches.id', $session->batch_id)->exists()
            || $session->user_id === auth()->id()
            || auth()->user()->hasRole(['super-admin', 'principal']);

        if (!$isAssigned) {
            abort(403, 'Unauthorized to generate class PIN for this batch.');
        }

        $pin = (string) random_int(1000, 9999);

        $session->update([
            'daily_pin' => $pin,
        ]);

        return redirect()->back()->with('success', "Mobile Self-Attendance PIN: {$pin} has been generated. Students can now enter this PIN on their phones to mark attendance.");
    }

    /**
     * Generate or regenerate a daily 4-digit class PIN directly for an assigned batch.
     */
    public function generateBatchPin(int $batchId): RedirectResponse
    {
        $batch = auth()->user()->batches()->findOrFail($batchId);
        $today = today();

        $session = AttendanceSession::firstOrCreate(
            [
                'batch_id' => $batch->id,
                'session_date' => $today,
            ],
            [
                'user_id' => auth()->id(),
                'location_name' => 'Computer Lab 1 & 2 (IT Wing)',
                'latitude' => 28.4212,
                'longitude' => 70.3023,
                'radius_meters' => 150,
                'is_geofence_active' => true,
                'start_time' => now()->format('H:i:s'),
                'status' => 'active',
            ]
        );

        $pin = (string) random_int(1000, 9999);

        $session->update([
            'daily_pin' => $pin,
            'status' => 'active',
        ]);

        return redirect()->back()->with('success', "Daily Class PIN: {$pin} generated for {$batch->name}. Write or display this code on the board for trainees.");
    }

    /**
     * Teacher updates / calibrates the classroom geofence zone and radius for today's session.
     */
    public function updateSessionZone(Request $request, int $batchId): RedirectResponse
    {
        $batch = auth()->user()->batches()->findOrFail($batchId);
        $today = today();

        $validated = $request->validate([
            'location_name' => 'required|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius_meters' => 'required|integer|min:20|max:1000',
        ]);

        $session = AttendanceSession::firstOrCreate(
            [
                'batch_id' => $batch->id,
                'session_date' => $today,
            ],
            [
                'user_id' => auth()->id(),
                'start_time' => now()->format('H:i:s'),
                'status' => 'active',
            ]
        );

        $session->update([
            'location_name' => $validated['location_name'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'radius_meters' => $validated['radius_meters'],
            'is_geofence_active' => true,
        ]);

        return redirect()->back()->with('success', "Classroom location set to {$session->location_name} ({$session->radius_meters}m boundary). Students must be within this area.");
    }

    /**
     * Teacher confirms and finalizes student attendance (single or bulk confirm).
     */
    public function confirmAttendance(Request $request, int $batchId): RedirectResponse
    {
        $batch = auth()->user()->batches()->findOrFail($batchId);
        $today = today();

        $session = AttendanceSession::where('batch_id', $batch->id)
            ->whereDate('session_date', $today)
            ->latest()
            ->firstOrFail();

        $attendanceId = $request->input('attendance_id');

        if ($attendanceId) {
            $record = $session->classAttendances()->findOrFail($attendanceId);
            $record->update([
                'is_confirmed_by_teacher' => true,
                'teacher_confirmed_at' => now(),
                'confirmed_by_user_id' => auth()->id(),
                'status' => 'present',
            ]);
            $studentName = $record->studentProfile?->user?->name ?? 'Trainee';
            return redirect()->back()->with('success', "✓ Attendance confirmed for {$studentName}.");
        } else {
            $count = $session->classAttendances()
                ->where('is_confirmed_by_teacher', false)
                ->update([
                    'is_confirmed_by_teacher' => true,
                    'teacher_confirmed_at' => now(),
                    'confirmed_by_user_id' => auth()->id(),
                    'status' => 'present',
                ]);

            return redirect()->back()->with('success', "✓ Officially confirmed and locked attendance for {$count} trainees in {$batch->name}.");
        }
    }
}
