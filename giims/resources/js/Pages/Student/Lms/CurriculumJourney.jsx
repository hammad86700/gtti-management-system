import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    BookOpen,
    CheckCircle2,
    Clock,
    ChevronLeft,
    ChevronRight,
    FileText,
    Download,
    ExternalLink,
    Wrench,
    GraduationCap,
    Sparkles,
    Paperclip,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import Badge from '@/Components/UI/Badge';

export default function CurriculumJourney({
    enrollment,
    course,
    batch,
    lessons = [],
    selectedDayNumber = 1,
    currentLesson = null,
    stats = {}
}) {
    const totalDays = stats.total_days || 60;
    const [activeDay, setActiveDay] = useState(selectedDayNumber || 1);

    // Active lesson either from prop or found from lessons array
    const displayedLesson = lessons.find((l) => l.day_number === activeDay) || currentLesson || {
        day_number: activeDay,
        topic_title: 'Instructional Agenda in Preparation',
        theory_content: 'Your instructor will upload the lecture summary, theory objectives, and workshop practical tasks for this day soon.',
        practical_task: 'Workshop machine tools and practical equipment will be prepared for this day in the institute laboratory.',
        status: 'pending',
    };

    const handleDayChange = (dayNum) => {
        if (dayNum < 1 || dayNum > totalDays) return;
        setActiveDay(dayNum);
        router.get(route('student.curriculum.journey', { day: dayNum }), {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Calculate status indicator
    const isCompleted = displayedLesson.status === 'completed';
    const isToday = activeDay === (stats.completed_days + 1);

    return (
        <AuthenticatedLayout>
            <Head title={`Daily Curriculum Roadmap - ${course?.name || 'Trainee LMS'}`} />

            <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Back to LMS Home link */}
                <div className="flex items-center justify-between">
                    <Link
                        href={route('student.lms.index')}
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Return to Student LMS</span>
                    </Link>

                    <div className="flex items-center space-x-2 text-xs font-mono">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            {course?.formatted_duration || `${course?.duration_value || 6} Months`}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 font-semibold">{batch?.name}</span>
                    </div>
                </div>

                {/* Mobile-First Header with Status & Progress */}
                <div className="rounded-3xl bg-gradient-to-r from-[#003B15] via-[#004D1C] to-slate-900 border border-emerald-800 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400 text-slate-950">
                                INTERACTIVE LEARNING ROADMAP
                            </span>
                            <span className="text-xs text-emerald-200 font-mono">
                                Day {activeDay} of {totalDays}
                            </span>
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                {course?.name}
                            </h1>
                            <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                                {course?.trade?.program?.department?.name || 'Technical Wing'} • Batch: <strong>{batch?.name}</strong>
                            </p>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1.5 pt-2">
                            <div className="flex items-center justify-between text-xs text-emerald-200 font-medium">
                                <span>Batch Progress: <strong>{stats.completed_days} of {totalDays} Days Completed</strong></span>
                                <span className="font-mono font-bold text-amber-300">{stats.progress_percent}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-emerald-950/80 rounded-full overflow-hidden border border-emerald-700/60 p-0.5">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(stats.progress_percent || 0, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interactive Stepper & Day Navigator */}
                <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        {/* Previous Day Button */}
                        <button
                            type="button"
                            onClick={() => handleDayChange(activeDay - 1)}
                            disabled={activeDay <= 1}
                            className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 text-xs font-bold transition shrink-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Previous Day</span>
                        </button>

                        {/* Quick Jump Selector */}
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-slate-500 font-semibold hidden md:inline">Jump to Day:</span>
                            <select
                                value={activeDay}
                                onChange={(e) => handleDayChange(Number(e.target.value))}
                                className="py-1.5 px-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-black text-xs font-mono"
                            >
                                {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => {
                                    const lesson = lessons.find((l) => l.day_number === d);
                                    return (
                                        <option key={d} value={d}>
                                            Day {d} {lesson?.status === 'completed' ? '✓' : ''} - {lesson?.topic_title ? lesson.topic_title.slice(0, 30) + '...' : 'Lesson'}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Next Day Button */}
                        <button
                            type="button"
                            onClick={() => handleDayChange(activeDay + 1)}
                            disabled={activeDay >= totalDays}
                            className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 text-xs font-bold transition shrink-0"
                        >
                            <span className="hidden sm:inline">Next Day</span>
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Scrollable Day Pills Carousel */}
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin pt-2 border-t border-slate-100">
                        {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => {
                            const lesson = lessons.find((l) => l.day_number === d);
                            const done = lesson?.status === 'completed';
                            const isSelected = activeDay === d;

                            return (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => handleDayChange(d)}
                                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 border ${
                                        isSelected
                                            ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm ring-2 ring-emerald-400'
                                            : done
                                            ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    <span>Day {d}</span>
                                    {done && <CheckCircle2 className="h-3 w-3 text-emerald-600 inline" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Daily Lesson Card */}
                <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                    {/* Lesson Header Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                                <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-900 text-white font-mono">
                                    DAY #{displayedLesson.day_number}
                                </span>
                                {isCompleted ? (
                                    <span className="inline-flex items-center space-x-1 px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>Completed</span>
                                    </span>
                                ) : isToday ? (
                                    <span className="inline-flex items-center space-x-1 px-3 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                                        <Clock className="h-3.5 w-3.5 animate-spin" />
                                        <span>Today's Active Agenda</span>
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center space-x-1 px-3 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                        <span>Upcoming Lesson</span>
                                    </span>
                                )}
                            </div>

                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                                {displayedLesson.topic_title}
                            </h2>
                        </div>

                        {displayedLesson.scheduled_date && (
                            <span className="text-xs text-slate-500 font-medium shrink-0 flex items-center space-x-1">
                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                <span>{new Date(displayedLesson.scheduled_date).toLocaleDateString()}</span>
                            </span>
                        )}
                    </div>

                    {/* Theoretical Overview */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                            <BookOpen className="h-4 w-4 text-indigo-600" />
                            <span>Theoretical Overview & Key Concepts</span>
                        </h3>
                        <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                            {displayedLesson.theory_content || 'No detailed lecture notes provided for this day.'}
                        </div>
                    </div>

                    {/* Workshop Practical Task */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                            <Wrench className="h-4 w-4 text-emerald-600" />
                            <span>Workshop Practical Task & Hands-on Job Assignment</span>
                        </h3>
                        <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs sm:text-sm text-slate-900 leading-relaxed whitespace-pre-line font-medium">
                            {displayedLesson.practical_task || 'No workshop assignment specified for this day.'}
                        </div>
                    </div>

                    {/* Resource Download Hub */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                            <Paperclip className="h-4 w-4 text-amber-500" />
                            <span>Resource Download Hub & References</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {displayedLesson.attachment_path ? (
                                <a
                                    href={`/storage/${displayedLesson.attachment_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition flex items-center justify-between text-xs text-emerald-950 font-bold shadow-xs"
                                >
                                    <div className="flex items-center space-x-2.5">
                                        <FileText className="h-5 w-5 text-emerald-700" />
                                        <div>
                                            <p className="font-black">Download Day #{displayedLesson.day_number} Handout</p>
                                            <p className="text-[10px] text-emerald-700 font-medium">Lab manual / reference PDF</p>
                                        </div>
                                    </div>
                                    <Download className="h-4 w-4 text-emerald-700" />
                                </a>
                            ) : (
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-400">
                                    No handout attachment uploaded for Day #{displayedLesson.day_number}.
                                </div>
                            )}

                            {displayedLesson.resource_url && (
                                <a
                                    href={displayedLesson.resource_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition flex items-center justify-between text-xs text-slate-700 font-bold truncate shadow-xs"
                                >
                                    <div className="flex items-center space-x-2 truncate">
                                        <ExternalLink className="h-4 w-4 text-indigo-600 shrink-0" />
                                        <span className="truncate">{displayedLesson.resource_url}</span>
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
