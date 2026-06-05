"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, PlusCircle, RefreshCw, Filter, 
  Building2, User, ChevronLeft, ChevronRight, Link as LinkIcon, Trash2, X
} from 'lucide-react';

import api from '@/utils/axiosInstance';

export default function ShiftAssignmentsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [shifts, setShifts] = useState<any[]>([]);
  const [assignForm, setAssignForm] = useState({
    employee_id: '',
    shift_id: '',
    effective_from: new Date().toISOString().slice(0, 10),
    effective_to: '',
    remarks: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, shiftRes] = await Promise.all([
        api.get('/employees/list'),
        api.get('/shifts')
      ]);
      
      const employees = empRes.data?.data?.employees || [];
      const shiftList = shiftRes.data?.data || [];
      
      setShifts(shiftList);
      
      const formatted = employees.map((emp: any) => ({
        id: emp.id,
        employee: emp.full_name,
        empId: emp.employee_code || '-',
        shift: 'Fetch manually', // We don't have current shift returned by employee list API
        effectiveFrom: '-',
        effectiveTo: '-',
        status: emp.status
      }));
      setData(formatted);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignShift = async () => {
    if (!assignForm.employee_id || !assignForm.shift_id || !assignForm.effective_from) {
      return alert("Employee, Shift, and Effective From are required.");
    }
    try {
      await api.post('/shifts/assign', {
        employee_id: assignForm.employee_id,
        shift_id: assignForm.shift_id,
        effective_from: assignForm.effective_from,
        effective_to: assignForm.effective_to || null
      });
      setShowModal(false);
      alert("Shift assigned successfully");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to assign shift");
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'ACTIVE' 
      ? <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold">Active</span>
      : <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-lg text-xs font-semibold">Expired</span>;
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Shift Assignments</h1>
          <p className="text-zinc-500 mt-1">Assign schedules to your workforce.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-xl hover:bg-zinc-50 font-medium transition-colors text-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors shadow-sm shadow-emerald-600/20 text-sm">
            <LinkIcon className="w-4 h-4" />
            Assign Shift
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 flex-1 min-w-[200px]">
          <User className="w-4 h-4 text-zinc-400" />
          <input type="text" placeholder="Search employee..." className="bg-transparent border-none outline-none text-sm w-full text-zinc-700" />
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
          <Filter className="w-4 h-4 text-zinc-400" />
          <select className="bg-transparent border-none outline-none text-sm w-full text-zinc-700">
            <option value="">All Shifts</option>
            <option value="Morning Shift">Morning Shift</option>
            <option value="Evening Shift">Evening Shift</option>
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
                <th className="px-6 py-4 font-medium">Current Shift</th>
                <th className="px-6 py-4 font-medium">Effective From</th>
                <th className="px-6 py-4 font-medium">Effective To</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
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
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-16 bg-zinc-100 animate-pulse rounded-lg" /></td>
                    <td className="px-6 py-4"><div className="h-8 w-8 bg-zinc-100 animate-pulse rounded ml-auto" /></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No shift assignments found.
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          {row.employee.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-900">{row.employee}</div>
                          <div className="text-xs text-zinc-500">{row.empId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 font-medium">{row.shift}</td>
                    <td className="px-6 py-4 text-zinc-600">{row.effectiveFrom}</td>
                    <td className="px-6 py-4 text-zinc-600">{row.effectiveTo || 'Ongoing'}</td>
                    <td className="px-6 py-4">{getStatusBadge(row.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">Assign Shift</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Employee</label>
                <select 
                  value={assignForm.employee_id}
                  onChange={(e) => setAssignForm({...assignForm, employee_id: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow text-sm"
                >
                  <option value="">Select Employee</option>
                  {data.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.employee} ({emp.empId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Shift</label>
                <select 
                  value={assignForm.shift_id}
                  onChange={(e) => setAssignForm({...assignForm, shift_id: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow text-sm"
                >
                  <option value="">Select Shift</option>
                  {shifts.map(shift => (
                    <option key={shift.id} value={shift.id}>{shift.name} ({shift.start_time} - {shift.end_time})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Effective From</label>
                  <input 
                    type="date" 
                    value={assignForm.effective_from}
                    onChange={(e) => setAssignForm({...assignForm, effective_from: e.target.value})}
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Effective To (Optional)</label>
                  <input 
                    type="date" 
                    value={assignForm.effective_to}
                    onChange={(e) => setAssignForm({...assignForm, effective_to: e.target.value})}
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow text-sm" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Remarks</label>
                <textarea 
                  rows={3} 
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow text-sm"
                  placeholder="Any internal notes..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-zinc-100 flex items-center justify-end gap-3 bg-zinc-50/50">
              <button 
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAssignShift}
                className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm shadow-emerald-600/20"
              >
                Assign Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
