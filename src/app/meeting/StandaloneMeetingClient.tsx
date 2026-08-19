'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Calendar, Clock, CheckCircle2, User, Phone, Mail } from 'lucide-react';
import { isTimeSlotDisabled, getFirstAvailableSlot, getTodayIso } from '@/lib/dateUtils';

interface StandaloneMeetingClientProps {
  workspace: any;
}

export function StandaloneMeetingClient({ workspace }: StandaloneMeetingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const availableSlots = useMemo(() => {
    return workspace?.custom_theme?.meetingSlots && workspace.custom_theme.meetingSlots.length > 0
      ? workspace.custom_theme.meetingSlots
      : ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'];
  }, [workspace]);

  const todayIso = useMemo(() => getTodayIso(), []);
  const initialDate = useMemo(() => {
    const hasToday = getFirstAvailableSlot(availableSlots, todayIso, 60);
    return hasToday ? todayIso : todayIso;
  }, [availableSlots, todayIso]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [meetingDate, setMeetingDate] = useState(initialDate);
  const [meetingTime, setMeetingTime] = useState(() => {
    return getFirstAvailableSlot(availableSlots, initialDate, 60) || availableSlots[0] || '02:00 PM';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    if (isTimeSlotDisabled(meetingTime, meetingDate, 60)) {
      const valid = getFirstAvailableSlot(availableSlots, meetingDate, 60);
      setMeetingTime(valid || '');
    }
  }, [meetingDate, availableSlots]);

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTime || isTimeSlotDisabled(meetingTime, meetingDate, 60)) {
      alert('Please select an available upcoming time slot.');
      return;
    }
    setIsSubmitting(true);

    let surveyAnswers = {};
    try {
      const rawSurvey = searchParams.get('surveyData');
      if (rawSurvey) surveyAnswers = JSON.parse(rawSurvey);
    } catch (err) {}

    const leadPayload = {
      funnel_id: workspace?.id || null,
      user_id: workspace?.user_id || null,
      name: name || 'Public Visitor',
      email: email || 'visitor@lead.com',
      phone: phone || '+91 9876543210',
      step_progress: 'meeting_booked',
      survey_responses: surveyAnswers,
      meeting_date: meetingDate,
      meeting_time: meetingTime,
    };

    const cleanPhone = (phone || '').trim();
    const digits = cleanPhone.replace(/\D/g, '');
    const last10 = digits.length >= 10 ? digits.slice(-10) : digits;

    try {
      let targetId = null;

      if (last10) {
        let query = supabase
          .from('leads')
          .select('id')
          .or(`phone.ilike.%${last10}%,phone.eq.${cleanPhone},phone.eq.${digits}`);

        if (workspace?.id) {
          query = query.eq('funnel_id', workspace.id);
        } else if (workspace?.user_id) {
          query = query.eq('user_id', workspace.user_id);
        }

        const { data: found } = await query
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (found?.id) targetId = found.id;
      }

      if (targetId) {
        await supabase.from('leads').update(leadPayload).eq('id', targetId);
      } else {
        await supabase.from('leads').insert(leadPayload);
      }
    } catch (err) {
      console.error('Error inserting/updating lead from /meeting:', err);
    } finally {
      setIsSubmitting(false);
      setIsBooked(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#131B2A] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {isBooked ? (
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-extrabold text-white">
              Meeting Booked & Locked!
            </h2>

            <p className="text-xs text-gray-300 max-w-sm mx-auto leading-relaxed">
              Your meeting is locked for <span className="font-bold text-emerald-400">{meetingDate} at {meetingTime}</span>. Your details have been saved to our CRM.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase">
                <span>Step 3 of 3</span>
                <span>•</span>
                <span>Select Strategy Call Slot</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Schedule Strategy Meeting
              </h1>

              <p className="text-xs text-gray-400">
                Pick your preferred date and time slot for your 1-on-1 strategy call.
              </p>
            </div>

            <form onSubmit={handleBookMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-800 bg-[#0B0F17] text-xs font-semibold text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-800 bg-[#0B0F17] text-xs font-semibold text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    WhatsApp Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-800 bg-[#0B0F17] text-xs font-semibold text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Meeting Date *
                </label>
                <input
                  type="date"
                  required
                  min={todayIso}
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-800 bg-[#0B0F17] text-xs font-bold text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                    Available Time Slots *
                  </label>
                  <span className="text-[10px] text-gray-500 font-mono">
                    1-hr buffer applied
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableSlots.map((slot: string) => {
                    const isDisabled = isTimeSlotDisabled(slot, meetingDate, 60);
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
                        className={`p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all truncate select-none ${
                          isDisabled
                            ? 'opacity-40 cursor-not-allowed bg-[#0B0F17]/50 border-dashed border-gray-800 text-gray-600 line-through'
                            : isSelected
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm font-extrabold cursor-pointer'
                            : 'border-gray-800 bg-[#0B0F17] text-gray-300 hover:border-gray-700 cursor-pointer'
                        }`}
                      >
                        <Clock className={`w-3.5 h-3.5 shrink-0 ${isDisabled ? 'text-gray-600' : 'text-amber-400'}`} />
                        <span className="truncate">{slot}</span>
                      </button>
                    );
                  })}
                </div>

                {!getFirstAvailableSlot(availableSlots, meetingDate, 60) && (
                  <div className="p-2.5 mt-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>All slots for this date have passed or are within 1 hour notice. Please choose another date.</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !meetingTime || isTimeSlotDisabled(meetingTime, meetingDate, 60)}
                className={`w-full py-4 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all mt-2 ${
                  !meetingTime || isTimeSlotDisabled(meetingTime, meetingDate, 60)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>{isSubmitting ? 'Securing Slot...' : 'CONFIRM & LOCK MEETING 📅'}</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
