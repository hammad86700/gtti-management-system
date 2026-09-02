import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import {
 GraduationCap,
 UserCheck,
 Layers,
 Calendar,
 Building2,
 CheckCircle2,
 Clock,
 ArrowRight,
 Search,
 Award,
 Sparkles,
 Shield,
 Users
} from 'lucide-react';

export default function Index({ applications = [], batches = [], enrollments = [] }) {
 const [selectedBatches, setSelectedBatches] = useState({});
 const [enrollingId, setEnrollingId] = useState(null);
 const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'enrolled'
 const [searchTerm, setSearchTerm] = useState('');

 const handleBatchChange = (appId, batchId) => {
 setSelectedBatches((prev) => ({
 ...prev,
 [appId]: batchId,
 }));
 };

 const handleEnroll = (app) => {
 const availableBatchesForCourse = batches.filter(
 (b) => String(b.course_id) === String(app.course_id)
 );

 const chosenBatchId =
 selectedBatches[app.id] ||
 (availableBatchesForCourse.length > 0 ? availableBatchesForCourse[0].id : (batches[0]?.id || ''));

 if (!chosenBatchId) {
 alert('Please select a valid academic batch for this course before enrolling.');
 return;
 }

 setEnrollingId(app.id);
 router.post(
 route('admin.enrollments.store'),
 {
 application_id: app.id,
 batch_id: chosenBatchId,
 },
 {
 onFinish: () => setEnrollingId(null),
 }
 );
 };

 const filteredApplications = applications.filter((app) => {
 if (!searchTerm) return true;
 const q = searchTerm.toLowerCase();
 return (
 app.application_number?.toLowerCase().includes(q) ||
 app.student_profile?.user?.name?.toLowerCase().includes(q) ||
 app.student_profile?.father_name?.toLowerCase().includes(q) ||
 app.course?.name?.toLowerCase().includes(q)
 );
 });

 const filteredEnrollments = enrollments.filter((enr) => {
 if (!searchTerm) return true;
 const q = searchTerm.toLowerCase();
 return (
 enr.enrollment_number?.toLowerCase().includes(q) ||
 enr.student_profile?.user?.name?.toLowerCase().includes(q) ||
 enr.course?.name?.toLowerCase().includes(q) ||
 enr.batch?.name?.toLowerCase().includes(q)
 );
 });

 return (
 <AdminLayout
 header={
 <div>
 <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
 Student Enrollment & Batch Allocation
 </h1>
 <p className="text-xs text-gray-500">
 Transition merit-selected candidates into official student records and allocate academic batches
 </p>
 </div>
 }
 >
 <Head title="Student Enrollments - GIIMS" />

 <div className="space-y-6">
 {/* Stats Bar */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-lg flex items-center space-x-4">
 <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
 <Award className="h-6 w-6" />
 </div>
 <div>
 <p className="text-xs text-gray-500 font-medium">Selected for Admission</p>
 <h3 className="text-2xl font-bold text-purple-300">{applications.length}</h3>
 <p className="text-[11px] text-gray-500">Pending Batch Enrollment</p>
 </div>
 </div>

 <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-lg flex items-center space-x-4">
 <div className="h-12 w-12 rounded-xl bg-govt-green-500/10 text-govt-green-500 flex items-center justify-center border border-govt-green-200">
 <GraduationCap className="h-6 w-6" />
 </div>
 <div>
 <p className="text-xs text-gray-500 font-medium">Officially Enrolled</p>
 <h3 className="text-2xl font-bold text-govt-green-400">{enrollments.length}</h3>
 <p className="text-[11px] text-gray-500">Issued Student IDs</p>
 </div>
 </div>

 <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-lg flex items-center space-x-4">
 <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
 <Layers className="h-6 w-6" />
 </div>
 <div>
 <p className="text-xs text-gray-500 font-medium">Academic Batches</p>
 <h3 className="text-2xl font-bold text-blue-300">{batches.length}</h3>
 <p className="text-[11px] text-gray-500">Session 2026-2027</p>
 </div>
 </div>
 </div>

 {/* Filter and Tab Switching Bar */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-gray-200 shadow-md">
 <div className="flex items-center space-x-2">
 <button
 onClick={() => setActiveTab('pending')}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
 activeTab === 'pending'
 ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
 : 'bg-govt-cream-300 text-gray-600 hover:text-white border border-gray-200'
 }`}
 >
 <Award className="h-4 w-4" />
 <span>Selected Candidates ({applications.length})</span>
 </button>

 <button
 onClick={() => setActiveTab('enrolled')}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
 activeTab === 'enrolled'
 ? 'bg-govt-green text-white shadow-md shadow-emerald-950/40'
 : 'bg-govt-cream-300 text-gray-600 hover:text-white border border-gray-200'
 }`}
 >
 <GraduationCap className="h-4 w-4" />
 <span>Enrolled Roster ({enrollments.length})</span>
 </button>
 </div>

 <div className="relative flex-1 max-w-sm">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
 <input
 type="text"
 placeholder="Search applicant, ID, or course..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full pl-10 pr-4 py-2 bg-govt-cream-300 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-govt-green-400/40"
 />
 </div>
 </div>

 {/* Tab 1: Selected Candidates Awaiting Enrollment */}
 {activeTab === 'pending' && (
 <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-govt-lg space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-gray-200 text-xs text-gray-500">
 <span className="font-bold text-gray-900">Candidates Ready for Batch Allocation</span>
 <span>{filteredApplications.length} Candidates</span>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="text-gray-500 border-b border-gray-200">
 <th className="pb-3 font-semibold">App #</th>
 <th className="pb-3 font-semibold">Candidate</th>
 <th className="pb-3 font-semibold">Applied Course / Trade</th>
 <th className="pb-3 font-semibold">Merit Score</th>
 <th className="pb-3 font-semibold min-w-[220px]">Target Batch Allocation</th>
 <th className="pb-3 font-semibold text-right">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100/60 text-gray-600 font-medium">
 {filteredApplications.map((app) => {
 const user = app.student_profile?.user;
 const profile = app.student_profile;
 const course = app.course;
 const trade = course?.trade;
 const dept = trade?.program?.department;

 // Available batches for this specific course
 const courseBatches = batches.filter(
 (b) => String(b.course_id) === String(app.course_id)
 );
 const options = courseBatches.length > 0 ? courseBatches : batches;
 const selectedBatchVal = selectedBatches[app.id] || options[0]?.id || '';

 return (
 <tr key={app.id} className="hover:bg-govt-cream-300/40 transition">
 <td className="py-3.5 font-mono font-bold text-purple-600">
 {app.application_number}
 </td>
 <td className="py-3.5">
 <p className="font-bold text-gray-900">{user?.name || 'Applicant'}</p>
 <p className="text-[11px] text-gray-500">
 S/D of: {profile?.father_name || 'N/A'} • {profile?.domicile_district || 'District'}
 </p>
 </td>
 <td className="py-3.5">
 <p className="font-semibold text-gray-800">{course?.name} ({trade?.name})</p>
 <p className="text-[11px] text-gray-500">{dept?.name}</p>
 </td>
 <td className="py-3.5">
 <span className="font-mono font-bold text-govt-green-500">
 {app.merit_score || 0}%
 </span>
 </td>
 <td className="py-3.5">
 <select
 value={selectedBatchVal}
 onChange={(e) => handleBatchChange(app.id, e.target.value)}
 className="w-full px-3 py-1.5 bg-govt-cream-300 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-govt-green-400/40"
 >
 {options.map((batch) => (
 <option key={batch.id} value={batch.id}>
 {batch.name} ({batch.session_year || '2026-2027'}, {batch.shift || 'Morning'})
 </option>
 ))}
 </select>
 </td>
 <td className="py-3.5 text-right">
 <button
 type="button"
 disabled={enrollingId === app.id}
 onClick={() => handleEnroll(app)}
 className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white text-xs font-bold transition shadow-md shadow-emerald-950/40 disabled:opacity-50"
 >
 <UserCheck className="h-3.5 w-3.5" />
 <span>{enrollingId === app.id ? 'Enrolling...' : 'Enroll Student'}</span>
 </button>
 </td>
 </tr>
 );
 })}

 {filteredApplications.length === 0 && (
 <tr>
 <td colSpan="6" className="py-12 text-center text-gray-500 text-xs">
 No candidates currently awaiting enrollment. Selected candidates from merit lists appear here.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Tab 2: Officially Enrolled Students Roster */}
 {activeTab === 'enrolled' && (
 <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-govt-lg space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-gray-200 text-xs text-gray-500">
 <span className="font-bold text-gray-900">Active Student Roster</span>
 <span>{filteredEnrollments.length} Enrolled</span>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="text-gray-500 border-b border-gray-200">
 <th className="pb-3 font-semibold">Official Student ID</th>
 <th className="pb-3 font-semibold">Student Name</th>
 <th className="pb-3 font-semibold">Enrolled Course / Trade</th>
 <th className="pb-3 font-semibold">Assigned Batch</th>
 <th className="pb-3 font-semibold">Enrollment Date</th>
 <th className="pb-3 font-semibold text-right">Academic Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100/60 text-gray-600 font-medium">
 {filteredEnrollments.map((enr) => {
 const user = enr.student_profile?.user;
 const profile = enr.student_profile;
 const course = enr.course;
 const batch = enr.batch;

 return (
 <tr key={enr.id} className="hover:bg-govt-cream-300/40 transition">
 <td className="py-3.5 font-mono font-bold text-govt-green-500 flex items-center space-x-2">
 <div className="h-7 w-7 rounded-lg bg-govt-green-500/10 text-govt-green-500 flex items-center justify-center border border-govt-green-200">
 <GraduationCap className="h-4 w-4" />
 </div>
 <span>{enr.enrollment_number}</span>
 </td>
 <td className="py-3.5">
 <p className="font-bold text-gray-900">{user?.name || 'Student'}</p>
 <p className="text-[11px] text-gray-500">
 S/D of: {profile?.father_name || 'N/A'} • {user?.email}
 </p>
 </td>
 <td className="py-3.5">
 <p className="font-semibold text-gray-800">{course?.name}</p>
 <p className="text-[11px] text-gray-500">{course?.trade?.name}</p>
 </td>
 <td className="py-3.5 text-gray-600">
 <p className="font-semibold text-gray-800">{batch?.name || 'Fall 2026'}</p>
 <p className="text-[11px] text-cyan-600">{batch?.session_year} • {batch?.shift}</p>
 </td>
 <td className="py-3.5 font-mono text-gray-500">
 {enr.enrollment_date ? enr.enrollment_date.substring(0, 10) : 'Recent'}
 </td>
 <td className="py-3.5 text-right">
 <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-govt-green-500/10 text-govt-green-500 border border-govt-green-200">
 <CheckCircle2 className="h-3 w-3" />
 <span>{enr.status}</span>
 </span>
 </td>
 </tr>
 );
 })}

 {filteredEnrollments.length === 0 && (
 <tr>
 <td colSpan="6" className="py-12 text-center text-gray-500 text-xs">
 No students enrolled yet. Enroll selected candidates from the 'Selected Candidates' tab.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </div>
 </AdminLayout>
 );
}
