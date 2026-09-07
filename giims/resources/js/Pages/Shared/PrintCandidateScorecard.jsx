import { Head } from '@inertiajs/react';
import { Printer, ArrowLeft, Award, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function PrintCandidateScorecard({ attempt, candidate, course, scores, generatedAt }) {
    return (
        <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white text-slate-900 font-sans">
            <Head title={`Candidate Scorecard - ${candidate?.name}`} />

            {/* Print Header Bar (Hidden in Print) */}
            <div className="max-w-3xl mx-auto mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between no-print">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                </button>

                <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider shadow-md transition"
                >
                    <Printer className="h-4 w-4" />
                    <span>Print Scorecard</span>
                </button>
            </div>

            {/* Scorecard Sheet Container */}
            <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-slate-300 print:border-2 print:border-slate-800 print:p-6 print:shadow-none shadow-xl space-y-6 relative overflow-hidden">
                {/* Institute Watermark */}
                <div className="absolute right-4 bottom-10 text-slate-900/5 font-black text-9xl font-serif select-none pointer-events-none">
                    TEVTA
                </div>

                {/* Letterhead Header */}
                <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="h-16 w-16 shrink-0 flex items-center justify-center">
                        <img src="/images/tevta-logo.png" alt="TEVTA" className="h-full w-full object-contain" />
                    </div>
                    <div className="text-center flex-1 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">
                            GOVERNMENT OF THE PUNJAB • TEVTA
                        </span>
                        <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-950">
                            Government Technical Training Institute (GTTI)
                        </h1>
                        <p className="text-xs text-slate-600 font-semibold">
                            Rahim Yar Khan, Punjab, Pakistan
                        </p>
                        <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 bg-slate-100 py-1 rounded-md mt-2">
                            Official Entrance Examination & Merit Scorecard
                        </h2>
                    </div>
                    <div className="h-16 w-16 shrink-0 hidden sm:block opacity-0" />
                </div>

                {/* Candidate Particulars Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Candidate Name</span>
                        <p className="font-black text-slate-900 text-sm">{candidate.name}</p>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Father's Name</span>
                        <p className="font-bold text-slate-800">{candidate.father_name}</p>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">CNIC / Form-B</span>
                        <p className="font-mono font-bold text-slate-800">{candidate.cnic}</p>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Application Number</span>
                        <p className="font-mono font-black text-slate-900">{attempt.application_number}</p>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Applied Technical Trade</span>
                        <p className="font-black text-slate-900 text-sm">{course.name} ({course.trade})</p>
                    </div>
                </div>

                {/* Evaluated Marks Breakdown Table */}
                <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                        Component Marks & Composite Score Calculation
                    </h3>
                    <table className="w-full text-left text-xs border-collapse border border-slate-300">
                        <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px] tracking-wider border-b border-slate-300">
                            <tr>
                                <th className="p-2 border border-slate-300">Evaluation Component</th>
                                <th className="p-2 border border-slate-300 text-center">Marks Obtained</th>
                                <th className="p-2 border border-slate-300 text-center">Total Marks</th>
                                <th className="p-2 border border-slate-300 text-center">Assigned Weightage</th>
                                <th className="p-2 border border-slate-300 text-center">Weighted Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                            <tr>
                                <td className="p-2 border border-slate-300 font-bold">1. Secondary School (Matric)</td>
                                <td className="p-2 border border-slate-300 text-center font-mono">{scores.matric.obtained ?? '—'}</td>
                                <td className="p-2 border border-slate-300 text-center font-mono">{scores.matric.total}</td>
                                <td className="p-2 border border-slate-300 text-center font-mono">{scores.matric.weightage}%</td>
                                <td className="p-2 border border-slate-300 text-center font-mono font-bold">{scores.matric.weighted}%</td>
                            </tr>
                            <tr>
                                <td className="p-2 border border-slate-300 font-bold">2. CBT Entrance Examination</td>
                                <td className="p-2 border border-slate-300 text-center font-mono">{scores.cbt.obtained}</td>
                                <td className="p-2 border border-slate-300 text-center font-mono">{scores.cbt.total}</td>
                                <td className="p-2 border border-slate-300 text-center font-mono">{scores.cbt.weightage}%</td>
                                <td className="p-2 border border-slate-300 text-center font-mono font-bold">{scores.cbt.weighted}%</td>
                            </tr>
                            <tr>
                                <td className="p-2 border border-slate-300 font-bold">3. Viva Voce / Practical Interview</td>
                                <td className="p-2 border border-slate-300 text-center font-mono">{scores.viva.obtained}</td>
                                <td className="p-2 border border-slate-300 text-center font-mono">{scores.viva.total}</td>
                                <td className="p-2 border border-slate-300 text-center font-mono">{scores.viva.weightage}%</td>
                                <td className="p-2 border border-slate-300 text-center font-mono font-bold">{scores.viva.weighted}%</td>
                            </tr>
                            <tr className="bg-slate-50 font-black text-slate-950 border-t-2 border-slate-800">
                                <td colSpan="4" className="p-2.5 border border-slate-300 text-right uppercase tracking-wider text-xs">
                                    Final Composite Merit Score:
                                </td>
                                <td className="p-2.5 border border-slate-300 text-center text-sm font-mono text-emerald-800">
                                    {attempt.composite_score}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Final Status Banner */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-300 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Merit Standing</span>
                        <p className="text-xl font-black text-slate-900 font-mono">
                            Merit Position: #{attempt.merit_rank}
                        </p>
                    </div>

                    <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Final Admission Decision</span>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider font-mono ${
                            attempt.selection_status === 'SELECTED'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-400'
                                : attempt.selection_status === 'WAITING'
                                ? 'bg-amber-100 text-amber-900 border border-amber-400'
                                : 'bg-slate-200 text-slate-800'
                        }`}>
                            {attempt.selection_status}
                        </span>
                    </div>
                </div>

                {/* Remarks & Signatures */}
                <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs font-bold text-slate-900">
                    <div className="space-y-1 border-t border-slate-800 pt-2">
                        <p className="uppercase">{attempt.evaluator_name}</p>
                        <p className="text-[10px] text-slate-500 font-normal">Authorized Examiner / Interviewer</p>
                    </div>

                    <div className="space-y-1 border-t border-slate-800 pt-2">
                        <p className="uppercase">Admission Officer</p>
                        <p className="text-[10px] text-slate-500 font-normal">GTTI Rahim Yar Khan</p>
                    </div>
                </div>

                <div className="text-[9px] text-slate-400 text-center font-mono pt-4 border-t border-slate-100">
                    Verification Stamp: GTTI-SEC-{attempt.id}-{new Date().getFullYear()} • Generated: {generatedAt}
                </div>
            </div>
        </div>
    );
}
