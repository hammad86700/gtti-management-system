import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import {
 Megaphone,
 Send,
 Users,
 GraduationCap,
 BookOpen,
 Shield,
 Clock,
 Calendar,
 CheckCircle2,
 Search,
 Filter,
 Inbox,
 AlertCircle,
 BellRing,
 Sparkles
} from 'lucide-react';

export default function Index({ announcements = [] }) {
 const [searchQuery, setSearchQuery] = useState('');
 const [audienceFilter, setAudienceFilter] = useState('all_filter'); // 'all_filter' | 'all' | 'students' | 'teachers' | 'staff'

 const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
 title: '',
 message: '',
 target_audience: 'all',
 expires_at: '',
 });

 const handlePublish = (e) => {
 e.preventDefault();
 post(route('admin.announcements.store'), {
 onSuccess: () => reset('title', 'message', 'expires_at'),
 });
 };

 const isExpired = (expiresAt) => {
 if (!expiresAt) return false;
 const expiry = new Date(expiresAt);
 expiry.setHours(23, 59, 59, 999);
 return expiry < new Date();
 };

 const filteredAnnouncements = announcements.filter((a) => {
 const matchesSearch =
 a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
 a.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
 (a.creator?.name && a.creator.name.toLowerCase().includes(searchQuery.toLowerCase()));

 if (!matchesSearch) return false;

 if (audienceFilter === 'all_filter') return true;
 return a.target_audience === audienceFilter;
 });

 const getAudienceBadge = (target) => {
 switch (target) {
 case 'all':
 return (
 <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-govt-green-500/15 text-emerald-700 border border-govt-green-200">
 <Users className="h-2.5 w-2.5" />
 <span>All Portals</span>
 </span>
 );
 case 'students':
 return (
 <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-700 border border-blue-500/30">
 <GraduationCap className="h-2.5 w-2.5" />
 <span>Students Only</span>
 </span>
 );
 case 'teachers':
 return (
 <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-700 border border-purple-500/30">
 <BookOpen className="h-2.5 w-2.5" />
 <span>Faculty & Teachers</span>
 </span>
 );
 case 'staff':
 return (
 <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-govt-gold-50 text-amber-700 border border-govt-gold-200">
 <Shield className="h-2.5 w-2.5" />
 <span>Staff & Admin</span>
 </span>
 );
 default:
 return (
 <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-govt-cream-300 text-gray-600 ">
 {target}
 </span>
 );
 }
 };

 const activeCount = announcements.filter((a) => !isExpired(a.expires_at)).length;

 return (
 <AdminLayout
 header={
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <div className="p-2 rounded-2xl bg-govt-gold-50 text-amber-600 border border-govt-gold-200">
 <Megaphone className="h-6 w-6" />
 </div>
 <div>
 <h2 className="text-xl font-bold leading-tight text-gray-800 ">
 Institutional Broadcast Announcements
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 Broadcast official circulars, exam notices, and alerts across Student, Teacher, and Staff dashboards
 </p>
 </div>
 </div>

 <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-govt-green-500/10 text-govt-green-500 border border-govt-green-200">
 <BellRing className="h-3.5 w-3.5" />
 <span>{activeCount} Active Broadcasts</span>
 </span>
 </div>
 }
 >
 <Head title="System Announcements - GIIMS Admin" />

 <div className="space-y-6">
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 {/* LEFT (5 Cols): PUBLISH ANNOUNCEMENT FORM */}
 <div className="lg:col-span-5 space-y-6">
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
 <div className="flex items-center space-x-2.5 pb-3 border-b border-gray-100 ">
 <div className="h-8 w-8 rounded-xl bg-govt-gold-50 text-amber-600 flex items-center justify-center">
 <Megaphone className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-gray-900 ">
 Broadcast New Announcement
 </h3>
 <p className="text-[11px] text-gray-500 ">
 Push notices to targeted institutional portals
 </p>
 </div>
 </div>

 {recentlySuccessful && (
 <div className="p-3.5 rounded-2xl bg-govt-green-500/10 border border-govt-green-200 text-govt-green-500 text-xs font-semibold flex items-center space-x-2">
 <CheckCircle2 className="h-4 w-4 shrink-0" />
 <span>Announcement broadcasted successfully to all selected portals!</span>
 </div>
 )}

 <form onSubmit={handlePublish} className="space-y-4 text-xs">
 {/* Title */}
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Announcement Title <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 placeholder="e.g. Midterm PBTE Practical Exam Schedule / Eid Holidays"
 value={data.title}
 onChange={(e) => setData('title', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-gray-900 "
 />
 {errors.title && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>
 )}
 </div>

 {/* Target Audience */}
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Target Audience <span className="text-rose-500">*</span>
 </label>
 <select
 value={data.target_audience}
 onChange={(e) => setData('target_audience', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-gray-900 "
 >
 <option value="all">Everyone (All Students, Teachers, Staff)</option>
 <option value="students">Students Only (Applicant & Trainee Portals)</option>
 <option value="teachers">Instructors & Faculty Only (Teacher Portal)</option>
 <option value="staff">Administrative Staff Only</option>
 </select>
 {errors.target_audience && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.target_audience}</p>
 )}
 </div>

 {/* Expiration Date */}
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Expiration Date <span className="text-gray-500 font-normal">(Optional - auto expires after date)</span>
 </label>
 <input
 type="date"
 value={data.expires_at}
 onChange={(e) => setData('expires_at', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium text-gray-900 "
 />
 {errors.expires_at && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.expires_at}</p>
 )}
 </div>

 {/* Message */}
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Broadcast Message / Circular Details <span className="text-rose-500">*</span>
 </label>
 <textarea
 rows={4}
 placeholder="Type the official message, instructions, deadlines, or policy updates..."
 value={data.message}
 onChange={(e) => setData('message', e.target.value)}
 className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-gray-900 leading-relaxed"
 />
 {errors.message && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.message}</p>
 )}
 </div>

 <button
 type="submit"
 disabled={processing}
 className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-govt-gold text-white font-extrabold transition shadow-md shadow-amber-950/20 disabled:opacity-50 flex items-center justify-center space-x-2"
 >
 <Send className="h-4 w-4" />
 <span>{processing ? 'Publishing...' : 'Publish Announcement'}</span>
 </button>
 </form>
 </div>
 </div>

 {/* RIGHT (7 Cols): ANNOUNCEMENT HISTORY & FEED */}
 <div className="lg:col-span-7 space-y-4">
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
 {/* SEARCH & AUDIENCE FILTERS */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 ">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
 <input
 type="text"
 placeholder="Search by title or announcement content..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-9 pr-4 py-2 bg-govt-cream border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-gray-900 "
 />
 </div>

 <div className="flex items-center p-1 bg-govt-cream-300 rounded-2xl border border-gray-200 text-xs font-bold shrink-0">
 <button
 type="button"
 onClick={() => setAudienceFilter('all_filter')}
 className={`px-3 py-1.5 rounded-xl transition ${
 audienceFilter === 'all_filter'
 ? 'bg-white text-gray-900 shadow-sm'
 : 'text-gray-500 hover:text-gray-900 :text-white'
 }`}
 >
 All ({announcements.length})
 </button>
 <button
 type="button"
 onClick={() => setAudienceFilter('students')}
 className={`px-3 py-1.5 rounded-xl transition ${
 audienceFilter === 'students'
 ? 'bg-white text-blue-600 shadow-sm'
 : 'text-gray-500 hover:text-gray-900 :text-white'
 }`}
 >
 Students
 </button>
 <button
 type="button"
 onClick={() => setAudienceFilter('teachers')}
 className={`px-3 py-1.5 rounded-xl transition ${
 audienceFilter === 'teachers'
 ? 'bg-white text-purple-600 shadow-sm'
 : 'text-gray-500 hover:text-gray-900 :text-white'
 }`}
 >
 Teachers
 </button>
 </div>
 </div>

 {/* ANNOUNCEMENTS LIST */}
 <div className="space-y-3">
 {filteredAnnouncements.map((announcement) => {
 const expired = isExpired(announcement.expires_at);

 return (
 <div
 key={announcement.id}
 className={`p-4 rounded-2xl border transition space-y-2 ${
 expired
 ? 'bg-govt-cream/70 border-gray-200 opacity-70'
 : 'bg-white border-gray-200 hover:border-amber-500/40 shadow-sm'
 }`}
 >
 <div className="flex items-start justify-between gap-3">
 <div className="space-y-1">
 <div className="flex items-center space-x-2">
 {getAudienceBadge(announcement.target_audience)}
 {expired ? (
 <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-200 text-gray-600 ">
 Expired
 </span>
 ) : (
 <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-govt-green-500/15 text-emerald-700 ">
 <span className="h-1.5 w-1.5 rounded-full bg-govt-green-500 animate-pulse"></span>
 <span>Live</span>
 </span>
 )}
 </div>
 <h4 className="font-extrabold text-sm text-gray-900 ">
 {announcement.title}
 </h4>
 </div>

 <span className="text-[10px] text-gray-500 font-medium shrink-0">
 {new Date(announcement.created_at).toLocaleDateString()}
 </span>
 </div>

 <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
 {announcement.message}
 </p>

 <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
 <span>Posted by: <strong className="text-gray-700 ">{announcement.creator?.name || 'Administrator'}</strong></span>
 {announcement.expires_at && (
 <span>Expires: {announcement.expires_at}</span>
 )}
 </div>
 </div>
 );
 })}

 {filteredAnnouncements.length === 0 && (
 <div className="text-center py-12 text-gray-500">
 <Inbox className="h-8 w-8 mx-auto mb-2 text-gray-500" />
 <p>No broadcast announcements found.</p>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 </AdminLayout>
 );
}