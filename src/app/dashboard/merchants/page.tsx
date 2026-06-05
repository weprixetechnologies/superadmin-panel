"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Plus, Store, Activity, Ban, Package, Filter } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { merchantApi } from '../../../apis/merchantApi';
import DataTableSkeleton from '../../../components/dashboard/DataTableSkeleton';
import EmptyState from '../../../components/dashboard/EmptyState';


export default function MerchantList() {
    const { user } = useAuth();
    
    // Explicitly block engineers
    if (user?.role === 'ENGINEER') {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-bold text-red-600">Unauthorized</h2>
                <p className="text-zinc-500 mt-2">You do not have permission to view merchants.</p>
            </div>
        );
    }

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: '',
        status: 'ALL',
        pincode: ''
    });
    
    const [searchInput, setSearchInput] = useState('');
    const [pincodeInput, setPincodeInput] = useState('');

    const fetchMerchants = useCallback(async (currentFilters: typeof filters) => {
        try {
            setLoading(true);
            setError(null);
            
            const params: any = {
                page: currentFilters.page,
                limit: currentFilters.limit
            };
            if (currentFilters.search) params.search = currentFilters.search;
            if (currentFilters.status && currentFilters.status !== 'ALL') params.status = currentFilters.status;
            if (currentFilters.pincode) params.pincode = currentFilters.pincode;

            const res = await merchantApi.getAll(params);
            if (res.data.success) {
                setData(res.data);
            } else {
                setError('Failed to fetch merchants');
            }
        } catch (err: any) {
            console.error('Failed to fetch merchants', err);
            setError(err.response?.data?.message || 'An error occurred while fetching merchants');
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounce searches
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput, pincode: pincodeInput, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput, pincodeInput]);

    useEffect(() => {
        fetchMerchants(filters);
    }, [filters, fetchMerchants]);

    const handleStatusChange = (status: string) => {
        setFilters(prev => ({ ...prev, status, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleDeactivate = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this merchant?')) return;
        try {
            const res = await merchantApi.deactivate(id, { reason: 'Manual deactivation from listing' });
            if (res.data.success) {
                alert('Merchant deactivated successfully');
                fetchMerchants(filters);
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to deactivate merchant');
        }
    };

    const handleReactivate = async (id: string) => {
        if (!confirm('Are you sure you want to reactivate this merchant?')) return;
        try {
            const res = await merchantApi.reactivate(id);
            if (res.data.success) {
                alert('Merchant reactivated successfully');
                fetchMerchants(filters);
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to reactivate merchant');
        }
    };

    // Calculate metrics
    const totalCount = data?.total || 0;
    // We don't have accurate active/inactive counts across all pages from the paginated API, 
    // but we can show local numbers or omit. We'll show placeholders based on current data for now.
    const activeCount = data?.merchants?.filter((m: any) => m.status === 'ACTIVE').length || 0;
    const inactiveCount = data?.merchants?.filter((m: any) => m.status === 'INACTIVE').length || 0;

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Merchants</h1>
                    <p className="text-zinc-500 text-sm mt-1">Manage merchant profiles, machine assignments, and merchant information.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => fetchMerchants(filters)} className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-colors shadow-sm">
                        Refresh
                    </button>
                    {(user?.role === 'SUPERADMIN' || user?.role === 'MANAGER' || user?.role === 'OPERATOR') && (
                        <Link href="/dashboard/merchants/create" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20">
                            <Plus className="w-4 h-4" />
                            Create Merchant
                        </Link>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                        <Store className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-zinc-500">Total Merchants</p>
                        <h3 className="text-2xl font-bold text-zinc-900 mt-1">{totalCount}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                        <Activity className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-zinc-500">Active (This Page)</p>
                        <h3 className="text-2xl font-bold text-zinc-900 mt-1">{activeCount}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center shrink-0">
                        <Ban className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-zinc-500">Inactive (This Page)</p>
                        <h3 className="text-2xl font-bold text-zinc-900 mt-1">{inactiveCount}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-zinc-500">Assigned Machines</p>
                        <h3 className="text-2xl font-bold text-zinc-900 mt-1">--</h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap items-center gap-4 flex-1">
                    <div className="relative w-full max-w-xs">
                        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search name, mobile, code..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>
                    <div className="relative w-full max-w-[150px]">
                        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Pincode"
                            value={pincodeInput}
                            onChange={(e) => setPincodeInput(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-zinc-50 p-1 rounded-xl border border-zinc-200">
                        {['ALL', 'ACTIVE', 'INACTIVE'].map(status => (
                            <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                    filters.status === status
                                        ? 'bg-white text-zinc-900 shadow-sm'
                                        : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100'
                                }`}
                            >
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <DataTableSkeleton columns={7} rows={5} />
                    ) : error ? (
                        <div className="p-8 text-center text-rose-500">{error}</div>
                    ) : data?.merchants?.length === 0 ? (
                        <EmptyState
                            icon={Store}
                            title="No merchants found"
                            description="Get started by registering a new merchant."
                            actionLabel="Register Merchant"
                            onAction={() => window.location.href = '/dashboard/merchants/create'}
                        />
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-200">
                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Merchant Code</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name / Business</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {data?.merchants?.map((merchant: any) => (
                                    <tr key={merchant.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 text-xs font-medium font-mono">
                                                {merchant.merchant_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-zinc-900">{merchant.full_name}</div>
                                            {merchant.business_name && (
                                                <div className="text-xs text-zinc-500 mt-0.5">{merchant.business_name}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-zinc-900">{merchant.mobile}</div>
                                            {merchant.email && (
                                                <div className="text-xs text-zinc-500 mt-0.5">{merchant.email}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-zinc-900">{merchant.pincode}</div>
                                            <div className="text-xs text-zinc-500 truncate max-w-[150px]">{merchant.address}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                merchant.status === 'ACTIVE'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                    merchant.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                                                }`}></span>
                                                {merchant.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-500">
                                            {new Date(merchant.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link 
                                                    href={`/dashboard/merchants/${merchant.id}`}
                                                    className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Store className="w-4 h-4" />
                                                </Link>
                                                {(user?.role === 'SUPERADMIN' || user?.role === 'MANAGER' || user?.role === 'OPERATOR') && (
                                                    <Link 
                                                        href={`/dashboard/merchants/${merchant.id}/edit`}
                                                        className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </Link>
                                                )}
                                                {(user?.role === 'SUPERADMIN' || user?.role === 'MANAGER') && (
                                                    merchant.status === 'ACTIVE' ? (
                                                        <button 
                                                            onClick={() => handleDeactivate(merchant.id)}
                                                            className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                            title="Deactivate"
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleReactivate(merchant.id)}
                                                            className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="Reactivate"
                                                        >
                                                            <Activity className="w-4 h-4" />
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {!loading && data?.total > 0 && (
                    <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between bg-zinc-50/50">
                        <div className="text-sm text-zinc-500">
                            Showing <span className="font-medium text-zinc-900">{(filters.page - 1) * filters.limit + 1}</span> to <span className="font-medium text-zinc-900">{Math.min(filters.page * filters.limit, data.total)}</span> of <span className="font-medium text-zinc-900">{data.total}</span> merchants
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(filters.page - 1)}
                                disabled={filters.page === 1}
                                className="px-3 py-1.5 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(filters.page + 1)}
                                disabled={filters.page * filters.limit >= data.total}
                                className="px-3 py-1.5 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
