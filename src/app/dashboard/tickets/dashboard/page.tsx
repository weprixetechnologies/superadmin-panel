"use client";

import React, { useEffect, useState } from 'react';
import { 
    Ticket, 
    CheckCircle2, 
    Clock, 
    AlertTriangle, 
    Wrench, 
    Users 
} from 'lucide-react';
import api from '@/utils/axiosInstance';

export default function TicketsDashboard() {
    const [stats, setStats] = useState({
        totalOpen: 0,
        assigned: 0,
        inProgress: 0,
        pendingClosure: 0,
        closedToday: 0,
        slaBreached: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // In a real app we'd have a specific /dashboard/stats API
                // Here we fetch all tickets and compute basic stats as requested.
                const { data } = await api.get('/tickets?limit=1000');
                if (data?.success && data?.data?.tickets) {
                    const tickets = data.data.tickets;
                    const today = new Date().toDateString();
                    
                    setStats({
                        totalOpen: tickets.filter((t: any) => !['CLOSED', 'CANCELLED'].includes(t.status)).length,
                        assigned: tickets.filter((t: any) => t.status === 'ASSIGNED').length,
                        inProgress: tickets.filter((t: any) => ['IN_PROGRESS', 'MACHINE_PICKED', 'IN_OFFICE', 'UNDER_REPAIR', 'READY_DEPLOY'].includes(t.status)).length,
                        pendingClosure: tickets.filter((t: any) => t.status === 'PENDING_CLOSE').length,
                        closedToday: tickets.filter((t: any) => t.status === 'CLOSED' && new Date(t.closed_at).toDateString() === today).length,
                        slaBreached: tickets.filter((t: any) => t.sla_breached === 1 && !['CLOSED', 'CANCELLED'].includes(t.status)).length
                    });
                }
            } catch (err) {
                console.error("Failed to load tickets dashboard stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const KpiCard = ({ title, value, icon: Icon, colorClass, bgClass }: any) => (
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgClass}`}>
                <Icon className={`w-7 h-7 ${colorClass}`} />
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900">
                    {loading ? '...' : value}
                </h3>
            </div>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Tickets Overview</h1>
                <p className="text-slate-500 mt-1">Service Operations Dashboard</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <KpiCard 
                    title="Total Open Tickets" 
                    value={stats.totalOpen} 
                    icon={Ticket} 
                    colorClass="text-emerald-600" 
                    bgClass="bg-emerald-50" 
                />
                <KpiCard 
                    title="Assigned Tickets" 
                    value={stats.assigned} 
                    icon={Users} 
                    colorClass="text-blue-600" 
                    bgClass="bg-blue-50" 
                />
                <KpiCard 
                    title="In Progress" 
                    value={stats.inProgress} 
                    icon={Wrench} 
                    colorClass="text-amber-600" 
                    bgClass="bg-amber-50" 
                />
                <KpiCard 
                    title="Pending Closures" 
                    value={stats.pendingClosure} 
                    icon={Clock} 
                    colorClass="text-purple-600" 
                    bgClass="bg-purple-50" 
                />
                <KpiCard 
                    title="Closed Today" 
                    value={stats.closedToday} 
                    icon={CheckCircle2} 
                    colorClass="text-green-600" 
                    bgClass="bg-green-50" 
                />
                <KpiCard 
                    title="SLA Breached" 
                    value={stats.slaBreached} 
                    icon={AlertTriangle} 
                    colorClass="text-red-600" 
                    bgClass="bg-red-50" 
                />
            </div>

            {/* Placeholder for Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 min-h-[300px] flex items-center justify-center">
                    <p className="text-slate-400">Ticket Status Distribution Chart</p>
                </div>
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 min-h-[300px] flex items-center justify-center">
                    <p className="text-slate-400">Service Type Distribution Chart</p>
                </div>
            </div>
        </div>
    );
}
