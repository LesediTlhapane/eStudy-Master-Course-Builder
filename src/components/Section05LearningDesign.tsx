import React, { useState } from 'react';
import { Course } from '../types';
import { ArrowLeft, BookOpen, Cpu, CheckCircle2, Trash2 } from 'lucide-react';
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
  const ld = course.learningDesign;
  const flagged = course.flaggedFields || {};

  const confirmFlag = (key: string) => {
    onUpdate(prev => {
      const next = { ...(prev.flaggedFields || {}) };
      delete next[key];
      return { ...prev, flaggedFields: next };
    });
  };

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
    handleFieldChange(
      'workplaceActivities',
      (ld.workplaceActivities || []).filter((_, i) => i !== idx)
    );
  };

  return (
    <div id="section-05-learning-design-container" className="space-y-8 max-w-6xl font-sora">
      {/* Slide Header */}
      <SlideHeader
        sectionNumber="05"
        title="5. LEARNING DESIGN REQUIREMENTS"
        subtitle="Specify 5.1 Core Design Standards, 5.2 AI-Enhanced Learning Design, and 5.3 Assessment Design on a single page."
        slideNumber="05"
        totalSlides="09"
        badgeText="Section 5 · Learning Design"
      />

      {/* Framework Requirement Callout */}
      <FrameworkCallout
        title="Instructional Design Requirement"
        requirement="Courses must follow a structured progression from foundational understanding to applied workplace intervention, incorporating practical activities, reflection prompts, and measurable assessments."
        variant="requirement"
      />

      {/* ================================================================= */}
      {/* 5.1 CORE DESIGN STANDARDS                                         */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs border-l-4 border-l-[#052B66]">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
            SUBSECTION 5.1
          </span>
          <h3 className="text-base font-extrabold text-[#052B66] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#45CC42]" />
            <span>5.1 Core Design Standards</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Define the overarching pedagogical methodology, worked examples, reflection prompts, and authentic workplace activities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <EditorialField
            label="Instructional Approach & Methodology"
            value={ld.instructionalApproach}
            onChange={val => handleFieldChange('instructionalApproach', val)}
            placeholder="e.g. Scenario-based, blended learning with explicit worked examples, guided deliberate practice, and authentic workplace problem solving."
            example="Scenario-based adult learning combining foundational concepts, worked South African workplace examples, and practical application tasks."
            multiline
            rows={3}
            required
          />

          <EditorialField
            label="Core Standards Summary"
            value={ld.coreStandardsSummary}
            onChange={val => handleFieldChange('coreStandardsSummary', val)}
            placeholder="e.g. Adheres to SAQA outcome criteria, Plain South African English drafting, and WCAG 2.1 AA digital accessibility standards."
            multiline
            rows={3}
            required
          />

          <EditorialField
            label="Examples & Workplace Relevance Strategy"
            value={ld.examplesAndRelevance}
            onChange={val => handleFieldChange('examplesAndRelevance', val)}
            placeholder="e.g. Authentic South African enterprise examples reflecting banking, retail, manufacturing, or public sector operations."
            multiline
            rows={3}
          />

          <EditorialField
            label="Reflection Prompts & Debrief Approach"
            value={ld.reflectionPrompts}
            onChange={val => handleFieldChange('reflectionPrompts', val)}
            placeholder="e.g. End-of-module reflection prompts asking learners how they would verify outputs and explain decisions to an auditor."
            multiline
            rows={3}
          />
        </div>

        {/* Authentic Workplace Activities List */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold tracking-wider text-[#052B66] uppercase">
              Authentic Workplace Activities ({(ld.workplaceActivities || []).length} Configured)
            </label>
          </div>

          {(ld.workplaceActivities || []).length > 0 && (
            <div className="space-y-2">
              {(ld.workplaceActivities || []).map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-200"
                >
                  <span className="text-slate-700">{act}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteActivity(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newActivity}
              onChange={e => setNewActivity(e.target.value)}
              placeholder="Add a practical workplace activity (e.g. Audit a departmental report draft using the 3-point verification checklist)..."
              className="flex-1 text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#052B66] outline-none"
            />
            <button
              type="button"
              onClick={handleAddActivity}
              className="px-4 py-2.5 bg-[#052B66] text-white font-bold rounded-lg text-xs hover:bg-[#042150] cursor-pointer"
            >
              Add Activity
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 5.2 AI-ENHANCED LEARNING DESIGN                                   */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
            SUBSECTION 5.2
          </span>
          <h3 className="text-base font-extrabold text-[#052B66] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#45CC42]" />
            <span>5.2 AI-Enhanced Learning Design</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Define how AI demonstrations, prompt exercises, critical thinking evaluations, and human-AI collaboration activities are structured.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <EditorialField
            label="AI Demonstration or Simulation Format"
            value={ld.aiDemoSimulationDescription}
            onChange={val => handleFieldChange('aiDemoSimulationDescription', val)}
            placeholder="e.g. Interactive prompt demonstrations with before-and-after output comparisons highlighting verification steps."
            multiline
            rows={3}
          />

          <EditorialField
            label="Prompting & Practical Evaluation Exercises"
            value={ld.promptExerciseDescription}
            onChange={val => handleFieldChange('promptExerciseDescription', val)}
            placeholder="e.g. Learners analyse workplace prompts, redact sensitive POPIA data, and critique AI-generated responses."
            multiline
            rows={3}
          />

          <EditorialField
            label="Critical Thinking & Output Verification Rubric"
            value={ld.criticalThinkingDescription}
            onChange={val => handleFieldChange('criticalThinkingDescription', val)}
            placeholder="e.g. Four-pillar verification rubric: Accuracy, Completeness, Regulatory Compliance, and Tone."
            multiline
            rows={3}
          />

          <EditorialField
            label="Human-AI Collaboration & Peer Review Activity"
            value={ld.collaborationActivity}
            onChange={val => handleFieldChange('collaborationActivity', val)}
            placeholder="e.g. Peer review of AI-assisted drafts and supervisory sign-off simulations."
            multiline
            rows={3}
          />
        </div>
      </div>

      {/* ================================================================= */}
      {/* 5.3 ASSESSMENT DESIGN                                             */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs border-l-4 border-l-[#45CC42]">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#45CC42]/20 px-2.5 py-0.5 rounded-md border border-[#45CC42]/40 inline-block mb-1">
            SUBSECTION 5.3
          </span>
          <h3 className="text-base font-extrabold text-[#052B66] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#052B66]" />
            <span>5.3 Assessment Design</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete the official Section 5.3 Assessment Design specifications, including Practical Task Weighting (%) and Final Assessment Pass Mark (%).
          </p>
        </div>

        {/* Official PDF Section 5.3 Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#052B66] text-white text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4 w-1/4">Assessment Type</th>
                <th className="py-3 px-4 w-1/2">Format & Purpose</th>
                <th className="py-3 px-4">Weighting / Pass Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              <tr className="bg-white">
                <td className="py-3.5 px-4 font-bold text-[#052B66]">Pre-Assessment</td>
                <td className="py-3.5 px-4 text-slate-600">
                  5–10 diagnostic questions (including AI readiness) to establish baseline
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-700">Diagnostic (ungraded)</td>
              </tr>
              <tr className="bg-slate-50/60">
                <td className="py-3.5 px-4 font-bold text-[#052B66]">Formative Quizzes</td>
                <td className="py-3.5 px-4 text-slate-600">
                  Short quizzes after each module (MCQ, true/false, scenario match)
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-700">70% to progress</td>
              </tr>
              <tr className="bg-white">
                <td className="py-3.5 px-4 font-bold text-[#052B66]">Practical Task</td>
                <td className="py-3.5 px-4 text-slate-600">
                  Hands-on workplace task per module (at least 1 must involve AI evaluation)
                </td>
                <td className="py-3.5 px-4">
                  <input
                    type="text"
                    value={ld.practicalTaskWeighting || ''}
                    onChange={e => handleFieldChange('practicalTaskWeighting', e.target.value)}
                    placeholder="[INSERT %] e.g. 40% of final mark"
                    className="w-full text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:border-[#052B66] outline-none font-semibold text-[#052B66]"
                  />
                </td>
              </tr>
              <tr className="bg-slate-50/60">
                <td className="py-3.5 px-4 font-bold text-[#052B66]">Final Assessment</td>
                <td className="py-3.5 px-4 text-slate-600">
                  Comprehensive test + applied project / case study
                </td>
                <td className="py-3.5 px-4">
                  <input
                    type="text"
                    value={ld.finalAssessmentPassMark || ''}
                    onChange={e => handleFieldChange('finalAssessmentPassMark', e.target.value)}
                    placeholder="[INSERT %] e.g. 75% pass mark"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:border-[#052B66] outline-none font-semibold text-[#052B66]"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <EditorialField
            label="Formative Knowledge Checks & Diagnostic Gates"
            value={ld.knowledgeChecksDescription}
            onChange={val => handleFieldChange('knowledgeChecksDescription', val)}
            placeholder="e.g. 5 scenario-based multiple-choice checks per module with detailed rationales for correct and incorrect options."
            multiline
            rows={3}
            required
          />

          <EditorialField
            label="Summative Capstone & Applied Evaluation Task"
            value={ld.aiEvaluationTask}
            onChange={val => handleFieldChange('aiEvaluationTask', val)}
            placeholder="e.g. Comprehensive capstone case study: Develop a department-specific workflow protocol, 30-day rollout checklist, and risk mitigation matrix."
            multiline
            rows={3}
            required
            flaggedNote={flagged['learningDesign.aiEvaluationTask']}
            onConfirmFlag={() => confirmFlag('learningDesign.aiEvaluationTask')}
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
          <span>← Back to Section 4: Module Breakdown</span>
        </button>

        <button
          id="section-05-continue-btn"
          onClick={onContinue}
          className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Section 6: Ethical & Professional Standards →</span>
        </button>
      </div>

      <SlideFooter currentSlide="05" totalSlides="09" />
    </div>
  );
};
