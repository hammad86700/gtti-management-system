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
 'rounded-lg border-gray-300 bg-white shadow-sm transition-colors duration-200 focus:border-govt-green-500 focus:ring-govt-green-500 placeholder:text-gray-400 ' +
 className
 }
 ref={localRef}
 />
 );
});
