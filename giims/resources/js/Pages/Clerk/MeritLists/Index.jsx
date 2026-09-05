import { useState } from 'react';
import ClerkLayout from '@/Layouts/ClerkLayout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Award,
    Upload,
    FileText,
    Calendar,
    CheckCircle2,
    Eye,
    Trash2,
    Download,
    Plus,
    X,
    Filter,
    Clock,
    BookOpen,
    AlertCircle,
    Check,
    Send
} from 'lucide-react';

export default function Index({ meritLists = {}, courses = [], filters = {} }) {
    const lists = meritLists.data || [];
    const [selectedCourse, setSelectedCourse] = useState(filters.course_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    // Form for uploading new merit list
    const uploadForm = useForm({
        course_id: '',
        title: '',
        merit_document: null,
        classes_start_date: '',
        remarks: '',
        status: 'published',
    });

    const handleFilter = (courseId, status) => {
        router.get(route('clerk.merit-lists.index'), {
            course_id: courseId || undefined,
            status: status !== 'all' ? status : undefined,
        }, { preserveState: true });
    };

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        uploadForm.post(route('clerk.merit-lists.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                uploadForm.reset();
                setUploadModalOpen(false);
            },
        });
    };

    const handleTogglePublish = (id) => {
        router.post(route('clerk.merit-lists.toggle-publish', id), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (id, title) => {
        if (confirm(`Are you sure you want to delete '${title}'? This will remove it from all student portals.`)) {
            router.delete(route('clerk.merit-lists.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const publishedCount = lists.filter(l => l.status === 'published').length;
    const draftCount = lists.filter(l => l.status === 'draft').length;

    return (
        <ClerkLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Official Desk
                            </span>
                            <span className="text-xs font-mono text-slate-400">Public Portal Sync</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                            <Award className="h-6 w-6 text-amber-400" />
                            <span>Merit Lists & Selection Gazettes</span>
                        </h1>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Upload scanned merit lists, assign classes start dates, and publish directly to all student portals.
                        </p>
                    </div>

                    <button
                        onClick={() => setUploadModalOpen(true)}
                        className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-govt-green hover:from-emerald-500 hover:to-govt-green-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shrink-0 cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Upload Official Merit List</span>
                    </button>
                </div>
            }
        >
            <Head title="Clerk - Merit Lists & Gazettes" />

            <div className="space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-sm flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase block">Published to Students</span>
                            <span className="text-2xl font-black font-mono text-white mt-0.5 block">{publishedCount} Lists</span>
                            <span className="text-[10px] text-emerald-400 font-semibold">Live on all trainee portals</span>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-sm flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase block">Draft / In Preparation</span>
                            <span className="text-2xl font-black font-mono text-white mt-0.5 block">{draftCount} Lists</span>
                            <span className="text-[10px] text-amber-400 font-semibold">Hidden from student portal</span>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-sm flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase block">Active Course Tracks</span>
                            <span className="text-2xl font-black font-mono text-white mt-0.5 block">{courses.length} Courses</span>
                            <span className="text-[10px] text-blue-400 font-semibold">Ready for merit lists</span>
                        </div>
                    </div>
                </div>

                {/* Filter Controls Bar */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
                            <Filter className="h-4 w-4 text-amber-400" />
                            <span>Filter Course:</span>
                        </div>
                        <select
                            value={selectedCourse}
                            onChange={(e) => {
                                setSelectedCourse(e.target.value);
                                handleFilter(e.target.value, selectedStatus);
                            }}
                            className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                        >
                            <option value="">All Technical Trades</option>
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.requires_entrance_test ? 'Test-Required' : 'FCFS'})
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                handleFilter(selectedCourse, e.target.value);
                            }}
                            className="bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                        >
                            <option value="all">All Statuses</option>
                            <option value="published">Published Only</option>
                            <option value="draft">Drafts Only</option>
                        </select>
                    </div>

                    <span className="text-xs font-mono text-slate-400">
                        Showing {lists.length} records
                    </span>
                </div>

                {/* Merit Lists Table */}
                <div className="rounded-2xl bg-slate-800/80 border border-slate-700 overflow-hidden shadow-md">
                    {lists.length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                            <Award className="h-12 w-12 text-slate-600 mx-auto" />
                            <h3 className="text-base font-bold text-white">No Merit Lists Uploaded Yet</h3>
                            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                                Upload the first official merit list document for any vocational trade to make it visible to applicants on their student portals.
                            </p>
                            <button
                                onClick={() => setUploadModalOpen(true)}
                                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Upload Merit List Now</span>
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-300">
                                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-mono tracking-wider border-b border-slate-700">
                                    <tr>
                                        <th className="px-5 py-3.5">Course / Trade</th>
                                        <th className="px-5 py-3.5">Merit List Title</th>
                                        <th className="px-5 py-3.5">Classes Start Date</th>
                                        <th className="px-5 py-3.5">File Document</th>
                                        <th className="px-5 py-3.5">Status</th>
                                        <th className="px-5 py-3.5">Published By</th>
                                        <th className="px-5 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/60">
                                    {lists.map((list) => (
                                        <tr key={list.id} className="hover:bg-slate-700/30 transition">
                                            <td className="px-5 py-4 font-bold text-white">
                                                <div className="space-y-0.5">
                                                    <span>{list.course?.name}</span>
                                                    <span className="text-[10px] text-slate-400 block font-normal">
                                                        {list.course?.trade?.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-slate-200">
                                                <div>{list.title}</div>
                                                {list.remarks && (
                                                    <p className="text-[11px] text-slate-400 italic line-clamp-1">
                                                        {list.remarks}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 font-mono font-bold text-amber-300">
                                                {list.classes_start_date ? (
                                                    <span className="flex items-center space-x-1.5">
                                                        <Calendar className="h-3.5 w-3.5 text-amber-400" />
                                                        <span>{new Date(list.classes_start_date).toLocaleDateString()}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500 font-normal">Not Announced</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 font-mono text-[11px]">
                                                {list.file_path ? (
                                                    <a
                                                        href={route('clerk.merit-lists.download', list.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition font-bold"
                                                    >
                                                        <Download className="h-3.5 w-3.5" />
                                                        <span className="truncate max-w-[140px]">{list.file_name || 'Download PDF'}</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-500">No File</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => handleTogglePublish(list.id)}
                                                    className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                                                        list.status === 'published'
                                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40'
                                                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40'
                                                    }`}
                                                    title="Click to toggle publish status"
                                                >
                                                    {list.status === 'published' ? (
                                                        <>
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            <span>Published</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="h-3 w-3" />
                                                            <span>Draft (Hidden)</span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-5 py-4 text-[11px] text-slate-400 font-mono">
                                                {list.uploader?.name || 'Admission Clerk'}
                                                <span className="text-[10px] text-slate-500 block">
                                                    {list.created_at ? new Date(list.created_at).toLocaleDateString() : ''}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(list.id, list.title)}
                                                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                                                    title="Delete Merit List"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal Drawer */}
            {uploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl p-6 sm:p-7 shadow-2xl text-slate-100 space-y-5 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <div className="space-y-0.5">
                                <h3 className="text-base font-black text-white flex items-center space-x-2">
                                    <Upload className="h-5 w-5 text-emerald-400" />
                                    <span>Upload & Publish Official Merit List</span>
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Document will be available to all applicants on their student portals.
                                </p>
                            </div>
                            <button
                                onClick={() => setUploadModalOpen(false)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-300 mb-1">Target Course / Trade *</label>
                                <select
                                    required
                                    value={uploadForm.data.course_id}
                                    onChange={(e) => {
                                        uploadForm.setData('course_id', e.target.value);
                                        const found = courses.find(c => String(c.id) === e.target.value);
                                        if (found && !uploadForm.data.title) {
                                            uploadForm.setData({
                                                ...uploadForm.data,
                                                course_id: e.target.value,
                                                title: `1st Provisional Merit List - ${found.name} (Session ${new Date().getFullYear()})`,
                                                classes_start_date: found.classes_start_date ? found.classes_start_date.split('T')[0] : '',
                                            });
                                        }
                                    }}
                                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                                >
                                    <option value="">Select Technical Course...</option>
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.trade?.name || 'General'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-300 mb-1">Merit List Title / Gazette Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 1st Official Merit List - Electrical Technician Session 2026"
                                    value={uploadForm.data.title}
                                    onChange={(e) => uploadForm.setData('title', e.target.value)}
                                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-slate-300 mb-1">Merit List Document (PDF / Image / Excel) *</label>
                                    <input
                                        type="file"
                                        required
                                        accept=".pdf,.jpg,.jpeg,.png,.xlsx,.csv"
                                        onChange={(e) => uploadForm.setData('merit_document', e.target.files[0])}
                                        className="w-full text-xs text-slate-400 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-300 mb-1">Classes Commencement Date</label>
                                    <input
                                        type="date"
                                        value={uploadForm.data.classes_start_date}
                                        onChange={(e) => uploadForm.setData('classes_start_date', e.target.value)}
                                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-300 mb-1">Important Instructions / Reporting Notes</label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Selected candidates must deposit admission fee challan within 3 days to lock seats."
                                    value={uploadForm.data.remarks}
                                    onChange={(e) => uploadForm.setData('remarks', e.target.value)}
                                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                                <div>
                                    <span className="font-bold text-slate-200 block">Immediate Publication</span>
                                    <span className="text-[10px] text-slate-400">
                                        Make visible to all students immediately upon submission
                                    </span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={uploadForm.data.status === 'published'}
                                        onChange={(e) => uploadForm.setData('status', e.target.checked ? 'published' : 'draft')}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setUploadModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploadForm.processing}
                                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-wider transition disabled:opacity-50 cursor-pointer"
                                >
                                    {uploadForm.processing ? 'Uploading Document...' : 'Upload & Publish Gazette'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </ClerkLayout>
    );
}
