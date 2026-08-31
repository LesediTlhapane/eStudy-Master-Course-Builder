import React, { useState } from 'react';
import { Course, ResearchSource, SourceType, SourceStatus } from '../types';
import { Plus, Trash2, Edit3, ArrowRight, ArrowLeft, BookOpen, Scale, FileText, CheckCircle2, ChevronRight, Shield } from 'lucide-react';

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
      // Edit existing
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
      // Add new
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

  const getStatusBadge = (status: SourceStatus) => {
    switch (status) {
      case 'Required':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Required
          </span>
        );
      case 'Verified':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#45CC42]/15 text-[#052B66] border border-[#45CC42]/30">
            Verified
          </span>
        );
      case 'Review':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Review
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Not started
          </span>
        );
    }
  };

  return (
    <div id="section-02-sources-container" className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-mono text-[#052B66]">02</span>
            <h2 className="text-2xl font-extrabold text-[#052B66] tracking-tight">
              Sources & Research
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Add the evidence, regulations and references that will ground the course.
          </p>
        </div>

        <button
          id="section-02-add-source-btn"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add Source</span>
        </button>
      </div>

      {/* Sources Card List */}
      <div className="space-y-4">
        {sources.map(src => (
          <div
            key={src.id}
            id={`source-card-${src.id}`}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-[#052B66]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#052B66] transition-colors">
                  {src.name}
                </h3>
                {getStatusBadge(src.status)}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                <span className="text-[#052B66] font-semibold">{src.type}</span>
                <span>•</span>
                <span className="text-slate-600">{src.reference}</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                {src.relevance}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                onClick={() => handleOpenEdit(src)}
                className="p-2 text-slate-400 hover:text-[#052B66] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                title="Edit Source"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteSource(src.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                title="Delete Source"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Research Requirements Drawer Triggers */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Research requirements
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Evidence Standards */}
          <button
            id="open-evidence-standards-btn"
            onClick={() => setShowEvidenceModal(true)}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#45CC42] hover:shadow-xs transition-all text-left flex items-center justify-between group cursor-pointer border-l-4 border-l-[#45CC42]"
          >
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#052B66]">
                Evidence standards
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {research.evidenceStandards.length} rule{research.evidenceStandards.length !== 1 ? 's' : ''} added
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#45CC42] transition-colors" />
          </button>

          {/* Benchmarking Requirements */}
          <button
            id="open-benchmarking-btn"
            onClick={() => setShowBenchmarkingModal(true)}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#45CC42] hover:shadow-xs transition-all text-left flex items-center justify-between group cursor-pointer border-l-4 border-l-[#45CC42]"
          >
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#052B66]">
                Benchmarking requirements
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                1 benchmark reference linked
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#45CC42] transition-colors" />
          </button>
        </div>
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
            id="section-02-continue-btn"
            onClick={onContinue}
            className="px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Continue →</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-[#052B66]">
              {editingSourceId ? 'Edit Research Source' : 'Add Research Source'}
            </h3>

            <form onSubmit={handleSaveSource} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Source Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Protection of Personal Information Act (POPIA)"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#052B66] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Source Type
                  </label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as SourceType)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#052B66] outline-none bg-white"
                  >
                    {SOURCE_TYPES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as SourceStatus)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#052B66] outline-none bg-white"
                  >
                    {SOURCE_STATUSES.map(ss => (
                      <option key={ss} value={ss}>{ss}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL / Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Act 4 of 2013, Information Regulator South Africa"
                  value={formRef}
                  onChange={e => setFormRef(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#052B66] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Why is this source relevant? *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain how this regulation or evidence standard informs the course modules and scenarios."
                  value={formRelevance}
                  onChange={e => setFormRelevance(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#052B66] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] cursor-pointer"
                >
                  Save Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evidence Standards Modal */}
      {showEvidenceModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#45CC42]" />
              <h3 className="text-base font-bold text-[#052B66]">
                Evidence Standards (Research Layer)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Rules defined to ensure all AI tools and instructional claims are backed by verifiable sources.
            </p>

            <div className="space-y-2">
              {research.evidenceStandards.map((rule, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-start gap-2">
                  <span className="font-bold text-[#052B66]">{idx + 1}.</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowEvidenceModal(false)}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Benchmarking Requirements Modal */}
      {showBenchmarkingModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#45CC42]" />
              <h3 className="text-base font-bold text-[#052B66]">
                Benchmarking Reference Standard
              </h3>
            </div>
            <div className="p-4 bg-[#052B66]/5 border border-[#052B66]/15 rounded-lg space-y-1.5">
              <span className="text-[11px] font-bold text-[#052B66] uppercase">
                Reference Benchmark Course:
              </span>
              <p className="text-xs font-bold text-slate-900">
                Use of Artificial Intelligence in Financial Literacy (v1.0)
              </p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Use this course as a benchmark for tone, instructional depth, scenario branching, and assessment structure when compiling your course.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowBenchmarkingModal(false)}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
