'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Plus,
  MessageSquare,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui';

export interface StageAutomationRule {
  id: string;
  organization_id: string;
  stage_id: string;
  title: string;
  trigger_base: 'stage_entered' | 'meeting_scheduled';
  offset_type: 'before' | 'after';
  offset_value: number;
  offset_unit: 'minutes' | 'hours' | 'days';
  template: string;
  channel: string;
  instance_name?: string | null;
  is_enabled: boolean;
  apply_to_existing: boolean;
  created_at?: string;
}

interface StageAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: { id: string; name: string; color: string } | null;
  organizationId: string;
  onRulesUpdated?: () => void;
}

export function StageAutomationModal({
  isOpen,
  onClose,
  stage,
  organizationId,
  onRulesUpdated,
}: StageAutomationModalProps) {
  const [rules, setRules] = useState<StageAutomationRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [triggerBase, setTriggerBase] = useState<'stage_entered' | 'meeting_scheduled'>('stage_entered');
  const [offsetType, setOffsetType] = useState<'before' | 'after'>('after');
  const [offsetValue, setOffsetValue] = useState(5);
  const [offsetUnit, setOffsetUnit] = useState<'minutes' | 'hours' | 'days'>('minutes');
  const [template, setTemplate] = useState(
    'Hello {{name}}, welcome to our next step! We look forward to connecting with you.'
  );

  const fetchRules = React.useCallback(async () => {
    if (!stage || !organizationId) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/automations/rules?organizationId=${encodeURIComponent(organizationId)}&stageId=${encodeURIComponent(
          stage.id
        )}`
      );
      const data = await res.json();
      if (res.ok && data.rules) {
        setRules(data.rules);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch stage rules:', err);
    } finally {
      setIsLoading(false);
    }
  }, [stage, organizationId]);

  useEffect(() => {
    if (isOpen && stage) {
      fetchRules();
      setIsCreating(false);
      setNotification(null);
    }
  }, [isOpen, stage, fetchRules]);

  const handleToggleRule = async (rule: StageAutomationRule) => {
    try {
      const updatedStatus = !rule.is_enabled;
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, is_enabled: updatedStatus } : r))
      );

      const res = await fetch('/api/automations/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rule.id,
          organizationId,
          isEnabled: updatedStatus,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update rule status');
      }
      onRulesUpdated?.();
    } catch (err: unknown) {
      setNotification({ type: 'error', message: (err as Error).message || 'Error updating rule' });
      fetchRules();
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) return;
    try {
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      const res = await fetch(
        `/api/automations/rules?id=${encodeURIComponent(ruleId)}&organizationId=${encodeURIComponent(organizationId)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to delete rule');
      setNotification({ type: 'success', message: 'Rule deleted successfully' });
      onRulesUpdated?.();
    } catch (err: unknown) {
      setNotification({ type: 'error', message: (err as Error).message || 'Error deleting rule' });
      fetchRules();
    }
  };

  const handleInsertTag = (tag: string) => {
    setTemplate((prev) => `${prev} ${tag}`);
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !template.trim() || !stage) return;

    setIsSaving(true);
    setNotification(null);

    try {
      const res = await fetch('/api/automations/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          stageId: stage.id,
          title: title.trim(),
          triggerBase,
          offsetType: triggerBase === 'stage_entered' ? 'after' : offsetType,
          offsetValue: Number(offsetValue),
          offsetUnit,
          template: template.trim(),
          channel: 'whatsapp',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create automation rule');
      }

      setNotification({ type: 'success', message: 'Automation rule created successfully! ⚡' });
      setTitle('');
      setIsCreating(false);
      fetchRules();
      onRulesUpdated?.();
    } catch (err: unknown) {
      setNotification({ type: 'error', message: (err as Error).message || 'Failed to create rule' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !stage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#F5F6F8]">
          <div className="flex items-center gap-3">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
              style={{ backgroundColor: stage.color }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#111827]">Stage Automations</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                  {stage.name}
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Automatically fire WhatsApp messages when leads enter this stage.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {notification && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between ${
                notification.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              <span>{notification.message}</span>
              <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Active Rules List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-[#111827]">Active Automation Rules</h3>
                <span className="text-xs text-gray-500">({rules.length})</span>
              </div>
              {!isCreating && (
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setIsCreating(true)}
                  className="text-xs font-semibold"
                >
                  + Add Rule
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-gray-400">Loading stage automations...</div>
            ) : rules.length === 0 && !isCreating ? (
              <div className="py-10 px-4 rounded-xl border border-dashed border-[#E5E7EB] bg-[#F5F6F8] text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs font-medium text-gray-600">No automation rules configured for this stage yet.</p>
                <p className="text-[11px] text-gray-400">
                  Leads moved here will not trigger any automated messages until a rule is created.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsCreating(true)}
                  className="text-xs mt-2"
                >
                  Create First Stage Rule
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-xl border transition-all ${
                      rule.is_enabled
                        ? 'bg-white border-[#E5E7EB] shadow-2xs hover:border-indigo-200'
                        : 'bg-gray-50/60 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[#111827] truncate">{rule.title}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              rule.is_enabled
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                          >
                            {rule.is_enabled ? 'Active' : 'Disabled'}
                          </span>
                        </div>

                        {/* Timing Trigger Pill */}
                        <div className="flex items-center gap-1.5 text-[11px] text-indigo-700 font-medium">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          <span>
                            {rule.trigger_base === 'stage_entered'
                              ? `Send ${rule.offset_value} ${rule.offset_unit} after entering stage`
                              : `Send ${rule.offset_value} ${rule.offset_unit} ${rule.offset_type} scheduled meeting`}
                          </span>
                        </div>

                        {/* Template Preview */}
                        <p className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded-lg border border-gray-100 line-clamp-2 mt-1">
                          {rule.template}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleRule(rule)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition-colors cursor-pointer ${
                            rule.is_enabled
                              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent'
                          }`}
                        >
                          {rule.is_enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create New Rule Form Card */}
          {isCreating && (
            <div className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/20 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-[#111827]">New Stage Automation Rule</h4>
                </div>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreateRule} className="space-y-4">
                {/* Rule Title */}
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Rule Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 5-Min Welcome WhatsApp"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-[#111827]"
                  />
                </div>

                {/* Trigger Base */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">Trigger Event</label>
                    <select
                      value={triggerBase}
                      onChange={(e) =>
                        setTriggerBase(e.target.value as 'stage_entered' | 'meeting_scheduled')
                      }
                      className="w-full text-xs px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white focus:outline-hidden focus:border-indigo-500 text-[#111827]"
                    >
                      <option value="stage_entered">Lead Enters Stage</option>
                      <option value="meeting_scheduled">Meeting Date & Time</option>
                    </select>
                  </div>

                  {/* Offset Type (if meeting) */}
                  {triggerBase === 'meeting_scheduled' && (
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">Timing</label>
                      <select
                        value={offsetType}
                        onChange={(e) => setOffsetType(e.target.value as 'before' | 'after')}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white focus:outline-hidden focus:border-indigo-500 text-[#111827]"
                      >
                        <option value="before">Before Meeting</option>
                        <option value="after">After Meeting</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Offset Value & Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">
                      Delay Value <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={offsetValue}
                      onChange={(e) => setOffsetValue(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white focus:outline-hidden focus:border-indigo-500 text-[#111827]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">Unit</label>
                    <select
                      value={offsetUnit}
                      onChange={(e) =>
                        setOffsetUnit(e.target.value as 'minutes' | 'hours' | 'days')
                      }
                      className="w-full text-xs px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white focus:outline-hidden focus:border-indigo-500 text-[#111827]"
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                </div>

                {/* Message Template & Placeholders */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#111827]">
                      WhatsApp Message Template <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-gray-400">Click a variable tag to insert:</span>
                  </div>

                  {/* Variable Tag Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {['{{name}}', '{{phone}}', '{{email}}', '{{date}}', '{{time}}', '{{meeting_url}}'].map(
                      (tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleInsertTag(tag)}
                          className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-white border border-[#E5E7EB] hover:border-indigo-300 hover:text-indigo-600 text-gray-600 transition-colors cursor-pointer shadow-2xs"
                        >
                          + {tag}
                        </button>
                      )
                    )}
                  </div>

                  <textarea
                    rows={4}
                    required
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    placeholder="Enter your WhatsApp template text with placeholders..."
                    className="w-full text-xs p-3 rounded-lg border border-[#E5E7EB] bg-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans text-[#111827] leading-relaxed"
                  />
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-[#E5E7EB] bg-white hover:bg-gray-50 text-gray-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSaving}
                    className="text-xs font-semibold"
                  >
                    {isSaving ? 'Saving Rule...' : 'Save & Activate Rule'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E5E7EB] bg-[#F5F6F8] flex items-center justify-between text-[11px] text-gray-500">
          <span>⚡ Changes take effect immediately on next lead movement.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-gray-100 text-gray-700 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
