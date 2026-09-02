<?php

namespace App\Http\Controllers\Student;

use App\Domains\Examination\Models\OnlineTest;
use App\Domains\Examination\Models\TestAttempt;
use App\Domains\Examination\Models\TestQuestion;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnlineTestController extends Controller
{
    /**
     * Display a listing of active online CBT tests available for the student's enrolled batch.
     */
    public function index(): Response|RedirectResponse
    {
        $profile = auth()->user()->studentProfile;

        if (!$profile) {
            return redirect()->route('dashboard')->with('error', 'Student profile required to access CBT tests.');
        }

        $enrollment = $profile->enrollments()
            ->where('status', 'active')
            ->with(['course', 'batch'])
            ->first();

        $tests = collect();

        if ($enrollment && $enrollment->batch_id) {
            $tests = OnlineTest::where('batch_id', $enrollment->batch_id)
                ->where('status', 'published')
                ->withCount('questions')
                ->with(['attempts' => function ($q) use ($profile) {
                    $q->where('student_profile_id', $profile->id);
                }])
                ->latest()
                ->get();
        }

        return Inertia::render('Student/OnlineTests/Index', [
            'enrollment' => $enrollment,
            'tests' => $tests,
        ]);
    }

    /**
     * Display the timed exam interface for taking a CBT online test.
     */
    public function takeTest(int $testId): Response|RedirectResponse
    {
        $profile = auth()->user()->studentProfile;

        if (!$profile) {
            return redirect()->route('dashboard')->with('error', 'Student profile not found.');
        }

        $enrollment = $profile->enrollments()
            ->where('status', 'active')
            ->first();

        $test = OnlineTest::with('batch.course')->findOrFail($testId);

        if (!$enrollment || $enrollment->batch_id !== $test->batch_id) {
            return redirect()->route('student.online-tests.index')
                ->with('error', 'You are not enrolled in the batch assigned to this test.');
        }

        if ($test->status !== 'published') {
            return redirect()->route('student.online-tests.index')
                ->with('error', 'This test is not currently open for examination.');
        }

        // Check if student has already submitted an attempt
        $existingAttempt = TestAttempt::where('online_test_id', $test->id)
            ->where('student_profile_id', $profile->id)
            ->first();

        if ($existingAttempt) {
            return redirect()->route('student.online-tests.index')
                ->with('info', "You have already completed this test with a score of {$existingAttempt->score}/{$existingAttempt->total_questions}.");
        }

        // Fetch questions strictly without revealing the correct_option field to the browser
        $questions = TestQuestion::where('online_test_id', $test->id)
            ->select('id', 'online_test_id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'marks')
            ->get();

        return Inertia::render('Student/OnlineTests/TakeTest', [
            'test' => $test,
            'questions' => $questions,
        ]);
    }

    /**
     * Grade and submit the student's completed CBT exam attempt.
     */
    public function submit(Request $request, int $testId): RedirectResponse
    {
        $profile = auth()->user()->studentProfile;

        if (!$profile) {
            return redirect()->route('dashboard')->with('error', 'Student profile not found.');
        }

        $test = OnlineTest::findOrFail($testId);

        // Check if student has already submitted
        $existingAttempt = TestAttempt::where('online_test_id', $test->id)
            ->where('student_profile_id', $profile->id)
            ->first();

        if ($existingAttempt) {
            return redirect()->route('student.online-tests.index')
                ->with('info', 'Your test was already submitted.');
        }

        $submittedAnswers = $request->input('answers', []);
        $questions = TestQuestion::where('online_test_id', $test->id)->get();

        $score = 0;
        $totalQuestions = $questions->count();

        foreach ($questions as $q) {
            $userChoice = strtoupper(trim($submittedAnswers[$q->id] ?? ''));
            $correctChoice = strtoupper(trim($q->correct_option));

            if (!empty($userChoice) && $userChoice === $correctChoice) {
                $score += $q->marks;
            }
        }

        TestAttempt::create([
            'online_test_id' => $test->id,
            'student_profile_id' => $profile->id,
            'start_time' => $request->input('start_time') ? now() : null,
            'end_time' => now(),
            'score' => $score,
            'total_questions' => $totalQuestions,
            'answers' => $submittedAnswers,
            'status' => 'submitted',
        ]);

        return redirect()->route('student.online-tests.index')
            ->with('success', "CBT Exam submitted successfully! You scored {$score} out of {$totalQuestions}.");
    }
}
