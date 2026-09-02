<?php

namespace App\Http\Controllers\Teacher;

use App\Domains\Attendance\Models\AttendanceSession;
use App\Domains\Operations\Models\TeacherBill;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    /**
     * Display visiting faculty remuneration dashboard, monthly calculations, and previous bills.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $selectedMonth = $request->query('month', now()->format('Y-m'));

        $date = Carbon::createFromFormat('Y-m', $selectedMonth) ?: now();
        $year = $date->year;
        $month = $date->month;

        // Distinct days taught in this month
        $sessions = AttendanceSession::where('user_id', $user->id)
            ->whereYear('session_date', $year)
            ->whereMonth('session_date', $month)
            ->with(['batch.course'])
            ->orderBy('session_date')
            ->get();

        $distinctDaysTaught = $sessions->pluck('session_date')->map(fn ($d) => (string)$d)->unique()->values();
        $daysCount = $distinctDaysTaught->count();
        $rate = $user->daily_rate ?? 0;
        $estimatedAmount = $daysCount * $rate;

        $bills = TeacherBill::where('user_id', $user->id)
            ->with('approvedBy')
            ->latest()
            ->get();

        return Inertia::render('Teacher/Billing/Index', [
            'isVisiting' => (bool)$user->is_visiting_faculty,
            'dailyRate' => $rate,
            'selectedMonth' => $selectedMonth,
            'daysCount' => $daysCount,
            'distinctDays' => $distinctDaysTaught,
            'sessions' => $sessions,
            'estimatedAmount' => $estimatedAmount,
            'bills' => $bills,
        ]);
    }

    /**
     * Generate or re-calculate a monthly remuneration claim bill for visiting faculty.
     */
    public function generate(Request $request): RedirectResponse
    {
        $user = auth()->user();

        if (!$user->is_visiting_faculty) {
            return redirect()->back()->with('error', 'Only designated Visiting Faculty instructors can generate remuneration bills.');
        }

        if (!$user->daily_rate || $user->daily_rate <= 0) {
            return redirect()->back()->with('error', 'Daily remuneration rate has not been configured by administration. Please contact GTTI Accounts.');
        }

        $validated = $request->validate([
            'billing_month' => 'required|date_format:Y-m',
            'remarks' => 'nullable|string|max:500',
        ]);

        $monthStr = $validated['billing_month'];
        $date = Carbon::createFromFormat('Y-m', $monthStr);

        // Count distinct attendance session days conducted
        $daysTaught = AttendanceSession::where('user_id', $user->id)
            ->whereYear('session_date', $date->year)
            ->whereMonth('session_date', $date->month)
            ->distinct('session_date')
            ->count('session_date');

        if ($daysTaught <= 0) {
            return redirect()->back()->with('error', "No verified attendance sessions found for {$date->format('F Y')}. You must conduct and record sessions to generate a bill.");
        }

        $totalAmount = $daysTaught * $user->daily_rate;

        $bill = TeacherBill::updateOrCreate(
            [
                'user_id' => $user->id,
                'billing_month' => $monthStr,
            ],
            [
                'total_days_taught' => $daysTaught,
                'rate_per_day' => $user->daily_rate,
                'total_amount' => $totalAmount,
                'status' => 'submitted',
                'remarks' => $validated['remarks'] ?? null,
            ]
        );

        return redirect()->back()->with('success', "Remuneration bill for {$date->format('F Y')} generated successfully: {$daysTaught} Days @ PKR {$user->daily_rate}/day = PKR " . number_format($totalAmount) . ".");
    }

    /**
     * Display printable official remuneration invoice / claim form.
     */
    public function show(int $id): Response
    {
        $user = auth()->user();
        $bill = TeacherBill::with('user', 'approvedBy')
            ->where('user_id', $user->id)
            ->findOrFail($id);

        $date = Carbon::createFromFormat('Y-m', $bill->billing_month);
        $sessions = AttendanceSession::where('user_id', $user->id)
            ->whereYear('session_date', $date->year)
            ->whereMonth('session_date', $date->month)
            ->with(['batch.course'])
            ->orderBy('session_date')
            ->get();

        return Inertia::render('Teacher/Billing/Show', [
            'bill' => $bill,
            'sessions' => $sessions,
        ]);
    }
}
