import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    BookOpen,
    FileCheck,
    Send,
    Bell,
    LogOut,
    Menu,
    X,
    User,
    Shield,
    Sparkles,
    GraduationCap,
    Clock,
    ChevronRight,
    Search,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Award
} from 'lucide-react';

export default function ClerkLayout({ children, header }) {
    const { auth, flash = {} } = usePage().props;
    const user = auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isExecutive = Boolean(
        user?.is_super_admin ||
        user?.is_admin ||
        user?.roles?.some(r => ['super-admin', 'principal', 'admin', 'administrator'].includes(r.slug))
    );

    const navItems = [
        {
            name: 'Dashboard Overview',
            href: route('clerk.dashboard'),
            active: route().current('clerk.dashboard'),
            icon: LayoutDashboard,
            badge: 'Cockpit',
        },
        {
            name: 'Courses & Trades Catalog',
            href: route('clerk.courses.index'),
            active: route().current('clerk.courses.*'),
            icon: BookOpen,
            badge: 'Intake',
        },
        {
            name: 'Application Scrutiny Desk',
            href: route('clerk.applications.index'),
            active: route().current('clerk.applications.*'),
            icon: FileCheck,
            badge: 'Verify',
        },
        {
            name: 'Broadcast & Test Scheduler',
            href: route('clerk.scheduler.index'),
            active: route().current('clerk.scheduler.*'),
            icon: Send,
            badge: '1-Click',
        },
        {
            name: 'Bank Fee Reconciliation',
            href: route('clerk.fees.reconciliation'),
            active: route().current('clerk.fees.*'),
            icon: CreditCard,
            badge: 'Auto-Pay',
        },
        {
            name: 'Official Merit Lists',
            href: route('clerk.merit-lists.index'),
            active: route().current('clerk.merit-lists.*'),
            icon: Award,
            badge: 'Gazette',
        },
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased selection:bg-[#C1902F] selection:text-white">
            {/* Executive Authority Banner for Principal / Super Admin */}
            {isExecutive && (
                <div className="bg-[#0B3B24] border-b border-emerald-600/50 px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs text-white shadow-md z-50">
                    <div className="flex items-center space-x-2.5">
                        <div className="h-7 w-7 rounded-lg bg-white p-0.5 shadow-sm border border-emerald-400/40 flex items-center justify-center shrink-0">
                            <img src="/images/tevta-logo.png" alt="TEVTA" className="h-full w-full object-contain" />
                        </div>
                        <div>
                            <span className="font-extrabold uppercase tracking-wider text-[11px] text-emerald-300 mr-2">
                                Institutional Executive Oversight
                            </span>
                            <span className="text-emerald-100 hidden md:inline">
                                You are inspecting Admission Clerk Operations with Principal Authority.
                            </span>
                        </div>
                    </div>
                    <Link
                        href={route('admin.dashboard')}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm"
                    >
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        <span>Return to Admin Command Center</span>
                    </Link>
                </div>
            )}

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex flex-1">
                {/* Sidebar */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 lg:static ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="p-5 space-y-6">
                        {/* Institutional Brand */}
                        <div className="flex items-center justify-between">
                            <Link
                                href={isExecutive ? route('admin.dashboard') : route('clerk.dashboard')}
                                className="flex items-center space-x-3 group"
                            >
                                <div className="h-11 w-11 rounded-xl bg-white p-1 shadow-md border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                                    <img src="/images/tevta-logo.png" alt="TEVTA Punjab" className="h-full w-full object-contain" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#C1902F] block">
                                        GTTI Rahim Yar Khan
                                    </span>
                                    <h1 className="text-sm font-black text-white tracking-tight">
                                        Admission Clerk Portal
                                    </h1>
                                </div>
                            </Link>
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white lg:hidden"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Officer Status Badge */}
                        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center space-x-3">
                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                                isExecutive 
                                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' 
                                    : 'bg-[#C1902F]/10 border border-[#C1902F]/30 text-[#C1902F]'
                            }`}>
                                {user?.name?.charAt(0) || (isExecutive ? 'P' : 'C')}
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-xs font-bold text-white truncate">{user?.name}</div>
                                <div className={`text-[10px] font-mono flex items-center space-x-1 ${
                                    isExecutive ? 'text-emerald-400 font-bold' : 'text-amber-400'
                                }`}>
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>{isExecutive ? 'Principal (Executive Oversight)' : 'Admission Officer'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <nav className="space-y-1.5">
                            {isExecutive && (
                                <div className="mb-3 pb-3 border-b border-slate-800">
                                    <Link
                                        href={route('admin.dashboard')}
                                        className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-[#0B3B24] text-emerald-100 border border-emerald-600/50 hover:bg-[#124E31] transition shadow-sm"
                                    >
                                        <LayoutDashboard className="h-4 w-4 text-emerald-400" />
                                        <span>← Return to Admin Command</span>
                                    </Link>
                                </div>
                            )}

                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-3 mb-2">
                                Scrutiny Workdesk
                            </span>
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                                            item.active
                                                ? 'bg-[#C1902F] text-slate-950 shadow-lg shadow-amber-950/20'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Icon className={`h-4 w-4 ${item.active ? 'text-slate-950' : 'text-slate-400'}`} />
                                            <span>{item.name}</span>
                                        </div>
                                        {item.badge && (
                                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                                                item.active
                                                    ? 'bg-slate-950/20 text-slate-950 font-black'
                                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                            }`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Bottom Logout & Info */}
                    <div className="p-5 border-t border-slate-800 space-y-3">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 text-xs font-bold transition border border-slate-800"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                        </Link>

                        <div className="text-[10px] text-slate-500 text-center font-mono">
                            Operational Authority • TEVTA
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Top Navbar */}
                    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 lg:hidden"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                            {header}
                        </div>

                        <div className="flex items-center space-x-3">
                            {isExecutive && (
                                <Link
                                    href={route('admin.dashboard')}
                                    className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/50 text-emerald-300 hover:bg-emerald-800/70 border border-emerald-600/50 text-xs font-bold transition shadow-xs"
                                >
                                    <LayoutDashboard className="h-3.5 w-3.5 text-emerald-400" />
                                    <span>Executive Dashboard</span>
                                </Link>
                            )}

                            <Link
                                href={route('clerk.scheduler.index')}
                                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-bold transition"
                            >
                                <Send className="h-3.5 w-3.5" />
                                <span>Bulk Test Scheduler</span>
                            </Link>

                            <Link
                                href={route('clerk.applications.index')}
                                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#C1902F] hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-sm"
                            >
                                <FileCheck className="h-3.5 w-3.5" />
                                <span>Scrutiny Desk</span>
                            </Link>
                        </div>
                    </header>

                    {/* Page Canvas */}
                    <main className="flex-1 bg-[#070D12]">
                        {flash?.success && (
                            <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4">
                                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex items-center justify-between shadow-lg text-xs font-bold">
                                    <div className="flex items-center space-x-2.5">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                                        <span>{flash.success}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {flash?.error && (
                            <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4">
                                <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 flex items-center justify-between shadow-lg text-xs font-bold">
                                    <div className="flex items-center space-x-2.5">
                                        <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                                        <span>{flash.error}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
