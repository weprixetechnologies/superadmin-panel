"use client";

import React, { useState } from 'react';
import { FileText, Image as ImageIcon, Download, Paperclip, Loader2 } from 'lucide-react';
import api from '@/utils/axiosInstance';

interface AttachmentsProps {
    ticketId: string;
    attachments: any[];
    onUploadSuccess: () => void;
}

export default function TicketAttachments({ ticketId, attachments = [], onUploadSuccess }: AttachmentsProps) {
    const [uploading, setUploading] = useState(false);

    const handleUploadClick = () => {
        // In a real app, this would open a file picker and upload to cloud storage (S3/Firebase)
        // For this demo, we'll prompt for a URL to simulate the upload process as per backend expectations.
        const fileUrl = prompt("Enter the URL of the uploaded file:");
        if (!fileUrl) return;

        const description = prompt("Enter a description (optional):") || "";
        submitAttachment(fileUrl, description);
    };

    const submitAttachment = async (file_url: string, description: string) => {
        setUploading(true);
        try {
            const { data } = await api.post(`/tickets/${ticketId}/attachments`, {
                file_url,
                description
            });
            if (data?.success) {
                onUploadSuccess();
            }
        } catch (error) {
            console.error('Failed to add attachment', error);
            alert('Failed to add attachment');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-slate-500" />
                    <h3 className="font-semibold text-slate-900">Attachments</h3>
                    <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">
                        {attachments.length}
                    </span>
                </div>
                <button 
                    onClick={handleUploadClick}
                    disabled={uploading}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                    Add File
                </button>
            </div>

            {attachments.length === 0 ? (
                <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-sm">No attachments yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {attachments.map((file: any) => {
                        const isImage = file.file_url.match(/\.(jpeg|jpg|gif|png)$/i) != null;
                        return (
                            <div key={file.id} className="flex items-center gap-4 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group">
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                                    {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">
                                        {file.description || `Attachment_${file.id.substring(0,6)}`}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {new Date(file.created_at).toLocaleDateString()} &middot; Uploaded by {file.uploaded_by_name || 'System'}
                                    </p>
                                </div>
                                <a 
                                    href={file.file_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Download className="w-4 h-4" />
                                </a>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
