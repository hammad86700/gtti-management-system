export default function Tabs({
    tabs = [],
    activeTab,
    onChange,
    className = '',
}) {
    return (
        <div
            className={`inline-flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 text-xs font-medium ${className}`}
        >
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all duration-200 ${
                            isActive
                                ? 'bg-white text-slate-900 font-bold shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                        }`}
                    >
                        {Icon && (
                            <Icon
                                className={`h-4 w-4 ${
                                    isActive ? 'text-govt-green' : 'text-slate-400'
                                }`}
                            />
                        )}
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                            <span
                                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                    isActive
                                        ? 'bg-govt-green-50 text-govt-green'
                                        : 'bg-slate-200 text-slate-600'
                                }`}
                            >
                                {tab.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
