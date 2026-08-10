'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Calendar, Clock, CheckCircle2, User, Phone, Mail } from 'lucide-react';

interface StandaloneMeetingClientProps {
  workspace: any;
}

export function StandaloneMeetingClient({ workspace }: StandaloneMeetingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [meetingDate, setMeetingDate] = useState('2026-08-10');
  const [meetingTime, setMeetingTime] = useState('02:00 PM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
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

    try {
      let targetId = null;
      const cleanPhone = (phone || '').trim();

      if (cleanPhone) {
        const { data: found } = await supabase
          .from('leads')
          .select('id')
          .eq('phone', cleanPhone)
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
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-800 bg-[#0B0F17] text-xs font-bold text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Available Time Slots *
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
                            : 'border-gray-800 bg-[#0B0F17] text-gray-300 hover:border-gray-700'
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
                className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer mt-2"
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
