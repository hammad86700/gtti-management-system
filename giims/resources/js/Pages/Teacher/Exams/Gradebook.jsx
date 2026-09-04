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
    ShieldAlert,
    Save,
    Users,
    Sparkles,
    AlertCircle,
    Check,
    Printer,
    Download,
    BarChart3,
    TrendingUp,
    Trophy,
    FileSpreadsheet,
    Medal,
    Search,
    Filter,
    CheckCheck,
    HelpCircle,
    UserX,
    ChevronDown,
    SlidersHorizontal
} from 'lucide-react';

export default function Gradebook({ exam, enrollments = [] }) {
    const course = exam.batch?.course;
    const trade = course?.trade;
    const dept = trade?.program?.department;
    const isLocked = Boolean(exam.is_locked);

    // Mode Switcher: 'entry' (Marks Entry Spreadsheet) vs 'rankings' (Results & Ranking Merit View)
    const [viewMode, setViewMode] = useState(isLocked ? 'rankings' : 'entry');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Initial state setup from existing results or defaults
    const existingResults = exam.exam_results || [];

    const initialResults = enrollments.map((enr) => {
        const profile = enr.student_profile;
        const found = existingResults.find((r) => r.student_profile_id === profile?.id);

        return {
            student_profile_id: profile?.id,
            status: found?.status || 'graded',
            obtained_theory_marks: found?.obtained_theory_marks ?? '',
            obtained_practical_marks: found?.obtained_practical_marks ?? '',
        };
    });

    const { data, setData, post, processing, recentlySuccessful } = useForm({
        results: initialResults,
    });

    const maxTheory = exam.total_theory_marks || 0;
    const maxPractical = exam.total_practical_marks || 0;
    const totalMaxMarks = maxTheory + maxPractical;

    // Handle single student marks adjustment
    const handleMarksChange = (profileId, field, value) => {
        if (isLocked) return;

        const updated = data.results.map((r) => {
            if (r.student_profile_id === profileId) {
                let numVal = value === '' ? '' : Math.max(0, parseInt(value) || 0);
                if (field === 'obtained_theory_marks' && numVal !== '') {
                    numVal = Math.min(numVal, maxTheory);
                }
                if (field === 'obtained_practical_marks' && numVal !== '') {
                    numVal = Math.min(numVal, maxPractical);
                }
                return {
                    ...r,
                    [field]: numVal,
                };
            }
            return r;
        });
        setData('results', updated);
    };

    // Handle student status change (graded, absent, cheating)
    const handleStatusChange = (profileId, newStatus) => {
        if (isLocked) return;

        const updated = data.results.map((r) => {
            if (r.student_profile_id === profileId) {
                return {
                    ...r,
                    status: newStatus,
                    obtained_theory_marks: newStatus === 'graded' ? r.obtained_theory_marks : '',
                    obtained_practical_marks: newStatus === 'graded' ? r.obtained_practical_marks : '',
                };
            }
            return r;
        });
        setData('results', updated);
    };

    // Handle submission to backend
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLocked) {
            alert('Results are locked and cannot be modified.');
            return;
        }
        post(route('teacher.exams.store-marks', { examId: exam.id }));
    };

    // Dynamic metrics calculation from current data.results
    const calculatedRows = useMemo(() => {
        return enrollments.map((enr, index) => {
            const profile = enr.student_profile;
            const user = profile?.user;
            const r = data.results.find((res) => res.student_profile_id === profile?.id) || {
                status: 'graded',
                obtained_theory_marks: '',
                obtained_practical_marks: ''
            };

            const thMarks = r.obtained_theory_marks === '' ? null : Number(r.obtained_theory_marks);
            const prMarks = r.obtained_practical_marks === '' ? null : Number(r.obtained_practical_marks);
            
            const isGraded = r.status === 'graded';
            const hasMarks = thMarks !== null || prMarks !== null;
            const totalObtained = (thMarks || 0) + (prMarks || 0);
            const percentage = totalMaxMarks > 0 && hasMarks ? Number(((totalObtained / totalMaxMarks) * 100).toFixed(1)) : 0;
            const isPassed = isGraded && percentage >= 50;

            let tier = 'below';
            let tierLabel = 'Below';
            if (!isGraded) {
                tier = 'absent';
                tierLabel = r.status === 'absent' ? 'Absent' : 'Expelled';
            } else if (percentage >= 80) {
                tier = 'exceeding';
                tierLabel = 'Exceeding';
            } else if (percentage >= 60) {
                tier = 'meeting';
                tierLabel = 'Meeting';
            } else if (percentage >= 50) {
                tier = 'approaching';
                tierLabel = 'Approaching';
            }

            return {
                index: index + 1,
                enrollment: enr,
                profile,
                user,
                profileId: profile?.id,
                rollNumber: enr.enrollment_number,
                candidateName: user?.name || 'Candidate Trainee',
                fatherName: profile?.father_name || 'N/A',
                status: r.status,
                theoryMarks: r.obtained_theory_marks,
                practicalMarks: r.obtained_practical_marks,
                thNum: thMarks ?? 0,
                prNum: prMarks ?? 0,
                totalObtained,
                percentage,
                isPassed,
                tier,
                tierLabel,
                hasMarks
            };
        });
    }, [enrollments, data.results, totalMaxMarks]);

    // Filtered rows for entry table
    const filteredRows = useMemo(() => {
        return calculatedRows.filter((row) => {
            const matchesSearch = !searchTerm ||
                row.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                row.fatherName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [calculatedRows, searchTerm, statusFilter]);

    // Live Metrics Summary
    const metrics = useMemo(() => {
        const totalCandidates = calculatedRows.length;
        const gradedStudents = calculatedRows.filter((r) => r.status === 'graded');
        const gradedWithMarks = gradedStudents.filter((r) => r.hasMarks);

        let meanScore = 0;
        let topScore = 0;
        let passRate = 0;
        let totalTheoryAvg = 0;
        let totalPracticalAvg = 0;

        if (gradedWithMarks.length > 0) {
            const sumScores = gradedWithMarks.reduce((acc, curr) => acc + curr.percentage, 0);
            meanScore = Number((sumScores / gradedWithMarks.length).toFixed(1));
            topScore = Math.max(...gradedWithMarks.map((r) => r.percentage));
            const passedCount = gradedWithMarks.filter((r) => r.isPassed).length;
            passRate = Math.round((passedCount / gradedWithMarks.length) * 100);

            const sumTheory = gradedWithMarks.reduce((acc, curr) => acc + curr.thNum, 0);
            const sumPractical = gradedWithMarks.reduce((acc, curr) => acc + curr.prNum, 0);
            totalTheoryAvg = (sumTheory / gradedWithMarks.length).toFixed(1);
            totalPracticalAvg = (sumPractical / gradedWithMarks.length).toFixed(1);
        }

        const exceedingCount = calculatedRows.filter((r) => r.tier === 'exceeding').length;
        const meetingCount = calculatedRows.filter((r) => r.tier === 'meeting').length;
        const approachingCount = calculatedRows.filter((r) => r.tier === 'approaching').length;
        const belowCount = calculatedRows.filter((r) => r.tier === 'below').length;
        const absentCount = calculatedRows.filter((r) => r.tier === 'absent').length;

        return {
            totalCandidates,
            gradedCount: gradedStudents.length,
            meanScore,
            topScore,
            passRate,
            totalTheoryAvg,
            totalPracticalAvg,
            exceedingCount,
            meetingCount,
            approachingCount,
            belowCount,
            absentCount
        };
    }, [calculatedRows]);

    // Ranked rows for Results & Rankings Merit View
    const rankedRows = useMemo(() => {
        const sorted = [...calculatedRows].sort((a, b) => {
            if (a.status !== 'graded' && b.status === 'graded') return 1;
            if (a.status === 'graded' && b.status !== 'graded') return -1;
            return b.totalObtained - a.totalObtained;
        });

        return sorted.map((row, idx) => ({
            ...row,
            rank: idx + 1
        }));
    }, [calculatedRows]);

    // Export Gradebook to CSV file for Excel
    const handleExportCSV = () => {
        const headers = ['Rank', 'Roll Number', 'Candidate Name', 'Father Name', 'Status', `Theory (${maxTheory})`, `Practical (${maxPractical})`, `Total (${totalMaxMarks})`, 'Percentage', 'Tier', 'Result'];
        const rows = rankedRows.map((r) => [
            r.rank,
            `"${r.rollNumber}"`,
            `"${r.candidateName}"`,
            `"${r.fatherName}"`,
            r.status.toUpperCase(),
            r.status === 'graded' ? r.thNum : 'N/A',
            r.status === 'graded' ? r.prNum : 'N/A',
            r.status === 'graded' ? r.totalObtained : 'N/A',
            r.status === 'graded' ? `${r.percentage}%` : 'N/A',
            r.tierLabel,
            r.status === 'graded' ? (r.isPassed ? 'PASS' : 'FAIL') : r.status.toUpperCase()
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Gradebook_${exam.title.replace(/\s+/g, '_')}_${exam.exam_date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('teacher.exams.index', { batchId: exam.batch_id })}
                            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold tracking-tight text-slate-900 font-serif">
                                    Gradebook: {exam.title}
                                </h2>
                                {isLocked ? (
                                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                                        <Lock className="h-3 w-3 text-emerald-600" />
                                        <span>Locked</span>
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                                        <Unlock className="h-3 w-3 text-blue-600" />
                                        <span>Open for Marks</span>
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {exam.subject?.name} • {exam.batch?.name} ({course?.name}) • {trade?.name || 'Departmental Trade'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Mode Switcher Pills */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
                            <button
                                type="button"
                                onClick={() => setViewMode('entry')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                                    viewMode === 'entry'
                                        ? 'bg-[#0B3B24] text-white shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <FileSpreadsheet className="h-3.5 w-3.5" />
                                <span>Marks Entry</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('rankings')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                                    viewMode === 'rankings'
                                        ? 'bg-[#0B3B24] text-white shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Trophy className="h-3.5 w-3.5" />
                                <span>Results & Rankings</span>
                            </button>
                        </div>

                        {/* Export CSV */}
                        <button
                            type="button"
                            onClick={handleExportCSV}
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                            title="Export to Excel CSV"
                        >
                            <Download className="h-3.5 w-3.5 text-slate-500" />
                            <span className="hidden md:inline">Export Excel</span>
                        </button>

                        {/* Print */}
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                        >
                            <Printer className="h-3.5 w-3.5 text-slate-500" />
                            <span className="hidden md:inline">Print Award List</span>
                        </button>

                        {/* Save Marks CTA */}
                        {!isLocked && (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={processing}
                                className="px-4 py-1.5 rounded-xl bg-[#0B3B24] hover:bg-[#124E31] text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                            >
                                <Save className="h-3.5 w-3.5 text-emerald-400" />
                                <span>{processing ? 'Saving...' : 'Save Marks'}</span>
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`Gradebook - ${exam.title}`} />

            <div className="space-y-6">

                {/* ANTI-TAMPER LOCKED BANNER */}
                {isLocked && (
                    <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm flex items-center space-x-3.5">
                        <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                            <Lock className="h-5 w-5 text-[#0B3B24]" />
                        </div>
                        <div className="text-xs">
                            <p className="font-bold text-sm text-[#0B3B24]">
                                Anti-Tamper Formal Result Locking Active
                            </p>
                            <p className="text-slate-600 mt-0.5">
                                These examination marks have been officially validated and locked by {exam.locked_by?.name || 'Academic Directorate'}. Spreadsheet fields are locked in read-only audit mode.
                            </p>
                        </div>
                    </div>
                )}

                {recentlySuccessful && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span>Candidate marks saved to database gradebook successfully! Live analytics updated.</span>
                    </div>
                )}

                {/* 1. LIVE ASSESSMENT SUMMARY RIBBON (4 KPI CARDS) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Enrolled Candidates</p>
                            <h4 className="text-2xl font-black text-slate-900 mt-1">{metrics.totalCandidates}</h4>
                            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                                <CheckCheck className="w-3 h-3" />
                                {metrics.gradedCount} Graded
                            </p>
                        </div>
                        <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Live Class Mean</p>
                            <h4 className="text-2xl font-black text-slate-900 mt-1">{metrics.meanScore}%</h4>
                            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                                Avg Th: {metrics.totalTheoryAvg} | Pr: {metrics.totalPracticalAvg}
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
                                Peak Batch Benchmark
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
                            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                                <TrendingUp className="w-3 h-3" />
                                Criteria ≥ 50%
                            </p>
                        </div>
                        <div className="h-11 w-11 rounded-2xl bg-[#0B3B24]/10 text-[#0B3B24] flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-emerald-600" />
                        </div>
                    </div>
                </div>

                {/* 2. PERFORMANCE TIER LEGEND */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <BarChart3 className="h-4 w-4 text-slate-500" />
                        Score Performance Distribution:
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
                        {metrics.absentCount > 0 && (
                            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold">
                                <UserX className="h-3 w-3 text-slate-500" />
                                <span>Absent / Expelled: {metrics.absentCount}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. MODE: MARKS ENTRY SPREADSHEET */}
                {viewMode === 'entry' ? (
                    <div className="space-y-4">
                        {/* Spreadsheet Control Bar */}
                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
                            <div className="relative w-full md:w-80">
                                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search candidate name or roll number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3B24]/20 focus:border-[#0B3B24]"
                                />
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold">
                                    <span>Theory Max: <strong className="text-slate-800 font-mono">{maxTheory}</strong></span>
                                    <span>•</span>
                                    <span>Practical Max: <strong className="text-slate-800 font-mono">{maxPractical}</strong></span>
                                    <span>•</span>
                                    <span>Total: <strong className="text-[#0B3B24] font-mono">{totalMaxMarks}</strong></span>
                                </div>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B3B24]/20"
                                >
                                    <option value="all">All Candidates ({calculatedRows.length})</option>
                                    <option value="graded">Graded Only</option>
                                    <option value="absent">Absent</option>
                                    <option value="cheating">Expelled</option>
                                </select>
                            </div>
                        </div>

                        {/* Interactive Spreadsheet Table */}
                        <form onSubmit={handleSubmit}>
                            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                                                <th className="py-3 px-3 text-center w-12">#</th>
                                                <th className="py-3 px-4 min-w-[200px]">Candidate Trainee</th>
                                                <th className="py-3 px-3 font-mono">Roll Number</th>
                                                <th className="py-3 px-3 text-center w-36">Status</th>
                                                <th className="py-3 px-3 text-center w-36">
                                                    Theory <span className="text-slate-400 font-normal">({maxTheory})</span>
                                                </th>
                                                <th className="py-3 px-3 text-center w-36">
                                                    Practical <span className="text-slate-400 font-normal">({maxPractical})</span>
                                                </th>
                                                <th className="py-3 px-3 text-center w-28">
                                                    Total <span className="text-slate-400 font-normal">({totalMaxMarks})</span>
                                                </th>
                                                <th className="py-3 px-3 text-center w-24">% Score</th>
                                                <th className="py-3 px-3 text-center w-32">Performance Tier</th>
                                                <th className="py-3 px-3 text-center w-20">Verdict</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredRows.map((row) => (
                                                <tr
                                                    key={row.enrollment.id}
                                                    className="hover:bg-slate-50/80 transition group"
                                                >
                                                    <td className="py-3 px-3 text-center text-slate-400 font-medium font-mono">
                                                        {row.index}
                                                    </td>

                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center space-x-2.5">
                                                            <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-200">
                                                                {row.candidateName.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 leading-tight">
                                                                    {row.candidateName}
                                                                </p>
                                                                <p className="text-[11px] text-slate-500">
                                                                    S/D: {row.fatherName}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="py-3 px-3 font-mono font-bold text-slate-700">
                                                        {row.rollNumber}
                                                    </td>

                                                    {/* Status Selector */}
                                                    <td className="py-3 px-3 text-center">
                                                        <select
                                                            disabled={isLocked}
                                                            value={row.status}
                                                            onChange={(e) => handleStatusChange(row.profileId, e.target.value)}
                                                            className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition ${
                                                                row.status === 'graded'
                                                                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                                                                    : 'bg-rose-50 border-rose-200 text-rose-700'
                                                            } disabled:opacity-75 focus:outline-none`}
                                                        >
                                                            <option value="graded">Graded</option>
                                                            <option value="absent">Absent</option>
                                                            <option value="cheating">Expelled</option>
                                                        </select>
                                                    </td>

                                                    {/* Theory Marks Cell */}
                                                    <td className="py-2.5 px-3 text-center">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={maxTheory}
                                                            disabled={isLocked || row.status !== 'graded'}
                                                            placeholder="0"
                                                            value={row.theoryMarks}
                                                            onChange={(e) => handleMarksChange(row.profileId, 'obtained_theory_marks', e.target.value)}
                                                            className="w-24 px-2 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#0B3B24] rounded-xl text-xs font-mono font-bold text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3B24]/20 transition disabled:bg-slate-100 disabled:opacity-50"
                                                        />
                                                    </td>

                                                    {/* Practical Marks Cell */}
                                                    <td className="py-2.5 px-3 text-center">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={maxPractical}
                                                            disabled={isLocked || row.status !== 'graded'}
                                                            placeholder="0"
                                                            value={row.practicalMarks}
                                                            onChange={(e) => handleMarksChange(row.profileId, 'obtained_practical_marks', e.target.value)}
                                                            className="w-24 px-2 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#0B3B24] rounded-xl text-xs font-mono font-bold text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3B24]/20 transition disabled:bg-slate-100 disabled:opacity-50"
                                                        />
                                                    </td>

                                                    {/* Total Obtained */}
                                                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                                                        {row.status === 'graded' ? (
                                                            <span>{row.totalObtained}</span>
                                                        ) : (
                                                            <span className="text-rose-500 font-bold uppercase text-[11px]">{row.status}</span>
                                                        )}
                                                    </td>

                                                    {/* Percentage */}
                                                    <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700">
                                                        {row.status === 'graded' ? (
                                                            <span>{row.percentage}%</span>
                                                        ) : (
                                                            <span>—</span>
                                                        )}
                                                    </td>

                                                    {/* Performance Tier Badge */}
                                                    <td className="py-3 px-3 text-center">
                                                        {row.status === 'graded' ? (
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                                row.tier === 'exceeding'
                                                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                                    : row.tier === 'meeting'
                                                                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                                                    : row.tier === 'approaching'
                                                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                                                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                                                            }`}>
                                                                {row.tierLabel}
                                                            </span>
                                                        ) : (
                                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                                {row.tierLabel}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Verdict */}
                                                    <td className="py-3 px-3 text-center">
                                                        {row.status === 'graded' ? (
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                                                row.isPassed
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : 'bg-rose-100 text-rose-800'
                                                            }`}>
                                                                {row.isPassed ? 'Pass' : 'Fail'}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 font-bold text-[11px]">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}

                                            {filteredRows.length === 0 && (
                                                <tr>
                                                    <td colSpan="10" className="text-center py-10 text-slate-400">
                                                        No candidates match your search filter.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>

                                        {/* CLASS AVERAGE STICKY FOOTER ROW */}
                                        <tfoot className="bg-slate-100/90 font-bold text-slate-800 border-t-2 border-slate-300">
                                            <tr>
                                                <td colSpan="4" className="py-3.5 px-4 text-right uppercase tracking-wider text-[11px] text-slate-600 font-extrabold">
                                                    Cohort Live Summary & Class Mean:
                                                </td>
                                                <td className="py-3.5 px-3 text-center font-mono text-xs text-[#0B3B24]">
                                                    Avg: {metrics.totalTheoryAvg}
                                                </td>
                                                <td className="py-3.5 px-3 text-center font-mono text-xs text-[#0B3B24]">
                                                    Avg: {metrics.totalPracticalAvg}
                                                </td>
                                                <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-900">
                                                    Max: {totalMaxMarks}
                                                </td>
                                                <td className="py-3.5 px-3 text-center font-mono text-xs text-[#0B3B24]">
                                                    Mean: {metrics.meanScore}%
                                                </td>
                                                <td className="py-3.5 px-3 text-center text-xs text-emerald-700">
                                                    Pass Rate: {metrics.passRate}%
                                                </td>
                                                <td className="py-3.5 px-3 text-center">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-black">
                                                        LIVE
                                                    </span>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {/* Bottom Save Bar */}
                                {!isLocked && (
                                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                                        <p className="text-xs text-slate-500 font-medium">
                                            Auto-calculates student percentages and performance tiers in real-time. Click Save to persist records.
                                        </p>
                                        <div className="flex items-center space-x-3">
                                            <Link
                                                href={route('teacher.exams.index', { batchId: exam.batch_id })}
                                                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-sm"
                                            >
                                                Back to Cockpit
                                            </Link>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-6 py-2 rounded-xl bg-[#0B3B24] hover:bg-[#124E31] text-white text-xs font-extrabold transition shadow-sm flex items-center space-x-2 disabled:opacity-50"
                                            >
                                                <Save className="h-4 w-4 text-emerald-400" />
                                                <span>{processing ? 'Saving Changes...' : 'Save & Lock In Marks'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                ) : (
                    /* 4. MODE: RESULTS & RANKING MERIT VIEW */
                    <div className="space-y-6">
                        {/* Visual Analytics Grid: Distribution Bar Chart & Merit Podium */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Score Distribution Chart */}
                            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <div className="flex items-center space-x-2">
                                        <div className="h-8 w-8 rounded-xl bg-emerald-50 text-[#0B3B24] flex items-center justify-center">
                                            <BarChart3 className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 font-serif">
                                                Tier Frequency & Score Distribution
                                            </h3>
                                            <p className="text-[11px] text-slate-500">
                                                Candidate grouping by official institutional performance standards
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                        {metrics.totalCandidates} Total Cohort
                                    </span>
                                </div>

                                {/* SVG / CSS Visual Bar Chart */}
                                <div className="space-y-3 pt-2">
                                    {[
                                        { label: 'Exceeding Standards (80–100%)', count: metrics.exceedingCount, color: 'bg-emerald-500', barBg: 'bg-emerald-50 text-emerald-800' },
                                        { label: 'Meeting Standards (60–79%)', count: metrics.meetingCount, color: 'bg-blue-500', barBg: 'bg-blue-50 text-blue-800' },
                                        { label: 'Approaching Standards (50–59%)', count: metrics.approachingCount, color: 'bg-amber-500', barBg: 'bg-amber-50 text-amber-800' },
                                        { label: 'Below Minimum Standard (<50%)', count: metrics.belowCount, color: 'bg-rose-500', barBg: 'bg-rose-50 text-rose-800' },
                                    ].map((tierItem, i) => {
                                        const pct = metrics.totalCandidates > 0 ? (tierItem.count / metrics.totalCandidates) * 100 : 0;
                                        return (
                                            <div key={i} className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="font-semibold text-slate-700">{tierItem.label}</span>
                                                    <span className="font-mono font-bold text-slate-900">
                                                        {tierItem.count} candidates ({Math.round(pct)}%)
                                                    </span>
                                                </div>
                                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                                                    <div
                                                        className={`h-full ${tierItem.color} rounded-full transition-all duration-500`}
                                                        style={{ width: `${pct}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Top 3 Honor Podium */}
                            <div className="lg:col-span-5 bg-gradient-to-br from-[#0B3B24] to-[#124E31] rounded-2xl p-6 text-white shadow-md flex flex-col justify-between space-y-4">
                                <div>
                                    <div className="flex items-center justify-between pb-3 border-b border-emerald-800/60">
                                        <div className="flex items-center space-x-2">
                                            <Trophy className="h-5 w-5 text-amber-400" />
                                            <h3 className="text-sm font-bold text-white font-serif">
                                                Honor Roll & Top Achievers
                                            </h3>
                                        </div>
                                        <span className="text-[11px] font-semibold text-emerald-200">
                                            PBTE Mock Distinction
                                        </span>
                                    </div>

                                    <div className="space-y-3 mt-4">
                                        {rankedRows.slice(0, 3).map((topStudent, idx) => (
                                            <div
                                                key={topStudent.enrollment.id}
                                                className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-between"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-9 w-9 rounded-full bg-amber-400/20 text-amber-300 font-black text-sm flex items-center justify-center border border-amber-400/30">
                                                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-xs">
                                                            {topStudent.candidateName}
                                                        </p>
                                                        <p className="text-[10px] text-emerald-200 font-mono">
                                                            Roll: {topStudent.rollNumber}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-mono font-bold text-amber-300 text-sm">
                                                        {topStudent.percentage}%
                                                    </p>
                                                    <p className="text-[10px] text-emerald-100">
                                                        {topStudent.totalObtained} / {totalMaxMarks} Marks
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                        {rankedRows.length === 0 && (
                                            <p className="text-xs text-emerald-200 text-center py-4">
                                                No scored candidates recorded yet.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-emerald-800/60 flex items-center justify-between text-xs text-emerald-200">
                                    <span>Session Batch: {exam.batch?.name}</span>
                                    <button
                                        onClick={handleExportCSV}
                                        className="text-amber-300 hover:underline font-bold flex items-center space-x-1"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        <span>Download CSV Roster</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Ranked Full Cohort Merit Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Trophy className="h-4 w-4 text-amber-500" />
                                    <h3 className="font-bold text-slate-900 text-sm font-serif">
                                        Formal Assessment Merit List & Standing Ranks
                                    </h3>
                                </div>
                                <span className="text-xs font-semibold text-slate-500">
                                    Ranked by Combined Score (Descending)
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                                            <th className="py-3 px-3 text-center w-16">Rank</th>
                                            <th className="py-3 px-4 min-w-[200px]">Candidate Trainee</th>
                                            <th className="py-3 px-3 font-mono">Roll Number</th>
                                            <th className="py-3 px-3 text-center">Theory Score</th>
                                            <th className="py-3 px-3 text-center">Practical Score</th>
                                            <th className="py-3 px-3 text-center font-mono">Total Obtained</th>
                                            <th className="py-3 px-3 text-center font-mono">% Percentage</th>
                                            <th className="py-3 px-3 text-center">Performance Pill</th>
                                            <th className="py-3 px-3 text-center">Verdict</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {rankedRows.map((row) => (
                                            <tr key={row.enrollment.id} className="hover:bg-slate-50 transition">
                                                <td className="py-3 px-3 text-center">
                                                    {row.rank === 1 ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                                            🥇 1st
                                                        </span>
                                                    ) : row.rank === 2 ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300">
                                                            🥈 2nd
                                                        </span>
                                                    ) : row.rank === 3 ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                            🥉 3rd
                                                        </span>
                                                    ) : (
                                                        <span className="font-mono font-bold text-slate-500">
                                                            #{row.rank}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3 px-4">
                                                    <p className="font-bold text-slate-900">{row.candidateName}</p>
                                                    <p className="text-[11px] text-slate-500">S/D of {row.fatherName}</p>
                                                </td>

                                                <td className="py-3 px-3 font-mono font-bold text-slate-700">
                                                    {row.rollNumber}
                                                </td>

                                                <td className="py-3 px-3 text-center font-mono">
                                                    {row.status === 'graded' ? `${row.thNum} / ${maxTheory}` : '—'}
                                                </td>

                                                <td className="py-3 px-3 text-center font-mono">
                                                    {row.status === 'graded' ? `${row.prNum} / ${maxPractical}` : '—'}
                                                </td>

                                                <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                                                    {row.status === 'graded' ? `${row.totalObtained} / ${totalMaxMarks}` : row.status.toUpperCase()}
                                                </td>

                                                <td className="py-3 px-3 text-center font-mono font-bold text-[#0B3B24]">
                                                    {row.status === 'graded' ? `${row.percentage}%` : '—'}
                                                </td>

                                                <td className="py-3 px-3 text-center">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                        row.tier === 'exceeding'
                                                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                            : row.tier === 'meeting'
                                                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                                            : row.tier === 'approaching'
                                                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                                                    }`}>
                                                        {row.tierLabel}
                                                    </span>
                                                </td>

                                                <td className="py-3 px-3 text-center">
                                                    {row.status === 'graded' ? (
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                                            row.isPassed
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-rose-100 text-rose-800'
                                                        }`}>
                                                            {row.isPassed ? 'Pass' : 'Fail'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 font-bold text-[11px]">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}