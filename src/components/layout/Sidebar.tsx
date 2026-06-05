"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Store,
  Clipboard,
  UserCog,
  Wrench,
  Package,
  PenTool,
  Users,
  Boxes,
  BarChart,
  FileText,
  Bell,
  MessageSquare,
  Calendar,
  Activity,
  FileBox,
  Settings,
  LifeBuoy,
  CreditCard,
  LogOut,
  Hexagon, // Generic Logo
  Clock,
  Building2,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const MAIN_MENU = [
  { name: 'Dashboard', icon: Home, href: '/dashboard' },
  { name: 'Merchants', icon: Store, href: '/dashboard/merchants' },
  { name: 'Branches', icon: Building2, href: '/dashboard/branches' },
  { name: 'Employees', icon: Users, href: '/dashboard/employees' },
];

const ATTENDANCE_MENU = {
  name: 'Attendance',
  icon: Clock,
  href: '/dashboard/attendance',
  children: [
    { name: 'Attendance Dashboard', href: '/dashboard/attendance/dashboard' },
    { name: 'My Attendance', href: '/dashboard/attendance/my-attendance' },
    { name: 'Branch Attendance', href: '/dashboard/attendance/branch' },
    { name: 'Shifts', href: '/dashboard/attendance/shifts' },
    { name: 'Shift Assignments', href: '/dashboard/attendance/shift-assignments' },
    { name: 'Leaves', href: '/dashboard/attendance/leaves' },
    { name: 'Leave Approvals', href: '/dashboard/attendance/leaves/approvals' },
    { name: 'Regularisations', href: '/dashboard/attendance/regularisations' },
    { name: 'Regularisation Approvals', href: '/dashboard/attendance/regularisations/review' },
    { name: 'Holidays', href: '/dashboard/attendance/holidays' },
    { name: 'Reports', href: '/dashboard/attendance/reports' },
  ]
};

const TICKETS_MENU = {
  name: 'Service Requests',
  icon: Wrench,
  href: '/dashboard/tickets',
  children: [
    { name: 'Dashboard', href: '/dashboard/tickets/dashboard' },
    { name: 'All Tickets', href: '/dashboard/tickets' },
    { name: 'Create Ticket', href: '/dashboard/tickets/create' },
    { name: 'Assigned Tickets', href: '/dashboard/tickets/my-tickets' },
    { name: 'Pending Closures', href: '/dashboard/tickets?status=PENDING_CLOSE' },
  ]
};

const ASSETS_MENU = {
  name: 'Assets Management',
  icon: Package,
  href: '/dashboard/assets',
  children: [
    { name: 'Machines', href: '/dashboard/assets/machines' },
    { name: 'Consignments', href: '/dashboard/assets/consignments' },
  ]
};

const MANAGEMENT = [
  { name: 'Activity Logs', icon: Activity, href: '/dashboard/activity' },
];

const BOTTOM_MENU: any[] = [];

export default function Sidebar({ isOpen, setIsOpen }: { isOpen?: boolean, setIsOpen?: (v: boolean) => void }) {
  const pathname = usePathname();
  const [attendanceExpanded, setAttendanceExpanded] = useState(false);
  const [ticketsExpanded, setTicketsExpanded] = useState(false);
  const [assetsExpanded, setAssetsExpanded] = useState(false);
  const { logout } = useAuth();

  const NavItem = ({ item }: { item: any }) => {
    // Basic active state matching
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
          isActive
            ? 'bg-[#16A34A] text-white shadow-sm shadow-green-600/20'
            : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
        <span className="text-sm">{item.name}</span>
        {/* Mock Notification Badge for Dashboard */}
        {item.name === 'Dashboard' && !isActive && (
          <span className="ml-auto bg-[#16A34A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            12+
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className={`w-[280px] bg-white border-r border-[#E2E8F0] h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      {/* Brand Area */}
      <div className="h-[88px] flex items-center px-6 border-b border-transparent shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#16A34A] rounded-full flex items-center justify-center shadow-sm shadow-green-600/30">
            <Hexagon className="w-6 h-6 text-white" fill="currentColor" />
          </div>
          <span className="text-xl font-bold text-[#0F172A] tracking-tight">Donezo</span>
        </div>
        <button onClick={() => setIsOpen?.(false)} className="lg:hidden ml-auto text-slate-400 hover:text-slate-600 p-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
        <div className="space-y-6">
          {/* Main Menu */}
          <div>
            <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3 px-2">
              Main Menu
            </h3>
            <div className="space-y-1">
              {MAIN_MENU.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
              
              {/* Expandable Attendance Menu */}
              <div>
                <button
                  onClick={() => setAttendanceExpanded(!attendanceExpanded)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                    pathname.startsWith('/dashboard/attendance') && !attendanceExpanded
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                  }`}
                >
                  <Clock className={`w-5 h-5 ${pathname.startsWith('/dashboard/attendance') && !attendanceExpanded ? 'text-emerald-600' : 'text-[#64748B]'}`} />
                  <span className="text-sm">Attendance</span>
                  <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${attendanceExpanded ? 'rotate-180' : ''}`} />
                </button>
                
                {attendanceExpanded && (
                  <div className="mt-1 space-y-1 px-3">
                    {ATTENDANCE_MENU.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isChildActive
                              ? 'bg-[#16A34A] text-white shadow-sm shadow-green-600/20'
                              : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Expandable Tickets Menu */}
              <div>
                <button
                  onClick={() => setTicketsExpanded(!ticketsExpanded)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                    pathname.startsWith('/dashboard/tickets') && !ticketsExpanded
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                  }`}
                >
                  <Wrench className={`w-5 h-5 ${pathname.startsWith('/dashboard/tickets') && !ticketsExpanded ? 'text-emerald-600' : 'text-[#64748B]'}`} />
                  <span className="text-sm">{TICKETS_MENU.name}</span>
                  <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${ticketsExpanded ? 'rotate-180' : ''}`} />
                </button>
                
                {ticketsExpanded && (
                  <div className="mt-1 space-y-1 px-3">
                    {TICKETS_MENU.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isChildActive
                              ? 'bg-[#16A34A] text-white shadow-sm shadow-green-600/20'
                              : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Expandable Assets Menu */}
              <div>
                <button
                  onClick={() => setAssetsExpanded(!assetsExpanded)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                    pathname.startsWith('/dashboard/assets') && !assetsExpanded
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                  }`}
                >
                  <Package className={`w-5 h-5 ${pathname.startsWith('/dashboard/assets') && !assetsExpanded ? 'text-emerald-600' : 'text-[#64748B]'}`} />
                  <span className="text-sm">{ASSETS_MENU.name}</span>
                  <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${assetsExpanded ? 'rotate-180' : ''}`} />
                </button>
                
                {assetsExpanded && (
                  <div className="mt-1 space-y-1 px-3">
                    {ASSETS_MENU.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isChildActive
                              ? 'bg-[#16A34A] text-white shadow-sm shadow-green-600/20'
                              : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Management */}
          <div>
            <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3 px-2">
              General
            </h3>
            <div className="space-y-1">
              {MANAGEMENT.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-[#E2E8F0]">
        <div className="space-y-1">
          {BOTTOM_MENU.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-[#EF4444] hover:bg-[#FEF2F2]"
          >
            <LogOut className="w-5 h-5 text-[#EF4444]" />
            <span className="text-sm">Logout</span>
          </button>
        </div>


      </div>
    </aside>
  );
}
