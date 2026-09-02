import { Head, Link } from '@inertiajs/react';
import { Printer, ArrowLeft, Building2, CheckCircle2 } from 'lucide-react';

export default function Show({ bill, sessions = [] }) {
    const handlePrint = () => {
        window.print();
    };

    const user = bill.user;
    const dateObj = new Date(bill.billing_month + '-01');
    const monthName = dateObj.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

    // Distinct dates
    const distinctDates = [...new Set(sessions.map((s) => s.session_date))];

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
            <Head title={`Remuneration Bill #${bill.id} - ${monthName} - GIIMS`} />

            {/* Print Controls (Hidden on Print) */}
            <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <Link
                    href={route('teacher.billing.index')}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Billing</span>
                </Link>

                <button
                    onClick={handlePrint}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white text-xs font-black shadow-md transition"
                >
                    <Printer className="h-4 w-4" />
                    <span>Print Formal Claim Bill</span>
                </button>
            </div>

            {/* Formal Bill Sheet (A4 Proportion) */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-12 print:shadow-none print:border-none print:p-6 text-gray-900 font-serif space-y-6">

                {/* Header */}
                <div className="border-b-2 border-govt-green pb-4 text-center space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-govt-green font-sans">
                        GOVERNMENT OF THE PUNJAB • TEVTA
                    </p>
                    <h1 className="text-2xl font-black tracking-tight text-gray-950 uppercase">
                        Govt. Technical Training Institute, Rahim Yar Khan
                    </h1>
                    <p className="text-xs text-gray-700 font-sans">
                        Shahbazpur Road, Rahim Yar Khan • Accounts & Faculty Remuneration Section
                    </p>
                    <h2 className="text-sm font-black text-govt-gold-600 uppercase tracking-wider font-sans pt-1">
                        VISITING / GUEST FACULTY REMUNERATION CLAIM BILL
                    </h2>
                </div>

                {/* Meta Bar */}
                <div className="flex items-center justify-between text-xs font-sans border-b border-gray-200 pb-3">
                    <div>
                        <span className="font-bold text-gray-500">BILL INVOICE NO:</span>{' '}
                        <strong className="font-mono text-gray-900">GTTI/ACC/VF-BILL-{bill.id}/{new Date().getFullYear()}</strong>
                    </div>
                    <div>
                        <span className="font-bold text-gray-500">CLAIM FOR MONTH:</span>{' '}
                        <strong className="font-bold text-indigo-700">{monthName}</strong>
                    </div>
                </div>

                {/* Faculty Details Table */}
                <div className="font-sans text-xs space-y-2">
                    <h4 className="font-bold uppercase tracking-wider text-gray-700 text-[11px]">
                        1. Faculty Member Particulars
                    </h4>
                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div>
                            <span className="text-gray-500 font-bold">Name of Instructor:</span>{' '}
                            <strong>{user?.name}</strong>
                        </div>
                        <div>
                            <span className="text-gray-500 font-bold">Faculty Status:</span>{' '}
                            <strong>Visiting / Guest Lecturer (Contractual)</strong>
                        </div>
                        <div>
                            <span className="text-gray-500 font-bold">CNIC / Form-B No:</span>{' '}
                            <strong className="font-mono">{user?.cnic || 'N/A'}</strong>
                        </div>
                        <div>
                            <span className="text-gray-500 font-bold">Registered Email / Phone:</span>{' '}
                            <span>{user?.email} • {user?.phone || 'On Record'}</span>
                        </div>
                    </div>
                </div>

                {/* Calculation Summary Table */}
                <div className="font-sans text-xs space-y-2 pt-2">
                    <h4 className="font-bold uppercase tracking-wider text-gray-700 text-[11px]">
                        2. Remuneration Calculation & Claims Statement
                    </h4>
                    <table className="w-full text-left border border-gray-300">
                        <thead className="bg-gray-100 border-b border-gray-300">
                            <tr>
                                <th className="p-2.5 border-r border-gray-300">Description of Instructional Work</th>
                                <th className="p-2.5 border-r border-gray-300 text-center w-28">Total Days Taught</th>
                                <th className="p-2.5 border-r border-gray-300 text-center w-32">Approved Daily Rate</th>
                                <th className="p-2.5 text-right w-36">Gross Amount (PKR)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="p-3 border-r border-gray-200">
                                    <strong>Instructional Teaching & Practical Workshop Sessions</strong>
                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                        Verified classroom attendance sessions for month of {monthName}
                                    </p>
                                </td>
                                <td className="p-3 border-r border-gray-200 text-center font-mono font-bold text-gray-900">
                                    {bill.total_days_taught} Days
                                </td>
                                <td className="p-3 border-r border-gray-200 text-center font-mono text-gray-800">
                                    PKR {Number(bill.rate_per_day).toLocaleString()}
                                </td>
                                <td className="p-3 text-right font-mono font-black text-gray-900 text-sm">
                                    PKR {Number(bill.total_amount).toLocaleString()}
                                </td>
                            </tr>
                            <tr className="bg-gray-50 font-bold">
                                <td colSpan="3" className="p-2.5 text-right border-r border-gray-300 uppercase tracking-wider">
                                    Net Total Claim Amount Payable:
                                </td>
                                <td className="p-2.5 text-right font-mono text-base font-black text-govt-green">
                                    PKR {Number(bill.total_amount).toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Verified Teaching Dates Breakdown */}
                <div className="font-sans text-xs space-y-1.5 pt-2">
                    <h4 className="font-bold uppercase tracking-wider text-gray-700 text-[11px]">
                        3. Schedule of Verified Teaching Dates ({distinctDates.length} Distinct Session Days)
                    </h4>
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] leading-relaxed font-mono">
                        {distinctDates.join(' • ')}
                    </div>
                </div>

                {/* Declaration by Instructor */}
                <div className="font-sans text-xs bg-amber-50/60 border border-amber-200 p-3 rounded-xl space-y-1">
                    <strong className="text-amber-950">Declaration by Visiting Faculty Member:</strong>
                    <p className="text-amber-900 text-[11px] leading-relaxed">
                        I hereby declare that the sessions claimed above were personally conducted by me at GTTI Rahim Yar Khan for the assigned batches. Trainee attendance records have been digitally logged into GIIMS. No other remuneration has been drawn for these specific dates.
                    </p>
                </div>

                {/* Verification & Passing Order Boxes */}
                <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs font-sans">
                    <div className="border-t-2 border-gray-800 pt-2 space-y-0.5">
                        <p className="font-bold text-gray-900">{user?.name}</p>
                        <p className="text-[11px] text-gray-600">Visiting Faculty Signature</p>
                        <p className="text-[10px] text-gray-400">Date: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="border-t-2 border-gray-400 pt-2 space-y-0.5">
                        <p className="font-bold text-gray-700">Attendance Verified</p>
                        <p className="text-[11px] text-gray-600">Academic / In-Charge Officer</p>
                        <p className="text-[10px] text-gray-400">Official Verification Stamp</p>
                    </div>

                    <div className="border-t-2 border-govt-green pt-2 space-y-0.5">
                        <p className="font-bold text-gray-900">Passed for Payment</p>
                        <p className="text-[11px] text-gray-600">Principal / DDO</p>
                        <p className="text-[10px] text-emerald-700 font-bold">
                            {bill.status === 'paid' ? 'PAID & DISBURSED' : bill.status === 'approved' ? 'SANCTIONED' : 'AWAITING SANCTION'}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
