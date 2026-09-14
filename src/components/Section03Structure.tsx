import React, { useState } from 'react';
import { Course, LearningJourneyStep, DiagnosticQuestion } from '../types';
import {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  BookOpen,
  Target,
  Sparkles,
  Layers,
  Award,
  ListOrdered,
  Eye,
  Sliders
} from 'lucide-react';
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
  const [simpleClientView, setSimpleClientView] = useState(false);
  const [skippedNotice, setSkippedNotice] = useState(false);

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

  const handleSkipUnknownCourseDetails = () => {
    onUpdate(prev => {
      const curr = prev.structure;
      const title = curr.title || prev.name || 'Professional Workplace Capability Course';
      return {
        ...prev,
        structure: {
          ...curr,
          title: title,
          code: curr.code || `EST-${new Date().getFullYear()}-01`,
          industryDomain: curr.industryDomain || 'Corporate Enterprise & Operations',
          targetRoles: curr.targetRoles || 'Operational specialists, consultants, and departmental team leaders',
          estimatedDuration: curr.estimatedDuration || '16 Hours / 2 CPD Credits',
          deliveryFormat: curr.deliveryFormat || 'Self-paced online',
          difficultyLevel: curr.difficultyLevel || 'Intermediate',
          aiIntegrationLevel: curr.aiIntegrationLevel || 'Applied',
          setaNqfLevel: curr.setaNqfLevel || 'NQF Level 5 Alignment',
          deliveryLanguages: curr.deliveryLanguages || 'English (South African business standard, Plain Language)',
          purposeStatement: curr.purposeStatement || `[AI Auto-Complete: Equip learners with practical competencies, standard operating procedures, and risk compliance in ${title}]`,
          workplaceRelevance: curr.workplaceRelevance || `[AI Auto-Complete: Direct daily workplace application in operational decision-making, quality verification, and efficiency]`,
          performanceImprovement: curr.performanceImprovement || `[AI Auto-Complete: Elimination of procedural delays, error reduction, and audit-ready governance]`,
          scopeSummary: curr.scopeSummary || `[AI Auto-Complete: Comprehensive coverage of foundational knowledge, applied practice, and South African regulatory standards]`,
          organisationalBenefits: curr.organisationalBenefits.length > 0 ? curr.organisationalBenefits : [
            'Enhanced operational throughput and quality standardization',
            'Strict compliance with POPIA and corporate governance standards',
            'Measurable productivity improvement across participant departments'
          ],
          employeeBenefits: curr.employeeBenefits.length > 0 ? curr.employeeBenefits : [
            'Recognized workplace competency aligned with CPD requirements',
            'Practical confidence using modern digital tools safely',
            'Clear career development and performance appraisal evidence'
          ],
          riskReductionOutcomes: (curr.riskReductionOutcomes && curr.riskReductionOutcomes.length > 0) ? curr.riskReductionOutcomes : [
            'Mitigation of data privacy and POPIA compliance violations',
            'Prevention of unverified automated output errors',
            'Standardized incident reporting and supervisor escalation protocols'
          ],
          diagnosticQuestions: curr.diagnosticQuestions.length > 0 ? curr.diagnosticQuestions : [
            {
              id: 'diag-1',
              category: 'Problem awareness',
              question: 'How often does your department encounter procedural bottlenecks or unverified drafts in daily workflows?'
            },
            {
              id: 'diag-2',
              category: 'Ethics & compliance',
              question: 'What protocols does your team currently follow to ensure POPIA compliance when processing client records?'
            },
            {
              id: 'diag-3',
              category: 'AI / digital readiness',
              question: 'Which digital or AI assistance tools are currently utilized by staff, and what quality controls are enforced?'
            }
          ]
        }
      };
    });

    setSkippedNotice(true);
    setTimeout(() => setSkippedNotice(false), 3500);
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

  return (
    <div id="section-03-structure-container" className="space-y-6 max-w-6xl font-sora">
      {/* Slide Header */}
      <SlideHeader
        sectionNumber="03"
        title="Course Architecture & Learning Structure"
        subtitle="Establish the pedagogical foundation, scope, duration, diagnostic questions, and learning journey."
        slideNumber="07"
        totalSlides="39"
        badgeText={`${course.modules.length} Modules Planned`}
      />

      {/* Skip Unknown Information Banner (Requirement 4 & Requirement 2 UI simplification) */}
      <div className="p-4 bg-white border border-[#45CC42] rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-[#45CC42]">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#45CC42]/15 text-[#052B66] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-[#45CC42]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#052B66]">
              Don't know all the technical instructional design details?
            </h4>
            <p className="text-[11.5px] text-slate-500 leading-snug">
              You can skip fields you aren't sure about. The AI generation engine will formulate optimal pedagogical parameters, diagnostic questions, and Bloom's taxonomies automatically.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSkipUnknownCourseDetails}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Skip Unknown Fields (AI Will Formulate)</span>
          </button>
        </div>
      </div>

      {skippedNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-[#45CC42] text-[#052B66] text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-[#45CC42] stroke-[3]" />
          <span>All unknown course architecture details have been formulated with eStudy instructional design standards!</span>
        </div>
      )}

      {/* View Mode & Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {!simpleClientView ? (
            <>
              <button
                onClick={() => setActiveSlideTab('meta')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSlideTab === 'meta'
                    ? 'bg-[#052B66] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#45CC42]" />
                <span>1. Metadata & Roles</span>
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
                <span>2. Purpose & Value</span>
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
                <span>3. Benefits & Outcomes</span>
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
                <span>4. Diagnostics ({s.diagnosticQuestions.length})</span>
              </button>
            </>
          ) : (
            <span className="text-xs font-bold text-[#052B66] bg-[#45CC42]/20 px-3 py-1.5 rounded-lg border border-[#45CC42]/40">
              Clean Client View (Essential Fields Only)
            </span>
          )}
        </div>

        {/* View Toggle */}
        <button
          type="button"
          onClick={() => setSimpleClientView(!simpleClientView)}
          className="text-xs font-semibold text-slate-600 hover:text-[#052B66] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer shrink-0"
        >
          <Sliders className="w-3.5 h-3.5 text-[#45CC42]" />
          <span>{simpleClientView ? 'Switch to Full Detailed View' : 'Simple / Calm View'}</span>
        </button>
      </div>

      {/* Simple Client View (Reduces overstimulation) */}
      {simpleClientView ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs border-l-4 border-l-[#45CC42]">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-[#052B66]">
              Core Course Information
            </h3>
            <p className="text-xs text-slate-500">
              Just enter what you know. Advanced Bloom's taxonomy verbs and NQF alignment are handled automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <EditorialField
              label="[COURSE TITLE]"
              value={s.title}
              onChange={val => handleStructureChange('title', val)}
              placeholder="e.g. Responsible AI for Workplace Leaders"
              required
            />

            <EditorialField
              label="[TARGET ROLES / AUDIENCE]"
              value={s.targetRoles}
              onChange={val => handleStructureChange('targetRoles', val)}
              placeholder="e.g. Operations Specialists, Team Leads, Consultants"
              required
            />

            <EditorialField
              label="[INDUSTRY / DOMAIN]"
              value={s.industryDomain}
              onChange={val => handleStructureChange('industryDomain', val)}
              placeholder="e.g. Financial Services, Manufacturing, Healthcare"
            />

            <EditorialField
              label="[ESTIMATED DURATION]"
              value={s.estimatedDuration}
              onChange={val => handleStructureChange('estimatedDuration', val)}
              placeholder="e.g. 16 Hours / 2 CPD Credits"
              required
            />
          </div>

          <EditorialField
            label="[COURSE PURPOSE STATEMENT]"
            value={s.purposeStatement}
            onChange={val => handleStructureChange('purposeStatement', val)}
            placeholder="What should learners achieve upon completing this course?"
            helperText="The high-level objective. You can leave this to the AI by clicking Skip."
            multiline
            rows={3}
          />
        </div>
      ) : (
        /* Detailed Tabs View */
        <>
          {activeSlideTab === 'meta' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  SLIDE 07 · SPECIFICATIONS
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
                  placeholder="e.g. 16 hours / 2 CPD credits"
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

                <EditorialField
                  label="[SETA / NQF ALIGNMENT]"
                  value={s.setaNqfLevel}
                  onChange={val => handleStructureChange('setaNqfLevel', val)}
                  placeholder="e.g. Aligned with NQF Level 5"
                />

                <EditorialField
                  label="[TARGET ROLES]"
                  value={s.targetRoles}
                  onChange={val => handleStructureChange('targetRoles', val)}
                  placeholder="e.g. Operations Specialists, Analysts, Team Leads"
                />

                <EditorialField
                  label="[DELIVERY LANGUAGES]"
                  value={s.deliveryLanguages}
                  onChange={val => handleStructureChange('deliveryLanguages', val)}
                  placeholder="e.g. English (Plain Business Language)"
                />
              </div>
            </div>
          )}

          {activeSlideTab === 'purpose' && (
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
                  placeholder="e.g. Direct integration with routine document drafting, data verification, and cross-functional reporting."
                  multiline
                  rows={3}
                />
              </div>

              <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    SLIDE 08 · OUTCOMES
                  </span>
                  <h3 className="text-sm font-bold text-[#052B66]">
                    Performance Improvement & Tech Scope
                  </h3>
                </div>

                <EditorialField
                  label="[PERFORMANCE IMPROVEMENT OUTCOME]"
                  value={s.performanceImprovement}
                  onChange={val => handleStructureChange('performanceImprovement', val)}
                  placeholder="e.g. Elimination of hallucination risk in shared outputs and 40% reduction in document drafting turnaround."
                  multiline
                  rows={3}
                />

                <EditorialField
                  label="[SCOPE & BOUNDARIES]"
                  value={s.scopeSummary}
                  onChange={val => handleStructureChange('scopeSummary', val)}
                  placeholder="e.g. Covers text generative tools, web-based summarizers, and enterprise chat systems. Excludes programming code authoring."
                  multiline
                  rows={3}
                />
              </div>
            </div>
          )}

          {activeSlideTab === 'benefits' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs border-l-4 border-l-[#45CC42]">
                <h3 className="text-xs font-bold text-[#052B66] uppercase tracking-wider">
                  Organisational Benefits
                </h3>
                <p className="text-[11px] text-slate-500">
                  Value returned to the enterprise upon course completion.
                </p>
                <div className="space-y-2">
                  {s.organisationalBenefits.map((b, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-700 flex items-start gap-2">
                      <span className="text-[#45CC42] font-bold">✓</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs border-l-4 border-l-[#45CC42]">
                <h3 className="text-xs font-bold text-[#052B66] uppercase tracking-wider">
                  Employee Benefits
                </h3>
                <p className="text-[11px] text-slate-500">
                  Personal and professional gains for the participating learner.
                </p>
                <div className="space-y-2">
                  {s.employeeBenefits.map((b, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-700 flex items-start gap-2">
                      <span className="text-[#45CC42] font-bold">✓</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs border-l-4 border-l-[#45CC42]">
                <h3 className="text-xs font-bold text-[#052B66] uppercase tracking-wider">
                  Risk Reduction Outcomes
                </h3>
                <p className="text-[11px] text-slate-500">
                  Compliance and operational hazards neutralized by this training.
                </p>
                <div className="space-y-2">
                  {(s.riskReductionOutcomes || []).map((b, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-700 flex items-start gap-2">
                      <span className="text-[#45CC42] font-bold">✓</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSlideTab === 'journey' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  SLIDE 10 · DIAGNOSTICS & JOURNEY
                </span>
                <h3 className="text-sm font-bold text-[#052B66]">
                  Pre-Assessment Diagnostic Questions ({s.diagnosticQuestions.length})
                </h3>
              </div>

              <div className="space-y-3">
                {s.diagnosticQuestions.map((q, idx) => (
                  <div key={q.id || idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded">
                        {q.category}
                      </span>
                      <p className="text-xs font-semibold text-slate-800 mt-1.5">
                        {q.question}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-[#45CC42] bg-[#45CC42]/10 px-2 py-0.5 rounded">
                      Ready
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
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
          className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Curriculum Modules →</span>
        </button>
      </div>

      <SlideFooter currentSlide="07" totalSlides="39" />
    </div>
  );
};
