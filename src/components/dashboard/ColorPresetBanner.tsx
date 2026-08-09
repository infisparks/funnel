'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { useTheme } from '../theme/ThemeProvider';
import { ACCENT_COLORS } from '@/lib/themeConfig';
import { Sparkles, Check } from 'lucide-react';

export function ColorPresetBanner() {
  const { accentColor, setAccentColor } = useTheme();

  return (
    <Card
      className="relative overflow-hidden border-2 bg-white transition-all duration-300"
      style={{ borderColor: accentColor.border }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: accentColor.light, color: accentColor.primary }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dynamic Accent Palette Engine</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">
            Change Website Accent Color Live
          </h2>

          <p className="text-sm text-gray-600">
            Select any primary color below. The entire site typography (Poppins font), sidebar highlights, buttons, and active states will update instantly!
          </p>
        </div>

        {/* Quick Swatches */}
        <div className="flex flex-wrap items-center gap-2.5">
          {ACCENT_COLORS.map((color) => {
            const isSelected = accentColor.id === color.id;
            return (
              <button
                key={color.id}
                onClick={() => setAccentColor(color)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-2xs ${
                  isSelected ? 'scale-110 ring-4 ring-offset-2 ring-gray-900' : 'hover:scale-105 opacity-90'
                }`}
                style={{ backgroundColor: color.primary }}
                title={color.name}
              >
                {isSelected && <Check className="w-5 h-5 text-white stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
