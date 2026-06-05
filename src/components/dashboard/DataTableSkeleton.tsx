import React from 'react';

interface DataTableSkeletonProps {
  columns?: number;
  rows?: number;
}

export default function DataTableSkeleton({ columns = 5, rows = 5 }: DataTableSkeletonProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col min-h-[500px] animate-pulse">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-6 w-full max-w-full md:max-w-[400px] overflow-x-auto scrollbar-hide">
            <div className="h-4 bg-zinc-200 rounded w-24"></div>
            <div className="h-4 bg-zinc-100 rounded w-20"></div>
            <div className="h-4 bg-zinc-100 rounded w-24"></div>
        </div>
        
        <div className="relative w-full max-w-xs">
          <div className="h-10 bg-zinc-100 rounded-xl w-full border border-zinc-200"></div>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 border-b border-zinc-200">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-4 bg-zinc-200 rounded w-24"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={rIdx}>
                {Array.from({ length: columns }).map((_, cIdx) => (
                  <td key={cIdx} className="px-6 py-4">
                    <div className="h-4 bg-zinc-100 rounded w-full max-w-[150px]"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-zinc-200 flex items-center justify-between bg-zinc-50/50">
        <div className="h-4 bg-zinc-200 rounded w-32"></div>
        <div className="flex items-center gap-2">
           <div className="h-8 w-20 bg-zinc-200 rounded-lg"></div>
           <div className="h-8 w-20 bg-zinc-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
