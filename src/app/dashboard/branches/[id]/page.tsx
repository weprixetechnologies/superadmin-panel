"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, MapPin, Users, Monitor, Ticket, Package, ShieldBan, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '@/utils/axiosInstance';
import { Branch, BranchDependencyResponse } from '@/types/branch';
import PageHeader from '@/components/dashboard/PageHeader';

export default function ViewBranch({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = React.use(params);
    
    const [branch, setBranch] = useState<Branch | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Modal states
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);
    
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteDeps, setDeleteDeps] = useState<BranchDependencyResponse | null>(null);
    const [checkingDeps, setCheckingDeps] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!id) return;  // guard against undefined id
        const fetchBranch = async () => {
            try {
                const res = await api.get(`/branches/${id}`);
                if (res.data.success) {
                    setBranch(res.data);
                } else {
                    setError('Failed to fetch branch details');
                }
            } catch (err: any) {
                console.error('Fetch branch error:', err);
                setError(err.response?.data?.error || 'Failed to fetch branch details');
            } finally {
                setLoading(false);
            }
        };
        fetchBranch();
    }, [id]);

    const handleStatusUpdate = async (newStatus: 'ACTIVE' | 'INACTIVE') => {
        setStatusUpdating(true);
        try {
            const res = await api.patch(`/branches/${id}/status`, { status: newStatus });
            if (res.data.success) {
                setBranch(prev => prev ? { ...prev, status: newStatus } : null);
                setShowStatusModal(false);
                // Optionally show a toast here
            }
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to update status');
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleDeleteClick = async () => {
        setCheckingDeps(true);
        setShowDeleteModal(true);
        try {
            const res = await api.get(`/branches/${id}/dependencies`);
            if (res.data.success) {
                setDeleteDeps(res.data);
            }
        } catch (err: any) {
            alert('Failed to check dependencies');
            setShowDeleteModal(false);
        } finally {
            setCheckingDeps(false);
        }
    };

    const confirmDelete = async () => {
        setDeleting(true);
        try {
            const res = await api.delete(`/branches/${id}`);
            if (res.data.success) {
                alert('Branch deleted successfully');
                router.push('/dashboard/branches');
            }
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to delete branch');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return <div className="p-12 text-center text-zinc-500 animate-pulse">Loading branch details...</div>;
    }

    if (error || !branch) {
        return (
            <div className="p-12 text-center">
                <p className="text-red-500 font-medium mb-4">{error || 'Branch not found'}</p>
                <Link href="/dashboard/branches" className="text-emerald-600 hover:underline">Return to Branch List</Link>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/branches" className="p-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors text-zinc-600">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{branch.branch_name}</h1>
                        <p className="text-zinc-500 text-sm mt-1 font-mono">{branch.branch_code}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${
                        branch.status === 'ACTIVE' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                        {branch.status === 'ACTIVE' ? <CheckCircle className="w-4 h-4" /> : <ShieldBan className="w-4 h-4" />}
                        {branch.status}
                    </span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* LEFT COLUMN */}
                <div className="flex-1 space-y-8">
                    {/* Details Card */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-zinc-900 mb-6 border-b border-zinc-100 pb-4">Branch Details</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                            <div>
                                <p className="text-sm text-zinc-500 mb-1">Contact Person</p>
                                <p className="font-medium text-zinc-900">{branch.contact_person || 'Not specified'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 mb-1">Mobile</p>
                                <p className="font-medium text-zinc-900">{branch.contact_mobile || 'Not specified'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 mb-1">Email</p>
                                <p className="font-medium text-zinc-900">{branch.contact_email || 'Not specified'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm text-zinc-500 mb-1">Address</p>
                                <p className="font-medium text-zinc-900 leading-relaxed">{branch.address}</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 mb-1">Created At</p>
                                <p className="font-medium text-zinc-900">{new Date(branch.created_at).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 mb-1">Last Updated</p>
                                <p className="font-medium text-zinc-900">{new Date(branch.updated_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Pincode Coverage */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-zinc-100 pb-4">
                            <MapPin className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-lg font-semibold text-zinc-900">Coverage Areas</h2>
                        </div>
                        
                        {branch.pincode_ranges.length === 0 ? (
                            <p className="text-zinc-500 text-sm">No coverage areas defined.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {branch.pincode_ranges.map(range => (
                                    <div key={range.id} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                            <MapPin className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div className="font-mono text-sm font-medium text-zinc-700">
                                            {range.pincode_from} - {range.pincode_to}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="w-full lg:w-80 shrink-0 space-y-8">
                    {/* Quick Actions */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link href={`/dashboard/branches/edit/${branch.id}`} className="flex items-center gap-3 w-full p-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl transition-colors text-zinc-700 font-medium text-sm">
                                <Edit className="w-4 h-4 text-zinc-500" />
                                Edit Branch Details
                            </Link>
                            <button 
                                onClick={() => setShowStatusModal(true)}
                                className="flex items-center gap-3 w-full p-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl transition-colors text-zinc-700 font-medium text-sm"
                            >
                                <ShieldBan className="w-4 h-4 text-zinc-500" />
                                Change Status
                            </button>
                            <button 
                                onClick={handleDeleteClick}
                                className="flex items-center gap-3 w-full p-3 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors text-red-700 font-medium text-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Branch
                            </button>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-4">Operational Stats</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg"><Users className="w-4 h-4 text-emerald-600" /></div>
                                    <span className="text-sm font-medium text-emerald-900">Employees</span>
                                </div>
                                <span className="font-bold text-emerald-700">{branch.employee_count}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg"><Monitor className="w-4 h-4 text-blue-600" /></div>
                                    <span className="text-sm font-medium text-blue-900">Machines</span>
                                </div>
                                <span className="font-bold text-blue-700">{branch.machine_count}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg"><Ticket className="w-4 h-4 text-orange-600" /></div>
                                    <span className="text-sm font-medium text-orange-900">Open Tickets</span>
                                </div>
                                <span className="font-bold text-orange-700">{branch.open_ticket_count}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg"><Package className="w-4 h-4 text-purple-600" /></div>
                                    <span className="text-sm font-medium text-purple-900">Stock Items</span>
                                </div>
                                <span className="font-bold text-purple-700">{branch.stock_item_count}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals could be extracted, keeping inline for strict spec adherence */}
            {/* Status Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-zinc-100">
                            <h3 className="text-lg font-bold text-zinc-900">Change Branch Status</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-zinc-600 mb-4">
                                You are changing the status for <strong>{branch.branch_name}</strong>.
                                Current status is <span className="font-semibold">{branch.status}</span>.
                            </p>
                            
                            {branch.status === 'ACTIVE' && (branch.employee_count! > 0 || branch.open_ticket_count! > 0) && (
                                <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-xl flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
                                    <div className="text-sm text-orange-800">
                                        <p className="font-semibold mb-1">Warning: Active Dependencies</p>
                                        <ul className="list-disc pl-4 space-y-1">
                                            {branch.employee_count! > 0 && <li>{branch.employee_count} active employees exist</li>}
                                            {branch.open_ticket_count! > 0 && <li>{branch.open_ticket_count} open tickets exist</li>}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => handleStatusUpdate('ACTIVE')}
                                    disabled={statusUpdating || branch.status === 'ACTIVE'}
                                    className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                                >
                                    Set ACTIVE
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('INACTIVE')}
                                    disabled={statusUpdating || branch.status === 'INACTIVE'}
                                    className="flex-1 py-2.5 bg-zinc-50 text-zinc-700 border border-zinc-200 rounded-xl font-medium hover:bg-zinc-100 disabled:opacity-50 transition-colors"
                                >
                                    Set INACTIVE
                                </button>
                            </div>
                        </div>
                        <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-end">
                            <button onClick={() => setShowStatusModal(false)} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-zinc-100">
                            <h3 className="text-lg font-bold text-zinc-900 text-red-600 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> Delete Branch
                            </h3>
                        </div>
                        <div className="p-6">
                            {checkingDeps ? (
                                <div className="text-center py-8 text-zinc-500">Checking dependencies...</div>
                            ) : deleteDeps ? (
                                <>
                                    {!deleteDeps.can_delete ? (
                                        <div>
                                            <p className="text-sm text-zinc-600 mb-4">
                                                This branch cannot be deleted because it has active records tied to it.
                                            </p>
                                            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-2 text-sm">
                                                <div className="flex justify-between"><span className="text-zinc-500">Employees</span><span className="font-medium text-zinc-900">{deleteDeps.dependencies.employees}</span></div>
                                                <div className="flex justify-between"><span className="text-zinc-500">Machines</span><span className="font-medium text-zinc-900">{deleteDeps.dependencies.machines}</span></div>
                                                <div className="flex justify-between"><span className="text-zinc-500">Open Tickets</span><span className="font-medium text-zinc-900">{deleteDeps.dependencies.open_tickets}</span></div>
                                                <div className="flex justify-between"><span className="text-zinc-500">Stock Items</span><span className="font-medium text-zinc-900">{deleteDeps.dependencies.stock_items}</span></div>
                                                <div className="flex justify-between"><span className="text-zinc-500">Zones</span><span className="font-medium text-zinc-900">{deleteDeps.dependencies.zones}</span></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-sm text-zinc-600 mb-4">
                                                Are you sure you want to delete <strong>{branch.branch_name}</strong>? This action cannot be undone. All configuration data (like SLAs) associated with this branch will be permanently removed.
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-red-500 text-sm">Failed to load dependency data.</p>
                            )}
                        </div>
                        <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-end gap-3">
                            <button 
                                onClick={() => setShowDeleteModal(false)} 
                                disabled={deleting}
                                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            {deleteDeps?.can_delete && (
                                <button 
                                    onClick={confirmDelete}
                                    disabled={deleting}
                                    className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                                >
                                    {deleting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    Yes, Delete Branch
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
