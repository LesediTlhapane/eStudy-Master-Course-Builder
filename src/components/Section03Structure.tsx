import React, { useState } from 'react';
import { Course, LearningJourneyStep, DiagnosticQuestion, CourseModule } from '../types';
import { ArrowRight, ArrowLeft, ChevronRight, Check, Plus, Minus, Trash2, BookOpen, Target, Sparkles, HelpCircle, Layers, Award, ShieldCheck, ListOrdered } from 'lucide-react';
import { SlideHeader } from './SlideHeader';
import { SlideFooter } from './SlideFooter';
import { FrameworkCallout } from './FrameworkCallout';
import { EditorialField } from './EditorialField';

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
  const [activeSlideTab, setActiveSlideTab] = useState<'meta' | 'purpose' | 'benefits' | 'journey'>('meta');
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [showOutcomesModal, setShowOutcomesModal] = useState(false);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);

  const s = course.structure;

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
  const [newRiskOutcome, setNewRiskOutcome] = useState('');

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

  const handleAddRiskOutcome = () => {
    if (!newRiskOutcome.trim()) return;
    handleStructureChange('riskReductionOutcomes', [...(s.riskReductionOutcomes || []), newRiskOutcome.trim()]);
    setNewRiskOutcome('');
  };

  const handleDeleteRiskOutcome = (index: number) => {
    handleStructureChange(
      'riskReductionOutcomes',
      (s.riskReductionOutcomes || []).filter((_, i) => i !== index)
    );
  };

  return (
    <div id="section-03-structure-container" className="space-y-6 max-w-6xl">
      {/* Slide Header */}
      <SlideHeader
        sectionNumber="03"
        title="Course Architecture & Learning Structure"
        subtitle="Establish the pedagogical foundation, scope, benefits, diagnostic questions, and learning journey."
        slideNumber="07"
        totalSlides="39"
        badgeText={`${course.modules.length} Modules Planned`}
      />

      {/* Framework Requirement Callout */}
      <FrameworkCallout
        title="Framework Requirement"
        requirement="Course architecture must establish concrete Bloom's taxonomy verbs, workplace relevance, 5-10 pre-assessment questions, and explicit SETA / NQF alignment."
        variant="requirement"
      />

      {/* Slide Navigation Tabs */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveSlideTab('meta')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSlideTab === 'meta'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Slide 07: Course Metadata</span>
          </button>

          <button
            onClick={() => setActiveSlideTab('purpose')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSlideTab === 'purpose'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Slide 08: Purpose & Value</span>
          </button>

          <button
            onClick={() => setActiveSlideTab('benefits')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSlideTab === 'benefits'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Slide 09: Benefits & Scope</span>
          </button>

          <button
            onClick={() => setActiveSlideTab('journey')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSlideTab === 'journey'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Slide 10: Journey & Diagnostics ({s.diagnosticQuestions.length})</span>
          </button>
        </div>
      </div>

      {activeSlideTab === 'meta' && (
        /* Slide 7: Course Architecture & Metadata */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              SLIDE 07 · ARCHITECTURE & SPECIFICATION
            </span>
            <h3 className="text-sm font-bold text-[#052B66]">
              Course Metadata & Delivery Specifications
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <EditorialField
              label="[COURSE TITLE]"
              value={s.title}
              onChange={val => handleStructureChange('title', val)}
              placeholder="e.g. AI Literacy for the Modern Workplace"
              required
            />

            <EditorialField
              label="[COURSE CODE / ID]"
              value={s.code}
              onChange={val => handleStructureChange('code', val)}
              placeholder="e.g. EST-AI-2026-01"
            />

            <EditorialField
              label="[INDUSTRY / DOMAIN]"
              value={s.industryDomain}
              onChange={val => handleStructureChange('industryDomain', val)}
              placeholder="e.g. Financial Services, Operations & Customer Support"
            />

            <EditorialField
              label="[ESTIMATED DURATION]"
              value={s.estimatedDuration}
              onChange={val => handleStructureChange('estimatedDuration', val)}
              placeholder="e.g. 6 hours / 10 CPD credits"
              required
            />

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold tracking-wider text-[#052B66] uppercase block">
                [DELIVERY FORMAT]
              </label>
              <select
                value={s.deliveryFormat}
                onChange={e => handleStructureChange('deliveryFormat', e.target.value)}
                className="w-full text-xs font-normal text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2.5 focus:border-[#052B66] outline-none"
              >
                <option value="Self-paced online">Self-paced online (LMS)</option>
                <option value="Blended workshop + digital">Blended workshop + digital</option>
                <option value="Facilitator-led interactive">Facilitator-led interactive</option>
                <option value="Micro-learning sprint">Micro-learning sprint</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold tracking-wider text-[#052B66] uppercase block">
                [DIFFICULTY LEVEL]
              </label>
              <select
                value={s.difficultyLevel}
                onChange={e => handleStructureChange('difficultyLevel', e.target.value)}
                className="w-full text-xs font-normal text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2.5 focus:border-[#052B66] outline-none"
              >
                <option value="Foundational">Foundational (Entry)</option>
                <option value="Intermediate">Intermediate (Practitioner)</option>
                <option value="Advanced">Advanced (Specialist / Lead)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold tracking-wider text-[#052B66] uppercase block">
                [AI INTEGRATION LEVEL]
              </label>
              <select
                value={s.aiIntegrationLevel}
                onChange={e => handleStructureChange('aiIntegrationLevel', e.target.value)}
                className="w-full text-xs font-normal text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2.5 focus:border-[#052B66] outline-none"
              >
                <option value="Awareness">Awareness (Conceptual)</option>
                <option value="Applied">Applied (Active Daily Use)</option>
                <option value="Advanced">Advanced (Workflow Automation & Tuning)</option>
              </select>
            </div>

            <EditorialField
              label="[SETA / NQF ALIGNMENT]"
              value={s.setaNqfLevel}
              onChange={val => handleStructureChange('setaNqfLevel', val)}
              placeholder="e.g. Aligned with NQF Level 5 (FASSET / INSETA)"
            />

            <EditorialField
              label="[TARGET ROLES]"
              value={s.targetRoles}
              onChange={val => handleStructureChange('targetRoles', val)}
              placeholder="e.g. Operations Specialists, Analysts, Team Leads"
            />
          </div>
        </div>
      )}

      {activeSlideTab === 'purpose' && (
        /* Slide 8: Purpose & Business Value */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                SLIDE 08 · RATIONALE
              </span>
              <h3 className="text-sm font-bold text-[#052B66]">
                Course Purpose & Strategic Relevance
              </h3>
            </div>

            <EditorialField
              label="[COURSE PURPOSE STATEMENT]"
              value={s.purposeStatement}
              onChange={val => handleStructureChange('purposeStatement', val)}
              placeholder="e.g. Equip corporate professionals with foundational AI fluency, verification procedures, and compliance safeguards."
              helperText="The overarching mission of this learning program."
              multiline
              rows={3}
              required
            />

            <EditorialField
              label="[WORKPLACE RELEVANCE & APPLICATION]"
              value={s.workplaceRelevance}
              onChange={val => handleStructureChange('workplaceRelevance', val)}
              placeholder="e.g. Connects daily communication, report drafting, and operational analytics directly to verified tools."
              helperText="How this learning applies directly to on-the-job responsibilities."
              multiline
              rows={3}
            />
          </div>

          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                SLIDE 08 · OUTCOMES & VALUE
              </span>
              <h3 className="text-sm font-bold text-[#052B66]">
                Performance Improvement & Tech Value
              </h3>
            </div>

            <EditorialField
              label="[PERFORMANCE IMPROVEMENT OUTCOME]"
              value={s.performanceImprovement}
              onChange={val => handleStructureChange('performanceImprovement', val)}
              placeholder="e.g. Increased task efficiency by 40% while reducing unverified factual errors to near zero."
              helperText="Measurable operational improvement expected."
              multiline
              rows={3}
            />

            <EditorialField
              label="[AI / TECH VALUE ANGLE]"
              value={s.aiTechAngle}
              onChange={val => handleStructureChange('aiTechAngle', val)}
              placeholder="e.g. Empowers employees to safely leverage generative intelligence without leaking proprietary data."
              helperText="Specific technological advantage gained."
              multiline
              rows={3}
            />
          </div>
        </div>
      )}

      {activeSlideTab === 'benefits' && (
        /* Slide 9: Benefits & Scope Description */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-6">
            {/* Organisational Benefits */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#052B66]">
                  [ORGANISATIONAL BENEFITS]
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {s.organisationalBenefits.length} items
                </span>
              </div>

              <div className="space-y-2">
                {s.organisationalBenefits.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-200">
                    <span className="text-slate-700">{item}</span>
                    <button onClick={() => handleDeleteOrgBenefit(idx)} className="text-rose-500 hover:text-rose-700 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newOrgBenefit}
                  onChange={e => setNewOrgBenefit(e.target.value)}
                  placeholder="e.g. Standardised operational quality and reduced compliance risk"
                  className="flex-1 text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#052B66] outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddOrgBenefit}
                  className="px-3.5 py-2.5 bg-[#052B66] text-white font-bold rounded-lg text-xs hover:bg-[#042150] cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Employee Benefits */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#052B66]">
                  [EMPLOYEE BENEFITS]
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {s.employeeBenefits.length} items
                </span>
              </div>

              <div className="space-y-2">
                {s.employeeBenefits.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-200">
                    <span className="text-slate-700">{item}</span>
                    <button onClick={() => handleDeleteEmpBenefit(idx)} className="text-rose-500 hover:text-rose-700 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newEmpBenefit}
                  onChange={e => setNewEmpBenefit(e.target.value)}
                  placeholder="e.g. Enhanced confidence using digital tools with zero risk of penalty"
                  className="flex-1 text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#052B66] outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddEmpBenefit}
                  className="px-3.5 py-2.5 bg-[#052B66] text-white font-bold rounded-lg text-xs hover:bg-[#042150] cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            {/* Risk Reduction Outcomes */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#052B66]">
                  [RISK REDUCTION & COMPLIANCE]
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(s.riskReductionOutcomes || []).length} items
                </span>
              </div>

              <div className="space-y-2">
                {(s.riskReductionOutcomes || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-200">
                    <span className="text-slate-700">{item}</span>
                    <button onClick={() => handleDeleteRiskOutcome(idx)} className="text-rose-500 hover:text-rose-700 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newRiskOutcome}
                  onChange={e => setNewRiskOutcome(e.target.value)}
                  placeholder="e.g. Strict containment of personally identifiable information (POPIA)"
                  className="flex-1 text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#052B66] outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddRiskOutcome}
                  className="px-3.5 py-2.5 bg-[#052B66] text-white font-bold rounded-lg text-xs hover:bg-[#042150] cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Course Scope Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  SLIDE 09 · BOUNDARIES
                </span>
                <h3 className="text-sm font-bold text-[#052B66]">
                  [COURSE SCOPE & DELINEATION]
                </h3>
              </div>

              <EditorialField
                label="[IN-SCOPE TOPICS & BOUNDARIES]"
                value={s.scope}
                onChange={val => handleStructureChange('scope', val)}
                placeholder="e.g. Focuses on prompt construction, output verification checklists, POPIA compliance, and practical office tasks."
                multiline
                rows={3}
              />

              <EditorialField
                label="[KEY COMPETENCIES DEVELOPED]"
                value={s.keyCompetencies}
                onChange={val => handleStructureChange('keyCompetencies', val)}
                placeholder="e.g. Critical output evaluation, structured prompt framing, data anonymisation, compliance sign-off."
                multiline
                rows={2}
              />
            </div>
          </div>
        </div>
      )}

      {activeSlideTab === 'journey' && (
        /* Slide 10: Learning Journey & Diagnostic Questions */
        <div className="space-y-6">
          {/* 5-Step Learning Journey Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                SLIDE 10 · PROGRESSION
              </span>
              <h3 className="text-sm font-bold text-[#052B66]">
                [5-STEP LEARNING JOURNEY ARCHITECTURE]
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {s.learningJourney.map((step, idx) => (
                <div
                  key={step.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 relative"
                >
                  <div className="w-6 h-6 rounded-full bg-[#052B66] text-white text-xs font-bold flex items-center justify-center font-mono">
                    {step.stepNumber}
                  </div>
                  <input
                    type="text"
                    value={step.title}
                    onChange={e => handleJourneyStepChange(idx, 'title', e.target.value)}
                    className="w-full text-xs font-bold text-[#052B66] bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#052B66] outline-none pb-0.5"
                  />
                  <textarea
                    rows={3}
                    value={step.description}
                    onChange={e => handleJourneyStepChange(idx, 'description', e.target.value)}
                    className="w-full text-[11px] text-slate-600 bg-transparent border border-transparent hover:border-slate-300 focus:border-[#052B66] rounded p-1 outline-none resize-none leading-tight"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Pre-Assessment Questions (5-10 Required) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  SLIDE 10 · DIAGNOSTICS
                </span>
                <h3 className="text-sm font-bold text-[#052B66]">
                  [PRE-ASSESSMENT DIAGNOSTIC QUESTIONS]
                </h3>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                s.diagnosticQuestions.length >= 5
                  ? 'bg-[#45CC42]/20 text-[#052B66] border-[#45CC42]/40'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {s.diagnosticQuestions.length} Questions (Min 5 Required)
              </span>
            </div>

            <div className="space-y-3">
              {s.diagnosticQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="flex items-start justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] font-bold text-[#052B66] bg-slate-200 px-2 py-0.5 rounded">
                        Q0{idx + 1}
                      </span>
                      <span className="text-[10px] font-semibold uppercase text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                        {q.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium pt-1">
                      {q.question}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteDiagnostic(q.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add diagnostic form */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-bold text-[#052B66] uppercase tracking-wide">
                + Add Diagnostic Question
              </span>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-1">
                  <select
                    value={newDiagCategory}
                    onChange={e => setNewDiagCategory(e.target.value as DiagnosticQuestion['category'])}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="AI / digital readiness">AI / Digital Readiness</option>
                    <option value="Problem awareness">Problem Awareness</option>
                    <option value="Current practices">Current Practices</option>
                    <option value="Ethics & compliance">Ethics & Compliance</option>
                    <option value="General domain">General Domain</option>
                  </select>
                </div>
                <div className="md:col-span-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={newDiagQuestion}
                    onChange={e => setNewDiagQuestion(e.target.value)}
                    placeholder="e.g. How often do you verify AI-generated answers against primary policy documents?"
                    className="flex-1 text-xs p-2.5 bg-white border border-slate-300 rounded-lg outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddDiagnostic}
                    className="px-4 py-2.5 bg-[#052B66] text-white text-xs font-bold rounded-lg hover:bg-[#042150] cursor-pointer"
                  >
                    Add Question
                  </button>
                </div>
              </div>
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
          <span>← Back to Sources</span>
        </button>

        <button
          id="section-03-continue-btn"
          onClick={onContinue}
          className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Module Architecture (Section 04) →</span>
        </button>
      </div>

      {/* Slide Footer */}
      <SlideFooter currentSlide="07" totalSlides="39" />
    </div>
  );
};
