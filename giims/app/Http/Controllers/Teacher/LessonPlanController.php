<?php

namespace App\Http\Controllers\Teacher;

use App\Domains\Academic\Models\LessonPlan;
use App\Domains\Academic\Models\Subject;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LessonPlanController extends Controller
{
    /**
     * Display lesson plans for a specific assigned batch.
     */
    public function index(int $batchId): Response
    {
        $batch = auth()->user()->batches()
            ->with(['course.trade.program.department'])
            ->findOrFail($batchId);

        $subjects = Subject::where('course_id', $batch->course_id)->get();

        $lessonPlans = LessonPlan::with('subject')
            ->where('batch_id', $batchId)
            ->where('user_id', auth()->id())
            ->orderBy('planned_date', 'desc')
            ->get();

        return Inertia::render('Teacher/LessonPlans/Index', [
            'batch' => $batch,
            'subjects' => $subjects,
            'lessonPlans' => $lessonPlans,
        ]);
    }

    /**
     * Store a newly created lesson plan with optional attached document.
     */
    public function store(Request $request, int $batchId): RedirectResponse
    {
        $batch = auth()->user()->batches()->findOrFail($batchId);

        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'title' => 'required|string|max:255',
            'planned_date' => 'required|date',
            'description' => 'nullable|string',
            'document' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,jpg,jpeg,png|max:5120',
        ]);

        $path = $request->hasFile('document')
            ? $request->file('document')->store('private/lessons', 'local')
            : null;

        LessonPlan::create([
            'batch_id' => $batch->id,
            'subject_id' => $validated['subject_id'],
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'planned_date' => $validated['planned_date'],
            'description' => $validated['description'] ?? null,
            'file_path' => $path,
        ]);

        return redirect()->back()->with('success', 'Lesson plan created successfully.');
    }
}
