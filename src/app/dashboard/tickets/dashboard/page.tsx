"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { 
    Ticket, 
    CheckCircle2, 
    Clock, 
    AlertTriangle, 
    Wrench, 
    Users 
} from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import api from '@/utils/axiosInstance';

// ── Status groupings (must match KPI card logic) ─────────────────────────────
const STATUS_GROUPS: Record<string, string> = {
    NEW:            'New',
    ASSIGNED:       'Assigned',
    EN_ROUTE:       'En Route',
    ARRIVED_PENDING:'Arrived Pending',
    IN_PROGRESS:    'In Progress',
    MACHINE_PICKED: 'In Progress',
    IN_OFFICE:      'In Progress',
    UNDER_REPAIR:   'In Progress',
    READY_DEPLOY:   'In Progress',
    PENDING_CLOSE:  'Pending Closure',
    CLOSED:         'Closed',
    CANCELLED:      'Cancelled',
};

const GROUP_COLORS: Record<string, string> = {
    'New':              '#6366f1', // indigo
    'Assigned':         '#3b82f6', // blue
    'En Route':         '#0ea5e9', // sky
    'Arrived Pending':  '#14b8a6', // teal
    'In Progress':      '#f59e0b', // amber
    'Pending Closure':  '#ec4899', // pink
    'Closed':           '#22c55e', // green
    'Cancelled':        '#94a3b8', // slate
};

// ── Service type labels from DB enum ─────────────────────────────────────────
const SERVICE_TYPE_LABELS: Record<string, string> = {
    REPAIR:         'Repair',
    PICKUP:         'Pickup',
    REPLACEMENT:    'Replacement',
    INSTALLATION:   'Installation',
    DEINSTALLATION: 'Deinstallation',
    MISC_SERV:      'Misc Service',
};

const SERVICE_COLORS = [
    '#6366f1', '#3b82f6', '#14b8a6', '#f59e0b',
    '#ec4899', '#8b5cf6', '#f97316', '#22c55e',
];

// ── Custom tooltip ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
        <div className="bg-white/95 backdrop-blur px-4 py-2.5 rounded-xl shadow-lg border border-slate-200 text-sm">
            <p className="font-semibold text-slate-800">{d.name || d.payload?.name}</p>
            <p className="text-slate-500">{d.value} ticket{d.value !== 1 ? 's' : ''}</p>
        </div>
    );
};

// ── Custom pie label ──────────────────────────────────────────────────────────
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" className="text-[11px] font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export default function TicketsDashboard() {
    const [tickets, setTickets] = useState<any[]>([]);
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
                const { data } = await api.get('/tickets?limit=1000');
                if (data?.success && data?.data?.tickets) {
                    const tkts = data.data.tickets;
                    setTickets(tkts);
                    const today = new Date().toDateString();
                    
                    setStats({
                        totalOpen: tkts.filter((t: any) => !['CLOSED', 'CANCELLED'].includes(t.status)).length,
                        assigned: tkts.filter((t: any) => t.status === 'ASSIGNED').length,
                        inProgress: tkts.filter((t: any) => ['IN_PROGRESS', 'MACHINE_PICKED', 'IN_OFFICE', 'UNDER_REPAIR', 'READY_DEPLOY'].includes(t.status)).length,
                        pendingClosure: tkts.filter((t: any) => t.status === 'PENDING_CLOSE').length,
                        closedToday: tkts.filter((t: any) => t.status === 'CLOSED' && new Date(t.closed_at).toDateString() === today).length,
                        slaBreached: tkts.filter((t: any) => t.sla_breached === 1 && !['CLOSED', 'CANCELLED'].includes(t.status)).length
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

    // ── Chart data (grouped to match KPI cards) ───────────────────────────────
    const statusData = useMemo(() => {
        const counts: Record<string, number> = {};
        tickets.forEach((t: any) => {
            const group = STATUS_GROUPS[t.status] || t.status;
            counts[group] = (counts[group] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value, key: name }))
            .sort((a, b) => b.value - a.value);
    }, [tickets]);

    const serviceData = useMemo(() => {
        const counts: Record<string, number> = {};
        tickets.forEach((t: any) => {
            const svc = t.service_type || 'Unknown';
            counts[svc] = (counts[svc] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([key, value]) => ({ name: SERVICE_TYPE_LABELS[key] || key, value, key }))
            .sort((a, b) => b.value - a.value);
    }, [tickets]);

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

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── Status Distribution (Donut) ─────────────────────────── */}
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 min-h-[380px]">
                    <h3 className="text-base font-bold text-slate-800 mb-1">Ticket Status Distribution</h3>
                    <p className="text-xs text-slate-400 mb-4">Breakdown of all tickets by current status</p>

                    {loading ? (
                        <div className="flex items-center justify-center h-[280px]">
                            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                        </div>
                    ) : statusData.length === 0 ? (
                        <div className="flex items-center justify-center h-[280px] text-slate-400 text-sm">No ticket data available</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={290}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={110}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={renderPieLabel}
                                    labelLine={false}
                                    stroke="none"
                                >
                                    {statusData.map((entry, idx) => (
                                        <Cell
                                            key={entry.key}
                                            fill={GROUP_COLORS[entry.key] || SERVICE_COLORS[idx % SERVICE_COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<ChartTooltip />} />
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    formatter={(value: string) => <span className="text-xs text-slate-600">{value}</span>}
                                    wrapperStyle={{ paddingTop: 12 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* ── Service Type Distribution (Bar) ──────────────────────── */}
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 min-h-[380px]">
                    <h3 className="text-base font-bold text-slate-800 mb-1">Service Type Distribution</h3>
                    <p className="text-xs text-slate-400 mb-4">Number of tickets by service type</p>

                    {loading ? (
                        <div className="flex items-center justify-center h-[280px]">
                            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                        </div>
                    ) : serviceData.length === 0 ? (
                        <div className="flex items-center justify-center h-[280px] text-slate-400 text-sm">No ticket data available</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={290}>
                            <BarChart data={serviceData} barSize={36}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                    interval={0}
                                    angle={serviceData.length > 4 ? -30 : 0}
                                    textAnchor={serviceData.length > 4 ? 'end' : 'middle'}
                                    height={serviceData.length > 4 ? 60 : 30}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]} name="Tickets">
                                    {serviceData.map((_, idx) => (
                                        <Cell key={idx} fill={SERVICE_COLORS[idx % SERVICE_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}
