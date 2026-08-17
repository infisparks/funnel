'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Share2,
  Check,
  Sparkles,
  User,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
  Search,
  CheckCheck,
  Plus,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '@/lib/supabaseClient';

interface ShareLandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  subdomain: string;
  customDomain?: string;
  pageTitle?: string;
  htmlCode?: string;
  triggerButtons?: string[];
  popupTheme?: any;
  surveyQuestions?: any[];
}

interface RegisteredUser {
  user_id: string;
  email: string;
  name: string;
  subdomain?: string;
}

interface SharedHistoryItem {
  id: string;
  recipient_email: string;
  title: string;
  created_at: string;
  status: string;
}

export function ShareLandingModal({
  isOpen,
  onClose,
  subdomain,
  pageTitle = 'My Landing Page Design',
  htmlCode = '',
  triggerButtons = [],
  popupTheme = {},
  surveyQuestions = [],
}: ShareLandingModalProps) {
  const { user, workspace } = useAuth();

  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [designTitle, setDesignTitle] = useState<string>(pageTitle);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // History of designs shared by this user
  const [sharedHistory, setSharedHistory] = useState<SharedHistoryItem[]>([]);

  // Fetch registered users from Supabase view
  const fetchUsersAndHistory = async () => {
    setIsLoadingUsers(true);
    try {
      // 1. Fetch registered users
      const { data: usersData } = await supabase
        .from('registered_users')
        .select('*');

      if (usersData) {
        // Filter out current user's own email
        const otherUsers = usersData.filter(
          (u) => u.email && u.email.toLowerCase() !== (user?.email || '').toLowerCase()
        );
        setRegisteredUsers(otherUsers);
      }

      // 2. Fetch past shares sent by current user
      if (user?.email) {
        const { data: historyData } = await supabase
          .from('shared_landing_designs')
          .select('id, recipient_email, title, created_at, status')
          .eq('sender_email', user.email)
          .order('created_at', { ascending: false })
          .limit(5);

        if (historyData) {
          setSharedHistory(historyData);
        }
      }
    } catch (err) {
      console.warn('Error loading users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSuccessMessage(null);
      setErrorMessage(null);
      setSearchQuery('');
      setSelectedUser(null);
      fetchUsersAndHistory();
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Filter registered users matching the search query
  const matchingUsers = registeredUsers.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.email.toLowerCase().includes(q) ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.subdomain && u.subdomain.toLowerCase().includes(q))
    );
  });

  const isCustomEmailValid =
    searchQuery.trim().includes('@') &&
    searchQuery.trim().includes('.') &&
    !registeredUsers.some((u) => u.email.toLowerCase() === searchQuery.toLowerCase().trim());

  const targetEmail = selectedUser ? selectedUser.email : searchQuery.trim();

  const handleSelectUser = (u: RegisteredUser) => {
    setSelectedUser(u);
    setSearchQuery(u.email);
    setIsDropdownOpen(false);
    setErrorMessage(null);
  };

  const handleClearSelectedUser = () => {
    setSelectedUser(null);
    setSearchQuery('');
  };

  const handleShareDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail) {
      setErrorMessage('Please search and select a registered user email.');
      return;
    }

    setIsSharing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const senderName =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.email?.split('@')[0] ||
        workspace?.subdomain ||
        'Funnel Admin';

      const shareCode = `SLP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const { data, error } = await supabase
        .from('shared_landing_designs')
        .insert({
          share_code: shareCode,
          title: designTitle.trim() || 'Shared Landing Page Design',
          sender_user_id: user?.id || null,
          sender_email: user?.email || '',
          sender_name: senderName,
          recipient_email: targetEmail.toLowerCase().trim(),
          landing_html: htmlCode || '',
          trigger_buttons: triggerButtons || [],
          popup_theme: popupTheme || {},
          survey_questions: surveyQuestions || [],
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error sharing design:', error);
        setErrorMessage(`Failed to share design: ${error.message}`);
      } else {
        setSuccessMessage(`🎉 Access granted! Design shared with ${targetEmail}. They can now view and import it directly in their Templates Store.`);
        fetchUsersAndHistory();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while sharing.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-lg flex flex-col bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#111827]">
                  Share Landing Page Design
                </h2>
                <Badge variant="info" className="py-0 px-2 text-[11px] font-medium">
                  Direct Access
                </Badge>
              </div>
              <p className="text-xs text-[#6B7280]">
                Search any registered user to give them instant 1-click import access
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleShareDesign} className="p-5 space-y-4 overflow-y-visible">
          {/* Feedback Messages */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Design Name Field */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Template Design Name *
            </label>
            <input
              type="text"
              required
              value={designTitle}
              onChange={(e) => setDesignTitle(e.target.value)}
              placeholder="e.g. My High-Converting Consultation Page"
              className="w-full px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl text-[#111827] placeholder:text-[#6B7280]/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Searchable Input with Matching Dropdown */}
          <div ref={dropdownRef} className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#111827]">
                Search User to Give Access *
              </label>
              {isLoadingUsers && (
                <span className="text-[10px] text-gray-400 animate-pulse">Loading registered users...</span>
              )}
            </div>

            {/* Selected User Tag / Chip */}
            {selectedUser ? (
              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {selectedUser.name ? selectedUser.name[0].toUpperCase() : selectedUser.email[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-indigo-950 truncate">
                      {selectedUser.email}
                    </div>
                    <div className="text-[10px] text-indigo-700 truncate">
                      {selectedUser.name || 'Registered User'} {selectedUser.subdomain ? `• ${selectedUser.subdomain}.firstoption.cloud` : ''}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClearSelectedUser}
                  className="p-1 rounded-lg text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 transition-colors cursor-pointer"
                  title="Change User"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Type email, name or subdomain to search registered users..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-[#E5E7EB] rounded-xl text-[#111827] placeholder:text-[#6B7280]/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* MATCHING RESULTS DROPDOWN */}
            {isDropdownOpen && !selectedUser && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E5E7EB] rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-gray-100 animate-in fade-in zoom-in-98 duration-100">
                <div className="px-3 py-1.5 bg-[#F5F6F8] text-[10px] font-bold uppercase text-[#6B7280] tracking-wider sticky top-0">
                  Matching Registered Users ({matchingUsers.length})
                </div>

                {matchingUsers.map((regUser) => (
                  <div
                    key={regUser.user_id}
                    onClick={() => handleSelectUser(regUser)}
                    className="p-2.5 hover:bg-indigo-50/70 transition-colors cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                        {regUser.name ? regUser.name[0].toUpperCase() : regUser.email[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#111827] truncate">
                          {regUser.email}
                        </div>
                        <div className="text-[10px] text-[#6B7280] truncate">
                          {regUser.name || 'User'} {regUser.subdomain ? `• subdomain: ${regUser.subdomain}` : ''}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 shrink-0">
                      Select
                    </span>
                  </div>
                ))}

                {matchingUsers.length === 0 && !isCustomEmailValid && (
                  <div className="p-4 text-center text-xs text-gray-500">
                    No matching registered user found. Type full email address to grant access.
                  </div>
                )}

                {/* Direct Custom Email Option */}
                {isCustomEmailValid && (
                  <div
                    onClick={() => {
                      setSelectedUser({
                        user_id: 'custom',
                        email: searchQuery.trim(),
                        name: searchQuery.trim().split('@')[0],
                      });
                      setIsDropdownOpen(false);
                    }}
                    className="p-2.5 hover:bg-emerald-50 transition-colors cursor-pointer flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50/40"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Give access to email: <strong>{searchQuery.trim()}</strong></span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Included Design Stats Summary */}
          <div className="p-3 bg-[#F5F6F8] rounded-xl border border-[#E5E7EB] space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#6B7280]">
              <span>Interactive Trigger Buttons:</span>
              <span className="font-semibold text-[#111827]">{triggerButtons.length} Triggers</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#6B7280]">
              <span>Survey Qualification Steps:</span>
              <span className="font-semibold text-[#111827]">{surveyQuestions.length} Questions</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#6B7280]">
              <span>Popup Theme & Colors:</span>
              <span className="font-semibold text-[#111827]">
                {popupTheme?.primaryColor || '#8146F0'}
              </span>
            </div>
          </div>

          {/* Submit Share Button */}
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSharing}
            leftIcon={<Send className="w-3.5 h-3.5" />}
            className="w-full py-2.5 text-xs font-bold shadow-xs cursor-pointer"
          >
            Share & Grant Access to {targetEmail || 'Selected User'} 🚀
          </Button>

          {/* Recent Shares List */}
          {sharedHistory.length > 0 && (
            <div className="pt-2 border-t border-[#E5E7EB] space-y-2">
              <span className="text-[11px] font-semibold text-[#6B7280] block">
                Recently Shared with:
              </span>
              <div className="space-y-1.5">
                {sharedHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-lg bg-[#F5F6F8] border border-[#E5E7EB] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="font-medium text-[#111827] truncate">
                        {item.recipient_email}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-[10px] text-[#6B7280]">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F5F6F8] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#6B7280]">
            The recipient will see this in their Template Store under "Shared With Me"
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
