import { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router, Link } from "@inertiajs/react";
import {
 History,
 Shield,
 Filter,
 User,
 Clock,
 FileText,
 ArrowRight,
 Terminal,
 Search,
 ChevronDown,
 ChevronUp
} from "lucide-react";

export default function Index({ logs = { data: [] }, filters = {} }) {
 const [actionFilter, setActionFilter] = useState(filters.action || "");
 const [expandedLogId, setExpandedLogId] = useState(null);

 const handleFilterChange = (val) => {
 setActionFilter(val);
 router.get(route("admin.system-logs.index"), {
 action: val || undefined,
 }, { preserveState: true });
 };

 const toggleExpand = (id) => {
 setExpandedLogId(expandedLogId === id ? null : id);
 };

 const getActionBadge = (action) => {
 switch (action) {
 case "created":
 return "bg-govt-green-500/15 text-govt-green-400 border-govt-green-200";
 case "updated":
 return "bg-sky-500/15 text-sky-300 border-sky-500/30";
 case "deleted":
 return "bg-rose-500/15 text-rose-300 border-rose-200";
 case "locked":
 return "bg-govt-gold-50 text-govt-gold border-govt-gold-200";
 case "unlocked":
 return "bg-purple-500/15 text-purple-300 border-purple-500/30";
 case "overridden":
 return "bg-orange-500/15 text-orange-300 border-orange-500/30";
 default:
 return "bg-gray-300/15 text-gray-600 border-gray-300/30";
 }
 };

 const formatModelName = (fullClass) => {
 if (!fullClass) return "System";
 const parts = fullClass.split("\\");
 return parts[parts.length - 1];
 };

 return (
 <AdminLayout
 header={
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
                    <h2 className="text-xl font-bold leading-tight text-gray-900 flex items-center space-x-2">
 <History className="h-5 w-5 text-govt-gold-600" />
 <span>System Activity Logs & Accountability Audit</span>
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 Tamper-evident audit trail capturing all critical transactional changes and administrative actions
 </p>
 </div>

 <div className="flex items-center space-x-2">
 <Filter className="h-4 w-4 text-gray-500" />
 <select
 value={actionFilter}
 onChange={(e) => handleFilterChange(e.target.value)}
 className="text-xs bg-govt-cream-300 text-gray-800 border border-gray-200 rounded-xl px-3 py-2 focus:ring-amber-500"
 >
 <option value="">All Actions</option>
 <option value="created">Created</option>
 <option value="updated">Updated</option>
 <option value="deleted">Deleted</option>
 <option value="locked">Locked</option>
 <option value="unlocked">Unlocked</option>
 <option value="overridden">Overridden</option>
 </select>
 </div>
 </div>
 }
 >
 <Head title="System Activity Logs - GIIMS" />

 <div className="space-y-6">
 <div className="bg-govt-cream-300 border border-gray-200/80 rounded-xl overflow-hidden shadow-govt-lg">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs text-gray-600">
 <thead className="bg-white text-gray-500 uppercase font-mono tracking-wider border-b border-gray-200/80">
 <tr>
 <th className="px-6 py-4">Timestamp</th>
 <th className="px-6 py-4">Initiated By</th>
 <th className="px-6 py-4">Action</th>
 <th className="px-6 py-4">Entity</th>
 <th className="px-6 py-4">Description</th>
 <th className="px-6 py-4 text-right">Details</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100/50 font-sans">
 {logs.data?.length === 0 ? (
 <tr>
 <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
 No activity log records found matching the current criteria.
 </td>
 </tr>
 ) : (
 logs.data?.map((log) => (
 <>
 <tr
 key={log.id}
 className="hover:bg-govt-green-50/30 transition cursor-pointer"
 onClick={() => toggleExpand(log.id)}
 >
 <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-[11px]">
 {new Date(log.created_at).toLocaleString()}
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="flex items-center space-x-2">
 <div className="h-6 w-6 rounded-full bg-govt-cream-300 text-gray-600 flex items-center justify-center font-bold text-[10px]">
 {log.user ? log.user.name.charAt(0) : "S"}
 </div>
 <span className="font-semibold text-gray-800">
 {log.user ? log.user.name : "System Worker"}
 </span>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span
 className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getActionBadge(
 log.action
 )}`}
 >
 {log.action}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap font-mono text-govt-gold">
 {formatModelName(log.model_type)} #{log.model_id}
 </td>
 <td className="px-6 py-4 max-w-xs truncate text-gray-600">
 {log.description || "�"}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
 <button
 type="button"
 className="p-1.5 rounded-lg hover:bg-govt-green-50 text-gray-600 transition"
 >
 {expandedLogId === log.id ? (
 <ChevronUp className="h-4 w-4 text-govt-gold-600" />
 ) : (
 <ChevronDown className="h-4 w-4" />
 )}
 </button>
 </td>
 </tr>

 {expandedLogId === log.id && (
 <tr className="bg-white border-b border-gray-200">
 <td colSpan="6" className="px-8 py-5">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider font-mono">
 Previous State (Old Data)
 </h4>
 <pre className="p-3 rounded-xl bg-govt-cream-300 border border-gray-200 text-[11px] text-rose-300 font-mono overflow-x-auto max-h-48">
 {log.old_data
 ? JSON.stringify(log.old_data, null, 2)
 : "None / Fresh Record"}
 </pre>
 </div>

 <div className="space-y-1.5">
 <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider font-mono">
 New State (Modified Data)
 </h4>
 <pre className="p-3 rounded-xl bg-govt-cream-300 border border-gray-200 text-[11px] text-govt-green-400 font-mono overflow-x-auto max-h-48">
 {log.new_data
 ? JSON.stringify(log.new_data, null, 2)
 : "Deleted / Removed"}
 </pre>
 </div>
 </div>

 {log.ip_address && (
 <div className="mt-3 text-[11px] text-gray-500 font-mono">
 Client Remote IP: {log.ip_address}
 </div>
 )}
 </td>
 </tr>
 )}
 </>
 ))
 )}
 </tbody>
 </table>
 </div>

 {/* Pagination */}
 {logs.links && logs.links.length > 3 && (
 <div className="p-4 border-t border-gray-200/80 flex items-center justify-between">
 <span className="text-xs text-gray-500">
 Showing {logs.from || 0} to {logs.to || 0} of {logs.total || 0} entries
 </span>
 <div className="flex space-x-1">
 {logs.links.map((link, idx) => (
 <Link
 key={idx}
 href={link.url || "#"}
 dangerouslySetInnerHTML={{ __html: link.label }}
 className={`px-3 py-1 text-xs rounded-lg transition ${
 link.active
 ? "bg-govt-gold text-gray-600 font-bold"
 : "bg-govt-cream-300 text-gray-600 hover:bg-govt-cream-300"
 } ${!link.url ? "opacity-40 pointer-events-none" : ""}`}
 />
 ))}
 </div>
 </div>
 )}
 </div>
 </div>
 </AdminLayout>
 );
}

