'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '../theme/ThemeProvider';
import { supabase } from '@/lib/supabaseClient';
import {
  Sparkles,
  TrendingUp,
  Columns,
  Calendar,
  CalendarCheck,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const {
    accentColor,
    sidebarStyle,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileOpen,
    setIsMobileOpen,
  } = useTheme();

  // Active link helper
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  // Strictly required navigation items
  const navItems = [
    { label: 'Landing Page', icon: Sparkles, href: '/landing' },
    { label: 'Landing Templates', icon: Layers, href: '/templates' },
    { label: 'Dashboard & Leads', icon: TrendingUp, href: '/dashboard' },
    { label: 'Pipeline Board', icon: Columns, href: '/pipeline' },
    { label: 'WhatsApp Automation', icon: MessageSquare, href: '/whatsapp' },
    { label: 'Meetings Calendar', icon: Calendar, href: '/calendar' },
    { label: 'Scheduled Meetings', icon: CalendarCheck, href: '/meetings' },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    router.push('/login');
  };

  // ----------------------------------------------------
  // COMPACT VERTICAL DOCK BAR (if enabled)
  // ----------------------------------------------------
  if (sidebarStyle === 'compact') {
    return (
      <aside className="w-16 sm:w-20 bg-white border-r border-[#E5E7EB] h-screen flex flex-col justify-between items-center py-5 shrink-0 z-30 font-sans">
        <div className="flex flex-col items-center gap-6 w-full px-2">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs font-bold text-lg"
            style={{ backgroundColor: accentColor.primary }}
            title="Funnel CRM"
          >
            <Sparkles className="w-5 h-5 fill-white/20" />
          </Link>

          <nav className="flex flex-col items-center space-y-2 w-full">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative p-3 rounded-xl transition-all duration-200 group flex items-center justify-center w-full ${
                    active
                      ? 'shadow-2xs font-semibold'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: active ? accentColor.light : undefined,
                    color: active ? accentColor.primary : undefined,
                  }}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" style={{ color: active ? accentColor.primary : '#4B5563' }} />
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full"
                      style={{ backgroundColor: accentColor.primary }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-xl hover:bg-rose-50 text-gray-500 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
          title="Log Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </aside>
    );
  }

  // ----------------------------------------------------
  // STANDARD EXECUTIVE SIDEBAR
  // ----------------------------------------------------
  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 bg-white border-r border-[#E5E7EB] h-dvh lg:h-screen flex flex-col justify-between transition-all duration-300 z-50 lg:z-30 shrink-0 font-sans ${
        isSidebarCollapsed ? 'w-20' : 'w-[85vw] max-w-xs sm:w-64'
      } ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
          {!isSidebarCollapsed ? (
            <Link
              href="/dashboard"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-3 w-full group min-h-[40px]"
            >
              <div
                className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0"
                style={{ backgroundColor: accentColor.primary }}
              >
                <Sparkles className="w-5 h-5 fill-white/20" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-extrabold text-[#111827] group-hover:text-indigo-600 transition-colors truncate">
                  Funnel CRM
                </h2>
                <p className="text-[11px] text-[#6B7280] font-medium truncate">
                  Workspace
                </p>
              </div>
            </Link>
          ) : (
            <div
              className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-2xs"
              style={{ backgroundColor: accentColor.primary }}
            >
              <Sparkles className="w-5 h-5 fill-white/20" />
            </div>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          {!isSidebarCollapsed && (
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-gray-400 px-3 block mb-2">
              MAIN MENU
            </span>
          )}

          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group min-h-[42px] ${
                  active
                    ? 'shadow-2xs'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
                }`}
                style={{
                  backgroundColor: active ? accentColor.light : 'transparent',
                  color: active ? accentColor.primary : '#374151',
                }}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full"
                    style={{ backgroundColor: accentColor.primary }}
                  />
                )}

                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className="w-5 h-5 shrink-0"
                    style={{
                      color: active ? accentColor.primary : '#6B7280',
                    }}
                  />
                  {!isSidebarCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer with Single Logout Button */}
        <div className="p-3 border-t border-[#E5E7EB] flex flex-col gap-2 shrink-0 bg-gray-50/50">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-rose-600 hover:bg-rose-50 transition-colors w-full cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-gray-500 group-hover:text-rose-600" />
                <span>Log Out</span>
              </button>

              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 hidden lg:block cursor-pointer"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 hidden lg:block cursor-pointer"
                title="Expand Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
