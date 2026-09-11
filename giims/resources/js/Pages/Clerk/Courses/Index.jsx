import { useState, useEffect, useRef } from 'react';
import ClerkLayout from '@/Layouts/ClerkLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    BookOpen,
    Plus,
    Edit2,
    Trash2,
    CheckCircle2,
    Layers,
    Clock,
    Users,
    AlertCircle,
    Building2,
    Globe,
    FileText,
    Calendar,
    Sparkles,
    Upload,
    Image as ImageIcon,
    Eye,
    X,
    Download,
    ExternalLink
} from 'lucide-react';
import Badge from '@/Components/UI/Badge';

export default function Index({ courses = [], trades = [], categories = [] }) {
    const [createModal, setCreateModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [createAdPreview, setCreateAdPreview] = useState(null);
    const [editAdPreview, setEditAdPreview] = useState(null);
    const [viewingAdCourse, setViewingAdCourse] = useState(null);
    const tableContainerRef = useRef(null);

    // Reset table horizontal scroll on load or after course update
    useEffect(() => {
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollLeft = 0;
        }
    }, [courses]);

    // Form for creating course
    const createForm = useForm({
        trade_id: trades[0]?.id || '',
        name: '',
        category: 'Information Technology',
        duration_type: 'months',
        duration_value: 6,
        total_academic_days: 60,
        overview_description: '',
        entry_level: 'Matric (Science/Arts)',
        admission_type: 'merit_based',
        requires_entrance_test: true,
        intake_capacity: 50,
        classes_start_date: '',
        matric_weightage: 50,
        test_weightage: 40,
        interview_weightage: 10,
        interview_max_marks: 10,
        interview_venue: 'Lab 3 / Interview Room',
        is_published: true,
        is_active: true,
        offered_shifts: 'Both',
        syllabus_document: null,
        advertisement_image: null,
    });

    // Form for editing course
    const editForm = useForm({
        _method: 'patch',
        trade_id: '',
        name: '',
        category: '',
        duration_type: 'months',
        duration_value: 6,
        total_academic_days: 60,
        overview_description: '',
        entry_level: '',
        admission_type: 'merit_based',
        requires_entrance_test: true,
        intake_capacity: 50,
        classes_start_date: '',
        matric_weightage: 50,
        test_weightage: 40,
        interview_weightage: 10,
        interview_max_marks: 10,
        interview_venue: 'Lab 3 / Interview Room',
        is_published: true,
        is_active: true,
        offered_shifts: 'Both',
        syllabus_document: null,
        advertisement_image: null,
        remove_advertisement: false,
    });

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('clerk.courses.store'), {
            forceFormData: true,
            onSuccess: () => {
                setCreateModal(false);
                setCreateAdPreview(null);
                createForm.reset();
            },
        });
    };

    const handleOpenEdit = (course) => {
        setEditingCourse(course);
        setEditAdPreview(course.advertisement_image_path ? `/storage/${course.advertisement_image_path}` : null);
        const isFcfs = course.admission_type === 'first_come_first_served' || course.requires_entrance_test === false || course.requires_entrance_test === 0;
        const requiresEntrance = !isFcfs && Boolean(course.requires_entrance_test);

        editForm.setData({
            _method: 'patch',
            trade_id: course.trade_id,
            name: course.name,
            category: course.category || 'General Vocational',
            duration_type: course.duration_type || 'months',
            duration_value: course.duration_value ?? 6,
            total_academic_days: course.total_academic_days ?? 60,
            overview_description: course.overview_description || '',
            entry_level: course.entry_level || '',
            admission_type: isFcfs ? 'first_come_first_served' : 'merit_based',
            requires_entrance_test: requiresEntrance,
            intake_capacity: course.intake_capacity ?? 50,
            classes_start_date: course.classes_start_date ? course.classes_start_date.split('T')[0] : '',
            matric_weightage: course.matric_weightage ?? 50,
            test_weightage: course.test_weightage ?? 40,
            interview_weightage: course.interview_weightage ?? 10,
            interview_max_marks: course.interview_max_marks ?? 10,
            interview_venue: course.interview_venue || 'Lab 3 / Interview Room',
            is_published: Boolean(course.is_published ?? true),
            is_active: Boolean(course.is_active ?? true),
            offered_shifts: course.offered_shifts || 'Both',
            syllabus_document: null,
            advertisement_image: null,
            remove_advertisement: false,
        });
        setEditModal(true);
    };

    const handleUpdate = (e, shouldPublish = null) => {
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }
        if (!editingCourse) return;

        // In Inertia React useForm, transform does NOT return the form object; it is void.
        editForm.transform((data) => ({
            ...data,
            _method: 'patch',
            is_published: shouldPublish !== null ? shouldPublish : Boolean(data.is_published),
            requires_entrance_test: data.admission_type === 'first_come_first_served' ? false : Boolean(data.requires_entrance_test),
        }));

        editForm.post(route('clerk.courses.update', editingCourse.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setEditModal(false);
                setEditingCourse(null);
                setEditAdPreview(null);
            },
        });
    };

    const handleDelete = (course) => {
        if (!confirm(`Are you sure you want to archive course '${course.name}'?`)) return;
        router.delete(route('clerk.courses.destroy', course.id));
    };

    const defaultCategories = [
        'Information Technology',
        'Mechanical & Manufacturing',
        'Electrical & Electronics',
        'Civil & Construction',
        'Vocational Short Course',
        'Hospitality & Culinary',
    ];

    const allCategories = Array.from(new Set([...defaultCategories, ...categories]));

    return (
        <ClerkLayout
            header={
                <div className="flex items-center space-x-2 text-xs font-medium">
                    <span className="font-bold text-[#C1902F]">Clerk Desk</span>
                    <span>/</span>
                    <span className="text-white font-semibold">Courses & Trades Catalog</span>
                </div>
            }
        >
            <Head title="Course Catalog & Lifecycle - Admission Clerk Desk" />

            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header Action Bar */}
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <BookOpen className="h-5 w-5 text-amber-400" />
                            <h1 className="text-xl font-black text-white">Course Lifecycle & Intake Catalog</h1>
                        </div>
                        <p className="text-xs text-slate-400">
                            Configure flexible course durations (3-Month, 6-Month, 1-Year), dynamic categories, public site publishing, and master syllabus blueprints.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setCreateModal(true)}
                        className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-[#C1902F] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add New Course</span>
                    </button>
                </div>

                {/* Courses Grid Table */}
                <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
                    <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-white">Active Vocational Curricula ({courses.length})</h2>
                        <span className="text-xs text-slate-500 font-mono">Institutional Roster</span>
                    </div>

                    <div ref={tableContainerRef} className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                                <tr>
                                    <th className="py-3.5 pl-6 pr-3">Course & Details</th>
                                    <th className="py-3.5 px-3 whitespace-nowrap">Duration & Schedule</th>
                                    <th className="py-3.5 px-3 whitespace-nowrap">Track & Quota</th>
                                    <th className="py-3.5 px-2 text-center whitespace-nowrap">Applicants</th>
                                    <th className="py-3.5 px-2 text-center whitespace-nowrap">Status</th>
                                    <th className="py-3.5 pr-6 pl-2 text-right whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-slate-300">
                                {courses.map((course) => (
                                    <tr key={course.id} className="hover:bg-slate-800/50 transition">
                                        {/* Course & Details */}
                                        <td className="py-3.5 pl-6 pr-3">
                                            <div className="flex items-center space-x-3.5">
                                                {/* Course Advertisement Flyer Thumbnail */}
                                                {(course.advertisement_url || course.advertisement_image_path) ? (
                                                    <div
                                                        onClick={() => setViewingAdCourse(course)}
                                                        className="relative w-11 h-11 rounded-xl overflow-hidden border border-emerald-700/60 bg-slate-950 shadow-sm shrink-0 cursor-pointer group/thumb hover:ring-2 hover:ring-emerald-400 transition"
                                                        title="Click to view full course advertisement flyer"
                                                    >
                                                        <img
                                                            src={course.advertisement_url || `/storage/${course.advertisement_image_path}`}
                                                            alt={course.name}
                                                            className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-200"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Eye className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => handleOpenEdit(course)}
                                                        className="w-11 h-11 rounded-xl border border-slate-800 bg-slate-950/70 flex items-center justify-center text-slate-500 hover:text-amber-400 hover:border-amber-500/40 transition shrink-0 cursor-pointer group/noad"
                                                        title="No advertisement uploaded - Click to upload"
                                                    >
                                                        <ImageIcon className="w-4 h-4 text-slate-600 group-hover/noad:text-amber-400 transition" />
                                                    </div>
                                                )}

                                                <div className="min-w-0">
                                                    <div className="font-bold text-white text-sm leading-snug truncate">
                                                        {course.name}
                                                    </div>

                                                    {/* Trade & Department context */}
                                                    <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                                                        {course.trade?.name || 'General Vocational'}
                                                        {course.trade?.program?.department?.name && ` • ${course.trade.program.department.name}`}
                                                    </div>

                                                    {/* Shift & Category Badges */}
                                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                                                            {course.category || 'Vocational'}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                            course.offered_shifts === 'Morning'
                                                                ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                                                                : course.offered_shifts === 'Evening'
                                                                    ? 'bg-purple-950/60 text-purple-300 border border-purple-800'
                                                                    : 'bg-blue-950/60 text-blue-300 border border-blue-800'
                                                        }`}>
                                                            {course.offered_shifts === 'Morning' ? '🌅 Morning' : course.offered_shifts === 'Evening' ? '🌙 Evening' : '🌅 Morning & 🌙 Evening'}
                                                        </span>
                                                        {course.syllabus_document_path && (
                                                            <span className="text-[10px] text-amber-400 flex items-center space-x-0.5">
                                                                <FileText className="h-3 w-3" />
                                                                <span>Syllabus</span>
                                                            </span>
                                                        )}
                                                        {(course.advertisement_url || course.advertisement_image_path) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setViewingAdCourse(course)}
                                                                className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-bold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full cursor-pointer transition hover:bg-emerald-900/60"
                                                                title="Click to view course advertisement flyer"
                                                            >
                                                                <ImageIcon className="h-3 w-3" />
                                                                <span>Flyer</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Duration & Schedule */}
                                        <td className="py-3.5 px-3 whitespace-nowrap">
                                            <div className="flex flex-col gap-1 w-fit">
                                                <span className="inline-flex items-center space-x-1 font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-xl text-[11px]">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>{course.formatted_duration || `${course.duration_value || 6} Months`}</span>
                                                </span>
                                                <div className="text-[10px] text-slate-400 font-mono">
                                                    {course.total_academic_days || 60} Days • Starts: <span className="text-amber-300/90 font-semibold">{course.classes_start_date ? new Date(course.classes_start_date).toLocaleDateString('en-GB') : 'TBD'}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Track & Quota */}
                                        <td className="py-3.5 px-3 whitespace-nowrap">
                                            <div className="flex flex-col gap-1 w-fit">
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                    course.requires_entrance_test
                                                        ? 'bg-amber-900/60 text-amber-300 border border-amber-700'
                                                        : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                                                }`}>
                                                    {course.requires_entrance_test ? 'Track A: Test' : 'Track B: Direct'}
                                                </span>
                                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                                                    course.is_admission_full
                                                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                                                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                                                }`}>
                                                    {course.is_admission_full ? '🚨 Quota Full' : `${course.current_intake_count ?? 0} / ${course.intake_capacity ?? 50} Seats`}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Applicants */}
                                        <td className="py-3.5 px-2 text-center whitespace-nowrap">
                                            <span className="font-mono font-black text-white text-sm block">
                                                {course.total_applicants ?? 0}
                                            </span>
                                            <div className="text-[10px] text-slate-400 font-mono">
                                                {course.verified_applicants ?? 0} verified
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="py-3.5 px-2 text-center whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => router.post(route('clerk.courses.toggle-publish', course.id), {}, { preserveScroll: true })}
                                                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition cursor-pointer border shadow-xs ${
                                                    course.is_published
                                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                                                        : 'bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20'
                                                }`}
                                                title={course.is_published ? "Click to set to Draft (hide from website)" : "Click to Publish live on website catalog"}
                                            >
                                                <Globe className={`h-3 w-3 ${course.is_published ? 'text-emerald-400' : 'text-amber-400'}`} />
                                                <span>{course.is_published ? 'Live' : 'Draft'}</span>
                                            </button>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3.5 pr-6 pl-2 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end space-x-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEdit(course)}
                                                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition border border-slate-700/60"
                                                    title="Edit Course Parameters"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(course)}
                                                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-rose-400 transition border border-slate-700/60 hover:border-rose-800/60"
                                                    title="Archive Course"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Course Modal */}
            {createModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-5 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div>
                                <h3 className="text-lg font-black text-white">Add New Vocational Course</h3>
                                <p className="text-xs text-slate-400">Define curriculum, flexible duration, and category</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCreateModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4 text-xs">
                            {Object.keys(createForm.errors).length > 0 && (
                                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/60 text-rose-300 text-xs space-y-1">
                                    <div className="font-bold flex items-center space-x-1.5">
                                        <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                                        <span>Please fix the following validation errors:</span>
                                    </div>
                                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-200">
                                        {Object.entries(createForm.errors).map(([key, msg]) => (
                                            <li key={key}>{msg}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-300 mb-1">Parent Trade *</label>
                                    <select
                                        value={createForm.data.trade_id}
                                        onChange={(e) => createForm.setData('trade_id', e.target.value)}
                                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs"
                                        required
                                    >
                                        {trades.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name} ({t.program?.name})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-300 mb-1">Category / Discipline *</label>
                                    <input
                                        type="text"
                                        list="category-suggestions"
                                        required
                                        placeholder="e.g. Information Technology"
                                        value={createForm.data.category}
                                        onChange={(e) => createForm.setData('category', e.target.value)}
                                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                                    />
                                    <datalist id="category-suggestions">
                                        {allCategories.map((cat, i) => (
                                            <option key={i} value={cat} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-300 mb-1">Course Title *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Advanced Python & Artificial Intelligence"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                                />
                            </div>

                            {/* Flexible Duration Configuration */}
                            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                                <span className="font-bold text-amber-400 block uppercase tracking-wider text-[10px]">
                                    Flexible Course Duration & Roadmap Parameters
                                </span>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1">Duration Unit</label>
                                        <select
                                            value={createForm.data.duration_type}
                                            onChange={(e) => createForm.setData('duration_type', e.target.value)}
                                            className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                                        >
                                            <option value="months">Months</option>
                                            <option value="weeks">Weeks</option>
                                            <option value="days">Days</option>
                                            <option value="hours">Hours</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1">Duration Value</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={createForm.data.duration_value}
                                            onChange={(e) => createForm.setData('duration_value', e.target.value)}
                                            className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1">Total Academic Days</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="500"
                                            value={createForm.data.total_academic_days}
                                            onChange={(e) => createForm.setData('total_academic_days', e.target.value)}
                                            className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-300 mb-1">Course Overview / Description</label>
                                <textarea
                                    rows="3"
                                    placeholder="Summarize course aims, learning outcomes, and technical skills taught..."
                                    value={createForm.data.overview_description}
                                    onChange={(e) => createForm.setData('overview_description', e.target.value)}
                                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                                />
                            </div>

                            {/* Admission Track & Quota Capacity */}
                            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                                <span className="font-bold text-amber-400 block uppercase tracking-wider text-[10px]">
                                    Admission Track & Seat Quota Parameters
                                </span>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div 
                                        onClick={() => {
                                            createForm.setData((prev) => ({
                                                ...prev,
                                                requires_entrance_test: true,
                                                admission_type: 'merit_based',
                                            }));
                                        }}
                                        className={`p-3 rounded-xl border cursor-pointer transition ${
                                            createForm.data.requires_entrance_test
                                                ? 'bg-amber-950/40 border-amber-500 text-amber-200 ring-1 ring-amber-500'
                                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="font-bold text-xs flex items-center justify-between">
                                            <span>🎓 Track A: Entrance Test</span>
                                            {createForm.data.requires_entrance_test && <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded">ACTIVE</span>}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            Candidates must take institutional entrance exam. PBTE Admit Slips and Merit List required before fee payment.
                                        </p>
                                    </div>

                                    <div 
                                        onClick={() => {
                                            createForm.setData((prev) => ({
                                                ...prev,
                                                requires_entrance_test: false,
                                                admission_type: 'first_come_first_served',
                                            }));
                                        }}
                                        className={`p-3 rounded-xl border cursor-pointer transition ${
                                            !createForm.data.requires_entrance_test
                                                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500'
                                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="font-bold text-xs flex items-center justify-between">
                                            <span>⚡ Track B: Direct FCFS</span>
                                            {!createForm.data.requires_entrance_test && <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded">ACTIVE</span>}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            No entrance test. Instant fee challan generated upon submission. Strict First-Come-First-Served basis.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <label className="block font-bold text-slate-300 mb-1">Intake Seat Quota *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="500"
                                            required
                                            placeholder="e.g. 50"
                                            value={createForm.data.intake_capacity}
                                            onChange={(e) => createForm.setData('intake_capacity', e.target.value)}
                                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                                        />
                                        <span className="text-[10px] text-slate-500 mt-0.5 block">Admissions auto-close when quota is full.</span>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-300 mb-1">Official Classes Commencement Date</label>
                                        <input
                                            type="date"
                                            value={createForm.data.classes_start_date}
                                            onChange={(e) => createForm.setData('classes_start_date', e.target.value)}
                                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                                        />
                                        <span className="text-[10px] text-slate-500 mt-0.5 block">Notified to admitted students upon verification.</span>
                                    </div>
                                </div>

                                {/* Offered Batch Shifts in Create */}
                                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                                    <label className="block font-bold text-slate-200 text-xs flex items-center space-x-1.5">
                                        <Clock className="h-4 w-4 text-amber-400" />
                                        <span>Offered Batch Shift(s) *</span>
                                    </label>
                                    <select
                                        value={createForm.data.offered_shifts}
                                        onChange={(e) => createForm.setData('offered_shifts', e.target.value)}
                                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs"
                                    >
                                        <option value="Both">🌅 Morning & 🌙 Evening (Both Shifts Available)</option>
                                        <option value="Morning">🌅 Morning Shift Only (08:00 AM – 01:30 PM)</option>
                                        <option value="Evening">🌙 Evening Shift Only (02:00 PM – 07:00 PM)</option>
                                    </select>
                                    <p className="text-[11px] text-slate-400">
                                        Determines which shifts candidates can choose on the application portal. The system automatically provisions active batches for chosen shifts.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-300 mb-1">Entry Eligibility *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Matric (Science / Arts)"
                                        value={createForm.data.entry_level}
                                        onChange={(e) => createForm.setData('entry_level', e.target.value)}
                                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-300 mb-1">Admission Mode & Entrance Test *</label>
                                    <select
                                        value={createForm.data.admission_type}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === 'first_come_first_served') {
                                                createForm.setData((prev) => ({
                                                    ...prev,
                                                    admission_type: 'first_come_first_served',
                                                    requires_entrance_test: false,
                                                }));
                                            } else {
                                                createForm.setData((prev) => ({
                                                    ...prev,
                                                    admission_type: 'merit_based',
                                                    requires_entrance_test: true,
                                                }));
                                            }
                                        }}
                                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs"
                                    >
                                        <option value="merit_based">Track A: Merit-Based (Entrance Test Required)</option>
                                        <option value="first_come_first_served">Track B: Direct FCFS (NO Entrance Test Required)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Master Syllabus Upload */}
                            <div>
                                <label className="block font-bold text-slate-300 mb-1">Master Syllabus Document (PDF / DOC)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => createForm.setData('syllabus_document', e.target.files[0])}
                                    className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700"
                                />
                            </div>

                            {/* Course Advertisement / Promo Flyer Upload */}
                            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="block font-bold text-slate-200 text-xs flex items-center space-x-1.5">
                                        <ImageIcon className="h-4 w-4 text-amber-400" />
                                        <span>Course Advertisement Flyer / Poster (Optional)</span>
                                    </label>
                                    <span className="text-[10px] text-slate-400">JPG, PNG, WebP (Max 5MB)</span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Upload an official promotional flyer, intake banner, or admission poster. It will be showcased prominently on the course catalog and public homepage.
                                </p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            createForm.setData('advertisement_image', file);
                                            setCreateAdPreview(URL.createObjectURL(file));
                                        } else {
                                            createForm.setData('advertisement_image', null);
                                            setCreateAdPreview(null);
                                        }
                                    }}
                                    className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer"
                                />
                                {createAdPreview && (
                                    <div className="relative mt-2 p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
                                        <img
                                            src={createAdPreview}
                                            alt="Ad Preview"
                                            className="h-20 w-32 object-cover rounded-lg border border-slate-700"
                                        />
                                        <div className="flex-1">
                                            <span className="text-xs font-bold text-white block">Ad Flyer Selected</span>
                                            <span className="text-[10px] text-emerald-400 font-mono">Ready to upload on save</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                createForm.setData('advertisement_image', null);
                                                setCreateAdPreview(null);
                                            }}
                                            className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Live Public Sync Toggle */}
                            <div className="flex items-center space-x-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="create_is_published"
                                    checked={createForm.data.is_published}
                                    onChange={(e) => createForm.setData('is_published', e.target.checked)}
                                    className="h-4 w-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500"
                                />
                                <label htmlFor="create_is_published" className="font-bold text-slate-300">
                                    Publish instantly to live public website catalog
                                </label>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setCreateModal(false)}
                                    className="py-2.5 px-4 rounded-xl border border-slate-700 text-slate-400 font-bold hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="py-2.5 px-6 rounded-xl bg-[#C1902F] hover:bg-amber-400 text-slate-950 font-black transition disabled:opacity-50"
                                >
                                    {createForm.processing ? 'Saving...' : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Course Modal */}
            {editModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-5 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div>
                                <h3 className="text-lg font-black text-white">Edit Course Lifecycle</h3>
                                <p className="text-xs text-slate-400">Update curriculum parameters and catalog settings</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditModal(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
                            {Object.keys(editForm.errors).length > 0 && (
                                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/60 text-rose-300 text-xs space-y-1">
                                    <div className="font-bold flex items-center space-x-1.5">
                                        <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                                        <span>Please fix the following validation errors:</span>
                                    </div>
                                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-200">
                                        {Object.entries(editForm.errors).map(([key, msg]) => (
                                            <li key={key}>{msg}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-300 mb-1">Parent Trade *</label>
                                    <select
                                        value={editForm.data.trade_id}
                                        onChange={(e) => editForm.setData('trade_id', e.target.value)}
                                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs"
                                        required
                                    >
                                        {trades.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name} ({t.program?.name})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-300 mb-1">Category / Discipline *</label>
                                    <input
                                        type="text"
                                        list="edit-category-suggestions"
                                        required
                                        value={editForm.data.category}
                                        onChange={(e) => editForm.setData('category', e.target.value)}
                                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                                    />
                                    <datalist id="edit-category-suggestions">
                                        {allCategories.map((cat, i) => (
                                            <option key={i} value={cat} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-300 mb-1">Course Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                                />
                            </div>

                            {/* Flexible Duration Configuration */}
                            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                                <span className="font-bold text-amber-400 block uppercase tracking-wider text-[10px]">
                                    Flexible Course Duration & Roadmap Parameters
                                </span>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1">Duration Unit</label>
                                        <select
                                            value={editForm.data.duration_type}
                                            onChange={(e) => editForm.setData('duration_type', e.target.value)}
                                            className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                                        >
                                            <option value="months">Months</option>
                                            <option value="weeks">Weeks</option>
                                            <option value="days">Days</option>
                                            <option value="hours">Hours</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1">Duration Value</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={editForm.data.duration_value}
                                            onChange={(e) => editForm.setData('duration_value', e.target.value)}
                                            className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1">Total Academic Days</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="500"
                                            value={editForm.data.total_academic_days}
                                            onChange={(e) => editForm.setData('total_academic_days', e.target.value)}
                                            className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-300 mb-1">Course Overview / Description</label>
                                <textarea
                                    rows="3"
                                    value={editForm.data.overview_description}
                                    onChange={(e) => editForm.setData('overview_description', e.target.value)}
                                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                                />
                            </div>

                            {/* Admission Track & Quota Capacity in Edit */}
                            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                                <span className="font-bold text-amber-400 block uppercase tracking-wider text-[10px]">
                                    Admission Track & Seat Quota Parameters
                                </span>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div 
                                        onClick={() => {
                                            editForm.setData((prev) => ({
                                                ...prev,
                                                requires_entrance_test: true,
                                                admission_type: 'merit_based',
                                            }));
                                        }}
                                        className={`p-3 rounded-xl border cursor-pointer transition ${
                                            editForm.data.requires_entrance_test
                                                ? 'bg-amber-950/40 border-amber-500 text-amber-200 ring-1 ring-amber-500'
                                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="font-bold text-xs flex items-center justify-between">
                                            <span>🎓 Track A: Entrance Test</span>
                                            {editForm.data.requires_entrance_test && <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded">ACTIVE</span>}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            Candidates must take institutional entrance exam. PBTE Admit Slips and Merit List required before fee payment.
                                        </p>
                                    </div>

                                    <div 
                                        onClick={() => {
                                            editForm.setData((prev) => ({
                                                ...prev,
                                                requires_entrance_test: false,
                                                admission_type: 'first_come_first_served',
                                            }));
                                        }}
                                        className={`p-3 rounded-xl border cursor-pointer transition ${
                                            !editForm.data.requires_entrance_test
                                                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500'
                                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="font-bold text-xs flex items-center justify-between">
                                            <span>⚡ Track B: Direct FCFS</span>
                                            {!editForm.data.requires_entrance_test && <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded">ACTIVE</span>}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            No entrance test. Instant fee challan generated upon submission. Strict First-Come-First-Served basis.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <label className="block font-bold text-slate-300 mb-1">Intake Seat Quota *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="500"
                                            required
                                            value={editForm.data.intake_capacity}
                                            onChange={(e) => editForm.setData('intake_capacity', e.target.value)}
                                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-300 mb-1">Official Classes Commencement Date</label>
                                        <input
                                            type="date"
                                            value={editForm.data.classes_start_date}
                                            onChange={(e) => editForm.setData('classes_start_date', e.target.value)}
                                            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                                        />
                                    </div>
                                </div>

                                {/* Offered Batch Shifts in Edit */}
                                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                                    <label className="block font-bold text-slate-200 text-xs flex items-center space-x-1.5">
                                        <Clock className="h-4 w-4 text-amber-400" />
                                        <span>Offered Batch Shift(s) *</span>
                                    </label>
                                    <select
                                        value={editForm.data.offered_shifts}
                                        onChange={(e) => editForm.setData('offered_shifts', e.target.value)}
                                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs"
                                    >
                                        <option value="Both">🌅 Morning & 🌙 Evening (Both Shifts Available)</option>
                                        <option value="Morning">🌅 Morning Shift Only (08:00 AM – 01:30 PM)</option>
                                        <option value="Evening">🌙 Evening Shift Only (02:00 PM – 07:00 PM)</option>
                                    </select>
                                    <p className="text-[11px] text-slate-400">
                                        Determines which shifts candidates can choose on the application portal. The system automatically provisions active batches for chosen shifts.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-300 mb-1">Entry Requirement / Eligibility *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.data.entry_level}
                                        onChange={(e) => editForm.setData('entry_level', e.target.value)}
                                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-300 mb-1">Admission Mode & Entrance Test *</label>
                                    <select
                                        value={editForm.data.admission_type}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === 'first_come_first_served') {
                                                editForm.setData((prev) => ({
                                                    ...prev,
                                                    admission_type: 'first_come_first_served',
                                                    requires_entrance_test: false,
                                                }));
                                            } else {
                                                editForm.setData((prev) => ({
                                                    ...prev,
                                                    admission_type: 'merit_based',
                                                    requires_entrance_test: true,
                                                }));
                                            }
                                        }}
                                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs"
                                    >
                                        <option value="merit_based">Track A: Merit-Based (Entrance Test Required)</option>
                                        <option value="first_come_first_served">Track B: Direct FCFS (NO Entrance Test Required)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Master Syllabus Upload */}
                            <div>
                                <label className="block font-bold text-slate-300 mb-1">Update Syllabus Document (Optional)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => editForm.setData('syllabus_document', e.target.files[0])}
                                    className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700"
                                />
                            </div>

                            {/* Course Advertisement / Promo Flyer Upload */}
                            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="block font-bold text-slate-200 text-xs flex items-center space-x-1.5">
                                        <ImageIcon className="h-4 w-4 text-amber-400" />
                                        <span>Course Advertisement Flyer / Poster (Optional)</span>
                                    </label>
                                    <span className="text-[10px] text-slate-400">JPG, PNG, WebP (Max 5MB)</span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Upload or replace the official course flyer/banner displayed to applicants on the live website.
                                </p>

                                {editAdPreview && !editForm.data.remove_advertisement ? (
                                    <div className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
                                        <img
                                            src={editAdPreview}
                                            alt="Current Ad Flyer"
                                            className="h-20 w-32 object-cover rounded-lg border border-slate-700 cursor-pointer hover:opacity-90"
                                            onClick={() => setViewingAdCourse({ name: editForm.data.name, advertisement_image_path: editAdPreview.replace('/storage/', '') })}
                                        />
                                        <div className="flex-1 space-y-1">
                                            <span className="text-xs font-bold text-white block">Active Advertisement Poster</span>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setViewingAdCourse({ name: editForm.data.name, advertisement_image_path: editAdPreview.replace('/storage/', '') })}
                                                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1 cursor-pointer"
                                                >
                                                    <Eye className="h-3 w-3" />
                                                    <span>View Full Size</span>
                                                </button>
                                                <span className="text-slate-600">•</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        editForm.setData('advertisement_image', null);
                                                        editForm.setData('remove_advertisement', true);
                                                        setEditAdPreview(null);
                                                    }}
                                                    className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center space-x-1 cursor-pointer"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    <span>Remove Ad Flyer</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    editForm.setData('advertisement_image', file);
                                                    editForm.setData('remove_advertisement', false);
                                                    setEditAdPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                            className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer"
                                        />
                                        {editForm.data.remove_advertisement && (
                                            <span className="text-[10px] text-amber-400 block mt-1 font-mono">
                                                * Existing ad will be removed on save. Select a file above if you want to replace it.
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Live Public Sync Toggle */}
                            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                                <div>
                                    <label htmlFor="edit_is_published" className="font-bold text-white block text-xs cursor-pointer">
                                        Published on live public website catalog
                                    </label>
                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                        When enabled, this course appears immediately on the live institutional homepage directory for student online registration.
                                    </span>
                                </div>
                                <input
                                    type="checkbox"
                                    id="edit_is_published"
                                    checked={Boolean(editForm.data.is_published)}
                                    onChange={(e) => editForm.setData('is_published', e.target.checked)}
                                    className="h-5 w-5 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer shrink-0"
                                />
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setEditModal(false)}
                                    className="py-2.5 px-4 rounded-xl border border-slate-700 text-slate-400 font-bold hover:text-white hover:bg-slate-800 transition"
                                >
                                    Cancel
                                </button>
                                
                                <div className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        disabled={editForm.processing}
                                        onClick={(e) => handleUpdate(e, false)}
                                        className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition disabled:opacity-50 text-xs border border-slate-700 cursor-pointer"
                                        title="Save changes and keep course in draft (unpublish from website)"
                                    >
                                        Save as Draft
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editForm.processing}
                                        className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition disabled:opacity-50 text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                                    >
                                        {editForm.processing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={editForm.processing}
                                        onClick={(e) => handleUpdate(e, true)}
                                        className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black transition disabled:opacity-50 text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer"
                                        title="Save changes and immediately publish live to public website"
                                    >
                                        <Globe className="h-4 w-4" />
                                        <span>{editForm.processing ? 'Publishing...' : 'Save & Publish Live'}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Course Advertisement Poster Lightbox Modal */}
            {viewingAdCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="relative max-w-4xl w-full bg-slate-950 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-800/60">
                                    <ImageIcon className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-base text-white">{viewingAdCourse.name}</h3>
                                    <p className="text-xs text-slate-400">Official Course Advertisement & Intake Flyer</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <a
                                    href={viewingAdCourse.advertisement_url || `/storage/${viewingAdCourse.advertisement_image_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    download
                                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center space-x-1.5 border border-slate-700"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Download</span>
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setViewingAdCourse(null)}
                                    className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/95">
                            <img
                                src={viewingAdCourse.advertisement_url || `/storage/${viewingAdCourse.advertisement_image_path}`}
                                alt={`${viewingAdCourse.name} Flyer`}
                                className="max-h-[72vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
                            />
                        </div>

                        <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400 shrink-0">
                            <span className="text-[11px] text-slate-300">
                                Displayed publicly on candidate admissions portal & homepage
                            </span>
                            <button
                                type="button"
                                onClick={() => setViewingAdCourse(null)}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ClerkLayout>
    );
}
