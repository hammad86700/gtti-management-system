import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
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
    Sparkles,
    Trash2,
    Eye,
    Radio,
    FileText
} from 'lucide-react';

export default function Index({ announcements = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [audienceFilter, setAudienceFilter] = useState('all_filter'); // 'all_filter' | 'live' | 'students' | 'teachers' | 'staff' | 'expired'
    const [deletingId, setDeletingId] = useState(null);

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

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to revoke and delete this broadcast announcement?')) {
            setDeletingId(id);
            router.delete(route('admin.announcements.destroy', id), {
                preserveScroll: true,
                onFinish: () => setDeletingId(null),
            });
        }
    };

    const isExpired = (expiresAt) => {
        if (!expiresAt) return false;
        const expiry = new Date(expiresAt);
        expiry.setHours(23, 59, 59, 999);
        return expiry < new Date();
    };

    const activeCount = announcements.filter((a) => !isExpired(a.expires_at)).length;
    const studentCount = announcements.filter((a) => a.target_audience === 'all' || a.target_audience === 'students').length;
    const facultyCount = announcements.filter((a) => a.target_audience === 'all' || a.target_audience === 'teachers').length;

    const filteredAnnouncements = announcements.filter((a) => {
        const matchesSearch =
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (a.creator?.name && a.creator.name.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;

        const expired = isExpired(a.expires_at);

        if (audienceFilter === 'all_filter') return true;
        if (audienceFilter === 'live') return !expired;
        if (audienceFilter === 'expired') return expired;
        return a.target_audience === audienceFilter;
    });

    const getAudienceBadge = (target) => {
        switch (target) {
            case 'all':
                return (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Users className="h-2.5 w-2.5" />
                        <span>All Portals</span>
                    </span>
                );
            case 'students':
                return (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                        <GraduationCap className="h-2.5 w-2.5" />
                        <span>Students Only</span>
                    </span>
                );
            case 'teachers':
                return (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                        <BookOpen className="h-2.5 w-2.5" />
                        <span>Faculty & Teachers</span>
                    </span>
                );
            case 'staff':
                return (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                        <Shield className="h-2.5 w-2.5" />
                        <span>Staff & Admin</span>
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        {target}
                    </span>
                );
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-2xl bg-[#0B3B24] text-white shadow-md shadow-emerald-950/20">
                            <Megaphone className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    Campus Broadcasts & Circulars
                                </h1>
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                    <span>Live Hub</span>
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Official institutional broadcast engine • Dispatches circulars, exam directives, and announcements across all portals
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-[#0B3B24] border border-emerald-200 shadow-xs">
                            <BellRing className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{activeCount} Active Broadcasts</span>
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Campus Broadcasts & Circulars - GIIMS Executive Command" />

            <div className="space-y-6">
                {/* 1. HIGH-DENSITY KPI METRIC RIBBON */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Broadcasts</p>
                            <p className="text-2xl font-black text-slate-900 mt-0.5">{announcements.length}</p>
                            <p className="text-[11px] text-slate-500">Historical publications</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                            <FileText className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active & Live</p>
                            <p className="text-2xl font-black text-emerald-700 mt-0.5">{activeCount}</p>
                            <p className="text-[11px] text-emerald-600 font-medium">Currently visible on portals</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                            <Radio className="h-5 w-5 animate-pulse" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Student Reach</p>
                            <p className="text-2xl font-black text-blue-700 mt-0.5">{studentCount}</p>
                            <p className="text-[11px] text-blue-600 font-medium">Trainee circulars published</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Faculty Reach</p>
                            <p className="text-2xl font-black text-purple-700 mt-0.5">{facultyCount}</p>
                            <p className="text-[11px] text-purple-600 font-medium">Instructional directives</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                            <BookOpen className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                {/* 2. MAIN SPLIT: PUBLISH DESK (5 COLS) & BROADCAST FEED (7 COLS) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* LEFT (5 Cols): PUBLISH BROADCAST FORM */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5">
                            <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
                                <div className="h-9 w-9 rounded-xl bg-[#0B3B24] text-white flex items-center justify-center shrink-0">
                                    <Megaphone className="h-4.5 w-4.5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Broadcast New Announcement
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Instantly dispatch official notices to targeted portals
                                    </p>
                                </div>
                            </div>

                            {recentlySuccessful && (
                                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2.5">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                    <span>Announcement published and broadcast successfully across portals!</span>
                                </div>
                            )}

                            <form onSubmit={handlePublish} className="space-y-4 text-xs">
                                {/* Title */}
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Announcement Title <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Midterm PBTE Practical Exam Schedule / Eid Holidays"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:bg-white text-slate-900 transition"
                                        required
                                    />
                                    {errors.title && (
                                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.title}</p>
                                    )}
                                </div>

                                {/* Target Audience */}
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Target Audience <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.target_audience}
                                        onChange={(e) => setData('target_audience', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:bg-white text-slate-900 transition cursor-pointer"
                                    >
                                        <option value="all">Everyone (All Students, Teachers, Staff)</option>
                                        <option value="students">Students Only (Applicant & Trainee Portals)</option>
                                        <option value="teachers">Instructors & Faculty Only (Teacher Portal)</option>
                                        <option value="staff">Administrative Staff Only</option>
                                    </select>
                                    {errors.target_audience && (
                                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.target_audience}</p>
                                    )}
                                </div>

                                {/* Expiration Date */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block font-bold text-slate-700">
                                            Auto-Expiration Date
                                        </label>
                                        <span className="text-[11px] text-slate-400 font-normal">Optional</span>
                                    </div>
                                    <input
                                        type="date"
                                        value={data.expires_at}
                                        onChange={(e) => setData('expires_at', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:bg-white text-slate-900 transition"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Leave empty if announcement should stay active indefinitely.</p>
                                    {errors.expires_at && (
                                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.expires_at}</p>
                                    )}
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Broadcast Message / Circular Details <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        rows={5}
                                        placeholder="Type the official message, instructions, deadlines, or policy updates clearly..."
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:bg-white text-slate-900 leading-relaxed transition resize-none"
                                        required
                                    />
                                    {errors.message && (
                                        <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.message}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3 px-4 rounded-xl bg-[#0B3B24] hover:bg-[#124E31] text-white font-black transition shadow-md shadow-emerald-950/20 disabled:opacity-50 flex items-center justify-center space-x-2 text-xs"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    <span>{processing ? 'Publishing Broadcast...' : 'Publish & Broadcast Notice'}</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT (7 Cols): ANNOUNCEMENT HISTORY & FEED */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
                            {/* SEARCH & AUDIENCE FILTERS */}
                            <div className="space-y-3 pb-4 border-b border-slate-100">
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search broadcasts by title, content, or author..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:bg-white text-slate-900 transition"
                                    />
                                </div>

                                {/* Category Filters */}
                                <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                                    <button
                                        type="button"
                                        onClick={() => setAudienceFilter('all_filter')}
                                        className={`px-3 py-1.5 rounded-xl transition ${
                                            audienceFilter === 'all_filter'
                                                ? 'bg-[#0B3B24] text-white shadow-xs'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        All ({announcements.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAudienceFilter('live')}
                                        className={`px-3 py-1.5 rounded-xl transition ${
                                            audienceFilter === 'live'
                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        Live ({activeCount})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAudienceFilter('students')}
                                        className={`px-3 py-1.5 rounded-xl transition ${
                                            audienceFilter === 'students'
                                                ? 'bg-blue-600 text-white shadow-xs'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        Students
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAudienceFilter('teachers')}
                                        className={`px-3 py-1.5 rounded-xl transition ${
                                            audienceFilter === 'teachers'
                                                ? 'bg-purple-600 text-white shadow-xs'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        Teachers
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAudienceFilter('staff')}
                                        className={`px-3 py-1.5 rounded-xl transition ${
                                            audienceFilter === 'staff'
                                                ? 'bg-amber-600 text-white shadow-xs'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        Staff
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAudienceFilter('expired')}
                                        className={`px-3 py-1.5 rounded-xl transition ${
                                            audienceFilter === 'expired'
                                                ? 'bg-slate-700 text-white shadow-xs'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        Expired
                                    </button>
                                </div>
                            </div>

                            {/* ANNOUNCEMENTS LIST */}
                            <div className="space-y-3.5">
                                {filteredAnnouncements.map((announcement) => {
                                    const expired = isExpired(announcement.expires_at);

                                    return (
                                        <div
                                            key={announcement.id}
                                            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 space-y-3 ${
                                                expired
                                                    ? 'bg-slate-50/70 border-slate-200 opacity-75'
                                                    : 'bg-white border-slate-200/80 hover:border-emerald-500/40 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center space-x-2">
                                                        {getAudienceBadge(announcement.target_audience)}
                                                        {expired ? (
                                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-200 text-slate-600">
                                                                Expired
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                <span>Live</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="font-bold text-sm text-slate-900">
                                                        {announcement.title}
                                                    </h3>
                                                </div>

                                                <div className="flex items-center space-x-2 shrink-0">
                                                    <span className="text-[11px] text-slate-400 font-mono">
                                                        {new Date(announcement.created_at).toLocaleDateString('en-GB', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(announcement.id)}
                                                        disabled={deletingId === announcement.id}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                                        title="Revoke & Delete Announcement"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                                                {announcement.message}
                                            </p>

                                            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                                                <span>
                                                    Author: <strong className="text-slate-700 font-semibold">{announcement.creator?.name || 'Administrator'}</strong>
                                                </span>
                                                {announcement.expires_at && (
                                                    <span className="flex items-center space-x-1">
                                                        <Clock className="h-3 w-3 text-slate-400" />
                                                        <span>Expires: {announcement.expires_at}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {filteredAnnouncements.length === 0 && (
                                    <div className="text-center py-12 text-slate-400">
                                        <Inbox className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                                        <p className="font-medium text-xs">No broadcast announcements match the current search or filters.</p>
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