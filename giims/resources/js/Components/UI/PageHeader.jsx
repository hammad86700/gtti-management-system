import { ChevronRight, Calendar } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function PageHeader({
    breadcrumbs = [],
    title,
    subtitle,
    date,
    sessionText = 'Session 2026-2027',
    actions,
    className = '',
}) {
    // Current date formatted cleanly if not provided
    const displayDate =
        date ||
        new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(new Date());

    return (
        <div className={`space-y-3 pb-2 ${className}`}>
            {/* Breadcrumb line & Institutional Indicators */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                {breadcrumbs.length > 0 ? (
                    <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 font-medium">
                        {breadcrumbs.map((crumb, idx) => {
                            const isLast = idx === breadcrumbs.length - 1;
                            return (
                                <div key={idx} className="flex items-center space-x-1.5">
                                    {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />}
                                    {crumb.href && !isLast ? (
                                        <Link
                                            href={crumb.href}
                                            className="hover:text-govt-green dark:hover:text-emerald-400 transition-colors"
                                        >
                                            {crumb.label}
                                        </Link>
                                    ) : (
                                        <span className={isLast ? 'text-slate-900 dark:text-white font-semibold' : ''}>
                                            {crumb.label}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                ) : (
                    <div className="flex items-center space-x-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            TEVTA Punjab • GTTI Rahim Yar Khan
                        </span>
                    </div>
                )}

                <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
                    <div className="hidden sm:flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{displayDate}</span>
                    </div>
                    {sessionText && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                            {sessionText}
                        </span>
                    )}
                </div>
            </div>

            {/* Title & Action Buttons Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>

                {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
            </div>
        </div>
    );
}
