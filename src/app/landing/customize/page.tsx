'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/components/auth/AuthContext';
import { Button, Badge } from '@/components/ui';
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
  Code,
  Copy,
  Check,
  Zap,
  ClipboardPaste,
  Video,
  Layers,
  Smartphone,
  Monitor,
  CheckCheck,
  Sliders,
  HelpCircle,
  RotateCcw,
  FileText,
} from 'lucide-react';
import { PopupThemeConfig, SurveyQuestion, SuccessButton } from '@/components/funnel/ThreePopupFunnelModal';

const DEFAULT_POPUP_THEME: PopupThemeConfig = {
  primaryColor: '#8146F0',
  buttonTextColor: '#FFFFFF',
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
};

const DEFAULT_SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'q1',
    label: 'Select Your Primary Industry',
    options: ['Service Business', 'Manufacturer / B2B', 'Medical / Clinic', 'E-commerce Store'],
    allowMultiple: false,
  },
];

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

// 28 Curated Brand Palettes with Categories
interface PresetColor {
  name: string;
  hex: string;
  category: 'Luxury' | 'SaaS & Tech' | 'Vibrant' | 'Corporate';
}

const PRESET_COLORS: PresetColor[] = [
  // Luxury
  { name: 'Amber Gold', hex: '#F59E0B', category: 'Luxury' },
  { name: 'Champagne Gold', hex: '#D97706', category: 'Luxury' },
  { name: 'Luxury Bronze', hex: '#CD7F32', category: 'Luxury' },
  { name: 'Golden Sand', hex: '#EAB308', category: 'Luxury' },
  { name: 'Rose Gold', hex: '#FB7185', category: 'Luxury' },
  { name: 'Bordeaux Velvet', hex: '#9F1239', category: 'Luxury' },
  { name: 'Royal Onyx', hex: '#1E293B', category: 'Luxury' },

  // SaaS & Tech
  { name: 'Electric Indigo', hex: '#6366F1', category: 'SaaS & Tech' },
  { name: 'Royal Purple', hex: '#8146F0', category: 'SaaS & Tech' },
  { name: 'Deep Violet', hex: '#A855F7', category: 'SaaS & Tech' },
  { name: 'Midnight Azure', hex: '#2563EB', category: 'SaaS & Tech' },
  { name: 'Electric Blue', hex: '#3B82F6', category: 'SaaS & Tech' },
  { name: 'Cyan Neon', hex: '#06B6D4', category: 'SaaS & Tech' },
  { name: 'Ocean Teal', hex: '#14B8A6', category: 'SaaS & Tech' },

  // Vibrant & High-Converting
  { name: 'Emerald Green', hex: '#10B981', category: 'Vibrant' },
  { name: 'WhatsApp Green', hex: '#25D366', category: 'Vibrant' },
  { name: 'Neon Lime', hex: '#84CC16', category: 'Vibrant' },
  { name: 'Sunset Coral', hex: '#FF6B6B', category: 'Vibrant' },
  { name: 'Crimson Red', hex: '#EF4444', category: 'Vibrant' },
  { name: 'Ruby Red', hex: '#DC2626', category: 'Vibrant' },
  { name: 'Fuchsia Glow', hex: '#D946EF', category: 'Vibrant' },
  { name: 'Rose Pink', hex: '#EC4899', category: 'Vibrant' },

  // Corporate & Modern Clean
  { name: 'Slate Gray', hex: '#64748B', category: 'Corporate' },
  { name: 'Titanium Silver', hex: '#94A3B8', category: 'Corporate' },
  { name: 'Onyx Charcoal', hex: '#334155', category: 'Corporate' },
  { name: 'Deep Navy', hex: '#1E3A8A', category: 'Corporate' },
  { name: 'Forest Dark', hex: '#065F46', category: 'Corporate' },
  { name: 'Obsidian Night', hex: '#0F172A', category: 'Corporate' },
];

