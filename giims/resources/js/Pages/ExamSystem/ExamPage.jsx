import { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Clock,
    CheckCircle2,
    AlertTriangle,
    Shield,
    ChevronLeft,
    ChevronRight,
    Send,
    User,
    ShieldAlert,
    HelpCircle
} from 'lucide-react';

export default function ExamPage({
    attempt,
    candidate,
    test,
    questions = [],
    remainingSeconds = 1800,
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState(attempt?.answers || {});
    const [timeLeft, setTimeLeft] = useState(remainingSeconds);
    const [confirmModal, setConfirmModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [warnings, setWarnings] = useState(attempt?.warning_count || 0);
    const [warningAlert, setWarningAlert] = useState(false);
    const timerRef = useRef(null);

    // ============================================================
    // COUNTDOWN TIMER ENGINE & AUTO-SUBMISSION
    // ============================================================
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, []);

    // ============================================================
    // ANTI-CHEAT TAB SWITCH / BLUR DETECTION
    // ============================================================
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && !isSubmitting) {
                setWarnings((prev) => {
                    const newCount = prev + 1;
                    // Log warning to server asynchronously
                    fetch(route('exam-system.warning', test.id), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        },
                        body: JSON.stringify({ attempt_id: attempt.id }),
                    });
                    return newCount;
                });
                setWarningAlert(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [test.id, attempt.id, isSubmitting]);

    const handleSelectOption = (questionId, optionKey) => {
        setAnswers((prev) => {
            const updated = { ...prev, [questionId]: optionKey };
            // Auto-save answer to server
            fetch(route('exam-system.save-answer', test.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    attempt_id: attempt.id,
                    question_id: questionId,
                    selected_key: optionKey,
                }),
            });
            return updated;
        });
    };

    const handleAutoSubmit = () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        router.post(route('exam-system.submit', test.id), {
            attempt_id: attempt.id,
            answers: answers,
        }, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleManualSubmit = () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        router.post(route('exam-system.submit', test.id), {
            attempt_id: attempt.id,
            answers: answers,
        }, {
            onFinish: () => {
                setIsSubmitting(false);
                setConfirmModal(false);
            },
        });
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const currentQ = questions[currentIndex];
    const answeredCount = Object.keys(answers).length;
    const isUrgent = timeLeft < 300; // Less than 5 minutes

    return (
        <div className="min-h-screen bg-[#070D12] text-slate-100 flex flex-col justify-between selection:bg-[#C1902F] selection:text-white font-sans antialiased">
            <Head title={`CBT Examination - ${test.title}`} />

            {/* Top Fixed Candidate & Timer Header */}
            <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 shadow-xl">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Candidate Identity */}
                    <div className="flex items-center space-x-3.5">
                        <div className="h-11 w-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#C1902F] shrink-0 font-mono font-black text-base shadow-inner">
                            {candidate.name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h2 className="font-bold text-white text-sm">{candidate.name}</h2>
                                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-400 font-mono text-[10px] font-bold border border-slate-700">
                                    {candidate.cnic}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                                {candidate.course} • <strong className="text-slate-300">{candidate.batch}</strong>
                            </p>
                        </div>
                    </div>

                    {/* Timer & Submit Group */}
                    <div className="flex items-center space-x-4">
                        {/* Anti-Cheat Alert Counter */}
                        {warnings > 0 && (
                            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold animate-pulse">
                                <ShieldAlert className="h-4 w-4 text-rose-400" />
                                <span>{warnings} Warnings</span>
                            </div>
                        )}

                        {/* Live Countdown Clock */}
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl border transition-all ${
                            isUrgent
                                ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 animate-pulse'
                                : 'bg-slate-800/90 border-slate-700 text-emerald-400'
                        }`}>
                            <Clock className="h-5 w-5 shrink-0" />
                            <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider block text-slate-400">
                                    Time Remaining
                                </span>
                                <span className="text-xl font-black font-mono tracking-wider">
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setConfirmModal(true)}
                            className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-govt-green hover:from-emerald-400 hover:to-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg"
                        >
                            <Send className="h-3.5 w-3.5" />
                            <span>Finish & Submit</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Anti-Cheat Warning Popup Alert */}
            {warningAlert && (
                <div className="max-w-4xl mx-auto w-full px-4 pt-4">
                    <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between shadow-xl">
                        <div className="flex items-center space-x-2.5">
                            <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />
                            <div>
                                <strong className="text-white block">Security Warning: Screen Blur / Tab Switch Detected</strong>
                                <span>Leaving the exam tab is prohibited and logged to the central instructor monitor. (Warning #{warnings})</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setWarningAlert(false)}
                            className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700"
                        >
                            I Understand
                        </button>
                    </div>
                </div>
            )}

            {/* Main Testing View */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Area: Active Question Canvas */}
                <div className="lg:col-span-3 space-y-6">
                    {currentQ ? (
                        <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
                            {/* Question Meta Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                                <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-[#C1902F] font-mono font-bold text-xs border border-amber-500/20">
                                    Question {currentIndex + 1} of {questions.length}
                                </span>
                                <span className="text-xs text-slate-400 font-mono font-bold">
                                    Marks: {currentQ.marks}
                                </span>
                            </div>

                            {/* Question Text */}
                            <div className="text-base sm:text-lg font-bold text-white leading-relaxed">
                                {currentQ.question_text}
                            </div>

                            {/* Options List */}
                            <div className="space-y-3 pt-2">
                                {currentQ.options?.map((opt) => {
                                    const isSelected = answers[currentQ.id] === opt.key;
                                    return (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => handleSelectOption(currentQ.id, opt.key)}
                                            className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start space-x-3.5 ${
                                                isSelected
                                                    ? 'bg-amber-500/15 border-[#C1902F] text-white shadow-lg ring-1 ring-[#C1902F]/30'
                                                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                                            }`}
                                        >
                                            <div className={`h-7 w-7 rounded-full border flex items-center justify-center font-mono font-black text-xs shrink-0 mt-0.5 ${
                                                isSelected
                                                    ? 'bg-[#C1902F] border-[#C1902F] text-slate-950'
                                                    : 'border-slate-700 text-slate-400'
                                            }`}>
                                                {opt.key}
                                            </div>
                                            <div className="text-sm font-medium leading-relaxed pt-0.5">
                                                {opt.text}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Navigation Bar */}
                            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                                <button
                                    type="button"
                                    disabled={currentIndex === 0}
                                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold text-xs disabled:opacity-30 transition"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span>Previous</span>
                                </button>

                                <div className="text-xs text-slate-500 font-mono">
                                    {answeredCount} of {questions.length} answered
                                </div>

                                {currentIndex < questions.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                                        className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md"
                                    >
                                        <span>Next Question</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setConfirmModal(true)}
                                        className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-govt-green hover:from-emerald-400 text-slate-950 font-black text-xs transition shadow-md"
                                    >
                                        <Send className="h-4 w-4" />
                                        <span>Submit Exam</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-400">
                            No questions available.
                        </div>
                    )}
                </div>

                {/* Right Area: Question Palette Grid */}
                <div className="space-y-6">
                    <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl p-5 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                                Question Palette
                            </h3>
                            <span className="text-[11px] font-mono text-amber-400 font-bold">
                                {answeredCount}/{questions.length}
                            </span>
                        </div>

                        {/* Number Grid */}
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((q, idx) => {
                                const isAnswered = !isSubmitting && answers[q.id] !== undefined;
                                const isCurrent = idx === currentIndex;

                                return (
                                    <button
                                        key={q.id}
                                        type="button"
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`h-9 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center ${
                                            isCurrent
                                                ? 'bg-[#C1902F] text-slate-950 ring-2 ring-amber-400 shadow-md'
                                                : isAnswered
                                                    ? 'bg-emerald-500 text-slate-950'
                                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                            <div className="flex items-center space-x-1.5">
                                <span className="h-3 w-3 rounded-md bg-emerald-500" />
                                <span>Answered</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <span className="h-3 w-3 rounded-md bg-slate-800" />
                                <span>Unanswered</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <span className="h-3 w-3 rounded-md bg-[#C1902F]" />
                                <span>Current</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setConfirmModal(true)}
                            className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-govt-green hover:from-emerald-400 text-slate-950 font-black text-xs transition flex items-center justify-center space-x-1.5 sm:hidden shadow-md"
                        >
                            <Send className="h-3.5 w-3.5" />
                            <span>Finish & Submit Exam</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* Final Submission Modal */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 text-center">
                        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#C1902F] flex items-center justify-center mx-auto">
                            <Send className="h-6 w-6" />
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-white">
                                Submit CBT Examination?
                            </h3>
                            <p className="text-xs text-slate-400">
                                You have answered <strong className="text-emerald-400">{answeredCount}</strong> out of <strong className="text-white">{questions.length}</strong> questions.
                            </p>
                        </div>

                        {answeredCount < questions.length && (
                            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs text-left flex items-start space-x-2">
                                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                                <p>
                                    You have {questions.length - answeredCount} unanswered questions remaining. Answers cannot be modified once submitted.
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-center space-x-3 pt-3">
                            <button
                                type="button"
                                onClick={() => setConfirmModal(false)}
                                className="py-2.5 px-4 rounded-xl border border-slate-700 font-bold text-xs text-slate-300 hover:bg-slate-800"
                            >
                                Return to Exam
                            </button>

                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleManualSubmit}
                                className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-govt-green hover:from-emerald-400 text-slate-950 font-black text-xs transition disabled:opacity-50 shadow-md"
                            >
                                {isSubmitting ? 'Grading Answers...' : 'Confirm Submission'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
