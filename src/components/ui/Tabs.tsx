'use client';

import React from 'react';
import { useTheme } from '../theme/ThemeProvider';

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ items, activeId, onChange, className = '' }: TabsProps) {
  const { accentColor } = useTheme();

  return (
    <div className={`flex flex-wrap items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl border border-gray-200/60 ${className}`}>
      {items.map((tab) => {
        const isSelected = activeId === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              isSelected
                ? 'bg-white shadow-2xs text-[#111827]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-gray-100 text-gray-700' : 'bg-gray-200/70 text-gray-500'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
