<?php

namespace App\Http\Controllers\Teacher;

use App\Domains\Examination\Models\OnlineTest;
use App\Domains\Examination\Models\TestAttempt;
use App\Domains\Examination\Models\TestQuestion;
use App\Domains\Identity\Models\User;
use App\Domains\Organization\Models\Batch;
use App\Domains\Student\Models\StudentProfile;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExamSystemTeacherController extends Controller
{
    /**
     * Teacher Exam System Command Center Dashboard.
     */
    public function dashboard(): Response
    {
        $user = auth()->user();
        $isPrivileged = $user->hasRole(['super-admin', 'principal', 'administrator']);

        $batches = $isPrivileged
            ? Batch::with('course')->get()
            : $user->batches()->with('course')->get();

        $batchIds = $batches->pluck('id');

        $exams = OnlineTest::whereIn('batch_id', $batchIds)
            ->with(['batch.course'])
            ->withCount(['questions', 'attempts'])
            ->latest()
            ->get()
            ->map(function ($test) {
                $completedAttempts = $test->attempts()->where('status', 'completed')->get();
                $passCount = $completedAttempts->filter(fn($a) => $a->isPassed())->count();
                $avgScore = $completedAttempts->count() > 0
                    ? round($completedAttempts->avg('percentage'), 1)
                    : 0;

                return [
                    'id' => $test->id,
                    'title' => $test->title,
                    'description' => $test->description,
                    'batch_name' => $test->batch?->name,
                    'course_name' => $test->batch?->course?->name,
                    'duration_minutes' => $test->duration_minutes,
                    'question_pool_size' => $test->question_pool_size,
                    'practical_marks' => $test->practical_marks,
                    'passing_percentage' => $test->passing_percentage,
                    'is_live' => (bool) $test->is_live,
                    'status' => $test->status,
                    'questions_count' => $test->questions_count,
                    'attempts_count' => $test->attempts_count,
                    'passed_count' => $passCount,
                    'average_percentage' => $avgScore,
                    'created_at' => $test->created_at?->format('d M Y'),
                ];
            });

        return Inertia::render('Teacher/ExamSystem/Dashboard', [
            'batches' => $batches,
            'exams' => $exams,
            'stats' => [
                'total_exams' => $exams->count(),
                'live_exams' => $exams->where('is_live', true)->count(),
                'total_attempts' => $exams->sum('attempts_count'),
                'total_questions' => $exams->sum('questions_count'),
            ],
        ]);
    }

    /**
     * Store a new online exam with question pool and practical marks configuration.
     */
    public function storeExam(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'batch_id' => 'required|exists:batches,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration_minutes' => 'required|integer|min:5|max:300',
            'question_pool_size' => 'nullable|integer|min:1',
            'practical_marks' => 'required|integer|min:0|max:100',
            'passing_percentage' => 'required|integer|min:1|max:100',
        ]);

        $test = OnlineTest::create([
            'batch_id' => $validated['batch_id'],
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'duration_minutes' => $validated['duration_minutes'],
            'question_pool_size' => $validated['question_pool_size'] ?: null,
            'practical_marks' => $validated['practical_marks'],
            'passing_percentage' => $validated['passing_percentage'],
            'status' => 'draft',
            'is_live' => false,
        ]);

        return redirect()->back()->with('success', "Exam '{$test->title}' created successfully. You can now import MCQs.");
    }

    /**
     * One-click toggle for live lab activation.
     */
    public function toggleLive(int $testId): RedirectResponse
    {
        $test = OnlineTest::findOrFail($testId);
        $test->update([
            'is_live' => !$test->is_live,
            'status' => !$test->is_live ? 'published' : $test->status,
        ]);

        $stateText = $test->is_live ? 'ACTIVATED (LIVE IN LAB)' : 'DEACTIVATED (LOCKED)';
        return redirect()->back()->with('success', "Exam state changed to {$stateText}.");
    }

    /**
     * Bulk upload questions from CSV/Excel text into the question bank.
     */
    public function bulkUploadQuestions(Request $request, int $testId): RedirectResponse
    {
        $test = OnlineTest::findOrFail($testId);

        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();

        $content = file_get_contents($path);
        // Strip UTF-8 BOM if present
        $content = preg_replace('/^\xEF\xBB\xBF/', '', $content);

        $lines = preg_split('/\r\n|\r|\n/', trim($content));
        if (empty($lines)) {
            return redirect()->back()->with('error', 'Uploaded file is empty.');
        }

        $imported = 0;
        foreach ($lines as $index => $line) {
            if (empty(trim($line))) continue;

            $row = str_getcsv($line);
            if (count($row) < 6) continue;

            // Skip header row
            if ($index === 0 && preg_match('/question/i', $row[0])) {
                continue;
            }

            $questionText = trim($row[0]);
            $optA = trim($row[1]);
            $optB = trim($row[2]);
            $optC = trim($row[3]);
            $optD = trim($row[4]);
            $correct = strtoupper(trim($row[5]));
            $marks = isset($row[6]) && is_numeric($row[6]) ? (int) $row[6] : 1;

            if (!in_array($correct, ['A', 'B', 'C', 'D'])) {
                $correct = 'A';
            }

            if (!empty($questionText) && !empty($optA) && !empty($optB)) {
                TestQuestion::create([
                    'online_test_id' => $test->id,
                    'question_text' => $questionText,
                    'option_a' => $optA,
                    'option_b' => $optB,
                    'option_c' => $optC ?: 'None of the above',
                    'option_d' => $optD ?: 'All of the above',
                    'correct_option' => $correct,
                    'marks' => $marks,
                ]);
                $imported++;
            }
        }

        return redirect()->back()->with('success', "Imported {$imported} questions successfully into {$test->title}.");
    }

    /**
     * Interview / Viva Desk: Evaluate completed candidates.
     */
    public function interviewDesk(Request $request, ?int $testId = null): Response
    {
        $searchCnic = trim($request->input('search', ''));
        $digitsOnly = preg_replace('/\D/', '', $searchCnic);

        $query = TestAttempt::with(['studentProfile.user', 'onlineTest.batch.course', 'interviewer'])
            ->where('status', 'completed');

        if ($testId) {
            $query->where('online_test_id', $testId);
        }

        if (!empty($digitsOnly)) {
            $query->whereHas('studentProfile.user', function ($q) use ($digitsOnly) {
                $q->whereRaw("REPLACE(cnic, '-', '') LIKE ?", ["%{$digitsOnly}%"])
                  ->orWhere('name', 'LIKE', "%{$digitsOnly}%");
            });
        }

        $pendingQueue = (clone $query)->whereNull('practical_marks')
            ->latest('end_time')
            ->take(50)
            ->get();

        $completedQueue = (clone $query)->whereNotNull('practical_marks')
            ->latest('updated_at')
            ->take(30)
            ->get();

        $tests = OnlineTest::with('batch.course')->latest()->get();

        return Inertia::render('Teacher/ExamSystem/InterviewDesk', [
            'pendingQueue' => $pendingQueue,
            'completedQueue' => $completedQueue,
            'tests' => $tests,
            'selectedTestId' => $testId,
            'searchQuery' => $searchCnic,
        ]);
    }

    /**
     * Submit Viva / Practical marks and merge with MCQ score.
     */
    public function submitVivaMarks(Request $request, int $attemptId): RedirectResponse
    {
        $attempt = TestAttempt::with('onlineTest')->findOrFail($attemptId);
        $maxPractical = (int) ($attempt->onlineTest?->practical_marks ?? 5);

        $validated = $request->validate([
            'practical_marks' => "required|numeric|min:0|max:{$maxPractical}",
            'practical_remarks' => 'nullable|string|max:500',
        ]);

        $attempt->update([
            'practical_marks' => $validated['practical_marks'],
            'practical_remarks' => $validated['practical_remarks'] ?? null,
            'interviewer_id' => auth()->id(),
        ]);

        $attempt->recalculateGrandTotal();

        $studentName = $attempt->studentProfile?->user?->name ?? 'Candidate';
        return redirect()->back()->with('success', "Awarded {$validated['practical_marks']}/{$maxPractical} marks to {$studentName}. Grand Total updated to {$attempt->grand_total} ({$attempt->percentage}%).");
    }

    /**
     * Results Cockpit for a specific exam.
     */
    public function results(int $testId): Response
    {
        $test = OnlineTest::with(['batch.course'])->findOrFail($testId);

        $attempts = TestAttempt::where('online_test_id', $test->id)
            ->with(['studentProfile.user', 'interviewer'])
            ->latest()
            ->get();

        $totalAttempts = $attempts->count();
        $completedAttempts = $attempts->where('status', 'completed');
        $passedCount = $completedAttempts->filter(fn($a) => $a->isPassed())->count();
        $failedCount = $completedAttempts->count() - $passedCount;
        $avgScore = $completedAttempts->count() > 0 ? round($completedAttempts->avg('percentage'), 1) : 0;

        return Inertia::render('Teacher/ExamSystem/Results', [
            'test' => $test,
            'results' => $attempts,
            'stats' => [
                'total' => $totalAttempts,
                'completed' => $completedAttempts->count(),
                'passed' => $passedCount,
                'failed' => $failedCount,
                'average_percentage' => $avgScore,
            ],
        ]);
    }

    /**
     * One-click Export to Excel/CSV.
     */
    public function exportCsv(int $testId): StreamedResponse
    {
        $test = OnlineTest::with(['batch.course'])->findOrFail($testId);
        $attempts = TestAttempt::where('online_test_id', $test->id)
            ->with(['studentProfile.user', 'interviewer'])
            ->get();

        $fileName = sprintf('GTTI_Exam_Results_%s_%s.csv', preg_replace('/[^a-zA-Z0-9_-]/', '_', $test->title), now()->format('Ymd_His'));

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($attempts, $test) {
            $handle = fopen('php://output', 'w');
            // Write UTF-8 BOM for Excel compatibility
            fputs($handle, "\xEF\xBB\xBF");

            // CSV Header Row
            fputcsv($handle, [
                'Candidate Name',
                'CNIC',
                'Roll / Reg No',
                'Batch / Trade',
                'MCQ Score',
                'MCQ Total',
                'Interview / Practical Marks',
                'Interview Total',
                'Grand Total',
                'Percentage',
                'Status',
                'Interviewer Name',
                'Submission Date',
            ]);

            foreach ($attempts as $a) {
                $user = $a->studentProfile?->user;
                $status = $a->isPassed() ? 'PASS' : 'FAIL';

                fputcsv($handle, [
                    $user?->name ?? 'N/A',
                    $user?->cnic ?? 'N/A',
                    $a->studentProfile?->registration_number ?? 'N/A',
                    $test->batch?->name . ' (' . ($test->batch?->course?->name ?? 'Trade') . ')',
                    $a->score ?? 0,
                    $a->total_questions ?? $test->effectiveQuestionCount(),
                    $a->practical_marks ?? 0,
                    $test->practical_marks ?? 5,
                    $a->grand_total ?? ($a->score ?? 0),
                    ($a->percentage ?? 0) . '%',
                    $status,
                    $a->interviewer?->name ?? 'Pending Viva',
                    $a->end_time ? $a->end_time->format('d-m-Y H:i') : 'Incomplete',
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Emergency Delete / Reset of a student attempt.
     */
    public function deleteAttempt(int $attemptId): RedirectResponse
    {
        $attempt = TestAttempt::with('studentProfile.user')->findOrFail($attemptId);
        $studentName = $attempt->studentProfile?->user?->name ?? 'Student';

        $attempt->delete();

        return redirect()->back()->with('success', "Result for {$studentName} has been deleted. The candidate can now retake the exam.");
    }
}
