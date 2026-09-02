export default function Badge({
    children,
    variant = 'neutral',
    size = 'sm',
    dot = false,
    className = '',
    ...props
}) {
    const variantStyles = {
        green: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
        gold: 'bg-amber-50 text-amber-900 border-amber-200/80',
        blue: 'bg-blue-50 text-blue-800 border-blue-200/80',
        purple: 'bg-purple-50 text-purple-800 border-purple-200/80',
        amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
        rose: 'bg-rose-50 text-rose-800 border-rose-200/80',
        neutral: 'bg-slate-100 text-slate-700 border-slate-200/80',
        dark: 'bg-govt-dark text-white border-govt-dark',
    };

    const dotColors = {
        green: 'bg-emerald-500',
        gold: 'bg-amber-500',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        amber: 'bg-amber-500',
        rose: 'bg-rose-500',
        neutral: 'bg-slate-400',
        dark: 'bg-emerald-400',
    };

    const sizeStyles = {
        xs: 'px-1.5 py-0.5 text-[10px]',
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
    };

    return (
        <span
            {...props}
            className={`inline-flex items-center gap-1.5 font-medium rounded-md border tracking-tight ${
                variantStyles[variant] || variantStyles.neutral
            } ${sizeStyles[size] || sizeStyles.sm} ${className}`}
        >
            {dot && (
                <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                        dotColors[variant] || 'bg-slate-400'
                    }`}
                />
            )}
            {children}
        </span>
    );
}
