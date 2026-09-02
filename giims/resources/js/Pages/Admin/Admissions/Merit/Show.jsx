import { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import {
 Trophy,
 ArrowLeft,
 Building2,
 Calendar,
 GraduationCap,
 CheckCircle2,
 Clock,
 Award,
 Printer,
 User,
 Sparkles,
 Sliders,
 Save,
 RotateCcw
} from "lucide-react";

export default function Show({ meritList }) {
 const course = meritList.course;
 const trade = course?.trade;
 const dept = trade?.program?.department;
 const campaign = meritList.admission_campaign;
 const initialApps = meritList.applications || [];

 const [isOverrideMode, setIsOverrideMode] = useState(false);
 const [applications, setApplications] = useState(initialApps);
 const [saving, setSaving] = useState(false);

 const selectedCandidates = applications.filter((a) => a.status === "selected");
 const waitlistedCandidates = applications.filter((a) => a.status === "waitlisted");

 const handlePrint = () => {
 window.print();
 };

 const handleStatusChange = (id, newStatus) => {
 setApplications(
 applications.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
 );
 };

 const handleScoreChange = (id, newScore) => {
 setApplications(
 applications.map((app) => (app.id === id ? { ...app, merit_score: parseFloat(newScore) || 0 } : app))
 );
 };

 const handleSaveOverrides = () => {
 setSaving(true);
 router.post(
 route("admin.merit.reorder", meritList.id),
 {
 applications: applications.map((app) => ({
 id: app.id,
 status: app.status,
 merit_score: app.merit_score,
 })),
 },
 {
 preserveScroll: true,
 onFinish: () => {
 setSaving(false);
 setIsOverrideMode(false);
 },
 }
 );
 };

 const handleReset = () => {
 setApplications(initialApps);
 setIsOverrideMode(false);
 };

 return (
 <AdminLayout
 header={
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
 <div className="flex items-center space-x-3">
 <Link
 href={route("admin.merit.index")}
 className="p-2 rounded-xl bg-govt-cream-300 hover:bg-govt-green-50 text-gray-600 transition"
 >
 <ArrowLeft className="h-4 w-4" />
 </Link>
 <div>
 <h1 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center space-x-2">
 <span>{meritList.title}</span>
 <span className="text-xs px-2.5 py-0.5 rounded-full bg-govt-gold-50 text-govt-gold border border-govt-gold-200 font-semibold">
 Official
 </span>
 </h1>
 <p className="text-xs text-gray-500">
 {course?.name} ({trade?.name}) � {dept?.name}
 </p>
 </div>
 </div>

 <div className="flex items-center space-x-2">
 {isOverrideMode ? (
 <>
 <button
 type="button"
 onClick={handleReset}
 className="px-3.5 py-2 rounded-xl bg-govt-cream-300 hover:bg-govt-green-50 text-gray-600 border border-gray-200 text-xs font-bold transition flex items-center space-x-1.5"
 >
 <RotateCcw className="h-4 w-4" />
 <span>Cancel</span>
 </button>
 <button
 type="button"
 disabled={saving}
 onClick={handleSaveOverrides}
 className="px-4 py-2 rounded-xl bg-govt-gold hover:bg-govt-gold-400 text-gray-600 text-xs font-extrabold transition flex items-center space-x-1.5 shadow-md shadow-amber-950/40 disabled:opacity-50"
 >
 <Save className="h-4 w-4" />
 <span>{saving ? "Saving..." : "Save Overrides"}</span>
 </button>
 </>
 ) : (
 <button
 type="button"
 onClick={() => setIsOverrideMode(true)}
 className="px-3.5 py-2 rounded-xl bg-govt-cream-300 hover:bg-govt-green-50 text-govt-gold border border-govt-gold-200 text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
 >
 <Sliders className="h-4 w-4" />
 <span>Manual Override</span>
 </button>
 )}

 <button
 type="button"
 onClick={handlePrint}
 className="px-4 py-2 rounded-xl bg-govt-cream-300 hover:bg-govt-green-50 text-gray-800 border border-gray-200 text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
 >
 <Printer className="h-4 w-4" />
 <span>Print Gazette</span>
 </button>
 </div>
 </div>
 }
 >
 <Head title={`${meritList.title} - GIIMS`} />

 {/* Printable Gazette Formal Header (Only visible in Print) */}
 <div className="hidden print:block mb-8 text-center border-b-2 border-black pb-4 text-black font-serif">
 <h2 className="text-xl font-bold uppercase tracking-wide">Government Technical Training Institute</h2>
 <h3 className="text-sm font-semibold tracking-wide">Directorate of Technical Education � TEVTA Punjab</h3>
 <h4 className="text-base font-bold mt-2 underline">{meritList.title}</h4>
 <p className="text-xs mt-1">
 Trade: <strong>{trade?.name}</strong> | Course: <strong>{course?.name}</strong> | Department: <strong>{dept?.name}</strong>
 </p>
 <p className="text-[10px] text-gray-600 mt-1">
 Generated: {new Date().toLocaleDateString("en-GB")} | Admission Session: {campaign?.title || "Current Year"}
 </p>
 </div>

 <div className="space-y-6">
 {/* Merit Summary Banner */}
 <div className="rounded-xl bg-gradient-to-r from-govt-green via-govt-green-500 to-amber-950/70 border border-gray-200 p-6 text-white shadow-govt-lg flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
 <div className="space-y-1.5">
                    <div className="flex items-center space-x-2 text-xs text-govt-gold-200 font-bold uppercase tracking-wider">
                        <Trophy className="h-4 w-4" />
                        <span>Selection Ratio & Quota Overview</span>
                    </div>
                    <p className="text-sm text-green-100 max-w-xl font-medium">
                        Standard TEVTA admission merit compiled automatically based on academic entry qualification percentages.
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-center">
                        <div className="text-2xl font-black text-white">{selectedCandidates.length}</div>
                        <div className="text-[11px] font-bold text-green-200 uppercase tracking-wider">Selected Seats</div>
                    </div>
                    <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-center">
                        <div className="text-2xl font-black text-govt-gold-300">{waitlistedCandidates.length}</div>
                        <div className="text-[11px] font-bold text-govt-gold-200 uppercase tracking-wider">Waitlisted</div>
                    </div>
                </div>
            </div>

            {/* Candidate Table */}
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black">
                <div className="p-5 border-b border-gray-200 flex items-center justify-between print:hidden">
                    <div className="flex items-center space-x-2">
                        <GraduationCap className="h-5 w-5 text-govt-gold" />
                        <h3 className="font-extrabold text-sm text-gray-900">
                            Official Gazette of Ranked Candidates ({applications.length})
                        </h3>
                    </div>

 {isOverrideMode && (
 <span className="text-xs text-govt-gold-600 font-mono font-bold animate-pulse">
 Manual Override Active: Modify status or score and click "Save Overrides"
 </span>
 )}
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs print:text-[10px] print:border print:border-gray-400">
 <thead className="bg-govt-cream-300 text-gray-500 uppercase font-mono tracking-wider border-b border-gray-200 print:bg-gray-100 print:text-black print:border-b print:border-gray-400">
 <tr>
 <th className="py-3.5 px-4 text-center">Rank</th>
 <th className="py-3.5 px-4">App ID</th>
 <th className="py-3.5 px-4">Candidate Name</th>
 <th className="py-3.5 px-4">Father Name</th>
 <th className="py-3.5 px-4">Domicile</th>
 <th className="py-3.5 px-4">Academic Marks</th>
 <th className="py-3.5 px-4">Merit %</th>
 <th className="py-3.5 px-4 text-right">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 font-sans print:divide-gray-300">
 {applications.map((app, index) => {
 const rank = index + 1;
 const user = app.student_profile?.user;
 const profile = app.student_profile;
 const isSelected = app.status === "selected";

 return (
 <tr
 key={app.id}
 className={`transition ${
 isSelected
 ? "hover:bg-govt-green-50 print:bg-transparent"
 : "hover:bg-govt-cream-300/40 opacity-85 print:opacity-100 print:bg-transparent"
 }`}
 >
 <td className="py-3 px-4 text-center font-bold">
 #{rank}
 </td>
 <td className="py-3 px-4 font-mono font-bold text-govt-green-500 print:text-black">
 {app.application_number}
 </td>
 <td className="py-3 px-4 font-bold text-gray-900 print:text-black">
 {user?.name || "Applicant"}
 </td>
 <td className="py-3 px-4 text-gray-600 print:text-gray-800">
 {profile?.father_name || "N/A"}
 </td>
 <td className="py-3 px-4 text-gray-600 print:text-gray-800">
 {profile?.domicile_district || "Rahim Yar Khan"}
 </td>
 <td className="py-3 px-4 font-mono text-gray-600 print:text-black">
 {app.obtained_marks || 0} / {app.total_marks || 1100}
 </td>
 <td className="py-3 px-4 font-bold text-gray-900 print:text-black">
 {isOverrideMode ? (
 <input
 type="number"
 step="0.01"
 value={app.merit_score || 0}
 onChange={(e) => handleScoreChange(app.id, e.target.value)}
 className="w-20 px-2 py-1 rounded bg-govt-cream-300 border border-gray-200 text-xs text-white"
 />
 ) : (
 <span>{app.merit_score}%</span>
 )}
 </td>
 <td className="py-3 px-4 text-right">
 {isOverrideMode ? (
 <select
 value={app.status}
 onChange={(e) => handleStatusChange(app.id, e.target.value)}
 className="text-xs bg-govt-cream-300 text-white border border-gray-200 rounded-lg px-2 py-1"
 >
 <option value="selected">Selected</option>
 <option value="waitlisted">Waitlisted</option>
 <option value="rejected">Rejected</option>
 <option value="admitted">Admitted</option>
 </select>
 ) : (
 <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border print:border-none print:text-black ${
 isSelected
 ? "bg-govt-green-500/10 text-govt-green-500 border-govt-green-200"
 : "bg-govt-gold-50 text-govt-gold-600 border-govt-gold-200"
 }`}>
 {isSelected ? <span>Selected</span> : <span>Waitlisted</span>}
 </span>
 )}
 </td>
 </tr>
 );
 })}

 {applications.length === 0 && (
 <tr>
 <td colSpan="8" className="py-12 text-center text-gray-500 text-xs">
 No candidates ranked in this merit list yet.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Print Signatures */}
 <div className="hidden print:grid grid-cols-3 gap-8 pt-16 text-center text-black font-serif text-xs">
 <div>
 <div className="border-t border-black pt-2 font-bold">Admission Incharge</div>
 <div>Govt Technical Training Institute</div>
 </div>
 <div>
 <div className="border-t border-black pt-2 font-bold">Trade Head / VP</div>
 <div>TEVTA Punjab</div>
 </div>
 <div>
 <div className="border-t border-black pt-2 font-bold">Principal / Chairman</div>
 <div>Govt Technical Training Institute</div>
 </div>
 </div>
 </div>
 </AdminLayout>
 );
}

