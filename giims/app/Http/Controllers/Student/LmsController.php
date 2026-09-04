<?php

namespace App\Http\Controllers\Student;

use App\Domains\Academic\Models\Assignment;
use App\Domains\Academic\Models\AssignmentSubmission;
use App\Domains\Academic\Models\LessonPlan;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LmsController extends Controller
{
    /**
     * Display the enrolled student's LMS portal with lesson plans and assignments.
     */
    public function index(): Response|RedirectResponse
    {
        $profile = auth()->user()->studentProfile;

        if (!$profile) {
            return redirect()->route('dashboard')->with('error', 'Please complete your student profile first.');
        }

        $enrollment = $profile->enrollments()
            ->where('status', 'active')
            ->with(['batch.course.trade.program.department'])
            ->latest()
            ->first();

        if (!$enrollment) {
            return redirect()->route('dashboard')->with('error', 'You must be an active enrolled student to access LMS course materials.');
        }

        $lessons = LessonPlan::with('subject')
            ->where('batch_id', $enrollment->batch_id)
            ->orderBy('planned_date', 'desc')
            ->get();

        $assignments = Assignment::with([
                'subject',
                'submissions' => function ($q) use ($enrollment) {
                    $q->where('student_profile_id', $enrollment->student_profile_id);
                },
            ])
            ->where('batch_id', $enrollment->batch_id)
            ->orderBy('due_date', 'desc')
            ->get();

        return Inertia::render('Student/Lms/Index', [
            'enrollment' => $enrollment,
            'lessons' => $lessons,
            'assignments' => $assignments,
        ]);
    }

    /**
     * Submit an assignment response (text and/or file attachment).
     */
    public function submitAssignment(Request $request, int $assignmentId): RedirectResponse
    {
        $profile = auth()->user()->studentProfile;

        if (!$profile) {
            abort(403, 'Unauthorized student profile.');
        }

        $assignment = Assignment::findOrFail($assignmentId);

        $validated = $request->validate([
            'submission_text' => 'nullable|string',
            'document' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,zip,rar,jpg,jpeg,png|max:5120',
        ]);

        if (empty($validated['submission_text']) && !$request->hasFile('document')) {
            return redirect()->back()->withErrors([
                'submission_text' => 'Please provide written coursework notes or attach your assignment file.',
            ]);
        }

        $existingSubmission = AssignmentSubmission::where('assignment_id', $assignmentId)
            ->where('student_profile_id', $profile->id)
            ->first();

        $path = $request->hasFile('document')
            ? $request->file('document')->store('private/submissions', 'local')
            : $existingSubmission?->file_path;

        AssignmentSubmission::updateOrCreate(
            [
                'assignment_id' => $assignmentId,
                'student_profile_id' => $profile->id,
            ],
            [
                'submission_text' => $validated['submission_text'] ?? $existingSubmission?->submission_text,
                'file_path' => $path,
                'status' => 'submitted',
            ]
        );

        return redirect()->back()->with('success', 'Assignment submitted successfully.');
    }

    /**
     * Display the enrolled student's interactive Day-by-Day Curriculum Roadmap.
     */
    public function curriculumJourney(Request $request, ?int $day = null): Response|RedirectResponse
    {
        $profile = auth()->user()->studentProfile;

        if (!$profile) {
            return redirect()->route('dashboard')->with('error', 'Please complete your student profile first.');
        }

        $enrollment = $profile->enrollments()
            ->where('status', 'active')
            ->with(['batch.course.trade.program.department'])
            ->latest()
            ->first();

        if (!$enrollment) {
            return redirect()->route('dashboard')->with('error', 'You must be an active enrolled student to view the daily curriculum roadmap.');
        }

        $batch = $enrollment->batch;
        $course = $batch?->course;

        $lessons = \App\Domains\Academic\Models\DailyLesson::where('batch_id', $batch->id)
            ->ordered()
            ->get();

        $totalDays = max((int) ($course?->total_academic_days ?: 60), $lessons->count());
        $completedCount = $lessons->where('status', 'completed')->count();
        $progressPercent = $totalDays > 0 ? round(($completedCount / $totalDays) * 100, 1) : 0;

        // Current active day: either requested day, or the first non-completed day, or day 1
        $selectedDayNumber = $day;
        if (!$selectedDayNumber) {
            $firstPending = $lessons->where('status', '!=', 'completed')->first();
            $selectedDayNumber = $firstPending ? $firstPending->day_number : ($lessons->first()?->day_number ?? 1);
        }

        $currentLesson = $lessons->where('day_number', $selectedDayNumber)->first();

        return Inertia::render('Student/Lms/CurriculumJourney', [
            'enrollment' => $enrollment,
            'course' => $course,
            'batch' => $batch,
            'lessons' => $lessons,
            'selectedDayNumber' => (int) $selectedDayNumber,
            'currentLesson' => $currentLesson,
            'stats' => [
                'total_days' => $totalDays,
                'planned_days' => $lessons->count(),
                'completed_days' => $completedCount,
                'progress_percent' => $progressPercent,
            ],
        ]);
    }
}
