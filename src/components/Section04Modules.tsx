import React, { useState } from 'react';
import { Course, CourseModule, ModuleRequirements } from '../types';
import { ScenarioBuilder } from './ScenarioBuilder';
import {
  Plus,
  Trash2,
  ArrowLeft,
  Layers,
  CheckCircle2,
  BookOpen,
  Cpu,
  ClipboardCheck
} from 'lucide-react';
import { SlideHeader } from './SlideHeader';
import { SlideFooter } from './SlideFooter';
import { FrameworkCallout } from './FrameworkCallout';
import { EditorialField } from './EditorialField';

interface Section04ModulesProps {
  course: Course;
  onUpdate: (updater: (prev: Course) => Course) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const Section04Modules: React.FC<Section04ModulesProps> = ({
  course,
  onUpdate,
  onContinue,
  onBack
}) => {
  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(0);

  const modules = course.modules || [];
  const safeActiveIndex = Math.min(activeModuleIndex, Math.max(0, modules.length - 1));
  const activeModule = modules[safeActiveIndex];

  const handleUpdateModule = (
    modIdx: number,
    updater: Partial<CourseModule> | ((prev: CourseModule) => CourseModule)
  ) => {
    onUpdate(prev => {
      const updated = [...prev.modules];
      if (updated[modIdx]) {
        updated[modIdx] =
          typeof updater === 'function'
            ? updater(updated[modIdx])
            : { ...updated[modIdx], ...updater };
      }
      return {
        ...prev,
        modules: updated
      };
    });
  };

  const handleUpdateRequirements = (
    modIdx: number,
    reqField: keyof ModuleRequirements,
    val: any
  ) => {
    handleUpdateModule(modIdx, prev => ({
      ...prev,
      requirements: {
        ...(prev.requirements || ({} as ModuleRequirements)),
        [reqField]: val
      }
    }));
  };

  const handleAddModule = () => {
    const newNum = modules.length + 1;
    const newMod: CourseModule = {
      id: `mod-${Date.now()}`,
      number: newNum,
      moduleNumber: newNum,
      title: '',
      subtitle: '',
      purpose: '',
      keySkills: '',
      learningOutcomes: [],
      learningObjectives: [],
      coreConcepts: '',
      definitionsFrameworks: '',
      rootCausesExploration: '',
      aiTopicCoverage: '',
      practicalExercises: '',
      workplaceScenarios: '',
      miniCaseStudy: '',
      aiPracticalElement: '',
      implementationPlan: '',
      sopTemplatesChecklists: '',
      kpiMetrics: '',
      capstoneProject: '',
      aiGovernanceElement: '',
      lessons: [],
      status: 'Not started',
      requirements: {
        problemDefinition: '',
        workplaceContext: '',
        keyTerms: '',
        causes: '',
        warningSigns: '',
        impactStatement: '',
        aiDemystification: '',
        aiInThisDomain: '',
        aiToolsOverview: '',
        responsibleAiPrinciples: '',
        toolsAndTechniques: '',
        procedureSteps: '',
        roleResponsibilities: '',
        communicationApproach: '',
        supportMechanisms: '',
        scenarios: [],
        aiScenarios: [],
        implementationStrategy: '',
        rolloutMethod: '',
        meApproach: '',
        improvementCycle: '',
        implementationChecklistTitle: '',
        rolloutFrameworkTitle: '',
        riskComplianceSectionTitle: '',
        continuousAiLearningApproach: '',
        aiGovernanceFramework: '',
        aiFeedbackReviewMechanism: ''
      }
    };

    onUpdate(prev => ({
      ...prev,
      modules: [...prev.modules, newMod]
    }));
    setActiveModuleIndex(modules.length);
  };

  const handleDeleteModule = (idx: number) => {
    if (modules.length <= 3) return;
    onUpdate(prev => ({
      ...prev,
      modules: prev.modules
        .filter((_, i) => i !== idx)
        .map((m, i) => ({
          ...m,
          number: i + 1,
          moduleNumber: i + 1
        }))
    }));
    if (activeModuleIndex >= idx) {
      setActiveModuleIndex(Math.max(0, activeModuleIndex - 1));
    }
  };

  const getOfficialModuleHeading = (idx: number) => {
    if (idx === 0) return '4.1 MODULE 1: FOUNDATIONAL UNDERSTANDING';
    if (idx === 1) return '4.2 MODULE 2: PRACTICAL APPLICATION & INTERVENTION';
    if (idx === 2) return '4.3 MODULE 3: IMPLEMENTATION & WORKPLACE INTEGRATION';
    return `4.${idx + 1} MODULE ${idx + 1}: SPECIALISED APPLICATION MODULE`;
  };

  const req = activeModule?.requirements || ({} as ModuleRequirements);

  return (
    <div id="section-04-modules-container" className="space-y-8 max-w-6xl font-sora">
      {/* Slide Header */}
      <SlideHeader
        sectionNumber="04"
        title="4. MODULE BREAKDOWN"
        subtitle="Complete the official eStudy 3-module progression (4.1 Foundational Understanding, 4.2 Practical Application & Intervention, 4.3 Implementation & Workplace Integration)."
        slideNumber="04"
        totalSlides="09"
        badgeText={`${modules.length} Modules (Min 3)`}
      />

      <FrameworkCallout
        title="Mandatory Module Progression"
        requirement="Every course must include at least 3 modules: Module 1 (Foundational Understanding & AI Literacy Foundation), Module 2 (Practical Application, Step-by-Step Procedures & Workplace Scenarios), and Module 3 (Implementation, Mandatory Deliverables & AI Governance)."
        variant="requirement"
      />

      {/* Module Selector Tabs */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66]">
            SELECT MODULE TO COMPLETE ({modules.length} MODULES)
          </span>

          <button
            id="add-module-header-btn"
            type="button"
            onClick={handleAddModule}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#45CC42] hover:bg-[#3ec23b] text-[#052B66] shadow-xs transition-all cursor-pointer self-start"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Optional Module {modules.length + 1}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {modules.map((m, idx) => {
            const isSelected = safeActiveIndex === idx;
            const scenarioCount = (m.requirements?.scenarios || []).length;

            return (
              <button
                key={m.id || idx}
                type="button"
                onClick={() => setActiveModuleIndex(idx)}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'border-[#052B66] bg-[#052B66] text-white shadow-md'
                    : 'border-slate-200 bg-white hover:border-[#45CC42] text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`font-mono text-xs font-black px-2 py-0.5 rounded ${
                      isSelected ? 'bg-[#45CC42] text-[#052B66]' : 'bg-[#052B66]/10 text-[#052B66]'
                    }`}
                  >
                    4.{idx + 1} · MODULE {idx + 1}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-white/15 text-white'
                        : 'bg-[#45CC42]/20 text-[#052B66]'
                    }`}
                  >
                    {scenarioCount} scenario(s)
                  </span>
                </div>

                <div className="w-full">
                  <h4 className={`text-xs font-extrabold truncate ${isSelected ? 'text-white' : 'text-[#052B66]'}`}>
                    {m.title?.trim() ? m.title : getOfficialModuleHeading(idx)}
                  </h4>
                  <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                    {m.purpose?.trim() ? m.purpose : 'Click to complete module details'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Module Editor (Single Clean Vertical Layout per Module) */}
      {activeModule && (
        <div className="space-y-6">
          {/* Module Identity & Learning Objectives */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5 border-l-4 border-l-[#052B66]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-extrabold text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 uppercase tracking-wider inline-block mb-1">
                  SECTION 4.{safeActiveIndex + 1}
                </span>
                <h3 className="text-base font-extrabold text-[#052B66]">
                  {getOfficialModuleHeading(safeActiveIndex)}
                </h3>
              </div>

              {modules.length > 3 && (
                <button
                  type="button"
                  onClick={() => handleDeleteModule(safeActiveIndex)}
                  className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 self-start"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Optional Module</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <EditorialField
                label={`Module ${safeActiveIndex + 1} Title [INSERT]`}
                value={activeModule.title}
                onChange={val => handleUpdateModule(safeActiveIndex, { title: val })}
                placeholder={`e.g. ${
                  safeActiveIndex === 0
                    ? 'Foundations of Workplace Financial & AI Literacy'
                    : safeActiveIndex === 1
                    ? 'Applied Workflows, Tools & Verification Procedures'
                    : 'Departmental Implementation, SOPs & Governance'
                }`}
                required
              />

              <EditorialField
                label="Module Subtitle / Focus Area"
                value={activeModule.subtitle || ''}
                onChange={val => handleUpdateModule(safeActiveIndex, { subtitle: val })}
                placeholder="e.g. Core concepts, root causes, and foundational skills"
              />

              <EditorialField
                label="Module Purpose"
                value={activeModule.purpose}
                onChange={val => handleUpdateModule(safeActiveIndex, { purpose: val })}
                placeholder="State what this module achieves within the overall course progression..."
                multiline
                rows={3}
                required
              />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold tracking-wider text-[#052B66] uppercase">
                    Learning Objectives (Bloom's Taxonomy Verbs) <span className="text-rose-600 font-black">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">1 objective per line</span>
                </div>
                <textarea
                  rows={3}
                  value={(activeModule.learningObjectives || activeModule.learningOutcomes || []).join('\n')}
                  onChange={e => {
                    const lines = e.target.value.split('\n');
                    handleUpdateModule(safeActiveIndex, {
                      learningObjectives: lines,
                      learningOutcomes: lines
                    });
                  }}
                  placeholder={
                    "Define key operational concepts and regulatory requirements\nIdentify early warning signs of process failure\nApply structured verification checklists in daily tasks"
                  }
                  className="w-full text-xs font-normal text-slate-900 bg-white border border-slate-300 rounded-lg p-3 focus:border-[#052B66] outline-none leading-relaxed resize-y"
                />
              </div>
            </div>
          </div>

          {/* 4.1.1 / 4.2.1 / 4.3.1 Core Content & Procedures */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="text-sm font-extrabold text-[#052B66] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#45CC42]" />
                <span>
                  {safeActiveIndex === 0
                    ? '4.1.1 Core Content Requirements (Problem Definition, Workplace Context, Key Terms, Causes, Warning Signs & Impact)'
                    : safeActiveIndex === 1
                    ? '4.2.1 Core Content Requirements (Tools & Techniques, Step-by-Step Procedures, Role Responsibilities & Support)'
                    : `4.${safeActiveIndex + 1}.1 Core Content & Implementation Strategy`}
                </span>
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <EditorialField
                label="Problem Definition & Workplace Context [INSERT]"
                value={req.problemDefinition || activeModule.coreConcepts || ''}
                onChange={val => {
                  handleUpdateRequirements(safeActiveIndex, 'problemDefinition', val);
                  handleUpdateModule(safeActiveIndex, { coreConcepts: val });
                }}
                placeholder="Define the specific workplace challenge, concepts, and operational context covered in this module..."
                multiline
                rows={3}
                required
              />

              <EditorialField
                label="Key Terms, Definitions & Frameworks [INSERT]"
                value={req.keyTerms || activeModule.definitionsFrameworks || ''}
                onChange={val => {
                  handleUpdateRequirements(safeActiveIndex, 'keyTerms', val);
                  handleUpdateModule(safeActiveIndex, { definitionsFrameworks: val });
                }}
                placeholder="List the essential domain terminology, definitions, and regulatory references..."
                multiline
                rows={3}
                required
              />

              <EditorialField
                label="Causes, Warning Signs & Operational Impact [INSERT]"
                value={req.warningSigns || activeModule.rootCausesExploration || ''}
                onChange={val => {
                  handleUpdateRequirements(safeActiveIndex, 'warningSigns', val);
                  handleUpdateModule(safeActiveIndex, { rootCausesExploration: val });
                }}
                placeholder="Detail common mistakes, early warning signs, and the impact of non-compliance..."
                multiline
                rows={3}
              />

              <EditorialField
                label="Tools, Techniques & Step-by-Step Procedures (SOPs) [INSERT]"
                value={req.procedureSteps || activeModule.practicalExercises || ''}
                onChange={val => {
                  handleUpdateRequirements(safeActiveIndex, 'procedureSteps', val);
                  handleUpdateModule(safeActiveIndex, { practicalExercises: val });
                }}
                placeholder="Outline the step-by-step workplace procedures, role responsibilities, and practical exercises..."
                multiline
                rows={3}
                required
              />
            </div>
          </div>

          {/* 4.1.2 / 4.2.3 / 4.3.3 AI Foundation, Application & Governance */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="text-sm font-extrabold text-[#052B66] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#45CC42]" />
                <span>
                  {safeActiveIndex === 0
                    ? '4.1.2 AI Literacy Foundation (Demystification, AI in This Domain & Responsible AI Principles)'
                    : safeActiveIndex === 1
                    ? '4.2.3 Applied AI Scenarios & Verification Controls'
                    : `4.${safeActiveIndex + 1}.3 AI Governance & Continuous Learning`}
                </span>
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <EditorialField
                label="AI Topic Coverage & Demystification [INSERT]"
                value={req.aiDemystification || activeModule.aiTopicCoverage || ''}
                onChange={val => {
                  handleUpdateRequirements(safeActiveIndex, 'aiDemystification', val);
                  handleUpdateModule(safeActiveIndex, { aiTopicCoverage: val });
                }}
                placeholder="Explain how AI applies to this module, what it can and cannot do, and how to use it safely..."
                multiline
                rows={3}
              />

              <EditorialField
                label="Responsible AI Principles, Verification & Governance [INSERT]"
                value={req.responsibleAiPrinciples || activeModule.aiGovernanceElement || ''}
                onChange={val => {
                  handleUpdateRequirements(safeActiveIndex, 'responsibleAiPrinciples', val);
                  handleUpdateModule(safeActiveIndex, { aiGovernanceElement: val });
                }}
                placeholder="Specify human-in-the-loop verification checks, POPIA data redaction rules, and escalation protocols..."
                multiline
                rows={3}
              />
            </div>
          </div>

          {/* 4.3.2 Mandatory Deliverables (Shown for Module 3+ or available for all modules) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5 border-l-4 border-l-[#45CC42]">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="text-sm font-extrabold text-[#052B66] flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-[#052B66]" />
                <span>
                  4.3.2 Mandatory Workplace Deliverables (Checklists, Rollout Frameworks & Risk Compliance)
                </span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Specify the practical checklists, standard operating procedure (SOP) templates, KPIs, and risk compliance deliverables included in this module.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <EditorialField
                label="Implementation Checklist Title [INSERT]"
                value={req.implementationChecklistTitle || activeModule.sopTemplatesChecklists || ''}
                onChange={val => {
                  handleUpdateRequirements(safeActiveIndex, 'implementationChecklistTitle', val);
                  handleUpdateModule(safeActiveIndex, { sopTemplatesChecklists: val });
                }}
                placeholder="e.g. Daily Operational Verification Checklist"
              />

              <EditorialField
                label="Rollout Framework / Action Plan [INSERT]"
                value={req.rolloutFrameworkTitle || activeModule.implementationPlan || ''}
                onChange={val => {
                  handleUpdateRequirements(safeActiveIndex, 'rolloutFrameworkTitle', val);
                  handleUpdateModule(safeActiveIndex, { implementationPlan: val });
                }}
                placeholder="e.g. 30-60-90 Day Workplace Integration Plan"
              />

              <EditorialField
                label="Risk & Compliance Section Title [INSERT]"
                value={req.riskComplianceSectionTitle || activeModule.kpiMetrics || ''}
                onChange={val => {
                  handleUpdateRequirements(safeActiveIndex, 'riskComplianceSectionTitle', val);
                  handleUpdateModule(safeActiveIndex, { kpiMetrics: val });
                }}
                placeholder="e.g. POPIA & Regulatory Audit Control Matrix"
              />
            </div>
          </div>

          {/* 4.2.2 Workplace Scenarios (Minimum 3 Scenarios Recommended) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="text-sm font-extrabold text-[#052B66]">
                4.2.2 Workplace Scenarios ({(req.scenarios || []).length} Configured)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Each scenario includes a Situation, Challenge, Decision Point, and Best-Practice Debrief.
              </p>
            </div>

            <ScenarioBuilder
              scenarios={req.scenarios || []}
              onUpdateScenarios={newScenarios =>
                handleUpdateRequirements(safeActiveIndex, 'scenarios', newScenarios)
              }
            />
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
          <span>← Back to Section 3: Course Structure</span>
        </button>

        <button
          id="section-04-continue-btn"
          onClick={onContinue}
          className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Section 5: Learning Design Requirements →</span>
        </button>
      </div>

      <SlideFooter currentSlide="04" totalSlides="09" />
    </div>
  );
};
