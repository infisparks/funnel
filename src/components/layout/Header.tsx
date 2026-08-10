'use client';

import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { Menu, Search, Bell, Sparkles, Plus } from 'lucide-react';

export function Header() {
  const { accentColor, setIsMobileOpen } = useTheme();

  return (
    <header className="h-16 sm:h-18 bg-white border-b border-[#E5E7EB] px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-2xs">
      {/* Left: Mobile Menu & Search Input */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2.5 rounded-xl text-gray-700 hover:bg-gray-100/80 active:bg-gray-200 lg:hidden flex items-center justify-center min-w-[44px] min-h-[44px] transition-colors cursor-pointer"
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-6 h-6 stroke-[2.2]" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search leads, documents, tasks..."
            className="w-full pl-10 pr-12 py-2.5 text-xs sm:text-sm bg-[#F5F6F8] border border-[#E5E7EB] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans text-[#111827] placeholder:text-gray-400"
          />
          <kbd className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Quick Actions & Settings */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick New Action Button */}
        <button
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm shadow-2xs transition-all hover:opacity-90 active:scale-98 cursor-pointer min-h-[44px]"
          style={{ backgroundColor: accentColor.primary }}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Entry</span>
          <span className="sm:hidden">New</span>
        </button>

        {/* Notification Bell */}
        <button
          className="relative p-2.5 sm:p-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span
            className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full ring-2 ring-white"
            style={{ backgroundColor: accentColor.primary }}
          />
        </button>

        {/* Active Primary Accent Color Indicator */}
        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-gray-200">
          <div
            className="w-3.5 h-3.5 rounded-full shadow-2xs ring-2 ring-gray-100"
            style={{ backgroundColor: accentColor.primary }}
            title={`Active Color: ${accentColor.name}`}
          />
          <span className="text-xs font-semibold text-gray-700">
            {accentColor.name}
          </span>
        </div>
      </div>
    </header>
  );
}
