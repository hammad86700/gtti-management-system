import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
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
    X
} from 'lucide-react';
import KpiCard from '@/Components/UI/KpiCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/UI/Card';
import Badge from '@/Components/UI/Badge';
import EmptyState from '@/Components/UI/EmptyState';

export default function Dashboard({
    userData,
    announcements = [],
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

    const isEnrolled = enrollments.length > 0;
    const hasApplied = applications.length > 0;
    const isProfileComplete = Boolean(
        profile?.father_name &&
        profile?.date_of_birth &&
        profile?.gender &&
        profile?.domicile_district &&
        profile?.address
    );

    const latestEnrollment = enrollments[0];
    const latestApplication = applications[0];

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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                    <span className="font-bold text-govt-green">GTTI RYK</span>
                    <span>/</span>
                    <span className="text-slate-900 font-semibold truncate">
                        {isEnrolled ? 'Student Academic Dashboard' : 'Applicant Portal'}
                    </span>
                </div>
            }
        >
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
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center space-x-2.5">
                                        <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-govt-green">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <CardTitle>Coursework Assignments</CardTitle>
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
                {!isEnrolled && hasApplied && (
                    <div className="space-y-6">
                        {/* Application Status Banner */}
                        <div className="rounded-xl bg-gradient-to-r from-govt-green via-govt-green-600 to-[#002B12] p-5 sm:p-6 text-white shadow-sm border border-govt-green-700/60 space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1.5 max-w-2xl">
                                    <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-md bg-white/10 text-emerald-200 border border-white/15 text-xs font-semibold">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>Admission Lifecycle in Progress</span>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                        Application Under Review: {latestApplication?.application_number}
                                    </h2>
                                    <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                                        Your admission application for <strong className="text-white font-bold">{latestApplication?.course?.name}</strong> has been received by GTTI Rahim Yar Khan.
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 text-center shrink-0">
                                    <p className="text-[10px] text-emerald-200 uppercase font-bold">Current Decision</p>
                                    <span className="inline-block mt-1">
                                        <Badge variant={getStatusBadgeVariant(latestApplication?.status)} size="sm">
                                            {latestApplication?.status?.toUpperCase()}
                                        </Badge>
                                    </span>
                                </div>
                            </div>

                            {latestApplication?.status === 'selected' && (
                                <div className="p-3.5 rounded-xl bg-white/15 border border-white/20 text-xs flex items-center space-x-3">
                                    <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0" />
                                    <div>
                                        <p className="font-bold text-sm text-white">Congratulations! You have been selected on merit.</p>
                                        <p className="text-[11px] text-emerald-100 mt-0.5">
                                            The admissions office is finalizing batch allocations. Your permanent trainee ID will be activated shortly.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

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
                )}

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
