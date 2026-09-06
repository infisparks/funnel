'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import {
  Globe,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Unlock,
  Sparkles,
  Server,
  RefreshCw,
  KeyRound,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/Button';

const SECURITY_PIN = '472';
const PLATFORM_DOMAIN = 'firstoption.cloud';
const VPS_IP = '72.61.236.148';

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
  currentDomain = '',
  onSaveDomain,
}: CustomDomainModalProps) {
  const { accentColor } = useTheme();
  const { user, workspace } = useAuth();

  // Active assigned domain initial calculation
  const initialAssigned =
    (workspace?.custom_domain && workspace.custom_domain !== PLATFORM_DOMAIN
      ? workspace.custom_domain
      : currentDomain && currentDomain !== PLATFORM_DOMAIN
      ? currentDomain
      : currentSubdomain
      ? (currentSubdomain.includes('.') ? currentSubdomain : `${currentSubdomain}.${PLATFORM_DOMAIN}`)
      : '') || '';

  const hasExistingAssignedDomain = !!(
    (workspace?.custom_domain && workspace.custom_domain !== PLATFORM_DOMAIN) ||
    (currentDomain && currentDomain !== PLATFORM_DOMAIN) ||
    (workspace?.subdomain && workspace.subdomain !== 'client1' && workspace.subdomain !== 'user')
  );

  // Tab mode: 'subdomain' | 'custom'
  const isCustomDomain =
    initialAssigned && !initialAssigned.endsWith(`.${PLATFORM_DOMAIN}`) && initialAssigned !== PLATFORM_DOMAIN;
  const [activeTab, setActiveTab] = useState<'subdomain' | 'custom'>(isCustomDomain ? 'custom' : 'subdomain');

  const [subdomainInput, setSubdomainInput] = useState('');
  const [customDomainInput, setCustomDomainInput] = useState('');

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');

  const [availabilityStatus, setAvailabilityStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'current'
  >('idle');

  const [isSaving, setIsSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      const active =
        (workspace?.custom_domain && workspace.custom_domain !== PLATFORM_DOMAIN
          ? workspace.custom_domain
          : currentDomain && currentDomain !== PLATFORM_DOMAIN
          ? currentDomain
          : currentSubdomain
          ? (currentSubdomain.includes('.') ? currentSubdomain : `${currentSubdomain}.${PLATFORM_DOMAIN}`)
          : '') || '';

      const isCustom = active && !active.endsWith(`.${PLATFORM_DOMAIN}`) && active !== PLATFORM_DOMAIN;
      setActiveTab(isCustom ? 'custom' : 'subdomain');

      if (isCustom) {
        setCustomDomainInput(active);
        setSubdomainInput(active.includes('.') ? active.split('.')[0] : active);
      } else {
        const sub = active.replace(`.${PLATFORM_DOMAIN}`, '').replace(PLATFORM_DOMAIN, '');
        setSubdomainInput(sub);
        setCustomDomainInput('');
      }

      setPinInput('');
      setPinError('');
      setPinSuccess('');
      setSaveSuccessMsg('');

      if (!hasExistingAssignedDomain || !active) {
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
      }

      setAvailabilityStatus(active ? 'current' : 'idle');
    }
  }, [isOpen, currentSubdomain, currentDomain, workspace, hasExistingAssignedDomain]);

  // Clean domain string helper
  const cleanDomainString = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .replace(/[^a-z0-9.-]/g, '');
  };

  const currentFullDomain =
    activeTab === 'subdomain'
      ? subdomainInput
        ? `${cleanDomainString(subdomainInput).replace(/\..*/, '')}.${PLATFORM_DOMAIN}`
        : ''
      : cleanDomainString(customDomainInput);

  // Check availability
  const checkDomainAvailability = useCallback(
    async (targetDomain: string) => {
      const clean = cleanDomainString(targetDomain);
      if (!clean || clean.length < 3) {
        setAvailabilityStatus('idle');
        return;
      }

      const activeCurrent = workspace?.custom_domain || currentDomain || workspace?.subdomain || currentSubdomain;
      if (clean === activeCurrent || clean === `${workspace?.subdomain}.${PLATFORM_DOMAIN}`) {
        setAvailabilityStatus('current');
        return;
      }

      setAvailabilityStatus('checking');

      try {
        const subPart = clean.includes('.') ? clean.split('.')[0] : clean;
        const { data, error } = await supabase
          .from('funnel_workspaces')
          .select('id, user_id, subdomain, custom_domain')
          .or(`custom_domain.eq.${clean},subdomain.eq.${clean},subdomain.eq.${subPart}`)
          .maybeSingle();

        if (error) {
          console.error('Error checking domain:', error);
          setAvailabilityStatus('idle');
        } else if (data) {
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
    [currentDomain, currentSubdomain, user?.id, workspace]
  );

  // Debounce check
  useEffect(() => {
    if (!isOpen || !isUnlocked) return;
    const timer = setTimeout(() => {
      if (currentFullDomain) {
        checkDomainAvailability(currentFullDomain);
      } else {
        setAvailabilityStatus('idle');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [currentFullDomain, isOpen, isUnlocked, checkDomainAvailability]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVerifyPin = () => {
    if (pinInput.trim() === SECURITY_PIN) {
      setIsUnlocked(true);
      setPinError('');
      setPinSuccess('PIN verified! You can now edit the domain settings.');
      setTimeout(() => setPinSuccess(''), 3000);
    } else {
      setPinError('Invalid Security PIN. Enter 472 to unlock.');
    }
  };

  const handleSave = async () => {
    if (hasExistingAssignedDomain && !isUnlocked) {
      setPinError('Please enter Security PIN 472 before changing domain.');
      return;
    }

    if (availabilityStatus === 'taken') {
      alert('This domain or subdomain is already taken by another workspace.');
      return;
    }

    let finalDomain = '';
    let finalSub = '';

    if (activeTab === 'subdomain') {
      const cleanSub = cleanDomainString(subdomainInput).replace(/\..*/, '');
      if (!cleanSub) {
        alert('Please enter a valid subdomain name.');
        return;
      }
      finalSub = cleanSub;
      finalDomain = `${cleanSub}.${PLATFORM_DOMAIN}`;
    } else {
      const cleanCustom = cleanDomainString(customDomainInput);
      if (!cleanCustom || !cleanCustom.includes('.')) {
        alert('Please enter a valid custom domain (e.g. promo.brand.com or brand.com).');
        return;
      }
      finalSub = cleanCustom.split('.')[0];
      finalDomain = cleanCustom;
    }

    setIsSaving(true);
    try {
      await onSaveDomain(finalSub, finalDomain);
      setSaveSuccessMsg(`Domain "${finalDomain}" assigned successfully! 🚀`);
      setTimeout(() => {
        setSaveSuccessMsg('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to save domain assignment:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const liveUrl = currentFullDomain ? `https://${currentFullDomain}` : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs font-sans">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
              style={{ backgroundColor: accentColor?.primary || '#6366F1' }}
            >
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-[#111827]">
                  Landing Page Domains
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  firstoption.cloud
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Assign an instant subdomain or connect your own branded custom domain.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 bg-white">
          {/* Success Banner */}
          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Currently Assigned Status */}
          {initialAssigned && (
            <div className="p-3.5 rounded-xl bg-[#F5F6F8] border border-[#E5E7EB] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                  Active Live Domain
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-sm font-semibold font-mono text-[#111827] truncate">
                    https://{initialAssigned}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => copyToClipboard(`https://${initialAssigned}`, 'active_url')}
                  className="p-1.5 rounded-lg bg-white border border-[#E5E7EB] text-gray-600 hover:text-indigo-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Copy URL"
                >
                  {copiedField === 'active_url' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <a
                  href={`https://${initialAssigned}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-white border border-[#E5E7EB] text-gray-600 hover:text-indigo-600 text-xs font-semibold flex items-center transition-colors"
                  title="Open live page"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* PIN Unlock Section (If domain is already assigned) */}
          {hasExistingAssignedDomain && !isUnlocked && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    Domain Modification Protected
                  </h4>
                  <p className="text-xs text-amber-800/80 mt-0.5">
                    Enter Security PIN (<strong>472</strong>) to unlock and update this landing page's domain.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    maxLength={8}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleVerifyPin();
                    }}
                    placeholder="Enter PIN (472)"
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold bg-white border border-amber-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleVerifyPin}
                  leftIcon={<Unlock className="w-3.5 h-3.5" />}
                  className="text-xs font-semibold shrink-0"
                >
                  Unlock
                </Button>
              </div>

              {pinError && (
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{pinError}</span>
                </p>
              )}
            </div>
          )}

          {pinSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{pinSuccess}</span>
            </div>
          )}

          {/* Mode Tabs */}
          <div className="flex p-1 bg-[#F5F6F8] rounded-xl border border-[#E5E7EB]">
            <button
              type="button"
              disabled={!isUnlocked}
              onClick={() => setActiveTab('subdomain')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'subdomain'
                  ? 'bg-white text-indigo-700 shadow-xs border border-[#E5E7EB]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Instant Subdomain</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-600">
                Recommended
              </span>
            </button>

            <button
              type="button"
              disabled={!isUnlocked}
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'custom'
                  ? 'bg-white text-indigo-700 shadow-xs border border-[#E5E7EB]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Custom Domain</span>
            </button>
          </div>

          {/* Tab 1: Instant Subdomain */}
          {activeTab === 'subdomain' && (
            <div
              className={`space-y-3 p-4 rounded-xl border transition-all ${
                isUnlocked ? 'bg-white border-[#E5E7EB]' : 'bg-gray-50/70 border-gray-200 opacity-70 pointer-events-none'
              }`}
            >
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  Subdomain Name *
                </label>
                <div className="flex items-center bg-white border border-[#E5E7EB] rounded-lg overflow-hidden focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                  <span className="pl-3 pr-1 text-xs font-mono text-gray-400 select-none">
                    https://
                  </span>
                  <input
                    type="text"
                    disabled={!isUnlocked}
                    value={subdomainInput}
                    onChange={(e) => setSubdomainInput(e.target.value)}
                    placeholder="mybrand"
                    className="w-full py-2 px-1 text-sm font-semibold text-[#111827] focus:outline-none placeholder:text-gray-400"
                  />
                  <span className="pr-3 pl-1 text-xs font-mono font-semibold text-indigo-600 select-none bg-indigo-50/50 py-2 border-l border-indigo-100">
                    .{PLATFORM_DOMAIN}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Zero DNS setup required! Activates instantly under your master domain.</span>
              </div>
            </div>
          )}

          {/* Tab 2: Custom Domain */}
          {activeTab === 'custom' && (
            <div
              className={`space-y-3.5 p-4 rounded-xl border transition-all ${
                isUnlocked ? 'bg-white border-[#E5E7EB]' : 'bg-gray-50/70 border-gray-200 opacity-70 pointer-events-none'
              }`}
            >
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  Custom Domain or Subdomain *
                </label>
                <div className="flex items-center bg-white border border-[#E5E7EB] rounded-lg overflow-hidden focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                  <span className="pl-3 pr-1 text-xs font-mono text-gray-400 select-none">
                    https://
                  </span>
                  <input
                    type="text"
                    disabled={!isUnlocked}
                    value={customDomainInput}
                    onChange={(e) => setCustomDomainInput(e.target.value)}
                    placeholder="promo.mybrand.com or mybrand.com"
                    className="w-full py-2 px-2 text-sm font-semibold text-[#111827] focus:outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* DNS Instruction Table */}
              <div className="p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-indigo-600" />
                    DNS Records for your Registrar (Hostinger, GoDaddy, Cloudflare)
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {/* CNAME option */}
                  <div className="p-2 bg-white rounded-lg border border-[#E5E7EB] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] mr-2">
                        CNAME (For Subdomain)
                      </span>
                      <span className="text-[#111827] font-medium font-mono text-[11px]">
                        Host: {customDomainInput && customDomainInput.includes('.') ? customDomainInput.split('.')[0] : 'promo'} &rarr; Target: {PLATFORM_DOMAIN}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(PLATFORM_DOMAIN, 'dns_cname')}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0"
                    >
                      {copiedField === 'dns_cname' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'dns_cname' ? 'Copied' : 'Copy Target'}</span>
                    </button>
                  </div>

                  {/* A Record option */}
                  <div className="p-2 bg-white rounded-lg border border-[#E5E7EB] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded text-[10px] mr-2">
                        A RECORD (For Root Domain)
                      </span>
                      <span className="text-[#111827] font-medium font-mono text-[11px]">
                        Host: @ &rarr; Value: {VPS_IP}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(VPS_IP, 'dns_ip')}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0"
                    >
                      {copiedField === 'dns_ip' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'dns_ip' ? 'Copied' : 'Copy IP'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Availability Feedback */}
          {availabilityStatus === 'checking' && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Verifying domain availability...</span>
            </div>
          )}

          {availabilityStatus === 'taken' && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>This domain is already assigned to another workspace.</span>
            </div>
          )}

          {availabilityStatus === 'available' && currentFullDomain && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Domain is available and ready to assign!</span>
            </div>
          )}

          {/* Live Preview Bar */}
          {liveUrl && (
            <div className="p-2.5 rounded-xl bg-[#F5F6F8] border border-[#E5E7EB] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="text-xs font-mono font-bold text-indigo-900 truncate">
                  {liveUrl}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(liveUrl, 'preview_url')}
                className="px-2 py-1 rounded-lg bg-white border border-[#E5E7EB] text-gray-700 hover:text-indigo-700 font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                {copiedField === 'preview_url' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedField === 'preview_url' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E7EB] bg-gray-50 flex items-center justify-between shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={!isUnlocked || availabilityStatus === 'taken' || !currentFullDomain}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            {availabilityStatus === 'taken' ? 'Domain Taken' : 'Assign Domain 🚀'}
          </Button>
        </div>
      </div>
    </div>
  );
}
