import React, { useState, useEffect, useRef } from 'react';
import {
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Tag,
    X,
    Maximize2,
    Sparkles,
    Image as ImageIcon
} from 'lucide-react';

export default function AnimatedImageGallery({ images = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [showAllModal, setShowAllModal] = useState(false);

    const getImageUrl = (item) => {
        if (!item) return '';
        if (item.image_path) {
            const clean = item.image_path.replace(/^\/+/, '');
            if (clean.startsWith('images/')) {
                return `/${clean}`;
            }
            return `/storage/${clean}`;
        }
        if (item.image_url) {
            return item.image_url;
        }
        return '';
    };

    // Fallback sample data if empty
    const defaultImages = [
        {
            id: 'd1',
            title: 'Independence Day Flag Hoisting Ceremony',
            category: 'Ceremonies',
            description: 'Trainees, faculty, and administrative staff gathering at the historic academic building for Independence Day celebrations.',
            event_date: '2026-08-14',
            image_path: '/images/campus_building.jpg',
        },
        {
            id: 'd2',
            title: 'Annual Technical Exhibition & Gathering',
            category: 'Campus Life',
            description: 'Commemoration ceremony under the official shamiana with faculty leadership and vocational trainees.',
            event_date: '2026-08-20',
            image_path: '/images/workshop_event.jpg',
        },
        {
            id: 'd3',
            title: '15 Days Training Program on Technopreneurship',
            category: 'Workshops & Training',
            description: 'Specialized executive training workshop organized by TEVTA Punjab at the Government Center of Excellence.',
            event_date: '2026-07-15',
            image_path: '/images/workshop_event.jpg',
        },
        {
            id: 'd4',
            title: 'Modern CNC Machinery Industrial Demonstration',
            category: 'Workshops & Training',
            description: 'Hands-on practical trade instruction providing market-driven vocational skills aligned with international standards.',
            event_date: '2026-09-01',
            image_path: '/images/campus_building.jpg',
        },
    ];

    const sourceImages = Array.isArray(images) && images.length > 0 ? images : defaultImages;
    
    // Filtered by category
    const filteredImages = sourceImages.filter((img) => {
        if (activeCategory === 'all') return true;
        return (img.category || 'General') === activeCategory;
    });

    const categories = ['all', ...Array.from(new Set(sourceImages.map((img) => img.category || 'General')))];

    // Number of visible cards at a time: 3
    const visibleCount = 3;
    const totalItems = filteredImages.length;

    // Auto-advance animation every 4 seconds
    useEffect(() => {
        if (totalItems <= visibleCount || isHovered) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % totalItems);
        }, 4000);

        return () => clearInterval(timer);
    }, [totalItems, isHovered, visibleCount]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % totalItems);
    };

    // Calculate the slice of cards to display in the animated strip
    const getDisplayedCards = () => {
        if (totalItems === 0) return [];
        if (totalItems <= visibleCount) return filteredImages;

        const cards = [];
        for (let i = 0; i < visibleCount; i++) {
            const index = (currentIndex + i) % totalItems;
            cards.push(filteredImages[index]);
        }
        return cards;
    };

    const displayedCards = getDisplayedCards();

    return (
        <section className="py-12 bg-white border-b border-gray-200 select-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                
                {/* ════════════════════════════════════════════════════════════════
                    HEADER SECTION (Matching Screenshot 1)
                ════════════════════════════════════════════════════════════════ */}
                <div className="text-center space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#00401A] tracking-tight">
                        Image Gallery
                    </h2>
                    
                    {/* Dark Green "View More" button with external link icon */}
                    <div className="flex items-center justify-center">
                        <button
                            type="button"
                            onClick={() => setShowAllModal(true)}
                            className="px-5 py-2 rounded bg-[#00401A] hover:bg-[#003013] text-white text-xs font-bold transition shadow flex items-center space-x-2 cursor-pointer"
                        >
                            <span>View More</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Category Filter Badges */}
                    {categories.length > 2 && (
                        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => {
                                        setActiveCategory(cat);
                                        setCurrentIndex(0);
                                    }}
                                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition capitalize ${
                                        activeCategory === cat
                                            ? 'bg-[#00401A] text-white shadow-xs'
                                            : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
                                    }`}
                                >
                                    {cat === 'all' ? 'All Activities' : cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ════════════════════════════════════════════════════════════════
                    CAROUSEL CONTAINER (Auto-advancing 3-card animation)
                ════════════════════════════════════════════════════════════════ */}
                <div
                    className="relative group"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Card Grid with smooth CSS transition */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedCards.map((item, idx) => (
                            <div
                                key={`${item.id || idx}-${currentIndex}`}
                                onClick={() => setSelectedImage(item)}
                                className="rounded-xl overflow-hidden bg-white border border-gray-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1 group/card"
                            >
                                {/* Photo Container */}
                                <div className="relative h-60 w-full overflow-hidden bg-slate-900">
                                    <img
                                        src={getImageUrl(item)}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500 ease-out"
                                        onError={(e) => {
                                            e.target.src = '/images/campus_building.jpg';
                                        }}
                                    />
                                    
                                    {/* Hover overlay with zoom icon */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                        <span className="p-3 rounded-full bg-white/90 text-slate-900 shadow-lg transform scale-90 group-hover/card:scale-100 transition-transform">
                                            <Maximize2 className="w-5 h-5 text-[#00401A]" />
                                        </span>
                                    </div>

                                    {/* Category tag on top left */}
                                    {item.category && (
                                        <div className="absolute top-3 left-3 z-10">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/20">
                                                {item.category}
                                            </span>
                                        </div>
                                    )}

                                    {/* Event date on top right */}
                                    {item.event_date && (
                                        <div className="absolute top-3 right-3 z-10">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-md shadow-xs flex items-center space-x-1">
                                                <Calendar className="w-3 h-3 text-emerald-700" />
                                                <span>{new Date(item.event_date).toLocaleDateString('en-GB')}</span>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Caption & Title */}
                                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                                    <h3 className="font-extrabold text-sm text-gray-900 group-hover/card:text-[#00401A] transition line-clamp-2 leading-snug">
                                        {item.title}
                                    </h3>
                                    {item.description && (
                                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Left and Right Carousel Controls */}
                    {totalItems > visibleCount && (
                        <>
                            <button
                                type="button"
                                onClick={handlePrev}
                                aria-label="Previous Photos"
                                className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white text-slate-800 shadow-lg border border-gray-200 hover:bg-slate-50 transition hover:scale-110"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                aria-label="Next Photos"
                                className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white text-slate-800 shadow-lg border border-gray-200 hover:bg-slate-50 transition hover:scale-110"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>

                {/* Counter & Indicator Strip */}
                {totalItems > visibleCount && (
                    <div className="flex items-center justify-center space-x-1 pt-2">
                        {Array.from({ length: totalItems }).map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentIndex(idx)}
                                aria-label={`Slide ${idx + 1}`}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    idx === currentIndex
                                        ? 'w-6 bg-[#00401A]'
                                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ════════════════════════════════════════════════════════════════
                LIGHTBOX MODAL FOR SINGLE IMAGE PREVIEW
            ════════════════════════════════════════════════════════════════ */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800/60">
                                    <ImageIcon className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-white">{selectedImage.title}</h3>
                                    <p className="text-xs text-slate-400">
                                        {selectedImage.category || 'GTTI Media Showcase'} {selectedImage.event_date && `• ${new Date(selectedImage.event_date).toLocaleDateString('en-GB')}`}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedImage(null)}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/80 hover:text-rose-400 text-slate-400 transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Image */}
                        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/95">
                            <img
                                src={getImageUrl(selectedImage)}
                                alt={selectedImage.title}
                                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-2xl border border-slate-800"
                            />
                        </div>

                        {/* Modal Footer Description */}
                        {selectedImage.description && (
                            <div className="p-4 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-300">
                                <p>{selectedImage.description}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                FULL GALLERY MODAL (When clicking "View More")
            ════════════════════════════════════════════════════════════════ */}
            {showAllModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-govt-cream shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-[#00401A]">Institute Complete Image Gallery</h3>
                                <p className="text-xs text-gray-600">Archived official events, technical ceremonies, and campus life</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAllModal(false)}
                                className="p-2 rounded-lg bg-gray-200 hover:bg-rose-100 hover:text-rose-700 text-gray-700 transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Image Grid */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                {sourceImages.map((img) => (
                                    <div
                                        key={img.id}
                                        onClick={() => {
                                            setSelectedImage(img);
                                            setShowAllModal(false);
                                        }}
                                        className="rounded-xl overflow-hidden border border-gray-200 bg-slate-50 hover:shadow-lg transition cursor-pointer group/item"
                                    >
                                        <div className="h-48 w-full overflow-hidden bg-slate-900 relative">
                                            <img
                                                src={getImageUrl(img)}
                                                alt={img.title}
                                                className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                                            />
                                            {img.category && (
                                                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                                                    {img.category}
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h4 className="text-xs font-bold text-gray-900 group-hover/item:text-[#00401A] line-clamp-1">
                                                {img.title}
                                            </h4>
                                            {img.event_date && (
                                                <p className="text-[10px] text-gray-500 mt-0.5">
                                                    {new Date(img.event_date).toLocaleDateString('en-GB')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
