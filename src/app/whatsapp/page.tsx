'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SectionHeader, Card, Button } from '@/components/ui';
import { supabase } from '@/lib/supabaseClient';
import {
  DEFAULT_WHATSAPP_CONFIG,
  WhatsappConfig,
  dispatchWhatsappTrigger,
} from '@/lib/whatsappDispatch';
import {
  DEFAULT_META_CONFIG,
  MetaCapiConfig,
  dispatchMetaCapiEvent,
} from '@/lib/metaCapiDispatch';
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
  Share2,
  RefreshCw,
  Eye,
  X,
  Database,
  Activity,
} from 'lucide-react';

export default function WhatsappAutomationPage() {
  const [config, setConfig] = useState<WhatsappConfig>(DEFAULT_WHATSAPP_CONFIG);
  const [metaConfig, setMetaConfig] = useState<MetaCapiConfig>(DEFAULT_META_CONFIG);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Dispatch Logs
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [selectedPayloadLog, setSelectedPayloadLog] = useState<any | null>(null);

  // Test Dispatch state
  const [testPhone, setTestPhone] = useState('919958399157');
  const [testStep, setTestStep] = useState<'step1' | 'step2' | 'step3'>('step3');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch workspace whatsapp_config, meta_config, and dispatch_logs
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: ws } = await supabase
        .from('funnel_workspaces')
        .select('id, whatsapp_config, meta_config')
        .limit(1)
        .maybeSingle();

      if (ws?.id) setWorkspaceId(ws.id);
      if (ws?.whatsapp_config) {
        setConfig({ ...DEFAULT_WHATSAPP_CONFIG, ...ws.whatsapp_config });
      }
      if (ws?.meta_config) {
        setMetaConfig({ ...DEFAULT_META_CONFIG, ...ws.meta_config });
      }

      await fetchLogs();
    } catch (err) {
      console.error('Error loading WhatsApp & Meta config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const { data: logRows } = await supabase
        .from('dispatch_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      setLogs(logRows || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save config to Supabase
  const handleSaveConfig = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const payloadToSave = {
        whatsapp_config: config,
        meta_config: metaConfig,
      };

      if (workspaceId) {
        await supabase
          .from('funnel_workspaces')
          .update(payloadToSave)
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
            .update(payloadToSave)
            .eq('id', ws.id);
        }
      }
      setSaveStatus('WhatsApp & Meta CAPI settings saved successfully!');
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
      const demoLead = {
        name: 'Demo Lead (Arshad)',
        phone: testPhone,
        google_meet_url: 'https://meet.google.com/qbi-erbq-moy',
      };

      const waRes = await dispatchWhatsappTrigger(testStep, demoLead, config);
      const metaRes = await dispatchMetaCapiEvent(testStep, demoLead, metaConfig);

      await fetchLogs();

      if (waRes.success && metaRes.success) {
        setTestResult({
          success: true,
          message: `Dispatched test triggers successfully! Check logs table below.`,
        });
      } else {
        setTestResult({
          success: false,
          message: `WA: ${waRes.error || 'OK'} | Meta: ${metaRes.error || 'OK'}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Dispatch error occurred.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Insert variable into message textarea
  const insertVariable = (stepKey: 'step1' | 'step2' | 'step3', variableTag: string) => {
    setConfig((prev) => ({
      ...prev,
      [stepKey]: {
        ...prev[stepKey],
        message: `${prev[stepKey].message} ${variableTag}`,
      },
    }));
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-8 text-center text-xs text-gray-500 font-semibold">
          Loading WhatsApp Automation Studio...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SectionHeader
        title="WhatsApp & Meta CAPI Studio"
        subtitle="Configure automatic WhatsApp dispatches via Evolution API and Meta Conversions API events."
        actions={
          <Button
            variant="primary"
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleSaveConfig}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save All Settings'}
          </Button>
        }
      />

      {saveStatus && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            saveStatus.includes('successfully')
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {saveStatus.includes('successfully') ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{saveStatus}</span>
        </div>
      )}

      {/* 1. WhatsApp Sender Instance Setup Card */}
      <Card className="p-6 bg-white space-y-4 border border-[#E2E8F0] shadow-2xs">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Smartphone className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-sm text-[#0F172A]">WhatsApp Sender Instance Setup</h3>
        </div>

        <div className="max-w-md text-xs">
          <label className="block font-bold text-indigo-700 uppercase mb-1 text-[11px]">
            Active Sender Instance Name *
          </label>
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-indigo-300 bg-indigo-50/50">
            <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
            <input
              type="text"
              required
              value={config.instance_name}
              onChange={(e) => setConfig({ ...config, instance_name: e.target.value })}
              placeholder="e.g. instance1"
              className="w-full bg-transparent font-bold text-indigo-950 focus:outline-none text-xs"
            />
          </div>
          <p className="text-[10px] text-gray-500 font-medium mt-1">
            Enter your connected WhatsApp instance name (e.g. <span className="font-mono text-gray-700 font-bold">instance</span> or <span className="font-mono text-gray-700 font-bold">instance1</span>).
          </p>
        </div>
      </Card>

      {/* 2. Meta Conversions API (CAPI) Settings Card */}
      <Card className="p-6 bg-white space-y-4 border border-[#E2E8F0] shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <Share2 className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-sm text-[#0F172A]">
                Meta Conversions API (CAPI) Integration
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                Send server-side Conversion events directly to Meta Graph API for Ad Attribution.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={metaConfig.meta_capi_enabled}
              onChange={(e) =>
                setMetaConfig({ ...metaConfig, meta_capi_enabled: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {metaConfig.meta_capi_enabled && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                  Meta Pixel ID *
                </label>
                <input
                  type="text"
                  value={metaConfig.meta_pixel_id}
                  onChange={(e) =>
                    setMetaConfig({ ...metaConfig, meta_pixel_id: e.target.value })
                  }
                  placeholder="e.g. 123456789012345"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-mono text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                  Meta Access Token (Graph API) *
                </label>
                <input
                  type="password"
                  value={metaConfig.meta_access_token}
                  onChange={(e) =>
                    setMetaConfig({ ...metaConfig, meta_access_token: e.target.value })
                  }
                  placeholder="EAAG..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-mono text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-2 text-[11px]">
                Meta CAPI Standard Events to Trigger
              </label>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-800">
                <label className="flex items-center gap-2 cursor-pointer bg-blue-50/60 px-3 py-1.5 rounded-lg border border-blue-200">
                  <input
                    type="checkbox"
                    checked={metaConfig.step1_event}
                    onChange={(e) =>
                      setMetaConfig({ ...metaConfig, step1_event: e.target.checked })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Step 1: Contact Form Captured (Lead Event)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-purple-50/60 px-3 py-1.5 rounded-lg border border-purple-200">
                  <input
                    type="checkbox"
                    checked={metaConfig.step2_event}
                    onChange={(e) =>
                      setMetaConfig({ ...metaConfig, step2_event: e.target.checked })
                    }
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Step 2: Survey Qualified (SubmitApplication Event)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-emerald-50/60 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <input
                    type="checkbox"
                    checked={metaConfig.step3_event}
                    onChange={(e) =>
                      setMetaConfig({ ...metaConfig, step3_event: e.target.checked })
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Step 3: Meeting Booked (Schedule Event)</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 3 Step Funnel Trigger Cards */}
      <div className="space-y-6">
        {/* Step 1 Card */}
        <Card className="p-6 bg-white border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 font-extrabold flex items-center justify-center text-xs">
                1
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#0F172A]">
                  Step 1: Contact Form Welcome Message
                </h3>
                <p className="text-[11px] text-gray-500 font-medium">
                  Triggered automatically when a visitor submits the initial contact form.
                </p>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                Message Payload Type
              </label>
              <select
                value={config.step1.msg_type}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    step1: { ...config.step1, msg_type: e.target.value as any },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-bold text-gray-800 focus:outline-none"
              >
                <option value="text">📝 Text Only</option>
                <option value="image">🖼️ Image + Caption</option>
                <option value="video">📹 Video + Caption</option>
              </select>
            </div>

            {config.step1.msg_type !== 'text' && (
              <div className="md:col-span-2">
                <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                  Media URL (Direct Link to Image/Video)
                </label>
                <input
                  type="url"
                  value={config.step1.media_url || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      step1: { ...config.step1, media_url: e.target.value },
                    })
                  }
                  placeholder="https://example.com/welcome_video.mp4"
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
              placeholder="Enter message (e.g. Hello {{name}}, welcome!)..."
              className="w-full p-3 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none"
            />
          </div>
        </Card>

        {/* Step 2 Card */}
        <Card className="p-6 bg-white border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 font-extrabold flex items-center justify-center text-xs">
                2
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#0F172A]">
                  Step 2: Survey Qualification Confirmation
                </h3>
                <p className="text-[11px] text-gray-500 font-medium">
                  Triggered automatically when a lead completes the 4-question survey.
                </p>
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                Message Payload Type
              </label>
              <select
                value={config.step2.msg_type}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    step2: { ...config.step2, msg_type: e.target.value as any },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-bold text-gray-800 focus:outline-none"
              >
                <option value="text">📝 Text Only</option>
                <option value="image">🖼️ Image + Caption</option>
                <option value="video">📹 Video + Caption</option>
              </select>
            </div>

            {config.step2.msg_type !== 'text' && (
              <div className="md:col-span-2">
                <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                  Media URL (Direct Link to Image/Video)
                </label>
                <input
                  type="url"
                  value={config.step2.media_url || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      step2: { ...config.step2, media_url: e.target.value },
                    })
                  }
                  placeholder="https://example.com/survey_thankyou.mp4"
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
              placeholder="Enter message (e.g. Thanks {{name}}, survey received!)..."
              className="w-full p-3 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none"
            />
          </div>
        </Card>

        {/* Step 3 Card */}
        <Card className="p-6 bg-white border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 font-extrabold flex items-center justify-center text-xs">
                3
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#0F172A]">
                  Step 3: Strategy Meeting Confirmation (Google Meet Link)
                </h3>
                <p className="text-[11px] text-gray-500 font-medium">
                  Triggered automatically when a lead books a strategy meeting date & time.
                </p>
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                Message Payload Type
              </label>
              <select
                value={config.step3.msg_type}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    step3: { ...config.step3, msg_type: e.target.value as any },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-bold text-gray-800 focus:outline-none"
              >
                <option value="text">📝 Text Only</option>
                <option value="image">🖼️ Image + Caption</option>
                <option value="video">📹 Video + Caption</option>
              </select>
            </div>

            {config.step3.msg_type !== 'text' && (
              <div className="md:col-span-2">
                <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
                  Media URL (Direct Link to Video/Image Payload)
                </label>
                <input
                  type="url"
                  value={config.step3.media_url || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      step3: { ...config.step3, media_url: e.target.value },
                    })
                  }
                  placeholder="https://example.com/meeting_confirmation_video.mp4"
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
          <h3 className="font-bold text-sm text-[#0F172A]">Live Evolution API & Meta CAPI Tester</h3>
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
              <span>{isTesting ? 'Sending...' : 'Send Live Test Triggers 🚀'}</span>
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

      {/* 4. Real-time Dispatch & Meta Conversion Logs Table */}
      <Card className="p-6 bg-white border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-sm text-[#0F172A]">
                Dispatch & Meta Conversion Logs
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                Live audit trail of all WhatsApp dispatches and Meta CAPI conversion events.
              </p>
            </div>
          </div>

          <button
            onClick={fetchLogs}
            disabled={isLoadingLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
            <span>Refresh Logs</span>
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-400 font-medium border border-dashed border-gray-200 rounded-xl">
            No dispatch logs recorded yet. Run a test message or submit a funnel step to see live logs.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                  <th className="p-3">Time</th>
                  <th className="p-3">Trigger Type</th>
                  <th className="p-3">Step</th>
                  <th className="p-3">Lead Info</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((lg) => (
                  <tr key={lg.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                      {new Date(lg.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="p-3">
                      {lg.trigger_type === 'meta_capi' ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold flex items-center gap-1 w-fit">
                          <Share2 className="w-3 h-3 text-blue-600" />
                          Meta CAPI
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold flex items-center gap-1 w-fit">
                          <Smartphone className="w-3 h-3 text-emerald-600" />
                          WhatsApp
                        </span>
                      )}
                    </td>

                    <td className="p-3 font-bold text-gray-800 text-[11px]">
                      {lg.funnel_step === 'step1' || lg.funnel_step === 'step1_contact'
                        ? 'Step 1 (Contact)'
                        : lg.funnel_step === 'step2' || lg.funnel_step === 'survey_completed'
                        ? 'Step 2 (Survey)'
                        : 'Step 3 (Meeting)'}
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-gray-900">{lg.lead_name || 'Visitor'}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{lg.lead_phone || '--'}</div>
                    </td>

                    <td className="p-3">
                      {lg.status === 'success' ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          SUCCESS (200 OK)
                        </span>
                      ) : lg.status === 'ignored' ? (
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-bold text-[10px]">
                          DISABLED / IGNORED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px]">
                          FAILED
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedPayloadLog(lg)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-[11px] border border-indigo-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Payload</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Log Payload Modal */}
      {selectedPayloadLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg border border-gray-200 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-[#0F172A]">
                  Dispatch Payload & Response Audit
                </h3>
              </div>
              <button
                onClick={() => setSelectedPayloadLog(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              <div>
                <h4 className="font-bold text-gray-700 uppercase text-[11px] mb-1">
                  Request Payload:
                </h4>
                <pre className="p-3 rounded-xl bg-gray-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedPayloadLog.request_payload, null, 2) || 'None'}
                </pre>
              </div>

              <div>
                <h4 className="font-bold text-gray-700 uppercase text-[11px] mb-1">
                  Response Payload:
                </h4>
                <pre className="p-3 rounded-xl bg-gray-900 text-blue-400 font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedPayloadLog.response_payload, null, 2) || 'None'}
                </pre>
              </div>

              {selectedPayloadLog.error_message && (
                <div>
                  <h4 className="font-bold text-rose-700 uppercase text-[11px] mb-1">
                    Error Message:
                  </h4>
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold">
                    {selectedPayloadLog.error_message}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t shrink-0">
              <button
                onClick={() => setSelectedPayloadLog(null)}
                className="px-5 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
