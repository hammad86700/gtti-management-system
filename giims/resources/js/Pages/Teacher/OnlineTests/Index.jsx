import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
 Monitor,
 Plus,
 Clock,
 FileQuestion,
 Users,
 Calendar,
 ArrowLeft,
 CheckCircle2,
 AlertCircle,
 Eye,
 Upload,
 Play,
 Pause,
 Sparkles
} from 'lucide-react';

export default function Index({ batch, tests = [] }) {
 const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
 title: '',
 duration_minutes: 30,
 scheduled_at: '',
 });

 const handleCreate = (e) => {
 e.preventDefault();
 post(route('teacher.online-tests.store', batch.id), {
 onSuccess: () => reset(),
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
 Computer-Based Testing (CBT) Module
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 {batch.name} • {batch.course?.name} • Manage Timed Tests & Automated Grading
 </p>
 </div>
 </div>

 <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-govt-green-500/10 text-govt-green-500 border border-indigo-500/20">
 <Monitor className="h-3.5 w-3.5" />
 <span>CBT Engine Active</span>
 </span>
 </div>
 }
 >
 <Head title={`Online CBT Tests - ${batch.name}`} />

 <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 {/* LEFT (4 Cols): CREATE NEW CBT TEST FORM */}
 <div className="lg:col-span-4 space-y-6">
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
 <div className="flex items-center space-x-2.5 pb-3 border-b border-gray-100 ">
 <div className="h-8 w-8 rounded-xl bg-govt-green-500/10 text-govt-green-500 flex items-center justify-center">
 <Plus className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-gray-900 ">
 Create New CBT Test
 </h3>
 <p className="text-[11px] text-gray-500 ">
 Configure test parameters for {batch.name}
 </p>
 </div>
 </div>

 {recentlySuccessful && (
 <div className="p-3.5 rounded-2xl bg-govt-green-500/10 border border-govt-green-200 text-govt-green-500 text-xs font-semibold flex items-center space-x-2">
 <CheckCircle2 className="h-4 w-4 shrink-0" />
 <span>Test created! Proceeding to question management...</span>
 </div>
 )}

 <form onSubmit={handleCreate} className="space-y-4 text-xs">
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Test Title <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 placeholder="e.g. Midterm Electrical Safety & Theory Quiz"
 value={data.title}
 onChange={(e) => setData('title', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-govt-green-400/30 text-gray-900 "
 />
 {errors.title && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>
 )}
 </div>

 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Time Duration (Minutes) <span className="text-rose-500">*</span>
 </label>
 <div className="relative">
 <input
 type="number"
 min="1"
 max="360"
 value={data.duration_minutes}
 onChange={(e) => setData('duration_minutes', e.target.value)}
 className="w-full pl-9 pr-4 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium text-gray-900 "
 />
 <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
 </div>
 {errors.duration_minutes && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.duration_minutes}</p>
 )}
 </div>

 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Scheduled Date & Time <span className="text-gray-500 font-normal">(Optional)</span>
 </label>
 <input
 type="datetime-local"
 value={data.scheduled_at}
 onChange={(e) => setData('scheduled_at', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium text-gray-900 "
 />
 </div>

 <button
 type="submit"
 disabled={processing}
 className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-govt-green-500 text-white font-extrabold transition shadow-md shadow-indigo-950/20 disabled:opacity-50 flex items-center justify-center space-x-2"
 >
 <Plus className="h-4 w-4" />
 <span>{processing ? 'Creating...' : 'Create Test & Add Questions'}</span>
 </button>
 </form>
 </div>
 </div>

 {/* RIGHT (8 Cols): LIST OF CREATED CBT TESTS */}
 <div className="lg:col-span-8 space-y-4">
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-gray-100 ">
 <div className="flex items-center space-x-2">
 <Monitor className="h-5 w-5 text-indigo-500" />
 <h3 className="text-sm font-bold text-gray-900 ">
 Assigned CBT Tests ({tests.length})
 </h3>
 </div>
 <span className="text-xs text-gray-500">
 Trainees can take published tests directly in their portal
 </span>
 </div>

 <div className="space-y-3">
 {tests.map((test) => (
 <div
 key={test.id}
 className="p-5 rounded-2xl border border-gray-200 hover:border-indigo-500/40 transition bg-govt-cream/50 space-y-3"
 >
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
 <div>
 <div className="flex items-center space-x-2">
 <span
 className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
 test.status === 'published'
 ? 'bg-govt-green-500/15 text-emerald-700 border border-govt-green-200'
 : 'bg-govt-gold-50 text-amber-700 border border-govt-gold-200'
 }`}
 >
 {test.status === 'published' ? 'Live & Published' : 'Draft Mode'}
 </span>
 <span className="text-[11px] text-gray-500 font-mono">
 {test.duration_minutes} Mins
 </span>
 </div>
 <h4 className="font-extrabold text-base text-gray-900 mt-1">
 {test.title}
 </h4>
 </div>

 <div className="flex items-center space-x-2 shrink-0">
 <Link
 href={route('teacher.online-tests.show', test.id)}
 className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-govt-green-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
 >
 <Eye className="h-3.5 w-3.5" />
 <span>Manage MCQs & Results</span>
 </Link>
 </div>
 </div>

 <div className="pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 ">
 <div className="flex items-center space-x-4">
 <span className="flex items-center space-x-1 font-semibold text-gray-700 ">
 <FileQuestion className="h-3.5 w-3.5 text-indigo-500" />
 <span>{test.questions_count ?? 0} Questions</span>
 </span>
 <span className="flex items-center space-x-1 font-semibold text-govt-green-500 ">
 <Users className="h-3.5 w-3.5" />
 <span>{test.attempts_count ?? 0} Attempts Recorded</span>
 </span>
 </div>

 {test.scheduled_at && (
 <span className="text-[11px] text-gray-500">
 Scheduled: {new Date(test.scheduled_at).toLocaleString()}
 </span>
 )}
 </div>
 </div>
 ))}

 {tests.length === 0 && (
 <div className="text-center py-12 text-gray-500">
 <Monitor className="h-10 w-10 mx-auto mb-2 opacity-50" />
 <p className="font-bold">No CBT tests created yet for this batch.</p>
 <p className="text-xs mt-1">Use the form on the left to set up your first online test.</p>
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