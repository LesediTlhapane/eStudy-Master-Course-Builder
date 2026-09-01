import React, { useState } from 'react';
import { Course, ResearchSource, SourceType, SourceStatus } from '../types';
import { Plus, Trash2, Edit3, ArrowRight, ArrowLeft, BookOpen, Scale, FileText, CheckCircle2, ChevronRight, Shield, LayoutGrid, Users } from 'lucide-react';
import { SlideHeader } from './SlideHeader';
import { SlideFooter } from './SlideFooter';
import { FrameworkCallout } from './FrameworkCallout';
import { EditorialField } from './EditorialField';

interface Section02SourcesProps {
  course: Course;
  onUpdate: (updater: (prev: Course) => Course) => void;
  onContinue: () => void;
  onBack: () => void;
}

const SOURCE_TYPES: SourceType[] = [
  'Regulatory framework',
  'Ethics framework',
  'Internal policy',
  'Industry standard',
  'Academic research',
  'Technology documentation',
  'Case study',
  'Benchmarking source'
];

const SOURCE_STATUSES: SourceStatus[] = ['Required', 'Verified', 'Review', 'Not started'];

export const Section02Sources: React.FC<Section02SourcesProps> = ({
  course,
  onUpdate,
  onContinue,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'sources'>('profile');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showBenchmarkingModal, setShowBenchmarkingModal] = useState(false);

  // Form states for adding/editing a source
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<SourceType>('Regulatory framework');
  const [formRef, setFormRef] = useState('');
  const [formRelevance, setFormRelevance] = useState('');
  const [formStatus, setFormStatus] = useState<SourceStatus>('Required');

  const research = course.research;
  const sources = research.sources;
  const structure = course.structure;

  const handleOpenAdd = () => {
    setEditingSourceId(null);
    setFormName('');
    setFormType('Regulatory framework');
    setFormRef('');
    setFormRelevance('');
    setFormStatus('Required');
    setShowAddModal(true);
  };

  const handleOpenEdit = (src: ResearchSource) => {
    setEditingSourceId(src.id);
    setFormName(src.name);
    setFormType(src.type);
    setFormRef(src.reference);
    setFormRelevance(src.relevance);
    setFormStatus(src.status);
    setShowAddModal(true);
  };

  const handleSaveSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingSourceId) {
      onUpdate(prev => ({
        ...prev,
        research: {
          ...prev.research,
          sources: prev.research.sources.map(s =>
            s.id === editingSourceId
              ? {
                  ...s,
                  name: formName.trim(),
                  type: formType,
                  reference: formRef.trim(),
                  relevance: formRelevance.trim(),
                  status: formStatus
                }
              : s
          )
        }
      }));
    } else {
      const newSource: ResearchSource = {
        id: `src-${Date.now()}`,
        name: formName.trim(),
        type: formType,
        reference: formRef.trim(),
        relevance: formRelevance.trim(),
        status: formStatus
      };
      onUpdate(prev => ({
        ...prev,
        research: {
          ...prev.research,
          sources: [...prev.research.sources, newSource]
        }
      }));
    }

    setShowAddModal(false);
  };

  const handleDeleteSource = (id: string) => {
    onUpdate(prev => ({
      ...prev,
      research: {
        ...prev.research,
        sources: prev.research.sources.filter(s => s.id !== id)
      }
    }));
  };

  const handleStructureUpdate = (field: keyof typeof structure, value: any) => {
    onUpdate(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        [field]: value
      }
    }));
  };

  const getStatusBadge = (status: SourceStatus) => {
    switch (status) {
      case 'Required':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            Required
          </span>
        );
      case 'Verified':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#45CC42]/20 text-[#052B66] border border-[#45CC42]/40">
            Verified ✓
          </span>
        );
      case 'Review':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            Needs Review
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Pending
          </span>
        );
    }
  };

  const [newEvidenceRule, setNewEvidenceRule] = useState('');

  const handleAddEvidenceRule = () => {
    if (!newEvidenceRule.trim()) return;
    onUpdate(prev => ({
      ...prev,
      research: {
        ...prev.research,
        evidenceStandards: [...prev.research.evidenceStandards, newEvidenceRule.trim()]
      }
    }));
    setNewEvidenceRule('');
  };

  const handleDeleteEvidenceRule = (index: number) => {
    onUpdate(prev => ({
      ...prev,
      research: {
        ...prev.research,
        evidenceStandards: prev.research.evidenceStandards.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div id="section-02-sources-container" className="space-y-6 max-w-6xl">
      {/* PowerPoint Slide 5 & 6 Header */}
      <SlideHeader
        sectionNumber="02"
        title="Course Foundations, Learner Profile & Sources"
        subtitle="Specify learner profile, prerequisites and establish authoritative evidence and regulatory references."
        slideNumber="05"
        totalSlides="39"
        badgeText={`${sources.length} Sources Linked`}
      />

      {/* Framework Requirement Callout */}
      <FrameworkCallout
        title="Framework Requirement"
        requirement="Minimum of 3 credible, traceable sources. All AI and regulatory references must cite specific applicable statutes (e.g. POPIA, FAIS, SAQA, etc.)."
        variant="requirement"
      />

      {/* Slide Navigation Tabs (Slide 5: Learner Profile vs Slide 6: Sources Register) */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Slide 05: Learner Profile & Environment</span>
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sources'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Slide 06: Sources & References Register ({sources.length})</span>
          </button>
        </div>

        {activeTab === 'sources' && (
          <button
            id="section-02-add-source-btn"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#45CC42] hover:bg-[#3ec23b] text-[#052B66] shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Add Reference</span>
          </button>
        )}
      </div>

      {activeTab === 'profile' ? (
        /* Slide 5: Course Foundations & Learner Profile */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Target Audience & Baseline */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  SLIDE 05 · AUDIENCE CONTEXT
                </span>
                <h3 className="text-sm font-bold text-[#052B66]">
                  Target Learner Cohort & Baseline
                </h3>
              </div>

              <EditorialField
                label="[LEARNER PROFILE]"
                value={structure.targetRoles}
                onChange={val => handleStructureUpdate('targetRoles', val)}
                placeholder="e.g. Operational analysts, client support consultants, departmental administrative leads"
                helperText="Detailed description of the learner cohort who will engage with this course."
                multiline
                rows={3}
                required
              />

              <EditorialField
                label="[CURRENT CAPABILITY / ENTRY LEVEL]"
                value={structure.experienceLevel}
                onChange={val => handleStructureUpdate('experienceLevel', val)}
                placeholder="e.g. 1-3 years operational experience; intermediate computer literacy; basic familiarity with internal systems."
                helperText="Baseline skills and digital proficiency of learners before entering the course."
                multiline
                rows={3}
              />

              <EditorialField
                label="[PREREQUISITES & ENTRY ASSUMPTIONS]"
                value={structure.scopeSummary}
                onChange={val => handleStructureUpdate('scopeSummary', val)}
                placeholder="e.g. Familiarity with standard workplace productivity software and basic enterprise email protocols."
                helperText="Mandatory prior knowledge, certifications, or internal onboarding required."
                multiline
                rows={2}
              />
            </div>

            {/* Right Column: Work Environment & Accessibility */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    SLIDE 05 · OPERATIONAL ENVIRONMENT
                  </span>
                  <h3 className="text-sm font-bold text-[#052B66]">
                    Work Environment & Accessibility
                  </h3>
                </div>

                <EditorialField
                  label="[WORK ENVIRONMENT & TOOLING]"
                  value={structure.workplaceRelevance}
                  onChange={val => handleStructureUpdate('workplaceRelevance', val)}
                  placeholder="e.g. Dual-screen desktop setup, web-based internal CRM, cloud office suite, and enterprise chat tools."
                  helperText="The physical or digital setting where learners perform their daily workplace tasks."
                  multiline
                  rows={3}
                />

                <EditorialField
                  label="[ACCESSIBILITY & LEARNING NEEDS]"
                  value={structure.deliveryLanguages}
                  onChange={val => handleStructureUpdate('deliveryLanguages', val)}
                  placeholder="e.g. English primary with plain language glossary; multi-device mobile LMS compatibility; WCAG 2.1 AA screen reader support."
                  helperText="Language accessibility, Plain English writing standard, and assistive technology accommodations."
                  multiline
                  rows={3}
                />
              </div>

              {/* Research Framework Anchor Card */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#052B66] block">
                  STATUTORY & JURISDICTIONAL ANCHOR
                </span>
                <EditorialField
                  label="[REGULATORY / STATUTORY FRAMEWORK]"
                  value={research.regulatoryFramework}
                  onChange={val =>
                    onUpdate(prev => ({
                      ...prev,
                      research: { ...prev.research, regulatoryFramework: val }
                    }))
                  }
                  placeholder="e.g. Protection of Personal Information Act (POPIA), FAIS Act, SAQA NQF Guidelines"
                  helperText="Primary South African statutory governance applicable to this course."
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Slide 6: Sources & References Register */
        <div className="space-y-6">
          {sources.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-[#052B66] mx-auto flex items-center justify-center">
                <BookOpen className="w-7 h-7 stroke-[1.75]" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="text-sm font-bold text-slate-800">
                  No Reference Sources Added Yet
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The Universal Master Prompt Framework requires a minimum of 3 credible, traceable sources (regulations, internal policies, or industry benchmarks).
                </p>
              </div>
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Reference Source</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sources.map(src => (
                <div
                  key={src.id}
                  id={`source-card-${src.id}`}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-[#052B66]/40 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#052B66] bg-slate-100 px-2 py-0.5 rounded">
                        {src.type}
                      </span>
                      {getStatusBadge(src.status)}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#052B66] transition-colors leading-snug">
                      {src.name}
                    </h4>

                    {src.reference && (
                      <p className="text-[11px] font-mono text-slate-500 truncate">
                        Ref: {src.reference}
                      </p>
                    )}

                    {src.relevance && (
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {src.relevance}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(src)}
                      className="p-1.5 text-slate-400 hover:text-[#052B66] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Source"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSource(src.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Source"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Evidence Standards & Benchmarking Drawers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <button
              id="open-evidence-standards-btn"
              onClick={() => setShowEvidenceModal(true)}
              className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#45CC42] hover:shadow-xs transition-all text-left flex items-center justify-between group cursor-pointer border-l-4 border-l-[#45CC42]"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#052B66] uppercase tracking-wider">
                  [EVIDENCE STANDARDS & VERIFICATION]
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {research.evidenceStandards.length} evidence standard{research.evidenceStandards.length !== 1 ? 's' : ''} configured
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#45CC42] transition-colors" />
            </button>

            <button
              id="open-benchmarking-btn"
              onClick={() => setShowBenchmarkingModal(true)}
              className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#45CC42] hover:shadow-xs transition-all text-left flex items-center justify-between group cursor-pointer border-l-4 border-l-[#45CC42]"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#052B66] uppercase tracking-wider">
                  [BENCHMARKING & EXEMPLAR COURSE]
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {research.benchmarkCourseRef || 'AI in Financial Literacy standard linked'}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#45CC42] transition-colors" />
            </button>
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
          <span>← Back to Context</span>
        </button>

        <button
          id="section-02-continue-btn"
          onClick={onContinue}
          className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Learning Outcomes →</span>
        </button>
      </div>

      {/* Slide Footer */}
      <SlideFooter currentSlide="05" totalSlides="39" />

      {/* Add / Edit Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-sm font-extrabold text-[#052B66] uppercase tracking-wide">
              {editingSourceId ? 'Edit Reference Source' : 'Add Credible Reference Source'}
            </h3>

            <form onSubmit={handleSaveSource} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Source Title / Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Protection of Personal Information Act (POPIA), Act No. 4 of 2013"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:border-[#052B66] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Source Category
                  </label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as SourceType)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    {SOURCE_TYPES.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Verification Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as SourceStatus)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    {SOURCE_STATUSES.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Formal Reference / Section / URI
                </label>
                <input
                  type="text"
                  placeholder="e.g. Section 11 & 14 (Processing of Personal Information)"
                  value={formRef}
                  onChange={e => setFormRef(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#052B66] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Relevance to Learning Outcomes
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain how this source guides instructional content, compliance limits or workplace decision points."
                  value={formRelevance}
                  onChange={e => setFormRelevance(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#052B66] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] cursor-pointer"
                >
                  {editingSourceId ? 'Update Reference' : 'Add Reference'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evidence Modal */}
      {showEvidenceModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-sm font-bold text-[#052B66] uppercase tracking-wide">
              Evidence Standards & Verification Rules
            </h3>
            <p className="text-xs text-slate-500">
              Add explicit criteria for how facts, citations, and AI output claims must be validated.
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {research.evidenceStandards.map((std, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-200"
                >
                  <span className="text-slate-700">{std}</span>
                  <button
                    onClick={() => handleDeleteEvidenceRule(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newEvidenceRule}
                onChange={e => setNewEvidenceRule(e.target.value)}
                placeholder="e.g. Every AI scenario must cite a specific statutory clause."
                className="flex-1 text-xs p-2.5 rounded-lg border border-slate-300"
              />
              <button
                type="button"
                onClick={handleAddEvidenceRule}
                className="px-4 py-2.5 bg-[#45CC42] text-[#052B66] font-bold rounded-lg text-xs hover:bg-[#3ec23b] cursor-pointer"
              >
                Add Rule
              </button>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowEvidenceModal(false)}
                className="px-4 py-2 bg-[#052B66] text-white rounded-lg text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Benchmarking Modal */}
      {showBenchmarkingModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-sm font-bold text-[#052B66] uppercase tracking-wide">
              Exemplar & Benchmarking Notes
            </h3>
            <p className="text-xs text-slate-500">
              Ground your course against known high-quality benchmarks.
            </p>

            <EditorialField
              label="[BENCHMARK COURSE REFERENCE]"
              value={research.benchmarkCourseRef || 'Use of Artificial Intelligence in Financial Literacy (eStudy Master Benchmark)'}
              onChange={val =>
                onUpdate(prev => ({
                  ...prev,
                  research: { ...prev.research, benchmarkCourseRef: val }
                }))
              }
              placeholder="e.g. eStudy AI in Financial Literacy Master v9.0"
            />

            <EditorialField
              label="[BENCHMARKING NOTES & PEDAGOGICAL ALIGNMENT]"
              value={research.benchmarkingNotes}
              onChange={val =>
                onUpdate(prev => ({
                  ...prev,
                  research: { ...prev.research, benchmarkingNotes: val }
                }))
              }
              placeholder="Notes on scenario depth, Bloom's outcome levels, and formative assessment rigor."
              multiline
              rows={3}
            />

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowBenchmarkingModal(false)}
                className="px-4 py-2 bg-[#052B66] text-white rounded-lg text-xs font-bold"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
