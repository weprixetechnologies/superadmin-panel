"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, AlertCircle, Info } from 'lucide-react';
import { merchantApi } from '../../../../apis/merchantApi';
import api from '../../../../utils/axiosInstance';
import { useAuth } from '../../../../context/AuthContext';


export default function CreateMerchant() {
    const router = useRouter();
    const { user } = useAuth();
    
    // Explicitly block engineers
    if (user?.role === 'ENGINEER') {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-bold text-red-600">Unauthorized</h2>
                <p className="text-zinc-500 mt-2">You do not have permission to create merchants.</p>
            </div>
        );
    }

    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        full_name: '',
        business_name: '',
        mobile: '',
        email: '',
        pincode: '',
        address: '',
        branch_id: ''
    });

    const [branches, setBranches] = useState<any[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [globalError, setGlobalError] = useState<string | null>(null);

    useEffect(() => {
        if (user?.role === 'SUPERADMIN' ) {
            const fetchBranches = async () => {
                try {
                    const res = await api.get('/branches?limit=100');
                    if (res.data.success) {
                        setBranches(res.data.data);
                    }
                } catch (err) {
                    console.error('Failed to fetch branches', err);
                }
            };
            fetchBranches();
        }
    }, [user?.role]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setGlobalError(null);

        setSubmitting(true);
        try {
            const payload = { ...formData };
            if (!payload.business_name) delete payload.business_name;
            if (!payload.email) delete payload.email;
            
            // For operators/managers, branch_id is implicitly derived in the backend via token
            if (user?.role !== 'SUPERADMIN' && user?.role !== 'SUPER_ADMIN') {
                delete payload.branch_id;
            }

            const res = await merchantApi.create(payload);
            if (res.data.success) {
                alert('Merchant created successfully!');
                router.push('/dashboard/merchants');
            }
        } catch (err: any) {
            console.error('Create merchant error:', err);
            const data = err.response?.data;
            if (data?.errors && Array.isArray(data.errors)) {
                const map: Record<string, string> = {};
                data.errors.forEach((e: any) => {
                    map[e.path] = e.msg;
                });
                setErrors(map);
            } else {
                setGlobalError(data?.message || 'Failed to create merchant');
                alert(data?.message || 'Failed to create merchant');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 pb-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/merchants" className="p-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors text-zinc-600">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Register Merchant</h1>
                    <p className="text-zinc-500 text-sm mt-1">Create a new merchant profile in the system.</p>
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
                    {/* Merchant Info */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-zinc-900 mb-6 flex items-center gap-2">
                            Merchant Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                                <input 
                                    required
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="Ramesh Patel"
                                    className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.full_name ? 'border-red-300' : 'border-zinc-200'}`}
                                />
                                {errors.full_name && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.full_name}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Business Name</label>
                                <input 
                                    name="business_name"
                                    value={formData.business_name}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="Patel Supermarket"
                                    className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                                {errors.business_name && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.business_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
                                <input 
                                    required
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="9876543210"
                                    maxLength={10}
                                    className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.mobile ? 'border-red-300' : 'border-zinc-200'}`}
                                />
                                {errors.mobile && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.mobile}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email Address</label>
                                <input 
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    placeholder="ramesh@example.com"
                                    className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.email ? 'border-red-300' : 'border-zinc-200'}`}
                                />
                                {errors.email && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.email}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Location Info */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-zinc-900 mb-6 flex items-center gap-2">
                            Location Information
                        </h2>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Pincode <span className="text-red-500">*</span></label>
                                <input 
                                    required
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    maxLength={6}
                                    placeholder="400001"
                                    className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.pincode ? 'border-red-300' : 'border-zinc-200'}`}
                                />
                                {errors.pincode && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.pincode}</p>}
                            </div>
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
                    </div>

                    {/* Branch Assignment - Only for SuperAdmin */}
                    {(user?.role === 'SUPERADMIN' ) && (
                        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-6 flex items-center gap-2">
                                Branch Assignment
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Assign to Branch <span className="text-red-500">*</span></label>
                                <select 
                                    required
                                    name="branch_id"
                                    value={formData.branch_id}
                                    onChange={handleChange}
                                    disabled={submitting || branches.length === 0}
                                    className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white ${errors.branch_id ? 'border-red-300' : 'border-zinc-200'}`}
                                >
                                    <option value="">Select a branch</option>
                                    {branches.map((b: any) => (
                                        <option key={b.id} value={b.id}>{b.branch_name} ({b.branch_code})</option>
                                    ))}
                                </select>
                                {errors.branch_id && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.branch_id}</p>}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 pb-12 gap-3">
                        <Link
                            href="/dashboard/merchants"
                            className="px-6 py-3 border border-zinc-200 text-zinc-600 rounded-xl font-medium hover:bg-zinc-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </Link>
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
                            {submitting ? 'Creating...' : 'Create Merchant'}
                        </button>
                    </div>
                </div>

                {/* Sidebar Panel */}
                <div className="w-full lg:w-80 shrink-0 space-y-6">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                        <div className="flex gap-3 mb-3">
                            <Info className="w-5 h-5 text-emerald-600 shrink-0" />
                            <h3 className="font-semibold text-emerald-900">Merchant Guidelines</h3>
                        </div>
                        <ul className="space-y-3 text-sm text-emerald-800">
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                                <span>Merchant Code will be auto-generated (e.g. MRC-00001).</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                                <span>Mobile number must be exactly 10 digits and unique in the system.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                                <span>The merchant will be actively available for machine assignments upon creation.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </form>
        </div>
    );
}
