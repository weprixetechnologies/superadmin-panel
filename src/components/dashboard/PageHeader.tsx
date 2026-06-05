import React from 'react';
import { Filter, Calendar, Download } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight mb-2">{title}</h1>
        <p className="text-[#64748B] text-sm">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Action Buttons - Generic Examples */}
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] text-sm font-medium hover:bg-[#F1F5F9] transition-colors shadow-sm">
          <Filter className="w-4 h-4 text-[#64748B]" />
          Filter
        </button>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] text-sm font-medium hover:bg-[#F1F5F9] transition-colors shadow-sm">
          <Calendar className="w-4 h-4 text-[#64748B]" />
          Nov 1, 2024 - Nov 30, 2024
        </button>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#0F172A] text-sm font-medium hover:bg-[#F1F5F9] transition-colors shadow-sm">
          <Download className="w-4 h-4 text-[#64748B]" />
          Export
        </button>
      </div>
    </div>
  );
}
