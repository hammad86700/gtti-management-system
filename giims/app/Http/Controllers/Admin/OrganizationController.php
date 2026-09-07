<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Organization\Models\Batch;
use App\Domains\Organization\Models\Course;
use App\Domains\Organization\Models\Department;
use App\Domains\Organization\Models\Institute;
use App\Domains\Organization\Models\Program;
use App\Domains\Organization\Models\Trade;
use App\Domains\Student\Models\Enrollment;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    /**
     * Display a listing of departments, programs, trades, courses, and batches.
     */
    public function index(): Response
    {
        $departments = Department::with([
            'programs.trades.courses' => function ($q) {
                $q->withCount([
                    'enrollments',
                    'enrollments as active_enrollments_count' => fn ($eq) => $eq->where('status', 'active'),
                    'enrollments as struck_off_enrollments_count' => fn ($eq) => $eq->where('status', 'struck_off'),
                    'enrollments as terminated_enrollments_count' => fn ($eq) => $eq->where('status', 'terminated'),
                ])->with(['batches' => function ($bq) {
                    $bq->withCount([
                        'enrollments',
                        'enrollments as active_enrollments_count' => fn ($eq) => $eq->where('status', 'active'),
                        'enrollments as struck_off_enrollments_count' => fn ($eq) => $eq->where('status', 'struck_off'),
                        'enrollments as terminated_enrollments_count' => fn ($eq) => $eq->where('status', 'terminated'),
                    ]);
                }]);
            },
        ])->get();

        $allDepartments = Department::select('id', 'name', 'code')->orderBy('name')->get();
        $allPrograms = Program::with('department')->orderBy('name')->get();
        $allTrades = Trade::with('program')->orderBy('name')->get();
        $allCourses = Course::with('trade.program')->orderBy('name')->get();

        return Inertia::render('Admin/Organization/Index', [
            'departments' => $departments,
            'allDepartments' => $allDepartments,
            'allPrograms' => $allPrograms,
            'allTrades' => $allTrades,
            'allCourses' => $allCourses,
        ]);
    }

    // =========================================================================
    // COURSE CRUD
    // =========================================================================

    public function storeCourse(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'trade_id' => 'required|exists:trades,id',
            'name' => 'required|string|max:255',
            'entry_level' => 'required|string|max:100',
            'is_active' => 'nullable|boolean',
            'advertisement_image' => 'nullable|file|image|mimes:jpeg,png,jpg,webp,svg|max:5120',
        ]);

        $adPath = null;
        if ($request->hasFile('advertisement_image')) {
            $adPath = $request->file('advertisement_image')->store('course_advertisements', 'public');
        }

        Course::create([
            'trade_id' => $validated['trade_id'],
            'name' => $validated['name'],
            'entry_level' => $validated['entry_level'],
            'is_active' => $validated['is_active'] ?? true,
            'advertisement_image_path' => $adPath,
        ]);

        return redirect()->back()->with('success', "Course '{$validated['name']}' created successfully.");
    }

    public function updateCourse(Request $request, int $id): RedirectResponse
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'trade_id' => 'required|exists:trades,id',
            'name' => 'required|string|max:255',
            'entry_level' => 'required|string|max:100',
            'is_active' => 'nullable|boolean',
            'advertisement_image' => 'nullable|file|image|mimes:jpeg,png,jpg,webp,svg|max:5120',
            'remove_advertisement' => 'nullable',
        ]);

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
            'entry_level' => $validated['entry_level'],
            'is_active' => $validated['is_active'] ?? true,
            'advertisement_image_path' => $adPath,
        ]);

        return redirect()->back()->with('success', "Course '{$course->name}' updated successfully.");
    }

    public function destroyCourse(int $id): RedirectResponse
    {
        $course = Course::findOrFail($id);
        $name = $course->name;
        $course->delete();

        return redirect()->back()->with('success', "Course '{$name}' deleted successfully.");
    }

    // =========================================================================
    // DEPARTMENT CRUD
    // =========================================================================

    public function storeDepartment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:departments,code',
        ]);

        $instituteId = auth()->user()->institute_id ?? Institute::first()?->id;

        Department::create([
            'institute_id' => $instituteId,
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', "Department '{$validated['name']}' created successfully.");
    }

    public function updateDepartment(Request $request, int $id): RedirectResponse
    {
        $department = Department::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:departments,code,' . $id,
        ]);

        $department->update([
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
        ]);

        return redirect()->back()->with('success', "Department '{$department->name}' updated successfully.");
    }

    public function destroyDepartment(int $id): RedirectResponse
    {
        $department = Department::findOrFail($id);
        $name = $department->name;
        $department->delete();

        return redirect()->back()->with('success', "Department '{$name}' deleted successfully.");
    }

    // =========================================================================
    // PROGRAM CRUD
    // =========================================================================

    public function storeProgram(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'duration_months' => 'required|integer|min:1|max:72',
        ]);

        Program::create($validated);

        return redirect()->back()->with('success', "Program '{$validated['name']}' created successfully.");
    }

    public function updateProgram(Request $request, int $id): RedirectResponse
    {
        $program = Program::findOrFail($id);

        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'duration_months' => 'required|integer|min:1|max:72',
        ]);

        $program->update($validated);

        return redirect()->back()->with('success', "Program '{$program->name}' updated successfully.");
    }

    public function destroyProgram(int $id): RedirectResponse
    {
        $program = Program::findOrFail($id);
        $name = $program->name;
        $program->delete();

        return redirect()->back()->with('success', "Program '{$name}' deleted successfully.");
    }

    // =========================================================================
    // TRADE CRUD
    // =========================================================================

    public function storeTrade(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
        ]);

        Trade::create([
            'program_id' => $validated['program_id'],
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
        ]);

        return redirect()->back()->with('success', "Trade '{$validated['name']}' created successfully.");
    }

    public function updateTrade(Request $request, int $id): RedirectResponse
    {
        $trade = Trade::findOrFail($id);

        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
        ]);

        $trade->update([
            'program_id' => $validated['program_id'],
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
        ]);

        return redirect()->back()->with('success', "Trade '{$trade->name}' updated successfully.");
    }

    public function destroyTrade(int $id): RedirectResponse
    {
        $trade = Trade::findOrFail($id);
        $name = $trade->name;
        $trade->delete();

        return redirect()->back()->with('success', "Trade '{$name}' deleted successfully.");
    }

    // =========================================================================
    // BATCH CRUD
    // =========================================================================

    public function storeBatch(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'name' => 'required|string|max:255',
            'session_year' => 'required|string|max:50',
            'shift' => 'required|in:morning,evening,afternoon',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        Batch::create($validated);

        return redirect()->back()->with('success', "Batch '{$validated['name']}' created successfully.");
    }

    public function updateBatch(Request $request, int $id): RedirectResponse
    {
        $batch = Batch::findOrFail($id);

        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'name' => 'required|string|max:255',
            'session_year' => 'required|string|max:50',
            'shift' => 'required|in:morning,evening,afternoon',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $batch->update($validated);

        return redirect()->back()->with('success', "Batch '{$batch->name}' updated successfully.");
    }

    public function destroyBatch(int $id): RedirectResponse
    {
        $batch = Batch::findOrFail($id);
        $name = $batch->name;
        $batch->delete();

        return redirect()->back()->with('success', "Batch '{$name}' deleted successfully.");
    }

    // =========================================================================
    // TRAINEE ROSTER DRILL-DOWN (PHASE 24)
    // =========================================================================

    /**
     * Fetch all enrolled trainees under a specific course with disciplinary status.
     */
    public function courseStudents(int $courseId): JsonResponse
    {
        $course = Course::with('trade.program.department')->findOrFail($courseId);

        $enrollments = Enrollment::where('course_id', $courseId)
            ->with([
                'studentProfile.user',
                'batch',
                'disciplinedBy',
            ])
            ->latest('enrollment_date')
            ->get()
            ->map(function ($enr) {
                return [
                    'id' => $enr->id,
                    'enrollment_number' => $enr->enrollment_number,
                    'enrollment_date' => $enr->enrollment_date?->format('d M Y'),
                    'status' => $enr->status,
                    'struck_off_at' => $enr->struck_off_at?->format('d M Y, h:i A'),
                    'struck_off_until' => $enr->struck_off_until?->format('d M Y, h:i A'),
                    'struck_off_days' => $enr->struck_off_days,
                    'remaining_days' => $enr->remainingSuspensionDays(),
                    'disciplinary_reason' => $enr->disciplinary_reason,
                    'disciplined_by' => $enr->disciplinedBy?->name,
                    'batch_id' => $enr->batch_id,
                    'batch_name' => $enr->batch?->name ?? 'Default Batch',
                    'student_profile_id' => $enr->student_profile_id,
                    'user_id' => $enr->studentProfile?->user_id,
                    'name' => $enr->studentProfile?->user?->name ?? 'Trainee',
                    'email' => $enr->studentProfile?->user?->email,
                    'cnic' => $enr->studentProfile?->user?->cnic ?? 'N/A',
                    'father_name' => $enr->studentProfile?->father_name ?? 'N/A',
                    'phone' => $enr->studentProfile?->user?->phone_number ?? 'N/A',
                    'roll_number' => $enr->studentProfile?->registration_number ?? $enr->enrollment_number,
                ];
            });

        return response()->json([
            'target_type' => 'course',
            'target_id' => $course->id,
            'target_name' => $course->name,
            'department_name' => $course->trade?->program?->department?->name ?? 'Technical',
            'trade_name' => $course->trade?->name ?? 'Technical Trade',
            'students' => $enrollments,
        ]);
    }

    /**
     * Fetch all enrolled trainees under a specific batch with disciplinary status.
     */
    public function batchStudents(int $batchId): JsonResponse
    {
        $batch = Batch::with('course.trade.program.department')->findOrFail($batchId);

        $enrollments = Enrollment::where('batch_id', $batchId)
            ->with([
                'studentProfile.user',
                'course',
                'disciplinedBy',
            ])
            ->latest('enrollment_date')
            ->get()
            ->map(function ($enr) use ($batch) {
                return [
                    'id' => $enr->id,
                    'enrollment_number' => $enr->enrollment_number,
                    'enrollment_date' => $enr->enrollment_date?->format('d M Y'),
                    'status' => $enr->status,
                    'struck_off_at' => $enr->struck_off_at?->format('d M Y, h:i A'),
                    'struck_off_until' => $enr->struck_off_until?->format('d M Y, h:i A'),
                    'struck_off_days' => $enr->struck_off_days,
                    'remaining_days' => $enr->remainingSuspensionDays(),
                    'disciplinary_reason' => $enr->disciplinary_reason,
                    'disciplined_by' => $enr->disciplinedBy?->name,
                    'course_name' => $enr->course?->name ?? 'General Course',
                    'batch_id' => $batch->id,
                    'batch_name' => $batch->name,
                    'student_profile_id' => $enr->student_profile_id,
                    'user_id' => $enr->studentProfile?->user_id,
                    'name' => $enr->studentProfile?->user?->name ?? 'Trainee',
                    'email' => $enr->studentProfile?->user?->email,
                    'cnic' => $enr->studentProfile?->user?->cnic ?? 'N/A',
                    'father_name' => $enr->studentProfile?->father_name ?? 'N/A',
                    'phone' => $enr->studentProfile?->user?->phone_number ?? 'N/A',
                    'roll_number' => $enr->studentProfile?->registration_number ?? $enr->enrollment_number,
                ];
            });

        return response()->json([
            'target_type' => 'batch',
            'target_id' => $batch->id,
            'target_name' => "{$batch->name} ({$batch->session_year} - " . ucfirst($batch->shift) . ")",
            'course_name' => $batch->course?->name ?? 'Technical Course',
            'department_name' => $batch->course?->trade?->program?->department?->name ?? 'Technical',
            'trade_name' => $batch->course?->trade?->name ?? 'Technical Trade',
            'students' => $enrollments,
        ]);
    }
}
