'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';

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
      label: 'Are You Ready to Invest in Growth?',
      options: ['Yes, Immediate Priority', 'Exploring Options', 'Not Yet'],
    },
  ];

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hasSavedDetails, setHasSavedDetails] = useState(false);

  // Check browser localStorage on mount
  React.useEffect(() => {
    try {
      const savedSession = localStorage.getItem('lead_funnel_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed.name && (parsed.email || parsed.phone)) {
          setName(parsed.name || '');
          setEmail(parsed.email || '');
          setPhone(parsed.phone || '');
          setHasSavedDetails(true);
        }
      }
    } catch (err) {}
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSavedDetails && (!name || !phone || !email)) {
      alert('Please fill in your Name, Email, and Phone number');
      return;
    }

    // Save lead details to localStorage
    const leadSession = { name, email, phone };
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
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Client: <strong>{name}</strong> ({phone || email})</span>
              </span>
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
                        onClick={() => setAnswers({ ...answers, [q.id]: opt })}
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
