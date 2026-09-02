<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the instructor/teacher command center with assigned batches and academic assets.
     */
    public function index(): Response
    {
        $today = today();
        $batches = auth()->user()->batches()
            ->with([
                'course.trade.program.department',
                'course.subjects',
                'enrollments.studentProfile.user',
                'lessonPlans',
                'assignments',
                'attendanceSessions' => function ($q) use ($today) {
                    $q->whereDate('session_date', $today)->latest();
                },
            ])
            ->get()
            ->map(function ($batch) use ($today) {
                $todaySession = $batch->attendanceSessions->first();
                $batch->today_session = $todaySession ? [
                    'id' => $todaySession->id,
                    'daily_pin' => $todaySession->daily_pin,
                    'location_name' => $todaySession->location_name ?? 'Computer Lab 1 & 2 (IT Wing)',
                    'latitude' => (float) ($todaySession->latitude ?? 28.4212),
                    'longitude' => (float) ($todaySession->longitude ?? 70.3023),
                    'radius_meters' => (int) ($todaySession->radius_meters ?? 150),
                    'is_geofence_active' => (bool) $todaySession->is_geofence_active,
                    'status' => $todaySession->status,
                    'pin_checkins_count' => $todaySession->classAttendances()->where('method', 'like', '%pin%')->count(),
                    'pending_confirm_count' => $todaySession->classAttendances()->where('is_confirmed_by_teacher', false)->count(),
                    'confirmed_count' => $todaySession->classAttendances()->where('is_confirmed_by_teacher', true)->count(),
                    'attendances' => $todaySession->classAttendances()
                        ->with('studentProfile.user', 'studentProfile.enrollments')
                        ->latest('marked_at')
                        ->get()
                        ->map(function ($att) {
                            return [
                                'id' => $att->id,
                                'student_name' => $att->studentProfile?->user?->name ?? 'Trainee',
                                'father_name' => $att->studentProfile?->father_name ?? 'N/A',
                                'enrollment_number' => $att->studentProfile?->enrollments?->first()?->enrollment_number ?? 'GTTI-ENR',
                                'distance_meters' => $att->distance_meters,
                                'method' => $att->method,
                                'marked_at' => $att->marked_at?->format('h:i A') ?? $att->created_at?->format('h:i A'),
                                'is_confirmed' => (bool) $att->is_confirmed_by_teacher,
                                'status' => $att->status,
                            ];
                        }),
                ] : null;
                return $batch;
            });

        $announcements = \App\Domains\Operations\Models\Announcement::with('creator')
            ->whereIn('target_audience', ['all', 'teachers', 'staff'])
            ->where(function ($q) {
                $q->where('expires_at', '>=', today())
                  ->orWhereNull('expires_at');
            })
            ->latest()
            ->take(5)
            ->get();

        // Material Demands & Remaining Consumables Quota
        $consumables = \App\Domains\Operations\Models\DemandItem::whereHas('materialDemand', function ($q) {
                $q->where('user_id', auth()->id())->where('status', 'approved');
            })
            ->with(['inventoryItem', 'materialDemand.batch.course'])
            ->get();

        // Faculty Fixed Assets Assigned (Property Handover)
        $assignedAssets = \App\Domains\Operations\Models\AssetAllocation::with('inventoryItem')
            ->where('user_id', auth()->id())
            ->where('status', 'active')
            ->latest()
            ->get();

        // Visiting Faculty Monthly Billing stats
        $visitingStats = null;
        if (auth()->user()->is_visiting_faculty) {
            $daysTaught = \App\Domains\Attendance\Models\AttendanceSession::where('user_id', auth()->id())
                ->whereYear('session_date', now()->year)
                ->whereMonth('session_date', now()->month)
                ->distinct('session_date')
                ->count('session_date');

            $visitingStats = [
                'is_visiting' => true,
                'daily_rate' => auth()->user()->daily_rate ?? 0,
                'current_month_days' => $daysTaught,
                'estimated_earnings' => $daysTaught * (auth()->user()->daily_rate ?? 0),
                'recent_bills' => \App\Domains\Operations\Models\TeacherBill::where('user_id', auth()->id())->latest()->take(3)->get(),
            ];
        }

        $locationPresets = (new \App\Http\Controllers\Teacher\AttendanceController())->locationPresets;

        return Inertia::render('Teacher/Dashboard', [
            'batches' => $batches,
            'announcements' => $announcements,
            'consumables' => $consumables,
            'assignedAssets' => $assignedAssets,
            'visitingStats' => $visitingStats,
            'locationPresets' => $locationPresets,
        ]);
    }

    /**
     * Store and broadcast a new instructional/academic notice to trainees.
     */
    public function storeAnnouncement(\Illuminate\Http\Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'target_audience' => 'required|in:all,students,staff',
            'expires_at' => 'nullable|date',
        ]);

        \App\Domains\Operations\Models\Announcement::create([
            'created_by' => auth()->id(),
            'title' => $validated['title'],
            'message' => $validated['message'],
            'target_audience' => $validated['target_audience'],
            'expires_at' => $validated['expires_at'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Notice published successfully to trainees.');
    }
}
