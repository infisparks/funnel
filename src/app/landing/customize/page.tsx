'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui';
import {
  Palette,
  Save,
  CheckCircle2,
  Eye,
  User,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  ListOrdered,
  Target,
  ArrowLeft,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  X,
  Clock,
  MessageCircle,
  ExternalLink,
  Globe,
  Link as LinkIcon,
  Hash,
} from 'lucide-react';
import { ThreePopupFunnelModal, PopupThemeConfig, SurveyQuestion, SuccessButton } from '@/components/funnel/ThreePopupFunnelModal';

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

// 21 Premium Curated Luxury Color Palettes
const PRESET_COLORS = [
  { name: 'Amber Gold', hex: '#F59E0B' },
  { name: 'Royal Purple', hex: '#8146F0' },
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Electric Blue', hex: '#3B82F6' },
  { name: 'Crimson Red', hex: '#EF4444' },
  { name: 'Rose Pink', hex: '#EC4899' },
  { name: 'Champagne Gold', hex: '#D97706' },
  { name: 'Midnight Slate', hex: '#64748B' },
  { name: 'Cyan Neon', hex: '#06B6D4' },
  { name: 'Violet Dusk', hex: '#A855F7' },
  { name: 'Sunset Coral', hex: '#FF6B6B' },
  { name: 'Luxury Bronze', hex: '#CD7F32' },
  { name: 'Titanium Silver', hex: '#94A3B8' },
  { name: 'Neon Lime', hex: '#84CC16' },
  { name: 'Deep Indigo', hex: '#4F46E5' },
  { name: 'Ruby Red', hex: '#DC2626' },
  { name: 'Golden Sand', hex: '#EAB308' },
  { name: 'Ocean Teal', hex: '#14B8A6' },
  { name: 'Fuchsia Glow', hex: '#D946EF' },
  { name: 'Midnight Azure', hex: '#2563EB' },
  { name: 'Onyx Charcoal', hex: '#334155' },
];

