'use client';

import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../auth/AuthContext';
import {
  Globe,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Sparkles,
  Database,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface CustomDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDomain: string;
  onSaveDomain: (domain: string) => void;
}

export function CustomDomainModal({
  isOpen,
  onClose,
  currentDomain,
  onSaveDomain,
}: CustomDomainModalProps) {
  const { accentColor } = useTheme();
  const { workspace, saveWorkspaceConfig } = useAuth();

  // State for subdomain (e.g. mudassir) and root host domain (firstoption.cloud)
  const [subdomainInput, setSubdomainInput] = useState(
    workspace?.subdomain || 'mudassir'
  );
  const [customDomainInput, setCustomDomainInput] = useState(
    currentDomain || 'firstoption.cloud'
  );

  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveSubdomain = async () => {
    const formattedSub = subdomainInput.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    setSubdomainInput(formattedSub);
    setIsVerifying(true);

    const fullDomain = `${formattedSub}.firstoption.cloud`;
    const success = await saveWorkspaceConfig({
      subdomain: formattedSub,
      custom_domain: customDomainInput || 'firstoption.cloud',
    });

    setIsVerifying(false);
    if (success) {
      setIsVerified(true);
      setSaveSuccess(true);
      onSaveDomain(fullDomain);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const generatedUrl = `https://${subdomainInput || 'mudassir'}.firstoption.cloud`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs"
              style={{ backgroundColor: accentColor.primary }}
            >
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#111827]">
                Subdomain & Custom Domain Setup
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Generate your live <span className="font-semibold text-indigo-600">.firstoption.cloud</span> subdomain & sync to Supabase.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {saveSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Subdomain saved to Supabase (funnel_workspaces table) & live! ✅</span>
            </div>
          )}

          {/* Section 1: Subdomain Generator Input (e.g. mudassir) */}
          <div className="space-y-3 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-indigo-900">
                1. Your Custom Subdomain Name
              </label>
              <span className="text-[11px] font-bold text-indigo-600">Hostinger Wildcard DNS Active</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="relative flex-1 flex items-center bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-2xs">
                <input
                  type="text"
                  value={subdomainInput}
                  onChange={(e) => {
                    setSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                    setIsVerified(false);
                  }}
                  placeholder="e.g. mudassir"
                  className="w-full px-3.5 py-2.5 text-sm text-[#111827] font-bold focus:outline-none"
                />
                <span className="px-3 text-xs font-mono font-bold text-gray-400 bg-gray-50 border-l border-gray-200 h-full flex items-center">
                  .firstoption.cloud
                </span>
              </div>

              <Button
                variant="primary"
                onClick={handleSaveSubdomain}
                isLoading={isVerifying}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Save & Live URL 🚀
              </Button>
            </div>

            {/* Generated Live URL Preview Box */}
            <div className="p-3 rounded-xl bg-white border border-indigo-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-xs font-mono font-bold text-indigo-700 truncate">
                  {generatedUrl}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(generatedUrl, 'suburl')}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs shrink-0 flex items-center gap-1"
              >
                {copiedField === 'suburl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'suburl' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Section 2: Custom External Domain (Optional) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              2. Custom External Domain (Optional)
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={customDomainInput}
                onChange={(e) => setCustomDomainInput(e.target.value)}
                placeholder="e.g. leads.mybrand.com or getdeal.io"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F5F6F8] text-xs text-[#111827] font-semibold focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Live Status Card */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isVerified ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-bold text-xs text-[#111827] flex items-center gap-2">
                  <span>{generatedUrl}</span>
                  <Badge variant={isVerified ? 'success' : 'warning'}>
                    {isVerified ? 'Live & Connected' : 'Pending DNS'}
                  </Badge>
                </div>
                <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <Database className="w-3 h-3 text-emerald-600" />
                  <span>Synced to Supabase Table (funnel_workspaces)</span>
                </div>
              </div>
            </div>

            {isVerified && (
              <a
                href={generatedUrl}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-gray-700 p-2"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            All subdomains route automatically via Next.js Middleware.
          </span>
          <Button variant="primary" size="md" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
