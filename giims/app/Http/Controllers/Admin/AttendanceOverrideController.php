<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Attendance\Models\ClassAttendance;
use App\Domains\Operations\Models\ActivityLog;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AttendanceOverrideController extends Controller
{
    /**
     * Override an attendance log marked by a teacher (e.g. administrative leave granted).
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            "attendance_id" => "required|exists:class_attendances,id",
            "status" => "required|in:present,absent,late,leave",
            "remarks" => "required|string|max:500",
        ]);

        $attendance = ClassAttendance::with("enrollment.studentProfile.user")->findOrFail($validated["attendance_id"]);
        $previousStatus = $attendance->status;

        $attendance->update([
            "status" => $validated["status"],
            "remarks" => $validated["remarks"] . " [Overridden by " . auth()->user()->name . "]",
        ]);

        ActivityLog::create([
            "user_id" => auth()->id(),
            "action" => "overridden",
            "model_type" => ClassAttendance::class,
            "model_id" => $attendance->id,
            "description" => "Attendance status overridden from '{$previousStatus}' to '{$validated["status"]}' for student '" . ($attendance->enrollment?->studentProfile?->user?->name ?? "Student") . "'. Reason: " . $validated["remarks"],
            "old_data" => ["status" => $previousStatus],
            "new_data" => ["status" => $validated["status"], "remarks" => $validated["remarks"]],
            "ip_address" => $request->ip(),
        ]);

        return redirect()->back()->with("success", "Attendance status for student successfully overridden and logged in audit trail.");
    }
}

