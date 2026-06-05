"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PackageCheck, Settings, Upload, CheckCircle, PackageSearch, Smartphone, Edit2, Check, X } from 'lucide-react';
import { consignmentApi } from '@/apis/assets/consignmentApi';

export default function ConsignmentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [consignment, setConsignment] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditingCount, setIsEditingCount] = useState(false);
    const [newCount, setNewCount] = useState('');

    const handleUpdateCount = async () => {
        try {
            const res = await consignmentApi.updateActualCount(id, parseInt(newCount));
            if (res.data?.success) {
                setConsignment(res.data.data);
                setIsEditingCount(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkArrived = async () => {
        try {
            const res = await consignmentApi.markArrived(id);
            if (res.data?.success) {
                setConsignment(res.data.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await consignmentApi.getById(id);
                if (res.data?.success) {
                    setConsignment(res.data.data);
                    setItems(res.data.data.receipts || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) {
        return <div className="p-8 max-w-[1200px] mx-auto text-slate-500">Loading consignment details...</div>;
    }

    if (!consignment) {
        return <div className="p-8 max-w-[1200px] mx-auto text-red-500">Consignment not found.</div>;
    }

    return (
        <div className="p-8 max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/assets/consignments" className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900">Consignment #{consignment.id}</h1>
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full border bg-slate-100 text-slate-700">
                            {consignment.status.replace(/_/g, ' ')}
                        </span>
                    </div>
                    <p className="text-slate-500 mt-1">Reference: {consignment.dispatch_reference || 'N/A'}</p>
                    {consignment.relate_badge && (
                        <span className="inline-block mt-2 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-full">
                            Badge: {consignment.relate_badge}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Details Column */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <Settings className="w-4 h-4 text-emerald-600" />
                                Details
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Supplier</p>
                                <p className="font-medium text-slate-900">{consignment.supplier_name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Expected Arrival</p>
                                <p className="font-medium text-slate-900">{consignment.expected_arrival ? new Date(consignment.expected_arrival).toLocaleDateString() : 'TBD'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Actual Arrival</p>
                                <div className="flex items-center gap-3">
                                    <p className="font-medium text-slate-900">{consignment.received_at ? new Date(consignment.received_at).toLocaleDateString() : 'Not Arrived'}</p>
                                    {!consignment.received_at && (
                                        <button onClick={handleMarkArrived} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors">
                                            Mark Arrived
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Counts</p>
                                <div className="flex items-center gap-4 mt-1">
                                    <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 flex-1">
                                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Expected</p>
                                        <p className="text-lg font-bold text-slate-900">{consignment.expected_count}</p>
                                    </div>
                                    <div className="bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 flex-1 relative group">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-emerald-600 uppercase font-semibold">Received</p>
                                            {!isEditingCount && (
                                                <button onClick={() => { setIsEditingCount(true); setNewCount(consignment.received_count.toString()); }} className="opacity-0 group-hover:opacity-100 text-emerald-600 hover:text-emerald-800 transition-opacity">
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        {isEditingCount ? (
                                            <div className="flex items-center gap-2 mt-1">
                                                <input type="number" value={newCount} onChange={(e) => setNewCount(e.target.value)} className="w-16 px-1 py-0.5 text-sm border border-emerald-300 rounded outline-none" autoFocus />
                                                <button onClick={handleUpdateCount} className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"><Check className="w-3 h-3" /></button>
                                                <button onClick={() => setIsEditingCount(false)} className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"><X className="w-3 h-3" /></button>
                                            </div>
                                        ) : (
                                            <p className="text-lg font-bold text-emerald-700">{consignment.received_count}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {consignment.notes && (
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Notes</p>
                                    <p className="text-sm text-slate-700 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        {consignment.notes}
                                    </p>
                                </div>
                            )}
                            {consignment.document_url && (
                                <div>
                                    <a href={consignment.document_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-xl transition-colors w-full justify-center">
                                        <Upload className="w-4 h-4" />
                                        View Document
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Received Items Column */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <PackageCheck className="w-4 h-4 text-emerald-600" />
                                Received Items
                            </h3>
                            <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">Receive Items</button>
                        </div>
                        <div className="p-0">
                            {items.length === 0 ? (
                                <p className="text-center text-slate-500 py-12">No items received yet for this consignment.</p>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-200">
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Type</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Serial Number</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.map((it: any) => (
                                            <tr key={it.id || it.serial_number} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                            {it.category === 'TERMINAL' ? (
                                                                <Smartphone className="w-4 h-4 text-slate-500" />
                                                            ) : (
                                                                <PackageSearch className="w-4 h-4 text-slate-500" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-900">{it.item_name || 'Machine'}</div>
                                                            <div className="text-xs text-slate-500">{it.category || 'TERMINAL'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-sm text-slate-700">
                                                    {it.serial_number}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full w-max border border-emerald-200">
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                        Received
                                                    </div>
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
        </div>
    );
}
