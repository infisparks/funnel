'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, Button, Badge } from '@/components/ui';
import { supabase } from '@/lib/supabaseClient';
import {
  DEFAULT_WHATSAPP_CONFIG,
  WhatsappConfig,
  dispatchWhatsappTrigger,
} from '@/lib/whatsappDispatch';
import {
  MessageSquare,
  Sparkles,
  Send,
  Save,
  CheckCircle,
  AlertCircle,
  Video,
  Image as ImageIcon,
  FileText,
  Key,
  Globe,
  Smartphone,
  Info,
  Calendar,
  Clock,
  Server,
  Cloud,
  Database,
  Trash2,
  RefreshCw,
  Plus,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5005';

export default function WhatsappAutomationPage() {
  const [config, setConfig] = useState<WhatsappConfig>(DEFAULT_WHATSAPP_CONFIG);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Test Dispatch state
  const [testPhone, setTestPhone] = useState('919958399157');
  const [testStep, setTestStep] = useState<'step1' | 'step2' | 'step3'>('step3');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // GCP Cloud Tasks & Scheduled Broadcasts State
  const [queueData, setQueueData] = useState<any>(null);
  const [isQueueLoading, setIsQueueLoading] = useState(false);
  const [isGcpModalOpen, setIsGcpModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleStatusMsg, setScheduleStatusMsg] = useState('');

  // Schedule Broadcast Form
  const [schedulePhone, setSchedulePhone] = useState('');
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [scheduleMessage, setScheduleMessage] = useState(
    'Hello {{name}}, this is a scheduled reminder for your upcoming strategy call. Join link: {{meeting_url}}'
  );
  const [scheduleMediaUrl, setScheduleMediaUrl] = useState('');
  const [scheduleMediaType, setScheduleMediaType] = useState<'image' | 'video' | 'document' | ''>('');

  // Fetch GCP Cloud Tasks Queue & Quota from Node.js Server
  const fetchGcpQueue = async () => {
    setIsQueueLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/tasks/queue`);
      const data = await res.json();
      if (data.success) {
        setQueueData(data);
      }
    } catch (err) {
      console.warn('Could not connect to backend server queue, using local state:', err);
    } finally {
      setIsQueueLoading(false);
    }
  };

  // Fetch workspace whatsapp_config & GCP queue on mount
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const { data: ws } = await supabase
          .from('funnel_workspaces')
          .select('id, whatsapp_config')
          .limit(1)
          .maybeSingle();

        if (ws?.id) setWorkspaceId(ws.id);
        if (ws?.whatsapp_config) {
          setConfig({ ...DEFAULT_WHATSAPP_CONFIG, ...ws.whatsapp_config });
        }
      } catch (err) {
        console.error('Error loading WhatsApp config:', err);
      } finally {
        setIsLoading(false);
      }
    })();

    fetchGcpQueue();
  }, []);

  // Save config to Supabase
  const handleSaveConfig = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      if (workspaceId) {
        await supabase
          .from('funnel_workspaces')
          .update({ whatsapp_config: config })
          .eq('id', workspaceId);
      } else {
        const { data: ws } = await supabase
          .from('funnel_workspaces')
          .select('id')
          .limit(1)
          .maybeSingle();

        if (ws?.id) {
          setWorkspaceId(ws.id);
          await supabase
            .from('funnel_workspaces')
            .update({ whatsapp_config: config })
            .eq('id', ws.id);
        }
      }
      setSaveStatus('WhatsApp automation settings saved successfully!');
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      console.error('Error saving config:', err);
      setSaveStatus(`Failed to save: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Run live test dispatch
  const handleRunTestDispatch = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await dispatchWhatsappTrigger(
        testStep,
        {
          name: 'Demo Lead (Arshad)',
          phone: testPhone,
          google_meet_url: 'https://meet.google.com/qbi-erbq-moy',
        },
        config
      );

      if (result.success) {
        setTestResult({
          success: true,
          message: `Message dispatched successfully to ${testPhone} via instance "${config.instance_name}"!`,
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Failed to dispatch WhatsApp message.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Error executing dispatch.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Schedule new WhatsApp task via Node.js backend server (server.js)
  const handleScheduleTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulePhone || !scheduleDateTime || !scheduleMessage) {
      alert('Please fill in recipient phone, date & time, and message text.');
      return;
    }

    setIsScheduling(true);
    setScheduleStatusMsg('');

    try {
      const res = await fetch(`${SERVER_URL}/api/tasks/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: workspaceId || 'default_user',
          recipientPhone: schedulePhone,
          recipientName: scheduleName || 'Valued Lead',
          messageText: scheduleMessage,
          mediaUrl: scheduleMediaUrl || undefined,
          mediaType: scheduleMediaType || undefined,
          scheduleTime: scheduleDateTime,
          campaignName: 'Manual Scheduled Broadcast',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setScheduleStatusMsg('Message scheduled successfully in Google Cloud Tasks! 🕒');
        setIsScheduleModalOpen(false);
        setSchedulePhone('');
        setScheduleDateTime('');
        fetchGcpQueue();
      } else {
        alert(data.error || 'Failed to schedule message.');
      }
    } catch (err: any) {
      console.error('Schedule error:', err);
      alert(err.message || 'Network error connecting to Node.js backend server at ' + SERVER_URL);
    } finally {
      setIsScheduling(false);
    }
  };

  // Cancel a scheduled task via Node.js server
  const handleCancelTask = async (taskId: string, gcpTaskName?: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled message from GCP Queue?')) return;
    try {
      const res = await fetch(`${SERVER_URL}/api/tasks/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, gcpTaskName }),
      });
      const data = await res.json();
      if (data.success) {
        fetchGcpQueue();
      }
    } catch (err) {
      console.error('Cancel task error:', err);
    }
  };

  const insertVariable = (step: 'step1' | 'step2' | 'step3', variable: string) => {
    setConfig({
      ...config,
      [step]: {
        ...config[step],
        message: config[step].message + ' ' + variable,
      },
    });
  };

  const remainingQuota = queueData?.quota?.remaining ?? 10000;
  const usedQuota = queueData?.quota?.used ?? 0;
  const maxQuota = queueData?.quota?.maxLimit ?? 10000;
  const quotaPercent = Math.min(100, Math.round((usedQuota / maxQuota) * 100));

  return (
    <MainLayout>
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
                WhatsApp Automation & Scheduling
              </h1>
              <Badge variant="info">Google Cloud Tasks Active</Badge>
            </div>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
              Configure real-time trigger webhooks & Google Cloud Tasks date/time scheduled broadcasts (10,000/month).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchGcpQueue}
              isLoading={isQueueLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-indigo-600" />}
            >
              Refresh GCP Queue
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveConfig}
              isLoading={isSaving}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Settings
            </Button>
          </div>
        </div>

        {saveStatus && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveStatus}</span>
          </div>
        )}

        {/* SECTION: Scheduled WhatsApp Broadcasts by Date & Time */}
        <div className="space-y-4 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-[#111827]">
                  Scheduled WhatsApp Broadcasts by Date & Time
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Google Cloud Tasks
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Stored in <code className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">/lead_whatapp_send_by_date</code> node (Auto retries if failed)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsGcpModalOpen(true)}
                leftIcon={<Server className="w-3.5 h-3.5 text-indigo-600" />}
              >
                G View Live GCP Queue
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsScheduleModalOpen(true)}
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
              >
                Schedule Broadcast 🕒
              </Button>
            </div>
          </div>

          {/* Quota & GCP Queue Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Scheduled in Queue */}
            <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">Scheduled in Queue</span>
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-gray-900 mt-1">
                {queueData?.totalScheduled ?? 0} Scheduled
              </p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>GCP Queue: Active 🟢</span>
              </p>
            </div>

            {/* 2. Monthly Quota Remaining */}
            <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">GCP Monthly Quota</span>
                <Database className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-xl font-black text-gray-900">
                {remainingQuota.toLocaleString()} <span className="text-xs font-normal text-gray-400">/ 10,000 remaining</span>
              </p>
              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(2, quotaPercent)}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400">
                Resets on {queueData?.quota?.resetDate || '1st of next month'} (10k limit per owner)
              </p>
            </div>

            {/* 3. GCP Region & Engine */}
            <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">GCP Region & Engine</span>
                <Cloud className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-sm font-bold text-gray-900 truncate">
                asia-south1 / firstoption-8da25
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                whatsapp-automation-queue
              </p>
            </div>
          </div>

          {/* Scheduled Tasks List Table Card */}
          <Card className="p-0 bg-white border border-[#E5E7EB] shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-[#111827]">
                  Upcoming GCP Scheduled Messages ({queueData?.tasks?.length || 0})
                </h4>
              </div>
              <span className="text-[11px] text-gray-500">Auto-dispatches at exact timestamp</span>
            </div>

            {!queueData?.tasks || queueData.tasks.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Clock className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs font-bold text-gray-700">No scheduled broadcasts in queue</p>
                <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                  Click &ldquo;Schedule Broadcast 🕒&rdquo; to enqueue a message for any future date and time via Google Cloud Tasks.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-gray-50/80 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                      <th className="px-4 py-3">Recipient</th>
                      <th className="px-4 py-3">Scheduled Time</th>
                      <th className="px-4 py-3">Message Preview</th>
                      <th className="px-4 py-3">GCP Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {queueData.tasks.map((task: any) => {
                      const isCompleted = task.status === 'completed';
                      const isCancelled = task.status === 'cancelled';
                      const isScheduled = task.status === 'scheduled';

                      return (
                        <tr key={task.id || task.gcp_task_id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-gray-900">{task.recipient_name || 'Recipient'}</div>
                            <div className="font-mono text-[11px] text-gray-500">{task.recipient_phone}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-gray-800 flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-indigo-600" />
                              <span>{new Date(task.scheduled_at).toLocaleString()}</span>
                            </div>
                            <div className="text-[10px] text-gray-400">Node: /lead_whatapp_send_by_date</div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="max-w-xs text-[11px] text-gray-700 truncate" title={task.message_text}>
                              {task.message_text}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            {isScheduled && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                <Clock className="w-2.5 h-2.5" /> Scheduled in GCP
                              </span>
                            )}
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle className="w-2.5 h-2.5" /> Dispatched
                              </span>
                            )}
                            {isCancelled && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <X className="w-2.5 h-2.5" /> Cancelled
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isScheduled && (
                              <button
                                type="button"
                                onClick={() => handleCancelTask(task.id || task.gcp_task_id, task.gcp_task_name)}
                                className="px-2.5 py-1 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold text-[11px] border border-rose-200 transition-colors cursor-pointer"
                              >
                                Cancel Task
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Global Connection Settings */}
        <Card className="p-6 bg-white border border-[#E5E7EB] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E5E7EB]">
            <Globe className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-[#111827]">Evolution API Gateway Connection</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                API Base URL
              </label>
              <input
                type="text"
                value={config.evolution_api_url}
                onChange={(e) => setConfig({ ...config, evolution_api_url: e.target.value })}
                placeholder="https://evo.infispark.in"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Instance Name
              </label>
              <input
                type="text"
                value={config.instance_name}
                onChange={(e) => setConfig({ ...config, instance_name: e.target.value })}
                placeholder="funnel_instance"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Global API Key
              </label>
              <input
                type="password"
                value={config.evolution_apikey}
                onChange={(e) => setConfig({ ...config, evolution_apikey: e.target.value })}
                placeholder="Evolution API Token"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* 3 Step Funnel Trigger Configurations */}
        <div className="space-y-6">
          {/* Step 1: Lead Details Captured */}
          <Card className="p-6 bg-white border border-[#E5E7EB] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Step 1: Contact Details Captured</h4>
                  <p className="text-xs text-gray-500">Sent immediately when visitor submits Name, Email, & Phone</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.step1.enabled}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      step1: { ...config.step1, enabled: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Message Format</label>
                <select
                  value={config.step1.msg_type || 'text'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      step1: { ...config.step1, msg_type: e.target.value as any },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none"
                >
                  <option value="text">Text Message Only</option>
                  <option value="image">Image with Caption</option>
                  <option value="video">Video with Caption</option>
                </select>
              </div>

              {config.step1.msg_type !== 'text' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Media URL</label>
                  <input
                    type="url"
                    value={config.step1.media_url || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        step1: { ...config.step1, media_url: e.target.value },
                      })
                    }
                    placeholder="https://example.com/welcome.jpg"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-xs text-gray-800">Custom Message Text:</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => insertVariable('step1', '{{name}}')}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#6366F1] font-bold text-[11px] border border-indigo-200 cursor-pointer"
                  >
                    + {'{{name}}'}
                  </button>
                </div>
              </div>

              <textarea
                rows={3}
                value={config.step1.message}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    step1: { ...config.step1, message: e.target.value },
                  })
                }
                placeholder="Enter message (e.g. Hello {{name}}, thank you for reaching out!)..."
                className="w-full p-3 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none"
              />
            </div>
          </Card>

          {/* Step 2: Survey Qualification Completed */}
          <Card className="p-6 bg-white border border-[#E5E7EB] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Step 2: Survey Qualification Completed</h4>
                  <p className="text-xs text-gray-500">Sent when lead answers qualification survey questions</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.step2.enabled}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      step2: { ...config.step2, enabled: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Message Format</label>
                <select
                  value={config.step2.msg_type || 'text'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      step2: { ...config.step2, msg_type: e.target.value as any },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none"
                >
                  <option value="text">Text Message Only</option>
                  <option value="image">Image with Caption</option>
                  <option value="video">Video with Caption</option>
                </select>
              </div>

              {config.step2.msg_type !== 'text' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Media URL</label>
                  <input
                    type="url"
                    value={config.step2.media_url || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        step2: { ...config.step2, media_url: e.target.value },
                      })
                    }
                    placeholder="https://example.com/qualification.pdf"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-xs text-gray-800">Custom Message Text:</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => insertVariable('step2', '{{name}}')}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#6366F1] font-bold text-[11px] border border-indigo-200 cursor-pointer"
                  >
                    + {'{{name}}'}
                  </button>
                </div>
              </div>

              <textarea
                rows={3}
                value={config.step2.message}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    step2: { ...config.step2, message: e.target.value },
                  })
                }
                placeholder="Enter message (e.g. Thanks for your answers {{name}}, your profile is qualified!)..."
                className="w-full p-3 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none"
              />
            </div>
          </Card>

          {/* Step 3: Strategy Meeting Booked */}
          <Card className="p-6 bg-white border border-[#E5E7EB] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Step 3: Strategy Meeting Booked (Google Meet Link)</h4>
                  <p className="text-xs text-gray-500">Sent when lead books a calendar strategy call time slot</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.step3.enabled}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      step3: { ...config.step3, enabled: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Message Format</label>
                <select
                  value={config.step3.msg_type || 'text'}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      step3: { ...config.step3, msg_type: e.target.value as any },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none"
                >
                  <option value="text">Text Message Only</option>
                  <option value="image">Image with Caption</option>
                  <option value="video">Video with Caption</option>
                </select>
              </div>

              {config.step3.msg_type !== 'text' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Media URL</label>
                  <input
                    type="url"
                    value={config.step3.media_url || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        step3: { ...config.step3, media_url: e.target.value },
                      })
                    }
                    placeholder="https://example.com/invitation.jpg"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-xs text-gray-800">Custom Message Text:</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => insertVariable('step3', '{{name}}')}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#6366F1] font-bold text-[11px] border border-indigo-200 cursor-pointer"
                  >
                    + {'{{name}}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable('step3', '{{meeting_url}}')}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#6366F1] font-bold text-[11px] border border-indigo-200 cursor-pointer"
                  >
                    + {'{{meeting_url}}'}
                  </button>
                </div>
              </div>

              <textarea
                rows={4}
                value={config.step3.message}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    step3: { ...config.step3, message: e.target.value },
                  })
                }
                placeholder="Enter message (e.g. Hello {{name}}, meeting booked! Join link: {{meeting_url}})..."
                className="w-full p-3 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none"
              />
            </div>
          </Card>
        </div>

        {/* Live Dispatch Tester */}
        <Card className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Send className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm text-[#0F172A]">Live Evolution API Dispatch Tester</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                Select Trigger Step
              </label>
              <select
                value={testStep}
                onChange={(e) => setTestStep(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold text-gray-900 focus:outline-none"
              >
                <option value="step1">Step 1: Contact Welcome</option>
                <option value="step2">Step 2: Survey Qualified</option>
                <option value="step3">Step 3: Strategy Meeting Booked</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                Recipient Phone Number (with Country Code)
              </label>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="919958399157"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleRunTestDispatch}
                disabled={isTesting || !testPhone}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isTesting ? 'Sending...' : 'Send Live Test Message 🚀'}</span>
              </button>
            </div>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </Card>
      </div>

      {/* MODAL 1: Schedule Broadcast Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans">
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Schedule WhatsApp Broadcast
                  </h3>
                  <p className="text-xs text-gray-500">Google Cloud Tasks asia-south1 Queue</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleTask} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Recipient Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={schedulePhone}
                    onChange={(e) => setSchedulePhone(e.target.value)}
                    placeholder="919958399157"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={scheduleName}
                    onChange={(e) => setScheduleName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Schedule Execution Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleDateTime}
                  onChange={(e) => setScheduleDateTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Task will be placed in GCP queue and triggered at this exact moment.
                </span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Message Content *
                </label>
                <textarea
                  rows={3}
                  required
                  value={scheduleMessage}
                  onChange={(e) => setScheduleMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Optional Media URL (Image/PDF/Video)
                </label>
                <input
                  type="url"
                  value={scheduleMediaUrl}
                  onChange={(e) => setScheduleMediaUrl(e.target.value)}
                  placeholder="https://example.com/brochure.pdf"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t">
                <span className="text-[11px] text-gray-500">
                  Remaining Quota: <strong className="text-indigo-600">{remainingQuota.toLocaleString()}</strong> / 10k
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setIsScheduleModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    isLoading={isScheduling}
                    leftIcon={<Calendar className="w-3.5 h-3.5" />}
                  >
                    Schedule in GCP 🚀
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Live GCP Cloud Tasks Queue Viewer */}
      {isGcpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans">
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Google Cloud Tasks Queue Live Status
                  </h3>
                  <p className="text-xs text-gray-500">Connected: asia-south1 / whatsapp-automation-queue</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGcpModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between font-bold text-indigo-950">
                  <span>Queue Resource Path:</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="font-mono text-[11px] text-indigo-800 break-all bg-white p-2 rounded-lg border border-indigo-200">
                  projects/firstoption-8da25/locations/asia-south1/queues/whatsapp-automation-queue
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 space-y-0.5">
                  <span className="text-[11px] text-gray-400">Monthly Quota Remaining:</span>
                  <p className="text-base font-bold text-gray-900">
                    {remainingQuota.toLocaleString()} <span className="text-xs font-normal text-gray-500">/ 10,000</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 space-y-0.5">
                  <span className="text-[11px] text-gray-400">Quota Reset Date:</span>
                  <p className="text-base font-bold text-gray-900">
                    {queueData?.quota?.resetDate || '1st of month'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 space-y-1">
                <span className="font-bold text-gray-700">Webhook Trigger Destination:</span>
                <p className="font-mono text-[11px] text-gray-600 truncate">
                  https://firstoption.cloud/api/whatsapp/execute-task
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t">
              <Button variant="primary" size="sm" onClick={() => setIsGcpModalOpen(false)}>
                Close Queue Viewer
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
