import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Users,
    UserPlus,
    User,
    Award,
    Briefcase,
    Phone,
    Mail,
    Edit3,
    Trash2,
    Eye,
    EyeOff,
    Check,
    X,
    Upload,
    ExternalLink
} from 'lucide-react';

export default function Index({ members = [] }) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [addPreview, setAddPreview] = useState(null);
    const [editPreview, setEditPreview] = useState(null);

    // Add Form
    const {
        data: addData,
        setData: setAddData,
        post: postAdd,
        processing: addProcessing,
        errors: addErrors,
        reset: resetAdd
    } = useForm({
        name: '',
        designation: '',
        department: '',
        experience: '',
        phone: '',
        email: '',
        photo: null,
        bio: '',
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
        name: '',
        designation: '',
        department: '',
        experience: '',
        phone: '',
        email: '',
        photo: null,
        bio: '',
        display_order: 0,
        is_active: true,
    });

    const handleAddPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAddData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAddPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditData('photo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        postAdd(route('admin.core-team.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsAddOpen(false);
                resetAdd();
                setAddPreview(null);
            },
        });
    };

    const handleOpenEdit = (member) => {
        setEditingMember(member);
        setEditPreview(null);
        setEditData({
            name: member.name || '',
            designation: member.designation || '',
            department: member.department || '',
            experience: member.experience || '',
            phone: member.phone || '',
            email: member.email || '',
            photo: null,
            bio: member.bio || '',
            display_order: member.display_order ?? 0,
            is_active: Boolean(member.is_active),
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingMember) return;

        postEdit(route('admin.core-team.update', editingMember.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setEditingMember(null);
                resetEdit();
                setEditPreview(null);
            },
        });
    };

    const handleToggle = (member) => {
        router.patch(route('admin.core-team.toggle', member.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (member) => {
        if (confirm(`Are you sure you want to remove team member "${member.name}"?`)) {
            router.delete(route('admin.core-team.destroy', member.id), {
                preserveScroll: true,
            });
        }
    };

    const getPhotoUrl = (member) => {
        if (!member) return '';
        if (member.photo_path) {
            const clean = member.photo_path.replace(/^\/+/, '');
            if (clean.startsWith('images/')) return `/${clean}`;
            return `/storage/${clean}`;
        }
        if (member.photo_url) return member.photo_url;
        return '';
    };

    const activeCount = members.filter((m) => m.is_active).length;

    return (
        <AdminLayout>
            <Head title="Core Team Leadership - Management Desk" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                                Institutional Governance
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                                Total: {members.length} Members ({activeCount} Active on Public Page)
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 mt-1">
                            Core Team Leadership Directory
                        </h1>
                        <p className="text-xs text-gray-600 mt-0.5">
                            Manage Principal, Department Incharges, Chief Instructors, and Faculty Profiles displayed on the public website.
                        </p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                        <a
                            href="/#core-team"
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold transition flex items-center space-x-1.5"
                        >
                            <span>View on Website</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                            type="button"
                            onClick={() => setIsAddOpen(true)}
                            className="px-4 py-2 rounded-xl bg-[#00401A] hover:bg-[#003013] text-white text-xs font-black transition shadow flex items-center space-x-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Add Team Member</span>
                        </button>
                    </div>
                </div>

                {/* Add Member Modal */}
                {isAddOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                        <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-govt-cream">
                                <div className="flex items-center space-x-2.5">
                                    <div className="p-2 rounded-lg bg-[#00401A] text-white">
                                        <UserPlus className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-base text-gray-900">Add Core Team Member</h3>
                                        <p className="text-xs text-gray-500">Enter qualifications, designation, and official photo</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddOpen(false);
                                        resetAdd();
                                        setAddPreview(null);
                                    }}
                                    className="p-1.5 rounded-lg bg-gray-200 hover:bg-rose-100 hover:text-rose-700 text-gray-600 transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddSubmit} className="p-6 overflow-y-auto space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Full Name & Title *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Engr. Muhammad Tariq Khan"
                                            value={addData.name}
                                            onChange={(e) => setAddData('name', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                        />
                                        {addErrors.name && <p className="text-rose-600 text-xs mt-1">{addErrors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Official Designation *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Principal / Project Director"
                                            value={addData.designation}
                                            onChange={(e) => setAddData('designation', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                        />
                                        {addErrors.designation && <p className="text-rose-600 text-xs mt-1">{addErrors.designation}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Department / Wing
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Directorate of Technical Education"
                                            value={addData.department}
                                            onChange={(e) => setAddData('department', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Experience (e.g. 20+ Years Experience)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 18+ Years Industrial & Academic Experience"
                                            value={addData.experience}
                                            onChange={(e) => setAddData('experience', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Official Mobile / Phone Number
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 068-9230101 / +92 300 1234567"
                                            value={addData.phone}
                                            onChange={(e) => setAddData('phone', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Official Email Address
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="e.g. principal@gtti.edu.pk"
                                            value={addData.email}
                                            onChange={(e) => setAddData('email', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Member Portrait / Photo (JPG/PNG, Max 5MB)
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAddPhotoChange}
                                            className="text-xs text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#00401A] file:text-white hover:file:bg-[#003013] cursor-pointer"
                                        />
                                        {addPreview && (
                                            <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-emerald-700 shrink-0">
                                                <img src={addPreview} alt="Preview" className="h-full w-full object-cover object-top" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Biography / Qualifications
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Educational background, certifications, and institutional roles..."
                                        value={addData.bio}
                                        onChange={(e) => setAddData('bio', e.target.value)}
                                        className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Display Order (0 = Top / Left)
                                        </label>
                                        <input
                                            type="number"
                                            value={addData.display_order}
                                            onChange={(e) => setAddData('display_order', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2 pt-5">
                                        <input
                                            type="checkbox"
                                            id="add_is_active"
                                            checked={addData.is_active}
                                            onChange={(e) => setAddData('is_active', e.target.checked)}
                                            className="rounded border-gray-300 text-[#00401A] focus:ring-[#00401A]"
                                        />
                                        <label htmlFor="add_is_active" className="text-xs font-bold text-gray-800">
                                            Publish on Public Core Team Section
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200 flex items-center justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddOpen(false)}
                                        className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={addProcessing}
                                        className="px-5 py-2 rounded-lg bg-[#00401A] hover:bg-[#003013] text-white text-xs font-black transition shadow"
                                    >
                                        {addProcessing ? 'Adding...' : 'Add Team Member'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Member Modal */}
                {editingMember && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                        <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-govt-cream">
                                <div className="flex items-center space-x-2.5">
                                    <div className="p-2 rounded-lg bg-amber-600 text-white">
                                        <Edit3 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-base text-gray-900">Edit Team Member</h3>
                                        <p className="text-xs text-gray-500">Update contact info, role, or photo</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditingMember(null)}
                                    className="p-1.5 rounded-lg bg-gray-200 hover:bg-rose-100 hover:text-rose-700 text-gray-600 transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Full Name & Title *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={editData.name}
                                            onChange={(e) => setEditData('name', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Official Designation *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={editData.designation}
                                            onChange={(e) => setEditData('designation', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Department / Wing
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.department}
                                            onChange={(e) => setEditData('department', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Experience
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.experience}
                                            onChange={(e) => setEditData('experience', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Official Mobile / Phone
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.phone}
                                            onChange={(e) => setEditData('phone', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Official Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={editData.email}
                                            onChange={(e) => setEditData('email', e.target.value)}
                                            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Replace Photo (Optional)
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleEditPhotoChange}
                                            className="text-xs text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#00401A] file:text-white hover:file:bg-[#003013] cursor-pointer"
                                        />
                                        <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-emerald-700 shrink-0">
                                            <img
                                                src={editPreview || getPhotoUrl(editingMember)}
                                                alt="Preview"
                                                className="h-full w-full object-cover object-top"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Biography / Qualifications
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={editData.bio}
                                        onChange={(e) => setEditData('bio', e.target.value)}
                                        className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00401A]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
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

                                    <div className="flex items-center space-x-2 pt-5">
                                        <input
                                            type="checkbox"
                                            id="edit_is_active"
                                            checked={editData.is_active}
                                            onChange={(e) => setEditData('is_active', e.target.checked)}
                                            className="rounded border-gray-300 text-[#00401A] focus:ring-[#00401A]"
                                        />
                                        <label htmlFor="edit_is_active" className="text-xs font-bold text-gray-800">
                                            Published on Core Team Section
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200 flex items-center justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditingMember(null)}
                                        className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editProcessing}
                                        className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-black transition shadow"
                                    >
                                        {editProcessing ? 'Saving...' : 'Update Member'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Team Members Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className={`rounded-2xl bg-white border transition duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md p-5 ${
                                member.is_active ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-75'
                            }`}
                        >
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="h-20 w-20 rounded-full overflow-hidden bg-slate-100 border-2 border-emerald-700 shadow shrink-0">
                                        {getPhotoUrl(member) ? (
                                            <img
                                                src={getPhotoUrl(member)}
                                                alt={member.name}
                                                className="h-full w-full object-cover object-top"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                <User className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        {member.is_active ? (
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-600 text-white shadow">
                                                Hidden
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-extrabold text-base text-gray-900 line-clamp-1">
                                        {member.name}
                                    </h3>
                                    <p className="text-xs font-bold text-emerald-800 line-clamp-1">
                                        {member.designation}
                                    </p>
                                    {member.department && (
                                        <p className="text-[11px] text-gray-500 font-medium line-clamp-1">
                                            {member.department}
                                        </p>
                                    )}
                                </div>

                                {member.experience && (
                                    <div className="pt-2 border-t border-gray-100">
                                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#00401A] border border-emerald-200">
                                            <Award className="w-3 h-3 text-amber-600 shrink-0" />
                                            <span className="truncate">{member.experience}</span>
                                        </span>
                                    </div>
                                )}

                                {(member.phone || member.email) && (
                                    <div className="space-y-1 text-xs text-gray-600 pt-1">
                                        {member.phone && (
                                            <div className="flex items-center space-x-2">
                                                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                <span className="font-mono text-[11px]">{member.phone}</span>
                                            </div>
                                        )}
                                        {member.email && (
                                            <div className="flex items-center space-x-2">
                                                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                <span className="truncate text-[11px]">{member.email}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => handleToggle(member)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                                        member.is_active
                                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                                    }`}
                                >
                                    {member.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    <span>{member.is_active ? 'Hide' : 'Activate'}</span>
                                </button>

                                <div className="flex items-center space-x-1">
                                    <button
                                        type="button"
                                        onClick={() => handleOpenEdit(member)}
                                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                                        title="Edit Team Member"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(member)}
                                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                                        title="Remove Member"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {members.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 space-y-3">
                        <div className="h-16 w-16 rounded-full bg-emerald-50 text-[#00401A] flex items-center justify-center mx-auto">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="font-extrabold text-base text-gray-800">No Core Team Members Added</h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto">
                            Click the "Add Team Member" button to add Principal, department heads, and key faculty members.
                        </p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
