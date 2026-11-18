import React from 'react';
import { Course } from '../types';
import { ArrowLeft, FileText, Check, Award } from 'lucide-react';
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
  const output = course.outputRequirements;
  const flagged = course.flaggedFields || {};

  const confirmFlag = (key: string) => {
    onUpdate(prev => {
      const next = { ...(prev.flaggedFields || {}) };
      delete next[key];
      return { ...prev, flaggedFields: next };
    });
  };

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
    <div id="section-07-output-container" className="space-y-8 max-w-6xl font-sora">
      {/* Slide Header */}
      <SlideHeader
        sectionNumber="07"
        title="7. OUTPUT FORMAT REQUIREMENTS"
        subtitle="Specify 7.1–7.4 Output & Accessibility Requirements and 7.5 Accreditation & Standards Alignment on a single page."
        slideNumber="07"
        totalSlides="09"
        badgeText="Section 7 · Output & Accreditation"
      />

      {/* Framework Requirement Callout */}
      <FrameworkCallout
        title="Output Fidelity & Zero-Truncation Rule"
        requirement="The generated course must be complete, publication-ready, and written in South African English. Do not summarise or skip sections: write out the full course content."
        variant="requirement"
      />

      {/* ================================================================= */}
      {/* 7.1 - 7.4 OUTPUT FORMAT, VISUALS & ACCESSIBILITY                  */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-6 shadow-xs border-l-4 border-l-[#052B66]">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
            SUBSECTIONS 7.1 – 7.4
          </span>
          <h3 className="text-base font-extrabold text-[#052B66] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#45CC42]" />
            <span>7.1 Structural Elements, 7.2 Tone & Style, 7.3 Visual Callouts & 7.4 Accessibility</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <EditorialField
            label="Output Format & Structural Delivery"
            value={output.outputFormat}
            onChange={val => handleUpdate('outputFormat', val)}
            placeholder="e.g. LMS-Ready structured digital course with full module lessons, callout boxes, tables, and printable checklists"
            multiline
            rows={3}
            required
          />

          <EditorialField
            label="7.4 Accessibility & Target Reading Level [INSERT]"
            value={output.accessibilityTargetReadingLevel}
            onChange={val => handleUpdate('accessibilityTargetReadingLevel', val)}
            placeholder="e.g. Plain South African English · NQF Level 4 / Grade 12 equivalent reading comprehension"
            multiline
            rows={3}
            required
          />
        </div>

        {/* Official 7.1 - 7.3 Mandatory Inclusions Reference */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-extrabold text-[#052B66] uppercase tracking-wider block">
            Mandatory Output Standards (Automatically Enforced in AI Generation)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
              <Check className="w-4 h-4 text-[#45CC42] stroke-[2.5] shrink-0" />
              <span>7.1 Clear headings, subheadings, numbered lists, and comparison tables</span>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
              <Check className="w-4 h-4 text-[#45CC42] stroke-[2.5] shrink-0" />
              <span>7.2 Professional, practical, action-oriented South African English tone</span>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
              <Check className="w-4 h-4 text-[#45CC42] stroke-[2.5] shrink-0" />
              <span>7.3 Visual & Callout Indicators ([TIP], [WARNING], [EXAMPLE], [AI INSIGHT], [CHECKLIST])</span>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
              <Check className="w-4 h-4 text-[#45CC42] stroke-[2.5] shrink-0" />
              <span>7.4 Inclusive language, glossary of technical terms, and multi-device readability</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 7.5 ACCREDITATION & STANDARDS ALIGNMENT (IF APPLICABLE)           */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs border-l-4 border-l-[#45CC42]">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#45CC42]/20 px-2.5 py-0.5 rounded-md border border-[#45CC42]/40 inline-block mb-1">
            SUBSECTION 7.5
          </span>
          <h3 className="text-base font-extrabold text-[#052B66] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#052B66]" />
            <span>7.5 Accreditation & Standards Alignment (If Applicable)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete this subsection if the course aligns with a SETA, QCTO, SAQA qualification, or professional body standard (or mark as Not Applicable).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <EditorialField
            label="Accreditation Body [INSERT]"
            value={output.accreditationBody || ''}
            onChange={val => handleUpdate('accreditationBody', val)}
            placeholder="e.g. BANKSETA, Services SETA, QCTO, SAICA, FSCA (or Not Applicable)"
            flaggedNote={flagged['outputRequirements.accreditationBody']}
            onConfirmFlag={() => confirmFlag('outputRequirements.accreditationBody')}
          />

          <EditorialField
            label="Qualification / Unit Standard [INSERT]"
            value={output.qualificationOrUnitStandard || ''}
            onChange={val => handleUpdate('qualificationOrUnitStandard', val)}
            placeholder="e.g. SAQA ID 117871 / Occupational Certificate (or Not Applicable)"
            flaggedNote={flagged['outputRequirements.qualificationOrUnitStandard']}
            onConfirmFlag={() => confirmFlag('outputRequirements.qualificationOrUnitStandard')}
          />

          <EditorialField
            label="NQF Level [INSERT]"
            value={output.nqfLevel || ''}
            onChange={val => handleUpdate('nqfLevel', val)}
            placeholder="e.g. NQF Level 5 (12 Credits) or Non-Accredited"
            flaggedNote={flagged['outputRequirements.nqfLevel']}
            onConfirmFlag={() => confirmFlag('outputRequirements.nqfLevel')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <EditorialField
            label="Accreditation Requirements [INSERT]"
            value={output.accreditationRequirements || ''}
            onChange={val => handleUpdate('accreditationRequirements', val)}
            placeholder="Specific exit-level outcomes or assessment criteria required by the accrediting body..."
            multiline
            rows={3}
          />

          <EditorialField
            label="Required Learning Structure (Notional Hours, Credits, Modules) [INSERT]"
            value={output.requiredLearningStructure || ''}
            onChange={val => handleUpdate('requiredLearningStructure', val)}
            placeholder="e.g. 30% Theory, 70% Workplace Practical Application (16 Notional Hours)..."
            multiline
            rows={3}
          />

          <EditorialField
            label="Assessment Requirements (Portfolio of Evidence, Moderation) [INSERT]"
            value={output.accreditationAssessmentRequirements || ''}
            onChange={val => handleUpdate('accreditationAssessmentRequirements', val)}
            placeholder="e.g. Summative Portfolio of Evidence (PoE) with supervisor sign-off and internal moderation..."
            multiline
            rows={3}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={onBack}
          className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Section 6: Ethical & Professional Standards</span>
        </button>

        <button
          id="section-07-continue-btn"
          onClick={onContinue}
          className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Section 8: Quality Assurance & Benchmark →</span>
        </button>
      </div>

      <SlideFooter currentSlide="07" totalSlides="09" />
    </div>
  );
};
