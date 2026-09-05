import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import {
    User,
    Calendar,
    MapPin,
    Phone,
    Shield,
    CheckCircle2,
    Save,
    AlertCircle,
    ArrowLeft,
    FileText,
    Sparkles,
    GraduationCap,
    BookOpen
} from 'lucide-react';

export default function Edit({ profile }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        cnic: user?.cnic || '',
        father_name: profile?.father_name || '',
        date_of_birth: profile?.date_of_birth ? profile.date_of_birth.substring(0, 10) : '',
        gender: profile?.gender || 'Male',
        domicile_district: profile?.domicile_district || 'Rahim Yar Khan',
        address: profile?.address || '',
        emergency_contact: profile?.emergency_contact || user?.phone || '',
        matric_total_marks: profile?.matric_total_marks ?? 1100,
        matric_obtained_marks: profile?.matric_obtained_marks ?? '',
        matric_board: profile?.matric_board || 'BISE Bahawalpur',
        intermediate_total_marks: profile?.intermediate_total_marks ?? 1100,
        intermediate_obtained_marks: profile?.intermediate_obtained_marks ?? '',
        intermediate_board: profile?.intermediate_board || 'BISE Bahawalpur',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('student.profile.update'));
    };

    const matricPercent = data.matric_total_marks && data.matric_obtained_marks
        ? ((Number(data.matric_obtained_marks) / Number(data.matric_total_marks)) * 100).toFixed(1)
        : null;

    const interPercent = data.intermediate_total_marks && data.intermediate_obtained_marks
        ? ((Number(data.intermediate_obtained_marks) / Number(data.intermediate_total_marks)) * 100).toFixed(1)
        : null;

    const isComplete = Boolean(
        data.cnic &&
        profile?.father_name &&
        profile?.date_of_birth &&
        profile?.gender &&
        profile?.domicile_district &&
        profile?.address &&
        profile?.emergency_contact
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-gray-800">
                            Master Student Profile
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Applicant Identity, CNIC Verification & Academic Qualifications Record
                        </p>
                    </div>
                    <Link
                        href={route('dashboard')}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-gray-700 transition"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back to Portal</span>
                    </Link>
                </div>
            }
        >
            <Head title="Student Profile & Academic Record - GIIMS" />

            <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Status Indicator Banner */}
                <div className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-gray-900 shadow-md ${
                            isComplete ? 'bg-govt-green text-white' : 'bg-amber-400 text-slate-950'
                        }`}>
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="text-base font-bold text-gray-900">
                                    {user.name}
                                </h3>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    isComplete
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                        : 'bg-amber-50 text-amber-700 border border-amber-300'
                                }`}>
                                    {isComplete ? 'Profile Complete' : 'Profile Incomplete'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                                CNIC: <strong className="font-mono text-gray-800">{user.cnic || data.cnic || 'Not set'}</strong> • Email: {user.email}
                            </p>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 max-w-xs">
                        <span className="font-semibold text-gray-700">Notice:</span> A valid CNIC and academic marks are required to process course admission and screening tests.
                    </div>
                </div>

                {/* Success Notification */}
                {recentlySuccessful && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center space-x-2 shadow-sm">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span>Master Student Profile & Academic Record saved successfully!</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Form Card 1: Personal & Identity Details */}
                    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
                        <div className="border-b border-gray-100 pb-4">
                            <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                                <Shield className="h-5 w-5 text-govt-green" />
                                <span>1. Personal & Institutional Identity Details</span>
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Please provide authentic details matching your official CNIC/B-Form and Educational Certificates.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Applicant Full Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Applicant Full Name (as per CNIC / Matric)
                                </label>
                                <input
                                    type="text"
                                    value={user.name}
                                    disabled
                                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-gray-200 rounded-xl text-xs text-gray-600 cursor-not-allowed font-bold"
                                />
                                <p className="text-[10px] text-gray-500 mt-1">Managed via Master Account Identity.</p>
                            </div>

                            {/* CNIC / B-Form Number */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    CNIC / B-Form Number <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="31202-1234567-1"
                                    maxLength="15"
                                    value={data.cnic}
                                    onChange={(e) => setData('cnic', e.target.value)}
                                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-mono font-bold text-gray-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                                        errors.cnic ? 'border-rose-500 focus:ring-rose-500/30' : 'border-gray-300 focus:ring-govt-green-400/30'
                                    }`}
                                    required
                                />
                                {errors.cnic && <p className="text-[11px] text-rose-500 mt-1">{errors.cnic}</p>}
                                <p className="text-[10px] text-gray-400 mt-1">Used for entrance test verification, roll slip issuance, and TEVTA certification.</p>
                            </div>

                            {/* Father / Guardian Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Father / Guardian Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter father or guardian name"
                                    value={data.father_name}
                                    onChange={(e) => setData('father_name', e.target.value)}
                                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs text-gray-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                                        errors.father_name ? 'border-rose-500 focus:ring-rose-500/30' : 'border-gray-300 focus:ring-govt-green-400/30'
                                    }`}
                                    required
                                />
                                {errors.father_name && <p className="text-[11px] text-rose-500 mt-1">{errors.father_name}</p>}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Date of Birth <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.date_of_birth}
                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 ${
                                        errors.date_of_birth ? 'border-rose-500 focus:ring-rose-500/30' : 'border-gray-300 focus:ring-govt-green-400/30'
                                    }`}
                                    required
                                />
                                {errors.date_of_birth && <p className="text-[11px] text-rose-500 mt-1">{errors.date_of_birth}</p>}
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Gender <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-govt-green-400/30"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Domicile District */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Domicile District <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Rahim Yar Khan, Bahawalpur, Sadiqabad"
                                    value={data.domicile_district}
                                    onChange={(e) => setData('domicile_district', e.target.value)}
                                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs text-gray-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                                        errors.domicile_district ? 'border-rose-500 focus:ring-rose-500/30' : 'border-gray-300 focus:ring-govt-green-400/30'
                                    }`}
                                    required
                                />
                                {errors.domicile_district && <p className="text-[11px] text-rose-500 mt-1">{errors.domicile_district}</p>}
                            </div>

                            {/* Emergency Contact Phone */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Emergency / WhatsApp Mobile Phone <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 0300-1234567"
                                    value={data.emergency_contact}
                                    onChange={(e) => setData('emergency_contact', e.target.value)}
                                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 ${
                                        errors.emergency_contact ? 'border-rose-500 focus:ring-rose-500/30' : 'border-gray-300 focus:ring-govt-green-400/30'
                                    }`}
                                    required
                                />
                                {errors.emergency_contact && <p className="text-[11px] text-rose-500 mt-1">{errors.emergency_contact}</p>}
                            </div>

                            {/* Permanent Home Address */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Permanent Residential Address <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows="2"
                                    placeholder="House / Street, Tehsil, District..."
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 ${
                                        errors.address ? 'border-rose-500 focus:ring-rose-500/30' : 'border-gray-300 focus:ring-govt-green-400/30'
                                    }`}
                                    required
                                />
                                {errors.address && <p className="text-[11px] text-rose-500 mt-1">{errors.address}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Form Card 2: Academic Qualifications & Marks */}
                    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
                        <div className="border-b border-gray-100 pb-4">
                            <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                                <GraduationCap className="h-5 w-5 text-amber-500" />
                                <span>2. Academic Qualifications & Marks Record</span>
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Record your Matriculation and Intermediate educational scores for course entry scrutiny and merit processing.
                            </p>
                        </div>

                        {/* Matric / SSC Marks */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                                    <BookOpen className="h-4 w-4 text-govt-green" />
                                    <span>Matriculation (SSC / 10th Grade)</span>
                                </span>
                                {matricPercent && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                                        Score: {matricPercent}%
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Total Marks</label>
                                    <input
                                        type="number"
                                        min="100"
                                        max="1500"
                                        value={data.matric_total_marks}
                                        onChange={(e) => setData('matric_total_marks', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Obtained Marks</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={data.matric_total_marks || 1500}
                                        placeholder="e.g. 850"
                                        value={data.matric_obtained_marks}
                                        onChange={(e) => setData('matric_obtained_marks', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Board of Education</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. BISE Bahawalpur"
                                        value={data.matric_board}
                                        onChange={(e) => setData('matric_board', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Intermediate / HSSC / DAE Marks */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                                    <GraduationCap className="h-4 w-4 text-amber-600" />
                                    <span>Intermediate (HSSC / F.Sc / I.Com / DAE - Optional / If Applicable)</span>
                                </span>
                                {interPercent && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 font-mono">
                                        Score: {interPercent}%
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Total Marks</label>
                                    <input
                                        type="number"
                                        min="100"
                                        max="1500"
                                        value={data.intermediate_total_marks}
                                        onChange={(e) => setData('intermediate_total_marks', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Obtained Marks</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={data.intermediate_total_marks || 1500}
                                        placeholder="e.g. 780"
                                        value={data.intermediate_obtained_marks}
                                        onChange={(e) => setData('intermediate_obtained_marks', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Board of Intermediate / PBTE</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. BISE Bahawalpur / PBTE"
                                        value={data.intermediate_board}
                                        onChange={(e) => setData('intermediate_board', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2 flex items-center justify-end space-x-3">
                        <Link
                            href={route('dashboard')}
                            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs font-bold transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-7 py-3 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white text-xs font-black uppercase tracking-wider transition shadow-lg shadow-govt-green/20 disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
                        >
                            <Save className="h-4 w-4" />
                            <span>{processing ? 'Saving Profile...' : 'Save Master Profile & Academic Record'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
