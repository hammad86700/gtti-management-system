import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import {
 Briefcase,
 Building2,
 GraduationCap,
 TrendingUp,
 CheckCircle2,
 Clock,
 Search,
 Filter,
 DollarSign,
 MapPin,
 Calendar,
 Inbox,
 UserCheck,
 AlertCircle,
 BadgePercent
} from 'lucide-react';

export default function Index({ placements = [], stats = {} }) {
 const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'employed' | 'self_employed' | 'higher_education' | 'unemployed'
 const [searchQuery, setSearchQuery] = useState('');

 const filteredPlacements = placements.filter((p) => {
 const studentUser = p.student_profile?.user;
 const studentName = studentUser?.name || '';
 const company = p.company_name || '';
 const designation = p.designation || '';
 const location = p.location || '';

 const matchesSearch =
 studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 company.toLowerCase().includes(searchQuery.toLowerCase()) ||
 designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
 location.toLowerCase().includes(searchQuery.toLowerCase());

 if (!matchesSearch) return false;

 if (statusFilter === 'all') return true;
 return p.employment_status === statusFilter;
 });

 const getStatusBadge = (status) => {
 switch (status) {
 case 'employed':
 return (
 <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-govt-green-500/15 text-emerald-700 border border-govt-green-200">
 <CheckCircle2 className="h-2.5 w-2.5" />
 <span>Employed</span>
 </span>
 );
 case 'self_employed':
 return (
 <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-700 border border-blue-500/30">
 <TrendingUp className="h-2.5 w-2.5" />
 <span>Self-Employed</span>
 </span>
 );
 case 'higher_education':
 return (
 <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-700 border border-purple-500/30">
 <GraduationCap className="h-2.5 w-2.5" />
 <span>Higher Ed</span>
 </span>
 );
 case 'unemployed':
 return (
 <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-govt-gold-50 text-amber-700 border border-govt-gold-200">
 <Clock className="h-2.5 w-2.5" />
 <span>Job Seeking</span>
 </span>
 );
 default:
 return (
 <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-govt-cream-300 text-gray-600 ">
 {status}
 </span>
 );
 }
 };

 return (
 <AdminLayout
 header={
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <div className="p-2 rounded-2xl bg-govt-green-500/10 text-govt-green-500 border border-indigo-500/20">
 <Briefcase className="h-6 w-6" />
 </div>
 <div>
 <h2 className="text-xl font-bold leading-tight text-gray-800 ">
 Alumni & Career Placement Statistics
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 Post-graduation career tracking, industrial employment rate, and higher education metrics
 </p>
 </div>
 </div>

 <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-govt-green-500/10 text-govt-green-500 border border-govt-green-200">
 <BadgePercent className="h-3.5 w-3.5" />
 <span>{stats.employment_rate ?? 0}% Placement Rate</span>
 </span>
 </div>
 }
 >
 <Head title="Alumni Placements - GIIMS Admin" />

 <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
 {/* MINI STAT CARDS */}
 <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
 <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
 <div className="flex items-center justify-between">
 <span className="text-[10px] text-gray-500 font-bold uppercase">Total Reports</span>
 <UserCheck className="h-4 w-4 text-indigo-500" />
 </div>
 <p className="text-2xl font-black text-gray-900 mt-2">
 {stats.total_reported ?? 0}
 </p>
 </div>

 <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
 <div className="flex items-center justify-between">
 <span className="text-[10px] text-gray-500 font-bold uppercase">Gainfully Employed</span>
 <CheckCircle2 className="h-4 w-4 text-govt-green-500" />
 </div>
 <p className="text-2xl font-black text-govt-green-500 mt-2">
 {stats.total_working ?? 0}
 </p>
 </div>

 <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
 <div className="flex items-center justify-between">
 <span className="text-[10px] text-gray-500 font-bold uppercase">Employment Rate</span>
 <BadgePercent className="h-4 w-4 text-govt-green-500" />
 </div>
 <p className="text-2xl font-black text-gray-900 mt-2">
 {stats.employment_rate ?? 0}%
 </p>
 </div>

 <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
 <div className="flex items-center justify-between">
 <span className="text-[10px] text-gray-500 font-bold uppercase">Higher Education</span>
 <GraduationCap className="h-4 w-4 text-purple-500" />
 </div>
 <p className="text-2xl font-black text-purple-600 mt-2">
 {stats.higher_education ?? 0}
 </p>
 </div>

 <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm col-span-2 sm:col-span-1">
 <div className="flex items-center justify-between">
 <span className="text-[10px] text-gray-500 font-bold uppercase">Seeking Jobs</span>
 <Clock className="h-4 w-4 text-govt-gold" />
 </div>
 <p className="text-2xl font-black text-amber-600 mt-2">
 {stats.unemployed ?? 0}
 </p>
 </div>
 </div>

 {/* MAIN TABLE SECTION */}
 <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
 {/* SEARCH & FILTERS */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 ">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
 <input
 type="text"
 placeholder="Search by alumni candidate, company, designation, or city..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-9 pr-4 py-2 bg-govt-cream border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-govt-green-400/30 text-gray-900 "
 />
 </div>

 <div className="flex items-center p-1 bg-govt-cream-300 rounded-2xl border border-gray-200 text-xs font-bold shrink-0">
 <button
 type="button"
 onClick={() => setStatusFilter('all')}
 className={`px-3 py-1.5 rounded-xl transition ${
 statusFilter === 'all'
 ? 'bg-white text-gray-900 shadow-sm'
 : 'text-gray-500 hover:text-gray-900 :text-white'
 }`}
 >
 All ({placements.length})
 </button>
 <button
 type="button"
 onClick={() => setStatusFilter('employed')}
 className={`px-3 py-1.5 rounded-xl transition ${
 statusFilter === 'employed'
 ? 'bg-white text-govt-green-500 shadow-sm'
 : 'text-gray-500 hover:text-gray-900 :text-white'
 }`}
 >
 Employed ({stats.employed ?? 0})
 </button>
 <button
 type="button"
 onClick={() => setStatusFilter('self_employed')}
 className={`px-3 py-1.5 rounded-xl transition ${
 statusFilter === 'self_employed'
 ? 'bg-white text-blue-600 shadow-sm'
 : 'text-gray-500 hover:text-gray-900 :text-white'
 }`}
 >
 Self-Employed ({stats.self_employed ?? 0})
 </button>
 <button
 type="button"
 onClick={() => setStatusFilter('higher_education')}
 className={`px-3 py-1.5 rounded-xl transition ${
 statusFilter === 'higher_education'
 ? 'bg-white text-purple-600 shadow-sm'
 : 'text-gray-500 hover:text-gray-900 :text-white'
 }`}
 >
 Higher Ed ({stats.higher_education ?? 0})
 </button>
 <button
 type="button"
 onClick={() => setStatusFilter('unemployed')}
 className={`px-3 py-1.5 rounded-xl transition ${
 statusFilter === 'unemployed'
 ? 'bg-white text-amber-600 shadow-sm'
 : 'text-gray-500 hover:text-gray-900 :text-white'
 }`}
 >
 Seeking ({stats.unemployed ?? 0})
 </button>
 </div>
 </div>

 {/* PLACEMENTS TABLE */}
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="text-gray-500 border-b border-gray-100 ">
 <th className="pb-3 font-semibold">Alumnus Graduate</th>
 <th className="pb-3 font-semibold">Course / Trade</th>
 <th className="pb-3 font-semibold text-center">Status</th>
 <th className="pb-3 font-semibold">Employer / Institute</th>
 <th className="pb-3 font-semibold">Designation / Role</th>
 <th className="pb-3 font-semibold">Location</th>
 <th className="pb-3 font-semibold text-right">Income (PKR)</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
 {filteredPlacements.map((p) => {
 const profile = p.student_profile;
 const studentUser = profile?.user;
 const enrollment = profile?.enrollments?.[0];

 return (
 <tr key={p.id} className="hover:bg-govt-green-50 :bg-white/50 transition">
 {/* Student Name */}
 <td className="py-4">
 <p className="font-extrabold text-gray-900 text-sm">
 {studentUser?.name || 'Alumnus Trainee'}
 </p>
 {enrollment?.enrollment_number && (
 <p className="text-[10px] font-mono text-govt-green-500 font-bold">
 {enrollment.enrollment_number}
 </p>
 )}
 </td>

 {/* Trade */}
 <td className="py-4">
 <p className="font-bold text-gray-900 ">
 {enrollment?.course?.name || 'Vocational Trade'}
 </p>
 <p className="text-[10px] text-gray-500">
 {enrollment?.batch?.name || 'GTTI Alumni'}
 </p>
 </td>

 {/* Status Badge */}
 <td className="py-4 text-center">
 {getStatusBadge(p.employment_status)}
 </td>

 {/* Company / Institute */}
 <td className="py-4">
 {p.company_name ? (
 <div className="flex items-center space-x-1.5 font-bold text-gray-900 ">
 <Building2 className="h-3.5 w-3.5 text-gray-500 shrink-0" />
 <span>{p.company_name}</span>
 </div>
 ) : (
 <span className="text-gray-500 italic">—</span>
 )}
 </td>

 {/* Designation */}
 <td className="py-4">
 {p.designation ? (
 <span className="font-semibold text-gray-800 ">
 {p.designation}
 </span>
 ) : (
 <span className="text-gray-500 italic">—</span>
 )}
 </td>

 {/* Location */}
 <td className="py-4">
 {p.location ? (
 <div className="flex items-center space-x-1 text-gray-500 ">
 <MapPin className="h-3 w-3 text-gray-500 shrink-0" />
 <span>{p.location}</span>
 </div>
 ) : (
 <span className="text-gray-500 italic">—</span>
 )}
 </td>

 {/* Monthly Salary */}
 <td className="py-4 text-right">
 {p.monthly_salary ? (
 <span className="font-mono font-bold text-govt-green-500 text-xs">
 Rs. {Number(p.monthly_salary).toLocaleString()}
 </span>
 ) : (
 <span className="text-gray-500 text-[11px]">—</span>
 )}
 </td>
 </tr>
 );
 })}

 {filteredPlacements.length === 0 && (
 <tr>
 <td colSpan="7" className="text-center py-12 text-gray-500">
 <Inbox className="h-8 w-8 mx-auto mb-2 text-gray-500" />
 <p>No alumni placement records found matching the filter.</p>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </AdminLayout>
 );
}