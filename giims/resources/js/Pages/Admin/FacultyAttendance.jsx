import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Users,
    CheckCircle2,
    Clock,
    Calendar,
    AlertCircle,
    Wifi,
    WifiOff,
    Camera,
    Eye,
    X,
    Check,
    Search,
    Filter,
    ArrowLeft,
    ArrowRight,
    Paperclip,
    FileText,
    ShieldCheck,
    Building2,
    ZoomIn
} from 'lucide-react';
import Badge from '@/Components/UI/Badge';

export default function FacultyAttendance({
    roster = [],
    selectedDate = '',
    isToday = true,
    counters = {
        total_faculty: 0,
        present_today: 0,
        present_on_time: 0,
        late_count: 0,
        on_leave: 0,
        unexcused_absent: 0,
        attendance_rate: 0,
    },
    pendingLeaves = [],
}) {
    const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'leaves'
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Present' | 'Late' | 'On Leave' | 'Unexcused Absent'
    const [inspectingItem, setInspectingItem] = useState(null);

    // Rejection Modal State
    const [rejectingLeave, setRejectingLeave] = useState(null);
    const { data: rejectData, setData: setRejectData, post: postReject, processing: rejectProcessing, errors: rejectErrors, reset: resetReject } = useForm({
        rejection_reason: '',
    });

    const handleDateChange = (newDate) => {
        router.get(route('admin.faculty-attendance.index'), { date: newDate }, { preserveState: true });
    };

    const handleQuickDate = (offsetDays) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + offsetDays);
        handleDateChange(d.toISOString().split('T')[0]);
    };

    const handleApproveLeave = (leaveId) => {
        if (confirm('Approve this faculty leave application?')) {
            router.post(route('admin.faculty-leaves.approve', leaveId), {}, { preserveScroll: true });
        }
    };

    const handleOpenRejectModal = (leave) => {
        setRejectingLeave(leave);
        resetReject();
    };

    const handleSubmitRejection = (e) => {
        e.preventDefault();
        if (!rejectingLeave) return;
        postReject(route('admin.faculty-leaves.reject', rejectingLeave.id), {
            preserveScroll: true,
            onSuccess: () => {
                setRejectingLeave(null);
                resetReject();
            },
        });
    };

    // Filtered roster
    const filteredRoster = roster.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.department.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' ||
            item.status === statusFilter ||
            (statusFilter === 'Present' && (item.status === 'Present' || item.status === 'Late'));

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Present':
                return <Badge variant="green" dot size="md">Present (On-Time)</Badge>;
            case 'Late':
                return <Badge variant="amber" dot size="md">Late Arrival</Badge>;
            case 'On Leave':
                return <Badge variant="blue" dot size="md">Authorized Leave</Badge>;
            default:
                return <Badge variant="rose" dot size="md">Unexcused Absent</Badge>;
        }
    };

    return (
        <AdminLayout>
            <Head title="Faculty Attendance Desk - Principal Command" />

            <div className="space-y-6">
                {/* Header & Date Controller */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium mb-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Executive Oversight Desk</span>
                            <span>•</span>
                            <span>Principal Office</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-slate-900 tracking-tight">
                            Faculty Attendance & Monitoring Desk
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Inspect daily classroom photographic proof, verify campus intranet subnets, and adjudicate faculty leave requests
                        </p>
                    </div>

                    {/* Date Navigation Strip */}
                    <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <button
                            type="button"
                            onClick={() => handleQuickDate(-1)}
                            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Previous Day"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2 px-2">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="border-0 bg-transparent text-xs sm:text-sm font-bold text-slate-800 dark:text-white focus:ring-0 cursor-pointer p-0"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => handleQuickDate(1)}
                            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Next Day"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        {!isToday && (
                            <button
                                type="button"
                                onClick={() => handleDateChange(new Date().toISOString().split('T')[0])}
                                className="px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl hover:bg-emerald-100 transition-colors"
                            >
                                Today
                            </button>
                        )}
                    </div>
                </div>

                {/* Top KPI Metrics Bento Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Faculty</span>
                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                                {counters.total_faculty}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">Instructors</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-950/50 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Present Today</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                                {counters.present_today}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                                ({counters.present_on_time} on-time, {counters.late_count} late)
                            </span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-blue-100 dark:border-blue-950/50 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Authorized Leaves</span>
                            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                                <Calendar className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-extrabold text-blue-700 dark:text-blue-400">
                                {counters.on_leave}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">Approved</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-100 dark:border-rose-950/50 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Unexcused Absents</span>
                            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-extrabold text-rose-700 dark:text-rose-400">
                                {counters.unexcused_absent}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                                ({counters.attendance_rate}% Rate)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sub-Navigation Tabs */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-800/40">
                        <button
                            type="button"
                            onClick={() => setActiveTab('roster')}
                            className={`py-4 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
                                activeTab === 'roster'
                                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            Daily Faculty Roster ({roster.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('leaves')}
                            className={`py-4 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
                                activeTab === 'leaves'
                                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            Pending Leave Requests
                            {pendingLeaves.length > 0 && (
                                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-xs">
                                    {pendingLeaves.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Tab 1: Daily Faculty Roster */}
                    {activeTab === 'roster' && (
                        <div className="p-6 space-y-4">
                            {/* Search & Status Filters */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="relative w-full sm:w-80">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search teacher, trade, email..."
                                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5">
                                    {['all', 'Present', 'Late', 'On Leave', 'Unexcused Absent'].map((st) => (
                                        <button
                                            key={st}
                                            type="button"
                                            onClick={() => setStatusFilter(st)}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                                                statusFilter === st
                                                    ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                            }`}
                                        >
                                            {st === 'all' ? 'All Faculty' : st}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Table */}
                            {filteredRoster.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                        No faculty members found matching your filter.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                                <th className="py-3.5 px-4">Faculty Member</th>
                                                <th className="py-3.5 px-4">Trade / Dept</th>
                                                <th className="py-3.5 px-4">Time In</th>
                                                <th className="py-3.5 px-4">Daily Status</th>
                                                <th className="py-3.5 px-4">Network Subnet</th>
                                                <th className="py-3.5 px-4">Classroom Proof</th>
                                                <th className="py-3.5 px-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {filteredRoster.map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                                                    <td className="py-3.5 px-4">
                                                        <div className="font-bold text-slate-900 dark:text-white">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400">
                                                            {item.email} {item.phone && `• ${item.phone}`}
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                            {item.department}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                        {item.check_in_time || '—'}
                                                    </td>
                                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                                        {getStatusBadge(item.status)}
                                                        {item.leave_info && (
                                                            <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
                                                                {item.leave_info.type}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                                        {item.is_ip_verified === true ? (
                                                            <Badge variant="green" size="sm">
                                                                <Wifi className="w-3 h-3 text-emerald-600" />
                                                                Campus Verified
                                                            </Badge>
                                                        ) : item.is_ip_verified === false ? (
                                                            <Badge variant="amber" size="sm">
                                                                <WifiOff className="w-3 h-3 text-amber-600" />
                                                                Remote ({item.ip_address})
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-slate-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                                        {item.proof_image_url ? (
                                                            <div
                                                                onClick={() => setInspectingItem(item)}
                                                                className="group relative w-12 h-12 rounded-xl overflow-hidden border-2 border-emerald-500/40 cursor-pointer shadow-xs hover:shadow-md transition-all shrink-0"
                                                                title="Click to zoom proof photo"
                                                            >
                                                                <img
                                                                    src={item.proof_image_url}
                                                                    alt="Proof"
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                                                                />
                                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <ZoomIn className="w-4 h-4 text-white" />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs italic">No photo</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                        {item.proof_image_url ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => setInspectingItem(item)}
                                                                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-xl transition-colors inline-flex items-center gap-1"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                                Inspect Proof
                                                            </button>
                                                        ) : item.leave_info ? (
                                                            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                                                                Leave Docket Active
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 text-[11px]">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 2: Pending Leave Requests */}
                    {activeTab === 'leaves' && (
                        <div className="p-6">
                            {pendingLeaves.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                                        All Caught Up!
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        There are no pending faculty leave requests awaiting Principal approval.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {pendingLeaves.map((leave) => (
                                        <div key={leave.id} className="py-5 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="space-y-2 max-w-2xl">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {leave.teacher_name}
                                                    </h3>
                                                    <span className="text-xs text-slate-400">({leave.teacher_email})</span>
                                                    <Badge variant="blue" size="xs">
                                                        {leave.leave_type_label}
                                                    </Badge>
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        • {leave.duration_days} Day(s) ({leave.start_date} to {leave.end_date})
                                                    </span>
                                                </div>

                                                <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                                                    "{leave.reason}"
                                                </p>

                                                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                                                    <span>Submitted on: {leave.created_at}</span>
                                                    {leave.attachment_url && (
                                                        <a
                                                            href={leave.attachment_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                                                        >
                                                            <Paperclip className="w-3.5 h-3.5" />
                                                            View Attached Medical/Official Certificate
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => handleApproveLeave(leave.id)}
                                                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                    Approve Leave
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenRejectModal(leave)}
                                                    className="px-4 py-2 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900 rounded-xl transition-all flex items-center gap-1.5"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                    Reject with Notes
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* High-Resolution Classroom Proof Inspection Modal */}
            {inspectingItem && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-emerald-600" />
                                    Classroom Proof Verification • {inspectingItem.name}
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    {inspectingItem.department} • Time: {inspectingItem.check_in_time} • Date: {selectedDate}
                                </p>
                            </div>
                            <button
                                onClick={() => setInspectingItem(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* High-Res Proof Photo */}
                        <div className="p-4 bg-slate-950 flex items-center justify-center">
                            <img
                                src={inspectingItem.proof_image_url}
                                alt="Classroom Proof"
                                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-xl"
                            />
                        </div>

                        {/* Audit Details Footer */}
                        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">Network Subnet:</span>
                                    {inspectingItem.is_ip_verified ? (
                                        <Badge variant="green">
                                            <Wifi className="w-3 h-3 text-emerald-600" />
                                            Campus Wi-Fi Verified ({inspectingItem.ip_address})
                                        </Badge>
                                    ) : (
                                        <Badge variant="amber">
                                            <WifiOff className="w-3 h-3 text-amber-600" />
                                            Remote / Off-Campus ({inspectingItem.ip_address})
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">Status:</span>
                                    {getStatusBadge(inspectingItem.status)}
                                </div>
                            </div>

                            {inspectingItem.remarks && (
                                <div className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                                    <span className="font-bold text-slate-800 dark:text-white">Teacher Remarks:</span> {inspectingItem.remarks}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Leave Rejection Modal with Mandatory Notes */}
            {rejectingLeave && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/30 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                                <AlertCircle className="w-5 h-5" />
                                <h3 className="text-sm font-bold">Reject Faculty Leave Application</h3>
                            </div>
                            <button
                                onClick={() => setRejectingLeave(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitRejection} className="p-6 space-y-4">
                            <div className="text-xs text-slate-600 dark:text-slate-300">
                                You are rejecting the leave application for <strong className="text-slate-900 dark:text-white">{rejectingLeave.teacher_name}</strong> ({rejectingLeave.leave_type_label}, {leaveDurationString(rejectingLeave)}).
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Executive Rejection Reason & Remarks <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows="3"
                                    required
                                    value={rejectData.rejection_reason}
                                    onChange={(e) => setRejectData('rejection_reason', e.target.value)}
                                    placeholder="State clear reasons for rejection (e.g., examination week, alternative coverage not arranged, etc.)..."
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-rose-500 focus:border-rose-500"
                                />
                                {rejectErrors.rejection_reason && (
                                    <p className="mt-1 text-xs text-rose-500 font-medium">{rejectErrors.rejection_reason}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setRejectingLeave(null)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={rejectProcessing || !rejectData.rejection_reason.trim()}
                                    className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {rejectProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

function leaveDurationString(leave) {
    if (!leave) return '';
    return `${leave.start_date} to ${leave.end_date}`;
}
