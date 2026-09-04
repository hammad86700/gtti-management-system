import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Award,
    Search,
    UserCircle,
    CheckCircle2,
    Clock,
    Users,
    ChevronLeft,
    Sparkles,
    Send,
    HelpCircle,
    FileText,
    ArrowRight,
    RefreshCw
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
    "What motivated you to pursue this technical discipline?",
    "Can you explain the primary difference between hardware components and system software?",
    "How do you troubleshoot a system failure under tight deadlines?",
    "Describe the practical workshop safety protocols required in this lab.",
    "Where do you see yourself technically and professionally in 3 years?",
    "Can you explain the difference between RAM and ROM memory in computing?",
    "What role does preventative maintenance play in technical equipment?",
    "How do you approach learning a completely new technical skill or tool?"
];

export default function InterviewDesk({
    pendingQueue = [],
    completedQueue = [],
    tests = [],
    selectedTestId = null,
    searchQuery = '',
}) {
    const [search, setSearch] = useState(searchQuery || '');
    const [selectedAttempt, setSelectedAttempt] = useState(pendingQueue[0] || null);
    const [vivaMarks, setVivaMarks] = useState('');
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('teacher.exam-system.interview'), {
            search,
            test_id: selectedTestId || undefined,
        }, {
            preserveState: true,
        });
    };

    const handleSelectCandidate = (attempt) => {
        setSelectedAttempt(attempt);
        setVivaMarks(attempt.practical_marks !== null ? attempt.practical_marks : '');
        setRemarks(attempt.practical_remarks || '');
    };

    const handleSubmitViva = (e) => {
        e.preventDefault();
        if (!selectedAttempt) return;

        const maxPractical = selectedAttempt.online_test?.practical_marks ?? 5;
        if (vivaMarks === '' || Number(vivaMarks) < 0 || Number(vivaMarks) > maxPractical) {
            alert(`Please enter a valid viva mark between 0 and ${maxPractical}.`);
            return;
        }

        setSubmitting(true);
        router.post(route('teacher.exam-system.interview.submit', selectedAttempt.id), {
            practical_marks: Number(vivaMarks),
            practical_remarks: remarks,
        }, {
            preserveScroll: true,
            onFinish: () => setSubmitting(false),
            onSuccess: () => {
                setVivaMarks('');
                setRemarks('');
            },
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
                    <span className="text-slate-900 font-semibold">Practical & Viva Voce Evaluation Desk</span>
                </div>
            }
        >
            <Head title="Interview & Viva Desk - GTTI Exam System" />

            <div className="min-h-screen bg-[#070D12] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 antialiased">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Top Search & Filter Bar */}
                    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#C1902F] flex items-center justify-center shrink-0">
                                <Award className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-base font-black text-white">Viva Voce & Practical Assessment Desk</h1>
                                <p className="text-xs text-slate-400">Award interviewer marks to merge with computer MCQ scores</p>
                            </div>
                        </div>

                        {/* Search Input */}
                        <form onSubmit={handleSearch} className="flex items-center space-x-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-72">
                                <Search className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search candidate by CNIC..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:ring-1 focus:ring-amber-500 placeholder:text-slate-500 font-mono"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Main Evaluation Grid: Left Candidates Queue, Right Scoring Panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Queue of Candidates */}
                        <div className="space-y-4">
                            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                    <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
                                        <Clock className="h-4 w-4" />
                                        <span>Pending Viva Queue ({pendingQueue.length})</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-mono">Live Roster</span>
                                </div>

                                {pendingQueue.length > 0 ? (
                                    <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                                        {pendingQueue.map((attempt) => {
                                            const isSelected = selectedAttempt?.id === attempt.id;
                                            const student = attempt.student_profile?.user;
                                            return (
                                                <button
                                                    key={attempt.id}
                                                    type="button"
                                                    onClick={() => handleSelectCandidate(attempt)}
                                                    className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                                                        isSelected
                                                            ? 'bg-amber-500/15 border-[#C1902F] text-white ring-1 ring-amber-500/30'
                                                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-xs text-white truncate max-w-[150px]">
                                                            {student?.name || 'Candidate'}
                                                        </span>
                                                        <span className="font-mono text-[11px] font-bold text-amber-400">
                                                            MCQ: {attempt.score}/{attempt.total_questions}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                                                        CNIC: {student?.cnic}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                                        {attempt.online_test?.title}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-slate-500 text-xs">
                                        No candidates awaiting viva in this batch.
                                    </div>
                                )}
                            </div>

                            {/* Completed Viva Queue */}
                            {completedQueue.length > 0 && (
                                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-2">
                                    <span className="text-xs font-bold text-emerald-400 block pb-2 border-b border-slate-800">
                                        Evaluated Candidates ({completedQueue.length})
                                    </span>
                                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
                                        {completedQueue.map((c) => (
                                            <div
                                                key={c.id}
                                                onClick={() => handleSelectCandidate(c)}
                                                className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700"
                                            >
                                                <div>
                                                    <span className="font-bold text-slate-200 block text-xs">{c.student_profile?.user?.name}</span>
                                                    <span className="text-[10px] text-slate-500 font-mono">{c.student_profile?.user?.cnic}</span>
                                                </div>
                                                <span className="font-mono font-black text-emerald-400 text-xs">
                                                    {c.grand_total} ({c.percentage}%)
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Active Evaluation Canvas */}
                        <div className="lg:col-span-2 space-y-6">
                            {selectedAttempt ? (
                                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
                                    {/* Candidate Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <h2 className="text-xl font-black text-white">
                                                    {selectedAttempt.student_profile?.user?.name}
                                                </h2>
                                                <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-amber-400 font-mono text-xs border border-slate-700 font-bold">
                                                    {selectedAttempt.student_profile?.user?.cnic}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400">
                                                Father: {selectedAttempt.student_profile?.father_name || 'N/A'} • Batch: {selectedAttempt.online_test?.batch?.name}
                                            </p>
                                        </div>

                                        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center shrink-0">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Computer MCQ Score</span>
                                            <span className="text-xl font-mono font-black text-amber-400">
                                                {selectedAttempt.score}
                                                <span className="text-xs text-slate-500 font-sans"> / {selectedAttempt.total_questions}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Suggested Technical Questions */}
                                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                                        <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                                            <Sparkles className="h-4 w-4" />
                                            <span>Suggested Interview / Viva Voce Questions:</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                                            {SUGGESTED_QUESTIONS.slice(0, 4).map((q, idx) => (
                                                <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                                                    <span className="font-mono text-slate-500 font-bold mr-1">{idx + 1}.</span>
                                                    <span>{q}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Marks Awarding Form */}
                                    <form onSubmit={handleSubmitViva} className="space-y-4 text-xs">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block font-bold text-slate-300 mb-1.5">
                                                    Award Practical / Viva Marks (0 to {selectedAttempt.online_test?.practical_marks ?? 5}) *
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="0"
                                                    max={selectedAttempt.online_test?.practical_marks ?? 5}
                                                    step="0.5"
                                                    placeholder={`0 - ${selectedAttempt.online_test?.practical_marks ?? 5}`}
                                                    value={vivaMarks}
                                                    onChange={(e) => setVivaMarks(e.target.value)}
                                                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono text-base font-bold focus:ring-1 focus:ring-amber-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block font-bold text-slate-300 mb-1.5">
                                                    Interviewer Observations / Remarks
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Excellent practical wiring knowledge, confident delivery"
                                                    value={remarks}
                                                    onChange={(e) => setRemarks(e.target.value)}
                                                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-start space-x-2">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-blue-400" />
                                            <p>
                                                Submitting will instantly compute: <strong>MCQ ({selectedAttempt.score}) + Practical ({vivaMarks || 0})</strong> = Grand Total, and finalize PASS/FAIL status.
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-end space-x-3 pt-2">
                                            <button
                                                type="submit"
                                                disabled={submitting || vivaMarks === ''}
                                                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition disabled:opacity-40 shadow-lg flex items-center space-x-2"
                                            >
                                                <Send className="h-4 w-4" />
                                                <span>{submitting ? 'Calculating...' : 'Award Viva & Finalize Result'}</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="p-16 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
                                    <UserCircle className="h-12 w-12 text-slate-600 mx-auto" />
                                    <h3 className="text-base font-bold text-slate-400">Select a Candidate from the Queue</h3>
                                    <p className="text-xs text-slate-500">Pick any completed examinee on the left to conduct viva evaluation.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
