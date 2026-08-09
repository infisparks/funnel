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

  // Initialize state directly with server-fetched HTML code (0ms delay)
  const [htmlCode, setHtmlCode] = useState(initialHtmlCode || DEFAULT_LANDING_HTML);
  const [customDomain, setCustomDomain] = useState(initialWorkspace?.custom_domain || 'firstoption.cloud');
  const [subdomain, setSubdomain] = useState(subdomainName || initialWorkspace?.subdomain || 'client1');
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>(
    initialWorkspace?.survey_questions || []
  );

  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isPopupFunnelOpen, setIsPopupFunnelOpen] = useState(false);
  const [isSavingSupabase, setIsSavingSupabase] = useState(false);
  const [supabaseToastMsg, setSupabaseToastMsg] = useState('');

  // Target Button Trigger Picker state
  const [isPickerActive, setIsPickerActive] = useState(false);
  const [selectedButtonText, setSelectedButtonText] = useState<string | null>(null);

  // Sync workspace state if logged in admin updates workspace
  useEffect(() => {
    if (!isPublicView && workspace) {
      if (workspace.landing_html) setHtmlCode(workspace.landing_html);
      if (workspace.custom_domain) setCustomDomain(workspace.custom_domain);
      if (workspace.subdomain) setSubdomain(workspace.subdomain);
      if (workspace.survey_questions) setSurveyQuestions(workspace.survey_questions);
    }
  }, [workspace, isPublicView]);

  const showToast = (message: string) => {
    setSupabaseToastMsg(message);
    setTimeout(() => setSupabaseToastMsg(''), 4000);
  };

  const handleSaveHtml = async (newCode: string) => {
    setHtmlCode(newCode);
    localStorage.setItem('landing_custom_html', newCode);
    setIsSavingSupabase(true);
    const ok = await saveWorkspaceConfig({ landing_html: newCode, subdomain, custom_domain: customDomain });
    setIsSavingSupabase(false);
    if (ok) {
      showToast('Landing Page HTML successfully saved to Supabase (funnel_workspaces table)! ✅');
    }
  };

  const handleSaveDomain = async (newDomain: string) => {
    setCustomDomain(newDomain);
    localStorage.setItem('landing_custom_domain', newDomain);
    setIsSavingSupabase(true);
    const ok = await saveWorkspaceConfig({ landing_html: htmlCode, subdomain, custom_domain: newDomain });
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
    });
    setIsSavingSupabase(false);
    if (ok) {
      showToast('Synced workspace configuration to Supabase table! 🚀');
    }
  };

  // Helper: Auto-inject viewport meta tag and click event listener to trigger 3-Popup funnel
  const processedHtmlCode = useMemo(() => {
    if (!htmlCode) return '';
    let code = htmlCode;

    // Inject trigger script so buttons trigger 3-Popup Flow & picker mode highlights buttons on click
    const triggerScript = `
      <script>
        document.addEventListener('click', function(e) {
          const target = e.target.closest('a, button, input[type="submit"]');
          if (target && !target.dataset.noPopup) {
            e.preventDefault();
            const text = (target.textContent || '').trim();
            window.parent.postMessage({ type: 'BUTTON_CLICKED', text: text }, '*');
            window.parent.postMessage('OPEN_FUNNEL_POPUP', '*');
          }
        });
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
  }, [htmlCode]);

  // Listen to postMessage from iframe to open 3-popup lead capture modal & register picked button
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'OPEN_FUNNEL_POPUP') {
        setIsPopupFunnelOpen(true);
      } else if (event.data?.type === 'BUTTON_CLICKED') {
        if (isPickerActive) {
          setSelectedButtonText(event.data.text);
          setIsPickerActive(false);
          showToast(`Target Trigger Button Set: "${event.data.text}" 🎯`);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isPickerActive]);

  // =========================================================================
  // PUBLIC STANDALONE SUBDOMAIN LANDING PAGE VIEW (ZERO DELAY SERVER RENDER)
  // =========================================================================
  if (isPublicView) {
    return (
      <div className="w-screen h-screen overflow-hidden bg-white relative">
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
  // ADMIN STUDIO VIEW (WITH SIDEBAR, HEADER, AND SEPARATE ROUTE LINKS)
  // =========================================================================
  return (
    <MainLayout>
      {/* Supabase Success Toast Notification Floating Banner */}
      {supabaseToastMsg && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-4 rounded-2xl bg-[#059669] text-white font-bold text-xs shadow-2xl flex items-center gap-3 border border-emerald-400">
            <Database className="w-5 h-5 text-emerald-200" />
            <span>{supabaseToastMsg}</span>
          </div>
        </div>
      )}

      {/* Top Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
              Landing Page Studio & Subdomain Host
            </h1>
            <Badge variant="success">Supabase Sync Live</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Custom HTML landing page renderer, 3-popup lead survey engine, and separate page routes (`/survey`, `/meeting`).
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handleSyncToSupabase}
            isLoading={isSavingSupabase}
            leftIcon={<Database className="w-4 h-4 text-emerald-600" />}
          >
            <span>Sync to Supabase Table</span>
          </Button>

          {/* Interactive Trigger Button Picker */}
          <button
            onClick={() => {
              setIsPickerActive(!isPickerActive);
              if (!isPickerActive) {
                showToast('Click any button in the live preview below to select it as trigger! 🎯');
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPickerActive
                ? 'bg-amber-500 text-black border border-amber-600 shadow-md animate-pulse'
                : 'bg-white border border-[#E5E7EB] hover:bg-gray-50 text-gray-800 shadow-2xs'
            }`}
          >
            <Target className="w-4 h-4 text-amber-500" />
            <span>{isPickerActive ? 'Click Button in Preview Below...' : 'Pick Trigger Button 🎯'}</span>
          </button>

          {/* Separate Route Links Badge */}
          <a
            href="/survey"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1 hover:bg-amber-100 transition-colors shadow-2xs"
          >
            <span>/survey</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
          </a>

          <a
            href="/meeting"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1 hover:bg-emerald-100 transition-colors shadow-2xs"
          >
            <span>/meeting</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
          </a>

          <Button
            variant="secondary"
            onClick={() => setIsSurveyModalOpen(true)}
            leftIcon={<ListOrdered className="w-4 h-4 text-amber-500" />}
          >
            <span>Customize Survey Form</span>
          </Button>

          <button
            onClick={() => setIsDomainModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-50 text-xs font-bold text-gray-800 shadow-2xs transition-all cursor-pointer"
          >
            <Globe className="w-4 h-4 text-indigo-600" />
            <span className="font-mono text-gray-900">https://{subdomain}.firstoption.cloud</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </button>

          <Button
            variant="primary"
            onClick={() => setIsEditorOpen(true)}
            leftIcon={<Code2 className="w-4 h-4" />}
            className="shadow-md"
          >
            <span>Edit HTML Code</span>
          </Button>
        </div>
      </div>

      {/* Selected Target Button Indicator Banner */}
      {selectedButtonText && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-bold flex items-center justify-between shadow-2xs mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-600" />
            <span>Designated Popup Trigger Button: <span className="font-mono font-extrabold text-amber-700">"{selectedButtonText}"</span></span>
          </div>
          <button
            onClick={() => setSelectedButtonText(null)}
            className="text-amber-700 hover:text-amber-900 underline text-[11px]"
          >
            Reset
          </button>
        </div>
      )}

      {/* Live Preview Container Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl overflow-hidden shadow-2xs">
        <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 max-w-sm w-full truncate shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-gray-400">https://</span>
              <span className="font-semibold text-gray-800 truncate">{subdomain}.firstoption.cloud</span>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-gray-200/60 rounded-xl">
            <button
              onClick={() => setViewport('desktop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewport === 'desktop'
                  ? 'bg-white text-[#8146F0] shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Desktop</span>
            </button>

            <button
              onClick={() => setViewport('tablet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewport === 'tablet'
                  ? 'bg-white text-[#8146F0] shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-4 h-4" />
              <span className="hidden sm:inline">Tablet</span>
            </button>

            <button
              onClick={() => setViewport('mobile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewport === 'mobile'
                  ? 'bg-white text-[#8146F0] shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Mobile Device (iPhone / Android 375px)"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Mobile (iPhone/Android)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPopupFunnelOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-xs font-bold text-indigo-700 flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch 3-Popup Flow</span>
            </button>

            <button
              onClick={() => setIsEditorOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Paste HTML</span>
            </button>
          </div>
        </div>

        {/* Live Iframe Sandbox Preview Area */}
        <div className="p-4 sm:p-8 bg-[#E2E8F0]/50 min-h-[750px] flex items-center justify-center overflow-x-auto relative">
          {isPickerActive && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-amber-500 text-black font-extrabold text-xs shadow-xl animate-bounce flex items-center gap-2 border border-amber-400">
              <Target className="w-4 h-4" />
              <span>Click the CTA button in the landing page below to set as Popup Trigger!</span>
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
