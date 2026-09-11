import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Clock,
    User,
    Calendar,
    Building2,
    MapPin,
    BookOpen,
    Sparkles,
    CalendarDays,
    AlertCircle
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Index({ activeEnrollment, timetables = [] }) {
    const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

    const groupedByDay = DAYS.reduce((acc, day) => {
        acc[day] = timetables.filter((s) => s.day_of_week === day);
        return acc;
    }, {});

    const todaySlots = groupedByDay[todayName] || [];

    return (
        <AuthenticatedLayout>
            <Head title="My Class & Lab Timetable - Student Portal" />

            <div className="py-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium mb-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Academic Routine</span>
                            <span>•</span>
                            <span>Weekly Class Schedule</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            My Weekly Timetable
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {activeEnrollment ? (
                                <>
                                    Enrolled in <strong className="text-slate-700 dark:text-slate-200">{activeEnrollment.course?.name}</strong> • Shift: <strong className="text-slate-700 dark:text-slate-200 uppercase">{activeEnrollment.shift || 'Morning'}</strong> ({activeEnrollment.batch?.name || '2026'})
                                </>
                            ) : (
                                'Personal course timetable for active enrolled trainees'
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 self-start sm:self-auto">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Today is {todayName}</span>
                    </div>
                </div>

                {!activeEnrollment ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 text-center text-slate-500 text-xs shadow-xs space-y-2">
                        <AlertCircle className="w-8 h-8 mx-auto text-amber-500" />
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            No Active Course Enrollment Found
                        </h3>
                        <p className="max-w-md mx-auto">
                            The personal timetable is available exclusively to active enrolled students. Once your admission and enrollment are confirmed, your weekly lecture schedule will appear here.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Today's Schedule Highlight */}
                        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-[#002B12] text-white p-5 sm:p-6 rounded-2xl shadow-lg border border-emerald-500/40 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                    <h2 className="text-sm font-black uppercase tracking-wider text-amber-300">
                                        Today's Classes ({todayName})
                                    </h2>
                                </div>
                                <span className="text-xs text-emerald-200 font-semibold">
                                    {todaySlots.length} lecture{todaySlots.length === 1 ? '' : 's'} scheduled
                                </span>
                            </div>

                            {todaySlots.length === 0 ? (
                                <p className="text-xs text-emerald-100/80 italic py-2">
                                    No lectures scheduled for today. Enjoy your workshop preparation time!
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                                    {todaySlots.map((slot) => (
                                        <div
                                            key={slot.id}
                                            className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5"
                                        >
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-mono font-black text-amber-300">
                                                    {slot.start_time?.substring(0, 5)} - {slot.end_time?.substring(0, 5)}
                                                </span>
                                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-white/20">
                                                    {slot.room_or_lab}
                                                </span>
                                            </div>

                                            <h4 className="text-sm font-bold text-white line-clamp-1">
                                                {slot.subject_name}
                                            </h4>

                                            <p className="text-xs text-emerald-200 font-medium">
                                                Instructor: {slot.teacher?.name || 'Faculty'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Full Week Day-by-Day Matrix */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-emerald-600" />
                                <span>Full Weekly Class Routine</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {DAYS.map((day) => {
                                    const slots = groupedByDay[day] || [];
                                    const isToday = day === todayName;

                                    return (
                                        <div
                                            key={day}
                                            className={`rounded-2xl border overflow-hidden shadow-xs transition ${
                                                isToday
                                                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-700'
                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                            }`}
                                        >
                                            <div className={`px-4 py-2.5 border-b flex items-center justify-between text-xs font-bold ${
                                                isToday
                                                    ? 'bg-emerald-700 text-white'
                                                    : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-700'
                                            }`}>
                                                <span className="uppercase tracking-wider">{day}</span>
                                                <span className="text-[11px] opacity-80">
                                                    {slots.length} class{slots.length === 1 ? '' : 'es'}
                                                </span>
                                            </div>

                                            <div className="p-3 space-y-2">
                                                {slots.length === 0 ? (
                                                    <p className="text-[11px] text-slate-400 italic py-2 text-center">
                                                        No classes on {day}
                                                    </p>
                                                ) : (
                                                    slots.map((slot) => (
                                                        <div
                                                            key={slot.id}
                                                            className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-xs space-y-1"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-mono font-black text-emerald-800 dark:text-emerald-400">
                                                                    {slot.start_time?.substring(0, 5)} - {slot.end_time?.substring(0, 5)}
                                                                </span>
                                                                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                                                    <MapPin className="w-2.5 h-2.5" />
                                                                    {slot.room_or_lab}
                                                                </span>
                                                            </div>

                                                            <h5 className="font-bold text-slate-900 dark:text-white">
                                                                {slot.subject_name}
                                                            </h5>

                                                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                                                <User className="w-3 h-3 text-slate-400" />
                                                                <span>{slot.teacher?.name || 'Instructor'}</span>
                                                            </p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
