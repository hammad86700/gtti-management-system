<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Operations\Models\DisciplineRecord;
use App\Domains\Student\Models\Enrollment;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DisciplineActionController extends Controller
{
    /**
     * Temporarily strike off an enrolled student for a defined period of days.
     */
    public function strikeOff(Request $request, Enrollment $enrollment): RedirectResponse
    {
        $validated = $request->validate([
            'days' => 'required|integer|min:1|max:365',
            'reason' => 'required|string|max:2000',
        ]);

        $days = (int) $validated['days'];
        $until = now()->addDays($days);
        $orderRef = 'GTTI/ORD/' . date('Y') . '/' . str_pad((string) rand(100, 999), 3, '0', STR_PAD_LEFT);

        // Update enrollment
        $enrollment->update([
            'status' => 'struck_off',
            'struck_off_at' => now(),
            'struck_off_until' => $until,
            'struck_off_days' => $days,
            'disciplinary_reason' => $validated['reason'],
            'disciplined_by' => auth()->id(),
        ]);

        // Sync with Student Profile
        $profile = $enrollment->studentProfile;
        if ($profile) {
            $profile->update([
                'status' => 'struck_off',
                'struck_off_at' => now(),
                'struck_off_until' => $until,
                'struck_off_days' => $days,
                'termination_reason' => $validated['reason'],
                'sanctioned_by' => auth()->id(),
                'order_reference' => $orderRef,
            ]);

            DisciplineRecord::create([
                'student_profile_id' => $profile->id,
                'reported_by' => auth()->id(),
                'title' => 'Academic Suspension (Struck-Off): ' . mb_substr($validated['reason'], 0, 50),
                'description' => $validated['reason'],
                'severity' => 'major',
                'action_taken' => "Struck off for {$days} days until {$until->format('d M Y')}. Order: {$orderRef}.",
                'status' => 'resolved',
            ]);
        }

        $studentName = $profile?->user?->name ?? 'Trainee';

        return redirect()->back()->with(
            'success',
            "Trainee {$studentName} has been successfully struck off for {$days} days. Portal access is now frozen."
        );
    }

    /**
     * Permanently terminate and expel a student from the institute.
     */
    public function terminate(Request $request, Enrollment $enrollment): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:2000',
        ]);

        $orderRef = 'GTTI/EXP/' . date('Y') . '/' . str_pad((string) rand(100, 999), 3, '0', STR_PAD_LEFT);

        // Update enrollment
        $enrollment->update([
            'status' => 'terminated',
            'struck_off_at' => now(),
            'struck_off_until' => null,
            'struck_off_days' => null,
            'disciplinary_reason' => $validated['reason'],
            'disciplined_by' => auth()->id(),
        ]);

        // Sync with Student Profile
        $profile = $enrollment->studentProfile;
        if ($profile) {
            $profile->update([
                'status' => 'terminated',
                'struck_off_at' => now(),
                'struck_off_until' => null,
                'struck_off_days' => null,
                'termination_reason' => $validated['reason'],
                'sanctioned_by' => auth()->id(),
                'order_reference' => $orderRef,
            ]);

            DisciplineRecord::create([
                'student_profile_id' => $profile->id,
                'reported_by' => auth()->id(),
                'title' => 'Permanent Termination & Expulsion: ' . mb_substr($validated['reason'], 0, 50),
                'description' => $validated['reason'],
                'severity' => 'critical',
                'action_taken' => "Permanently Expelled from College. Order: {$orderRef}.",
                'status' => 'resolved',
            ]);
        }

        $studentName = $profile?->user?->name ?? 'Trainee';

        return redirect()->back()->with(
            'success',
            "Trainee {$studentName} has been permanently terminated and expelled. All credentials and privileges have been revoked."
        );
    }

    /**
     * Revert enrollment disciplinary status back to active college standing.
     */
    public function reinstate(Enrollment $enrollment): RedirectResponse
    {
        $enrollment->update([
            'status' => 'active',
            'struck_off_at' => null,
            'struck_off_until' => null,
            'struck_off_days' => null,
            'disciplinary_reason' => null,
            'disciplined_by' => null,
        ]);

        $profile = $enrollment->studentProfile;
        if ($profile) {
            $profile->update([
                'status' => 'active',
                'struck_off_at' => null,
                'struck_off_until' => null,
                'struck_off_days' => null,
                'termination_reason' => null,
                'sanctioned_by' => null,
                'order_reference' => null,
            ]);

            DisciplineRecord::create([
                'student_profile_id' => $profile->id,
                'reported_by' => auth()->id(),
                'title' => 'Official Disciplinary Reinstatement',
                'description' => 'Disciplinary sanction revoked and student restored to full active college standing by Administrative Decree.',
                'severity' => 'minor',
                'action_taken' => 'Reinstated to Active Roster. Portal and academic privileges unlocked.',
                'status' => 'resolved',
            ]);
        }

        $studentName = $profile?->user?->name ?? 'Trainee';

        return redirect()->back()->with(
            'success',
            "Trainee {$studentName} has been successfully reinstated to active status. Portal access has been restored."
        );
    }
}
