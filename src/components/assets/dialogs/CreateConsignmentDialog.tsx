import React, { useState } from 'react';
import { X, Truck, AlertTriangle } from 'lucide-react';
import { consignmentApi } from '@/apis/assets/consignmentApi';
import { useAuth } from '@/context/AuthContext';

interface CreateConsignmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateConsignmentDialog({ isOpen, onClose, onSuccess }: CreateConsignmentDialogProps) {
    const { user } = useAuth();
    
    const [formData, setFormData] = useState({
        supplier_name: '',
        dispatch_reference: '',
        relate_badge: '',
        expected_count: '',
        expected_arrival: '',
        notes: '',
        branch_id: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await consignmentApi.create(formData);
            if (data?.success || data) {
                onSuccess();
                onClose();
            } else {
                setError(data?.message || 'Failed to create consignment');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Create Consignment</h2>
                            <p className="text-sm text-slate-500">Log a new inbound delivery</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Supplier Name *
                            </label>
                            <input
                                required
                                type="text"
                                name="supplier_name"
                                value={formData.supplier_name}
                                onChange={handleChange}
                                placeholder="Supplier Name"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Dispatch Reference
                            </label>
                            <input
                                type="text"
                                name="dispatch_reference"
                                value={formData.dispatch_reference}
                                onChange={handleChange}
                                placeholder="e.g. PO-12345"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Relate Badge
                            </label>
                            <input
                                type="text"
                                name="relate_badge"
                                value={formData.relate_badge}
                                onChange={handleChange}
                                placeholder="e.g. VIP-2026"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Expected Count *
                                </label>
                                <input
                                    required
                                    type="number"
                                    name="expected_count"
                                    value={formData.expected_count}
                                    onChange={handleChange}
                                    placeholder="Total items"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Expected Arrival
                                </label>
                                <input
                                    type="date"
                                    name="expected_arrival"
                                    value={formData.expected_arrival}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {['SUPERADMIN', 'SUPERADMIN'].includes(user?.role?.toUpperCase() || '') && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Branch ID *
                                </label>
                                <input
                                    required
                                    type="number"
                                    name="branch_id"
                                    value={formData.branch_id}
                                    onChange={handleChange}
                                    placeholder="Branch ID"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Notes
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={2}
                                placeholder="Any additional notes..."
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-100 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : null}
                            Create Consignment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
