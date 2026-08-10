'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  X,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  Mail,
  ChevronRight,
  Clock,
  RotateCcw,
  Square,
  CheckSquare,
  MessageCircle,
  ExternalLink,
  Globe,
  Link as LinkIcon,
  ArrowLeft,
  UserPlus,
  Plus,
} from 'lucide-react';
import { Button } from '../ui/Button';

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export interface SurveyQuestion {
  id: string;
  label: string;
  options: string[];
  allowMultiple?: boolean;
}

export interface SuccessButton {
  id: string;
  label: string;
  url: string;
  type?: 'whatsapp' | 'website' | 'instagram' | 'custom';
  customColor?: string;
}

export interface PopupThemeConfig {
  primaryColor?: string;
  themeMode?: 'dark' | 'light';
  buttonStyle?: 'solid' | 'gradient';
  badgeText?: string;
  // Step 1
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
  // Step 2
  step2Title?: string;
  step2Subtitle?: string;
  step2ButtonText?: string;
  // Step 3
  step3Title?: string;
  step3Subtitle?: string;
  step3ButtonText?: string;
  dateLabel?: string;
  timeSlotLabel?: string;
  meetingSlots?: string[];
  // Step 4
  step4Title?: string;
  step4Subtitle?: string;
  step4ButtonColor?: string;
  step4Buttons?: SuccessButton[];
}

interface ThreePopupFunnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyQuestions?: SurveyQuestion[];
  popupTheme?: PopupThemeConfig;
  funnelId?: string;
  userId?: string;
  onComplete?: (leadData: any) => void;
}

// Generate next 7 days for horizontal slider
function getUpcomingDates() {
  const dates = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const year = d.getFullYear();
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    const isoDate = `${year}-${monthStr}-${dayStr}`;

    dates.push({
      isoDate,
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : daysOfWeek[d.getDay()],
      dayNum: d.getDate(),
      monthName: months[d.getMonth()],
    });
  }
  return dates;
}

