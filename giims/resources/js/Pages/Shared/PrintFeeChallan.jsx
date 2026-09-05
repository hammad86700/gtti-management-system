import React from 'react';
import { Head } from '@inertiajs/react';
import { Printer, ArrowLeft, Download, Building2, Calendar, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function PrintFeeChallan({ voucher }) {
    const handlePrint = () => {
        window.print();
    };

    if (!voucher) {
        return (
            <div className="p-8 text-center text-slate-600">
                <p>No fee challan voucher data available.</p>
            </div>
        );
    }

    const copies = [
        { label: 'BANK COPY', note: 'To be retained by receiving Bank Branch' },
        { label: 'GTTI ACCOUNTS COPY', note: 'To be uploaded on Portal / Submitted to Accounts Desk' },
        { label: 'STUDENT / DEPOSITOR COPY', note: 'To be retained by Student as proof of payment' },
    ];

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white text-slate-900 font-sans">
            <Head title={`Official Admission Fee Challan - ${voucher.candidate_name} (${voucher.challan_number})`} />

            {/* Non-Printable Action Bar */}
            <div className="print:hidden sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 shadow-xs">
                <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Return to Portal</span>
                        </button>
                        <div className="h-4 w-px bg-slate-200" />
                        <div>
                            <h1 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-emerald-600" />
                                <span>Official Admission Fee Challan: {voucher.candidate_name}</span>
                            </h1>
                            <p className="text-[11px] text-slate-500 font-mono">
                                Voucher #{voucher.challan_number} • Due Date: {voucher.due_date}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2.5">
                        {voucher.clerk_challan_path && (
                            <a
                                href={route('applications.challan-document', voucher.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition shadow-xs"
                            >
                                <Download className="w-4 h-4" />
                                <span>Download Clerk Uploaded File</span>
                            </a>
                        )}

                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-sm cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Print Voucher (A4)</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Printable Container: 3 Copies for A4 Landscape or 3 Columns */}
            <div className="max-w-7xl mx-auto py-6 px-4 print:p-0 print:max-w-none">
                <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-3 bg-white p-4 print:p-2 border print:border-0 rounded-xl shadow-lg print:shadow-none">
                    {copies.map((copy, index) => (
                        <div
                            key={index}
                            className={`flex flex-col justify-between border-2 border-slate-900 p-3 sm:p-4 text-[10px] leading-tight space-y-2.5 relative ${
                                index < 2 ? 'md:border-r-2 md:border-dashed md:border-r-slate-500' : ''
                            }`}
                        >
                            {/* Copy Header Watermark */}
                            <div className="border-b-2 border-slate-900 pb-2 text-center space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[8px] font-black uppercase tracking-tighter text-slate-700">
                                        TEVTA PUNJAB
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-black text-[9px] uppercase tracking-wider">
                                        {copy.label}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-500">
                                        {voucher.application_number}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-black text-xs uppercase tracking-tight text-slate-950">
                                        GOVT. TECHNICAL TRAINING INSTITUTE
                                    </h3>
                                    <p className="text-[8px] text-slate-600">
                                        Khanpur Road, Near Sports Complex, Rahim Yar Khan • Ph: 068-9230123
                                    </p>
                                </div>
                                <div className="bg-slate-100 py-0.5 border border-slate-300 text-[8.5px] font-bold uppercase text-slate-800 tracking-wider">
                                    Official Admission Fee Voucher
                                </div>
                            </div>

                            {/* Bank Account Selection Info */}
                            <div className="bg-slate-50 p-2 rounded border border-slate-200 space-y-1 text-[8.5px]">
                                <div className="font-black text-slate-900 uppercase">Authorized Banks (Payable at any branch):</div>
                                <div className="flex justify-between border-b border-slate-200 pb-0.5">
                                    <span className="font-bold text-slate-800">1. National Bank (NBP):</span>
                                    <span className="font-mono font-bold text-slate-900">A/C: 4128901234 (Code: 0492)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold text-slate-800">2. Bank of Punjab (BOP):</span>
                                    <span className="font-mono font-bold text-slate-900">A/C: 65100099823 (Code: 0128)</span>
                                </div>
                            </div>

                            {/* Challan Number & Critical Due Date */}
                            <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                                <div className="border border-slate-300 p-1.5 rounded bg-slate-50/50">
                                    <span className="text-[7.5px] uppercase font-bold text-slate-500 block">Challan No.</span>
                                    <span className="font-black font-mono text-slate-950 text-[10px]">{voucher.challan_number}</span>
                                </div>
                                <div className="border-2 border-red-600 p-1.5 rounded bg-red-50 text-red-950">
                                    <span className="text-[7.5px] uppercase font-black text-red-700 block">
                                        LAST DATE TO PAY:
                                    </span>
                                    <span className="font-black text-red-900 text-[10px] block">
                                        {voucher.due_date}
                                    </span>
                                </div>
                            </div>

                            {/* Candidate Dossier */}
                            <table className="w-full text-left text-[9px] border-collapse border border-slate-200">
                                <tbody>
                                    <tr className="border-b border-slate-200">
                                        <td className="font-bold text-slate-600 p-1 bg-slate-50 w-24">Candidate:</td>
                                        <td className="font-bold text-slate-950 p-1">{voucher.candidate_name}</td>
                                    </tr>
                                    <tr className="border-b border-slate-200">
                                        <td className="font-bold text-slate-600 p-1 bg-slate-50">Father Name:</td>
                                        <td className="text-slate-900 p-1">{voucher.father_name}</td>
                                    </tr>
                                    <tr className="border-b border-slate-200">
                                        <td className="font-bold text-slate-600 p-1 bg-slate-50">CNIC / B-Form:</td>
                                        <td className="font-mono text-slate-900 p-1">{voucher.cnic}</td>
                                    </tr>
                                    <tr className="border-b border-slate-200">
                                        <td className="font-bold text-slate-600 p-1 bg-slate-50">Trade / Course:</td>
                                        <td className="font-black text-emerald-950 p-1">{voucher.course_name}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold text-slate-600 p-1 bg-slate-50">Duration:</td>
                                        <td className="text-slate-800 p-1">{voucher.duration} • Classes Start: {voucher.classes_start_date}</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Fee Heads Breakdown */}
                            <div className="space-y-1">
                                <div className="text-[8.5px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
                                    Particulars of Fee
                                </div>
                                <table className="w-full text-[9px]">
                                    <tbody>
                                        {voucher.fee_breakdown.map((item, i) => (
                                            <tr key={i} className="border-b border-slate-100">
                                                <td className="py-0.5 text-slate-700">{i + 1}. {item.head}</td>
                                                <td className="py-0.5 text-right font-mono text-slate-900">PKR {item.amount}</td>
                                            </tr>
                                        ))}
                                        <tr className="border-t-2 border-slate-900 font-black text-slate-950 bg-slate-100">
                                            <td className="py-1 px-1">TOTAL AMOUNT PAYABLE:</td>
                                            <td className="py-1 px-1 text-right font-mono text-[11px] text-emerald-900">
                                                PKR {voucher.amount.toLocaleString()}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className="text-[8px] italic text-slate-600 text-right">
                                    (Amount in Words: Three Thousand Five Hundred Rupees Only)
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="bg-amber-50/70 border border-amber-300 p-1.5 rounded text-[8px] text-amber-950 space-y-0.5">
                                <span className="font-bold block uppercase text-amber-900">Important Instructions:</span>
                                <p>1. Fee must be deposited on or before <strong>{voucher.due_date}</strong>.</p>
                                <p>2. After deposit, upload stamped customer copy on student portal.</p>
                                <p>3. Fee once deposited is non-refundable & non-transferable.</p>
                            </div>

                            {/* Signatures & Stamp Box */}
                            <div className="pt-4 border-t border-slate-300 grid grid-cols-2 gap-2 text-center text-[8px]">
                                <div className="space-y-4">
                                    <div className="h-6 border-b border-slate-400" />
                                    <span className="font-bold text-slate-700 block">Applicant Signature</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-6 border-b border-slate-400" />
                                    <span className="font-bold text-slate-700 block">Bank Officer Stamp & Sign</span>
                                </div>
                            </div>

                            <div className="text-[7.5px] text-slate-400 text-center font-mono pt-1">
                                {copy.note} • Issue Date: {voucher.issue_date}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
