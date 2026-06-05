"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
    Search, Filter, Plus, ChevronLeft, ChevronRight, Eye, 
    MoreVertical, Edit, MapPin, Truck, AlertTriangle, ShieldOff
} from 'lucide-react';
import { machineApi } from '@/apis/assets/machineApi';
import { useAuth } from '@/context/AuthContext';
import AddMachineDialog from '@/components/assets/dialogs/AddMachineDialog';
import MapTidDialog from '@/components/assets/dialogs/MapTidDialog';

const STATUS_COLORS: Record<string, string> = {
    IN_STOCK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DEPLOYED: 'bg-blue-50 text-blue-700 border-blue-200',
    IN_TRANSIT: 'bg-amber-50 text-amber-700 border-amber-200',
    WITH_ENGINEER: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    UNDER_REPAIR: 'bg-rose-50 text-rose-700 border-rose-200',
    DECOMMISSIONED: 'bg-slate-100 text-slate-700 border-slate-200',
};

function MachinesPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const statusParam = searchParams.get('status') || '';
    
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [stats, setStats] = useState({ available: 0, deployed: 0, fresh: 0, unmapped: 0 });
    const [filters, setFilters] = useState({
        search: '',
        status: statusParam,
        branch_id: '',
        chronic_fault: ''
    });

    const [addOpen, setAddOpen] = useState(false);
    const [mapTidOpen, setMapTidOpen] = useState(false);
    const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);

    const { user } = useAuth();

    const fetchMachines = async () => {
        setLoading(true);
        try {
            const query = {
                page: page.toString(),
                limit: '20',
                ...filters
            };
            // Clean empty
            Object.keys(query).forEach(key => {
                if (!query[key as keyof typeof query]) delete query[key as keyof typeof query];
            });

            const { data } = await machineApi.getAll(query);
            if (data?.success) {
                setMachines(data.machines || []);
                setTotal(data.total || data.machines?.length || 0);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnmapTid = async (id: string) => {
        if (!confirm('Are you sure you want to unmap the TID?')) return;
        try {
            const { data } = await machineApi.unmapTid(id);
            if (data?.success) {
                fetchMachines();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await machineApi.getStats();
            if (data?.success) setStats(data.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMachines();
        fetchStats();
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
                    <h1 className="text-2xl font-bold text-slate-900">Machine Registry</h1>
                    <p className="text-slate-500 mt-1">Manage all POS terminals and their lifecycle</p>
                </div>
                {user?.role !== 'ENGINEER' && (
                    <button 
                        onClick={() => setAddOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-emerald-600/20"
                    >
                        <Plus className="w-5 h-5" />
                        Add Machine
                    </button>
                )}
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col">
                    <span className="text-sm font-medium text-slate-500 mb-2">Available Devices</span>
                    <span className="text-3xl font-bold text-slate-900">{stats.available}</span>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col">
                    <span className="text-sm font-medium text-slate-500 mb-2">Deployed Devices</span>
                    <span className="text-3xl font-bold text-slate-900">{stats.deployed}</span>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col">
                    <span className="text-sm font-medium text-slate-500 mb-2">Fresh Devices</span>
                    <span className="text-3xl font-bold text-slate-900">{stats.fresh}</span>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col">
                    <span className="text-sm font-medium text-slate-500 mb-2">Unmapped Devices</span>
                    <span className="text-3xl font-bold text-slate-900">{stats.unmapped}</span>
                    <span className="text-xs text-slate-400 mt-1">Earlier mapped, now available</span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text" 
                        name="search"
                        placeholder="Search Serial Number or TID..."
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

                {user?.role === 'SUPERADMIN' && (
                    <div className="flex-1 min-w-[140px]">
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

                <select name="chronic_fault" value={filters.chronic_fault} onChange={handleFilterChange} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm min-w-[160px]">
                    <option value="">Chronic Fault: Any</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Device Info</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status & Mapping</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Warranty</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Flags</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="animate-pulse flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                            Loading machines...
                                        </div>
                                    </td>
                                </tr>
                            ) : machines.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                            <Search className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900 mb-1">No machines found</h3>
                                        <p className="text-slate-500">Try adjusting your filters or search query.</p>
                                    </td>
                                </tr>
                            ) : (
                                machines.map((m: any) => (
                                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{m.serial_number}</div>
                                            <div className="text-sm text-slate-500 mt-0.5">{m.brand} {m.model}</div>
                                            {user?.role === 'SUPERADMIN' && <div className="text-xs text-slate-400 mt-1">Branch: {m.branch_id}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2 items-start">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${STATUS_COLORS[m.status] || 'bg-slate-100 text-slate-700'}`}>
                                                    {m.status.replace(/_/g, ' ')}
                                                </span>
                                                {m.tid && (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider bg-slate-100 text-slate-600">
                                                        TID: {m.tid}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {m.warranty_expiry ? new Date(m.warranty_expiry).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {m.chronic_fault ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                    Chronic Fault
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">Normal</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link 
                                                    href={`/dashboard/assets/machines/${m.id}`}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </Link>
                                                {user?.role !== 'ENGINEER' && (
                                                    <>
                                                        {m.status !== 'DEPLOYED' ? (
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedMachineId(m.id);
                                                                    setMapTidOpen(true);
                                                                }}
                                                                className="px-3 py-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200"
                                                                title="Map TID"
                                                            >
                                                                Map TID 
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={() => handleUnmapTid(m.id)}
                                                                className="px-3 py-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200"
                                                                title="Unmap TID"
                                                            >
                                                                Unmap TID
                                                            </button>
                                                        )}
                                                    </>
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
                {!loading && machines.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                            Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} machines
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

            <AddMachineDialog 
                isOpen={addOpen}
                onClose={() => setAddOpen(false)}
                onSuccess={() => {
                    setPage(1);
                    fetchMachines();
                }}
            />

            <MapTidDialog 
                isOpen={mapTidOpen}
                onClose={() => setMapTidOpen(false)}
                machineId={selectedMachineId}
                currentTid={machines.find((m: any) => m.id === selectedMachineId)?.tid}
                onSuccess={() => {
                    fetchMachines();
                }}
            />
        </div>
    );
}

export default function MachinesPage() {
    return (
        <Suspense fallback={<div className="p-8 max-w-[1600px] mx-auto text-slate-500">Loading machines...</div>}>
            <MachinesPageContent />
        </Suspense>
    );
}
