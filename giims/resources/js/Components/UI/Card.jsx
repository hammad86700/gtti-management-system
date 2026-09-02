export function Card({ className = '', children, accent = false, hover = false, ...props }) {
    return (
        <div
            {...props}
            className={`bg-white rounded-xl border border-slate-200/90 shadow-card transition-all duration-200 ${
                accent ? 'border-t-4 border-t-govt-green' : ''
            } ${hover ? 'hover:shadow-card-hover hover:border-govt-green/30' : ''} ${className}`}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className = '', children, ...props }) {
    return (
        <div {...props} className={`p-5 pb-3 border-b border-slate-100 flex items-center justify-between gap-3 ${className}`}>
            {children}
        </div>
    );
}

export function CardTitle({ className = '', children, ...props }) {
    return (
        <h3 {...props} className={`text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 ${className}`}>
            {children}
        </h3>
    );
}

export function CardDescription({ className = '', children, ...props }) {
    return (
        <p {...props} className={`text-xs text-slate-500 mt-0.5 ${className}`}>
            {children}
        </p>
    );
}

export function CardContent({ className = '', children, ...props }) {
    return (
        <div {...props} className={`p-5 ${className}`}>
            {children}
        </div>
    );
}

export function CardFooter({ className = '', children, ...props }) {
    return (
        <div {...props} className={`p-4 bg-slate-50/50 border-t border-slate-100 rounded-b-xl flex items-center justify-between text-xs text-slate-500 ${className}`}>
            {children}
        </div>
    );
}

export default Card;
