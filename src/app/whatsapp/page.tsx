'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, Button, Badge } from '@/components/ui';
import { useAuth } from '@/components/auth/AuthContext';
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

const SERVER_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'https://funnel.infiplus.in').replace(/\/$/, '');


export default function WhatsappAutomationPage() {
  const { user, workspace } = useAuth();
  const [config, setConfig] = useState<WhatsappConfig>(DEFAULT_WHATSAPP_CONFIG);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSavingInstance, setIsSavingInstance] = useState(false);
  const [instanceSaveMsg, setInstanceSaveMsg] = useState('');

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

  const getRemainingTimeText = (dateStr: string) => {
    if (!dateStr) return 'Scheduled';
    const diffMs = new Date(dateStr).getTime() - Date.now();
    if (diffMs <= 0) return 'Triggering / Dispatched';
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.ceil(diffMs / (1000 * 60));
    if (diffSec < 60) return `⚡ In ${diffSec}s`;
    if (diffMin < 60) return `⏳ In ~${diffMin} min${diffMin > 1 ? 's' : ''}`;
    const diffHours = Math.floor(diffMin / 60);
    return `In ${diffHours}h ${diffMin % 60}m`;
  };

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
        let wsData = null;
        if (workspace?.id) {
          setWorkspaceId(workspace.id);
          wsData = workspace;
        } else if (user?.id) {
          const { data: ws } = await supabase
            .from('funnel_workspaces')
            .select('id, whatsapp_config')
            .eq('user_id', user.id)
            .maybeSingle();
          if (ws) {
            wsData = ws;
            setWorkspaceId(ws.id);
          }
        } else {
          const { data: ws } = await supabase
            .from('funnel_workspaces')
            .select('id, whatsapp_config')
            .limit(1)
            .maybeSingle();
          if (ws) {
            wsData = ws;
            setWorkspaceId(ws.id);
          }
        }

        if (wsData?.whatsapp_config) {
          setConfig({
            ...DEFAULT_WHATSAPP_CONFIG,
            ...wsData.whatsapp_config,
            instance_name: wsData.whatsapp_config.instance_name || '',
          });
        }
      } catch (err) {
        console.error('Error loading WhatsApp config:', err);
      } finally {
        setIsLoading(false);
      }
    })();

    fetchGcpQueue();
  }, [user, workspace]);

  // Save only WhatsApp Instance Name
  const handleSaveInstance = async () => {
    setIsSavingInstance(true);
    setInstanceSaveMsg('');
    try {
      const updatedConfig = { ...config, instance_name: config.instance_name?.trim() || '' };
      let targetWsId = workspaceId || workspace?.id;

      if (targetWsId) {
        await supabase
          .from('funnel_workspaces')
          .update({ whatsapp_config: updatedConfig })
          .eq('id', targetWsId);
      } else if (user?.id) {
        const { data: ws } = await supabase
          .from('funnel_workspaces')
          .update({ whatsapp_config: updatedConfig })
          .eq('user_id', user.id)
          .select('id')
          .maybeSingle();
        if (ws?.id) setWorkspaceId(ws.id);
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
            .update({ whatsapp_config: updatedConfig })
            .eq('id', ws.id);
        }
      }

      setInstanceSaveMsg(
        updatedConfig.instance_name
          ? `WhatsApp instance "${updatedConfig.instance_name}" saved successfully! 🚀`
          : 'WhatsApp instance cleared and saved.'
      );
      setTimeout(() => setInstanceSaveMsg(''), 4000);
    } catch (err: any) {
      console.error('Error saving instance:', err);
      setInstanceSaveMsg(`Error: ${err.message || 'Failed to save instance'}`);
    } finally {
      setIsSavingInstance(false);
    }
  };

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
              className="shadow-sm"
            >
              Save WhatsApp Configuration
            </Button>
          </div>
        </div>

        {/* Viewport Floating Toast Banner for instant save feedback */}
        {saveStatus && (
          <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="px-4 py-2.5 rounded-2xl bg-[#111827] text-white text-xs font-bold shadow-2xl flex items-center gap-2.5 border border-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{saveStatus}</span>
            </div>
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
                Google Cloud Tasks Queue (<code className="font-mono text-indigo-600 font-bold">asia-south1</code>) — Dispatches automatically at the exact scheduled timestamp
              </p>
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
        </div>

        {/* Instance Connection Settings */}
        <Card className="p-6 bg-white border border-[#E5E7EB] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#111827]">WhatsApp Sender Instance Setup</h3>
                <p className="text-xs text-gray-500">Configure your unique WhatsApp instance to send automated broadcast & funnel messages.</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-[11px] font-semibold text-gray-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gateway Managed Securely Server-Side</span>
            </div>
          </div>

          <div className="space-y-3 max-w-xl">
            <label className="block text-xs font-bold uppercase text-gray-700">
              Your WhatsApp Instance Name <span className="text-red-500">*</span>
            </label>

            {/* Input + Save Instance Button */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <input
                type="text"
                value={config.instance_name || ''}
                onChange={(e) => setConfig({ ...config, instance_name: e.target.value })}
                placeholder="Enter your WhatsApp instance name (e.g. agency_main, sales_bot)"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
              />

              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveInstance}
                isLoading={isSavingInstance}
                leftIcon={<Save className="w-3.5 h-3.5" />}
                className="text-xs font-bold shrink-0"
              >
                Save Instance
              </Button>
            </div>

            {/* Instance Save Success / Error Toast Message */}
            {instanceSaveMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{instanceSaveMsg}</span>
              </div>
            )}

            <p className="text-[11px] text-gray-500 flex items-center gap-1.5 pt-0.5">
              <span>All messages will be dispatched through your assigned instance:</span>
              {config.instance_name ? (
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                  {config.instance_name}
                </span>
              ) : (
                <span className="text-gray-400 italic font-medium">(Not configured - enter instance name above)</span>
              )}
            </p>
          </div>
        </Card>

        {/* 3 Step Funnel Trigger Configurations */}
        <div className="space-y-4 pt-2">
          {/* Section Header with Save Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-[#111827]">
                  Automated Funnel Trigger Messages
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Instant Dispatch
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Customize automated WhatsApp copy, media, and variables for Steps 1, 2, and 3.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveConfig}
              isLoading={isSaving}
              leftIcon={<Save className="w-3.5 h-3.5" />}
              className="text-xs font-bold shrink-0 shadow-sm"
            >
              Save WhatsApp Configuration
            </Button>
          </div>

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
                  onChange={(e) => {
                    const newType = e.target.value as any;
                    setConfig({
                      ...config,
                      step1: {
                        ...config.step1,
                        msg_type: newType,
                        media_url: newType === 'text' ? '' : config.step1.media_url,
                      },
                    });
                  }}
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
                  onChange={(e) => {
                    const newType = e.target.value as any;
                    setConfig({
                      ...config,
                      step2: {
                        ...config.step2,
                        msg_type: newType,
                        media_url: newType === 'text' ? '' : config.step2.media_url,
                      },
                    });
                  }}
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
                  onChange={(e) => {
                    const newType = e.target.value as any;
                    setConfig({
                      ...config,
                      step3: {
                        ...config.step3,
                        msg_type: newType,
                        media_url: newType === 'text' ? '' : config.step3.media_url,
                      },
                    });
                  }}
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

          {/* Bottom Save Bar for easy 1-click saving right after editing */}
          <div className="p-4 rounded-2xl bg-white border border-indigo-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#111827]">
                  Ready to deploy your WhatsApp message changes?
                </h4>
                <p className="text-[11px] text-gray-500">
                  Saves your custom message templates, media attachments, and trigger rules to Supabase.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleSaveConfig}
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
              className="text-xs font-bold shadow-md shrink-0"
            >
              Save WhatsApp Configuration 🚀
            </Button>
          </div>
        </div>
      </div>

        {/* Live Dispatch & GCP Schedule Tester */}
        <Card className="p-6 bg-white border border-[#E5E7EB] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-sm text-[#111827]">Live WhatsApp & GCP Cloud Tasks Dispatch Tester</h3>
                <p className="text-xs text-gray-500">Test immediate message dispatches or test scheduling via Google Cloud Tasks queue.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSchedulePhone(testPhone || '919958399157');
                  const target = new Date(Date.now() + 1 * 60 * 1000);
                  const pad = (n: number) => String(n).padStart(2, '0');
                  setScheduleDateTime(`${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${pad(target.getHours())}:${pad(target.getMinutes())}`);
                  setIsScheduleModalOpen(true);
                }}
                leftIcon={<Calendar className="w-3.5 h-3.5 text-indigo-600" />}
              >
                Test +1 Min GCP Schedule 🕒
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                Select Trigger Step
              </label>
              <select
                value={testStep}
                onChange={(e) => setTestStep(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
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
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleRunTestDispatch}
                disabled={isTesting || !testPhone}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isTesting ? 'Sending...' : 'Send Live Test Now 🚀'}</span>
              </button>
            </div>
          </div>

          {testResult && (
            <div
              className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
