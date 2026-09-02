import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import {
    CalendarDays,
    Calendar,
    FileText,
    ArrowLeft,
    CheckCircle2,
    Clock,
    UploadCloud,
    Paperclip,
    AlertCircle,
    XCircle,
    Send,
    PlusCircle,
    Inbox,
    Camera,
    ShieldAlert
} from 'lucide-react';

export default function Index({ leaves = [], profile }) {
    const todayDate = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        start_date: todayDate,
        end_date: todayDate,
        category: 'Medical / Sickness',
        reason: '',
        document: null,
    });

    const [fileName, setFileName] = useState('');

    const leaveCategories = [
        'Medical / Sickness',
        'Urgent Domestic / Family Affair',
        'Family Wedding / Ceremony',
        'Academic / Board Examination',
        'Emergency / Other Justified Cause'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('student.leaves.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset('reason', 'document');
                setFileName('');
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('dashboard')}
                            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h2 className="text-xl font-bold leading-tight text-gray-800 font-serif">
                                Student Leave Application Portal
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Submit formal leave requests with instant parent notification dispatches
                            </p>
                        </div>
                    </div>

                    <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-govt-green-500/10 text-emerald-700 border border-govt-green-200">
                        {leaves.length} Applications Logged
                    </span>
                </div>
            }
        >
            <Head title="Leave Application Portal - GIIMS" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN: SUBMIT LEAVE REQUEST FORM */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
                            <div className="flex items-center space-x-2.5 pb-3 border-b border-gray-100">
                                <div className="h-9 w-9 rounded-2xl bg-govt-green/10 text-govt-green flex items-center justify-center font-bold">
                                    <CalendarDays className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 font-serif">
                                        Apply for Leave of Absence
                                    </h3>
                                    <p className="text-[11px] text-gray-500">
                                        Parents receive automated notifications upon submission
                                    </p>
                                </div>
                            </div>

                            {recentlySuccessful && (
                                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                    <span>Leave application submitted and parent alert dispatched!</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                                {/* Reason Category */}
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1 uppercase tracking-wider text-[11px]">
                                        Leave Classification / Category <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="w-full text-base sm:text-xs px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-900 focus:ring-govt-green focus:border-govt-green"
                                    >
                                        {leaveCategories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && (
                                        <p className="text-[11px] text-rose-500 mt-1">{errors.category}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1 uppercase tracking-wider text-[11px]">
                                            From Date <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                            className="w-full text-base sm:text-xs px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-900 focus:ring-govt-green focus:border-govt-green"
                                        />
                                        {errors.start_date && (
                                            <p className="text-[11px] text-rose-500 mt-1">{errors.start_date}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1 uppercase tracking-wider text-[11px]">
                                            To Date <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                            className="w-full text-base sm:text-xs px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-900 focus:ring-govt-green focus:border-govt-green"
                                        />
                                        {errors.end_date && (
                                            <p className="text-[11px] text-rose-500 mt-1">{errors.end_date}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-bold text-gray-700 mb-1 uppercase tracking-wider text-[11px]">
                                        Formal Application / Reason for Absence <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="State specific reasons for your leave request (e.g. suffering from viral fever, doctor advised 3 days bed rest)..."
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        className="w-full text-base sm:text-xs px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:ring-govt-green focus:border-govt-green"
                                    />
                                    {errors.reason && (
                                        <p className="text-[11px] text-rose-500 mt-1">{errors.reason}</p>
                                    )}
                                </div>

                                {/* Attachment Dropzone with Camera Scanner option */}
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1 flex items-center justify-between uppercase tracking-wider text-[11px]">
                                        <span>Medical Note / Supporting Slip (Optional)</span>
                                        <span className="text-[10px] text-govt-green font-bold flex items-center space-x-1">
                                            <Camera className="h-3 w-3" />
                                            <span>Camera Scan</span>
                                        </span>
                                    </label>
                                    <div className="relative border-2 border-dashed border-gray-300 hover:border-govt-green rounded-2xl p-4 text-center bg-gray-50 hover:bg-emerald-50/20 transition min-h-[60px] flex flex-col items-center justify-center cursor-pointer">
                                        <div className="flex items-center space-x-1.5 text-gray-400 mb-1">
                                            <Camera className="h-4 w-4 text-govt-green" />
                                            <UploadCloud className="h-4 w-4" />
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            capture="environment"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                setData('document', file);
                                                setFileName(file ? file.name : '');
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base"
                                        />
                                        <p className="text-xs font-bold text-gray-700">
                                            {fileName || 'Tap to photograph prescription or choose file'}
                                        </p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">PDF, Word, or JPG / PNG (Max 5MB)</p>
                                    </div>
                                    {errors.document && (
                                        <p className="text-[11px] text-rose-500 mt-1">{errors.document}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-govt-green to-emerald-700 hover:from-govt-green-light hover:to-emerald-600 text-white font-bold transition shadow-md shadow-govt-green/20 disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                    <Send className="h-4 w-4" />
                                    <span>{processing ? 'Submitting Application...' : 'Submit Leave Application'}</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: LEAVE APPLICATION HISTORY TABLE */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs">
                                <h3 className="font-bold text-gray-900 flex items-center space-x-2">
                                    <Clock className="h-4 w-4 text-govt-green" />
                                    <span>My Leave Application History</span>
                                </h3>
                                <span className="text-gray-500">{leaves.length} Total</span>
                            </div>

                            <div className="space-y-3">
                                {leaves.map((leave) => (
                                    <div
                                        key={leave.id}
                                        className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2.5 transition hover:bg-white hover:shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center space-x-2 text-xs font-extrabold text-gray-900">
                                                    <Calendar className="h-3.5 w-3.5 text-govt-green" />
                                                    <span>
                                                        {leave.start_date} to {leave.end_date}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 mt-0.5">
                                                    Category: <strong>{leave.category || 'General'}</strong> • Submitted: {leave.created_at ? String(leave.created_at).substring(0, 10) : 'Recent'}
                                                </p>
                                            </div>

                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                leave.status === 'approved'
                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                    : leave.status === 'rejected'
                                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                            }`}>
                                                {leave.status}
                                            </span>
                                        </div>

                                        <p className="text-xs text-gray-700 leading-relaxed">
                                            {leave.reason}
                                        </p>

                                        {/* Instructor Rejection Reason */}
                                        {leave.status === 'rejected' && leave.rejection_reason && (
                                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                                                <p className="font-bold text-[10px] uppercase text-rose-700 flex items-center space-x-1">
                                                    <ShieldAlert className="h-3 w-3 text-rose-600" />
                                                    <span>Instructor Rejection Reason:</span>
                                                </p>
                                                <p className="font-semibold leading-relaxed">{leave.rejection_reason}</p>
                                            </div>
                                        )}

                                        {leave.file_path && (
                                            <div className="flex items-center space-x-1 text-[11px] text-govt-green font-semibold">
                                                <Paperclip className="h-3.5 w-3.5" />
                                                <span>Doctor Note / Certificate Attached</span>
                                            </div>
                                        )}

                                        {leave.approved_by && (
                                            <div className="pt-2 border-t border-gray-200 text-[10px] text-gray-500 flex items-center justify-between">
                                                <span>Reviewed by: <strong>{leave.approved_by?.name || 'Instructor'}</strong></span>
                                                <span className="font-semibold capitalize">
                                                    Decision: {leave.status}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {leaves.length === 0 && (
                                    <div className="text-center py-12 space-y-2">
                                        <Inbox className="h-10 w-10 text-gray-400 mx-auto" />
                                        <p className="text-xs font-bold text-gray-700">
                                            No leave applications submitted yet.
                                        </p>
                                        <p className="text-[11px] text-gray-500">
                                            Use the form on the left if you need to request an excused absence.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}