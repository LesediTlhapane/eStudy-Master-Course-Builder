import React, { useState } from 'react';
import { Course, CourseModule, ModuleRequirements } from '../types';
import { ScenarioBuilder } from './ScenarioBuilder';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Check,
  Trash2,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  FileCheck,
  Shield,
  Clock,
  Edit2
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
  const [openCategory, setOpenCategory] = useState<string | null>('core-content');

  const modules = course.modules || [];
  const safeActiveIndex = Math.min(activeModuleIndex, Math.max(0, modules.length - 1));
  const activeModule = modules[safeActiveIndex];

  const handleUpdateModule = (modIdx: number, updater: Partial<CourseModule> | ((prev: CourseModule) => CourseModule)) => {
    onUpdate(prev => {
      const updated = [...prev.modules];
      if (updated[modIdx]) {
        updated[modIdx] = typeof updater === 'function' ? updater(updated[modIdx]) : { ...updated[modIdx], ...updater };
      }
      return {
        ...prev,
        modules: updated
      };
    });
  };

  const handleUpdateRequirements = (modIdx: number, reqField: keyof ModuleRequirements, val: any) => {
    handleUpdateModule(modIdx, prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [reqField]: val
      }
    }));
  };

  const handleAddModule = () => {
    const newNum = modules.length + 1;
    const newMod: CourseModule = {
      id: `mod-${Date.now()}`,
      moduleNumber: newNum,
      title: '',
      subtitle: '',
      purpose: '',
      keySkills: [],
      learningObjectives: [],
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
    if (modules.length <= 1) {
      alert('A course must have at least 1 module.');
      return;
    }
    onUpdate(prev => ({
      ...prev,
      modules: prev.modules
        .filter((_, i) => i !== idx)
        .map((m, i) => ({
          ...m,
          moduleNumber: i + 1
        }))
    }));
    if (activeModuleIndex >= idx) {
      setActiveModuleIndex(Math.max(0, activeModuleIndex - 1));
    }
  };

  const getModuleStats = (m: CourseModule) => {
    const req = m.requirements || {
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
    };

    const coreFilled = [req.problemDefinition, req.workplaceContext, req.keyTerms, req.warningSigns].filter(v => Boolean(v?.trim())).length;
    const aiFilled = [req.aiDemystification, req.responsibleAiPrinciples].filter(v => Boolean(v?.trim())).length;
    const toolsFilled = [req.toolsAndTechniques, req.procedureSteps].filter(v => Boolean(v?.trim())).length;
    const scenarioCount = (req.scenarios || []).length;
    const aiScenarioCount = (req.aiScenarios || []).length;
    const govFilled = [req.implementationChecklistTitle, req.rolloutFrameworkTitle, req.riskComplianceSectionTitle].filter(v => Boolean(v?.trim())).length;

    const completedCategories = [
      coreFilled >= 2,
      aiFilled >= 1,
      toolsFilled >= 1,
      scenarioCount >= 1,
      aiScenarioCount >= 1,
      govFilled >= 1
    ].filter(Boolean).length;

    const isStarted = Boolean(
      m.title?.trim() ||
      m.purpose?.trim() ||
      (m.learningObjectives && m.learningObjectives.length > 0) ||
      coreFilled > 0 ||
      aiFilled > 0 ||
      toolsFilled > 0 ||
      scenarioCount > 0 ||
      aiScenarioCount > 0 ||
      govFilled > 0
    );

    return {
      coreFilled,
      aiFilled,
      toolsFilled,
      scenarioCount,
      aiScenarioCount,
      govFilled,
      completedCategories,
      isStarted
    };
  };

  return (
    <div id="section-04-modules-container" className="space-y-6 max-w-6xl">
      {/* Slide Header */}
      <SlideHeader
        sectionNumber="04"
        title="Module Structure & Workplace Scenario Architecture"
        subtitle="Build out each module with core workplace knowledge, procedures, scenarios, and statutory deliverables."
        slideNumber="11"
        totalSlides="39"
        badgeText={`${modules.length} Modules Active`}
      />

      {/* Framework Requirement Callout */}
      <FrameworkCallout
        title="Framework Requirement"
        requirement="Minimum 3 workplace scenarios per module. Recommended: 3–5. Every module must include practical procedures and complete implementation deliverables (Checklist, Rollout Procedure, Statutory Risk Protocol)."
        variant="requirement"
      />

      {/* Module Navigation Tabs List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66]">
            COURSE MODULES ({modules.length} OF MINIMUM 3)
          </span>
          <button
            id="add-module-header-btn"
            onClick={handleAddModule}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#45CC42] hover:bg-[#3ec23b] text-[#052B66] shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Add Module</span>
          </button>
        </div>

        {modules.length === 0 ? (
          <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center space-y-3">
            <Layers className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-700">No modules in this course yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Add your first module template to begin building out workplace topics, tools, and scenarios.
              </p>
            </div>
            <button
              onClick={handleAddModule}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add First Module</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {modules.map((m, idx) => {
              const isSelected = safeActiveIndex === idx;
              const stats = getModuleStats(m);

              return (
                <button
                  key={m.id}
                  onClick={() => setActiveModuleIndex(idx)}
                  className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'border-[#052B66] bg-[#052B66]/5 ring-1 ring-[#052B66] shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-xs font-black text-[#052B66] bg-slate-100 px-2 py-0.5 rounded">
                      M0{idx + 1}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      stats.completedCategories >= 5
                        ? 'bg-[#45CC42]/20 text-[#052B66] border-[#45CC42]/40'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {stats.scenarioCount} scenarios
                    </span>
                  </div>

                  <div className="w-full">
                    <h4 className="text-xs font-bold text-[#052B66] truncate">
                      {m.title?.trim() ? m.title : `Module 0${idx + 1}`}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {m.subtitle?.trim() ? m.subtitle : 'Click to edit module content'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Module Detail Section */}
      {activeModule && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider">
                SLIDE {11 + safeActiveIndex * 2} · MODULE {safeActiveIndex + 1} SPECIFICATION
              </span>
              <h3 className="text-lg font-extrabold text-[#052B66] tracking-tight mt-0.5">
                {activeModule.title?.trim() ? activeModule.title : `Module 0${safeActiveIndex + 1}: Module Template`}
              </h3>
            </div>

            {modules.length > 1 && (
              <button
                onClick={() => handleDeleteModule(safeActiveIndex)}
                className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors self-start cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Module</span>
              </button>
            )}
          </div>

          {/* Module Title & Subtitle Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
            <EditorialField
              label="[MODULE TITLE]"
              value={activeModule.title}
              onChange={val => handleUpdateModule(safeActiveIndex, { title: val })}
              placeholder="e.g. Introduction to AI Literacy & Verification"
              required
            />

            <EditorialField
              label="[MODULE SUBTITLE / FOCUS AREA]"
              value={activeModule.subtitle}
              onChange={val => handleUpdateModule(safeActiveIndex, { subtitle: val })}
              placeholder="e.g. Foundational understanding & core concepts"
              required
            />
          </div>

          {/* Module Purpose & Learning Objectives Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <EditorialField
              label="[MODULE PURPOSE]"
              value={activeModule.purpose}
              onChange={val => handleUpdateModule(safeActiveIndex, { purpose: val })}
              placeholder="e.g. Enable learners to use generative AI safely, verify outputs, and make accountable decisions in real workflows."
              helperText="The distinct mission and behavioral objective of this module."
              multiline
              rows={3}
              required
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold tracking-wider text-[#052B66] uppercase">
                  [LEARNING OBJECTIVES] ({(activeModule.learningObjectives || []).length} DEFINED) *
                </label>
                <span className="text-[10px] text-slate-400 font-medium">1 objective per line</span>
              </div>
              <textarea
                rows={3}
                value={(activeModule.learningObjectives || []).join('\n')}
                onChange={e =>
                  handleUpdateModule(safeActiveIndex, {
                    learningObjectives: e.target.value.split('\n').filter(Boolean)
                  })
                }
                placeholder={"Apply core prompt engineering frameworks\nExecute line-by-line verification checklists\nSanitise personal data in compliance with POPIA"}
                className="w-full text-xs font-normal text-slate-900 bg-white border border-slate-300 rounded-lg p-3 focus:border-[#052B66] outline-none leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* 6 Structured Requirement Accordion Drawers */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Module Design Requirements & Deliverables
            </h4>

            {/* Category 1: Core Content */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenCategory(openCategory === 'core-content' ? null : 'core-content')}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer text-left border-l-4 border-l-[#45CC42]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    1. Core Content & Workplace Context
                  </span>
                </div>
                {openCategory === 'core-content' ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {openCategory === 'core-content' && (
                <div className="p-5 bg-white space-y-4 border-t border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditorialField
                      label="[PROBLEM DEFINITION]"
                      value={activeModule.requirements.problemDefinition}
                      onChange={val => handleUpdateRequirements(safeActiveIndex, 'problemDefinition', val)}
                      placeholder="e.g. Ineffective, vague prompts resulting in poor outputs and wasted work hours."
                    />
                    <EditorialField
                      label="[WORKPLACE CONTEXT]"
                      value={activeModule.requirements.workplaceContext}
                      onChange={val => handleUpdateRequirements(safeActiveIndex, 'workplaceContext', val)}
                      placeholder="e.g. Everyday corporate knowledge work, reporting, customer inquiries."
                    />
                    <EditorialField
                      label="[KEY TERMS & CONCEPTS]"
                      value={activeModule.requirements.keyTerms}
                      onChange={val => handleUpdateRequirements(safeActiveIndex, 'keyTerms', val)}
                      placeholder="e.g. Role Prompting, Few-Shot Examples, Hallucination Auditing, Redaction."
                    />
                    <EditorialField
                      label="[WARNING SIGNS & RISKS]"
                      value={activeModule.requirements.warningSigns}
                      onChange={val => handleUpdateRequirements(safeActiveIndex, 'warningSigns', val)}
                      placeholder="e.g. Pasting sensitive company data into open web tools; accepting unverified answers."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Category 2: AI Literacy Foundation */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenCategory(openCategory === 'ai-literacy' ? null : 'ai-literacy')}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer text-left border-l-4 border-l-[#45CC42]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    2. AI Literacy & Responsible Principles
                  </span>
                </div>
                {openCategory === 'ai-literacy' ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {openCategory === 'ai-literacy' && (
                <div className="p-5 bg-white space-y-4 border-t border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditorialField
                      label="[AI DEMYSTIFICATION]"
                      value={activeModule.requirements.aiDemystification}
                      onChange={val => handleUpdateRequirements(safeActiveIndex, 'aiDemystification', val)}
                      placeholder="e.g. Explain how LLMs generate tokens statistically without conscious intent."
                    />
                    <EditorialField
                      label="[RESPONSIBLE AI PRINCIPLES]"
                      value={activeModule.requirements.responsibleAiPrinciples}
                      onChange={val => handleUpdateRequirements(safeActiveIndex, 'responsibleAiPrinciples', val)}
                      placeholder="e.g. Human accountability, transparent attribution, zero-leakage data ethics."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Category 3: Tools, Techniques & Procedures */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenCategory(openCategory === 'tools-procedures' ? null : 'tools-procedures')}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer text-left border-l-4 border-l-[#45CC42]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    3. Tools, Techniques & SOP Procedures
                  </span>
                </div>
                {openCategory === 'tools-procedures' ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {openCategory === 'tools-procedures' && (
                <div className="p-5 bg-white space-y-4 border-t border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditorialField
                      label="[TOOLS & TECHNIQUES]"
                      value={activeModule.requirements.toolsAndTechniques}
                      onChange={val => handleUpdateRequirements(safeActiveIndex, 'toolsAndTechniques', val)}
                      placeholder="e.g. 4-part prompt framework: Context, Role, Task, Format."
                      multiline
                      rows={3}
                    />
                    <EditorialField
                      label="[STEP-BY-STEP PROCEDURE / SOP]"
                      value={activeModule.requirements.procedureSteps}
                      onChange={val => handleUpdateRequirements(safeActiveIndex, 'procedureSteps', val)}
                      placeholder={"Step 1: Frame the workplace prompt\nStep 2: Execute generation\nStep 3: Run 3-point fact verification"}
                      multiline
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Category 4: Workplace Scenarios */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenCategory(openCategory === 'scenarios' ? null : 'scenarios')}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer text-left border-l-4 border-l-[#45CC42]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    4. Workplace Scenarios ({(activeModule.requirements.scenarios || []).length} Configured)
                  </span>
                </div>
                {openCategory === 'scenarios' ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {openCategory === 'scenarios' && (
                <div className="p-5 bg-white space-y-4 border-t border-slate-100">
                  <ScenarioBuilder
                    scenarios={activeModule.requirements.scenarios || []}
                    onChange={scenarios => handleUpdateRequirements(safeActiveIndex, 'scenarios', scenarios)}
                    moduleTitle={activeModule.title || `Module 0${safeActiveIndex + 1}`}
                  />
                </div>
              )}
            </div>

            {/* Category 5: AI-Specific Oversight Scenarios */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenCategory(openCategory === 'ai-scenarios' ? null : 'ai-scenarios')}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer text-left border-l-4 border-l-[#45CC42]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    5. AI-Specific Decision Scenarios ({(activeModule.requirements.aiScenarios || []).length} Configured)
                  </span>
                </div>
                {openCategory === 'ai-scenarios' ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {openCategory === 'ai-scenarios' && (
                <div className="p-5 bg-white space-y-4 border-t border-slate-100">
                  <ScenarioBuilder
                    scenarios={activeModule.requirements.aiScenarios || []}
                    onChange={scenarios => handleUpdateRequirements(safeActiveIndex, 'aiScenarios', scenarios)}
                    moduleTitle={`${activeModule.title || `Module 0${safeActiveIndex + 1}`} (AI Oversight)`}
                    isAiOnly
                  />
                </div>
              )}
            </div>

            {/* Category 6: Implementation Deliverables & Statutory Governance */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenCategory(openCategory === 'governance' ? null : 'governance')}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer text-left border-l-4 border-l-[#45CC42]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    6. Mandatory Deliverables (Checklist, Rollout, Risk Matrix)
                  </span>
                </div>
                {openCategory === 'governance' ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {openCategory === 'governance' && (
                <div className="p-5 bg-white space-y-4 border-t border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <EditorialField
                      label="[IMPLEMENTATION CHECKLIST TITLE]"
                      value={activeModule.requirements.implementationChecklistTitle}
                      onChange={val => handleUpdateRequirements(safeActiveIndex, 'implementationChecklistTitle', val)}
                      placeholder="e.g. AI 30-Day Workplace Action Plan"
                    />
                    <EditorialField
                      label="[ROLLOUT FRAMEWORK TITLE]"
                      value={activeModule.requirements.rolloutFrameworkTitle}
                      onChange={val => handleUpdateRequirements(safeActiveIndex, 'rolloutFrameworkTitle', val)}
                      placeholder="e.g. Departmental Rollout & SOP Guide"
                    />
                    <EditorialField
                      label="[RISK & COMPLIANCE PROTOCOL]"
                      value={activeModule.requirements.riskComplianceSectionTitle}
                      onChange={val => handleUpdateRequirements(safeActiveIndex, 'riskComplianceSectionTitle', val)}
                      placeholder="e.g. POPIA Data Risk Mitigation Matrix"
                    />
                  </div>
                </div>
              )}
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
          <span>← Back to Structure</span>
        </button>

        <button
          id="section-04-continue-btn"
          onClick={onContinue}
          className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Learning Design (Section 05) →</span>
        </button>
      </div>

      {/* Slide Footer */}
      <SlideFooter currentSlide="11" totalSlides="39" />
    </div>
  );
};
