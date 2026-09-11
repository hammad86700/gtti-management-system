<?php

namespace App\Http\Controllers\Student;

use App\Domains\Organization\Models\Timetable;
use App\Domains\Student\Models\Enrollment;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class StudentTimetableController extends Controller
{
    /**
     * Display the active enrolled student's personal class & lab timetable.
     * Restricted strictly to active enrolled trainees.
     */
    public function index(): Response
    {
        $user = auth()->user();
        $studentProfile = $user->studentProfile;

        // Get student active enrollments
        $activeEnrollment = $studentProfile
            ? Enrollment::with(['course', 'batch'])
                ->where('student_profile_id', $studentProfile->id)
                ->whereIn('status', ['enrolled', 'active'])
                ->latest()
                ->first()
            : null;

        $timetables = collect([]);

        if ($activeEnrollment) {
            $courseId = $activeEnrollment->course_id;
            $shift = strtolower($activeEnrollment->shift ?? $activeEnrollment->batch?->shift ?? 'morning');

            $timetables = Timetable::with(['teacher', 'department'])
                ->active()
                ->where('course_id', $courseId)
                ->where(function ($q) use ($shift) {
                    $q->where('shift', $shift)
                      ->orWhere('shift', 'both');
                })
                ->orderByRaw("CASE day_of_week WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 WHEN 'Sunday' THEN 7 ELSE 8 END")
                ->orderBy('start_time', 'asc')
                ->get();
        }

        return Inertia::render('Student/Timetable/Index', [
            'activeEnrollment' => $activeEnrollment,
            'timetables' => $timetables,
        ]);
    }
}
