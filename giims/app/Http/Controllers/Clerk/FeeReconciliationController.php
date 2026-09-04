<?php

namespace App\Http\Controllers\Clerk;

use App\Domains\Finance\Models\FeeChallan;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FeeReconciliationController extends Controller
{
    /**
     * Display the Bank Scroll CSV Reconciliation Desk.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status', 'all');

        $query = FeeChallan::with(['studentProfile.user', 'application.course', 'enrollment.batch.course'])
            ->latest('updated_at');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('challan_number', 'ilike', "%{$search}%")
                    ->orWhere('bank_branch_code', 'ilike', "%{$search}%")
                    ->orWhereHas('studentProfile.user', function ($uq) use ($search) {
                        $uq->where('name', 'ilike', "%{$search}%")
                            ->orWhere('email', 'ilike', "%{$search}%");
                    });
            });
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $challans = $query->paginate(20)->withQueryString();

        $stats = [
            'total_challans' => FeeChallan::count(),
            'paid_challans' => FeeChallan::where('status', 'paid')->count(),
            'unpaid_challans' => FeeChallan::where('status', 'unpaid')->count(),
            'total_reconciled_amount' => (float) FeeChallan::where('status', 'paid')->sum('amount_paid'),
        ];

        return Inertia::render('Clerk/Fees/Reconciliation', [
            'challans' => $challans,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'reconciliation_summary' => session('reconciliation_summary'),
        ]);
    }

    /**
     * Reconcile fee challans from uploaded Bank Scroll CSV.
     */
    public function reconcileScroll(Request $request): RedirectResponse
    {
        $request->validate([
            'scroll_file' => 'required|file|max:10240', // CSV up to 10MB
        ]);

        $file = $request->file('scroll_file');
        $path = $file->getRealPath();

        $handle = fopen($path, 'r');
        if (!$handle) {
            return redirect()->back()->with('error', 'Unable to read the uploaded CSV bank scroll file.');
        }

        // Read header row
        $rawHeaders = fgetcsv($handle);
        if (!$rawHeaders) {
            fclose($handle);
            return redirect()->back()->with('error', 'The bank scroll file is empty or corrupted.');
        }

        // Clean headers
        $headers = array_map(function ($h) {
            return strtolower(trim(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $h)));
        }, $rawHeaders);

        // Find required column indices
        $challanCol = array_search('challan_number', $headers);
        $amountCol = array_search('amount_paid', $headers);
        $dateCol = array_search('deposit_date', $headers);
        $branchCol = array_search('bank_branch_code', $headers);

        if ($challanCol === false) {
            // Fallback column checks
            $challanCol = array_search('challan', $headers);
            if ($challanCol === false) $challanCol = array_search('challan_no', $headers);
        }
        if ($amountCol === false) {
            $amountCol = array_search('amount', $headers);
        }
        if ($dateCol === false) {
            $dateCol = array_search('date', $headers);
            if ($dateCol === false) $dateCol = array_search('paid_date', $headers);
        }

        if ($challanCol === false || $amountCol === false || $dateCol === false) {
            fclose($handle);
            return redirect()->back()->with(
                'error',
                'Invalid CSV structure. Expected headers: challan_number, amount_paid, deposit_date, bank_branch_code'
            );
        }

        $reconciled = [];
        $alreadyPaid = [];
        $unmatched = [];
        $line = 1;

        DB::beginTransaction();
        try {
            while (($data = fgetcsv($handle)) !== false) {
                $line++;
                if (empty($data) || count($data) <= $challanCol) continue;

                $challanNumber = trim($data[$challanCol]);
                if (empty($challanNumber)) continue;

                $amount = (float) str_replace(',', '', trim($data[$amountCol] ?? '0'));
                $depositDate = trim($data[$dateCol] ?? date('Y-m-d'));
                $branchCode = $branchCol !== false && isset($data[$branchCol]) ? trim($data[$branchCol]) : 'BANK-RECON';

                // Format deposit date if necessary
                try {
                    $parsedDate = date('Y-m-d', strtotime($depositDate));
                } catch (\Exception $e) {
                    $parsedDate = date('Y-m-d');
                }

                $challan = FeeChallan::where('challan_number', $challanNumber)->first();

                if (!$challan) {
                    $unmatched[] = [
                        'line' => $line,
                        'challan_number' => $challanNumber,
                        'amount' => $amount,
                        'deposit_date' => $parsedDate,
                        'branch' => $branchCode,
                        'reason' => 'Challan number not found in GIIMS database',
                    ];
                    continue;
                }

                if ($challan->status === 'paid') {
                    $alreadyPaid[] = [
                        'challan_number' => $challanNumber,
                        'previously_paid_at' => (string) $challan->paid_at,
                        'amount' => (float) $challan->amount_paid,
                    ];
                    continue;
                }

                // Execute reconciliation
                $challan->markAsPaid($amount, $parsedDate, $branchCode);

                $reconciled[] = [
                    'challan_number' => $challanNumber,
                    'student_name' => $challan->studentProfile?->user?->name ?? 'Candidate',
                    'amount_paid' => $amount,
                    'deposit_date' => $parsedDate,
                    'bank_branch_code' => $branchCode,
                ];
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            fclose($handle);
            return redirect()->back()->with('error', 'Reconciliation error: ' . $e->getMessage());
        }

        fclose($handle);

        $summary = [
            'reconciled_count' => count($reconciled),
            'already_paid_count' => count($alreadyPaid),
            'unmatched_count' => count($unmatched),
            'reconciled_sample' => array_slice($reconciled, 0, 10),
            'unmatched_sample' => array_slice($unmatched, 0, 10),
            'timestamp' => now()->toDateTimeString(),
        ];

        // Audit log
        if (function_exists('activity')) {
            activity()
                ->causedBy(auth()->user())
                ->log("Admission Clerk reconciled bank scroll: {$summary['reconciled_count']} paid, {$summary['already_paid_count']} already paid, {$summary['unmatched_count']} unmatched.");
        }

        return redirect()->back()->with([
            'success' => "Reconciliation Complete: {$summary['reconciled_count']} challans cleared, {$summary['already_paid_count']} previously paid, {$summary['unmatched_count']} unmatched.",
            'reconciliation_summary' => $summary,
        ]);
    }

    /**
     * Download CSV audit report of all paid challans.
     */
    public function exportAuditReport(): StreamedResponse
    {
        $fileName = 'GIIMS_Bank_Reconciliation_Audit_' . date('Y-m-d_His') . '.csv';

        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Challan Number', 'Candidate Name', 'Roll / App No', 'Challan Type', 'Billed Amount', 'Paid Amount', 'Deposit Date', 'Bank Branch Code', 'Status']);

            FeeChallan::with(['studentProfile.user', 'application', 'enrollment'])
                ->where('status', 'paid')
                ->chunk(200, function ($challans) use ($handle) {
                    foreach ($challans as $c) {
                        fputcsv($handle, [
                            $c->challan_number,
                            $c->studentProfile?->user?->name ?? 'N/A',
                            $c->enrollment?->enrollment_number ?? $c->application?->application_number ?? 'N/A',
                            strtoupper($c->challan_type),
                            $c->amount,
                            $c->amount_paid,
                            $c->paid_at ? $c->paid_at->format('Y-m-d') : 'N/A',
                            $c->bank_branch_code ?? 'BANK-DEPOSIT',
                            strtoupper($c->status),
                        ]);
                    }
                });

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ]);
    }
}
