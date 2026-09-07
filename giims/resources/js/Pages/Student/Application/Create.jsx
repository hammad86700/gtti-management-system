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
    FileCheck,
    BookOpen,
    ArrowRight,
    Clock,
    CreditCard,
    Download,
    ExternalLink,
    Printer,
    Image as ImageIcon,
    Eye,
    X
} from 'lucide-react';

export default function Create({ campaign, courses = [], profile, existingApplication = null }) {
    const { auth, flash = {} } = usePage().props;
    const user = auth.user;

    const [currentStep, setCurrentStep] = useState(1); // 1: Identity & Academic, 2: Course, 3: Documents, 4: Review
    const [fileErrors, setFileErrors] = useState({});
    const [showNewApplicationForm, setShowNewApplicationForm] = useState(!existingApplication);
    const [clientValidationWarning, setClientValidationWarning] = useState(null);
    const [activeAdFlyer, setActiveAdFlyer] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        course_id: courses[0]?.id || '',
        cnic: user?.cnic || '',
        father_name: profile?.father_name || '',
        matric_total_marks: profile?.matric_total_marks ?? 1100,
        matric_obtained_marks: profile?.matric_obtained_marks ?? '',
        intermediate_total_marks: profile?.intermediate_total_marks ?? 1100,
        intermediate_obtained_marks: profile?.intermediate_obtained_marks ?? '',
        cnic_document: null,
        academic_document: null,
    });

    const [cnicFileName, setCnicFileName] = useState('');
    const [cnicFileSize, setCnicFileSize] = useState('');
    const [academicFileName, setAcademicFileName] = useState('');
    const [academicFileSize, setAcademicFileSize] = useState('');

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleCnicChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 20 * 1024 * 1024) {
            setFileErrors((prev) => ({
                ...prev,
                cnic_document: 'CNIC file exceeds 20MB limit. Please choose a smaller photo or PDF.',
            }));
            return;
        }
        setFileErrors((prev) => {
            const next = { ...prev };
            delete next.cnic_document;
            return next;
        });
        setClientValidationWarning(null);
        setData('cnic_document', file);
        setCnicFileName(file.name);
        setCnicFileSize(formatFileSize(file.size));
    };

    const handleAcademicChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 20 * 1024 * 1024) {
            setFileErrors((prev) => ({
                ...prev,
                academic_document: 'Academic Certificate file exceeds 20MB limit. Please choose a smaller photo or PDF.',
            }));
            return;
        }
        setFileErrors((prev) => {
            const next = { ...prev };
            delete next.academic_document;
            return next;
        });
        setClientValidationWarning(null);
        setData('academic_document', file);
        setAcademicFileName(file.name);
        setAcademicFileSize(formatFileSize(file.size));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setClientValidationWarning(null);

        // Pre-flight client checks with descriptive user guidance
        if (!data.cnic || !data.father_name || !data.matric_obtained_marks) {
            setClientValidationWarning('Step 1 Incomplete: Please make sure Father Name, CNIC, and Matriculation Obtained Marks are filled before submitting.');
            setCurrentStep(1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!data.course_id) {
            setClientValidationWarning('Step 2 Incomplete: Please select your technical trade / vocational course preference.');
            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!data.cnic_document || !data.academic_document) {
            setClientValidationWarning('Step 3 Incomplete: Both CNIC/B-Form and Academic Certificate documents are required. Please attach or capture photos of them.');
            setCurrentStep(3);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        post('/student/apply', {
            forceFormData: true,
            onError: (errs) => {
                if (errs.cnic_document || errs.academic_document) {
                    setCurrentStep(3);
                } else if (errs.cnic || errs.father_name || errs.matric_obtained_marks || errs.matric_total_marks) {
                    setCurrentStep(1);
                } else if (errs.course_id) {
                    setCurrentStep(2);
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
        });
    };

    const stepErrors = {
        1: Boolean(errors.cnic || errors.father_name || errors.matric_obtained_marks || errors.matric_total_marks),
        2: Boolean(errors.course_id),
        3: Boolean(errors.cnic_document || errors.academic_document || fileErrors.cnic_document || fileErrors.academic_document),
        4: false,
    };

    const hasAnyErrors = Object.keys(errors).length > 0 || Object.keys(fileErrors).length > 0 || Boolean(clientValidationWarning);

    const selectedCourseObj = courses.find((c) => String(c.id) === String(data.course_id));

    const matricPercent = data.matric_total_marks && data.matric_obtained_marks
        ? ((Number(data.matric_obtained_marks) / Number(data.matric_total_marks)) * 100).toFixed(1)
        : null;

    const interPercent = data.intermediate_total_marks && data.intermediate_obtained_marks
        ? ((Number(data.intermediate_obtained_marks) / Number(data.intermediate_total_marks)) * 100).toFixed(1)
        : null;

    const isStep1Valid = Boolean(data.cnic && data.father_name && data.matric_obtained_marks);

    const steps = [
        { id: 1, label: 'Identity & Marks', title: 'Applicant & Academic Scores', icon: UserCheck },
        { id: 2, label: 'Trade', title: 'Course Preference', icon: Layers },
        { id: 3, label: 'Documents', title: 'Document Scan / Upload', icon: Camera },
        { id: 4, label: 'Review', title: 'Confirmation & Submit', icon: FileCheck },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-white p-1 border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                            <img src="/images/tevta-logo.png" alt="TEVTA" className="h-full w-full object-contain" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold leading-tight text-gray-800">
                                Apply for Course Admission
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Official Admissions Portal • TEVTA Punjab
                            </p>
                        </div>
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
                    <div className="rounded-2xl p-8 bg-amber-50 border border-amber-200 text-center space-y-4">
                        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
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

                        {/* Existing Application Section */}
                        {existingApplication && !showNewApplicationForm ? (
                            <div className="space-y-6 animate-in fade-in duration-200">
                                {/* Dedicated Existing Application Card */}
                                <div className="rounded-2xl bg-white border border-emerald-300 shadow-md p-6 sm:p-8 space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                                        <div className="flex items-start sm:items-center space-x-4">
                                            <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs border border-emerald-200">
                                                <CheckCircle2 className="h-8 w-8" />
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-300">
                                                        Application Submitted
                                                    </span>
                                                    <span className="text-xs font-mono font-black text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-md">
                                                        #{existingApplication.application_number}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-black text-gray-900 mt-1 font-serif">
                                                    {existingApplication.course?.name || 'Selected Trade Course'}
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    Applied on {new Date(existingApplication.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • Session 2026
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 shrink-0">
                                            <Link
                                                href={route('dashboard')}
                                                className="px-5 py-2.5 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-govt-green/20"
                                            >
                                                <span>Go to Dashboard</span>
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Application Details Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                                            <span className="text-gray-500 font-bold block mb-1">Applicant Name</span>
                                            <span className="font-extrabold text-gray-900 text-sm">{user.name}</span>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                                            <span className="text-gray-500 font-bold block mb-1">CNIC / Form-B</span>
                                            <span className="font-mono font-bold text-gray-900 text-sm">{user.cnic || profile?.cnic || 'Recorded'}</span>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                                            <span className="text-gray-500 font-bold block mb-1">Admissions Scrutiny</span>
                                            <span className="font-bold text-amber-700 capitalize flex items-center space-x-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>{existingApplication.status === 'verified' ? 'Verified ✓' : 'Awaiting Scrutiny'}</span>
                                            </span>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                                            <span className="text-gray-500 font-bold block mb-1">Intake Track</span>
                                            <span className="font-bold text-slate-800">
                                                {existingApplication.course?.admission_type === 'first_come_first_served' || existingApplication.course?.requires_entrance_test === false
                                                    ? '⚡ Track B (Direct FCFS)'
                                                    : '🎓 Track A (Entrance Test)'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Documents Status */}
                                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
                                        <div className="font-bold text-emerald-950 flex items-center space-x-1.5">
                                            <FileCheck className="h-4 w-4 text-emerald-600" />
                                            <span>Uploaded Verification Documents</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-900 font-medium">
                                            <div className="flex items-center space-x-2">
                                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                <span>CNIC / B-Form Photo: <strong>Attached & Verified</strong></span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                <span>Matric / Academic Certificate: <strong>Attached & Verified</strong></span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
                                        <p className="text-xs text-gray-500">
                                            Your application is currently active. You can track status, download roll number slips, or view challans on your dashboard.
                                        </p>
                                        <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => setShowNewApplicationForm(true)}
                                                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold text-xs transition cursor-pointer"
                                            >
                                                Apply for Another Course
                                            </button>
                                            <Link
                                                href={route('dashboard')}
                                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white font-bold text-xs transition text-center shadow-xs cursor-pointer"
                                            >
                                                View Dashboard
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Notice if filling an additional application */}
                                {existingApplication && (
                                    <div className="rounded-2xl p-4 bg-sky-50 border border-sky-300 text-sky-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                                        <div className="flex items-center space-x-3">
                                            <CheckCircle2 className="h-5 w-5 text-sky-600 shrink-0" />
                                            <div className="text-xs">
                                                <p className="font-bold text-sky-900">
                                                    Application #{existingApplication.application_number} is already recorded for {existingApplication.course?.name}.
                                                </p>
                                                <p className="text-[11px] text-sky-800">
                                                    You are now filling out an additional application for another course/trade.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowNewApplicationForm(false)}
                                            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition shrink-0 cursor-pointer"
                                        >
                                            <span>View Existing Application</span>
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                )}

                                {/* Mobile Stepper Bar */}
                                <div className="bg-white rounded-2xl border border-gray-200 p-2 sm:p-4 shadow-sm">
                                    <div className="grid grid-cols-4 gap-1 sm:gap-2">
                                        {steps.map((s) => {
                                            const Icon = s.icon;
                                            const isDone = currentStep > s.id;
                                            const isCurrent = currentStep === s.id;
                                            const hasStepError = stepErrors[s.id];
                                            return (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => setCurrentStep(s.id)}
                                                    className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
                                                        hasStepError
                                                            ? 'bg-rose-50 border border-rose-300 text-rose-800'
                                                            : isCurrent
                                                            ? 'bg-govt-green text-white shadow-md'
                                                            : isDone
                                                            ? 'bg-emerald-50 text-emerald-800'
                                                            : 'text-gray-400 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {hasStepError && (
                                                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                                                            !
                                                        </span>
                                                    )}
                                                    <div className="flex items-center space-x-1">
                                                        {isDone && !hasStepError ? (
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                                        ) : (
                                                            <Icon className={`h-4 w-4 shrink-0 ${hasStepError ? 'text-rose-600' : ''}`} />
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

                                {/* Top Global Error Alert Banner */}
                                {(hasAnyErrors || flash?.error || clientValidationWarning) && (
                                    <div className="rounded-2xl p-4 sm:p-5 bg-rose-50 border-2 border-rose-400 text-rose-950 shadow-sm animate-in fade-in duration-200">
                                        <div className="flex items-start space-x-3">
                                            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                                            <div className="space-y-1.5 flex-1 text-xs">
                                                <h4 className="font-extrabold text-sm text-rose-900">
                                                    Application Attention Required
                                                </h4>
                                                {clientValidationWarning && (
                                                    <p className="font-bold text-rose-900 bg-rose-100 p-2.5 rounded-xl border border-rose-300">
                                                        ⚠️ {clientValidationWarning}
                                                    </p>
                                                )}
                                                {flash?.error && (
                                                    <p className="font-bold text-rose-800 bg-rose-100/60 p-2 rounded-lg">
                                                        {flash.error}
                                                    </p>
                                                )}
                                                {Object.keys({ ...fileErrors, ...errors }).length > 0 && (
                                                    <ul className="list-disc list-inside space-y-1 text-rose-800 font-medium">
                                                        {Object.entries({ ...fileErrors, ...errors }).map(([field, err]) => (
                                                            <li key={field}>
                                                                <span className="font-bold capitalize">{field.replace('_', ' ')}:</span> {err}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                        {/* Application Step Form */}
                        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-4 sm:p-7">
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* STEP 1: IDENTITY & ACADEMIC MARKS */}
                                {currentStep === 1 && (
                                    <div className="space-y-5 animate-in fade-in duration-200">
                                        <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                                            <div>
                                                <h4 className="text-base font-black text-gray-900 font-serif">
                                                    Step 1: Applicant Identity & Academic Marks Verification
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    Confirm your CNIC, Father Name, and Matriculation score for admission scrutiny
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                            {/* Candidate Full Name */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                                    Candidate Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    disabled
                                                    value={user.name}
                                                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 cursor-not-allowed"
                                                />
                                            </div>

                                            {/* Father / Guardian Name */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                                    Father / Guardian Name <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter father name"
                                                    value={data.father_name}
                                                    onChange={(e) => setData('father_name', e.target.value)}
                                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-govt-green-400"
                                                />
                                                {errors.father_name && <p className="text-rose-500 text-[11px] mt-0.5">{errors.father_name}</p>}
                                            </div>

                                            {/* CNIC / B-Form Number */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                                    CNIC / B-Form Number <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="31202-1234567-1"
                                                    maxLength="15"
                                                    value={data.cnic}
                                                    onChange={(e) => setData('cnic', e.target.value)}
                                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-govt-green-400"
                                                />
                                                {errors.cnic && <p className="text-rose-500 text-[11px] mt-0.5">{errors.cnic}</p>}
                                                <span className="text-[10px] text-slate-400 mt-0.5 block">Required for institutional test screening & TEVTA record.</span>
                                            </div>

                                            {/* Domicile District */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                                    Domicile District
                                                </label>
                                                <input
                                                    type="text"
                                                    disabled
                                                    value={profile?.domicile_district || 'Rahim Yar Khan'}
                                                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-gray-200 rounded-xl text-xs text-gray-700 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        {/* Academic Qualifications Section */}
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                                                    <BookOpen className="h-4 w-4 text-govt-green" />
                                                    <span>Matriculation (SSC / 10th) Scores *</span>
                                                </span>
                                                {matricPercent && (
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                                                        Matric: {matricPercent}%
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Total Marks *</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="100"
                                                        max="1500"
                                                        value={data.matric_total_marks}
                                                        onChange={(e) => setData('matric_total_marks', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Obtained Marks *</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        max={data.matric_total_marks || 1500}
                                                        placeholder="e.g. 850"
                                                        value={data.matric_obtained_marks}
                                                        onChange={(e) => setData('matric_obtained_marks', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Optional Intermediate Marks */}
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                                                    <GraduationCap className="h-4 w-4 text-amber-600" />
                                                    <span>Intermediate / F.Sc / DAE (Optional / If Applicable)</span>
                                                </span>
                                                {interPercent && (
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 font-mono">
                                                        Inter: {interPercent}%
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Total Marks</label>
                                                    <input
                                                        type="number"
                                                        min="100"
                                                        max="1500"
                                                        value={data.intermediate_total_marks}
                                                        onChange={(e) => setData('intermediate_total_marks', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Obtained Marks</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={data.intermediate_total_marks || 1500}
                                                        placeholder="e.g. 780"
                                                        value={data.intermediate_obtained_marks}
                                                        onChange={(e) => setData('intermediate_obtained_marks', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-end">
                                            <button
                                                type="button"
                                                disabled={!isStep1Valid}
                                                onClick={() => setCurrentStep(2)}
                                                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-govt-green hover:bg-govt-green-500 disabled:opacity-50 text-white font-bold text-sm transition flex items-center justify-center space-x-2 shadow-md min-h-[48px]"
                                            >
                                                <span>Proceed to Course Selection</span>
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
                                                    const isFcfs = course.admission_type === 'first_come_first_served' || course.requires_entrance_test === false;
                                                    return (
                                                        <option key={course.id} value={course.id}>
                                                            {course.name} ({trade?.name || 'Trade'}) — [{isFcfs ? '⚡ Track B: Direct FCFS (No Test)' : '🎓 Track A: Test Required'}, Entry: {course.entry_level}]
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                            {errors.course_id && (
                                                <p className="text-xs text-rose-500">{errors.course_id}</p>
                                            )}
                                        </div>

                                        {/* Course Details & Track Preview Card */}
                                        {selectedCourseObj && (() => {
                                            const isFcfs = selectedCourseObj.admission_type === 'first_come_first_served' || selectedCourseObj.requires_entrance_test === false;
                                            return (
                                                <div className={`p-4 rounded-2xl border space-y-2.5 ${
                                                    isFcfs
                                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                                                        : 'bg-amber-50 border-amber-300 text-amber-950'
                                                }`}>
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                                            isFcfs ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'
                                                        }`}>
                                                            {isFcfs ? '⚡ Track B: Direct Admission (FCFS)' : '🎓 Track A: Institutional Entrance Exam'}
                                                        </span>
                                                        <span className="text-xs font-bold">
                                                            {selectedCourseObj.trade?.program?.duration_months || 6} Months • Intake: {selectedCourseObj.intake_capacity} Seats
                                                        </span>
                                                    </div>
                                                    <p className="font-extrabold text-sm text-slate-900">
                                                        {selectedCourseObj.name} ({selectedCourseObj.trade?.name})
                                                    </p>
                                                    <p className="text-xs leading-relaxed">
                                                        {isFcfs
                                                            ? 'No entrance exam required for this course! Your official bank admission fee challan voucher will be generated immediately upon application submission.'
                                                            : 'Candidates must take the institutional entrance test & viva interview. Official Admit Card will be scheduled on this portal after document scrutiny.'}
                                                    </p>
                                                    {selectedCourseObj.classes_start_date && (
                                                        <div className="text-[11px] font-bold text-slate-700 flex items-center space-x-1.5 pt-1 border-t border-slate-200">
                                                            <Calendar className="h-3.5 w-3.5 text-govt-green" />
                                                            <span>Official Classes Commencement: {new Date(selectedCourseObj.classes_start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                        </div>
                                                    )}

                                                    {/* Official Advertisement Flyer Preview if attached */}
                                                    {(selectedCourseObj.advertisement_url || selectedCourseObj.advertisement_image_path) && (
                                                        <div className="mt-3 pt-3 border-t border-dashed border-slate-300 flex items-center justify-between gap-3 bg-white/80 p-2.5 rounded-xl border border-slate-200">
                                                            <div className="flex items-center space-x-2.5 min-w-0">
                                                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                                                                    <img
                                                                        src={selectedCourseObj.advertisement_url || `/storage/${selectedCourseObj.advertisement_image_path}`}
                                                                        alt="Course Ad Flyer"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                                <div className="truncate">
                                                                    <div className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                                                                        <ImageIcon className="w-3.5 h-3.5 text-emerald-700 inline" />
                                                                        <span>Official Intake Flyer / Advertisement</span>
                                                                    </div>
                                                                    <p className="text-[11px] text-slate-500 truncate">Course prospectus & syllabus highlights</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setActiveAdFlyer(selectedCourseObj)}
                                                                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center space-x-1.5 transition flex-shrink-0 shadow-sm"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                                <span>View Flyer</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}

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
                                                Snap photos with your phone camera or browse stored PDF/image files (Max 20MB each)
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* 1. CNIC / Form-B Upload */}
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center justify-between">
                                                    <span>1. CNIC / B-Form Photo / PDF <span className="text-rose-500">*</span></span>
                                                    <span className="text-[10px] font-bold text-govt-green bg-govt-green-50 px-2 py-0.5 rounded-full flex items-center space-x-1">
                                                        <Camera className="h-3 w-3" />
                                                        <span>Camera Scan</span>
                                                    </span>
                                                </label>
                                                <div className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition min-h-[120px] flex flex-col items-center justify-center cursor-pointer ${
                                                    data.cnic_document
                                                        ? 'border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/60'
                                                        : (errors.cnic_document || fileErrors.cnic_document)
                                                        ? 'border-rose-400 bg-rose-50/40'
                                                        : 'border-gray-300 hover:border-govt-green bg-gray-50 hover:bg-emerald-50/20'
                                                }`}>
                                                    <div className="flex items-center space-x-2 mb-2 text-gray-500">
                                                        <Camera className={`h-6 w-6 ${data.cnic_document ? 'text-emerald-600' : 'text-govt-green'}`} />
                                                        <UploadCloud className={`h-6 w-6 ${data.cnic_document ? 'text-emerald-600' : ''}`} />
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*,application/pdf"
                                                        capture="environment"
                                                        onChange={handleCnicChange}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base"
                                                    />
                                                    {cnicFileName ? (
                                                        <div className="space-y-1">
                                                            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold max-w-full">
                                                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                                                <span className="truncate max-w-[200px]">{cnicFileName}</span>
                                                                {cnicFileSize && <span className="text-[10px] text-emerald-700 shrink-0">({cnicFileSize})</span>}
                                                            </div>
                                                            <p className="text-[11px] text-emerald-700 font-semibold">✓ Document attached. Tap to replace.</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-xs font-bold text-gray-800">
                                                                Tap to Scan CNIC Front or Choose File
                                                            </p>
                                                            <p className="text-[10px] text-gray-500 mt-0.5">
                                                                Mobile Camera, JPG, PNG, WEBP or PDF (Max 20MB)
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                                {(fileErrors.cnic_document || errors.cnic_document) && (
                                                    <p className="text-xs text-rose-600 font-bold flex items-center space-x-1">
                                                        <span>⚠️</span>
                                                        <span>{fileErrors.cnic_document || errors.cnic_document}</span>
                                                    </p>
                                                )}
                                            </div>

                                            {/* 2. Educational Certificate Upload */}
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center justify-between">
                                                    <span>2. Matric / Middle Certificate <span className="text-rose-500">*</span></span>
                                                    <span className="text-[10px] font-bold text-govt-green bg-govt-green-50 px-2 py-0.5 rounded-full flex items-center space-x-1">
                                                        <Camera className="h-3 w-3" />
                                                        <span>Camera Scan</span>
                                                    </span>
                                                </label>
                                                <div className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition min-h-[120px] flex flex-col items-center justify-center cursor-pointer ${
                                                    data.academic_document
                                                        ? 'border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/60'
                                                        : (errors.academic_document || fileErrors.academic_document)
                                                        ? 'border-rose-400 bg-rose-50/40'
                                                        : 'border-gray-300 hover:border-govt-green bg-gray-50 hover:bg-emerald-50/20'
                                                }`}>
                                                    <div className="flex items-center space-x-2 mb-2 text-gray-500">
                                                        <Camera className={`h-6 w-6 ${data.academic_document ? 'text-emerald-600' : 'text-govt-green'}`} />
                                                        <UploadCloud className={`h-6 w-6 ${data.academic_document ? 'text-emerald-600' : ''}`} />
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*,application/pdf"
                                                        capture="environment"
                                                        onChange={handleAcademicChange}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base"
                                                    />
                                                    {academicFileName ? (
                                                        <div className="space-y-1">
                                                            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold max-w-full">
                                                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                                                <span className="truncate max-w-[200px]">{academicFileName}</span>
                                                                {academicFileSize && <span className="text-[10px] text-emerald-700 shrink-0">({academicFileSize})</span>}
                                                            </div>
                                                            <p className="text-[11px] text-emerald-700 font-semibold">✓ Document attached. Tap to replace.</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-xs font-bold text-gray-800">
                                                                Tap to Scan Certificate or Choose File
                                                            </p>
                                                            <p className="text-[10px] text-gray-500 mt-0.5">
                                                                Mobile Camera, JPG, PNG, WEBP or PDF (Max 20MB)
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                                {(fileErrors.academic_document || errors.academic_document) && (
                                                    <p className="text-xs text-rose-600 font-bold flex items-center space-x-1">
                                                        <span>⚠️</span>
                                                        <span>{fileErrors.academic_document || errors.academic_document}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(2)}
                                                className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition min-h-[48px]"
                                            >
                                                Back
                                            </button>
                                            <div className="flex flex-col sm:items-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentStep(4)}
                                                    className="px-6 py-3.5 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white font-bold text-sm transition flex items-center justify-center space-x-2 shadow-md min-h-[48px]"
                                                >
                                                    <span>Review Application</span>
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                                {(!data.cnic_document || !data.academic_document) && (
                                                    <span className="text-[11px] font-semibold text-amber-700">
                                                        ⚠️ Both documents are required to complete submission.
                                                    </span>
                                                )}
                                            </div>
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

                                        {/* Dedicated Step 4 Error Alert */}
                                        {(hasAnyErrors || flash?.error) && (
                                            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-400 text-rose-950 text-xs space-y-2">
                                                <div className="flex items-center space-x-2 font-black text-sm text-rose-900">
                                                    <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                                                    <span>Cannot Submit Yet — Please resolve the following:</span>
                                                </div>
                                                {flash?.error && (
                                                    <p className="font-bold text-rose-800 bg-rose-100 p-2 rounded-lg">{flash.error}</p>
                                                )}
                                                <ul className="list-disc list-inside space-y-1 font-semibold text-rose-800">
                                                    {Object.entries({ ...fileErrors, ...errors }).map(([key, msg]) => (
                                                        <li key={key}>
                                                            <span className="capitalize">{key.replace('_', ' ')}:</span> {msg}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 text-xs">
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                                <span className="font-bold text-gray-500">Candidate Name</span>
                                                <span className="font-extrabold text-gray-900">{user.name}</span>
                                            </div>
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                                <span className="font-bold text-gray-500">Father's Name</span>
                                                <span className="font-extrabold text-gray-900">{data.father_name || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                                <span className="font-bold text-gray-500">CNIC / Form-B</span>
                                                <span className="font-mono font-bold text-gray-900">{data.cnic || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                                <span className="font-bold text-gray-500">Matric Marks</span>
                                                <span className="font-mono font-bold text-gray-900">
                                                    {data.matric_obtained_marks} / {data.matric_total_marks} ({matricPercent}%)
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                                <span className="font-bold text-gray-500">Selected Trade & Course</span>
                                                <span className="font-extrabold text-govt-green">{selectedCourseObj?.name || 'None selected'}</span>
                                            </div>
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                                <span className="font-bold text-gray-500">Admission Mode</span>
                                                <span className="font-extrabold text-slate-800">
                                                    {selectedCourseObj?.admission_type === 'first_come_first_served' || selectedCourseObj?.requires_entrance_test === false
                                                        ? '⚡ Track B: Direct Admission (FCFS - Instant Challan)'
                                                        : '🎓 Track A: Merit-Based (Entrance Test Required)'}
                                                </span>
                                            </div>
                                            {(selectedCourseObj?.advertisement_url || selectedCourseObj?.advertisement_image_path) && (
                                                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                                    <span className="font-bold text-gray-500">Course Intake Flyer</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveAdFlyer(selectedCourseObj)}
                                                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 hover:underline"
                                                    >
                                                        <ImageIcon className="w-3.5 h-3.5 inline mr-1" />
                                                        <span>View Official Flyer</span>
                                                    </button>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                                <span className="font-bold text-gray-500">CNIC Document</span>
                                                {data.cnic_document ? (
                                                    <span className="font-bold text-emerald-700 flex items-center space-x-1">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 inline mr-1" />
                                                        <span>✓ {cnicFileName}</span>
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-bold text-rose-600">❌ Missing (Required)</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setCurrentStep(3)}
                                                            className="px-2 py-0.5 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[10px]"
                                                        >
                                                            Upload in Step 3
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-gray-500">Education Certificate</span>
                                                {data.academic_document ? (
                                                    <span className="font-bold text-emerald-700 flex items-center space-x-1">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 inline mr-1" />
                                                        <span>✓ {academicFileName}</span>
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-bold text-rose-600">❌ Missing (Required)</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setCurrentStep(3)}
                                                            className="px-2 py-0.5 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[10px]"
                                                        >
                                                            Upload in Step 3
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Mandatory Document Missing Banner */}
                                        {(!data.cnic_document || !data.academic_document) && (
                                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                                                <div className="flex items-center space-x-2.5">
                                                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                                                    <div>
                                                        <p className="font-bold">Mandatory Verification Documents Missing</p>
                                                        <p className="text-[11px] text-amber-800">
                                                            Please upload both your CNIC scan and Matric/Middle certificate in Step 3 to activate the submit button.
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentStep(3)}
                                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition shrink-0"
                                                >
                                                    Go to Step 3 Documents
                                                </button>
                                            </div>
                                        )}

                                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                                            <strong>Declaration:</strong> I hereby solemnly declare that the information provided (CNIC, academic marks, and personal credentials) and documents scanned/uploaded are genuine and true. Any falsification will result in immediate cancellation of admission.
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
                                                disabled={processing}
                                                className="px-8 py-4 rounded-xl bg-gradient-to-r from-govt-green to-emerald-700 hover:from-govt-green-light hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm tracking-wide transition shadow-lg shadow-govt-green/25 flex items-center justify-center space-x-2 min-h-[48px] cursor-pointer"
                                            >
                                                <GraduationCap className="h-5 w-5" />
                                                <span>
                                                    {processing
                                                        ? 'Submitting Application & Documents...'
                                                        : (!data.cnic_document || !data.academic_document)
                                                        ? '⚠️ Upload Documents in Step 3 to Submit'
                                                        : 'Submit Application Now'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </form>
                        </div>
                    </>
                )}
                    </>
                )}
            </div>

            {/* Fullscreen Advertisement Flyer Lightbox Modal */}
            {activeAdFlyer && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-all animate-in fade-in"
                    onClick={() => setActiveAdFlyer(null)}
                >
                    <div
                        className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                                    <ImageIcon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-black text-sm text-slate-900">{activeAdFlyer.name}</h4>
                                    <p className="text-[11px] text-slate-500 font-medium">Official Intake Flyer & Course Advertisement</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveAdFlyer(null)}
                                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 bg-slate-950 flex items-center justify-center overflow-auto max-h-[65vh]">
                            <img
                                src={activeAdFlyer.advertisement_url || `/storage/${activeAdFlyer.advertisement_image_path}`}
                                alt={activeAdFlyer.name}
                                className="max-h-[60vh] w-auto object-contain rounded-lg shadow-lg"
                            />
                        </div>
                        <div className="p-3.5 border-t border-gray-100 bg-slate-50 flex items-center justify-between">
                            <span className="text-xs text-slate-600 font-medium">
                                {activeAdFlyer.trade?.name || 'Technical Trade'} • Intake: {activeAdFlyer.intake_capacity} Seats
                            </span>
                            <div className="flex items-center space-x-2">
                                <a
                                    href={activeAdFlyer.advertisement_url || `/storage/${activeAdFlyer.advertisement_image_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Open Full</span>
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setActiveAdFlyer(null)}
                                    className="px-4 py-1.5 rounded-lg bg-govt-green hover:bg-emerald-700 text-white text-xs font-bold transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
