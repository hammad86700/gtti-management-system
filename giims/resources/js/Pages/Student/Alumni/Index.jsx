import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import {
 Briefcase,
 Building2,
 GraduationCap,
 MapPin,
 DollarSign,
 Calendar,
 CheckCircle2,
 Clock,
 Award,
 Sparkles,
 ArrowLeft,
 AlertCircle,
 Send,
 TrendingUp,
 Compass
} from 'lucide-react';

export default function Index({
 placement = null,
 isGraduated = false,
 graduatedEnrollment = null,
 activeEnrollment = null,
}) {
 const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
 employment_status: placement?.employment_status || 'employed',
 company_name: placement?.company_name || '',
 designation: placement?.designation || '',
 location: placement?.location || '',
 monthly_salary: placement?.monthly_salary || '',
 placement_date: placement?.placement_date ? placement.placement_date.substring(0, 10) : '',
 });

 const handleSubmit = (e) => {
 e.preventDefault();
 post(route('student.alumni.store'), {
 preserveScroll: true,
 });
 };

 const courseName =
 graduatedEnrollment?.course?.name ||
 activeEnrollment?.course?.name ||
 'Vocational Program';

 return (
 <AuthenticatedLayout
 header={
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <Link
 href={route('dashboard')}
 className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 :bg-govt-cream-300 text-gray-700 transition"
 >
 <ArrowLeft className="h-4 w-4" />
 </Link>
 <div>
 <h2 className="text-xl font-bold leading-tight text-gray-800 ">
 Alumni & Career Placement Network
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 GTTI Rahim Yar Khan • Post-Graduation Employment & Professional Tracing
 </p>
 </div>
 </div>

 <span
 className={`hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
 isGraduated
 ? 'bg-govt-green-500/15 text-emerald-700 border border-govt-green-200'
 : 'bg-blue-500/15 text-blue-700 border border-blue-500/30'
 }`}
 >
 {isGraduated ? 'Official GTTI Alumnus' : 'Active Trainee'}
 </span>
 </div>
 }
 >
 <Head title="Alumni & Job Placement - GIIMS" />

 <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
 {/* HERO BANNER */}
 <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-govt-green via-indigo-950 to-govt-green border border-gray-200 p-6 sm:p-8 text-white shadow-govt-lg">
 <div className="relative z-10 max-w-3xl space-y-2">
 <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-govt-green-500/20 text-govt-green-400 border border-govt-green-200 text-xs font-semibold">
 <Sparkles className="h-3.5 w-3.5" />
 <span>GTTI Career Tracking Network</span>
 </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-serif">
                        Alumni Success & Job Placement Portal
                    </h1>
                    <p className="text-xs sm:text-sm text-green-100 leading-relaxed font-medium">
                        If you have completed your training or graduated in {courseName}, please self-report your current employment, entrepreneurial venture, or higher education status to help GTTI benchmark institutional training impact and connect with employers.
                    </p>
 </div>
 </div>

 {/* STATUS BADGE / CURRENT PLACEMENT SUMMARY (IF LOGGED) */}
 {placement && (
 <div className="rounded-xl bg-white border border-govt-green-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
 <div className="flex items-center space-x-4">
 <div className="h-12 w-12 rounded-2xl bg-govt-green-500/15 text-govt-green-500 flex items-center justify-center font-bold">
 <CheckCircle2 className="h-6 w-6" />
 </div>
 <div>
 <span className="text-[10px] uppercase tracking-widest font-black text-govt-green-500 ">
 Current Recorded Placement
 </span>
 <h3 className="text-base font-extrabold text-gray-900 capitalize">
 {placement.designation ? `${placement.designation} at ` : ''}
 {placement.company_name || placement.employment_status.replace('_', ' ')}
 </h3>
 <p className="text-xs text-gray-500 mt-0.5">
 Status: <span className="capitalize font-bold text-gray-800 ">{placement.employment_status.replace('_', ' ')}</span>
 {placement.location ? ` • ${placement.location}` : ''}
 </p>
 </div>
 </div>

 <span className="text-xs text-gray-500 font-medium">
 Last Updated: {new Date(placement.updated_at).toLocaleDateString()}
 </span>
 </div>
 )}

 {/* SELF REPORTING FORM */}
 <div className="rounded-xl bg-white border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
 <div className="pb-4 border-b border-gray-100 flex items-center space-x-2">
 <Briefcase className="h-5 w-5 text-indigo-500" />
 <div>
 <h3 className="text-base font-bold text-gray-900 ">
 {placement ? 'Update Career Placement Details' : 'Self-Report Your Employment Status'}
 </h3>
 <p className="text-xs text-gray-500 ">
 Your information will be kept confidential and used exclusively for vocational placement statistics
 </p>
 </div>
 </div>

 {recentlySuccessful && (
 <div className="p-4 rounded-2xl bg-govt-green-500/10 border border-govt-green-200 text-govt-green-500 text-xs font-semibold flex items-center space-x-2">
 <CheckCircle2 className="h-4 w-4 shrink-0" />
 <span>Your employment and placement details have been recorded successfully!</span>
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-6 text-xs">
 {/* EMPLOYMENT STATUS SELECTOR */}
 <div>
 <label className="block font-bold text-gray-700 mb-2">
 Primary Employment Status <span className="text-rose-500">*</span>
 </label>
 <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
 {[
 { id: 'employed', title: 'Formally Employed', desc: 'Working at a firm, company, or factory' },
 { id: 'self_employed', title: 'Self-Employed / Business', desc: 'Running your own workshop or freelance' },
 { id: 'higher_education', title: 'Higher Education', desc: 'Enrolled in DAE, Bachelor, or advanced course' },
 { id: 'unemployed', title: 'Seeking Opportunity', desc: 'Currently looking for placement' },
 ].map((opt) => (
 <label
 key={opt.id}
 className={`relative p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-2 ${
 data.employment_status === opt.id
 ? 'border-indigo-600 bg-govt-green-50/50 '
 : 'border-gray-200 hover:border-gray-200 :border-gray-200'
 }`}
 >
 <div className="flex items-center justify-between">
 <span className="font-extrabold text-gray-900 ">
 {opt.title}
 </span>
 <input
 type="radio"
 name="employment_status"
 value={opt.id}
 checked={data.employment_status === opt.id}
 onChange={(e) => setData('employment_status', e.target.value)}
 className="text-govt-green-500 focus:ring-govt-green-400 h-4 w-4"
 />
 </div>
 <p className="text-[11px] text-gray-500 leading-snug">
 {opt.desc}
 </p>
 </label>
 ))}
 </div>
 {errors.employment_status && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.employment_status}</p>
 )}
 </div>

 {/* EMPLOYMENT / SELF EMPLOYED / HIGHER ED DETAILS */}
 {(data.employment_status === 'employed' ||
 data.employment_status === 'self_employed' ||
 data.employment_status === 'higher_education') && (
 <div className="p-5 rounded-2xl bg-govt-cream border border-gray-200 space-y-4">
 <h4 className="font-bold text-gray-900 text-xs flex items-center space-x-1.5">
 <Building2 className="h-4 w-4 text-indigo-500" />
 <span>
 {data.employment_status === 'higher_education'
 ? 'Educational Institute & Degree Information'
 : 'Organization & Professional Role Information'}
 </span>
 </h4>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {/* Company / Institute Name */}
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 {data.employment_status === 'higher_education'
 ? 'University / Technical College Name'
 : data.employment_status === 'self_employed'
 ? 'Business / Workshop Name'
 : 'Employer / Company Name'}{' '}
 <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 placeholder={
 data.employment_status === 'higher_education'
 ? 'e.g. KFUEIT / Punjab University / GCT'
 : data.employment_status === 'self_employed'
 ? 'e.g. Ali Auto Electric Works'
 : 'e.g. Fatima Fertilizer / FFC / Textile Mills'
 }
 value={data.company_name}
 onChange={(e) => setData('company_name', e.target.value)}
 className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-govt-green-400/30 text-gray-900 "
 />
 {errors.company_name && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.company_name}</p>
 )}
 </div>

 {/* Designation / Degree */}
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 {data.employment_status === 'higher_education'
 ? 'Program / Degree Enrolled'
 : 'Designation / Job Title'}{' '}
 <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 placeholder={
 data.employment_status === 'higher_education'
 ? 'e.g. B.Sc Electrical / DAE Mechanical'
 : 'e.g. Junior Electrician / CNC Machinist / Welder'
 }
 value={data.designation}
 onChange={(e) => setData('designation', e.target.value)}
 className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-govt-green-400/30 text-gray-900 "
 />
 {errors.designation && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.designation}</p>
 )}
 </div>

 {/* Work Location */}
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 City / Work Location <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 placeholder="e.g. Rahim Yar Khan, Sadiqabad, Lahore, Dubai (UAE)"
 value={data.location}
 onChange={(e) => setData('location', e.target.value)}
 className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-govt-green-400/30 text-gray-900 "
 />
 {errors.location && (
 <p className="text-[11px] text-rose-500 mt-1">{errors.location}</p>
 )}
 </div>

 {/* Monthly Salary (Optional) */}
 {data.employment_status !== 'higher_education' && (
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Estimated Monthly Income (PKR) <span className="text-gray-500 font-normal">(Optional)</span>
 </label>
 <input
 type="number"
 min="0"
 step="1000"
 placeholder="e.g. 45000"
 value={data.monthly_salary}
 onChange={(e) => setData('monthly_salary', e.target.value)}
 className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-govt-green-400/30 text-gray-900 "
 />
 </div>
 )}

 {/* Placement Date */}
 <div>
 <label className="block font-bold text-gray-700 mb-1">
 Placement / Joining Date
 </label>
 <input
 type="date"
 value={data.placement_date}
 onChange={(e) => setData('placement_date', e.target.value)}
 className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 "
 />
 </div>
 </div>
 </div>
 )}

 {data.employment_status === 'unemployed' && (
 <div className="p-5 rounded-2xl bg-govt-gold-50 border border-govt-gold-200 text-amber-800 space-y-2">
 <div className="flex items-center space-x-2">
 <Compass className="h-5 w-5" />
 <span className="font-extrabold text-xs">GTTI Placement Cell Assistance Available</span>
 </div>
 <p className="text-[11px] leading-relaxed">
 Our placement wing frequently shares job requisitions from industrial partners in Rahim Yar Khan and Punjab. Keep your profile contact details updated so our placement coordinator can reach out with apprenticeship and technician opportunities.
 </p>
 </div>
 )}

 <div className="flex items-center justify-end pt-2">
 <button
 type="submit"
 disabled={processing}
 className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-govt-green-500 text-white font-extrabold text-xs transition shadow-md shadow-indigo-950/20 inline-flex items-center space-x-2 disabled:opacity-50"
 >
 <Send className="h-3.5 w-3.5" />
 <span>{processing ? 'Saving...' : 'Submit Placement Record'}</span>
 </button>
 </div>
 </form>
 </div>
 </div>
 </AuthenticatedLayout>
 );
}