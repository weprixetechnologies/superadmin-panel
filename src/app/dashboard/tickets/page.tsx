"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
    Search, Filter, Plus, ChevronLeft, ChevronRight, Eye, 
    MoreVertical, UserPlus, XCircle, Key, CheckCircle2, ShieldAlert 
} from 'lucide-react';
import api from '@/utils/axiosInstance';
import { AuthUser } from '@/utils/auth';

const STATUS_COLORS: Record<string, string> = {
    NEW: 'bg-blue-50 text-blue-700 border-blue-200',
    ASSIGNED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    EN_ROUTE: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    ARRIVED_PENDING: 'bg-orange-50 text-orange-700 border-orange-200',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
    MACHINE_PICKED: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    IN_OFFICE: 'bg-teal-50 text-teal-700 border-teal-200',
    UNDER_REPAIR: 'bg-rose-50 text-rose-700 border-rose-200',
    READY_DEPLOY: 'bg-lime-50 text-lime-700 border-lime-200',
    PENDING_CLOSE: 'bg-purple-50 text-purple-700 border-purple-200',
    CLOSED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-slate-100 text-slate-700 border-slate-200',
};

const PRIORITY_COLORS: Record<string, string> = {
    NORMAL: 'bg-slate-100 text-slate-700',
    URGENT: 'bg-orange-100 text-orange-700',
    CRITICAL: 'bg-red-100 text-red-700',
};

function TicketsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const statusParam = searchParams.get('status') || '';
    
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        status: statusParam,
        priority: '',
        service_type: ''
    });

    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        // Mocking user context retrieval (assuming we'd use a context in a real app)
        // or decoding the JWT here if we needed to.
        const storedUser = localStorage.getItem('user'); // Or however auth context works here
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...filters
            });
            // clean empty filters
            Array.from(query.keys()).forEach(key => {
                if (!query.get(key)) query.delete(key);
            });

            const { data } = await api.get(`/tickets?${query.toString()}`);
            if (data?.success) {
                const result = data.data;
                const ticketList = Array.isArray(result) ? result : (result?.tickets ?? []);
                setTickets(ticketList);
                setTotal(result?.total ?? ticketList.length);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
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
                    <h1 className="text-2xl font-bold text-slate-900">All Tickets</h1>
                    <p className="text-slate-500 mt-1">Manage and track service requests</p>
                </div>
                {user?.role !== 'ENGINEER' && (
                    <Link 
                        href="/dashboard/tickets/create"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-emerald-600/20"
                    >
                        <Plus className="w-5 h-5" />
                        Create Ticket
                    </Link>
                )}
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text" 
                        name="search"
                        placeholder="Search merchant name..."
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

                <select name="priority" value={filters.priority} onChange={handleFilterChange} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm min-w-[140px]">
                    <option value="">All Priorities</option>
                    <option value="NORMAL">Normal</option>
                    <option value="URGENT">Urgent</option>
                    <option value="CRITICAL">Critical</option>
                </select>

                <select name="service_type" value={filters.service_type} onChange={handleFilterChange} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm min-w-[160px]">
                    <option value="">All Service Types</option>
                    <option value="REPAIR">Repair</option>
                    <option value="PICKUP">Pickup</option>
                    <option value="REPLACEMENT">Replacement</option>
                    <option value="INSTALLATION">Installation</option>
                    <option value="DEINSTALLATION">Deinstallation</option>
                    <option value="MISC_SERV">Misc Service</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket / Service</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Merchant Info</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status & Priority</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Timelines</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="animate-pulse flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                            Loading tickets...
                                        </div>
                                    </td>
                                </tr>
                            ) : tickets.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                            <Search className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900 mb-1">No tickets found</h3>
                                        <p className="text-slate-500">Try adjusting your filters or search query.</p>
                                    </td>
                                </tr>
                            ) : (
                                tickets.map((t: any) => (
                                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{t.ticket_number}</div>
                                            <div className="text-sm text-slate-500 mt-0.5">{t.service_type}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{t.merchant_name}</div>
                                            <div className="text-sm text-slate-500 mt-0.5">{t.merchant_mobile}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2 items-start">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${STATUS_COLORS[t.status] || 'bg-slate-100 text-slate-700'}`}>
                                                    {t.status.replace(/_/g, ' ')}
                                                </span>
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${PRIORITY_COLORS[t.priority] || 'bg-slate-100 text-slate-600'}`}>
                                                    {t.priority}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <div><span className="text-slate-400">Created:</span> {new Date(t.created_at).toLocaleDateString()}</div>
                                            <div>
                                                <span className="text-slate-400">SLA:</span>{' '}
                                                <span className={t.sla_breached ? 'text-red-600 font-medium' : ''}>
                                                    {new Date(t.sla_due_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link 
                                                    href={`/dashboard/tickets/${t.id}`}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </Link>
                                                {/* More actions would go in a dropdown typically, keeping it simple for the layout */}
                                                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {!loading && tickets.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                            Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} tickets
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

export default function TicketsPage() {
    return (
        <Suspense fallback={<div className="p-8 max-w-[1600px] mx-auto text-slate-500">Loading tickets...</div>}>
            <TicketsPageContent />
        </Suspense>
    );
}
