import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
 Monitor,
 Clock,
 FileQuestion,
 CheckCircle2,
 Play,
 Award,
 AlertCircle,
 ArrowRight,
 Sparkles,
 ShieldCheck
} from 'lucide-react';

export default function Index({ enrollment, tests = [] }) {
 return (
 <AuthenticatedLayout
 header={
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <div className="p-2 rounded-2xl bg-govt-green-500/10 text-govt-green-500 border border-indigo-500/20">
 <Monitor className="h-6 w-6" />
 </div>
 <div>
 <h2 className="text-xl font-bold leading-tight text-gray-800 ">
 Online CBT Examination Portal
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 Computer-Based Assessments & Quizzes • Real-time Grading
 </p>
 </div>
 </div>

 {enrollment && (
 <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-govt-cream-300 text-gray-700 border border-gray-200 ">
 <span>{enrollment.batch?.name}</span>
 </span>
 )}
 </div>
 }
 >
 <Head title="Online CBT Tests - Trainee Portal" />

 <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
 {/* ACTIVE TESTS FEED */}
 <div className="rounded-xl bg-white border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
 <div className="flex items-center justify-between pb-4 border-b border-gray-100 ">
 <div>
 <h3 className="text-lg font-extrabold text-gray-900 ">
 Scheduled CBT Tests ({tests.length})
 </h3>
 <p className="text-xs text-gray-500 ">
 Timed multiple choice assessments assigned to your enrolled trade
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {tests.map((test) => {
 const attempt = test.attempts && test.attempts.length > 0 ? test.attempts[0] : null;
 const isCompleted = !!attempt;
 const percentage = isCompleted && attempt.total_questions > 0
 ? Math.round((attempt.score / attempt.total_questions) * 100)
 : 0;

 return (
 <div
 key={test.id}
 className={`rounded-2xl border p-6 flex flex-col justify-between space-y-4 transition ${
 isCompleted
 ? 'bg-govt-cream/70 border-gray-200 '
 : 'bg-white border-indigo-500/30 hover:border-indigo-500 shadow-sm hover:shadow-md'
 }`}
 >
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <span
 className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
 isCompleted
 ? 'bg-govt-green-500/15 text-govt-green-500 '
 : 'bg-govt-green-500/15 text-govt-green-500 '
 }`}
 >
 {isCompleted ? 'Completed' : 'Available for Exam'}
 </span>

 <span className="inline-flex items-center space-x-1 text-xs text-gray-500 font-mono">
 <Clock className="h-3.5 w-3.5 text-gray-500" />
 <span>{test.duration_minutes} Mins</span>
 </span>
 </div>

 <h4 className="text-base font-extrabold text-gray-900 ">
 {test.title}
 </h4>

 <div className="flex items-center space-x-3 text-xs text-gray-500 ">
 <span className="flex items-center space-x-1">
 <FileQuestion className="h-3.5 w-3.5 text-indigo-500" />
 <span>{test.questions_count ?? 0} Questions</span>
 </span>
 <span>•</span>
 <span>1 Mark Each</span>
 </div>
 </div>

 <div className="pt-4 border-t border-gray-100 ">
 {isCompleted ? (
 <div className="flex items-center justify-between bg-govt-green-500/10 border border-govt-green-200 p-3 rounded-xl">
 <div>
 <p className="text-[10px] text-emerald-700 font-bold uppercase">
 Exam Score Recorded
 </p>
 <p className="text-sm font-extrabold text-emerald-900 ">
 {attempt.score} / {attempt.total_questions} ({percentage}%)
 </p>
 </div>

 <span
 className={`px-2.5 py-1 rounded-lg text-xs font-black ${
 percentage >= 50
 ? 'bg-govt-green-500 text-white'
 : 'bg-rose-500 text-white'
 }`}
 >
 {percentage >= 50 ? 'PASS' : 'NYC'}
 </span>
 </div>
 ) : (
 <Link
 href={route('student.online-tests.take', test.id)}
 className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-govt-green-500 text-white text-xs font-extrabold transition shadow-md shadow-indigo-950/20 flex items-center justify-center space-x-2"
 >
 <Play className="h-4 w-4" />
 <span>Start Timed Exam</span>
 <ArrowRight className="h-4 w-4" />
 </Link>
 )}
 </div>
 </div>
 );
 })}
 </div>

 {tests.length === 0 && (
 <div className="text-center py-16 text-gray-500 space-y-2">
 <Monitor className="h-12 w-12 mx-auto opacity-40" />
 <p className="font-extrabold text-gray-700 ">
 No online tests are currently scheduled for your batch.
 </p>
 <p className="text-xs">
 Check back during your examination period or consult your class instructor.
 </p>
 </div>
 )}
 </div>
 </div>
 </AuthenticatedLayout>
 );
}