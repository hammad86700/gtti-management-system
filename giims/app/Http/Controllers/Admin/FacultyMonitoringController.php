<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Attendance\Models\FacultyAttendance;
use App\Domains\Attendance\Models\FacultyLeave;
use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FacultyMonitoringController extends Controller
{
    /**
     * Display the Principal's daily faculty attendance roster and leave approval desk.
     */
    public function dailyRoster(Request $request): Response
    {
        $rawDate = $request->input('date', Carbon::today()->toDateString());
        try {
            $selectedDate = Carbon::parse($rawDate)->toDateString();
        } catch (\Throwable $e) {
            $selectedDate = Carbon::today()->toDateString();
        }

        // 1. Fetch all faculty members (teachers / instructors)
        $facultyMembers = User::whereHas('roles', function ($q) {
                $q->whereIn('slug', ['teacher', 'instructor', 'faculty', 'trade-incharge']);
            })
            ->with([
                'batches.course.trade.program.department',
                'facultyAttendances' => function ($q) use ($selectedDate) {
                    $q->where('attendance_date', $selectedDate);
                },
                'facultyLeaves' => function ($q) use ($selectedDate) {
                    $q->where('status', 'approved')
                      ->where('start_date', '<=', $selectedDate)
                      ->where('end_date', '>=', $selectedDate);
                },
            ])
            ->orderBy('name', 'asc')
            ->get();

        // 2. Build daily roster with status determination
        $roster = $facultyMembers->map(function ($teacher) use ($selectedDate) {
            $attendance = $teacher->facultyAttendances->first();
            $approvedLeave = $teacher->facultyLeaves->first();

            // Determine primary trade / department
            $trade = $teacher->batches->first()?->course?->trade?->name;
            $dept = $teacher->batches->first()?->course?->trade?->program?->department?->name;
            $deptOrTrade = $trade ? ($dept ? "{$trade} ({$dept})" : $trade) : 'Vocational Faculty';

            // Determine status
            $status = 'Unexcused Absent';
            if ($approvedLeave) {
                $status = 'On Leave';
            } elseif ($attendance) {
                $status = $attendance->status === 'late' ? 'Late' : 'Present';
            }

            return [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'email' => $teacher->email,
                'phone' => $teacher->phone,
                'department' => $deptOrTrade,
                'check_in_time' => $attendance?->check_in_time ? Carbon::parse($attendance->check_in_time)->format('h:i A') : null,
                'status' => $status,
                'is_ip_verified' => $attendance ? (bool) $attendance->is_ip_verified : null,
                'ip_address' => $attendance?->ip_address,
                'proof_image_url' => $attendance?->proof_image_url,
                'remarks' => $attendance?->remarks,
                'attendance_id' => $attendance?->id,
                'leave_info' => $approvedLeave ? [
                    'type' => ucfirst(str_replace('_', ' ', $approvedLeave->leave_type)),
                    'reason' => $approvedLeave->reason,
                    'start_date' => $approvedLeave->start_date->format('Y-m-d'),
                    'end_date' => $approvedLeave->end_date->format('Y-m-d'),
                ] : null,
            ];
        });

        // 3. Calculate summary metrics
        $totalFaculty = $roster->count();
        $presentsCount = $roster->where('status', 'Present')->count();
        $lateCount = $roster->where('status', 'Late')->count();
        $presentToday = $presentsCount + $lateCount;
        $onLeave = $roster->where('status', 'On Leave')->count();
        $unexcusedAbsent = $roster->where('status', 'Unexcused Absent')->count();

        // 4. Pending Faculty Leave Requests Queue
        $pendingLeaves = FacultyLeave::with('user')
            ->where('status', 'pending')
            ->latest()
            ->get()
            ->map(function ($leave) {
                return [
                    'id' => $leave->id,
                    'user_id' => $leave->user_id,
                    'teacher_name' => $leave->user?->name ?? 'Faculty Member',
                    'teacher_email' => $leave->user?->email,
                    'leave_type' => $leave->leave_type,
                    'leave_type_label' => ucfirst(str_replace('_', ' ', $leave->leave_type)),
                    'start_date' => $leave->start_date->format('Y-m-d'),
                    'end_date' => $leave->end_date->format('Y-m-d'),
                    'duration_days' => $leave->start_date->diffInDays($leave->end_date) + 1,
                    'reason' => $leave->reason,
                    'attachment_url' => $leave->attachment_url,
                    'status' => $leave->status,
                    'created_at' => $leave->created_at?->format('M d, Y h:i A'),
                ];
            });

        return Inertia::render('Admin/FacultyAttendance', [
            'roster' => $roster,
            'selectedDate' => $selectedDate,
            'isToday' => $selectedDate === Carbon::today()->toDateString(),
            'counters' => [
                'total_faculty' => $totalFaculty,
                'present_today' => $presentToday,
                'present_on_time' => $presentsCount,
                'late_count' => $lateCount,
                'on_leave' => $onLeave,
                'unexcused_absent' => $unexcusedAbsent,
                'attendance_rate' => $totalFaculty > 0 ? round(($presentToday / $totalFaculty) * 100) : 0,
            ],
            'pendingLeaves' => $pendingLeaves,
        ]);
    }

    /**
     * Principal action: Approve a faculty leave request.
     */
    public function approveLeave(FacultyLeave $leave): RedirectResponse
    {
        $leave->update([
            'status' => 'approved',
            'actioned_by' => auth()->id(),
            'actioned_at' => now(),
            'rejection_reason' => null,
        ]);

        $teacherName = $leave->user?->name ?? 'Faculty member';
        return redirect()->back()->with('success', "Leave request for {$teacherName} has been approved.");
    }

    /**
     * Principal action: Reject a faculty leave request with mandatory notes.
     */
    public function rejectLeave(Request $request, FacultyLeave $leave): RedirectResponse
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $leave->update([
            'status' => 'rejected',
            'actioned_by' => auth()->id(),
            'actioned_at' => now(),
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        $teacherName = $leave->user?->name ?? 'Faculty member';
        return redirect()->back()->with('success', "Leave request for {$teacherName} has been rejected.");
    }
}
