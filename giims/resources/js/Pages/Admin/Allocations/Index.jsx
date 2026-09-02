import { useState, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
 BookOpen,
 UserCheck,
 UserPlus,
 Users,
 GraduationCap,
 Trash2,
 Search,
 Sparkles,
 CheckCircle2,
 AlertCircle,
 Calendar,
 Clock,
 Layers,
 Shield,
 Check,
 X,
 Filter
} from 'lucide-react';

export default function Index({ batches = [], teachers = [] }) {
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedShiftFilter, setSelectedShiftFilter] = useState('all');
 const [confirmDelete, setConfirmDelete] = useState(null); // { batchId, batchName, teacherId, teacherName }

 // Inertia form for pairing an instructor with a batch
 const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
 batch_id: '',
 user_id: '',
 });

 const handleAssign = (e) => {
 e.preventDefault();
 post(route('allocations.store'), {
 preserveScroll: true,
 onSuccess: () => {
 reset();
 },
 });
 };

 const handleRemove = (batchId, teacherId) => {
 router.delete(route('allocations.destroy', { batch: batchId, user: teacherId }), {
 preserveScroll: true,
 onSuccess: () => {
 setConfirmDelete(null);
 },
 });
 };

 // Calculate quick stats
 const stats = useMemo(() => {
 const totalBatches = batches.length;
 let totalPairings = 0;
 let allocatedBatchesCount = 0;
 const assignedTeacherIds = new Set();

 batches.forEach((b) => {
 const assignedCount = b.users ? b.users.length : 0;
 totalPairings += assignedCount;
 if (assignedCount > 0) allocatedBatchesCount++;
 b.users?.forEach((u) => assignedTeacherIds.add(u.id));
 });

 const unallocatedBatchesCount = totalBatches - allocatedBatchesCount;
 const activeFacultyCount = assignedTeacherIds.size;

 return {
 totalBatches,
 totalPairings,
 allocatedBatchesCount,
 unallocatedBatchesCount,
 activeFacultyCount,
 totalTeachers: teachers.length,
 };
 }, [batches, teachers]);

 // Filter batches by search query and shift
 const filteredBatches = useMemo(() => {
 return batches.filter((batch) => {
 const query = searchQuery.toLowerCase().trim();
 const matchesQuery =
 !query ||
 batch.name?.toLowerCase().includes(query) ||
 batch.session_year?.toLowerCase().includes(query) ||
 batch.course?.name?.toLowerCase().includes(query) ||
 batch.course?.trade?.name?.toLowerCase().includes(query) ||
 batch.users?.some(
 (u) =>
 u.name?.toLowerCase().includes(query) ||
 u.email?.toLowerCase().includes(query)
 );

 const matchesShift =
 selectedShiftFilter === 'all' ||
 batch.shift?.toLowerCase() === selectedShiftFilter.toLowerCase();

 return matchesQuery && matchesShift;
 });
 }, [batches, searchQuery, selectedShiftFilter]);

 return (
 <AdminLayout
 header={
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
 <div>
 <div className="flex items-center space-x-2.5">
 <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-govt-green to-govt-green-500 flex items-center justify-center shadow-lg shadow-emerald-950/40 border border-govt-green-200">
 <BookOpen className="h-5 w-5 text-white" />
 </div>
 <div>
 <h1 className="text-xl font-bold text-gray-900 tracking-tight">
 Academic Allocations & Faculty Assignment
 </h1>
 <p className="text-xs text-gray-500">
 Link academic instructors to batches for LMS access, attendance logging, and grading
 </p>
 </div>
 </div>
 </div>
 <div className="flex items-center space-x-2">
 <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-govt-green-500/10 text-govt-green-500 border border-govt-green-200">
 <span className="w-1.5 h-1.5 rounded-full bg-govt-green-400 animate-pulse mr-1.5"></span>
 Phase 17 Engine Active
 </span>
 </div>
 </div>
 }
 >
 <Head title="Academic Allocations - Faculty Assignment" />

 <div className="space-y-6">
 {/* Top Metrics Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="p-4 rounded-2xl bg-white/70 border border-gray-200 shadow-lg relative overflow-hidden group hover:border-gray-200 transition">
 <div className="flex items-center justify-between">
 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Batches</p>
 <div className="p-2 rounded-xl bg-govt-green-500/10 border border-govt-green-200 text-govt-green-500">
 <Layers className="h-4 w-4" />
 </div>
 </div>
 <div className="mt-3 flex items-baseline justify-between">
 <span className="text-2xl font-black text-gray-900 tracking-tight">{stats.totalBatches}</span>
 <span className="text-xs text-govt-green-500 font-medium">
 {stats.allocatedBatchesCount} assigned
 </span>
 </div>
 <div className="w-full bg-govt-cream-300 h-1.5 rounded-full mt-3 overflow-hidden">
 <div
 className="bg-govt-green-500 h-full rounded-full transition-all duration-500"
 style={{
 width: `${stats.totalBatches > 0 ? (stats.allocatedBatchesCount / stats.totalBatches) * 100 : 0}%`,
 }}
 ></div>
 </div>
 </div>

 <div className="p-4 rounded-2xl bg-white/70 border border-gray-200 shadow-lg relative overflow-hidden group hover:border-gray-200 transition">
 <div className="flex items-center justify-between">
 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Pairings</p>
 <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
 <BookOpen className="h-4 w-4" />
 </div>
 </div>
 <div className="mt-3 flex items-baseline justify-between">
 <span className="text-2xl font-black text-gray-900 tracking-tight">{stats.totalPairings}</span>
 <span className="text-xs text-teal-400 font-medium">Total links</span>
 </div>
 <p className="text-[11px] text-gray-500 mt-2">Classroom-instructor bindings</p>
 </div>

 <div className="p-4 rounded-2xl bg-white/70 border border-gray-200 shadow-lg relative overflow-hidden group hover:border-gray-200 transition">
 <div className="flex items-center justify-between">
 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Available Faculty</p>
 <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
 <Users className="h-4 w-4" />
 </div>
 </div>
 <div className="mt-3 flex items-baseline justify-between">
 <span className="text-2xl font-black text-gray-900 tracking-tight">{stats.totalTeachers}</span>
 <span className="text-xs text-blue-600 font-medium">
 {stats.activeFacultyCount} in action
 </span>
 </div>
 <p className="text-[11px] text-gray-500 mt-2">Verified institutional teachers</p>
 </div>

 <div className="p-4 rounded-2xl bg-white/70 border border-gray-200 shadow-lg relative overflow-hidden group hover:border-gray-200 transition">
 <div className="flex items-center justify-between">
 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unassigned Batches</p>
 <div className="p-2 rounded-xl bg-govt-gold-50 border border-govt-gold-200 text-govt-gold-600">
 <AlertCircle className="h-4 w-4" />
 </div>
 </div>
 <div className="mt-3 flex items-baseline justify-between">
 <span className="text-2xl font-black text-gray-900 tracking-tight">{stats.unallocatedBatchesCount}</span>
 <span className={`text-xs font-medium ${stats.unallocatedBatchesCount === 0 ? 'text-govt-green-500' : 'text-govt-gold-600'}`}>
 {stats.unallocatedBatchesCount === 0 ? 'Fully staffed' : 'Need teachers'}
 </span>
 </div>
 <p className="text-[11px] text-gray-500 mt-2">Batches awaiting faculty lead</p>
 </div>
 </div>

 {/* Top Section: "Assign Instructor to Batch" Form */}
 <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-govt-lg relative overflow-hidden">
 <div className="absolute -top-16 -right-16 w-48 h-48 bg-govt-green/10 rounded-full blur-3xl pointer-events-none"></div>

 <div className="flex items-center space-x-3 mb-5 border-b border-gray-200 pb-4">
 <div className="h-9 w-9 rounded-xl bg-govt-green-500/15 border border-govt-green-200 flex items-center justify-center text-govt-green-500">
 <UserPlus className="h-5 w-5" />
 </div>
 <div>
 <h2 className="text-base font-bold text-gray-900 tracking-tight">Assign Instructor to Batch</h2>
 <p className="text-xs text-gray-500">
 Select an academic batch and pair it with a registered teacher to immediately activate classroom capabilities
 </p>
 </div>
 </div>

 {recentlySuccessful && (
 <div className="mb-4 p-3.5 rounded-xl bg-govt-green-500/15 border border-govt-green-200 text-govt-green-400 text-xs font-medium flex items-center space-x-2">
 <CheckCircle2 className="h-4 w-4 shrink-0 text-govt-green-500" />
 <span>Faculty assignment saved successfully. The batch is now live on the instructor&apos;s dashboard.</span>
 </div>
 )}

 <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-12 gap-4">
 {/* Dropdown 1: Select Batch */}
 <div className="md:col-span-5 space-y-1.5">
 <label htmlFor="batch_id" className="block text-xs font-semibold text-gray-600">
 Academic Batch <span className="text-rose-600">*</span>
 </label>
 <div className="relative">
 <select
 id="batch_id"
 value={data.batch_id}
 onChange={(e) => setData('batch_id', e.target.value)}
 className="w-full bg-govt-cream-300/90 border border-gray-200/80 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-govt-green-400/50 focus:border-emerald-500 transition"
 >
 <option value="" disabled className="bg-white text-gray-500">
 -- Select an Academic Batch --
 </option>
 {batches.map((batch) => {
 const courseTitle = batch.course?.name || 'General Program';
 return (
 <option key={batch.id} value={batch.id} className="bg-white text-gray-900">
 {batch.name} • {courseTitle} ({batch.shift || 'Regular'} - {batch.session_year})
 </option>
 );
 })}
 </select>
 </div>
 {errors.batch_id && (
 <p className="text-xs text-rose-600 flex items-center space-x-1 mt-1">
 <AlertCircle className="h-3.5 w-3.5" />
 <span>{errors.batch_id}</span>
 </p>
 )}
 </div>

 {/* Dropdown 2: Select Teacher */}
 <div className="md:col-span-5 space-y-1.5">
 <label htmlFor="user_id" className="block text-xs font-semibold text-gray-600">
 Instructor / Teacher <span className="text-rose-600">*</span>
 </label>
 <div className="relative">
 <select
 id="user_id"
 value={data.user_id}
 onChange={(e) => setData('user_id', e.target.value)}
 className="w-full bg-govt-cream-300/90 border border-gray-200/80 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-govt-green-400/50 focus:border-emerald-500 transition"
 >
 <option value="" disabled className="bg-white text-gray-500">
 -- Select a Faculty Member --
 </option>
 {teachers.map((teacher) => (
 <option key={teacher.id} value={teacher.id} className="bg-white text-gray-900">
 {teacher.name} ({teacher.email})
 </option>
 ))}
 </select>
 </div>
 {errors.user_id && (
 <p className="text-xs text-rose-600 flex items-center space-x-1 mt-1">
 <AlertCircle className="h-3.5 w-3.5" />
 <span>{errors.user_id}</span>
 </p>
 )}
 </div>

 {/* Submit button */}
 <div className="md:col-span-2 flex items-end">
 <button
 type="submit"
 disabled={processing || !data.batch_id || !data.user_id}
 className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-govt-green hover:bg-govt-green-500 active:bg-emerald-700 text-white shadow-lg shadow-govt transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
 >
 <UserCheck className="h-4 w-4" />
 <span>{processing ? 'Assigning...' : 'Assign Teacher'}</span>
 </button>
 </div>
 </form>
 </div>

 {/* Main Section: Data Table & List of Batches */}
 <div className="bg-white rounded-2xl border border-gray-200 shadow-govt-lg overflow-hidden">
 {/* Header & Filter Controls */}
 <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-govt-cream">
 <div>
 <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center space-x-2">
 <span>Allocated Batches & Teaching Roster</span>
 <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-govt-cream-300 text-gray-600 border border-gray-200">
 {filteredBatches.length} {filteredBatches.length === 1 ? 'Batch' : 'Batches'}
 </span>
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 Review assigned instructors per batch or remove assignments as scheduling requires
 </p>
 </div>

 {/* Search & Shift Filters */}
 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
 {/* Search */}
 <div className="relative min-w-[220px]">
 <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
 <input
 type="text"
 placeholder="Search batch or teacher..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-govt-cream-300 border border-gray-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-gray-800 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-govt-green-400 transition"
 />
 {searchQuery && (
 <button
 onClick={() => setSearchQuery('')}
 className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-800"
 >
 <X className="h-3.5 w-3.5" />
 </button>
 )}
 </div>

 {/* Shift Filter */}
 <div className="relative">
 <select
 value={selectedShiftFilter}
 onChange={(e) => setSelectedShiftFilter(e.target.value)}
 className="bg-govt-cream-300 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-govt-green-400 transition"
 >
 <option value="all">All Shifts</option>
 <option value="Morning">Morning Shift</option>
 <option value="Evening">Evening Shift</option>
 </select>
 </div>
 </div>
 </div>

 {/* Table / List Container */}
 {filteredBatches.length === 0 ? (
 <div className="p-12 text-center">
 <div className="h-12 w-12 rounded-2xl bg-govt-cream-300 border border-gray-200/80 flex items-center justify-center mx-auto text-gray-500 mb-3">
 <BookOpen className="h-6 w-6" />
 </div>
 <p className="text-sm font-semibold text-gray-600">No batches match your query</p>
 <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
 Try adjusting your search term or shift filter to view existing academic allocations.
 </p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-gray-200 bg-white/40 text-[11px] font-bold uppercase tracking-wider text-gray-500">
 <th className="px-6 py-3.5">Batch Details</th>
 <th className="px-6 py-3.5">Course & Program</th>
 <th className="px-6 py-3.5">Shift & Session</th>
 <th className="px-6 py-3.5">Assigned Faculty</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100/60 text-xs">
 {filteredBatches.map((batch) => {
 const assignedUsers = batch.users || [];
 const hasTeachers = assignedUsers.length > 0;

 return (
 <tr
 key={batch.id}
 className="hover:bg-slate-850/50 transition-colors group"
 >
 {/* Batch Details */}
 <td className="px-6 py-4 align-top">
 <div className="flex items-start space-x-3">
 <div className="h-9 w-9 rounded-xl bg-govt-cream-300 border border-gray-200 flex items-center justify-center text-govt-green-500 shrink-0 font-bold text-xs mt-0.5">
 {batch.name ? batch.name.substring(0, 2).toUpperCase() : 'B'}
 </div>
 <div>
 <p className="font-bold text-gray-900 text-sm">{batch.name}</p>
 <div className="flex items-center space-x-2 text-gray-500 text-[11px] mt-0.5">
 <span className="flex items-center space-x-1">
 <Calendar className="h-3 w-3 text-gray-500" />
 <span>{batch.session_year || '2026-2027'}</span>
 </span>
 <span>•</span>
 <span className="text-gray-500">ID: #{batch.id}</span>
 </div>
 </div>
 </div>
 </td>

 {/* Course & Trade */}
 <td className="px-6 py-4 align-top">
 <div className="space-y-0.5">
 <p className="font-semibold text-gray-800">
 {batch.course?.name || 'Vocational Course'}
 </p>
 <p className="text-[11px] text-gray-500">
 {batch.course?.trade?.name || 'Department Trade'}
 </p>
 </div>
 </td>

 {/* Shift & Session */}
 <td className="px-6 py-4 align-top">
 <div className="flex flex-col space-y-1.5">
 <span
 className={`inline-flex items-center w-max space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
 batch.shift === 'Morning'
 ? 'bg-govt-gold-50 text-govt-gold border-govt-gold-200'
 : 'bg-govt-green-500/10 text-indigo-300 border-indigo-500/20'
 }`}
 >
 <Clock className="h-3 w-3" />
 <span>{batch.shift || 'Regular'} Shift</span>
 </span>
 <span className="text-[11px] text-gray-500">
 Year: {batch.session_year}
 </span>
 </div>
 </td>

 {/* Assigned Faculty */}
 <td className="px-6 py-4 align-top">
 {!hasTeachers ? (
 <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-govt-cream-300/40 border border-dashed border-gray-200 text-gray-500 text-xs">
 <AlertCircle className="h-3.5 w-3.5 text-govt-gold-600/80" />
 <span>No instructors assigned</span>
 </div>
 ) : (
 <div className="flex flex-wrap gap-2">
 {assignedUsers.map((teacher) => (
 <div
 key={teacher.id}
 className="inline-flex items-center justify-between space-x-2 pl-2.5 pr-1.5 py-1 rounded-xl bg-govt-cream-300/90 border border-gray-200/80 text-gray-800 shadow-sm hover:border-gray-200 transition"
 >
 <div className="flex items-center space-x-2 min-w-0">
 <div className="h-5 w-5 rounded-md bg-govt-green-500/20 text-govt-green-400 text-[10px] font-bold flex items-center justify-center shrink-0">
 {teacher.name ? teacher.name.charAt(0).toUpperCase() : 'T'}
 </div>
 <div className="min-w-0">
 <p className="text-xs font-semibold text-gray-900 truncate max-w-[140px]">
 {teacher.name}
 </p>
 </div>
 </div>

 {/* Small Red Remove Button */}
 <button
 type="button"
 onClick={() =>
 setConfirmDelete({
 batchId: batch.id,
 batchName: batch.name,
 teacherId: teacher.id,
 teacherName: teacher.name,
 })
 }
 title="Remove instructor from batch"
 className="p-1 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 focus:outline-none transition cursor-pointer"
 >
 <Trash2 className="h-3.5 w-3.5" />
 </button>
 </div>
 ))}
 </div>
 )}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </div>

 {/* Confirmation Modal for Removing Instructor */}
 {confirmDelete && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fadeIn">
 <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-6 shadow-govt-lg space-y-4">
 <div className="flex items-center space-x-3">
 <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 shrink-0">
 <Trash2 className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-base font-bold text-gray-900">Unassign Instructor</h3>
 <p className="text-xs text-gray-500">Confirm detachment of academic faculty member</p>
 </div>
 </div>

 <div className="p-3.5 rounded-xl bg-govt-cream-300/80 border border-gray-200 text-xs text-gray-600 space-y-1">
 <p>
 Are you sure you want to remove <span className="font-semibold text-rose-300">{confirmDelete.teacherName}</span> from{' '}
 <span className="font-semibold text-gray-800">{confirmDelete.batchName}</span>?
 </p>
 <p className="text-[11px] text-gray-500 pt-1">
 This will detach the batch from the teacher&apos;s portal, revoking their grading and attendance access for this class.
 </p>
 </div>

 <div className="flex items-center justify-end space-x-3 pt-2">
 <button
 type="button"
 onClick={() => setConfirmDelete(null)}
 className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-white hover:bg-govt-cream-300 transition cursor-pointer"
 >
 Cancel
 </button>
 <button
 type="button"
 onClick={() => handleRemove(confirmDelete.batchId, confirmDelete.teacherId)}
 className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 transition cursor-pointer"
 >
 Confirm Removal
 </button>
 </div>
 </div>
 </div>
 )}
 </AdminLayout>
 );
}
