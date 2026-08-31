import React from 'react';
import { Course } from '../types';
import { ArrowLeft, ArrowRight, FileText, Check, Layers, Sparkles, BookOpen } from 'lucide-react';

interface Section07OutputProps {
  course: Course;
  onUpdate: (updater: (prev: Course) => Course) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const Section07Output: React.FC<Section07OutputProps> = ({
  course,
  onUpdate,
  onContinue,
  onBack
}) => {
  const output = course.outputRequirements;

  const handleUpdate = (field: keyof Course['outputRequirements'], val: any) => {
    onUpdate(prev => ({
      ...prev,
      outputRequirements: {
        ...prev.outputRequirements,
        [field]: val
      }
    }));
  };

  return (
    <div id="section-07-output-container" className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-mono text-[#052B66]">07</span>
            <h2 className="text-2xl font-extrabold text-[#052B66] tracking-tight">
              Output Format & Generation Specifications
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Formatting requirements, tone, structural elements and generation rules for the AI engine.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-[#45CC42]/15 text-[#052B66] rounded-full border border-[#45CC42]/30">
          Full Text Output (No Truncation)
        </span>
      </div>

      {/* Output Format Settings Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-[#052B66] uppercase tracking-wider">
          Generation Rules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Target Reading Level
            </label>
            <input
              type="text"
              value={output.accessibilityTargetReadingLevel}
              onChange={e => handleUpdate('accessibilityTargetReadingLevel', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-[#052B66] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Output Format & Structure
            </label>
            <input
              type="text"
              value={output.outputFormat}
              onChange={e => handleUpdate('outputFormat', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-[#052B66] outline-none"
            />
          </div>
        </div>

        {/* Mandatory Structural Checklist */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Mandatory Structural Inclusions (Master Prompt v9.0)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#45CC42] stroke-[2.5]" />
              <span>Full, un-truncated course text (no placeholders)</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#45CC42] stroke-[2.5]" />
              <span>Callout boxes (Tip, Warning, Good/Bad Example)</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#45CC42] stroke-[2.5]" />
              <span>Diagnostic baseline self-assessments (5 Qs)</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#45CC42] stroke-[2.5]" />
              <span>Full scenarios with situation, decision & debrief</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={onBack}
          className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back</span>
        </button>

        <button
          id="section-07-continue-btn"
          onClick={onContinue}
          className="px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>Continue to Quality Assurance →</span>
        </button>
      </div>
    </div>
  );
};
