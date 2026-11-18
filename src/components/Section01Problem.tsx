import React, { useState } from 'react';
import { Course } from '../types';
import {
  Sparkles,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { SlideHeader } from './SlideHeader';
import { SlideFooter } from './SlideFooter';
import { EditorialField } from './EditorialField';

interface Section01ProblemProps {
  course: Course;
  onUpdate: (updater: (prev: Course) => Course) => void;
  onContinue: () => void;
}

const TWELVE_STAGE_METHODOLOGY = [
  { step: '01', name: 'Problem Identification', output: 'Validated problem statement & root cause map' },
  { step: '02', name: 'Needs Analysis', output: 'Skills gap report & learner readiness profile' },
  { step: '03', name: 'Research & Source Verification', output: 'Curated, verified reference list (Sections 2.1–2.3)' },
  { step: '04', name: 'Learning Objectives Design', output: 'Measurable objectives per module (Bloom’s taxonomy)' },
  { step: '05', name: 'Curriculum Architecture', output: 'Module breakdown with progression logic (Section 3.9)' },
  { step: '06', name: 'Content & Scenario Development', output: 'Drafted module content, scenarios & AI use cases (Section 4)' },
  { step: '07', name: 'Assessment Design', output: 'Diagnostic, formative & summative assessments (Section 5.3)' },
  { step: '08', name: 'Ethics & Compliance Review', output: 'Completed ethics checklist & POPIA alignment (Section 6)' },
  { step: '09', name: 'Accessibility & Language Review', output: 'Readability check, plain language edit & inclusivity audit' },
  { step: '10', name: 'Prototype & SME Validation', output: 'Signed-off draft reviewed by Subject Matter Expert' },
  { step: '11', name: 'Deployment & Rollout', output: 'Published course with implementation guide (Module 3)' },
  { step: '12', name: 'Review & Continuous Improvement', output: 'Post-course evaluation, learner feedback & update schedule' }
];

export const Section01Problem: React.FC<Section01ProblemProps> = ({
  course,
  onUpdate,
  onContinue
}) => {
  const [isRefiningWording, setIsRefiningWording] = useState(false);
  const [refineSuccess, setRefineSuccess] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);

  const p = course.problem;
  const flagged = course.flaggedFields || {};

  const handleFieldChange = (field: keyof Course['problem'], value: string) => {
    onUpdate(prev => ({
      ...prev,
      problem: {
        ...prev.problem,
        [field]: value
      }
    }));
  };

  const handleRootCauseChange = (index: number, value: string) => {
    onUpdate(prev => {
      const current = [...(prev.problem.rootCauses || ['', ''])];
      while (current.length <= index) current.push('');
      current[index] = value;
      return {
        ...prev,
        problem: {
          ...prev.problem,
          rootCauses: current
        }
      };
    });
  };

  const handleConfirmFlag = (flagKey: string) => {
    onUpdate(prev => {
      if (!prev.flaggedFields) return prev;
      const nextFlags = { ...prev.flaggedFields };
      delete nextFlags[flagKey];
      return { ...prev, flaggedFields: nextFlags };
    });
  };

  const handleImproveWordingWithAI = async () => {
    if (!p.targetGroup.trim() && !p.taskOrSkill.trim() && !p.operationalImpact.trim()) {
      setRefineError('Please enter your Target Group, Task/Skill, or Impact first so the AI can refine your wording.');
      return;
    }

    setIsRefiningWording(true);
    setRefineError(null);
    setRefineSuccess(false);

    try {
      const res = await fetch('/api/courses/refine-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetGroup: p.targetGroup,
          taskOrSkill: p.taskOrSkill,
          operationalImpact: p.operationalImpact,
          processFailures: p.processFailures,
          skillGaps: p.skillGaps,
          constraints: p.constraints
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success || !data.refined) {
        throw new Error(data.error || 'Could not refine wording at this time.');
      }

      onUpdate(prev => ({
        ...prev,
        problem: {
          ...prev.problem,
          targetGroup: data.refined.targetGroup ?? prev.problem.targetGroup,
          taskOrSkill: data.refined.taskOrSkill ?? prev.problem.taskOrSkill,
          operationalImpact: data.refined.operationalImpact ?? prev.problem.operationalImpact,
          processFailures: data.refined.processFailures ?? prev.problem.processFailures,
          skillGaps: data.refined.skillGaps ?? prev.problem.skillGaps,
          constraints: data.refined.constraints ?? prev.problem.constraints
        }
      }));

      setRefineSuccess(true);
      setTimeout(() => setRefineSuccess(false), 3500);
    } catch (err: any) {
      setRefineError(err?.message || 'Could not refine wording.');
    } finally {
      setIsRefiningWording(false);
    }
  };

  const hasProblemFormulaInputs = Boolean(
    p.targetGroup.trim() || p.taskOrSkill.trim() || p.operationalImpact.trim()
  );

  return (
    <div id="section-01-problem-container" className="space-y-6 max-w-6xl font-sora">
      {/* Official PDF Section Heading */}
      <SlideHeader
        sectionNumber="01"
        title="1. IDENTIFY PROBLEM / CHALLENGE / DEVELOPMENT AREA"
        subtitle="Define the workplace problem, root causes, and AI-specific considerations that this course will address."
        badgeText="Official Template Section 1"
      />

      {/* 1.1 Required Problem Statement */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
              SECTION 1.1
            </span>
            <h2 className="text-base font-extrabold text-[#052B66]">
              1.1 Required Problem Statement *
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Complete the three straightforward fields below instead of writing a formal problem statement from scratch.
            </p>
          </div>

          <button
            type="button"
            onClick={handleImproveWordingWithAI}
            disabled={isRefiningWording}
            className="px-3.5 py-2 rounded-xl bg-[#052B66]/5 hover:bg-[#052B66]/10 border border-[#052B66]/20 text-xs font-bold text-[#052B66] flex items-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50"
            title="Use AI to polish the wording of your entered text without inventing facts"
          >
            {isRefiningWording ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#052B66]" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#45CC42]" />
            )}
            <span>{isRefiningWording ? 'Refining Wording...' : 'Improve Wording with AI'}</span>
          </button>
        </div>

        {refineSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-[#45CC42] text-xs font-semibold text-[#052B66] flex items-center gap-2">
            <Check className="w-4 h-4 text-[#45CC42] stroke-[3]" />
            <span>Wording refined for clarity while preserving your factual inputs.</span>
          </div>
        )}

        {refineError && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            {refineError}
          </div>
        )}

        {/* Official Problem Statement Structure & Example Box */}
        <div className="p-4 rounded-xl bg-[#052B66] text-white border-l-4 border-l-[#45CC42] space-y-2.5">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#45CC42]">
            Official Problem Statement Structure (Assembled Automatically):
          </div>
          <p className="text-xs sm:text-sm font-medium leading-relaxed">
            {hasProblemFormulaInputs ? (
              <>
                “This course addresses the inability of{' '}
                <strong className="text-[#45CC42] underline decoration-[#45CC42]/50">
                  {p.targetGroup || '[TARGET GROUP]'}
                </strong>{' '}
                to effectively perform{' '}
                <strong className="text-[#45CC42] underline decoration-[#45CC42]/50">
                  {p.taskOrSkill || '[TASK / SKILL]'}
                </strong>
                , resulting in{' '}
                <strong className="text-[#45CC42] underline decoration-[#45CC42]/50">
                  {p.operationalImpact || '[OPERATIONAL / FINANCIAL / COMPLIANCE / PRODUCTIVITY IMPACT]'}
                </strong>
                .”
              </>
            ) : (
              '“This course addresses the inability of [TARGET GROUP] to effectively perform [TASK / SKILL], resulting in [OPERATIONAL / FINANCIAL / COMPLIANCE / PRODUCTIVITY IMPACT].”'
            )}
          </p>
          <div className="pt-2 border-t border-white/15 text-[11px] text-slate-300 italic">
            <strong className="text-white not-italic">Example (Financial Literacy):</strong> “This course addresses the inability of employees and consumers to effectively apply AI tools in personal and organisational financial management, resulting in poor financial decisions, vulnerability to digital fraud, and missed productivity gains.”
          </div>
        </div>

        {/* The 3 Straightforward Problem Statement Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <EditorialField
            id="field-target-group"
            label="[INSERT: TARGET GROUP]"
            value={p.targetGroup}
            onChange={val => handleFieldChange('targetGroup', val)}
            placeholder="e.g. Employees and consumers"
            helperText="Target group: Who needs the training?"
            required
            allowSkip={false}
            flaggedNote={flagged['problem.targetGroup']}
            onConfirmFlag={() => handleConfirmFlag('problem.targetGroup')}
          />

          <EditorialField
            id="field-task-skill"
            label="[INSERT: TASK / SKILL]"
            value={p.taskOrSkill}
            onChange={val => handleFieldChange('taskOrSkill', val)}
            placeholder="e.g. Apply AI tools in personal and organisational financial management"
            helperText="Task or skill they struggle to perform."
            required
            allowSkip={false}
            flaggedNote={flagged['problem.taskOrSkill']}
            onConfirmFlag={() => handleConfirmFlag('problem.taskOrSkill')}
          />

          <EditorialField
            id="field-operational-impact"
            label="[INSERT: OPERATIONAL / FINANCIAL / COMPLIANCE / PRODUCTIVITY IMPACT]"
            value={p.operationalImpact}
            onChange={val => handleFieldChange('operationalImpact', val)}
            placeholder="e.g. Poor financial decisions, vulnerability to digital fraud, and missed productivity gains"
            helperText="Operational, financial, compliance or productivity impact."
            required
            allowSkip={false}
            flaggedNote={flagged['problem.operationalImpact']}
            onConfirmFlag={() => handleConfirmFlag('problem.operationalImpact')}
          />
        </div>
      </div>

      {/* 1.2 Root Cause Analysis */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
            SECTION 1.2
          </span>
          <h2 className="text-base font-extrabold text-[#052B66]">
            1.2 Root Cause Analysis *
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Identify the underlying root causes, process or system failures, skills or knowledge gaps, and organisational constraints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <EditorialField
            label="[INSERT: ROOT CAUSE 1]"
            value={p.rootCauses?.[0] || ''}
            onChange={val => handleRootCauseChange(0, val)}
            placeholder="e.g. Lack of structured training on automated tools and verification protocols"
            helperText="Primary root cause of the workplace problem."
            required
          />

          <EditorialField
            label="[INSERT: ROOT CAUSE 2]"
            value={p.rootCauses?.[1] || ''}
            onChange={val => handleRootCauseChange(1, val)}
            placeholder="e.g. Rapid adoption of digital tools without clear standard operating procedures"
            helperText="Secondary root cause of the workplace problem."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <EditorialField
            label="[INSERT: PROCESS / SYSTEM FAILURE]"
            value={p.processFailures}
            onChange={val => handleFieldChange('processFailures', val)}
            placeholder="e.g. Absence of standardised quality verification checkpoints in daily workflows"
            helperText="Process or system failures."
            multiline
            rows={3}
            required
          />

          <EditorialField
            label="[INSERT: SKILL / KNOWLEDGE GAP]"
            value={p.skillGaps}
            onChange={val => handleFieldChange('skillGaps', val)}
            placeholder="e.g. Inability to critically evaluate AI outputs or construct sanitised prompts"
            helperText="Skills or knowledge gaps."
            multiline
            rows={3}
            required
          />

          <EditorialField
            label="[INSERT: CONSTRAINT]"
            value={p.constraints}
            onChange={val => handleFieldChange('constraints', val)}
            placeholder="e.g. Strict statutory compliance boundaries under POPIA Act No. 4 of 2013"
            helperText="Organisational or environmental constraints."
            multiline
            rows={3}
            required
          />
        </div>
      </div>

      {/* 1.3 AI-Specific Considerations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
            SECTION 1.3
          </span>
          <h2 className="text-base font-extrabold text-[#052B66]">
            1.3 AI-Specific Considerations *
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Define the AI literacy gap, data and digital readiness level, and ethical or compliance risks introduced by AI use.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <EditorialField
            label="[INSERT: AI LITERACY GAP]"
            value={p.aiLiteracyGap}
            onChange={val => handleFieldChange('aiLiteracyGap', val)}
            placeholder="e.g. Differentiating predictive ML from generative AI and understanding hallucination risks"
            helperText="What learners do not understand about AI relevant to this topic."
            multiline
            rows={3}
            required
          />

          <EditorialField
            label="[INSERT: DIGITAL READINESS LEVEL]"
            value={p.digitalReadinessLevel}
            onChange={val => handleFieldChange('digitalReadinessLevel', val)}
            placeholder="e.g. Basic digital literacy, spreadsheet proficiency, no prior AI experience"
            helperText="Data and digital readiness level."
            multiline
            rows={3}
            required
          />

          <EditorialField
            label="[INSERT: AI ETHICS / COMPLIANCE RISK]"
            value={p.aiEthicsComplianceRisk}
            onChange={val => handleFieldChange('aiEthicsComplianceRisk', val)}
            placeholder="e.g. Algorithmic bias in credit scoring, POPIA data privacy in financial tools"
            helperText="Ethical or compliance risks introduced by AI use."
            multiline
            rows={3}
            required
          />
        </div>
      </div>

      {/* 1.4 Course Development Methodology (Official PDF Page 4 Table) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowMethodology(!showMethodology)}
          className="w-full p-5 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-[#052B66]" />
            <div>
              <h3 className="text-sm font-extrabold text-[#052B66]">
                1.4 Course Development Methodology (12-Stage eStudy Standard)
              </h3>
              <p className="text-xs text-slate-500">
                Every course built with this template follows the official 12-stage instructional design process. Click to view stages.
              </p>
            </div>
          </div>
          {showMethodology ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {showMethodology && (
          <div className="p-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TWELVE_STAGE_METHODOLOGY.map(item => (
              <div key={item.step} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-[#052B66] text-[#45CC42]">
                    Stage {item.step}
                  </span>
                  <span className="text-xs font-bold text-[#052B66]">{item.name}</span>
                </div>
                <p className="text-[11px] text-slate-600">{item.output}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="flex items-center justify-end pt-4 border-t border-slate-200">
        <button
          id="section-01-continue-btn"
          onClick={onContinue}
          className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to 2. Sources of Information →</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <SlideFooter currentSlide="01" totalSlides="09" />
    </div>
  );
};
