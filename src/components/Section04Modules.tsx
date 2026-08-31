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
  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(1); // default to Module 2 to match mockup Page 5/6
  const [openCategory, setOpenCategory] = useState<string | null>('workplace-scenarios');

  const modules = course.modules;
  const activeModule = modules[activeModuleIndex] || modules[0];

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
      title: `Module 0${newNum}: New Module`,
      subtitle: 'Workplace application',
      purpose: 'Define the target purpose for this learning module.',
      keySkills: ['Core Skill 1', 'Core Skill 2', 'Tool Verification'],
      learningObjectives: [
        'Define key operational concepts for this topic area.',
        'Demonstrate practical tool usage in workplace context.',
        'Execute error detection and compliance sign-off.'
      ],
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
        scenarios: [
          {
            id: `sc-${Date.now()}-1`,
            title: 'Initial Workplace Case',
            situation: '',
            challenge: '',
            decisionPoint: '',
            debrief: '',
            status: 'In progress'
          }
        ],
        aiScenarios: [
          {
            id: `aisc-${Date.now()}-1`,
            title: 'AI Verification Case',
            isAiSpecific: true,
            situation: '',
            challenge: '',
            decisionPoint: '',
            debrief: '',
            status: 'In progress'
          }
        ],
        implementationStrategy: '',
        rolloutMethod: '',
        meApproach: '',
        improvementCycle: '',
        implementationChecklistTitle: '30-Day Workplace Checklist',
        rolloutFrameworkTitle: 'Rollout Standard Operating Procedure',
        riskComplianceSectionTitle: 'Compliance & Risk Protocol',
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
    if (modules.length <= 3) {
      alert('The eStudy Master Prompt Framework mandates a minimum of 3 modules. You cannot delete below 3 modules.');
      return;
    }
    onUpdate(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== idx)
    }));
    if (activeModuleIndex >= idx) {
      setActiveModuleIndex(Math.max(0, activeModuleIndex - 1));
    }
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

      {/* Module Navigation Tabs List matching Mockup Page 5 */}
      <div className="space-y-3">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          MODULES ({modules.length} OF MINIMUM 3)
        </div>

        <div className="space-y-2.5">
          {modules.map((m, idx) => {
            const isSelected = activeModuleIndex === idx;
            const completedCategories = idx === 0 ? '10 of 10 complete' : idx === 1 ? '6 of 10 complete' : 'Not started';

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
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded">
                      0{idx + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 hover:text-[#052B66] transition-colors">
                        {m.title}
                      </h3>
                      <p className="text-xs text-slate-500">{m.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                        idx === 0
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : idx === 1
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {completedCategories}
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
                      <Check className="w-3.5 h-3.5 text-[#45CC42]" /> Core Content
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-[#45CC42]" /> AI Literacy
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-[#45CC42]" /> Tools & Techniques
                    </span>
                    <span className="flex items-center gap-1 text-[#052B66] font-semibold">
                      ● Scenarios ({activeModule.requirements.scenarios?.length || 0})
                    </span>
                    <span className="flex items-center gap-1 text-[#052B66] font-semibold">
                      ● AI Scenarios ({activeModule.requirements.aiScenarios?.length || 0})
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Module Detail Section matching Mockup Page 6 */}
      {activeModule && (
        <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-xs space-y-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[11px] font-bold text-[#052B66] uppercase tracking-wider">
                EDITING MODULE {activeModuleIndex + 1}
              </span>
              <h3 className="text-xl font-extrabold text-[#052B66] tracking-tight mt-0.5">
                {activeModule.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Turn core knowledge into workplace action through tools, procedures and scenarios.
              </p>
            </div>

            {modules.length > 3 && (
              <button
                onClick={() => handleDeleteModule(activeModuleIndex)}
                className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded transition-colors self-start cursor-pointer"
              >
                Delete Module
              </button>
            )}
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
                onChange={e => handleUpdateModule(activeModuleIndex, { purpose: e.target.value })}
                placeholder="Enable learners to use generative AI safely, verify outputs and make accountable decisions."
                className="w-full p-3 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-[#052B66] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Learning objectives ({activeModule.learningObjectives.length} defined) *
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Measurable & workplace-focused</span>
              </div>
              <textarea
                rows={3}
                value={activeModule.learningObjectives.join('\n')}
                onChange={e =>
                  handleUpdateModule(activeModuleIndex, {
                    learningObjectives: e.target.value.split('\n').filter(Boolean)
                  })
                }
                placeholder="One objective per line..."
                className="w-full p-3 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-[#052B66] outline-none font-sans"
              />
            </div>
          </div>

          {/* 10 Expandable Module Requirement Accordion Cards */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Build this module (10 Categories)
            </h4>

            {/* Category 1: Core Content */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenCategory(openCategory === 'core-content' ? null : 'core-content')}
                className="w-full p-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors flex items-center justify-between cursor-pointer text-left border-l-4 border-l-[#45CC42]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-900">Core Content</span>
                  <span className="text-[11px] text-slate-500">4 of 4 complete</span>
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
                        onChange={e => handleUpdateRequirements(activeModuleIndex, 'problemDefinition', e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Workplace Context</label>
                      <input
                        type="text"
                        value={activeModule.requirements.workplaceContext}
                        onChange={e => handleUpdateRequirements(activeModuleIndex, 'workplaceContext', e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Key Terms & Concepts</label>
                      <input
                        type="text"
                        value={activeModule.requirements.keyTerms}
                        onChange={e => handleUpdateRequirements(activeModuleIndex, 'keyTerms', e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Warning Signs / Impact</label>
                      <input
                        type="text"
                        value={activeModule.requirements.warningSigns}
                        onChange={e => handleUpdateRequirements(activeModuleIndex, 'warningSigns', e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Category 2: AI Literacy Foundation */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenCategory(openCategory === 'ai-literacy' ? null : 'ai-literacy')}
                className="w-full p-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors flex items-center justify-between cursor-pointer text-left border-l-4 border-l-[#45CC42]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-900">AI Literacy Foundation</span>
                  <span className="text-[11px] text-slate-500">3 of 3 complete</span>
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
                        onChange={e => handleUpdateRequirements(activeModuleIndex, 'aiDemystification', e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Responsible and Ethical AI Use Principles</label>
                      <textarea
                        rows={2}
                        value={activeModule.requirements.responsibleAiPrinciples}
                        onChange={e => handleUpdateRequirements(activeModuleIndex, 'responsibleAiPrinciples', e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Category 3: Tools, Techniques & Procedures */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenCategory(openCategory === 'tools-techniques' ? null : 'tools-techniques')}
                className="w-full p-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors flex items-center justify-between cursor-pointer text-left border-l-4 border-l-[#45CC42]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-900">Tools, Techniques & Procedures</span>
                  <span className="text-[11px] text-slate-500">3 of 3 complete</span>
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
                        onChange={e => handleUpdateRequirements(activeModuleIndex, 'toolsAndTechniques', e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Step-by-step Procedures</label>
                      <input
                        type="text"
                        value={activeModule.requirements.procedureSteps}
                        onChange={e => handleUpdateRequirements(activeModuleIndex, 'procedureSteps', e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Category 4: Workplace Scenarios (Embeds ScenarioBuilder) */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setOpenCategory(openCategory === 'workplace-scenarios' ? null : 'workplace-scenarios')}
                className="w-full p-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors flex items-center justify-between cursor-pointer text-left border-l-4 border-l-[#052B66]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-900">Workplace Scenarios (Minimum 3-5)</span>
                  <span className="text-[11px] font-semibold text-[#052B66]">
                    {activeModule.requirements.scenarios?.length || 0} configured
                  </span>
                </div>
                {openCategory === 'workplace-scenarios' ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {openCategory === 'workplace-scenarios' && (
                <div className="p-5 bg-white space-y-4 border-t border-slate-100">
                  <ScenarioBuilder
                    scenarios={activeModule.requirements.scenarios || []}
                    isAiSpecific={false}
                    minRequired={3}
                    onUpdateScenarios={newScenarios => handleUpdateRequirements(activeModuleIndex, 'scenarios', newScenarios)}
                  />
                </div>
              )}
            </div>

            {/* Category 5: AI Application Scenarios (Embeds ScenarioBuilder) */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setOpenCategory(openCategory === 'ai-scenarios' ? null : 'ai-scenarios')}
                className="w-full p-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors flex items-center justify-between cursor-pointer text-left border-l-4 border-l-[#052B66]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-900">AI Application Scenarios (Minimum 2)</span>
                  <span className="text-[11px] font-semibold text-[#052B66]">
                    {activeModule.requirements.aiScenarios?.length || 0} configured
                  </span>
                </div>
                {openCategory === 'ai-scenarios' ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {openCategory === 'ai-scenarios' && (
                <div className="p-5 bg-white space-y-4 border-t border-slate-100">
                  <ScenarioBuilder
                    scenarios={activeModule.requirements.aiScenarios || []}
                    isAiSpecific={true}
                    minRequired={2}
                    onUpdateScenarios={newAiScenarios => handleUpdateRequirements(activeModuleIndex, 'aiScenarios', newAiScenarios)}
                  />
                </div>
              )}
            </div>

            {/* Category 6: Implementation & Governance */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenCategory(openCategory === 'governance' ? null : 'governance')}
                className="w-full p-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors flex items-center justify-between cursor-pointer text-left border-l-4 border-l-[#45CC42]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-900">Implementation, Mandatory Deliverables & Governance</span>
                  <span className="text-[11px] text-slate-500">SOP & action plan titles</span>
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
                        onChange={e => handleUpdateRequirements(activeModuleIndex, 'implementationChecklistTitle', e.target.value)}
                        placeholder="e.g. AI 30-Day Action Plan"
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Rollout Framework Title</label>
                      <input
                        type="text"
                        value={activeModule.requirements.rolloutFrameworkTitle}
                        onChange={e => handleUpdateRequirements(activeModuleIndex, 'rolloutFrameworkTitle', e.target.value)}
                        placeholder="e.g. Departmental Rollout Guide"
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Risk & Compliance Title</label>
                      <input
                        type="text"
                        value={activeModule.requirements.riskComplianceSectionTitle}
                        onChange={e => handleUpdateRequirements(activeModuleIndex, 'riskComplianceSectionTitle', e.target.value)}
                        placeholder="e.g. Risk Mitigation Matrix"
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      />
                    </div>
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
