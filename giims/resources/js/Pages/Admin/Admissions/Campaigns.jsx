import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import {
 Megaphone,
 Calendar,
 PlusCircle,
 CheckCircle2,
 XCircle,
 Clock,
 FileText,
 Sparkles,
 AlertCircle,
 Building2,
 Users
} from 'lucide-react';

export default function Campaigns({ campaigns = [] }) {
 const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
 name: '',
 start_date: '',
 end_date: '',
 is_active: true,
 });

 const handleSubmit = (e) => {
 e.preventDefault();
 post(route('admin.campaigns.store'), {
 onSuccess: () => {
 reset('name', 'start_date', 'end_date');
 },
 });
 };

 const activeCampaignsCount = campaigns.filter((c) => c.is_active).length;
 const totalApplicationsCount = campaigns.reduce((acc, c) => acc + (c.applications_count || 0), 0);

 return (
 <AdminLayout
 header={
 <div>
 <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Admission Campaigns Management</h1>
 <p className="text-xs text-gray-500">Configure enrollment cycles, intake schedules, and applicant pipelines</p>
 </div>
 }
 >
 <Head title="Admission Campaigns - GIIMS" />

 <div className="space-y-6">
 {/* Stats Header */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-lg flex items-center space-x-4">
 <div className="h-12 w-12 rounded-xl bg-govt-green-500/10 text-govt-green-500 flex items-center justify-center border border-govt-green-200">
 <Megaphone className="h-6 w-6" />
 </div>
 <div>
 <p className="text-xs text-gray-500 font-medium">Total Campaigns</p>
 <h3 className="text-2xl font-bold text-gray-900">{campaigns.length}</h3>
 <p className="text-[11px] text-gray-500">{activeCampaignsCount} Active Intake(s)</p>
 </div>
 </div>

 <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-lg flex items-center space-x-4">
 <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
 <Calendar className="h-6 w-6" />
 </div>
 <div>
 <p className="text-xs text-gray-500 font-medium">Active Session</p>
 <h3 className="text-2xl font-bold text-gray-900">2026 - 2027</h3>
 <p className="text-[11px] text-gray-500">GTTI Rahim Yar Khan</p>
 </div>
 </div>

 <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-lg flex items-center space-x-4">
 <div className="h-12 w-12 rounded-xl bg-govt-gold-50 text-govt-gold-600 flex items-center justify-center border border-govt-gold-200">
 <FileText className="h-6 w-6" />
 </div>
 <div>
 <p className="text-xs text-gray-500 font-medium">Total Applicants</p>
 <h3 className="text-2xl font-bold text-gray-900">{totalApplicationsCount}</h3>
 <p className="text-[11px] text-gray-500">Across all active campaigns</p>
 </div>
 </div>
 </div>

 {/* Top: Create Campaign Form Card */}
 <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-govt-lg">
 <div className="flex items-center space-x-3 pb-4 mb-5 border-b border-gray-200">
 <div className="h-9 w-9 rounded-xl bg-govt-green-500/10 text-govt-green-500 border border-govt-green-200 flex items-center justify-center">
 <PlusCircle className="h-5 w-5" />
 </div>
 <div>
 <h2 className="text-base font-bold text-gray-900">Launch New Admission Campaign</h2>
 <p className="text-xs text-gray-500">Open a new admission intake cycle for incoming students</p>
 </div>
 </div>

 {recentlySuccessful && (
 <div className="mb-5 p-3.5 rounded-xl bg-govt-green-500/10 border border-govt-green-200 text-govt-green-500 text-xs font-semibold flex items-center space-x-2">
 <CheckCircle2 className="h-4 w-4 shrink-0" />
 <span>Admission campaign has been successfully launched and recorded.</span>
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {/* Campaign Name */}
 <div className="md:col-span-3">
 <label className="block text-xs font-semibold text-gray-600 mb-1.5">
 Campaign Name <span className="text-rose-600">*</span>
 </label>
 <input
 type="text"
 placeholder="e.g., Fall 2026 Admissions (G-II & CBT&A)"
 value={data.name}
 onChange={(e) => setData('name', e.target.value)}
 className={`w-full px-3.5 py-2.5 bg-govt-cream-300 border rounded-xl text-xs text-gray-900 placeholder-slate-500 focus:outline-none focus:ring-2 ${
 errors.name
 ? 'border-rose-500 focus:ring-rose-500/40'
 : 'border-gray-200 focus:ring-govt-green-400/40'
 }`}
 />
 {errors.name && (
 <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>
 )}
 </div>

 {/* Start Date */}
 <div>
 <label className="block text-xs font-semibold text-gray-600 mb-1.5">
 Start Date <span className="text-rose-600">*</span>
 </label>
 <input
 type="date"
 value={data.start_date}
 onChange={(e) => setData('start_date', e.target.value)}
 className={`w-full px-3.5 py-2.5 bg-govt-cream-300 border rounded-xl text-xs text-gray-900 placeholder-slate-500 focus:outline-none focus:ring-2 ${
 errors.start_date
 ? 'border-rose-500 focus:ring-rose-500/40'
 : 'border-gray-200 focus:ring-govt-green-400/40'
 }`}
 />
 {errors.start_date && (
 <p className="text-[11px] text-rose-600 mt-1">{errors.start_date}</p>
 )}
 </div>

 {/* End Date */}
 <div>
 <label className="block text-xs font-semibold text-gray-600 mb-1.5">
 End Date (Closing Date) <span className="text-rose-600">*</span>
 </label>
 <input
 type="date"
 value={data.end_date}
 onChange={(e) => setData('end_date', e.target.value)}
 className={`w-full px-3.5 py-2.5 bg-govt-cream-300 border rounded-xl text-xs text-gray-900 placeholder-slate-500 focus:outline-none focus:ring-2 ${
 errors.end_date
 ? 'border-rose-500 focus:ring-rose-500/40'
 : 'border-gray-200 focus:ring-govt-green-400/40'
 }`}
 />
 {errors.end_date && (
 <p className="text-[11px] text-rose-600 mt-1">{errors.end_date}</p>
 )}
 </div>

 {/* Is Active Toggle */}
 <div className="flex items-center pt-2 md:pt-6">
 <label className="relative flex items-center cursor-pointer select-none">
 <input
 type="checkbox"
 checked={data.is_active}
 onChange={(e) => setData('is_active', e.target.checked)}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-govt-cream-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-govt-green"></div>
 <span className="ml-3 text-xs font-semibold text-gray-600">
 Mark as Active Campaign
 </span>
 </label>
 </div>
 </div>

 <div className="flex justify-end pt-3">
 <button
 type="submit"
 disabled={processing}
 className="px-5 py-2.5 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white text-xs font-bold tracking-wide transition shadow-lg shadow-emerald-950/40 disabled:opacity-50 flex items-center space-x-2"
 >
 <PlusCircle className="h-4 w-4" />
 <span>{processing ? 'Creating Campaign...' : 'Create Campaign'}</span>
 </button>
 </div>
 </form>
 </div>

 {/* Bottom: Existing Campaigns Data Table */}
 <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-govt-lg">
 <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
 <div className="flex items-center space-x-3">
 <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
 <Megaphone className="h-5 w-5" />
 </div>
 <div>
 <h2 className="text-base font-bold text-gray-900">Existing Admission Campaigns</h2>
 <p className="text-xs text-gray-500">All registered admission cycles and their application status</p>
 </div>
 </div>
 <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-govt-cream-300 text-gray-600 border border-gray-200">
 {campaigns.length} Total
 </span>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="text-gray-500 border-b border-gray-200">
 <th className="pb-3 font-semibold">Campaign Name</th>
 <th className="pb-3 font-semibold">Institute</th>
 <th className="pb-3 font-semibold">Timeline (Start - End)</th>
 <th className="pb-3 font-semibold">Applications</th>
 <th className="pb-3 font-semibold">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100/60 text-gray-600 font-medium">
 {campaigns.map((campaign) => (
 <tr key={campaign.id} className="hover:bg-govt-cream-300/40 transition">
 <td className="py-3.5 font-bold text-gray-900 flex items-center space-x-2.5">
 <div className="h-8 w-8 rounded-lg bg-govt-cream-300 border border-gray-200 flex items-center justify-center text-govt-green-500 shrink-0">
 <Megaphone className="h-4 w-4" />
 </div>
 <span>{campaign.name}</span>
 </td>
 <td className="py-3.5 text-gray-600">
 {campaign.institute?.name || 'GTTI Rahim Yar Khan'}
 </td>
 <td className="py-3.5 font-mono text-[11px] text-gray-600">
 {campaign.start_date} <span className="text-gray-500">→</span> {campaign.end_date}
 </td>
 <td className="py-3.5">
 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-300 border border-blue-200">
 {campaign.applications_count || 0} Applicants
 </span>
 </td>
 <td className="py-3.5">
 {campaign.is_active ? (
 <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-govt-green-500/10 text-govt-green-500 border border-govt-green-200">
 <span className="h-1.5 w-1.5 rounded-full bg-govt-green-400 animate-pulse"></span>
 <span>Active</span>
 </span>
 ) : (
 <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-govt-cream-300 text-gray-500 border border-gray-200">
 <span>Inactive</span>
 </span>
 )}
 </td>
 </tr>
 ))}

 {campaigns.length === 0 && (
 <tr>
 <td colSpan="5" className="py-8 text-center text-gray-500 text-xs">
 No admission campaigns found. Use the form above to launch a new campaign.
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
