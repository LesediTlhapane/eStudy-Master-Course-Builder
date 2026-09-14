import React, { useState } from 'react';
import { Course, CourseModule, ModuleRequirements, Scenario } from '../types';
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
  Edit2,
  Sliders,
  CheckCircle2
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
  const [simpleMode, setSimpleMode] = useState<boolean>(false);
  const [skippedNotice, setSkippedNotice] = useState<boolean>(false);

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

  const handleSkipUnknownModuleSpecs = () => {
    if (!activeModule) return;
    const title = activeModule.title || `Module 0${safeActiveIndex + 1}`;

    handleUpdateModule(safeActiveIndex, prev => {
      const req = prev.requirements || ({} as ModuleRequirements);

      const defaultScenarios: Scenario[] = (req.scenarios && req.scenarios.length > 0) ? req.scenarios : [
        {
          id: `scen-${Date.now()}-1`,
          title: 'Daily Workflow Scenario: Handling Ambiguous Data & Redaction',
          situation: 'Preparing a summary report containing employee IDs and client personal data under deadline pressure.',
          challenge: 'Team member needs to summarize data using an AI tool without violating Section 19 of South Africa POPIA Act 4 of 2013.',
          decisionPoint: 'Redact personal identifiers prior to tool input, cross-check generated summary against source document numbers, and log in compliance ledger.',
          debrief: 'Accurate, verified summary delivered on schedule with zero personal data disclosure and human-in-the-loop oversight.'
        }
      ];

      return {
        ...prev,
        title: prev.title || `Module 0${safeActiveIndex + 1}: Workplace Operational Competencies`,
        subtitle: prev.subtitle || 'Applied Execution & Quality Control',
        purpose: prev.purpose || `[AI Auto-Complete: Equip learners with step-by-step competencies and verified procedures for ${title}]`,
        learningObjectives: prev.learningObjectives.length > 0 ? prev.learningObjectives : [
          `Execute structured procedural workflows for ${title}`,
          'Apply line-by-line verification checklists against source data',
          'Enforce South African statutory compliance and ethical governance'
        ],
        requirements: {
          ...req,
          problemDefinition: req.problemDefinition || `[AI Auto-Complete: Inconsistent task execution, procedural bottlenecks, and unverified outputs in daily operations]`,
          workplaceContext: req.workplaceContext || `[AI Auto-Complete: Corporate workplace setting with daily knowledge synthesis, reporting, and client communication]`,
          keyTerms: req.keyTerms || `[AI Auto-Complete: Operational standard, Verification Checklist, Audit Trail, POPIA Redaction, Human Oversight]`,
          warningSigns: req.warningSigns || `[AI Auto-Complete: Pasting sensitive data without sanitization, unverified hallucinations, lack of supervisory sign-off]`,
          causes: req.causes || `[AI Auto-Complete: Missing standard operating procedures and lack of formal training on quality control checks]`,
          impactStatement: req.impactStatement || `[AI Auto-Complete: Operational delay, client privacy risk, and potential financial audit penalties]`,
          aiDemystification: req.aiDemystification || `[AI Auto-Complete: Demystifying AI as an augmentative drafting tool requiring rigorous human verification]`,
          responsibleAiPrinciples: req.responsibleAiPrinciples || `[AI Auto-Complete: Fairness, transparency, privacy preservation, and strict human accountability]`,
          toolsAndTechniques: req.toolsAndTechniques || `[AI Auto-Complete: Structured prompting templates, verification matrices, and output review rubrics]`,
          procedureSteps: req.procedureSteps || `[AI Auto-Complete: 1. Input Sanitisation -> 2. Contextual Prompting -> 3. Cross-Verification -> 4. Error Rectification -> 5. Human Sign-Off]`,
          roleResponsibilities: req.roleResponsibilities || `[AI Auto-Complete: RACI Matrix - Knowledge Worker (Responsible), Peer Reviewer (Accountable), Department Head (Consulted/Informed)]`,
          implementationStrategy: req.implementationStrategy || `[AI Auto-Complete: Phased departmental rollout with weekly calibration reviews]`,
          implementationChecklistTitle: req.implementationChecklistTitle || `Operational Quality Verification Checklist for ${title}`,
          rolloutFrameworkTitle: req.rolloutFrameworkTitle || `Departmental SOP & Integration Procedure`,
          riskComplianceSectionTitle: req.riskComplianceSectionTitle || `POPIA Act 4 of 2013 Statutory Compliance Ledger`,
          scenarios: defaultScenarios
        }
      };
    });

    setSkippedNotice(true);
    setTimeout(() => setSkippedNotice(false), 3500);
  };

  const handleSkipCategory = (category: string) => {
    if (!activeModule) return;
    const title = activeModule.title || `Module 0${safeActiveIndex + 1}`;

    handleUpdateModule(safeActiveIndex, prev => {
      const req = { ...prev.requirements };
      if (category === 'core-content') {
        req.problemDefinition = `[AI Auto-Complete: Workplace operational bottlenecks and procedural errors in ${title}]`;
        req.workplaceContext = `[AI Auto-Complete: South African enterprise operational context and team interactions]`;
        req.keyTerms = `[AI Auto-Complete: Core domain terminology, definitions, and acronyms]`;
        req.warningSigns = `[AI Auto-Complete: Early warning signs of procedural failure and unverified outputs]`;
      } else if (category === 'ai-literacy') {
        req.aiDemystification = `[AI Auto-Complete: Clear breakdown of AI capabilities, limitations, and cognitive biases]`;
        req.responsibleAiPrinciples = `[AI Auto-Complete: Ethical governance, King IV Principle 12 alignment, and transparency]`;
      } else if (category === 'tools-procedures') {
        req.toolsAndTechniques = `[AI Auto-Complete: Practical tool configurations and verification methods]`;
        req.procedureSteps = `[AI Auto-Complete: 5-step standard operating procedure with human-in-the-loop checkpoints]`;
        req.roleResponsibilities = `[AI Auto-Complete: Team role boundaries and escalation matrix]`;
      } else if (category === 'implementation') {
        req.implementationChecklistTitle = `Implementation & Quality Checklist`;
        req.rolloutFrameworkTitle = `SOP Rollout Protocol`;
        req.riskComplianceSectionTitle = `POPIA Compliance Verification Protocol`;
      }
      return { ...prev, requirements: req };
    });
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
    const req = m.requirements || ({} as ModuleRequirements);
    const coreFilled = [req.problemDefinition, req.workplaceContext, req.keyTerms, req.warningSigns].filter(v => Boolean(v?.trim())).length;
    const scenarioCount = (req.scenarios || []).length;
    return { coreFilled, scenarioCount };
  };

  return (
    <div id="section-04-modules-container" className="space-y-6 max-w-6xl font-sora">
      {/* Slide Header */}
      <SlideHeader
        sectionNumber="04"
        title="Module Structure & Workplace Scenario Architecture"
        subtitle="Build out each module with core workplace knowledge, procedures, scenarios, and statutory deliverables."
        slideNumber="11"
        totalSlides="39"
        badgeText={`${modules.length} Modules Active`}
      />

      {/* Skip Unknown Information Banner (Requirement 4 & Requirement 2 UI simplification) */}
      <div className="p-4 bg-white border border-[#45CC42] rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-[#45CC42]">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#45CC42]/15 text-[#052B66] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-[#45CC42]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#052B66]">
              Not sure about technical procedures, RACI matrices, or statutory protocols?
            </h4>
            <p className="text-[11.5px] text-slate-500 leading-snug">
              Skip any module fields you don't know. The AI generation engine will synthesize verified standard operating procedures, realistic South African scenarios, and compliance deliverables.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSkipUnknownModuleSpecs}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Skip Unknown Module Specs (AI Will Formulate)</span>
          </button>
        </div>
      </div>

      {skippedNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-[#45CC42] text-[#052B66] text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-[#45CC42] stroke-[3]" />
          <span>Module technical specifications and realistic workplace scenarios have been formulated!</span>
        </div>
      )}

      {/* Module Navigation Tabs List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66]">
            COURSE MODULES ({modules.length} OF MINIMUM 3)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSimpleMode(!simpleMode)}
              className="text-xs font-semibold text-slate-600 hover:text-[#052B66] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#45CC42]" />
              <span>{simpleMode ? 'Detailed Framework View' : 'Simple / Calm View'}</span>
            </button>

            <button
              id="add-module-header-btn"
              onClick={handleAddModule}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#45CC42] hover:bg-[#3ec23b] text-[#052B66] shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Add Module</span>
            </button>
          </div>
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
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-[#45CC42]/20 text-[#052B66] border-[#45CC42]/40">
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

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSkipUnknownModuleSpecs}
                className="text-xs font-semibold text-[#052B66] bg-[#45CC42]/20 hover:bg-[#45CC42]/30 border border-[#45CC42]/40 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#45CC42]" />
                <span>Skip Unknowns for Module</span>
              </button>

              {modules.length > 1 && (
                <button
                  onClick={() => handleDeleteModule(safeActiveIndex)}
                  className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>

          {/* Module Title & Subtitle Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-slate-50 border border-slate-200 rounded-2xl border-l-4 border-l-[#45CC42]">
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
              placeholder="e.g. Enable learners to execute verified workplace tasks with confidence and compliance."
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

          {/* Simple Mode vs Detailed Accordion */}
          {simpleMode ? (
            <div className="p-5 bg-emerald-50/50 border border-[#45CC42]/30 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#052B66]">
                  <CheckCircle2 className="w-5 h-5 text-[#45CC42]" />
                  <div>
                    <h4 className="text-xs font-bold">Simple Client Mode Enabled</h4>
                    <p className="text-[11px] text-slate-500">
                      Standard operating procedures, RACI matrices, and statutory risk protocols are automatically handled by the AI engine.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSimpleMode(false)}
                  className="text-xs text-[#052B66] font-semibold underline hover:text-[#45CC42] cursor-pointer"
                >
                  View full technical details
                </button>
              </div>

              {/* Scenario Builder is directly accessible in simple mode */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-[#052B66] uppercase tracking-wider mb-2">
                  Workplace Scenarios ({(activeModule.requirements?.scenarios || []).length} Created)
                </h4>
                <ScenarioBuilder
                  scenarios={activeModule.requirements?.scenarios || []}
                  onUpdateScenarios={newScenarios => handleUpdateRequirements(safeActiveIndex, 'scenarios', newScenarios)}
                />
              </div>
            </div>
          ) : (
            /* 6 Structured Requirement Accordion Drawers */
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Module Design Requirements & Deliverables
              </h4>

              {/* Category 1: Core Content */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer border-l-4 border-l-[#45CC42]">
                  <button
                    type="button"
                    onClick={() => setOpenCategory(openCategory === 'core-content' ? null : 'core-content')}
                    className="flex-1 text-left flex items-center gap-3 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      1. Core Content & Workplace Context
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSkipCategory('core-content')}
                      className="text-[10px] font-semibold text-slate-500 hover:text-[#052B66] bg-white border border-slate-200 px-2 py-1 rounded cursor-pointer"
                    >
                      ⚡ Skip (AI Formulate)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenCategory(openCategory === 'core-content' ? null : 'core-content')}
                      className="p-1 text-slate-400 cursor-pointer"
                    >
                      {openCategory === 'core-content' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

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
                <div className="w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer border-l-4 border-l-[#45CC42]">
                  <button
                    type="button"
                    onClick={() => setOpenCategory(openCategory === 'ai-literacy' ? null : 'ai-literacy')}
                    className="flex-1 text-left flex items-center gap-3 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      2. AI Literacy & Responsible Principles
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSkipCategory('ai-literacy')}
                      className="text-[10px] font-semibold text-slate-500 hover:text-[#052B66] bg-white border border-slate-200 px-2 py-1 rounded cursor-pointer"
                    >
                      ⚡ Skip (AI Formulate)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenCategory(openCategory === 'ai-literacy' ? null : 'ai-literacy')}
                      className="p-1 text-slate-400 cursor-pointer"
                    >
                      {openCategory === 'ai-literacy' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {openCategory === 'ai-literacy' && (
                  <div className="p-5 bg-white space-y-4 border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <EditorialField
                        label="[AI DEMYSTIFICATION]"
                        value={activeModule.requirements.aiDemystification}
                        onChange={val => handleUpdateRequirements(safeActiveIndex, 'aiDemystification', val)}
                        placeholder="e.g. How language models predict text, why hallucinations happen, and human control."
                      />
                      <EditorialField
                        label="[RESPONSIBLE AI PRINCIPLES]"
                        value={activeModule.requirements.responsibleAiPrinciples}
                        onChange={val => handleUpdateRequirements(safeActiveIndex, 'responsibleAiPrinciples', val)}
                        placeholder="e.g. Accountability, Transparency, Fairness, POPIA Privacy, Human-in-the-Loop."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Category 3: Tools, Techniques & Procedures */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer border-l-4 border-l-[#45CC42]">
                  <button
                    type="button"
                    onClick={() => setOpenCategory(openCategory === 'tools-procedures' ? null : 'tools-procedures')}
                    className="flex-1 text-left flex items-center gap-3 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      3. Practical Procedures & SOP Steps
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSkipCategory('tools-procedures')}
                      className="text-[10px] font-semibold text-slate-500 hover:text-[#052B66] bg-white border border-slate-200 px-2 py-1 rounded cursor-pointer"
                    >
                      ⚡ Skip (AI Formulate)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenCategory(openCategory === 'tools-procedures' ? null : 'tools-procedures')}
                      className="p-1 text-slate-400 cursor-pointer"
                    >
                      {openCategory === 'tools-procedures' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {openCategory === 'tools-procedures' && (
                  <div className="p-5 bg-white space-y-4 border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <EditorialField
                        label="[TOOLS & TECHNIQUES]"
                        value={activeModule.requirements.toolsAndTechniques}
                        onChange={val => handleUpdateRequirements(safeActiveIndex, 'toolsAndTechniques', val)}
                        placeholder="e.g. Structured Prompt Canvas, 4-Step Verification Matrix, Redaction Marker."
                      />
                      <EditorialField
                        label="[PROCEDURAL STEPS / SOP]"
                        value={activeModule.requirements.procedureSteps}
                        onChange={val => handleUpdateRequirements(safeActiveIndex, 'procedureSteps', val)}
                        placeholder="e.g. 1. Pre-clear data -> 2. Execute Prompt -> 3. Cross-audit against source -> 4. Sign-off."
                        multiline
                        rows={3}
                      />
                      <EditorialField
                        label="[ROLE RESPONSIBILITIES]"
                        value={activeModule.requirements.roleResponsibilities}
                        onChange={val => handleUpdateRequirements(safeActiveIndex, 'roleResponsibilities', val)}
                        placeholder="e.g. Operator drafts; Team Lead reviews; Compliance Officer audits monthly."
                      />
                      <EditorialField
                        label="[SUPPORT MECHANISMS]"
                        value={activeModule.requirements.supportMechanisms}
                        onChange={val => handleUpdateRequirements(safeActiveIndex, 'supportMechanisms', val)}
                        placeholder="e.g. Internal Slack channel #ai-governance, weekly drop-in clinic, SOP wiki."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Category 4: Scenarios */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenCategory(openCategory === 'scenarios' ? null : 'scenarios')}
                  className="w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer text-left border-l-4 border-l-[#45CC42]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      4. Workplace Scenarios ({(activeModule.requirements.scenarios || []).length} Defined)
                    </span>
                  </div>
                  {openCategory === 'scenarios' ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </button>

                {openCategory === 'scenarios' && (
                  <div className="p-5 bg-white space-y-4 border-t border-slate-100">
                    <ScenarioBuilder
                      scenarios={activeModule.requirements.scenarios || []}
                      onUpdateScenarios={newScenarios => handleUpdateRequirements(safeActiveIndex, 'scenarios', newScenarios)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={onBack}
          className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Architecture</span>
        </button>

        <button
          id="section-04-continue-btn"
          onClick={onContinue}
          className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Learning Design & Scenarios →</span>
        </button>
      </div>

      <SlideFooter currentSlide="11" totalSlides="39" />
    </div>
  );
};
