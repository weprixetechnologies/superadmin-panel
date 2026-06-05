"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Search, Plus, ChevronLeft, ChevronRight, Eye,
    Truck, PackageCheck, AlertCircle
} from 'lucide-react';
import { consignmentApi } from '@/apis/assets/consignmentApi';
import { useAuth } from '@/context/AuthContext';
import CreateConsignmentDialog from '@/components/assets/dialogs/CreateConsignmentDialog';

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    PARTIAL: 'bg-blue-50 text-blue-700 border-blue-200',
    RECEIVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DISCREPANCY: 'bg-rose-50 text-rose-700 border-rose-200',
};

function ConsignmentsPageContent() {
    const searchParams = useSearchParams();
    const statusParam = searchParams.get('status') || '';

    const [consignments, setConsignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        status: statusParam,
    });

    const { user } = useAuth();

    const fetchConsignments = async () => {
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

            const { data } = await consignmentApi.getAll(query);
            if (data?.success) {
                setConsignments(data.consignments || []);
                setTotal(data.total || data.consignments?.length || 0);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConsignments();
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
                    <h1 className="text-2xl font-bold text-slate-900">Inbound Consignments</h1>
                    <p className="text-slate-500 mt-1">Manage expected stock deliveries and shipments from suppliers</p>
                </div>
                {user?.role !== 'ENGINEER' && (
                    <button
                        onClick={() => setOpenCreateDialog(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-emerald-600/20"
                    >
                        <Plus className="w-5 h-5" />
                        Create Consignment
                    </button>
                )}
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        name="search"
                        placeholder="Search Reference or Supplier..."
                        value={filters.search}
                        onChange={handleFilterChange}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                </div>

                <select name="status" value={filters.status} onChange={handleFilterChange} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm min-w-[140px]">
                    <option value="">All Statuses</option>
                    {Object.keys(STATUS_COLORS).map(s => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference & Supplier</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Counts</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expected Arrival</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="animate-pulse flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                            Loading consignments...
                                        </div>
                                    </td>
                                </tr>
                            ) : consignments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                            <Truck className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900 mb-1">No consignments found</h3>
                                        <p className="text-slate-500">Try adjusting your filters or search query.</p>
                                    </td>
                                </tr>
                            ) : (
                                consignments.map((c: any) => (
                                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{c.dispatch_reference || 'N/A'}</div>
                                            <div className="text-sm text-slate-500 mt-0.5">{c.supplier_name || 'Unknown Supplier'}</div>
                                            {c.relate_badge && (
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold rounded-full">
                                                    {c.relate_badge}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${STATUS_COLORS[c.status] || 'bg-slate-100 text-slate-700'}`}>
                                                {c.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <span className="text-xs text-slate-500 block mb-0.5">Expected</span>
                                                    <span className="font-semibold text-slate-700">{c.expected_count}</span>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-slate-500 block mb-0.5">Received</span>
                                                    <span className={`font-semibold ${c.received_count < c.expected_count ? 'text-amber-600' : 'text-emerald-600'}`}>{c.received_count}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {c.expected_arrival ? new Date(c.expected_arrival).toLocaleDateString() : 'TBD'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/dashboard/assets/consignments/${c.id}`}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && consignments.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                            Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} consignments
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

            <CreateConsignmentDialog
                isOpen={openCreateDialog}
                onClose={() => setOpenCreateDialog(false)}
                onSuccess={() => {
                    setOpenCreateDialog(false);
                    fetchConsignments();
                }}
            />
        </div>
    );
}

export default function ConsignmentsPage() {
    return (
        <Suspense fallback={<div className="p-8 max-w-[1600px] mx-auto text-slate-500">Loading consignments...</div>}>
            <ConsignmentsPageContent />
        </Suspense>
    );
}
