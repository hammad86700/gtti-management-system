import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    Clock,
    PlusCircle,
    User,
    Search,
    Filter,
    FileText,
    Check,
    Inbox,
    Scale,
    AlertCircle,
    GraduationCap,
    Send,
    Ban,
    RotateCcw,
    X,
    Info,
    Calendar,
    ChevronRight,
    Sparkles
} from 'lucide-react';

export default function Index({
    records = [],
    students = [],
    statusRequests = [],
    sanctionedStudents = []
}) {
    const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'direct' | 'incidents'

    // Faculty requests filters
    const [requestFilter, setRequestFilter] = useState('pending'); // 'all' | 'pending' | 'approved' | 'rejected'
    const [requestSearch, setRequestSearch] = useState('');

    // Sanctioned roster filters
    const [rosterSearch, setRosterSearch] = useState('');

    // Incident records state & filters
    const [incidentStatusFilter, setIncidentStatusFilter] = useState('all');
    const [incidentSearch, setIncidentSearch] = useState('');
    const [actionInputs, setActionInputs] = useState({});
    const [resolvingId, setResolvingId] = useState(null);

    // Approval Modal State
    const [approvingReq, setApprovingReq] = useState(null);
    const [approveForm, setApproveForm] = useState({
        action_type: 'struck_off',
        struck_off_days: 7,
        admin_remarks: '',
        order_reference: '',
    });
    const [isSubmittingApprove, setIsSubmittingApprove] = useState(false);

    // Rejection Modal State
    const [rejectingReq, setRejectingReq] = useState(null);
    const [rejectRemarks, setRejectRemarks] = useState('');
    const [isSubmittingReject, setIsSubmittingReject] = useState(false);

    // Direct Sanction Form
    const {
        data: directForm,
        setData: setDirectForm,
        post: postDirectSanction,
        processing: submittingDirect,
        errors: directErrors,
        reset: resetDirectForm,
        recentlySuccessful: directSanctioned,
    } = useForm({
        student_profile_id: students[0]?.id || '',
        sanction_type: 'struck_off',
        struck_off_days: 7,
        reason: '',
        order_reference: 'GTTI/ORD/' + new Date().getFullYear() + '/' + Math.floor(100 + Math.random() * 900),
        admin_remarks: '',
    });

    // New Incident Form (Existing Phase 12)
    const {
        data: incidentForm,
        setData: setIncidentForm,
        post: postIncident,
        processing: submittingIncident,
        errors: incidentErrors,
        reset: resetIncidentForm,
        recentlySuccessful: incidentLogged,
    } = useForm({
        student_profile_id: students[0]?.id || '',
        title: '',
        description: '',
        severity: 'minor',
    });

    // Handle Open Approve Modal
    const handleOpenApproveModal = (req) => {
        const defaultOrder = 'GTTI/ORD/' + new Date().getFullYear() + '/' + Math.floor(100 + Math.random() * 900);
        setApprovingReq(req);
        setApproveForm({
            action_type: req.request_type || 'struck_off',
            struck_off_days: req.struck_off_days || 7,
            admin_remarks: 'Disciplinary action approved and enforced by Principal Office.',
            order_reference: defaultOrder,
        });
    };

    const handleConfirmApprove = (e) => {
        e.preventDefault();
        if (!approvingReq) return;

        setIsSubmittingApprove(true);
        router.post(
            route('admin.discipline.requests.approve', { id: approvingReq.id }),
            approveForm,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setApprovingReq(null);
                    setIsSubmittingApprove(false);
                },
                onError: () => setIsSubmittingApprove(false),
            }
        );
    };

    // Handle Open Reject Modal
    const handleOpenRejectModal = (req) => {
        setRejectingReq(req);
        setRejectRemarks('Request dismissed after initial review. Trainee tendered written apology / placed on probation.');
    };

    const handleConfirmReject = (e) => {
        e.preventDefault();
        if (!rejectingReq || !rejectRemarks.trim()) return;

        setIsSubmittingReject(true);
        router.post(
            route('admin.discipline.requests.reject', { id: rejectingReq.id }),
            { admin_remarks: rejectRemarks },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRejectingReq(null);
                    setIsSubmittingReject(false);
                },
                onError: () => setIsSubmittingReject(false),
            }
        );
    };

    // Handle Direct Sanction
    const handleDirectSanction = (e) => {
        e.preventDefault();
        postDirectSanction(route('admin.discipline.direct-sanction'), {
            onSuccess: () => {
                resetDirectForm('reason', 'admin_remarks');
                setDirectForm('order_reference', 'GTTI/ORD/' + new Date().getFullYear() + '/' + Math.floor(100 + Math.random() * 900));
            },
        });
    };

    // Handle Reinstate
    const handleReinstate = (studentProfileId, name) => {
        if (!confirm(`Are you sure you want to reinstate ${name} to active college standing? This will re-open their student dashboard immediately.`)) {
            return;
        }

        router.post(
            route('admin.discipline.reinstate', { id: studentProfileId }),
            {},
            { preserveScroll: true }
        );
    };

    // Handle Incident Create
    const handleCreateIncident = (e) => {
        e.preventDefault();
        postIncident(route('admin.discipline.store'), {
            onSuccess: () => resetIncidentForm('title', 'description', 'severity'),
        });
    };

    // Handle Incident Resolve
    const handleActionChange = (id, value) => {
        setActionInputs((prev) => ({ ...prev, [id]: value }));
    };

    const handleResolve = (id) => {
        const actionTaken = actionInputs[id]?.trim();
        if (!actionTaken) {
            alert('Please specify the action taken before marking this incident as resolved.');
            return;
        }

        setResolvingId(id);
        router.patch(
            route('admin.discipline.resolve', { id }),
            { action_taken: actionTaken },
            {
                preserveScroll: true,
                onFinish: () => setResolvingId(null),
            }
        );
    };

    // Filter status requests
    const filteredRequests = statusRequests.filter((r) => {
        const studentName = r.student_profile?.user?.name || '';
        const teacherName = r.requester?.name || '';
        const reason = r.reason || '';

        const matchesSearch =
            studentName.toLowerCase().includes(requestSearch.toLowerCase()) ||
            teacherName.toLowerCase().includes(requestSearch.toLowerCase()) ||
            reason.toLowerCase().includes(requestSearch.toLowerCase());

        if (!matchesSearch) return false;
        if (requestFilter === 'pending') return r.status === 'pending';
        if (requestFilter === 'approved') return r.status === 'approved';
        if (requestFilter === 'rejected') return r.status === 'rejected';

        return true;
    });

    // Filter sanctioned roster
    const filteredRoster = sanctionedStudents.filter((s) => {
        const name = s.name || '';
        const reg = s.registration_number || '';
        const reason = s.termination_reason || '';
        return (
            name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
            reg.toLowerCase().includes(rosterSearch.toLowerCase()) ||
            reason.toLowerCase().includes(rosterSearch.toLowerCase())
        );
    });

    // Filter incident records
    const filteredRecords = records.filter((r) => {
        const studentName = r.student_profile?.user?.name || '';
        const reporterName = r.reporter?.name || '';
        const title = r.title || '';

        const matchesSearch =
            studentName.toLowerCase().includes(incidentSearch.toLowerCase()) ||
            reporterName.toLowerCase().includes(incidentSearch.toLowerCase()) ||
            title.toLowerCase().includes(incidentSearch.toLowerCase());

        if (!matchesSearch) return false;
        if (incidentStatusFilter === 'open') return r.status === 'open';
        if (incidentStatusFilter === 'resolved') return r.status === 'resolved';
        if (incidentStatusFilter === 'critical') return r.severity === 'critical';

        return true;
    });

    const pendingRequestsCount = statusRequests.filter((r) => r.status === 'pending').length;
    const activeSanctionsCount = sanctionedStudents.length;
    const openIncidentsCount = records.filter((r) => r.status === 'open').length;

    const getSeverityBadge = (severity) => {
        switch (severity) {
            case 'minor':
                return (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertCircle className="h-2.5 w-2.5" />
                        <span>Minor</span>
                    </span>
                );
            case 'major':
                return (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/15 text-orange-700 border border-orange-500/30">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        <span>Major</span>
                    </span>
                );
            case 'critical':
                return (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-700 border border-rose-200">
                        <ShieldAlert className="h-2.5 w-2.5" />
                        <span>Critical</span>
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                        {severity}
                    </span>
                );
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-500/20 shadow-sm">
                            <Scale className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 leading-tight">
                                Student Discipline & Sanctions Command Center
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Review faculty termination requests, enforce struck-off/expulsion orders, and manage incident logs
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {pendingRequestsCount > 0 && (
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-700 border border-rose-500/20">
                                <Clock className="h-3.5 w-3.5 animate-spin" />
                                <span>{pendingRequestsCount} Pending Termination Requests</span>
                            </span>
                        )}
                        {activeSanctionsCount > 0 && (
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                                <Ban className="h-3.5 w-3.5" />
                                <span>{activeSanctionsCount} Active Sanctions</span>
                            </span>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Discipline & Sanctions - GIIMS Admin" />

            <div className="space-y-6">
                {/* TOP METRICS ROW */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Faculty Requests</span>
                            <FileText className="h-4 w-4 text-indigo-500" />
                        </div>
                        <p className="text-2xl font-black text-gray-900 mt-2">{statusRequests.length}</p>
                        <p className="text-[11px] text-amber-600 font-semibold mt-1">{pendingRequestsCount} awaiting decision</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Currently Sanctioned</span>
                            <Ban className="h-4 w-4 text-rose-600" />
                        </div>
                        <p className="text-2xl font-black text-rose-600 mt-2">{activeSanctionsCount}</p>
                        <p className="text-[11px] text-gray-400 mt-1">Struck-off or Terminated</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Open Incidents</span>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </div>
                        <p className="text-2xl font-black text-amber-600 mt-2">{openIncidentsCount}</p>
                        <p className="text-[11px] text-gray-400 mt-1">Behavioral logs</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Resolved Cases</span>
                            <CheckCircle2 className="h-4 w-4 text-govt-green-600" />
                        </div>
                        <p className="text-2xl font-black text-govt-green-600 mt-2">
                            {records.filter((r) => r.status === 'resolved').length}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">Formal actions taken</p>
                    </div>
                </div>

                {/* PRIMARY MODULE NAVIGATION TABS */}
                <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('requests')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'requests'
                                ? 'bg-govt-green-600 text-white shadow-sm ring-2 ring-govt-green-600/20'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                        <Scale className="h-4 w-4" />
                        <span>Faculty Termination Requests</span>
                        {pendingRequestsCount > 0 && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                activeTab === 'requests' ? 'bg-white text-rose-600' : 'bg-rose-500 text-white'
                            }`}>
                                {pendingRequestsCount}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('direct')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'direct'
                                ? 'bg-govt-green-600 text-white shadow-sm ring-2 ring-govt-green-600/20'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                        <Ban className="h-4 w-4" />
                        <span>Direct Sanctions & Roster</span>
                        {activeSanctionsCount > 0 && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                activeTab === 'direct' ? 'bg-white text-amber-700' : 'bg-amber-500 text-white'
                            }`}>
                                {activeSanctionsCount}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('incidents')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeTab === 'incidents'
                                ? 'bg-govt-green-600 text-white shadow-sm ring-2 ring-govt-green-600/20'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                        <FileText className="h-4 w-4" />
                        <span>Incident Log Reports</span>
                    </button>
                </div>

                {/* ========================================================================= */}
                {/* TAB 1: FACULTY TERMINATION REQUESTS WORKBENCH                              */}
                {/* ========================================================================= */}
                {activeTab === 'requests' && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">
                                    Requests from Instructors & Incharges
                                </h3>
                                <p className="text-[11px] text-gray-500">
                                    Review proposed struck-off (suspension) and termination requests, and issue executive orders
                                </p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <div className="relative">
                                    <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={requestSearch}
                                        onChange={(e) => setRequestSearch(e.target.value)}
                                        placeholder="Search trainee, teacher, or charge..."
                                        className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-govt-green-500/20 text-gray-900 w-56"
                                    />
                                </div>

                                <div className="flex items-center rounded-xl bg-gray-100 p-1 border border-gray-200 text-xs">
                                    {['pending', 'approved', 'rejected', 'all'].map((tab) => (
                                        <button
                                            key={tab}
                                            type="button"
                                            onClick={() => setRequestFilter(tab)}
                                            className={`px-3 py-1 rounded-lg font-bold text-[11px] capitalize transition-all ${
                                                requestFilter === tab
                                                    ? 'bg-white text-gray-900 shadow-xs'
                                                    : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {filteredRequests.length === 0 ? (
                            <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 shadow-sm space-y-2">
                                <Inbox className="h-9 w-9 mx-auto text-gray-300" />
                                <p className="text-xs font-bold text-gray-700">No requests found</p>
                                <p className="text-[11px] text-gray-400">
                                    There are currently no faculty disciplinary requests matching your filter criteria.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredRequests.map((req) => {
                                    const isStruckOff = req.request_type === 'struck_off';
                                    const studentUser = req.student_profile?.user;
                                    const roll = req.student_profile?.registration_number || 'N/A';
                                    const isPending = req.status === 'pending';

                                    return (
                                        <div
                                            key={req.id}
                                            className={`p-5 rounded-2xl border bg-white shadow-sm transition-all space-y-4 ${
                                                isPending
                                                    ? 'border-amber-200 ring-1 ring-amber-400/20'
                                                    : 'border-gray-200'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start space-x-3">
                                                    <div
                                                        className={`p-2.5 rounded-xl ${
                                                            isStruckOff
                                                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                        }`}
                                                    >
                                                        {isStruckOff ? (
                                                            <Clock className="h-5 w-5" />
                                                        ) : (
                                                            <Ban className="h-5 w-5" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="font-bold text-sm text-gray-900">
                                                                {studentUser?.name || 'Trainee'}
                                                            </h4>
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                                                                Roll: {roll}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 mt-0.5">
                                                            {req.batch?.course?.name || 'Course'} • {req.batch?.name || 'Batch'}
                                                        </p>
                                                        <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                                                            Submitted by: {req.requester?.name || 'Instructor'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Status Badge */}
                                                <div>
                                                    {req.status === 'pending' && (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                                                            <Clock className="h-3 w-3" />
                                                            <span>Awaiting Decision</span>
                                                        </span>
                                                    )}
                                                    {req.status === 'approved' && (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-govt-green-50 text-govt-green-700 border border-govt-green-200">
                                                            <CheckCircle2 className="h-3 w-3 text-govt-green-600" />
                                                            <span>Sanction Approved</span>
                                                        </span>
                                                    )}
                                                    {req.status === 'rejected' && (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                                            <Info className="h-3 w-3" />
                                                            <span>Request Rejected</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Charge & Recommendation Info */}
                                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs space-y-1.5">
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span className="font-bold text-gray-700">
                                                        Faculty Recommendation:{' '}
                                                        <span className={isStruckOff ? 'text-amber-700 font-extrabold' : 'text-rose-700 font-extrabold'}>
                                                            {isStruckOff ? `Struck-off (${req.struck_off_days || 7} Days)` : 'Permanent Termination'}
                                                        </span>
                                                    </span>
                                                    <span className="text-gray-400 text-[10px]">
                                                        {new Date(req.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p className="font-semibold text-gray-900">
                                                    Violation: {req.reason}
                                                </p>
                                                {req.evidence_notes && (
                                                    <p className="text-[11px] text-gray-600 italic">
                                                        "{req.evidence_notes}"
                                                    </p>
                                                )}
                                            </div>

                                            {/* Decision Notes (if reviewed) */}
                                            {req.status !== 'pending' && (
                                                <div
                                                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                                                        req.status === 'approved'
                                                            ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                                                            : 'bg-gray-50 border-gray-200 text-gray-700'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between font-bold text-[11px]">
                                                        <span>Principal Office Ruling:</span>
                                                        {req.order_reference && (
                                                            <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                                                Order: {req.order_reference}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px]">{req.admin_remarks}</p>
                                                </div>
                                            )}

                                            {/* Actions for Pending Requests */}
                                            {isPending && (
                                                <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenApproveModal(req)}
                                                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-1.5"
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                        <span>Approve Sanction</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenRejectModal(req)}
                                                        className="flex-1 py-2 px-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                        <span>Reject / Dismiss</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 2: DIRECT SANCTIONS FORM & SANCTIONED STUDENTS ROSTER                 */}
                {/* ========================================================================= */}
                {activeTab === 'direct' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* DIRECT SANCTION FORM (5 COLS) */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm space-y-5">
                                <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                                    <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                                        <Ban className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">
                                            Direct Student Sanction
                                        </h3>
                                        <p className="text-[11px] text-gray-500">
                                            Admin direct struck-off or expulsion order
                                        </p>
                                    </div>
                                </div>

                                {directSanctioned && (
                                    <div className="p-3.5 rounded-xl bg-govt-green-50 border border-govt-green-200 text-govt-green-800 text-xs font-semibold flex items-center space-x-2">
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-govt-green-600" />
                                        <span>Direct disciplinary order executed successfully!</span>
                                    </div>
                                )}

                                <form onSubmit={handleDirectSanction} className="space-y-4 text-xs">
                                    {/* Student Selection */}
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">
                                            Select Trainee <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={directForm.student_profile_id}
                                            onChange={(e) => setDirectForm('student_profile_id', e.target.value)}
                                            className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-gray-900"
                                        >
                                            {students.map((st) => (
                                                <option key={st.id} value={st.id}>
                                                    {st.name} (S/O {st.father_name}) — {st.course?.name || 'General'}
                                                </option>
                                            ))}
                                        </select>
                                        {directErrors.student_profile_id && (
                                            <p className="text-[11px] text-rose-500 mt-1">{directErrors.student_profile_id}</p>
                                        )}
                                    </div>

                                    {/* Sanction Type */}
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1.5">
                                            Executive Sanction Type <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <button
                                                type="button"
                                                onClick={() => setDirectForm('sanction_type', 'struck_off')}
                                                className={`p-3 rounded-xl border text-left transition-all ${
                                                    directForm.sanction_type === 'struck_off'
                                                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20 shadow-sm'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-xs">Struck-off</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">Temporary</span>
                                                </div>
                                                <p className="text-[10px] text-gray-500">Close dashboard for specific days</p>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setDirectForm('sanction_type', 'terminate')}
                                                className={`p-3 rounded-xl border text-left transition-all ${
                                                    directForm.sanction_type === 'terminate'
                                                        ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20 shadow-sm'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-xs">Terminate</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">Permanent</span>
                                                </div>
                                                <p className="text-[10px] text-gray-500">Expel permanently from college</p>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Days if struck_off */}
                                    {directForm.sanction_type === 'struck_off' && (
                                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                                            <label className="block font-bold text-amber-900">
                                                Suspension Days <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="flex items-center space-x-2">
                                                {[3, 7, 14, 30].map((d) => (
                                                    <button
                                                        key={d}
                                                        type="button"
                                                        onClick={() => setDirectForm('struck_off_days', d)}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                                                            Number(directForm.struck_off_days) === d
                                                                ? 'bg-amber-600 text-white border-amber-600'
                                                                : 'bg-white text-gray-700 border-gray-200'
                                                        }`}
                                                    >
                                                        {d}d
                                                    </button>
                                                ))}
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="365"
                                                    value={directForm.struck_off_days}
                                                    onChange={(e) => setDirectForm('struck_off_days', e.target.value)}
                                                    className="w-20 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:outline-none"
                                                    placeholder="Days"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Reason / Title */}
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">
                                            Grounds for Sanction <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={directForm.reason}
                                            onChange={(e) => setDirectForm('reason', e.target.value)}
                                            placeholder="e.g. Severe Disciplinary Breach in Electrical Lab"
                                            className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-gray-900"
                                        />
                                        {directErrors.reason && (
                                            <p className="text-[11px] text-rose-500 mt-1">{directErrors.reason}</p>
                                        )}
                                    </div>

                                    {/* Order Reference */}
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">
                                            Official Order Reference No.
                                        </label>
                                        <input
                                            type="text"
                                            value={directForm.order_reference}
                                            onChange={(e) => setDirectForm('order_reference', e.target.value)}
                                            className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-mono text-xs focus:outline-none text-gray-900"
                                        />
                                    </div>

                                    {/* Remarks */}
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">
                                            Executive Order Directives / Remarks
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={directForm.admin_remarks}
                                            onChange={(e) => setDirectForm('admin_remarks', e.target.value)}
                                            placeholder="Directives issued by Principal Office..."
                                            className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none text-gray-900"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submittingDirect || students.length === 0}
                                        className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                                    >
                                        <Ban className="h-4 w-4" />
                                        <span>{submittingDirect ? 'Enforcing...' : 'Execute Direct Sanction'}</span>
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* SANCTIONED STUDENTS ROSTER (7 COLS) */}
                        <div className="lg:col-span-7 space-y-4">
                            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">
                                            Active Sanctions Roster
                                        </h3>
                                        <p className="text-[11px] text-gray-500">
                                            Students currently Struck-Off (suspended) or Permanently Terminated
                                        </p>
                                    </div>

                                    <div className="relative">
                                        <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={rosterSearch}
                                            onChange={(e) => setRosterSearch(e.target.value)}
                                            placeholder="Search student, roll, or reason..."
                                            className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-gray-900 w-52"
                                        />
                                    </div>
                                </div>

                                {filteredRoster.length === 0 ? (
                                    <div className="p-10 text-center text-gray-500 space-y-2">
                                        <CheckCircle2 className="h-8 w-8 mx-auto text-govt-green-500" />
                                        <p className="text-xs font-bold text-gray-700">No active sanctions</p>
                                        <p className="text-[11px] text-gray-400">
                                            All students are currently in active standing.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredRoster.map((st) => {
                                            const isStruckOff = st.status === 'struck_off';

                                            return (
                                                <div
                                                    key={st.id}
                                                    className="p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-all space-y-3"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex items-start space-x-3">
                                                            <div
                                                                className={`p-2 rounded-xl mt-0.5 ${
                                                                    isStruckOff
                                                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                                }`}
                                                            >
                                                                {isStruckOff ? (
                                                                    <Clock className="h-4 w-4" />
                                                                ) : (
                                                                    <Ban className="h-4 w-4" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center space-x-2">
                                                                    <h4 className="font-bold text-sm text-gray-900">
                                                                        {st.name}
                                                                    </h4>
                                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                                                                        Roll: {st.registration_number || 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[11px] text-gray-500 mt-0.5">
                                                                    {st.course_name} • {st.batch_name}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Reinstate Action Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReinstate(st.id, st.name)}
                                                            className="px-3 py-1.5 rounded-xl bg-govt-green-50 text-govt-green-700 border border-govt-green-200 hover:bg-govt-green-100 font-bold text-xs transition-all flex items-center space-x-1.5 shadow-xs"
                                                            title="Pardon and restore full student dashboard access"
                                                        >
                                                            <RotateCcw className="h-3.5 w-3.5" />
                                                            <span>Reinstate</span>
                                                        </button>
                                                    </div>

                                                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs space-y-2">
                                                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                                                            <div className="flex items-center space-x-2">
                                                                <span
                                                                    className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                                                                        isStruckOff
                                                                            ? 'bg-amber-100 text-amber-900'
                                                                            : 'bg-rose-100 text-rose-900'
                                                                    }`}
                                                                >
                                                                    {isStruckOff ? 'Struck-off (Suspended)' : 'Terminated (Expelled)'}
                                                                </span>

                                                                {isStruckOff && (
                                                                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-500/10 text-amber-800 border border-amber-200">
                                                                        {st.has_expired ? 'Expired' : `${st.remaining_days} Days Remaining`}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {st.order_reference && (
                                                                <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                                                    Order: {st.order_reference}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="text-[11px] text-gray-800 font-medium">
                                                            Reason: {st.termination_reason || 'Disciplinary violation'}
                                                        </p>

                                                        {isStruckOff && st.struck_off_until && (
                                                            <p className="text-[10px] text-gray-500">
                                                                Suspension Window: {st.struck_off_at} until {st.struck_off_until}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 3: INCIDENT LOG REPORTS (PHASE 12)                                    */}
                {/* ========================================================================= */}
                {activeTab === 'incidents' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* LEFT SECTION (4 COLS): LOG NEW INCIDENT FORM */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
                                <div className="flex items-center space-x-2.5 pb-3 border-b border-gray-100">
                                    <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                                        <PlusCircle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">
                                            Log Disciplinary Infraction
                                        </h3>
                                        <p className="text-[11px] text-gray-500">
                                            Report behavioral or safety violation
                                        </p>
                                    </div>
                                </div>

                                {incidentLogged && (
                                    <div className="p-3 rounded-xl bg-govt-green-500/10 border border-govt-green-200 text-govt-green-700 text-xs font-semibold flex items-center space-x-2">
                                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                                        <span>Incident logged and queued for disciplinary review!</span>
                                    </div>
                                )}

                                <form onSubmit={handleCreateIncident} className="space-y-4 text-xs">
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">
                                            Select Trainee <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={incidentForm.student_profile_id}
                                            onChange={(e) => setIncidentForm('student_profile_id', e.target.value)}
                                            className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-gray-900"
                                        >
                                            {students.map((st) => (
                                                <option key={st.id} value={st.id}>
                                                    {st.name} — {st.course?.name || 'General'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">
                                            Incident Title / Summary <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={incidentForm.title}
                                            onChange={(e) => setIncidentForm('title', e.target.value)}
                                            placeholder="e.g., Unsafe lathe operation in workshop"
                                            className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">
                                            Severity Rating <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={incidentForm.severity}
                                            onChange={(e) => setIncidentForm('severity', e.target.value)}
                                            className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-gray-900"
                                        >
                                            <option value="minor">Minor Infraction (Uniform, Lateness)</option>
                                            <option value="major">Major Violation (Safety, Absenteeism)</option>
                                            <option value="critical">Critical (Machinery damage, Violence)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">
                                            Detailed Factual Description <span className="text-rose-500">*</span>
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={incidentForm.description}
                                            onChange={(e) => setIncidentForm('description', e.target.value)}
                                            placeholder="Enter complete factual report..."
                                            className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none text-gray-900"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submittingIncident}
                                        className="w-full py-2.5 px-4 bg-govt-green-600 hover:bg-govt-green-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2"
                                    >
                                        <PlusCircle className="h-4 w-4" />
                                        <span>{submittingIncident ? 'Logging...' : 'Log Incident Record'}</span>
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* RIGHT SECTION (8 COLS): INCIDENTS ROSTER */}
                        <div className="lg:col-span-8 space-y-4">
                            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-900">Logged Infractions Roster</h3>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={incidentSearch}
                                            onChange={(e) => setIncidentSearch(e.target.value)}
                                            placeholder="Search incidents..."
                                            className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                                        />
                                        <select
                                            value={incidentStatusFilter}
                                            onChange={(e) => setIncidentStatusFilter(e.target.value)}
                                            className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                                        >
                                            <option value="all">All</option>
                                            <option value="open">Open</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                </div>

                                {filteredRecords.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 text-xs">No incidents found.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredRecords.map((r) => (
                                            <div key={r.id} className="p-4 rounded-xl border border-gray-200 bg-white space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="font-bold text-sm text-gray-900">{r.title}</h4>
                                                            {getSeverityBadge(r.severity)}
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 mt-0.5">
                                                            Trainee: {r.student_profile?.user?.name || 'N/A'} • Reported by: {r.reporter?.name || 'Staff'}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        r.status === 'open' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {r.status}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                                    {r.description}
                                                </p>

                                                {r.status === 'resolved' ? (
                                                    <p className="text-[11px] text-govt-green-700 font-semibold bg-green-50 p-2 rounded-lg border border-green-100">
                                                        Action: {r.action_taken}
                                                    </p>
                                                ) : (
                                                    <div className="flex items-center space-x-2 pt-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Specify administrative action taken..."
                                                            value={actionInputs[r.id] || ''}
                                                            onChange={(e) => handleActionChange(r.id, e.target.value)}
                                                            className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleResolve(r.id)}
                                                            disabled={resolvingId === r.id}
                                                            className="px-3 py-1.5 rounded-xl bg-govt-green-600 text-white text-xs font-bold shadow-xs hover:bg-govt-green-700 transition-all"
                                                        >
                                                            {resolvingId === r.id ? 'Saving...' : 'Mark Resolved'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* APPROVAL MODAL                                                            */}
            {/* ========================================================================= */}
            {approvingReq && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                                    <Scale className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900">Approve Disciplinary Sanction</h3>
                                    <p className="text-xs text-gray-500">Official Principal Executive Order</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setApprovingReq(null)}
                                className="p-1 rounded-xl text-gray-400 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-1.5">
                            <p className="font-bold text-gray-900">
                                Trainee: {approvingReq.student_profile?.user?.name}
                            </p>
                            <p className="text-gray-600">
                                Charge: {approvingReq.reason}
                            </p>
                            <p className="text-[11px] text-gray-500">
                                Proposed by: {approvingReq.requester?.name}
                            </p>
                        </div>

                        <form onSubmit={handleConfirmApprove} className="space-y-4 text-xs">
                            {/* Action Type */}
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">
                                    Sanction Type
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setApproveForm((prev) => ({ ...prev, action_type: 'struck_off' }))}
                                        className={`p-2.5 rounded-xl border text-center font-bold ${
                                            approveForm.action_type === 'struck_off'
                                                ? 'bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-500'
                                                : 'bg-white border-gray-200 text-gray-600'
                                        }`}
                                    >
                                        Struck-Off (Temporary)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setApproveForm((prev) => ({ ...prev, action_type: 'terminate' }))}
                                        className={`p-2.5 rounded-xl border text-center font-bold ${
                                            approveForm.action_type === 'terminate'
                                                ? 'bg-rose-50 border-rose-500 text-rose-900 ring-1 ring-rose-500'
                                                : 'bg-white border-gray-200 text-gray-600'
                                        }`}
                                    >
                                        Terminate (Permanent)
                                    </button>
                                </div>
                            </div>

                            {/* Days if struck_off */}
                            {approveForm.action_type === 'struck_off' && (
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">
                                        Suspension Duration (Days)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={approveForm.struck_off_days}
                                        onChange={(e) => setApproveForm((prev) => ({ ...prev, struck_off_days: e.target.value }))}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900"
                                    />
                                    <p className="text-[10px] text-amber-700 mt-1">
                                        Student dashboard will be locked for {approveForm.struck_off_days} days.
                                    </p>
                                </div>
                            )}

                            {/* Order Ref */}
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">
                                    Principal Order Reference No.
                                </label>
                                <input
                                    type="text"
                                    value={approveForm.order_reference}
                                    onChange={(e) => setApproveForm((prev) => ({ ...prev, order_reference: e.target.value }))}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs text-gray-900"
                                />
                            </div>

                            {/* Admin Remarks */}
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">
                                    Principal Executive Order Directives <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    required
                                    value={approveForm.admin_remarks}
                                    onChange={(e) => setApproveForm((prev) => ({ ...prev, admin_remarks: e.target.value }))}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                                    placeholder="Enter official executive directives..."
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setApprovingReq(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingApprove}
                                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm transition-all"
                                >
                                    {isSubmittingApprove ? 'Enforcing...' : 'Confirm & Enforce'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* REJECTION MODAL                                                           */}
            {/* ========================================================================= */}
            {rejectingReq && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-2 rounded-xl bg-gray-100 text-gray-700">
                                    <X className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900">Reject Sanction Request</h3>
                                    <p className="text-xs text-gray-500">Student will remain active in college</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setRejectingReq(null)}
                                className="p-1 rounded-xl text-gray-400 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="text-xs text-gray-600">
                            Provide the administrative justification for dismissing this request against{' '}
                            <strong>{rejectingReq.student_profile?.user?.name}</strong>:
                        </p>

                        <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">
                                    Executive Dismissal Notes <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    required
                                    value={rejectRemarks}
                                    onChange={(e) => setRejectRemarks(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                                    placeholder="e.g., Pardon granted upon submission of apology letter; placed on final warning."
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectingReq(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingReject}
                                    className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-900 text-white font-bold shadow-sm transition-all"
                                >
                                    {isSubmittingReject ? 'Rejecting...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}