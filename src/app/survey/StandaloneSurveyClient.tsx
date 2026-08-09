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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to separate /meeting route with saved survey answers
    const params = new URLSearchParams();
    if (workspace?.id) params.set('funnel_id', workspace.id);
    if (workspace?.subdomain) params.set('subdomain', workspace.subdomain);
    params.set('surveyData', JSON.stringify(answers));

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
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
