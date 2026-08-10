'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface StandaloneSurveyClientProps {
  workspace: any;
}

export function StandaloneSurveyClient({ workspace }: StandaloneSurveyClientProps) {
  const router = useRouter();
  const surveyQuestions = workspace?.survey_questions || [
    {
      id: 'q1',
      label: 'Select Your Primary Industry',
      options: ['Service Business', 'Manufacturer / B2B', 'Medical / Clinic', 'E-commerce Store'],
    },
    {
      id: 'q2',
      label: 'Estimated Monthly Revenue Range',
      options: ['Below ₹5 Lakhs', '₹5 Lakhs – ₹15 Lakhs', '₹15 Lakhs – ₹50 Lakhs', 'Above ₹50 Lakhs'],
    },
  ];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [savedLeadId, setSavedLeadId] = useState<string | null>(null);
  const [hasSavedDetails, setHasSavedDetails] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check browser localStorage on mount
  React.useEffect(() => {
    try {
      const savedSession = localStorage.getItem('lead_funnel_session') || localStorage.getItem('lead_contact_info');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed.name || parsed.email || parsed.phone) {
          setName(parsed.name || '');
          setEmail(parsed.email || '');
          setPhone(parsed.phone || '');
          if (parsed.leadId) setSavedLeadId(parsed.leadId);
          if (parsed.surveyAnswers) setAnswers(parsed.surveyAnswers);
          if (parsed.name && (parsed.email || parsed.phone)) {
            setHasSavedDetails(true);
          }
        }
      }
    } catch (err) {}
  }, []);

  const resetStandaloneSession = () => {
    localStorage.removeItem('lead_funnel_session');
    localStorage.removeItem('lead_contact_info');
    setName('');
    setEmail('');
    setPhone('');
    setSavedLeadId(null);
    setAnswers({});
    setHasSavedDetails(false);
  };

  const handleSelectOption = (qId: string, opt: string) => {
    const questionObj = surveyQuestions.find((q: any) => q.id === qId || q.label === qId);
    const keyToUse = questionObj?.label || qId;

    const updated = { ...answers, [keyToUse]: opt };
    setAnswers(updated);

    // Instantly sync option selection to Supabase in real time
    (async () => {
      try {
        const cleanPhone = phone.trim();
        let activeLeadId = savedLeadId;

        if (!activeLeadId && cleanPhone) {
          const { data: found } = await supabase
            .from('leads')
            .select('id')
            .eq('phone', cleanPhone)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (found?.id) {
            activeLeadId = found.id;
            setSavedLeadId(found.id);
          }
        }

        const payload: any = {
          name: name || 'Anonymous Visitor',
          email: email || '',
          phone: cleanPhone,
          step_progress: 'survey_completed',
          survey_responses: updated,
        };
        if (workspace?.id) payload.funnel_id = workspace.id;

        if (activeLeadId) {
          await supabase.from('leads').update(payload).eq('id', activeLeadId);
        } else if (name || cleanPhone) {
          const { data: inserted } = await supabase.from('leads').insert(payload).select('id').maybeSingle();
          if (inserted?.id) setSavedLeadId(inserted.id);
        }
      } catch (err) {
        console.error('Error auto-syncing survey option to Supabase:', err);
      }
    })();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSavedDetails && (!name || !phone || !email)) {
      alert('Please fill in your Name, Email, and Phone number');
      return;
    }

    setIsSubmitting(true);
    const cleanPhone = phone.trim();
    let activeLeadId = savedLeadId;

    try {
      if (!activeLeadId && cleanPhone) {
        const { data: found } = await supabase
          .from('leads')
          .select('id')
          .eq('phone', cleanPhone)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (found?.id) {
          activeLeadId = found.id;
        }
      }

      const leadPayload: any = {
        name: name || 'Anonymous Visitor',
        email: email || '',
        phone: cleanPhone,
        step_progress: 'survey_completed',
        survey_responses: answers,
      };
      if (workspace?.id) leadPayload.funnel_id = workspace.id;

      if (activeLeadId) {
        await supabase.from('leads').update(leadPayload).eq('id', activeLeadId);
      } else {
        const { data } = await supabase.from('leads').insert(leadPayload).select('id').maybeSingle();
        if (data?.id) activeLeadId = data.id;
      }
    } catch (err) {
      console.error('Error saving survey responses to Supabase:', err);
    } finally {
      setIsSubmitting(false);
    }

    // Save lead details to localStorage
    const leadSession = { name, email, phone: cleanPhone, leadId: activeLeadId, surveyAnswers: answers, hasCompletedSurvey: true };
    localStorage.setItem('lead_funnel_session', JSON.stringify(leadSession));

    // Redirect to separate /meeting route with saved survey answers
    const params = new URLSearchParams();
    if (workspace?.id) params.set('funnel_id', workspace.id);
    if (workspace?.subdomain) params.set('subdomain', workspace.subdomain);
    params.set('surveyData', JSON.stringify(answers));
    params.set('leadInfo', JSON.stringify(leadSession));

    router.push(`/meeting?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#131B2A] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase">
            <span>Step 2 of 3</span>
            <span>•</span>
            <span>Qualification Survey</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Qualify Your Business Requirements
          </h1>

          <p className="text-xs text-gray-400">
            Please answer these brief questions so we can prepare your custom strategy session.
          </p>

          {hasSavedDetails ? (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Client: <strong>{name}</strong> ({phone || email})</span>
              </span>
              <button
                type="button"
                onClick={resetStandaloneSession}
                className="text-xs text-amber-400 hover:underline font-bold cursor-pointer"
              >
                + Fill New Details
              </button>
            </div>
          ) : (
            <p className="text-xs text-amber-400 font-semibold pt-1">
              Please enter your details below before taking the survey.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* If user details NOT found in browser localStorage, show contact inputs */}
          {!hasSavedDetails && (
            <div className="p-4 rounded-2xl bg-[#0B0F17] border border-gray-800 space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Your Contact Information
              </h3>
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setName(val);
                      localStorage.setItem('lead_funnel_session', JSON.stringify({ name: val, email, phone }));
                    }}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-800 bg-[#131B2A] text-xs font-medium text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">WhatsApp Phone *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPhone(val);
                        localStorage.setItem('lead_funnel_session', JSON.stringify({ name, email, phone: val }));
                      }}
                      placeholder="+91 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-800 bg-[#131B2A] text-xs font-medium text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">Work Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEmail(val);
                        localStorage.setItem('lead_funnel_session', JSON.stringify({ name, email: val, phone }));
                      }}
                      placeholder="name@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-800 bg-[#131B2A] text-xs font-medium text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-5">
            {surveyQuestions.map((q: any) => (
              <div key={q.id} className="space-y-2">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {q.label}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt: string) => {
                    const isSelected = answers[q.id] === opt;
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => handleSelectOption(q.id, opt)}
                        className={`p-3 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/20 text-white shadow-sm'
                            : 'border-gray-800 bg-[#0B0F17] text-gray-300 hover:border-gray-700'
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
            className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <span>Proceed to Meeting Booking (/meeting)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
