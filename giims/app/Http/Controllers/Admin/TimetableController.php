<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Identity\Models\User;
use App\Domains\Organization\Models\Batch;
use App\Domains\Organization\Models\Course;
use App\Domains\Organization\Models\Department;
use App\Domains\Organization\Models\Timetable;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TimetableController extends Controller
{
    /**
     * Display the Executive College Timetable Management Desk.
     * Provides dual synchronized views:
     * 1) Faculty / Teachers' Timetable (Separate view by instructor)
     * 2) Trades & Courses Timetable (Separate view by trade/course & shift)
     */
    public function index(): Response
    {
        $timetables = Timetable::with([
                'department',
                'course',
                'batch',
                'teacher',
            ])
            ->active()
            ->orderByRaw("CASE day_of_week WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 WHEN 'Sunday' THEN 7 ELSE 8 END")
            ->orderBy('start_time', 'asc')
            ->get();

        $departments = Department::where('is_active', true)->get();
        $courses = Course::where('is_published', true)->where('is_active', true)->get();
        $batches = Batch::all();

        // All teachers / instructors
        $teachers = User::whereHas('roles', function ($q) {
            $q->whereIn('slug', ['teacher', 'instructor', 'trade-incharge']);
        })->orderBy('name')->get();

        return Inertia::render('Admin/Timetable/Index', [
            'timetables' => $timetables,
            'departments' => $departments,
            'courses' => $courses,
            'batches' => $batches,
            'teachers' => $teachers,
        ]);
    }

    /**
     * Create a new timetable slot for teacher and course schedule.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'course_id' => 'required|exists:courses,id',
            'batch_id' => 'nullable|exists:batches,id',
            'shift' => 'required|in:morning,evening,both',
            'teacher_id' => 'required|exists:users,id',
            'subject_name' => 'required|string|max:150',
            'day_of_week' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room_or_lab' => 'required|string|max:100',
        ]);

        Timetable::create([
            ...$validated,
            'created_by' => auth()->id(),
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Timetable slot created successfully.');
    }

    /**
     * Update an existing timetable slot.
     */
    public function update(Request $request, Timetable $timetable): RedirectResponse
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'course_id' => 'required|exists:courses,id',
            'batch_id' => 'nullable|exists:batches,id',
            'shift' => 'required|in:morning,evening,both',
            'teacher_id' => 'required|exists:users,id',
            'subject_name' => 'required|string|max:150',
            'day_of_week' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room_or_lab' => 'required|string|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        $timetable->update([
            ...$validated,
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : $timetable->is_active,
        ]);

        return redirect()->back()->with('success', 'Timetable slot updated successfully.');
    }

    /**
     * Remove a timetable schedule slot.
     */
    public function destroy(Timetable $timetable): RedirectResponse
    {
        $timetable->delete();

        return redirect()->back()->with('success', 'Timetable slot removed successfully.');
    }
}
