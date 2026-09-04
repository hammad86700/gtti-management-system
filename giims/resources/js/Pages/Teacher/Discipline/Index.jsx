import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import {
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    Clock,
    User,
    FileText,
    Send,
    Inbox,
    Filter,
    Search,
    Scale,
    AlertCircle,
    GraduationCap,
    Info,
    Calendar,
    ChevronRight,
    Ban
} from 'lucide-react';

export default function Index({ batches = [], students = [], requests = [] }) {
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data: form,
        setData: setForm,
        post,
        processing,
        errors,
        reset,
        recentlySuccessful,
    } = useForm({
        student_profile_id: students[0]?.profile_id || '',
        batch_id: students[0]?.batch_id || '',
        request_type: 'struck_off', // 'struck_off' | 'terminate'
        struck_off_days: 7,
        reason_category: 'absenteeism',
        reason: '',
        evidence_notes: '',
    });

    const handleStudentChange = (profileId) => {
        const selected = students.find((s) => String(s.profile_id) === String(profileId));
        setForm((prev) => ({
            ...prev,
            student_profile_id: profileId,
            batch_id: selected?.batch_id || '',
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('teacher.discipline.store'), {
            onSuccess: () => {
                reset('reason', 'evidence_notes');
            },
        });
    };

    // Filter requests
    const filteredRequests = requests.filter((r) => {
        const studentName = r.student_profile?.user?.name || '';
        const rollNo = r.student_profile?.registration_number || '';
        const reason = r.reason || '';

        const matchesSearch =
            studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reason.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;
        if (statusFilter === 'pending') return r.status === 'pending';
        if (statusFilter === 'approved') return r.status === 'approved';
        if (statusFilter === 'rejected') return r.status === 'rejected';

        return true;
    });

    const pendingCount = requests.filter((r) => r.status === 'pending').length;
    const approvedCount = requests.filter((r) => r.status === 'approved').length;
    const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

    const dayPresets = [3, 7, 14, 21, 30];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-500/20 shadow-sm">
                            <Scale className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 leading-tight">
                                Trainee Disciplinary & Termination Requests
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Submit formal struck-off (suspension) and termination requests to the Principal Office
                            </p>
                        </div>
                    </div>

                    {pendingCount > 0 && (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{pendingCount} Pending Principal Review</span>
                        </span>
                    )}
                </div>
            }
        >
            <Head title="Disciplinary Requests - Instructor Desk" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* METRICS ROW */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Filed</span>
                            <FileText className="h-4 w-4 text-govt-green-600" />
                        </div>
                        <p className="text-2xl font-black text-gray-900 mt-2">{requests.length}</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Under Review</span>
                            <Clock className="h-4 w-4 text-amber-600" />
                        </div>
                        <p className="text-2xl font-black text-amber-600 mt-2">{pendingCount}</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Sanction Approved</span>
                            <CheckCircle2 className="h-4 w-4 text-rose-600" />
                        </div>
                        <p className="text-2xl font-black text-rose-600 mt-2">{approvedCount}</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Pardoned / Dismissed</span>
                            <Info className="h-4 w-4 text-gray-500" />
                        </div>
                        <p className="text-2xl font-black text-gray-700 mt-2">{rejectedCount}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN: REQUEST INITIATION FORM (5 COLS) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm space-y-5">
                            <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                                <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                                    <ShieldAlert className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">
                                        Initiate Disciplinary Action
                                    </h3>
                                    <p className="text-[11px] text-gray-500">
                                        Forward formal sanction request to Principal
                                    </p>
                                </div>
                            </div>

                            {recentlySuccessful && (
                                <div className="p-3.5 rounded-xl bg-govt-green-50 border border-govt-green-200 text-govt-green-800 text-xs font-semibold flex items-center space-x-2.5">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-govt-green-600" />
                                    <span>Disciplinary request successfully dispatched to the Principal Office!</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                                {/* Student Selection */}
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">
                                        Select Trainee Candidate <span className="text-rose-500">*</span>
                                    </label>
                                    {students.length === 0 ? (
                                        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 text-xs">
                                            No active trainees found in your assigned batches.
                                        </div>
                                    ) : (
                                        <select
                                            value={form.student_profile_id}
                                            onChange={(e) => handleStudentChange(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-gray-900"
                                        >
                                            {students.map((st) => (
                                                <option key={st.profile_id} value={st.profile_id}>
                                                    {st.name} (S/O {st.father_name}) — {st.course_name} ({st.batch_name})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {errors.student_profile_id && (
                                        <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.student_profile_id}</p>
                                    )}
                                </div>

                                {/* Request Type Selection (Radio Pills) */}
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1.5">
                                        Proposed Disciplinary Action <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => setForm('request_type', 'struck_off')}
                                            className={`p-3 rounded-xl border text-left transition-all ${
                                                form.request_type === 'struck_off'
                                                    ? 'border-amber-500 bg-amber-50/70 text-amber-900 ring-2 ring-amber-500/20 shadow-sm'
                                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-xs flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                                                    Struck-Off
                                                </span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">Temporary</span>
                                            </div>
                                            <p className="text-[10px] text-gray-500">
                                                Close dashboard for specific days
                                            </p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setForm('request_type', 'terminate')}
                                            className={`p-3 rounded-xl border text-left transition-all ${
                                                form.request_type === 'terminate'
                                                    ? 'border-rose-500 bg-rose-50/70 text-rose-900 ring-2 ring-rose-500/20 shadow-sm'
                                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-xs flex items-center gap-1.5">
                                                    <Ban className="h-3.5 w-3.5 text-rose-600" />
                                                    Terminate
                                                </span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">Permanent</span>
                                            </div>
                                            <p className="text-[10px] text-gray-500">
                                                Permanent expulsion from college
                                            </p>
                                        </button>
                                    </div>
                                </div>

                                {/* Struck-off Duration (Only if struck_off) */}
                                {form.request_type === 'struck_off' && (
                                    <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-2">
                                        <label className="block font-bold text-amber-900">
                                            Suspension Duration (Days) <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            {dayPresets.map((preset) => (
                                                <button
                                                    key={preset}
                                                    type="button"
                                                    onClick={() => setForm('struck_off_days', preset)}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                                                        Number(form.struck_off_days) === preset
                                                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                                            : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300'
                                                    }`}
                                                >
                                                    {preset}d
                                                </button>
                                            ))}
                                            <input
                                                type="number"
                                                min="1"
                                                max="365"
                                                value={form.struck_off_days}
                                                onChange={(e) => setForm('struck_off_days', e.target.value)}
                                                className="w-20 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                                placeholder="Custom"
                                            />
                                        </div>
                                        <p className="text-[10px] text-amber-700">
                                            Student dashboard will be locked for {form.struck_off_days || 0} days from approval.
                                        </p>
                                        {errors.struck_off_days && (
                                            <p className="text-[11px] text-rose-500 mt-1">{errors.struck_off_days}</p>
                                        )}
                                    </div>
                                )}

                                {/* Violation Category */}
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">
                                        Infraction Category <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={form.reason_category}
                                        onChange={(e) => setForm('reason_category', e.target.value)}
                                        className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-gray-900"
                                    >
                                        <option value="absenteeism">Continuous Absenteeism (مسلسل غیر حاضری)</option>
                                        <option value="misconduct">Gross Misconduct / Insubordination (سنگین بدتمیزی / نقصِ امن)</option>
                                        <option value="property_damage">Damage to Workshop Machinery / Tools (سرکاری املاک کو نقصان)</option>
                                        <option value="cheating">CBT / Exam Malpractice & Cheating (امتحان میں نقل)</option>
                                        <option value="rule_violation">Institutional Code of Conduct Violation (قواعد و ضوابط کی خلاف ورزی)</option>
                                        <option value="other">Other Severe Grounds (دیگر وجوہات)</option>
                                    </select>
                                </div>

                                {/* Brief Title / Charge */}
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">
                                        Charge / Summary Heading <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.reason}
                                        onChange={(e) => setForm('reason', e.target.value)}
                                        placeholder="e.g., 8 Consecutive Days Absent Without Prior Notice"
                                        className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-gray-900"
                                    />
                                    {errors.reason && (
                                        <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.reason}</p>
                                    )}
                                </div>

                                {/* Evidence & Detailed Notes */}
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">
                                        Instructor Statement & Evidence Notes
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={form.evidence_notes}
                                        onChange={(e) => setForm('evidence_notes', e.target.value)}
                                        placeholder="Document dates of occurrence, verbal warnings already given, witnesses, or workshop impact..."
                                        className="w-full px-3 py-2 bg-govt-cream border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-gray-900"
                                    />
                                    {errors.evidence_notes && (
                                        <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.evidence_notes}</p>
                                    )}
                                </div>

                                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-600 flex items-start space-x-2">
                                    <Info className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                                    <span>
                                        This recommendation will be forwarded to the Principal for formal administrative review. Upon approval, the student dashboard and campus access will be restricted.
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing || students.length === 0}
                                    className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                                >
                                    <Send className="h-4 w-4" />
                                    <span>{processing ? 'Submitting to Principal...' : 'Submit Request to Principal'}</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: FILED REQUESTS & STATUS TRACKER (7 COLS) */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">
                                        Submitted Disciplinary Requests
                                    </h3>
                                    <p className="text-[11px] text-gray-500">
                                        Track status and Principal Office decisions
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <div className="relative">
                                        <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search student or charge..."
                                            className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-govt-green-500/20 text-gray-900 w-44"
                                        />
                                    </div>

                                    <div className="flex items-center rounded-xl bg-gray-100 p-1 border border-gray-200 text-xs">
                                        {['all', 'pending', 'approved', 'rejected'].map((tab) => (
                                            <button
                                                key={tab}
                                                type="button"
                                                onClick={() => setStatusFilter(tab)}
                                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] capitalize transition-all ${
                                                    statusFilter === tab
                                                        ? 'bg-white text-gray-900 shadow-xs'
                                                        : 'text-gray-500 hover:text-gray-900'
                                                }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {filteredRequests.length === 0 ? (
                                <div className="py-12 text-center text-gray-500 space-y-2">
                                    <Inbox className="h-8 w-8 mx-auto text-gray-300" />
                                    <p className="text-xs font-bold text-gray-700">No disciplinary requests found</p>
                                    <p className="text-[11px] text-gray-400">
                                        Requests you file against students will appear here with Principal review updates.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredRequests.map((req) => {
                                        const isStruckOff = req.request_type === 'struck_off';
                                        const studentUser = req.student_profile?.user;
                                        const roll = req.student_profile?.registration_number || 'N/A';

                                        return (
                                            <div
                                                key={req.id}
                                                className="p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-all space-y-3"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start space-x-3">
                                                        <div
                                                            className={`p-2 rounded-xl mt-0.5 ${
                                                                isStruckOff
                                                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                            }`}
                                                        >
                                                            {isStruckOff ? (
                                                                <Clock className="h-4 w-4" />
                                                            ) : (
                                                                <Ban className="h-4 w-4" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <h4 className="font-bold text-sm text-gray-900">
                                                                    {studentUser?.name || 'Candidate'}
                                                                </h4>
                                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                                                                    Roll: {roll}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-gray-500 mt-0.5">
                                                                {req.batch?.course?.name || 'Course'} • {req.batch?.name || 'Batch'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Status Badge */}
                                                    <div>
                                                        {req.status === 'pending' && (
                                                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                                                                <Clock className="h-3 w-3" />
                                                                <span>Pending Review</span>
                                                            </span>
                                                        )}
                                                        {req.status === 'approved' && (
                                                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-govt-green-50 text-govt-green-700 border border-govt-green-200">
                                                                <CheckCircle2 className="h-3 w-3 text-govt-green-600" />
                                                                <span>Sanction Approved</span>
                                                            </span>
                                                        )}
                                                        {req.status === 'rejected' && (
                                                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                                                <Info className="h-3 w-3" />
                                                                <span>Request Dismissed</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Request Details */}
                                                <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 text-xs space-y-1.5">
                                                    <div className="flex items-center justify-between text-[11px]">
                                                        <span className="font-bold text-gray-700">
                                                            Proposed Action:{' '}
                                                            <span className={isStruckOff ? 'text-amber-700 font-extrabold' : 'text-rose-700 font-extrabold'}>
                                                                {isStruckOff ? `Struck-off (${req.struck_off_days || 7} Days)` : 'Permanent Termination'}
                                                            </span>
                                                        </span>
                                                        <span className="text-gray-400 text-[10px]">
                                                            Filed: {new Date(req.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <p className="font-semibold text-gray-800">
                                                        Charge: {req.reason}
                                                    </p>
                                                    {req.evidence_notes && (
                                                        <p className="text-[11px] text-gray-500 italic">
                                                            "{req.evidence_notes}"
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Principal Review Notes (if reviewed) */}
                                                {req.status !== 'pending' && (
                                                    <div
                                                        className={`p-3 rounded-xl border text-xs space-y-1 ${
                                                            req.status === 'approved'
                                                                ? 'bg-rose-50/60 border-rose-200/80 text-rose-950'
                                                                : 'bg-gray-50 border-gray-200 text-gray-700'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between font-bold text-[11px]">
                                                            <span className="flex items-center space-x-1">
                                                                <Scale className="h-3 w-3" />
                                                                <span>Principal Office Decision:</span>
                                                            </span>
                                                            {req.order_reference && (
                                                                <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                                                    Order: {req.order_reference}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px]">
                                                            {req.admin_remarks || (req.status === 'approved' ? 'Disciplinary sanction approved and enforced.' : 'Request dismissed by college administration.')}
                                                        </p>
                                                        {req.reviewed_at && (
                                                            <p className="text-[10px] text-gray-400">
                                                                Decided on: {new Date(req.reviewed_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
