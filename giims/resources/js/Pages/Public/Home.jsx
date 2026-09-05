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
 ShieldCheck
} from 'lucide-react';

export default function Home({ activeCampaign, departments = [], publishedCourses = [], canLogin, canRegister }) {
 const { auth, site_settings: siteSettings = {} } = usePage().props;
 const user = auth?.user;
 const [selectedDept, setSelectedDept] = useState('all');
 const [selectedCategory, setSelectedCategory] = useState('all');
 const [searchQuery, setSearchQuery] = useState('');

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
 <Head title={`${siteSettings.institute_name || 'Government Technical Training Institute, Rahim Yar Khan'} - TEVTA Punjab`} />

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
 {siteSettings.motto || 'ایمان، اتحاد، نظم و ضبط • Faith, Unity, Discipline'}
 </span>
 <span className="text-emerald-700 hidden lg:inline">|</span>
 <span className="flex items-center space-x-1 text-emerald-200">
 <Phone className="h-3 w-3 text-govt-gold" />
 <span>Helpline: {siteSettings.helpline || siteSettings.phone || '068-9230123'}</span>
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
 {/* Government Emblem Placeholder Badge */}
 <div className="h-16 w-16 rounded-full bg-[#00401A] text-govt-gold-600 border-2 border-amber-400 flex flex-col items-center justify-center p-1 shadow shrink-0">
 <ShieldCheck className="h-8 w-8 text-govt-gold" />
 <span className="text-[8px] font-black tracking-tighter uppercase text-white">TEVTA</span>
 </div>

 <div>
 <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
 <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-[#00401A] border border-emerald-300">
 Official Institute Portal
 </span>
 <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300">
 {siteSettings.accreditation_text || 'PBTE & NAVTTC Accredited'}
 </span>
 </div>
 <h1 className="text-xl sm:text-2xl font-black text-[#00401A] tracking-tight mt-0.5">
 {(siteSettings.institute_name || 'GOVERNMENT TECHNICAL TRAINING INSTITUTE, RAHIM YAR KHAN').toUpperCase()}
 </h1>
 <p className="text-xs text-gray-600 font-medium">
 {siteSettings.tagline || 'Directorate of Technical Education • TEVTA Punjab • Established for Industrial Skills & Technical Excellence'}
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
 <span>Shahbaz Pur Road, Rahim Yar Khan</span>
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
 {activeCampaign
 ? `Admissions Open for Session 2026: ${activeCampaign.name} (Submission Deadline: ${activeCampaign.end_date}) — Free Education with Govt. Toolkits & Subsidized Stipends.`
 : 'Punjab Technical Education Admissions Open for PBTE Accredited 1-Year & 2-Year Diploma Programs.'}
 </p>
 <a
 href="#courses"
 className="text-[#00401A] font-extrabold underline hover:text-emerald-700 shrink-0 ml-auto hidden sm:inline"
 >
 View Official Trade Catalog →
 </a>
 </div>
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
 <div className="h-10 w-10 rounded-full bg-white text-[#00401A] flex items-center justify-center font-black">
 TEVTA
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
 6. TECHNICAL TRADES & DIPLOMAS DIRECTORY
 ════════════════════════════════════════════════════════════════ */}
	<section id="courses" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
		<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-gray-200 pb-4">
			<div>
				<span className="text-xs font-black uppercase tracking-wider text-[#00401A]">
					Academic Directory
				</span>
				<h2 className="text-2xl font-black text-gray-900 tracking-tight">
					Accredited Technical Programs & Trades
				</h2>
				<p className="text-xs text-gray-600 mt-0.5">
					Government approved vocational qualifications with morning and evening instructional shifts
				</p>
			</div>

			{/* Search Input */}
			<div className="relative w-full md:w-80">
				<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
				<input
					type="text"
					placeholder="Search courses, categories, trades..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00401A]"
				/>
			</div>
		</div>

		{/* Live Published Courses Showcase */}
		{publishedCourses && publishedCourses.length > 0 && (
			<div className="space-y-6 pb-6 border-b-2 border-gray-200">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<div>
						<div className="flex items-center space-x-2">
							<span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
								Live Catalog Sync
							</span>
							<span className="text-xs text-emerald-800 font-bold flex items-center space-x-1">
								<span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
								<span>Admission Desk Synchronized</span>
							</span>
						</div>
						<h3 className="text-lg font-black text-gray-900 mt-1">
							Active Vocational Diplomas & Courses ({publishedCourses.length})
						</h3>
					</div>

					{/* Category Filter Pills */}
					<div className="flex flex-wrap gap-1.5">
						<button
							type="button"
							onClick={() => setSelectedCategory('all')}
							className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
								selectedCategory === 'all'
									? 'bg-[#00401A] text-white shadow-sm'
									: 'bg-white text-gray-700 hover:bg-slate-100 border border-gray-200'
							}`}
						>
							All Disciplines
						</button>
						{Array.from(new Set(publishedCourses.map((c) => c.category || 'General Vocational'))).map((cat) => (
							<button
								key={cat}
								type="button"
								onClick={() => setSelectedCategory(cat)}
								className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
									selectedCategory === cat
										? 'bg-[#00401A] text-white shadow-sm'
										: 'bg-white text-gray-700 hover:bg-slate-100 border border-gray-200'
								}`}
							>
								{cat}
							</button>
						))}
					</div>
				</div>

				{/* Published Course Cards Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
					{publishedCourses
						.filter((c) => {
							const matchesCat = selectedCategory === 'all' || (c.category || 'General Vocational') === selectedCategory;
							const matchesSearch = !searchQuery ||
								c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
								(c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
								(c.overview_description && c.overview_description.toLowerCase().includes(searchQuery.toLowerCase()));
							return matchesCat && matchesSearch;
						})
						.map((course) => (
							<div
								key={course.id}
								className="rounded-2xl bg-white border border-gray-200 hover:border-[#00401A] p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
							>
								<div className="space-y-2.5">
									<div className="flex items-start justify-between gap-2">
										<span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200">
											{course.category || 'General Vocational'}
										</span>
										<span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
											<Clock className="h-3 w-3" />
											<span>{course.formatted_duration || `${course.duration_value || 6} Months`}</span>
										</span>
									</div>

									<h4 className="text-base font-black text-gray-900 leading-snug">
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

									<div className="pt-2 flex flex-wrap gap-2 text-[11px] text-gray-500 font-mono">
										<span>• {course.total_academic_days || 60} Days Roadmap</span>
										<span>• Eligibility: <strong>{course.entry_level}</strong></span>
									</div>
								</div>

								<div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
									{course.syllabus_document_path ? (
										<a
											href={`/storage/${course.syllabus_document_path}`}
											target="_blank"
											rel="noreferrer"
											className="inline-flex items-center space-x-1 font-bold text-amber-700 hover:text-amber-800"
										>
											<FileText className="h-3.5 w-3.5" />
											<span>Syllabus (PDF)</span>
										</a>
									) : (
										<span className="text-gray-400 font-medium">TEVTA Certified</span>
									)}

									<Link
										href={canRegister ? route('register') : '#'}
										className="inline-flex items-center space-x-1 font-extrabold text-[#00401A] hover:underline"
									>
										<span>Apply Now</span>
										<ArrowRight className="h-3.5 w-3.5" />
									</Link>
								</div>
							</div>
						))}
				</div>
			</div>
		)}

 {/* Department Filter Pills */}
 <div className="flex flex-wrap gap-2">
 <button
 onClick={() => setSelectedDept('all')}
 className={`px-3.5 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1.5 ${
 selectedDept === 'all'
 ? 'bg-[#00401A] text-white shadow-sm'
 : 'bg-white text-gray-700 hover:bg-slate-200 border border-gray-200'
 }`}
 >
 <span>All Technical Wings</span>
 <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 text-white font-mono">
 {departments.length}
 </span>
 </button>
 {departments.map((dept) => {
 const isSelected = selectedDept === dept.code;
 return (
 <button
 key={dept.code}
 onClick={() => setSelectedDept(dept.code)}
 className={`px-3.5 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1.5 ${
 isSelected
 ? 'bg-[#00401A] text-white shadow-sm'
 : 'bg-white text-gray-700 hover:bg-slate-200 border border-gray-200'
 }`}
 >
 <span>{dept.name}</span>
 </button>
 );
 })}
 </div>

 {/* Departments & Courses Listing */}
 <div className="space-y-8">
 {filteredDepartments.map((dept) => {
 return (
 <div
 key={dept.id}
 className="rounded-xl bg-white border border-gray-200 p-6 md:p-8 space-y-6 shadow-sm"
 >
 {/* Department Header */}
 <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-200">
 <div className="flex items-center space-x-3">
 <div className="h-10 w-10 rounded bg-emerald-50 text-[#00401A] border border-emerald-300 flex items-center justify-center font-bold">
 {dept.code}
 </div>
 <div>
 <h3 className="text-lg font-black text-gray-900">{dept.name}</h3>
 <p className="text-xs text-gray-500">
 Accredited Training Wing • {dept.programs?.length || 0} Certificate Tracks
 </p>
 </div>
 </div>

 <span className="inline-flex items-center px-3 py-1 rounded text-xs font-bold bg-emerald-100 text-[#00401A] border border-emerald-300">
 TEVTA Recognized
 </span>
 </div>

 {/* Programs and Trades Grid */}
 <div className="space-y-6">
 {dept.programs?.map((program) => (
 <div key={program.id} className="space-y-3">
 <div className="flex items-center space-x-2 text-xs font-bold text-gray-700">
 <span className="h-2 w-2 rounded-full bg-[#00401A]"></span>
 <span className="text-gray-900">{program.name}</span>
 <span className="text-gray-500">•</span>
 <span className="text-[#00401A] font-mono">{program.duration_months} Months Duration</span>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {program.trades?.map((trade) => {
 const course = trade.courses?.[0];
 const entryLevel = course?.entry_level || 'Matric / Middle';
 return (
 <div
 key={trade.id}
 className="p-5 rounded-lg bg-govt-cream border border-gray-200 hover:border-[#00401A] transition flex flex-col justify-between"
 >
 <div>
 <div className="flex items-start justify-between gap-2 mb-2">
 <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-gray-700 font-mono">
 {trade.code || 'PBTE-TR'}
 </span>
 <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-[#00401A] border border-emerald-200">
 Eligibility: {entryLevel}
 </span>
 </div>

 <h4 className="text-sm font-black text-gray-900">
 {trade.name}
 </h4>
 <p className="text-xs text-gray-500 mt-1">
 Industrial vocational curriculum with practical workshop sessions.
 </p>
 </div>

 <div className="pt-3 mt-4 border-t border-gray-200 flex items-center justify-between text-xs">
 <span className="font-semibold text-emerald-800">
 Morning / Evening Shifts
 </span>
 <Link
 href={route('register')}
 className="font-bold text-[#00401A] hover:underline"
 >
 Apply Online →
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
 );
 })}

 {filteredDepartments.length === 0 && (
 <div className="text-center py-12 bg-white rounded-xl border border-gray-200 p-6">
 <p className="font-bold text-gray-800">No technical courses matched your search query.</p>
 <p className="text-xs text-gray-500 mt-1">Try another trade name or view All Technical Wings.</p>
 </div>
 )}
 </div>
 </section>

 {/* ════════════════════════════════════════════════════════════════
 7. OFFICIAL GOVERNMENT FOOTER
 ════════════════════════════════════════════════════════════════ */}
 <footer id="contact" className="bg-[#002B11] text-emerald-100 text-xs border-t-4 border-[#00401A] mt-auto">
 {/* Upper Footer Links */}
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
 <div className="space-y-3">
 <div className="flex items-center space-x-2.5">
 <div className="h-9 w-9 rounded-full bg-white text-[#00401A] flex items-center justify-center font-black">
 GTTI
 </div>
 <div>
 <h4 className="font-bold text-gray-900 text-sm">GTTI Rahim Yar Khan</h4>
 <p className="text-[10px] text-govt-green-400">Govt. Technical Training Institute</p>
 </div>
 </div>
 <p className="text-xs text-emerald-200 leading-relaxed">
 Established to equip the youth of Punjab with technical certifications, accredited vocational diplomas, and industrial competencies.
 </p>
 </div>

 <div className="space-y-2">
 <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider text-govt-gold">
 Institutional Links
 </h4>
 <ul className="space-y-1.5 text-xs text-emerald-200">
 <li>
 <a href="https://tevta.gop.pk" target="_blank" rel="noreferrer" className="hover:text-white flex items-center space-x-1">
 <span>TEVTA Punjab Official Portal</span>
 <ExternalLink className="h-3 w-3" />
 </a>
 </li>
 <li>
 <a href="https://pbte.edu.pk" target="_blank" rel="noreferrer" className="hover:text-white flex items-center space-x-1">
 <span>Punjab Board of Technical Education (PBTE)</span>
 <ExternalLink className="h-3 w-3" />
 </a>
 </li>
 <li>
 <a href="https://navttc.gov.pk" target="_blank" rel="noreferrer" className="hover:text-white flex items-center space-x-1">
 <span>NAVTTC Pakistan</span>
 <ExternalLink className="h-3 w-3" />
 </a>
 </li>
 <li>
 <a href="https://punjab.gov.pk" target="_blank" rel="noreferrer" className="hover:text-white flex items-center space-x-1">
 <span>Government of the Punjab Official</span>
 <ExternalLink className="h-3 w-3" />
 </a>
 </li>
 </ul>
 </div>

 <div className="space-y-2">
 <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider text-govt-gold">
 Campus Contact
 </h4>
 <p className="flex items-start space-x-2 text-emerald-200">
 <MapPin className="h-4 w-4 text-govt-gold shrink-0 mt-0.5" />
 <span>{siteSettings.address || 'Shahbaz Pur Road, Near Sports Complex, Rahim Yar Khan, Punjab, Pakistan'}</span>
 </p>
 <p className="flex items-center space-x-2 text-emerald-200">
 <Phone className="h-4 w-4 text-govt-gold shrink-0" />
 <span>{siteSettings.helpline || siteSettings.phone || '068-9230123 / 068-9230124'}</span>
 </p>
 <p className="flex items-center space-x-2 text-emerald-200">
 <Mail className="h-4 w-4 text-govt-gold shrink-0" />
 <span>{siteSettings.email || 'info@gtti.edu.pk'}</span>
 </p>
 </div>

 <div className="space-y-2">
 <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider text-govt-gold">
 RTI & Transparency
 </h4>
 <p className="text-[11px] text-emerald-200 leading-relaxed">
 Compliant with the Punjab Transparency and Right to Information Act. All admissions and merit lists are officially verified and auditable by TEVTA oversight authorities.
 </p>
 <div className="pt-2">
 <span className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-900 border border-emerald-700 text-govt-gold-200">
 Official Govt. Property
 </span>
 </div>
 </div>
 </div>

 {/* Bottom Copyright Bar */}
 <div className="border-t border-[#001F0C] py-4 bg-[#001F0C] text-govt-green-500 text-center text-[11px]">
 <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
 <p>© {new Date().getFullYear()} {siteSettings.institute_name || 'Government Technical Training Institute, Rahim Yar Khan'}. All rights reserved.</p>
 <p className="text-govt-green-500">Designed for TEVTA Punjab • Islamic Republic of Pakistan</p>
 </div>
 </div>
 </footer>
 </div>
 );
}
