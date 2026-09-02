import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function KpiCard({
    title,
    value,
    badge,
    change,
    description,
    icon: Icon,
    colorVariant = 'green',
    trend,
    className = '',
    onClick,
}) {
    // Theme color mappings for icon container and badges
    const variants = {
        green: {
            iconBg: 'bg-govt-green-50 text-govt-green border-govt-green-100',
            badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        },
        gold: {
            iconBg: 'bg-govt-gold-50 text-govt-gold-600 border-govt-gold-100',
            badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        },
        blue: {
            iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
            badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
        },
        purple: {
            iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
            badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
        },
        amber: {
            iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
            badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        },
        rose: {
            iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
            badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
        },
    };

    const currentVariant = variants[colorVariant] || variants.green;
    const badgeText = badge || change;

    return (
        <div
            onClick={onClick}
            className={`relative bg-white rounded-xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover hover:border-govt-green/30 transition-all duration-200 group ${
                onClick ? 'cursor-pointer' : ''
            } ${className}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {title}
                    </p>
                    <h4 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
                        {value}
                    </h4>
                </div>

                {Icon && (
                    <div
                        className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 ${currentVariant.iconBg}`}
                    >
                        <Icon className="h-5 w-5 stroke-[2]" />
                    </div>
                )}
            </div>

            {(badgeText || description) && (
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    {badgeText && (
                        <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] border ${currentVariant.badgeBg}`}
                        >
                            {trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
                            {trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
                            <span>{badgeText}</span>
                        </span>
                    )}

                    {description && (
                        <p className="text-[11px] text-slate-500 truncate max-w-[200px]" title={description}>
                            {description}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
