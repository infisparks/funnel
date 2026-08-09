'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import {
  Code2,
  X,
  Save,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  FileCode,
  CheckCircle2,
  ClipboardPaste,
  CheckSquare,
  Trash2,
} from 'lucide-react';
import { DEFAULT_LANDING_HTML } from '@/lib/defaultLandingHtml';
import { Button } from '../ui/Button';

interface HtmlCodeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlCode: string;
  onSave: (newCode: string) => void;
}

export function HtmlCodeEditorModal({
  isOpen,
  onClose,
  htmlCode,
  onSave,
}: HtmlCodeEditorModalProps) {
  const { accentColor } = useTheme();
  const [code, setCode] = useState(htmlCode);
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync state when htmlCode prop changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCode(htmlCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.select();
        }
      }, 100);
    }
  }, [isOpen, htmlCode]);

  if (!isOpen) return null;

  // 1-Click Select All Code (Ctrl + A helper)
  const handleSelectAll = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  };

  // 1-Click Clipboard Paste (Ctrl + V helper)
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setCode(text);
        setPasted(true);
        setTimeout(() => setPasted(false), 2000);
      }
    } catch (err) {
      // Fallback: prompt user to paste directly in textarea
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (confirm('Clear current code in editor?')) {
      setCode('');
      if (textareaRef.current) textareaRef.current.focus();
    }
  };

  const handleReset = () => {
    if (confirm('Reset to standard high-converting landing page HTML template?')) {
      setCode(DEFAULT_LANDING_HTML);
    }
  };

  const handleSave = () => {
    onSave(code);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  // Keydown handler for keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      // Allow browser native select all
      e.stopPropagation();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      // Allow browser native paste
      e.stopPropagation();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Editor Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs"
              style={{ backgroundColor: accentColor.primary }}
            >
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#111827] flex items-center gap-2">
                <span>Landing Page HTML Code Studio</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                  style={{ backgroundColor: accentColor.light, color: accentColor.primary }}
                >
                  Live Sandbox
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Paste your custom HTML code. Use <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded font-mono text-[10px] text-gray-700">Ctrl+A</kbd> / <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded font-mono text-[10px] text-gray-700">Ctrl+V</kbd> or click the toolbar buttons.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-5 py-2.5 bg-[#F8FAFC] border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-gray-500 font-semibold">
            <FileCode className="w-4 h-4 text-indigo-500" />
            <span>index.html (HTML5 / Inline CSS / Vanilla JS supported)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1-Click Select All Button */}
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold cursor-pointer shadow-2xs"
              title="Select All Code (Ctrl + A / Cmd + A)"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Select All</span>
            </button>

            {/* 1-Click Paste Clipboard Button */}
            <button
              onClick={handlePasteClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold cursor-pointer shadow-2xs"
              title="Paste from Clipboard (Ctrl + V / Cmd + V)"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-emerald-600" />
              <span>{pasted ? 'Pasted!' : 'Paste Clipboard'}</span>
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>

            {/* Clear Button */}
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            {/* Reset Template */}
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
              <span>Reset Template</span>
            </button>
          </div>
        </div>

        {/* Code Editor Textarea */}
        <div className="flex-1 p-4 bg-[#0F172A] relative flex overflow-hidden">
          <textarea
            ref={textareaRef}
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="<!-- Paste your custom landing page HTML code here (Ctrl+V or click Paste Clipboard button above) -->"
            className="w-full h-full min-h-[380px] sm:min-h-[460px] bg-transparent text-emerald-300 font-mono text-xs sm:text-sm p-4 resize-none focus:outline-none leading-relaxed selection:bg-indigo-500 selection:text-white"
            spellCheck={false}
          />
        </div>

        {/* Editor Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Changes will apply directly to your live landing page URL & preview.</span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="md" onClick={onClose}>
              Cancel
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              leftIcon={savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            >
              {savedSuccess ? 'Saved & Rendered!' : 'Save & Render Landing Page'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
