import React from 'react';
import { Course, SectionId, QACheckItem } from '../types';
import { QAResult } from '../utils/qaEngine';
import { CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

interface Section08QAProps {
  course: Course;
  qaResult: QAResult;
  onNavigateSection: (sectionId: SectionId, fieldId?: string) => void;
  onPreviewPrompt: () => void;
  onBack: () => void;
}

export const Section08QA: React.FC<Section08QAProps> = ({
  course,
  qaResult,
  onNavigateSection,
  onPreviewPrompt,
  onBack
}) => {
  const passedCount = qaResult.items.filter(i => i.isComplete).length;
  const warningCount = qaResult.items.filter(i => !i.isComplete).length;

  const categories = [
    { name: 'Problem Definition', section: '01' as SectionId },
    { name: 'Sources & Evidence', section: '02' as SectionId },
    { name: 'Course Structure', section: '03' as SectionId },
    { name: 'Scenario Coverage', section: '04' as SectionId },
    { name: 'Learning Design', section: '05' as SectionId },
    { name: 'Ethics & Compliance', section: '06' as SectionId },
    { name: 'Output Format', section: '07' as SectionId }
  ];

  const getItemsForSection = (sectionId: SectionId): QACheckItem[] => {
    return qaResult.items.filter(item => item.targetSection === sectionId);
  };

  return (
    <div id="section-08-qa-container" className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-mono text-[#052B66]">08</span>
            <h2 className="text-2xl font-extrabold text-[#052B66] tracking-tight">
              Course Readiness & Quality Assurance
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review your course against the Master Prompt v9.0 quality criteria before generating.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
          Master Prompt v9.0 Compliance
        </span>
      </div>

      {/* Top Hero Readiness Score Card matching Mockup Page 8 */}
      <div
        id="course-readiness-hero-card"
        className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="flex items-center gap-6">
          {/* Big Score Gauge */}
          <div className="w-24 h-24 rounded-2xl bg-[#052B66] text-white flex flex-col items-center justify-center shrink-0 shadow-sm border-2 border-[#45CC42]">
            <span className="text-3xl font-extrabold font-mono tracking-tight leading-none text-[#45CC42]">
              {qaResult.scorePercent}%
            </span>
            <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mt-1">
              Score
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-[#052B66] tracking-tight">
                {qaResult.statusLabel}
              </h3>
              {qaResult.scorePercent >= 80 && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#45CC42]" />
              )}
            </div>

            <p className="text-xs text-slate-600 font-medium">
              {passedCount} of {qaResult.items.length} requirements met ·{' '}
              {warningCount === 0 ? (
                <span className="text-[#45CC42] font-bold">All requirements verified</span>
              ) : (
                <span className="text-amber-700 font-bold">{warningCount} warnings</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="qa-preview-master-prompt-cta"
            onClick={onPreviewPrompt}
            className="px-6 py-3 rounded-lg text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3db83a] transition-all shadow hover:shadow-md flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>Preview master prompt →</span>
          </button>
        </div>
      </div>

      {/* Grouped Requirement Cards List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Readiness Checklist by Category
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(cat => {
            const catItems = getItemsForSection(cat.section);
            if (catItems.length === 0) return null;

            return (
              <div
                key={cat.name}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#052B66]">
                      {cat.name}
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigateSection(cat.section)}
                    className="text-[11px] font-semibold text-[#052B66] hover:text-[#45CC42] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Edit Section</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {catItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => onNavigateSection(item.targetSection)}
                      className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 transition-colors cursor-pointer ${
                        item.isComplete
                          ? 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70 text-slate-800'
                          : 'bg-amber-50/60 border-amber-200 hover:bg-amber-100/60 text-amber-900'
                      }`}
                    >
                      <span className="shrink-0 mt-0.5">
                        {item.isComplete ? (
                          <CheckCircle2 className="w-4 h-4 text-[#45CC42]" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                        )}
                      </span>

                      <div className="space-y-0.5 flex-1">
                        <div className="font-semibold">{item.label}</div>
                        {item.issueDescription && (
                          <div className="text-[11px] text-amber-700">
                            {item.issueDescription}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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
          id="section-08-continue-btn"
          onClick={() => onNavigateSection('09')}
          className="px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>Continue to Customisation →</span>
        </button>
      </div>
    </div>
  );
};
