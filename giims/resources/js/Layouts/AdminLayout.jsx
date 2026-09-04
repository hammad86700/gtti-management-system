import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Building2,
    GraduationCap,
    Users,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Shield,
    Bell,
    ChevronDown,
    Search,
    BookOpen,
    Megaphone,
    FileCheck,
    Trophy,
    Award,
    ShieldCheck,
    Archive,
    ShieldAlert,
    Briefcase,
    FileSpreadsheet,
    History,
    CreditCard,
    Receipt,
    Clock,
    Sparkles,
    CheckCircle2,
    Send,
    Monitor
} from 'lucide-react';
import Dropdown from '@/Components/Dropdown';
import ErrorBoundary from '@/Components/ErrorBoundary';

export default function AdminLayout({ header, children }) {
    const { auth, site_settings: siteSettings = {} } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [period, setPeriod] = useState('Session');

    const navGroups = [
        {
            label: 'OVERVIEW',
            items: [
                {
                    name: 'Dashboard',
                    href: route('admin.dashboard'),
                    active: route().current('admin.dashboard') || route().current('dashboard'),
                    icon: LayoutDashboard,
                },
            ],
        },
        {
            label: 'ACADEMICS',
            items: [
                {
                    name: 'Students & Trainees',
                    href: route('admin.enrollments.index'),
                    active: route().current('admin.enrollments.*'),
                    icon: GraduationCap,
                    badge: 'Admitted',
                },
                {
                    name: 'Admissions Intake',
                    href: route('admin.applications.index'),
                    active: route().current('admin.applications.*'),
                    icon: FileCheck,
                    badge: 'Review',
                },
                {
                    name: 'Merit Gazettes',
                    href: route('admin.merit.index'),
                    active: route().current('admin.merit.*'),
                    icon: Trophy,
                },
                {
                    name: 'Examinations',
                    href: route('admin.result-approvals.index'),
                    active: route().current('admin.result-approvals.*'),
                    icon: Award,
                    badge: 'Results',
                },
                {
                    name: 'Trades & Curriculum',
                    href: route('admin.organization.index'),
                    active: route().current('admin.organization.*'),
                    icon: Building2,
                },
                {
                    name: 'Admission Campaigns',
                    href: route('admin.campaigns.index'),
                    active: route().current('admin.campaigns.*'),
                    icon: Megaphone,
                },
            ],
        },
        {
            label: 'FINANCE',
            items: [
                {
                    name: 'Fees & Challans',
                    href: route('admin.clearances.index'),
                    active: route().current('admin.clearances.*'),
                    icon: CreditCard,
                    badge: 'Dues',
                },
                {
                    name: 'Payroll & Claims',
                    href: route('admin.reports.index'),
                    active: route().current('admin.reports.*'),
                    icon: Receipt,
                },
            ],
        },
        {
            label: 'OPERATIONS',
            items: [
                {
                    name: 'Campus Broadcasts',
                    href: route('admin.announcements.index'),
                    active: route().current('admin.announcements.*'),
                    icon: Megaphone,
                    badge: 'Live',
                },
                {
                    name: 'Workshop Store',
                    href: route('admin.inventory.index'),
                    active: route().current('admin.inventory.*'),
                    icon: Archive,
                    badge: 'Tools',
                },
                {
                    name: 'Discipline Cases',
                    href: route('admin.discipline.index'),
                    active: route().current('admin.discipline.*'),
                    icon: ShieldAlert,
                },
                {
                    name: 'Alumni & Placements',
                    href: route('admin.alumni.index'),
                    active: route().current('admin.alumni.*'),
                    icon: Briefcase,
                },
                {
                    name: 'OJT Apprenticeship',
                    href: route('admin.apprenticeships.index'),
                    active: route().current('admin.apprenticeships.*'),
                    icon: Briefcase,
                    badge: 'TEVTA',
                },
            ],
        },
        {
            label: 'SYSTEM ADMIN',
            items: [
                {
                    name: 'Faculty Allocations',
                    href: route('allocations.index'),
                    active: route().current('allocations.*') || route().current('admin.allocations.*'),
                    icon: BookOpen,
                },
                {
                    name: 'Staff Management',
                    href: route('admin.staff.index'),
                    active: route().current('admin.staff.*') || route().current('staff.*'),
                    icon: Users,
                },
                {
                    name: 'System Logs',
                    href: route('admin.system-logs.index'),
                    active: route().current('admin.system-logs.*'),
                    icon: History,
                },
                {
                    name: 'System Settings',
                    href: route('admin.settings.index'),
                    active: route().current('admin.settings.*'),
                    icon: Settings,
                },
                {
                    name: 'Reports Hub',
                    href: route('admin.reports.index'),
                    active: route().current('admin.reports.*'),
                    icon: FileSpreadsheet,
                    badge: 'TEVTA',
                },
            ],
        },
        {
            label: 'EXECUTIVE OVERSIGHT (STAFF DESKS)',
            items: [
                {
                    name: 'Admission Clerk Desk',
                    href: route('clerk.dashboard'),
                    active: route().current('clerk.dashboard'),
                    icon: FileCheck,
                    badge: 'Clerk Desk',
                },
                {
                    name: 'Bulk Test Scheduler',
                    href: route('clerk.scheduler.index'),
                    active: route().current('clerk.scheduler.*'),
                    icon: Send,
                    badge: 'Admissions',
                },
                {
                    name: 'Bank Scroll Desk',
                    href: route('clerk.fees.reconciliation'),
                    active: route().current('clerk.fees.*'),
                    icon: CreditCard,
                    badge: 'Auto-Clear',
                },
                {
                    name: 'Faculty Academic Portal',
                    href: route('teacher.dashboard'),
                    active: route().current('teacher.dashboard'),
                    icon: Users,
                    badge: 'Faculty',
                },
                {
                    name: 'CBT Exam System Hub',
                    href: route('teacher.exam-system.dashboard'),
                    active: route().current('teacher.exam-system.*') || route().current('exam-system.*'),
                    icon: Monitor,
                    badge: 'CBT Hub',
                },
                {
                    name: 'Gate Security Terminal',
                    href: route('security.gate.index'),
                    active: route().current('security.gate.*'),
                    icon: ShieldCheck,
                    badge: 'Gatehouse',
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-[#F4F6F8] text-slate-900 flex flex-col antialiased font-sans">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Institutional Sidebar - Deep Pine Green #0B3B24 */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0B3B24] border-r border-[#124E31]/40 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-xl ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand Header */}
                <div className="h-18 px-5 flex items-center justify-between border-b border-emerald-900/60 shrink-0 bg-[#082D1B]/60">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shadow-inner shrink-0">
                            <Shield className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center space-x-1.5">
                                <span className="font-extrabold text-base tracking-wider text-white font-serif">GTTI RYK</span>
                                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    Admin
                                </span>
                            </div>
                            <p className="text-[11px] text-emerald-200/70 font-medium truncate">
                                {siteSettings.institute_short_name || 'Govt. Technical Training Inst.'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800/40 focus:outline-none"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Institute Status Chip */}
                <div className="p-3 mx-4 my-3 rounded-xl bg-[#082D1B] border border-emerald-900/60 shrink-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
                            Institutional ERP
                        </span>
                        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>Live</span>
                        </span>
                    </div>
                    <p className="text-xs font-semibold text-white truncate">Govt. Technical Training Inst.</p>
                    <p className="text-[11px] text-emerald-200/60 font-mono">TEVTA Rahim Yar Khan (P-31)</p>
                </div>

                {/* Navigation Links Grouped */}
                <nav className="flex-1 px-3 space-y-4 overflow-y-auto py-2">
                    {navGroups.map((group) => (
                        <div key={group.label} className="space-y-1">
                            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-400/60">
                                {group.label}
                            </div>
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = item.active;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                                            isActive
                                                ? 'bg-[#175C3B] text-white font-semibold shadow-sm'
                                                : 'text-emerald-100/70 hover:text-white hover:bg-emerald-800/40'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-300' : 'text-emerald-300/60'}`} />
                                            <span className="truncate">{item.name}</span>
                                        </div>
                                        {item.badge && (
                                            <span
                                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                                    isActive
                                                        ? 'bg-emerald-400/20 text-emerald-100 border border-emerald-400/30'
                                                        : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                                                }`}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Sidebar Footer / User Identity */}
                <div className="p-3.5 border-t border-emerald-900/60 bg-[#082D1B] shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="h-8 w-8 rounded-lg bg-[#175C3B] border border-emerald-400/30 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                                <p className="text-[10px] text-emerald-300/60 truncate">{user.email}</p>
                            </div>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="p-1.5 rounded-lg text-emerald-300/70 hover:text-rose-400 hover:bg-rose-950/30 transition"
                            title="Sign Out"
                        >
                            <LogOut className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Wrapper */}
            {/* Main Wrapper */}
            <div className="lg:pl-72 flex flex-col flex-1 min-h-screen">
                {/* Sticky Global Top Navbar */}
                <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-xs">
                    {/* Left: Mobile Toggle & Institutional Breadcrumb */}
                    <div className="flex items-center space-x-3 shrink-0">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-[#0B3B24] hover:bg-slate-100 focus:outline-none"
                            aria-label="Open sidebar"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div className="flex items-center space-x-2 text-xs font-medium">
                            <span className="font-bold text-[#0B3B24] tracking-tight">GIIMS Portal</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600 font-semibold hidden sm:inline">Session 2026–2027</span>
                        </div>
                    </div>

                    {/* Center: Centralized Floating Global Search */}
                    <div className="hidden md:flex items-center relative flex-1 max-w-md mx-6">
                        <Search className="absolute left-3.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search students, staff, batches, records..."
                            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-full text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400 shadow-xs transition"
                        />
                    </div>

                    {/* Right: Period Toggle Pills, Notifications & User Profile Pill */}
                    <div className="flex items-center space-x-2.5 shrink-0">
                        {/* Period Toggle Segmented Control */}
                        <div className="hidden sm:inline-flex p-0.5 bg-slate-100 rounded-full border border-slate-200 text-xs font-semibold">
                            {['Week', 'Month', 'Session'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPeriod(p)}
                                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition ${
                                        period === p
                                            ? 'bg-[#0B3B24] text-white shadow-xs font-semibold'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        {/* Notification Bell with Badge */}
                        <Link
                            href={route('admin.announcements.index')}
                            className="relative p-2 rounded-full text-slate-500 hover:text-[#0B3B24] hover:bg-slate-100 transition"
                            title="Institutional Notices"
                        >
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                        </Link>

                        {/* User Profile Pill */}
                        <div className="relative">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium transition shadow-xs focus:outline-none"
                                    >
                                        <div className="h-7 w-7 rounded-full bg-[#0B3B24] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                        </div>
                                        <div className="hidden lg:block text-left pr-1">
                                            <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[110px]">
                                                {user.name}
                                            </p>
                                            <span className="text-[10px] text-slate-400 font-medium">Principal</span>
                                        </div>
                                        <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            <span className="hidden sm:inline">Active</span>
                                        </span>
                                        <ChevronDown className="h-3 w-3 text-slate-400" />
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content contentClasses="py-1 bg-white border border-slate-200 text-slate-700 shadow-xl rounded-2xl min-w-[200px]">
                                    <div className="px-4 py-2.5 border-b border-slate-100 text-xs">
                                        <p className="font-bold text-slate-900 truncate">{user.name}</p>
                                        <p className="text-slate-500 truncate text-[11px]">{user.email}</p>
                                        <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                            Principal Administrator
                                        </span>
                                    </div>
                                    <Dropdown.Link
                                        href={route('clerk.applications.index')}
                                        className="text-xs text-slate-600 hover:bg-slate-50 hover:text-[#0B3B24] flex items-center justify-between"
                                    >
                                        <span>Clerk Scrutiny Desk</span>
                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">Ops</span>
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('clerk.fees.reconciliation')}
                                        className="text-xs text-slate-600 hover:bg-slate-50 hover:text-[#0B3B24] flex items-center justify-between"
                                    >
                                        <span>Bank Fee Reconciliation</span>
                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Auto</span>
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('teacher.exam-system.dashboard')}
                                        className="text-xs text-slate-600 hover:bg-slate-50 hover:text-[#0B3B24] flex items-center justify-between"
                                    >
                                        <span>CBT Exam System</span>
                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">CBT</span>
                                    </Dropdown.Link>
                                    <div className="border-t border-slate-100 my-1" />
                                    <Dropdown.Link
                                        href={route('profile.edit')}
                                        className="text-xs text-slate-600 hover:bg-slate-50 hover:text-[#0B3B24]"
                                    >
                                        Profile Settings
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('admin.settings.index')}
                                        className="text-xs text-slate-600 hover:bg-slate-50 hover:text-[#0B3B24]"
                                    >
                                        System Settings
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold"
                                    >
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </header>

                {/* Page Sub-Header / Action Ribbon (Rendered when page provides a header prop) */}
                {header && (
                    <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-4 shadow-2xs">
                        {header}
                    </div>
                )}

                {/* Page Main Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <ErrorBoundary>
                        {children}
                    </ErrorBoundary>
                </main>
            </div>
        </div>
    );
}
