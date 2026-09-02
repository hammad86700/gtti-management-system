import { Link } from '@inertiajs/react';
import {
    LayoutDashboard,
    BookOpen,
    CheckCircle2,
    User,
    ClipboardCheck
} from 'lucide-react';

export default function MobileBottomNav({ onAttendanceClick }) {
    const isDashboard = route().current('dashboard');
    const isLms = route().current('student.lms.*');
    const isProfile = route().current('profile.edit');
    const isOnlineTests = route().current('student.online-tests.*');

    const handleAttendanceTap = (e) => {
        if (onAttendanceClick) {
            e.preventDefault();
            onAttendanceClick();
            return;
        }

        if (isDashboard) {
            e.preventDefault();
            const el = document.getElementById('mobile-attendance-card');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add a brief glow/highlight effect
                el.classList.add('ring-4', 'ring-govt-gold', 'transition-all');
                setTimeout(() => el.classList.remove('ring-4', 'ring-govt-gold'), 1500);
            }
        }
    };

    return (
        <nav
            aria-label="Mobile Navigation Bar"
            className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
        >
            <div className="flex items-center justify-around max-w-md mx-auto">
                {/* 1. Dashboard Tab */}
                <Link
                    href={route('dashboard')}
                    className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl transition-all active:scale-90 ${
                        isDashboard
                            ? 'text-govt-green font-bold'
                            : 'text-gray-500 hover:text-gray-700 font-medium'
                    }`}
                >
                    <div className="relative">
                        <LayoutDashboard className={`h-5 w-5 ${isDashboard ? 'stroke-[2.5]' : 'stroke-2'}`} />
                        {isDashboard && (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-3 rounded-full bg-govt-green" />
                        )}
                    </div>
                    <span className="text-[10px] mt-1 tracking-tight">Home</span>
                </Link>

                {/* 2. LMS Tab */}
                <Link
                    href={route('student.lms.index')}
                    className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl transition-all active:scale-90 ${
                        isLms
                            ? 'text-govt-green font-bold'
                            : 'text-gray-500 hover:text-gray-700 font-medium'
                    }`}
                >
                    <div className="relative">
                        <BookOpen className={`h-5 w-5 ${isLms ? 'stroke-[2.5]' : 'stroke-2'}`} />
                        {isLms && (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-3 rounded-full bg-govt-green" />
                        )}
                    </div>
                    <span className="text-[10px] mt-1 tracking-tight">LMS</span>
                </Link>

                {/* 3. Class Attendance / Self-Mark Action Button */}
                <Link
                    href={route('dashboard')}
                    onClick={handleAttendanceTap}
                    className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl transition-all active:scale-90 text-gray-700 hover:text-govt-green font-medium"
                >
                    <div className="relative flex items-center justify-center">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-govt-green to-emerald-600 text-white flex items-center justify-center shadow-md shadow-govt-green/30">
                            <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
                        </div>
                    </div>
                    <span className="text-[10px] mt-0.5 font-bold text-govt-green">Check-In</span>
                </Link>

                {/* 4. CBT Exams */}
                <Link
                    href={route('student.online-tests.index')}
                    className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl transition-all active:scale-90 ${
                        isOnlineTests
                            ? 'text-govt-green font-bold'
                            : 'text-gray-500 hover:text-gray-700 font-medium'
                    }`}
                >
                    <div className="relative">
                        <ClipboardCheck className={`h-5 w-5 ${isOnlineTests ? 'stroke-[2.5]' : 'stroke-2'}`} />
                        {isOnlineTests && (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-3 rounded-full bg-govt-green" />
                        )}
                    </div>
                    <span className="text-[10px] mt-1 tracking-tight">CBT Tests</span>
                </Link>

                {/* 5. Profile Tab */}
                <Link
                    href={route('profile.edit')}
                    className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl transition-all active:scale-90 ${
                        isProfile
                            ? 'text-govt-green font-bold'
                            : 'text-gray-500 hover:text-gray-700 font-medium'
                    }`}
                >
                    <div className="relative">
                        <User className={`h-5 w-5 ${isProfile ? 'stroke-[2.5]' : 'stroke-2'}`} />
                        {isProfile && (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-3 rounded-full bg-govt-green" />
                        )}
                    </div>
                    <span className="text-[10px] mt-1 tracking-tight">Profile</span>
                </Link>
            </div>
        </nav>
    );
}
