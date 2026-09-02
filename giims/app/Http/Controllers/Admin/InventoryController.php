<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Operations\Models\InventoryItem;
use App\Domains\Operations\Models\InventoryTransaction;
use App\Domains\Organization\Models\Batch;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    /**
     * Display the institute workshop store inventory catalog, stock levels, and transaction logs.
     */
    public function index(): Response
    {
        $items = InventoryItem::with([
                'transactions' => function ($query) {
                    $query->latest()->with(['user', 'batch.course']);
                },
            ])
            ->latest()
            ->get();

        $batches = Batch::with('course.trade.program.department')
            ->latest()
            ->get();

        $teachers = \App\Domains\Identity\Models\User::whereHas('roles', fn ($q) => $q->whereIn('slug', ['teacher', 'instructor']))
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $demands = \App\Domains\Operations\Models\MaterialDemand::with([
                'batch.course',
                'user',
                'approvedBy',
                'items.inventoryItem',
            ])
            ->latest()
            ->get();

        $allocations = \App\Domains\Operations\Models\AssetAllocation::with([
                'user',
                'inventoryItem',
                'assignedBy',
            ])
            ->latest()
            ->get();

        return Inertia::render('Admin/Inventory/Index', [
            'items' => $items,
            'batches' => $batches,
            'teachers' => $teachers,
            'demands' => $demands,
            'allocations' => $allocations,
        ]);
    }

    /**
     * Register a new store item into the institute inventory catalog.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100|unique:inventory_items,sku',
            'category' => 'required|in:consumable,fixed_asset',
            'quantity_in_stock' => 'nullable|integer|min:0',
            'unit' => 'required|string|max:50',
            'min_threshold' => 'required|integer|min:0',
        ]);

        $sku = $validated['sku'] ?: 'SKU-' . strtoupper(substr($validated['category'], 0, 3)) . '-' . rand(1000, 9999);
        $initialQuantity = $validated['quantity_in_stock'] ?? 0;

        $item = InventoryItem::create([
            'name' => $validated['name'],
            'sku' => $sku,
            'category' => $validated['category'],
            'quantity_in_stock' => $initialQuantity,
            'unit' => $validated['unit'],
            'min_threshold' => $validated['min_threshold'],
        ]);

        if ($initialQuantity > 0) {
            InventoryTransaction::create([
                'inventory_item_id' => $item->id,
                'user_id' => auth()->id(),
                'batch_id' => null,
                'transaction_type' => 'stock_in',
                'quantity' => $initialQuantity,
                'remarks' => 'Initial catalog opening balance',
                'transaction_date' => now(),
            ]);
        }

        return redirect()->back()->with('success', "Inventory item '{$item->name}' added to catalog successfully.");
    }

    /**
     * Record a stock replenishment (stock_in) or batch issuance (stock_out) transaction.
     */
    public function transaction(Request $request, int $id): RedirectResponse
    {
        $item = InventoryItem::findOrFail($id);

        $validated = $request->validate([
            'transaction_type' => 'required|in:stock_in,stock_out',
            'quantity' => 'required|integer|min:1',
            'batch_id' => 'nullable|required_if:transaction_type,stock_out|exists:batches,id',
            'remarks' => 'nullable|string|max:500',
        ]);

        if ($validated['transaction_type'] === 'stock_out' && $item->quantity_in_stock < $validated['quantity']) {
            return redirect()->back()->with('error', "Insufficient stock for '{$item->name}'. Available: {$item->quantity_in_stock} {$item->unit}, Requested: {$validated['quantity']} {$item->unit}.");
        }

        InventoryTransaction::create([
            'inventory_item_id' => $item->id,
            'user_id' => auth()->id(),
            'batch_id' => $validated['transaction_type'] === 'stock_out' ? $validated['batch_id'] : null,
            'transaction_type' => $validated['transaction_type'],
            'quantity' => $validated['quantity'],
            'remarks' => $validated['remarks'],
            'transaction_date' => now(),
        ]);

        if ($validated['transaction_type'] === 'stock_in') {
            $item->increment('quantity_in_stock', $validated['quantity']);
            $msg = "Added {$validated['quantity']} {$item->unit} to '{$item->name}' stock.";
        } else {
            $item->decrement('quantity_in_stock', $validated['quantity']);
            $batchName = Batch::find($validated['batch_id'])?->name ?? 'Batch';
            $msg = "Issued {$validated['quantity']} {$item->unit} of '{$item->name}' to {$batchName}.";
        }

        return redirect()->back()->with('success', $msg);
    }

    /**
     * Review and approve/reject an instructor's material demand requisition.
     */
    public function approveDemand(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'items' => 'nullable|array',
            'items.*.id' => 'required|exists:demand_items,id',
            'items.*.approved_qty' => 'required|integer|min:0',
        ]);

        $demand = \App\Domains\Operations\Models\MaterialDemand::with('items.inventoryItem', 'batch')->findOrFail($id);

        if ($validated['status'] === 'approved') {
            if (!empty($validated['items'])) {
                foreach ($validated['items'] as $itemData) {
                    $item = \App\Domains\Operations\Models\DemandItem::find($itemData['id']);
                    if ($item && $item->material_demand_id === $demand->id) {
                        $approvedQty = $itemData['approved_qty'];
                        $item->update(['approved_qty' => $approvedQty]);

                        // Decrement central inventory stock for approved consumables
                        $inv = $item->inventoryItem;
                        if ($inv && $approvedQty > 0) {
                            $inv->decrement('quantity_in_stock', min($inv->quantity_in_stock, $approvedQty));

                            \App\Domains\Operations\Models\InventoryTransaction::create([
                                'inventory_item_id' => $inv->id,
                                'user_id' => auth()->id(),
                                'batch_id' => $demand->batch_id,
                                'transaction_type' => 'stock_out',
                                'quantity' => $approvedQty,
                                'remarks' => "Approved Material Demand #DEM-{$demand->id} for Batch {$demand->batch?->name}",
                                'transaction_date' => now(),
                            ]);
                        }
                    }
                }
            } else {
                // Auto-approve full requested quantities
                foreach ($demand->items as $item) {
                    $item->update(['approved_qty' => $item->requested_qty]);
                    $inv = $item->inventoryItem;
                    if ($inv && $item->requested_qty > 0) {
                        $inv->decrement('quantity_in_stock', min($inv->quantity_in_stock, $item->requested_qty));

                        \App\Domains\Operations\Models\InventoryTransaction::create([
                            'inventory_item_id' => $inv->id,
                            'user_id' => auth()->id(),
                            'batch_id' => $demand->batch_id,
                            'transaction_type' => 'stock_out',
                            'quantity' => $item->requested_qty,
                            'remarks' => "Approved Material Demand #DEM-{$demand->id}",
                            'transaction_date' => now(),
                        ]);
                    }
                }
            }
        }

        $demand->update([
            'status' => $validated['status'],
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return redirect()->back()->with('success', "Material Demand #DEM-{$demand->id} marked as {$validated['status']}.");
    }

    /**
     * Allocate a fixed asset to faculty from storekeeper console.
     */
    public function allocateAsset(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'room_location' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'remarks' => 'nullable|string|max:500',
        ]);

        $item = InventoryItem::findOrFail($validated['inventory_item_id']);

        \App\Domains\Operations\Models\AssetAllocation::create([
            'user_id' => $validated['user_id'],
            'inventory_item_id' => $item->id,
            'room_location' => $validated['room_location'],
            'quantity' => $validated['quantity'],
            'status' => 'active',
            'assigned_by' => auth()->id(),
            'assigned_at' => now(),
            'remarks' => $validated['remarks'] ?? null,
        ]);

        $teacher = \App\Domains\Identity\Models\User::find($validated['user_id']);
        return redirect()->back()->with('success', "Assigned {$validated['quantity']} {$item->unit} of '{$item->name}' to {$teacher?->name} at {$validated['room_location']}.");
    }
}
