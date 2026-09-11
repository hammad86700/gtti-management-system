import { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ClerkLayout from '@/Layouts/ClerkLayout';
import {
    CalendarDays,
    Plus,
    Calendar,
    AlertCircle,
    Building2,
    BookOpen,
    Trash2,
    CheckCircle2,
    X,
    User,
    Shield,
    Sparkles,
    Search
} from 'lucide-react';

export default function Index({ holidays = [], courses = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isClerkOnly = user?.roles?.some((r) => r.slug === 'clerk') && !user?.is_admin;

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data: formData,
        setData: setFormData,
        post: postHoliday,
        processing: formProcessing,
        errors: formErrors,
        reset: resetForm
    } = useForm({
        title: '',
        reason: '',
        holiday_date: new Date().toISOString().split('T')[0],
        end_date: '',
        scope: 'all',
        course_ids: [],
    });

    const handleCourseToggle = (courseId) => {
        const current = [...formData.course_ids];
        const index = current.indexOf(courseId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(courseId);
        }
        setFormData('course_ids', current);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const routeName = isClerkOnly ? 'clerk.holidays.store' : 'admin.holidays.store';
        postHoliday(route(routeName), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                resetForm();
            },
        });
    };

    const handleDelete = (holiday) => {
        if (confirm(`Remove holiday announcement "${holiday.title}" for ${holiday.holiday_date}?`)) {
            const routeName = isClerkOnly ? 'clerk.holidays.destroy' : 'admin.holidays.destroy';
            router.delete(route(routeName, holiday.id), {
                preserveScroll: true,
            });
        }
    };

    const filteredHolidays = holidays.filter((h) => {
        return (
            h.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.holiday_date?.includes(searchQuery)
        );
    });

    const LayoutComponent = isClerkOnly ? ClerkLayout : AdminLayout;

    return (
        <LayoutComponent>
            <Head title="Urgent College Off & Holiday Declarations" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium mb-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Academic Calendar & Attendance Regulation</span>
                            <span>•</span>
                            <span>Institutional Holiday Engine</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Urgent College Off & Holiday Desk
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Declare emergency holidays or unscheduled college closures for all courses or specific trades with automated attendance exemptions
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-2 self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Declare Urgent College Off / Holiday</span>
                    </button>
                </div>

                {/* Information Banner */}
                <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white p-5 rounded-2xl border border-emerald-700/60 shadow-md flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 shrink-0 text-emerald-300">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 text-xs">
                        <h3 className="text-sm font-bold text-emerald-200">
                            Automated Attendance Exemption Guarantee
                        </h3>
                        <p className="text-emerald-100/80 leading-relaxed max-w-3xl">
                            Any urgent holiday or institutional off day declared here is automatically synchronized into student classroom attendance registers, monthly registers, and faculty rosters. Trainees and instructors will be recorded as <strong>Holiday (Exempt)</strong> instead of being penalized as Absent.
                        </p>
                    </div>
                </div>

                {/* Search & Stats */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <CalendarDays className="w-4 h-4 text-emerald-600" />
                        <span>Declared Holidays: <strong className="text-emerald-700 dark:text-emerald-400">{holidays.length}</strong></span>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title, reason, or date..."
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                {/* Holiday Cards / Table */}
                <div className="space-y-3">
                    {filteredHolidays.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 border border-slate-200 dark:border-slate-700 text-center text-slate-400 text-xs shadow-xs">
                            No declared holidays or emergency closures recorded yet.
                        </div>
                    ) : (
                        filteredHolidays.map((holiday) => {
                            const isAllCourses = holiday.scope === 'all';
                            const affectedCourseNames = !isAllCourses && Array.isArray(holiday.course_ids)
                                ? courses.filter((c) => holiday.course_ids.includes(c.id) || holiday.course_ids.includes(String(c.id))).map((c) => c.name)
                                : [];

                            return (
                                <div
                                    key={holiday.id}
                                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs transition hover:border-emerald-500 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                    <div className="space-y-2 max-w-2xl">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="inline-flex items-center gap-1 text-xs font-black font-mono text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800">
                                                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>{holiday.holiday_date}</span>
                                                {holiday.end_date && <span> to {holiday.end_date}</span>}
                                            </div>

                                            {isAllCourses ? (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 uppercase tracking-wider">
                                                    Entire College (All Courses & Faculty)
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 uppercase tracking-wider">
                                                    Specific Courses ({affectedCourseNames.length})
                                                </span>
                                            )}

                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                Active & Published
                                            </span>
                                        </div>

                                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                                            {holiday.title}
                                        </h3>

                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {holiday.reason}
                                        </p>

                                        {!isAllCourses && affectedCourseNames.length > 0 && (
                                            <div className="pt-1 flex flex-wrap gap-1.5">
                                                {affectedCourseNames.map((cName, idx) => (
                                                    <span key={idx} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                                                        {cName}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                                            <User className="w-3 h-3 text-slate-400" />
                                            <span>Declared by: <strong>{holiday.creator?.name || 'Authorized Staff'}</strong> ({holiday.created_by_role || 'Management'})</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleDelete(holiday)}
                                        className="self-start md:self-center px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition flex items-center gap-1.5"
                                        title="Cancel / Delete Holiday"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Cancel Holiday</span>
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ========================================================================= */}
            {/* MODAL: DECLARE URGENT COLLEGE OFF / HOLIDAY                                */}
            {/* ========================================================================= */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="w-5 h-5 text-emerald-600" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Declare Urgent College Off / Institutional Holiday
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                            {/* Title */}
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Holiday Title / Directive <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData('title', e.target.value)}
                                    required
                                    placeholder="e.g. Urgent College Off: Heavy Monsoon Rain & Flood Alert"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                                {formErrors.title && <p className="text-rose-500 text-[11px] mt-1">{formErrors.title}</p>}
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Holiday Date <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.holiday_date}
                                        onChange={(e) => setFormData('holiday_date', e.target.value)}
                                        required
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        End Date (Optional for multi-day)
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData('end_date', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Official Reason / Notification Details <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={formData.reason}
                                    onChange={(e) => setFormData('reason', e.target.value)}
                                    required
                                    rows={3}
                                    placeholder="Explain the emergency or government order necessitating the closure..."
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                                {formErrors.reason && <p className="text-rose-500 text-[11px] mt-1">{formErrors.reason}</p>}
                            </div>

                            {/* Scope Radio Selection */}
                            <div className="space-y-2">
                                <label className="block font-bold text-slate-700 dark:text-slate-300">
                                    Target Scope <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 font-bold ${
                                        formData.scope === 'all'
                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="scope"
                                            value="all"
                                            checked={formData.scope === 'all'}
                                            onChange={() => setFormData('scope', 'all')}
                                            className="text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span>Entire College (All Courses)</span>
                                    </label>

                                    <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 font-bold ${
                                        formData.scope === 'specific_courses'
                                            ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-800 dark:text-purple-300'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="scope"
                                            value="specific_courses"
                                            checked={formData.scope === 'specific_courses'}
                                            onChange={() => setFormData('scope', 'specific_courses')}
                                            className="text-purple-600 focus:ring-purple-500"
                                        />
                                        <span>Specific Courses Only</span>
                                    </label>
                                </div>
                            </div>

                            {/* Course Checkboxes if specific_courses selected */}
                            {formData.scope === 'specific_courses' && (
                                <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto">
                                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                                        Select Courses Affected by this Closure:
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {courses.map((course) => (
                                            <label
                                                key={course.id}
                                                className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.course_ids.includes(course.id)}
                                                    onChange={() => handleCourseToggle(course.id)}
                                                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                                />
                                                <span className="truncate">{course.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                                <div>
                                    <strong>Immediate Effect:</strong> Publishing will alert affected students/faculty and mark their attendance records on this date as <strong>Holiday (Exempt)</strong> instead of <strong>Absent</strong>.
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
                                    className="px-5 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow transition disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {formProcessing ? 'Publishing...' : 'Publish Holiday Notice'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </LayoutComponent>
    );
}
