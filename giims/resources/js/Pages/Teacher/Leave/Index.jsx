import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarDays,
    Calendar,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock,
    Paperclip,
    Filter,
    Inbox,
    UserCheck,
    AlertCircle,
    Check,
    X
} from 'lucide-react';

export default function Index({ leaves = [] }) {
    const [statusFilter, setStatusFilter] = useState('pending'); // 'all' | 'pending' | 'approved' | 'rejected'

    // Rejection Modal State
    const [rejectingLeave, setRejectingLeave] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isSubmittingRejection, setIsSubmittingRejection] = useState(false);
    const [rejectionError, setRejectionError] = useState('');

    const handleApprove = (id) => {
        router.patch(
            route('teacher.leaves.update-status', { id }),
            { status: 'approved' },
            { preserveScroll: true }
        );
    };

    const handleOpenRejectModal = (leave) => {
        setRejectingLeave(leave);
        setRejectionReason('');
        setRejectionError('');
    };

    const handleConfirmReject = (e) => {
        e.preventDefault();
        if (!rejectionReason.trim()) {
            setRejectionError('Please provide a specific justification or reason for rejection.');
            return;
        }

        setIsSubmittingRejection(true);
        router.patch(
            route('teacher.leaves.update-status', { id: rejectingLeave.id }),
            {
                status: 'rejected',
                rejection_reason: rejectionReason,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRejectingLeave(null);
                    setRejectionReason('');
                    setIsSubmittingRejection(false);
                },
                onError: (errs) => {
                    setIsSubmittingRejection(false);
                    setRejectionError(errs.rejection_reason || 'Failed to reject leave request.');
                },
            }
        );
    };

    const filteredLeaves = leaves.filter((leave) => {
        if (statusFilter === 'all') return true;
        return leave.status === statusFilter;
    });

    const pendingCount = leaves.filter((l) => l.status === 'pending').length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('teacher.dashboard')}
                            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h2 className="text-xl font-bold leading-tight text-gray-800 font-serif">
                                Student Leave Applications
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Review absence requests from trainees with automated parent notifications
                            </p>
                        </div>
                    </div>

                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{pendingCount} Pending Requests</span>
                    </span>
                </div>
            }
        >
            <Head title="Leave Approvals - Teacher Workbench" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <span className="text-xs font-bold text-gray-700">Filter by Status:</span>
                    </div>

                    <div className="flex items-center p-1 bg-gray-100 rounded-2xl border border-gray-200 text-xs font-bold">
                        {['pending', 'approved', 'rejected', 'all'].map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setStatusFilter(tab)}
                                className={`px-3 py-1.5 rounded-xl capitalize transition ${
                                    statusFilter === tab
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {tab} ({tab === 'all' ? leaves.length : leaves.filter((l) => l.status === tab).length})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Leaves List */}
                <div className="space-y-4">
                    {filteredLeaves.map((leave) => {
                        const studentProfile = leave.student_profile;
                        const user = studentProfile?.user;
                        const enrollment = studentProfile?.enrollments?.[0];

                        return (
                            <div
                                key={leave.id}
                                className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm space-y-4 transition"
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    {/* Student & Leave Info */}
                                    <div className="space-y-2 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                                {enrollment?.batch?.name || 'Batch'}
                                            </span>
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                {enrollment?.course?.name || 'Course'}
                                            </span>
                                            {leave.category && (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                                                    Category: {leave.category}
                                                </span>
                                            )}
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                leave.status === 'approved'
                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                    : leave.status === 'rejected'
                                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                            }`}>
                                                {leave.status}
                                            </span>
                                        </div>

                                        <h3 className="text-base font-extrabold text-gray-900">
                                            {user?.name || 'Trainee Student'}
                                            <span className="ml-2 text-xs font-mono font-bold text-govt-green">
                                                ({enrollment?.enrollment_number || 'Roll No'})
                                            </span>
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center space-x-1 font-bold text-gray-700">
                                                <CalendarDays className="h-4 w-4 text-govt-green" />
                                                <span>
                                                    Absence Period: {leave.start_date} to {leave.end_date}
                                                </span>
                                            </span>
                                            <span>•</span>
                                            <span>Father: {studentProfile?.father_name || 'N/A'}</span>
                                            <span>•</span>
                                            <span>CNIC: {user?.cnic || 'N/A'}</span>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 space-y-1">
                                            <p className="font-bold text-[10px] uppercase text-gray-500">Stated Application Reason:</p>
                                            <p className="leading-relaxed">{leave.reason}</p>
                                        </div>

                                        {/* Rejection Reason display if rejected */}
                                        {leave.status === 'rejected' && leave.rejection_reason && (
                                            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                                                <p className="font-bold text-[10px] uppercase text-rose-600 flex items-center space-x-1">
                                                    <XCircle className="h-3 w-3" />
                                                    <span>Instructor Stated Rejection Reason (Sent to Parent & Student):</span>
                                                </p>
                                                <p className="leading-relaxed font-semibold">{leave.rejection_reason}</p>
                                            </div>
                                        )}

                                        {leave.file_path && (
                                            <div className="flex items-center space-x-1.5 text-xs text-govt-green font-bold">
                                                <Paperclip className="h-4 w-4" />
                                                <span>Medical Note / Supporting Document: {leave.file_path}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons for Pending Requests */}
                                    {leave.status === 'pending' && (
                                        <div className="flex items-center space-x-2 shrink-0 pt-2 md:pt-0">
                                            <button
                                                type="button"
                                                onClick={() => handleApprove(leave.id)}
                                                className="px-4 py-2.5 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white font-bold text-xs transition shadow-md flex items-center space-x-1.5"
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                                <span>Approve Leave</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleOpenRejectModal(leave)}
                                                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md flex items-center space-x-1.5"
                                            >
                                                <XCircle className="h-3.5 w-3.5" />
                                                <span>Reject</span>
                                            </button>
                                        </div>
                                    )}

                                    {leave.status !== 'pending' && leave.approved_by && (
                                        <div className="text-right text-xs text-gray-500 shrink-0">
                                            <p className="font-semibold">Processed by:</p>
                                            <p className="font-bold text-gray-700">
                                                {leave.approved_by?.name || 'Instructor'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {filteredLeaves.length === 0 && (
                        <div className="rounded-2xl bg-white border border-gray-200 p-12 text-center space-y-3 shadow-sm">
                            <Inbox className="h-10 w-10 text-gray-400 mx-auto" />
                            <h4 className="text-sm font-bold text-gray-800">
                                No {statusFilter !== 'all' ? statusFilter : ''} leave requests found.
                            </h4>
                            <p className="text-xs text-gray-500">
                                Trainees in your assigned batches have not submitted any matching absence requests.
                            </p>
                        </div>
                    )}
                </div>

                {/* ────────────────────────────────────────────────────────
                    MANDATORY REJECTION REASON MODAL
                ──────────────────────────────────────────────────────── */}
                {rejectingLeave && (
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-200 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <div className="flex items-center space-x-2.5">
                                    <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                                        <XCircle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-gray-900 font-serif">
                                            Decline Leave Request
                                        </h3>
                                        <p className="text-[11px] text-gray-500">
                                            A mandatory reason is required for institutional records
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setRejectingLeave(null)}
                                    className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 transition"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
                                <p className="font-bold text-gray-900">
                                    Trainee: {rejectingLeave.student_profile?.user?.name}
                                </p>
                                <p className="text-gray-600">
                                    Requested Absence: <strong>{rejectingLeave.start_date} to {rejectingLeave.end_date}</strong>
                                </p>
                            </div>

                            <form onSubmit={handleConfirmReject} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                                        Reason for Rejection <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        rows="3"
                                        required
                                        value={rejectionReason}
                                        onChange={(e) => {
                                            setRejectionReason(e.target.value);
                                            setRejectionError('');
                                        }}
                                        placeholder="e.g. Critical practical examination scheduled; attendance is compulsory according to TEVTA regulations..."
                                        className="w-full text-xs rounded-xl border-gray-300 text-gray-900 font-medium focus:ring-rose-500 focus:border-rose-500"
                                    />
                                    {rejectionError && (
                                        <p className="text-xs text-rose-600 font-bold mt-1 flex items-center space-x-1">
                                            <AlertCircle className="h-3 w-3" />
                                            <span>{rejectionError}</span>
                                        </p>
                                    )}
                                </div>

                                <p className="text-[11px] text-gray-500 leading-relaxed">
                                    Notice: This reason will be recorded on the trainee's portal and logged in parent notification dispatches.
                                </p>

                                <div className="flex items-center justify-end space-x-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setRejectingLeave(null)}
                                        className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingRejection || !rejectionReason.trim()}
                                        className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-md shadow-rose-900/20"
                                    >
                                        {isSubmittingRejection ? 'Rejecting...' : 'Confirm Rejection & Notify'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}