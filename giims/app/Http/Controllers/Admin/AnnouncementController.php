<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Operations\Models\Announcement;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    /**
     * Display all institutional broadcast announcements and management portal.
     */
    public function index(): Response
    {
        $announcements = Announcement::with('creator')
            ->latest()
            ->get();

        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => $announcements,
        ]);
    }

    /**
     * Store and broadcast a new institutional system announcement.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'target_audience' => 'required|in:all,students,teachers,staff',
            'expires_at' => 'nullable|date',
        ]);

        Announcement::create([
            'created_by' => auth()->id(),
            'title' => $validated['title'],
            'message' => $validated['message'],
            'target_audience' => $validated['target_audience'],
            'expires_at' => $validated['expires_at'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Announcement published and broadcast successfully across portals.');
    }

    /**
     * Revoke / delete an institutional announcement.
     */
    public function destroy(Announcement $announcement): RedirectResponse
    {
        $announcement->delete();

        return redirect()->back()->with('success', 'Announcement revoked successfully.');
    }
}
