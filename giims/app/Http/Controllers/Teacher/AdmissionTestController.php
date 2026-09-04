<?php

namespace App\Http\Controllers\Teacher;

use App\Domains\Admissions\Models\AdmissionEntranceExam;
use App\Domains\Admissions\Models\Application;
use App\Domains\Admissions\Models\EntranceTestAttempt;
use App\Domains\Admissions\Models\EntranceTestQuestion;
use App\Domains\Organization\Models\Course;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdmissionTestController extends Controller
{
    /**
     * Display a listing of admission entrance exams assigned to this instructor.
     */
    public function index(): Response
    {
        $exams = AdmissionEntranceExam::where('teacher_id', auth()->id())
            ->with(['course.trade.program.department'])
            ->withCount(['questions', 'attempts'])
            ->latest('exam_date')
            ->get();

        $courses = Course::with('trade.program.department')
            ->where('is_active', true)
            ->get();

        return Inertia::render('Teacher/AdmissionTests/Index', [
            'exams' => $exams,
            'courses' => $courses,
        ]);
    }

    /**
     * Schedule a new entrance exam for an institutional course.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'test_type' => 'required|in:cbt_online,manual_practical',
            'exam_date' => 'required|date',
            'start_time' => 'required|string|max:50',
            'venue' => 'required|string|max:255',
            'duration_minutes' => 'required|integer|min:10|max:300',
            'total_marks' => 'required|integer|min:10|max:500',
            'passing_marks' => 'required|integer|min:1|max:500',
            'instructions' => 'nullable|string',
        ]);

        $exam = AdmissionEntranceExam::create([
            'course_id' => $validated['course_id'],
            'teacher_id' => auth()->id(),
            'test_type' => $validated['test_type'],
            'exam_date' => $validated['exam_date'],
            'start_time' => $validated['start_time'],
            'venue' => $validated['venue'],
            'duration_minutes' => $validated['duration_minutes'],
            'total_marks' => $validated['total_marks'],
            'passing_marks' => $validated['passing_marks'],
            'instructions' => $validated['instructions'] ?? null,
            'is_live' => false,
        ]);

        // Auto-register pending applicants for this course
        $applications = Application::where('course_id', $validated['course_id'])
            ->whereIn('status', ['submitted', 'verified', 'under_review'])
            ->get();

        $registered = 0;
        foreach ($applications as $app) {
            EntranceTestAttempt::updateOrCreate(
                [
                    'entrance_exam_id' => $exam->id,
                    'application_id' => $app->id,
                ],
                [
                    'student_profile_id' => $app->student_profile_id,
                    'matric_marks_obtained' => $app->obtained_marks,
                    'total_matric_marks' => $app->total_marks ?? 1100,
                    'status' => 'scheduled',
                    'is_present' => true,
                ]
            );

            $app->update(['test_status' => 'scheduled']);
            $registered++;
        }

        return redirect()->route('teacher.admission-tests.show', $exam->id)
            ->with('success', "Entrance exam scheduled at {$exam->venue} on {$exam->exam_date->format('d M Y')}. {$registered} applicant(s) automatically registered.");
    }

    /**
     * Show instructor entrance exam cockpit with live activation controls, questions, and candidates.
     */
    public function show(int $id): Response
    {
        $exam = AdmissionEntranceExam::with([
            'course.trade.program.department',
            'questions',
            'attempts.application.studentProfile.user',
        ])->findOrFail($id);

        if ($exam->teacher_id !== auth()->id() && !auth()->user()->hasRole('super-admin') && !auth()->user()->hasRole('principal')) {
            abort(403, 'Unauthorized access to this entrance exam.');
        }

        return Inertia::render('Teacher/AdmissionTests/Show', [
            'exam' => $exam,
        ]);
    }

    /**
     * Toggle the live status of the entrance exam (offline / live).
     */
    public function toggleLive(Request $request, int $id): RedirectResponse
    {
        $exam = AdmissionEntranceExam::findOrFail($id);

        if ($exam->teacher_id !== auth()->id() && !auth()->user()->hasRole('super-admin') && !auth()->user()->hasRole('principal')) {
            abort(403, 'Unauthorized.');
        }

        $exam->is_live = !$exam->is_live;
        $exam->save();

        $msg = $exam->is_live
            ? "Entrance test is now LIVE! Lab candidates can now enter using their CNIC."
            : "Entrance test is now LOCKED and offline.";

        return redirect()->back()->with('success', $msg);
    }

    /**
     * Bulk upload MCQs from a CSV file into this entrance exam.
     */
    public function bulkUpload(Request $request, int $id): RedirectResponse
    {
        $exam = AdmissionEntranceExam::findOrFail($id);

        $fileField = $request->hasFile('file') ? 'file' : 'csv_file';
        $request->validate([
            $fileField => 'required|file|mimes:csv,txt|mimetypes:text/plain,text/csv,application/csv,application/vnd.ms-excel,application/octet-stream|max:5120',
        ]);

        $file = $request->file($fileField);
        $handle = fopen($file->getRealPath(), 'r');
        if (!$handle) {
            return redirect()->back()->with('error', 'Unable to open uploaded CSV file.');
        }

        $imported = 0;
        $rowNumber = 0;

        while (($row = fgetcsv($handle, 4096, ',')) !== false) {
            $rowNumber++;

            if ($rowNumber === 1 && isset($row[0])) {
                $row[0] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $row[0]);
            }

            if (empty($row) || !isset($row[0])) continue;

            $firstCol = strtolower(trim($row[0]));
            if (in_array($firstCol, ['question', 'question text', 'question_text', 'title', 'q#', '#'])) {
                continue;
            }

            $questionText = trim($row[0] ?? '');
            $optA = trim($row[1] ?? '');
            $optB = trim($row[2] ?? '');
            $optC = trim($row[3] ?? '');
            $optD = trim($row[4] ?? '');
            $correct = strtoupper(trim($row[5] ?? 'A'));
            $marks = isset($row[6]) && is_numeric($row[6]) ? (int) $row[6] : 1;

            if (empty($questionText) || empty($optA) || empty($optB)) {
                continue;
            }

            if (!in_array($correct, ['A', 'B', 'C', 'D'])) {
                $correct = 'A';
            }

            EntranceTestQuestion::create([
                'entrance_exam_id' => $exam->id,
                'question_text' => $questionText,
                'option_a' => $optA,
                'option_b' => $optB,
                'option_c' => $optC ?: 'None of the above',
                'option_d' => $optD ?: 'All of the above',
                'correct_option' => $correct,
                'marks' => $marks > 0 ? $marks : 1,
            ]);

            $imported++;
        }

        fclose($handle);

        return redirect()->back()->with('success', "Successfully imported {$imported} MCQs into the entrance examination question bank.");
    }

    /**
     * Add a single question manually to the question bank.
     */
    public function addQuestion(Request $request, int $id): RedirectResponse
    {
        $exam = AdmissionEntranceExam::findOrFail($id);

        $validated = $request->validate([
            'question_text' => 'required|string',
            'option_a' => 'required|string',
            'option_b' => 'required|string',
            'option_c' => 'required|string',
            'option_d' => 'required|string',
            'correct_option' => 'required|in:A,B,C,D',
            'marks' => 'required|integer|min:1|max:50',
        ]);

        EntranceTestQuestion::create([
            'entrance_exam_id' => $exam->id,
            'question_text' => $validated['question_text'],
            'option_a' => $validated['option_a'],
            'option_b' => $validated['option_b'],
            'option_c' => $validated['option_c'],
            'option_d' => $validated['option_d'],
            'correct_option' => $validated['correct_option'],
            'marks' => $validated['marks'],
        ]);

        return redirect()->back()->with('success', 'Question added to question bank.');
    }

    /**
     * Delete a question from the question bank.
     */
    public function deleteQuestion(int $examId, int $questionId): RedirectResponse
    {
        $question = EntranceTestQuestion::where('entrance_exam_id', $examId)
            ->findOrFail($questionId);

        $question->delete();

        return redirect()->back()->with('success', 'Question removed from question bank.');
    }

    /**
     * For manual practical / interview trades: save marks & attendance for all candidates.
     */
    public function manualMarks(Request $request, int $id): RedirectResponse
    {
        $exam = AdmissionEntranceExam::with('course')->findOrFail($id);

        $validated = $request->validate([
            'attempts' => 'required|array',
            'attempts.*.id' => 'required|exists:entrance_test_attempts,id',
            'attempts.*.is_present' => 'required|boolean',
            'attempts.*.entrance_marks_obtained' => 'nullable|numeric|min:0|max:' . $exam->total_marks,
        ]);

        $matricWeightage = $exam->course?->matric_weightage ?? 50;
        $testWeightage = $exam->course?->test_weightage ?? 50;

        foreach ($validated['attempts'] as $item) {
            $attempt = EntranceTestAttempt::where('entrance_exam_id', $exam->id)
                ->with('application')
                ->find($item['id']);

            if ($attempt) {
                $isPresent = $item['is_present'];
                $testMarks = $isPresent ? ($item['entrance_marks_obtained'] ?? null) : null;

                $compositeScore = null;
                $testStatus = $isPresent ? ($testMarks !== null ? 'appeared' : 'scheduled') : 'absent';

                if ($isPresent && $testMarks !== null) {
                    $matricObt = $attempt->matric_marks_obtained ?? $attempt->application?->obtained_marks ?? 0;
                    $matricTot = $attempt->total_matric_marks ?? $attempt->application?->total_marks ?? 1100;

                    $matricComponent = $matricTot > 0 ? ($matricObt / $matricTot) * $matricWeightage : 0;
                    $testComponent = $exam->total_marks > 0 ? ($testMarks / $exam->total_marks) * $testWeightage : 0;
                    $compositeScore = round($matricComponent + $testComponent, 2);

                    if ($testMarks >= $exam->passing_marks) {
                        $testStatus = 'passed';
                    } else {
                        $testStatus = 'failed';
                    }
                }

                $attempt->update([
                    'is_present' => $isPresent,
                    'entrance_marks_obtained' => $testMarks,
                    'composite_merit_score' => $compositeScore,
                    'status' => $isPresent ? ($testMarks !== null ? 'completed' : 'scheduled') : 'absent',
                    'submitted_at' => $testMarks !== null ? now() : null,
                ]);

                if ($attempt->application) {
                    $attempt->application->update([
                        'merit_score' => $compositeScore,
                        'test_status' => $testStatus,
                    ]);
                }
            }
        }

        return redirect()->back()->with('success', 'Candidate marks and attendance updated successfully.');
    }

    /**
     * Compute composite merit score for all candidates in this entrance exam.
     */
    public function calculateMerit(int $id): RedirectResponse
    {
        $exam = AdmissionEntranceExam::with(['course', 'attempts.application'])->findOrFail($id);

        $matricWeightage = $exam->course?->matric_weightage ?? 50;
        $testWeightage = $exam->course?->test_weightage ?? 50;

        $processed = 0;
        foreach ($exam->attempts as $attempt) {
            if (!$attempt->is_present || $attempt->entrance_marks_obtained === null) {
                continue;
            }

            $matricObt = $attempt->matric_marks_obtained ?? $attempt->application?->obtained_marks ?? 0;
            $matricTot = $attempt->total_matric_marks ?? $attempt->application?->total_marks ?? 1100;

            $matricComponent = $matricTot > 0 ? ($matricObt / $matricTot) * $matricWeightage : 0;
            $testComponent = $exam->total_marks > 0 ? ($attempt->entrance_marks_obtained / $exam->total_marks) * $testWeightage : 0;
            $compositeScore = round($matricComponent + $testComponent, 2);

            $testStatus = $attempt->entrance_marks_obtained >= $exam->passing_marks ? 'passed' : 'failed';

            $attempt->update([
                'composite_merit_score' => $compositeScore,
                'status' => 'completed',
            ]);

            if ($attempt->application) {
                $attempt->application->update([
                    'merit_score' => $compositeScore,
                    'test_status' => $testStatus,
                ]);
            }

            $processed++;
        }

        return redirect()->back()->with('success', "Composite merit scores recalculated for {$processed} candidate(s).");
    }
}
