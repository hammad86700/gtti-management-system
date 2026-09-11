<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Operations\Models\CampusShowcasePhoto;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CampusMediaController extends Controller
{
    /**
     * Display the campus showcase media gallery management dashboard.
     */
    public function index(Request $request): Response
    {
        $photos = CampusShowcasePhoto::with('creator')
            ->orderBy('display_order', 'asc')
            ->orderBy('id', 'desc')
            ->get();

        $isClerkOnly = $request->user() &&
            $request->user()->hasRole('clerk') &&
            ! $request->user()->hasRole(['super-admin', 'principal', 'admin', 'administrator']);

        return Inertia::render('Admin/CampusMedia/Index', [
            'photos' => $photos,
            'isClerk' => $isClerkOnly,
        ]);
    }

    /**
     * Upload and store a new campus showcase image.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $path = $request->file('image')->store('campus_showcase', 'public');

        CampusShowcasePhoto::create([
            'image_path' => $path,
            'title' => $validated['title'] ?? null,
            'subtitle' => $validated['subtitle'] ?? null,
            'display_order' => (int) ($validated['display_order'] ?? 0),
            'is_active' => $request->boolean('is_active', true),
            'created_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Campus showcase photo uploaded successfully.');
    }

    /**
     * Update photo captions, display order, visibility, or replace image.
     */
    public function update(Request $request, CampusShowcasePhoto $photo): RedirectResponse
    {
        $validated = $request->validate([
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($photo->image_path && Storage::disk('public')->exists($photo->image_path)) {
                Storage::disk('public')->delete($photo->image_path);
            }
            $photo->image_path = $request->file('image')->store('campus_showcase', 'public');
        }

        $photo->title = $validated['title'] ?? null;
        $photo->subtitle = $validated['subtitle'] ?? null;
        if (isset($validated['display_order'])) {
            $photo->display_order = (int) $validated['display_order'];
        }
        if ($request->has('is_active')) {
            $photo->is_active = $request->boolean('is_active');
        }

        $photo->save();

        return redirect()->back()->with('success', 'Showcase photo updated successfully.');
    }

    /**
     * Quick toggle photo visibility between active and inactive.
     */
    public function toggle(CampusShowcasePhoto $photo): RedirectResponse
    {
        $photo->update([
            'is_active' => ! $photo->is_active,
        ]);

        $msg = $photo->is_active
            ? "Photo \"{$photo->title}\" is now visible on the public showcase."
            : "Photo \"{$photo->title}\" has been hidden from the public showcase.";

        return redirect()->back()->with('success', $msg);
    }

    /**
     * Delete photo from storage and database.
     */
    public function destroy(CampusShowcasePhoto $photo): RedirectResponse
    {
        if ($photo->image_path && Storage::disk('public')->exists($photo->image_path)) {
            Storage::disk('public')->delete($photo->image_path);
        }

        $photo->delete();

        return redirect()->back()->with('success', 'Showcase photo deleted successfully.');
    }
}
