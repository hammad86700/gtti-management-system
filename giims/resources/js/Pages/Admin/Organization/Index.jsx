import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import {
    Building2,
    BookOpen,
    GraduationCap,
    Layers,
    Search,
    Clock,
    Award,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Plus,
    Edit3,
    Trash2,
    Sparkles,
    AlertTriangle,
    X,
    FolderPlus,
    Calendar,
    Sun,
    Moon,
    Users,
    UserX,
    ShieldAlert,
    RotateCcw,
    Eye,
    AlertCircle,
    Shield,
    Phone,
    FileText,
    Image as ImageIcon,
} from 'lucide-react';

export default function Index({
    departments = [],
    allDepartments = [],
    allPrograms = [],
    allTrades = [],
    allCourses = []
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedDepts, setExpandedDepts] = useState(
        departments.reduce((acc, d) => ({ ...acc, [d.id]: true }), {})
    );

    // Modal States
    const [courseModal, setCourseModal] = useState({ open: false, mode: 'create', data: null });
    const [deptModal, setDeptModal] = useState({ open: false, mode: 'create', data: null });
    const [programModal, setProgramModal] = useState({ open: false, mode: 'create', data: null });
    const [tradeModal, setTradeModal] = useState({ open: false, mode: 'create', data: null });
    const [batchModal, setBatchModal] = useState({ open: false, mode: 'create', data: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, type: '', id: null, name: '', url: '' });
    const [activeFlyerPreview, setActiveFlyerPreview] = useState(null);

    // Trainee Roster Modal State (Phase 24)
    const [rosterModal, setRosterModal] = useState({
        open: false,
        type: '', // 'course' or 'batch'
        id: null,
        title: '',
        loading: false,
        data: null,
    });
    const [rosterSearch, setRosterSearch] = useState('');
    const [rosterFilter, setRosterFilter] = useState('all'); // all, active, struck_off, terminated

    // Disciplinary Action Modals (Phase 24)
    const [strikeOffModal, setStrikeOffModal] = useState({
        open: false,
        enrollment: null,
        days: 14,
        reason: '',
        submitting: false,
    });

    const [terminateModal, setTerminateModal] = useState({
        open: false,
        enrollment: null,
        reason: '',
        submitting: false,
    });

    const [reinstateModal, setReinstateModal] = useState({
        open: false,
        enrollment: null,
        submitting: false,
    });

    // Processing flags
    const [submitting, setSubmitting] = useState(false);

    const toggleDept = (deptId) => {
        setExpandedDepts((prev) => ({
            ...prev,
            [deptId]: !prev[deptId],
        }));
    };

    // Statistics calculations
    const totalPrograms = departments.reduce((acc, d) => acc + (d.programs?.length || 0), 0);
    const totalTrades = departments.reduce(
        (acc, d) => acc + (d.programs?.reduce((pAcc, p) => pAcc + (p.trades?.length || 0), 0) || 0),
        0
    );
    const totalCourses = departments.reduce(
        (acc, d) =>
            acc +
            (d.programs?.reduce(
                (pAcc, p) => pAcc + (p.trades?.reduce((tAcc, t) => tAcc + (t.courses?.length || 0), 0) || 0),
                0
            ) || 0),
        0
    );

    // Filtering
    const filteredDepartments = departments.filter((dept) => {
        const q = searchTerm.toLowerCase();
        const matchesDeptName = dept.name.toLowerCase().includes(q);
        const matchesDeptCode = dept.code.toLowerCase().includes(q);
        const matchesTrade = dept.programs?.some((p) =>
            p.trades?.some(
                (t) =>
                    t.name.toLowerCase().includes(q) ||
                    (t.code && t.code.toLowerCase().includes(q)) ||
                    t.courses?.some((c) => c.name.toLowerCase().includes(q))
            )
        );
        return matchesDeptName || matchesDeptCode || matchesTrade;
    });

    // =========================================================================
    // HANDLERS
    // =========================================================================

    const handleDeleteSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        router.delete(deleteModal.url, {
            onFinish: () => {
                setSubmitting(false);
                setDeleteModal({ open: false, type: '', id: null, name: '', url: '' });
            },
        });
    };

    // =========================================================================
    // TRAINEE ROSTER & DISCIPLINE HANDLERS (PHASE 24)
    // =========================================================================

    const openTraineesRoster = async (type, id, title) => {
        setRosterModal({
            open: true,
            type,
            id,
            title,
            loading: true,
            data: null,
        });
        setRosterSearch('');
        setRosterFilter('all');

        try {
            const url = type === 'course'
                ? route('admin.organization.courses.students', id)
                : route('admin.organization.batches.students', id);
            const res = await fetch(url, {
                headers: { 'Accept': 'application/json' }
            });
            const json = await res.json();
            setRosterModal(prev => ({ ...prev, loading: false, data: json }));
        } catch (err) {
            console.error('Failed to load trainees roster:', err);
            setRosterModal(prev => ({ ...prev, loading: false }));
        }
    };

    const reloadRoster = async () => {
        if (!rosterModal.open || !rosterModal.id) return;
        try {
            const url = rosterModal.type === 'course'
                ? route('admin.organization.courses.students', rosterModal.id)
                : route('admin.organization.batches.students', rosterModal.id);
            const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
            const json = await res.json();
            setRosterModal(prev => ({ ...prev, data: json }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleStrikeOffSubmit = (e) => {
        e.preventDefault();
        if (!strikeOffModal.enrollment) return;
        setStrikeOffModal(prev => ({ ...prev, submitting: true }));

        router.post(route('admin.discipline.enrollments.strike-off', strikeOffModal.enrollment.id), {
            days: strikeOffModal.days,
            reason: strikeOffModal.reason,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setStrikeOffModal({ open: false, enrollment: null, days: 14, reason: '', submitting: false });
                reloadRoster();
            },
            onFinish: () => {
                setStrikeOffModal(prev => ({ ...prev, submitting: false }));
            }
        });
    };

    const handleTerminateSubmit = (e) => {
        e.preventDefault();
        if (!terminateModal.enrollment) return;
        setTerminateModal(prev => ({ ...prev, submitting: true }));

        router.post(route('admin.discipline.enrollments.terminate', terminateModal.enrollment.id), {
            reason: terminateModal.reason,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setTerminateModal({ open: false, enrollment: null, reason: '', submitting: false });
                reloadRoster();
            },
            onFinish: () => {
                setTerminateModal(prev => ({ ...prev, submitting: false }));
            }
        });
    };

    const handleReinstateSubmit = (e) => {
        e.preventDefault();
        if (!reinstateModal.enrollment) return;
        setReinstateModal(prev => ({ ...prev, submitting: true }));

        router.post(route('admin.discipline.enrollments.reinstate', reinstateModal.enrollment.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setReinstateModal({ open: false, enrollment: null, submitting: false });
                reloadRoster();
            },
            onFinish: () => {
                setReinstateModal(prev => ({ ...prev, submitting: false }));
            }
        });
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold font-serif text-slate-900 tracking-tight">
                            Organization & Academic Hierarchy
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Govt. Technical Training Institute, Rahim Yar Khan (GIIMS) • Full Administrative Controls
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                        <button
                            onClick={() =>
                                setDeptModal({
                                    open: true,
                                    mode: 'create',
                                    data: { name: '', code: '' },
                                })
                            }
                            className="inline-flex items-center space-x-1.5 py-2 px-3.5 rounded-xl bg-[#0B3B24] text-white text-xs font-bold shadow-xs hover:bg-[#124E31] transition"
                        >
                            <Plus className="h-4 w-4 text-emerald-400" />
                            <span>Add Department</span>
                        </button>

                        <button
                            onClick={() =>
                                setProgramModal({
                                    open: true,
                                    mode: 'create',
                                    data: {
                                        department_id: allDepartments[0]?.id || '',
                                        name: '',
                                        type: 'diploma',
                                        duration_months: 6,
                                    },
                                })
                            }
                            className="inline-flex items-center space-x-1.5 py-2 px-3.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 transition"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Program</span>
                        </button>

                        <button
                            onClick={() =>
                                setTradeModal({
                                    open: true,
                                    mode: 'create',
                                    data: {
                                        program_id: allPrograms[0]?.id || '',
                                        name: '',
                                        code: '',
                                    },
                                })
                            }
                            className="inline-flex items-center space-x-1.5 py-2 px-3.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Trade</span>
                        </button>

                        <button
                            onClick={() =>
                                setCourseModal({
                                    open: true,
                                    mode: 'create',
                                    data: {
                                        trade_id: allTrades[0]?.id || '',
                                        name: '',
                                        entry_level: 'Matric',
                                        is_active: true,
                                        advertisement_image: null,
                                        remove_advertisement: false,
                                        advertisement_preview: null,
                                    },
                                })
                            }
                            className="inline-flex items-center space-x-1.5 py-2 px-3.5 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-xs hover:bg-amber-700 transition"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Course</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Organization & Course Management - GIIMS" />

            <div className="space-y-6">
                {/* Stats Summary Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
                        <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Departments</p>
                            <h3 className="text-xl font-black text-slate-900 mt-0.5">{departments.length}</h3>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
                        <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Programs</p>
                            <h3 className="text-xl font-black text-slate-900 mt-0.5">{totalPrograms}</h3>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
                        <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                            <Layers className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Trades</p>
                            <h3 className="text-xl font-black text-slate-900 mt-0.5">{totalTrades}</h3>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
                        <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Accredited Courses</p>
                            <h3 className="text-xl font-black text-slate-900 mt-0.5">{totalCourses}</h3>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search Department, Trade, Course or Code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3B24]/20 focus:border-[#0B3B24]"
                        />
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <span>
                            Showing <strong className="text-slate-900 font-bold">{filteredDepartments.length}</strong> of{' '}
                            {departments.length} departments
                        </span>
                    </div>
                </div>

                {/* Departments List */}
                <div className="space-y-5">
                    {filteredDepartments.map((dept) => {
                        const isExpanded = expandedDepts[dept.id] ?? true;

                        return (
                            <div
                                key={dept.id}
                                className="overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm transition-all"
                            >
                                {/* Department Accordion Header */}
                                <div className="p-5 flex items-center justify-between bg-white border-b border-gray-100">
                                    <div
                                        onClick={() => toggleDept(dept.id)}
                                        className="flex items-center space-x-3.5 cursor-pointer flex-1"
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-govt-green text-white flex items-center justify-center shadow-sm">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                                                    {dept.name}
                                                </h3>
                                                <span className="px-2 py-0.5 rounded bg-govt-green-50 border border-govt-green-200 text-govt-green font-mono text-[11px] font-bold">
                                                    {dept.code}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {dept.programs?.length || 0} Academic Programs
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons for Department */}
                                    <div className="flex items-center space-x-2 shrink-0">
                                        <button
                                            onClick={() =>
                                                setDeptModal({
                                                    open: true,
                                                    mode: 'edit',
                                                    data: { id: dept.id, name: dept.name, code: dept.code },
                                                })
                                            }
                                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
                                            title="Edit Department"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </button>

                                        <button
                                            onClick={() =>
                                                setDeleteModal({
                                                    open: true,
                                                    type: 'Department',
                                                    id: dept.id,
                                                    name: dept.name,
                                                    url: route('admin.organization.departments.destroy', dept.id),
                                                })
                                            }
                                            className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition"
                                            title="Delete Department"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>

                                        <button
                                            onClick={() => toggleDept(dept.id)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
                                        >
                                            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Department Programs and Trades Content */}
                                {isExpanded && (
                                    <div className="p-5 space-y-6 bg-gray-50/50">
                                        {dept.programs?.map((program) => (
                                            <div
                                                key={program.id}
                                                className="rounded-2xl bg-white border border-gray-200 p-5 space-y-4 shadow-sm"
                                            >
                                                {/* Program Subheader */}
                                                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                                                    <div className="flex items-center space-x-2">
                                                        <BookOpen className="h-4 w-4 text-purple-600" />
                                                        <span className="text-sm font-bold text-gray-900">
                                                            {program.name}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-semibold uppercase">
                                                            {program.type}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            • {program.duration_months} Months
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center space-x-1">
                                                        <button
                                                            onClick={() =>
                                                                setTradeModal({
                                                                    open: true,
                                                                    mode: 'create',
                                                                    data: { program_id: program.id, name: '', code: '' },
                                                                })
                                                            }
                                                            className="text-xs text-amber-600 hover:text-amber-800 font-bold px-2 py-1 rounded-md hover:bg-amber-50"
                                                        >
                                                            + Add Trade
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                setProgramModal({
                                                                    open: true,
                                                                    mode: 'edit',
                                                                    data: {
                                                                        id: program.id,
                                                                        department_id: dept.id,
                                                                        name: program.name,
                                                                        type: program.type,
                                                                        duration_months: program.duration_months,
                                                                    },
                                                                })
                                                            }
                                                            className="p-1 rounded text-gray-400 hover:text-blue-600"
                                                            title="Edit Program"
                                                        >
                                                            <Edit3 className="h-3.5 w-3.5" />
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                setDeleteModal({
                                                                    open: true,
                                                                    type: 'Program',
                                                                    id: program.id,
                                                                    name: program.name,
                                                                    url: route('admin.organization.programs.destroy', program.id),
                                                                })
                                                            }
                                                            className="p-1 rounded text-gray-400 hover:text-rose-600"
                                                            title="Delete Program"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Trades List */}
                                                <div className="space-y-4">
                                                    {program.trades?.map((trade) => (
                                                        <div
                                                            key={trade.id}
                                                            className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 space-y-3"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-2">
                                                                    <Layers className="h-4 w-4 text-amber-600" />
                                                                    <span className="font-bold text-gray-900 text-xs sm:text-sm">
                                                                        {trade.name}
                                                                    </span>
                                                                    <span className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 font-mono text-[10px] font-bold">
                                                                        {trade.code}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center space-x-2">
                                                                    <button
                                                                        onClick={() =>
                                                                            setCourseModal({
                                                                                open: true,
                                                                                mode: 'create',
                                                                                data: {
                                                                                    trade_id: trade.id,
                                                                                    name: '',
                                                                                    entry_level: 'Matric',
                                                                                    is_active: true,
                                                                                    offered_shifts: 'Both',
                                                                                    advertisement_image: null,
                                                                                    remove_advertisement: false,
                                                                                    advertisement_preview: null,
                                                                                },
                                                                            })
                                                                        }
                                                                        className="text-xs text-govt-green hover:text-govt-green-600 font-bold px-2 py-0.5 rounded hover:bg-govt-green-50"
                                                                    >
                                                                        + Add Course
                                                                    </button>

                                                                    <button
                                                                        onClick={() =>
                                                                            setTradeModal({
                                                                                open: true,
                                                                                mode: 'edit',
                                                                                data: {
                                                                                    id: trade.id,
                                                                                    program_id: program.id,
                                                                                    name: trade.name,
                                                                                    code: trade.code,
                                                                                },
                                                                            })
                                                                        }
                                                                        className="p-1 rounded text-gray-400 hover:text-blue-600"
                                                                        title="Edit Trade"
                                                                    >
                                                                        <Edit3 className="h-3.5 w-3.5" />
                                                                    </button>

                                                                    <button
                                                                        onClick={() =>
                                                                            setDeleteModal({
                                                                                open: true,
                                                                                type: 'Trade',
                                                                                id: trade.id,
                                                                                name: trade.name,
                                                                                url: route('admin.organization.trades.destroy', trade.id),
                                                                            })
                                                                        }
                                                                        className="p-1 rounded text-gray-400 hover:text-rose-600"
                                                                        title="Delete Trade"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Courses within Trade */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                                                {trade.courses?.map((course) => (
                                                                    <div
                                                                        key={course.id}
                                                                        className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-sm space-y-2.5"
                                                                    >
                                                                        <div className="flex items-start justify-between gap-2">
                                                                            <div className="flex items-start space-x-2.5">
                                                                                {(course.advertisement_url || course.advertisement_image_path) ? (
                                                                                    <img
                                                                                        src={course.advertisement_url || `/storage/${course.advertisement_image_path}`}
                                                                                        alt="Ad Flyer"
                                                                                        onClick={() => setActiveFlyerPreview(course)}
                                                                                        className="w-11 h-11 rounded-lg object-cover border border-slate-200 shadow-xs shrink-0 cursor-pointer hover:ring-2 hover:ring-emerald-500 transition"
                                                                                        title="Click to view course advertisement flyer"
                                                                                    />
                                                                                ) : (
                                                                                    <Award className="h-4 w-4 text-govt-green shrink-0 mt-0.5" />
                                                                                )}
                                                                                <div>
                                                                                    <h4 className="font-bold text-gray-900 text-xs">
                                                                                        {course.name}
                                                                                    </h4>
                                                                                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                                                                            Entry: {course.entry_level}
                                                                                        </span>
                                                                                        {course.active_enrollments_count !== undefined && (
                                                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                                                {course.active_enrollments_count} Active
                                                                                            </span>
                                                                                        )}
                                                                                        {course.struck_off_enrollments_count > 0 && (
                                                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                                                                                                {course.struck_off_enrollments_count} Struck Off
                                                                                            </span>
                                                                                        )}
                                                                                        {course.terminated_enrollments_count > 0 && (
                                                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                                                                {course.terminated_enrollments_count} Expelled
                                                                                            </span>
                                                                                        )}
                                                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                                                            course.offered_shifts === 'Morning'
                                                                                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                                                                                : course.offered_shifts === 'Evening'
                                                                                                    ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                                                                                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                                                                                        }`}>
                                                                                            {course.offered_shifts === 'Morning' ? '🌅 Morning' : course.offered_shifts === 'Evening' ? '🌙 Evening' : '🌅 Morning & 🌙 Evening'}
                                                                                        </span>
                                                                                        {(course.advertisement_url || course.advertisement_image_path) && (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => setActiveFlyerPreview(course)}
                                                                                                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition"
                                                                                                title="View Course Advertisement Flyer"
                                                                                            >
                                                                                                <ImageIcon className="h-3 w-3" />
                                                                                                <span>Ad Flyer</span>
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex items-center space-x-1 shrink-0">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openTraineesRoster('course', course.id, course.name)}
                                                                                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-govt-green text-white hover:bg-govt-green-600 text-[11px] font-bold shadow-xs transition"
                                                                                    title="View Course Trainees Roster"
                                                                                >
                                                                                    <Users className="h-3.5 w-3.5" />
                                                                                    <span>Trainees</span>
                                                                                </button>

                                                                                <button
                                                                                    onClick={() =>
                                                                                        setCourseModal({
                                                                                            open: true,
                                                                                            mode: 'edit',
                                                                                            data: {
                                                                                                id: course.id,
                                                                                                trade_id: trade.id,
                                                                                                name: course.name,
                                                                                                entry_level: course.entry_level,
                                                                                                is_active: course.is_active,
                                                                                                offered_shifts: course.offered_shifts || 'Both',
                                                                                                advertisement_image: null,
                                                                                                remove_advertisement: false,
                                                                                                advertisement_preview: course.advertisement_url || (course.advertisement_image_path ? `/storage/${course.advertisement_image_path}` : null),
                                                                                            },
                                                                                        })
                                                                                    }
                                                                                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                                                                    title="Edit Course"
                                                                                >
                                                                                    <Edit3 className="h-3.5 w-3.5" />
                                                                                </button>

                                                                                <button
                                                                                    onClick={() =>
                                                                                        setDeleteModal({
                                                                                            open: true,
                                                                                            type: 'Course',
                                                                                            id: course.id,
                                                                                            name: course.name,
                                                                                            url: route('admin.organization.courses.destroy', course.id),
                                                                                        })
                                                                                    }
                                                                                    className="p-1 text-gray-400 hover:text-rose-600 rounded"
                                                                                    title="Delete Course"
                                                                                >
                                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                                </button>
                                                                            </div>
                                                                        </div>

                                                                        {/* Batches within Course */}
                                                                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                                                                            <span className="text-gray-500 font-medium">
                                                                                {course.batches?.length || 0} Batches Cohorts
                                                                            </span>

                                                                            <button
                                                                                onClick={() =>
                                                                                    setBatchModal({
                                                                                        open: true,
                                                                                        mode: 'create',
                                                                                        data: {
                                                                                            course_id: course.id,
                                                                                            name: `${course.name.substring(0, 4).toUpperCase()}-2026-A`,
                                                                                            session_year: '2026-2027',
                                                                                            shift: 'morning',
                                                                                            start_date: '',
                                                                                            end_date: '',
                                                                                        },
                                                                                    })
                                                                                }
                                                                                className="text-blue-600 hover:text-blue-800 font-bold"
                                                                            >
                                                                                + Add Batch
                                                                            </button>
                                                                        </div>

                                                                        {course.batches && course.batches.length > 0 && (
                                                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                                                {course.batches.map((batch) => (
                                                                                    <button
                                                                                        key={batch.id}
                                                                                        type="button"
                                                                                        onClick={() => openTraineesRoster('batch', batch.id, `${batch.name} (${course.name})`)}
                                                                                        className="inline-flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 border border-gray-200 text-[10px] text-gray-700 font-mono transition text-left group"
                                                                                        title="Click to inspect batch trainee roster"
                                                                                    >
                                                                                        <span className="font-bold text-gray-900 group-hover:text-govt-green">{batch.name}</span>
                                                                                        <span className="text-gray-400">•</span>
                                                                                        <span className="capitalize text-gray-600">{batch.shift}</span>
                                                                                        {batch.active_enrollments_count !== undefined && (
                                                                                            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                                                                                {batch.active_enrollments_count} active
                                                                                            </span>
                                                                                        )}
                                                                                        {batch.struck_off_enrollments_count > 0 && (
                                                                                            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
                                                                                                {batch.struck_off_enrollments_count} struck
                                                                                            </span>
                                                                                        )}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}

                                                                {(!trade.courses || trade.courses.length === 0) && (
                                                                    <p className="text-xs text-gray-400 col-span-2 italic py-2">
                                                                        No courses created under this trade yet. Click "+ Add Course" above.
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {(!program.trades || program.trades.length === 0) && (
                                                        <p className="text-xs text-gray-400 italic py-2">
                                                            No trades assigned to this program yet.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {(!dept.programs || dept.programs.length === 0) && (
                                            <p className="text-xs text-gray-400 italic py-2">
                                                No programs created in this department. Click "+ Add Program" above.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {filteredDepartments.length === 0 && (
                        <div className="text-center py-12 rounded-2xl bg-white border border-gray-200 p-8">
                            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-gray-900">No Departments or Courses Found</h3>
                            <p className="text-xs text-gray-500 mt-1">Try refining your search keyword or create a new department.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ================================================================= */}
            {/* COURSE MODAL (CREATE / EDIT) */}
            {/* ================================================================= */}
            {courseModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-lg rounded-3xl bg-white border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">
                                    {courseModal.mode === 'create' ? 'Add New Technical Course' : 'Edit Course Details'}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Configure trade accreditation and academic entry requirements
                                </p>
                            </div>
                            <button
                                onClick={() => setCourseModal({ open: false, mode: 'create', data: null })}
                                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setSubmitting(true);
                                const isEdit = courseModal.mode === 'edit';
                                const url = isEdit
                                    ? route('admin.organization.courses.update', courseModal.data.id)
                                    : route('admin.organization.courses.store');

                                router.post(url, {
                                    ...courseModal.data,
                                    _method: isEdit ? 'patch' : 'post',
                                }, {
                                    forceFormData: true,
                                    onFinish: () => {
                                        setSubmitting(false);
                                        setCourseModal({ open: false, mode: 'create', data: null });
                                    },
                                });
                            }}
                            className="space-y-4 text-xs"
                        >
                            <div>
                                <label className="block text-gray-700 font-bold mb-1">Affiliated Trade *</label>
                                <select
                                    required
                                    value={courseModal.data.trade_id}
                                    onChange={(e) =>
                                        setCourseModal({
                                            ...courseModal,
                                            data: { ...courseModal.data, trade_id: e.target.value },
                                        })
                                    }
                                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-govt-green"
                                >
                                    <option value="">Select a Trade</option>
                                    {allTrades.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} ({t.code || 'N/A'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-1">Course Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Web Development & Digital Applications"
                                    value={courseModal.data.name}
                                    onChange={(e) =>
                                        setCourseModal({
                                            ...courseModal,
                                            data: { ...courseModal.data, name: e.target.value },
                                        })
                                    }
                                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-govt-green"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-1">Minimum Entry Qualification *</label>
                                <select
                                    required
                                    value={courseModal.data.entry_level}
                                    onChange={(e) =>
                                        setCourseModal({
                                            ...courseModal,
                                            data: { ...courseModal.data, entry_level: e.target.value },
                                        })
                                    }
                                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-govt-green"
                                >
                                    <option value="Matric (Science)">Matric (Science)</option>
                                    <option value="Matric (Arts / General)">Matric (Arts / General)</option>
                                    <option value="Middle (8th Class)">Middle (8th Class)</option>
                                    <option value="Intermediate (F.Sc / FA / I.Com)">Intermediate (F.Sc / FA / I.Com)</option>
                                    <option value="DAE / Diploma">DAE / Diploma</option>
                                    <option value="Open Entry / Literacy">Open Entry / Literacy</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-1">Offered Batch Shift(s) *</label>
                                <select
                                    required
                                    value={courseModal.data.offered_shifts || 'Both'}
                                    onChange={(e) =>
                                        setCourseModal({
                                            ...courseModal,
                                            data: { ...courseModal.data, offered_shifts: e.target.value },
                                        })
                                    }
                                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-bold focus:ring-2 focus:ring-govt-green"
                                >
                                    <option value="Both">🌅 Morning & 🌙 Evening (Both Shifts Available)</option>
                                    <option value="Morning">🌅 Morning Shift Only (08:00 AM – 01:30 PM)</option>
                                    <option value="Evening">🌙 Evening Shift Only (02:00 PM – 07:00 PM)</option>
                                </select>
                                <p className="text-[11px] text-gray-500 mt-1">
                                    Specifies whether candidates can apply for Morning, Evening, or choose either.
                                </p>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="course_active"
                                    checked={courseModal.data.is_active}
                                    onChange={(e) =>
                                        setCourseModal({
                                            ...courseModal,
                                            data: { ...courseModal.data, is_active: e.target.checked },
                                        })
                                    }
                                    className="rounded border-gray-300 text-govt-green focus:ring-govt-green"
                                />
                                <label htmlFor="course_active" className="text-gray-700 font-semibold cursor-pointer">
                                    Active for Student Enrollment & Batch Allocations
                                </label>
                            </div>

                            {/* Course Advertisement / Intake Flyer (Optional) */}
                            <div className="pt-2 border-t border-gray-100">
                                <label className="block text-gray-700 font-bold mb-1">
                                    Course Advertisement Flyer / Banner (Optional)
                                </label>
                                <p className="text-[11px] text-gray-500 mb-2">
                                    Upload official marketing flyer/poster for public portal and applicant preview (JPG, PNG, WebP up to 5MB).
                                </p>

                                {courseModal.data.advertisement_preview ? (
                                    <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 p-2.5 flex items-center space-x-3">
                                        <img
                                            src={courseModal.data.advertisement_preview}
                                            alt="Ad Preview"
                                            className="w-14 h-14 object-cover rounded-xl border border-gray-200 bg-white shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-800 text-xs truncate">
                                                {courseModal.data.advertisement_image?.name || 'Current Advertisement Flyer'}
                                            </p>
                                            <p className="text-[10px] text-emerald-700 font-semibold">
                                                ✓ Active flyer attached
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCourseModal({
                                                    ...courseModal,
                                                    data: {
                                                        ...courseModal.data,
                                                        advertisement_image: null,
                                                        advertisement_preview: null,
                                                        remove_advertisement: true,
                                                    },
                                                })
                                            }
                                            className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition shrink-0"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-gray-300 hover:border-govt-green rounded-2xl cursor-pointer bg-gray-50 hover:bg-emerald-50/40 transition">
                                        <ImageIcon className="h-5 w-5 text-gray-400 mb-1" />
                                        <span className="text-xs font-bold text-gray-700">Click to upload intake ad flyer</span>
                                        <span className="text-[10px] text-gray-400">JPG, PNG, WebP up to 5MB</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setCourseModal({
                                                        ...courseModal,
                                                        data: {
                                                            ...courseModal.data,
                                                            advertisement_image: file,
                                                            advertisement_preview: URL.createObjectURL(file),
                                                            remove_advertisement: false,
                                                        },
                                                    });
                                                }
                                            }}
                                        />
                                    </label>
                                )}
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setCourseModal({ open: false, mode: 'create', data: null })}
                                    className="py-2 px-4 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="py-2 px-5 rounded-xl bg-govt-green text-white font-bold hover:bg-govt-green-600 disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : courseModal.mode === 'create' ? 'Create Course' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/* DEPARTMENT MODAL (CREATE / EDIT) */}
            {/* ================================================================= */}
            {deptModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md rounded-3xl bg-white border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">
                                    {deptModal.mode === 'create' ? 'Add Academic Department' : 'Edit Department'}
                                </h3>
                                <p className="text-xs text-gray-500">Institutional Faculty & Wing Definition</p>
                            </div>
                            <button
                                onClick={() => setDeptModal({ open: false, mode: 'create', data: null })}
                                className="p-2 rounded-xl text-gray-400 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setSubmitting(true);
                                const isEdit = deptModal.mode === 'edit';
                                const url = isEdit
                                    ? route('admin.organization.departments.update', deptModal.data.id)
                                    : route('admin.organization.departments.store');
                                const method = isEdit ? 'patch' : 'post';

                                router[method](url, deptModal.data, {
                                    onFinish: () => {
                                        setSubmitting(false);
                                        setDeptModal({ open: false, mode: 'create', data: null });
                                    },
                                });
                            }}
                            className="space-y-4 text-xs"
                        >
                            <div>
                                <label className="block text-gray-700 font-bold mb-1">Department Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Information Technology & Computer Sciences"
                                    value={deptModal.data.name}
                                    onChange={(e) =>
                                        setDeptModal({
                                            ...deptModal,
                                            data: { ...deptModal.data, name: e.target.value },
                                        })
                                    }
                                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-1">Department Code *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. ITCS"
                                    value={deptModal.data.code}
                                    onChange={(e) =>
                                        setDeptModal({
                                            ...deptModal,
                                            data: { ...deptModal.data, code: e.target.value },
                                        })
                                    }
                                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-mono uppercase focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setDeptModal({ open: false, mode: 'create', data: null })}
                                    className="py-2 px-4 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="py-2 px-5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : deptModal.mode === 'create' ? 'Create Department' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/* PROGRAM MODAL (CREATE / EDIT) */}
            {/* ================================================================= */}
            {programModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md rounded-3xl bg-white border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">
                                    {programModal.mode === 'create' ? 'Add Academic Program' : 'Edit Program'}
                                </h3>
                                <p className="text-xs text-gray-500">Degree, Diploma, or Short-Course Curriculum</p>
                            </div>
                            <button
                                onClick={() => setProgramModal({ open: false, mode: 'create', data: null })}
                                className="p-2 rounded-xl text-gray-400 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setSubmitting(true);
                                const isEdit = programModal.mode === 'edit';
                                const url = isEdit
                                    ? route('admin.organization.programs.update', programModal.data.id)
                                    : route('admin.organization.programs.store');
                                const method = isEdit ? 'patch' : 'post';

                                router[method](url, programModal.data, {
                                    onFinish: () => {
                                        setSubmitting(false);
                                        setProgramModal({ open: false, mode: 'create', data: null });
                                    },
                                });
                            }}
                            className="space-y-4 text-xs"
                        >
                            <div>
                                <label className="block text-gray-700 font-bold mb-1">Parent Department *</label>
                                <select
                                    required
                                    value={programModal.data.department_id}
                                    onChange={(e) =>
                                        setProgramModal({
                                            ...programModal,
                                            data: { ...programModal.data, department_id: e.target.value },
                                        })
                                    }
                                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Select Department</option>
                                    {allDepartments.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} ({d.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-1">Program Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. G-II 2-Year Diploma"
                                    value={programModal.data.name}
                                    onChange={(e) =>
                                        setProgramModal({
                                            ...programModal,
                                            data: { ...programModal.data, name: e.target.value },
                                        })
                                    }
                                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-700 font-bold mb-1">Type *</label>
                                    <select
                                        value={programModal.data.type}
                                        onChange={(e) =>
                                            setProgramModal({
                                                ...programModal,
                                                data: { ...programModal.data, type: e.target.value },
                                            })
                                        }
                                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="diploma">Diploma</option>
                                        <option value="certificate">Certificate</option>
                                        <option value="short-course">Short Course</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-1">Duration (Months) *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="72"
                                        required
                                        value={programModal.data.duration_months}
                                        onChange={(e) =>
                                            setProgramModal({
                                                ...programModal,
                                                data: { ...programModal.data, duration_months: e.target.value },
                                            })
                                        }
                                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setProgramModal({ open: false, mode: 'create', data: null })}
                                    className="py-2 px-4 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="py-2 px-5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : programModal.mode === 'create' ? 'Create Program' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/* TRADE MODAL (CREATE / EDIT) */}
            {/* ================================================================= */}
            {tradeModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md rounded-3xl bg-white border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">
                                    {tradeModal.mode === 'create' ? 'Add Technical Trade' : 'Edit Trade'}
                                </h3>
                                <p className="text-xs text-gray-500">Accredited Specialization Trade</p>
                            </div>
                            <button
                                onClick={() => setTradeModal({ open: false, mode: 'create', data: null })}
                                className="p-2 rounded-xl text-gray-400 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setSubmitting(true);
                                const isEdit = tradeModal.mode === 'edit';
                                const url = isEdit
                                    ? route('admin.organization.trades.update', tradeModal.data.id)
                                    : route('admin.organization.trades.store');
                                const method = isEdit ? 'patch' : 'post';

                                router[method](url, tradeModal.data, {
                                    onFinish: () => {
                                        setSubmitting(false);
                                        setTradeModal({ open: false, mode: 'create', data: null });
                                    },
                                });
                            }}
                            className="space-y-4 text-xs"
                        >
                            <div>
                                <label className="block text-gray-700 font-bold mb-1">Parent Program *</label>
                                <select
                                    required
                                    value={tradeModal.data.program_id}
                                    onChange={(e) =>
                                        setTradeModal({
                                            ...tradeModal,
                                            data: { ...tradeModal.data, program_id: e.target.value },
                                        })
                                    }
                                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="">Select Program</option>
                                    {allPrograms.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.department?.name || 'Dept'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-1">Trade Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Computer Applications"
                                    value={tradeModal.data.name}
                                    onChange={(e) =>
                                        setTradeModal({
                                            ...tradeModal,
                                            data: { ...tradeModal.data, name: e.target.value },
                                        })
                                    }
                                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-1">Trade Code *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. CA"
                                    value={tradeModal.data.code}
                                    onChange={(e) =>
                                        setTradeModal({
                                            ...tradeModal,
                                            data: { ...tradeModal.data, code: e.target.value },
                                        })
                                    }
                                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-mono uppercase focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setTradeModal({ open: false, mode: 'create', data: null })}
                                    className="py-2 px-4 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="py-2 px-5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : tradeModal.mode === 'create' ? 'Create Trade' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/* BATCH MODAL (CREATE / EDIT) */}
            {/* ================================================================= */}
            {batchModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md rounded-3xl bg-white border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">
                                    {batchModal.mode === 'create' ? 'Add Academic Batch' : 'Edit Batch'}
                                </h3>
                                <p className="text-xs text-gray-500">Student cohort and session allocation</p>
                            </div>
                            <button
                                onClick={() => setBatchModal({ open: false, mode: 'create', data: null })}
                                className="p-2 rounded-xl text-gray-400 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setSubmitting(true);
                                const isEdit = batchModal.mode === 'edit';
                                const url = isEdit
                                    ? route('admin.organization.batches.update', batchModal.data.id)
                                    : route('admin.organization.batches.store');
                                const method = isEdit ? 'patch' : 'post';

                                router[method](url, batchModal.data, {
                                    onFinish: () => {
                                        setSubmitting(false);
                                        setBatchModal({ open: false, mode: 'create', data: null });
                                    },
                                });
                            }}
                            className="space-y-4 text-xs"
                        >
                            <div>
                                <label className="block text-gray-700 font-bold mb-1">Course *</label>
                                <select
                                    required
                                    value={batchModal.data.course_id}
                                    onChange={(e) =>
                                        setBatchModal({
                                            ...batchModal,
                                            data: { ...batchModal.data, course_id: e.target.value },
                                        })
                                    }
                                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-govt-green"
                                >
                                    <option value="">Select Course</option>
                                    {allCourses.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.trade?.name || 'Trade'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-1">Batch Code / Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. WD-2026-A"
                                    value={batchModal.data.name}
                                    onChange={(e) =>
                                        setBatchModal({
                                            ...batchModal,
                                            data: { ...batchModal.data, name: e.target.value },
                                        })
                                    }
                                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-mono uppercase focus:ring-2 focus:ring-govt-green"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-700 font-bold mb-1">Session Year *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="2026-2027"
                                        value={batchModal.data.session_year}
                                        onChange={(e) =>
                                            setBatchModal({
                                                ...batchModal,
                                                data: { ...batchModal.data, session_year: e.target.value },
                                            })
                                        }
                                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-govt-green"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-1">Shift *</label>
                                    <select
                                        value={batchModal.data.shift}
                                        onChange={(e) =>
                                            setBatchModal({
                                                ...batchModal,
                                                data: { ...batchModal.data, shift: e.target.value },
                                            })
                                        }
                                        className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-govt-green"
                                    >
                                        <option value="morning">Morning Shift</option>
                                        <option value="evening">Evening Shift</option>
                                        <option value="afternoon">Afternoon Shift</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setBatchModal({ open: false, mode: 'create', data: null })}
                                    className="py-2 px-4 rounded-xl border border-gray-300 font-bold text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="py-2 px-5 rounded-xl bg-govt-green text-white font-bold hover:bg-govt-green-600 disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : batchModal.mode === 'create' ? 'Create Batch' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/* DELETE CONFIRMATION MODAL */}
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
                                    Delete {deleteModal.type}
                                </h3>
                                <p className="text-xs text-gray-500">Irreversible Action</p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed">
                            Are you sure you want to delete <strong className="text-gray-900">{deleteModal.name}</strong>?
                            This will safely remove the record and cascade down dependent entities.
                        </p>

                        <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setDeleteModal({ open: false, type: '', id: null, name: '', url: '' })}
                                className="py-2 px-4 rounded-xl border border-gray-300 font-bold text-xs text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteSubmit}
                                disabled={submitting}
                                className="py-2 px-5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 disabled:opacity-50"
                            >
                                {submitting ? 'Deleting...' : 'Yes, Delete Record'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/* TRAINEE ROSTER MODAL (PHASE 24) */}
            {/* ================================================================= */}
            {rosterModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="w-full max-w-5xl rounded-3xl bg-white border border-gray-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                        {/* Header */}
                        <div className="p-5 sm:p-6 bg-gradient-to-r from-govt-green via-govt-green-600 to-[#002B12] text-white flex items-start justify-between gap-4 shrink-0">
                            <div className="flex items-start space-x-3.5">
                                <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-md bg-white/20 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                                            {rosterModal.type === 'course' ? 'Course Roster' : 'Batch Cohort'}
                                        </span>
                                        {rosterModal.data?.department_name && (
                                            <span className="text-xs text-emerald-200">
                                                {rosterModal.data.department_name} • {rosterModal.data.trade_name}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                                        {rosterModal.data?.target_name || rosterModal.title}
                                    </h2>
                                    <p className="text-xs text-emerald-100/80">
                                        Active Trainees Roster & Executive Disciplinary Control
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setRosterModal({ open: false, type: '', id: null, title: '', loading: false, data: null })}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Top Controls & Metrics */}
                        {rosterModal.data && (
                            <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                                {/* Search Bar */}
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={rosterSearch}
                                        onChange={(e) => setRosterSearch(e.target.value)}
                                        placeholder="Search by name, roll number, father name, CNIC..."
                                        className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-govt-green focus:border-govt-green"
                                    />
                                </div>

                                {/* Status Filter Tabs */}
                                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                    {(() => {
                                        const students = rosterModal.data.students || [];
                                        const activeCount = students.filter(s => s.status === 'active').length;
                                        const struckCount = students.filter(s => s.status === 'struck_off').length;
                                        const terminatedCount = students.filter(s => s.status === 'terminated').length;

                                        return (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setRosterFilter('all')}
                                                    className={`px-3 py-1.5 rounded-xl font-bold transition ${
                                                        rosterFilter === 'all'
                                                            ? 'bg-gray-900 text-white shadow-xs'
                                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    All ({students.length})
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setRosterFilter('active')}
                                                    className={`px-3 py-1.5 rounded-xl font-bold transition ${
                                                        rosterFilter === 'active'
                                                            ? 'bg-emerald-600 text-white shadow-xs'
                                                            : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                                                    }`}
                                                >
                                                    Active ({activeCount})
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setRosterFilter('struck_off')}
                                                    className={`px-3 py-1.5 rounded-xl font-bold transition ${
                                                        rosterFilter === 'struck_off'
                                                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                                                            : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
                                                    }`}
                                                >
                                                    Struck Off ({struckCount})
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setRosterFilter('terminated')}
                                                    className={`px-3 py-1.5 rounded-xl font-bold transition ${
                                                        rosterFilter === 'terminated'
                                                            ? 'bg-rose-600 text-white shadow-xs'
                                                            : 'bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100'
                                                    }`}
                                                >
                                                    Expelled ({terminatedCount})
                                                </button>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* Roster Table Content */}
                        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                            {rosterModal.loading ? (
                                <div className="py-16 text-center space-y-3">
                                    <div className="h-9 w-9 border-4 border-govt-green border-t-transparent rounded-full animate-spin mx-auto" />
                                    <p className="text-xs text-gray-500 font-medium">
                                        Loading enrolled trainees from academic register...
                                    </p>
                                </div>
                            ) : rosterModal.data?.students?.length > 0 ? (
                                (() => {
                                    const filtered = rosterModal.data.students.filter(s => {
                                        // Status filter
                                        if (rosterFilter !== 'all' && s.status !== rosterFilter) return false;
                                        // Search term filter
                                        if (rosterSearch) {
                                            const q = rosterSearch.toLowerCase();
                                            const matchName = s.name?.toLowerCase().includes(q);
                                            const matchFather = s.father_name?.toLowerCase().includes(q);
                                            const matchRoll = s.roll_number?.toLowerCase().includes(q);
                                            const matchCnic = s.cnic?.toLowerCase().includes(q);
                                            return matchName || matchFather || matchRoll || matchCnic;
                                        }
                                        return true;
                                    });

                                    if (filtered.length === 0) {
                                        return (
                                            <div className="py-12 text-center space-y-2">
                                                <Users className="h-10 w-10 text-gray-300 mx-auto" />
                                                <p className="text-sm font-bold text-gray-700">No trainees matched your filter criteria</p>
                                                <p className="text-xs text-gray-400">Try clearing the search input or changing the status filter.</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-xs">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
                                                    <tr>
                                                        <th className="py-3 px-4">Trainee Identity</th>
                                                        <th className="py-3 px-4">Father Name & CNIC</th>
                                                        <th className="py-3 px-4">Batch Allocation</th>
                                                        <th className="py-3 px-4">Disciplinary Status</th>
                                                        <th className="py-3 px-4 text-right">Disciplinary Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                                    {filtered.map((student) => {
                                                        const isStruck = student.status === 'struck_off';
                                                        const isTerm = student.status === 'terminated';
                                                        const isActive = student.status === 'active';

                                                        return (
                                                            <tr key={student.id} className="hover:bg-gray-50/80 transition">
                                                                <td className="py-3.5 px-4">
                                                                    <div className="flex items-center space-x-3">
                                                                        <div className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-700 font-mono text-xs shrink-0">
                                                                            {student.name.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-bold text-gray-900">{student.name}</p>
                                                                            <p className="font-mono text-[11px] text-govt-green font-semibold">
                                                                                {student.roll_number}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="py-3.5 px-4 space-y-0.5">
                                                                    <p className="font-medium text-gray-800">{student.father_name}</p>
                                                                    <p className="text-[11px] text-gray-500 font-mono">CNIC: {student.cnic}</p>
                                                                </td>

                                                                <td className="py-3.5 px-4">
                                                                    <span className="inline-block px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 font-mono text-[11px] font-semibold border border-gray-200">
                                                                        {student.batch_name}
                                                                    </span>
                                                                </td>

                                                                <td className="py-3.5 px-4">
                                                                    {isActive && (
                                                                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                            <span>Active Trainee</span>
                                                                        </span>
                                                                    )}

                                                                    {isStruck && (
                                                                        <div className="space-y-1">
                                                                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                                                                <Clock className="h-3 w-3" />
                                                                                <span>Struck Off ({student.remaining_days}d left)</span>
                                                                            </span>
                                                                            {student.disciplinary_reason && (
                                                                                <p className="text-[10px] text-gray-500 max-w-xs truncate" title={student.disciplinary_reason}>
                                                                                    Grounds: {student.disciplinary_reason}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {isTerm && (
                                                                        <div className="space-y-1">
                                                                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                                                                                <ShieldAlert className="h-3 w-3" />
                                                                                <span>Permanently Expelled</span>
                                                                            </span>
                                                                            {student.disciplinary_reason && (
                                                                                <p className="text-[10px] text-rose-600 max-w-xs truncate" title={student.disciplinary_reason}>
                                                                                    {student.disciplinary_reason}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </td>

                                                                <td className="py-3.5 px-4 text-right">
                                                                    <div className="flex items-center justify-end space-x-1.5">
                                                                        {/* Active trainee actions */}
                                                                        {isActive && (
                                                                            <>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setStrikeOffModal({
                                                                                        open: true,
                                                                                        enrollment: student,
                                                                                        days: 14,
                                                                                        reason: '',
                                                                                        submitting: false,
                                                                                    })}
                                                                                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold transition"
                                                                                    title="Temporarily strike off trainee"
                                                                                >
                                                                                    <UserX className="h-3.5 w-3.5" />
                                                                                    <span>Strike Off</span>
                                                                                </button>

                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setTerminateModal({
                                                                                        open: true,
                                                                                        enrollment: student,
                                                                                        reason: '',
                                                                                        submitting: false,
                                                                                    })}
                                                                                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition"
                                                                                    title="Permanently terminate trainee"
                                                                                >
                                                                                    <ShieldAlert className="h-3.5 w-3.5" />
                                                                                    <span>Terminate</span>
                                                                                </button>
                                                                            </>
                                                                        )}

                                                                        {/* Struck-off trainee actions */}
                                                                        {isStruck && (
                                                                            <>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setReinstateModal({
                                                                                        open: true,
                                                                                        enrollment: student,
                                                                                        submitting: false,
                                                                                    })}
                                                                                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition shadow-xs"
                                                                                    title="Pardon and reinstate student"
                                                                                >
                                                                                    <RotateCcw className="h-3.5 w-3.5" />
                                                                                    <span>Reinstate</span>
                                                                                </button>

                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setTerminateModal({
                                                                                        open: true,
                                                                                        enrollment: student,
                                                                                        reason: student.disciplinary_reason || '',
                                                                                        submitting: false,
                                                                                    })}
                                                                                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition"
                                                                                    title="Escalate to permanent expulsion"
                                                                                >
                                                                                    <ShieldAlert className="h-3.5 w-3.5" />
                                                                                    <span>Expel</span>
                                                                                </button>
                                                                            </>
                                                                        )}

                                                                        {/* Terminated trainee actions */}
                                                                        {isTerm && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setReinstateModal({
                                                                                    open: true,
                                                                                    enrollment: student,
                                                                                    submitting: false,
                                                                                })}
                                                                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition shadow-xs"
                                                                                title="Pardon and restore trainee"
                                                                            >
                                                                                <RotateCcw className="h-3.5 w-3.5" />
                                                                                <span>Pardon & Restore</span>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className="py-16 text-center space-y-2">
                                    <Users className="h-10 w-10 text-gray-300 mx-auto" />
                                    <p className="text-sm font-bold text-gray-700">No trainees enrolled in this course / batch</p>
                                    <p className="text-xs text-gray-400">Enroll trainees from the Enrollments module or assign batches.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 shrink-0">
                            <span>
                                Total Enrolled: <strong className="text-gray-900">{rosterModal.data?.students?.length || 0} Trainees</strong>
                            </span>
                            <button
                                type="button"
                                onClick={() => setRosterModal({ open: false, type: '', id: null, title: '', loading: false, data: null })}
                                className="py-2 px-4 rounded-xl border border-gray-300 bg-white font-bold text-gray-700 hover:bg-gray-100"
                            >
                                Close Roster
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/* STRIKE OFF DISCIPLINARY MODAL */}
            {/* ================================================================= */}
            {strikeOffModal.open && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md rounded-3xl bg-white border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-5">
                        <div className="flex items-center space-x-3 text-amber-600">
                            <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-200">
                                <UserX className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-gray-900">
                                    Issue Struck-Off Decree
                                </h3>
                                <p className="text-xs text-gray-500">Temporary Academic Suspension</p>
                            </div>
                        </div>

                        {/* Student identity card */}
                        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-1">
                            <p className="font-bold text-gray-900">{strikeOffModal.enrollment?.name}</p>
                            <p className="text-gray-500">
                                Roll ID: <span className="font-mono text-govt-green font-bold">{strikeOffModal.enrollment?.roll_number}</span>
                                {' '}• Batch: {strikeOffModal.enrollment?.batch_name}
                            </p>
                        </div>

                        <form onSubmit={handleStrikeOffSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Suspension Duration (Days) *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="365"
                                    required
                                    value={strikeOffModal.days}
                                    onChange={(e) => setStrikeOffModal({ ...strikeOffModal, days: e.target.value })}
                                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:ring-2 focus:ring-amber-500"
                                />
                                <div className="flex items-center space-x-1.5 mt-2">
                                    {[7, 14, 30, 60].map(d => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => setStrikeOffModal({ ...strikeOffModal, days: d })}
                                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition ${
                                                parseInt(strikeOffModal.days) === d
                                                    ? 'bg-amber-500 text-slate-950 border-amber-600'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            {d} Days
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Official Disciplinary Reason / Charge *
                                </label>
                                <textarea
                                    required
                                    rows="3"
                                    value={strikeOffModal.reason}
                                    onChange={(e) => setStrikeOffModal({ ...strikeOffModal, reason: e.target.value })}
                                    placeholder="Enter precise disciplinary grounds (e.g. chronic absenteeism without leave, misconduct in workshop, failure to clear mid-term)..."
                                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start space-x-2">
                                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                <p>
                                    Student dashboard and functional modules (CBT, LMS, Gate check-in) will be locked for the designated period.
                                </p>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setStrikeOffModal({ open: false, enrollment: null, days: 14, reason: '', submitting: false })}
                                    className="py-2 px-4 rounded-xl border border-gray-300 font-bold text-xs text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={strikeOffModal.submitting}
                                    className="py-2 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition disabled:opacity-50 shadow-xs"
                                >
                                    {strikeOffModal.submitting ? 'Enforcing...' : 'Enforce Struck-Off Decree'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/* TERMINATE DISCIPLINARY MODAL */}
            {/* ================================================================= */}
            {terminateModal.open && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md rounded-3xl bg-white border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-5">
                        <div className="flex items-center space-x-3 text-rose-600">
                            <div className="h-10 w-10 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-200">
                                <ShieldAlert className="h-5 w-5 text-rose-600" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-gray-900">
                                    Permanent Expulsion Decree
                                </h3>
                                <p className="text-xs text-gray-500">Permanent Revocation of Admission</p>
                            </div>
                        </div>

                        {/* Student identity card */}
                        <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs space-y-1">
                            <p className="font-bold text-gray-900">{terminateModal.enrollment?.name}</p>
                            <p className="text-gray-500">
                                Roll ID: <span className="font-mono text-rose-700 font-bold">{terminateModal.enrollment?.roll_number}</span>
                            </p>
                        </div>

                        <form onSubmit={handleTerminateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Executive Expulsion Grounds / Findings *
                                </label>
                                <textarea
                                    required
                                    rows="3"
                                    value={terminateModal.reason}
                                    onChange={(e) => setTerminateModal({ ...terminateModal, reason: e.target.value })}
                                    placeholder="Enter complete administrative justification for permanent expulsion (e.g. violent misconduct, vandalism, forged credentials, disciplinary committee finding)..."
                                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:ring-2 focus:ring-rose-500"
                                />
                            </div>

                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-900 flex items-start space-x-2">
                                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                                <p>
                                    <strong>CRITICAL:</strong> Trainee credentials will be revoked immediately and the student dashboard will render a permanent expulsion notice.
                                </p>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setTerminateModal({ open: false, enrollment: null, reason: '', submitting: false })}
                                    className="py-2 px-4 rounded-xl border border-gray-300 font-bold text-xs text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={terminateModal.submitting}
                                    className="py-2 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition disabled:opacity-50 shadow-xs"
                                >
                                    {terminateModal.submitting ? 'Expelling...' : 'Confirm Permanent Expulsion'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/* REINSTATE DISCIPLINARY MODAL */}
            {/* ================================================================= */}
            {reinstateModal.open && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md rounded-3xl bg-white border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-5">
                        <div className="flex items-center space-x-3 text-emerald-600">
                            <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-200">
                                <RotateCcw className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-gray-900">
                                    Pardon & Reinstatement
                                </h3>
                                <p className="text-xs text-gray-500">Restore to Active College Standing</p>
                            </div>
                        </div>

                        {/* Student identity card */}
                        <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs space-y-1">
                            <p className="font-bold text-gray-900">{reinstateModal.enrollment?.name}</p>
                            <p className="text-gray-500">
                                Roll ID: <span className="font-mono text-govt-green font-bold">{reinstateModal.enrollment?.roll_number}</span>
                                {' '}• Current Status: <span className="capitalize font-bold text-gray-800">{reinstateModal.enrollment?.status?.replace('_', ' ')}</span>
                            </p>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed">
                            Are you sure you want to lift all disciplinary sanctions on this trainee?
                            This decree will restore their enrollment to <strong className="text-emerald-700">active</strong> standing and immediately re-open their Student Dashboard, CBT Exams, and LMS coursework.
                        </p>

                        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setReinstateModal({ open: false, enrollment: null, submitting: false })}
                                className="py-2 px-4 rounded-xl border border-gray-300 font-bold text-xs text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleReinstateSubmit}
                                disabled={reinstateModal.submitting}
                                className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition disabled:opacity-50 shadow-xs"
                            >
                                {reinstateModal.submitting ? 'Reinstating...' : 'Confirm Reinstatement'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Course Advertisement Flyer Lightbox Modal */}
            {activeFlyerPreview && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-all animate-in fade-in"
                    onClick={() => setActiveFlyerPreview(null)}
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
                                    <h4 className="font-black text-sm text-slate-900">{activeFlyerPreview.name}</h4>
                                    <p className="text-[11px] text-slate-500 font-medium">Official Intake Flyer & Course Advertisement</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveFlyerPreview(null)}
                                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 bg-slate-950 flex items-center justify-center overflow-auto max-h-[65vh]">
                            <img
                                src={activeFlyerPreview.advertisement_url || `/storage/${activeFlyerPreview.advertisement_image_path}`}
                                alt={activeFlyerPreview.name}
                                className="max-h-[60vh] w-auto object-contain rounded-lg shadow-lg"
                            />
                        </div>
                        <div className="p-3.5 border-t border-gray-100 bg-slate-50 flex items-center justify-between">
                            <span className="text-xs text-slate-600 font-medium">
                                Entry: {activeFlyerPreview.entry_level}
                            </span>
                            <div className="flex items-center space-x-2">
                                <a
                                    href={activeFlyerPreview.advertisement_url || `/storage/${activeFlyerPreview.advertisement_image_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1"
                                >
                                    <span>Open Full</span>
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setActiveFlyerPreview(null)}
                                    className="px-4 py-1.5 rounded-lg bg-govt-green hover:bg-emerald-700 text-white text-xs font-bold transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
