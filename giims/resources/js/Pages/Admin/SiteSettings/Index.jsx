import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ClerkLayout from '@/Layouts/ClerkLayout';
import {
    Layout,
    Sliders,
    Bell,
    CreditCard,
    FileText,
    MapPin,
    Phone,
    Clock,
    Download,
    Upload,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    Sparkles,
    Save,
    Eye,
    Shield,
    FileCheck,
    HelpCircle,
    Info,
    ArrowRight
} from 'lucide-react';

export default function Index({ settings = {}, grouped = {}, meta = {} }) {
    const { auth } = usePage().props;
    const isClerk = auth?.user?.roles?.some((r) => r.name === 'clerk') && !auth?.user?.roles?.some((r) => r.name === 'admin' || r.name === 'super-admin' || r.name === 'principal');
    const LayoutComponent = isClerk ? ClerkLayout : AdminLayout;

    const [activeTab, setActiveTab] = useState('header');
    const [prospectusFileName, setProspectusFileName] = useState('');

    const form = useForm({
        // Header & Ticker
        govt_subheading: settings.govt_subheading || '',
        helpline_phones: settings.helpline_phones || '',
        office_timings: settings.office_timings || '',
        motto: settings.motto || '',
        official_notice_text: settings.official_notice_text || '',
        official_notice_link: settings.official_notice_link || '',

        // Quick Cards
        card_1_title: settings.card_1_title || 'Tevta Portal',
        card_1_subtitle: settings.card_1_subtitle || 'Enterprise Access',
        card_1_url: settings.card_1_url || '/login',

        card_2_title: settings.card_2_title || 'Online Admission Form',
        card_2_subtitle: settings.card_2_subtitle || 'Session 2026 Open',
        card_2_url: settings.card_2_url || '/register',

        card_3_title: settings.card_3_title || 'Download Prospectus',
        card_3_subtitle: settings.card_3_subtitle || 'Session 2026 Guide & Eligibility',
        card_3_url: settings.card_3_url || '/download-prospectus',

        card_4_title: settings.card_4_title || 'Merit Lists & Gazette',
        card_4_subtitle: settings.card_4_subtitle || 'Session 2026 Selections',
        card_4_url: settings.card_4_url || '/merit-lists',

        // Files
        prospectus_file: null,

        // Contact & Transparency
        institute_address: settings.institute_address || '',
        official_email: settings.official_email || '',
        affiliation_text: settings.affiliation_text || '',
        google_maps_link: settings.google_maps_link || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const postUrl = isClerk ? route('clerk.site-settings.update') : route('admin.site-settings.update');
        form.post(postUrl, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setProspectusFileName('');
                form.reset('prospectus_file');
            }
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData('prospectus_file', file);
            setProspectusFileName(file.name);
        }
    };

    return (
        <LayoutComponent>
            <Head title="Public Landing Page CMS & Site Settings - GTTI" />

            <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Desk Header Banner */}
                <div className="bg-gradient-to-r from-[#003816] to-[#005a24] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-800">
                    <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-2">
                            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-black uppercase tracking-wider">
                                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                                <span>Dynamic Public CMS Engine</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                Public Landing Page Management Desk
                            </h1>
                            <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
                                Control all public portal elements in real-time. Manage official provincial masthead notices, helpline numbers, institutional prospectus PDF, and the 4 public gateway cards without code deployments.
                            </p>
                        </div>

                        {/* Fast Actions & Audit Pill */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                            <a
                                href="/"
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center space-x-2 border border-white/20 backdrop-blur-sm shadow"
                            >
                                <Eye className="h-4 w-4 text-emerald-300" />
                                <span>Preview Live Landing Page</span>
                                <ExternalLink className="h-3 w-3 opacity-70" />
                            </a>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={form.processing}
                                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center space-x-2 shadow-lg hover:shadow-amber-500/25 active:scale-95 disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" />
                                <span>{form.processing ? 'Publishing Changes...' : 'Save & Publish Live'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="mt-6 pt-4 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-200 font-mono">
                        <div className="flex items-center space-x-2">
                            <Clock className="h-3.5 w-3.5 text-amber-300" />
                            <span>Last Database Sync: {meta.last_updated_at ? new Date(meta.last_updated_at).toLocaleString() : 'Recent'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Shield className="h-3.5 w-3.5 text-emerald-300" />
                            <span>Authorized Operator: {meta.updated_by_user || auth.user.name}</span>
                        </div>
                    </div>
                </div>

                {/* Form Processing / Error Alerts */}
                {form.recentlySuccessful && (
                    <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-4 flex items-center space-x-3 text-xs font-bold animate-in fade-in">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        <span>All landing page settings, notice alerts, and quick card configurations have been updated and are instantly live on the public portal!</span>
                    </div>
                )}

                {Object.keys(form.errors).length > 0 && (
                    <div className="bg-rose-50 border border-rose-300 text-rose-900 rounded-xl p-4 flex items-start space-x-3 text-xs">
                        <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Please correct the following errors before publishing:</p>
                            <ul className="list-disc list-inside mt-1 space-y-0.5 text-rose-700">
                                {Object.values(form.errors).map((err, idx) => (
                                    <li key={idx}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Navigation Tabs */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-1.5 flex flex-wrap gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('header')}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-black transition ${
                            activeTab === 'header'
                                ? 'bg-[#00401A] text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        <Sliders className="h-4 w-4" />
                        <span>Header & Notice Ticker</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('cards')}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-black transition ${
                            activeTab === 'cards'
                                ? 'bg-[#00401A] text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        <CreditCard className="h-4 w-4" />
                        <span>4 Quick Action Cards</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('prospectus')}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-black transition ${
                            activeTab === 'prospectus'
                                ? 'bg-[#00401A] text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        <FileText className="h-4 w-4" />
                        <span>Prospectus & Official PDF</span>
                        {settings.prospectus_pdf_path && (
                            <span className="h-2 w-2 rounded-full bg-emerald-500 ml-1" title="PDF Document Active" />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('contact')}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-black transition ${
                            activeTab === 'contact'
                                ? 'bg-[#00401A] text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        <MapPin className="h-4 w-4" />
                        <span>Contact, Address & RTI</span>
                    </button>
                </div>

                {/* Tab Forms Body */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ════════════════════════════════════════════════════════════
                        TAB 1: HEADER & NOTICE TICKER
                    ════════════════════════════════════════════════════════════ */}
                    {activeTab === 'header' && (
                        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-6">
                            <div className="border-b border-gray-100 pb-4">
                                <h3 className="text-base font-black text-gray-900 flex items-center space-x-2">
                                    <Bell className="h-5 w-5 text-emerald-700" />
                                    <span>Provincial Masthead, Motto & Announcement Ticker</span>
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    Manage the top green bar, the institutional tagline, helpline phone numbers, and the amber emergency announcement ticker.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Tagline / Subheading */}
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-black text-gray-800 uppercase tracking-wider block">
                                        Government Tagline / Institutional Subheading
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.govt_subheading}
                                        onChange={(e) => form.setData('govt_subheading', e.target.value)}
                                        placeholder="Directorate of Technical Education • TEVTA Punjab • Established for Industrial Skills & Technical Excellence"
                                        className="w-full text-xs rounded-xl border-gray-200 focus:ring-[#00401A] focus:border-[#00401A]"
                                    />
                                    <p className="text-[11px] text-gray-400">
                                        Rendered under the main Institute Title in the white masthead.
                                    </p>
                                </div>

                                {/* Official Motto */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-gray-800 uppercase tracking-wider block">
                                        Institutional Motto (National Creed)
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.motto}
                                        onChange={(e) => form.setData('motto', e.target.value)}
                                        placeholder="ایمان، اتحاد، نظم و ضبط • Faith, Unity, Discipline"
                                        className="w-full text-xs rounded-xl border-gray-200 focus:ring-[#00401A] focus:border-[#00401A]"
                                    />
                                    <p className="text-[11px] text-gray-400">
                                        Appears in the topmost dark-green provincial crest bar.
                                    </p>
                                </div>

                                {/* Helpline Numbers */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-gray-800 uppercase tracking-wider block">
                                        Public Helpline Contact Numbers
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.helpline_phones}
                                        onChange={(e) => form.setData('helpline_phones', e.target.value)}
                                        placeholder="068-9230123 / 068-9230124"
                                        className="w-full text-xs rounded-xl border-gray-200 focus:ring-[#00401A] focus:border-[#00401A]"
                                    />
                                    <p className="text-[11px] text-gray-400">
                                        Displayed in the masthead header, contact widget, and footer.
                                    </p>
                                </div>

                                {/* Office Timings */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-gray-800 uppercase tracking-wider block">
                                        Official Working Hours / Timings
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.office_timings}
                                        onChange={(e) => form.setData('office_timings', e.target.value)}
                                        placeholder="Mon - Fri: 8:00 AM - 4:00 PM | Sat: 8:00 AM - 1:30 PM"
                                        className="w-full text-xs rounded-xl border-gray-200 focus:ring-[#00401A] focus:border-[#00401A]"
                                    />
                                </div>

                                {/* Announcement Ticker Action Link */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-gray-800 uppercase tracking-wider block">
                                        Notice Action Target Link
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.official_notice_link}
                                        onChange={(e) => form.setData('official_notice_link', e.target.value)}
                                        placeholder="#courses or #merit-lists or /register"
                                        className="w-full text-xs rounded-xl border-gray-200 focus:ring-[#00401A] focus:border-[#00401A]"
                                    />
                                </div>

                                {/* Official Notice Ticker Text */}
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-black text-gray-800 uppercase tracking-wider block">
                                        Official Notice Announcement Text
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={form.data.official_notice_text}
                                        onChange={(e) => form.setData('official_notice_text', e.target.value)}
                                        placeholder="Admissions Open for Session 2026: PBTE Accredited 1-Year & 2-Year Technical Diplomas — Free Government Toolkits & Subsidized Stipends."
                                        className="w-full text-xs rounded-xl border-gray-200 focus:ring-[#00401A] focus:border-[#00401A]"
                                    />
                                    <p className="text-[11px] text-gray-400">
                                        Displayed in the prominent amber banner ticker directly above the campus showcase hero slider.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════════════════════════════════════════════════════════════
                        TAB 2: 4 QUICK ACTION CARDS CUSTOMIZER
                    ════════════════════════════════════════════════════════════ */}
                    {activeTab === 'cards' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-4">
                                <div className="border-b border-gray-100 pb-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-base font-black text-gray-900 flex items-center space-x-2">
                                                <CreditCard className="h-5 w-5 text-emerald-700" />
                                                <span>4 Hero Gateway Quick Action Cards</span>
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Notice: "Web Email" and "TEVTA Shop" cards have been retired in favor of high-utility student and visitor services: <strong>Download Prospectus</strong> and <strong>Merit Lists & Gazette</strong>.
                                            </p>
                                        </div>
                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                                            Phase 37 Active
                                        </span>
                                    </div>
                                </div>

                                {/* Interactive 4-Card Live Preview Tiles */}
                                <div className="space-y-2 pt-2">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-600">
                                        Live Homepage Preview (How Public Visitors See These Cards)
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                                        {/* Card 1 Preview */}
                                        <div className="p-4 rounded-xl bg-gradient-to-br from-[#00401A] to-[#002B11] border border-emerald-600/40 text-white shadow">
                                            <span className="text-[10px] font-mono text-emerald-300 block mb-1">Card 1 • Staff/Student</span>
                                            <p className="font-black text-sm text-white">{form.data.card_1_title || 'Tevta Portal'}</p>
                                            <p className="text-[11px] text-emerald-200/90 mt-0.5">{form.data.card_1_subtitle || 'Enterprise Access'}</p>
                                            <span className="mt-3 inline-block text-[10px] font-mono bg-emerald-950/60 px-2 py-0.5 rounded text-emerald-300">
                                                Target: {form.data.card_1_url || '/login'}
                                            </span>
                                        </div>

                                        {/* Card 2 Preview */}
                                        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-900 to-[#003314] border border-emerald-500/40 text-white shadow">
                                            <span className="text-[10px] font-mono text-emerald-300 block mb-1">Card 2 • Applicant</span>
                                            <p className="font-black text-sm text-white">{form.data.card_2_title || 'Online Admission Form'}</p>
                                            <p className="text-[11px] text-emerald-200/90 mt-0.5">{form.data.card_2_subtitle || 'Session 2026 Open'}</p>
                                            <span className="mt-3 inline-block text-[10px] font-mono bg-emerald-950/60 px-2 py-0.5 rounded text-emerald-300">
                                                Target: {form.data.card_2_url || '/register'}
                                            </span>
                                        </div>

                                        {/* Card 3 Preview (Prospectus) */}
                                        <div className="p-4 rounded-xl bg-gradient-to-br from-[#003816] to-emerald-950 border border-emerald-400/40 text-white shadow ring-2 ring-amber-400/40">
                                            <div className="flex items-center justify-between gap-1 mb-1">
                                                <span className="text-[10px] font-mono text-amber-300">Card 3 • Replaced</span>
                                                <Download className="h-3.5 w-3.5 text-amber-400" />
                                            </div>
                                            <p className="font-black text-sm text-white">{form.data.card_3_title || 'Download Prospectus'}</p>
                                            <p className="text-[11px] text-emerald-200/90 mt-0.5">{form.data.card_3_subtitle || 'Session 2026 Guide & Eligibility'}</p>
                                            <span className="mt-3 inline-block text-[10px] font-mono bg-emerald-950/60 px-2 py-0.5 rounded text-amber-300">
                                                Target: {form.data.card_3_url || '/download-prospectus'}
                                            </span>
                                        </div>

                                        {/* Card 4 Preview (Merit Lists) */}
                                        <div className="p-4 rounded-xl bg-gradient-to-br from-[#002a0e] to-emerald-950 border border-emerald-400/40 text-white shadow ring-2 ring-amber-400/40">
                                            <div className="flex items-center justify-between gap-1 mb-1">
                                                <span className="text-[10px] font-mono text-amber-300">Card 4 • Replaced</span>
                                                <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                                            </div>
                                            <p className="font-black text-sm text-white">{form.data.card_4_title || 'Merit Lists & Gazette'}</p>
                                            <p className="text-[11px] text-emerald-200/90 mt-0.5">{form.data.card_4_subtitle || 'Session 2026 Selections'}</p>
                                            <span className="mt-3 inline-block text-[10px] font-mono bg-emerald-950/60 px-2 py-0.5 rounded text-amber-300">
                                                Target: {form.data.card_4_url || '/merit-lists'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Customizer Inputs */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    {/* Card 1 Inputs */}
                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center space-x-1.5">
                                            <span className="h-2 w-2 rounded-full bg-emerald-600" />
                                            <span>Card 1: Enterprise Portal</span>
                                        </h4>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-700 block">Title</label>
                                            <input
                                                type="text"
                                                value={form.data.card_1_title}
                                                onChange={(e) => form.setData('card_1_title', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 mt-0.5"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-700 block">Subtitle</label>
                                            <input
                                                type="text"
                                                value={form.data.card_1_subtitle}
                                                onChange={(e) => form.setData('card_1_subtitle', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 mt-0.5"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-700 block">Destination URL</label>
                                            <input
                                                type="text"
                                                value={form.data.card_1_url}
                                                onChange={(e) => form.setData('card_1_url', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 mt-0.5"
                                            />
                                        </div>
                                    </div>

                                    {/* Card 2 Inputs */}
                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center space-x-1.5">
                                            <span className="h-2 w-2 rounded-full bg-emerald-600" />
                                            <span>Card 2: Online Admission Form</span>
                                        </h4>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-700 block">Title</label>
                                            <input
                                                type="text"
                                                value={form.data.card_2_title}
                                                onChange={(e) => form.setData('card_2_title', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 mt-0.5"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-700 block">Subtitle</label>
                                            <input
                                                type="text"
                                                value={form.data.card_2_subtitle}
                                                onChange={(e) => form.setData('card_2_subtitle', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 mt-0.5"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-700 block">Destination URL</label>
                                            <input
                                                type="text"
                                                value={form.data.card_2_url}
                                                onChange={(e) => form.setData('card_2_url', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 mt-0.5"
                                            />
                                        </div>
                                    </div>

                                    {/* Card 3 Inputs (Download Prospectus) */}
                                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center space-x-1.5">
                                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                                <span>Card 3: Download Prospectus</span>
                                            </h4>
                                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                                                High Utility
                                            </span>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-700 block">Title</label>
                                            <input
                                                type="text"
                                                value={form.data.card_3_title}
                                                onChange={(e) => form.setData('card_3_title', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 mt-0.5 font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-700 block">Subtitle</label>
                                            <input
                                                type="text"
                                                value={form.data.card_3_subtitle}
                                                onChange={(e) => form.setData('card_3_subtitle', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 mt-0.5"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-700 block">Destination URL</label>
                                            <input
                                                type="text"
                                                value={form.data.card_3_url}
                                                onChange={(e) => form.setData('card_3_url', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 mt-0.5 font-mono"
                                            />
                                        </div>
                                    </div>

                                    {/* Card 4 Inputs (Merit Lists & Gazette) */}
                                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center space-x-1.5">
                                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                                <span>Card 4: Merit Lists & Gazette</span>
                                            </h4>
                                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                                                High Utility
                                            </span>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-700 block">Title</label>
                                            <input
                                                type="text"
                                                value={form.data.card_4_title}
                                                onChange={(e) => form.setData('card_4_title', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 mt-0.5 font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-700 block">Subtitle</label>
                                            <input
                                                type="text"
                                                value={form.data.card_4_subtitle}
                                                onChange={(e) => form.setData('card_4_subtitle', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 mt-0.5"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-700 block">Destination URL</label>
                                            <input
                                                type="text"
                                                value={form.data.card_4_url}
                                                onChange={(e) => form.setData('card_4_url', e.target.value)}
                                                className="w-full text-xs rounded-lg border-gray-300 mt-0.5 font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════════════════════════════════════════════════════════════
                        TAB 3: PROSPECTUS & OFFICIAL INSTITUTIONAL PDF
                    ════════════════════════════════════════════════════════════ */}
                    {activeTab === 'prospectus' && (
                        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-6">
                            <div className="border-b border-gray-100 pb-4">
                                <h3 className="text-base font-black text-gray-900 flex items-center space-x-2">
                                    <FileText className="h-5 w-5 text-emerald-700" />
                                    <span>Official Institutional Prospectus (PDF)</span>
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    Upload the latest authorized TEVTA Prospectus & Admissions Guide. When uploaded, visitors clicking "Download Prospectus" on the homepage automatically receive this PDF document.
                                </p>
                            </div>

                            {/* Current File Status Card */}
                            <div className="rounded-2xl p-5 border bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                    <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                                        <FileCheck className="h-6 w-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-extrabold text-sm text-white">
                                                {settings.prospectus_pdf_path ? 'GTTI-Prospectus-Official.pdf' : 'No Prospectus Uploaded Yet'}
                                            </span>
                                            {settings.prospectus_pdf_path ? (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                                                    Active on Portal
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                                    Pending Upload
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {settings.prospectus_pdf_path
                                                ? `File Size: ${settings.prospectus_file_size || 'Official Document'} • Last Uploaded: ${settings.prospectus_uploaded_at || 'Recently'}`
                                                : 'Upload an official PDF brochure below to activate one-click public downloads.'}
                                        </p>
                                    </div>
                                </div>

                                {settings.prospectus_pdf_path && (
                                    <div className="flex items-center space-x-2 shrink-0">
                                        <a
                                            href="/download-prospectus"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow"
                                        >
                                            <Download className="h-4 w-4" />
                                            <span>Test Live Download</span>
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Upload New Prospectus PDF */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-800 uppercase tracking-wider block">
                                    Upload / Replace Official Prospectus Document (Max: 10MB, PDF Only)
                                </label>
                                <div className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl p-8 text-center bg-gray-50/50 transition">
                                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                    <p className="text-xs font-bold text-gray-700">
                                        {prospectusFileName ? `Selected: ${prospectusFileName}` : 'Drag and drop or select the institutional prospectus PDF'}
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Standard PDF format containing intake roadmap, fee structure, trade options, and TEVTA guidelines.
                                    </p>

                                    <div className="mt-4">
                                        <label className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#00401A] hover:bg-[#003314] text-white text-xs font-bold transition shadow cursor-pointer">
                                            <span>Browse PDF File</span>
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                                {form.errors.prospectus_file && (
                                    <p className="text-xs text-rose-600 font-semibold">{form.errors.prospectus_file}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ════════════════════════════════════════════════════════════
                        TAB 4: CONTACT & TRANSPARENCY DETAILS
                    ════════════════════════════════════════════════════════════ */}
                    {activeTab === 'contact' && (
                        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-6">
                            <div className="border-b border-gray-100 pb-4">
                                <h3 className="text-base font-black text-gray-900 flex items-center space-x-2">
                                    <MapPin className="h-5 w-5 text-emerald-700" />
                                    <span>Institutional Contact Details & Transparency Information</span>
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    Official postal address, institutional inquiry email, Google Maps link, and RTI accreditation compliance statement displayed in the footer.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-black text-gray-800 uppercase tracking-wider block">
                                        Campus Postal Address
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.institute_address}
                                        onChange={(e) => form.setData('institute_address', e.target.value)}
                                        placeholder="Shahbaz Pur Road, Near Sports Complex, Rahim Yar Khan, Punjab, Pakistan"
                                        className="w-full text-xs rounded-xl border-gray-200 focus:ring-[#00401A] focus:border-[#00401A]"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-gray-800 uppercase tracking-wider block">
                                        Public Support & Inquiries Email
                                    </label>
                                    <input
                                        type="email"
                                        value={form.data.official_email}
                                        onChange={(e) => form.setData('official_email', e.target.value)}
                                        placeholder="info@gtti.edu.pk"
                                        className="w-full text-xs rounded-xl border-gray-200 focus:ring-[#00401A] focus:border-[#00401A]"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-gray-800 uppercase tracking-wider block">
                                        Google Maps Location / Embed URL
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.google_maps_link}
                                        onChange={(e) => form.setData('google_maps_link', e.target.value)}
                                        placeholder="https://maps.google.com/..."
                                        className="w-full text-xs rounded-xl border-gray-200 focus:ring-[#00401A] focus:border-[#00401A]"
                                    />
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-black text-gray-800 uppercase tracking-wider block">
                                        Affiliation & Regulatory Compliance Statement
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={form.data.affiliation_text}
                                        onChange={(e) => form.setData('affiliation_text', e.target.value)}
                                        placeholder="Affiliated with Punjab Board of Technical Education (PBTE) Lahore & National Vocational and Technical Training Commission (NAVTTC) Islamabad."
                                        className="w-full text-xs rounded-xl border-gray-200 focus:ring-[#00401A] focus:border-[#00401A]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bottom Sticky Action Bar */}
                    <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Info className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>Changes take effect immediately across all cached public views upon saving.</span>
                        </div>

                        <div className="flex items-center space-x-3">
                            <a
                                href="/"
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition flex items-center space-x-1.5"
                            >
                                <span>Preview Home</span>
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="px-6 py-2.5 rounded-xl bg-[#00401A] hover:bg-[#003314] text-white text-xs font-black transition flex items-center space-x-2 shadow-lg hover:shadow-emerald-950/20 active:scale-95 disabled:opacity-50"
                            >
                                <Save className="h-4 w-4 text-amber-400" />
                                <span>{form.processing ? 'Publishing Changes...' : 'Save & Publish Live'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </LayoutComponent>
    );
}
