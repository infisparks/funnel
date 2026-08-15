'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, Badge, Button } from '@/components/ui';
import { useAuth } from '@/components/auth/AuthContext';
import { useClientDrawer } from '@/components/client/ClientDrawerContext';
import { supabase } from '@/lib/supabaseClient';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Calendar as CalendarIcon,
  Video,
  Save,
  X,
  MessageCircle,
  Phone,
  Mail,
  User,
  Clock,
  FileText,
  Lock,
  Sparkles,
  ExternalLink,
  ChevronDown,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';

interface CalendarCell {
  dayNumber: number;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  leads: any[];
}

export function isMeetingPassed(meetingDate?: string, meetingTime?: string): boolean {
  if (!meetingDate) return false;
  try {
    const cleanDate = meetingDate.includes('T') ? meetingDate.split('T')[0] : meetingDate.trim();
    if (!meetingTime) {
      const endOfDay = new Date(`${cleanDate}T23:59:59`);
      return !isNaN(endOfDay.getTime()) && endOfDay.getTime() < Date.now();
    }

    const timeMatch = meetingTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!timeMatch) {
      const parsedDate = new Date(`${cleanDate}T23:59:59`);
      return !isNaN(parsedDate.getTime()) && parsedDate.getTime() < Date.now();
    }

    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const meridian = timeMatch[3] ? timeMatch[3].toUpperCase() : null;

    if (meridian === 'PM' && hours < 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;

    const hourStr = String(hours).padStart(2, '0');
    const minStr = String(minutes).padStart(2, '0');
    const meetingDateTime = new Date(`${cleanDate}T${hourStr}:${minStr}:00`);

    if (isNaN(meetingDateTime.getTime())) {
      const fallbackDate = new Date(cleanDate);
      return !isNaN(fallbackDate.getTime()) && fallbackDate.getTime() < Date.now();
    }

    return meetingDateTime.getTime() < Date.now();
  } catch (err) {
    return false;
  }
}

