"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    ArrowLeft, User as UserIcon, Building2, Smartphone, Key, MapPin, 
    Clock, AlertTriangle, ShieldAlert, CheckCircle, Wrench, XCircle, HardDrive
} from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/axiosInstance';
import { AuthUser } from '@/utils/auth';
import { useAuth } from '@/context/AuthContext';

import TicketTimeline from '@/components/tickets/TicketTimeline';
import TicketMessages from '@/components/tickets/TicketMessages';
import TicketAttachments from '@/components/tickets/TicketAttachments';
import TicketJobSheet from '@/components/tickets/TicketJobSheet';
import WorkflowPanel from '@/components/tickets/WorkflowPanel';

export default function TicketDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Modal States
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [modalData, setModalData] = useState<any>({});
    const [modalLoading, setModalLoading] = useState(false);

    // Engineer Search States
    const [engineers, setEngineers] = useState<any[]>([]);
    const [engineerSearch, setEngineerSearch] = useState('');
    const [loadingEngineers, setLoadingEngineers] = useState(false);

    useEffect(() => {
        if (activeModal === 'ASSIGN' && engineers.length === 0) {
            setLoadingEngineers(true);
            api.get('/employees/list?role=ENGINEER')
                .then(res => {
                    if (res.data?.success) {
                        setEngineers(res.data.employees || res.data.data || []);
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoadingEngineers(false));
        }
    }, [activeModal]);

    const filteredEngineers = engineers.filter(e => 
        e.full_name?.toLowerCase().includes(engineerSearch.toLowerCase()) || 
        e.employee_code?.toLowerCase().includes(engineerSearch.toLowerCase()) ||
        e.mobile?.includes(engineerSearch)
    );

    const fetchTicket = async () => {
        try {
            const { data } = await api.get(`/tickets/${id}`);
            if (data?.success) {
                const { ticket, engineer, statusHistory, attachments, messages, jobSheet } = data.data;
                setTicket({
                    ...ticket,
                    engineer,
                    statusHistory,
                    attachments,
                    messages,
                    jobSheet
                });
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to fetch ticket');
            router.push('/dashboard/tickets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const handleModalSubmit = async (e: React.FormEvent, endpoint: string, payload: any, method: 'post'|'put' = 'post') => {
        e.preventDefault();
        setModalLoading(true);
        try {
            await api[method](`/tickets/${id}${endpoint}`, payload);
            alert('Success!');
            setActiveModal(null);
            setModalData({});
            fetchTicket(); // Refresh ticket data
        } catch (err: any) {
            alert(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Action failed');
        } finally {
            setModalLoading(false);
        }
    };

    const handleGenerateCloseCode = async () => {
        if (!confirm('Are you sure you want to generate a close code?')) return;
        try {
            const { data } = await api.post(`/tickets/${id}/close-code/generate`, {});
            alert(`Generated Close Code: ${data?.data?.close_code}\nGive this to the engineer!`);
            fetchTicket();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to generate code');
        }
    };

    const handleGenerateFallbackCode = async () => {
        if (!confirm('Generate Fallback Code for this ticket?')) return;
        try {
            const { data } = await api.post(`/tickets/${id}/otp/fallback/generate`, {});
            alert(`Generated Fallback Code: ${data?.data?.fallback_code || data?.fallback_code || 'Success'}\nGive this to the engineer!`);
            fetchTicket();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to generate code');
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    if (!ticket) return null;

    return (
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/tickets" className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900">{ticket.ticket_number}</h1>
                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full border bg-slate-100 text-slate-700 border-slate-200">
                                {ticket.service_type.replace(/_/g, ' ')}
                            </span>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${ticket.status === 'CLOSED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                {ticket.status.replace(/_/g, ' ')}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Created {new Date(ticket.created_at).toLocaleString()}</p>
                    </div>
                </div>

                {/* Top Action Buttons (Role specific) */}
                <div className="flex items-center gap-2">
                    {user?.role !== 'ENGINEER' && (
                        <>
                            {ticket.status !== 'CANCELLED' && ticket.status !== 'CLOSED' && (
                                <button onClick={() => setActiveModal('CANCEL')} className="px-4 py-2 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-700 text-sm font-medium rounded-xl transition-colors">
                                    Cancel
                                </button>
                            )}
                            {(user?.role === 'MANAGER' || user?.role === 'SUPERADMIN') && ticket.status !== 'CLOSED' && (
                                <button onClick={() => setActiveModal('FORCE_CLOSE')} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors">
                                    Force Close
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* 3 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT COLUMN: Info */}
                <div className="min-w-0 lg:col-span-3 space-y-6">
                    {/* Merchant Info */}
                    <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400" /> Merchant Details
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Name</p>
                                <p className="text-sm font-medium text-slate-900">{ticket.merchant_name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Mobile</p>
                                <p className="text-sm font-medium text-slate-900">{ticket.merchant_mobile}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Address</p>
                                <p className="text-sm font-medium text-slate-900">{ticket.merchant_address}</p>
                                <p className="text-xs text-slate-600">{ticket.merchant_pincode}</p>
                            </div>
                            {ticket.mcc_code && (
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">MCC Code</p>
                                    <p className="text-sm font-medium text-slate-900">{ticket.mcc_code}</p>
                                </div>
                            )}
                            {ticket.zone_name && (
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Zone Name</p>
                                    <p className="text-sm font-medium text-slate-900">{ticket.zone_name}</p>
                                </div>
                            )}
                            {ticket.sponsor_bank && (
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Sponsor Bank</p>
                                    <p className="text-sm font-medium text-slate-900">{ticket.sponsor_bank}</p>
                                </div>
                            )}
                            {ticket.mid && (
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">MID</p>
                                    <p className="text-sm font-medium text-slate-900">{ticket.mid}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Machine Info */}
                    <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <HardDrive className="w-4 h-4 text-slate-400" /> Machine Details
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Machine ID</p>
                                <p className="text-sm font-medium text-slate-900">{ticket.machine_id || 'Not specified'}</p>
                            </div>
                            {ticket.tid && (
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">TID</p>
                                    <p className="text-sm font-medium text-slate-900">{ticket.tid}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SLA Info */}
                    <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" /> SLA & Priority
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Priority</p>
                                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                    ticket.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                                }`}>{ticket.priority}</span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Due Date</p>
                                <p className={`text-sm font-medium ${ticket.sla_breached ? 'text-red-600' : 'text-slate-900'}`}>
                                    {new Date(ticket.sla_due_at).toLocaleString()}
                                </p>
                            </div>
                            {ticket.sla_breached === 1 && (
                                <div className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 p-2 rounded-lg">
                                    <AlertTriangle className="w-4 h-4" /> SLA Breached!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* CENTER COLUMN: Timeline & Communication */}
                <div className="min-w-0 lg:col-span-6 space-y-6">
                    {['IN_PROGRESS', 'PENDING_CLOSE'].includes(ticket.status) && (
                        <WorkflowPanel ticketId={ticket.id} serviceType={ticket.service_type} isEngineer={false} onStateChange={fetchTicket} />
                    )}

                    <TicketAttachments ticketId={id as string} attachments={ticket.attachments} onUploadSuccess={fetchTicket} />
                    
                    <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-6">Status Timeline</h3>
                        <TicketTimeline history={ticket.statusHistory} />
                    </div>

                    <TicketMessages ticketId={id as string} initialMessages={ticket.messages} user={user} />
                </div>

                {/* RIGHT COLUMN: Actions & Assignment */}
                <div className="min-w-0 lg:col-span-3 space-y-6">
                    {/* Assignment Panel */}
                    <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-slate-400" /> Assignment
                        </h3>
                        {ticket.engineer ? (
                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">
                                    {ticket.engineer.full_name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">{ticket.engineer.full_name}</p>
                                    <p className="text-xs text-slate-500">{ticket.engineer.mobile}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                Unassigned
                            </div>
                        )}
                        
                        {user?.role !== 'ENGINEER' && ticket.status !== 'CLOSED' && ticket.status !== 'CANCELLED' && (
                            <button 
                                onClick={() => setActiveModal('ASSIGN')}
                                className="w-full mt-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium rounded-xl transition-colors"
                            >
                                {ticket.assigned_engineer_id ? 'Reassign Engineer' : 'Assign Engineer'}
                            </button>
                        )}
                    </div>

                    {/* Operational Quick Actions (Engineers & Managers) */}
                    <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Wrench className="w-4 h-4 text-slate-400" /> Actions
                        </h3>
                        <div className="space-y-2">
                            {user?.role !== 'ENGINEER' && ['IN_PROGRESS', 'MACHINE_PICKED', 'IN_OFFICE', 'UNDER_REPAIR', 'READY_DEPLOY', 'PENDING_CLOSE'].includes(ticket.status) && (
                                <button onClick={handleGenerateCloseCode} className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors">
                                    Generate Close Code
                                </button>
                            )}

                            {user?.role !== 'ENGINEER' && ticket.status === 'ARRIVED_PENDING' && (
                                <button onClick={handleGenerateFallbackCode} className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-xl transition-colors">
                                    Generate Fallback Code
                                </button>
                            )}

                            {user?.role !== 'ENGINEER' && ticket.status === 'IN_PROGRESS' && (
                                <button onClick={() => setActiveModal('CHANGE_TYPE')} className="w-full py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-sm font-medium rounded-xl transition-colors mb-2">
                                    🔄 Change Service Type
                                </button>
                            )}

                            {user?.role !== 'ENGINEER' && ticket.status === 'PENDING_CLOSE' && (
                                <button onClick={() => handleModalSubmit({ preventDefault: ()=>{} } as any, '/close', {})} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors mt-2">
                                    Final Close Ticket
                                </button>
                            )}

                            {user?.role !== 'ENGINEER' && !['IN_PROGRESS', 'MACHINE_PICKED', 'IN_OFFICE', 'UNDER_REPAIR', 'READY_DEPLOY', 'PENDING_CLOSE', 'ARRIVED_PENDING'].includes(ticket.status) && (
                                <p className="text-xs text-slate-400 text-center py-2">No actions available for this stage.</p>
                            )}

                            {user?.role === 'ENGINEER' && (
                                <>
                                    {ticket.status === 'ASSIGNED' && (
                                        <button onClick={() => handleModalSubmit({ preventDefault: ()=>{} } as any, '/status/en-route', {})} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors">
                                            Mark En Route
                                        </button>
                                    )}
                                    {ticket.status === 'EN_ROUTE' && (
                                        <button onClick={() => handleModalSubmit({ preventDefault: ()=>{} } as any, '/status/arrived', {})} className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors">
                                            Mark Arrived
                                        </button>
                                    )}
                                    {ticket.status === 'ARRIVED_PENDING' && (
                                        <>
                                            <button onClick={() => setActiveModal('OTP_ARRIVAL')} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl">
                                                Validate Arrival OTP
                                            </button>
                                            <button onClick={() => setActiveModal('FALLBACK')} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl">
                                                Use Fallback Code
                                            </button>
                                        </>
                                    )}
                                    {ticket.status === 'IN_PROGRESS' && ticket.service_type === 'PICKUP' && (
                                        <button onClick={() => setActiveModal('MACHINE_PICKED')} className="w-full py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-xl transition-colors">
                                            Machine Picked
                                        </button>
                                    )}
                                    {ticket.status === 'PENDING_CLOSE' && (
                                        <button onClick={() => setActiveModal('SUBMIT_CLOSE_CODE')} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors">
                                            Submit Close Code
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <TicketJobSheet 
                        ticketId={id as string} 
                        jobSheet={ticket.jobSheet} 
                        onSuccess={fetchTicket} 
                        canSubmit={user?.role === 'ENGINEER' && ['IN_PROGRESS', 'MACHINE_PICKED', 'IN_OFFICE', 'UNDER_REPAIR', 'READY_DEPLOY', 'PENDING_CLOSE'].includes(ticket.status)} 
                    />
                </div>
            </div>

            {/* MODALS */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-semibold text-slate-900">
                                {activeModal === 'ASSIGN' && 'Assign Engineer'}
                                {activeModal === 'CANCEL' && 'Cancel Ticket'}
                                {activeModal === 'FORCE_CLOSE' && 'Force Close Ticket'}
                                {activeModal === 'OTP_ARRIVAL' && 'Arrival OTP Validation'}
                                {activeModal === 'FALLBACK' && 'Fallback Code Validation'}
                                {activeModal === 'SUBMIT_CLOSE_CODE' && 'Submit Close Code'}
                                {activeModal === 'CHANGE_TYPE' && 'Change Service Type'}
                                {activeModal === 'MACHINE_PICKED' && 'Mark Machine Picked'}
                            </h3>
                            <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={(e) => {
                            let endpoint = '';
                            if (activeModal === 'ASSIGN') endpoint = '/assign';
                            if (activeModal === 'CANCEL') endpoint = '/cancel';
                            if (activeModal === 'FORCE_CLOSE') endpoint = '/force-close';
                            if (activeModal === 'OTP_ARRIVAL') endpoint = '/otp/arrival/validate';
                            if (activeModal === 'FALLBACK') endpoint = '/otp/fallback/validate';
                            if (activeModal === 'SUBMIT_CLOSE_CODE') endpoint = '/close-code/submit';
                            if (activeModal === 'MACHINE_PICKED') endpoint = '/status/machine-picked';
                            
                            if (activeModal === 'CHANGE_TYPE') {
                                handleModalSubmit(e, '/type', modalData, 'put');
                            } else {
                                handleModalSubmit(e, endpoint, modalData);
                            }
                        }} className="p-6 space-y-4">
                            
                            {activeModal === 'ASSIGN' && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Search Engineer</label>
                                        <input 
                                            type="text" 
                                            value={engineerSearch} 
                                            onChange={e => setEngineerSearch(e.target.value)} 
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                                            placeholder="Search by name, code, or mobile" 
                                            autoFocus
                                        />
                                    </div>
                                    <div className="max-h-[250px] overflow-y-auto border border-slate-200 rounded-xl bg-white divide-y divide-slate-100">
                                        {loadingEngineers ? (
                                            <div className="p-4 text-center text-sm text-slate-500">Loading engineers...</div>
                                        ) : filteredEngineers.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-slate-500">No engineers found.</div>
                                        ) : (
                                            filteredEngineers.map(engineer => (
                                                <div 
                                                    key={engineer.id}
                                                    onClick={() => setModalData({...modalData, engineer_id: engineer.id})}
                                                    className={`p-3 cursor-pointer hover:bg-slate-50 flex items-center justify-between transition-colors ${modalData.engineer_id === engineer.id ? 'bg-emerald-50 hover:bg-emerald-50' : ''}`}
                                                >
                                                    <div>
                                                        <div className="font-medium text-slate-900 text-sm">{engineer.full_name}</div>
                                                        <div className="text-xs text-slate-500">{engineer.employee_code} • {engineer.mobile}</div>
                                                    </div>
                                                    {modalData.engineer_id === engineer.id && (
                                                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeModal === 'CANCEL' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Reason for cancellation</label>
                                    <textarea required minLength={10} value={modalData.cancelled_reason || ''} onChange={e => setModalData({...modalData, cancelled_reason: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" rows={3}></textarea>
                                </div>
                            )}

                            {activeModal === 'FORCE_CLOSE' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Reason for force closing</label>
                                    <textarea required minLength={10} value={modalData.force_close_reason || ''} onChange={e => setModalData({...modalData, force_close_reason: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" rows={3}></textarea>
                                </div>
                            )}

                            {(activeModal === 'OTP_ARRIVAL' || activeModal === 'FALLBACK' || activeModal === 'SUBMIT_CLOSE_CODE') && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                                    <input type="text" required minLength={6} maxLength={6} value={modalData[activeModal === 'SUBMIT_CLOSE_CODE' ? 'close_code' : (activeModal === 'FALLBACK' ? 'fallback_code' : 'otp')] || ''} onChange={e => setModalData({...modalData, [activeModal === 'SUBMIT_CLOSE_CODE' ? 'close_code' : (activeModal === 'FALLBACK' ? 'fallback_code' : 'otp')]: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-center text-2xl tracking-widest font-mono" placeholder="------" />
                                </div>
                            )}

                            {activeModal === 'CHANGE_TYPE' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Select New Service Type</label>
                                    <select required value={modalData.service_type || ''} onChange={e => setModalData({...modalData, service_type: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                                        <option value="" disabled>Select Type...</option>
                                        <option value="INSTALLATION">Installation</option>
                                        <option value="DEINSTALLATION">Deinstallation</option>
                                        <option value="REPLACEMENT">Replacement</option>
                                        <option value="MISC_SERV">Miscellaneous Service</option>
                                    </select>
                                </div>
                            )}

                            {activeModal === 'MACHINE_PICKED' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Proof Photo URL</label>
                                    <input type="url" required value={modalData.photo_url || ''} onChange={e => setModalData({...modalData, photo_url: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="https://..." />
                                </div>
                            )}

                            <div className="pt-2">
                                <button type="submit" disabled={modalLoading} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50">
                                    {modalLoading ? 'Processing...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
