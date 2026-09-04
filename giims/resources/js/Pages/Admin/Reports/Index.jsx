import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import {
 FileSpreadsheet,
 Download,
 Users,
 FileText,
 Archive,
 Briefcase,
 ShieldCheck,
 CheckCircle2,
 Calendar,
 Sparkles,
 Building2,
 Clock,
 BadgePercent
} from 'lucide-react';

export default function Index({ counts = {} }) {
 const reports = [
 {
 id: 'students',
 title: 'Active Enrolled Trainees (TEVTA Census)',
 description:
 'Official census roster of all active students across Morning and Evening shifts. Includes Enrollment No, CNIC, Father Name, Trade Course, Batch, and Registration Dates.',
 metric: `${counts.active_students ?? 0} Enrolled Trainees`,
 icon: Users,
 color: 'from-blue-600 to-cyan-500',
 iconColor: 'text-cyan-600',
 borderColor: 'border-blue-200 hover:border-blue-500/40',
 badge: 'TEVTA Core Census',
 downloadUrl: route('admin.reports.students.export'),
 filename: 'gtti_active_students_report.csv',
 },
 {
 id: 'applications',
 title: 'Admissions Intake & Applicant Register',
 description:
 'Comprehensive log of candidate application submissions across all admission campaigns. Includes candidate credentials, CNIC, contact numbers, applied courses, and verification statuses.',
 metric: `${counts.total_applications ?? 0} Applications`,
 icon: FileText,
 color: 'from-amber-600 to-orange-500',
 iconColor: 'text-govt-gold-600',
 borderColor: 'border-govt-gold-200 hover:border-amber-500/40',
 badge: 'Admissions Audit',
 downloadUrl: route('admin.reports.applications.export'),
 filename: 'gtti_admissions_applications.csv',
 },
 {
 id: 'inventory',
 title: 'Workshop Store & Inventory Ledger',
 description:
 'Complete store catalog covering machinery, fixed workshop assets, raw consumable materials, SKU numbers, current stock levels, units, and minimum safety threshold alerts.',
 metric: `${counts.inventory_items ?? 0} Cataloged Items`,
 icon: Archive,
 color: 'from-govt-green to-govt-green-500',
 iconColor: 'text-govt-green-500',
 borderColor: 'border-govt-green-200 hover:border-emerald-500/40',
 badge: 'Store Audit',
 downloadUrl: route('admin.reports.inventory.export'),
 filename: 'gtti_workshop_inventory.csv',
 },
 {
 id: 'alumni',
 title: 'Alumni Placements & Employment Tracking',
 description:
 'Graduate employment tracing register used for TEVTA institutional performance metrics. Details formal industrial employers, designations, self-employment, higher education, and income.',
 metric: `${counts.alumni_placements ?? 0} Tracked Alumni`,
 icon: Briefcase,
 color: 'from-purple-600 to-indigo-500',
 iconColor: 'text-purple-600',
 borderColor: 'border-purple-200 hover:border-purple-500/40',
 badge: 'Placement KPIs',
 downloadUrl: route('admin.reports.alumni.export'),
 filename: 'gtti_alumni_placements.csv',
 },
 ];

 return (
 <AdminLayout
 header={
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <div className="p-2 rounded-2xl bg-govt-green-500/10 text-govt-green-500 border border-govt-green-200">
 <FileSpreadsheet className="h-6 w-6" />
 </div>
 <div>
 <h2 className="text-xl font-bold leading-tight text-gray-800 ">
 Institutional Reports Hub & TEVTA Data Export
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 Generate official UTF-8 CSV datasets for governmental compliance, TEVTA audits, and archival
 </p>
 </div>
 </div>

 <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-govt-green-500/10 text-govt-green-500 border border-govt-green-200">
 <CheckCircle2 className="h-3.5 w-3.5" />
 <span>Compliance Ready</span>
 </span>
 </div>
 }
 >
 <Head title="Reports Hub - GIIMS Admin" />

 <div className="space-y-6">
 {/* HERO BANNER */}
 <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-govt-green via-govt-green-500 to-indigo-950/70 border border-gray-200 p-6 sm:p-8 shadow-govt-lg">
 <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
 <div className="space-y-2 max-w-3xl">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 text-govt-gold-200 border border-white/20 text-xs font-semibold">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>TEVTA Punjab Compliance Engine</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif">
                        Centralized Data Exports & Audits
                    </h1>
                    <p className="text-xs sm:text-sm text-green-100 leading-relaxed font-medium">
                        Instantly export structured datasets for GTTI Rahim Yar Khan. All reports include UTF-8 Byte Order Marks (BOM) ensuring immediate, clean viewing in Microsoft Excel, Google Sheets, or institutional relational databases.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <div className="px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-center">
                        <p className="text-[10px] text-green-200 font-bold uppercase tracking-wider">Format</p>
                        <p className="text-sm font-extrabold text-white">UTF-8 CSV</p>
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-center">
                        <p className="text-[10px] text-govt-gold-200 font-bold uppercase tracking-wider">Compatibility</p>
                        <p className="text-sm font-extrabold text-govt-gold-300">MS Excel 100%</p>
                    </div>
 </div>
 </div>
 </div>

 {/* REPORT CARDS GRID */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {reports.map((report) => {
 const Icon = report.icon;
 return (
 <div
 key={report.id}
 className={`rounded-xl bg-white border ${report.borderColor} p-6 sm:p-7 shadow-sm transition flex flex-col justify-between space-y-6 group hover:shadow-md`}
 >
 <div className="space-y-4">
 <div className="flex items-start justify-between gap-3">
 <div className="flex items-center space-x-3.5">
 <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${report.color} flex items-center justify-center text-white shadow-md shadow-slate-950/20 shrink-0`}>
 <Icon className="h-6 w-6" />
 </div>
 <div>
 <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-govt-cream-300 text-gray-600 ">
 {report.badge}
 </span>
 <h3 className="text-base font-extrabold text-gray-900 mt-1">
 {report.title}
 </h3>
 </div>
 </div>

 <span className="text-xs font-mono font-bold text-gray-500 bg-govt-cream-300 px-2.5 py-1 rounded-xl shrink-0">
 {report.metric}
 </span>
 </div>

 <p className="text-xs text-gray-600 leading-relaxed">
 {report.description}
 </p>
 </div>

 <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
 <span className="text-[11px] text-gray-500 font-mono">
 {report.filename}
 </span>

 {/* Standard <a> tag triggers immediate file streaming */}
 <a
 href={report.downloadUrl}
 download
 className="px-4 py-2 rounded-xl bg-white hover:bg-govt-cream-300 :bg-govt-cream-300 text-white font-extrabold text-xs transition shadow-sm flex items-center space-x-2 group-hover:bg-govt-green :bg-govt-green"
 >
 <Download className="h-3.5 w-3.5" />
 <span>Download CSV</span>
 </a>
 </div>
 </div>
 );
 })}
 </div>

 {/* TEVTA AUDIT COMPLIANCE ADVISORY */}
 <div className="p-6 rounded-xl bg-white text-white border border-gray-200 space-y-3">
 <div className="flex items-center space-x-2.5">
 <ShieldCheck className="h-5 w-5 text-govt-green-500" />
 <h4 className="text-sm font-extrabold text-gray-900">
 Official TEVTA Data Compliance & Archival Guidelines
 </h4>
 </div>
 <p className="text-xs text-gray-600 leading-relaxed max-w-4xl">
 All generated files adhere to TEVTA Punjab Management Information Standards. Exported files can be submitted directly during annual inspection visits, technical accreditation renewals, and vocational placement benchmarking. For custom SQL inquiries or PBTE mock examination returns, contact the GIIMS System Administrator.
 </p>
 </div>
 </div>
 </AdminLayout>
 );
}