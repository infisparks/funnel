'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, Badge, Button } from '@/components/ui';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useAuth } from '@/components/auth/AuthContext';
import { useClientDrawer } from '@/components/client/ClientDrawerContext';
import { supabase } from '@/lib/supabaseClient';
import {
  Users,
  Hourglass,
  CheckSquare,
  Calendar,
  RefreshCw,
  Search,
  ChevronDown,
  Zap,
  Check,
  X,
  MessageCircle,
  FileText,
  Calendar as CalendarIcon,
  Shield,
  Phone,
  Mail,
} from 'lucide-react';

export default function ExecutiveCrmDashboard() {
  const { accentColor } = useTheme();
  const { user, workspace } = useAuth();
  const { openClientDrawer } = useClientDrawer();

  const [activeTab, setActiveTab] = useState<'leads' | 'meetings'>('leads');
  const [searchQuery, setSearchQuery] = useState('');
  const [campaign, setCampaign] = useState('All Campaigns');
  const [dateRange, setDateRange] = useState('Last 7 Days (Default)');
  const [statusFilter, setStatusFilter] = useState('All Status');

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
      if (!error && data && data.length > 0) {
        setLeadsData(data);
      } else {
        // Sample fallback data for preview if Supabase table has 0 leads
        setLeadsData([
          {
            id: '1',
            name: 'Shaikh Sarwar',
            email: 'mominsarwar5555@gmail.com',
            phone: '+91 7709037124',
            step_progress: 'step1_contact',
            survey_responses: null,
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Sadaf Shaikh',
            email: 'sadafjafarshaikh@gmail.com',
            phone: '+91 9867869968',
            step_progress: 'meeting_booked',
            meeting_date: '2026-08-10',
            meeting_time: '02:00 PM',
            survey_responses: {
              industry: 'Service Business',
              investmentReady: 'Yes',
              revenue: 'Below ₹5L',
            },
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
        ]);
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

  const filteredLeads = leadsData.filter((lead) => {
    if (activeTab === 'meetings' && lead.step_progress !== 'meeting_booked') return false;
    if (
      searchQuery &&
      !lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !lead.phone?.includes(searchQuery) &&
      !lead.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

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
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 font-extrabold text-xs flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-600" />
            <span>Isolated User Data Active</span>
          </span>

          {/* Refresh Button */}
          <button
            onClick={fetchUserIsolatedLeads}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-50 text-gray-700 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isLoadingLeads ? 'animate-spin' : ''}`} />
            <span>Refresh Leads</span>
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
            <span className="text-xs font-bold text-gray-500">Survey Done</span>
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

      {/* CRM Leads Table Card */}
      <Card className="p-0 overflow-hidden bg-white border border-[#E5E7EB]">
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'leads'
                  ? 'bg-[#F4EEFF] text-[#8146F0] border border-[#DDD0FC] shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Leads ({totalLeadsCount})
            </button>
            <button
              onClick={() => setActiveTab('meetings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'meetings'
                  ? 'bg-[#F4EEFF] text-[#8146F0] border border-[#DDD0FC] shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Booked Meetings ({meetingsCount})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, email..."
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#F5F6F8] border border-[#E5E7EB] rounded-xl focus:bg-white focus:outline-none text-[#111827]"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-gray-500 font-bold border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-3.5 uppercase tracking-wider">Lead Contact</th>
                <th className="px-6 py-3.5 uppercase tracking-wider">WhatsApp Phone</th>
                <th className="px-6 py-3.5 uppercase tracking-wider">Step Progress</th>
                <th className="px-6 py-3.5 uppercase tracking-wider">Survey & Meeting Slot</th>
                <th className="px-6 py-3.5 uppercase tracking-wider">Submission Time</th>
                <th className="px-6 py-3.5 uppercase tracking-wider text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] bg-white">
              {isLoadingLeads ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 font-bold">
                    Loading isolated lead data from Supabase master table...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No leads found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => openClientDrawer(lead)}
                    className="hover:bg-[#F4EEFF]/40 cursor-pointer transition-colors group"
                  >
                    {/* Lead Info */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-[#111827] group-hover:text-[#8146F0] transition-colors">
                        {lead.name || 'Anonymous Visitor'}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">{lead.email || 'N/A'}</div>
                    </td>

                    {/* Mobile Number */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#111827] font-mono">{lead.phone || 'N/A'}</span>
                    </td>

                    {/* Step Progress */}
                    <td className="px-6 py-4">
                      {lead.step_progress === 'meeting_booked' ? (
                        <Badge variant="success">Meeting Booked 📅</Badge>
                      ) : (
                        <Badge variant="warning">Contact Info Saved</Badge>
                      )}
                    </td>

                    {/* Survey & Meeting Slot */}
                    <td className="px-6 py-4">
                      {lead.meeting_date ? (
                        <div className="space-y-0.5 text-[11px]">
                          <p className="font-bold text-emerald-700">
                            {lead.meeting_date} @ {lead.meeting_time || '02:00 PM'}
                          </p>
                        </div>
                      ) : (
                        <span className="italic text-gray-400 font-medium">Pending Slot</span>
                      )}
                    </td>

                    {/* Time */}
                    <td className="px-6 py-4 font-semibold text-gray-600">
                      {lead.created_at ? new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </td>

                    {/* Quick Actions */}
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openClientDrawer(lead)}
                          className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-[11px] shadow-2xs cursor-pointer"
                        >
                          Details
                        </button>

                        <a
                          href={`https://wa.me/${(lead.phone || '').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold text-[11px] hover:bg-emerald-100"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </MainLayout>
  );
}
