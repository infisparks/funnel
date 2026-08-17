'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button, Badge, Card } from '@/components/ui';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import {
  Layers,
  Sparkles,
  Plus,
  Search,
  Eye,
  Check,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Monitor,
  Smartphone,
  X,
  Code,
  Globe,
  Palette,
  FileCode,
  Share2,
  Download,
} from 'lucide-react';
import { LANDING_PAGE_TEMPLATES, LandingTemplate } from '@/lib/landingTemplates';
import { ShareLandingModal } from '@/components/landing/ShareLandingModal';
import { ImportSharedDesignModal, SharedDesignData } from '@/components/landing/ImportSharedDesignModal';
import { Suspense } from 'react';

function TemplatesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, workspace, saveWorkspaceConfig } = useAuth();

  const [templates, setTemplates] = useState<LandingTemplate[]>(LANDING_PAGE_TEMPLATES);
  const [sharedWithMeList, setSharedWithMeList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [previewTemplate, setPreviewTemplate] = useState<LandingTemplate | null>(null);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importShareCode, setImportShareCode] = useState('');
  const [appliedToast, setAppliedToast] = useState('');

  // Add Template Form State
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newCategory, setNewCategory] = useState<'Consulting' | 'SaaS' | 'Coaching' | 'Real Estate' | 'Healthcare' | 'E-Commerce'>('Consulting');
  const [newBadge, setNewBadge] = useState('High Converting');
  const [newAccentColor, setNewAccentColor] = useState('#8146F0');
  const [newDescription, setNewDescription] = useState('');
  const [newTriggers, setNewTriggers] = useState('Claim Free Strategy Session, Get Started Free');
  const [newFeatures, setNewFeatures] = useState('Fast 30-Sec Booking, Live CRM Sync, Mobile Optimized');
  const [newHtml, setNewHtml] = useState('');
  const [isSavingNew, setIsSavingNew] = useState(false);

  // Fetch templates from Supabase
  const fetchTemplatesFromSupabase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('landing_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        const formatted: LandingTemplate[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          category: d.category,
          badge: d.badge || 'Custom Template',
          accentColor: d.accent_color || '#8146F0',
          description: d.description || '',
          triggerButtons: Array.isArray(d.trigger_buttons)
            ? d.trigger_buttons
            : typeof d.trigger_buttons === 'string'
            ? JSON.parse(d.trigger_buttons)
            : ['Get Started Free'],
          features: Array.isArray(d.features)
            ? d.features
            : typeof d.features === 'string'
            ? JSON.parse(d.features)
            : ['High Converting', 'Mobile Optimized'],
          html: d.html,
        }));
        setTemplates(formatted);
      } else {
        setTemplates(LANDING_PAGE_TEMPLATES);
      }
    } catch (err) {
      console.warn('Error fetching Supabase templates:', err);
      setTemplates(LANDING_PAGE_TEMPLATES);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch designs shared with current user's email
  const fetchSharedWithMe = async () => {
    try {
      let query = supabase.from('shared_landing_designs').select('*');
      if (user?.email) {
        query = query.or(`recipient_email.ilike.%${user.email.trim()}%,recipient_email.is.null`);
      }
      const { data } = await query.order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setSharedWithMeList(data);
      }
    } catch (err) {
      console.warn('Error fetching shared designs:', err);
    }
  };

  useEffect(() => {
    fetchTemplatesFromSupabase();
    fetchSharedWithMe();
  }, [user]);

  // Detect shared link query params (e.g. /templates?share_code=SLP-7X8K or ?import=SLP-7X8K)
  useEffect(() => {
    const code = searchParams.get('share_code') || searchParams.get('import');
    if (code) {
      setImportShareCode(code);
      setIsImportModalOpen(true);
    }
  }, [searchParams]);

  const categories = [
    'All',
    ...(sharedWithMeList.length > 0 ? [`Shared With Me (${sharedWithMeList.length})`] : ['Shared With Me']),
    'Consulting',
    'SaaS',
    'Coaching',
    'Real Estate',
    'Healthcare',
    'E-Commerce',
  ];

  const isSharedTab = selectedCategory.startsWith('Shared With Me');

  const filteredTemplates = templates.filter((tpl) => {
    const matchesCat = selectedCategory === 'All' || tpl.category === selectedCategory;
    const matchesQuery =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const filteredSharedList = sharedWithMeList.filter((item) => {
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sender_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sender_email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesQuery;
  });

  // 1-Click Apply Template to Active Workspace
  const handleApplyTemplate = async (template: LandingTemplate) => {
    try {
      await saveWorkspaceConfig({
        landing_html: template.html,
        trigger_buttons: template.triggerButtons,
      });
      setAppliedToast(`🎉 Applied "${template.name}" to your workspace landing page!`);
      setTimeout(() => setAppliedToast(''), 4500);
    } catch (err: any) {
      alert(`Error applying template: ${err.message}`);
    }
  };

  // 1-Click Apply Shared Design to Active Workspace
  const handleApplyImportedToWorkspace = async (design: SharedDesignData) => {
    try {
      await saveWorkspaceConfig({
        landing_html: design.landing_html,
        trigger_buttons: design.trigger_buttons || [],
        popup_theme: design.popup_theme || {},
        survey_questions: design.survey_questions || [],
      });
      setAppliedToast(`🎉 Imported "${design.title}" by ${design.creator_name || 'User'} into your live workspace!`);
      setTimeout(() => setAppliedToast(''), 4500);
    } catch (err) {
      console.error('Error applying imported design:', err);
    }
  };

  // 1-Click Save Shared Design into Templates Library Store
  const handleSaveImportedToTemplates = async (design: SharedDesignData) => {
    try {
      const newId = `tpl_${Date.now()}`;
      await supabase.from('landing_templates').insert({
        id: newId,
        name: design.title,
        category: design.category || 'Consulting',
        badge: 'Imported Shared Design',
        accent_color: design.popup_theme?.primaryColor || '#8146F0',
        description: `Shared by ${design.creator_name || 'User'}. ${design.description || ''}`,
        trigger_buttons: design.trigger_buttons || [],
        features: ['Imported Shared Design', 'High Converting', 'Mobile Ready'],
        html: design.landing_html,
      });
      await fetchTemplatesFromSupabase();
      setAppliedToast(`💾 Added "${design.title}" to your Templates Library!`);
      setTimeout(() => setAppliedToast(''), 4500);
    } catch (err) {
      console.error('Error saving template:', err);
    }
  };

  // Add New Custom Template into Supabase
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim() || !newHtml.trim()) {
      alert('Please provide template name and HTML code.');
      return;
    }

    setIsSavingNew(true);
    try {
      const templateId = `tpl_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const triggerList = newTriggers.split(',').map((t) => t.trim()).filter(Boolean);
      const featureList = newFeatures.split(',').map((f) => f.trim()).filter(Boolean);

      const payload = {
        id: templateId,
        name: newTemplateName.trim(),
        category: newCategory,
        badge: newBadge.trim() || 'Custom',
        accent_color: newAccentColor,
        description: newDescription.trim(),
        trigger_buttons: triggerList,
        features: featureList,
        html: newHtml.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('landing_templates').insert([payload]);
      if (error) throw error;

      alert('🎉 New Landing Page Template created & saved to Supabase successfully!');
      setIsAddModalOpen(false);
      // Reset form
      setNewTemplateName('');
      setNewDescription('');
      setNewHtml('');
      fetchTemplatesFromSupabase();
    } catch (err: any) {
      alert(`Failed to save template: ${err.message}`);
    } finally {
      setIsSavingNew(false);
    }
  };

  // Delete Template from Supabase
  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the template "${name}" from Supabase?`)) return;
    try {
      await supabase.from('landing_templates').delete().eq('id', id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      alert('Template removed from Supabase.');
    } catch (err: any) {
      alert(`Error deleting template: ${err.message}`);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shadow-2xs">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">
                  Landing Page Templates Library
                </h1>
                <p className="text-xs sm:text-sm text-[#6B7280]">
                  Browse, preview, and apply high-converting landing templates stored in Supabase with 1-click.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
              leftIcon={<Download className="w-3.5 h-3.5 text-indigo-600" />}
              className="bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 border-indigo-200 font-semibold"
            >
              📥 Import Shared Design
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShareModalOpen(true)}
              leftIcon={<Share2 className="w-3.5 h-3.5 text-indigo-600" />}
              className="bg-indigo-50/50 hover:bg-indigo-100/80 text-indigo-700 border-indigo-200"
            >
              Share Page & Design
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/landing')}
              leftIcon={<Globe className="w-3.5 h-3.5" />}
            >
              View Active Page
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              ➕ Add Template
            </Button>
          </div>
        </div>

        {/* Shared With Me Notification Banner */}
        {sharedWithMeList.length > 0 && !isSharedTab && (
          <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                🎁
              </div>
              <div>
                <h3 className="text-xs font-bold text-indigo-950">
                  You have {sharedWithMeList.length} landing page design(s) shared with you!
                </h3>
                <p className="text-[11px] text-indigo-700">
                  Other funnel users have granted you access to their landing page designs.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setSelectedCategory(categories[1])}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              className="text-xs font-semibold shrink-0"
            >
              View Shared Designs ({sharedWithMeList.length})
            </Button>
          </div>
        )}

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3.5 bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-2xs shadow-indigo-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 bg-gray-50/50 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        {/* SHARED WITH ME TEMPLATES GRID */}
        {isSharedTab && (
          <div>
            {filteredSharedList.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white rounded-3xl border border-gray-200 shadow-2xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
                  <Share2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  No Shared Designs Found Yet
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  When other funnel users share their landing page design with your email ({user?.email || 'registered email'}), they will automatically appear here for 1-click import.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSharedList.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white rounded-3xl border border-indigo-200 hover:border-indigo-500 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Screen Showcase */}
                    <div
                      className="relative w-full h-[380px] bg-gradient-to-b from-indigo-50/70 via-gray-100 to-slate-200/90 overflow-hidden cursor-pointer group/thumb flex items-center justify-center p-3 sm:p-4"
                      onClick={() =>
                        setPreviewTemplate({
                          id: item.id,
                          name: item.title,
                          category: item.category || 'Shared',
                          badge: 'Shared with You',
                          accentColor: item.popup_theme?.primaryColor || '#8146F0',
                          description: item.description || '',
                          triggerButtons: item.trigger_buttons || [],
                          features: ['Shared Design', '1-Click Import'],
                          html: item.landing_html,
                        })
                      }
                      title="Click for full preview"
                    >
                      <div className="w-[200px] h-[340px] rounded-[32px] bg-slate-950 p-2 shadow-2xl border-[3px] border-slate-700 relative flex flex-col shrink-0">
                        <div className="w-14 h-2.5 bg-slate-900 rounded-full mx-auto mb-1.5 shrink-0" />
                        <div className="w-full flex-1 rounded-[22px] overflow-hidden bg-white relative">
                          <div className="w-[375px] h-[600px] origin-top-left scale-[0.49] absolute inset-0 pointer-events-none select-none">
                            <iframe
                              srcDoc={item.landing_html}
                              title={item.title}
                              className="w-full h-full border-0 bg-white"
                              tabIndex={-1}
                              sandbox="allow-scripts allow-same-origin"
                            />
                          </div>
                        </div>
                        <div className="w-12 h-1 bg-white/40 rounded-full mx-auto mt-1.5 shrink-0" />
                      </div>

                      <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Shared with You</span>
                      </div>

                      <div className="absolute inset-0 bg-indigo-950/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-2xs">
                        <Smartphone className="w-4 h-4" />
                        <span>Click for Full Preview 📱</span>
                      </div>
                    </div>

                    {/* Footer Details */}
                    <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-3">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3
                            className="font-extrabold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors truncate cursor-pointer"
                            onClick={() =>
                              setPreviewTemplate({
                                id: item.id,
                                name: item.title,
                                category: (item.category as any) || 'Consulting',
                                badge: 'Shared with You',
                                accentColor: item.popup_theme?.primaryColor || '#8146F0',
                                description: item.description || '',
                                triggerButtons: item.trigger_buttons || [],
                                features: ['Shared Design', '1-Click Import'],
                                html: item.landing_html,
                              })
                            }
                          >
                            {item.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-1">
                          <span className="font-semibold text-indigo-700">
                            By {item.sender_name || item.sender_email || 'User'}
                          </span>
                          <span>•</span>
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewTemplate({
                              id: item.id,
                              name: item.title,
                              category: (item.category as any) || 'Consulting',
                              badge: 'Shared with You',
                              accentColor: item.popup_theme?.primaryColor || '#8146F0',
                              description: item.description || '',
                              triggerButtons: item.trigger_buttons || [],
                              features: ['Shared Design', '1-Click Import'],
                              html: item.landing_html,
                            })
                          }
                          className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Smartphone className="w-3.5 h-3.5" /> Preview
                        </button>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            handleApplyTemplate({
                              id: item.id,
                              name: item.title,
                              category: (item.category as any) || 'Consulting',
                              badge: 'Shared Design',
                              accentColor: item.popup_theme?.primaryColor || '#8146F0',
                              description: item.description || '',
                              triggerButtons: item.trigger_buttons || [],
                              features: ['Shared Design'],
                              html: item.landing_html,
                            })
                          }
                          leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                          className="flex-1 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          Import & Apply 🚀
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DEFAULT TEMPLATES GRID */}
        {!isSharedTab && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="group bg-white rounded-3xl border border-gray-200 hover:border-indigo-500 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-xl hover:-translate-y-1"
            >
              {/* Full Mobile Screen Showcase */}
              <div
                className="relative w-full h-[380px] bg-gradient-to-b from-slate-100 via-gray-100 to-slate-200/90 overflow-hidden cursor-pointer group/thumb flex items-center justify-center p-3 sm:p-4"
                onClick={() => setPreviewTemplate(template)}
                title="Click to view full mobile preview"
              >
                {/* Smartphone Device Body */}
                <div className="w-[200px] h-[340px] rounded-[32px] bg-slate-950 p-2 shadow-2xl border-[3px] border-slate-700 relative flex flex-col shrink-0">
                  {/* Dynamic Island Pill */}
                  <div className="w-14 h-2.5 bg-slate-900 rounded-full mx-auto mb-1.5 shrink-0" />

                  {/* Screen Frame with Live Render */}
                  <div className="w-full flex-1 rounded-[22px] overflow-hidden bg-white relative">
                    <div className="w-[375px] h-[600px] origin-top-left scale-[0.49] absolute inset-0 pointer-events-none select-none">
                      <iframe
                        srcDoc={template.html}
                        title={template.name}
                        className="w-full h-full border-0 bg-white"
                        tabIndex={-1}
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </div>
                  </div>

                  {/* Home Bar */}
                  <div className="w-12 h-1 bg-white/40 rounded-full mx-auto mt-1.5 shrink-0" />
                </div>

                {/* Hover Fullscreen Prompt */}
                <div className="absolute inset-0 bg-indigo-950/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-2xs">
                  <Smartphone className="w-4 h-4" />
                  <span>Click for Full Preview 📱</span>
                </div>
              </div>

              {/* Minimal Clean Footer: Title & Actions */}
              <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className="font-extrabold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors truncate cursor-pointer"
                    onClick={() => setPreviewTemplate(template)}
                    title={template.name}
                  >
                    {template.name}
                  </h3>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0"
                    style={{
                      backgroundColor: `${template.accentColor}15`,
                      color: template.accentColor,
                    }}
                  >
                    {template.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(template)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile Preview
                  </button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApplyTemplate(template)}
                    leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                    className="flex-1 py-2.5 text-xs font-bold"
                  >
                    Use Template ✨
                  </Button>

                  {template.id.startsWith('tpl_') && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(template.id, template.name)}
                      className="p-2.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                      title="Delete from Supabase"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Floating Success Toast */}
      {appliedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-indigo-700 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-indigo-300" />
          <span>{appliedToast}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/landing')}
            className="ml-2 bg-white text-indigo-900 border-none text-[11px]"
          >
            Open Landing Page →
          </Button>
        </div>
      )}

      {/* MODAL 1: Live Mobile Phone Preview (Dedicated Mobile View) */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-2xl h-[92vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-3.5 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">{previewTemplate.name}</h3>
                  <span className="text-[11px] text-gray-500">Mobile Conversion Preview</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handleApplyTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Use This Template ✨
                </Button>

                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Device Frame */}
            <div className="flex-1 p-4 sm:p-6 bg-slate-900/5 flex items-center justify-center overflow-auto">
              <div className="w-[375px] h-[680px] rounded-[42px] bg-slate-900 p-3 shadow-2xl relative border-4 border-slate-700 shrink-0">
                {/* Dynamic Island / Speaker Pill */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-950 rounded-full z-20" />

                {/* Screen */}
                <div className="w-full h-full rounded-[32px] overflow-hidden bg-white relative">
                  <iframe
                    title="Mobile Live Preview"
                    srcDoc={previewTemplate.html}
                    className="w-full h-full border-0 bg-white pt-5"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/40 rounded-full z-20 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add New Custom Template into Supabase */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] shadow-2xl space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Add New Landing Page Template</h3>
                  <p className="text-xs text-gray-500">Save custom HTML template directly into Supabase database.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Template Name *</label>
                  <input
                    type="text"
                    required
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="e.g. VIP Real Estate Lead Funnel"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-900 focus:outline-none bg-white"
                  >
                    <option value="Consulting">Consulting</option>
                    <option value="SaaS">SaaS</option>
                    <option value="Coaching">Coaching</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="E-Commerce">E-Commerce</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Targeted for consulting agencies to book 1-on-1 strategy sessions..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    placeholder="e.g. Popular • High Converting"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Accent Hex Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newAccentColor}
                      onChange={(e) => setNewAccentColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={newAccentColor}
                      onChange={(e) => setNewAccentColor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Trigger Buttons (comma separated)
                </label>
                <input
                  type="text"
                  value={newTriggers}
                  onChange={(e) => setNewTriggers(e.target.value)}
                  placeholder="Claim Free Trial, Book Strategy Call, CONTINUE TO SELECT SLOT"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Features (comma separated)
                </label>
                <input
                  type="text"
                  value={newFeatures}
                  onChange={(e) => setNewFeatures(e.target.value)}
                  placeholder="30-Sec Fast Booking, Social Proof Grid, WhatsApp Nurture"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-gray-700">Landing Page HTML Code *</label>
                  <button
                    type="button"
                    onClick={() => setNewHtml(LANDING_PAGE_TEMPLATES[0].html)}
                    className="text-xs text-indigo-600 hover:underline font-bold"
                  >
                    Load Starter Template Code
                  </button>
                </div>
                <textarea
                  rows={6}
                  required
                  value={newHtml}
                  onChange={(e) => setNewHtml(e.target.value)}
                  placeholder="<!DOCTYPE html><html>...</html>"
                  className="w-full p-3 font-mono text-[11px] rounded-xl border border-gray-300 text-gray-900 focus:outline-none bg-gray-50"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={isSavingNew} leftIcon={<Sparkles className="w-4 h-4" />}>
                  Save Template to Supabase 🚀
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ShareLandingModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        subdomain={workspace?.subdomain || ''}
        customDomain={workspace?.custom_domain || 'firstoption.cloud'}
        htmlCode={workspace?.landing_html || ''}
        triggerButtons={workspace?.trigger_buttons || []}
        popupTheme={workspace?.popup_theme || {}}
        surveyQuestions={workspace?.survey_questions || []}
      />

      <ImportSharedDesignModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        initialShareCode={importShareCode}
        onApplyToWorkspace={handleApplyImportedToWorkspace}
        onSaveToTemplateStore={handleSaveImportedToTemplates}
      />
    </MainLayout>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>Loading Templates Library...</span>
            </div>
          </div>
        </MainLayout>
      }
    >
      <TemplatesContent />
    </Suspense>
  );
}
