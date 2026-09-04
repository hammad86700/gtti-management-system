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
    Layers,
    ShieldAlert,
    Search
} from 'lucide-react';
import Dropdown from '@/Components/Dropdown';
import ErrorBoundary from '@/Components/ErrorBoundary';
import MobileBottomNav from '@/Components/MobileBottomNav';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, site_settings: siteSettings = {} } = usePage().props;
    const user = auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [period, setPeriod] = useState('Session');

    const isAdmin = Boolean(
        user?.is_admin ||
        user?.roles?.some(r => ['super-admin', 'principal', 'admin', 'administrator'].includes(r.slug))
    );
    const isClerk = Boolean(
        user?.is_clerk ||
        user?.roles?.some(r => ['clerk', 'admission-clerk'].includes(r.slug))
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
                        active: route().current('teacher.dashboard') || (route().current('teacher.*') && !route().current('teacher.leaves.*') && !route().current('teacher.demands.*') && !route().current('teacher.billing.*') && !route().current('teacher.discipline.*')),
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
                    {
                        name: 'Disciplinary Actions',
                        href: route('teacher.discipline.index'),
                        active: route().current('teacher.discipline.*'),
                        icon: ShieldAlert,
                        badge: 'Requests',
                    },
                    {
                        name: 'Admission Entrance Tests',
                        href: route('teacher.admission-tests.index'),
                        active: route().current('teacher.admission-tests.*'),
                        icon: GraduationCap,
                        badge: 'Admissions',
                    },
                    {
                        name: 'GTTI Exam System',
                        href: route('teacher.exam-system.dashboard'),
                        active: route().current('teacher.exam-system.*') && !route().current('teacher.exam-system.interview'),
                        icon: Monitor,
                        badge: 'CBT Hub',
                    },
                    {
                        name: 'Interview & Viva Desk',
                        href: route('teacher.exam-system.interview'),
                        active: route().current('teacher.exam-system.interview'),
                        icon: Award,
                        badge: 'Viva',
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
    } else if (!user?.is_enrolled) {
        // Applicant (In Admission Stage)
        roleLabel = 'Applicant';
        defaultBreadcrumb = 'Applicant Admission Portal';
        navGroups = [
            {
                label: 'Admissions Pipeline',
                items: [
                    {
                        name: 'Admission Portal',
                        href: route('dashboard'),
                        active: route().current('dashboard'),
                        icon: LayoutDashboard,
                    },
                    {
                        name: 'Master Profile',
                        href: route('student.profile.edit'),
                        active: route().current('student.profile.*'),
                        icon: FileText,
                        badge: 'Step 1',
                    },
                    {
                        name: 'Submit Application',
                        href: route('student.application.create'),
                        active: route().current('student.application.*'),
                        icon: GraduationCap,
                        badge: 'Step 2',
                    },
                ],
            },
            {
                label: 'Account',
                items: [
                    {
                        name: 'My Account',
                        href: route('profile.edit'),
                        active: route().current('profile.edit'),
                        icon: User,
                    },
                ],
            },
        ];
    } else {
        // Enrolled Student / Trainee
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
                        href: route('student.profile.edit'),
                        active: route().current('student.profile.*'),
                        icon: User,
                    },
                ],
            },
        ];
    }

    return (
        <div className="min-h-screen bg-[#F4F6F8] text-slate-900 flex flex-col antialiased font-sans">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Institutional Sidebar (Role-Aware) - Deep Pine Green #0B3B24 */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0B3B24] border-r border-[#124E31]/40 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-xl ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Logo & Institute Header */}
                <div className="h-18 px-5 flex items-center justify-between border-b border-emerald-900/60 shrink-0 bg-[#082D1B]/60">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shadow-inner shrink-0">
                            <Shield className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center space-x-1.5">
                                <span className="font-extrabold text-base tracking-wider text-white font-serif">GIIMS</span>
                                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    {roleLabel}
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
                            Institutional Portal
                        </span>
                        <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>Live</span>
                        </span>
                    </div>
                    <p className="text-xs font-semibold text-white truncate">Govt. Technical Training Inst.</p>
                    <p className="text-[11px] text-emerald-200/60 font-mono">TEVTA RYK • {roleLabel} Desk</p>
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
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                                <p className="text-[10px] text-emerald-300/60 truncate">{user?.email}</p>
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

            {/* Main Content Area */}
            <div className="lg:pl-72 flex flex-col flex-1 min-h-screen">
                {/* Sticky Global Top Navbar */}
                <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-xs">
                    {/* Left: Mobile Toggle & Institutional Breadcrumbs */}
                    <div className="flex items-center space-x-3 shrink-0">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-[#0B3B24] hover:bg-slate-100 focus:outline-none"
                            aria-label="Open sidebar"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div className="flex items-center space-x-2 text-xs font-medium">
                            <span className="font-bold text-[#0B3B24] tracking-tight">GTTI RYK</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600 font-semibold hidden sm:inline">{defaultBreadcrumb}</span>
                        </div>
                    </div>

                    {/* Center: Centralized Floating Global Search */}
                    <div className="hidden md:flex items-center relative flex-1 max-w-md mx-6">
                        <Search className="absolute left-3.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search students, staff, records..."
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
                            href={isAdmin ? route('admin.announcements.index') : '#'}
                            className="relative p-2 rounded-full text-slate-500 hover:text-[#0B3B24] hover:bg-slate-100 transition"
                            title="Institutional Notices"
                        >
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                        </Link>

                        {/* User Dropdown */}
                        <div className="relative">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="flex items-center space-x-2.5 px-2.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium transition shadow-xs focus:outline-none"
                                    >
                                        <div className="h-7 w-7 rounded-lg bg-[#0B3B24] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div className="hidden lg:block text-left pr-1">
                                            <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[110px]">
                                                {user?.name}
                                            </p>
                                            <span className="text-[10px] text-slate-400 font-medium">{roleLabel}</span>
                                        </div>
                                        <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            <span className="hidden sm:inline">Active</span>
                                        </span>
                                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content contentClasses="py-1 bg-white border border-slate-200 text-slate-700 shadow-xl rounded-2xl min-w-[200px]">
                                    <div className="px-4 py-2.5 border-b border-slate-100 text-xs">
                                        <p className="font-bold text-slate-900 truncate">{user?.name}</p>
                                        <p className="text-slate-500 truncate text-[11px]">{user?.email}</p>
                                        <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                            {roleLabel} Portal
                                        </span>
                                    </div>
                                    {isAdmin && (
                                        <Dropdown.Link href={route('admin.dashboard')} className="text-xs text-slate-600 hover:bg-slate-50 hover:text-[#0B3B24]">
                                            Admin Command Center
                                        </Dropdown.Link>
                                    )}
                                    {isTeacher && (
                                        <Dropdown.Link href={route('teacher.dashboard')} className="text-xs text-slate-600 hover:bg-slate-50 hover:text-[#0B3B24]">
                                            Instructor Dashboard
                                        </Dropdown.Link>
                                    )}
                                    <Dropdown.Link href={route('profile.edit')} className="text-xs text-slate-600 hover:bg-slate-50 hover:text-[#0B3B24]">
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

                {/* Page Sub-Header / Action Ribbon (Rendered when page provides a header prop) */}
                {header && (
                    <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-4 shadow-2xs">
                        {header}
                    </div>
                )}

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
