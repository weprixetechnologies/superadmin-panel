"use client";
import React, { useEffect, useState } from 'react';
import api from '@/utils/axiosInstance';
import { CheckCircle2, Circle, Upload, Loader2, ArrowRight } from 'lucide-react';


const WorkflowStep = ({ title, completed, hasMilestone, isEngineer, requiresUpload, onComplete, submitting, milestones }: any) => {
    const isDone = completed || hasMilestone;
    const [uploadUrl, setUploadUrl] = React.useState('');
    
    return (
        <div className={`flex items-start gap-4 p-4 rounded-xl border ${isDone ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-200'}`}>
            {isDone ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
                <Circle className="w-6 h-6 text-slate-300 shrink-0 mt-0.5" />
            )}
            
            <div className="flex-1">
                <p className={`font-medium ${isDone ? 'text-emerald-900' : 'text-slate-700'}`}>{title}</p>
                
                {!isDone && isEngineer && (
                    <div className="mt-3 flex flex-col sm:flex-row gap-3">
                        {requiresUpload && (
                            <input 
                                type="text" 
                                placeholder="Enter Image URL..."
                                className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={uploadUrl}
                                onChange={(e) => setUploadUrl(e.target.value)}
                            />
                        )}
                        <button 
                            onClick={() => {
                                if (requiresUpload && !uploadUrl) {
                                    alert('Please provide an image URL first');
                                    return;
                                }
                                onComplete(requiresUpload ? { imageUrl: uploadUrl } : {});
                            }}
                            disabled={submitting}
                            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap"
                        >
                            {submitting ? 'Saving...' : 'Mark Complete'}
                        </button>
                    </div>
                )}
                {isDone && hasMilestone && milestones.find((x:any) => x.milestone === title)?.imageUrl && (
                    <div className="mt-2 text-xs text-emerald-700 bg-emerald-100/50 inline-block px-2 py-1 rounded">
                        Image Uploaded
                    </div>
                )}
            </div>
        </div>
    );
};

export default function WorkflowPanel({ ticketId, serviceType, isEngineer, onStateChange }: { ticketId: string, serviceType: string, isEngineer: boolean, onStateChange?: () => void }) {
    const [workflow, setWorkflow] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    useEffect(() => {
        fetchWorkflow();
    }, [ticketId]);

    const fetchWorkflow = async () => {
        try {
            const res = await api.get(`/tickets/${ticketId}/workflow`);
            setWorkflow(res.data.data);
        } catch (error) {
            console.error('Failed to fetch workflow state', error);
        } finally {
            setLoading(false);
        }
    };

    const submitMilestone = async (milestone: string, extraPayload: any = {}) => {
        if (!isEngineer) return;
        setSubmitting(true);
        try {
            await api.post(`/tickets/${ticketId}/milestone`, {
                milestone,
                ...extraPayload
            });
            await fetchWorkflow();
            if (onStateChange) onStateChange();
        } catch (error) {
            console.error('Failed to submit milestone', error);
            alert('Failed to save milestone. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const requestClosure = async () => {
        if (!isEngineer) return;
        setSubmitting(true);
        try {
            await api.post(`/tickets/${ticketId}/request-closure`, {});
            window.location.reload();
        } catch (error) {
            console.error('Failed to request closure', error);
            alert('Failed to request closure. Try again.');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
            </div>
        );
    }

    const milestones = workflow?.milestones || [];
    const hasMilestone = (m: string) => milestones.some((x: any) => x.milestone === m);

    
    let stepsData: any[] = [];
    let readyToClose = false;

    if (serviceType === 'INSTALLATION') {
        const c1 = hasMilestone('Installation Confirmed');
        const c2 = hasMilestone('Installation Image Uploaded');
        readyToClose = c1 && c2;
        stepsData = [
            { key: "1", title: "Arrived", completed: true },
            { key: "2", title: "Installation Confirmed", onComplete: () => submitMilestone('Installation Confirmed') },
            { key: "3", title: "Installation Image Uploaded", requiresUpload: true, uploadKey: "installImg", onComplete: (p:any) => submitMilestone('Installation Image Uploaded', p) }
        ];
    } else if (serviceType === 'DEINSTALLATION') {
        const c1 = hasMilestone('Machine Collected');
        const c2 = hasMilestone('Collection Image Uploaded');
        const c3 = hasMilestone('Machine Submitted To Office');
        readyToClose = c1 && c2 && c3;
        stepsData = [
            { key: "1", title: "Arrived", completed: true },
            { key: "2", title: "Machine Collected", onComplete: () => submitMilestone('Machine Collected') },
            { key: "3", title: "Collection Image Uploaded", requiresUpload: true, uploadKey: "collImg", onComplete: (p:any) => submitMilestone('Collection Image Uploaded', p) },
            { key: "4", title: "Machine Submitted To Office", onComplete: () => submitMilestone('Machine Submitted To Office') }
        ];
    } else if (serviceType === 'REPLACEMENT') {
        const c1 = hasMilestone('Old Machine Picked');
        const c2 = hasMilestone('Old Machine Image Uploaded');
        const c3 = hasMilestone('New Machine Installed');
        const c4 = hasMilestone('New Machine Image Uploaded');
        const c5 = hasMilestone('Old Machine Submitted To Office');
        readyToClose = c1 && c2 && c3 && c4 && c5;
        stepsData = [
            { key: "1", title: "Arrived", completed: true },
            { key: "2", title: "Old Machine Picked", onComplete: () => submitMilestone('Old Machine Picked') },
            { key: "3", title: "Old Machine Image Uploaded", requiresUpload: true, uploadKey: "oldImg", onComplete: (p:any) => submitMilestone('Old Machine Image Uploaded', p) },
            { key: "4", title: "New Machine Installed", onComplete: () => submitMilestone('New Machine Installed') },
            { key: "5", title: "New Machine Image Uploaded", requiresUpload: true, uploadKey: "newImg", onComplete: (p:any) => submitMilestone('New Machine Image Uploaded', p) },
            { key: "6", title: "Old Machine Submitted To Office", onComplete: () => submitMilestone('Old Machine Submitted To Office') }
        ];
    } else {
        const c1 = hasMilestone('Inspection Completed');
        readyToClose = c1;
        stepsData = [
            { key: "1", title: "Arrived", completed: true },
            { key: "2", title: "Inspection Completed", onComplete: () => submitMilestone('Inspection Completed') }
        ];
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-slate-900">Service Workflow</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Current Type: {serviceType}</p>
                </div>
            </div>
            
            <div className="p-6">
                <div className="space-y-4">
                    {stepsData.map(step => (
                        <WorkflowStep 
                            key={step.key}
                            title={step.title}
                            completed={step.completed}
                            hasMilestone={hasMilestone(step.title)}
                            isEngineer={isEngineer}
                            requiresUpload={step.requiresUpload}
                            onComplete={step.onComplete}
                            submitting={submitting}
                            milestones={milestones}
                        />
                    ))}
                </div>

                {readyToClose && isEngineer && (
                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100 flex flex-col items-center text-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
                            <h4 className="font-semibold text-emerald-900 mb-1">Workflow Complete</h4>
                            <p className="text-sm text-emerald-700 mb-5">All required steps for {serviceType.toLowerCase()} have been completed. You can now request closure.</p>
                            
                            <button 
                                onClick={requestClosure}
                                disabled={submitting}
                                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Processing...' : 'Request Closure'}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
