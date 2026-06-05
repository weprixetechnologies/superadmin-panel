import React from 'react';
import { Search, Bell, Mail, Sun, Settings, Menu } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import PunchButton from './PunchButton';

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuth();
  
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] h-[88px] flex items-center justify-between px-4 sm:px-8">
      {/* Search Bar & Hamburger */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative w-full max-w-[400px] hidden sm:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Search service or client..."
          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-full pl-11 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all placeholder:text-[#94A3B8]"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-[#64748B] font-medium bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0] shadow-sm">
          <span>⌘</span>
          <span>F</span>
        </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        <PunchButton />
        {/* Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] border border-[#E2E8F0] transition-colors">
            <Mail className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] border border-[#E2E8F0] transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white" />
          </button>
        </div>

        <div className="w-px h-8 bg-[#E2E8F0]" />

        {/* User Profile */}
        <button className="flex items-center gap-3 hover:bg-[#F8FAFC] p-1.5 pr-3 rounded-full border border-transparent hover:border-[#E2E8F0] transition-all">
          <div className="relative w-10 h-10 rounded-full bg-[#FFE4E6] overflow-hidden border border-[#E2E8F0]">
            {/* Generic Avatar Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center text-xl">
              🧑🏽‍🦱
            </div>
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-semibold text-[#0F172A] leading-tight">{user?.name || user?.username || 'User'}</p>
            <p className="text-xs text-[#64748B] capitalize">{user?.role?.toLowerCase() || 'Super Admin'}</p>
          </div>
        </button>
      </div>
    </header>
  );
}
