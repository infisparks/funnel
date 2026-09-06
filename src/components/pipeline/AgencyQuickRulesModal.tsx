'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Video,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui';

interface AgencyQuickRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  defaultAgencyName?: string;
  onRulesApplied?: () => void;
}

export function AgencyQuickRulesModal({
  isOpen,
  onClose,
  organizationId,
  defaultAgencyName = '',
  onRulesApplied,
}: AgencyQuickRulesModalProps) {
  const [agencyName, setAgencyName] = useState(defaultAgencyName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyName.trim()) {
      setErrorMsg('Please enter your agency or business name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/automations/rules/quick-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          agencyName: agencyName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to setup agency automation rules');
      }

      setSuccessMsg(`Success! 9 automated follow-up rules generated for ${agencyName.trim()}! 🚀`);
      setTimeout(() => {
        onRulesApplied?.();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Something went wrong while setting up rules.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-[#111827]">
                  Quick Add Agency Automations
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  9 High-Converting Rules
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Automatically configures 3-stage follow-up sequences with your agency branding.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Agency Name Input Field */}
          <div className="p-4 rounded-xl bg-[#F5F6F8] border border-[#E5E7EB] space-y-2">
            <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">
              Agency / Company Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={agencyName}
                onChange={(e) => {
                  setAgencyName(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="e.g. First Option Marketing, Apex Growth"
                className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white border border-[#E5E7EB] rounded-xl text-[#111827] placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <p className="text-[11px] text-[#6B7280]">
              This name will be automatically populated across all WhatsApp reminders sent to leads.
            </p>
          </div>

          {/* Sequences Preview */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Automated Sequences Being Created:
            </h4>

            {/* Stage 1 Card */}
            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-white space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-[#111827]">
                    1. Contact Form Captured
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    Goal: Force Survey Completion
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-500">3 Rules</span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Sends progressive reminders containing their direct <strong>Survey URL</strong> (<code>{'{'}{'{'}survey_url{'}'}{'}'}</code>):
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#F5F6F8] text-[#111827] border border-[#E5E7EB]">
                  <Clock className="w-3 h-3 text-blue-600" />
                  +1 Hour Follow-up
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#F5F6F8] text-[#111827] border border-[#E5E7EB]">
                  <Clock className="w-3 h-3 text-blue-600" />
                  +5 Hours Urgency
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#F5F6F8] text-[#111827] border border-[#E5E7EB]">
                  <Clock className="w-3 h-3 text-blue-600" />
                  +24 Hours (1 Day) Final Call
                </span>
              </div>
            </div>

            {/* Stage 2 Card */}
            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-white space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-xs font-bold text-[#111827]">
                    2. Survey Qualified
                  </span>
                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                    Goal: Force Meeting Booking
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-500">3 Rules</span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Sends booking invitations with your calendar booking link (<code>{'{'}{'{'}meeting_url{'}'}{'}'}</code>):
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#F5F6F8] text-[#111827] border border-[#E5E7EB]">
                  <Calendar className="w-3 h-3 text-purple-600" />
                  +1 Hour Invite
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#F5F6F8] text-[#111827] border border-[#E5E7EB]">
                  <Calendar className="w-3 h-3 text-purple-600" />
                  +5 Hours Limited Slots
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#F5F6F8] text-[#111827] border border-[#E5E7EB]">
                  <Calendar className="w-3 h-3 text-purple-600" />
                  +24 Hours (1 Day) Final Chance
                </span>
              </div>
            </div>

            {/* Stage 3 Card */}
            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-white space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-[#111827]">
                    3. Meeting Booked
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    Goal: Zero No-Shows
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-500">3 Rules</span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Pre-meeting alerts calculated dynamically before the scheduled meeting time:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#F5F6F8] text-[#111827] border border-[#E5E7EB]">
                  <Video className="w-3 h-3 text-emerald-600" />
                  24h Before Meeting
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#F5F6F8] text-[#111827] border border-[#E5E7EB]">
                  <Video className="w-3 h-3 text-emerald-600" />
                  1h Before Meeting
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#F5F6F8] text-[#111827] border border-[#E5E7EB]">
                  <Video className="w-3 h-3 text-emerald-600" />
                  5 Min Starting Now
                </span>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between shrink-0">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>

            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              disabled={!agencyName.trim() || isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Generate & Apply 9 Rules ⚡</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
