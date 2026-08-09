'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button, Card, Badge, SectionHeader } from '@/components/ui';
import { useTheme } from '@/components/theme/ThemeProvider';
import {
  Code2,
  Globe,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Lock,
  Layers,
  Zap,
} from 'lucide-react';
import { DEFAULT_LANDING_HTML } from '@/lib/defaultLandingHtml';
import { HtmlCodeEditorModal } from '@/components/landing/HtmlCodeEditorModal';
import { CustomDomainModal } from '@/components/landing/CustomDomainModal';
import { ThreePopupFunnelModal } from '@/components/funnel/ThreePopupFunnelModal';

export default function LandingPage() {
  const { accentColor } = useTheme();

  // State for HTML code, custom domain, viewports, and modals
  const [htmlCode, setHtmlCode] = useState(DEFAULT_LANDING_HTML);
  const [customDomain, setCustomDomain] = useState('funnel.mycompany.com');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [isPopupFunnelOpen, setIsPopupFunnelOpen] = useState(false);

  // Load from localStorage if present
  useEffect(() => {
    const savedHtml = localStorage.getItem('landing_custom_html');
    if (savedHtml) setHtmlCode(savedHtml);

    const savedDomain = localStorage.getItem('landing_custom_domain');
    if (savedDomain) setCustomDomain(savedDomain);
  }, []);

  const handleSaveHtml = (newCode: string) => {
    setHtmlCode(newCode);
    localStorage.setItem('landing_custom_html', newCode);
  };

  const handleSaveDomain = (newDomain: string) => {
    setCustomDomain(newDomain);
    localStorage.setItem('landing_custom_domain', newDomain);
  };

  // Helper: Auto-inject viewport meta tag if missing to ensure proper mobile rendering
  const processedHtmlCode = useMemo(() => {
    if (!htmlCode) return '';
    let code = htmlCode;
    if (!code.includes('<meta name="viewport"')) {
      if (code.includes('<head>')) {
        code = code.replace('<head>', '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
      } else if (code.includes('<html>')) {
        code = code.replace('<html>', '<html>\n<head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>');
      } else {
        code = `<meta name="viewport" content="width=device-width, initial-scale=1.0">\n` + code;
      }
    }
    return code;
  }, [htmlCode]);

  return (
    <MainLayout>
      {/* Top Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
              Landing Page Studio & Subdomain Host
            </h1>
            <Badge variant="success">Supabase Ready</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Custom HTML landing page renderer, 3-popup lead survey engine, and subdomain hosting.
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
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
            <span className="font-mono text-gray-900">https://{customDomain}</span>
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
              <span className="font-semibold text-gray-800 truncate">{customDomain}</span>
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
                sandbox="allow-scripts allow-same-origin allow-forms"
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
                  sandbox="allow-scripts allow-same-origin allow-forms"
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
                  sandbox="allow-scripts allow-same-origin allow-forms"
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
        onComplete={(lead) => {
          console.log('Lead captured via 3-Popup funnel:', lead);
        }}
      />
    </MainLayout>
  );
}
