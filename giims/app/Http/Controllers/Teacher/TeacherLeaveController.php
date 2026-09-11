<?php

namespace App\Http\Controllers\Teacher;

use App\Domains\Attendance\Models\FacultyLeave;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TeacherLeaveController extends Controller
{
    /**
     * Submit a faculty leave application to the Principal / Admin Office.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'leave_type' => 'required|in:casual,medical,emergency,official_duty',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|max:2000',
            'attachment' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:3072',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $folder = 'faculty_leaves/' . Carbon::now()->format('Y-m');
            $attachmentPath = $request->file('attachment')->store($folder, 'public');
        }

        FacultyLeave::create([
            'user_id' => $request->user()->id,
            'leave_type' => $validated['leave_type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'reason' => $validated['reason'],
            'attachment_path' => $attachmentPath,
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Faculty leave application submitted successfully and sent to the Principal Office for approval.');
    }
}
