import React from 'react';
import { Course } from '../types';
import { ArrowLeft, ArrowRight, Lock, ShieldCheck, Sparkles, FileText, Check } from 'lucide-react';

interface Section09CustomisationProps {
  course: Course;
  onUpdate: (updater: (prev: Course) => Course) => void;
  onPreviewPrompt: () => void;
  onBack: () => void;
}

export const Section09Customisation: React.FC<Section09CustomisationProps> = ({
  course,
  onUpdate,
  onPreviewPrompt,
  onBack
}) => {
  const custom = course.customisation;

  const handleUpdate = (field: keyof Course['customisation'], val: any) => {
    onUpdate(prev => ({
      ...prev,
      customisation: {
        ...prev.customisation,
        [field]: val
      }
    }));
  };

  return (
    <div id="section-09-customisation-container" className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-mono text-[#052B66]">09</span>
            <h2 className="text-2xl font-extrabold text-[#052B66] tracking-tight">
              Customisation & Framework Safeguards
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Preserve master framework integrity while configuring delivery parameters.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-[#052B66]/10 text-[#052B66] rounded-full border border-[#052B66]/20 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#052B66]" />
          <span>Framework Locked (v9.0)</span>
        </span>
      </div>

      {/* Non-negotiable Safeguard Callout */}
      <div className="bg-[#052B66] text-white rounded-xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#45CC42]" />
          <h3 className="text-sm font-bold tracking-tight">
            eStudy Master Course Generation Framework Safeguard
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Sections 01 through 08 represent the mandatory pedagogical architecture of eStudy South Africa. Any customisations applied in Section 09 add client-specific context without diluting the depth of the 9-section master specification.
        </p>
      </div>

      {/* Customisation Form Fields */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Brand Tone & Communication Style
          </label>
          <textarea
            rows={2}
            value={custom.tone}
            onChange={e => handleUpdate('tone', e.target.value)}
            placeholder="Add context on tone, instructional voice and client expectations..."
            className="w-full p-3 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-[#052B66] outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Client / Enterprise Branding Guidelines
          </label>
          <textarea
            rows={2}
            value={custom.branding}
            onChange={e => handleUpdate('branding', e.target.value)}
            placeholder="e.g. Align with Corporate Operations Guide, reference internal risk policies..."
            className="w-full p-3 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-[#052B66] outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Target LMS / Delivery Environment Preferences
          </label>
          <input
            type="text"
            value={custom.deliveryPreferences}
            onChange={e => handleUpdate('deliveryPreferences', e.target.value)}
            placeholder="e.g. Moodle / SCORM 1.2 / Canvas LMS / eStudy Platform"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-[#052B66] outline-none"
          />
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
          id="section-09-preview-prompt-btn"
          onClick={onPreviewPrompt}
          className="px-6 py-2.5 rounded-lg text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3db83a] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate & Preview Master Prompt →</span>
        </button>
      </div>
    </div>
  );
};
