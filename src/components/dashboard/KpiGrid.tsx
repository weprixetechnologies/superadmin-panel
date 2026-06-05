import React from 'react';
import { ClipboardList, CheckCircle2, Clock, XCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KpiData {
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
  type: 'total' | 'completed' | 'progress' | 'cancelled';
}

const DUMMY_KPIS: KpiData[] = [
  { title: 'Total Services', value: '128', trend: '15% from last month', isPositive: true, type: 'total' },
  { title: 'Completed', value: '96', trend: '12% from last month', isPositive: true, type: 'completed' },
  { title: 'In Progress', value: '22', trend: '8% from last month', isPositive: true, type: 'progress' },
  { title: 'Cancelled', value: '10', trend: '3% from last month', isPositive: false, type: 'cancelled' },
];

function KpiCard({ data }: { data: KpiData }) {
  const isPrimary = data.type === 'total';
  
  const getIcon = () => {
    switch (data.type) {
      case 'total': return <ClipboardList className="w-5 h-5 text-white" />;
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-[#0F172A]" />;
      case 'progress': return <Clock className="w-5 h-5 text-[#0F172A]" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-[#0F172A]" />;
    }
  };

  return (
    <div className={`h-[140px] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between border ${
      isPrimary 
        ? 'bg-[#16A34A] border-transparent text-white shadow-lg shadow-green-600/20' 
        : 'bg-white border-[#E2E8F0] text-[#0F172A] shadow-sm'
    }`}>
      <div className="flex justify-between items-start">
        <h3 className={`text-sm font-medium ${isPrimary ? 'text-white/90' : 'text-[#0F172A]'}`}>
          {data.title}
        </h3>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
          isPrimary ? 'bg-white/10 border-white/20' : 'bg-[#F8FAFC] border-[#E2E8F0]'
        }`}>
          {getIcon()}
        </div>
      </div>
      
      <div>
        <div className="text-4xl font-bold tracking-tight mb-2">
          {data.value}
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${
          isPrimary 
            ? 'text-white/90' 
            : data.isPositive ? 'text-[#16A34A]' : 'text-[#EF4444]'
        }`}>
          {data.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          <span>{data.trend}</span>
        </div>
      </div>
    </div>
  );
}

export default function KpiGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {DUMMY_KPIS.map((kpi, idx) => (
        <KpiCard key={idx} data={kpi} />
      ))}
    </div>
  );
}
