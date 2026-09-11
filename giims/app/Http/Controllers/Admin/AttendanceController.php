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

        $viewMode = $request->input('view', 'daily'); // 'daily' or 'monthly'
        $selectedMonth = (int) $request->input('month', now()->month);
        $selectedYear = (int) $request->input('year', now()->year);

        $monthlyData = null;
        $activeBatchId = $selectedBatchId ? intval($selectedBatchId) : $batches->first()?->id;

        if ($activeBatchId) {
            $activeBatch = Batch::with([
                'course.trade.program.department',
                'enrollments' => function ($q) {
                    $q->where('status', 'active')->with('studentProfile.user');
                },
            ])->find($activeBatchId);

            if ($activeBatch) {
                $date = \Carbon\Carbon::createFromDate($selectedYear, $selectedMonth, 1);
                $daysInMonth = $date->daysInMonth;
                $monthName = $date->format('F');

                $monthSessions = AttendanceSession::where('batch_id', $activeBatch->id)
                    ->whereYear('session_date', $selectedYear)
                    ->whereMonth('session_date', $selectedMonth)
                    ->with('classAttendances')
                    ->get()
                    ->keyBy(function ($item) {
                        return (int) $item->session_date->format('j');
                    });

                $studentProfileIds = $activeBatch->enrollments->pluck('student_profile_id')->filter();
                $startOfMonth = $date->copy()->startOfMonth();
                $endOfMonth = $date->copy()->endOfMonth();

                $leaves = \App\Domains\Student\Models\LeaveRequest::whereIn('student_profile_id', $studentProfileIds)
                    ->where('status', 'approved')
                    ->where(function ($q) use ($startOfMonth, $endOfMonth) {
                        $q->whereBetween('start_date', [$startOfMonth, $endOfMonth])
                          ->orWhereBetween('end_date', [$startOfMonth, $endOfMonth])
                          ->orWhere(function ($sub) use ($startOfMonth, $endOfMonth) {
                              $sub->where('start_date', '<=', $startOfMonth)
                                  ->where('end_date', '>=', $endOfMonth);
                          });
                    })
                    ->get();

                $daysList = [];
                for ($d = 1; $d <= $daysInMonth; $d++) {
                    $dayCarbon = \Carbon\Carbon::createFromDate($selectedYear, $selectedMonth, $d);
                    $hasSession = $monthSessions->has($d);
                    $daysList[] = [
                        'day' => $d,
                        'date' => $dayCarbon->toDateString(),
                        'day_of_week' => $dayCarbon->format('D'),
                        'is_weekend' => $dayCarbon->isWeekend(),
                        'has_session' => $hasSession,
                    ];
                }

                $studentMatrix = $activeBatch->enrollments->map(function ($enr) use ($daysInMonth, $selectedYear, $selectedMonth, $monthSessions, $leaves) {
                    $profile = $enr->studentProfile;
                    $profileId = $profile?->id;

                    $daysRecord = [];
                    $presentCount = 0;
                    $absentCount = 0;
                    $leaveCount = 0;
                    $lateCount = 0;
                    $totalMarked = 0;

                    for ($d = 1; $d <= $daysInMonth; $d++) {
                        $dayCarbon = \Carbon\Carbon::createFromDate($selectedYear, $selectedMonth, $d);
                        $session = $monthSessions->get($d);
                        $status = null;

                        if ($session) {
                            $att = $session->classAttendances->firstWhere('student_profile_id', $profileId);
                            if ($att) {
                                $status = $att->status;
                            }
                        }

                        if (!$status) {
                            $isOnLeave = $leaves->first(function ($l) use ($profileId, $dayCarbon) {
                                return $l->student_profile_id === $profileId
                                    && $dayCarbon->between($l->start_date, $l->end_date);
                            });
                            if ($isOnLeave && $session) {
                                $status = 'leave';
                            }
                        }

                        if ($status === 'present') {
                            $presentCount++;
                            $totalMarked++;
                        } elseif ($status === 'absent') {
                            $absentCount++;
                            $totalMarked++;
                        } elseif ($status === 'leave') {
                            $leaveCount++;
                            $totalMarked++;
                        } elseif ($status === 'late') {
                            $lateCount++;
                            $totalMarked++;
                        }

                        $daysRecord[$d] = $status;
                    }

                    $effectivePresents = $presentCount + ($lateCount * 0.5);
                    $percentage = $totalMarked > 0 ? round(($effectivePresents / $totalMarked) * 100, 1) : 0;

                    return [
                        'enrollment_id' => $enr->id,
                        'student_profile_id' => $profileId,
                        'enrollment_number' => $enr->enrollment_number,
                        'name' => $profile?->user?->name ?? 'Trainee',
                        'father_name' => $profile?->father_name ?? 'N/A',
                        'days' => $daysRecord,
                        'present_count' => $presentCount,
                        'absent_count' => $absentCount,
                        'leave_count' => $leaveCount,
                        'late_count' => $lateCount,
                        'total_marked' => $totalMarked,
                        'percentage' => $percentage,
                    ];
                });

                $monthlyData = [
                    'batch' => $activeBatch,
                    'month' => $selectedMonth,
                    'year' => $selectedYear,
                    'month_name' => $monthName,
                    'days_in_month' => $daysInMonth,
                    'days_list' => $daysList,
                    'student_matrix' => $studentMatrix,
                    'total_sessions' => $monthSessions->count(),
                ];
            }
        }

        return Inertia::render('Admin/Attendance/Index', [
            'sessions' => $sessions,
            'gateLogs' => $gateLogs,
            'batches' => $batches,
            'selectedDate' => $selectedDate,
            'selectedBatchId' => $selectedBatchId ? intval($selectedBatchId) : ($activeBatchId ? intval($activeBatchId) : null),
            'viewMode' => $viewMode,
            'monthlyData' => $monthlyData,
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
