"use client";

import React, { useState } from 'react';
import { 
  Download, Calendar, Building2, Clock, CalendarX2, BarChart3, TrendingUp
} from 'lucide-react';

import api from '@/utils/axiosInstance';

export default function AttendanceReportsPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('2026-05');

  const KPICard = ({ title, value, icon: Icon, colorClass, trend }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 flex items-start justify-between">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colorClass.bg}`}>
          <Icon className={`w-6 h-6 ${colorClass.text}`} />
        </div>
        <div>
          <h3 className="text-zinc-500 text-sm font-medium">{title}</h3>
          <p className="text-2xl font-bold text-zinc-900 mt-1">{value}</p>
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${trend.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          <TrendingUp className={`w-3 h-3 ${!trend.isUp && 'rotate-180'}`} />
          {trend.value}
        </div>
      )}
    </div>
  );

  const generateReport = async () => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split('-');
      const res = await api.get(`/attendance/summary?year=${year}&month=${month}`);
      setData(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch report', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Attendance Reports</h1>
          <p className="text-zinc-500 mt-1">Generate comprehensive workforce analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors shadow-sm shadow-emerald-600/20 text-sm">
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>
      </div>

      {/* Reports Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 flex-1 min-w-[200px]">
          <Calendar className="w-4 h-4 text-zinc-400" />
          <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-zinc-700" />
        </div>
        <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 flex-1 min-w-[200px]">
          <Building2 className="w-4 h-4 text-zinc-400" />
          <select className="bg-transparent border-none outline-none text-sm w-full text-zinc-700">
            <option value="">All Branches</option>
            <option value="Downtown HQ">Downtown HQ</option>
            <option value="Northside Branch">Northside Branch</option>
          </select>
        </div>
        <button 
          onClick={generateReport}
          className="px-6 py-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 font-medium transition-colors text-sm whitespace-nowrap"
        >
          Generate Report
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
          title="Total Working Hours" 
          value="585h" 
          icon={Clock} 
          colorClass={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }} 
          trend={{ isUp: true, value: '5.2%' }}
        />
        <KPICard 
          title="Overtime Hours" 
          value="32h" 
          icon={BarChart3} 
          colorClass={{ bg: 'bg-blue-50', text: 'text-blue-600' }} 
          trend={{ isUp: true, value: '1.1%' }}
        />
        <KPICard 
          title="Absenteeism Rate" 
          value="2.8%" 
          icon={CalendarX2} 
          colorClass={{ bg: 'bg-rose-50', text: 'text-rose-600' }} 
          trend={{ isUp: false, value: '0.4%' }}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <h2 className="text-lg font-bold text-zinc-900">Report Preview</h2>
          <span className="text-sm text-zinc-500">{selectedMonth} • {data.length} Records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Branch</th>
                <th className="px-6 py-4 font-medium text-center">Total Days</th>
                <th className="px-6 py-4 font-medium text-center">Present</th>
                <th className="px-6 py-4 font-medium text-center">Absent</th>
                <th className="px-6 py-4 font-medium text-center">Leaves</th>
                <th className="px-6 py-4 font-medium text-center">Holidays</th>
                <th className="px-6 py-4 font-medium text-right">Hours Worked</th>
                <th className="px-6 py-4 font-medium text-right">Overtime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
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
                    <td className="px-6 py-4"><div className="h-4 w-8 bg-zinc-100 animate-pulse rounded mx-auto" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 bg-zinc-100 animate-pulse rounded mx-auto" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 bg-zinc-100 animate-pulse rounded mx-auto" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 bg-zinc-100 animate-pulse rounded mx-auto" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 bg-zinc-100 animate-pulse rounded mx-auto" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-12 bg-zinc-100 animate-pulse rounded ml-auto" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-12 bg-zinc-100 animate-pulse rounded ml-auto" /></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-zinc-500">
                    No data available for the selected parameters.
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.employee_id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          {row.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-900">{row.full_name}</div>
                          <div className="text-xs text-zinc-500">{row.employee_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">-</td>
                    <td className="px-6 py-4 text-center font-medium">{row.total_days_recorded}</td>
                    <td className="px-6 py-4 text-center text-emerald-600 font-medium bg-emerald-50/50">{row.present_count}</td>
                    <td className="px-6 py-4 text-center text-rose-600 font-medium bg-rose-50/50">{row.absent_count}</td>
                    <td className="px-6 py-4 text-center text-amber-600 font-medium bg-amber-50/50">{row.on_leave_count}</td>
                    <td className="px-6 py-4 text-center text-purple-600 font-medium bg-purple-50/50">-</td>
                    <td className="px-6 py-4 text-right font-medium text-zinc-900">-</td>
                    <td className="px-6 py-4 text-right font-medium text-blue-600">{Math.floor((row.total_overtime_minutes || 0) / 60)}h {(row.total_overtime_minutes || 0) % 60}m</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
