import React from 'react';
import { Course, DiagnosticQuestion, ModulePlan } from '../types';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Layers,
  Target,
  Award,
  Users,
  BookOpen,
  ListChecks,
  Table
} from 'lucide-react';
import { SlideHeader } from './SlideHeader';
import { SlideFooter } from './SlideFooter';
import { EditorialField } from './EditorialField';

interface Section03StructureProps {
  course: Course;
  onUpdate: (updater: (prev: Course) => Course) => void;
  onContinue: () => void;
  onBack: () => void;
}

const AI_FAMILIARITY_DEFINITIONS: Array<{
  level: 'None' | 'Basic' | 'Intermediate' | 'Advanced';
  description: string;
}> = [
  {
    level: 'None',
    description: 'Has never used AI tools at work; may hold misconceptions or anxiety about AI.'
  },
  {
    level: 'Basic',
    description: 'Has heard of or casually used consumer AI (e.g., ChatGPT) with no structured workplace method.'
  },
  {
    level: 'Intermediate',
    description: 'Uses AI tools occasionally at work; understands basic prompting; lacks formal governance knowledge.'
  },
  {
    level: 'Advanced',
    description: 'Regularly integrates AI tools into workflows; understands limitations, prompting strategies, and basic ethics.'
  }
];

export const Section03Structure: React.FC<Section03StructureProps> = ({
  course,
  onUpdate,
  onContinue,
  onBack
}) => {
  const s = course.structure;
  const flagged = course.flaggedFields || {};

  const confirmFlag = (key: string) => {
    onUpdate(prev => {
      const next = { ...(prev.flaggedFields || {}) };
      delete next[key];
      return { ...prev, flaggedFields: next };
    });
  };

  const handleStructureChange = (field: keyof typeof s, value: any) => {
    onUpdate(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        [field]: value
      },
      // Keep course.name synced with Course Name while preserving spaces naturally
      name: field === 'title' ? value : prev.name
    }));
  };

  // Benefits list helpers (3.4)
  const ensureListMinimum = (arr: string[] | undefined, min = 2): string[] => {
    const base = Array.isArray(arr) ? [...arr] : [];
    while (base.length < min) base.push('');
    return base;
  };

  const orgBenefits = ensureListMinimum(s.organisationalBenefits, 2);
  const empBenefits = ensureListMinimum(s.employeeBenefits, 2);
  const riskOutcomes = ensureListMinimum(s.riskReductionOutcomes, 2);

  const handleBenefitChange = (
    listKey: 'organisationalBenefits' | 'employeeBenefits' | 'riskReductionOutcomes',
    currentList: string[],
    idx: number,
    val: string
  ) => {
    const next = [...currentList];
    next[idx] = val;
    handleStructureChange(listKey, next);
  };

  const handleAddBenefit = (
    listKey: 'organisationalBenefits' | 'employeeBenefits' | 'riskReductionOutcomes',
    currentList: string[]
  ) => {
    handleStructureChange(listKey, [...currentList, '']);
  };

  const handleRemoveBenefit = (
    listKey: 'organisationalBenefits' | 'employeeBenefits' | 'riskReductionOutcomes',
    currentList: string[],
    idx: number
  ) => {
    if (currentList.length <= 2) return;
    handleStructureChange(
      listKey,
      currentList.filter((_, i) => i !== idx)
    );
  };

  // Diagnostic Questions helpers (3.8)
  const diagQuestions: DiagnosticQuestion[] =
    s.diagnosticQuestions && s.diagnosticQuestions.length > 0
      ? s.diagnosticQuestions
      : [
          { id: 'diag-1', category: 'General domain knowledge', question: '' },
          { id: 'diag-2', category: 'Problem awareness', question: '' },
          { id: 'diag-3', category: 'Current workplace practices', question: '' },
          { id: 'diag-4', category: 'AI / digital readiness', question: '' },
          { id: 'diag-5', category: 'Ethics & compliance', question: '' }
        ];

  const handleDiagnosticChange = (idx: number, field: keyof DiagnosticQuestion, val: string) => {
    const next = [...diagQuestions];
    if (next[idx]) {
      next[idx] = { ...next[idx], [field]: val };
      handleStructureChange('diagnosticQuestions', next);
    }
  };

  const handleAddDiagnosticQuestion = () => {
    if (diagQuestions.length >= 10) return;
    const next: DiagnosticQuestion[] = [
      ...diagQuestions,
      {
        id: `diag-${Date.now()}`,
        category: 'General domain knowledge',
        question: ''
      }
    ];
    handleStructureChange('diagnosticQuestions', next);
  };

  const handleRemoveDiagnosticQuestion = (idx: number) => {
    if (diagQuestions.length <= 5) return;
    handleStructureChange(
      'diagnosticQuestions',
      diagQuestions.filter((_, i) => i !== idx)
    );
  };

  // 3.9 Module Overview Table helpers
  const handleModuleTableChange = (idx: number, field: keyof ModulePlan, val: string) => {
    onUpdate(prev => {
      const nextModules = [...prev.modules];
      if (nextModules[idx]) {
        nextModules[idx] = {
          ...nextModules[idx],
          [field]: val
        };
      }
      return {
        ...prev,
        modules: nextModules
      };
    });
  };

  const handleAddModuleRow = () => {
    onUpdate(prev => {
      const nextNum = prev.modules.length + 1;
      const newMod: ModulePlan = {
        id: `mod-${nextNum}-${Date.now()}`,
        number: nextNum,
        title: '',
        purpose: '',
        keySkills: '',
        learningOutcomes: [],
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
        lessons: []
      };
      return {
        ...prev,
        modules: [...prev.modules, newMod]
      };
    });
  };

  const handleRemoveModuleRow = (idx: number) => {
    if (course.modules.length <= 3) return;
    onUpdate(prev => {
      const filtered = prev.modules
        .filter((_, i) => i !== idx)
        .map((m, i) => ({ ...m, number: i + 1 }));
      return {
        ...prev,
        modules: filtered
      };
    });
  };

  return (
    <div id="section-03-structure-container" className="space-y-8 max-w-6xl font-sora">
      {/* Slide Header */}
      <SlideHeader
        sectionNumber="03"
        title="3. COURSE STRUCTURE"
        subtitle="Complete all Section 3 subsections (3.1 to 3.9) on a single, vertically organised page."
        slideNumber="03"
        totalSlides="09"
        badgeText={`${course.modules.length} Modules in Overview`}
      />

      {/* ================================================================= */}
      {/* 3.1 COURSE DETAILS                                                */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs border-l-4 border-l-[#052B66]">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
            SUBSECTION 3.1
          </span>
          <h3 className="text-base font-extrabold text-[#052B66] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#45CC42]" />
            <span>3.1 Course Details</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <EditorialField
              label="Course Name [INSERT]"
              value={s.title}
              onChange={val => handleStructureChange('title', val)}
              placeholder="e.g. Financial Literacy and Budget Control for Non-Financial Supervisors"
              required
              flaggedNote={flagged['structure.title']}
              onConfirmFlag={() => confirmFlag('structure.title')}
            />
          </div>

          <EditorialField
            label="Course Code / ID [INSERT]"
            value={s.code}
            onChange={val => handleStructureChange('code', val)}
            placeholder="e.g. EST-FIN-2026-01"
            flaggedNote={flagged['structure.code']}
            onConfirmFlag={() => confirmFlag('structure.code')}
          />

          <EditorialField
            label="Industry / Domain [INSERT]"
            value={s.industryDomain}
            onChange={val => handleStructureChange('industryDomain', val)}
            placeholder="e.g. Financial Services, Retail Operations, Corporate Governance"
            required
            flaggedNote={flagged['structure.industryDomain']}
            onConfirmFlag={() => confirmFlag('structure.industryDomain')}
          />

          <EditorialField
            label="Target Role Group [INSERT]"
            value={s.targetRoles}
            onChange={val => handleStructureChange('targetRoles', val)}
            placeholder="e.g. Operational Team Leaders, Supervisors, Compliance Officers"
            required
            flaggedNote={flagged['structure.targetRoles']}
            onConfirmFlag={() => confirmFlag('structure.targetRoles')}
          />

          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold tracking-wider text-[#052B66] uppercase block">
              AI Integration Level <span className="text-rose-600 font-black">*</span>
            </label>
            <select
              value={s.aiIntegrationLevel || 'Applied'}
              onChange={e => handleStructureChange('aiIntegrationLevel', e.target.value as any)}
              className="w-full text-xs font-normal text-slate-900 bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 focus:border-[#052B66] outline-none"
            >
              <option value="Awareness">Awareness (Foundational understanding of AI concepts & risks)</option>
              <option value="Applied">Applied (Practical use of AI tools in daily workplace tasks)</option>
              <option value="Advanced">Advanced (Strategic integration, workflow design & AI governance)</option>
            </select>
            <p className="text-[11px] text-slate-500">
              Select Awareness, Applied, or Advanced as defined in Section 3.1 of the PDF template.
            </p>
          </div>

          <EditorialField
            label="Accreditation / Qualification / Standards Alignment [INSERT OR N/A]"
            value={s.setaNqfLevel}
            onChange={val => handleStructureChange('setaNqfLevel', val)}
            placeholder="e.g. SAQA NQF Level 5 / Services SETA / Non-Accredited Short Course"
            flaggedNote={flagged['structure.setaNqfLevel']}
            onConfirmFlag={() => confirmFlag('structure.setaNqfLevel')}
          />

          <EditorialField
            label="Language(s) [INSERT]"
            value={s.deliveryLanguages}
            onChange={val => handleStructureChange('deliveryLanguages', val)}
            placeholder="e.g. South African English (Plain Business Language)"
            required
            flaggedNote={flagged['structure.deliveryLanguages']}
            onConfirmFlag={() => confirmFlag('structure.deliveryLanguages')}
          />

          <EditorialField
            label="Estimated Duration [INSERT]"
            value={s.estimatedDuration}
            onChange={val => handleStructureChange('estimatedDuration', val)}
            placeholder="e.g. 16 Hours (3 Modules + Capstone Project)"
            required
            flaggedNote={flagged['structure.estimatedDuration']}
            onConfirmFlag={() => confirmFlag('structure.estimatedDuration')}
          />
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3.2 COURSE OVERVIEW                                               */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
            SUBSECTION 3.2
          </span>
          <h3 className="text-base font-extrabold text-[#052B66] flex items-center gap-2">
            <Target className="w-4 h-4 text-[#45CC42]" />
            <span>3.2 Course Overview</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Provide a concise overview of the course's purpose, workplace relevance, expected performance improvement, and AI/technology angle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <EditorialField
            label="Purpose of the Course"
            value={s.purposeStatement}
            onChange={val => handleStructureChange('purposeStatement', val)}
            placeholder="State clearly why this course exists and what capability it builds..."
            multiline
            rows={3}
            required
            flaggedNote={flagged['structure.purposeStatement']}
            onConfirmFlag={() => confirmFlag('structure.purposeStatement')}
          />

          <EditorialField
            label="Workplace Relevance"
            value={s.workplaceRelevance}
            onChange={val => handleStructureChange('workplaceRelevance', val)}
            placeholder="Explain how this course connects directly to daily operational tasks..."
            multiline
            rows={3}
            required
            flaggedNote={flagged['structure.workplaceRelevance']}
            onConfirmFlag={() => confirmFlag('structure.workplaceRelevance')}
          />

          <EditorialField
            label="Expected Performance Improvement"
            value={s.performanceImprovement}
            onChange={val => handleStructureChange('performanceImprovement', val)}
            placeholder="Describe the measurable improvement in quality, speed, accuracy, or compliance..."
            multiline
            rows={3}
            required
            flaggedNote={flagged['structure.performanceImprovement']}
            onConfirmFlag={() => confirmFlag('structure.performanceImprovement')}
          />

          <EditorialField
            label="AI or Technology Angle (or state 'No AI/technology component' and explain why)"
            value={s.aiTechAngle}
            onChange={val => handleStructureChange('aiTechAngle', val)}
            placeholder="Describe how AI or digital tools relate to this topic, or state 'No AI/technology component' and explain why..."
            multiline
            rows={3}
            required
            flaggedNote={flagged['structure.aiTechAngle']}
            onConfirmFlag={() => confirmFlag('structure.aiTechAngle')}
          />
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3.3 ABOUT THE COURSE                                              */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
            SUBSECTION 3.3
          </span>
          <h3 className="text-base font-extrabold text-[#052B66] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#45CC42]" />
            <span>3.3 About the Course</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <EditorialField
            label="What the Course Covers"
            value={s.scopeSummary}
            onChange={val => handleStructureChange('scopeSummary', val)}
            placeholder="High-level summary of the topics, workflows, and modules covered..."
            multiline
            rows={3}
            required
            flaggedNote={flagged['structure.scopeSummary']}
            onConfirmFlag={() => confirmFlag('structure.scopeSummary')}
          />

          <EditorialField
            label="Why It Is Important in Today's AI-Enabled Workplace"
            value={s.aiEraRelevance}
            onChange={val => handleStructureChange('aiEraRelevance', val)}
            placeholder="Explain why these competencies are critical as workplaces adopt automation and AI..."
            multiline
            rows={3}
            flaggedNote={flagged['structure.aiEraRelevance']}
            onConfirmFlag={() => confirmFlag('structure.aiEraRelevance')}
          />

          <EditorialField
            label="How It Improves Job Performance"
            value={s.performanceLink}
            onChange={val => handleStructureChange('performanceLink', val)}
            placeholder="Explain how completing this course translates into better on-the-job execution..."
            multiline
            rows={3}
            flaggedNote={flagged['structure.performanceLink']}
            onConfirmFlag={() => confirmFlag('structure.performanceLink')}
          />
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3.4 BENEFITS OF THE COURSE                                        */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs border-l-4 border-l-[#45CC42]">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#45CC42]/20 px-2.5 py-0.5 rounded-md border border-[#45CC42]/40 inline-block mb-1">
            SUBSECTION 3.4
          </span>
          <h3 className="text-base font-extrabold text-[#052B66] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#052B66]" />
            <span>3.4 Benefits of the Course</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Specify the organisational benefits, employee benefits, and risk reduction outcomes achieved upon completion.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Organisational Benefits */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-[#052B66] uppercase tracking-wider">
                Organisational Benefits <span className="text-rose-600">*</span>
              </h4>
              <button
                type="button"
                onClick={() => handleAddBenefit('organisationalBenefits', orgBenefits)}
                className="text-[11px] font-bold text-[#052B66] hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#45CC42]" />
                <span>Add</span>
              </button>
            </div>
            <div className="space-y-2.5">
              {orgBenefits.map((val, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={val}
                    onChange={e => handleBenefitChange('organisationalBenefits', orgBenefits, idx, e.target.value)}
                    placeholder={`Benefit ${idx + 1} [INSERT]`}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:border-[#052B66] outline-none"
                  />
                  {orgBenefits.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit('organisationalBenefits', orgBenefits, idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Employee Benefits */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-[#052B66] uppercase tracking-wider">
                Employee Benefits <span className="text-rose-600">*</span>
              </h4>
              <button
                type="button"
                onClick={() => handleAddBenefit('employeeBenefits', empBenefits)}
                className="text-[11px] font-bold text-[#052B66] hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#45CC42]" />
                <span>Add</span>
              </button>
            </div>
            <div className="space-y-2.5">
              {empBenefits.map((val, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={val}
                    onChange={e => handleBenefitChange('employeeBenefits', empBenefits, idx, e.target.value)}
                    placeholder={`Benefit ${idx + 1} [INSERT]`}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:border-[#052B66] outline-none"
                  />
                  {empBenefits.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit('employeeBenefits', empBenefits, idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Risk Reduction Outcomes */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-[#052B66] uppercase tracking-wider">
                Risk Reduction Outcomes <span className="text-rose-600">*</span>
              </h4>
              <button
                type="button"
                onClick={() => handleAddBenefit('riskReductionOutcomes', riskOutcomes)}
                className="text-[11px] font-bold text-[#052B66] hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#45CC42]" />
                <span>Add</span>
              </button>
            </div>
            <div className="space-y-2.5">
              {riskOutcomes.map((val, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={val}
                    onChange={e => handleBenefitChange('riskReductionOutcomes', riskOutcomes, idx, e.target.value)}
                    placeholder={`Risk ${idx + 1} [INSERT]`}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:border-[#052B66] outline-none"
                  />
                  {riskOutcomes.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit('riskReductionOutcomes', riskOutcomes, idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3.5 COURSE DESCRIPTION                                            */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
            SUBSECTION 3.5
          </span>
          <h3 className="text-base font-extrabold text-[#052B66]">
            3.5 Course Description
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <EditorialField
            label="Scope of Learning"
            value={s.scope}
            onChange={val => handleStructureChange('scope', val)}
            placeholder="Define the depth, boundaries, and learning coverage of the course..."
            multiline
            rows={3}
            required
          />

          <EditorialField
            label="Key Competencies Developed"
            value={s.keyCompetencies}
            onChange={val => handleStructureChange('keyCompetencies', val)}
            placeholder="List the core workplace competencies learners will be able to demonstrate..."
            multiline
            rows={3}
            required
          />

          <EditorialField
            label="Real Workplace Application"
            value={s.realWorldApplication}
            onChange={val => handleStructureChange('realWorldApplication', val)}
            placeholder="Describe how learners will apply these skills in real operational scenarios..."
            multiline
            rows={3}
            required
          />

          <EditorialField
            label="AI-Specific Skills Built in This Course"
            value={s.aiSkillsDeveloped}
            onChange={val => handleStructureChange('aiSkillsDeveloped', val)}
            placeholder="e.g. Structured prompting, output verification, POPIA data sanitisation, bias detection..."
            multiline
            rows={3}
          />
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3.6 TARGET AUDIENCE & 3.7 PREREQUISITES                           */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 3.6 Target Audience */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
              SUBSECTION 3.6
            </span>
            <h3 className="text-base font-extrabold text-[#052B66] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#45CC42]" />
              <span>3.6 Target Audience</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <EditorialField
              label="Job Roles [INSERT]"
              value={s.jobRoles}
              onChange={val => handleStructureChange('jobRoles', val)}
              placeholder="e.g. Analysts, Clerks, Supervisors"
              required
            />

            <EditorialField
              label="Departments [INSERT]"
              value={s.departments}
              onChange={val => handleStructureChange('departments', val)}
              placeholder="e.g. Finance, Operations, HR"
            />

            <EditorialField
              label="Experience Level [INSERT]"
              value={s.experienceLevel}
              onChange={val => handleStructureChange('experienceLevel', val)}
              placeholder="e.g. Entry-level / 1–3 Years"
            />
          </div>

          {/* Official PDF AI Familiarity Selector */}
          <div className="space-y-2.5 pt-2">
            <label className="text-[11px] font-extrabold tracking-wider text-[#052B66] uppercase block">
              AI Familiarity Level <span className="text-rose-600 font-black">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AI_FAMILIARITY_DEFINITIONS.map(item => {
                const isSelected = s.aiFamiliarityBaseline === item.level;
                return (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => handleStructureChange('aiFamiliarityBaseline', item.level)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#052B66] text-white border-[#052B66] shadow-xs'
                        : 'bg-slate-50/70 hover:bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold">{item.level}</span>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#45CC42] text-[#052B66]">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] leading-snug ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <EditorialField
            label="AI Capability Explanation (What learners can and cannot already do)"
            value={s.aiFamiliarityExplanation || ''}
            onChange={val => handleStructureChange('aiFamiliarityExplanation', val)}
            placeholder="Explain what this AI familiarity level means in terms of what learners can and cannot already do in their daily work..."
            multiline
            rows={2}
          />
        </div>

        {/* 3.7 Prerequisites */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
              SUBSECTION 3.7
            </span>
            <h3 className="text-base font-extrabold text-[#052B66]">
              3.7 Prerequisites
            </h3>
          </div>

          <EditorialField
            label="Required Knowledge [INSERT]"
            value={s.prerequisiteKnowledge}
            onChange={val => handleStructureChange('prerequisiteKnowledge', val)}
            placeholder="e.g. Basic understanding of departmental SOPs"
            multiline
            rows={2}
          />

          <EditorialField
            label="Required Experience [INSERT]"
            value={s.prerequisiteExperience}
            onChange={val => handleStructureChange('prerequisiteExperience', val)}
            placeholder="e.g. Minimum 6 months in an operational role"
            multiline
            rows={2}
          />

          <EditorialField
            label="Tool / System Familiarity [INSERT]"
            value={s.toolsSystems}
            onChange={val => handleStructureChange('toolsSystems', val)}
            placeholder="e.g. Microsoft Excel, internal ERP system, web browser"
            multiline
            rows={2}
          />

          <EditorialField
            label="Digital Literacy Minimum [INSERT]"
            value={s.digitalLiteracyLevel}
            onChange={val => handleStructureChange('digitalLiteracyLevel', val)}
            placeholder="e.g. Able to navigate cloud applications, documents, and online forms"
            multiline
            rows={2}
          />
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3.8 PRE-COURSE DIAGNOSTIC QUESTIONS                               */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
              SUBSECTION 3.8
            </span>
            <h3 className="text-base font-extrabold text-[#052B66] flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-[#45CC42]" />
              <span>3.8 Pre-Course Diagnostic Questions (5–10 Questions)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Write 5–10 diagnostic questions to assess learner readiness before Module 1. Include at least 2 questions on AI/technology readiness.
            </p>
          </div>

          {diagQuestions.length < 10 && (
            <button
              type="button"
              onClick={handleAddDiagnosticQuestion}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#052B66] text-white hover:bg-[#042150] transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-[#45CC42]" />
              <span>Add Question ({diagQuestions.length}/10)</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {diagQuestions.map((q, idx) => (
            <div
              key={q.id || idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
              <div className="flex items-center gap-2 shrink-0 min-w-[230px]">
                <span className="w-7 h-7 rounded-lg bg-[#052B66] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                  Q{idx + 1}
                </span>
                <select
                  value={q.category}
                  onChange={e => handleDiagnosticChange(idx, 'category', e.target.value as any)}
                  className="text-xs font-bold text-[#052B66] bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none"
                >
                  <option value="General domain knowledge">General domain knowledge</option>
                  <option value="Problem awareness">Awareness of the problem</option>
                  <option value="Current workplace practices">Current workplace practices</option>
                  <option value="AI / digital readiness">AI awareness / digital readiness</option>
                  <option value="Ethics & compliance">Ethics / compliance awareness</option>
                </select>
              </div>

              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={q.question}
                  onChange={e => handleDiagnosticChange(idx, 'question', e.target.value)}
                  placeholder={`Enter diagnostic question Q${idx + 1} (${q.category})...`}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3.5 py-2 focus:border-[#052B66] outline-none"
                />
              </div>

              {diagQuestions.length > 5 && (
                <button
                  type="button"
                  onClick={() => handleRemoveDiagnosticQuestion(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                  title="Remove Question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3.9 MODULE OVERVIEW TABLE (MINIMUM 3 MODULES)                     */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs border-l-4 border-l-[#052B66]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
              SUBSECTION 3.9
            </span>
            <h3 className="text-base font-extrabold text-[#052B66] flex items-center gap-2">
              <Table className="w-4 h-4 text-[#45CC42]" />
              <span>3.9 Module Overview Table (Minimum 3 Modules)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Define the high-level title, purpose, and key skills for each module. Detailed content for each module is completed in Section 4.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddModuleRow}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#45CC42] text-[#052B66] hover:bg-[#3ec23b] transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Optional Module {course.modules.length + 1}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#052B66] text-white text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3 rounded-tl-xl w-14">#</th>
                <th className="py-3 px-3 w-1/4">Module Title *</th>
                <th className="py-3 px-3 w-1/3">Purpose *</th>
                <th className="py-3 px-3">Key Skills *</th>
                <th className="py-3 px-3 rounded-tr-xl w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {course.modules.map((mod, idx) => (
                <tr key={mod.id || idx} className="bg-white hover:bg-slate-50/80">
                  <td className="py-3 px-3 font-extrabold text-[#052B66] align-top">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#052B66]/10 text-[#052B66]">
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-3 align-top">
                    <input
                      type="text"
                      value={mod.title}
                      onChange={e => handleModuleTableChange(idx, 'title', e.target.value)}
                      placeholder={`Module ${idx + 1}: [INSERT TITLE]`}
                      className="w-full text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-lg px-3 py-2 focus:border-[#052B66] outline-none font-semibold"
                    />
                  </td>
                  <td className="py-3 px-3 align-top">
                    <input
                      type="text"
                      value={mod.purpose}
                      onChange={e => handleModuleTableChange(idx, 'purpose', e.target.value)}
                      placeholder="[INSERT PURPOSE]"
                      className="w-full text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-lg px-3 py-2 focus:border-[#052B66] outline-none"
                    />
                  </td>
                  <td className="py-3 px-3 align-top">
                    <input
                      type="text"
                      value={mod.keySkills}
                      onChange={e => handleModuleTableChange(idx, 'keySkills', e.target.value)}
                      placeholder="[INSERT KEY SKILLS]"
                      className="w-full text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-lg px-3 py-2 focus:border-[#052B66] outline-none"
                    />
                  </td>
                  <td className="py-3 px-3 align-top text-right">
                    {course.modules.length > 3 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveModuleRow(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Remove optional module"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={onBack}
          className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Section 2: Sources of Information</span>
        </button>

        <button
          id="section-03-continue-btn"
          onClick={onContinue}
          className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Section 4: Module Breakdown →</span>
        </button>
      </div>

      <SlideFooter currentSlide="03" totalSlides="09" />
    </div>
  );
};
