import { Link } from '@inertiajs/react';

export default function NavLink({
 active = false,
 className = '',
 children,
 ...props
}) {
 return (
 <Link
 {...props}
 className={
 'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-200 ease-in-out focus:outline-none ' +
 (active
 ? 'border-govt-green-500 text-govt-green font-semibold'
 : 'border-transparent text-gray-500 hover:border-govt-green-200 hover:text-govt-green-500') +
 ' ' + className
 }
 >
 {children}
 </Link>
 );
}
