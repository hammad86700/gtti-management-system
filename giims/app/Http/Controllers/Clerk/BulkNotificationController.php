<?php

namespace App\Http\Controllers\Clerk;

use App\Domains\Operations\Models\Announcement;
use App\Domains\Admissions\Models\Application;
use App\Domains\Organization\Models\Course;
use App\Jobs\SendBulkExamNoticesJob;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BulkNotificationController extends Controller
{
    /**
     * Display the Broadcast & Test Scheduler Desk.
     */
    public function index(): Response
    {
        $courses = Course::withCount([
            'applications as total_applicants',
            'applications as pending_applicants' => function ($q) {
                $q->pendingScrutiny();
            },
            'applications as verified_applicants' => function ($q) {
                $q->where('status', 'verified');
            },
            'applications as scheduled_applicants' => function ($q) {
                $q->whereNotNull('test_date');
            },
        ])->orderBy('name')->get();

        // Recent schedules
        $recentSchedules = Application::whereNotNull('test_date')
            ->with(['course', 'studentProfile.user'])
            ->latest('updated_at')
            ->take(10)
            ->get();

        return Inertia::render('Clerk/Scheduler/Index', [
            'courses' => $courses,
            'recentSchedules' => $recentSchedules,
        ]);
    }

    /**
     * 1-Click bulk schedule entrance test and broadcast call letters to all applicants of a course.
     */
    public function scheduleCourseTest(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'test_date' => 'required|date|after_or_equal:today',
            'test_time' => 'required|string|max:100',
            'test_venue' => 'required|string|max:255',
            'clerk_notice' => 'required|string|min:5|max:2000',
        ]);

        $course = Course::findOrFail($validated['course_id']);

        // Update all verified applicants for this course to slip_issued & assign roll number
        $targetApps = Application::where('course_id', $course->id)
            ->whereIn('status', ['verified', 'submitted', 'pending'])
            ->get();

        $updatedCount = 0;
        foreach ($targetApps as $app) {
            $rollNo = $app->generateEntranceRollNumber();
            $app->update([
                'status' => 'slip_issued',
                'entrance_roll_number' => $rollNo,
                'test_date' => $validated['test_date'],
                'test_time' => $validated['test_time'],
                'test_venue' => $validated['test_venue'],
                'clerk_notice' => $validated['clerk_notice'],
                'updated_at' => now(),
            ]);
            $updatedCount++;
        }

        // Broadcast targeted institutional announcement
        Announcement::create([
            'created_by' => auth()->id(),
            'title' => "Official Call Letter: {$course->name} Entrance Examination",
            'message' => "Entrance Examination & Interview scheduled for {$validated['test_date']} at {$validated['test_time']}. Venue: {$validated['test_venue']}. Mandatory Instructions: {$validated['clerk_notice']}",
            'target_audience' => 'students',
        ]);

        // Asynchronously dispatch telecom SMS notifications via queue worker
        SendBulkExamNoticesJob::dispatch(
            $course->id,
            $validated['test_date'],
            $validated['test_time'],
            $validated['test_venue'],
            $validated['clerk_notice']
        );

        // Audit log
        if (function_exists('activity')) {
            activity()
                ->causedBy(auth()->user())
                ->performedOn($course)
                ->log("Admission Clerk scheduled entrance test for {$updatedCount} applicants of '{$course->name}' on {$validated['test_date']} at {$validated['test_venue']}");
        }

        return redirect()->back()->with(
            'success',
            "Entrance test scheduled and call letters broadcasted to {$updatedCount} applicants of {$course->name}."
        );
    }
}
