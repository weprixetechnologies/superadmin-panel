import React from 'react';

export default function ContentGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[7fr_3fr] gap-6">
      {children}
    </div>
  );
}
