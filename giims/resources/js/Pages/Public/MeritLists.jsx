import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Award,
    Download,
    Search,
    Calendar,
    ArrowLeft,
    CheckCircle2,
    Building2,
    FileText,
    ExternalLink,
    Filter,
    Clock,
    Phone,
    MapPin
} from 'lucide-react';

export default function MeritLists({
    meritLists = { data: [] },
    courses = [],
    settings = {},
    filters = {},
    canLogin = true,
    canRegister = true
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCourse, setSelectedCourse] = useState(filters.course_id || '');

    const lists = meritLists?.data || (Array.isArray(meritLists) ? meritLists : []);

    const filteredLists = lists.filter((item) => {
        if (selectedCourse && item.course_id != selectedCourse) {
            return false;
        }
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            item.title?.toLowerCase().includes(q) ||
            item.course?.name?.toLowerCase().includes(q) ||
            item.shift?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col font-sans selection:bg-[#00401A] selection:text-white">
            <Head title={`Official Merit Lists & Selections Gazette — ${settings.institute_name || 'GTTI Rahim Yar Khan'}`} />

            {/* Provincial Top Crest Bar */}
            <div className="bg-[#002B11] text-emerald-100 text-xs border-b border-[#001F0C]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                        <span className="font-bold tracking-wider uppercase text-[11px] text-amber-300 flex items-center space-x-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>{settings.govt_subheading || 'GOVERNMENT OF THE PUNJAB | TEVTA'}</span>
                        </span>
                    </div>
                    <div className="flex items-center space-x-4 text-[11px]">
                        <span className="flex items-center space-x-1 text-emerald-200">
                            <Phone className="h-3 w-3 text-amber-300" />
                            <span>Helpline: {settings.helpline_phones || '068-9230123 / 068-9230124'}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Masthead Header */}
            <header className="bg-white border-b-2 border-[#00401A] shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="shrink-0 hover:opacity-90 transition">
                            <img src="/images/tevta-logo.png" alt="TEVTA Punjab" className="h-16 w-16 sm:h-20 sm:w-20 object-contain" />
                        </Link>
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-[#00401A] border border-emerald-300">
                                    Official Selection Gazette
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300">
                                    RTI Transparent
                                </span>
                            </div>
                            <h1 className="text-lg sm:text-2xl font-black text-[#00401A] tracking-tight mt-0.5">
                                Official Merit Lists & Selection Gazette
                            </h1>
                            <p className="text-xs text-gray-500 font-medium">
                                {settings.institute_name || 'Government Technical Training Institute, Rahim Yar Khan'} • Session 2026
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Link
                            href="/"
                            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition flex items-center space-x-1.5"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Back to Portal Home</span>
                        </Link>
                        <a
                            href="/download-prospectus"
                            className="px-4 py-2 rounded-lg bg-[#00401A] hover:bg-[#003314] text-white text-xs font-bold transition flex items-center space-x-1.5 shadow"
                        >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download Prospectus</span>
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                
                {/* Information Banner */}
                <div className="rounded-2xl bg-gradient-to-r from-[#00401A] to-emerald-800 text-white p-6 shadow-md border border-emerald-700 relative overflow-hidden">
                    <div className="relative z-10 max-w-3xl space-y-2">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-700/80 text-[11px] font-extrabold uppercase tracking-wider text-amber-300 border border-emerald-500/40 inline-flex items-center space-x-1.5">
                            <Award className="h-3.5 w-3.5" />
                            <span>Transparent Merit Determinations</span>
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                            Official Candidate Selections & Merit Gazette
                        </h2>
                        <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                            Pursuant to the Government of the Punjab TEVTA Admission Regulations, all Merit Lists published below are finalized through the official automated merit engine (50% Academic Marks + 50% CBT Entrance Score for test-required trades, or direct timestamp ranking for First-Come First-Served intake).
                        </p>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="w-full sm:w-80 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by trade or merit title..."
                            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>

                    <div className="w-full sm:w-auto flex items-center space-x-3">
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <Filter className="h-4 w-4 text-emerald-700" />
                            <span className="font-bold">Course / Trade:</span>
                        </div>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="text-xs rounded-lg border border-gray-300 py-2 px-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            <option value="">All Trades & Diplomas</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Merit Lists Table / Cards Grid */}
                {filteredLists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredLists.map((list) => {
                            const downloadUrl = list.file_path
                                ? `/storage/${list.file_path.replace(/^\/+/, '')}`
                                : '#';

                            return (
                                <div
                                    key={list.id}
                                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4 hover:border-emerald-600 group"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-[#00401A] border border-emerald-200 flex items-center space-x-1">
                                                <CheckCircle2 className="h-3 w-3" />
                                                <span>{list.shift || 'General'} Shift</span>
                                            </span>
                                            <span className="text-[11px] text-gray-400 flex items-center space-x-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{list.published_at ? new Date(list.published_at).toLocaleDateString() : 'Active'}</span>
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider block">
                                                {list.course?.name || 'Vocational Trade'}
                                            </span>
                                            <h3 className="text-base font-black text-gray-900 group-hover:text-[#00401A] transition leading-snug mt-0.5">
                                                {list.title}
                                            </h3>
                                        </div>

                                        {list.description && (
                                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                                {list.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                                        <div className="text-[11px] text-gray-500">
                                            <span>Batch: <strong>{list.academic_session || 'Session 2026'}</strong></span>
                                        </div>
                                        <a
                                            href={downloadUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3.5 py-1.5 rounded-lg bg-[#00401A] hover:bg-[#003013] text-white text-xs font-extrabold transition shadow flex items-center space-x-1.5"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            <span>View Gazette PDF</span>
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
                        <div className="h-14 w-14 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                            <Award className="h-7 w-7" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900">
                            No Published Merit Lists Found
                        </h3>
                        <p className="text-xs text-gray-500 max-w-md mx-auto">
                            There are currently no published merit lists matching your filter. Merit lists for ongoing admission tracks will appear here once finalized by the Admission Committee.
                        </p>
                        <div className="pt-2">
                            <Link
                                href="/"
                                className="px-4 py-2 rounded-lg bg-[#00401A] text-white text-xs font-bold inline-flex items-center space-x-1.5 shadow"
                            >
                                <span>Browse Available Courses</span>
                            </Link>
                        </div>
                    </div>
                )}

            </main>

            {/* Footer */}
            <footer className="bg-[#002B11] text-white border-t border-emerald-950 mt-12 py-6 text-xs text-center text-emerald-200">
                <div className="max-w-7xl mx-auto px-4 space-y-1">
                    <p>© {new Date().getFullYear()} {settings.institute_name || 'Government Technical Training Institute, Rahim Yar Khan'}. All rights reserved.</p>
                    <p className="text-[11px] text-emerald-400">Technical Education & Vocational Training Authority (TEVTA) • Government of the Punjab</p>
                </div>
            </footer>
        </div>
    );
}
