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
  Unlock,
  Sparkles,
  Server,
  RefreshCw,
  ArrowRight,
  HelpCircle,
  KeyRound,
  Layers,
  CheckCheck,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

const SECURITY_PIN = '472';

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
    (workspace?.custom_domain && workspace.custom_domain !== 'firstoption.cloud'
      ? workspace.custom_domain
      : currentDomain && currentDomain !== 'firstoption.cloud'
      ? currentDomain
      : currentSubdomain
      ? (currentSubdomain.includes('.') ? currentSubdomain : `${currentSubdomain}.firstoption.cloud`)
      : '') || '';

  // Whether the domain has already been set/assigned before
  const hasExistingAssignedDomain = !!(
    (workspace?.custom_domain && workspace.custom_domain !== 'firstoption.cloud') ||
    (currentDomain && currentDomain !== 'firstoption.cloud') ||
    (workspace?.subdomain && workspace.subdomain !== 'client1' && workspace.subdomain !== 'user')
  );

  const [domainInput, setDomainInput] = useState('');
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
  const [showVercelGuide, setShowVercelGuide] = useState(false);

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      const active =
        (workspace?.custom_domain && workspace.custom_domain !== 'firstoption.cloud'
          ? workspace.custom_domain
          : currentDomain && currentDomain !== 'firstoption.cloud'
          ? currentDomain
          : currentSubdomain
          ? (currentSubdomain.includes('.') ? currentSubdomain : `${currentSubdomain}.firstoption.cloud`)
          : '') || '';

      setDomainInput(active);
      setPinInput('');
      setPinError('');
      setPinSuccess('');
      setSaveSuccessMsg('');

      // If no domain was previously assigned, it's first-time setup: unlock automatically
      if (!hasExistingAssignedDomain || !active) {
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
      }

      setAvailabilityStatus(active ? 'current' : 'idle');
    }
  }, [isOpen, currentSubdomain, currentDomain, workspace, hasExistingAssignedDomain]);

  // Clean domain string
  const cleanDomainString = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .replace(/[^a-z0-9.-]/g, '');
  };

  // Check domain availability against Supabase
  const checkDomainAvailability = useCallback(
    async (rawDomain: string) => {
      const clean = cleanDomainString(rawDomain);
      if (!clean || clean.length < 3) {
        setAvailabilityStatus('idle');
        return;
      }

      const activeCurrent = workspace?.custom_domain || currentDomain || workspace?.subdomain || currentSubdomain;
      if (clean === activeCurrent || clean === `${workspace?.subdomain}.firstoption.cloud`) {
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

  // Debounced check as user types
  useEffect(() => {
    if (!isOpen || !isUnlocked) return;
    const timer = setTimeout(() => {
      if (domainInput) {
        checkDomainAvailability(domainInput);
      } else {
        setAvailabilityStatus('idle');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [domainInput, isOpen, isUnlocked, checkDomainAvailability]);

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
      setPinSuccess('PIN verified successfully! You can now update the assigned domain.');
      setTimeout(() => setPinSuccess(''), 3500);
    } else {
      setPinError('Invalid Security PIN. Please enter PIN 472 to change this domain.');
    }
  };

  const handleSaveDomain = async () => {
    // If not first time and not unlocked with PIN, require PIN
    if (hasExistingAssignedDomain && !isUnlocked) {
      setPinError('Please enter Security PIN 472 before changing the domain.');
      return;
    }

    if (availabilityStatus === 'taken') {
      alert('This domain or subdomain is already assigned to another workspace. Please choose a different domain.');
      return;
    }

    const cleaned = cleanDomainString(domainInput);
    if (!cleaned) {
      alert('Please enter a valid domain or subdomain.');
      return;
    }

    const subdomainPart = cleaned.includes('.') ? cleaned.split('.')[0] : cleaned;

    setIsSaving(true);
    try {
      await onSaveDomain(subdomainPart, cleaned);
      setSaveSuccessMsg(`Domain "${cleaned}" assigned successfully! 🚀`);
      setTimeout(() => {
        setSaveSuccessMsg('');
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Failed to save domain assignment:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const activeDomainDisplay = cleanDomainString(domainInput);
  const livePreviewUrl = activeDomainDisplay ? `https://${activeDomainDisplay}` : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-2xs shrink-0"
              style={{ backgroundColor: accentColor.primary || '#8146F0' }}
            >
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-[#111827]">
                  Assign Domain
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Vercel Direct
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Assign your Vercel-configured domain or subdomain to route directly to this funnel.
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 bg-white">
          {/* Success Banner */}
          {saveSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Current Status Card */}
          {initialAssigned && (
            <div className="p-4 rounded-2xl bg-[#F5F6F8] border border-[#E5E7EB] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Current Assigned Domain
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-sm font-mono font-bold text-[#111827] truncate">
                    https://{initialAssigned}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`https://${initialAssigned}`, 'cur_domain')}
                    className="p-1.5 rounded-lg bg-white border border-[#E5E7EB] text-gray-600 hover:text-indigo-600 hover:border-indigo-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Copy URL"
                  >
                    {copiedField === 'cur_domain' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={`https://${initialAssigned}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-white border border-[#E5E7EB] text-gray-600 hover:text-indigo-600 hover:border-indigo-200 text-xs font-bold flex items-center transition-colors"
                    title="Open live website"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* PIN Protection Alert Card (When domain exists and is locked) */}
          {hasExistingAssignedDomain && !isUnlocked ? (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-amber-900">
                      Domain Modification Protected (PIN Required)
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                      PIN: 472
                    </span>
                  </div>
                  <p className="text-xs text-amber-800/90 leading-relaxed">
                    This domain is currently locked to prevent accidental changes. Enter the Security PIN (<strong>472</strong>) to unlock and change the assigned domain.
                  </p>
                </div>
              </div>

              {/* PIN Input & Unlock Action */}
              <div className="pt-2 border-t border-amber-200/70">
                <label className="block text-xs font-bold text-amber-950 mb-1.5">
                  Security PIN *
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <KeyRound className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
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
                      className="w-full pl-9 pr-3 py-2 text-xs font-bold bg-white border border-amber-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleVerifyPin}
                    leftIcon={<Unlock className="w-3.5 h-3.5" />}
                    className="text-xs font-bold shrink-0"
                  >
                    Unlock
                  </Button>
                </div>

                {pinError && (
                  <p className="text-xs text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{pinError}</span>
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {/* PIN Verified Banner */}
          {pinSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{pinSuccess}</span>
            </div>
          )}

          {/* Domain Input Form (Editable when unlocked or first time) */}
          <div
            className={`space-y-3 p-4 sm:p-5 rounded-2xl border transition-all ${
              isUnlocked
                ? 'bg-white border-indigo-200 shadow-sm'
                : 'bg-gray-50/70 border-gray-200 opacity-70 pointer-events-none'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111827]">
                Enter Domain / Subdomain Name *
              </label>
              {isUnlocked && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  <Unlock className="w-3 h-3" />
                  Unlocked
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="relative flex items-center bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-2xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                <span className="pl-3.5 pr-2 text-xs font-mono font-bold text-gray-400 select-none">
                  https://
                </span>
                <input
                  type="text"
                  disabled={!isUnlocked}
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="e.g. distributor.iniplus.in or mkmods.firstoption.cloud"
                  className="w-full py-2.5 pr-3.5 text-sm text-[#111827] font-semibold focus:outline-none placeholder:text-gray-400 placeholder:font-normal"
                />
              </div>

              {/* Real-time Status */}
              {availabilityStatus === 'checking' && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium pt-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Checking domain availability...</span>
                </div>
              )}

              {availabilityStatus === 'taken' && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>This domain is already assigned to another workspace.</span>
                </div>
              )}

              {availabilityStatus === 'available' && activeDomainDisplay && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Domain is ready to be assigned!</span>
                </div>
              )}
            </div>

            {/* Generated Live URL Preview */}
            {livePreviewUrl && (
              <div className="p-3 rounded-xl bg-[#F5F6F8] border border-[#E5E7EB] flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="text-xs font-mono font-bold text-indigo-900 truncate">
                    {livePreviewUrl}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(livePreviewUrl, 'live_preview')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E7EB] text-gray-700 hover:text-indigo-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  {copiedField === 'live_preview' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedField === 'live_preview' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Vercel Integration Info Card */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 space-y-2.5">
            <button
              type="button"
              onClick={() => setShowVercelGuide(!showVercelGuide)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-[#111827]">
                  How to add your domain in Vercel
                </span>
              </div>
              <span className="text-[11px] font-bold text-indigo-600 hover:underline">
                {showVercelGuide ? 'Hide Guide' : 'View Guide'}
              </span>
            </button>

            {showVercelGuide ? (
              <div className="pt-2 border-t border-[#E5E7EB] space-y-2 text-xs text-[#6B7280] leading-relaxed animate-in fade-in duration-150">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Open your <strong>Vercel Dashboard</strong> &rarr; Select your Project &rarr; Go to <strong>Settings &gt; Domains</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Add your domain or subdomain (e.g. <code>distributor.iniplus.in</code> or <code>*.firstoption.cloud</code>).
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Enter that exact domain name above and click <strong>Assign Domain</strong>. Your Next.js middleware routes requests instantly.
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-[#6B7280]">
                Add your domain in Vercel Project &gt; Settings &gt; Domains, then enter it here to assign it.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-gray-50 flex items-center justify-between shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveDomain}
            isLoading={isSaving}
            disabled={!isUnlocked || availabilityStatus === 'taken' || !domainInput.trim()}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            {availabilityStatus === 'taken' ? 'Domain Taken' : 'Assign Domain 🚀'}
          </Button>
        </div>
      </div>
    </div>
  );
}
