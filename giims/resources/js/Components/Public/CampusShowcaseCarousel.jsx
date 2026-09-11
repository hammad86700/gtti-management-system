import React, { useState, useEffect, useRef } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Award,
    Building2,
    ArrowRight,
    Camera,
    ShieldCheck
} from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function CampusShowcaseCarousel({ photos = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const getPhotoUrl = (photo) => {
        if (!photo) return '';
        if (photo.image_path) {
            return `/storage/${photo.image_path.replace(/^\/+/, '')}`;
        }
        if (photo.image_url) {
            if (typeof photo.image_url === 'string' && photo.image_url.includes('/storage/')) {
                return `/storage/${photo.image_url.split('/storage/')[1]}`;
            }
            return photo.image_url;
        }
        return '';
    };

    const activePhotos = Array.isArray(photos)
        ? photos.filter((p) => p && (p.is_active === true || p.is_active === 1 || p.is_active === '1'))
        : [];
    const count = activePhotos.length;

    // Auto-play timer (5 seconds)
    useEffect(() => {
        if (count <= 1 || isHovered) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % count);
        }, 5000);

        return () => clearInterval(timer);
    }, [count, isHovered]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + count) % count);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % count);
    };

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const diff = touchStartX.current - touchEndX.current;
        if (diff > 50) {
            handleNext();
        } else if (diff < -50) {
            handlePrev();
        }
        touchStartX.current = 0;
        touchEndX.current = 0;
    };

    // =========================================================================
    // FALLBACK BANNER (If zero photos or all inactive)
    // =========================================================================
    if (count === 0) {
        return (
            <div className="relative overflow-hidden bg-gradient-to-r from-[#002B12] via-[#00401A] to-[#001F0C] text-white border-b-2 border-emerald-800/60 shadow-md">
                {/* Subtle Geometric Background Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
                    <div className="max-w-3xl space-y-3 sm:space-y-4">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 border border-white/15 text-xs font-bold tracking-wide">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Campus Media Showcase • Technical Excellence</span>
                        </div>

                        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                            Advanced Industrial Workshops, Computer Labs & High-Tech Training Facilities
                        </h2>

                        <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
                            Govt. Technical Training Institute, Rahim Yar Khan boasts fully equipped industrial-standard workshops, state-of-the-art electronics laboratories, and certified CBT&A competency centers accredited by PBTE & NAVTTC.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <a
                                href="#courses"
                                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-md hover:shadow-lg flex items-center space-x-2"
                            >
                                <span>Explore Technical Trades</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                            <Link
                                href={route('register')}
                                className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold transition flex items-center space-x-2"
                            >
                                <span>Online Admission 2026</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================================
    // ANIMATED CAMPUS SHOWCASE SLIDER
    // =========================================================================
    const currentPhoto = activePhotos[currentIndex];

    return (
        <div
            className="relative w-full overflow-hidden bg-slate-950 border-b-2 border-emerald-800/80 shadow-lg group select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Carousel Slides Container */}
            <div className="relative w-full h-[260px] sm:h-[380px] md:h-[460px] lg:h-[520px]">
                {activePhotos.map((photo, index) => {
                    const isCurrent = index === currentIndex;
                    return (
                        <div
                            key={photo.id || index}
                            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                                isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                            }`}
                        >
                            <img
                                src={getPhotoUrl(photo)}
                                alt={photo.title || `Campus Showcase ${index + 1}`}
                                className="w-full h-full object-cover transform scale-100 transition-transform duration-7000 ease-linear motion-safe:scale-105"
                                onError={(e) => {
                                    if (photo.image_path && !e.target.src.endsWith(photo.image_path)) {
                                        e.target.src = `/storage/${photo.image_path.replace(/^\/+/, '')}`;
                                    }
                                }}
                            />

                            {/* Deep Atmospheric Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 pointer-events-none" />
                        </div>
                    );
                })}

                {/* Caption / Overlay Banner */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6 md:p-8">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="max-w-3xl space-y-1.5 sm:space-y-2 text-white">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-600/90 text-white backdrop-blur-sm shadow-xs">
                                    <Camera className="w-3 h-3" />
                                    GTTI Campus Showcase
                                </span>
                                <span className="text-[11px] font-semibold text-emerald-200/80 hidden sm:inline">
                                    • TEVTA Technical Training Infrastructure
                                </span>
                            </div>

                            {currentPhoto.title && (
                                <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-md leading-tight">
                                    {currentPhoto.title}
                                </h2>
                            )}

                            {currentPhoto.subtitle && (
                                <p className="text-xs sm:text-sm text-slate-200 drop-shadow max-w-2xl leading-relaxed line-clamp-2 sm:line-clamp-3">
                                    {currentPhoto.subtitle}
                                </p>
                            )}
                        </div>

                        {/* Slide Counter Indicator */}
                        <div className="flex items-center gap-2 self-start md:self-end shrink-0">
                            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-900/80 text-white backdrop-blur-md border border-white/20 shadow-md">
                                {currentIndex + 1} / {count}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Left Navigation Arrow */}
                {count > 1 && (
                    <button
                        type="button"
                        onClick={handlePrev}
                        aria-label="Previous Slide"
                        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg focus:opacity-100"
                    >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                )}

                {/* Right Navigation Arrow */}
                {count > 1 && (
                    <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Next Slide"
                        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg focus:opacity-100"
                    >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                )}

                {/* Bottom Pagination Dots */}
                {count > 1 && (
                    <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                        {activePhotos.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentIndex(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    idx === currentIndex
                                        ? 'w-8 bg-emerald-400 shadow-sm'
                                        : 'w-2.5 bg-white/50 hover:bg-white/80'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
