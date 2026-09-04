<?php

namespace App\Http\Controllers\Teacher;

use App\Domains\Academic\Models\DailyLesson;
use App\Domains\Organization\Models\Batch;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CurriculumRoadmapController extends Controller
{
    /**
     * Display the Day-by-Day Curriculum Roadmap Cockpit for an assigned batch.
     */
    public function index(int $batchId): Response
    {
        $user = auth()->user();
        $batch = $user->hasRole('admin')
            ? Batch::with(['course.trade.program.department', 'enrollments.studentProfile.user'])->findOrFail($batchId)
            : $user->batches()->with(['course.trade.program.department', 'enrollments.studentProfile.user'])->findOrFail($batchId);

        $course = $batch->course;
        $lessons = DailyLesson::where('batch_id', $batchId)
            ->ordered()
            ->get();

        $totalDays = max((int) ($course?->total_academic_days ?: 60), $lessons->count());
        $completedCount = $lessons->where('status', 'completed')->count();
        $progressPercent = $totalDays > 0 ? round(($completedCount / $totalDays) * 100, 1) : 0;

        return Inertia::render('Teacher/Curriculum/Index', [
            'batch' => $batch,
            'course' => $course,
            'lessons' => $lessons,
            'stats' => [
                'total_days' => $totalDays,
                'planned_days' => $lessons->count(),
                'completed_days' => $completedCount,
                'progress_percent' => $progressPercent,
            ],
        ]);
    }

    /**
     * Bulk-import day-by-day lesson syllabus via CSV upload.
     */
    public function bulkImport(Request $request, int $batchId): RedirectResponse
    {
        $user = auth()->user();
        $batch = $user->hasRole('admin')
            ? Batch::findOrFail($batchId)
            : $user->batches()->findOrFail($batchId);

        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        $path = $request->file('csv_file')->getRealPath();
        $file = fopen($path, 'r');
        $headers = fgetcsv($file);

        if (!$headers) {
            fclose($file);
            return redirect()->back()->with('error', 'The uploaded CSV file is empty.');
        }

        // Clean and normalize headers (lowercase, trim)
        $cleanHeaders = array_map(fn($h) => strtolower(trim($h)), $headers);
        $dayIdx = array_search('daynumber', $cleanHeaders);
        if ($dayIdx === false) $dayIdx = array_search('day', $cleanHeaders);

        $titleIdx = array_search('topictitle', $cleanHeaders);
        if ($titleIdx === false) $titleIdx = array_search('topic', $cleanHeaders);
        if ($titleIdx === false) $titleIdx = array_search('title', $cleanHeaders);

        $theoryIdx = array_search('theorycontent', $cleanHeaders);
        if ($theoryIdx === false) $theoryIdx = array_search('theory', $cleanHeaders);

        $practicalIdx = array_search('practicaltask', $cleanHeaders);
        if ($practicalIdx === false) $practicalIdx = array_search('practical', $cleanHeaders);

        if ($dayIdx === false || $titleIdx === false) {
            fclose($file);
            return redirect()->back()->with('error', 'Invalid CSV format. Required headers: DayNumber, TopicTitle, TheoryContent, PracticalTask');
        }

        $imported = 0;
        $rowNum = 1;

        while (($row = fgetcsv($file)) !== false) {
            $rowNum++;
            if (empty(array_filter($row))) continue;

            $dayNumber = isset($row[$dayIdx]) ? (int) trim($row[$dayIdx]) : null;
            $topicTitle = isset($row[$titleIdx]) ? trim($row[$titleIdx]) : '';
            $theory = ($theoryIdx !== false && isset($row[$theoryIdx])) ? trim($row[$theoryIdx]) : null;
            $practical = ($practicalIdx !== false && isset($row[$practicalIdx])) ? trim($row[$practicalIdx]) : null;

            if ($dayNumber && !empty($topicTitle)) {
                DailyLesson::updateOrCreate(
                    [
                        'batch_id' => $batch->id,
                        'day_number' => $dayNumber,
                    ],
                    [
                        'topic_title' => $topicTitle,
                        'theory_content' => $theory,
                        'practical_task' => $practical,
                    ]
                );
                $imported++;
            }
        }

        fclose($file);

        if (function_exists('activity')) {
            activity()
                ->causedBy($user)
                ->performedOn($batch)
                ->log("Instructor bulk-imported {$imported} daily curriculum lessons for batch '{$batch->name}'");
        }

        return redirect()->back()->with('success', "Successfully imported {$imported} day-by-day lessons into the batch curriculum roadmap.");
    }

    /**
     * Store or update a single day lesson record manually.
     */
    public function storeDailyLesson(Request $request, int $batchId): RedirectResponse
    {
        $user = auth()->user();
        $batch = $user->hasRole('admin')
            ? Batch::findOrFail($batchId)
            : $user->batches()->findOrFail($batchId);

        $validated = $request->validate([
            'day_number' => 'required|integer|min:1|max:500',
            'scheduled_date' => 'nullable|date',
            'topic_title' => 'required|string|max:255',
            'theory_content' => 'nullable|string',
            'practical_task' => 'nullable|string',
            'resource_url' => 'nullable|url|max:500',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,zip|max:10240',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('curriculum', 'public');
        }

        $lesson = DailyLesson::where('batch_id', $batch->id)
            ->where('day_number', $validated['day_number'])
            ->first();

        if ($lesson) {
            $lesson->update([
                'scheduled_date' => $validated['scheduled_date'] ?? $lesson->scheduled_date,
                'topic_title' => $validated['topic_title'],
                'theory_content' => $validated['theory_content'] ?? $lesson->theory_content,
                'practical_task' => $validated['practical_task'] ?? $lesson->practical_task,
                'resource_url' => $validated['resource_url'] ?? $lesson->resource_url,
                'attachment_path' => $attachmentPath ?: $lesson->attachment_path,
            ]);
        } else {
            DailyLesson::create([
                'batch_id' => $batch->id,
                'day_number' => $validated['day_number'],
                'scheduled_date' => $validated['scheduled_date'] ?? null,
                'topic_title' => $validated['topic_title'],
                'theory_content' => $validated['theory_content'] ?? null,
                'practical_task' => $validated['practical_task'] ?? null,
                'resource_url' => $validated['resource_url'] ?? null,
                'attachment_path' => $attachmentPath,
                'status' => 'pending',
            ]);
        }

        return redirect()->back()->with('success', "Day {$validated['day_number']} lesson plan updated successfully.");
    }

    /**
     * Toggle the completion status of a daily lesson.
     */
    public function toggleCompletion(Request $request, int $lessonId): RedirectResponse
    {
        $lesson = DailyLesson::findOrFail($lessonId);

        $newStatus = $lesson->status === 'completed' ? 'pending' : 'completed';
        $lesson->update([
            'status' => $newStatus,
            'completed_at' => $newStatus === 'completed' ? now() : null,
        ]);

        return redirect()->back()->with(
            'success',
            $newStatus === 'completed'
                ? "Day {$lesson->day_number} marked as completed."
                : "Day {$lesson->day_number} marked as pending."
        );
    }

    /**
     * Attach a handout/lab manual or external link to a daily lesson.
     */
    public function attachResource(Request $request, int $lessonId): RedirectResponse
    {
        $lesson = DailyLesson::findOrFail($lessonId);

        $validated = $request->validate([
            'resource_url' => 'nullable|url|max:500',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,zip|max:10240',
        ]);

        $attachmentPath = $lesson->attachment_path;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('curriculum', 'public');
        }

        $lesson->update([
            'resource_url' => $validated['resource_url'] ?? $lesson->resource_url,
            'attachment_path' => $attachmentPath,
        ]);

        return redirect()->back()->with('success', "Resource attached to Day {$lesson->day_number} successfully.");
    }
}
