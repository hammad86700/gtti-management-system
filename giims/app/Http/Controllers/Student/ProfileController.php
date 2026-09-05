<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the form for editing the student master profile.
     */
    public function edit(): Response
    {
        $profile = auth()->user()->studentProfile;

        return Inertia::render('Student/Profile/Edit', [
            'profile' => $profile,
        ]);
    }

    /**
     * Update or create the student master profile.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'cnic' => 'required|string|max:25',
            'father_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'required|string|max:50',
            'domicile_district' => 'required|string|max:255',
            'address' => 'required|string|max:1000',
            'emergency_contact' => 'required|string|max:50',
            'matric_total_marks' => 'nullable|integer|min:100|max:1500',
            'matric_obtained_marks' => 'nullable|integer|min:0|max:1500',
            'matric_board' => 'nullable|string|max:100',
            'intermediate_total_marks' => 'nullable|integer|min:100|max:1500',
            'intermediate_obtained_marks' => 'nullable|integer|min:0|max:1500',
            'intermediate_board' => 'nullable|string|max:100',
        ]);

        $user = auth()->user();
        $user->update([
            'cnic' => $validated['cnic'],
            'phone' => $validated['emergency_contact'] ?: $user->phone,
        ]);

        $profileData = collect($validated)->except(['cnic'])->toArray();

        $user->studentProfile()->updateOrCreate(
            ['user_id' => $user->id],
            $profileData
        );

        return redirect()->back()->with('success', 'Master Student Profile & Academic Record saved successfully.');
    }
}
