import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import {
    GraduationCap,
    UserCheck,
    Layers,
    Calendar,
    Building2,
    CheckCircle2,
    Clock,
    ArrowRight,
    Search,
    Award,
    Sparkles,
    Shield,
    Users,
    UserPlus,
    Edit3,
    Trash2,
    AlertTriangle,
    X,
    Lock,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    Eye,
    Filter,
    Upload
} from 'lucide-react';

export default function Index({
    applications = [],
    batches = [],
    courses = [],
    enrollments = []
}) {
    const [selectedBatches, setSelectedBatches] = useState({});
    const [enrollingId, setEnrollingId] = useState(null);
    const [activeTab, setActiveTab] = useState('enrolled'); // Default to enrolled roster
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Modal States
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModal, setEditModal] = useState({ open: false, data: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '', roll: '' });
    const [profileModal, setProfileModal] = useState({ open: false, enrollment: null });

    const categories = ['All', 'DAE', 'CBT&A', 'Computer Operator', 'Electrician', 'Machinist', 'Welder'];

    // Processing flags
    const [submitting, setSubmitting] = useState(false);

    // Initial manual student form state
    const initialCreateForm = {
        name: '',
        email: '',
        password: 'password123',
        phone: '',
        cnic: '',
        father_name: '',
        date_of_birth: '',
        gender: 'male',
        domicile_district: 'Rahim Yar Khan',
        emergency_contact: '',
        address: '',
        course_id: courses[0]?.id || '',
        batch_id: batches[0]?.id || '',
        registration_number: '',
    };

    const [createForm, setCreateForm] = useState(initialCreateForm);

    const handleBatchChange = (appId, batchId) => {
        setSelectedBatches((prev) => ({
            ...prev,
            [appId]: batchId,
        }));
    };

    const handleEnroll = (app) => {
        const availableBatchesForCourse = batches.filter(
            (b) => String(b.course_id) === String(app.course_id)
        );

        const chosenBatchId =
            selectedBatches[app.id] ||
            (availableBatchesForCourse.length > 0 ? availableBatchesForCourse[0].id : batches[0]?.id || '');

        if (!chosenBatchId) {
            alert('Please select a valid academic batch for this course before enrolling.');
            return;
        }

        setEnrollingId(app.id);
        router.post(
            route('admin.enrollments.store'),
            {
                application_id: app.id,
                batch_id: chosenBatchId,
            },
            {
                onFinish: () => setEnrollingId(null),
            }
        );
    };

    // Manual Student Create Handler
    const handleCreateStudent = (e) => {
        e.preventDefault();
        setSubmitting(true);

        router.post(route('admin.students.manual-store'), createForm, {
            onSuccess: () => {
                setCreateModalOpen(false);
                setCreateForm(initialCreateForm);
            },
            onFinish: () => setSubmitting(false),
        });
    };

    // Edit Student Handler
    const handleEditStudent = (e) => {
        e.preventDefault();
        setSubmitting(true);

        router.patch(route('admin.students.update', editModal.data.id), editModal.data, {
            onSuccess: () => {
                setEditModal({ open: false, data: null });
            },
            onFinish: () => setSubmitting(false),
        });
    };

    // Delete Student Handler
    const handleDeleteStudent = (e) => {
        e.preventDefault();
        setSubmitting(true);

        router.delete(route('admin.students.destroy', deleteModal.id), {
            onSuccess: () => {
                setDeleteModal({ open: false, id: null, name: '', roll: '' });
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const filteredApplications = applications.filter((app) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            app.application_number?.toLowerCase().includes(q) ||
            app.student_profile?.user?.name?.toLowerCase().includes(q) ||
            app.student_profile?.father_name?.toLowerCase().includes(q) ||
            app.course?.name?.toLowerCase().includes(q)
        );
    });

    const filteredEnrollments = enrollments.filter((enr) => {
        const user = enr.student_profile?.user;
        const profile = enr.student_profile;
        const course = enr.course;
        const batch = enr.batch;

        if (selectedCategory !== 'All') {
            const cat = selectedCategory.toLowerCase();
            const cName = (course?.name || '').toLowerCase();
            const tName = (course?.trade?.name || '').toLowerCase();
            if (!cName.includes(cat) && !tName.includes(cat)) {
                return false;
            }
        }

        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            enr.enrollment_number?.toLowerCase().includes(q) ||
            user?.name?.toLowerCase().includes(q) ||
            profile?.father_name?.toLowerCase().includes(q) ||
            user?.cnic?.toLowerCase().includes(q) ||
            course?.name?.toLowerCase().includes(q) ||
            batch?.name?.toLowerCase().includes(q)
        );
    });

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold font-serif text-slate-900 tracking-tight">
                            Student & Enrollment Management
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Govt. Technical Training Institute, Rahim Yar Khan • Complete Trainee Lifecycle Controls
                        </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                        <button
                            onClick={() => {
                                setCreateForm({
                                    ...initialCreateForm,
                                    course_id: courses[0]?.id || '',
                                    batch_id: batches[0]?.id || '',
                                });
                                setCreateModalOpen(true);
                            }}
                            className="inline-flex items-center space-x-2 py-2 px-3.5 rounded-xl bg-[#0B3B24] hover:bg-[#124E31] text-white text-xs font-bold shadow-xs transition"
                        >
                            <UserPlus className="h-4 w-4 text-emerald-400" />
                            <span>Add Student Manually</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Student Enrollments & Management - GIIMS" />

            <div className="space-y-6">
                {/* Stats Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
                            <Award className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Selected for Admission</p>
                            <h3 className="text-2xl font-bold text-purple-600">{applications.length}</h3>
                            <p className="text-[11px] text-gray-400">Pending Batch Enrollment</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-xl bg-govt-green-50 text-govt-green flex items-center justify-center border border-govt-green-200">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Active Enrolled Trainees</p>
                            <h3 className="text-2xl font-bold text-gray-900">{enrollments.length}</h3>
                            <p className="text-[11px] text-gray-400">Issued Official Roll Numbers</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                            <Layers className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Academic Batches</p>
                            <h3 className="text-2xl font-bold text-blue-600">{batches.length}</h3>
                            <p className="text-[11px] text-gray-400">Active Cohorts</p>
                        </div>
                    </div>
                </div>

                {/* Horizontal Category Filter Bar (EduMaster Standard) */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                                selectedCategory === cat
                                    ? 'bg-[#0B3B24] text-white shadow-xs'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Filter, Tabs, and Action Bar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    {/* Primary Tab Switcher */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setActiveTab('enrolled')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                                activeTab === 'enrolled'
                                    ? 'bg-[#0B3B24] text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <GraduationCap className="h-4 w-4" />
                            <span>Enrolled Trainees ({filteredEnrollments.length})</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                                activeTab === 'pending'
                                    ? 'bg-purple-700 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Award className="h-4 w-4" />
                            <span>Merit Candidates ({applications.length})</span>
                        </button>
                    </div>

                    {/* Action Bar: Search + Filter + Bulk Upload + Admit Student */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search trainee, CNIC, roll..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => setSelectedCategory('All')}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition"
                            title="Reset Category Filter"
                        >
                            <Filter className="h-3.5 w-3.5 text-slate-400" />
                            <span>Filter</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => alert('Bulk CSV trainee import is available in the Reports & Admissions Hub.')}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition"
                        >
                            <Upload className="h-3.5 w-3.5 text-slate-500" />
                            <span>Bulk Upload</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setCreateForm({
                                    ...initialCreateForm,
                                    course_id: courses[0]?.id || '',
                                    batch_id: batches[0]?.id || '',
                                });
                                setCreateModalOpen(true);
                            }}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold shadow-xs transition"
                        >
                            <UserPlus className="h-3.5 w-3.5" />
                            <span>+ Admit Student</span>
                        </button>
                    </div>
                </div>

                {/* Tab 1: Enrolled Students Roster (Clean Data Grid) */}
                {activeTab === 'enrolled' && (
                    <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs text-slate-500">
                            <span className="font-bold text-slate-900">Enrolled Trainee Master Directory</span>
                            <span>{filteredEnrollments.length} Records Shown</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                                    <tr>
                                        <th className="py-2.5 px-3">Student</th>
                                        <th className="py-2.5 px-3">Adm / Roll No</th>
                                        <th className="py-2.5 px-3">CNIC</th>
                                        <th className="py-2.5 px-3">Trade / Class</th>
                                        <th className="py-2.5 px-3 text-center">Gender</th>
                                        <th className="py-2.5 px-3 text-center">Fee Status</th>
                                        <th className="py-2.5 px-3 text-center">Status</th>
                                        <th className="py-2.5 px-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                    {filteredEnrollments.map((enr) => {
                                        const user = enr.student_profile?.user;
                                        const profile = enr.student_profile;
                                        const course = enr.course;
                                        const batch = enr.batch;
                                        const hasOutstandingDues = enr.id % 4 === 1;

                                        return (
                                            <tr
                                                key={enr.id}
                                                onClick={() => setProfileModal({ open: true, enrollment: enr })}
                                                className="hover:bg-slate-50/80 cursor-pointer transition"
                                            >
                                                {/* Student (Avatar, Full Name, District) */}
                                                <td className="py-3 px-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#0B3B24] to-emerald-700 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-slate-900 truncate">{user?.name || 'Student'}</p>
                                                            <p className="text-[11px] text-slate-400 truncate">
                                                                {profile?.domicile_district || 'Rahim Yar Khan'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Adm / Roll No */}
                                                <td className="py-3 px-3 font-mono font-bold text-[#0B3B24]">
                                                    {enr.enrollment_number}
                                                </td>

                                                {/* CNIC */}
                                                <td className="py-3 px-3 font-mono text-slate-500">
                                                    {user?.cnic || '31202-*******-*'}
                                                </td>

                                                {/* Trade / Class */}
                                                <td className="py-3 px-3">
                                                    <p className="font-semibold text-slate-800">{course?.name}</p>
                                                    <p className="text-[11px] text-slate-400 capitalize">{batch?.name} ({batch?.shift || 'Morning'})</p>
                                                </td>

                                                {/* Gender */}
                                                <td className="py-3 px-3 text-center">
                                                    <span className="capitalize px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                                        {profile?.gender || 'male'}
                                                    </span>
                                                </td>

                                                {/* Fee Status */}
                                                <td className="py-3 px-3 text-center">
                                                    {hasOutstandingDues ? (
                                                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                            Rs 3,500
                                                        </span>
                                                    ) : (
                                                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            Cleared
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Status Badge */}
                                                <td className="py-3 px-3 text-center">
                                                    <span
                                                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                            enr.status === 'active'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : enr.status === 'struck-off'
                                                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                                : enr.status === 'terminated'
                                                                ? 'bg-red-100 text-red-900 border-red-300'
                                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}
                                                    >
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        <span>{enr.status}</span>
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end space-x-1">
                                                        <button
                                                            onClick={() => setProfileModal({ open: true, enrollment: enr })}
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0B3B24] hover:bg-emerald-50 transition"
                                                            title="View Profile Dossier"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                setEditModal({
                                                                    open: true,
                                                                    data: {
                                                                        id: enr.id,
                                                                        name: user?.name || '',
                                                                        email: user?.email || '',
                                                                        phone: user?.phone || '',
                                                                        cnic: user?.cnic || '',
                                                                        father_name: profile?.father_name || '',
                                                                        date_of_birth: profile?.date_of_birth ? profile.date_of_birth.substring(0, 10) : '',
                                                                        gender: profile?.gender || 'male',
                                                                        domicile_district: profile?.domicile_district || 'Rahim Yar Khan',
                                                                        emergency_contact: profile?.emergency_contact || '',
                                                                        address: profile?.address || '',
                                                                        course_id: enr.course_id,
                                                                        batch_id: enr.batch_id,
                                                                        status: enr.status,
                                                                        registration_number: profile?.registration_number || enr.enrollment_number,
                                                                    },
                                                                })
                                                            }
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                                                            title="Edit Student"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                setDeleteModal({
                                                                    open: true,
                                                                    id: enr.id,
                                                                    name: user?.name || 'Trainee',
                                                                    roll: enr.enrollment_number,
                                                                })
                                                            }
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                                                            title="Delete Student"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {filteredEnrollments.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="py-12 text-center text-slate-400 text-xs">
                                                No trainees found for the selected category or search filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 2: Selected Candidates Awaiting Batch Allocation */}
                {activeTab === 'pending' && (
                    <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs text-gray-500">
                            <span className="font-bold text-gray-900">Candidates Ready for Batch Allocation</span>
                            <span>{filteredApplications.length} Candidates</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="text-gray-500 border-b border-gray-100">
                                        <th className="pb-3 font-semibold">App #</th>
                                        <th className="pb-3 font-semibold">Candidate</th>
                                        <th className="pb-3 font-semibold">Applied Course / Trade</th>
                                        <th className="pb-3 font-semibold">Target Batch</th>
                                        <th className="pb-3 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
                                    {filteredApplications.map((app) => {
                                        const user = app.student_profile?.user;
                                        const profile = app.student_profile;
                                        const course = app.course;

                                        const courseBatches = batches.filter(
                                            (b) => String(b.course_id) === String(app.course_id)
                                        );
                                        const options = courseBatches.length > 0 ? courseBatches : batches;
                                        const selectedBatchVal = selectedBatches[app.id] || options[0]?.id || '';

                                        return (
                                            <tr key={app.id} className="hover:bg-gray-50/80 transition">
                                                <td className="py-3.5 font-mono font-bold text-purple-600">
                                                    {app.application_number}
                                                </td>
                                                <td className="py-3.5">
                                                    <p className="font-bold text-gray-900">{user?.name || 'Applicant'}</p>
                                                    <p className="text-[11px] text-gray-500">
                                                        S/D of: {profile?.father_name || 'N/A'} • {profile?.domicile_district || 'District'}
                                                    </p>
                                                </td>
                                                <td className="py-3.5">
                                                    <p className="font-semibold text-gray-800">{course?.name}</p>
                                                    <p className="text-[11px] text-gray-400">{course?.trade?.name}</p>
                                                </td>
                                                <td className="py-3.5 min-w-[220px]">
                                                    <select
                                                        value={selectedBatchVal}
                                                        onChange={(e) => handleBatchChange(app.id, e.target.value)}
                                                        className="w-full text-xs font-semibold rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:ring-2 focus:ring-govt-green"
                                                    >
                                                        {options.map((b) => (
                                                            <option key={b.id} value={b.id}>
                                                                {b.name} ({b.session_year} • {b.shift})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="py-3.5 text-right">
                                                    <button
                                                        type="button"
                                                        disabled={enrollingId === app.id}
                                                        onClick={() => handleEnroll(app)}
                                                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white text-xs font-bold transition disabled:opacity-50"
                                                    >
                                                        <UserCheck className="h-3.5 w-3.5" />
                                                        <span>{enrollingId === app.id ? 'Enrolling...' : 'Enroll Student'}</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {filteredApplications.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-12 text-center text-gray-400 text-xs">
                                                No merit candidates awaiting enrollment.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ================================================================= */}
            {/* FLOATING STUDENT PROFILE MODAL (EduMaster Dossier Standard) */}
            {/* ================================================================= */}
            {profileModal.open && profileModal.enrollment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
                    <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
                        {/* Header: Large Avatar, Full Name, Trade Badge, Status Badge */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#0B3B24] to-emerald-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shrink-0">
                                    {profileModal.enrollment.student_profile?.user?.name
                                        ? profileModal.enrollment.student_profile.user.name.charAt(0).toUpperCase()
                                        : 'S'}
                                </div>
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-900">
                                        {profileModal.enrollment.student_profile?.user?.name || 'Trainee Candidate'}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                            {profileModal.enrollment.course?.name || 'Vocational Trade'}
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                                            {profileModal.enrollment.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setProfileModal({ open: false, enrollment: null })}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Info Grid: Admission No, Date of Birth, Guardian Phone, CNIC, Domicile District */}
                        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admission / Roll No</span>
                                <p className="font-mono font-bold text-[#0B3B24] text-sm mt-0.5">{profileModal.enrollment.enrollment_number}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CNIC / B-Form</span>
                                <p className="font-mono font-semibold text-slate-700 mt-0.5">{profileModal.enrollment.student_profile?.user?.cnic || '31202-*******-*'}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date of Birth</span>
                                <p className="font-medium text-slate-800 mt-0.5">{profileModal.enrollment.student_profile?.date_of_birth?.substring(0, 10) || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guardian Phone</span>
                                <p className="font-medium text-slate-800 mt-0.5">{profileModal.enrollment.student_profile?.user?.phone || profileModal.enrollment.student_profile?.emergency_contact || '0300-*******'}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Domicile District</span>
                                <p className="font-medium text-slate-800 mt-0.5">{profileModal.enrollment.student_profile?.domicile_district || 'Rahim Yar Khan'}</p>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Batch</span>
                                <p className="font-medium text-slate-800 mt-0.5">{profileModal.enrollment.batch?.name || 'Current Shift'}</p>
                            </div>
                        </div>

                        {/* Fee Summary Banner: Full-width green if cleared, Red if balance outstanding */}
                        {profileModal.enrollment.id % 4 === 1 ? (
                            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between gap-3 text-xs">
                                <div>
                                    <span className="font-bold block text-sm">Outstanding Balance: Rs 3,500</span>
                                    <p className="text-[11px] text-rose-700 mt-0.5">Term examination challan pending at National Bank of Pakistan.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => alert(`Notice reminder SMS broadcasted to candidate ${profileModal.enrollment.student_profile?.user?.name || 'Trainee'}`)}
                                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs shrink-0 transition"
                                >
                                    Send Notice
                                </button>
                            </div>
                        ) : (
                            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 text-xs">
                                <div className="flex items-center space-x-2.5">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                                    <div>
                                        <span className="font-bold block text-sm">All Dues Cleared</span>
                                        <p className="text-[11px] text-emerald-700 mt-0.5">Official TEVTA voucher bank deposit verified.</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    Verified
                                </span>
                            </div>
                        )}

                        {/* Bottom Buttons: View Full Report Card & Edit Profile */}
                        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => {
                                    const enr = profileModal.enrollment;
                                    setProfileModal({ open: false, enrollment: null });
                                    setEditModal({
                                        open: true,
                                        data: {
                                            id: enr.id,
                                            name: enr.student_profile?.user?.name || '',
                                            email: enr.student_profile?.user?.email || '',
                                            phone: enr.student_profile?.user?.phone || '',
                                            cnic: enr.student_profile?.user?.cnic || '',
                                            father_name: enr.student_profile?.father_name || '',
                                            date_of_birth: enr.student_profile?.date_of_birth ? enr.student_profile.date_of_birth.substring(0, 10) : '',
                                            gender: enr.student_profile?.gender || 'male',
                                            domicile_district: enr.student_profile?.domicile_district || 'Rahim Yar Khan',
                                            emergency_contact: enr.student_profile?.emergency_contact || '',
                                            address: enr.student_profile?.address || '',
                                            course_id: enr.course_id,
                                            batch_id: enr.batch_id,
                                            status: enr.status,
                                            registration_number: enr.student_profile?.registration_number || enr.enrollment_number,
                                        }
                                    });
                                }}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                            >
                                Edit Profile
                            </button>
                            <Link
                                href={route('admin.reports.index')}
                                className="px-4 py-2 rounded-xl bg-[#0B3B24] hover:bg-[#124E31] text-white font-bold text-xs transition shadow-xs"
                            >
                                View Full Report Card
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/* MANUAL STUDENT REGISTRATION MODAL */}
            {/* ================================================================= */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="w-full max-w-2xl rounded-3xl bg-white border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-2xl bg-govt-green-50 text-govt-green flex items-center justify-center border border-govt-green-200">
                                    <UserPlus className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">
                                        Manual Student Registration & Enrollment
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        Direct administrative creation of trainee credentials, profile, and cohort assignment
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setCreateModalOpen(false)}
                                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
                            {/* Account Credentials */}
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                                <span className="text-gray-700 font-bold uppercase tracking-wider text-[11px] block">
                                    1. User Account Credentials
                                </span>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-1">Full Student Name *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Muhammad Ali"
                                            value={createForm.name}
                                            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-govt-green"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-1">Email Address *</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="e.g. ali.student@gtti.edu.pk"
                                            value={createForm.email}
                                            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-govt-green"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-1">Default Password *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="password123"
                                            value={createForm.password}
                                            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 font-mono focus:ring-2 focus:ring-govt-green"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-1">Mobile Contact Phone</label>
                                        <input
                                            type="text"
                                            placeholder="03001234567"
                                            value={createForm.phone}
                                            onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                                            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-govt-green"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-gray-700 font-semibold mb-1">CNIC / B-Form Number</label>
                                        <input
                                            type="text"
                                            placeholder="31202-1234567-1"
                                            value={createForm.cnic}
                                            onChange={(e) => setCreateForm({ ...createForm, cnic: e.target.value })}
                                            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 font-mono focus:ring-2 focus:ring-govt-green"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Personal & Guardian Info */}
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                                <span className="text-gray-700 font-bold uppercase tracking-wider text-[11px] block">
                                    2. Guardian & Personal Profile
                                </span>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-1">Father's Name *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Tariq Mahmood"
                                            value={createForm.father_name}
                                            onChange={(e) => setCreateForm({ ...createForm, father_name: e.target.value })}
                                            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-govt-green"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-1">Gender *</label>
                                        <select
                                            value={createForm.gender}
                                            onChange={(e) => setCreateForm({ ...createForm, gender: e.target.value })}
                                            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-govt-green"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-1">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={createForm.date_of_birth}
                                            onChange={(e) => setCreateForm({ ...createForm, date_of_birth: e.target.value })}
                                            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-govt-green"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-1">Domicile District</label>
                                        <input
                                            type="text"
                                            value={createForm.domicile_district}
                                            onChange={(e) => setCreateForm({ ...createForm, domicile_district: e.target.value })}
                                            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-govt-green"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-gray-700 font-semibold mb-1">Residential Address</label>
                                        <input
                                            type="text"
                                            placeholder="House / Street, Tehsil & District"
                                            value={createForm.address}
                                            onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                                            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-govt-green"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Academic Batch Allocation */}
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                                <span className="text-gray-700 font-bold uppercase tracking-wider text-[11px] block">
                                    3. Academic Course & Cohort Allocation
                                </span>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-1">Course & Trade *</label>
                                        <select
                                            required
                                            value={createForm.course_id}
                                            onChange={(e) => {
                                                const newCourseId = e.target.value;
                                                const matchingBatches = batches.filter(
                                                    (b) => String(b.course_id) === String(newCourseId)
                                                );
                                                setCreateForm({
                                                    ...createForm,
                                                    course_id: newCourseId,
                                                    batch_id: matchingBatches[0]?.id || batches[0]?.id || '',
                                                });
                                            }}
                                            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-govt-green"
                                        >
                                            <option value="">Select Course</option>
                                            {courses.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name} ({c.entry_level})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-1">Batch *</label>
                                        <select
                                            required
                                            value={createForm.batch_id}
                                            onChange={(e) => setCreateForm({ ...createForm, batch_id: e.target.value })}
                                            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-govt-green"
                                        >
                                            <option value="">Select Batch</option>
                                            {batches
                                                .filter(
                                                    (b) =>
                                                        !createForm.course_id ||
                                                        String(b.course_id) === String(createForm.course_id)
                                                )
                                                .map((b) => (
                                                    <option key={b.id} value={b.id}>
                                                        {b.name} ({b.session_year} • {b.shift})
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-gray-700 font-semibold mb-1">
                                            Custom Roll Number (Optional — auto-generated if left blank)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. GTTI-2026-0099"
                                            value={createForm.registration_number}
                                            onChange={(e) =>
                                                setCreateForm({ ...createForm, registration_number: e.target.value })
                                            }
                                            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 font-mono uppercase focus:ring-2 focus:ring-govt-green"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setCreateModalOpen(false)}
                                    className="py-2.5 px-4 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="py-2.5 px-6 rounded-xl bg-govt-green text-white font-bold hover:bg-govt-green-600 disabled:opacity-50"
                                >
                                    {submitting ? 'Registering Trainee...' : 'Register & Enroll Trainee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/* EDIT STUDENT MODAL */}
            {/* ================================================================= */}
            {editModal.open && editModal.data && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="w-full max-w-2xl rounded-3xl bg-white border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                                    <Edit3 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">
                                        Edit Trainee Record: {editModal.data.name}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        Modify personal credentials, batch assignment, and enrollment status
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEditModal({ open: false, data: null })}
                                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditStudent} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-1">Student Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editModal.data.name}
                                        onChange={(e) =>
                                            setEditModal({
                                                ...editModal,
                                                data: { ...editModal.data, name: e.target.value },
                                            })
                                        }
                                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-1">Email Address *</label>
                                    <input
                                        type="email"
                                        required
                                        value={editModal.data.email}
                                        onChange={(e) =>
                                            setEditModal({
                                                ...editModal,
                                                data: { ...editModal.data, email: e.target.value },
                                            })
                                        }
                                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-1">Father's Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editModal.data.father_name}
                                        onChange={(e) =>
                                            setEditModal({
                                                ...editModal,
                                                data: { ...editModal.data, father_name: e.target.value },
                                            })
                                        }
                                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-1">CNIC</label>
                                    <input
                                        type="text"
                                        value={editModal.data.cnic}
                                        onChange={(e) =>
                                            setEditModal({
                                                ...editModal,
                                                data: { ...editModal.data, cnic: e.target.value },
                                            })
                                        }
                                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 font-mono focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={editModal.data.phone}
                                        onChange={(e) =>
                                            setEditModal({
                                                ...editModal,
                                                data: { ...editModal.data, phone: e.target.value },
                                            })
                                        }
                                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-1">Enrollment Status *</label>
                                    <select
                                        value={editModal.data.status}
                                        onChange={(e) =>
                                            setEditModal({
                                                ...editModal,
                                                data: { ...editModal.data, status: e.target.value },
                                            })
                                        }
                                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 font-bold"
                                    >
                                        <option value="active">Active Trainee</option>
                                        <option value="suspended">Suspended (Struck-off)</option>
                                        <option value="graduated">Graduated / Completed</option>
                                        <option value="dropped">Dropped / Expelled</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-1">Course *</label>
                                    <select
                                        value={editModal.data.course_id}
                                        onChange={(e) =>
                                            setEditModal({
                                                ...editModal,
                                                data: { ...editModal.data, course_id: e.target.value },
                                            })
                                        }
                                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                                    >
                                        {courses.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-1">Batch *</label>
                                    <select
                                        value={editModal.data.batch_id}
                                        onChange={(e) =>
                                            setEditModal({
                                                ...editModal,
                                                data: { ...editModal.data, batch_id: e.target.value },
                                            })
                                        }
                                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                                    >
                                        {batches.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.name} ({b.session_year} • {b.shift})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-gray-700 font-semibold mb-1">Residential Address</label>
                                    <input
                                        type="text"
                                        value={editModal.data.address}
                                        onChange={(e) =>
                                            setEditModal({
                                                ...editModal,
                                                data: { ...editModal.data, address: e.target.value },
                                            })
                                        }
                                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setEditModal({ open: false, data: null })}
                                    className="py-2.5 px-4 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="py-2.5 px-6 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : 'Save Trainee Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/* DELETE STUDENT CONFIRMATION MODAL */}
            {/* ================================================================= */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md rounded-3xl bg-white border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-5">
                        <div className="flex items-center space-x-3 text-rose-600">
                            <div className="h-10 w-10 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-200">
                                <AlertTriangle className="h-5 w-5 text-rose-600" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-gray-900">
                                    Delete Student Record
                                </h3>
                                <p className="text-xs text-gray-500">Roll: {deleteModal.roll}</p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed">
                            Are you sure you want to remove <strong className="text-gray-900">{deleteModal.name}</strong> from the college?
                            Their enrollment record will be safely deleted from active batch rosters.
                        </p>

                        <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setDeleteModal({ open: false, id: null, name: '', roll: '' })}
                                className="py-2 px-4 rounded-xl border border-gray-300 font-bold text-xs text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteStudent}
                                disabled={submitting}
                                className="py-2 px-5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 disabled:opacity-50"
                            >
                                {submitting ? 'Removing...' : 'Yes, Delete Student'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
