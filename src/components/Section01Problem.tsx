import React, { useState } from 'react';
import { Course } from '../types';
import { Check, HelpCircle, ArrowRight, ArrowLeft, Lightbulb, Info } from 'lucide-react';

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
    helperText: 'Define the specific workplace task or skill that employees struggle with or are performing unsafely.',
    fieldKey: 'taskOrSkill',
    whyAskThis: 'The Master Prompt requires a concrete, performance-focused problem statement to anchor all subsequent modules, learning objectives, and scenarios.',
    example: '“Employees are unable to effectively apply AI tools in daily workflows with proper verification, resulting in potential errors and compliance risks.”',
    placeholder: 'e.g. Effectively apply generative AI tools in daily workflows with proper verification'
  },
  {
    id: 2,
    title: 'Who is experiencing this problem?',
    shortLabel: 'Who experiences it',
    helperText: 'Identify the employees, roles, departments or customer groups who will complete this course.',
    fieldKey: 'targetGroup',
    whyAskThis: 'Establishing target roles ensures the resulting training programme addresses real daily job constraints and realistic decision points.',
    example: '“Corporate employees, operations analysts, customer service consultants, and departmental team leads.”',
    placeholder: 'e.g. Corporate employees and operational teams'
  },
  {
    id: 3,
    title: 'What knowledge or capability gap currently exists?',
    shortLabel: 'Knowledge or capability gap',
    helperText: 'Describe the underlying root causes, missing skills, or process failures involved in this challenge.',
    fieldKey: 'skillGaps',
    whyAskThis: 'Identifies the precise cognitive hurdles and tool competencies needed before practical application can succeed.',
    example: '“Lack of formal training on prompt structuring, output verification checklists, and POPIA data sanitisation techniques.”',
    placeholder: 'e.g. Prompt structuring, output fact-checking, POPIA data sanitisation'
  },
  {
    id: 4,
    title: 'Why is this course needed now?',
    shortLabel: 'Why it is needed',
    helperText: 'Describe the urgency, business context, technological shifts or risks that make this learning important.',
    fieldKey: 'aiLiteracyGap',
    whyAskThis: 'Grounds the course in current workplace reality and explains why immediate behavioral change is critical.',
    example: '“Teams are adopting generative AI faster than policies and practical guidance can keep pace, creating compliance vulnerabilities.”',
    placeholder: 'e.g. AI tools are already being used informally, but employees lack a shared standard for safe, effective and accountable use.'
  },
  {
    id: 5,
    title: 'What should improve after completing the course?',
    shortLabel: 'What should improve',
    helperText: 'Describe the tangible operational, financial, compliance or productivity outcomes expected upon course completion.',
    fieldKey: 'operationalImpact',
    whyAskThis: 'Defines the measurable return on learning investment and sets expectations for summative assessments.',
    example: '“Reduction in unverified AI errors by 90%, elimination of POPIA data breach risks, and improved daily reporting productivity.”',
    placeholder: 'e.g. Poor decision-making, inadvertent data privacy breaches under POPIA, and unverified misleading communications'
  }
];

export const Section01Problem: React.FC<Section01ProblemProps> = ({
  course,
  onUpdate,
  onContinue,
  onBack
}) => {
  const [currentStep, setCurrentStep] = useState(4); // Default to question 4 to match mockup Page 2 or 1
  const [showWhyHelp, setShowWhyHelp] = useState(false);

  const q = QUESTIONS[currentStep - 1] || QUESTIONS[0];

  // Values from course problem model
  const problem = course.problem;

  const getFieldValue = (key: QuestionConfig['fieldKey']): string => {
    return problem[key] || '';
  };

  const handleFieldChange = (val: string) => {
    onUpdate(prev => ({
      ...prev,
      problem: {
        ...prev.problem,
        [q.fieldKey]: val
      }
    }));
  };

  // Count answered questions
  const answeredCount = QUESTIONS.filter(item => {
    const val = getFieldValue(item.fieldKey);
    return Boolean(val && val.trim().length > 0);
  }).length;

  const currentVal = getFieldValue(q.fieldKey);

  return (
    <div id="section-01-problem-container" className="space-y-8 max-w-5xl">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-mono text-[#052B66]">01</span>
            <h2 className="text-2xl font-extrabold text-[#052B66] tracking-tight">
              Problem & Challenge
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Start with the workplace problem. We'll guide you through one decision at a time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-[#45CC42]/15 text-[#052B66] rounded-full border border-[#45CC42]/30">
            {answeredCount} of {QUESTIONS.length} answered
          </span>
        </div>
      </div>

      {/* Main Guided Card + Side Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Question Card (col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
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

          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-[#052B66] tracking-tight">
              {q.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {q.helperText}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Your response *
            </label>
            <textarea
              id={`section-01-input-q${q.id}`}
              rows={4}
              value={currentVal}
              onChange={e => handleFieldChange(e.target.value)}
              placeholder={q.placeholder}
              className="w-full p-4 rounded-lg border border-slate-300 text-sm text-slate-800 focus:border-[#052B66] focus:ring-2 focus:ring-[#052B66]/10 outline-none leading-relaxed resize-y bg-slate-50/50"
            />
          </div>

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

          {/* Sentence Builder Preview */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1.5">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              Master Prompt Formula Sentence
            </span>
            <p className="text-xs text-slate-700 italic leading-relaxed">
              "This course addresses the inability of{' '}
              <span className="font-semibold text-[#052B66] not-italic">
                {problem.targetGroup || '[TARGET GROUP]'}
              </span>{' '}
              to effectively perform{' '}
              <span className="font-semibold text-[#052B66] not-italic">
                {problem.taskOrSkill || '[TASK / SKILL]'}
              </span>
              , resulting in{' '}
              <span className="font-semibold text-[#052B66] not-italic">
                {problem.operationalImpact || '[OPERATIONAL / COMPLIANCE IMPACT]'}
              </span>
              ."
            </p>
          </div>
        </div>

        {/* Right Rail: Example Box & Section Questions Checklist (col-span-4) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Example Box */}
          <div className="bg-[#45CC42]/10 border border-[#45CC42]/30 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-1.5 text-[#052B66] font-bold text-xs">
              <Lightbulb className="w-3.5 h-3.5 text-[#45CC42]" />
              <span>Example</span>
            </div>
            <p className="text-xs text-slate-700 italic leading-relaxed">
              {q.example}
            </p>
          </div>

          {/* Section Questions Checklist */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
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
                    className={`w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors cursor-pointer ${
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

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold text-[#052B66] bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Previous Question
            </button>
          )}

          {currentStep < QUESTIONS.length ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              id="section-01-continue-btn"
              onClick={onContinue}
              className="px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Continue to Sources →</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
