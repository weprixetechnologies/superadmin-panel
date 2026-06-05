"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Building, Smartphone, HardDrive, AlertCircle, Search, Check } from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/axiosInstance';

export default function CreateTicketPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [machineSearchQuery, setMachineSearchQuery] = useState('');
    const [machineOptions, setMachineOptions] = useState<any[]>([]);
    const [showMachineDropdown, setShowMachineDropdown] = useState(false);

    const [formData, setFormData] = useState({
        service_type: 'INSTALLATION',
        priority: 'NORMAL',
        source: 'OPERATOR_RAISED',
        branch_id: '',
        merchant_name: '',
        business_name: '',
        merchant_mobile: '',
        merchant_email: '',
        merchant_address: '',
        merchant_pincode: '',
        machine_id: '',
        tid: '',
        complaint_category: '',
        complaint_description: '',
        mcc_code: '',
        zone_name: '',
        sponsor_bank: '',
        mid: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError(null);
    };

    // Branch Search State
    const [branchSearch, setBranchSearch] = useState('');
    const [branchCodeSearch, setBranchCodeSearch] = useState('');
    const [showBranchCodeOptions, setShowBranchCodeOptions] = useState(false);
    const [branches, setBranches] = useState<any[]>([]);
    const [showBranches, setShowBranches] = useState(false);
    const [searchingBranches, setSearchingBranches] = useState(false);
    const branchRef = useRef<HTMLDivElement>(null);

    // Merchant Search State
    const [merchantSearchQuery, setMerchantSearchQuery] = useState('');
    const [merchantOptions, setMerchantOptions] = useState<any[]>([]);
    const [showMerchantDropdown, setShowMerchantDropdown] = useState(false);
    const merchantRef = useRef<HTMLDivElement>(null);

    // Handle clicking outside to close branch dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (branchRef.current && !branchRef.current.contains(event.target as Node)) {
                setShowBranches(false);
            }
            if (merchantRef.current && !merchantRef.current.contains(event.target as Node)) {
                setShowMerchantDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search Branches
    useEffect(() => {
        const fetchBranches = async () => {
            if (!showBranches && !showBranchCodeOptions) return;
            if (!showBranches) return;
            setSearchingBranches(true);
            try {
                const { data } = await api.get('/branches', { params: { search: showBranchCodeOptions ? branchCodeSearch : branchSearch, limit: 10 } });
                if (data?.success) {
                    setBranches(data.data || []);
                }
                            if (data?.success && showBranchCodeOptions && branchCodeSearch) {
                    const exactMatch = data.data.find((b: any) => b.branch_code === branchCodeSearch.toUpperCase());
                    if (exactMatch) {
                        setFormData(prev => ({ ...prev, branch_id: exactMatch.id }));
                        setBranchSearch(exactMatch.branch_name || exactMatch.name || '');
                        setShowBranchCodeOptions(false);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch branches', err);
            } finally {
                setSearchingBranches(false);
            }
        };

        const timer = setTimeout(fetchBranches, 300);
        return () => clearTimeout(timer);
    }, [branchSearch, showBranches, branchCodeSearch, showBranchCodeOptions]);

    const handleMerchantSearch = async (query: string) => {
        setMerchantSearchQuery(query);
        try {
            if (!query) {
                setMerchantOptions([]);
                return;
            }
            const { data } = await api.get(`/merchants?search=${encodeURIComponent(query)}&limit=10`);
            const merchants = Array.isArray(data.merchants) ? data.merchants : (Array.isArray(data.data) ? data.data : (data.data?.merchants || []));
            setMerchantOptions(merchants);
            setShowMerchantDropdown(true);
        } catch (err) {
            console.error('Failed to fetch merchants', err);
        }
    };

    const selectMerchant = (m: any) => {
        setMerchantSearchQuery(m.full_name);
        setFormData(prev => ({
            ...prev,
            merchant_name: m.full_name || '',
            business_name: m.business_name || '',
            merchant_mobile: m.mobile || '',
            merchant_email: m.email || '',
            merchant_address: m.address || '',
            merchant_pincode: m.pincode || '',
            mcc_code: m.mcc_code || '',
            zone_name: m.zone_name || '',
            sponsor_bank: m.sponsor_bank || '',
            mid: m.mid || ''
        }));
        setShowMerchantDropdown(false);
    };

    const handleMachineSearch = async (query: string) => {
        setMachineSearchQuery(query);
        setFormData(prev => ({ ...prev, machine_id: query })); // accept custom typed text as ID
        
        try {
            const url = query 
                ? `/machines?search=${encodeURIComponent(query)}&limit=10`
                : `/machines?status=DEPLOYED&limit=20`;
            const { data } = await api.get(url);
            const machines = Array.isArray(data.machines) ? data.machines : (Array.isArray(data.data) ? data.data : (data.data?.machines || []));
            setMachineOptions(machines);
            setShowMachineDropdown(true);
        } catch (err) {
            console.error('Failed to fetch machines', err);
        }
    };

    const selectMachine = (m: any) => {
        setMachineSearchQuery(m.serial_number);
        setFormData(prev => ({ ...prev, machine_id: m.id }));
        setShowMachineDropdown(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.branch_id) {
            setError('Branch ID is required for Superadmin');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const payload = { ...formData };
            if (!payload.machine_id) delete (payload as any).machine_id;
            if (!payload.business_name) delete (payload as any).business_name;
            if (!payload.merchant_email) delete (payload as any).merchant_email;
            if (!payload.complaint_category) delete (payload as any).complaint_category;

            const { data } = await api.post('/tickets', payload);
            if (data?.success) {
                // Success Toast would go here
                router.push(`/dashboard/tickets/${data.data.id}`);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link 
                    href="/dashboard/tickets"
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Create New Ticket</h1>
                    <p className="text-slate-500 mt-1">Register a new service request</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Merchant Information */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <Building className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">Merchant Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 relative" ref={merchantRef}>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Search Existing Merchant (Optional)</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Search by name, business name, or mobile..." 
                                    value={merchantSearchQuery} 
                                    onChange={(e) => handleMerchantSearch(e.target.value)}
                                    onFocus={() => { if (merchantSearchQuery) setShowMerchantDropdown(true) }}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                            {showMerchantDropdown && merchantOptions.length > 0 && (
                                <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                                    {merchantOptions.map((m: any) => (
                                        <li 
                                            key={m.id} 
                                            onClick={() => selectMerchant(m)}
                                            className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                                        >
                                            <div className="font-semibold text-slate-900">{m.full_name} <span className="text-sm font-normal text-slate-500">({m.mobile})</span></div>
                                            <div className="text-xs text-slate-500 mt-1 line-clamp-1">{m.address}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <p className="text-xs text-slate-500 mt-2">Selecting a merchant will auto-fill the details below.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Merchant Name *</label>
                            <input 
                                type="text" name="merchant_name" required value={formData.merchant_name} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Business Name</label>
                            <input 
                                type="text" name="business_name" value={formData.business_name} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Mobile Number *</label>
                            <input 
                                type="text" name="merchant_mobile" required maxLength={10} minLength={10} pattern="\d{10}" value={formData.merchant_mobile} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                            <input 
                                type="email" name="merchant_email" value={formData.merchant_email} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Address *</label>
                            <input 
                                type="text" name="merchant_address" required value={formData.merchant_address} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Pincode *</label>
                            <input 
                                type="text" name="merchant_pincode" required maxLength={6} minLength={6} pattern="\d{6}" value={formData.merchant_pincode} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">MCC Code</label>
                            <input 
                                type="text" name="mcc_code" value={formData.mcc_code} onChange={handleChange} placeholder="Optional"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Zone Name</label>
                            <input 
                                type="text" name="zone_name" value={formData.zone_name} onChange={handleChange} placeholder="Optional"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Sponsor Bank</label>
                            <input 
                                type="text" name="sponsor_bank" value={formData.sponsor_bank} onChange={handleChange} placeholder="Optional"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">MID</label>
                            <input 
                                type="text" name="mid" value={formData.mid} onChange={handleChange} placeholder="Optional"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Machine Information */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <HardDrive className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">Machine Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 relative">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Machine ID (Optional)</label>
                            <input 
                                type="text" 
                                placeholder="Search by serial number or enter custom ID..." 
                                value={machineSearchQuery} 
                                onChange={(e) => handleMachineSearch(e.target.value)}
                                onFocus={() => { 
                                    if (!machineSearchQuery && machineOptions.length === 0) {
                                        handleMachineSearch('');
                                    } else {
                                        setShowMachineDropdown(true); 
                                    }
                                }}
                                onBlur={() => setTimeout(() => setShowMachineDropdown(false), 200)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                            {showMachineDropdown && machineOptions.length > 0 && (
                                <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                                    {machineOptions.map((m: any) => (
                                        <li 
                                            key={m.id} 
                                            onClick={() => selectMachine(m)}
                                            className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                                        >
                                            <div className="font-semibold text-slate-900">{m.serial_number}</div>
                                            <div className="text-xs text-slate-500 mt-1">ID: {m.id}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <p className="text-xs text-slate-500 mt-2">Search suggested. Custom machine IDs are also accepted if the machine is not found.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Terminal ID (TID)</label>
                            <input 
                                type="text" name="tid" value={formData.tid} onChange={handleChange} placeholder="Optional"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Service Information */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">Service Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="md:col-span-2 relative" ref={branchRef}>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Branch Assignment *</label>
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
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
                                                    setBranchCodeSearch(b.branch_code || '');
                                                    setShowBranches(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 flex items-center justify-between transition-colors border-b border-slate-100 last:border-b-0 ${
                                                    formData.branch_id === b.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700'
                                                }`}
                                            >
                                                <div>
                                                    <p className="font-semibold">{b.name || b.branch_name}</p>
                                                    {b.address && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{b.address}</p>}
                                                </div>
                                                {formData.branch_id === b.id && <Check className="w-5 h-5" />}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-3 text-sm text-slate-500 text-center">No branches found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Service Type *</label>
                            <select 
                                name="service_type" required value={formData.service_type} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            >
                                <option value="INSTALLATION">Installation</option>
                                <option value="DEINSTALLATION">Deinstallation</option>
                                <option value="REPLACEMENT">Replacement</option>
                                <option value="MISC_SERV">Miscellaneous Service</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Priority *</label>
                            <select 
                                name="priority" required value={formData.priority} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            >
                                <option value="NORMAL">Normal</option>
                                <option value="URGENT">Urgent</option>
                                <option value="CRITICAL">Critical</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Source *</label>
                            <select 
                                name="source" required value={formData.source} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            >
                                <option value="CUSTOMER_PORTAL">Customer Portal</option>
                                <option value="OPERATOR_RAISED">Operator Raised</option>
                                <option value="BANK_TRIGGERED">Bank Triggered</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Complaint Category</label>
                            <input 
                                type="text" name="complaint_category" value={formData.complaint_category} onChange={handleChange} placeholder="e.g. Printer Issue"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Complaint Description</label>
                        <textarea 
                            name="complaint_description" rows={4} value={formData.complaint_description} onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-70"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {loading ? 'Creating...' : 'Create Ticket'}
                    </button>
                </div>
            </form>
        </div>
    );
}
