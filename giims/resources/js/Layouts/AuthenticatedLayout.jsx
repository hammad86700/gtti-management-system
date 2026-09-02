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
    BookOpen,
    Megaphone,
    FileCheck,
    Award,
    ShieldCheck,
    Archive,
    Briefcase,
    CalendarDays,
    Monitor,
    Package,
    Receipt,
    User,
    CheckCircle2,
    Layers
} from 'lucide-react';
import Dropdown from '@/Components/Dropdown';
import ErrorBoundary from '@/Components/ErrorBoundary';
import MobileBottomNav from '@/Components/MobileBottomNav';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, site_settings: siteSettings = {} } = usePage().props;
    const user = auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isAdmin = Boolean(
        user?.is_admin ||
        user?.roles?.some(r => ['super-admin', 'principal', 'admission-clerk', 'admin'].includes(r.slug))
    );
    const isTeacher = Boolean(
        user?.is_teacher ||
        user?.roles?.some(r => ['teacher', 'instructor', 'trade-incharge'].includes(r.slug))
    );
    const isSecurity = Boolean(
        user?.is_security ||
        user?.roles?.some(r => ['security-officer', 'security'].includes(r.slug))
    );

    // Determine role label & navigation groups
    let roleLabel = 'Trainee';
    let defaultBreadcrumb = 'Student Portal';
    let navGroups = [];

    if (isAdmin) {
        roleLabel = 'Admin';
        defaultBreadcrumb = 'Admin Console';
        navGroups = [
            {
                label: 'Command Center',
                items: [
                    {
                        name: 'Admin Dashboard',
                        href: route('admin.dashboard'),
                        active: route().current('admin.dashboard'),
                        icon: LayoutDashboard,
                    },
                    {
                        name: 'Admissions Review',
                        href: route('admin.applications.index'),
                        active: route().current('admin.applications.*'),
                        icon: FileCheck,
                        badge: 'Review',
                    },
                    {
                        name: 'Enrollments',
                        href: route('admin.enrollments.index'),
                        active: route().current('admin.enrollments.*'),
                        icon: GraduationCap,
                        badge: 'Admitted',
                    },
                    {
                        name: 'Reports Hub',
                        href: route('admin.reports.index'),
                        active: route().current('admin.reports.*'),
                        icon: FileText,
                        badge: 'TEVTA',
                    },
                    {
                        name: 'System Settings',
                        href: route('admin.settings.index'),
                        active: route().current('admin.settings.*'),
                        icon: Settings,
                    },
                ],
            },
        ];
    } else if (isTeacher) {
        roleLabel = 'Faculty';
        defaultBreadcrumb = 'Instructor Command Center';
        navGroups = [
            {
                label: 'Academic Workdesk',
                items: [
                    {
                        name: 'Instructor Dashboard',
                        href: route('teacher.dashboard'),
                        active: route().current('teacher.dashboard') || (route().current('teacher.*') && !route().current('teacher.leaves.*') && !route().current('teacher.demands.*') && !route().current('teacher.billing.*')),
                        icon: LayoutDashboard,
                    },
                    {
                        name: 'Trainee Leaves',
                        href: route('teacher.leaves.index'),
                        active: route().current('teacher.leaves.*'),
                        icon: CalendarDays,
                        badge: 'Approvals',
                    },
                    {
                        name: 'Material Demands',
                        href: route('teacher.demands.index'),
                        active: route().current('teacher.demands.*'),
                        icon: Package,
                        badge: 'Store',
                    },
                    {
                        name: 'Faculty Billing',
                        href: route('teacher.billing.index'),
                        active: route().current('teacher.billing.*'),
                        icon: Receipt,
                        badge: 'Claims',
                    },
                ],
            },
            {
                label: 'Institutional Profile',
                items: [
                    {
                        name: 'Profile Settings',
                        href: route('profile.edit'),
                        active: route().current('profile.edit'),
                        icon: User,
                    },
                ],
            },
        ];
    } else if (isSecurity) {
        roleLabel = 'Security';
        defaultBreadcrumb = 'Gate Security Portal';
        navGroups = [
            {
                label: 'Access Control',
                items: [
                    {
                        name: 'Gate Portal',
                        href: route('security.gate.index'),
                        active: route().current('security.gate.*'),
                        icon: ShieldCheck,
                        badge: 'Live',
                    },
                    {
                        name: 'Profile Settings',
                        href: route('profile.edit'),
                        active: route().current('profile.edit'),
                        icon: User,
                    },
                ],
            },
        ];
    } else {
        // Student / Trainee
        roleLabel = 'Trainee';
        defaultBreadcrumb = 'Student Academic Command Center';
        navGroups = [
            {
                label: 'Academic Command Center',
                items: [
                    {
                        name: 'Dashboard',
                        href: route('dashboard'),
                        active: route().current('dashboard'),
                        icon: LayoutDashboard,
                    },
                    {
                        name: 'CBT Examinations',
                        href: route('student.online-tests.index'),
                        active: route().current('student.online-tests.*'),
                        icon: Monitor,
                        badge: 'Tests',
                    },
                    {
                        name: 'LMS Coursework',
                        href: route('student.lms.index'),
                        active: route().current('student.lms.*'),
                        icon: BookOpen,
                        badge: 'Tasks',
                    },
                ],
            },
            {
                label: 'Student Services',
                items: [
                    {
                        name: 'Leave Applications',
                        href: route('student.leaves.index'),
                        active: route().current('student.leaves.*'),
                        icon: CalendarDays,
                    },
                    {
                        name: 'Clearance & Dues',
                        href: route('student.clearance.index'),
                        active: route().current('student.clearance.*'),
                        icon: Award,
                        badge: 'Audits',
                    },
                    {
                        name: 'Alumni & Placement',
                        href: route('student.alumni.index'),
                        active: route().current('student.alumni.*'),
                        icon: Briefcase,
                        badge: 'Jobs',
                    },
                    {
                        name: 'My Profile',
                        href: route('profile.edit'),
                        active: route().current('profile.edit'),
                        icon: User,
                    },
                ],
            },
        ];
    }

    return (
        <div className="min-h-screen bg-[#F8FAF8] text-slate-900 flex flex-col antialiased font-sans">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Institutional Sidebar (Role-Aware) */}
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
                                    {roleLabel}
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
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
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

            {/* Main Content Area */}
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
                                    <span className="text-slate-900 font-semibold truncate">{defaultBreadcrumb}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Session Badge & User Profile */}
                    <div className="flex items-center space-x-3">
                        <div className="hidden md:flex items-center space-x-2 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Session 2026-2027</span>
                        </div>

                        {/* User Dropdown */}
                        <div className="relative">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="flex items-center space-x-2 p-1.5 pr-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-semibold transition duration-150 focus:outline-none"
                                    >
                                        <div className="h-7 w-7 rounded-lg bg-govt-green text-white font-bold flex items-center justify-center text-xs shadow-sm">
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <span className="hidden md:inline-block max-w-[120px] truncate font-semibold text-slate-800">
                                            {user?.name}
                                        </span>
                                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content contentClasses="py-1 bg-white border border-slate-200 text-slate-700 shadow-lg rounded-xl">
                                    <div className="px-4 py-2 border-b border-slate-100 text-xs">
                                        <p className="font-bold text-slate-900 truncate">{user?.name}</p>
                                        <p className="text-slate-500 truncate text-[11px]">{user?.email}</p>
                                        <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-wider text-govt-green bg-govt-green-50 px-1.5 py-0.2 rounded border border-govt-green-200">
                                            {roleLabel}
                                        </span>
                                    </div>
                                    {isAdmin && (
                                        <Dropdown.Link href={route('admin.dashboard')} className="text-xs text-slate-600 hover:bg-slate-50 hover:text-govt-green">
                                            Admin Command Center
                                        </Dropdown.Link>
                                    )}
                                    {isTeacher && (
                                        <Dropdown.Link href={route('teacher.dashboard')} className="text-xs text-slate-600 hover:bg-slate-50 hover:text-govt-green">
                                            Instructor Dashboard
                                        </Dropdown.Link>
                                    )}
                                    <Dropdown.Link href={route('profile.edit')} className="text-xs text-slate-600 hover:bg-slate-50 hover:text-govt-green">
                                        Profile Settings
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

                {/* Main Content */}
                <main className={`flex-1 p-4 sm:p-6 lg:p-8 ${!isAdmin && !isTeacher ? 'pb-20 md:pb-8' : ''}`}>
                    <ErrorBoundary>
                        {children}
                    </ErrorBoundary>
                </main>

                {/* Mobile-First Bottom Navigation Bar for Students */}
                {!isAdmin && !isTeacher && <MobileBottomNav />}
            </div>
        </div>
    );
}
