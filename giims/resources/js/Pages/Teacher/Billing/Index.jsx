import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    DollarSign,
    Calendar,
    Printer,
    FileText,
    CheckCircle2,
    Clock,
    ArrowLeft,
    AlertCircle,
    Building2,
    Users,
    Receipt,
    Wallet,
    Check
} from 'lucide-react';

export default function Index({
    isVisiting = false,
    dailyRate = 0,
    selectedMonth = '',
    daysCount = 0,
    distinctDays = [],
    sessions = [],
    estimatedAmount = 0,
    bills = []
}) {
    const [month, setMonth] = useState(selectedMonth || new Date().toISOString().slice(0, 7));
    const [isGenerating, setIsGenerating] = useState(false);

    const handleMonthChange = (e) => {
        const newMonth = e.target.value;
        setMonth(newMonth);
        router.get(route('teacher.billing.index'), { month: newMonth }, { preserveState: true });
    };

    const handleGenerateBill = () => {
        setIsGenerating(true);
        router.post(
            route('teacher.billing.generate'),
            { billing_month: month },
            {
                preserveScroll: true,
                onFinish: () => setIsGenerating(false),
            }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('teacher.dashboard')}
                            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white">
                                    Faculty Remuneration
                                </span>
                                <span className="text-xs text-gray-500 font-semibold">
                                    Visiting Faculty Accounts Engine
                                </span>
                            </div>
                            <h2 className="text-xl font-black text-gray-900 mt-0.5 font-serif">
                                Visiting Faculty Monthly Billing & Claims
                            </h2>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Faculty Remuneration Billing - GIIMS" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                {!isVisiting ? (
                    <div className="p-8 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
                        <AlertCircle className="h-10 w-10 text-amber-600 mx-auto" />
                        <h3 className="text-base font-black text-amber-900 font-serif">
                            Regular / Permanent Faculty Account
                        </h3>
                        <p className="text-xs text-amber-700 max-w-lg mx-auto leading-relaxed">
                            Your faculty profile is registered under Regular Government Staff. Monthly session billing is designed specifically for contractual and visiting lecturers paid per teaching day.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Month Selector & Action Bar */}
                        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    Select Billing Month
                                </label>
                                <input
                                    type="month"
                                    value={month}
                                    onChange={handleMonthChange}
                                    className="text-xs rounded-xl border-gray-300 font-bold text-gray-900 focus:ring-govt-green focus:border-govt-green"
                                />
                            </div>

                            <div className="flex items-center space-x-3">
                                <button
                                    type="button"
                                    onClick={handleGenerateBill}
                                    disabled={isGenerating || daysCount <= 0 || dailyRate <= 0}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-govt-green to-emerald-700 hover:from-govt-green-light hover:to-emerald-600 disabled:opacity-40 text-white font-bold text-xs transition shadow-md shadow-govt-green/20 flex items-center space-x-2"
                                >
                                    <Receipt className="h-4 w-4" />
                                    <span>{isGenerating ? 'Generating Bill...' : 'Generate Official Monthly Bill'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Remuneration Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    Daily Remuneration Rate
                                </p>
                                <p className="text-2xl font-black text-gray-900 font-mono">
                                    PKR {Number(dailyRate).toLocaleString()}
                                </p>
                                <p className="text-[11px] text-gray-500">Per distinct session day taught</p>
                            </div>

                            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    Verified Days Taught
                                </p>
                                <p className="text-2xl font-black text-indigo-600 font-mono">
                                    {daysCount} Days
                                </p>
                                <p className="text-[11px] text-indigo-700">Calculated from classroom attendance</p>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-govt-green to-emerald-900 text-white border border-emerald-700 shadow-md space-y-1">
                                <p className="text-[11px] font-bold text-govt-gold uppercase tracking-wider">
                                    Total Claimable Remuneration
                                </p>
                                <p className="text-3xl font-black text-white font-mono">
                                    PKR {Number(estimatedAmount).toLocaleString()}
                                </p>
                                <p className="text-[11px] text-green-100">
                                    {daysCount} Days × PKR {dailyRate}
                                </p>
                            </div>
                        </div>

                        {/* Distinct Teaching Dates Breakdown */}
                        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
                            <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-govt-green" />
                                <span>Verified Teaching Dates Breakdown ({month})</span>
                            </h3>

                            {sessions.length === 0 ? (
                                <p className="text-xs text-gray-400 py-4 text-center">
                                    No classroom attendance sessions recorded in this month. Conduct and record attendance sessions to populate days taught.
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                                    {distinctDays.map((d, i) => (
                                        <div
                                            key={i}
                                            className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center space-y-0.5"
                                        >
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Day {i + 1}</p>
                                            <p className="font-mono font-bold text-xs text-gray-900">{d}</p>
                                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700">
                                                <Check className="h-2.5 w-2.5" />
                                                <span>Session Verified</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Remuneration Bills & Payment Slips History */}
                        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
                            <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-govt-green" />
                                <span>Submitted Remuneration Bills & Claim Invoices</span>
                            </h3>

                            {bills.length === 0 ? (
                                <p className="text-xs text-gray-400 py-6 text-center">
                                    No remuneration bills generated yet. Click "Generate Official Monthly Bill" above.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="text-gray-500 border-b border-gray-100">
                                                <th className="pb-3 font-semibold">Billing Month</th>
                                                <th className="pb-3 font-semibold">Days Taught</th>
                                                <th className="pb-3 font-semibold">Daily Rate</th>
                                                <th className="pb-3 font-semibold">Total Amount</th>
                                                <th className="pb-3 font-semibold">Status</th>
                                                <th className="pb-3 font-semibold text-right">Print Claim</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                                            {bills.map((b) => (
                                                <tr key={b.id} className="hover:bg-gray-50 transition">
                                                    <td className="py-3 font-bold text-gray-900">
                                                        {b.billing_month}
                                                        <p className="text-[10px] text-gray-400 font-normal">
                                                            Ref #BILL-{b.id}
                                                        </p>
                                                    </td>
                                                    <td className="py-3 font-mono font-bold text-indigo-700">
                                                        {b.total_days_taught} Days
                                                    </td>
                                                    <td className="py-3 font-mono">
                                                        PKR {Number(b.rate_per_day).toLocaleString()}
                                                    </td>
                                                    <td className="py-3 font-mono font-black text-gray-900 text-sm">
                                                        PKR {Number(b.total_amount).toLocaleString()}
                                                    </td>
                                                    <td className="py-3">
                                                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                            b.status === 'paid'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : b.status === 'approved'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                            <span>{b.status}</span>
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <Link
                                                            href={route('teacher.billing.show', b.id)}
                                                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-govt-green-50 hover:text-govt-green text-gray-700 text-xs font-bold transition border border-gray-200"
                                                        >
                                                            <Printer className="h-3.5 w-3.5" />
                                                            <span>Print Invoice</span>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
