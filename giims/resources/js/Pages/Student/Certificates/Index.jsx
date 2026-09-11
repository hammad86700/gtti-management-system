import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Award,
    CheckCircle2,
    Clock,
    Calendar,
    CalendarDays,
    Printer,
    FileText,
    Sparkles,
    ShieldCheck,
    Send,
    AlertCircle,
    Download,
    QrCode,
    GraduationCap,
    XCircle
} from 'lucide-react';

export default function Index({ certificates = [], enrollments = [] }) {
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

    const {
        data: applyData,
        setData: setApplyData,
        post: postApply,
        processing: applyProcessing,
        errors: applyErrors,
        reset: resetApply
    } = useForm({
        enrollment_id: enrollments[0]?.id || '',
        student_notes: '',
    });

    const handleApplySubmit = (e) => {
        e.preventDefault();
        postApply(route('student.certificates.apply'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsApplyModalOpen(false);
                resetApply();
            },
        });
    };

    const approvedCert = certificates.find((c) => c.status === 'approved');
    const pendingOrRequestedCert = certificates.find((c) => c.status === 'pending_approval' || c.status === 'requested');

    return (
        <AuthenticatedLayout>
            <Head title="My Official Certificate & Digital Parchment" />

            <div className="py-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium mb-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Academic Credentials Desk</span>
                            <span>•</span>
                            <span>Official TEVTA & PBTE Accredited Certification</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Course Completion Certificates
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            View official digital certificates, physical college collection dates, or apply for course completion credentials
                        </p>
                    </div>

                    {!approvedCert && !pendingOrRequestedCert && enrollments.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setIsApplyModalOpen(true)}
                            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-2 self-start sm:self-auto"
                        >
                            <Award className="w-4 h-4" />
                            <span>Apply for Completion Certificate</span>
                        </button>
                    )}
                </div>

                {/* Physical Collection Date Banner if Assigned */}
                {certificates.some((c) => c.collection_date) && (
                    <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-[#002B12] text-white p-5 rounded-2xl shadow-lg border border-emerald-500/40 relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                            <div className="flex items-center space-x-3.5">
                                <div className="p-3 rounded-2xl bg-amber-400 text-slate-950 font-black shadow-md shrink-0">
                                    <CalendarDays className="w-7 h-7" />
                                </div>
                                <div>
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 block">
                                        Physical Certificate Collection Notice
                                    </span>
                                    <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                                        Collect Your Hardcopy Diploma on: <span className="underline decoration-amber-400">{certificates.find((c) => c.collection_date)?.collection_date}</span>
                                    </h3>
                                    <p className="text-xs text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
                                        Please visit the College Examination & Admission Office with your original Student ID Card to collect your officially signed and embossed TEVTA parchment.
                                    </p>
                                </div>
                            </div>

                            <div className="px-3.5 py-1.5 rounded-xl bg-white/15 text-emerald-200 text-xs font-bold border border-white/20 shrink-0">
                                Room 102 • Exam Wing
                            </div>
                        </div>
                    </div>
                )}

                {/* Application In-Progress Status Banner */}
                {pendingOrRequestedCert && !approvedCert && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-amber-200 dark:border-amber-800/60 shadow-sm space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                                    <Clock className="w-6 h-6 animate-spin" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Certificate Application Status: {pendingOrRequestedCert.status === 'requested' ? 'Under Review by Examination Clerk' : 'Awaiting Principal Final Approval'}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Program: <strong>{pendingOrRequestedCert.course?.name}</strong> • Tracking #{pendingOrRequestedCert.certificate_number}
                                    </p>
                                </div>
                            </div>

                            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                                {pendingOrRequestedCert.status === 'requested' ? 'Stage 1: Clerk Processing' : 'Stage 2: Principal Signature'}
                            </span>
                        </div>

                        {/* Progress Stepper */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>1. Student Request Submitted</span>
                            </div>

                            <div className={`p-3 rounded-xl border flex items-center gap-2 font-bold ${
                                pendingOrRequestedCert.status === 'pending_approval'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                                    : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                            }`}>
                                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>2. Clerk Issue & Collection Date</span>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-slate-400 font-medium">
                                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                                <span>3. Principal Confirmation & Release</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* DIGITAL CERTIFICATE DISPLAY */}
                {approvedCert && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                                    Official Digital Certificate
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center space-x-2"
                            >
                                <Printer className="w-4 h-4" />
                                <span>Print / Download Certificate</span>
                            </button>
                        </div>

                        {/* High-Definition Digital Certificate Box */}
                        <div className="relative bg-[#FFFDF9] text-slate-900 p-8 sm:p-12 rounded-3xl border-8 border-double border-amber-700/80 shadow-2xl overflow-hidden font-serif">
                            {/* Watermark Crest */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                                <img src="/images/tevta-logo.png" alt="Crest Watermark" className="w-96 h-96 object-contain" />
                            </div>

                            {/* Outer Decorative Border Corner Accents */}
                            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-800" />
                            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-800" />
                            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-800" />
                            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-800" />

                            <div className="relative z-10 text-center space-y-6">
                                {/* Header Crest & Titles */}
                                <div className="space-y-2">
                                    <div className="h-16 w-16 mx-auto mb-2">
                                        <img src="/images/tevta-logo.png" alt="TEVTA Punjab" className="h-full w-full object-contain mx-auto" />
                                    </div>
                                    <h4 className="text-xs sm:text-sm font-bold tracking-widest uppercase text-slate-600 font-sans">
                                        Government of Punjab • TEVTA & PBTE Accredited
                                    </h4>
                                    <h1 className="text-2xl sm:text-4xl font-extrabold text-[#003013] tracking-wide">
                                        Govt. Technical Training Institute, Rahim Yar Khan
                                    </h1>
                                    <p className="text-xs text-amber-900 font-semibold tracking-wider font-sans">
                                        CERTIFICATE OF TECHNICAL COMPETENCY & VOCATIONAL TRAINING
                                    </p>
                                </div>

                                <div className="h-0.5 w-48 mx-auto bg-gradient-to-r from-transparent via-amber-700 to-transparent" />

                                {/* Body Text */}
                                <div className="space-y-4 max-w-2xl mx-auto py-2">
                                    <p className="text-sm italic text-slate-600">
                                        This is to officially certify that
                                    </p>

                                    <h2 className="text-2xl sm:text-3xl font-black text-slate-950 underline decoration-amber-600 underline-offset-8">
                                        {approvedCert.student_profile?.user?.name || 'Trainee Name'}
                                    </h2>

                                    <p className="text-xs font-sans text-slate-700 leading-relaxed">
                                        National CNIC: <strong>{approvedCert.student_profile?.user?.cnic || 'N/A'}</strong> • Roll Number: <strong>{approvedCert.student_profile?.user?.roll_number || approvedCert.enrollment?.enrollment_number}</strong>
                                    </p>

                                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                                        has successfully fulfilled all curriculum requirements, industrial workshop training, and competency evaluations for the accredited program
                                    </p>

                                    <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 max-w-xl mx-auto font-sans">
                                        <h3 className="text-lg font-black text-emerald-950">
                                            {approvedCert.course?.name}
                                        </h3>
                                        <p className="text-xs text-slate-600 mt-0.5">
                                            Duration: {approvedCert.course?.duration_value || 6} Months CBT&A • Academic Session: {approvedCert.batch?.name || '2026'}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-center gap-6 pt-1 font-sans text-xs">
                                        <span className="px-3 py-1 bg-white rounded-lg border border-amber-300 font-bold text-slate-800">
                                            Grading Awarded: <strong>{approvedCert.grade || 'A'}</strong>
                                        </span>
                                        <span className="px-3 py-1 bg-white rounded-lg border border-amber-300 font-bold text-slate-800">
                                            Status: <strong>PASSED / COMPETENT</strong>
                                        </span>
                                    </div>
                                </div>

                                {/* Footer Signatures & QR */}
                                <div className="pt-6 border-t border-amber-200 font-sans grid grid-cols-3 items-end text-xs text-slate-600">
                                    <div className="text-left space-y-1">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Official Serial</span>
                                        <span className="font-mono font-black text-xs text-emerald-900 block">{approvedCert.certificate_number}</span>
                                        <span className="text-[11px] block">Date: {approvedCert.issue_date}</span>
                                    </div>

                                    <div className="text-center">
                                        <div className="w-14 h-14 mx-auto p-1 bg-white border border-slate-300 rounded-lg flex items-center justify-center shadow-xs">
                                            <QrCode className="w-12 h-12 text-slate-800" />
                                        </div>
                                        <span className="text-[9px] text-slate-500 uppercase tracking-wider mt-1 block">Digital Verification</span>
                                    </div>

                                    <div className="text-right space-y-1">
                                        <div className="inline-block border-b-2 border-slate-900 pb-1 px-4 text-center">
                                            <span className="font-black text-slate-900 block font-serif italic text-sm">Principal Authority</span>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Principal GTTI RYK</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Application Modal */}
                {isApplyModalOpen && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Award className="w-4 h-4 text-emerald-600" />
                                    Submit Application for Completion Certificate
                                </h3>
                                <button onClick={() => setIsApplyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleApplySubmit} className="p-6 space-y-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Select Completed Program <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={applyData.enrollment_id}
                                        onChange={(e) => setApplyData('enrollment_id', e.target.value)}
                                        required
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    >
                                        {enrollments.map((enr) => (
                                            <option key={enr.id} value={enr.id}>
                                                {enr.course?.name} ({enr.batch?.name || 'Batch'}) — Roll #{enr.enrollment_number}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Remarks / Contact Phone for Verification (Optional)
                                    </label>
                                    <textarea
                                        value={applyData.student_notes}
                                        onChange={(e) => setApplyData('student_notes', e.target.value)}
                                        rows={3}
                                        placeholder="Add any notes for the Examination Clerk regarding clearances or phone verification..."
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[11px] text-emerald-900 dark:text-emerald-300">
                                    Upon submission, the Examination Clerk will verify your departmental clearances, assign your certificate number and official physical collection date, and route to the Principal for digital endorsement.
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsApplyModalOpen(false)}
                                        className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={applyProcessing}
                                        className="px-5 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow transition disabled:opacity-50"
                                    >
                                        {applyProcessing ? 'Submitting...' : 'Submit Certificate Application'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
