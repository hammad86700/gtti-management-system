<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Organization\Models\Batch;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class AcademicAllocationController extends Controller
{
    /**
     * Display a listing of batches with their assigned instructors, and list of all teachers.
     */
    public function index(): Response
    {
        $batchesQuery = Batch::with([
            'course.trade.program',
            'users' => function ($q) {
                $q->whereHas('roles', function ($r) {
                    $r->where('slug', 'teacher');
                });
            },
        ]);

        if (Schema::hasColumn('batches', 'status')) {
            $batchesQuery->where('status', 'active');
        }

        $batches = $batchesQuery->orderBy('created_at', 'desc')->get();

        $teachers = User::whereHas('roles', function ($q) {
            $q->where('slug', 'teacher');
        })->orderBy('name')->get();

        return Inertia::render('Admin/Allocations/Index', [
            'batches' => $batches,
            'teachers' => $teachers,
        ]);
    }

    /**
     * Assign an instructor to a specific batch.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'batch_id' => 'required|exists:batches,id',
            'user_id' => 'required|exists:users,id',
        ]);

        $batch = Batch::findOrFail($request->batch_id);
        $batch->users()->syncWithoutDetaching([$request->user_id]);

        return redirect()->back()->with('success', 'Instructor assigned to batch successfully.');
    }

    /**
     * Remove an instructor from a batch.
     */
    public function destroy(Request $request, $batchId, $userId): RedirectResponse
    {
        $batch = Batch::findOrFail($batchId);
        $batch->users()->detach($userId);

        return redirect()->back()->with('success', 'Instructor unassigned from batch successfully.');
    }
}
