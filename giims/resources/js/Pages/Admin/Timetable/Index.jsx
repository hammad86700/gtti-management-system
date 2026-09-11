import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Clock,
    User,
    BookOpen,
    Plus,
    Calendar,
    Building2,
    Search,
    Filter,
    Edit2,
    Trash2,
    CheckCircle2,
    X,
    MapPin,
    Layers,
    Sparkles
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Index({
    timetables = [],
    departments = [],
    courses = [],
    batches = [],
    teachers = []
}) {
    const [activeTab, setActiveTab] = useState('teachers'); // 'teachers' or 'courses'
    const [selectedTeacherId, setSelectedTeacherId] = useState('all');
    const [selectedCourseId, setSelectedCourseId] = useState('all');
    const [selectedShift, setSelectedShift] = useState('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);

    const {
        data: formData,
        setData: setFormData,
        post: postSlot,
        put: putSlot,
        processing: formProcessing,
        errors: formErrors,
        reset: resetForm
    } = useForm({
        department_id: departments[0]?.id || '',
        course_id: courses[0]?.id || '',
        batch_id: batches[0]?.id || '',
        shift: 'morning',
        teacher_id: teachers[0]?.id || '',
        subject_name: '',
        day_of_week: 'Monday',
        start_time: '08:30',
        end_time: '09:30',
        room_or_lab: 'Lab 1',
    });

    const handleOpenCreate = () => {
        setEditingSlot(null);
        resetForm();
        setIsCreateModalOpen(true);
    };

    const handleOpenEdit = (slot) => {
        setEditingSlot(slot);
        setFormData({
            department_id: slot.department_id,
            course_id: slot.course_id,
            batch_id: slot.batch_id || '',
            shift: slot.shift || 'morning',
            teacher_id: slot.teacher_id,
            subject_name: slot.subject_name,
            day_of_week: slot.day_of_week,
            start_time: slot.start_time?.substring(0, 5) || '08:30',
            end_time: slot.end_time?.substring(0, 5) || '09:30',
            room_or_lab: slot.room_or_lab,
        });
        setIsCreateModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingSlot) {
            putSlot(route('admin.timetables.update', editingSlot.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    setEditingSlot(null);
                    resetForm();
                },
            });
        } else {
            postSlot(route('admin.timetables.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    resetForm();
                },
            });
        }
    };

    const handleDelete = (slot) => {
        if (confirm(`Remove timetable slot "${slot.subject_name}" on ${slot.day_of_week}?`)) {
            router.delete(route('admin.timetables.destroy', slot.id), {
                preserveScroll: true,
            });
        }
    };

    // Filter slots by view
    const filteredSlots = timetables.filter((slot) => {
        if (activeTab === 'teachers') {
            if (selectedTeacherId !== 'all' && slot.teacher_id != selectedTeacherId) return false;
        } else {
            if (selectedCourseId !== 'all' && slot.course_id != selectedCourseId) return false;
            if (selectedShift !== 'all' && slot.shift !== 'both' && slot.shift !== selectedShift) return false;
        }
        return true;
    });

    // Group by Day of Week
    const groupedByDay = DAYS.reduce((acc, day) => {
        acc[day] = filteredSlots.filter((s) => s.day_of_week === day);
        return acc;
    }, {});

    return (
        <AdminLayout>
            <Head title="College Timetable & Master Routine - Admin Command Center" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium mb-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Institutional Operations</span>
                            <span>•</span>
                            <span>Separate Faculty & Trade Class Schedules</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            College Master Timetable
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Manage the college schedule with separate views for Teacher workloads and Course/Trade lecture routines
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-2 self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Timetable Slot</span>
                    </button>
                </div>

                {/* View Switcher Tabs: Teachers vs Trades/Courses */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('teachers')}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 ${
                                    activeTab === 'teachers'
                                        ? 'bg-emerald-700 text-white shadow-sm'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                            >
                                <User className="w-4 h-4" />
                                <span>1. Teachers' Timetable (Faculty View)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('courses')}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-2 ${
                                    activeTab === 'courses'
                                        ? 'bg-emerald-700 text-white shadow-sm'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                            >
                                <BookOpen className="w-4 h-4" />
                                <span>2. Trades & Courses Timetable (Program View)</span>
                            </button>
                        </div>

                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                            Total Scheduled Slots: <strong className="text-slate-800 dark:text-slate-200">{filteredSlots.length}</strong>
                        </span>
                    </div>

                    {/* Filter Controls according to active view */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                        {activeTab === 'teachers' ? (
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-600 dark:text-slate-300">Filter by Teacher:</span>
                                <select
                                    value={selectedTeacherId}
                                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                                >
                                    <option value="all">All Faculty Instructors ({teachers.length})</option>
                                    {teachers.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} ({t.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-600 dark:text-slate-300">Trade / Course:</span>
                                    <select
                                        value={selectedCourseId}
                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                                    >
                                        <option value="all">All Courses ({courses.length})</option>
                                        {courses.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-600 dark:text-slate-300">Shift:</span>
                                    <select
                                        value={selectedShift}
                                        onChange={(e) => setSelectedShift(e.target.value)}
                                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                                    >
                                        <option value="all">All Shifts</option>
                                        <option value="morning">Morning Shift (08:00 AM - 01:30 PM)</option>
                                        <option value="evening">Evening Shift (02:00 PM - 07:00 PM)</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Day-by-Day Timetable Schedule Grid */}
                <div className="space-y-4">
                    {DAYS.map((day) => {
                        const daySlots = groupedByDay[day] || [];
                        return (
                            <div
                                key={day}
                                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs"
                            >
                                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-4 h-4 text-emerald-600" />
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                            {day}
                                        </h3>
                                        <span className="text-[11px] font-bold text-slate-400">
                                            ({daySlots.length} lecture{daySlots.length === 1 ? '' : 's'})
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4">
                                    {daySlots.length === 0 ? (
                                        <p className="text-xs text-slate-400 py-3 text-center italic">
                                            No classes scheduled for {day}.
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {daySlots.map((slot) => (
                                                <div
                                                    key={slot.id}
                                                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-emerald-500 transition group space-y-2 flex flex-col justify-between"
                                                >
                                                    <div>
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="font-mono font-black text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                                                                {slot.start_time?.substring(0, 5)} - {slot.end_time?.substring(0, 5)}
                                                            </span>

                                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                                                {slot.shift}
                                                            </span>
                                                        </div>

                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2 line-clamp-1">
                                                            {slot.subject_name}
                                                        </h4>

                                                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-1">
                                                            {slot.course?.name}
                                                        </p>

                                                        <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                                                    {slot.teacher?.name || 'Instructor'}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-1.5">
                                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                                <span>{slot.room_or_lab}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEdit(slot)}
                                                            className="p-1.5 text-slate-400 hover:text-emerald-600 transition"
                                                            title="Edit slot"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(slot)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                                                            title="Delete slot"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ========================================================================= */}
            {/* MODAL: ADD / EDIT TIMETABLE SLOT                                          */}
            {/* ========================================================================= */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-600" />
                                {editingSlot ? 'Edit Timetable Slot' : 'Add Timetable Slot'}
                            </h3>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                            {/* Department & Course */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Department <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.department_id}
                                        onChange={(e) => setFormData('department_id', e.target.value)}
                                        required
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    >
                                        {departments.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Course / Trade <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.course_id}
                                        onChange={(e) => setFormData('course_id', e.target.value)}
                                        required
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    >
                                        {courses.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Teacher & Subject */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Assigned Teacher <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.teacher_id}
                                        onChange={(e) => setFormData('teacher_id', e.target.value)}
                                        required
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    >
                                        {teachers.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Subject / Module Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.subject_name}
                                        onChange={(e) => setFormData('subject_name', e.target.value)}
                                        required
                                        placeholder="e.g. CNC Programming & Tooling Lab"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                    {formErrors.subject_name && (
                                        <p className="text-rose-500 text-[11px] mt-1">{formErrors.subject_name}</p>
                                    )}
                                </div>
                            </div>

                            {/* Day & Shift */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Day of the Week <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.day_of_week}
                                        onChange={(e) => setFormData('day_of_week', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    >
                                        {DAYS.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Shift
                                    </label>
                                    <select
                                        value={formData.shift}
                                        onChange={(e) => setFormData('shift', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    >
                                        <option value="morning">Morning Shift</option>
                                        <option value="evening">Evening Shift</option>
                                        <option value="both">Both Shifts</option>
                                    </select>
                                </div>
                            </div>

                            {/* Timings & Room */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Start Time <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData('start_time', e.target.value)}
                                        required
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        End Time <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData('end_time', e.target.value)}
                                        required
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Room / Lab <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.room_or_lab}
                                        onChange={(e) => setFormData('room_or_lab', e.target.value)}
                                        required
                                        placeholder="e.g. Workshop 2"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formProcessing}
                                    className="px-5 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow transition disabled:opacity-50"
                                >
                                    {formProcessing ? 'Saving...' : editingSlot ? 'Update Slot' : 'Create Slot'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
