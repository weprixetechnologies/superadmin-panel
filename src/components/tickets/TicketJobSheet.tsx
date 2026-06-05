"use client";

import React, { useState } from 'react';
import { ClipboardCheck, Loader2 } from 'lucide-react';
import api from '@/utils/axiosInstance';

interface JobSheetProps {
    ticketId: string;
    jobSheet?: any;
    onSuccess: () => void;
    canSubmit: boolean;
}

export default function TicketJobSheet({ ticketId, jobSheet, onSuccess, canSubmit }: JobSheetProps) {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        work_done: jobSheet?.work_done || '',
        parts_replaced: jobSheet?.parts_replaced || '',
        time_on_site_minutes: jobSheet?.time_on_site_minutes || '',
        merchant_signoff_name: jobSheet?.merchant_signoff_name || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                time_on_site_minutes: parseInt(formData.time_on_site_minutes.toString() || '0', 10)
            };
            const { data } = await api.post(`/tickets/${ticketId}/job-sheet`, payload);
            if (data?.success) {
                alert('Job sheet saved successfully!');
                onSuccess();
            }
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to submit job sheet');
        } finally {
            setSubmitting(false);
        }
    };

    // Always show the section, even if empty and read-only.

    const isReadOnly = !!jobSheet && !canSubmit;

    return (
        <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm mt-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900">Engineer Job Sheet</h3>
                    {jobSheet && <p className="text-xs text-slate-500">Submitted on {new Date(jobSheet.created_at).toLocaleString()}</p>}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Work Done *</label>
                    <textarea 
                        name="work_done"
                        required
                        disabled={isReadOnly}
                        value={formData.work_done}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm disabled:opacity-70"
                        rows={3}
                    ></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Parts Replaced</label>
                    <textarea 
                        name="parts_replaced"
                        disabled={isReadOnly}
                        value={formData.parts_replaced}
                        onChange={handleChange}
                        placeholder="N/A"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm disabled:opacity-70"
                        rows={2}
                    ></textarea>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Time On Site (mins) *</label>
                        <input 
                            type="number"
                            name="time_on_site_minutes"
                            required
                            min="1"
                            disabled={isReadOnly}
                            value={formData.time_on_site_minutes}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:opacity-70"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Merchant Signoff Name</label>
                        <input 
                            type="text"
                            name="merchant_signoff_name"
                            disabled={isReadOnly}
                            value={formData.merchant_signoff_name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:opacity-70"
                        />
                    </div>
                </div>

                {!isReadOnly && (
                    <div className="pt-2 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-70 flex items-center gap-2"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {jobSheet ? 'Update Job Sheet' : 'Submit Job Sheet'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
