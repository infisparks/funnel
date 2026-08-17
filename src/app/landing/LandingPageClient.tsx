'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button, Badge } from '@/components/ui';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useAuth } from '@/components/auth/AuthContext';
import {
  Code2,
  Globe,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Lock,
  Zap,
  Database,
  ListOrdered,
  Target,
  ExternalLink,
  Plus,
  Trash2,
  Save,
  Maximize2,
  Copy,
  Check,
  RotateCw,
  Layers,
  ChevronDown,
  ChevronUp,
  Share2,
  Download,
} from 'lucide-react';
import { DEFAULT_LANDING_HTML } from '@/lib/defaultLandingHtml';
import { HtmlCodeEditorModal } from '@/components/landing/HtmlCodeEditorModal';
import { CustomDomainModal } from '@/components/landing/CustomDomainModal';
import { ThreePopupFunnelModal, PopupThemeConfig } from '@/components/funnel/ThreePopupFunnelModal';
import { SurveyQuestion } from '@/components/funnel/SurveyBuilderModal';
import { LandingTemplateModal } from '@/components/landing/LandingTemplateModal';
import { ShareLandingModal } from '@/components/landing/ShareLandingModal';
import { ImportSharedDesignModal, SharedDesignData } from '@/components/landing/ImportSharedDesignModal';
import { LandingTemplate } from '@/lib/landingTemplates';
import { supabase } from '@/lib/supabaseClient';

interface LandingPageClientProps {
  initialHtmlCode: string;
  initialWorkspace: any;
  isPublicView: boolean;
  subdomainName: string;
}

