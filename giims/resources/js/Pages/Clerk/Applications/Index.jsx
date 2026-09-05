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
    Award,
    Phone,
    MessageCircle,
    UploadCloud,
    Download,
    CreditCard
} from 'lucide-react';

export default function Index({ applications = {}, courses = [], filters = {}, pendingFeeCount = 0 }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCourse, setSelectedCourse] = useState(filters.course_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedFeeStatus, setSelectedFeeStatus] = useState(filters.fee_status || 'all');
    const [rejectModal, setRejectModal] = useState(false);
    const [dossierModal, setDossierModal] = useState(false);
    const [challanModal, setChallanModal] = useState(false);
    const [challanTargetApp, setChallanTargetApp] = useState(null);
    const [activeApp, setActiveApp] = useState(null);
    const [verifyingId, setVerifyingId] = useState(null);
    const [confirmingId, setConfirmingId] = useState(null);

    // Reject Form
    const rejectForm = useForm({
        clerk_remarks: '',
    });

    // Custom Fee Challan Upload Form
    const challanForm = useForm({
        challan_file: null,
    });

    // Selective Fee Challan Issuance Form
    const [issueChallanModal, setIssueChallanModal] = useState(false);
    const [issueChallanTargetApp, setIssueChallanTargetApp] = useState(null);
    const issueChallanForm = useForm({
        payment_deadline: '',
    });

    const handleOpenIssueChallanModal = (app) => {
        setIssueChallanTargetApp(app);
        const d = new Date();
        d.setDate(d.getDate() + 5);
        issueChallanForm.setData('payment_deadline', d.toISOString().split('T')[0]);
        setIssueChallanModal(true);
    };

    const handleIssueChallanSubmit = (e) => {
        e.preventDefault();
        if (!issueChallanTargetApp) return;
        issueChallanForm.post(route('clerk.applications.issue-challan', issueChallanTargetApp.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIssueChallanModal(false);
                setIssueChallanTargetApp(null);
            },
        });
    };

    const handleOpenChallanModal = (app) => {
        setChallanTargetApp(app);
        setChallanModal(true);
    };

    const handleUploadChallanSubmit = (e) => {
        e.preventDefault();
        if (!challanTargetApp) return;
        challanForm.post(route('clerk.applications.upload-challan', challanTargetApp.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setChallanModal(false);
                setChallanTargetApp(null);
                challanForm.reset();
            },
        });
    };

    const handleFilterSubmit = (e) => {
        if (e) e.preventDefault();
        router.get(route('clerk.applications.index'), {
            search: search || undefined,
            course_id: selectedCourse || undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            fee_status: selectedFeeStatus !== 'all' ? selectedFeeStatus : undefined,
        }, {
            preserveState: true,
        });
    };

    const handleQuickFilter = (status, feeStatus = 'all') => {
        setSelectedStatus(status);
        setSelectedFeeStatus(feeStatus);
        router.get(route('clerk.applications.index'), {
            search: search || undefined,
            course_id: selectedCourse || undefined,
            status: status !== 'all' ? status : undefined,
            fee_status: feeStatus !== 'all' ? feeStatus : undefined,
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

    const handleConfirmAdmission = (appId) => {
        setConfirmingId(appId);
        router.post(route('clerk.applications.verify-challan', appId), {}, {
            preserveScroll: true,
            onFinish: () => setConfirmingId(null),
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
                    <span className="text-white font-semibold">Candidate Applications & Scrutiny</span>
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
                                Verify candidate documents, inspect paid bank fee receipts, or confirm formal admissions.
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
                                        {c.name} ({c.pending_count} pending scrutiny)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Dropdown */}
                        <div>
                            <select
                                value={selectedFeeStatus === 'pending_verification' ? 'pending_fee' : selectedStatus}
                                onChange={(e) => {
                                    if (e.target.value === 'pending_fee') {
                                        setSelectedStatus('all');
                                        setSelectedFeeStatus('pending_verification');
                                    } else {
                                        setSelectedStatus(e.target.value);
                                        setSelectedFeeStatus('all');
                                    }
                                }}
                                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold"
                            >
                                <option value="all">All Application Statuses</option>
                                <option value="pending_fee">⚡ Fee Verification Due (Bank Slip Uploaded)</option>
                                <option value="submitted">Pending Scrutiny</option>
                                <option value="verified">Verified (Eligible for Test)</option>
                                <option value="slip_issued">Roll No Slip Issued</option>
                                <option value="challan_issued">Challan Issued</option>
                                <option value="selected">Selected for Admission</option>
                                <option value="confirmed">Confirmed & Admitted</option>
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

                    {/* Quick Filter Navigation Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800 text-xs">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mr-1">Quick Queues:</span>
                        
                        <button
                            type="button"
                            onClick={() => handleQuickFilter('all', 'all')}
                            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                                selectedStatus === 'all' && selectedFeeStatus === 'all'
                                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                        >
                            <span>All Applicants</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-black/20">{applications.total || appsList.length}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleQuickFilter('all', 'pending_verification')}
                            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                                selectedFeeStatus === 'pending_verification'
                                    ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-400/40 shadow-sm'
                                    : pendingFeeCount > 0
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 animate-pulse'
                                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                        >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>⚡ Fee Verification Due</span>
                            {pendingFeeCount > 0 && (
                                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-mono">
                                    {pendingFeeCount}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => handleQuickFilter('submitted', 'all')}
                            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                                selectedStatus === 'submitted' || selectedStatus === 'pending'
                                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                        >
                            <Clock className="h-3.5 w-3.5 text-amber-400" />
                            <span>Pending Scrutiny</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleQuickFilter('slip_issued', 'all')}
                            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                                selectedStatus === 'slip_issued'
                                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                        >
                            <FileText className="h-3.5 w-3.5 text-blue-400" />
                            <span>Slip Issued</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleQuickFilter('challan_issued', 'all')}
                            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                                selectedStatus === 'challan_issued'
                                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                        >
                            <CreditCard className="h-3.5 w-3.5 text-amber-400" />
                            <span>Challan Issued</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleQuickFilter('confirmed', 'all')}
                            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                                selectedStatus === 'confirmed' || selectedStatus === 'admitted'
                                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                        >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Confirmed & Admitted</span>
                        </button>
                    </div>
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
                                                    {app.entrance_roll_number && (
                                                        <div className="mt-1">
                                                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                                Roll #{app.entrance_roll_number}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {app.student_profile?.phone_number && (
                                                        <div className="flex items-center space-x-1.5 mt-1.5">
                                                            <span className="text-[11px] font-mono text-slate-300">📱 {app.student_profile.phone_number}</span>
                                                            <a
                                                                href={`tel:${app.student_profile.phone_number}`}
                                                                className="p-1 rounded-md bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 transition"
                                                                title={`Call ${student?.name} (${app.student_profile.phone_number})`}
                                                            >
                                                                <Phone className="h-3 w-3" />
                                                            </a>
                                                            <a
                                                                href={`https://wa.me/${(app.student_profile.phone_number || '').replace(/[^0-9]/g, '').replace(/^0/, '92')}?text=${encodeURIComponent(
                                                                    `Assalam-o-Alaikum ${student?.name || 'Candidate'},\nCongratulations! You have been selected for admission in ${app.course?.name} at GTTI Rahim Yar Khan.\nClasses will commence on ${app.course?.classes_start_date ? new Date(app.course.classes_start_date).toLocaleDateString() : 'the scheduled date'}.\nPlease collect your fee challan from college or download from your student portal.`
                                                                )}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1 rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40 transition"
                                                                title={`Send WhatsApp Admission Notice to ${student?.name}`}
                                                            >
                                                                <MessageCircle className="h-3 w-3" />
                                                            </a>
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4 font-mono">
                                                    <div className="text-amber-400 font-bold">{student?.cnic || 'N/A'}</div>
                                                    {app.matric_obtained_marks ? (
                                                        <div className="text-[10px] text-emerald-400 font-bold">
                                                            Matric: {app.matric_obtained_marks}/{app.matric_total_marks || 1100} ({((app.matric_obtained_marks / (app.matric_total_marks || 1100)) * 100).toFixed(1)}%)
                                                        </div>
                                                    ) : app.student_profile?.matric_obtained_marks ? (
                                                        <div className="text-[10px] text-emerald-400 font-bold">
                                                            Matric: {app.student_profile.matric_obtained_marks}/{app.student_profile.matric_total_marks || 1100} ({((app.student_profile.matric_obtained_marks / (app.student_profile.matric_total_marks || 1100)) * 100).toFixed(1)}%)
                                                        </div>
                                                    ) : (
                                                        <div className="text-[10px] text-slate-500">{student?.email}</div>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="font-semibold text-white">{app.course?.name}</div>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                            app.course?.requires_entrance_test 
                                                                ? 'bg-amber-950/60 text-amber-300 border border-amber-800' 
                                                                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                                                        }`}>
                                                            {app.course?.requires_entrance_test ? 'Track A: Test Required' : 'Track B: Direct FCFS'}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                                                            app.status === 'confirmed' || app.status === 'admitted'
                                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                                                : app.status === 'receipt_submitted'
                                                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                                                    : app.status === 'challan_issued'
                                                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                                                        : app.status === 'slip_issued'
                                                                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                                                            : isVerified
                                                                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                                                : isRejected
                                                                                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                                                                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                                        }`}>
                                                            {app.status === 'confirmed' || app.status === 'admitted' ? 'Confirmed & Admitted' : (app.status ? app.status.replace('_', ' ') : 'Pending')}
                                                        </span>
                                                        {app.challan_receipt_path && (
                                                            <div className="mt-1 space-y-0.5">
                                                                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                                                    app.status === 'confirmed' || app.status === 'admitted'
                                                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                                                        : 'bg-amber-400 text-slate-950 font-black shadow-xs animate-pulse'
                                                                }`}>
                                                                    <span>{app.status === 'confirmed' || app.status === 'admitted' ? '✓ Fee Paid & Confirmed' : '⚡ Paid Slip Awaiting Verification'}</span>
                                                                </span>
                                                                {app.challan_bank_reference && (
                                                                    <span className="text-[10px] font-mono text-amber-300 block truncate max-w-[150px]" title={app.challan_bank_reference}>
                                                                        Ref: {app.challan_bank_reference} ({app.challan_deposit_date ? new Date(app.challan_deposit_date).toLocaleDateString('en-GB') : 'Deposited'})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
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
                                                    {/* Direct View Uploaded Slip Button */}
                                                    {app.challan_receipt_path && (
                                                        <a
                                                            href={route('clerk.applications.receipt', app.id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 font-bold text-xs transition"
                                                            title="Inspect Uploaded Bank Deposit Receipt Slip"
                                                        >
                                                            <FileText className="h-3.5 w-3.5" />
                                                            <span>View Slip</span>
                                                        </a>
                                                    )}

                                                    {/* If paid receipt uploaded and not yet confirmed: Confirm Admission & Enroll Trainee */}
                                                    {app.challan_receipt_path && app.status !== 'confirmed' && app.status !== 'admitted' && (
                                                        <button
                                                            type="button"
                                                            disabled={confirmingId === app.id}
                                                            onClick={() => handleConfirmAdmission(app.id)}
                                                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-md disabled:opacity-40 cursor-pointer"
                                                            title="Verify Paid Bank Receipt, Generate Institutional Roll No, & Confirm Admission"
                                                        >
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            <span>{confirmingId === app.id ? 'Enrolling...' : 'Confirm Admission & Enroll Trainee'}</span>
                                                        </button>
                                                    )}

                                                    {/* Selective Issue Fee Challan with Deadline (Merit Courses) */}
                                                    {app.course?.requires_entrance_test && (app.status === 'verified' || app.status === 'slip_issued' || app.status === 'tested' || app.status === 'selected' || app.status === 'selected_for_admission') && !app.fee_challan && app.status !== 'challan_issued' && app.status !== 'receipt_submitted' && app.status !== 'admitted' && app.status !== 'confirmed' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenIssueChallanModal(app)}
                                                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-xs cursor-pointer"
                                                            title="Issue Fee Challan with 5-Day Payment Deadline to Selected Candidate"
                                                        >
                                                            <CreditCard className="h-3.5 w-3.5" />
                                                            <span>Issue Fee Challan</span>
                                                        </button>
                                                    )}

                                                    {/* Custom Fee Challan Upload / Download */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenChallanModal(app)}
                                                        className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition ${
                                                            app.clerk_challan_path 
                                                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30' 
                                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                                        }`}
                                                        title="Upload or Update Official Fee Challan for Student"
                                                    >
                                                        <UploadCloud className="h-3.5 w-3.5 text-amber-400" />
                                                        <span>{app.clerk_challan_path ? 'Challan ✓' : 'Challan'}</span>
                                                    </button>

                                                    {app.clerk_challan_path && (
                                                        <a
                                                            href={route('clerk.applications.custom-challan', app.id)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition inline-block"
                                                            title="Download/View Uploaded Custom Challan"
                                                        >
                                                            <Download className="h-3.5 w-3.5" />
                                                        </a>
                                                    )}

                                                    {/* View Dossier */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenDossier(app)}
                                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                                                        title="View Dossier & Uploaded Documents"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>

                                                    {/* Primary Verification Action: FCFS vs Merit */}
                                                    {(app.status === 'pending' || app.status === 'submitted' || (!isVerified && app.status !== 'confirmed' && app.status !== 'admitted' && app.status !== 'challan_issued')) && (
                                                        <button
                                                            type="button"
                                                            disabled={verifyingId === app.id}
                                                            onClick={() => handleVerify(app.id)}
                                                            className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl font-black text-xs transition shadow-md disabled:opacity-40 cursor-pointer ${
                                                                !app.course?.requires_entrance_test
                                                                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:from-amber-400'
                                                                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'
                                                            }`}
                                                            title={!app.course?.requires_entrance_test ? "Verify Credentials & Auto-Issue FCFS Fee Challan" : "Verify Dossier Credentials for Entrance Test"}
                                                        >
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            <span>
                                                                {verifyingId === app.id 
                                                                    ? 'Processing...' 
                                                                    : (!app.course?.requires_entrance_test ? 'Verify & Issue Challan' : 'Verify Document')}
                                                            </span>
                                                        </button>
                                                    )}

                                                    {/* Reject with Remarks */}
                                                    <button
                                                        type="button"
                                                        disabled={app.status === 'confirmed' || app.status === 'admitted'}
                                                        onClick={() => handleOpenReject(app)}
                                                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs transition disabled:opacity-40"
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
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase block">Father Name</span>
                                <span className="font-bold text-white">{activeApp.student_profile?.father_name || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase block">CNIC / Form B</span>
                                <span className="font-mono text-amber-400 font-bold">{activeApp.student_profile?.user?.cnic || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase block">Application #</span>
                                <span className="font-mono text-slate-300">{activeApp.application_number}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase block">Matriculation Marks</span>
                                <span className="font-bold text-emerald-400">
                                    {activeApp.matric_obtained_marks || activeApp.student_profile?.matric_obtained_marks 
                                        ? `${activeApp.matric_obtained_marks || activeApp.student_profile?.matric_obtained_marks} / ${activeApp.matric_total_marks || activeApp.student_profile?.matric_total_marks || 1100} (${(((activeApp.matric_obtained_marks || activeApp.student_profile?.matric_obtained_marks) / (activeApp.matric_total_marks || activeApp.student_profile?.matric_total_marks || 1100)) * 100).toFixed(1)}%)`
                                        : 'Not recorded'}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase block">Intermediate Marks</span>
                                <span className="font-bold text-amber-300">
                                    {activeApp.intermediate_obtained_marks || activeApp.student_profile?.intermediate_obtained_marks 
                                        ? `${activeApp.intermediate_obtained_marks || activeApp.student_profile?.intermediate_obtained_marks} / ${activeApp.intermediate_total_marks || activeApp.student_profile?.intermediate_total_marks || 1100}`
                                        : 'N/A'}
                                </span>
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

                        {/* Paid Fee Challan & Bank Slip Section */}
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                                    Fee Challan & Bank Deposit Verification
                                </span>
                                <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                                    activeApp.fee_status === 'paid' || activeApp.status === 'confirmed'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                        : activeApp.challan_receipt_path
                                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                            : 'bg-slate-800 text-slate-400'
                                }`}>
                                    {activeApp.status === 'confirmed' ? 'Admission Confirmed' : activeApp.fee_status || 'Pending Payment'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                                <div>
                                    <span className="text-[10px] text-slate-500 block">Challan #</span>
                                    <span className="font-mono text-white font-bold">{activeApp.fee_challan?.challan_number || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 block">Bank Reference / Scroll</span>
                                    <span className="font-mono text-amber-300 font-bold">{activeApp.challan_bank_reference || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 block">Deposit Date</span>
                                    <span className="text-white font-mono">{activeApp.challan_deposit_date ? new Date(activeApp.challan_deposit_date).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>

                            {activeApp.challan_receipt_path && (
                                <div className="pt-2 flex items-center justify-between border-t border-slate-900">
                                    <span className="text-xs text-slate-300 font-medium">Uploaded Bank Receipt Slip:</span>
                                    <a
                                        href={route('clerk.applications.receipt', activeApp.id)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 font-bold text-xs transition"
                                    >
                                        <FileText className="h-3.5 w-3.5" />
                                        <span>View Bank Receipt Slip</span>
                                        <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
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

                            {activeApp.challan_receipt_path && activeApp.status !== 'confirmed' && (
                                <button
                                    type="button"
                                    disabled={confirmingId === activeApp.id}
                                    onClick={() => {
                                        setDossierModal(false);
                                        handleConfirmAdmission(activeApp.id);
                                    }}
                                    className="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-lg"
                                >
                                    Verify Fee & Confirm Admission
                                </button>
                            )}

                            <button
                                type="button"
                                disabled={activeApp.status === 'verified' || activeApp.status === 'confirmed'}
                                onClick={() => {
                                    setDossierModal(false);
                                    handleVerify(activeApp.id);
                                }}
                                className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs transition disabled:opacity-40"
                            >
                                Verify Dossier
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Challan Upload Modal */}
            {challanModal && challanTargetApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 space-y-5 shadow-2xl text-slate-100">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div className="flex items-center space-x-2 text-amber-400">
                                <UploadCloud className="h-5 w-5" />
                                <h3 className="text-base font-black text-white">Upload Fee Challan</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setChallanModal(false);
                                    setChallanTargetApp(null);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                            <div>Candidate: <strong className="text-white">{challanTargetApp.student_profile?.user?.name}</strong></div>
                            <div>Trade: <strong className="text-white">{challanTargetApp.course?.name}</strong></div>
                            <div>App #{challanTargetApp.application_number}</div>
                        </div>

                        <form onSubmit={handleUploadChallanSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-300 mb-1.5">
                                    Official Fee Challan Voucher Document (PDF / Image) *
                                </label>
                                <input
                                    type="file"
                                    required
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => challanForm.setData('challan_file', e.target.files[0])}
                                    className="w-full text-xs text-slate-400 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                                />
                                <span className="text-[10px] text-slate-500 block mt-1">
                                    This document will appear on the candidate's student portal for download & payment.
                                </span>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setChallanModal(false);
                                        setChallanTargetApp(null);
                                    }}
                                    className="py-2.5 px-4 rounded-xl border border-slate-700 text-slate-400 font-bold hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={challanForm.processing}
                                    className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider transition disabled:opacity-50"
                                >
                                    {challanForm.processing ? 'Uploading Challan...' : 'Upload Fee Challan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Issue Fee Challan with Deadline Modal */}
            {issueChallanModal && issueChallanTargetApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 space-y-5 shadow-2xl text-slate-100">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div className="flex items-center space-x-2 text-amber-400">
                                <CreditCard className="h-5 w-5" />
                                <h3 className="text-base font-black text-white">Issue Fee Challan</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setIssueChallanModal(false);
                                    setIssueChallanTargetApp(null);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                            <div>Candidate: <strong className="text-white">{issueChallanTargetApp.student_profile?.user?.name || issueChallanTargetApp.student_profile?.user_id}</strong></div>
                            <div>Trade: <strong className="text-white">{issueChallanTargetApp.course?.name}</strong></div>
                            <div>App #{issueChallanTargetApp.application_number}</div>
                            {issueChallanTargetApp.entrance_test_attempt?.merit_rank && (
                                <div className="text-emerald-400 font-bold">Merit Rank: #{issueChallanTargetApp.entrance_test_attempt.merit_rank}</div>
                            )}
                        </div>

                        <form onSubmit={handleIssueChallanSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-300 mb-1.5">
                                    Challan Payment Deadline *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={issueChallanForm.data.payment_deadline}
                                    onChange={(e) => issueChallanForm.setData('payment_deadline', e.target.value)}
                                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                                />
                                <span className="text-[10px] text-slate-500 block mt-1">
                                    Defaults to 5 days. Candidate will see this deadline on their student portal with a countdown urgency alert.
                                </span>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIssueChallanModal(false);
                                        setIssueChallanTargetApp(null);
                                    }}
                                    className="py-2.5 px-4 rounded-xl border border-slate-700 text-slate-400 font-bold hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={issueChallanForm.processing}
                                    className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider transition disabled:opacity-50"
                                >
                                    {issueChallanForm.processing ? 'Issuing...' : 'Generate & Issue Challan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </ClerkLayout>
    );
}
