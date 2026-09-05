import React from 'react';
import { Head } from '@inertiajs/react';
import { Printer, ArrowLeft, ShieldCheck, AlertCircle, FileText, CheckCircle2, MapPin, Calendar, Clock, User } from 'lucide-react';

export default function PrintEntranceAdmitCard({ card }) {
    const handlePrint = () => {
        window.print();
    };

    if (!card) {
        return (
            <div className="p-8 text-center text-slate-600">
                <p>No admit card data available.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white text-slate-900 font-sans">
            <Head title={`Entrance Test Roll No Slip - ${card.candidate_name} (${card.roll_number})`} />

            {/* Non-Printable Top Action Bar */}
            <div className="print:hidden sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 shadow-xs">
                <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Return to Portal</span>
                        </button>
                        <div className="h-4 w-px bg-slate-200" />
                        <div>
                            <h1 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-emerald-600" />
                                <span>Entrance Test Roll No Slip: {card.candidate_name}</span>
                            </h1>
                            <p className="text-[11px] text-slate-500">
                                Official TEVTA / GTTI A4 Print Format • Roll #{card.roll_number}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-sm cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Print Roll No Slip (A4)</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Printable Document Container */}
            <div className="max-w-4xl mx-auto py-6 px-4 print:p-0 print:max-w-none">
                <div className="bg-white border-2 border-black rounded-none p-6 sm:p-8 shadow-lg print:shadow-none print:border-2 print:border-black print:m-0 min-h-[980px] flex flex-col justify-between">
                    
                    <div>
                        {/* 1. OFFICIAL INSTITUTIONAL & BOARD HEADER */}
                        <div className="border-b-2 border-black pb-3 text-center relative">
                            <div className="flex items-center justify-between">
                                {/* Left: Govt of Punjab Seal Text */}
                                <div className="text-left w-28 shrink-0">
                                    <div className="h-14 w-14 rounded-full border-2 border-emerald-800 flex items-center justify-center p-1 bg-emerald-50">
                                        <span className="text-[9px] font-black text-emerald-900 text-center uppercase tracking-tighter leading-tight">
                                            GOVT OF PUNJAB
                                        </span>
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-600 uppercase block mt-1 tracking-widest">
                                        TEVTA PUNJAB
                                    </span>
                                </div>

                                {/* Center: Institute Dossier Title */}
                                <div className="space-y-0.5 flex-1 px-2">
                                    <p className="text-xs font-bold tracking-widest text-slate-600 uppercase">
                                        Technical Education & Vocational Training Authority (TEVTA)
                                    </p>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                                        GOVT. TECHNICAL TRAINING INSTITUTE
                                    </h2>
                                    <p className="text-xs font-semibold text-slate-700">
                                        Khanpur Road, Rahim Yar Khan • Ph: 068-9230153
                                    </p>
                                    <div className="inline-block mt-1 px-4 py-0.5 bg-black text-white text-xs font-black uppercase tracking-widest">
                                        ENTRANCE TEST ROLL NUMBER SLIP / ADMIT CARD
                                    </div>
                                </div>

                                {/* Right: Photo Placeholder */}
                                <div className="w-28 shrink-0 flex flex-col items-end">
                                    <div className="w-24 h-28 border-2 border-dashed border-black flex flex-col items-center justify-center bg-slate-50 text-center p-1">
                                        <User className="w-8 h-8 text-slate-400 mb-1" />
                                        <span className="text-[8px] font-bold text-slate-500 uppercase leading-tight">
                                            Affix 1 Passport Size Photo
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. ROLL NUMBER & QUICK IDENTIFIERS BANNER */}
                        <div className="mt-3 bg-slate-100 border border-black p-2.5 flex items-center justify-between text-xs">
                            <div>
                                <span className="text-[10px] font-bold text-slate-600 uppercase block">Entrance Roll Number</span>
                                <span className="text-base font-black font-mono text-slate-900 tracking-wider">
                                    {card.roll_number}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-600 uppercase block">Application Number</span>
                                <span className="text-xs font-black font-mono text-slate-900">
                                    {card.application_number}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold text-slate-600 uppercase block">Security Barcode Code</span>
                                <span className="text-xs font-mono font-black tracking-widest text-slate-900">
                                    {card.barcode}
                                </span>
                            </div>
                        </div>

                        {/* 3. CANDIDATE BIO-DATA TABLE */}
                        <div className="mt-3 border border-black">
                            <div className="bg-slate-900 text-white px-3 py-1 text-[11px] font-black uppercase tracking-wider">
                                1. Candidate Identification & Applied Trade
                            </div>
                            <table className="w-full text-xs">
                                <tbody>
                                    <tr className="border-b border-black">
                                        <td className="w-1/4 bg-slate-100 font-bold p-2 border-r border-black uppercase text-[10px]">Candidate Full Name</td>
                                        <td className="w-1/4 p-2 font-black border-r border-black">{card.candidate_name}</td>
                                        <td className="w-1/4 bg-slate-100 font-bold p-2 border-r border-black uppercase text-[10px]">Father's Name</td>
                                        <td className="w-1/4 p-2 font-bold">{card.father_name}</td>
                                    </tr>
                                    <tr className="border-b border-black">
                                        <td className="bg-slate-100 font-bold p-2 border-r border-black uppercase text-[10px]">CNIC / B-Form Number</td>
                                        <td className="p-2 font-mono font-bold border-r border-black">{card.cnic}</td>
                                        <td className="bg-slate-100 font-bold p-2 border-r border-black uppercase text-[10px]">Contact Mobile</td>
                                        <td className="p-2 font-mono">{card.phone}</td>
                                    </tr>
                                    <tr className="border-b border-black">
                                        <td className="bg-slate-100 font-bold p-2 border-r border-black uppercase text-[10px]">Applied Course / Trade</td>
                                        <td className="p-2 font-black border-r border-black text-emerald-950">{card.course_name}</td>
                                        <td className="bg-slate-100 font-bold p-2 border-r border-black uppercase text-[10px]">Duration & Trade</td>
                                        <td className="p-2 font-medium">{card.duration} ({card.trade_name})</td>
                                    </tr>
                                    <tr>
                                        <td className="bg-slate-100 font-bold p-2 border-r border-black uppercase text-[10px]">Domicile District</td>
                                        <td className="p-2 border-r border-black font-semibold">{card.district}</td>
                                        <td className="bg-slate-100 font-bold p-2 border-r border-black uppercase text-[10px]">Residential Address</td>
                                        <td className="p-2 text-[11px] truncate max-w-[200px]" title={card.address}>{card.address}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 4. ENTRANCE EXAMINATION SCHEDULE & VENUE */}
                        <div className="mt-4 border-2 border-black bg-emerald-50/40 p-4">
                            <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-emerald-950 pb-2 border-b border-emerald-900/30">
                                <Clock className="w-4 h-4 text-emerald-800" />
                                <span>2. Official Examination Schedule & Test Center</span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                                <div className="bg-white border border-black p-3 text-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Examination Date</span>
                                    <span className="text-sm font-black text-slate-900 block mt-0.5">{card.test_date}</span>
                                </div>
                                <div className="bg-white border border-black p-3 text-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Reporting & Test Time</span>
                                    <span className="text-sm font-black text-emerald-800 block mt-0.5">{card.test_time}</span>
                                    <span className="text-[9px] text-rose-700 font-bold uppercase block mt-0.5">Gates Close 15 Mins Before</span>
                                </div>
                                <div className="bg-white border border-black p-3 text-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Designated Test Hall</span>
                                    <span className="text-xs font-bold text-slate-900 block mt-0.5 leading-tight">
                                        {card.test_venue}
                                    </span>
                                </div>
                            </div>

                            {card.clerk_notice && (
                                <div className="mt-3 bg-amber-50 border border-amber-300 p-2.5 text-xs text-amber-950">
                                    <strong>Admission Office Special Note:</strong> {card.clerk_notice}
                                </div>
                            )}
                        </div>

                        {/* 5. MANDATORY CANDIDATE EXAMINATION REGULATIONS */}
                        <div className="mt-4 border border-black p-3 bg-slate-50 text-[11px] leading-relaxed">
                            <div className="font-black uppercase tracking-wider text-slate-900 mb-1.5 flex items-center space-x-1.5 text-xs">
                                <AlertCircle className="w-4 h-4 text-rose-600" />
                                <span>3. Mandatory Examination Rules & Candidate Instructions</span>
                            </div>
                            <ol className="list-decimal list-inside space-y-1 text-slate-800 font-medium">
                                <li>
                                    <strong>Original Identity Document:</strong> Candidate must bring original CNIC / Smart Card or NADRA B-Form. Photocopies will NOT be accepted under any circumstances.
                                </li>
                                <li>
                                    <strong>Printed Roll Number Slip:</strong> Entry into the examination hall is strictly prohibited without this original printed Roll No Slip.
                                </li>
                                <li>
                                    <strong>Test Materials:</strong> Bring your own hard clipboard, transparent stationery pouch, and blue/black ballpoint pens. Use of lead pencils on OMR/answer sheet is strictly prohibited.
                                </li>
                                <li>
                                    <strong>Electronic Devices Prohibited:</strong> Mobile phones, smart watches, calculators, Bluetooth earpieces, or digital gadgets are strictly banned inside the examination compound. GTTI management accepts no liability for confiscated items.
                                </li>
                                <li>
                                    <strong>Reporting Protocol:</strong> Report to the Examination Hall at least 30 minutes before the scheduled time. No candidate will be admitted after the exam paper has commenced.
                                </li>
                                <li>
                                    <strong>Merit Gazette:</strong> Official Merit List will be published on the GTTI portal following test and interview compilation.
                                </li>
                            </ol>
                        </div>
                    </div>

                    {/* 6. SIGNATURES & OFFICIAL SEALS */}
                    <div className="mt-8 pt-4 border-t-2 border-black">
                        <div className="grid grid-cols-3 gap-4 text-center text-xs">
                            <div>
                                <div className="h-10 border-b border-black mb-1"></div>
                                <span className="font-bold text-slate-800 uppercase text-[10px] block">
                                    Candidate Signature
                                </span>
                                <span className="text-[9px] text-slate-500">(To be signed in exam hall)</span>
                            </div>
                            <div>
                                <div className="h-10 border-b border-black mb-1 flex items-end justify-center pb-1">
                                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest font-mono">
                                        VERIFIED & SCRUTINIZED
                                    </span>
                                </div>
                                <span className="font-bold text-slate-800 uppercase text-[10px] block">
                                    Admission Clerk / Scrutinizer
                                </span>
                                <span className="text-[9px] text-slate-500">Official Verification Desk</span>
                            </div>
                            <div>
                                <div className="h-10 border-b border-black mb-1 flex items-end justify-center pb-1">
                                    <span className="text-[9px] font-serif font-black uppercase text-slate-700">
                                        Controller of Examinations
                                    </span>
                                </div>
                                <span className="font-bold text-slate-800 uppercase text-[10px] block">
                                    Principal / Admission Committee
                                </span>
                                <span className="text-[9px] text-slate-500">GTTI Rahim Yar Khan</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-2 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500">
                            <span>Printed from GTTI Management System (GIIMS)</span>
                            <span>Issue Timestamp: {card.issued_at}</span>
                            <span>Official Govt Document • Valid for Session 2026-2027</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
