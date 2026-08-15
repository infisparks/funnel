'use client';

import React, { useState, useEffect } from 'react';
import { Button, Badge } from '@/components/ui';
import {
  Sparkles,
  X,
  Check,
  Eye,
  ArrowRight,
  Layers,
  Search,
  Monitor,
  Smartphone,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { LANDING_PAGE_TEMPLATES, LandingTemplate } from '@/lib/landingTemplates';
import { supabase } from '@/lib/supabaseClient';

interface LandingTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: LandingTemplate) => void;
  currentTemplateId?: string;
}

export function LandingTemplateModal({
  isOpen,
  onClose,
  onSelectTemplate,
  currentTemplateId,
}: LandingTemplateModalProps) {
  const [templates, setTemplates] = useState<LandingTemplate[]>(LANDING_PAGE_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewTemplate, setPreviewTemplate] = useState<LandingTemplate | null>(null);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [appliedId, setAppliedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const loadSupabaseTemplates = async () => {
        try {
          const { data } = await supabase
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
          }
        } catch (err) {
          console.warn('Could not load Supabase templates, using local fallback');
        }
      };
      loadSupabaseTemplates();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = ['All', 'Consulting', 'SaaS', 'Coaching', 'Real Estate', 'Healthcare', 'E-Commerce'];

  const filteredTemplates = templates.filter((tpl) => {
    const matchesCategory = selectedCategory === 'All' || tpl.category === selectedCategory;
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApply = (tpl: LandingTemplate) => {
    setAppliedId(tpl.id);
    onSelectTemplate(tpl);
    setTimeout(() => {
      setAppliedId(null);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="bg-white border border-[#E5E7EB] rounded-3xl w-full max-w-6xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0 bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <span>Landing Page Template Showcase</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                  {LANDING_PAGE_TEMPLATES.length} Ready-To-Use
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                Choose any pre-built, high-converting landing page template and apply it to your workspace with 1-click.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {previewTemplate ? (
          /* Live Preview Mode */
          <div className="flex-1 flex flex-col min-h-0 bg-gray-100">
            <div className="px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  ← Back to Library
                </button>
                <div className="border-l border-gray-200 pl-3">
                  <h3 className="font-extrabold text-sm text-gray-900">{previewTemplate.name}</h3>
                  <span className="text-[11px] text-gray-500">{previewTemplate.category}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('desktop')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
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
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
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
                  onClick={() => handleApply(previewTemplate)}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Use This Template ✨
                </Button>
              </div>
            </div>

            <div className="flex-1 p-4 flex items-center justify-center overflow-auto">
              <div
                className={`bg-white rounded-2xl shadow-xl border border-gray-300 overflow-hidden transition-all duration-300 h-full ${
                  previewViewport === 'mobile' ? 'w-[375px] max-h-[700px]' : 'w-full h-full'
                }`}
              >
                <iframe
                  title="Template Live Preview"
                  srcDoc={previewTemplate.html}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Template Gallery Grid */
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Filters and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
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

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search template name..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-300 text-xs text-gray-900 bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Template Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTemplates.map((template) => {
                const isSelected = currentTemplateId === template.id || appliedId === template.id;
                return (
                  <div
                    key={template.id}
                    className={`group bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md ${
                      isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {/* Visual Card Header */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border"
                          style={{
                            backgroundColor: `${template.accentColor}15`,
                            color: template.accentColor,
                            borderColor: `${template.accentColor}30`,
                          }}
                        >
                          {template.category}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">{template.badge}</span>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-base text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {template.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {template.description}
                        </p>
                      </div>

                      {/* Feature Bullet points */}
                      <div className="space-y-1.5 pt-2 border-t border-gray-100">
                        {template.features.map((feat) => (
                          <div key={feat} className="flex items-center gap-2 text-[11px] text-gray-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewTemplate(template)}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-200/80 border border-gray-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>

                      <Button
                        variant={isSelected ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleApply(template)}
                        leftIcon={isSelected ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                      >
                        {isSelected ? 'Applied ✓' : 'Use This Template ✨'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#E5E7EB] bg-gray-50/50 flex items-center justify-between shrink-0 text-xs text-gray-500">
          <span>
            💡 Applying a template will instantly update your landing page code & button triggers.
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
