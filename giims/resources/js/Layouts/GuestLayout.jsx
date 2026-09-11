import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import ThemeToggle from '@/Components/UI/ThemeToggle';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-govt-cream to-govt-green-50 dark:from-slate-950 dark:to-slate-900 pt-6 sm:justify-center sm:pt-0 transition-colors duration-200 relative px-4">
            {/* Gold accent bar at top */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-govt-gold-400 via-govt-gold to-govt-gold-400 z-50" />

            {/* Top Right Theme Toggle */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle variant="header" />
            </div>

            <div className="mb-3">
                <Link href="/" className="inline-flex items-center justify-center p-2 rounded-2xl bg-white dark:bg-slate-900 shadow-md border border-emerald-100/80 dark:border-slate-800 hover:shadow-lg hover:scale-105 transition duration-200">
                    <ApplicationLogo className="h-24 w-24 object-contain" />
                </Link>
            </div>

            <p className="text-sm font-semibold text-govt-green dark:text-emerald-400 mb-1 tracking-wide">GIIMS Portal</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-6 text-center">Govt. Technical Training Institute, Rahim Yar Khan</p>

            <div className="w-full overflow-hidden bg-white dark:bg-slate-900 px-6 py-6 shadow-govt-md sm:max-w-md sm:rounded-xl border border-gray-200 dark:border-slate-800 border-t-4 border-t-govt-green dark:border-t-emerald-500">
                {children}
            </div>

            <p className="mt-6 text-xs text-gray-400 dark:text-slate-500">Powered by TEVTA Punjab</p>
        </div>
    );
}
