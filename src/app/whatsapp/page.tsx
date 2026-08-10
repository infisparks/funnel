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
} from 'lucide-react';

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

  // Fetch workspace whatsapp_config
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
          message: result.error || 'Failed to dispatch test message.',
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
        title="WhatsApp Automation Studio"
        subtitle="Automatic WhatsApp messaging triggers for Step 1 Contact, Step 2 Survey, and Step 3 Strategy Calls via Evolution API."
        actions={
          <Button
            variant="primary"
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleSaveConfig}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
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

      {/* Global Credentials & Instance Settings */}
      <Card className="p-6 bg-white space-y-4 border border-[#E2E8F0] shadow-2xs">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Key className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-sm text-[#0F172A]">Evolution API Instance Credentials</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
              Evolution API URL
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50">
              <Globe className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={config.evolution_api_url}
                onChange={(e) => setConfig({ ...config, evolution_api_url: e.target.value })}
                className="w-full bg-transparent font-mono text-gray-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1 text-[11px]">
              API Key (Header Authorization)
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50">
              <Key className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={config.evolution_apikey}
                onChange={(e) => setConfig({ ...config, evolution_apikey: e.target.value })}
                className="w-full bg-transparent font-mono text-gray-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-indigo-700 uppercase mb-1 text-[11px]">
              Active Sender Instance Name *
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-indigo-300 bg-indigo-50/50">
              <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
              <input
                type="text"
                required
                value={config.instance_name}
                onChange={(e) => setConfig({ ...config, instance_name: e.target.value })}
                placeholder="e.g. instance1"
                className="w-full bg-transparent font-bold text-indigo-950 focus:outline-none"
              />
            </div>
          </div>
        </div>
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
    </MainLayout>
  );
}
