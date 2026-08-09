'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, Badge, Button } from '@/components/ui';
import { useTheme } from '@/components/theme/ThemeProvider';
import {
  CalendarCheck,
  Clock,
  Video,
  MoreHorizontal,
  Plus,
  Calendar,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

export default function ScheduledMeetingsPage() {
  const { accentColor } = useTheme();

  const meetings = [
    {
      id: 1,
      title: 'Naiyar Mankad - Strategy Call',
      date: 'Aug 10, 2026',
      time: '03:00 PM',
      attendee: 'Naiyar Mankad',
      platform: 'Zoom Video Conference',
      status: 'Confirmed',
      type: 'green',
    },
    {
      id: 2,
      title: 'Sadaf Shaikh - Executive Demo',
      date: 'Aug 10, 2026',
      time: '02:00 PM',
      attendee: 'Sadaf Shaikh',
      platform: 'Google Meet',
      status: 'Confirmed',
      type: 'green',
    },
    {
      id: 3,
      title: 'Asif Khan - Qualification Discussion',
      date: 'Aug 09, 2026',
      time: '03:00 PM',
      attendee: 'Asif Khan',
      platform: 'Zoom Video Conference',
      status: 'Completed',
      type: 'red',
    },
    {
      id: 4,
      title: 'Javed Ali - Discovery Session',
      date: 'Aug 11, 2026',
      time: '03:00 PM',
      attendee: 'Javed Ali',
      platform: 'Microsoft Teams',
      status: 'Confirmed',
      type: 'green',
    },
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
            Scheduled Meetings
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Complete list of confirmed and pending client appointments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/calendar">
            <Button variant="outline" leftIcon={<Calendar className="w-4 h-4" />}>
              View Calendar
            </Button>
          </Link>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Book New Meeting
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {meetings.map((meeting) => (
          <Card
            key={meeting.id}
            interactive
            padding="md"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E7EB]"
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 shadow-2xs ${
                  meeting.type === 'green' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                <CalendarCheck className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-[#111827]">
                    {meeting.title}
                  </h3>
                  <Badge variant={meeting.status === 'Confirmed' ? 'success' : 'warning'}>
                    {meeting.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {meeting.date} ({meeting.time})
                  </span>
                  <span>•</span>
                  <span>{meeting.platform}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:self-center">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Video className="w-3.5 h-3.5" />}
              >
                Join Call
              </Button>
              <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
}
