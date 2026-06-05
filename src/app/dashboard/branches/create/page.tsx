"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, Info, AlertCircle } from 'lucide-react';
import api from '../../../../utils/axiosInstance';
import { PincodeRange } from '../../../../types/branch';

export default function CreateBranch() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        branch_code: '',
        branch_name: '',
        status: 'ACTIVE',
        contact_person: '',
        contact_mobile: '',
        contact_email: '',
        address: ''
    });

    const [pincodes, setPincodes] = useState<PincodeRange[]>([
        { pincode_from: '', pincode_to: '' }
    ]);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [globalError, setGlobalError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'branch_code' ? value.toUpperCase().replace(/\s/g, '') : value
        }));
        
        // Clear field error
        if (errors[name]) {
            setErrors(prev => {
                const newErr = { ...prev };
                delete newErr[name];
                return newErr;
            });
        }
    };

    const handlePincodeChange = (index: number, field: 'pincode_from' | 'pincode_to', value: string) => {
        // Allow only digits
        if (value && !/^\d*$/.test(value)) return;
        // Limit to 6
        if (value.length > 6) return;

        const updated = [...pincodes];
        updated[index][field] = value;
        setPincodes(updated);
        
        if (errors['pincodes']) {
            const newErr = { ...errors };
            delete newErr['pincodes'];
            setErrors(newErr);
        }
    };

    const addPincodeRow = () => {
        setPincodes([...pincodes, { pincode_from: '', pincode_to: '' }]);
    };

    const removePincodeRow = (index: number) => {
        if (pincodes.length > 1) {
            setPincodes(pincodes.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setGlobalError(null);

        // Client-side pincode validation
        for (let i = 0; i < pincodes.length; i++) {
            const p = pincodes[i];
            if (p.pincode_from.length !== 6 || p.pincode_to.length !== 6) {
                setErrors({ pincodes: `Row ${i + 1}: Pincode must be exactly 6 digits` });
                return;
            }
            if (parseInt(p.pincode_from) > parseInt(p.pincode_to)) {
                setErrors({ pincodes: `Row ${i + 1}: 'From' pincode cannot be greater than 'To'` });
                return;
            }
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                pincode_ranges: pincodes
            };
            
            const res = await api.post('/branches', payload);
            if (res.data.success) {
                alert('Branch created successfully!');
                router.push('/dashboard/branches');
            }
        } catch (err: any) {
            console.error('Create branch error:', err);
            const data = err.response?.data;
            if (data?.field) {
                setErrors({ [data.field]: data.error });
            } else if (data?.errors && Array.isArray(data.errors)) {
                // Express-validator mapping
                const map: Record<string, string> = {};
                data.errors.forEach((e: any) => {
                    map[e.path] = e.msg;
                });
                setErrors(map);
            } else {
                setGlobalError(data?.error || 'Failed to create branch');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 pb-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/branches" className="p-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors text-zinc-600">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Create Branch</h1>
                    <p className="text-zinc-500 text-sm mt-1">Create a new operational branch and configure its coverage.</p>
                </div>
            </div>

            {globalError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-red-800">Error</h4>
                        <p className="text-sm text-red-700 mt-1">{globalError}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
                {/* Main Form Area */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Branch Info */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-zinc-900 mb-6 flex items-center gap-2">
                            Branch Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Branch Code <span className="text-red-500">*</span></label>
                                <input 
                                    required
                                    name="branch_code"
                                    value={formData.branch_code}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="BR-MUM-01"
                                    className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 uppercase ${errors.branch_code ? 'border-red-300' : 'border-zinc-200'}`}
                                />
                                {errors.branch_code && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.branch_code}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Status <span className="text-red-500">*</span></label>
                                <select 
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                                >
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="INACTIVE">INACTIVE</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Branch Name <span className="text-red-500">*</span></label>
                                <input 
                                    required
                                    name="branch_name"
                                    value={formData.branch_name}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="Mumbai Central Hub"
                                    className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.branch_name ? 'border-red-300' : 'border-zinc-200'}`}
                                />
                                {errors.branch_name && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.branch_name}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-zinc-900 mb-6 flex items-center gap-2">
                            Contact Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Contact Person</label>
                                <input 
                                    name="contact_person"
                                    value={formData.contact_person}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="Rahul Sharma"
                                    className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Contact Mobile</label>
                                <input 
                                    name="contact_mobile"
                                    value={formData.contact_mobile}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="9876543210"
                                    className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.contact_mobile ? 'border-red-300' : 'border-zinc-200'}`}
                                />
                                {errors.contact_mobile && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.contact_mobile}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Contact Email</label>
                                <input 
                                    type="email"
                                    name="contact_email"
                                    value={formData.contact_email}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="mumbai@company.com"
                                    className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.contact_email ? 'border-red-300' : 'border-zinc-200'}`}
                                />
                                {errors.contact_email && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.contact_email}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Address Info */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-zinc-900 mb-6 flex items-center gap-2">
                            Address Information
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Full Address <span className="text-red-500">*</span></label>
                            <textarea 
                                required
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                disabled={submitting}
                                rows={3}
                                placeholder="123 Park Street, Mumbai, Maharashtra 400001"
                                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none ${errors.address ? 'border-red-300' : 'border-zinc-200'}`}
                            />
                            {errors.address && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.address}</p>}
                        </div>
                    </div>

                    {/* Pincode Grid */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-zinc-900">Pincode Coverage</h2>
                            <button 
                                type="button" 
                                onClick={addPincodeRow}
                                disabled={submitting}
                                className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium hover:text-emerald-700 disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4" />
                                Add Range
                            </button>
                        </div>
                        
                        {errors.pincodes && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                                {errors.pincodes}
                            </div>
                        )}

                        <div className="space-y-3">
                            {pincodes.map((row, index) => (
                                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <div className="flex-1 relative">
                                        <input
                                            required
                                            value={row.pincode_from}
                                            onChange={(e) => handlePincodeChange(index, 'pincode_from', e.target.value)}
                                            disabled={submitting}
                                            placeholder="From (e.g. 400001)"
                                            className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 tracking-widest font-mono"
                                        />
                                        {row.pincode_from.length > 0 && row.pincode_from.length !== 6 && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-orange-500 bg-orange-50 px-1.5 rounded">6 digits</span>
                                        )}
                                    </div>
                                    <span className="text-zinc-400 hidden sm:block">-</span>
                                    <div className="flex-1 relative">
                                        <input
                                            required
                                            value={row.pincode_to}
                                            onChange={(e) => handlePincodeChange(index, 'pincode_to', e.target.value)}
                                            disabled={submitting}
                                            placeholder="To (e.g. 400050)"
                                            className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 tracking-widest font-mono"
                                        />
                                        {row.pincode_to.length > 0 && row.pincode_to.length !== 6 && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-orange-500 bg-orange-50 px-1.5 rounded">6 digits</span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removePincodeRow(index)}
                                        disabled={pincodes.length === 1 || submitting}
                                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 pb-12">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-wait"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {submitting ? 'Creating...' : 'Create Branch'}
                        </button>
                    </div>
                </div>

                {/* Sidebar Panel */}
                <div className="w-full lg:w-80 shrink-0 space-y-6">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                        <div className="flex gap-3 mb-3">
                            <Info className="w-5 h-5 text-emerald-600 shrink-0" />
                            <h3 className="font-semibold text-emerald-900">Branch Guidelines</h3>
                        </div>
                        <ul className="space-y-3 text-sm text-emerald-800">
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                                <span>Branch Code is immutable once created. Choose carefully.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                                <span>Status determines whether engineers can be assigned to tickets in this branch.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5">
                        <div className="flex gap-3 mb-3">
                            <Info className="w-5 h-5 text-zinc-600 shrink-0" />
                            <h3 className="font-semibold text-zinc-900">Pincode Rules</h3>
                        </div>
                        <ul className="space-y-3 text-sm text-zinc-600">
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 shrink-0 mt-1.5" />
                                <span>Ranges cannot overlap with any other branch in the system.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 shrink-0 mt-1.5" />
                                <span>Pincodes must be exactly 6 numerical digits.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 shrink-0 mt-1.5" />
                                <span>The 'From' value must be numerically less than or equal to the 'To' value.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </form>
        </div>
    );
}
