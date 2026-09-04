import { useState } from 'react';
import ClerkLayout from '@/Layouts/ClerkLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    FileCheck,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Clock,
    FileText,
    ExternalLink,
    AlertTriangle,
    Eye,
    ChevronLeft,
    ChevronRight,
    User,
    Award
} from 'lucide-react';

export default function Index({ applications = {}, courses = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCourse, setSelectedCourse] = useState(filters.course_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [rejectModal, setRejectModal] = useState(false);
    const [dossierModal, setDossierModal] = useState(false);
    const [activeApp, setActiveApp] = useState(null);
    const [verifyingId, setVerifyingId] = useState(null);

    // Reject Form
    const rejectForm = useForm({
        clerk_remarks: '',
    });

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(route('clerk.applications.index'), {
            search: search || undefined,
            course_id: selectedCourse || undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
        }, {
            preserveState: true,
        });
    };

    const handleVerify = (appId) => {
        setVerifyingId(appId);
        router.post(route('clerk.applications.verify', appId), {}, {
            preserveScroll: true,
            onFinish: () => setVerifyingId(null),
        });
    };

    const handleOpenReject = (app) => {
        setActiveApp(app);
        rejectForm.setData('clerk_remarks', app.clerk_remarks || '');
        setRejectModal(true);
    };

    const handleConfirmReject = (e) => {
        e.preventDefault();
        if (!activeApp) return;

        rejectForm.post(route('clerk.applications.reject', activeApp.id), {
            preserveScroll: true,
            onSuccess: () => {
                setRejectModal(false);
                setActiveApp(null);
                rejectForm.reset();
            },
        });
    };

    const handleOpenDossier = (app) => {
        setActiveApp(app);
        setDossierModal(true);
    };

    const appsList = applications.data || [];

    return (
        <ClerkLayout
            header={
                <div className="flex items-center space-x-2 text-xs font-medium">
                    <span className="font-bold text-[#C1902F]">Clerk Desk</span>
                    <span>/</span>
                    <span className="text-white font-semibold">Application Scrutiny & Verification Desk</span>
                </div>
            }
        >
            <Head title="Application Scrutiny Desk - GTTI Clerk Portal" />

            <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header & Filter Bar */}
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                                <FileCheck className="h-5 w-5 text-emerald-400" />
                                <h1 className="text-xl font-black text-white">Application Scrutiny Desk</h1>
                            </div>
                            <p className="text-xs text-slate-400">
                                Verify candidate documents or flag rejections with mandatory scrutiny observations.
                            </p>
                        </div>
                    </div>

                    {/* Filter Controls */}
                    <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                        {/* Course Dropdown */}
                        <div>
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold"
                            >
                                <option value="">All Trades & Courses</option>
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.pending_count} pending)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Dropdown */}
                        <div>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold"
                            >
                                <option value="all">All Application Statuses</option>
                                <option value="submitted">Pending Scrutiny</option>
                                <option value="verified">Verified (Approved)</option>
                                <option value="rejected">Rejected (Flagged)</option>
                            </select>
                        </div>

                        {/* Search Input */}
                        <div>
                            <input
                                type="text"
                                placeholder="Search by name, CNIC, or App #"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 font-mono"
                            />
                        </div>

                        {/* Filter Button */}
                        <div className="flex items-center space-x-2">
                            <button
                                type="submit"
                                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                            >
                                Filter Roster
                            </button>
                        </div>
                    </form>
                </div>

                {/* Applications Table */}
                <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-white">
                            Candidate Dossiers ({applications.total || appsList.length})
                        </h2>
                        <span className="text-xs text-slate-500 font-mono">
                            Page {applications.current_page || 1} of {applications.last_page || 1}
                        </span>
                    </div>

                    {appsList.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                                    <tr>
                                        <th className="py-3 px-4">Candidate Identity</th>
                                        <th className="py-3 px-4">CNIC & Reg</th>
                                        <th className="py-3 px-4">Trade Applied</th>
                                        <th className="py-3 px-4">Scrutiny Status</th>
                                        <th className="py-3 px-4">Scrutinized By</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 text-slate-300">
                                    {appsList.map((app) => {
                                        const student = app.student_profile?.user;
                                        const isVerified = app.status === 'verified';
                                        const isRejected = app.status === 'rejected';

                                        return (
                                            <tr key={app.id} className="hover:bg-slate-800/40 transition">
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-white text-sm">{student?.name || 'Candidate'}</div>
                                                    <div className="text-[11px] text-slate-400">
                                                        Father: {app.student_profile?.father_name || 'N/A'} • App #{app.application_number}
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4 font-mono">
                                                    <div className="text-amber-400 font-bold">{student?.cnic || 'N/A'}</div>
                                                    <div className="text-[10px] text-slate-500">{student?.email}</div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="font-semibold text-white">{app.course?.name}</div>
                                                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                                                        {app.course?.admission_type === 'merit_based' ? 'Merit' : 'FCFS'}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                                                        isVerified
                                                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                            : isRejected
                                                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                                    }`}>
                                                        {app.status}
                                                    </span>
                                                    {isRejected && app.clerk_remarks && (
                                                        <span className="text-[10px] text-rose-300 block mt-1 truncate max-w-xs" title={app.clerk_remarks}>
                                                            Reason: {app.clerk_remarks}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4 text-xs">
                                                    {app.scrutinizer ? (
                                                        <div>
                                                            <span className="font-bold text-slate-200 block">{app.scrutinizer.name}</span>
                                                            <span className="text-[10px] text-slate-500 font-mono">
                                                                {new Date(app.scrutinized_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-500 italic">Pending</span>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                                                    {/* View Dossier */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenDossier(app)}
                                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                                                        title="View Dossier & Uploaded Documents"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>

                                                    {/* 1-Click Verify */}
                                                    <button
                                                        type="button"
                                                        disabled={isVerified || verifyingId === app.id}
                                                        onClick={() => handleVerify(app.id)}
                                                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs transition disabled:opacity-40"
                                                        title="Verify Applicant Dossier"
                                                    >
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        <span>Verify</span>
                                                    </button>

                                                    {/* Reject with Remarks */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenReject(app)}
                                                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs transition"
                                                        title="Reject Application with Remarks"
                                                    >
                                                        <XCircle className="h-3.5 w-3.5" />
                                                        <span>Reject</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-16 text-center text-slate-500 space-y-2">
                            <FileText className="h-10 w-10 text-slate-600 mx-auto" />
                            <p className="text-sm font-bold text-slate-400">No Applications Found</p>
                            <p className="text-xs">Adjust filters or search parameters to view other applicants.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reject with Remarks Modal */}
            {rejectModal && activeApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-5 shadow-2xl text-slate-100">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div className="flex items-center space-x-2 text-rose-400">
                                <XCircle className="h-5 w-5" />
                                <h3 className="text-base font-black text-white">Reject Application</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setRejectModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                            Candidate: <strong className="text-white">{activeApp.student_profile?.user?.name}</strong> • Course: <strong className="text-white">{activeApp.course?.name}</strong>
                        </div>

                        <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-300 mb-1.5">
                                    Mandatory Clerical Remarks / Rejection Reason *
                                </label>
                                <textarea
                                    required
                                    rows="4"
                                    placeholder="e.g. Incomplete Matric mark sheet, expired Domicile certificate, or illegible CNIC copy..."
                                    value={rejectForm.data.clerk_remarks}
                                    onChange={(e) => rejectForm.setData('clerk_remarks', e.target.value)}
                                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-rose-500"
                                />
                                <span className="text-[10px] text-slate-500 block mt-1">
                                    This official observation will be logged to the Principal audit table and displayed to the candidate.
                                </span>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setRejectModal(false)}
                                    className="py-2.5 px-4 rounded-xl border border-slate-700 text-slate-400 font-bold hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={rejectForm.processing || rejectForm.data.clerk_remarks.length < 5}
                                    className="py-2.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition disabled:opacity-40"
                                >
                                    {rejectForm.processing ? 'Rejecting...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Dossier & Documents Inspection Modal */}
            {dossierModal && activeApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl text-slate-100">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#C1902F]">Candidate Dossier</span>
                                <h3 className="text-xl font-black text-white">{activeApp.student_profile?.user?.name}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDossierModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Candidate Details Grid */}
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase block">Father Name</span>
                                <span className="font-bold text-white">{activeApp.student_profile?.father_name || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase block">CNIC / Form B</span>
                                <span className="font-mono text-amber-400 font-bold">{activeApp.student_profile?.user?.cnic}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase block">Application #</span>
                                <span className="font-mono text-slate-300">{activeApp.application_number}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase block">Course Applied</span>
                                <span className="font-bold text-slate-200 truncate block">{activeApp.course?.name}</span>
                            </div>
                        </div>

                        {/* Uploaded Documents List */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                Uploaded Verification Credentials ({activeApp.documents?.length || 0})
                            </h4>
                            {activeApp.documents && activeApp.documents.length > 0 ? (
                                <div className="space-y-2">
                                    {activeApp.documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                                        >
                                            <div className="flex items-center space-x-2.5">
                                                <FileText className="h-4 w-4 text-amber-400" />
                                                <span className="font-bold text-white uppercase">{doc.document_type}</span>
                                            </div>
                                            <a
                                                href={`/${doc.file_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-[11px] transition"
                                            >
                                                <span>View Document</span>
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-500 text-center">
                                    No digitized documents attached to this application.
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => setDossierModal(false)}
                                className="py-2.5 px-4 rounded-xl border border-slate-700 text-slate-400 font-bold text-xs hover:text-white"
                            >
                                Close Dossier
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setDossierModal(false);
                                    handleVerify(activeApp.id);
                                }}
                                className="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition"
                            >
                                Verify Candidate Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ClerkLayout>
    );
}
