import React, { useState } from 'react';
import { Course } from '../types';
import { Check, HelpCircle, ArrowRight, ArrowLeft, Lightbulb, Info, LayoutGrid, ListChecks, Sparkles, FileText } from 'lucide-react';
import { SlideHeader } from './SlideHeader';
import { SlideFooter } from './SlideFooter';
import { FrameworkCallout } from './FrameworkCallout';
import { EditorialField } from './EditorialField';

interface Section01ProblemProps {
  course: Course;
  onUpdate: (updater: (prev: Course) => Course) => void;
  onContinue: () => void;
  onBack?: () => void;
}

interface QuestionConfig {
  id: number;
  title: string;
  shortLabel: string;
  bracketLabel: string;
  helperText: string;
  fieldKey: 'taskOrSkill' | 'targetGroup' | 'skillGaps' | 'aiLiteracyGap' | 'operationalImpact';
  whyAskThis: string;
  example: string;
  placeholder: string;
}

const QUESTIONS: QuestionConfig[] = [
  {
    id: 1,
    title: 'What problem is this course designed to solve?',
    shortLabel: 'Problem to solve',
    bracketLabel: 'PROBLEM STATEMENT',
    helperText: 'Define the specific workplace task or skill that employees struggle with or are performing unsafely.',
    fieldKey: 'taskOrSkill',
    whyAskThis: 'The Master Prompt requires a concrete, performance-focused problem statement to anchor all subsequent modules, learning objectives, and scenarios.',
    example: '“Employees are unable to effectively apply AI tools in daily workflows with proper verification, resulting in potential errors and compliance risks.”',
    placeholder: 'e.g. Employees struggle to apply generative AI tools effectively in daily tasks without introducing factual errors or data leaks.'
  },
  {
    id: 2,
    title: 'Who is experiencing this problem?',
    shortLabel: 'Who experiences it',
    bracketLabel: 'PRIMARY TARGET AUDIENCE',
    helperText: 'Identify the employees, roles, departments or customer groups who will complete this course.',
    fieldKey: 'targetGroup',
    whyAskThis: 'Establishing target roles ensures the resulting training programme addresses real daily job constraints and realistic decision points.',
    example: '“Corporate employees, operations analysts, customer service consultants, and departmental team leads.”',
    placeholder: 'e.g. Corporate employees, operations analysts, customer service consultants, and team leads'
  },
  {
    id: 3,
    title: 'What knowledge or capability gap currently exists?',
    shortLabel: 'Knowledge or capability gap',
    bracketLabel: 'PERFORMANCE GAP & ROOT CAUSES',
    helperText: 'Describe the underlying root causes, missing skills, or process failures involved in this challenge.',
    fieldKey: 'skillGaps',
    whyAskThis: 'Identifies the precise cognitive hurdles and tool competencies needed before practical application can succeed.',
    example: '“Lack of formal training on prompt structuring, output verification checklists, and POPIA data sanitisation techniques.”',
    placeholder: 'e.g. Lack of structured prompt techniques, missing output verification checklists, and unawareness of POPIA data redaction'
  },
  {
    id: 4,
    title: 'Why is this course needed now?',
    shortLabel: 'Why it is needed',
    bracketLabel: 'WHY THIS COURSE IS NEEDED',
    helperText: 'Describe the urgency, business context, technological shifts or risks that make this learning important.',
    fieldKey: 'aiLiteracyGap',
    whyAskThis: 'Grounds the course in current workplace reality and explains why immediate behavioral change is critical.',
    example: '“Teams are adopting generative AI faster than policies and practical guidance can keep pace, creating compliance vulnerabilities.”',
    placeholder: 'e.g. AI tools are already being used informally, but employees lack a shared standard for safe, verified and accountable use.'
  },
  {
    id: 5,
    title: 'What should improve after completing the course?',
    shortLabel: 'What should improve',
    bracketLabel: 'TARGET OUTCOME & OPERATIONAL IMPACT',
    helperText: 'Describe the tangible operational, financial, compliance or productivity outcomes expected upon course completion.',
    fieldKey: 'operationalImpact',
    whyAskThis: 'Defines the measurable return on learning investment and sets expectations for summative assessments.',
    example: '“Reduction in unverified AI errors by 90%, elimination of POPIA data breach risks, and improved daily reporting productivity.”',
    placeholder: 'e.g. 90% reduction in unverified draft errors, zero POPIA data breaches, and faster turnaround on routine documentation'
  }
];

