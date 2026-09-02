import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Package,
    Plus,
    Printer,
    FileText,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowLeft,
    Sparkles,
    Trash2,
    Check,
    AlertCircle,
    Building2,
    Users,
    Layers,
    Boxes
} from 'lucide-react';

export default function Index({ batches = [], consumables = [], demands = [] }) {
    const defaultBatch = batches[0];
    const [selectedBatchId, setSelectedBatchId] = useState(defaultBatch?.id || '');

    const selectedBatch = batches.find((b) => String(b.id) === String(selectedBatchId));
    const studentCount = selectedBatch?.enrollments?.length || 25;

    // Items in form
    const [selectedItems, setSelectedItems] = useState([
        {
            inventory_item_id: consumables[0]?.id || '',
            requested_qty: Math.max(1, Math.ceil(studentCount / 25)),
        }
    ]);

    const { data, setData, post, processing, errors, reset } = useForm({
        batch_id: selectedBatchId,
        items: selectedItems,
        remarks: '',
    });

    const handleBatchChange = (newBatchId) => {
        setSelectedBatchId(newBatchId);
        setData('batch_id', newBatchId);
    };

    const handleAddItem = () => {
        const unused = consumables.find((c) => !selectedItems.some((it) => String(it.inventory_item_id) === String(c.id)));
        const newItemId = unused ? unused.id : consumables[0]?.id;
        const newItems = [...selectedItems, { inventory_item_id: newItemId, requested_qty: 1 }];
        setSelectedItems(newItems);
        setData('items', newItems);
    };

    const handleRemoveItem = (index) => {
        if (selectedItems.length <= 1) return;
        const newItems = selectedItems.filter((_, i) => i !== index);
        setSelectedItems(newItems);
        setData('items', newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...selectedItems];
        newItems[index][field] = value;
        setSelectedItems(newItems);
        setData('items', newItems);
    };

    const handleAutoSuggest = () => {
        const count = studentCount || 20;
        const suggested = consumables.slice(0, 3).map((item) => {
            let qty = 1;
            const name = item.name.toLowerCase();
            const unit = item.unit.toLowerCase();

            if (name.includes('paper') || name.includes('ream')) {
                qty = Math.max(1, Math.ceil(count / 25));
            } else if (name.includes('sheet') || unit.includes('sheet') || unit.includes('page')) {
                qty = count * 2;
            } else if (name.includes('rod') || name.includes('electrode')) {
                qty = count * 2;
            } else {
                qty = Math.max(1, Math.ceil(count / 10));
            }

            return {
                inventory_item_id: item.id,
                requested_qty: qty,
            };
        });

        setSelectedItems(suggested);
        setData('items', suggested);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('teacher.demands.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('remarks');
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('teacher.dashboard')}
                            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-govt-green text-white">
                                    Store Requisitions
                                </span>
                                <span className="text-xs text-gray-500 font-semibold">
                                    TEVTA Punjab Academic Operations
                                </span>
                            </div>
                            <h2 className="text-xl font-black text-gray-900 mt-0.5 font-serif">
                                Teacher Material Demands & Indents
                            </h2>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Material Demands - Instructor Requisitions" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                {/* ────────────────────────────────────────────────────────
                    SECTION 1: CREATE NEW REQUISITION FORM
                ──────────────────────────────────────────────────────── */}
                <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                        <div>
                            <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
                                <Package className="h-5 w-5 text-govt-green" />
                                <span>Create New Material Demand / Workshop Requisition</span>
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Requisition practical workshop materials and stationery based on batch student strength.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleAutoSuggest}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-govt-gold/15 hover:bg-govt-gold/25 text-amber-900 font-bold text-xs border border-govt-gold/30 transition shadow-sm"
                        >
                            <Sparkles className="h-3.5 w-3.5 text-govt-gold" />
                            <span>Auto-Suggest by Student Count ({studentCount} Trainees)</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Batch Selector */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Assigned Batch <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={selectedBatchId}
                                    onChange={(e) => handleBatchChange(e.target.value)}
                                    className="w-full text-xs rounded-xl border-gray-300 text-gray-900 font-semibold focus:ring-govt-green focus:border-govt-green"
                                >
                                    {batches.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name} ({b.course?.name}) — {b.enrollments?.length || 0} Enrolled Trainees
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Selected Batch Strength</p>
                                    <p className="font-extrabold text-sm text-gray-900">
                                        {studentCount} Active Trainees
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Program</p>
                                    <p className="font-semibold text-gray-700">
                                        {selectedBatch?.course?.trade?.program?.name || 'Vocational Training'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Demanded Consumables Items Table */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Demanded Consumable Items <span className="text-rose-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="inline-flex items-center space-x-1 text-xs font-bold text-govt-green hover:underline"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>Add Another Item</span>
                                </button>
                            </div>

                            <div className="space-y-2.5">
                                {selectedItems.map((row, idx) => {
                                    const inv = consumables.find((c) => String(c.id) === String(row.inventory_item_id));
                                    return (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs"
                                        >
                                            <div className="flex-1">
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                                    Store Consumable Item
                                                </label>
                                                <select
                                                    value={row.inventory_item_id}
                                                    onChange={(e) => handleItemChange(idx, 'inventory_item_id', e.target.value)}
                                                    className="w-full text-xs rounded-xl border-gray-300 text-gray-900 font-semibold focus:ring-govt-green focus:border-govt-green"
                                                >
                                                    {consumables.map((c) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.name} ({c.quantity_in_stock} {c.unit} in store)
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="w-full sm:w-36">
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                                    Requested Qty ({inv?.unit || 'units'})
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    required
                                                    value={row.requested_qty}
                                                    onChange={(e) => handleItemChange(idx, 'requested_qty', parseInt(e.target.value) || 1)}
                                                    className="w-full text-xs rounded-xl border-gray-300 text-gray-900 font-bold focus:ring-govt-green focus:border-govt-green"
                                                />
                                            </div>

                                            <div className="sm:pt-5 flex items-center justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(idx)}
                                                    disabled={selectedItems.length <= 1}
                                                    className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 transition"
                                                    title="Remove Item"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Special Justification */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Special Justification / Assessment Remarks (Optional)
                            </label>
                            <textarea
                                rows="2"
                                value={data.remarks}
                                onChange={(e) => setData('remarks', e.target.value)}
                                placeholder="e.g. Consumables required for upcoming Mid-Term Practical Project evaluation..."
                                className="w-full text-xs rounded-xl border-gray-300 text-gray-900 focus:ring-govt-green focus:border-govt-green"
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-govt-green to-emerald-700 hover:from-govt-green-light hover:to-emerald-600 disabled:opacity-50 text-white font-bold text-xs transition shadow-md shadow-govt-green/20 flex items-center space-x-2"
                            >
                                <FileText className="h-4 w-4" />
                                <span>{processing ? 'Submitting...' : 'Submit Demand & Generate Formal Letter'}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* ────────────────────────────────────────────────────────
                    SECTION 2: MATERIAL DEMANDS REQUISITION HISTORY
                ──────────────────────────────────────────────────────── */}
                <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div>
                            <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
                                <Boxes className="h-5 w-5 text-govt-green" />
                                <span>Submitted Requisition Indents & Approval Status</span>
                            </h3>
                            <p className="text-xs text-gray-500">
                                Track store approvals, auto-consumed quantities, and download formal letters.
                            </p>
                        </div>
                    </div>

                    {demands.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-xs">
                            No material demands submitted yet. Fill out the form above to requisition items from the central store.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="text-gray-500 border-b border-gray-100">
                                        <th className="pb-3 font-semibold">Demand Ref</th>
                                        <th className="pb-3 font-semibold">Batch & Course</th>
                                        <th className="pb-3 font-semibold">Demanded Items Breakdown</th>
                                        <th className="pb-3 font-semibold">Status</th>
                                        <th className="pb-3 font-semibold text-right">Formal Letter</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                                    {demands.map((dem) => {
                                        const isApproved = dem.status === 'approved';
                                        const isPending = dem.status === 'pending';
                                        const isRejected = dem.status === 'rejected';

                                        return (
                                            <tr key={dem.id} className="hover:bg-gray-50 transition">
                                                <td className="py-3 font-mono font-bold text-gray-900">
                                                    #DEM-{dem.id}
                                                    <p className="text-[10px] text-gray-400 font-normal">
                                                        {new Date(dem.created_at).toLocaleDateString()}
                                                    </p>
                                                </td>
                                                <td className="py-3">
                                                    <p className="font-bold text-gray-900">{dem.batch?.name}</p>
                                                    <p className="text-[10px] text-gray-500">{dem.batch?.course?.name}</p>
                                                </td>
                                                <td className="py-3">
                                                    <div className="space-y-1">
                                                        {dem.items?.map((it) => (
                                                            <div key={it.id} className="flex items-center space-x-2 text-[11px]">
                                                                <span className="font-semibold text-gray-800">
                                                                    {it.inventory_item?.name}:
                                                                </span>
                                                                <span className="text-gray-500">
                                                                    Req: <strong className="text-gray-700">{it.requested_qty}</strong>
                                                                </span>
                                                                {isApproved && (
                                                                    <>
                                                                        <span className="text-emerald-700 font-bold">
                                                                            • Appr: {it.approved_qty}
                                                                        </span>
                                                                        <span className="text-indigo-700">
                                                                            • Consumed: {it.consumed_qty}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    {isApproved && (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                                            <span>Approved</span>
                                                        </span>
                                                    )}
                                                    {isPending && (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                                                            <Clock className="h-3 w-3 text-amber-600" />
                                                            <span>Pending Store Review</span>
                                                        </span>
                                                    )}
                                                    {isRejected && (
                                                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                                                            <XCircle className="h-3 w-3 text-rose-600" />
                                                            <span>Declined</span>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <Link
                                                        href={route('teacher.demands.show', dem.id)}
                                                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-govt-green-50 hover:text-govt-green text-gray-700 text-xs font-bold transition border border-gray-200"
                                                    >
                                                        <Printer className="h-3.5 w-3.5" />
                                                        <span>Print Letter</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
