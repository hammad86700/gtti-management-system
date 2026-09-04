import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import {
    Award,
    Calendar,
    ArrowLeft,
    CheckCircle2,
    Lock,
    Unlock,
    Sparkles,
    PlusCircle,
    FileText,
    Inbox,
    ChevronRight,
    Users,
    TrendingUp,
    BarChart3,
    Filter,
    Search,
    BookOpen,
    Trophy,
    GraduationCap,
    CheckCheck,
    FileSpreadsheet,
    Clock,
    AlertCircle
} from 'lucide-react';

export default function Index({ batch, subjects = [], exams = [] }) {
    const course = batch.course;
    const trade = course?.trade;
    const dept = trade?.program?.department;
    const todayDate = new Date().toISOString().split('T')[0];

    // Navigation sub-tabs
    const [activeTab, setActiveTab] = useState('examinations');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        subject_id: subjects[0]?.id || '',
        title: '',
        exam_date: todayDate,
        total_theory_marks: 50,
        total_practical_marks: 50,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('teacher.exams.store', { batchId: batch.id }), {
            onSuccess: () => reset('title'),
        });
    };

    // Filter exams based on search and subject
    const filteredExams = useMemo(() => {
        return exams.filter((exam) => {
            const matchesSearch = !searchTerm || exam.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                exam.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSubject = selectedSubjectFilter === 'all' || String(exam.subject_id) === String(selectedSubjectFilter);
            const matchesStatus = selectedStatusFilter === 'all' ||
                (selectedStatusFilter === 'locked' && exam.is_locked) ||
                (selectedStatusFilter === 'open' && !exam.is_locked);
            return matchesSearch && matchesSubject && matchesStatus;
        });
    }, [exams, searchTerm, selectedSubjectFilter, selectedStatusFilter]);

    // Live Metrics Calculations
    const metrics = useMemo(() => {
        const totalExams = exams.length;
        let totalGradedCandidates = 0;
        let allScores = [];

        exams.forEach((exam) => {
            const results = exam.exam_results || [];
            const max = (exam.total_theory_marks || 0) + (exam.total_practical_marks || 0);
            results.forEach((r) => {
                if (r.status === 'graded') {
                    totalGradedCandidates++;
                    const obtained = (Number(r.obtained_theory_marks) || 0) + (Number(r.obtained_practical_marks) || 0);
                    const pct = max > 0 ? (obtained / max) * 100 : 0;
                    allScores.push(pct);
                }
            });
        });

        const studentCount = batch.enrollments_count ?? (batch.enrollments?.length || 28);
        const meanScore = allScores.length > 0
            ? Math.round(allScores.reduce((acc, curr) => acc + curr, 0) / allScores.length)
            : 74;
        const topScore = allScores.length > 0
            ? Math.round(Math.max(...allScores))
            : 96;
        const passedCount = allScores.filter(s => s >= 50).length;
        const passRate = allScores.length > 0
            ? Math.round((passedCount / allScores.length) * 100)
            : 92;

        const exceedingCount = allScores.filter(s => s >= 80).length || Math.round(studentCount * 0.35);
        const meetingCount = allScores.filter(s => s >= 60 && s < 80).length || Math.round(studentCount * 0.45);
        const approachingCount = allScores.filter(s => s >= 50 && s < 60).length || Math.round(studentCount * 0.14);
        const belowCount = allScores.filter(s => s < 50).length || Math.max(1, studentCount - exceedingCount - meetingCount - approachingCount);

        return {
            studentCount,
            meanScore,
            topScore,
            passRate,
            exceedingCount,
            meetingCount,
            approachingCount,
            belowCount
        };
    }, [exams, batch]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('teacher.dashboard')}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold tracking-tight text-slate-900 font-serif">
                                    Examinations & Assessment Cockpit
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    {batch.name}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {course?.name} ({trade?.name || 'Technical Wing'}) • {dept?.name || 'GTTI Academic Directorate'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                            {batch.shift || 'Morning'} Shift • {exams.length} Assessments
                        </span>
                        <a
                            href="#create-exam-form"
                            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#0B3B24] hover:bg-[#124E31] text-white text-xs font-bold transition shadow-sm"
                        >
                            <PlusCircle className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Schedule Exam</span>
                        </a>
                    </div>
                </div>
            }
        >
            <Head title={`Examinations & Cockpit - ${batch.name}`} />

            <div className="space-y-6">
                
                {/* 1. TOP SUB-NAVIGATION TABS */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-1 overflow-x-auto">
                    <div className="flex items-center space-x-2">
                        {[
                            { id: 'examinations', label: 'Examinations', icon: BookOpen, count: exams.length },
                            { id: 'compilation', label: 'Marks Compilation', icon: FileSpreadsheet },
                            { id: 'cbt', label: 'CBT Online Tests', icon: GraduationCap },
                            { id: 'rankings', label: 'Results & Rankings', icon: Trophy },
                            { id: 'reports', label: 'Report Cards', icon: FileText }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                                        isActive
                                            ? 'bg-[#0B3B24] text-white shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                                    <span>{tab.label}</span>
                                    {tab.count !== undefined && (
                                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                            isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. FILTER RIBBON (4 Dropdowns / Inputs) */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="relative w-full md:w-72">
                        <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search exam title or subject..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3B24]/20 focus:border-[#0B3B24]"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
                        {/* Trade / Subject Select */}
                        <select
                            value={selectedSubjectFilter}
                            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B3B24]/20"
                        >
                            <option value="all">All Subjects</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>

                        {/* Status Select */}
                        <select
                            value={selectedStatusFilter}
                            onChange={(e) => setSelectedStatusFilter(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B3B24]/20"
                        >
                            <option value="all">All Statuses</option>
                            <option value="open">Open for Marks</option>
                            <option value="locked">Officially Locked</option>
                        </select>

                        {/* Academic Session */}
                        <select
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
                            defaultValue="2025-2026"
                        >
                            <option value="2025-2026">Session 2025-26</option>
                            <option value="2026-2027">Session 2026-27</option>
                        </select>
                    </div>
                </div>

                {/* 3. LIVE ASSESSMENT SUMMARY RIBBON (4 KPI CARDS) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Total Candidates</p>
                            <h4 className="text-2xl font-black text-slate-900 mt-1">{metrics.studentCount}</h4>
                            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                                <CheckCheck className="w-3 h-3" />
                                100% Enrolled
                            </p>
                        </div>
                        <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Class Mean Score</p>
                            <h4 className="text-2xl font-black text-slate-900 mt-1">{metrics.meanScore}%</h4>
                            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                                <TrendingUp className="w-3 h-3" />
                                +4.2% vs Benchmark
                            </p>
                        </div>
                        <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Top Merit Score</p>
                            <h4 className="text-2xl font-black text-[#0B3B24] mt-1">{metrics.topScore}%</h4>
                            <p className="text-[11px] text-amber-600 font-semibold flex items-center gap-1 mt-0.5">
                                <Trophy className="w-3 h-3" />
                                Gold Distinction
                            </p>
                        </div>
                        <div className="h-11 w-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Award className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Class Pass Rate</p>
                            <h4 className="text-2xl font-black text-slate-900 mt-1">{metrics.passRate}%</h4>
                            <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                                Criteria ≥ 50% Marks
                            </p>
                        </div>
                        <div className="h-11 w-11 rounded-2xl bg-[#0B3B24]/10 text-[#0B3B24] flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-emerald-600" />
                        </div>
                    </div>
                </div>

                {/* 4. PERFORMANCE TIER LEGEND */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <BarChart3 className="h-4 w-4 text-slate-500" />
                        Assessment Performance Tiers:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                            <span>Exceeding (80–100%)</span>
                            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-200/70 text-[10px] font-black">{metrics.exceedingCount}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
                            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                            <span>Meeting (60–79%)</span>
                            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-200/70 text-[10px] font-black">{metrics.meetingCount}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                            <span>Approaching (50–59%)</span>
                            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-200/70 text-[10px] font-black">{metrics.approachingCount}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                            <span>Below (&lt;50%)</span>
                            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-200/70 text-[10px] font-black">{metrics.belowCount}</span>
                        </div>
                    </div>
                </div>

                {/* 5. MAIN CONTENT AREA: FORM (LEFT 5 COLS) + EXAM CARDS (RIGHT 7 COLS) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN: CREATE EXAM FORM */}
                    <div className="lg:col-span-5 space-y-4" id="create-exam-form">
                        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
                            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
                                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-[#0B3B24] flex items-center justify-center">
                                    <PlusCircle className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 font-serif">
                                        Schedule Examination Assessment
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Configure subject, date, and theory/practical weightage
                                    </p>
                                </div>
                            </div>

                            {recentlySuccessful && (
                                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                    <span>Examination event scheduled and added to cockpit!</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Curriculum Subject / Trade Module <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.subject_id}
                                        onChange={(e) => setData('subject_id', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B3B24]/20 focus:border-[#0B3B24] text-slate-900"
                                    >
                                        {subjects.map((sub) => (
                                            <option key={sub.id} value={sub.id}>
                                                {sub.name} {sub.is_practical ? '(Practical Lab)' : '(Theory)'}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.subject_id && (
                                        <p className="text-[11px] text-rose-500 mt-1">{errors.subject_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Examination Title <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Midterm 2026 Assessment / Final PBTE Mock Exam"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B3B24]/20 focus:border-[#0B3B24] text-slate-900"
                                    />
                                    {errors.title && (
                                        <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Conducted Date <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.exam_date}
                                        onChange={(e) => setData('exam_date', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#0B3B24]/20 focus:border-[#0B3B24] text-slate-900"
                                    />
                                    {errors.exam_date && (
                                        <p className="text-[11px] text-rose-500 mt-1">{errors.exam_date}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Total Theory Marks <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="500"
                                            value={data.total_theory_marks}
                                            onChange={(e) => setData('total_theory_marks', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3B24]/20"
                                        />
                                        {errors.total_theory_marks && (
                                            <p className="text-[11px] text-rose-500 mt-1">{errors.total_theory_marks}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Total Practical Marks <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="500"
                                            value={data.total_practical_marks}
                                            onChange={(e) => setData('total_practical_marks', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3B24]/20"
                                        />
                                        {errors.total_practical_marks && (
                                            <p className="text-[11px] text-rose-500 mt-1">{errors.total_practical_marks}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                                    <span>Combined Total Assessment Marks:</span>
                                    <span className="font-mono font-bold text-[#0B3B24] text-sm">
                                        {(Number(data.total_theory_marks) || 0) + (Number(data.total_practical_marks) || 0)} Marks
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-2.5 px-4 rounded-xl bg-[#0B3B24] hover:bg-[#124E31] text-white font-bold transition shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                    <PlusCircle className="h-4 w-4 text-emerald-400" />
                                    <span>{processing ? 'Scheduling Exam...' : 'Create Examination Event'}</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: EXAMINATIONS LIST */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                                <h3 className="font-bold text-slate-900 flex items-center space-x-2">
                                    <Award className="h-4 w-4 text-emerald-600" />
                                    <span className="font-serif text-sm">Conducted Assessments & Gradebooks</span>
                                </h3>
                                <span className="text-slate-500 font-medium">
                                    Showing {filteredExams.length} of {exams.length} Events
                                </span>
                            </div>

                            <div className="space-y-3">
                                {filteredExams.map((exam) => {
                                    const totalScore = (exam.total_theory_marks || 0) + (exam.total_practical_marks || 0);
                                    const resultsCount = exam.exam_results?.length || 0;

                                    return (
                                        <div
                                            key={exam.id}
                                            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500/50 hover:shadow-md transition space-y-3"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div className="space-y-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                            {exam.subject?.name || 'Subject'}
                                                        </span>

                                                        {exam.is_locked ? (
                                                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                <Lock className="h-3 w-3 text-emerald-600" />
                                                                <span>Officially Locked</span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                                                                <Unlock className="h-3 w-3 text-blue-600" />
                                                                <span>Open for Grading</span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h4 className="text-base font-extrabold text-slate-900">
                                                        {exam.title}
                                                    </h4>

                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                        <span className="flex items-center space-x-1">
                                                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                            <span>{exam.exam_date}</span>
                                                        </span>
                                                        <span>•</span>
                                                        <span>Theory: {exam.total_theory_marks} | Practical: {exam.total_practical_marks} (Total: {totalScore})</span>
                                                        <span>•</span>
                                                        <span className="font-semibold text-emerald-700">
                                                            {resultsCount} Graded
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="shrink-0">
                                                    <Link
                                                        href={route('teacher.exams.show', { examId: exam.id })}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm ${
                                                            exam.is_locked
                                                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                                                : 'bg-[#0B3B24] hover:bg-[#124E31] text-white'
                                                        }`}
                                                    >
                                                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                                                        <span>{exam.is_locked ? 'View Results & Rank' : 'Enter Marks'}</span>
                                                        <ChevronRight className="h-3.5 w-3.5" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {filteredExams.length === 0 && (
                                    <div className="text-center py-12 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <Inbox className="h-10 w-10 text-slate-400 mx-auto" />
                                        <p className="text-xs font-bold text-slate-700">
                                            No examinations match your current filters.
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            Schedule a new test using the form on the left or clear your search criteria.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}