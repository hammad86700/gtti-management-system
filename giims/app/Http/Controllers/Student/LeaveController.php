<?php

namespace App\Http\Controllers\Student;

use App\Domains\Student\Models\LeaveRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaveController extends Controller
{
    /**
     * Display student's formal leave application history.
     */
    public function index(): Response
    {
        $profile = auth()->user()->studentProfile;
        $leaves = $profile
            ? $profile->leaveRequests()->with('approvedBy')->latest()->get()
            : [];

        return Inertia::render('Student/Leave/Index', [
            'leaves' => $leaves,
            'profile' => $profile,
        ]);
    }

    /**
     * Store a new formal leave request from the student.
     */
    public function store(Request $request): RedirectResponse
    {
        $profile = auth()->user()->studentProfile;

        if (!$profile) {
            return redirect()->route('student.profile.edit')
                ->with('error', 'Please complete your student profile before applying for leave.');
        }

        $validated = $request->validate([
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'category' => 'nullable|string|max:100',
            'reason' => 'required|string|max:1000',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:5120',
        ]);

        $filePath = null;
        if ($request->hasFile('document')) {
            $filePath = $request->file('document')->store('private/leaves');
        }

        $leave = LeaveRequest::create([
            'student_profile_id' => $profile->id,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'category' => $validated['category'] ?? 'General',
            'reason' => $validated['reason'],
            'file_path' => $filePath,
            'status' => 'pending',
        ]);

        // Trigger notification to parents
        \App\Domains\Student\Events\LeaveRequested::dispatch($leave);

        return redirect()->back()->with('success', 'Your formal leave request has been submitted for instructor review.');
    }
}