export default function CustomizeStudioPage() {
  const router = useRouter();
  const { workspace, saveWorkspaceConfig } = useAuth();

  const [activeStepTab, setActiveStepTab] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Theme Config State
  const [theme, setTheme] = useState<PopupThemeConfig>({
    primaryColor: '#F59E0B',
    themeMode: 'dark',
    buttonStyle: 'gradient',
    badgeText: 'FAST 30-SEC BOOKING',
    step1Title: 'Claim Your 1-on-1 Growth Consultation',
    step1Subtitle: 'Enter your details to reserve your custom revenue strategy session',
    step1ButtonText: 'CONTINUE TO SELECT SLOT',
    nameLabel: 'Full Name *',
    namePlaceholder: 'Enter your full name',
    emailLabel: 'Work Email *',
    emailPlaceholder: 'name@company.com',
    phoneLabel: 'WhatsApp Phone Number *',
    phonePlaceholder: '+91 9876543210',
    step1FooterCopy: '100% free strategy session • no sales pitch',
    step2Title: 'Qualify Your Business Requirements',
    step2Subtitle: 'Answer quick questions so we can customize your growth roadmap',
    step2ButtonText: 'PROCEED TO TIME SLOT',
    step3Title: 'Lock Your Strategy Call Slot',
    step3Subtitle: 'Pick a date & time slot for your 1-on-1 session',
    step3ButtonText: 'CONFIRM & LOCK BOOKING 📅',
    dateLabel: 'Select Preferred Meeting Date *',
    timeSlotLabel: 'Select Strategy Call Time Slot *',
    meetingSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:30 PM', '06:00 PM'],
    step4Title: 'Booking Confirmed! 🎉',
    step4Subtitle: 'Your meeting is locked in our calendar and CRM. We look forward to speaking!',
    step4ButtonColor: '#25D366',
    step4Buttons: [
      {
        id: 'btn1',
        label: 'Join VIP WhatsApp Group 💬',
        url: 'https://chat.whatsapp.com/',
        type: 'whatsapp',
      },
      {
        id: 'btn2',
        label: 'Follow Us On Instagram 📸',
        url: 'https://instagram.com/',
        type: 'instagram',
      },
    ],
  });

  // Default: EXACTLY 1 Editable Survey Question
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([
    {
      id: 'q1',
      label: 'Select Your Primary Industry',
      options: ['Service Business', 'Manufacturer / B2B', 'Medical / Clinic', 'E-commerce Store'],
      allowMultiple: false,
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (workspace) {
      if (workspace.popup_theme) setTheme(workspace.popup_theme);
      if (workspace.survey_questions && workspace.survey_questions.length > 0) {
        setSurveyQuestions(workspace.survey_questions);
      }
    }
  }, [workspace]);

  const handleSaveAll = async () => {
    setIsSaving(true);
    const ok = await saveWorkspaceConfig({
      popup_theme: theme,
      survey_questions: surveyQuestions,
    });
    setIsSaving(false);

    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleAddQuestion = () => {
    const newId = `q${Date.now()}`;
    setSurveyQuestions([
      ...surveyQuestions,
      {
        id: newId,
        label: 'New Qualification Question',
        options: ['Option A', 'Option B'],
        allowMultiple: false,
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    const updated = [...surveyQuestions];
    updated.splice(idx, 1);
    setSurveyQuestions(updated);
  };

  const handleAddOption = (qIdx: number) => {
    const updated = [...surveyQuestions];
    updated[qIdx].options.push(`New Option ${updated[qIdx].options.length + 1}`);
    setSurveyQuestions(updated);
  };

  const handleRemoveOption = (qIdx: number, optIdx: number) => {
    const updated = [...surveyQuestions];
    updated[qIdx].options.splice(optIdx, 1);
    setSurveyQuestions(updated);
  };

  // Meeting Slot Handlers
  const handleAddSlot = () => {
    const currentSlots = theme.meetingSlots || ['09:00 AM', '11:00 AM', '02:00 PM'];
    setTheme({
      ...theme,
      meetingSlots: [...currentSlots, '08:00 PM'],
    });
  };

  const handleRemoveSlot = (idx: number) => {
    const currentSlots = [...(theme.meetingSlots || [])];
    currentSlots.splice(idx, 1);
    setTheme({ ...theme, meetingSlots: currentSlots });
  };

  // Success Button Handlers
  const handleAddSuccessButton = (type: 'whatsapp' | 'website' | 'instagram' | 'custom') => {
    const currentBtns = theme.step4Buttons || [];
    let defaultLabel = 'Visit Website 🌐';
    let defaultUrl = 'https://firstoption.cloud';

    if (type === 'whatsapp') {
      defaultLabel = 'Join VIP WhatsApp Group 💬';
      defaultUrl = 'https://chat.whatsapp.com/';
    } else if (type === 'instagram') {
      defaultLabel = 'Follow Us On Instagram 📸';
      defaultUrl = 'https://instagram.com/';
    }

    setTheme({
      ...theme,
      step4Buttons: [
        ...currentBtns,
        {
          id: `btn_${Date.now()}`,
          label: defaultLabel,
          url: defaultUrl,
          type,
        },
      ],
    });
  };

  const handleRemoveSuccessButton = (idx: number) => {
    const currentBtns = [...(theme.step4Buttons || [])];
    currentBtns.splice(idx, 1);
    setTheme({ ...theme, step4Buttons: currentBtns });
  };

  const primaryColor = theme.primaryColor || '#F59E0B';
  const isLightMode = theme.themeMode === 'light';
  const isSolidButton = theme.buttonStyle === 'solid';
  const successButtonColor = theme.step4ButtonColor || primaryColor;

  const getButtonStyle = () => {
    if (isSolidButton) {
      return { backgroundColor: primaryColor, color: '#000000' };
    }
    return { background: `linear-gradient(to right, ${primaryColor}, #FCD34D)`, color: '#000000' };
  };

  const previewQ = surveyQuestions[0];
  const previewHasLongOption = previewQ?.options?.some((opt) => opt.length > 20);

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-100px)] font-sans">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/landing')}
              className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Studio</span>
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-[#111827]">
                Full-Screen 3-Popup Funnel Studio
              </h1>
              <p className="text-xs text-gray-500">
                Custom #HEX color input, progressive survey flow, 3 per row time slots, and 21 luxury colors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Saved to Supabase!</span>
              </span>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={handleSaveAll}
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save All Changes to Supabase 💾
            </Button>
          </div>
        </div>

        {/* FULL PAGE SPLIT WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden mt-3 rounded-3xl border border-gray-200 bg-white shadow-xs">
          {/* LEFT 6 COLUMNS: CONTROLS & EDITABLE PANELS */}
          <div className="lg:col-span-6 border-r border-gray-200 flex flex-col bg-gray-50/50 overflow-hidden">
            {/* CLEAN UNIFIED SUB-TABS ROW */}
            <div className="p-3 bg-white border-b border-gray-200 flex items-center gap-1.5 overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveStepTab(1)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeStepTab === 1 ? 'bg-amber-500 text-black shadow-xs font-extrabold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Step 1 (Contact)
              </button>
              <button
                onClick={() => setActiveStepTab(2)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeStepTab === 2 ? 'bg-amber-500 text-black shadow-xs font-extrabold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Step 2 (Survey Questions)
              </button>
              <button
                onClick={() => setActiveStepTab(3)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeStepTab === 3 ? 'bg-amber-500 text-black shadow-xs font-extrabold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Step 3 (Slots)
              </button>
              <button
                onClick={() => setActiveStepTab(5)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeStepTab === 5 ? 'bg-emerald-600 text-white shadow-xs font-extrabold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Step 4 (Success Buttons)
              </button>
              <button
                onClick={() => setActiveStepTab(4)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeStepTab === 4 ? 'bg-indigo-600 text-white shadow-xs font-extrabold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🎨 Colors & Styles
              </button>
            </div>

            {/* TAB CONTENT PANEL */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* STEP 1 CONTROLS */}
              {activeStepTab === 1 && (
                <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-200">
                  <h4 className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">
                    Form 1 Copy, Subtitle & Editable Labels
                  </h4>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Step 1 Title</label>
                    <input
                      type="text"
                      value={theme.step1Title}
                      onChange={(e) => setTheme({ ...theme, step1Title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Step 1 Subtitle / Description</label>
                    <textarea
                      rows={2}
                      value={theme.step1Subtitle}
                      onChange={(e) => setTheme({ ...theme, step1Subtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-700"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                    <h5 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
                      Field Titles & Input Placeholders
                    </h5>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Full Name Field Title</label>
                      <input
                        type="text"
                        value={theme.nameLabel}
                        onChange={(e) => setTheme({ ...theme, nameLabel: e.target.value })}
                        placeholder="Full Name *"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-900 mb-1.5"
                      />
                      <input
                        type="text"
                        value={theme.namePlaceholder}
                        onChange={(e) => setTheme({ ...theme, namePlaceholder: e.target.value })}
                        placeholder="Enter your full name"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Work Email Field Title</label>
                      <input
                        type="text"
                        value={theme.emailLabel}
                        onChange={(e) => setTheme({ ...theme, emailLabel: e.target.value })}
                        placeholder="Work Email *"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-900 mb-1.5"
                      />
                      <input
                        type="text"
                        value={theme.emailPlaceholder}
                        onChange={(e) => setTheme({ ...theme, emailPlaceholder: e.target.value })}
                        placeholder="name@company.com"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp Phone Field Title</label>
                      <input
                        type="text"
                        value={theme.phoneLabel}
                        onChange={(e) => setTheme({ ...theme, phoneLabel: e.target.value })}
                        placeholder="WhatsApp Phone Number *"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-900 mb-1.5"
                      />
                      <input
                        type="text"
                        value={theme.phonePlaceholder}
                        onChange={(e) => setTheme({ ...theme, phonePlaceholder: e.target.value })}
                        placeholder="+91 9876543210"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-gray-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      value={theme.step1ButtonText}
                      onChange={(e) => setTheme({ ...theme, step1ButtonText: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-amber-600"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2 CONTROLS & REAL-TIME SURVEY BUILDER */}
              {activeStepTab === 2 && (
                <div className="space-y-4">
                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-200">
                    <h4 className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">
                      Form 2 Copy & Description
                    </h4>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Step 2 Title</label>
                      <input
                        type="text"
                        value={theme.step2Title}
                        onChange={(e) => setTheme({ ...theme, step2Title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Step 2 Subtitle / Description</label>
                      <textarea
                        rows={2}
                        value={theme.step2Subtitle}
                        onChange={(e) => setTheme({ ...theme, step2Subtitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Step 2 CTA Button Text</label>
                      <input
                        type="text"
                        value={theme.step2ButtonText}
                        onChange={(e) => setTheme({ ...theme, step2ButtonText: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-amber-600"
                      />
                    </div>
                  </div>

                  {/* SURVEY QUESTIONS BUILDER */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">
                        Survey Questions Builder ({surveyQuestions.length})
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono">Updates Live on Right ➡️</span>
                    </div>

                    {surveyQuestions.map((q, idx) => (
                      <div key={q.id || idx} className="p-4 rounded-2xl bg-white border border-gray-200 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">Question #{idx + 1} Title</label>
                            <input
                              type="text"
                              value={q.label}
                              onChange={(e) => {
                                const updated = [...surveyQuestions];
                                updated[idx].label = e.target.value;
                                setSurveyQuestions(updated);
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-900"
                            />
                          </div>
                          {surveyQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(idx)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer shrink-0 mt-5"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...surveyQuestions];
                            updated[idx].allowMultiple = !updated[idx].allowMultiple;
                            setSurveyQuestions(updated);
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                            q.allowMultiple ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-gray-50 border-gray-200 text-gray-600'
                          }`}
                        >
                          {q.allowMultiple ? <CheckSquare className="w-4 h-4 text-amber-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                          <span>Allow Multi-Select Checkboxes (Tick 1 or Multiple)</span>
                        </button>

                        <div className="space-y-1.5 pt-1">
                          <label className="block text-[11px] font-bold text-gray-600">Selectable Answer Choices</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const updated = [...surveyQuestions];
                                    updated[idx].options[optIdx] = e.target.value;
                                    setSurveyQuestions(updated);
                                  }}
                                  className="w-full text-xs font-semibold text-gray-800 bg-transparent focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(idx, optIdx)}
                                  className="text-gray-400 hover:text-rose-500 p-1 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleAddOption(idx)}
                              className="p-2 rounded-xl border border-dashed border-gray-300 text-xs font-bold text-gray-600 flex items-center justify-center gap-1 bg-white cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Option</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-300 hover:border-amber-500 text-xs font-extrabold text-gray-700 hover:text-amber-600 flex items-center justify-center gap-2 bg-white cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Qualification Question</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 CONTROLS & CUSTOM TIME SLOTS MANAGER */}
              {activeStepTab === 3 && (
                <div className="space-y-4 bg-white p-4 rounded-2xl border border-gray-200">
                  <h4 className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">
                    Form 3 Meeting Booking & Time Slots Manager
                  </h4>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Step 3 Title</label>
                    <input
                      type="text"
                      value={theme.step3Title}
                      onChange={(e) => setTheme({ ...theme, step3Title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Step 3 Subtitle / Description</label>
                    <textarea
                      rows={2}
                      value={theme.step3Subtitle}
                      onChange={(e) => setTheme({ ...theme, step3Subtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-700"
                    />
                  </div>

                  {/* Custom Time Slots Manager */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Custom Available Time Slots</span>
                      </h5>
                      <button
                        type="button"
                        onClick={handleAddSlot}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Time Slot</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {(theme.meetingSlots || ['09:00 AM', '11:00 AM', '02:00 PM', '04:30 PM']).map((slot, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-white border border-gray-300 rounded-xl px-2.5 py-1.5">
                          <input
                            type="text"
                            value={slot}
                            onChange={(e) => {
                              const updatedSlots = [...(theme.meetingSlots || [])];
                              updatedSlots[idx] = e.target.value;
                              setTheme({ ...theme, meetingSlots: updatedSlots });
                            }}
                            className="w-full text-xs font-bold text-gray-900 bg-transparent focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(idx)}
                            className="text-gray-400 hover:text-rose-500 p-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Step 3 CTA Button Text</label>
                    <input
                      type="text"
                      value={theme.step3ButtonText}
                      onChange={(e) => setTheme({ ...theme, step3ButtonText: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-amber-600"
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: SUCCESS PAGE MULTI-BUTTON BUILDER (WHATSAPP, INSTAGRAM, WEBSITE, CUSTOM) */}
              {activeStepTab === 5 && (
                <div className="space-y-4 bg-white p-4 rounded-2xl border border-gray-200">
                  <h4 className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Step 4 Success Page & Action Buttons</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Success Title</label>
                    <input
                      type="text"
                      value={theme.step4Title}
                      onChange={(e) => setTheme({ ...theme, step4Title: e.target.value })}
                      placeholder="Booking Confirmed! 🎉"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Success Description</label>
                    <textarea
                      rows={2}
                      value={theme.step4Subtitle}
                      onChange={(e) => setTheme({ ...theme, step4Subtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-700"
                    />
                  </div>

                  {/* Add Specific Button Types (WhatsApp, Instagram, Website, Custom) */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h5 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <span>Add Success Page Buttons</span>
                      </h5>

                      <div className="flex flex-wrap items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleAddSuccessButton('whatsapp')}
                          className="px-2 py-1 bg-[#25D366] text-black font-extrabold text-[10px] rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>+ WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSuccessButton('instagram')}
                          className="px-2 py-1 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white font-extrabold text-[10px] rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <InstagramIcon className="w-3 h-3" />
                          <span>+ Instagram</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSuccessButton('website')}
                          className="px-2 py-1 bg-blue-600 text-white font-extrabold text-[10px] rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Globe className="w-3 h-3" />
                          <span>+ Website</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {(theme.step4Buttons || []).map((btn, bIdx) => (
                        <div key={btn.id || bIdx} className="p-3 bg-white border border-emerald-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                              {btn.type === 'whatsapp' && <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />}
                              {btn.type === 'instagram' && <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />}
                              {btn.type === 'website' && <Globe className="w-3.5 h-3.5 text-blue-600" />}
                              <span>{btn.type || 'Custom'} Button #{bIdx + 1}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSuccessButton(bIdx)}
                              className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <input
                            type="text"
                            value={btn.label}
                            onChange={(e) => {
                              const updatedBtns = [...(theme.step4Buttons || [])];
                              updatedBtns[bIdx].label = e.target.value;
                              setTheme({ ...theme, step4Buttons: updatedBtns });
                            }}
                            placeholder="Button Label text..."
                            className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold text-gray-900"
                          />

                          <input
                            type="text"
                            value={btn.url}
                            onChange={(e) => {
                              const updatedBtns = [...(theme.step4Buttons || [])];
                              updatedBtns[bIdx].url = e.target.value;
                              setTheme({ ...theme, step4Buttons: updatedBtns });
                            }}
                            placeholder="Target Link URL (e.g. https://chat.whatsapp.com/...)"
                            className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-mono text-gray-700"
                          />
                        </div>
                      ))}

                      {(!theme.step4Buttons || theme.step4Buttons.length === 0) && (
                        <span className="text-xs text-gray-500 italic block">
                          No buttons added yet. Click "+ WhatsApp", "+ Instagram", or "+ Website" to attach social buttons!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 CONTROLS: COLORS & STYLES (WITH DEDICATED #HEX COLOR CODE INPUT) */}
              {activeStepTab === 4 && (
                <div className="space-y-4 bg-white p-4 rounded-2xl border border-gray-200">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Modal Theme Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTheme({ ...theme, themeMode: 'dark' })}
                        className={`p-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                          theme.themeMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Dark Luxury Mode
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme({ ...theme, themeMode: 'light' })}
                        className={`p-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                          theme.themeMode === 'light' ? 'bg-amber-500 text-black' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Clean Light Mode
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Button Accent Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTheme({ ...theme, buttonStyle: 'gradient' })}
                        className={`p-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                          theme.buttonStyle === 'gradient' ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Gradient Accent
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme({ ...theme, buttonStyle: 'solid' })}
                        className={`p-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                          theme.buttonStyle === 'solid' ? 'bg-amber-500 text-black' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Solid Accent Color
                      </button>
                    </div>
                  </div>

                  {/* DEDICATED CUSTOM #HEX COLOR CODE INPUT & COLOR PICKER */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Palette className="w-4 h-4 text-amber-600" />
                        <span>Enter Custom #Hex Color Code</span>
                      </label>
                      <span className="text-[10px] text-gray-500 font-mono">Live Preview ⚡</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Color Wheel Swatch Box */}
                      <div className="relative shrink-0">
                        <input
                          type="color"
                          value={theme.primaryColor && theme.primaryColor.startsWith('#') ? theme.primaryColor : '#F59E0B'}
                          onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                          className="w-10 h-10 rounded-xl cursor-pointer border border-gray-300 shadow-2xs p-0 overflow-hidden"
                          title="Pick Color Wheel"
                        />
                      </div>

                      {/* Hex Code Input Field */}
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-extrabold text-amber-600">#</span>
                        <input
                          type="text"
                          value={(theme.primaryColor || '#F59E0B').replace('#', '')}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            const cleanHex = val.startsWith('#') ? val : `#${val}`;
                            setTheme({ ...theme, primaryColor: cleanHex });
                          }}
                          placeholder="F59E0B"
                          maxLength={7}
                          className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-mono font-extrabold text-gray-900 focus:outline-none focus:border-amber-500 uppercase"
                        />
                      </div>

                      {/* Current Color Swatch Pill */}
                      <div
                        className="px-3 py-2 rounded-xl text-xs font-extrabold font-mono shadow-2xs border border-black/10 shrink-0"
                        style={{ backgroundColor: theme.primaryColor || '#F59E0B', color: '#000000' }}
                      >
                        Preview
                      </div>
                    </div>
                  </div>

                  {/* 21 PREMIUM COLOR PALETTES GRID */}
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      Or Choose From 21 Luxury Preset Palettes
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1">
                      {PRESET_COLORS.map((c) => {
                        const isSelected = theme.primaryColor === c.hex;
                        return (
                          <button
                            type="button"
                            key={c.hex}
                            onClick={() => setTheme({ ...theme, primaryColor: c.hex })}
                            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-2 border-amber-500 bg-amber-50 text-gray-900 shadow-2xs font-extrabold'
                                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0 shadow-2xs"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span className="truncate">{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 6 COLUMNS: REAL-TIME INTERACTIVE LIVE PREVIEW */}
          <div className="lg:col-span-6 bg-[#05080E] p-6 flex flex-col items-center justify-center relative overflow-y-auto">
            <div className="absolute top-4 left-4 flex items-center gap-1.5 text-gray-400 text-xs font-bold">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Real-Time Interactive Live Preview</span>
            </div>

            {/* LIVE PREVIEW CONTAINER */}
            <div
              className={`border rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative transition-all duration-200 ${
                isLightMode ? 'bg-white text-[#111827] border-gray-200' : 'bg-[#0B0F17] text-white border-amber-500/30'
              }`}
              style={{ borderColor: isLightMode ? '#E5E7EB' : `${primaryColor}50` }}
            >
              <div className="p-5 pb-2 text-center space-y-2">
                <div
                  className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border"
                  style={{ backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}40`, color: primaryColor }}
                >
                  <span>
                    {activeStepTab === 2 ? `Question 1 of ${surveyQuestions.length}` : `Step ${activeStepTab > 4 ? 3 : activeStepTab} of 3`}
                  </span>
                </div>

                <h3 className={`text-lg font-extrabold ${isLightMode ? 'text-[#111827]' : 'text-white'}`}>
                  {activeStepTab === 1 && (theme.step1Title || 'Claim Your Consultation')}
                  {activeStepTab === 2 && (theme.step2Title || 'Qualify Requirements')}
                  {activeStepTab === 3 && (theme.step3Title || 'Lock Strategy Slot')}
                  {activeStepTab === 5 && (theme.step4Title || 'Booking Confirmed! 🎉')}
                </h3>

                <p className={`text-xs block leading-snug ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  {activeStepTab === 1 && (theme.step1Subtitle || 'Enter your details to reserve your custom strategy session')}
                  {activeStepTab === 2 && (theme.step2Subtitle || 'Answer quick questions so we can customize your roadmap')}
                  {activeStepTab === 3 && (theme.step3Subtitle || 'Pick a date & time slot for your 1-on-1 session')}
                  {activeStepTab === 5 && (theme.step4Subtitle || 'Your meeting is locked in our calendar.')}
                </p>
              </div>

              {/* LIVE FORM CONTENT STEP 1 */}
              {(activeStepTab === 1 || activeStepTab === 4) && (
                <div className="p-5 pt-2 space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      {theme.nameLabel || 'FULL NAME *'}
                    </label>
                    <input
                      type="text"
                      disabled
                      placeholder={theme.namePlaceholder || 'Enter your full name'}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold ${
                        isLightMode ? 'bg-gray-100 border-gray-300 text-gray-900' : 'bg-[#131B2A] border-gray-800 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      {theme.emailLabel || 'WORK EMAIL *'}
                    </label>
                    <input
                      type="email"
                      disabled
                      placeholder={theme.emailPlaceholder || 'name@company.com'}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold ${
                        isLightMode ? 'bg-gray-100 border-gray-300 text-gray-900' : 'bg-[#131B2A] border-gray-800 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      {theme.phoneLabel || 'WHATSAPP PHONE NUMBER *'}
                    </label>
                    <input
                      type="tel"
                      disabled
                      placeholder={theme.phonePlaceholder || '+91 9876543210'}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold ${
                        isLightMode ? 'bg-gray-100 border-gray-300 text-gray-900' : 'bg-[#131B2A] border-gray-800 text-white'
                      }`}
                    />
                  </div>

                  <button
                    className="w-full py-3 px-3 rounded-xl font-extrabold text-xs uppercase flex items-center justify-center gap-1 shadow-lg mt-1"
                    style={getButtonStyle()}
                  >
                    <span>{theme.step1ButtonText || 'CONTINUE TO SELECT SLOT'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* LIVE FORM CONTENT STEP 2 (PROGRESSIVE 1 QUESTION PREVIEW WITH AUTO LAYOUT) */}
              {activeStepTab === 2 && (
                <div className="p-5 pt-2 space-y-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 transition-all" style={{ backgroundColor: primaryColor }} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold" style={{ color: primaryColor }}>
                      Q1. {surveyQuestions[0]?.label || 'Select Your Primary Industry'}
                    </label>
                    <div className={`grid gap-1.5 ${previewHasLongOption ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      {(surveyQuestions[0]?.options || ['Service Business', 'Manufacturer / B2B', 'Medical / Clinic', 'E-commerce']).map((opt, idx) => (
                        <div
                          key={opt}
                          className={`p-2 rounded-xl text-[10px] font-bold border whitespace-normal break-words leading-tight ${
                            idx === 0
                              ? 'border-amber-500/50 bg-amber-500/20 text-white'
                              : isLightMode
                              ? 'bg-[#F8FAFC] border-gray-200 text-gray-700'
                              : 'bg-[#131B2A] border-gray-800 text-gray-400'
                          }`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    className="w-full py-3 px-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-lg mt-2"
                    style={getButtonStyle()}
                  >
                    <span>{surveyQuestions.length > 1 ? 'NEXT QUESTION ➡️' : (theme.step2ButtonText || 'PROCEED TO TIME SLOT')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* LIVE FORM CONTENT STEP 3 (SLIDABLE DATE CAROUSEL + 3-PER-ROW TIME SLOTS GRID) */}
              {activeStepTab === 3 && (
                <div className="p-5 pt-2 space-y-3">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      {theme.dateLabel || 'SELECT PREFERRED MEETING DATE *'}
                    </label>

                    {/* Date Carousel Slider Preview */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {['Wed 11 Aug', 'Thu 12 Aug', 'Fri 13 Aug', 'Sat 14 Aug'].map((d, i) => (
                        <div
                          key={d}
                          className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold shrink-0 ${
                            i === 0
                              ? 'border-amber-400 bg-amber-500/20 text-white'
                              : isLightMode
                              ? 'bg-gray-100 border-gray-200 text-gray-700'
                              : 'bg-[#131B2A] border-gray-800 text-gray-400'
                          }`}
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      {theme.timeSlotLabel || 'SELECT TIME SLOT *'}
                    </label>

                    {/* Time Slot Grid Preview (3 Per Row) */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {(theme.meetingSlots || ['09:00 AM', '11:00 AM', '02:00 PM', '04:30 PM']).map((slot, idx) => (
                        <div
                          key={slot}
                          className={`p-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 border truncate ${
                            idx === 2
                              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                              : isLightMode
                              ? 'bg-gray-100 border-gray-200 text-gray-700'
                              : 'bg-[#131B2A] border-gray-800 text-gray-400'
                          }`}
                        >
                          <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate">{slot}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    className="w-full py-3 px-3 rounded-xl font-extrabold text-xs uppercase flex items-center justify-center gap-1 shadow-lg mt-1"
                    style={getButtonStyle()}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{theme.step3ButtonText || 'CONFIRM & LOCK BOOKING 📅'}</span>
                  </button>
                </div>
              )}

              {/* LIVE FORM CONTENT STEP 4 (SUCCESS PAGE & MULTI-TYPE BUTTONS) */}
              {activeStepTab === 5 && (
                <div className="p-5 pt-2 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h4 className={`text-base font-extrabold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                      {theme.step4Title || 'Booking Confirmed! 🎉'}
                    </h4>
                    <p className={`text-[11px] leading-relaxed ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                      {theme.step4Subtitle || 'Your meeting is locked in our calendar.'}
                    </p>
                  </div>

                  {theme.step4Buttons && theme.step4Buttons.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {theme.step4Buttons.map((btn) => {
                        const bType = btn.type || 'custom';
                        if (bType === 'whatsapp') {
                          return (
                            <div
                              key={btn.id}
                              className="w-full py-2.5 px-3 rounded-xl font-extrabold text-[11px] uppercase flex items-center justify-center gap-1.5 bg-[#25D366] text-black shadow-md"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span className="truncate">{btn.label}</span>
                              <ExternalLink className="w-3 h-3 ml-auto" />
                            </div>
                          );
                        }
                        if (bType === 'instagram') {
                          return (
                            <div
                              key={btn.id}
                              className="w-full py-2.5 px-3 rounded-xl font-extrabold text-[11px] uppercase flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white shadow-md"
                            >
                              <InstagramIcon className="w-3.5 h-3.5" />
                              <span className="truncate">{btn.label}</span>
                              <ExternalLink className="w-3 h-3 ml-auto" />
                            </div>
                          );
                        }
                        if (bType === 'website') {
                          return (
                            <div
                              key={btn.id}
                              className="w-full py-2.5 px-3 rounded-xl font-extrabold text-[11px] uppercase flex items-center justify-center gap-1.5 bg-blue-600 text-white shadow-md"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span className="truncate">{btn.label}</span>
                              <ExternalLink className="w-3 h-3 ml-auto" />
                            </div>
                          );
                        }
                        return (
                          <div
                            key={btn.id}
                            className="w-full py-2.5 px-3 rounded-xl font-extrabold text-[11px] uppercase flex items-center justify-center gap-1.5 text-black shadow-md"
                            style={{ backgroundColor: successButtonColor }}
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span className="truncate">{btn.label}</span>
                            <ExternalLink className="w-3 h-3 ml-auto" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
