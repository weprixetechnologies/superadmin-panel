"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Building2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '@/utils/axiosInstance';

interface BulkMachineImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function BulkMachineImportModal({ isOpen, onClose, onSuccess }: BulkMachineImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<{ success: number; failed: number; errors: any[] } | null>(null);
    
    // Superadmin specific
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [loadingBranches, setLoadingBranches] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchBranches();
        }
    }, [isOpen]);

    const fetchBranches = async () => {
        setLoadingBranches(true);
        try {
            const res = await api.get('/branches');
            setBranches(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch branches', error);
        } finally {
            setLoadingBranches(false);
        }
    };

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError(null);
            setResults(null);
        }
    };

    const processExcelDate = (excelDate: any) => {
        if (!excelDate) return null;
        if (typeof excelDate === 'number') {
            const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
            return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
        }
        if (typeof excelDate === 'string') {
            const date = new Date(excelDate);
            return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
        }
        return null;
    };

    const handleUpload = async () => {
        if (!selectedBranchId) {
            setError("Please select a target branch first.");
            return;
        }

        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array' });
            
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                throw new Error("The Excel file is empty.");
            }

            const machines = jsonData.map((row: any) => ({
                serial_number: row['Serial Number'] || row['SerialNumber'] || row['serial_number'] || String(row['Serial'] || ''),
                tid: row['TID'] || row['tid'] || null,
                model: row['Model'] || row['model'] || null,
                brand: row['Brand'] || row['brand'] || null,
                warranty_expiry: processExcelDate(row['Warranty Expiry'] || row['warranty_expiry'] || row['WarrantyExpiry'])
            }));

            const response = await api.post('/machines/bulk', { 
                machines,
                branch_id: selectedBranchId 
            });
            
            if (response.data.success) {
                setResults({
                    success: response.data.data.successCount,
                    failed: response.data.data.errorCount,
                    errors: response.data.data.errors
                });
                if (response.data.data.successCount > 0) onSuccess();
            } else {
                throw new Error(response.data.message || "Failed to import machines");
            }

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred during import.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setError(null);
        setResults(null);
        setSelectedBranchId('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Bulk Import Machines</h2>
                        <p className="text-sm text-slate-500 mt-1">Upload an Excel (.xlsx) file to create multiple machines</p>
                    </div>
                    <button 
                        onClick={() => { reset(); onClose(); }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {results ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-center p-6 bg-emerald-50 rounded-xl border border-emerald-100">
                                <div className="text-center">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-emerald-900">Import Complete</h3>
                                    <p className="text-emerald-700 mt-1">
                                        Successfully imported {results.success} machines.
                                    </p>
                                </div>
                            </div>
                            
                            {results.failed > 0 && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                                    <div className="flex items-center gap-2 text-red-700 font-medium mb-3">
                                        <AlertCircle className="w-5 h-5" />
                                        <span>{results.failed} machines failed to import:</span>
                                    </div>
                                    <div className="max-h-40 overflow-y-auto space-y-2 text-sm text-red-600">
                                        {results.errors.map((err, i) => (
                                            <div key={i} className="flex gap-2">
                                                <span className="font-semibold min-w-[60px]">Row {err.row}:</span>
                                                <span className="font-medium mr-2">[{err.serial_number}]</span>
                                                <span>{err.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => { reset(); onClose(); }}
                                className="w-full py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex gap-3 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}
                            
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
                                <p className="font-semibold text-slate-800 mb-2">Required Excel Columns:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><span className="font-semibold">Serial Number</span> (Required)</li>
                                    <li><span className="font-semibold">TID</span> (Optional)</li>
                                    <li><span className="font-semibold">Model</span> (Optional)</li>
                                    <li><span className="font-semibold">Brand</span> (Optional)</li>
                                    <li><span className="font-semibold">Warranty Expiry</span> (Optional, YYYY-MM-DD)</li>
                                </ul>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-slate-400" />
                                    Target Branch <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                                    value={selectedBranchId}
                                    onChange={(e) => setSelectedBranchId(e.target.value)}
                                    disabled={loadingBranches}
                                >
                                    <option value="">{loadingBranches ? 'Loading branches...' : 'Select a branch'}</option>
                                    {branches.map((b: any) => (
                                        <option key={b.id} value={b.id}>{b.branch_name} ({b.branch_code})</option>
                                    ))}
                                </select>
                            </div>

                            <div 
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                                    file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                {file ? (
                                    <div>
                                        <FileSpreadsheet className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                                        <p className="font-medium text-emerald-900">{file.name}</p>
                                        <p className="text-sm text-emerald-600 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                            className="text-sm text-emerald-700 hover:text-emerald-800 mt-4 underline"
                                        >
                                            Remove file
                                        </button>
                                    </div>
                                ) : (
                                    <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
                                        <Upload className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="font-medium text-slate-700">Click to upload Excel file</p>
                                        <p className="text-sm text-slate-500 mt-1">.xlsx or .xls</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => { reset(); onClose(); }}
                                    className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={!file || !selectedBranchId || loading}
                                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            <span>Import Machines</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
