<?php

namespace App\Http\Controllers\Shared;

use App\Domains\Operations\Models\InstitutionalHoliday;
use App\Domains\Organization\Models\Course;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HolidayController extends Controller
{
    /**
     * Display the Urgent College Off & Institutional Holiday Management Desk.
     * Accessible by Clerk, Principal, and Admin.
     */
    public function index(): Response
    {
        $holidays = InstitutionalHoliday::with('creator')
            ->orderBy('holiday_date', 'desc')
            ->get();

        $courses = Course::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return Inertia::render('Admin/Holidays/Index', [
            'holidays' => $holidays,
            'courses' => $courses,
        ]);
    }

    /**
     * Declare and publish an urgent holiday / college off day.
     * When published, attendance engines automatically count this date as Holiday (not Absent).
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'reason' => 'required|string|max:1000',
            'holiday_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:holiday_date',
            'scope' => 'required|in:all,specific_courses',
            'course_ids' => 'nullable|array',
            'course_ids.*' => 'exists:courses,id',
        ]);

        $user = auth()->user();
        $roleName = $user->roles->first()?->name ?? 'Staff';

        InstitutionalHoliday::create([
            'title' => $validated['title'],
            'reason' => $validated['reason'],
            'holiday_date' => $validated['holiday_date'],
            'end_date' => $validated['end_date'] ?? null,
            'scope' => $validated['scope'],
            'course_ids' => $validated['scope'] === 'specific_courses' ? ($validated['course_ids'] ?? []) : null,
            'is_published' => true,
            'created_by' => $user->id,
            'created_by_role' => $roleName,
        ]);

        $scopeMsg = $validated['scope'] === 'all'
            ? 'for the entire institute (all courses & faculty)'
            : 'for the selected specific courses';

        return redirect()->back()->with('success', "Urgent College Off \"{$validated['title']}\" published {$scopeMsg}. Attendance tracking will automatically record this day as an exempt holiday instead of an absence.");
    }

    /**
     * Cancel or delete a declared holiday.
     */
    public function destroy(InstitutionalHoliday $holiday): RedirectResponse
    {
        $holiday->delete();

        return redirect()->back()->with('success', "Institutional holiday \"{$holiday->title}\" removed.");
    }
}
