import React from 'react';
import { X, Check, Download } from 'lucide-react';

export default function DetailPanel() {
  return (
    <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-sm sticky top-[120px] overflow-hidden flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
        <h2 className="text-lg font-bold text-[#0F172A]">Service Details</h2>
        <button className="p-2 text-[#94A3B8] hover:bg-[#F1F5F9] rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-8">
        
        {/* Title Area */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-[#0F172A] leading-tight">Website Maintenance</h3>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-[#DCFCE7] text-[#16A34A]">Completed</span>
          </div>
          <p className="text-sm font-medium text-[#64748B]">#SRV-00128</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-[100px_1fr] gap-y-4 text-sm">
          <div className="text-[#64748B] font-medium">Client</div>
          <div className="flex items-center gap-2 font-semibold text-[#0F172A]">
            <div className="w-6 h-6 rounded-full bg-[#E2E8F0] flex items-center justify-center text-xs">🧑🏽‍🦱</div>
            Alexandra Deff
          </div>

          <div className="text-[#64748B] font-medium">Date</div>
          <div className="text-[#0F172A] font-medium">Nov 30, 2024</div>

          <div className="text-[#64748B] font-medium">Duration</div>
          <div className="text-[#0F172A] font-medium">3 Days</div>

          <div className="text-[#64748B] font-medium">Amount</div>
          <div className="text-[#0F172A] font-medium">$450.00</div>
        </div>

        <hr className="border-[#E2E8F0]" />

        {/* Description */}
        <div>
          <h4 className="text-sm font-bold text-[#0F172A] mb-2">Description</h4>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Routine maintenance and updates for the corporate website including content update, performance optimization, and security checks.
          </p>
        </div>

        {/* Work Summary */}
        <div>
          <h4 className="text-sm font-bold text-[#0F172A] mb-3">Work Summary</h4>
          <ul className="space-y-2">
            {['Updated website content', 'Optimized images and speed', 'Security scan and fixes', 'Backup and db optimization'].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#64748B]">
                <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Technician */}
        <div>
          <h4 className="text-sm font-bold text-[#0F172A] mb-3">Technician</h4>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-lg">👨🏽‍🔧</div>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">Totok Michael</p>
              <p className="text-xs text-[#64748B]">Senior Engineer</p>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Action */}
      <div className="p-6 border-t border-[#E2E8F0] bg-white shrink-0">
        <button className="w-full py-3.5 bg-[#16A34A] hover:bg-[#15803d] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm shadow-green-600/20">
          <Download className="w-4 h-4" />
          Download Report
        </button>
      </div>

    </div>
  );
}
