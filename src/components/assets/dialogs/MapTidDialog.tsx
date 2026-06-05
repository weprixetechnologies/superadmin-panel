import React, { useState, useEffect } from 'react';
import { X, MapPin, AlertTriangle, Search, CheckCircle2 } from 'lucide-react';
import { machineApi } from '@/apis/assets/machineApi';
import { merchantApi } from '@/apis/merchantApi';

interface MapTidDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    machineId: string | null;
    currentTid?: string | null;
}

export default function MapTidDialog({ isOpen, onClose, onSuccess, machineId, currentTid }: MapTidDialogProps) {
    const [formData, setFormData] = useState({
        tid: currentTid || '',
        ticket_id: ''
    });
    
    const [searchQuery, setSearchQuery] = useState('');
    const [merchants, setMerchants] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMerchant, setSelectedMerchant] = useState<any | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setFormData({ tid: currentTid || '', ticket_id: '' });
            setSearchQuery('');
            setMerchants([]);
            setSelectedMerchant(null);
            setError('');
        } else {
            // Load initial merchants
            searchMerchants('');
        }
    }, [isOpen, currentTid]);

    const searchMerchants = async (query: string) => {
        setIsSearching(true);
        try {
            const { data } = await merchantApi.getAll({ search: query, limit: 10 });
            if (data?.success) {
                setMerchants(data.merchants || []);
            }
        } catch (err) {
            console.error('Failed to fetch merchants', err);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isOpen && !selectedMerchant) {
                searchMerchants(searchQuery);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, isOpen, selectedMerchant]);

    if (!isOpen || !machineId) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMerchant) {
            setError('Please select a merchant');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const { data } = await machineApi.mapTid(machineId, {
                ...formData,
                merchant_id: selectedMerchant.id
            });
            
            if (data?.success) {
                onSuccess();
                onClose();
            } else {
                setError(data?.message || 'Failed to map TID');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Map TID to Machine</h2>
                            <p className="text-sm text-slate-500">Assign Terminal ID and link to Merchant</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Terminal ID (TID) *
                            </label>
                            <input
                                required
                                type="text"
                                name="tid"
                                value={formData.tid}
                                onChange={handleChange}
                                placeholder="Enter TID"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Associated Ticket ID (Optional)
                            </label>
                            <input
                                type="text"
                                name="ticket_id"
                                value={formData.ticket_id}
                                onChange={handleChange}
                                placeholder="e.g. TKT-123"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <label className="block text-sm font-medium text-slate-700 mb-3">
                            Select Merchant *
                        </label>

                        {selectedMerchant ? (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-emerald-900">{selectedMerchant.full_name}</h4>
                                        {selectedMerchant.business_name && (
                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">
                                                {selectedMerchant.business_name}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-emerald-600 mt-1">{selectedMerchant.address} - {selectedMerchant.pincode}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedMerchant(null)}
                                    className="text-sm text-emerald-700 hover:text-emerald-800 underline"
                                >
                                    Change
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by Name, Mobile, or ID..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    <div className="max-h-60 overflow-y-auto">
                                        {isSearching ? (
                                            <div className="p-4 text-center text-sm text-slate-500">Searching...</div>
                                        ) : merchants.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-slate-500">No merchants found.</div>
                                        ) : (
                                            <div className="divide-y divide-slate-100">
                                                {merchants.map((merchant) => (
                                                    <div 
                                                        key={merchant.id}
                                                        onClick={() => setSelectedMerchant(merchant)}
                                                        className="p-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between group"
                                                    >
                                                        <div>
                                                            <p className="font-medium text-slate-900 group-hover:text-emerald-600 transition-colors">
                                                                {merchant.full_name} {merchant.business_name && `(${merchant.business_name})`}
                                                            </p>
                                                            <p className="text-xs text-slate-500 mt-0.5">
                                                                {merchant.mobile} • {merchant.pincode}
                                                            </p>
                                                        </div>
                                                        <CheckCircle2 className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex gap-3 justify-end shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !selectedMerchant || !formData.tid}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            )}
                            Map TID & Assign
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
