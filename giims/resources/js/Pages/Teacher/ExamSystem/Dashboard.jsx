import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    ClipboardList,
    BarChart3,
    Plus,
    RefreshCw,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Clock3,
    FileText,
    UploadCloud,
    Eye,
    Check,
    ChevronRight,
    BookOpen,
    Play,
    Pause,
    Award,
    Sun,
    Moon,
    FileSpreadsheet,
    FileDown,
    ExternalLink
} from 'lucide-react';

export default function Dashboard({ batches = [], exams = [], stats = {} }) {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('gtti-dark-mode') === 'true');
    const [createModal, setCreateModal] = useState(false);
    const [uploadModal, setUploadModal] = useState(false);
    const [selectedExamId, setSelectedExamId] = useState(null);
    const [csvFile, setCsvFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [togglingId, setTogglingId] = useState(null);

    // Dark mode state effect
    useEffect(() => {
        localStorage.setItem('gtti-dark-mode', darkMode.toString());
    }, [darkMode]);

    // Exam Create Form
    const { data, setData, post, processing, errors, reset } = useForm({
        batch_id: batches[0]?.id || '',
        title: '',
        description: '',
        duration_minutes: 30,
        question_pool_size: 30,
        practical_marks: 5,
        passing_percentage: 50,
    });

    const handleCreateExam = (e) => {
        e.preventDefault();
        post(route('teacher.exam-system.exams.store'), {
            onSuccess: () => {
                setCreateModal(false);
                reset();
            },
        });
    };

    const handleToggleLive = (examId) => {
        setTogglingId(examId);
        router.post(route('teacher.exam-system.exams.toggle-live', examId), {}, {
            preserveScroll: true,
            onFinish: () => setTogglingId(null),
        });
    };

    const handleCsvUpload = (e) => {
        e.preventDefault();
        if (!csvFile || !selectedExamId) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', csvFile);

        router.post(route('teacher.exam-system.exams.bulk-upload', selectedExamId), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setUploadModal(false);
                setCsvFile(null);
            },
            onFinish: () => setIsUploading(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2 text-xs font-medium">
                        <span className="font-bold text-[#C1902F]">GTTI Exam System</span>
                        <span>/</span>
                        <span className="text-slate-900 font-semibold">Teacher Cockpit & Randomization Hub</span>
                    </div>

                    {/* Dark / Light Mode Switch */}
                    <button
                        type="button"
                        onClick={() => setDarkMode(!darkMode)}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center space-x-2 transition ${
                            darkMode
                                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                        title="Toggle SaaS Dark/Light Theme"
                    >
                        {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
                        <span className="hidden sm:inline">{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
                    </button>
                </div>
            }
        >
            <Head title="GTTI Exam System - Teacher Cockpit" />

            <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${
                darkMode ? 'bg-[#070D12] text-slate-100' : 'bg-slate-50 text-slate-900'
            }`}>
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header SaaS Hero Banner */}
                    <div className={`rounded-3xl p-6 sm:p-8 border shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                        darkMode
                            ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border-slate-800 text-white'
                            : 'bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white border-slate-700'
                    }`}>
                        <div className="space-y-2 relative z-10 max-w-2xl">
                            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-amber-400/20 text-[#C1902F] border border-amber-400/30">
                                Institutional Local Intranet Hub (0.0.0.0)
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                                GTTI Examination & Viva Control Cockpit
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                Offline-first testing engine supporting dynamic question-pool sampling, deterministic option randomization, instant auto-grading, and practical / viva marks merging.
                            </p>
                        </div>

                        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
                            <Link
                                href={route('teacher.exam-system.interview')}
                                className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg"
                            >
                                <Award className="h-4 w-4" />
                                <span>Viva / Interview Desk</span>
                            </Link>

                            <button
                                type="button"
                                onClick={() => setCreateModal(true)}
                                className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs shadow-lg transition"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Create New Exam</span>
                            </button>
                        </div>
                    </div>

                    {/* KPI Statistics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className={`p-5 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
                            <span className="text-[10px] font-bold uppercase text-slate-400">Total Exams</span>
                            <p className="text-2xl font-black mt-1">{stats.total_exams || 0}</p>
                        </div>

                        <div className={`p-5 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
                            <span className="text-[10px] font-bold uppercase text-emerald-400">Live in Lab</span>
                            <p className="text-2xl font-black text-emerald-400 mt-1">{stats.live_exams || 0}</p>
                        </div>

                        <div className={`p-5 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
                            <span className="text-[10px] font-bold uppercase text-amber-400">Total Attempts</span>
                            <p className="text-2xl font-black text-amber-400 mt-1">{stats.total_attempts || 0}</p>
                        </div>

                        <div className={`p-5 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
                            <span className="text-[10px] font-bold uppercase text-blue-400">Question Bank</span>
                            <p className="text-2xl font-black text-blue-400 mt-1">{stats.total_questions || 0}</p>
                        </div>
                    </div>

                    {/* Exams Roster Table */}
                    <div className={`rounded-3xl border shadow-sm overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
                        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold">Active CBT Examinations</h2>
                                <p className="text-xs text-slate-500">Instructor command centers with real-time live switches</p>
                            </div>

                            <a
                                href={route('exam-system.login')}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-500 hover:text-amber-400 transition"
                            >
                                <span>Open Student Lab Terminal</span>
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        </div>

                        {exams.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className={`uppercase font-bold tracking-wider text-[10px] border-b ${
                                        darkMode ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-gray-50 text-gray-600 border-gray-200'
                                    }`}>
                                        <tr>
                                            <th className="py-3 px-4">Exam Title & Trade</th>
                                            <th className="py-3 px-4">Duration & Viva</th>
                                            <th className="py-3 px-4">Question Sampling</th>
                                            <th className="py-3 px-4">Completed / Passed</th>
                                            <th className="py-3 px-4">Lab State</th>
                                            <th className="py-3 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${darkMode ? 'divide-slate-800 text-slate-200' : 'divide-gray-100 text-gray-700'}`}>
                                        {exams.map((exam) => (
                                            <tr key={exam.id} className={`transition ${darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-gray-50'}`}>
                                                <td className="py-4 px-4">
                                                    <div className="font-bold text-sm text-white dark:text-white text-gray-900">{exam.title}</div>
                                                    <div className="text-[11px] text-slate-400">
                                                        {exam.course_name} • <strong className="text-slate-300">{exam.batch_name}</strong>
                                                    </div>
                                                </td>

                                                <td className="py-4 px-4">
                                                    <div className="font-semibold flex items-center space-x-1">
                                                        <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                                                        <span>{exam.duration_minutes} Mins</span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-400">
                                                        Viva Max: <strong className="text-blue-400">{exam.practical_marks} Marks</strong>
                                                    </div>
                                                </td>

                                                <td className="py-4 px-4">
                                                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                                                        {exam.question_pool_size ? `${exam.question_pool_size} from ${exam.questions_count}` : `${exam.questions_count} Total`}
                                                    </span>
                                                </td>

                                                <td className="py-4 px-4">
                                                    <div className="font-mono font-bold">
                                                        {exam.passed_count} / {exam.attempts_count} Passed
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-sans">
                                                        Avg: {exam.average_percentage}%
                                                    </div>
                                                </td>

                                                <td className="py-4 px-4">
                                                    {exam.is_live ? (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-slate-950 animate-pulse">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-slate-950" />
                                                            <span>LIVE IN LAB</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700">
                                                            <span>LOCKED / DRAFT</span>
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                                                    {/* Toggle Live Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleLive(exam.id)}
                                                        disabled={togglingId === exam.id}
                                                        className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition ${
                                                            exam.is_live
                                                                ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                                                                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                                        }`}
                                                        title={exam.is_live ? 'Deactivate (Lock)' : 'Activate (Go Live)'}
                                                    >
                                                        {exam.is_live ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                                                        <span>{exam.is_live ? 'Lock' : 'Go Live'}</span>
                                                    </button>

                                                    {/* Upload CSV */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedExamId(exam.id);
                                                            setUploadModal(true);
                                                        }}
                                                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold text-xs transition border border-slate-700"
                                                        title="Import Question Bank CSV"
                                                    >
                                                        <UploadCloud className="h-3.5 w-3.5 text-blue-400" />
                                                        <span>Import MCQs</span>
                                                    </button>

                                                    {/* View Results */}
                                                    <Link
                                                        href={route('teacher.exam-system.results', exam.id)}
                                                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-800 text-amber-400 hover:bg-slate-700 font-bold text-xs transition border border-slate-700"
                                                    >
                                                        <BarChart3 className="h-3.5 w-3.5" />
                                                        <span>Results</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-16 text-center space-y-3">
                                <FileText className="h-12 w-12 text-slate-400 mx-auto" />
                                <h3 className="text-base font-bold">No Examinations Configured</h3>
                                <p className="text-xs text-slate-500">Create your first CBT test with random question sampling.</p>
                                <button
                                    type="button"
                                    onClick={() => setCreateModal(true)}
                                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#C1902F] text-slate-950 font-bold text-xs shadow-md"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>Create Exam</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Exam Modal */}
            {createModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className={`w-full max-w-lg rounded-3xl border p-6 sm:p-8 space-y-5 shadow-2xl ${
                        darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-slate-900'
                    }`}>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                            <div>
                                <h3 className="text-lg font-black">Configure New Examination</h3>
                                <p className="text-xs text-slate-400">Set duration, question pool size, and viva marks</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCreateModal(false)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold mb-1">Target Training Batch *</label>
                                <select
                                    value={data.batch_id}
                                    onChange={(e) => setData('batch_id', e.target.value)}
                                    className={`w-full p-2.5 rounded-xl border text-xs font-bold ${
                                        darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-slate-900'
                                    }`}
                                    required
                                >
                                    {batches.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name} ({b.course?.name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold mb-1">Exam Title *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Mid-Term Theory Assessment 2026"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className={`w-full p-2.5 rounded-xl border ${
                                        darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-slate-900'
                                    }`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1">Duration (Minutes) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="5"
                                        max="300"
                                        value={data.duration_minutes}
                                        onChange={(e) => setData('duration_minutes', e.target.value)}
                                        className={`w-full p-2.5 rounded-xl border ${
                                            darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-slate-900'
                                        }`}
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold mb-1">Question Pool Sample Size</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="e.g. 30 (from 100)"
                                        value={data.question_pool_size}
                                        onChange={(e) => setData('question_pool_size', e.target.value)}
                                        className={`w-full p-2.5 rounded-xl border ${
                                            darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-slate-900'
                                        }`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold mb-1">Practical / Viva Marks *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max="100"
                                        value={data.practical_marks}
                                        onChange={(e) => setData('practical_marks', e.target.value)}
                                        className={`w-full p-2.5 rounded-xl border ${
                                            darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-slate-900'
                                        }`}
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold mb-1">Passing Percentage (%) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="100"
                                        value={data.passing_percentage}
                                        onChange={(e) => setData('passing_percentage', e.target.value)}
                                        className={`w-full p-2.5 rounded-xl border ${
                                            darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-slate-900'
                                        }`}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-700/50">
                                <button
                                    type="button"
                                    onClick={() => setCreateModal(false)}
                                    className="py-2.5 px-4 rounded-xl border border-slate-700 font-bold text-slate-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#C1902F] to-amber-500 hover:from-amber-400 text-slate-950 font-black transition disabled:opacity-50 shadow-md"
                                >
                                    {processing ? 'Creating...' : 'Create Examination'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload CSV Modal */}
            {uploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className={`w-full max-w-md rounded-3xl border p-6 sm:p-8 space-y-5 shadow-2xl ${
                        darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-slate-900'
                    }`}>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                            <div>
                                <h3 className="text-base font-black">Import Question Bank CSV</h3>
                                <p className="text-xs text-slate-400">Upload multiple choice questions in bulk</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setUploadModal(false)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCsvUpload} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold mb-2">Select CSV / Excel File</label>
                                <input
                                    type="file"
                                    accept=".csv,.txt"
                                    required
                                    onChange={(e) => setCsvFile(e.target.files[0])}
                                    className="w-full text-xs file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500/10 file:text-[#C1902F] hover:file:bg-amber-500/20 cursor-pointer"
                                />
                            </div>

                            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 space-y-1">
                                <span className="font-bold block">Standard CSV Column Format:</span>
                                <code>Question, Option A, Option B, Option C, Option D, Correct Option (A/B/C/D), Marks</code>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-700/50">
                                <button
                                    type="button"
                                    onClick={() => setUploadModal(false)}
                                    className="py-2.5 px-4 rounded-xl border border-slate-700 font-bold text-slate-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!csvFile || isUploading}
                                    className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition disabled:opacity-50 shadow-md"
                                >
                                    {isUploading ? 'Importing MCQs...' : 'Upload & Import'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
