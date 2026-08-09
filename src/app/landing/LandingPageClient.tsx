'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
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
  CheckCircle2,
} from 'lucide-react';
import { DEFAULT_LANDING_HTML } from '@/lib/defaultLandingHtml';
import { HtmlCodeEditorModal } from '@/components/landing/HtmlCodeEditorModal';
import { CustomDomainModal } from '@/components/landing/CustomDomainModal';
import { ThreePopupFunnelModal } from '@/components/funnel/ThreePopupFunnelModal';
import { SurveyBuilderModal, SurveyQuestion } from '@/components/funnel/SurveyBuilderModal';

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
  const searchParams = useSearchParams();
  const { accentColor } = useTheme();
  const { user, workspace, saveWorkspaceConfig } = useAuth();

  // Initialize state directly with server-fetched HTML code & saved triggers from Supabase (0ms delay)
  const [htmlCode, setHtmlCode] = useState(initialHtmlCode || DEFAULT_LANDING_HTML);
  const [customDomain, setCustomDomain] = useState(initialWorkspace?.custom_domain || 'firstoption.cloud');
  const [subdomain, setSubdomain] = useState(subdomainName || initialWorkspace?.subdomain || 'client1');
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>(
    initialWorkspace?.survey_questions || []
  );

  // Array of exact full text trigger buttons saved in Supabase
  const [triggerButtons, setTriggerButtons] = useState<string[]>(
    initialWorkspace?.trigger_buttons || []
  );
  const [manualTriggerInput, setManualTriggerInput] = useState('');

  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isPopupFunnelOpen, setIsPopupFunnelOpen] = useState(false);
  const [isSavingSupabase, setIsSavingSupabase] = useState(false);
  const [supabaseToastMsg, setSupabaseToastMsg] = useState('');

  // Target Button Trigger Picker state & component visibility
  const [isPickerActive, setIsPickerActive] = useState(false);
  const [showTriggerBar, setShowTriggerBar] = useState(false);

  // Sync workspace state if logged in admin updates workspace
  useEffect(() => {
    if (!isPublicView && workspace) {
      if (workspace.landing_html) setHtmlCode(workspace.landing_html);
      if (workspace.custom_domain) setCustomDomain(workspace.custom_domain);
      if (workspace.subdomain) setSubdomain(workspace.subdomain);
      if (workspace.survey_questions) setSurveyQuestions(workspace.survey_questions);
      if (workspace.trigger_buttons) setTriggerButtons(workspace.trigger_buttons);
    }
  }, [workspace, isPublicView]);

  const showToast = (message: string) => {
    setSupabaseToastMsg(message);
    setTimeout(() => setSupabaseToastMsg(''), 4000);
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
    showToast(`Added & Saved Trigger to Supabase: "${trimmed}" 🎯`);
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
    });
    setIsSavingSupabase(false);
    if (ok) {
      showToast(`Successfully saved ${triggerButtons.length} triggers to Supabase table! 💾`);
    }
  };

  const handleSaveHtml = async (newCode: string) => {
    setHtmlCode(newCode);
    localStorage.setItem('landing_custom_html', newCode);
    setIsSavingSupabase(true);
    const ok = await saveWorkspaceConfig({ landing_html: newCode, subdomain, custom_domain: customDomain, trigger_buttons: triggerButtons });
    setIsSavingSupabase(false);
    if (ok) {
      showToast('Landing Page HTML successfully saved to Supabase (funnel_workspaces table)! ✅');
    }
  };

  const handleSaveDomain = async (newDomain: string) => {
    setCustomDomain(newDomain);
    localStorage.setItem('landing_custom_domain', newDomain);
    setIsSavingSupabase(true);
    const ok = await saveWorkspaceConfig({ landing_html: htmlCode, subdomain, custom_domain: newDomain, trigger_buttons: triggerButtons });
    setIsSavingSupabase(false);
    if (ok) {
      showToast('Custom Domain configuration saved to Supabase table! 🌐');
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
    });
    setIsSavingSupabase(false);
    if (ok) {
      showToast('Synced workspace configuration to Supabase table! 🚀');
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

            // Explicit opt-out
            if (target.dataset.noPopup === 'true') return;

            const clickedText = (target.textContent || '').trim();
            const fullText = clickedText.toLowerCase();

            // ALWAYS send BUTTON_CLICKED event to parent window so picker mode captures ANY clicked button!
            window.parent.postMessage({ type: 'BUTTON_CLICKED', text: clickedText }, '*');

            // If trigger list has items, match exact text. Otherwise default to action keywords if list is empty
            let matchesTrigger = false;

            if (validTriggers && validTriggers.length > 0) {
              matchesTrigger = target.dataset.popup === 'true' || validTriggers.some(function(trig) {
                return trig && (fullText === trig || fullText.indexOf(trig) !== -1);
              });
            } else {
              // Default CTA keywords fallback if user hasn't selected any specific triggers yet
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

  // Listen to postMessage from iframe to open 3-popup lead capture modal & register picked button
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

  // =========================================================================
  // PUBLIC STANDALONE SUBDOMAIN LANDING PAGE VIEW (ZERO DELAY SERVER RENDER)
  // =========================================================================
  if (isPublicView) {
    return (
      <div className="w-screen h-screen overflow-hidden bg-white relative font-sans">
        <iframe
          srcDoc={processedHtmlCode}
          title="Live Landing Page"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-forms"
        />

        {/* 3-Popup Lead Capture Funnel Modal Engine */}
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
          onComplete={(lead) => {
            console.log('Lead captured via subdomain funnel:', lead);
          }}
        />
      </div>
    );
  }

  // =========================================================================
  // ADMIN STUDIO VIEW (POPPINS FONT, COMPACT, HIGHLY RESPONSIVE PC/MOBILE UI)
  // =========================================================================
  return (
    <MainLayout>
      {/* Supabase Success Toast Notification Floating Banner */}
      {supabaseToastMsg && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-3.5 rounded-2xl bg-[#059669] text-white font-bold text-xs shadow-2xl flex items-center gap-2.5 border border-emerald-400">
            <Database className="w-4 h-4 text-emerald-200" />
            <span>{supabaseToastMsg}</span>
          </div>
        </div>
      )}

      {/* Top Header Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-1 font-sans">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#111827]">
              Landing Page Studio & Subdomain Host
            </h1>
            <Badge variant="success">Supabase Sync Live</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Full-text exact button trigger manager, custom survey form builder, and instant subdomain host.
          </p>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncToSupabase}
            isLoading={isSavingSupabase}
            leftIcon={<Database className="w-3.5 h-3.5 text-emerald-600" />}
          >
            <span>Sync Supabase</span>
          </Button>

          {/* Interactive Trigger Button Picker Toggle */}
          <button
            onClick={() => {
              const nextPickerState = !isPickerActive;
              setIsPickerActive(nextPickerState);
              setShowTriggerBar(true); // Reveal trigger bar when user clicks Pick Trigger Button
              if (nextPickerState) {
                showToast('Click ANY button in the live preview below to select it as trigger! 🎯');
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPickerActive
                ? 'bg-amber-500 text-black border border-amber-600 shadow-md animate-pulse font-extrabold'
                : 'bg-white border border-[#E5E7EB] hover:bg-gray-50 text-gray-800 shadow-2xs'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-amber-500" />
            <span>{isPickerActive ? 'Click ANY Button in Preview Below...' : 'Pick Trigger Button 🎯'}</span>
          </button>

          {/* Separate Route Badges */}
          <a
            href="/survey"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold flex items-center gap-1 hover:bg-amber-100 transition-colors shadow-2xs"
          >
            <span>/survey</span>
            <ExternalLink className="w-3 h-3 text-amber-600" />
          </a>

          <a
            href="/meeting"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-100 transition-colors shadow-2xs"
          >
            <span>/meeting</span>
            <ExternalLink className="w-3 h-3 text-emerald-600" />
          </a>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsSurveyModalOpen(true)}
            leftIcon={<ListOrdered className="w-3.5 h-3.5 text-amber-500" />}
          >
            <span>Customize Survey</span>
          </Button>

          <button
            onClick={() => setIsDomainModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-50 text-xs font-bold text-gray-800 shadow-2xs cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-mono text-gray-900 text-[11px]">https://{subdomain}.firstoption.cloud</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsEditorOpen(true)}
            leftIcon={<Code2 className="w-3.5 h-3.5" />}
          >
            <span>Edit HTML</span>
          </Button>
        </div>
      </div>

      {/* TRIGGER COMPONENT (HIDDEN BY DEFAULT - ONLY SHOWN WHEN USER CLICKS 'PICK TRIGGER BUTTON' OR HAS ACTIVE TRIGGERS) */}
      {(showTriggerBar || isPickerActive || triggerButtons.length > 0) && (
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-2.5 shadow-md font-sans animate-in fade-in zoom-in-98 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-extrabold tracking-wide text-white uppercase">
                Active Trigger Buttons List ({triggerButtons.length})
              </span>
              <span className="text-[10px] text-gray-400">
                Click any button in the preview to select & save to Supabase.
              </span>
            </div>

            {/* Add Manual Trigger Input & Save Triggers Button */}
            <div className="flex flex-wrap items-center gap-1.5">
              <input
                type="text"
                value={manualTriggerInput}
                onChange={(e) => setManualTriggerInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTriggerButton(manualTriggerInput);
                }}
                placeholder="Paste exact button text..."
                className="px-3 py-1 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={() => handleAddTriggerButton(manualTriggerInput)}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>

              {/* Save Triggers to Supabase Button */}
              <button
                onClick={handleSaveTriggersToSupabase}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm border border-emerald-400"
              >
                <Save className="w-3.5 h-3.5 text-emerald-200" />
                <span>Save Triggers 💾</span>
              </button>
            </div>
          </div>

          {/* Trigger Badges List */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {triggerButtons.map((trigText, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 font-extrabold text-xs flex items-center gap-2 shadow-2xs group hover:border-amber-500/50 transition-all"
              >
                <span className="text-gray-400 text-[10px]">#{idx + 1}</span>
                <span className="font-mono">"{trigText}"</span>
                <button
                  onClick={() => handleRemoveTriggerButton(idx)}
                  className="text-gray-400 hover:text-rose-400 p-0.5 rounded hover:bg-slate-700 transition-colors"
                  title="Delete Trigger"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {triggerButtons.length === 0 && (
              <span className="text-xs text-amber-400/80 italic font-semibold">
                No triggers selected yet. Click ANY button in the website preview below to select it!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Live Preview Container Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl overflow-hidden shadow-2xs font-sans">
        <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 max-w-sm w-full truncate shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-gray-400">https://</span>
              <span className="font-semibold text-gray-800 truncate">{subdomain}.firstoption.cloud</span>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-gray-200/60 rounded-xl">
            <button
              onClick={() => setViewport('desktop')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewport === 'desktop'
                  ? 'bg-white text-[#8146F0] shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>

            <button
              onClick={() => setViewport('tablet')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewport === 'tablet'
                  ? 'bg-white text-[#8146F0] shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>

            <button
              onClick={() => setViewport('mobile')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewport === 'mobile'
                  ? 'bg-white text-[#8146F0] shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Mobile Device (iPhone / Android 375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile (iPhone/Android)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPopupFunnelOpen(true)}
              className="px-3 py-1 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-xs font-bold text-indigo-700 flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch 3-Popup Flow</span>
            </button>

            <button
              onClick={() => setIsEditorOpen(true)}
              className="px-3 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Paste HTML</span>
            </button>
          </div>
        </div>

        {/* Live Iframe Sandbox Preview Area */}
        <div className="p-4 sm:p-6 bg-[#E2E8F0]/50 min-h-[750px] flex items-center justify-center overflow-x-auto relative">
          {isPickerActive && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-amber-500 text-black font-extrabold text-xs shadow-xl animate-bounce flex items-center gap-2 border border-amber-400">
              <Target className="w-4 h-4" />
              <span>Click ANY button in the preview below to ADD to Triggers List!</span>
            </div>
          )}

          {viewport === 'desktop' && (
            <div className="w-full shadow-lg rounded-2xl overflow-hidden bg-white border border-[#E5E7EB]">
              <iframe
                srcDoc={processedHtmlCode}
                title="Live Landing Page Preview Desktop"
                className="w-full h-[750px] border-0"
                sandbox="allow-scripts allow-forms"
              />
            </div>
          )}

          {viewport === 'tablet' && (
            <div className="w-[768px] shrink-0 shadow-2xl rounded-[32px] overflow-hidden bg-gray-900 p-3 border-[10px] border-gray-900 my-4">
              <div className="rounded-[22px] overflow-hidden bg-white">
                <iframe
                  srcDoc={processedHtmlCode}
                  title="Live Landing Page Preview Tablet"
                  className="w-full h-[720px] border-0"
                  sandbox="allow-scripts allow-forms"
                />
              </div>
            </div>
          )}

          {viewport === 'mobile' && (
            <div className="w-[375px] shrink-0 shadow-2xl rounded-[48px] overflow-hidden bg-gray-900 border-[12px] border-gray-900 my-4 relative flex flex-col items-center">
              <div className="w-full bg-gray-900 py-2.5 flex items-center justify-center z-10 shrink-0">
                <div className="w-28 h-4 bg-black rounded-full flex items-center justify-end px-2">
                  <div className="w-2 h-2 rounded-full bg-blue-900/60" />
                </div>
              </div>

              <div className="w-full h-[680px] bg-white overflow-hidden flex-1 relative">
                <iframe
                  srcDoc={processedHtmlCode}
                  title="Live Landing Page Preview Mobile"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-forms"
                />
              </div>

              <div className="w-full bg-gray-900 py-2 flex items-center justify-center z-10 shrink-0">
                <div className="w-32 h-1 bg-gray-500 rounded-full" />
              </div>
            </div>
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
        currentDomain={customDomain}
        onSaveDomain={handleSaveDomain}
      />

      <SurveyBuilderModal
        isOpen={isSurveyModalOpen}
        onClose={() => setIsSurveyModalOpen(false)}
        questions={surveyQuestions}
        onSaveQuestions={(newQ) => setSurveyQuestions(newQ)}
      />

      <ThreePopupFunnelModal
        isOpen={isPopupFunnelOpen}
        onClose={() => setIsPopupFunnelOpen(false)}
        funnelId={workspace?.id}
        userId={user?.id}
        surveyQuestions={surveyQuestions}
        onComplete={(lead) => {
          console.log('Lead captured via 3-Popup funnel:', lead);
        }}
      />
    </MainLayout>
  );
}
