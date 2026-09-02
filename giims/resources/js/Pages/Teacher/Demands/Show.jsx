import { Head, Link } from '@inertiajs/react';
import { Printer, ArrowLeft, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Show({ demand }) {
    const handlePrint = () => {
        window.print();
    };

    const batch = demand.batch;
    const course = batch?.course;
    const trade = course?.trade;
    const program = trade?.program;
    const dept = program?.department;
    const user = demand.user;

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
            <Head title={`Demand Letter #DEM-${demand.id} - GIIMS`} />

            {/* Print Header Controls (Hidden on Print) */}
            <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <Link
                    href={route('teacher.demands.index')}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Demands</span>
                </Link>

                <button
                    onClick={handlePrint}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white text-xs font-black shadow-md transition"
                >
                    <Printer className="h-4 w-4" />
                    <span>Print Requisition Letter</span>
                </button>
            </div>

            {/* Formal Letter Sheet (A4 Proportion) */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-12 print:shadow-none print:border-none print:p-6 text-gray-900 font-serif space-y-6">

                {/* Institute Header */}
                <div className="border-b-2 border-govt-green pb-4 text-center space-y-1">
                    <div className="flex items-center justify-center space-x-2">
                        <span className="text-[11px] font-black uppercase tracking-widest text-govt-green border border-govt-green/40 px-2.5 py-0.5 rounded-full font-sans">
                            TEVTA Punjab Government Institution
                        </span>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-gray-950 uppercase">
                        Govt. Technical Training Institute
                    </h1>
                    <p className="text-xs text-gray-700 font-sans">
                        Shahbazpur Road, Rahim Yar Khan • Phone: (068) 9230154 • Web: giims.gtti.edu.pk
                    </p>
                    <p className="text-xs font-black text-govt-gold-600 uppercase tracking-wider font-sans">
                        Department of Academic & Workshop Operations — Store Requisition Wing
                    </p>
                </div>

                {/* Reference & Date Bar */}
                <div className="flex items-center justify-between text-xs font-sans border-b border-gray-200 pb-3">
                    <div>
                        <span className="font-bold text-gray-500">INDENT REF NO:</span>{' '}
                        <strong className="font-mono text-gray-900">GTTI/STORE/DEM-{demand.id}/{new Date(demand.created_at).getFullYear()}</strong>
                    </div>
                    <div>
                        <span className="font-bold text-gray-500">DATE:</span>{' '}
                        <strong className="font-mono text-gray-900">{new Date(demand.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                    </div>
                </div>

                {/* Addressee */}
                <div className="text-xs font-sans space-y-0.5 pt-2">
                    <p className="font-bold">To,</p>
                    <p className="font-bold">The Store Officer / In-Charge Central Store,</p>
                    <p>Govt. Technical Training Institute,</p>
                    <p>Rahim Yar Khan.</p>
                </div>

                {/* Subject */}
                <div className="bg-gray-50 border-l-4 border-govt-green p-3 font-sans text-xs">
                    <strong className="text-gray-900 uppercase">SUBJECT: REQUISITION / INDENT FOR PRACTICAL & ACADEMIC CONSUMABLES</strong>
                </div>

                {/* Letter Body */}
                <div className="text-xs font-sans leading-relaxed space-y-3 text-gray-800">
                    <p>
                        Respected Sir,
                    </p>
                    <p>
                        It is submitted that the workshop materials and training consumables listed below are urgently required to conduct technical practical exercises and academic evaluation assessments for the enrolled trainees of:
                    </p>

                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
                        <div>
                            <span className="text-gray-500 font-bold">Class / Batch:</span>{' '}
                            <strong>{batch?.name}</strong>
                        </div>
                        <div>
                            <span className="text-gray-500 font-bold">Course / Trade:</span>{' '}
                            <strong>{course?.name} ({trade?.name})</strong>
                        </div>
                        <div>
                            <span className="text-gray-500 font-bold">Department:</span>{' '}
                            <strong>{dept?.name || 'Vocational Engineering'}</strong>
                        </div>
                        <div>
                            <span className="text-gray-500 font-bold">Training Session:</span>{' '}
                            <strong>{batch?.session_year}</strong>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase font-sans tracking-wider mb-2 text-gray-700">
                        Schedule of Demanded Consumable Materials
                    </h4>
                    <table className="w-full text-left text-xs font-sans border border-gray-300">
                        <thead className="bg-gray-100 border-b border-gray-300">
                            <tr>
                                <th className="p-2 border-r border-gray-300 w-12 text-center">Sr.</th>
                                <th className="p-2 border-r border-gray-300">Item Description & Specification</th>
                                <th className="p-2 border-r border-gray-300 text-center w-28">Requested Qty</th>
                                <th className="p-2 border-r border-gray-300 text-center w-28">Approved Qty</th>
                                <th className="p-2 text-center w-24">Store Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {demand.items?.map((it, idx) => (
                                <tr key={it.id}>
                                    <td className="p-2 border-r border-gray-200 text-center font-bold">{idx + 1}</td>
                                    <td className="p-2 border-r border-gray-200 font-bold text-gray-900">
                                        {it.inventory_item?.name}
                                        <span className="block font-normal text-[10px] text-gray-500 font-mono">
                                            SKU: {it.inventory_item?.sku || 'N/A'} • Unit: {it.inventory_item?.unit}
                                        </span>
                                    </td>
                                    <td className="p-2 border-r border-gray-200 text-center font-bold text-gray-800">
                                        {it.requested_qty} {it.inventory_item?.unit}
                                    </td>
                                    <td className="p-2 border-r border-gray-200 text-center font-bold text-emerald-800 bg-emerald-50/40">
                                        {demand.status === 'approved' ? `${it.approved_qty} ${it.inventory_item?.unit}` : 'Pending'}
                                    </td>
                                    <td className="p-2 text-center text-[10px] text-gray-400">
                                        {demand.status === 'approved' ? 'Issued' : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Letter Closing */}
                <div className="text-xs font-sans leading-relaxed pt-2">
                    <p>
                        It is therefore requested that the above-mentioned items may kindly be sanctioned and issued from the institute store to ensure seamless hands-on vocational training.
                    </p>
                </div>

                {/* Signatures & Official Stamps */}
                <div className="grid grid-cols-3 gap-4 pt-12 text-center text-xs font-sans">
                    <div className="border-t-2 border-gray-800 pt-2 space-y-0.5">
                        <p className="font-bold text-gray-900">{user?.name}</p>
                        <p className="text-[11px] text-gray-600">Instructor / Indenting Officer</p>
                        <p className="text-[10px] text-gray-500">GTTI Rahim Yar Khan</p>
                    </div>

                    <div className="border-t-2 border-gray-400 pt-2 space-y-0.5">
                        <p className="font-bold text-gray-700">Verified & Stock Checked</p>
                        <p className="text-[11px] text-gray-600">Storekeeper In-Charge</p>
                        <p className="text-[10px] text-gray-400">Official Seal</p>
                    </div>

                    <div className="border-t-2 border-govt-green pt-2 space-y-0.5">
                        <p className="font-bold text-gray-900">
                            {demand.approved_by ? demand.approved_by.name : 'Principal / DDO'}
                        </p>
                        <p className="text-[11px] text-gray-600">Sanctioning Authority</p>
                        <p className="text-[10px] text-emerald-700 font-bold">
                            {demand.status === 'approved' ? '✓ SANCTIONED & APPROVED' : 'Pending Formal Sanction'}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
