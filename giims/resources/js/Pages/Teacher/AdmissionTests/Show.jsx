import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Play,
    Pause,
    UploadCloud,
    Plus,
    CheckCircle2,
    XCircle,
    Clock,
    Users,
    FileSpreadsheet,
    Award,
    MapPin,
    AlertTriangle,
    Trash2,
    Calculator,
    Save,
    Check,
    Computer,
    Wrench,
    ArrowLeft,
    Sparkles
} from 'lucide-react';

export default function Show({ exam }) {
    const [activeTab, setActiveTab] = useState(exam.test_type === 'cbt_online' ? 'questions' : 'candidates');
    const [addQuestionModal, setAddQuestionModal] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [csvUploading, setCsvUploading] = useState(false);
    const [marksSubmitting, setMarksSubmitting] = useState(false);
    const [liveToggling, setLiveToggling] = useState(false);

    // Candidates local marks state for practical/manual tests
    const [attemptsState, setAttemptsState] = useState(
        (exam.attempts || []).map((att) => ({
            id: att.id,
            is_present: att.is_present ?? true,
            entrance_marks_obtained: att.entrance_marks_obtained ?? '',
        }))
    );

    // Single Question Form
    const { data: qData, setData: setQData, post: postQ, processing: qProcessing, reset: resetQ } = useForm({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
        marks: 1,
    });

    const handleToggleLive = () => {
        setLiveToggling(true);
        router.post(route('teacher.admission-tests.toggle-live', exam.id), {}, {
            preserveScroll: true,
            onFinish: () => setLiveToggling(false),
        });
    };

    const handleCsvUpload = (e) => {
        e.preventDefault();
        if (!csvFile) return;

        setCsvUploading(true);
        const formData = new FormData();
        formData.append('file', csvFile);

        router.post(route('teacher.admission-tests.bulk-upload', exam.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setCsvFile(null),
            onFinish: () => setCsvUploading(false),
        });
    };

    const handleAddQuestion = (e) => {
        e.preventDefault();
        postQ(route('teacher.admission-tests.add-question', exam.id), {
            preserveScroll: true,
            onSuccess: () => {
                setAddQuestionModal(false);
                resetQ();
            },
        });
    };

    const handleDeleteQuestion = (questionId) => {
        if (!confirm('Remove this question from the entrance exam?')) return;
        router.delete(route('teacher.admission-tests.delete-question', [exam.id, questionId]), {
            preserveScroll: true,
        });
    };

    const handleSaveManualMarks = (e) => {
        e.preventDefault();
        setMarksSubmitting(true);
        router.post(route('teacher.admission-tests.manual-marks', exam.id), {
            attempts: attemptsState,
        }, {
            preserveScroll: true,
            onFinish: () => setMarksSubmitting(false),
        });
    };

    const handleRecalculateMerit = () => {
        router.post(route('teacher.admission-tests.calculate-merit', exam.id), {}, {
            preserveScroll: true,
        });
    };

    // Metrics calculations
    const attempts = exam.attempts || [];
    const questions = exam.questions || [];
    const totalRegistered = attempts.length;
    const completedCount = attempts.filter(a => a.status === 'completed').length;
    const passedCount = attempts.filter(a => a.entrance_marks_obtained >= exam.passing_marks).length;
    const absentCount = attempts.filter(a => !a.is_present || a.status === 'absent').length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                    <Link href={route('teacher.admission-tests.index')} className="hover:text-govt-green transition">
                        Admission Tests
                    </Link>
                    <span>/</span>
                    <span className="text-slate-900 font-semibold truncate">{exam.course?.name} Entrance Cockpit</span>
                </div>
            }
        >
            <Head title={`${exam.course?.name} Entrance Test - GTTI RYK`} />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Back button */}
                <div>
                    <Link
                        href={route('teacher.admission-tests.index')}
                        className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-govt-green transition"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back to All Entrance Tests</span>
                    </Link>
                </div>

                {/* Master Command Banner with Live Activation Switch */}
                <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-2xl transition-all relative overflow-hidden border ${
                    exam.is_live
                        ? 'bg-gradient-to-r from-emerald-950 via-govt-green-600 to-slate-950 border-emerald-400/30'
                        : 'bg-gradient-to-r from-slate-950 via-slate-900 to-gray-900 border-gray-700/50'
                }`}>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-3 max-w-2xl">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/15 border border-white/20">
                                    {exam.course?.trade?.name}
                                </span>
                                {exam.test_type === 'cbt_online' ? (
                                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-200 border border-blue-400/30">
                                        Computer Lab CBT
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-200 border border-purple-400/30">
                                        Practical / Interview
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                                {exam.course?.name} Entrance Examination
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-100/90 font-medium">
                                <span className="flex items-center space-x-1.5">
                                    <Clock className="h-4 w-4 text-emerald-300" />
                                    <span>{new Date(exam.exam_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} at {exam.start_time}</span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center space-x-1.5">
                                    <MapPin className="h-4 w-4 text-emerald-300" />
                                    <span>{exam.venue}</span>
                                </span>
                                <span>•</span>
                                <span>Duration: <strong>{exam.duration_minutes} Mins</strong></span>
                                <span>•</span>
                                <span>Passing: <strong>{exam.passing_marks} / {exam.total_marks} Marks</strong></span>
                            </div>
                        </div>

                        {/* Live Control Box */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shrink-0 text-center space-y-3 min-w-[260px]">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
                                    Testing Portal State
                                </span>
                                <div className="mt-1">
                                    {exam.is_live ? (
                                        <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-400 text-slate-950 shadow-md animate-pulse">
                                            <span className="h-2 w-2 rounded-full bg-slate-950" />
                                            <span>LIVE — LAB CAN ENTER</span>
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-200 border border-rose-500/40">
                                            <span className="h-2 w-2 rounded-full bg-rose-400" />
                                            <span>OFFLINE / LOCKED</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleToggleLive}
                                disabled={liveToggling}
                                className={`w-full py-3 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2 ${
                                    exam.is_live
                                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                                }`}
                            >
                                {liveToggling ? (
                                    <span>Switching...</span>
                                ) : exam.is_live ? (
                                    <>
                                        <Pause className="h-4 w-4 fill-current" />
                                        <span>Deactivate (Lock Test)</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-4 w-4 fill-current" />
                                        <span>Activate Test Now (Go Live)</span>
                                    </>
                                )}
                            </button>

                            <p className="text-[10px] text-gray-300">
                                {exam.is_live
                                    ? 'Candidates can now login via CNIC.'
                                    : 'Test will remain inaccessible until activated.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm text-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Registered</span>
                        <p className="text-xl font-black text-gray-900 mt-1">{totalRegistered}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm text-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completed / Evaluated</span>
                        <p className="text-xl font-black text-emerald-700 mt-1">{completedCount}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm text-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Met Passing Criteria</span>
                        <p className="text-xl font-black text-blue-700 mt-1">{passedCount}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm text-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Absent / Unattended</span>
                        <p className="text-xl font-black text-rose-700 mt-1">{absentCount}</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center space-x-2 border-b border-gray-200">
                    {exam.test_type === 'cbt_online' && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('questions')}
                            className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
                                activeTab === 'questions'
                                    ? 'border-govt-green text-govt-green'
                                    : 'border-transparent text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            <span>Question Bank ({questions.length})</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setActiveTab('candidates')}
                        className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
                            activeTab === 'candidates'
                                ? 'border-govt-green text-govt-green'
                                : 'border-transparent text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <Users className="h-4 w-4" />
                        <span>Candidate Roster & Merit Compilation ({totalRegistered})</span>
                    </button>
                </div>

                {/* TAB 1: QUESTION BANK */}
                {activeTab === 'questions' && exam.test_type === 'cbt_online' && (
                    <div className="space-y-6">
                        {/* CSV Uploader & Action Tools */}
                        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <form onSubmit={handleCsvUpload} className="flex flex-wrap items-center gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                                        Bulk Import MCQs from CSV
                                    </label>
                                    <input
                                        type="file"
                                        accept=".csv,.txt"
                                        onChange={(e) => setCsvFile(e.target.files[0])}
                                        className="text-xs file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!csvFile || csvUploading}
                                    className="mt-4 sm:mt-5 inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-govt-green text-white hover:bg-govt-green-600 font-bold text-xs disabled:opacity-50 transition shadow-xs"
                                >
                                    <UploadCloud className="h-4 w-4" />
                                    <span>{csvUploading ? 'Importing...' : 'Upload CSV'}</span>
                                </button>
                            </form>

                            <div className="flex items-center space-x-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setAddQuestionModal(true)}
                                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-black font-bold text-xs transition shadow-xs"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Add Single MCQ</span>
                                </button>
                            </div>
                        </div>

                        {/* Format guide note */}
                        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 space-y-1">
                            <span className="font-bold">Standard CSV Format Guidelines:</span>
                            <p className="text-[11px] text-blue-900">
                                Columns: <code>Question, Option A, Option B, Option C, Option D, Correct Option (A/B/C/D), Marks (optional)</code>. First header row is automatically detected and skipped.
                            </p>
                        </div>

                        {/* Questions Table */}
                        <div className="rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-900">Configured Questions ({questions.length})</h3>
                                <span className="text-xs text-gray-500 font-mono">
                                    Total Marks Allocated: {questions.reduce((a, b) => a + (b.marks || 1), 0)}
                                </span>
                            </div>

                            {questions.length > 0 ? (
                                <div className="divide-y divide-gray-100 text-xs">
                                    {questions.map((q, idx) => (
                                        <div key={q.id} className="p-4 sm:p-5 hover:bg-gray-50/60 transition flex items-start justify-between gap-4">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-start space-x-2">
                                                    <span className="font-mono font-bold text-gray-400 text-sm">{idx + 1}.</span>
                                                    <p className="font-bold text-gray-900 text-sm leading-relaxed">{q.question_text}</p>
                                                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-[10px] font-bold shrink-0">
                                                        {q.marks} Mark
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6 text-[11px]">
                                                    <div className={`p-2 rounded-xl border ${q.correct_option === 'A' ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                                        A) {q.option_a}
                                                    </div>
                                                    <div className={`p-2 rounded-xl border ${q.correct_option === 'B' ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                                        B) {q.option_b}
                                                    </div>
                                                    <div className={`p-2 rounded-xl border ${q.correct_option === 'C' ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                                        C) {q.option_c}
                                                    </div>
                                                    <div className={`p-2 rounded-xl border ${q.correct_option === 'D' ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                                        D) {q.option_d}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteQuestion(q.id)}
                                                className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                                                title="Delete Question"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-16 text-center space-y-2">
                                    <FileSpreadsheet className="h-10 w-10 text-gray-300 mx-auto" />
                                    <p className="text-sm font-bold text-gray-700">Question Bank is Empty</p>
                                    <p className="text-xs text-gray-400">Upload questions via CSV or add MCQs manually using the button above.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 2: CANDIDATES & MERIT COMPILATION */}
                {activeTab === 'candidates' && (
                    <div className="space-y-6">
                        {/* Header actions for manual marks & merit calculation */}
                        <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Enrolled Candidate Roster & Evaluation</h3>
                                <p className="text-xs text-gray-500">
                                    Formula: Matric ({exam.course?.matric_weightage || 50}%) + Entrance Test ({exam.course?.test_weightage || 50}%)
                                </p>
                            </div>

                            <div className="flex items-center space-x-2 shrink-0">
                                {exam.test_type === 'manual_practical' && (
                                    <button
                                        type="button"
                                        onClick={handleSaveManualMarks}
                                        disabled={marksSubmitting}
                                        className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-govt-green text-white hover:bg-govt-green-600 font-bold text-xs disabled:opacity-50 transition shadow-xs"
                                    >
                                        <Save className="h-4 w-4" />
                                        <span>{marksSubmitting ? 'Saving...' : 'Save Manual Marks'}</span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={handleRecalculateMerit}
                                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-black font-bold text-xs transition shadow-xs"
                                >
                                    <Calculator className="h-4 w-4" />
                                    <span>Recalculate Merit Scores</span>
                                </button>
                            </div>
                        </div>

                        {/* Candidates Table */}
                        <div className="rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                            {attempts.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-gray-50 text-gray-600 uppercase font-bold tracking-wider text-[10px] border-b border-gray-200">
                                            <tr>
                                                <th className="py-3 px-4">Candidate Identity</th>
                                                <th className="py-3 px-4">CNIC & Application ID</th>
                                                <th className="py-3 px-4">Matric Score</th>
                                                <th className="py-3 px-4">Attendance</th>
                                                <th className="py-3 px-4">
                                                    {exam.test_type === 'cbt_online' ? 'CBT Marks' : 'Manual / Practical Marks'}
                                                </th>
                                                <th className="py-3 px-4">Composite Merit %</th>
                                                <th className="py-3 px-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-gray-700">
                                            {attempts.map((att, idx) => {
                                                const student = att.studentProfile?.user;
                                                const matricObt = att.matric_marks_obtained ?? att.application?.obtained_marks ?? 0;
                                                const matricTot = att.total_matric_marks ?? att.application?.total_marks ?? 1100;
                                                const localState = attemptsState.find(s => s.id === att.id) || { is_present: true, entrance_marks_obtained: '' };

                                                return (
                                                    <tr key={att.id} className="hover:bg-gray-50/70 transition">
                                                        <td className="py-3.5 px-4">
                                                            <div className="font-bold text-gray-900">{student?.name || 'Applicant'}</div>
                                                            <div className="text-[11px] text-gray-500">
                                                                Father: {att.studentProfile?.father_name || 'N/A'}
                                                            </div>
                                                        </td>

                                                        <td className="py-3.5 px-4 font-mono space-y-0.5">
                                                            <div className="font-bold text-govt-green text-[11px]">
                                                                {att.application?.application_number}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500">
                                                                {student?.cnic}
                                                            </div>
                                                        </td>

                                                        <td className="py-3.5 px-4 font-mono">
                                                            <span className="font-bold text-gray-900">{matricObt}</span>
                                                            <span className="text-gray-400"> / {matricTot}</span>
                                                            <div className="text-[10px] text-gray-400 font-sans">
                                                                ({matricTot > 0 ? ((matricObt / matricTot) * 100).toFixed(1) : 0}%)
                                                            </div>
                                                        </td>

                                                        <td className="py-3.5 px-4">
                                                            {exam.test_type === 'manual_practical' ? (
                                                                <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={localState.is_present}
                                                                        onChange={(e) => {
                                                                            const isChecked = e.target.checked;
                                                                            setAttemptsState(prev => prev.map(item => item.id === att.id ? { ...item, is_present: isChecked } : item));
                                                                        }}
                                                                        className="rounded text-govt-green focus:ring-govt-green h-4 w-4"
                                                                    />
                                                                    <span className={`text-[11px] font-bold ${localState.is_present ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                                        {localState.is_present ? 'Present' : 'Absent'}
                                                                    </span>
                                                                </label>
                                                            ) : (
                                                                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                                    att.is_present ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                                                                }`}>
                                                                    <span>{att.is_present ? 'Present' : 'Absent'}</span>
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="py-3.5 px-4">
                                                            {exam.test_type === 'manual_practical' ? (
                                                                <div className="flex items-center space-x-1">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max={exam.total_marks}
                                                                        disabled={!localState.is_present}
                                                                        placeholder={`0 - ${exam.total_marks}`}
                                                                        value={localState.entrance_marks_obtained}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value;
                                                                            setAttemptsState(prev => prev.map(item => item.id === att.id ? { ...item, entrance_marks_obtained: val } : item));
                                                                        }}
                                                                        className="w-20 p-1.5 rounded-lg border border-gray-200 text-xs font-mono font-bold text-gray-900 bg-gray-50 focus:bg-white"
                                                                    />
                                                                    <span className="text-gray-400 font-mono text-[10px]">/{exam.total_marks}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="font-mono font-bold text-gray-900">
                                                                    {att.entrance_marks_obtained !== null ? (
                                                                        <span>{att.entrance_marks_obtained} / {exam.total_marks}</span>
                                                                    ) : (
                                                                        <span className="text-gray-400 italic">Not taken yet</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>

                                                        <td className="py-3.5 px-4 font-mono font-bold text-sm">
                                                            {att.composite_merit_score !== null ? (
                                                                <span className="text-govt-green">{att.composite_merit_score}%</span>
                                                            ) : (
                                                                <span className="text-gray-400 text-xs font-sans italic">Pending</span>
                                                            )}
                                                        </td>

                                                        <td className="py-3.5 px-4">
                                                            {att.status === 'completed' ? (
                                                                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                                    att.entrance_marks_obtained >= exam.passing_marks
                                                                        ? 'bg-emerald-100 text-emerald-800'
                                                                        : 'bg-amber-100 text-amber-900'
                                                                }`}>
                                                                    <span>{att.entrance_marks_obtained >= exam.passing_marks ? 'Passed' : 'Failed'}</span>
                                                                </span>
                                                            ) : att.status === 'in_progress' ? (
                                                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 animate-pulse">
                                                                    <span>In Progress</span>
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                                                                    <span>Scheduled</span>
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-16 text-center space-y-2">
                                    <Users className="h-10 w-10 text-gray-300 mx-auto" />
                                    <p className="text-sm font-bold text-gray-700">No Candidates Registered</p>
                                    <p className="text-xs text-gray-400">Applications submitted for this course will automatically populate here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Single Question Modal */}
            {addQuestionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="w-full max-w-xl rounded-3xl bg-white border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                                <h3 className="text-base font-black text-gray-900">Add Entrance Exam Question</h3>
                                <p className="text-xs text-gray-500">Configure MCQ text, 4 choices, and correct key</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAddQuestionModal(false)}
                                className="p-1 rounded-xl text-gray-400 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddQuestion} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Question Text *</label>
                                <textarea
                                    required
                                    rows="2"
                                    value={qData.question_text}
                                    onChange={(e) => setQData('question_text', e.target.value)}
                                    placeholder="Enter the problem statement or question..."
                                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Option A *</label>
                                    <input
                                        type="text"
                                        required
                                        value={qData.option_a}
                                        onChange={(e) => setQData('option_a', e.target.value)}
                                        className="w-full p-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Option B *</label>
                                    <input
                                        type="text"
                                        required
                                        value={qData.option_b}
                                        onChange={(e) => setQData('option_b', e.target.value)}
                                        className="w-full p-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Option C *</label>
                                    <input
                                        type="text"
                                        required
                                        value={qData.option_c}
                                        onChange={(e) => setQData('option_c', e.target.value)}
                                        className="w-full p-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Option D *</label>
                                    <input
                                        type="text"
                                        required
                                        value={qData.option_d}
                                        onChange={(e) => setQData('option_d', e.target.value)}
                                        className="w-full p-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Correct Key *</label>
                                    <select
                                        value={qData.correct_option}
                                        onChange={(e) => setQData('correct_option', e.target.value)}
                                        className="w-full p-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-bold"
                                    >
                                        <option value="A">Option A</option>
                                        <option value="B">Option B</option>
                                        <option value="C">Option C</option>
                                        <option value="D">Option D</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Question Marks *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="50"
                                        value={qData.marks}
                                        onChange={(e) => setQData('marks', e.target.value)}
                                        className="w-full p-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setAddQuestionModal(false)}
                                    className="py-2 px-4 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={qProcessing}
                                    className="py-2 px-5 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white font-bold transition disabled:opacity-50"
                                >
                                    {qProcessing ? 'Adding...' : 'Add Question'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
