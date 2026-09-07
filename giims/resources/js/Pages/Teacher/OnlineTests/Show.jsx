import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import {
 ArrowLeft,
 Monitor,
 Upload,
 CheckCircle2,
 Clock,
 FileQuestion,
 Users,
 Play,
 Pause,
 Award,
 FileSpreadsheet,
 AlertCircle,
 BadgeCheck,
 BarChart3
} from 'lucide-react';

export default function Show({ test }) {
 const [activeTab, setActiveTab] = useState('questions'); // 'questions', 'upload', 'results'

 const { data, setData, post, processing, errors, recentlySuccessful, reset } = useForm({
 csv_file: null,
 });

 const handleBulkUpload = (e) => {
 e.preventDefault();
 post(route('teacher.online-tests.bulk-upload', test.id), {
 forceFormData: true,
 onSuccess: () => {
 reset();
 setActiveTab('questions');
 },
 });
 };

 const togglePublish = () => {
 router.patch(route('teacher.online-tests.publish', test.id));
 };

 const handleForceSubmit = (attemptId) => {
 if (confirm('Execute Emergency Manual Submit? This will instantly auto-grade all answers stored so far.')) {
 router.post(route('teacher.online-tests.force-submit', [test.id, attemptId]));
 }
 };

 return (
 <AuthenticatedLayout
 header={
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="flex items-center space-x-3">
 <Link
 href={route('teacher.online-tests.index', test.batch_id)}
 className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 :bg-govt-cream-300 text-gray-700 transition"
 >
 <ArrowLeft className="h-4 w-4" />
 </Link>
 <div>
 <div className="flex items-center space-x-2">
 <span
 className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
 test.status === 'published'
 ? 'bg-govt-green-500/15 text-emerald-700 border border-govt-green-200'
 : 'bg-govt-gold-50 text-amber-700 border border-govt-gold-200'
 }`}
 >
 {test.status === 'published' ? 'Published / Live' : 'Draft Mode'}
 </span>
 <span className="text-xs text-gray-500 font-mono">
 {test.duration_minutes} Mins Duration
 </span>
 </div>
 <h2 className="text-xl font-extrabold leading-tight text-gray-800 mt-1">
 {test.title}
 </h2>
 <p className="text-xs text-gray-500 ">
 {test.batch?.name} • {test.batch?.course?.name}
 </p>
 </div>
 </div>

 <div className="flex items-center space-x-3">
 <button
 type="button"
 onClick={togglePublish}
 className={`px-4 py-2 rounded-xl text-xs font-extrabold transition shadow-sm flex items-center space-x-2 ${
 test.status === 'published'
 ? 'bg-govt-gold hover:bg-amber-600 text-white'
 : 'bg-govt-green hover:bg-govt-green-500 text-white shadow-emerald-950/20'
 }`}
 >
 {test.status === 'published' ? (
 <>
 <Pause className="h-4 w-4" />
 <span>Unpublish to Draft</span>
 </>
 ) : (
 <>
 <Play className="h-4 w-4" />
 <span>Publish for Trainees</span>
 </>
 )}
 </button>
 </div>
 </div>
 }
 >
 <Head title={`Manage Test - ${test.title}`} />

 <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
 {/* TABS NAVIGATION */}
 <div className="flex items-center space-x-2 border-b border-gray-200 pb-3">
 <button
 onClick={() => setActiveTab('questions')}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
 activeTab === 'questions'
 ? 'bg-indigo-600 text-white shadow-sm'
 : 'text-gray-600 hover:bg-govt-cream-300 :bg-govt-cream-300'
 }`}
 >
 <FileQuestion className="h-4 w-4" />
 <span>Question Bank ({test.questions?.length ?? 0})</span>
 </button>

 <button
 onClick={() => setActiveTab('upload')}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
 activeTab === 'upload'
 ? 'bg-indigo-600 text-white shadow-sm'
 : 'text-gray-600 hover:bg-govt-cream-300 :bg-govt-cream-300'
 }`}
 >
 <Upload className="h-4 w-4" />
 <span>Bulk Upload (CSV)</span>
 </button>

 <button
 onClick={() => setActiveTab('results')}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
 activeTab === 'results'
 ? 'bg-indigo-600 text-white shadow-sm'
 : 'text-gray-600 hover:bg-govt-cream-300 :bg-govt-cream-300'
 }`}
 >
 <BarChart3 className="h-4 w-4" />
 <span>Student Results ({test.attempts?.length ?? 0})</span>
 </button>
 </div>

 {/* TAB 1: QUESTION BANK */}
 {activeTab === 'questions' && (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-extrabold text-gray-900 ">
 Questions in this Examination ({test.questions?.length ?? 0})
 </h3>
 <button
 onClick={() => setActiveTab('upload')}
 className="px-3 py-1.5 rounded-xl bg-govt-green-50 text-govt-green-500 border border-indigo-200 text-xs font-bold hover:bg-indigo-100 transition flex items-center space-x-1.5"
 >
 <Upload className="h-3.5 w-3.5" />
 <span>Bulk Upload Questions</span>
 </button>
 </div>

 <div className="space-y-3">
 {test.questions && test.questions.length > 0 ? (
 test.questions.map((q, idx) => (
 <div
 key={q.id}
 className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3"
 >
 <div className="flex items-start justify-between gap-3">
 <div className="flex items-start space-x-3">
 <span className="h-6 w-6 rounded-lg bg-govt-cream-300 text-gray-700 flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5">
 {idx + 1}
 </span>
 <p className="font-bold text-sm text-gray-900 ">
 {q.question_text}
 </p>
 </div>
 <span className="text-[10px] font-bold uppercase tracking-wider bg-govt-cream-300 text-gray-500 px-2 py-0.5 rounded-md shrink-0">
 {q.marks} Mark{q.marks > 1 ? 's' : ''}
 </span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
 <div
 className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
 q.correct_option === 'A'
 ? 'bg-govt-green-500/10 border-emerald-500/40 text-emerald-800 font-bold'
 : 'bg-govt-cream border-gray-200 text-gray-600 '
 }`}
 >
 <span className="h-5 w-5 rounded bg-slate-200 flex items-center justify-center font-bold text-[10px] shrink-0">
 A
 </span>
 <span>{q.option_a}</span>
 {q.correct_option === 'A' && (
 <BadgeCheck className="h-4 w-4 text-govt-green-500 ml-auto shrink-0" />
 )}
 </div>

 <div
 className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
 q.correct_option === 'B'
 ? 'bg-govt-green-500/10 border-emerald-500/40 text-emerald-800 font-bold'
 : 'bg-govt-cream border-gray-200 text-gray-600 '
 }`}
 >
 <span className="h-5 w-5 rounded bg-slate-200 flex items-center justify-center font-bold text-[10px] shrink-0">
 B
 </span>
 <span>{q.option_b}</span>
 {q.correct_option === 'B' && (
 <BadgeCheck className="h-4 w-4 text-govt-green-500 ml-auto shrink-0" />
 )}
 </div>

 <div
 className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
 q.correct_option === 'C'
 ? 'bg-govt-green-500/10 border-emerald-500/40 text-emerald-800 font-bold'
 : 'bg-govt-cream border-gray-200 text-gray-600 '
 }`}
 >
 <span className="h-5 w-5 rounded bg-slate-200 flex items-center justify-center font-bold text-[10px] shrink-0">
 C
 </span>
 <span>{q.option_c}</span>
 {q.correct_option === 'C' && (
 <BadgeCheck className="h-4 w-4 text-govt-green-500 ml-auto shrink-0" />
 )}
 </div>

 <div
 className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
 q.correct_option === 'D'
 ? 'bg-govt-green-500/10 border-emerald-500/40 text-emerald-800 font-bold'
 : 'bg-govt-cream border-gray-200 text-gray-600 '
 }`}
 >
 <span className="h-5 w-5 rounded bg-slate-200 flex items-center justify-center font-bold text-[10px] shrink-0">
 D
 </span>
 <span>{q.option_d}</span>
 {q.correct_option === 'D' && (
 <BadgeCheck className="h-4 w-4 text-govt-green-500 ml-auto shrink-0" />
 )}
 </div>
 </div>
 </div>
 ))
 ) : (
 <div className="text-center py-16 bg-white rounded-xl border border-gray-200 text-gray-500 space-y-3">
 <FileQuestion className="h-10 w-10 mx-auto opacity-50" />
 <p className="font-bold">No questions added yet.</p>
 <p className="text-xs">
 Use the CSV Bulk Uploader to quickly import 10, 50, or 100 MCQs in seconds!
 </p>
 <button
 onClick={() => setActiveTab('upload')}
 className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-govt-green-500 text-white text-xs font-extrabold transition shadow-sm inline-flex items-center space-x-2"
 >
 <Upload className="h-3.5 w-3.5" />
 <span>Go to CSV Bulk Uploader</span>
 </button>
 </div>
 )}
 </div>
 </div>
 )}

 {/* TAB 2: BULK UPLOAD CSV */}
 {activeTab === 'upload' && (
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 <div className="lg:col-span-7 space-y-4">
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-5">
 <div className="flex items-center space-x-3 pb-3 border-b border-gray-100 ">
 <div className="p-2 rounded-xl bg-govt-green-500/10 text-govt-green-500 ">
 <FileSpreadsheet className="h-6 w-6" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-gray-900 ">
 Bulk Import MCQs from CSV / Excel
 </h3>
 <p className="text-xs text-gray-500 ">
 Upload your spreadsheet with multiple choice questions and answers
 </p>
 </div>
 </div>

 {recentlySuccessful && (
 <div className="p-4 rounded-2xl bg-govt-green-500/10 border border-govt-green-200 text-govt-green-500 text-xs font-bold flex items-center space-x-2">
 <CheckCircle2 className="h-5 w-5 shrink-0" />
 <span>Questions successfully imported into this test!</span>
 </div>
 )}

 <form onSubmit={handleBulkUpload} className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-gray-700 mb-1.5">
 Select CSV File (.csv) <span className="text-rose-500">*</span>
 </label>
 <input
 type="file"
 accept=".csv,text/csv,text/plain"
 onChange={(e) => setData('csv_file', e.target.files[0])}
 className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-govt-green-50 :bg-indigo-950/50 file:text-govt-green-500 :text-indigo-600 hover:file:bg-indigo-100 :file:bg-indigo-900/50 cursor-pointer border border-gray-200 rounded-xl p-2 bg-govt-cream "
 />
 {errors.csv_file && (
 <p className="text-xs text-rose-500 mt-1">{errors.csv_file}</p>
 )}
 </div>

 <button
 type="submit"
 disabled={processing || !data.csv_file}
 className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-govt-green-500 text-white font-extrabold text-xs transition shadow-md shadow-indigo-950/20 disabled:opacity-50 flex items-center justify-center space-x-2"
 >
 <Upload className="h-4 w-4" />
 <span>{processing ? 'Importing Questions...' : 'Upload and Process CSV'}</span>
 </button>
 </form>
 </div>
 </div>

 {/* CSV FORMAT SPECIFICATION */}
 <div className="lg:col-span-5 space-y-4">
 <div className="p-6 rounded-xl bg-white border border-gray-200 space-y-4">
 <div className="flex items-center space-x-2">
 <AlertCircle className="h-5 w-5 text-govt-gold-600" />
 <h4 className="text-sm font-extrabold text-gray-900">
 Required CSV Columns Structure
 </h4>
 </div>
 <p className="text-xs text-gray-600 leading-relaxed">
 Ensure your CSV file contains exactly 6 columns in this precise sequence:
 </p>

 <div className="p-3.5 rounded-2xl bg-govt-cream-300/80 border border-gray-200 font-mono text-[11px] text-gray-600 space-y-1.5">
 <p className="text-indigo-600 font-bold">Question, OptionA, OptionB, OptionC, OptionD, CorrectOption</p>
 <p className="text-gray-500">"What is Ohm's Law formula?","V = I * R","P = V * I","E = mc^2","V = I / R","A"</p>
 <p className="text-gray-500">"Fire extinguisher for electrical fire?","Class C / CO2","Water","Foam","None","A"</p>
 </div>

 <ul className="text-xs text-gray-500 space-y-1.5 list-disc pl-4">
 <li>The first row can be a header row (it will be automatically skipped).</li>
                        <li><span className="text-gray-900 font-semibold">CorrectOption</span> must be <span className="text-govt-green-500 font-bold">A</span>, <span className="text-govt-green-500 font-bold">B</span>, <span className="text-govt-green-500 font-bold">C</span>, or <span className="text-govt-green-500 font-bold">D</span>.</li>
 <li>Each question is automatically assigned 1 mark.</li>
 </ul>
 </div>
 </div>
 </div>
 )}

 {/* TAB 3: STUDENT RESULTS TABLE */}
 {activeTab === 'results' && (
 <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden space-y-4 p-6">
 <div className="flex items-center justify-between pb-3 border-b border-gray-100 ">
 <div>
 <h3 className="text-sm font-extrabold text-gray-900 ">
 Live Trainee CBT Scores & Results ({test.attempts?.length ?? 0})
 </h3>
 <p className="text-xs text-gray-500 ">
 Automated grading results generated instantly upon trainee submission
 </p>
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
 <th className="pb-3">Trainee Name</th>
 <th className="pb-3">CNIC</th>
 <th className="pb-3">Submitted At</th>
 <th className="pb-3 text-center">Score</th>
 <th className="pb-3 text-center">Percentage</th>
 <th className="pb-3 text-right">Performance Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 font-medium">
 {test.attempts && test.attempts.length > 0 ? (
 test.attempts.map((attempt) => {
 const pct = attempt.total_questions > 0
 ? Math.round((attempt.score / attempt.total_questions) * 100)
 : 0;
 return (
 <tr key={attempt.id} className="hover:bg-govt-green-50/50 :bg-white/40">
 <td className="py-3 font-bold text-gray-900 ">
 {attempt.student_profile?.user?.name ?? 'Trainee'}
 </td>
 <td className="py-3 font-mono text-gray-500">
 {attempt.student_profile?.cnic ?? 'N/A'}
 </td>
 <td className="py-3 text-gray-500">
 {attempt.end_time ? new Date(attempt.end_time).toLocaleString() : 'N/A'}
 </td>
 <td className="py-3 text-center font-extrabold text-gray-900 ">
 {attempt.score} / {attempt.total_questions}
 </td>
 <td className="py-3 text-center">
 <span className="font-bold text-gray-800 ">
 {pct}%
 </span>
 </td>
 <td className="py-3 text-right">
 <div className="flex items-center justify-end space-x-2">
 <span
 className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
 attempt.status === 'in_progress'
 ? 'bg-govt-gold-50 text-amber-600 border border-govt-gold-200'
 : pct >= 50
 ? 'bg-govt-green-500/15 text-govt-green-500 '
 : 'bg-rose-500/15 text-rose-600 '
 }`}
 >
 {attempt.status === 'in_progress'
 ? 'In Progress'
 : pct >= 50
 ? 'Competent (Pass)'
 : 'NYC (Re-sit)'}
 </span>

 {attempt.status === 'in_progress' && (
 <button
 type="button"
 onClick={() => handleForceSubmit(attempt.id)}
 className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold tracking-tight transition shadow-sm"
 title="Force submit if student computer crashed or connection lost"
 >
 Force Submit
 </button>
 )}
 </div>
 </td>
 </tr>
 );
 })
 ) : (
 <tr>
 <td colSpan="6" className="py-8 text-center text-gray-500">
 No trainee submissions recorded yet for this test.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </div>
 </AuthenticatedLayout>
 );
}