export default function PrimaryButton({
 className = '',
 disabled,
 children,
 ...props
}) {
 return (
 <button
 {...props}
 className={
 `inline-flex items-center justify-center rounded-xl border border-transparent bg-govt-green px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-200 ease-in-out hover:bg-govt-green-600 hover:shadow-govt active:bg-govt-green-800 focus:outline-none focus:ring-2 focus:ring-govt-green-500 focus:ring-offset-2 ${
 disabled && 'opacity-25 cursor-not-allowed'
 } ` + className
 }
 disabled={disabled}
 >
 {children}
 </button>
 );
}
