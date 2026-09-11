import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
 Shield,
 GraduationCap,
 Building2,
 BookOpen,
 Clock,
 Award,
 CheckCircle2,
 Calendar,
 ArrowRight,
 Search,
 MapPin,
 Phone,
 Mail,
 Wrench,
 Cpu,
 Laptop,
 Compass,
 Utensils,
 Sparkles,
 Check,
 FileText,
 ExternalLink,
 AlertCircle,
 Flag,
 ShieldCheck,
 Eye,
 Download,
 Image as ImageIcon,
 X,
 LayoutGrid,
 List
} from 'lucide-react';
import TevtaHeroSection from '@/Components/Public/TevtaHeroSection';
import AnimatedImageGallery from '@/Components/Public/AnimatedImageGallery';
import CoreTeamSection from '@/Components/Public/CoreTeamSection';

export default function Home({
	activeCampaign,
	departments = [],
	publishedCourses = [],
	showcasePhotos = [],
	galleryImages = [],
	coreTeamMembers = [],
	settings = {},
	publishedMeritLists = [],
	canLogin,
	canRegister,
}) {
	const { auth, site_settings: sharedSiteSettings = {} } = usePage().props;
	const user = auth?.user;
	const activeSettings = { ...sharedSiteSettings, ...(settings || {}) };
	const [selectedDept, setSelectedDept] = useState('all');
	const [selectedCategory, setSelectedCategory] = useState('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'grouped'
	const [activeFlyerModal, setActiveFlyerModal] = useState(null);

	const formatDisplayDate = (dateStr) => {
		if (!dateStr) return '';
		try {
			const d = new Date(dateStr);
			if (isNaN(d.getTime())) return dateStr;
			return d.toLocaleDateString('en-US', {
				month: 'long',
				day: 'numeric',
				year: 'numeric',
			});
		} catch {
			return dateStr;
		}
	};

	const disciplines = [
		{ label: 'All Disciplines', value: 'all' },
		{ label: 'Mechanical Technology', value: 'Mechanical Technology' },
		{ label: 'Electrical & Electronics', value: 'Electrical & Electronics' },
		{ label: 'Information Technology', value: 'Information Technology' },
		{ label: 'Drafting & Civil', value: 'Drafting & Civil' },
		{ label: 'Hospitality', value: 'Hospitality' },
	];

 // Department icon mapper
 const getDeptIcon = (code) => {
 switch (code) {
 case 'MECH':
 return Wrench;
 case 'EE':
 return Cpu;
 case 'IT':
 return Laptop;
 case 'CIVIL':
 return Compass;
 case 'HOSP':
 return Utensils;
 default:
 return Building2;
 }
 };

	// Filtered published courses for Grid View
	const filteredCourses = (publishedCourses || []).filter((c) => {
		const deptName = c.trade?.program?.department?.name || '';
		const deptCode = c.trade?.program?.department?.code || '';
		const matchesCat =
			selectedCategory === 'all' ||
			deptName.toLowerCase() === selectedCategory.toLowerCase() ||
			deptCode.toLowerCase() === selectedCategory.toLowerCase() ||
			(c.category && c.category.toLowerCase() === selectedCategory.toLowerCase());

		const q = searchQuery.toLowerCase().trim();
		const matchesSearch =
			!q ||
			c.name.toLowerCase().includes(q) ||
			(c.category && c.category.toLowerCase().includes(q)) ||
			deptName.toLowerCase().includes(q) ||
			deptCode.toLowerCase().includes(q) ||
			(c.trade?.name && c.trade.name.toLowerCase().includes(q)) ||
			(c.overview_description && c.overview_description.toLowerCase().includes(q));

		return matchesCat && matchesSearch;
	});

	// Filtered departments for Grouped by Wing View
	const filteredGroupedDepts = (departments || [])
		.map((dept) => {
			const matchesCategory =
				selectedCategory === 'all' ||
				dept.name.toLowerCase() === selectedCategory.toLowerCase() ||
				dept.code.toLowerCase() === selectedCategory.toLowerCase();

			if (!matchesCategory) return null;

			const q = searchQuery.toLowerCase().trim();
			const matchingPrograms = (dept.programs || [])
				.map((prog) => {
					const matchingTrades = (prog.trades || []).filter((trade) => {
						const course = trade.courses?.[0];
						if (!q) return true;
						return (
							trade.name.toLowerCase().includes(q) ||
							(trade.code && trade.code.toLowerCase().includes(q)) ||
							prog.name.toLowerCase().includes(q) ||
							(course?.name && course.name.toLowerCase().includes(q)) ||
							(course?.overview_description && course.overview_description.toLowerCase().includes(q))
						);
					});

					if (matchingTrades.length === 0) return null;
					return { ...prog, trades: matchingTrades };
				})
				.filter(Boolean);

			if (matchingPrograms.length === 0) return null;
			return { ...dept, programs: matchingPrograms };
		})
		.filter(Boolean);

 // Filter departments
 const filteredDepartments = departments.filter((dept) => {
 if (selectedDept !== 'all' && dept.code !== selectedDept) {
 return false;
 }
 if (!searchQuery) return true;

 const q = searchQuery.toLowerCase();
 const matchesDept = dept.name.toLowerCase().includes(q) || dept.code.toLowerCase().includes(q);
 const matchesTrade = dept.programs?.some((p) =>
 p.trades?.some((t) => t.name.toLowerCase().includes(q) || (t.code && t.code.toLowerCase().includes(q)))
 );
 return matchesDept || matchesTrade;
 });

 const totalTradesCount = departments.reduce(
 (acc, d) => acc + (d.programs?.reduce((pAcc, p) => pAcc + (p.trades?.length || 0), 0) || 0),
 0
 );

 return (
 <div className="min-h-screen bg-govt-cream-300 text-gray-900 flex flex-col antialiased selection:bg-[#00401A] selection:text-white font-sans">
 <Head title={`${activeSettings.institute_name || 'Government Technical Training Institute, Rahim Yar Khan'} - TEVTA Punjab`} />

 {/* ════════════════════════════════════════════════════════════════
 1. OFFICIAL PROVINCIAL & NATIONAL CREST TOP BAR
 ════════════════════════════════════════════════════════════════ */}
 <div className="bg-[#002B11] text-emerald-100 text-xs border-b border-[#001F0C]">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
 <div className="flex items-center space-x-3">
 <span className="font-bold tracking-wider uppercase text-[11px] text-govt-gold flex items-center space-x-1">
 <span className="h-2 w-2 rounded-full bg-govt-green-400"></span>
 <span>حکومتِ پنجاب • GOVERNMENT OF THE PUNJAB</span>
 </span>
 <span className="text-emerald-700 hidden sm:inline">|</span>
 <span className="hidden md:inline text-emerald-200 text-[11px]">
 Technical Education & Vocational Training Authority (TEVTA)
 </span>
 </div>

 <div className="flex items-center space-x-4 text-[11px]">
 <span className="font-serif tracking-widest text-govt-gold-200 hidden lg:inline">
 {activeSettings.motto || 'ایمان، اتحاد، نظم و ضبط • Faith, Unity, Discipline'}
 </span>
 <span className="text-emerald-700 hidden lg:inline">|</span>
 <span className="flex items-center space-x-1 text-emerald-200">
 <Phone className="h-3 w-3 text-govt-gold" />
 <span>Helpline: {activeSettings.helpline_phones || activeSettings.helpline || activeSettings.phone || '068-9230123 / 068-9230124'}</span>
 </span>
 </div>
 </div>
 </div>

 {/* ════════════════════════════════════════════════════════════════
 2. MAIN INSTITUTIONAL MASTHEAD / HEADER
 ════════════════════════════════════════════════════════════════ */}
 <header className="bg-white border-b-2 border-[#00401A] shadow-sm">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
 {/* Official Emblems & Institute Title */}
 <div className="flex items-center space-x-4 text-center md:text-left">
                        {/* Official TEVTA Government Emblem */}
                        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-white border-2 border-emerald-800/20 p-1.5 shadow-md flex items-center justify-center shrink-0 hover:scale-105 transition duration-200">
                            <img src="/images/tevta-logo.png" alt="TEVTA Government of the Punjab" className="h-full w-full object-contain" />
                        </div>

 <div>
 <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
 <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-[#00401A] border border-emerald-300">
 Official Institute Portal
 </span>
 <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300">
 {activeSettings.accreditation_text || 'PBTE & NAVTTC Accredited'}
 </span>
 </div>
 <h1 className="text-xl sm:text-2xl font-black text-[#00401A] tracking-tight mt-0.5">
 {(activeSettings.institute_name || 'GOVERNMENT TECHNICAL TRAINING INSTITUTE, RAHIM YAR KHAN').toUpperCase()}
 </h1>
 <p className="text-xs text-gray-600 font-medium">
 {activeSettings.govt_subheading || activeSettings.tagline || 'Directorate of Technical Education • TEVTA Punjab • Established for Industrial Skills & Technical Excellence'}
 </p>
 </div>
 </div>

 {/* Quick Access Portal Buttons */}
 <div className="flex items-center space-x-2 shrink-0">
 {user ? (
 <Link
 href={route('dashboard')}
 className="px-5 py-2.5 rounded bg-[#00401A] hover:bg-[#003314] text-white text-xs font-bold transition shadow flex items-center space-x-2"
 >
 <span>Access Enterprise Portal</span>
 <ArrowRight className="h-3.5 w-3.5" />
 </Link>
 ) : (
 <div className="flex items-center space-x-2">
 {canLogin && (
 <Link
 href={route('login')}
 className="px-4 py-2 rounded bg-govt-cream-300 hover:bg-slate-200 text-gray-800 border border-gray-200 text-xs font-bold transition"
 >
 Staff / Trainee Login
 </Link>
 )}
 {canRegister && (
 <Link
 href={route('register')}
 className="px-5 py-2 rounded bg-[#00401A] hover:bg-[#003314] text-white text-xs font-extrabold transition shadow border border-[#002B11] flex items-center space-x-1.5"
 >
 <FileText className="h-3.5 w-3.5 text-govt-gold" />
 <span>Online Admission 2026</span>
 </Link>
 )}
 </div>
 )}
 </div>
 </div>

 {/* Formal Government Navigation Bar */}
 <nav className="bg-[#00401A] text-white border-t border-emerald-800/40">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between text-xs font-bold">
 <div className="flex flex-wrap items-center space-x-1 sm:space-x-4 py-2">
 <a href="#about" className="px-3 py-1 hover:bg-[#003013] rounded transition text-govt-gold-200">
 About Institute
 </a>
 <a href="#courses" className="px-3 py-1 hover:bg-[#003013] rounded transition">
 Technical Trades & Diplomas
 </a>
 <a href="#admissions" className="px-3 py-1 hover:bg-[#003013] rounded transition">
 Admission Criteria & Eligibility
 </a>
 <a href="#tevta" className="px-3 py-1 hover:bg-[#003013] rounded transition">
 TEVTA Governance
 </a>
 <a href="#contact" className="px-3 py-1 hover:bg-[#003013] rounded transition">
 Contact & Verification
 </a>
 </div>

 <div className="hidden md:flex items-center space-x-2 py-2 text-emerald-200 text-[11px]">
 <MapPin className="h-3.5 w-3.5 text-govt-gold" />
 <span>{activeSettings.institute_address || 'Shahbaz Pur Road, Rahim Yar Khan'}</span>
 </div>
 </div>
 </nav>
 </header>

			{/* ════════════════════════════════════════════════════════════════
			    3. OFFICIAL GAZETTE & ADMISSION ALERT TICKER
			════════════════════════════════════════════════════════════════ */}
			<div className="bg-amber-100 border-b border-amber-300 text-amber-950 px-4 py-2 text-xs">
				<div className="max-w-7xl mx-auto flex items-center space-x-3">
					<span className="px-2.5 py-0.5 rounded bg-amber-600 text-white font-black text-[10px] uppercase tracking-wider shrink-0">
						Official Notice
					</span>
					<p className="font-semibold truncate">
						{activeSettings.official_notice_text || (activeCampaign
							? `Admissions Open for Session 2026: ${activeCampaign.name} (Submission Deadline: ${formatDisplayDate(activeCampaign.end_date)}) — Free Education with Govt. Toolkits & Subsidized Stipends.`
							: 'Punjab Technical Education Admissions Open for PBTE Accredited 1-Year & 2-Year Diploma Programs.')}
					</p>
					<a
						href={activeSettings.official_notice_link || '#courses'}
						className="text-[#00401A] font-extrabold underline hover:text-emerald-700 shrink-0 ml-auto hidden sm:inline"
					>
						View Details →
					</a>
				</div>
			</div>

			{/* ════════════════════════════════════════════════════════════════
			    CAMPUS MEDIA SHOWCASE HERO CAROUSEL & QUICK CARDS
			════════════════════════════════════════════════════════════════ */}
			<TevtaHeroSection photos={showcasePhotos} canRegister={canRegister} user={user} settings={activeSettings} />

			{/* ════════════════════════════════════════════════════════════════
			    HISTORIC NATIONAL MOTTO / QUAID-E-AZAM QUOTE SECTION
			════════════════════════════════════════════════════════════════ */}
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
				<div className="rounded-2xl bg-white border-2 border-emerald-800/20 p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-center gap-6 sm:gap-8">
					{/* Decorative green-gold accent strip */}
					<div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#00401A] via-emerald-600 to-[#C49A1A]" />

					{/* Circular Quaid Portrait */}
					<div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden shrink-0 border-3 border-emerald-800/40 shadow-lg ring-4 ring-emerald-50 bg-slate-100 relative mx-auto md:mx-0">
						<img
							src="/images/quaid-e-azam.jpg"
							alt="Quaid-e-Azam Muhammad Ali Jinnah"
							className="h-full w-full object-cover object-top"
							onError={(e) => {
								e.target.src = '/images/tevta-logo.png';
							}}
						/>
					</div>

					{/* Historic Quote & Attributions */}
					<div className="flex-1 text-center md:text-left space-y-3 relative">
						<span className="text-4xl text-[#C49A1A]/40 font-serif leading-none select-none absolute -top-4 -left-3 hidden md:inline-block">
							“
						</span>
						<p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-serif italic relative z-10">
							"There is immediate and urgent need for training our people in the scientific and technical education in order to build up our economic life, and we should see that our people undertake scientific, commerce, trade and particularly, well-planned industries. <strong className="text-gray-950 font-bold not-italic font-sans">I must emphasize that greater attention should be paid to technical and vocational education.</strong>"
						</p>
						<div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
							<div>
								<h3 className="font-extrabold text-sm text-gray-900 tracking-tight">
									Quaid-e-Azam Muhammad Ali Jinnah
								</h3>
								<p className="text-[11px] text-gray-500 font-medium">
									Founder of Pakistan • All Pakistan Educational Conference, Karachi
								</p>
							</div>
							<span className="text-[11px] text-[#00401A] font-black uppercase tracking-wider font-mono self-center sm:self-auto">
								NOVEMBER 27TH, 1947
							</span>
						</div>
					</div>
				</div>
			</section>

			{/* ════════════════════════════════════════════════════════════════
			    AUTO-ANIMATED IMAGE GALLERY SECTION
			════════════════════════════════════════════════════════════════ */}
			<div id="gallery">
				<AnimatedImageGallery images={galleryImages} />
			</div>

			{/* ════════════════════════════════════════════════════════════════
			    INSTITUTIONAL CORE TEAM SECTION
			════════════════════════════════════════════════════════════════ */}
			<div id="core-team">
				<CoreTeamSection members={coreTeamMembers} />
			</div>

 {/* ════════════════════════════════════════════════════════════════
 4. INSTITUTIONAL MANDATE & PRINCIPAL'S DESK
 ════════════════════════════════════════════════════════════════ */}
 <section id="about" className="py-10 bg-white border-b border-gray-200">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
 {/* Left: Official Welcome Statement */}
 <div className="lg:col-span-8 space-y-4">
 <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-emerald-50 border border-emerald-300 text-[#00401A] text-xs font-bold uppercase tracking-wider">
 <Award className="h-3.5 w-3.5 text-amber-600" />
 <span>Chartered Vocational Institute • Govt. of the Punjab</span>
 </div>

 <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
 Empowering the Youth of Southern Punjab with Nationally and Globally Recognized Technical Skills
 </h2>

 <p className="text-sm text-gray-700 leading-relaxed">
 Government Technical Training Institute (GTTI) Rahim Yar Khan operates under the administrative aegis of the <strong className="text-[#00401A]">Technical Education and Vocational Training Authority (TEVTA)</strong>, Government of the Punjab. Our institute delivers competency-based training & assessment (CBT&A) aligned with the National Vocational Qualifications Framework (NVQF) and international industrial benchmarks.
 </p>

 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
 <div className="p-3 rounded bg-govt-cream border border-gray-200">
 <p className="text-xl font-black text-[#00401A]">100%</p>
 <p className="text-[11px] font-semibold text-gray-600">Practical Workshops</p>
 </div>
 <div className="p-3 rounded bg-govt-cream border border-gray-200">
 <p className="text-xl font-black text-[#00401A]">{totalTradesCount}+ Trades</p>
 <p className="text-[11px] font-semibold text-gray-600">Accredited Diplomas</p>
 </div>
 <div className="p-3 rounded bg-govt-cream border border-gray-200">
 <p className="text-xl font-black text-[#00401A]">PBTE</p>
 <p className="text-[11px] font-semibold text-gray-600">Certified Examinations</p>
 </div>
 <div className="p-3 rounded bg-govt-cream border border-gray-200">
 <p className="text-xl font-black text-[#00401A]">Subsidized</p>
 <p className="text-[11px] font-semibold text-gray-600">Free Training & Stipends</p>
 </div>
 </div>
 </div>

 {/* Right: Institutional Profile Card */}
 <div className="lg:col-span-4">
 <div className="rounded-2xl bg-[#00401A] text-white p-6 border-2 border-[#002B11] shadow-md space-y-4">
 <div className="flex items-center space-x-3 pb-3 border-b border-emerald-800">
 <div className="h-12 w-12 rounded-xl bg-white p-1 shadow flex items-center justify-center shrink-0 border border-emerald-400/30">
									<img src="/images/tevta-logo.png" alt="TEVTA Punjab" className="h-full w-full object-contain" />
								</div>
 <div>
 <h3 className="font-extrabold text-sm text-white">Institutional Highlights</h3>
 <p className="text-[11px] text-emerald-200">District Rahim Yar Khan</p>
 </div>
 </div>

 <ul className="space-y-2.5 text-xs text-emerald-100">
 <li className="flex items-start space-x-2">
 <CheckCircle2 className="h-4 w-4 text-govt-gold-200 shrink-0 mt-0.5" />
 <span>Recognized by PBTE (Punjab Board of Technical Education, Lahore)</span>
 </li>
 <li className="flex items-start space-x-2">
 <CheckCircle2 className="h-4 w-4 text-govt-gold-200 shrink-0 mt-0.5" />
 <span>CBT&A Level 2 to Level 5 Certified Programs</span>
 </li>
 <li className="flex items-start space-x-2">
 <CheckCircle2 className="h-4 w-4 text-govt-gold-200 shrink-0 mt-0.5" />
 <span>Equipped Modern Electrical, Mechanical, and CNC Machine Laboratories</span>
 </li>
 <li className="flex items-start space-x-2">
 <CheckCircle2 className="h-4 w-4 text-govt-gold-200 shrink-0 mt-0.5" />
 <span>Job Placement Cell with Formal Industrial Linkages</span>
 </li>
 </ul>

 {canRegister && (
 <Link
 href={route('register')}
 className="w-full py-2.5 px-4 rounded bg-amber-400 hover:bg-amber-300 text-gray-900 font-extrabold text-xs transition shadow flex items-center justify-center space-x-2 mt-2"
 >
 <span>Submit Online Admission Form</span>
 <ArrowRight className="h-4 w-4" />
 </Link>
 )}
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* ════════════════════════════════════════════════════════════════
 5. OFFICIAL ADMISSIONS CRITERIA & PROCEDURE
 ════════════════════════════════════════════════════════════════ */}
 <section id="admissions" className="py-10 bg-govt-cream border-b border-gray-200">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
 <div className="text-center max-w-2xl mx-auto">
 <span className="text-xs font-black uppercase tracking-wider text-[#00401A]">
 Government Admission Procedure
 </span>
 <h2 className="text-2xl font-black text-gray-900 mt-1">
 How to Apply for Admission (Session 2026)
 </h2>
 <p className="text-xs text-gray-600 mt-1">
 Transparent, merit-based selection governed under TEVTA admission regulations
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2">
 <span className="h-8 w-8 rounded bg-[#00401A] text-white flex items-center justify-center font-black text-sm">
 1
 </span>
 <h3 className="font-extrabold text-sm text-gray-900">Online Registration</h3>
 <p className="text-xs text-gray-600 leading-relaxed">
 Create an applicant account using your CNIC / B-Form and verify personal contact credentials.
 </p>
 </div>

 <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2">
 <span className="h-8 w-8 rounded bg-[#00401A] text-white flex items-center justify-center font-black text-sm">
 2
 </span>
 <h3 className="font-extrabold text-sm text-gray-900">Trade Preference</h3>
 <p className="text-xs text-gray-600 leading-relaxed">
 Select your preferred technical trades (e.g. Electrician, Machinist, Welder, Civil Surveyor).
 </p>
 </div>

 <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2">
 <span className="h-8 w-8 rounded bg-[#00401A] text-white flex items-center justify-center font-black text-sm">
 3
 </span>
 <h3 className="font-extrabold text-sm text-gray-900">Document Upload</h3>
 <p className="text-xs text-gray-600 leading-relaxed">
 Upload digital copies of Matric/Middle result cards, CNIC/B-Form, and Domicile certificate.
 </p>
 </div>

 <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2">
<span className="h-8 w-8 rounded bg-[#00401A] text-white flex items-center justify-center font-black text-sm">
 4
 </span>
 <h3 className="font-extrabold text-sm text-gray-900">Merit List & Enrollment</h3>
 <p className="text-xs text-gray-600 leading-relaxed">
 Selection is determined by TEVTA District Committee. Successful candidates receive roll numbers and toolkits.
 </p>
 </div>
 </div>
 </div>
 </section>

	{/* ════════════════════════════════════════════════════════════════
	    6. TECHNICAL TRADES & DIPLOMAS DIRECTORY (CONSOLIDATED)
	════════════════════════════════════════════════════════════════ */}
	<section id="courses" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
		{/* Section Header with Search Input */}
		<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-gray-200 pb-5">
			<div>
				<div className="flex items-center space-x-2 mb-1">
					<span className="text-xs font-black uppercase tracking-wider text-[#00401A]">
						Academic Directory
					</span>
					<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
						Session 2026
					</span>
				</div>
				<h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
					Accredited Technical Programs & Trades
				</h2>
				<p className="text-xs text-gray-600 mt-1">
					Government approved vocational qualifications with morning and evening instructional shifts
				</p>
			</div>

			{/* Search Input */}
			<div className="relative w-full md:w-80 shrink-0">
				<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
				<input
					type="text"
					placeholder="Search courses, trades, wings..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00401A] shadow-2xs"
				/>
			</div>
		</div>

		{/* Filter Controls Bar: Category Filter Pills + View Switcher */}
		<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
			{/* Category Filter Pills */}
			<div className="flex flex-wrap items-center gap-1.5">
				{disciplines.map((disc) => {
					const isSelected = selectedCategory === disc.value;
					return (
						<button
							key={disc.value}
							type="button"
							onClick={() => setSelectedCategory(disc.value)}
							className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
								isSelected
									? 'bg-[#00401A] text-white shadow-xs'
									: 'bg-white text-gray-700 hover:bg-slate-100 border border-gray-200'
							}`}
						>
							<span>{disc.label}</span>
							{disc.value === 'all' && (
								<span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
									{publishedCourses.length}
								</span>
							)}
						</button>
					);
				})}
			</div>

			{/* View Switcher: [ Grid View ] vs [ Grouped by Wing ] */}
			<div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 self-start lg:self-auto shrink-0 shadow-2xs">
				<button
					type="button"
					onClick={() => setViewMode('grid')}
					className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
						viewMode === 'grid'
							? 'bg-white text-[#00401A] shadow-xs'
							: 'text-gray-600 hover:text-gray-900'
					}`}
				>
					<LayoutGrid className="w-3.5 h-3.5" />
					<span>Grid View</span>
				</button>
				<button
					type="button"
					onClick={() => setViewMode('grouped')}
					className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
						viewMode === 'grouped'
							? 'bg-white text-[#00401A] shadow-xs'
							: 'text-gray-600 hover:text-gray-900'
					}`}
				>
					<List className="w-3.5 h-3.5" />
					<span>Grouped by Wing</span>
				</button>
			</div>
		</div>

		{/* ════════════════════════════════════════════════════════════════
		    VIEW 1: MODERN CARDS GRID (DEFAULT)
		════════════════════════════════════════════════════════════════ */}
		{viewMode === 'grid' && (
			<div className="space-y-6">
				{filteredCourses.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
						{filteredCourses.map((course) => (
							<div
								key={course.id}
								className="rounded-2xl bg-white border border-gray-200 hover:border-[#00401A] p-5 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between h-full space-y-4 group"
							>
								<div className="space-y-3">
									<div className="flex items-start justify-between gap-2">
										<span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-[#00401A] border border-emerald-200 truncate max-w-[180px]">
											{course.trade?.program?.department?.name || course.category || 'Technical Trade'}
										</span>
										<span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shrink-0">
											<Clock className="h-3 w-3" />
											<span>{course.formatted_duration || (course.duration_value ? `${course.duration_value} Months` : '6 Months')}</span>
										</span>
									</div>

									<h4 className="text-base font-black text-gray-900 group-hover:text-[#00401A] transition leading-snug">
										{course.name}
									</h4>

									<div className="flex flex-wrap items-center gap-1.5 text-[10px]">
										<span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
											course.requires_entrance_test
												? 'bg-amber-100 text-amber-900 border border-amber-300'
												: 'bg-emerald-100 text-emerald-900 border border-emerald-300'
										}`}>
											{course.requires_entrance_test ? 'Track A: Test Required' : 'Track B: Direct FCFS'}
										</span>
										<span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold">
											{course.intake_capacity ?? 50} Seats
										</span>
										{course.classes_start_date && (
											<span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-mono">
												Starts: {new Date(course.classes_start_date).toLocaleDateString('en-GB')}
											</span>
										)}
									</div>

									<p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
										{course.overview_description || `Standard institutional curriculum with ${course.total_academic_days || 60} academic days of practical workshop sessions.`}
									</p>

									<div className="pt-2 flex flex-wrap gap-2 text-[11px] text-gray-500 font-mono border-t border-gray-100">
										<span>• {course.total_academic_days || 60} Days Roadmap</span>
										<span>• Eligibility: <strong className="text-gray-700">{course.entry_level || 'Matric / Middle'}</strong></span>
									</div>
								</div>

								<div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs gap-2 mt-auto">
									<div className="flex items-center space-x-2">
										{course.syllabus_document_path && (
											<a
												href={`/storage/${course.syllabus_document_path}`}
												target="_blank"
												rel="noreferrer"
												className="inline-flex items-center space-x-1 font-bold text-amber-700 hover:text-amber-800"
											>
												<FileText className="h-3.5 w-3.5" />
												<span>Syllabus</span>
											</a>
										)}
										{(course.advertisement_url || course.advertisement_image_path) && (
											<button
												type="button"
												onClick={() => setActiveFlyerModal(course)}
												className="inline-flex items-center space-x-1 font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200 transition cursor-pointer"
											>
												<ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
												<span>View Ad</span>
											</button>
										)}
									</div>

									<Link
										href={canRegister ? route('register') : '#'}
										className="inline-flex items-center space-x-1 font-extrabold text-[#00401A] hover:underline ml-auto"
									>
										<span>Apply Now →</span>
									</Link>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 space-y-3">
						<p className="font-bold text-gray-800 text-sm">No technical courses matched your filter or search query.</p>
						<p className="text-xs text-gray-500">Try clearing your search keyword or choose "All Disciplines".</p>
						<button
							type="button"
							onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
							className="px-4 py-2 rounded-lg bg-[#00401A] text-white text-xs font-bold hover:bg-[#003013] transition cursor-pointer"
						>
							Reset Filters
						</button>
					</div>
				)}
			</div>
		)}

		{/* ════════════════════════════════════════════════════════════════
		    VIEW 2: GROUPED BY WING / DEPARTMENT
		════════════════════════════════════════════════════════════════ */}
		{viewMode === 'grouped' && (
			<div className="space-y-8">
				{filteredGroupedDepts.length > 0 ? (
					filteredGroupedDepts.map((dept) => (
						<div
							key={dept.id}
							className="rounded-2xl bg-white border border-gray-200 p-6 md:p-8 space-y-6 shadow-xs"
						>
							{/* Department Wing Header */}
							<div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-200">
								<div className="flex items-center space-x-3">
									<div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#00401A] border border-emerald-300 flex items-center justify-center font-black text-sm shadow-2xs">
										{dept.code}
									</div>
									<div>
										<h3 className="text-lg font-black text-gray-900">{dept.name}</h3>
										<p className="text-xs text-gray-500">
											Accredited Training Wing • {dept.programs?.length || 0} Qualification Tracks
										</p>
									</div>
								</div>

								<span className="inline-flex items-center px-3 py-1 rounded text-xs font-bold bg-emerald-100 text-[#00401A] border border-emerald-300">
									TEVTA Recognized
								</span>
							</div>

							{/* Programs & Trades inside Wing */}
							<div className="space-y-6">
								{dept.programs?.map((program) => (
									<div key={program.id} className="space-y-3">
										<div className="flex items-center space-x-2 text-xs font-bold text-gray-700">
											<span className="h-2 w-2 rounded-full bg-[#00401A]" />
											<span className="text-gray-900">{program.name}</span>
											<span className="text-gray-400">•</span>
											<span className="text-[#00401A] font-mono">{program.duration_months} Months Duration</span>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
											{program.trades?.map((trade) => {
												const course = trade.courses?.[0];
												const entryLevel = course?.entry_level || 'Matric / Middle';
												return (
													<div
														key={trade.id}
														className="p-5 rounded-xl bg-slate-50/80 border border-gray-200 hover:border-[#00401A] transition duration-200 flex flex-col justify-between h-full space-y-3 group hover:shadow-xs"
													>
														<div className="space-y-2">
															<div className="flex items-start justify-between gap-2">
																<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-gray-700 font-mono">
																	{trade.code || 'PBTE-TR'}
																</span>
																<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-[#00401A] border border-emerald-200">
																	Eligibility: {entryLevel}
																</span>
															</div>

															<h4 className="text-sm font-black text-gray-900 group-hover:text-[#00401A] transition">
																{trade.name}
															</h4>
															<p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
																{course?.overview_description || 'Industrial vocational curriculum with practical workshop sessions.'}
															</p>
														</div>

														<div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs mt-auto">
															<span className="font-semibold text-emerald-800 text-[11px]">
																Morning / Evening Shifts
															</span>
															<Link
																href={canRegister ? route('register') : '#'}
																className="inline-flex items-center space-x-1 font-extrabold text-[#00401A] hover:underline"
															>
																<span>Apply Now →</span>
															</Link>
														</div>
													</div>
												);
											})} 
										</div>
									</div>
								))}
							</div>
						</div>
					))
				) : (
					<div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 space-y-3">
						<p className="font-bold text-gray-800 text-sm">No technical wings matched your filter or search query.</p>
						<p className="text-xs text-gray-500">Try choosing "All Disciplines" or clear your search term.</p>
						<button
							type="button"
							onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
							className="px-4 py-2 rounded-lg bg-[#00401A] text-white text-xs font-bold hover:bg-[#003013] transition cursor-pointer"
						>
							Reset Filters
						</button>
					</div>
				)}
			</div>
		)}
	</section>

 {/* ════════════════════════════════════════════════════════════════
 7. OFFICIAL GOVERNMENT FOOTER
 ════════════════════════════════════════════════════════════════ */}
 		{/* ════════════════════════════════════════════════════════════════
		    7. OFFICIAL GOVERNMENT FOOTER (HIGH CONTRAST & ACCESSIBLE)
		════════════════════════════════════════════════════════════════ */}
		<footer id="contact" className="bg-[#002B11] text-emerald-100 text-xs border-t-4 border-[#C49A1A] mt-auto">
			{/* Upper Footer Links */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
				<div className="space-y-3">
					<div className="flex items-center space-x-3">
						<div className="h-12 w-12 rounded-xl bg-white p-1 shadow flex items-center justify-center shrink-0 border border-emerald-400/30">
							<img src="/images/tevta-logo.png" alt="TEVTA" className="h-full w-full object-contain" />
						</div>
						<div>
							<h4 className="font-extrabold text-white text-base tracking-tight">GTTI Rahim Yar Khan</h4>
							<p className="text-xs text-amber-300 font-bold">Govt. Technical Training Institute</p>
						</div>
					</div>
					<p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
						Established to equip the youth of Punjab with technical certifications, accredited vocational diplomas, and industrial competencies.
					</p>
				</div>

				<div className="space-y-2.5">
					<h4 className="font-black text-amber-400 text-xs tracking-wider uppercase pb-1.5 border-b border-emerald-800">
						Institutional Links
					</h4>
					<ul className="space-y-2 text-xs font-medium">
						<li>
							<a href="https://tevta.gop.pk" target="_blank" rel="noreferrer" className="text-emerald-100 hover:text-amber-300 transition-colors flex items-center space-x-1.5 py-0.5">
								<span>TEVTA Punjab Official Portal</span>
								<ExternalLink className="h-3.5 w-3.5 text-amber-400 shrink-0" />
							</a>
						</li>
						<li>
							<a href="https://pbte.edu.pk" target="_blank" rel="noreferrer" className="text-emerald-100 hover:text-amber-300 transition-colors flex items-center space-x-1.5 py-0.5">
								<span>Punjab Board of Technical Education (PBTE)</span>
								<ExternalLink className="h-3.5 w-3.5 text-amber-400 shrink-0" />
							</a>
						</li>
						<li>
							<a href="https://navttc.gov.pk" target="_blank" rel="noreferrer" className="text-emerald-100 hover:text-amber-300 transition-colors flex items-center space-x-1.5 py-0.5">
								<span>NAVTTC Pakistan</span>
								<ExternalLink className="h-3.5 w-3.5 text-amber-400 shrink-0" />
							</a>
						</li>
						<li>
							<a href="https://punjab.gov.pk" target="_blank" rel="noreferrer" className="text-emerald-100 hover:text-amber-300 transition-colors flex items-center space-x-1.5 py-0.5">
								<span>Government of the Punjab Official</span>
								<ExternalLink className="h-3.5 w-3.5 text-amber-400 shrink-0" />
							</a>
						</li>
					</ul>
				</div>

				<div className="space-y-2.5">
					<h4 className="font-black text-amber-400 text-xs tracking-wider uppercase pb-1.5 border-b border-emerald-800">
						Campus Contact
					</h4>
					<p className="flex items-start space-x-2 text-emerald-100 text-xs leading-relaxed font-medium">
						<MapPin className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
						<span>{activeSettings.institute_address || activeSettings.address || 'Shahbaz Pur Road, Near Sports Complex, Rahim Yar Khan, Punjab, Pakistan'}</span>
					</p>
					<p className="flex items-center space-x-2 text-emerald-100 text-xs">
						<Phone className="h-4 w-4 text-amber-400 shrink-0" />
						<span className="font-mono font-bold text-white">{activeSettings.helpline_phones || activeSettings.helpline || activeSettings.phone || '068-9230123 / 068-9230124'}</span>
					</p>
					<p className="flex items-center space-x-2 text-emerald-100 text-xs">
						<Mail className="h-4 w-4 text-amber-400 shrink-0" />
						<span className="font-mono font-medium text-emerald-100">{activeSettings.official_email || activeSettings.email || 'info@gtti.edu.pk'}</span>
					</p>
				</div>

				<div className="space-y-2.5">
					<h4 className="font-black text-amber-400 text-xs tracking-wider uppercase pb-1.5 border-b border-emerald-800">
						RTI & Transparency
					</h4>
					<p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
						Compliant with the Punjab Transparency and Right to Information Act. All admissions and merit lists are officially verified and auditable by TEVTA oversight authorities.
					</p>
					<div className="pt-1">
						<span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[#00401A] border border-amber-400/40 text-amber-300 text-[11px] font-black uppercase tracking-wider shadow-sm">
							<ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
							<span>Official Govt. Property</span>
						</span>
					</div>
				</div>
			</div>

			{/* Bottom Copyright Bar */}
			<div className="border-t border-emerald-800/80 py-4 bg-[#001809] text-center text-xs">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 font-medium">
					<p className="text-emerald-100">
						© {new Date().getFullYear()} <strong className="text-white font-bold">{activeSettings.institute_name || 'Government Technical Training Institute, Rahim Yar Khan'}</strong>. All rights reserved.
					</p>
					<p className="text-amber-300 font-semibold tracking-wide">
						Designed for TEVTA Punjab • Islamic Republic of Pakistan
					</p>
				</div>
			</div>
		</footer>

		{/* Course Advertisement Flyer Modal */}
		{activeFlyerModal && (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
				<div className="relative w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col">
					<div className="p-4 border-b border-gray-200 flex items-center justify-between bg-emerald-50">
						<div>
							<h3 className="text-base font-black text-[#00401A]">
								{activeFlyerModal.name} — Official Course Flyer
							</h3>
							<p className="text-xs text-gray-600">
								{activeFlyerModal.category || 'Technical & Vocational Training Program'}
							</p>
						</div>
						<button
							type="button"
							onClick={() => setActiveFlyerModal(null)}
							className="p-1.5 rounded-lg bg-gray-200 hover:bg-rose-100 hover:text-rose-700 text-gray-700 transition"
						>
							<X className="h-5 w-5" />
						</button>
					</div>
					<div className="p-4 flex items-center justify-center bg-slate-900 max-h-[75vh] overflow-auto">
						<img
							src={activeFlyerModal.advertisement_image_path ? (activeFlyerModal.advertisement_image_path.startsWith('/') ? activeFlyerModal.advertisement_image_path : `/storage/${activeFlyerModal.advertisement_image_path}`) : activeFlyerModal.advertisement_url}
							alt={activeFlyerModal.name}
							className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-md"
							onError={(e) => {
								e.target.src = '/images/campus_building.jpg';
							}}
						/>
					</div>
					<div className="p-3 bg-slate-50 border-t border-gray-200 flex items-center justify-between text-xs">
						<span className="text-gray-500 font-medium">GTTI Admissions Session 2026</span>
						<button
							type="button"
							onClick={() => setActiveFlyerModal(null)}
							className="px-4 py-1.5 rounded-lg bg-[#00401A] hover:bg-[#003013] text-white font-bold transition"
						>
							Close
						</button>
					</div>
				</div>
			</div>
		)}
	</div>
	);
}
