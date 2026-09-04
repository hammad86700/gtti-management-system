import { Head, useForm, usePage } from '@inertiajs/react';
import {
    ShieldCheck,
    Computer,
    Clock,
    CheckCircle2,
    AlertCircle,
    Info,
    ArrowRight,
    Lock
} from 'lucide-react';

export default function Login() {
    const { errors, flash } = usePage().props;

    const { data, setData, post, processing } = useForm({
        cnic: '',
        application_number: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admissions.cbt-exam.verify'));
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-govt-green selection:text-white font-sans">
            <Head title="Admission CBT Entrance Examination - GTTI RYK" />

            {/* Top Institutional Header */}
            <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-2xl bg-govt-green/20 border border-govt-green/40 flex items-center justify-center text-govt-green shrink-0 shadow-inner">
                            <Computer className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                Govt Technical Training Institute Rahim Yar Khan
                            </span>
                            <h1 className="text-sm sm:text-base font-black text-white tracking-tight">
                                Computer-Based Testing (CBT) Entrance Lab
                            </h1>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-mono">Lab Intranet Node Active</span>
                    </div>
                </div>
            </header>

            {/* Main Center Card */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
                <div className="w-full max-w-lg space-y-6">
                    {/* Live status alert error */}
                    {errors.live_status && (
                        <div className="p-5 rounded-3xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-start space-x-3 shadow-xl animate-fade-in">
                            <Lock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                            <div className="space-y-1">
                                <p className="font-bold text-amber-100 text-sm">Test Currently Locked</p>
                                <p className="leading-relaxed text-amber-200/90">{errors.live_status}</p>
                            </div>
                        </div>
                    )}

                    {flash?.info && (
                        <div className="p-5 rounded-3xl bg-blue-500/15 border border-blue-500/40 text-blue-200 text-xs flex items-start space-x-3 shadow-xl animate-fade-in">
                            <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-bold text-blue-100 text-sm">Exam Information</p>
                                <p className="leading-relaxed text-blue-200/90">{flash.info}</p>
                            </div>
                        </div>
                    )}

                    {/* Entry Form Card */}
                    <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-10 space-y-6 relative overflow-hidden">
                        <div className="space-y-2 text-center">
                            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-1">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                                Candidate Lab Verification
                            </h2>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                Enter your national identity card and application ID to unlock your timed examination terminal.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            <div className="space-y-1">
                                <label className="block font-bold text-slate-300">
                                    Candidate CNIC / Form B *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 31201-1234567-1"
                                    value={data.cnic}
                                    onChange={(e) => setData('cnic', e.target.value)}
                                    className="w-full p-3 rounded-2xl border border-slate-700 bg-slate-950 text-white font-mono text-sm tracking-wider focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                {errors.cnic && (
                                    <p className="text-rose-400 text-[11px] font-medium mt-1">{errors.cnic}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="block font-bold text-slate-300">
                                    Application Number *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. APP-2026-0001"
                                    value={data.application_number}
                                    onChange={(e) => setData('application_number', e.target.value)}
                                    className="w-full p-3 rounded-2xl border border-slate-700 bg-slate-950 text-white font-mono text-sm tracking-wider focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                {errors.application_number && (
                                    <p className="text-rose-400 text-[11px] font-medium mt-1">{errors.application_number}</p>
                                )}
                            </div>

                            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                                <div className="flex items-center space-x-1.5 text-slate-300 font-bold">
                                    <Clock className="h-3.5 w-3.5 text-emerald-400" />
                                    <span>Examination Security Notice:</span>
                                </div>
                                <p>
                                    Your test countdown will commence immediately upon authentication. Do not refresh or close your browser once the test starts.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-govt-green hover:from-emerald-400 hover:to-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                                <span>{processing ? 'Verifying Terminal...' : 'Begin Entrance Test'}</span>
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 px-4 text-center text-xs text-slate-500">
                Government Technical Training Institute (GTTI) Rahim Yar Khan • TEVTA Punjab Examination Directorate
            </footer>
        </div>
    );
}
