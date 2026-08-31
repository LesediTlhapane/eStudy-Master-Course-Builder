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
    <div id="section-04-modules-container" className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-mono text-[#052B66]">04</span>
            <h2 className="text-2xl font-extrabold text-[#052B66] tracking-tight">
              Module Structure
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Build the learning architecture module by module, then expand only what you need.
          </p>
        </div>

        <button
          id="add-module-header-btn"
          onClick={handleAddModule}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add Module</span>
        </button>
      </div>

      {/* Module Navigation Tabs List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <span>MODULES ({modules.length} OF MINIMUM 3)</span>
          <span>Click a module to customize</span>
        </div>

        {modules.length === 0 ? (
          <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-3">
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
          <div className="space-y-2.5">
            {modules.map((m, idx) => {
              const isSelected = safeActiveIndex === idx;
              const stats = getModuleStats(m);

              const statusBadgeText = !stats.isStarted
                ? 'Not started'
                : stats.completedCategories === 6
                ? '6 of 6 complete'
                : `${stats.completedCategories} of 6 complete`;

              const statusBadgeStyle = !stats.isStarted
                ? 'bg-slate-100 text-slate-600 border-slate-200'
                : stats.completedCategories === 6
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200';

              return (
                <div
                  key={m.id}
                  className={`rounded-xl border transition-all ${
                    isSelected
                      ? 'border-[#052B66] bg-white shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div
                    onClick={() => setActiveModuleIndex(idx)}
                    className="p-4 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="font-mono text-sm font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded shrink-0">
                        0{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 hover:text-[#052B66] transition-colors truncate">
                          {m.title?.trim() ? m.title : `Module 0${idx + 1} (Untitled Module)`}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">
                          {m.subtitle?.trim() ? m.subtitle : 'Click to define title, subtitle & workplace learning requirements'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusBadgeStyle}`}>
                        {statusBadgeText}
                      </span>
                      {isSelected ? (
                        <ChevronDown className="w-4 h-4 text-[#052B66]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Sub-preview banner if selected */}
                  {isSelected && (
                    <div className="px-5 pb-4 pt-1 border-t border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11.5px] text-slate-600">
                      <span className="flex items-center gap-1">
                        {stats.coreFilled >= 2 ? (
                          <Check className="w-3.5 h-3.5 text-[#45CC42]" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300 mr-0.5" />
                        )}
                        Core Content ({stats.coreFilled}/4)
                      </span>
                      <span className="flex items-center gap-1">
                        {stats.aiFilled >= 1 ? (
                          <Check className="w-3.5 h-3.5 text-[#45CC42]" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300 mr-0.5" />
                        )}
                        AI Literacy ({stats.aiFilled}/2)
                      </span>
                      <span className="flex items-center gap-1">
                        {stats.toolsFilled >= 1 ? (
                          <Check className="w-3.5 h-3.5 text-[#45CC42]" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300 mr-0.5" />
                        )}
                        Tools & Procedures ({stats.toolsFilled}/2)
                      </span>
                      <span className="flex items-center gap-1 text-[#052B66] font-semibold">
                        ● Scenarios ({stats.scenarioCount})
                      </span>
                      <span className="flex items-center gap-1 text-[#052B66] font-semibold">
                        ● AI Scenarios ({stats.aiScenarioCount})
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Module Detail Section */}
      {activeModule && (
        <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-xs space-y-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[11px] font-bold text-[#052B66] uppercase tracking-wider">
                EDITING MODULE {safeActiveIndex + 1} OF {modules.length}
              </span>
              <h3 className="text-xl font-extrabold text-[#052B66] tracking-tight mt-0.5">
                {activeModule.title?.trim() ? activeModule.title : `Module 0${safeActiveIndex + 1}: Module Template`}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Turn core knowledge into workplace action through tools, procedures and scenarios.
              </p>
            </div>

            {modules.length > 1 && (
              <button
                onClick={() => handleDeleteModule(safeActiveIndex)}
                className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded transition-colors self-start cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Module</span>
              </button>
            )}
          </div>

          {/* Module Title & Subtitle Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-slate-50/70 border border-slate-200 rounded-xl">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Module Title *
              </label>
              <input
                type="text"
                value={activeModule.title}
                onChange={e => handleUpdateModule(safeActiveIndex, { title: e.target.value })}
                placeholder="e.g. Introduction to AI Literacy"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 font-semibold focus:border-[#052B66] outline-none bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Module Subtitle / Focus Area *
              </label>
              <input
                type="text"
                value={activeModule.subtitle}
                onChange={e => handleUpdateModule(safeActiveIndex, { subtitle: e.target.value })}
                placeholder="e.g. Foundational understanding & core concepts"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-[#052B66] outline-none bg-white"
              />
            </div>
          </div>

          {/* Module Purpose & Learning Objectives Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Module purpose *
              </label>
              <textarea
                rows={3}
                value={activeModule.purpose}
                onChange={e => handleUpdateModule(safeActiveIndex, { purpose: e.target.value })}
                placeholder="e.g. Enable learners to use generative AI safely, verify outputs, and make accountable decisions in real workflows."
                className="w-full p-3 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-[#052B66] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Learning objectives ({(activeModule.learningObjectives || []).length} defined) *
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
                placeholder={"e.g. Construct multi-part prompts with context, role, and constraints\nApply fact-checking workflows to AI drafts\nExecute redaction of personal information"}
                className="w-full p-3 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-[#052B66] outline-none font-sans"
              />
            </div>
          </div>

          {/* 10 Expandable Module Requirement Accordion Cards */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Module Design Requirements (Expand to configure)
            </h4>

            {/* Category 1: Core Content */}
            {(() => {
              const req = activeModule.requirements || {};
              const coreFilled = [req.problemDefinition, req.workplaceContext, req.keyTerms, req.warningSigns].filter(v => Boolean(v?.trim())).length;
              const isComp = coreFilled === 4;

              return (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenCategory(openCategory === 'core-content' ? null : 'core-content')}
                    className={`w-full p-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors flex items-center justify-between cursor-pointer text-left border-l-4 ${
                      isComp ? 'border-l-[#45CC42]' : coreFilled > 0 ? 'border-l-amber-400' : 'border-l-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-900">Core Content</span>
                      <span className="text-[11px] text-slate-500">{coreFilled} of 4 complete</span>
                    </div>
                    {openCategory === 'core-content' ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>

                  {openCategory === 'core-content' && (
                    <div className="p-5 bg-white space-y-4 border-t border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Problem Definition</label>
                          <input
                            type="text"
                            value={activeModule.requirements.problemDefinition}
                            onChange={e => handleUpdateRequirements(safeActiveIndex, 'problemDefinition', e.target.value)}
                            placeholder="e.g. Ineffective, vague prompts resulting in poor outputs and wasted work hours, combined with unverified claims."
                            className="w-full p-2 border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Workplace Context</label>
                          <input
                            type="text"
                            value={activeModule.requirements.workplaceContext}
                            onChange={e => handleUpdateRequirements(safeActiveIndex, 'workplaceContext', e.target.value)}
                            placeholder="e.g. Everyday corporate knowledge work, reporting, customer inquiries, and administrative tasks."
                            className="w-full p-2 border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Key Terms & Concepts</label>
                          <input
                            type="text"
                            value={activeModule.requirements.keyTerms}
                            onChange={e => handleUpdateRequirements(safeActiveIndex, 'keyTerms', e.target.value)}
                            placeholder="e.g. Role Prompting, Few-Shot Examples, Hallucination Auditing, Redaction, Zero-Data Retention."
                            className="w-full p-2 border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Warning Signs / Impact</label>
                          <input
                            type="text"
                            value={activeModule.requirements.warningSigns}
                            onChange={e => handleUpdateRequirements(safeActiveIndex, 'warningSigns', e.target.value)}
                            placeholder="e.g. Pasting sensitive company data into open web tools; accepting plausible-sounding incorrect answers."
                            className="w-full p-2 border border-slate-300 rounded text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Category 2: AI Literacy Foundation */}
            {(() => {
              const req = activeModule.requirements || {};
              const aiFilled = [req.aiDemystification, req.responsibleAiPrinciples].filter(v => Boolean(v?.trim())).length;
              const isComp = aiFilled === 2;

              return (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenCategory(openCategory === 'ai-literacy' ? null : 'ai-literacy')}
                    className={`w-full p-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors flex items-center justify-between cursor-pointer text-left border-l-4 ${
                      isComp ? 'border-l-[#45CC42]' : aiFilled > 0 ? 'border-l-amber-400' : 'border-l-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-900">AI Literacy Foundation</span>
                      <span className="text-[11px] text-slate-500">{aiFilled} of 2 complete</span>
                    </div>
                    {openCategory === 'ai-literacy' ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>

                  {openCategory === 'ai-literacy' && (
                    <div className="p-5 bg-white space-y-4 border-t border-slate-100">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">What AI is and is not (demystification)</label>
                          <textarea
                            rows={2}
                            value={activeModule.requirements.aiDemystification}
                            onChange={e => handleUpdateRequirements(safeActiveIndex, 'aiDemystification', e.target.value)}
                            placeholder="e.g. AI is statistical pattern prediction based on training data; it does not possess consciousness, real-time facts, or moral reasoning."
                            className="w-full p-2 border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Responsible and Ethical AI Use Principles</label>
                          <textarea
                            rows={2}
                            value={activeModule.requirements.responsibleAiPrinciples}
                            onChange={e => handleUpdateRequirements(safeActiveIndex, 'responsibleAiPrinciples', e.target.value)}
                            placeholder="e.g. Never treat AI output as authoritative truth without human validation; protect confidentiality unconditionally."
                            className="w-full p-2 border border-slate-300 rounded text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Category 3: Tools, Techniques & Procedures */}
            {(() => {
              const req = activeModule.requirements || {};
              const toolsFilled = [req.toolsAndTechniques, req.procedureSteps].filter(v => Boolean(v?.trim())).length;
              const isComp = toolsFilled === 2;

              return (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenCategory(openCategory === 'tools-techniques' ? null : 'tools-techniques')}
                    className={`w-full p-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors flex items-center justify-between cursor-pointer text-left border-l-4 ${
                      isComp ? 'border-l-[#45CC42]' : toolsFilled > 0 ? 'border-l-amber-400' : 'border-l-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-900">Tools, Techniques & Procedures</span>
                      <span className="text-[11px] text-slate-500">{toolsFilled} of 2 complete</span>
                    </div>
                    {openCategory === 'tools-techniques' ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>

                  {openCategory === 'tools-techniques' && (
                    <div className="p-5 bg-white space-y-4 border-t border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Tools & Techniques</label>
                          <input
                            type="text"
                            value={activeModule.requirements.toolsAndTechniques}
                            onChange={e => handleUpdateRequirements(safeActiveIndex, 'toolsAndTechniques', e.target.value)}
                            placeholder="e.g. The 4-Part Prompt Framework (Role, Context, Task, Constraints), Side-by-side Verification Table."
                            className="w-full p-2 border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Step-by-step Procedures</label>
                          <input
                            type="text"
                            value={activeModule.requirements.procedureSteps}
                            onChange={e => handleUpdateRequirements(safeActiveIndex, 'procedureSteps', e.target.value)}
                            placeholder="e.g. 1. Frame task. 2. Redact sensitive info. 3. Run prompt. 4. Verify against primary source. 5. Refine."
                            className="w-full p-2 border border-slate-300 rounded text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Category 4: Workplace Scenarios (Embeds ScenarioBuilder) */}
            {(() => {
              const scenarios = activeModule.requirements?.scenarios || [];
              const isComp = scenarios.length >= 3;

              return (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => setOpenCategory(openCategory === 'workplace-scenarios' ? null : 'workplace-scenarios')}
                    className={`w-full p-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors flex items-center justify-between cursor-pointer text-left border-l-4 ${
                      isComp ? 'border-l-[#45CC42]' : scenarios.length > 0 ? 'border-l-[#052B66]' : 'border-l-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-900">Workplace Scenarios (Minimum 3 required)</span>
                      <span className="text-[11px] font-semibold text-[#052B66]">
                        {scenarios.length} configured
                      </span>
                    </div>
                    {openCategory === 'workplace-scenarios' ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>

                  {openCategory === 'workplace-scenarios' && (
                    <div className="p-5 bg-white space-y-4 border-t border-slate-100">
                      <ScenarioBuilder
                        scenarios={scenarios}
                        isAiSpecific={false}
                        minRequired={3}
                        onUpdateScenarios={newScenarios => handleUpdateRequirements(safeActiveIndex, 'scenarios', newScenarios)}
                      />
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Category 5: AI Application Scenarios (Embeds ScenarioBuilder) */}
            {(() => {
              const aiScenarios = activeModule.requirements?.aiScenarios || [];
              const isComp = aiScenarios.length >= 2;

              return (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => setOpenCategory(openCategory === 'ai-scenarios' ? null : 'ai-scenarios')}
                    className={`w-full p-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors flex items-center justify-between cursor-pointer text-left border-l-4 ${
                      isComp ? 'border-l-[#45CC42]' : aiScenarios.length > 0 ? 'border-l-[#052B66]' : 'border-l-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-900">AI Application Scenarios (Minimum 2 required)</span>
                      <span className="text-[11px] font-semibold text-[#052B66]">
                        {aiScenarios.length} configured
                      </span>
                    </div>
                    {openCategory === 'ai-scenarios' ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>

                  {openCategory === 'ai-scenarios' && (
                    <div className="p-5 bg-white space-y-4 border-t border-slate-100">
                      <ScenarioBuilder
                        scenarios={aiScenarios}
                        isAiSpecific={true}
                        minRequired={2}
                        onUpdateScenarios={newAiScenarios => handleUpdateRequirements(safeActiveIndex, 'aiScenarios', newAiScenarios)}
                      />
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Category 6: Implementation & Governance */}
            {(() => {
              const req = activeModule.requirements || {};
              const govFilled = [req.implementationChecklistTitle, req.rolloutFrameworkTitle, req.riskComplianceSectionTitle].filter(v => Boolean(v?.trim())).length;
              const isComp = govFilled === 3;

              return (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenCategory(openCategory === 'governance' ? null : 'governance')}
                    className={`w-full p-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors flex items-center justify-between cursor-pointer text-left border-l-4 ${
                      isComp ? 'border-l-[#45CC42]' : govFilled > 0 ? 'border-l-amber-400' : 'border-l-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-900">Implementation, Mandatory Deliverables & Governance</span>
                      <span className="text-[11px] text-slate-500">{govFilled} of 3 complete</span>
                    </div>
                    {openCategory === 'governance' ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>

                  {openCategory === 'governance' && (
                    <div className="p-5 bg-white space-y-4 border-t border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Implementation Checklist Title</label>
                          <input
                            type="text"
                            value={activeModule.requirements.implementationChecklistTitle}
                            onChange={e => handleUpdateRequirements(safeActiveIndex, 'implementationChecklistTitle', e.target.value)}
                            placeholder="e.g. AI 30-Day Action Plan"
                            className="w-full p-2 border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Rollout Framework Title</label>
                          <input
                            type="text"
                            value={activeModule.requirements.rolloutFrameworkTitle}
                            onChange={e => handleUpdateRequirements(safeActiveIndex, 'rolloutFrameworkTitle', e.target.value)}
                            placeholder="e.g. Departmental Rollout Guide"
                            className="w-full p-2 border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Risk & Compliance Title</label>
                          <input
                            type="text"
                            value={activeModule.requirements.riskComplianceSectionTitle}
                            onChange={e => handleUpdateRequirements(safeActiveIndex, 'riskComplianceSectionTitle', e.target.value)}
                            placeholder="e.g. Risk Mitigation Matrix"
                            className="w-full p-2 border border-slate-300 rounded text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
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
          <span>← Back</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            id="section-04-continue-btn"
            onClick={onContinue}
            className="px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Continue to Learning Design →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
