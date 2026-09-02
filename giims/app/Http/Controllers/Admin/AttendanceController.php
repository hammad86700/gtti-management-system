<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Attendance\Models\AttendanceSession;
use App\Domains\Attendance\Models\ClassAttendance;
use App\Domains\Attendance\Models\GateLog;
use App\Domains\Organization\Models\Batch;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    /**
     * Display centralized institutional attendance oversight dashboard for Administration.
     */
    public function index(Request $request): Response
    {
        $selectedDate = $request->input('date', today()->toDateString());
        $selectedBatchId = $request->input('batch_id');

        $query = AttendanceSession::with([
            'batch.course.trade',
            'user',
            'subject',
            'classAttendances.studentProfile.user',
        ])
        ->whereDate('session_date', $selectedDate);

        if ($selectedBatchId) {
            $query->where('batch_id', $selectedBatchId);
        }

        $sessions = $query->latest()->get();

        // Calculate institutional stats for the selected date
        $allAttendances = ClassAttendance::whereHas('attendanceSession', function ($q) use ($selectedDate, $selectedBatchId) {
            $q->whereDate('session_date', $selectedDate);
            if ($selectedBatchId) {
                $q->where('batch_id', $selectedBatchId);
            }
        })->get();

        $totalMarked = $allAttendances->count();
        $presentCount = $allAttendances->where('status', 'present')->count();
        $gpsCount = $allAttendances->where('method', 'gps')->count();
        $manualCount = $allAttendances->where('method', 'manual')->count();
        $absentCount = $allAttendances->where('status', 'absent')->count();
        $lateCount = $allAttendances->where('status', 'late')->count();

        // Campus Gate RFID entry logs for today
        $gateLogs = GateLog::with('studentProfile.user')
            ->whereDate('logged_at', $selectedDate)
            ->latest('logged_at')
            ->take(15)
            ->get();

        $batches = Batch::with('course')->get();

        return Inertia::render('Admin/Attendance/Index', [
            'sessions' => $sessions,
            'gateLogs' => $gateLogs,
            'batches' => $batches,
            'selectedDate' => $selectedDate,
            'selectedBatchId' => $selectedBatchId ? intval($selectedBatchId) : null,
            'stats' => [
                'total_marked' => $totalMarked,
                'present_count' => $presentCount,
                'gps_count' => $gpsCount,
                'manual_count' => $manualCount,
                'absent_count' => $absentCount,
                'late_count' => $lateCount,
                'attendance_rate' => $totalMarked > 0 ? round(($presentCount / $totalMarked) * 100, 1) : 0,
            ],
        ]);
    }
}
