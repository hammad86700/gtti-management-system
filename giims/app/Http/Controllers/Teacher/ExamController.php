<?php

namespace App\Http\Controllers\Teacher;

use App\Domains\Academic\Models\Subject;
use App\Domains\Examination\Models\Exam;
use App\Domains\Examination\Models\ExamResult;
use App\Domains\Student\Models\Enrollment;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    /**
     * Display examinations list and exam creation modal for a batch.
     */
    public function index(int $batchId): Response
    {
        $batch = auth()->user()->batches()
            ->with(['course.trade.program.department', 'enrollments'])
            ->findOrFail($batchId);

        $subjects = Subject::where('course_id', $batch->course_id)->get();

        $exams = Exam::with(['subject', 'lockedBy', 'examResults'])
            ->where('batch_id', $batchId)
            ->latest()
            ->get();

        return Inertia::render('Teacher/Exams/Index', [
            'batch' => $batch,
            'subjects' => $subjects,
            'exams' => $exams,
        ]);
    }

    /**
     * Store a new formal examination assessment.
     */
    public function store(Request $request, int $batchId): RedirectResponse
    {
        $batch = auth()->user()->batches()->findOrFail($batchId);

        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'title' => 'required|string|max:255',
            'exam_date' => 'required|date',
            'total_theory_marks' => 'required|integer|min:0',
            'total_practical_marks' => 'required|integer|min:0',
        ]);

        $exam = Exam::create([
            'batch_id' => $batch->id,
            'subject_id' => $validated['subject_id'],
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'exam_date' => $validated['exam_date'],
            'total_theory_marks' => $validated['total_theory_marks'],
            'total_practical_marks' => $validated['total_practical_marks'],
            'is_locked' => false,
        ]);

        // Auto-consume examination materials from approved batch demand items
        $consumptionService = app(\App\Services\InventoryConsumptionService::class);
        $consumedUnits = $consumptionService->consumeForExam($exam);

        $msg = 'Examination assessment created successfully.';
        if ($consumedUnits > 0) {
            $msg .= " System auto-deducted {$consumedUnits} consumable units from approved batch material inventory.";
        }

        return redirect()->back()->with('success', $msg);
    }

    /**
     * Display the assessment gradebook for marks entry.
     */
    public function show(int $examId): Response
    {
        $exam = Exam::with([
                'batch.course.trade.program.department',
                'subject',
                'lockedBy',
                'examResults.studentProfile.user',
            ])
            ->findOrFail($examId);

        // Verify teacher belongs to the batch
        auth()->user()->batches()->findOrFail($exam->batch_id);

        $enrollments = Enrollment::where('batch_id', $exam->batch_id)
            ->where('status', 'active')
            ->with('studentProfile.user')
            ->get();

        return Inertia::render('Teacher/Exams/Gradebook', [
            'exam' => $exam,
            'enrollments' => $enrollments,
        ]);
    }

    /**
     * Record candidate marks in the gradebook with strict result-lock verification.
     */
    public function storeMarks(Request $request, int $examId): RedirectResponse
    {
        $exam = Exam::findOrFail($examId);

        // Verify teacher belongs to the batch
        auth()->user()->batches()->findOrFail($exam->batch_id);

        // Strict Anti-Tamper Security Check
        if ($exam->is_locked) {
            abort(403, 'Examination results are officially verified and locked by administration. No further modifications are permitted.');
        }

        $validated = $request->validate([
            'results' => 'required|array|min:1',
            'results.*.student_profile_id' => 'required|exists:student_profiles,id',
            'results.*.obtained_theory_marks' => 'nullable|integer|min:0|max:' . $exam->total_theory_marks,
            'results.*.obtained_practical_marks' => 'nullable|integer|min:0|max:' . $exam->total_practical_marks,
            'results.*.status' => 'required|in:graded,absent,cheating',
        ]);

        foreach ($validated['results'] as $res) {
            ExamResult::updateOrCreate(
                [
                    'exam_id' => $exam->id,
                    'student_profile_id' => $res['student_profile_id'],
                ],
                [
                    'obtained_theory_marks' => $res['status'] === 'graded' ? $res['obtained_theory_marks'] : null,
                    'obtained_practical_marks' => $res['status'] === 'graded' ? $res['obtained_practical_marks'] : null,
                    'status' => $res['status'],
                ]
            );
        }

        return redirect()->back()->with('success', 'Candidate marks saved in gradebook successfully.');
    }
}
