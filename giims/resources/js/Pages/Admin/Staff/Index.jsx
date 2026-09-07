import { useState, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import {
 Users,
 UserPlus,
 Mail,
 Lock,
 Eye,
 EyeOff,
 Shield,
 ShieldCheck,
 CheckCircle2,
 Calendar,
 Search,
 Filter,
 Award,
 Building2,
 Check,
 Clock,
 AlertCircle,
 GraduationCap,
 Sparkles,
 UserCheck,
 Layers
} from 'lucide-react';

export default function Index({ staff = [], roles = [] }) {
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
 const [showPassword, setShowPassword] = useState(false);

 const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
 name: '',
 email: '',
 password: '',
 role_id: '',
 });

 const handleSubmit = (e) => {
 e.preventDefault();
 post(route('admin.staff.store'), {
 onSuccess: () => {
 reset();
 setShowPassword(false);
 },
 });
 };

 // Filter staff list based on search and role filter
 const filteredStaff = useMemo(() => {
 return staff.filter((member) => {
 const matchesSearch =
 member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 member.email.toLowerCase().includes(searchQuery.toLowerCase());

 if (!matchesSearch) return false;

 if (selectedRoleFilter === 'all') return true;
 return member.roles?.some((r) => r.slug === selectedRoleFilter || String(r.id) === String(selectedRoleFilter));
 });
 }, [staff, searchQuery, selectedRoleFilter]);

 // Format role badge appearance
 const getRoleBadge = (role) => {
 const slug = role?.slug || '';
 const name = role?.name || 'Staff';

 switch (slug) {
 case 'super-admin':
 return (
 <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-purple-50 text-purple-700 border border-purple-200 shadow-xs">
 <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
 <span>{name}</span>
 </span>
 );
 case 'principal':
 return (
 <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
 <Award className="h-3.5 w-3.5 text-emerald-600" />
 <span>{name}</span>
 </span>
 );
 case 'trade-incharge':
 return (
 <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
 <Layers className="h-3.5 w-3.5 text-blue-600" />
 <span>{name}</span>
 </span>
 );
 case 'teacher':
 return (
 <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-amber-50 text-amber-800 border border-amber-200 shadow-xs">
 <GraduationCap className="h-3.5 w-3.5 text-amber-600" />
 <span>{name}</span>
 </span>
 );
 case 'admission-clerk':
 return (
 <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-xs">
 <UserCheck className="h-3.5 w-3.5 text-cyan-600" />
 <span>{name}</span>
 </span>
 );
 case 'security-officer':
 return (
 <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
 <Shield className="h-3.5 w-3.5 text-rose-600" />
 <span>{name}</span>
 </span>
 );
 default:
 return (
 <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-slate-100 text-slate-700 border border-slate-200">
 <Shield className="h-3.5 w-3.5 text-slate-500" />
 <span>{name}</span>
 </span>
 );
 }
 };

 const formatDate = (dateStr) => {
 if (!dateStr) return 'N/A';
 try {
 return new Date(dateStr).toLocaleDateString('en-US', {
 year: 'numeric',
 month: 'short',
 day: 'numeric',
 });
 } catch {
 return dateStr;
 }
 };

 const getInitials = (name) => {
 if (!name) return 'S';
 return name
 .split(' ')
 .map((n) => n[0])
 .slice(0, 2)
 .join('')
 .toUpperCase();
 };

 return (
 <AdminLayout
 header={
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <div className="p-2.5 rounded-2xl bg-govt-green-500/10 text-indigo-600 border border-indigo-500/20 shadow-inner">
 <Users className="h-6 w-6" />
 </div>
 <div>
 <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
 Staff & Role Management
 <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-govt-green-500/15 text-govt-green-400 border border-govt-green-200">
 Phase 16
 </span>
 </h1>
 <p className="text-xs text-gray-500">
 Provision administrative and academic personnel accounts, configure system roles, and govern permissions
 </p>
 </div>
 </div>

 <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 px-3.5 py-1.5 rounded-full shadow-sm">
 <span className="h-2 w-2 rounded-full bg-govt-green-400 animate-ping" />
 <span>{staff.length} Active Staff {staff.length === 1 ? 'Member' : 'Members'}</span>
 </div>
 </div>
 }
 >
 <Head title="Staff Management - GIIMS" />

 <div className="space-y-8">
 {/* Metric Summary Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-govt-lg flex items-center space-x-4">
 <div className="h-12 w-12 rounded-xl bg-govt-green-500/10 text-indigo-600 flex items-center justify-center border border-indigo-500/20 shrink-0">
 <Users className="h-6 w-6" />
 </div>
 <div>
 <p className="text-xs text-gray-500 font-medium">Total Staff Accounts</p>
 <h3 className="text-2xl font-black text-gray-900 tracking-tight">{staff.length}</h3>
 <p className="text-[11px] text-govt-green-500 flex items-center gap-1 mt-0.5">
 <Check className="h-3 w-3" /> All active in directory
 </p>
 </div>
 </div>

 <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-govt-lg flex items-center space-x-4">
 <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 shrink-0">
 <ShieldCheck className="h-6 w-6" />
 </div>
 <div>
 <p className="text-xs text-gray-500 font-medium">Assignable Roles</p>
 <h3 className="text-2xl font-black text-gray-900 tracking-tight">{roles.length}</h3>
 <p className="text-[11px] text-gray-500 mt-0.5">Excludes student accounts</p>
 </div>
 </div>

 <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-govt-lg flex items-center space-x-4">
 <div className="h-12 w-12 rounded-xl bg-govt-green-500/10 text-govt-green-500 flex items-center justify-center border border-govt-green-200 shrink-0">
 <Building2 className="h-6 w-6" />
 </div>
 <div>
 <p className="text-xs text-gray-500 font-medium">Institute Scope</p>
 <h3 className="text-2xl font-black text-gray-900 tracking-tight">GTTI RYK</h3>
 <p className="text-[11px] text-gray-500 mt-0.5">Role-Based Access Control</p>
 </div>
 </div>
 </div>

 {/* Top Section: Add New Staff Member Form */}
 <div className="rounded-2xl bg-white border border-gray-200 shadow-govt-lg p-6 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-96 h-96 bg-govt-green-500/5 rounded-full blur-3xl pointer-events-none" />

 <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
 <div className="flex items-center space-x-3">
 <div className="h-10 w-10 rounded-xl bg-govt-green-500/10 text-indigo-600 border border-indigo-500/20 flex items-center justify-center shadow-inner">
 <UserPlus className="h-5 w-5" />
 </div>
 <div>
 <h2 className="text-lg font-bold text-gray-900">Add New Staff Member</h2>
 <p className="text-xs text-gray-500">
 Provision an institutional user account and assign dedicated administrative or academic roles
 </p>
 </div>
 </div>
 <span className="text-[11px] font-semibold text-gray-500 hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-govt-cream-300 border border-gray-200">
 <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
 Instant Access Provisioning
 </span>
 </div>

 {/* Success Alert Banner */}
 {recentlySuccessful && (
 <div className="mb-6 p-4 rounded-xl bg-govt-green-500/10 border border-govt-green-200 text-govt-green-400 text-xs font-semibold flex items-center space-x-3 animate-fade-in shadow-lg shadow-emerald-950/40">
 <CheckCircle2 className="h-5 w-5 text-govt-green-500 shrink-0" />
 <div>
 <p className="font-bold text-emerald-200">Staff Account Created Successfully</p>
 <p className="text-govt-green-500 font-normal">
 The user has been securely registered and assigned their role. They can now log in immediately.
 </p>
 </div>
 </div>
 )}

 <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
 {/* Full Name */}
 <div>
 <label
 htmlFor="staff-name-input"
 className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2"
 >
 Full Name <span className="text-rose-600">*</span>
 </label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
 <Users className="h-4 w-4" />
 </div>
 <input
 id="staff-name-input"
 type="text"
 value={data.name}
 onChange={(e) => setData('name', e.target.value)}
 placeholder="e.g. Engr. Tariq Mehmood"
 autoComplete="off"
 className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border text-slate-900 placeholder-slate-400 rounded-xl text-sm transition focus:outline-none focus:bg-white focus:ring-2 ${
 errors.name
 ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
 : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-500/20'
 }`}
 required
 />
 </div>
 {errors.name && (
 <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
 <AlertCircle className="h-3.5 w-3.5" />
 {errors.name}
 </p>
 )}
 </div>

 {/* Email Address */}
 <div>
 <label
 htmlFor="staff-email-input"
 className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2"
 >
 Email Address <span className="text-rose-600">*</span>
 </label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
 <Mail className="h-4 w-4" />
 </div>
 <input
 id="staff-email-input"
 type="email"
 value={data.email}
 onChange={(e) => setData('email', e.target.value)}
 placeholder="e.g. tariq@gtti.edu.pk"
 autoComplete="off"
 className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border text-slate-900 placeholder-slate-400 rounded-xl text-sm transition focus:outline-none focus:bg-white focus:ring-2 ${
 errors.email
 ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
 : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-500/20'
 }`}
 required
 />
 </div>
 {errors.email && (
 <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
 <AlertCircle className="h-3.5 w-3.5" />
 {errors.email}
 </p>
 )}
 </div>

 {/* Password */}
 <div>
 <label
 htmlFor="staff-password-input"
 className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2"
 >
 Password <span className="text-rose-600">*</span>
 </label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
 <Lock className="h-4 w-4" />
 </div>
 <input
 id="staff-password-input"
 type={showPassword ? 'text' : 'password'}
 value={data.password}
 onChange={(e) => setData('password', e.target.value)}
 placeholder="Min. 8 characters"
 autoComplete="new-password"
 className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border text-slate-900 placeholder-slate-400 rounded-xl text-sm transition focus:outline-none focus:bg-white focus:ring-2 ${
 errors.password
 ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
 : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-500/20'
 }`}
 required
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-600 focus:outline-none"
 aria-label={showPassword ? 'Hide password' : 'Show password'}
 >
 {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
 </button>
 </div>
 {errors.password && (
 <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
 <AlertCircle className="h-3.5 w-3.5" />
 {errors.password}
 </p>
 )}
 </div>

 {/* Role Selection Dropdown */}
 <div>
 <label
 htmlFor="staff-role-select"
 className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2"
 >
 Assigned Role <span className="text-rose-600">*</span>
 </label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
 <ShieldCheck className="h-4 w-4" />
 </div>
 <select
 id="staff-role-select"
 value={data.role_id}
 onChange={(e) => setData('role_id', e.target.value)}
 className={`w-full pl-10 pr-8 py-2.5 bg-slate-50 border text-slate-900 font-medium rounded-xl text-sm transition focus:outline-none focus:bg-white focus:ring-2 appearance-none cursor-pointer ${
 errors.role_id
 ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
 : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-500/20'
 }`}
 required
 >
 <option value="" disabled className="text-slate-400 bg-white font-normal">
 Select an institutional role...
 </option>
 {roles.map((role) => (
 <option key={role.id} value={role.id} className="bg-white text-slate-900 font-medium py-1.5">
 {role.name} ({role.slug})
 </option>
 ))}
 </select>
 </div>
 {errors.role_id && (
 <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
 <AlertCircle className="h-3.5 w-3.5" />
 {errors.role_id}
 </p>
 )}
 </div>
 </div>

 {/* Form Submit Footer */}
 <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
 <p className="text-xs text-gray-500">
 Passwords are automatically hashed with Bcrypt before persistence.
 </p>

 <div className="flex items-center space-x-3">
 <button
 type="button"
 onClick={() => reset()}
 disabled={processing}
 className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-govt-cream-300 transition disabled:opacity-50"
 >
 Clear Form
 </button>

 <button
 id="create-staff-submit-btn"
 type="submit"
 disabled={processing}
 className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-950/50 flex items-center space-x-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
 >
 {processing ? (
 <>
 <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
 <span>Creating Account...</span>
 </>
 ) : (
 <>
 <UserPlus className="h-4 w-4" />
 <span>Create Staff Account</span>
 </>
 )}
 </button>
 </div>
 </div>
 </form>
 </div>

 {/* Main Section: Data Table Listing Staff */}
 <div className="rounded-2xl bg-white border border-gray-200 shadow-govt-lg overflow-hidden">
 {/* Table Controls & Filter Bar */}
 <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50">
 <div>
 <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
 Institutional Staff Directory
 <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-govt-cream-300 text-gray-600 border border-gray-200">
 {filteredStaff.length} {filteredStaff.length === 1 ? 'member' : 'members'}
 </span>
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 Active non-student users with authorized role privileges
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-3">
 {/* Search Input */}
 <div className="relative min-w-[240px]">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
 <Search className="h-4 w-4" />
 </div>
 <input
 id="staff-search-input"
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search by name or email..."
 className="w-full pl-9 pr-4 py-2 bg-govt-cream-300 border border-gray-200 text-gray-800 placeholder-slate-500 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-govt-green-400/20 focus:border-govt-green-500 transition"
 />
 {searchQuery && (
 <button
 onClick={() => setSearchQuery('')}
 className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-500 hover:text-gray-600"
 >
 ✕
 </button>
 )}
 </div>

 {/* Role Filter Dropdown */}
 <div className="relative">
 <select
 id="staff-role-filter-select"
 value={selectedRoleFilter}
 onChange={(e) => setSelectedRoleFilter(e.target.value)}
 className="pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition cursor-pointer appearance-none"
 >
 <option value="all" className="bg-white text-slate-900 font-medium">All Roles</option>
 {roles.map((role) => (
 <option key={role.id} value={role.slug} className="bg-white text-slate-900 font-medium">
 {role.name}
 </option>
 ))}
 </select>
 <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
 <Filter className="h-3.5 w-3.5" />
 </div>
 </div>
 </div>
 </div>

 {/* Data Table */}
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm text-slate-600">
 <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
 <tr>
 <th scope="col" className="py-3.5 px-6">
 Staff Member
 </th>
 <th scope="col" className="py-3.5 px-6">
 Email Address
 </th>
 <th scope="col" className="py-3.5 px-6">
 Assigned Role
 </th>
 <th scope="col" className="py-3.5 px-6">
 Date Added
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {filteredStaff.length > 0 ? (
 filteredStaff.map((member) => (
 <tr
 key={member.id}
 className="hover:bg-slate-50/80 transition duration-150 group"
 >
 {/* Name & Avatar */}
 <td className="py-4 px-6">
 <div className="flex items-center space-x-3.5">
 <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs shadow-xs shrink-0 group-hover:scale-105 transition transform">
 {getInitials(member.name)}
 </div>
 <div className="min-w-0">
 <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition truncate">
 {member.name}
 </div>
 <div className="text-[11px] font-mono text-slate-500">
 ID: #{member.id}
 </div>
 </div>
 </div>
 </td>

 {/* Email */}
 <td className="py-4 px-6 font-mono text-xs text-gray-600">
 <div className="flex items-center space-x-2">
 <Mail className="h-3.5 w-3.5 text-gray-500" />
 <span className="truncate max-w-[220px]">{member.email}</span>
 </div>
 </td>

 {/* Role Badges */}
 <td className="py-4 px-6">
 <div className="flex flex-wrap gap-1.5">
 {member.roles && member.roles.length > 0 ? (
 member.roles.map((role) => (
 <span key={role.id}>{getRoleBadge(role)}</span>
 ))
 ) : (
 <span className="text-xs text-gray-500 italic">No role assigned</span>
 )}
 </div>
 </td>

 {/* Date Added */}
 <td className="py-4 px-6 text-xs text-gray-500">
 <div className="flex items-center space-x-2">
 <Calendar className="h-3.5 w-3.5 text-gray-500" />
 <span>{formatDate(member.created_at)}</span>
 </div>
 </td>
 </tr>
 ))
 ) : (
 <tr>
 <td colSpan={4} className="py-16 text-center">
 <div className="max-w-sm mx-auto flex flex-col items-center">
 <div className="h-14 w-14 rounded-2xl bg-govt-cream-300 border border-gray-200 flex items-center justify-center text-gray-500 mb-3">
 <Users className="h-7 w-7" />
 </div>
 <h4 className="text-sm font-bold text-gray-900 mb-1">
 No Staff Accounts Found
 </h4>
 <p className="text-xs text-gray-500 mb-4">
 {searchQuery || selectedRoleFilter !== 'all'
 ? 'No staff members matched your current filter criteria.'
 : 'No staff members have been added yet. Create the first staff member above.'}
 </p>
 {(searchQuery || selectedRoleFilter !== 'all') && (
 <button
 onClick={() => {
 setSearchQuery('');
 setSelectedRoleFilter('all');
 }}
 className="px-3.5 py-1.5 rounded-xl bg-govt-cream-300 text-gray-600 text-xs font-semibold hover:bg-govt-green-50 transition"
 >
 Clear Filters
 </button>
 )}
 </div>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>

 {/* Table Footer */}
 <div className="p-4 bg-govt-cream-300/60 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
 <span>
 Showing {filteredStaff.length} of {staff.length} registered staff members
 </span>
 <div className="flex items-center space-x-2 text-[11px] text-gray-500">
 <Shield className="h-3.5 w-3.5 text-govt-green-500" />
 <span>System RBAC Enforced</span>
 </div>
 </div>
 </div>
 </div>
 </AdminLayout>
 );
}
