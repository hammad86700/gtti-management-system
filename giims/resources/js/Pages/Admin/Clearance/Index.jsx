import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
 Award,
 CheckCircle2,
 Clock,
 AlertCircle,
 Building2,
 DollarSign,
 BookOpen,
 Wrench,
 GraduationCap,
 Sparkles,
 ShieldCheck,
 Filter,
 Inbox,
 Save,
 FileCheck,
 CreditCard
} from 'lucide-react';

export default function Index({ clearances = [] }) {
 const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'cleared'
 const [updatingId, setUpdatingId] = useState(null);
 const [issuingId, setIssuingId] = useState(null);

 // Form local states for dropdown edits
 const [localStatuses, setLocalStatuses] = useState(
 clearances.reduce((acc, c) => {
 acc[c.id] = {
 fee_status: c.fee_status,
 library_status: c.library_status,
 workshop_status: c.workshop_status,
 };
 return acc;
 }, {})
 );

 const handleFieldChange = (id, field, value) => {
 setLocalStatuses((prev) => ({
 ...prev,
 [id]: {
 ...prev[id],
 [field]: value,
 },
 }));
 };

 const handleSaveStatuses = (id) => {
 setUpdatingId(id);
 const data = localStatuses[id];
 router.patch(route('admin.clearances.update', { id }), data, {
 preserveScroll: true,
 onFinish: () => setUpdatingId(null),
 });
 };

 const handleIssueCertificate = (id, candidateName, courseName) => {
 if (
 confirm(
 `Generate and issue official Government of Punjab TEVTA Certificate for ${candidateName} (${courseName})?\n\nThis will mark the student's enrollment status as 'Graduated'.`
 )
 ) {
 setIssuingId(id);
 router.post(
 route('admin.clearances.issue-certificate', { id }),
 {},
 {
 preserveScroll: true,
 onFinish: () => setIssuingId(null),
 }
 );
 }
 };

 const filteredClearances = clearances.filter((c) => {
 if (statusFilter === 'all') return true;
 return c.overall_status === statusFilter;
 });

 const clearedCount = clearances.filter((c) => c.overall_status === 'cleared').length;
 const pendingCount = clearances.filter((c) => c.overall_status === 'pending').length;
 const certificatesCount = clearances.filter(
 (c) => (c.student_profile?.certificates?.length || 0) > 0
 ).length;

 return (
 <AdminLayout
 header={
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <div className="p-2 rounded-2xl bg-govt-green-500/10 text-govt-green-500 border border-govt-green-200">
 <Award className="h-6 w-6" />
 </div>
 <div>
 <h2 className="text-xl font-bold leading-tight text-gray-800 ">
 Student Clearances & Certificate Issuance
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 Cross-departmental dues audit (Fee, Library, Workshop) and TEVTA credential issuance
 </p>
 </div>
 </div>

                    <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-govt-gold-50 text-amber-600 border border-govt-gold-200">
                            <span>{pendingCount} Audits Pending</span>
                        </span>
                        <Link
                            href={route('clerk.fees.reconciliation')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-govt-green-600 text-white hover:bg-govt-green-700 transition shadow-sm"
                        >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Bank Fee Desk</span>
                        </Link>
                    </div>
 </div>
 }
 >
 <Head title="Clearance & Certificates - GIIMS Admin" />

 <div className="space-y-6">
 {/* METRICS ROW */}
 <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
 <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center space-x-4">
 <div className="h-12 w-12 rounded-2xl bg-govt-cream-300 text-gray-600 flex items-center justify-center font-bold">
 <FileCheck className="h-6 w-6" />
 </div>
 <div>
 <p className="text-[10px] text-gray-500 font-bold uppercase">Clearance Requests</p>
 <p className="text-2xl font-black text-gray-900 ">{clearances.length}</p>
 </div>
 </div>

 <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center space-x-4">
 <div className="h-12 w-12 rounded-2xl bg-govt-gold-50 text-amber-600 flex items-center justify-center font-bold border border-govt-gold-200">
 <Clock className="h-6 w-6" />
 </div>
 <div>
 <p className="text-[10px] text-gray-500 font-bold uppercase">Pending Audits</p>
 <p className="text-2xl font-black text-amber-600 ">{pendingCount}</p>
 </div>
 </div>

 <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center space-x-4">
 <div className="h-12 w-12 rounded-2xl bg-govt-green-500/10 text-govt-green-500 flex items-center justify-center font-bold border border-govt-green-200">
 <CheckCircle2 className="h-6 w-6" />
 </div>
 <div>
 <p className="text-[10px] text-gray-500 font-bold uppercase">Fully Cleared</p>
 <p className="text-2xl font-black text-govt-green-500 ">{clearedCount}</p>
 </div>
 </div>

 <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center space-x-4">
 <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold border border-purple-200">
 <Award className="h-6 w-6" />
 </div>
 <div>
 <p className="text-[10px] text-gray-500 font-bold uppercase">Certificates Issued</p>
 <p className="text-2xl font-black text-purple-600 ">{certificatesCount}</p>
 </div>
 </div>
 </div>

 {/* FILTER TABS */}
 <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
 <div className="flex items-center space-x-2">
 <Filter className="h-4 w-4 text-gray-500" />
 <span className="text-xs font-bold text-gray-700 ">Filter Requests:</span>
 </div>

 <div className="flex items-center p-1 bg-govt-cream-300 rounded-2xl border border-gray-200 text-xs font-bold">
 <button
 type="button"
 onClick={() => setStatusFilter('all')}
 className={`px-3.5 py-1.5 rounded-xl transition ${
 statusFilter === 'all'
 ? 'bg-white text-gray-900 shadow-sm'
 : 'text-gray-500 hover:text-gray-900 :text-white'
 }`}
 >
 All ({clearances.length})
 </button>
 <button
 type="button"
 onClick={() => setStatusFilter('pending')}
 className={`px-3.5 py-1.5 rounded-xl transition ${
 statusFilter === 'pending'
 ? 'bg-white text-amber-600 shadow-sm'
 : 'text-gray-500 hover:text-gray-900 :text-white'
 }`}
 >
 Pending Audits ({pendingCount})
 </button>
 <button
 type="button"
 onClick={() => setStatusFilter('cleared')}
 className={`px-3.5 py-1.5 rounded-xl transition ${
 statusFilter === 'cleared'
 ? 'bg-white text-govt-green-500 shadow-sm'
 : 'text-gray-500 hover:text-gray-900 :text-white'
 }`}
 >
 Fully Cleared ({clearedCount})
 </button>
 </div>
 </div>

 {/* CLEARANCES DATA TABLE */}
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="text-gray-500 border-b border-gray-100 ">
 <th className="pb-3 font-semibold">Trainee Candidate</th>
 <th className="pb-3 font-semibold">Course & Batch</th>
 <th className="pb-3 font-semibold text-center">Accounts / Fee</th>
 <th className="pb-3 font-semibold text-center">Library Books</th>
 <th className="pb-3 font-semibold text-center">Workshop Tools</th>
 <th className="pb-3 font-semibold text-center">Audit Actions</th>
 <th className="pb-3 font-semibold text-center">Overall Status</th>
 <th className="pb-3 font-semibold text-right">Certificate Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
 {filteredClearances.map((c) => {
 const profile = c.student_profile;
 const user = profile?.user;
 const enrollment = c.enrollment;
 const course = enrollment?.course;
 const batch = enrollment?.batch;
 const cert = profile?.certificates?.[0];
 const curData = localStatuses[c.id] || {
 fee_status: c.fee_status,
 library_status: c.library_status,
 workshop_status: c.workshop_status,
 };

 return (
 <tr key={c.id} className="hover:bg-govt-green-50 :bg-white/50 transition">
 <td className="py-4">
 <p className="font-extrabold text-gray-900 text-sm">
 {user?.name || 'Candidate Student'}
 </p>
 <p className="text-[10px] text-gray-500">
 Roll: <span className="font-mono font-bold text-govt-green-500 ">{enrollment?.enrollment_number}</span>
 </p>
 </td>

 <td className="py-4">
 <p className="font-bold text-gray-900 ">{course?.name}</p>
 <p className="text-[10px] text-gray-500">{batch?.name} ({batch?.shift} Shift)</p>
 </td>

 {/* ACCOUNTS / FEE SELECTOR */}
 <td className="py-4 text-center">
 <select
 value={curData.fee_status}
 onChange={(e) => handleFieldChange(c.id, 'fee_status', e.target.value)}
 className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
 curData.fee_status === 'cleared'
 ? 'bg-govt-green-500/10 text-emerald-700 border-govt-green-200'
 : 'bg-govt-gold-50 text-amber-700 border-govt-gold-200'
 }`}
 >
 <option value="pending">Pending</option>
 <option value="cleared">Cleared</option>
 </select>
 </td>

 {/* LIBRARY SELECTOR */}
 <td className="py-4 text-center">
 <select
 value={curData.library_status}
 onChange={(e) => handleFieldChange(c.id, 'library_status', e.target.value)}
 className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
 curData.library_status === 'cleared'
 ? 'bg-govt-green-500/10 text-emerald-700 border-govt-green-200'
 : 'bg-govt-gold-50 text-amber-700 border-govt-gold-200'
 }`}
 >
 <option value="pending">Pending</option>
 <option value="cleared">Cleared</option>
 </select>
 </td>

 {/* WORKSHOP SELECTOR */}
 <td className="py-4 text-center">
 <select
 value={curData.workshop_status}
 onChange={(e) => handleFieldChange(c.id, 'workshop_status', e.target.value)}
 className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
 curData.workshop_status === 'cleared'
 ? 'bg-govt-green-500/10 text-emerald-700 border-govt-green-200'
 : 'bg-govt-gold-50 text-amber-700 border-govt-gold-200'
 }`}
 >
 <option value="pending">Pending</option>
 <option value="cleared">Cleared</option>
 </select>
 </td>

 {/* SAVE AUDIT BUTTON */}
 <td className="py-4 text-center">
 <button
 type="button"
 disabled={updatingId === c.id}
 onClick={() => handleSaveStatuses(c.id)}
 className="px-3 py-1 rounded-xl bg-white hover:bg-govt-green :bg-govt-green text-white font-bold text-[10px] transition shadow-sm inline-flex items-center space-x-1"
 >
 <Save className="h-3 w-3" />
 <span>{updatingId === c.id ? 'Saving...' : 'Save Dues'}</span>
 </button>
 </td>

 {/* OVERALL VERDICT */}
 <td className="py-4 text-center">
 <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
 c.overall_status === 'cleared'
 ? 'bg-govt-green-500/20 text-emerald-700 border border-govt-green-200'
 : 'bg-govt-gold-50 text-amber-700 border border-govt-gold-200'
 }`}>
 {c.overall_status}
 </span>
 </td>

 {/* CERTIFICATE ISSUANCE CTA */}
 <td className="py-4 text-right">
 {cert ? (
 <div className="text-right">
 <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-700 border border-purple-500/30">
 <Award className="h-3 w-3" />
 <span>{cert.certificate_number}</span>
 </span>
 <p className="text-[9px] text-gray-500 mt-0.5">Status: Graduated</p>
 </div>
 ) : (
 <button
 type="button"
 disabled={c.overall_status !== 'cleared' || issuingId === c.id}
 onClick={() => handleIssueCertificate(c.id, user?.name, course?.name)}
 className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-sm disabled:opacity-40 disabled:hover:bg-purple-600 inline-flex items-center space-x-1.5 ml-auto"
 >
 <Award className="h-3.5 w-3.5" />
 <span>{issuingId === c.id ? 'Generating...' : 'Issue Certificate'}</span>
 </button>
 )}
 </td>
 </tr>
 );
 })}

 {filteredClearances.length === 0 && (
 <tr>
 <td colSpan="8" className="text-center py-12 text-gray-500">
 <Inbox className="h-8 w-8 mx-auto mb-2 text-gray-500" />
 <p>No matching clearance requests found.</p>
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