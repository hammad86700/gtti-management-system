import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
 MapPin,
 Calendar,
 Users,
 ShieldCheck,
 CheckCircle2,
 XCircle,
 Clock,
 Filter,
 Building2,
 ArrowRight,
 Navigation,
 Activity
} from 'lucide-react';

export default function Index({
 sessions = [],
 gateLogs = [],
 batches = [],
 selectedDate,
 selectedBatchId,
 stats = {}
}) {
 const [date, setDate] = useState(selectedDate);
 const [batchId, setBatchId] = useState(selectedBatchId || '');

 const handleFilter = (e) => {
 e.preventDefault();
 router.get(route('admin.attendance.index'), {
 date: date,
 batch_id: batchId || undefined,
 }, {
 preserveState: true,
 });
 };

 return (
 <AuthenticatedLayout
 header={
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div>
 <div className="flex items-center space-x-2">
 <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-govt-green text-white">
 TEVTA Security & Academic Wing
 </span>
 <span className="text-xs text-gray-500 font-mono">Institutional Tracking</span>
 </div>
 <h2 className="text-xl font-black text-gray-900 mt-1">
 Campus & Classroom Attendance Monitor
 </h2>
 </div>

 {/* Filter Form */}
 <form onSubmit={handleFilter} className="flex items-center space-x-2">
 <input
 type="date"
 value={date}
 onChange={(e) => setDate(e.target.value)}
 className="text-xs rounded-xl border-gray-200 text-gray-800 "
 />
 <select
 value={batchId}
 onChange={(e) => setBatchId(e.target.value)}
 className="text-xs rounded-xl border-gray-200 text-gray-800 "
 >
 <option value="">All Batches</option>
 {batches.map((b) => (
 <option key={b.id} value={b.id}>
 {b.name} ({b.course?.name})
 </option>
 ))}
 </select>
 <button
 type="submit"
 className="px-3.5 py-2 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white font-bold text-xs transition shadow-sm"
 >
 Filter
 </button>
 </form>
 </div>
 }
 >
 <Head title="Attendance Monitoring - GIIMS Admin" />

 <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

 {/* KPI STATS */}
 <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
 <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
 <p className="text-[11px] text-gray-500 font-semibold">Total Marked</p>
 <p className="text-2xl font-black text-gray-900 ">{stats.total_marked || 0}</p>
 <p className="text-[10px] text-gray-500">Classroom Roll Calls</p>
 </div>

 <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
 <p className="text-[11px] text-govt-green-500 font-semibold">Present</p>
 <p className="text-2xl font-black text-govt-green-500 ">{stats.present_count || 0}</p>
 <p className="text-[10px] text-emerald-700 font-bold">{stats.attendance_rate || 0}% Rate</p>
 </div>

 <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
 <p className="text-[11px] text-govt-green-500 font-semibold">GPS Geofenced</p>
 <p className="text-2xl font-black text-govt-green-500 ">{stats.gps_count || 0}</p>
 <p className="text-[10px] text-govt-green font-semibold">Lab Check-Ins</p>
 </div>

 <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
 <p className="text-[11px] text-blue-600 font-semibold">Teacher Manual</p>
 <p className="text-2xl font-black text-blue-600 ">{stats.manual_count || 0}</p>
 <p className="text-[10px] text-blue-700 font-semibold">Roll Call</p>
 </div>

 <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
 <p className="text-[11px] text-amber-600 font-semibold">Late Arrivals</p>
 <p className="text-2xl font-black text-amber-600 ">{stats.late_count || 0}</p>
 <p className="text-[10px] text-amber-700 font-semibold">Recorded</p>
 </div>

 <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
 <p className="text-[11px] text-rose-600 font-semibold">Absentees</p>
 <p className="text-2xl font-black text-rose-600 ">{stats.absent_count || 0}</p>
 <p className="text-[10px] text-rose-700 font-semibold">Unexcused</p>
 </div>
 </div>

 {/* SESSIONS TABLE */}
 <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-gray-100 ">
 <div>
 <h3 className="text-base font-extrabold text-gray-900 ">
 Active Batch Sessions ({selectedDate})
 </h3>
 <p className="text-xs text-gray-500 ">
 Trade batches with classroom and lab attendance sessions
 </p>
 </div>
 </div>

 {sessions.length > 0 ? (
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="text-gray-500 border-b border-gray-100 ">
 <th className="pb-3 font-semibold">Batch & Course</th>
 <th className="pb-3 font-semibold">Designated Location / Lab</th>
 <th className="pb-3 font-semibold">Radius</th>
 <th className="pb-3 font-semibold">Instructor</th>
 <th className="pb-3 font-semibold">Present</th>
 <th className="pb-3 font-semibold">GPS Verified</th>
 <th className="pb-3 font-semibold">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
 {sessions.map((s) => {
 const total = s.class_attendances?.length || 0;
 const present = s.class_attendances?.filter((a) => a.status === 'present').length || 0;
 const gps = s.class_attendances?.filter((a) => a.method === 'gps').length || 0;

 return (
 <tr key={s.id} className="hover:bg-govt-green-50 :bg-white/30 transition">
 <td className="py-3.5">
 <p className="font-bold text-gray-900 ">{s.batch?.name}</p>
 <p className="text-[11px] text-gray-500 ">{s.batch?.course?.name}</p>
 </td>
 <td className="py-3.5">
 <div className="flex items-center space-x-1.5 text-govt-green-500 font-bold">
 <MapPin className="h-3.5 w-3.5" />
 <span>{s.location_name}</span>
 </div>
 </td>
 <td className="py-3.5 font-mono">{s.radius_meters || 150}m</td>
 <td className="py-3.5">{s.user?.name || 'Assigned Faculty'}</td>
 <td className="py-3.5 font-bold text-govt-green-500 ">
 {present} / {total}
 </td>
 <td className="py-3.5 font-bold text-govt-green-500 ">
 {gps} Trainees
 </td>
 <td className="py-3.5">
 <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
 s.status === 'active'
 ? 'bg-govt-green-500/20 text-emerald-700 '
 : 'bg-slate-200 text-gray-700 '
 }`}>
 {s.status}
 </span>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 ) : (
 <div className="p-8 text-center text-xs text-gray-500 ">
 No attendance sessions recorded for {selectedDate}.
 </div>
 )}
 </div>

 {/* RFID GATE SCAN AUDIT STREAM */}
 {gateLogs.length > 0 && (
 <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-gray-100 ">
 <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
 <ShieldCheck className="h-5 w-5 text-govt-green-500" />
 <span>Recent Campus Perimeter Access & RFID Gate Logs</span>
 </h3>
 <span className="text-xs text-gray-500 font-mono">Security Gate Sync</span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 {gateLogs.map((log) => (
 <div
 key={log.id}
 className="p-3.5 rounded-2xl bg-govt-cream border border-gray-100 text-xs space-y-1"
 >
 <div className="flex items-center justify-between">
 <span className="font-bold text-gray-900 truncate">
 {log.student_profile?.user?.name || 'Trainee'}
 </span>
 <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-govt-green-500/10 text-govt-green-500">
 {log.type}
 </span>
 </div>
 <p className="text-[11px] text-gray-500 ">
 Gate: {log.gate_name} • {new Date(log.logged_at).toLocaleTimeString()}
 </p>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 </AuthenticatedLayout>
 );
}
