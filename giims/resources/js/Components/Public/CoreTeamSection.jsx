import React, { useState } from 'react';
import {
    User,
    Award,
    Briefcase,
    Phone,
    Mail,
    X,
    ExternalLink,
    ChevronDown,
    Building2,
    CheckCircle2
} from 'lucide-react';

export default function CoreTeamSection({ members = [] }) {
    const [selectedMember, setSelectedMember] = useState(null);
    const [showAllModal, setShowAllModal] = useState(false);

    const isPortraitPhoto = (path) => {
        if (!path) return false;
        const lower = path.toLowerCase();
        if (lower.includes('campus_building') || lower.includes('workshop_event') || lower.includes('quaid-e-azam')) {
            return false;
        }
        return true;
    };

    const getPhotoUrl = (member) => {
        if (!member) return '';
        const rawPath = member.photo_path || member.photo_url || '';
        if (!isPortraitPhoto(rawPath)) return '';
        if (member.photo_path) {
            const clean = member.photo_path.replace(/^\/+/, '');
            if (clean.startsWith('images/')) {
                return `/${clean}`;
            }
            return `/storage/${clean}`;
        }
        if (member.photo_url) {
            return member.photo_url;
        }
        return '';
    };

    const defaultMembers = [
        {
            id: 'm1',
            name: 'Engr. Muhammad Tariq Khan',
            designation: 'Principal / Project Director',
            department: 'Institutional Executive Office',
            experience: '22+ Years Leadership & Industrial Training',
            phone: '068-9230101',
            email: 'principal@gtti.edu.pk',
            photo_path: null,
            bio: 'M.Sc. Mechanical Engineering (UET Lahore). Leading institutional excellence, CBT&A accreditation, and nationwide industrial linkages.',
        },
        {
            id: 'm2',
            name: 'Engr. Sohail Ahmad',
            designation: 'Vice Principal & Head of Electrical Wing',
            department: 'Electrical Department',
            experience: '18+ Years Power Systems & CBT&A',
            phone: '068-9230102',
            email: 'sohail.ahmad@gtti.edu.pk',
            photo_path: null,
            bio: 'B.Sc. Electrical Engineering, Lead Assessor NAVTTC. In charge of academic curriculum and instructional quality assurance.',
        },
        {
            id: 'm3',
            name: 'Mian Khalid Mehmood',
            designation: 'Chief Instructor Mechanical & Workshop Superintendent',
            department: 'Mechanical Engineering Wing',
            experience: '19+ Years Industrial Manufacturing',
            phone: '068-9230103',
            email: 'khalid.mehmood@gtti.edu.pk',
            photo_path: null,
            bio: 'B.Tech (Hons) Mechanical. Supervises precision machining laboratories, tool room inventory, and student trade projects.',
        },
        {
            id: 'm4',
            name: 'Dr. Farhan Ali',
            designation: 'Head of Computer & Information Technology Wing',
            department: 'IT & Software Department',
            experience: '14+ Years Enterprise Systems',
            phone: '068-9230104',
            email: 'farhan.ali@gtti.edu.pk',
            photo_path: null,
            bio: 'Ph.D. Computer Science. Leads digital examination labs, smart classrooms, and cloud infrastructure.',
        },
    ];

    const sourceMembers = Array.isArray(members) && members.length > 0 ? members : defaultMembers;
    const initialDisplay = sourceMembers.slice(0, 4);

    return (
        <section className="py-12 bg-slate-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                
                {/* ════════════════════════════════════════════════════════════════
                    HEADER SECTION (Matching Screenshot 1)
                ════════════════════════════════════════════════════════════════ */}
                <div className="text-center space-y-3">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#00401A] tracking-tight">
                        Core Team
                    </h2>

                    {/* Dark pill button "View more" (as shown in Screenshot 1) */}
                    <div className="flex items-center justify-center">
                        <button
                            type="button"
                            onClick={() => setShowAllModal(true)}
                            className="px-5 py-2 rounded bg-black hover:bg-gray-900 text-white text-xs font-bold transition shadow flex items-center space-x-2 cursor-pointer"
                        >
                            <span>View more</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════════════════
                    TEAM MEMBER CARDS GRID
                ════════════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                    {initialDisplay.map((member) => (
                        <div
                            key={member.id}
                            onClick={() => setSelectedMember(member)}
                            className="flex flex-col justify-between h-full bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition duration-300 hover:-translate-y-1 cursor-pointer group text-center"
                        >
                            {/* Top Part: Photo + Names + Designation */}
                            <div className="flex flex-col items-center space-y-3 w-full">
                                {/* Normalized Circular Photo Container */}
                                <div className="aspect-square rounded-full overflow-hidden w-24 h-24 mx-auto border-2 border-emerald-600/30 shadow-md relative bg-slate-100 flex items-center justify-center shrink-0 group-hover:border-emerald-600 group-hover:scale-105 transition-all duration-300">
                                    {getPhotoUrl(member) ? (
                                        <img
                                            src={getPhotoUrl(member)}
                                            alt={member.name}
                                            className="w-full h-full object-cover object-top"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-emerald-800/60 bg-emerald-50/60">
                                            <User className="w-10 h-10" />
                                        </div>
                                    )}
                                </div>

                                {/* Name & Normalized Designation */}
                                <div className="space-y-1 w-full">
                                    <h3 className="font-black text-sm text-gray-900 group-hover:text-[#00401A] transition line-clamp-1">
                                        {member.name}
                                    </h3>
                                    <div className="min-h-[44px] flex flex-col justify-center">
                                        <p className="text-xs font-bold text-emerald-800 line-clamp-2 leading-snug">
                                            {member.designation}
                                        </p>
                                    </div>
                                    {member.department && (
                                        <p className="text-[11px] text-gray-500 font-medium line-clamp-1">
                                            {member.department}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Bottom Part: Experience Pill Badge & Phone */}
                            <div className="w-full pt-3 border-t border-gray-100 flex flex-col items-center space-y-2 mt-3">
                                {member.experience && (
                                    <div className="w-full flex justify-center">
                                        <span className="max-w-full truncate text-xs px-2.5 py-1 text-center inline-flex items-center space-x-1 rounded-full font-bold bg-emerald-50 text-[#00401A] border border-emerald-200">
                                            <Award className="w-3 h-3 text-amber-600 shrink-0" />
                                            <span className="truncate">{member.experience}</span>
                                        </span>
                                    </div>
                                )}
                                {member.phone && (
                                    <div className="flex justify-center">
                                        <span className="px-2.5 py-0.5 rounded-full bg-slate-50 border border-gray-200 text-gray-600 text-[11px] font-mono inline-flex items-center space-x-1" title={member.phone}>
                                            <Phone className="w-3 h-3 text-govt-gold shrink-0" />
                                            <span>{member.phone}</span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* ════════════════════════════════════════════════════════════════
                MEMBER DOSSIER MODAL (Details, Bio, Qualifications)
            ════════════════════════════════════════════════════════════════ */}
            {selectedMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="relative w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-[#002B12] to-[#00401A] p-6 text-white text-center relative">
                            <button
                                type="button"
                                onClick={() => setSelectedMember(null)}
                                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="aspect-square rounded-full overflow-hidden w-24 h-24 mx-auto border-2 border-white/50 shadow-xl mb-3 flex items-center justify-center bg-white/10">
                                {getPhotoUrl(selectedMember) ? (
                                    <img
                                        src={getPhotoUrl(selectedMember)}
                                        alt={selectedMember.name}
                                        className="w-full h-full object-cover object-top"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-emerald-900/50 text-white">
                                        <User className="w-12 h-12 text-emerald-200" />
                                    </div>
                                )}
                            </div>

                            <h3 className="text-lg font-black">{selectedMember.name}</h3>
                            <p className="text-xs text-emerald-200 font-bold">{selectedMember.designation}</p>
                            {selectedMember.department && (
                                <p className="text-[11px] text-emerald-100/80">{selectedMember.department}</p>
                            )}
                        </div>

                        {/* Details Body */}
                        <div className="p-6 space-y-4 text-xs text-gray-700">
                            {selectedMember.experience && (
                                <div className="flex items-center space-x-2 p-3 rounded-lg bg-emerald-50 text-[#00401A] font-semibold border border-emerald-200">
                                    <Award className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>Experience: {selectedMember.experience}</span>
                                </div>
                            )}

                            {selectedMember.bio && (
                                <div className="space-y-1">
                                    <h4 className="font-black text-gray-900 uppercase tracking-wider text-[11px]">
                                        Professional Profile & Qualifications
                                    </h4>
                                    <p className="leading-relaxed text-gray-600">
                                        {selectedMember.bio}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2 pt-2 border-t border-gray-100">
                                {selectedMember.phone && (
                                    <div className="flex items-center space-x-2 text-gray-700">
                                        <Phone className="w-4 h-4 text-[#00401A]" />
                                        <span>Official Line: <strong className="font-mono">{selectedMember.phone}</strong></span>
                                    </div>
                                )}
                                {selectedMember.email && (
                                    <div className="flex items-center space-x-2 text-gray-700">
                                        <Mail className="w-4 h-4 text-[#00401A]" />
                                        <span>Institutional Email: <strong className="font-mono">{selectedMember.email}</strong></span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 border-t border-gray-200 text-right">
                            <button
                                type="button"
                                onClick={() => setSelectedMember(null)}
                                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs transition"
                            >
                                Close Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                VIEW ALL CORE TEAM MEMBERS MODAL
            ════════════════════════════════════════════════════════════════ */}
            {showAllModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-govt-cream shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-[#00401A]">GTTI Core Leadership & Faculty Directorate</h3>
                                <p className="text-xs text-gray-600">Principal, Wing Heads, Chief Instructors, and Academic Leadership</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAllModal(false)}
                                className="p-2 rounded-lg bg-gray-200 hover:bg-rose-100 hover:text-rose-700 text-gray-700 transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Grid */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {sourceMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        onClick={() => {
                                            setSelectedMember(member);
                                            setShowAllModal(false);
                                        }}
                                        className="rounded-xl border border-gray-200 p-5 bg-slate-50 hover:bg-white hover:shadow-lg transition cursor-pointer flex flex-col items-center text-center space-y-3 group"
                                    >
                                        <div className="aspect-square rounded-full overflow-hidden w-20 h-20 bg-slate-100 border-2 border-emerald-700/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            {getPhotoUrl(member) ? (
                                                <img
                                                    src={getPhotoUrl(member)}
                                                    alt={member.name}
                                                    className="w-full h-full object-cover object-top"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-emerald-800/60 bg-emerald-50/60">
                                                    <User className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-[#00401A]">
                                                {member.name}
                                            </h4>
                                            <p className="text-xs text-emerald-800 font-bold">{member.designation}</p>
                                            {member.department && (
                                                <p className="text-[11px] text-gray-500">{member.department}</p>
                                            )}
                                        </div>
                                        {member.experience && (
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-[#00401A] font-bold">
                                                {member.experience}
                                            </span>
                                        )}
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
