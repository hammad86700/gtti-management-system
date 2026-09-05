import ClerkLayout from '@/Layouts/ClerkLayout';
import { Head, Link } from '@inertiajs/react';
import {
    LayoutDashboard,
    FileCheck,
    BookOpen,
    Send,
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    ArrowRight,
    Sparkles,
    Calendar,
    GraduationCap,
    TrendingUp,
    CreditCard
} from 'lucide-react';

export default function Dashboard({ stats = {}, recentApplications = [], coursesSummary = [] }) {
    const kpis = [
        {
            title: 'Fee Verifications Due',
            value: stats.pending_fee_verifications ?? 0,
            desc: 'Paid bank slips uploaded',
            icon: CreditCard,
            color: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
            href: route('clerk.applications.index', { fee_status: 'pending_verification' }),
            highlight: (stats.pending_fee_verifications ?? 0) > 0,
        },
        {
            title: 'Pending Scrutiny',
            value: stats.pending_scrutiny ?? 0,
            desc: 'Awaiting document inspection',
            icon: Clock,
            color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            href: route('clerk.applications.index', { status: 'submitted' }),
        },
        {
            title: 'Verified Applications',
            value: stats.verified_applications ?? 0,
            desc: 'Eligible for entrance test',
            icon: CheckCircle2,
            color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            href: route('clerk.applications.index', { status: 'verified' }),
        },
        {
            title: 'Rejected Applications',
            value: stats.rejected_applications ?? 0,
            desc: 'Incomplete / non-compliant',
            icon: XCircle,
            color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
            href: route('clerk.applications.index', { status: 'rejected' }),
        },
        {
            title: 'Scrutinized Today',
            value: stats.scrutinized_today ?? 0,
            desc: 'Processed during this shift',
            icon: Sparkles,
            color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
            href: route('clerk.applications.index'),
        },
    ];

    return (
        <ClerkLayout
            header={
                <div className="flex items-center space-x-2 text-xs font-medium">
                    <span className="font-bold text-[#C1902F]">Clerk Desk</span>
                    <span>/</span>
                    <span className="text-white font-semibold">Operational Intake & Scrutiny Overview</span>
                </div>
            }
        >
            <Head title="Admission Clerk Dashboard - GTTI Management System" />

            <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
                {/* Pending Fee Verifications Urgent Banner */}
                {(stats.pending_fee_verifications ?? 0) > 0 && (
                    <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-950/40 border-2 border-amber-500/50 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3.5">
                            <div className="h-12 w-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-lg animate-pulse">
                                <CreditCard className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                                        ACTION REQUIRED
                                    </span>
                                    <span className="text-xs font-bold text-amber-300 font-mono">
                                        {stats.pending_fee_verifications} Paid Challan{stats.pending_fee_verifications > 1 ? 's' : ''} Awaiting Review
                                    </span>
                                </div>
                                <h3 className="text-base font-black text-white mt-1">
                                    Applicants Have Uploaded Bank Fee Challan Slips
                                </h3>
                                <p className="text-xs text-slate-300">
                                    Review deposited challan receipts, confirm admissions, and issue class induction notices.
                                </p>
                            </div>
                        </div>

                        <Link
                            href={route('clerk.applications.index', { fee_status: 'pending_verification' })}
                            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shrink-0"
                        >
                            <span>Verify Paid Slips Now</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                )}

                {/* Hero Header */}
                <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/30 border border-slate-800 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Admissions Directorate • Intake Session 2026-2027
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            Admission Operations Cockpit
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            Process candidate dossiers, verify credential authenticity, reject non-compliant applications with mandatory remarks, and 1-click broadcast test schedules to all applicants of a trade.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <Link
                            href={route('clerk.applications.index')}
                            className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-[#C1902F] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg"
                        >
                            <FileCheck className="h-4 w-4" />
                            <span>Start Scrutiny</span>
                        </Link>

                        <Link
                            href={route('clerk.scheduler.index')}
                            className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl border border-slate-700 transition"
                        >
                            <Send className="h-4 w-4 text-amber-400" />
                            <span>Broadcast Test</span>
                        </Link>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {kpis.map((kpi, idx) => {
                        const Icon = kpi.icon;
                        return (
                            <Link
                                key={idx}
                                href={kpi.href}
                                className={`p-5 rounded-3xl bg-slate-900 border transition space-y-3 block group ${
                                    kpi.highlight ? 'border-amber-500/60 ring-2 ring-amber-500/20 bg-amber-950/10' : 'border-slate-800 hover:border-slate-700'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        {kpi.title}
                                    </span>
                                    <div className={`p-2 rounded-xl border ${kpi.color}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-white font-mono">{kpi.value}</p>
                                    <span className="text-[11px] text-slate-500 block mt-0.5">{kpi.desc}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Main Content: Courses Intake Breakdown & Recent Scrutinies */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Course Intake Breakdown */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
                            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-bold text-white">Course Intake Status</h2>
                                    <p className="text-xs text-slate-400">Total applicants, pending reviews, and verified candidates</p>
                                </div>
                                <Link
                                    href={route('clerk.courses.index')}
                                    className="text-xs font-bold text-amber-400 hover:text-amber-300 transition"
                                >
                                    Manage Catalog →
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                                        <tr>
                                            <th className="py-3 px-4">Trade / Course</th>
                                            <th className="py-3 px-4">Type</th>
                                            <th className="py-3 px-4 text-center">Total Apps</th>
                                            <th className="py-3 px-4 text-center">Pending</th>
                                            <th className="py-3 px-4 text-center">Verified</th>
                                            <th className="py-3 px-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 text-slate-300">
                                        {coursesSummary.map((course) => (
                                            <tr key={course.id} className="hover:bg-slate-800/40 transition">
                                                <td className="py-3.5 px-4 font-bold text-white">
                                                    {course.name}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                        course.admission_type === 'merit_based'
                                                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                    }`}>
                                                        {course.admission_type === 'merit_based' ? 'Merit' : 'FCFS'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                                                    {course.total_applicants || 0}
                                                </td>
                                                <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400">
                                                    {course.pending_applicants || 0}
                                                </td>
                                                <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">
                                                    {course.verified_applicants || 0}
                                                </td>
                                                <td className="py-3.5 px-4 text-right space-x-2">
                                                    <Link
                                                        href={route('clerk.applications.index', { course_id: course.id })}
                                                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition border border-slate-700"
                                                    >
                                                        <span>Scrutiny</span>
                                                        <ArrowRight className="h-3 w-3" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right 1 Col: Recent Applications Stream */}
                    <div className="space-y-6">
                        <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl p-5 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                                <h3 className="text-sm font-bold text-white">Recent Intake Stream</h3>
                                <span className="text-[10px] font-mono text-slate-500">Latest 10</span>
                            </div>

                            {recentApplications.length > 0 ? (
                                <div className="space-y-3">
                                    {recentApplications.map((app) => (
                                        <div
                                            key={app.id}
                                            className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-xs text-white truncate max-w-[150px]">
                                                    {app.candidate_name}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                                    app.status === 'verified'
                                                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                        : app.status === 'rejected'
                                                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                                }`}>
                                                    {app.status}
                                                </span>
                                            </div>

                                            <div className="text-[11px] text-slate-400">
                                                {app.course_name}
                                            </div>

                                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                                                <span>{app.cnic}</span>
                                                <span>{app.created_at}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-slate-500 text-xs">
                                    No applications submitted yet.
                                </div>
                            )}

                            <Link
                                href={route('clerk.applications.index')}
                                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition block text-center border border-slate-700"
                            >
                                View Complete Roster →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </ClerkLayout>
    );
}
