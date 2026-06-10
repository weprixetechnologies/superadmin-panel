import React, { useState, useEffect } from 'react';
import { Search, X, Check, Loader2, UserPlus } from 'lucide-react';
import api from '@/utils/axiosInstance';

interface BulkAssignModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTickets: string[];
    onSuccess: () => void;
}

export default function BulkAssignModal({ isOpen, onClose, selectedTickets, onSuccess }: BulkAssignModalProps) {
    const [engineers, setEngineers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [selectedEngineerId, setSelectedEngineerId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setSelectedEngineerId(null);
            fetchEngineers();
        }
    }, [isOpen]);

    const fetchEngineers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/employees/list?role=ENGINEER');
            setEngineers(res.data.data || res.data.employees || []);
        } catch (error) {
            console.error('Failed to fetch engineers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedEngineerId || selectedTickets.length === 0) return;
        setAssigning(true);
        try {
            const promises = selectedTickets.map(id => 
                api.post(`/tickets/${id}/assign`, { engineer_id: selectedEngineerId })
            );
            await Promise.all(promises);
            onSuccess();
        } catch (error) {
            console.error('Failed to assign tickets', error);
            alert('Some assignments failed. Please refresh and check.');
        } finally {
            setAssigning(false);
        }
    };

    if (!isOpen) return null;

    const filteredEngineers = engineers.filter(e => 
        e.full_name?.toLowerCase().includes(search.toLowerCase()) || 
        e.employee_code?.toLowerCase().includes(search.toLowerCase()) ||
        e.mobile?.includes(search)
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-emerald-600" />
                            Bulk Assign Tickets
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Assign {selectedTickets.length} selected ticket{selectedTickets.length !== 1 ? 's' : ''} to an engineer
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-5 flex-1 overflow-y-auto">
                    <div className="relative mb-4">
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            placeholder="Search engineers by name, code or mobile..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        {loading ? (
                            <div className="py-8 flex flex-col items-center justify-center text-slate-500">
                                <Loader2 className="w-6 h-6 animate-spin mb-2 text-emerald-500" />
                                <span className="text-sm">Loading engineers...</span>
                            </div>
                        ) : filteredEngineers.length === 0 ? (
                            <div className="py-8 text-center text-slate-500 text-sm">
                                No engineers found.
                            </div>
                        ) : (
                            filteredEngineers.map(engineer => (
                                <button
                                    key={engineer.id}
                                    onClick={() => setSelectedEngineerId(engineer.id)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                                        selectedEngineerId === engineer.id 
                                            ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-500' 
                                            : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <div>
                                        <div className="font-medium text-slate-900">{engineer.full_name}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                            {engineer.employee_code} • {engineer.mobile}
                                        </div>
                                    </div>
                                    {selectedEngineerId === engineer.id && (
                                        <Check className="w-5 h-5 text-emerald-600" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                        disabled={assigning}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleAssign}
                        disabled={!selectedEngineerId || assigning || selectedTickets.length === 0}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm shadow-emerald-600/20"
                    >
                        {assigning ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Assigning...
                            </>
                        ) : (
                            'Assign Tickets'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
