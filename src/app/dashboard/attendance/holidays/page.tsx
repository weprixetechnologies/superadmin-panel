"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, PlusCircle, RefreshCw, Calendar, 
  Edit, Trash2, X, Filter
} from 'lucide-react';

import api from '@/utils/axiosInstance';

export default function HolidaysPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [year, setYear] = useState('2026');
  const [formData, setFormData] = useState({ name: '', holiday_date: '', type: 'PUBLIC', branch_id: '' });

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/holidays?year=${year}`);
      setData(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch holidays', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [year]);

  const handleCreate = async () => {
    try {
      await api.post('/holidays', {
        name: formData.name,
        holiday_date: formData.holiday_date,
        type: formData.type,
        branch_id: formData.branch_id || null
      });
      setShowModal(false);
      setFormData({ name: '', holiday_date: '', type: 'PUBLIC', branch_id: '' });
      fetchHolidays();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create holiday');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this holiday?')) return;
    try {
      await api.delete(`/holidays/${id}`);
      fetchHolidays();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete holiday');
    }
  };

  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'PUBLIC': return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold">Public</span>;
      case 'RESTRICTED': return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold">Restricted</span>;
      case 'WEEKEND': return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">Weekend</span>;
      default: return <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-lg text-xs font-semibold">{type}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Holiday Calendar</h1>
          <p className="text-zinc-500 mt-1">Manage public and restricted holidays across branches.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchHolidays} className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-xl hover:bg-zinc-50 font-medium transition-colors text-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors shadow-sm shadow-emerald-600/20 text-sm">
            <PlusCircle className="w-4 h-4" />
            Add Holiday
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 flex-1 min-w-[200px]">
          <Calendar className="w-4 h-4 text-zinc-400" />
          <select value={year} onChange={e => setYear(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-zinc-700">
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
        <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 flex-1 min-w-[200px]">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select className="bg-transparent border-none outline-none text-sm w-full text-zinc-700">
            <option value="">All Types</option>
            <option value="PUBLIC">Public</option>
            <option value="RESTRICTED">Restricted</option>
            <option value="WEEKEND">Weekend</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Holiday Name</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Branch Applicability</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-zinc-100 animate-pulse rounded-lg" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-8 w-16 bg-zinc-100 animate-pulse rounded ml-auto" /></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No holidays found for the selected year.
                  </td>
                </tr>
              ) : (
                data.map((holiday) => (
                  <tr key={holiday.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900">{holiday.name}</td>
                    <td className="px-6 py-4 text-zinc-600">{new Date(holiday.holiday_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{getTypeBadge(holiday.type)}</td>
                    <td className="px-6 py-4 text-zinc-600">{holiday.branch_id ? `Branch ${holiday.branch_id}` : 'All Branches'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleDelete(holiday.id)} className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">Add Holiday</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Holiday Name</label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="e.g. Christmas Day" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Date</label>
                  <input value={formData.holiday_date} onChange={e => setFormData({...formData, holiday_date: e.target.value})} type="date" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Holiday Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow text-sm">
                    <option value="PUBLIC">Public</option>
                    <option value="RESTRICTED">Restricted</option>
                    <option value="WEEKEND">Weekend</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Applicable Branches (Empty for All)</label>
                <input value={formData.branch_id} onChange={e => setFormData({...formData, branch_id: e.target.value})} type="text" placeholder="e.g. EMP001" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow text-sm" />
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
                onClick={handleCreate}
                className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm shadow-emerald-600/20"
              >
                Save Holiday
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
