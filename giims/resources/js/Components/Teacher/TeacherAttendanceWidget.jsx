import React, { useState, useEffect } from 'react';
import { useForm, Link } from '@inertiajs/react';
import {
    Camera,
    Upload,
    CheckCircle2,
    Clock,
    Wifi,
    WifiOff,
    AlertTriangle,
    Eye,
    X,
    Calendar,
    Sparkles,
    ShieldCheck,
    MapPin,
    FileText,
    ZoomIn,
    ArrowRight
} from 'lucide-react';
import Badge from '@/Components/UI/Badge';
import TeacherLeaveModal from './TeacherLeaveModal';

export default function TeacherAttendanceWidget({
    todayAttendance = null,
    summary = null,
    recentLeaves = [],
    clientIp = '',
    isCampusIp = false,
    lateCutoff = '08:30',
}) {
    // Live Clock
    const [currentTime, setCurrentTime] = useState('');
    const [isLateTime, setIsLateTime] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [isZoomOpen, setIsZoomOpen] = useState(false);

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setCurrentTime(timeString);

            // Compare with lateCutoff (e.g. 08:30)
            const [cutoffHours, cutoffMinutes] = lateCutoff.split(':').map(Number);
            const cutoffDate = new Date();
            cutoffDate.setHours(cutoffHours, cutoffMinutes, 0, 0);
            setIsLateTime(now > cutoffDate);
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, [lateCutoff]);

    // Attendance Submission Form (State A)
    const { data, setData, post, processing, errors, reset } = useForm({
        proof_image: null,
        remarks: '',
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('proof_image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClearPhoto = () => {
        setData('proof_image', null);
        setImagePreview(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('teacher.faculty-attendance.store'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                reset();
                setImagePreview(null);
            },
        });
    };

    const formatTimeDisplay = (timeStr) => {
        if (!timeStr) return '';
        try {
            const parts = timeStr.split(':');
            const h = parseInt(parts[0], 10);
            const m = parts[1];
            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayH = h % 12 || 12;
            return `${displayH}:${m} ${ampm}`;
        } catch (e) {
            return timeStr;
        }
    };

    return (
        <div className="w-full mb-6">
            {todayAttendance ? (
                /* ========================================================================= */
                /* STATE B: MARKED TODAY                                                    */
                /* ========================================================================= */
                <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-950/80 shadow-md p-5 transition-all">
                    {/* Background Decorative Glow */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                        {/* Left Side: Status & Verification Details */}
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
                                <CheckCircle2 className="w-7 h-7" />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        Daily Faculty Attendance Recorded
                                    </span>
                                    {todayAttendance.status === 'late' ? (
                                        <Badge variant="amber" dot size="md">
                                            Checked In at {formatTimeDisplay(todayAttendance.check_in_time)} — Late Arrival
                                        </Badge>
                                    ) : (
                                        <Badge variant="green" dot size="md">
                                            Checked In at {formatTimeDisplay(todayAttendance.check_in_time)} — Present (On Time)
                                        </Badge>
                                    )}

                                    {todayAttendance.is_ip_verified ? (
                                        <Badge variant="green" size="md">
                                            <Wifi className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                            Campus Wi-Fi Verified
                                        </Badge>
                                    ) : (
                                        <Badge variant="amber" size="md">
                                            <WifiOff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                            Remote / Off-Campus Flagged
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        Date: {todayAttendance.attendance_date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        IP: {todayAttendance.ip_address}
                                    </span>
                                    {todayAttendance.remarks && (
                                        <span className="flex items-center gap-1 italic text-slate-600 dark:text-slate-300">
                                            "{todayAttendance.remarks}"
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Proof Thumbnail & Quick Links */}
                        <div className="flex items-center gap-3 self-stretch lg:self-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 dark:border-slate-800">
                            {/* Proof Image Snapshot */}
                            <div className="flex items-center gap-2">
                                {todayAttendance.proof_image_url || todayAttendance.proof_image_path ? (
                                    <div
                                        onClick={() => setIsZoomOpen(true)}
                                        className="group relative w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-500/40 cursor-pointer shadow hover:shadow-md transition-all shrink-0"
                                        title="Click to zoom classroom proof snapshot"
                                    >
                                        <img
                                            src={todayAttendance.proof_image_url || `/storage/${todayAttendance.proof_image_path}`}
                                            alt="Attendance Proof Snapshot"
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                                        />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <ZoomIn className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                ) : null}

                                <div className="text-left">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Classroom Proof
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setIsZoomOpen(true)}
                                        className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                    >
                                        <Eye className="w-3 h-3" />
                                        Inspect Photo
                                    </button>
                                </div>
                            </div>

                            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1" />

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsLeaveModalOpen(true)}
                                    className="px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                                >
                                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                    Leave Desk
                                </button>
                                <Link
                                    href={route('teacher.faculty-attendance.index')}
                                    className="px-3 py-2 text-xs font-semibold rounded-xl text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center gap-1"
                                >
                                    Register
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* ========================================================================= */
                /* STATE A: UNMARKED TODAY                                                  */
                /* ========================================================================= */
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden transition-all">
                    {/* Header Banner */}
                    <div className="px-5 py-3.5 bg-gradient-to-r from-pine-900 via-emerald-900 to-pine-800 text-white flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-emerald-300 border border-white/10 shadow-sm">
                                <Camera className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold tracking-tight">
                                    Faculty Self-Attendance & Classroom Proof Check-In
                                </h3>
                                <p className="text-[11px] text-emerald-200/90 font-medium">
                                    Mandatory daily photographic evidence & automated institutional network verification
                                </p>
                            </div>
                        </div>

                        {/* Live Digital Clock & Window */}
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-sm font-extrabold tracking-wider font-mono text-emerald-300">
                                    {currentTime || 'Loading...'}
                                </div>
                                <div className="text-[10px] font-medium text-emerald-200/80">
                                    {isLateTime ? (
                                        <span className="text-amber-300 font-semibold">Late Cutoff ({lateCutoff} AM) Passed</span>
                                    ) : (
                                        <span className="text-emerald-300 font-semibold">On-Time (Cutoff: {lateCutoff} AM)</span>
                                    )}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsLeaveModalOpen(true)}
                                className="px-3 py-1.5 text-xs font-semibold bg-white/15 hover:bg-white/25 rounded-xl border border-white/20 transition-colors flex items-center gap-1.5"
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                Request Leave
                            </button>
                        </div>
                    </div>

                    {/* Network Status Banner */}
                    <div className={`px-5 py-2 text-xs flex items-center justify-between border-b ${
                        isCampusIp
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/50'
                            : 'bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-100 dark:border-amber-900/50'
                    }`}>
                        <div className="flex items-center gap-2 font-medium">
                            {isCampusIp ? (
                                <>
                                    <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>GTTI Institutional Network Active ({clientIp}) — Wi-Fi verification will pass.</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                    <span>Off-Campus / Remote IP ({clientIp}) — Attendance will be flagged for Principal verification.</span>
                                </>
                            )}
                        </div>
                        <span className="text-[11px] opacity-75 hidden sm:inline">
                            Status: <strong className="font-bold">{isLateTime ? 'Late Arrival' : 'Present'}</strong>
                        </span>
                    </div>

                    {/* Check-In Submission Form */}
                    <form onSubmit={handleSubmit} className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            {/* Photo Upload / Capture Drop Area */}
                            <div className="md:col-span-5">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Classroom / Lab Proof Snapshot <span className="text-rose-500">*</span>
                                </label>

                                {imagePreview ? (
                                    <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500/50 h-28 bg-slate-900 flex items-center justify-center group shadow-sm">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={handleClearPhoto}
                                                className="px-2.5 py-1 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-1 shadow"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                                Retake
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-50/60 dark:bg-slate-800/40 hover:bg-emerald-50/20 h-28">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Camera className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                            <Upload className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Capture or Upload Classroom Photo
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            Click to open camera or browse (JPEG/PNG, Max 4MB)
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg"
                                            capture="environment"
                                            onChange={handleFileChange}
                                            className="sr-only"
                                        />
                                    </label>
                                )}
                                {errors.proof_image && (
                                    <p className="mt-1 text-xs text-rose-500 font-medium flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        {errors.proof_image}
                                    </p>
                                )}
                            </div>

                            {/* Remarks & Batches Context */}
                            <div className="md:col-span-4">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Session Notes / Location Details <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <textarea
                                    rows="3"
                                    value={data.remarks}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    placeholder="e.g., Computer Lab 1 (Practical Session), Mechanical Workshop, etc."
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400 h-28 resize-none"
                                />
                                {errors.remarks && (
                                    <p className="mt-1 text-xs text-rose-500 font-medium">{errors.remarks}</p>
                                )}
                            </div>

                            {/* Check-In Button */}
                            <div className="md:col-span-3 flex flex-col justify-end h-full pt-2 md:pt-0">
                                <button
                                    type="submit"
                                    disabled={processing || !data.proof_image}
                                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 ${
                                        !data.proof_image
                                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                                            : isLateTime
                                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30 hover:shadow-lg'
                                            : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/30 hover:shadow-lg'
                                    }`}
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Verifying & Checking In...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            {isLateTime ? 'Submit Late Attendance' : 'Submit Daily Attendance'}
                                        </>
                                    )}
                                </button>

                                <div className="mt-2 text-center">
                                    <Link
                                        href={route('teacher.faculty-attendance.index')}
                                        className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                    >
                                        View Full Monthly Attendance Log →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* High-Resolution Proof Modal Zoom */}
            {isZoomOpen && todayAttendance && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-emerald-600" />
                                    Daily Classroom Proof Snapshot
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                    Uploaded on {todayAttendance.attendance_date} at {formatTimeDisplay(todayAttendance.check_in_time)} • IP: {todayAttendance.ip_address}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsZoomOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 bg-slate-950 flex items-center justify-center">
                            <img
                                src={todayAttendance.proof_image_url || `/storage/${todayAttendance.proof_image_path}`}
                                alt="Classroom Proof"
                                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-lg"
                            />
                        </div>
                        {todayAttendance.remarks && (
                            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
                                <span className="font-bold text-slate-900 dark:text-white">Remarks:</span> {todayAttendance.remarks}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Leave Application Drawer / Modal */}
            <TeacherLeaveModal
                isOpen={isLeaveModalOpen}
                onClose={() => setIsLeaveModalOpen(false)}
                recentLeaves={recentLeaves}
            />
        </div>
    );
}
