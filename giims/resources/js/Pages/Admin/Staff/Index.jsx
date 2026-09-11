import { useState, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
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
  Layers,
  Phone,
  FileText,
  Trash2,
  ExternalLink,
  MapPin,
  Briefcase,
  DollarSign,
  FileCheck,
  X,
  UploadCloud,
  ChevronRight,
  Info
} from 'lucide-react';

export default function Index({ staff = [], roles = [], departments = [], filters = {} }) {
  const staffList = Array.isArray(staff) ? staff : (staff?.data || []);

  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState(filters.role || 'all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState(filters.department_id || 'all');
  const [showPassword, setShowPassword] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('credentials'); // 'credentials', 'personal', 'posting', 'residential', 'documents'
  const [selectedStaffDossier, setSelectedStaffDossier] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  // Form for HR Onboarding
  const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
    // Section A: Credentials
    name: '',
    email: '',
    password: '',
    role_id: '',

    // Section B: Personal Identity
    father_name: '',
    cnic: '',
    phone: '',
    emergency_contact: '',
    dob: '',
    gender: 'male',

    // Section C: Institutional Posting
    department_id: '',
    designation: '',
    employment_type: 'regular',
    salary_or_daily_rate: '',
    joining_date: new Date().toISOString().split('T')[0],
    highest_qualification: '',

    // Section D: Residential Details
    residential_address: '',
    permanent_address: '',

    // Section E: Documents
    profile_photo: null,
    cnic_front: null,
    cnic_back: null,
    cv_resume: null,
    experience_certificate: null,
  });

  // CNIC automatic formatting helper (XXXXX-XXXXXXX-X)
  const handleCnicChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 13) val = val.slice(0, 13);

    let formatted = val;
    if (val.length > 5 && val.length <= 12) {
      formatted = `${val.slice(0, 5)}-${val.slice(5)}`;
    } else if (val.length > 12) {
      formatted = `${val.slice(0, 5)}-${val.slice(5, 12)}-${val.slice(12, 13)}`;
    }
    setData('cnic', formatted);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.staff.store'), {
      forceFormData: true,
      onSuccess: () => {
        reset();
        setShowPassword(false);
        setIsOnboardingModalOpen(false);
        setActiveTab('credentials');
      },
    });
  };

  const handleDeleteStaff = (user) => {
    router.delete(route('admin.staff.destroy', user.id), {
      onSuccess: () => {
        setDeleteConfirmUser(null);
        if (selectedStaffDossier?.id === user.id) {
          setSelectedStaffDossier(null);
        }
      },
    });
  };

  // Filter staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter((member) => {
      const q = searchQuery.toLowerCase();
      const profile = member.staff_profile;

      const matchesSearch =
        member.name?.toLowerCase().includes(q) ||
        member.email?.toLowerCase().includes(q) ||
        member.cnic?.toLowerCase().includes(q) ||
        profile?.father_name?.toLowerCase().includes(q) ||
        profile?.designation?.toLowerCase().includes(q) ||
        profile?.cnic?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedRoleFilter !== 'all') {
        const hasRole = member.roles?.some(
          (r) => r.slug === selectedRoleFilter || String(r.id) === String(selectedRoleFilter)
        );
        if (!hasRole) return false;
      }

      if (selectedDeptFilter !== 'all') {
        if (String(profile?.department_id) !== String(selectedDeptFilter)) {
          return false;
        }
      }

      return true;
    });
  }, [staffList, searchQuery, selectedRoleFilter, selectedDeptFilter]);

  // Format role badge appearance
  const getRoleBadge = (role) => {
    const slug = role?.slug || '';
    const name = role?.name || 'Staff';

    switch (slug) {
      case 'super-admin':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-purple-50 text-purple-700 border border-purple-200 shadow-xs">
            <ShieldCheck className="h-3 w-3 text-purple-600" />
            <span>{name}</span>
          </span>
        );
      case 'principal':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
            <Award className="h-3 w-3 text-emerald-600" />
            <span>{name}</span>
          </span>
        );
      case 'trade-incharge':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
            <Layers className="h-3 w-3 text-blue-600" />
            <span>{name}</span>
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-amber-50 text-amber-800 border border-amber-200 shadow-xs">
            <GraduationCap className="h-3 w-3 text-amber-600" />
            <span>{name}</span>
          </span>
        );
      case 'admission-clerk':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-xs">
            <UserCheck className="h-3 w-3 text-cyan-600" />
            <span>{name}</span>
          </span>
        );
      case 'security-officer':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
            <Shield className="h-3 w-3 text-rose-600" />
            <span>{name}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-slate-100 text-slate-700 border border-slate-200">
            <Shield className="h-3 w-3 text-slate-500" />
            <span>{name}</span>
          </span>
        );
    }
  };

  const getEmploymentBadge = (type) => {
    switch (type) {
      case 'regular':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">Regular / Permanent</span>;
      case 'contract':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">Contractual</span>;
      case 'visiting':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-amber-100 text-amber-800 border border-amber-200">Visiting Faculty</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 text-slate-700">Not Specified</span>;
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-govt-green-500/10 text-emerald-700 border border-emerald-500/20 shadow-inner">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                Staff HR Management Desk
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-govt-green-500/15 text-emerald-800 border border-emerald-200">
                  Phase 36
                </span>
              </h1>
              <p className="text-xs text-gray-500">
                Register teachers and institutional staff with comprehensive biographical, posting, and credential records
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="open-onboarding-modal-btn"
              onClick={() => setIsOnboardingModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-md shadow-emerald-950/20 flex items-center space-x-2 transition cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>Onboard New Staff</span>
            </button>
          </div>
        </div>
      }
    >
      <Head title="Staff HR Management - GIIMS" />

      <div className="space-y-8">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Staff Members</p>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">{staffList.length}</h3>
              <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-0.5">
                <Check className="h-3 w-3" /> In institutional directory
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Departments</p>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">{departments.length}</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Active academic & admin wings</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">RBAC Roles</p>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">{roles.length}</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Security privileges</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Institute Campus</p>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight truncate">GTTI Rahim Yar Khan</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">TEVTA Punjab Reg.</p>
            </div>
          </div>
        </div>

        {/* Success Alert Banner */}
        {recentlySuccessful && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-3 animate-fade-in shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">HR Onboarding Successful</p>
              <p className="text-emerald-700 font-normal">
                Staff member credentials and comprehensive HR profile have been persisted to the institutional registry.
              </p>
            </div>
          </div>
        )}

        {/* Main Section: Data Table Listing Staff */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Controls & Filter Bar */}
          <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                Institutional Staff Directory
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                  {filteredStaff.length} {filteredStaff.length === 1 ? 'member' : 'members'}
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Faculty, instructors, administrative personnel, and support staff records
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Input */}
              <div className="relative min-w-[240px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  id="staff-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, CNIC, designation..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 text-gray-800 placeholder-gray-400 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Department Filter */}
              <div className="relative">
                <select
                  id="staff-dept-filter-select"
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="pl-3 pr-8 py-2 bg-white border border-gray-300 text-gray-800 font-medium rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition cursor-pointer appearance-none"
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-gray-400">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Role Filter Dropdown */}
              <div className="relative">
                <select
                  id="staff-role-filter-select"
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="pl-3 pr-8 py-2 bg-white border border-gray-300 text-gray-800 font-medium rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition cursor-pointer appearance-none"
                >
                  <option value="all">All Roles</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.slug}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-gray-400">
                  <Filter className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th scope="col" className="py-3.5 px-6">
                    Staff Member
                  </th>
                  <th scope="col" className="py-3.5 px-6">
                    Posting & Department
                  </th>
                  <th scope="col" className="py-3.5 px-6">
                    Contact & CNIC
                  </th>
                  <th scope="col" className="py-3.5 px-6">
                    Assigned Role
                  </th>
                  <th scope="col" className="py-3.5 px-6 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((member) => {
                    const profile = member.staff_profile;
                    const deptName = profile?.department?.name || 'General Administration';

                    return (
                      <tr
                        key={member.id}
                        className="hover:bg-gray-50/80 transition duration-150 group"
                      >
                        {/* Name & Avatar */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3.5">
                            {profile?.profile_photo_url ? (
                              <img
                                src={profile.profile_photo_url}
                                alt={member.name}
                                className="h-10 w-10 rounded-xl object-cover border border-gray-200 shadow-xs shrink-0"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs shadow-xs shrink-0 group-hover:scale-105 transition transform">
                                {getInitials(member.name)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-bold text-gray-900 group-hover:text-emerald-700 transition truncate">
                                {member.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {profile?.father_name ? `S/O, D/O: ${profile.father_name}` : `ID: #${member.id}`}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Posting & Department */}
                        <td className="py-4 px-6">
                          <div className="text-xs font-semibold text-gray-900">
                            {profile?.designation || 'Staff'}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                              {deptName}
                            </span>
                            {profile?.employment_type && getEmploymentBadge(profile.employment_type)}
                          </div>
                        </td>

                        {/* Contact & CNIC */}
                        <td className="py-4 px-6 text-xs text-gray-600">
                          <div className="flex items-center space-x-1.5 font-mono text-[11px] text-gray-800">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded font-semibold">
                              {profile?.cnic || member.cnic || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5 mt-1 text-gray-500">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>{profile?.phone || member.phone || 'No phone'}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-gray-500 truncate max-w-[200px]">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span>{member.email}</span>
                          </div>
                        </td>

                        {/* Role Badges */}
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1">
                            {member.roles && member.roles.length > 0 ? (
                              member.roles.map((role) => (
                                <span key={role.id}>{getRoleBadge(role)}</span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500 italic">No role</span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              id={`view-staff-dossier-btn-${member.id}`}
                              type="button"
                              onClick={() => setSelectedStaffDossier(member)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 flex items-center space-x-1 transition cursor-pointer"
                              title="View Full HR Dossier"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>Dossier</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmUser(member)}
                              className="p-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                              title="Delete Staff Member"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="max-w-sm mx-auto flex flex-col items-center">
                        <div className="h-14 w-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 mb-3">
                          <Users className="h-7 w-7" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 mb-1">
                          No Staff Accounts Found
                        </h4>
                        <p className="text-xs text-gray-500 mb-4">
                          {searchQuery || selectedRoleFilter !== 'all' || selectedDeptFilter !== 'all'
                            ? 'No staff members matched your current filter criteria.'
                            : 'No staff members have been onboarded yet. Click Onboard New Staff to register personnel.'}
                        </p>
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedRoleFilter('all');
                            setSelectedDeptFilter('all');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {filteredStaff.length} of {staffList.length} registered staff members
            </span>
            <div className="flex items-center space-x-2 text-[11px] text-gray-500">
              <Shield className="h-3.5 w-3.5 text-emerald-600" />
              <span>GTTI Institutional HR Registry</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5-SECTION HR ONBOARDING MODAL                                             */}
      {/* ========================================================================= */}
      {isOnboardingModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/20">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">Staff & Faculty HR Onboarding Desk</h3>
                  <p className="text-xs text-emerald-200">
                    Comprehensive 5-section personnel profile registration
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOnboardingModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Section Navigation Tabs */}
            <div className="px-6 pt-3 border-b border-gray-200 bg-gray-50 flex space-x-1 overflow-x-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('credentials')}
                className={`px-3.5 py-2.5 rounded-t-lg border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'credentials'
                    ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                <span>1. Account Credentials</span>
                {(errors.name || errors.email || errors.password || errors.role_id) && (
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className={`px-3.5 py-2.5 rounded-t-lg border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'personal'
                    ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>2. Personal Identity</span>
                {(errors.father_name || errors.cnic || errors.phone || errors.dob || errors.gender) && (
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('posting')}
                className={`px-3.5 py-2.5 rounded-t-lg border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'posting'
                    ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>3. Institutional Posting</span>
                {(errors.designation || errors.employment_type || errors.joining_date || errors.highest_qualification) && (
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('residential')}
                className={`px-3.5 py-2.5 rounded-t-lg border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'residential'
                    ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>4. Residential Details</span>
                {errors.residential_address && <span className="h-2 w-2 rounded-full bg-rose-500" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('documents')}
                className={`px-3.5 py-2.5 rounded-t-lg border-b-2 flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'documents'
                    ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <FileCheck className="h-3.5 w-3.5" />
                <span>5. Document Scans</span>
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* SECTION A: ACCOUNT CREDENTIALS */}
              {activeTab === 'credentials' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2">
                    <Info className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Provide secure login credentials and assign the authorized role for this staff member.</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="staff-onboard-name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g. Engr. Muhammad Rashid"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                        required
                      />
                      {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="staff-onboard-email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="e.g. rashid@gtti.edu.pk"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                        required
                      />
                      {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="staff-onboard-password"
                          type={showPassword ? 'text' : 'password'}
                          value={data.password}
                          onChange={(e) => setData('password', e.target.value)}
                          placeholder="Minimum 8 characters"
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Assigned Role <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="staff-onboard-role"
                        value={data.role_id}
                        onChange={(e) => setData('role_id', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none cursor-pointer"
                        required
                      >
                        <option value="" disabled>Select Institutional Role...</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name} ({role.slug})
                          </option>
                        ))}
                      </select>
                      {errors.role_id && <p className="text-xs text-rose-600 mt-1">{errors.role_id}</p>}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('personal')}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>Proceed to Personal Identity</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION B: PERSONAL IDENTITY */}
              {activeTab === 'personal' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Father's Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="staff-onboard-father-name"
                        type="text"
                        value={data.father_name}
                        onChange={(e) => setData('father_name', e.target.value)}
                        placeholder="Father or Guardian Name"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                        required
                      />
                      {errors.father_name && <p className="text-xs text-rose-600 mt-1">{errors.father_name}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        National Identity Card (CNIC) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="staff-onboard-cnic"
                        type="text"
                        value={data.cnic}
                        onChange={handleCnicChange}
                        placeholder="31202-1234567-1"
                        maxLength={15}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-mono text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                        required
                      />
                      <span className="text-[11px] text-gray-500 font-mono">Format: XXXXX-XXXXXXX-X</span>
                      {errors.cnic && <p className="text-xs text-rose-600 mt-1">{errors.cnic}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Primary Phone / Mobile <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="staff-onboard-phone"
                        type="text"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        placeholder="0300-1234567"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                        required
                      />
                      {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Emergency Contact Number
                      </label>
                      <input
                        id="staff-onboard-emergency-contact"
                        type="text"
                        value={data.emergency_contact}
                        onChange={(e) => setData('emergency_contact', e.target.value)}
                        placeholder="e.g. 0301-9876543 (Brother/Spouse)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                      />
                      {errors.emergency_contact && <p className="text-xs text-rose-600 mt-1">{errors.emergency_contact}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Date of Birth <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="staff-onboard-dob"
                        type="date"
                        value={data.dob}
                        onChange={(e) => setData('dob', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                        required
                      />
                      {errors.dob && <p className="text-xs text-rose-600 mt-1">{errors.dob}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Gender <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="staff-onboard-gender"
                        value={data.gender}
                        onChange={(e) => setData('gender', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none cursor-pointer"
                        required
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.gender && <p className="text-xs text-rose-600 mt-1">{errors.gender}</p>}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('credentials')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('posting')}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>Proceed to Institutional Posting</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION C: INSTITUTIONAL POSTING */}
              {activeTab === 'posting' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Department / Academic Wing
                      </label>
                      <select
                        id="staff-onboard-dept"
                        value={data.department_id}
                        onChange={(e) => setData('department_id', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none cursor-pointer"
                      >
                        <option value="">General Administration / Unassigned</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name} ({dept.code})
                          </option>
                        ))}
                      </select>
                      {errors.department_id && <p className="text-xs text-rose-600 mt-1">{errors.department_id}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Designation / Job Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="staff-onboard-designation"
                        type="text"
                        value={data.designation}
                        onChange={(e) => setData('designation', e.target.value)}
                        placeholder="e.g. Senior Trade Instructor, IT Officer"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                        required
                      />
                      {errors.designation && <p className="text-xs text-rose-600 mt-1">{errors.designation}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Employment Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="staff-onboard-emp-type"
                        value={data.employment_type}
                        onChange={(e) => setData('employment_type', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none cursor-pointer"
                        required
                      >
                        <option value="regular">Regular / Permanent</option>
                        <option value="contract">Contractual</option>
                        <option value="visiting">Visiting Faculty</option>
                      </select>
                      {errors.employment_type && <p className="text-xs text-rose-600 mt-1">{errors.employment_type}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Salary or Daily Rate (PKR)
                      </label>
                      <input
                        id="staff-onboard-salary"
                        type="number"
                        min="0"
                        step="500"
                        value={data.salary_or_daily_rate}
                        onChange={(e) => setData('salary_or_daily_rate', e.target.value)}
                        placeholder="e.g. 65000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                      />
                      {errors.salary_or_daily_rate && <p className="text-xs text-rose-600 mt-1">{errors.salary_or_daily_rate}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Joining Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="staff-onboard-joining-date"
                        type="date"
                        value={data.joining_date}
                        onChange={(e) => setData('joining_date', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                        required
                      />
                      {errors.joining_date && <p className="text-xs text-rose-600 mt-1">{errors.joining_date}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Highest Qualification <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="staff-onboard-qualification"
                        type="text"
                        value={data.highest_qualification}
                        onChange={(e) => setData('highest_qualification', e.target.value)}
                        placeholder="e.g. BS Computer Science, MS Mechanical, DAE"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                        required
                      />
                      {errors.highest_qualification && <p className="text-xs text-rose-600 mt-1">{errors.highest_qualification}</p>}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('personal')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('residential')}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>Proceed to Residential Details</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION D: RESIDENTIAL DETAILS */}
              {activeTab === 'residential' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Current Residential Address <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="staff-onboard-residential-address"
                      rows={3}
                      value={data.residential_address}
                      onChange={(e) => setData('residential_address', e.target.value)}
                      placeholder="Current street address, colony/town, city..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                      required
                    />
                    {errors.residential_address && <p className="text-xs text-rose-600 mt-1">{errors.residential_address}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Permanent Address (As on CNIC)
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setData('permanent_address', data.residential_address)}
                        className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Copy Current Address to Permanent
                      </button>
                    </div>
                    <textarea
                      id="staff-onboard-permanent-address"
                      rows={3}
                      value={data.permanent_address}
                      onChange={(e) => setData('permanent_address', e.target.value)}
                      placeholder="Official permanent address as stated on CNIC..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                    />
                    {errors.permanent_address && <p className="text-xs text-rose-600 mt-1">{errors.permanent_address}</p>}
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('posting')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('documents')}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>Proceed to Document Scans</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION E: DOCUMENT SCANS */}
              {activeTab === 'documents' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-600 flex items-center gap-2">
                    <UploadCloud className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Upload profile photo (max 2MB) and PDF/JPG document scans (max 5MB each).</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Profile Photo */}
                    <div className="p-3.5 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Profile Photo (JPG/PNG - Max 2MB)
                      </label>
                      <input
                        id="staff-onboard-photo-file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setData('profile_photo', e.target.files[0])}
                        className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
                      />
                      {errors.profile_photo && <p className="text-xs text-rose-600 mt-1">{errors.profile_photo}</p>}
                    </div>

                    {/* CNIC Front */}
                    <div className="p-3.5 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        CNIC Front Scan (PDF/Image - Max 5MB)
                      </label>
                      <input
                        id="staff-onboard-cnic-front-file"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setData('cnic_front', e.target.files[0])}
                        className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 cursor-pointer"
                      />
                      {errors.cnic_front && <p className="text-xs text-rose-600 mt-1">{errors.cnic_front}</p>}
                    </div>

                    {/* CNIC Back */}
                    <div className="p-3.5 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        CNIC Back Scan (PDF/Image - Max 5MB)
                      </label>
                      <input
                        id="staff-onboard-cnic-back-file"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setData('cnic_back', e.target.files[0])}
                        className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 cursor-pointer"
                      />
                      {errors.cnic_back && <p className="text-xs text-rose-600 mt-1">{errors.cnic_back}</p>}
                    </div>

                    {/* CV / Resume */}
                    <div className="p-3.5 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Curriculum Vitae / Resume (PDF/Doc - Max 5MB)
                      </label>
                      <input
                        id="staff-onboard-cv-file"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setData('cv_resume', e.target.files[0])}
                        className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-800 hover:file:bg-purple-200 cursor-pointer"
                      />
                      {errors.cv_resume && <p className="text-xs text-rose-600 mt-1">{errors.cv_resume}</p>}
                    </div>

                    {/* Experience Certificate */}
                    <div className="p-3.5 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Experience Certificate / Prior Service Letter (Max 5MB)
                      </label>
                      <input
                        id="staff-onboard-exp-file"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setData('experience_certificate', e.target.files[0])}
                        className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                      />
                      {errors.experience_certificate && <p className="text-xs text-rose-600 mt-1">{errors.experience_certificate}</p>}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setActiveTab('residential')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                    >
                      Back
                    </button>

                    <button
                      id="submit-staff-onboarding-btn"
                      type="submit"
                      disabled={processing}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-lg shadow-emerald-950/20 flex items-center space-x-2 transition disabled:opacity-60 cursor-pointer"
                    >
                      {processing ? (
                        <>
                          <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Registering Staff Member...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          <span>Complete Staff Registration</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAFF DOSSIER INSPECTION MODAL                                            */}
      {/* ========================================================================= */}
      {selectedStaffDossier && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Dossier Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {selectedStaffDossier.staff_profile?.profile_photo_url ? (
                  <img
                    src={selectedStaffDossier.staff_profile.profile_photo_url}
                    alt={selectedStaffDossier.name}
                    className="h-16 w-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-white/10 text-white border-2 border-white/20 flex items-center justify-center font-bold text-xl">
                    {getInitials(selectedStaffDossier.name)}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold tracking-tight">{selectedStaffDossier.name}</h3>
                  <p className="text-xs text-emerald-300 font-medium">
                    {selectedStaffDossier.staff_profile?.designation || 'Staff Member'} &bull;{' '}
                    {selectedStaffDossier.staff_profile?.department?.name || 'General Administration'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedStaffDossier.roles?.map((r) => (
                      <span key={r.id} className="text-[11px] bg-white/15 px-2 py-0.5 rounded font-mono">
                        {r.name}
                      </span>
                    ))}
                    {selectedStaffDossier.staff_profile?.employment_type && (
                      <span className="text-[11px] uppercase tracking-wider bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded font-bold">
                        {selectedStaffDossier.staff_profile.employment_type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStaffDossier(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Dossier Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Biographical Details Grid */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-emerald-600" />
                  <span>Biographical & Identity Information</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
                  <div>
                    <p className="text-gray-500">Father's Name</p>
                    <p className="font-bold text-gray-900">{selectedStaffDossier.staff_profile?.father_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">CNIC Number</p>
                    <p className="font-mono font-bold text-gray-900">{selectedStaffDossier.staff_profile?.cnic || selectedStaffDossier.cnic || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date of Birth</p>
                    <p className="font-bold text-gray-900">{formatDate(selectedStaffDossier.staff_profile?.dob)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Gender</p>
                    <p className="font-bold text-gray-900 capitalize">{selectedStaffDossier.staff_profile?.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Primary Phone</p>
                    <p className="font-bold text-gray-900">{selectedStaffDossier.staff_profile?.phone || selectedStaffDossier.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Emergency Contact</p>
                    <p className="font-bold text-gray-900">{selectedStaffDossier.staff_profile?.emergency_contact || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Institutional Posting & Academic Details */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-emerald-600" />
                  <span>Institutional Posting & Employment</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
                  <div>
                    <p className="text-gray-500">Department</p>
                    <p className="font-bold text-gray-900">{selectedStaffDossier.staff_profile?.department?.name || 'General Admin'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Designation</p>
                    <p className="font-bold text-gray-900">{selectedStaffDossier.staff_profile?.designation || 'Staff'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Employment Nature</p>
                    <p className="font-bold text-gray-900 capitalize">{selectedStaffDossier.staff_profile?.employment_type || 'Regular'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Joining Date</p>
                    <p className="font-bold text-gray-900">{formatDate(selectedStaffDossier.staff_profile?.joining_date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Highest Qualification</p>
                    <p className="font-bold text-gray-900">{selectedStaffDossier.staff_profile?.highest_qualification || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Remuneration / Rate</p>
                    <p className="font-bold text-gray-900">
                      {selectedStaffDossier.staff_profile?.salary_or_daily_rate ? `PKR ${Number(selectedStaffDossier.staff_profile.salary_or_daily_rate).toLocaleString()}` : 'Standard Grade'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span>Residential Addresses</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
                  <div>
                    <p className="text-gray-500 font-semibold mb-0.5">Current Residential Address</p>
                    <p className="text-gray-900">{selectedStaffDossier.staff_profile?.residential_address || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-semibold mb-0.5">Permanent Address</p>
                    <p className="text-gray-900">{selectedStaffDossier.staff_profile?.permanent_address || 'Same as current address'}</p>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                  <span>Verified Document Scans & Attachments</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* CNIC Front */}
                  <div className="p-3 rounded-xl border border-gray-200 bg-white text-center">
                    <p className="text-[11px] font-bold text-gray-700 mb-2">CNIC Front</p>
                    {selectedStaffDossier.staff_profile?.cnic_front_url ? (
                      <a
                        href={selectedStaffDossier.staff_profile.cnic_front_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>View Scan</span>
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Not Uploaded</span>
                    )}
                  </div>

                  {/* CNIC Back */}
                  <div className="p-3 rounded-xl border border-gray-200 bg-white text-center">
                    <p className="text-[11px] font-bold text-gray-700 mb-2">CNIC Back</p>
                    {selectedStaffDossier.staff_profile?.cnic_back_url ? (
                      <a
                        href={selectedStaffDossier.staff_profile.cnic_back_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>View Scan</span>
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Not Uploaded</span>
                    )}
                  </div>

                  {/* CV / Resume */}
                  <div className="p-3 rounded-xl border border-gray-200 bg-white text-center">
                    <p className="text-[11px] font-bold text-gray-700 mb-2">CV / Resume</p>
                    {selectedStaffDossier.staff_profile?.cv_resume_url ? (
                      <a
                        href={selectedStaffDossier.staff_profile.cv_resume_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Download CV</span>
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Not Uploaded</span>
                    )}
                  </div>

                  {/* Experience Certificate */}
                  <div className="p-3 rounded-xl border border-gray-200 bg-white text-center">
                    <p className="text-[11px] font-bold text-gray-700 mb-2">Experience Cert.</p>
                    {selectedStaffDossier.staff_profile?.experience_certificate_url ? (
                      <a
                        href={selectedStaffDossier.staff_profile.experience_certificate_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>View Cert.</span>
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Not Uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dossier Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Registered On: {formatDate(selectedStaffDossier.created_at)}
              </span>
              <button
                type="button"
                onClick={() => setSelectedStaffDossier(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 transition cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                                 */}
      {/* ========================================================================= */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Staff Account?</h3>
                <p className="text-xs text-gray-500">This action will revoke all system access</p>
              </div>
            </div>

            <p className="text-xs text-gray-600">
              Are you sure you want to permanently delete the staff account for{' '}
              <strong className="text-gray-900">{deleteConfirmUser.name}</strong> ({deleteConfirmUser.email})? Linked HR profile records and document files will also be removed.
            </p>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteStaff(deleteConfirmUser)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-950/20 transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
