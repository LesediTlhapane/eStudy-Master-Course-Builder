import React, { useState } from 'react';
import { Course, AssessmentItem } from '../types';
import { ArrowLeft, ArrowRight, Check, Sparkles, BookOpen, Layers, CheckCircle2, Award, FileText, Plus, Trash2 } from 'lucide-react';
import { SlideHeader } from './SlideHeader';
import { SlideFooter } from './SlideFooter';
import { FrameworkCallout } from './FrameworkCallout';
import { EditorialField } from './EditorialField';

interface Section05LearningDesignProps {
  course: Course;
  onUpdate: (updater: (prev: Course) => Course) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const Section05LearningDesign: React.FC<Section05LearningDesignProps> = ({
  course,
  onUpdate,
  onContinue,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'pedagogy' | 'assessment' | 'engagement'>('pedagogy');
  const ld = course.learningDesign;

  const handleFieldChange = (field: keyof Course['learningDesign'], val: any) => {
    onUpdate(prev => ({
      ...prev,
      learningDesign: {
        ...prev.learningDesign,
        [field]: val
      }
    }));
  };

  const [newActivity, setNewActivity] = useState('');
  const handleAddActivity = () => {
    if (!newActivity.trim()) return;
    handleFieldChange('workplaceActivities', [...(ld.workplaceActivities || []), newActivity.trim()]);
    setNewActivity('');
  };

  const handleDeleteActivity = (idx: number) => {
    handleFieldChange('workplaceActivities', (ld.workplaceActivities || []).filter((_, i) => i !== idx));
  };

  return (
    <div id="section-05-learning-design-container" className="space-y-6 max-w-6xl">
      {/* Slide Header */}
      <SlideHeader
        sectionNumber="05"
        title="Learning Design, Pedagogy & Assessment Strategy"
        subtitle="Establish instructional progression, cognitive load balance, active learning methods, and rigorous assessment."
        slideNumber="25"
        totalSlides="39"
        badgeText="Pedagogical Model Active"
      />

      {/* Framework Requirement Callout */}
      <FrameworkCallout
        title="Framework Requirement"
        requirement="Instructional design must use Bloom's taxonomy verbs, active workplace practice, formative scenario checks, authentic workplace tasks, and plain English accessibility."
        variant="requirement"
      />

      {/* Slide Tab Navigation */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('pedagogy')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pedagogy'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Slide 25: Instructional Model & Pedagogy</span>
          </button>

          <button
            onClick={() => setActiveTab('assessment')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'assessment'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Slide 26: Assessment Model & Rubric</span>
          </button>

          <button
            onClick={() => setActiveTab('engagement')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'engagement'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Slide 27: Micro-Learning & Engagement</span>
          </button>
        </div>
      </div>

      {activeTab === 'pedagogy' && (
        /* Slide 25: Instructional Model */
        <div className="space-y-6">
          {/* 3-Tier Instructional Progression Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                SLIDE 25 · 3-TIER PROGRESSION
              </span>
              <h3 className="text-sm font-bold text-[#052B66]">
                [INSTRUCTIONAL PROGRESSION & COGNITIVE SCAFFOLDING]
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#052B66] text-white text-[10px] font-bold flex items-center justify-center font-mono">
                    1
                  </span>
                  <span className="text-xs font-bold text-[#052B66]">Tier 1: Foundational</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Demystification, core principles, mental models, key terminology, and ethical boundaries.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#052B66] text-white text-[10px] font-bold flex items-center justify-center font-mono">
                    2
                  </span>
                  <span className="text-xs font-bold text-[#052B66]">Tier 2: Applied</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tool execution, prompt templates, step-by-step SOP procedures, and authentic workplace decision trees.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#052B66] text-white text-[10px] font-bold flex items-center justify-center font-mono">
                    3
                  </span>
                  <span className="text-xs font-bold text-[#052B66]">Tier 3: Evaluative</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Output verification, hallucination audits, statutory compliance sign-off, and organizational SOPs.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
              <EditorialField
                label="[INSTRUCTIONAL APPROACH & METHODOLOGY]"
                value={ld.instructionalApproach || 'Scenario-based, blended learning with explicit worked examples, guided deliberate practice, and authentic workplace problem solving.'}
                onChange={val => handleFieldChange('instructionalApproach', val)}
                multiline
                rows={3}
                helperText="Overarching pedagogical philosophy and learning flow."
              />

              <EditorialField
                label="[CORE STANDARDS SUMMARY]"
                value={ld.coreStandardsSummary || 'Adheres strictly to SAQA Level 5 outcome criteria, Plain English drafting, and WCAG 2.1 AA digital accessibility standards.'}
                onChange={val => handleFieldChange('coreStandardsSummary', val)}
                multiline
                rows={3}
                helperText="Applicable educational, accreditation, or internal quality standards."
              />
            </div>

            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
              <EditorialField
                label="[AI DEMO / SIMULATION FORMAT]"
                value={ld.aiDemoSimulationDescription || 'Interactive prompt sandboxes with before-and-after output comparisons, highlighting bias and factual verification routines.'}
                onChange={val => handleFieldChange('aiDemoSimulationDescription', val)}
                multiline
                rows={3}
                helperText="How practical demonstrations, simulations, or AI tooling exercises are structured."
              />

              <EditorialField
                label="[COLLABORATION & PEER ACTIVITIES]"
                value={ld.collaborationActivity || 'Peer prompt audits, departmental debrief sessions, and collaborative scenario analysis.'}
                onChange={val => handleFieldChange('collaborationActivity', val)}
                multiline
                rows={3}
                helperText="How learners interact, review work, and share insights."
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assessment' && (
        /* Slide 26: Assessment Model */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Formative Assessments */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  SLIDE 26 · FORMATIVE CHECKS
                </span>
                <h3 className="text-sm font-bold text-[#052B66]">
                  [FORMATIVE ASSESSMENT MODEL]
                </h3>
              </div>

              <EditorialField
                label="[KNOWLEDGE CHECKS & DIAGNOSTIC GATES]"
                value={ld.knowledgeChecksDescription || '3 scenario-based multiple-choice checks per module with detailed rationales for correct and incorrect options.'}
                onChange={val => handleFieldChange('knowledgeChecksDescription', val)}
                multiline
                rows={3}
                helperText="In-module formative checks and milestone reflection checkpoints."
              />

              <EditorialField
                label="[PROMPT & CRITICAL EVALUATION EXERCISES]"
                value={ld.promptExerciseDescription || 'Learners analyze real-world scenario prompts, identify missing context, redact sensitive data, and verify model responses against statutory rules.'}
                onChange={val => handleFieldChange('promptExerciseDescription', val)}
                multiline
                rows={3}
                helperText="Hands-on practice exercises testing critical evaluation skills."
              />
            </div>

            {/* Summative Capstone */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  SLIDE 26 · SUMMATIVE CAPSTONE
                </span>
                <h3 className="text-sm font-bold text-[#052B66]">
                  [SUMMATIVE CAPSTONE ARTIFACTS]
                </h3>
              </div>

              <EditorialField
                label="[AI EVALUATION TASK & CAPSTONE]"
                value={ld.aiEvaluationTask || 'Comprehensive capstone case study: Develop a department-specific AI prompt protocol, 30-day rollout checklist, and statutory risk mitigation matrix.'}
                onChange={val => handleFieldChange('aiEvaluationTask', val)}
                multiline
                rows={3}
                helperText="Authentic workplace deliverable evaluating end-to-end competence."
              />

              <EditorialField
                label="[CRITICAL THINKING & RUBRIC METRICS]"
                value={ld.criticalThinkingDescription || 'Four-pillar rubric: 1) Prompt Precision, 2) Output Verification, 3) Regulatory & POPIA Compliance, 4) Workplace Implementation Feasibility.'}
                onChange={val => handleFieldChange('criticalThinkingDescription', val)}
                multiline
                rows={3}
                helperText="Specific scoring criteria and performance dimensions."
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'engagement' && (
        /* Slide 27: Micro-Learning & Engagement */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                SLIDE 27 · RETENTION
              </span>
              <h3 className="text-sm font-bold text-[#052B66]">
                [LEARNER ENGAGEMENT & REFLECTION]
              </h3>
            </div>

            <EditorialField
              label="[REFLECTION PROMPTS & DEBRIEF]"
              value={ld.reflectionPrompts || 'How would you explain your verification process to an auditor or client if an AI output contained an error?'}
              onChange={val => handleFieldChange('reflectionPrompts', val)}
              multiline
              rows={3}
              helperText="Metacognitive prompts encouraging deeper retention and ethical accountability."
            />

            <EditorialField
              label="[EXAMPLES & RELEVANCE STRATEGY]"
              value={ld.examplesAndRelevance || 'Authentic South African enterprise examples reflecting banking, insurance, customer service, and public sector contexts.'}
              onChange={val => handleFieldChange('examplesAndRelevance', val)}
              multiline
              rows={3}
              helperText="How examples are curated to maximize workplace relatability."
            />
          </div>

          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#052B66]">
                [AUTHENTIC WORKPLACE ACTIVITIES]
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                {(ld.workplaceActivities || []).length} configured
              </span>
            </div>

            <div className="space-y-2">
              {(ld.workplaceActivities || []).map((act, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-200">
                  <span className="text-slate-700">{act}</span>
                  <button onClick={() => handleDeleteActivity(idx)} className="text-rose-500 hover:text-rose-700 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newActivity}
                onChange={e => setNewActivity(e.target.value)}
                placeholder="e.g. Audit a live client report draft using the 3-point verification checklist"
                className="flex-1 text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#052B66] outline-none"
              />
              <button
                type="button"
                onClick={handleAddActivity}
                className="px-3.5 py-2.5 bg-[#052B66] text-white font-bold rounded-lg text-xs hover:bg-[#042150] cursor-pointer"
              >
                Add
              </button>
            </div>
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
          <span>← Back to Modules</span>
        </button>

        <button
          id="section-05-continue-btn"
          onClick={onContinue}
          className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Ethics & AI Governance (Section 06) →</span>
        </button>
      </div>

      {/* Slide Footer */}
      <SlideFooter currentSlide="25" totalSlides="39" />
    </div>
  );
};
