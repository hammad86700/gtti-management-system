import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
 ArrowLeft,
 User,
 Award,
 Building2,
 Calendar,
 FileText,
 Download,
 CheckCircle2,
 XCircle,
 Clock,
 Shield,
 Phone,
 MapPin,
 AlertCircle,
 Check
} from 'lucide-react';

export default function Show({ application }) {
 const [updating, setUpdating] = useState(false);

 const user = application.student_profile?.user;
 const profile = application.student_profile;
 const course = application.course;
 const trade = course?.trade;
 const dept = trade?.program?.department;
 const campaign = application.admission_campaign;
 const documents = application.documents || [];

 const handleStatusUpdate = (newStatus) => {
 if (confirm(`Are you sure you want to change the status to ${newStatus.toUpperCase()}?`)) {
 setUpdating(true);
 router.patch(
 route('admin.applications.update-status', application.id),
 { status: newStatus },
 {
 onFinish: () => setUpdating(false),
 }
 );
 }
 };

 const getStatusBadge = (status) => {
 switch (status) {
 case 'verified':
 return 'bg-govt-green-500/10 text-govt-green-500 border-govt-green-200';
 case 'submitted':
 return 'bg-blue-50 text-blue-600 border-blue-500/30';
 case 'under_review':
 return 'bg-govt-gold-50 text-govt-gold-600 border-govt-gold-200';
 case 'selected':
 return 'bg-purple-50 text-purple-600 border-purple-500/30';
 case 'enrolled':
 return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
 case 'rejected':
 return 'bg-rose-500/10 text-rose-600 border-rose-200';
 default:
 return 'bg-govt-cream-300 text-gray-600 border-gray-200';
 }
 };

 return (
 <AdminLayout
 header={
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <Link
 href={route('admin.applications.index')}
 className="p-2 rounded-xl bg-govt-cream-300 hover:bg-govt-green-50 text-gray-600 transition"
 >
 <ArrowLeft className="h-4 w-4" />
 </Link>
 <div>
 <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
 Application Review: <span className="text-govt-green-500 font-mono">{application.application_number}</span>
 </h1>
 <p className="text-xs text-gray-500">
 Detailed verification file for {user?.name || 'Applicant'}
 </p>
 </div>
 </div>

 <div className="flex items-center space-x-2">
 <span className="text-xs text-gray-500 font-medium">Status:</span>
 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(application.status)}`}>
 {application.status.replace('_', ' ')}
 </span>
 </div>
 </div>
 }
 >
 <Head title={`Review ${application.application_number} - GIIMS`} />

 <div className="space-y-6">
 {/* Top Status & Verification Action Command Bar */}
 <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-govt-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
 <Shield className="h-4 w-4 text-govt-green-500" />
 <span>Verification Decision & Application Status</span>
 </h3>
 <p className="text-xs text-gray-500 mt-0.5">
 Update the official eligibility status after verifying attached certificates
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-2">
 <button
 type="button"
 disabled={updating}
 onClick={() => handleStatusUpdate('verified')}
 className="px-4 py-2 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white text-xs font-bold transition shadow-md shadow-emerald-950/40 disabled:opacity-50 flex items-center space-x-1.5"
 >
 <CheckCircle2 className="h-4 w-4" />
 <span>Verify Application</span>
 </button>

 <button
 type="button"
 disabled={updating}
 onClick={() => handleStatusUpdate('under_review')}
 className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-govt-gold text-white text-xs font-bold transition shadow-md shadow-amber-950/40 disabled:opacity-50 flex items-center space-x-1.5"
 >
 <Clock className="h-4 w-4" />
 <span>Mark Under Review</span>
 </button>

 <button
 type="button"
 disabled={updating}
 onClick={() => handleStatusUpdate('selected')}
 className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md shadow-purple-950/40 disabled:opacity-50 flex items-center space-x-1.5"
 >
 <Award className="h-4 w-4" />
 <span>Select on Merit</span>
 </button>

 <button
 type="button"
 disabled={updating}
 onClick={() => handleStatusUpdate('rejected')}
 className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md shadow-rose-950/40 disabled:opacity-50 flex items-center space-x-1.5"
 >
 <XCircle className="h-4 w-4" />
 <span>Reject</span>
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Left 2 Cols: Applicant & Course Details */}
 <div className="lg:col-span-2 space-y-6">
 {/* 1. Master Identity Profile Card */}
 <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-lg space-y-4">
 <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
 <div className="h-10 w-10 rounded-xl bg-govt-green-500/10 text-govt-green-500 border border-govt-green-200 flex items-center justify-center">
 <User className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-base font-bold text-gray-900">Applicant Master Profile</h3>
 <p className="text-xs text-gray-500">Personal information from student identity registry</p>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
 <div className="p-3 rounded-xl bg-govt-cream-300/50 border border-gray-200">
 <p className="text-gray-500 text-[11px] font-medium">Applicant Full Name</p>
 <p className="text-gray-900 font-bold mt-0.5">{user?.name || 'N/A'}</p>
 </div>

 <div className="p-3 rounded-xl bg-govt-cream-300/50 border border-gray-200">
 <p className="text-gray-500 text-[11px] font-medium">Father / Guardian Name</p>
 <p className="text-gray-900 font-bold mt-0.5">{profile?.father_name || 'N/A'}</p>
 </div>

 <div className="p-3 rounded-xl bg-govt-cream-300/50 border border-gray-200">
 <p className="text-gray-500 text-[11px] font-medium">Email & Phone</p>
 <p className="text-gray-900 font-bold mt-0.5">{user?.email}</p>
 <p className="text-gray-500 text-[11px] mt-0.5">Emergency: {profile?.emergency_contact || 'N/A'}</p>
 </div>

 <div className="p-3 rounded-xl bg-govt-cream-300/50 border border-gray-200">
 <p className="text-gray-500 text-[11px] font-medium">CNIC / Registration Number</p>
                        <p className="text-gray-900 font-mono font-bold mt-0.5">{user?.cnic || profile?.registration_number || 'N/A'}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-govt-cream-300/50 border border-gray-200">
                        <p className="text-gray-500 text-[11px] font-medium">Date of Birth & Gender</p>
                        <p className="text-gray-900 font-bold mt-0.5">
                            {profile?.date_of_birth ? profile.date_of_birth.substring(0, 10) : 'N/A'} • {profile?.gender || 'N/A'}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-govt-cream-300/50 border border-gray-200">
                        <p className="text-gray-500 text-[11px] font-medium">Domicile District</p>
                        <p className="text-govt-green-500 font-bold mt-0.5">{profile?.domicile_district || 'Rahim Yar Khan'}</p>
                    </div>

                    <div className="sm:col-span-2 p-3 rounded-xl bg-govt-cream-300/50 border border-gray-200">
                        <p className="text-gray-500 text-[11px] font-medium">Permanent Residential Address</p>
                        <p className="text-gray-900 font-medium mt-0.5">{profile?.address || 'No permanent address recorded'}</p>
 </div>
 </div>
 </div>

 {/* 2. Course & Campaign Information Card */}
 <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-lg space-y-4">
 <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
 <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
 <Building2 className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-base font-bold text-gray-900">Applied Technical Course & Trade</h3>
 <p className="text-xs text-gray-500">Institutional curriculum and intake session details</p>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
 <div className="p-3 rounded-xl bg-govt-cream-300/50 border border-gray-200">
 <p className="text-gray-500 text-[11px] font-medium">Course / Trade Name</p>
 <p className="text-gray-900 font-bold mt-0.5">{course?.name} ({trade?.name})</p>
 <p className="text-gray-500 text-[10px]">Code: {trade?.code || 'GTTI-TR'}</p>
 </div>

 <div className="p-3 rounded-xl bg-govt-cream-300/50 border border-gray-200">
 <p className="text-gray-500 text-[11px] font-medium">Department & Program</p>
 <p className="text-gray-900 font-bold mt-0.5">{dept?.name}</p>
 <p className="text-cyan-600 text-[10px]">{trade?.program?.name} • {trade?.program?.duration_months} Months</p>
 </div>

 <div className="p-3 rounded-xl bg-govt-cream-300/50 border border-gray-200">
 <p className="text-gray-500 text-[11px] font-medium">Entry Qualification Requirement</p>
 <p className="text-purple-600 font-bold mt-0.5">{course?.entry_level || 'Matric / Middle'}</p>
 </div>

 <div className="p-3 rounded-xl bg-govt-cream-300/50 border border-gray-200">
 <p className="text-gray-500 text-[11px] font-medium">Admission Campaign Cycle</p>
 <p className="text-gray-900 font-bold mt-0.5">{campaign?.name}</p>
 </div>
 </div>
 </div>
 </div>

 {/* Right 1 Col: Uploaded Documents Verification */}
 <div className="space-y-6">
 <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-lg space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-gray-200">
 <div className="flex items-center space-x-2">
 <FileText className="h-5 w-5 text-govt-green-500" />
 <h3 className="text-base font-bold text-gray-900">Attached Scans</h3>
 </div>
 <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-govt-cream-300 text-gray-600">
 {documents.length} Files
 </span>
 </div>

 <p className="text-xs text-gray-500 leading-relaxed">
 Download and inspect original scanned certificates to confirm applicant age and qualification eligibility.
 </p>

 <div className="space-y-3">
 {documents.map((doc) => (
 <div
 key={doc.id}
 className="p-4 rounded-xl bg-govt-cream-300 border border-gray-200/80 space-y-3 hover:border-gray-200 transition"
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-2.5">
 <div className="h-8 w-8 rounded-lg bg-govt-green-500/10 text-govt-green-500 flex items-center justify-center shrink-0">
 <FileText className="h-4 w-4" />
 </div>
 <div>
 <p className="text-xs font-bold text-gray-900 capitalize">
 {doc.document_type.replace('_', ' ')}
 </p>
 <p className="text-[10px] text-gray-500">
 Uploaded: {doc.created_at ? doc.created_at.substring(0, 10) : 'Recent'}
 </p>
 </div>
 </div>
 <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-govt-cream-300 text-gray-600 uppercase">
 {doc.status}
 </span>
 </div>

 <a
 href={route('admin.documents.download', doc.id)}
 className="w-full py-2 px-3 rounded-lg bg-govt-cream-300 hover:bg-govt-green text-white text-xs font-semibold transition flex items-center justify-center space-x-2 shadow-sm"
 >
 <Download className="h-3.5 w-3.5" />
 <span>Secure Download File</span>
 </a>
 </div>
 ))}

 {documents.length === 0 && (
 <div className="text-center py-8 text-gray-500 text-xs">
 No verification documents were attached to this application.
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 </AdminLayout>
 );
}
