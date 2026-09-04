import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    BarChart3,
    ArrowLeft,
    FileSpreadsheet,
    Trash2,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Award,
    Printer,
    Download
} from 'lucide-react';

export default function Results({ test, results = [], stats = {} }) {
    const [deletingId, setDeletingId] = useState(null);

    const handleDeleteResult = (attemptId, candidateName) => {
        if (!confirm(`Are you sure you want to delete the result for ${candidateName}?\n\nThis will allow them to retake the exam immediately.`)) {
            return;
        }

        setDeletingId(attemptId);
        router.delete(route('teacher.exam-system.attempts.delete', attemptId), {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-2 text-xs font-medium">
                    <Link href={route('teacher.exam-system.dashboard')} className="hover:text-[#C1902F] transition">
                        GTTI Exam System
                    </Link>
                    <span>/</span>
                    <span className="text-slate-900 font-semibold">{test.title} Results</span>
                </div>
            }
        >
            <Head title={`Results - ${test.title}`} />

            <div className="min-h-screen bg-[#070D12] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 antialiased">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header Banner */}
                    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1.5">
                            <div className="flex items-center space-x-2">
                                <Link
                                    href={route('teacher.exam-system.dashboard')}
                                    className="inline-flex items-center space-x-1 text-xs font-bold text-slate-400 hover:text-white transition"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    <span>Back to Cockpit</span>
                                </Link>
                                <span className="text-slate-600">•</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-800 text-amber-400 border border-slate-700">
                                    {test.batch?.course?.name} ({test.batch?.name})
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                {test.title} — Examination Results
                            </h1>
                            <p className="text-xs text-slate-400">
                                Evaluated MCQ Scores and Viva Voce practical grading registry.
                            </p>
                        </div>

                        {/* Export Action */}
                        <div className="shrink-0 flex items-center space-x-3">
                            <a
                                href={route('teacher.exam-system.results.export-csv', test.id)}
                                className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-govt-green hover:from-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg"
                            >
                                <Download className="h-4 w-4" />
                                <span>Export to Excel / CSV</span>
                            </a>
                        </div>
                    </div>

                    {/* KPI Statistics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Examined</span>
                            <p className="text-2xl font-black text-white mt-1">{stats.completed || 0}</p>
                        </div>

                        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Passed</span>
                            <p className="text-2xl font-black text-emerald-400 mt-1">{stats.passed || 0}</p>
                        </div>

                        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Failed</span>
                            <p className="text-2xl font-black text-rose-400 mt-1">{stats.failed || 0}</p>
                        </div>

                        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Average Score</span>
                            <p className="text-2xl font-black text-amber-400 mt-1">{stats.average_percentage || 0}%</p>
                        </div>
                    </div>

                    {/* Results Table */}
                    <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white">Graded Candidates Roster ({results.length})</h3>
                            <span className="text-xs text-slate-400 font-mono">
                                Passing: {test.passing_percentage}%
                            </span>
                        </div>

                        {results.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-950 text-slate-400 uppercase font-bold tracking-wider text-[10px] border-b border-slate-800">
                                        <tr>
                                            <th className="py-3 px-4">Candidate Identity</th>
                                            <th className="py-3 px-4">CNIC / Registration</th>
                                            <th className="py-3 px-4">Computer Score</th>
                                            <th className="py-3 px-4">Viva / Practical</th>
                                            <th className="py-3 px-4">Grand Total</th>
                                            <th className="py-3 px-4">Percentage</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 text-slate-300">
                                        {results.map((attempt) => {
                                            const student = attempt.student_profile?.user;
                                            const isPassed = attempt.percentage >= (test.passing_percentage ?? 50);

                                            return (
                                                <tr key={attempt.id} className="hover:bg-slate-800/50 transition">
                                                    <td className="py-3.5 px-4">
                                                        <div className="font-bold text-white">{student?.name || 'Candidate'}</div>
                                                        <div className="text-[11px] text-slate-400">
                                                            Father: {attempt.student_profile?.father_name || 'N/A'}
                                                        </div>
                                                    </td>

                                                    <td className="py-3.5 px-4 font-mono">
                                                        <div className="text-amber-400 font-bold">{student?.cnic}</div>
                                                        <div className="text-[10px] text-slate-500">{attempt.student_profile?.registration_number}</div>
                                                    </td>

                                                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                                                        {attempt.score ?? 0}
                                                        <span className="text-slate-500 font-sans text-[11px]"> / {attempt.total_questions ?? test.effective_question_count}</span>
                                                    </td>

                                                    <td className="py-3.5 px-4 font-mono">
                                                        {attempt.practical_marks !== null ? (
                                                            <span className="text-blue-400 font-bold">
                                                                {attempt.practical_marks} / {test.practical_marks}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[11px] text-amber-400 italic">
                                                                Pending Viva
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="py-3.5 px-4 font-mono font-black text-sm text-white">
                                                        {attempt.grand_total ?? (attempt.score ?? 0)}
                                                    </td>

                                                    <td className="py-3.5 px-4 font-mono font-black text-sm">
                                                        <span className={isPassed ? 'text-emerald-400' : 'text-rose-400'}>
                                                            {attempt.percentage ?? 0}%
                                                        </span>
                                                    </td>

                                                    <td className="py-3.5 px-4">
                                                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                                            isPassed
                                                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                                        }`}>
                                                            {isPassed ? 'PASS' : 'FAIL'}
                                                        </span>
                                                    </td>

                                                    <td className="py-3.5 px-4 text-right space-x-2">
                                                        <Link
                                                            href={route('exam-system.result', attempt.id)}
                                                            className="inline-flex items-center space-x-1 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                                                            title="View Result Card"
                                                        >
                                                            <Printer className="h-4 w-4" />
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            disabled={deletingId === attempt.id}
                                                            onClick={() => handleDeleteResult(attempt.id, student?.name)}
                                                            className="inline-flex items-center space-x-1 p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition"
                                                            title="Delete result and allow retake"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
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
                                <FileSpreadsheet className="h-10 w-10 text-slate-600 mx-auto" />
                                <p className="text-sm font-bold text-slate-400">No Examination Attempts Recorded</p>
                                <p className="text-xs">Once students complete this test, their scores and viva marks will populate here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
