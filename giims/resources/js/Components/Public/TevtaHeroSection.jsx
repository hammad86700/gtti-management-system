import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Database,
    BookOpen,
    Download,
    Award,
    Sparkles,
    Building2,
    Calendar,
    ExternalLink,
    Volume2,
    CheckCircle2
} from 'lucide-react';

export default function TevtaHeroSection({ photos = [], canRegister = true, user = null, settings = {} }) {
    const pageProps = usePage().props;
    const siteSettings = settings && Object.keys(settings).length > 0
        ? settings
        : (pageProps.settings || pageProps.site_settings || {});

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const getPhotoUrl = (photo) => {
        if (!photo) return '';
        if (photo.image_path) {
            const cleanPath = photo.image_path.replace(/^\/+/, '');
            if (cleanPath.startsWith('images/')) {
                return `/${cleanPath}`;
            }
            return `/storage/${cleanPath}`;
        }
        if (photo.image_url) {
            return photo.image_url;
        }
        return '';
    };

    // Filter active photos or fallback
    const activePhotos = Array.isArray(photos) && photos.length > 0
        ? photos.filter((p) => p && (p.is_active === true || p.is_active === 1 || p.is_active === '1'))
        : [
            {
                title: 'Govt. Technical Training Institute Main Campus',
                subtitle: 'Accredited vocational infrastructure providing CBT&A competency and industrial technical training.',
                image_path: '/images/campus_building.jpg',
            },
            {
                title: 'Executive Training Seminar on Technopreneurship',
                subtitle: 'Government Center of Excellence for Training & Development with TEVTA dignitaries.',
                image_path: '/images/workshop_event.jpg',
            },
        ];

    const count = activePhotos.length;

    // Auto-advance photo animation every 4.5 seconds
    useEffect(() => {
        if (count <= 1 || isHovered) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % count);
        }, 4500);

        return () => clearInterval(timer);
    }, [count, isHovered]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + count) % count);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % count);
    };

    const currentPhoto = activePhotos[currentIndex] || activePhotos[0];

    const updates = [
        'Diploma of Associate Engineering (DAE) is Equivalent to FSC (Pre-Engineering).',
        'TEVTA Launched Market Oriented Short Courses 2026 for Youth Empowerment in Southern Punjab.',
        'Online Admission Portal Open for Morning & Evening Vocational Shifts — Free Government Toolkits & Subsidized Stipends.',
        'National Vocational & Technical Training Commission (NAVTTC) Accredited CBT&A Assessment Center.',
    ];

    return (
        <section className="bg-slate-50 border-b border-gray-200">
            {/* Main Hero Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
                    
                    {/* ════════════════════════════════════════════════════════════════
                        LEFT COLUMN: DYNAMIC AUTO-ANIMATED CAMPUS SLIDER (w-full lg:w-7/12)
                    ════════════════════════════════════════════════════════════════ */}
                    <div
                        className="w-full lg:col-span-7 xl:col-span-7 rounded-2xl overflow-hidden shadow-md border-2 border-emerald-900/20 bg-slate-950 relative flex flex-col justify-end h-[420px] lg:h-[460px] group select-none"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
                        onTouchMove={(e) => { touchEndX.current = e.touches[0].clientX; }}
                        onTouchEnd={() => {
                            if (touchStartX.current - touchEndX.current > 50) handleNext();
                            if (touchStartX.current - touchEndX.current < -50) handlePrev();
                        }}
                    >
                        {/* Slide Images with Smooth Crossfade & Micro-Zoom Animation */}
                        <div className="absolute inset-0">
                            {activePhotos.map((photo, index) => {
                                const isCurrent = index === currentIndex;
                                return (
                                    <div
                                        key={photo.id || index}
                                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                            isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                                        }`}
                                    >
                                        <img
                                            src={getPhotoUrl(photo)}
                                            alt={photo.title || 'GTTI Campus Showcase'}
                                            className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                                                isCurrent ? 'scale-105' : 'scale-100'
                                            }`}
                                            onError={(e) => {
                                                e.target.src = '/images/campus_building.jpg';
                                            }}
                                        />
                                        {/* Rich Institutional Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Top Watermark / Badge */}
                        <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
                            <span className="px-3 py-1 rounded-full bg-[#00401A]/90 text-white text-[11px] font-black uppercase tracking-wider backdrop-blur-md border border-emerald-500/40 shadow-md flex items-center space-x-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span>Campus Showcase</span>
                            </span>
                        </div>

                        {/* Navigation Arrows */}
                        {count > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={handlePrev}
                                    aria-label="Previous Slide"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 transition opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-105"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    aria-label="Next Slide"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 transition opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-105"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </>
                        )}

                        {/* Bottom Slide Info & Indicators */}
                        <div className="relative z-20 p-4 sm:p-6 text-white space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                                <div className="max-w-xl space-y-1">
                                    <h2 className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-md leading-snug">
                                        {currentPhoto.title || 'Technical & Vocational Training Excellence'}
                                    </h2>
                                    {currentPhoto.subtitle && (
                                        <p className="text-xs sm:text-sm text-slate-200 drop-shadow line-clamp-2 leading-relaxed">
                                            {currentPhoto.subtitle}
                                        </p>
                                    )}
                                </div>

                                {/* Slide Dots Indicator */}
                                {count > 1 && (
                                    <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-end">
                                        {activePhotos.map((_, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setCurrentIndex(idx)}
                                                aria-label={`Go to slide ${idx + 1}`}
                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                    idx === currentIndex
                                                        ? 'w-7 bg-emerald-400 shadow-md'
                                                        : 'w-2 bg-white/50 hover:bg-white/80'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ════════════════════════════════════════════════════════════════
                        RIGHT COLUMN: 4 QUICK PORTAL TILES (2x2 BALANCED GRID)
                    ════════════════════════════════════════════════════════════════ */}
                    <div className="w-full lg:col-span-5 xl:col-span-5 h-[420px] lg:h-[460px] flex flex-col">
                        
                        {/* 4 Action Cards in a Balanced 2x2 Grid */}
                        <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
                            
                            {/* 1. TEVTA Portal */}
                            <Link
                                href={user ? route('dashboard') : (siteSettings.card_1_url || (route().has('login') ? route('login') : '#'))}
                                className="group p-4 rounded-xl bg-white hover:bg-emerald-50/50 border border-gray-200 hover:border-emerald-600 shadow-xs hover:shadow-md transition duration-200 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer h-full"
                            >
                                <div className="p-2.5 rounded-xl bg-emerald-50 text-[#00401A] group-hover:bg-[#00401A] group-hover:text-white transition duration-200">
                                    <Database className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-xs sm:text-sm text-gray-800 group-hover:text-[#00401A] transition">
                                        {siteSettings.card_1_title || 'Tevta Portal'}
                                    </h3>
                                    <span className="text-[10px] text-gray-500 font-medium">
                                        {siteSettings.card_1_subtitle || 'Enterprise Access'}
                                    </span>
                                </div>
                            </Link>

                            {/* 2. Online Admission Form */}
                            <Link
                                href={canRegister ? (siteSettings.card_2_url || route('register')) : '#courses'}
                                className="group p-4 rounded-xl bg-white hover:bg-emerald-50/50 border border-gray-200 hover:border-emerald-600 shadow-xs hover:shadow-md transition duration-200 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer h-full"
                            >
                                <div className="p-2.5 rounded-xl bg-emerald-50 text-[#00401A] group-hover:bg-[#00401A] group-hover:text-white transition duration-200">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-xs sm:text-sm text-gray-800 group-hover:text-[#00401A] transition">
                                        {siteSettings.card_2_title || 'Online Admission Form'}
                                    </h3>
                                    <span className="text-[10px] text-emerald-700 font-bold">
                                        {siteSettings.card_2_subtitle || 'Session 2026 Open'}
                                    </span>
                                </div>
                            </Link>

                            {/* 3. Download Prospectus */}
                            <a
                                href={siteSettings.card_3_url || '/download-prospectus'}
                                className="group p-4 rounded-xl bg-white hover:bg-emerald-50/50 border border-gray-200 hover:border-emerald-600 shadow-xs hover:shadow-md transition duration-200 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer h-full"
                            >
                                <div className="p-2.5 rounded-xl bg-emerald-50 text-[#00401A] group-hover:bg-[#00401A] group-hover:text-white transition duration-200">
                                    <Download className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-xs sm:text-sm text-gray-800 group-hover:text-[#00401A] transition">
                                        {siteSettings.card_3_title || 'Download Prospectus'}
                                    </h3>
                                    <span className="text-[10px] text-gray-500 font-medium">
                                        {siteSettings.card_3_subtitle || 'Session 2026 Guide & Eligibility'}
                                    </span>
                                </div>
                            </a>

                            {/* 4. Merit Lists & Gazette */}
                            <a
                                href={siteSettings.card_4_url || '/merit-lists'}
                                className="group p-4 rounded-xl bg-white hover:bg-emerald-50/50 border border-gray-200 hover:border-emerald-600 shadow-xs hover:shadow-md transition duration-200 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer h-full"
                            >
                                <div className="p-2.5 rounded-xl bg-emerald-50 text-[#00401A] group-hover:bg-[#00401A] group-hover:text-white transition duration-200">
                                    <Award className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-xs sm:text-sm text-gray-800 group-hover:text-[#00401A] transition">
                                        {siteSettings.card_4_title || 'Merit Lists & Gazette'}
                                    </h3>
                                    <span className="text-[10px] text-gray-500 font-medium">
                                        {siteSettings.card_4_subtitle || 'Session 2026 Selections'}
                                    </span>
                                </div>
                            </a>
                        </div>

                    </div>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                FULL-WIDTH NEWS TICKER ("Latest Updates")
            ════════════════════════════════════════════════════════════════ */}
            <div className="bg-[#002B11] border-t border-b border-[#001F0C] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center overflow-hidden">
                    {/* Dark Green Badge */}
                    <div className="bg-[#00401A] px-3 sm:px-4 py-2 text-xs font-black uppercase tracking-wider text-emerald-100 flex items-center space-x-1.5 shrink-0 border-r border-emerald-700/40">
                        <span className="h-2 w-2 rounded-full bg-govt-gold animate-ping" />
                        <span>Latest Updates</span>
                    </div>

                    {/* Marquee Scrolling Ticker */}
                    <div className="relative flex-1 overflow-hidden py-2 pl-4">
                        <div className="flex items-center space-x-8 text-xs font-medium text-emerald-100 animate-marquee whitespace-nowrap">
                            {updates.map((item, idx) => (
                                <span key={idx} className="inline-flex items-center space-x-2">
                                    <span className="text-govt-gold font-bold">★</span>
                                    <span>{item}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
