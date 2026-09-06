'use client';

import React, { useState, useEffect } from 'react';
import { X, Zap, Clock, Trash2, RefreshCw, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button, Badge } from '../ui';

interface LeadGcpTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  organizationId?: string;
  onTaskCancelled?: () => void;
}

export function LeadGcpTasksModal({
  isOpen,
  onClose,
  lead,
  organizationId,
  onTaskCancelled,
}: LeadGcpTasksModalProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!lead?.id) return;
    setIsLoading(true);
    try {
      const orgParam = organizationId ? `organizationId=${encodeURIComponent(organizationId)}` : '';
      const leadParam = `leadId=${encodeURIComponent(lead.id)}`;
      const qs = [orgParam, leadParam].filter(Boolean).join('&');

      const res = await fetch(`/api/automations/tasks?${qs}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.tasks)) {
        // Filter strictly to scheduled / remaining tasks
        const remaining = data.tasks.filter((t: any) => t.status === 'scheduled');
        setTasks(remaining);
      } else {
        setTasks([]);
      }
    } catch (e) {
      console.error('Error fetching live GCP tasks for modal:', e);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && lead?.id) {
      fetchTasks();
    }
  }, [isOpen, lead?.id]);

  if (!isOpen || !lead) return null;

  const handleCancelTask = async (taskId: string, externalTaskId?: string) => {
    if (!confirm('Are you sure you want to cancel this pending automation directly from Google Cloud Tasks Queue?')) {
      return;
    }

    setCancellingId(taskId);
    try {
      const res = await fetch('/api/tasks/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          gcpTaskName: externalTaskId || taskId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice('Task successfully removed directly from Google Cloud Tasks! 🗑️');
        setTimeout(() => setActionNotice(null), 3500);
        // Refresh local list
        setTasks((prev) => prev.filter((t) => t.id !== taskId && t.external_task_id !== externalTaskId));
        if (onTaskCancelled) onTaskCancelled();
      } else {
        alert(data.error || 'Failed to cancel task.');
      }
    } catch (e: any) {
      alert(e.message || 'Error cancelling task.');
    } finally {
      setCancellingId(null);
    }
  };

  const [tickerNow, setTickerNow] = useState<number>(Date.now());

  // 1-second live running countdown ticker
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTickerNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Auto-refresh when any task countdown reaches 0
  useEffect(() => {
    if (!isOpen || tasks.length === 0) return;
    const hasExecutingTask = tasks.some((t) => {
      const ms = new Date(t.scheduled_for).getTime() - tickerNow;
      return ms <= 0 && ms > -7000;
    });
    if (hasExecutingTask) {
      const timer = setTimeout(() => {
        fetchTasks();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [tickerNow, tasks, isOpen]);

  const getCountdown = (scheduledFor: string, currentTimestamp: number = tickerNow) => {
    if (!scheduledFor) return 'Scheduled';
    const targetMs = new Date(scheduledFor).getTime();
    if (isNaN(targetMs)) return 'Scheduled';
    const diffMs = targetMs - currentTimestamp;
    if (diffMs <= 0) return '⚡ Executing now...';

    const totalSec = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    if (days > 0) {
      return `⏳ ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
    if (hours > 0) {
      return `⏳ ${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }
    if (minutes > 0) {
      return `⏳ ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }
    return `⚡ ${seconds}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs border border-amber-200">
              <Zap className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#111827]">
                  Live Google Cloud Tasks Queue
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ● GCP LIVE
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Remaining rule automations scheduled for <span className="font-semibold text-gray-900">{lead.name || 'Lead'}</span> ({lead.phone || 'No phone'})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={fetchTasks}
              disabled={isLoading}
              title="Refresh from GCP"
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Notice Alert */}
        {actionNotice && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Body: List of Remaining Scheduled Automations */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2.5 text-gray-400">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
              <p className="text-xs font-medium">Querying live tasks from Google Cloud Tasks...</p>
            </div>
          ) : tasks.length > 0 ? (
            tasks.map((task, idx) => {
              const rule = task.stage_automation_rules || {};
              const cleanMsg = (rule.template || 'Automated WhatsApp Message')
                .replace(/\{\{name\}\}/gi, lead.name || 'there')
                .replace(/\{\{phone\}\}/gi, lead.phone || '')
                .replace(/\{\{email\}\}/gi, lead.email || '');

              const scheduledDate = new Date(task.scheduled_for);
              const formattedTime = scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const formattedDate = scheduledDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <div
                  key={task.id}
                  className="p-4 rounded-xl border border-amber-200/90 bg-[#FFFDF7] space-y-2.5 shadow-2xs hover:border-amber-300 transition-all"
                >
                  {/* Task Top Info */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-gray-900 leading-tight">
                          {rule.title || 'Stage Rule Automation'}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                          <span className="font-medium">Channel: WhatsApp</span>
                          <span>•</span>
                          <span className="font-mono tabular-nums font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">
                            {getCountdown(task.scheduled_for, tickerNow)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={cancellingId === task.id}
                      onClick={() => handleCancelTask(task.id, task.external_task_id)}
                      className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      {cancellingId === task.id ? 'Cancelling...' : 'Cancel in GCP ✕'}
                    </button>
                  </div>

                  {/* WhatsApp Message Preview */}
                  <div className="p-3 rounded-lg bg-white border border-amber-100 text-xs space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Pending WhatsApp Message:</span>
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap font-medium leading-relaxed">
                      {cleanMsg}
                    </p>
                  </div>

                  {/* Footer metadata: Exact Send Time & Cloud Task ID */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-gray-400 gap-1 pt-1 border-t border-amber-100">
                    <span className="font-semibold text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Send Time: {formattedDate} at {formattedTime}
                    </span>
                    {task.external_task_id && (
                      <span className="font-mono text-[9px] text-gray-400 truncate max-w-xs" title={task.external_task_id}>
                        GCP: {task.external_task_id.split('/').pop()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-800">No Pending GCP Automations</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                All scheduled rule follow-ups for this lead have either been executed, moved, or cancelled.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
          <span className="text-[11px] text-gray-500 font-medium">
            {tasks.length} automation{tasks.length === 1 ? '' : 's'} remaining in queue
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