export function ThreePopupFunnelModal({
  isOpen,
  onClose,
  surveyQuestions = [
    {
      id: 'q1',
      label: 'Select Your Primary Industry',
      options: ['Service Business', 'Manufacturer / B2B', 'Medical / Clinic', 'E-commerce Store'],
      allowMultiple: false,
    },
  ],
  popupTheme = {},
  funnelId,
  userId,
  onComplete,
}: ThreePopupFunnelModalProps) {
  const primaryColor = popupTheme.primaryColor || '#F59E0B';
  const isLightMode = popupTheme.themeMode === 'light';
  const isSolidButton = popupTheme.buttonStyle === 'solid';

  const badgeText = popupTheme.badgeText || 'FAST 30-SEC BOOKING';
  
  // Step 1 Copy
  const step1Title = popupTheme.step1Title || 'Claim Your 1-on-1 Growth Consultation';
  const step1Subtitle = popupTheme.step1Subtitle || 'Enter your details to reserve your custom revenue strategy session';
  const step1BtnText = popupTheme.step1ButtonText || 'CONTINUE TO SELECT SLOT';
  const nameLabel = popupTheme.nameLabel || 'Full Name *';
  const namePlaceholder = popupTheme.namePlaceholder || 'Enter your full name';
  const emailLabel = popupTheme.emailLabel || 'Work Email *';
  const emailPlaceholder = popupTheme.emailPlaceholder || 'name@company.com';
  const phoneLabel = popupTheme.phoneLabel || 'WhatsApp Phone Number *';
  const phonePlaceholder = popupTheme.phonePlaceholder || '+91 9876543210';
  const step1FooterCopy = popupTheme.step1FooterCopy || '100% free strategy session • no sales pitch';

  // Step 2 Copy
  const step2Title = popupTheme.step2Title || 'Qualify Your Business Requirements';
  const step2Subtitle = popupTheme.step2Subtitle || 'Answer quick questions so we can customize your growth roadmap';
  const step2BtnText = popupTheme.step2ButtonText || 'PROCEED TO TIME SLOT';

  // Step 3 Copy & Slots
  const step3Title = popupTheme.step3Title || 'Lock Your Strategy Call Slot';
  const step3Subtitle = popupTheme.step3Subtitle || 'Pick a date & time slot for your 1-on-1 session';
  const step3BtnText = popupTheme.step3ButtonText || 'CONFIRM & LOCK BOOKING 📅';
  const dateLabel = popupTheme.dateLabel || 'Select Preferred Meeting Date *';
  const timeSlotLabel = popupTheme.timeSlotLabel || 'Select Strategy Call Time Slot *';
  const availableTimeSlots = (popupTheme.meetingSlots && popupTheme.meetingSlots.length > 0)
    ? popupTheme.meetingSlots
    : ['09:00 AM', '11:00 AM', '02:00 PM', '04:30 PM', '06:00 PM'];

  // Step 4 Copy & Buttons & Custom Color (Default: primaryColor)
  const step4Title = popupTheme.step4Title || 'Booking Confirmed! 🎉';
  const step4Subtitle = popupTheme.step4Subtitle || 'Your meeting is locked in our calendar and CRM. We look forward to speaking!';
  const successButtonColor = popupTheme.step4ButtonColor || primaryColor;
  const successButtons: SuccessButton[] = popupTheme.step4Buttons || [
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
  ];

  const upcomingDates = useMemo(() => getUpcomingDates(), []);

  // Active popup step: 1 (Contact), 2 (Survey), 3 (Meeting), 4 (Completed Confirmation)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingLeadId, setExistingLeadId] = useState<string | null>(null);

  // Popup 1 State: Contact Info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Popup 2 State: Survey Responses
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, any>>({});

  // Popup 3 State: Date & Time Slot
  const [selectedIsoDate, setSelectedIsoDate] = useState(upcomingDates[0]?.isoDate || '2026-08-10');
  const [meetingTime, setMeetingTime] = useState(availableTimeSlots[0] || '02:00 PM');

  // Helper to update URL search parameter cleanly without page refresh
  const updateUrlStep = (targetStep: 1 | 2 | 3 | 4) => {
    if (typeof window === 'undefined') return;
    const stepNameMap: Record<number, string> = {
      1: 'detail',
      2: 'survey',
      3: 'meeting',
      4: 'confirmation',
    };
    const stepParam = stepNameMap[targetStep] || 'detail';
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('step', stepParam);
      window.history.pushState({}, '', url.toString());
    } catch (err) {}
  };

  const changeStep = (newStep: 1 | 2 | 3 | 4) => {
    setStep(newStep);
    updateUrlStep(newStep);
  };

  const handleCloseModal = () => {
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('step');
        window.history.pushState({}, '', url.toString());
      } catch (err) {}
    }
    onClose();
  };

  // Helper to instantly persist contact info to localStorage as user types
  const saveContactInfoToStorage = (updatedName?: string, updatedEmail?: string, updatedPhone?: string) => {
    try {
      const nameToSave = updatedName !== undefined ? updatedName : name;
      const emailToSave = updatedEmail !== undefined ? updatedEmail : email;
      const phoneToSave = updatedPhone !== undefined ? updatedPhone : phone;

      const existingSession = localStorage.getItem('lead_funnel_session');
      const parsed = existingSession ? JSON.parse(existingSession) : {};

      const newSession = {
        ...parsed,
        name: nameToSave,
        email: emailToSave,
        phone: phoneToSave,
        leadId: existingLeadId || parsed.leadId,
      };

      localStorage.setItem('lead_funnel_session', JSON.stringify(newSession));
      localStorage.setItem('lead_contact_info', JSON.stringify({ name: nameToSave, email: emailToSave, phone: phoneToSave }));
    } catch (err) {}
  };

  // Inspect browser localStorage & URL search params when modal is opened
  useEffect(() => {
    if (isOpen) {
      let initialStep: 1 | 2 | 3 | 4 = 1;
      let hasSavedDetails = false;
      let hasSavedSurvey = false;

      // 1. Check browser localStorage for saved lead contact info and survey answers
      try {
        const savedSession = localStorage.getItem('lead_funnel_session') || localStorage.getItem('lead_contact_info');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed.name || parsed.email || parsed.phone) {
            setName(parsed.name || '');
            setEmail(parsed.email || '');
            setPhone(parsed.phone || '');
            if (parsed.leadId) setExistingLeadId(parsed.leadId);

            if (parsed.name && (parsed.email || parsed.phone)) {
              hasSavedDetails = true;
            }
          }
          if (parsed.surveyAnswers && Object.keys(parsed.surveyAnswers).length > 0) {
            setSurveyAnswers(parsed.surveyAnswers);
            hasSavedSurvey = Boolean(parsed.hasCompletedSurvey || Object.keys(parsed.surveyAnswers).length >= surveyQuestions.length);
          }
        }
      } catch (err) {}

      // 2. Determine initial step based on saved details priority
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlStep = params.get('step')?.toLowerCase();

        if (hasSavedDetails && hasSavedSurvey) {
          // If details and survey completed -> Step 3 (Meeting) unless user requested confirmation
          initialStep = urlStep === 'confirmation' ? 4 : 3;
        } else if (hasSavedDetails) {
          // If details completed -> Step 2 (Survey) unless user requested meeting/confirmation
          if (urlStep === 'meeting') initialStep = 3;
          else if (urlStep === 'confirmation') initialStep = 4;
          else initialStep = 2;
        } else {
          // If details missing -> Must complete Step 1 first
          initialStep = 1;
        }
      } else {
        if (hasSavedDetails && hasSavedSurvey) {
          initialStep = 3;
        } else if (hasSavedDetails) {
          initialStep = 2;
        } else {
          initialStep = 1;
        }
      }

      setStep(initialStep);
      updateUrlStep(initialStep);
    }
  }, [isOpen, surveyQuestions]);

  if (!isOpen) return null;

  const saveSessionToLocalStorage = (updatedAnswers?: Record<string, any>, isSurveyFinished?: boolean, customLeadId?: string) => {
    try {
      const answersToSave = updatedAnswers || surveyAnswers;
      const isFinished = isSurveyFinished ?? (Object.keys(answersToSave).length >= surveyQuestions.length);
      const activeLeadId = customLeadId || existingLeadId;
      localStorage.setItem(
        'lead_funnel_session',
        JSON.stringify({
          name,
          email,
          phone,
          leadId: activeLeadId,
          surveyAnswers: answersToSave,
          hasCompletedSurvey: isFinished,
        })
      );
    } catch (err) {}
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email) {
      alert('Please fill out Name, Phone, and Email');
      return;
    }

    setIsSubmitting(true);
    let activeLeadId = existingLeadId;

    try {
      const cleanPhone = phone.trim();

      // Check if a lead with this exact phone number already exists in Supabase
      if (!activeLeadId && cleanPhone) {
        const { data: phoneMatch } = await supabase
          .from('leads')
          .select('id')
          .eq('phone', cleanPhone)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (phoneMatch?.id) {
          activeLeadId = phoneMatch.id;
          setExistingLeadId(phoneMatch.id);
        }
      }

      const step1Payload = {
        funnel_id: funnelId || null,
        user_id: userId || null,
        name,
        email,
        phone: cleanPhone,
        step_progress: 'step1_contact',
      };

      if (activeLeadId) {
        // Update existing lead with matching ID or Phone number
        const { data, error } = await supabase
          .from('leads')
          .update(step1Payload)
          .eq('id', activeLeadId)
          .select()
          .single();

        if (!error && data?.id) {
          activeLeadId = data.id;
        }
      } else {
        // Insert new lead in Supabase
        const { data, error } = await supabase
          .from('leads')
          .insert(step1Payload)
          .select()
          .single();

        if (!error && data?.id) {
          activeLeadId = data.id;
          setExistingLeadId(data.id);
        }
      }
    } catch (err) {
      console.error('Error saving step 1 lead info in Supabase:', err);
    } finally {
      setIsSubmitting(false);
      saveSessionToLocalStorage(surveyAnswers, false, activeLeadId || undefined);
      changeStep(2);
      setCurrentQuestionIndex(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < surveyQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      saveSessionToLocalStorage(surveyAnswers, true);
      changeStep(3);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else {
      changeStep(1);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalLeadPayload = {
      funnel_id: funnelId || null,
      user_id: userId || null,
      name,
      phone,
      email,
      step_progress: 'meeting_booked',
      survey_responses: surveyAnswers,
      meeting_date: selectedIsoDate,
      meeting_time: meetingTime,
    };

    try {
      if (existingLeadId) {
        await supabase
          .from('leads')
          .update(finalLeadPayload)
          .eq('id', existingLeadId);
      } else {
        await supabase.from('leads').insert(finalLeadPayload);
      }
    } catch (err) {
      console.error('Error inserting/updating lead in Supabase:', err);
    } finally {
      setIsSubmitting(false);
      saveSessionToLocalStorage(surveyAnswers, true);
      if (onComplete) onComplete(finalLeadPayload);
      changeStep(4);
    }
  };

  const resetLeadSession = () => {
    localStorage.removeItem('lead_funnel_session');
    localStorage.removeItem('lead_contact_info');
    setName('');
    setEmail('');
    setPhone('');
    setSurveyAnswers({});
    setExistingLeadId(null);
    changeStep(1);
    setCurrentQuestionIndex(0);
  };

  const handleOptionSelect = (qId: string, opt: string, isMultiple?: boolean) => {
    let updated: Record<string, any>;
    if (isMultiple) {
      const currentList: string[] = Array.isArray(surveyAnswers[qId]) ? surveyAnswers[qId] : [];
      const newList = currentList.includes(opt)
        ? currentList.filter((item) => item !== opt)
        : [...currentList, opt];
      updated = { ...surveyAnswers, [qId]: newList };
      setSurveyAnswers(updated);
      saveSessionToLocalStorage(updated);
    } else {
      updated = { ...surveyAnswers, [qId]: opt };
      setSurveyAnswers(updated);
      const isFinal = currentQuestionIndex >= surveyQuestions.length - 1;
      saveSessionToLocalStorage(updated, isFinal);

      // Incremental Background Persistence to Supabase
      if (existingLeadId) {
        (async () => {
          try {
            await supabase
              .from('leads')
              .update({
                survey_responses: updated,
                step_progress: 'survey_completed',
              })
              .eq('id', existingLeadId);
          } catch (err) {
            console.error('Error saving incremental survey to Supabase:', err);
          }
        })();
      }

      setTimeout(() => {
        if (currentQuestionIndex < surveyQuestions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
        } else {
          changeStep(3);
        }
      }, 180);
    }
  };

  const getButtonStyle = () => {
    if (isSolidButton) {
      return { backgroundColor: primaryColor, color: '#000000' };
    }
    return { background: `linear-gradient(to right, ${primaryColor}, #FCD34D)`, color: '#000000' };
  };

  const currentQ = surveyQuestions[currentQuestionIndex] || surveyQuestions[0];
  const totalQuestions = surveyQuestions.length;
  // Dynamic layout: if any option text is > 20 characters, show 1 option per row (grid-cols-1)
  const hasLongOption = currentQ?.options?.some((opt) => opt.length > 20);

  // Icon & Style Helper for Success Buttons
  const renderSuccessButton = (btn: SuccessButton) => {
    const bType = btn.type || 'custom';

    if (bType === 'whatsapp') {
      return (
        <a
          key={btn.id || btn.label}
          href={btn.url}
          target="_blank"
          rel="noreferrer"
          className="w-full py-3 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-black shadow-md transition-all hover:brightness-105 cursor-pointer"
          style={{ backgroundColor: btn.customColor || '#25D366' }}
        >
          <MessageCircle className="w-4 h-4" />
          <span>{btn.label}</span>
          <ExternalLink className="w-3.5 h-3.5 ml-auto" />
        </a>
      );
    }

    if (bType === 'instagram') {
      return (
        <a
          key={btn.id || btn.label}
          href={btn.url}
          target="_blank"
          rel="noreferrer"
          className="w-full py-3 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-white shadow-md transition-all hover:brightness-105 cursor-pointer"
          style={
            btn.customColor
              ? { backgroundColor: btn.customColor }
              : { background: 'linear-gradient(to right, #833AB4, #FD1D1D, #FCB045)' }
          }
        >
          <InstagramIcon className="w-4 h-4" />
          <span>{btn.label}</span>
          <ExternalLink className="w-3.5 h-3.5 ml-auto" />
        </a>
      );
    }

    if (bType === 'website') {
      return (
        <a
          key={btn.id || btn.label}
          href={btn.url}
          target="_blank"
          rel="noreferrer"
          className="w-full py-3 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-white shadow-md transition-all hover:brightness-105 cursor-pointer"
          style={{ backgroundColor: btn.customColor || '#2563EB' }}
        >
          <Globe className="w-4 h-4" />
          <span>{btn.label}</span>
          <ExternalLink className="w-3.5 h-3.5 ml-auto" />
        </a>
      );
    }

    return (
      <a
        key={btn.id || btn.label}
        href={btn.url}
        target="_blank"
        rel="noreferrer"
        className="w-full py-3 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-black shadow-md transition-all hover:brightness-105 cursor-pointer"
        style={{ backgroundColor: btn.customColor || successButtonColor }}
      >
        <LinkIcon className="w-4 h-4" />
        <span>{btn.label}</span>
        <ExternalLink className="w-3.5 h-3.5 ml-auto" />
      </a>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseModal();
      }}
    >
      <div
        className={`border rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative ${
          isLightMode ? 'bg-white text-[#111827] border-gray-200' : 'bg-[#0B0F17] text-white border-amber-500/30'
        }`}
        style={{ borderColor: isLightMode ? '#E5E7EB' : `${primaryColor}50` }}
      >
        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <button
            onClick={resetLeadSession}
            title="Fill details for a new lead"
            aria-label="Fill details for a new lead"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border shadow-2xs hover:scale-105 active:scale-95 shrink-0"
            style={{
              backgroundColor: `${primaryColor}18`,
              borderColor: `${primaryColor}40`,
              color: primaryColor,
            }}
          >
            <Plus className="w-4 h-4 stroke-[2.8]" />
          </button>

          <button
            onClick={handleCloseModal}
            className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all shrink-0 ${
              isLightMode ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Header */}
        <div className="p-6 pb-2 text-center space-y-2.5">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border"
            style={{
              backgroundColor: `${primaryColor}15`,
              borderColor: `${primaryColor}40`,
              color: primaryColor,
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
            <span>
              {step === 2 ? `Question ${currentQuestionIndex + 1} of ${totalQuestions}` : `Step ${step > 3 ? 3 : step} of 3`}
            </span>
            <span className="text-gray-400">•</span>
            <span>{badgeText}</span>
          </div>

          <h3 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${isLightMode ? 'text-[#111827]' : 'text-white'}`}>
            {step === 1 && step1Title}
            {step === 2 && (step2Title || 'Qualify Your Business Requirements')}
            {step === 3 && step3Title}
            {step === 4 && step4Title}
          </h3>

          <p className={`text-xs block leading-relaxed ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
            {step === 1 && step1Subtitle}
            {step === 2 && (step2Subtitle || 'Answer quick questions so we can customize your growth roadmap')}
            {step === 3 && step3Subtitle}
            {step === 4 && step4Subtitle}
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 pt-2">
          {/* STEP 1: CONTACT INFO */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-3.5">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  {nameLabel}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setName(val);
                      saveContactInfoToStorage(val, undefined, undefined);
                    }}
                    onBlur={() => saveContactInfoToStorage()}
                    placeholder={namePlaceholder}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none ${
                      isLightMode ? 'bg-[#F8FAFC] border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-[#131B2A] border-gray-800 text-white placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  {emailLabel}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEmail(val);
                      saveContactInfoToStorage(undefined, val, undefined);
                    }}
                    onBlur={() => saveContactInfoToStorage()}
                    placeholder={emailPlaceholder}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none ${
                      isLightMode ? 'bg-[#F8FAFC] border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-[#131B2A] border-gray-800 text-white placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  {phoneLabel}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPhone(val);
                      saveContactInfoToStorage(undefined, undefined, val);
                    }}
                    onBlur={() => saveContactInfoToStorage()}
                    placeholder={phonePlaceholder}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none ${
                      isLightMode ? 'bg-[#F8FAFC] border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-[#131B2A] border-gray-800 text-white placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-0.5 shadow-lg transition-all cursor-pointer mt-1"
                style={getButtonStyle()}
              >
                <span className="flex items-center gap-1.5 text-sm">
                  <span>{isSubmitting ? 'Saving...' : step1BtnText}</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold opacity-80 font-mono">
                  {step1FooterCopy}
                </span>
              </button>
            </form>
          )}

          {/* STEP 2: ONE QUESTION AT A TIME PROGRESSIVE SURVEY */}
          {step === 2 && currentQ && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Question Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                    backgroundColor: primaryColor,
                  }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs sm:text-sm font-extrabold" style={{ color: primaryColor }}>
                    Q{currentQuestionIndex + 1}. {currentQ.label}
                  </label>
                  {currentQ.allowMultiple && (
                    <span className="text-[10px] text-gray-400 font-mono">(Tick 1 or Multiple)</span>
                  )}
                </div>

                {/* DYNAMIC GRID: 1 OPTION PER ROW IF TEXT LENGTH > 20, ELSE 2-COLUMN */}
                <div className={`grid gap-2 pt-1 max-h-[280px] overflow-y-auto pr-1 ${hasLongOption ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  {currentQ.options.map((opt) => {
                    const isMultiple = currentQ.allowMultiple;
                    const isSelected = isMultiple
                      ? Array.isArray(surveyAnswers[currentQ.id]) && surveyAnswers[currentQ.id].includes(opt)
                      : surveyAnswers[currentQ.id] === opt;

                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => handleOptionSelect(currentQ.id, opt, isMultiple)}
                        className={`p-3 rounded-xl text-xs font-bold text-left leading-relaxed whitespace-normal break-words border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'shadow-md scale-[1.01]'
                            : isLightMode
                            ? 'border-gray-200 bg-[#F8FAFC] text-gray-800 hover:border-gray-300'
                            : 'border-gray-800 bg-[#131B2A] text-gray-300 hover:border-gray-700'
                        }`}
                        style={
                          isSelected
                            ? {
                                borderColor: primaryColor,
                                backgroundColor: `${primaryColor}25`,
                                color: isLightMode ? '#111827' : '#FFFFFF',
                              }
                            : {}
                        }
                      >
                        <span className="flex-1">{opt}</span>
                        {isMultiple ? (
                          <span className="shrink-0 ml-1">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-500" />
                            )}
                          </span>
                        ) : (
                          isSelected && <CheckCircle2 className="w-4 h-4 shrink-0 ml-1" style={{ color: primaryColor }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation controls for survey step */}
              <div className="flex items-center justify-between gap-2 pt-2">
                {currentQuestionIndex > 0 ? (
                  <button
                    type="button"
                    onClick={handlePrevQuestion}
                    className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border border-gray-300 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                ) : <div />}

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  style={getButtonStyle()}
                >
                  <span>
                    {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : (step2BtnText || 'Proceed to Time Slot')}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SLIDABLE MEETING DATE CAROUSEL & 3-PER-ROW TIME SLOTS GRID */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-4">
              {/* HORIZONTAL DATE SLIDER CAROUSEL */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  {dateLabel}
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                  {upcomingDates.map((item) => {
                    const isSelected = selectedIsoDate === item.isoDate;
                    return (
                      <button
                        type="button"
                        key={item.isoDate}
                        onClick={() => setSelectedIsoDate(item.isoDate)}
                        className={`flex flex-col items-center justify-center min-w-[62px] py-2 px-1.5 rounded-2xl border text-center transition-all cursor-pointer shrink-0 ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/20 text-white shadow-md font-extrabold'
                            : isLightMode
                            ? 'border-gray-200 bg-[#F8FAFC] text-gray-700 hover:bg-gray-100'
                            : 'border-gray-800 bg-[#131B2A] text-gray-400 hover:border-gray-700'
                        }`}
                        style={isSelected ? { borderColor: primaryColor, backgroundColor: `${primaryColor}20` } : {}}
                      >
                        <span className="text-[10px] uppercase tracking-wider font-semibold opacity-75">{item.dayName}</span>
                        <span className="text-base font-extrabold my-0.5" style={{ color: isSelected ? primaryColor : undefined }}>
                          {item.dayNum}
                        </span>
                        <span className="text-[9px] uppercase font-mono text-gray-400">{item.monthName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TIME SLOTS: 3 PER ROW GRID (NEXT & REST ADJUST NEATLY) */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  {timeSlotLabel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimeSlots.map((slot) => {
                    const isSelected = meetingTime === slot;
                    return (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setMeetingTime(slot)}
                        className={`p-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer truncate ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-md font-extrabold'
                            : isLightMode
                            ? 'border-gray-200 bg-[#F8FAFC] text-gray-800 hover:bg-gray-100'
                            : 'border-gray-800 bg-[#131B2A] text-gray-300 hover:border-gray-700'
                        }`}
                      >
                        <Clock className="w-3 h-3 shrink-0" style={{ color: primaryColor }} />
                        <span className="truncate">{slot}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer mt-2"
                style={getButtonStyle()}
              >
                <Calendar className="w-4 h-4" />
                <span>{isSubmitting ? 'Securing Slot...' : step3BtnText}</span>
              </button>
            </form>
          )}

          {/* STEP 4: COMPLETED CONFIRMATION & MULTI-TYPE ACTION BUTTONS */}
          {step === 4 && (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className={`text-xl font-extrabold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                  {step4Title}
                </h4>
                <p className={`text-xs max-w-xs mx-auto leading-relaxed ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                  Thank you <span className="font-bold" style={{ color: primaryColor }}>{name}</span>! Your meeting is set for <span className="font-bold text-emerald-400">{selectedIsoDate} at {meetingTime}</span>.
                </p>
              </div>

              {/* ACTION BUTTONS (WhatsApp, Instagram, Website, Custom Link) */}
              {successButtons && successButtons.length > 0 && (
                <div className="space-y-2 pt-1">
                  {successButtons.map((btn) => renderSuccessButton(btn))}
                </div>
              )}

              <Button variant="outline" size="md" onClick={onClose} className="w-full mt-2">
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
