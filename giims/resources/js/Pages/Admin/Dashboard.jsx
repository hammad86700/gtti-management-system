import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Users,
    Building2,
    FileText,
    CheckCircle2,
    TrendingUp,
    ArrowUpRight,
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
    Activity
} from 'lucide-react';
import KpiCard from '@/Components/UI/KpiCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/Components/UI/Card';
import Badge from '@/Components/UI/Badge';
import EmptyState from '@/Components/UI/EmptyState';

export default function Dashboard({ stats = {}, recentAnnouncements = [] }) {
    const kpiData = [
        {
            title: 'Enrolled Trainees',
            value: Number(stats.total_students ?? 0).toLocaleString(),
            badge: 'Active Status',
            description: 'Accredited vocational programs',
            icon: Users,
            colorVariant: 'blue',
            trend: 'up',
        },
        {
            title: 'Pending Applications',
            value: Number(stats.pending_applications ?? 0).toLocaleString(),
            badge: 'Intake Pipeline',
            description: 'Awaiting document verification',
            icon: FileText,
            colorVariant: 'amber',
            trend: 'neutral',
        },
        {
            title: 'Accredited Courses',
            value: Number(stats.total_courses ?? 0).toLocaleString(),
            badge: 'TEVTA / NAVTTC',
            description: 'Technical diploma curricula',
            icon: BookOpen,
            colorVariant: 'green',
            trend: 'up',
        },
        {
            title: 'Active Batches',
            value: Number(stats.total_batches ?? 0).toLocaleString(),
            badge: 'Current Shifts',
            description: 'Morning & evening workshop sections',
            icon: Layers,
            colorVariant: 'purple',
            trend: 'up',
        },
    ];

    const quickModules = [
        {
            name: 'Admissions Review',
            href: route('admin.applications.index'),
            icon: FileText,
            count: stats.pending_applications,
            color: 'text-amber-600 bg-amber-50 border-amber-100',
            desc: 'Review candidate dossiers',
        },
        {
            name: 'Merit Selection',
            href: route('admin.merit.index'),
            icon: Award,
            count: null,
            color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
            desc: 'Generate rankings & lists',
        },
        {
            name: 'Clearances & Dues',
            href: route('admin.clearances.index'),
            icon: CheckCircle2,
            count: stats.pending_clearances,
            color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
            desc: 'Verify store & library dues',
        },
        {
            name: 'Workshop Store',
            href: route('admin.inventory.index'),
            icon: Archive,
            count: stats.low_stock_items,
            color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
            desc: 'Track consumable tools',
        },
        {
            name: 'Discipline Cases',
            href: route('admin.discipline.index'),
            icon: ShieldAlert,
            count: stats.open_discipline,
            color: 'text-rose-600 bg-rose-50 border-rose-100',
            desc: 'Review institutional records',
        },
        {
            name: 'Alumni Placements',
            href: route('admin.alumni.index'),
            icon: Briefcase,
            count: null,
            color: 'text-purple-600 bg-purple-50 border-purple-100',
            desc: 'Industry job tracking',
        },
    ];

    const formattedDate = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    return (
        <AdminLayout
            header={
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                    <span className="font-bold text-govt-green">GTTI RYK</span>
                    <span>/</span>
                    <span className="text-slate-900 font-semibold truncate">Dashboard</span>
                </div>
            }
        >
            <Head title="Admin Dashboard - GTTI RYK" />

            <div className="space-y-6">
                {/* Executive Page Greeting Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium mb-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Executive Management Cockpit</span>
                            <span>•</span>
                            <span className="text-slate-600">{formattedDate}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                            Admin Command Center
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Govt. Technical Training Institute, Rahim Yar Khan (GIIMS ERP)
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        <Link
                            href={route('admin.announcements.index')}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition shadow-xs"
                        >
                            <Megaphone className="h-3.5 w-3.5 text-govt-gold-600" />
                            <span>Broadcast Circular</span>
                        </Link>

                        <Link
                            href={route('admin.reports.index')}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white text-xs font-bold transition shadow-sm"
                        >
                            <Activity className="h-3.5 w-3.5" />
                            <span>Generate Reports</span>
                        </Link>
                    </div>
                </div>

                {/* Sleek Institutional Status Banner */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-govt-green via-govt-green-600 to-[#002B12] text-white border border-govt-green-700/50 p-5 sm:p-6 shadow-sm">
                    {/* Subtle watermarked shield */}
                    <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
                        <Building2 className="w-56 h-56" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                        <div className="space-y-1.5 max-w-2xl">
                            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-md bg-white/10 border border-white/15 text-govt-gold-200 text-xs font-semibold">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span>TEVTA Punjab • Accredited Technical Institute</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                                GTTI Rahim Yar Khan Central Management
                            </h2>
                            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
                                Real-time governance over candidate admissions, technical trade enrollments, classroom biometric attendance, workshop inventories, and provincial TEVTA reports.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <div className="px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-center min-w-[100px]">
                                <p className="text-[10px] text-emerald-200 font-semibold uppercase tracking-wider">Academic Session</p>
                                <p className="text-xs sm:text-sm font-bold text-white mt-0.5">2026 - 2027</p>
                            </div>
                            <div className="px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-center min-w-[100px]">
                                <p className="text-[10px] text-emerald-200 font-semibold uppercase tracking-wider">System Status</p>
                                <p className="text-xs sm:text-sm font-bold text-govt-gold-200 mt-0.5 flex items-center justify-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>Operational</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4 Clean Dynamic KPI Cards (Directly Inspired by Reference Design) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
                    {kpiData.map((stat) => (
                        <KpiCard
                            key={stat.title}
                            title={stat.title}
                            value={stat.value}
                            badge={stat.badge}
                            description={stat.description}
                            icon={stat.icon}
                            colorVariant={stat.colorVariant}
                            trend={stat.trend}
                        />
                    ))}
                </div>

                {/* 2-Column Balanced Executive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left 7 Cols: RECENT SYSTEM ANNOUNCEMENTS */}
                    <div className="lg:col-span-7">
                        <Card className="h-full flex flex-col justify-between">
                            <div>
                                <CardHeader>
                                    <div className="flex items-center space-x-2.5">
                                        <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-govt-gold-600">
                                            <Megaphone className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <CardTitle>Recent Institutional Announcements</CardTitle>
                                            <CardDescription>
                                                Live official circulars broadcast to trainees, instructors, and administrative staff
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Link
                                        href={route('admin.announcements.index')}
                                        className="text-xs text-govt-green hover:text-govt-green-600 font-bold transition flex items-center space-x-1"
                                    >
                                        <span>View All</span>
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </Link>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    {recentAnnouncements.map((announcement) => (
                                        <div
                                            key={announcement.id}
                                            className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-govt-green/30 hover:bg-white transition-all space-y-2"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <Badge
                                                        variant={
                                                            announcement.target_audience === 'all'
                                                                ? 'gold'
                                                                : announcement.target_audience === 'students'
                                                                ? 'blue'
                                                                : 'green'
                                                        }
                                                        size="xs"
                                                    >
                                                        {announcement.target_audience === 'all'
                                                            ? 'All Portals'
                                                            : announcement.target_audience.toUpperCase()}
                                                    </Badge>
                                                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                                                        {announcement.title}
                                                    </h4>
                                                </div>
                                                <span className="text-[11px] text-slate-400 font-medium shrink-0">
                                                    {new Date(announcement.created_at).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                                                {announcement.message}
                                            </p>

                                            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                                                <span>Author: {announcement.creator?.name || 'Institutional Administrator'}</span>
                                                {announcement.expires_at && (
                                                    <span className="font-mono text-[10px]">
                                                        Valid until: {announcement.expires_at}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {recentAnnouncements.length === 0 && (
                                        <EmptyState
                                            icon={Megaphone}
                                            title="No Active Announcements"
                                            description="There are currently no active broadcast notices. Use the Broadcast Center to publish official circulars."
                                            action={
                                                <Link
                                                    href={route('admin.announcements.index')}
                                                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
                                                >
                                                    <span>Create Notice</span>
                                                </Link>
                                            }
                                        />
                                    )}
                                </CardContent>
                            </div>

                            <CardFooter>
                                <span>Automated TEVTA Notification Hub</span>
                                <span className="font-semibold text-govt-green">Official GTTI Circulars</span>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Right 5 Cols: COMMAND CENTER MODULES */}
                    <div className="lg:col-span-5">
                        <Card className="h-full flex flex-col justify-between">
                            <div>
                                <CardHeader>
                                    <div className="flex items-center space-x-2.5">
                                        <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                                            <TrendingUp className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <CardTitle>Command Center Modules</CardTitle>
                                            <CardDescription>Direct access to institutional management suites</CardDescription>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Active Hub
                                    </span>
                                </CardHeader>

                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {quickModules.map((link) => {
                                            const Icon = link.icon;
                                            return (
                                                <Link
                                                    key={link.name}
                                                    href={link.href}
                                                    className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-govt-green/40 hover:bg-white hover:shadow-sm transition-all duration-150 flex flex-col justify-between group"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div
                                                            className={`h-8 w-8 rounded-lg border flex items-center justify-center ${link.color}`}
                                                        >
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        {link.count !== null && link.count > 0 && (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                                {link.count} pending
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-800 group-hover:text-govt-green transition-colors">
                                                            {link.name}
                                                        </span>
                                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                                            {link.desc}
                                                        </p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </div>

                            <CardFooter>
                                <span className="flex items-center space-x-1.5">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="font-semibold text-slate-700">Services Online</span>
                                </span>
                                <span className="font-mono text-[11px] text-slate-400">GIIMS Core v2.0</span>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
