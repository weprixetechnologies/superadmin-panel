"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, AlertCircle, Info } from 'lucide-react';
import { merchantApi } from '../../../../../apis/merchantApi';
import { useAuth } from '../../../../../context/AuthContext';


export default function EditMerchant() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { user } = useAuth();
    
    // Explicitly block engineers
    if (user?.role === 'ENGINEER') {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-bold text-red-600">Unauthorized</h2>
                <p className="text-zinc-500 mt-2">You do not have permission to edit merchants.</p>
            </div>
        );
    }

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [merchantCode, setMerchantCode] = useState('');
    const [formData, setFormData] = useState({
        full_name: '',
        business_name: '',
        mobile: '',
        email: '',
        pincode: '',
        address: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [globalError, setGlobalError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMerchant = async () => {
            try {
                const res = await merchantApi.getById(id);
                if (res.data.success) {
                    const data = res.data.data.merchant;
                    setMerchantCode(data.merchant_code);
                    setFormData({
                        full_name: data.full_name || '',
                        business_name: data.business_name || '',
                        mobile: data.mobile || '',
                        email: data.email || '',
                        pincode: data.pincode || '',
                        address: data.address || ''
                    });
                }
            } catch (err: any) {
                setGlobalError(err.response?.data?.message || 'Failed to fetch merchant details');
            } finally {
                setLoading(false);
            }
        };
        fetchMerchant();
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setGlobalError(null);

        setSubmitting(true);
        try {
            const payload = { ...formData };
            if (!payload.business_name) delete payload.business_name;
            if (!payload.email) delete payload.email;

            const res = await merchantApi.update(id, payload);
            if (res.data.success) {
                alert('Merchant updated successfully!');
                router.push(`/dashboard/merchants/${id}`);
            }
        } catch (err: any) {
            console.error('Update merchant error:', err);
            const data = err.response?.data;
            if (data?.errors && Array.isArray(data.errors)) {
                const map: Record<string, string> = {};
                data.errors.forEach((e: any) => {
                    map[e.path] = e.msg;
                });
                setErrors(map);
            } else {
                setGlobalError(data?.message || 'Failed to update merchant');
                alert(data?.message || 'Failed to update merchant');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 pb-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href={`/dashboard/merchants/${id}`} className="p-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors text-zinc-600">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Edit Merchant</h1>
                    <p className="text-zinc-500 text-sm mt-1">Update profile information for {merchantCode}</p>
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
                                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none ${errors.address ? 'border-red-300' : 'border-zinc-200'}`}
                                />
                                {errors.address && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.address}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 pb-12 gap-3">
                        <Link
                            href={`/dashboard/merchants/${id}`}
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
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* Sidebar Panel */}
                <div className="w-full lg:w-80 shrink-0 space-y-6">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                        <div className="flex gap-3 mb-3">
                            <Info className="w-5 h-5 text-emerald-600 shrink-0" />
                            <h3 className="font-semibold text-emerald-900">Editing Rules</h3>
                        </div>
                        <ul className="space-y-3 text-sm text-emerald-800">
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                                <span>Merchant Code cannot be modified.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                                <span>Branch assignment cannot be modified.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                                <span>Changes are recorded in the audit logs.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </form>
        </div>
    );
}
