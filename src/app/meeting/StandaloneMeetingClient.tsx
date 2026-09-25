'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Calendar, Clock, CheckCircle2, User, Phone, Mail, ChevronDown, AlertCircle } from 'lucide-react';
import {
  DEFAULT_MEETING_SLOTS,
  normalizeTimeSlot,
  isTimeSlotBooked,
  isTimeSlotPassedOrBuffered,
  isTimeSlotDisabled,
  getFirstAvailableSlot,
  getTodayIso,
} from '@/lib/dateUtils';
import { COUNTRY_CODES, splitPhoneAndCountryCode, formatFullPhone } from '@/lib/phoneUtils';
import { initClientMetaPixel, trackMetaMeetingBooked } from '@/lib/metaPixel';
import { dispatchWhatsappTrigger } from '@/lib/whatsappDispatch';

interface StandaloneMeetingClientProps {
  workspace: any;
}

export function StandaloneMeetingClient({ workspace }: StandaloneMeetingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (workspace?.pixel_id) {
      initClientMetaPixel(workspace.pixel_id);
    }
  }, [workspace?.pixel_id]);

  const availableSlots = useMemo(() => {
    return workspace?.custom_theme?.meetingSlots && workspace.custom_theme.meetingSlots.length > 0
      ? workspace.custom_theme.meetingSlots
      : DEFAULT_MEETING_SLOTS;
  }, [workspace]);

  // Booked slots map from DB: { "YYYY-MM-DD": ["11:00 AM", "02:00 PM"] }
  const [bookedSlotsMap, setBookedSlotsMap] = useState<Record<string, string[]>>({});
  const [slotConflictError, setSlotConflictError] = useState<string | null>(null);

  const loadBookedSlots = useCallback(async () => {
    try {
      let query = supabase
        .from('leads')
        .select('id, meeting_date, meeting_time')
        .not('meeting_date', 'is', null)
        .not('meeting_time', 'is', null);

      if (workspace?.id) {
        query = query.eq('funnel_id', workspace.id);
      } else if (workspace?.user_id) {
        query = query.eq('user_id', workspace.user_id);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('[StandaloneMeetingClient] Error loading booked slots:', error);
        return;
      }

      const map: Record<string, string[]> = {};
      if (Array.isArray(data)) {
        for (const row of data) {
          if (!row.meeting_date || !row.meeting_time) continue;
          const dateKey = row.meeting_date.includes('T')
            ? row.meeting_date.split('T')[0]
            : row.meeting_date.trim();
          const normTime = normalizeTimeSlot(row.meeting_time);
          if (!map[dateKey]) map[dateKey] = [];
          if (!map[dateKey].includes(normTime)) {
            map[dateKey].push(normTime);
          }
        }
      }
      setBookedSlotsMap(map);
    } catch (err) {
      console.warn('[StandaloneMeetingClient] Exception fetching booked slots:', err);
    }
  }, [workspace?.id, workspace?.user_id]);

  useEffect(() => {
    loadBookedSlots();
  }, [loadBookedSlots]);

  useEffect(() => {
    const channel = supabase
      .channel(`standalone_meeting_slots_${workspace?.id || workspace?.user_id || 'global'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        loadBookedSlots();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspace?.id, workspace?.user_id, loadBookedSlots]);

  const todayIso = useMemo(() => getTodayIso(), []);
  const initialDate = useMemo(() => {
    const todayBooked = bookedSlotsMap[todayIso] || [];
    const hasToday = getFirstAvailableSlot(availableSlots, todayIso, 60, todayBooked);
    return hasToday ? todayIso : todayIso;
  }, [availableSlots, todayIso, bookedSlotsMap]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [meetingDate, setMeetingDate] = useState(initialDate);
  const [meetingTime, setMeetingTime] = useState(() => {
    const todayBooked = bookedSlotsMap[initialDate] || [];
    return getFirstAvailableSlot(availableSlots, initialDate, 60, todayBooked) || availableSlots[0] || '11:00 AM';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    const dateBooked = bookedSlotsMap[meetingDate] || [];
    if (isTimeSlotDisabled(meetingTime, meetingDate, 60, dateBooked)) {
      const valid = getFirstAvailableSlot(availableSlots, meetingDate, 60, dateBooked);
      setMeetingTime(valid || '');
    }
  }, [meetingDate, availableSlots, bookedSlotsMap]);

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlotConflictError(null);

    const cleanPhone = formatFullPhone(countryCode, phone);
    if (!cleanPhone) {
      alert('Please enter a valid phone number.');
      return;
    }

    const bookedForDate = bookedSlotsMap[meetingDate] || [];
    if (isTimeSlotBooked(meetingTime, bookedForDate)) {
      setSlotConflictError(`The time slot "${meetingTime}" on ${meetingDate} is already booked by another user. Please choose another available slot.`);
      loadBookedSlots();
      return;
    }

    if (!meetingTime || isTimeSlotDisabled(meetingTime, meetingDate, 60, bookedForDate)) {
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
      phone: cleanPhone,
      step_progress: 'meeting_booked',
      survey_responses: surveyAnswers,
      meeting_date: meetingDate,
      meeting_time: meetingTime,
      google_meet_url: workspace?.google_meet_url || null,
    };

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

      // Fire Meta Pixel Meeting Booked event
      trackMetaMeetingBooked({
        meeting_date: meetingDate,
        meeting_time: meetingTime,
        name,
        email,
        phone: cleanPhone,
        funnel_id: workspace?.id || undefined,
        user_id: workspace?.user_id || undefined,
      });

      // Dispatch Step 3 confirmation to lead and alert to admin
      dispatchWhatsappTrigger('step3', {
        name,
        email,
        phone: cleanPhone,
        meeting_date: meetingDate,
        meeting_time: meetingTime,
        google_meet_url: workspace?.google_meet_url || 'https://meet.google.com/qbi-erbq-moy',
        funnel_id: workspace?.id || undefined,
        user_id: workspace?.user_id || undefined,
        workspace_id: workspace?.id || undefined,
      }).catch((e) => console.warn('[Standalone Meeting WhatsApp Error]:', e));

      setIsBooked(true);
    } catch (err: any) {
      console.error('Error inserting/updating lead from /meeting:', err);
      if (err?.message && err.message.toLowerCase().includes('already booked')) {
        setSlotConflictError(err.message);
        loadBookedSlots();
      } else {
        alert('Failed to book meeting. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
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

            {workspace?.google_meet_url && (
              <div className="pt-2">
                <a
                  href={workspace.google_meet_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md"
                >
                  <span>Join Google Meet Call</span>
                </a>
              </div>
            )}
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
                  <div className="flex items-center gap-1.5">
                    <div className="relative shrink-0 w-[105px]">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full appearance-none pl-2.5 pr-6 py-2.5 rounded-xl border border-gray-800 bg-[#0B0F17] text-xs font-bold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={`${c.country}-${c.code}`} value={c.code} className="bg-[#0B0F17] text-white">
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </div>
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
                        }}
                        placeholder="98765 43210"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-800 bg-[#0B0F17] text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
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
                    Realtime availability
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableSlots.map((slot: string) => {
                    const bookedForDate = bookedSlotsMap[meetingDate] || [];
                    const isBooked = isTimeSlotBooked(slot, bookedForDate);
                    const isPassed = isTimeSlotPassedOrBuffered(slot, meetingDate, 60);
                    const isDisabled = isBooked || isPassed;
                    const isSelected = meetingTime === slot && !isDisabled;
                    return (
                      <button
                        type="button"
                        key={slot}
                        disabled={isDisabled}
                        onClick={() => {
                          if (!isDisabled) {
                            setMeetingTime(slot);
                            setSlotConflictError(null);
                          }
                        }}
                        title={
                          isBooked
                            ? 'Already booked by another client'
                            : isPassed
                            ? 'Time passed or within 1-hour notice'
                            : slot
                        }
                        className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all truncate select-none ${
                          isBooked
                            ? 'opacity-50 cursor-not-allowed bg-rose-500/10 border-rose-900/40 text-rose-400 line-through'
                            : isPassed
                            ? 'opacity-40 cursor-not-allowed bg-[#0B0F17]/50 border-dashed border-gray-800 text-gray-600 line-through'
                            : isSelected
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm font-extrabold cursor-pointer'
                            : 'border-gray-800 bg-[#0B0F17] text-gray-300 hover:border-gray-700 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Clock className={`w-3.5 h-3.5 shrink-0 ${isBooked ? 'text-rose-400' : isDisabled ? 'text-gray-600' : 'text-amber-400'}`} />
                          <span>{slot}</span>
                        </div>
                        {isBooked && (
                          <span className="text-[9px] uppercase font-mono font-extrabold text-rose-400 tracking-wider">
                            Booked
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {slotConflictError && (
                  <div className="p-3 mt-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{slotConflictError}</span>
                  </div>
                )}

                {!getFirstAvailableSlot(availableSlots, meetingDate, 60, bookedSlotsMap[meetingDate] || []) && (
                  <div className="p-2.5 mt-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>All slots for this date are booked or have passed. Please choose another date.</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !meetingTime || isTimeSlotDisabled(meetingTime, meetingDate, 60, bookedSlotsMap[meetingDate] || [])}
                className={`w-full py-4 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all mt-2 ${
                  !meetingTime || isTimeSlotDisabled(meetingTime, meetingDate, 60, bookedSlotsMap[meetingDate] || [])
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
