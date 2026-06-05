import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  buttonText?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: any;
}

export default function EmptyState({ 
  title = "No Data Available", 
  description = "Content will appear here once records are available.",
  buttonText,
  actionLabel,
  onAction,
  icon: Icon
}: EmptyStateProps) {
  const label = actionLabel || buttonText || "Create First Record";

  return (
    <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-sm min-h-[500px] flex flex-col items-center justify-center p-12 text-center">
      <div className="w-24 h-24 rounded-full bg-[#F8FAFC] flex items-center justify-center mb-6 text-[#94A3B8]">
        {Icon ? (
          React.isValidElement(Icon) ? Icon : <Icon className="w-12 h-12" strokeWidth={1.5} />
        ) : (
          <PackageOpen className="w-12 h-12" strokeWidth={1.5} />
        )}
      </div>
      <h3 className="text-xl font-bold text-[#0F172A] mb-2">{title}</h3>
      <p className="text-[#64748B] text-sm max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      {onAction ? (
        <button 
          onClick={onAction}
          className="px-6 py-2.5 bg-[#16A34A] hover:bg-[#15803d] text-white rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-green-600/20"
        >
          {label}
        </button>
      ) : (
        <button className="px-6 py-2.5 bg-[#16A34A] hover:bg-[#15803d] text-white rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-green-600/20">
          {label}
        </button>
      )}
    </div>
  );
}
