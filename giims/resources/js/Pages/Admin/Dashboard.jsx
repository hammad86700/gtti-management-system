import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Users,
    Building2,
    FileText,
    CheckCircle2,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    GraduationCap,
    BookOpen,
    ShieldCheck,
    Layers,
    Megaphone,
    Archive,
    ShieldAlert,
    Briefcase,
    Award,
    Calendar,
    ChevronRight,
    Activity,
    CreditCard,
    DollarSign,
    Clock,
    Sparkles,
    AlertTriangle,
    Check,
    BarChart3,
    PieChart,
    Search,
    Send,
    Eye
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/Components/UI/Card';
import Badge from '@/Components/UI/Badge';

export default function Dashboard({
    stats = {},
    recentAnnouncements = [],
    recentRejectedApplications = []
}) {
    const [selectedPeriod, setSelectedPeriod] = useState('Session');
    const [showNoticeBanner, setShowNoticeBanner] = useState(true);

    // 6-Column KPI Metrics Data (aligned with EduMaster standard)
    const kpiMetrics = [
        {
            title: 'Total Students',
            value: Number(stats.total_students ?? 1248).toLocaleString(),
            delta: '+12%',
            deltaType: 'up',
            label: 'Active Trainees',
            icon: Users,
            iconBg: 'bg-emerald-50 text-[#0B3B24] border-emerald-200',
        },
        {
            title: 'Teaching Staff',
            value: Number(stats.total_teachers ?? 48).toLocaleString(),
            delta: '+2',
            deltaType: 'up',
            label: 'Accredited Faculty',
            icon: BookOpen,
            iconBg: 'bg-blue-50 text-blue-700 border-blue-200',
        },
        {
            title: 'Fee Recoveries',
            value: '94.2%',
            delta: '+8.5%',
            deltaType: 'up',
            label: 'Rs 4.8M Recovered',
            icon: CreditCard,
            iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        },
        {
            title: 'Avg Attendance %',
            value: '89.4%',
            delta: '+1.8%',
            deltaType: 'up',
            label: 'Biometric Gate Log',
            icon: ShieldCheck,
            iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        },
        {
            title: 'Active Exams',
            value: Number(stats.active_exams ?? 14).toLocaleString(),
            delta: 'Midterms',
            deltaType: 'neutral',
            label: 'Theory & Practical',
            icon: Award,
            iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
        },
        {
            title: 'Mean Score',
            value: '74.6%',
            delta: '+3.2%',
            deltaType: 'up',
            label: 'PBTE Performance',
            icon: Activity,
            iconBg: 'bg-purple-50 text-purple-700 border-purple-200',
        },
    ];

    // Intake Demographics
    const demographicsData = [
        { trade: 'DAE Electrical & Electronics', count: 398, percent: 32, color: '#0B3B24' },
        { trade: 'CBT&A Computer Operator', count: 299, percent: 24, color: '#10B981' },
        { trade: 'Machinist & CNC Workshop', count: 200, percent: 16, color: '#0284C7' },
        { trade: 'Auto & Diesel Mechanics', count: 175, percent: 14, color: '#F59E0B' },
        { trade: 'Welder & Metallurgy', count: 176, percent: 14, color: '#8B5CF6' },
    ];

    // Weekly Attendance Data
    const weeklyAttendance = [
        { day: 'Mon', morning: 94, evening: 88 },
        { day: 'Tue', morning: 92, evening: 86 },
        { day: 'Wed', morning: 90, evening: 85 },
        { day: 'Thu', morning: 88, evening: 82 },
        { day: 'Fri', morning: 95, evening: 91 },
        { day: 'Sat', morning: 84, evening: 78 },
    ];

    // Recent Fee Payments Mock Data
    const recentPayments = [
        { id: 1, name: 'Muhammad Usman', roll: 'GTTI-EL-2026-004', trade: 'Electrical 2nd Yr', amount: 'Rs 4,500', date: '04 Sep 2026', method: 'Bank Challan', status: 'Cleared' },
        { id: 2, name: 'Hamza Tariq', roll: 'GTTI-CO-2026-012', trade: 'Computer Operator', amount: 'Rs 3,500', date: '04 Sep 2026', method: 'Online Portal', status: 'Cleared' },
        { id: 3, name: 'Ali Raza', roll: 'GTTI-MC-2026-031', trade: 'Machinist Trade', amount: 'Rs 4,500', date: '03 Sep 2026', method: 'Bank Challan', status: 'Cleared' },
        { id: 4, name: 'Zeeshan Ahmad', roll: 'GTTI-WD-2026-019', trade: 'Welder 1st Yr', amount: 'Rs 2,000', date: '03 Sep 2026', method: 'Cash Counter', status: 'Partial' },
        { id: 5, name: 'Bilal Hassan', roll: 'GTTI-AD-2026-008', trade: 'Auto & Diesel', amount: 'Rs 4,500', date: '02 Sep 2026', method: 'Bank Challan', status: 'Cleared' },
    ];

    // Upcoming Events Feed
    const upcomingEvents = [
        { id: 1, title: 'Midterm Examination Week', date: 'Sep 15 - 20, 2026', venue: 'Academic Examination Hall A & B', tag: 'Academic', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { id: 2, title: 'TEVTA Provincial Quality Audit', date: 'Sep 22, 2026', venue: 'Executive Conference Room', tag: 'Provincial', color: 'bg-blue-50 text-blue-700 border-blue-200' },
        { id: 3, title: 'Workshop Tool Store Consumables Check', date: 'Sep 28, 2026', venue: 'Central Logistics Facility', tag: 'Store', color: 'bg-amber-50 text-amber-700 border-amber-200' },
        { id: 4, title: 'Fall Intake Entrance Viva & Seat Allotment', date: 'Oct 02, 2026', venue: 'Interview Labs 1 - 4', tag: 'Admissions', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    ];

    return (
        <AdminLayout
            header={
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium truncate">
                    <span className="font-bold text-[#0B3B24]">GTTI RYK</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-700 font-semibold truncate">Dashboard Overview</span>
                </div>
            }
        >
            <Head title="Admin Dashboard - GIIMS Institutional ERP" />

            <div className="space-y-6">
                {/* 1. TOP INSIGHT BANNER */}
                {showNoticeBanner && (
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-[#0B3B24] to-emerald-900 text-white p-5 sm:p-6 border border-emerald-800/50 shadow-sm transition-all">
                        {/* Background Watermark Crest */}
                        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
                            <Building2 className="w-56 h-56" />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                            <div className="space-y-2 max-w-2xl">
                                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                                    <span>Institutional Operational Notice • AI Predictive Health</span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-serif">
                                    Trade Electrical 2nd Year attendance down 8% before midterm exams
                                </h2>
                                <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-normal">
                                    Biometric gate logs show 14 absent candidates over consecutive morning shifts in Electrical Batch 2026-B. Automated SMS advisory dispatch ready.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <Link
                                    href={route('admin.attendance.index')}
                                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20"
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>View Analysis</span>
                                </Link>

                                <Link
                                    href={route('admin.announcements.index')}
                                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold transition shadow-sm"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    <span>Send SMS/Notice</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. HIGH-DENSITY METRIC KPI GRID (6 COLUMNS ON XL) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    {kpiMetrics.map((kpi) => {
                        const Icon = kpi.icon;
                        return (
                            <div
                                key={kpi.title}
                                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 flex flex-col justify-between"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center border ${kpi.iconBg}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <span
                                        className={`inline-flex items-center space-x-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                                            kpi.deltaType === 'up'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : kpi.deltaType === 'down'
                                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}
                                    >
                                        {kpi.deltaType === 'up' && <ArrowUpRight className="h-3 w-3" />}
                                        {kpi.deltaType === 'down' && <ArrowDownRight className="h-3 w-3" />}
                                        <span>{kpi.delta}</span>
                                    </span>
                                </div>

                                <div className="mt-3">
                                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                                        {kpi.value}
                                    </h3>
                                    <p className="text-xs font-semibold text-slate-700 mt-0.5 truncate">
                                        {kpi.title}
                                    </p>
                                    <p className="text-[11px] font-medium text-slate-400 truncate">
                                        {kpi.label}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 3. CHART & DATA GRID (2-COLUMN BALANCED SPLIT) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left 7 Cols: FEE COLLECTIONS AREA / LINE CHART */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4 text-[#0B3B24]" />
                                        <span>Fee Collections & Revenue Stream</span>
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Monthly fee challan recovery trajectory (PKR in Millions • FY 2026-27)
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                        <span>Total: PKR 59.8M</span>
                                    </span>
                                </div>
                            </div>

                            {/* Responsive SVG Area / Line Chart */}
                            <div className="w-full pt-2">
                                <svg viewBox="0 0 600 200" className="w-full h-48 overflow-visible">
                                    <defs>
                                        <linearGradient id="feeGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                                            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                                        </linearGradient>
                                    </defs>

                                    {/* Horizontal Reference Grid Lines */}
                                    <line x1="40" y1="30" x2="580" y2="30" stroke="#E2E8F0" strokeDasharray="3 3" />
                                    <line x1="40" y1="75" x2="580" y2="75" stroke="#E2E8F0" strokeDasharray="3 3" />
                                    <line x1="40" y1="120" x2="580" y2="120" stroke="#E2E8F0" strokeDasharray="3 3" />
                                    <line x1="40" y1="165" x2="580" y2="165" stroke="#E2E8F0" />

                                    {/* Left Y-Axis Labels */}
                                    <text x="32" y="34" fontSize="10" fill="#94A3B8" textAnchor="end">7M</text>
                                    <text x="32" y="79" fontSize="10" fill="#94A3B8" textAnchor="end">5M</text>
                                    <text x="32" y="124" fontSize="10" fill="#94A3B8" textAnchor="end">3M</text>
                                    <text x="32" y="169" fontSize="10" fill="#94A3B8" textAnchor="end">0M</text>

                                    {/* Smooth Area Path */}
                                    <path
                                        d="M 60 145 C 90 135, 120 120, 150 115 C 180 125, 210 100, 240 85 C 270 95, 300 70, 330 65 C 360 75, 390 55, 420 48 C 450 60, 480 40, 510 38 C 540 35, 560 32, 575 30 L 575 165 L 60 165 Z"
                                        fill="url(#feeGradient)"
                                    />

                                    {/* Smooth Stroke Line */}
                                    <path
                                        d="M 60 145 C 90 135, 120 120, 150 115 C 180 125, 210 100, 240 85 C 270 95, 300 70, 330 65 C 360 75, 390 55, 420 48 C 450 60, 480 40, 510 38 C 540 35, 560 32, 575 30"
                                        fill="none"
                                        stroke="#0B3B24"
                                        strokeWidth="3"
                                    />

                                    {/* Data Dots & X-Labels */}
                                    {[
                                        { x: 60, label: 'Jan' },
                                        { x: 107, label: 'Feb' },
                                        { x: 154, label: 'Mar' },
                                        { x: 201, label: 'Apr' },
                                        { x: 248, label: 'May' },
                                        { x: 295, label: 'Jun' },
                                        { x: 342, label: 'Jul' },
                                        { x: 389, label: 'Aug' },
                                        { x: 436, label: 'Sep' },
                                        { x: 483, label: 'Oct' },
                                        { x: 530, label: 'Nov' },
                                        { x: 575, label: 'Dec' },
                                    ].map((pt, idx) => (
                                        <text
                                            key={idx}
                                            x={pt.x}
                                            y="185"
                                            fontSize="10"
                                            fontWeight="600"
                                            fill="#64748B"
                                            textAnchor="middle"
                                        >
                                            {pt.label}
                                        </text>
                                    ))}
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Right 5 Cols: INTAKE DEMOGRAPHICS DONUT CHART */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                                    <PieChart className="h-4 w-4 text-[#0B3B24]" />
                                    <span>Intake Demographics by Trade</span>
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Enrolled trainees distribution across technical programs
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-6 pt-1">
                                {/* SVG Donut Chart */}
                                <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#E2E8F0" strokeWidth="12" />
                                        {/* DAE Electrical 32% */}
                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#0B3B24" strokeWidth="12" strokeDasharray="76.4 238.8" strokeDashoffset="0" />
                                        {/* CBT Computer 24% */}
                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10B981" strokeWidth="12" strokeDasharray="57.3 238.8" strokeDashoffset="-76.4" />
                                        {/* Machinist 16% */}
                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#0284C7" strokeWidth="12" strokeDasharray="38.2 238.8" strokeDashoffset="-133.7" />
                                        {/* Auto Diesel 14% */}
                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F59E0B" strokeWidth="12" strokeDasharray="33.4 238.8" strokeDashoffset="-171.9" />
                                        {/* Welder 14% */}
                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#8B5CF6" strokeWidth="12" strokeDasharray="33.4 238.8" strokeDashoffset="-205.3" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                        <span className="text-lg font-extrabold text-slate-900 leading-none">1,248</span>
                                        <span className="text-[10px] text-slate-400 font-medium">Trainees</span>
                                    </div>
                                </div>

                                {/* Donut Legend */}
                                <div className="space-y-2 flex-1 w-full text-xs">
                                    {demographicsData.map((item) => (
                                        <div key={item.trade} className="flex items-center justify-between gap-2">
                                            <div className="flex items-center space-x-2 truncate">
                                                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                                <span className="text-slate-700 font-medium truncate">{item.trade}</span>
                                            </div>
                                            <span className="font-bold text-slate-900 shrink-0">{item.percent}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. LOWER SECTION: WEEKLY ATTENDANCE + TIMELINE + RECENT PAYMENTS + UPCOMING EVENTS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left 6 Cols: WEEKLY ATTENDANCE GROUPED BAR CHART */}
                    <div className="lg:col-span-6">
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                                        <BarChart3 className="h-4 w-4 text-[#0B3B24]" />
                                        <span>Weekly Biometric Attendance Rates</span>
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Comparison between Morning Shift vs Evening Shift Trainees
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3 text-[11px] font-semibold">
                                    <span className="flex items-center space-x-1 text-slate-600">
                                        <span className="h-2 w-2 rounded-full bg-[#0B3B24]"></span>
                                        <span>Morning</span>
                                    </span>
                                    <span className="flex items-center space-x-1 text-slate-600">
                                        <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                                        <span>Evening</span>
                                    </span>
                                </div>
                            </div>

                            {/* Grouped Bar Chart SVG */}
                            <div className="w-full pt-2">
                                <svg viewBox="0 0 480 160" className="w-full h-40">
                                    {/* Grid Lines */}
                                    <line x1="30" y1="20" x2="460" y2="20" stroke="#F1F5F9" />
                                    <line x1="30" y1="60" x2="460" y2="60" stroke="#F1F5F9" />
                                    <line x1="30" y1="100" x2="460" y2="100" stroke="#F1F5F9" />
                                    <line x1="30" y1="130" x2="460" y2="130" stroke="#CBD5E1" />

                                    {/* Y Labels */}
                                    <text x="25" y="24" fontSize="9" fill="#94A3B8" textAnchor="end">100%</text>
                                    <text x="25" y="64" fontSize="9" fill="#94A3B8" textAnchor="end">75%</text>
                                    <text x="25" y="104" fontSize="9" fill="#94A3B8" textAnchor="end">50%</text>

                                    {/* Bars for Each Day */}
                                    {weeklyAttendance.map((d, idx) => {
                                        const xOffset = 50 + idx * 68;
                                        const mHeight = (d.morning / 100) * 110;
                                        const eHeight = (d.evening / 100) * 110;
                                        return (
                                            <g key={d.day}>
                                                {/* Morning Bar */}
                                                <rect
                                                    x={xOffset}
                                                    y={130 - mHeight}
                                                    width="16"
                                                    height={mHeight}
                                                    rx="4"
                                                    fill="#0B3B24"
                                                />
                                                {/* Evening Bar */}
                                                <rect
                                                    x={xOffset + 20}
                                                    y={130 - eHeight}
                                                    width="16"
                                                    height={eHeight}
                                                    rx="4"
                                                    fill="#0284C7"
                                                />
                                                {/* X Label */}
                                                <text
                                                    x={xOffset + 18}
                                                    y="148"
                                                    fontSize="10"
                                                    fontWeight="bold"
                                                    fill="#64748B"
                                                    textAnchor="middle"
                                                >
                                                    {d.day}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Right 6 Cols: ACADEMIC MEAN SCORE TIMELINE */}
                    <div className="lg:col-span-6">
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
                            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                                        <Activity className="h-4 w-4 text-[#0B3B24]" />
                                        <span>Academic Mean Score Timeline</span>
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Progressive gradebook averages across institutional evaluation milestones
                                    </p>
                                </div>
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                    +6.4% Overall
                                </span>
                            </div>

                            {/* Milestone Timeline Cards */}
                            <div className="space-y-3 pt-1">
                                {[
                                    { term: 'Initial Diagnostic Evaluation', score: '68.2%', date: 'Term Start', status: 'Completed', tier: 'tier-meeting' },
                                    { term: 'Monthly Quiz Assessment #1', score: '71.5%', date: 'Mid Term 1', status: 'Completed', tier: 'tier-meeting' },
                                    { term: 'Practical Workshop Exam Mock', score: '78.4%', date: 'Workshop Lab', status: 'Completed', tier: 'tier-meeting' },
                                    { term: 'Current Term Target Benchmark', score: '82.0%', date: 'Midterm 2026', status: 'In Progress', tier: 'tier-exceeding' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                                        <div className="flex items-center space-x-3">
                                            <span className="h-6 w-6 rounded-lg bg-emerald-100 text-[#0B3B24] font-bold flex items-center justify-center text-[11px]">
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <p className="font-bold text-slate-800">{item.term}</p>
                                                <p className="text-[10px] text-slate-400">{item.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${item.tier}`}>
                                                {item.score}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. RECENT PAYMENTS TABLE & UPCOMING EVENTS FEED */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Recent Fee Payments Table (7 Cols) */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                                        <CreditCard className="h-4 w-4 text-[#0B3B24]" />
                                        <span>Recent Fee Payments & Challans</span>
                                    </h3>
                                    <p className="text-xs text-slate-400">Real-time banking recovery updates</p>
                                </div>
                                <Link
                                    href={route('admin.clearances.index')}
                                    className="text-xs text-[#0B3B24] hover:underline font-bold flex items-center space-x-1"
                                >
                                    <span>All Challans</span>
                                    <ArrowUpRight className="h-3 w-3" />
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                                        <tr>
                                            <th className="py-2.5 px-3">Trainee</th>
                                            <th className="py-2.5 px-3">Trade / Class</th>
                                            <th className="py-2.5 px-3">Amount</th>
                                            <th className="py-2.5 px-3">Date</th>
                                            <th className="py-2.5 px-3 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {recentPayments.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-slate-50/70 transition">
                                                <td className="py-2.5 px-3">
                                                    <p className="font-bold text-slate-900">{payment.name}</p>
                                                    <p className="text-[10px] font-mono text-slate-400">{payment.roll}</p>
                                                </td>
                                                <td className="py-2.5 px-3 font-medium text-slate-600">
                                                    {payment.trade}
                                                </td>
                                                <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                                                    {payment.amount}
                                                </td>
                                                <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                                                    {payment.date}
                                                </td>
                                                <td className="py-2.5 px-3 text-right">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                        payment.status === 'Cleared'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    }`}>
                                                        {payment.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Institutional Events Feed (5 Cols) */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-[#0B3B24]" />
                                        <span>Upcoming Institutional Events</span>
                                    </h3>
                                    <p className="text-xs text-slate-400">Scheduled tests, audits & committee reviews</p>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Q3 Calendar</span>
                            </div>

                            <div className="space-y-3">
                                {upcomingEvents.map((evt) => (
                                    <div key={evt.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5 hover:border-emerald-500/30 transition">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="text-xs font-bold text-slate-900 leading-snug">
                                                {evt.title}
                                            </h4>
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${evt.color}`}>
                                                {evt.tag}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                                            <span className="flex items-center space-x-1">
                                                <Clock className="h-3 w-3 text-slate-400" />
                                                <span>{evt.date}</span>
                                            </span>
                                            <span className="truncate max-w-[140px]">{evt.venue}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6. CLERICAL OPERATIONS MONITOR & REJECTION AUDIT DESK (Preserving Phase 26/27 logic) */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-[#0B3B24] border border-emerald-200">
                                    Principal Executive Oversight
                                </span>
                                <h3 className="text-base font-bold text-slate-900">
                                    Admission Clerical Operations Monitor
                                </h3>
                            </div>
                            <p className="text-xs text-slate-500">
                                Real-time scrutiny logs, scheduled tests, and applicant rejections processed by admission clerks.
                            </p>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Scrutinized Today</span>
                                <span className="font-mono font-black text-slate-800 text-sm">{stats.scrutinized_today || 0} Dossiers</span>
                            </div>
                            <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Tests Scheduled</span>
                                <span className="font-mono font-black text-emerald-700 text-sm">{stats.tests_scheduled_by_clerk || 0} Candidates</span>
                            </div>
                            <Link
                                href={route('clerk.dashboard')}
                                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#0B3B24] text-white font-bold text-xs hover:bg-[#124E31] transition shadow-xs"
                                title="Inspect Admission Clerk Operations in Executive Oversight Mode"
                            >
                                <span>Inspect Clerk Scrutiny Desk</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>

                    {/* Rejected Applications Audit Table */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Rejection Reasons Audit Roster (Logged by Clerks)
                            </h4>
                            <span className="text-[11px] font-mono text-slate-400">Executive Audit Trail</span>
                        </div>

                        {recentRejectedApplications && recentRejectedApplications.length > 0 ? (
                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                                        <tr>
                                            <th className="py-2.5 px-3">Candidate</th>
                                            <th className="py-2.5 px-3">CNIC</th>
                                            <th className="py-2.5 px-3">Applied Course</th>
                                            <th className="py-2.5 px-3">Clerk Observation / Reason</th>
                                            <th className="py-2.5 px-3">Officer</th>
                                            <th className="py-2.5 px-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {recentRejectedApplications.map((app) => (
                                            <tr key={app.id} className="hover:bg-slate-50/70 transition">
                                                <td className="py-3 px-3 font-bold text-slate-900">
                                                    {app.candidate_name}
                                                </td>
                                                <td className="py-3 px-3 font-mono text-slate-500">
                                                    {app.cnic}
                                                </td>
                                                <td className="py-3 px-3 font-semibold text-slate-800">
                                                    {app.course_name}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="text-rose-700 font-medium bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px] inline-block">
                                                        {app.clerk_remarks || 'Flagged for missing credentials'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="font-bold text-slate-700 block">{app.clerk_name}</span>
                                                    <span className="text-[10px] text-slate-400">{app.scrutinized_at}</span>
                                                </td>
                                                <td className="py-3 px-3 text-right">
                                                    <Link
                                                        href={route('admin.applications.show', app.id)}
                                                        className="text-[11px] font-bold text-[#0B3B24] hover:underline"
                                                    >
                                                        Review & Override
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-6 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-slate-100">
                                No candidate rejections recorded.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
