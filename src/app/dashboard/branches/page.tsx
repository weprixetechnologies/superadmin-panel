"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Filter, Plus, MoreVertical, Eye, Edit, Trash2, ShieldBan, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../utils/axiosInstance';
import { PaginatedBranchResponse, Branch, BranchFilters } from '../../../types/branch';
import DataTableSkeleton from '../../../components/dashboard/DataTableSkeleton';
import EmptyState from '../../../components/dashboard/EmptyState';

export default function BranchList() {
    const { user } = useAuth();
    
    const [data, setData] = useState<PaginatedBranchResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [filters, setFilters] = useState<BranchFilters>({
        page: 1,
        limit: 10,
        sort_by: 'created_at',
        sort_dir: 'DESC'
    });
    const [searchInput, setSearchInput] = useState('');

    const fetchBranches = useCallback(async (currentFilters: BranchFilters) => {
        try {
            setLoading(true);
            setError(null);
            
            const params = new URLSearchParams();
            if (currentFilters.search) params.append('search', currentFilters.search);
            if (currentFilters.status && currentFilters.status !== 'ALL') params.append('status', currentFilters.status);
            if (currentFilters.sort_by) params.append('sort_by', currentFilters.sort_by);
            if (currentFilters.sort_dir) params.append('sort_dir', currentFilters.sort_dir);
            params.append('page', currentFilters.page.toString());
            params.append('limit', currentFilters.limit.toString());

            const res = await api.get(`/branches?${params.toString()}`);
            if (res.data.success) {
                setData(res.data);
            } else {
                setError('Failed to fetch branches');
            }
        } catch (err: any) {
            console.error('Failed to fetch branches', err);
            setError(err.response?.data?.error || 'An error occurred while fetching branches');
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        fetchBranches(filters);
    }, [filters, fetchBranches]);

    const handleSort = (field: 'branch_name' | 'created_at' | 'employee_count') => {
        setFilters(prev => ({
            ...prev,
            sort_by: field,
            sort_dir: prev.sort_by === field && prev.sort_dir === 'ASC' ? 'DESC' : 'ASC',
            page: 1
        }));
    };

    const handleStatusChange = (status: 'ACTIVE' | 'INACTIVE' | 'ALL') => {
        setFilters(prev => ({ ...prev, status, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    // Calculate KPIs
    const activeCount = data?.data.filter(b => b.status === 'ACTIVE').length || 0;
    const inactiveCount = data?.data.filter(b => b.status === 'INACTIVE').length || 0;
    const coverageCount = data?.data.reduce((sum, b) => sum + (b.pincode_ranges?.length || 0), 0) || 0;

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Branch Management</h1>
                    <p className="text-zinc-500 text-sm mt-1">Manage all operational branches and service coverage areas.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => fetchBranches(filters)} className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-colors shadow-sm">
                        Refresh
                    </button>
                    <Link href="/dashboard/branches/create" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20">
                        <Plus className="w-4 h-4" />
                        Create Branch
                    </Link>
                </div>
            </div>

            {data && data.pagination.total > 0 && (
                <div className="mb-8">
                    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Branches', value: data.pagination.total.toString() },
                        { label: 'Active Branches', value: activeCount.toString() },
                        { label: 'Inactive Branches', value: inactiveCount.toString() },
                        { label: 'Coverage Areas', value: coverageCount.toString() }
                    ].map((kpi, idx) => (
                        <div key={idx} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-medium text-zinc-500 mb-2">{kpi.label}</h3>
                            <div className="text-3xl font-bold text-zinc-900">{kpi.value}</div>
                        </div>
                    ))}
                </div>
                </div>
            )}

            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-100 flex flex-col md:flex-row items-center justify-between bg-zinc-50/50 gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input 
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search branch code, branch name, contact person..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <select 
                            className="bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            value={filters.status || 'ALL'}
                            onChange={(e) => handleStatusChange(e.target.value as any)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                        
                        <div className="flex items-center gap-2 border border-zinc-200 rounded-xl bg-white px-2 py-1">
                            <span className="text-xs text-zinc-500 pl-2">Sort:</span>
                            <select 
                                className="bg-transparent border-none text-sm focus:outline-none focus:ring-0"
                                value={filters.sort_by}
                                onChange={(e) => handleSort(e.target.value as any)}
                            >
                                <option value="branch_name">Branch Name</option>
                                <option value="created_at">Created Date</option>
                                <option value="employee_count">Employee Count</option>
                            </select>
                            <button 
                                onClick={() => handleSort(filters.sort_by as any)} 
                                className="px-2 py-1 rounded-md hover:bg-zinc-100 text-xs font-semibold text-zinc-600"
                            >
                                {filters.sort_dir}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {error ? (
                        <div className="p-12 text-center text-red-500">{error}</div>
                    ) : loading && (!data || data.data.length === 0) ? (
                        <DataTableSkeleton />
                    ) : !data || data.data.length === 0 ? (
                        <div className="p-12">
                            <EmptyState 
                                title="No Branches Found" 
                                description="Create your first branch to start managing operations." 
                                icon={<Plus />} 
                            />
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Branch Details</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Contact</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">Staff & Assets</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Created</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {data.data.map((branch) => (
                                    <tr key={branch.id} className="hover:bg-zinc-50/50 transition-colors group">
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-zinc-900">{branch.branch_name}</div>
                                            <div className="text-xs text-zinc-500 font-mono mt-0.5">{branch.branch_code}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-sm text-zinc-800">{branch.contact_person || 'N/A'}</div>
                                            <div className="text-xs text-zinc-500">{branch.contact_mobile || 'No mobile'}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-center gap-4 text-xs text-zinc-600">
                                                <div className="flex flex-col items-center" title="Employees">
                                                    <span className="font-semibold text-emerald-600">{branch.employee_count}</span>
                                                    <span className="text-[10px] text-zinc-400">Emp</span>
                                                </div>
                                                <div className="flex flex-col items-center" title="Machines">
                                                    <span className="font-semibold text-blue-600">{branch.machine_count}</span>
                                                    <span className="text-[10px] text-zinc-400">Mch</span>
                                                </div>
                                                <div className="flex flex-col items-center" title="Open Tickets">
                                                    <span className="font-semibold text-orange-600">{branch.open_ticket_count}</span>
                                                    <span className="text-[10px] text-zinc-400">Tkt</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                branch.status === 'ACTIVE' 
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                                : 'bg-red-50 border-red-200 text-red-700'
                                            }`}>
                                                {branch.status === 'ACTIVE' ? <CheckCircle className="w-3.5 h-3.5" /> : <ShieldBan className="w-3.5 h-3.5" />}
                                                {branch.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-zinc-600">
                                            {new Date(branch.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/dashboard/branches/${branch.id}`} className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link href={`/dashboard/branches/edit/${branch.id}`} className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                {/* Delete & Status modals can be implemented via state and separate components later, leaving as link/buttons for now */}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {data && data.pagination.total_pages > 1 && (
                    <div className="p-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                        <div className="text-sm text-zinc-500">
                            Showing <span className="font-medium text-zinc-900">{(data.pagination.page - 1) * data.pagination.limit + 1}</span> to <span className="font-medium text-zinc-900">{Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)}</span> of <span className="font-medium text-zinc-900">{data.pagination.total}</span> branches
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                disabled={data.pagination.page === 1}
                                onClick={() => handlePageChange(data.pagination.page - 1)}
                                className="px-3 py-1.5 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button 
                                disabled={data.pagination.page === data.pagination.total_pages}
                                onClick={() => handlePageChange(data.pagination.page + 1)}
                                className="px-3 py-1.5 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
