import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import {
    GraduationCap,
    UploadCloud,
    FileText,
    CheckCircle2,
    AlertTriangle,
    Calendar,
    Building2,
    Award,
    ArrowLeft,
    Shield,
    Sparkles,
    Check,
    Camera,
    ChevronRight,
    UserCheck,
    Layers,
    FileCheck
} from 'lucide-react';

export default function Create({ campaign, courses = [], profile }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const [currentStep, setCurrentStep] = useState(1); // 1: Identity, 2: Course, 3: Documents, 4: Review

    const { data, setData, post, processing, errors } = useForm({
        course_id: courses[0]?.id || '',
        cnic_document: null,
        academic_document: null,
    });

    const [cnicFileName, setCnicFileName] = useState('');
    const [academicFileName, setAcademicFileName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('student.application.store'), {
            forceFormData: true,
        });
    };

    const selectedCourseObj = courses.find((c) => String(c.id) === String(data.course_id));

    const steps = [
        { id: 1, label: 'Identity', title: 'Applicant Verification', icon: UserCheck },
        { id: 2, label: 'Trade', title: 'Course Preference', icon: Layers },
        { id: 3, label: 'Documents', title: 'Document Scan / Upload', icon: Camera },
        { id: 4, label: 'Review', title: 'Confirmation & Submit', icon: FileCheck },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-gray-800">
                            Apply for Course Admission
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Official Mobile Admissions Portal • TEVTA Punjab
                        </p>
                    </div>
                    <Link
                        href={route('dashboard')}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-gray-700 transition"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Portal</span>
                    </Link>
                </div>
            }
        >
            <Head title="Mobile Admission Application - GIIMS" />

            <div className="py-6 max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 space-y-5 overflow-hidden">
                {/* Check Active Campaign */}
                {!campaign ? (
                    <div className="rounded-2xl p-8 bg-govt-gold-50 border border-govt-gold-200 text-center space-y-4">
                        <AlertTriangle className="h-12 w-12 text-govt-gold mx-auto" />
                        <div>
                            <h3 className="text-lg font-bold text-amber-800">
                                No Active Admission Campaign
                            </h3>
                            <p className="text-xs text-gray-600 max-w-md mx-auto mt-1">
                                Admissions are currently closed for new enrollments. Please check back soon or contact the institute admissions office.
                            </p>
                        </div>
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-govt-green text-white text-xs font-bold hover:bg-govt-green-500 transition"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Return to Dashboard</span>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Active Campaign Header */}
                        <div className="rounded-2xl p-4 sm:p-6 bg-gradient-to-r from-govt-green via-govt-green-dark to-[#002b12] border border-emerald-700/40 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-govt-gold/20 text-govt-gold-300 border border-govt-gold/40 text-[10px] font-black uppercase tracking-wider">
                                    <Sparkles className="h-3 w-3" />
                                    <span>Active Intake Cycle</span>
                                </div>
                                <h3 className="text-lg sm:text-xl font-extrabold text-white font-serif">
                                    {campaign.name}
                                </h3>
                                <p className="text-xs text-green-100">
                                    Govt. Technical Training Institute, Rahim Yar Khan
                                </p>
                            </div>
                            <div className="flex items-center space-x-3 text-xs bg-black/25 border border-white/15 px-3.5 py-2 rounded-xl shrink-0">
                                <Calendar className="h-4 w-4 text-govt-gold-300" />
                                <div>
                                    <p className="text-[10px] text-green-200 uppercase font-bold">Deadline Window</p>
                                    <p className="font-mono font-bold text-white text-[11px]">{campaign.start_date} → {campaign.end_date}</p>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Stepper Bar (Horizontal Progress on all screens) */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-2 sm:p-4 shadow-sm">
                            <div className="grid grid-cols-4 gap-1 sm:gap-2">
                                {steps.map((s) => {
                                    const Icon = s.icon;
                                    const isDone = currentStep > s.id;
                                    const isCurrent = currentStep === s.id;
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => setCurrentStep(s.id)}
                                            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
                                                isCurrent
                                                    ? 'bg-govt-green text-white shadow-md'
                                                    : isDone
                                                    ? 'bg-emerald-50 text-emerald-800'
                                                    : 'text-gray-400 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-1">
                                                {isDone ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                                ) : (
                                                    <Icon className="h-4 w-4 shrink-0" />
                                                )}
                                                <span className="text-[10px] font-black hidden sm:inline">
                                                    Step {s.id}
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-bold mt-0.5 truncate max-w-full text-center">
                                                {s.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Application Step Form */}
                        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-4 sm:p-7">
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* STEP 1: APPLICANT IDENTITY VERIFICATION */}
                                {currentStep === 1 && (
                                    <div className="space-y-5 animate-in fade-in duration-200">
                                        <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                                            <div>
                                                <h4 className="text-base font-black text-gray-900 font-serif">
                                                    Step 1: Master Applicant Verification
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    Confirm your personal details registered on your GIIMS account
                                                </p>
                                            </div>
                                            <Link
                                                href={route('student.profile.edit')}
                                                className="text-xs font-bold text-govt-green hover:underline"
                                            >
                                                Edit Profile
                                            </Link>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-0.5">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Applicant Full Name</p>
                                                <p className="font-bold text-sm text-gray-900">{user.name}</p>
                                            </div>
                                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-0.5">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Father / Guardian Name</p>
                                                <p className="font-bold text-sm text-gray-900">{profile?.father_name || 'N/A'}</p>
                                            </div>
                                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-0.5">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">CNIC / Form-B Number</p>
                                                <p className="font-mono font-bold text-sm text-gray-900">{user.cnic || 'N/A'}</p>
                                            </div>
                                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-0.5">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Domicile District</p>
                                                <p className="font-bold text-sm text-gray-900">{profile?.domicile_district || 'Rahim Yar Khan'}</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(2)}
                                                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white font-bold text-sm transition flex items-center justify-center space-x-2 shadow-md min-h-[48px]"
                                            >
                                                <span>Proceed to Trade Selection</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: COURSE & TRADE SELECTION */}
                                {currentStep === 2 && (
                                    <div className="space-y-5 animate-in fade-in duration-200">
                                        <div className="pb-3 border-b border-gray-100">
                                            <h4 className="text-base font-black text-gray-900 font-serif">
                                                Step 2: Technical Trade & Course Selection
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                Choose your desired vocational trade specialization
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                                                Select Desired Course & Trade <span className="text-rose-500">*</span>
                                            </label>
                                            {/* Font size 16px minimum on mobile to prevent iOS viewport zooming */}
                                            <select
                                                value={data.course_id}
                                                onChange={(e) => setData('course_id', e.target.value)}
                                                className={`w-full px-4 py-3.5 bg-white border rounded-xl text-base sm:text-xs text-gray-900 font-semibold focus:outline-none focus:ring-2 min-h-[48px] ${
                                                    errors.course_id
                                                        ? 'border-rose-500 focus:ring-rose-500/30'
                                                        : 'border-gray-300 focus:ring-govt-green-400/30'
                                                }`}
                                            >
                                                {courses.map((course) => {
                                                    const trade = course.trade;
                                                    const program = trade?.program;
                                                    const dept = program?.department;
                                                    return (
                                                        <option key={course.id} value={course.id}>
                                                            {course.name} ({trade?.name || 'Trade'}) — {dept?.name || 'Dept'} [{program?.name || 'Program'}, Entry: {course.entry_level}]
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                            {errors.course_id && (
                                                <p className="text-xs text-rose-500">{errors.course_id}</p>
                                            )}
                                        </div>

                                        {/* Course Details Preview Card */}
                                        {selectedCourseObj && (
                                            <div className="p-4 rounded-2xl bg-govt-green/5 border border-govt-green/20 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-govt-green bg-white px-2 py-0.5 rounded-full border border-govt-green/20">
                                                        Selected Specialization
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-700">
                                                        {selectedCourseObj.trade?.program?.duration_months} Months Program
                                                    </span>
                                                </div>
                                                <p className="font-extrabold text-sm text-gray-900">
                                                    {selectedCourseObj.name} ({selectedCourseObj.trade?.name})
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-gray-600">
                                                    <span>Department: <strong>{selectedCourseObj.trade?.program?.department?.name}</strong></span>
                                                    <span>•</span>
                                                    <span>Minimum Qualification: <strong>{selectedCourseObj.entry_level}</strong></span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-4 flex items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(1)}
                                                className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition min-h-[48px]"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(3)}
                                                className="px-6 py-3.5 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white font-bold text-sm transition flex items-center space-x-2 shadow-md min-h-[48px]"
                                            >
                                                <span>Continue to Documents</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: MOBILE DOCUMENT SCAN & UPLOADS */}
                                {currentStep === 3 && (
                                    <div className="space-y-5 animate-in fade-in duration-200">
                                        <div className="pb-3 border-b border-gray-100">
                                            <h4 className="text-base font-black text-gray-900 font-serif">
                                                Step 3: Document Scan & Verification Uploads
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                Snap photos with your phone camera or browse stored PDF/image files (Max 2MB each)
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* 1. CNIC / Form-B Upload with Camera capture */}
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center justify-between">
                                                    <span>1. CNIC / B-Form Photo / PDF <span className="text-rose-500">*</span></span>
                                                    <span className="text-[10px] font-bold text-govt-green bg-govt-green-50 px-2 py-0.5 rounded-full flex items-center space-x-1">
                                                        <Camera className="h-3 w-3" />
                                                        <span>Camera Scan</span>
                                                    </span>
                                                </label>
                                                <div className="relative border-2 border-dashed border-gray-300 hover:border-govt-green rounded-2xl p-5 text-center bg-gray-50 hover:bg-emerald-50/20 transition min-h-[100px] flex flex-col items-center justify-center cursor-pointer">
                                                    <div className="flex items-center space-x-2 mb-2 text-gray-500">
                                                        <Camera className="h-6 w-6 text-govt-green" />
                                                        <UploadCloud className="h-6 w-6" />
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*,application/pdf"
                                                        capture="environment"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            setData('cnic_document', file);
                                                            setCnicFileName(file ? file.name : '');
                                                        }}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base"
                                                    />
                                                    <p className="text-xs font-bold text-gray-800">
                                                        {cnicFileName || 'Tap to Scan CNIC Front or Choose File'}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                                        Mobile Camera, JPG, PNG or PDF (Max 2MB)
                                                    </p>
                                                </div>
                                                {errors.cnic_document && (
                                                    <p className="text-xs text-rose-500 font-medium">{errors.cnic_document}</p>
                                                )}
                                            </div>

                                            {/* 2. Educational Certificate Upload with Camera capture */}
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center justify-between">
                                                    <span>2. Matric / Middle Certificate <span className="text-rose-500">*</span></span>
                                                    <span className="text-[10px] font-bold text-govt-green bg-govt-green-50 px-2 py-0.5 rounded-full flex items-center space-x-1">
                                                        <Camera className="h-3 w-3" />
                                                        <span>Camera Scan</span>
                                                    </span>
                                                </label>
                                                <div className="relative border-2 border-dashed border-gray-300 hover:border-govt-green rounded-2xl p-5 text-center bg-gray-50 hover:bg-emerald-50/20 transition min-h-[100px] flex flex-col items-center justify-center cursor-pointer">
                                                    <div className="flex items-center space-x-2 mb-2 text-gray-500">
                                                        <Camera className="h-6 w-6 text-govt-green" />
                                                        <UploadCloud className="h-6 w-6" />
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*,application/pdf"
                                                        capture="environment"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            setData('academic_document', file);
                                                            setAcademicFileName(file ? file.name : '');
                                                        }}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base"
                                                    />
                                                    <p className="text-xs font-bold text-gray-800">
                                                        {academicFileName || 'Tap to Scan Certificate or Choose File'}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                                        Mobile Camera, JPG, PNG or PDF (Max 2MB)
                                                    </p>
                                                </div>
                                                {errors.academic_document && (
                                                    <p className="text-xs text-rose-500 font-medium">{errors.academic_document}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-4 flex items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(2)}
                                                className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition min-h-[48px]"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(4)}
                                                className="px-6 py-3.5 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white font-bold text-sm transition flex items-center space-x-2 shadow-md min-h-[48px]"
                                            >
                                                <span>Review Application</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 4: FINAL REVIEW & SUBMISSION */}
                                {currentStep === 4 && (
                                    <div className="space-y-5 animate-in fade-in duration-200">
                                        <div className="pb-3 border-b border-gray-100">
                                            <h4 className="text-base font-black text-gray-900 font-serif">
                                                Step 4: Review & Final Submission
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                Carefully verify your preferences before submitting to GTTI Admissions Office
                                            </p>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 text-xs">
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                                <span className="font-bold text-gray-500">Candidate Name</span>
                                                <span className="font-extrabold text-gray-900">{user.name}</span>
                                            </div>
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                                <span className="font-bold text-gray-500">Selected Trade</span>
                                                <span className="font-extrabold text-govt-green">{selectedCourseObj?.name || 'None selected'}</span>
                                            </div>
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                                <span className="font-bold text-gray-500">Intake Campaign</span>
                                                <span className="font-extrabold text-gray-900">{campaign.name}</span>
                                            </div>
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                                <span className="font-bold text-gray-500">CNIC Document</span>
                                                <span className="font-bold text-gray-800">{cnicFileName ? `✓ ${cnicFileName}` : 'Pending upload'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-gray-500">Education Certificate</span>
                                                <span className="font-bold text-gray-800">{academicFileName ? `✓ ${academicFileName}` : 'Pending upload'}</span>
                                            </div>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                                            <strong>Declaration:</strong> I hereby solemnly declare that the information provided and documents scanned/uploaded are genuine and true. Any falsification will result in immediate disqualification.
                                        </div>

                                        <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(3)}
                                                className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition min-h-[48px]"
                                            >
                                                Back to Documents
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing || !data.course_id}
                                                className="px-8 py-4 rounded-xl bg-gradient-to-r from-govt-green to-emerald-700 hover:from-govt-green-light hover:to-emerald-600 disabled:opacity-50 text-white font-black text-sm tracking-wide transition shadow-lg shadow-govt-green/25 flex items-center justify-center space-x-2 min-h-[48px]"
                                            >
                                                <GraduationCap className="h-5 w-5" />
                                                <span>{processing ? 'Submitting Application...' : 'Submit Application Now'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </form>
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
