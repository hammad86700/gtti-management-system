import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import {
 Settings,
 Building2,
 Phone,
 Mail,
 MapPin,
 Award,
 Shield,
 Save,
 CheckCircle2,
 Sparkles,
 Flag
} from "lucide-react";

export default function Index({ settings = {} }) {
 const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
 institute_name: settings.institute_name || "",
 institute_short_name: settings.institute_short_name || "",
 tagline: settings.tagline || "",
 phone: settings.phone || "",
 email: settings.email || "",
 address: settings.address || "",
 accreditation_text: settings.accreditation_text || "",
 helpline: settings.helpline || "",
 motto: settings.motto || "",
 });

 const handleSubmit = (e) => {
 e.preventDefault();
 post(route("admin.settings.update"));
 };

 return (
 <AdminLayout
 header={
 <div className="flex items-center justify-between">
 <div>
                    <h2 className="text-xl font-bold leading-tight text-gray-900 flex items-center space-x-2">
 <Settings className="h-5 w-5 text-indigo-600" />
 <span>System Settings & White-Label Configuration</span>
 </h2>
 <p className="text-xs text-gray-500 mt-0.5">
 Dynamically configure institution identity, branding, accreditation, and communication details
 </p>
 </div>

 {recentlySuccessful && (
 <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-govt-green-500/20 text-govt-green-400 border border-govt-green-200 text-xs font-semibold animate-fade-in">
 <CheckCircle2 className="h-3.5 w-3.5" />
 <span>Configuration Saved!</span>
 </span>
 )}
 </div>
 }
 >
 <Head title="System Settings - GIIMS" />

 <div className="max-w-4xl space-y-6">
 <form onSubmit={handleSubmit} className="space-y-6">
 {/* Card 1: Institutional Identity */}
 <div className="rounded-xl bg-govt-cream-300 border border-gray-200/80 p-6 md:p-8 space-y-6 shadow-govt-lg">
 <div className="flex items-center space-x-3 pb-4 border-b border-gray-200/80">
 <div className="h-10 w-10 rounded-2xl bg-govt-green-500/10 text-indigo-600 border border-indigo-500/20 flex items-center justify-center">
 <Building2 className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-gray-900">Institutional Identity</h3>
 <p className="text-xs text-gray-500">Official name, short code, and national motto</p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div className="md:col-span-2 space-y-1.5">
 <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
 Full Institute Name <span className="text-rose-600">*</span>
 </label>
 <input
 type="text"
 value={data.institute_name}
 onChange={(e) => setData("institute_name", e.target.value)}
 className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-govt-green-400/50"
 placeholder="e.g. Government Technical Training Institute, Rahim Yar Khan"
 />
 {errors.institute_name && (
 <p className="text-[11px] text-rose-600">{errors.institute_name}</p>
 )}
 </div>

 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
 Short Name / Monogram <span className="text-rose-600">*</span>
 </label>
 <input
 type="text"
 value={data.institute_short_name}
 onChange={(e) => setData("institute_short_name", e.target.value)}
 className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-govt-green-400/50"
 placeholder="e.g. GTTI RYK"
 />
 {errors.institute_short_name && (
 <p className="text-[11px] text-rose-600">{errors.institute_short_name}</p>
 )}
 </div>

 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
 Tagline / Administrative Sub-Header
 </label>
 <input
 type="text"
 value={data.tagline}
 onChange={(e) => setData("tagline", e.target.value)}
 className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-govt-green-400/50"
 placeholder="e.g. Directorate of Technical Education � TEVTA Punjab"
 />
 {errors.tagline && (
 <p className="text-[11px] text-rose-600">{errors.tagline}</p>
 )}
 </div>

 <div className="md:col-span-2 space-y-1.5">
 <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
 National Motto / Urdu Motto
 </label>
 <input
 type="text"
 value={data.motto}
 onChange={(e) => setData("motto", e.target.value)}
 className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-govt-green-400/50"
 placeholder="?????? ?????? ??? ? ??? � Faith, Unity, Discipline"
 />
 </div>
 </div>
 </div>

 {/* Card 2: Contact, Location & Helpline */}
 <div className="rounded-xl bg-govt-cream-300 border border-gray-200/80 p-6 md:p-8 space-y-6 shadow-govt-lg">
 <div className="flex items-center space-x-3 pb-4 border-b border-gray-200/80">
 <div className="h-10 w-10 rounded-2xl bg-govt-green-500/10 text-govt-green-500 border border-govt-green-200 flex items-center justify-center">
 <Phone className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-gray-900">Contact & Campus Coordinates</h3>
 <p className="text-xs text-gray-500">Inquiry lines, emails, and address rendered in public footer</p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
 Official Telephone
 </label>
 <input
 type="text"
 value={data.phone}
 onChange={(e) => setData("phone", e.target.value)}
 className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-govt-green-400/50"
 placeholder="068-9230123"
 />
 </div>

 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
 Official Email Address
 </label>
 <input
 type="email"
 value={data.email}
 onChange={(e) => setData("email", e.target.value)}
 className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-govt-green-400/50"
 placeholder="info@gtti.edu.pk"
 />
 </div>

 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
 Admissions Helpline String
 </label>
 <input
 type="text"
 value={data.helpline}
 onChange={(e) => setData("helpline", e.target.value)}
 className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-govt-green-400/50"
 placeholder="068-9230123 / 068-9230124"
 />
 </div>

 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
 Accreditation Notice Text
 </label>
 <input
 type="text"
 value={data.accreditation_text}
 onChange={(e) => setData("accreditation_text", e.target.value)}
 className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-govt-green-400/50"
 placeholder="PBTE & NAVTTC Accredited"
 />
 </div>

 <div className="md:col-span-2 space-y-1.5">
 <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
 Physical Campus Address
 </label>
 <textarea
 rows="3"
 value={data.address}
 onChange={(e) => setData("address", e.target.value)}
 className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-govt-green-400/50"
 placeholder="Shahbaz Pur Road, Near Sports Complex, Rahim Yar Khan, Punjab, Pakistan"
 />
 </div>
 </div>
 </div>

 {/* Action Bar */}
 <div className="flex items-center justify-end space-x-3 pt-2">
 <button
 type="submit"
 disabled={processing}
 className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-govt-green-500 text-white text-xs font-extrabold transition shadow-lg shadow-indigo-950/50 disabled:opacity-50 flex items-center space-x-2"
 >
 <Save className="h-4 w-4" />
 <span>{processing ? "Saving Configuration..." : "Save Settings"}</span>
 </button>
 </div>
 </form>
 </div>
 </AdminLayout>
 );
}

