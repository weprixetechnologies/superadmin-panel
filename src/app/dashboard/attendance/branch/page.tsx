"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Download, RefreshCw, Filter, Calendar, 
  ChevronLeft, ChevronRight, Eye, Building2, User
} from 'lucide-react';

import api from '@/utils/axiosInstance';

export default function BranchAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const fetchBranchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/attendance/daily?date=${date}`);
      const records = res.data?.data || [];
      
      const formatted = records.map((r: any) => ({
        id: r.id,
        employee: r.full_name || 'Unknown',
        empId: r.employee_code || '-',
        branch: r.branch_id ? `Branch ${r.branch_id}` : 'All Branches', // The exact branch name isn't joined, using ID for now
        shift: r.shift_id ? `Shift ${r.shift_id}` : 'General',
        punchIn: r.punch_in_at ? new Date(r.punch_in_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null,
        punchOut: r.punch_out_at ? new Date(r.punch_out_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null,
        hours: r.punch_in_at && r.punch_out_at 
          ? `${Math.floor((new Date(r.punch_out_at).getTime() - new Date(r.punch_in_at).getTime()) / 3600000)}h ${Math.floor(((new Date(r.punch_out_at).getTime() - new Date(r.punch_in_at).getTime()) % 3600000) / 60000)}m` 
          : '-',
        status: r.status,
      }));
      setData(formatted);
    } catch (err) {
      console.error('Failed to fetch branch attendance', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranchAttendance();
  }, [date]);

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

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Branch Attendance</h1>
          <p className="text-zinc-500 mt-1">Monitor daily attendance across all employees in your branch.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-xl hover:bg-zinc-50 font-medium transition-colors text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button onClick={fetchBranchAttendance} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors shadow-sm shadow-emerald-600/20 text-sm">
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
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-zinc-700" 
          />
        </div>
        <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 flex-1 min-w-[200px]">
          <Building2 className="w-4 h-4 text-zinc-400" />
          <select className="bg-transparent border-none outline-none text-sm w-full text-zinc-700">
            <option value="">All Branches</option>
            <option value="Downtown HQ">Downtown HQ</option>
            <option value="Northside Branch">Northside Branch</option>
          </select>
        </div>
        <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 flex-1 min-w-[200px]">
          <User className="w-4 h-4 text-zinc-400" />
          <input type="text" placeholder="Search employee..." className="bg-transparent border-none outline-none text-sm w-full text-zinc-700" />
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
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Branch</th>
                <th className="px-6 py-4 font-medium">Shift</th>
                <th className="px-6 py-4 font-medium">Punch In</th>
                <th className="px-6 py-4 font-medium">Punch Out</th>
                <th className="px-6 py-4 font-medium">Work Hours</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-zinc-100 animate-pulse rounded" />
                          <div className="h-3 w-16 bg-zinc-100 animate-pulse rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-zinc-100 animate-pulse rounded-lg" /></td>
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          {record.employee.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-900">{record.employee}</div>
                          <div className="text-xs text-zinc-500">{record.empId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{record.branch}</td>
                    <td className="px-6 py-4 text-zinc-600">{record.shift}</td>
                    <td className="px-6 py-4 text-zinc-600">{record.punchIn || '-'}</td>
                    <td className="px-6 py-4 text-zinc-600">{record.punchOut || '-'}</td>
                    <td className="px-6 py-4 text-zinc-600">{record.hours}</td>
                    <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="View Details"
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
        
        {/* Pagination Stub */}
        <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-sm text-zinc-500">
          <div>Showing 1 to 5 of 120 entries</div>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded-lg hover:bg-zinc-100 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
            <button className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 font-medium">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-zinc-100">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-zinc-100">3</button>
            <button className="p-1 rounded-lg hover:bg-zinc-100"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
