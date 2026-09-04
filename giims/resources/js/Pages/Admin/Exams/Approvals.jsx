import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, Link } from '@inertiajs/react';
import {
 Award,
 Calendar,
 CheckCircle2,
 Lock,
 Unlock,
 ShieldCheck,
 AlertTriangle,
 Users,
 Sparkles,
 Filter,
 Inbox,
 FileCheck
} from 'lucide-react';

export default function Approvals({ exams = [] }) {
 const [statusFilter, setStatusFilter] = useState('unlocked'); // 'unlocked' | 'locked' | 'all'

 const handleLockExam = (examId, title) => {
 if (
 confirm(
 `Are you sure you want to officially VERIFY and LOCK results for '${title}'?\n\nOnce locked, instructors will be permanently restricted from altering candidate scores.`
 )
 ) {
 router.post(
 route('admin.result-approvals.lock', { examId }),
 {},
 {
 preserveScroll: true,
 onSuccess: () => {
 alert(`Examination '${title}' results have been officially verified and locked.`);
 },
 }
 );
 }
 };

 const filteredExams = exams.filter((exam) => {
 if (statusFilter === 'all') return true;
 if (statusFilter === 'locked') return exam.is_locked;
 if (statusFilter === 'unlocked') return !exam.is_locked;
 return true;
 });

 const lockedCount = exams.filter((e) => e.is_locked).length;
 const unlockedCount = exams.filter((e) => !e.is_locked).length;

 return (
 <AdminLayout
 header={
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <div className="p-2 rounded-2xl bg-govt-gold-50 text-amber-600 border border-govt-gold-200">
 <ShieldCheck className="h-6 w-6" />
 </div>
 <div>
 <h2 className="text-xl font-bold leading-tight text-gray-800 ">
 Examination Results & Verification Engine
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 Official verification, gradebook audit, and tamper-proof result locking
 </p>
 </div>
 </div>

 <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-govt-gold-50 text-amber-600 border border-govt-gold-200">
 <span>{unlockedCount} Pending Locking</span>
 </span>
 </div>
 }
 >
 <Head title="Examination Approvals - GIIMS Admin" />

 <div className="space-y-6">
 {/* METRICS ROW */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center space-x-4">
 <div className="h-12 w-12 rounded-2xl bg-govt-cream-300 text-gray-600 flex items-center justify-center font-bold">
 <Award className="h-6 w-6" />
 </div>
 <div>
 <p className="text-xs text-gray-500 font-bold uppercase">Total Conducted Exams</p>
 <p className="text-2xl font-black text-gray-900 ">{exams.length}</p>
 </div>
 </div>

 <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center space-x-4">
 <div className="h-12 w-12 rounded-2xl bg-govt-gold-50 text-amber-600 flex items-center justify-center font-bold border border-govt-gold-200">
 <Unlock className="h-6 w-6" />
 </div>
 <div>
 <p className="text-xs text-gray-500 font-bold uppercase">Pending Verification</p>
 <p className="text-2xl font-black text-amber-600 ">{unlockedCount}</p>
 </div>
 </div>

 <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center space-x-4">
 <div className="h-12 w-12 rounded-2xl bg-govt-green-500/10 text-govt-green-500 flex items-center justify-center font-bold border border-govt-green-200">
 <Lock className="h-6 w-6" />
 </div>
 <div>
 <p className="text-xs text-gray-500 font-bold uppercase">Officially Locked</p>
 <p className="text-2xl font-black text-govt-green-500 ">{lockedCount}</p>
 </div>
 </div>
 </div>

 {/* FILTER CONTROLS */}
 <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
 <div className="flex items-center space-x-2">
 <Filter className="h-4 w-4 text-gray-500" />
 <span className="text-xs font-bold text-gray-700 ">Filter Approvals:</span>
 </div>

 <div className="flex items-center p-1 bg-govt-cream-300 rounded-2xl border border-gray-200 text-xs font-bold">
 <button
 type="button"
 onClick={() => setStatusFilter('unlocked')}
 className={`px-3.5 py-1.5 rounded-xl transition ${
 statusFilter === 'unlocked'
 ? 'bg-white text-amber-600 shadow-sm'
 : 'text-gray-500 hover:text-gray-900 :text-white'
 }`}
 >
 Pending Locking ({unlockedCount})
 </button>
 <button
 type="button"
 onClick={() => setStatusFilter('locked')}
 className={`px-3.5 py-1.5 rounded-xl transition ${
 statusFilter === 'locked'
 ? 'bg-white text-govt-green-500 shadow-sm'
 : 'text-gray-500 hover:text-gray-900 :text-white'
 }`}
 >
 Locked / Approved ({lockedCount})
 </button>
 <button
 type="button"
 onClick={() => setStatusFilter('all')}
 className={`px-3.5 py-1.5 rounded-xl transition ${
 statusFilter === 'all'
 ? 'bg-white text-gray-900 shadow-sm'
 : 'text-gray-500 hover:text-gray-900 :text-white'
 }`}
 >
 All ({exams.length})
 </button>
 </div>
 </div>

 {/* EXAMINATIONS APPROVAL DATA TABLE */}
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="text-gray-500 border-b border-gray-100 ">
 <th className="pb-3 font-semibold">Assessment Title</th>
 <th className="pb-3 font-semibold">Batch & Trade</th>
 <th className="pb-3 font-semibold">Curriculum Subject</th>
 <th className="pb-3 font-semibold">Exam Date</th>
 <th className="pb-3 font-semibold text-center">Candidates Graded</th>
 <th className="pb-3 font-semibold text-center">Status</th>
 <th className="pb-3 font-semibold text-right">Lock Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
 {filteredExams.map((exam) => {
 const batch = exam.batch;
 const course = batch?.course;
 const trade = course?.trade;
 const results = exam.exam_results || [];

 return (
 <tr key={exam.id} className="hover:bg-govt-green-50 :bg-white/50 transition">
 <td className="py-4">
 <p className="font-extrabold text-gray-900 text-sm">
 {exam.title}
 </p>
 <p className="text-[10px] text-gray-500">
 Theory: {exam.total_theory_marks} | Practical: {exam.total_practical_marks} (Total: {(exam.total_theory_marks || 0) + (exam.total_practical_marks || 0)})
 </p>
 </td>

 <td className="py-4">
 <p className="font-bold text-gray-900 ">{batch?.name || 'Batch'}</p>
 <p className="text-[10px] text-gray-500">{trade?.name} ({batch?.shift} Shift)</p>
 </td>

 <td className="py-4">
 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-govt-gold-50 text-amber-700 border border-govt-gold-200">
 {exam.subject?.name || 'Subject'}
 </span>
 </td>

 <td className="py-4 font-mono font-bold text-gray-500 ">
 {exam.exam_date}
 </td>

 <td className="py-4 text-center font-bold text-gray-900 ">
 <span className="px-2 py-1 rounded-lg bg-govt-cream-300 ">
 {results.length} Candidates
 </span>
 </td>

 <td className="py-4 text-center">
 {exam.is_locked ? (
 <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-govt-green-500/15 text-emerald-700 border border-govt-green-200">
 <Lock className="h-3 w-3" />
 <span>Locked by Admin</span>
 </span>
 ) : (
 <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-govt-gold-50 text-amber-700 border border-govt-gold-200">
 <Unlock className="h-3 w-3" />
 <span>Draft / Unlocked</span>
 </span>
 )}
 </td>

 <td className="py-4 text-right">
 {!exam.is_locked ? (
 <button
 type="button"
 onClick={() => handleLockExam(exam.id, exam.title)}
 className="px-3.5 py-1.5 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white font-bold text-xs transition shadow-sm flex items-center space-x-1.5 ml-auto"
 >
 <Lock className="h-3.5 w-3.5" />
 <span>Lock Results</span>
 </button>
 ) : (
 <div className="text-[10px] text-gray-500 text-right">
 <span>Verified by: {exam.locked_by?.name || 'Super Admin'}</span>
 </div>
 )}
 </td>
 </tr>
 );
 })}

 {filteredExams.length === 0 && (
 <tr>
 <td colSpan="7" className="text-center py-12 text-gray-500">
 <Inbox className="h-8 w-8 mx-auto mb-2 text-gray-500" />
 <p>No matching examinations found.</p>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </AdminLayout>
 );
}