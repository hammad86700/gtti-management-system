<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Operations\Models\CoreTeamMember;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CoreTeamController extends Controller
{
    /**
     * Display the core team management view.
     */
    public function index(): Response
    {
        $members = CoreTeamMember::with('creator')
            ->orderBy('display_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return Inertia::render('Admin/CoreTeam/Index', [
            'members' => $members,
        ]);
    }

    /**
     * Store a new core team member.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'designation' => 'required|string|max:255',
            'department' => 'nullable|string|max:255',
            'experience' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'bio' => 'nullable|string|max:1000',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('core_team', 'public');
        }

        CoreTeamMember::create([
            'name' => $validated['name'],
            'designation' => $validated['designation'],
            'department' => $validated['department'] ?? null,
            'experience' => $validated['experience'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'photo_path' => $photoPath,
            'bio' => $validated['bio'] ?? null,
            'display_order' => (int) ($validated['display_order'] ?? 0),
            'is_active' => $request->boolean('is_active', true),
            'created_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Core team member added successfully.');
    }

    /**
     * Update core team member.
     */
    public function update(Request $request, CoreTeamMember $member): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'designation' => 'required|string|max:255',
            'department' => 'nullable|string|max:255',
            'experience' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'bio' => 'nullable|string|max:1000',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('photo')) {
            if ($member->photo_path && Storage::disk('public')->exists($member->photo_path)) {
                Storage::disk('public')->delete($member->photo_path);
            }
            $member->photo_path = $request->file('photo')->store('core_team', 'public');
        }

        $member->name = $validated['name'];
        $member->designation = $validated['designation'];
        $member->department = $validated['department'] ?? null;
        $member->experience = $validated['experience'] ?? null;
        $member->phone = $validated['phone'] ?? null;
        $member->email = $validated['email'] ?? null;
        $member->bio = $validated['bio'] ?? null;
        if (isset($validated['display_order'])) {
            $member->display_order = (int) $validated['display_order'];
        }
        if ($request->has('is_active')) {
            $member->is_active = $request->boolean('is_active');
        }

        $member->save();

        return redirect()->back()->with('success', 'Core team member updated successfully.');
    }

    /**
     * Toggle active state.
     */
    public function toggle(CoreTeamMember $member): RedirectResponse
    {
        $member->update([
            'is_active' => ! $member->is_active,
        ]);

        $status = $member->is_active ? 'visible on public portal' : 'hidden from public portal';
        return redirect()->back()->with('success', "Team member \"{$member->name}\" is now {$status}.");
    }

    /**
     * Delete core team member.
     */
    public function destroy(CoreTeamMember $member): RedirectResponse
    {
        if ($member->photo_path && Storage::disk('public')->exists($member->photo_path)) {
            Storage::disk('public')->delete($member->photo_path);
        }

        $member->delete();

        return redirect()->back()->with('success', 'Team member removed successfully.');
    }
}