export default function MeetingsCalendarPage() {
  const { user } = useAuth();
  const { openClientDrawer } = useClientDrawer();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [campaign, setCampaign] = useState('All Campaigns');
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedDayCell, setSelectedDayCell] = useState<CalendarCell | null>(null);
  const [isMeetModalOpen, setIsMeetModalOpen] = useState(false);
  const [googleMeetUrl, setGoogleMeetUrl] = useState('https://meet.google.com/qbi-erbq-moy');
  const [deletePin, setDeletePin] = useState('1234');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLeads(data);
      } else {
        console.error('Error loading calendar leads:', error);
        setLeads([]);
      }
    } catch (err) {
      console.error('Error in fetchLeads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();

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

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const leadsByDate: Record<string, any[]> = {};
  let totalBookedMeetings = 0;
  let todayMeetingsCount = 0;
  let currentMonthMeetingsCount = 0;

  leads.forEach((lead) => {
    const rawDate = lead.meeting_date || lead.created_at;
    if (rawDate) {
      const dateKey = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate.trim();
      if (!leadsByDate[dateKey]) {
        leadsByDate[dateKey] = [];
      }
      leadsByDate[dateKey].push(lead);

      if (lead.meeting_date) {
        totalBookedMeetings += 1;
        if (dateKey === todayStr) {
          todayMeetingsCount += 1;
        }
        if (dateKey.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)) {
          currentMonthMeetingsCount += 1;
        }
      }
    }
  });

  const calendarCells: CalendarCell[] = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 12 : month;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: dayNum,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      leads: leadsByDate[dateStr] || [],
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: d,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      leads: leadsByDate[dateStr] || [],
    });
  }

  const remainingCells = 42 - calendarCells.length;
  for (let n = 1; n <= remainingCells; n++) {
    const nextMonth = month === 11 ? 1 : month + 2;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: n,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      leads: leadsByDate[dateStr] || [],
    });
  }

  return (
    <MainLayout>
      <div className="space-y-5 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
                Meetings Calendar
              </h1>
              <Badge variant="info">Live Landing Page Data</Badge>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Interactive visual schedule synced with leads and strategy call bookings from your domain.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMeetModalOpen(true)}
              leftIcon={<Video className="w-3.5 h-3.5 text-indigo-600" />}
              className="text-xs font-semibold"
            >
              Google Meet URL & PIN
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchLeads}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-indigo-600" />}
              className="text-xs font-semibold"
            >
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#6B7280]">Total Booked</span>
              <CalendarCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-xl font-bold text-[#111827] mt-1">{totalBookedMeetings}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Strategy appointments</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#6B7280]">This Month</span>
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-[#111827] mt-1">{currentMonthMeetingsCount}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{monthName}</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#6B7280]">Today's Meetings</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl font-bold text-[#111827] mt-1">{todayMeetingsCount}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{todayStr}</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#6B7280]">Total Leads</span>
              <User className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xl font-bold text-[#111827] mt-1">{leads.length}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Captured from funnel</p>
          </div>
        </div>

        <Card className="p-4 sm:p-5 bg-white border border-[#E5E7EB] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-[#F5F6F8] p-1 rounded-xl border border-[#E5E7EB]">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-white hover:shadow-2xs text-gray-700 transition-all cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg hover:bg-white hover:shadow-2xs text-gray-700 transition-all cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleToday}
                className="px-3 py-1.5 rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-50 text-xs font-semibold text-[#111827] shadow-2xs cursor-pointer"
              >
                Today
              </button>

              <h2 className="text-base sm:text-lg font-bold text-[#111827]">
                {monthName}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {leads.length} Total Leads
              </span>

              <div className="flex items-center p-1 bg-[#F5F6F8] rounded-xl border border-[#E5E7EB]">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'month'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'week'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Week
                </button>
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <div className="min-w-[780px]">
              <div className="grid grid-cols-7 border-b border-[#E5E7EB] bg-[#F8FAFC] rounded-t-xl overflow-hidden">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                  <div
                    key={day}
                    className="py-2.5 text-center text-xs font-bold tracking-wider text-gray-500"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 border-l border-t border-[#E5E7EB] rounded-b-xl overflow-hidden">
                {calendarCells.map((cell, idx) => {
                  const dayLeads = cell.leads;
                  const visibleLeads = dayLeads.slice(0, 2);
                  const overflowCount = dayLeads.length - visibleLeads.length;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (dayLeads.length > 0) {
                          setSelectedDayCell(cell);
                        }
                      }}
                      className={`min-h-[110px] p-2 border-r border-b border-[#E5E7EB] flex flex-col justify-between transition-colors relative ${
                        cell.isCurrentMonth ? 'bg-white' : 'bg-[#FAFAFA] text-gray-400'
                      } ${dayLeads.length > 0 ? 'hover:bg-indigo-50/30 cursor-pointer' : 'hover:bg-[#F9FAFB]'}`}
                    >
                      <div className="flex items-center justify-between">
                        {dayLeads.length > 0 ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        ) : <span />}

                        {cell.isToday ? (
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
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

                      <div className="space-y-1 my-1 flex-1 overflow-hidden">
                        {visibleLeads.map((lead: any) => {
                          const hasNotes = Array.isArray(lead.staff_notes) && lead.staff_notes.length > 0;
                          const isMeeting = Boolean(lead.meeting_date || lead.meeting_time);
                          const isPassed = isMeeting && isMeetingPassed(lead.meeting_date, lead.meeting_time);

                          return (
                            <div
                              key={lead.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                openClientDrawer(lead);
                              }}
                              className={`px-1.5 py-1 rounded-md text-[11px] font-semibold flex items-center justify-between border shadow-2xs transition-all hover:scale-[1.02] cursor-pointer ${
                                isPassed
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : isMeeting
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              }`}
                              title={`${lead.name || 'Visitor'} • ${lead.meeting_time || 'Lead'}${isPassed ? ' (Passed)' : ''}`}
                            >
                              <div className="flex items-center gap-1 min-w-0 truncate">
                                {hasNotes && (
                                  <span className="text-[9px] text-amber-600 shrink-0">📝</span>
                                )}
                                <span className="truncate">{lead.name || 'Anonymous'}</span>
                              </div>
                              {lead.meeting_time && (
                                <span className="text-[9px] opacity-75 font-mono shrink-0 pl-1">
                                  {lead.meeting_time.split(' ')[0]}
                                </span>
                              )}
                            </div>
                          );
                        })}

                        {overflowCount > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDayCell(cell);
                            }}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline px-1 block"
                          >
                            +{overflowCount} more...
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {selectedDayCell && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 w-full max-w-lg shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="text-base font-bold text-[#111827]">
                      Appointments for {selectedDayCell.dateStr}
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                      {selectedDayCell.leads.length} Booked Lead{selectedDayCell.leads.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDayCell(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                {selectedDayCell.leads.map((lead: any) => {
                  const notesCount = Array.isArray(lead.staff_notes)
                    ? lead.staff_notes.length
                    : (lead.notes && typeof lead.notes === 'string' && lead.notes.trim() ? 1 : 0);

                  return (
                    <div
                      key={lead.id}
                      className="p-3.5 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] hover:bg-white hover:shadow-sm transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {(lead.name || 'U').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-[#111827] truncate">
                                {lead.name || 'Anonymous Visitor'}
                              </h4>
                              {notesCount > 0 && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  <FileText className="w-2.5 h-2.5 text-amber-600" />
                                  <span>{notesCount}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#6B7280] truncate">{lead.email || 'No email'}</p>
                          </div>
                        </div>

                        {lead.meeting_time && (
                          <span
                            className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold font-mono shrink-0 ${
                              isMeetingPassed(lead.meeting_date, lead.meeting_time)
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {lead.meeting_time} {isMeetingPassed(lead.meeting_date, lead.meeting_time) ? '(Passed)' : ''}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#6B7280] pt-1 border-t border-gray-200/60">
                        <span className="font-mono text-[11px]">{lead.phone || 'No phone'}</span>
                        <div className="flex items-center gap-2">
                          {lead.phone && (
                            <a
                              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1 transition-colors"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDayCell(null);
                              openClientDrawer(lead);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>Open Details</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

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
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingSettings ? 'Saving...' : 'Save Settings'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
