'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, Badge, Button } from '@/components/ui';
import { useAuth } from '@/components/auth/AuthContext';
import { useClientDrawer } from '@/components/client/ClientDrawerContext';
import { supabase } from '@/lib/supabaseClient';
import {
  CalendarCheck,
  Clock,
  Video,
  Plus,
  Calendar,
  RefreshCw,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { isMeetingPassed } from '../calendar/page';

export default function ScheduledMeetingsPage() {
  const { user, workspace } = useAuth();
  const { openClientDrawer } = useClientDrawer();

  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [googleMeetUrl, setGoogleMeetUrl] = useState('https://meet.google.com/qbi-erbq-moy');

  const fetchMeetings = async () => {
    if (!user) {
      setLeads([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (workspace?.id) {
        query = query.or(`user_id.eq.${user.id},funnel_id.eq.${workspace.id}`);
      } else {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (!error && data) {
        // Filter leads with meeting_date or meeting_booked
        const bookedOnly = data.filter((l) => l.meeting_date || l.step_progress === 'meeting_booked');
        setLeads(bookedOnly.length > 0 ? bookedOnly : data);
      } else {
        setLeads([]);
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMeetings();
    }

    (async () => {
      try {
        const { data } = await supabase
          .from('funnel_workspaces')
          .select('google_meet_url')
          .limit(1)
          .maybeSingle();

        if (data?.google_meet_url) {
          setGoogleMeetUrl(data.google_meet_url);
        }
      } catch (err) {
        console.error('Error loading workspace google meet:', err);
      }
    })();
  }, [user, workspace]);

  return (
    <MainLayout>
      <div className="space-y-5 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
                Scheduled Meetings
              </h1>
              <Badge variant="info">Live Landing Page Bookings</Badge>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Complete real-time list of confirmed strategy call appointments captured from your domain.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/calendar">
              <Button variant="outline" size="sm" leftIcon={<Calendar className="w-3.5 h-3.5 text-indigo-600" />}>
                View Visual Calendar
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMeetings}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-indigo-600" />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Meetings List Container */}
        <div className="space-y-3">
          {isLoading ? (
            <Card className="p-8 text-center bg-white border border-[#E5E7EB]">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-600 mb-2" />
              <p className="text-xs font-semibold text-gray-500">Loading your landing page scheduled meetings...</p>
            </Card>
          ) : leads.length === 0 ? (
            <Card className="p-10 text-center bg-white border border-[#E5E7EB] space-y-2">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">No Meetings Booked Yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                When visitors book strategy call time slots in your 3-popup funnel, their confirmed meetings will appear here automatically.
              </p>
            </Card>
          ) : (
            leads.map((meeting) => {
              const notesCount = Array.isArray(meeting.staff_notes)
                ? meeting.staff_notes.length
                : (meeting.notes && typeof meeting.notes === 'string' && meeting.notes.trim() ? 1 : 0);

              const isPassed = isMeetingPassed(meeting.meeting_date, meeting.meeting_time);
              const meetingLink = meeting.google_meet_url || googleMeetUrl;

              return (
                <Card
                  key={meeting.id}
                  interactive
                  onClick={() => openClientDrawer(meeting)}
                  padding="md"
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E7EB] hover:border-indigo-300 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 shadow-2xs border ${
                        isPassed
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      <CalendarCheck className="w-5 h-5" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[#111827] group-hover:text-indigo-600 transition-colors truncate">
                          {meeting.name || 'Anonymous Visitor'} — Strategy Call
                        </h3>
                        <Badge variant={isPassed ? 'error' : 'success'}>
                          {isPassed ? 'Passed' : 'Confirmed'}
                        </Badge>
                        {notesCount > 0 && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                            title={`${notesCount} Staff Notes`}
                          >
                            <FileText className="w-2.5 h-2.5 text-amber-600" />
                            <span>{notesCount}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500">
                        <span className="flex items-center gap-1 text-gray-700 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{meeting.meeting_date || 'Date Pending'}</span>
                          {meeting.meeting_time && <span>({meeting.meeting_time})</span>}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span>{meeting.email || 'No email'}</span>
                        </span>
                        {meeting.phone && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-gray-700 font-semibold">{meeting.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center shrink-0">
                    {meeting.phone && (
                      <a
                        href={`https://wa.me/${meeting.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    <a
                      href={meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Meet Call 🎥</span>
                    </a>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
}

