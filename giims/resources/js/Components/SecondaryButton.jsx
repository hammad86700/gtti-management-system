export default function SecondaryButton({
 type = 'button',
 className = '',
 disabled,
 children,
 ...props
}) {
 return (
 <button
 {...props}
 type={type}
 className={
 `inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm transition-all duration-200 ease-in-out hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-govt-green-500 focus:ring-offset-2 disabled:opacity-25 ${
 disabled && 'opacity-25 cursor-not-allowed'
 } ` + className
 }
 disabled={disabled}
 >
 {children}
 </button>
 );
}
