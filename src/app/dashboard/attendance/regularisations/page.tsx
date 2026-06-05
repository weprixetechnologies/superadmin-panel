"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, RefreshCw, Filter, Calendar, 
  ChevronLeft, ChevronRight, Eye, AlertCircle, CheckCircle2, XCircle, X, Clock
} from 'lucide-react';

const mockRegs = [
  { id: '1', date: '2026-06-02', currentStatus: 'ABSENT', requestedIn: '09:00', requestedOut: '18:00', reason: 'Forgot to punch in', status: 'PENDING', submittedOn: '2026-06-03' },
  { id: '2', date: '2026-05-28', currentStatus: 'HALF_DAY', requestedIn: '09:00', requestedOut: '18:15', reason: 'System was down when leaving', status: 'APPROVED', submittedOn: '2026-05-29' },
  { id: '3', date: '2026-05-20', currentStatus: 'ABSENT', requestedIn: '10:00', requestedOut: '18:00', reason: 'Arrived late', status: 'REJECTED', submittedOn: '2026-05-21' },
];

export default function RegularisationsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [selectedReg, setSelectedReg] = useState<any>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(mockRegs);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'APPROVED': return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold">Approved</span>;
      case 'REJECTED': return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold">Rejected</span>;
      case 'PENDING': return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold">Pending</span>;
      case 'CANCELLED': return <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-lg text-xs font-semibold">Cancelled</span>;
      default: return <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-lg text-xs font-semibold">{status}</span>;
    }
  };

  const getAttendanceBadge = (status: string) => {
    switch(status) {
      case 'ABSENT': return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold">Absent</span>;
      case 'HALF_DAY': return <span className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-semibold">Half Day</span>;
      default: return <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-lg text-xs font-semibold">{status}</span>;
    }
  }

  const KPICard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colorClass.bg}`}>
        <Icon className={`w-6 h-6 ${colorClass.text}`} />
      </div>
      <div>
        <h3 className="text-zinc-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-zinc-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">My Regularisations</h1>
          <p className="text-zinc-500 mt-1">Track your attendance correction requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setLoading(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-xl hover:bg-zinc-50 font-medium transition-colors text-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button onClick={() => setShowApplyModal(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors shadow-sm shadow-emerald-600/20 text-sm">
            <AlertCircle className="w-4 h-4" />
            Request Regularisation
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard title="Pending" value="1" icon={AlertCircle} colorClass={{ bg: 'bg-amber-50', text: 'text-amber-600' }} />
        <KPICard title="Approved" value="4" icon={CheckCircle2} colorClass={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }} />
        <KPICard title="Rejected" value="1" icon={XCircle} colorClass={{ bg: 'bg-rose-50', text: 'text-rose-600' }} />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 flex-1 min-w-[200px]">
          <Calendar className="w-4 h-4 text-zinc-400" />
          <input type="month" defaultValue="2026-06" className="bg-transparent border-none outline-none text-sm w-full text-zinc-700" />
        </div>
        <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 flex-1 min-w-[200px]">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select className="bg-transparent border-none outline-none text-sm w-full text-zinc-700">
            <option value="">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Current Status</th>
                <th className="px-6 py-4 font-medium">Requested In</th>
                <th className="px-6 py-4 font-medium">Requested Out</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Submitted On</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-zinc-100 animate-pulse rounded-lg" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-40 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-zinc-100 animate-pulse rounded-lg" /></td>
                    <td className="px-6 py-4"><div className="h-8 w-8 bg-zinc-100 animate-pulse rounded-full ml-auto" /></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-zinc-500">
                    No regularisation requests found.
                  </td>
                </tr>
              ) : (
                data.map((reg) => (
                  <tr key={reg.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900">{reg.date}</td>
                    <td className="px-6 py-4">{getAttendanceBadge(reg.currentStatus)}</td>
                    <td className="px-6 py-4 text-zinc-600">{reg.requestedIn}</td>
                    <td className="px-6 py-4 text-zinc-600">{reg.requestedOut}</td>
                    <td className="px-6 py-4 text-zinc-600 truncate max-w-[200px]">{reg.reason}</td>
                    <td className="px-6 py-4 text-zinc-600">{reg.submittedOn}</td>
                    <td className="px-6 py-4">{getStatusBadge(reg.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setSelectedReg(reg); setShowDrawer(true); }}
                        className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowApplyModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">Request Regularisation</h2>
              <button onClick={() => setShowApplyModal(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Attendance Date</label>
                <input type="date" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow text-sm" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Requested Punch In</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input type="time" defaultValue="09:00" className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Requested Punch Out</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input type="time" defaultValue="18:00" className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Reason for Regularisation</label>
                <textarea 
                  rows={4} 
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow text-sm"
                  placeholder="Explain why the system needs correction..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-zinc-100 flex items-center justify-end gap-3 bg-zinc-50/50">
              <button 
                onClick={() => setShowApplyModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm shadow-emerald-600/20"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {showDrawer && selectedReg && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowDrawer(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform animate-in slide-in-from-right flex flex-col">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Regularisation Details</h2>
                <p className="text-sm text-zinc-500">{selectedReg.date}</p>
              </div>
              <button onClick={() => setShowDrawer(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-semibold">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedReg.status)}</div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500 uppercase font-semibold">Submitted On</p>
                  <p className="mt-1 font-medium text-zinc-900">{selectedReg.submittedOn}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-900 mb-3">Attendance Information</h3>
                <div className="space-y-3 bg-white border border-zinc-100 rounded-2xl p-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">Current Status</span>
                    {getAttendanceBadge(selectedReg.currentStatus)}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Requested Punch In</span>
                    <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{selectedReg.requestedIn}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Requested Punch Out</span>
                    <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{selectedReg.requestedOut}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-900 mb-3">Reason</h3>
                <div className="bg-white border border-zinc-100 rounded-2xl p-4 text-sm text-zinc-700">
                  {selectedReg.reason}
                </div>
              </div>

              {selectedReg.status === 'PENDING' && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-800">
                      This request is currently pending review by your branch manager. 
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {selectedReg.status === 'PENDING' && (
              <div className="p-6 border-t border-zinc-100 shrink-0">
                <button 
                  onClick={() => setShowDrawer(false)}
                  className="w-full py-2.5 bg-rose-50 text-rose-600 rounded-xl font-medium hover:bg-rose-100 transition-colors"
                >
                  Cancel Request
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
