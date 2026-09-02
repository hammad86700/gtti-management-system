import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import {
 ClipboardCheck,
 Calendar,
 ArrowLeft,
 CheckCircle2,
 XCircle,
 Clock,
 UserCheck,
 Sparkles,
 Users,
 Save,
 AlertCircle,
 Check
} from 'lucide-react';

export default function Create({ batch, subjects = [] }) {
 const course = batch.course;
 const trade = course?.trade;
 const dept = trade?.program?.department;
 const enrollments = batch.enrollments || [];

 const todayDate = new Date().toISOString().split('T')[0];

 // Initialize attendances array for each active enrolled student
 const initialAttendances = enrollments.map((enr) => ({
 student_profile_id: enr.student_profile?.id,
 status: 'present',
 late_minutes: 0,
 }));

 const { data, setData, post, processing, errors } = useForm({
 session_date: todayDate,
 subject_id: subjects[0]?.id || '',
 start_time: '08:30',
 end_time: '10:30',
 attendances: initialAttendances,
 });

 const setAllStatus = (newStatus) => {
 const updated = data.attendances.map((att) => ({
 ...att,
 status: newStatus,
 late_minutes: newStatus === 'late' ? 15 : 0,
 }));
 setData('attendances', updated);
 };

 const handleStudentStatusChange = (profileId, newStatus) => {
 const updated = data.attendances.map((att) => {
 if (att.student_profile_id === profileId) {
 return {
 ...att,
 status: newStatus,
 late_minutes: newStatus === 'late' ? 15 : 0,
 };
 }
 return att;
 });
 setData('attendances', updated);
 };

 const handleLateMinutesChange = (profileId, minutes) => {
 const updated = data.attendances.map((att) => {
 if (att.student_profile_id === profileId) {
 return {
 ...att,
 late_minutes: parseInt(minutes) || 0,
 };
 }
 return att;
 });
 setData('attendances', updated);
 };

 const handleSubmit = (e) => {
 e.preventDefault();
 post(route('teacher.attendance.store', { batchId: batch.id }));
 };

 // Calculate live counts
 const counts = data.attendances.reduce(
 (acc, curr) => {
 acc[curr.status] = (acc[curr.status] || 0) + 1;
 return acc;
 },
 { present: 0, absent: 0, late: 0, leave: 0 }
 );

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
 Mark Classroom Attendance: {batch.name}
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 {course?.name} ({trade?.name}) • {dept?.name}
 </p>
 </div>
 </div>

 <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-govt-green-500/10 text-emerald-700 border border-govt-green-200">
 {batch.shift || 'Morning'} Shift • {enrollments.length} Enrolled Trainees
 </span>
 </div>
 }
 >
 <Head title={`Class Attendance - ${batch.name}`} />

 <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
 <form onSubmit={handleSubmit} className="space-y-6">
 {/* TOP CONTROLS & SESSION DETAILS */}
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-5">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 ">
 <div>
 <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
 <ClipboardCheck className="h-5 w-5 text-govt-green-500" />
 <span>Class Roll-Call Session Details</span>
 </h3>
 <p className="text-xs text-gray-500 mt-0.5">
 Set the lecture date, curriculum module, and period time
 </p>
 </div>

 {/* Quick Bulk Action Buttons */}
 <div className="flex flex-wrap items-center gap-2">
 <button
 type="button"
 onClick={() => setAllStatus('present')}
 className="px-3 py-1.5 rounded-xl bg-govt-green-500/10 hover:bg-govt-green-500/20 text-emerald-700 border border-govt-green-200 text-xs font-bold transition flex items-center space-x-1"
 >
 <CheckCircle2 className="h-3.5 w-3.5" />
 <span>All Present</span>
 </button>
 <button
 type="button"
 onClick={() => setAllStatus('absent')}
 className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center space-x-1"
 >
 <XCircle className="h-3.5 w-3.5" />
 <span>All Absent</span>
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Attendance Date <span className="text-rose-500">*</span>
 </label>
 <input
 type="date"
 value={data.session_date}
 onChange={(e) => setData('session_date', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-govt-green-400/30 text-gray-900 "
 />
 {errors.session_date && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.session_date}</p>
 )}
 </div>

 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Curriculum Module / Subject
 </label>
 <select
 value={data.subject_id}
 onChange={(e) => setData('subject_id', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-govt-green-400/30 text-gray-900 "
 >
 <option value="">General Class Roll Call</option>
 {subjects.map((sub) => (
 <option key={sub.id} value={sub.id}>
 {sub.name} {sub.is_practical ? '(Lab)' : '(Theory)'}
 </option>
 ))}
 </select>
 </div>

 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Start Time
 </label>
 <input
 type="time"
 value={data.start_time}
 onChange={(e) => setData('start_time', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium text-gray-900 "
 />
 </div>
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 End Time
 </label>
 <input
 type="time"
 value={data.end_time}
 onChange={(e) => setData('end_time', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium text-gray-900 "
 />
 </div>
 </div>
 </div>

 {/* Live Summary Bar */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
 <div className="p-3 rounded-2xl bg-govt-green-500/10 border border-govt-green-200 text-center">
 <p className="text-[10px] uppercase font-bold text-emerald-700 ">Present</p>
 <p className="text-xl font-black text-govt-green-500 ">{counts.present}</p>
 </div>
 <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
 <p className="text-[10px] uppercase font-bold text-rose-700 ">Absent</p>
 <p className="text-xl font-black text-rose-600 ">{counts.absent}</p>
 </div>
 <div className="p-3 rounded-2xl bg-govt-gold-50 border border-govt-gold-200 text-center">
 <p className="text-[10px] uppercase font-bold text-amber-700 ">Late</p>
 <p className="text-xl font-black text-amber-600 ">{counts.late}</p>
 </div>
 <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-center">
 <p className="text-[10px] uppercase font-bold text-blue-700 ">Approved Leave</p>
 <p className="text-xl font-black text-blue-600 ">{counts.leave}</p>
 </div>
 </div>
 </div>

 {/* ENROLLED STUDENTS ROLL CALL TABLE */}
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs">
 <h3 className="font-bold text-gray-900 flex items-center space-x-2">
 <Users className="h-4 w-4 text-govt-green-500" />
 <span>Trainee Roster & Daily Mark</span>
 </h3>
 <span className="text-gray-500">{enrollments.length} Trainees</span>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="text-gray-500 border-b border-gray-100 ">
 <th className="pb-3 font-semibold w-12">#</th>
 <th className="pb-3 font-semibold">Trainee Name</th>
 <th className="pb-3 font-semibold">Roll Number</th>
 <th className="pb-3 font-semibold">Father's Name</th>
 <th className="pb-3 font-semibold text-center">Attendance Status</th>
 <th className="pb-3 font-semibold w-32 text-center">Late (Mins)</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
 {enrollments.map((enr, idx) => {
 const profile = enr.student_profile;
 const user = profile?.user;
 const attRecord = data.attendances.find(
 (a) => a.student_profile_id === profile?.id
 ) || { status: 'present', late_minutes: 0 };

 return (
 <tr key={enr.id} className="hover:bg-govt-green-50 :bg-white/50 transition">
 <td className="py-3 text-gray-500 font-bold">{idx + 1}</td>
 <td className="py-3">
 <p className="font-extrabold text-gray-900 text-sm">
 {user?.name || 'Trainee Student'}
 </p>
 <p className="text-[10px] text-gray-500">{user?.cnic || 'CNIC'}</p>
 </td>
 <td className="py-3 font-mono font-bold text-govt-green-500 ">
 {enr.enrollment_number}
 </td>
 <td className="py-3 text-gray-600 ">
 {profile?.father_name || 'N/A'}
 </td>

 {/* Status Selector Buttons */}
 <td className="py-3">
 <div className="flex items-center justify-center space-x-1.5">
 {/* PRESENT */}
 <button
 type="button"
 onClick={() => handleStudentStatusChange(profile?.id, 'present')}
 className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center space-x-1 ${
 attRecord.status === 'present'
 ? 'bg-govt-green text-white shadow-md shadow-emerald-950/20'
 : 'bg-govt-cream-300 text-gray-600 hover:bg-govt-green-500/10 hover:text-govt-green-500'
 }`}
 >
 <Check className="h-3 w-3" />
 <span>P</span>
 </button>

 {/* ABSENT */}
 <button
 type="button"
 onClick={() => handleStudentStatusChange(profile?.id, 'absent')}
 className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center space-x-1 ${
 attRecord.status === 'absent'
 ? 'bg-rose-600 text-white shadow-md shadow-rose-950/20'
 : 'bg-govt-cream-300 text-gray-600 hover:bg-rose-50 hover:text-rose-600'
 }`}
 >
 <span>A</span>
 </button>

 {/* LATE */}
 <button
 type="button"
 onClick={() => handleStudentStatusChange(profile?.id, 'late')}
 className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center space-x-1 ${
 attRecord.status === 'late'
 ? 'bg-govt-gold text-gray-600 font-black shadow-md'
 : 'bg-govt-cream-300 text-gray-600 hover:bg-govt-gold-50 hover:text-amber-600'
 }`}
 >
 <Clock className="h-3 w-3" />
 <span>L</span>
 </button>

 {/* LEAVE */}
 <button
 type="button"
 onClick={() => handleStudentStatusChange(profile?.id, 'leave')}
 className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center space-x-1 ${
 attRecord.status === 'leave'
 ? 'bg-blue-600 text-white shadow-md shadow-blue-950/20'
 : 'bg-govt-cream-300 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
 }`}
 >
 <span>Lv</span>
 </button>
 </div>
 </td>

 {/* Late Minutes Input */}
 <td className="py-3 text-center">
 {attRecord.status === 'late' ? (
 <input
 type="number"
 min="1"
 max="180"
 value={attRecord.late_minutes}
 onChange={(e) => handleLateMinutesChange(profile?.id, e.target.value)}
 className="w-20 px-2 py-1 bg-govt-gold-50 border border-govt-gold-200 rounded-lg text-xs font-bold text-amber-700 text-center"
 />
 ) : (
 <span className="text-gray-600 ">-</span>
 )}
 </td>
 </tr>
 );
 })}

 {enrollments.length === 0 && (
 <tr>
 <td colSpan="6" className="text-center py-8 text-gray-500">
 No active enrolled students found in this batch.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>

 {/* Submit CTA */}
 <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
 <Link
 href={route('teacher.dashboard')}
 className="px-4 py-2 rounded-xl bg-slate-200 text-gray-700 text-xs font-bold hover:bg-slate-300 :bg-govt-cream-300 transition"
 >
 Cancel
 </Link>

 <button
 type="submit"
 disabled={processing || enrollments.length === 0}
 className="px-6 py-2.5 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white text-xs font-extrabold transition shadow-md shadow-govt flex items-center space-x-2 disabled:opacity-50"
 >
 <Save className="h-4 w-4" />
 <span>{processing ? 'Saving Roll Call...' : 'Save & Submit Attendance'}</span>
 </button>
 </div>
 </div>
 </form>
 </div>
 </AuthenticatedLayout>
 );
}