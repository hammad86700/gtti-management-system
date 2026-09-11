import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Award,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    User,
    Calendar,
    CalendarDays,
    ShieldCheck,
    FileText,
    AlertCircle,
    ExternalLink,
    X,
    Filter
} from 'lucide-react';

export default function Index({ certificates = [], stats = {} }) {
    const [filterTab, setFilterTab] = useState('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [rejectingCert, setRejectingCert] = useState(null);

    const {
        data: rejectData,
        setData: setRejectData,
        post: postReject,
        processing: rejectProcessing,
        errors: rejectErrors,
        reset: resetReject
    } = useForm({
        rejection_reason: '',
    });

    const handleApprove = (cert) => {
        if (confirm(`Confirm and authorize official certificate ${cert.certificate_number} for ${cert.student_profile?.user?.name}? This will immediately unlock the digital certificate on their portal.`)) {
            router.post(route('admin.certificates.approve', cert.id), {}, {
                preserveScroll: true,
            });
        }
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        if (!rejectingCert) return;

        postReject(route('admin.certificates.reject', rejectingCert.id), {
            preserveScroll: true,
            onSuccess: () => {
                setRejectingCert(null);
                resetReject();
            },
        });
    };

    const filteredCerts = certificates.filter((c) => {
        const matchesTab =
            filterTab === 'all'
                ? true
                : filterTab === 'pending'
                    ? c.status === 'pending_approval'
                    : filterTab === 'requested'
                        ? c.status === 'requested'
                        : filterTab === 'approved'
                            ? c.status === 'approved'
                            : c.status === filterTab;

        const candidateName = c.student_profile?.user?.name || '';
        const rollNum = c.student_profile?.user?.roll_number || c.student_profile?.user?.cnic || '';
        const certNum = c.certificate_number || '';
        const courseName = c.course?.name || '';

        const matchesSearch =
            candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rollNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
            certNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
            courseName.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTab && matchesSearch;
    });

    return (
        <AdminLayout>
            <Head title="Executive Certificate Approval Desk - Principal Authority" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium mb-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Executive Institutional Governance</span>
                            <span>•</span>
                            <span>Principal Certificate Endorsement Desk</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Certificate Approval Desk
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Confirm, digitally sign, and authorize official course completion certificates drafted by the Examination Clerk
                        </p>
                    </div>
                </div>

                {/* Executive KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-amber-50 dark:bg-amber-950/40 rounded-2xl p-4 border border-amber-200 dark:border-amber-800 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                                Awaiting Principal Signature
                            </span>
                            <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-3xl font-black text-amber-900 dark:text-amber-200 mt-2">
                            {stats.pending || 0}
                        </p>
                        <span className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 block">
                            Mandatory confirmation required before digital release
                        </span>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                                Confirmed & Released
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-3xl font-black text-emerald-900 dark:text-emerald-200 mt-2">
                            {stats.approved || 0}
                        </p>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 block">
                            Digital copy active on student dashboard
                        </span>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/40 rounded-2xl p-4 border border-blue-200 dark:border-blue-800 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                                Student Applications
                            </span>
                            <Award className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-3xl font-black text-blue-900 dark:text-blue-200 mt-2">
                            {stats.requested || 0}
                        </p>
                        <span className="text-[11px] text-blue-700 dark:text-blue-400 mt-1 block">
                            Direct requests awaiting clerk processing
                        </span>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5 self-start">
                        {[
                            { id: 'pending', label: 'Awaiting Confirmation', count: stats.pending || 0 },
                            { id: 'approved', label: 'Confirmed & Signed', count: stats.approved || 0 },
                            { id: 'requested', label: 'Student Applied', count: stats.requested || 0 },
                            { id: 'all', label: 'All Records', count: certificates.length },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setFilterTab(tab.id)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                                    filterTab === tab.id
                                        ? 'bg-emerald-700 text-white shadow-xs'
                                        : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterTab === tab.id ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200'}`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search candidate, cert #, course..."
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                {/* Certificates List */}
                <div className="space-y-3">
                    {filteredCerts.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 border border-slate-200 dark:border-slate-700 text-center text-slate-400 text-xs shadow-xs">
                            No certificates currently found in this category.
                        </div>
                    ) : (
                        filteredCerts.map((cert) => (
                            <div
                                key={cert.id}
                                className={`bg-white dark:bg-slate-800 rounded-2xl border p-5 transition shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                    cert.status === 'pending_approval'
                                        ? 'border-amber-300 dark:border-amber-700/80 bg-amber-50/20'
                                        : 'border-slate-200 dark:border-slate-700'
                                }`}
                            >
                                <div className="space-y-2 max-w-2xl">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-mono font-black text-xs text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800">
                                            {cert.certificate_number}
                                        </span>

                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                            Grade: {cert.grade || 'A'}
                                        </span>

                                        {cert.status === 'pending_approval' && (
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white flex items-center gap-1 shadow-xs animate-pulse">
                                                <Clock className="w-3 h-3" />
                                                ACTION REQUIRED: Awaiting Principal Confirmation
                                            </span>
                                        )}
                                        {cert.status === 'approved' && (
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Confirmed & Digitally Released
                                            </span>
                                        )}
                                        {cert.status === 'rejected' && (
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1 shadow-xs">
                                                <XCircle className="w-3 h-3" />
                                                Rejected
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                                            {cert.student_profile?.user?.name || 'Candidate Name'}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            CNIC: <strong className="text-slate-700 dark:text-slate-200">{cert.student_profile?.user?.cnic || 'N/A'}</strong> • Program: <strong className="text-slate-700 dark:text-slate-200">{cert.course?.name}</strong> ({cert.batch?.name || 'Session 2026'})
                                        </p>
                                    </div>

                                    {/* Issue and Collection Date Badges */}
                                    <div className="flex flex-wrap items-center gap-3 text-xs pt-1 text-slate-600 dark:text-slate-300">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            <span>Issued: <strong>{cert.issue_date || 'Pending'}</strong></span>
                                        </div>

                                        {cert.collection_date && (
                                            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>College Physical Pick-up Date: <strong>{cert.collection_date}</strong></span>
                                            </div>
                                        )}

                                        {cert.issuer && (
                                            <span className="text-[11px] text-slate-400">
                                                Drafted by: {cert.issuer.name}
                                            </span>
                                        )}
                                    </div>

                                    {cert.rejection_reason && (
                                        <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900">
                                            <strong>Audit Notes:</strong> {cert.rejection_reason}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                                    {cert.status === 'pending_approval' && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleApprove(cert)}
                                                className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>Confirm & Release Digital</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setRejectingCert(cert)}
                                                className="w-full sm:w-auto px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950 hover:text-rose-600 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                <span>Reject / Return</span>
                                            </button>
                                        </>
                                    )}

                                    {cert.status === 'approved' && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold">
                                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                            <span>Signed & Endorsed</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ========================================================================= */}
            {/* REJECTION REASON MODAL                                                    */}
            {/* ========================================================================= */}
            {rejectingCert && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Reject Certificate Draft: {rejectingCert.certificate_number}
                            </h3>
                            <button
                                onClick={() => setRejectingCert(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleRejectSubmit} className="p-6 space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Reason for Rejection / Return to Clerk <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={rejectData.rejection_reason}
                                    onChange={(e) => setRejectData('rejection_reason', e.target.value)}
                                    rows={3}
                                    required
                                    placeholder="Explain required correction (e.g. grade discrepancy, library clearance issue, incorrect collection date)..."
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                                {rejectErrors.rejection_reason && (
                                    <p className="text-rose-500 text-[11px] mt-1">{rejectErrors.rejection_reason}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setRejectingCert(null)}
                                    className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={rejectProcessing}
                                    className="px-5 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow transition disabled:opacity-50"
                                >
                                    {rejectProcessing ? 'Rejecting...' : 'Reject Certificate'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
