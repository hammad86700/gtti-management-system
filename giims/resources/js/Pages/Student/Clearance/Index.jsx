import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link, usePage } from '@inertiajs/react';
import {
 Award,
 CheckCircle2,
 Clock,
 AlertCircle,
 Building2,
 BookOpen,
 Wrench,
 DollarSign,
 GraduationCap,
 Sparkles,
 Printer,
 ArrowLeft,
 ShieldCheck,
 FileCheck,
 Send
} from 'lucide-react';

export default function Index({ enrollment, clearance, certificates = [] }) {
 const { site_settings: siteSettings = {} } = usePage().props;
 const [submitting, setSubmitting] = useState(false);

 const handleApplyClearance = () => {
 setSubmitting(true);
 router.post(
 route('student.clearance.store'),
 {},
 {
 onFinish: () => setSubmitting(false),
 }
 );
 };

 const course = enrollment?.course;
 const batch = enrollment?.batch;

 // Calculate progress
 let clearedCount = 0;
 if (clearance) {
 if (clearance.fee_status === 'cleared') clearedCount++;
 if (clearance.library_status === 'cleared') clearedCount++;
 if (clearance.workshop_status === 'cleared') clearedCount++;
 }
 const progressPercent = Math.round((clearedCount / 3) * 100);

 return (
 <AuthenticatedLayout
 header={
 <div className="flex items-center justify-between print:hidden">
 <div className="flex items-center space-x-3">
 <Link
 href={route('dashboard')}
 className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 :bg-govt-cream-300 text-gray-700 transition"
 >
 <ArrowLeft className="h-4 w-4" />
 </Link>
 <div>
 <h2 className="text-xl font-bold leading-tight text-gray-800 ">
 Institutional Clearance & Alumni Credentials
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 {siteSettings.institute_name || 'GTTI Rahim Yar Khan'} • Departmental Dues Audit & Completion Certification
 </p>
 </div>
 </div>

 {enrollment && (
 <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-govt-green-500/10 text-emerald-700 border border-govt-green-200 font-mono">
 {enrollment.enrollment_number}
 </span>
 )}
 </div>
 }
 >
 <Head title="Course Clearance & Certificates - GIIMS" />

 <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
 {/* Hero Header */}
 <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-govt-green via-govt-green-500 to-indigo-950 border border-gray-200 p-6 sm:p-8 text-white shadow-govt-lg print:hidden">
 <div className="relative z-10 max-w-3xl space-y-2">
 <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-govt-green-500/20 text-govt-green-400 border border-govt-green-200 text-xs font-semibold">
 <Sparkles className="h-3.5 w-3.5" />
 <span>Course Completion Protocol</span>
 </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif">
                        Clearance Verification & Digital Certificate
                    </h1>
                    <p className="text-xs sm:text-sm text-green-100 leading-relaxed font-medium">
                        Upon concluding your academic and vocational training modules in {course?.name || 'your enrolled trade'}, complete departmental audits to receive an officially validated TEVTA Completion Certificate.
                    </p>
 </div>
 </div>

 {/* ACTIVE CERTIFICATES (IF ISSUED) */}
 {certificates.length > 0 && (
 <div className="space-y-4">
 <div className="flex items-center space-x-2 text-xs font-bold text-gray-900 print:hidden">
 <Award className="h-4 w-4 text-govt-gold" />
 <span>Issued Institutional Certificates</span>
 </div>

 {certificates.map((cert) => (
 <div
 key={cert.id}
 className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 border-2 border-amber-500/40 p-6 sm:p-8 shadow-lg space-y-6 print:border-4 print:border-[#00401A] print:p-12 print:bg-white print:text-black print:shadow-none font-serif"
 >
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-govt-gold-200 print:border-black">
 <div className="flex items-center space-x-3">
 <div className="h-14 w-14 rounded-2xl bg-white p-1 border border-govt-gold-200 flex items-center justify-center font-bold shadow-sm shrink-0">
 <img src="/images/tevta-logo.png" alt="TEVTA" className="h-full w-full object-contain" />
 </div>
 <div>
 <span className="text-[10px] uppercase tracking-widest font-black text-amber-600 print:text-[#00401A]">
 {siteSettings.institute_name || 'Government of Punjab • TEVTA'}
 </span>
 <h3 className="text-lg font-black text-gray-900 print:text-black">
 Certificate of Vocational Competence
 </h3>
 </div>
 </div>

 <div className="text-right sm:border-l sm:border-govt-gold-200 sm:pl-4 print:border-black">
 <p className="text-[10px] text-gray-500 uppercase font-bold print:text-gray-600">Certificate Number</p>
 <p className="text-sm font-mono font-black text-govt-green-500 print:text-black">
 {cert.certificate_number}
 </p>
 <p className="text-[10px] text-gray-500 mt-0.5 print:text-gray-600">Issued: {cert.issue_date}</p>
 </div>
 </div>

 <div className="space-y-2 text-center max-w-2xl mx-auto py-4">
 <p className="text-xs text-gray-500 print:text-gray-600 italic">This is to officially certify that</p>
 <h2 className="text-xl sm:text-3xl font-black text-gray-900 print:text-black tracking-wide uppercase">
 {enrollment?.student_profile?.user?.name || 'Trainee Graduate'}
 </h2>
 <p className="text-xs text-gray-600 print:text-gray-700 leading-relaxed">
 has successfully fulfilled all prescribed institutional course requirements, theoretical instruction, practical workshop competencies, and formal assessments in
 </p>
 <p className="text-lg font-extrabold text-amber-600 print:text-[#00401A] uppercase tracking-wider">
 {cert.course?.name || course?.name}
 </p>
 </div>

 <div className="pt-6 border-t border-govt-gold-200 print:border-black flex flex-wrap items-center justify-between gap-3 text-xs">
 <div className="flex items-center space-x-2 text-govt-green-500 font-bold print:text-black">
 <ShieldCheck className="h-4 w-4" />
 <span>Digitally Authenticated & Recorded in GIIMS Institutional Registry</span>
 </div>

 <button
 type="button"
 onClick={() => window.print()}
 className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition flex items-center space-x-1.5 shadow-sm print:hidden"
 >
 <Printer className="h-3.5 w-3.5" />
 <span>Print Certificate</span>
 </button>
 </div>

 {/* Formal Signatories on Print */}
 <div className="hidden print:grid grid-cols-3 gap-8 pt-16 text-center text-black font-serif text-[11px]">
 <div>
 <div className="border-t border-black pt-1 font-bold">Trade Instructor</div>
 <div>Department of Technical Education</div>
 </div>
 <div>
 <div className="border-t border-black pt-1 font-bold">Controller of Examinations</div>
 <div>GIIMS Institutional Registry</div>
 </div>
 <div>
 <div className="border-t border-black pt-1 font-bold">Principal / Chairman</div>
 <div>Govt Technical Training Institute</div>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* CLEARANCE SECTION */}
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-6 print:hidden">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 ">
 <div>
 <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
 <FileCheck className="h-5 w-5 text-govt-green-500" />
 <span>Institutional Departmental Clearance</span>
 </h3>
 <p className="text-xs text-gray-500 mt-0.5">
 Verification across Accounts, Central Library, and Trade Workshop wings
 </p>
 </div>

 {clearance && (
 <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
 clearance.overall_status === 'cleared'
 ? 'bg-govt-green-500/20 text-emerald-700 border border-govt-green-200'
 : 'bg-govt-gold-50 text-amber-700 border border-govt-gold-200'
 }`}>
 {clearance.overall_status === 'cleared' ? 'Clearance Completed' : 'Audit In Progress'}
 </span>
 )}
 </div>

 {!clearance ? (
 /* NOT REQUESTED YET */
 <div className="p-8 rounded-2xl bg-govt-cream border border-gray-200 text-center space-y-4">
 <div className="h-12 w-12 rounded-2xl bg-govt-gold-50 text-amber-600 mx-auto flex items-center justify-center">
 <Building2 className="h-6 w-6" />
 </div>
 <div className="max-w-md mx-auto space-y-1">
 <h4 className="text-sm font-bold text-gray-900 ">
 No Active Clearance Application Found
 </h4>
 <p className="text-xs text-gray-500 ">
 Ready to graduate from {course?.name}? Submit your clearance request to initiate simultaneous audits across all institute departments.
 </p>
 </div>

 <button
 type="button"
 disabled={submitting || !enrollment}
 onClick={handleApplyClearance}
 className="px-6 py-2.5 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white font-extrabold text-xs transition shadow-md shadow-emerald-950/20 inline-flex items-center space-x-2 disabled:opacity-50"
 >
 <Send className="h-3.5 w-3.5" />
 <span>{submitting ? 'Submitting...' : 'Submit Institutional Clearance Request'}</span>
 </button>
 </div>
 ) : (
 /* CLEARANCE IN PROGRESS / CLEARED */
 <div className="space-y-6">
 {/* PROGRESS BAR */}
 <div className="space-y-2">
 <div className="flex justify-between text-xs font-bold">
 <span className="text-gray-700 ">Department Audit Completion</span>
 <span className="text-govt-green-500 ">{progressPercent}% ({clearedCount} of 3 Wings Cleared)</span>
 </div>
 <div className="h-3 w-full bg-govt-cream-300 rounded-full overflow-hidden border border-gray-200 ">
 <div
 className="h-full bg-govt-green-500 transition-all duration-500 rounded-full"
 style={{ width: `${progressPercent}%` }}
 ></div>
 </div>
 </div>

 {/* 3 CHECKPOINTS */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
 {/* 1. ACCOUNTS / FEE */}
 <div className="p-5 rounded-2xl bg-govt-cream border border-gray-200 space-y-3">
 <div className="flex items-center justify-between">
 <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
 <DollarSign className="h-5 w-5" />
 </div>
 <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
 clearance.fee_status === 'cleared'
 ? 'bg-govt-green-500/20 text-emerald-700 border border-govt-green-200'
 : 'bg-govt-gold-50 text-amber-700 border border-govt-gold-200'
 }`}>
 {clearance.fee_status}
 </span>
 </div>
 <div>
 <h4 className="font-extrabold text-gray-900 ">Accounts & Tuition Fee</h4>
 <p className="text-[11px] text-gray-500 mt-0.5">
 Admission dues, exam fees, and treasury reconciliation.
 </p>
 </div>
 </div>

 {/* 2. LIBRARY */}
 <div className="p-5 rounded-2xl bg-govt-cream border border-gray-200 space-y-3">
 <div className="flex items-center justify-between">
 <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
 <BookOpen className="h-5 w-5" />
 </div>
 <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
 clearance.library_status === 'cleared'
 ? 'bg-govt-green-500/20 text-emerald-700 border border-govt-green-200'
 : 'bg-govt-gold-50 text-amber-700 border border-govt-gold-200'
 }`}>
 {clearance.library_status}
 </span>
 </div>
 <div>
 <h4 className="font-extrabold text-gray-900 ">Central Library</h4>
 <p className="text-[11px] text-gray-500 mt-0.5">
 Textbooks, reference manuals return & zero overdue fines.
 </p>
 </div>
 </div>

 {/* 3. WORKSHOP */}
 <div className="p-5 rounded-2xl bg-govt-cream border border-gray-200 space-y-3">
 <div className="flex items-center justify-between">
 <div className="h-9 w-9 rounded-xl bg-govt-gold-50 text-amber-600 flex items-center justify-center">
 <Wrench className="h-5 w-5" />
 </div>
 <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
 clearance.workshop_status === 'cleared'
 ? 'bg-govt-green-500/20 text-emerald-700 border border-govt-green-200'
 : 'bg-govt-gold-50 text-amber-700 border border-govt-gold-200'
 }`}>
 {clearance.workshop_status}
 </span>
 </div>
 <div>
 <h4 className="font-extrabold text-gray-900 ">Trade Workshop & Labs</h4>
 <p className="text-[11px] text-gray-500 mt-0.5">
 Tool kit inspection, equipment return, and safety sign-off.
 </p>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 </AuthenticatedLayout>
 );
}