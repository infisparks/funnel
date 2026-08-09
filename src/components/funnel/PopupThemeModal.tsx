'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  X,
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
  Plus,
  Trash2,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface SurveyQuestion {
  id: string;
  label: string;
  options: string[];
  allowMultiple?: boolean;
}

export interface PopupThemeConfig {
  primaryColor?: string;
  themeMode?: 'dark' | 'light';
  buttonStyle?: 'solid' | 'gradient';
  badgeText?: string;
  step1Title?: string;
  step1Subtitle?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  phoneLabel?: string;
  phonePlaceholder?: string;
  step1ButtonText?: string;
  step1FooterCopy?: string;
  step2Title?: string;
  step2Subtitle?: string;
  step2ButtonText?: string;
  step3Title?: string;
  step3Subtitle?: string;
  step3ButtonText?: string;
  dateLabel?: string;
  timeSlotLabel?: string;
  step4Title?: string;
  step4Subtitle?: string;
}

interface PopupThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeConfig?: PopupThemeConfig;
  onSaveTheme: (theme: PopupThemeConfig) => void;
}

const PRESET_COLORS = [
  { name: 'Amber Gold', hex: '#F59E0B' },
  { name: 'Royal Purple', hex: '#8146F0' },
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Electric Blue', hex: '#3B82F6' },
  { name: 'Crimson Red', hex: '#EF4444' },
  { name: 'Rose Pink', hex: '#EC4899' },
  { name: 'Champagne Gold', hex: '#D97706' },
  { name: 'Midnight Slate', hex: '#64748B' },
];

