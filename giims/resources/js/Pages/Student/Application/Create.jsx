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
    X,
    Plus,
    Trash2,
    MapPin,
    User,
    Phone
} from 'lucide-react';

export default function Create({ campaign, courses = [], profile, existingApplication = null }) {
    const { auth, flash = {} } = usePage().props;
    const user = auth.user;

    const [currentStep, setCurrentStep] = useState(1); // 1: Identity & Academic, 2: Course, 3: Documents, 4: Review
    const [fileErrors, setFileErrors] = useState({});
    const [showNewApplicationForm, setShowNewApplicationForm] = useState(!existingApplication);
    const [clientValidationWarning, setClientValidationWarning] = useState(null);
    const [activeAdFlyer, setActiveAdFlyer] = useState(null);

    // Pre-populate educations from profile if available
    const initialEducations = profile?.educations && profile.educations.length > 0
        ? profile.educations.map((edu) => ({
            id: edu.id,
            degree_level: edu.degree_level || 'matric',
            degree_title: edu.degree_title || (edu.degree_level === 'matric' ? 'Matriculation (Science)' : 'Intermediate (FSc)'),
            institute_or_board: edu.institute_or_board || 'BISE Bahawalpur',
            passing_year: edu.passing_year || (new Date().getFullYear() - 1),
            roll_number: edu.roll_number || '',
            total_marks: edu.total_marks || 1100,
            obtained_marks: edu.obtained_marks || '',
            grade_or_division: edu.grade_or_division || '',
            transcript_scan: null,
            transcript_scan_url: edu.transcript_scan_url || null,
        }))
        : [
            {
                degree_level: 'matric',
                degree_title: 'Matriculation (Science / Arts)',
                institute_or_board: 'BISE Bahawalpur',
                passing_year: new Date().getFullYear() - 2,
                roll_number: '',
                total_marks: profile?.matric_total_marks || 1100,
                obtained_marks: profile?.matric_obtained_marks || '',
                grade_or_division: '',
                transcript_scan: null,
                transcript_scan_url: null,
            },
        ];

    const { data, setData, post, processing, errors } = useForm({
        course_id: courses[0]?.id || '',
        shift: 'Morning',
        batch_id: courses[0]?.batches?.find(b => b.shift?.toLowerCase() === 'morning')?.id || courses[0]?.batches?.[0]?.id || '',

        // Candidate Personal & Biographical Information
        name: user?.name || '',
        cnic: user?.cnic || profile?.cnic || '',
        father_name: profile?.father_name || '',
        guardian_name: profile?.guardian_name || '',
        guardian_phone: profile?.guardian_phone || '',
        dob: profile?.dob ? String(profile.dob).split('T')[0] : '2005-01-01',
        gender: profile?.gender || 'male',
        domicile_district: profile?.domicile_district || 'Rahim Yar Khan',
        religion: profile?.religion || 'Islam',
        address: profile?.address || '',
        permanent_address: profile?.permanent_address || '',
        profile_picture: null,

        // Dynamic Multi-Tier Educational History
        educations: initialEducations,

        // Legacy Marks for backwards compatibility
        matric_total_marks: profile?.matric_total_marks ?? 1100,
        matric_obtained_marks: profile?.matric_obtained_marks ?? '',
        intermediate_total_marks: profile?.intermediate_total_marks ?? 1100,
        intermediate_obtained_marks: profile?.intermediate_obtained_marks ?? '',

        // Document Files
        cnic_document: null,
        academic_document: null,
    });

    const [cnicFileName, setCnicFileName] = useState('');
    const [cnicFileSize, setCnicFileSize] = useState('');
    const [academicFileName, setAcademicFileName] = useState('');
    const [academicFileSize, setAcademicFileSize] = useState('');

    const handleCourseChange = (newCourseId) => {
        const crs = courses.find((c) => String(c.id) === String(newCourseId));
        const offered = crs?.offered_shifts || 'Both';
        let targetShift = data.shift;

        if (offered === 'Morning') {
            targetShift = 'Morning';
        } else if (offered === 'Evening') {
            targetShift = 'Evening';
        }

        const batches = crs?.batches || [];
        const matched = batches.find((b) => b.shift?.toLowerCase() === targetShift.toLowerCase()) || batches[0];
        setData((prev) => ({
            ...prev,
            course_id: newCourseId,
            shift: targetShift,
            batch_id: matched ? matched.id : '',
        }));
    };

    const handleShiftChange = (newShift) => {
        const batches = selectedCourseObj?.batches || [];
        const matched = batches.find((b) => b.shift?.toLowerCase() === newShift.toLowerCase()) || batches[0];
        setData((prev) => ({
            ...prev,
            shift: newShift,
            batch_id: matched ? matched.id : '',
        }));
    };

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

    // Auto-formatting CNIC input
    const handleCnicInput = (e) => {
        let val = e.target.value.replace(/[^0-9]/g, '');
        if (val.length > 13) val = val.slice(0, 13);

        let formatted = val;
        if (val.length > 5 && val.length <= 12) {
            formatted = `${val.slice(0, 5)}-${val.slice(5)}`;
        } else if (val.length > 12) {
            formatted = `${val.slice(0, 5)}-${val.slice(5, 12)}-${val.slice(12, 13)}`;
        }
        setData('cnic', formatted);
    };

    // Dynamic education handlers
    const addEducationRow = () => {
        const currentLevels = data.educations.map(e => e.degree_level);
        let nextLevel = 'intermediate';
        let nextTitle = 'Intermediate (FSc / ICS / FA / I.Com)';
        if (currentLevels.includes('intermediate')) {
            nextLevel = 'dae';
            nextTitle = 'DAE (Diploma of Associate Engineer)';
        } else if (currentLevels.includes('dae')) {
            nextLevel = 'bachelors';
            nextTitle = "Bachelor's Degree (BS / BA / BSc)";
        }

        setData('educations', [
            ...data.educations,
            {
                degree_level: nextLevel,
                degree_title: nextTitle,
                institute_or_board: 'BISE Bahawalpur / PBTE',
                passing_year: new Date().getFullYear() - 1,
                roll_number: '',
                total_marks: 1100,
                obtained_marks: '',
                grade_or_division: '',
                transcript_scan: null,
                transcript_scan_url: null,
            },
        ]);
    };

    const removeEducationRow = (indexToRemove) => {
        if (data.educations.length <= 1) return;
        const updated = data.educations.filter((_, i) => i !== indexToRemove);
        setData('educations', updated);
    };

    const handleEducationChange = (index, field, value) => {
        const updated = [...data.educations];
        updated[index] = {
            ...updated[index],
            [field]: value,
        };

        // Sync legacy matric/intermediate marks in state
        if (updated[index].degree_level === 'matric') {
            if (field === 'total_marks') setData('matric_total_marks', value);
            if (field === 'obtained_marks') setData('matric_obtained_marks', value);
        } else if (updated[index].degree_level === 'intermediate') {
            if (field === 'total_marks') setData('intermediate_total_marks', value);
            if (field === 'obtained_marks') setData('intermediate_obtained_marks', value);
        }

        setData('educations', updated);
    };

    const handleEducationTranscript = (index, file) => {
        const updated = [...data.educations];
        updated[index] = {
            ...updated[index],
            transcript_scan: file,
        };
        // Auto-link to academic_document if matric
        if (updated[index].degree_level === 'matric' && !data.academic_document) {
            setData('academic_document', file);
            setAcademicFileName(file.name);
            setAcademicFileSize(formatFileSize(file.size));
        }
        setData('educations', updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setClientValidationWarning(null);

        // Pre-flight client checks with descriptive user guidance
        if (!data.cnic || !data.father_name) {
            setClientValidationWarning('Step 1 Incomplete: Candidate Father Name and CNIC / B-Form number are required.');
            setCurrentStep(1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const matricEdu = data.educations?.find(e => e.degree_level === 'matric') || data.educations?.[0];
        if (!matricEdu || !matricEdu.obtained_marks) {
            setClientValidationWarning('Step 1 Incomplete: Please enter your Matriculation obtained marks in the Educational Qualifications section.');
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

        const hasTranscriptScan = data.educations?.some(e => e.transcript_scan);
        if (!data.cnic_document) {
            setClientValidationWarning('Step 3 Incomplete: Please upload or capture your CNIC / B-Form document in Step 3.');
            setCurrentStep(3);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!data.academic_document && !hasTranscriptScan) {
            setClientValidationWarning('Step 3 Incomplete: Please upload your Matric academic certificate document or attach a transcript scan.');
            setCurrentStep(3);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        post('/student/apply', {
            forceFormData: true,
            onError: (errs) => {
                if (errs.cnic_document || errs.academic_document) {
                    setCurrentStep(3);
                } else if (errs.cnic || errs.father_name || errs['educations.0.obtained_marks'] || errs.matric_obtained_marks) {
                    setCurrentStep(1);
                } else if (errs.course_id) {
                    setCurrentStep(2);
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
        });
    };

    const stepErrors = {
        1: Boolean(errors.cnic || errors.father_name || errors.matric_obtained_marks || errors['educations.0.obtained_marks']),
        2: Boolean(errors.course_id),
        3: Boolean(errors.cnic_document || errors.academic_document || fileErrors.cnic_document || fileErrors.academic_document),
        4: false,
    };

    const hasAnyErrors = Object.keys(errors).length > 0 || Object.keys(fileErrors).length > 0 || Boolean(clientValidationWarning);

    const selectedCourseObj = courses.find((c) => String(c.id) === String(data.course_id));

    const matricRow = data.educations?.find(e => e.degree_level === 'matric') || data.educations?.[0];
    const matricPercent = matricRow?.total_marks && matricRow?.obtained_marks
        ? ((Number(matricRow.obtained_marks) / Number(matricRow.total_marks)) * 100).toFixed(1)
        : null;

    const isStep1Valid = Boolean(data.cnic && data.father_name && matricRow?.obtained_marks);

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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                                            <span className="text-gray-500 font-bold block mb-1">Applicant Name</span>
                                            <span className="font-extrabold text-gray-900 text-sm">{user.name}</span>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                                            <span className="text-gray-500 font-bold block mb-1">CNIC / Form-B</span>
                                            <span className="font-mono font-bold text-gray-900 text-sm">{user.cnic || profile?.cnic || 'Recorded'}</span>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                                            <span className="text-gray-500 font-bold block mb-1">Training Shift</span>
                                            <span className={`inline-flex items-center space-x-1 font-bold text-xs px-2 py-0.5 rounded-md ${
                                                existingApplication.shift === 'Evening'
                                                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                            }`}>
                                                <span>{existingApplication.shift === 'Evening' ? '🌙 Evening' : '🌅 Morning'}</span>
                                            </span>
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

                                {/* STEP 1: BIOGRAPHICAL IDENTITY & MULTI-TIER EDUCATIONAL INTAKE */}
                                {currentStep === 1 && (
                                    <div className="space-y-6 animate-in fade-in duration-200">
                                        <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                                            <div>
                                                <h4 className="text-base font-black text-gray-900 font-serif">
                                                    Step 1: Applicant Identity & Educational History
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    Complete your biographical profile and record your academic qualifications
                                                </p>
                                            </div>
                                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 hidden sm:inline-block">
                                                Intake Registry Phase 36
                                            </span>
                                        </div>

                                        {/* Card 1: Candidate Biographical Information */}
                                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                                            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                                                <User className="h-4 w-4 text-emerald-600" />
                                                <span>1. Candidate Personal & Biographical Identity</span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                                                {/* Candidate Full Name */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                                        Candidate Full Name <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Full Name as per CNIC/Matric"
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-govt-green-400"
                                                    />
                                                    {errors.name && <p className="text-rose-500 text-[11px] mt-0.5">{errors.name}</p>}
                                                </div>

                                                {/* Father's Name */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                                        Father's Name <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Father Name as per Matric"
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
                                                        onChange={handleCnicInput}
                                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-govt-green-400"
                                                    />
                                                    {errors.cnic && <p className="text-rose-500 text-[11px] mt-0.5">{errors.cnic}</p>}
                                                    <span className="text-[10px] text-slate-400 mt-0.5 block">Format: XXXXX-XXXXXXX-X</span>
                                                </div>

                                                {/* Guardian Name */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                                        Guardian Name (If different from father)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Guardian Name (Optional)"
                                                        value={data.guardian_name}
                                                        onChange={(e) => setData('guardian_name', e.target.value)}
                                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-govt-green-400"
                                                    />
                                                </div>

                                                {/* Guardian Phone */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                                        Guardian / Emergency Phone
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="0300-1234567"
                                                        value={data.guardian_phone}
                                                        onChange={(e) => setData('guardian_phone', e.target.value)}
                                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-govt-green-400"
                                                    />
                                                </div>

                                                {/* Date of Birth */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                                        Date of Birth <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        required
                                                        value={data.dob}
                                                        onChange={(e) => setData('dob', e.target.value)}
                                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-govt-green-400"
                                                    />
                                                    {errors.dob && <p className="text-rose-500 text-[11px] mt-0.5">{errors.dob}</p>}
                                                </div>

                                                {/* Gender */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                                        Gender <span className="text-rose-500">*</span>
                                                    </label>
                                                    <select
                                                        value={data.gender}
                                                        onChange={(e) => setData('gender', e.target.value)}
                                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-govt-green-400 cursor-pointer"
                                                    >
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>

                                                {/* Domicile District */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                                        Domicile District <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="e.g. Rahim Yar Khan"
                                                        value={data.domicile_district}
                                                        onChange={(e) => setData('domicile_district', e.target.value)}
                                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-govt-green-400"
                                                    />
                                                </div>

                                                {/* Religion */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                                        Religion
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Islam, Christianity, Hinduism, etc."
                                                        value={data.religion}
                                                        onChange={(e) => setData('religion', e.target.value)}
                                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-govt-green-400"
                                                    />
                                                </div>

                                                {/* Present Address */}
                                                <div className="sm:col-span-2">
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                                        Present / Postal Residential Address
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Current street address, colony, city..."
                                                        value={data.address}
                                                        onChange={(e) => setData('address', e.target.value)}
                                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-govt-green-400"
                                                    />
                                                </div>

                                                {/* Permanent Address */}
                                                <div className="sm:col-span-2">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <label className="block text-xs font-bold text-gray-700">
                                                            Permanent Address (As on CNIC)
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setData('permanent_address', data.address)}
                                                            className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                                                        >
                                                            Copy Present Address
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Permanent address as recorded on CNIC..."
                                                        value={data.permanent_address}
                                                        onChange={(e) => setData('permanent_address', e.target.value)}
                                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-govt-green-400"
                                                    />
                                                </div>

                                                {/* Candidate Profile Photo */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                                        Candidate Photo (Optional)
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => setData('profile_picture', e.target.files?.[0])}
                                                        className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
                                                    />
                                                    <span className="text-[10px] text-gray-400 mt-0.5 block">Blue background passport photo</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card 2: Dynamic Multi-Tier Educational History */}
                                        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200 space-y-4 shadow-xs">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                                                <div>
                                                    <h5 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                                                        <BookOpen className="h-4 w-4 text-emerald-600" />
                                                        <span>2. Multi-Tier Educational Qualifications History</span>
                                                    </h5>
                                                    <p className="text-[11px] text-gray-500">
                                                        Matriculation is mandatory. Add Intermediate, DAE, Bachelor's or Vocational diplomas dynamically.
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={addEducationRow}
                                                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold transition self-start sm:self-auto cursor-pointer"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                    <span>Add Higher / Vocational Qualification</span>
                                                </button>
                                            </div>

                                            {/* Dynamic Education Rows */}
                                            <div className="space-y-4">
                                                {data.educations.map((edu, idx) => {
                                                    const isMatric = edu.degree_level === 'matric';
                                                    const rowPercent = edu.total_marks && edu.obtained_marks
                                                        ? ((Number(edu.obtained_marks) / Number(edu.total_marks)) * 100).toFixed(1)
                                                        : null;

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`p-4 rounded-xl border transition ${
                                                                isMatric
                                                                    ? 'bg-emerald-50/40 border-emerald-200'
                                                                    : 'bg-slate-50 border-slate-200'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200/70">
                                                                <div className="flex items-center space-x-2">
                                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                                                                        isMatric
                                                                            ? 'bg-emerald-200 text-emerald-900'
                                                                            : 'bg-indigo-100 text-indigo-800'
                                                                    }`}>
                                                                        #{idx + 1} {edu.degree_level}
                                                                    </span>
                                                                    <span className="font-bold text-xs text-gray-800">
                                                                        {isMatric ? 'Matriculation / SSC (Mandatory)' : edu.degree_title || 'Additional Qualification'}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center space-x-2">
                                                                    {rowPercent && (
                                                                        <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                                                                            {rowPercent}%
                                                                        </span>
                                                                    )}
                                                                    {!isMatric && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeEducationRow(idx)}
                                                                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition cursor-pointer"
                                                                            title="Remove this qualification"
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                                                {/* Degree Level */}
                                                                <div>
                                                                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                                        Qualification Level <span className="text-rose-500">*</span>
                                                                    </label>
                                                                    <select
                                                                        value={edu.degree_level}
                                                                        onChange={(e) => handleEducationChange(idx, 'degree_level', e.target.value)}
                                                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-govt-green-400 cursor-pointer"
                                                                    >
                                                                        <option value="matric">Matriculation / SSC / 10th</option>
                                                                        <option value="intermediate">Intermediate / HSSC / 12th</option>
                                                                        <option value="dae">DAE (Associate Engineer)</option>
                                                                        <option value="bachelors">Bachelor's Degree (BS / BA / BSc)</option>
                                                                        <option value="diploma_vocational">Vocational Diploma / Short Course</option>
                                                                        <option value="other">Other Certification</option>
                                                                    </select>
                                                                </div>

                                                                {/* Degree Title */}
                                                                <div>
                                                                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                                        Degree / Certificate Title <span className="text-rose-500">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        required
                                                                        placeholder="e.g. Science, Pre-Engineering, DAE Civil"
                                                                        value={edu.degree_title}
                                                                        onChange={(e) => handleEducationChange(idx, 'degree_title', e.target.value)}
                                                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:ring-2 focus:ring-govt-green-400"
                                                                    />
                                                                </div>

                                                                {/* Board / Institute */}
                                                                <div>
                                                                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                                        Board or Institution <span className="text-rose-500">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        required
                                                                        placeholder="e.g. BISE Bahawalpur, PBTE Lahore"
                                                                        value={edu.institute_or_board}
                                                                        onChange={(e) => handleEducationChange(idx, 'institute_or_board', e.target.value)}
                                                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-900 focus:ring-2 focus:ring-govt-green-400"
                                                                    />
                                                                </div>

                                                                {/* Passing Year */}
                                                                <div>
                                                                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                                        Passing Year <span className="text-rose-500">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        required
                                                                        min="1970"
                                                                        max={new Date().getFullYear() + 1}
                                                                        value={edu.passing_year}
                                                                        onChange={(e) => handleEducationChange(idx, 'passing_year', e.target.value)}
                                                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-govt-green-400"
                                                                    />
                                                                </div>

                                                                {/* Total Marks */}
                                                                <div>
                                                                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                                        Total Marks <span className="text-rose-500">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        required
                                                                        min="1"
                                                                        max="2000"
                                                                        value={edu.total_marks}
                                                                        onChange={(e) => handleEducationChange(idx, 'total_marks', e.target.value)}
                                                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-govt-green-400"
                                                                    />
                                                                </div>

                                                                {/* Obtained Marks */}
                                                                <div>
                                                                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                                        Obtained Marks <span className="text-rose-500">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        required
                                                                        min="0"
                                                                        max={edu.total_marks || 2000}
                                                                        placeholder="e.g. 850"
                                                                        value={edu.obtained_marks}
                                                                        onChange={(e) => handleEducationChange(idx, 'obtained_marks', e.target.value)}
                                                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-govt-green-400"
                                                                    />
                                                                </div>

                                                                {/* Roll Number */}
                                                                <div>
                                                                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                                        Roll Number (Optional)
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="e.g. 123456"
                                                                        value={edu.roll_number}
                                                                        onChange={(e) => handleEducationChange(idx, 'roll_number', e.target.value)}
                                                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-900 focus:ring-2 focus:ring-govt-green-400"
                                                                    />
                                                                </div>

                                                                {/* Transcript Scan Upload */}
                                                                <div>
                                                                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                                        Result Card / Transcript Scan
                                                                    </label>
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*,.pdf"
                                                                        onChange={(e) => handleEducationTranscript(idx, e.target.files?.[0])}
                                                                        className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 cursor-pointer"
                                                                    />
                                                                    <span className="text-[10px] text-gray-400 mt-0.5 block">PDF or Image (Max 20MB)</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-end">
                                            <button
                                                type="button"
                                                disabled={!isStep1Valid}
                                                onClick={() => setCurrentStep(2)}
                                                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-govt-green hover:bg-govt-green-500 disabled:opacity-50 text-white font-bold text-sm transition flex items-center justify-center space-x-2 shadow-md min-h-[48px] cursor-pointer"
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
                                                onChange={(e) => handleCourseChange(e.target.value)}
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

                                        {/* Shift Selection: Morning vs Evening */}
                                        <div className="space-y-2 pt-1">
                                            <div className="flex items-center justify-between">
                                                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                                                    Select Training Shift / Batch <span className="text-rose-500">*</span>
                                                </label>
                                                <span className="text-[11px] font-semibold text-gray-500">
                                                    {selectedCourseObj?.offered_shifts === 'Morning' 
                                                        ? '🌅 Morning Shift Only' 
                                                        : selectedCourseObj?.offered_shifts === 'Evening'
                                                            ? '🌙 Evening Shift Only'
                                                            : 'Morning & Evening Batches Available'}
                                                </span>
                                            </div>

                                            {/* Shift Availability Guidance Banner */}
                                            {selectedCourseObj && selectedCourseObj.offered_shifts === 'Morning' && (
                                                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center space-x-2">
                                                    <span className="text-base">🌅</span>
                                                    <span>
                                                        <strong>{selectedCourseObj.name}</strong> is offered exclusively in the <strong>Morning Shift</strong> (08:00 AM – 01:30 PM). Evening shift is unavailable for this trade.
                                                    </span>
                                                </div>
                                            )}
                                            {selectedCourseObj && selectedCourseObj.offered_shifts === 'Evening' && (
                                                <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold flex items-center space-x-2">
                                                    <span className="text-base">🌙</span>
                                                    <span>
                                                        <strong>{selectedCourseObj.name}</strong> is offered exclusively in the <strong>Evening Shift</strong> (02:00 PM – 07:00 PM). Morning shift is unavailable for this trade.
                                                    </span>
                                                </div>
                                            )}

                                            {(() => {
                                                const offersMorning = !selectedCourseObj || selectedCourseObj.offered_shifts === 'Both' || selectedCourseObj.offered_shifts === 'Morning';
                                                const offersEvening = !selectedCourseObj || selectedCourseObj.offered_shifts === 'Both' || selectedCourseObj.offered_shifts === 'Evening';

                                                return (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {/* Morning Option */}
                                                        <div
                                                            onClick={() => {
                                                                if (offersMorning) handleShiftChange('Morning');
                                                            }}
                                                            className={`p-4 rounded-2xl border-2 transition-all duration-150 flex flex-col justify-between space-y-3 ${
                                                                !offersMorning
                                                                    ? 'opacity-40 bg-gray-50 border-gray-200 cursor-not-allowed'
                                                                    : data.shift === 'Morning'
                                                                        ? 'border-emerald-600 bg-emerald-50/80 shadow-sm ring-1 ring-emerald-600/30 cursor-pointer'
                                                                        : 'border-gray-200 bg-white hover:border-gray-300 cursor-pointer'
                                                            }`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-center space-x-2.5">
                                                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xl ${
                                                                        !offersMorning
                                                                            ? 'bg-gray-200 text-gray-400'
                                                                            : data.shift === 'Morning' ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800'
                                                                    }`}>
                                                                        🌅
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center space-x-1.5">
                                                                            <h5 className="text-sm font-black text-gray-900">Morning Shift</h5>
                                                                            {!offersMorning && (
                                                                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
                                                                                    Unavailable
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-[11px] font-semibold text-gray-500">
                                                                            {offersMorning ? '08:00 AM – 01:30 PM (Regular)' : 'Not offered for this trade'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <input
                                                                    type="radio"
                                                                    name="shift"
                                                                    value="Morning"
                                                                    disabled={!offersMorning}
                                                                    checked={data.shift === 'Morning'}
                                                                    onChange={() => {
                                                                        if (offersMorning) handleShiftChange('Morning');
                                                                    }}
                                                                    className="text-emerald-600 focus:ring-emerald-500 h-4 w-4 mt-1 cursor-pointer disabled:cursor-not-allowed"
                                                                />
                                                            </div>
                                                            <div className="text-[11px] text-gray-600 pt-2 border-t border-gray-200/60 flex items-center justify-between">
                                                                <span className="font-semibold">Allocated Batch:</span>
                                                                <span className="font-bold text-emerald-800 font-mono">
                                                                    {offersMorning 
                                                                        ? (selectedCourseObj?.batches?.find((b) => b.shift?.toLowerCase() === 'morning')?.name || 'Fall 2026 - Morning Batch')
                                                                        : 'N/A (Shift not offered)'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Evening Option */}
                                                        <div
                                                            onClick={() => {
                                                                if (offersEvening) handleShiftChange('Evening');
                                                            }}
                                                            className={`p-4 rounded-2xl border-2 transition-all duration-150 flex flex-col justify-between space-y-3 ${
                                                                !offersEvening
                                                                    ? 'opacity-40 bg-gray-50 border-gray-200 cursor-not-allowed'
                                                                    : data.shift === 'Evening'
                                                                        ? 'border-indigo-600 bg-indigo-50/80 shadow-sm ring-1 ring-indigo-600/30 cursor-pointer'
                                                                        : 'border-gray-200 bg-white hover:border-gray-300 cursor-pointer'
                                                            }`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-center space-x-2.5">
                                                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xl ${
                                                                        !offersEvening
                                                                            ? 'bg-gray-200 text-gray-400'
                                                                            : data.shift === 'Evening' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-800'
                                                                    }`}>
                                                                        🌙
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center space-x-1.5">
                                                                            <h5 className="text-sm font-black text-gray-900">Evening Shift</h5>
                                                                            {!offersEvening && (
                                                                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
                                                                                    Unavailable
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-[11px] font-semibold text-gray-500">
                                                                            {offersEvening ? '02:00 PM – 07:00 PM (2nd Shift)' : 'Not offered for this trade'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <input
                                                                    type="radio"
                                                                    name="shift"
                                                                    value="Evening"
                                                                    disabled={!offersEvening}
                                                                    checked={data.shift === 'Evening'}
                                                                    onChange={() => {
                                                                        if (offersEvening) handleShiftChange('Evening');
                                                                    }}
                                                                    className="text-indigo-600 focus:ring-indigo-500 h-4 w-4 mt-1 cursor-pointer disabled:cursor-not-allowed"
                                                                />
                                                            </div>
                                                            <div className="text-[11px] text-gray-600 pt-2 border-t border-gray-200/60 flex items-center justify-between">
                                                                <span className="font-semibold">Allocated Batch:</span>
                                                                <span className="font-bold text-indigo-800 font-mono">
                                                                    {offersEvening 
                                                                        ? (selectedCourseObj?.batches?.find((b) => b.shift?.toLowerCase() === 'evening')?.name || 'Fall 2026 - Evening Batch')
                                                                        : 'N/A (Shift not offered)'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                            {errors.shift && (
                                                <p className="text-xs text-rose-500 font-bold">{errors.shift}</p>
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

                                                    {/* Official Advertisement Flyer Showcase if attached */}
                                                    {(selectedCourseObj.advertisement_url || selectedCourseObj.advertisement_image_path) && (
                                                        <div className="mt-4 pt-4 border-t border-slate-200">
                                                            <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-md border border-slate-800">
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                                                    <div className="flex items-center space-x-2.5">
                                                                        <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                                                                            <ImageIcon className="w-4 h-4" />
                                                                        </span>
                                                                        <div>
                                                                            <h4 className="text-xs font-black text-white uppercase tracking-wider">
                                                                                Official Intake Flyer & Course Advertisement
                                                                            </h4>
                                                                            <p className="text-[11px] text-slate-400">
                                                                                Authorized prospectus by Government Technical Training Institute (TEVTA)
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setActiveAdFlyer(selectedCourseObj)}
                                                                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center space-x-1.5 transition shadow-sm shrink-0"
                                                                    >
                                                                        <Eye className="w-3.5 h-3.5" />
                                                                        <span>Enlarge Flyer (HQ)</span>
                                                                    </button>
                                                                </div>

                                                                {/* Clickable Image Banner */}
                                                                <div
                                                                    onClick={() => setActiveAdFlyer(selectedCourseObj)}
                                                                    className="relative h-60 sm:h-72 w-full rounded-xl overflow-hidden border border-slate-700 bg-black/70 group/flyer cursor-pointer"
                                                                >
                                                                    <img
                                                                        src={selectedCourseObj.advertisement_url || `/storage/${selectedCourseObj.advertisement_image_path}`}
                                                                        alt="Course Intake Advertisement"
                                                                        className="w-full h-full object-contain object-center group-hover/flyer:scale-[1.02] transition-transform duration-300"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/flyer:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                                                        <span className="px-4 py-2 rounded-full bg-white text-slate-900 font-extrabold text-xs flex items-center space-x-2 shadow-xl">
                                                                            <Eye className="w-4 h-4 text-emerald-700" />
                                                                            <span>Click to Inspect High-Resolution Fullscreen Flyer</span>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
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

                                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-4 text-xs">
                                            {/* Candidate Personal Details */}
                                            <div className="space-y-2">
                                                <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-1 border-b border-gray-200 flex items-center gap-1.5">
                                                    <User className="h-3.5 w-3.5 text-emerald-600" />
                                                    <span>Candidate Identity & Biographical Summary</span>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                                                    <div>
                                                        <span className="text-gray-500 block text-[11px]">Candidate Name</span>
                                                        <span className="font-extrabold text-gray-900">{data.name || user.name}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 block text-[11px]">Father's Name</span>
                                                        <span className="font-extrabold text-gray-900">{data.father_name || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 block text-[11px]">CNIC / Form-B</span>
                                                        <span className="font-mono font-bold text-gray-900">{data.cnic || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 block text-[11px]">DOB & Gender</span>
                                                        <span className="font-medium text-gray-900">{data.dob} ({data.gender})</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 block text-[11px]">Guardian</span>
                                                        <span className="font-medium text-gray-900">{data.guardian_name || 'Father'} {data.guardian_phone ? `(${data.guardian_phone})` : ''}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 block text-[11px]">Domicile & Religion</span>
                                                        <span className="font-medium text-gray-900">{data.domicile_district} &bull; {data.religion}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Multi-Tier Educational History Summary */}
                                            <div className="space-y-2 pt-2 border-t border-gray-200">
                                                <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-1 flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                                                        <span>Educational Qualifications Recorded</span>
                                                    </div>
                                                    <span className="text-[10px] font-mono text-gray-500">
                                                        {data.educations.length} Qualification(s)
                                                    </span>
                                                </div>
                                                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                                                    <table className="w-full text-left text-xs text-gray-700">
                                                        <thead className="bg-gray-100 text-[10px] font-bold uppercase text-gray-500 border-b border-gray-200">
                                                            <tr>
                                                                <th className="py-2 px-3">Level & Title</th>
                                                                <th className="py-2 px-3">Board / Institute</th>
                                                                <th className="py-2 px-3">Year</th>
                                                                <th className="py-2 px-3">Marks</th>
                                                                <th className="py-2 px-3">Percentage</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {data.educations.map((edu, i) => {
                                                                const pct = edu.total_marks && edu.obtained_marks
                                                                    ? ((Number(edu.obtained_marks) / Number(edu.total_marks)) * 100).toFixed(1)
                                                                    : '0.0';
                                                                return (
                                                                    <tr key={i}>
                                                                        <td className="py-2 px-3 font-semibold text-gray-900">
                                                                            <span className="capitalize font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded mr-1.5">
                                                                                {edu.degree_level}
                                                                            </span>
                                                                            {edu.degree_title}
                                                                        </td>
                                                                        <td className="py-2 px-3 text-gray-600">{edu.institute_or_board}</td>
                                                                        <td className="py-2 px-3 font-mono text-[11px]">{edu.passing_year}</td>
                                                                        <td className="py-2 px-3 font-mono font-bold">{edu.obtained_marks} / {edu.total_marks}</td>
                                                                        <td className="py-2 px-3">
                                                                            <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                                                {pct}%
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Course & Shift Selection */}
                                            <div className="space-y-2 pt-2 border-t border-gray-200">
                                                <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                                                    <span className="font-bold text-gray-500">Selected Trade & Course</span>
                                                    <span className="font-extrabold text-govt-green">{selectedCourseObj?.name || 'None selected'}</span>
                                                </div>
                                                <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                                                    <span className="font-bold text-gray-500">Training Shift & Session</span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                                                        data.shift === 'Evening'
                                                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                    }`}>
                                                        {data.shift === 'Evening' ? '🌙 Evening Shift (02:00 PM – 07:00 PM)' : '🌅 Morning Shift (08:00 AM – 01:30 PM)'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                                                    <span className="font-bold text-gray-500">Admission Track</span>
                                                    <span className="font-extrabold text-slate-800">
                                                        {selectedCourseObj?.admission_type === 'first_come_first_served' || selectedCourseObj?.requires_entrance_test === false
                                                            ? '⚡ Track B: Direct Admission (FCFS - Instant Challan)'
                                                            : '🎓 Track A: Merit-Based (Entrance Test Required)'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-gray-500">CNIC Document Attached</span>
                                                    {data.cnic_document ? (
                                                        <span className="font-bold text-emerald-700 flex items-center space-x-1">
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 inline mr-1" />
                                                            <span>✓ {cnicFileName}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="font-bold text-rose-600">❌ Missing (Required in Step 3)</span>
                                                    )}
                                                </div>
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
                    className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-in fade-in"
                    onClick={() => setActiveAdFlyer(null)}
                >
                    <div
                        className="relative bg-slate-950 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[92vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800/60">
                                    <ImageIcon className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h4 className="font-black text-sm text-white">{activeAdFlyer.name}</h4>
                                    <p className="text-[11px] text-slate-400">Official Intake Flyer & Course Advertisement</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveAdFlyer(null)}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/80 hover:text-rose-400 text-slate-400 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 bg-slate-950/95 flex items-center justify-center overflow-auto max-h-[75vh]">
                            <img
                                src={activeAdFlyer.advertisement_url || `/storage/${activeAdFlyer.advertisement_image_path}`}
                                alt={activeAdFlyer.name}
                                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-xl border border-slate-800"
                            />
                        </div>
                        <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400 shrink-0">
                            <span className="text-slate-300 font-medium">
                                {activeAdFlyer.trade?.name || 'Technical Trade'} • Quota: <strong>{activeAdFlyer.intake_capacity ?? 50} Seats</strong>
                            </span>
                            <div className="flex items-center space-x-2">
                                <a
                                    href={activeAdFlyer.advertisement_url || `/storage/${activeAdFlyer.advertisement_image_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    download
                                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition flex items-center space-x-1 border border-slate-700"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Download / Open Full</span>
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setActiveAdFlyer(null)}
                                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
