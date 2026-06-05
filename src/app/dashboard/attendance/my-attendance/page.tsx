"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Download, RefreshCw, Filter, Calendar, 
  ChevronLeft, ChevronRight, Eye, AlertCircle, X, Check, Clock 
} from 'lucide-react';
import api from '@/utils/axiosInstance';

const mockAttendance = [
  { id: '1', date: '2026-06-04', shift: 'MORNING (09:00 - 18:00)', punchIn: '08:55', punchOut: '18:10', hours: '9h 15m', overtime: '10m', status: 'PRESENT', regularised: false },
  { id: '2', date: '2026-06-03', shift: 'MORNING (09:00 - 18:00)', punchIn: '09:15', punchOut: '18:00', hours: '8h 45m', overtime: '0m', status: 'PRESENT', regularised: true },
  { id: '3', date: '2026-06-02', shift: 'MORNING (09:00 - 18:00)', punchIn: null, punchOut: null, hours: '-', overtime: '-', status: 'ABSENT', regularised: false },
  { id: '4', date: '2026-06-01', shift: 'MORNING (09:00 - 18:00)', punchIn: null, punchOut: null, hours: '-', overtime: '-', status: 'ON_LEAVE', regularised: false },
  { id: '5', date: '2026-05-31', shift: 'MORNING (09:00 - 18:00)', punchIn: null, punchOut: null, hours: '-', overtime: '-', status: 'HOLIDAY', regularised: false },
  { id: '6', date: '2026-05-30', shift: 'MORNING (09:00 - 18:00)', punchIn: '09:00', punchOut: '14:00', hours: '5h 0m', overtime: '0m', status: 'HALF_DAY', regularised: false },
];

