"use client";

import React, { useEffect, useState } from 'react';
import { Search, Filter, Download, Activity, Clock, User, ShieldAlert } from 'lucide-react';
import api from '../../../utils/axiosInstance';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/action-logs?page=${page}&limit=20`);
      const data = res.data;
      if (data.success) {
        setLogs(data.logs);
        setTotal(data.total || 0);
        setTotalPages(Math.ceil((data.total || 0) / 20) || 1);
      }
    } catch (err) {
      console.error('Failed to fetch activity logs', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('PUNCH_IN')) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (action.includes('DELETE') || action.includes('REMOVE')) return 'text-red-700 bg-red-50 border-red-200';
    if (action.includes('PUNCH_OUT')) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-zinc-700 bg-zinc-50 border-zinc-200';
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Activity Logs</h1>
          <p className="text-zinc-500 text-sm mt-1">Track system events, user actions, and security alerts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="relative w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search by action, user, or entity..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Timestamp</th>
                <th className="py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actor</th>
                <th className="py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Action</th>
                <th className="py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Module</th>
                <th className="py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Entity Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500 text-sm">Loading activity logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500 text-sm">No activity logs found.</td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <Clock className="w-4 h-4 text-zinc-400" />
                        {new Date(log.occurred_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                          <User className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-zinc-900">{log.actor_name || 'System'}</div>
                          <div className="text-xs text-zinc-500">{log.actor_role || 'SYSTEM'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getActionColor(log.action_code)}`}>
                        {log.action_code.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-zinc-700 capitalize font-medium">{log.module}</div>
                      <div className="text-xs text-zinc-400 font-mono mt-0.5 text-ellipsis overflow-hidden max-w-[150px]">
                        IP: {log.actor_ip || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-zinc-900">{log.entity_type} <span className="text-zinc-400">#{log.entity_id}</span></div>
                      {log.notes && (
                        <div className="text-xs text-zinc-500 mt-0.5 line-clamp-1 max-w-[300px]">
                          {log.notes}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-4 border-t border-zinc-100 flex items-center justify-between bg-white">
          <div className="text-sm text-zinc-500">
            Showing {logs.length > 0 ? (page - 1) * 20 + 1 : 0} to {Math.min(page * 20, total)} of {total} entries
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <div className="text-sm font-medium text-zinc-700 px-2">
              Page {page} of {totalPages}
            </div>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="px-3 py-1 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
