import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/Context/ThemeContext';

export default function ThemeToggle({ className = '', variant = 'header' }) {
    const { isDark, toggleTheme } = useTheme();

    if (variant === 'pill') {
        return (
            <button
                type="button"
                onClick={toggleTheme}
                className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border cursor-pointer ${
                    isDark
                        ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 shadow-xs'
                } ${className}`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                {isDark ? (
                    <>
                        <Sun className="h-3.5 w-3.5 text-amber-400 animate-spin-slow" />
                        <span>Light Mode</span>
                    </>
                ) : (
                    <>
                        <Moon className="h-3.5 w-3.5 text-slate-600" />
                        <span>Dark Mode</span>
                    </>
                )}
            </button>
        );
    }

    // Default 'header' icon button variant
    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`relative p-2 rounded-xl transition-all duration-200 border cursor-pointer group focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                isDark
                    ? 'bg-slate-800/90 text-amber-300 border-slate-700/80 hover:bg-slate-700 hover:border-slate-600 hover:text-amber-200 shadow-xs'
                    : 'bg-white/90 text-slate-600 border-slate-200/90 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900 shadow-xs'
            } ${className}`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            <div className="relative h-4 w-4 flex items-center justify-center">
                {isDark ? (
                    <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
                ) : (
                    <Moon className="h-4 w-4 text-slate-700 transition-transform duration-300 group-hover:-rotate-12" />
                )}
            </div>
        </button>
    );
}
