"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
    Search, ChevronLeft, ChevronRight, Eye, 
    MoreVertical, Edit, ShieldOff, PackageSearch
} from 'lucide-react';
import { stockItemApi } from '@/apis/assets/stockItemApi';
import { useAuth } from '@/context/AuthContext';

const STATE_COLORS: Record<string, string> = {
    IN_STOCK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ISSUED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    CONSUMED: 'bg-slate-100 text-slate-700 border-slate-200',
    DAMAGED: 'bg-rose-50 text-rose-700 border-rose-200',
    DECOMMISSIONED: 'bg-slate-100 text-slate-700 border-slate-200',
};

const CONDITION_COLORS: Record<string, string> = {
    NEW: 'bg-emerald-100 text-emerald-700',
    USED_GOOD: 'bg-blue-100 text-blue-700',
    USED_FAIR: 'bg-amber-100 text-amber-700',
    DAMAGED: 'bg-rose-100 text-rose-700',
};

function StockItemsPageContent() {
    const searchParams = useSearchParams();
    const stateParam = searchParams.get('state') || '';
    
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        state: stateParam,
        condition: '',
        category: '',
        branch_id: ''
    });

    const { user } = useAuth();

    const fetchItems = async () => {
        setLoading(true);
        try {
            const query = {
                page: page.toString(),
                limit: '20',
                ...filters
            };
            Object.keys(query).forEach(key => {
                if (!query[key as keyof typeof query]) delete query[key as keyof typeof query];
            });

            const { data } = await stockItemApi.getAll(query);
            if (data?.success) {
                setItems(data.items || []);
                setTotal(data.total || data.items?.length || 0);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [page, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setPage(1);
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Serialized Stock Items</h1>
                    <p className="text-slate-500 mt-1">Manage individual serialized assets and accessories</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text" 
                        name="search"
                        placeholder="Search Serial Number or Item Name..."
                        value={filters.search}
                        onChange={handleFilterChange}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                </div>
                
                <select name="state" value={filters.state} onChange={handleFilterChange} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm min-w-[140px]">
                    <option value="">All States</option>
                    {Object.keys(STATE_COLORS).map(s => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                </select>

                <select name="condition" value={filters.condition} onChange={handleFilterChange} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm min-w-[140px]">
                    <option value="">All Conditions</option>
                    {Object.keys(CONDITION_COLORS).map(c => (
                        <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                    ))}
                </select>

                <select name="category" value={filters.category} onChange={handleFilterChange} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm min-w-[140px]">
                    <option value="">All Categories</option>
                    <option value="TERMINAL">Terminal</option>
                    <option value="BATTERY">Battery</option>
                    <option value="CHARGER">Charger</option>
                    <option value="CABLE">Cable</option>
                    <option value="DONGLE">Dongle</option>
                    <option value="OTHER">Other</option>
                </select>

                {user?.role === 'SUPER_ADMIN' && (
                    <div className="min-w-[140px]">
                        <input 
                            type="text" 
                            name="branch_id"
                            placeholder="Branch ID"
                            value={filters.branch_id}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
                        />
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">State & Condition</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Added</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="animate-pulse flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                            Loading items...
                                        </div>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                            <PackageSearch className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900 mb-1">No stock items found</h3>
                                        <p className="text-slate-500">Try adjusting your filters.</p>
                                    </td>
                                </tr>
                            ) : (
                                items.map((m: any) => (
                                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{m.item_name}</div>
                                            <div className="text-sm font-mono text-slate-500 mt-0.5">SN: {m.serial_number}</div>
                                            {m.brand && <div className="text-xs text-slate-400 mt-1">{m.brand} {m.model}</div>}
                                            {user?.role === 'SUPER_ADMIN' && <div className="text-xs text-slate-400 mt-1">Branch: {m.branch_id}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-700">{m.category}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2 items-start">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${STATE_COLORS[m.state] || 'bg-slate-100 text-slate-700'}`}>
                                                    {m.state.replace(/_/g, ' ')}
                                                </span>
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${CONDITION_COLORS[m.condition] || 'bg-slate-100 text-slate-600'}`}>
                                                    {m.condition.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(m.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link 
                                                    href={`/dashboard/assets/stock-items/${m.id}`}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </Link>
                                                {user?.role !== 'ENGINEER' && (
                                                    <div className="relative group">
                                                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                                            <MoreVertical className="w-5 h-5" />
                                                        </button>
                                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                                                            <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                                                <Edit className="w-4 h-4" /> Edit
                                                            </button>
                                                            {['MANAGER', 'SUPER_ADMIN', 'SUPERADMIN'].includes(user?.role || '') && (
                                                                <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100">
                                                                    <ShieldOff className="w-4 h-4" /> Decommission
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {!loading && items.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                            Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} items
                        </span>
                        <div className="flex items-center gap-2">
                            <button 
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium text-slate-700 px-2">Page {page}</span>
                            <button 
                                disabled={page * 20 >= total}
                                onClick={() => setPage(p => p + 1)}
                                className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function StockItemsPage() {
    return (
        <Suspense fallback={<div className="p-8 max-w-[1600px] mx-auto text-slate-500">Loading stock items...</div>}>
            <StockItemsPageContent />
        </Suspense>
    );
}
