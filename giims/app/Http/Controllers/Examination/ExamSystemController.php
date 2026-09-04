<?php

namespace App\Http\Controllers\Examination;

use App\Domains\Examination\Models\OnlineTest;
use App\Domains\Examination\Models\TestAttempt;
use App\Domains\Examination\Models\TestQuestion;
use App\Domains\Identity\Models\User;
use App\Domains\Student\Models\StudentProfile;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamSystemController extends Controller
{
    /**
     * Render the frictionless CNIC login portal.
     */
    public function loginView(): Response
    {
        return Inertia::render('ExamSystem/Login');
    }

    /**
     * Frictionless CNIC authentication for lab terminals (No Passwords required).
     */
    public function verifyCnic(Request $request): JsonResponse|RedirectResponse
    {
        $rawInput = trim($request->input('cnic', ''));
        $digitsOnly = preg_replace('/\D/', '', $rawInput);

        if (strlen($digitsOnly) !== 13) {
            return back()->withErrors(['cnic' => 'Please enter a valid 13-digit National ID (CNIC/Form B).']);
        }

        $formattedCnic = sprintf('%s-%s-%s', substr($digitsOnly, 0, 5), substr($digitsOnly, 5, 7), substr($digitsOnly, 12, 1));

        // Find student user by CNIC
        $user = User::where('cnic', $formattedCnic)
            ->orWhere('cnic', $digitsOnly)
            ->orWhereRaw("REPLACE(cnic, '-', '') = ?", [$digitsOnly])
            ->with(['studentProfile.enrollments.batch.course', 'studentProfile.enrollments.course'])
            ->first();

        if (!$user || !$user->studentProfile) {
            return back()->withErrors(['cnic' => 'No trainee profile registered under this CNIC. Please check credentials.']);
        }

        $profile = $user->studentProfile;

        // Check if student profile is active
        if ($profile->status === 'terminated') {
            return back()->withErrors(['cnic' => 'Your academic enrollment is permanently terminated by Administration.']);
        }

        if ($profile->status === 'struck_off') {
            return back()->withErrors(['cnic' => 'Your student profile is currently struck-off / suspended. Contact the Chief Proctor.']);
        }

        // Get active enrollment
        $enrollment = $profile->enrollments()
            ->where('status', 'active')
            ->with(['batch', 'course'])
            ->first();

        if (!$enrollment || !$enrollment->batch_id) {
            return back()->withErrors(['cnic' => 'You are not assigned to an active training batch. Contact the academic office.']);
        }

        // Find active/live online exam for this batch
        $test = OnlineTest::where('batch_id', $enrollment->batch_id)
            ->where(function ($q) {
                $q->where('is_live', true)
                  ->orWhere('status', 'published');
            })
            ->latest()
            ->first();

        if (!$test) {
            return back()->withErrors(['cnic' => "Exam portal locked. No active exam is live for batch: {$enrollment->batch?->name} ({$enrollment->course?->name}). Wait for the instructor to activate the test."]);
        }

        // Store candidate session
        session([
            'gtti_exam_student_id' => $profile->id,
            'gtti_exam_user_id' => $user->id,
            'gtti_exam_test_id' => $test->id,
        ]);

        return back()->with([
            'verifiedStudent' => [
                'id' => $profile->id,
                'name' => $user->name,
                'father_name' => $profile->father_name ?? 'N/A',
                'cnic' => $formattedCnic,
                'course' => $enrollment->course?->name ?? 'Technical Diploma',
                'batch' => $enrollment->batch?->name ?? 'Standard Batch',
            ],
            'activeExam' => [
                'id' => $test->id,
                'title' => $test->title,
                'duration_minutes' => $test->duration_minutes,
            ],
        ]);
    }

    /**
     * Render the fullscreen timed exam canvas.
     */
    public function takeExam(Request $request, int $testId): Response|RedirectResponse
    {
        $profileId = session('gtti_exam_student_id') ?? auth()->user()?->studentProfile?->id;

        if (!$profileId) {
            return redirect()->route('exam-system.login')
                ->with('error', 'Please verify your CNIC before entering the exam room.');
        }

        $profile = StudentProfile::with('user')->findOrFail($profileId);
        $test = OnlineTest::with('batch.course', 'questions')->findOrFail($testId);

        // Verify test is live or published
        if (!$test->is_live && $test->status !== 'published') {
            return redirect()->route('exam-system.login')
                ->withErrors(['cnic' => 'This examination has been deactivated or locked by the instructor.']);
        }

        // Check if student has already completed this exam
        $attempt = TestAttempt::where('online_test_id', $test->id)
            ->where('student_profile_id', $profile->id)
            ->first();

        if ($attempt && $attempt->status === 'completed') {
            return redirect()->route('exam-system.result', $attempt->id);
        }

        // If no attempt exists yet, initialize it with dynamic anti-cheating randomization
        if (!$attempt) {
            $attempt = TestAttempt::create([
                'online_test_id' => $test->id,
                'student_profile_id' => $profile->id,
                'start_time' => now(),
                'status' => 'in_progress',
                'warning_count' => 0,
                'answers' => [],
            ]);
        }

        // Generate / retrieve deterministic anti-cheat shuffle
        if (empty($attempt->shuffled_question_order)) {
            $allQuestions = $test->questions()->get();

            if ($allQuestions->isEmpty()) {
                return redirect()->route('exam-system.login')
                    ->withErrors(['cnic' => 'Exam question bank is currently empty.']);
            }

            // Determine question count (dynamic pool sampling)
            $sampleSize = $allQuestions->count();
            if ($test->question_pool_size && $test->question_pool_size > 0 && $test->question_pool_size < $sampleSize) {
                $sampleSize = $test->question_pool_size;
            }

            // Seed deterministic shuffle uniquely for this candidate attempt
            $seed = (int) sprintf('%u', crc32($profile->id . '_' . $test->id));
            mt_srand($seed);

            $selectedQuestions = $allQuestions->shuffle()->take($sampleSize)->values();

            $shuffledOrder = [];
            foreach ($selectedQuestions as $question) {
                $opts = [
                    'A' => $question->option_a,
                    'B' => $question->option_b,
                    'C' => $question->option_c,
                    'D' => $question->option_d,
                ];

                // Shuffle option keys
                $keys = array_keys($opts);
                shuffle($keys);

                $mappedOptions = [];
                $newKeys = ['A', 'B', 'C', 'D'];
                foreach ($newKeys as $i => $displayKey) {
                    $origKey = $keys[$i];
                    $mappedOptions[$displayKey] = [
                        'text' => $opts[$origKey],
                        'orig_key' => $origKey,
                    ];
                }

                $shuffledOrder[] = [
                    'question_id' => $question->id,
                    'options' => $mappedOptions,
                ];
            }

            $attempt->update([
                'shuffled_question_order' => $shuffledOrder,
                'total_questions' => count($shuffledOrder),
                'start_time' => $attempt->start_time ?? now(),
            ]);
        }

        // Calculate accurate countdown remaining seconds
        $startTime = $attempt->start_time ?? now();
        $totalSeconds = $test->duration_minutes * 60;
        $elapsedSeconds = now()->diffInSeconds($startTime, false);
        $remainingSeconds = max(0, $totalSeconds - abs($elapsedSeconds));

        // Auto-submit if time expired
        if ($remainingSeconds <= 0 && $attempt->status !== 'completed') {
            return $this->processSubmission($attempt, $test);
        }

        // Prepare stripped question payload for client (without correct answers)
        $questionMap = $test->questions->keyBy('id');
        $clientQuestions = [];

        foreach ($attempt->shuffled_question_order as $item) {
            $q = $questionMap->get($item['question_id']);
            if (!$q) continue;

            $clientOptions = [];
            foreach ($item['options'] as $displayKey => $optData) {
                $clientOptions[] = [
                    'key' => $displayKey,
                    'text' => $optData['text'],
                ];
            }

            $clientQuestions[] = [
                'id' => $q->id,
                'question_text' => $q->question_text,
                'marks' => $q->marks ?: 1,
                'options' => $clientOptions,
            ];
        }

        return Inertia::render('ExamSystem/ExamPage', [
            'attempt' => [
                'id' => $attempt->id,
                'current_question' => 0,
                'answers' => $attempt->answers ?? [],
                'warning_count' => $attempt->warning_count ?? 0,
            ],
            'candidate' => [
                'name' => $profile->user?->name ?? 'Trainee',
                'father_name' => $profile->father_name ?? 'N/A',
                'cnic' => $profile->user?->cnic ?? 'N/A',
                'batch' => $test->batch?->name ?? 'Standard Batch',
                'course' => $test->batch?->course?->name ?? 'Technical Trade',
            ],
            'test' => [
                'id' => $test->id,
                'title' => $test->title,
                'description' => $test->description,
                'duration_minutes' => $test->duration_minutes,
                'total_questions' => count($clientQuestions),
                'practical_marks' => $test->practical_marks,
            ],
            'questions' => $clientQuestions,
            'remainingSeconds' => $remainingSeconds,
        ]);
    }

    /**
     * Auto-save answer selection in real-time.
     */
    public function saveAnswer(Request $request, int $testId): JsonResponse
    {
        $attemptId = $request->input('attempt_id');
        $questionId = $request->input('question_id');
        $selectedKey = strtoupper(trim($request->input('selected_key', '')));

        $attempt = TestAttempt::where('online_test_id', $testId)->findOrFail($attemptId);

        if ($attempt->status === 'completed') {
            return response()->json(['success' => false, 'message' => 'Exam already submitted']);
        }

        $answers = is_array($attempt->answers) ? $attempt->answers : [];
        $answers[$questionId] = $selectedKey;

        $attempt->update(['answers' => $answers]);

        return response()->json(['success' => true]);
    }

    /**
     * Record an anti-cheat tab-switch warning.
     */
    public function recordWarning(Request $request, int $testId): JsonResponse
    {
        $attemptId = $request->input('attempt_id');
        $attempt = TestAttempt::where('online_test_id', $testId)->findOrFail($attemptId);

        $warnings = ($attempt->warning_count ?? 0) + 1;
        $attempt->update(['warning_count' => $warnings]);

        return response()->json([
            'success' => true,
            'warning_count' => $warnings,
        ]);
    }

    /**
     * Submit and instantly grade the exam attempt.
     */
    public function submitExam(Request $request, int $testId): RedirectResponse
    {
        $attemptId = $request->input('attempt_id');
        $test = OnlineTest::with('questions')->findOrFail($testId);
        $attempt = TestAttempt::where('online_test_id', $test->id)->findOrFail($attemptId);

        if ($attempt->status === 'completed') {
            return redirect()->route('exam-system.result', $attempt->id);
        }

        // If client sent final answers payload, update them
        $submittedAnswers = $request->input('answers');
        if (is_array($submittedAnswers)) {
            $attempt->update(['answers' => $submittedAnswers]);
        }

        return $this->processSubmission($attempt, $test);
    }

    /**
     * Process grading and score calculation.
     */
    protected function processSubmission(TestAttempt $attempt, OnlineTest $test): RedirectResponse
    {
        $answers = is_array($attempt->answers) ? $attempt->answers : [];
        $shuffled = is_array($attempt->shuffled_question_order) ? $attempt->shuffled_question_order : [];
        $questionMap = $test->questions()->get()->keyBy('id');

        $score = 0;
        $totalQuestions = count($shuffled);

        foreach ($shuffled as $item) {
            $qId = $item['question_id'];
            $question = $questionMap->get($qId);
            if (!$question) continue;

            $selectedDisplayKey = strtoupper(trim($answers[$qId] ?? ''));
            if (!$selectedDisplayKey) continue;

            // Reverse map display option key back to original question option key
            $origKey = $item['options'][$selectedDisplayKey]['orig_key'] ?? null;
            $correctKey = strtoupper(trim($question->correct_option));

            if ($origKey && $origKey === $correctKey) {
                $score += $question->marks ?: 1;
            }
        }

        $attempt->update([
            'score' => $score,
            'total_questions' => $totalQuestions,
            'end_time' => now(),
            'status' => 'completed',
        ]);

        $attempt->recalculateGrandTotal();

        return redirect()->route('exam-system.result', $attempt->id)
            ->with('success', "Exam submitted successfully! Score: {$score} / {$totalQuestions}");
    }

    /**
     * Render the instant official Result Page.
     */
    public function result(int $attemptId): Response
    {
        $attempt = TestAttempt::with(['onlineTest.batch.course', 'studentProfile.user', 'interviewer'])
            ->findOrFail($attemptId);

        return Inertia::render('ExamSystem/ResultPage', [
            'attempt' => $attempt,
            'student' => [
                'name' => $attempt->studentProfile?->user?->name ?? 'Trainee',
                'father_name' => $attempt->studentProfile?->father_name ?? 'N/A',
                'cnic' => $attempt->studentProfile?->user?->cnic ?? 'N/A',
                'course' => $attempt->onlineTest?->batch?->course?->name ?? 'Technical Trade',
                'batch' => $attempt->onlineTest?->batch?->name ?? 'Standard Batch',
            ],
            'test' => $attempt->onlineTest,
        ]);
    }
}
