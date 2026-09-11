<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Operations\Models\InstituteGalleryImage;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class InstituteGalleryController extends Controller
{
    /**
     * Display the gallery management view.
     */
    public function index(Request $request): Response
    {
        $images = InstituteGalleryImage::with('creator')
            ->orderBy('display_order', 'asc')
            ->orderBy('id', 'desc')
            ->get();

        $isClerkOnly = $request->user() &&
            $request->user()->hasRole('clerk') &&
            ! $request->user()->hasRole(['super-admin', 'principal', 'admin', 'administrator']);

        return Inertia::render('Admin/Gallery/Index', [
            'images' => $images,
            'isClerk' => $isClerkOnly,
        ]);
    }

    /**
     * Upload and store a new gallery image.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:8192',
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
            'event_date' => 'nullable|date',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $path = $request->file('image')->store('institute_gallery', 'public');

        InstituteGalleryImage::create([
            'image_path' => $path,
            'title' => $validated['title'],
            'category' => $validated['category'] ?? 'Campus Life',
            'description' => $validated['description'] ?? null,
            'event_date' => $validated['event_date'] ?? null,
            'display_order' => (int) ($validated['display_order'] ?? 0),
            'is_active' => $request->boolean('is_active', true),
            'created_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Gallery image uploaded successfully.');
    }

    /**
     * Update gallery image details or replace file.
     */
    public function update(Request $request, InstituteGalleryImage $image): RedirectResponse
    {
        $validated = $request->validate([
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:8192',
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
            'event_date' => 'nullable|date',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($image->image_path && Storage::disk('public')->exists($image->image_path)) {
                Storage::disk('public')->delete($image->image_path);
            }
            $image->image_path = $request->file('image')->store('institute_gallery', 'public');
        }

        $image->title = $validated['title'];
        $image->category = $validated['category'] ?? 'Campus Life';
        $image->description = $validated['description'] ?? null;
        $image->event_date = $validated['event_date'] ?? null;
        if (isset($validated['display_order'])) {
            $image->display_order = (int) $validated['display_order'];
        }
        if ($request->has('is_active')) {
            $image->is_active = $request->boolean('is_active');
        }

        $image->save();

        return redirect()->back()->with('success', 'Gallery image updated successfully.');
    }

    /**
     * Toggle visibility of gallery image.
     */
    public function toggle(InstituteGalleryImage $image): RedirectResponse
    {
        $image->update([
            'is_active' => ! $image->is_active,
        ]);

        $status = $image->is_active ? 'visible on public gallery' : 'hidden from public gallery';
        return redirect()->back()->with('success', "Image \"{$image->title}\" is now {$status}.");
    }

    /**
     * Delete gallery image.
     */
    public function destroy(InstituteGalleryImage $image): RedirectResponse
    {
        if ($image->image_path && Storage::disk('public')->exists($image->image_path)) {
            Storage::disk('public')->delete($image->image_path);
        }

        $image->delete();

        return redirect()->back()->with('success', 'Gallery image deleted successfully.');
    }
}
