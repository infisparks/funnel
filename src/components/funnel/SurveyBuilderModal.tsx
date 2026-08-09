'use client';

import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  X,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  ListOrdered,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface SurveyQuestion {
  id: string;
  label: string;
  options: string[];
  allowMultiple?: boolean;
}

interface SurveyBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: SurveyQuestion[];
  onSaveQuestions: (questions: SurveyQuestion[]) => void;
}

export function SurveyBuilderModal({
  isOpen,
  onClose,
  questions: initialQuestions,
  onSaveQuestions,
}: SurveyBuilderModalProps) {
  const { workspace, saveWorkspaceConfig } = useAuth();
  const [questions, setQuestions] = useState<SurveyQuestion[]>(
    initialQuestions && initialQuestions.length > 0
      ? initialQuestions
      : [
          {
            id: 'q1',
            label: 'Select Your Primary Industry',
            options: ['Service Business', 'Manufacturer / B2B', 'Medical / Clinic', 'E-commerce Store'],
            allowMultiple: false,
          },
          {
            id: 'q2',
            label: 'Which Growth Services Do You Need?',
            options: ['Funnel Building', 'WhatsApp CRM Automation', 'Meta Ads', 'Lead Nurturing'],
            allowMultiple: true,
          },
        ]
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    const newId = `q${Date.now()}`;
    setQuestions([
      ...questions,
      {
        id: newId,
        label: 'New Qualification Question',
        options: ['Option A', 'Option B'],
        allowMultiple: false,
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleQuestionLabelChange = (index: number, newLabel: string) => {
    const updated = [...questions];
    updated[index].label = newLabel;
    setQuestions(updated);
  };

  const handleToggleAllowMultiple = (index: number) => {
    const updated = [...questions];
    updated[index].allowMultiple = !updated[index].allowMultiple;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, newVal: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = newVal;
    setQuestions(updated);
  };

  const handleAddOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push(`New Option ${updated[qIndex].options.length + 1}`);
    setQuestions(updated);
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.splice(optIndex, 1);
    setQuestions(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const ok = await saveWorkspaceConfig({
      survey_questions: questions,
    });
    setIsSaving(false);

    if (ok) {
      setSaveSuccess(true);
      onSaveQuestions(questions);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-black font-bold flex items-center justify-center shadow-2xs">
              <ListOrdered className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#111827]">
                Custom Survey Form Builder (Popup Step 2)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Customize qualification survey questions and single / multi-select tick boxes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {saveSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Survey questions saved to Supabase (funnel_workspaces table)! ✅</span>
            </div>
          )}

          <div className="space-y-4">
            {questions.map((q, qIdx) => (
              <div key={q.id || qIdx} className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Question #{qIdx + 1} Title
                    </label>
                    <input
                      type="text"
                      value={q.label}
                      onChange={(e) => handleQuestionLabelChange(qIdx, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <button
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors shrink-0 mt-5 cursor-pointer"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Multi-Select Checkbox Toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleToggleAllowMultiple(qIdx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      q.allowMultiple
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    {q.allowMultiple ? (
                      <CheckSquare className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                    <span>Allow Multi-Select Checkboxes (Tick 1 or Multiple)</span>
                  </button>
                </div>

                {/* Options List */}
                <div className="space-y-2 pt-1">
                  <label className="block text-[11px] font-bold text-gray-600">
                    Selectable Answer Choices
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                          className="w-full text-xs font-semibold text-gray-800 bg-transparent focus:outline-none"
                        />
                        <button
                          onClick={() => handleRemoveOption(qIdx, optIdx)}
                          className="text-gray-400 hover:text-rose-500 p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => handleAddOption(qIdx)}
                      className="p-2 rounded-xl border border-dashed border-gray-300 hover:border-amber-500 text-xs font-bold text-gray-600 hover:text-amber-600 flex items-center justify-center gap-1 bg-white cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Option</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddQuestion}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-300 hover:border-amber-500 text-xs font-extrabold text-gray-700 hover:text-amber-600 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Qualification Question</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Saved questions render on your public subdomain and /survey route.
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Survey Form 💾
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
