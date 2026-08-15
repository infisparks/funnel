import React, { useState, useEffect } from 'react';
import { useClientDrawer } from './ClientDrawerContext';
import { useTheme } from '../theme/ThemeProvider';
import { supabase } from '@/lib/supabaseClient';
import {
  X,
  Trash2,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  Send,
  Plus,
  CheckCircle2,
  Video,
  Copy,
  Check,
  Globe,
  Sparkles,
  FileText,
  AlertCircle,
  ExternalLink,
  Save,
} from 'lucide-react';
import { Button, Badge, Card } from '../ui';

const SERVER_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'https://funnel.infiplus.in').replace(/\/$/, '');

export function ClientDrawer() {
  const { isOpen, selectedClient, closeClientDrawer } = useClientDrawer();
  const { accentColor } = useTheme();

  // Selected lead states
  const [pipelineStage, setPipelineStage] = useState(selectedClient?.step_progress || 'step1_contact');
  const [dealValue, setDealValue] = useState(selectedClient?.deal_value || '');
  const [staffNotes, setStaffNotes] = useState<any[]>(
    Array.isArray(selectedClient?.staff_notes) ? selectedClient.staff_notes : []
  );
  const [googleMeetUrl, setGoogleMeetUrl] = useState(
    selectedClient?.google_meet_url || selectedClient?.googleMeetUrl || 'https://meet.google.com/qbi-erbq-moy'
  );
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isSavingMeet, setIsSavingMeet] = useState(false);

  const [followupDate, setFollowupDate] = useState(selectedClient?.followup_date || selectedClient?.followupDate || '');
  const [staffNotesHistory, setStaffNotesHistory] = useState<any[]>(
    Array.isArray(selectedClient?.staff_notes) ? selectedClient.staff_notes : []
  );

  // WhatsApp Logs & Messenger state
  const [whatsappLogs, setWhatsappLogs] = useState<any[]>(
    Array.isArray(selectedClient?.whatsapp_logs) ? selectedClient.whatsapp_logs : []
  );
  const [directWaMessage, setDirectWaMessage] = useState('');
  const [isSendingWa, setIsSendingWa] = useState(false);
  const [waSendStatus, setWaSendStatus] = useState<string | null>(null);

  // GCP Scheduling states in Drawer
  const [waDispatchMode, setWaDispatchMode] = useState<'instant' | 'scheduled'>('instant');
  const [waScheduleDateTime, setWaScheduleDateTime] = useState('');
  const [isSchedulingGcp, setIsSchedulingGcp] = useState(false);

  const [rescheduleDate, setRescheduleDate] = useState('2026-08-16');
  const [rescheduleTime, setRescheduleTime] = useState('11:00 AM');
  const [sendRescheduleWa, setSendRescheduleWa] = useState(true);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleStatus, setRescheduleStatus] = useState<string | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMeet, setCopiedMeet] = useState(false);
  const [workspaceStages, setWorkspaceStages] = useState<any[]>([
    { id: 'step1_contact', name: '1. Contact Form Captured' },
    { id: 'survey_completed', name: '2. Survey Qualified' },
    { id: 'meeting_booked', name: '3. Meeting Booked' },
    { id: 'meeting_missed', name: '4. Meeting Missed' },
    { id: 'closed_won', name: '5. Closed Won' },
  ]);

  // Fetch live WhatsApp logs from Supabase
  const fetchLeadWhatsappLogs = async () => {
    if (!selectedClient) return;
    try {
      if (selectedClient.id) {
        const { data: leadRow } = await supabase
          .from('leads')
          .select('whatsapp_logs, meeting_date, meeting_time')
          .eq('id', selectedClient.id)
          .single();

        if (leadRow && Array.isArray(leadRow.whatsapp_logs)) {
          setWhatsappLogs(leadRow.whatsapp_logs);
        }
      }
    } catch (err) {
      console.error('Error fetching lead WhatsApp logs:', err);
    }
  };

  useEffect(() => {
    if (selectedClient) {
      setPipelineStage(selectedClient.step_progress || 'step1_contact');
      setDealValue(selectedClient.deal_value || '');
      setStaffNotes(Array.isArray(selectedClient.staff_notes) ? selectedClient.staff_notes : []);
      setStaffNotesHistory(Array.isArray(selectedClient.staff_notes) ? selectedClient.staff_notes : []);
      setFollowupDate(selectedClient.followup_date || selectedClient.followupDate || '');
      setGoogleMeetUrl(
        selectedClient.google_meet_url || selectedClient.googleMeetUrl || 'https://meet.google.com/qbi-erbq-moy'
      );
      setWhatsappLogs(Array.isArray(selectedClient.whatsapp_logs) ? selectedClient.whatsapp_logs : []);
      if (selectedClient.meeting_date) setRescheduleDate(selectedClient.meeting_date);
      if (selectedClient.meeting_time) setRescheduleTime(selectedClient.meeting_time);
      fetchLeadWhatsappLogs();
    }
  }, [selectedClient]);

  const initials = (selectedClient?.name || 'Lead')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Send Direct Immediate WhatsApp Message
  const handleSendDirectWhatsapp = async () => {
    if (!selectedClient || !selectedClient.phone || !directWaMessage.trim()) return;
    setIsSendingWa(true);
    setWaSendStatus(null);
    try {
      const parsed = directWaMessage
        .replace(/\{\{\s*name\s*\}\}/gi, selectedClient.name || 'Client')
        .replace(
          /\{\{\s*meeting_url\s*\}\}/gi,
          googleMeetUrl || 'https://meet.google.com/qbi-erbq-moy'
        )
        .replace(/\{\{\s*meeting_date\s*\}\}/gi, selectedClient.meeting_date || rescheduleDate)
        .replace(/\{\{\s*meeting_time\s*\}\}/gi, selectedClient.meeting_time || rescheduleTime);

      // Call backend server
      const res = await fetch(`${SERVER_URL}/api/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: selectedClient.phone,
          name: selectedClient.name,
          email: selectedClient.email,
          message: parsed,
          leadData: {
            id: selectedClient.id,
            name: selectedClient.name,
            phone: selectedClient.phone,
            email: selectedClient.email,
            google_meet_url: googleMeetUrl,
          },
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to dispatch message via backend.');
      }

      setDirectWaMessage('');
      setWaSendStatus('Message dispatched successfully! 🚀');
      setTimeout(() => setWaSendStatus(null), 3500);
      fetchLeadWhatsappLogs();
    } catch (err: any) {
      console.error('Error sending direct WhatsApp:', err);
      setWaSendStatus(`Error sending message: ${err.message || 'Failed'}`);
    } finally {
      setIsSendingWa(false);
    }
  };

  // Schedule Message in Google Cloud Tasks Queue
  const handleScheduleGcpWhatsapp = async () => {
    if (!selectedClient || !selectedClient.phone || !directWaMessage.trim() || !waScheduleDateTime) {
      alert('Please fill in message text and select a valid future date & time.');
      return;
    }
    setIsSchedulingGcp(true);
    setWaSendStatus(null);
    try {
      const parsed = directWaMessage
        .replace(/\{\{\s*name\s*\}\}/gi, selectedClient.name || 'Client')
        .replace(
          /\{\{\s*meeting_url\s*\}\}/gi,
          googleMeetUrl || 'https://meet.google.com/qbi-erbq-moy'
        )
        .replace(/\{\{\s*meeting_date\s*\}\}/gi, selectedClient.meeting_date || rescheduleDate)
        .replace(/\{\{\s*meeting_time\s*\}\}/gi, selectedClient.meeting_time || rescheduleTime);

      const res = await fetch(`${SERVER_URL}/api/tasks/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientPhone: selectedClient.phone,
          recipientName: selectedClient.name,
          messageText: parsed,
          scheduleTime: waScheduleDateTime,
          userId: selectedClient.id || 'lead_drawer',
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to schedule task in Google Cloud Tasks.');
      }

      setDirectWaMessage('');
      setWaScheduleDateTime('');
      setWaSendStatus(`🕒 Message scheduled in Google Cloud Tasks Queue for ${new Date(waScheduleDateTime).toLocaleString()}!`);
      setTimeout(() => setWaSendStatus(null), 4000);
      fetchLeadWhatsappLogs();
    } catch (err: any) {
      console.error('Error scheduling GCP broadcast:', err);
      setWaSendStatus(`Error: ${err.message}`);
    } finally {
      setIsSchedulingGcp(false);
    }
  };

  // Confirm and Reschedule Meeting with Instant Notification
  const handleRescheduleMeeting = async () => {
    if (!selectedClient || !selectedClient.id) return;
    setIsRescheduling(true);
    setRescheduleStatus(null);
    try {
      // 1. Update Supabase leads record
      const { error } = await supabase
        .from('leads')
        .update({
          meeting_date: rescheduleDate,
          meeting_time: rescheduleTime,
          step_progress: 'meeting_booked',
        })
        .eq('id', selectedClient.id);

      if (error) throw error;

      selectedClient.meeting_date = rescheduleDate;
      selectedClient.meeting_time = rescheduleTime;

      // 2. Dispatch WhatsApp Notification to user/lead
      if (sendRescheduleWa && selectedClient.phone) {
        const meetUrl = googleMeetUrl || 'https://meet.google.com/qbi-erbq-moy';
        const notifMsg = `Hello ${selectedClient.name || 'Friend'}, your strategy meeting has been successfully rescheduled to *${rescheduleDate}* at *${rescheduleTime}*.\n\nJoin Google Meet link: ${meetUrl}\n\nLooking forward to meeting with you!`;

        await fetch(`${SERVER_URL}/api/whatsapp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: selectedClient.phone,
            name: selectedClient.name,
            email: selectedClient.email,
            message: notifMsg,
          }),
        });

        fetchLeadWhatsappLogs();
      }

      setRescheduleStatus(`Meeting rescheduled to ${rescheduleDate} @ ${rescheduleTime} and notification sent! 🗓️`);
      setTimeout(() => setRescheduleStatus(null), 4000);
    } catch (err: any) {
      console.error('Error rescheduling meeting:', err);
      setRescheduleStatus(`Error: ${err.message || 'Failed to reschedule'}`);
    } finally {
      setIsRescheduling(false);
    }
  };

  // Update pipeline stage
  const handleUpdateStage = async (val: string) => {
    setPipelineStage(val);
    if (selectedClient?.id) {
      await supabase.from('leads').update({ step_progress: val }).eq('id', selectedClient.id);
    }
  };

  // Save deal value
  const handleSaveDealValue = async (val?: string | number) => {
    const valueToSave = val !== undefined ? String(val) : String(dealValue || '');
    const finalVal = valueToSave.trim() === '' ? null : valueToSave.trim();
    if (selectedClient?.id) {
      await supabase.from('leads').update({ deal_value: finalVal }).eq('id', selectedClient.id);
    }
  };

  // Save followup date
  const handleSaveFollowupDate = async (val: string) => {
    setFollowupDate(val);
    if (selectedClient?.id) {
      await supabase.from('leads').update({ followup_date: val }).eq('id', selectedClient.id);
    }
  };

  // Add a new staff note
  const handleAddStaffNote = async () => {
    if (!noteText.trim() || !selectedClient?.id) return;
    setIsSavingNote(true);
    try {
      const newNote = {
        id: Date.now(),
        note: noteText.trim(),
        created_at: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
        author: 'Staff Admin',
      };
      const updated = [newNote, ...(staffNotesHistory || [])];
      setStaffNotesHistory(updated);
      setNoteText('');
      await supabase.from('leads').update({ staff_notes: updated }).eq('id', selectedClient.id);
    } catch (err) {
      console.error('Error saving staff note:', err);
    } finally {
      setIsSavingNote(false);
    }
  };

  // Save customized Google Meet link
  const handleSaveGoogleMeetUrl = async () => {
    if (!selectedClient?.id) return;
    setIsSavingMeet(true);
    try {
      await supabase.from('leads').update({ google_meet_url: googleMeetUrl }).eq('id', selectedClient.id);
    } catch (err) {
      console.error('Error saving Google Meet URL:', err);
    } finally {
      setIsSavingMeet(false);
    }
  };

  // Delete lead
  const handleDeleteLead = async () => {
    if (!selectedClient?.id) return;
    if (!confirm(`Are you sure you want to permanently delete lead "${selectedClient.name}"?`)) return;
    try {
      await supabase.from('leads').delete().eq('id', selectedClient.id);
      closeClientDrawer();
      window.location.reload();
    } catch (err) {
      console.error('Error deleting lead:', err);
      alert('Error deleting lead from database.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://infisparkfunnel.com/survey/${selectedClient?.id || 1}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMeet = () => {
    navigator.clipboard.writeText(googleMeetUrl);
    setCopiedMeet(true);
    setTimeout(() => setCopiedMeet(false), 2000);
  };

  if (!isOpen || !selectedClient) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
        onClick={closeClientDrawer}
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed top-0 right-0 h-dvh w-full sm:w-[540px] md:w-[620px] lg:w-[680px] bg-[#FAFAFC] border-l border-[#E5E7EB] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className="w-11 h-11 rounded-full text-white font-extrabold text-base flex items-center justify-center shadow-2xs shrink-0"
              style={{ backgroundColor: accentColor.primary }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-[#111827] truncate">
                {selectedClient.name}
              </h2>
              <p className="text-xs text-gray-500 truncate">
                {selectedClient.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDeleteLead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 cursor-pointer min-h-[44px]"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete Lead</span>
            </button>

            <button
              onClick={closeClientDrawer}
              className="p-2.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
          {/* Card 1: Pipeline Stage & Call / WhatsApp Action Bar */}
          <Card className="p-5 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                PIPELINE STAGE
              </span>
              <select
                value={pipelineStage}
                onChange={(e) => handleUpdateStage(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-indigo-200 text-xs font-bold text-indigo-700 bg-indigo-50 focus:outline-none cursor-pointer"
              >
                {workspaceStages.map((stg) => (
                  <option key={stg.id} value={stg.id}>
                    {stg.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="text-xs font-bold text-gray-700">Deal Value (₹):</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                  onBlur={() => handleSaveDealValue()}
                  placeholder="Null"
                  className="w-32 px-3 py-1.5 rounded-xl border border-[#E5E7EB] text-right font-bold text-xs bg-[#F5F6F8] focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveDealValue()}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Quick Phone Call & WhatsApp Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={`tel:${selectedClient.phone || '+919876543210'}`}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-bold text-xs shadow-2xs hover:opacity-90 transition-opacity"
                style={{ backgroundColor: accentColor.primary }}
              >
                <Phone className="w-4 h-4" />
                <span>Call Client</span>
              </a>

              <a
                href={`https://wa.me/${(selectedClient.phone || '919876543210').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </Card>

          {/* Card 2: WhatsApp Messages & GCP Scheduling */}
          <Card className="p-5 bg-white space-y-4">
            <div className="flex items-start justify-between gap-3 pb-2 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#111827]">
                    WhatsApp Messenger & GCP Scheduler
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Send instant messages or schedule broadcasts via Google Cloud Tasks.
                  </p>
                </div>
              </div>
              <Badge variant={whatsappLogs.length > 0 ? 'success' : 'default'}>
                {whatsappLogs.length} {whatsappLogs.length === 1 ? 'Message' : 'Messages'}
              </Badge>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setWaDispatchMode('instant')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  waDispatchMode === 'instant'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Instant WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setWaDispatchMode('scheduled');
                  if (!waScheduleDateTime) {
                    const target = new Date(Date.now() + 1 * 60 * 1000);
                    const pad = (n: number) => String(n).padStart(2, '0');
                    setWaScheduleDateTime(`${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${pad(target.getHours())}:${pad(target.getMinutes())}`);
                  }
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  waDispatchMode === 'scheduled'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Schedule via Google Cloud Tasks 🕒</span>
              </button>
            </div>

            {/* Composer Box */}
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
              {/* Scheduled Date/Time Picker */}
              {waDispatchMode === 'scheduled' && (
                <div className="space-y-1.5 pb-1 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-gray-700">
                      GCP Execution Date & Time *
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const target = new Date(Date.now() + 1 * 60 * 1000);
                          const pad = (n: number) => String(n).padStart(2, '0');
                          setWaScheduleDateTime(`${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${pad(target.getHours())}:${pad(target.getMinutes())}`);
                        }}
                        className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] border border-indigo-200 cursor-pointer"
                      >
                        ⚡ +1 Min Test
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const target = new Date(Date.now() + 5 * 60 * 1000);
                          const pad = (n: number) => String(n).padStart(2, '0');
                          setWaScheduleDateTime(`${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${pad(target.getHours())}:${pad(target.getMinutes())}`);
                        }}
                        className="px-2 py-0.5 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-[10px] cursor-pointer"
                      >
                        +5 Min
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const target = new Date(Date.now() + 60 * 60 * 1000);
                          const pad = (n: number) => String(n).padStart(2, '0');
                          setWaScheduleDateTime(`${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${pad(target.getHours())}:${pad(target.getMinutes())}`);
                        }}
                        className="px-2 py-0.5 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-[10px] cursor-pointer"
                      >
                        +1 Hour
                      </button>
                    </div>
                  </div>
                  <input
                    type="datetime-local"
                    value={waScheduleDateTime}
                    onChange={(e) => setWaScheduleDateTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">
                  {waDispatchMode === 'scheduled' ? 'Scheduled WhatsApp Content:' : `Send Message to ${selectedClient.name}:`}
                </label>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setDirectWaMessage((prev) => prev + ' {{name}}')}
                    className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer"
                  >
                    + {'{{name}}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirectWaMessage((prev) => prev + ' {{meeting_url}}')}
                    className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer"
                  >
                    + {'{{meeting_url}}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirectWaMessage((prev) => prev + ' {{meeting_date}}')}
                    className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer"
                  >
                    + {'{{meeting_date}}'}
                  </button>
                </div>
              </div>

              <textarea
                value={directWaMessage}
                onChange={(e) => setDirectWaMessage(e.target.value)}
                placeholder="Type WhatsApp message..."
                rows={2}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs bg-white text-gray-900 focus:outline-none focus:border-indigo-500"
              />

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-mono">
                  {selectedClient.phone || 'No Phone Number'}
                </span>

                {waDispatchMode === 'instant' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isSendingWa || !directWaMessage.trim() || !selectedClient.phone}
                    onClick={handleSendDirectWhatsapp}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    {isSendingWa ? 'Sending...' : 'Send WhatsApp Now 🚀'}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isSchedulingGcp || !directWaMessage.trim() || !selectedClient.phone || !waScheduleDateTime}
                    onClick={handleScheduleGcpWhatsapp}
                    leftIcon={<Clock className="w-3.5 h-3.5" />}
                  >
                    {isSchedulingGcp ? 'Scheduling in GCP...' : 'Schedule in GCP Queue 🕒'}
                  </Button>
                )}
              </div>

              {waSendStatus && (
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-200 text-[11px] font-bold">
                  {waSendStatus}
                </div>
              )}
            </div>

            {/* Render Recorded WhatsApp Message History */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-gray-700 block">
                Recorded WhatsApp Messages ({whatsappLogs.length}):
              </span>

              {whatsappLogs && whatsappLogs.length > 0 ? (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {whatsappLogs.map((log: any, idx: number) => {
                    const isStep1 = log.trigger_step?.includes('step1') || log.trigger_step === 'welcome';
                    const isStep2 = log.trigger_step?.includes('step2') || log.trigger_step === 'survey';
                    const isStep3 = log.trigger_step?.includes('step3') || log.trigger_step === 'meeting';
                    const isGcp = log.trigger_step?.includes('gcp') || log.trigger_step === 'scheduled_broadcast';

                    return (
                      <div
                        key={log.id || idx}
                        className="p-3 rounded-2xl bg-white border border-gray-200 text-xs shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {isStep1 && '1. Contact Welcome'}
                            {isStep2 && '2. Survey Qualified'}
                            {isStep3 && '3. Strategy Meeting Link'}
                            {isGcp && 'GCP Scheduled Broadcast'}
                            {!isStep1 && !isStep2 && !isStep3 && !isGcp && (log.trigger_step || 'Direct Message')}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(log.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <p className="text-gray-800 font-medium whitespace-pre-wrap bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                          {log.message}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
                          <span>Instance: <strong className="text-gray-700">{log.instance_name || 'instance'}</strong></span>
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {log.status === 'sent' ? 'Sent & Delivered' : log.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center">
                  <p className="text-xs text-gray-400 italic">
                    No WhatsApp messages sent or logged to this client yet.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Card 3: Scheduled Follow-up Date */}
          <Card className="p-5 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-[#111827]">
                  Scheduled Follow-up Date
                </h3>
              </div>
              {followupDate && (
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Active Reminder
                </span>
              )}
            </div>
            <input
              type="date"
              value={followupDate}
              onChange={(e) => handleSaveFollowupDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-xs font-medium bg-[#F5F6F8] focus:bg-white focus:outline-none"
            />
          </Card>

          {/* Card 4: Staff Notes & Remarks JSON History */}
          <Card className="p-5 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-[#111827]">
                  Staff Notes & Remarks
                </h3>
              </div>
              <span className="text-xs text-gray-400 font-bold">
                {staffNotesHistory.length} {staffNotesHistory.length === 1 ? 'Note' : 'Notes'}
              </span>
            </div>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Type staff notes or call remarks..."
              className="w-full h-20 p-3 rounded-xl border border-[#E5E7EB] text-xs bg-[#F5F6F8] focus:bg-white focus:outline-none"
            />

            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                disabled={isSavingNote}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleAddStaffNote}
              >
                {isSavingNote ? 'Saving...' : 'Add Note'}
              </Button>
            </div>

            {/* Render Recorded Staff Notes History */}
            {staffNotesHistory && staffNotesHistory.length > 0 ? (
              <div className="space-y-2 pt-2 border-t border-gray-100 max-h-56 overflow-y-auto pr-1">
                {staffNotesHistory.map((item: any, idx: number) => (
                  <div key={item.id || idx} className="p-3 rounded-xl bg-[#F8FAFC] border border-gray-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                      <span className="text-indigo-600 font-semibold">{item.author || 'Staff Admin'}</span>
                      <span>{item.created_at}</span>
                    </div>
                    <p className="text-gray-800 font-medium whitespace-pre-wrap">{item.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-gray-400 italic pt-1">
                No staff notes recorded yet.
              </p>
            )}
          </Card>

          {/* Card 5: Customer Journey Checklist */}
          <Card className="p-5 bg-white space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
              CUSTOMER JOURNEY CHECKLIST
            </h3>

            <div className="space-y-2">
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between text-xs font-bold text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>1. Basic Contact Info</span>
                </div>
                <span className="text-emerald-700 font-mono">{selectedClient.phone || 'N/A'}</span>
              </div>

              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between text-xs font-bold text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>2. Business Survey</span>
                </div>
                <span className="text-emerald-700">
                  {selectedClient.survey_responses && Object.keys(selectedClient.survey_responses).length > 0
                    ? 'Completed'
                    : 'Pending'}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between text-xs font-bold text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>3. Scheduled Meeting</span>
                </div>
                <span className="text-emerald-700">
                  {selectedClient.meeting_date
                    ? `${selectedClient.meeting_date} @ ${selectedClient.meeting_time || '11:00 AM'}`
                    : 'Pending'}
                </span>
              </div>
            </div>
          </Card>

          {/* Card 6: Google Meet Video Call Management Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#2E1A75] to-[#1E1250] text-white shadow-md space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center">
                  <Video className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Google Meet Video Call</h3>
                  <p className="text-xs text-white/70">Custom meeting link for this client</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                ACTIVE LINK
              </span>
            </div>

            {/* Editable Google Meet URL Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-indigo-200 block">
                Manage Google Meet URL:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={googleMeetUrl}
                  onChange={(e) => setGoogleMeetUrl(e.target.value)}
                  placeholder="https://meet.google.com/qbi-erbq-moy"
                  className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none"
                />
                <button
                  type="button"
                  disabled={isSavingMeet}
                  onClick={handleSaveGoogleMeetUrl}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingMeet ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </div>

            {/* Meet Link & Copy Bar */}
            <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between gap-2 text-xs font-mono">
              <span className="truncate text-white/90">{googleMeetUrl}</span>
              <button
                onClick={handleCopyMeet}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedMeet ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMeet ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Join Call Button */}
            <a
              href={googleMeetUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <Video className="w-4 h-4" />
              <span>Join Google Meet Video Call Now 🚀</span>
            </a>
          </div>

          {/* Card 7: Reschedule Meeting & Video Call */}
          <Card className="p-5 bg-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#111827]">
                  Reschedule Meeting & Video Call
                </h3>
                <p className="text-xs text-gray-400">
                  Set new date & time to auto-generate a new Google Meet link
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  NEW MEETING DATE *
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-medium bg-[#F5F6F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  NEW MEETING TIME *
                </label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-medium bg-[#F5F6F8]"
                >
                  <option>09:00 AM</option>
                  <option>11:00 AM</option>
                  <option>02:00 PM</option>
                  <option>04:00 PM</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={sendRescheduleWa}
                onChange={(e) => setSendRescheduleWa(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>💬 Send Reschedule WhatsApp Notification to Client</span>
            </label>

            {rescheduleStatus && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  rescheduleStatus.includes('Error')
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {rescheduleStatus}
              </div>
            )}

            <Button
              variant="primary"
              className="w-full"
              disabled={isRescheduling}
              leftIcon={<Calendar className="w-4 h-4" />}
              onClick={handleRescheduleMeeting}
            >
              {isRescheduling ? 'Rescheduling & Notifying...' : 'Confirm & Reschedule Meeting 🗓️'}
            </Button>
          </Card>

          {/* Card 8: Survey Responses Profile */}
          <Card className="p-5 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-[#111827]">
                  Survey Responses Profile
                </h3>
              </div>
              <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {selectedClient.survey_responses && Object.keys(selectedClient.survey_responses).length > 0
                  ? `${Object.keys(selectedClient.survey_responses).length} Questions Answered`
                  : 'No Survey Data'}
              </span>
            </div>

            {selectedClient.survey_responses && Object.keys(selectedClient.survey_responses).length > 0 ? (
              <div className="space-y-2 pt-1 text-xs">
                {Object.entries(selectedClient.survey_responses).map(([questionText, answerVal]) => (
                  <div
                    key={questionText}
                    className="p-3 rounded-xl border border-gray-200 bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <span className="text-gray-700 font-bold max-w-xs leading-relaxed">
                      {questionText}:
                    </span>
                    <span className="font-extrabold text-gray-900 px-3 py-1 bg-white rounded-lg border border-gray-200 shadow-2xs text-right shrink-0">
                      {Array.isArray(answerVal) ? answerVal.join(', ') : String(answerVal)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-gray-400 italic pt-1">
                No survey responses recorded for this lead yet.
              </p>
            )}
          </Card>

          {/* Card 9: Campaign & Survey Link Footer Card */}
          <Card className="p-4 bg-white space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
              <span>
                Campaign: <span className="text-gray-900 font-bold">{selectedClient.campaign || 'firstoptionagency'}</span>
              </span>
              <span>
                Created: <span className="text-gray-900 font-bold">{selectedClient.createdDate || '2026-07-28'}</span>
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <span className="text-gray-500 font-semibold">Survey Link</span>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold shadow-2xs cursor-pointer"
              >
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
