"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Store, MapPin, Mail, Phone, Building2, Calendar, MonitorSmartphone, Activity, Ban, Package, Plus, History } from 'lucide-react';
import { merchantApi } from '../../../../apis/merchantApi';
import { useAuth } from '../../../../context/AuthContext';

import AssignMachineDialog from '../../../../components/merchants/dialogs/AssignMachineDialog';
import UnassignMachineDialog from '../../../../components/merchants/dialogs/UnassignMachineDialog';
import DataTableSkeleton from '../../../../components/dashboard/DataTableSkeleton';

export default function MerchantDetails() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { user } = useAuth();

    const [merchant, setMerchant] = useState<any>(null);
    const [machines, setMachines] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
    const [selectedMachine, setSelectedMachine] = useState<any>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [merchRes, machRes, histRes] = await Promise.all([
                merchantApi.getById(id),
                merchantApi.getMerchantMachines(id),
                merchantApi.getMerchantMachineHistory(id)
            ]);

            if (merchRes.data.success) setMerchant(merchRes.data.data);
            if (machRes.data.success) setMachines(machRes.data.data);
            if (histRes.data.success) setHistory(histRes.data.data);
            
        } catch (err: any) {
            console.error('Failed to fetch merchant details', err);
            setError(err.response?.data?.message || 'Failed to fetch merchant details');
            if (err.response?.status === 403) {
                // If unauthorized (e.g. engineer without a ticket), they see the error
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleDeactivate = async () => {
        if (!confirm('Are you sure you want to deactivate this merchant?')) return;
        try {
            const res = await merchantApi.deactivate(id, { reason: 'Manual deactivation from details' });
            if (res.data.success) {
                alert('Merchant deactivated successfully');
                fetchData();
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to deactivate merchant');
        }
    };

    const handleReactivate = async () => {
        if (!confirm('Are you sure you want to reactivate this merchant?')) return;
        try {
            const res = await merchantApi.reactivate(id);
            if (res.data.success) {
                alert('Merchant reactivated successfully');
                fetchData();
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to reactivate merchant');
        }
    };

    if (loading) {
        return (
            <div className="animate-in fade-in duration-500">
                <div className="h-8 w-64 bg-zinc-200 rounded animate-pulse mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 h-96 bg-zinc-200 rounded-2xl animate-pulse" />
                    <div className="lg:col-span-2 h-96 bg-zinc-200 rounded-2xl animate-pulse" />
                </div>
            </div>
        );
    }

    if (error || !merchant) {
        return (
            <div className="p-8 text-center bg-white rounded-2xl border border-rose-200">
                <Ban className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-rose-900 mb-2">Access Denied</h2>
                <p className="text-rose-600">{error || 'Merchant not found or you do not have permission to view it.'}</p>
                <Link href="/dashboard/merchants" className="mt-6 inline-block px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors">
                    Back to Listings
                </Link>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/merchants" className="p-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors text-zinc-600">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{merchant.full_name}</h1>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                merchant.status === 'ACTIVE'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                                {merchant.status}
                            </span>
                        </div>
                        <p className="text-zinc-500 text-sm mt-1 font-mono">{merchant.merchant_code}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {(user?.role === 'SUPERADMIN' || user?.role === 'MANAGER' || user?.role === 'OPERATOR') && (
                        <Link
                            href={`/dashboard/merchants/${merchant.id}/edit`}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-colors shadow-sm"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </Link>
                    )}
                    {(user?.role === 'SUPERADMIN' || user?.role === 'MANAGER') && (
                        merchant.status === 'ACTIVE' ? (
                            <button
                                onClick={handleDeactivate}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-xl text-sm font-medium hover:bg-rose-50 transition-colors shadow-sm"
                            >
                                <Ban className="w-4 h-4" />
                                Deactivate
                            </button>
                        ) : (
                            <button
                                onClick={handleReactivate}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                                <Activity className="w-4 h-4" />
                                Reactivate
                            </button>
                        )
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Merchant Details */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                            <Store className="w-5 h-5 text-indigo-500" />
                            Profile Details
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Business Name</p>
                                <div className="flex items-center gap-3 text-zinc-900 font-medium">
                                    <Building2 className="w-4 h-4 text-zinc-400 shrink-0" />
                                    {merchant.business_name || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Contact Details</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-sm text-zinc-700">
                                        <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
                                        {merchant.mobile}
                                    </div>
                                    {merchant.email && (
                                        <div className="flex items-center gap-3 text-sm text-zinc-700">
                                            <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                                            {merchant.email}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Location</p>
                                <div className="flex items-start gap-3 text-sm text-zinc-700">
                                    <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p>{merchant.address}</p>
                                        <p className="mt-1 font-medium">Pincode: {merchant.pincode}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">System Info</p>
                                <div className="flex items-center gap-3 text-sm text-zinc-700">
                                    <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                                    Registered: {new Date(merchant.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Machines & History */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Active Machines */}
                    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                                <MonitorSmartphone className="w-5 h-5 text-emerald-500" />
                                Assigned Machines
                            </h2>
                            {(user?.role === 'SUPERADMIN' || user?.role === 'MANAGER' || user?.role === 'OPERATOR') && (
                                <button
                                    onClick={() => setAssignDialogOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Assign
                                </button>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            {machines.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Package className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                                    <p className="text-zinc-500 text-sm">No machines currently assigned to this merchant.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-zinc-50/50">
                                            <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Serial No.</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">TID</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Model</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Assigned</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {machines.map((m) => (
                                            <tr key={m.id} className="hover:bg-zinc-50/50">
                                                <td className="px-6 py-4 text-sm font-medium text-zinc-900 font-mono">{m.serial_number}</td>
                                                <td className="px-6 py-4 text-sm text-zinc-600 font-mono">{m.tid || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-zinc-600">{m.model}</td>
                                                <td className="px-6 py-4 text-sm text-zinc-500">
                                                    {new Date(m.assigned_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link 
                                                            href={`/dashboard/assets/machines/${m.machine_id}`}
                                                            className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            View
                                                        </Link>
                                                        {(user?.role === 'SUPERADMIN' || user?.role === 'MANAGER' || user?.role === 'OPERATOR') && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedMachine(m);
                                                                    setUnassignDialogOpen(true);
                                                                }}
                                                                className="text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
                                                            >
                                                                Unassign
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Assignment History */}
                    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-zinc-100">
                            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                                <History className="w-5 h-5 text-blue-500" />
                                Assignment History
                            </h2>
                        </div>
                        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                            {history.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 text-sm">No historical assignments.</div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-white">
                                        <tr className="bg-zinc-50/50">
                                            <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Machine</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Assigned</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Unassigned</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {history.map((h) => (
                                            <tr key={h.id} className="hover:bg-zinc-50/50">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-zinc-900 font-mono">{h.serial_number}</div>
                                                    <div className="text-xs text-zinc-500">{h.model}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-zinc-900">{new Date(h.assigned_at).toLocaleDateString()}</div>
                                                    {h.notes && <div className="text-xs text-zinc-500 italic mt-0.5" title={h.notes}>Has notes</div>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {h.unassigned_at ? (
                                                        <div className="text-sm text-zinc-900">{new Date(h.unassigned_at).toLocaleDateString()}</div>
                                                    ) : (
                                                        <span className="text-xs text-zinc-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {h.unassigned_at ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-600">
                                                            RETURNED
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                                            ACTIVE
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AssignMachineDialog 
                isOpen={assignDialogOpen} 
                onClose={() => setAssignDialogOpen(false)} 
                merchantId={id} 
                onSuccess={fetchData} 
            />

            {selectedMachine && (
                <UnassignMachineDialog 
                    isOpen={unassignDialogOpen} 
                    onClose={() => setUnassignDialogOpen(false)} 
                    merchantId={id} 
                    machineId={selectedMachine.machine_id} 
                    machineSerialNumber={selectedMachine.serial_number}
                    onSuccess={fetchData} 
                />
            )}
        </div>
    );
}
