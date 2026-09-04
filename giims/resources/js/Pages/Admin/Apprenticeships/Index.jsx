import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Briefcase,
    Building2,
    CheckCircle2,
    Clock,
    DollarSign,
    Download,
    Filter,
    Search,
    ShieldCheck,
    Users,
    ChevronRight,
    MapPin,
    Phone,
    TrendingUp
} from 'lucide-react';

export default function Index({ placements, stats, sectors = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [sector, setSector] = useState(filters.sector || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.apprenticeships.index'), {
            search: search || undefined,
            sector: sector || undefined,
            status: status || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setSector('');
        setStatus('');
        router.get(route('admin.apprenticeships.index'));
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
                            <Briefcase className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold leading-tight text-gray-800">
                                Apprenticeship & OJT Trainee Registry
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                TEVTA industry linkages, factory dual-training audits, and trainee stipend compliance
                            </p>
                        </div>
                    </div>

                    <a
                        href={route('admin.apprenticeships.export')}
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-govt-green-600 hover:bg-govt-green-700 transition shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export TEVTA Audit CSV</span>
                    </a>
                </div>
            }
        >
            <Head title="Apprenticeship & OJT Registry - GIIMS Admin" />

            <div className="space-y-6">
                {/* STATISTICAL AGGREGATES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            <Briefcase className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Registered</p>
                            <p className="text-2xl font-black text-gray-900">{stats.total || 0}</p>
                            <p className="text-[11px] text-slate-500">Across all industrial sectors</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active On-Site</p>
                            <p className="text-2xl font-black text-emerald-600">{stats.active || 0}</p>
                            <p className="text-[11px] text-slate-500">Currently in factory training</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Avg Monthly Stipend</p>
                            <p className="text-2xl font-black text-gray-900">PKR {Number(stats.avg_stipend || 0).toLocaleString()}</p>
                            <p className="text-[11px] text-slate-500">Industry paid allowance</p>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">TEVTA Compliant</p>
                            <p className="text-2xl font-black text-purple-700">{stats.tevta_verified || 0}</p>
                            <p className="text-[11px] text-slate-500">Verified for accreditation</p>
                        </div>
                    </div>
                </div>

                {/* SEARCH & FILTERS BAR */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
                    <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-3">
                        <div className="flex-1 min-w-[220px] relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search student, roll #, employer, supervisor..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 text-xs rounded-xl border-gray-300 focus:border-govt-green-600 focus:ring-govt-green-600"
                            />
                        </div>

                        <div className="w-48">
                            <select
                                value={sector}
                                onChange={(e) => setSector(e.target.value)}
                                className="w-full text-xs rounded-xl border-gray-300 focus:border-govt-green-600 focus:ring-govt-green-600"
                            >
                                <option value="">All Industry Sectors</option>
                                {sectors.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="w-40">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full text-xs rounded-xl border-gray-300 focus:border-govt-green-600 focus:ring-govt-green-600"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="terminated">Terminated</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 transition shadow-xs"
                        >
                            Filter
                        </button>

                        {(search || sector || status) && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                            >
                                Reset
                            </button>
                        )}
                    </form>
                </div>

                {/* PLACEMENTS DATA TABLE */}
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-600 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Trainee Candidate</th>
                                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Trade & Batch</th>
                                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Employer & Sector</th>
                                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Supervisor Contact</th>
                                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Stipend</th>
                                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Duration</th>
                                    <th className="px-4 py-3 font-bold uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {placements.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-12 text-center text-slate-500">
                                            No apprenticeship placement records matching current filters.
                                        </td>
                                    </tr>
                                ) : (
                                    placements.data.map((p) => {
                                        const user = p.student_profile?.user;
                                        const enrollment = p.enrollment;
                                        return (
                                            <tr key={p.id} className="hover:bg-slate-50/80 transition">
                                                <td className="px-4 py-3.5">
                                                    <div className="font-bold text-slate-900">{user?.name || 'Trainee'}</div>
                                                    <div className="text-[11px] text-slate-500 font-mono">
                                                        Roll: {enrollment?.roll_number || 'N/A'} • {p.student_profile?.cnic || 'N/A'}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3.5">
                                                    <div className="font-semibold text-slate-800">{enrollment?.course?.name || 'N/A'}</div>
                                                    <div className="text-[11px] text-slate-500">{enrollment?.batch?.name || 'Regular Shift'}</div>
                                                </td>

                                                <td className="px-4 py-3.5">
                                                    <div className="font-bold text-slate-900">{p.company_name}</div>
                                                    <div className="text-[11px] text-blue-600 font-medium">{p.industry_sector}</div>
                                                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>{p.work_location}</span>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3.5">
                                                    <div className="font-medium text-slate-900">{p.supervisor_name}</div>
                                                    <div className="text-[11px] text-slate-500 font-mono">{p.supervisor_phone}</div>
                                                </td>

                                                <td className="px-4 py-3.5">
                                                    {p.stipend_amount > 0 ? (
                                                        <span className="font-bold text-emerald-700">
                                                            PKR {Number(p.stipend_amount).toLocaleString()}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 font-medium">Unpaid / Training</span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3.5">
                                                    <div className="text-[11px] text-slate-700">
                                                        {p.start_date ? new Date(p.start_date).toLocaleDateString() : 'N/A'}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400">
                                                        {p.end_date ? new Date(p.end_date).toLocaleDateString() : 'Ongoing OJT'}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3.5">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                            p.placement_status === 'active'
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                : 'bg-slate-100 text-slate-600 border border-slate-300'
                                                        }`}
                                                    >
                                                        {p.placement_status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {placements.links && placements.links.length > 3 && (
                        <div className="px-4 py-3 bg-slate-50 border-t border-gray-200 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Showing {placements.from || 0} to {placements.to || 0} of {placements.total} trainees
                            </span>
                            <div className="flex items-center space-x-1">
                                {placements.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 text-xs rounded-lg ${
                                            link.active
                                                ? 'bg-govt-green-600 text-white font-bold'
                                                : 'text-slate-600 hover:bg-slate-200'
                                        } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
