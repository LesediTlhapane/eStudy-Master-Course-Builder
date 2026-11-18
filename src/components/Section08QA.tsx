import React from 'react';
import { Course, SectionId, QACheckItem } from '../types';
import { QAResult } from '../utils/qaEngine';
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  ClipboardCheck,
  CheckSquare,
  Square
} from 'lucide-react';
import { SlideHeader } from './SlideHeader';
import { SlideFooter } from './SlideFooter';
import { FrameworkCallout } from './FrameworkCallout';

interface Section08QAProps {
  course: Course;
  qaResult: QAResult;
  onUpdate?: (updater: (prev: Course) => Course) => void;
  onNavigateSection: (sectionId: SectionId, fieldId?: string) => void;
  onPreviewPrompt: () => void;
  onBack: () => void;
}

export const OFFICIAL_20_QA_CHECKLIST_ITEMS: Array<{
  id: string;
  number: number;
  requirement: string;
}> = [
  { id: 'qa-01', number: 1, requirement: 'Problem statement follows the required formula (Target Group + Task/Skill + Impact)' },
  { id: 'qa-02', number: 2, requirement: 'Root causes are identified across process, skills, and environment' },
  { id: 'qa-03', number: 3, requirement: 'AI literacy gap and ethical risks are explicitly documented' },
  { id: 'qa-04', number: 4, requirement: 'Minimum of 3 credible sources are referenced (including regulatory and AI sources)' },
  { id: 'qa-05', number: 5, requirement: 'Course overview, benefits, description, audience, and prerequisites are complete' },
  { id: 'qa-06', number: 6, requirement: 'AI integration level is selected and consistently applied across all modules' },
  { id: 'qa-07', number: 7, requirement: 'Pre-course diagnostic includes 5–10 questions (at least 2 on AI/digital readiness)' },
  { id: 'qa-08', number: 8, requirement: 'Minimum of 3 modules with clear progression (Foundation → Application → Implementation)' },
  { id: 'qa-09', number: 9, requirement: 'Learning objectives use measurable Bloom’s taxonomy verbs' },
  { id: 'qa-10', number: 10, requirement: 'Each module includes practical exercises and workplace scenarios' },
  { id: 'qa-11', number: 11, requirement: 'Minimum of 3 workplace scenarios per module + at least 2 AI scenarios across the course' },
  { id: 'qa-12', number: 12, requirement: 'Module 3 includes all 3 mandatory deliverables (Checklist, Rollout Framework, Risk & Compliance)' },
  { id: 'qa-13', number: 13, requirement: 'Assessments are aligned with learning objectives (quizzes, practical tasks, final assessment)' },
  { id: 'qa-14', number: 14, requirement: 'At least 1 practical task requires critical evaluation of AI-generated output' },
  { id: 'qa-15', number: 15, requirement: 'Ethical standards and responsible AI principles are embedded throughout (not bolted on)' },
  { id: 'qa-16', number: 16, requirement: 'Data privacy (POPIA/GDPR) and human-in-the-loop principles are reinforced' },
  { id: 'qa-17', number: 17, requirement: 'Language is clear, accessible, and appropriate for the target audience' },
  { id: 'qa-18', number: 18, requirement: 'Glossary of technical and AI terms is included' },
  { id: 'qa-19', number: 19, requirement: 'Accreditation requirements are met (if applicable)' },
  { id: 'qa-20', number: 20, requirement: 'Full course content is written out (no placeholder summaries or skipped sections)' }
];

