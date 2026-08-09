'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, Badge, Button } from '@/components/ui';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useClientDrawer } from '@/components/client/ClientDrawerContext';
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
} from 'lucide-react';

export default function ExecutiveCrmDashboard() {
  const { accentColor } = useTheme();
  const { openClientDrawer } = useClientDrawer();

  const [activeTab, setActiveTab] = useState<'leads' | 'meetings'>('leads');
  const [searchQuery, setSearchQuery] = useState('');
  const [campaign, setCampaign] = useState('All Campaigns');
  const [dateRange, setDateRange] = useState('Last 7 Days (Default)');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const leadsData = [
    {
      id: 1,
      name: 'Shaikh Sarwar',
      email: 'mominsarwar5555@gmail.com',
      phone: '+91 7709037124',
      steps: {
        detail: true,
        survey: false,
        meeting: false,
        meetingTime: null,
      },
      survey: null,
      time: '14:45',
      hasChat: false,
    },
    {
      id: 2,
      name: 'Sadaf Shaikh',
      email: 'sadafjafarshaikh@gmail.com',
      phone: '+91 9867869968',
      steps: {
        detail: true,
        survey: true,
        meeting: true,
        meetingTime: '2026-08-10 @ 02:00 PM',
      },
      survey: {
        industry: 'Service Business',
        investmentReady: 'Yes',
        revenue: 'Below ₹5L',
        role: 'Founder / Owner',
      },
      time: '14:37',
      hasChat: true,
    },
    {
      id: 3,
      name: 'Naiyar Mankad',
      email: 'naiyar@symphonyweight.com',
      phone: '+91 9409242100',
      steps: {
        detail: true,
        survey: true,
        meeting: true,
        meetingTime: '2026-08-10 @ 03:00 PM',
      },
      survey: {
        industry: 'Manufacturer / Distributor',
        investmentReady: 'Yes',
        revenue: '₹25L – ₹50L',
        role: 'Marketing Head',
      },
      time: '14:37',
      hasChat: true,
    },
    {
      id: 4,
      name: 'Asif Khan',
      email: 'gazainterior@gmail.com',
      phone: '+91 8082931505',
      steps: {
        detail: true,
        survey: true,
        meeting: true,
        meetingTime: '2026-08-09 @ 03:00 PM',
      },
      survey: {
        industry: 'Service Business',
        investmentReady: 'Maybe',
        revenue: 'Below ₹5L',
        role: 'Founder / Owner',
      },
      time: '14:37',
      hasChat: true,
    },
    {
      id: 5,
      name: 'Abid',
      email: 'badshachaiofficial@gmail.com',
      phone: '+91 9885020967',
      steps: {
        detail: true,
        survey: false,
        meeting: false,
        meetingTime: null,
      },
      survey: null,
      time: '13:34',
      hasChat: false,
    },
  ];

  const filteredLeads = leadsData.filter((lead) => {
    if (activeTab === 'meetings' && !lead.steps.meeting) return false;
    if (
      searchQuery &&
      !lead.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !lead.phone.includes(searchQuery) &&
      !lead.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <MainLayout>
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
            Executive CRM
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time tracking of leads, survey qualifications, and booked strategy meetings
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Campaign Selector */}
          <div className="relative">
            <select
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold rounded-xl border border-[#E5E7EB] bg-white text-gray-700 shadow-2xs focus:outline-none cursor-pointer"
            >
              <option>All Campaigns</option>
              <option>Meta Lead Ads Q3</option>
              <option>Google Inbound Funnel</option>
              <option>Organic Referral Program</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-50 text-gray-700 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 bg-white border border-[#E5E7EB] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Total Leads</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#F4EEFF] text-[#8146F0]">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#111827]">12</div>
          <p className="text-xs text-gray-400 font-medium">Leads matching filter</p>
        </Card>

        <Card className="p-5 bg-white border border-[#E5E7EB] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Partial Leads</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600">
              <Hourglass className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#F59E0B]">3</div>
          <p className="text-xs text-gray-400 font-medium">Need survey link</p>
        </Card>

        <Card className="p-5 bg-white border border-[#E5E7EB] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Survey Done</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
              <CheckSquare className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#2563EB]">9</div>
          <p className="text-xs text-gray-400 font-medium">Survey completed</p>
        </Card>

        <Card className="p-5 bg-white border border-[#E5E7EB] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Meetings</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600">
              <Calendar className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#059669]">4</div>
          <p className="text-xs text-gray-400 font-medium">Upcoming / Filtered</p>
        </Card>
      </div>

      {/* Lead Acquisition Conversion Funnel Card */}
      <Card className="p-6 bg-white border border-[#E5E7EB] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#111827]">
              Lead Acquisition Conversion Funnel
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Customer journey conversion rate from form to booked meeting
            </p>
          </div>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-[#F4EEFF] text-[#8146F0] border border-[#DDD0FC] self-start sm:self-auto">
            67% Conversion
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#111827]">1. Contact Form</span>
              <span className="font-extrabold text-[#8146F0]">12 Leads</span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full rounded-full bg-[#8146F0] w-full" />
            </div>
            <p className="text-[11px] text-gray-400">100% captured</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#111827]">2. Survey Done</span>
              <span className="font-extrabold text-[#2563EB]">9 Leads</span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full rounded-full bg-[#2563EB] w-[75%]" />
            </div>
            <p className="text-[11px] text-gray-400">75% completion rate</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#111827]">3. Growth Call</span>
              <span className="font-extrabold text-[#059669]">8 Meetings</span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full rounded-full bg-[#059669] w-[67%]" />
            </div>
            <p className="text-[11px] text-gray-400">67% final conversion</p>
          </div>
        </div>
      </Card>

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
              Leads (12)
            </button>
            <button
              onClick={() => setActiveTab('meetings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'meetings'
                  ? 'bg-[#F4EEFF] text-[#8146F0] border border-[#DDD0FC] shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Meetings (4)
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none pl-7 pr-7 py-2 text-xs font-semibold rounded-xl border border-[#E5E7EB] bg-white text-gray-700 shadow-2xs focus:outline-none cursor-pointer"
              >
                <option>Last 7 Days (Default)</option>
                <option>Today</option>
                <option>Last 30 Days</option>
                <option>All Time</option>
              </select>
              <Zap className="w-3.5 h-3.5 text-amber-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-3.5 pr-7 py-2 text-xs font-semibold rounded-xl border border-[#E5E7EB] bg-white text-gray-700 shadow-2xs focus:outline-none cursor-pointer"
              >
                <option>All Status</option>
                <option>Survey Done</option>
                <option>Meeting Booked</option>
                <option>Pending Survey</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or phone..."
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
                <th className="px-6 py-3.5 uppercase tracking-wider">Lead Info</th>
                <th className="px-6 py-3.5 uppercase tracking-wider">Mobile Number</th>
                <th className="px-6 py-3.5 uppercase tracking-wider">Step Progress & Remarks</th>
                <th className="px-6 py-3.5 uppercase tracking-wider">Survey Responses</th>
                <th className="px-6 py-3.5 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3.5 uppercase tracking-wider text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] bg-white">
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => openClientDrawer(lead)}
                  className="hover:bg-[#F4EEFF]/40 cursor-pointer transition-colors group"
                >
                  {/* Lead Info */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm text-[#111827] group-hover:text-[#8146F0] transition-colors">
                      {lead.name}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">{lead.email}</div>
                  </td>

                  {/* Mobile Number */}
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#111827]">{lead.phone}</span>
                  </td>

                  {/* Step Progress & Remarks */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Fill Detail</span>
                      </span>

                      <span className="text-gray-300">›</span>

                      {lead.steps.survey ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Fill Survey</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <X className="w-3 h-3 stroke-[3]" />
                          <span>Fill Survey</span>
                        </span>
                      )}

                      <span className="text-gray-300">›</span>

                      {lead.steps.meeting ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CalendarIcon className="w-3 h-3" />
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Booked Meeting ({lead.steps.meetingTime})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <X className="w-3 h-3 stroke-[3]" />
                          <span>Booked Meeting</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Survey Responses */}
                  <td className="px-6 py-4">
                    {lead.survey ? (
                      <div className="space-y-0.5 text-[11px]">
                        <p className="text-gray-600">
                          <span className="text-gray-400">Industry:</span> <span className="font-semibold text-gray-800">{lead.survey.industry}</span>
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-400">InvestmentReady:</span> <span className="font-semibold text-gray-800">{lead.survey.investmentReady}</span>
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-400">Revenue:</span> <span className="font-semibold text-gray-800">{lead.survey.revenue}</span>
                        </p>
                        <p className="text-gray-600">
                          <span className="text-gray-400">Role:</span> <span className="font-semibold text-gray-800">{lead.survey.role}</span>
                        </p>
                      </div>
                    ) : (
                      <span className="italic text-gray-400 font-medium">
                        No survey filled
                      </span>
                    )}
                  </td>

                  {/* Time */}
                  <td className="px-6 py-4 font-semibold text-gray-600">
                    {lead.time}
                  </td>

                  {/* Quick Actions */}
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openClientDrawer(lead)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-[11px] shadow-2xs cursor-pointer"
                      >
                        <span className="font-bold text-blue-600">G</span>
                        <span>Queue</span>
                      </button>

                      <button
                        onClick={() => openClientDrawer(lead)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px] hover:bg-indigo-100 cursor-pointer"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Logs</span>
                      </button>

                      <button
                        onClick={() => openClientDrawer(lead)}
                        className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-[11px] shadow-2xs cursor-pointer"
                      >
                        Details
                      </button>

                      {lead.hasChat ? (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold text-[11px] hover:bg-emerald-100"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          <span>Chat</span>
                        </a>
                      ) : (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#059669] text-white font-bold text-[11px] shadow-2xs hover:bg-[#047857]"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Send Survey</span>
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </MainLayout>
  );
}
