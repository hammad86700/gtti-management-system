import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import {
 Trophy,
 Award,
 PlusCircle,
 CheckCircle2,
 Calendar,
 Eye,
 Building2,
 GraduationCap,
 Clock,
 Sparkles,
 AlertCircle,
 ListOrdered
} from 'lucide-react';

export default function Index({ meritLists = [], campaign, courses = [] }) {
 const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
 course_id: courses[0]?.id || '',
 title: '1st Merit List (Fall 2026)',
 });

 const handleSubmit = (e) => {
 e.preventDefault();
 post(route('admin.merit.store'), {
 onSuccess: () => {
 reset('title');
 },
 });
 };

 return (
 <AdminLayout
 header={
 <div>
 <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
 Merit Engine & Ranking Hub
 </h1>
 <p className="text-xs text-gray-500">
 Compile verified applications, calculate percentage scores, and generate official merit lists
 </p>
 </div>
 }
 >
 <Head title="Merit Lists - GIIMS" />

 <div className="space-y-6">
 {/* Stats Bar */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-lg flex items-center space-x-4">
 <div className="h-12 w-12 rounded-xl bg-govt-gold-50 text-govt-gold-600 flex items-center justify-center border border-govt-gold-200">
 <Trophy className="h-6 w-6" />
 </div>
 <div>
 <p className="text-xs text-gray-500 font-medium">Compiled Merit Lists</p>
 <h3 className="text-2xl font-bold text-gray-900">{meritLists.length}</h3>
 <p className="text-[11px] text-gray-500">Published Ranking Cycles</p>
 </div>
 </div>

 <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-lg flex items-center space-x-4">
 <div className="h-12 w-12 rounded-xl bg-govt-green-500/10 text-govt-green-500 flex items-center justify-center border border-govt-green-200">
 <Calendar className="h-6 w-6" />
 </div>
 <div>
 <p className="text-xs text-gray-500 font-medium">Active Campaign</p>
 <h3 className="text-sm font-bold text-gray-900 truncate max-w-[180px]">
 {campaign?.name || 'Fall 2026 Admissions'}
 </h3>
 <p className="text-[11px] text-govt-green-500">Intake Window Open</p>
 </div>
 </div>

 <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-lg flex items-center space-x-4">
 <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
 <GraduationCap className="h-6 w-6" />
 </div>
 <div>
 <p className="text-xs text-gray-500 font-medium">Available Courses</p>
 <h3 className="text-2xl font-bold text-gray-900">{courses.length}</h3>
 <p className="text-[11px] text-gray-500">Across 5 Academic Wings</p>
 </div>
 </div>
 </div>

 {/* Generate New Merit List Form Card */}
 <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-govt-lg space-y-4">
 <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
 <div className="h-9 w-9 rounded-xl bg-govt-green-500/10 text-govt-green-500 border border-govt-green-200 flex items-center justify-center">
 <PlusCircle className="h-5 w-5" />
 </div>
 <div>
 <h2 className="text-base font-bold text-gray-900">Generate Official Merit List</h2>
 <p className="text-xs text-gray-500">
 Run the merit engine to calculate % scores, rank candidates, and select top 30 seats
 </p>
 </div>
 </div>

 {recentlySuccessful && (
 <div className="p-3.5 rounded-xl bg-govt-green-500/10 border border-govt-green-200 text-govt-green-500 text-xs font-semibold flex items-center space-x-2">
 <CheckCircle2 className="h-4 w-4 shrink-0" />
 <span>Merit list successfully generated, compiled, and published!</span>
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Course Dropdown */}
 <div>
 <label className="block text-xs font-semibold text-gray-600 mb-1.5">
 Target Course & Technical Trade <span className="text-rose-600">*</span>
 </label>
 <select
 value={data.course_id}
 onChange={(e) => setData('course_id', e.target.value)}
 className={`w-full px-3.5 py-2.5 bg-govt-cream-300 border rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 ${
 errors.course_id
 ? 'border-rose-500 focus:ring-rose-500/40'
 : 'border-gray-200 focus:ring-govt-green-400/40'
 }`}
 >
 {courses.map((course) => (
 <option key={course.id} value={course.id}>
 {course.name} ({course.trade?.name}) — {course.trade?.program?.department?.name} [{course.trade?.program?.name}]
 </option>
 ))}
 </select>
 {errors.course_id && (
 <p className="text-[11px] text-rose-600 mt-1">{errors.course_id}</p>
 )}
 </div>

 {/* Merit List Title */}
 <div>
 <label className="block text-xs font-semibold text-gray-600 mb-1.5">
 Merit List Title / Edition <span className="text-rose-600">*</span>
 </label>
 <input
 type="text"
 placeholder="e.g., 1st Merit List (Fall 2026)"
 value={data.title}
 onChange={(e) => setData('title', e.target.value)}
 className={`w-full px-3.5 py-2.5 bg-govt-cream-300 border rounded-xl text-xs text-gray-900 placeholder-slate-500 focus:outline-none focus:ring-2 ${
 errors.title
 ? 'border-rose-500 focus:ring-rose-500/40'
 : 'border-gray-200 focus:ring-govt-green-400/40'
 }`}
 />
 {errors.title && (
 <p className="text-[11px] text-rose-600 mt-1">{errors.title}</p>
 )}
 </div>
 </div>

 <div className="flex justify-end pt-2">
 <button
 type="submit"
 disabled={processing}
 className="px-5 py-2.5 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white text-xs font-bold tracking-wide transition shadow-lg shadow-emerald-950/40 disabled:opacity-50 flex items-center space-x-2"
 >
 <Trophy className="h-4 w-4" />
 <span>{processing ? 'Processing Merit Engine...' : 'Compile & Generate Merit List'}</span>
 </button>
 </div>
 </form>
 </div>

 {/* Existing Merit Lists Table */}
 <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-govt-lg space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-gray-200 text-xs text-gray-500">
 <span className="font-bold text-gray-900">Generated Merit Lists</span>
 <span>{meritLists.length} Total</span>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="text-gray-500 border-b border-gray-200">
 <th className="pb-3 font-semibold">Merit List Title</th>
 <th className="pb-3 font-semibold">Course & Department</th>
 <th className="pb-3 font-semibold">Campaign</th>
 <th className="pb-3 font-semibold">Ranked Candidates</th>
 <th className="pb-3 font-semibold">Status</th>
 <th className="pb-3 font-semibold text-right">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100/60 text-gray-600 font-medium">
 {meritLists.map((list) => {
 const course = list.course;
 const trade = course?.trade;
 const dept = trade?.program?.department;
 const rankedCount = list.applications?.length || 0;

 return (
 <tr key={list.id} className="hover:bg-govt-cream-300/40 transition">
 <td className="py-3.5 font-bold text-gray-900 flex items-center space-x-2.5">
 <div className="h-8 w-8 rounded-lg bg-govt-gold-50 text-govt-gold-600 flex items-center justify-center border border-govt-gold-200 shrink-0">
 <Trophy className="h-4 w-4" />
 </div>
 <span>{list.title}</span>
 </td>
 <td className="py-3.5">
 <p className="font-semibold text-gray-800">{course?.name} ({trade?.name})</p>
 <p className="text-[11px] text-gray-500">{dept?.name}</p>
 </td>
 <td className="py-3.5 text-gray-600">
 {list.admission_campaign?.name || 'Fall 2026 Admissions'}
 </td>
 <td className="py-3.5">
 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-govt-green-500/10 text-govt-green-500 border border-govt-green-200">
 {rankedCount} Candidates
 </span>
 </td>
 <td className="py-3.5">
 <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-govt-green-500/10 text-govt-green-500 border border-govt-green-200">
 <span>{list.status}</span>
 </span>
 </td>
 <td className="py-3.5 text-right">
 <Link
 href={route('admin.merit.show', list.id)}
 className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-govt-cream-300 hover:bg-govt-green hover:text-white border border-gray-200 text-gray-800 text-xs font-semibold transition"
 >
 <Eye className="h-3.5 w-3.5" />
 <span>View Ranks</span>
 </Link>
 </td>
 </tr>
 );
 })}

 {meritLists.length === 0 && (
 <tr>
 <td colSpan="6" className="py-10 text-center text-gray-500 text-xs">
 No merit lists generated yet. Select a course above and compile your first merit list.
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
