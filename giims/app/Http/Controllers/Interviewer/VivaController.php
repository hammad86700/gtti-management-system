<?php

namespace App\Http\Controllers\Interviewer;

use App\Domains\Admissions\Models\AdmissionEntranceExam;
use App\Domains\Admissions\Models\EntranceTestAttempt;
use App\Domains\Admissions\Models\InterviewQuestion;
use App\Domains\Organization\Models\Course;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class VivaController extends Controller
{
    /**
     * Display the Real-Time Multi-Interviewer Viva Waiting Queue.
     */
    public function index(Request $request, ?int $courseId = null): Response|RedirectResponse
    {
        // If courseId not provided, default to first active merit course
        if (!$courseId) {
            $firstCourse = Course::where('is_active', true)
                ->where('requires_entrance_test', true)
                ->first() ?? Course::first();

            if ($firstCourse) {
                return redirect()->route('interviewer.viva.index', ['courseId' => $firstCourse->id]);
            }
        }

        $course = Course::with('trade.program.department')->findOrFail($courseId);

        // Fetch candidate attempts who completed CBT and are in viva workflow
        $attempts = EntranceTestAttempt::whereHas('entranceExam', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            })
            ->where('status', 'completed') // completed CBT exam
            ->with(['studentProfile.user', 'application', 'evaluator', 'entranceExam'])
            ->orderByRaw("
                CASE 
                    WHEN interview_status = 'in_progress' AND evaluated_by = " . auth()->id() . " THEN 1
                    WHEN interview_status = 'waiting' THEN 2
                    WHEN interview_status = 'in_progress' THEN 3
                    ELSE 4
                END
            ")
            ->latest('submitted_at')
            ->get()
            ->map(function ($attempt) {
                $isLockedByOther = $attempt->interview_status === 'in_progress'
                    && $attempt->evaluated_by !== auth()->id()
                    && $attempt->locked_at
                    && $attempt->locked_at > now()->subMinutes(15);

                $isLockedByMe = $attempt->interview_status === 'in_progress'
                    && $attempt->evaluated_by === auth()->id();

                return [
                    'id' => $attempt->id,
                    'application_id' => $attempt->application_id,
                    'application_number' => $attempt->application?->application_number ?? 'N/A',
                    'candidate_name' => $attempt->studentProfile?->user?->name ?? 'Candidate',
                    'cnic' => $attempt->studentProfile?->user?->cnic ?? 'N/A',
                    'father_name' => $attempt->studentProfile?->father_name ?? 'N/A',
                    'matric_marks' => $attempt->matric_marks_obtained,
                    'total_matric_marks' => $attempt->total_matric_marks ?? 1100,
                    'matric_percentage' => ($attempt->total_matric_marks > 0 && $attempt->matric_marks_obtained !== null)
                        ? round(($attempt->matric_marks_obtained / $attempt->total_matric_marks) * 100, 1)
                        : null,
                    'cbt_score' => $attempt->cbt_score ?? $attempt->entrance_marks_obtained ?? 0,
                    'cbt_total' => $attempt->entranceExam?->total_marks ?? 100,
                    'interview_score' => $attempt->interview_score,
                    'interview_remarks' => $attempt->interview_remarks,
                    'interview_status' => $attempt->interview_status,
                    'composite_score' => $attempt->composite_score,
                    'is_locked_by_other' => $isLockedByOther,
                    'is_locked_by_me' => $isLockedByMe,
                    'evaluator_name' => $attempt->evaluator?->name ?? 'Staff Examiner',
                    'locked_at' => $attempt->locked_at?->toISOString(),
                ];
            });

        // Courses list for quick switcher
        $courses = Course::where('is_active', true)
            ->where('requires_entrance_test', true)
            ->with('trade')
            ->orderBy('name')
            ->get();

        return Inertia::render('Interviewer/Index', [
            'course' => $course,
            'courses' => $courses,
            'attempts' => $attempts,
            'currentUserId' => auth()->id(),
        ]);
    }

    /**
     * Atomically claim a candidate for viva evaluation using database row locking.
     */
    public function claim(int $attemptId): RedirectResponse
    {
        return DB::transaction(function () use ($attemptId) {
            /** @var EntranceTestAttempt $attempt */
            $attempt = EntranceTestAttempt::where('id', $attemptId)->lockForUpdate()->firstOrFail();

            // Concurrency Lock Check: lease period 15 minutes
            if (
                $attempt->interview_status === 'in_progress' &&
                $attempt->evaluated_by !== auth()->id() &&
                $attempt->locked_at &&
                $attempt->locked_at > now()->subMinutes(15)
            ) {
                $evaluatorName = $attempt->evaluator?->name ?? 'another examiner';
                return redirect()->back()->with(
                    'error',
                    "This candidate is currently under evaluation by {$evaluatorName}. Please choose another candidate."
                );
            }

            // Claim the candidate
            $attempt->update([
                'interview_status' => 'in_progress',
                'evaluated_by' => auth()->id(),
                'locked_at' => now(),
            ]);

            return redirect()->route('interviewer.viva.evaluate', $attempt->id);
        });
    }

    /**
     * Show the examiner's evaluation interface for the claimed candidate.
     */
    public function evaluate(int $attemptId): Response|RedirectResponse
    {
        $attempt = EntranceTestAttempt::with([
            'entranceExam.course',
            'studentProfile.user',
            'application',
            'evaluator',
        ])->findOrFail($attemptId);

        // Security check: ensure current user holds lock or lock has expired
        if (
            $attempt->interview_status === 'in_progress' &&
            $attempt->evaluated_by !== auth()->id() &&
            $attempt->locked_at &&
            $attempt->locked_at > now()->subMinutes(15)
        ) {
            return redirect()->route('interviewer.viva.index', $attempt->entranceExam?->course_id)
                ->with('error', 'This candidate is already locked by another examiner.');
        }

        // Refresh lock timestamp for active interviewer
        $attempt->update([
            'interview_status' => 'in_progress',
            'evaluated_by' => auth()->id(),
            'locked_at' => now(),
        ]);

        $course = $attempt->entranceExam?->course;

        // Fetch course interview questions (3 to 5 randomly chosen)
        $questions = InterviewQuestion::where('course_id', $course?->id)
            ->inRandomOrder()
            ->take(5)
            ->get();

        // If no questions seeded yet for this course, supply standard vocational viva questions
        if ($questions->isEmpty()) {
            $defaultQuestions = [
                'Why did you choose this technical trade at GTTI?',
                'Describe any previous practical, hands-on, or academic experience related to this field.',
                'How do you plan to utilize this professional certification after graduation?',
                'Explain basic workshop safety procedures and personal protective equipment (PPE).',
            ];
            $questions = collect($defaultQuestions)->map(fn ($q, $idx) => (object) ['id' => $idx + 1, 'question_text' => $q]);
        }

        $matricObt = $attempt->matric_marks_obtained;
        $matricTot = $attempt->total_matric_marks ?? 1100;
        $matricPct = ($matricTot > 0 && $matricObt !== null) ? round(($matricObt / $matricTot) * 100, 1) : null;

        return Inertia::render('Interviewer/Evaluate', [
            'attempt' => [
                'id' => $attempt->id,
                'application_number' => $attempt->application?->application_number ?? 'N/A',
                'interview_status' => $attempt->interview_status,
                'interview_score' => $attempt->interview_score,
                'interview_remarks' => $attempt->interview_remarks,
            ],
            'candidate' => [
                'name' => $attempt->studentProfile?->user?->name ?? 'Candidate',
                'father_name' => $attempt->studentProfile?->father_name ?? 'N/A',
                'cnic' => $attempt->studentProfile?->user?->cnic ?? 'N/A',
                'matric_marks' => $matricObt,
                'total_matric_marks' => $matricTot,
                'matric_percentage' => $matricPct,
                'cbt_score' => $attempt->cbt_score ?? $attempt->entrance_marks_obtained ?? 0,
                'cbt_total' => $attempt->entranceExam?->total_marks ?? 100,
            ],
            'course' => [
                'id' => $course?->id,
                'name' => $course?->name,
                'interview_max_marks' => $course?->interview_max_marks ?? 10,
                'interview_weightage' => $course?->interview_weightage ?? 10,
                'matric_weightage' => $course?->matric_weightage ?? 50,
                'test_weightage' => $course?->test_weightage ?? 40,
                'interview_venue' => $course?->interview_venue ?: 'Lab 3 / Interview Room',
            ],
            'questions' => $questions,
        ]);
    }

    /**
     * Submit viva evaluation marks, calculate composite score, and unlock record.
     */
    public function submitEvaluation(Request $request, int $attemptId): RedirectResponse
    {
        $attempt = EntranceTestAttempt::with(['entranceExam.course', 'application'])->findOrFail($attemptId);
        $course = $attempt->entranceExam?->course;
        $maxMarks = $course?->interview_max_marks ?? 10;

        $validated = $request->validate([
            'interview_score' => "required|numeric|min:0|max:{$maxMarks}",
            'interview_remarks' => 'nullable|string|max:1000',
        ]);

        $attempt->update([
            'interview_score' => $validated['interview_score'],
            'interview_remarks' => $validated['interview_remarks'] ?? null,
            'interview_status' => 'completed',
            'locked_at' => null, // unlock
        ]);

        // Calculate and save final composite merit score
        $compositeScore = $attempt->calculateCompositeScore();
        $attempt->update([
            'composite_score' => $compositeScore,
            'composite_merit_score' => $compositeScore,
        ]);

        if ($attempt->application) {
            $attempt->application->update([
                'merit_score' => $compositeScore,
            ]);
        }

        if (function_exists('activity')) {
            activity()
                ->causedBy(auth()->user())
                ->performedOn($attempt)
                ->log("Examiner awarded {$validated['interview_score']}/{$maxMarks} in viva voce to candidate '{$attempt->studentProfile?->user?->name}'. Composite Score: {$compositeScore}%");
        }

        return redirect()->route('interviewer.viva.index', $course?->id)
            ->with('success', "Evaluation completed for candidate. Final Composite Merit Score: {$compositeScore}%.");
    }
}
