"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, Loader2 } from 'lucide-react';
import api from '@/utils/axiosInstance';
import { AuthUser } from '@/utils/auth';

interface MessagesProps {
    ticketId: string;
    initialMessages: any[];
    user: AuthUser | null;
}

export default function TicketMessages({ ticketId, initialMessages, user }: MessagesProps) {
    const [messages, setMessages] = useState(initialMessages || []);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setSending(true);
        try {
            const { data } = await api.post(`/tickets/${ticketId}/messages`, { message: input });
            if (data?.success) {
                // In a real app, the API would return the new message object, 
                // but since our generic API just says success, we'll append a local mock or re-fetch.
                // Assuming it returns the created message in data.message:
                if (data.message) {
                    setMessages(prev => [...prev, data.message]);
                } else {
                    // Fallback to local optimistic addition
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        sender_id: user?.id,
                        sender_name: user?.full_name || 'Me',
                        sender_role: user?.role || 'USER',
                        message: input,
                        created_at: new Date().toISOString()
                    }]);
                }
                setInput('');
            }
        } catch (error) {
            console.error('Failed to send message', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-slate-50 rounded-[20px] border border-slate-200 overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg: any) => {
                        const isMe = msg.sender_id === user?.id || msg.sender_name === user?.full_name;
                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className="text-[10px] text-slate-400 mb-1 px-1 flex gap-2">
                                    <span className="font-semibold">{msg.sender_name}</span>
                                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                    isMe 
                                        ? 'bg-emerald-600 text-white rounded-tr-sm' 
                                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                                }`}>
                                    {msg.message}
                                    {msg.image_url && (
                                        <img src={msg.image_url} alt="Attachment" className="mt-2 rounded-lg max-h-48 object-cover" />
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-200">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <button type="button" className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors">
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..." 
                        className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-full px-4 py-2 text-sm outline-none transition-all"
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim() || sending}
                        className="p-2.5 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 rounded-full transition-colors shadow-sm"
                    >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
