import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
 ShieldAlert,
 AlertTriangle,
 CheckCircle2,
 Clock,
 PlusCircle,
 User,
 Search,
 Filter,
 FileText,
 Check,
 Inbox,
 Scale,
 AlertCircle,
 GraduationCap,
 Send
} from 'lucide-react';

export default function Index({ records = [], students = [] }) {
 const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'open' | 'resolved' | 'critical'
 const [searchQuery, setSearchQuery] = useState('');
 const [actionInputs, setActionInputs] = useState({});
 const [resolvingId, setResolvingId] = useState(null);

 // New Incident Form
 const {
 data: form,
 setData: setForm,
 post: postIncident,
 processing: submitting,
 errors,
 reset: resetForm,
 recentlySuccessful: incidentLogged,
 } = useForm({
 student_profile_id: students[0]?.id || '',
 title: '',
 description: '',
 severity: 'minor',
 });

 const handleCreateIncident = (e) => {
 e.preventDefault();
 postIncident(route('admin.discipline.store'), {
 onSuccess: () => resetForm('title', 'description', 'severity'),
 });
 };

 const handleActionChange = (id, value) => {
 setActionInputs((prev) => ({
 ...prev,
 [id]: value,
 }));
 };

 const handleResolve = (id) => {
 const actionTaken = actionInputs[id]?.trim();
 if (!actionTaken) {
 alert('Please specify the action taken before marking this incident as resolved.');
 return;
 }

 setResolvingId(id);
 router.patch(
 route('admin.discipline.resolve', { id }),
 { action_taken: actionTaken },
 {
 preserveScroll: true,
 onFinish: () => setResolvingId(null),
 }
 );
 };

 // Filter records
 const filteredRecords = records.filter((r) => {
 const studentName = r.student_profile?.user?.name || '';
 const reporterName = r.reporter?.name || '';
 const title = r.title || '';

 const matchesSearch =
 studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 title.toLowerCase().includes(searchQuery.toLowerCase());

 if (!matchesSearch) return false;

 if (statusFilter === 'open') return r.status === 'open';
 if (statusFilter === 'resolved') return r.status === 'resolved';
 if (statusFilter === 'critical') return r.severity === 'critical';

 return true;
 });

 const openCount = records.filter((r) => r.status === 'open').length;
 const resolvedCount = records.filter((r) => r.status === 'resolved').length;
 const criticalCount = records.filter((r) => r.severity === 'critical').length;

 const getSeverityBadge = (severity) => {
 switch (severity) {
 case 'minor':
 return (
 <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-govt-gold-50 text-amber-700 border border-govt-gold-200">
 <AlertCircle className="h-2.5 w-2.5" />
 <span>Minor</span>
 </span>
 );
 case 'major':
 return (
 <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/15 text-orange-700 border border-orange-500/30">
 <AlertTriangle className="h-2.5 w-2.5" />
 <span>Major</span>
 </span>
 );
 case 'critical':
 return (
 <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-700 border border-rose-200">
 <ShieldAlert className="h-2.5 w-2.5" />
 <span>Critical</span>
 </span>
 );
 default:
 return (
 <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-govt-cream-300 text-gray-600 ">
 {severity}
 </span>
 );
 }
 };

 return (
 <AdminLayout
 header={
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <div className="p-2 rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-500/20">
 <Scale className="h-6 w-6" />
 </div>
 <div>
 <h2 className="text-xl font-bold leading-tight text-gray-800 ">
 Student Discipline & Incident Management
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 Log behavioral infractions, workshop safety violations, and formal administrative actions
 </p>
 </div>
 </div>

 {openCount > 0 && (
 <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
 <AlertTriangle className="h-3.5 w-3.5" />
 <span>{openCount} Open Incidents</span>
 </span>
 )}
 </div>
 }
 >
 <Head title="Discipline & Incidents - GIIMS Admin" />

 <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
 {/* TOP METRICS ROW */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
 <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
 <div className="flex items-center justify-between">
 <span className="text-[10px] text-gray-500 font-bold uppercase">Total Incidents</span>
 <FileText className="h-4 w-4 text-indigo-500" />
 </div>
 <p className="text-2xl font-black text-gray-900 mt-2">{records.length}</p>
 </div>

 <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
 <div className="flex items-center justify-between">
 <span className="text-[10px] text-gray-500 font-bold uppercase">Open Cases</span>
 <Clock className="h-4 w-4 text-govt-gold" />
 </div>
 <p className="text-2xl font-black text-amber-600 mt-2">{openCount}</p>
 </div>

 <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
 <div className="flex items-center justify-between">
 <span className="text-[10px] text-gray-500 font-bold uppercase">Critical Violations</span>
 <ShieldAlert className="h-4 w-4 text-rose-500" />
 </div>
 <p className={`text-2xl font-black mt-2 ${criticalCount > 0 ? 'text-rose-600 ' : 'text-gray-500'}`}>
 {criticalCount}
 </p>
 </div>

 <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
 <div className="flex items-center justify-between">
 <span className="text-[10px] text-gray-500 font-bold uppercase">Resolved Incidents</span>
 <CheckCircle2 className="h-4 w-4 text-govt-green-500" />
 </div>
 <p className="text-2xl font-black text-govt-green-500 mt-2">{resolvedCount}</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 {/* LEFT SECTION (4 Cols): LOG NEW INCIDENT FORM */}
 <div className="lg:col-span-4 space-y-6">
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
 <div className="flex items-center space-x-2.5 pb-3 border-b border-gray-100 ">
 <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
 <PlusCircle className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-gray-900 ">
 Log New Incident
 </h3>
 <p className="text-[11px] text-gray-500 ">
 Report disciplinary infraction against trainee
 </p>
 </div>
 </div>

 {incidentLogged && (
 <div className="p-3 rounded-xl bg-govt-green-500/10 border border-govt-green-200 text-govt-green-500 text-xs font-semibold flex items-center space-x-2">
 <CheckCircle2 className="h-4 w-4 shrink-0" />
 <span>Incident logged and queued for disciplinary review!</span>
 </div>
 )}

 <form onSubmit={handleCreateIncident} className="space-y-4 text-xs">
 {/* Student Selection */}
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Select Trainee Candidate <span className="text-rose-500">*</span>
 </label>
 <select
 value={form.student_profile_id}
 onChange={(e) => setForm('student_profile_id', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-gray-900 "
 >
 {students.map((st) => {
 const enrollment = st.enrollments?.[0];
 const courseName = enrollment?.course?.name || 'General';
 const roll = enrollment?.enrollment_number ? ` (${enrollment.enrollment_number})` : '';

 return (
 <option key={st.id} value={st.id}>
 {st.user?.name}{roll} — {courseName}
 </option>
 );
 })}
 </select>
 {errors.student_profile_id && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.student_profile_id}</p>
 )}
 </div>

 {/* Title */}
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Incident Title <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 placeholder="e.g. Workshop Safety Violation / Uniform Non-compliance"
 value={form.title}
 onChange={(e) => setForm('title', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-gray-900 "
 />
 {errors.title && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>
 )}
 </div>

 {/* Severity */}
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Severity Level <span className="text-rose-500">*</span>
 </label>
 <select
 value={form.severity}
 onChange={(e) => setForm('severity', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-gray-900 "
 >
 <option value="minor">Minor (Attendance, dress code, minor disturbance)</option>
 <option value="major">Major (Equipment mishandling, insubordination, fighting)</option>
 <option value="critical">Critical (Vandalism, severe safety hazard, theft, harassment)</option>
 </select>
 {errors.severity && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.severity}</p>
 )}
 </div>

 {/* Description */}
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Incident Description & Location Details <span className="text-rose-500">*</span>
 </label>
 <textarea
 rows={3}
 placeholder="Describe the incident, workshop location, witnesses, or tools involved..."
 value={form.description}
 onChange={(e) => setForm('description', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-gray-900 "
 />
 {errors.description && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.description}</p>
 )}
 </div>

 <button
 type="submit"
 disabled={submitting || students.length === 0}
 className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md shadow-rose-950/30 disabled:opacity-50 flex items-center justify-center space-x-2"
 >
 <ShieldAlert className="h-4 w-4" />
 <span>{submitting ? 'Logging Incident...' : 'Log Disciplinary Record'}</span>
 </button>
 </form>
 </div>
 </div>

 {/* RIGHT SECTION (8 Cols): INCIDENT RECORDS TABLE & RESOLUTION WORKFLOW */}
 <div className="lg:col-span-8 space-y-4">
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
 {/* SEARCH & FILTERS */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 ">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
 <input
 type="text"
 placeholder="Search by student name, title, or reporter..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-9 pr-4 py-2 bg-govt-cream border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-gray-900 "
 />
 </div>

 <div className="flex items-center p-1 bg-govt-cream-300 rounded-2xl border border-gray-200 text-xs font-bold shrink-0">
 <button
 type="button"
 onClick={() => setStatusFilter('all')}
 className={`px-3 py-1.5 rounded-xl transition ${
 statusFilter === 'all'
 ? 'bg-white text-gray-900 shadow-sm'
 : 'text-gray-500 hover:text-gray-900 :text-white'
 }`}
 >
 All ({records.length})
 </button>
 <button
 type="button"
 onClick={() => setStatusFilter('open')}
 className={`px-3 py-1.5 rounded-xl transition ${
 statusFilter === 'open'
 ? 'bg-white text-amber-600 shadow-sm'
 : 'text-gray-500 hover:text-gray-900 :text-white'
 }`}
 >
 Open ({openCount})
 </button>
 <button
 type="button"
 onClick={() => setStatusFilter('resolved')}
 className={`px-3 py-1.5 rounded-xl transition ${
 statusFilter === 'resolved'
 ? 'bg-white text-govt-green-500 shadow-sm'
 : 'text-gray-500 hover:text-gray-900 :text-white'
 }`}
 >
 Resolved ({resolvedCount})
 </button>
 <button
 type="button"
 onClick={() => setStatusFilter('critical')}
 className={`px-3 py-1.5 rounded-xl transition ${
 statusFilter === 'critical'
 ? 'bg-white text-rose-600 shadow-sm'
 : 'text-gray-500 hover:text-gray-900 :text-white'
 }`}
 >
 Critical ({criticalCount})
 </button>
 </div>
 </div>

 {/* INCIDENTS TABLE */}
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="text-gray-500 border-b border-gray-100 ">
 <th className="pb-3 font-semibold">Trainee Candidate</th>
 <th className="pb-3 font-semibold">Incident Details</th>
 <th className="pb-3 font-semibold text-center">Severity</th>
 <th className="pb-3 font-semibold text-center">Status</th>
 <th className="pb-3 font-semibold text-right">Disciplinary Action & Resolution</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
 {filteredRecords.map((r) => {
 const profile = r.student_profile;
 const studentUser = profile?.user;
 const enrollment = profile?.enrollments?.[0];
 const reporter = r.reporter;
 const isOpen = r.status === 'open';

 return (
 <tr key={r.id} className="hover:bg-govt-green-50 :bg-white/50 transition">
 {/* Trainee Details */}
 <td className="py-4 align-top w-1/5">
 <p className="font-extrabold text-gray-900 text-sm">
 {studentUser?.name || 'Trainee Student'}
 </p>
 {enrollment?.enrollment_number && (
 <p className="text-[10px] font-mono text-govt-green-500 font-bold">
 {enrollment.enrollment_number}
 </p>
 )}
 <p className="text-[10px] text-gray-500 mt-0.5">
 {enrollment?.course?.name || 'Vocational Trade'}
 </p>
 </td>

 {/* Incident Content */}
 <td className="py-4 align-top max-w-xs">
 <p className="font-extrabold text-gray-900 ">
 {r.title}
 </p>
 <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
 {r.description}
 </p>
 <div className="flex items-center space-x-2 text-[10px] text-gray-500 mt-2">
 <span>By: {reporter?.name || 'Instructor'}</span>
 <span>•</span>
 <span>{new Date(r.created_at).toLocaleDateString()}</span>
 </div>
 </td>

 {/* Severity */}
 <td className="py-4 align-top text-center">
 {getSeverityBadge(r.severity)}
 </td>

 {/* Status */}
 <td className="py-4 align-top text-center">
 <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
 isOpen
 ? 'bg-govt-gold-50 text-amber-700 border border-govt-gold-200'
 : 'bg-govt-green-500/15 text-emerald-700 border border-govt-green-200'
 }`}>
 {r.status}
 </span>
 </td>

 {/* Resolution & Actions */}
 <td className="py-4 align-top text-right">
 {isOpen ? (
 <div className="flex flex-col items-end space-y-1.5 max-w-xs ml-auto">
 <input
 type="text"
 placeholder="e.g. Verbal warning, parents summoned..."
 value={actionInputs[r.id] ?? ''}
 onChange={(e) => handleActionChange(r.id, e.target.value)}
 className="w-full px-2.5 py-1.5 bg-govt-cream border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-govt-green-400 text-gray-900 "
 />
 <button
 type="button"
 disabled={resolvingId === r.id}
 onClick={() => handleResolve(r.id)}
 className="px-3 py-1.5 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white font-bold text-xs transition shadow-sm inline-flex items-center space-x-1 disabled:opacity-50"
 >
 <Check className="h-3.5 w-3.5" />
 <span>{resolvingId === r.id ? 'Resolving...' : 'Resolve Case'}</span>
 </button>
 </div>
 ) : (
 <div className="text-right space-y-1 max-w-xs ml-auto">
 <div className="inline-flex items-center space-x-1 text-govt-green-500 font-bold text-xs">
 <CheckCircle2 className="h-3.5 w-3.5" />
 <span>Action Recorded</span>
 </div>
 <p className="text-[11px] text-gray-600 italic">
 "{r.action_taken}"
 </p>
 </div>
 )}
 </td>
 </tr>
 );
 })}

 {filteredRecords.length === 0 && (
 <tr>
 <td colSpan="5" className="text-center py-12 text-gray-500">
 <Inbox className="h-8 w-8 mx-auto mb-2 text-gray-500" />
 <p>No disciplinary incident reports found.</p>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </div>
 </div>
 </AdminLayout>
 );
}