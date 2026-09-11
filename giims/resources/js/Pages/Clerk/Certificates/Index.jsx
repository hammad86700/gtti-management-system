import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import ClerkLayout from '@/Layouts/ClerkLayout';
import {
    Award,
    Clock,
    CheckCircle2,
    XCircle,
    Calendar,
    Plus,
    Search,
    User,
    BookOpen,
    Filter,
    FileText,
    AlertCircle,
    ArrowRight,
    Send,
    X,
    CalendarDays
} from 'lucide-react';

export default function Index({
    certificates = [],
    eligibleEnrollments = [],
    suggestedCertNumber = ''
}) {
    const [filterTab, setFilterTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [processingCert, setProcessingCert] = useState(null);

    // Form for manual certificate issuance
    const {
        data: issueData,
        setData: setIssueData,
        post: postIssue,
        processing: issueProcessing,
        errors: issueErrors,
        reset: resetIssue
    } = useForm({
        enrollment_id: '',
        certificate_number: suggestedCertNumber,
        issue_date: new Date().toISOString().split('T')[0],
        collection_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        grade: 'A',
        marks_obtained: '',
        total_marks: 100,
        student_notes: '',
    });

    // Form for processing student request
    const {
        data: processData,
        setData: setProcessData,
        post: postProcess,
        processing: processProcessing,
        errors: processErrors,
        reset: resetProcess
    } = useForm({
        certificate_number: suggestedCertNumber,
        issue_date: new Date().toISOString().split('T')[0],
        collection_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        grade: 'A',
        marks_obtained: '',
        total_marks: 100,
    });

    const handleIssueSubmit = (e) => {
        e.preventDefault();
        postIssue(route('clerk.certificates.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsIssueModalOpen(false);
                resetIssue();
            },
        });
    };

    const handleOpenProcess = (cert) => {
        setProcessingCert(cert);
        setProcessData({
            certificate_number: cert.certificate_number.startsWith('GTTI-REQ-') ? suggestedCertNumber : cert.certificate_number,
            issue_date: new Date().toISOString().split('T')[0],
            collection_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            grade: cert.grade || 'A',
            marks_obtained: cert.marks_obtained || '',
            total_marks: cert.total_marks || 100,
        });
    };

    const handleProcessSubmit = (e) => {
        e.preventDefault();
        if (!processingCert) return;

        postProcess(route('clerk.certificates.process', processingCert.id), {
            preserveScroll: true,
            onSuccess: () => {
                setProcessingCert(null);
                resetProcess();
            },
        });
    };

    // Filter certificates
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

    const pendingCount = certificates.filter((c) => c.status === 'pending_approval').length;
    const requestedCount = certificates.filter((c) => c.status === 'requested').length;
    const approvedCount = certificates.filter((c) => c.status === 'approved').length;

    return (
        <ClerkLayout>
            <Head title="Certificate Issuance & Scheduling Desk - Clerk Portal" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium mb-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Academic Examination Wing</span>
                            <span>•</span>
                            <span>Official Parchments & Collection Scheduling</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Certificate Issuance Desk
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Manually issue completion certificates, process student applications, set collection dates, and route for Principal confirmation
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsIssueModalOpen(true)}
                        className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-2 self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Issue Certificate Manually</span>
                    </button>
                </div>

                {/* KPI Summary Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Certificates</span>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{certificates.length}</p>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/40 rounded-2xl p-4 border border-amber-200 dark:border-amber-800 shadow-xs">
                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Pending Principal Approval
                        </span>
                        <p className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-1">{pendingCount}</p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/40 rounded-2xl p-4 border border-blue-200 dark:border-blue-800 shadow-xs">
                        <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Send className="w-3.5 h-3.5" />
                            Student Applications
                        </span>
                        <p className="text-2xl font-black text-blue-800 dark:text-blue-300 mt-1">{requestedCount}</p>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approved & Digital Released
                        </span>
                        <p className="text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-1">{approvedCount}</p>
                    </div>
                </div>

                {/* Filter Tabs & Search */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        {/* Status Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5 self-start">
                            {[
                                { id: 'all', label: 'All Records', count: certificates.length },
                                { id: 'pending', label: 'Pending Approval', count: pendingCount },
                                { id: 'requested', label: 'Student Requests', count: requestedCount },
                                { id: 'approved', label: 'Confirmed & Released', count: approvedCount },
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

                        {/* Search Input */}
                        <div className="relative w-full sm:w-72">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, roll, certificate #..."
                                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Certificates Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                    <th className="py-3.5 px-4">Certificate #</th>
                                    <th className="py-3.5 px-4">Candidate & Roll #</th>
                                    <th className="py-3.5 px-4">Course & Batch</th>
                                    <th className="py-3.5 px-4">Grade / Marks</th>
                                    <th className="py-3.5 px-4">Issue Date</th>
                                    <th className="py-3.5 px-4">Collection Date</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-800 dark:text-slate-200">
                                {filteredCerts.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-10 text-center text-slate-400">
                                            No certificate records found matching your filter criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCerts.map((cert) => (
                                        <tr key={cert.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition">
                                            <td className="py-3 px-4 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                                                {cert.certificate_number}
                                            </td>

                                            <td className="py-3 px-4">
                                                <span className="font-bold block text-slate-900 dark:text-white">
                                                    {cert.student_profile?.user?.name || 'Trainee'}
                                                </span>
                                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    CNIC: {cert.student_profile?.user?.cnic || 'N/A'}
                                                </span>
                                            </td>

                                            <td className="py-3 px-4">
                                                <span className="font-semibold block line-clamp-1">{cert.course?.name}</span>
                                                <span className="text-[11px] text-slate-500">
                                                    {cert.batch?.name || 'Session 2026'}
                                                </span>
                                            </td>

                                            <td className="py-3 px-4">
                                                <span className="px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px]">
                                                    Grade {cert.grade || 'A'}
                                                </span>
                                                {cert.marks_obtained && (
                                                    <span className="text-[10px] text-slate-500 block mt-0.5">
                                                        {cert.marks_obtained} / {cert.total_marks}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                                {cert.issue_date || 'Pending'}
                                            </td>

                                            <td className="py-3 px-4">
                                                {cert.collection_date ? (
                                                    <div className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                                                        <CalendarDays className="w-3.5 h-3.5" />
                                                        <span>{cert.collection_date}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-[11px]">Not assigned</span>
                                                )}
                                            </td>

                                            <td className="py-3 px-4">
                                                {cert.status === 'approved' && (
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 inline-flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Approved & Released
                                                    </span>
                                                )}
                                                {cert.status === 'pending_approval' && (
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 inline-flex items-center gap-1 border border-amber-300 dark:border-amber-800">
                                                        <Clock className="w-3 h-3" />
                                                        Awaiting Principal
                                                    </span>
                                                )}
                                                {cert.status === 'requested' && (
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 inline-flex items-center gap-1 border border-blue-300 dark:border-blue-800">
                                                        <Send className="w-3 h-3" />
                                                        Student Applied
                                                    </span>
                                                )}
                                                {cert.status === 'rejected' && (
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 inline-flex items-center gap-1 border border-rose-300 dark:border-rose-800">
                                                        <XCircle className="w-3 h-3" />
                                                        Rejected
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3 px-4 text-right">
                                                {cert.status === 'requested' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenProcess(cert)}
                                                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs shadow-xs transition"
                                                    >
                                                        Process & Assign Date
                                                    </button>
                                                )}
                                                {cert.status === 'pending_approval' && (
                                                    <span className="text-[11px] text-slate-400 font-medium">
                                                        In Principal Queue
                                                    </span>
                                                )}
                                                {cert.status === 'approved' && (
                                                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                                                        Digital Released
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* MODAL: MANUALLY ISSUE CERTIFICATE                                         */}
            {/* ========================================================================= */}
            {isIssueModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                            <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-emerald-600" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Issue Official Certificate Manually
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsIssueModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleIssueSubmit} className="p-6 space-y-4 text-xs">
                            {/* Enrollment Selection */}
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Select Enrolled Trainee <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={issueData.enrollment_id}
                                    onChange={(e) => setIssueData('enrollment_id', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                >
                                    <option value="">-- Choose Candidate --</option>
                                    {eligibleEnrollments.map((enr) => (
                                        <option key={enr.id} value={enr.id}>
                                            {enr.student_profile?.user?.name || 'Candidate'} ({enr.student_profile?.user?.cnic || enr.enrollment_number}) — {enr.course?.name} ({enr.batch?.name || 'Batch'})
                                        </option>
                                    ))}
                                </select>
                                {issueErrors.enrollment_id && (
                                    <p className="text-rose-500 text-[11px] mt-1">{issueErrors.enrollment_id}</p>
                                )}
                            </div>

                            {/* Certificate Number & Grade */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Certificate Number <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={issueData.certificate_number}
                                        onChange={(e) => setIssueData('certificate_number', e.target.value)}
                                        required
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                                    />
                                    {issueErrors.certificate_number && (
                                        <p className="text-rose-500 text-[11px] mt-1">{issueErrors.certificate_number}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Final Grade
                                    </label>
                                    <select
                                        value={issueData.grade}
                                        onChange={(e) => setIssueData('grade', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    >
                                        <option value="A+">A+ (Outstanding / Distinction)</option>
                                        <option value="A">A (Excellent)</option>
                                        <option value="B">B (Good)</option>
                                        <option value="C">C (Satisfactory)</option>
                                        <option value="Pass">Pass (Competent)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Issue Date & Collection Date */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Official Issue Date <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={issueData.issue_date}
                                        onChange={(e) => setIssueData('issue_date', e.target.value)}
                                        required
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                                        <span>Physical Collection Date <span className="text-rose-500">*</span></span>
                                        <span className="text-[10px] text-emerald-600 font-normal">Pick-up from College</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={issueData.collection_date}
                                        onChange={(e) => setIssueData('collection_date', e.target.value)}
                                        required
                                        className="w-full px-3 py-2 rounded-xl border border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-slate-900 dark:text-white font-bold"
                                    />
                                    {issueErrors.collection_date && (
                                        <p className="text-rose-500 text-[11px] mt-1">{issueErrors.collection_date}</p>
                                    )}
                                </div>
                            </div>

                            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                                <div>
                                    <strong>Institutional Workflow Notice:</strong> Upon submitting, this certificate will be placed into the <strong>Principal / Admin Approval Queue</strong>. After confirmation, it will immediately unlock digitally on the student's dashboard along with the specified physical collection date.
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsIssueModalOpen(false)}
                                    className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={issueProcessing}
                                    className="px-5 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow transition disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {issueProcessing ? 'Routing...' : 'Issue & Forward to Principal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL: PROCESS STUDENT APPLICATION                                         */}
            {/* ========================================================================= */}
            {processingCert && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Award className="w-4 h-4 text-emerald-600" />
                                Process Certificate Request for {processingCert.student_profile?.user?.name}
                            </h3>
                            <button
                                onClick={() => setProcessingCert(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleProcessSubmit} className="p-6 space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Official Certificate Number <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={processData.certificate_number}
                                    onChange={(e) => setProcessData('certificate_number', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Grade
                                    </label>
                                    <select
                                        value={processData.grade}
                                        onChange={(e) => setProcessData('grade', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    >
                                        <option value="A+">A+ (Distinction)</option>
                                        <option value="A">A (Excellent)</option>
                                        <option value="B">B (Good)</option>
                                        <option value="C">C (Satisfactory)</option>
                                        <option value="Pass">Pass</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Issue Date
                                    </label>
                                    <input
                                        type="date"
                                        value={processData.issue_date}
                                        onChange={(e) => setProcessData('issue_date', e.target.value)}
                                        required
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                                    <span>Physical Collection Date <span className="text-rose-500">*</span></span>
                                    <span className="text-[10px] text-emerald-600 font-bold">Pick-up Date for Student</span>
                                </label>
                                <input
                                    type="date"
                                    value={processData.collection_date}
                                    onChange={(e) => setProcessData('collection_date', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-xl border border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-slate-900 dark:text-white font-bold"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setProcessingCert(null)}
                                    className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processProcessing}
                                    className="px-5 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow transition disabled:opacity-50"
                                >
                                    {processProcessing ? 'Forwarding...' : 'Forward to Principal for Approval'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </ClerkLayout>
    );
}
