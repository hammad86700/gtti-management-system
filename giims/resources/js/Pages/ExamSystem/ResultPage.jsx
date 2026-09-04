import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    XCircle,
    Award,
    Printer,
    ArrowLeft,
    Clock,
    User,
    Building2,
    Sparkles
} from 'lucide-react';

export default function ResultPage({ attempt, student, test }) {
    const isPassed = attempt.percentage >= (test?.passing_percentage ?? 50);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-[#070D12] text-slate-100 flex flex-col justify-between selection:bg-[#C1902F] selection:text-white font-sans p-4 sm:p-8 antialiased">
            <Head title={`Examination Result - ${student.name}`} />

            <style>{`
                @media print {
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-card {
                        border: 2px solid #000 !important;
                        background: white !important;
                        color: black !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>

            <div className="max-w-2xl mx-auto w-full space-y-6 my-auto">
                <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-10 space-y-6 text-center print-card relative overflow-hidden">
                    {/* Status Badge Icon */}
                    <div className={`inline-flex p-4 rounded-3xl border mx-auto shadow-xl ${
                        isPassed
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                        {isPassed ? (
                            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                        ) : (
                            <XCircle className="h-12 w-12 text-rose-400" />
                        )}
                    </div>

                    <div className="space-y-1">
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-800 text-[#C1902F] border border-slate-700">
                            Govt Technical Training Institute Rahim Yar Khan
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
                            Official Examination Result Sheet
                        </h1>
                        <p className="text-xs text-slate-400">
                            Academic Assessment & Viva Voce Evaluation
                        </p>
                    </div>

                    {/* Candidate Identity Box */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-left grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Candidate</span>
                            <span className="font-bold text-white text-sm">{student.name}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">CNIC / ID</span>
                            <span className="font-mono text-slate-300">{student.cnic}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Batch</span>
                            <span className="text-slate-300">{student.batch}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Trade</span>
                            <span className="text-slate-300 truncate">{student.course}</span>
                        </div>
                    </div>

                    {/* Score Matrix */}
                    <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                        <div className="grid grid-cols-3 gap-3 divide-x divide-slate-800 text-center">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Computer MCQ Score
                                </span>
                                <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1">
                                    {attempt.score ?? 0}
                                    <span className="text-xs text-slate-500 font-sans"> / {attempt.total_questions ?? 0}</span>
                                </p>
                            </div>

                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Viva / Practical Marks
                                </span>
                                <p className="text-2xl sm:text-3xl font-black text-blue-400 font-mono mt-1">
                                    {attempt.practical_marks !== null ? attempt.practical_marks : '—'}
                                    <span className="text-xs text-slate-500 font-sans"> / {test?.practical_marks ?? 5}</span>
                                </p>
                                {attempt.practical_marks === null && (
                                    <span className="text-[10px] text-slate-500 block">Pending Viva</span>
                                )}
                            </div>

                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Grand Total & Result
                                </span>
                                <p className={`text-2xl sm:text-3xl font-black font-mono mt-1 ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {attempt.percentage ?? 0}%
                                </p>
                                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                    isPassed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                                }`}>
                                    {isPassed ? 'PASSED' : 'FAILED'}
                                </span>
                            </div>
                        </div>

                        {attempt.practical_remarks && (
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-left text-xs text-slate-300">
                                <span className="font-bold text-slate-400 block text-[10px] uppercase">Interviewer Remarks:</span>
                                <span>{attempt.practical_remarks}</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 no-print">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="w-full sm:w-auto py-3 px-6 rounded-2xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center justify-center space-x-2"
                        >
                            <Printer className="h-4 w-4" />
                            <span>Print Result Card</span>
                        </button>

                        <Link
                            href={route('exam-system.login')}
                            className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-[#C1902F] via-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center space-x-1.5"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Exit Terminal</span>
                        </Link>
                    </div>
                </div>
            </div>

            <footer className="text-center text-xs text-slate-600 py-2 no-print">
                TEVTA Local Intranet Examination Portal • Govt Technical Training Institute RYK
            </footer>
        </div>
    );
}
