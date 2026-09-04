import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Users,
    Clock,
    CheckCircle2,
    Lock,
    Sparkles,
    ChevronRight,
    Award,
    GraduationCap,
    RefreshCw,
    Search,
    AlertCircle,
    UserCheck,
    ArrowRight
} from 'lucide-react';
import Badge from '@/Components/UI/Badge';

export default function Index({ course, courses = [], attempts = [], currentUserId }) {
    const [search, setSearch] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // 5-second real-time polling to update waiting queue across multiple examiner terminals
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['attempts'],
                preserveScroll: true,
                preserveState: true,
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [course?.id]);

    const handleManualRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            only: ['attempts'],
            preserveScroll: true,
            onFinish: () => setIsRefreshing(false),
        });
    };

    const filteredAttempts = attempts.filter((a) => {
        const query = search.toLowerCase();
        return (
            a.candidate_name?.toLowerCase().includes(query) ||
            a.application_number?.toLowerCase().includes(query) ||
            a.cnic?.includes(query)
        );
    });

    const waitingCount = attempts.filter((a) => a.interview_status === 'waiting').length;
    const inProgressCount = attempts.filter((a) => a.interview_status === 'in_progress').length;
    const completedCount = attempts.filter((a) => a.interview_status === 'completed').length;

    return (
        <AuthenticatedLayout>
            <Head title={`Viva Voce Desk - ${course?.name}`} />

            <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header Card */}
                <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950 border border-slate-800 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-slate-950">
                                    CONCURRENT VIVA DESK
                                </span>
                                <span className="text-xs text-emerald-400 font-mono flex items-center space-x-1">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>Atomic Row-Locking Active</span>
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                {course?.name} - Viva Voce Desk
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-300">
                                Trade: <strong>{course?.trade?.name}</strong> • Venue: <strong>{course?.interview_venue || 'Lab 3 / Interview Room'}</strong> • Max Marks: <strong>{course?.interview_max_marks || 10}</strong>
                            </p>
                        </div>

                        {/* Trade Switcher Dropdown */}
                        <div className="flex items-center space-x-3 shrink-0">
                            <div className="relative">
                                <select
                                    value={course?.id}
                                    onChange={(e) => router.visit(route('interviewer.viva.index', e.target.value))}
                                    className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-emerald-500 pr-8"
                                >
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={handleManualRefresh}
                                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white transition shadow-sm"
                                title="Refresh Live Queue"
                            >
                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Quick Metrics */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800">
                        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Waiting in Lobby</span>
                            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">{waitingCount}</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Under Evaluation</span>
                            <span className="text-xl sm:text-2xl font-black text-blue-400 font-mono">{inProgressCount}</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Evaluated & Completed</span>
                            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{completedCount}</span>
                        </div>
                    </div>
                </div>

                {/* Queue Controls & Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search candidate by name, CNIC, or application #..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 shadow-xs"
                        />
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>Live Sync Enabled (5s Interval)</span>
                    </div>
                </div>

                {/* Candidates Waiting Roster */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                            <Users className="h-4 w-4 text-emerald-600" />
                            <span>CBT-Qualified Candidates Queue</span>
                        </h3>
                        <span className="text-xs text-slate-400 font-mono">
                            Total Candidates: {filteredAttempts.length}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="py-3 px-4">Candidate Particulars</th>
                                    <th className="py-3 px-3">CNIC</th>
                                    <th className="py-3 px-3 text-center">Matric Marks</th>
                                    <th className="py-3 px-3 text-center">CBT Marks</th>
                                    <th className="py-3 px-3 text-center">Viva Score</th>
                                    <th className="py-3 px-3 text-center">Lock Status</th>
                                    <th className="py-3 px-4 text-right">Interviewer Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {filteredAttempts.map((attempt) => (
                                    <tr key={attempt.id} className="hover:bg-slate-50/70 transition">
                                        {/* Candidate */}
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
                                        <td className="py-3 px-3 text-center">
                                            <span className="font-mono font-bold text-slate-800">
                                                {attempt.matric_marks ?? '—'}
                                            </span>
                                            {attempt.matric_percentage && (
                                                <span className="text-[10px] text-slate-400 block font-mono">
                                                    ({attempt.matric_percentage}%)
                                                </span>
                                            )}
                                        </td>

                                        {/* CBT Score */}
                                        <td className="py-3 px-3 text-center">
                                            <span className="font-mono font-black text-emerald-600 text-sm">
                                                {attempt.cbt_score}
                                            </span>
                                            <span className="text-[10px] text-slate-400 block font-mono">
                                                / {attempt.cbt_total}
                                            </span>
                                        </td>

                                        {/* Viva Score */}
                                        <td className="py-3 px-3 text-center">
                                            {attempt.interview_status === 'completed' ? (
                                                <div>
                                                    <span className="font-mono font-black text-indigo-600 text-sm">
                                                        {attempt.interview_score}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 block font-mono">
                                                        / {course?.interview_max_marks || 10}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 font-mono">—</span>
                                            )}
                                        </td>

                                        {/* Lock Status */}
                                        <td className="py-3 px-3 text-center">
                                            {attempt.is_locked_by_other ? (
                                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                                                    <Lock className="h-3 w-3" />
                                                    <span>By {attempt.evaluator_name}</span>
                                                </span>
                                            ) : attempt.is_locked_by_me ? (
                                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                                                    <UserCheck className="h-3 w-3" />
                                                    <span>Claimed By You</span>
                                                </span>
                                            ) : attempt.interview_status === 'completed' ? (
                                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    <span>Completed</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                                                    <Clock className="h-3 w-3" />
                                                    <span>Waiting in Lobby</span>
                                                </span>
                                            )}
                                        </td>

                                        {/* Action */}
                                        <td className="py-3 px-4 text-right">
                                            {attempt.is_locked_by_other ? (
                                                <button
                                                    disabled
                                                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed inline-flex items-center space-x-1"
                                                >
                                                    <Lock className="h-3.5 w-3.5" />
                                                    <span>Occupied</span>
                                                </button>
                                            ) : attempt.is_locked_by_me ? (
                                                <Link
                                                    href={route('interviewer.viva.evaluate', attempt.id)}
                                                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm inline-flex items-center space-x-1"
                                                >
                                                    <span>Resume Viva</span>
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Link>
                                            ) : attempt.interview_status === 'completed' ? (
                                                <Link
                                                    href={route('interviewer.viva.evaluate', attempt.id)}
                                                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center space-x-1"
                                                >
                                                    <span>Review Marks</span>
                                                </Link>
                                            ) : (
                                                <Link
                                                    method="post"
                                                    as="button"
                                                    href={route('interviewer.viva.claim', attempt.id)}
                                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-sm inline-flex items-center space-x-1.5 transition"
                                                >
                                                    <UserCheck className="h-3.5 w-3.5" />
                                                    <span>Claim & Interview</span>
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {filteredAttempts.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
                                            No candidates currently waiting in the viva queue for this trade.
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
