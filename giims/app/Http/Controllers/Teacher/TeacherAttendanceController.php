<?php

namespace App\Http\Controllers\Teacher;

use App\Domains\Attendance\Models\FacultyAttendance;
use App\Domains\Attendance\Models\FacultyLeave;
use App\Domains\Attendance\Services\CampusNetworkService;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TeacherAttendanceController extends Controller
{
    /**
     * Display the teacher's self-attendance and leave summary cockpit.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();

        // 1. Check if attendance already recorded today
        $todayAttendance = FacultyAttendance::where('user_id', $user->id)
            ->where('attendance_date', $today)
            ->first();

        // 2. Monthly attendance summary
        $monthStart = Carbon::now()->startOfMonth()->toDateString();
        $monthEnd = Carbon::now()->endOfMonth()->toDateString();

        $monthAttendances = FacultyAttendance::where('user_id', $user->id)
            ->whereBetween('attendance_date', [$monthStart, $monthEnd])
            ->orderBy('attendance_date', 'desc')
            ->get();

        $presentsCount = $monthAttendances->where('status', 'present')->count();
        $latesCount = $monthAttendances->where('status', 'late')->count();

        $approvedLeavesCount = FacultyLeave::where('user_id', $user->id)
            ->where('status', 'approved')
            ->where(function ($q) use ($monthStart, $monthEnd) {
                $q->whereBetween('start_date', [$monthStart, $monthEnd])
                  ->orWhereBetween('end_date', [$monthStart, $monthEnd]);
            })
            ->count();

        // Count working days so far this month (Mon-Sat, skipping Sunday)
        $workingDaysPassed = 0;
        $dayCursor = Carbon::now()->startOfMonth();
        $now = Carbon::today();
        while ($dayCursor->lessThanOrEqualTo($now)) {
            if ($dayCursor->dayOfWeek !== Carbon::SUNDAY) {
                $workingDaysPassed++;
            }
            $dayCursor->addDay();
        }

        $recordedDays = $presentsCount + $latesCount + $approvedLeavesCount;
        $unexcusedAbsents = max(0, $workingDaysPassed - $recordedDays);

        // 3. Teacher's recent leave applications
        $recentLeaves = FacultyLeave::where('user_id', $user->id)
            ->latest()
            ->take(15)
            ->get();

        // 4. IP address & Campus subnet verification status
        $clientIp = $request->ip();
        $isCampusIp = CampusNetworkService::isCampusIp($clientIp);

        return Inertia::render('Teacher/Attendance/SelfAttendance', [
            'todayAttendance' => $todayAttendance,
            'monthAttendances' => $monthAttendances,
            'summary' => [
                'presents' => $presentsCount,
                'lates' => $latesCount,
                'total_attended' => $presentsCount + $latesCount,
                'approved_leaves' => $approvedLeavesCount,
                'unexcused_absents' => $unexcusedAbsents,
                'working_days_passed' => $workingDaysPassed,
            ],
            'recentLeaves' => $recentLeaves,
            'clientIp' => $clientIp,
            'isCampusIp' => $isCampusIp,
            'currentTime' => Carbon::now()->format('h:i A'),
            'currentDate' => Carbon::today()->format('D, M d, Y'),
            'lateCutoff' => config('services.campus.late_time', '08:30'),
        ]);
    }

    /**
     * Record daily teacher self-attendance with mandatory classroom/lab proof photo.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'proof_image' => 'required|image|mimes:jpeg,png,jpg|max:4096',
            'remarks' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        $today = Carbon::today()->toDateString();

        // Ensure no duplicate submission on the same calendar day
        $existing = FacultyAttendance::where('user_id', $user->id)
            ->where('attendance_date', $today)
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'proof_image' => 'Daily attendance has already been recorded for today.',
            ]);
        }

        $clientIp = $request->ip() ?: '127.0.0.1';
        $isCampusVerified = CampusNetworkService::isCampusIp($clientIp);

        $now = Carbon::now();
        $checkInTime = $now->format('H:i:s');
        $isLate = CampusNetworkService::isLate($checkInTime);
        $status = $isLate ? 'late' : 'present';

        // Store proof photo securely in public disk
        $folder = 'faculty_proofs/' . $now->format('Y-m');
        $path = $request->file('proof_image')->store($folder, 'public');

        FacultyAttendance::create([
            'user_id' => $user->id,
            'attendance_date' => $today,
            'check_in_time' => $checkInTime,
            'proof_image_path' => $path,
            'ip_address' => $clientIp,
            'is_ip_verified' => $isCampusVerified,
            'status' => $status,
            'remarks' => $validated['remarks'] ?? null,
        ]);

        $statusLabel = $status === 'late' ? 'Late Arrival' : 'Present';
        $ipNote = $isCampusVerified ? 'Campus Intranet Verified' : 'Remote/Off-Campus Detected';

        return redirect()->back()->with('success', "Daily attendance successfully recorded at {$now->format('h:i A')} ({$statusLabel}, {$ipNote}).");
    }
}
