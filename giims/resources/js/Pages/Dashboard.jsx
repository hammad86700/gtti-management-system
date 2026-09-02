import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    UserCheck,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
    GraduationCap,
    FileText,
    Sparkles,
    Shield,
    BookOpen,
    Clock,
    Award
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/UI/Card';
import Badge from '@/Components/UI/Badge';

export default function Dashboard({ profile, applications = [] }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const isProfileComplete = Boolean(
        profile?.father_name &&
        profile?.date_of_birth &&
        profile?.gender &&
        profile?.domicile_district &&
        profile?.address &&
        profile?.emergency_contact
    );

    const getStatusVariant = (status) => {
        switch (status) {
            case 'submitted':
                return 'blue';
            case 'verified':
                return 'green';
            case 'selected':
                return 'purple';
            case 'rejected':
                return 'rose';
            default:
                return 'neutral';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                    <span className="font-bold text-govt-green">GTTI RYK</span>
                    <span>/</span>
                    <span className="text-slate-900 font-semibold truncate">Applicant Portal</span>
                </div>
            }
        >
            <Head title="Applicant Portal - GTTI RYK" />

            <div className="space-y-6">
                {/* Executive Page Greeting Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium mb-1">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-govt-green text-white">
                                TEVTA Punjab
                            </span>
                            <span>•</span>
                            <span className="font-mono text-slate-600">Admission Intake 2026-2027</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-slate-900 tracking-tight">
                            Applicant Portal Dashboard
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Govt. Technical Training Institute, Rahim Yar Khan (GIIMS)
                        </p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        ● Admission Session 2026-2027
                    </span>
                </div>
                {/* Welcome Hero Banner */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-govt-green via-govt-green-600 to-[#002B12] p-5 sm:p-6 text-white shadow-sm border border-govt-green-700/60">
                    <div className="relative z-10 max-w-3xl space-y-2">
                        <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-md bg-white/10 text-emerald-200 border border-white/15 text-xs font-semibold">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Welcome to GTTI Admissions Pipeline</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                            Hello, {user.name}!
                        </h2>
                        <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                            Welcome to the student applicant portal for Govt. Technical Training Institute, Rahim Yar Khan. Complete your admission workflow below to apply for government-accredited technical diplomas and CBT&A trades.
                        </p>
                    </div>
                </div>

                {/* Step 1 & 2 CTA Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Step 1: Master Profile */}
                    <Card className="p-5 flex flex-col justify-between space-y-4">
                        <div className="flex items-start space-x-3.5">
                            <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-xs ${
                                isProfileComplete ? 'bg-govt-green' : 'bg-amber-500'
                            }`}>
                                {isProfileComplete ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h3 className="text-base font-bold text-slate-900">
                                        Step 1: Master Profile
                                    </h3>
                                    <Badge variant={isProfileComplete ? 'green' : 'amber'} size="xs">
                                        {isProfileComplete ? 'Completed' : 'Required'}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    {isProfileComplete
                                        ? `Permanent student identity is verified (${profile.father_name} • ${profile.domicile_district}).`
                                        : 'Please record your guardian and domicile details before submitting an application.'}
                                </p>
                            </div>
                        </div>

                        <div>
                            <Link
                                href={route('student.profile.edit')}
                                className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                                    isProfileComplete
                                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                        : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs'
                                }`}
                            >
                                <span>{isProfileComplete ? 'Edit Master Profile' : 'Step 1: Complete Master Profile'}</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </Card>

                    {/* Step 2: Course Application */}
                    <Card className="p-5 flex flex-col justify-between space-y-4">
                        <div className="flex items-start space-x-3.5">
                            <div className="h-11 w-11 rounded-xl bg-govt-green text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h3 className="text-base font-bold text-slate-900">
                                        Step 2: Submit Application
                                    </h3>
                                    <Badge variant="green" size="xs">
                                        Open
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Select your technical trade, attach CNIC/certificate scans, and submit for merit verification.
                                </p>
                            </div>
                        </div>

                        <div>
                            <Link
                                href={route('student.application.create')}
                                className="w-full py-2 px-4 rounded-xl bg-govt-green hover:bg-govt-green-600 text-white text-xs font-bold transition shadow-xs flex items-center justify-center space-x-2"
                            >
                                <span>Step 2: Submit Application</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </Card>
                </div>

                {/* Submitted Applications Table */}
                {applications.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-2.5">
                                <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-govt-green">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div>
                                    <CardTitle>My Submitted Applications</CardTitle>
                                    <CardDescription>
                                        Track verification and enrollment progress for your course applications
                                    </CardDescription>
                                </div>
                            </div>
                            <Badge variant="neutral" size="xs">
                                {applications.length} Total
                            </Badge>
                        </CardHeader>

                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="text-slate-500 border-b border-slate-100">
                                            <th className="pb-3 font-semibold">App Number</th>
                                            <th className="pb-3 font-semibold">Applied Course / Trade</th>
                                            <th className="pb-3 font-semibold">Campaign</th>
                                            <th className="pb-3 font-semibold">Documents</th>
                                            <th className="pb-3 font-semibold">Status</th>
                                            <th className="pb-3 font-semibold">Submitted On</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                        {applications.map((app) => (
                                            <tr key={app.id} className="hover:bg-slate-50/70 transition">
                                                <td className="py-3 font-mono font-bold text-govt-green">
                                                    {app.application_number}
                                                </td>
                                                <td className="py-3">
                                                    <p className="font-bold text-slate-900">{app.course?.name}</p>
                                                    <p className="text-[11px] text-slate-500">
                                                        {app.course?.trade?.program?.department?.name} ({app.course?.trade?.program?.name})
                                                    </p>
                                                </td>
                                                <td className="py-3 text-slate-600">
                                                    {app.admission_campaign?.name}
                                                </td>
                                                <td className="py-3">
                                                    <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-govt-green">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        <span>{app.documents?.length || 0} Attached</span>
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    <Badge variant={getStatusVariant(app.status)} size="xs">
                                                        {app.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 font-mono text-[11px] text-slate-500">
                                                    {app.created_at ? app.created_at.substring(0, 10) : 'Recent'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
