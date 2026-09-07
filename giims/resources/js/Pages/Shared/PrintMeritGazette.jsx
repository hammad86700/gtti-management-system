import { Head } from '@inertiajs/react';
import { Printer, ArrowLeft } from 'lucide-react';

export default function PrintMeritGazette({ course, candidates = [], generatedAt }) {
    return (
        <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white text-slate-900 font-sans">
            <Head title={`TEVTA Merit Gazette - ${course?.name}`} />

            {/* Print Header Bar (Hidden in Print) */}
            <div className="max-w-7xl mx-auto mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between no-print">
                <div className="flex items-center space-x-3">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Merit Desk</span>
                    </button>
                    <span className="text-xs text-slate-500 font-medium">
                        Standard A4 Landscape Institutional Gazette
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider shadow-md transition"
                >
                    <Printer className="h-4 w-4" />
                    <span>Print Official Gazette</span>
                </button>
            </div>

            {/* Printable Gazette Paper Container */}
            <div className="max-w-7xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 print:border-0 print:p-0 print:shadow-none shadow-xl space-y-6">
                {/* Official Institutional Letterhead */}
                <div className="border-b-2 border-slate-900 pb-6 relative flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div className="h-20 w-20 shrink-0 flex items-center justify-center">
                        <img src="/images/tevta-logo.png" alt="TEVTA" className="h-full w-full object-contain" />
                    </div>
                    <div className="space-y-1 text-center flex-1">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono">
                            TECHNICAL EDUCATION & VOCATIONAL TRAINING AUTHORITY (TEVTA) PUNJAB
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase text-slate-950 tracking-tight">
                            GOVERNMENT TECHNICAL TRAINING INSTITUTE (GTTI) RAHIM YAR KHAN
                        </h1>
                        <h2 className="text-base sm:text-lg font-bold text-slate-800">
                            OFFICIAL PROVISIONAL MERIT GAZETTE — SESSION 2026–2027
                        </h2>
                        <div className="text-xs text-slate-600 font-medium flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1">
                            <span>Trade: <strong>{course?.name}</strong></span>
                            <span>•</span>
                            <span>Department: <strong>{course?.trade?.program?.department?.name || 'Vocational Training'}</strong></span>
                            <span>•</span>
                            <span>Generated: <strong>{generatedAt}</strong></span>
                        </div>
                    </div>
                </div>

                {/* Merit Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse border border-slate-300">
                        <thead className="bg-slate-100 text-slate-900 font-black uppercase text-[10px] tracking-wider border-b-2 border-slate-400">
                            <tr>
                                <th className="p-2.5 border border-slate-300 text-center w-12">Rank</th>
                                <th className="p-2.5 border border-slate-300 w-28">App No</th>
                                <th className="p-2.5 border border-slate-300">Candidate Name</th>
                                <th className="p-2.5 border border-slate-300">Father's Name</th>
                                <th className="p-2.5 border border-slate-300 w-32">CNIC</th>
                                <th className="p-2.5 border border-slate-300 text-center">Matric Marks</th>
                                <th className="p-2.5 border border-slate-300 text-center">CBT Score</th>
                                <th className="p-2.5 border border-slate-300 text-center">Viva Score</th>
                                <th className="p-2.5 border border-slate-300 text-center">Composite %</th>
                                <th className="p-2.5 border border-slate-300 text-center w-28">Final Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-800">
                            {candidates.map((cand, idx) => {
                                const isSelected = cand.selection_status === 'SELECTED';
                                const isFirstWaiting =
                                    cand.selection_status === 'WAITING' &&
                                    idx > 0 &&
                                    candidates[idx - 1]?.selection_status === 'SELECTED';

                                return (
                                    <>
                                        {isFirstWaiting && (
                                            <tr key={`div-${cand.application_number}`} className="bg-amber-100 text-slate-900 font-black text-center border-y-2 border-amber-500">
                                                <td colSpan="10" className="py-1.5 text-[10px] uppercase tracking-widest font-mono">
                                                    --- PROVISIONAL MERIT CUTOFF LINE • WAITING LIST COMMENCES BELOW ---
                                                </td>
                                            </tr>
                                        )}
                                        <tr
                                            key={cand.application_number}
                                            className={isSelected ? 'bg-emerald-50/50' : ''}
                                        >
                                            <td className="p-2 border border-slate-300 text-center font-mono font-bold">
                                                {cand.rank}
                                            </td>
                                            <td className="p-2 border border-slate-300 font-mono font-semibold">
                                                {cand.application_number}
                                            </td>
                                            <td className="p-2 border border-slate-300 font-bold text-slate-950">
                                                {cand.candidate_name}
                                            </td>
                                            <td className="p-2 border border-slate-300 text-slate-700">
                                                {cand.father_name}
                                            </td>
                                            <td className="p-2 border border-slate-300 font-mono text-slate-600">
                                                {cand.cnic}
                                            </td>
                                            <td className="p-2 border border-slate-300 text-center font-mono">
                                                {cand.matric_marks}
                                            </td>
                                            <td className="p-2 border border-slate-300 text-center font-mono font-bold">
                                                {cand.cbt_score}
                                            </td>
                                            <td className="p-2 border border-slate-300 text-center font-mono font-bold">
                                                {cand.interview_score}
                                            </td>
                                            <td className="p-2 border border-slate-300 text-center font-mono font-black text-slate-950 bg-slate-50">
                                                {cand.composite_score}
                                            </td>
                                            <td className="p-2 border border-slate-300 text-center font-bold">
                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono ${
                                                    isSelected
                                                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                                        : cand.selection_status === 'WAITING'
                                                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                                        : 'bg-rose-100 text-rose-900'
                                                }`}>
                                                    {cand.selection_status}
                                                </span>
                                            </td>
                                        </tr>
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Important Official Statutory Notice */}
                <div className="text-[10px] text-slate-600 leading-relaxed border-t border-slate-200 pt-4 space-y-1">
                    <p className="font-bold uppercase tracking-wider text-slate-800">
                        Important Admission Instructions & Disclaimers:
                    </p>
                    <p>
                        1. Selected candidates are strictly directed to deposit their admission fee and present original credentials at the GTTI Admissions Office within 3 working days.
                    </p>
                    <p>
                        2. Failure to deposit institutional dues by the stipulated deadline will result in automatic forfeiture of the seat, which will be awarded to the next candidate on the waiting list.
                    </p>
                    <p>
                        3. The Institute reserves the right to correct any inadvertent typographical errors or omissions.
                    </p>
                </div>

                {/* Triple Official Signature Blocks */}
                <div className="grid grid-cols-3 gap-8 pt-12 text-center text-xs font-bold text-slate-900">
                    <div className="space-y-1 border-t border-slate-900 pt-2">
                        <p className="uppercase">Course Instructor / In-Charge</p>
                        <p className="text-[10px] text-slate-500 font-normal">Department of {course?.trade?.name}</p>
                    </div>

                    <div className="space-y-1 border-t border-slate-900 pt-2">
                        <p className="uppercase">Admission Officer / Clerk</p>
                        <p className="text-[10px] text-slate-500 font-normal">Central Admissions Desk</p>
                    </div>

                    <div className="space-y-1 border-t border-slate-900 pt-2">
                        <p className="uppercase">Principal / Head of Institute</p>
                        <p className="text-[10px] text-slate-500 font-normal">GTTI Rahim Yar Khan</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
