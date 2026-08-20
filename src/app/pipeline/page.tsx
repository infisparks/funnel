'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button, Card, Badge, SectionHeader } from '@/components/ui';
import { useClientDrawer } from '@/components/client/ClientDrawerContext';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import {
  Plus,
  Phone,
  MessageCircle,
  Lock,
  Trash2,
  RotateCcw,
  Settings,
  X,
  Sparkles,
  Calendar as CalendarIcon,
  Video,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';

interface Stage {
  id: string;
  name: string;
  color: string;
  is_default?: boolean;
  is_deleted?: boolean;
}

const DEFAULT_STAGES: Stage[] = [
  { id: 'step1_contact', name: '1. Contact Form Captured', color: '#3B82F6', is_default: true, is_deleted: false },
  { id: 'survey_completed', name: '2. Survey Qualified', color: '#8B5CF6', is_default: true, is_deleted: false },
  { id: 'meeting_booked', name: '3. Meeting Booked', color: '#10B981', is_default: true, is_deleted: false },
  { id: 'meeting_missed', name: '4. Meeting Missed', color: '#EF4444', is_default: true, is_deleted: false },
  { id: 'closed_won', name: '5. Closed Won', color: '#6366F1', is_default: true, is_deleted: false },
];

export default function PipelinePage() {
  const { user, workspace } = useAuth();
  const { openClientDrawer } = useClientDrawer();
  const boardRef = useRef<HTMLDivElement>(null);

  const [stages, setStages] = useState<Stage[]>(DEFAULT_STAGES);
  const [leads, setLeads] = useState<any[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddStageOpen, setIsAddStageOpen] = useState(false);
  const [isManageStagesOpen, setIsManageStagesOpen] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('#06B6D4');
  const [isSavingStage, setIsSavingStage] = useState(false);

  // Drag and Drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  // Horizontal Slide / Scroll Controls for PC
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (boardRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = boardRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleSlideScroll = (direction: 'left' | 'right') => {
    if (boardRef.current) {
      const scrollAmount = 340;
      boardRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScrollability, 350);
    }
  };

  // Enable horizontal mouse wheel scroll on PC
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      const innerScrollable = target.closest('.col-leads-container') as HTMLElement | null;

      // If hovering over an inner column with cards, let vertical wheel scroll up and down naturally
      if (innerScrollable) {
        const canScrollUp = innerScrollable.scrollTop > 0 && e.deltaY < 0;
        const canScrollDown =
          innerScrollable.scrollTop < innerScrollable.scrollHeight - innerScrollable.clientHeight &&
          e.deltaY > 0;
        if (canScrollUp || canScrollDown) {
          return; // Allow natural up/down scrolling
        }
      }

      // If hovering over empty board background or column header, scroll board horizontally
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && !e.shiftKey) {
        if (!innerScrollable) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
          checkScrollability();
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('scroll', checkScrollability, { passive: true });
    window.addEventListener('resize', checkScrollability);

    checkScrollability();

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [stages]);

  // Load Workspace Stages & Real Supabase Leads
  const fetchData = async () => {
    if (!user) {
      setLeads([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      if (workspace?.id) {
        setWorkspaceId(workspace.id);
      }

      const { data: wsData } = await supabase
        .from('funnel_workspaces')
        .select('id, pipeline_stages')
        .eq('user_id', user.id)
        .maybeSingle();

      if (wsData?.id) setWorkspaceId(wsData.id);

      if (wsData?.pipeline_stages && Array.isArray(wsData.pipeline_stages) && wsData.pipeline_stages.length > 0) {
        setStages(wsData.pipeline_stages);
      } else {
        setStages(DEFAULT_STAGES);
      }

      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (wsData?.id || workspace?.id) {
        const activeWsId = wsData?.id || workspace?.id;
        query = query.or(`user_id.eq.${user.id},funnel_id.eq.${activeWsId}`);
      } else {
        query = query.eq('user_id', user.id);
      }

      const { data: leadRows } = await query;
      setLeads(leadRows || []);

      if (leadRows && leadRows.length > 0) {
        const needsHealing = leadRows.filter(
          (l) => (l.meeting_date || l.meeting_time) && l.step_progress === 'survey_completed'
        );
        if (needsHealing.length > 0) {
          (async () => {
            try {
              const idsToUpdate = needsHealing.map((l) => l.id);
              await supabase.from('leads').update({ step_progress: 'meeting_booked' }).in('id', idsToUpdate);
            } catch (e) {}
          })();
        }
      }
    } catch (err) {
      console.error('Error fetching pipeline data:', err);
    } finally {
      setIsLoading(false);
      setTimeout(checkScrollability, 200);
    }
  };

  const getLeadStage = (lead: any): string => {
    if (lead.step_progress && !['step1_contact', 'survey_completed', 'meeting_booked', 'Not Qualified', 'Qualified'].includes(lead.step_progress)) {
      return lead.step_progress;
    }
    if (lead.step_progress === 'meeting_booked' || Boolean(lead.meeting_date || lead.meeting_time)) {
      return 'meeting_booked';
    }
    if (
      lead.step_progress === 'survey_completed' ||
      (lead.survey_responses && Object.keys(lead.survey_responses).length > 0)
    ) {
      return 'survey_completed';
    }
    return 'step1_contact';
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, workspace]);

  const saveStagesToWorkspace = async (updatedStages: Stage[]) => {
    setStages(updatedStages);
    try {
      if (workspaceId) {
        await supabase
          .from('funnel_workspaces')
          .update({ pipeline_stages: updatedStages })
          .eq('id', workspaceId);
      } else {
        const { data: wsData } = await supabase
          .from('funnel_workspaces')
          .select('id')
          .limit(1)
          .maybeSingle();

        if (wsData?.id) {
          setWorkspaceId(wsData.id);
          await supabase
            .from('funnel_workspaces')
            .update({ pipeline_stages: updatedStages })
            .eq('id', wsData.id);
        }
      }
    } catch (err) {
      console.error('Error saving stages:', err);
    }
  };

  const handleAddCustomStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName.trim()) return;

    setIsSavingStage(true);
    const newId = `custom_${Date.now()}`;
    const newStageObj: Stage = {
      id: newId,
      name: newStageName.trim(),
      color: newStageColor,
      is_default: false,
      is_deleted: false,
    };

    const updated = [...stages, newStageObj];
    await saveStagesToWorkspace(updated);
    setNewStageName('');
    setIsAddStageOpen(false);
    setIsSavingStage(false);
  };

  const handleSoftDeleteStage = async (stageId: string) => {
    const updated = stages.map((stg) => {
      if (stg.id === stageId && !stg.is_default) {
        return { ...stg, is_deleted: true };
      }
      return stg;
    });
    await saveStagesToWorkspace(updated);
  };

  const handleRestoreStage = async (stageId: string) => {
    const updated = stages.map((stg) => {
      if (stg.id === stageId) {
        return { ...stg, is_deleted: false };
      }
      return stg;
    });
    await saveStagesToWorkspace(updated);
  };

  const handleMoveLeadStage = async (leadId: string | number, newStageId: string) => {
    try {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, step_progress: newStageId } : l))
      );
      await supabase.from('leads').update({ step_progress: newStageId }).eq('id', leadId);
    } catch (err) {
      console.error('Error moving lead stage:', err);
    }
  };

  const activeStages = stages.filter((stg) => !stg.is_deleted);
  const deletedStages = stages.filter((stg) => stg.is_deleted);

  return (
    <MainLayout>
      <SectionHeader
        title="Pipeline Stage Board"
        subtitle="Visual sales stages, deal momentum, and stage conversions."
        actions={
          <div className="flex items-center gap-2">
            {/* PC Slide Scroll Navigation Arrows */}
            <div className="flex items-center bg-white border border-[#E5E7EB] rounded-xl p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => handleSlideScroll('left')}
                disabled={!canScrollLeft}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  canScrollLeft
                    ? 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                title="Slide Board Left (PC)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-4 bg-gray-200" />
              <button
                type="button"
                onClick={() => handleSlideScroll('right')}
                disabled={!canScrollRight}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  canScrollRight
                    ? 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                title="Slide Board Right (PC)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsManageStagesOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-50 text-gray-700 shadow-2xs transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-gray-500" />
              <span>Manage Stages</span>
            </button>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddStageOpen(true)}
              className="text-xs font-semibold"
            >
              + Add Stage
            </Button>
          </div>
        }
      />

      {/* Board Column Horizontal Scrolling Container */}
      <div
        ref={boardRef}
        className="flex gap-4 overflow-x-auto pb-6 pt-1 scroll-smooth select-none"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E1 #F1F5F9',
        }}
      >
        {activeStages.map((col) => {
          const colLeads = leads.filter((lead) => {
            const effectiveStage = getLeadStage(lead);
            return effectiveStage === col.id;
          });

          const totalColValue = colLeads.reduce((acc, lead) => {
            const valStr = lead.deal_value || lead.dealValue || '0';
            const num = parseInt(String(valStr).replace(/[^0-9]/g, ''), 10) || 0;
            return acc + num;
          }, 0);

          const isDragOver = dragOverColId === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dragOverColId !== col.id) setDragOverColId(col.id);
              }}
              onDragLeave={() => setDragOverColId(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverColId(null);
                const droppedLeadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
                if (droppedLeadId) {
                  handleMoveLeadStage(droppedLeadId, col.id);
                }
              }}
              className={`w-[270px] sm:w-[290px] shrink-0 flex flex-col rounded-2xl p-3 space-y-2.5 transition-all ${
                isDragOver
                  ? 'bg-indigo-50/70 border-2 border-dashed border-indigo-500 shadow-md'
                  : 'bg-[#F8FAFC] border border-[#E2E8F0] shadow-2xs'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: col.color }}
                  />
                  <h3 className="font-bold text-xs text-[#0F172A] truncate tracking-tight">{col.name}</h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white border border-[#E2E8F0] text-[#64748B] shrink-0">
                    {colLeads.length}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-indigo-600 font-mono shrink-0">
                  ₹{totalColValue > 0 ? totalColValue.toLocaleString('en-IN') : '0'}
                </span>
              </div>

              {/* Column Lead Cards Container (Compact & Clean) */}
              <div className="col-leads-container space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-230px)] pr-0.5 scrollbar-thin">
                {colLeads.length === 0 ? (
                  <div className="py-6 px-3 rounded-xl border border-dashed border-[#E2E8F0] text-center text-[11px] text-[#94A3B8] font-medium bg-white/40">
                    Drag & drop leads here
                  </div>
                ) : (
                  colLeads.map((lead) => {
                    const initials = (lead.name || 'Visitor')
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase();

                    const hasSurvey = lead.survey_responses && Object.keys(lead.survey_responses).length > 0;
                    const isBeingDragged = String(draggedLeadId) === String(lead.id);
                    const meetLink = lead.google_meet_url || lead.googleMeetUrl;

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', String(lead.id));
                          setDraggedLeadId(String(lead.id));
                        }}
                        onDragEnd={() => {
                          setDraggedLeadId(null);
                          setDragOverColId(null);
                        }}
                        onClick={() => openClientDrawer(lead)}
                        className={`bg-white border border-[#E2E8F0] hover:border-indigo-200 shadow-2xs hover:shadow-sm rounded-xl p-2.5 space-y-2 cursor-pointer transition-all active:cursor-grabbing group ${
                          isBeingDragged ? 'opacity-40 border-dashed border-indigo-400' : ''
                        }`}
                      >
                        {/* Compact Card Header: Avatar, Name & Phone + Action Icons */}
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0 shadow-2xs">
                              {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-xs text-[#0F172A] leading-tight group-hover:text-indigo-600 transition-colors truncate">
                                {lead.name || 'Lead'}
                              </h4>
                              <p className="text-[10px] text-[#64748B] truncate mt-0.5">
                                {lead.phone || lead.email || 'No contact'}
                              </p>
                            </div>
                          </div>

                          {/* Quick Action Icons: Call & WhatsApp */}
                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            {lead.phone && (
                              <>
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="p-1 rounded-md bg-[#F1F5F9] hover:bg-indigo-50 text-[#475569] hover:text-indigo-600 transition-colors"
                                  title="Call Lead"
                                >
                                  <Phone className="w-2.5 h-2.5" />
                                </a>
                                <a
                                  href={`https://wa.me/${String(lead.phone).replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
                                  title="WhatsApp Lead"
                                >
                                  <MessageCircle className="w-2.5 h-2.5" />
                                </a>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Inline Badges: Survey, Meeting Slot & Meet Link (Compact Chips) */}
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          {/* Survey Chip */}
                          {hasSurvey && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/70">
                              <Sparkles className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                              <span>{Object.keys(lead.survey_responses).length} Qs</span>
                            </span>
                          )}

                          {/* Meeting Date Chip */}
                          {lead.meeting_date && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 truncate max-w-full">
                              <CalendarIcon className="w-2.5 h-2.5 text-indigo-600 shrink-0" />
                              <span className="truncate">
                                {lead.meeting_date} {lead.meeting_time ? `@ ${lead.meeting_time}` : ''}
                              </span>
                            </span>
                          )}

                          {/* Join Video Meet Link Chip */}
                          {meetLink && (
                            <a
                              href={meetLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[9px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-1.5 py-0.5 rounded transition-colors shadow-2xs ml-auto"
                              title="Join Video Call"
                            >
                              <Video className="w-2.5 h-2.5 shrink-0" />
                              <span>Join Meet</span>
                            </a>
                          )}
                        </div>

                        {/* Card Bottom Row: Deal Value & Staff Notes count */}
                        {(lead.deal_value || (Array.isArray(lead.staff_notes) && lead.staff_notes.length > 0)) && (
                          <div className="flex items-center justify-between pt-1 border-t border-[#F1F5F9] text-[10px]">
                            {lead.deal_value ? (
                              <span className="font-bold text-indigo-600">
                                ₹{lead.deal_value}
                              </span>
                            ) : <div />}

                            {Array.isArray(lead.staff_notes) && lead.staff_notes.length > 0 && (
                              <span className="text-gray-400 font-medium">
                                📝 {lead.staff_notes.length} notes
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal 1: Add Custom Stage */}
      {isAddStageOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-gray-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-[#0F172A]">Add Custom Pipeline Stage</h3>
              </div>
              <button
                onClick={() => setIsAddStageOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomStage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Stage Name *
                </label>
                <input
                  type="text"
                  required
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  placeholder="e.g. Proposal Sent"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Column Color Tag
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newStageColor}
                    onChange={(e) => setNewStageColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-gray-300 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-gray-600 font-bold">{newStageColor}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddStageOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingStage}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
                >
                  {isSavingStage ? 'Saving...' : 'Add Stage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Manage Stages & Restore Soft-Deleted Stages */}
      {isManageStagesOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg border border-gray-200 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-[#0F172A]">
                  Manage Pipeline Stages (Core & Custom)
                </h3>
              </div>
              <button
                onClick={() => setIsManageStagesOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              <div>
                <h4 className="text-xs font-extrabold uppercase text-gray-500 mb-2 tracking-wider">
                  Active Pipeline Stages ({activeStages.length})
                </h4>
                <div className="space-y-2">
                  {activeStages.map((stg) => (
                    <div
                      key={stg.id}
                      className="p-3 rounded-xl border border-gray-200 bg-[#F8FAFC] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: stg.color }}
                        />
                        <span className="font-bold text-gray-900">{stg.name}</span>
                        {stg.is_default && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-indigo-600" />
                            COMPULSORY DEFAULT
                          </span>
                        )}
                      </div>

                      {stg.is_default ? (
                        <span className="text-[10px] text-gray-400 font-semibold italic">
                          Non-Deletable
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSoftDeleteStage(stg.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-extrabold uppercase text-gray-500 mb-2 tracking-wider">
                  Soft-Deleted Stages ({deletedStages.length})
                </h4>
                {deletedStages.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No deleted stages.</p>
                ) : (
                  <div className="space-y-2">
                    {deletedStages.map((stg) => (
                      <div
                        key={stg.id}
                        className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full opacity-60"
                            style={{ backgroundColor: stg.color }}
                          />
                          <span className="font-bold text-gray-700 line-through">{stg.name}</span>
                        </div>

                        <button
                          onClick={() => handleRestoreStage(stg.id)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore Stage</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t shrink-0">
              <button
                onClick={() => setIsManageStagesOpen(false)}
                className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs"
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