export function LandingPageClient({
  initialHtmlCode,
  initialWorkspace,
  isPublicView,
  subdomainName,
}: LandingPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accentColor } = useTheme();
  const { user, workspace, saveWorkspaceConfig } = useAuth();

  // Initialize state directly with server-fetched HTML code & saved triggers from Supabase (0ms delay)
  const [htmlCode, setHtmlCode] = useState(initialHtmlCode || DEFAULT_LANDING_HTML);
  const [customDomain, setCustomDomain] = useState(initialWorkspace?.custom_domain || 'firstoption.cloud');
  const [subdomain, setSubdomain] = useState(
    initialWorkspace?.subdomain || workspace?.subdomain || subdomainName || ''
  );
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>(
    initialWorkspace?.survey_questions || []
  );

  // Array of exact full text trigger buttons saved in Supabase
  const [triggerButtons, setTriggerButtons] = useState<string[]>(
    initialWorkspace?.trigger_buttons || []
  );
  const [manualTriggerInput, setManualTriggerInput] = useState('');

  // Customizable Popup Theme & Copy State
  const [popupTheme, setPopupTheme] = useState<PopupThemeConfig>(
    initialWorkspace?.popup_theme || {}
  );

  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importShareCode, setImportShareCode] = useState('');
  const [isPopupFunnelOpen, setIsPopupFunnelOpen] = useState(false);
  const [isSavingSupabase, setIsSavingSupabase] = useState(false);
  const [supabaseToastMsg, setSupabaseToastMsg] = useState('');
  const [isCopiedDomain, setIsCopiedDomain] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Apply chosen pre-built landing page template
  const handleApplyTemplate = async (template: LandingTemplate) => {
    setHtmlCode(template.html);
    if (template.triggerButtons && template.triggerButtons.length > 0) {
      setTriggerButtons(template.triggerButtons);
    }
    setIframeKey((prev) => prev + 1);

    try {
      await saveWorkspaceConfig({
        landing_html: template.html,
        trigger_buttons: template.triggerButtons || triggerButtons,
      });
      setSupabaseToastMsg(`🎉 Applied "${template.name}" template to your landing page!`);
      setTimeout(() => setSupabaseToastMsg(''), 4500);
    } catch (err) {
      console.error('Error saving template:', err);
    }
  };

  // Apply imported shared landing page design
  const handleApplyImportedDesign = async (design: SharedDesignData) => {
    if (design.landing_html) setHtmlCode(design.landing_html);
    if (design.trigger_buttons && design.trigger_buttons.length > 0) {
      setTriggerButtons(design.trigger_buttons);
    }
    if (design.popup_theme && Object.keys(design.popup_theme).length > 0) {
      setPopupTheme(design.popup_theme);
    }
    if (design.survey_questions && design.survey_questions.length > 0) {
      setSurveyQuestions(design.survey_questions);
    }
    setIframeKey((prev) => prev + 1);

    setIsSavingSupabase(true);
    await saveWorkspaceConfig({
      landing_html: design.landing_html,
      trigger_buttons: design.trigger_buttons || triggerButtons,
      popup_theme: design.popup_theme || popupTheme,
      survey_questions: design.survey_questions || surveyQuestions,
    });
    setIsSavingSupabase(false);
    showToast(`🎉 Applied shared design "${design.title}" by ${design.creator_name || 'User'}!`);
  };

  // Target Button Trigger Picker state & component visibility
  const [isPickerActive, setIsPickerActive] = useState(false);
  const [showTriggerBar, setShowTriggerBar] = useState(false);

  // Sync workspace state if logged in admin updates workspace or on initial load
  useEffect(() => {
    if (workspace) {
      if (workspace.landing_html && workspace.landing_html.trim()) {
        setHtmlCode(workspace.landing_html);
      }
      if (workspace.custom_domain) setCustomDomain(workspace.custom_domain);
      if (workspace.subdomain) setSubdomain(workspace.subdomain);
      if (workspace.survey_questions && workspace.survey_questions.length > 0) {
        setSurveyQuestions(workspace.survey_questions);
      }
      if (workspace.trigger_buttons && workspace.trigger_buttons.length > 0) {
        setTriggerButtons(workspace.trigger_buttons);
      }
      if (workspace.popup_theme && Object.keys(workspace.popup_theme).length > 0) {
        setPopupTheme(workspace.popup_theme);
      }
      setIframeKey((prev) => prev + 1);
    }
  }, [workspace]);

  // Also sync if initialHtmlCode changes
  useEffect(() => {
    if (initialHtmlCode && initialHtmlCode.trim() && initialHtmlCode !== DEFAULT_LANDING_HTML) {
      setHtmlCode(initialHtmlCode);
      setIframeKey((prev) => prev + 1);
    }
  }, [initialHtmlCode]);

  // Check URL searchParams for share_code / import or step triggers
  useEffect(() => {
    const shareCodeParam = searchParams.get('share_code') || searchParams.get('import');
    if (shareCodeParam) {
      setImportShareCode(shareCodeParam);
      setIsImportModalOpen(true);
    }

    const step = searchParams.get('step');
    if (step && ['detail', 'survey', 'meeting', 'confirmation'].includes(step.toLowerCase())) {
      setIsPopupFunnelOpen(true);
    }
  }, [searchParams]);

  const showToast = (message: string) => {
    setSupabaseToastMsg(message);
    setTimeout(() => setSupabaseToastMsg(''), 4000);
  };

  const handleCopyLiveUrl = () => {
    const url = `https://${subdomain}.firstoption.cloud`;
    navigator.clipboard.writeText(url);
    setIsCopiedDomain(true);
    setTimeout(() => setIsCopiedDomain(false), 2000);
    showToast('Copied live subdomain URL to clipboard! 📋');
  };

  const handleAddTriggerButton = async (exactText: string) => {
    const trimmed = exactText.trim();
    if (!trimmed) return;
    if (triggerButtons.includes(trimmed)) {
      showToast(`Trigger "${trimmed}" is already in your list!`);
      return;
    }
    const updated = [...triggerButtons, trimmed];
    setTriggerButtons(updated);
    setManualTriggerInput('');

    // Persist immediately to Supabase
    setIsSavingSupabase(true);
    await saveWorkspaceConfig({ trigger_buttons: updated });
    setIsSavingSupabase(false);
    showToast(`Added & Saved Trigger: "${trimmed}" 🎯`);
  };

  const handleRemoveTriggerButton = async (index: number) => {
    const updated = [...triggerButtons];
    const removed = updated.splice(index, 1);
    setTriggerButtons(updated);

    // Persist update immediately to Supabase
    setIsSavingSupabase(true);
    await saveWorkspaceConfig({ trigger_buttons: updated });
    setIsSavingSupabase(false);
    showToast(`Removed Trigger: "${removed[0]}"`);
  };

  const handleSaveTriggersToSupabase = async () => {
    setIsSavingSupabase(true);
    const ok = await saveWorkspaceConfig({
      landing_html: htmlCode,
      subdomain,
      custom_domain: customDomain,
      survey_questions: surveyQuestions,
      trigger_buttons: triggerButtons,
      popup_theme: popupTheme,
    });
    setIsSavingSupabase(false);
    if (ok) {
      showToast(`Saved triggers & theme to Supabase! 💾`);
    }
  };

  const handleSaveHtml = async (newCode: string) => {
    setHtmlCode(newCode);
    localStorage.setItem('landing_custom_html', newCode);
    setIsSavingSupabase(true);
    const ok = await saveWorkspaceConfig({ landing_html: newCode, subdomain, custom_domain: customDomain, trigger_buttons: triggerButtons, popup_theme: popupTheme });
    setIsSavingSupabase(false);
    if (ok) {
      showToast('Landing Page HTML saved to Supabase! ✅');
    }
  };

  const handleSaveDomain = async (newSubdomain: string, newDomain?: string) => {
    const formattedSub = newSubdomain.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    const cleanDomain = newDomain?.trim() || customDomain || 'firstoption.cloud';
    setSubdomain(formattedSub);
    setCustomDomain(cleanDomain);
    localStorage.setItem('landing_custom_subdomain', formattedSub);
    localStorage.setItem('landing_custom_domain', cleanDomain);
    setIsSavingSupabase(true);
    const ok = await saveWorkspaceConfig({
      landing_html: htmlCode,
      subdomain: formattedSub,
      custom_domain: cleanDomain,
      trigger_buttons: triggerButtons,
      popup_theme: popupTheme,
      survey_questions: surveyQuestions,
    });
    setIsSavingSupabase(false);
    if (ok) {
      showToast(`Domain saved: https://${formattedSub}.firstoption.cloud 🌐`);
    }
  };

  const handleSyncToSupabase = async () => {
    setIsSavingSupabase(true);
    const ok = await saveWorkspaceConfig({
      landing_html: htmlCode,
      subdomain,
      custom_domain: customDomain,
      survey_questions: surveyQuestions,
      trigger_buttons: triggerButtons,
      popup_theme: popupTheme,
    });
    setIsSavingSupabase(false);
    if (ok) {
      showToast('Synced workspace configuration to Supabase! 🚀');
    }
  };

  // Helper: Auto-inject viewport meta tag and smart click event listener matching EXACT full text trigger strings
  const processedHtmlCode = useMemo(() => {
    if (!htmlCode) return '';
    let code = htmlCode;

    // Convert trigger buttons array to JSON string for iframe script
    const activeTriggers = (triggerButtons && triggerButtons.length > 0)
      ? triggerButtons
      : (initialWorkspace?.trigger_buttons || []);

    const triggersJson = JSON.stringify(activeTriggers.map((t: string) => t.toLowerCase().trim()));

    const triggerScript = `
      <script>
        (function() {
          const validTriggers = ${triggersJson};

          document.addEventListener('click', function(e) {
            const target = e.target.closest('a, button, input[type="submit"]');
            if (!target) return;

            if (target.dataset.noPopup === 'true') return;

            const clickedText = (target.textContent || '').trim();
            const fullText = clickedText.toLowerCase();

            window.parent.postMessage({ type: 'BUTTON_CLICKED', text: clickedText }, '*');

            let matchesTrigger = false;

            if (validTriggers && validTriggers.length > 0) {
              matchesTrigger = target.dataset.popup === 'true' || validTriggers.some(function(trig) {
                return trig && (fullText === trig || fullText.indexOf(trig) !== -1);
              });
            } else {
              matchesTrigger = target.dataset.popup === 'true' ||
                fullText.indexOf('book') !== -1 ||
                fullText.indexOf('strategy') !== -1 ||
                fullText.indexOf('claim') !== -1 ||
                fullText.indexOf('schedule') !== -1 ||
                fullText.indexOf('get started') !== -1;
            }

            if (matchesTrigger) {
              e.preventDefault();
              window.parent.postMessage('OPEN_FUNNEL_POPUP', '*');
            }
          });
        })();
      </script>
    `;

    if (!code.includes('<meta name="viewport"')) {
      if (code.includes('<head>')) {
        code = code.replace('<head>', '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">' + triggerScript);
      } else if (code.includes('<html>')) {
        code = code.replace('<html>', '<html>\n<head><meta name="viewport" content="width=device-width, initial-scale=1.0">' + triggerScript + '</head>');
      } else {
        code = `<meta name="viewport" content="width=device-width, initial-scale=1.0">\n` + triggerScript + code;
      }
    } else {
      code = code.replace('</head>', triggerScript + '\n</head>');
    }
    return code;
  }, [htmlCode, triggerButtons, initialWorkspace]);

  // Listen to postMessage from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'OPEN_FUNNEL_POPUP') {
        setIsPopupFunnelOpen(true);
      } else if (event.data?.type === 'BUTTON_CLICKED') {
        if (isPickerActive && event.data.text) {
          handleAddTriggerButton(event.data.text);
          setIsPickerActive(false);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isPickerActive, triggerButtons]);

  // PUBLIC STANDALONE SUBDOMAIN VIEW
  if (isPublicView) {
    return (
      <div className="w-screen h-screen overflow-hidden bg-[#FAFAFC] relative font-sans">
        <iframe
          srcDoc={processedHtmlCode}
          title="Live Landing Page"
          className="w-full h-full border-0 block"
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
          loading="eager"
        />

        <ThreePopupFunnelModal
          isOpen={isPopupFunnelOpen}
          onClose={() => setIsPopupFunnelOpen(false)}
          funnelId={initialWorkspace?.id}
          userId={initialWorkspace?.user_id}
          surveyQuestions={
            surveyQuestions && surveyQuestions.length > 0
              ? surveyQuestions
              : initialWorkspace?.survey_questions
          }
          popupTheme={popupTheme?.primaryColor ? popupTheme : initialWorkspace?.popup_theme}
          onStep1Complete={(lead) => {
            console.log('Step 1 contact saved via subdomain funnel:', lead);
          }}
          onComplete={(lead) => {
            console.log('Full meeting booked via subdomain funnel:', lead);
          }}
        />
      </div>
    );
  }

  // ADMIN STUDIO VIEW
  return (
    <MainLayout>
      {/* Toast Notification Banner */}
      {supabaseToastMsg && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="px-3.5 py-2 rounded-xl bg-[#111827] text-white text-xs font-medium shadow-lg flex items-center gap-2 border border-gray-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{supabaseToastMsg}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
              Landing Page
            </h1>
            <Badge variant="success" className="gap-1 py-0.5 px-2 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Subdomain
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
            Manage your high-converting landing page, funnel triggers, and custom subdomain host.
          </p>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTemplateModalOpen(true)}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
            className="text-xs font-bold bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
          >
            🎨 Browse Templates
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsShareModalOpen(true)}
            leftIcon={<Share2 className="w-3.5 h-3.5 text-indigo-600" />}
            className="text-xs font-semibold bg-indigo-50/50 hover:bg-indigo-100/80 text-indigo-700 border-indigo-200"
          >
            Share Page & Design
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            leftIcon={<Download className="w-3.5 h-3.5 text-indigo-600" />}
            className="text-xs font-semibold hover:bg-gray-100"
          >
            Import Shared Design
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncToSupabase}
            isLoading={isSavingSupabase}
            leftIcon={<Database className="w-3.5 h-3.5 text-gray-500" />}
            className="text-xs font-medium"
          >
            Sync Supabase
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditorOpen(true)}
            leftIcon={<Code2 className="w-3.5 h-3.5 text-gray-500" />}
            className="text-xs font-medium"
          >
            Edit Code
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/landing/customize')}
            leftIcon={<Maximize2 className="w-3.5 h-3.5" />}
            className="text-xs font-semibold"
          >
            Full Studio
          </Button>
        </div>
      </div>

      {/* Subdomain & Quick Status Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Domain Details */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F5F6F8] border border-[#E5E7EB] text-xs">
            <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="text-[#6B7280]">https://</span>
            <span className="font-semibold text-[#111827]">{subdomain}.firstoption.cloud</span>
            <button
              onClick={handleCopyLiveUrl}
              className="ml-1 text-gray-400 hover:text-gray-700 transition-colors p-0.5 rounded cursor-pointer"
              title="Copy URL"
            >
              {isCopiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <a
              href={`https://${subdomain}.firstoption.cloud`}
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-indigo-600 transition-colors p-0.5 rounded"
              title="Open in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            onClick={() => setIsDomainModalOpen(true)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
          >
            Domain Settings
          </button>
        </div>

        {/* Right: Quick route shortcuts & Trigger manager toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const next = !showTriggerBar;
              setShowTriggerBar(next);
              if (isPickerActive && !next) setIsPickerActive(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
              showTriggerBar
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                : 'bg-white border-[#E5E7EB] text-[#111827] hover:bg-gray-50'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span>Triggers ({triggerButtons.length})</span>
            {showTriggerBar ? <ChevronUp className="w-3 h-3 text-indigo-500" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
          </button>

          <a
            href="/survey"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1.5 rounded-xl bg-[#F5F6F8] border border-[#E5E7EB] text-[#111827] text-xs font-medium flex items-center gap-1 hover:bg-gray-100 transition-colors"
          >
            <span>/survey</span>
            <ExternalLink className="w-3 h-3 text-[#6B7280]" />
          </a>

          <a
            href="/meeting"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1.5 rounded-xl bg-[#F5F6F8] border border-[#E5E7EB] text-[#111827] text-xs font-medium flex items-center gap-1 hover:bg-gray-100 transition-colors"
          >
            <span>/meeting</span>
            <ExternalLink className="w-3 h-3 text-[#6B7280]" />
          </a>
        </div>
      </div>

      {/* Trigger Buttons Manager Card */}
      {showTriggerBar && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-2xs space-y-3 animate-in fade-in zoom-in-98 duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#E5E7EB]">
            <div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-[#111827]">
                  Interactive Popup Triggers ({triggerButtons.length})
                </h2>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Buttons with these exact labels in your landing page will automatically launch the 3-step popup flow.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const nextState = !isPickerActive;
                  setIsPickerActive(nextState);
                  if (nextState) {
                    showToast('Click ANY button in the preview below to capture it! 🎯');
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isPickerActive
                    ? 'bg-indigo-600 text-white shadow-xs animate-pulse'
                    : 'bg-[#F5F6F8] border border-[#E5E7EB] text-[#111827] hover:bg-gray-100'
                }`}
              >
                <Target className={`w-3.5 h-3.5 ${isPickerActive ? 'text-white' : 'text-indigo-600'}`} />
                <span>{isPickerActive ? 'Picking (Click on Preview)...' : 'Pick from Preview'}</span>
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveTriggersToSupabase}
                isLoading={isSavingSupabase}
                leftIcon={<Save className="w-3.5 h-3.5 text-gray-500" />}
                className="text-xs font-medium"
              >
                Save
              </Button>
            </div>
          </div>

          {/* Add Trigger Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={manualTriggerInput}
              onChange={(e) => setManualTriggerInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTriggerButton(manualTriggerInput);
              }}
              placeholder="Enter exact button text (e.g. 'Book Strategy Session')..."
              className="flex-1 px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl text-[#111827] placeholder:text-[#6B7280]/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAddTriggerButton(manualTriggerInput)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs font-medium shrink-0"
            >
              Add Trigger
            </Button>
          </div>

          {/* Active Trigger Badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {triggerButtons.map((trigText, idx) => (
              <div
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-[#F5F6F8] border border-[#E5E7EB] text-[#111827] text-xs font-medium flex items-center gap-2 hover:border-gray-300 transition-colors"
              >
                <span className="text-[#6B7280] text-[10px]">#{idx + 1}</span>
                <span>"{trigText}"</span>
                <button
                  onClick={() => handleRemoveTriggerButton(idx)}
                  className="text-[#6B7280] hover:text-rose-600 p-0.5 rounded transition-colors"
                  title="Remove Trigger"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            {triggerButtons.length === 0 && (
              <p className="text-xs text-[#6B7280] italic">
                No custom triggers defined. Default trigger phrases like "Book", "Schedule", "Strategy" are active.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Live Preview Container Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-2xs">
        {/* Frame Top Header */}
        <div className="px-4 py-2.5 bg-[#F5F6F8] border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
          {/* Traffic Dots & Address Bar */}
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB] border border-gray-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB] border border-gray-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB] border border-gray-300" />
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-[#E5E7EB] text-xs text-[#6B7280] max-w-xs w-full truncate">
              <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="text-[#6B7280]/60">https://</span>
              <span className="font-medium text-[#111827] truncate">{subdomain}.firstoption.cloud</span>
            </div>

            <button
              onClick={() => setIframeKey((prev) => prev + 1)}
              className="p-1 text-gray-400 hover:text-gray-700 transition-colors rounded hover:bg-gray-200"
              title="Refresh Preview"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Segmented Device Viewport Switcher */}
          <div className="flex items-center p-0.5 bg-gray-200/70 rounded-xl border border-gray-200">
            <button
              onClick={() => setViewport('desktop')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewport === 'desktop'
                  ? 'bg-white text-[#111827] shadow-2xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>

            <button
              onClick={() => setViewport('tablet')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewport === 'tablet'
                  ? 'bg-white text-[#111827] shadow-2xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>

            <button
              onClick={() => setViewport('mobile')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewport === 'mobile'
                  ? 'bg-white text-[#111827] shadow-2xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
              title="Mobile Device (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Flow Test Action */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPopupFunnelOpen(true)}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
              className="text-xs font-medium"
            >
              Test Popup Flow
            </Button>
          </div>
        </div>

        {/* Live Iframe Sandbox Preview Area */}
        <div className="p-4 sm:p-6 bg-[#F5F6F8] min-h-[750px] flex items-center justify-center overflow-x-auto relative">
          {!isPublicView && !workspace ? (
            <div className="w-full h-[700px] flex flex-col items-center justify-center bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
              <div className="w-8 h-8 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin" />
              <p className="text-xs font-semibold text-[#6B7280]">
                Loading your private landing page design from Supabase...
              </p>
            </div>
          ) : (
            <>
              {isPickerActive && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full bg-[#111827] text-white text-xs font-medium shadow-xl flex items-center gap-2 border border-gray-700 animate-bounce">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  <span>Click any button in preview to add to Triggers</span>
                </div>
              )}

              {viewport === 'desktop' && (
                <div className="w-full shadow-sm rounded-xl overflow-hidden bg-white border border-[#E5E7EB]">
                  <iframe
                    key={iframeKey}
                    srcDoc={processedHtmlCode}
                    title="Live Landing Page Preview Desktop"
                    className="w-full h-[750px] border-0 block"
                    sandbox="allow-scripts allow-forms"
                  />
                </div>
              )}

          {viewport === 'tablet' && (
            <div className="w-[768px] max-w-[768px] h-[750px] shrink-0 shadow-2xl rounded-[32px] overflow-hidden bg-[#0F172A] p-3 border-[6px] border-[#1E293B] my-4 relative flex flex-col">
              <div className="w-full h-full rounded-[22px] overflow-hidden bg-white relative flex flex-col">
                <iframe
                  key={iframeKey}
                  srcDoc={processedHtmlCode}
                  title="Live Landing Page Preview Tablet"
                  className="w-full h-full border-0 block flex-1"
                  style={{ width: '100%', height: '100%', minHeight: '100%' }}
                  sandbox="allow-scripts allow-forms"
                />
              </div>
            </div>
          )}

          {viewport === 'mobile' && (
            <div className="w-[380px] max-w-[380px] h-[750px] shrink-0 shadow-2xl rounded-[48px] overflow-hidden bg-[#0F172A] p-3 border-[6px] border-[#1E293B] my-4 relative flex flex-col items-center">
              {/* Dynamic Island Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-20 flex items-center justify-between px-2.5 shadow-md pointer-events-none">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1E293B] border border-slate-700/60" />
                <div className="w-2 h-2 rounded-full bg-blue-900/40" />
              </div>

              {/* Screen Display */}
              <div className="w-full h-full rounded-[38px] overflow-hidden bg-white relative flex flex-col">
                <iframe
                  key={iframeKey}
                  srcDoc={processedHtmlCode}
                  title="Live Landing Page Preview Mobile"
                  className="w-full h-full border-0 block flex-1 pt-4"
                  style={{ width: '100%', height: '100%', minHeight: '100%' }}
                  sandbox="allow-scripts allow-forms"
                />
              </div>

              {/* Home Bar */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/50 rounded-full z-20 pointer-events-none" />
            </div>
          )}
          </>
          )}
        </div>
      </div>

      <HtmlCodeEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        htmlCode={htmlCode}
        onSave={handleSaveHtml}
      />

      <CustomDomainModal
        isOpen={isDomainModalOpen}
        onClose={() => setIsDomainModalOpen(false)}
        currentSubdomain={subdomain}
        currentDomain={customDomain}
        onSaveDomain={handleSaveDomain}
      />

      <ThreePopupFunnelModal
        isOpen={isPopupFunnelOpen}
        onClose={() => setIsPopupFunnelOpen(false)}
        funnelId={workspace?.id}
        userId={user?.id}
        surveyQuestions={surveyQuestions}
        popupTheme={popupTheme}
        onComplete={(lead) => {
          console.log('Lead captured via 3-Popup funnel:', lead);
        }}
      />

      <LandingTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleApplyTemplate}
      />

      <ShareLandingModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        subdomain={subdomain}
        customDomain={customDomain}
        htmlCode={htmlCode}
        triggerButtons={triggerButtons}
        popupTheme={popupTheme}
        surveyQuestions={surveyQuestions}
      />

      <ImportSharedDesignModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        initialShareCode={importShareCode}
        onApplyToWorkspace={handleApplyImportedDesign}
      />
    </MainLayout>
  );
}

