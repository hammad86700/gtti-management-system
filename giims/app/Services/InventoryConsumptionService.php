<?php

namespace App\Services;

use App\Domains\Academic\Models\Assignment;
use App\Domains\Examination\Models\Exam;
use App\Domains\Operations\Models\DemandItem;
use App\Domains\Operations\Models\InventoryTransaction;
use App\Domains\Operations\Models\MaterialDemand;
use Illuminate\Support\Facades\Log;

class InventoryConsumptionService
{
    /**
     * Automatically consume relevant approved materials when an examination assessment is created.
     */
    public function consumeForExam(Exam $exam): int
    {
        $batch = $exam->batch;
        if (!$batch) {
            return 0;
        }

        $studentCount = $batch->enrollments()->where('status', 'active')->count();
        if ($studentCount <= 0) {
            $studentCount = 25; // default batch size estimation if not yet enrolled
        }

        // Find approved material demands for this batch
        $demands = MaterialDemand::where('batch_id', $batch->id)
            ->where('status', 'approved')
            ->with(['items.inventoryItem'])
            ->get();

        $totalConsumed = 0;

        foreach ($demands as $demand) {
            foreach ($demand->items as $item) {
                // Check if this item is a consumable suitable for exams/evaluations
                $inv = $item->inventoryItem;
                if (!$inv || $inv->category !== 'consumable') {
                    continue;
                }

                $nameLower = strtolower($inv->name);
                $isExamConsumable = str_contains($nameLower, 'paper') ||
                                    str_contains($nameLower, 'sheet') ||
                                    str_contains($nameLower, 'stationery') ||
                                    str_contains($nameLower, 'cartridge') ||
                                    str_contains($nameLower, 'reams');

                // If approved demand has consumable items
                $available = max(0, (int)$item->approved_qty - (int)$item->consumed_qty);
                if ($available <= 0) {
                    continue;
                }

                // Determine quantity to consume based on unit:
                // If reams/boxes: e.g. 1 per 50 students
                // If sheets/pages/units: e.g. 2 pages per student
                $unitsToDeduct = 1;
                if (str_contains(strtolower($inv->unit), 'sheet') || str_contains(strtolower($inv->unit), 'page')) {
                    $unitsToDeduct = min($available, $studentCount * 2);
                } elseif (str_contains(strtolower($inv->unit), 'ream') || str_contains(strtolower($inv->unit), 'box')) {
                    $unitsToDeduct = min($available, max(1, (int)ceil($studentCount / 50)));
                } else {
                    $unitsToDeduct = min($available, max(1, (int)ceil($studentCount / 20)));
                }

                if ($unitsToDeduct > 0) {
                    $item->increment('consumed_qty', $unitsToDeduct);
                    $totalConsumed += $unitsToDeduct;

                    // Log inventory transaction
                    InventoryTransaction::create([
                        'inventory_item_id' => $inv->id,
                        'user_id' => $exam->user_id ?? auth()->id(),
                        'batch_id' => $batch->id,
                        'transaction_type' => 'stock_out',
                        'quantity' => $unitsToDeduct,
                        'remarks' => "Automated exam consumption: '{$exam->title}' ({$studentCount} trainees)",
                        'transaction_date' => now(),
                    ]);

                    Log::info("[INVENTORY AUTO-CONSUMPTION] Exam '{$exam->title}' consumed {$unitsToDeduct} {$inv->unit} of '{$inv->name}' for Batch '{$batch->name}'.");
                }
            }
        }

        return $totalConsumed;
    }

    /**
     * Automatically consume practical consumables when a workshop assignment/task is created.
     */
    public function consumeForPractical(Assignment $assignment): int
    {
        $batch = $assignment->batch;
        if (!$batch) {
            return 0;
        }

        $studentCount = $batch->enrollments()->where('status', 'active')->count();
        if ($studentCount <= 0) {
            $studentCount = 20;
        }

        $demands = MaterialDemand::where('batch_id', $batch->id)
            ->where('status', 'approved')
            ->with(['items.inventoryItem'])
            ->get();

        $totalConsumed = 0;

        foreach ($demands as $demand) {
            foreach ($demand->items as $item) {
                $inv = $item->inventoryItem;
                if (!$inv || $inv->category !== 'consumable') {
                    continue;
                }

                $available = max(0, (int)$item->approved_qty - (int)$item->consumed_qty);
                if ($available <= 0) {
                    continue;
                }

                $unitsToDeduct = min($available, max(1, (int)ceil($studentCount / 10)));
                if ($unitsToDeduct > 0) {
                    $item->increment('consumed_qty', $unitsToDeduct);
                    $totalConsumed += $unitsToDeduct;

                    InventoryTransaction::create([
                        'inventory_item_id' => $inv->id,
                        'user_id' => auth()->id(),
                        'batch_id' => $batch->id,
                        'transaction_type' => 'stock_out',
                        'quantity' => $unitsToDeduct,
                        'remarks' => "Practical task auto-consumption: '{$assignment->title}'",
                        'transaction_date' => now(),
                    ]);

                    Log::info("[INVENTORY AUTO-CONSUMPTION] Assignment '{$assignment->title}' consumed {$unitsToDeduct} {$inv->unit} of '{$inv->name}'.");
                }
            }
        }

        return $totalConsumed;
    }
}
