"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, RefreshCw, Filter, Calendar, 
  ChevronLeft, ChevronRight, Eye, X, Building2, User, Check, XCircle
} from 'lucide-react';

import api from '@/utils/axiosInstance';

export default function LeaveApprovalsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const [reviewNotes, setReviewNotes] = useState('');

  const fetchLeaveApprovals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves/pending');
      setData(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch leave approvals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveApprovals();
  }, []);

  const handleReview = async (id: string, status: string) => {
    try {
      await api.put(`/leaves/${id}/review`, { status, review_notes: reviewNotes });
      setShowDrawer(false);
      setReviewNotes('');
      fetchLeaveApprovals();
      alert(`Leave request ${status.toLowerCase()}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to review request');
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'APPROVED': return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold">Approved</span>;
      case 'REJECTED': return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold">Rejected</span>;
      case 'PENDING': return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold">Pending</span>;
      default: return <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-lg text-xs font-semibold">{status}</span>;
    }
  };

  const openReview = (req: any) => {
    setSelectedRequest(req);
    setShowDrawer(true);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Leave Approvals</h1>
          <p className="text-zinc-500 mt-1">Review and manage employee leave applications.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchLeaveApprovals} className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-xl hover:bg-zinc-50 font-medium transition-colors text-sm">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
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
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
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
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Branch</th>
                <th className="px-6 py-4 font-medium">Leave Type</th>
                <th className="px-6 py-4 font-medium">Dates</th>
                <th className="px-6 py-4 font-medium">Applied Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
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
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-zinc-100 animate-pulse rounded" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-zinc-100 animate-pulse rounded-lg" /></td>
                    <td className="px-6 py-4"><div className="h-8 w-20 bg-zinc-100 animate-pulse rounded ml-auto" /></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    No pending leave approvals found.
                  </td>
                </tr>
              ) : (
                data.map((req) => (
                  <tr key={req.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          {req.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-900">{req.full_name}</div>
                          <div className="text-xs text-zinc-500">{req.employee_code || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{req.branch_id ? `Branch ${req.branch_id}` : '-'}</td>
                    <td className="px-6 py-4 font-medium text-zinc-900">{req.leave_type}</td>
                    <td className="px-6 py-4 text-zinc-600">{new Date(req.start_date).toLocaleDateString()} to {new Date(req.end_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-zinc-600">{new Date(req.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleReview(req.id, 'APPROVED')} className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Approve">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleReview(req.id, 'REJECTED')} className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Reject">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => openReview(req)}
                          className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Review Details"
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
      </div>

      {/* Review Drawer */}
      {showDrawer && selectedRequest && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowDrawer(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform animate-in slide-in-from-right flex flex-col">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Review Leave Request</h2>
                <p className="text-sm text-zinc-500">{selectedRequest.full_name}</p>
              </div>
              <button onClick={() => setShowDrawer(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-semibold">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500 uppercase font-semibold">Applied On</p>
                  <p className="mt-1 font-medium text-zinc-900">{new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-900 mb-3">Leave Information</h3>
                <div className="space-y-3 bg-white border border-zinc-100 rounded-2xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Leave Type</span>
                    <span className="font-medium text-zinc-900">{selectedRequest.leave_type} Leave</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Dates</span>
                    <span className="font-medium text-zinc-900">{new Date(selectedRequest.start_date).toLocaleDateString()} to {new Date(selectedRequest.end_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-900 mb-3">Reason</h3>
                <div className="bg-white border border-zinc-100 rounded-2xl p-4 text-sm text-zinc-700">
                  {selectedRequest.reason}
                </div>
              </div>

              {selectedRequest.status === 'PENDING' && (
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 mb-3">Approval Notes (Optional)</h3>
                  <textarea 
                    rows={3} 
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow text-sm"
                    placeholder="Add notes before approving or rejecting..."
                  />
                </div>
              )}
            </div>
            
            {selectedRequest.status === 'PENDING' && (
              <div className="p-6 border-t border-zinc-100 shrink-0 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleReview(selectedRequest.id, 'REJECTED')}
                  className="w-full py-2.5 bg-rose-50 text-rose-600 rounded-xl font-medium hover:bg-rose-100 transition-colors"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleReview(selectedRequest.id, 'APPROVED')}
                  className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
