'use client';

import React from 'react';
import { Card } from './Card';
import { useTheme } from '../theme/ThemeProvider';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtext?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  isPositive = true,
  subtext,
  icon: IconComponent,
  onClick,
  className = '',
}: StatCardProps) {
  const { accentColor } = useTheme();

  return (
    <Card
      interactive={!!onClick}
      onClick={onClick}
      className={`relative overflow-hidden group ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {title}
        </span>
        {IconComponent && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xs shrink-0"
            style={{ backgroundColor: accentColor.light, color: accentColor.primary }}
          >
            <IconComponent className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
          {value}
        </h3>

        {(change || subtext) && (
          <div className="flex items-center gap-2 mt-2">
            {change && (
              <span
                className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                  isPositive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                )}
                {change}
              </span>
            )}
            {subtext && (
              <span className="text-xs text-gray-400 font-medium">
                {subtext}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Subtle bottom hover accent bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: accentColor.primary }}
      />
    </Card>
  );
}
