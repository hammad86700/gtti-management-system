import { Inbox } from 'lucide-react';

export default function EmptyState({
    icon: Icon = Inbox,
    title = 'No records found',
    description = 'There are currently no items to display in this section.',
    action,
    className = '',
}) {
    return (
        <div
            className={`text-center py-10 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center space-y-3 ${className}`}
        >
            <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                <Icon className="h-6 w-6 stroke-[1.5]" />
            </div>

            <div className="max-w-sm space-y-1">
                <h4 className="text-sm font-bold text-slate-800 tracking-tight">
                    {title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                    {description}
                </p>
            </div>

            {action && <div className="pt-2">{action}</div>}
        </div>
    );
}
