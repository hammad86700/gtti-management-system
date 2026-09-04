import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    Award,
    Users,
    Plus,
    CheckCircle2,
    AlertCircle,
    Play,
    Shield,
    Computer,
    Wrench,
    MapPin,
    FileText,
    ArrowRight
} from 'lucide-react';

export default function Index({ exams = [], courses = [] }) {
    const [scheduleModal, setScheduleModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        course_id: courses[0]?.id || '',
        test_type: 'cbt_online',
        exam_date: new Date().toISOString().split('T')[0],
        start_time: '09:00 AM',
        venue: 'Main IT Lab 1',
        duration_minutes: 60,
        total_marks: 100,
        passing_marks: 40,
        instructions: 'Read all MCQs carefully. Calculators and electronic gadgets are strictly prohibited in the testing lab.',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('teacher.admission-tests.store'), {
            onSuccess: () => {
                setScheduleModal(false);
                reset();
            },
        });
    };

    const totalExams = exams.length;
    const liveExams = exams.filter(e => e.is_live).length;
    const totalCandidates = exams.reduce((acc, e) => acc + (e.attempts_count || 0), 0);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                    <span className="font-bold text-govt-green">Teacher Desk</span>
                    <span>/</span>
                    <span className="text-slate-900 font-semibold">Admission Entrance Testing Cockpit</span>
                </div>
            }
        >
            <Head title="Admission Entrance Tests - GTTI RYK" />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Header Banner */}
                <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-govt-green via-emerald-800 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="space-y-2 relative z-10 max-w-2xl">
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-white/15 text-emerald-200 border border-white/20">
                            TEVTA Technical Admissions 2026-2027
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                            Admission Entrance Examination Cockpit
                        </h1>
                        <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                            Organize, activate, and evaluate pre-admission screening tests for diploma and vocational trades. Control live lab activation, manage CSV question banks, and monitor applicant attempts.
                        </p>
                    </div>

                    <div className="relative z-10 shrink-0">
                        <button
                            type="button"
                            onClick={() => setScheduleModal(true)}
                            className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-white text-govt-green hover:bg-emerald-50 font-bold text-xs shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Plus className="h-4 w-4 text-govt-green" />
                            <span>Schedule Entrance Test</span>
                        </button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-govt-green shrink-0 border border-emerald-100">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Scheduled Exams</span>
                            <p className="text-2xl font-black text-gray-900">{totalExams}</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-100">
                            <Play className="h-6 w-6" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Live Tests</span>
                            <p className="text-2xl font-black text-gray-900">{liveExams}</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Registered Applicants</span>
                            <p className="text-2xl font-black text-gray-900">{totalCandidates}</p>
                        </div>
                    </div>
                </div>

                {/* Exams List */}
                <div className="rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Configured Entrance Exams</h2>
                            <p className="text-xs text-gray-500">Instructor command centers for active and upcoming screening tests</p>
                        </div>
                    </div>

                    {exams.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-50 text-gray-600 uppercase font-bold tracking-wider text-[10px] border-b border-gray-200">
                                    <tr>
                                        <th className="py-3 px-4">Course & Trade</th>
                                        <th className="py-3 px-4">Testing Methodology</th>
                                        <th className="py-3 px-4">Schedule & Venue</th>
                                        <th className="py-3 px-4">Questions Bank</th>
                                        <th className="py-3 px-4">Registered Candidates</th>
                                        <th className="py-3 px-4">Portal State</th>
                                        <th className="py-3 px-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {exams.map((exam) => (
                                        <tr key={exam.id} className="hover:bg-gray-50/70 transition">
                                            <td className="py-4 px-4">
                                                <div className="font-bold text-gray-900 text-sm">{exam.course?.name}</div>
                                                <div className="text-[11px] text-gray-500">
                                                    {exam.course?.trade?.name} • Entry: {exam.course?.entry_level}
                                                </div>
                                            </td>

                                            <td className="py-4 px-4">
                                                {exam.test_type === 'cbt_online' ? (
                                                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                                        <Computer className="h-3.5 w-3.5 text-blue-600" />
                                                        <span>Online CBT Exam</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                                                        <Wrench className="h-3.5 w-3.5 text-purple-600" />
                                                        <span>Manual Practical / Interview</span>
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-4 px-4 space-y-0.5">
                                                <div className="font-semibold text-gray-900 flex items-center space-x-1">
                                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                    <span>{new Date(exam.exam_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} at {exam.start_time}</span>
                                                </div>
                                                <div className="text-[11px] text-gray-500 flex items-center space-x-1">
                                                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                                    <span>{exam.venue} ({exam.duration_minutes} mins)</span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-4">
                                                {exam.test_type === 'cbt_online' ? (
                                                    <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200 text-[11px]">
                                                        {exam.questions_count || 0} Questions
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 italic">Practical Rubric</span>
                                                )}
                                            </td>

                                            <td className="py-4 px-4">
                                                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 text-[11px]">
                                                    {exam.attempts_count || 0} Candidates
                                                </span>
                                            </td>

                                            <td className="py-4 px-4">
                                                {exam.is_live ? (
                                                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 animate-pulse shadow-sm">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-950" />
                                                        <span>LIVE IN LAB</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                                                        <span>LOCKED / OFFLINE</span>
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-4 px-4 text-right">
                                                <Link
                                                    href={route('teacher.admission-tests.show', exam.id)}
                                                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gray-900 text-white hover:bg-black font-bold text-xs transition shadow-xs"
                                                >
                                                    <span>Open Cockpit</span>
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-16 text-center space-y-3">
                            <Computer className="h-12 w-12 text-gray-300 mx-auto" />
                            <h3 className="text-base font-bold text-gray-800">No Entrance Exams Scheduled Yet</h3>
                            <p className="text-xs text-gray-400 max-w-sm mx-auto">
                                Schedule your first CBT or practical entrance examination for prospective technical applicants.
                            </p>
                            <button
                                type="button"
                                onClick={() => setScheduleModal(true)}
                                className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl bg-govt-green text-white font-bold text-xs hover:bg-govt-green-600 transition shadow-sm"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Schedule Entrance Test</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Schedule Entrance Test Modal */}
            {scheduleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="w-full max-w-xl rounded-3xl bg-white border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">Schedule Entrance Examination</h3>
                                <p className="text-xs text-gray-500">Configure institutional screening session for candidates</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setScheduleModal(false)}
                                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Select Target Course *</label>
                                <select
                                    value={data.course_id}
                                    onChange={(e) => setData('course_id', e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-medium"
                                    required
                                >
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.trade?.name}) — {c.admission_type === 'first_come_first_served' ? 'FCFS' : 'Merit Based'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Testing Methodology *</label>
                                    <select
                                        value={data.test_type}
                                        onChange={(e) => setData('test_type', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-medium"
                                    >
                                        <option value="cbt_online">Online CBT Exam (Computer Lab)</option>
                                        <option value="manual_practical">Manual Practical / Workshop Interview</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Examination Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={data.exam_date}
                                        onChange={(e) => setData('exam_date', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Start Time *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 09:00 AM"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Venue / Lab Room *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Main IT Lab 1, Room 14"
                                        value={data.venue}
                                        onChange={(e) => setData('venue', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Duration (Min) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="10"
                                        max="300"
                                        value={data.duration_minutes}
                                        onChange={(e) => setData('duration_minutes', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Total Marks *</label>
                                    <input
                                        type="number"
                                        required
                                        min="10"
                                        max="500"
                                        value={data.total_marks}
                                        onChange={(e) => setData('total_marks', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Passing Marks *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="500"
                                        value={data.passing_marks}
                                        onChange={(e) => setData('passing_marks', e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Candidate Instructions</label>
                                <textarea
                                    rows="2"
                                    value={data.instructions}
                                    onChange={(e) => setData('instructions', e.target.value)}
                                    placeholder="Enter guidelines, prohibited items, or required stationery..."
                                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900"
                                />
                            </div>

                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-start space-x-2">
                                <CheckCircle2 className="h-4 w-4 text-govt-green shrink-0 mt-0.5" />
                                <p>
                                    All verified and submitted applications for this course will be automatically registered with initial scheduled status.
                                </p>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setScheduleModal(false)}
                                    className="py-2.5 px-4 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="py-2.5 px-5 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white font-bold transition disabled:opacity-50 shadow-sm"
                                >
                                    {processing ? 'Scheduling...' : 'Confirm & Schedule Exam'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
