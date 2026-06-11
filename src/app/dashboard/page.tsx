"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import {
  Ticket, CheckCircle2, Clock, AlertTriangle, Wrench, Users,
  X, MapPin, Phone, User, Calendar, Hash, ArrowRight, Search,
  ClipboardList, XCircle
} from 'lucide-react';
import api from '../../utils/axiosInstance';

const APP_ROLE = 'SUPERADMIN';

// ── Status styling ────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  NEW:             { bg: 'bg-indigo-50',  text: 'text-indigo-700' },
  ASSIGNED:        { bg: 'bg-blue-50',    text: 'text-blue-700' },
  EN_ROUTE:        { bg: 'bg-sky-50',     text: 'text-sky-700' },
  ARRIVED_PENDING: { bg: 'bg-violet-50',  text: 'text-violet-700' },
  IN_PROGRESS:     { bg: 'bg-amber-50',   text: 'text-amber-700' },
  MACHINE_PICKED:  { bg: 'bg-orange-50',  text: 'text-orange-700' },
  IN_OFFICE:       { bg: 'bg-purple-50',  text: 'text-purple-700' },
  UNDER_REPAIR:    { bg: 'bg-pink-50',    text: 'text-pink-700' },
  READY_DEPLOY:    { bg: 'bg-teal-50',    text: 'text-teal-700' },
  PENDING_CLOSE:   { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700' },
  CLOSED:          { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  CANCELLED:       { bg: 'bg-slate-100',  text: 'text-slate-600' },
};

const SERVICE_LABELS: Record<string, string> = {
  REPAIR: 'Repair', PICKUP: 'Pickup', REPLACEMENT: 'Replacement',
  INSTALLATION: 'Installation', DEINSTALLATION: 'Deinstallation', MISC_SERV: 'Misc Service',
};

const PRIORITY_STYLE: Record<string, { bg: string; text: string }> = {
  NORMAL:   { bg: 'bg-slate-100',  text: 'text-slate-600' },
  URGENT:   { bg: 'bg-amber-50',   text: 'text-amber-700' },
  CRITICAL: { bg: 'bg-red-50',     text: 'text-red-700' },
};

function prettifyStatus(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== APP_ROLE)) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const fetchTickets = async () => {
      try {
        const { data } = await api.get('/tickets?limit=200');
        if (data?.success && data?.data?.tickets) {
          setTickets(data.data.tickets);
        }
      } catch (err) {
        console.error('Failed to fetch tickets', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-[#64748B] font-medium">Loading workspace...</div>
      </div>
    );
  }

  if (!user) return null;

  // ── Stats ─────────────────────────────────────────────────────────────────
  const today = new Date().toDateString();
  const totalOpen = tickets.filter(t => !['CLOSED', 'CANCELLED'].includes(t.status)).length;
  const closedToday = tickets.filter(t => t.status === 'CLOSED' && t.closed_at && new Date(t.closed_at).toDateString() === today).length;
  const inProgress = tickets.filter(t => ['IN_PROGRESS', 'MACHINE_PICKED', 'IN_OFFICE', 'UNDER_REPAIR', 'READY_DEPLOY'].includes(t.status)).length;
  const slaBreached = tickets.filter(t => t.sla_breached === 1 && !['CLOSED', 'CANCELLED'].includes(t.status)).length;

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredTickets = tickets.filter(t => {
    if (statusFilter === 'OPEN') return !['CLOSED', 'CANCELLED'].includes(t.status);
    if (statusFilter === 'CLOSED') return t.status === 'CLOSED';
    if (statusFilter === 'CANCELLED') return t.status === 'CANCELLED';
    return true; // ALL
  }).filter(t => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      t.ticket_number?.toLowerCase().includes(s) ||
      t.merchant_name?.toLowerCase().includes(s) ||
      t.merchant_mobile?.includes(s) ||
      t.serial_number?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight mb-2">Dashboard</h1>
          <p className="text-[#64748B] text-sm">Welcome back, {user.full_name}. Here&apos;s your ticket overview.</p>
        </div>
        <Link
          href="/dashboard/tickets"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
        >
          View All Tickets
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Total Open" value={loading ? '...' : totalOpen} icon={ClipboardList} colorClass="text-white" bgClass="bg-emerald-600" isPrimary />
        <KpiCard title="In Progress" value={loading ? '...' : inProgress} icon={Wrench} colorClass="text-amber-600" bgClass="bg-white" />
        <KpiCard title="Closed Today" value={loading ? '...' : closedToday} icon={CheckCircle2} colorClass="text-emerald-600" bgClass="bg-white" />
        <KpiCard title="SLA Breached" value={loading ? '...' : slaBreached} icon={AlertTriangle} colorClass="text-red-600" bgClass="bg-white" isDanger={slaBreached > 0} />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[7fr_3fr] gap-6">
        {/* ── Recent Tickets Table ──────────────────────────────────────── */}
        <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-sm flex flex-col min-h-[500px]">
          {/* Table Controls */}
          <div className="p-4 border-b border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-1 bg-zinc-100 rounded-xl p-1">
              {['ALL', 'OPEN', 'CLOSED', 'CANCELLED'].map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === f
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  {f === 'ALL' ? 'All' : f === 'OPEN' ? 'Open' : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                <Ticket className="w-10 h-10 mb-3" />
                <p className="text-sm font-medium">No tickets found</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-200">
                    <th className="px-5 py-3 text-xs font-semibold text-zinc-500 uppercase">Ticket</th>
                    <th className="px-5 py-3 text-xs font-semibold text-zinc-500 uppercase">Merchant</th>
                    <th className="px-5 py-3 text-xs font-semibold text-zinc-500 uppercase">Service</th>
                    <th className="px-5 py-3 text-xs font-semibold text-zinc-500 uppercase">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-zinc-500 uppercase">Priority</th>
                    <th className="px-5 py-3 text-xs font-semibold text-zinc-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredTickets.slice(0, 20).map(t => {
                    const ss = STATUS_STYLE[t.status] || STATUS_STYLE.NEW;
                    const ps = PRIORITY_STYLE[t.priority] || PRIORITY_STYLE.NORMAL;
                    const isSelected = selected?.id === t.id;
                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelected(t)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-emerald-50/60' : 'hover:bg-zinc-50/50'
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-semibold text-zinc-900 font-mono">{t.ticket_number}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-sm font-medium text-zinc-900">{t.merchant_name}</div>
                          <div className="text-xs text-zinc-500">{t.merchant_mobile}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-zinc-700">{SERVICE_LABELS[t.service_type] || t.service_type}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${ss.bg} ${ss.text}`}>
                            {prettifyStatus(t.status)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${ps.bg} ${ps.text}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-zinc-500">{timeAgo(t.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          {!loading && filteredTickets.length > 0 && (
            <div className="p-4 border-t border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <p className="text-xs text-zinc-500">
                Showing {Math.min(20, filteredTickets.length)} of {filteredTickets.length} tickets
              </p>
              <Link
                href="/dashboard/tickets"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                View all →
              </Link>
            </div>
          )}
        </div>

        {/* ── Detail Panel ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-sm sticky top-[120px] overflow-hidden flex flex-col h-[calc(100vh-140px)]">
          {selected ? (
            <>
              <div className="p-5 border-b border-zinc-200 flex items-center justify-between shrink-0">
                <h2 className="text-base font-bold text-zinc-900">Ticket Details</h2>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Title */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-lg font-bold text-zinc-900">{selected.ticket_number}</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${(STATUS_STYLE[selected.status] || STATUS_STYLE.NEW).bg} ${(STATUS_STYLE[selected.status] || STATUS_STYLE.NEW).text}`}>
                      {prettifyStatus(selected.status)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500">{SERVICE_LABELS[selected.service_type] || selected.service_type} • {selected.priority}</p>
                </div>

                <hr className="border-zinc-100" />

                {/* Merchant Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Merchant</h4>
                  <div className="space-y-2.5">
                    <InfoRow icon={User} label={selected.merchant_name} sub={selected.business_name} />
                    <InfoRow icon={Phone} label={selected.merchant_mobile} />
                    <InfoRow icon={MapPin} label={selected.merchant_address} sub={`Pincode: ${selected.merchant_pincode}`} />
                  </div>
                </div>

                <hr className="border-zinc-100" />

                {/* Machine Info */}
                {(selected.serial_number || selected.tid) && (
                  <>
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Machine</h4>
                      <div className="space-y-2.5">
                        {selected.serial_number && <InfoRow icon={Hash} label={`S/N: ${selected.serial_number}`} />}
                        {selected.tid && <InfoRow icon={Hash} label={`TID: ${selected.tid}`} />}
                        {selected.machine_model && <InfoRow icon={Wrench} label={selected.machine_model} />}
                      </div>
                    </div>
                    <hr className="border-zinc-100" />
                  </>
                )}

                {/* Timestamps */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Timeline</h4>
                  <div className="space-y-2.5">
                    <InfoRow icon={Calendar} label={`Created: ${new Date(selected.created_at).toLocaleString()}`} />
                    {selected.assigned_at && <InfoRow icon={Users} label={`Assigned: ${new Date(selected.assigned_at).toLocaleString()}`} />}
                    {selected.closed_at && <InfoRow icon={CheckCircle2} label={`Closed: ${new Date(selected.closed_at).toLocaleString()}`} />}
                    {selected.sla_due_at && (
                      <InfoRow
                        icon={Clock}
                        label={`SLA Due: ${new Date(selected.sla_due_at).toLocaleString()}`}
                        danger={selected.sla_breached === 1}
                      />
                    )}
                  </div>
                </div>

                {/* Complaint */}
                {selected.complaint_description && (
                  <>
                    <hr className="border-zinc-100" />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Complaint</h4>
                      {selected.complaint_category && (
                        <p className="text-xs font-semibold text-zinc-700 mb-1">{selected.complaint_category}</p>
                      )}
                      <p className="text-sm text-zinc-600 leading-relaxed">{selected.complaint_description}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-zinc-200 bg-white shrink-0">
                <Link
                  href={`/dashboard/tickets/${selected.id}`}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  Open Full Details
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                <Ticket className="w-8 h-8 text-zinc-300" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-1">No ticket selected</h3>
              <p className="text-sm text-zinc-500 max-w-[200px]">Click on a ticket from the table to view its details here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({ title, value, icon: Icon, colorClass, bgClass, isPrimary, isDanger }: any) {
  return (
    <div className={`h-[130px] rounded-[20px] p-5 relative overflow-hidden flex flex-col justify-between border ${
      isPrimary
        ? 'bg-emerald-600 border-transparent text-white shadow-lg shadow-emerald-600/20'
        : isDanger
          ? 'bg-white border-red-200 text-zinc-900 shadow-sm'
          : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
    }`}>
      <div className="flex justify-between items-start">
        <h3 className={`text-sm font-medium ${isPrimary ? 'text-white/90' : 'text-zinc-500'}`}>{title}</h3>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
          isPrimary ? 'bg-white/15' : 'bg-zinc-50 border border-zinc-200'
        }`}>
          <Icon className={`w-[18px] h-[18px] ${isPrimary ? 'text-white' : colorClass}`} />
        </div>
      </div>
      <div className={`text-3xl font-bold tracking-tight ${isPrimary ? 'text-white' : ''}`}>
        {value}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, sub, danger }: { icon: any; label: string; sub?: string; danger?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${danger ? 'text-red-500' : 'text-zinc-400'}`} />
      <div>
        <p className={`text-sm ${danger ? 'text-red-600 font-semibold' : 'text-zinc-700'}`}>{label}</p>
        {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
