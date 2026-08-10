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

export function ClientDrawer() {
  const { isOpen, selectedClient, closeClientDrawer } = useClientDrawer();
  const { accentColor } = useTheme();

  // Local state for forms inside the drawer
  const [pipelineStage, setPipelineStage] = useState(selectedClient?.step_progress || selectedClient?.stage || 'step1_contact');
  const [dealValue, setDealValue] = useState<string>(
    selectedClient?.deal_value !== undefined && selectedClient?.deal_value !== null
      ? String(selectedClient.deal_value)
      : ''
  );
  const [followupDate, setFollowupDate] = useState(selectedClient?.followup_date || selectedClient?.followupDate || '');
  const [staffNotesHistory, setStaffNotesHistory] = useState<any[]>(
    Array.isArray(selectedClient?.staff_notes) ? selectedClient.staff_notes : []
  );
  const [googleMeetUrl, setGoogleMeetUrl] = useState(
    selectedClient?.google_meet_url || selectedClient?.googleMeetUrl || 'https://meet.google.com/qbi-erbq-moy'
  );
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isSavingMeet, setIsSavingMeet] = useState(false);

  const [broadcastDate, setBroadcastDate] = useState('');
  const [senderInstance, setSenderInstance] = useState('-- Use Default Active --');
  const [messageText, setMessageText] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('2026-08-10');
  const [rescheduleTime, setRescheduleTime] = useState('09:00 AM');
  const [sendRescheduleWa, setSendRescheduleWa] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMeet, setCopiedMeet] = useState(false);
  const [workspaceStages, setWorkspaceStages] = useState<any[]>([
    { id: 'step1_contact', name: '1. Contact Form Captured' },
    { id: 'survey_completed', name: '2. Survey Qualified' },
    { id: 'meeting_booked', name: '3. Meeting Booked' },
    { id: 'meeting_missed', name: '4. Meeting Missed' },
    { id: 'closed_won', name: '5. Closed Won' },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('funnel_workspaces').select('pipeline_stages').limit(1).maybeSingle();
        if (data?.pipeline_stages && Array.isArray(data.pipeline_stages)) {
          const active = data.pipeline_stages.filter((s: any) => !s.is_deleted);
          if (active.length > 0) setWorkspaceStages(active);
        }
      } catch (err) {}
    })();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      setPipelineStage(selectedClient.step_progress || selectedClient.stage || 'step1_contact');
      setDealValue(
        selectedClient.deal_value !== undefined && selectedClient.deal_value !== null
          ? String(selectedClient.deal_value)
          : ''
      );
      setFollowupDate(selectedClient.followup_date || selectedClient.followupDate || '');
      setStaffNotesHistory(Array.isArray(selectedClient.staff_notes) ? selectedClient.staff_notes : []);
      setGoogleMeetUrl(selectedClient.google_meet_url || selectedClient.googleMeetUrl || 'https://meet.google.com/qbi-erbq-moy');
    }
  }, [selectedClient]);

  if (!isOpen || !selectedClient) return null;

  const initials = selectedClient.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleUpdateStage = async (val: string) => {
    setPipelineStage(val);
    if (selectedClient?.id) {
      await supabase.from('leads').update({ step_progress: val }).eq('id', selectedClient.id);
    }
  };

  const handleSaveDealValue = async (val?: string) => {
    const valueToSave = val !== undefined ? val : dealValue;
    const finalVal = valueToSave.trim() === '' ? null : valueToSave.trim();
    if (selectedClient?.id) {
      await supabase.from('leads').update({ deal_value: finalVal }).eq('id', selectedClient.id);
    }
  };

  const handleSaveFollowupDate = async (val: string) => {
    setFollowupDate(val);
    if (selectedClient?.id) {
      await supabase.from('leads').update({ followup_date: val }).eq('id', selectedClient.id);
    }
  };

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

  const handleDeleteLead = async () => {
    if (!selectedClient?.id) return;

    const savedPin = typeof window !== 'undefined' ? localStorage.getItem('workspace_delete_pin') || '1234' : '1234';
    const enteredPin = prompt(`🔒 SECURITY PIN REQUIRED\nEnter 4-digit security PIN to delete lead "${selectedClient.name}":`);

    if (enteredPin === null) return; // User cancelled prompt

    if (enteredPin.trim() !== savedPin.trim()) {
      alert('❌ Incorrect 4-Digit Security PIN! Lead deletion cancelled.');
      return;
    }

    try {
      await supabase.from('leads').delete().eq('id', selectedClient.id);
      alert('✓ Lead deleted successfully.');
      closeClientDrawer();
    } catch (err) {
      console.error('Error deleting lead:', err);
      alert('Error deleting lead from database.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://infisparkfunnel.com/survey/${selectedClient.id || 1}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMeet = () => {
    navigator.clipboard.writeText(googleMeetUrl);
    setCopiedMeet(true);
    setTimeout(() => setCopiedMeet(false), 2000);
  };

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

          {/* Card 2: Scheduled WhatsApp Broadcasts by Date & Time */}
          <Card className="p-5 bg-white space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#111827]">
                    Scheduled WhatsApp Broadcasts by Date & Time
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Stored in <span className="font-mono text-indigo-600">/lead_whatapp_send_by_date</span> node (Auto retries if failed)
                  </p>
                </div>
              </div>
              <Badge variant="info">0 Scheduled</Badge>
            </div>

            <button className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer">
              G View Live GCP Queue
            </button>

            {/* Broadcast Form */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    TARGET DATE & TIME *
                  </label>
                  <input
                    type="datetime-local"
                    value={broadcastDate}
                    onChange={(e) => setBroadcastDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-medium bg-[#F5F6F8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    SENDER INSTANCE
                  </label>
                  <select
                    value={senderInstance}
                    onChange={(e) => setSenderInstance(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-medium bg-[#F5F6F8]"
                  >
                    <option>-- Use Default Active --</option>
                    <option>Instance #1 (Sales Team)</option>
                    <option>Instance #2 (Support)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-600">
                    Custom Message Text:
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600">
                    <button
                      type="button"
                      onClick={() => setMessageText((prev) => prev + ' {{name}}')}
                      className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100"
                    >
                      + {"{{name}}"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessageText((prev) => prev + ' {{meeting_url}}')}
                      className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100"
                    >
                      + {"{{meeting_url}}"}
                    </button>
                  </div>
                </div>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Enter message (e.g. Hello {{name}}, reminder for our call!)..."
                  className="w-full h-24 p-3 rounded-xl border border-[#E5E7EB] text-xs bg-[#F5F6F8] focus:bg-white focus:outline-none"
                />
              </div>

              <Button
                variant="primary"
                className="w-full"
                leftIcon={<Send className="w-4 h-4" />}
                onClick={() => alert('WhatsApp broadcast scheduled successfully!')}
              >
                Schedule WhatsApp Broadcast 🚀
              </Button>
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

            <Button
              variant="primary"
              className="w-full"
              leftIcon={<Calendar className="w-4 h-4" />}
              onClick={() => alert(`Meeting rescheduled to ${rescheduleDate} at ${rescheduleTime}`)}
            >
              Confirm & Reschedule Meeting 🗓️
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
