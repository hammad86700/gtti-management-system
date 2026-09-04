import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import {
    Briefcase,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    MapPin,
    Phone,
    Mail,
    Plus,
    X,
    FileText,
    ShieldCheck,
    ArrowLeft,
    TrendingUp
} from 'lucide-react';

export default function Index({ placements = [], enrollment = null, industrySectors = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        company_name: '',
        industry_sector: industrySectors[0] || 'Automotive & Diesel Mechanics',
        supervisor_name: '',
        supervisor_phone: '',
        supervisor_email: '',
        stipend_amount: '',
        start_date: '',
        end_date: '',
        work_location: '',
        job_description: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('student.apprenticeship.store'), {
            onSuccess: () => {
                reset();
                setIsModalOpen(false);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Apprenticeship & OJT Placements - GIIMS" />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-start space-x-3.5">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-0.5">
                                <span>TEVTA Industry Linkages</span>
                                <span>•</span>
                                <span className="text-govt-green-700 font-bold">Dual Training Scheme</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                                Apprenticeship & On-the-Job Training (OJT)
                            </h1>
                            <p className="text-xs text-slate-500 mt-1">
                                Self-report and maintain your factory or industry training records for TEVTA certification clearance.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Dashboard</span>
                        </Link>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-govt-green-700 hover:bg-govt-green-800 transition shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Report New OJT</span>
                        </button>
                    </div>
                </div>

                {/* Trainee Trade Context Card */}
                {enrollment && (
                    <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Enrolled Trade:</span>
                            <span className="text-sm font-bold text-white mt-0.5 block">{enrollment.course?.name}</span>
                            <span className="text-[11px] text-slate-400">{enrollment.course?.department?.name}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Batch & Shift:</span>
                            <span className="text-sm font-semibold text-slate-200 mt-0.5 block">{enrollment.batch?.name}</span>
                            <span className="text-[11px] text-slate-400">Roll No: {enrollment.roll_number || 'Pending'}</span>
                        </div>
                        <div className="flex items-center sm:justify-end">
                            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span className="font-semibold text-[11px]">Accredited OJT Candidate</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Placements List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                            Registered Industrial Placements ({placements.length})
                        </h2>
                    </div>

                    {placements.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
                            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
                                <Briefcase className="w-7 h-7" />
                            </div>
                            <h3 className="text-base font-bold text-slate-800">No Apprenticeship Reported Yet</h3>
                            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                                If you are currently interning, training at an industrial plant, or completing an on-the-job training term, log your supervisor details to obtain your TEVTA experience endorsement.
                            </p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-govt-green-700 hover:bg-govt-green-800 transition shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Report Placement Now</span>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {placements.map((p) => (
                                <div
                                    key={p.id}
                                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition space-y-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                                {p.industry_sector}
                                            </span>
                                            <h3 className="text-base font-bold text-slate-900 mt-1.5">
                                                {p.company_name}
                                            </h3>
                                        </div>
                                        <span
                                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                p.placement_status === 'active'
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : 'bg-slate-100 text-slate-600 border border-slate-300'
                                            }`}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                            <span>{p.placement_status}</span>
                                        </span>
                                    </div>

                                    <div className="space-y-1.5 text-xs text-slate-600">
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span>{p.work_location}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span>
                                                From {p.start_date ? new Date(p.start_date).toLocaleDateString() : 'N/A'}
                                                {p.end_date ? ` to ${new Date(p.end_date).toLocaleDateString()}` : ' (Ongoing)'}
                                            </span>
                                        </div>
                                        {p.stipend_amount > 0 && (
                                            <div className="flex items-center space-x-2 text-govt-green-700 font-semibold">
                                                <DollarSign className="w-3.5 h-3.5 text-govt-green-600 shrink-0" />
                                                <span>PKR {Number(p.stipend_amount).toLocaleString()} / Month Stipend</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-slate-100 pt-2.5 mt-2 flex items-center justify-between text-xs text-slate-500">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Supervisor:</span>
                                            <span className="font-semibold text-slate-800">{p.supervisor_name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact:</span>
                                            <span className="font-mono font-medium text-slate-700">{p.supervisor_phone}</span>
                                        </div>
                                    </div>

                                    {p.job_description && (
                                        <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                                            "{p.job_description}"
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between text-[11px] pt-1">
                                        <span className="text-slate-400">
                                            Registered: {new Date(p.created_at).toLocaleDateString()}
                                        </span>
                                        <span className="font-semibold text-slate-600">
                                            {p.tevta_registered ? '✓ TEVTA Verified' : '⏳ Pending Audit Inspection'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* REPORT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
                        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Briefcase className="w-5 h-5 text-govt-green-700" />
                                <h3 className="text-base font-bold text-slate-800">Report Apprenticeship Placement</h3>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Company / Factory / Mill Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Fatima Fertilizer Co., Millat Tractors Ltd."
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-300 focus:border-govt-green-600 focus:ring-govt-green-600"
                                />
                                {errors.company_name && <p className="text-[11px] text-rose-500 mt-1">{errors.company_name}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Industry Sector *
                                    </label>
                                    <select
                                        value={data.industry_sector}
                                        onChange={(e) => setData('industry_sector', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-govt-green-600 focus:ring-govt-green-600"
                                    >
                                        {industrySectors.map((sector) => (
                                            <option key={sector} value={sector}>{sector}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Work Location / City *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Industrial Area, Rahim Yar Khan"
                                        value={data.work_location}
                                        onChange={(e) => setData('work_location', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-govt-green-600 focus:ring-govt-green-600"
                                    />
                                    {errors.work_location && <p className="text-[11px] text-rose-500 mt-1">{errors.work_location}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Industry Supervisor Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Engr. Asim Qureshi"
                                        value={data.supervisor_name}
                                        onChange={(e) => setData('supervisor_name', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-govt-green-600 focus:ring-govt-green-600"
                                    />
                                    {errors.supervisor_name && <p className="text-[11px] text-rose-500 mt-1">{errors.supervisor_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Supervisor Phone *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="0300-1234567"
                                        value={data.supervisor_phone}
                                        onChange={(e) => setData('supervisor_phone', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-govt-green-600 focus:ring-govt-green-600 font-mono"
                                    />
                                    {errors.supervisor_phone && <p className="text-[11px] text-rose-500 mt-1">{errors.supervisor_phone}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Supervisor Email (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="supervisor@company.com"
                                        value={data.supervisor_email}
                                        onChange={(e) => setData('supervisor_email', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-govt-green-600 focus:ring-govt-green-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Monthly Stipend (PKR)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 15000"
                                        value={data.stipend_amount}
                                        onChange={(e) => setData('stipend_amount', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-govt-green-600 focus:ring-govt-green-600 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-govt-green-600 focus:ring-govt-green-600"
                                    />
                                    {errors.start_date && <p className="text-[11px] text-rose-500 mt-1">{errors.start_date}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Expected End Date (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-300 focus:border-govt-green-600 focus:ring-govt-green-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Learning Scope & Tasks Performed
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder="Brief summary of machines operated, electrical panels wired, or workshop maintenance tasks handled..."
                                    value={data.job_description}
                                    onChange={(e) => setData('job_description', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-300 focus:border-govt-green-600 focus:ring-govt-green-600"
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end space-x-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-govt-green-700 hover:bg-govt-green-800 transition shadow-sm disabled:opacity-50"
                                >
                                    {processing ? 'Registering...' : 'Register Placement'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
