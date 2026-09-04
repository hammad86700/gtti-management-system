import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Award,
    Printer,
    Users,
    CheckCircle2,
    Clock,
    AlertTriangle,
    FileText,
    ChevronRight,
    Sliders,
    Building2,
    Shield,
    Sparkles,
    CreditCard
} from 'lucide-react';
import Badge from '@/Components/UI/Badge';

export default function MeritDesk({ course, courses = [], attempts = [], stats = {} }) {
    const [selectedSeats, setSelectedSeats] = useState(25);
    const [minScore, setMinScore] = useState(33);

    const { data, setData, post, processing } = useForm({
        allocated_seats: selectedSeats,
        minimum_passing_score: minScore,
    });

    const handleApplyCutoff = (e) => {
        e.preventDefault();
        post(route('teacher.merit-desk.apply-cutoff', course.id), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Admission Merit Desk - ${course?.name}`} />

            <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header Banner */}
                <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400 text-slate-950">
                                    INSTITUTIONAL ADMISSION MERIT ENGINE
                                </span>
                                <span className="text-xs text-indigo-300 font-mono">
                                    Matric ({course?.matric_weightage}%) + CBT ({course?.test_weightage}%) + Viva ({course?.interview_weightage}%)
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                {course?.name} - Final Merit Desk
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-300">
                                Government Technical Training Institute (GTTI) Rahim Yar Khan • Trade: <strong>{course?.trade?.name}</strong>
                            </p>
                        </div>

                        {/* Top Actions */}
                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                            {/* Course Switcher */}
                            <select
                                value={course?.id}
                                onChange={(e) => router.visit(route('teacher.merit-desk.index', e.target.value))}
                                className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                            >
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>

                            <a
                                href={route('teacher.merit-desk.gazette', course?.id)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-md"
                            >
                                <Printer className="h-4 w-4" />
                                <span>Print TEVTA Gazette</span>
                            </a>
                        </div>
                    </div>

                    {/* KPI Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800">
                        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Tested</span>
                            <span className="text-xl sm:text-2xl font-black text-white font-mono">{stats.total_candidates ?? 0}</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Selected on Merit</span>
                            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{stats.selected_count ?? 0}</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Waiting List</span>
                            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">{stats.waiting_count ?? 0}</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Disqualified (&lt;33%)</span>
                            <span className="text-xl sm:text-2xl font-black text-rose-400 font-mono">{stats.disqualified_count ?? 0}</span>
                        </div>
                    </div>
                </div>

                {/* Dynamic Cutoff Seat Selector Widget */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div className="flex items-center space-x-2.5">
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                                <Sliders className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Dynamic Merit Cutoff & Seat Allocator
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Configure sanctioned seats to automatically partition ranked candidates into Selected vs. Waiting List.
                                </p>
                            </div>
                        </div>

                        {/* Clerk 1-Click Fee Challan Trigger */}
                        <Link
                            method="post"
                            as="button"
                            href={route('clerk.courses.generate-challans', course?.id)}
                            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition"
                        >
                            <CreditCard className="h-4 w-4 text-emerald-400" />
                            <span>Unlock Challans for Selected</span>
                        </Link>
                    </div>

                    <form onSubmit={handleApplyCutoff} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Sanctioned Seats (Cutoff Quota)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="500"
                                required
                                value={data.allocated_seats}
                                onChange={(e) => setData('allocated_seats', e.target.value)}
                                placeholder="e.g. 25"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Minimum Qualifying Benchmark (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={data.minimum_passing_score}
                                onChange={(e) => setData('minimum_passing_score', e.target.value)}
                                placeholder="e.g. 33"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-2.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition disabled:opacity-50"
                        >
                            {processing ? 'Applying Cutoff...' : 'Apply Merit Cutoff'}
                        </button>
                    </form>
                </div>

                {/* Candidate Composite Merit Roster Table */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                            <Award className="h-4 w-4 text-amber-500" />
                            <span>Ranked Trainee Roster (Sorted by Composite Merit Score)</span>
                        </h3>
                        <span className="text-xs text-slate-400 font-mono">
                            Showing {attempts.length} evaluated trainees
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="py-3 px-4 text-center">Rank</th>
                                    <th className="py-3 px-4">Candidate Particulars</th>
                                    <th className="py-3 px-3">CNIC</th>
                                    <th className="py-3 px-3 text-center">Matric %</th>
                                    <th className="py-3 px-3 text-center">CBT Marks</th>
                                    <th className="py-3 px-3 text-center">Viva Score</th>
                                    <th className="py-3 px-3 text-center">Composite Merit %</th>
                                    <th className="py-3 px-3 text-center">Admission Decision</th>
                                    <th className="py-3 px-4 text-right">Scorecard</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {attempts.map((attempt, index) => {
                                    const isCutoffPoint =
                                        index + 1 === Number(data.allocated_seats) &&
                                        index < attempts.length - 1;

                                    return (
                                        <>
                                            <tr
                                                key={attempt.id}
                                                className={`transition ${
                                                    attempt.selection_status === 'selected'
                                                        ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                                                        : attempt.selection_status === 'waiting'
                                                        ? 'bg-amber-50/30 hover:bg-amber-50/60'
                                                        : 'hover:bg-slate-50/70'
                                                }`}
                                            >
                                                {/* Rank */}
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`inline-flex items-center justify-center h-7 w-7 rounded-xl font-mono font-black text-xs ${
                                                        (attempt.merit_rank ?? attempt.calculated_rank) <= 3
                                                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                                                            : attempt.selection_status === 'selected'
                                                            ? 'bg-emerald-100 text-emerald-900'
                                                            : 'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        #{attempt.merit_rank ?? attempt.calculated_rank}
                                                    </span>
                                                </td>

                                                {/* Candidate Particulars */}
                                                <td className="py-3 px-4">
                                                    <div className="font-bold text-slate-900 text-sm">{attempt.candidate_name}</div>
                                                    <div className="text-[11px] text-slate-400">
                                                        S/O {attempt.father_name} • App #{attempt.application_number}
                                                    </div>
                                                </td>

                                                {/* CNIC */}
                                                <td className="py-3 px-3 font-mono text-slate-600 font-semibold">
                                                    {attempt.cnic}
                                                </td>

                                                {/* Matric */}
                                                <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                                                    {attempt.matric_percentage ? `${attempt.matric_percentage}%` : '—'}
                                                </td>

                                                {/* CBT Score */}
                                                <td className="py-3 px-3 text-center">
                                                    <span className="font-mono font-black text-slate-900">
                                                        {attempt.cbt_score}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-mono"> / {attempt.cbt_total}</span>
                                                </td>

                                                {/* Viva Score */}
                                                <td className="py-3 px-3 text-center">
                                                    <span className="font-mono font-black text-indigo-700">
                                                        {attempt.interview_score !== null ? attempt.interview_score : '—'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-mono"> / {course?.interview_max_marks || 10}</span>
                                                </td>

                                                {/* Composite Score */}
                                                <td className="py-3 px-3 text-center">
                                                    <span className="font-mono font-black text-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                                                        {Number(attempt.composite_score || 0).toFixed(2)}%
                                                    </span>
                                                </td>

                                                {/* Selection Status */}
                                                <td className="py-3 px-3 text-center">
                                                    {attempt.selection_status === 'selected' ? (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            <span>Selected</span>
                                                        </span>
                                                    ) : attempt.selection_status === 'waiting' ? (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                                                            <Clock className="h-3 w-3" />
                                                            <span>Waiting List</span>
                                                        </span>
                                                    ) : attempt.selection_status === 'disqualified' ? (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                                                            <AlertTriangle className="h-3 w-3" />
                                                            <span>Disqualified</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                                                            <span>Unfinalized</span>
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Scorecard Action */}
                                                <td className="py-3 px-4 text-right">
                                                    <a
                                                        href={route('teacher.merit-desk.scorecard', attempt.id)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-bold text-xs"
                                                    >
                                                        <FileText className="h-3.5 w-3.5" />
                                                        <span>Scorecard</span>
                                                    </a>
                                                </td>
                                            </tr>

                                            {/* Visual Cutoff Dividing Line */}
                                            {isCutoffPoint && (
                                                <tr key={`cutoff-${attempt.id}`} className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-center select-none shadow-xs">
                                                    <td colSpan="9" className="py-2 text-xs uppercase tracking-widest font-mono">
                                                        ✂ • • • MERIT CUTOFF LINE ({data.allocated_seats} ALLOCATED SEATS) — WAITING LIST COMMENCES BELOW • • • ✂
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    );
                                })}

                                {attempts.length === 0 && (
                                    <tr>
                                        <td colSpan="9" className="py-10 text-center text-slate-400 text-xs">
                                            No evaluated candidates found for this trade.
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
