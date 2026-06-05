import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { merchantApi } from '../../../apis/merchantApi';


interface UnassignMachineDialogProps {
    isOpen: boolean;
    onClose: () => void;
    merchantId: string;
    machineId: string;
    machineSerialNumber: string;
    onSuccess: () => void;
}

export default function UnassignMachineDialog({ isOpen, onClose, merchantId, machineId, machineSerialNumber, onSuccess }: UnassignMachineDialogProps) {
    const [submitting, setSubmitting] = useState(false);
    const [reason, setReason] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await merchantApi.unassignMachine(merchantId, { machine_id: machineId, reason });
            if (res.data.success) {
                alert('Machine unassigned successfully');
                onSuccess();
                onClose();
            }
        } catch (err: any) {
            console.error('Unassign machine error', err);
            alert(err.response?.data?.message || 'Failed to unassign machine');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                    <h2 className="text-lg font-bold text-zinc-900">Unassign Machine</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3 mb-6">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-rose-900 text-sm">Warning</h4>
                            <p className="text-sm text-rose-700 mt-1">
                                Are you sure you want to unassign machine <span className="font-bold">{machineSerialNumber}</span>? This will make the machine available in the general pool again.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Reason (Optional)</label>
                        <textarea 
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            placeholder="Why is this machine being unassigned?"
                            className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                        />
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
                            disabled={submitting}
                            className="px-6 py-2 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            Unassign
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
