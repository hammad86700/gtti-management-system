import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import {
    BookOpen,
    Users,
    Layers,
    Calendar,
    Sparkles,
    Clock,
    FileText,
    CheckCircle2,
    Building2,
    Award,
    ArrowRight,
    GraduationCap,
    Inbox,
    PlusCircle,
    Activity,
    CalendarDays,
    ClipboardCheck,
    Megaphone,
    Monitor,
    Send,
    X,
    MapPin,
    Package,
    Receipt,
    ShieldCheck,
    Boxes,
    Wrench,
    AlertCircle,
    Key,
    Smartphone,
    Copy,
    Check,
    RefreshCw,
    Tv,
    Sliders,
    UserCheck,
    CheckCheck,
    Navigation,
    Eye
} from 'lucide-react';
import KpiCard from '@/Components/UI/KpiCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/UI/Card';
import Badge from '@/Components/UI/Badge';
import Tabs from '@/Components/UI/Tabs';
import EmptyState from '@/Components/UI/EmptyState';

export default function Dashboard({
    batches = [],
    announcements = [],
    consumables = [],
    assignedAssets = [],
    visitingStats = null,
    locationPresets = []
}) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [activeTab, setActiveTab] = useState('batches'); // 'batches' | 'consumables' | 'property'
    const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
    const [generatingPinBatchId, setGeneratingPinBatchId] = useState(null);
    const [copiedBatchId, setCopiedBatchId] = useState(null);
    const [boardModalBatchId, setBoardModalBatchId] = useState(null);

    // Area / Zone Selection Modal State
    const [zoneModalBatchId, setZoneModalBatchId] = useState(null);
    const [zoneForm, setZoneForm] = useState({
        location_name: '',
        latitude: 28.4212,
        longitude: 70.3023,
        radius_meters: 150,
    });
    const [isSavingZone, setIsSavingZone] = useState(false);

    // Trainee Check-Ins Review & Confirmation State
    const [reviewModalBatchId, setReviewModalBatchId] = useState(null);
    const [confirmingBatchId, setConfirmingBatchId] = useState(null);

    // LMS Gatekeeping & Trainee Roster Modal State
    const [rosterBatch, setRosterBatch] = useState(null);
    const [togglingLmsId, setTogglingLmsId] = useState(null);
    const [activatingBatchLms, setActivatingBatchLms] = useState(false);

    const handleToggleLms = (enrollmentId) => {
        setTogglingLmsId(enrollmentId);
        router.post(route('teacher.enrollments.toggle-lms', enrollmentId), {}, {
            preserveScroll: true,
            onFinish: () => setTogglingLmsId(null),
        });
    };

    const handleActivateBatchLms = (batchId) => {
        setActivatingBatchLms(true);
        router.post(route('teacher.batches.activate-lms', batchId), {}, {
            preserveScroll: true,
            onFinish: () => setActivatingBatchLms(false),
        });
    };

    const handleGenerateBatchPin = (batchId) => {
        setGeneratingPinBatchId(batchId);
        router.post(route('teacher.attendance.generate-batch-pin', batchId), {}, {
            preserveScroll: true,
            onFinish: () => setGeneratingPinBatchId(null),
        });
    };

    const handleCopyPin = (pin, batchId) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(pin);
            setCopiedBatchId(batchId);
            setTimeout(() => setCopiedBatchId(null), 2000);
        }
    };

    const handleConfirmAll = (batchId) => {
        setConfirmingBatchId(batchId);
        router.post(route('teacher.attendance.confirm', batchId), {}, {
            preserveScroll: true,
            onFinish: () => setConfirmingBatchId(null),
        });
    };

    const handleConfirmSingle = (batchId, attendanceId) => {
        router.post(
            route('teacher.attendance.confirm', batchId),
            { attendance_id: attendanceId },
            { preserveScroll: true }
        );
    };

    const handleOpenZoneModal = (batch) => {
        setZoneModalBatchId(batch.id);
        setZoneForm({
            location_name: batch.today_session?.location_name || locationPresets[0]?.name || 'Computer Lab 1 & 2 (IT Wing)',
            latitude: batch.today_session?.latitude || locationPresets[0]?.latitude || 28.4212,
            longitude: batch.today_session?.longitude || locationPresets[0]?.longitude || 70.3023,
            radius_meters: batch.today_session?.radius_meters || 150,
        });
    };

    const handleSaveZone = (e) => {
        e.preventDefault();
        if (!zoneModalBatchId) return;
        setIsSavingZone(true);
        router.post(route('teacher.attendance.update-zone', zoneModalBatchId), zoneForm, {
            preserveScroll: true,
            onSuccess: () => setZoneModalBatchId(null),
            onFinish: () => setIsSavingZone(false),
        });
    };

    const handlePresetSelect = (presetName) => {
        const found = locationPresets.find((p) => p.name === presetName);
        if (found) {
            setZoneForm({
                location_name: found.name,
                latitude: found.latitude,
                longitude: found.longitude,
                radius_meters: found.radius_meters,
            });
        }
    };

    const activeBoardBatch = batches.find((b) => b.id === boardModalBatchId);
    const activeZoneBatch = batches.find((b) => b.id === zoneModalBatchId);
    const activeReviewBatch = batches.find((b) => b.id === reviewModalBatchId);

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        message: '',
        target_audience: 'students',
        expires_at: '',
    });

    const handleNoticeSubmit = (e) => {
        e.preventDefault();
        post(route('teacher.announcements.store'), {
            onSuccess: () => {
                reset();
                setIsNoticeModalOpen(false);
            },
        });
    };

    const totalTrainees = batches.reduce(
        (sum, b) => sum + (b.enrollments?.length || 0),
        0
    );

    const totalLessons = batches.reduce(
        (sum, b) => sum + (b.lesson_plans?.length || 0),
        0
    );

    const totalAssignments = batches.reduce(
        (sum, b) => sum + (b.assignments?.length || 0),
        0
    );

    const kpiData = [
        {
            title: 'Assigned Batches',
            value: batches.length,
            badge: 'Active Groups',
            description: 'Sections in teaching schedule',
            icon: Layers,
            colorVariant: 'purple',
            trend: 'neutral',
        },
        {
            title: 'Enrolled Trainees',
            value: totalTrainees,
            badge: 'Under Instruction',
            description: 'Active vocational students',
            icon: Users,
            colorVariant: 'green',
            trend: 'up',
        },
        {
            title: 'Lesson Plans',
            value: totalLessons,
            badge: 'CBT&A Competency',
            description: 'Curriculum lesson modules',
            icon: BookOpen,
            colorVariant: 'blue',
            trend: 'up',
        },
        {
            title: 'Assessments',
            value: totalAssignments,
            badge: 'Tasks & CBT',
            description: 'Coursework assignments set',
            icon: FileText,
            colorVariant: 'amber',
            trend: 'neutral',
        },
    ];

    const tabList = [
        { id: 'batches', label: 'Assigned Batches', icon: Layers, count: batches.length },
        { id: 'consumables', label: 'Workshop Consumables', icon: Boxes, count: consumables.length },
        { id: 'property', label: 'Assigned Property', icon: ShieldCheck, count: assignedAssets.length },
    ];

    const formattedDate = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    return (
        <AuthenticatedLayout>
            <Head title="Instructor Dashboard - GTTI RYK" />

            <div className="space-y-6">
                {/* Executive Page Greeting Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium mb-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Academic Instructional Wing</span>
                            <span>•</span>
                            <span>{formattedDate}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-slate-900 tracking-tight">
                            Instructor Command Center
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Academic Learning Management System • GTTI Rahim Yar Khan (TEVTA Punjab)
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsNoticeModalOpen(true)}
                            className="px-3.5 py-2 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                        >
                            <Megaphone className="h-3.5 w-3.5" />
                            <span>Post Notice</span>
                        </button>

                        <Link
                            href={route('teacher.demands.index')}
                            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                        >
                            <Package className="h-3.5 w-3.5 text-govt-green" />
                            <span>Material Demands</span>
                        </Link>

                        {visitingStats?.is_visiting && (
                            <Link
                                href={route('teacher.billing.index')}
                                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                            >
                                <Receipt className="h-3.5 w-3.5 text-indigo-600" />
                                <span>Faculty Billing</span>
                            </Link>
                        )}

                        <Link
                            href={route('teacher.leaves.index')}
                            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                        >
                            <CalendarDays className="h-3.5 w-3.5 text-amber-600" />
                            <span>Leave Requests</span>
                        </Link>

                        <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Faculty Portal</span>
                        </span>
                    </div>
                </div>
                {/* Sleek Instructor Greeting Banner */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-govt-green via-govt-green-600 to-[#002B12] text-white border border-govt-green-700/50 p-5 sm:p-6 shadow-sm">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5 max-w-3xl">
                            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-md bg-white/10 text-govt-gold-200 border border-white/15 text-xs font-semibold">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Technical Instruction & Practical Training</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                                Welcome, Instructor {user.name}!
                            </h2>
                            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                                Oversee your assigned trade batches, prepare CBT&A competency lesson plans, conduct biometric/GPS attendance, and assess student submissions.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <div className="px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-center">
                                <p className="text-[10px] text-emerald-200 font-semibold uppercase tracking-wider">Assigned Shift</p>
                                <p className="text-xs sm:text-sm font-bold text-white mt-0.5">Morning / Evening</p>
                            </div>
                            <div className="px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-center">
                                <p className="text-[10px] text-emerald-200 font-semibold uppercase tracking-wider">TEVTA Status</p>
                                <p className="text-xs sm:text-sm font-bold text-govt-gold-200 mt-0.5">Active Faculty</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Broadcast Announcements (If Any) */}
                {announcements.length > 0 && (
                    <div className="space-y-3">
                        {announcements.map((announcement) => (
                            <div
                                key={announcement.id}
                                className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 shadow-xs flex items-start space-x-3.5"
                            >
                                <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                                    <Megaphone className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="gold" size="xs">
                                                Circular Notice
                                            </Badge>
                                            <h4 className="font-bold text-xs sm:text-sm text-amber-950 truncate">
                                                {announcement.title}
                                            </h4>
                                        </div>
                                        <span className="text-[11px] text-amber-700 font-medium shrink-0">
                                            {new Date(announcement.created_at).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-amber-900/90 mt-1 leading-relaxed whitespace-pre-line">
                                        {announcement.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 4 Clean Academic KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
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

                {/* Visiting Faculty Remuneration Callout (When Applicable) */}
                {visitingStats?.is_visiting && (
                    <div className="p-5 rounded-xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-[#1e1b4b] text-white border border-indigo-700/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                                    Visiting Faculty Remuneration Engine
                                </span>
                                <span className="text-xs text-indigo-200 font-medium">
                                    Rate: PKR {Number(visitingStats.daily_rate).toLocaleString()} / Day
                                </span>
                            </div>
                            <h3 className="text-base sm:text-lg font-bold">
                                {visitingStats.current_month_days} Teaching Days Recorded This Month
                            </h3>
                            <p className="text-xs text-indigo-200">
                                Estimated Current Claim: <strong className="text-white font-mono">PKR {Number(visitingStats.estimated_earnings).toLocaleString()}</strong> • Auto-calculated from verified attendance logs
                            </p>
                        </div>
                        <Link
                            href={route('teacher.billing.index')}
                            className="shrink-0 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs shadow-sm transition"
                        >
                            <Receipt className="h-4 w-4" />
                            <span>Generate Remuneration Bill</span>
                        </Link>
                    </div>
                )}

                {/* Unified Tab Switcher */}
                <div className="flex items-center justify-between pt-2">
                    <Tabs
                        tabs={tabList}
                        activeTab={activeTab}
                        onChange={setActiveTab}
                    />
                </div>

                {/* TAB 1: ASSIGNED ACADEMIC BATCHES */}
                {activeTab === 'batches' && (
                    <div className="space-y-5">
                        {/* Daily Classroom Attendance PIN Authority */}
                        {batches.length > 0 && (
                            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-govt-green via-govt-green-600 to-[#002610] text-white border border-govt-green-700/60 shadow-sm space-y-4">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex items-start space-x-3.5">
                                        <div className="h-11 w-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
                                            <Key className="h-5 w-5 stroke-[2.5]" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                                                    Classroom Authority
                                                </span>
                                                <span className="text-xs text-emerald-200 font-semibold flex items-center space-x-1">
                                                    <Smartphone className="h-3.5 w-3.5" />
                                                    <span>Daily Student Self-Attendance PIN</span>
                                                </span>
                                            </div>
                                            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                                                Generate Daily Class PIN for Board / Screen
                                            </h3>
                                            <p className="text-xs text-emerald-100/90 leading-relaxed max-w-2xl">
                                                Generate a fresh 4-digit code each morning. Write it on the classroom whiteboard or project it on the screen so students can enter it in their GIIMS portal upon entering class.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                        {batches.map((batch) => {
                                            const hasPin = Boolean(batch.today_session?.daily_pin);
                                            return (
                                                <button
                                                    key={batch.id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (hasPin) {
                                                            setBoardModalBatchId(batch.id);
                                                        } else {
                                                            handleGenerateBatchPin(batch.id);
                                                        }
                                                    }}
                                                    disabled={generatingPinBatchId === batch.id}
                                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer ${
                                                        hasPin
                                                            ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                                                            : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                                                    }`}
                                                >
                                                    <Key className="h-3.5 w-3.5" />
                                                    <span>
                                                        {hasPin
                                                            ? `PIN: ${batch.today_session.daily_pin} (${batch.name})`
                                                            : `Generate PIN for ${batch.name}`}
                                                    </span>
                                                    {hasPin && <Tv className="h-3.5 w-3.5 ml-1" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {batches.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {batches.map((batch) => {
                                    const course = batch.course;
                                    const trade = course?.trade;
                                    const dept = trade?.program?.department;
                                    const traineesCount = batch.enrollments?.length || 0;
                                    const subjects = course?.subjects || [];
                                    const hasPin = Boolean(batch.today_session?.daily_pin);

                                    return (
                                        <Card key={batch.id} hover className="flex flex-col justify-between p-5 space-y-4">
                                            <div className="space-y-3">
                                                {/* Department & Shift Header */}
                                                <div className="flex items-center justify-between text-xs">
                                                    <Badge variant="green" size="xs">
                                                        {dept?.name || 'Department'}
                                                    </Badge>
                                                    <Badge variant="neutral" size="xs">
                                                        {batch.shift || 'Morning'} Shift
                                                    </Badge>
                                                </div>

                                                {/* Course & Batch Details */}
                                                <div>
                                                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                                                        {course?.name} ({trade?.name})
                                                    </h4>
                                                    <p className="text-xs text-govt-green font-semibold mt-0.5">
                                                        {batch.name} • Session {batch.session_year || '2026-2027'}
                                                    </p>
                                                </div>

                                                {/* Trainees & Duration Info with LMS Gatekeeping Button */}
                                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-semibold">Trainees</p>
                                                        <p className="font-bold text-slate-800">{traineesCount} Enrolled</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setRosterBatch(batch)}
                                                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                                                            title="Manage Trainee LMS Access & Orientation"
                                                        >
                                                            <ShieldCheck className="h-3.5 w-3.5 text-govt-green" />
                                                            <span>LMS Roster ({batch.enrollments?.filter(e => e.is_lms_active).length || 0}/{traineesCount})</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Curriculum Subject Modules */}
                                                {subjects.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                                                            Modules / Subjects ({subjects.length})
                                                        </p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {subjects.slice(0, 3).map((sub) => (
                                                                <span
                                                                    key={sub.id}
                                                                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                                                                >
                                                                    {sub.name}
                                                                </span>
                                                            ))}
                                                            {subjects.length > 3 && (
                                                                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px]">
                                                                    +{subjects.length - 3} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Classroom GPS Geofence Area */}
                                                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-200/70 text-xs">
                                                    <div className="flex items-center space-x-1.5 overflow-hidden">
                                                        <MapPin className="h-3.5 w-3.5 text-govt-green shrink-0" />
                                                        <span className="font-semibold text-slate-800 text-[11px] truncate">
                                                            {batch.today_session?.location_name || 'Computer Lab 1 & 2'}
                                                        </span>
                                                        <span className="text-[10px] text-emerald-700 shrink-0 font-medium">
                                                            ({batch.today_session?.radius_meters || 150}m)
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenZoneModal(batch)}
                                                        className="px-2 py-0.5 rounded-md text-[10px] font-bold text-govt-green hover:bg-emerald-100 transition cursor-pointer flex items-center space-x-1 shrink-0"
                                                        title="Select Classroom GPS Area"
                                                    >
                                                        <Sliders className="h-3 w-3" />
                                                        <span>Set Area</span>
                                                    </button>
                                                </div>

                                                {/* Daily Classroom Attendance PIN Box */}
                                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="font-bold text-slate-700 flex items-center space-x-1.5 text-[11px]">
                                                            <Key className="h-3.5 w-3.5 text-govt-green" />
                                                            <span>Today's Class PIN</span>
                                                        </span>
                                                        {hasPin ? (
                                                            <span className="text-[10px] font-semibold text-govt-green flex items-center space-x-1">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                <span>{batch.today_session.pin_checkins_count || 0} Checked In</span>
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-semibold text-slate-400">
                                                                Pending Generation
                                                            </span>
                                                        )}
                                                    </div>

                                                    {hasPin ? (
                                                        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-emerald-200">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-xl font-mono font-black tracking-widest text-slate-900">
                                                                    {batch.today_session.daily_pin}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400">
                                                                    (Active)
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setBoardModalBatchId(batch.id)}
                                                                    className="px-2 py-1 rounded-md bg-govt-green text-white hover:bg-govt-green-600 transition text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                                                                    title="Project on Classroom Screen or Write on Board"
                                                                >
                                                                    <Tv className="h-3 w-3" />
                                                                    <span>Board</span>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCopyPin(batch.today_session.daily_pin, batch.id)}
                                                                    className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                                                                    title="Copy PIN"
                                                                >
                                                                    {copiedBatchId === batch.id ? (
                                                                        <Check className="h-3.5 w-3.5 text-govt-green" />
                                                                    ) : (
                                                                        <Copy className="h-3.5 w-3.5" />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleGenerateBatchPin(batch.id)}
                                                                    disabled={generatingPinBatchId === batch.id}
                                                                    className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                                                                    title="Regenerate New PIN"
                                                                >
                                                                    <RefreshCw
                                                                        className={`h-3.5 w-3.5 ${
                                                                            generatingPinBatchId === batch.id ? 'animate-spin' : ''
                                                                        }`}
                                                                    />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleGenerateBatchPin(batch.id)}
                                                            disabled={generatingPinBatchId === batch.id}
                                                            className="w-full py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                                                        >
                                                            <Key className="h-3.5 w-3.5" />
                                                            <span>
                                                                {generatingPinBatchId === batch.id
                                                                    ? 'Generating PIN...'
                                                                    : "Generate Today's Class PIN"}
                                                            </span>
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Checked-In Trainees Presence & Final Teacher Confirmation */}
                                                {batch.today_session && (batch.today_session.attendances?.length > 0 ? (
                                                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="font-bold text-slate-800 flex items-center space-x-1.5 text-[11px]">
                                                                <UserCheck className="h-3.5 w-3.5 text-amber-700" />
                                                                <span>Today's Trainee Presence</span>
                                                            </span>
                                                            <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
                                                                {batch.today_session.attendances.length} Checked In
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center justify-between gap-2 text-xs">
                                                            <div className="text-[11px] text-slate-600">
                                                                {batch.today_session.pending_confirm_count > 0 ? (
                                                                    <span className="text-amber-800 font-semibold">
                                                                        ⚡ {batch.today_session.pending_confirm_count} awaiting confirmation
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                                                                        <CheckCheck className="h-3.5 w-3.5" />
                                                                        <span>All {batch.today_session.confirmed_count} confirmed present</span>
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center space-x-1.5 shrink-0">
                                                                {batch.today_session.pending_confirm_count > 0 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleConfirmAll(batch.id)}
                                                                        disabled={confirmingBatchId === batch.id}
                                                                        className="px-2.5 py-1 rounded-lg bg-govt-green hover:bg-govt-green-600 text-white font-bold text-[10px] transition flex items-center space-x-1 shadow-xs cursor-pointer"
                                                                        title="Confirm & lock all pending check-ins"
                                                                    >
                                                                        <Check className="h-3 w-3" />
                                                                        <span>{confirmingBatchId === batch.id ? 'Confirming...' : 'Confirm All'}</span>
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setReviewModalBatchId(batch.id)}
                                                                    className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[10px] transition flex items-center space-x-1 cursor-pointer"
                                                                    title="View student GPS & PIN check-in details"
                                                                >
                                                                    <Eye className="h-3 w-3" />
                                                                    <span>Review</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                                                        <span>No student check-ins yet today</span>
                                                        <span className="text-[10px] text-slate-400">0 of {traineesCount} Present</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Action Buttons Toolbar */}
                                            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                                                <Link
                                                    href={route('teacher.attendance.live', { batchId: batch.id })}
                                                    className="py-2 px-1.5 rounded-lg bg-govt-green hover:bg-govt-green-600 text-white text-[10px] font-bold transition flex items-center justify-center space-x-1 shadow-xs"
                                                    title="Start Live Geofenced Attendance Session"
                                                >
                                                    <MapPin className="h-3 w-3" />
                                                    <span>Live GPS</span>
                                                </Link>
                                                <Link
                                                    href={route('teacher.curriculum.index', batch.id)}
                                                    className="py-2 px-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[10px] font-black transition flex items-center justify-center space-x-1"
                                                    title="Day-by-Day Curriculum Roadmap"
                                                >
                                                    <Calendar className="h-3 w-3 text-emerald-700" />
                                                    <span>Roadmap</span>
                                                </Link>
                                                <Link
                                                    href={route('teacher.lesson-plans.index', { batchId: batch.id })}
                                                    className="py-2 px-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold transition flex items-center justify-center space-x-1"
                                                    title="Lesson Plans"
                                                >
                                                    <BookOpen className="h-3 w-3 text-blue-600" />
                                                    <span>Lessons</span>
                                                </Link>
                                                <Link
                                                    href={route('teacher.assignments.index', { batchId: batch.id })}
                                                    className="py-2 px-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold transition flex items-center justify-center space-x-1"
                                                    title="Coursework Assignments"
                                                >
                                                    <FileText className="h-3 w-3 text-purple-600" />
                                                    <span>Tasks</span>
                                                </Link>
                                                <Link
                                                    href={route('teacher.exams.index', { batchId: batch.id })}
                                                    className="py-2 px-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold transition flex items-center justify-center space-x-1"
                                                    title="Formal Result Locking"
                                                >
                                                    <Award className="h-3 w-3 text-amber-600" />
                                                    <span>Exams</span>
                                                </Link>
                                                <Link
                                                    href={route('teacher.online-tests.index', { batchId: batch.id })}
                                                    className="py-2 px-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold transition flex items-center justify-center space-x-1"
                                                    title="CBT Examination Engine"
                                                >
                                                    <Monitor className="h-3 w-3 text-indigo-600" />
                                                    <span>CBT</span>
                                                </Link>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Layers}
                                title="No Active Batches Assigned"
                                description="You have not been assigned to any active academic batches yet. Please contact the Principal or Trade Incharge to allocate your teaching modules."
                            />
                        )}
                    </div>
                )}

                {/* TAB 2: REMAINING CONSUMABLES & WORKSHOP STORE */}
                {activeTab === 'consumables' && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-2.5">
                                <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-govt-green">
                                    <Boxes className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle>Remaining Consumables Quota</CardTitle>
                                    <CardDescription>
                                        Real-time balance of approved materials. Conducting practicals automatically decrements quota.
                                    </CardDescription>
                                </div>
                            </div>
                            <Link
                                href={route('teacher.demands.index')}
                                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white font-bold text-xs shadow-xs transition"
                            >
                                <Package className="h-3.5 w-3.5" />
                                <span>Requisition Materials</span>
                            </Link>
                        </CardHeader>

                        <CardContent>
                            {consumables.length === 0 ? (
                                <EmptyState
                                    icon={Boxes}
                                    title="No Approved Consumable Quotas"
                                    description="You have not requisitioned workshop consumables or your demands are awaiting store approval."
                                    action={
                                        <Link
                                            href={route('teacher.demands.index')}
                                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
                                        >
                                            <span>Create Requisition</span>
                                        </Link>
                                    }
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {consumables.map((item) => {
                                        const inv = item.inventory_item;
                                        const demand = item.material_demand;
                                        const remaining = Math.max(0, item.approved_qty - item.consumed_qty);
                                        const percentage = item.approved_qty > 0 ? Math.round((item.consumed_qty / item.approved_qty) * 100) : 0;

                                        return (
                                            <div
                                                key={item.id}
                                                className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <Badge variant="purple" size="xs">
                                                            {demand?.batch?.name || 'Assigned Batch'}
                                                        </Badge>
                                                        <h4 className="font-bold text-sm text-slate-900 mt-1">
                                                            {inv?.name}
                                                        </h4>
                                                        <p className="text-[10px] text-slate-400 font-mono">
                                                            SKU: {inv?.sku || 'N/A'} • Unit: {inv?.unit}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                                                        remaining > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                                    }`}>
                                                        {remaining} {inv?.unit} left
                                                    </span>
                                                </div>

                                                <div className="space-y-1 text-xs">
                                                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                                                        <span>Approved: <strong>{item.approved_qty}</strong></span>
                                                        <span>Consumed: <strong className="text-indigo-600">{item.consumed_qty}</strong></span>
                                                    </div>
                                                    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                                                            style={{ width: `${Math.min(100, percentage)}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                                                        <span>Auto-consumption: {percentage}%</span>
                                                        <span>Remaining: {remaining}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* TAB 3: MY ASSIGNED PROPERTY (FIXED ASSETS) */}
                {activeTab === 'property' && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-2.5">
                                <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle>My Assigned Property (Fixed Assets Handover)</CardTitle>
                                    <CardDescription>
                                        Institutional equipment, workshop machinery, and IT assets allocated under your official custody.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {assignedAssets.length === 0 ? (
                                <EmptyState
                                    icon={ShieldCheck}
                                    title="No Fixed Assets Handed Over"
                                    description="The institute storekeeper has not logged any fixed asset property handovers under your name."
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="text-slate-500 border-b border-slate-100">
                                                <th className="pb-3 font-semibold">Fixed Asset Description</th>
                                                <th className="pb-3 font-semibold">Allocated Room / Lab Location</th>
                                                <th className="pb-3 font-semibold">Assigned Quantity</th>
                                                <th className="pb-3 font-semibold">Handover Date</th>
                                                <th className="pb-3 font-semibold">Status</th>
                                                <th className="pb-3 font-semibold text-right">Verification</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                            {assignedAssets.map((asset) => (
                                                <tr key={asset.id} className="hover:bg-slate-50/70 transition">
                                                    <td className="py-3">
                                                        <p className="font-bold text-slate-900">{asset.inventory_item?.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono">
                                                            SKU: {asset.inventory_item?.sku || 'N/A'} • Serial: {asset.id}
                                                        </p>
                                                    </td>
                                                    <td className="py-3 font-semibold text-slate-800">
                                                        <span className="inline-flex items-center space-x-1">
                                                            <MapPin className="h-3.5 w-3.5 text-rose-500" />
                                                            <span>{asset.room_location}</span>
                                                        </span>
                                                    </td>
                                                    <td className="py-3 font-bold text-slate-900 font-mono">
                                                        {asset.quantity} {asset.inventory_item?.unit}
                                                    </td>
                                                    <td className="py-3 text-slate-500">
                                                        {new Date(asset.assigned_at || asset.created_at).toLocaleDateString('en-GB')}
                                                    </td>
                                                    <td className="py-3">
                                                        <Badge variant="green" size="xs">
                                                            {asset.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-slate-500">
                                                            <CheckCircle2 className="h-3.5 w-3.5 text-govt-green" />
                                                            <span>Storekeeper Verified</span>
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* MODAL: POST NOTICE TO TRAINEES */}
                {isNoticeModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center space-x-2.5">
                                    <div className="h-9 w-9 rounded-xl bg-govt-green-50 text-govt-green flex items-center justify-center">
                                        <Megaphone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">
                                            Post Notice to Trainees
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Broadcast academic announcements and test directives
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsNoticeModalOpen(false)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleNoticeSubmit} className="p-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Notice Subject / Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="e.g. CBT Exam Revision Schedule / Workshop Guidelines"
                                        className="w-full text-xs rounded-xl border-slate-200 text-slate-900 focus:ring-govt-green-500 focus:border-govt-green-500"
                                    />
                                    {errors.title && (
                                        <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Audience *
                                        </label>
                                        <select
                                            value={data.target_audience}
                                            onChange={(e) => setData('target_audience', e.target.value)}
                                            className="w-full text-xs rounded-xl border-slate-200 text-slate-900 focus:ring-govt-green-500 focus:border-govt-green-500"
                                        >
                                            <option value="students">All Trainees & Students</option>
                                            <option value="all">Entire Institute (All)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Expiry Date (Optional)
                                        </label>
                                        <input
                                            type="date"
                                            value={data.expires_at}
                                            onChange={(e) => setData('expires_at', e.target.value)}
                                            className="w-full text-xs rounded-xl border-slate-200 text-slate-900 focus:ring-govt-green-500 focus:border-govt-green-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Notice Message / Directives *
                                    </label>
                                    <textarea
                                        rows={4}
                                        required
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        placeholder="Write clear instructions for your students regarding upcoming tests, assignments, practicals or class timing..."
                                        className="w-full text-xs rounded-xl border-slate-200 text-slate-900 focus:ring-govt-green-500 focus:border-govt-green-500"
                                    />
                                    {errors.message && (
                                        <p className="text-[11px] text-rose-500 mt-1">{errors.message}</p>
                                    )}
                                </div>

                                <div className="pt-2 flex items-center justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsNoticeModalOpen(false)}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-5 py-2 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                        <span>{processing ? 'Publishing...' : 'Publish Notice'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ────────────────────────────────────────────────────────
                    CLASSROOM BOARD DISPLAY & PROJECTOR VIEW MODAL
                ──────────────────────────────────────────────────────── */}
                {activeBoardBatch && (
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 transition-all"
                    >
                        <div className="bg-gradient-to-br from-govt-green via-govt-green-600 to-[#00240E] text-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl border-2 border-emerald-500/40 p-6 sm:p-8 relative overflow-hidden animate-in zoom-in-95 duration-150">
                            {/* Ambient Glow */}
                            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-white/20">
                                <div className="flex items-center space-x-3">
                                    <div className="h-11 w-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
                                        <Key className="h-6 w-6 stroke-[2.5]" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-amber-300 uppercase tracking-widest">
                                            TEVTA Punjab • GTTI Rahim Yar Khan
                                        </p>
                                        <h3 className="text-lg sm:text-xl font-black text-white">
                                            Daily Classroom Self-Attendance PIN
                                        </h3>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setBoardModalBatchId(null)}
                                    className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Batch Info */}
                            <div className="mt-4 text-center">
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15 text-emerald-200 border border-white/20">
                                    {activeBoardBatch.name} • {activeBoardBatch.shift || 'Morning'} Shift
                                </span>
                                <p className="text-xs text-emerald-100 mt-1">
                                    {activeBoardBatch.course?.name} ({activeBoardBatch.course?.trade?.name})
                                </p>
                            </div>

                            {/* Huge 4-Digit Display for Classroom Screen / Board */}
                            <div className="my-6 text-center py-6 px-4 rounded-2xl bg-black/30 border border-white/20 backdrop-blur-sm">
                                <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-300">
                                    Today's Classroom Attendance PIN
                                </p>
                                <div className="text-6xl sm:text-7xl lg:text-8xl font-mono font-black tracking-[0.3em] text-white my-3 select-all drop-shadow-lg text-center pl-[0.3em]">
                                    {activeBoardBatch.today_session?.daily_pin || '----'}
                                </div>
                                <div className="flex items-center justify-center space-x-2 text-xs text-emerald-200 font-semibold">
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>
                                        {activeBoardBatch.today_session?.pin_checkins_count || 0} of{' '}
                                        {activeBoardBatch.enrollments?.length || 0} Trainees Checked In
                                    </span>
                                </div>
                            </div>

                            {/* Student 3-Step Guide */}
                            <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 rounded-xl bg-white/10 border border-white/15">
                                <div>
                                    <span className="font-bold text-amber-300">Step 1</span>
                                    <p className="text-[11px] text-emerald-100 mt-0.5">Open Student Portal</p>
                                </div>
                                <div>
                                    <span className="font-bold text-amber-300">Step 2</span>
                                    <p className="text-[11px] text-emerald-100 mt-0.5">Tap "Mark Attendance"</p>
                                </div>
                                <div>
                                    <span className="font-bold text-amber-300">Step 3</span>
                                    <p className="text-[11px] text-emerald-100 mt-0.5">Enter PIN & Confirm</p>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-6 pt-4 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleCopyPin(
                                                activeBoardBatch.today_session?.daily_pin,
                                                activeBoardBatch.id
                                            )
                                        }
                                        className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer"
                                    >
                                        {copiedBatchId === activeBoardBatch.id ? (
                                            <Check className="h-4 w-4 text-amber-300" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                        <span>
                                            {copiedBatchId === activeBoardBatch.id ? 'PIN Copied' : 'Copy PIN'}
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleGenerateBatchPin(activeBoardBatch.id)}
                                        disabled={generatingPinBatchId === activeBoardBatch.id}
                                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                                    >
                                        <RefreshCw
                                            className={`h-4 w-4 ${
                                                generatingPinBatchId === activeBoardBatch.id ? 'animate-spin' : ''
                                            }`}
                                        />
                                        <span>Generate New PIN</span>
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setBoardModalBatchId(null)}
                                    className="px-5 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs transition hover:bg-slate-100 shadow-sm cursor-pointer"
                                >
                                    Close Board View
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ────────────────────────────────────────────────────────
                    CLASSROOM GPS AREA & BOUNDARY SELECTOR MODAL
                ──────────────────────────────────────────────────────── */}
                {activeZoneBatch && (
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 transition-all"
                    >
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 text-govt-green flex items-center justify-center font-bold">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">
                                            Select Classroom GPS Area
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {activeZoneBatch.name} • Students must be inside this boundary
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setZoneModalBatchId(null)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveZone} className="p-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Campus Location Preset
                                    </label>
                                    <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1">
                                        {locationPresets.map((preset) => (
                                            <button
                                                key={preset.name}
                                                type="button"
                                                onClick={() => handlePresetSelect(preset.name)}
                                                className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                                                    zoneForm.location_name === preset.name
                                                        ? 'bg-emerald-50/80 border-govt-green text-govt-green-900 font-bold'
                                                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                    <span>{preset.name}</span>
                                                </div>
                                                <span className="text-[10px] opacity-75 font-mono">
                                                    {preset.radius_meters}m
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2 border-t border-slate-100">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Location / Room Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={zoneForm.location_name}
                                            onChange={(e) =>
                                                setZoneForm({ ...zoneForm, location_name: e.target.value })
                                            }
                                            className="w-full text-xs rounded-xl border-slate-200 text-slate-900 focus:ring-govt-green-500 focus:border-govt-green-500"
                                            placeholder="e.g. Computer Lab 1 & 2 (IT Wing)"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                                Latitude
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                required
                                                value={zoneForm.latitude}
                                                onChange={(e) =>
                                                    setZoneForm({
                                                        ...zoneForm,
                                                        latitude: parseFloat(e.target.value),
                                                    })
                                                }
                                                className="w-full text-xs rounded-xl border-slate-200 text-slate-900 focus:ring-govt-green-500 focus:border-govt-green-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                                Longitude
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                required
                                                value={zoneForm.longitude}
                                                onChange={(e) =>
                                                    setZoneForm({
                                                        ...zoneForm,
                                                        longitude: parseFloat(e.target.value),
                                                    })
                                                }
                                                className="w-full text-xs rounded-xl border-slate-200 text-slate-900 focus:ring-govt-green-500 focus:border-govt-green-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                Geofence Radius (Meters)
                                            </label>
                                            <span className="text-xs font-bold font-mono text-govt-green">
                                                {zoneForm.radius_meters}m
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {[50, 100, 120, 150, 200, 350].map((r) => (
                                                <button
                                                    key={r}
                                                    type="button"
                                                    onClick={() => setZoneForm({ ...zoneForm, radius_meters: r })}
                                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                                        zoneForm.radius_meters === r
                                                            ? 'bg-govt-green text-white'
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {r}m
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setZoneModalBatchId(null)}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSavingZone}
                                        className="px-5 py-2 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                                    >
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span>{isSavingZone ? 'Saving...' : 'Set Classroom Area'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ────────────────────────────────────────────────────────
                    TRAINEE CHECK-INS REVIEW & FINAL CONFIRMATION MODAL
                ──────────────────────────────────────────────────────── */}
                {activeReviewBatch && (
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 transition-all"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
                            {/* Header */}
                            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                                        <UserCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">
                                            Today's Trainee Check-Ins: {activeReviewBatch.name}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Session PIN:{' '}
                                            <strong className="font-mono text-govt-green">
                                                {activeReviewBatch.today_session?.daily_pin || 'Pending'}
                                            </strong>{' '}
                                            • Location: {activeReviewBatch.today_session?.location_name}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {activeReviewBatch.today_session?.pending_confirm_count > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => handleConfirmAll(activeReviewBatch.id)}
                                            disabled={confirmingBatchId === activeReviewBatch.id}
                                            className="px-3.5 py-1.5 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                                        >
                                            <CheckCheck className="h-4 w-4" />
                                            <span>
                                                {confirmingBatchId === activeReviewBatch.id
                                                    ? 'Confirming...'
                                                    : `Confirm All (${activeReviewBatch.today_session.pending_confirm_count})`}
                                            </span>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setReviewModalBatchId(null)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Trainees List Body */}
                            <div className="p-5 overflow-y-auto space-y-3 grow">
                                {activeReviewBatch.today_session?.attendances?.length > 0 ? (
                                    <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden">
                                        {activeReviewBatch.today_session.attendances.map((att) => (
                                            <div
                                                key={att.id}
                                                className="p-3.5 bg-white hover:bg-slate-50/80 transition flex items-center justify-between gap-3"
                                            >
                                                <div className="flex items-center space-x-3 min-w-0">
                                                    <div
                                                        className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                                            att.is_confirmed
                                                                ? 'bg-emerald-100 text-emerald-900'
                                                                : 'bg-amber-100 text-amber-900'
                                                        }`}
                                                    >
                                                        {att.student_name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-slate-900 truncate">
                                                            {att.student_name}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500">
                                                            S/O {att.father_name} • Roll #{' '}
                                                            <span className="font-mono">{att.enrollment_number}</span>
                                                        </p>
                                                        <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5">
                                                            <span>Marked at {att.marked_at}</span>
                                                            {att.distance_meters !== null && (
                                                                <span className="text-emerald-700 font-semibold">
                                                                    • {Math.round(att.distance_meters)}m inside classroom
                                                                </span>
                                                            )}
                                                            <span className="text-slate-400">
                                                                • {att.method === 'pin_gps' ? 'GPS + PIN' : 'PIN'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2 shrink-0">
                                                    {att.is_confirmed ? (
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-govt-green border border-emerald-200 flex items-center space-x-1">
                                                            <CheckCheck className="h-3 w-3" />
                                                            <span>Confirmed Present</span>
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center space-x-2">
                                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                                Pending
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleConfirmSingle(activeReviewBatch.id, att.id)
                                                                }
                                                                className="px-3 py-1 rounded-lg bg-govt-green hover:bg-govt-green-600 text-white font-bold text-[10px] transition flex items-center space-x-1 shadow-xs cursor-pointer"
                                                            >
                                                                <Check className="h-3 w-3" />
                                                                <span>Confirm</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-500 text-xs">
                                        No trainees have checked in using the classroom PIN yet today.
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                                <span className="text-xs text-slate-500">
                                    Total:{' '}
                                    <strong className="text-slate-800 font-bold">
                                        {activeReviewBatch.today_session?.attendances?.length || 0}
                                    </strong>{' '}
                                    Trainees Checked In
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setReviewModalBatchId(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Trainee LMS Access & Orientation Modal */}
                {rosterBatch && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
                        <div className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 space-y-5 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-govt-green">
                                        Trade Faculty LMS Gatekeeping
                                    </span>
                                    <h3 className="text-lg font-black text-slate-900">
                                        {rosterBatch.name} — Trainee LMS Access Roster
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Course: {rosterBatch.course?.name} • Session {rosterBatch.session_year || '2026-2027'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setRosterBatch(null)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Summary & Bulk Action Bar */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center space-x-3 text-xs">
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Enrolled</span>
                                        <span className="font-bold text-slate-800">{rosterBatch.enrollments?.length || 0}</span>
                                    </div>
                                    <div className="h-6 w-px bg-slate-200" />
                                    <div>
                                        <span className="text-[10px] text-emerald-600 font-bold uppercase block">Active LMS</span>
                                        <span className="font-bold text-emerald-700">
                                            {rosterBatch.enrollments?.filter(e => e.is_lms_active).length || 0}
                                        </span>
                                    </div>
                                    <div className="h-6 w-px bg-slate-200" />
                                    <div>
                                        <span className="text-[10px] text-amber-600 font-bold uppercase block">Awaiting Orientation</span>
                                        <span className="font-bold text-amber-700">
                                            {rosterBatch.enrollments?.filter(e => !e.is_lms_active).length || 0}
                                        </span>
                                    </div>
                                </div>

                                {rosterBatch.enrollments?.some(e => !e.is_lms_active) && (
                                    <button
                                        type="button"
                                        disabled={activatingBatchLms}
                                        onClick={() => handleActivateBatchLms(rosterBatch.id)}
                                        className="px-4 py-2 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white font-black text-xs transition shadow-sm flex items-center space-x-1.5 shrink-0 disabled:opacity-50"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>{activatingBatchLms ? 'Activating Batch...' : '1-Click Activate All Inactive'}</span>
                                    </button>
                                )}
                            </div>

                            {/* Trainees List Table */}
                            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                                        <tr>
                                            <th className="py-2.5 px-3">Trainee Identity</th>
                                            <th className="py-2.5 px-3">Enrollment #</th>
                                            <th className="py-2.5 px-3 text-center">LMS Status</th>
                                            <th className="py-2.5 px-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {rosterBatch.enrollments && rosterBatch.enrollments.length > 0 ? (
                                            rosterBatch.enrollments.map((enr) => {
                                                const student = enr.student_profile?.user;
                                                const isActive = Boolean(enr.is_lms_active);

                                                return (
                                                    <tr key={enr.id} className="hover:bg-slate-50/60 transition">
                                                        <td className="py-2.5 px-3">
                                                            <div className="font-bold text-slate-900">{student?.name || 'Trainee'}</div>
                                                            <div className="text-[10px] text-slate-400">Father: {enr.student_profile?.father_name || 'N/A'}</div>
                                                        </td>
                                                        <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-slate-600">
                                                            {enr.enrollment_number || 'ENR-' + enr.id}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center">
                                                            {isActive ? (
                                                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                                    <span>✓ LMS Active</span>
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                                                    <span>⏳ Inactive (Orientation Pending)</span>
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-right">
                                                            <button
                                                                type="button"
                                                                disabled={togglingLmsId === enr.id}
                                                                onClick={() => handleToggleLms(enr.id)}
                                                                className={`px-3 py-1 rounded-lg font-bold text-xs transition disabled:opacity-50 ${
                                                                    isActive
                                                                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                                                                        : 'bg-govt-green hover:bg-govt-green-600 text-white shadow-xs'
                                                                }`}
                                                            >
                                                                {togglingLmsId === enr.id
                                                                    ? 'Updating...'
                                                                    : isActive
                                                                        ? 'Lock LMS'
                                                                        : 'Activate LMS'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="py-6 text-center text-slate-400 text-xs">
                                                    No trainees enrolled in this batch yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setRosterBatch(null)}
                                    className="py-2 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                                >
                                    Close Roster
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