export default function CustomizeStudioPage() {
  const router = useRouter();
  const { workspace, saveWorkspaceConfig } = useAuth();

  const [activeStepTab, setActiveStepTab] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [selectedColorCategory, setSelectedColorCategory] = useState<string>('All');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  // Theme Config State
  const [theme, setTheme] = useState<PopupThemeConfig>({
    primaryColor: '#8146F0',
    buttonTextColor: '#FFFFFF',
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

  // Default: Survey Questions
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
  const [resetSuccess, setResetSuccess] = useState(false);

  // Dedicated Full Page JSON State
  const [fullJsonText, setFullJsonText] = useState('');
  const [jsonCopied, setJsonCopied] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (workspace) {
      if (workspace.popup_theme) setTheme(workspace.popup_theme);
      if (workspace.survey_questions && workspace.survey_questions.length > 0) {
        setSurveyQuestions(workspace.survey_questions);
      }
    }
  }, [workspace]);

  // Keep full JSON string updated whenever theme or surveyQuestions change
  useEffect(() => {
    const currentConfig = {
      popup_theme: theme,
      survey_questions: surveyQuestions,
    };
    setFullJsonText(JSON.stringify(currentConfig, null, 2));
  }, [theme, surveyQuestions]);

  const handleResetToDefault = () => {
    setTheme({ ...DEFAULT_POPUP_THEME });
    setSurveyQuestions([...DEFAULT_SURVEY_QUESTIONS]);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

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

  const handleApplyPresetSlots = (preset: 'allDay' | 'businessHours' | 'evening') => {
    let slots: string[] = [];
    if (preset === 'allDay') {
      slots = ['09:00 AM', '11:00 AM', '02:00 PM', '04:30 PM', '06:00 PM', '08:00 PM'];
    } else if (preset === 'businessHours') {
      slots = ['10:00 AM', '12:00 PM', '02:30 PM', '04:00 PM'];
    } else {
      slots = ['05:00 PM', '06:30 PM', '08:00 PM', '09:30 PM'];
    }
    setTheme({ ...theme, meetingSlots: slots });
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

  // Full-Page JSON Actions
  const handleCopyFullJson = () => {
    navigator.clipboard.writeText(fullJsonText);
    setJsonCopied(true);
    setTimeout(() => setJsonCopied(false), 2500);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setFullJsonText(text);
        setJsonError(null);
      }
    } catch (err) {
      alert('Unable to access clipboard. Please paste manually into the editor below.');
    }
  };

  const handleApplyFullJson = () => {
    try {
      const parsed = JSON.parse(fullJsonText);
      if (parsed.popup_theme) {
        setTheme(parsed.popup_theme);
      } else if (parsed.primaryColor || parsed.step1Title) {
        setTheme(parsed);
      }

      if (Array.isArray(parsed.survey_questions)) {
        setSurveyQuestions(parsed.survey_questions);
      } else if (Array.isArray(parsed) && parsed[0]?.label) {
        setSurveyQuestions(parsed);
      }

      setJsonError(null);
      alert('Full Funnel JSON applied live! ⚡');
    } catch (err: any) {
      setJsonError('Invalid JSON format. Please verify the syntax copied from ChatGPT.');
    }
  };

  const primaryColor = theme.primaryColor || '#8146F0';
  const buttonTextColor = theme.buttonTextColor || '#FFFFFF';
  const isLightMode = theme.themeMode === 'light';
  const isSolidButton = theme.buttonStyle === 'solid';
  const successButtonColor = theme.step4ButtonColor || primaryColor;

  const getButtonStyle = () => {
    if (isSolidButton) {
      return { backgroundColor: primaryColor, color: buttonTextColor };
    }
    return { background: `linear-gradient(135deg, ${primaryColor}, #6366F1)`, color: buttonTextColor };
  };

  const filteredPresetColors = selectedColorCategory === 'All'
    ? PRESET_COLORS
    : PRESET_COLORS.filter(c => c.category === selectedColorCategory);

  const previewQ = surveyQuestions[0];
  const previewHasLongOption = previewQ?.options?.some((opt) => opt.length > 20);

  return (
    <MainLayout>
      <div className="flex flex-col min-h-0 lg:h-[calc(100vh-125px)] font-sans">
        {/* Top Studio Header Bar - Sticky & Anchored */}
        <div className="sticky top-0 z-20 bg-[#F5F6F8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB] shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/landing')}
              className="p-2 rounded-xl bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#111827] text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-gray-500" />
              <span>Back to Landing Studio</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#111827]">
                  Funnel & Popup Designer Studio
                </h1>
                <Badge variant="info">3-Step Modal Engine</Badge>
              </div>
              <p className="text-xs text-[#6B7280]">
                Customize themes, color codes, qualification survey steps, time slots, and WhatsApp dispatch buttons.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToDefault}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-gray-500" />}
              className="text-xs font-medium"
            >
              Set Default 🔄
            </Button>

            <button
              onClick={() => setActiveStepTab(6)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all border ${
                activeStepTab === 6
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-white border-[#E5E7EB] text-[#111827] hover:bg-gray-50'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>ChatGPT JSON Schema</span>
            </button>

            {resetSuccess && (
              <span className="text-xs font-medium text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2.5 py-1.5 rounded-xl border border-indigo-200 animate-in fade-in duration-200">
                <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Defaults Loaded!</span>
              </span>
            )}

            {saveSuccess && (
              <span className="text-xs font-medium text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in duration-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved to Supabase</span>
              </span>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveAll}
              isLoading={isSaving}
              leftIcon={<Save className="w-3.5 h-3.5" />}
              className="text-xs font-semibold"
            >
              Save Configuration
            </Button>
          </div>
        </div>

        {/* Studio Split Grid (Left Controls | Right Real-Time Interactive Mockup) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 overflow-hidden mt-3 rounded-2xl border border-[#E5E7EB] bg-white shadow-2xs">
          
          {/* LEFT 6 COLUMNS: TABBED CONTROLS */}
          <div className="lg:col-span-6 border-r border-[#E5E7EB] flex flex-col min-h-0 bg-[#F5F6F8]/60 overflow-hidden">
            
            {/* Step Navigation Tabs */}
            <div className="p-2.5 bg-white border-b border-[#E5E7EB] flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none whitespace-nowrap">
              <button
                onClick={() => setActiveStepTab(1)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeStepTab === 1
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'bg-[#F5F6F8] text-[#111827] hover:bg-gray-200/60'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>1. Contact Info</span>
              </button>

              <button
                onClick={() => setActiveStepTab(2)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeStepTab === 2
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'bg-[#F5F6F8] text-[#111827] hover:bg-gray-200/60'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>2. Survey Form ({surveyQuestions.length})</span>
              </button>

              <button
                onClick={() => setActiveStepTab(3)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeStepTab === 3
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'bg-[#F5F6F8] text-[#111827] hover:bg-gray-200/60'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>3. Time Slots</span>
              </button>

              <button
                onClick={() => setActiveStepTab(5)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeStepTab === 5
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'bg-[#F5F6F8] text-[#111827] hover:bg-gray-200/60'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>4. Confirmation</span>
              </button>

              <button
                onClick={() => setActiveStepTab(4)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeStepTab === 4
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'bg-[#F5F6F8] text-[#111827] hover:bg-gray-200/60'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Theme & Palette</span>
              </button>

              <button
                onClick={() => setActiveStepTab(6)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeStepTab === 6
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'bg-[#F5F6F8] text-[#111827] hover:bg-gray-200/60'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
            </div>

            {/* TAB CONTENT PANEL */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              
              {/* STEP 1 CONTROLS */}
              {activeStepTab === 1 && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#E5E7EB]">
                      <User className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                        Step 1: Contact Header & Copy
                      </h3>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">Popup Title</label>
                      <input
                        type="text"
                        value={theme.step1Title}
                        onChange={(e) => setTheme({ ...theme, step1Title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-medium text-[#111827] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">Subtitle / Value Proposition</label>
                      <textarea
                        rows={2}
                        value={theme.step1Subtitle}
                        onChange={(e) => setTheme({ ...theme, step1Subtitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">Top Badge Pill Text</label>
                      <input
                        type="text"
                        value={theme.badgeText || ''}
                        onChange={(e) => setTheme({ ...theme, badgeText: e.target.value })}
                        placeholder="e.g. FAST 30-SEC BOOKING"
                        className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#E5E7EB]">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                        Input Field Labels & Placeholders
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-medium text-[#6B7280] mb-1">Name Label</label>
                        <input
                          type="text"
                          value={theme.nameLabel}
                          onChange={(e) => setTheme({ ...theme, nameLabel: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-medium text-[#111827]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#6B7280] mb-1">Name Placeholder</label>
                        <input
                          type="text"
                          value={theme.namePlaceholder}
                          onChange={(e) => setTheme({ ...theme, namePlaceholder: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs text-[#111827]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-medium text-[#6B7280] mb-1">Email Label</label>
                        <input
                          type="text"
                          value={theme.emailLabel}
                          onChange={(e) => setTheme({ ...theme, emailLabel: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-medium text-[#111827]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#6B7280] mb-1">Email Placeholder</label>
                        <input
                          type="text"
                          value={theme.emailPlaceholder}
                          onChange={(e) => setTheme({ ...theme, emailPlaceholder: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs text-[#111827]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-medium text-[#6B7280] mb-1">Phone Label</label>
                        <input
                          type="text"
                          value={theme.phoneLabel}
                          onChange={(e) => setTheme({ ...theme, phoneLabel: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-medium text-[#111827]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#6B7280] mb-1">Phone Placeholder</label>
                        <input
                          type="text"
                          value={theme.phonePlaceholder}
                          onChange={(e) => setTheme({ ...theme, phonePlaceholder: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs text-[#111827]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">CTA Button Text</label>
                      <input
                        type="text"
                        value={theme.step1ButtonText}
                        onChange={(e) => setTheme({ ...theme, step1ButtonText: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50/50 text-xs font-bold text-indigo-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 CONTROLS & DYNAMIC SURVEY BUILDER */}
              {activeStepTab === 2 && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#E5E7EB]">
                      <ListOrdered className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                        Step 2: Qualification Survey Copy
                      </h3>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">Survey Section Title</label>
                      <input
                        type="text"
                        value={theme.step2Title}
                        onChange={(e) => setTheme({ ...theme, step2Title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-medium text-[#111827]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">Subtitle</label>
                      <textarea
                        rows={2}
                        value={theme.step2Subtitle}
                        onChange={(e) => setTheme({ ...theme, step2Subtitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs text-[#111827]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">Next Step CTA Button</label>
                      <input
                        type="text"
                        value={theme.step2ButtonText}
                        onChange={(e) => setTheme({ ...theme, step2ButtonText: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50/50 text-xs font-bold text-indigo-700"
                      />
                    </div>
                  </div>

                  {/* Dynamic Questions Builder */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Interactive Questions ({surveyQuestions.length})</span>
                      </h4>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAddQuestion}
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                        className="text-xs font-medium"
                      >
                        Add Question
                      </Button>
                    </div>

                    {surveyQuestions.map((q, idx) => (
                      <div key={q.id || idx} className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <label className="block text-xs font-semibold text-[#111827] mb-1">
                              Question #{idx + 1} Prompt
                            </label>
                            <input
                              type="text"
                              value={q.label}
                              onChange={(e) => {
                                const updated = [...surveyQuestions];
                                updated[idx].label = e.target.value;
                                setSurveyQuestions(updated);
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-medium text-[#111827]"
                            />
                          </div>
                          {surveyQuestions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(idx)}
                              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0 mt-5"
                              title="Delete Question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Checkbox multi-select toggle */}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...surveyQuestions];
                            updated[idx].allowMultiple = !updated[idx].allowMultiple;
                            setSurveyQuestions(updated);
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                            q.allowMultiple
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                              : 'bg-[#F5F6F8] border-[#E5E7EB] text-[#6B7280]'
                          }`}
                        >
                          {q.allowMultiple ? <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> : <Square className="w-3.5 h-3.5 text-gray-400" />}
                          <span>Allow Multi-Select (Users can tick multiple options)</span>
                        </button>

                        {/* Option Chips */}
                        <div className="space-y-1.5 pt-1">
                          <label className="block text-xs font-medium text-[#6B7280]">Selectable Options</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-1.5 bg-[#F5F6F8] border border-[#E5E7EB] rounded-xl px-3 py-1.5">
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const updated = [...surveyQuestions];
                                    updated[idx].options[optIdx] = e.target.value;
                                    setSurveyQuestions(updated);
                                  }}
                                  className="w-full text-xs font-medium text-[#111827] bg-transparent focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(idx, optIdx)}
                                  className="text-gray-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleAddOption(idx)}
                              className="p-2 rounded-xl border border-dashed border-[#E5E7EB] hover:border-indigo-300 text-xs font-medium text-indigo-600 hover:bg-indigo-50/50 flex items-center justify-center gap-1 bg-white transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Option</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3 CONTROLS & TIME SLOTS */}
              {activeStepTab === 3 && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#E5E7EB]">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                        Step 3: Calendar & Strategy Slots
                      </h3>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">Booking Title</label>
                      <input
                        type="text"
                        value={theme.step3Title}
                        onChange={(e) => setTheme({ ...theme, step3Title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-medium text-[#111827]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">Subtitle</label>
                      <textarea
                        rows={2}
                        value={theme.step3Subtitle}
                        onChange={(e) => setTheme({ ...theme, step3Subtitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs text-[#111827]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">Confirm Button Label</label>
                      <input
                        type="text"
                        value={theme.step3ButtonText}
                        onChange={(e) => setTheme({ ...theme, step3ButtonText: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50/50 text-xs font-bold text-indigo-700"
                      />
                    </div>
                  </div>

                  {/* Time Slots Manager Card */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E5E7EB]">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                          Available Meeting Slots ({(theme.meetingSlots || []).length})
                        </h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleApplyPresetSlots('businessHours')}
                          className="px-2 py-1 text-[11px] rounded-lg bg-[#F5F6F8] hover:bg-gray-200/70 text-[#111827] font-medium"
                        >
                          9-5 Hours
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPresetSlots('evening')}
                          className="px-2 py-1 text-[11px] rounded-lg bg-[#F5F6F8] hover:bg-gray-200/70 text-[#111827] font-medium"
                        >
                          Evening Slots
                        </button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleAddSlot}
                          leftIcon={<Plus className="w-3.5 h-3.5" />}
                          className="text-xs font-medium"
                        >
                          Add Slot
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(theme.meetingSlots || ['09:00 AM', '11:00 AM', '02:00 PM', '04:30 PM']).map((slot, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-[#F5F6F8] border border-[#E5E7EB] rounded-xl px-2.5 py-1.5">
                          <input
                            type="text"
                            value={slot}
                            onChange={(e) => {
                              const updatedSlots = [...(theme.meetingSlots || [])];
                              updatedSlots[idx] = e.target.value;
                              setTheme({ ...theme, meetingSlots: updatedSlots });
                            }}
                            className="w-full text-xs font-semibold text-[#111827] bg-transparent focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(idx)}
                            className="text-gray-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4/5: CONFIRMATION PAGE & SOCIAL/ACTION BUTTONS */}
              {activeStepTab === 5 && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#E5E7EB]">
                      <CheckCheck className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                        Step 4: Success & Confirmation Page
                      </h3>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">Confirmation Title</label>
                      <input
                        type="text"
                        value={theme.step4Title}
                        onChange={(e) => setTheme({ ...theme, step4Title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-medium text-[#111827]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">Confirmation Subtitle</label>
                      <textarea
                        rows={2}
                        value={theme.step4Subtitle}
                        onChange={(e) => setTheme({ ...theme, step4Subtitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs text-[#111827]"
                      />
                    </div>

                    {/* Google Meet Link Setting */}
                    <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                      <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Google Meet / Zoom Video Call Link</span>
                      </label>
                      <input
                        type="text"
                        value={theme.googleMeetUrl || ''}
                        onChange={(e) => setTheme({ ...theme, googleMeetUrl: e.target.value })}
                        placeholder="https://meet.google.com/your-meeting-id"
                        className="w-full px-3 py-2 rounded-xl border border-indigo-200 text-xs font-mono bg-white focus:outline-none text-[#111827]"
                      />
                      <p className="text-[11px] text-indigo-700">
                        Automatically shown on confirmation screen so leads can join directly.
                      </p>
                    </div>
                  </div>

                  {/* Multi-Channel CTA Buttons Builder */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E5E7EB]">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                          Action & Community Buttons
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAddSuccessButton('whatsapp')}
                          className="px-2.5 py-1 bg-[#25D366] text-black font-bold text-[11px] rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs hover:opacity-90"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>+ WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSuccessButton('instagram')}
                          className="px-2.5 py-1 bg-pink-600 text-white font-bold text-[11px] rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs hover:opacity-90"
                        >
                          <InstagramIcon className="w-3 h-3" />
                          <span>+ Instagram</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSuccessButton('website')}
                          className="px-2.5 py-1 bg-indigo-600 text-white font-bold text-[11px] rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs hover:opacity-90"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>+ Link</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {(theme.step4Buttons || []).map((btn, bIdx) => (
                        <div key={btn.id || bIdx} className="p-3 bg-[#F5F6F8] border border-[#E5E7EB] rounded-xl space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                              {btn.type === 'whatsapp' && <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />}
                              {btn.type === 'instagram' && <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />}
                              {btn.type === 'website' && <Globe className="w-3.5 h-3.5 text-indigo-600" />}
                              <span>{btn.type ? btn.type.toUpperCase() : 'ACTION'} BUTTON #{bIdx + 1}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSuccessButton(bIdx)}
                              className="text-gray-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={btn.label}
                              onChange={(e) => {
                                const updatedBtns = [...(theme.step4Buttons || [])];
                                updatedBtns[bIdx].label = e.target.value;
                                setTheme({ ...theme, step4Buttons: updatedBtns });
                              }}
                              placeholder="Button Label..."
                              className="w-full px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#111827]"
                            />

                            <input
                              type="text"
                              value={btn.url}
                              onChange={(e) => {
                                const updatedBtns = [...(theme.step4Buttons || [])];
                                updatedBtns[bIdx].url = e.target.value;
                                setTheme({ ...theme, step4Buttons: updatedBtns });
                              }}
                              placeholder="https://..."
                              className="w-full px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-mono text-[#111827]"
                            />
                          </div>
                        </div>
                      ))}

                      {(!theme.step4Buttons || theme.step4Buttons.length === 0) && (
                        <p className="text-xs text-[#6B7280] italic">
                          No custom buttons configured. Add WhatsApp or social buttons to convert leads instantly after booking.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: THEME, COLORS & LUXURY PALETTES */}
              {activeStepTab === 4 && (
                <div className="space-y-4">
                  {/* Theme Mode & Button Style Switches */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#111827] mb-1.5">Theme Mode</label>
                        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F5F6F8] rounded-xl border border-[#E5E7EB]">
                          <button
                            type="button"
                            onClick={() => setTheme({ ...theme, themeMode: 'dark' })}
                            className={`py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              theme.themeMode === 'dark'
                                ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                                : 'text-[#6B7280] hover:text-[#111827]'
                            }`}
                          >
                            <Moon className="w-3.5 h-3.5" />
                            <span>Dark Luxury</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setTheme({ ...theme, themeMode: 'light' })}
                            className={`py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              theme.themeMode === 'light'
                                ? 'bg-white text-[#111827] shadow-2xs font-semibold'
                                : 'text-[#6B7280] hover:text-[#111827]'
                            }`}
                          >
                            <Sun className="w-3.5 h-3.5" />
                            <span>Clean Light</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#111827] mb-1.5">Button Accent Style</label>
                        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F5F6F8] rounded-xl border border-[#E5E7EB]">
                          <button
                            type="button"
                            onClick={() => setTheme({ ...theme, buttonStyle: 'gradient' })}
                            className={`py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              theme.buttonStyle === 'gradient'
                                ? 'bg-white text-[#111827] shadow-2xs font-semibold'
                                : 'text-[#6B7280] hover:text-[#111827]'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Gradient</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setTheme({ ...theme, buttonStyle: 'solid' })}
                            className={`py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              theme.buttonStyle === 'solid'
                                ? 'bg-white text-[#111827] shadow-2xs font-semibold'
                                : 'text-[#6B7280] hover:text-[#111827]'
                            }`}
                          >
                            <span>Solid Color</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Button Text Color Picker */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                          Button Text Color
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTheme({ ...theme, buttonTextColor: '#FFFFFF' })}
                          className="text-[11px] text-[#6B7280] hover:text-indigo-600 font-medium cursor-pointer"
                        >
                          Reset (#FFFFFF)
                        </button>
                        <span className="text-xs font-mono font-bold text-indigo-600">{buttonTextColor}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setTheme({ ...theme, buttonTextColor: '#FFFFFF' })}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          buttonTextColor.toUpperCase() === '#FFFFFF'
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-white text-[#111827] border-[#E5E7EB] hover:bg-gray-50'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full bg-white border border-gray-400"></span>
                        <span>White Text</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTheme({ ...theme, buttonTextColor: '#111827' })}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          buttonTextColor === '#111827' || buttonTextColor === '#000000'
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-white text-[#111827] border-[#E5E7EB] hover:bg-gray-50'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-gray-400"></span>
                        <span>Dark / Black Text</span>
                      </button>

                      {/* Custom Text Color Picker */}
                      <div className="flex items-center gap-2 p-1 bg-[#F5F6F8] rounded-xl border border-[#E5E7EB]">
                        <input
                          type="color"
                          value={theme.buttonTextColor && theme.buttonTextColor.startsWith('#') ? theme.buttonTextColor : '#FFFFFF'}
                          onChange={(e) => setTheme({ ...theme, buttonTextColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-[#E5E7EB] p-0 shrink-0 shadow-2xs"
                          title="Custom Button Text Color Wheel"
                        />
                        <div className="relative flex-1">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-gray-400">#</span>
                          <input
                            type="text"
                            value={(theme.buttonTextColor || '#FFFFFF').replace('#', '')}
                            onChange={(e) => {
                              const val = e.target.value.trim();
                              const cleanHex = val.startsWith('#') ? val : `#${val}`;
                              setTheme({ ...theme, buttonTextColor: cleanHex });
                            }}
                            placeholder="FFFFFF"
                            maxLength={7}
                            className="w-full pl-5 pr-2 py-1 bg-white border border-[#E5E7EB] rounded-lg text-xs font-mono font-bold text-[#111827] uppercase focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Custom Hex Code Color Input */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                          Custom Primary Color
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTheme({ ...theme, primaryColor: '#8146F0' })}
                          className="text-[11px] text-[#6B7280] hover:text-indigo-600 font-medium cursor-pointer"
                        >
                          Reset (#8146F0)
                        </button>
                        <span className="text-xs font-mono font-bold text-indigo-600">{primaryColor}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <input
                        type="color"
                        value={theme.primaryColor && theme.primaryColor.startsWith('#') ? theme.primaryColor : '#8146F0'}
                        onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-[#E5E7EB] shadow-2xs p-0 overflow-hidden shrink-0"
                        title="Pick Color Wheel"
                      />

                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-gray-400">#</span>
                        <input
                          type="text"
                          value={(theme.primaryColor || '#8146F0').replace('#', '')}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            const cleanHex = val.startsWith('#') ? val : `#${val}`;
                            setTheme({ ...theme, primaryColor: cleanHex });
                          }}
                          placeholder="8146F0"
                          maxLength={7}
                          className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-xs font-mono font-bold text-[#111827] focus:outline-none focus:border-indigo-500 uppercase"
                        />
                      </div>

                      <div
                        className="px-3.5 py-2 rounded-xl text-xs font-bold font-mono shadow-2xs border border-black/10 shrink-0 text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Active
                      </div>
                    </div>
                  </div>

                  {/* 28 Luxury Brand Preset Palettes */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E5E7EB]">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                        28 Curated Brand Palettes
                      </h4>

                      {/* Category Filter Pills */}
                      <div className="flex items-center gap-1">
                        {['All', 'Luxury', 'SaaS & Tech', 'Vibrant', 'Corporate'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedColorCategory(cat)}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                              selectedColorCategory === cat
                                ? 'bg-indigo-600 text-white font-semibold'
                                : 'bg-[#F5F6F8] text-[#6B7280] hover:text-[#111827]'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[260px] overflow-y-auto pr-1">
                      {filteredPresetColors.map((c) => {
                        const isSelected = theme.primaryColor?.toLowerCase() === c.hex.toLowerCase();
                        return (
                          <button
                            type="button"
                            key={c.hex}
                            onClick={() => setTheme({ ...theme, primaryColor: c.hex })}
                            className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-2 border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-2xs'
                                : 'border-[#E5E7EB] bg-[#F5F6F8] text-[#111827] hover:bg-gray-100'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-2xs"
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

              {/* STEP 6: CHATGPT JSON STUDIO */}
              {activeStepTab === 6 && (
                <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E5E7EB]">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] flex items-center gap-1.5">
                        <Code className="w-4 h-4 text-indigo-600" />
                        <span>Full Funnel JSON Schema</span>
                      </h4>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        Copy this schema to give to ChatGPT or paste AI generated funnel configs.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyFullJson}
                        leftIcon={jsonCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        className="text-xs font-medium"
                      >
                        {jsonCopied ? 'Copied!' : 'Copy Schema'}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePasteFromClipboard}
                        leftIcon={<ClipboardPaste className="w-3.5 h-3.5" />}
                        className="text-xs font-medium"
                      >
                        Paste Clipboard
                      </Button>
                    </div>
                  </div>

                  {jsonError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                      ⚠️ {jsonError}
                    </div>
                  )}

                  <textarea
                    rows={15}
                    value={fullJsonText}
                    onChange={(e) => setFullJsonText(e.target.value)}
                    placeholder="Paste JSON configuration generated by ChatGPT..."
                    className="w-full p-3.5 rounded-xl bg-[#0F172A] border border-gray-800 text-emerald-400 font-mono text-xs focus:outline-none focus:border-indigo-500 leading-relaxed shadow-inner"
                  />

                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleApplyFullJson}
                    leftIcon={<Zap className="w-4 h-4" />}
                    className="w-full text-xs font-semibold"
                  >
                    Apply & Sync JSON Live
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 6 COLUMNS: REAL-TIME INTERACTIVE LIVE PREVIEW */}
          <div className="lg:col-span-6 bg-[#0B0F17] p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-y-auto">
            
            {/* Top Preview Controls Bar */}
            <div className="w-full flex items-center justify-between gap-2 pb-4 text-xs font-medium text-gray-400">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span className="text-gray-300 font-semibold">Live Interactive Preview</span>
              </div>

              <div className="flex items-center gap-1 bg-[#1E293B] p-1 rounded-xl border border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-all ${
                    previewDevice === 'mobile' ? 'bg-indigo-600 text-white font-semibold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-all ${
                    previewDevice === 'desktop' ? 'bg-indigo-600 text-white font-semibold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Modal</span>
                </button>
              </div>
            </div>

            {/* LIVE PREVIEW CONTAINER */}
            <div
              className={`border shadow-2xl w-full max-w-sm overflow-hidden relative transition-all duration-200 ${
                previewDevice === 'mobile' ? 'rounded-[36px] my-2' : 'rounded-3xl my-2'
              } ${
                isLightMode ? 'bg-white text-[#111827] border-gray-200' : 'bg-[#0F172A] text-white border-slate-800'
              }`}
              style={{ borderColor: isLightMode ? '#E5E7EB' : `${primaryColor}40` }}
            >
              {/* Header inside modal */}
              <div className="p-5 pb-2 text-center space-y-2">
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border"
                  style={{ backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}40`, color: primaryColor }}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>
                    {theme.badgeText || (activeStepTab === 2 ? `Question 1 of ${surveyQuestions.length}` : `Step ${activeStepTab > 4 ? 3 : activeStepTab} of 3`)}
                  </span>
                </div>

                <h3 className={`text-base sm:text-lg font-bold tracking-tight ${isLightMode ? 'text-[#111827]' : 'text-white'}`}>
                  {activeStepTab === 1 && (theme.step1Title || 'Claim Your 1-on-1 Growth Consultation')}
                  {activeStepTab === 2 && (theme.step2Title || 'Qualify Your Requirements')}
                  {activeStepTab === 3 && (theme.step3Title || 'Lock Your Strategy Call Slot')}
                  {activeStepTab === 5 && (theme.step4Title || 'Booking Confirmed! 🎉')}
                  {(activeStepTab === 4 || activeStepTab === 6) && (theme.step1Title || 'Claim Your 1-on-1 Growth Consultation')}
                </h3>

                <p className={`text-xs block leading-relaxed ${isLightMode ? 'text-[#6B7280]' : 'text-gray-400'}`}>
                  {activeStepTab === 1 && (theme.step1Subtitle || 'Enter your details to reserve your custom revenue strategy session')}
                  {activeStepTab === 2 && (theme.step2Subtitle || 'Answer quick questions so we can customize your roadmap')}
                  {activeStepTab === 3 && (theme.step3Subtitle || 'Pick a date & time slot for your 1-on-1 session')}
                  {activeStepTab === 5 && (theme.step4Subtitle || 'Your meeting is locked in our calendar and CRM.')}
                  {(activeStepTab === 4 || activeStepTab === 6) && (theme.step1Subtitle || 'Enter your details to reserve your session')}
                </p>
              </div>

              {/* LIVE FORM CONTENT STEP 1 */}
              {(activeStepTab === 1 || activeStepTab === 4 || activeStepTab === 6) && (
                <div className="p-5 pt-2 space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      {theme.nameLabel || 'FULL NAME *'}
                    </label>
                    <input
                      type="text"
                      disabled
                      placeholder={theme.namePlaceholder || 'Enter your full name'}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-medium ${
                        isLightMode ? 'bg-gray-100 border-gray-300 text-gray-900' : 'bg-[#1E293B] border-slate-700 text-white'
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
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-medium ${
                        isLightMode ? 'bg-gray-100 border-gray-300 text-gray-900' : 'bg-[#1E293B] border-slate-700 text-white'
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
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-medium ${
                        isLightMode ? 'bg-gray-100 border-gray-300 text-gray-900' : 'bg-[#1E293B] border-slate-700 text-white'
                      }`}
                    />
                  </div>

                  <button
                    className="w-full py-3 px-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md mt-1 cursor-pointer transition-all"
                    style={getButtonStyle()}
                  >
                    <span>{theme.step1ButtonText || 'CONTINUE TO SELECT SLOT'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <p className="text-[10px] text-center text-gray-400 pt-1">
                    {theme.step1FooterCopy || '100% free strategy session • no sales pitch'}
                  </p>
                </div>
              )}

              {/* LIVE FORM CONTENT STEP 2 */}
              {activeStepTab === 2 && (
                <div className="p-5 pt-2 space-y-3">
                  <div className="w-full bg-gray-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 transition-all" style={{ backgroundColor: primaryColor }} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold" style={{ color: primaryColor }}>
                      Q1. {surveyQuestions[0]?.label || 'Select Your Primary Industry'}
                    </label>
                    <div className={`grid gap-1.5 ${previewHasLongOption ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      {(surveyQuestions[0]?.options || ['Service Business', 'Manufacturer / B2B', 'Medical / Clinic', 'E-commerce']).map((opt, idx) => (
                        <div
                          key={opt}
                          className={`p-2.5 rounded-xl text-[11px] font-semibold border whitespace-normal break-words leading-tight ${
                            idx === 0
                              ? 'border-indigo-500/60 bg-indigo-500/20 text-white'
                              : isLightMode
                              ? 'bg-[#F8FAFC] border-gray-200 text-gray-700'
                              : 'bg-[#1E293B] border-slate-700 text-gray-300'
                          }`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    className="w-full py-3 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md mt-2 cursor-pointer"
                    style={getButtonStyle()}
                  >
                    <span>{surveyQuestions.length > 1 ? 'NEXT QUESTION ➡️' : (theme.step2ButtonText || 'PROCEED TO TIME SLOT')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* LIVE FORM CONTENT STEP 3 */}
              {activeStepTab === 3 && (
                <div className="p-5 pt-2 space-y-3">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      {theme.dateLabel || 'SELECT PREFERRED MEETING DATE *'}
                    </label>

                    {/* Date Carousel */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {['Wed 11 Aug', 'Thu 12 Aug', 'Fri 13 Aug', 'Sat 14 Aug'].map((d, i) => (
                        <div
                          key={d}
                          className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-semibold shrink-0 ${
                            i === 0
                              ? 'border-indigo-400 bg-indigo-500/20 text-white font-bold'
                              : isLightMode
                              ? 'bg-gray-100 border-gray-200 text-gray-700'
                              : 'bg-[#1E293B] border-slate-700 text-gray-400'
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

                    {/* Time Slot Grid */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {(theme.meetingSlots || ['09:00 AM', '11:00 AM', '02:00 PM', '04:30 PM']).map((slot, idx) => (
                        <div
                          key={slot}
                          className={`p-2 rounded-xl text-[10px] font-semibold flex items-center justify-center gap-1 border truncate ${
                            idx === 2
                              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 font-bold'
                              : isLightMode
                              ? 'bg-gray-100 border-gray-200 text-gray-700'
                              : 'bg-[#1E293B] border-slate-700 text-gray-400'
                          }`}
                        >
                          <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span className="truncate">{slot}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    className="w-full py-3 px-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md mt-1 cursor-pointer"
                    style={getButtonStyle()}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{theme.step3ButtonText || 'CONFIRM & LOCK BOOKING 📅'}</span>
                  </button>
                </div>
              )}

              {/* LIVE FORM CONTENT STEP 4 / CONFIRMATION */}
              {activeStepTab === 5 && (
                <div className="p-5 pt-2 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h4 className={`text-base font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                      {theme.step4Title || 'Booking Confirmed! 🎉'}
                    </h4>
                    <p className={`text-xs leading-relaxed ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                      {theme.step4Subtitle || 'Your meeting is locked in our calendar.'}
                    </p>
                  </div>

                  {theme.googleMeetUrl && (
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono flex items-center justify-center gap-1.5">
                      <Video className="w-3.5 h-3.5" />
                      <span className="truncate">{theme.googleMeetUrl}</span>
                    </div>
                  )}

                  {theme.step4Buttons && theme.step4Buttons.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {theme.step4Buttons.map((btn) => {
                        const bType = btn.type || 'custom';
                        if (bType === 'whatsapp') {
                          return (
                            <div
                              key={btn.id}
                              className="w-full py-2.5 px-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 bg-[#25D366] text-white shadow-sm cursor-pointer"
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
                              className="w-full py-2.5 px-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white shadow-sm cursor-pointer"
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
                              className="w-full py-2.5 px-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 bg-indigo-600 text-white shadow-sm cursor-pointer"
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
                            className="w-full py-2.5 px-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 text-white shadow-sm cursor-pointer"
                            style={{ backgroundColor: successButtonColor }}
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span className="truncate">{btn.label}</span>
                            <ExternalLink className="w-3.5 h-3.5 ml-auto" />
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
