import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import {
 BookOpen,
 Calendar,
 UploadCloud,
 FileText,
 CheckCircle2,
 ArrowLeft,
 Building2,
 Sparkles,
 Clock,
 Paperclip,
 Layers,
 PlusCircle,
 Inbox
} from 'lucide-react';

export default function Index({ batch, subjects = [], lessonPlans = [] }) {
 const course = batch.course;
 const trade = course?.trade;
 const dept = trade?.program?.department;

 const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
 subject_id: subjects[0]?.id || '',
 title: '',
 planned_date: new Date().toISOString().substring(0, 10),
 description: '',
 document: null,
 });

 const [fileName, setFileName] = useState('');

 const handleSubmit = (e) => {
 e.preventDefault();
 post(route('teacher.lesson-plans.store', { batchId: batch.id }), {
 forceFormData: true,
 onSuccess: () => {
 reset('title', 'description', 'document');
 setFileName('');
 },
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
 Lesson Plans: {batch.name}
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 {course?.name} ({trade?.name}) • {dept?.name}
 </p>
 </div>
 </div>

 <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-govt-green-500/10 text-govt-green border border-indigo-500/20">
 {batch.shift || 'Morning'} Shift • Session {batch.session_year || '2026-2027'}
 </span>
 </div>
 }
 >
 <Head title={`Lesson Plans - ${batch.name}`} />

 <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
 {/* Header Banner */}
 <div className="rounded-xl bg-gradient-to-r from-govt-green via-govt-green-500 to-indigo-950 border border-gray-200 p-6 text-white shadow-govt-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div className="space-y-1">
 <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-govt-green-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
 <Sparkles className="h-3 w-3" />
 <span>CBT&A Competency Delivery</span>
 </div>
                    <h3 className="text-xl font-extrabold text-white font-serif">
                        Daily Instructional & Practical Lesson Plans
                    </h3>
                    <p className="text-xs text-green-100">
                        Record structured training objectives, upload workshop schematics, and publish lesson materials.
                    </p>
 </div>

 <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200/80 text-center shrink-0">
 <p className="text-[10px] text-gray-500 uppercase font-bold">Published Plans</p>
 <p className="text-2xl font-black text-indigo-600">{lessonPlans.length}</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 {/* Left Column (5 Cols): Create Lesson Plan Form */}
 <div className="lg:col-span-5 space-y-6">
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
 <div className="flex items-center space-x-2.5 pb-3 border-b border-gray-100 ">
 <div className="h-8 w-8 rounded-xl bg-govt-green-500/10 text-govt-green-500 flex items-center justify-center">
 <PlusCircle className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-gray-900 ">
 Create New Lesson Plan
 </h3>
 <p className="text-[11px] text-gray-500 ">
 Fill in daily teaching curriculum details
 </p>
 </div>
 </div>

 {recentlySuccessful && (
 <div className="p-3 rounded-xl bg-govt-green-500/10 border border-govt-green-200 text-govt-green-500 text-xs font-semibold flex items-center space-x-2">
 <CheckCircle2 className="h-4 w-4 shrink-0" />
 <span>Lesson plan published successfully!</span>
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4 text-xs">
 {/* Subject Dropdown */}
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Curriculum Subject / Module <span className="text-rose-500">*</span>
 </label>
 <select
 value={data.subject_id}
 onChange={(e) => setData('subject_id', e.target.value)}
 className={`w-full px-3 py-2 bg-govt-cream border rounded-xl font-medium focus:outline-none focus:ring-2 ${
 errors.subject_id
 ? 'border-rose-500 focus:ring-rose-500/30 text-rose-600'
 : 'border-gray-200 text-gray-900 focus:ring-govt-green-400/30'
 }`}
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

 {/* Lesson Title */}
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Lesson Topic / Title <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 placeholder="e.g. SMAW Arc Welding Safety & Electrode Setup"
 value={data.title}
 onChange={(e) => setData('title', e.target.value)}
 className={`w-full px-3 py-2 bg-govt-cream border rounded-xl font-medium focus:outline-none focus:ring-2 ${
 errors.title
 ? 'border-rose-500 focus:ring-rose-500/30'
 : 'border-gray-200 text-gray-900 focus:ring-govt-green-400/30'
 }`}
 />
 {errors.title && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>
 )}
 </div>

 {/* Planned Date */}
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Planned Delivery Date <span className="text-rose-500">*</span>
 </label>
 <input
 type="date"
 value={data.planned_date}
 onChange={(e) => setData('planned_date', e.target.value)}
 className={`w-full px-3 py-2 bg-govt-cream border rounded-xl font-medium focus:outline-none focus:ring-2 ${
 errors.planned_date
 ? 'border-rose-500 focus:ring-rose-500/30'
 : 'border-gray-200 text-gray-900 focus:ring-govt-green-400/30'
 }`}
 />
 {errors.planned_date && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.planned_date}</p>
 )}
 </div>

 {/* Description / Learning Objectives */}
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Learning Objectives & Methodology
 </label>
 <textarea
 rows={4}
 placeholder="Outline specific CBT&A competency tasks, equipment required, and practical demonstration steps..."
 value={data.description}
 onChange={(e) => setData('description', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-govt-green-400/30"
 />
 {errors.description && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.description}</p>
 )}
 </div>

 {/* File Attachment */}
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Attach Handout / Slides / Schematic (Max 5MB)
 </label>
 <div className="relative border-2 border-dashed border-gray-200 hover:border-indigo-500/50 rounded-2xl p-4 text-center bg-govt-cream/50 transition">
 <UploadCloud className="h-6 w-6 text-gray-500 mx-auto mb-1" />
 <input
 type="file"
 accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
 onChange={(e) => {
 const file = e.target.files[0];
 setData('document', file);
 setFileName(file ? file.name : '');
 }}
 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
 />
 <p className="text-xs font-bold text-gray-700 ">
 {fileName || 'Click to select file'}
 </p>
 <p className="text-[10px] text-gray-500 mt-0.5">
 PDF, Word, PowerPoint, or Images
 </p>
 </div>
 {errors.document && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.document}</p>
 )}
 </div>

 <button
 type="submit"
 disabled={processing}
 className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-govt-green-500 text-white font-bold transition shadow-md shadow-indigo-950/40 disabled:opacity-50 flex items-center justify-center space-x-2"
 >
 <PlusCircle className="h-4 w-4" />
 <span>{processing ? 'Publishing Plan...' : 'Publish Lesson Plan'}</span>
 </button>
 </form>
 </div>
 </div>

 {/* Right Column (7 Cols): Lesson Plans Timeline */}
 <div className="lg:col-span-7 space-y-4">
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs">
 <h3 className="font-bold text-gray-900 flex items-center space-x-2">
 <BookOpen className="h-4 w-4 text-indigo-500" />
 <span>Lesson Plan Schedule</span>
 </h3>
 <span className="text-gray-500">{lessonPlans.length} Total</span>
 </div>

 <div className="space-y-3">
 {lessonPlans.map((plan) => (
 <div
 key={plan.id}
 className="p-4 rounded-2xl bg-govt-cream border border-gray-200/80 space-y-2 hover:border-indigo-500/40 transition"
 >
 <div className="flex items-start justify-between gap-3">
 <div>
 <div className="flex flex-wrap items-center gap-2 mb-1">
 <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-govt-green-500/10 text-govt-green border border-indigo-500/20">
 {plan.subject?.name || 'General'}
 </span>
 <span className="flex items-center space-x-1 text-[11px] font-semibold text-gray-500 ">
 <Calendar className="h-3 w-3" />
 <span>{plan.planned_date}</span>
 </span>
 </div>
 <h4 className="text-sm font-bold text-gray-900 ">
 {plan.title}
 </h4>
 </div>

 {plan.file_path && (
 <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-govt-green-500/10 text-emerald-700 border border-govt-green-200 shrink-0">
 <Paperclip className="h-3 w-3" />
 <span>Handout</span>
 </span>
 )}
 </div>

 {plan.description && (
 <p className="text-xs text-gray-600 leading-relaxed">
 {plan.description}
 </p>
 )}
 </div>
 ))}

 {lessonPlans.length === 0 && (
 <div className="text-center py-12 space-y-2">
 <Inbox className="h-10 w-10 text-gray-500 mx-auto" />
 <p className="text-xs font-bold text-gray-700 ">
 No lesson plans published for this batch yet.
 </p>
 <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
 Use the form on the left to structure daily lecture topics and upload training handouts.
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