export const Section08QA: React.FC<Section08QAProps> = ({
  course,
  qaResult,
  onUpdate,
  onNavigateSection,
  onPreviewPrompt,
  onBack
}) => {
  const passedCount = qaResult.items.filter(i => i.isComplete).length;
  const warningCount = qaResult.items.filter(i => !i.isComplete).length;
  const checklistState = course.qa?.checklistItems || {};

  const handleToggleChecklistItem = (id: string) => {
    if (!onUpdate) return;
    onUpdate(prev => ({
      ...prev,
      qa: {
        ...prev.qa,
        checklistItems: {
          ...(prev.qa?.checklistItems || {}),
          [id]: !prev.qa?.checklistItems?.[id]
        }
      }
    }));
  };

  const handleCheckAllOfficialItems = () => {
    if (!onUpdate) return;
    const allChecked: Record<string, boolean> = {};
    OFFICIAL_20_QA_CHECKLIST_ITEMS.forEach(item => {
      allChecked[item.id] = true;
    });
    onUpdate(prev => ({
      ...prev,
      qa: {
        ...prev.qa,
        checklistItems: allChecked
      }
    }));
  };

  const categories = [
    { name: '1. Identify Problem / Challenge / Development Area', section: '01' as SectionId },
    { name: '2. Sources of Information (Research Layer)', section: '02' as SectionId },
    { name: '3. Course Structure & Diagnostics', section: '03' as SectionId },
    { name: '4. Module Breakdown & Scenarios', section: '04' as SectionId },
    { name: '5. Learning Design Requirements', section: '05' as SectionId },
    { name: '6. Ethical & Professional Standards', section: '06' as SectionId },
    { name: '7. Output Format & Accreditation', section: '07' as SectionId },
    { name: '9. Customisation Guide', section: '09' as SectionId }
  ];

  const getItemsForSection = (sectionId: SectionId): QACheckItem[] => {
    return qaResult.items.filter(item => item.targetSection === sectionId);
  };

  const manualCheckedCount = OFFICIAL_20_QA_CHECKLIST_ITEMS.filter(i => checklistState[i.id]).length;

  return (
    <div id="section-08-qa-container" className="space-y-8 max-w-6xl font-sora">
      {/* Slide Header */}
      <SlideHeader
        sectionNumber="08"
        title="8. QUALITY ASSURANCE & BENCHMARK"
        subtitle="Verify the course against the official 20-point Quality Assurance Checklist (8.1) and automated readiness checks."
        slideNumber="08"
        totalSlides="09"
        badgeText={`${qaResult.scorePercent}% Readiness Score`}
      />

      {/* Framework Requirement Callout */}
      <FrameworkCallout
        title="Benchmark Standard (Page 16 of PDF Template)"
        requirement="The generated course must match or exceed the depth, structure, and practical usefulness of the Financial Literacy for Small Business Owners benchmark course, elevated with AI literacy, digital readiness, and modern workplace relevance."
        variant="requirement"
      />

      {/* Top Hero Readiness Score Card */}
      <div
        id="course-readiness-hero-card"
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-4 border-l-[#45CC42]"
      >
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[#052B66] text-white flex flex-col items-center justify-center shrink-0 shadow-sm border-2 border-[#45CC42]">
            <span className="text-2xl font-extrabold font-mono tracking-tight leading-none text-[#45CC42]">
              {qaResult.scorePercent}%
            </span>
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider mt-1">
              Readiness
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-[#052B66] tracking-tight">
              {qaResult.statusLabel}
            </h3>

            <p className="text-xs text-slate-600 font-medium">
              {passedCount} of {qaResult.items.length} automated checks satisfied ·{' '}
              {warningCount === 0 ? (
                <span className="text-[#45CC42] font-bold">All framework checks complete</span>
              ) : (
                <span className="text-amber-700 font-bold">{warningCount} recommended items remaining</span>
              )}
            </p>

            <p className="text-[11.5px] text-slate-500 max-w-xl">
              {qaResult.statusDescription}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <button
            id="qa-preview-master-prompt-cta"
            onClick={onPreviewPrompt}
            className="px-6 py-3 rounded-xl text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] transition-all shadow hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Review Master Prompt & Generate →</span>
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 8.1 QUALITY ASSURANCE CHECKLIST (OFFICIAL 20 ITEMS FROM PDF)      */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5 border-l-4 border-l-[#052B66]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
              SUBSECTION 8.1
            </span>
            <h3 className="text-base font-extrabold text-[#052B66] flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-[#45CC42]" />
              <span>8.1 Quality Assurance Checklist (Before Finalising the Course, Verify All 20 Items)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Official 20-point verification table from page 16 of the eStudy Master Course Generation Template v9.0.
            </p>
          </div>

          {onUpdate && (
            <button
              type="button"
              onClick={handleCheckAllOfficialItems}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#052B66] bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer self-start"
            >
              Mark All 20 Verified ({manualCheckedCount}/20)
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#052B66] text-white text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-4">Quality Requirement</th>
                <th className="py-3 px-4 w-28 text-center">Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {OFFICIAL_20_QA_CHECKLIST_ITEMS.map(item => {
                const isChecked = Boolean(checklistState[item.id]);
                return (
                  <tr
                    key={item.id}
                    onClick={() => handleToggleChecklistItem(item.id)}
                    className={`transition-colors ${
                      onUpdate ? 'cursor-pointer hover:bg-slate-50' : ''
                    } ${isChecked ? 'bg-emerald-50/30' : 'bg-white'}`}
                  >
                    <td className="py-3 px-3 text-center font-mono font-bold text-[#052B66]">
                      {item.number}
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {item.requirement}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleToggleChecklistItem(item.id);
                        }}
                        className="inline-flex items-center justify-center text-[#052B66] cursor-pointer"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[#45CC42]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================================= */}
      {/* AUTOMATED SECTION-BY-SECTION FIELD VERIFICATION                   */}
      {/* ================================================================= */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold text-[#052B66] uppercase tracking-wider">
          Automated Section-by-Section Readiness Audit (Click Any Section to Edit)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(cat => {
            const items = getItemsForSection(cat.section);
            if (items.length === 0) return null;

            const catPassed = items.filter(i => i.isComplete).length;
            const allPassed = catPassed === items.length;

            return (
              <div
                key={cat.section}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#052B66]">
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                        allPassed
                          ? 'bg-[#45CC42]/20 text-[#052B66]'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {catPassed}/{items.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigateSection(cat.section)}
                      className="text-xs font-bold text-[#052B66] hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 p-2">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="p-2.5 flex items-start justify-between gap-2 text-xs"
                    >
                      <div className="flex items-start gap-2 flex-1">
                        {item.isComplete ? (
                          <CheckCircle2 className="w-4 h-4 text-[#45CC42] stroke-[2.5] shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-semibold text-slate-800">{item.label}</div>
                          {!item.isComplete && item.issueDescription && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{item.issueDescription}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={onBack}
          className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Section 7: Output Format Requirements</span>
        </button>

        <button
          id="section-08-continue-btn"
          onClick={() => onNavigateSection('09')}
          className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Section 9: Customisation Guide →</span>
        </button>
      </div>

      <SlideFooter currentSlide="08" totalSlides="09" />
    </div>
  );
};
