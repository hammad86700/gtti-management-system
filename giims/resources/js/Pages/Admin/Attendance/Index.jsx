import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    MapPin,
    Calendar,
    Users,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    Clock,
    Filter,
    Building2,
    ArrowRight,
    Navigation,
    Activity,
    CalendarDays,
    FileSpreadsheet,
    Printer,
    Check
} from 'lucide-react';

export default function Index({
    sessions = [],
    gateLogs = [],
    batches = [],
    selectedDate,
    selectedBatchId,
    viewMode = 'daily',
    monthlyData = null,
    stats = {}
}) {
    const [currentTab, setCurrentTab] = useState(viewMode || 'daily');
    const [date, setDate] = useState(selectedDate);
    const [batchId, setBatchId] = useState(selectedBatchId || (batches[0]?.id || ''));
    const [month, setMonth] = useState(monthlyData?.month || new Date().getMonth() + 1);
    const [year, setYear] = useState(monthlyData?.year || new Date().getFullYear());

    const handleDailyFilter = (e) => {
        e.preventDefault();
        router.get(
            route('admin.attendance.index'),
            {
                view: 'daily',
                date: date,
                batch_id: batchId || undefined,
            },
            { preserveState: true }
        );
    };

    const handleMonthlyFilter = (e) => {
        if (e) e.preventDefault();
        router.get(
            route('admin.attendance.index'),
            {
                view: 'monthly',
                batch_id: batchId,
                month: month,
                year: year,
            },
            { preserveState: true }
        );
    };

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-govt-green text-white">
                                TEVTA Academic Oversight
                            </span>
                            <span className="text-xs text-slate-500 font-mono">Executive Principal Desk</span>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 mt-1">
                            Institutional Attendance & Register Audit
                        </h2>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setCurrentTab('daily')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                currentTab === 'daily'
                                    ? 'bg-white text-slate-900 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Daily Overview
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrentTab('monthly')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                                currentTab === 'monthly'
                                    ? 'bg-white text-slate-900 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <FileSpreadsheet className="h-3.5 w-3.5 text-govt-green" />
                            <span>Monthly Batch Register</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Attendance Monitoring & Registers - GIIMS Admin" />

            <div className="space-y-6">
                {/* ══════════════════════════════════════════════════
                    TAB 1: DAILY OVERVIEW
                ══════════════════════════════════════════════════ */}
                {currentTab === 'daily' && (
                    <div className="space-y-6">
                        {/* Filter Bar */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <form onSubmit={handleDailyFilter} className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="font-bold text-slate-700 flex items-center space-x-1">
                                    <Calendar className="h-3.5 w-3.5 text-govt-green" />
                                    <span>Date:</span>
                                </span>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="text-xs rounded-xl border-slate-200 text-slate-800 focus:ring-2 focus:ring-govt-green/30"
                                />
                                <select
                                    value={batchId}
                                    onChange={(e) => setBatchId(e.target.value)}
                                    className="text-xs rounded-xl border-slate-200 text-slate-800 focus:ring-2 focus:ring-govt-green/30"
                                >
                                    <option value="">All Batches</option>
                                    {batches.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name} ({b.course?.name})
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                                >
                                    Filter
                                </button>
                            </form>
                        </div>

                        {/* KPI STATS */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
                            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                                <p className="text-[11px] text-slate-500 font-semibold">Total Marked</p>
                                <p className="text-2xl font-black text-slate-900">{stats.total_marked || 0}</p>
                                <p className="text-[10px] text-slate-400">Classroom Roll Calls</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                                <p className="text-[11px] text-emerald-700 font-semibold">Present</p>
                                <p className="text-2xl font-black text-emerald-700">{stats.present_count || 0}</p>
                                <p className="text-[10px] text-emerald-700 font-bold">{stats.attendance_rate || 0}% Rate</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                                <p className="text-[11px] text-rose-600 font-semibold">Absentees</p>
                                <p className="text-2xl font-black text-rose-600">{stats.absent_count || 0}</p>
                                <p className="text-[10px] text-rose-700 font-semibold">Recorded Absent</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                                <p className="text-[11px] text-amber-600 font-semibold">Late Arrivals</p>
                                <p className="text-2xl font-black text-amber-600">{stats.late_count || 0}</p>
                                <p className="text-[10px] text-amber-700 font-semibold">Recorded</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                                <p className="text-[11px] text-blue-600 font-semibold">Teacher Manual</p>
                                <p className="text-2xl font-black text-blue-600">{stats.manual_count || 0}</p>
                                <p className="text-[10px] text-blue-700 font-semibold">Roll Call Submissions</p>
                            </div>
                        </div>

                        {/* SESSIONS TABLE */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-900">
                                        Classroom Sessions Conducted ({selectedDate})
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Trade batches with classroom roll-call attendance sessions
                                    </p>
                                </div>
                            </div>

                            {sessions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="text-slate-400 border-b border-slate-100">
                                                <th className="pb-3 font-semibold">Batch & Course</th>
                                                <th className="pb-3 font-semibold">Instructor</th>
                                                <th className="pb-3 font-semibold text-center">Present</th>
                                                <th className="pb-3 font-semibold text-center">Absent</th>
                                                <th className="pb-3 font-semibold text-center">Leave</th>
                                                <th className="pb-3 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                            {sessions.map((s) => {
                                                const total = s.class_attendances?.length || 0;
                                                const present = s.class_attendances?.filter((a) => a.status === 'present').length || 0;
                                                const absent = s.class_attendances?.filter((a) => a.status === 'absent').length || 0;
                                                const leave = s.class_attendances?.filter((a) => a.status === 'leave').length || 0;

                                                return (
                                                    <tr key={s.id} className="hover:bg-slate-50 transition">
                                                        <td className="py-3.5">
                                                            <p className="font-bold text-slate-900">{s.batch?.name}</p>
                                                            <p className="text-[11px] text-slate-500">{s.batch?.course?.name}</p>
                                                        </td>
                                                        <td className="py-3.5">{s.user?.name || 'Assigned Faculty'}</td>
                                                        <td className="py-3.5 font-bold text-emerald-700 text-center">
                                                            {present} / {total}
                                                        </td>
                                                        <td className="py-3.5 font-bold text-rose-600 text-center">
                                                            {absent}
                                                        </td>
                                                        <td className="py-3.5 font-bold text-blue-600 text-center">
                                                            {leave}
                                                        </td>
                                                        <td className="py-3.5 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setBatchId(s.batch_id);
                                                                    setCurrentTab('monthly');
                                                                    router.get(
                                                                        route('admin.attendance.index'),
                                                                        { view: 'monthly', batch_id: s.batch_id },
                                                                        { preserveState: true }
                                                                    );
                                                                }}
                                                                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition"
                                                            >
                                                                View Monthly Register
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-xs text-slate-500">
                                    No attendance sessions recorded for {selectedDate}.
                                </div>
                            )}
                        </div>

                        {/* GATE LOGS */}
                        {gateLogs.length > 0 && (
                            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                                        <ShieldCheck className="h-5 w-5 text-govt-green" />
                                        <span>Recent Campus Perimeter Access Logs</span>
                                    </h3>
                                    <span className="text-xs text-slate-400 font-mono">Security Gate Sync</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {gateLogs.map((log) => (
                                        <div
                                            key={log.id}
                                            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-slate-900 truncate">
                                                    {log.student_profile?.user?.name || 'Trainee'}
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800">
                                                    {log.type}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500">
                                                Gate: {log.gate_name} • {new Date(log.logged_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════════════════════════════════════════════
                    TAB 2: MONTHLY BATCH REGISTER MATRIX (PRINCIPAL VIEW)
                ══════════════════════════════════════════════════ */}
                {currentTab === 'monthly' && (
                    <div className="space-y-6">
                        {/* Selector Controls */}
                        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Select Batch:</label>
                                    <select
                                        value={batchId}
                                        onChange={(e) => {
                                            setBatchId(e.target.value);
                                            router.get(
                                                route('admin.attendance.index'),
                                                { view: 'monthly', batch_id: e.target.value, month, year },
                                                { preserveState: true }
                                            );
                                        }}
                                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-govt-green/30"
                                    >
                                        {batches.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.name} ({b.course?.name})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Month:</label>
                                    <select
                                        value={month}
                                        onChange={(e) => {
                                            const m = parseInt(e.target.value);
                                            setMonth(m);
                                            router.get(
                                                route('admin.attendance.index'),
                                                { view: 'monthly', batch_id: batchId, month: m, year },
                                                { preserveState: true }
                                            );
                                        }}
                                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-govt-green/30"
                                    >
                                        {months.map((m) => (
                                            <option key={m.value} value={m.value}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Year:</label>
                                    <select
                                        value={year}
                                        onChange={(e) => {
                                            const y = parseInt(e.target.value);
                                            setYear(y);
                                            router.get(
                                                route('admin.attendance.index'),
                                                { view: 'monthly', batch_id: batchId, month, year: y },
                                                { preserveState: true }
                                            );
                                        }}
                                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-govt-green/30"
                                    >
                                        {[2025, 2026, 2027].map((y) => (
                                            <option key={y} value={y}>
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                {/* Legend */}
                                <div className="hidden sm:flex items-center space-x-2.5 text-xs">
                                    <span className="inline-flex items-center space-x-1">
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
                                        <span className="font-bold text-slate-700">P = Present</span>
                                    </span>
                                    <span className="inline-flex items-center space-x-1">
                                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block" />
                                        <span className="font-bold text-slate-700">A = Absent</span>
                                    </span>
                                    <span className="inline-flex items-center space-x-1">
                                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block" />
                                        <span className="font-bold text-slate-700">L = Leave</span>
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                                >
                                    <Printer className="h-3.5 w-3.5" />
                                    <span>Print Register</span>
                                </button>
                            </div>
                        </div>

                        {/* Batch Details & Monthly Register Table */}
                        {monthlyData ? (
                            <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden space-y-4">
                                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                                            <FileSpreadsheet className="h-5 w-5 text-govt-green" />
                                            <span>
                                                {monthlyData.batch?.name} — {monthlyData.month_name} {monthlyData.year} Register
                                            </span>
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {monthlyData.batch?.course?.name} • {monthlyData.total_sessions} Sessions Conducted • {monthlyData.student_matrix?.length || 0} Enrolled Students
                                        </p>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-center text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                                <th className="py-2.5 px-3 font-bold text-left sticky left-0 bg-slate-50 z-10 w-44 shadow-xs border-r border-slate-200">
                                                    Trainee & Roll No
                                                </th>
                                                {monthlyData.days_list.map((d) => (
                                                    <th
                                                        key={d.day}
                                                        className={`py-1.5 px-1 min-w-[28px] border-r border-slate-100 font-bold ${
                                                            d.is_weekend
                                                                ? 'bg-slate-100/70 text-slate-400'
                                                                : d.has_session
                                                                ? 'bg-emerald-50/50 text-emerald-900'
                                                                : 'text-slate-500'
                                                        }`}
                                                        title={`${d.date} (${d.day_of_week})`}
                                                    >
                                                        <div className="text-[9px] uppercase font-semibold text-slate-400">
                                                            {d.day_of_week[0]}
                                                        </div>
                                                        <div className="text-[11px] font-black">{d.day}</div>
                                                    </th>
                                                ))}
                                                <th className="py-2.5 px-2 font-bold bg-emerald-50 text-emerald-800 border-r border-emerald-100 w-12">
                                                    P
                                                </th>
                                                <th className="py-2.5 px-2 font-bold bg-rose-50 text-rose-800 border-r border-rose-100 w-12">
                                                    A
                                                </th>
                                                <th className="py-2.5 px-2 font-bold bg-blue-50 text-blue-800 border-r border-blue-100 w-12">
                                                    L
                                                </th>
                                                <th className="py-2.5 px-3 font-bold bg-slate-100 text-slate-800 w-16">
                                                    %
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium">
                                            {monthlyData.student_matrix.map((student) => {
                                                const pct = student.percentage;
                                                const pctColor =
                                                    pct >= 80
                                                        ? 'text-emerald-700 font-black'
                                                        : pct >= 60
                                                        ? 'text-amber-700 font-bold'
                                                        : 'text-rose-600 font-black';

                                                return (
                                                    <tr key={student.enrollment_id} className="hover:bg-slate-50/70 transition">
                                                        {/* Sticky Trainee Column */}
                                                        <td className="py-2 px-3 text-left sticky left-0 bg-white hover:bg-slate-50 z-10 border-r border-slate-200 shadow-xs">
                                                            <p className="font-bold text-slate-900 text-xs truncate max-w-[170px]" title={student.name}>
                                                                {student.name}
                                                            </p>
                                                            <p className="text-[10px] font-mono font-bold text-govt-green">
                                                                {student.enrollment_number}
                                                            </p>
                                                        </td>

                                                        {/* Days Cells */}
                                                        {monthlyData.days_list.map((d) => {
                                                            const status = student.days[d.day];

                                                            return (
                                                                <td
                                                                    key={d.day}
                                                                    className={`py-1.5 px-0.5 border-r border-slate-100 ${
                                                                        d.is_weekend ? 'bg-slate-50/60' : ''
                                                                    }`}
                                                                >
                                                                    {status === 'present' ? (
                                                                        <span
                                                                            className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500 text-white font-bold text-[10px] shadow-2xs"
                                                                            title={`${student.name} - Present on ${d.date}`}
                                                                        >
                                                                            P
                                                                        </span>
                                                                    ) : status === 'absent' ? (
                                                                        <span
                                                                            className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-rose-500 text-white font-bold text-[10px] shadow-2xs"
                                                                            title={`${student.name} - Absent on ${d.date}`}
                                                                        >
                                                                            A
                                                                        </span>
                                                                    ) : status === 'leave' ? (
                                                                        <span
                                                                            className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white font-bold text-[10px] shadow-2xs"
                                                                            title={`${student.name} - On Leave on ${d.date}`}
                                                                        >
                                                                            L
                                                                        </span>
                                                                    ) : status === 'late' ? (
                                                                        <span
                                                                            className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-500 text-white font-bold text-[10px] shadow-2xs"
                                                                            title={`${student.name} - Late on ${d.date}`}
                                                                        >
                                                                            Lt
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-slate-300 text-[10px]">-</span>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}

                                                        {/* Summary Columns */}
                                                        <td className="py-2 px-1 font-black text-emerald-700 bg-emerald-50/40 border-r border-emerald-100">
                                                            {student.present_count}
                                                        </td>
                                                        <td className="py-2 px-1 font-black text-rose-700 bg-rose-50/40 border-r border-rose-100">
                                                            {student.absent_count}
                                                        </td>
                                                        <td className="py-2 px-1 font-black text-blue-700 bg-blue-50/40 border-r border-blue-100">
                                                            {student.leave_count}
                                                        </td>
                                                        <td className={`py-2 px-2 bg-slate-50/80 ${pctColor}`}>
                                                            {pct}%
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {monthlyData.student_matrix.length === 0 && (
                                                <tr>
                                                    <td colSpan={monthlyData.days_list.length + 5} className="py-8 text-slate-400 text-center">
                                                        No students enrolled in this batch.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                                Please select a batch above to view the monthly attendance register.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
