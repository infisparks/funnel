'use client';

import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import {
  X,
  CheckCircle2,
  Calendar,
  Send,
  User,
  Phone,
  Mail,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface SurveyQuestion {
  id: string;
  label: string;
  options: string[];
}

interface ThreePopupFunnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyQuestions?: SurveyQuestion[];
  onComplete?: (leadData: any) => void;
}

export function ThreePopupFunnelModal({
  isOpen,
  onClose,
  surveyQuestions = [
    {
      id: 'q1',
      label: 'Select Your Industry',
      options: ['Service Business', 'Manufacturer / Distributor', 'Doctor / Clinic', 'E-commerce', 'Real Estate'],
    },
    {
      id: 'q2',
      label: 'Are You Ready to Invest in Growth?',
      options: ['Yes', 'Maybe', 'No'],
    },
    {
      id: 'q3',
      label: 'Monthly Business Revenue',
      options: ['Below ₹5L', '₹5L – ₹10L', '₹25L – ₹50L', '₹50L+'],
    },
    {
      id: 'q4',
      label: 'Your Current Role',
      options: ['Founder / Owner', 'Marketing Head', 'Partner', 'Manager'],
    },
  ],
  onComplete,
}: ThreePopupFunnelModalProps) {
  const { accentColor } = useTheme();

  // Active popup step: 1 (Contact), 2 (Survey), 3 (Meeting), 4 (Completed Confirmation)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

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

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalLeadPayload = {
      name,
      phone,
      email,
      surveyResponses: surveyAnswers,
      meetingDate,
      meetingTime,
    };
    if (onComplete) onComplete(finalLeadPayload);
    setStep(4);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Step Progress Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-full text-white font-extrabold text-xs flex items-center justify-center shadow-2xs"
              style={{ backgroundColor: accentColor.primary }}
            >
              {step > 3 ? 3 : step}
            </span>
            <div>
              <h3 className="font-bold text-sm text-[#111827]">
                {step === 1 && 'Step 1: Contact Verification'}
                {step === 2 && 'Step 2: Business Qualification Survey'}
                {step === 3 && 'Step 3: Schedule Strategy Call'}
                {step === 4 && 'Booking Confirmed!'}
              </h3>
              <p className="text-[11px] text-gray-400">
                {step === 1 && 'Confirm your basic contact info'}
                {step === 2 && 'Answer quick qualification questions'}
                {step === 3 && 'Pick a date & time for your strategy session'}
                {step === 4 && 'Your appointment is locked into our CRM calendar'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* =================================================== */}
          {/* POPUP 1: BASIC CONTACT INFO (NAME, PHONE, EMAIL) */}
          {/* =================================================== */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="text-center space-y-1 mb-4">
                <h4 className="text-xl font-extrabold text-[#111827]">
                  Let's Get You Started
                </h4>
                <p className="text-xs text-gray-500">
                  Please confirm your details below to continue.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F5F6F8] text-xs font-semibold text-[#111827] focus:bg-white focus:outline-none focus:ring-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mobile Phone Number (WhatsApp) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F5F6F8] text-xs font-semibold text-[#111827] focus:bg-white focus:outline-none focus:ring-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Work Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F5F6F8] text-xs font-semibold text-[#111827] focus:bg-white focus:outline-none focus:ring-2"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-4"
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Proceed to Survey (Popup 2)
              </Button>
            </form>
          )}

          {/* =================================================== */}
          {/* POPUP 2: DYNAMIC BUSINESS SURVEY QUESTIONS ARRAY */}
          {/* =================================================== */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-5">
              <div className="text-center space-y-1 mb-2">
                <h4 className="text-xl font-extrabold text-[#111827]">
                  Business Qualification Survey
                </h4>
                <p className="text-xs text-gray-500">
                  Select options that best describe your business requirements.
                </p>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {surveyQuestions.map((q) => (
                  <div key={q.id} className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700">
                      {q.label}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
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
                                ? 'border-2 bg-indigo-50 border-indigo-600 text-indigo-700 shadow-2xs'
                                : 'border-[#E5E7EB] bg-[#F5F6F8] text-gray-700 hover:bg-gray-100'
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

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Continue to Meeting Booking (Popup 3)
              </Button>
            </form>
          )}

          {/* =================================================== */}
          {/* POPUP 3: STRATEGY CALL MEETING BOOKING */}
          {/* =================================================== */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-5">
              <div className="text-center space-y-1 mb-2">
                <h4 className="text-xl font-extrabold text-[#111827]">
                  Schedule Strategy Meeting
                </h4>
                <p className="text-xs text-gray-500">
                  Pick your preferred date and time slot for the 1-on-1 strategy call.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Select Meeting Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F5F6F8] text-xs font-bold text-[#111827]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Select Available Time Slot *
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
                              ? 'border-2 bg-emerald-50 border-emerald-600 text-emerald-700 shadow-2xs'
                              : 'border-[#E5E7EB] bg-[#F5F6F8] text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{slot}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                leftIcon={<Calendar className="w-4 h-4" />}
              >
                Confirm & Lock Booking 📅
              </Button>
            </form>
          )}

          {/* =================================================== */}
          {/* STEP 4: COMPLETED CONFIRMATION */}
          {/* =================================================== */}
          {step === 4 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h4 className="text-2xl font-extrabold text-[#111827]">
                Appointment Booked!
              </h4>

              <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                Thank you <span className="font-bold text-gray-900">{name}</span>! Your meeting is scheduled for <span className="font-bold text-indigo-600">{meetingDate} at {meetingTime}</span>. A calendar invitation and WhatsApp confirmation have been sent to <span className="font-bold text-gray-900">{phone}</span>.
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
