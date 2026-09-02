<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Identity\Models\User;
use App\Domains\Operations\Models\AssetAllocation;
use App\Domains\Operations\Models\InventoryItem;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssetAllocationController extends Controller
{
    /**
     * Display all fixed asset allocations and property handover records.
     */
    public function index(): Response
    {
        $allocations = AssetAllocation::with(['user', 'inventoryItem', 'assignedBy'])
            ->latest()
            ->get();

        $teachers = User::whereHas('roles', fn ($q) => $q->whereIn('slug', ['teacher', 'instructor']))
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $fixedAssets = InventoryItem::where('category', 'fixed_asset')
            ->whereNull('deleted_at')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Assets/Index', [
            'allocations' => $allocations,
            'teachers' => $teachers,
            'fixedAssets' => $fixedAssets,
        ]);
    }

    /**
     * Assign a fixed asset to a faculty member.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'room_location' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'remarks' => 'nullable|string|max:500',
        ]);

        $item = InventoryItem::findOrFail($validated['inventory_item_id']);

        AssetAllocation::create([
            'user_id' => $validated['user_id'],
            'inventory_item_id' => $item->id,
            'room_location' => $validated['room_location'],
            'quantity' => $validated['quantity'],
            'status' => 'active',
            'assigned_by' => auth()->id(),
            'assigned_at' => now(),
            'remarks' => $validated['remarks'] ?? null,
        ]);

        $teacher = User::find($validated['user_id']);
        return redirect()->back()->with('success', "Assigned {$validated['quantity']} {$item->unit} of '{$item->name}' to {$teacher?->name} at {$validated['room_location']}.");
    }

    /**
     * Mark an asset handover as returned to institute central store.
     */
    public function returnAsset(int $id): RedirectResponse
    {
        $allocation = AssetAllocation::findOrFail($id);
        $allocation->update([
            'status' => 'returned',
            'returned_at' => now(),
        ]);

        return redirect()->back()->with('success', "Fixed asset record #{$allocation->id} marked as returned to institute store.");
    }
}
