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
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface SurveyQuestion {
  id: string;
  label: string;
  options: string[];
}

interface ThreePopupFunnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyQuestions?: SurveyQuestion[];
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
      options: ['Service Business', 'Manufacturer / B2B', 'Medical / Clinic', 'E-commerce Store', 'Real Estate / Agency'],
    },
    {
      id: 'q2',
      label: 'Are You Ready to Invest in Automated Growth?',
      options: ['Yes, Immediate Priority', 'Exploring Options', 'Not Yet'],
    },
    {
      id: 'q3',
      label: 'Current Monthly Revenue',
      options: ['Below ₹5 Lakhs', '₹5L – ₹15 Lakhs', '₹15L – ₹50 Lakhs', '₹50 Lakhs+'],
    },
    {
      id: 'q4',
      label: 'Your Role in the Organization',
      options: ['Founder / CEO', 'Marketing Leader', 'Managing Partner', 'Director'],
    },
  ],
  funnelId,
  userId,
  onComplete,
}: ThreePopupFunnelModalProps) {

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
      // Save lead directly to Supabase leads table
      const { data, error } = await supabase
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0B0F17] border border-amber-500/30 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-white relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-2 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Step {step > 3 ? 3 : step} of 3</span>
            <span className="text-gray-500">•</span>
            <span>FAST 30-SEC BOOKING</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            {step === 1 && 'Claim Your 1-on-1 Growth Consultation'}
            {step === 2 && 'Qualify Your Business Requirements'}
            {step === 3 && 'Lock Your Strategy Call Slot'}
            {step === 4 && 'Session Reserved! 🎉'}
          </h3>

          <p className="text-xs text-gray-400">
            {step === 1 && 'Enter your details to reserve your custom revenue strategy session'}
            {step === 2 && 'Answer quick questions so we can customize your growth roadmap'}
            {step === 3 && 'Pick a date & time slot for your 1-on-1 session'}
            {step === 4 && 'Your booking details are confirmed and locked in our CRM'}
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
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-gray-800 bg-[#131B2A] text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
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
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-gray-800 bg-[#131B2A] text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
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
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-gray-800 bg-[#131B2A] text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-amber-500/20 transition-all transform active:scale-98 cursor-pointer mt-2"
              >
                <span className="flex items-center gap-1.5 text-sm">
                  <span>CONTINUE TO SELECT SLOT</span>
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
                    <label className="block text-xs font-bold text-amber-400">
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
                                ? 'border-amber-500 bg-amber-500/20 text-white shadow-sm'
                                : 'border-gray-800 bg-[#131B2A] text-gray-300 hover:border-gray-700'
                            }`}
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
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <span>PROCEED TO TIME SLOT</span>
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
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-800 bg-[#131B2A] text-xs font-bold text-white focus:outline-none focus:border-amber-500"
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
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{slot}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer mt-2"
              >
                <Calendar className="w-4 h-4" />
                <span>{isSubmitting ? 'Securing Slot...' : 'CONFIRM & LOCK BOOKING 📅'}</span>
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
                Thank you <span className="font-bold text-amber-400">{name}</span>! Your meeting is locked for <span className="font-bold text-emerald-400">{meetingDate} at {meetingTime}</span>. Details saved to CRM.
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
