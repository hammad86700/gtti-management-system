<?php

namespace App\Http\Controllers\Teacher;

use App\Domains\Admissions\Models\AdmissionEntranceExam;
use App\Domains\Admissions\Models\EntranceTestAttempt;
use App\Domains\Organization\Models\Course;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdmissionMeritController extends Controller
{
    /**
     * Display the Admission Merit Desk with Cutoff Seat Selector.
     */
    public function index(Request $request, ?int $courseId = null): Response|RedirectResponse
    {
        if (!$courseId) {
            $firstCourse = Course::where('is_active', true)
                ->where('requires_entrance_test', true)
                ->first() ?? Course::first();

            if ($firstCourse) {
                return redirect()->route('teacher.merit-desk.index', ['courseId' => $firstCourse->id]);
            }
        }

        $course = Course::with('trade.program.department')->findOrFail($courseId);

        // Fetch candidate attempts with full component scores
        $attempts = EntranceTestAttempt::whereHas('entranceExam', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            })
            ->with(['studentProfile.user', 'application', 'evaluator', 'entranceExam'])
            ->get()
            ->map(function ($attempt) {
                // Ensure composite score is computed
                if ($attempt->composite_score === null && $attempt->status === 'completed') {
                    $attempt->composite_score = $attempt->calculateCompositeScore();
                    $attempt->save();
                }

                $matricObt = $attempt->matric_marks_obtained;
                $matricTot = $attempt->total_matric_marks ?? 1100;

                return [
                    'id' => $attempt->id,
                    'application_id' => $attempt->application_id,
                    'application_number' => $attempt->application?->application_number ?? 'N/A',
                    'candidate_name' => $attempt->studentProfile?->user?->name ?? 'Candidate',
                    'father_name' => $attempt->studentProfile?->father_name ?? 'N/A',
                    'cnic' => $attempt->studentProfile?->user?->cnic ?? 'N/A',
                    'matric_marks' => $matricObt,
                    'total_matric_marks' => $matricTot,
                    'matric_percentage' => ($matricTot > 0 && $matricObt !== null) ? round(($matricObt / $matricTot) * 100, 1) : 0,
                    'cbt_score' => $attempt->cbt_score ?? $attempt->entrance_marks_obtained ?? 0,
                    'cbt_total' => $attempt->entranceExam?->total_marks ?? 100,
                    'interview_score' => $attempt->interview_score,
                    'interview_status' => $attempt->interview_status,
                    'composite_score' => (float) ($attempt->composite_score ?? 0),
                    'merit_rank' => $attempt->merit_rank,
                    'selection_status' => $attempt->selection_status,
                ];
            })
            ->sortByDesc('composite_score')
            ->values();

        // Assign live calculated ranks for display if not yet finalized
        $rankedAttempts = $attempts->map(function ($att, $idx) {
            $att['calculated_rank'] = $idx + 1;
            return $att;
        });

        // Courses list for switcher
        $courses = Course::where('is_active', true)
            ->with('trade')
            ->orderBy('name')
            ->get();

        $selectedCount = $attempts->where('selection_status', 'selected')->count();
        $waitingCount = $attempts->where('selection_status', 'waiting')->count();
        $disqualifiedCount = $attempts->where('selection_status', 'disqualified')->count();

        return Inertia::render('Teacher/AdmissionTests/MeritDesk', [
            'course' => $course,
            'courses' => $courses,
            'attempts' => $rankedAttempts,
            'stats' => [
                'total_candidates' => $attempts->count(),
                'selected_count' => $selectedCount,
                'waiting_count' => $waitingCount,
                'disqualified_count' => $disqualifiedCount,
            ],
        ]);
    }

    /**
     * Apply Cutoff Seat Selector to dynamically partition candidates into Selected and Waiting.
     */
    public function applyCutoff(Request $request, int $courseId): RedirectResponse
    {
        $course = Course::findOrFail($courseId);

        $validated = $request->validate([
            'allocated_seats' => 'required|integer|min:1|max:500',
            'minimum_passing_score' => 'nullable|numeric|min:0|max:100',
        ]);

        $allocatedSeats = (int) $validated['allocated_seats'];
        $minPassing = (float) ($validated['minimum_passing_score'] ?? 33.0);

        $attempts = EntranceTestAttempt::whereHas('entranceExam', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            })
            ->with(['application'])
            ->get()
            ->sortByDesc(function ($attempt) {
                return (float) ($attempt->composite_score ?? $attempt->calculateCompositeScore());
            })
            ->values();

        $rank = 0;
        $selectedCount = 0;

        foreach ($attempts as $attempt) {
            $composite = (float) ($attempt->composite_score ?? $attempt->calculateCompositeScore());
            $attempt->composite_score = $composite;
            $attempt->composite_merit_score = $composite;

            if ($composite < $minPassing) {
                $status = 'disqualified';
                $assignedRank = null;
                $appStatus = 'disqualified';
            } else {
                $rank++;
                $assignedRank = $rank;

                if ($rank <= $allocatedSeats) {
                    $status = 'selected';
                    $appStatus = 'selected_for_admission';
                    $selectedCount++;
                } else {
                    $status = 'waiting';
                    $appStatus = 'waiting_list';
                }
            }

            $attempt->update([
                'merit_rank' => $assignedRank,
                'selection_status' => $status,
                'composite_score' => $composite,
            ]);

            if ($attempt->application) {
                $attempt->application->update([
                    'merit_score' => $composite,
                    'status' => $appStatus,
                ]);
            }
        }

        if (function_exists('activity')) {
            activity()
                ->causedBy(auth()->user())
                ->performedOn($course)
                ->log("Applied Admission Merit Cutoff for '{$course->name}': {$selectedCount} allocated seats, {$attempts->count()} total candidates evaluated.");
        }

        return redirect()->back()->with(
            'success',
            "Merit Cutoff Applied successfully! Top {$allocatedSeats} candidates assigned 'Selected' status; remainder placed on Waiting List."
        );
    }

    /**
     * Render the official A4 Landscape TEVTA Merit Gazette for printing.
     */
    public function gazette(int $courseId): Response
    {
        $course = Course::with('trade.program.department.institute')->findOrFail($courseId);

        $attempts = EntranceTestAttempt::whereHas('entranceExam', function ($q) use ($courseId) {
                $q->where('course_id', $courseId);
            })
            ->with(['studentProfile.user', 'application', 'evaluator', 'entranceExam'])
            ->orderBy('merit_rank')
            ->get()
            ->sortBy(function ($att) {
                if ($att->selection_status === 'selected') return 1;
                if ($att->selection_status === 'waiting') return 2;
                return 3;
            })
            ->values()
            ->map(function ($att, $idx) {
                $matricObt = $att->matric_marks_obtained;
                $matricTot = $att->total_matric_marks ?? 1100;
                return [
                    'rank' => $att->merit_rank ?? ($idx + 1),
                    'application_number' => $att->application?->application_number ?? 'N/A',
                    'candidate_name' => $att->studentProfile?->user?->name ?? 'Candidate',
                    'father_name' => $att->studentProfile?->father_name ?? 'N/A',
                    'cnic' => $att->studentProfile?->user?->cnic ?? 'N/A',
                    'matric_marks' => $matricObt ? "{$matricObt} / {$matricTot}" : '—',
                    'cbt_score' => $att->cbt_score ?? $att->entrance_marks_obtained ?? '—',
                    'interview_score' => $att->interview_score !== null ? $att->interview_score : '—',
                    'composite_score' => $att->composite_score ? number_format($att->composite_score, 2) . '%' : '—',
                    'selection_status' => strtoupper($att->selection_status ?? 'PENDING'),
                ];
            });

        return Inertia::render('Shared/PrintMeritGazette', [
            'course' => $course,
            'candidates' => $attempts,
            'generatedAt' => now()->format('d F Y - h:i A'),
        ]);
    }

    /**
     * Render the official individual candidate scorecard for printing.
     */
    public function scorecard(int $attemptId): Response
    {
        $attempt = EntranceTestAttempt::with([
            'entranceExam.course.trade.program.department.institute',
            'studentProfile.user',
            'application',
            'evaluator',
        ])->findOrFail($attemptId);

        $exam = $attempt->entranceExam;
        $course = $exam?->course;

        $matricObt = $attempt->matric_marks_obtained;
        $matricTot = $attempt->total_matric_marks ?? 1100;
        $matricWeightage = $course?->matric_weightage ?? 50;
        $matricWeighted = ($matricTot > 0 && $matricObt !== null) ? round(($matricObt / $matricTot) * $matricWeightage, 2) : 0;

        $cbtScore = $attempt->cbt_score ?? $attempt->entrance_marks_obtained ?? 0;
        $cbtTotal = $exam?->total_marks ?? 100;
        $cbtWeightage = $course?->test_weightage ?? 40;
        $cbtWeighted = ($cbtTotal > 0) ? round(($cbtScore / $cbtTotal) * $cbtWeightage, 2) : 0;

        $vivaScore = $attempt->interview_score ?? 0;
        $vivaMax = $course?->interview_max_marks ?? 10;
        $vivaWeightage = $course?->interview_weightage ?? 10;
        $vivaWeighted = ($vivaMax > 0 && $attempt->interview_score !== null) ? round(($vivaScore / $vivaMax) * $vivaWeightage, 2) : 0;

        return Inertia::render('Shared/PrintCandidateScorecard', [
            'attempt' => [
                'id' => $attempt->id,
                'application_number' => $attempt->application?->application_number ?? 'N/A',
                'composite_score' => $attempt->composite_score ? number_format($attempt->composite_score, 2) . '%' : '—',
                'merit_rank' => $attempt->merit_rank ?? 'Under Review',
                'selection_status' => strtoupper($attempt->selection_status ?? 'PENDING'),
                'interview_remarks' => $attempt->interview_remarks,
                'evaluator_name' => $attempt->evaluator?->name ?? 'Board Examiner',
            ],
            'candidate' => [
                'name' => $attempt->studentProfile?->user?->name ?? 'Candidate',
                'father_name' => $attempt->studentProfile?->father_name ?? 'N/A',
                'cnic' => $attempt->studentProfile?->user?->cnic ?? 'N/A',
            ],
            'course' => [
                'name' => $course?->name,
                'trade' => $course?->trade?->name,
                'department' => $course?->trade?->program?->department?->name,
                'institute' => 'Government Technical Training Institute (GTTI) Rahim Yar Khan',
            ],
            'scores' => [
                'matric' => [
                    'obtained' => $matricObt,
                    'total' => $matricTot,
                    'weightage' => $matricWeightage,
                    'weighted' => $matricWeighted,
                ],
                'cbt' => [
                    'obtained' => $cbtScore,
                    'total' => $cbtTotal,
                    'weightage' => $cbtWeightage,
                    'weighted' => $cbtWeighted,
                ],
                'viva' => [
                    'obtained' => $vivaScore,
                    'total' => $vivaMax,
                    'weightage' => $vivaWeightage,
                    'weighted' => $vivaWeighted,
                ],
            ],
            'generatedAt' => now()->format('d M Y, h:i A'),
        ]);
    }
}
