import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import {
 FileText,
 Calendar,
 UploadCloud,
 CheckCircle2,
 ArrowLeft,
 Sparkles,
 Clock,
 Paperclip,
 Layers,
 PlusCircle,
 Inbox,
 Award,
 Users,
 ChevronDown,
 ChevronUp,
 Send
} from 'lucide-react';

export default function Index({ batch, subjects = [], assignments = [] }) {
 const course = batch.course;
 const trade = course?.trade;
 const dept = trade?.program?.department;

 const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
 subject_id: subjects[0]?.id || '',
 title: '',
 due_date: '',
 total_marks: 50,
 description: '',
 document: null,
 });

 const [fileName, setFileName] = useState('');
 const [expandedAssignmentId, setExpandedAssignmentId] = useState(null);

 // Grading state per submission
 const [gradingState, setGradingState] = useState({});

 const handleCreateAssignment = (e) => {
 e.preventDefault();
 post(route('teacher.assignments.store', { batchId: batch.id }), {
 forceFormData: true,
 onSuccess: () => {
 reset('title', 'description', 'document', 'due_date');
 setFileName('');
 },
 });
 };

 const handleGradeSubmit = (submissionId) => {
 const state = gradingState[submissionId] || {};
 if (state.obtained_marks === undefined || state.obtained_marks === '') {
 alert('Please enter obtained marks.');
 return;
 }

 router.patch(
 route('teacher.assignments.grade', { submissionId }),
 {
 obtained_marks: state.obtained_marks,
 feedback: state.feedback || '',
 },
 {
 preserveScroll: true,
 onSuccess: () => {
 alert('Grade and feedback saved successfully!');
 },
 }
 );
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
 Assignments & Grading: {batch.name}
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 {course?.name} ({trade?.name}) • {dept?.name}
 </p>
 </div>
 </div>

 <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
 {batch.shift || 'Morning'} Shift • Session {batch.session_year || '2026-2027'}
 </span>
 </div>
 }
 >
 <Head title={`Assignments - ${batch.name}`} />

 <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
 {/* Header Banner */}
 <div className="rounded-xl bg-gradient-to-r from-govt-green via-govt-green-500 to-purple-950 border border-gray-200 p-6 text-white shadow-govt-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div className="space-y-1">
 <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
 <Sparkles className="h-3 w-3" />
 <span>CBT&A Trainee Assessment Hub</span>
 </div>
                    <h3 className="text-xl font-extrabold text-white font-serif">
                        Practical Tasks, Quizzes & Lab Assignment Management
                    </h3>
                    <p className="text-xs text-green-100">
                        Publish trade coursework, set deadlines and maximum marks, and evaluate trainee work submissions.
                    </p>
 </div>

 <div className="flex items-center space-x-3 shrink-0">
 <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200/80 text-center">
 <p className="text-[10px] text-gray-500 uppercase font-bold">Total Tasks</p>
 <p className="text-2xl font-black text-purple-600">{assignments.length}</p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 {/* Left Column (5 Cols): Create Assignment Form */}
 <div className="lg:col-span-5 space-y-6">
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
 <div className="flex items-center space-x-2.5 pb-3 border-b border-gray-100 ">
 <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
 <PlusCircle className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-gray-900 ">
 Publish New Assignment
 </h3>
 <p className="text-[11px] text-gray-500 ">
 Specify task requirements, deadline, and total score
 </p>
 </div>
 </div>

 {recentlySuccessful && (
 <div className="p-3 rounded-xl bg-govt-green-500/10 border border-govt-green-200 text-govt-green-500 text-xs font-semibold flex items-center space-x-2">
 <CheckCircle2 className="h-4 w-4 shrink-0" />
 <span>Assignment published successfully!</span>
 </div>
 )}

 <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
 {/* Subject Dropdown */}
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Curriculum Subject / Module <span className="text-rose-500">*</span>
 </label>
 <select
 value={data.subject_id}
 onChange={(e) => setData('subject_id', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-gray-900 "
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

 {/* Title */}
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Assignment Title / Task <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 placeholder="e.g. Lab Exercise 04: Industrial Motor Control Wiring"
 value={data.title}
 onChange={(e) => setData('title', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-gray-900 "
 />
 {errors.title && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>
 )}
 </div>

 {/* Due Date & Total Marks */}
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Due Date & Time <span className="text-rose-500">*</span>
 </label>
 <input
 type="datetime-local"
 value={data.due_date}
 onChange={(e) => setData('due_date', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-gray-900 "
 />
 {errors.due_date && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.due_date}</p>
 )}
 </div>

 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Total Marks <span className="text-rose-500">*</span>
 </label>
 <input
 type="number"
 min="1"
 max="500"
 value={data.total_marks}
 onChange={(e) => setData('total_marks', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-gray-900 "
 />
 {errors.total_marks && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.total_marks}</p>
 )}
 </div>
 </div>

 {/* Description */}
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Instructions & Assessment Rubric
 </label>
 <textarea
 rows={3}
 placeholder="Detail instructions, safety guidelines, and deliverable format required..."
 value={data.description}
 onChange={(e) => setData('description', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-gray-900 "
 />
 {errors.description && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.description}</p>
 )}
 </div>

 {/* File Attachment */}
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Attach Problem Statement / Schematic (Max 5MB)
 </label>
 <div className="relative border-2 border-dashed border-gray-200 hover:border-purple-500/50 rounded-2xl p-4 text-center bg-govt-cream/50 transition">
 <UploadCloud className="h-6 w-6 text-gray-500 mx-auto mb-1" />
 <input
 type="file"
 accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.jpg,.jpeg,.png"
 onChange={(e) => {
 const file = e.target.files[0];
 setData('document', file);
 setFileName(file ? file.name : '');
 }}
 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
 />
 <p className="text-xs font-bold text-gray-700 ">
 {fileName || 'Click to select problem file'}
 </p>
 <p className="text-[10px] text-gray-500 mt-0.5">
 PDF, Word, Zip, or Image files
 </p>
 </div>
 {errors.document && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.document}</p>
 )}
 </div>

 <button
 type="submit"
 disabled={processing}
 className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-md shadow-purple-950/40 disabled:opacity-50 flex items-center justify-center space-x-2"
 >
 <PlusCircle className="h-4 w-4" />
 <span>{processing ? 'Publishing Task...' : 'Publish Assignment'}</span>
 </button>
 </form>
 </div>
 </div>

 {/* Right Column (7 Cols): Assignment List & Trainee Submissions */}
 <div className="lg:col-span-7 space-y-4">
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs">
 <h3 className="font-bold text-gray-900 flex items-center space-x-2">
 <FileText className="h-4 w-4 text-purple-500" />
 <span>Published Tasks & Submissions</span>
 </h3>
 <span className="text-gray-500">{assignments.length} Tasks</span>
 </div>

 <div className="space-y-4">
 {assignments.map((assignment) => {
 const isExpanded = expandedAssignmentId === assignment.id;
 const submissions = assignment.submissions || [];

 return (
 <div
 key={assignment.id}
 className="rounded-2xl bg-govt-cream border border-gray-200/80 overflow-hidden transition"
 >
 {/* Card Top / Header */}
 <div className="p-4 space-y-3">
 <div className="flex items-start justify-between gap-3">
 <div>
 <div className="flex flex-wrap items-center gap-2 mb-1">
 <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
 {assignment.subject?.name || 'Subject'}
 </span>
 <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-govt-green-500/10 text-emerald-700 border border-govt-green-200">
 Total: {assignment.total_marks} Marks
 </span>
 </div>
 <h4 className="text-sm font-extrabold text-gray-900 ">
 {assignment.title}
 </h4>
 </div>

 <button
 type="button"
 onClick={() => setExpandedAssignmentId(isExpanded ? null : assignment.id)}
 className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 :bg-govt-cream-300 text-gray-700 text-xs font-bold transition flex items-center space-x-1.5 shrink-0"
 >
 <Users className="h-3.5 w-3.5" />
 <span>{submissions.length} Submissions</span>
 {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
 </button>
 </div>

 <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-500 gap-2">
 <span className="flex items-center space-x-1">
 <Clock className="h-3.5 w-3.5 text-gray-500" />
 <span>Due: {assignment.due_date ? String(assignment.due_date).substring(0, 16) : 'No deadline'}</span>
 </span>
 {assignment.file_path && (
 <span className="flex items-center space-x-1 text-purple-600 font-semibold">
 <Paperclip className="h-3.5 w-3.5" />
 <span>Schematic Attached</span>
 </span>
 )}
 </div>

 {assignment.description && (
 <p className="text-xs text-gray-600 leading-relaxed">
 {assignment.description}
 </p>
 )}
 </div>

 {/* Expandable Trainee Submissions & Grading Drawer */}
 {isExpanded && (
 <div className="p-4 bg-white border-t border-gray-200 space-y-3 text-xs">
 <h5 className="font-bold text-gray-800 flex items-center space-x-1.5">
 <Award className="h-4 w-4 text-purple-500" />
 <span>Trainee Coursework Evaluation ({submissions.length})</span>
 </h5>

 {submissions.length > 0 ? (
 <div className="space-y-3">
 {submissions.map((sub) => {
 const studentUser = sub.student_profile?.user;
 const currentGrading = gradingState[sub.id] || {
 obtained_marks: sub.obtained_marks ?? '',
 feedback: sub.feedback ?? '',
 };

 return (
 <div
 key={sub.id}
 className="p-3.5 rounded-2xl bg-govt-cream border border-gray-200 space-y-3"
 >
 <div className="flex items-start justify-between gap-2">
 <div>
 <p className="font-bold text-gray-900 ">
 {studentUser?.name || 'Trainee Student'}
 </p>
 <p className="text-[10px] text-gray-500">
 Submitted: {sub.created_at ? String(sub.created_at).substring(0, 16) : 'Recent'}
 </p>
 </div>
 <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
 sub.status === 'graded'
 ? 'bg-govt-green-500/20 text-emerald-700 '
 : 'bg-blue-500/20 text-blue-700 '
 }`}>
 {sub.status === 'graded' ? `Graded: ${sub.obtained_marks}/${assignment.total_marks}` : 'Submitted'}
 </span>
 </div>

 {sub.submission_text && (
 <div className="p-2.5 rounded-xl bg-white border border-gray-200 text-[11px] text-gray-700 ">
 <p className="font-semibold text-gray-500 text-[10px] mb-0.5">Written Solution / Notes:</p>
 <p>{sub.submission_text}</p>
 </div>
 )}

 {sub.file_path && (
 <div className="flex items-center space-x-2 text-[11px] text-govt-green-500 font-semibold">
 <Paperclip className="h-3.5 w-3.5" />
 <span>Attached Coursework File: {sub.file_path}</span>
 </div>
 )}

 {/* Inline Grading Form */}
 <div className="pt-2 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
 <div>
 <input
 type="number"
 placeholder={`Score (/${assignment.total_marks})`}
 min="0"
 max={assignment.total_marks}
 value={currentGrading.obtained_marks}
 onChange={(e) =>
 setGradingState({
 ...gradingState,
 [sub.id]: {
 ...currentGrading,
 obtained_marks: e.target.value,
 },
 })
 }
 className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 font-bold"
 />
 </div>
 <div>
 <input
 type="text"
 placeholder="Feedback / Remarks"
 value={currentGrading.feedback}
 onChange={(e) =>
 setGradingState({
 ...gradingState,
 [sub.id]: {
 ...currentGrading,
 feedback: e.target.value,
 },
 })
 }
 className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 "
 />
 </div>
 <div>
 <button
 type="button"
 onClick={() => handleGradeSubmit(sub.id)}
 className="w-full py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center justify-center space-x-1 shadow-sm"
 >
 <Send className="h-3 w-3" />
 <span>Save Grade</span>
 </button>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 ) : (
 <p className="text-gray-500 py-4 text-center text-xs">
 No student submissions received for this task yet.
 </p>
 )}
 </div>
 )}
 </div>
 );
 })}

 {assignments.length === 0 && (
 <div className="text-center py-12 space-y-2">
 <Inbox className="h-10 w-10 text-gray-500 mx-auto" />
 <p className="text-xs font-bold text-gray-700 ">
 No assignments published for this batch yet.
 </p>
 <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
 Use the form on the left to set up practical tasks and homework assignments.
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