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
    HelpCircle,
    User,
    Award
} from 'lucide-react';

export default function TakeExam({
    attempt,
    candidate,
    exam,
    questions = [],
    remainingSeconds = 3600,
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState(attempt?.submitted_answers || {});
    const [timeLeft, setTimeLeft] = useState(remainingSeconds);
    const [confirmModal, setConfirmModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const timerRef = useRef(null);

    // Countdown Timer Engine
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

    const handleAutoSubmit = () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        router.post(route('admissions.cbt-exam.submit'), {
            attempt_id: attempt.id,
            answers: answers,
        }, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleManualSubmit = () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        router.post(route('admissions.cbt-exam.submit'), {
            attempt_id: attempt.id,
            answers: answers,
        }, {
            onFinish: () => {
                setIsSubmitting(false);
                setConfirmModal(false);
            },
        });
    };

    const handleSelectOption = (questionId, optionKey) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: optionKey,
        }));
    };

    // Format seconds to mm:ss
    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const currentQuestion = questions[currentIndex];
    const answeredCount = Object.keys(answers).length;
    const isUrgent = timeLeft < 300; // less than 5 minutes

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-govt-green selection:text-white font-sans">
            <Head title={`CBT Exam - ${exam.course_name}`} />

            {/* Top Fixed Candidate & Timer Header */}
            <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 shadow-xl">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Candidate Info */}
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 font-mono font-black text-sm">
                            {candidate.name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h2 className="font-bold text-white text-sm">{candidate.name}</h2>
                                <span className="px-2 py-0.2 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px] font-bold">
                                    {candidate.application_number}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono">
                                CNIC: {candidate.cnic} • {exam.course_name}
                            </p>
                        </div>
                    </div>

                    {/* Prominent Countdown Clock */}
                    <div className="flex items-center space-x-4">
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl border transition-all ${
                            isUrgent
                                ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 animate-pulse'
                                : 'bg-slate-800/80 border-slate-700 text-emerald-400'
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
                            className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-govt-green hover:bg-emerald-600 text-white font-bold text-xs transition shadow-md"
                        >
                            <Send className="h-3.5 w-3.5" />
                            <span>Finish & Submit</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Testing View */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Area: Active Question Canvas */}
                <div className="lg:col-span-3 space-y-6">
                    {currentQuestion ? (
                        <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
                            {/* Question Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                                <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 font-mono font-bold text-xs border border-emerald-500/20">
                                    Question {currentIndex + 1} of {questions.length}
                                </span>
                                <span className="text-xs text-slate-400 font-mono font-bold">
                                    Marks: {currentQuestion.marks}
                                </span>
                            </div>

                            {/* Question Text */}
                            <div className="text-base sm:text-lg font-bold text-white leading-relaxed">
                                {currentQuestion.question_text}
                            </div>

                            {/* Options List */}
                            <div className="space-y-3 pt-2">
                                {currentQuestion.options?.map((opt) => {
                                    const isSelected = answers[currentQuestion.id] === opt.key;
                                    return (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => handleSelectOption(currentQuestion.id, opt.key)}
                                            className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
                                                isSelected
                                                    ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-lg ring-1 ring-emerald-500/30'
                                                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                                            }`}
                                        >
                                            <div className={`h-6 w-6 rounded-full border flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 ${
                                                isSelected
                                                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                                    : 'border-slate-700 text-slate-400'
                                            }`}>
                                                {opt.key}
                                            </div>
                                            <div className="text-sm font-medium leading-relaxed">
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
                                        className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition"
                                    >
                                        <span>Next Question</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setConfirmModal(true)}
                                        className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-govt-green hover:bg-emerald-600 text-white font-black text-xs transition shadow-md"
                                    >
                                        <Send className="h-4 w-4" />
                                        <span>Submit Test</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-400">
                            No questions available for this exam.
                        </div>
                    )}
                </div>

                {/* Right Area: Question Grid Navigator */}
                <div className="space-y-6">
                    <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl p-5 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                                Question Palette
                            </h3>
                            <span className="text-[11px] font-mono text-emerald-400 font-bold">
                                {answeredCount}/{questions.length}
                            </span>
                        </div>

                        {/* Grid */}
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
                                                ? 'bg-blue-500 text-white ring-2 ring-blue-400 shadow-md'
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
                                <span className="h-3 w-3 rounded-md bg-blue-500" />
                                <span>Current</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setConfirmModal(true)}
                            className="w-full mt-4 py-3 px-4 rounded-xl bg-govt-green hover:bg-emerald-600 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 sm:hidden shadow-md"
                        >
                            <Send className="h-3.5 w-3.5" />
                            <span>Finish & Submit Test</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* Submit Confirmation Modal */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 text-center">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                            <Send className="h-6 w-6" />
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-white">
                                Submit Entrance Examination?
                            </h3>
                            <p className="text-xs text-slate-400">
                                You have answered <strong className="text-emerald-400">{answeredCount}</strong> out of <strong className="text-white">{questions.length}</strong> questions.
                            </p>
                        </div>

                        {answeredCount < questions.length && (
                            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs text-left flex items-start space-x-2">
                                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                                <p>
                                    You have {questions.length - answeredCount} unanswered questions remaining. Once submitted, answers cannot be modified.
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-center space-x-3 pt-3">
                            <button
                                type="button"
                                onClick={() => setConfirmModal(false)}
                                className="py-2.5 px-4 rounded-xl border border-slate-700 font-bold text-xs text-slate-300 hover:bg-slate-800"
                            >
                                Continue Test
                            </button>

                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleManualSubmit}
                                className="py-2.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition disabled:opacity-50 shadow-md"
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
