import { useState } from 'react';
import ClerkLayout from '@/Layouts/ClerkLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    CreditCard,
    Upload,
    Download,
    CheckCircle2,
    AlertCircle,
    Clock,
    Search,
    Filter,
    FileSpreadsheet,
    Building2,
    X,
    ArrowUpRight,
    HelpCircle
} from 'lucide-react';

export default function Reconciliation({ challans, stats, filters = {}, reconciliation_summary }) {
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const { data, setData, post, processing, errors, reset } = useForm({
        scroll_file: null,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('clerk.fees.reconciliation'), { search, status: statusFilter }, { preserveState: true });
    };

    const handleStatusChange = (newStatus) => {
        setStatusFilter(newStatus);
        router.get(route('clerk.fees.reconciliation'), { search, status: newStatus }, { preserveState: true });
    };

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        post(route('clerk.fees.reconcile-scroll'), {
            onSuccess: () => {
                setUploadModalOpen(false);
                reset();
            },
        });
    };

    // Helper to generate a sample CSV download on the fly
    const downloadSampleCsv = () => {
        const sample = "challan_number,amount_paid,deposit_date,bank_branch_code\nCHL-2026-0001,3500,2026-09-04,BOP-0142\nCHL-2026-0002,1200,2026-09-04,HBL-0891\nCHL-2026-0003,5000,2026-09-03,NBP-0055\n";
        const blob = new Blob([sample], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'Sample_Bank_Scroll.csv');
        a.click();
    };

    return (
        <ClerkLayout
            header={
                <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
                    <span className="font-bold text-amber-400">Accounts & Dues</span>
                    <span>/</span>
                    <span className="text-white font-semibold">Bank Scroll CSV Reconciliation Desk</span>
                </div>
            }
        >
            <Head title="Bank Scroll Reconciliation - GIIMS Clerk" />

            <div className="p-4 sm:p-8 space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
                    <div className="space-y-1">
                        <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>1-Click Fee Auto-Clearance Desk</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            Bank Scroll CSV Reconciliation
                        </h1>
                        <p className="text-xs text-slate-400">
                            Upload daily bank deposit scrolls (.csv) to automatically mark fee challans as paid and unlock candidate admission/clearance.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        <a
                            href={route('clerk.fees.audit-report')}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition"
                        >
                            <Download className="h-3.5 w-3.5 text-slate-400" />
                            <span>Export Audit Log</span>
                        </a>

                        <button
                            type="button"
                            onClick={() => setUploadModalOpen(true)}
                            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#C1902F] hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-sm"
                        >
                            <Upload className="h-3.5 w-3.5" />
                            <span>Upload Bank Scroll</span>
                        </button>
                    </div>
                </div>

                {/* Reconciliation Summary Alert (if recently processed) */}
                {reconciliation_summary && (
                    <div className="p-5 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-lg space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">
                                        Bank Scroll Processing Summary
                                    </h4>
                                    <p className="text-xs text-slate-400 font-mono">
                                        Batch Timestamp: {reconciliation_summary.timestamp}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-2">
                            <div className="p-3 bg-emerald-950/40 rounded-2xl border border-emerald-800/40 text-center">
                                <p className="text-[10px] text-emerald-400 uppercase font-black">Newly Reconciled</p>
                                <p className="text-xl font-black text-white mt-0.5">{reconciliation_summary.reconciled_count}</p>
                            </div>
                            <div className="p-3 bg-blue-950/40 rounded-2xl border border-blue-800/40 text-center">
                                <p className="text-[10px] text-blue-400 uppercase font-black">Previously Paid</p>
                                <p className="text-xl font-black text-white mt-0.5">{reconciliation_summary.already_paid_count}</p>
                            </div>
                            <div className="p-3 bg-rose-950/40 rounded-2xl border border-rose-800/40 text-center">
                                <p className="text-[10px] text-rose-400 uppercase font-black">Unmatched / Not Found</p>
                                <p className="text-xl font-black text-white mt-0.5">{reconciliation_summary.unmatched_count}</p>
                            </div>
                        </div>

                        {reconciliation_summary.unmatched_count > 0 && (
                            <div className="mt-2 text-xs text-rose-300/80 bg-rose-950/20 p-2.5 rounded-xl border border-rose-900/40">
                                <strong>Notice:</strong> {reconciliation_summary.unmatched_count} rows in the scroll could not be matched with any generated challan. Please verify branch code or challan IDs.
                            </div>
                        )}
                    </div>
                )}

                {/* 4 Metric KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between text-slate-400 text-xs">
                            <span className="font-bold uppercase tracking-wider text-[10px]">Total Challans</span>
                            <CreditCard className="h-4 w-4 text-slate-500" />
                        </div>
                        <p className="text-2xl font-black text-white mt-1">{stats.total_challans}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Generated in GIIMS</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between text-slate-400 text-xs">
                            <span className="font-bold uppercase tracking-wider text-[10px]">Paid / Cleared</span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </div>
                        <p className="text-2xl font-black text-emerald-400 mt-1">{stats.paid_challans}</p>
                        <p className="text-[10px] text-emerald-500/70 mt-0.5">Validated Deposits</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between text-slate-400 text-xs">
                            <span className="font-bold uppercase tracking-wider text-[10px]">Unpaid Dues</span>
                            <Clock className="h-4 w-4 text-amber-400" />
                        </div>
                        <p className="text-2xl font-black text-amber-400 mt-1">{stats.unpaid_challans}</p>
                        <p className="text-[10px] text-amber-500/70 mt-0.5">Awaiting Deposit</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between text-slate-400 text-xs">
                            <span className="font-bold uppercase tracking-wider text-[10px]">Reconciled Volume</span>
                            <Building2 className="h-4 w-4 text-blue-400" />
                        </div>
                        <p className="text-2xl font-black text-white mt-1">Rs. {Number(stats.total_reconciled_amount).toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Bank Confirmed Funds</p>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
                    <form onSubmit={handleSearch} className="relative w-full md:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search Challan No, Candidate, Branch..."
                            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        />
                    </form>

                    <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                        {['all', 'unpaid', 'paid'].map((st) => (
                            <button
                                key={st}
                                type="button"
                                onClick={() => handleStatusChange(st)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                                    statusFilter === st
                                        ? 'bg-[#C1902F] text-slate-950'
                                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                                }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Challans Table */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                    <th className="py-3.5 px-4 font-mono">Challan Number</th>
                                    <th className="py-3.5 px-4">Candidate / Student</th>
                                    <th className="py-3.5 px-3">Type</th>
                                    <th className="py-3.5 px-3 font-mono">Billed</th>
                                    <th className="py-3.5 px-3 font-mono">Paid Amount</th>
                                    <th className="py-3.5 px-3">Deposit Date</th>
                                    <th className="py-3.5 px-3">Bank Branch</th>
                                    <th className="py-3.5 px-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {challans.data?.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-800/30 transition">
                                        <td className="py-3 px-4 font-mono font-bold text-amber-400">
                                            {c.challan_number}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-bold text-white">
                                                {c.student_profile?.user?.name || 'Trainee Candidate'}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-mono">
                                                {c.application?.application_number || c.enrollment?.enrollment_number || 'ID: ' + c.student_profile_id}
                                            </p>
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px] uppercase">
                                                {c.challan_type}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 font-mono text-slate-300 font-bold">
                                            Rs. {Number(c.amount).toLocaleString()}
                                        </td>
                                        <td className="py-3 px-3 font-mono text-white font-bold">
                                            {c.amount_paid ? `Rs. ${Number(c.amount_paid).toLocaleString()}` : '—'}
                                        </td>
                                        <td className="py-3 px-3 text-slate-400">
                                            {c.paid_at || '—'}
                                        </td>
                                        <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                                            {c.bank_branch_code || '—'}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {c.status === 'paid' ? (
                                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    <span>Paid</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                                    <Clock className="h-3 w-3" />
                                                    <span>Unpaid</span>
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {(!challans.data || challans.data.length === 0) && (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-slate-500">
                                            No fee challans found matching your filter criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Upload Modal */}
                {uploadModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <div className="flex items-center space-x-2">
                                    <FileSpreadsheet className="h-5 w-5 text-amber-400" />
                                    <h3 className="font-bold text-white text-base">
                                        Upload Bank Deposit Scroll (CSV)
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setUploadModalOpen(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
                                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-300">Expected CSV Columns:</span>
                                        <button
                                            type="button"
                                            onClick={downloadSampleCsv}
                                            className="text-amber-400 hover:underline font-bold flex items-center space-x-1"
                                        >
                                            <Download className="h-3 w-3" />
                                            <span>Download Sample CSV</span>
                                        </button>
                                    </div>
                                    <code className="block p-2 bg-slate-900 rounded-xl font-mono text-[11px] text-amber-300/80 overflow-x-auto">
                                        challan_number, amount_paid, deposit_date, bank_branch_code
                                    </code>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block font-bold text-slate-300">
                                        Select Bank Scroll CSV File <span className="text-rose-400">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept=".csv,.txt"
                                        onChange={(e) => setData('scroll_file', e.target.files[0])}
                                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-400 file:text-slate-950 hover:file:bg-amber-300 cursor-pointer"
                                        required
                                    />
                                    {errors.scroll_file && (
                                        <p className="text-rose-400 text-[11px] mt-1">{errors.scroll_file}</p>
                                    )}
                                </div>

                                <div className="pt-2 flex items-center justify-end space-x-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setUploadModalOpen(false)}
                                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing || !data.scroll_file}
                                        className="px-5 py-2 rounded-xl bg-[#C1902F] hover:bg-amber-400 text-slate-950 font-black transition shadow-sm disabled:opacity-50 flex items-center space-x-1.5"
                                    >
                                        <Upload className="h-4 w-4" />
                                        <span>{processing ? 'Reconciling...' : 'Process Reconciliation'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </ClerkLayout>
    );
}
