import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Archive,
    Package,
    AlertTriangle,
    PlusCircle,
    ArrowDownRight,
    ArrowUpRight,
    CheckCircle2,
    Search,
    Filter,
    Boxes,
    Wrench,
    Layers,
    Clock,
    X,
    Inbox,
    ShieldAlert,
    ShieldCheck,
    MapPin,
    UserCheck,
    FileText,
    Printer,
    Check
} from 'lucide-react';

export default function Index({
    items = [],
    batches = [],
    teachers = [],
    demands = [],
    allocations = []
}) {
    const [mainTab, setMainTab] = useState('catalog'); // 'catalog' | 'demands' | 'allocations'
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'low_stock' | 'consumable' | 'fixed_asset'
    const [searchQuery, setSearchQuery] = useState('');
    const [activeModalItem, setActiveModalItem] = useState(null); // Item object
    const [modalType, setModalType] = useState('stock_in'); // 'stock_in' | 'stock_out'

    const fixedAssets = items.filter((i) => i.category === 'fixed_asset');

    // Add Item Form
    const {
        data: newItem,
        setData: setNewItem,
        post: postNewItem,
        processing: addingItem,
        errors: itemErrors,
        reset: resetNewItem,
        recentlySuccessful: itemAdded,
    } = useForm({
        name: '',
        sku: '',
        category: 'consumable',
        quantity_in_stock: 0,
        unit: 'pcs',
        min_threshold: 5,
    });

    // Transaction Form
    const {
        data: transactionData,
        setData: setTransactionData,
        post: postTransaction,
        processing: transacting,
        errors: transErrors,
        reset: resetTransaction,
    } = useForm({
        transaction_type: 'stock_in',
        quantity: 1,
        batch_id: batches[0]?.id || '',
        remarks: '',
    });

    // Asset Allocation Form
    const {
        data: allocData,
        setData: setAllocData,
        post: postAlloc,
        processing: allocating,
        reset: resetAlloc,
        errors: allocErrors,
    } = useForm({
        user_id: teachers[0]?.id || '',
        inventory_item_id: fixedAssets[0]?.id || '',
        room_location: '',
        quantity: 1,
        remarks: '',
    });

    const handleCreateItem = (e) => {
        e.preventDefault();
        postNewItem(route('admin.inventory.store'), {
            onSuccess: () => resetNewItem(),
        });
    };

    const handleCreateAllocation = (e) => {
        e.preventDefault();
        postAlloc(route('admin.inventory.allocate-asset'), {
            preserveScroll: true,
            onSuccess: () => resetAlloc('room_location', 'remarks'),
        });
    };

    const handleApproveDemand = (demandId, status = 'approved') => {
        router.post(
            route('admin.inventory.demands.approve', { id: demandId }),
            { status },
            { preserveScroll: true }
        );
    };

    const handleReturnAsset = (allocationId) => {
        router.post(
            route('admin.assets.return', { id: allocationId }),
            {},
            { preserveScroll: true }
        );
    };

    const handleOpenModal = (item, type) => {
        setActiveModalItem(item);
        setModalType(type);
        setTransactionData({
            transaction_type: type,
            quantity: 1,
            batch_id: batches[0]?.id || '',
            remarks: '',
        });
    };

    const handleCloseModal = () => {
        setActiveModalItem(null);
        resetTransaction();
    };

    const handleSubmitTransaction = (e) => {
        e.preventDefault();
        if (!activeModalItem) return;

        postTransaction(route('admin.inventory.transaction', { id: activeModalItem.id }), {
            preserveScroll: true,
            onSuccess: () => handleCloseModal(),
        });
    };

    // Filter items
    const filteredItems = items.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;

        if (statusFilter === 'low_stock') {
            return item.quantity_in_stock <= item.min_threshold;
        }
        if (statusFilter === 'consumable') {
            return item.category === 'consumable';
        }
        if (statusFilter === 'fixed_asset') {
            return item.category === 'fixed_asset';
        }
        return true;
    });

    const lowStockCount = items.filter((i) => i.quantity_in_stock <= i.min_threshold).length;
    const consumableCount = items.filter((i) => i.category === 'consumable').length;
    const assetCount = items.filter((i) => i.category === 'fixed_asset').length;
    const pendingDemandsCount = demands.filter((d) => d.status === 'pending').length;

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-2xl bg-govt-green-500/10 text-govt-green border border-emerald-500/20">
                            <Archive className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold leading-tight text-gray-800 font-serif">
                                Workshop Inventory & Store Ledger
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Track consumable supplies, tools, fixed machinery assets, and faculty material demands
                            </p>
                        </div>
                    </div>

                    {lowStockCount > 0 && (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>{lowStockCount} Low Stock Alerts</span>
                        </span>
                    )}
                </div>
            }
        >
            <Head title="Store Inventory - GIIMS Admin" />

            <div className="space-y-6">
                {/* METRICS ROW */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Total Catalog Items</span>
                            <Boxes className="h-4 w-4 text-indigo-500" />
                        </div>
                        <p className="text-2xl font-black text-gray-900 mt-2">{items.length}</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Consumable Supplies</span>
                            <Package className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-black text-blue-600 mt-2">{consumableCount}</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Fixed Workshop Assets</span>
                            <Wrench className="h-4 w-4 text-purple-500" />
                        </div>
                        <p className="text-2xl font-black text-purple-600 mt-2">{assetCount}</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Low Stock Alerts</span>
                            <AlertTriangle className="h-4 w-4 text-rose-500" />
                        </div>
                        <p className={`text-2xl font-black mt-2 ${lowStockCount > 0 ? 'text-rose-600' : 'text-gray-500'}`}>
                            {lowStockCount}
                        </p>
                    </div>
                </div>

                {/* MAIN NAVIGATION TABS */}
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-2xl border border-gray-200 shadow-sm text-xs font-bold w-fit">
                    <button
                        type="button"
                        onClick={() => setMainTab('catalog')}
                        className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 ${
                            mainTab === 'catalog' ? 'bg-govt-green text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Boxes className="h-4 w-4" />
                        <span>Store Catalog & Ledger ({items.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setMainTab('demands')}
                        className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 ${
                            mainTab === 'demands' ? 'bg-govt-green text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Package className="h-4 w-4" />
                        <span>Material Demands Review</span>
                        {pendingDemandsCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-gray-950 font-black">
                                {pendingDemandsCount} Pending
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setMainTab('allocations')}
                        className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 ${
                            mainTab === 'allocations' ? 'bg-govt-green text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <ShieldCheck className="h-4 w-4" />
                        <span>Fixed Asset Property Handover ({allocations.length})</span>
                    </button>
                </div>

                {/* TAB 1: STORE CATALOG & STOCK LEDGER */}
                {mainTab === 'catalog' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* LEFT COLUMN (4 Cols): ADD ITEM FORM */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
                                <div className="flex items-center space-x-2.5 pb-3 border-b border-gray-100">
                                    <div className="h-8 w-8 rounded-xl bg-govt-green-500/10 text-govt-green flex items-center justify-center font-bold">
                                        <PlusCircle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 font-serif">
                                            Add New Item to Catalog
                                        </h3>
                                        <p className="text-[11px] text-gray-500">
                                            Register workshop consumable or asset
                                        </p>
                                    </div>
                                </div>

                                {itemAdded && (
                                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                        <span>New item added to inventory catalog!</span>
                                    </div>
                                )}

                                <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">
                                            Item Name / Specification <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. A4 Paper Ream, Welding Electrode, Vernier Caliper..."
                                            value={newItem.name}
                                            onChange={(e) => setNewItem('name', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:ring-govt-green focus:border-govt-green"
                                        />
                                        {itemErrors.name && (
                                            <p className="text-[11px] text-rose-500 mt-1">{itemErrors.name}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold text-gray-700 mb-1">
                                                SKU / Code
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. STAT-001"
                                                value={newItem.sku}
                                                onChange={(e) => setNewItem('sku', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:ring-govt-green focus:border-govt-green"
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-bold text-gray-700 mb-1">
                                                Category <span className="text-rose-500">*</span>
                                            </label>
                                            <select
                                                value={newItem.category}
                                                onChange={(e) => setNewItem('category', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:ring-govt-green focus:border-govt-green"
                                            >
                                                <option value="consumable">Consumable Supply</option>
                                                <option value="fixed_asset">Fixed Workshop Asset</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block font-bold text-gray-700 mb-1">
                                                Opening Qty
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={newItem.quantity_in_stock}
                                                onChange={(e) => setNewItem('quantity_in_stock', parseInt(e.target.value) || 0)}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:ring-govt-green focus:border-govt-green"
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-bold text-gray-700 mb-1">
                                                Unit
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="pcs / reams"
                                                value={newItem.unit}
                                                onChange={(e) => setNewItem('unit', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:ring-govt-green focus:border-govt-green"
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-bold text-gray-700 mb-1">
                                                Min Alert
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={newItem.min_threshold}
                                                onChange={(e) => setNewItem('min_threshold', parseInt(e.target.value) || 1)}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:ring-govt-green focus:border-govt-green"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={addingItem}
                                        className="w-full py-2.5 px-4 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white font-bold transition shadow-md shadow-govt-green/20 disabled:opacity-50 flex items-center justify-center space-x-1.5"
                                    >
                                        <PlusCircle className="h-4 w-4" />
                                        <span>{addingItem ? 'Adding...' : 'Register Item into Catalog'}</span>
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* RIGHT COLUMN (8 Cols): INVENTORY LEDGER & CATALOG ITEMS */}
                        <div className="lg:col-span-8 space-y-4">
                            <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
                                {/* Search & Filter Bar */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-gray-100">
                                    <div className="relative w-full sm:w-64">
                                        <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search items by name or SKU..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-govt-green focus:border-govt-green"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-1 text-xs font-bold w-full sm:w-auto overflow-x-auto">
                                        {['all', 'consumable', 'fixed_asset', 'low_stock'].map((tab) => (
                                            <button
                                                key={tab}
                                                type="button"
                                                onClick={() => setStatusFilter(tab)}
                                                className={`px-3 py-1.5 rounded-xl capitalize transition shrink-0 ${
                                                    statusFilter === tab
                                                        ? 'bg-govt-green text-white shadow-sm'
                                                        : 'text-gray-500 hover:bg-gray-100'
                                                }`}
                                            >
                                                {tab.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="text-gray-500 border-b border-gray-100">
                                                <th className="pb-3 font-semibold">Item & SKU</th>
                                                <th className="pb-3 font-semibold">Category</th>
                                                <th className="pb-3 font-semibold">Current Stock</th>
                                                <th className="pb-3 font-semibold">Status</th>
                                                <th className="pb-3 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                                            {filteredItems.map((item) => {
                                                const isLow = item.quantity_in_stock <= item.min_threshold;
                                                return (
                                                    <tr key={item.id} className="hover:bg-gray-50 transition">
                                                        <td className="py-3">
                                                            <p className="font-bold text-gray-900">{item.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-mono">
                                                                SKU: {item.sku || 'N/A'}
                                                            </p>
                                                        </td>
                                                        <td className="py-3">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                                item.category === 'consumable'
                                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                                                            }`}>
                                                                {item.category === 'consumable' ? 'Consumable' : 'Fixed Asset'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 font-mono font-black text-sm text-gray-900">
                                                            {item.quantity_in_stock} <span className="text-xs font-normal text-gray-500">{item.unit}</span>
                                                        </td>
                                                        <td className="py-3">
                                                            {isLow ? (
                                                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                    <span>Low Stock (Min: {item.min_threshold})</span>
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                    <span>Sufficient</span>
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 text-right">
                                                            <div className="flex items-center justify-end space-x-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenModal(item, 'stock_in')}
                                                                    className="px-2.5 py-1.5 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white font-bold text-xs transition shadow-sm inline-flex items-center space-x-1"
                                                                >
                                                                    <ArrowDownRight className="h-3.5 w-3.5" />
                                                                    <span>Stock In</span>
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    disabled={item.quantity_in_stock <= 0}
                                                                    onClick={() => handleOpenModal(item, 'stock_out')}
                                                                    className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-govt-gold text-white font-bold text-xs transition shadow-sm disabled:opacity-40 disabled:hover:bg-amber-600 inline-flex items-center space-x-1"
                                                                >
                                                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                                                    <span>Issue Stock</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {filteredItems.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-12 text-gray-500">
                                                        <Inbox className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                                        <p>No matching inventory items found.</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: MATERIAL DEMANDS REQUISITIONS REVIEW */}
                {mainTab === 'demands' && (
                    <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <div>
                                <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2 font-serif">
                                    <Package className="h-5 w-5 text-govt-green" />
                                    <span>Instructor Material Demands & Indent Requisitions</span>
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Review consumables requested by faculty for trade batches, approve quotas, and deduct central store stock.
                                </p>
                            </div>
                        </div>

                        {demands.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 text-xs">
                                No material demands submitted by instructors yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="text-gray-500 border-b border-gray-100">
                                            <th className="pb-3 font-semibold">Demand Ref</th>
                                            <th className="pb-3 font-semibold">Instructor</th>
                                            <th className="pb-3 font-semibold">Trade Batch</th>
                                            <th className="pb-3 font-semibold">Requested Items Breakdown</th>
                                            <th className="pb-3 font-semibold">Status</th>
                                            <th className="pb-3 font-semibold text-right">Store Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                                        {demands.map((dem) => {
                                            const isPending = dem.status === 'pending';
                                            const isApproved = dem.status === 'approved';

                                            return (
                                                <tr key={dem.id} className="hover:bg-gray-50 transition">
                                                    <td className="py-3 font-mono font-bold text-gray-900">
                                                        #DEM-{dem.id}
                                                        <p className="text-[10px] text-gray-400 font-normal">
                                                            {new Date(dem.created_at).toLocaleDateString()}
                                                        </p>
                                                    </td>
                                                    <td className="py-3">
                                                        <p className="font-bold text-gray-900">{dem.user?.name}</p>
                                                        <p className="text-[10px] text-gray-500">{dem.user?.email}</p>
                                                    </td>
                                                    <td className="py-3">
                                                        <p className="font-bold text-gray-800">{dem.batch?.name}</p>
                                                        <p className="text-[10px] text-gray-400">{dem.batch?.course?.name}</p>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="space-y-1">
                                                            {dem.items?.map((it) => (
                                                                <div key={it.id} className="text-[11px]">
                                                                    <strong className="text-gray-800">{it.inventory_item?.name}</strong>: Requested {it.requested_qty} {it.inventory_item?.unit}
                                                                    {isApproved && (
                                                                        <span className="text-emerald-700 font-bold ml-1">
                                                                            (Approved: {it.approved_qty}, Consumed: {it.consumed_qty})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                            isApproved
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : isPending
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : 'bg-rose-100 text-rose-800'
                                                        }`}>
                                                            <span>{dem.status}</span>
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            {isPending && (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleApproveDemand(dem.id, 'approved')}
                                                                        className="px-3 py-1.5 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white text-xs font-bold transition shadow-sm flex items-center space-x-1"
                                                                    >
                                                                        <Check className="h-3.5 w-3.5" />
                                                                        <span>Approve</span>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleApproveDemand(dem.id, 'rejected')}
                                                                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )}
                                                            <a
                                                                href={route('teacher.demands.show', dem.id)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition border border-gray-200 flex items-center space-x-1"
                                                            >
                                                                <Printer className="h-3.5 w-3.5" />
                                                                <span>Letter</span>
                                                            </a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: FIXED ASSET PROPERTY HANDOVER */}
                {mainTab === 'allocations' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* LEFT COLUMN: ASSIGN FIXED ASSET FORM */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
                                <div className="flex items-center space-x-2.5 pb-3 border-b border-gray-100">
                                    <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 font-serif">
                                            Hand Over Fixed Asset
                                        </h3>
                                        <p className="text-[11px] text-gray-500">
                                            Assign workshop equipment or lab assets to instructor
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleCreateAllocation} className="space-y-4 text-xs">
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1 uppercase tracking-wider text-[10px]">
                                            Faculty Instructor <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={allocData.user_id}
                                            onChange={(e) => setAllocData('user_id', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:ring-govt-green focus:border-govt-green"
                                        >
                                            {teachers.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name} ({t.email})
                                                </option>
                                            ))}
                                        </select>
                                        {allocErrors.user_id && (
                                            <p className="text-[11px] text-rose-500 mt-1">{allocErrors.user_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1 uppercase tracking-wider text-[10px]">
                                            Fixed Asset Item <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={allocData.inventory_item_id}
                                            onChange={(e) => setAllocData('inventory_item_id', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:ring-govt-green focus:border-govt-green"
                                        >
                                            {fixedAssets.map((fa) => (
                                                <option key={fa.id} value={fa.id}>
                                                    {fa.name} ({fa.quantity_in_stock} {fa.unit} in store)
                                                </option>
                                            ))}
                                        </select>
                                        {allocErrors.inventory_item_id && (
                                            <p className="text-[11px] text-rose-500 mt-1">{allocErrors.inventory_item_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1 uppercase tracking-wider text-[10px]">
                                            Room / Lab / Workshop Location <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. IT Lab 1, Workstation 4 or Welding Bay 2"
                                            value={allocData.room_location}
                                            onChange={(e) => setAllocData('room_location', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:ring-govt-green focus:border-govt-green"
                                        />
                                        {allocErrors.room_location && (
                                            <p className="text-[11px] text-rose-500 mt-1">{allocErrors.room_location}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1 uppercase tracking-wider text-[10px]">
                                            Quantity Assigned <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={allocData.quantity}
                                            onChange={(e) => setAllocData('quantity', parseInt(e.target.value) || 1)}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 focus:ring-govt-green focus:border-govt-green"
                                        />
                                        {allocErrors.quantity && (
                                            <p className="text-[11px] text-rose-500 mt-1">{allocErrors.quantity}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1 uppercase tracking-wider text-[10px]">
                                            Remarks / Serial Numbers (Optional)
                                        </label>
                                        <textarea
                                            rows={2}
                                            placeholder="Serial numbers, condition details..."
                                            value={allocData.remarks}
                                            onChange={(e) => setAllocData('remarks', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:ring-govt-green focus:border-govt-green"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={allocating}
                                        className="w-full py-2.5 px-4 rounded-xl bg-govt-green hover:bg-govt-green-500 text-white font-bold transition shadow-md shadow-govt-green/20 disabled:opacity-50 flex items-center justify-center space-x-1.5"
                                    >
                                        <ShieldCheck className="h-4 w-4" />
                                        <span>{allocating ? 'Allocating...' : 'Confirm Asset Handover'}</span>
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: ACTIVE ALLOCATIONS TABLE */}
                        <div className="lg:col-span-8 space-y-4">
                            <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                    <div>
                                        <h3 className="font-bold text-gray-900 flex items-center space-x-2 font-serif text-sm">
                                            <ShieldCheck className="h-4 w-4 text-govt-green" />
                                            <span>Faculty Fixed Asset Custody Ledger</span>
                                        </h3>
                                        <p className="text-[11px] text-gray-500">
                                            Physical tracking of institutional properties held by instructors
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-500">{allocations.length} Active Records</span>
                                </div>

                                {allocations.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400 text-xs">
                                        No fixed assets allocated yet. Use the form on the left to log a property handover.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="text-gray-500 border-b border-gray-100">
                                                    <th className="pb-3 font-semibold">Faculty Custodian</th>
                                                    <th className="pb-3 font-semibold">Asset Description</th>
                                                    <th className="pb-3 font-semibold">Location</th>
                                                    <th className="pb-3 font-semibold">Qty</th>
                                                    <th className="pb-3 font-semibold">Status</th>
                                                    <th className="pb-3 font-semibold text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                                                {allocations.map((alloc) => (
                                                    <tr key={alloc.id} className="hover:bg-gray-50 transition">
                                                        <td className="py-3 font-bold text-gray-900">
                                                            {alloc.user?.name}
                                                            <p className="text-[10px] text-gray-400 font-normal">{alloc.user?.email}</p>
                                                        </td>
                                                        <td className="py-3 font-bold text-gray-800">
                                                            {alloc.inventory_item?.name}
                                                            <p className="text-[10px] text-gray-400 font-mono">SKU: {alloc.inventory_item?.sku || 'N/A'}</p>
                                                        </td>
                                                        <td className="py-3">
                                                            <span className="inline-flex items-center space-x-1 text-gray-700">
                                                                <MapPin className="h-3 w-3 text-rose-500" />
                                                                <span>{alloc.room_location}</span>
                                                            </span>
                                                        </td>
                                                        <td className="py-3 font-mono font-bold text-gray-900">
                                                            {alloc.quantity} {alloc.inventory_item?.unit}
                                                        </td>
                                                        <td className="py-3">
                                                            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                                alloc.status === 'active'
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                                <span>{alloc.status}</span>
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-right">
                                                            {alloc.status === 'active' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleReturnAsset(alloc.id)}
                                                                    className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-rose-50 hover:text-rose-700 text-gray-700 text-[11px] font-bold transition border border-gray-200"
                                                                >
                                                                    Return to Store
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: STOCK IN / STOCK OUT TRANSACTION */}
                {activeModalItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="relative w-full max-w-lg rounded-2xl bg-white border border-gray-200 p-6 shadow-2xl space-y-4 animate-in fade-in">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <div className="flex items-center space-x-2">
                                    <div className={`p-2 rounded-xl text-white ${modalType === 'stock_in' ? 'bg-govt-green' : 'bg-amber-600'}`}>
                                        {modalType === 'stock_in' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 font-serif">
                                            {modalType === 'stock_in' ? 'Receive & Add Stock' : 'Issue Material to Batch'}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {activeModalItem.name} ({activeModalItem.quantity_in_stock} {activeModalItem.unit} Available)
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="p-1 rounded-lg text-gray-500 hover:text-gray-800"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmitTransaction} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">
                                        Quantity to {modalType === 'stock_in' ? 'Add' : 'Issue'} ({activeModalItem.unit}) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={modalType === 'stock_out' ? activeModalItem.quantity_in_stock : 10000}
                                        value={transactionData.quantity}
                                        onChange={(e) => setTransactionData('quantity', parseInt(e.target.value) || 1)}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900"
                                    />
                                    {transErrors.quantity && (
                                        <p className="text-[11px] text-rose-500 mt-1">{transErrors.quantity}</p>
                                    )}
                                </div>

                                {modalType === 'stock_out' && (
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">
                                            Target Trade Batch <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={transactionData.batch_id}
                                            onChange={(e) => setTransactionData('batch_id', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900"
                                        >
                                            {batches.map((b) => (
                                                <option key={b.id} value={b.id}>
                                                    {b.name} — {b.course?.name} ({b.shift} Shift)
                                                </option>
                                            ))}
                                        </select>
                                        {transErrors.batch_id && (
                                            <p className="text-[11px] text-rose-500 mt-1">{transErrors.batch_id}</p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">
                                        Remarks / Invoice / Purpose
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="e.g. Practical exam setup, daily training consumption, supplier replenishment..."
                                        value={transactionData.remarks}
                                        onChange={(e) => setTransactionData('remarks', e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900"
                                    />
                                </div>

                                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={transacting}
                                        className={`px-5 py-2 rounded-xl text-white font-extrabold transition shadow-sm disabled:opacity-50 ${
                                            modalType === 'stock_in' ? 'bg-govt-green hover:bg-govt-green-500' : 'bg-amber-600 hover:bg-govt-gold'
                                        }`}
                                    >
                                        {transacting
                                            ? 'Recording...'
                                            : modalType === 'stock_in'
                                            ? 'Confirm Stock Receipt'
                                            : 'Confirm Batch Issue'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}