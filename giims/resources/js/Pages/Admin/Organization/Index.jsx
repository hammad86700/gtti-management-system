import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import {
 Building2,
 BookOpen,
 GraduationCap,
 Layers,
 Search,
 Clock,
 Award,
 CheckCircle2,
 ChevronDown,
 ChevronUp,
 Sparkles
} from 'lucide-react';

export default function Index({ departments = [] }) {
 const [searchTerm, setSearchTerm] = useState('');
 const [expandedDepts, setExpandedDepts] = useState(
 departments.reduce((acc, d) => ({ ...acc, [d.id]: true }), {})
 );

 const toggleDept = (deptId) => {
 setExpandedDepts((prev) => ({
 ...prev,
 [deptId]: !prev[deptId],
 }));
 };

 // Aggregate statistics
 const totalPrograms = departments.reduce((acc, d) => acc + (d.programs?.length || 0), 0);
 const totalTrades = departments.reduce(
 (acc, d) => acc + (d.programs?.reduce((pAcc, p) => pAcc + (p.trades?.length || 0), 0) || 0),
 0
 );

 // Filter departments/trades based on search
 const filteredDepartments = departments.filter((dept) => {
 const matchesDeptName = dept.name.toLowerCase().includes(searchTerm.toLowerCase());
 const matchesDeptCode = dept.code.toLowerCase().includes(searchTerm.toLowerCase());
 const matchesTrade = dept.programs?.some((p) =>
 p.trades?.some((t) =>
 t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 (t.code && t.code.toLowerCase().includes(searchTerm.toLowerCase()))
 )
 );
 return matchesDeptName || matchesDeptCode || matchesTrade;
 });

 return (
 <AdminLayout
 header={
 <div>
 <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Organization & Academic Hierarchy</h1>
 <p className="text-xs text-gray-500">Govt. Technical Training Institute, Rahim Yar Khan (GTTI-RYK)</p>
 </div>
 }
 >
 <Head title="Organization & Trades - GIIMS" />

 <div className="space-y-6">
 {/* Stats Summary Bar */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-lg flex items-center space-x-4">
 <div className="h-12 w-12 rounded-xl bg-govt-green-500/10 text-govt-green-500 flex items-center justify-center border border-govt-green-200">
 <Building2 className="h-6 w-6" />
 </div>
 <div>
 <p className="text-xs text-gray-500 font-medium">Departments</p>
 <h3 className="text-2xl font-bold text-gray-900">{departments.length}</h3>
 <p className="text-[11px] text-gray-500">Active Academic Wings</p>
 </div>
 </div>

 <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-lg flex items-center space-x-4">
 <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
 <BookOpen className="h-6 w-6" />
 </div>
 <div>
 <p className="text-xs text-gray-500 font-medium">Programs</p>
 <h3 className="text-2xl font-bold text-gray-900">{totalPrograms}</h3>
 <p className="text-[11px] text-gray-500">G-II, G-III & CBT&A Tracks</p>
 </div>
 </div>

 <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-lg flex items-center space-x-4">
 <div className="h-12 w-12 rounded-xl bg-govt-gold-50 text-govt-gold-600 flex items-center justify-center border border-govt-gold-200">
 <GraduationCap className="h-6 w-6" />
 </div>
 <div>
 <p className="text-xs text-gray-500 font-medium">Approved Trades</p>
 <h3 className="text-2xl font-bold text-gray-900">{totalTrades}</h3>
 <p className="text-[11px] text-gray-500">Accredited Technical Courses</p>
 </div>
 </div>
 </div>

 {/* Filter and Search Bar */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-white border border-gray-200 shadow-md">
 <div className="relative flex-1 max-w-md">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
 <input
 type="text"
 placeholder="Search by Department, Trade, or Code..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full pl-10 pr-4 py-2 bg-govt-cream-300 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-govt-green-400/50"
 />
 </div>
 <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>Showing <strong className="text-gray-900 font-bold">{filteredDepartments.length}</strong> of {departments.length} departments</span>
 </div>
 </div>

 {/* Departments List */}
 <div className="space-y-5">
 {filteredDepartments.map((dept) => {
 const isExpanded = expandedDepts[dept.id] ?? true;
 const deptTradesCount = dept.programs?.reduce(
 (acc, p) => acc + (p.trades?.length || 0),
 0
 );

 return (
 <div
 key={dept.id}
 className="overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-lg transition-all"
 >
 {/* Department Accordion Header */}
                <div
                    onClick={() => toggleDept(dept.id)}
                    className="p-5 flex items-center justify-between cursor-pointer bg-white hover:bg-govt-green-50/60 border-b border-gray-200 transition"
                >
                    <div className="flex items-center space-x-3.5">
                        <div className="h-10 w-10 rounded-xl bg-govt-green text-white flex items-center justify-center shadow-sm">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                                    {dept.name}
                                </h3>
                                <span className="px-2 py-0.5 rounded bg-govt-green-50 border border-govt-green-200 text-govt-green font-mono text-[11px] font-bold">
                                    {dept.code}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {dept.programs?.length || 0} Programs • {deptTradesCount} Trades/Courses
                            </p>
                        </div>
                    </div>

 <div className="flex items-center space-x-3">
 <span className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-govt-green-500/10 text-govt-green-500 border border-govt-green-200">
 <CheckCircle2 className="h-3.5 w-3.5" />
 <span>Active</span>
 </span>
 <button className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-govt-cream-300">
 {isExpanded ? (
 <ChevronUp className="h-5 w-5" />
 ) : (
 <ChevronDown className="h-5 w-5" />
 )}
 </button>
 </div>
 </div>

 {/* Department Programs and Trades Content */}
 {isExpanded && (
 <div className="p-5 space-y-6 bg-govt-cream-300/40">
 {dept.programs?.map((program) => (
 <div
 key={program.id}
 className="rounded-xl bg-govt-cream border border-gray-200 p-4 space-y-3"
 >
 {/* Program Subheader */}
 <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-200">
 <div className="flex items-center space-x-2">
 <BookOpen className="h-4 w-4 text-cyan-600" />
 <span className="text-sm font-bold text-gray-900">
 {program.name}
 </span>
 <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-semibold">
 {program.type}
 </span>
 </div>
 <div className="flex items-center space-x-1.5 text-xs text-gray-500 font-medium">
 <Clock className="h-3.5 w-3.5 text-gray-500" />
 <span>Duration: <strong className="text-gray-800">{program.duration_months} Months</strong></span>
 </div>
 </div>

 {/* Trades & Courses Table */}
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="text-gray-500 border-b border-gray-200/60">
 <th className="pb-2 font-semibold">Trade / Course Name</th>
 <th className="pb-2 font-semibold">Trade Code</th>
 <th className="pb-2 font-semibold">Entry Requirement</th>
 <th className="pb-2 font-semibold">Curriculum Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100/40 text-gray-600 font-medium">
 {program.trades?.map((trade) => {
 const course = trade.courses?.[0];
 const entryLevel = course?.entry_level || 'Matric / Middle';
 return (
 <tr key={trade.id} className="hover:bg-govt-cream-300/30 transition">
 <td className="py-2.5 font-semibold text-gray-800 flex items-center space-x-2">
 <Award className="h-4 w-4 text-govt-green-500 shrink-0" />
 <span>{trade.name}</span>
 </td>
 <td className="py-2.5">
 <span className="px-2 py-0.5 rounded bg-govt-cream-300 text-gray-600 font-mono text-[11px] border border-gray-200">
 {trade.code || 'N/A'}
 </span>
 </td>
 <td className="py-2.5">
 <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
 entryLevel.toLowerCase().includes('matric')
 ? 'bg-purple-50 text-purple-300 border-purple-200'
 : 'bg-govt-gold-50 text-govt-gold border-govt-gold-200'
 }`}>
 {entryLevel}
 </span>
 </td>
 <td className="py-2.5">
 <span className="text-govt-green-500 text-xs font-semibold flex items-center space-x-1">
 <span className="h-1.5 w-1.5 rounded-full bg-govt-green-400"></span>
 <span>Approved</span>
 </span>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 );
 })}

 {filteredDepartments.length === 0 && (
 <div className="text-center py-12 rounded-2xl bg-white border border-gray-200 p-8">
 <Building2 className="h-12 w-12 text-gray-500 mx-auto mb-3" />
 <h3 className="text-base font-bold text-gray-900">No Departments Found</h3>
 <p className="text-xs text-gray-500 mt-1">Try refining your search keyword.</p>
 </div>
 )}
 </div>
 </div>
 </AdminLayout>
 );
}
