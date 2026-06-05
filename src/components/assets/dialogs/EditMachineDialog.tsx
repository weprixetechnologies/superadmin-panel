import React, { useState, useEffect, useRef } from 'react';
import { X, Settings, AlertTriangle, Search, Check } from 'lucide-react';
import { machineApi } from '@/apis/assets/machineApi';
import api from '@/utils/axiosInstance';
import { useAuth } from '@/context/AuthContext';

interface EditMachineDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    machine: any;
}

export default function EditMachineDialog({ isOpen, onClose, onSuccess, machine }: EditMachineDialogProps) {
    const { user } = useAuth();
    
    const [formData, setFormData] = useState({
        serial_number: '',
        model: '',
        brand: '',
        warranty_expiry: '',
        is_chronic_fault: false,
        branch_id: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Branch Search State
    const [branchSearch, setBranchSearch] = useState('');
    const [branches, setBranches] = useState<any[]>([]);
    const [showBranches, setShowBranches] = useState(false);
    const [searchingBranches, setSearchingBranches] = useState(false);
    const branchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (machine && isOpen) {
            setFormData({
                serial_number: machine.serial_number || '',
                model: machine.model || '',
                brand: machine.brand || '',
                warranty_expiry: machine.warranty_expiry ? new Date(machine.warranty_expiry).toISOString().split('T')[0] : '',
                is_chronic_fault: !!(machine.is_chronic_fault || machine.chronic_fault),
                branch_id: machine.branch_id || ''
            });
            
            if (machine.branch_id) {
                // Initial placeholder
                setBranchSearch(machine.branch_id);
                // Fetch branch name
                api.get(`/branches/${machine.branch_id}`).then(res => {
                    if (res.data?.success && res.data.branch_name) {
                        setBranchSearch(res.data.branch_name);
                    }
                }).catch(err => console.error("Failed to fetch branch name", err));
            } else {
                setBranchSearch('');
            }
        }
    }, [machine, isOpen]);

    // Handle clicking outside to close branch dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (branchRef.current && !branchRef.current.contains(event.target as Node)) {
                setShowBranches(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search Branches
    useEffect(() => {
        const fetchBranches = async () => {
            if (!showBranches) return;
            setSearchingBranches(true);
            try {
                const { data } = await api.get('/branches', { params: { search: branchSearch, limit: 10 } });
                if (data?.success) {
                    setBranches(data.data || []);
                }
            } catch (err) {
                console.error('Failed to fetch branches', err);
            } finally {
                setSearchingBranches(false);
            }
        };

        const timer = setTimeout(fetchBranches, 300);
        return () => clearTimeout(timer);
    }, [branchSearch, showBranches]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const submitData = { ...formData };
        if (!submitData.branch_id) delete submitData.branch_id;

        try {
            const { data } = await machineApi.update(machine.id, submitData);
            if (data?.success) {
                onSuccess();
                onClose();
            } else {
                setError(data?.message || 'Failed to update machine');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData(prev => ({ ...prev, [e.target.name]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Settings className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Edit Machine Info</h2>
                            <p className="text-sm text-slate-500">Update machine details</p>
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
                                Serial Number *
                            </label>
                            <input
                                required
                                type="text"
                                name="serial_number"
                                value={formData.serial_number}
                                onChange={handleChange}
                                placeholder="Enter SN"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            />
                        </div>

                        {/* Branch Search for Superadmins */}
                        {['SUPERADMIN', 'SUPERADMIN'].includes(user?.role?.toUpperCase()) && (
                            <div className="relative" ref={branchRef}>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Branch Assignment
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search branches..."
                                        value={branchSearch}
                                        onChange={(e) => {
                                            setBranchSearch(e.target.value);
                                            setShowBranches(true);
                                            if (!e.target.value) setFormData(p => ({ ...p, branch_id: '' }));
                                        }}
                                        onFocus={() => setShowBranches(true)}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    />
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                </div>
                                {showBranches && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-[200px] overflow-y-auto">
                                        {searchingBranches ? (
                                            <div className="p-3 text-sm text-slate-500 text-center">Searching...</div>
                                        ) : branches.length > 0 ? (
                                            branches.map(b => (
                                                <button
                                                    key={b.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, branch_id: b.id }));
                                                        setBranchSearch(`${b.name || b.branch_name || b.id}`);
                                                        setShowBranches(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center justify-between transition-colors ${
                                                        formData.branch_id === b.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700'
                                                    }`}
                                                >
                                                    <div>
                                                        <p>{b.name || b.branch_name}</p>
                                                        {b.address && <p className="text-xs text-slate-500 line-clamp-1">{b.address}</p>}
                                                    </div>
                                                    {formData.branch_id === b.id && <Check className="w-4 h-4" />}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-3 text-sm text-slate-500 text-center">No branches found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Brand
                                </label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    placeholder="e.g. Verifone"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Model
                                </label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    placeholder="e.g. V200c"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Warranty Expiry
                            </label>
                            <input
                                type="date"
                                name="warranty_expiry"
                                value={formData.warranty_expiry}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50 mt-4">
                            <input
                                type="checkbox"
                                name="is_chronic_fault"
                                id="is_chronic_fault"
                                checked={formData.is_chronic_fault}
                                onChange={handleChange}
                                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                            />
                            <label htmlFor="is_chronic_fault" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                                Flag as Chronic Fault
                            </label>
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
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