export function PopupThemeModal({
  isOpen,
  onClose,
  themeConfig: initialTheme,
  onSaveTheme,
}: PopupThemeModalProps) {
  const { workspace, saveWorkspaceConfig } = useAuth();

  // Active editing tab & live preview step tab: 1 (Contact), 2 (Survey), 3 (Meeting), 4 (Theme Colors & Mode)
  const [activeStepTab, setActiveStepTab] = useState<1 | 2 | 3 | 4>(1);

  const [theme, setTheme] = useState<PopupThemeConfig>({
    primaryColor: initialTheme?.primaryColor || '#F59E0B',
    themeMode: initialTheme?.themeMode || 'dark',
    buttonStyle: initialTheme?.buttonStyle || 'gradient',
    badgeText: initialTheme?.badgeText || 'FAST 30-SEC BOOKING',
    step1Title: initialTheme?.step1Title || 'Claim Your 1-on-1 Growth Consultation',
    step1Subtitle: initialTheme?.step1Subtitle || 'Enter your details to reserve your custom revenue strategy session',
    step1ButtonText: initialTheme?.step1ButtonText || 'CONTINUE TO SELECT SLOT',
    nameLabel: initialTheme?.nameLabel || 'Full Name *',
    namePlaceholder: initialTheme?.namePlaceholder || 'Enter your full name',
    emailLabel: initialTheme?.emailLabel || 'Work Email *',
    emailPlaceholder: initialTheme?.emailPlaceholder || 'name@company.com',
    phoneLabel: initialTheme?.phoneLabel || 'WhatsApp Phone Number *',
    phonePlaceholder: initialTheme?.phonePlaceholder || '+91 9876543210',
    step1FooterCopy: initialTheme?.step1FooterCopy || '100% free strategy session • no sales pitch',
    step2Title: initialTheme?.step2Title || 'Qualify Your Business Requirements',
    step2Subtitle: initialTheme?.step2Subtitle || 'Answer quick questions so we can customize your growth roadmap',
    step2ButtonText: initialTheme?.step2ButtonText || 'PROCEED TO TIME SLOT',
    step3Title: initialTheme?.step3Title || 'Lock Your Strategy Call Slot',
    step3Subtitle: initialTheme?.step3Subtitle || 'Pick a date & time slot for your 1-on-1 session',
    step3ButtonText: initialTheme?.step3ButtonText || 'CONFIRM & LOCK BOOKING 📅',
    dateLabel: initialTheme?.dateLabel || 'Select Preferred Meeting Date *',
    timeSlotLabel: initialTheme?.timeSlotLabel || 'Select Strategy Call Time Slot *',
  });

  // Survey Questions State (synced with workspace)
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>(
    workspace?.survey_questions || [
      {
        id: 'q1',
        label: 'Select Your Primary Industry',
        options: ['Service Business', 'Manufacturer / B2B', 'Medical / Clinic', 'E-commerce Store'],
        allowMultiple: false,
      },
      {
        id: 'q2',
        label: 'Which Growth Services Do You Need? (Select Multiple)',
        options: ['Funnel Building', 'WhatsApp CRM Automation', 'Meta Ads', 'Lead Nurturing'],
        allowMultiple: true,
      },
    ]
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (workspace?.survey_questions) {
      setSurveyQuestions(workspace.survey_questions);
    }
  }, [workspace]);

  if (!isOpen) return null;

  const primaryColor = theme.primaryColor || '#F59E0B';
  const isLightMode = theme.themeMode === 'light';
  const isSolidButton = theme.buttonStyle === 'solid';

  const getButtonStyle = () => {
    if (isSolidButton) {
      return {
        backgroundColor: primaryColor,
        color: '#000000',
      };
    }
    return {
      background: `linear-gradient(to right, ${primaryColor}, #FCD34D)`,
      color: '#000000',
    };
  };

  const handleSave = async () => {
    setIsSaving(true);
    const ok = await saveWorkspaceConfig({
      popup_theme: theme,
      survey_questions: surveyQuestions,
    });
    setIsSaving(false);

    if (ok) {
      setSaveSuccess(true);
      onSaveTheme(theme);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1500);
    }
  };

  // Survey Handlers for Real-Time Creation
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-sans">
      <div className="bg-[#0B0F17] border border-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-white flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between bg-[#131B2A] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-black font-bold flex items-center justify-center shadow-2xs">
              <Palette className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                <span>Split-Screen Live Popup Customizer</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Real-Time Studio</span>
              </h3>
              <p className="text-xs text-gray-400">
                Edit titles, field labels, placeholders & create survey questions with real-time live preview.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Selector Tabs */}
        <div className="px-4 py-2.5 bg-[#0B0F17] border-b border-gray-800 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Select Form:</span>
          
          <button
            onClick={() => setActiveStepTab(1)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeStepTab === 1
                ? 'bg-amber-500 text-black shadow-md font-extrabold'
                : 'bg-gray-800/60 text-gray-300 hover:bg-gray-800'
            }`}
          >
            Form 1: Contact Details
          </button>

          <button
            onClick={() => setActiveStepTab(2)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeStepTab === 2
                ? 'bg-amber-500 text-black shadow-md font-extrabold'
                : 'bg-gray-800/60 text-gray-300 hover:bg-gray-800'
            }`}
          >
            Form 2: Survey Qualification (Real-Time)
          </button>

          <button
            onClick={() => setActiveStepTab(3)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeStepTab === 3
                ? 'bg-amber-500 text-black shadow-md font-extrabold'
                : 'bg-gray-800/60 text-gray-300 hover:bg-gray-800'
            }`}
          >
            Form 3: Meeting Booking
          </button>

          <button
            onClick={() => setActiveStepTab(4)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeStepTab === 4
                ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                : 'bg-gray-800/60 text-gray-300 hover:bg-gray-800'
            }`}
          >
            🎨 Colors & Button Style
          </button>
        </div>

        {/* SPLIT SCREEN BODY */}
        <div className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-gray-800">
          {/* LEFT PANEL: CONTROLS & EDITABLE INPUTS */}
          <div className="p-5 overflow-y-auto space-y-4 bg-[#0B0F17]">
            {saveSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Popup theme & survey questions saved to Supabase! ✅</span>
              </div>
            )}

            {/* TAB 1: STEP 1 CONTACT FORM */}
            {activeStepTab === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h4 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider">
                  Form 1 Customization (Contact Details)
                </h4>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Step 1 Main Title
                  </label>
                  <input
                    type="text"
                    value={theme.step1Title}
                    onChange={(e) => setTheme({ ...theme, step1Title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-800 bg-[#131B2A] text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Step 1 Subtitle / Description
                  </label>
                  <textarea
                    rows={2}
                    value={theme.step1Subtitle}
                    onChange={(e) => setTheme({ ...theme, step1Subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-800 bg-[#131B2A] text-xs font-semibold text-gray-300 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Field Labels & Placeholders Customization (Consistent Clean Style) */}
                <div className="p-3.5 rounded-2xl bg-[#131B2A] border border-gray-800 space-y-3">
                  <h5 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                    Custom Field Labels & Placeholders
                  </h5>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Full Name Field Title</label>
                    <input
                      type="text"
                      value={theme.nameLabel}
                      onChange={(e) => setTheme({ ...theme, nameLabel: e.target.value })}
                      placeholder="Full Name *"
                      className="w-full px-3 py-2 rounded-xl border border-gray-700 bg-[#0B0F17] text-xs font-bold text-white mb-1.5"
                    />
                    <input
                      type="text"
                      value={theme.namePlaceholder}
                      onChange={(e) => setTheme({ ...theme, namePlaceholder: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full px-3 py-2 rounded-xl border border-gray-700 bg-[#0B0F17] text-xs text-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">Work Email Field Title</label>
                    <input
                      type="text"
                      value={theme.emailLabel}
                      onChange={(e) => setTheme({ ...theme, emailLabel: e.target.value })}
                      placeholder="Work Email *"
                      className="w-full px-3 py-2 rounded-xl border border-gray-700 bg-[#0B0F17] text-xs font-bold text-white mb-1.5"
                    />
                    <input
                      type="text"
                      value={theme.emailPlaceholder}
                      onChange={(e) => setTheme({ ...theme, emailPlaceholder: e.target.value })}
                      placeholder="name@company.com"
                      className="w-full px-3 py-2 rounded-xl border border-gray-700 bg-[#0B0F17] text-xs text-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">WhatsApp Phone Field Title</label>
                    <input
                      type="text"
                      value={theme.phoneLabel}
                      onChange={(e) => setTheme({ ...theme, phoneLabel: e.target.value })}
                      placeholder="WhatsApp Phone Number *"
                      className="w-full px-3 py-2 rounded-xl border border-gray-700 bg-[#0B0F17] text-xs font-bold text-white mb-1.5"
                    />
                    <input
                      type="text"
                      value={theme.phonePlaceholder}
                      onChange={(e) => setTheme({ ...theme, phonePlaceholder: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full px-3 py-2 rounded-xl border border-gray-700 bg-[#0B0F17] text-xs text-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Step 1 CTA Action Button Text
                  </label>
                  <input
                    type="text"
                    value={theme.step1ButtonText}
                    onChange={(e) => setTheme({ ...theme, step1ButtonText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-800 bg-[#131B2A] text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Top Badge Text
                  </label>
                  <input
                    type="text"
                    value={theme.badgeText}
                    onChange={(e) => setTheme({ ...theme, badgeText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-800 bg-[#131B2A] text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: STEP 2 REAL-TIME SURVEY QUESTIONS BUILDER */}
            {activeStepTab === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider">
                    Form 2 Real-Time Survey Builder
                  </h4>
                  <span className="text-[10px] text-gray-400 font-mono">Updates Live on Right ➡️</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Step 2 Main Title
                  </label>
                  <input
                    type="text"
                    value={theme.step2Title}
                    onChange={(e) => setTheme({ ...theme, step2Title: e.target.value })}
                    className="w-full px-3.5 py-2 py-2 rounded-xl border border-gray-800 bg-[#131B2A] text-xs font-bold text-white focus:outline-none focus:border-amber-400 mb-2"
                  />
                </div>

                {/* SURVEY QUESTIONS BUILDER */}
                <div className="space-y-3">
                  {surveyQuestions.map((q, qIdx) => (
                    <div key={q.id || qIdx} className="p-3.5 rounded-2xl bg-[#131B2A] border border-gray-800 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                            Question #{qIdx + 1} Title
                          </label>
                          <input
                            type="text"
                            value={q.label}
                            onChange={(e) => {
                              const updated = [...surveyQuestions];
                              updated[qIdx].label = e.target.value;
                              setSurveyQuestions(updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-xl border border-gray-700 bg-[#0B0F17] text-xs font-bold text-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg shrink-0 mt-4 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Multi-Select Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...surveyQuestions];
                          updated[qIdx].allowMultiple = !updated[qIdx].allowMultiple;
                          setSurveyQuestions(updated);
                        }}
                        className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                          q.allowMultiple ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-[#0B0F17] border-gray-700 text-gray-400'
                        }`}
                      >
                        {q.allowMultiple ? <CheckSquare className="w-3.5 h-3.5 text-amber-400" /> : <Square className="w-3.5 h-3.5 text-gray-500" />}
                        <span>Allow Multi-Select Checkboxes (Tick Multiple)</span>
                      </button>

                      {/* Options */}
                      <div className="space-y-1.5 pt-1">
                        <label className="block text-[10px] font-bold text-gray-400">Answer Options</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-1 bg-[#0B0F17] border border-gray-700 rounded-lg px-2 py-1">
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const updated = [...surveyQuestions];
                                  updated[qIdx].options[optIdx] = e.target.value;
                                  setSurveyQuestions(updated);
                                }}
                                className="w-full text-xs font-semibold text-white bg-transparent focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(qIdx, optIdx)}
                                className="text-gray-500 hover:text-rose-400 p-0.5 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleAddOption(qIdx)}
                            className="p-1 rounded-lg border border-dashed border-gray-700 text-[10px] font-bold text-gray-400 hover:text-amber-400 flex items-center justify-center gap-1 bg-[#0B0F17] cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Option</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="w-full py-2.5 rounded-xl border border-dashed border-amber-500/40 hover:border-amber-400 text-xs font-bold text-amber-400 flex items-center justify-center gap-1.5 bg-amber-500/10 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Qualification Question</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: STEP 3 MEETING FORM */}
            {activeStepTab === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h4 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider">
                  Form 3 Customization (Meeting Booking)
                </h4>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Step 3 Main Title
                  </label>
                  <input
                    type="text"
                    value={theme.step3Title}
                    onChange={(e) => setTheme({ ...theme, step3Title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-800 bg-[#131B2A] text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Step 3 Subtitle / Description
                  </label>
                  <textarea
                    rows={2}
                    value={theme.step3Subtitle}
                    onChange={(e) => setTheme({ ...theme, step3Subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-800 bg-[#131B2A] text-xs font-semibold text-gray-300 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Meeting Date Field Label
                  </label>
                  <input
                    type="text"
                    value={theme.dateLabel}
                    onChange={(e) => setTheme({ ...theme, dateLabel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-800 bg-[#131B2A] text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Step 3 CTA Action Button Text
                  </label>
                  <input
                    type="text"
                    value={theme.step3ButtonText}
                    onChange={(e) => setTheme({ ...theme, step3ButtonText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-800 bg-[#131B2A] text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: COLORS, LIGHT/DARK MODE & BUTTON STYLE */}
            {activeStepTab === 4 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Dark vs Light Theme Mode Toggle */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Modal Background Theme Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTheme({ ...theme, themeMode: 'dark' })}
                      className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        theme.themeMode === 'dark' || !theme.themeMode
                          ? 'border-amber-400 bg-amber-500/20 text-white shadow-md'
                          : 'border-gray-800 bg-[#131B2A] text-gray-400'
                      }`}
                    >
                      <Moon className="w-4 h-4 text-amber-400" />
                      <span>Dark Luxury Mode</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme({ ...theme, themeMode: 'light' })}
                      className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        theme.themeMode === 'light'
                          ? 'border-amber-400 bg-white text-gray-900 shadow-md'
                          : 'border-gray-800 bg-[#131B2A] text-gray-400'
                      }`}
                    >
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Clean Light Mode</span>
                    </button>
                  </div>
                </div>

                {/* Solid vs Gradient Button Style Toggle */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                    CTA Button Background Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTheme({ ...theme, buttonStyle: 'gradient' })}
                      className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        theme.buttonStyle === 'gradient' || !theme.buttonStyle
                          ? 'border-amber-400 bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md'
                          : 'border-gray-800 bg-[#131B2A] text-gray-400'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Gradient Accent</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme({ ...theme, buttonStyle: 'solid' })}
                      className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        theme.buttonStyle === 'solid'
                          ? 'border-amber-400 text-black shadow-md'
                          : 'border-gray-800 bg-[#131B2A] text-gray-400'
                      }`}
                      style={{ backgroundColor: theme.buttonStyle === 'solid' ? primaryColor : undefined }}
                    >
                      <span>Solid Accent Color</span>
                    </button>
                  </div>
                </div>

                {/* Color Palette & Custom Hex Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Primary Theme Accent Color
                    </label>

                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">Hex:</span>
                      <input
                        type="color"
                        value={theme.primaryColor || '#F59E0B'}
                        onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer border-0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_COLORS.map((c) => {
                      const isSelected = theme.primaryColor === c.hex;
                      return (
                        <button
                          type="button"
                          key={c.hex}
                          onClick={() => setTheme({ ...theme, primaryColor: c.hex })}
                          className={`p-2.5 rounded-2xl border text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-2 border-white bg-white/10 text-white shadow-md'
                              : 'border-gray-800 bg-[#131B2A] text-gray-400 hover:border-gray-700'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 shadow-2xs"
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

          {/* RIGHT PANEL: REAL-TIME LIVE INTERACTIVE PREVIEW */}
          <div className="p-6 bg-[#05080E] flex flex-col items-center justify-center relative overflow-y-auto">
            <div className="absolute top-3 left-4 flex items-center gap-1.5 text-gray-400 text-xs font-bold">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Real-Time Live Preview (Form Step {activeStepTab > 3 ? 1 : activeStepTab})</span>
            </div>

            {/* LIVE PREVIEW CONTAINER */}
            <div
              className={`border rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative transition-all duration-200 mt-6 ${
                isLightMode ? 'bg-white text-[#111827] border-gray-200' : 'bg-[#0B0F17] text-white border-amber-500/30'
              }`}
              style={{ borderColor: isLightMode ? '#E5E7EB' : `${primaryColor}50` }}
            >
              <div className="p-5 pb-2 text-center space-y-2">
                <div
                  className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    borderColor: `${primaryColor}40`,
                    color: primaryColor,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                  <span>Step {activeStepTab > 3 ? 1 : activeStepTab} of 3</span>
                  <span className="text-gray-400">•</span>
                  <span>{theme.badgeText || 'FAST 30-SEC BOOKING'}</span>
                </div>

                <h3 className={`text-lg font-extrabold tracking-tight ${isLightMode ? 'text-[#111827]' : 'text-white'}`}>
                  {activeStepTab === 1 && (theme.step1Title || 'Claim Your 1-on-1 Growth Consultation')}
                  {activeStepTab === 2 && (theme.step2Title || 'Qualify Your Business Requirements')}
                  {activeStepTab === 3 && (theme.step3Title || 'Lock Your Strategy Call Slot')}
                  {activeStepTab === 4 && (theme.step1Title || 'Claim Your 1-on-1 Growth Consultation')}
                </h3>

                <p className={`text-[11px] block leading-snug ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {activeStepTab === 1 && (theme.step1Subtitle || 'Enter your details to reserve your custom strategy session')}
                  {activeStepTab === 2 && (theme.step2Subtitle || 'Answer quick questions so we can customize your roadmap')}
                  {activeStepTab === 3 && (theme.step3Subtitle || 'Pick a date & time slot for your 1-on-1 session')}
                  {activeStepTab === 4 && (theme.step1Subtitle || 'Enter your details to reserve your custom strategy session')}
                </p>
              </div>

              {/* LIVE FORM CONTENT STEP 1 */}
              {(activeStepTab === 1 || activeStepTab === 4) && (
                <div className="p-5 pt-2 space-y-3">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      {theme.nameLabel || 'Full Name *'}
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        disabled
                        placeholder={theme.namePlaceholder || 'Enter your full name'}
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-semibold ${
                          isLightMode ? 'bg-[#F8FAFC] border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-[#131B2A] border-gray-800 text-white placeholder-gray-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      {theme.emailLabel || 'Work Email *'}
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        disabled
                        placeholder={theme.emailPlaceholder || 'name@company.com'}
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-semibold ${
                          isLightMode ? 'bg-[#F8FAFC] border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-[#131B2A] border-gray-800 text-white placeholder-gray-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      {theme.phoneLabel || 'WhatsApp Phone Number *'}
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        disabled
                        placeholder={theme.phonePlaceholder || '+91 9876543210'}
                        className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-semibold ${
                          isLightMode ? 'bg-[#F8FAFC] border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-[#131B2A] border-gray-800 text-white placeholder-gray-500'
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    className="w-full py-3 px-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-lg transition-all cursor-pointer mt-1"
                    style={getButtonStyle()}
                  >
                    <span>{theme.step1ButtonText || 'CONTINUE TO SELECT SLOT'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* LIVE FORM CONTENT STEP 2 (REAL-TIME LIVE SURVEY QUESTIONS) */}
              {activeStepTab === 2 && (
                <div className="p-5 pt-2 space-y-3">
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {surveyQuestions.map((q) => (
                      <div key={q.id} className="space-y-1.5">
                        <label className="block text-[11px] font-bold" style={{ color: primaryColor }}>
                          {q.label}
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {q.options.map((opt, idx) => (
                            <div
                              key={opt}
                              className={`p-2 rounded-xl text-[10px] font-bold border truncate ${
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
                    ))}
                  </div>

                  <button
                    className="w-full py-3 px-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-lg transition-all cursor-pointer mt-2"
                    style={getButtonStyle()}
                  >
                    <span>{theme.step2ButtonText || 'PROCEED TO TIME SLOT'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* LIVE FORM CONTENT STEP 3 */}
              {activeStepTab === 3 && (
                <div className="p-5 pt-2 space-y-3">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      {theme.dateLabel || 'Select Preferred Meeting Date *'}
                    </label>
                    <input
                      type="date"
                      disabled
                      value="2026-08-10"
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${
                        isLightMode ? 'bg-[#F8FAFC] border-gray-300 text-gray-900' : 'bg-[#131B2A] border-gray-800 text-white'
                      }`}
                    />
                  </div>

                  <button
                    className="w-full py-3 px-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer mt-1"
                    style={getButtonStyle()}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{theme.step3ButtonText || 'CONFIRM & LOCK BOOKING 📅'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#131B2A] flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-400">
            Real-time preview mode active.
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Theme to Supabase 💾
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
