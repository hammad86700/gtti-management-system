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
 ShieldAlert,
 Save,
 Users,
 Sparkles,
 AlertCircle,
 Check,
 Printer
} from 'lucide-react';

export default function Gradebook({ exam, enrollments = [] }) {
 const course = exam.batch?.course;
 const trade = course?.trade;
 const dept = trade?.program?.department;
 const isLocked = Boolean(exam.is_locked);

 // Prepare initial state from existing examResults or default
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

 const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
 results: initialResults,
 });

 const handleMarksChange = (profileId, field, value) => {
 if (isLocked) return;

 const updated = data.results.map((r) => {
 if (r.student_profile_id === profileId) {
 return {
 ...r,
 [field]: value === '' ? '' : Math.max(0, parseInt(value) || 0),
 };
 }
 return r;
 });
 setData('results', updated);
 };

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

 const handleSubmit = (e) => {
 e.preventDefault();
 if (isLocked) {
 alert('Results are locked and cannot be modified.');
 return;
 }
 post(route('teacher.exams.store-marks', { examId: exam.id }));
 };

 const totalMaxMarks = (exam.total_theory_marks || 0) + (exam.total_practical_marks || 0);

 return (
 <AuthenticatedLayout
 header={
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <Link
 href={route('teacher.exams.index', { batchId: exam.batch_id })}
 className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 :bg-govt-cream-300 text-gray-700 transition"
 >
 <ArrowLeft className="h-4 w-4" />
 </Link>
 <div>
 <h2 className="text-xl font-bold leading-tight text-gray-800 ">
 Gradebook: {exam.title}
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 {exam.subject?.name} • {exam.batch?.name} ({course?.name})
 </p>
 </div>
 </div>

 <div className="flex items-center space-x-3">
 <button
 type="button"
 onClick={() => window.print()}
 className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 :bg-govt-cream-300 text-gray-800 text-xs font-bold transition flex items-center space-x-1.5 shadow-sm print:hidden"
 >
 <Printer className="h-3.5 w-3.5" />
 <span>Print Award List</span>
 </button>

 {isLocked ? (
 <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase bg-govt-green-500/15 text-emerald-700 border border-govt-green-200">
 <Lock className="h-3.5 w-3.5" />
 <span>Results Locked by Admin</span>
 </span>
 ) : (
 <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase bg-blue-500/15 text-blue-700 border border-blue-500/30">
 <Unlock className="h-3.5 w-3.5" />
 <span>Open for Grading</span>
 </span>
 )}
 </div>
 </div>
 }
 >
 <Head title={`Gradebook - ${exam.title}`} />

 <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
 {/* LOCKED BANNER WARNING */}
 {isLocked && (
 <div className="rounded-xl p-5 bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-govt-green border-2 border-emerald-500/40 text-emerald-900 shadow-md flex items-center space-x-3">
 <Lock className="h-6 w-6 text-govt-green-500 shrink-0" />
 <div className="text-xs">
 <p className="font-extrabold text-sm text-emerald-800 ">
 Anti-Tamper Examination Lock Active
 </p>
 <p className="text-gray-600 mt-0.5">
 These marks have been officially validated and locked by {exam.locked_by?.name || 'Administration'}. All inputs are read-only.
 </p>
 </div>
 </div>
 )}

 {recentlySuccessful && (
 <div className="p-3.5 rounded-2xl bg-govt-green-500/10 border border-govt-green-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2">
 <CheckCircle2 className="h-4 w-4 shrink-0" />
 <span>Candidate marks saved in gradebook successfully!</span>
 </div>
 )}

 {/* EXAM PARAMETERS SUMMARY BAR */}
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
 <div className="p-3.5 rounded-2xl bg-govt-cream border border-gray-200/80 ">
 <p className="text-[10px] text-gray-500 font-bold uppercase">Curriculum Subject</p>
 <p className="font-extrabold text-sm text-gray-900 mt-0.5">{exam.subject?.name}</p>
 </div>

 <div className="p-3.5 rounded-2xl bg-govt-cream border border-gray-200/80 ">
 <p className="text-[10px] text-gray-500 font-bold uppercase">Conducted Date</p>
 <p className="font-extrabold text-sm text-gray-900 mt-0.5">{exam.exam_date}</p>
 </div>

 <div className="p-3.5 rounded-2xl bg-govt-cream border border-gray-200/80 ">
 <p className="text-[10px] text-gray-500 font-bold uppercase">Theory Max Marks</p>
 <p className="font-extrabold text-sm text-amber-600 mt-0.5">{exam.total_theory_marks} Marks</p>
 </div>

 <div className="p-3.5 rounded-2xl bg-govt-cream border border-gray-200/80 ">
 <p className="text-[10px] text-gray-500 font-bold uppercase">Practical Max Marks</p>
 <p className="font-extrabold text-sm text-purple-600 mt-0.5">{exam.total_practical_marks} Marks</p>
 </div>
 </div>
 </div>

 {/* GRADEBOOK MARKS MATRIX */}
 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs">
 <h3 className="font-bold text-gray-900 flex items-center space-x-2">
 <Users className="h-4 w-4 text-govt-gold" />
 <span>Candidate Evaluation Matrix</span>
 </h3>
 <span className="text-gray-500">{enrollments.length} Enrolled Candidates</span>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="text-gray-500 border-b border-gray-100 ">
 <th className="pb-3 font-semibold w-10">#</th>
 <th className="pb-3 font-semibold">Trainee Candidate</th>
 <th className="pb-3 font-semibold">Roll Number</th>
 <th className="pb-3 font-semibold text-center">Exam Status</th>
 <th className="pb-3 font-semibold text-center w-36">Theory (/{exam.total_theory_marks})</th>
 <th className="pb-3 font-semibold text-center w-36">Practical (/{exam.total_practical_marks})</th>
 <th className="pb-3 font-semibold text-center">Total (/{totalMaxMarks})</th>
 <th className="pb-3 font-semibold text-center">Verdict</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
 {enrollments.map((enr, idx) => {
 const profile = enr.student_profile;
 const user = profile?.user;
 const r = data.results.find(
 (res) => res.student_profile_id === profile?.id
 ) || { status: 'graded', obtained_theory_marks: '', obtained_practical_marks: '' };

 const thMarks = Number(r.obtained_theory_marks) || 0;
 const prMarks = Number(r.obtained_practical_marks) || 0;
 const totalObtained = thMarks + prMarks;
 const percentage = totalMaxMarks > 0 ? ((totalObtained / totalMaxMarks) * 100).toFixed(1) : 0;
 const isPassed = percentage >= 40 && r.status === 'graded';

 return (
 <tr key={enr.id} className="hover:bg-govt-green-50 :bg-white/50 transition">
 <td className="py-3 text-gray-500 font-bold">{idx + 1}</td>
 <td className="py-3">
 <p className="font-extrabold text-gray-900 text-sm">
 {user?.name || 'Trainee Candidate'}
 </p>
 <p className="text-[10px] text-gray-500">S/D of: {profile?.father_name || 'N/A'}</p>
 </td>
 <td className="py-3 font-mono font-bold text-govt-green-500 ">
 {enr.enrollment_number}
 </td>

 {/* Candidate Status Selector */}
 <td className="py-3 text-center">
 <select
 disabled={isLocked}
 value={r.status}
 onChange={(e) => handleStatusChange(profile?.id, e.target.value)}
 className="px-2 py-1 rounded-xl text-xs font-bold border border-gray-200 bg-govt-cream text-gray-800 disabled:opacity-75"
 >
 <option value="graded">Graded</option>
 <option value="absent">Absent</option>
 <option value="cheating">Expelled (Cheating)</option>
 </select>
 </td>

 {/* Theory Marks Input */}
 <td className="py-3 text-center">
 <input
 type="number"
 min="0"
 max={exam.total_theory_marks}
 disabled={isLocked || r.status !== 'graded'}
 placeholder="0"
 value={r.obtained_theory_marks}
 onChange={(e) => handleMarksChange(profile?.id, 'obtained_theory_marks', e.target.value)}
 className="w-24 px-2.5 py-1.5 bg-govt-cream border border-gray-200 rounded-xl text-xs font-mono font-bold text-center text-gray-900 disabled:bg-govt-cream-300 :bg-govt-cream-300 disabled:opacity-60"
 />
 </td>

 {/* Practical Marks Input */}
 <td className="py-3 text-center">
 <input
 type="number"
 min="0"
 max={exam.total_practical_marks}
 disabled={isLocked || r.status !== 'graded'}
 placeholder="0"
 value={r.obtained_practical_marks}
 onChange={(e) => handleMarksChange(profile?.id, 'obtained_practical_marks', e.target.value)}
 className="w-24 px-2.5 py-1.5 bg-govt-cream border border-gray-200 rounded-xl text-xs font-mono font-bold text-center text-gray-900 disabled:bg-govt-cream-300 :bg-govt-cream-300 disabled:opacity-60"
 />
 </td>

 {/* Total Calculated Marks */}
 <td className="py-3 text-center font-mono font-bold">
 {r.status === 'graded' ? (
 <span>{totalObtained} ({percentage}%)</span>
 ) : (
 <span className="text-rose-500 uppercase">{r.status}</span>
 )}
 </td>

 {/* Verdict Badge */}
 <td className="py-3 text-center">
 {r.status === 'graded' ? (
 <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
 isPassed
 ? 'bg-govt-green-500/20 text-emerald-700 border border-govt-green-200'
 : 'bg-rose-50 text-rose-700 border border-rose-200'
 }`}>
 {isPassed ? 'Pass' : 'Fail'}
 </span>
 ) : (
 <span className="text-gray-500 text-[10px]">-</span>
 )}
 </td>
 </tr>
 );
 })}

 {enrollments.length === 0 && (
 <tr>
 <td colSpan="8" className="text-center py-8 text-gray-500">
 No active candidates found for this examination.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>

 {/* Submit Action CTA */}
 {!isLocked && (
 <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
 <Link
 href={route('teacher.exams.index', { batchId: exam.batch_id })}
 className="px-4 py-2 rounded-xl bg-slate-200 text-gray-700 text-xs font-bold hover:bg-slate-300 :bg-govt-cream-300 transition"
 >
 Cancel
 </Link>

 <button
 type="submit"
 disabled={processing || enrollments.length === 0}
 className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-govt-gold text-white text-xs font-extrabold transition shadow-md shadow-amber-950/30 flex items-center space-x-2 disabled:opacity-50"
 >
 <Save className="h-4 w-4" />
 <span>{processing ? 'Saving Marks...' : 'Save & Record Marks'}</span>
 </button>
 </div>
 )}
 </div>
 </form>
 </div>
 </AuthenticatedLayout>
 );
}