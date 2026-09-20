'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Activity, AlertCircle, Copy, Trash2, ShieldCheck, HelpCircle } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';

interface MetaPixelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPixelId?: string | null;
  onSave: (newPixelId: string | null) => Promise<boolean>;
  workspaceSubdomain?: string;
}

export function MetaPixelModal({
  isOpen,
  onClose,
  currentPixelId,
  onSave,
  workspaceSubdomain,
}: MetaPixelModalProps) {
  const { accentColor } = useTheme();
  const [pixelInput, setPixelInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedStatus, setCopiedStatus] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPixelInput(currentPixelId || '');
      setErrorMsg(null);
    }
  }, [isOpen, currentPixelId]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = pixelInput.trim();

    // Validation: if user enters something, ensure digits or standard Meta format
    if (cleanId && !/^\d{10,20}$/.test(cleanId)) {
      setErrorMsg('Please enter a valid Meta Pixel ID (usually 15-16 digits, e.g. 1817245239415505).');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    try {
      const ok = await onSave(cleanId || null);
      if (ok) {
        onClose();
      } else {
        setErrorMsg('Failed to save to Supabase. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating Pixel ID');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearPixel = async () => {
    if (!confirm('Are you sure you want to remove this Meta Pixel ID? Event tracking will be paused.')) {
      return;
    }
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const ok = await onSave(null);
      if (ok) {
        setPixelInput('');
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error clearing Pixel ID');
    } finally {
      setIsSaving(false);
    }
  };

  const isConfigured = Boolean(currentPixelId && currentPixelId.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full h-full sm:h-auto sm:max-w-lg bg-white sm:rounded-2xl border border-[#E5E7EB] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-xs"
              style={{ backgroundColor: accentColor.primary }}
            >
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#111827] tracking-tight">
                {isConfigured ? 'Configure Meta Pixel' : 'Set Up Meta Pixel'}
              </h2>
              <p className="text-[12px] text-[#6B7280]">
                {isConfigured ? 'Update or manage your connected tracking pixel' : 'Add your Meta / Facebook Pixel ID'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#111827] hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5 flex-1 overflow-y-auto">
          {/* Status Indicator */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            isConfigured 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
              isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`} />
            <div className="text-xs">
              <div className="font-semibold">
                {isConfigured ? `Pixel Active: ${currentPixelId}` : 'No Pixel Configured (Default: null)'}
              </div>
              <p className="text-[11px] opacity-80 mt-0.5">
                {isConfigured 
                  ? 'All landing page visits, lead captures, surveys, and bookings are tracked automatically.' 
                  : 'Enter your 15-16 digit Meta Pixel ID below to start tracking conversion events.'}
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Pixel ID Input */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-[#111827]">
              Meta Pixel ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={pixelInput}
              onChange={(e) => setPixelInput(e.target.value.replace(/\s+/g, ''))}
              placeholder="e.g. 1817245239415505"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-[#111827] placeholder:text-[#9CA3AF]"
              autoFocus
            />
            <p className="text-[11px] text-[#6B7280]">
              Enter only the numeric ID (e.g. <strong>1817245239415505</strong>). Do not paste the entire &lt;script&gt; code — the platform automatically injects and runs it for you.
            </p>
          </div>

          {/* Automated Events Breakdown */}
          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-3">
            <div className="text-[12px] font-semibold text-[#111827] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Automatic Meta Events Fired</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2 text-[12px]">
              <div className="flex items-center justify-between py-1 border-b border-[#E5E7EB]/60">
                <span className="text-[#4B5563]">1. Landing Page View</span>
                <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white border border-[#E5E7EB] text-indigo-600">
                  fbq(&apos;track&apos;, &apos;PageView&apos;)
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E5E7EB]/60">
                <span className="text-[#4B5563]">2. Contact Form Submitted</span>
                <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white border border-[#E5E7EB] text-indigo-600">
                  fbq(&apos;track&apos;, &apos;Lead&apos;)
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E5E7EB]/60">
                <span className="text-[#4B5563]">3. Survey Form Completed</span>
                <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white border border-[#E5E7EB] text-indigo-600">
                  fbq(&apos;track&apos;, &apos;SubmitApplication&apos;)
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#4B5563]">4. Strategy Meeting Booked</span>
                <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white border border-[#E5E7EB] text-indigo-600">
                  fbq(&apos;track&apos;, &apos;Schedule&apos;)
                </span>
              </div>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="pt-3 border-t border-[#E5E7EB] flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5">
            {isConfigured ? (
              <button
                type="button"
                onClick={handleClearPixel}
                disabled={isSaving}
                className="w-full sm:w-auto px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Pixel ID</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 sm:flex-initial px-4 py-2 text-xs font-medium rounded-lg border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 sm:flex-initial px-5 py-2 text-xs font-medium rounded-lg text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: accentColor.primary }}
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving to Supabase...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{isConfigured ? 'Update Pixel ID' : 'Save Pixel ID'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
