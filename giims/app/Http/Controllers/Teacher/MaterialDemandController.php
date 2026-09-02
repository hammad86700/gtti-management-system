<?php

namespace App\Http\Controllers\Teacher;

use App\Domains\Operations\Models\DemandItem;
use App\Domains\Operations\Models\InventoryItem;
use App\Domains\Operations\Models\MaterialDemand;
use App\Domains\Operations\Models\TemplateSetting;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MaterialDemandController extends Controller
{
    /**
     * Display teacher material demands list, catalog, and batch student-based auto-suggester.
     */
    public function index(): Response
    {
        $user = auth()->user();
        $batches = $user->batches()
            ->with(['course.trade.program.department', 'enrollments' => fn ($q) => $q->where('status', 'active')])
            ->get();

        $consumables = InventoryItem::where('category', 'consumable')
            ->whereNull('deleted_at')
            ->orderBy('name')
            ->get();

        $demands = MaterialDemand::with(['batch.course', 'items.inventoryItem', 'approvedBy'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return Inertia::render('Teacher/Demands/Index', [
            'batches' => $batches,
            'consumables' => $consumables,
            'demands' => $demands,
        ]);
    }

    /**
     * Store a new material demand with automated letter generation.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();

        $validated = $request->validate([
            'batch_id' => 'required|exists:batches,id',
            'items' => 'required|array|min:1',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.requested_qty' => 'required|integer|min:1',
            'remarks' => 'nullable|string|max:1000',
        ]);

        $batch = $user->batches()->findOrFail($validated['batch_id']);
        $studentCount = $batch->enrollments()->where('status', 'active')->count();

        // Build formal demand letter text
        $itemsList = "";
        $itemCounter = 1;
        foreach ($validated['items'] as $it) {
            $inv = InventoryItem::find($it['inventory_item_id']);
            $name = $inv ? $inv->name : 'Consumable Item';
            $unit = $inv ? $inv->unit : 'units';
            $itemsList .= "  {$itemCounter}. {$name} — {$it['requested_qty']} {$unit}\n";
            $itemCounter++;
        }

        $letterText = "To,\nThe Store Officer / Principal,\nGovt. Technical Training Institute, Rahim Yar Khan.\n\n" .
            "Subject: REQUISITION / MATERIAL INDENT FOR PRACTICAL & ACADEMIC TRAINING\n\n" .
            "Respected Sir,\n" .
            "It is submitted that the following consumables and workshop materials are urgently required for the practical training and examination assessments of trainees enrolled in:\n" .
            "Batch: {$batch->name} ({$batch->course?->name})\n" .
            "Active Enrolled Trainees: {$studentCount}\n" .
            "Session: {$batch->session_year}\n\n" .
            "DEMANDED ITEMS BREAKDOWN:\n" .
            $itemsList . "\n" .
            ($request->remarks ? "Special Remarks / Justification:\n{$request->remarks}\n\n" : "") .
            "It is requested that the above-mentioned items may kindly be issued from the institute store at your earliest convenience.\n\n" .
            "Submitted respectfully by,\n" .
            "Instructor: {$user->name}\n" .
            "Department: " . ($batch->course?->trade?->program?->department?->name ?? 'Technical Wing') . "\n" .
            "Date: " . now()->format('d-M-Y');

        $demand = MaterialDemand::create([
            'batch_id' => $batch->id,
            'user_id' => $user->id,
            'status' => 'pending',
            'demand_letter_text' => $letterText,
            'generated_at' => now(),
        ]);

        foreach ($validated['items'] as $itemData) {
            DemandItem::create([
                'material_demand_id' => $demand->id,
                'inventory_item_id' => $itemData['inventory_item_id'],
                'requested_qty' => $itemData['requested_qty'],
                'approved_qty' => 0,
                'consumed_qty' => 0,
            ]);
        }

        return redirect()->back()->with('success', "Material demand requisition #DEM-{$demand->id} submitted successfully with formal application letter.");
    }

    /**
     * Show formal printable demand letter.
     */
    public function show(int $id): Response
    {
        $user = auth()->user();
        $demand = MaterialDemand::with([
                'batch.course.trade.program.department',
                'user',
                'approvedBy',
                'items.inventoryItem',
            ])
            ->where('user_id', $user->id)
            ->findOrFail($id);

        return Inertia::render('Teacher/Demands/Show', [
            'demand' => $demand,
        ]);
    }
}
