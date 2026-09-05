import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    GraduationCap,
    Award,
    CheckCircle2,
    Clock,
    AlertCircle,
    Calendar,
    Building2,
    BookOpen,
    Shield,
    Sparkles,
    ArrowRight,
    FileText,
    Activity,
    CalendarDays,
    Briefcase,
    Megaphone,
    Monitor,
    AlertTriangle,
    ChevronRight,
    ExternalLink,
    Play,
    User,
    Check,
    MapPin,
    Navigation,
    ShieldCheck,
    RefreshCw,
    Key,
    Smartphone,
    X,
    ShieldAlert,
    Ban,
    RotateCcw,
    Scale,
    Lock,
    Upload,
    Download,
    CreditCard,
    Printer,
    XCircle
} from 'lucide-react';
import KpiCard from '@/Components/UI/KpiCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/UI/Card';
import Badge from '@/Components/UI/Badge';
import EmptyState from '@/Components/UI/EmptyState';

export default function Dashboard({
    userData,
    sanction = null,
    announcements = [],
    meritLists = [],
    onlineTests = [],
    pendingTestsCount = 0,
    assignments = [],
    pendingAssignmentsCount = 0,
    lessonPlans = [],
    recentExams = [],
    attendanceStats = {},
    assignedTeachers = [],
    todaySession = null,
    todayAttendance = null
}) {
    const user = userData;
    const profile = user?.student_profile;
    const enrollments = profile?.enrollments || [];
    const applications = profile?.applications || [];

    const latestEnrollment = enrollments[0];
    const latestApplication = applications[0];

    // Strict contextual admission gate: Trainee is admitted ONLY when their application status is 'admitted' or 'confirmed'
    // AND their LMS enrollment is active. Otherwise, they are in the pre-admission applicant lifecycle.
    const isAdmitted = Boolean(latestEnrollment?.is_lms_active) && (
        latestApplication ? (latestApplication.status === 'admitted' || latestApplication.status === 'confirmed') : true
    );
    const isEnrolled = isAdmitted;
    const hasApplied = applications.length > 0;
    const isProfileComplete = Boolean(
        profile?.father_name &&
        profile?.date_of_birth &&
        profile?.gender &&
        profile?.domicile_district &&
        profile?.address
    );

    // Filter notices: all, admin, teacher
    const [noticeFilter, setNoticeFilter] = useState('all');
    const filteredAnnouncements = announcements.filter((a) => {
        if (noticeFilter === 'admin') return a.sender_type === 'admin';
        if (noticeFilter === 'teacher') return a.sender_type === 'teacher';
        return true;
    });

    const adminNoticesCount = announcements.filter((a) => a.sender_type === 'admin').length;
    const teacherNoticesCount = announcements.filter((a) => a.sender_type === 'teacher').length;

    // Filter tests and assignments
    const pendingTests = onlineTests.filter((t) => !t.has_attempted);
    const completedTests = onlineTests.filter((t) => t.has_attempted);
    const pendingAssignments = assignments.filter((a) => !a.is_submitted);

    // Mobile PIN Self-Attendance State & Handlers
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [isSubmittingPin, setIsSubmittingPin] = useState(false);
    const [pinError, setPinError] = useState('');

    const handleKeypadPress = (digit) => {
        if (pinInput.length < 4) {
            setPinInput((prev) => prev + digit);
            setPinError('');
        }
    };

    const handleKeypadBackspace = () => {
        setPinInput((prev) => prev.slice(0, -1));
        setPinError('');
    };

    const handleKeypadClear = () => {
        setPinInput('');
        setPinError('');
    };

    // Direct FCFS / Merit Challan Receipt Upload Form
    const [showReuploadForm, setShowReuploadForm] = useState(false);
    const uploadChallanForm = useForm({
        challan_receipt: null,
        bank_reference: '',
        deposit_date: new Date().toISOString().split('T')[0],
    });

    const handleChallanUpload = (appId) => (e) => {
        e.preventDefault();
        uploadChallanForm.post(route('student.application.upload-challan', appId), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                uploadChallanForm.reset();
                setShowReuploadForm(false);
            },
        });
    };

    // GPS Geofence & PIN Check-in State & Handler
    const [gpsCoords, setGpsCoords] = useState(null);
    const [gpsDistance, setGpsDistance] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const [locationMsg, setLocationMsg] = useState('');
    const [locationError, setLocationError] = useState('');

    const acquireGps = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser or device.');
            return;
        }

        setIsLocating(true);
        setLocationError('');
        setLocationMsg('Acquiring high-accuracy classroom GPS location...');

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                const accuracy = pos.coords.accuracy;

                const centerLat = todaySession?.latitude || 28.4212;
                const centerLng = todaySession?.longitude || 70.3023;
                const radius = todaySession?.radius_meters || 150;

                // Haversine distance
                const R = 6371000;
                const dLat = ((centerLat - lat) * Math.PI) / 180;
                const dLon = ((centerLng - lng) * Math.PI) / 180;
                const a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos((lat * Math.PI) / 180) *
                    Math.cos((centerLat * Math.PI) / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const dist = Math.round(R * c);

                setGpsCoords({ latitude: lat, longitude: lng, accuracy });
                setGpsDistance(dist);
                setIsLocating(false);

                if (todaySession?.is_geofence_active && dist > radius) {
                    setLocationError(
                        `You are ${dist}m away from ${
                            todaySession?.location_name || 'the classroom'
                        }. Maximum allowed boundary is ${radius}m.`
                    );
                } else {
                    setLocationMsg(
                        `✓ GPS Verified inside ${
                            todaySession?.location_name || 'the classroom'
                        } (${dist}m away)`
                    );
                }
            },
            (err) => {
                setIsLocating(false);
                setLocationError(
                    `GPS (${err.code}): ${err.message}. Please enable location permissions.`
                );
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleOpenAttendanceModal = () => {
        setPinError('');
        setPinInput('');
        setLocationError('');
        setLocationMsg('');
        setIsPinModalOpen(true);
        acquireGps();
    };

    const handlePinSubmit = (e) => {
        if (e) e.preventDefault();
        if (pinInput.length !== 4) {
            setPinError('Please enter all 4 digits of the class PIN.');
            return;
        }

        const radius = todaySession?.radius_meters || 150;
        if (todaySession?.is_geofence_active && gpsDistance !== null && gpsDistance > radius) {
            setPinError(
                `Cannot submit: You are ${gpsDistance}m away from ${todaySession?.location_name}. You must be physically inside class.`
            );
            return;
        }

        setIsSubmittingPin(true);
        setPinError('');

        router.post(
            route('student.attendance.self-mark'),
            {
                pin: pinInput,
                latitude: gpsCoords?.latitude || null,
                longitude: gpsCoords?.longitude || null,
                accuracy: gpsCoords?.accuracy || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsPinModalOpen(false);
                    setPinInput('');
                    setIsSubmittingPin(false);
                },
                onError: (errs) => {
                    setIsSubmittingPin(false);
                    setPinError(
                        errs.pin ||
                            Object.values(errs)[0] ||
                            'Incorrect PIN! Must match the code on the classroom board.'
                    );
                },
                onFinish: () => {
                    setIsSubmittingPin(false);
                },
            }
        );
    };

    const handleGpsCheckIn = () => {
        handleOpenAttendanceModal();
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'selected':
            case 'enrolled':
            case 'verified':
                return 'green';
            case 'submitted':
                return 'blue';
            case 'under_review':
                return 'amber';
            case 'rejected':
                return 'rose';
            default:
                return 'neutral';
        }
    };

    const formattedDate = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    // =========================================================================
    // SANCTION LOCKDOWN SCREEN (STRUCK-OFF OR PERMANENTLY TERMINATED)
    // =========================================================================
    if (sanction) {
        const isTerminated = sanction.type === 'terminated';
        const isStruckOff = sanction.type === 'struck_off';

        return (
            <AuthenticatedLayout
                header={
                    <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                        <span className="font-bold text-rose-600">GTTI Discipline</span>
                        <span>/</span>
                        <span className="text-slate-900 font-semibold truncate">
                            {isTerminated ? 'Official Expulsion Order' : 'Academic Suspension Order'}
                        </span>
                    </div>
                }
            >
                <Head title={isTerminated ? "Admission Terminated - GTTI RYK" : "Dashboard Suspended - GTTI RYK"} />

                <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
                    {/* Official Banner */}
                    <div
                        className={`rounded-3xl p-8 border shadow-xl text-center relative overflow-hidden ${
                            isTerminated
                                ? 'bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 text-white border-rose-600/40'
                                : 'bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 text-white border-amber-500/40'
                        }`}
                    >
                        {/* Background watermark badge */}
                        <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none">
                            <Scale className="w-80 h-80" />
                        </div>

                        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                            {/* Emblem */}
                            <div className="inline-flex p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                                {isTerminated ? (
                                    <Ban className="h-12 w-12 text-rose-500" />
                                ) : (
                                    <Clock className="h-12 w-12 text-amber-400 animate-pulse" />
                                )}
                            </div>

                            <div className="space-y-1">
                                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-white/15 border border-white/20 text-white">
                                    Govt Technical Training Institute Rahim Yar Khan • Principal Office
                                </span>
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-2">
                                    {isTerminated ? 'STUDENT ADMISSION TERMINATED & EXPELLED' : 'STUDENT TEMPORARILY STRUCK-OFF THE ROLLS'}
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-300">
                                    {isTerminated
                                        ? 'Your student admission and dashboard access have been permanently closed.'
                                        : `Your student dashboard is suspended for ${sanction.struck_off_days || 7} days by administrative order.`}
                                </p>
                            </div>

                            {/* Live Countdown for Struck-Off */}
                            {isStruckOff && (
                                <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-400/30 backdrop-blur-md inline-block text-center px-8">
                                    <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                                        Suspension Period Remaining
                                    </p>
                                    <p className="text-3xl font-black text-amber-400 mt-1">
                                        {sanction.remaining_days} {sanction.remaining_days === 1 ? 'Day' : 'Days'}
                                    </p>
                                    <p className="text-[11px] text-gray-300 mt-1">
                                        Access automatically reopens on: <span className="font-bold text-white">{sanction.struck_off_until}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Official Order Details Card */}
                    <div className="rounded-3xl bg-white border border-gray-200 shadow-md p-6 sm:p-8 space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <div>
                                <h3 className="text-base font-black text-gray-900">
                                    Official Disciplinary Order Summary
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Executive sanction decree under Institutional Regulations & TEVTA Code
                                </p>
                            </div>
                            {sanction.order_reference && (
                                <span className="px-3 py-1 rounded-xl bg-gray-100 font-mono text-xs font-bold text-gray-700 border border-gray-200">
                                    Order: {sanction.order_reference}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                                <span className="text-gray-400 text-[10px] font-bold uppercase">Candidate Name</span>
                                <p className="font-bold text-gray-900 text-sm">{user?.name}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                                <span className="text-gray-400 text-[10px] font-bold uppercase">Registration / Roll No.</span>
                                <p className="font-bold text-gray-900 text-sm">{profile?.registration_number || latestEnrollment?.enrollment_number || 'N/A'}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                                <span className="text-gray-400 text-[10px] font-bold uppercase">Course & Trade</span>
                                <p className="font-bold text-gray-900">{latestEnrollment?.course?.name || 'Technical Trade'}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                                <span className="text-gray-400 text-[10px] font-bold uppercase">Sanction Issue Date</span>
                                <p className="font-bold text-gray-900">{sanction.struck_off_at || 'Administrative Record'}</p>
                            </div>
                        </div>

                        {/* Stated Reason & Grounds */}
                        <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                            <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs">
                                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                                <span>Recorded Grounds for Disciplinary Sanction:</span>
                            </div>
                            <p className="text-xs text-rose-950 font-medium pl-6 leading-relaxed">
                                {sanction.reason || 'Breach of institutional code of conduct and attendance regulations.'}
                            </p>
                        </div>

                        {/* Functional Lock Notice */}
                        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-2">
                            <div className="flex items-center space-x-2 text-gray-900 font-bold">
                                <Lock className="h-4 w-4 text-gray-700" />
                                <span>Portal & Campus Services Status:</span>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-gray-600 text-[11px] pl-2">
                                <li><strong>Online CBT Tests:</strong> Access disabled during penalty period.</li>
                                <li><strong>LMS Coursework & Assignments:</strong> Submissions and task views locked.</li>
                                <li><strong>Classroom Attendance:</strong> Barred from clocking digital or biometric check-ins.</li>
                                <li><strong>Campus Entry:</strong> Security gate barcode clearance suspended.</li>
                            </ul>
                        </div>

                        {/* Directives for Clearance or Appeal */}
                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                            <p className="text-gray-500 text-[11px]">
                                {isTerminated
                                    ? 'To apply for formal departure clearance or retrieve original documents, contact the Principal Office.'
                                    : 'Parents or guardians wishing to submit a review petition must appear in person before the Disciplinary Board.'}
                            </p>

                            <div className="flex items-center space-x-2 shrink-0">
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="py-2.5 px-5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs shadow-sm transition-all"
                                >
                                    Log Out Securely
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title={isEnrolled ? "Student Academic Dashboard - GTTI RYK" : "Applicant Dashboard - GTTI RYK"} />

            <div className="space-y-6">
                {/* Executive Page Greeting Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium mb-1">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-govt-green text-white">
                                TEVTA Punjab
                            </span>
                            <span>•</span>
                            <span className="font-mono text-slate-600">
                                Session {latestEnrollment?.batch?.session_year || '2026-2027'}
                            </span>
                            <span>•</span>
                            <span>{formattedDate}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-slate-900 tracking-tight">
                            {isEnrolled ? 'Student Academic Command Center' : 'Applicant Admission Portal'}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Govt. Technical Training Institute, Rahim Yar Khan (GIIMS)
                        </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                        {isEnrolled ? (
                            <div className="flex items-center space-x-2">
                                {pendingTestsCount > 0 && (
                                    <Link
                                        href={route('student.online-tests.index')}
                                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition shadow-xs animate-pulse"
                                    >
                                        <Monitor className="h-3.5 w-3.5" />
                                        <span>{pendingTestsCount} CBT Test Due</span>
                                    </Link>
                                )}
                                <Link
                                    href={route('student.apprenticeship.index')}
                                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition shadow-xs"
                                    title="On-the-Job Training & Apprenticeship Placement"
                                >
                                    <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                                    <span>OJT Portal</span>
                                </Link>
                                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Active Trainee</span>
                                </span>
                            </div>
                        ) : (
                            <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                <span>Admission Intake Cycle</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════════════════
                    CONDITION 1: ENROLLED ACTIVE TRAINEE ACADEMIC DASHBOARD
                ════════════════════════════════════════════════════════════════ */}
                {isEnrolled && (
                    <div className="space-y-6">

                        {/* ────────────────────────────────────────────────────────
                            TOPMOST ACTION: ATTENDANCE CHECK-IN WIDGET
                        ──────────────────────────────────────────────────────── */}
                        {/* ────────────────────────────────────────────────────────
                            TOPMOST ACTION: ATTENDANCE CHECK-IN WIDGET
                        ──────────────────────────────────────────────────────── */}
                        {todayAttendance?.is_marked ? (
                            <div
                                id="mobile-attendance-card"
                                className={`p-4 sm:p-5 rounded-xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                    todayAttendance.is_confirmed_by_teacher
                                        ? 'bg-white border-emerald-200/90'
                                        : 'bg-amber-50/50 border-amber-200/90'
                                }`}
                            >
                                <div className="flex items-center space-x-3.5">
                                    <div
                                        className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                                            todayAttendance.is_confirmed_by_teacher
                                                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                                : 'bg-amber-100 border border-amber-200 text-amber-800'
                                        }`}
                                    >
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                            <Badge
                                                variant={todayAttendance.is_confirmed_by_teacher ? 'green' : 'amber'}
                                                size="xs"
                                            >
                                                {todayAttendance.is_confirmed_by_teacher
                                                    ? '✓ Attendance Confirmed'
                                                    : '● GPS & PIN Verified'}
                                            </Badge>
                                            <span className="text-xs font-semibold text-slate-700">
                                                {todayAttendance.method === 'pin_gps'
                                                    ? 'GPS + Board PIN'
                                                    : todayAttendance.method === 'pin'
                                                    ? 'Class PIN'
                                                    : 'GPS Location'}
                                            </span>
                                        </div>
                                        <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                                            {todayAttendance.is_confirmed_by_teacher
                                                ? `Marked Present for Today at ${todayAttendance.marked_at}`
                                                : `Check-In Submitted for Today at ${todayAttendance.marked_at}`}
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Zone: <strong className="text-slate-700">{todaySession?.location_name || 'Classroom / Lab'}</strong> •{' '}
                                            {todayAttendance.is_confirmed_by_teacher ? (
                                                <span className="text-emerald-700 font-semibold">
                                                    Officially confirmed & locked by Instructor
                                                </span>
                                            ) : (
                                                <span className="text-amber-800 font-semibold">
                                                    Awaiting instructor confirmation on faculty dashboard
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 shrink-0">
                                    <span
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                                            todayAttendance.is_confirmed_by_teacher
                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                : 'bg-amber-100 text-amber-900 border-amber-300'
                                        }`}
                                    >
                                        {todayAttendance.is_confirmed_by_teacher
                                            ? '✓ CONFIRMED PRESENT'
                                            : '● PENDING CONFIRMATION'}
                                    </span>
                                    <Link
                                        href={route('student.leaves.index')}
                                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                                    >
                                        Request Leave
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div
                                id="mobile-attendance-card"
                                className="relative overflow-hidden rounded-xl bg-gradient-to-r from-govt-green via-govt-green-600 to-[#002B12] text-white border border-govt-green-700/60 p-5 sm:p-6 shadow-sm"
                            >
                                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                                    <div className="flex items-start space-x-3.5">
                                        <div className="h-11 w-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
                                            <Key className="h-5 w-5 stroke-[2.5]" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                                                    Daily Class Attendance
                                                </span>
                                                <span className="text-xs text-emerald-200 font-semibold flex items-center space-x-1">
                                                    <Smartphone className="h-3.5 w-3.5" />
                                                    <span>Dual Verification (GPS + Board PIN)</span>
                                                </span>
                                            </div>
                                            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                                                Mark Your Attendance for Today
                                            </h3>
                                            <p className="text-xs text-emerald-100/90 leading-relaxed max-w-2xl">
                                                Classroom Area: <strong className="text-white font-semibold">{todaySession?.location_name || 'Computer Lab 1 & 2 (IT Wing)'}</strong>. Enter the exact 4-digit PIN written on the classroom board while inside this area. Your teacher will confirm your presence on their dashboard.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                                        <button
                                            type="button"
                                            onClick={handleOpenAttendanceModal}
                                            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs tracking-wide transition shadow-sm flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
                                        >
                                            <Key className="h-4 w-4" />
                                            <span>Mark Today's Attendance (GPS + PIN)</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ────────────────────────────────────────────────────────
                            NUMERIC KEYPAD PIN + GPS ATTENDANCE MODAL
                        ──────────────────────────────────────────────────────── */}
                        {isPinModalOpen && (
                            <div
                                role="dialog"
                                aria-modal="true"
                                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4 transition-all"
                            >
                                <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md p-6 border border-slate-200 animate-in slide-in-from-bottom sm:zoom-in-95 duration-150">
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                        <div className="flex items-center space-x-2.5">
                                            <div className="h-10 w-10 rounded-xl bg-govt-green-50 text-govt-green flex items-center justify-center font-bold">
                                                <Key className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-slate-900">
                                                    Class Attendance (GPS + PIN)
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Enter the exact 4-digit code written on the board
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsPinModalOpen(false)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    {/* Classroom Area & GPS Location Geofence Status */}
                                    <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-slate-700 flex items-center space-x-1.5">
                                                <MapPin className="h-3.5 w-3.5 text-govt-green" />
                                                <span>Class Area: {todaySession?.location_name || 'Computer Lab 1 & 2'}</span>
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-mono">
                                                Max {todaySession?.radius_meters || 150}m
                                            </span>
                                        </div>

                                        {isLocating && (
                                            <p className="text-[11px] text-slate-600 flex items-center space-x-1.5 animate-pulse">
                                                <Navigation className="h-3 w-3 animate-spin text-govt-green" />
                                                <span>Locating device GPS coordinates...</span>
                                            </p>
                                        )}

                                        {locationError && (
                                            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-start space-x-1.5">
                                                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-600" />
                                                <div className="flex-1">
                                                    <span>{locationError}</span>
                                                    <button
                                                        type="button"
                                                        onClick={acquireGps}
                                                        className="underline font-bold ml-1 cursor-pointer"
                                                    >
                                                        Retry GPS
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {locationMsg && (
                                            <p className="text-[11px] text-emerald-800 font-semibold flex items-center space-x-1">
                                                <Check className="h-3.5 w-3.5 text-govt-green" />
                                                <span>{locationMsg}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* 4 Digit Display Boxes */}
                                    <div className="my-4">
                                        <div className="flex items-center justify-center space-x-3 sm:space-x-4">
                                            {[0, 1, 2, 3].map((idx) => {
                                                const digit = pinInput[idx];
                                                const isCurrent = pinInput.length === idx;
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`h-14 w-12 sm:h-16 sm:w-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold font-mono transition-all ${
                                                            digit
                                                                ? 'bg-govt-green-50 border-govt-green text-govt-green'
                                                                : isCurrent
                                                                ? 'border-govt-gold bg-amber-50/50 ring-2 ring-amber-300'
                                                                : 'border-slate-200 bg-slate-50 text-slate-300'
                                                        }`}
                                                    >
                                                        {digit || '•'}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {pinError && (
                                            <p className="text-xs text-rose-600 font-bold text-center mt-3">
                                                {pinError}
                                            </p>
                                        )}
                                    </div>

                                    {/* Numeric Keypad Grid */}
                                    <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                                            <button
                                                key={digit}
                                                type="button"
                                                onClick={() => handleKeypadPress(String(digit))}
                                                className="h-12 sm:h-14 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-900 font-bold text-lg transition-all shadow-xs flex items-center justify-center border border-slate-200 cursor-pointer"
                                            >
                                                {digit}
                                            </button>
                                        ))}

                                        {/* Clear */}
                                        <button
                                            type="button"
                                            onClick={handleKeypadClear}
                                            className="h-12 sm:h-14 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 font-semibold text-xs uppercase tracking-wider transition border border-slate-200 cursor-pointer"
                                        >
                                            Clear
                                        </button>

                                        {/* 0 */}
                                        <button
                                            type="button"
                                            onClick={() => handleKeypadPress('0')}
                                            className="h-12 sm:h-14 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-900 font-bold text-lg transition shadow-xs flex items-center justify-center border border-slate-200 cursor-pointer"
                                        >
                                            0
                                        </button>

                                        {/* Backspace */}
                                        <button
                                            type="button"
                                            onClick={handleKeypadBackspace}
                                            className="h-12 sm:h-14 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-lg transition flex items-center justify-center border border-slate-200 cursor-pointer"
                                            title="Backspace"
                                        >
                                            ⌫
                                        </button>
                                    </div>

                                    {/* Submit Action Button */}
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <button
                                            type="button"
                                            disabled={pinInput.length !== 4 || isSubmittingPin}
                                            onClick={handlePinSubmit}
                                            className="w-full py-3.5 rounded-xl bg-govt-green hover:bg-govt-green-600 disabled:opacity-40 text-white font-bold text-xs tracking-wider uppercase transition shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                                        >
                                            {isSubmittingPin ? (
                                                <>
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                    <span>Verifying GPS & PIN...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="h-4 w-4 stroke-[2.5]" />
                                                    <span>Verify & Submit Attendance</span>
                                                </>
                                            )}
                                        </button>
                                        <p className="text-[10px] text-slate-400 text-center mt-2">
                                            PIN must exactly match the board code. Teacher will confirm attendance.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ────────────────────────────────────────────────────────
                            URGENT ACTION ALERTS (CBT / Coursework / Attendance)
                        ──────────────────────────────────────────────────────── */}
                        {(pendingTestsCount > 0 || pendingAssignmentsCount > 0 || (attendanceStats.has_data && attendanceStats.percentage < 80)) && (
                            <div className="space-y-3">
                                {/* Alert 1: Pending Online Test */}
                                {pendingTestsCount > 0 && pendingTests[0] && (
                                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start space-x-3.5">
                                            <div className="h-10 w-10 rounded-xl bg-amber-400 text-slate-950 font-bold flex items-center justify-center shrink-0 shadow-xs">
                                                <Monitor className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant="gold" size="xs">
                                                        Exam Action Required
                                                    </Badge>
                                                    <span className="text-xs font-bold text-amber-900">
                                                        Online CBT Test Active
                                                    </span>
                                                </div>
                                                <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                                                    "{pendingTests[0].title}" is ready for your batch!
                                                </h4>
                                                <p className="text-xs text-slate-600 mt-0.5">
                                                    {pendingTests[0].questions_count} Questions • {pendingTests[0].duration_minutes} Mins Timed Assessment • Passing: {pendingTests[0].passing_percentage}%
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 shrink-0">
                                            <Link
                                                href={route('student.online-tests.take', pendingTests[0].id)}
                                                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-xs flex items-center space-x-1.5"
                                            >
                                                <Play className="h-3.5 w-3.5 fill-current" />
                                                <span>Start CBT Exam Now</span>
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                            {pendingTestsCount > 1 && (
                                                <Link
                                                    href={route('student.online-tests.index')}
                                                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition border border-slate-200"
                                                >
                                                    +{pendingTestsCount - 1} More Tests
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Alert 2: Pending Coursework Assignment */}
                                {pendingAssignmentsCount > 0 && pendingAssignments[0] && (
                                    <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start space-x-3.5">
                                            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant="purple" size="xs">
                                                        Pending Coursework
                                                    </Badge>
                                                    <span className="text-xs font-semibold text-indigo-700">
                                                        {pendingAssignments[0].subject_name}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                                                    {pendingAssignments[0].title}
                                                </h4>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Due Date: {pendingAssignments[0].due_date || 'Upcoming'} • Max Marks: {pendingAssignments[0].max_marks}
                                                </p>
                                            </div>
                                        </div>
                                        <Link
                                            href={route('student.lms.index')}
                                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-xs flex items-center space-x-1.5 shrink-0"
                                        >
                                            <span>Open LMS & Submit</span>
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                )}

                                {/* Alert 3: Low Attendance Warning */}
                                {attendanceStats.has_data && attendanceStats.percentage < 80 && (
                                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between gap-4 text-xs">
                                        <div className="flex items-center space-x-3">
                                            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                                            <div>
                                                <p className="font-bold">TEVTA Attendance Compliance Advisory</p>
                                                <p className="text-[11px] text-rose-700">
                                                    Current attendance is {attendanceStats.percentage}% (below mandatory 80% criteria). Regularize your classroom presence immediately.
                                                </p>
                                            </div>
                                        </div>
                                        <Link
                                            href={route('student.leaves.index')}
                                            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shrink-0"
                                        >
                                            Apply for Leave
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ────────────────────────────────────────────────────────
                            DIGITAL STUDENT IDENTITY CARD & ACADEMIC COCKPIT
                        ──────────────────────────────────────────────────────── */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left 1 Col: Official Digital Student ID Card */}
                            <div className="rounded-xl bg-gradient-to-br from-govt-green via-govt-green-600 to-[#00240E] p-5 sm:p-6 text-white shadow-card border border-govt-green-700/60 relative overflow-hidden flex flex-col justify-between space-y-5">
                                {/* Subtle decorative circle */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />

                                {/* ID Header */}
                                <div>
                                    <div className="flex items-center justify-between pb-3 border-b border-white/15">
                                        <div className="flex items-center space-x-2.5">
                                            <div className="h-8 w-8 rounded-lg bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center text-xs shadow-xs">
                                                G
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">TEVTA Punjab</p>
                                                <p className="text-xs font-bold text-white tracking-tight">GTTI RAHIM YAR KHAN</p>
                                            </div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-white/15 text-white border border-white/20 tracking-wider">
                                            Student Card
                                        </span>
                                    </div>

                                    {/* Student Avatar & Identity */}
                                    <div className="mt-4 flex items-start space-x-3.5">
                                        <div className="h-14 w-14 rounded-xl bg-white/15 border-2 border-white/30 flex items-center justify-center font-bold text-xl text-white shrink-0 shadow-sm">
                                            {user.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="space-y-0.5 min-w-0">
                                            <h3 className="text-base font-bold text-white leading-snug truncate">
                                                {user.name}
                                            </h3>
                                            <p className="text-xs text-emerald-100 font-normal truncate">
                                                S/D of: {profile?.father_name || 'N/A'}
                                            </p>
                                            <p className="text-xs font-mono font-bold text-amber-300 pt-0.5">
                                                {latestEnrollment?.enrollment_number || 'ENR-PENDING'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Academic Program Details */}
                                <div className="p-3.5 rounded-xl bg-black/20 border border-white/10 space-y-2 text-xs">
                                    <div className="flex justify-between text-emerald-100 text-[11px]">
                                        <span className="opacity-80">Course / Trade:</span>
                                        <span className="text-white font-bold text-right truncate max-w-[160px]">
                                            {latestEnrollment?.course?.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-emerald-100 text-[11px]">
                                        <span className="opacity-80">Allocated Batch:</span>
                                        <span className="text-amber-300 font-bold">{latestEnrollment?.batch?.name}</span>
                                    </div>
                                    <div className="flex justify-between text-emerald-100 text-[11px]">
                                        <span className="opacity-80">Session / Shift:</span>
                                        <span className="text-white font-medium">{latestEnrollment?.batch?.session_year} • {latestEnrollment?.batch?.shift}</span>
                                    </div>
                                    {assignedTeachers.length > 0 && (
                                        <div className="pt-1 border-t border-white/10 flex justify-between text-[11px]">
                                            <span className="text-emerald-100 opacity-80">Instructor:</span>
                                            <span className="text-amber-300 font-bold truncate max-w-[150px]">
                                                {assignedTeachers[0].name}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Footer Security Stripe */}
                                <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[10px] text-emerald-200">
                                    <span>Enrolled: {latestEnrollment?.enrollment_date || 'Fall 2026'}</span>
                                    <span className="font-mono text-amber-300 font-bold flex items-center space-x-1">
                                        <CheckCircle2 className="h-3 w-3 text-amber-400" />
                                        <span>VERIFIED TRAINEE</span>
                                    </span>
                                </div>
                            </div>

                            {/* Right 2 Cols: Academic Status & Key Metrics */}
                            <div className="lg:col-span-2 space-y-5">
                                <Card className="p-5 sm:p-6 space-y-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                                        <div>
                                            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-govt-green">
                                                <Sparkles className="h-3.5 w-3.5" />
                                                <span>Active Academic Session 2026-2027</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                                                Welcome back, {user.name}!
                                            </h3>
                                        </div>
                                        <div>
                                            <Badge variant="green" size="md">
                                                Academic Good Standing
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* 4 Quick Metric Cards */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {/* Attendance */}
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                            <p className="text-[11px] text-slate-500 font-medium">Class Attendance</p>
                                            <p className="text-2xl font-bold text-slate-900">
                                                {attendanceStats.has_data ? `${attendanceStats.percentage}%` : '100%'}
                                            </p>
                                            <p className={`text-[10px] font-bold ${
                                                (attendanceStats.percentage || 100) >= 80 ? 'text-govt-green' : 'text-rose-600'
                                            }`}>
                                                {(attendanceStats.percentage || 100) >= 80 ? 'Above 80% Threshold' : 'Below Minimum'}
                                            </p>
                                        </div>

                                        {/* CBT Tests */}
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                            <p className="text-[11px] text-slate-500 font-medium">Online CBT Tests</p>
                                            <p className="text-2xl font-bold text-slate-900">
                                                {onlineTests.length}
                                            </p>
                                            <p className="text-[10px] text-govt-green font-bold">
                                                {pendingTestsCount > 0 ? `${pendingTestsCount} Pending Exam` : 'All Completed'}
                                            </p>
                                        </div>

                                        {/* Assignments */}
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                            <p className="text-[11px] text-slate-500 font-medium">LMS Tasks</p>
                                            <p className="text-2xl font-bold text-slate-900">
                                                {assignments.length}
                                            </p>
                                            <p className="text-[10px] text-purple-700 font-bold">
                                                {pendingAssignmentsCount > 0 ? `${pendingAssignmentsCount} Pending Submit` : 'Up to Date'}
                                            </p>
                                        </div>

                                        {/* Exams */}
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                            <p className="text-[11px] text-slate-500 font-medium">Formal Exams</p>
                                            <p className="text-2xl font-bold text-slate-900">
                                                {recentExams.length}
                                            </p>
                                            <p className="text-[10px] text-govt-green font-bold">
                                                TEVTA Certified
                                            </p>
                                        </div>
                                    </div>

                                    {/* Department Bar & Action Shortcuts */}
                                    <div className="p-3.5 rounded-xl bg-govt-green-50/60 border border-govt-green-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                        <div className="space-y-0.5">
                                            <p className="font-bold text-slate-900">
                                                Department of {latestEnrollment?.course?.trade?.program?.department?.name || 'Technical Training'}
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                Training Wing • Govt. Technical Training Institute, Rahim Yar Khan
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                                            <Link
                                                href={route('student.online-tests.index')}
                                                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs flex items-center space-x-1.5"
                                            >
                                                <Monitor className="h-3.5 w-3.5" />
                                                <span>CBT Tests</span>
                                            </Link>
                                            <Link
                                                href={route('student.lms.index')}
                                                className="px-3 py-1.5 rounded-lg bg-govt-green hover:bg-govt-green-600 text-white font-bold transition shadow-xs flex items-center space-x-1.5"
                                            >
                                                <BookOpen className="h-3.5 w-3.5" />
                                                <span>Open LMS</span>
                                            </Link>
                                            <Link
                                                href={route('student.leaves.index')}
                                                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition shadow-xs flex items-center space-x-1.5"
                                            >
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                <span>Leaves</span>
                                            </Link>
                                            <Link
                                                href={route('student.profile.edit')}
                                                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-bold transition border border-slate-200"
                                            >
                                                Profile
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* ────────────────────────────────────────────────────────
                            SECTION 1: ONLINE CBT TESTS & EXAMS
                        ──────────────────────────────────────────────────────── */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-2.5">
                                    <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                                        <Monitor className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <CardTitle>Online CBT Tests & Examinations</CardTitle>
                                            {pendingTestsCount > 0 && (
                                                <Badge variant="gold" size="xs">
                                                    {pendingTestsCount} Pending
                                                </Badge>
                                            )}
                                        </div>
                                        <CardDescription>
                                            Timed competency tests uploaded by your instructor for {latestEnrollment?.batch?.name}
                                        </CardDescription>
                                    </div>
                                </div>
                                <Link
                                    href={route('student.online-tests.index')}
                                    className="text-xs font-bold text-govt-green hover:text-govt-green-600 flex items-center space-x-1"
                                >
                                    <span>View All</span>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                            </CardHeader>

                            <CardContent>
                                {onlineTests.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {onlineTests.map((test) => {
                                            const isAttempted = test.has_attempted;
                                            const attempt = test.attempt;

                                            return (
                                                <div
                                                    key={test.id}
                                                    className={`rounded-xl p-4.5 border transition flex flex-col justify-between space-y-4 shadow-xs ${
                                                        !isAttempted
                                                            ? 'bg-white border-indigo-200 hover:border-indigo-400 hover:shadow-sm'
                                                            : 'bg-slate-50/70 border-slate-200'
                                                    }`}
                                                >
                                                    <div className="space-y-2.5">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <Badge variant="green" size="xs">
                                                                CBT Assessment
                                                            </Badge>
                                                            {!isAttempted ? (
                                                                <Badge variant="gold" size="xs" dot>
                                                                    Ready to Attempt
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="neutral" size="xs">
                                                                    Completed
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                                                {test.title}
                                                            </h4>
                                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                                Batch: {latestEnrollment?.batch?.name}
                                                            </p>
                                                        </div>

                                                        <div className="p-2.5 rounded-lg bg-slate-100/70 grid grid-cols-3 gap-2 text-center text-xs">
                                                            <div>
                                                                <p className="text-[10px] text-slate-400 font-semibold">Questions</p>
                                                                <p className="font-bold text-slate-800">{test.questions_count}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-slate-400 font-semibold">Duration</p>
                                                                <p className="font-bold text-slate-800">{test.duration_minutes}m</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-slate-400 font-semibold">Passing</p>
                                                                <p className="font-bold text-slate-800">{test.passing_percentage}%</p>
                                                            </div>
                                                        </div>

                                                        {isAttempted && attempt && (
                                                            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                                                                <div>
                                                                    <p className="text-[10px] text-emerald-700 font-semibold">Your Score</p>
                                                                    <p className="text-xs font-bold text-emerald-950">
                                                                        {attempt.score} / {attempt.total_questions} Marks
                                                                    </p>
                                                                </div>
                                                                <span className="text-[11px] font-bold text-govt-green font-mono">
                                                                    {Math.round((attempt.score / (attempt.total_questions || 1)) * 100)}%
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        {!isAttempted ? (
                                                            <Link
                                                                href={route('student.online-tests.take', test.id)}
                                                                className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-xs flex items-center justify-center space-x-1.5"
                                                            >
                                                                <Play className="h-3.5 w-3.5 fill-current" />
                                                                <span>Start Exam Now</span>
                                                                <ArrowRight className="h-3.5 w-3.5" />
                                                            </Link>
                                                        ) : (
                                                            <Link
                                                                href={route('student.online-tests.index')}
                                                                className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs transition flex items-center justify-center space-x-1"
                                                            >
                                                                <span>Review Details</span>
                                                                <ExternalLink className="h-3 w-3" />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={Monitor}
                                        title="No Online Tests Currently Scheduled"
                                        description="When your instructor publishes an online CBT exam for your batch, it will appear here immediately."
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* ────────────────────────────────────────────────────────
                            SECTION 2: INSTITUTIONAL NOTICES & DIRECTIVES
                        ──────────────────────────────────────────────────────── */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-2.5">
                                    <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                                        <Megaphone className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <CardTitle>Institute Circulars & Directives</CardTitle>
                                        <CardDescription>
                                            Official announcements from Administration and Faculty
                                        </CardDescription>
                                    </div>
                                </div>

                                {/* Filter Buttons */}
                                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                                    <button
                                        onClick={() => setNoticeFilter('all')}
                                        className={`px-3 py-1 rounded-lg font-semibold transition ${
                                            noticeFilter === 'all'
                                                ? 'bg-white text-slate-900 shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        All ({announcements.length})
                                    </button>
                                    <button
                                        onClick={() => setNoticeFilter('admin')}
                                        className={`px-3 py-1 rounded-lg font-semibold transition ${
                                            noticeFilter === 'admin'
                                                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        Admin ({adminNoticesCount})
                                    </button>
                                    <button
                                        onClick={() => setNoticeFilter('teacher')}
                                        className={`px-3 py-1 rounded-lg font-semibold transition ${
                                            noticeFilter === 'teacher'
                                                ? 'bg-govt-green text-white font-bold shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        Instructor ({teacherNoticesCount})
                                    </button>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {filteredAnnouncements.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredAnnouncements.map((announcement) => {
                                            const isTeacher = announcement.sender_type === 'teacher';

                                            return (
                                                <div
                                                    key={announcement.id}
                                                    className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition space-y-3 flex flex-col justify-between"
                                                >
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center space-x-2">
                                                                <Badge
                                                                    variant={isTeacher ? 'green' : 'gold'}
                                                                    size="xs"
                                                                >
                                                                    {isTeacher ? 'Instructor' : 'Official Admin'}
                                                                </Badge>
                                                                <span className="text-xs font-bold text-slate-800 truncate">
                                                                    {announcement.author_name}
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                                                {announcement.created_at ? new Date(announcement.created_at).toLocaleDateString('en-GB') : 'Recent'}
                                                            </span>
                                                        </div>

                                                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                                            {announcement.title}
                                                        </h4>

                                                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                                                            {announcement.message}
                                                        </p>
                                                    </div>

                                                    <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                                                        <span>Audience: {announcement.target_audience === 'all' ? 'All Portals' : 'Enrolled Students'}</span>
                                                        <span className="font-semibold text-slate-600">
                                                            {announcement.author_role}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={Megaphone}
                                        title="No Notices Under This Filter"
                                        description="No announcements found matching the current selected audience filter."
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* ────────────────────────────────────────────────────────
                            SECTION 3: COURSEWORK ASSIGNMENTS (LMS)
                        ──────────────────────────────────────────────────────── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {latestEnrollment && !latestEnrollment.is_lms_active ? (
                                <Card className="border-amber-400/50 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
                                    <div className="p-6 text-center space-y-3">
                                        <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                                            <Lock className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500 text-slate-950 inline-block">
                                                LMS COURSEWORK INACTIVE
                                            </span>
                                            <h4 className="text-base font-black text-white">
                                                Awaiting Instructor Verification & First-Day Class Orientation
                                            </h4>
                                            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                                                Your enrollment has been officially confirmed! Course assignments, practical lab logs, and syllabus blueprints will unlock once your trade instructor conducts your first-day orientation and activates your LMS.
                                            </p>
                                        </div>
                                        <div className="pt-2 text-[11px] text-slate-400 font-mono flex items-center justify-center space-x-2">
                                            <span>Enrolled Course: <strong className="text-white">{latestEnrollment.course?.name}</strong></span>
                                            <span>•</span>
                                            <span>Batch: <strong className="text-amber-400">{latestEnrollment.batch?.title || 'Current Batch'}</strong></span>
                                        </div>
                                    </div>
                                </Card>
                            ) : (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center space-x-2.5">
                                            <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-govt-green">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <CardTitle>Coursework Assignments</CardTitle>
                                                    <Badge variant="green" size="xs">✓ LMS Active</Badge>
                                                </div>
                                                <CardDescription>Practical tasks uploaded by course instructors</CardDescription>
                                            </div>
                                        </div>
                                        <Link
                                            href={route('student.lms.index')}
                                            className="text-xs font-bold text-govt-green hover:text-govt-green-600 flex items-center space-x-1"
                                        >
                                            <span>Open LMS</span>
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </CardHeader>

                                    <CardContent>
                                        {assignments.length > 0 ? (
                                            <div className="space-y-3">
                                                {assignments.map((assignment) => (
                                                    <div
                                                        key={assignment.id}
                                                        className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                                                    >
                                                        <div className="space-y-1 min-w-0">
                                                            <div className="flex items-center space-x-2">
                                                                <Badge variant="neutral" size="xs">
                                                                    {assignment.subject_name || 'Coursework'}
                                                                </Badge>
                                                                {assignment.is_submitted ? (
                                                                    <Badge variant="green" size="xs">
                                                                        Submitted
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="rose" size="xs">
                                                                        Pending
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <h4 className="font-bold text-slate-900 truncate">
                                                                {assignment.title}
                                                            </h4>
                                                            <p className="text-[11px] text-slate-500">
                                                                Due: {assignment.due_date || 'N/A'} • Max Marks: {assignment.max_marks}
                                                            </p>
                                                        </div>

                                                        <Link
                                                            href={route('student.lms.index')}
                                                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-200 text-xs shrink-0 transition"
                                                        >
                                                            {assignment.is_submitted ? 'View' : 'Submit'}
                                                        </Link>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <EmptyState
                                                icon={FileText}
                                                title="No Assignments Due"
                                                description="Your course instructor has not posted any pending coursework assignments."
                                            />
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Section 4: Examinations and Results */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center space-x-2.5">
                                        <div className="h-8 w-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                                            <Award className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <CardTitle>Official Examination Records</CardTitle>
                                            <CardDescription>TEVTA Punjab published gradebook & competency</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    {recentExams.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="text-slate-500 border-b border-slate-100">
                                                        <th className="pb-2 font-semibold">Exam Title</th>
                                                        <th className="pb-2 font-semibold">Subject</th>
                                                        <th className="pb-2 font-semibold">Marks</th>
                                                        <th className="pb-2 font-semibold">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                                    {recentExams.map((exam) => (
                                                        <tr key={exam.id}>
                                                            <td className="py-2.5 font-bold text-slate-900">{exam.name}</td>
                                                            <td className="py-2.5 text-slate-500">{exam.subject_name}</td>
                                                            <td className="py-2.5 font-mono font-bold">
                                                                {exam.has_result ? `${exam.marks_obtained}/${exam.total_marks}` : 'Pending'}
                                                            </td>
                                                            <td className="py-2.5">
                                                                {exam.has_result ? (
                                                                    <Badge variant={exam.is_competent ? 'green' : 'rose'} size="xs">
                                                                        {exam.is_competent ? 'Competent' : 'NYC'}
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-slate-400 italic text-[11px]">Grading</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <EmptyState
                                            icon={Award}
                                            title="No Formal Examinations Recorded"
                                            description="Term results and CBT&A assessments will be registered here once locked by your instructor."
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* ────────────────────────────────────────────────────────
                            SECTION 5: QUICK ACCESS DIRECTORY
                        ──────────────────────────────────────────────────────── */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <Link
                                href={route('student.online-tests.index')}
                                className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-400 hover:shadow-sm transition text-center space-y-1.5 group"
                            >
                                <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center mx-auto transition">
                                    <Monitor className="h-4 w-4" />
                                </div>
                                <p className="text-xs font-bold text-slate-900">CBT Exams</p>
                                <span className="inline-block text-[10px] font-semibold text-slate-500">
                                    {pendingTestsCount > 0 ? `${pendingTestsCount} Due` : 'Open Portal'}
                                </span>
                            </Link>

                            <Link
                                href={route('student.lms.index')}
                                className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-400 hover:shadow-sm transition text-center space-y-1.5 group"
                            >
                                <div className="h-9 w-9 rounded-lg bg-emerald-50 text-govt-green group-hover:bg-govt-green group-hover:text-white flex items-center justify-center mx-auto transition">
                                    <BookOpen className="h-4 w-4" />
                                </div>
                                <p className="text-xs font-bold text-slate-900">LMS Materials</p>
                                <span className="inline-block text-[10px] font-semibold text-slate-500">
                                    {assignments.length} Tasks
                                </span>
                            </Link>

                            <Link
                                href={route('student.leaves.index')}
                                className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-purple-400 hover:shadow-sm transition text-center space-y-1.5 group"
                            >
                                <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center mx-auto transition">
                                    <CalendarDays className="h-4 w-4" />
                                </div>
                                <p className="text-xs font-bold text-slate-900">Leave Requests</p>
                                <span className="inline-block text-[10px] font-semibold text-slate-500">
                                    Apply / Status
                                </span>
                            </Link>

                            <Link
                                href={route('student.clearance.index')}
                                className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-sm transition text-center space-y-1.5 group"
                            >
                                <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-400 group-hover:text-slate-950 flex items-center justify-center mx-auto transition">
                                    <Award className="h-4 w-4" />
                                </div>
                                <p className="text-xs font-bold text-slate-900">Clearance</p>
                                <span className="inline-block text-[10px] font-semibold text-slate-500">
                                    Audits & Dues
                                </span>
                            </Link>

                            <Link
                                href={route('student.alumni.index')}
                                className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-sm transition text-center space-y-1.5 group"
                            >
                                <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center mx-auto transition">
                                    <Briefcase className="h-4 w-4" />
                                </div>
                                <p className="text-xs font-bold text-slate-900">Alumni Placements</p>
                                <span className="inline-block text-[10px] font-semibold text-slate-500">
                                    Jobs & Careers
                                </span>
                            </Link>

                            <Link
                                href={route('student.profile.edit')}
                                className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-400 hover:shadow-sm transition text-center space-y-1.5 group"
                            >
                                <div className="h-9 w-9 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-800 group-hover:text-white flex items-center justify-center mx-auto transition">
                                    <User className="h-4 w-4" />
                                </div>
                                <p className="text-xs font-bold text-slate-900">My Profile</p>
                                <span className="inline-block text-[10px] font-semibold text-slate-500">
                                    Personal Data
                                </span>
                            </Link>
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════════════════════════════════════
                    CONDITION 2: APPLIED CANDIDATE (AWAITING SELECTION / MERIT)
                ════════════════════════════════════════════════════════════════ */}
                {!isAdmitted && hasApplied && (() => {
                    const course = latestApplication?.course;
                    const isMerit = course?.requires_entrance_test === true || course?.admission_type === 'merit_based';
                    const isFcfs = !isMerit;
                    const status = latestApplication?.status || 'pending';
                    const hasClerkChallan = Boolean(latestApplication?.clerk_challan_path);
                    const hasReceipt = Boolean(latestApplication?.challan_receipt_path);
                    const isReceiptSubmitted = status === 'receipt_submitted' || (hasReceipt && status !== 'admitted' && status !== 'confirmed');
                    const isWaiting = isMerit && (status === 'waiting_list' || latestApplication?.entrance_test_attempt?.selection_status === 'waiting');
                    const isSelectedMerit = isMerit && (
                        status === 'challan_issued' ||
                        status === 'selected' ||
                        status === 'selected_for_admission' ||
                        latestApplication?.entrance_test_attempt?.selection_status === 'selected' ||
                        hasClerkChallan
                    );
                    const isSlipIssued = isMerit && !isSelectedMerit && !isWaiting && (
                        status === 'slip_issued' ||
                        status === 'verified' ||
                        Boolean(latestApplication?.entrance_roll_number)
                    );
                    const isRejected = status === 'rejected';
                    const isFcfsChallanIssued = isFcfs && (
                        status === 'challan_issued' ||
                        status === 'verified' ||
                        Boolean(latestApplication?.fee_challan) ||
                        hasClerkChallan
                    );
                    const isPendingScrutiny = !isRejected && !isReceiptSubmitted && !isWaiting && !isSelectedMerit && !isSlipIssued && !isFcfsChallanIssued;

                    const courseClassesStart = course?.classes_start_date ? new Date(course.classes_start_date) : new Date('2026-09-16');
                    const challanDueDate = latestApplication?.fee_challan?.payment_deadline || latestApplication?.fee_challan?.due_date 
                        ? new Date(latestApplication.fee_challan.payment_deadline || latestApplication.fee_challan.due_date)
                        : new Date(new Date(courseClassesStart).setDate(courseClassesStart.getDate() - 1));
                    const formattedDueDate = challanDueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                    const formattedClassesDate = courseClassesStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                    const feeAmount = latestApplication?.fee_challan?.total_amount || latestApplication?.fee_challan?.amount || 3500;
                    const remainingSeats = course?.remaining_seats ?? 25;
                    const totalSeats = course?.capacity ?? course?.intake_capacity ?? 50;

                    // Merit list helper for this course (strictly scoped to this applied merit course)
                    const courseMeritLists = isMerit 
                        ? (meritLists || []).filter((ml) => ml.course_id === latestApplication?.course_id)
                        : [];
                    const myTradeMeritList = courseMeritLists[0] || null;

                    return (
                        <div className="space-y-6">
                            {/* CASE 7: APPLICATION REJECTED */}
                            {isRejected && (
                                <div className="rounded-3xl p-6 sm:p-8 bg-rose-50 border-2 border-rose-300 shadow-sm space-y-4 text-rose-950">
                                    <div className="flex items-start space-x-4">
                                        <div className="h-12 w-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black shrink-0 shadow-md">
                                            <XCircle className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-200 text-rose-900 border border-rose-300 tracking-wider">
                                                    APPLICATION NOT APPROVED
                                                </span>
                                                <span className="text-xs font-mono font-bold text-rose-800">
                                                    Ref: {latestApplication?.application_number}
                                                </span>
                                            </div>
                                            <h3 className="font-black text-xl text-rose-950">
                                                Application Status: Scrutiny Declined
                                            </h3>
                                            <p className="text-xs text-rose-900 leading-relaxed">
                                                Your admission application for <strong>{course?.name}</strong> could not be approved by the Admission Scrutiny Committee.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Recorded Clerk Remarks */}
                                    <div className="p-4 rounded-2xl bg-white/90 border border-rose-300 space-y-1.5">
                                        <div className="flex items-center space-x-2 text-rose-900 font-bold text-xs">
                                            <AlertTriangle className="h-4 w-4 text-rose-600" />
                                            <span>Clerk Remarks & Reason:</span>
                                        </div>
                                        <p className="text-xs text-rose-950 pl-6 leading-relaxed">
                                            {latestApplication?.clerk_remarks || 'Your submitted academic credentials or certificates did not meet the mandatory criteria prescribed by TEVTA regulations.'}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-rose-100/50 border border-rose-200 text-xs text-rose-900 flex items-center justify-between">
                                        <p className="text-[11px]">
                                            To retrieve your original submitted documents or lodge a review appeal, please visit the GTTI Student Section in person.
                                        </p>
                                        <Link
                                            href={route('student.profile.edit')}
                                            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition shrink-0"
                                        >
                                            View Submitted Profile
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* CASE 6: STAMPED RECEIPT SUBMITTED (AWAITING PHYSICAL / FINAL VERIFICATION) */}
                            {!isRejected && isReceiptSubmitted && (
                                <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 border-2 border-blue-300 shadow-md space-y-6 text-blue-950">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-200 pb-5">
                                        <div className="flex items-start space-x-3.5">
                                            <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shrink-0 shadow-md">
                                                <Clock className="h-6 w-6 animate-spin" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-200 text-blue-900 border border-blue-300 tracking-wider">
                                                        ⚡ PAID RECEIPT SUBMITTED
                                                    </span>
                                                    <span className="text-xs font-mono font-bold text-blue-800">
                                                        Awaiting Clerical Scrutiny
                                                    </span>
                                                </div>
                                                <h3 className="font-black text-xl text-blue-950">
                                                    Bank Deposit Receipt Submitted
                                                </h3>
                                                <p className="text-xs text-blue-900">
                                                    Application #{latestApplication?.application_number} • Applied Trade: <strong>{course?.name}</strong>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 shrink-0">
                                            {latestApplication?.challan_receipt_path && (
                                                <a
                                                    href={'/storage/' + latestApplication.challan_receipt_path}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    <span>View Uploaded Slip</span>
                                                </a>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setShowReuploadForm(!showReuploadForm)}
                                                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs transition shadow-sm cursor-pointer"
                                            >
                                                <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                                                <span>{showReuploadForm ? 'Cancel' : 'Update Slip'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Prominent Directive Notice */}
                                    <div className="p-5 rounded-2xl bg-white border-2 border-blue-400 text-xs space-y-2 shadow-xs">
                                        <div className="flex items-center space-x-2 text-blue-900 font-black text-sm">
                                            <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                                            <span>Important Admission Finalization Notice:</span>
                                        </div>
                                        <p className="text-xs text-slate-700 font-medium pl-7 leading-relaxed">
                                            Challan receipt submitted. Please bring the original stamped receipt to the Student Section for physical verification and biometric enrollment.
                                        </p>
                                    </div>

                                    {/* Submission Metadata */}
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                                        <div className="p-3.5 rounded-xl bg-white/80 border border-blue-200 space-y-0.5">
                                            <span className="text-[10px] uppercase font-bold text-blue-600 block">Bank Reference / Branch</span>
                                            <span className="font-bold text-slate-900">{latestApplication?.challan_bank_reference || 'Submitted via Portal'}</span>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-white/80 border border-blue-200 space-y-0.5">
                                            <span className="text-[10px] uppercase font-bold text-blue-600 block">Deposit Date</span>
                                            <span className="font-bold text-slate-900 font-mono">
                                                {latestApplication?.challan_deposit_date ? new Date(latestApplication.challan_deposit_date).toLocaleDateString('en-GB') : 'Recent'}
                                            </span>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-white/80 border border-blue-200 space-y-0.5">
                                            <span className="text-[10px] uppercase font-bold text-blue-600 block">Fee Voucher Amount</span>
                                            <span className="font-bold text-slate-900 font-mono">PKR {Number(feeAmount).toLocaleString()}</span>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-white/80 border border-blue-200 space-y-0.5">
                                            <span className="text-[10px] uppercase font-bold text-blue-600 block">Classes Commence</span>
                                            <span className="font-bold text-slate-900">{formattedClassesDate}</span>
                                        </div>
                                    </div>

                                    {/* Optional Re-upload Form */}
                                    {showReuploadForm && (
                                        <form onSubmit={handleChallanUpload(latestApplication.id)} className="p-5 rounded-2xl bg-white border border-blue-300 space-y-4">
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                                                <Upload className="h-4 w-4 text-blue-600" />
                                                <span>Re-Upload Corrected Stamped Bank Deposit Slip</span>
                                            </h4>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block font-bold text-slate-700 text-xs mb-1">Receipt Image / PDF *</label>
                                                    <input
                                                        type="file"
                                                        required
                                                        accept=".jpg,.jpeg,.png,.pdf,.webp"
                                                        onChange={(e) => uploadChallanForm.setData('challan_receipt', e.target.files[0])}
                                                        className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 cursor-pointer"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block font-bold text-slate-700 text-xs mb-1">Bank Branch / Ref # *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={uploadChallanForm.data.bank_reference}
                                                        onChange={(e) => uploadChallanForm.setData('bank_reference', e.target.value)}
                                                        className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block font-bold text-slate-700 text-xs mb-1">Deposit Date *</label>
                                                    <input
                                                        type="date"
                                                        required
                                                        value={uploadChallanForm.data.deposit_date}
                                                        onChange={(e) => uploadChallanForm.setData('deposit_date', e.target.value)}
                                                        className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={uploadChallanForm.processing}
                                                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition disabled:opacity-50 cursor-pointer"
                                                >
                                                    {uploadChallanForm.processing ? 'Uploading...' : 'Re-submit Deposit Slip'}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}

                            {/* CASE 5: MERIT TRACK - WAITING LIST */}
                            {!isRejected && !isReceiptSubmitted && isWaiting && (
                                <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 shadow-md space-y-6 text-amber-950">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200 pb-5">
                                        <div className="flex items-start space-x-3.5">
                                            <div className="h-12 w-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
                                                <Clock className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-400 text-slate-950 shadow-xs">
                                                        WAITING LIST - RANK #{latestApplication.entrance_test_attempt?.merit_rank || 'N/A'}
                                                    </span>
                                                    <span className="text-xs font-mono font-bold text-amber-800">
                                                        Entrance Test Evaluated
                                                    </span>
                                                </div>
                                                <h3 className="font-black text-xl text-amber-950">
                                                    Admission Status: On Merit Waiting List
                                                </h3>
                                                <p className="text-xs text-amber-900">
                                                    Applied Trade: <strong>{course?.name}</strong> • Candidate: <strong>{user.name}</strong>
                                                </p>
                                            </div>
                                        </div>

                                        {myTradeMeritList && (
                                            <a
                                                href={route('clerk.merit-lists.download', myTradeMeritList.id)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white font-bold text-xs transition shadow-sm"
                                            >
                                                <Award className="h-4 w-4" />
                                                <span>View Official Merit List</span>
                                            </a>
                                        )}
                                    </div>

                                    {/* Clean Waiting Notice */}
                                    <div className="p-5 rounded-2xl bg-white border border-amber-300 text-xs space-y-2">
                                        <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                                            <AlertCircle className="h-4 w-4 text-amber-600" />
                                            <span>Waiting List Seat Allocation Policy:</span>
                                        </div>
                                        <p className="text-xs text-slate-700 leading-relaxed pl-6">
                                            You have passed the entrance examination and are currently placed on the Merit Waiting List. If any selected open merit candidates fail to deposit their admission fee within the payment deadline, vacant seats will be opened strictly in order of merit rank.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                        <div className="p-3.5 rounded-xl bg-white/70 border border-amber-200">
                                            <span className="text-[10px] font-bold text-amber-800 uppercase block">Your Merit Rank</span>
                                            <span className="font-black text-amber-950 text-base font-mono">
                                                Position #{latestApplication.entrance_test_attempt?.merit_rank || 'Evaluated'}
                                            </span>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-white/70 border border-amber-200">
                                            <span className="text-[10px] font-bold text-amber-800 uppercase block">Open Merit Quota</span>
                                            <span className="font-bold text-slate-900">{course?.capacity ?? 25} Seats Total</span>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-white/70 border border-amber-200">
                                            <span className="text-[10px] font-bold text-amber-800 uppercase block">Seat Upgrade Alert</span>
                                            <span className="font-bold text-slate-900">Automatic SMS & Dashboard Push</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CASE 4: MERIT TRACK - SELECTED ON OPEN MERIT & CHALLAN ISSUED */}
                            {!isRejected && !isReceiptSubmitted && !isWaiting && isSelectedMerit && (
                                <div className="rounded-3xl p-6 sm:p-8 bg-white border-2 border-emerald-400 shadow-xl space-y-6 text-slate-900">
                                    <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 text-emerald-950 space-y-2">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center space-x-2">
                                                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-600 text-white shadow-xs">
                                                    SELECTED ON OPEN MERIT - RANK #{latestApplication.entrance_test_attempt?.merit_rank || 1}
                                                </span>
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-200 text-emerald-900">
                                                    Offer of Admission
                                                </span>
                                            </div>

                                            {myTradeMeritList && (
                                                <a
                                                    href={route('clerk.merit-lists.download', myTradeMeritList.id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
                                                >
                                                    <Award className="h-3.5 w-3.5" />
                                                    <span>View Official Merit List</span>
                                                </a>
                                            )}
                                        </div>

                                        <h3 className="font-black text-xl text-emerald-950 pt-1">
                                            Congratulations! You are Selected for Admission in {course?.name}
                                        </h3>
                                        <p className="text-xs text-emerald-900 leading-relaxed">
                                            You have qualified on open merit in the entrance screening examination. Your official admission fee challan voucher has been issued. Deposit your fee before the deadline to lock your seat.
                                        </p>
                                    </div>

                                    {/* Payment Deadline Alert Strip */}
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                                        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-1 shadow-xs">
                                            <div className="flex items-center space-x-1.5 text-rose-700">
                                                <AlertTriangle className="h-4 w-4 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">LAST DATE TO PAY</span>
                                            </div>
                                            <div className="text-lg font-black text-rose-950">{formattedDueDate}</div>
                                            <p className="text-[10px] font-semibold text-rose-800">
                                                Strict deadline. Unpaid seats offered to waiting list.
                                            </p>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 space-y-1 shadow-xs">
                                            <div className="flex items-center space-x-1.5 text-emerald-700">
                                                <CreditCard className="h-4 w-4" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">TOTAL ADMISSION FEE</span>
                                            </div>
                                            <div className="text-lg font-black font-mono text-emerald-900">
                                                PKR {Number(feeAmount).toLocaleString()}
                                            </div>
                                            <p className="text-[10px] font-semibold text-emerald-800">
                                                Tuition, lab, and workshop fees included.
                                            </p>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-300 text-blue-950 space-y-1 shadow-xs">
                                            <div className="flex items-center space-x-1.5 text-blue-700">
                                                <Building2 className="h-4 w-4" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">AUTHORIZED BANKS</span>
                                            </div>
                                            <div className="text-sm font-black text-blue-950">NBP / BOP / College</div>
                                            <p className="text-[10px] font-semibold text-blue-800">
                                                Payable at any online branch nationwide.
                                            </p>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-1 shadow-xs">
                                            <div className="flex items-center space-x-1.5 text-amber-700">
                                                <Calendar className="h-4 w-4" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">CLASSES COMMENCE</span>
                                            </div>
                                            <div className="text-lg font-black text-amber-950">{formattedClassesDate}</div>
                                            <p className="text-[10px] font-semibold text-amber-800">
                                                Report at 08:00 AM sharp with stamped slip.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Bar: Download Fee Challan */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                                        <div className="space-y-1">
                                            <span className="text-xs font-mono font-bold text-slate-600">
                                                Challan #{latestApplication.fee_challan?.challan_number || `MERIT-${latestApplication.application_number}`}
                                            </span>
                                            <h4 className="font-black text-slate-900 text-base">
                                                Download Official Fee Challan Voucher
                                            </h4>
                                            <p className="text-xs text-slate-500">
                                                Take a printed copy of the 3-part bank challan to any National Bank of Pakistan branch.
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                                            {latestApplication.clerk_challan_path && (
                                                <a
                                                    href={route('applications.challan-document', latestApplication.id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2.5 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white font-black text-xs uppercase tracking-wider transition shadow-md flex items-center space-x-1.5"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    <span>Download Stamped Challan (PDF)</span>
                                                </a>
                                            )}
                                            <a
                                                href={route('applications.print-challan', latestApplication.id)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition shadow-md flex items-center space-x-2"
                                            >
                                                <Printer className="h-4 w-4 text-amber-400" />
                                                <span>Print 3-Copy Voucher</span>
                                            </a>
                                        </div>
                                    </div>

                                    {/* Inline Form to Upload Stamped Bank Receipt */}
                                    <form onSubmit={handleChallanUpload(latestApplication.id)} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                                            <Upload className="h-4 w-4 text-amber-500" />
                                            <span>Upload Paid Bank Receipt / Deposit Slip to Confirm Seat</span>
                                        </h4>

                                        {Object.keys(uploadChallanForm.errors).length > 0 && (
                                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
                                                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                                                <span>{uploadChallanForm.errors.challan_receipt || uploadChallanForm.errors.deposit_date || uploadChallanForm.errors.bank_reference || 'Please fix the errors below before submitting.'}</span>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block font-bold text-slate-700 text-xs mb-1">Receipt Image / PDF *</label>
                                                <input
                                                    type="file"
                                                    required
                                                    accept=".jpg,.jpeg,.png,.pdf,.webp"
                                                    onChange={(e) => uploadChallanForm.setData('challan_receipt', e.target.files[0])}
                                                    className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 cursor-pointer"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-bold text-slate-700 text-xs mb-1">Bank Branch / Ref # *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. NBP Model Branch / Scroll #1024"
                                                    value={uploadChallanForm.data.bank_reference}
                                                    onChange={(e) => uploadChallanForm.setData('bank_reference', e.target.value)}
                                                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-bold text-slate-700 text-xs mb-1">Deposit Date *</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={uploadChallanForm.data.deposit_date}
                                                    onChange={(e) => uploadChallanForm.setData('deposit_date', e.target.value)}
                                                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                                            <p className="text-[11px] text-slate-500">
                                                Deposit your fee at any NBP counter and upload the stamped customer copy here.
                                            </p>
                                            <button
                                                type="submit"
                                                disabled={uploadChallanForm.processing}
                                                className="px-5 py-2.5 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white font-bold text-xs transition disabled:opacity-50 cursor-pointer"
                                            >
                                                {uploadChallanForm.processing ? 'Uploading Slip...' : 'Submit Deposit Slip'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* CASE 3: MERIT TRACK - ROLL NUMBER SLIP ISSUED */}
                            {!isRejected && !isReceiptSubmitted && !isWaiting && !isSelectedMerit && isSlipIssued && (
                                <div className="space-y-6">
                                    <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 border-2 border-amber-500/50 shadow-2xl text-white space-y-6 relative overflow-hidden print-card">
                                        <div className="absolute right-4 bottom-2 text-slate-800/20 font-black text-8xl font-serif select-none pointer-events-none">
                                            GTTI
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                                            <div className="space-y-1.5">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500 text-slate-950 shadow-sm">
                                                        OFFICIAL ENTRANCE TEST ROLL NO SLIP
                                                    </span>
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                        ✓ VERIFIED BY CLERK
                                                    </span>
                                                    <span className="text-xs font-mono text-amber-400 font-black">
                                                        Roll No: {latestApplication.entrance_roll_number || latestApplication.application_number}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                                    Govt Technical Training Institute (GTTI) — Admit Card
                                                </h3>
                                                <p className="text-xs text-slate-400">
                                                    Pre-Admission Screening & Technical Aptitude Examination • Session {new Date().getFullYear()}
                                                </p>
                                            </div>

                                            <div className="flex items-center space-x-3 shrink-0 no-print">
                                                <a
                                                    href={route('admit-card.entrance-slip', latestApplication.id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                    <span>Print Roll Number Slip</span>
                                                </a>
                                            </div>
                                        </div>

                                        {/* Candidate & Test Schedule Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                                                <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
                                                    <User className="h-4 w-4" />
                                                    <span>Candidate Details</span>
                                                </div>
                                                <p className="font-bold text-white text-sm">{user.name}</p>
                                                <p className="text-xs text-slate-400">S/D/O {profile?.father_name || latestApplication.father_name || 'Guardian'}</p>
                                                <span className="text-[10px] font-mono text-slate-500 block">CNIC: {user.cnic || 'Verified'}</span>
                                            </div>

                                            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                                                <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
                                                    <GraduationCap className="h-4 w-4" />
                                                    <span>Applied Trade</span>
                                                </div>
                                                <p className="font-bold text-white text-sm">{course?.name}</p>
                                                <span className="text-[10px] text-slate-500 uppercase font-mono">
                                                    Merit-Based Selection
                                                </span>
                                            </div>

                                            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                                                <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Test Date & Time</span>
                                                </div>
                                                <p className="font-black text-white text-sm font-mono">
                                                    {latestApplication.test_date ? new Date(latestApplication.test_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Scheduled Soon'}
                                                </p>
                                                <span className="text-xs text-emerald-400 font-bold block font-mono">
                                                    {latestApplication.test_time || '09:00 AM Sharp'}
                                                </span>
                                            </div>

                                            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                                                <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>Test Hall / Venue</span>
                                                </div>
                                                <p className="font-bold text-white text-xs">{latestApplication.test_venue || 'GTTI Examination Hall'}</p>
                                                <span className="text-[10px] text-slate-400">Khanpur Road, Rahim Yar Khan</span>
                                            </div>
                                        </div>

                                        {/* Mandatory Instructions */}
                                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5">
                                            <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>Mandatory Instructions for Test Day:</span>
                                            </div>
                                            <p className="text-slate-300 leading-relaxed text-[11px]">
                                                1. You must print this Roll No Slip and bring it with you to college on test day.<br/>
                                                2. Bring your Original CNIC / Smart Card / B-Form and clipboard with blue/black ballpoint.<br/>
                                                3. Mobile phones, programmable calculators, and smartwatches are strictly prohibited in the exam hall.<br/>
                                                {latestApplication.clerk_notice && <span>4. <strong>Clerk Note:</strong> {latestApplication.clerk_notice}</span>}
                                            </p>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div>
                                                <strong className="text-white block">Next Step:</strong>
                                                <span>After appearing for the test, your score will be compiled and the Official Merit List will be published on this portal.</span>
                                            </div>
                                            {myTradeMeritList && (
                                                <a
                                                    href={route('clerk.merit-lists.download', myTradeMeritList.id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white font-bold text-xs transition shadow-sm shrink-0"
                                                >
                                                    <Award className="h-4 w-4" />
                                                    <span>View Official Merit List</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CASE 2: DIRECT FCFS TRACK - SEAT URGENCY & CHALLAN ISSUED */}
                            {!isRejected && !isReceiptSubmitted && !isWaiting && !isSelectedMerit && !isSlipIssued && isFcfsChallanIssued && (
                                <div className="space-y-6">
                                    {/* Prominent Seat-Urgency Alert */}
                                    <div className="rounded-2xl p-5 bg-gradient-to-r from-amber-50 via-amber-100/80 to-amber-50 border-2 border-amber-400 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                                        <div className="flex items-start space-x-3.5">
                                            <div className="h-11 w-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-md">
                                                <AlertTriangle className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <div className="flex items-center space-x-2">
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-slate-950">
                                                        DIRECT ADMISSION TRACK (FIRST-COME-FIRST-SERVED)
                                                    </span>
                                                    <span className="text-xs font-mono font-bold text-amber-900">
                                                        FCFS Quota
                                                    </span>
                                                </div>
                                                <h3 className="font-black text-lg text-amber-950">
                                                    Pay Bank Challan Promptly to Lock Your Seat!
                                                </h3>
                                                <p className="text-xs text-amber-900/90 leading-relaxed">
                                                    Admissions for <strong>{course?.name}</strong> are processed directly without an entrance test. Seats are allocated upon verified fee deposit. 
                                                    <span className="font-bold text-amber-950 ml-1 underline">Only {remainingSeats} of {totalSeats} seats remaining!</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 bg-white/80 p-3.5 rounded-xl border border-amber-300">
                                            <span className="text-2xl font-black font-mono text-amber-900 block">
                                                {remainingSeats} / {totalSeats}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                                                Remaining Seats
                                            </span>
                                        </div>
                                    </div>

                                    {/* Fee Challan & Receipt Upload Card */}
                                    <div className="rounded-3xl p-6 sm:p-7 bg-white border-2 border-slate-200 shadow-xl space-y-5 print-card">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                        OFFICIAL ADMISSION FEE CHALLAN
                                                    </span>
                                                    <span className="text-xs font-mono font-bold text-slate-700">
                                                        Challan #{latestApplication.fee_challan?.challan_number || `FCFS-${latestApplication.application_number}`}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-black text-slate-900">
                                                    Admission Fee Voucher: {course?.name}
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Payable at any online branch of National Bank of Pakistan (NBP), Bank of Punjab (BOP), or GTTI Accounts Counter.
                                                </p>
                                            </div>

                                            <div className="flex items-center space-x-3 shrink-0">
                                                <div className="text-right mr-2">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Fee Amount</span>
                                                    <span className="text-xl font-black font-mono text-govt-green">
                                                        PKR {Number(feeAmount).toLocaleString()}
                                                    </span>
                                                </div>

                                                {latestApplication.clerk_challan_path && (
                                                    <a
                                                        href={route('applications.challan-document', latestApplication.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-4 py-2.5 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white font-black text-xs uppercase tracking-wider transition shadow-md flex items-center space-x-1.5"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                        <span>Download Stamped Challan</span>
                                                    </a>
                                                )}

                                                <a
                                                    href={route('applications.print-challan', latestApplication.id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider transition shadow-md flex items-center space-x-2"
                                                >
                                                    <Printer className="h-4 w-4 text-amber-400" />
                                                    <span>Print 3-Copy Voucher</span>
                                                </a>
                                            </div>
                                        </div>

                                        {/* Notice Strip */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                                                <span className="text-[10px] font-bold text-rose-700 uppercase block">Payment Deadline</span>
                                                <span className="font-bold text-rose-950 font-mono">{formattedDueDate}</span>
                                            </div>
                                            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                                                <span className="text-[10px] font-bold text-blue-700 uppercase block">Classes Commencement</span>
                                                <span className="font-bold text-blue-950">{formattedClassesDate}</span>
                                            </div>
                                            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                                                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Total Fee</span>
                                                <span className="font-bold text-emerald-950 font-mono">PKR {Number(feeAmount).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {/* Upload Stamped Receipt Form */}
                                        <form onSubmit={handleChallanUpload(latestApplication.id)} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                                                    <Upload className="h-4 w-4 text-amber-500" />
                                                    <span>Upload Paid Bank Receipt / Deposit Slip</span>
                                                </h4>
                                                <span className="text-[10px] text-slate-500 font-medium">Required to finalize seat reservation</span>
                                            </div>

                                            {Object.keys(uploadChallanForm.errors).length > 0 && (
                                                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
                                                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                                                    <span>{uploadChallanForm.errors.challan_receipt || uploadChallanForm.errors.deposit_date || uploadChallanForm.errors.bank_reference || 'Please fix the errors below before submitting.'}</span>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block font-bold text-slate-700 text-xs mb-1">Receipt Image / PDF *</label>
                                                    <input
                                                        type="file"
                                                        required
                                                        accept=".jpg,.jpeg,.png,.pdf,.webp"
                                                        onChange={(e) => uploadChallanForm.setData('challan_receipt', e.target.files[0])}
                                                        className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 cursor-pointer"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block font-bold text-slate-700 text-xs mb-1">Bank Branch / Ref # *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="e.g. NBP Main Branch / Scroll #982"
                                                        value={uploadChallanForm.data.bank_reference}
                                                        onChange={(e) => uploadChallanForm.setData('bank_reference', e.target.value)}
                                                        className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block font-bold text-slate-700 text-xs mb-1">Deposit Date *</label>
                                                    <input
                                                        type="date"
                                                        required
                                                        value={uploadChallanForm.data.deposit_date}
                                                        onChange={(e) => uploadChallanForm.setData('deposit_date', e.target.value)}
                                                        className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                                                <p className="text-[11px] text-slate-500">
                                                    Deposit your fee at any NBP counter and upload the stamped customer copy here.
                                                </p>
                                                <button
                                                    type="submit"
                                                    disabled={uploadChallanForm.processing}
                                                    className="px-5 py-2.5 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white font-bold text-xs transition disabled:opacity-50 cursor-pointer"
                                                >
                                                    {uploadChallanForm.processing ? 'Uploading Slip...' : 'Submit Deposit Slip'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* CASE 1: APPLICATION SUBMITTED / PENDING SCRUTINY (DEFAULT) */}
                            {isPendingScrutiny && (
                                <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 border-2 border-slate-800 shadow-xl space-y-6 text-white">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                                        <div className="flex items-start space-x-4">
                                            <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black shrink-0">
                                                <Clock className="h-6 w-6 animate-pulse" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider">
                                                        DOCUMENT SCRUTINY IN PROGRESS
                                                    </span>
                                                    <span className="text-xs font-mono font-bold text-slate-400">
                                                        App #{latestApplication?.application_number}
                                                    </span>
                                                </div>
                                                <h3 className="font-black text-xl text-white">
                                                    Application Under Document Scrutiny
                                                </h3>
                                                <p className="text-xs text-slate-300">
                                                    The Student Section is scrutinizing your academic credentials and documents.
                                                </p>
                                            </div>
                                        </div>

                                        <Link
                                            href={route('student.profile.edit')}
                                            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700 shrink-0"
                                        >
                                            <FileText className="h-4 w-4 text-emerald-400" />
                                            <span>View Submitted Application</span>
                                        </Link>
                                    </div>

                                    {/* Application Details Summary */}
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                                        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Applied Trade</span>
                                            <span className="font-bold text-white text-sm">{course?.name}</span>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Admission Path</span>
                                            <span className="font-bold text-amber-400">
                                                {isMerit ? 'Merit-Based (Entrance Test Required)' : 'Direct Admission (FCFS Quota)'}
                                            </span>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Date Submitted</span>
                                            <span className="font-bold text-white font-mono">
                                                {latestApplication?.created_at ? new Date(latestApplication.created_at).toLocaleDateString('en-GB') : 'Recent'}
                                            </span>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Scrutiny Desk</span>
                                            <span className="font-bold text-emerald-400">Student Section Clerk</span>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-start space-x-2.5">
                                        <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                                        <span>
                                            Once your credentials are confirmed by the clerk, your next admission step ({isMerit ? 'Entrance Test Roll Number Slip' : 'Official Fee Challan Voucher'}) will automatically appear right here.
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* OFFICIAL PUBLISHED MERIT LISTS DESK (ONLY FOR MERIT-BASED APPLICANTS FOR THIS SPECIFIC COURSE) */}
                            {isMerit && courseMeritLists && courseMeritLists.length > 0 && (
                                <div className="rounded-3xl p-6 sm:p-7 bg-white border-2 border-slate-200 shadow-sm space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-govt-green flex items-center justify-center font-bold">
                                                <Award className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-black text-slate-900 text-base">Official Merit List: {course?.name}</h3>
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                                                        Admission Office
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    Official candidate selection merit gazette published specifically for your applied trade.
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                            {courseMeritLists.length} Published List{courseMeritLists.length > 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                        {courseMeritLists.map((list) => (
                                            <div 
                                                key={list.id} 
                                                className="p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20"
                                            >
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                                                            {list.course_name || course?.name}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                                                            Your Applied Trade
                                                        </span>
                                                    </div>
                                                    <h4 className="font-black text-slate-900 text-sm leading-snug">{list.title}</h4>
                                                    {list.classes_start_date && (
                                                        <p className="text-xs text-emerald-800 font-semibold flex items-center space-x-1.5">
                                                            <Calendar className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                                            <span>Classes Start: <strong>{list.classes_start_date}</strong></span>
                                                        </p>
                                                    )}
                                                    {list.remarks && (
                                                        <p className="text-[11px] text-slate-500 line-clamp-2">{list.remarks}</p>
                                                    )}
                                                </div>

                                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                                    <span className="text-[10px] font-mono text-slate-400">
                                                        {list.published_at || 'Official'}
                                                    </span>
                                                    <a
                                                        href={route('clerk.merit-lists.download', list.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white font-bold text-xs transition shadow-sm"
                                                    >
                                                        <Download className="h-3.5 w-3.5" />
                                                        <span>Download Official List</span>
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Application Summary Table */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center space-x-2.5">
                                        <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-govt-green">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <CardTitle>Application Submission History</CardTitle>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="text-slate-500 border-b border-slate-100">
                                                    <th className="pb-3 font-semibold">Application Number</th>
                                                    <th className="pb-3 font-semibold">Applied Course / Trade</th>
                                                    <th className="pb-3 font-semibold">Campaign</th>
                                                    <th className="pb-3 font-semibold">Documents</th>
                                                    <th className="pb-3 font-semibold">Status</th>
                                                    <th className="pb-3 font-semibold">Submission Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                                {applications.map((app) => (
                                                    <tr key={app.id}>
                                                        <td className="py-3 font-mono font-bold text-govt-green">
                                                            {app.application_number}
                                                        </td>
                                                        <td className="py-3">
                                                            <p className="font-bold text-slate-900">{app.course?.name}</p>
                                                            <p className="text-[11px] text-slate-500">{app.course?.trade?.program?.department?.name}</p>
                                                        </td>
                                                        <td className="py-3 text-slate-600">{app.admission_campaign?.name}</td>
                                                        <td className="py-3">{app.documents?.length || 0} Attached</td>
                                                        <td className="py-3">
                                                            <Badge variant={getStatusBadgeVariant(app.status)} size="xs">
                                                                {app.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 font-mono text-[11px] text-slate-500">
                                                            {app.created_at ? app.created_at.substring(0, 10) : 'Recent'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    );
                })()}

                {/* ════════════════════════════════════════════════════════════════
                    CONDITION 3: NEW USER / ONBOARDING STEPPER
                ════════════════════════════════════════════════════════════════ */}
                {!isEnrolled && !hasApplied && (
                    <div className="space-y-6">
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-govt-green via-govt-green-600 to-[#002B12] text-white border border-govt-green-700/60 p-5 sm:p-6 shadow-sm">
                            <div className="space-y-2 max-w-3xl">
                                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-md bg-white/10 text-emerald-200 border border-white/15 text-xs font-semibold">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>Welcome to GTTI Admissions Pipeline</span>
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                                    Hello, {user.name}!
                                </h1>
                                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                                    Welcome to the student applicant portal for Govt. Technical Training Institute, Rahim Yar Khan. Complete your admission workflow below to apply for government-accredited technical diplomas and CBT&A trades.
                                </p>
                            </div>
                        </div>

                        {meritLists && meritLists.length > 0 && (
                            <div className="rounded-3xl p-6 bg-white border-2 border-slate-200 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-govt-green flex items-center justify-center font-bold">
                                            <Award className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 text-base">Official Institutional Merit Lists</h3>
                                            <p className="text-xs text-slate-500">Official candidate selection lists uploaded by College Admission Desk.</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                        {meritLists.length} Published
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                    {meritLists.map((list) => (
                                        <div key={list.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                                            <div>
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-700">
                                                    {list.course?.name || 'General Merit List'}
                                                </span>
                                                <h4 className="font-black text-slate-900 text-sm mt-1">{list.title}</h4>
                                                {list.classes_start_date && (
                                                    <p className="text-xs text-emerald-800 font-semibold mt-1">
                                                        Classes Start: {new Date(list.classes_start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                                                <span className="text-[10px] font-mono text-slate-400">
                                                    {list.published_at ? new Date(list.published_at).toLocaleDateString('en-GB') : 'Official'}
                                                </span>
                                                <a
                                                    href={route('clerk.merit-lists.download', list.id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-govt-green text-white font-bold text-xs hover:bg-govt-green-600 transition"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                    <span>Download List</span>
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Step 1: Master Profile */}
                            <Card className="p-5 flex flex-col justify-between space-y-4">
                                <div className="flex items-start space-x-3.5">
                                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-xs ${
                                        isProfileComplete ? 'bg-govt-green' : 'bg-amber-500'
                                    }`}>
                                        {isProfileComplete ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-base font-bold text-slate-900">
                                                Step 1: Master Profile
                                            </h3>
                                            <Badge variant={isProfileComplete ? 'green' : 'amber'} size="xs">
                                                {isProfileComplete ? 'Completed' : 'Required'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                            {isProfileComplete
                                                ? `Permanent student identity is verified (${profile.father_name} • ${profile.domicile_district}).`
                                                : 'Please record your guardian and domicile details before submitting an application.'}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <Link
                                        href={route('student.profile.edit')}
                                        className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                                            isProfileComplete
                                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs'
                                        }`}
                                    >
                                        <span>{isProfileComplete ? 'Edit Master Profile' : 'Step 1: Complete Master Profile'}</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </Card>

                            {/* Step 2: Course Application */}
                            <Card className="p-5 flex flex-col justify-between space-y-4">
                                <div className="flex items-start space-x-3.5">
                                    <div className="h-11 w-11 rounded-xl bg-govt-green text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                                        <GraduationCap className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-base font-bold text-slate-900">
                                                Step 2: Submit Application
                                            </h3>
                                            <Badge variant="green" size="xs">
                                                Open
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                            Select your technical trade, attach CNIC/certificate scans, and submit for merit verification.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <Link
                                        href={route('student.application.create')}
                                        className="w-full py-2 px-4 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white text-xs font-bold transition shadow-xs flex items-center justify-center space-x-2"
                                    >
                                        <span>Step 2: Submit Application</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
