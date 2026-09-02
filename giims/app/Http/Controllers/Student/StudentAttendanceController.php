<?php

namespace App\Http\Controllers\Student;

use App\Domains\Attendance\Models\AttendanceSession;
use App\Domains\Attendance\Models\ClassAttendance;
use App\Domains\Attendance\Models\GateLog;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class StudentAttendanceController extends Controller
{
    /**
     * Mark student attendance using browser GPS coordinates and geofencing.
     */
    public function checkIn(Request $request): RedirectResponse
    {
        $user = auth()->user();
        $profile = $user->studentProfile;

        if (!$profile) {
            return redirect()->back()->with('error', 'Student profile required for attendance check-in.');
        }

        $enrollment = $profile->enrollments()
            ->where('status', 'active')
            ->with('batch.teachers')
            ->latest()
            ->first();

        if (!$enrollment || !$enrollment->batch_id) {
            return redirect()->back()->with('error', 'Active batch enrollment required to mark attendance.');
        }

        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'accuracy' => 'nullable|numeric',
        ]);

        $batch = $enrollment->batch;
        $today = today();

        // 1. Locate today's attendance session for this batch or create an active one
        $session = AttendanceSession::where('batch_id', $batch->id)
            ->whereDate('session_date', $today)
            ->latest()
            ->first();

        if (!$session) {
            // Auto-initialize active batch attendance session at GTTI Campus / Lab coordinates
            $teacherId = $batch->teachers->first()?->id ?? $user->id;

            $session = AttendanceSession::create([
                'batch_id' => $batch->id,
                'user_id' => $teacherId,
                'location_name' => 'Computer Lab 1 (IT Wing)',
                'latitude' => 28.4212000,
                'longitude' => 70.3023000,
                'radius_meters' => 200,
                'is_geofence_active' => true,
                'session_date' => $today,
                'start_time' => now()->format('H:i:s'),
                'status' => 'active',
            ]);
        }

        // 2. Check if student already has an attendance record for today's session
        $existingAttendance = ClassAttendance::where('attendance_session_id', $session->id)
            ->where('student_profile_id', $profile->id)
            ->first();

        if ($existingAttendance && $existingAttendance->status === 'present') {
            $timeStr = $existingAttendance->marked_at ? $existingAttendance->marked_at->format('h:i A') : 'earlier';
            return redirect()->back()->with('info', "Attendance is already marked for today at {$timeStr}.");
        }

        // 3. Geofence Distance Validation
        $centerLat = (float) ($session->latitude ?? 28.4212);
        $centerLng = (float) ($session->longitude ?? 70.3023);
        $radiusMeters = (int) ($session->radius_meters ?? 200);

        $distance = AttendanceSession::calculateDistanceMeters(
            (float) $validated['latitude'],
            (float) $validated['longitude'],
            $centerLat,
            $centerLng
        );

        // Allow a slight tolerance if geofence is active
        if ($session->is_geofence_active && $distance > $radiusMeters) {
            return redirect()->back()->with('error', "Geofence Verification Failed: You are {$distance}m away from {$session->location_name}. Maximum allowed boundary is {$radiusMeters}m. Please ensure you are inside the classroom/lab before checking in.");
        }

        // 4. Mark or update attendance as present with GPS verification
        ClassAttendance::updateOrCreate(
            [
                'attendance_session_id' => $session->id,
                'student_profile_id' => $profile->id,
            ],
            [
                'status' => 'present',
                'method' => 'gps',
                'student_lat' => $validated['latitude'],
                'student_lng' => $validated['longitude'],
                'distance_meters' => $distance,
                'device_info' => $request->userAgent(),
                'marked_at' => now(),
            ]
        );

        // 5. Also log campus gate presence if not recorded today
        $gateLoggedToday = GateLog::where('student_profile_id', $profile->id)
            ->whereDate('logged_at', $today)
            ->exists();

        if (!$gateLoggedToday) {
            GateLog::create([
                'student_profile_id' => $profile->id,
                'user_id' => $session->user_id,
                'gate_name' => 'Campus GPS Check-In',
                'type' => 'entry',
                'logged_at' => now(),
            ]);
        }

        return redirect()->back()->with('success', "Attendance marked successfully! GPS Verified at {$session->location_name} ({$distance}m away).");
    }

    /**
     * Mark student attendance using classroom 4-digit daily PIN.
     */
    public function markSelfAttendance(Request $request): RedirectResponse
    {
        $user = auth()->user();
        $profile = $user->studentProfile;

        if (!$profile) {
            return redirect()->back()->with('error', 'Student profile required for attendance.');
        }

        $enrollment = $profile->enrollments()
            ->where('status', 'active')
            ->with('batch')
            ->latest()
            ->first();

        if (!$enrollment || !$enrollment->batch_id) {
            return redirect()->back()->with('error', 'Active batch enrollment required to mark attendance.');
        }

        $validated = $request->validate([
            'pin' => 'required|string|size:4',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'accuracy' => 'nullable|numeric',
        ]);

        $batch = $enrollment->batch;
        $today = today();

        // 1. Locate today's active session with a generated daily_pin for this batch
        $session = AttendanceSession::where('batch_id', $batch->id)
            ->whereDate('session_date', $today)
            ->where('status', 'active')
            ->latest()
            ->first();

        if (!$session || empty($session->daily_pin)) {
            return redirect()->back()->with('error', 'No active attendance session with a class PIN found for your batch today. Please ask your instructor to generate the class PIN.');
        }

        // 2. Validate exact PIN match against board PIN
        if (trim($session->daily_pin) !== trim($validated['pin'])) {
            return redirect()->back()->with('error', 'Incorrect PIN! The 4-digit code does not match the PIN on the classroom board.');
        }

        // 3. GPS Geofence boundary verification if coordinates provided
        $distance = null;
        if (isset($validated['latitude']) && isset($validated['longitude'])) {
            $centerLat = (float) ($session->latitude ?? 28.4212);
            $centerLng = (float) ($session->longitude ?? 70.3023);
            $radius = (int) ($session->radius_meters ?? 150);

            $distance = AttendanceSession::calculateDistanceMeters(
                (float) $validated['latitude'],
                (float) $validated['longitude'],
                $centerLat,
                $centerLng
            );

            if ($session->is_geofence_active && $distance > $radius) {
                return redirect()->back()->with('error', "Location Verification Failed: You are {$distance}m away from {$session->location_name}. Maximum allowed boundary is {$radius}m. You must be inside the classroom to check in.");
            }
        }

        // 4. Check if already marked present
        $existing = ClassAttendance::where('attendance_session_id', $session->id)
            ->where('student_profile_id', $profile->id)
            ->first();

        if ($existing && $existing->status === 'present') {
            $timeStr = $existing->marked_at ? $existing->marked_at->format('h:i A') : 'earlier today';
            return redirect()->back()->with('info', "You are already marked Present for today ({$timeStr}).");
        }

        // 5. Mark attendance present via PIN & GPS
        ClassAttendance::updateOrCreate(
            [
                'attendance_session_id' => $session->id,
                'student_profile_id' => $profile->id,
            ],
            [
                'status' => 'present',
                'method' => $distance !== null ? 'pin_gps' : 'pin',
                'student_lat' => $validated['latitude'] ?? null,
                'student_lng' => $validated['longitude'] ?? null,
                'distance_meters' => $distance,
                'is_confirmed_by_teacher' => false,
                'device_info' => substr($request->userAgent() ?? 'Mobile Web App', 0, 255),
                'marked_at' => now(),
            ]
        );

        // 6. Also log campus gate presence if not recorded today
        $gateLoggedToday = GateLog::where('student_profile_id', $profile->id)
            ->whereDate('logged_at', $today)
            ->exists();

        if (!$gateLoggedToday) {
            GateLog::create([
                'student_profile_id' => $profile->id,
                'user_id' => $session->user_id,
                'gate_name' => 'Mobile PIN Self-Attendance',
                'type' => 'entry',
                'logged_at' => now(),
            ]);
        }

        $locNote = $distance !== null ? " ({$distance}m inside {$session->location_name})" : "";
        return redirect()->back()->with('success', "✓ Class PIN verified{$locNote}! Your check-in is recorded and awaiting instructor confirmation.");
    }
}
