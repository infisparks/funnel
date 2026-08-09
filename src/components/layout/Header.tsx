'use client';

import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { Menu, Search, Bell, Sparkles, Plus } from 'lucide-react';

export function Header() {
  const { accentColor, setIsMobileOpen } = useTheme();

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-2xs">
      {/* Left: Mobile Menu & Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 lg:hidden"
          title="Open Mobile Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers, documents, tasks..."
            className="w-full pl-10 pr-12 py-2 text-sm bg-[#F5F6F8] border border-[#E5E7EB] rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all"
            style={{
              fontFamily: 'var(--font-poppins), sans-serif',
            }}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200 shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Quick Actions & Settings */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick New Action Button */}
        <button
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white font-medium text-xs shadow-xs transition-all hover:opacity-90 active:scale-98"
          style={{ backgroundColor: accentColor.primary }}
        >
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </button>

        {/* Notification Bell */}
        <button className="relative p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
          <Bell className="w-4 h-4" />
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full ring-2 ring-white"
            style={{ backgroundColor: accentColor.primary }}
          />
        </button>

        {/* Active Primary Accent Color Indicator */}
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-gray-200">
          <div
            className="w-3.5 h-3.5 rounded-full shadow-xs ring-2 ring-gray-100"
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
