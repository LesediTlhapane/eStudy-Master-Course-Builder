import React, { useState } from 'react';
import { Course } from '../types';
import { ArrowLeft, ArrowRight, FileText, Check, Layers, Sparkles, BookOpen, ShieldCheck, ListOrdered } from 'lucide-react';
import { SlideHeader } from './SlideHeader';
import { SlideFooter } from './SlideFooter';
import { FrameworkCallout } from './FrameworkCallout';
import { EditorialField } from './EditorialField';

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
  const [activeTab, setActiveTab] = useState<'specs' | 'sequence'>('specs');
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
    <div id="section-07-output-container" className="space-y-6 max-w-6xl">
      {/* Slide Header */}
      <SlideHeader
        sectionNumber="07"
        title="Output Format Specifications & Generation Directives"
        subtitle="Formatting requirements, tone, structural elements, and strict non-truncation rules for the AI engine."
        slideNumber="33"
        totalSlides="39"
        badgeText="Full Text Output (No Truncation)"
      />

      {/* Framework Requirement Callout */}
      <FrameworkCallout
        title="Framework Requirement"
        requirement="Strict zero-truncation rule. Every generated module must output full narrative content, authentic workplace scenarios, complete implementation checklists, and structured markdown tables."
        variant="requirement"
      />

      {/* Slide Tab Navigation */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'specs'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Slide 33: Formatting & Language Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('sequence')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sequence'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Slide 34: 9 Master Sections & Sequence</span>
          </button>
        </div>
      </div>

      {activeTab === 'specs' && (
        /* Slide 33: Output Format Settings */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
              SLIDE 33 · GENERATION DIRECTIVES
            </span>
            <h3 className="text-sm font-bold text-[#052B66]">
              [OUTPUT FORMAT SPECIFICATIONS & DIRECTIVES]
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <EditorialField
              label="[OUTPUT FORMAT & STRUCTURE]"
              value={output.outputFormat}
              onChange={val => handleUpdate('outputFormat', val)}
              placeholder="e.g. LMS-Ready SCORM / xAPI compliant structured digital course with interactive modules and printable action plans"
              multiline
              rows={3}
              helperText="Target export medium and structural output delivery."
            />

            <EditorialField
              label="[TARGET READING LEVEL & ACCESSIBILITY]"
              value={output.accessibilityTargetReadingLevel}
              onChange={val => handleUpdate('accessibilityTargetReadingLevel', val)}
              placeholder="e.g. Plain language · NQF Level 4 / Grade 12 equivalent reading comprehension"
              multiline
              rows={3}
              helperText="Reading ease, terminology clarity, and language level."
            />
          </div>

          {/* Mandatory Inclusions Checklist */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-[#052B66] uppercase tracking-wider block">
              [MANDATORY GENERATION RULES & FIDELITY GATES]
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#45CC42] stroke-[2.5]" />
                <span>Full, un-truncated course text (no placeholder text or summaries)</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#45CC42] stroke-[2.5]" />
                <span>Standardised callout boxes (Tip, Warning, Example, Statutory Rule)</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#45CC42] stroke-[2.5]" />
                <span>Pre-assessment diagnostic baseline questions (5-10 questions)</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#45CC42] stroke-[2.5]" />
                <span>Full scenario schema (Situation, Challenge, Decision, Debrief)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sequence' && (
        /* Slide 34: 9 Master Sections Sequence */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
              SLIDE 34 · MASTER FRAMEWORK SEQUENCE
            </span>
            <h3 className="text-sm font-bold text-[#052B66]">
              [THE 9 AUTHORITATIVE MASTER COURSE SECTIONS]
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {[
              { num: '01', title: 'Problem & Operational Challenge', desc: 'Organizational bottlenecks, root causes & AI literacy gaps' },
              { num: '02', title: 'Sources, References & Evidence', desc: 'Statutory citations, verified policies & benchmark notes' },
              { num: '03', title: 'Course Structure & Architecture', desc: 'Purpose, scope, benefits, journey & pre-diagnostics' },
              { num: '04', title: 'Modules & Workplace Scenarios', desc: 'Core content, procedures, SOPs & decision scenarios' },
              { num: '05', title: 'Learning Design & Assessment', desc: 'Bloom taxonomy, 3-tier scaffolding & rubric criteria' },
              { num: '06', title: 'Ethics & AI Responsibility', desc: 'POPIA compliance, 8 ethical dimensions & human oversight' },
              { num: '07', title: 'Output Format & Specifications', desc: 'Structural markdown rules & zero-truncation directives' },
              { num: '08', title: 'Quality Assurance & Scoring', desc: '40-criterion audit rubric & verification gates' },
              { num: '09', title: 'Customisation & Audit History', desc: 'Enterprise tuning, adaptations & version ledger' }
            ].map(item => (
              <div key={item.num} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#052B66] text-white text-[10px] font-bold flex items-center justify-center font-mono">
                    {item.num}
                  </span>
                  <h4 className="text-xs font-bold text-[#052B66]">{item.title}</h4>
                </div>
                <p className="text-[11px] text-slate-600 pl-7">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={onBack}
          className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Ethics</span>
        </button>

        <button
          id="section-07-continue-btn"
          onClick={onContinue}
          className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Quality Assurance (Section 08) →</span>
        </button>
      </div>

      {/* Slide Footer */}
      <SlideFooter currentSlide="33" totalSlides="39" />
    </div>
  );
};
