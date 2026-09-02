<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Operations\Models\DisciplineRecord;
use App\Domains\Student\Models\StudentProfile;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DisciplineController extends Controller
{
    /**
     * Display all student disciplinary incident reports and resolution workflow.
     */
    public function index(): Response
    {
        $records = DisciplineRecord::with([
                'studentProfile.user',
                'studentProfile.enrollments' => function ($query) {
                    $query->where('status', 'active')->with(['course', 'batch']);
                },
                'reporter',
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        $students = StudentProfile::with([
                'user',
                'enrollments' => function ($query) {
                    $query->where('status', 'active')->with(['course', 'batch']);
                },
            ])
            ->whereHas('enrollments', function ($q) {
                $q->where('status', 'active');
            })
            ->get();

        return Inertia::render('Admin/Discipline/Index', [
            'records' => $records,
            'students' => $students,
        ]);
    }

    /**
     * Report and log a new disciplinary incident against a student.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_profile_id' => 'required|exists:student_profiles,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:2000',
            'severity' => 'required|in:minor,major,critical',
        ]);

        DisciplineRecord::create([
            'student_profile_id' => $validated['student_profile_id'],
            'reported_by' => auth()->id(),
            'title' => $validated['title'],
            'description' => $validated['description'],
            'severity' => $validated['severity'],
            'status' => 'open',
        ]);

        return redirect()->back()->with('success', 'Disciplinary incident reported and logged successfully.');
    }

    /**
     * Record administrative action and mark incident as resolved.
     */
    public function resolve(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'action_taken' => 'required|string|max:1000',
        ]);

        $record = DisciplineRecord::findOrFail($id);

        $record->update([
            'action_taken' => $validated['action_taken'],
            'status' => 'resolved',
        ]);

        return redirect()->back()->with('success', 'Disciplinary incident marked as resolved.');
    }
}
