import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
 return (
 <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-govt-cream to-govt-green-50 pt-6 sm:justify-center sm:pt-0">
 {/* Gold accent bar at top */}
 <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-govt-gold-400 via-govt-gold to-govt-gold-400 z-50" />

            <div className="mb-3">
                <Link href="/" className="inline-flex items-center justify-center p-2 rounded-2xl bg-white shadow-md border border-emerald-100/80 hover:shadow-lg hover:scale-105 transition duration-200">
                    <ApplicationLogo className="h-24 w-24 object-contain" />
                </Link>
            </div>

 <p className="text-sm font-semibold text-govt-green mb-1 tracking-wide">GIIMS Portal</p>
 <p className="text-xs text-gray-500 mb-6">Govt. Technical Training Institute, Rahim Yar Khan</p>

 <div className="w-full overflow-hidden bg-white px-6 py-6 shadow-govt-md sm:max-w-md sm:rounded-xl border border-gray-200 border-t-4 border-t-govt-green">
 {children}
 </div>

 <p className="mt-6 text-xs text-gray-400">Powered by TEVTA Punjab</p>
 </div>
 );
}
