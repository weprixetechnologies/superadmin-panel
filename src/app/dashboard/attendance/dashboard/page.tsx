"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserX,
  CalendarOff,
  Clock,
  TrendingUp,
  AlertCircle,
  FileCheck,
  CalendarCheck,
  PlusCircle,
  Link as LinkIcon,
  CalendarPlus,
  Eye
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import api from '@/utils/axiosInstance';

const trendData = [
  { date: '10 May', present: 145 },
  { date: '11 May', present: 148 },
  { date: '12 May', present: 146 },
  { date: '13 May', present: 150 },
  { date: '14 May', present: 149 },
  { date: '15 May', present: 142 },
  { date: '16 May', present: 147 },
];

const distributionData = [
  { name: 'Present', value: 145, color: '#10B981' },
  { name: 'Absent', value: 5, color: '#EF4444' },
  { name: 'Leave', value: 8, color: '#3B82F6' },
  { name: 'Half Day', value: 3, color: '#F59E0B' },
  { name: 'Holiday', value: 0, color: '#8B5CF6' },
];

export default function AttendanceDashboard() {
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    onLeave: 0,
    lateArrivals: 0, // Mocked for now
    avgAttendance: 0, // Mocked for now
    halfDays: 0,
    pendingRegularisations: 0,
    pendingLeaves: 0,
  });
  
  const [distData, setDistData] = useState(distributionData);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch daily attendance
        const today = new Date().toISOString().slice(0, 10);
        const [dailyRes, leavesRes, regRes] = await Promise.all([
          api.get(`/attendance/daily?date=${today}`),
          api.get('/leaves/pending'), // Fixed endpoint
          api.get('/attendance/regularise/pending') // Fallback to empty if not exists
        ].map(p => p.catch(e => ({ data: { data: [] } })))); // Catch individual errors

        const records = dailyRes.data?.data || [];
        const pendingLeaves = leavesRes.data?.data?.length || 0;
        const pendingRegs = regRes.data?.data?.length || 0;

        let present = 0, absent = 0, onLeave = 0, halfDays = 0;
        records.forEach((r: any) => {
          if (r.status === 'PRESENT') present++;
          else if (r.status === 'ABSENT') absent++;
          else if (r.status === 'ON_LEAVE') onLeave++;
          else if (r.status === 'HALF_DAY') halfDays++;
        });

        setStats({
          present,
          absent,
          onLeave,
          halfDays,
          lateArrivals: 0, // Need shift start time logic for late arrivals
          avgAttendance: records.length ? Math.round(((present + halfDays) / records.length) * 100) : 0,
          pendingRegularisations: pendingRegs,
          pendingLeaves: pendingLeaves,
        });

        setDistData([
          { name: 'Present', value: present, color: '#10B981' },
          { name: 'Absent', value: absent, color: '#EF4444' },
          { name: 'Leave', value: onLeave, color: '#3B82F6' },
          { name: 'Half Day', value: halfDays, color: '#F59E0B' },
        ]);

      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const KPICard = ({ title, value, icon: Icon, trend, colorClass }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 flex flex-col transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClass.bg}`}>
          <Icon className={`w-6 h-6 ${colorClass.text}`} />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <h3 className="text-zinc-500 text-sm font-medium mb-1">{title}</h3>
        {loading ? (
          <div className="h-8 w-24 bg-zinc-100 animate-pulse rounded" />
        ) : (
          <p className="text-2xl font-bold text-zinc-900">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Attendance Dashboard</h1>
          <p className="text-zinc-500 mt-1">Overview of today's workforce attendance.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/attendance/shifts">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-xl hover:bg-zinc-50 font-medium transition-colors text-sm">
              <PlusCircle className="w-4 h-4" />
              Create Shift
            </button>
          </Link>
          <Link href="/dashboard/attendance/leaves">
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors shadow-sm shadow-emerald-600/20 text-sm">
              <Eye className="w-4 h-4" />
              View Pending Leaves
            </button>
          </Link>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Present Today"
          value={stats.present}
          icon={Users}
          trend={2.4}
          colorClass={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }}
        />
        <KPICard
          title="Absent Today"
          value={stats.absent}
          icon={UserX}
          trend={-1.2}
          colorClass={{ bg: 'bg-rose-50', text: 'text-rose-600' }}
        />
        <KPICard
          title="On Leave"
          value={stats.onLeave}
          icon={CalendarOff}
          colorClass={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
        />
        <KPICard
          title="Late Arrivals"
          value={stats.lateArrivals}
          icon={Clock}
          colorClass={{ bg: 'bg-amber-50', text: 'text-amber-600' }}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Average Attendance"
          value={`${stats.avgAttendance}%`}
          icon={TrendingUp}
          colorClass={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }}
        />
        <KPICard
          title="Half Day Count"
          value={stats.halfDays}
          icon={AlertCircle}
          colorClass={{ bg: 'bg-orange-50', text: 'text-orange-600' }}
        />
        <KPICard
          title="Regularisation Pending"
          value={stats.pendingRegularisations}
          icon={FileCheck}
          colorClass={{ bg: 'bg-purple-50', text: 'text-purple-600' }}
        />
        <KPICard
          title="Leaves Pending Approval"
          value={stats.pendingLeaves}
          icon={CalendarCheck}
          colorClass={{ bg: 'bg-cyan-50', text: 'text-cyan-600' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
          <h3 className="text-lg font-bold text-zinc-900 mb-6">Attendance Trend (Last 30 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717A', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717A', fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="present" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
          <h3 className="text-lg font-bold text-zinc-900 mb-6">Attendance Distribution</h3>
          <div className="h-[300px] w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={distData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full px-4">
              {distData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-zinc-600">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
        <h3 className="text-lg font-bold text-zinc-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard/attendance/shift-assignments">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer group">
              <LinkIcon className="w-5 h-5 text-zinc-400 group-hover:text-emerald-600" />
              <span className="font-medium text-sm text-zinc-700 group-hover:text-emerald-700">Assign Shift</span>
            </div>
          </Link>
          <Link href="/dashboard/attendance/holidays">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-zinc-200 hover:border-purple-500 hover:bg-purple-50 hover:text-purple-700 transition-colors cursor-pointer group">
              <CalendarPlus className="w-5 h-5 text-zinc-400 group-hover:text-purple-600" />
              <span className="font-medium text-sm text-zinc-700 group-hover:text-purple-700">Create Holiday</span>
            </div>
          </Link>
          <Link href="/dashboard/attendance/regularisations">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-zinc-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer group">
              <FileCheck className="w-5 h-5 text-zinc-400 group-hover:text-blue-600" />
              <span className="font-medium text-sm text-zinc-700 group-hover:text-blue-700">View Regularisations</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
