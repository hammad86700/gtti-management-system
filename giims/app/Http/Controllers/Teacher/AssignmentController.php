<?php

namespace App\Http\Controllers\Teacher;

use App\Domains\Academic\Models\Assignment;
use App\Domains\Academic\Models\AssignmentSubmission;
use App\Domains\Academic\Models\Subject;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    /**
     * Display assignments and trainee submissions for an assigned batch.
     */
    public function index(int $batchId): Response
    {
        $batch = auth()->user()->batches()
            ->with(['course.trade.program.department'])
            ->findOrFail($batchId);

        $subjects = Subject::where('course_id', $batch->course_id)->get();

        $assignments = Assignment::with([
                'subject',
                'submissions.studentProfile.user',
            ])
            ->where('batch_id', $batchId)
            ->orderBy('due_date', 'desc')
            ->get();

        return Inertia::render('Teacher/Assignments/Index', [
            'batch' => $batch,
            'subjects' => $subjects,
            'assignments' => $assignments,
        ]);
    }

    /**
     * Store a newly created assignment with optional task attachment.
     */
    public function store(Request $request, int $batchId): RedirectResponse
    {
        $batch = auth()->user()->batches()->findOrFail($batchId);

        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'title' => 'required|string|max:255',
            'due_date' => 'required|date',
            'total_marks' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'document' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,jpg,jpeg,png,zip|max:5120',
        ]);

        $path = $request->hasFile('document')
            ? $request->file('document')->store('private/assignments', 'local')
            : null;

        Assignment::create([
            'batch_id' => $batch->id,
            'subject_id' => $validated['subject_id'],
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'due_date' => $validated['due_date'],
            'total_marks' => $validated['total_marks'],
            'file_path' => $path,
        ]);

        return redirect()->back()->with('success', 'Assignment published successfully.');
    }

    /**
     * Grade a student's assignment submission.
     */
    public function grade(Request $request, int $submissionId): RedirectResponse
    {
        $validated = $request->validate([
            'obtained_marks' => 'required|numeric|min:0',
            'feedback' => 'nullable|string',
        ]);

        $submission = AssignmentSubmission::with('assignment')->findOrFail($submissionId);

        // Security check: Verify the teacher is assigned to the batch of this assignment
        $batch = auth()->user()->batches()->findOrFail($submission->assignment->batch_id);

        $submission->update([
            'obtained_marks' => $validated['obtained_marks'],
            'feedback' => $validated['feedback'] ?? null,
            'status' => 'graded',
        ]);

        return redirect()->back()->with('success', 'Submission graded successfully.');
    }
}
