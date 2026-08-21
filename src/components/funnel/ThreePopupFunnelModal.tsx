'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { dispatchWhatsappTrigger } from '@/lib/whatsappDispatch';
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
  Video,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../ui/Button';
import {
  isTimeSlotDisabled,
  getFirstAvailableSlot,
  getUpcomingDates,
  getTodayIso,
} from '@/lib/dateUtils';
import {
  COUNTRY_CODES,
  splitPhoneAndCountryCode,
  formatFullPhone,
} from '@/lib/phoneUtils';

const SERVER_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'https://funnel.infiplus.in').replace(/\/$/, '');

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
  buttonTextColor?: string;
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
  googleMeetUrl?: string;
}

interface ThreePopupFunnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyQuestions?: SurveyQuestion[];
  popupTheme?: PopupThemeConfig;
  funnelId?: string;
  userId?: string;
  onStep1Complete?: (leadData: any) => void;
  onComplete?: (leadData: any) => void;
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
  onStep1Complete,
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
  const availableTimeSlots = useMemo(() => {
    return popupTheme.meetingSlots && popupTheme.meetingSlots.length > 0
      ? popupTheme.meetingSlots
      : ['09:00 AM', '11:00 AM', '02:00 PM', '04:30 PM', '06:00 PM'];
  }, [popupTheme.meetingSlots]);

  // Step 4 Copy & Buttons & Custom Color (Default: primaryColor)
  const step4Title = popupTheme.step4Title || 'Booking Confirmed! 🎉';
  const step4Subtitle = popupTheme.step4Subtitle || 'Your meeting is locked in our calendar and CRM. We look forward to speaking!';
  const successButtonColor = popupTheme.step4ButtonColor || primaryColor;
  const successButtons: SuccessButton[] = Array.isArray(popupTheme?.step4Buttons)
    ? popupTheme.step4Buttons
    : [];

  const upcomingDates = useMemo(() => getUpcomingDates(), []);

  // Compute best default date: today if it has available slots, else tomorrow
  const initialDate = useMemo(() => {
    const todayIso = upcomingDates[0]?.isoDate || getTodayIso();
    const hasTodaySlots = getFirstAvailableSlot(availableTimeSlots, todayIso, 60);
    if (hasTodaySlots) return todayIso;
    return upcomingDates[1]?.isoDate || todayIso;
  }, [upcomingDates, availableTimeSlots]);

  // Active popup step: 1 (Contact), 2 (Survey), 3 (Meeting), 4 (Completed Confirmation)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingLeadId, setExistingLeadId] = useState<string | null>(null);
  const dispatchedStepsRef = useRef<Set<string>>(new Set());

  // Popup 1 State: Contact Info
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Helper to format full phone with country code
  const getFullPhone = (code = countryCode, num = phone) => formatFullPhone(code, num);

  // Popup 2 State: Survey Responses
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, any>>({});

  // Popup 3 State: Date & Time Slot
  const [selectedIsoDate, setSelectedIsoDate] = useState(initialDate);
  const [meetingTime, setMeetingTime] = useState<string>(() => {
    return getFirstAvailableSlot(availableTimeSlots, initialDate, 60) || availableTimeSlots[0] || '02:00 PM';
  });

  // Auto-update selected slot if current meetingTime is disabled for the chosen date
  useEffect(() => {
    if (isTimeSlotDisabled(meetingTime, selectedIsoDate, 60)) {
      const validSlot = getFirstAvailableSlot(availableTimeSlots, selectedIsoDate, 60);
      setMeetingTime(validSlot || '');
    }
  }, [selectedIsoDate, availableTimeSlots]);

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

    // Auto-sync lead state to Supabase on close if name and contact info present
    const cleanPhone = getFullPhone();
    if (name && (cleanPhone || email)) {
      (async () => {
        try {
          let targetLeadId = existingLeadId;
          let existingLeadData: any = null;

          if (cleanPhone) {
            let phoneQuery = supabase
              .from('leads')
              .select('id, step_progress, meeting_date, meeting_time')
              .eq('phone', cleanPhone);
            if (funnelId) phoneQuery = phoneQuery.eq('funnel_id', funnelId);
            else if (userId) phoneQuery = phoneQuery.eq('user_id', userId);

            const { data: found } = await phoneQuery
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            if (found?.id) {
              targetLeadId = found.id;
              existingLeadData = found;
            }
          }

          // Preserve meeting_booked stage and never downgrade
          let finalStage = 'step1_contact';
          if (
            step === 4 ||
            existingLeadData?.step_progress === 'meeting_booked' ||
            Boolean(existingLeadData?.meeting_date || existingLeadData?.meeting_time)
          ) {
            finalStage = 'meeting_booked';
          } else if (Object.keys(surveyAnswers).length > 0 || existingLeadData?.step_progress === 'survey_completed') {
            finalStage = 'survey_completed';
          }

          const payload: any = {
            name,
            email,
            phone: cleanPhone,
            step_progress: finalStage,
            survey_responses: Object.keys(surveyAnswers).length > 0 ? surveyAnswers : null,
          };
          if (step === 4 && selectedIsoDate && meetingTime) {
            payload.meeting_date = selectedIsoDate;
            payload.meeting_time = meetingTime;
          }
          if (funnelId) payload.funnel_id = funnelId;
          if (userId) payload.user_id = userId;

          if (targetLeadId) {
            await supabase.from('leads').update(payload).eq('id', targetLeadId);
          } else {
            await supabase.from('leads').insert(payload);
          }
        } catch (err) {}
      })();
    }

    onClose();
  };

  // Helper to get strictly isolated storage scope per landing page / funnel
  const getStorageScopeId = () => {
    if (funnelId) return funnelId;
    if (typeof window !== 'undefined') {
      return (window.location.host + window.location.pathname).replace(/[^a-zA-Z0-9_-]/g, '_');
    }
    return 'default_scope';
  };

  // Helper to instantly persist contact info to localStorage as user types
  const saveContactInfoToStorage = (
    updatedName?: string,
    updatedEmail?: string,
    updatedPhone?: string,
    updatedCode?: string
  ) => {
    try {
      const nameToSave = updatedName !== undefined ? updatedName : name;
      const emailToSave = updatedEmail !== undefined ? updatedEmail : email;
      const codeToSave = updatedCode !== undefined ? updatedCode : countryCode;
      const phoneToSave = updatedPhone !== undefined ? updatedPhone : phone;
      const fullPhone = formatFullPhone(codeToSave, phoneToSave);

      const storageKey = `lead_contact_info_${getStorageScopeId()}`;
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          name: nameToSave,
          email: emailToSave,
          phone: fullPhone,
          countryCode: codeToSave,
          localPhone: phoneToSave,
          leadId: existingLeadId,
          lastUpdated: new Date().toISOString(),
        })
      );
    } catch (err) {}
  };

  // Reset form when modal opens or load isolated saved session
  useEffect(() => {
    if (isOpen) {
      let initialStep: 1 | 2 | 3 | 4 = 1;
      let hasSavedDetails = false;
      let hasSavedSurvey = false;

      try {
        const scopeId = getStorageScopeId();
        const storageKey = `lead_funnel_session_${scopeId}`;
        const contactKey = `lead_contact_info_${scopeId}`;
        const savedSession = localStorage.getItem(storageKey) || localStorage.getItem(contactKey);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed.name || parsed.email || parsed.phone || parsed.localPhone) {
            setName(parsed.name || '');
            setEmail(parsed.email || '');

            const rawSavedPhone = parsed.phone || parsed.localPhone || '';
            const { countryCode: parsedCode, localPhone: parsedLocal } = splitPhoneAndCountryCode(
              rawSavedPhone,
              parsed.countryCode || '+91'
            );
            setCountryCode(parsedCode);
            setPhone(parsed.localPhone || parsedLocal);

            if (parsed.leadId) setExistingLeadId(parsed.leadId);

            if (parsed.name && (parsed.email || rawSavedPhone)) {
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
  }, [isOpen, surveyQuestions, funnelId]);

  if (!isOpen) return null;

  const saveSessionToLocalStorage = (
    updatedAnswers?: Record<string, any>,
    isSurveyFinished?: boolean,
    customLeadId?: string,
    customFullPhone?: string
  ) => {
    try {
      const answersToSave = updatedAnswers || surveyAnswers;
      const isFinished = isSurveyFinished ?? (Object.keys(answersToSave).length >= surveyQuestions.length);
      const activeLeadId = customLeadId || existingLeadId;
      const fullPhone = customFullPhone || getFullPhone();
      const storageKey = `lead_funnel_session_${getStorageScopeId()}`;
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          name,
          email,
          phone: fullPhone,
          countryCode,
          localPhone: phone,
          leadId: activeLeadId,
          surveyAnswers: answersToSave,
          hasCompletedSurvey: isFinished,
        })
      );
    } catch (err) {}
  };

  const lookupLeadByPhone = async (rawPhone: string): Promise<any> => {
    if (!rawPhone) return null;
    const digits = rawPhone.replace(/\D/g, '');
    const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
    if (!last10) return null;

    try {
      let query = supabase
        .from('leads')
        .select('id, name, email, phone, step_progress, survey_responses, meeting_date, meeting_time')
        .or(`phone.ilike.%${last10}%,phone.eq.${rawPhone.trim()},phone.eq.${digits}`);

      // STRICT Funnel Isolation: A lead must belong to this specific funnel/landing page!
      if (funnelId) {
        query = query.eq('funnel_id', funnelId);
      } else {
        return null;
      }

      const { data } = await query
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return data || null;
    } catch (err) {
      console.error('[Phone Lookup Error]:', err);
      return null;
    }
  };

  // Helper to sync lead reliably through server-side ingestion
  const syncLeadToBackend = async (stepProgress: string, extraData: any = {}) => {
    try {
      const cleanPhone = getFullPhone();
      const payload = {
        name: name || 'Landing Lead',
        email: email || '',
        phone: cleanPhone,
        step_progress: stepProgress,
        survey_responses: surveyAnswers,
        meeting_date: selectedIsoDate || null,
        meeting_time: meetingTime || null,
        funnel_id: funnelId || null,
        user_id: userId || null,
        lead_id: existingLeadId || null,
        ...extraData,
      };

      const res = await fetch(`${SERVER_URL}/api/landing/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lead_id && !existingLeadId) {
          setExistingLeadId(data.lead_id);
        }
        return data;
      }
    } catch (e) {
      console.warn('[Backend Lead Sync Error]:', e);
    }
    return null;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = getFullPhone();
    if (!name || !cleanPhone || !email) {
      alert('Please fill out Name, WhatsApp Phone Number, and Email');
      return;
    }

    setIsSubmitting(true);
    let activeLeadId = existingLeadId;

    try {
      // 1. Phone Deduplication Check strictly within THIS funnel
      if (!activeLeadId && cleanPhone) {
        const matched = await lookupLeadByPhone(cleanPhone);
        if (matched?.id) {
          activeLeadId = matched.id;
          setExistingLeadId(matched.id);
          if (matched.survey_responses && Object.keys(matched.survey_responses).length > 0) {
            setSurveyAnswers((prev) => ({ ...matched.survey_responses, ...prev }));
          }
        }
      }

      const step1Payload: any = {
        name,
        email,
        phone: cleanPhone,
        step_progress: 'step1_contact',
      };
      if (funnelId) step1Payload.funnel_id = funnelId;
      if (userId) step1Payload.user_id = userId;

      console.log('[Supabase Client-Side Upload] Submitting Step 1 contact payload to database:', step1Payload);

      const clientGeneratedId = activeLeadId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : null);

      // 2. Perform Direct Client-Side Supabase Upload FIRST
      if (activeLeadId) {
        const { data, error } = await supabase
          .from('leads')
          .update(step1Payload)
          .eq('id', activeLeadId)
          .select('id')
          .maybeSingle();

        if (data?.id) {
          activeLeadId = data.id;
        }
      } else {
        const insertPayload = clientGeneratedId ? { id: clientGeneratedId, ...step1Payload } : step1Payload;
        const { data, error } = await supabase
          .from('leads')
          .insert(insertPayload)
          .select('id')
          .maybeSingle();

        if (data?.id) {
          activeLeadId = data.id;
        } else if (clientGeneratedId) {
          activeLeadId = clientGeneratedId;
        }
      }

      // Also sync to Backend Server for guaranteed database ingestion & webhook triggers
      const backendResult = await syncLeadToBackend('step1_contact', { lead_id: activeLeadId });
      if (backendResult?.lead_id && !activeLeadId) {
        activeLeadId = backendResult.lead_id;
      }

      if (activeLeadId) {
        setExistingLeadId(activeLeadId);
        console.log('[Supabase Success] Client-side Step 1 saved under lead ID:', activeLeadId);
      }
    } catch (err) {
      console.error('[Supabase Exception] Exception during client-side Step 1 upload:', err);
    } finally {
      setIsSubmitting(false);
      saveSessionToLocalStorage(surveyAnswers, false, activeLeadId || undefined, cleanPhone);
      if (onStep1Complete) {
        onStep1Complete({
          funnel_id: funnelId || null,
          user_id: userId || null,
          name,
          email,
          phone: cleanPhone,
          step_progress: 'step1_contact',
          leadId: activeLeadId,
        });
      }

      // Dispatch Step 1 WhatsApp message once per session
      if (!dispatchedStepsRef.current.has('step1')) {
        dispatchedStepsRef.current.add('step1');
        dispatchWhatsappTrigger('step1', {
          name,
          email,
          phone: cleanPhone,
          funnel_id: funnelId || undefined,
          user_id: userId || undefined,
          workspace_id: funnelId || undefined,
        }).catch((e) => console.warn('[WhatsApp Trigger Step 1 error]:', e));
      }

      changeStep(2);
      setCurrentQuestionIndex(0);
    }
  };

  const saveSurveyResponsesToSupabase = async (responses: Record<string, any>) => {
    try {
      let targetId = existingLeadId;
      let matchedLead: any = null;
      const cleanPhone = getFullPhone();
      if (cleanPhone) {
        matchedLead = await lookupLeadByPhone(cleanPhone);
        if (matchedLead?.id) {
          targetId = matchedLead.id;
          setExistingLeadId(matchedLead.id);
        }
      }

      const isAlreadyMeeting = step === 4 || matchedLead?.step_progress === 'meeting_booked' || Boolean(matchedLead?.meeting_date || matchedLead?.meeting_time);
      const stage = isAlreadyMeeting ? 'meeting_booked' : 'survey_completed';

      const payload: any = {
        name: name || 'Lead',
        email: email || '',
        phone: cleanPhone,
        step_progress: stage,
        survey_responses: responses,
      };
      if (funnelId) payload.funnel_id = funnelId;
      if (userId) payload.user_id = userId;

      if (targetId) {
        await supabase.from('leads').update(payload).eq('id', targetId);
        console.log('[Supabase Sync] Updated survey responses for lead ID:', targetId, responses);
      } else if (cleanPhone) {
        const { data: inserted } = await supabase.from('leads').insert(payload).select('id').maybeSingle();
        if (inserted?.id) {
          setExistingLeadId(inserted.id);
          console.log('[Supabase Sync] Inserted survey lead with ID:', inserted.id, responses);
        }
      }

      // Sync survey response to backend server
      await syncLeadToBackend(stage, { survey_responses: responses, lead_id: targetId });
    } catch (err) {
      console.error('Error saving survey responses to Supabase:', err);
    }
  };

  const handleNextQuestion = async () => {
    await saveSurveyResponsesToSupabase(surveyAnswers);
    saveSessionToLocalStorage(surveyAnswers, true);
    if (currentQuestionIndex < surveyQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Dispatch Step 2 WhatsApp message upon survey completion once per session
      if (!dispatchedStepsRef.current.has('step2')) {
        dispatchedStepsRef.current.add('step2');
        dispatchWhatsappTrigger('step2', {
          name,
          email,
          phone: getFullPhone(),
          funnel_id: funnelId || undefined,
          user_id: userId || undefined,
          workspace_id: funnelId || undefined,
        }).catch((e) => console.warn('[WhatsApp Trigger Step 2 error]:', e));
      }

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

    const activeMeetUrl = (typeof window !== 'undefined' && localStorage.getItem('workspace_google_meet_url')) || popupTheme?.googleMeetUrl || 'https://meet.google.com/qbi-erbq-moy';
    const cleanPhone = getFullPhone();

    const finalLeadPayload = {
      funnel_id: funnelId || null,
      user_id: userId || null,
      name,
      phone: cleanPhone,
      email,
      step_progress: 'meeting_booked',
      survey_responses: surveyAnswers,
      meeting_date: selectedIsoDate,
      meeting_time: meetingTime,
      google_meet_url: activeMeetUrl,
    };

    try {
      let targetId = existingLeadId;

      if (!targetId && cleanPhone) {
        const matched = await lookupLeadByPhone(cleanPhone);
        if (matched?.id) {
          targetId = matched.id;
          setExistingLeadId(matched.id);
        }
      }

      if (targetId) {
        await supabase.from('leads').update(finalLeadPayload).eq('id', targetId);
      } else {
        const { data: inserted } = await supabase.from('leads').insert(finalLeadPayload).select('id').maybeSingle();
        if (inserted?.id) {
          setExistingLeadId(inserted.id);
        }
      }

      // Sync meeting booking to backend server
      await syncLeadToBackend('meeting_booked', {
        survey_responses: surveyAnswers,
        meeting_date: selectedIsoDate,
        meeting_time: meetingTime,
        google_meet_url: activeMeetUrl,
        lead_id: targetId,
      });
    } catch (err) {
      console.error('Error inserting/updating lead in Supabase:', err);
    } finally {
      setIsSubmitting(false);
      saveSessionToLocalStorage(surveyAnswers, true, undefined, cleanPhone);

      // Dispatch Step 3 Meeting Booked WhatsApp message once per session
      if (!dispatchedStepsRef.current.has('step3')) {
        dispatchedStepsRef.current.add('step3');
        dispatchWhatsappTrigger('step3', {
          name,
          email,
          phone: cleanPhone,
          meeting_date: selectedIsoDate,
          meeting_time: meetingTime,
          google_meet_url: activeMeetUrl,
          funnel_id: funnelId || undefined,
          user_id: userId || undefined,
          workspace_id: funnelId || undefined,
        }).catch((e) => console.warn('[WhatsApp Trigger Step 3 error]:', e));
      }

      if (onComplete) onComplete(finalLeadPayload);
      changeStep(4);
    }
  };

  const resetLeadSession = () => {
    dispatchedStepsRef.current.clear();
    const scopeId = getStorageScopeId();
    localStorage.removeItem(`lead_funnel_session_${scopeId}`);
    localStorage.removeItem(`lead_contact_info_${scopeId}`);
    localStorage.removeItem('lead_funnel_session');
    localStorage.removeItem('lead_contact_info');
    setName('');
    setEmail('');
    setCountryCode('+91');
    setPhone('');
    setSurveyAnswers({});
    setExistingLeadId(null);
    changeStep(1);
    setCurrentQuestionIndex(0);
  };

  const handleOptionSelect = (qId: string, opt: string, isMultiple?: boolean) => {
    const questionObj = surveyQuestions.find((q) => q.id === qId || q.label === qId);
    const keyToUse = questionObj?.label || qId;

    let updated: Record<string, any>;
    if (isMultiple) {
      const currentList: string[] = Array.isArray(surveyAnswers[keyToUse])
        ? surveyAnswers[keyToUse]
        : Array.isArray(surveyAnswers[qId])
        ? surveyAnswers[qId]
        : [];
      const newList = currentList.includes(opt)
        ? currentList.filter((item) => item !== opt)
        : [...currentList, opt];
      updated = { ...surveyAnswers, [keyToUse]: newList };
      setSurveyAnswers(updated);
      saveSessionToLocalStorage(updated);
      saveSurveyResponsesToSupabase(updated);
    } else {
      updated = { ...surveyAnswers, [keyToUse]: opt };
      setSurveyAnswers(updated);
      const isFinal = currentQuestionIndex >= surveyQuestions.length - 1;
      saveSessionToLocalStorage(updated, isFinal);
      saveSurveyResponsesToSupabase(updated);

      setTimeout(() => {
        if (currentQuestionIndex < surveyQuestions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
        } else {
          changeStep(3);
        }
      }, 180);
    }
  };

  const buttonTextColor = popupTheme.buttonTextColor || '#FFFFFF';
  const getButtonStyle = () => {
    if (isSolidButton) {
      return { backgroundColor: primaryColor, color: buttonTextColor };
    }
    return { background: `linear-gradient(135deg, ${primaryColor}, #6366F1)`, color: buttonTextColor };
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
          className="w-full py-3 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-white shadow-md transition-all hover:brightness-105 cursor-pointer"
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
        className="w-full py-3 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-white shadow-md transition-all hover:brightness-105 cursor-pointer"
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
                <div className="flex items-center gap-1.5">
                  {/* COUNTRY CODE SELECTOR (DEFAULT +91 INDIA) */}
                  <div className="relative shrink-0 w-[110px] sm:w-[125px]">
                    <select
                      value={countryCode}
                      onChange={(e) => {
                        const newCode = e.target.value;
                        setCountryCode(newCode);
                        saveContactInfoToStorage(undefined, undefined, phone, newCode);
                      }}
                      className={`w-full appearance-none pl-2.5 pr-6 py-2.5 rounded-xl border text-xs font-bold focus:outline-none cursor-pointer ${
                        isLightMode
                          ? 'bg-[#F8FAFC] border-gray-300 text-gray-900 focus:border-indigo-500'
                          : 'bg-[#131B2A] border-gray-800 text-white focus:border-amber-500'
                      }`}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option
                          key={`${c.country}-${c.code}`}
                          value={c.code}
                          className={isLightMode ? 'bg-white text-gray-900' : 'bg-[#0B0F17] text-white'}
                        >
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* PHONE NUMBER INPUT */}
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (val.startsWith('+')) {
                          const parsed = splitPhoneAndCountryCode(val, countryCode);
                          setCountryCode(parsed.countryCode);
                          val = parsed.localPhone;
                        }
                        setPhone(val);
                        saveContactInfoToStorage(undefined, undefined, val, countryCode);
                      }}
                      onBlur={() => saveContactInfoToStorage()}
                      placeholder={phonePlaceholder.replace(/^\+91\s*/, '') || '9876543210'}
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none ${
                        isLightMode
                          ? 'bg-[#F8FAFC] border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                          : 'bg-[#131B2A] border-gray-800 text-white placeholder-gray-500 focus:border-amber-500'
                      }`}
                    />
                  </div>
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
                    const qKey = currentQ.label || currentQ.id;
                    const currentVal = surveyAnswers[qKey] ?? surveyAnswers[currentQ.id];
                    const isSelected = isMultiple
                      ? Array.isArray(currentVal) && currentVal.includes(opt)
                      : currentVal === opt;

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
                    const hasSlots = Boolean(getFirstAvailableSlot(availableTimeSlots, item.isoDate, 60));
                    return (
                      <button
                        type="button"
                        key={item.isoDate}
                        onClick={() => {
                          setSelectedIsoDate(item.isoDate);
                          if (!meetingTime || isTimeSlotDisabled(meetingTime, item.isoDate, 60)) {
                            const firstValid = getFirstAvailableSlot(availableTimeSlots, item.isoDate, 60);
                            setMeetingTime(firstValid || '');
                          }
                        }}
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
                <div className="flex items-center justify-between mb-2">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                    {timeSlotLabel}
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono">
                    1-hr buffer applied
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {availableTimeSlots.map((slot) => {
                    const isDisabled = isTimeSlotDisabled(slot, selectedIsoDate, 60);
                    const isSelected = meetingTime === slot && !isDisabled;
                    return (
                      <button
                        type="button"
                        key={slot}
                        disabled={isDisabled}
                        onClick={() => {
                          if (!isDisabled) setMeetingTime(slot);
                        }}
                        title={isDisabled ? 'Time passed or within 1-hour notice' : slot}
                        className={`p-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition-all truncate select-none ${
                          isDisabled
                            ? 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-white/5 border-dashed border-gray-300 dark:border-gray-800 text-gray-400 dark:text-gray-600 line-through'
                            : isSelected
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-md font-extrabold cursor-pointer'
                            : isLightMode
                            ? 'border-gray-200 bg-[#F8FAFC] text-gray-800 hover:bg-gray-100 cursor-pointer'
                            : 'border-gray-800 bg-[#131B2A] text-gray-300 hover:border-gray-700 cursor-pointer'
                        }`}
                      >
                        <Clock className={`w-3 h-3 shrink-0 ${isDisabled ? 'text-gray-400 dark:text-gray-600' : ''}`} style={!isDisabled ? { color: primaryColor } : undefined} />
                        <span className="truncate">{slot}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Notice if no slots available for today */}
                {!getFirstAvailableSlot(availableTimeSlots, selectedIsoDate, 60) && (
                  <div className="p-2.5 mt-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 text-xs font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>All slots for this date have passed or are within 1 hour. Please choose tomorrow or another date.</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !meetingTime || isTimeSlotDisabled(meetingTime, selectedIsoDate, 60)}
                className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all mt-2 ${
                  !meetingTime || isTimeSlotDisabled(meetingTime, selectedIsoDate, 60)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
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

              {/* GOOGLE MEET VIDEO CALL CARD */}
              {popupTheme?.googleMeetUrl && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/90 border border-indigo-500/30 text-left space-y-2 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                      <Video className="w-4 h-4 text-emerald-400" />
                      <span>Google Meet Video Call Link</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      READY TO JOIN
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/40 text-[11px] font-mono border border-white/10">
                    <span className="truncate text-white/90">
                      {popupTheme.googleMeetUrl}
                    </span>
                    <a
                      href={popupTheme.googleMeetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-extrabold shrink-0 flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <span>Join Meet</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

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
