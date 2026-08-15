'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { LANDING_PAGE_TEMPLATES, LandingTemplate } from '@/lib/landingTemplates';

export default function TemplatesPage() {
  const router = useRouter();
  const { workspace } = useAuth();

  const [templates, setTemplates] = useState<LandingTemplate[]>(LANDING_PAGE_TEMPLATES);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [previewTemplate, setPreviewTemplate] = useState<LandingTemplate | null>(null);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
        // Fallback to default templates
        setTemplates(LANDING_PAGE_TEMPLATES);
      }
    } catch (err) {
      console.warn('Error fetching Supabase templates:', err);
      setTemplates(LANDING_PAGE_TEMPLATES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplatesFromSupabase();
  }, []);

  const categories = ['All', 'Consulting', 'SaaS', 'Coaching', 'Real Estate', 'Healthcare', 'E-Commerce'];

  const filteredTemplates = templates.filter((tpl) => {
    const matchesCat = selectedCategory === 'All' || tpl.category === selectedCategory;
    const matchesQuery =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // 1-Click Apply Template to Active Workspace
  const handleApplyTemplate = async (template: LandingTemplate) => {
    try {
      if (workspace?.id) {
        await supabase
          .from('funnel_workspaces')
          .update({
            landing_html: template.html,
            trigger_buttons: template.triggerButtons,
            updated_at: new Date().toISOString(),
          })
          .eq('id', workspace.id);
      }
      setAppliedToast(`🎉 Applied "${template.name}" to your workspace landing page!`);
      setTimeout(() => setAppliedToast(''), 4500);
    } catch (err: any) {
      alert(`Error applying template: ${err.message}`);
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

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/landing')}
              leftIcon={<Globe className="w-3.5 h-3.5" />}
            >
              View Active Landing Page
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              ➕ Add New Template
            </Button>
          </div>
        </div>

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

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="group bg-white rounded-3xl border border-gray-200 hover:border-indigo-400 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-xl hover:-translate-y-1"
            >
              {/* Mini Live Page Preview Thumbnail */}
              <div
                className="relative w-full h-52 bg-slate-900/5 overflow-hidden border-b border-gray-200/80 cursor-pointer group/thumb"
                onClick={() => setPreviewTemplate(template)}
                title="Click to open full page preview"
              >
                <div className="absolute inset-0 origin-top-left scale-[0.32] w-[312.5%] h-[312.5%] pointer-events-none select-none">
                  <iframe
                    srcDoc={template.html}
                    title={template.name}
                    className="w-full h-full border-0 bg-white"
                    tabIndex={-1}
                    sandbox="allow-same-origin"
                  />
                </div>

                {/* Hover Fullscreen Prompt */}
                <div className="absolute inset-0 bg-indigo-950/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-2xs">
                  <Eye className="w-4.5 h-4.5" />
                  <span>Click for Full Screen Preview 🔍</span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide border"
                    style={{
                      backgroundColor: `${template.accentColor}15`,
                      color: template.accentColor,
                      borderColor: `${template.accentColor}30`,
                    }}
                  >
                    {template.category}
                  </span>
                  <span className="text-[11px] text-gray-400 font-semibold">{template.badge}</span>
                </div>

                <div>
                  <h3
                    className="font-extrabold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors cursor-pointer"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    {template.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-1.5 pt-3 border-t border-gray-100">
                  {template.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(template)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-200/80 border border-gray-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Full Preview
                </button>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApplyTemplate(template)}
                    leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  >
                    Use This Template ✨
                  </Button>

                  {template.id.startsWith('tpl_') && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(template.id, template.name)}
                      className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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

      {/* MODAL 1: Live Interactive Preview */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-6xl h-[90vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-3.5 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="font-extrabold text-base text-gray-900">{previewTemplate.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {previewTemplate.category}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('desktop')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      previewViewport === 'desktop'
                        ? 'bg-white shadow-2xs text-indigo-600'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('mobile')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      previewViewport === 'mobile'
                        ? 'bg-white shadow-2xs text-indigo-600'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile
                  </button>
                </div>

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
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 bg-gray-100 flex items-center justify-center overflow-auto">
              <div
                className={`bg-white rounded-2xl shadow-xl border border-gray-300 overflow-hidden transition-all duration-300 h-full ${
                  previewViewport === 'mobile' ? 'w-[375px] max-h-[720px]' : 'w-full h-full'
                }`}
              >
                <iframe
                  title="Live Preview"
                  srcDoc={previewTemplate.html}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
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
    </MainLayout>
  );
}
