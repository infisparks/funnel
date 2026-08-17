'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  Monitor,
  Smartphone,
  Sparkles,
  ExternalLink,
  Layers,
  Target,
  User,
  Mail,
  Calendar,
  Search,
  Check,
  RotateCw,
  Share2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '../auth/AuthContext';

export interface SharedDesignData {
  id: string;
  share_code: string;
  title: string;
  creator_user_id?: string;
  creator_name?: string;
  creator_email?: string;
  landing_html: string;
  trigger_buttons?: string[];
  popup_theme?: any;
  survey_questions?: any[];
  category?: string;
  description?: string;
  created_at?: string;
}

interface ImportSharedDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialShareCode?: string;
  onApplyToWorkspace: (design: SharedDesignData) => Promise<boolean | void>;
  onSaveToTemplateStore?: (design: SharedDesignData) => Promise<boolean | void>;
}

export function ImportSharedDesignModal({
  isOpen,
  onClose,
  initialShareCode = '',
  onApplyToWorkspace,
  onSaveToTemplateStore,
}: ImportSharedDesignModalProps) {
  const { user } = useAuth();
  const [shareInput, setShareInput] = useState(initialShareCode);
  const [isLoading, setIsLoading] = useState(false);
  const [design, setDesign] = useState<SharedDesignData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [isApplying, setIsApplying] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Extract clean code from input (can be full URL or code)
  const extractCode = (input: string) => {
    let clean = input.trim();
    if (clean.includes('share_code=')) {
      const match = clean.match(/share_code=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) return match[1];
    }
    if (clean.includes('import=')) {
      const match = clean.match(/import=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) return match[1];
    }
    return clean;
  };

  const fetchSharedDesign = async (codeToFetch: string) => {
    const code = extractCode(codeToFetch);
    if (!code) {
      setErrorMessage('Please enter a valid share code or shared URL.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setActionSuccessMessage(null);

    try {
      // Search by share_code or id
      const { data, error } = await supabase
        .from('shared_landing_designs')
        .select('*')
        .or(`share_code.eq.${code},id.eq.${code}`)
        .single();

      if (error || !data) {
        setErrorMessage('No shared landing page design found for this code or URL. Please verify and try again.');
        setDesign(null);
      } else {
        setDesign({
          id: data.id,
          share_code: data.share_code,
          title: data.title || 'Shared Landing Page Design',
          creator_user_id: data.creator_user_id,
          creator_name: data.creator_name || 'Anonymous Creator',
          creator_email: data.creator_email || '',
          landing_html: data.landing_html,
          trigger_buttons: Array.isArray(data.trigger_buttons)
            ? data.trigger_buttons
            : typeof data.trigger_buttons === 'string'
            ? JSON.parse(data.trigger_buttons)
            : [],
          popup_theme: typeof data.popup_theme === 'object' ? data.popup_theme : {},
          survey_questions: Array.isArray(data.survey_questions)
            ? data.survey_questions
            : typeof data.survey_questions === 'string'
            ? JSON.parse(data.survey_questions)
            : [],
          category: data.category || 'Custom',
          description: data.description || '',
          created_at: data.created_at,
        });

        // Increment access count
        await supabase
          .from('shared_landing_designs')
          .update({ access_count: (data.access_count || 0) + 1 })
          .eq('id', data.id);
      }
    } catch (err: any) {
      setErrorMessage('Failed to fetch shared design. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialShareCode && isOpen) {
      setShareInput(initialShareCode);
      fetchSharedDesign(initialShareCode);
    }
  }, [initialShareCode, isOpen]);

  const handleApply = async () => {
    if (!design) return;
    setIsApplying(true);
    try {
      await onApplyToWorkspace(design);
      setActionSuccessMessage('Design successfully imported and applied to your live landing page! 🎉');
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMessage('Failed to apply design to your workspace.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleSaveToStore = async () => {
    if (!design) return;
    setIsSavingTemplate(true);
    try {
      if (onSaveToTemplateStore) {
        await onSaveToTemplateStore(design);
      } else {
        // Direct save into landing_templates
        const newTemplateId = `tpl_${Date.now()}`;
        await supabase.from('landing_templates').insert({
          id: newTemplateId,
          name: design.title,
          category: design.category || 'Consulting',
          badge: 'Imported Design',
          accent_color: design.popup_theme?.primaryColor || '#8146F0',
          description: `Shared by ${design.creator_name || 'User'}. ${design.description || ''}`,
          trigger_buttons: design.trigger_buttons || [],
          features: ['Imported Shared Design', 'High Converting', 'Mobile Ready'],
          html: design.landing_html,
        });
      }
      setActionSuccessMessage(`Saved "${design.title}" to your Templates Library! 💾`);
    } catch (err) {
      setErrorMessage('Failed to save to template store.');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#111827]">
                  Import Shared Landing Page Design
                </h2>
                <Badge variant="info" className="py-0 px-2 text-[11px] font-medium gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  Shared Design
                </Badge>
              </div>
              <p className="text-xs text-[#6B7280]">
                Enter a share code or URL to view who shared the design and import it into your workspace.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#F5F6F8] border-b border-[#E5E7EB] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchSharedDesign(shareInput);
            }}
            className="flex flex-col sm:flex-row items-center gap-2.5"
          >
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={shareInput}
                onChange={(e) => setShareInput(e.target.value)}
                placeholder="Paste shared link (e.g. https://.../templates?share_code=SLP-7X8K) or enter code..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] bg-white placeholder:text-[#6B7280]/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              leftIcon={<Search className="w-3.5 h-3.5" />}
              className="w-full sm:w-auto shrink-0 text-xs font-semibold"
            >
              Fetch Design
            </Button>
          </form>

          {errorMessage && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {actionSuccessMessage && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{actionSuccessMessage}</span>
            </div>
          )}
        </div>

        {/* Design Details & Interactive Preview Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {design ? (
            <div className="space-y-4">
              {/* Top Details Card */}
              <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#111827]">{design.title}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {design.category || 'Template'}
                      </span>
                    </div>
                    {design.description && (
                      <p className="text-xs text-[#6B7280] mt-1">{design.description}</p>
                    )}
                  </div>

                  {/* Creator Info Badge */}
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F5F6F8] border border-[#E5E7EB] text-xs">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      {design.creator_name ? design.creator_name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-[#111827] flex items-center gap-1">
                        <span>Shared by {design.creator_name}</span>
                      </div>
                      <div className="text-[11px] text-[#6B7280]">
                        {design.created_at ? new Date(design.created_at).toLocaleDateString() : 'Recently'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Included Components Pill Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#F5F6F8] border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block">Triggers</span>
                    <span className="font-bold text-[#111827]">
                      {design.trigger_buttons?.length || 0} Interactive Triggers
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F5F6F8] border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block">Survey Questions</span>
                    <span className="font-bold text-[#111827]">
                      {design.survey_questions?.length || 0} Qualification Steps
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F5F6F8] border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block">Primary Accent</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block"
                        style={{ backgroundColor: design.popup_theme?.primaryColor || '#8146F0' }}
                      />
                      <span className="font-bold text-[#111827]">
                        {design.popup_theme?.primaryColor || '#8146F0'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F5F6F8] border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block">Share Code</span>
                    <span className="font-mono font-bold text-indigo-600 select-all">
                      {design.share_code}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview Bar */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-2xs">
                <div className="px-4 py-2.5 bg-[#F5F6F8] border-b border-[#E5E7EB] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#111827]">
                    <Eye className="w-4 h-4 text-indigo-600" />
                    <span>Live Shared Design Preview</span>
                  </div>

                  <div className="flex items-center p-0.5 bg-gray-200/70 rounded-xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setViewport('desktop')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        viewport === 'desktop' ? 'bg-white text-[#111827] shadow-2xs' : 'text-[#6B7280]'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Desktop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewport('mobile')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        viewport === 'mobile' ? 'bg-white text-[#111827] shadow-2xs' : 'text-[#6B7280]'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Mobile</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-[#F5F6F8] flex items-center justify-center min-h-[420px]">
                  {viewport === 'desktop' ? (
                    <div className="w-full h-[420px] bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-sm">
                      <iframe
                        srcDoc={design.landing_html}
                        title="Shared Design Preview"
                        className="w-full h-full border-0"
                        sandbox="allow-scripts"
                      />
                    </div>
                  ) : (
                    <div className="w-[340px] h-[420px] bg-white rounded-[24px] border-[5px] border-[#1E293B] overflow-hidden shadow-xl">
                      <iframe
                        srcDoc={design.landing_html}
                        title="Shared Design Preview Mobile"
                        className="w-full h-full border-0"
                        sandbox="allow-scripts"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#111827]">
                Ready to Import a Shared Landing Page Design
              </h3>
              <p className="text-xs text-[#6B7280] max-w-md mx-auto">
                When another user shares their custom landing page design link with you, paste it in the search bar above or enter their share code to preview and import it into your workspace.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-[#E5E7EB] bg-[#F5F6F8] flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="text-[11px] text-[#6B7280]">
            {design ? 'Ready to import into your workspace' : 'Enter share code or URL'}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs flex-1 sm:flex-initial">
              Close
            </Button>

            {design && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveToStore}
                  isLoading={isSavingTemplate}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
                  className="text-xs font-semibold text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
                >
                  Save to Template Store
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApply}
                  isLoading={isApplying}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  className="text-xs font-bold"
                >
                  Apply to My Landing Page 🚀
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
