import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import ClerkLayout from '@/Layouts/ClerkLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import {
    Camera,
    Upload,
    Plus,
    Eye,
    EyeOff,
    Trash2,
    Edit3,
    Check,
    X,
    Sparkles,
    ExternalLink,
    AlertCircle,
    ArrowUpDown,
    Image as ImageIcon
} from 'lucide-react';
import Badge from '@/Components/UI/Badge';

export default function Index({ photos = [], isClerk = false }) {
    const LayoutComponent = isClerk ? ClerkLayout : AdminLayout;

    const storeRoute = isClerk ? 'clerk.campus-media.store' : 'admin.campus-media.store';
    const updateRoute = isClerk ? 'clerk.campus-media.update' : 'admin.campus-media.update';
    const toggleRoute = isClerk ? 'clerk.campus-media.toggle' : 'admin.campus-media.toggle';
    const destroyRoute = isClerk ? 'clerk.campus-media.destroy' : 'admin.campus-media.destroy';

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [editingPhoto, setEditingPhoto] = useState(null);
    const [uploadPreview, setUploadPreview] = useState(null);
    const [editPreview, setEditPreview] = useState(null);

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
        subtitle: '',
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
        subtitle: '',
        display_order: 0,
        is_active: true,
    });

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

    const handleOpenEdit = (photo) => {
        setEditingPhoto(photo);
        setEditPreview(null);
        setEditData({
            image: null,
            title: photo.title || '',
            subtitle: photo.subtitle || '',
            display_order: photo.display_order ?? 0,
            is_active: Boolean(photo.is_active),
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingPhoto) return;

        // Using POST with multipart form data to allow file replacement
        postEdit(route(updateRoute, editingPhoto.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setEditingPhoto(null);
                resetEdit();
                setEditPreview(null);
            },
        });
    };

    const handleToggle = (photoId) => {
        router.patch(route(toggleRoute, photoId), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (photo) => {
        if (confirm(`Are you sure you want to delete this showcase photo "${photo.title || 'Untitled'}"?`)) {
            router.delete(route(destroyRoute, photo.id), {
                preserveScroll: true,
            });
        }
    };

    const getPhotoUrl = (photo) => {
        if (!photo) return '';
        if (photo.image_path) {
            return `/storage/${photo.image_path.replace(/^\/+/, '')}`;
        }
        if (photo.image_url) {
            if (typeof photo.image_url === 'string' && photo.image_url.includes('/storage/')) {
                return `/storage/${photo.image_url.split('/storage/')[1]}`;
            }
            return photo.image_url;
        }
        return '';
    };

    const activeCount = photos.filter((p) => Boolean(p.is_active)).length;
    const hiddenCount = photos.length - activeCount;

    return (
        <LayoutComponent>
            <Head title="Campus Media Showcase - Admin Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium mb-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Public Website Management</span>
                            <span>•</span>
                            <span>Hero Media Showcase</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Campus Media Showcase Gallery
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Manage institutional facilities, workshops, and lab photos displayed on the public landing page slider
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <a
                            href="/"
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs flex items-center gap-1.5"
                        >
                            <span>Live Carousel</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </a>

                        <button
                            type="button"
                            onClick={() => setIsUploadOpen(true)}
                            className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm hover:shadow transition flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Upload New Photo</span>
                        </button>
                    </div>
                </div>

                {/* KPI Overview Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Photos</span>
                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                                <Camera className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                            {photos.length}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-950/60 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active on Public Slider</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                                <Eye className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                            {activeCount}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Hidden / Inactive</span>
                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                                <EyeOff className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl font-extrabold text-slate-500">
                            {hiddenCount}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-blue-100 dark:border-blue-950/60 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Slider Transition</span>
                            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                                <Sparkles className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                            5s Auto-Rotation (Smooth Fade)
                        </div>
                    </div>
                </div>

                {/* Photo Gallery Grid */}
                {photos.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                            <ImageIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            No Campus Photos Uploaded Yet
                        </h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                            The public landing page is currently displaying the default institutional fallback banner. Upload high-res photos of laboratories and workshops to showcase your facilities.
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsUploadOpen(true)}
                            className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow transition inline-flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Upload First Campus Photo</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {photos.map((photo) => (
                            <div
                                key={photo.id}
                                className={`bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                                    photo.is_active
                                        ? 'border-slate-200 dark:border-slate-800'
                                        : 'border-slate-200/60 dark:border-slate-800/60 opacity-75'
                                }`}
                            >
                                <div>
                                    {/* Image Container */}
                                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950">
                                        <img
                                            src={getPhotoUrl(photo)}
                                            alt={photo.title || 'Campus Photo'}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                if (photo.image_path && !e.target.src.endsWith(photo.image_path)) {
                                                    e.target.src = `/storage/${photo.image_path.replace(/^\/+/, '')}`;
                                                }
                                            }}
                                        />

                                        {/* Status Badge */}
                                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                            {photo.is_active ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600/90 text-white backdrop-blur-md shadow-xs flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800/90 text-slate-300 backdrop-blur-md shadow-xs">
                                                    Hidden / Draft
                                                </span>
                                            )}

                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                                                Order: #{photo.display_order}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="p-4 space-y-1.5">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                                            {photo.title || 'Untitled Showcase Photo'}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                            {photo.subtitle || 'No description provided.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons Footer */}
                                <div className="p-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-2">
                                    {/* Toggle Active Button */}
                                    <button
                                        type="button"
                                        onClick={() => handleToggle(photo.id)}
                                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                            photo.is_active
                                                ? 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                                                : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                        title={photo.is_active ? 'Click to hide from public carousel' : 'Click to show on public carousel'}
                                    >
                                        {photo.is_active ? (
                                            <>
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Visible</span>
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff className="w-3.5 h-3.5" />
                                                <span>Hidden</span>
                                            </>
                                        )}
                                    </button>

                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEdit(photo)}
                                            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                            title="Edit metadata / replace image"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(photo)}
                                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                                            title="Delete photo"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* UPLOAD SHOWCASE PHOTO MODAL                                               */}
            {/* ========================================================================= */}
            {isUploadOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                                    <Camera className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Upload Campus Showcase Photo
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        High-definition photo for the public website hero slider
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setIsUploadOpen(false);
                                    resetUpload();
                                    setUploadPreview(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
                            {/* File Drag / Drop */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Showcase Image File <span className="text-rose-500">*</span>
                                </label>

                                {uploadPreview ? (
                                    <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500/50 h-44 bg-slate-950 flex items-center justify-center group shadow-sm">
                                        <img
                                            src={uploadPreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setUploadData('image', null);
                                                    setUploadPreview(null);
                                                }}
                                                className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                                            >
                                                Change Image
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/40 hover:bg-emerald-50/20 h-44">
                                        <Upload className="w-8 h-8 text-emerald-600 mb-2" />
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Click to browse or drop an image
                                        </span>
                                        <span className="text-[10px] text-slate-400 mt-1">
                                            JPEG, PNG or WebP (Max 5MB • 1920×1080 recommended)
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg,image/webp"
                                            onChange={handleUploadFileChange}
                                            className="sr-only"
                                        />
                                    </label>
                                )}
                                {uploadErrors.image && (
                                    <p className="mt-1 text-xs text-rose-500 font-medium">{uploadErrors.image}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Photo Title <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={uploadData.title}
                                    onChange={(e) => setUploadData('title', e.target.value)}
                                    placeholder="e.g., Computer Applications & Software Lab 1"
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                {uploadErrors.title && (
                                    <p className="mt-1 text-xs text-rose-500 font-medium">{uploadErrors.title}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Photo Subtitle / Description <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <textarea
                                    rows="2"
                                    value={uploadData.subtitle}
                                    onChange={(e) => setUploadData('subtitle', e.target.value)}
                                    placeholder="e.g., Fully air-conditioned multimedia lab equipped with high-speed internet for web design trainees."
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                                />
                                {uploadErrors.subtitle && (
                                    <p className="mt-1 text-xs text-rose-500 font-medium">{uploadErrors.subtitle}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 items-center">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={uploadData.display_order}
                                        onChange={(e) => setUploadData('display_order', e.target.value)}
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                    <span className="text-[10px] text-slate-400">Lower numbers appear first</span>
                                </div>

                                <div className="flex items-center pt-4">
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={uploadData.is_active}
                                            onChange={(e) => setUploadData('is_active', e.target.checked)}
                                            className="rounded border-slate-300 text-emerald-600 shadow-xs focus:ring-emerald-500 h-4 w-4"
                                        />
                                        <span className="ml-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Publish to Public Carousel
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsUploadOpen(false);
                                        resetUpload();
                                        setUploadPreview(null);
                                    }}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploadProcessing || !uploadData.image}
                                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow transition disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {uploadProcessing ? 'Uploading...' : 'Save & Publish Photo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* EDIT SHOWCASE PHOTO MODAL                                                 */}
            {/* ========================================================================= */}
            {editingPhoto && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-emerald-600" />
                                Edit Showcase Photo & Captions
                            </h3>
                            <button
                                onClick={() => {
                                    setEditingPhoto(null);
                                    resetEdit();
                                    setEditPreview(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            {/* Current Image & Optional Replacement */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Current Image
                                </label>
                                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-36 bg-slate-950 flex items-center justify-center">
                                    <img
                                        src={editPreview || getPhotoUrl(editingPhoto)}
                                        alt="Current"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            if (editingPhoto?.image_path && !e.target.src.endsWith(editingPhoto.image_path)) {
                                                e.target.src = `/storage/${editingPhoto.image_path.replace(/^\/+/, '')}`;
                                            }
                                        }}
                                    />
                                </div>
                                <div className="mt-2">
                                    <label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1">
                                        <Upload className="w-3.5 h-3.5" />
                                        Replace image file (optional)
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg,image/webp"
                                            onChange={handleEditFileChange}
                                            className="sr-only"
                                        />
                                    </label>
                                    {editData.image && (
                                        <span className="text-[11px] text-slate-500 font-medium">
                                            Selected new file: {editData.image.name}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={editData.title}
                                    onChange={(e) => setEditData('title', e.target.value)}
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Subtitle / Caption
                                </label>
                                <textarea
                                    rows="2"
                                    value={editData.subtitle}
                                    onChange={(e) => setEditData('subtitle', e.target.value)}
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 items-center">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editData.display_order}
                                        onChange={(e) => setEditData('display_order', e.target.value)}
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <div className="flex items-center pt-4">
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editData.is_active}
                                            onChange={(e) => setEditData('is_active', e.target.checked)}
                                            className="rounded border-slate-300 text-emerald-600 shadow-xs focus:ring-emerald-500 h-4 w-4"
                                        />
                                        <span className="ml-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Visible on Public Slider
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingPhoto(null);
                                        resetEdit();
                                        setEditPreview(null);
                                    }}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editProcessing}
                                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow transition disabled:opacity-50"
                                >
                                    {editProcessing ? 'Saving...' : 'Update Showcase Photo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </LayoutComponent>
    );
}
