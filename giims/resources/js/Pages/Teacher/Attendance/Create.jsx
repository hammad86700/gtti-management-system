import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import {
    ClipboardCheck,
    Calendar,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock,
    UserCheck,
    Users,
    Save,
    CalendarDays,
    Check,
    AlertCircle,
    FileText,
    ArrowRight
} from 'lucide-react';

export default function Create({
    batch,
    subjects = [],
    selectedDate,
    trainees = [],
    isSaved = false,
    teacherBatches = []
}) {
    const course = batch.course;
    const trade = course?.trade;
    const dept = trade?.program?.department;

    // Initialize attendance array from trainees passed from controller
    const initialAttendances = trainees.map((t) => ({
        student_profile_id: t.student_profile_id,
        status: t.status || 'present',
        late_minutes: t.late_minutes || 0,
    }));

    const { data, setData, post, processing, errors } = useForm({
        session_date: selectedDate || new Date().toISOString().split('T')[0],
        subject_id: subjects[0]?.id || '',
        start_time: '08:30',
        end_time: '12:30',
        attendances: initialAttendances,
    });

    // Handle date change -> reloads view with students' attendance state for that date
    const handleDateChange = (newDate) => {
        router.get(
            route('teacher.attendance.create', { batchId: batch.id }),
            { date: newDate },
            { preserveState: false }
        );
    };

    const setAllStatus = (newStatus) => {
        const updated = data.attendances.map((att) => ({
            ...att,
            status: newStatus,
        }));
        setData('attendances', updated);
    };

    const handleStudentStatusChange = (profileId, newStatus) => {
        const updated = data.attendances.map((att) => {
            if (att.student_profile_id === profileId) {
                return {
                    ...att,
                    status: newStatus,
                };
            }
            return att;
        });
        setData('attendances', updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('teacher.attendance.store', { batchId: batch.id }));
    };

    // Calculate live counts
    const counts = data.attendances.reduce(
        (acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
        },
        { present: 0, absent: 0, leave: 0, late: 0 }
    );

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
                            <h2 className="text-xl font-bold leading-tight text-slate-900">
                                Roll-Call Attendance: {batch.name}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {course?.name} ({trade?.name}) • {batch.shift || 'Morning'} Shift
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Link
                            href={route('teacher.attendance.monthly', { batchId: batch.id })}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition flex items-center space-x-1.5"
                        >
                            <CalendarDays className="h-3.5 w-3.5 text-emerald-700" />
                            <span>Monthly Register</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Roll Call - ${batch.name}`} />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* TOP CONTROLS & DATE SELECTOR */}
                    <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                                    <ClipboardCheck className="h-5 w-5 text-govt-green" />
                                    <span>Class Roll-Call Session</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Mark student presence manually. Status updates reflect directly on students' portals.
                                </p>
                            </div>

                            {/* Quick Bulk Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAllStatus('present')}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                                >
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>Mark All Present</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAllStatus('absent')}
                                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                                >
                                    <XCircle className="h-3.5 w-3.5 text-rose-600" />
                                    <span>Mark All Absent</span>
                                </button>
                            </div>
                        </div>

                        {/* Date and Subject Selection */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1 flex items-center space-x-1">
                                    <Calendar className="h-3.5 w-3.5 text-govt-green" />
                                    <span>Roll-Call Date</span>
                                    <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.session_date}
                                    onChange={(e) => {
                                        setData('session_date', e.target.value);
                                        handleDateChange(e.target.value);
                                    }}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-govt-green/30"
                                />
                                {errors.session_date && (
                                    <p className="text-[11px] text-rose-500 mt-1">{errors.session_date}</p>
                                )}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Curriculum Module / Subject
                                </label>
                                <select
                                    value={data.subject_id}
                                    onChange={(e) => setData('subject_id', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-govt-green/30"
                                >
                                    <option value="">General Class Roll Call</option>
                                    {subjects.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.name} {sub.is_practical ? '(Lab Practical)' : '(Theory)'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Batch Switcher */}
                            {teacherBatches.length > 1 && (
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Switch Batch
                                    </label>
                                    <select
                                        value={batch.id}
                                        onChange={(e) => {
                                            router.get(route('teacher.attendance.create', { batchId: e.target.value }));
                                        }}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-govt-green/30"
                                    >
                                        {teacherBatches.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.name} ({b.course?.name})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Status Notice Banner */}
                        {isSaved ? (
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                <span>
                                    Attendance for <strong>{data.session_date}</strong> is already recorded. You can modify any student's status below and re-save.
                                </span>
                            </div>
                        ) : (
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center space-x-2">
                                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                                <span>
                                    Roll call for <strong>{data.session_date}</strong> is currently pending submission. Click "Save & Submit Attendance" below when finished.
                                </span>
                            </div>
                        )}

                        {/* Live Summary Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                                <p className="text-[10px] uppercase font-bold text-emerald-700">Present (P)</p>
                                <p className="text-xl font-black text-emerald-800">{counts.present}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
                                <p className="text-[10px] uppercase font-bold text-rose-700">Absent (A)</p>
                                <p className="text-xl font-black text-rose-800">{counts.absent}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
                                <p className="text-[10px] uppercase font-bold text-blue-700">Leave (Lv)</p>
                                <p className="text-xl font-black text-blue-800">{counts.leave}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                                <p className="text-[10px] uppercase font-bold text-slate-500">Total Trainees</p>
                                <p className="text-xl font-black text-slate-800">{trainees.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* ENROLLED STUDENTS ROLL CALL TABLE */}
                    <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                            <h3 className="font-bold text-slate-900 flex items-center space-x-2">
                                <Users className="h-4 w-4 text-govt-green" />
                                <span>Trainee Roster & Daily Mark ({trainees.length} Students)</span>
                            </h3>
                            <span className="text-slate-400">Click P / A / Lv for each student</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="text-slate-400 border-b border-slate-100">
                                        <th className="pb-3 font-semibold w-12">#</th>
                                        <th className="pb-3 font-semibold">Trainee Name</th>
                                        <th className="pb-3 font-semibold">Roll Number</th>
                                        <th className="pb-3 font-semibold">Father's Name</th>
                                        <th className="pb-3 font-semibold text-center w-56">Attendance Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                    {trainees.map((trainee, idx) => {
                                        const attRecord = data.attendances.find(
                                            (a) => a.student_profile_id === trainee.student_profile_id
                                        ) || { status: 'present' };

                                        return (
                                            <tr key={trainee.enrollment_id} className="hover:bg-slate-50/80 transition">
                                                <td className="py-3 text-slate-400 font-bold">{idx + 1}</td>
                                                <td className="py-3">
                                                    <div className="flex items-center space-x-2">
                                                        <p className="font-bold text-slate-900 text-sm">
                                                            {trainee.name}
                                                        </p>
                                                        {trainee.has_approved_leave && (
                                                            <span
                                                                className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold"
                                                                title={trainee.leave_reason || 'Approved Leave Request'}
                                                            >
                                                                On Approved Leave
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 font-mono font-bold text-govt-green">
                                                    {trainee.enrollment_number}
                                                </td>
                                                <td className="py-3 text-slate-600">
                                                    {trainee.father_name}
                                                </td>

                                                {/* 3 Clear Status Buttons */}
                                                <td className="py-3">
                                                    <div className="flex items-center justify-center space-x-1.5">
                                                        {/* PRESENT */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStudentStatusChange(trainee.student_profile_id, 'present')}
                                                            className={`flex-1 py-1.5 px-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1 cursor-pointer ${
                                                                attRecord.status === 'present'
                                                                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                                                                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                                            }`}
                                                        >
                                                            <Check className="h-3.5 w-3.5" />
                                                            <span>Present</span>
                                                        </button>

                                                        {/* ABSENT */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStudentStatusChange(trainee.student_profile_id, 'absent')}
                                                            className={`flex-1 py-1.5 px-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1 cursor-pointer ${
                                                                attRecord.status === 'absent'
                                                                    ? 'bg-rose-600 text-white shadow-xs font-black'
                                                                    : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                                                            }`}
                                                        >
                                                            <XCircle className="h-3.5 w-3.5" />
                                                            <span>Absent</span>
                                                        </button>

                                                        {/* LEAVE */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStudentStatusChange(trainee.student_profile_id, 'leave')}
                                                            className={`flex-1 py-1.5 px-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1 cursor-pointer ${
                                                                attRecord.status === 'leave'
                                                                    ? 'bg-blue-600 text-white shadow-xs font-black'
                                                                    : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                                                            }`}
                                                        >
                                                            <span>Leave</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {trainees.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-8 text-slate-400">
                                                No active enrolled students found in this batch.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Submit CTA */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <Link
                                href={route('teacher.attendance.monthly', { batchId: batch.id })}
                                className="text-xs font-bold text-emerald-800 hover:underline flex items-center space-x-1"
                            >
                                <span>View Full Monthly Register</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>

                            <div className="flex items-center space-x-3">
                                <Link
                                    href={route('teacher.dashboard')}
                                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition"
                                >
                                    Cancel
                                </Link>

                                <button
                                    type="submit"
                                    disabled={processing || trainees.length === 0}
                                    className="px-6 py-2.5 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white text-xs font-extrabold transition shadow-sm flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>{processing ? 'Saving Attendance...' : 'Save & Submit Attendance'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}