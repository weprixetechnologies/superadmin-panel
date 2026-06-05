import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { merchantApi } from '../../../apis/merchantApi';
import api from '../../../utils/axiosInstance';


interface AssignMachineDialogProps {
    isOpen: boolean;
    onClose: () => void;
    merchantId: string;
    onSuccess: () => void;
}

export default function AssignMachineDialog({ isOpen, onClose, merchantId, onSuccess }: AssignMachineDialogProps) {
    const [submitting, setSubmitting] = useState(false);
    const [machines, setMachines] = useState<any[]>([]);
    const [loadingMachines, setLoadingMachines] = useState(false);
    const [search, setSearch] = useState('');
    
    const [formData, setFormData] = useState({
        machine_id: '',
        notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchAvailableMachines();
        } else {
            // Reset state
            setFormData({ machine_id: '', notes: '' });
            setSearch('');
            setMachines([]);
        }
    }, [isOpen]);

    const fetchAvailableMachines = async () => {
        try {
            setLoadingMachines(true);
            const res = await api.get('/machines?status=AVAILABLE&limit=100');
            if (res.data.success) {
                setMachines(res.data.machines || (res.data.data ? res.data.data.machines : []) || []);
            }
        } catch (err) {
            console.error('Failed to fetch machines', err);
            alert('Failed to fetch available machines');
        } finally {
            setLoadingMachines(false);
        }
    };

    const filteredMachines = machines.filter(m => 
        m.serial_number.toLowerCase().includes(search.toLowerCase()) || 
        m.model?.toLowerCase().includes(search.toLowerCase()) ||
        m.tid?.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.machine_id) return alert('Please select a machine');

        setSubmitting(true);
        try {
            const res = await merchantApi.assignMachine(merchantId, formData);
            if (res.data.success) {
                alert('Machine assigned successfully');
                onSuccess();
                onClose();
            }
        } catch (err: any) {
            console.error('Assign machine error', err);
            alert(err.response?.data?.message || 'Failed to assign machine');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                    <h2 className="text-lg font-bold text-zinc-900">Assign Machine</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Search Machine <span className="text-red-500">*</span></label>
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input 
                                    type="text"
                                    placeholder="Search by serial, model, or TID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                            </div>
                            
                            <div className="border border-zinc-200 rounded-xl max-h-48 overflow-y-auto bg-zinc-50/50">
                                {loadingMachines ? (
                                    <div className="p-4 text-center text-sm text-zinc-500">Loading machines...</div>
                                ) : filteredMachines.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-zinc-500">No available machines found</div>
                                ) : (
                                    <div className="divide-y divide-zinc-100">
                                        {filteredMachines.map(m => (
                                            <label 
                                                key={m.id} 
                                                className={`flex items-center p-3 cursor-pointer hover:bg-white transition-colors ${formData.machine_id === m.id ? 'bg-emerald-50/50' : ''}`}
                                            >
                                                <input 
                                                    type="radio"
                                                    name="machine"
                                                    value={m.id}
                                                    checked={formData.machine_id === m.id}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, machine_id: e.target.value }))}
                                                    className="w-4 h-4 text-emerald-600 border-zinc-300 focus:ring-emerald-500 mr-3"
                                                />
                                                <div>
                                                    <div className="font-medium text-zinc-900 text-sm">{m.serial_number}</div>
                                                    <div className="text-xs text-zinc-500 mt-0.5">{m.model} • TID: {m.tid || 'N/A'}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Notes (Optional)</label>
                            <textarea 
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                rows={2}
                                placeholder="Any additional notes for this assignment..."
                                className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-zinc-200 text-zinc-600 rounded-xl font-medium hover:bg-zinc-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !formData.machine_id}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            Assign Machine
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
