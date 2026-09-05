import { useState } from 'react';
import ClerkLayout from '@/Layouts/ClerkLayout';
import { Head, useForm } from '@inertiajs/react';
import {
    Send,
    Calendar,
    Clock,
    MapPin,
    AlertCircle,
    CheckCircle2,
    Users,
    FileText,
    Sparkles,
    Megaphone,
    BookOpen
} from 'lucide-react';

export default function Index({ courses = [], recentSchedules = [] }) {
    const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');

    const selectedCourse = courses.find((c) => String(c.id) === String(selectedCourseId)) || courses[0];

    const { data, setData, post, processing, reset, recentlySuccessful } = useForm({
        course_id: courses[0]?.id || '',
        test_date: '',
        test_time: '09:00 AM Sharp',
        test_venue: 'Main Examination Hall / Computer Lab 1',
        clerk_notice: 'Bring original CNIC / Form-B, original Matriculation result card/certificate, 2 passport size photographs, and paid bank challan copy.',
    });

    const handleCourseChange = (e) => {
        const id = e.target.value;
        setSelectedCourseId(id);
        setData('course_id', id);
    };

    const handleBroadcast = (e) => {
        e.preventDefault();
        post(route('clerk.scheduler.broadcast'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('test_date');
            },
        });
    };

    return (
        <ClerkLayout
            header={
                <div className="flex items-center space-x-2 text-xs font-medium">
                    <span className="font-bold text-[#C1902F]">Clerk Desk</span>
                    <span>/</span>
                    <span className="text-white font-semibold">1-Click Bulk Test Scheduler & Broadcast Engine</span>
                </div>
            }
        >
            <Head title="Broadcast & Test Scheduler - GTTI Clerk Portal" />

            <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
                {/* Header Banner */}
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center space-x-2">
                            <Send className="h-5 w-5 text-amber-400" />
                            <h1 className="text-xl font-black text-white">Course-Wise Bulk Test Scheduler</h1>
                        </div>
                        <p className="text-xs text-slate-400">
                            Broadcast official examination dates, reporting times, lab venues, and mandatory instructions to all verified candidates of any trade in a single click.
                        </p>
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-2xl">
                        <Megaphone className="h-4 w-4 shrink-0" />
                        <span>Instant Push to Student Call Letters</span>
                    </div>
                </div>

                {/* Main Scheduler Form & Target Trade Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: The Broadcast Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
                            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                                <Sparkles className="h-4 w-4 text-[#C1902F]" />
                                <span>Schedule Entrance Test / Interview</span>
                            </h2>

                            {recentlySuccessful && (
                                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-3">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                                    <span>Test date and official Call Letters successfully broadcasted to all matched applicants!</span>
                                </div>
                            )}

                            <form onSubmit={handleBroadcast} className="space-y-5 text-xs">
                                {/* Course Selection */}
                                <div>
                                    <label className="block font-bold text-slate-300 mb-1.5">
                                        Select Target Trade / Course *
                                    </label>
                                    <select
                                        value={data.course_id}
                                        onChange={handleCourseChange}
                                        className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:ring-1 focus:ring-amber-500"
                                        required
                                    >
                                        {courses.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.total_applicants || 0} applicants • {c.verified_applicants || 0} verified)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-bold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                                            <Calendar className="h-4 w-4 text-amber-400" />
                                            <span>Reporting / Test Date *</span>
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            value={data.test_date}
                                            onChange={(e) => setData('test_date', e.target.value)}
                                            className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                                            <Clock className="h-4 w-4 text-amber-400" />
                                            <span>Reporting Time *</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. 09:00 AM Sharp"
                                            value={data.test_time}
                                            onChange={(e) => setData('test_time', e.target.value)}
                                            className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-500 font-mono"
                                        />
                                    </div>
                                </div>

                                {/* Venue */}
                                <div>
                                    <label className="block font-bold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                                        <MapPin className="h-4 w-4 text-amber-400" />
                                        <span>Examination Venue / Room *</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Main Computer Lab / IT Block Room 4"
                                        value={data.test_venue}
                                        onChange={(e) => setData('test_venue', e.target.value)}
                                        className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-500"
                                    />
                                </div>

                                {/* Mandatory Notice */}
                                <div>
                                    <label className="block font-bold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                                        <FileText className="h-4 w-4 text-amber-400" />
                                        <span>Clerk's Mandatory Instructions for Candidate Call Letter *</span>
                                    </label>
                                    <textarea
                                        required
                                        rows="3"
                                        placeholder="Mandatory instructions for examinees..."
                                        value={data.clerk_notice}
                                        onChange={(e) => setData('clerk_notice', e.target.value)}
                                        className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-500 leading-relaxed"
                                    />
                                </div>

                                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start space-x-2.5">
                                    <AlertCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                        <strong className="text-white block">1-Click Institutional Push:</strong>
                                        <span>
                                            Executing this broadcast will update all {selectedCourse?.total_applicants || 0} applicants' dossiers, publish an official announcement, and generate their printable Call Letters.
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={processing || !data.test_date}
                                        className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-[#C1902F] via-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-xl disabled:opacity-40 flex items-center space-x-2"
                                    >
                                        <Send className="h-4 w-4" />
                                        <span>{processing ? 'Generating & Issuing Slips...' : '1-Click Generate & Issue Roll Number Slips'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right 1 Col: Selected Trade Stats Card */}
                    <div className="space-y-6">
                        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
                            <h3 className="text-sm font-bold text-white">Target Trade Audience</h3>

                            {selectedCourse ? (
                                <div className="space-y-4 text-xs">
                                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Selected Trade</span>
                                        <p className="font-bold text-white text-sm">{selectedCourse.name}</p>
                                        <span className="text-[11px] text-amber-400 block">
                                            {selectedCourse.admission_type === 'merit_based' ? 'Merit-Based Intake' : 'First-Come-First-Served'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold">Total Applicants</span>
                                            <p className="text-xl font-black text-white font-mono mt-1">
                                                {selectedCourse.total_applicants || 0}
                                            </p>
                                        </div>

                                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                                            <span className="text-[10px] text-emerald-400 uppercase font-bold">Verified Dossiers</span>
                                            <p className="text-xl font-black text-emerald-400 font-mono mt-1">
                                                {selectedCourse.verified_applicants || 0}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                                        <span className="text-[10px] text-blue-400 uppercase font-bold">Already Scheduled</span>
                                        <p className="text-xl font-black text-blue-400 font-mono mt-1">
                                            {selectedCourse.scheduled_applicants || 0}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-slate-500 text-xs">
                                    Select a course on the left.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ClerkLayout>
    );
}
