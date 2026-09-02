import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import {
 Clock,
 AlertCircle,
 CheckCircle2,
 ShieldAlert,
 Send,
 HelpCircle,
 ChevronLeft,
 ChevronRight
} from 'lucide-react';

export default function TakeTest({ test, questions = [] }) {
 // Total duration in seconds
 const totalSeconds = (test.duration_minutes || 30) * 60;
 const [timeLeft, setTimeLeft] = useState(totalSeconds);
 const [currentIdx, setCurrentIdx] = useState(0);
 const [confirmModal, setConfirmModal] = useState(false);
 const timerRef = useRef(null);

 const { data, setData, post, processing } = useForm({
 answers: {},
 start_time: new Date().toISOString(),
 });

 // Auto-submit when time reaches 0
 useEffect(() => {
 timerRef.current = setInterval(() => {
 setTimeLeft((prev) => {
 if (prev <= 1) {
 clearInterval(timerRef.current);
 handleSubmitDirect();
 return 0;
 }
 return prev - 1;
 });
 }, 1000);

 return () => clearInterval(timerRef.current);
 }, []);

 const handleSubmitDirect = () => {
 post(route('student.online-tests.submit', test.id));
 };

 const handleOptionSelect = (questionId, option) => {
 setData('answers', {
 ...data.answers,
 [questionId]: option,
 });
 };

 const formatTime = (seconds) => {
 const mins = Math.floor(seconds / 60);
 const secs = seconds % 60;
 return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
 };

 const currentQ = questions[currentIdx];
 const answeredCount = Object.keys(data.answers).length;
 const isUrgent = timeLeft < 300; // Under 5 mins

 return (
 <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between selection:bg-govt-green-500 selection:text-white">
 <Head title={`CBT Examination - ${test.title}`} />

 {/* TOP STICKY EXAM BAR */}
 <header className="sticky top-0 z-50 bg-govt-cream-300/90 backdrop-blur border-b border-gray-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
 <div>
 <div className="flex items-center space-x-2">
 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200 flex items-center space-x-1">
 <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
 <span>Live Exam Mode</span>
 </span>
 <span className="text-xs text-gray-500 hidden sm:inline">
 {test.batch?.course?.name} ({test.batch?.name})
 </span>
 </div>
 <h1 className="text-sm sm:text-base font-extrabold text-gray-900 mt-0.5 line-clamp-1">
 {test.title}
 </h1>
 </div>

 {/* COUNTDOWN TIMER */}
 <div className="flex items-center space-x-4">
 <div
 className={`px-4 py-2 rounded-2xl border flex items-center space-x-2 font-mono text-sm sm:text-base font-extrabold shadow-lg transition ${
 isUrgent
 ? 'bg-rose-950/60 border-rose-500 text-rose-600 animate-pulse'
 : 'bg-white border-gray-200 text-indigo-600'
 }`}
 >
 <Clock className="h-4 w-4" />
 <span>{formatTime(timeLeft)}</span>
 </div>

 <button
 type="button"
 onClick={() => setConfirmModal(true)}
 disabled={processing}
 className="px-4 py-2 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white font-extrabold text-xs transition shadow-md shadow-govt flex items-center space-x-1.5"
 >
 <Send className="h-3.5 w-3.5" />
 <span className="hidden sm:inline">Finish & Submit</span>
 <span className="sm:hidden">Submit</span>
 </button>
 </div>
 </header>

 {/* MAIN EXAM BODY */}
 <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
 {/* QUESTION PROGRESS & JUMP PALETTE */}
 <div className="p-4 rounded-2xl bg-govt-cream-300/60 border border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
 <div className="flex items-center space-x-2 font-bold text-gray-600">
 <span>Answered:</span>
 <span className="text-govt-green-500 font-extrabold font-mono">
 {answeredCount} / {questions.length}
 </span>
 </div>

 <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto">
 {questions.map((q, idx) => {
 const isAnswered = !!data.answers[q.id];
 const isCurrent = idx === currentIdx;
 return (
 <button
 key={q.id}
 type="button"
 onClick={() => setCurrentIdx(idx)}
 className={`h-7 w-7 rounded-lg text-[11px] font-extrabold transition font-mono ${
 isCurrent
 ? 'ring-2 ring-indigo-400 bg-indigo-600 text-white'
 : isAnswered
 ? 'bg-govt-green/30 border border-emerald-500/50 text-govt-green-400'
 : 'bg-govt-cream-300 text-gray-500 hover:bg-govt-green-50'
 }`}
 >
 {idx + 1}
 </button>
 );
 })}
 </div>
 </div>

 {/* CURRENT QUESTION CARD */}
 {currentQ && (
 <div className="p-6 sm:p-8 rounded-xl bg-govt-cream-300 border border-gray-200 shadow-govt-lg space-y-6">
 <div className="flex items-start justify-between gap-4">
 <div className="flex items-center space-x-3">
 <span className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm font-mono shrink-0">
 Q{currentIdx + 1}
 </span>
 <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
 Question {currentIdx + 1} of {questions.length}
 </span>
 </div>

 <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-govt-cream-300 text-gray-500 uppercase tracking-wider">
 {currentQ.marks} Point
 </span>
 </div>

 <p className="text-base sm:text-lg font-bold text-gray-900 leading-relaxed">
 {currentQ.question_text}
 </p>

 {/* RADIO OPTIONS A, B, C, D */}
 <div className="space-y-3 pt-2">
 {[
 { key: 'A', text: currentQ.option_a },
 { key: 'B', text: currentQ.option_b },
 { key: 'C', text: currentQ.option_c },
 { key: 'D', text: currentQ.option_d },
 ].map(({ key, text }) => {
 const selected = data.answers[currentQ.id] === key;
 return (
 <label
 key={key}
 onClick={() => handleOptionSelect(currentQ.id, key)}
 className={`p-4 rounded-2xl border transition cursor-pointer flex items-center space-x-4 ${
 selected
 ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
 : 'bg-govt-cream border-gray-200 text-gray-600 hover:bg-govt-cream-300 hover:border-gray-200'
 }`}
 >
 <div
 className={`h-6 w-6 rounded-lg font-extrabold text-xs flex items-center justify-center font-mono shrink-0 ${
 selected
 ? 'bg-govt-green-500 text-white shadow'
 : 'bg-govt-cream-300 text-gray-500'
 }`}
 >
 {key}
 </div>
 <span className="text-sm font-semibold leading-snug">{text}</span>
 </label>
 );
 })}
 </div>

 {/* BOTTOM PREV / NEXT NAVIGATION */}
 <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
 <button
 type="button"
 disabled={currentIdx === 0}
 onClick={() => setCurrentIdx(currentIdx - 1)}
 className="px-4 py-2 rounded-xl bg-govt-cream-300 hover:bg-govt-green-50 disabled:opacity-30 text-white text-xs font-bold transition flex items-center space-x-1.5"
 >
 <ChevronLeft className="h-4 w-4" />
 <span>Previous Question</span>
 </button>

 {currentIdx < questions.length - 1 ? (
 <button
 type="button"
 onClick={() => setCurrentIdx(currentIdx + 1)}
 className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-govt-green-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-indigo-950/30"
 >
 <span>Next Question</span>
 <ChevronRight className="h-4 w-4" />
 </button>
 ) : (
 <button
 type="button"
 onClick={() => setConfirmModal(true)}
 className="px-5 py-2 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-govt"
 >
 <Send className="h-3.5 w-3.5" />
 <span>Review & Submit</span>
 </button>
 )}
 </div>
 </div>
 )}
 </main>

 {/* CONFIRMATION SUBMIT MODAL */}
 {confirmModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 ">
 <div className="w-full max-w-md bg-white border border-gray-200 p-6 rounded-xl space-y-4 shadow-govt-lg">
 <div className="h-12 w-12 rounded-2xl bg-govt-green-500/10 text-govt-green-500 flex items-center justify-center">
 <Send className="h-6 w-6" />
 </div>

 <div>
 <h3 className="text-lg font-extrabold text-gray-900">
 Ready to Submit Your Examination?
 </h3>
 <p className="text-xs text-gray-500 mt-1 leading-relaxed">
 You have answered <span className="text-govt-green font-bold">{answeredCount}</span> of{' '}
 <span className="text-govt-green font-bold">{questions.length}</span> questions. Once
 submitted, your test will be evaluated immediately.
 </p>
 </div>

 <div className="flex items-center space-x-3 pt-2">
 <button
 type="button"
 onClick={() => setConfirmModal(false)}
 className="flex-1 py-2.5 rounded-xl bg-govt-cream-300 hover:bg-govt-green-50 text-gray-600 font-bold text-xs transition"
 >
 Continue Test
 </button>
 <button
 type="button"
 onClick={handleSubmitDirect}
 disabled={processing}
 className="flex-1 py-2.5 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white font-extrabold text-xs transition shadow-md shadow-govt"
 >
 {processing ? 'Submitting...' : 'Yes, Submit Test'}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}