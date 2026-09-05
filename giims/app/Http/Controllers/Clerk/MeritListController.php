<?php

namespace App\Http\Controllers\Clerk;

use App\Domains\Admissions\Models\MeritList;
use App\Domains\Operations\Models\Announcement;
use App\Domains\Organization\Models\Course;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MeritListController extends Controller
{
    /**
     * Display the Clerk Merit List Upload and Management Desk.
     */
    public function index(Request $request): Response
    {
        $courseId = $request->input('course_id');
        $status = $request->input('status', 'all');

        $query = MeritList::with(['course.trade.program', 'uploader'])
            ->latest('updated_at');

        if ($courseId) {
            $query->where('course_id', $courseId);
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $meritLists = $query->paginate(15)->withQueryString();

        $courses = Course::where('is_active', true)
            ->with('trade')
            ->orderBy('name')
            ->get();

        return Inertia::render('Clerk/MeritLists/Index', [
            'meritLists' => $meritLists,
            'courses' => $courses,
            'filters' => [
                'course_id' => $courseId,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Store and upload a new official Merit List document.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'merit_document' => 'required|file|mimes:pdf,jpg,jpeg,png,xlsx,csv|max:10240',
            'classes_start_date' => 'nullable|date',
            'remarks' => 'nullable|string|max:1000',
            'status' => 'required|in:published,draft',
        ]);

        $course = Course::findOrFail($validated['course_id']);
        $file = $request->file('merit_document');
        $filePath = $file->store('merit_lists', 'public');
        $fileName = $file->getClientOriginalName();

        $meritList = MeritList::create([
            'course_id' => $course->id,
            'title' => $validated['title'],
            'file_path' => $filePath,
            'file_name' => $fileName,
            'classes_start_date' => $validated['classes_start_date'] ?? $course->classes_start_date,
            'uploaded_by' => auth()->id(),
            'remarks' => $validated['remarks'],
            'status' => $validated['status'],
            'published_at' => $validated['status'] === 'published' ? now() : null,
        ]);

        // If published, broadcast institutional announcement to all students
        if ($validated['status'] === 'published') {
            $commenceText = $meritList->classes_start_date 
                ? ' Classes commence on ' . $meritList->classes_start_date->format('l, d F Y') . '.'
                : '';

            Announcement::create([
                'created_by' => auth()->id(),
                'title' => "Official Merit List Published: {$course->name}",
                'message' => "The official Merit List for '{$course->name}' has been uploaded and published by the Admission Office.{$commenceText} Please check your student portal to review the list and fee voucher.",
                'target_audience' => 'students',
            ]);
        }

        if (function_exists('activity')) {
            activity()
                ->causedBy(auth()->user())
                ->performedOn($meritList)
                ->log("Admission Clerk uploaded merit list '{$meritList->title}' for '{$course->name}'");
        }

        return redirect()->back()->with('success', "Official Merit List '{$meritList->title}' uploaded and saved successfully.");
    }

    /**
     * Download or view the uploaded Merit List document.
     */
    public function download(int $id)
    {
        $meritList = MeritList::findOrFail($id);

        if (!$meritList->file_path || !Storage::disk('public')->exists($meritList->file_path)) {
            return redirect()->back()->with('error', 'Merit List file document not found.');
        }

        return response()->file(Storage::disk('public')->path($meritList->file_path));
    }

    /**
     * Toggle the publication status of a merit list.
     */
    public function togglePublish(int $id): RedirectResponse
    {
        $meritList = MeritList::with('course')->findOrFail($id);
        $newStatus = $meritList->status === 'published' ? 'draft' : 'published';

        $meritList->update([
            'status' => $newStatus,
            'published_at' => $newStatus === 'published' ? now() : null,
        ]);

        if ($newStatus === 'published' && $meritList->course) {
            Announcement::create([
                'created_by' => auth()->id(),
                'title' => "Official Merit List Published: {$meritList->course->name}",
                'message' => "The official Merit List for '{$meritList->course->name}' is now live on the Student Portal.",
                'target_audience' => 'students',
            ]);
        }

        return redirect()->back()->with('success', "Merit list '{$meritList->title}' is now {$newStatus}.");
    }

    /**
     * Delete an uploaded merit list.
     */
    public function destroy(int $id): RedirectResponse
    {
        $meritList = MeritList::findOrFail($id);

        if ($meritList->file_path && Storage::disk('public')->exists($meritList->file_path)) {
            Storage::disk('public')->delete($meritList->file_path);
        }

        $meritList->delete();

        return redirect()->back()->with('success', 'Merit list deleted successfully.');
    }
}
