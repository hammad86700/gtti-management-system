import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import {
 User,
 Calendar,
 MapPin,
 Phone,
 Shield,
 CheckCircle2,
 Save,
 AlertCircle,
 ArrowLeft,
 FileText,
 Sparkles
} from 'lucide-react';

export default function Edit({ profile }) {
 const { auth } = usePage().props;
 const user = auth.user;

 const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
 father_name: profile?.father_name || '',
 date_of_birth: profile?.date_of_birth ? profile.date_of_birth.substring(0, 10) : '',
 gender: profile?.gender || 'Male',
 domicile_district: profile?.domicile_district || 'Rahim Yar Khan',
 address: profile?.address || '',
 emergency_contact: profile?.emergency_contact || '',
 });

 const handleSubmit = (e) => {
 e.preventDefault();
 post(route('student.profile.update'));
 };

 const isComplete = Boolean(
 profile?.father_name &&
 profile?.date_of_birth &&
 profile?.gender &&
 profile?.domicile_district &&
 profile?.address &&
 profile?.emergency_contact
 );

 return (
 <AuthenticatedLayout
 header={
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-xl font-bold leading-tight text-gray-800 ">
 Master Student Profile
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 Applicant Identity & Permanent Institutional Record
 </p>
 </div>
 <Link
 href={route('dashboard')}
 className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 :bg-govt-cream-300 text-xs font-semibold text-gray-700 transition"
 >
 <ArrowLeft className="h-3.5 w-3.5" />
 <span>Back to Portal</span>
 </Link>
 </div>
 }
 >
 <Head title="Student Profile - GIIMS" />

 <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
 {/* Status Indicator Banner */}
 <div className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div className="flex items-center space-x-4">
 <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-gray-900 shadow-md ${
 isComplete ? 'bg-govt-green' : 'bg-govt-gold'
 }`}>
 <User className="h-6 w-6" />
 </div>
 <div>
 <div className="flex items-center space-x-2">
 <h3 className="text-base font-bold text-gray-900 ">
 {user.name}
 </h3>
 <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
 isComplete
 ? 'bg-govt-green-500/10 text-govt-green-500 border border-govt-green-200'
 : 'bg-govt-gold-50 text-amber-600 border border-govt-gold-200'
 }`}>
 {isComplete ? 'Profile Complete' : 'Profile Incomplete'}
 </span>
 </div>
 <p className="text-xs text-gray-500 ">
 Email: {user.email} {profile?.registration_number && `• Reg: ${profile.registration_number}`}
 </p>
 </div>
 </div>

 <div className="text-xs text-gray-500 max-w-xs">
 <span className="font-semibold text-gray-700 ">Notice:</span> A completed master profile is required to apply for all GTTI technical courses.
 </div>
 </div>

 {/* Success Notification */}
 {recentlySuccessful && (
 <div className="p-4 rounded-xl bg-govt-green-500/10 border border-govt-green-200 text-govt-green-500 text-xs font-semibold flex items-center space-x-2 shadow-sm">
 <CheckCircle2 className="h-4 w-4 shrink-0" />
 <span>Master Student Profile has been saved successfully!</span>
 </div>
 )}

 {/* Form Card */}
 <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 sm:p-8">
 <div className="border-b border-gray-100 pb-4 mb-6">
 <h3 className="text-base font-bold text-gray-900 ">
 Personal & Institutional Identity Details
 </h3>
 <p className="text-xs text-gray-500 mt-0.5">
 Please provide authentic details matching your official CNIC/B-Form and Educational Certificates.
 </p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 {/* Applicant Full Name (Readonly from User) */}
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1.5">
 Applicant Full Name (as per CNIC / Matric)
 </label>
 <input
 type="text"
 value={user.name}
 disabled
 className="w-full px-3.5 py-2.5 bg-govt-cream-300 border border-gray-200 rounded-xl text-xs text-gray-500 cursor-not-allowed"
 />
 <p className="text-[10px] text-gray-500 mt-1">Managed via Account Identity.</p>
 </div>

 {/* Father / Guardian Name */}
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1.5">
 Father / Guardian Name <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 placeholder="Enter father or guardian name"
 value={data.father_name}
 onChange={(e) => setData('father_name', e.target.value)}
 className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs text-gray-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
 errors.father_name
 ? 'border-rose-500 focus:ring-rose-500/30'
 : 'border-gray-200 focus:ring-govt-green-400/30'
 }`}
 />
 {errors.father_name && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.father_name}</p>
 )}
 </div>

 {/* Date of Birth */}
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1.5">
 Date of Birth <span className="text-rose-500">*</span>
 </label>
 <input
 type="date"
 value={data.date_of_birth}
 onChange={(e) => setData('date_of_birth', e.target.value)}
 className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs text-gray-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
 errors.date_of_birth
 ? 'border-rose-500 focus:ring-rose-500/30'
 : 'border-gray-200 focus:ring-govt-green-400/30'
 }`}
 />
 {errors.date_of_birth && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.date_of_birth}</p>
 )}
 </div>

 {/* Gender */}
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1.5">
 Gender <span className="text-rose-500">*</span>
 </label>
 <select
 value={data.gender}
 onChange={(e) => setData('gender', e.target.value)}
 className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 ${
 errors.gender
 ? 'border-rose-500 focus:ring-rose-500/30'
 : 'border-gray-200 focus:ring-govt-green-400/30'
 }`}
 >
 <option value="Male">Male</option>
 <option value="Female">Female</option>
 <option value="Other">Other</option>
 </select>
 {errors.gender && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.gender}</p>
 )}
 </div>

 {/* Domicile District */}
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1.5">
 Domicile District <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 placeholder="e.g. Rahim Yar Khan, Bahawalpur, Sadiqabad"
 value={data.domicile_district}
 onChange={(e) => setData('domicile_district', e.target.value)}
 className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs text-gray-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
 errors.domicile_district
 ? 'border-rose-500 focus:ring-rose-500/30'
 : 'border-gray-200 focus:ring-govt-green-400/30'
 }`}
 />
 {errors.domicile_district && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.domicile_district}</p>
 )}
 </div>

 {/* Emergency Contact Number */}
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1.5">
 Emergency Contact Phone <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 placeholder="e.g., 0300-1234567"
 value={data.emergency_contact}
 onChange={(e) => setData('emergency_contact', e.target.value)}
 className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs text-gray-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
 errors.emergency_contact
 ? 'border-rose-500 focus:ring-rose-500/30'
 : 'border-gray-200 focus:ring-govt-green-400/30'
 }`}
 />
 {errors.emergency_contact && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.emergency_contact}</p>
 )}
 </div>

 {/* Permanent Home Address */}
 <div className="md:col-span-2">
 <label className="block text-xs font-semibold text-gray-700 mb-1.5">
 Permanent Residential Address <span className="text-rose-500">*</span>
 </label>
 <textarea
 rows="3"
 placeholder="House / Street, Tehsil, District..."
 value={data.address}
 onChange={(e) => setData('address', e.target.value)}
 className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs text-gray-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
 errors.address
 ? 'border-rose-500 focus:ring-rose-500/30'
 : 'border-gray-200 focus:ring-govt-green-400/30'
 }`}
 />
 {errors.address && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.address}</p>
 )}
 </div>
 </div>

 {/* Submit Button */}
 <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
 <button
 type="submit"
 disabled={processing}
 className="px-6 py-2.5 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white text-xs font-bold transition shadow-lg shadow-govt disabled:opacity-50 flex items-center space-x-2"
 >
 <Save className="h-4 w-4" />
 <span>{processing ? 'Saving Profile...' : 'Save Master Profile'}</span>
 </button>
 </div>
 </form>
 </div>
 </div>
 </AuthenticatedLayout>
 );
}
