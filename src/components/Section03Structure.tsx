import React, { useState } from 'react';
import { Course, LearningJourneyStep, DiagnosticQuestion, CourseModule } from '../types';
import { ArrowRight, ArrowLeft, ChevronRight, Check, Plus, Minus, Trash2, BookOpen, Target, Sparkles, HelpCircle } from 'lucide-react';

interface Section03StructureProps {
  course: Course;
  onUpdate: (updater: (prev: Course) => Course) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const Section03Structure: React.FC<Section03StructureProps> = ({
  course,
  onUpdate,
  onContinue,
  onBack
}) => {
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [showOutcomesModal, setShowOutcomesModal] = useState(false);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);

  const s = course.structure;

  const createDefaultModule = (num: number): CourseModule => ({
    id: `mod-${Date.now()}-${num}`,
    moduleNumber: num,
    title: `Module 0${num}: Workplace Practice & Mastery`,
    subtitle: 'Practical application and execution',
    purpose: `Build practical competence and operational mastery for Module ${num}.`,
    keySkills: ['Operational Execution', 'Standard Compliance', 'Quality Control', 'Tool Verification'],
    learningObjectives: [
      `Apply core Module ${num} operational procedures to authentic workplace challenges.`,
      'Identify risks, anomalies, and compliance criteria in routine workflows.',
      'Evaluate automated outputs against South African statutory and institutional standards.'
    ],
    status: 'In progress',
    requirements: {
      problemDefinition: `Address specific operational bottlenecks and efficiency gaps for Module ${num}.`,
      workplaceContext: 'South African workplace operational environment.',
      keyTerms: 'Operational Governance, Quality Assurance, Audit Trail',
      causes: 'Procedural variance, lack of standardisation, unverified tool outputs',
      warningSigns: 'Rework frequency, SLA delays, compliance exceptions',
      impactStatement: 'Improves delivery speed and reduces operational error rates.',
      aiDemystification: 'Understanding task-specific automation boundaries and human oversight.',
      aiInThisDomain: 'Domain-specific tool applications and validation routines.',
      aiToolsOverview: 'Approved workplace productivity and analytics systems.',
      responsibleAiPrinciples: 'Data privacy, human-in-the-loop sign-off, transparency.',
      toolsAndTechniques: 'Standard checklists, verification protocols, exception handling.',
      procedureSteps: 'Step 1: Input preparation and validation\nStep 2: Execution and generation\nStep 3: Verification and compliance sign-off',
      roleResponsibilities: 'Operational Lead: Execution\nLine Manager: Review and compliance sign-off',
      communicationApproach: 'Transparent logging and cross-functional handovers.',
      supportMechanisms: 'Standard operating procedures, mentor support, escalation channels.',
      scenarios: [
        {
          id: `sc-${Date.now()}-${num}-1`,
          title: `Workplace Case: Module ${num} Execution`,
          situation: 'A team member encounters an urgent client request requiring rapid turnaround.',
          challenge: 'Balancing delivery speed against quality checks and POPIA data protection guidelines.',
          decisionPoint: 'Does the practitioner follow expedited protocols or standard multi-tier sign-off?',
          debrief: 'Demonstrates risk-based decision making and adherence to mandatory compliance gates.',
          status: 'In progress'
        }
      ],
      aiScenarios: [
        {
          id: `aisc-${Date.now()}-${num}-1`,
          title: `AI Oversight: Verification in Module ${num}`,
          isAiSpecific: true,
          situation: 'An automated model generates a summary report with subtle data discrepancies.',
          challenge: 'Detecting synthetic hallucinations before client transmission.',
          decisionPoint: 'Conduct manual line-by-line reconciliation or trust system output score?',
          debrief: 'Reinforces human-in-the-loop verification as an absolute statutory requirement.',
          status: 'In progress'
        }
      ],
      implementationStrategy: 'Phased departmental rollout with weekly review checkpoints.',
      rolloutMethod: 'Blended digital practice with peer review sessions.',
      meApproach: 'Quarterly compliance audit and skill proficiency tracking.',
      improvementCycle: 'Continuous feedback loops incorporated into quarterly planning.',
      implementationChecklistTitle: `Module ${num} Implementation Checklist`,
      rolloutFrameworkTitle: `Module ${num} Rollout Operating Procedure`,
      riskComplianceSectionTitle: `Module ${num} Statutory Compliance Protocol`,
      continuousAiLearningApproach: 'Monthly prompt tuning and error analysis debriefs.',
      aiGovernanceFramework: 'Aligned with POPIA and enterprise data retention policies.',
      aiFeedbackReviewMechanism: 'Anonymous error reporting and supervisor review meetings.'
    }
  });

