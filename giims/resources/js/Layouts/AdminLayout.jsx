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
    HelpCircle,
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
    History
} from 'lucide-react';
import Dropdown from '@/Components/Dropdown';
import ErrorBoundary from '@/Components/ErrorBoundary';

export default function AdminLayout({ header, children }) {
    const { auth, site_settings: siteSettings = {} } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const navGroups = [
        {
            label: 'Command Center & Intake',
            items: [
                {
                    name: 'Dashboard',
                    href: route('admin.dashboard'),
                    active: route().current('admin.dashboard') || route().current('dashboard'),
                    icon: LayoutDashboard,
                },
                {
                    name: 'Organization',
                    href: route('admin.organization.index'),
                    active: route().current('admin.organization.*'),
                    icon: Building2,
                    badge: '5 Depts',
                },
                {
                    name: 'Campaigns',
                    href: route('admin.campaigns.index'),
                    active: route().current('admin.campaigns.*'),
                    icon: Megaphone,
                    badge: 'Active',
                },
                {
                    name: 'Applications',
                    href: route('admin.applications.index'),
                    active: route().current('admin.applications.*'),
                    icon: FileCheck,
                    badge: 'Review',
                },
                {
                    name: 'Merit Lists',
                    href: route('admin.merit.index'),
                    active: route().current('admin.merit.*'),
                    icon: Trophy,
                    badge: 'Rankings',
                },
                {
                    name: 'Enrollments',
                    href: route('admin.enrollments.index'),
                    active: route().current('admin.enrollments.*'),
                    icon: GraduationCap,
                    badge: 'Admitted',
                },
            ],
        },
        {
            label: 'Academic & Operations',
            items: [
                {
                    name: 'Academic Allocations',
                    href: route('allocations.index'),
                    active: route().current('allocations.*') || route().current('admin.allocations.*'),
                    icon: BookOpen,
                    badge: 'Teaching',
                },
                {
                    name: 'Examinations',
                    href: route('admin.result-approvals.index'),
                    active: route().current('admin.result-approvals.*'),
                    icon: Award,
                    badge: 'Results',
                },
                {
                    name: 'Clearances',
                    href: route('admin.clearances.index'),
                    active: route().current('admin.clearances.*'),
                    icon: FileCheck,
                    badge: 'Audits',
                },
                {
                    name: 'Inventory & Store',
                    href: route('admin.inventory.index'),
                    active: route().current('admin.inventory.*'),
                    icon: Archive,
                    badge: 'Store',
                },
                {
                    name: 'Gate Security',
                    href: route('security.gate.index'),
                    active: route().current('security.gate.*'),
                    icon: ShieldCheck,
                    badge: 'Live',
                },
            ],
        },
        {
            label: 'Institutional Governance',
            items: [
                {
                    name: 'Discipline',
                    href: route('admin.discipline.index'),
                    active: route().current('admin.discipline.*'),
                    icon: ShieldAlert,
                    badge: 'Incidents',
                },
                {
                    name: 'Alumni & Placements',
                    href: route('admin.alumni.index'),
                    active: route().current('admin.alumni.*'),
                    icon: Briefcase,
                    badge: 'Jobs',
                },
                {
                    name: 'Announcements',
                    href: route('admin.announcements.index'),
                    active: route().current('admin.announcements.*'),
                    icon: Megaphone,
                    badge: 'Notice',
                },
                {
                    name: 'Reports Hub',
                    href: route('admin.reports.index'),
                    active: route().current('admin.reports.*'),
                    icon: FileSpreadsheet,
                    badge: 'TEVTA',
                },
                {
                    name: 'Staff Management',
                    href: route('admin.staff.index'),
                    active: route().current('admin.staff.*') || route().current('staff.*'),
                    icon: Users,
                    badge: 'Access',
                },
                {
                    name: 'System Logs',
                    href: route('admin.system-logs.index'),
                    active: route().current('admin.system-logs.*'),
                    icon: History,
                    badge: 'Audit',
                },
                {
                    name: 'System Settings',
                    href: route('admin.settings.index'),
                    active: route().current('admin.settings.*'),
                    icon: Settings,
                    badge: 'Config',
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAF8] text-slate-900 flex flex-col antialiased font-sans">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Institutional Sidebar */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-sm ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Gold Accent Bar */}
                <div className="h-1 bg-gradient-to-r from-govt-gold-400 via-govt-gold to-govt-gold-400 shrink-0" />

                {/* Logo & Institute Header */}
                <div className="h-18 px-5 flex items-center justify-between border-b border-slate-100 shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-govt-green flex items-center justify-center shadow-sm shrink-0">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center space-x-1.5">
                                <span className="font-extrabold text-base tracking-wider text-govt-green font-serif">GIIMS</span>
                                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded bg-govt-green-50 text-govt-green border border-govt-green-200">
                                    Admin
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium truncate">
                                {siteSettings.institute_short_name || 'GTTI Rahim Yar Khan'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Institute Status Chip */}
                <div className="p-3.5 mx-4 my-3 rounded-xl bg-govt-green-50/70 border border-govt-green-100 shrink-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-govt-green uppercase tracking-wider text-[10px]">
                            Active Institute
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            ● Live
                        </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 truncate">Govt. Technical Training Inst.</p>
                    <p className="text-[11px] text-slate-500">Code: GTTI-RYK (TEVTA Punjab)</p>
                </div>

                {/* Navigation Links Grouped */}
                <nav className="flex-1 px-3 space-y-4 overflow-y-auto py-2">
                    {navGroups.map((group) => (
                        <div key={group.label} className="space-y-1">
                            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {group.label}
                            </div>
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = item.active;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                                            isActive
                                                ? 'bg-govt-green text-white font-semibold shadow-sm'
                                                : 'text-slate-600 hover:text-govt-green hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2.5">
                                            <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                            <span>{item.name}</span>
                                        </div>
                                        {item.badge && (
                                            <span
                                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                                    isActive
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-slate-100 text-slate-600 border border-slate-200/60'
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
                <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="h-8 w-8 rounded-lg bg-govt-green-50 border border-govt-green-200 flex items-center justify-center text-xs font-bold text-govt-green shrink-0">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
                                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                            </div>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Sign Out"
                        >
                            <LogOut className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="lg:pl-72 flex flex-col flex-1 min-h-screen">
                {/* Top Navbar */}
                <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-card">
                    {/* Left: Hamburger & Breadcrumbs */}
                    <div className="flex items-center space-x-4 min-w-0">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-govt-green hover:bg-slate-100 focus:outline-none"
                            aria-label="Open sidebar"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div className="min-w-0">
                            {header || (
                                <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                                    <span className="font-bold text-govt-green">GTTI RYK</span>
                                    <span>/</span>
                                    <span className="text-slate-900 font-semibold truncate">Admin Command Center</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Search, Session Badge & User Profile */}
                    <div className="flex items-center space-x-3">
                        {/* Session Pill */}
                        <div className="hidden md:flex items-center space-x-2 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Session 2026-2027</span>
                        </div>

                        {/* Broadcast Link */}
                        <Link
                            href={route('admin.announcements.index')}
                            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                        >
                            <Bell className="h-3.5 w-3.5 text-govt-gold-600" />
                            <span>Notices</span>
                        </Link>

                        {/* User Dropdown */}
                        <div className="relative">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="flex items-center space-x-2 p-1.5 pr-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-medium transition focus:outline-none">
                                        <div className="h-7 w-7 rounded-lg bg-govt-green text-white font-bold flex items-center justify-center text-xs shadow-sm">
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <span className="hidden md:inline-block max-w-[120px] truncate font-semibold text-slate-800">
                                            {user.name}
                                        </span>
                                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content contentClasses="py-1 bg-white border border-slate-200 text-slate-700 shadow-lg rounded-xl">
                                    <div className="px-4 py-2 border-b border-slate-100 text-xs">
                                        <p className="font-bold text-slate-900 truncate">{user.name}</p>
                                        <p className="text-slate-500 truncate text-[11px]">{user.email}</p>
                                        <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-wider text-govt-green bg-govt-green-50 px-1.5 py-0.2 rounded border border-govt-green-200">
                                            Administrator
                                        </span>
                                    </div>
                                    <Dropdown.Link
                                        href={route('profile.edit')}
                                        className="text-xs text-slate-600 hover:bg-slate-50 hover:text-govt-green"
                                    >
                                        Profile Settings
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('admin.settings.index')}
                                        className="text-xs text-slate-600 hover:bg-slate-50 hover:text-govt-green"
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
