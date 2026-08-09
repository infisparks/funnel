'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui';
import { useAuth } from '@/components/auth/AuthContext';
import { LeadsTable } from '@/components/funnel/LeadsTable';
import { supabase } from '@/lib/supabaseClient';
import {
  Users,
  Hourglass,
  CheckSquare,
  Calendar,
  RefreshCw,
  Shield,
  Zap,
} from 'lucide-react';

export default function ExecutiveCrmDashboard() {
  const { user, workspace } = useAuth();

  const [leadsData, setLeadsData] = useState<any[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);

  const fetchUserIsolatedLeads = async () => {
    setIsLoadingLeads(true);
    try {
      // MASTER LEADS TABLE: 'leads'
      // STRICT FILTER RULE: Only fetch leads belonging to logged-in user or workspace!
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (user?.id) {
        if (workspace?.id) {
          query = query.or(`user_id.eq.${user.id},funnel_id.eq.${workspace.id}`);
        } else {
          query = query.eq('user_id', user.id);
        }
      } else if (workspace?.id) {
        query = query.eq('funnel_id', workspace.id);
      }

      const { data, error } = await query;
      if (!error && data) {
        setLeadsData(data);
      }
    } catch (err) {
      console.error('Error loading isolated leads in dashboard:', err);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  useEffect(() => {
    fetchUserIsolatedLeads();
  }, [user, workspace]);

  const totalLeadsCount = leadsData.length;
  const meetingsCount = leadsData.filter((l) => l.step_progress === 'meeting_booked').length;
  const surveyDoneCount = leadsData.filter((l) => l.survey_responses && Object.keys(l.survey_responses).length > 0).length;

  return (
    <MainLayout>
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
            Executive CRM & Landing Page Leads
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Strict user-level data isolation rule: Only displaying leads for your domain.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs">
            <Shield className="w-4 h-4 text-amber-600" />
            <span>Isolated Domain Leads Active</span>
          </span>

          <button
            onClick={fetchUserIsolatedLeads}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-50 text-gray-700 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isLoadingLeads ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 bg-white border border-[#E5E7EB] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Your Landing Leads</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#F4EEFF] text-[#8146F0]">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#111827]">{totalLeadsCount}</div>
          <p className="text-xs text-gray-400 font-medium">Your domain submissions</p>
        </Card>

        <Card className="p-5 bg-white border border-[#E5E7EB] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Partial Leads</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600">
              <Hourglass className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#F59E0B]">{totalLeadsCount - surveyDoneCount}</div>
          <p className="text-xs text-gray-400 font-medium">Contact saved step 1</p>
        </Card>

        <Card className="p-5 bg-white border border-[#E5E7EB] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Survey Completed</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
              <CheckSquare className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#2563EB]">{surveyDoneCount}</div>
          <p className="text-xs text-gray-400 font-medium">Survey answered</p>
        </Card>

        <Card className="p-5 bg-white border border-[#E5E7EB] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Booked Meetings</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600">
              <Calendar className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#059669]">{meetingsCount}</div>
          <p className="text-xs text-gray-400 font-medium">Locked calendar slots</p>
        </Card>
      </div>

      {/* FULL ISOLATED LEADS DIRECTORY TABLE */}
      <LeadsTable />
    </MainLayout>
  );
}
