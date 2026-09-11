import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import ClerkLayout from '@/Layouts/ClerkLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Image as ImageIcon,
    Upload,
    Plus,
    Eye,
    EyeOff,
    Trash2,
    Edit3,
    Check,
    X,
    Sparkles,
    Calendar,
    Tag,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import Badge from '@/Components/UI/Badge';

export default function Index({ images = [], isClerk = false }) {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [editingImage, setEditingImage] = useState(null);
    const [uploadPreview, setUploadPreview] = useState(null);
    const [editPreview, setEditPreview] = useState(null);

    const LayoutComponent = isClerk ? ClerkLayout : AdminLayout;

    // Routes depending on user role
    const storeRoute = isClerk ? 'clerk.gallery.store' : 'admin.gallery.store';
    const updateRoute = isClerk ? 'clerk.gallery.update' : 'admin.gallery.update';
    const toggleRoute = isClerk ? 'clerk.gallery.toggle' : 'admin.gallery.toggle';
    const destroyRoute = isClerk ? 'clerk.gallery.destroy' : 'admin.gallery.destroy';

    // Upload Form
    const {
        data: uploadData,
        setData: setUploadData,
        post: postUpload,
        processing: uploadProcessing,
        errors: uploadErrors,
        reset: resetUpload
    } = useForm({
        image: null,
        title: '',
        category: 'Workshops & Training',
        description: '',
        event_date: '',
        display_order: 0,
        is_active: true,
    });

    // Edit Form
    const {
        data: editData,
        setData: setEditData,
        post: postEdit,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit
    } = useForm({
        image: null,
        title: '',
        category: 'Workshops & Training',
        description: '',
        event_date: '',
        display_order: 0,
        is_active: true,
    });

    const categories = [
        'Workshops & Training',
        'Ceremonies',
        'Campus Life',
        'Dignitary & Celebrity Visits',
        'Sports & Co-Curricular',
        'Industrial Visits',
        'Convocations & Awards',
    ];

    const handleUploadFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        postUpload(route(storeRoute), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsUploadOpen(false);
                resetUpload();
                setUploadPreview(null);
            },
        });
    };

    const handleOpenEdit = (item) => {
        setEditingImage(item);
        setEditPreview(null);
        setEditData({
            image: null,
            title: item.title || '',
            category: item.category || 'Workshops & Training',
            description: item.description || '',
            event_date: item.event_date ? item.event_date.substring(0, 10) : '',
            display_order: item.display_order ?? 0,
            is_active: Boolean(item.is_active),
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingImage) return;

        postEdit(route(updateRoute, editingImage.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setEditingImage(null);
                resetEdit();
                setEditPreview(null);
            },
        });
    };

    const handleToggle = (item) => {
        router.patch(route(toggleRoute, item.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (item) => {
        if (confirm(`Are you sure you want to delete the image "${item.title}"?`)) {
            router.delete(route(destroyRoute, item.id), {
                preserveScroll: true,
            });
        }
    };

    const getImageUrl = (item) => {
        if (!item) return '';
        if (item.image_path) {
            const clean = item.image_path.replace(/^\/+/, '');
            if (clean.startsWith('images/')) return `/${clean}`;
            return `/storage/${clean}`;
        }
        if (item.image_url) return item.image_url;
        return '';
    };

    const activeCount = images.filter((i) => i.is_active).length;

    return (
        <LayoutComponent>
            <Head title="Institute Image Gallery - Management Desk" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                                Public Showcase Desk
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                                Total: {images.length} Photos ({activeCount} Active on Public Page)
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 mt-1">
                            Institute Image Gallery Management
                        </h1>
                        <p className="text-xs text-gray-600 mt-0.5">
                            Upload and organize event photographs, workshops, technical ceremonies, and campus life for the public website.
                        </p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                        <a
                            href="/#gallery"
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold transition flex items-center space-x-1.5"
                        >
                            <span>View Live Gallery</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                            type="button"
                            onClick={() => setIsUploadOpen(true)}
                            className="px-4 py-2 rounded-xl bg-[#00401A] hover:bg-[#003013] text-white text-xs font-black transition shadow flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Upload Gallery Photo</span>
                        </button>
                    </div>
                </div>

                {/* Upload Modal */}
                {isUploadOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                        <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-govt-cream">
                                <div className="flex items-center space-x-2.5">
                                    <div className="p-2 rounded-lg bg-[#00401A] text-white">
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-base text-gray-900">Upload New Gallery Photo</h3>
                                        <p className="text-xs text-gray-500">Add an institutional photo to the public gallery</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsUploadOpen(false);
                                        resetUpload();
                                        setUploadPreview(null);
                                    }}
                                    className="p-1.5 rounded-lg bg-gray-200 hover:bg-rose-100 hover:text-rose-700 text-gray-600 transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUploadSubmit} className="p-6 overflow-y-auto space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Select Image File (Max 8MB, JPG/PNG/WEBP) *
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        required
                                        onChange={handleUploadFileChange}
                                        className="w-full text-xs text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#00401A] file:text-white hover:file:bg-[#003013] cursor-pointer"
                                    />
                                    {uploadErrors.image && <p className="text-rose-600 text-xs mt-1">{uploadErrors.image}</p>}
                                </div>

                                {uploadPreview && (
                                    <div className="rounded-xl overflow-hidden h-44 bg-slate-900 relative">
                                        <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Event / Photo Title *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. 15 Days Technopreneurship Seminar"
                                            value={uploadData.title}
                                            onChange={(e) => setUploadData('title', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                        />
                                        {uploadErrors.title && <p className="text-rose-600 text-xs mt-1">{uploadErrors.title}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Category
                                        </label>
                                        <select
                                            value={uploadData.category}
                                            onChange={(e) => setUploadData('category', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                        >
                                            {categories.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Event Date (Optional)
                                        </label>
                                        <input
                                            type="date"
                                            value={uploadData.event_date}
                                            onChange={(e) => setUploadData('event_date', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Display Order (0 = First)
                                        </label>
                                        <input
                                            type="number"
                                            value={uploadData.display_order}
                                            onChange={(e) => setUploadData('display_order', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Description / Highlights (Optional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Add background notes or details about this function/ceremony..."
                                        value={uploadData.description}
                                        onChange={(e) => setUploadData('description', e.target.value)}
                                        className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                    />
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="upload_is_active"
                                        checked={uploadData.is_active}
                                        onChange={(e) => setUploadData('is_active', e.target.checked)}
                                        className="rounded border-gray-300 text-[#00401A] focus:ring-[#00401A]"
                                    />
                                    <label htmlFor="upload_is_active" className="text-xs font-bold text-gray-800">
                                        Publish immediately on public Image Gallery
                                    </label>
                                </div>

                                <div className="pt-4 border-t border-gray-200 flex items-center justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsUploadOpen(false)}
                                        className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploadProcessing}
                                        className="px-5 py-2 rounded-lg bg-[#00401A] hover:bg-[#003013] text-white text-xs font-black transition shadow flex items-center space-x-1.5"
                                    >
                                        {uploadProcessing ? 'Uploading...' : 'Save & Publish Photo'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {editingImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                        <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-govt-cream">
                                <div className="flex items-center space-x-2.5">
                                    <div className="p-2 rounded-lg bg-amber-600 text-white">
                                        <Edit3 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-base text-gray-900">Edit Gallery Photo</h3>
                                        <p className="text-xs text-gray-500">Update title, category, or replace image file</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditingImage(null)}
                                    className="p-1.5 rounded-lg bg-gray-200 hover:bg-rose-100 hover:text-rose-700 text-gray-600 transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Replace Image File (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleEditFileChange}
                                        className="w-full text-xs text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#00401A] file:text-white hover:file:bg-[#003013] cursor-pointer"
                                    />
                                </div>

                                <div className="rounded-xl overflow-hidden h-44 bg-slate-900 relative">
                                    <img
                                        src={editPreview || getImageUrl(editingImage)}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Event / Photo Title *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={editData.title}
                                            onChange={(e) => setEditData('title', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Category
                                        </label>
                                        <select
                                            value={editData.category}
                                            onChange={(e) => setEditData('category', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                        >
                                            {categories.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Event Date
                                        </label>
                                        <input
                                            type="date"
                                            value={editData.event_date}
                                            onChange={(e) => setEditData('event_date', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Display Order
                                        </label>
                                        <input
                                            type="number"
                                            value={editData.display_order}
                                            onChange={(e) => setEditData('display_order', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={editData.description}
                                        onChange={(e) => setEditData('description', e.target.value)}
                                        className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                    />
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="edit_is_active"
                                        checked={editData.is_active}
                                        onChange={(e) => setEditData('is_active', e.target.checked)}
                                        className="rounded border-gray-300 text-[#00401A] focus:ring-[#00401A]"
                                    />
                                    <label htmlFor="edit_is_active" className="text-xs font-bold text-gray-800">
                                        Visible on public gallery
                                    </label>
                                </div>

                                <div className="pt-4 border-t border-gray-200 flex items-center justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditingImage(null)}
                                        className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editProcessing}
                                        className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-black transition shadow"
                                    >
                                        {editProcessing ? 'Saving...' : 'Update Photo'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Photos List Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map((item) => (
                        <div
                            key={item.id}
                            className={`rounded-2xl bg-white border transition duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                                item.is_active ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-75'
                            }`}
                        >
                            {/* Photo Thumbnail */}
                            <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                                <img
                                    src={getImageUrl(item)}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />
                                
                                {/* Status badge top right */}
                                <div className="absolute top-3 right-3 z-10">
                                    {item.is_active ? (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-600 text-white shadow">
                                            Hidden
                                        </span>
                                    )}
                                </div>

                                {/* Category top left */}
                                {item.category && (
                                    <div className="absolute top-3 left-3 z-10">
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs">
                                            {item.category}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Body Info */}
                            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                <div>
                                    <h3 className="font-extrabold text-sm text-gray-900 line-clamp-1">
                                        {item.title}
                                    </h3>
                                    {item.description && (
                                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                            {item.description}
                                        </p>
                                    )}
                                    <div className="flex items-center space-x-3 text-[11px] text-gray-500 pt-2">
                                        {item.event_date && (
                                            <span className="flex items-center space-x-1">
                                                <Calendar className="w-3 h-3 text-emerald-700" />
                                                <span>{new Date(item.event_date).toLocaleDateString('en-GB')}</span>
                                            </span>
                                        )}
                                        <span>Order: <strong>#{item.display_order}</strong></span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => handleToggle(item)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                                            item.is_active
                                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                                        }`}
                                    >
                                        {item.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        <span>{item.is_active ? 'Hide' : 'Activate'}</span>
                                    </button>

                                    <div className="flex items-center space-x-1">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEdit(item)}
                                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                                            title="Edit Image Details"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(item)}
                                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                                            title="Delete Image"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {images.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 space-y-3">
                        <div className="h-16 w-16 rounded-full bg-emerald-50 text-[#00401A] flex items-center justify-center mx-auto">
                            <ImageIcon className="w-8 h-8" />
                        </div>
                        <h3 className="font-extrabold text-base text-gray-800">No Gallery Photos Uploaded Yet</h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto">
                            Click the "Upload Gallery Photo" button above to add ceremony, workshop, or campus life photos.
                        </p>
                    </div>
                )}
            </div>
        </LayoutComponent>
    );
}
