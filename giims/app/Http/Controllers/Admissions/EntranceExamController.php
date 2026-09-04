<?php

namespace App\Http\Controllers\Admissions;

use App\Domains\Admissions\Models\AdmissionEntranceExam;
use App\Domains\Admissions\Models\Application;
use App\Domains\Admissions\Models\EntranceTestAttempt;
use App\Domains\Admissions\Models\EntranceTestQuestion;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EntranceExamController extends Controller
{
    /**
     * Display the frictionless CBT login intake page.
     */
    public function loginView(): Response
    {
        return Inertia::render('Admissions/Cbt/Login');
    }

    /**
     * Frictionless authentication using CNIC & Application Number.
     */
    public function verify(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'cnic' => 'required|string|max:30',
            'application_number' => 'required|string|max:50',
        ]);

        $rawCnic = preg_replace('/[^0-9]/', '', $validated['cnic']);
        $appNumber = trim($validated['application_number']);

        // Find application by number and user CNIC
        $application = Application::where(function ($q) use ($appNumber) {
            $q->where('application_number', $appNumber)
              ->orWhere('application_number', 'LIKE', "%{$appNumber}");
        })
        ->whereHas('studentProfile.user', function ($q) use ($rawCnic, $validated) {
            $q->where('cnic', $validated['cnic'])
              ->orWhereRaw("REPLACE(cnic, '-', '') = ?", [$rawCnic]);
        })
        ->with(['studentProfile.user', 'course'])
        ->first();

        if (!$application) {
            return redirect()->back()->withErrors([
                'cnic' => 'No application found matching this CNIC and Application Number combination. Please verify your credentials.',
            ]);
        }

        // Find scheduled entrance test attempt
        $attempt = EntranceTestAttempt::where('application_id', $application->id)
            ->with(['entranceExam.course'])
            ->latest()
            ->first();

        if (!$attempt || !$attempt->entranceExam) {
            return redirect()->back()->withErrors([
                'application_number' => 'No entrance examination is currently registered for this course application.',
            ]);
        }

        $exam = $attempt->entranceExam;

        // Verify if test is CBT
        if ($exam->test_type !== 'cbt_online') {
            return redirect()->back()->withErrors([
                'application_number' => "This entrance exam is conducted via manual practical/interview at {$exam->venue}. Please present yourself directly to the examiner.",
            ]);
        }

        // Already completed check
        if ($attempt->status === 'completed') {
            return redirect()->back()->with([
                'info' => "You have already completed your entrance examination on {$attempt->submitted_at?->format('d M Y, h:i A')}. Marks: {$attempt->entrance_marks_obtained}/{$exam->total_marks}. Composite Score: {$attempt->composite_merit_score}%.",
            ]);
        }

        // Live status check: MUST BE LIVE
        if (!$exam->is_live) {
            return redirect()->back()->withErrors([
                'live_status' => "Exam is scheduled for today. Please wait for the lab instructor to activate the exam session.",
            ]);
        }

        // Set session
        session([
            'cbt_attempt_id' => $attempt->id,
            'cbt_verified_at' => now()->timestamp,
        ]);

        return redirect()->route('admissions.cbt-exam.take');
    }

    /**
     * Render the active timed student CBT interface with deterministic shuffling.
     */
    public function takeExam(Request $request): Response|RedirectResponse
    {
        $attemptId = session('cbt_attempt_id');

        if (!$attemptId) {
            return redirect()->route('admissions.cbt-exam.login')
                ->with('error', 'Your test session expired or was not found. Please log in again.');
        }

        $attempt = EntranceTestAttempt::with([
            'entranceExam.course',
            'studentProfile.user',
            'application',
        ])->find($attemptId);

        if (!$attempt || !$attempt->entranceExam) {
            session()->forget('cbt_attempt_id');
            return redirect()->route('admissions.cbt-exam.login');
        }

        $exam = $attempt->entranceExam;

        // If instructor locked the exam while test was running
        if (!$exam->is_live) {
            return redirect()->route('admissions.cbt-exam.login')
                ->withErrors(['live_status' => 'The instructor has set the examination offline.']);
        }

        if ($attempt->status === 'completed') {
            return Inertia::render('Admissions/Cbt/Result', [
                'attempt' => $attempt,
                'exam' => $exam,
            ]);
        }

        // Initialize attempt start time
        if (!$attempt->started_at) {
            $attempt->update([
                'started_at' => now(),
                'status' => 'in_progress',
            ]);
            $attempt->refresh();
        }

        // Zero-Cheating: Deterministic Question & Option Shuffling seeded by student profile ID
        if (empty($attempt->shuffled_question_order)) {
            $questions = EntranceTestQuestion::where('entrance_exam_id', $exam->id)->get();
            $seed = (int) sprintf("%u", crc32($attempt->student_profile_id . '_' . $exam->id));
            mt_srand($seed);

            $questionItems = $questions->all();
            // Deterministic Fisher-Yates shuffle for questions
            for ($i = count($questionItems) - 1; $i > 0; $i--) {
                $j = mt_rand(0, $i);
                $tmp = $questionItems[$i];
                $questionItems[$i] = $questionItems[$j];
                $questionItems[$j] = $tmp;
            }

            $shuffledOrder = [];
            foreach ($questionItems as $q) {
                // Shuffle option placement A, B, C, D
                $options = [
                    ['orig_key' => 'A', 'text' => $q->option_a],
                    ['orig_key' => 'B', 'text' => $q->option_b],
                    ['orig_key' => 'C', 'text' => $q->option_c],
                    ['orig_key' => 'D', 'text' => $q->option_d],
                ];

                for ($oi = count($options) - 1; $oi > 0; $oi--) {
                    $oj = mt_rand(0, $oi);
                    $otmp = $options[$oi];
                    $options[$oi] = $options[$oj];
                    $options[$oj] = $otmp;
                }

                // Map shuffled labels A, B, C, D to original keys
                $labels = ['A', 'B', 'C', 'D'];
                $optionMap = [];
                foreach ($labels as $idx => $lbl) {
                    $optionMap[$lbl] = [
                        'text' => $options[$idx]['text'],
                        'orig_key' => $options[$idx]['orig_key'],
                    ];
                }

                $shuffledOrder[] = [
                    'question_id' => $q->id,
                    'options' => $optionMap,
                ];
            }

            $attempt->update(['shuffled_question_order' => $shuffledOrder]);
            $attempt->refresh();
        }

        // Calculate remaining seconds
        $elapsed = now()->diffInSeconds($attempt->started_at);
        $totalSeconds = $exam->duration_minutes * 60;
        $remainingSeconds = max(0, $totalSeconds - $elapsed);

        // Prepare client-safe questions from shuffled order
        $clientQuestions = [];
        $dbQuestions = EntranceTestQuestion::where('entrance_exam_id', $exam->id)->get()->keyBy('id');

        foreach ($attempt->shuffled_question_order as $orderItem) {
            $qId = $orderItem['question_id'];
            $dbQ = $dbQuestions->get($qId);
            if (!$dbQ) continue;

            $clientOptions = [];
            foreach ($orderItem['options'] as $displayKey => $optData) {
                $clientOptions[] = [
                    'key' => $displayKey,
                    'text' => $optData['text'],
                ];
            }

            $clientQuestions[] = [
                'id' => $dbQ->id,
                'question_text' => $dbQ->question_text,
                'marks' => $dbQ->marks,
                'options' => $clientOptions,
            ];
        }

        return Inertia::render('Admissions/Cbt/TakeExam', [
            'attempt' => [
                'id' => $attempt->id,
                'started_at' => $attempt->started_at->toISOString(),
                'status' => $attempt->status,
                'submitted_answers' => $attempt->submitted_answers ?? (object)[],
            ],
            'candidate' => [
                'name' => $attempt->studentProfile?->user?->name ?? 'Candidate',
                'cnic' => $attempt->studentProfile?->user?->cnic ?? 'N/A',
                'application_number' => $attempt->application?->application_number ?? 'N/A',
                'father_name' => $attempt->studentProfile?->father_name ?? 'N/A',
            ],
            'exam' => [
                'id' => $exam->id,
                'title' => "Entrance Examination: {$exam->course?->name}",
                'course_name' => $exam->course?->name,
                'duration_minutes' => $exam->duration_minutes,
                'total_marks' => $exam->total_marks,
                'passing_marks' => $exam->passing_marks,
                'venue' => $exam->venue,
            ],
            'questions' => $clientQuestions,
            'remainingSeconds' => $remainingSeconds,
        ]);
    }

    /**
     * Grade submitted answers instantly and calculate composite merit score.
     */
    public function submit(Request $request): Response|RedirectResponse
    {
        $attemptId = session('cbt_attempt_id') ?? $request->input('attempt_id');

        if (!$attemptId) {
            return redirect()->route('admissions.cbt-exam.login');
        }

        $attempt = EntranceTestAttempt::with(['entranceExam.course', 'application'])->findOrFail($attemptId);
        $exam = $attempt->entranceExam;

        if ($attempt->status === 'completed') {
            return Inertia::render('Admissions/Cbt/Result', [
                'attempt' => $attempt,
                'exam' => $exam,
            ]);
        }

        $answers = $request->input('answers', []);
        $questions = EntranceTestQuestion::where('entrance_exam_id', $exam->id)->get()->keyBy('id');
        $shuffledOrder = $attempt->shuffled_question_order ?? [];

        // Build question option reverse lookup: question_id => [displayKey => orig_key]
        $reverseLookup = [];
        foreach ($shuffledOrder as $item) {
            $qId = $item['question_id'];
            $reverseLookup[$qId] = [];
            foreach ($item['options'] as $dispKey => $optData) {
                $reverseLookup[$qId][$dispKey] = $optData['orig_key'];
            }
        }

        // Automated Instant Grading
        $totalObtained = 0.0;
        foreach ($answers as $qId => $selectedDisplayKey) {
            $dbQ = $questions->get($qId);
            if (!$dbQ) continue;

            $origKey = $reverseLookup[$qId][$selectedDisplayKey] ?? $selectedDisplayKey;
            if (strtoupper($origKey) === strtoupper($dbQ->correct_option)) {
                $totalObtained += $dbQ->marks;
            }
        }

        // Calculate composite score
        $course = $exam->course;
        $matricWeightage = $course?->matric_weightage ?? 50;
        $testWeightage = $course?->test_weightage ?? 50;

        $matricObt = $attempt->matric_marks_obtained ?? $attempt->application?->obtained_marks ?? 0;
        $matricTot = $attempt->total_matric_marks ?? $attempt->application?->total_marks ?? 1100;

        $matricComponent = $matricTot > 0 ? ($matricObt / $matricTot) * $matricWeightage : 0;
        $testComponent = $exam->total_marks > 0 ? ($totalObtained / $exam->total_marks) * $testWeightage : 0;
        $compositeScore = round($matricComponent + $testComponent, 2);

        $isPassed = $totalObtained >= $exam->passing_marks;
        $interviewVenue = $exam->course?->interview_venue ?: 'Lab 3 / Interview Room';

        $attempt->update([
            'status' => 'completed',
            'cbt_score' => $totalObtained,
            'entrance_marks_obtained' => $totalObtained,
            'interview_status' => 'waiting',
            'submitted_answers' => $answers,
            'submitted_at' => now(),
        ]);

        $compositeScore = $attempt->calculateCompositeScore();
        $attempt->update([
            'composite_merit_score' => $compositeScore,
            'composite_score' => $compositeScore,
        ]);

        if ($attempt->application) {
            $attempt->application->update([
                'merit_score' => $compositeScore,
                'test_status' => $isPassed ? 'passed' : 'failed',
            ]);
        }

        return Inertia::render('Admissions/Cbt/Result', [
            'attempt' => $attempt->fresh(),
            'exam' => $exam,
            'matric_component' => round($matricComponent, 2),
            'test_component' => round($testComponent, 2),
            'interview_venue' => $interviewVenue,
        ]);
    }
}
