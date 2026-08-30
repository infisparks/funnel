'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Check,
  Zap,
  X,
  ArrowRight,
  Filter,
} from 'lucide-react';

export interface DateFilterOption {
  id: string;
  label: string;
  badge?: string;
}

export const DATE_FILTER_PRESETS: DateFilterOption[] = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last_7_days', label: 'Last 7 Days' },
  { id: 'last_30_days', label: 'Last 30 Days' },
  { id: 'this_month', label: 'This Month' },
  { id: 'custom', label: 'Custom Date Range', badge: 'Custom' },
];

interface DateFilterDropdownProps {
  dateRange: string;
  onDateRangeChange: (rangeId: string) => void;
  customStartDate?: string;
  customEndDate?: string;
  onCustomDateChange?: (start: string, end: string) => void;
  className?: string;
}

export function DateFilterDropdown({
  dateRange,
  onDateRangeChange,
  customStartDate = '',
  customEndDate = '',
  onCustomDateChange,
  className = '',
}: DateFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState(customStartDate);
  const [tempEnd, setTempEnd] = useState(customEndDate);
  const [showCustomPicker, setShowCustomPicker] = useState(dateRange === 'custom');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync temp dates when props change
  useEffect(() => {
    setTempStart(customStartDate);
    setTempEnd(customEndDate);
    if (dateRange === 'custom') {
      setShowCustomPicker(true);
    }
  }, [customStartDate, customEndDate, dateRange]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Get active display label
  const getDisplayLabel = () => {
    if (dateRange === 'custom') {
      if (customStartDate && customEndDate) {
        const s = new Date(customStartDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        const e = new Date(customEndDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        return `${s} - ${e}`;
      }
      if (customStartDate) {
        return `From ${new Date(customStartDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
      }
      return 'Custom Range';
    }

    const preset = DATE_FILTER_PRESETS.find(
      (p) => p.id === dateRange || p.label.toLowerCase() === dateRange.toLowerCase()
    );
    return preset?.label || dateRange || 'All Time';
  };

  const handleSelectPreset = (presetId: string) => {
    if (presetId === 'custom') {
      setShowCustomPicker(true);
      onDateRangeChange('custom');
    } else {
      setShowCustomPicker(false);
      onDateRangeChange(presetId);
      setIsOpen(false);
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCustomDateChange) {
      onCustomDateChange(tempStart, tempEnd);
    }
    onDateRangeChange('custom');
    setIsOpen(false);
  };

  const handleClearCustom = () => {
    setTempStart('');
    setTempEnd('');
    if (onCustomDateChange) {
      onCustomDateChange('', '');
    }
    onDateRangeChange('all');
    setShowCustomPicker(false);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer shadow-xs ${
          isOpen || dateRange !== 'all'
            ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 ring-2 ring-indigo-500/10'
            : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#334155] hover:bg-white'
        }`}
      >
        <CalendarIcon className="w-3.5 h-3.5 text-[#6366F1] shrink-0" />
        <span className="truncate max-w-[130px] sm:max-w-none">{getDisplayLabel()}</span>
        {dateRange !== 'all' && dateRange !== 'All Time' && (
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-indigo-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-1.5 w-72 sm:w-80 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-50 p-2 text-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-2 mb-1">
            <span className="flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-indigo-600" />
              <span>Filter By Date</span>
            </span>
            {dateRange !== 'all' && (
              <button
                type="button"
                onClick={handleClearCustom}
                className="text-[10px] text-indigo-600 hover:underline font-semibold cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Presets List */}
          <div className="space-y-0.5 max-h-48 overflow-y-auto">
            {DATE_FILTER_PRESETS.map((preset) => {
              const isActive =
                dateRange === preset.id ||
                dateRange.toLowerCase() === preset.label.toLowerCase() ||
                (preset.id === 'all' && (!dateRange || dateRange === 'All Time'));

              return (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {preset.id === 'all' ? (
                      <Zap className="w-3 h-3 text-amber-500" />
                    ) : (
                      <CalendarIcon className="w-3 h-3 text-slate-400" />
                    )}
                    <span>{preset.label}</span>
                  </span>
                  {isActive && <Check className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>

          {/* Custom Date Range Picker Accordion */}
          {showCustomPicker && (
            <form
              onSubmit={handleApplyCustom}
              className="mt-2 pt-2 border-t border-slate-100 space-y-2.5 bg-slate-50/80 p-2.5 rounded-lg"
            >
              <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3 text-indigo-600" />
                <span>Select Custom Date Range</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    From (Start)
                  </label>
                  <input
                    type="date"
                    value={tempStart}
                    onChange={(e) => setTempStart(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-white border border-[#CBD5E1] rounded-md focus:border-indigo-500 focus:outline-none text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    To (End)
                  </label>
                  <input
                    type="date"
                    value={tempEnd}
                    onChange={(e) => setTempEnd(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-white border border-[#CBD5E1] rounded-md focus:border-indigo-500 focus:outline-none text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCustomPicker(false)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Apply Range</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
