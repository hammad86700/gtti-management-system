import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    User,
    Award,
    BookOpen,
    HelpCircle,
    CheckCircle2,
    ArrowLeft,
    AlertCircle,
    Shield,
    Sparkles,
    Send
} from 'lucide-react';
import InputError from '@/Components/InputError';

export default function Evaluate({ attempt, candidate, course, questions = [] }) {
    const maxMarks = course?.interview_max_marks || 10;

    const { data, setData, post, processing, errors } = useForm({
        interview_score: attempt?.interview_score ?? '',
        interview_remarks: attempt?.interview_remarks ?? '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('interviewer.viva.submit', attempt.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Evaluate Viva - ${candidate.name}`} />

            <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Back Link */}
                <div className="flex items-center justify-between">
                    <Link
                        href={route('interviewer.viva.index', course?.id)}
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Return to Viva Queue</span>
                    </Link>

                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200">
                        Active Examination Session
                    </span>
                </div>

                {/* Candidate Overview Card */}
                <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 text-white p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-govt-green flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shrink-0">
                                {candidate.name.charAt(0)}
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                                    App #{attempt.application_number}
                                </span>
                                <h1 className="text-2xl font-black text-white">{candidate.name}</h1>
                                <p className="text-xs text-slate-400">
                                    S/O {candidate.father_name} • CNIC: <span className="font-mono text-slate-300">{candidate.cnic}</span>
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Applied Program</span>
                            <p className="font-bold text-white text-sm">{course?.name}</p>
                            <span className="text-[10px] text-emerald-400 font-mono">
                                Weightage: Matric ({course?.matric_weightage}%) + CBT ({course?.test_weightage}%) + Viva ({course?.interview_weightage}%)
                            </span>
                        </div>
                    </div>

                    {/* Score Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Matric Obtained</span>
                            <p className="font-mono font-black text-lg text-white mt-0.5">
                                {candidate.matric_marks ?? '—'} <span className="text-xs text-slate-500 font-sans">/ {candidate.total_matric_marks}</span>
                            </p>
                            {candidate.matric_percentage && (
                                <span className="text-[10px] text-emerald-400 font-mono">({candidate.matric_percentage}%)</span>
                            )}
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">CBT Test Score</span>
                            <p className="font-mono font-black text-lg text-emerald-400 mt-0.5">
                                {candidate.cbt_score} <span className="text-xs text-slate-500 font-sans">/ {candidate.cbt_total}</span>
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">Institutional CBT</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Interview Max</span>
                            <p className="font-mono font-black text-lg text-indigo-400 mt-0.5">
                                {maxMarks} <span className="text-xs text-slate-500 font-sans">Marks</span>
                            </p>
                            <span className="text-[10px] text-indigo-300 font-mono">{course?.interview_weightage}% Weightage</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Interview Venue</span>
                            <p className="font-bold text-xs text-amber-300 mt-1 truncate">
                                {course?.interview_venue}
                            </p>
                            <span className="text-[10px] text-slate-400">Oral Defense</span>
                        </div>
                    </div>
                </div>

                {/* Questions & Evaluation Form Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Recommended Interview Questions Bank (7 cols) */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                                <HelpCircle className="h-5 w-5 text-emerald-600" />
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900">
                                        Trade Viva Question Prompts
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        Curated questions randomly selected from the course question bank
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {questions.map((q, index) => (
                                    <div
                                        key={q.id || index}
                                        className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 hover:bg-slate-50/90 transition"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                                Question #{index + 1}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-mono">Viva Prompt</span>
                                        </div>
                                        <p className="text-xs text-slate-800 font-medium leading-relaxed">
                                            {q.question_text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Examiner Marks Entry Form (5 cols) */}
                    <div className="lg:col-span-5">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 sticky top-6">
                            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                                <Award className="h-5 w-5 text-indigo-600" />
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900">Examiner Evaluation</h3>
                                    <p className="text-[11px] text-slate-400">Award marks out of {maxMarks}</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Viva Marks Awarded (Max: {maxMarks}) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            max={maxMarks}
                                            required
                                            value={data.interview_score}
                                            onChange={(e) => setData('interview_score', e.target.value)}
                                            placeholder={`0 to ${maxMarks}`}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-lg font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 shadow-xs"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">
                                            / {maxMarks}
                                        </span>
                                    </div>
                                    <InputError message={errors.interview_score} className="mt-1" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Examiner Observations & Remarks
                                    </label>
                                    <textarea
                                        rows="4"
                                        value={data.interview_remarks}
                                        onChange={(e) => setData('interview_remarks', e.target.value)}
                                        placeholder="Note candidate's communication skills, technical grasp, enthusiasm, or disciplinary observations..."
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 shadow-xs"
                                    />
                                    <InputError message={errors.interview_remarks} className="mt-1" />
                                </div>

                                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 space-y-1">
                                    <span className="font-bold block">Instant Composite Calculation:</span>
                                    <p className="text-indigo-800/90 leading-relaxed">
                                        Submitting this evaluation immediately calculates the candidate's combined merit standing and releases the concurrency lock.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-govt-green hover:from-emerald-500 hover:to-emerald-700 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                                >
                                    <Send className="h-4 w-4" />
                                    <span>{processing ? 'Calculating & Saving...' : 'Submit Evaluation & Unlock'}</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
