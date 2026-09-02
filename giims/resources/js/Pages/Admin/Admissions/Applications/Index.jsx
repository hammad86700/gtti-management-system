import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import {
 FileCheck,
 Search,
 Filter,
 FileText,
 CheckCircle2,
 Clock,
 XCircle,
 AlertCircle,
 Eye,
 GraduationCap,
 Calendar,
 Award
} from 'lucide-react';

export default function Index({ applications }) {
 const [searchTerm, setSearchTerm] = useState('');
 const [selectedStatus, setSelectedStatus] = useState('all');

 const appList = applications.data || [];

 const getStatusBadge = (status) => {
 switch (status) {
 case 'verified':
 return 'bg-govt-green-500/10 text-govt-green-500 border-govt-green-200';
 case 'submitted':
 return 'bg-blue-50 text-blue-600 border-blue-200';
 case 'under_review':
 return 'bg-govt-gold-50 text-govt-gold-600 border-govt-gold-200';
 case 'selected':
 return 'bg-purple-50 text-purple-600 border-purple-200';
 case 'enrolled':
 return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
 case 'rejected':
 return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
 default:
 return 'bg-govt-cream-300 text-gray-600 border-gray-200';
 }
 };

 const filteredApplications = appList.filter((app) => {
 if (selectedStatus !== 'all' && app.status !== selectedStatus) {
 return false;
 }
 if (!searchTerm) return true;

 const q = searchTerm.toLowerCase();
 const matchesAppNum = app.application_number?.toLowerCase().includes(q);
 const matchesName = app.student_profile?.user?.name?.toLowerCase().includes(q);
 const matchesFather = app.student_profile?.father_name?.toLowerCase().includes(q);
 const matchesCourse = app.course?.name?.toLowerCase().includes(q);
 const matchesTrade = app.course?.trade?.name?.toLowerCase().includes(q);

 return matchesAppNum || matchesName || matchesFather || matchesCourse || matchesTrade;
 });

 const statusCounts = {
 all: appList.length,
 submitted: appList.filter((a) => a.status === 'submitted').length,
 verified: appList.filter((a) => a.status === 'verified').length,
 under_review: appList.filter((a) => a.status === 'under_review').length,
 rejected: appList.filter((a) => a.status === 'rejected').length,
 };

 return (
 <AdminLayout
 header={
 <div>
 <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
 Admissions Review & Verification Desk
 </h1>
 <p className="text-xs text-gray-500">
 Review submitted applications, inspect uploaded verification certificates, and update status
 </p>
 </div>
 }
 >
 <Head title="Application Reviews - GIIMS" />

 <div className="space-y-6">
 {/* Stats Bar */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
 <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-md">
 <p className="text-xs text-gray-500 font-medium">Total Applications</p>
 <h3 className="text-2xl font-bold text-gray-900 mt-1">{applications.total ?? appList.length}</h3>
 <p className="text-[11px] text-gray-500">In Active Database</p>
 </div>

 <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-md">
 <p className="text-xs text-blue-600 font-medium">New Submissions</p>
 <h3 className="text-2xl font-bold text-blue-300 mt-1">{statusCounts.submitted}</h3>
 <p className="text-[11px] text-gray-500">Awaiting Verification</p>
 </div>

 <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-md">
 <p className="text-xs text-govt-green-500 font-medium">Verified</p>
 <h3 className="text-2xl font-bold text-govt-green-400 mt-1">{statusCounts.verified}</h3>
 <p className="text-[11px] text-gray-500">Documents Approved</p>
 </div>

 <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-md">
 <p className="text-xs text-rose-600 font-medium">Rejected</p>
 <h3 className="text-2xl font-bold text-rose-300 mt-1">{statusCounts.rejected}</h3>
 <p className="text-[11px] text-gray-500">Ineligible / Discrepant</p>
 </div>
 </div>

 {/* Filter and Search Bar */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-gray-200 shadow-md">
 <div className="relative flex-1 max-w-md">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
 <input
 type="text"
 placeholder="Search by App #, Applicant Name, or Trade..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full pl-10 pr-4 py-2 bg-govt-cream-300 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-govt-green-400/40"
 />
 </div>

 <div className="flex flex-wrap items-center gap-2">
 {['all', 'submitted', 'under_review', 'verified', 'rejected'].map((status) => (
 <button
 key={status}
 onClick={() => setSelectedStatus(status)}
 className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
 selectedStatus === status
 ? 'bg-govt-green text-white shadow-md shadow-emerald-950/40'
 : 'bg-govt-cream-300 text-gray-600 hover:text-white border border-gray-200'
 }`}
 >
 {status.replace('_', ' ')}
 </button>
 ))}
 </div>
 </div>

 {/* Applications Table */}
 <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-govt-lg space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-gray-200 text-xs text-gray-500">
 <span className="font-bold text-gray-900">Application Entries</span>
 <span>Showing {filteredApplications.length} records</span>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="text-gray-500 border-b border-gray-200">
 <th className="pb-3 font-semibold">App Number</th>
 <th className="pb-3 font-semibold">Applicant & Father</th>
 <th className="pb-3 font-semibold">Applied Course / Trade</th>
 <th className="pb-3 font-semibold">Campaign</th>
 <th className="pb-3 font-semibold">Documents</th>
 <th className="pb-3 font-semibold">Status</th>
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
 const docsCount = app.documents?.length || 0;

 return (
 <tr key={app.id} className="hover:bg-govt-cream-300/40 transition">
 <td className="py-3.5 font-mono font-bold text-govt-green-500">
 {app.application_number}
 </td>
 <td className="py-3.5">
 <p className="font-bold text-gray-900">{user?.name || 'Applicant'}</p>
 <p className="text-[11px] text-gray-500">
 S/D of: {profile?.father_name || 'N/A'} • {profile?.domicile_district || 'District'}
 </p>
 </td>
 <td className="py-3.5">
 <p className="font-semibold text-gray-800">{course?.name}</p>
 <p className="text-[11px] text-gray-500">
 {dept?.name || 'Dept'} ({trade?.program?.name || 'Program'})
 </p>
 </td>
 <td className="py-3.5 text-gray-600">
 {app.admission_campaign?.name || 'Admission Cycle'}
 </td>
 <td className="py-3.5">
 <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-govt-cream-300 border border-gray-200 text-gray-600">
 <FileText className="h-3 w-3 text-cyan-600" />
 <span>{docsCount} Files</span>
 </span>
 </td>
 <td className="py-3.5">
 <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(app.status)}`}>
 {app.status.replace('_', ' ')}
 </span>
 </td>
 <td className="py-3.5 text-right">
 <Link
 href={route('admin.applications.show', app.id)}
 className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-govt-cream-300 hover:bg-govt-green hover:text-white border border-gray-200 text-gray-800 text-xs font-semibold transition"
 >
 <Eye className="h-3.5 w-3.5" />
 <span>Review</span>
 </Link>
 </td>
 </tr>
 );
 })}

 {filteredApplications.length === 0 && (
 <tr>
 <td colSpan="7" className="py-12 text-center text-gray-500 text-xs">
 No applications match the selected filter.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>

 {/* Pagination Links */}
 {applications.links && applications.links.length > 3 && (
 <div className="pt-4 border-t border-gray-200 flex items-center justify-end space-x-1">
 {applications.links.map((link, idx) => (
 <Link
 key={idx}
 href={link.url || '#'}
 dangerouslySetInnerHTML={{ __html: link.label }}
 className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
 link.active
 ? 'bg-govt-green text-white font-bold'
 : link.url
 ? 'bg-govt-cream-300 text-gray-600 hover:bg-govt-green-50'
 : 'bg-white text-gray-600 cursor-not-allowed'
 }`}
 />
 ))}
 </div>
 )}
 </div>
 </div>
 </AdminLayout>
 );
}
