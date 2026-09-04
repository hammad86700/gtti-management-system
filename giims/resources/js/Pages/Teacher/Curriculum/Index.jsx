import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Calendar,
    BookOpen,
    CheckCircle2,
    Clock,
    Upload,
    Plus,
    FileText,
    Download,
    Layers,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Paperclip,
    ExternalLink,
    Wrench,
    GraduationCap,
    ArrowRight
} from 'lucide-react';
import Badge from '@/Components/UI/Badge';

export default function Index({ batch, course, lessons = [], stats = {} }) {
    const [selectedDay, setSelectedDay] = useState(lessons[0]?.day_number || 1);
    const [importModal, setImportModal] = useState(false);
    const [singleDayModal, setSingleDayModal] = useState(false);

    // Form for CSV bulk import
    const importForm = useForm({
        csv_file: null,
    });

    // Form for single day add/edit
    const singleDayForm = useForm({
        day_number: selectedDay || 1,
        scheduled_date: '',
        topic_title: '',
        theory_content: '',
        practical_task: '',
        resource_url: '',
        attachment: null,
    });

    const activeLesson = lessons.find((l) => l.day_number === selectedDay) || {
        day_number: selectedDay,
        topic_title: 'No lesson planned for this day yet',
        theory_content: 'Click "Plan Day Lesson" to specify learning objectives and theoretical points.',
        practical_task: 'Specify hands-on laboratory task or workshop machine assignment.',
        status: 'pending',
    };

    const handleImportSubmit = (e) => {
        e.preventDefault();
        importForm.post(route('curriculum.import', batch.id), {
            forceFormData: true,
            onSuccess: () => {
                setImportModal(false);
                importForm.reset();
            },
        });
    };

    const handleSingleDaySubmit = (e) => {
        e.preventDefault();
        singleDayForm.post(route('curriculum.store-lesson', batch.id), {
            forceFormData: true,
            onSuccess: () => {
                setSingleDayModal(false);
                singleDayForm.reset();
            },
        });
    };

    const handleToggleComplete = (lessonId) => {
        if (!lessonId) return;
        router.patch(route('curriculum.toggle-lesson', lessonId), {}, {
            preserveScroll: true,
        });
    };

    const handleOpenEditSingle = () => {
        singleDayForm.setData({
            day_number: activeLesson.day_number,
            scheduled_date: activeLesson.scheduled_date || '',
            topic_title: activeLesson.topic_title || '',
            theory_content: activeLesson.theory_content || '',
            practical_task: activeLesson.practical_task || '',
            resource_url: activeLesson.resource_url || '',
            attachment: null,
        });
        setSingleDayModal(true);
    };

    const downloadSampleCsv = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "DayNumber,TopicTitle,TheoryContent,PracticalTask\n"
            + "1,Workshop Orientation & Safety PPE,Overview of lab hazards personal protective gear emergency stops,Demonstration of machine guards and safety goggles inspection\n"
            + "2,Hand Tools Identification & Care,Classification of bench tools files chisels and mallets,Filing practice on mild steel workpiece measuring flatness with try-square\n"
            + "3,Precision Measuring Instruments,Principles of Vernier Caliper and Micrometer Vernier scale reading,Measuring outer and inner diameters of turned shaft samples\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Curriculum_Template_${course?.name || 'GTTI'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Curriculum Roadmap - ${batch.name}`} />

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Header Banner with Visual Progress Bar */}
                <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950 border border-slate-800 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-slate-950">
                                    DAY-BY-DAY CURRICULUM ROADMAP
                                </span>
                                <span className="text-xs text-emerald-400 font-mono">
                                    {course?.formatted_duration || `${course?.duration_value || 6} Months`}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                {batch.name} • {course?.name}
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-300">
                                Discipline: <strong>{course?.category || 'Vocational'}</strong> • Total Academic Days: <strong>{stats.total_days} Days</strong>
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                            {course?.syllabus_document_path && (
                                <a
                                    href={`/storage/${course.syllabus_document_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-sm transition border border-slate-700"
                                >
                                    <Download className="h-4 w-4 text-emerald-400" />
                                    <span>Master Syllabus PDF</span>
                                </a>
                            )}

                            <button
                                type="button"
                                onClick={() => setImportModal(true)}
                                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs shadow-sm transition border border-slate-700"
                            >
                                <Upload className="h-4 w-4" />
                                <span>Bulk Import (CSV)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    singleDayForm.reset();
                                    singleDayForm.setData('day_number', lessons.length + 1);
                                    setSingleDayModal(true);
                                }}
                                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition shadow-md"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Plan New Day</span>
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar Strip */}
                    <div className="mt-6 pt-6 border-t border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-300 font-semibold">
                                Syllabus Execution: <strong>{stats.completed_days} of {stats.total_days} Days Completed</strong> ({stats.progress_percent}%)
                            </span>
                            <span className="font-mono text-emerald-400 font-bold">
                                {stats.planned_days} Days Scheduled
                            </span>
                        </div>
                        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(stats.progress_percent, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Horizontal Scrollable Day Strip / Stepper */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-emerald-600" />
                            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                                Daily Instructional Sequence (Select Day)
                            </h3>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                            Scroll or click to inspect workshop agenda
                        </span>
                    </div>

                    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
                        {Array.from({ length: stats.total_days }, (_, i) => i + 1).map((dayNum) => {
                            const lesson = lessons.find((l) => l.day_number === dayNum);
                            const isCompleted = lesson?.status === 'completed';
                            const hasPlan = Boolean(lesson);
                            const isSelected = selectedDay === dayNum;

                            return (
                                <button
                                    key={dayNum}
                                    type="button"
                                    onClick={() => setSelectedDay(dayNum)}
                                    className={`shrink-0 flex flex-col items-center justify-center h-14 w-14 rounded-2xl border text-xs font-bold transition-all relative ${
                                        isSelected
                                            ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-400 ring-offset-1'
                                            : isCompleted
                                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                                            : hasPlan
                                            ? 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                                            : 'bg-slate-100/50 text-slate-400 border-dashed border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    <span className="text-[10px] uppercase font-mono font-medium opacity-80">Day</span>
                                    <span className="text-sm font-black">{dayNum}</span>
                                    {isCompleted && (
                                        <CheckCircle2 className={`h-3 w-3 absolute -top-1 -right-1 rounded-full ${isSelected ? 'text-amber-300 bg-slate-950' : 'text-emerald-600 bg-white'}`} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Day Briefing Card */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Lesson Agenda, Theory & Workshop Practical (8 cols) */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-900 text-white font-mono">
                                            DAY #{activeLesson.day_number}
                                        </span>
                                        {activeLesson.status === 'completed' ? (
                                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                <CheckCircle2 className="h-3 w-3" />
                                                <span>Completed on {activeLesson.completed_at ? new Date(activeLesson.completed_at).toLocaleDateString() : 'Schedule'}</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                                <Clock className="h-3 w-3" />
                                                <span>Pending Instruction</span>
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 mt-2">
                                        {activeLesson.topic_title}
                                    </h2>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        onClick={handleOpenEditSingle}
                                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                                    >
                                        Edit Day Plan
                                    </button>

                                    {activeLesson.id && (
                                        <button
                                            type="button"
                                            onClick={() => handleToggleComplete(activeLesson.id)}
                                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center space-x-1.5 ${
                                                activeLesson.status === 'completed'
                                                    ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                            }`}
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>{activeLesson.status === 'completed' ? 'Re-open as Pending' : 'Mark Day as Completed'}</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Theory Section */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                                    <BookOpen className="h-4 w-4 text-indigo-600" />
                                    <span>Theoretical Concept & Key Teaching Points</span>
                                </h4>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                                    {activeLesson.theory_content || 'No theoretical overview specified for this day.'}
                                </div>
                            </div>

                            {/* Workshop Practical Task Section */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                                    <Wrench className="h-4 w-4 text-emerald-600" />
                                    <span>Workshop Practical Assignment / Machine Exercise</span>
                                </h4>
                                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                                    {activeLesson.practical_task || 'No practical assignment configured for this day.'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Handouts, Resources & Attachments (4 cols) */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                                <Paperclip className="h-4 w-4 text-amber-500" />
                                <h3 className="font-bold text-sm text-slate-900">Handouts & Reference Assets</h3>
                            </div>

                            {activeLesson.attachment_path ? (
                                <a
                                    href={`/storage/${activeLesson.attachment_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs text-indigo-900 font-bold hover:bg-indigo-100 transition"
                                >
                                    <div className="flex items-center space-x-2">
                                        <FileText className="h-5 w-5 text-indigo-600" />
                                        <span>Download Day #{activeLesson.day_number} Handout</span>
                                    </div>
                                    <Download className="h-4 w-4 text-indigo-600" />
                                </a>
                            ) : (
                                <p className="text-xs text-slate-400">
                                    No lesson handout document uploaded for Day #{activeLesson.day_number}.
                                </p>
                            )}

                            {activeLesson.resource_url && (
                                <a
                                    href={activeLesson.resource_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-700 font-bold hover:bg-slate-100 transition"
                                >
                                    <div className="flex items-center space-x-2 truncate">
                                        <ExternalLink className="h-4 w-4 text-slate-500 shrink-0" />
                                        <span className="truncate">{activeLesson.resource_url}</span>
                                    </div>
                                </a>
                            )}

                            <button
                                type="button"
                                onClick={handleOpenEditSingle}
                                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center justify-center space-x-1"
                            >
                                <Upload className="h-3.5 w-3.5 text-slate-400" />
                                <span>Upload / Update Handout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSV Bulk Import Modal */}
            {importModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 space-y-5 shadow-2xl text-slate-900">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-black text-slate-900">Bulk Import Daily Syllabus</h3>
                                <p className="text-xs text-slate-500">Upload entire semester roadmap via CSV spreadsheet</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setImportModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                            <span className="font-bold block">CSV Format Requirement:</span>
                            <p className="text-[11px] leading-relaxed">
                                Columns must include: <code>DayNumber, TopicTitle, TheoryContent, PracticalTask</code>.
                            </p>
                            <button
                                type="button"
                                onClick={downloadSampleCsv}
                                className="inline-flex items-center space-x-1 font-bold text-amber-700 underline text-xs"
                            >
                                <Download className="h-3.5 w-3.5" />
                                <span>Download Pre-formatted Sample CSV Template</span>
                            </button>
                        </div>

                        <form onSubmit={handleImportSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Select CSV File *</label>
                                <input
                                    type="file"
                                    required
                                    accept=".csv,.txt"
                                    onChange={(e) => importForm.setData('csv_file', e.target.files[0])}
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setImportModal(false)}
                                    className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={importForm.processing}
                                    className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black transition disabled:opacity-50"
                                >
                                    {importForm.processing ? 'Importing...' : 'Upload & Generate Roadmap'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Single Day Plan Modal */}
            {singleDayModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 space-y-5 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    Plan Day #{singleDayForm.data.day_number} Lesson
                                </h3>
                                <p className="text-xs text-slate-500">Define theory objectives, practical tasks, and handouts</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSingleDayModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSingleDaySubmit} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Day Number *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="500"
                                        required
                                        value={singleDayForm.data.day_number}
                                        onChange={(e) => singleDayForm.setData('day_number', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Scheduled Date (Optional)</label>
                                    <input
                                        type="date"
                                        value={singleDayForm.data.scheduled_date}
                                        onChange={(e) => singleDayForm.setData('scheduled_date', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Topic Title *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Arc Welding Machine Setup & Electrode Selection"
                                    value={singleDayForm.data.topic_title}
                                    onChange={(e) => singleDayForm.setData('topic_title', e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Theoretical Concepts / Objectives</label>
                                <textarea
                                    rows="3"
                                    placeholder="Key theoretical principles, safety precautions, machine calculations..."
                                    value={singleDayForm.data.theory_content}
                                    onChange={(e) => singleDayForm.setData('theory_content', e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs leading-relaxed"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Workshop Practical / Lab Exercise</label>
                                <textarea
                                    rows="3"
                                    placeholder="Step-by-step hands-on job assignment for trainees on workshop bench..."
                                    value={singleDayForm.data.practical_task}
                                    onChange={(e) => singleDayForm.setData('practical_task', e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs leading-relaxed"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Reference URL / Video Link</label>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={singleDayForm.data.resource_url}
                                        onChange={(e) => singleDayForm.setData('resource_url', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Daily Handout (PDF / DOC)</label>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                                        onChange={(e) => singleDayForm.setData('attachment', e.target.files[0])}
                                        className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setSingleDayModal(false)}
                                    className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={singleDayForm.processing}
                                    className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black transition disabled:opacity-50"
                                >
                                    {singleDayForm.processing ? 'Saving...' : 'Save Lesson Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