export default function MyAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [regReason, setRegReason] = useState('');
  
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(1)).toISOString().slice(0, 10),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10),
  });

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/attendance/me?from_date=${dateRange.from}&to_date=${dateRange.to}`);
      const records = res.data?.data || [];
      
      const formatted = records.map((r: any) => ({
        id: r.id,
        date: new Date(r.attendance_date).toISOString().slice(0, 10),
        shift: r.shift_id ? `Shift ID: ${r.shift_id}` : 'General',
        punchIn: r.punch_in_at ? new Date(r.punch_in_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null,
        punchOut: r.punch_out_at ? new Date(r.punch_out_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null,
        hours: r.punch_in_at && r.punch_out_at 
          ? `${Math.floor((new Date(r.punch_out_at).getTime() - new Date(r.punch_in_at).getTime()) / 3600000)}h ${Math.floor(((new Date(r.punch_out_at).getTime() - new Date(r.punch_in_at).getTime()) % 3600000) / 60000)}m` 
          : '-',
        overtime: r.overtime_minutes ? `${Math.floor(r.overtime_minutes / 60)}h ${r.overtime_minutes % 60}m` : '0m',
        status: r.status,
        regularised: r.is_regularised === 1
      }));
      setData(formatted);
    } catch (err) {
      console.error('Failed to fetch attendance', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, [dateRange]);

  const submitRegularisation = async () => {
    if (!regReason.trim()) return alert("Reason is required");
    try {
      await api.post('/attendance/regularise', {
        attendance_id: selectedRecord.id,
        reason: regReason
      });
      setShowRegModal(false);
      setRegReason('');
      fetchMyAttendance();
      alert("Regularisation request submitted successfully");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit regularisation");
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PRESENT': return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold">Present</span>;
      case 'ABSENT': return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold">Absent</span>;
      case 'ON_LEAVE': return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">Leave</span>;
      case 'HALF_DAY': return <span className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-semibold">Half Day</span>;
      case 'HOLIDAY': return <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold">Holiday</span>;
      default: return <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-lg text-xs font-semibold">{status}</span>;
    }
  };

  const openDetails = (record: any) => {
    setSelectedRecord(record);
    setShowDrawer(true);
  };

  const openRegularisation = (record: any) => {
    setSelectedRecord(record);
    setShowRegModal(true);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">My Attendance</h1>
          <p className="text-zinc-500 mt-1">View your personal attendance history and request regularisations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-xl hover:bg-zinc-50 font-medium transition-colors text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button onClick={fetchMyAttendance} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors shadow-sm shadow-emerald-600/20 text-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 flex-1 min-w-[200px]">
          <Calendar className="w-4 h-4 text-zinc-400" />
          <input 
            type="date" 
            value={dateRange.from}
            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            className="bg-transparent border-none outline-none text-sm w-full text-zinc-700" 
          />
        </div>
        <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 flex-1 min-w-[200px]">
          <span className="text-zinc-400 text-sm">to</span>
          <input 
            type="date" 
            value={dateRange.to}
            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            className="bg-transparent border-none outline-none text-sm w-full text-zinc-700" 
          />
        </div>
        <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 flex-1 min-w-[200px]">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select className="bg-transparent border-none outline-none text-sm w-full text-zinc-700">
            <option value="">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="ON_LEAVE">On Leave</option>
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
                <th className="px-6 py-4 font-medium">Shift</th>
                <th className="px-6 py-4 font-medium">Punch In</th>
                <th className="px-6 py-4 font-medium">Punch Out</th>
                <th className="px-6 py-4 font-medium">Work Hours</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-center">Regularised</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-zinc-100 animate-pulse rounded-lg" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 bg-zinc-100 animate-pulse rounded mx-auto" /></td>
                    <td className="px-6 py-4"><div className="h-8 w-8 bg-zinc-100 animate-pulse rounded-full ml-auto" /></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-zinc-500">
                    No attendance records found for this period.
                  </td>
                </tr>
              ) : (
                data.map((record) => (
                  <tr key={record.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900">{record.date}</td>
                    <td className="px-6 py-4 text-zinc-600">{record.shift}</td>
                    <td className="px-6 py-4 text-zinc-600">{record.punchIn || '-'}</td>
                    <td className="px-6 py-4 text-zinc-600">{record.punchOut || '-'}</td>
                    <td className="px-6 py-4 text-zinc-600">{record.hours}</td>
                    <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                    <td className="px-6 py-4 text-center">
                      {record.regularised ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {record.status !== 'HOLIDAY' && record.status !== 'ON_LEAVE' && (
                          <button 
                            onClick={() => openRegularisation(record)}
                            className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip-trigger"
                            title="Request Regularisation"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => openDetails(record)}
                          className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Stub */}
        <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-sm text-zinc-500">
          <div>Showing 1 to 10 of 45 entries</div>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded-lg hover:bg-zinc-100 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
            <button className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 font-medium">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-zinc-100">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-zinc-100">3</button>
            <button className="p-1 rounded-lg hover:bg-zinc-100"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {showDrawer && selectedRecord && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowDrawer(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform animate-in slide-in-from-right flex flex-col">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Attendance Details</h2>
                <p className="text-sm text-zinc-500">{selectedRecord.date}</p>
              </div>
              <button onClick={() => setShowDrawer(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-semibold">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedRecord.status)}</div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500 uppercase font-semibold">Regularised</p>
                  <p className="mt-1 font-medium text-zinc-900">{selectedRecord.regularised ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-900 mb-3">Time Information</h3>
                <div className="space-y-3 bg-white border border-zinc-100 rounded-2xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Shift</span>
                    <span className="font-medium text-zinc-900">{selectedRecord.shift}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Punch In</span>
                    <span className="font-medium text-zinc-900">{selectedRecord.punchIn || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Punch Out</span>
                    <span className="font-medium text-zinc-900">{selectedRecord.punchOut || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Working Hours</span>
                    <span className="font-medium text-zinc-900">{selectedRecord.hours}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Overtime</span>
                    <span className="font-medium text-zinc-900">{selectedRecord.overtime}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-900 mb-3">System Data</h3>
                <div className="space-y-3 bg-white border border-zinc-100 rounded-2xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Created At</span>
                    <span className="text-zinc-700">2026-06-04 09:00:12</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Updated At</span>
                    <span className="text-zinc-700">2026-06-04 18:10:05</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-zinc-100 shrink-0">
              <button 
                onClick={() => { setShowDrawer(false); openRegularisation(selectedRecord); }}
                className="w-full py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors"
              >
                Request Regularisation
              </button>
            </div>
          </div>
        </>
      )}

      {/* Regularisation Modal */}
      {showRegModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowRegModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">Request Regularisation</h2>
              <button onClick={() => setShowRegModal(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-4">
                You are requesting a time correction for <strong>{selectedRecord.date}</strong>. This request will be sent to your manager for approval.
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Requested Punch In</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input type="time" defaultValue={selectedRecord.punchIn || "09:00"} className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Requested Punch Out</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input type="time" defaultValue={selectedRecord.punchOut || "18:00"} className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Reason for Regularisation</label>
                <textarea 
                  rows={4} 
                  value={regReason}
                  onChange={(e) => setRegReason(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow text-sm"
                  placeholder="E.g., Forgot to punch in due to network issues..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-zinc-100 flex items-center justify-end gap-3 bg-zinc-50/50">
              <button 
                onClick={() => setShowRegModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submitRegularisation}
                className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm shadow-emerald-600/20"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
