"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, Info, AlertCircle } from 'lucide-react';
import api from '@/utils/axiosInstance';
import { Branch, PincodeRange } from '@/types/branch';

export default function EditBranch({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = React.use(params);
    
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [branchCode, setBranchCode] = useState(''); // Readonly
    const [formData, setFormData] = useState({
        branch_name: '',
        status: 'ACTIVE',
        contact_person: '',
        contact_mobile: '',
        contact_email: '',
        address: ''
    });

    const [pincodes, setPincodes] = useState<PincodeRange[]>([]);
    const [deletedPincodeIds, setDeletedPincodeIds] = useState<string[]>([]);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [globalError, setGlobalError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;  // guard against undefined id
        const fetchBranch = async () => {
            try {
                const res = await api.get(`/branches/${id}`);
                if (res.data.success) {
                    const b = res.data;
                    setBranchCode(b.branch_code);
                    setFormData({
                        branch_name: b.branch_name || '',
                        status: b.status || 'ACTIVE',
                        contact_person: b.contact_person || '',
                        contact_mobile: b.contact_mobile || '',
                        contact_email: b.contact_email || '',
                        address: b.address || ''
                    });
                    setPincodes(b.pincode_ranges || []);
                } else {
                    setGlobalError('Failed to fetch branch details');
                }
            } catch (err: any) {
                setGlobalError(err.response?.data?.error || 'Failed to fetch branch details');
            } finally {
                setLoading(false);
            }
        };
        fetchBranch();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => {
                const newErr = { ...prev };
                delete newErr[name];
                return newErr;
            });
        }
    };

    const handlePincodeChange = (index: number, field: 'pincode_from' | 'pincode_to', value: string) => {
        if (value && !/^\d*$/.test(value)) return;
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
        const target = pincodes[index];
        if (target.id) {
            setDeletedPincodeIds([...deletedPincodeIds, target.id]);
        }
        setPincodes(pincodes.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setGlobalError(null);

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
                pincode_ranges: {
                    upsert: pincodes,
                    delete: deletedPincodeIds
                }
            };
            
            const res = await api.patch(`/branches/${id}`, payload);
            if (res.data.success) {
                alert('Branch updated successfully!');
                router.push(`/dashboard/branches/${id}`);
            }
        } catch (err: any) {
            console.error('Update branch error:', err);
            const data = err.response?.data;
            if (data?.field) {
                setErrors({ [data.field]: data.error });
            } else if (data?.errors && Array.isArray(data.errors)) {
                const map: Record<string, string> = {};
                data.errors.forEach((e: any) => {
                    map[e.path] = e.msg;
                });
                setErrors(map);
            } else {
                setGlobalError(data?.error || 'Failed to update branch');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-12 text-center text-zinc-500 animate-pulse">Loading branch data...</div>;
    }

    return (
        <div className="animate-in fade-in duration-500 pb-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href={`/dashboard/branches/${id}`} className="p-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors text-zinc-600">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Edit Branch</h1>
                    <p className="text-zinc-500 text-sm mt-1">Update branch details and coverage areas.</p>
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
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Branch Code (Immutable)</label>
                                <input 
                                    disabled
                                    value={branchCode}
                                    className="w-full px-4 py-2 border border-zinc-200 bg-zinc-50 rounded-xl text-sm text-zinc-500 font-mono tracking-wide cursor-not-allowed"
                                />
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
                                            className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 tracking-widest font-mono ${row.id ? 'bg-zinc-50 border-zinc-200' : 'bg-blue-50 border-blue-200'}`}
                                        />
                                    </div>
                                    <span className="text-zinc-400 hidden sm:block">-</span>
                                    <div className="flex-1 relative">
                                        <input
                                            required
                                            value={row.pincode_to}
                                            onChange={(e) => handlePincodeChange(index, 'pincode_to', e.target.value)}
                                            disabled={submitting}
                                            placeholder="To (e.g. 400050)"
                                            className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 tracking-widest font-mono ${row.id ? 'bg-zinc-50 border-zinc-200' : 'bg-blue-50 border-blue-200'}`}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removePincodeRow(index)}
                                        disabled={submitting}
                                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            {pincodes.length === 0 && (
                                <p className="text-sm text-zinc-500 text-center py-4">No coverage configured. Add a range above.</p>
                            )}
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
                            {submitting ? 'Updating...' : 'Update Branch'}
                        </button>
                    </div>
                </div>

                {/* Sidebar Panel */}
                <div className="w-full lg:w-80 shrink-0 space-y-6">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                        <div className="flex gap-3 mb-3">
                            <Info className="w-5 h-5 text-emerald-600 shrink-0" />
                            <h3 className="font-semibold text-emerald-900">Branch Updates</h3>
                        </div>
                        <ul className="space-y-3 text-sm text-emerald-800">
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                                <span>Changing branch status to INACTIVE does not delete dependencies, but prevents new assignments.</span>
                            </li>
                        </ul>
                    </div>
                    
                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5">
                        <div className="flex gap-3 mb-3">
                            <Info className="w-5 h-5 text-zinc-600 shrink-0" />
                            <h3 className="font-semibold text-zinc-900">Pincode Editing</h3>
                        </div>
                        <ul className="space-y-3 text-sm text-zinc-600">
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 shrink-0 mt-1.5" />
                                <span>Existing ranges are shown with a grey background.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0 mt-1.5" />
                                <span>Newly added ranges will appear with a blue background until saved.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-300 shrink-0 mt-1.5" />
                                <span>Deleted ranges are removed immediately from the UI, but aren't deleted in the database until you click Update Branch.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </form>
        </div>
    );
}
