'use client';

import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  X,
  Palette,
  Save,
  CheckCircle2,
  Sparkles,
  Type,
  Layout,
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface PopupThemeConfig {
  primaryColor?: string;
  badgeText?: string;
  step1Title?: string;
  step1Subtitle?: string;
  step1ButtonText?: string;
  step2Title?: string;
  step2Subtitle?: string;
  step2ButtonText?: string;
  step3Title?: string;
  step3Subtitle?: string;
  step3ButtonText?: string;
}

interface PopupThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeConfig?: PopupThemeConfig;
  onSaveTheme: (theme: PopupThemeConfig) => void;
}

const PRESET_COLORS = [
  { name: 'Amber Gold', hex: '#F59E0B' },
  { name: 'Royal Purple', hex: '#8146F0' },
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Electric Blue', hex: '#3B82F6' },
  { name: 'Crimson Red', hex: '#EF4444' },
  { name: 'Rose Pink', hex: '#EC4899' },
];

export function PopupThemeModal({
  isOpen,
  onClose,
  themeConfig: initialTheme,
  onSaveTheme,
}: PopupThemeModalProps) {
  const { workspace, saveWorkspaceConfig } = useAuth();

  const [theme, setTheme] = useState<PopupThemeConfig>({
    primaryColor: initialTheme?.primaryColor || '#F59E0B',
    badgeText: initialTheme?.badgeText || 'FAST 30-SEC BOOKING',
    step1Title: initialTheme?.step1Title || 'Claim Your 1-on-1 Growth Consultation',
    step1Subtitle: initialTheme?.step1Subtitle || 'Enter your details to reserve your custom revenue strategy session',
    step1ButtonText: initialTheme?.step1ButtonText || 'CONTINUE TO SELECT SLOT',
    step2Title: initialTheme?.step2Title || 'Qualify Your Business Requirements',
    step2Subtitle: initialTheme?.step2Subtitle || 'Answer quick questions so we can customize your growth roadmap',
    step2ButtonText: initialTheme?.step2ButtonText || 'PROCEED TO TIME SLOT',
    step3Title: initialTheme?.step3Title || 'Lock Your Strategy Call Slot',
    step3Subtitle: initialTheme?.step3Subtitle || 'Pick a date & time slot for your 1-on-1 session',
    step3ButtonText: initialTheme?.step3ButtonText || 'CONFIRM & LOCK BOOKING 📅',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    const ok = await saveWorkspaceConfig({
      popup_theme: theme,
    });
    setIsSaving(false);

    if (ok) {
      setSaveSuccess(true);
      onSaveTheme(theme);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs font-sans">
      <div className="bg-[#0B0F17] border border-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-white">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-[#131B2A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-black font-bold flex items-center justify-center shadow-2xs">
              <Palette className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">
                Customize 3-Popup Theme & Copy
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Customize colors, titles, subtitles, and CTA button text for all 3 popup forms.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {saveSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Popup theme & copy successfully saved to Supabase! ✅</span>
            </div>
          )}

          {/* Color Palette Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
              Primary Theme Accent Color
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRESET_COLORS.map((c) => {
                const isSelected = theme.primaryColor === c.hex;
                return (
                  <button
                    type="button"
                    key={c.hex}
                    onClick={() => setTheme({ ...theme, primaryColor: c.hex })}
                    className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-white bg-white/10 text-white shadow-md'
                        : 'border-gray-800 bg-[#131B2A] text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-2xs"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Badge Header Text */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
              Top Badge Text
            </label>
            <input
              type="text"
              value={theme.badgeText}
              onChange={(e) => setTheme({ ...theme, badgeText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-800 bg-[#131B2A] text-xs font-bold text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Step 1 Customization */}
          <div className="p-4 rounded-2xl bg-[#131B2A] border border-gray-800 space-y-3">
            <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
              Step 1: Contact Details Form Customization
            </h4>
            <div className="space-y-2">
              <input
                type="text"
                value={theme.step1Title}
                onChange={(e) => setTheme({ ...theme, step1Title: e.target.value })}
                placeholder="Step 1 Title"
                className="w-full px-3 py-2 rounded-xl border border-gray-700 bg-[#0B0F17] text-xs font-bold text-white"
              />
              <input
                type="text"
                value={theme.step1Subtitle}
                onChange={(e) => setTheme({ ...theme, step1Subtitle: e.target.value })}
                placeholder="Step 1 Subtitle"
                className="w-full px-3 py-2 rounded-xl border border-gray-700 bg-[#0B0F17] text-xs font-semibold text-gray-300"
              />
              <input
                type="text"
                value={theme.step1ButtonText}
                onChange={(e) => setTheme({ ...theme, step1ButtonText: e.target.value })}
                placeholder="Step 1 Button CTA Text"
                className="w-full px-3 py-2 rounded-xl border border-gray-700 bg-[#0B0F17] text-xs font-bold text-amber-300"
              />
            </div>
          </div>

          {/* Step 2 Customization */}
          <div className="p-4 rounded-2xl bg-[#131B2A] border border-gray-800 space-y-3">
            <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
              Step 2: Survey Qualification Form Customization
            </h4>
            <div className="space-y-2">
              <input
                type="text"
                value={theme.step2Title}
                onChange={(e) => setTheme({ ...theme, step2Title: e.target.value })}
                placeholder="Step 2 Title"
                className="w-full px-3 py-2 rounded-xl border border-gray-700 bg-[#0B0F17] text-xs font-bold text-white"
              />
              <input
                type="text"
                value={theme.step2Subtitle}
                onChange={(e) => setTheme({ ...theme, step2Subtitle: e.target.value })}
                placeholder="Step 2 Subtitle"
                className="w-full px-3 py-2 rounded-xl border border-gray-700 bg-[#0B0F17] text-xs font-semibold text-gray-300"
              />
              <input
                type="text"
                value={theme.step2ButtonText}
                onChange={(e) => setTheme({ ...theme, step2ButtonText: e.target.value })}
                placeholder="Step 2 Button CTA Text"
                className="w-full px-3 py-2 rounded-xl border border-gray-700 bg-[#0B0F17] text-xs font-bold text-amber-300"
              />
            </div>
          </div>

          {/* Step 3 Customization */}
          <div className="p-4 rounded-2xl bg-[#131B2A] border border-gray-800 space-y-3">
            <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
              Step 3: Meeting Booking Form Customization
            </h4>
            <div className="space-y-2">
              <input
                type="text"
                value={theme.step3Title}
                onChange={(e) => setTheme({ ...theme, step3Title: e.target.value })}
                placeholder="Step 3 Title"
                className="w-full px-3 py-2 rounded-xl border border-gray-700 bg-[#0B0F17] text-xs font-bold text-white"
              />
              <input
                type="text"
                value={theme.step3Subtitle}
                onChange={(e) => setTheme({ ...theme, step3Subtitle: e.target.value })}
                placeholder="Step 3 Subtitle"
                className="w-full px-3 py-2 rounded-xl border border-gray-700 bg-[#0B0F17] text-xs font-semibold text-gray-300"
              />
              <input
                type="text"
                value={theme.step3ButtonText}
                onChange={(e) => setTheme({ ...theme, step3ButtonText: e.target.value })}
                placeholder="Step 3 Button CTA Text"
                className="w-full px-3 py-2 rounded-xl border border-gray-700 bg-[#0B0F17] text-xs font-bold text-amber-300"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-800 bg-[#131B2A] flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Saves directly to Supabase (`popup_theme` JSONB column).
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Theme to Supabase 💾
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
