'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, Badge, Button } from '@/components/ui';
import { useTheme } from '@/components/theme/ThemeProvider';
import { supabase } from '@/lib/supabaseClient';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ChevronDown,
  Calendar as CalendarIcon,
  Plus,
  AlertTriangle,
  Lock,
  Clock,
  User,
  Video,
  Save,
  X,
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  name: string;
  time: string;
  type: 'red' | 'green' | 'amber';
}

interface CalendarDay {
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday?: boolean;
  events: CalendarEvent[];
  overflowCount?: number;
}

export default function MeetingsCalendarPage() {
  const { accentColor } = useTheme();
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [campaign, setCampaign] = useState('All Campaigns');
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarDay | null>(null);

  const [isMeetModalOpen, setIsMeetModalOpen] = useState(false);
  const [googleMeetUrl, setGoogleMeetUrl] = useState('https://meet.google.com/qbi-erbq-moy');
  const [deletePin, setDeletePin] = useState('1234');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    const savedMeet = typeof window !== 'undefined' ? localStorage.getItem('workspace_google_meet_url') : null;
    const savedPin = typeof window !== 'undefined' ? localStorage.getItem('workspace_delete_pin') : null;
    if (savedMeet) setGoogleMeetUrl(savedMeet);
    if (savedPin) setDeletePin(savedPin);

    (async () => {
      try {
        const { data } = await supabase
          .from('funnel_workspaces')
          .select('google_meet_url, delete_pin')
          .limit(1)
          .maybeSingle();

        if (data?.google_meet_url) {
          setGoogleMeetUrl(data.google_meet_url);
          localStorage.setItem('workspace_google_meet_url', data.google_meet_url);
        }
        if (data?.delete_pin) {
          setDeletePin(data.delete_pin);
          localStorage.setItem('workspace_delete_pin', data.delete_pin);
        }
      } catch (err) {
        console.error('Error loading workspace settings:', err);
      }
    })();
  }, []);

  const handleSaveMeetSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      localStorage.setItem('workspace_google_meet_url', googleMeetUrl);
      localStorage.setItem('workspace_delete_pin', deletePin);

      const { data: workspaces } = await supabase.from('funnel_workspaces').select('id').limit(1);
      if (workspaces && workspaces.length > 0) {
        await supabase.from('funnel_workspaces').update({
          google_meet_url: googleMeetUrl,
          delete_pin: deletePin,
        }).eq('id', workspaces[0].id);
      }

      alert('✓ Google Meet URL and 4-Digit Security PIN saved successfully!');
      setIsMeetModalOpen(false);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // August 2026 Calendar Grid Data matching the reference screenshot exactly
  const calendarDays: CalendarDay[] = [
    // Previous Month Overflow (July 26 - 31)
    { dayNumber: 26, isCurrentMonth: false, events: [] },
    { dayNumber: 27, isCurrentMonth: false, events: [] },
    { dayNumber: 28, isCurrentMonth: false, events: [] },
    {
      dayNumber: 29,
      isCurrentMonth: false,
      events: [
        { id: 'e1', name: 'Chetan', time: '2p', type: 'red' },
        { id: 'e2', name: 'Mohsin Shaikh', time: '3p', type: 'red' },
      ],
      overflowCount: 2,
    },
    {
      dayNumber: 30,
      isCurrentMonth: false,
      events: [
        { id: 'e3', name: 'Mantasha Ansari', time: '12p', type: 'red' },
        { id: 'e4', name: 'Mustakim Khan', time: '11a', type: 'red' },
      ],
      overflowCount: 2,
    },
    {
      dayNumber: 31,
      isCurrentMonth: false,
      events: [
        { id: 'e5', name: 'Arshad Shaikh', time: '4p', type: 'red' },
        { id: 'e6', name: 'Imtiyaz Imtiyaz', time: '3p', type: 'red' },
      ],
      overflowCount: 5,
    },
    // August Day 1
    {
      dayNumber: 1,
      isCurrentMonth: true,
      events: [
        { id: 'e7', name: 'Burchatta', time: '9p', type: 'red' },
        { id: 'e8', name: 'MohammedAkil C...', time: '2p', type: 'red' },
      ],
      overflowCount: 3,
    },
    // Week 2: Aug 2 - Aug 8
    {
      dayNumber: 2,
      isCurrentMonth: true,
      events: [
        { id: 'e9', name: 'Girish Bahl', time: '2p', type: 'red' },
        { id: 'e10', name: 'Farooq Hussain', time: '7p', type: 'red' },
      ],
      overflowCount: 1,
    },
    {
      dayNumber: 3,
      isCurrentMonth: true,
      events: [{ id: 'e11', name: 'Afak Khokar', time: '3p', type: 'red' }],
    },
    { dayNumber: 4, isCurrentMonth: true, events: [{ id: 'e12', name: 'Liyaqat Khan', time: '3p', type: 'red' }] },
    {
      dayNumber: 5,
      isCurrentMonth: true,
      events: [{ id: 'e13', name: '⚠️ Blocked', time: '', type: 'amber' }],
    },
    { dayNumber: 6, isCurrentMonth: true, events: [] },
    { dayNumber: 7, isCurrentMonth: true, events: [] },
    { dayNumber: 8, isCurrentMonth: true, events: [] },
    // Week 3: Aug 9 (Today) - Aug 15
    {
      dayNumber: 9,
      isCurrentMonth: true,
      isToday: true,
      events: [
        { id: 'e14', name: 'Ashok WhatsApp...', time: '10a', type: 'red' },
        { id: 'e15', name: 'Asif Khan', time: '3p', type: 'red' },
      ],
    },
    {
      dayNumber: 10,
      isCurrentMonth: true,
      events: [
        { id: 'e16', name: 'Naiyar Mankad', time: '3p', type: 'green' },
        { id: 'e17', name: 'Sadaf Shaikh', time: '2p', type: 'green' },
      ],
    },
    {
      dayNumber: 11,
      isCurrentMonth: true,
      events: [{ id: 'e18', name: 'Javed Ali', time: '3p', type: 'green' }],
    },
    { dayNumber: 12, isCurrentMonth: true, events: [] },
    { dayNumber: 13, isCurrentMonth: true, events: [] },
    { dayNumber: 14, isCurrentMonth: true, events: [] },
    { dayNumber: 15, isCurrentMonth: true, events: [] },
    // Week 4: Aug 16 - Aug 22
    { dayNumber: 16, isCurrentMonth: true, events: [] },
    { dayNumber: 17, isCurrentMonth: true, events: [] },
    { dayNumber: 18, isCurrentMonth: true, events: [] },
    { dayNumber: 19, isCurrentMonth: true, events: [] },
    { dayNumber: 20, isCurrentMonth: true, events: [] },
    { dayNumber: 21, isCurrentMonth: true, events: [] },
    { dayNumber: 22, isCurrentMonth: true, events: [] },
    // Week 5: Aug 23 - Aug 29
    { dayNumber: 23, isCurrentMonth: true, events: [] },
    { dayNumber: 24, isCurrentMonth: true, events: [] },
    { dayNumber: 25, isCurrentMonth: true, events: [] },
    { dayNumber: 26, isCurrentMonth: true, events: [] },
    { dayNumber: 27, isCurrentMonth: true, events: [] },
    { dayNumber: 28, isCurrentMonth: true, events: [] },
    {
      dayNumber: 29,
      isCurrentMonth: true,
      events: [{ id: 'e19', name: 'Asjad Khan', time: '2p', type: 'green' }],
    },
    // Week 6: Aug 30 - Sep 5
    { dayNumber: 30, isCurrentMonth: true, events: [] },
    {
      dayNumber: 31,
      isCurrentMonth: true,
      events: [{ id: 'e20', name: 'Shanewadar Khan', time: '9a', type: 'green' }],
    },
    { dayNumber: 1, isCurrentMonth: false, events: [] },
    { dayNumber: 2, isCurrentMonth: false, events: [] },
    { dayNumber: 3, isCurrentMonth: false, events: [] },
    { dayNumber: 4, isCurrentMonth: false, events: [] },
    { dayNumber: 5, isCurrentMonth: false, events: [] },
  ];

  return (
    <MainLayout>
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
            Meetings Calendar
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Interactive visual calendar dashboard for managing all client appointments
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

      {/* Main Full-Width Calendar Card Container */}
      <Card className="p-4 sm:p-6 bg-white border border-[#E5E7EB] space-y-6">
        {/* Calendar Control Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#E5E7EB]">
          {/* Left: Title + Event Badge */}
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-[#111827]">Meetings Calendar</h2>
            <span className="text-xs font-bold text-gray-400">Calendar View</span>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#F4EEFF] text-[#8146F0] border border-[#DDD0FC]">
              33 EVENTS
            </span>
          </div>

          {/* Center: Controls & Month Header */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-50 text-gray-600 cursor-pointer shadow-2xs">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-50 text-gray-600 cursor-pointer shadow-2xs">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button className="px-4 py-2 rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-2xs cursor-pointer">
              Today
            </button>

            {/* Google Meet & Security Settings Modal Button */}
            <button
              onClick={() => setIsMeetModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 shadow-2xs transition-colors cursor-pointer"
            >
              <Video className="w-3.5 h-3.5 text-indigo-600" />
              <span>Google Meet & Security Settings</span>
            </button>

            {/* Mark as Booked Button */}
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs cursor-pointer">
              <CalendarIcon className="w-4 h-4" />
              <span>Mark as Booked</span>
            </button>

            {/* Month Name */}
            <h3 className="text-lg font-bold text-[#111827] px-2">
              August 2026
            </h3>
          </div>

          {/* Right: View Mode Toggle Switcher */}
          <div className="flex items-center p-1 bg-gray-100/80 rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white text-[#8146F0] shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-white text-[#8146F0] shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
          </div>
        </div>

        {/* Calendar Month Grid */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Day Headers (SUN - SAT) */}
            <div className="grid grid-cols-7 border-b border-[#E5E7EB] bg-[#F8FAFC]">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-xs font-bold tracking-wider text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 6-Week Calendar Days Grid */}
            <div className="grid grid-cols-7 border-l border-t border-[#E5E7EB]">
              {calendarDays.map((cell, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedDayEvents(cell)}
                  className={`min-h-[120px] p-2 border-r border-b border-[#E5E7EB] flex flex-col justify-between transition-colors relative ${
                    cell.isCurrentMonth ? 'bg-white' : 'bg-gray-50/40 text-gray-300'
                  } hover:bg-[#F9FAFB] cursor-pointer`}
                >
                  {/* Top Day Number Row */}
                  <div className="flex items-center justify-end">
                    {cell.isToday ? (
                      <span className="w-6 h-6 rounded-full bg-[#8146F0] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                        {cell.dayNumber}
                      </span>
                    ) : (
                      <span
                        className={`text-xs font-bold ${
                          cell.isCurrentMonth ? 'text-gray-700' : 'text-gray-300'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>
                    )}
                  </div>

                  {/* Events Container */}
                  <div className="space-y-1 my-1 flex-1 overflow-hidden">
                    {cell.events.map((event) => {
                      if (event.type === 'amber') {
                        return (
                          <div
                            key={event.id}
                            className="px-2 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1"
                          >
                            <span>{event.name}</span>
                          </div>
                        );
                      }

                      const isGreen = event.type === 'green';
                      return (
                        <div
                          key={event.id}
                          className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center justify-between border transition-all ${
                            isGreen
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span className="truncate pr-1">{event.name}</span>
                          {event.time && (
                            <span className="text-[10px] opacity-80 shrink-0">
                              {event.time}
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {cell.overflowCount && cell.overflowCount > 0 && (
                      <button className="text-[11px] font-extrabold text-blue-600 hover:underline px-1">
                        +{cell.overflowCount} more
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Google Meet & Security Settings Modal */}
      {isMeetModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-[#111827]">
                  Google Meet & Security Settings
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMeetModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeetSettings} className="space-y-4">
              {/* Google Meet URL */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Workspace Google Meet Video Call URL *
                </label>
                <div className="relative">
                  <Video className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    required
                    value={googleMeetUrl}
                    onChange={(e) => setGoogleMeetUrl(e.target.value)}
                    placeholder="https://meet.google.com/qbi-erbq-moy"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs font-mono text-gray-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  This URL is automatically displayed to leads upon booking strategy calls.
                </p>
              </div>

              {/* 4-Digit Security Delete PIN */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>4-Digit Security Delete PIN *</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  pattern="[0-9]{4}"
                  value={deletePin}
                  onChange={(e) => setDeletePin(e.target.value)}
                  placeholder="1234"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-mono font-extrabold text-indigo-700 bg-indigo-50/50 focus:outline-none focus:border-indigo-500 tracking-widest text-center"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  This 4-digit PIN is required whenever staff deletes any lead.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsMeetModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-5 py-2 rounded-xl bg-[#8146F0] hover:bg-[#6D34DB] text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingSettings ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
