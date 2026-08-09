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
} from 'lucide-react';
import { ThreePopupFunnelModal, PopupThemeConfig, SurveyQuestion } from '@/components/funnel/ThreePopupFunnelModal';

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

  const [activeTab, setActiveTab] = useState<'theme' | 'survey'>('theme');
  const [activeStepTab, setActiveStepTab] = useState<1 | 2 | 3 | 4>(1);

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

  const primaryColor = theme.primaryColor || '#F59E0B';
  const isLightMode = theme.themeMode === 'light';
  const isSolidButton = theme.buttonStyle === 'solid';

  const getButtonStyle = () => {
    if (isSolidButton) {
      return { backgroundColor: primaryColor, color: '#000000' };
    }
    return { background: `linear-gradient(to right, ${primaryColor}, #FCD34D)`, color: '#000000' };
  };

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
                21 premium colors, editable field labels, default 1 survey question, and real-time live preview.
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
            {/* Top Studio Tabs */}
            <div className="p-3 bg-white border-b border-gray-200 flex items-center gap-2 overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveTab('theme')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'theme'
                    ? 'bg-amber-500 text-black shadow-xs font-extrabold'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                1. Form Copy & Field Labels
              </button>

              <button
                onClick={() => setActiveTab('survey')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'survey'
                    ? 'bg-amber-500 text-black shadow-xs font-extrabold'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                2. Real-Time Survey Builder ({surveyQuestions.length})
              </button>
            </div>

            {/* TAB CONTENT PANEL */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {activeTab === 'theme' && (
                <div className="space-y-4">
                  {/* Step Selector Tabs */}
                  <div className="flex items-center gap-1.5 p-1 bg-gray-200/60 rounded-xl overflow-x-auto">
                    <button
                      onClick={() => setActiveStepTab(1)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        activeStepTab === 1 ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600'
                      }`}
                    >
                      Step 1 (Contact)
                    </button>
                    <button
                      onClick={() => {
                        setActiveStepTab(2);
                        setActiveTab('survey');
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        activeStepTab === 2 ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600'
                      }`}
                    >
                      Step 2 (Survey)
                    </button>
                    <button
                      onClick={() => setActiveStepTab(3)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        activeStepTab === 3 ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600'
                      }`}
                    >
                      Step 3 (Meeting)
                    </button>
                    <button
                      onClick={() => setActiveStepTab(4)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        activeStepTab === 4 ? 'bg-indigo-600 text-white shadow-2xs' : 'text-gray-600'
                      }`}
                    >
                      🎨 21 Theme Colors & Styles
                    </button>
                  </div>

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

                      {/* Field Labels (Consistent Clean Styling across all inputs) */}
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

                      {/* 21 PREMIUM COLOR PALETTES GRID */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-gray-900">
                            21 Premium Curated Color Theme Palettes
                          </label>

                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-gray-500">Custom Hex:</span>
                            <input
                              type="color"
                              value={theme.primaryColor || '#F59E0B'}
                              onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                              className="w-5 h-5 rounded cursor-pointer border-0"
                            />
                          </div>
                        </div>

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
              )}

              {activeTab === 'survey' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">
                      Real-Time Survey Builder ({surveyQuestions.length} Question)
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

                      {/* Options */}
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
                  <span>Step {activeTab === 'survey' ? 2 : (activeStepTab > 3 ? 1 : activeStepTab)} of 3</span>
                </div>

                <h3 className={`text-lg font-extrabold ${isLightMode ? 'text-[#111827]' : 'text-white'}`}>
                  {activeTab === 'survey' && (theme.step2Title || 'Qualify Requirements')}
                  {activeTab === 'theme' && activeStepTab === 1 && (theme.step1Title || 'Claim Your Consultation')}
                  {activeTab === 'theme' && activeStepTab === 2 && (theme.step2Title || 'Qualify Requirements')}
                  {activeTab === 'theme' && activeStepTab === 3 && (theme.step3Title || 'Lock Strategy Slot')}
                </h3>

                <p className={`text-xs block leading-snug ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  {activeTab === 'survey' && (theme.step2Subtitle || 'Answer quick questions so we can customize your roadmap')}
                  {activeTab === 'theme' && activeStepTab === 1 && (theme.step1Subtitle || 'Enter your details to reserve your custom strategy session')}
                  {activeTab === 'theme' && activeStepTab === 2 && (theme.step2Subtitle || 'Answer quick questions so we can customize your roadmap')}
                  {activeTab === 'theme' && activeStepTab === 3 && (theme.step3Subtitle || 'Pick a date & time slot for your 1-on-1 session')}
                </p>
              </div>

              {/* LIVE FORM CONTENT STEP 1 */}
              {activeTab === 'theme' && (activeStepTab === 1 || activeStepTab === 4) && (
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

              {/* LIVE FORM CONTENT STEP 2 (REAL-TIME SURVEY QUESTIONS) */}
              {(activeTab === 'survey' || (activeTab === 'theme' && activeStepTab === 2)) && (
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
                    className="w-full py-3 px-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-lg mt-2"
                    style={getButtonStyle()}
                  >
                    <span>{theme.step2ButtonText || 'PROCEED TO TIME SLOT'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
