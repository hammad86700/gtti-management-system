export default function ApplicationLogo({
    className = 'h-16 w-16',
    withBadge = false,
    badgeClassName = 'p-1.5 bg-white rounded-2xl shadow-sm border border-slate-200/80 inline-flex items-center justify-center',
    src = '/images/tevta-logo.png',
    alt = 'TEVTA Government of the Punjab',
    ...props
}) {
    if (withBadge) {
        return (
            <div className={badgeClassName}>
                <img
                    src={src}
                    alt={alt}
                    className={`object-contain ${className}`}
                    {...props}
                />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={`object-contain ${className}`}
            {...props}
        />
    );
}
