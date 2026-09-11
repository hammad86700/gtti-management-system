<?php

namespace App\Http\Controllers\Clerk;

use App\Domains\Organization\Models\Course;
use App\Domains\Organization\Models\Trade;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseManagementController extends Controller
{
    /**
     * Display a listing of courses and trades with intake statistics.
     */
    public function index(): Response
    {
        $courses = Course::with(['trade.program.department'])
            ->withCount([
                'applications as total_applicants',
                'applications as pending_applicants' => function ($q) {
                    $q->pendingScrutiny();
                },
                'applications as verified_applicants' => function ($q) {
                    $q->where('status', 'verified');
                },
            ])
            ->orderBy('name')
            ->get();

        $trades = Trade::with('program.department')->orderBy('name')->get();
        $categories = Course::whereNotNull('category')->distinct()->pluck('category')->filter()->values();

        return Inertia::render('Clerk/Courses/Index', [
            'courses' => $courses,
            'trades' => $trades,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created course in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'trade_id' => 'required|exists:trades,id',
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:150',
            'overview_description' => 'nullable|string|max:3000',
            'duration_type' => 'nullable|in:months,weeks,days,hours',
            'duration_value' => 'nullable|integer|min:1|max:365',
            'total_academic_days' => 'nullable|integer|min:1|max:500',
            'entry_level' => 'required|string|max:100',
            'admission_type' => 'required|in:merit_based,first_come_first_served',
            'requires_entrance_test' => 'nullable|boolean',
            'intake_capacity' => 'nullable|integer|min:1|max:500',
            'classes_start_date' => 'nullable|date',
            'matric_weightage' => 'nullable|integer|min:0|max:100',
            'test_weightage' => 'nullable|integer|min:0|max:100',
            'interview_weightage' => 'nullable|integer|min:0|max:100',
            'interview_max_marks' => 'nullable|integer|min:1|max:100',
            'interview_venue' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'is_published' => 'boolean',
            'offered_shifts' => 'nullable|in:Both,Morning,Evening',
            'syllabus_document' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            'advertisement_image' => 'nullable|file|image|mimes:jpeg,png,jpg,webp,svg|max:5120',
        ]);

        $isFcfs = ($validated['admission_type'] === 'first_come_first_served');
        $requiresTest = $isFcfs ? false : ($request->has('requires_entrance_test') ? $request->boolean('requires_entrance_test') : true);

        $syllabusPath = null;
        if ($request->hasFile('syllabus_document')) {
            $syllabusPath = $request->file('syllabus_document')->store('syllabi', 'public');
        }

        $adPath = null;
        if ($request->hasFile('advertisement_image')) {
            $adPath = $request->file('advertisement_image')->store('course_advertisements', 'public');
        }

        $course = Course::create([
            'trade_id' => $validated['trade_id'],
            'name' => $validated['name'],
            'category' => ($validated['category'] ?? null) ?: 'General Vocational',
            'overview_description' => $validated['overview_description'] ?? null,
            'duration_type' => $validated['duration_type'] ?? 'months',
            'duration_value' => $validated['duration_value'] ?? 6,
            'total_academic_days' => $validated['total_academic_days'] ?? 60,
            'entry_level' => $validated['entry_level'],
            'admission_type' => $validated['admission_type'],
            'requires_entrance_test' => $requiresTest,
            'offered_shifts' => $validated['offered_shifts'] ?? 'Both',
            'intake_capacity' => $validated['intake_capacity'] ?? 50,
            'classes_start_date' => $validated['classes_start_date'] ?? null,
            'matric_weightage' => $validated['matric_weightage'] ?? 50,
            'test_weightage' => $validated['test_weightage'] ?? 40,
            'interview_weightage' => $validated['interview_weightage'] ?? 10,
            'interview_max_marks' => $validated['interview_max_marks'] ?? 10,
            'interview_venue' => ($validated['interview_venue'] ?? null) ?: 'Lab 3 / Interview Room',
            'is_active' => $request->boolean('is_active', true),
            'is_published' => $request->boolean('is_published', true),
            'syllabus_document_path' => $syllabusPath,
            'advertisement_image_path' => $adPath,
        ]);

        $course->ensureShiftBatchesExist();

        if (function_exists('activity')) {
            activity()
                ->causedBy(auth()->user())
                ->performedOn($course)
                ->log("Admission Clerk created course '{$course->name}' with intake capacity of {$course->intake_capacity} seats");
        }

        return redirect()->back()->with('success', "Course '{$course->name}' created successfully with intake limit of {$course->intake_capacity} seats.");
    }

    /**
     * Update the specified course in storage.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'trade_id' => 'required|exists:trades,id',
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:150',
            'overview_description' => 'nullable|string|max:3000',
            'duration_type' => 'nullable|in:months,weeks,days,hours',
            'duration_value' => 'nullable|integer|min:1|max:365',
            'total_academic_days' => 'nullable|integer|min:1|max:500',
            'entry_level' => 'required|string|max:100',
            'admission_type' => 'required|in:merit_based,first_come_first_served',
            'requires_entrance_test' => 'nullable',
            'intake_capacity' => 'nullable|integer|min:1|max:500',
            'classes_start_date' => 'nullable|date',
            'matric_weightage' => 'nullable|integer|min:0|max:100',
            'test_weightage' => 'nullable|integer|min:0|max:100',
            'interview_weightage' => 'nullable|integer|min:0|max:100',
            'interview_max_marks' => 'nullable|integer|min:1|max:100',
            'interview_venue' => 'nullable|string|max:255',
            'is_active' => 'nullable',
            'is_published' => 'nullable',
            'offered_shifts' => 'nullable|in:Both,Morning,Evening',
            'syllabus_document' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            'advertisement_image' => 'nullable|file|image|mimes:jpeg,png,jpg,webp,svg|max:5120',
            'remove_advertisement' => 'nullable',
        ]);

        $isFcfs = ($validated['admission_type'] === 'first_come_first_served');
        $requiresTest = $isFcfs ? false : ($request->has('requires_entrance_test') ? $request->boolean('requires_entrance_test') : true);

        $syllabusPath = $course->syllabus_document_path;
        if ($request->hasFile('syllabus_document')) {
            $syllabusPath = $request->file('syllabus_document')->store('syllabi', 'public');
        }

        $adPath = $course->advertisement_image_path;
        if ($request->boolean('remove_advertisement')) {
            if ($adPath && \Illuminate\Support\Facades\Storage::disk('public')->exists($adPath)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($adPath);
            }
            $adPath = null;
        } elseif ($request->hasFile('advertisement_image')) {
            if ($adPath && \Illuminate\Support\Facades\Storage::disk('public')->exists($adPath)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($adPath);
            }
            $adPath = $request->file('advertisement_image')->store('course_advertisements', 'public');
        }

        $course->update([
            'trade_id' => $validated['trade_id'],
            'name' => $validated['name'],
            'category' => ($validated['category'] ?? null) ?: ($course->category ?: 'General Vocational'),
            'overview_description' => array_key_exists('overview_description', $validated) ? $validated['overview_description'] : $course->overview_description,
            'duration_type' => $validated['duration_type'] ?? ($course->duration_type ?: 'months'),
            'duration_value' => $validated['duration_value'] ?? ($course->duration_value ?: 6),
            'total_academic_days' => $validated['total_academic_days'] ?? ($course->total_academic_days ?: 60),
            'entry_level' => $validated['entry_level'],
            'admission_type' => $validated['admission_type'],
            'requires_entrance_test' => $requiresTest,
            'offered_shifts' => $validated['offered_shifts'] ?? ($course->offered_shifts ?: 'Both'),
            'intake_capacity' => $validated['intake_capacity'] ?? ($course->intake_capacity ?: 50),
            'classes_start_date' => array_key_exists('classes_start_date', $validated) ? $validated['classes_start_date'] : $course->classes_start_date,
            'matric_weightage' => $validated['matric_weightage'] ?? 50,
            'test_weightage' => $validated['test_weightage'] ?? 40,
            'interview_weightage' => $validated['interview_weightage'] ?? 10,
            'interview_max_marks' => $validated['interview_max_marks'] ?? 10,
            'interview_venue' => ($validated['interview_venue'] ?? null) ?: ($course->interview_venue ?: 'Lab 3 / Interview Room'),
            'is_active' => $request->boolean('is_active', true),
            'is_published' => $request->has('is_published') ? $request->boolean('is_published') : $course->is_published,
            'syllabus_document_path' => $syllabusPath,
            'advertisement_image_path' => $adPath,
        ]);

        $course->ensureShiftBatchesExist();

        return redirect()->back()->with('success', "Course '{$course->name}' updated successfully.");
    }

    /**
     * Soft delete/archive the specified course.
     */
    public function destroy(int $id): RedirectResponse
    {
        $course = Course::findOrFail($id);
        $courseName = $course->name;
        $course->delete();

        return redirect()->back()->with('success', "Course '{$courseName}' archived successfully.");
    }

    /**
     * Generate Fee Challans for selected candidates of this course.
     */
    public function generateChallans(int $courseId): RedirectResponse
    {
        $course = Course::findOrFail($courseId);
        $updated = \App\Domains\Admissions\Models\Application::where('course_id', $course->id)
            ->where(function ($q) {
                $q->where('status', 'selected_for_admission')
                  ->orWhereHas('entranceTestAttempt', function ($sub) {
                      $sub->where('selection_status', 'selected');
                  });
            })
            ->update([
                'fee_status' => 'unpaid',
                'status' => 'selected_for_admission',
                'updated_at' => now(),
            ]);

        return redirect()->back()->with('success', "Official Admission Fee Challans generated for {$updated} selected candidate(s) of '{$course->name}'. Trainee portals unlocked for fee deposit.");
    }

    /**
     * 1-Click quick toggle course public visibility (Published vs Draft).
     */
    public function togglePublish(int $id): RedirectResponse
    {
        $course = Course::findOrFail($id);
        $course->is_published = !$course->is_published;
        $course->save();

        $statusText = $course->is_published ? 'Published Live on public website catalog' : 'Unpublished (Draft / Hidden from public)';

        if (function_exists('activity')) {
            activity()
                ->causedBy(auth()->user())
                ->performedOn($course)
                ->log("Admission Clerk set course '{$course->name}' visibility to {$statusText}");
        }

        return redirect()->back()->with('success', "Course '{$course->name}' is now {$statusText}.");
    }
}
