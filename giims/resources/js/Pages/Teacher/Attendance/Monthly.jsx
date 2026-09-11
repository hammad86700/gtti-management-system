import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarDays,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Users,
    ClipboardCheck,
    Printer,
    CheckCircle2,
    XCircle,
    Clock,
    FileSpreadsheet,
    Building2,
    Sparkles
} from 'lucide-react';
import Badge from '@/Components/UI/Badge';

export default function Monthly({
    batch,
    teacherBatches = [],
    month,
    year,
    monthName,
    daysInMonth,
    daysList = [],
    studentMatrix = [],
    totalSessions = 0
}) {
    const course = batch.course;
    const trade = course?.trade;
    const dept = trade?.program?.department;

    // Handle Month Navigation
    const handleMonthChange = (newMonth, newYear) => {
        router.get(
            route('teacher.attendance.monthly', { batchId: batch.id }),
            { month: newMonth, year: newYear },
            { preserveState: false }
        );
    };

    const handlePrevMonth = () => {
        let prevM = month - 1;
        let prevY = year;
        if (prevM < 1) {
            prevM = 12;
            prevY = year - 1;
        }
        handleMonthChange(prevM, prevY);
    };

    const handleNextMonth = () => {
        let nextM = month + 1;
        let nextY = year;
        if (nextM > 12) {
            nextM = 1;
            nextY = year + 1;
        }
        handleMonthChange(nextM, nextY);
    };

    // Overall batch average percentage
    const totalPossibleSessions = studentMatrix.reduce((acc, curr) => acc + curr.total_marked, 0);
    const totalPresentsAcrossBatch = studentMatrix.reduce((acc, curr) => acc + curr.present_count, 0);
    const batchAvgRate = totalPossibleSessions > 0
        ? Math.round((totalPresentsAcrossBatch / totalPossibleSessions) * 100)
        : 0;

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
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('teacher.dashboard')}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h2 className="text-xl font-bold leading-tight text-slate-900 flex items-center space-x-2">
                                <span>Monthly Attendance Register</span>
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                                    {monthName} {year}
                                </span>
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {batch.name} • {course?.name} ({batch.shift || 'Morning'} Shift)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Link
                            href={route('teacher.attendance.create', { batchId: batch.id })}
                            className="px-3.5 py-2 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                        >
                            <ClipboardCheck className="h-3.5 w-3.5" />
                            <span>Mark Roll Call</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                            title="Print Attendance Register"
                        >
                            <Printer className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Print</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Monthly Register - ${monthName} ${year} - ${batch.name}`} />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* MONTH NAVIGATION & CONTROLS */}
                <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="Previous Month"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        <div className="flex items-center space-x-2">
                            <select
                                value={month}
                                onChange={(e) => handleMonthChange(parseInt(e.target.value), year)}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-govt-green/30"
                            >
                                {months.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={year}
                                onChange={(e) => handleMonthChange(month, parseInt(e.target.value))}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-govt-green/30"
                            >
                                {[2025, 2026, 2027].map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="Next Month"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Batch Switcher */}
                    {teacherBatches.length > 1 && (
                        <div className="flex items-center space-x-2 text-xs">
                            <span className="font-bold text-slate-500">Batch:</span>
                            <select
                                value={batch.id}
                                onChange={(e) => {
                                    router.get(route('teacher.attendance.monthly', { batchId: e.target.value }), {
                                        month,
                                        year
                                    });
                                }}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-govt-green/30"
                            >
                                {teacherBatches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name} ({b.course?.name})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Quick Legend */}
                    <div className="flex items-center space-x-3 text-xs">
                        <span className="inline-flex items-center space-x-1">
                            <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
                            <span className="font-bold text-slate-700">P = Present</span>
                        </span>
                        <span className="inline-flex items-center space-x-1">
                            <span className="h-3 w-3 rounded-full bg-rose-500 inline-block" />
                            <span className="font-bold text-slate-700">A = Absent</span>
                        </span>
                        <span className="inline-flex items-center space-x-1">
                            <span className="h-3 w-3 rounded-full bg-blue-500 inline-block" />
                            <span className="font-bold text-slate-700">L = Leave</span>
                        </span>
                    </div>
                </div>

                {/* SUMMARY METRICS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Total Trainees</p>
                        <p className="text-xl font-black text-slate-800 mt-1">{studentMatrix.length}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Enrolled in {batch.name}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Lectures Held</p>
                        <p className="text-xl font-black text-govt-green mt-1">{totalSessions}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Sessions in {monthName}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Batch Attendance Rate</p>
                        <p className="text-xl font-black text-emerald-800 mt-1">{batchAvgRate}%</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Cumulative for Month</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Days in Month</p>
                        <p className="text-xl font-black text-slate-800 mt-1">{daysInMonth}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{monthName} {year}</p>
                    </div>
                </div>

                {/* DAY-BY-DAY ATTENDANCE MATRIX TABLE */}
                <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                            <FileSpreadsheet className="h-4 w-4 text-govt-green" />
                            <span>Day-by-Day Roster Grid ({monthName} {year})</span>
                        </h3>
                        <span className="text-xs text-slate-400">Scroll horizontally to view all dates</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-center text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                    <th className="py-2.5 px-3 font-bold text-left sticky left-0 bg-slate-50 z-10 w-44 shadow-xs border-r border-slate-200">
                                        Trainee & Roll No
                                    </th>
                                    {daysList.map((d) => (
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
                                {studentMatrix.map((student, sIdx) => {
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
                                            {daysList.map((d) => {
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

                                {studentMatrix.length === 0 && (
                                    <tr>
                                        <td colSpan={daysList.length + 5} className="py-8 text-slate-400 text-center">
                                            No students found in this batch.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
