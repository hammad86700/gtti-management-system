import { useState } from 'react';
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
 Layers,
 ChevronRight,
 Users
} from 'lucide-react';

export default function Index({ batch, subjects = [], exams = [] }) {
 const course = batch.course;
 const trade = course?.trade;
 const dept = trade?.program?.department;
 const todayDate = new Date().toISOString().split('T')[0];

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

 return (
 <AuthenticatedLayout
 header={
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <Link
 href={route('teacher.dashboard')}
 className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 :bg-govt-cream-300 text-gray-700 transition"
 >
 <ArrowLeft className="h-4 w-4" />
 </Link>
 <div>
 <h2 className="text-xl font-bold leading-tight text-gray-800 ">
 Examinations & Marks Entry: {batch.name}
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 {course?.name} ({trade?.name}) • {dept?.name}
 </p>
 </div>
 </div>

 <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
 {batch.shift || 'Morning'} Shift • {exams.length} Assessments
 </span>
 </div>
 }
 >
 <Head title={`Examinations - ${batch.name}`} />

 <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
 {/* Hero Banner */}
 <div className="rounded-xl bg-gradient-to-r from-govt-green via-govt-green-500 to-amber-950 border border-gray-200 p-6 text-white shadow-govt-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div className="space-y-1">
 <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-govt-gold-50 text-govt-gold border border-govt-gold-200 text-xs font-semibold">
 <Sparkles className="h-3 w-3" />
 <span>PBTE / NAVTTC Examination Protocol</span>
 </div>
                    <h3 className="text-xl font-extrabold text-white font-serif">
                        Formal Theory & Practical Marks Gradebook
                    </h3>
                    <p className="text-xs text-green-100">
                        Create formal examination events, record candidate score breakdowns, and submit for tamper-proof administrative result locking.
                    </p>
 </div>

 <div className="flex items-center space-x-3 shrink-0">
 <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200/80 text-center">
 <p className="text-[10px] text-gray-500 uppercase font-bold">Total Exams</p>
 <p className="text-2xl font-black text-govt-gold-600">{exams.length}</p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 {/* LEFT COLUMN (5 Cols): CREATE EXAM FORM */}
 <div className="lg:col-span-5 space-y-6">
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
 <div className="flex items-center space-x-2.5 pb-3 border-b border-gray-100 ">
 <div className="h-8 w-8 rounded-xl bg-govt-gold-50 text-amber-600 flex items-center justify-center">
 <PlusCircle className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-gray-900 ">
 Schedule Examination Assessment
 </h3>
 <p className="text-[11px] text-gray-500 ">
 Configure subject, date, and theory/practical weightage
 </p>
 </div>
 </div>

 {recentlySuccessful && (
 <div className="p-3 rounded-xl bg-govt-green-500/10 border border-govt-green-200 text-govt-green-500 text-xs font-semibold flex items-center space-x-2">
 <CheckCircle2 className="h-4 w-4 shrink-0" />
 <span>Examination event created successfully!</span>
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4 text-xs">
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Curriculum Subject / Trade Module <span className="text-rose-500">*</span>
 </label>
 <select
 value={data.subject_id}
 onChange={(e) => setData('subject_id', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-gray-900 "
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
 <label className="block font-bold text-gray-700 mb-1">
 Examination Title <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 placeholder="e.g. Midterm 2026 Assessment / Final PBTE Mock Exam"
 value={data.title}
 onChange={(e) => setData('title', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-gray-900 "
 />
 {errors.title && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>
 )}
 </div>

 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Conducted Date <span className="text-rose-500">*</span>
 </label>
 <input
 type="date"
 value={data.exam_date}
 onChange={(e) => setData('exam_date', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-gray-900 "
 />
 {errors.exam_date && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.exam_date}</p>
 )}
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Total Theory Marks <span className="text-rose-500">*</span>
 </label>
 <input
 type="number"
 min="0"
 max="500"
 value={data.total_theory_marks}
 onChange={(e) => setData('total_theory_marks', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium text-gray-900 "
 />
 {errors.total_theory_marks && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.total_theory_marks}</p>
 )}
 </div>

 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Total Practical Marks <span className="text-rose-500">*</span>
 </label>
 <input
 type="number"
 min="0"
 max="500"
 value={data.total_practical_marks}
 onChange={(e) => setData('total_practical_marks', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium text-gray-900 "
 />
 {errors.total_practical_marks && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.total_practical_marks}</p>
 )}
 </div>
 </div>

 <button
 type="submit"
 disabled={processing}
 className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-govt-gold text-white font-bold transition shadow-md shadow-amber-950/40 disabled:opacity-50 flex items-center justify-center space-x-2"
 >
 <PlusCircle className="h-4 w-4" />
 <span>{processing ? 'Creating Exam...' : 'Create Examination Event'}</span>
 </button>
 </form>
 </div>
 </div>

 {/* RIGHT COLUMN (7 Cols): EXAMINATIONS LIST */}
 <div className="lg:col-span-7 space-y-4">
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs">
 <h3 className="font-bold text-gray-900 flex items-center space-x-2">
 <Award className="h-4 w-4 text-govt-gold" />
 <span>Conducted Examinations & Gradebooks</span>
 </h3>
 <span className="text-gray-500">{exams.length} Events</span>
 </div>

 <div className="space-y-3">
 {exams.map((exam) => {
 const totalScore = (exam.total_theory_marks || 0) + (exam.total_practical_marks || 0);
 const resultsCount = exam.exam_results?.length || 0;

 return (
 <div
 key={exam.id}
 className="p-5 rounded-2xl bg-govt-cream border border-gray-200/80 space-y-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-500/40 transition"
 >
 <div className="space-y-1.5">
 <div className="flex flex-wrap items-center gap-2">
 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-govt-gold-50 text-amber-700 border border-govt-gold-200">
 {exam.subject?.name || 'Subject'}
 </span>

 {exam.is_locked ? (
 <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-govt-green-500/15 text-emerald-700 border border-govt-green-200">
 <Lock className="h-3 w-3" />
 <span>Officially Locked</span>
 </span>
 ) : (
 <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/15 text-blue-700 border border-blue-500/30">
 <Unlock className="h-3 w-3" />
 <span>Open for Grading</span>
 </span>
 )}
 </div>

 <h4 className="text-base font-extrabold text-gray-900 ">
 {exam.title}
 </h4>

 <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 ">
 <span className="flex items-center space-x-1">
 <Calendar className="h-3.5 w-3.5 text-gray-500" />
 <span>{exam.exam_date}</span>
 </span>
 <span>•</span>
 <span>Theory: {exam.total_theory_marks} | Practical: {exam.total_practical_marks} (Total: {totalScore})</span>
 <span>•</span>
 <span className="font-semibold text-purple-600 ">
 {resultsCount} Candidates Graded
 </span>
 </div>
 </div>

 <div className="shrink-0">
 <Link
 href={route('teacher.exams.show', { examId: exam.id })}
 className="px-4 py-2 rounded-xl bg-white hover:bg-amber-600 :bg-amber-600 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-sm"
 >
 <FileText className="h-3.5 w-3.5" />
 <span>{exam.is_locked ? 'View Results' : 'Enter Marks'}</span>
 <ChevronRight className="h-3.5 w-3.5" />
 </Link>
 </div>
 </div>
 );
 })}

 {exams.length === 0 && (
 <div className="text-center py-12 space-y-2">
 <Inbox className="h-10 w-10 text-gray-500 mx-auto" />
 <p className="text-xs font-bold text-gray-700 ">
 No examinations configured for this batch yet.
 </p>
 <p className="text-[11px] text-gray-500">
 Use the form on the left to schedule midterm, monthly, or mock tests.
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