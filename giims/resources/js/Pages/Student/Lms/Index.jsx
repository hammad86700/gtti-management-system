import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import {
 BookOpen,
 Calendar,
 FileText,
 CheckCircle2,
 ArrowLeft,
 Sparkles,
 Clock,
 Paperclip,
 Layers,
 Inbox,
 Award,
 UploadCloud,
 Send,
 CheckCircle,
 AlertCircle,
 Camera
} from 'lucide-react';

export default function Index({ enrollment, lessons = [], assignments = [] }) {
 const course = enrollment?.batch?.course;
 const trade = course?.trade;
 const dept = trade?.program?.department;
 const batch = enrollment?.batch;

 const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' | 'assignments'
 const [submittingAssignmentId, setSubmittingAssignmentId] = useState(null);

 const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
 submission_text: '',
 document: null,
 });

 const [fileName, setFileName] = useState('');

 const handleOpenSubmit = (assignmentId) => {
 setSubmittingAssignmentId(assignmentId);
 reset('submission_text', 'document');
 setFileName('');
 };

 const handleAssignmentSubmit = (e, assignmentId) => {
 e.preventDefault();
 post(route('student.assignments.submit', { assignmentId }), {
 forceFormData: true,
 onSuccess: () => {
 setSubmittingAssignmentId(null);
 reset('submission_text', 'document');
 setFileName('');
 alert('Your assignment has been submitted successfully!');
 },
 });
 };

 return (
 <AuthenticatedLayout
 header={
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <Link
 href={route('dashboard')}
 className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 :bg-govt-cream-300 text-gray-700 transition"
 >
 <ArrowLeft className="h-4 w-4" />
 </Link>
 <div>
 <h2 className="text-xl font-bold leading-tight text-gray-800 ">
 Student Academic LMS
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 {course?.name} • {batch?.name} ({batch?.shift} Shift)
 </p>
 </div>
 </div>

 <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-govt-green-500/10 text-emerald-700 border border-govt-green-200">
 {dept?.name}
 </span>
 </div>
 }
 >
 <Head title={`Academic LMS - ${course?.name}`} />

 <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
 {/* Hero Header */}
 <div className="rounded-xl bg-gradient-to-r from-govt-green via-govt-green-500 to-govt-green border border-gray-200 p-6 text-white shadow-govt-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div className="space-y-1">
 <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-govt-green-500/20 text-govt-green-400 border border-govt-green-200 text-xs font-semibold">
 <Sparkles className="h-3 w-3" />
 <span>Trainee Learning & Assessment Portal</span>
 </div>
                    <h3 className="text-xl font-extrabold text-white font-serif">
                        Course Curriculum, Daily Lectures & Practical Tasks
                    </h3>
                    <p className="text-xs text-green-100">
                        Access instructor lesson plans, download technical schematics, and submit assignments for competency grading.
                    </p>
 </div>

 <Link
 href={route('student.curriculum.journey')}
 className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center space-x-1.5 shadow-md shrink-0"
 >
 <Calendar className="h-3.5 w-3.5 text-slate-950" />
 <span>Interactive Day Roadmap</span>
 </Link>

 {/* Tab Switcher */}
 <div className="flex items-center p-1 bg-govt-cream-300/80 rounded-2xl border border-gray-200 shrink-0">
 <button
 type="button"
 onClick={() => setActiveTab('lessons')}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
 activeTab === 'lessons'
 ? 'bg-govt-green text-white shadow-md'
 : 'text-gray-500 hover:text-white'
 }`}
 >
 <BookOpen className="h-3.5 w-3.5" />
 <span>Daily Lesson Plans ({lessons.length})</span>
 </button>
 <button
 type="button"
 onClick={() => setActiveTab('assignments')}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
 activeTab === 'assignments'
 ? 'bg-govt-green text-white shadow-md'
 : 'text-gray-500 hover:text-white'
 }`}
 >
 <FileText className="h-3.5 w-3.5" />
 <span>Assignments & Tasks ({assignments.length})</span>
 </button>
 </div>
 </div>

 {/* TAB 1: DAILY LESSON PLANS */}
 {activeTab === 'lessons' && (
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs">
 <h3 className="font-bold text-gray-900 flex items-center space-x-2">
 <BookOpen className="h-4 w-4 text-govt-green-500" />
 <span>Published Lecture & Practical Topics</span>
 </h3>
 <span className="text-gray-500">{lessons.length} Modules</span>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {lessons.map((lesson) => (
 <div
 key={lesson.id}
 className="p-5 rounded-2xl bg-govt-cream border border-gray-200/80 space-y-3 flex flex-col justify-between hover:border-emerald-500/40 transition"
 >
 <div className="space-y-2">
 <div className="flex items-center justify-between gap-2">
 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-govt-green-500/10 text-emerald-700 border border-govt-green-200">
 {lesson.subject?.name || 'Curriculum Subject'}
 </span>
 <span className="flex items-center space-x-1 text-[11px] font-semibold text-gray-500">
 <Calendar className="h-3 w-3" />
 <span>{lesson.planned_date}</span>
 </span>
 </div>

 <h4 className="text-sm font-bold text-gray-900 leading-snug">
 {lesson.title}
 </h4>

 {lesson.description && (
 <p className="text-xs text-gray-600 leading-relaxed">
 {lesson.description}
 </p>
 )}
 </div>

 {lesson.file_path && (
 <div className="pt-2 border-t border-gray-200 ">
 <div className="flex items-center justify-between text-xs text-govt-green-500 font-semibold">
 <span className="flex items-center space-x-1">
 <Paperclip className="h-3.5 w-3.5" />
 <span>Handout Resource Available</span>
 </span>
 <span className="text-[10px] text-gray-500">Attached</span>
 </div>
 </div>
 )}
 </div>
 ))}

 {lessons.length === 0 && (
 <div className="col-span-full text-center py-12 space-y-2">
 <Inbox className="h-10 w-10 text-gray-500 mx-auto" />
 <p className="text-xs font-bold text-gray-700 ">
 No lesson plans published yet for this batch.
 </p>
 <p className="text-[11px] text-gray-500">
 Your instructor will publish daily lecture materials and lab demonstrations here.
 </p>
 </div>
 )}
 </div>
 </div>
 )}

 {/* TAB 2: ASSIGNMENTS & TASKS */}
 {activeTab === 'assignments' && (
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs">
 <h3 className="font-bold text-gray-900 flex items-center space-x-2">
 <FileText className="h-4 w-4 text-govt-green-500" />
 <span>Coursework & Assessments</span>
 </h3>
 <span className="text-gray-500">{assignments.length} Total</span>
 </div>

 <div className="space-y-4">
 {assignments.map((assignment) => {
 const submission = assignment.submissions?.[0];
 const hasSubmitted = Boolean(submission);
 const isGraded = submission?.status === 'graded';
 const isSubmitting = submittingAssignmentId === assignment.id;

 return (
 <div
 key={assignment.id}
 className="rounded-2xl bg-govt-cream border border-gray-200/80 p-5 space-y-4 transition"
 >
 <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
 <div className="space-y-1.5 max-w-2xl">
 <div className="flex flex-wrap items-center gap-2">
 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
 {assignment.subject?.name || 'Subject'}
 </span>
 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-govt-green-500/10 text-emerald-700 border border-govt-green-200">
 Total: {assignment.total_marks} Marks
 </span>
 <span className="flex items-center space-x-1 text-[11px] text-gray-500 ">
 <Clock className="h-3 w-3" />
 <span>Due: {assignment.due_date ? String(assignment.due_date).substring(0, 16) : 'No deadline'}</span>
 </span>
 </div>

 <h4 className="text-base font-extrabold text-gray-900 ">
 {assignment.title}
 </h4>

 {assignment.description && (
 <p className="text-xs text-gray-600 leading-relaxed">
 {assignment.description}
 </p>
 )}
 </div>

 {/* Status Badge & Action CTA */}
 <div className="flex flex-col items-end space-y-2 shrink-0">
 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
 isGraded
 ? 'bg-govt-green-500/20 text-emerald-700 border border-govt-green-200'
 : hasSubmitted
 ? 'bg-blue-500/20 text-blue-700 border border-blue-500/30'
 : 'bg-govt-gold-50 text-amber-700 border border-govt-gold-200'
 }`}>
 {isGraded
 ? `Score: ${submission.obtained_marks} / ${assignment.total_marks}`
 : hasSubmitted
 ? 'Submitted (Pending Review)'
 : 'Action Required'}
 </span>

 <button
 type="button"
 onClick={() => handleOpenSubmit(isSubmitting ? null : assignment.id)}
 className="px-4 py-1.5 rounded-xl bg-white hover:bg-govt-green :bg-govt-green text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-sm"
 >
 <UploadCloud className="h-3.5 w-3.5" />
 <span>{hasSubmitted ? 'Resubmit / Edit Work' : 'Submit Coursework'}</span>
 </button>
 </div>
 </div>

 {/* Feedback Banner if graded */}
 {isGraded && submission.feedback && (
 <div className="p-3.5 rounded-xl bg-govt-green-500/10 border border-govt-green-200 text-xs space-y-1">
 <p className="font-bold text-emerald-800 flex items-center space-x-1.5">
 <Award className="h-4 w-4" />
 <span>Instructor Feedback:</span>
 </p>
 <p className="text-gray-700 ">{submission.feedback}</p>
 </div>
 )}

 {/* Submissions Form Drawer */}
 {isSubmitting && (
 <form
 onSubmit={(e) => handleAssignmentSubmit(e, assignment.id)}
 className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3 text-xs"
 >
 <h5 className="font-bold text-gray-900 ">
 Submit Response for: {assignment.title}
 </h5>

 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Written Solution / Notes (Optional if file attached)
 </label>
 <textarea
 rows={3}
 placeholder="Type your answer, lab experiment calculations, or summary here..."
 value={data.submission_text}
 onChange={(e) => setData('submission_text', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-govt-green-400/30"
 />
 {errors.submission_text && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.submission_text}</p>
 )}
 </div>
 <label className="block font-bold text-gray-700 mb-1 flex items-center justify-between text-xs">
 <span>Attach Assignment File (Max 5MB)</span>
 <span className="text-[10px] font-bold text-govt-green bg-govt-green-50 px-2 py-0.5 rounded-full flex items-center space-x-1">
 <Camera className="h-3 w-3" />
 <span>Camera Scan / File</span>
 </span>
 </label>
 <div className="relative border-2 border-dashed border-gray-200 hover:border-emerald-500/50 rounded-2xl p-4 text-center bg-govt-cream/50 transition min-h-[60px] flex flex-col items-center justify-center">
 <div className="flex items-center justify-center space-x-2 text-gray-500 mb-1">
 <Camera className="h-5 w-5 text-govt-green" />
 <UploadCloud className="h-5 w-5" />
 </div>
 <input
 type="file"
 accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx,.zip"
 capture="environment"
 onChange={(e) => {
 const file = e.target.files[0];
 setData('document', file);
 setFileName(file ? file.name : '');
 }}
 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base"
 />
 <p className="text-xs font-bold text-gray-700">
 {fileName || 'Tap to Scan with Camera or Browse Files'}
 </p>
 <p className="text-[10px] text-gray-500 mt-0.5">
 Camera Photos, PDF, Word, or Scanned Documents (16px touch-optimized)
 </p>
 </div>
 {errors.document && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.document}</p>
 )}
 <div className="flex items-center justify-end space-x-2 pt-2">
 <button
 type="button"
 onClick={() => setSubmittingAssignmentId(null)}
 className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 :bg-govt-cream-300 text-gray-700 font-bold"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={processing}
 className="px-4 py-1.5 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white font-bold transition shadow-md disabled:opacity-50 flex items-center space-x-1.5"
 >
 <Send className="h-3 w-3" />
 <span>{processing ? 'Submitting...' : 'Upload & Submit'}</span>
 </button>
 </div>
 </form>
 )}
 </div>
 );
 })}

 {assignments.length === 0 && (
 <div className="text-center py-12 space-y-2">
 <Inbox className="h-10 w-10 text-gray-500 mx-auto" />
 <p className="text-xs font-bold text-gray-700 ">
 No assignments or tasks assigned yet.
 </p>
 <p className="text-[11px] text-gray-500">
 Check back periodically as your instructor schedules practical lab exercises.
 </p>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 </AuthenticatedLayout>
 );
}