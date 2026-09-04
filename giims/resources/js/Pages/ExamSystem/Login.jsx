import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ShieldCheck,
    Computer,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Lock,
    User,
    Sparkles,
    Calendar,
    GraduationCap
} from 'lucide-react';

function Seal({ size = 96 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
            className="mx-auto"
        >
            <circle cx="50" cy="50" r="47" stroke="#C1902F" strokeWidth="1.4" />
            <circle cx="50" cy="50" r="40" stroke="#C1902F" strokeWidth="1" strokeDasharray="1.5 4" />
            {Array.from({ length: 36 }).map((_, i) => {
                const angle = (i * 10 * Math.PI) / 180;
                const r1 = 44;
                const r2 = i % 3 === 0 ? 40 : 42;
                const x1 = 50 + r1 * Math.cos(angle);
                const y1 = 50 + r1 * Math.sin(angle);
                const x2 = 50 + r2 * Math.cos(angle);
                const y2 = 50 + r2 * Math.sin(angle);
                return (
                    <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#C1902F"
                        strokeWidth="0.8"
                        opacity="0.8"
                    />
                );
            })}
            <g stroke="#C1902F" strokeWidth="1.6" strokeLinecap="round" fill="none">
                <path d="M50 30 L38 62" />
                <path d="M50 30 L62 62" />
                <circle cx="50" cy="28" r="2.6" fill="#C1902F" stroke="none" />
                <circle cx="38" cy="64" r="1.8" fill="#C1902F" stroke="none" />
                <circle cx="62" cy="64" r="1.8" fill="#C1902F" stroke="none" />
                <path d="M42 52 L58 52" strokeWidth="1.2" opacity="0.85" />
            </g>
            <text
                x="50"
                y="80"
                textAnchor="middle"
                fontFamily="'IBM Plex Mono', monospace"
                fontSize="9"
                letterSpacing="2"
                fill="#C1902F"
                fontWeight="bold"
            >
                GTTI
            </text>
        </svg>
    );
}

export default function Login() {
    const { errors, flash } = usePage().props;
    const verifiedStudent = flash?.verifiedStudent;
    const activeExam = flash?.activeExam;

    const [cnic, setCnic] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(3);

    const handleCnicChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 13) value = value.slice(0, 13);

        let formatted = value;
        if (value.length > 5 && value.length <= 12) {
            formatted = `${value.slice(0, 5)}-${value.slice(5)}`;
        } else if (value.length > 12) {
            formatted = `${value.slice(0, 5)}-${value.slice(5, 12)}-${value.slice(12)}`;
        }

        setCnic(formatted);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        router.post(route('exam-system.verify-cnic'), { cnic }, {
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
    };

    // Auto-redirect countdown when student is verified
    useEffect(() => {
        if (verifiedStudent && activeExam) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        router.visit(route('exam-system.take', activeExam.id));
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [verifiedStudent, activeExam]);

    return (
        <div className="min-h-screen bg-[#070D12] text-slate-100 flex flex-col justify-between selection:bg-[#C1902F] selection:text-white font-sans antialiased">
            <Head title="GTTI Exam System - Frictionless Intranet Login" />

            {/* Top Lab Header */}
            <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#C1902F] shrink-0 shadow-inner">
                            <Computer className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#C1902F]">
                                GTTI Examination Directorate • Local Intranet Node
                            </span>
                            <h1 className="text-sm sm:text-base font-black text-white tracking-tight">
                                GTTI Computer-Based Exam System
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Lab Terminal Online (0.0.0.0)</span>
                    </div>
                </div>
            </header>

            {/* Main Center Container */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
                <div className="w-full max-w-lg space-y-6">
                    {/* Error Alerts */}
                    {errors.cnic && (
                        <div className="p-5 rounded-3xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-start space-x-3 shadow-xl animate-fade-in">
                            <Lock className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-bold text-rose-100 text-sm">Access Restricted</p>
                                <p className="leading-relaxed text-rose-200/90">{errors.cnic}</p>
                            </div>
                        </div>
                    )}

                    {/* Verified Candidate Success Card */}
                    {verifiedStudent && activeExam ? (
                        <div className="rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl p-6 sm:p-10 space-y-6 text-center animate-fade-in relative overflow-hidden">
                            <div className="h-16 w-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                            </div>

                            <div className="space-y-1">
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    Identity Verified
                                </span>
                                <h2 className="text-2xl font-black text-white tracking-tight mt-2">
                                    Welcome, {verifiedStudent.name}
                                </h2>
                                <p className="text-xs text-slate-400 font-mono">
                                    CNIC: {verifiedStudent.cnic} • Father: {verifiedStudent.father_name}
                                </p>
                            </div>

                            {/* Exam Card */}
                            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Assigned Exam</span>
                                    <span className="text-xs font-mono font-bold text-amber-400">{activeExam.duration_minutes} Minutes</span>
                                </div>
                                <h3 className="text-base font-black text-white">{activeExam.title}</h3>
                                <p className="text-xs text-slate-400">
                                    Course: <strong className="text-slate-200">{verifiedStudent.course}</strong> • Batch: <strong className="text-slate-200">{verifiedStudent.batch}</strong>
                                </p>
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs text-slate-400">
                                    Entering exam room automatically in <strong className="text-emerald-400 font-mono text-sm">{countdown}s</strong>...
                                </p>
                                <button
                                    type="button"
                                    onClick={() => router.visit(route('exam-system.take', activeExam.id))}
                                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-govt-green hover:from-emerald-400 hover:to-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2"
                                >
                                    <span>Enter Examination Room Now</span>
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Standard Frictionless CNIC Form */
                        <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-10 space-y-6 relative overflow-hidden">
                            <Seal size={88} />

                            <div className="space-y-1.5 text-center">
                                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                                    Trainee Lab Verification
                                </h2>
                                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                    Enter your 13-digit National CNIC number. No password required. You will be authenticated directly into your active exam terminal.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                                <div className="space-y-1.5">
                                    <label className="block font-bold text-slate-300">
                                        Candidate CNIC / Form B Number *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        autoFocus
                                        placeholder="e.g. 31201-1234567-1"
                                        value={cnic}
                                        onChange={handleCnicChange}
                                        className="w-full p-3.5 rounded-2xl border border-slate-700 bg-slate-950 text-white font-mono text-base tracking-widest text-center focus:ring-2 focus:ring-[#C1902F] focus:border-[#C1902F] transition placeholder:text-slate-600 placeholder:tracking-normal placeholder:text-sm"
                                    />
                                    <span className="block text-[11px] text-slate-500 text-center">
                                        Type 13 digits without symbols (dashes format automatically)
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                                    <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
                                        <ShieldCheck className="h-4 w-4 shrink-0" />
                                        <span>Anti-Cheating & Exam Integrity:</span>
                                    </div>
                                    <p>
                                        Questions and multiple choice options are dynamically randomized. Tab switching or closing windows will trigger security proctor flags.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || cnic.replace(/\D/g, '').length !== 13}
                                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#C1902F] via-amber-500 to-yellow-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-950/30 flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <span>{loading ? 'Verifying CNIC...' : 'Verify & Enter Exam'}</span>
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 px-4 text-center text-xs text-slate-500">
                Government Technical Training Institute (GTTI) Rahim Yar Khan • Intranet Examination Node
            </footer>
        </div>
    );
}
