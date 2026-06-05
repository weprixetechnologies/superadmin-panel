"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Search, MapPin, CheckCircle, Smartphone, PenTool, ClipboardList, ShieldAlert
} from 'lucide-react';
import api from '@/utils/axiosInstance';
import { AuthUser } from '@/utils/auth';

const STATUS_COLORS: Record<string, string> = {
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
};

export default function MyTicketsPage() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            // API automatically limits to assigned tickets for ENGINEER role
            const { data } = await api.get('/tickets?limit=50');
            if (data?.success) {
                // Filter out closed/cancelled from active workflow if needed
                const active = data.data.tickets.filter((t: any) => !['CLOSED', 'CANCELLED'].includes(t.status));
                setTickets(active);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    // Direct Status Action Helper (Real app would have Modals for these)
    const handleStatusAction = async (id: string, actionType: string) => {
        if (!confirm(`Are you sure you want to perform: ${actionType}?`)) return;
        try {
            let endpoint = '';
            if (actionType === 'EN_ROUTE') endpoint = `/tickets/${id}/status/en-route`;
            else if (actionType === 'ARRIVED') endpoint = `/tickets/${id}/status/arrived`;

            if (endpoint) {
                await api.post(endpoint, {});
                fetchTickets(); // Refresh
            } else {
                alert('This action requires opening the ticket details page to fill out forms or OTPs.');
            }
        } catch (error: any) {
            alert(error?.response?.data?.message || 'Action failed');
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
                <p className="text-slate-500 mt-1">Your active service requests</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 flex justify-center">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="col-span-full py-16 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
                        <CheckCircle className="w-12 h-12 text-emerald-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">All caught up!</h3>
                        <p className="text-slate-500 mt-1">You have no active tickets assigned to you right now.</p>
                    </div>
                ) : (
                    tickets.map((t: any) => (
                        <div key={t.id} className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            {/* Card Header */}
                            <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                        {t.ticket_number}
                                    </span>
                                    <h3 className="font-bold text-slate-900 mt-2 text-lg">{t.service_type.replace(/_/g, ' ')}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                                            t.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                            t.priority === 'URGENT' ? 'bg-orange-100 text-orange-700' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            {t.priority}
                                        </span>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${STATUS_COLORS[t.status] || 'bg-slate-50 border-slate-200'}`}>
                                            {t.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 flex-1 bg-slate-50/50">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Merchant</p>
                                        <p className="text-sm font-semibold text-slate-900">{t.merchant_name}</p>
                                        <p className="text-sm text-slate-600">{t.merchant_mobile}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Location</p>
                                        <p className="text-sm text-slate-900 truncate">{t.merchant_address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer / Actions */}
                            <div className="p-4 border-t border-slate-100 bg-white">
                                <div className="flex flex-col gap-2">
                                    {t.status === 'ASSIGNED' && (
                                        <button 
                                            onClick={() => handleStatusAction(t.id, 'EN_ROUTE')}
                                            className="w-full flex justify-center items-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
                                        >
                                            <MapPin className="w-4 h-4" />
                                            Mark En Route
                                        </button>
                                    )}
                                    {t.status === 'EN_ROUTE' && (
                                        <button 
                                            onClick={() => handleStatusAction(t.id, 'ARRIVED')}
                                            className="w-full flex justify-center items-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors"
                                        >
                                            <MapPin className="w-4 h-4" />
                                            Mark Arrived
                                        </button>
                                    )}
                                    {t.status === 'ARRIVED_PENDING' && (
                                        <Link 
                                            href={`/dashboard/tickets/${t.id}`}
                                            className="w-full flex justify-center items-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
                                        >
                                            <Smartphone className="w-4 h-4" />
                                            Validate Arrival OTP
                                        </Link>
                                    )}
                                    
                                    <Link 
                                        href={`/dashboard/tickets/${t.id}`}
                                        className="w-full flex justify-center items-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                                    >
                                        <ClipboardList className="w-4 h-4" />
                                        Open Full Ticket
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