  const handleModuleCountChange = (newCount: number) => {
    const clamped = Math.max(1, Math.min(12, newCount));
    onUpdate(prev => {
      const currentMods = prev.modules || [];
      if (clamped === currentMods.length) return prev;

      if (clamped > currentMods.length) {
        const added: CourseModule[] = [];
        for (let i = currentMods.length + 1; i <= clamped; i++) {
          added.push(createDefaultModule(i));
        }
        return {
          ...prev,
          modules: [...currentMods, ...added]
        };
      } else {
        const trimmed = currentMods.slice(0, clamped).map((mod, idx) => ({
          ...mod,
          moduleNumber: idx + 1
        }));
        return {
          ...prev,
          modules: trimmed
        };
      }
    });
  };

  const handleStructureChange = (field: keyof typeof s, value: any) => {
    onUpdate(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        [field]: value
      },
      name: field === 'title' ? value : prev.name
    }));
  };

  const handleJourneyStepChange = (index: number, field: keyof LearningJourneyStep, value: string) => {
    const updated = [...s.learningJourney];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      handleStructureChange('learningJourney', updated);
    }
  };

  // Add diagnostic question
  const [newDiagCategory, setNewDiagCategory] = useState<DiagnosticQuestion['category']>('AI / digital readiness');
  const [newDiagQuestion, setNewDiagQuestion] = useState('');

  const handleAddDiagnostic = () => {
    if (!newDiagQuestion.trim()) return;
    const newQ: DiagnosticQuestion = {
      id: `diag-${Date.now()}`,
      category: newDiagCategory,
      question: newDiagQuestion.trim()
    };
    handleStructureChange('diagnosticQuestions', [...s.diagnosticQuestions, newQ]);
    setNewDiagQuestion('');
  };

  const handleDeleteDiagnostic = (id: string) => {
    handleStructureChange(
      'diagnosticQuestions',
      s.diagnosticQuestions.filter(q => q.id !== id)
    );
  };

  const [newOrgBenefit, setNewOrgBenefit] = useState('');
  const [newEmpBenefit, setNewEmpBenefit] = useState('');

  const handleAddOrgBenefit = () => {
    if (!newOrgBenefit.trim()) return;
    handleStructureChange('organisationalBenefits', [...s.organisationalBenefits, newOrgBenefit.trim()]);
    setNewOrgBenefit('');
  };

  const handleDeleteOrgBenefit = (index: number) => {
    handleStructureChange(
      'organisationalBenefits',
      s.organisationalBenefits.filter((_, i) => i !== index)
    );
  };

  const handleAddEmpBenefit = () => {
    if (!newEmpBenefit.trim()) return;
    handleStructureChange('employeeBenefits', [...s.employeeBenefits, newEmpBenefit.trim()]);
    setNewEmpBenefit('');
  };

  const handleDeleteEmpBenefit = (index: number) => {
    handleStructureChange(
      'employeeBenefits',
      s.employeeBenefits.filter((_, i) => i !== index)
    );
  };

  // Calculate dynamic completion
  const checkFields = [
    Boolean(s.title?.trim()),
    Boolean(s.estimatedDuration?.trim()),
    Boolean(s.targetRoles?.trim()),
    Boolean(s.deliveryFormat),
    Boolean(s.difficultyLevel),
    Boolean(s.purposeStatement?.trim()),
    Boolean(s.workplaceRelevance?.trim()),
    Boolean(s.performanceImprovement?.trim()),
    s.diagnosticQuestions.length > 0
  ];
  const completedCount = checkFields.filter(Boolean).length;

  return (
    <div id="section-03-structure-container" className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-mono text-[#052B66]">03</span>
            <h2 className="text-2xl font-extrabold text-[#052B66] tracking-tight">
              Course Structure
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Define the course architecture before you design individual modules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
            completedCount === 9
              ? 'bg-[#45CC42]/20 text-[#052B66] border-[#45CC42]/40'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {completedCount} of 9 complete
          </span>
        </div>
      </div>

      {/* Course Essentials Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-[#052B66] uppercase tracking-wider">
          Course essentials
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Row 1 */}
          <div className="space-y-1.5 md:col-span-1">
            <label className="block text-xs font-bold text-slate-700">
              Course title *
            </label>
            <input
              type="text"
              value={s.title}
              onChange={e => handleStructureChange('title', e.target.value)}
              placeholder="e.g. AI Literacy for the Modern Workplace"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 focus:border-[#052B66] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Estimated duration *
            </label>
            <input
              type="text"
              value={s.estimatedDuration}
              onChange={e => handleStructureChange('estimatedDuration', e.target.value)}
              placeholder="e.g. 6 hours / 10 CPD credits"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-[#052B66] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Delivery format *
            </label>
            <select
              value={s.deliveryFormat}
              onChange={e => handleStructureChange('deliveryFormat', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-[#052B66] outline-none bg-white"
            >
              <option value="Self-paced online">Self-paced online</option>
              <option value="Blended workshop + digital">Blended workshop + digital</option>
              <option value="Facilitator-led interactive">Facilitator-led interactive</option>
              <option value="Micro-learning sprint">Micro-learning sprint</option>
            </select>
          </div>

          {/* Row 2 */}
          <div className="space-y-1.5 md:col-span-1">
            <label className="block text-xs font-bold text-slate-700">
              Who is this course designed for? *
            </label>
            <input
              type="text"
              value={s.targetRoles}
              onChange={e => handleStructureChange('targetRoles', e.target.value)}
              placeholder="e.g. Corporate employees, operations analysts, customer service consultants, and team leads"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-[#052B66] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Difficulty level *
            </label>
            <select
              value={s.difficultyLevel}
              onChange={e => handleStructureChange('difficultyLevel', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-[#052B66] outline-none bg-white"
            >
              <option value="Foundational">Foundational</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="course-module-count-input" className="block text-xs font-bold text-slate-700">
                Number of modules *
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                {course.modules.length < 3 ? 'Min 3 recommended' : '1 to 12 modules'}
              </span>
            </div>
            
            {/* Interactive Stepper & Input */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="decrement-module-count-btn"
                onClick={() => handleModuleCountChange(course.modules.length - 1)}
                disabled={course.modules.length <= 1}
                title="Decrease module count"
                className="w-10 h-10 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-[#052B66] font-bold flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="relative flex-1">
                <input
                  id="course-module-count-input"
                  type="number"
                  min={1}
                  max={12}
                  value={course.modules.length}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      handleModuleCountChange(val);
                    }
                  }}
                  className="w-full text-center py-2.5 px-3 rounded-lg border border-slate-300 text-sm font-extrabold text-[#052B66] bg-white focus:border-[#052B66] focus:ring-1 focus:ring-[#052B66] outline-none transition-all"
                />
              </div>

              <button
                type="button"
                id="increment-module-count-btn"
                onClick={() => handleModuleCountChange(course.modules.length + 1)}
                disabled={course.modules.length >= 12}
                title="Increase module count"
                className="w-10 h-10 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-[#052B66] font-bold flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Preset Selector Pills */}
            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
              <span className="text-[10px] text-slate-500 font-medium mr-1">Quick:</span>
              {[2, 3, 4, 5, 6, 8].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleModuleCountChange(num)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                    course.modules.length === num
                      ? 'bg-[#052B66] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {num} mod
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Learning Journey Pipeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#052B66] uppercase tracking-wider">
              Learning journey
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visual pedagogical progression through the 4 core competencies.
            </p>
          </div>
        </div>

        {/* 4-Step Interactive Visual Flow matching Mockup Page 4 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {s.learningJourney.map((step, idx) => (
            <div
              key={step.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-[#052B66]/30 transition-all space-y-2 relative group"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#052B66] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {step.stepNumber}
                </span>
                <span className="font-extrabold text-xs text-[#052B66] tracking-tight">
                  {step.title}
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-800">
                {step.subtitle}
              </p>
              <p className="text-[11px] text-slate-500 leading-snug">
                {step.description}
              </p>

              {/* Arrow divider for larger screens */}
              {idx < s.learningJourney.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Purpose, Outcomes & Diagnostics Summary Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Purpose */}
        <button
          onClick={() => setShowPurposeModal(true)}
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#45CC42] hover:shadow-xs transition-all text-left flex items-center justify-between group cursor-pointer border-l-4 border-l-[#45CC42]"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#052B66]">
              Course purpose
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete & aligned
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#45CC42] transition-colors" />
        </button>

        {/* Outcomes */}
        <button
          onClick={() => setShowOutcomesModal(true)}
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#45CC42] hover:shadow-xs transition-all text-left flex items-center justify-between group cursor-pointer border-l-4 border-l-[#45CC42]"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#052B66]">
              Course outcomes
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {s.organisationalBenefits.length + s.employeeBenefits.length} outcomes defined
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#45CC42] transition-colors" />
        </button>

        {/* Diagnostics */}
        <button
          onClick={() => setShowDiagnosticsModal(true)}
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#45CC42] hover:shadow-xs transition-all text-left flex items-center justify-between group cursor-pointer border-l-4 border-l-[#45CC42]"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#052B66]">
              Diagnostic questions
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {s.diagnosticQuestions.length} pre-course items
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#45CC42] transition-colors" />
        </button>
      </div>

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
            id="section-03-continue-btn"
            onClick={onContinue}
            className="px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Continue →</span>
          </button>
        </div>
      </div>

      {/* Course Purpose Modal */}
      {showPurposeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-[#052B66]">
              Course Purpose & Overview
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purpose of the Course *
                </label>
                <textarea
                  rows={3}
                  value={s.purposeStatement}
                  onChange={e => handleStructureChange('purposeStatement', e.target.value)}
                  placeholder="e.g. Equip employees with the practical skills, ethical judgment, and critical verification habits required to harness generative AI safely."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#052B66] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Workplace Relevance *
                </label>
                <textarea
                  rows={2}
                  value={s.workplaceRelevance}
                  onChange={e => handleStructureChange('workplaceRelevance', e.target.value)}
                  placeholder="e.g. Addresses immediate daily tasks including drafting, data summarisation, customer inquiries, and workflow automation."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#052B66] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expected Performance Improvement *
                </label>
                <textarea
                  rows={2}
                  value={s.performanceImprovement}
                  onChange={e => handleStructureChange('performanceImprovement', e.target.value)}
                  placeholder="e.g. Reduces time spent on repetitive drafting by 40% while preventing data breaches and factual hallucinations."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#052B66] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowPurposeModal(false)}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] cursor-pointer"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Outcomes Modal */}
      {showOutcomesModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-[#052B66]">
              Course Benefits & Outcomes
            </h3>

            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
              {/* Organisational Benefits */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Organisational Benefits ({s.organisationalBenefits.length})
                </h4>
                <div className="space-y-1.5">
                  {s.organisationalBenefits.length === 0 ? (
                    <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded text-xs text-slate-400 text-center">
                      No organisational benefits added yet.
                    </div>
                  ) : (
                    s.organisationalBenefits.map((b, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#45CC42] shrink-0" />
                          <span>{b}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteOrgBenefit(i)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer shrink-0"
                          title="Remove benefit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newOrgBenefit}
                    onChange={e => setNewOrgBenefit(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOrgBenefit();
                      }
                    }}
                    placeholder="e.g. Standardised, compliant workplace AI adoption across departments"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#052B66] outline-none bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddOrgBenefit}
                    disabled={!newOrgBenefit.trim()}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Employee Benefits */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Employee Benefits ({s.employeeBenefits.length})
                </h4>
                <div className="space-y-1.5">
                  {s.employeeBenefits.length === 0 ? (
                    <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded text-xs text-slate-400 text-center">
                      No employee benefits added yet.
                    </div>
                  ) : (
                    s.employeeBenefits.map((b, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#45CC42] shrink-0" />
                          <span>{b}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteEmpBenefit(i)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer shrink-0"
                          title="Remove benefit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newEmpBenefit}
                    onChange={e => setNewEmpBenefit(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEmpBenefit();
                      }
                    }}
                    placeholder="e.g. Confidence in using modern digital and AI tools safely"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#052B66] outline-none bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddEmpBenefit}
                    disabled={!newEmpBenefit.trim()}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowOutcomesModal(false)}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Course Diagnostics Modal */}
      {showDiagnosticsModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#052B66]">
                  Pre-Course Diagnostic Questions (3.8)
                </h3>
                <p className="text-xs text-slate-500">
                  Minimum 5 diagnostic questions required by Master Prompt v9.0.
                </p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                s.diagnosticQuestions.length >= 5
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {s.diagnosticQuestions.length} question{s.diagnosticQuestions.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {s.diagnosticQuestions.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-xs text-slate-500 text-center space-y-1">
                  <p className="font-semibold text-slate-700">No diagnostic questions added yet</p>
                  <p>Add questions below to evaluate baseline learner competence across categories.</p>
                </div>
              ) : (
                s.diagnosticQuestions.map((dq, idx) => (
                  <div key={dq.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#052B66] bg-white px-2 py-0.5 rounded border border-slate-200">
                        {dq.category}
                      </span>
                      <p className="text-slate-800 font-medium pt-1">
                        {idx + 1}. {dq.question}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteDiagnostic(dq.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add question form */}
            <div className="p-3 bg-slate-100/70 rounded-lg space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={newDiagCategory}
                  onChange={e => setNewDiagCategory(e.target.value as any)}
                  className="col-span-1 px-2 py-1.5 rounded border border-slate-300 text-xs bg-white"
                >
                  <option value="General domain">General domain</option>
                  <option value="Problem awareness">Problem awareness</option>
                  <option value="Current practices">Current practices</option>
                  <option value="AI / digital readiness">AI / digital readiness</option>
                  <option value="Ethics & compliance">Ethics & compliance</option>
                </select>
                <input
                  type="text"
                  placeholder="e.g. How do you currently use digital automation or AI tools in your daily job responsibilities?"
                  value={newDiagQuestion}
                  onChange={e => setNewDiagQuestion(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDiagnostic();
                    }
                  }}
                  className="col-span-2 px-3 py-1.5 rounded border border-slate-300 text-xs bg-white"
                />
              </div>
              <button
                type="button"
                onClick={handleAddDiagnostic}
                disabled={!newDiagQuestion.trim()}
                className="w-full py-1.5 rounded bg-[#052B66] text-white text-xs font-semibold hover:bg-[#042150] disabled:opacity-50 cursor-pointer"
              >
                + Add Diagnostic Question
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDiagnosticsModal(false)}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
