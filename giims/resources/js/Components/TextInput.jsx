import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
 { type = 'text', className = '', isFocused = false, ...props },
 ref,
) {
 const localRef = useRef(null);

 useImperativeHandle(ref, () => ({
 focus: () => localRef.current?.focus(),
 }));

 useEffect(() => {
 if (isFocused) {
 localRef.current?.focus();
 }
 }, [isFocused]);

 return (
 <input
 {...props}
 type={type}
 className={
 'rounded-lg border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 shadow-sm transition-colors duration-200 focus:border-govt-green-500 dark:focus:border-emerald-500 focus:ring-govt-green-500 dark:focus:ring-emerald-500 placeholder:text-gray-400 dark:placeholder:text-slate-500 ' +
 className
 }
 ref={localRef}
 />
 );
});