export const Section01Problem: React.FC<Section01ProblemProps> = ({
  course,
  onUpdate,
  onContinue,
  onBack
}) => {
  const [viewMode, setViewMode] = useState<'single' | 'slide' | 'guided'>('single');
  const [currentStep, setCurrentStep] = useState(1);
  const [showWhyHelp, setShowWhyHelp] = useState(false);
  const [skippedNotice, setSkippedNotice] = useState(false);

  const q = QUESTIONS[currentStep - 1] || QUESTIONS[0];
  const problem = course.problem;

  const handleSkipUnknownProblem = () => {
    onUpdate(prev => {
      const p = prev.problem;
      const title = prev.name || prev.structure?.title || 'workplace operations';
      return {
        ...prev,
        problem: {
          ...p,
          taskOrSkill: p.taskOrSkill || `Employees require practical, verified skills to execute daily tasks and decision-making in ${title} without operational delays or compliance risks.`,
          targetGroup: p.targetGroup || 'Operational specialists, team leads, consultants, and corporate knowledge workers.',
          skillGaps: p.skillGaps || '[AI Auto-Complete: Lack of standardized operating procedures, verification checklists, and statutory POPIA privacy awareness.]',
          aiLiteracyGap: p.aiLiteracyGap || '[AI Auto-Complete: Urgent operational demand for digital efficiency combined with zero-tolerance for unverified errors or data breaches.]',
          operationalImpact: p.operationalImpact || '[AI Auto-Complete: Elimination of procedural bottlenecks, audit-ready compliance, and measurable productivity improvements.]'
        }
      };
    });
    setSkippedNotice(true);
    setTimeout(() => setSkippedNotice(false), 3500);
  };

  const getFieldValue = (key: QuestionConfig['fieldKey']): string => {
    return problem[key] || '';
  };

  const handleFieldChange = (key: QuestionConfig['fieldKey'], val: string) => {
    onUpdate(prev => ({
      ...prev,
      problem: {
        ...prev.problem,
        [key]: val
      }
    }));
  };

  // Count answered questions
  const answeredCount = QUESTIONS.filter(item => {
    const val = getFieldValue(item.fieldKey);
    return Boolean(val && val.trim().length > 0);
  }).length;

  return (
    <div id="section-01-problem-container" className="space-y-6 max-w-6xl">
      {/* PowerPoint Slide 3 & 4 Header */}
      <SlideHeader
        sectionNumber="01"
        title="Problem Definition & Course Context"
        subtitle="Define the performance gap, why it matters and the outcome the course must enable."
        slideNumber="03"
        totalSlides="39"
        badgeText={`${answeredCount} of ${QUESTIONS.length} Complete`}
      />

      {/* Framework Requirement Callout */}
      <FrameworkCallout
        title="Framework Requirement"
        requirement="Must identify a clear, performance-based workplace problem that directly informs learning outcomes and scenarios."
        variant="requirement"
      />

      {/* Skip Unknown Information Banner */}
      <div className="p-4 bg-white border border-[#45CC42] rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-[#45CC42]">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#45CC42]/15 text-[#052B66] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-[#45CC42]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#052B66]">
              Not sure about root causes or operational impact metrics?
            </h4>
            <p className="text-[11.5px] text-slate-500 leading-snug">
              Skip any fields you don't know. The AI generation engine will formulate root causes, skill gaps, and measurable operational outcomes.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSkipUnknownProblem}
          className="px-4 py-2 rounded-xl text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Skip Unknown Problem Specs</span>
        </button>
      </div>

      {skippedNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-[#45CC42] text-[#052B66] text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-[#45CC42] stroke-[3]" />
          <span>Problem statement and performance gaps formulated!</span>
        </div>
      )}

      {/* View Mode Toggle: Single Portrait Panel vs 2-Column Grid vs Guided Step-by-Step */}
      <div className="flex items-center justify-between pb-1">
        <div className="text-xs text-slate-500 font-medium">
          Universal Master Prompt Template v9.0 · Context Architecture
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setViewMode('single')}
            className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'single'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <FileText className={`w-3.5 h-3.5 ${viewMode === 'single' ? 'text-[#45CC42]' : ''}`} />
            <span>Single Panel</span>
          </button>
          <button
            onClick={() => setViewMode('slide')}
            className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'slide'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <LayoutGrid className={`w-3.5 h-3.5 ${viewMode === 'slide' ? 'text-[#45CC42]' : ''}`} />
            <span>2-Column Grid</span>
          </button>
          <button
            onClick={() => setViewMode('guided')}
            className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'guided'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <ListChecks className={`w-3.5 h-3.5 ${viewMode === 'guided' ? 'text-[#45CC42]' : ''}`} />
            <span>Step-by-Step Guide</span>
          </button>
        </div>
      </div>

      {viewMode === 'single' ? (
        /* Single Cohesive Panel (Continuous Portrait Document Flow) */
        <div className="bg-slate-100/80 p-4 sm:p-8 rounded-2xl border border-slate-200/80 flex justify-center w-full min-h-[850px]">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 p-7 sm:p-10 shadow-xs space-y-7 font-sora">
            {/* Top Large Heading from SLIDE 03 - CORE CHALLENGE */}
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1.5">
                SLIDE 03 · CORE CHALLENGE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#052B66] tracking-tight">
                Problem & Impact Definition
              </h2>
            </div>

            {/* [PROBLEM STATEMENT] */}
            <EditorialField
              label="[PROBLEM STATEMENT]"
              value={problem.taskOrSkill}
              onChange={val => handleFieldChange('taskOrSkill', val)}
              placeholder="e.g. Employees struggle to apply generative AI tools effectively in daily tasks without introducing factual errors or data leaks."
              helperText="Define the specific workplace task or skill that employees struggle with or are performing unsafely."
              example="“Employees are unable to effectively apply AI tools in daily workflows with proper verification, resulting in potential errors and compliance risks.”"
              multiline
              rows={3}
              required
              requiredText="Required"
            />

            {/* [WHY THIS COURSE IS NEEDED] */}
            <EditorialField
              label="[WHY THIS COURSE IS NEEDED]"
              value={problem.aiLiteracyGap}
              onChange={val => handleFieldChange('aiLiteracyGap', val)}
              placeholder="e.g. AI tools are already being used informally, but employees lack a shared standard for safe, verified and accountable use."
              helperText="Describe the urgency, business context, technological shifts or risks that make this learning important."
              multiline
              rows={3}
              allowSkip
            />

            {/* [TARGET OUTCOME & OPERATIONAL IMPACT] */}
            <EditorialField
              label="[TARGET OUTCOME & OPERATIONAL IMPACT]"
              value={problem.operationalImpact}
              onChange={val => handleFieldChange('operationalImpact', val)}
              placeholder="e.g. 90% reduction in unverified draft errors, zero POPIA data breaches, and faster turnaround on routine documentation."
              helperText="Describe the tangible operational, financial, compliance or productivity outcomes expected upon course completion."
              multiline
              rows={3}
              allowSkip
            />

            {/* Seamlessly Integrated Heading from SLIDE 04 - TARGET PROFILE */}
            <div className="pt-6 border-t border-slate-200">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                SLIDE 04 · TARGET PROFILE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#052B66] tracking-tight">
                Audience & Capability Gap
              </h2>
            </div>

            {/* [PRIMARY TARGET AUDIENCE] */}
            <EditorialField
              label="[PRIMARY TARGET AUDIENCE]"
              value={problem.targetGroup}
              onChange={val => handleFieldChange('targetGroup', val)}
              placeholder="e.g. Corporate employees, operations analysts, customer service consultants, and team leads"
              helperText="Identify the employees, roles, departments or customer groups who will complete this course."
              multiline
              rows={2}
              required
              requiredText="Required"
            />

            {/* [PERFORMANCE GAP & ROOT CAUSES] */}
            <EditorialField
              label="[PERFORMANCE GAP & ROOT CAUSES]"
              value={problem.skillGaps}
              onChange={val => handleFieldChange('skillGaps', val)}
              placeholder="e.g. Lack of structured prompt techniques, missing output verification checklists, and unawareness of POPIA data redaction"
              helperText="Describe the underlying root causes, missing skills, or process failures involved in this challenge."
              multiline
              rows={3}
              allowSkip
            />

            {/* MASTER PROMPT FORMULA SYNTHESIS */}
            <div className="p-5 bg-gradient-to-br from-[#052B66]/5 via-white to-[#45CC42]/10 border-2 border-[#45CC42]/50 rounded-2xl space-y-2.5 mt-4 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-black uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-1 rounded-md border border-[#052B66]/20">
                  MASTER PROMPT FORMULA SYNTHESIS
                </span>
                <span className="text-[10px] bg-[#45CC42] text-[#052B66] font-bold px-2 py-0.5 rounded-full font-mono">v9.0 Standard</span>
              </div>
              <p className="text-xs text-slate-800 italic leading-relaxed pt-1">
                "This course addresses the inability of{' '}
                <span className="font-bold text-[#052B66] not-italic bg-[#052B66]/10 px-1.5 py-0.5 rounded">
                  {problem.targetGroup || '[TARGET GROUP]'}
                </span>{' '}
                to effectively perform{' '}
                <span className="font-bold text-[#052B66] not-italic bg-[#052B66]/10 px-1.5 py-0.5 rounded">
                  {problem.taskOrSkill || '[TASK / SKILL]'}
                </span>
                , resulting in{' '}
                <span className="font-bold text-[#052B66] not-italic bg-[#45CC42]/25 px-1.5 py-0.5 rounded">
                  {problem.operationalImpact || '[OPERATIONAL / COMPLIANCE IMPACT]'}
                </span>
                ."
              </p>
            </div>
          </div>
        </div>
      ) : viewMode === 'slide' ? (
        /* PowerPoint 2-Column Slide Grid (Matching Slides 3 & 4) */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (Slide 3 Left): Problem, Why Needed, Target Outcome */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
                  SLIDE 03 · CORE CHALLENGE
                </span>
                <h3 className="text-sm font-bold text-[#052B66]">
                  Problem & Impact Definition
                </h3>
              </div>

              <EditorialField
                label="[PROBLEM STATEMENT]"
                value={problem.taskOrSkill}
                onChange={val => handleFieldChange('taskOrSkill', val)}
                placeholder="e.g. Employees struggle to apply generative AI tools effectively in daily tasks without introducing factual errors or data leaks."
                helperText="Define the specific workplace task or skill that employees struggle with or are performing unsafely."
                example="“Employees are unable to effectively apply AI tools in daily workflows with proper verification, resulting in errors.”"
                multiline
                rows={3}
                required
              />

              <EditorialField
                label="[WHY THIS COURSE IS NEEDED]"
                value={problem.aiLiteracyGap}
                onChange={val => handleFieldChange('aiLiteracyGap', val)}
                placeholder="e.g. AI tools are already being used informally, but employees lack a shared standard for safe, verified and accountable use."
                helperText="Describe the urgency, business context, technological shifts or risks that make this learning important."
                multiline
                rows={3}
              />

              <EditorialField
                label="[TARGET OUTCOME & OPERATIONAL IMPACT]"
                value={problem.operationalImpact}
                onChange={val => handleFieldChange('operationalImpact', val)}
                placeholder="e.g. 90% reduction in unverified draft errors, zero POPIA data breaches, and faster turnaround on routine documentation."
                helperText="Describe the tangible operational, financial, compliance or productivity outcomes expected upon course completion."
                multiline
                rows={3}
              />
            </div>

            {/* Right Column (Slide 3 Right & Slide 4): Target Audience, Root Causes & Formula */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
                    SLIDE 04 · TARGET PROFILE
                  </span>
                  <h3 className="text-sm font-bold text-[#052B66]">
                    Audience & Capability Gap
                  </h3>
                </div>

                <EditorialField
                  label="[PRIMARY TARGET AUDIENCE]"
                  value={problem.targetGroup}
                  onChange={val => handleFieldChange('targetGroup', val)}
                  placeholder="e.g. Corporate employees, operations analysts, customer service consultants, and team leads"
                  helperText="Identify the employees, roles, departments or customer groups who will complete this course."
                  multiline
                  rows={2}
                  required
                />

                <EditorialField
                  label="[PERFORMANCE GAP & ROOT CAUSES]"
                  value={problem.skillGaps}
                  onChange={val => handleFieldChange('skillGaps', val)}
                  placeholder="e.g. Lack of structured prompt techniques, missing output verification checklists, and unawareness of POPIA data redaction"
                  helperText="Describe the underlying root causes, missing skills, or process failures involved in this challenge."
                  multiline
                  rows={3}
                />
              </div>

              {/* Master Prompt Formula Sentence Card */}
              <div className="p-5 bg-gradient-to-br from-[#052B66]/5 via-white to-[#45CC42]/10 border-2 border-[#45CC42]/50 rounded-2xl space-y-2.5 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-1 rounded-md border border-[#052B66]/20">
                    MASTER PROMPT FORMULA SYNTHESIS
                  </span>
                  <span className="text-[10px] bg-[#45CC42] text-[#052B66] font-bold px-2 py-0.5 rounded-full font-mono">v9.0 Standard</span>
                </div>
                <p className="text-xs text-slate-800 italic leading-relaxed pt-1">
                  "This course addresses the inability of{' '}
                  <span className="font-bold text-[#052B66] not-italic bg-[#052B66]/10 px-1.5 py-0.5 rounded">
                    {problem.targetGroup || '[TARGET GROUP]'}
                  </span>{' '}
                  to effectively perform{' '}
                  <span className="font-bold text-[#052B66] not-italic bg-[#052B66]/10 px-1.5 py-0.5 rounded">
                    {problem.taskOrSkill || '[TASK / SKILL]'}
                  </span>
                  , resulting in{' '}
                  <span className="font-bold text-[#052B66] not-italic bg-[#45CC42]/25 px-1.5 py-0.5 rounded">
                    {problem.operationalImpact || '[OPERATIONAL / COMPLIANCE IMPACT]'}
                  </span>
                  ."
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Guided Question-by-Question Mode */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-7 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-extrabold tracking-wider text-[#052B66] uppercase bg-slate-100 px-2.5 py-1 rounded">
                QUESTION {q.id} OF {QUESTIONS.length}
              </span>
              <div className="flex items-center gap-1.5">
                {QUESTIONS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentStep(item.id)}
                    aria-label={`Go to question ${item.id}`}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      currentStep === item.id
                        ? 'w-6 bg-[#052B66]'
                        : getFieldValue(item.fieldKey)
                        ? 'bg-[#45CC42]'
                        : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <EditorialField
              label={q.bracketLabel}
              value={getFieldValue(q.fieldKey)}
              onChange={val => handleFieldChange(q.fieldKey, val)}
              placeholder={q.placeholder}
              helperText={q.helperText}
              example={q.example}
              multiline
              rows={4}
              required
            />

            {/* Collapsible Why are we asking this? */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowWhyHelp(!showWhyHelp)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#052B66] hover:text-[#45CC42] transition-colors cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-[#052B66]" />
                <span>Why are we asking this?</span>
              </button>

              {showWhyHelp && (
                <div className="mt-2.5 p-3.5 bg-blue-50/80 border border-blue-100 rounded-lg text-xs text-slate-700 leading-relaxed">
                  {q.whyAskThis}
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className={`px-4 py-2 rounded-lg text-xs font-semibold ${
                  currentStep === 1
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer'
                }`}
              >
                ← Previous
              </button>
              <button
                onClick={() => setCurrentStep(prev => Math.min(QUESTIONS.length, prev + 1))}
                disabled={currentStep === QUESTIONS.length}
                className={`px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] cursor-pointer ${
                  currentStep === QUESTIONS.length ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Next Question →
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-5">
            <div className="bg-[#45CC42]/10 border border-[#45CC42]/30 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-1.5 text-[#052B66] font-bold text-xs">
                <Lightbulb className="w-3.5 h-3.5 text-[#45CC42]" />
                <span>Example Guidance</span>
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                {q.example}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                SECTION QUESTIONS
              </h4>
              <div className="space-y-1.5">
                {QUESTIONS.map(item => {
                  const isSelected = currentStep === item.id;
                  const isDone = Boolean(getFieldValue(item.fieldKey)?.trim());

                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentStep(item.id)}
                      className={`w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#052B66]/10 text-[#052B66] font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="shrink-0">
                        {isDone ? (
                          <Check className="w-3.5 h-3.5 text-[#45CC42] stroke-[2.5]" />
                        ) : isSelected ? (
                          <span className="w-2 h-2 rounded-full bg-[#052B66] inline-block" />
                        ) : (
                          <span className="w-2 h-2 rounded-full border border-slate-400 inline-block" />
                        )}
                      </span>
                      <span className="truncate">{item.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </button>
          )}
        </div>

        <button
          id="section-01-continue-btn"
          onClick={onContinue}
          className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Learner Profile & Sources →</span>
        </button>
      </div>

      {/* Slide Footer */}
      <SlideFooter currentSlide="03" totalSlides="39" />
    </div>
  );
};

