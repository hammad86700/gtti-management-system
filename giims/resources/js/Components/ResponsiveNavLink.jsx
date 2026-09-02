import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
 active = false,
 className = '',
 children,
 ...props
}) {
 return (
 <Link
 {...props}
 className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
 active
 ? 'border-govt-green-500 bg-govt-green-50 text-govt-green font-semibold focus:border-govt-green-700 focus:bg-govt-green-100'
 : 'border-transparent text-gray-600 hover:border-govt-green-200 hover:bg-govt-green-50 hover:text-govt-green-500 focus:border-govt-green-200 focus:bg-govt-green-50 focus:text-govt-green-500'
 } text-base font-medium transition duration-200 ease-in-out focus:outline-none ${className}`}
 >
 {children}
 </Link>
 );
}
