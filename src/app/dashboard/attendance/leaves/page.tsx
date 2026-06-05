"use client";

import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, RefreshCw, Filter, Calendar, 
  ChevronLeft, ChevronRight, Eye, X, FileText, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';

import api from '@/utils/axiosInstance';

export default function MyLeavesPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);

  const [kpis, setKpis] = useState({ pending: 0, approved: 0, rejected: 0, cancelled: 0 });
  const [applyForm, setApplyForm] = useState({
    leave_type: 'CASUAL',
    start_date: '',
    end_date: '',
    reason: ''
  });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves/me');
      const leavesList = res.data?.data || [];
      setData(leavesList);

      const stats = { pending: 0, approved: 0, rejected: 0, cancelled: 0 };
      leavesList.forEach((l: any) => {
        if (l.status === 'PENDING') stats.pending++;
        else if (l.status === 'APPROVED') stats.approved++;
        else if (l.status === 'REJECTED') stats.rejected++;
        else if (l.status === 'CANCELLED') stats.cancelled++;
      });
      setKpis(stats);
    } catch (err) {
      console.error('Failed to fetch leaves', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApplyLeave = async () => {
    if (!applyForm.start_date || !applyForm.end_date || !applyForm.reason) {
      return alert("Please fill all required fields");
    }
    try {
      await api.post('/leaves', applyForm);
      setShowApplyModal(false);
      setApplyForm({ leave_type: 'CASUAL', start_date: '', end_date: '', reason: '' });
      fetchLeaves();
      alert("Leave applied successfully");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to apply leave");
    }
  };

  const handleCancelLeave = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this leave?")) return;
    try {
      await api.delete(`/leaves/${id}`);
      setShowDrawer(false);
      fetchLeaves();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to cancel leave");
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'APPROVED': return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold">Approved</span>;
      case 'REJECTED': return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold">Rejected</span>;
      case 'PENDING': return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold">Pending</span>;
      case 'CANCELLED': return <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-lg text-xs font-semibold">Cancelled</span>;
      default: return <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-lg text-xs font-semibold">{status}</span>;
    }
  };

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
          <h1 className="text-2xl font-bold text-zinc-900">My Leaves</h1>
          <p className="text-zinc-500 mt-1">Manage your leave applications and history.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchLeaves} className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-xl hover:bg-zinc-50 font-medium transition-colors text-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button onClick={() => setShowApplyModal(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors shadow-sm shadow-emerald-600/20 text-sm">
            <PlusCircle className="w-4 h-4" />
            Apply Leave
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard title="Pending" value={kpis.pending} icon={AlertCircle} colorClass={{ bg: 'bg-amber-50', text: 'text-amber-600' }} />
        <KPICard title="Approved" value={kpis.approved} icon={CheckCircle2} colorClass={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }} />
        <KPICard title="Rejected" value={kpis.rejected} icon={XCircle} colorClass={{ bg: 'bg-rose-50', text: 'text-rose-600' }} />
        <KPICard title="Cancelled" value={kpis.cancelled} icon={X} colorClass={{ bg: 'bg-zinc-100', text: 'text-zinc-600' }} />
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
                <th className="px-6 py-4 font-medium">Leave Type</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium">Days</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Applied On</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-40 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-zinc-100 animate-pulse rounded-lg" /></td>
                    <td className="px-6 py-4"><div className="h-8 w-8 bg-zinc-100 animate-pulse rounded-full ml-auto" /></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    No leaves found.
                  </td>
                </tr>
              ) : (
                data.map((leave) => (
                  <tr key={leave.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900">{leave.leave_type}</td>
                    <td className="px-6 py-4 text-zinc-600">{new Date(leave.start_date).toLocaleDateString()} to {new Date(leave.end_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-zinc-600">{leave.total_days}</td>
                    <td className="px-6 py-4 text-zinc-600 truncate max-w-xs">{leave.reason}</td>
                    <td className="px-6 py-4 text-zinc-600">{new Date(leave.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{getStatusBadge(leave.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setSelectedLeave(leave); setShowDrawer(true); }}
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
              <h2 className="text-xl font-bold text-zinc-900">Apply Leave</h2>
              <button onClick={() => setShowApplyModal(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Leave Type</label>
                <select 
                  value={applyForm.leave_type}
                  onChange={(e) => setApplyForm({...applyForm, leave_type: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow text-sm"
                >
                  <option value="SICK">Sick Leave</option>
                  <option value="CASUAL">Casual Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    value={applyForm.start_date}
                    onChange={(e) => setApplyForm({...applyForm, start_date: e.target.value})}
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    value={applyForm.end_date}
                    onChange={(e) => setApplyForm({...applyForm, end_date: e.target.value})}
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow text-sm" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Reason</label>
                <textarea 
                  rows={3} 
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({...applyForm, reason: e.target.value})}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow text-sm"
                  placeholder="Explain your reason for leave..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Attachment (Optional)</label>
                <div className="border-2 border-dashed border-zinc-200 rounded-xl p-6 flex flex-col items-center justify-center bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer">
                  <FileText className="w-8 h-8 text-zinc-400 mb-2" />
                  <span className="text-sm font-medium text-emerald-600">Click to upload</span>
                  <span className="text-xs text-zinc-500 mt-1">PDF, JPG, PNG (Max 5MB)</span>
                </div>
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
                onClick={handleApplyLeave}
                className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm shadow-emerald-600/20"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {showDrawer && selectedLeave && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowDrawer(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform animate-in slide-in-from-right flex flex-col">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Leave Details</h2>
                <p className="text-sm text-zinc-500">{selectedLeave.type} Leave</p>
              </div>
              <button onClick={() => setShowDrawer(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-semibold">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedLeave.status)}</div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500 uppercase font-semibold">Applied On</p>
                  <p className="mt-1 font-medium text-zinc-900">{new Date(selectedLeave.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-900 mb-3">Leave Information</h3>
                <div className="space-y-3 bg-white border border-zinc-100 rounded-2xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">From Date</span>
                    <span className="font-medium text-zinc-900">{new Date(selectedLeave.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">To Date</span>
                    <span className="font-medium text-zinc-900">{new Date(selectedLeave.end_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Total Days</span>
                    <span className="font-medium text-zinc-900">{selectedLeave.total_days} Days</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-900 mb-3">Reason</h3>
                <div className="bg-white border border-zinc-100 rounded-2xl p-4 text-sm text-zinc-700">
                  {selectedLeave.reason}
                </div>
              </div>

              {selectedLeave.status === 'PENDING' && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-800">
                      This leave request is currently pending review by your branch manager. You may cancel it if it's no longer required.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {selectedLeave.status === 'PENDING' && (
              <div className="p-6 border-t border-zinc-100 shrink-0">
                <button 
                  onClick={() => handleCancelLeave(selectedLeave.id)}
                  className="w-full py-2.5 bg-rose-50 text-rose-600 rounded-xl font-medium hover:bg-rose-100 transition-colors"
                >
                  Cancel Leave Request
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
