import React from 'react';
import { Head } from '@inertiajs/react';
import { Printer, ArrowLeft, ShieldCheck, AlertCircle, FileText } from 'lucide-react';

export default function PrintAdmitCard({ cards = [], isBatch = false, batchTitle = 'Examination Slip' }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white text-slate-900">
            <Head title={isBatch ? batchTitle : `Admit Card - ${cards[0]?.student_name || 'PBTE'}`} />

            {/* Non-Printable Top Action Bar */}
            <div className="print:hidden sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 shadow-xs">
                <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Return</span>
                        </button>
                        <div className="h-4 w-px bg-slate-200" />
                        <div>
                            <h1 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-govt-green-600" />
                                <span>{isBatch ? batchTitle : `PBTE Roll No Slip: ${cards[0]?.student_name}`}</span>
                            </h1>
                            <p className="text-[11px] text-slate-500">
                                Standard A4 Print Ready • {cards.length} {cards.length === 1 ? 'Admit Card' : 'Admit Cards'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-govt-green-700 hover:bg-govt-green-800 transition shadow-sm"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Print Admit Card{cards.length > 1 ? 's' : ''} (A4)</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Admit Cards Container */}
            <div className="max-w-4xl mx-auto py-6 px-4 print:p-0 print:max-w-none space-y-8 print:space-y-0">
                {cards.map((card, cardIndex) => (
                    <div
                        key={card.id || cardIndex}
                        className="bg-white border-2 border-slate-900 rounded-none p-6 sm:p-8 shadow-md print:shadow-none print:border-2 print:border-black print:m-0 print:break-after-page min-h-[960px] flex flex-col justify-between"
                        style={{ pageBreakAfter: cardIndex < cards.length - 1 ? 'always' : 'auto' }}
                    >
                        {/* 1. OFFICIAL INSTITUTIONAL & BOARD HEADER */}
                        <div>
                            <div className="border-b-2 border-black pb-3 text-center relative">
                                <div className="flex items-center justify-between">
                                    <div className="w-16 h-16 border-2 border-dashed border-slate-400 rounded-md flex flex-col items-center justify-center text-center p-1">
                                        <span className="text-[9px] font-black uppercase text-slate-700">TEVTA</span>
                                        <span className="text-[8px] text-slate-500 leading-tight">Govt of Punjab</span>
                                    </div>

                                    <div className="flex-1 px-4">
                                        <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-black">
                                            PUNJAB BOARD OF TECHNICAL EDUCATION, LAHORE
                                        </h2>
                                        <h3 className="text-xs sm:text-sm font-bold uppercase text-slate-800 mt-0.5">
                                            GOVT. TECHNICAL TRAINING INSTITUTE (GTTI), RAHIM YAR KHAN
                                        </h3>
                                        <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
                                            OFFICIAL ADMIT CARD & ROLL NUMBER SLIP • ANNUAL EXAMINATION {card.session_year}
                                        </p>
                                    </div>

                                    <div className="w-16 h-16 border-2 border-dashed border-slate-400 rounded-md flex flex-col items-center justify-center text-center p-1">
                                        <span className="text-[9px] font-black uppercase text-slate-700">PBTE</span>
                                        <span className="text-[8px] text-slate-500 leading-tight">Examination Wing</span>
                                    </div>
                                </div>

                                <div className="mt-2 inline-block px-4 py-0.5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xs">
                                    PROVISIONAL ADMISSION TO EXAM HALL
                                </div>
                            </div>

                            {/* 2. CANDIDATE IDENTIFICATION DOSSIER & PHOTO/BARCODE */}
                            <div className="grid grid-cols-12 gap-4 mt-4 pb-4 border-b border-slate-300">
                                {/* Bio Details (9 cols) */}
                                <div className="col-span-9 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Roll Number:</span>
                                        <span className="text-base font-black font-mono text-black">{card.roll_number}</span>
                                    </div>

                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Registration Number:</span>
                                        <span className="text-sm font-bold font-mono text-slate-800">{card.registration_number}</span>
                                    </div>

                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Trainee / Candidate Name:</span>
                                        <span className="text-xs font-bold text-black uppercase">{card.student_name}</span>
                                    </div>

                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Father / Guardian Name:</span>
                                        <span className="text-xs font-semibold text-slate-800 uppercase">{card.father_name}</span>
                                    </div>

                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-500 block">CNIC / Form-B:</span>
                                        <span className="text-xs font-mono font-bold text-slate-800">{card.cnic}</span>
                                    </div>

                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Gender & Shift:</span>
                                        <span className="text-xs font-semibold text-slate-800">{card.gender} • {card.batch_name}</span>
                                    </div>

                                    <div className="col-span-2">
                                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Trade Course & Duration:</span>
                                        <span className="text-xs font-bold text-black">{card.course_name} ({card.course_duration})</span>
                                    </div>

                                    <div className="col-span-2">
                                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Examination Center:</span>
                                        <span className="text-xs font-semibold text-slate-900 leading-snug">
                                            {card.exam_center} <span className="font-mono font-bold text-slate-600">[{card.center_code}]</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Photo & Barcode (3 cols) */}
                                <div className="col-span-3 flex flex-col items-center justify-between border-l border-slate-300 pl-3">
                                    <div className="w-24 h-28 border-2 border-slate-400 bg-slate-50 flex flex-col items-center justify-center text-center p-1 relative">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Affix Passport Photo</span>
                                        <span className="text-[7px] text-slate-400 mt-1">Cross-Attested by Principal</span>
                                    </div>

                                    {/* CSS Barcode Representation */}
                                    <div className="w-full text-center mt-2">
                                        <div className="flex items-center justify-center space-x-0.5 h-6 overflow-hidden px-1">
                                            {[3,1,2,1,4,2,1,3,1,2,3,1,1,4,2,1,3,2,1,2,4,1,2,3,1,2,1,4].map((width, i) => (
                                                <div
                                                    key={i}
                                                    className="bg-black h-full"
                                                    style={{ width: `${width * 1.5}px` }}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[9px] font-mono tracking-widest block text-slate-700 font-bold mt-0.5">
                                            {card.barcode}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 3. EXAMINATION DATE SHEET / TIMETABLE */}
                            <div className="mt-4">
                                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1.5">
                                    <span>Prescribed Date Sheet & Exam Timetable</span>
                                </h4>

                                <table className="w-full border-collapse border border-black text-[11px]">
                                    <thead>
                                        <tr className="bg-slate-100 text-black border-b border-black">
                                            <th className="border border-black px-2 py-1 text-left font-bold w-12">Sr.</th>
                                            <th className="border border-black px-2 py-1 text-left font-bold w-24">Paper Code</th>
                                            <th className="border border-black px-2 py-1 text-left font-bold">Subject / Module Title</th>
                                            <th className="border border-black px-2 py-1 text-left font-bold w-20">Type</th>
                                            <th className="border border-black px-2 py-1 text-left font-bold w-28">Date</th>
                                            <th className="border border-black px-2 py-1 text-left font-bold w-36">Timing</th>
                                            <th className="border border-black px-2 py-1 text-left font-bold w-32">Lab / Hall</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {card.timetable.map((row, idx) => (
                                            <tr key={idx} className="border-b border-slate-300">
                                                <td className="border border-black px-2 py-1.5 text-center font-mono">{idx + 1}</td>
                                                <td className="border border-black px-2 py-1.5 font-mono font-bold text-black">{row.code}</td>
                                                <td className="border border-black px-2 py-1.5 font-semibold text-slate-900">{row.title}</td>
                                                <td className="border border-black px-2 py-1.5">
                                                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-slate-100 border border-slate-300">
                                                        {row.type}
                                                    </span>
                                                </td>
                                                <td className="border border-black px-2 py-1.5 font-semibold">{row.date}</td>
                                                <td className="border border-black px-2 py-1.5 font-mono text-[10px]">{row.time}</td>
                                                <td className="border border-black px-2 py-1.5 text-[10px]">{row.room}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* 4. IMPORTANT INSTRUCTIONS FOR CANDIDATE */}
                            <div className="mt-4 border border-slate-400 p-2.5 bg-slate-50 text-[10px] text-slate-700 leading-relaxed rounded-xs">
                                <h5 className="font-bold uppercase text-black mb-0.5">Mandatory Rules & Examination Hall Regulations:</h5>
                                <ol className="list-decimal list-inside space-y-0.5">
                                    <li>Candidate must bring this <strong>Original Admit Card</strong> along with <strong>Original CNIC / B-Form</strong> to every paper.</li>
                                    <li>Trainees must report to the examination hall at least <strong>30 minutes</strong> before the scheduled paper start time.</li>
                                    <li><strong>Mobile phones, smart watches, digital storage devices, and unauthorized books</strong> are strictly banned inside the exam hall.</li>
                                    <li>For workshop practical exams, candidates must wear standard <strong>Safety Shoes & Workshop Overalls</strong>.</li>
                                    <li>Any unfair means (cheating/impersonation) will result in immediate disqualification and cancellation of admission under PBTE rules.</li>
                                </ol>
                            </div>
                        </div>

                        {/* 5. VERIFICATION SEAL & DUAL SIGNATURE BLOCKS */}
                        <div className="pt-8 border-t-2 border-black mt-6">
                            <div className="grid grid-cols-3 gap-6 text-center text-xs">
                                <div>
                                    <div className="h-10 border-b border-black mb-1 flex items-end justify-center">
                                        <span className="text-[10px] text-slate-400 font-mono">Sign on paper day</span>
                                    </div>
                                    <p className="font-bold text-black uppercase text-[10px]">Candidate's Signature</p>
                                    <p className="text-[9px] text-slate-500">(To be signed in presence of Invigilator)</p>
                                </div>

                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-20 h-12 border border-dashed border-slate-400 rounded flex items-center justify-center text-center p-1">
                                        <span className="text-[8px] font-bold text-slate-400 uppercase">Institutional Official Stamp</span>
                                    </div>
                                    <p className="text-[9px] text-slate-500 mt-1">Issued Date: {card.issued_at}</p>
                                </div>

                                <div>
                                    <div className="h-10 border-b border-black mb-1 flex items-end justify-center">
                                        <span className="text-[10px] font-serif font-black text-slate-800 tracking-wider">M. Rafiq (Engr.)</span>
                                    </div>
                                    <p className="font-bold text-black uppercase text-[10px]">Controller of Examinations</p>
                                    <p className="text-[9px] text-slate-500">PBTE / GTTI Rahim Yar Khan</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
