import { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
 ShieldCheck,
 ShieldAlert,
 ScanBarcode,
 CheckCircle2,
 XCircle,
 LogIn,
 LogOut,
 Clock,
 UserCheck,
 Building2,
 Sparkles,
 Search,
 RefreshCw,
 Activity
} from 'lucide-react';

export default function Index({ todayLogs = [] }) {
 const [identifier, setIdentifier] = useState('');
 const [verifying, setVerifying] = useState(false);
 const [logging, setLogging] = useState(false);
 const [verifiedStudent, setVerifiedStudent] = useState(null);
 const [verificationError, setVerificationError] = useState('');
 const [recentLogs, setRecentLogs] = useState(todayLogs);
 const [feedbackMessage, setFeedbackMessage] = useState('');

 const inputRef = useRef(null);

 const triggerVerify = async (code) => {
 const cleanCode = (code || '').trim();
 if (!cleanCode) return;

 setIdentifier(cleanCode);
 setVerifying(true);
 setVerificationError('');
 setVerifiedStudent(null);
 setFeedbackMessage('');

 try {
 const response = await fetch(route('security.gate.verify'), {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
 },
 body: JSON.stringify({ identifier: cleanCode }),
 });

 const data = await response.json();

 if (data.found) {
 setVerifiedStudent(data.student);
 } else {
 setVerificationError(data.message || 'Student not authorized or record not found.');
 }
 } catch (err) {
 setVerificationError('Security server connection error. Please try again.');
 } finally {
 setVerifying(false);
 }
 };

 const handleVerify = async (e) => {
 if (e) e.preventDefault();
 await triggerVerify(identifier);
 };

 // Hardware Scanner Listener: listens for rapid keydown bursts (< 80ms)
 useEffect(() => {
 let buffer = '';
 let lastKeyTime = Date.now();

 const handleGlobalKeyDown = (e) => {
 const currentTime = Date.now();
 const timeDiff = currentTime - lastKeyTime;
 lastKeyTime = currentTime;

 if (e.key === 'Enter') {
 if (buffer.length >= 3) {
 e.preventDefault();
 triggerVerify(buffer);
 buffer = '';
 }
 } else if (e.key.length === 1) {
 if (timeDiff > 80) {
 buffer = e.key;
 } else {
 buffer += e.key;
 }
 }
 };

 window.addEventListener('keydown', handleGlobalKeyDown);
 return () => window.removeEventListener('keydown', handleGlobalKeyDown);
 }, []);

 useEffect(() => {
 if (inputRef.current) {
 inputRef.current.focus();
 }
 }, [verifiedStudent]);

 const handleLogAccess = async (type) => {
 if (!verifiedStudent) return;

 setLogging(true);
 setFeedbackMessage('');

 try {
 const response = await fetch(route('security.gate.store'), {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Accept': 'application/json',
 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
 },
 body: JSON.stringify({
 student_profile_id: verifiedStudent.profile_id,
 type: type,
 gate_name: 'Main Campus Gate',
 }),
 });

 const result = await response.json();

 if (result.success && result.log) {
 setRecentLogs([result.log, ...recentLogs]);
 setFeedbackMessage(`Logged ${type.toUpperCase()} successfully for ${verifiedStudent.name}!`);
 setVerifiedStudent(null);
 setIdentifier('');
 if (inputRef.current) inputRef.current.focus();
 } else {
 alert('Could not record gate log.');
 }
 } catch (err) {
 alert('Failed to log access. Please check network connection.');
 } finally {
 setLogging(false);
 }
 };

 return (
 <AuthenticatedLayout
 header={
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <div className="p-2 rounded-2xl bg-govt-green-500/10 text-govt-green-500 border border-govt-green-200">
 <ShieldCheck className="h-6 w-6" />
 </div>
 <div>
 <h2 className="text-xl font-bold leading-tight text-gray-800 ">
 Gate Security & ID Verification Portal
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 Main Entrance • Govt. Technical Training Institute, Rahim Yar Khan
 </p>
 </div>
 </div>

 <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-govt-green-500/10 text-govt-green-500 border border-govt-green-200">
 <span className="h-2 w-2 rounded-full bg-govt-green-500 animate-ping"></span>
 <span>Security Scanner Live</span>
 </span>
 </div>
 }
 >
 <Head title="Gate Security Portal - GIIMS" />

 <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
 {/* TOP SEARCH & SCANNER INPUT BAR */}
 <div className="rounded-xl bg-white border-2 border-gray-200 p-6 shadow-lg">
 <form onSubmit={handleVerify} className="space-y-3">
 <label className="block text-sm font-black uppercase tracking-wider text-gray-700 flex items-center space-x-2">
 <ScanBarcode className="h-5 w-5 text-govt-green-500" />
 <span>Scan Student Card Barcode OR Enter Enrollment ID / CNIC</span>
 </label>

 <div className="flex flex-col sm:flex-row gap-3">
 <div className="relative flex-1">
 <input
 ref={inputRef}
 type="text"
 placeholder="e.g. GTTI-2026-0001 or 31301-1234567-1"
 value={identifier}
 onChange={(e) => setIdentifier(e.target.value)}
 className="w-full text-lg sm:text-xl font-mono font-bold px-4 py-3.5 bg-govt-cream border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-govt-green-400/20 transition"
 />
 </div>

 <button
 type="submit"
 disabled={verifying || !identifier.trim()}
 className="px-6 py-3.5 rounded-2xl bg-govt-green hover:bg-govt-green-500 text-white font-extrabold text-base transition shadow-md shadow-govt flex items-center justify-center space-x-2 disabled:opacity-50 shrink-0"
 >
 <Search className="h-5 w-5" />
 <span>{verifying ? 'Verifying...' : 'Verify ID'}</span>
 </button>
 </div>
 </form>

 {feedbackMessage && (
 <div className="mt-4 p-3.5 rounded-2xl bg-govt-green-500/10 border border-govt-green-200 text-emerald-700 text-sm font-bold flex items-center space-x-2 animate-bounce">
 <CheckCircle2 className="h-5 w-5 shrink-0" />
 <span>{feedbackMessage}</span>
 </div>
 )}
 </div>

 {/* MIDDLE VERIFICATION RESULTS CARD */}
 {verifiedStudent && (
 <div className={`rounded-xl p-6 sm:p-8 border-4 shadow-govt-lg space-y-6 transition ${
 verifiedStudent.is_active
 ? 'bg-gradient-to-br from-emerald-950/40 via-govt-green-500 to-govt-green border-emerald-500 text-white'
 : 'bg-gradient-to-br from-rose-950/40 via-govt-green-500 to-govt-green border-rose-500 text-white'
 }`}>
 {/* Massive Status Alert */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
 <div className="flex items-center space-x-3">
 {verifiedStudent.is_active ? (
 <div className="h-14 w-14 rounded-2xl bg-govt-green-500 text-gray-600 flex items-center justify-center font-black shrink-0 shadow-lg">
 <CheckCircle2 className="h-8 w-8" />
 </div>
 ) : (
 <div className="h-14 w-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black shrink-0 shadow-lg">
 <XCircle className="h-8 w-8" />
 </div>
 )}
 <div>
 <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-widest ${
 verifiedStudent.is_active
 ? 'bg-govt-green-500/20 text-govt-green-400 border border-emerald-500/40'
 : 'bg-rose-50 text-rose-300 border border-rose-500/40'
 }`}>
 {verifiedStudent.is_active ? 'AUTHORIZED FOR ENTRY' : 'ACCESS SUSPENDED / INACTIVE'}
 </span>
 <h3 className="text-2xl sm:text-3xl font-black mt-0.5">
 {verifiedStudent.name}
 </h3>
 </div>
 </div>

 <div className="text-right">
 <p className="text-xs text-gray-500 font-bold uppercase">Official Student ID</p>
 <p className="text-xl font-mono font-black text-govt-green-500">{verifiedStudent.enrollment_number}</p>
 </div>
 </div>

 {/* Student Details Grid */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-govt-cream-300/70 border border-gray-200 space-y-0.5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Father's Name</p>
                        <p className="font-bold text-sm text-gray-900">{verifiedStudent.father_name}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-govt-cream-300/70 border border-gray-200 space-y-0.5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">CNIC / Form-B</p>
                        <p className="font-mono font-bold text-sm text-gray-800">{verifiedStudent.cnic}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-govt-cream-300/70 border border-gray-200 space-y-0.5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Enrolled Course</p>
                        <p className="font-bold text-sm text-gray-900 truncate">{verifiedStudent.course}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-govt-cream-300/70 border border-gray-200 space-y-0.5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Batch & Shift</p>
                        <p className="font-bold text-sm text-govt-green-600">{verifiedStudent.batch} • {verifiedStudent.shift}</p>
                    </div>
 </div>

 {/* Massive Action Buttons (Tablet Friendly) */}
 {verifiedStudent.is_active && (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
 <button
 type="button"
 disabled={logging}
 onClick={() => handleLogAccess('entry')}
 className="py-4 px-6 rounded-2xl bg-govt-green hover:bg-govt-green-500 text-white font-black text-lg transition shadow-govt-lg flex items-center justify-center space-x-3 disabled:opacity-50"
 >
 <LogIn className="h-6 w-6" />
 <span>{logging ? 'Recording...' : 'LOG CAMPUS ENTRY'}</span>
 </button>

 <button
 type="button"
 disabled={logging}
 onClick={() => handleLogAccess('exit')}
 className="py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg transition shadow-govt-lg flex items-center justify-center space-x-3 disabled:opacity-50"
 >
 <LogOut className="h-6 w-6" />
 <span>{logging ? 'Recording...' : 'LOG CAMPUS EXIT'}</span>
 </button>
 </div>
 )}
 </div>
 )}

 {/* RESTRICTED ERROR BANNER */}
 {verificationError && (
 <div className="rounded-xl p-6 bg-rose-500/10 border-2 border-rose-200 text-rose-700 space-y-2">
 <div className="flex items-center space-x-2 font-bold text-base">
 <ShieldAlert className="h-6 w-6 text-rose-500 shrink-0" />
 <span>Verification Alert: Unauthorized or Unrecognized</span>
 </div>
 <p className="text-xs text-rose-600 pl-8">
 {verificationError}
 </p>
 </div>
 )}

 {/* BOTTOM: TODAY'S LIVE GATE LOG FEED */}
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs">
 <div className="flex items-center space-x-2">
 <Activity className="h-4 w-4 text-govt-green-500" />
 <h3 className="font-bold text-gray-900 ">
 Live Gate Movement Stream
 </h3>
 </div>
 <span className="text-gray-500">{recentLogs.length} Movements Logged</span>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="text-gray-500 border-b border-gray-100 ">
 <th className="pb-3 font-semibold">Time</th>
 <th className="pb-3 font-semibold">Type</th>
 <th className="pb-3 font-semibold">Student Name</th>
 <th className="pb-3 font-semibold">Roll Number</th>
 <th className="pb-3 font-semibold">Course & Batch</th>
 <th className="pb-3 font-semibold">Gate Location</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
 {recentLogs.map((log) => {
 const user = log.student_profile?.user;
 const enrollment = log.student_profile?.enrollments?.[0];

 return (
 <tr key={log.id} className="hover:bg-govt-green-50 :bg-white/50 transition">
 <td className="py-3 font-mono font-bold text-gray-500 ">
 {log.logged_at ? String(log.logged_at).substring(11, 16) : 'Now'}
 </td>
 <td className="py-3">
 <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
 log.type === 'entry'
 ? 'bg-govt-green-500/10 text-govt-green-500 border border-govt-green-200'
 : 'bg-blue-50 text-blue-600 border border-blue-200'
 }`}>
 {log.type === 'entry' ? <LogIn className="h-3 w-3" /> : <LogOut className="h-3 w-3" />}
 <span>{log.type}</span>
 </span>
 </td>
 <td className="py-3 font-bold text-gray-900 ">
 {user?.name || 'Enrolled Student'}
 </td>
 <td className="py-3 font-mono font-bold text-govt-green-500 ">
 {enrollment?.enrollment_number || 'GTTI-ID'}
 </td>
 <td className="py-3">
 <p className="font-semibold text-gray-800 ">{enrollment?.course?.name || 'Technical Course'}</p>
 <p className="text-[10px] text-gray-500">{enrollment?.batch?.name}</p>
 </td>
 <td className="py-3 text-gray-500 ">
 {log.gate_name || 'Main Gate'}
 </td>
 </tr>
 );
 })}

 {recentLogs.length === 0 && (
 <tr>
 <td colSpan="6" className="text-center py-8 text-gray-500">
 No gate entries or exits recorded yet today.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </AuthenticatedLayout>
 );
}