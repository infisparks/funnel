'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button, Card, Badge } from '@/components/ui';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import {
  Code2,
  Globe,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Lock,
  Zap,
  Save,
  CheckCircle2,
  Database,
} from 'lucide-react';
import { DEFAULT_LANDING_HTML } from '@/lib/defaultLandingHtml';
import { HtmlCodeEditorModal } from '@/components/landing/HtmlCodeEditorModal';
import { CustomDomainModal } from '@/components/landing/CustomDomainModal';
import { ThreePopupFunnelModal } from '@/components/funnel/ThreePopupFunnelModal';

// Helper function to synchronously determine public view state with ZERO flicker
function checkIsPublicHostname(subdomainQuery?: string | null, isPublicParam?: boolean) {
  if (isPublicParam || !!subdomainQuery) return true;

  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    const search = new URLSearchParams(window.location.search);

    const isMainAdminHost =
      (host === 'firstoption.cloud' ||
        host === 'www.firstoption.cloud' ||
        host.includes('localhost') ||
        host.includes('vercel.app')) &&
      !search.has('subdomain') &&
      !search.has('isPublic');

    return !isMainAdminHost;
  }

  // Default to true on SSR so public subdomain visitors never see CRM layout
  return true;
}

function LandingPageContent() {
  const searchParams = useSearchParams();
  const subdomainQuery = searchParams.get('subdomain');
  const domainQuery = searchParams.get('domain');
  const isPublicParam = searchParams.get('isPublic') === 'true';

  // Synchronously compute initial public state (defaults to true for subdomains)
  const [isPublicSubdomain, setIsPublicSubdomain] = useState(() =>
    checkIsPublicHostname(subdomainQuery, isPublicParam)
  );

  const [activeSubdomain, setActiveSubdomain] = useState(subdomainQuery || '');

  const { accentColor } = useTheme();
  const { user, workspace, saveWorkspaceConfig } = useAuth();

  // State for HTML code, custom domain, viewports, and modals
  const [htmlCode, setHtmlCode] = useState(DEFAULT_LANDING_HTML);
  const [customDomain, setCustomDomain] = useState('firstoption.cloud');
  const [subdomain, setSubdomain] = useState('client1');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [isPopupFunnelOpen, setIsPopupFunnelOpen] = useState(false);
  const [isSavingSupabase, setIsSavingSupabase] = useState(false);
  const [supabaseToastMsg, setSupabaseToastMsg] = useState('');

  // Public subdomain tenant details
  const [tenantWorkspace, setTenantWorkspace] = useState<any>(null);

  // Synchronously update public flag on client window check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname.toLowerCase();
      const search = new URLSearchParams(window.location.search);

      let extractedSub = search.get('subdomain') || '';
      if (!extractedSub && host.endsWith('.firstoption.cloud')) {
        extractedSub = host.replace('.firstoption.cloud', '');
      }

      const isMainAdminHost =
        (host === 'firstoption.cloud' ||
          host === 'www.firstoption.cloud' ||
          host.includes('localhost') ||
          host.includes('vercel.app')) &&
        !search.has('subdomain') &&
        !search.has('isPublic');

      setIsPublicSubdomain(!isMainAdminHost);

      if (extractedSub && extractedSub !== 'www') {
        setActiveSubdomain(extractedSub);
      }
    }
  }, [subdomainQuery, domainQuery]);

  // Load from Supabase workspace single-row record
  useEffect(() => {
    async function fetchSubdomainWorkspace() {
      const targetSub = activeSubdomain || subdomainQuery;
      if (targetSub) {
        try {
          console.log('[Subdomain Router] Querying Supabase for subdomain:', targetSub);
          const { data, error } = await supabase
            .from('funnel_workspaces')
            .select('*')
            .eq('subdomain', targetSub)
            .maybeSingle();

          if (data) {
            console.log('[Subdomain Router] Found workspace for subdomain:', data);
            setTenantWorkspace(data);
            if (data.landing_html) setHtmlCode(data.landing_html);
            if (data.custom_domain) setCustomDomain(data.custom_domain);
            return;
          }
        } catch (err) {
          console.error('Error fetching public subdomain workspace:', err);
        }
      }

      // Fallback 1: Query the latest saved workspace from Supabase for public visitors
      if (isPublicSubdomain) {
        try {
          console.log('[Subdomain Router] Querying latest workspace fallback from Supabase');
          const { data: latestWorkspace } = await supabase
            .from('funnel_workspaces')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (latestWorkspace) {
            console.log('[Subdomain Router] Loaded latest workspace fallback:', latestWorkspace);
            setTenantWorkspace(latestWorkspace);
            if (latestWorkspace.landing_html) setHtmlCode(latestWorkspace.landing_html);
            if (latestWorkspace.custom_domain) setCustomDomain(latestWorkspace.custom_domain);
            return;
          }
        } catch (err) {
          console.error('Error fetching fallback workspace:', err);
        }
      }

      // Admin user workspace in CRM studio
      if (workspace) {
        if (workspace.landing_html) setHtmlCode(workspace.landing_html);
        if (workspace.custom_domain) setCustomDomain(workspace.custom_domain);
        if (workspace.subdomain) setSubdomain(workspace.subdomain);
      } else {
        const savedHtml = localStorage.getItem('landing_custom_html');
        if (savedHtml) setHtmlCode(savedHtml);

        const savedDomain = localStorage.getItem('landing_custom_domain');
        if (savedDomain) setCustomDomain(savedDomain);
      }
    }

    fetchSubdomainWorkspace();
  }, [workspace, activeSubdomain, subdomainQuery, isPublicSubdomain]);

  const showToast = (message: string) => {
    setSupabaseToastMsg(message);
    setTimeout(() => setSupabaseToastMsg(''), 4000);
  };

  const handleSaveHtml = async (newCode: string) => {
    setHtmlCode(newCode);
    localStorage.setItem('landing_custom_html', newCode);
    setIsSavingSupabase(true);
    const ok = await saveWorkspaceConfig({ landing_html: newCode, subdomain: activeSubdomain || subdomain, custom_domain: customDomain });
    setIsSavingSupabase(false);
    if (ok) {
      showToast('Landing Page HTML successfully saved to Supabase (funnel_workspaces table)! ✅');
    }
  };

  const handleSaveDomain = async (newDomain: string) => {
    setCustomDomain(newDomain);
    localStorage.setItem('landing_custom_domain', newDomain);
    setIsSavingSupabase(true);
    const ok = await saveWorkspaceConfig({ landing_html: htmlCode, subdomain: activeSubdomain || subdomain, custom_domain: newDomain });
    setIsSavingSupabase(false);
    if (ok) {
      showToast('Custom Domain configuration saved to Supabase table! 🌐');
    }
  };

  const handleSyncToSupabase = async () => {
    setIsSavingSupabase(true);
    const ok = await saveWorkspaceConfig({
      landing_html: htmlCode,
      subdomain: activeSubdomain || subdomain,
      custom_domain: customDomain,
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

    // Inject trigger script so any button or link inside custom HTML triggers the 3-Popup Funnel
    const triggerScript = `
      <script>
        document.addEventListener('click', function(e) {
          const target = e.target.closest('a, button, input[type="submit"]');
          if (target && !target.dataset.noPopup) {
            e.preventDefault();
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

  // Listen to postMessage from iframe to open 3-popup lead capture modal
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'OPEN_FUNNEL_POPUP') {
        setIsPopupFunnelOpen(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // =========================================================================
  // PUBLIC STANDALONE SUBDOMAIN LANDING PAGE VIEW (ZERO CRM FLICKER)
  // =========================================================================
  if (isPublicSubdomain) {
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
          funnelId={tenantWorkspace?.id}
          userId={tenantWorkspace?.user_id}
          surveyQuestions={tenantWorkspace?.survey_questions}
          onComplete={(lead) => {
            console.log('Lead captured via subdomain funnel:', lead);
          }}
        />
      </div>
    );
  }

  // =========================================================================
  // ADMIN STUDIO VIEW (WITH SIDEBAR, HEADER, AND CODE EDITORS)
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
            Custom HTML landing page renderer, 3-popup lead survey engine, and single-row Supabase workspace config.
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sync to Supabase Row Button */}
          <Button
            variant="outline"
            onClick={handleSyncToSupabase}
            isLoading={isSavingSupabase}
            leftIcon={<Database className="w-4 h-4 text-emerald-600" />}
          >
            <span>Sync to Supabase Table</span>
          </Button>

          {/* Test 3-Popup Funnel Modal Button */}
          <Button
            variant="secondary"
            onClick={() => setIsPopupFunnelOpen(true)}
            leftIcon={<Zap className="w-4 h-4 text-amber-500" />}
          >
            <span>Test 3-Popup Funnel</span>
          </Button>

          {/* Custom Domain Selector */}
          <button
            onClick={() => setIsDomainModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-50 text-xs font-bold text-gray-800 shadow-2xs transition-all cursor-pointer"
          >
            <Globe className="w-4 h-4 text-indigo-600" />
            <span className="font-mono text-gray-900">https://{activeSubdomain || subdomain}.firstoption.cloud</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </button>

          {/* Edit HTML Code Button */}
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

      {/* Live Preview Container Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl overflow-hidden shadow-2xs">
        {/* Browser / Viewport Control Header */}
        <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
          {/* Left: Window Dots & Address Bar */}
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 max-w-sm w-full truncate shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-gray-400">https://</span>
              <span className="font-semibold text-gray-800 truncate">{activeSubdomain || subdomain}.firstoption.cloud</span>
            </div>
          </div>

          {/* Center: Viewport Switcher Buttons */}
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

          {/* Right: Quick Actions */}
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
        <div className="p-4 sm:p-8 bg-[#E2E8F0]/50 min-h-[750px] flex items-center justify-center overflow-x-auto">
          {/* DESKTOP VIEWPORT */}
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

          {/* TABLET VIEWPORT */}
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

          {/* REAL SMARTPHONE MOBILE VIEWPORT (iPHONE / ANDROID DEVICE MOCKUP) */}
          {viewport === 'mobile' && (
            <div className="w-[375px] shrink-0 shadow-2xl rounded-[48px] overflow-hidden bg-gray-900 border-[12px] border-gray-900 my-4 relative flex flex-col items-center">
              {/* Dynamic Island / Speaker Notch Bar */}
              <div className="w-full bg-gray-900 py-2.5 flex items-center justify-center z-10 shrink-0">
                <div className="w-28 h-4 bg-black rounded-full flex items-center justify-end px-2">
                  <div className="w-2 h-2 rounded-full bg-blue-900/60" />
                </div>
              </div>

              {/* Smartphone Viewport Display */}
              <div className="w-full h-[680px] bg-white overflow-hidden flex-1 relative">
                <iframe
                  srcDoc={processedHtmlCode}
                  title="Live Landing Page Preview Mobile"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-forms"
                />
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="w-full bg-gray-900 py-2 flex items-center justify-center z-10 shrink-0">
                <div className="w-32 h-1 bg-gray-500 rounded-full" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Code Editor Modal */}
      <HtmlCodeEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        htmlCode={htmlCode}
        onSave={handleSaveHtml}
      />

      {/* Custom Domain Modal */}
      <CustomDomainModal
        isOpen={isDomainModalOpen}
        onClose={() => setIsDomainModalOpen(false)}
        currentDomain={customDomain}
        onSaveDomain={handleSaveDomain}
      />

      {/* 3-Popup Funnel Modal Engine */}
      <ThreePopupFunnelModal
        isOpen={isPopupFunnelOpen}
        onClose={() => setIsPopupFunnelOpen(false)}
        funnelId={workspace?.id}
        userId={user?.id}
        surveyQuestions={workspace?.survey_questions}
        onComplete={(lead) => {
          console.log('Lead captured via 3-Popup funnel:', lead);
        }}
      />
    </MainLayout>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8146F0] font-bold">Loading Landing Page...</div>}>
      <LandingPageContent />
    </Suspense>
  );
}
