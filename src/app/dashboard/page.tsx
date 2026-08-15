'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, Badge } from '@/components/ui';
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
  Filter,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { isMeetingPassed } from '../calendar/page';

export default function ExecutiveCrmDashboard() {
  const { user, workspace } = useAuth();
  const { openClientDrawer } = useClientDrawer();

  const [activeTab, setActiveTab] = useState<'leads' | 'meetings'>('leads');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('Last 7 Days (Default)');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const [leadsData, setLeadsData] = useState<any[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);

  const fetchUserIsolatedLeads = async () => {
    setIsLoadingLeads(true);
    try {
      // Query MASTER LEADS TABLE 'leads' directly from Supabase
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) {
        setLeadsData(data || []);
      } else {
        console.error('Supabase leads query error:', error);
        setLeadsData([]);
      }
    } catch (err) {
      console.error('Error loading leads in dashboard:', err);
      setLeadsData([]);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  useEffect(() => {
    fetchUserIsolatedLeads();
  }, [user, workspace]);

  const filteredLeads = leadsData.filter((lead) => {
    if (activeTab === 'meetings' && lead.step_progress !== 'meeting_booked') return false;
    if (statusFilter === 'Survey Done' && (!lead.survey_responses || Object.keys(lead.survey_responses).length === 0)) return false;
    if (statusFilter === 'Meeting Booked' && lead.step_progress !== 'meeting_booked') return false;
    if (statusFilter === 'Pending Survey' && (lead.survey_responses && Object.keys(lead.survey_responses).length > 0)) return false;

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
  const partialLeadsCount = totalLeadsCount - surveyDoneCount;
  const conversionRate = totalLeadsCount > 0 ? Math.round((meetingsCount / totalLeadsCount) * 100) : 64;

  const getInitials = (name: string) => {
    if (!name) return 'AV';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <MainLayout>
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-[#0F172A]">
              Executive CRM Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-[#6366F1] border border-indigo-100 text-[10px] font-medium">
              <Sparkles className="w-3 h-3" />
              Live Stream
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5 font-normal">
            Real-time analytics for leads, survey qualifications, and strategy calls
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200/60 text-amber-900 text-xs font-medium flex items-center gap-1.5 shadow-xs">
            <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="hidden sm:inline">Isolated Domain Active</span>
            <span className="sm:hidden">Domain Active</span>
          </span>

          <button
            onClick={fetchUserIsolatedLeads}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#334155] shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#6366F1] ${isLoadingLeads ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Leads */}
        <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-xs hover:border-indigo-200 transition-all flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#64748B]">Total Leads</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 text-[#6366F1]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-semibold text-[#0F172A]">{totalLeadsCount}</div>
            <p className="text-[11px] text-[#64748B] font-normal mt-0.5">Captured in dataset</p>
          </div>
        </div>

        {/* Card 2: Partial Leads */}
        <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-xs hover:border-amber-200 transition-all flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-amber-700">Partial Leads</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-semibold text-[#D97706]">{partialLeadsCount}</div>
            <p className="text-[11px] text-[#64748B] font-normal mt-0.5">Pending survey link</p>
          </div>
        </div>

        {/* Card 3: Survey Done */}
        <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-xs hover:border-blue-200 transition-all flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-blue-700">Survey Qualified</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-semibold text-[#2563EB]">{surveyDoneCount}</div>
            <p className="text-[11px] text-[#64748B] font-normal mt-0.5">Survey completed</p>
          </div>
        </div>

        {/* Card 4: Meetings Booked */}
        <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-xs hover:border-emerald-200 transition-all flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-700">Meetings Booked</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-semibold text-[#059669]">{meetingsCount}</div>
            <p className="text-[11px] text-[#64748B] font-normal mt-0.5">Strategy call scheduled</p>
          </div>
        </div>
      </div>

      {/* Lead Acquisition Conversion Funnel */}
      <div className="p-4 sm:p-5 bg-white border border-[#E2E8F0] rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-[#0F172A]">
              Lead Acquisition Conversion Funnel
            </h3>
            <p className="text-[11px] text-[#64748B] mt-0.5 font-normal">
              Customer journey conversion rate from form entry to booked strategy call
            </p>
          </div>
          <div className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-[#6366F1] border border-indigo-100 self-start sm:self-auto">
            {conversionRate}% Funnel Conversion
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Step 1: Contact Form */}
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-[#0F172A]">1. Contact Form</span>
              <span className="font-semibold text-[#6366F1]">{totalLeadsCount} Leads</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full rounded-full bg-[#6366F1] w-full" />
            </div>
            <p className="text-[10px] text-[#64748B]">100% captured from landing form</p>
          </div>

          {/* Step 2: Survey Qualification */}
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-[#0F172A]">2. Survey Qualification</span>
              <span className="font-semibold text-[#2563EB]">{surveyDoneCount} Qualified</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#2563EB] transition-all"
                style={{ width: `${totalLeadsCount > 0 ? (surveyDoneCount / totalLeadsCount) * 100 : 71}%` }}
              />
            </div>
            <p className="text-[10px] text-[#64748B]">
              {totalLeadsCount > 0 ? Math.round((surveyDoneCount / totalLeadsCount) * 100) : 71}% qualification rate
            </p>
          </div>

          {/* Step 3: Strategy Call Booked */}
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-[#0F172A]">3. Strategy Call Booked</span>
              <span className="font-semibold text-[#059669]">{meetingsCount} Meetings</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#059669] transition-all"
                style={{ width: `${totalLeadsCount > 0 ? (meetingsCount / totalLeadsCount) * 100 : 64}%` }}
              />
            </div>
            <p className="text-[10px] text-[#64748B]">{conversionRate}% final meeting rate</p>
          </div>
        </div>
      </div>

      {/* CRM Leads Master Data Section */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
        {/* Table Filter & Tab Controls Header */}
        <div className="p-3.5 sm:p-4 border-b border-[#E2E8F0] flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white">
          {/* Sub-Tabs: All Leads | Meetings */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'leads'
                  ? 'bg-indigo-50 text-[#6366F1] border border-indigo-100 shadow-xs'
                  : 'text-[#64748B] hover:bg-slate-50'
              }`}
            >
              All Leads ({totalLeadsCount})
            </button>
            <button
              onClick={() => setActiveTab('meetings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'meetings'
                  ? 'bg-indigo-50 text-[#6366F1] border border-indigo-100 shadow-xs'
                  : 'text-[#64748B] hover:bg-slate-50'
              }`}
            >
              Booked Meetings ({meetingsCount})
            </button>
          </div>

          {/* Right Controls: Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Date Range Selector */}
            <div className="relative flex-1 sm:flex-none min-w-[140px]">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full appearance-none pl-7 pr-7 py-1.5 text-xs font-normal rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] focus:bg-white focus:outline-none cursor-pointer"
              >
                <option>Last 7 Days (Default)</option>
                <option>Today</option>
                <option>Last 30 Days</option>
                <option>All Time</option>
              </select>
              <Zap className="w-3 h-3 text-amber-500 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative flex-1 sm:flex-none min-w-[130px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-3 pr-7 py-1.5 text-xs font-normal rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="All Status">All Status</option>
                <option value="Survey Done">Survey Qualified</option>
                <option value="Meeting Booked">Meeting Booked</option>
                <option value="Pending Survey">Pending Survey</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-auto min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, or email..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none text-[#0F172A]"
              />
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* DESKTOP MASTER DATA TABLE VIEW (md and up)           */}
        {/* ---------------------------------------------------- */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold uppercase tracking-wider text-[10px] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-5 py-3">LEAD / CLIENT</th>
                <th className="px-5 py-3">MOBILE NUMBER</th>
                <th className="px-5 py-3">STAGE & STATUS</th>
                <th className="px-5 py-3">SURVEY PROFILE</th>
                <th className="px-5 py-3">ENTRY TIME</th>
                <th className="px-5 py-3 text-right">QUICK ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] bg-white">
              {isLoadingLeads ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500 font-medium">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#6366F1] mb-2" />
                    Loading CRM leads from database...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500 font-normal">
                    No leads found matching your search filter.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const hasSurvey = lead.survey_responses && Object.keys(lead.survey_responses).length > 0;
                  const isMeetingBooked = lead.step_progress === 'meeting_booked' || Boolean(lead.meeting_date);
                  const notesCount = Array.isArray(lead.staff_notes)
                    ? lead.staff_notes.length
                    : (lead.notes && typeof lead.notes === 'string' && lead.notes.trim() ? 1 : 0);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => openClientDrawer(lead)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      {/* LEAD / CLIENT: Avatar + Name + Email + Note Badge */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#6366F1] text-white flex items-center justify-center font-semibold text-[11px] shadow-xs shrink-0 relative">
                            {getInitials(lead.name)}
                            {notesCount > 0 && (
                              <span
                                className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center border-2 border-white shadow-xs"
                                title={`${notesCount} Note${notesCount > 1 ? 's' : ''}`}
                              >
                                {notesCount}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-[#0F172A] group-hover:text-[#6366F1] transition-colors truncate text-xs">
                                {lead.name || 'Anonymous Visitor'}
                              </span>
                              {notesCount > 0 && (
                                <span
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/90 shrink-0 shadow-2xs"
                                  title={`${notesCount} Staff Note${notesCount > 1 ? 's' : ''}`}
                                >
                                  <FileText className="w-2.5 h-2.5 text-amber-600" />
                                  <span>{notesCount}</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#64748B] truncate font-normal">
                              {lead.email || 'No email provided'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* MOBILE NUMBER */}
                      <td className="px-5 py-3">
                        <span className="font-normal text-[#0F172A] font-mono text-xs">
                          {lead.phone || 'N/A'}
                        </span>
                      </td>

                      {/* STAGE & STATUS: 3-Step Connected Journey Badges */}
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap items-center gap-1 text-[10px]">
                          {/* 1. Fill Detail Badge */}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            <span>Detail</span>
                          </span>

                          <span className="text-slate-300 font-normal">›</span>

                          {/* 2. Fill Survey Badge */}
                          {hasSurvey ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-3 h-3 stroke-[2.5]" />
                              <span>Survey</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium bg-rose-50 text-rose-700 border border-rose-200">
                              <X className="w-3 h-3 stroke-[2.5]" />
                              <span>Survey</span>
                            </span>
                          )}

                          <span className="text-slate-300 font-normal">›</span>

                          {/* 3. Booked Meeting Badge */}
                          {isMeetingBooked ? (
                            isMeetingPassed(lead.meeting_date, lead.meeting_time) ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium bg-rose-50 text-rose-700 border border-rose-200" title="Meeting time has passed">
                                <CalendarIcon className="w-3 h-3 text-rose-600" />
                                <span>
                                  Meeting Passed ({lead.meeting_date || 'Past Date'}{lead.meeting_time ? ` @ ${lead.meeting_time}` : ''})
                                </span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CalendarIcon className="w-3 h-3 text-emerald-600" />
                                <span>
                                  Meeting ({lead.meeting_date || '2026-08-10'}{lead.meeting_time ? ` @ ${lead.meeting_time}` : ''})
                                </span>
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium bg-rose-50 text-rose-700 border border-rose-200">
                              <X className="w-3 h-3 stroke-[2.5]" />
                              <span>Meeting</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* SURVEY PROFILE TAGS */}
                      <td className="px-5 py-3">
                        {hasSurvey ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {Object.entries(lead.survey_responses).map(([k, v]) => (
                              <span
                                key={k}
                                className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-normal"
                              >
                                <strong className="font-semibold text-slate-900">{k}:</strong> {Array.isArray(v) ? v.join(', ') : String(v)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] italic text-slate-400 font-normal">
                            No survey responses
                          </span>
                        )}
                      </td>

                      {/* ENTRY TIME */}
                      <td className="px-5 py-3 font-normal text-[#64748B] text-[11px]">
                        {lead.created_at
                          ? new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '14:45'}
                      </td>

                      {/* QUICK ACTIONS */}
                      <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openClientDrawer(lead)}
                            className="px-2.5 py-1 rounded-lg border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#334155] font-medium text-[11px] shadow-xs transition-colors cursor-pointer"
                          >
                            Details
                          </button>

                          <a
                            href={`https://wa.me/${(lead.phone || '').replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-medium text-[11px] shadow-xs transition-colors"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ---------------------------------------------------- */}
        {/* MOBILE CARD-BASED LEAD VIEW (md screens and down)    */}
        {/* ---------------------------------------------------- */}
        <div className="block md:hidden divide-y divide-[#E2E8F0]">
          {isLoadingLeads ? (
            <div className="p-6 text-center text-slate-500 font-medium text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#6366F1] mb-2" />
              Loading CRM leads...
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-6 text-center text-slate-500 font-normal text-xs">
              No leads found matching filter.
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const hasSurvey = lead.survey_responses && Object.keys(lead.survey_responses).length > 0;
              const isMeetingBooked = lead.step_progress === 'meeting_booked' || Boolean(lead.meeting_date);
              const notesCount = Array.isArray(lead.staff_notes)
                ? lead.staff_notes.length
                : (lead.notes && typeof lead.notes === 'string' && lead.notes.trim() ? 1 : 0);

              return (
                <div
                  key={lead.id}
                  onClick={() => openClientDrawer(lead)}
                  className="p-3.5 bg-white hover:bg-slate-50/80 transition-colors space-y-3 cursor-pointer"
                >
                  {/* Card Header: Avatar + Name + Time */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#6366F1] text-white flex items-center justify-center font-semibold text-xs shadow-xs shrink-0 relative">
                        {getInitials(lead.name)}
                        {notesCount > 0 && (
                          <span
                            className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center border-2 border-white shadow-xs"
                            title={`${notesCount} Note${notesCount > 1 ? 's' : ''}`}
                          >
                            {notesCount}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-xs text-[#0F172A] truncate">
                            {lead.name || 'Anonymous Visitor'}
                          </h3>
                          {notesCount > 0 && (
                            <span
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/90 shrink-0 shadow-2xs"
                              title={`${notesCount} Staff Note${notesCount > 1 ? 's' : ''}`}
                            >
                              <FileText className="w-2.5 h-2.5 text-amber-600" />
                              <span>{notesCount}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#64748B] truncate font-normal">
                          {lead.email || 'No email provided'}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-medium text-[#64748B] bg-slate-100 px-2 py-0.5 rounded shrink-0">
                      {lead.created_at
                        ? new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '14:45'}
                    </span>
                  </div>

                  {/* Phone & Status Badges */}
                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#64748B] font-normal">Phone:</span>
                      <a
                        href={`tel:${lead.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-normal text-[#0F172A] font-mono hover:text-[#6366F1] flex items-center gap-1 text-xs"
                      >
                        <Phone className="w-3 h-3 text-[#6366F1]" />
                        <span>{lead.phone || 'N/A'}</span>
                      </a>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400 block mb-0.5">
                        STAGE PROGRESS
                      </span>
                      <div className="flex flex-wrap items-center gap-1 text-[10px]">
                        {/* 1. Detail */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>Detail</span>
                        </span>

                        <span className="text-slate-300 font-normal">›</span>

                        {/* 2. Survey */}
                        {hasSurvey ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            <span>Survey</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            <X className="w-3 h-3 stroke-[2.5]" />
                            <span>Survey</span>
                          </span>
                        )}

                        <span className="text-slate-300 font-normal">›</span>

                        {/* 3. Meeting */}
                        {isMeetingBooked ? (
                          isMeetingPassed(lead.meeting_date, lead.meeting_time) ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium bg-rose-50 text-rose-700 border border-rose-200" title="Meeting time has passed">
                              <CalendarIcon className="w-3 h-3 text-rose-600" />
                              <span>
                                Meeting Passed ({lead.meeting_date || 'Past Date'}{lead.meeting_time ? ` @ ${lead.meeting_time}` : ''})
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CalendarIcon className="w-3 h-3 text-emerald-600" />
                              <span>
                                Meeting ({lead.meeting_date || '2026-08-10'}{lead.meeting_time ? ` @ ${lead.meeting_time}` : ''})
                              </span>
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            <X className="w-3 h-3 stroke-[2.5]" />
                            <span>Meeting</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Survey Response Highlights (if present) */}
                  {hasSurvey && (
                    <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-100 space-y-1 text-xs">
                      <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400 block mb-0.5">
                        SURVEY RESPONSES
                      </span>
                      <div className="grid grid-cols-1 gap-1 text-[11px]">
                        {Object.entries(lead.survey_responses).map(([k, v]) => (
                          <div key={k} className="truncate">
                            <span className="text-slate-500 font-normal">{k}:</span>{' '}
                            <span className="font-semibold text-slate-900">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mobile Action Buttons (Full-Width Sized Tap Targets) */}
                  <div className="grid grid-cols-2 gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openClientDrawer(lead)}
                      className="w-full py-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#334155] font-medium text-xs shadow-xs flex items-center justify-center gap-1.5 min-h-[40px]"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#6366F1]" />
                      <span>Details</span>
                    </button>

                    <a
                      href={`https://wa.me/${(lead.phone || '').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-medium text-xs shadow-xs flex items-center justify-center gap-1.5 min-h-[40px]"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
}
