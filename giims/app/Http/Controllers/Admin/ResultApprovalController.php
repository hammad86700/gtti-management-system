<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Examination\Models\Exam;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResultApprovalController extends Controller
{
    /**
     * Display administrative list of examinations, candidate marks entry status, and approval controls.
     */
    public function index(): Response
    {
        $exams = Exam::with([
                'batch.course.trade.program.department',
                'subject',
                'user',
                'lockedBy',
                'examResults.studentProfile.user',
            ])
            ->latest()
            ->get();

        return Inertia::render('Admin/Exams/Approvals', [
            'exams' => $exams,
        ]);
    }

    /**
     * Officially verify and lock the examination results to prevent unauthorized tampering.
     */
    public function lock(Request $request, int $examId): RedirectResponse
    {
        $user = auth()->user();
        if (! $user->hasRole(['super-admin', 'principal'])) {
            abort(403, 'Unauthorized: Only the Principal or Super Admin holds the authority to lock examination results.');
        }

        $exam = Exam::findOrFail($examId);

        $exam->update([
            'is_locked' => true,
            'locked_by' => $user->id,
        ]);

        \App\Domains\Operations\Models\ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'locked',
            'model_type' => Exam::class,
            'model_id' => $exam->id,
            'description' => "Finalized and locked examination results for '{$exam->title}'",
            'new_data' => ['is_locked' => true, 'locked_by' => $user->id],
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Examination '{$exam->title}' results have been verified and permanently locked.");
    }

    /**
     * Unlock an examination result for official corrections.
     */
    public function unlock(Request $request, int $examId): RedirectResponse
    {
        $user = auth()->user();
        if (! $user->hasRole(['super-admin', 'principal'])) {
            abort(403, 'Unauthorized: Only the Principal or Super Admin holds the authority to unlock examination results.');
        }

        $exam = Exam::findOrFail($examId);

        $exam->update([
            'is_locked' => false,
            'locked_by' => null,
        ]);

        \App\Domains\Operations\Models\ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'unlocked',
            'model_type' => Exam::class,
            'model_id' => $exam->id,
            'description' => "Unlocked examination results for '{$exam->title}' for authorized corrections",
            'new_data' => ['is_locked' => false, 'locked_by' => null],
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Examination '{$exam->title}' has been unlocked for authorized corrections.");
    }
}
