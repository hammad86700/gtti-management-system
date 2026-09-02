export default function DangerButton({
 className = '',
 disabled,
 children,
 ...props
}) {
 return (
 <button
 {...props}
 className={
 `inline-flex items-center justify-center rounded-lg border border-transparent bg-rose-700 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-white shadow-sm transition-all duration-200 ease-in-out hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 active:bg-rose-800 ${
 disabled && 'opacity-25 cursor-not-allowed'
 } ` + className
 }
 disabled={disabled}
 >
 {children}
 </button>
 );
}
