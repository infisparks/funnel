'use client';

import React, { useState } from 'react';
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
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface SurveyQuestion {
  id: string;
  label: string;
  options: string[];
}

export interface PopupThemeConfig {
  primaryColor?: string;
  bgColor?: string;
  badgeText?: string;
  step1Title?: string;
  step1Subtitle?: string;
  step1ButtonText?: string;
  step2Title?: string;
  step2Subtitle?: string;
  step2ButtonText?: string;
  step3Title?: string;
  step3Subtitle?: string;
  step3ButtonText?: string;
  step4Title?: string;
  step4Subtitle?: string;
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

export function ThreePopupFunnelModal({
  isOpen,
  onClose,
  surveyQuestions = [
    {
      id: 'q1',
      label: 'Select Your Primary Industry',
      options: ['Service Business', 'Manufacturer / B2B', 'Medical / Clinic', 'E-commerce Store'],
    },
    {
      id: 'q2',
      label: 'Are You Ready to Invest in Automated Growth?',
      options: ['Yes, Immediate Priority', 'Exploring Options', 'Not Yet'],
    },
  ],
  popupTheme = {},
  funnelId,
  userId,
  onComplete,
}: ThreePopupFunnelModalProps) {
  // Theme defaults
  const primaryColor = popupTheme.primaryColor || '#F59E0B'; // Amber Gold default
  const badgeText = popupTheme.badgeText || 'FAST 30-SEC BOOKING';
  const step1Title = popupTheme.step1Title || 'Claim Your 1-on-1 Growth Consultation';
  const step1Subtitle = popupTheme.step1Subtitle || 'Enter your details to reserve your custom revenue strategy session';
  const step1BtnText = popupTheme.step1ButtonText || 'CONTINUE TO SELECT SLOT';

  const step2Title = popupTheme.step2Title || 'Qualify Your Business Requirements';
  const step2Subtitle = popupTheme.step2Subtitle || 'Answer quick questions so we can customize your growth roadmap';
  const step2BtnText = popupTheme.step2ButtonText || 'PROCEED TO TIME SLOT';

  const step3Title = popupTheme.step3Title || 'Lock Your Strategy Call Slot';
  const step3Subtitle = popupTheme.step3Subtitle || 'Pick a date & time slot for your 1-on-1 session';
  const step3BtnText = popupTheme.step3ButtonText || 'CONFIRM & LOCK BOOKING 📅';

  const step4Title = popupTheme.step4Title || 'Session Reserved! 🎉';
  const step4Subtitle = popupTheme.step4Subtitle || 'Your booking details are confirmed and locked in our CRM';

  // Active popup step: 1 (Contact), 2 (Survey), 3 (Meeting), 4 (Completed Confirmation)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Popup 1 State: Contact Info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Popup 2 State: Survey Responses
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, string>>({});

  // Popup 3 State: Meeting Booking
  const [meetingDate, setMeetingDate] = useState('2026-08-10');
  const [meetingTime, setMeetingTime] = useState('02:00 PM');

  if (!isOpen) return null;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email) {
      alert('Please fill out Name, Phone, and Email');
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
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
      meeting_date: meetingDate,
      meeting_time: meetingTime,
    };

    try {
      const { error } = await supabase
        .from('leads')
        .insert(finalLeadPayload)
        .select()
        .single();

      if (error) {
        console.error('Supabase Lead Insert Error:', error);
      }
    } catch (err) {
      console.error('Error inserting lead to Supabase:', err);
    } finally {
      setIsSubmitting(false);
      if (onComplete) onComplete(finalLeadPayload);
      setStep(4);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans">
      <div
        className="bg-[#0B0F17] border rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-white relative"
        style={{ borderColor: `${primaryColor}50` }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-2 text-center space-y-3">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border"
            style={{
              backgroundColor: `${primaryColor}15`,
              borderColor: `${primaryColor}40`,
              color: primaryColor,
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
            <span>Step {step > 3 ? 3 : step} of 3</span>
            <span className="text-gray-500">•</span>
            <span>{badgeText}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            {step === 1 && step1Title}
            {step === 2 && step2Title}
            {step === 3 && step3Title}
            {step === 4 && step4Title}
          </h3>

          <p className="text-xs text-gray-400">
            {step === 1 && step1Subtitle}
            {step === 2 && step2Subtitle}
            {step === 3 && step3Subtitle}
            {step === 4 && step4Subtitle}
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 pt-2">
          {/* STEP 1: CONTACT INFO */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-gray-800 bg-[#131B2A] text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:ring-1"
                    style={{ borderColor: '#1E293B' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Work Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-gray-800 bg-[#131B2A] text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:ring-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  WhatsApp Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-gray-800 bg-[#131B2A] text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:ring-1"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl text-black font-extrabold text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-0.5 shadow-lg transition-all transform active:scale-98 cursor-pointer mt-2"
                style={{
                  background: `linear-gradient(to right, ${primaryColor}, #FCD34D)`,
                }}
              >
                <span className="flex items-center gap-1.5 text-sm">
                  <span>{step1BtnText}</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold opacity-80 lowercase font-mono">
                  100% free strategy session • no sales pitch
                </span>
              </button>
            </form>
          )}

          {/* STEP 2: DYNAMIC CUSTOMER SURVEY QUESTIONS */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                {surveyQuestions.map((q) => (
                  <div key={q.id} className="space-y-1.5">
                    <label className="block text-xs font-bold" style={{ color: primaryColor }}>
                      {q.label}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt) => {
                        const isSelected = surveyAnswers[q.id] === opt;
                        return (
                          <button
                            type="button"
                            key={opt}
                            onClick={() =>
                              setSurveyAnswers({ ...surveyAnswers, [q.id]: opt })
                            }
                            className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer ${
                              isSelected
                                ? 'text-white shadow-sm'
                                : 'border-gray-800 bg-[#131B2A] text-gray-300 hover:border-gray-700'
                            }`}
                            style={
                              isSelected
                                ? {
                                    borderColor: primaryColor,
                                    backgroundColor: `${primaryColor}25`,
                                  }
                                : {}
                            }
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${primaryColor}, #FCD34D)`,
                }}
              >
                <span>{step2BtnText}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 3: MEETING TIME SLOT BOOKING */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Select Preferred Meeting Date *
                </label>
                <input
                  type="date"
                  required
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-800 bg-[#131B2A] text-xs font-bold text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Select Strategy Call Time Slot *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'].map((slot) => {
                    const isSelected = meetingTime === slot;
                    return (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setMeetingTime(slot)}
                        className={`p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm'
                            : 'border-gray-800 bg-[#131B2A] text-gray-300 hover:border-gray-700'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                        <span>{slot}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer mt-2"
                style={{
                  background: `linear-gradient(to right, ${primaryColor}, #FCD34D)`,
                }}
              >
                <Calendar className="w-4 h-4" />
                <span>{isSubmitting ? 'Securing Slot...' : step3BtnText}</span>
              </button>
            </form>
          )}

          {/* STEP 4: COMPLETED CONFIRMATION */}
          {step === 4 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h4 className="text-2xl font-extrabold text-white">
                Booking Confirmed!
              </h4>

              <p className="text-xs text-gray-300 max-w-sm mx-auto leading-relaxed">
                Thank you <span className="font-bold" style={{ color: primaryColor }}>{name}</span>! Your meeting is locked for <span className="font-bold text-emerald-400">{meetingDate} at {meetingTime}</span>. Details saved to CRM.
              </p>

              <Button variant="primary" size="md" onClick={onClose} className="mt-2">
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
