'use client';

import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';
import { ACCENT_COLORS } from '@/lib/themeConfig';
import { Palette, Check, X, Layout, Sidebar as SidebarIcon, Sliders } from 'lucide-react';
import { SidebarStyle } from '@/lib/types';

export function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const { accentColor, setAccentColor, sidebarStyle, setSidebarStyle } = useTheme();

  return (
    <>
      {/* Floating Theme Studio Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
        style={{ backgroundColor: accentColor.primary }}
        title="Customize Color Accent & Sidebar"
      >
        <Palette className="w-5 h-5 group-hover:rotate-45 transition-transform" />
        <span className="text-xs font-bold tracking-wide uppercase">Theme Studio</span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white border-l border-[#E5E7EB] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5" style={{ color: accentColor.primary }} />
            <h3 className="font-bold text-lg text-[#111827]">Color & UI Studio</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Change Color Accent */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Change Website Color Accent
              </label>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded"
                style={{ backgroundColor: accentColor.light, color: accentColor.primary }}
              >
                {accentColor.name}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {ACCENT_COLORS.map((color) => {
                const isSelected = accentColor.id === color.id;
                return (
                  <button
                    key={color.id}
                    onClick={() => setAccentColor(color)}
                    className={`h-12 rounded-xl flex items-center justify-center transition-all relative shadow-2xs border-2 ${
                      isSelected
                        ? 'border-gray-900 scale-105 shadow-md'
                        : 'border-transparent hover:scale-102'
                    }`}
                    style={{ backgroundColor: color.primary }}
                    title={color.name}
                  >
                    {isSelected && <Check className="w-5 h-5 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
            <p className="mt-2.5 text-xs text-gray-500 leading-relaxed">
              Updates all primary buttons, active sidebar highlights, badges, and focus rings live across the entire website.
            </p>
          </div>

          {/* Sidebar Style Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Sidebar Navigation Presets
            </label>
            <div className="space-y-3">
              {[
                {
                  id: 'standard',
                  title: 'Standard Executive Sidebar',
                  desc: 'Clean structured list with user profile header & expandable category groups',
                  icon: Layout,
                },
                {
                  id: 'dual-column',
                  title: 'Dual-Column Dock Sidebar',
                  desc: 'Primary accent icon strip on left + navigation panel',
                  icon: SidebarIcon,
                },
                {
                  id: 'compact',
                  title: 'Compact Vertical Dock Bar',
                  desc: 'Slim icon-only navigation bar for maximum workspace content space',
                  icon: Layout,
                },
              ].map((preset) => {
                const isSelected = sidebarStyle === preset.id;
                const IconComponent = preset.icon;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setSidebarStyle(preset.id as SidebarStyle)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-2 bg-gray-50 shadow-2xs'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    style={{ borderColor: isSelected ? accentColor.primary : undefined }}
                  >
                    <div
                      className="p-2 rounded-lg text-white mt-0.5 shrink-0"
                      style={{ backgroundColor: isSelected ? accentColor.primary : '#9CA3AF' }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">
                        {preset.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 leading-snug">
                        {preset.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E7EB] bg-gray-50 text-center">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-2.5 rounded-lg text-white font-semibold text-sm shadow-2xs transition-opacity hover:opacity-90"
            style={{ backgroundColor: accentColor.primary }}
          >
            Apply & Close
          </button>
        </div>
      </div>
    </>
  );
}
