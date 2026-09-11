import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    MapPin,
    Wifi,
    WifiOff,
    FileText,
    Upload,
    ArrowLeft,
    Eye,
    X,
    ZoomIn,
    PlusCircle,
    Paperclip,
    ShieldCheck
} from 'lucide-react';
import Badge from '@/Components/UI/Badge';
import TeacherAttendanceWidget from '@/Components/Teacher/TeacherAttendanceWidget';
import TeacherLeaveModal from '@/Components/Teacher/TeacherLeaveModal';

export default function SelfAttendance({
    todayAttendance = null,
    monthAttendances = [],
    summary = {
        presents: 0,
        lates: 0,
        total_attended: 0,
        approved_leaves: 0,
        unexcused_absents: 0,
        working_days_passed: 0,
    },
    recentLeaves = [],
    clientIp = '',
    isCampusIp = false,
    currentTime = '',
    currentDate = '',
    lateCutoff = '08:30',
}) {
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'leaves'

    const formatTimeDisplay = (timeStr) => {
        if (!timeStr) return '--:--';
        try {
            const parts = timeStr.split(':');
            const h = parseInt(parts[0], 10);
            const m = parts[1];
            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayH = h % 12 || 12;
            return `${displayH}:${m} ${ampm}`;
        } catch (e) {
            return timeStr;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Faculty Self-Attendance & Leaves - GTTI RYK" />

            <div className="space-y-6">
                {/* Page Navigation & Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
                            <Link
                                href={route('teacher.dashboard')}
                                className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Instructor Dashboard
                            </Link>
                            <span>/</span>
                            <span>Self Attendance</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Faculty Attendance & Leave Desk
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Daily photographic classroom proof, automated network verification, and leave workflow
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsLeaveModalOpen(true)}
                            className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Apply for Leave
                        </button>
                    </div>
                </div>

                {/* KPI Metric Summary Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">On-Time Presents</span>
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                            {summary.presents}
                            <span className="text-xs font-medium text-slate-400 ml-1">Days</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Late Arrivals</span>
                            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                            {summary.lates}
                            <span className="text-xs font-medium text-slate-400 ml-1">Days</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Approved Leaves</span>
                            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                                <Calendar className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                            {summary.approved_leaves}
                            <span className="text-xs font-medium text-slate-400 ml-1">Days</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Unexcused Absents</span>
                            <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                            {summary.unexcused_absents}
                            <span className="text-xs font-medium text-slate-400 ml-1">Days</span>
                        </div>
                    </div>
                </div>

                {/* Daily Check-In Widget Component */}
                <TeacherAttendanceWidget
                    todayAttendance={todayAttendance}
                    summary={summary}
                    recentLeaves={recentLeaves}
                    clientIp={clientIp}
                    isCampusIp={isCampusIp}
                    lateCutoff={lateCutoff}
                />

                {/* Tabs for Monthly Log & Leaves */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-800/40">
                        <button
                            type="button"
                            onClick={() => setActiveTab('attendance')}
                            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
                                activeTab === 'attendance'
                                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            <Calendar className="w-4 h-4" />
                            Monthly Attendance Register ({monthAttendances.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('leaves')}
                            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
                                activeTab === 'leaves'
                                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            Leave Applications ({recentLeaves.length})
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === 'attendance' ? (
                            monthAttendances.length === 0 ? (
                                <div className="text-center py-12">
                                    <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                        No attendance entries recorded for this month yet.
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Use the check-in card above to submit your daily classroom proof.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                                <th className="py-3 px-3">Date</th>
                                                <th className="py-3 px-3">Time In</th>
                                                <th className="py-3 px-3">Status</th>
                                                <th className="py-3 px-3">Network Subnet</th>
                                                <th className="py-3 px-3">Classroom Proof</th>
                                                <th className="py-3 px-3">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {monthAttendances.map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                                        {item.attendance_date}
                                                    </td>
                                                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                        {formatTimeDisplay(item.check_in_time)}
                                                    </td>
                                                    <td className="py-3 px-3 whitespace-nowrap">
                                                        {item.status === 'late' ? (
                                                            <Badge variant="amber" dot>Late</Badge>
                                                        ) : (
                                                            <Badge variant="green" dot>Present</Badge>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-3 whitespace-nowrap">
                                                        {item.is_ip_verified ? (
                                                            <Badge variant="green">
                                                                <Wifi className="w-3 h-3" />
                                                                Campus IP
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="amber">
                                                                <WifiOff className="w-3 h-3" />
                                                                Remote ({item.ip_address})
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-3 whitespace-nowrap">
                                                        {item.proof_image_url || item.proof_image_path ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedPhoto(item)}
                                                                className="flex items-center gap-2 group"
                                                            >
                                                                <img
                                                                    src={item.proof_image_url || `/storage/${item.proof_image_path}`}
                                                                    alt="Proof"
                                                                    className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform"
                                                                />
                                                                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 group-hover:underline font-medium">
                                                                    Zoom
                                                                </span>
                                                            </button>
                                                        ) : (
                                                            <span className="text-slate-400 text-[11px]">N/A</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                                                        {item.remarks || '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        ) : (
                            recentLeaves.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                        No leave requests submitted yet.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setIsLeaveModalOpen(true)}
                                        className="mt-3 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors inline-flex items-center gap-1.5"
                                    >
                                        <PlusCircle className="w-3.5 h-3.5" />
                                        Submit Leave Request
                                    </button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                                <th className="py-3 px-3">Type</th>
                                                <th className="py-3 px-3">Duration</th>
                                                <th className="py-3 px-3">Reason</th>
                                                <th className="py-3 px-3">Document</th>
                                                <th className="py-3 px-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {recentLeaves.map((leave) => (
                                                <tr key={leave.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 capitalize whitespace-nowrap">
                                                        {leave.leave_type.replace('_', ' ')}
                                                    </td>
                                                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                        {leave.start_date} to {leave.end_date}
                                                    </td>
                                                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-sm">
                                                        {leave.reason}
                                                        {leave.rejection_reason && (
                                                            <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">
                                                                <strong>Rejection note:</strong> {leave.rejection_reason}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-3 whitespace-nowrap">
                                                        {leave.attachment_path ? (
                                                            <a
                                                                href={leave.attachment_url || `/storage/${leave.attachment_path}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-emerald-600 hover:underline flex items-center gap-1 font-medium"
                                                            >
                                                                <Paperclip className="w-3 h-3" />
                                                                View Doc
                                                            </a>
                                                        ) : (
                                                            <span className="text-slate-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-3 whitespace-nowrap">
                                                        {leave.status === 'approved' ? (
                                                            <Badge variant="green" dot>Approved</Badge>
                                                        ) : leave.status === 'rejected' ? (
                                                            <Badge variant="rose" dot>Rejected</Badge>
                                                        ) : (
                                                            <Badge variant="amber" dot>Under Review</Badge>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Photo Zoom Modal */}
            {selectedPhoto && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Classroom Proof Photo
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                    Date: {selectedPhoto.attendance_date} • Time: {formatTimeDisplay(selectedPhoto.check_in_time)} • IP: {selectedPhoto.ip_address}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedPhoto(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 bg-slate-950 flex items-center justify-center">
                            <img
                                src={selectedPhoto.proof_image_url || `/storage/${selectedPhoto.proof_image_path}`}
                                alt="Classroom Proof"
                                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-lg"
                            />
                        </div>
                        {selectedPhoto.remarks && (
                            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                <span className="font-bold text-slate-900 dark:text-white">Remarks:</span> {selectedPhoto.remarks}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Leave Application Modal */}
            <TeacherLeaveModal
                isOpen={isLeaveModalOpen}
                onClose={() => setIsLeaveModalOpen(false)}
                recentLeaves={recentLeaves}
            />
        </AuthenticatedLayout>
    );
}
