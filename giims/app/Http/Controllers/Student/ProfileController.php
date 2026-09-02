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
            'father_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'required|string|max:50',
            'domicile_district' => 'required|string|max:255',
            'address' => 'required|string|max:1000',
            'emergency_contact' => 'required|string|max:50',
        ]);

        auth()->user()->studentProfile()->updateOrCreate(
            ['user_id' => auth()->id()],
            $validated
        );

        return redirect()->back()->with('success', 'Master Student Profile saved successfully.');
    }
}
