"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PackageSearch, Settings, MapPin, Truck } from 'lucide-react';
import { stockItemApi } from '@/apis/assets/stockItemApi';

export default function StockItemDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await stockItemApi.getById(id);
                if (res.data?.success) setItem(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) {
        return <div className="p-8 max-w-[1200px] mx-auto text-slate-500">Loading stock item details...</div>;
    }

    if (!item) {
        return <div className="p-8 max-w-[1200px] mx-auto text-red-500">Stock Item not found.</div>;
    }

    return (
        <div className="p-8 max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/assets/stock-items" className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900">{item.serial_number}</h1>
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full border bg-slate-100 text-slate-700">
                            {item.state.replace(/_/g, ' ')}
                        </span>
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full border bg-emerald-100 text-emerald-700">
                            {item.condition.replace(/_/g, ' ')}
                        </span>
                    </div>
                    <p className="text-slate-500 mt-1">{item.item_name}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Details Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Settings className="w-4 h-4 text-emerald-600" />
                            Item Details
                        </h3>
                        <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">Edit</button>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Serial Number</p>
                            <p className="font-medium text-slate-900">{item.serial_number}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Category</p>
                            <p className="font-medium text-slate-900">{item.category}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Brand</p>
                            <p className="font-medium text-slate-900">{item.brand || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Model</p>
                            <p className="font-medium text-slate-900">{item.model || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Branch</p>
                            <p className="font-medium text-slate-900">{item.branch_id}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs text-slate-500 mb-1">Notes</p>
                            <p className="text-sm text-slate-700 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                {item.notes || 'No notes provided.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Links Card */}
                <div className="space-y-8">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-emerald-600" />
                                Associations
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Consignment */}
                            <div>
                                <p className="text-xs text-slate-500 mb-2">Received From Consignment</p>
                                {item.consignment_id ? (
                                    <Link href={`/dashboard/assets/consignments/${item.consignment_id}`} className="block p-4 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <Truck className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">Consignment #{item.consignment_id}</p>
                                                <p className="text-xs text-slate-500">Click to view receipt details</p>
                                            </div>
                                        </div>
                                    </Link>
                                ) : (
                                    <p className="text-sm text-slate-500">No consignment linked.</p>
                                )}
                            </div>

                            {/* Linked Machine */}
                            <div>
                                <p className="text-xs text-slate-500 mb-2">Linked to Machine</p>
                                {item.machine_id ? (
                                    <Link href={`/dashboard/assets/machines/${item.machine_id}`} className="block p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <PackageSearch className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">Machine #{item.machine_id}</p>
                                                <p className="text-xs text-slate-500">Click to view machine details</p>
                                            </div>
                                        </div>
                                    </Link>
                                ) : (
                                    <p className="text-sm text-slate-500">Not currently attached to a machine.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
