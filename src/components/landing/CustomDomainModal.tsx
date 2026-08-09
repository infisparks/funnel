'use client';

import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import {
  Globe,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Lock,
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
  const [domainInput, setDomainInput] = useState(currentDomain || 'funnel.mycompany.com');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      onSaveDomain(domainInput);
    }, 1200);
  };

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
                Connect Custom Domain
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Attach your custom branding domain or subdomain to this landing page.
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Domain Input Field */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Your Custom Domain / Subdomain
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => {
                    setDomainInput(e.target.value);
                    setIsVerified(false);
                  }}
                  placeholder="e.g. leads.mybrand.com or getdeal.io"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F5F6F8] text-sm text-[#111827] font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <Button
                variant="primary"
                onClick={handleVerify}
                isLoading={isVerifying}
              >
                {isVerified ? 'Verified' : 'Verify DNS'}
              </Button>
            </div>
          </div>

          {/* Verification Status Card */}
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
                  <span>https://{domainInput || 'funnel.mycompany.com'}</span>
                  <Badge variant={isVerified ? 'success' : 'warning'}>
                    {isVerified ? 'Live & Connected' : 'Pending DNS'}
                  </Badge>
                </div>
                <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>SSL Security: Auto-provisioned (Let's Encrypt Wildcard)</span>
                </div>
              </div>
            </div>

            {isVerified && (
              <a
                href={`https://${domainInput}`}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-gray-700 p-2"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* DNS Configuration Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Required DNS Records
              </h4>
              <span className="text-[11px] text-gray-400">Configure at your DNS provider (Cloudflare, GoDaddy, Namecheap)</span>
            </div>

            <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#F8FAFC] text-gray-500 font-bold border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Name / Host</th>
                    <th className="px-4 py-2.5">Target Value</th>
                    <th className="px-4 py-2.5 text-right">Copy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] bg-white">
                  <tr>
                    <td className="px-4 py-3 font-bold text-indigo-600">CNAME</td>
                    <td className="px-4 py-3 font-mono text-gray-700">@ / sub</td>
                    <td className="px-4 py-3 font-mono text-gray-900 font-semibold">
                      edge.infisparkfunnel.com
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => copyToClipboard('edge.infisparkfunnel.com', 'cname')}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100"
                        title="Copy Target"
                      >
                        {copiedField === 'cname' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-blue-600">A Record</td>
                    <td className="px-4 py-3 font-mono text-gray-700">@ (Root)</td>
                    <td className="px-4 py-3 font-mono text-gray-900 font-semibold">
                      76.76.21.21
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => copyToClipboard('76.76.21.21', 'arecord')}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100"
                        title="Copy IP"
                      >
                        {copiedField === 'arecord' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            DNS changes usually propagate in under 60 seconds.
          </span>
          <Button variant="primary" size="md" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
