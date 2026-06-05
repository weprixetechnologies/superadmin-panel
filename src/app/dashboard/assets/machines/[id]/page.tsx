"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, MapPin, Truck, AlertTriangle, CheckCircle, Package, Calendar, Clock, Map, Settings, ShieldOff, Image as ImageIcon } from 'lucide-react';
import { machineApi } from '@/apis/assets/machineApi';
import { useAuth } from '@/context/AuthContext';
import MapTidDialog from '@/components/assets/dialogs/MapTidDialog';
import EditMachineDialog from '@/components/assets/dialogs/EditMachineDialog';

export default function MachineDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [machine, setMachine] = useState<any>(null);
    const [custody, setCustody] = useState<any[]>([]);
    const [tidHistory, setTidHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mapTidOpen, setMapTidOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const fetchMachine = async () => {
        try {
            const [mRes, cRes, tRes] = await Promise.all([
                machineApi.getById(id),
                machineApi.getCustody(id),
                machineApi.getTidHistory(id)
            ]);
            if (mRes.data?.success) setMachine(mRes.data.data);
            if (cRes.data?.success) setCustody(cRes.data.data || []);
            if (tRes.data?.success) setTidHistory(tRes.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMachine();
    }, [id]);

    const handleUnmapTid = async () => {
        if (!confirm('Are you sure you want to unmap the TID?')) return;
        try {
            const { data } = await machineApi.unmapTid(id as string);
            if (data?.success) {
                fetchMachine();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return <div className="p-8 max-w-[1200px] mx-auto text-slate-500">Loading machine details...</div>;
    }

    if (!machine) {
        return <div className="p-8 max-w-[1200px] mx-auto text-red-500">Machine not found.</div>;
    }

    return (
        <div className="p-8 max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/assets/machines" className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900">{machine.serial_number}</h1>
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full border bg-slate-100 text-slate-700">
                            {machine.status.replace(/_/g, ' ')}
                        </span>
                    </div>
                    <p className="text-slate-500 mt-1">{machine.brand} {machine.model}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Information Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <Settings className="w-4 h-4 text-emerald-600" />
                                Machine Information
                            </h3>
                            <button 
                                onClick={() => setEditOpen(true)}
                                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                            >
                                Edit
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Serial Number</p>
                                <p className="font-medium text-slate-900">{machine.serial_number}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Branch</p>
                                <p className="font-medium text-slate-900">{machine.branch_name || machine.branch_id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Brand & Model</p>
                                <p className="font-medium text-slate-900">{machine.brand} {machine.model}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Warranty Expiry</p>
                                <p className="font-medium text-slate-900">{machine.warranty_expiry ? new Date(machine.warranty_expiry).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Created At</p>
                                <p className="font-medium text-slate-900">{new Date(machine.created_at).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Updated At</p>
                                <p className="font-medium text-slate-900">{new Date(machine.updated_at).toLocaleString()}</p>
                            </div>
                            {machine.chronic_fault && (
                                <div className="col-span-2 bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-red-800 text-sm">Chronic Fault Flagged</p>
                                        <p className="text-xs text-red-600 mt-1">This machine has been flagged for chronic faults and may require replacement or deep repair.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Current Mapping Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-emerald-600" />
                                Current TID Mapping
                            </h3>
                            <div className="flex gap-2">
                                {machine.tid ? (
                                    <button 
                                        onClick={handleUnmapTid}
                                        className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                                    >
                                        Unmap TID
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setMapTidOpen(true)}
                                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                                    >
                                        Map TID
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="p-6">
                            {machine.tid ? (
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Terminal ID (TID)</p>
                                        <p className="font-mono text-lg font-bold text-slate-900">{machine.tid}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Merchant Name</p>
                                        <p className="font-medium text-slate-900">{machine.tidMapping?.merchant_name || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-slate-500 mb-1">Merchant Address</p>
                                        <p className="font-medium text-slate-900">{machine.tidMapping?.merchant_address || 'N/A'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <MapPin className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <p className="text-slate-600 font-medium">Not currently mapped to any TID</p>
                                    <p className="text-sm text-slate-400 mt-1">Map this machine to a merchant terminal to begin tracking.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Custody Timeline */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-emerald-600" />
                                Custody Timeline
                            </h3>
                        </div>
                        <div className="p-6">
                            {custody.length === 0 ? (
                                <p className="text-center text-slate-500 py-4">No custody records found.</p>
                            ) : (
                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                    {custody.map((c: any, i: number) => (
                                        <div key={c.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            {/* Marker */}
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-emerald-50 text-slate-500 group-[.is-active]:text-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                            {/* Card */}
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                <div className="flex items-center justify-between space-x-2 mb-1">
                                                    <div className="font-bold text-slate-900">{c.transfer_to}</div>
                                                    <time className="font-mono text-xs text-emerald-500">{new Date(c.created_at).toLocaleDateString()}</time>
                                                </div>
                                                <div className="text-slate-500 text-sm">
                                                    From: {c.transfer_from} <br/>
                                                    By: {c.transferred_by}
                                                </div>
                                                {c.notes && <p className="text-slate-600 text-sm mt-2 p-2 bg-slate-50 rounded-lg">{c.notes}</p>}
                                                {c.photo_url && (
                                                    <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                                                        <ImageIcon className="w-4 h-4" />
                                                        <a href={c.photo_url} target="_blank" rel="noreferrer" className="hover:underline">View Photo</a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* TID History Timeline */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-600" />
                                TID History
                            </h3>
                        </div>
                        <div className="p-6">
                            {tidHistory.length === 0 ? (
                                <p className="text-center text-slate-500 py-4">No mapping history.</p>
                            ) : (
                                <div className="space-y-4">
                                    {tidHistory.map((th: any) => (
                                        <div key={th.id} className="relative pl-6 pb-4 border-l border-slate-200 last:border-0 last:pb-0">
                                            <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-white" />
                                            <p className="text-sm font-semibold text-slate-900">
                                                {th.action === 'MAPPED' ? 'Mapped to TID' : 'Unmapped from TID'}
                                            </p>
                                            <p className="text-sm font-mono text-slate-700 my-0.5">{th.tid}</p>
                                            {th.merchant_name && <p className="text-xs text-slate-500">{th.merchant_name}</p>}
                                            <div className="text-xs text-slate-400 mt-1 flex justify-between">
                                                <span>By: {th.performed_by}</span>
                                                <span>{new Date(th.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Map TID Dialog */}
            <MapTidDialog 
                isOpen={mapTidOpen}
                onClose={() => setMapTidOpen(false)}
                machineId={machine?.id}
                currentTid={machine?.tid}
                onSuccess={fetchMachine}
            />

            {/* Edit Machine Dialog */}
            <EditMachineDialog 
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                onSuccess={fetchMachine}
                machine={machine}
            />
        </div>
    );
}
