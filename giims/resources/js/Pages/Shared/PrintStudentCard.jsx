import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Printer,
    ArrowLeft,
    ShieldCheck,
    CreditCard,
    Camera,
    Phone,
    MapPin,
    AlertCircle,
    CheckCircle2,
    Calendar,
    Sparkles,
    User
} from 'lucide-react';

export default function PrintStudentCard({ card }) {
    const handlePrint = () => {
        window.print();
    };

    if (!card) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-center text-slate-600">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md">
                    <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-slate-800">Student Card Unavailable</h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Unable to find valid student profile or enrollment records.
                    </p>
                    <Link
                        href={route('dashboard')}
                        className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Return to Dashboard</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans print:bg-white print:text-black">
            <Head title={`Official Student ID Card - ${card.student_name} (${card.roll_number})`} />

            {/* Non-Printable Top Action Toolbar */}
            <div className="print:hidden sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 py-3 shadow-xs">
                <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Return to Dashboard</span>
                        </Link>
                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                        <div>
                            <h1 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Official GTTI Student ID Card: {card.student_name}</span>
                            </h1>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Roll #{card.roll_number} • {card.course_name}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2.5">
                        <Link
                            href={route('student.profile.edit')}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                            <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{card.has_photo ? 'Change Photo' : 'Upload Profile Photo'}</span>
                        </Link>

                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0B3B24] hover:bg-[#124E31] transition shadow-sm cursor-pointer"
                        >
                            <Printer className="w-4 h-4 text-amber-400" />
                            <span>Print / Save Card (PDF)</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Interactive & Printable Card Workspace */}
            <div className="max-w-5xl mx-auto py-8 px-4 print:p-0 print:m-0 print:max-w-none">
                
                {/* Photo Advisory Banner if student has not uploaded a photo yet */}
                {!card.has_photo && (
                    <div className="print:hidden mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 shrink-0">
                                <Camera className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold">No Profile Photo Uploaded</h4>
                                <p className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                                    Your student card is showing a placeholder. Upload your passport-size photo in your profile to display it on this card.
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('student.profile.edit')}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shrink-0"
                        >
                            <span>Upload Photo Now</span>
                        </Link>
                    </div>
                )}

                {/* Printable Instruction header for physical paper cutouts */}
                <div className="hidden print:block text-center pb-4 mb-4 border-b border-dashed border-slate-300">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                        Official TEVTA Punjab CR80 Student Identity Card • Cut along the dotted border
                    </p>
                </div>

                {/* Dual Card Container: Front & Back side side-by-side or stacked */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center print:grid-cols-2 print:gap-6 print:justify-center">
                    
                    {/* ══════════════════════════════════════════════════════
                        FRONT SIDE: OFFICIAL GTTI STUDENT ID CARD
                    ══════════════════════════════════════════════════════ */}
                    <div className="w-[390px] h-[250px] bg-white text-slate-900 rounded-2xl border-2 border-slate-300 shadow-xl overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-2 print:border-black print:rounded-xl">
                        
                        {/* Gold Top Accent Strip */}
                        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-[#C1902F] to-amber-500 shrink-0" />

                        {/* Card Header: Deep Pine Green with Institutional Crest */}
                        <div className="bg-[#0B3B24] text-white px-3.5 py-2 flex items-center justify-between shrink-0 border-b border-amber-400/40">
                            <div className="flex items-center space-x-2">
                                <div className="h-8 w-8 rounded-lg bg-white p-0.5 shadow-sm shrink-0 flex items-center justify-center">
                                    <img src="/images/tevta-logo.png" alt="TEVTA" className="h-full w-full object-contain" />
                                </div>
                                <div className="leading-tight">
                                    <h2 className="text-[10.5px] font-black tracking-tight uppercase text-white font-serif">
                                        GOVT. TECHNICAL TRAINING INSTITUTE
                                    </h2>
                                    <p className="text-[8px] font-bold tracking-wider text-amber-300 uppercase">
                                        RAHIM YAR KHAN • TEVTA PUNJAB
                                    </p>
                                </div>
                            </div>

                            <span className="text-[7.5px] font-black tracking-widest uppercase bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded shadow-2xs">
                                STUDENT
                            </span>
                        </div>

                        {/* Card Core: Photo + Student Details */}
                        <div className="flex-1 p-3 flex items-center space-x-3 bg-gradient-to-b from-white via-slate-50/50 to-white">
                            
                            {/* Photo Frame */}
                            <div className="w-24 h-28 rounded-xl border-2 border-[#0B3B24] p-0.5 bg-white shadow-sm shrink-0 flex flex-col items-center justify-between overflow-hidden">
                                {card.has_photo ? (
                                    <img
                                        src={card.profile_picture_url}
                                        alt={card.student_name}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-lg bg-slate-100 flex flex-col items-center justify-center text-slate-400 p-1">
                                        <User className="w-8 h-8 text-slate-300 mb-0.5" />
                                        <span className="text-[7px] font-black uppercase tracking-wider text-slate-500 text-center leading-tight">
                                            Photo Required
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Details Column */}
                            <div className="flex-1 min-w-0 space-y-1">
                                <div>
                                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 block leading-none">
                                        Candidate Name
                                    </span>
                                    <h3 className="text-xs font-black text-slate-900 truncate uppercase leading-tight mt-0.5">
                                        {card.student_name}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] leading-tight">
                                    <div>
                                        <span className="text-[7.5px] font-bold text-slate-400 uppercase block">Father's Name</span>
                                        <span className="font-bold text-slate-800 truncate block">{card.father_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-[7.5px] font-bold text-slate-400 uppercase block">Roll / Reg No</span>
                                        <span className="font-mono font-black text-[#0B3B24] truncate block">{card.roll_number}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-[7.5px] font-bold text-slate-400 uppercase block">Trade / Course</span>
                                        <span className="font-bold text-emerald-900 truncate block">{card.course_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-[7.5px] font-bold text-slate-400 uppercase block">Shift & Session</span>
                                        <span className="font-bold text-slate-700 truncate block">{card.shift} • {card.session_year}</span>
                                    </div>
                                    <div>
                                        <span className="text-[7.5px] font-bold text-slate-400 uppercase block">CNIC / Form-B</span>
                                        <span className="font-mono font-bold text-slate-700 truncate block">{card.cnic}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card Front Footer: Barcode & Authorized Signature */}
                        <div className="px-3.5 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                            {/* Simulated High-Res Barcode */}
                            <div className="flex flex-col items-start">
                                <div className="flex items-center space-x-0.5 h-4">
                                    {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2, 1, 3].map((w, i) => (
                                        <div
                                            key={i}
                                            className="bg-black h-full"
                                            style={{ width: `${w}px` }}
                                        />
                                    ))}
                                </div>
                                <span className="font-mono text-[6.5px] text-slate-600 mt-0.5">
                                    {card.barcode}
                                </span>
                            </div>

                            {/* Principal Stamp */}
                            <div className="text-right">
                                <span className="font-serif italic text-[8.5px] font-bold text-slate-700 block leading-none">
                                    Engr. Principal
                                </span>
                                <span className="text-[6.5px] uppercase tracking-wider font-extrabold text-slate-400 block mt-0.5">
                                    Authorized Signatory
                                </span>
                            </div>
                        </div>

                        {/* Bottom Pine Strip */}
                        <div className="h-1 bg-[#0B3B24] shrink-0" />
                    </div>

                    {/* ══════════════════════════════════════════════════════
                        BACK SIDE: TERMS, EMERGENCY & INSTITUTIONAL ADDRESS
                    ══════════════════════════════════════════════════════ */}
                    <div className="w-[390px] h-[250px] bg-white text-slate-900 rounded-2xl border-2 border-slate-300 shadow-xl overflow-hidden flex flex-col justify-between relative print:shadow-none print:border-2 print:border-black print:rounded-xl">
                        
                        {/* Top Green Strip */}
                        <div className="h-1.5 bg-[#0B3B24] shrink-0" />

                        {/* Back Header */}
                        <div className="px-3.5 py-1.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between shrink-0">
                            <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-700">
                                Institutional Regulations & Terms
                            </span>
                            <span className="text-[8px] font-mono text-emerald-800 font-bold">
                                VALID TILL: {card.valid_until}
                            </span>
                        </div>

                        {/* Back Content: Conduct Rules */}
                        <div className="flex-1 p-3 text-[8px] leading-relaxed text-slate-700 space-y-1.5">
                            <ol className="list-decimal list-inside space-y-1 font-medium">
                                <li>
                                    <strong>Property of GTTI:</strong> This card is the official property of Govt. Technical Training Institute, Rahim Yar Khan.
                                </li>
                                <li>
                                    <strong>Mandatory Display:</strong> Trainees must wear this card visibly inside classrooms, industrial workshops, and campus gate entry.
                                </li>
                                <li>
                                    <strong>Non-Transferable:</strong> Lending, duplicating, or altering this card is a punishable academic offense leading to suspension.
                                </li>
                                <li>
                                    <strong>Loss of Card:</strong> Loss must be reported immediately to the Administration Office for replacement upon standard fee.
                                </li>
                            </ol>

                            {/* Emergency Contact & Helpline Box */}
                            <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
                                <div>
                                    <span className="text-[7.5px] uppercase tracking-wider font-extrabold text-emerald-800 block">
                                        Emergency Contact / Phone
                                    </span>
                                    <span className="font-mono font-black text-[9px] block">
                                        {card.emergency_contact}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[7.5px] uppercase tracking-wider font-extrabold text-emerald-800 block">
                                        Campus Helpline
                                    </span>
                                    <span className="font-mono font-bold text-[9px] block">
                                        {card.institute_helpline}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Back Footer: Return Notice & Campus Address */}
                        <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-200 shrink-0 text-center leading-tight">
                            <p className="text-[7.5px] font-bold text-slate-600">
                                If found, please return to: {card.institute_name}
                            </p>
                            <p className="text-[7px] text-slate-500">
                                {card.institute_address} • Directorate of Technical Education, TEVTA Punjab
                            </p>
                        </div>

                        {/* Bottom Gold Strip */}
                        <div className="h-1 bg-[#C1902F] shrink-0" />
                    </div>
                </div>

                {/* Print Guidance Info Note (Screen only) */}
                <div className="print:hidden mt-8 max-w-xl mx-auto p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-xs text-slate-600 dark:text-slate-300 space-y-2 text-center">
                    <p className="font-bold text-slate-800 dark:text-white flex items-center justify-center space-x-1.5">
                        <Printer className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Printing & Digital Card Instructions:</span>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Click <strong>"Print / Save Card (PDF)"</strong> to open your browser print dialog. In the print settings, select <strong>"Save as PDF"</strong> or choose your PVC card / colour printer. Ensure <strong>"Background Graphics"</strong> is enabled in the print preview.
                    </p>
                </div>
            </div>
        </div>
    );
}
