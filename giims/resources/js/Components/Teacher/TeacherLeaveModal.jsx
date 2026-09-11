import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import {
    X,
    Calendar,
    FileText,
    Upload,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Send,
    FileCheck,
    Paperclip
} from 'lucide-react';
import Badge from '@/Components/UI/Badge';

export default function TeacherLeaveModal({ isOpen, onClose, recentLeaves = [] }) {
    const [activeTab, setActiveTab] = useState('apply'); // 'apply' | 'history'

    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
        leave_type: 'casual',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        reason: '',
        attachment: null,
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('teacher.faculty-leaves.store'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                reset('reason', 'attachment');
                setActiveTab('history');
            },
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <Badge variant="green" dot>Approved by Principal</Badge>;
            case 'rejected':
                return <Badge variant="rose" dot>Rejected</Badge>;
            default:
                return <Badge variant="amber" dot>Pending Principal Review</Badge>;
        }
    };

    const formatType = (type) => {
        switch (type) {
            case 'casual': return 'Casual Leave';
            case 'medical': return 'Medical / Sick Leave';
            case 'emergency': return 'Emergency Leave';
            case 'official_duty': return 'Official Duty / Deputation';
            default: return type;
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden transition-all transform animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Faculty Leave Desk
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Apply for official leave and track Principal authorization status
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sub-Navigation Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/30 dark:bg-slate-800/30">
                    <button
                        type="button"
                        onClick={() => setActiveTab('apply')}
                        className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                            activeTab === 'apply'
                                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        New Application
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('history')}
                        className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                            activeTab === 'history'
                                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                        }`}
                    >
                        <Clock className="w-4 h-4" />
                        Leave History ({recentLeaves.length})
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'apply' ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Leave Classification <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.leave_type}
                                    onChange={(e) => setData('leave_type', e.target.value)}
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="casual">Casual Leave (Short duration / personal)</option>
                                    <option value="medical">Medical / Sick Leave (Illness / Health)</option>
                                    <option value="emergency">Emergency Leave (Family urgency)</option>
                                    <option value="official_duty">Official Duty / Training Deputation</option>
                                </select>
                                {errors.leave_type && (
                                    <p className="mt-1 text-xs text-rose-500 font-medium">{errors.leave_type}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Start Date <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                    {errors.start_date && (
                                        <p className="mt-1 text-xs text-rose-500 font-medium">{errors.start_date}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        End Date <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.end_date}
                                        min={data.start_date || new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                    {errors.end_date && (
                                        <p className="mt-1 text-xs text-rose-500 font-medium">{errors.end_date}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Reason & Details <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows="3"
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    placeholder="Explain reason for leave and specify alternative arrangements for assigned batches..."
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400"
                                />
                                {errors.reason && (
                                    <p className="mt-1 text-xs text-rose-500 font-medium">{errors.reason}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Supporting Document / Certificate <span className="text-slate-400 font-normal">(Optional, PDF or Image up to 3MB)</span>
                                </label>
                                <div className="mt-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors bg-slate-50/50 dark:bg-slate-800/50">
                                    <label className="w-full cursor-pointer flex flex-col items-center justify-center text-center">
                                        <Upload className="w-6 h-6 text-slate-400 mb-1" />
                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                            {data.attachment ? data.attachment.name : 'Click to select medical slip or official order'}
                                        </span>
                                        <span className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG or PDF (Max 3MB)</span>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => setData('attachment', e.target.files[0])}
                                            className="sr-only"
                                        />
                                    </label>
                                </div>
                                {errors.attachment && (
                                    <p className="mt-1 text-xs text-rose-500 font-medium">{errors.attachment}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Submitting Application...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-3.5 h-3.5" />
                                            Submit to Principal
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-3">
                            {recentLeaves.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        No previous leave applications on record.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[380px] overflow-y-auto pr-1">
                                    {recentLeaves.map((leave) => (
                                        <div key={leave.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                                                        {formatType(leave.leave_type)}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400">
                                                        ({leave.start_date} to {leave.end_date})
                                                    </span>
                                                </div>
                                                <div>
                                                    {getStatusBadge(leave.status)}
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                                {leave.reason}
                                            </p>
                                            {leave.status === 'rejected' && leave.rejection_reason && (
                                                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-[11px] text-rose-700 dark:text-rose-300">
                                                    <span className="font-semibold">Principal Rejection Remarks:</span> {leave.rejection_reason}
                                                </div>
                                            )}
                                            {leave.attachment_path && (
                                                <a
                                                    href={leave.attachment_url || `/storage/${leave.attachment_path}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 hover:underline pt-0.5"
                                                >
                                                    <Paperclip className="w-3 h-3" />
                                                    View Attached Document
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
