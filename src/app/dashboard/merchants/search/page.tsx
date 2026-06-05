"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Store, Phone, MapPin, Building2, MonitorSmartphone } from 'lucide-react';
import { merchantApi } from '../../../../apis/merchantApi';
import { useAuth } from '../../../../context/AuthContext';


export default function MerchantSearch() {
    const { user } = useAuth();
    
    const [mobile, setMobile] = useState('');
    const [merchant, setMerchant] = useState<any>(null);
    const [machines, setMachines] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mobile || mobile.length < 10) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }

        setLoading(true);
        setHasSearched(true);
        setMerchant(null);
        setMachines([]);

        try {
            const res = await merchantApi.searchByMobile(mobile);
            if (res.data.success && res.data.data) {
                setMerchant(res.data.data);
                
                // If found, fetch active machines for quick view
                try {
                    const machRes = await merchantApi.getMerchantMachines(res.data.data.id);
                    if (machRes.data.success) {
                        setMachines(machRes.data.data);
                    }
                } catch (e) {
                    console.error('Failed to fetch machines for search result');
                }
            } else {
                alert('Merchant not found');
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Merchant not found');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-2xl mx-auto pb-12">
            <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Quick Merchant Lookup</h1>
                <p className="text-zinc-500 text-sm mt-1">Search for a merchant instantly using their registered mobile number.</p>
            </div>

            <form onSubmit={handleSearch} className="relative mb-8">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Enter 10-digit mobile number"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-zinc-200 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || mobile.length < 10}
                        className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </form>

            {hasSearched && !loading && !merchant && (
                <div className="text-center p-8 bg-zinc-50 border border-zinc-200 rounded-2xl">
                    <Store className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                    <h3 className="text-zinc-900 font-medium">No merchant found</h3>
                    <p className="text-sm text-zinc-500 mt-1">Check the mobile number and try again.</p>
                </div>
            )}

            {merchant && (
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 border-b border-zinc-100 flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-xl font-bold text-zinc-900">{merchant.full_name}</h2>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                    merchant.status === 'ACTIVE'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                    {merchant.status}
                                </span>
                            </div>
                            <p className="font-mono text-sm text-zinc-500">{merchant.merchant_code}</p>
                        </div>
                        <Link
                            href={`/dashboard/merchants/${merchant.id}`}
                            className="px-4 py-2 bg-zinc-50 text-emerald-600 border border-zinc-200 rounded-xl text-sm font-medium hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
                        >
                            View Full Details
                        </Link>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50/30">
                        <div>
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Business Info</p>
                            <div className="flex items-center gap-3 text-sm text-zinc-900 font-medium">
                                <Building2 className="w-4 h-4 text-zinc-400" />
                                {merchant.business_name || 'N/A'}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-zinc-700 mt-3">
                                <Phone className="w-4 h-4 text-zinc-400" />
                                {merchant.mobile}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Location</p>
                            <div className="flex items-start gap-3 text-sm text-zinc-700">
                                <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="line-clamp-2">{merchant.address}</p>
                                    <p className="font-medium mt-0.5">{merchant.pincode}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-zinc-100 bg-white">
                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Active Terminals ({machines.length})</p>
                        {machines.length > 0 ? (
                            <div className="flex gap-2 flex-wrap">
                                {machines.map(m => (
                                    <div key={m.id} className="inline-flex items-center gap-2 px-3 py-1.5 border border-zinc-200 rounded-lg bg-zinc-50">
                                        <MonitorSmartphone className="w-4 h-4 text-emerald-500" />
                                        <span className="font-mono text-sm text-zinc-700">{m.serial_number}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-400 italic">No terminals assigned</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
