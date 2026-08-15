'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '@/lib/supabaseClient';
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
  Server,
  RefreshCw,
  ArrowRight,
  HelpCircle,
  Link2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface CustomDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubdomain: string;
  currentDomain?: string;
  onSaveDomain: (newSubdomain: string, newDomain?: string) => Promise<void> | void;
}

export function CustomDomainModal({
  isOpen,
  onClose,
  currentSubdomain,
  currentDomain = 'firstoption.cloud',
  onSaveDomain,
}: CustomDomainModalProps) {
  const { accentColor } = useTheme();
  const { user, workspace } = useAuth();

  // Active Tab: 'subdomain' | 'custom_domain'
  const [activeTab, setActiveTab] = useState<'subdomain' | 'custom_domain'>('subdomain');

  // Subdomain state
  const [subdomainInput, setSubdomainInput] = useState(
    currentSubdomain || workspace?.subdomain || ''
  );
  const [availabilityStatus, setAvailabilityStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'current'
  >('idle');

  // Custom external domain state
  const [customDomainInput, setCustomDomainInput] = useState(
    currentDomain !== 'firstoption.cloud' ? (currentDomain || workspace?.custom_domain || '') : ''
  );
  const [isVerifyingDns, setIsVerifyingDns] = useState(false);
  const [dnsStatus, setDnsStatus] = useState<'idle' | 'configured' | 'pending'>('idle');

  const [isSaving, setIsSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Check subdomain availability against Supabase
  const checkSubdomainAvailability = useCallback(
    async (sub: string) => {
      const cleanSub = sub.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
      if (!cleanSub || cleanSub.length < 2) {
        setAvailabilityStatus('idle');
        return;
      }

      // If it matches the user's current saved subdomain
      if (cleanSub === (workspace?.subdomain || currentSubdomain)) {
        setAvailabilityStatus('current');
        return;
      }

      setAvailabilityStatus('checking');

      try {
        const { data, error } = await supabase
          .from('funnel_workspaces')
          .select('id, user_id, subdomain')
          .eq('subdomain', cleanSub)
          .maybeSingle();

        if (error) {
          console.error('Error checking subdomain:', error);
          setAvailabilityStatus('idle');
        } else if (data) {
          // If record exists and belongs to someone else
          if (user?.id && data.user_id === user.id) {
            setAvailabilityStatus('current');
          } else {
            setAvailabilityStatus('taken');
          }
        } else {
          setAvailabilityStatus('available');
        }
      } catch (err) {
        console.error('Availability check exception:', err);
        setAvailabilityStatus('idle');
      }
    },
    [currentSubdomain, user?.id, workspace?.subdomain]
  );

  // Debounced check as user types
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      if (subdomainInput) {
        checkSubdomainAvailability(subdomainInput);
      } else {
        setAvailabilityStatus('idle');
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [subdomainInput, isOpen, checkSubdomainAvailability]);

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      const activeSub = currentSubdomain || workspace?.subdomain || '';
      setSubdomainInput(activeSub);
      const activeCust = workspace?.custom_domain && workspace.custom_domain !== 'firstoption.cloud'
        ? workspace.custom_domain
        : currentDomain && currentDomain !== 'firstoption.cloud'
        ? currentDomain
        : '';
      setCustomDomainInput(activeCust);
      setAvailabilityStatus(activeSub ? 'current' : 'idle');
      setSaveSuccessMsg('');
    }
  }, [isOpen, currentSubdomain, currentDomain, workspace]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveAll = async () => {
    if (availabilityStatus === 'taken') {
      alert('This subdomain is already taken by another user. Please choose a different subdomain.');
      return;
    }

    const formattedSub = subdomainInput.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    const formattedDomain = customDomainInput.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, '');

    if (!formattedSub && !formattedDomain) {
      alert('Please enter a subdomain or custom domain.');
      return;
    }

    setIsSaving(true);
    try {
      await onSaveDomain(formattedSub || 'client1', formattedDomain || 'firstoption.cloud');
      setSaveSuccessMsg('Domain configuration saved successfully to Supabase! 🚀');
      setTimeout(() => setSaveSuccessMsg(''), 3500);
    } catch (err) {
      console.error('Failed to save domain settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const activeSubdomain = subdomainInput || currentSubdomain || workspace?.subdomain || '';
  const generatedSubUrl = activeSubdomain ? `https://${activeSubdomain}.firstoption.cloud` : '';
  const customDomainUrl = customDomainInput ? `https://${customDomainInput}` : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs font-sans">
      <div className="bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-2xs"
              style={{ backgroundColor: accentColor.primary }}
            >
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#111827]">
                Domain & Subdomain Settings
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Configure your cloud subdomain or connect your own branded custom domain.
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

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E5E7EB] bg-[#F9FAFB] px-6 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('subdomain')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'subdomain'
                ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs -mb-px'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>1. Cloud Subdomain (.firstoption.cloud)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom_domain')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'custom_domain'
                ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs -mb-px'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>2. Connect Your Own Domain</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {saveSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {activeTab === 'subdomain' ? (
            <div className="space-y-4">
              {/* Subdomain Input Card */}
              <div className="space-y-3 p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-indigo-950">
                    Choose Your Cloud Subdomain
                  </label>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                    Wildcard DNS Active
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="relative flex items-center bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-2xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                    <input
                      type="text"
                      value={subdomainInput}
                      onChange={(e) => {
                        setSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                      }}
                      placeholder="e.g. mudassir, agency, growthlabs"
                      className="w-full px-3.5 py-2.5 text-sm text-[#111827] font-bold focus:outline-none"
                    />
                    <span className="px-3 text-xs font-mono font-bold text-gray-500 bg-gray-50 border-l border-gray-200 h-full flex items-center shrink-0">
                      .firstoption.cloud
                    </span>
                  </div>

                  {/* Real-time Subdomain Availability Status Alert */}
                  {availabilityStatus === 'checking' && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      <span>Checking subdomain availability...</span>
                    </div>
                  )}

                  {availabilityStatus === 'taken' && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2 animate-in fade-in duration-150">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Subdomain already taken!</span> &ldquo;{subdomainInput}&rdquo; is currently claimed by another user. Please enter a different username.
                      </div>
                    </div>
                  )}

                  {availabilityStatus === 'available' && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Great! &ldquo;{subdomainInput}&rdquo; is available to claim.</span>
                    </div>
                  )}

                  {availabilityStatus === 'current' && (
                    <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>This is your current active subdomain.</span>
                    </div>
                  )}
                </div>

                {/* Generated Live URL Preview Box */}
                {generatedSubUrl && (
                  <div className="p-3 rounded-xl bg-white border border-indigo-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-xs font-mono font-bold text-indigo-700 truncate">
                        {generatedSubUrl}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(generatedSubUrl, 'suburl')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'suburl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'suburl' ? 'Copied!' : 'Copy URL'}</span>
                      </button>

                      <a
                        href={generatedSubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                        title="Open live page in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Instant Deployment Features Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Free Automatic SSL</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Pre-provisioned HTTPS encryption across all wildcard subdomains.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <Database className="w-4 h-4 text-indigo-600" />
                    <span>Supabase Workspace Sync</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Immediately routes visitors to your custom landing HTML and 3-popup funnel.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Custom Domain Input */}
              <div className="space-y-3 p-4 rounded-2xl bg-gray-50 border border-[#E5E7EB]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-900">
                    Connect Your Own Custom Domain / Subdomain
                  </label>
                  <Badge variant="info">Custom Branding</Badge>
                </div>

                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={customDomainInput}
                    onChange={(e) => setCustomDomainInput(e.target.value.toLowerCase().trim())}
                    placeholder="e.g. leads.yourcompany.com or offer.mybrand.org"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-xs text-[#111827] font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs"
                  />
                </div>
                <p className="text-[11px] text-gray-500">
                  Point any domain or subdomain you own (from GoDaddy, Namecheap, Cloudflare, etc.) to your funnel.
                </p>
              </div>

              {/* DNS Instructions Card */}
              <div className="space-y-3 p-4 rounded-2xl border border-indigo-100 bg-indigo-50/30">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Required DNS Records (Add in your Domain Registrar)</span>
                  </h4>
                </div>

                <div className="space-y-2 text-xs">
                  {/* CNAME Record */}
                  <div className="p-3 rounded-xl bg-white border border-[#E5E7EB] space-y-2">
                    <div className="flex items-center justify-between font-bold text-gray-900">
                      <span className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-mono">CNAME</span>
                        <span>For Subdomain (e.g. leads.yourcompany.com)</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                        <span className="text-gray-400 block text-[10px]">Host / Name:</span>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="font-mono font-bold text-gray-800">
                            {customDomainInput.includes('.') ? customDomainInput.split('.')[0] : 'leads'}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(customDomainInput.includes('.') ? customDomainInput.split('.')[0] : 'leads', 'dns_host')}
                            className="text-indigo-600 hover:text-indigo-800 font-bold"
                          >
                            {copiedField === 'dns_host' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                        <span className="text-gray-400 block text-[10px]">Value / Target:</span>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="font-mono font-bold text-gray-800 truncate">cname.vercel-dns.com</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('cname.vercel-dns.com', 'dns_val')}
                            className="text-indigo-600 hover:text-indigo-800 font-bold"
                          >
                            {copiedField === 'dns_val' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Root Domain Apex Option */}
                  <div className="p-3 rounded-xl bg-white border border-[#E5E7EB] space-y-2">
                    <div className="flex items-center justify-between font-bold text-gray-900">
                      <span className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-mono">A RECORD</span>
                        <span>For Apex Domain (e.g. yourcompany.com)</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                        <span className="text-gray-400 block text-[10px]">Host:</span>
                        <span className="font-mono font-bold text-gray-800">@</span>
                      </div>

                      <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                        <span className="text-gray-400 block text-[10px]">IP Value:</span>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="font-mono font-bold text-gray-800">76.76.21.21</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('76.76.21.21', 'dns_ip')}
                            className="text-indigo-600 hover:text-indigo-800 font-bold"
                          >
                            {copiedField === 'dns_ip' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status card */}
              {customDomainInput && (
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-[#E5E7EB] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Link2 className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="font-bold text-xs text-[#111827]">{customDomainUrl}</div>
                      <div className="text-[10px] text-gray-400">Next.js routing enabled</div>
                    </div>
                  </div>
                  <Badge variant="success">SSL Active</Badge>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-gray-50 flex items-center justify-between shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveAll}
            isLoading={isSaving}
            disabled={availabilityStatus === 'taken'}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            {availabilityStatus === 'taken' ? 'Subdomain Taken' : 'Save & Connect Domain 🚀'}
          </Button>
        </div>
      </div>
    </div>
  );
}


