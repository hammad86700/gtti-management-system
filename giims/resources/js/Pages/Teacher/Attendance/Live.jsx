import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
 MapPin,
 Navigation,
 ShieldCheck,
 CheckCircle2,
 Clock,
 XCircle,
 UserCheck,
 Users,
 Layers,
 ArrowLeft,
 Sparkles,
 RefreshCw,
 Sliders,
 Building2,
 Compass,
 Check,
 AlertCircle,
 Key,
 Smartphone,
 Copy
} from 'lucide-react';

export default function Live({
 batch,
 session,
 trainees = [],
 subjects = [],
 locationPresets = []
}) {
 const [filter, setFilter] = useState('all');
 const [isLocating, setIsLocating] = useState(false);
 const [gpsMessage, setGpsMessage] = useState('');
 const [isGeneratingPin, setIsGeneratingPin] = useState(false);
 const [copiedPin, setCopiedPin] = useState(false);

 const handleGeneratePin = () => {
     setIsGeneratingPin(true);
     router.post(route('teacher.attendance.generate-pin', session.id), {}, {
         preserveScroll: true,
         onFinish: () => setIsGeneratingPin(false),
     });
 };

 const handleCopyPin = (pin) => {
     if (navigator.clipboard) {
         navigator.clipboard.writeText(pin);
         setCopiedPin(true);
         setTimeout(() => setCopiedPin(false), 2000);
     }
 };

 // Geofence configuration form
 const { data, setData, post, processing } = useForm({
 location_name: session?.location_name || locationPresets[0]?.name || 'Computer Lab 1 & 2 (IT Wing)',
 latitude: session?.latitude || locationPresets[0]?.latitude || 28.4212,
 longitude: session?.longitude || locationPresets[0]?.longitude || 70.3023,
 radius_meters: session?.radius_meters || 150,
 subject_id: session?.subject_id || '',
 is_geofence_active: session?.is_geofence_active ?? true,
 });

 // Handle preset selection
 const handlePresetChange = (presetName) => {
 const found = locationPresets.find((p) => p.name === presetName);
 if (found) {
 setData({
 ...data,
 location_name: found.name,
 latitude: found.latitude,
 longitude: found.longitude,
 radius_meters: found.radius_meters,
 });
 setGpsMessage(`Loaded preset for ${found.name}`);
 }
 };

 // Grab current teacher device location on the fly
 const handleUseCurrentLocation = () => {
 if (!navigator.geolocation) {
 setGpsMessage('Geolocation is not supported by your browser.');
 return;
 }

 setIsLocating(true);
 setGpsMessage('Calibrating device GPS coordinates...');

 navigator.geolocation.getCurrentPosition(
 (pos) => {
 setIsLocating(false);
 setData({
 ...data,
 latitude: Number(pos.coords.latitude.toFixed(7)),
 longitude: Number(pos.coords.longitude.toFixed(7)),
 location_name: data.location_name.includes('Calibrated')
 ? data.location_name
 : `${data.location_name} (GPS Calibrated)`,
 });
 setGpsMessage(`âœ“ Captured device GPS (Accuracy: Â±${Math.round(pos.coords.accuracy)}m)`);
 },
 (err) => {
 setIsLocating(false);
 setGpsMessage(`GPS Error: ${err.message}. Ensure location permissions are allowed.`);
 },
 { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
 );
 };

 // Save/Update Geofence Zone
 const handleSaveGeofence = (e) => {
 e.preventDefault();
 post(route('teacher.attendance.start-session', batch.id), {
 preserveScroll: true,
 });
 };

 // Quick manual override for a trainee
 const handleManualStatus = (studentProfileId, newStatus) => {
 router.post(route('teacher.attendance.manual-update', batch.id), {
 session_id: session.id,
 student_profile_id: studentProfileId,
 status: newStatus,
 }, {
 preserveScroll: true,
 });
 };

 // Counts
 const presentCount = trainees.filter((t) => t.status === 'present').length;
 const gpsCount = trainees.filter((t) => t.method === 'gps').length;
 const pinCount = trainees.filter((t) => t.method === 'pin').length;
 const manualCount = trainees.filter((t) => t.method === 'manual').length;
 const absentCount = trainees.filter((t) => t.status === 'absent').length;
 const unmarkedCount = trainees.filter((t) => t.status === 'unmarked').length;

 const filteredTrainees = trainees.filter((t) => {
 if (filter === 'gps') return t.method === 'gps';
 if (filter === 'pin') return t.method === 'pin';
 if (filter === 'manual') return t.method === 'manual';
 if (filter === 'absent') return t.status === 'absent';
 if (filter === 'unmarked') return t.status === 'unmarked';
 return true;
 });

 return (
 <AuthenticatedLayout
 header={
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div className="flex items-center space-x-3">
 <Link
 href={route('teacher.dashboard')}
 className="p-2 rounded-xl bg-govt-cream-300 hover:bg-slate-200 :bg-govt-cream-300 text-gray-700 transition"
 >
 <ArrowLeft className="h-4 w-4" />
 </Link>
 <div>
 <div className="flex items-center space-x-2">
 <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white">
 Live Geofence
 </span>
 <span className="text-xs text-gray-500 font-semibold">
 {batch.name} â€¢ {batch.course?.name}
 </span>
 </div>
 <h2 className="text-xl font-black text-gray-900 mt-0.5">
 Classroom Attendance & GPS Zone Manager
 </h2>
 </div>
 </div>

 <div className="flex items-center space-x-2">
 <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-govt-green-500/10 text-govt-green-500 border border-govt-green-200">
 <span className="h-2 w-2 rounded-full bg-govt-green-500 animate-pulse"></span>
 <span>Session Active</span>
 </span>
 </div>
 </div>
 }
 >
 <Head title={`Live Attendance - ${batch.name}`} />

 <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

 {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
     CLASSROOM MOBILE SELF-ATTENDANCE PIN CARD
 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
 <div className="p-6 rounded-2xl bg-gradient-to-br from-govt-green via-[#003816] to-[#00260e] text-white border-2 border-emerald-600/40 shadow-xl relative overflow-hidden">
     <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-govt-gold/10 blur-3xl pointer-events-none" />

     <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="space-y-2">
             <div className="flex items-center space-x-2">
                 <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-govt-gold/20 text-govt-gold-300 border border-govt-gold/40">
                     <Smartphone className="h-3 w-3" />
                     <span>Mobile Self-Attendance</span>
                 </span>
                 {session?.daily_pin && (
                     <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                         <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                         <span>PIN Active Today</span>
                     </span>
                 )}
             </div>
             <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white font-serif">
                 Classroom Self-Attendance PIN
             </h3>
             <p className="text-xs text-green-100 max-w-xl leading-relaxed">
                 Trainees can open the GIIMS Student Mobile App, tap <strong className="text-white font-bold">"Mark Today's Attendance"</strong>, and enter this secure 4-digit code to instantly record their presence.
             </p>
         </div>

         {/* PIN Display or Enable Action */}
         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
             {session?.daily_pin ? (
                 <div className="flex items-center gap-3 bg-black/40 border border-white/20 p-3.5 sm:p-4 rounded-2xl backdrop-blur-md">
                     <div className="text-center px-4">
                         <p className="text-[10px] font-black uppercase tracking-widest text-govt-gold-300">
                             Today's Class PIN
                         </p>
                         <div className="text-4xl sm:text-5xl font-mono font-black tracking-[0.25em] text-white my-1 select-all drop-shadow-md">
                             {session.daily_pin}
                         </div>
                         <p className="text-[10px] text-green-200">
                             {pinCount} {pinCount === 1 ? 'trainee' : 'trainees'} checked in via PIN
                         </p>
                     </div>

                     <div className="flex flex-col gap-2 border-l border-white/15 pl-3">
                         <button
                             type="button"
                             onClick={() => handleCopyPin(session.daily_pin)}
                             className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs font-bold flex items-center space-x-1"
                             title="Copy PIN"
                         >
                             {copiedPin ? <Check className="h-4 w-4 text-govt-gold-300" /> : <Copy className="h-4 w-4" />}
                             <span className="text-[11px]">{copiedPin ? 'Copied' : 'Copy'}</span>
                         </button>
                         <button
                             type="button"
                             onClick={handleGeneratePin}
                             disabled={isGeneratingPin}
                             className="p-2.5 rounded-xl bg-govt-gold/20 hover:bg-govt-gold/30 text-govt-gold-200 transition text-xs font-bold flex items-center space-x-1"
                             title="Generate New PIN"
                         >
                             <RefreshCw className={`h-4 w-4 ${isGeneratingPin ? 'animate-spin' : ''}`} />
                             <span className="text-[11px]">New PIN</span>
                         </button>
                     </div>
                 </div>
             ) : (
                 <button
                     type="button"
                     onClick={handleGeneratePin}
                     disabled={isGeneratingPin}
                     className="px-6 py-4 rounded-2xl bg-gradient-to-r from-govt-gold to-amber-500 hover:from-govt-gold-light hover:to-amber-400 text-gray-950 font-black text-sm tracking-wide transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2.5 transform active:scale-95 disabled:opacity-75"
                 >
                     <Key className={`h-5 w-5 ${isGeneratingPin ? 'animate-spin' : ''}`} />
                     <span>{isGeneratingPin ? 'Generating PIN...' : 'Enable Mobile Self-Attendance'}</span>
                 </button>
             )}
         </div>
     </div>
 </div>

 {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 1. GEOFENCE ZONE CALIBRATION PANEL
 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
 <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm space-y-5">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100 ">
 <div className="flex items-center space-x-3">
 <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
 <MapPin className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-gray-900 ">
 Designated Classroom / Lab Geofence Area
 </h3>
 <p className="text-xs text-gray-500 ">
 Set the lab boundary where students are permitted to mark attendance from their mobile or browser
 </p>
 </div>
 </div>

 <div className="flex items-center space-x-2">
 <button
 type="button"
 onClick={handleUseCurrentLocation}
 disabled={isLocating}
 className="px-3.5 py-2 rounded-xl bg-govt-green-50 hover:bg-indigo-100 :bg-indigo-900/60 text-govt-green text-xs font-extrabold transition border border-indigo-200 flex items-center space-x-1.5 shadow-sm"
 >
 <Compass className={`h-3.5 w-3.5 ${isLocating ? 'animate-spin' : ''}`} />
 <span>{isLocating ? 'Detecting...' : 'Use My Device GPS Location'}</span>
 </button>
 </div>
 </div>

 {gpsMessage && (
 <p className="text-xs font-semibold text-govt-green-500 bg-govt-green-50 p-2.5 rounded-xl border border-indigo-200 ">
 {gpsMessage}
 </p>
 )}

 <form onSubmit={handleSaveGeofence} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {/* Preset Dropdown */}
 <div>
 <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
 Quick Area Preset
 </label>
 <select
 value={data.location_name}
 onChange={(e) => handlePresetChange(e.target.value)}
 className="w-full text-xs rounded-xl border-gray-200 text-gray-900 focus:ring-govt-green-400 focus:border-govt-green-500"
 >
 {locationPresets.map((p) => (
 <option key={p.name} value={p.name}>
 {p.name} ({p.radius_meters}m)
 </option>
 ))}
 <option value={data.location_name}>Custom Area</option>
 </select>
 </div>

 {/* Location Name */}
 <div>
 <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
 Area / Room Name *
 </label>
 <input
 type="text"
 required
 value={data.location_name}
 onChange={(e) => setData('location_name', e.target.value)}
 className="w-full text-xs rounded-xl border-gray-200 text-gray-900 focus:ring-govt-green-400 focus:border-govt-green-500"
 />
 </div>

 {/* Coordinates */}
 <div>
 <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
 Center Coordinates (Lat, Lng)
 </label>
 <div className="grid grid-cols-2 gap-1">
 <input
 type="number"
 step="any"
 required
 value={data.latitude}
 onChange={(e) => setData('latitude', parseFloat(e.target.value))}
 placeholder="Latitude"
 className="text-[11px] rounded-xl border-gray-200 text-gray-900 "
 />
 <input
 type="number"
 step="any"
 required
 value={data.longitude}
 onChange={(e) => setData('longitude', parseFloat(e.target.value))}
 placeholder="Longitude"
 className="text-[11px] rounded-xl border-gray-200 text-gray-900 "
 />
 </div>
 </div>

 {/* Radius Selector */}
 <div>
 <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
 Allowed Boundary Radius
 </label>
 <select
 value={data.radius_meters}
 onChange={(e) => setData('radius_meters', parseInt(e.target.value))}
 className="w-full text-xs rounded-xl border-gray-200 text-gray-900 focus:ring-govt-green-400 focus:border-govt-green-500"
 >
 <option value={50}>50 Meters (Strict Classroom)</option>
 <option value={100}>100 Meters (Standard Lab)</option>
 <option value={150}>150 Meters (Workshop Wing)</option>
 <option value={200}>200 Meters (Block Perimeter)</option>
 <option value={350}>350 Meters (Full GTTI Campus)</option>
 </select>
 </div>
 </div>

 <div className="flex items-center justify-between pt-2">
 <div className="flex items-center space-x-2 text-xs text-gray-500 ">
 <ShieldCheck className="h-4 w-4 text-govt-green-500" />
 <span>Students outside {data.radius_meters}m will be prevented from checking in automatically.</span>
 </div>

 <button
 type="submit"
 disabled={processing}
 className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-govt-green-500 text-white font-extrabold text-xs transition shadow-md shadow-indigo-600/20 flex items-center space-x-1.5"
 >
<Navigation className="h-3.5 w-3.5" />
 <span>{processing ? 'Applying...' : 'Apply & Activate Geofence'}</span>
 </button>
 </div>
 </form>
 </div>

 {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 2. ATTENDANCE METRIC CARDS
 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
     <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
         <p className="text-[11px] text-gray-500 font-semibold">Total Trainees</p>
         <p className="text-2xl font-black text-gray-900">{trainees.length}</p>
         <p className="text-[10px] text-gray-500">Enrolled in Batch</p>
     </div>

     <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
         <p className="text-[11px] text-govt-green font-semibold">Present Today</p>
         <p className="text-2xl font-black text-govt-green">{presentCount}</p>
         <p className="text-[10px] text-emerald-700">
             {trainees.length > 0 ? `${Math.round((presentCount / trainees.length) * 100)}% Attendance` : '0%'}
         </p>
     </div>

     <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
         <p className="text-[11px] text-teal-600 font-semibold">PIN Verified</p>
         <p className="text-2xl font-black text-teal-600">{pinCount}</p>
         <p className="text-[10px] text-teal-700">Mobile Self-Mark</p>
     </div>

     <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
         <p className="text-[11px] text-indigo-600 font-semibold">GPS Verified</p>
         <p className="text-2xl font-black text-indigo-600">{gpsCount}</p>
         <p className="text-[10px] text-indigo-700">Self Check-In (Lab)</p>
     </div>

     <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
         <p className="text-[11px] text-blue-600 font-semibold">Teacher Manual</p>
         <p className="text-2xl font-black text-blue-600">{manualCount}</p>
         <p className="text-[10px] text-blue-700">Instructor Marked</p>
     </div>

     <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
         <p className="text-[11px] text-amber-600 font-semibold">Awaiting / Absent</p>
         <p className="text-2xl font-black text-amber-600">{unmarkedCount + absentCount}</p>
         <p className="text-[10px] text-amber-700">Pending Attendance</p>
     </div>
 </div>

 {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 3. LIVE TRAINEE ATTENDANCE & OVERRIDE TABLE
 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
 <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm space-y-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 ">
 <div>
 <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
 <Users className="h-5 w-5 text-govt-green-500" />
 <span>Batch Trainee Roll Call & Live GPS Verification</span>
 </h3>
 <p className="text-xs text-gray-500 ">
 Students checking in via GPS automatically update here. You can manually override or mark any student at any time.
 </p>
 </div>

 {/* Filter Tabs */}
 <div className="flex items-center bg-govt-cream-300 p-1 rounded-2xl text-xs font-bold">
 <button
 onClick={() => setFilter('all')}
 className={`px-3 py-1 rounded-xl transition ${
 filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
 }`}
 >
 All ({trainees.length})
 </button>
					<button
						onClick={() => setFilter('pin')}
						className={`px-3 py-1 rounded-xl transition ${
							filter === 'pin' ? 'bg-teal-700 text-white shadow-sm' : 'text-gray-500'
						}`}
					>
						PIN ({pinCount})
					</button>
					<button
						onClick={() => setFilter('gps')}
 className={`px-3 py-1 rounded-xl transition ${
 filter === 'gps' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500'
 }`}
 >
 GPS Verified ({gpsCount})
 </button>
 <button
 onClick={() => setFilter('unmarked')}
 className={`px-3 py-1 rounded-xl transition ${
 filter === 'unmarked' ? 'bg-govt-gold text-gray-600 shadow-sm' : 'text-gray-500'
 }`}
 >
 Unmarked ({unmarkedCount})
 </button>
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead>
 <tr className="text-gray-500 border-b border-gray-100 ">
 <th className="pb-3 font-semibold">Trainee Name & Roll</th>
 <th className="pb-3 font-semibold">Current Status</th>
 <th className="pb-3 font-semibold">Verification Method</th>
 <th className="pb-3 font-semibold">Check-In Time</th>
 <th className="pb-3 font-semibold text-right">Teacher Manual Override</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
 {filteredTrainees.map((trainee) => {
 const isGps = trainee.method === 'gps';
 const isPresent = trainee.status === 'present';
 const isLate = trainee.status === 'late';
 const isAbsent = trainee.status === 'absent';
 const isLeave = trainee.status === 'leave';

 return (
 <tr key={trainee.student_profile_id} className="hover:bg-govt-green-50 :bg-white/30 transition">
 {/* Trainee Info */}
 <td className="py-3.5">
 <div className="flex items-center space-x-3">
 <div className="h-8 w-8 rounded-xl bg-govt-cream-300 font-black text-gray-800 flex items-center justify-center text-xs shrink-0">
 {trainee.name.substring(0, 2).toUpperCase()}
 </div>
 <div>
 <p className="font-bold text-gray-900 ">
 {trainee.name}
 </p>
 <p className="font-mono text-[10px] text-gray-500">
 {trainee.enrollment_number} â€¢ S/D of {trainee.father_name}
 </p>
 </div>
 </div>
 </td>

 {/* Status Badge */}
 <td className="py-3.5">
 {isPresent && (
 <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-govt-green-500/20 text-emerald-700 border border-govt-green-200 inline-flex items-center space-x-1">
 <Check className="h-3 w-3" />
 <span>Present</span>
 </span>
 )}
 {isLate && (
 <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-govt-gold-50 text-amber-700 border border-govt-gold-200">
 Late
 </span>
 )}
 {isAbsent && (
 <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
 Absent
 </span>
 )}
 {isLeave && (
 <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-700 border border-blue-500/30">
 Official Leave
 </span>
 )}
 {trainee.status === 'unmarked' && (
 <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold text-gray-500 bg-govt-cream-300 ">
 Awaiting
 </span>
 )}
 </td>

 {/* Verification Method & Distance */}
 <td className="py-3.5">
 {isGps ? (
 <div className="flex items-center space-x-1.5 text-govt-green-500 font-bold">
 <MapPin className="h-3.5 w-3.5" />
 <span>GPS Verified ({trainee.distance_meters}m)</span>
 </div>
 ) : trainee.method === 'pin' ? (
 	<div className="flex items-center space-x-1.5 text-teal-700 font-bold">
 		<Key className="h-3.5 w-3.5" />
 		<span>Class PIN Verified</span>
 	</div>
 ) : trainee.method === 'manual' ? (
 <span className="text-gray-500 text-[11px] font-semibold">Teacher Manual</span>
 ) : (
 <span className="text-gray-500 italic text-[11px]">Not checked in</span>
 )}
 </td>

 {/* Timestamp */}
 <td className="py-3.5 font-mono text-[11px] text-gray-500 ">
 {trainee.marked_at || 'â€”'}
 </td>

 {/* Action Buttons for Teacher Override */}
 <td className="py-3.5 text-right">
 <div className="inline-flex items-center space-x-1">
 <button
 type="button"
 onClick={() => handleManualStatus(trainee.student_profile_id, 'present')}
 className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${
 isPresent && !isGps
 ? 'bg-govt-green text-white shadow-sm'
 : 'bg-govt-cream-300 hover:bg-emerald-50 :bg-emerald-950 text-gray-700 hover:text-govt-green-500'
 }`}
 >
 Present
 </button>
 <button
 type="button"
 onClick={() => handleManualStatus(trainee.student_profile_id, 'late')}
 className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${
 isLate
 ? 'bg-govt-gold text-gray-600 shadow-sm'
 : 'bg-govt-cream-300 hover:bg-amber-50 :bg-amber-950 text-gray-700 hover:text-amber-600'
 }`}
 >
 Late
 </button>
 <button
 type="button"
 onClick={() => handleManualStatus(trainee.student_profile_id, 'absent')}
 className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${
 isAbsent
 ? 'bg-rose-600 text-white shadow-sm'
 : 'bg-govt-cream-300 hover:bg-rose-50 :bg-rose-950 text-gray-700 hover:text-rose-600'
 }`}
 >
 Absent
 </button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </AuthenticatedLayout>
 );
}
