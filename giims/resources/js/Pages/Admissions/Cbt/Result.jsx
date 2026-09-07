import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Award,
    Clock,
    FileText,
    ArrowRight,
    Building2,
    Printer
} from 'lucide-react';

export default function Result({ attempt, exam, matric_component = 0, test_component = 0, interview_venue = 'Lab 3 / Interview Room' }) {
    const isPassed = attempt?.entrance_marks_obtained >= exam?.passing_marks;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-govt-green selection:text-white font-sans p-4 sm:p-8">
            <Head title="Entrance Examination Result - GTTI RYK" />

            <div className="max-w-2xl mx-auto w-full space-y-6 my-auto">
                {/* Result Card */}
                <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-10 space-y-6 relative overflow-hidden text-center">
                    {/* Official TEVTA Institutional Crest */}
                    <div className="inline-flex p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xl mx-auto">
                        <img src="/images/tevta-logo.png" alt="TEVTA" className="h-16 w-16 object-contain" />
                    </div>

                    <div className="space-y-1">
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-800 text-emerald-400 border border-slate-700">
                            Govt Technical Training Institute Rahim Yar Khan
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
                            Entrance Examination Submitted
                        </h1>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                            Your answers have been instantly graded and securely logged into the academic admissions database.
                        </p>
                    </div>

                    {/* Score summary panel */}
                    <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800/80 space-y-4">
                        <div className="grid grid-cols-2 gap-4 divide-x divide-slate-800">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    CBT Test Marks Obtained
                                </span>
                                <p className="text-3xl font-black text-emerald-400 font-mono mt-1">
                                    {attempt?.cbt_score ?? attempt?.entrance_marks_obtained}
                                    <span className="text-sm text-slate-500 font-sans"> / {exam?.total_marks}</span>
                                </p>
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    isPassed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                                }`}>
                                    {isPassed ? 'Qualified Criteria' : 'Evaluated'}
                                </span>
                            </div>

                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Composite Merit Score
                                </span>
                                <p className="text-3xl font-black text-white font-mono mt-1">
                                    {attempt?.composite_score ?? attempt?.composite_merit_score}%
                                </p>
                                <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                                    Matric + CBT (+ Viva in progress)
                                </span>
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 grid grid-cols-2 gap-2 text-left">
                            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                                <span className="text-[10px] block text-slate-500 font-bold">Matric Component</span>
                                <span className="font-mono font-bold text-white text-sm">+{matric_component}%</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                                <span className="text-[10px] block text-slate-500 font-bold">Entrance Test Component</span>
                                <span className="font-mono font-bold text-emerald-400 text-sm">+{test_component}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Mandatory Post-Test Direction Notice */}
                    <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-200 text-left space-y-2">
                        <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                            <ArrowRight className="h-5 w-5 shrink-0" />
                            <span>Mandatory Post-Test Interview Direction:</span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">
                            Your test has been successfully submitted! Score Recorded: <strong>{attempt?.cbt_score ?? attempt?.entrance_marks_obtained} / {exam?.total_marks}</strong>. Please proceed immediately to <strong>{interview_venue}</strong> for your Viva Voce / Interview.
                        </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href={route('dashboard')}
                            className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-govt-green hover:from-emerald-400 hover:to-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md"
                        >
                            Go to Admission Desk
                        </Link>
                        <Link
                            href={route('admissions.cbt-exam.login')}
                            className="w-full sm:w-auto py-3 px-6 rounded-2xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
                        >
                            Log Out Terminal
                        </Link>
                    </div>
                </div>
            </div>

            <footer className="text-center text-xs text-slate-600 py-2">
                TEVTA Computer-Based Examination System • Govt Technical Training Institute RYK
            </footer>
        </div>
    );
}
