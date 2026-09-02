<?php

namespace App\Http\Controllers\Teacher;

use App\Domains\Examination\Models\OnlineTest;
use App\Domains\Examination\Models\TestQuestion;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnlineTestController extends Controller
{
    /**
     * Display a listing of CBT online tests created for a specific batch.
     */
    public function index(int $batchId): Response
    {
        $batch = auth()->user()->batches()
            ->with(['course'])
            ->findOrFail($batchId);

        $tests = OnlineTest::where('batch_id', $batchId)
            ->withCount(['questions', 'attempts'])
            ->latest()
            ->get();

        return Inertia::render('Teacher/OnlineTests/Index', [
            'batch' => $batch,
            'tests' => $tests,
        ]);
    }

    /**
     * Store a newly created online CBT test for this batch.
     */
    public function store(Request $request, int $batchId): RedirectResponse
    {
        $batch = auth()->user()->batches()->findOrFail($batchId);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'duration_minutes' => 'required|integer|min:1|max:360',
            'scheduled_at' => 'nullable|date',
        ]);

        $test = OnlineTest::create([
            'batch_id' => $batch->id,
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'duration_minutes' => $validated['duration_minutes'],
            'scheduled_at' => $validated['scheduled_at'] ?? null,
            'status' => 'draft',
        ]);

        return redirect()->route('teacher.online-tests.show', $test->id)
            ->with('success', 'Online CBT test created. You can now bulk-upload or add MCQs.');
    }

    /**
     * Display test details, questions list, CSV bulk uploader, and live student attempts.
     */
    public function show(int $testId): Response
    {
        $test = OnlineTest::with([
                'batch.course',
                'questions',
                'attempts.studentProfile.user',
            ])
            ->findOrFail($testId);

        // Security check: teacher must be assigned to batch or owner of test
        $isAssigned = auth()->user()->batches()->where('batches.id', $test->batch_id)->exists();
        if ($test->user_id !== auth()->id() && !$isAssigned) {
            abort(403, 'Unauthorized access to this test.');
        }

        return Inertia::render('Teacher/OnlineTests/Show', [
            'test' => $test,
        ]);
    }

    /**
     * Bulk upload multiple-choice questions from a CSV file into the test.
     * Expected CSV format: Question, OptionA, OptionB, OptionC, OptionD, CorrectOption (A/B/C/D)
     */
    public function bulkUpload(Request $request, int $testId): RedirectResponse
    {
        $test = OnlineTest::findOrFail($testId);

        $fileField = $request->hasFile('file') ? 'file' : 'csv_file';

        $request->validate([
            $fileField => 'required|file|mimes:csv,txt|mimetypes:text/plain,text/csv,application/csv,application/vnd.ms-excel,application/octet-stream|max:5120',
        ]);

        $file = $request->file($fileField);
        $path = $file->getRealPath();

        $handle = fopen($path, 'r');
        if (!$handle) {
            return redirect()->back()->with('error', 'Unable to open uploaded CSV file.');
        }

        $imported = 0;
        $rowNumber = 0;

        while (($row = fgetcsv($handle, 4096, ',')) !== false) {
            $rowNumber++;

            // Strip UTF-8 BOM if present on first column
            if ($rowNumber === 1 && isset($row[0])) {
                $row[0] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $row[0]);
            }

            // Skip empty rows or header row
            if (empty($row) || !isset($row[0])) {
                continue;
            }

            $firstCol = strtolower(trim($row[0]));
            if (in_array($firstCol, ['question', 'question text', 'question_text', 'title', 'q#', '#'])) {
                continue;
            }

            $questionText = trim($row[0] ?? '');
            $optA = trim($row[1] ?? '');
            $optB = trim($row[2] ?? '');
            $optC = trim($row[3] ?? '');
            $optD = trim($row[4] ?? '');
            $correctOption = strtoupper(trim($row[5] ?? 'A'));

            if (empty($questionText) || empty($optA) || empty($optB)) {
                continue;
            }

            // Normalize correct option to valid A, B, C, D
            if (!in_array($correctOption, ['A', 'B', 'C', 'D'])) {
                $correctOption = 'A';
            }

            TestQuestion::create([
                'online_test_id' => $test->id,
                'question_text' => $questionText,
                'option_a' => $optA,
                'option_b' => $optB,
                'option_c' => $optC ?: 'None of the above',
                'option_d' => $optD ?: 'All of the above',
                'correct_option' => $correctOption,
                'marks' => 1,
            ]);

            $imported++;
        }

        fclose($handle);

        return redirect()->back()->with('success', "Successfully imported {$imported} questions into the online test.");
    }

    /**
     * Publish or unpublish an online test for trainee access.
     */
    public function publish(int $testId): RedirectResponse
    {
        $test = OnlineTest::findOrFail($testId);

        $newStatus = $test->status === 'published' ? 'draft' : 'published';
        $test->update(['status' => $newStatus]);

        $message = $newStatus === 'published'
            ? 'Online test has been published and is now live for student attempts!'
            : 'Online test has been reverted to draft mode.';

        return redirect()->back()->with('success', $message);
    }

    /**
     * Force submit and grade an in-progress exam attempt (e.g. computer freeze / power outage).
     */
    public function forceSubmit(Request $request, int $testId, int $attemptId): RedirectResponse
    {
        $test = OnlineTest::with('questions')->findOrFail($testId);

        // Security check: teacher must be assigned to batch or owner of test or super-admin
        $isAssigned = auth()->user()->batches()->where('batches.id', $test->batch_id)->exists();
        if ($test->user_id !== auth()->id() && !$isAssigned && !auth()->user()->hasRole(['super-admin', 'principal'])) {
            abort(403, 'Unauthorized action.');
        }

        $attempt = \App\Domains\Examination\Models\TestAttempt::where('online_test_id', $testId)
            ->findOrFail($attemptId);

        $answers = is_array($attempt->answers) ? $attempt->answers : (json_decode($attempt->answers, true) ?: []);
        $score = 0;
        $totalQuestions = $test->questions->count();

        foreach ($test->questions as $question) {
            $submitted = $answers[$question->id] ?? null;
            if ($submitted && strtoupper(trim($submitted)) === strtoupper(trim($question->correct_option))) {
                $score += $question->marks ?: 1;
            }
        }

        $attempt->update([
            'end_time' => now(),
            'score' => $score,
            'total_questions' => $totalQuestions,
            'status' => 'completed',
        ]);

        \App\Domains\Operations\Models\ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'overridden',
            'model_type' => \App\Domains\Examination\Models\TestAttempt::class,
            'model_id' => $attempt->id,
            'description' => "Emergency Force Submit executed for Test Attempt #{$attempt->id} (Score: {$score}/{$totalQuestions})",
            'new_data' => ['status' => 'completed', 'score' => $score],
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Attempt #{$attempt->id} successfully force-submitted and auto-graded (Score: {$score}/{$totalQuestions}).");
    }
}
