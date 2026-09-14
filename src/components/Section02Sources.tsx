import React, { useState, useRef } from 'react';
import { Course, ResearchSource, SourceType, SourceStatus, SourceMedium } from '../types';
import {
  Plus,
  Trash2,
  Edit3,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  FileText,
  Globe,
  Link,
  Upload,
  CheckCircle2,
  Check,
  Search,
  Scale,
  Sparkles,
  ExternalLink,
  X,
  FileCode,
  Users,
  ShieldAlert,
  Info
} from 'lucide-react';
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

const PRESET_FRAMEWORKS = [
  {
    name: 'Protection of Personal Information Act (POPIA Act No. 4 of 2013)',
    type: 'Regulatory framework' as SourceType,
    reference: 'Republic of South Africa Government Gazette No. 37067, Section 19 & 71',
    relevance: 'Condition 7 security safeguards for personal information and automated decision-making controls.',
    medium: 'framework' as SourceMedium
  },
  {
    name: 'Financial Sector Conduct Authority (FSCA) Fintech & AI Circular',
    type: 'Regulatory framework' as SourceType,
    reference: 'FSCA Regulatory Strategy & Fintech Governance Framework',
    relevance: 'Market conduct, algorithmic fairness, and consumer protection in automated financial workflows.',
    medium: 'framework' as SourceMedium
  },
  {
    name: 'King IV Report on Corporate Governance for South Africa',
    type: 'Ethics framework' as SourceType,
    reference: 'Principle 12: Technology and Information Governance',
    relevance: 'Board and operational oversight of digital systems, data integrity, and ethical risk management.',
    medium: 'framework' as SourceMedium
  },
  {
    name: 'South African Qualifications Authority (SAQA) NQF Guidelines',
    type: 'Industry standard' as SourceType,
    reference: 'National Qualifications Framework Act 67 of 2008',
    relevance: 'Competency standardisation, unit standard alignment, and accredited vocational outcomes.',
    medium: 'framework' as SourceMedium
  }
];

export const Section02Sources: React.FC<Section02SourcesProps> = ({
  course,
  onUpdate,
  onContinue,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'sources' | 'profile'>('sources');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTab, setModalTab] = useState<'upload' | 'url' | 'text' | 'framework'>('upload');

  // Form states for Add / Edit
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<SourceType>('Regulatory framework');
  const [formUrl, setFormUrl] = useState('');
  const [formReference, setFormReference] = useState('');
  const [formRelevance, setFormRelevance] = useState('');
  const [formStatus, setFormStatus] = useState<SourceStatus>('Verified');
  const [formSnippet, setFormSnippet] = useState('');
  const [formFileName, setFormFileName] = useState('');
  const [formFileSize, setFormFileSize] = useState('');
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const research = course.research;
  const sources = research.sources || [];
  const structure = course.structure;

  // Filter sources
  const filteredSources = sources.filter(s => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(query) ||
      (s.reference && s.reference.toLowerCase().includes(query)) ||
      (s.relevance && s.relevance.toLowerCase().includes(query)) ||
      s.type.toLowerCase().includes(query)
    );
  });

  const handleOpenAdd = (defaultTab: 'upload' | 'url' | 'text' | 'framework' = 'upload') => {
    setEditingSourceId(null);
    setFormName('');
    setFormType('Regulatory framework');
    setFormUrl('');
    setFormReference('');
    setFormRelevance('');
    setFormStatus('Verified');
    setFormSnippet('');
    setFormFileName('');
    setFormFileSize('');
    setModalTab(defaultTab);
    setShowAddModal(true);
  };

  const handleOpenEdit = (src: ResearchSource) => {
    setEditingSourceId(src.id);
    setFormName(src.name);
    setFormType(src.type);
    setFormUrl(src.url || '');
    setFormReference(src.reference || '');
    setFormRelevance(src.relevance || '');
    setFormStatus(src.status);
    setFormSnippet(src.contentSnippet || '');
    setFormFileName(src.fileName || '');
    setFormFileSize(src.fileSize || '');
    setModalTab(src.medium || 'upload');
    setShowAddModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormFileName(file.name);
    const sizeKb = Math.round(file.size / 1024);
    setFormFileSize(sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`);
    if (!formName.trim()) {
      setFormName(file.name.replace(/\.[^/.]+$/, ''));
    }

    // Attempt to read text content snippet for txt / markdown files
    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = evt => {
        const text = evt.target?.result as string;
        if (text) {
          setFormSnippet(text.slice(0, 1000));
        }
      };
      reader.readAsText(file);
    } else {
      setFormSnippet(`Uploaded file: ${file.name} (${file.type || 'Document'})`);
    }
  };

  const handleSaveSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const sourceData: ResearchSource = {
      id: editingSourceId || `src-${Date.now()}`,
      name: formName.trim(),
      type: formType,
      reference: formReference.trim() || formUrl.trim() || formFileName || 'Internal Reference Document',
      relevance: formRelevance.trim() || 'Authoritative evidence referenced during instructional course synthesis.',
      status: formStatus,
      medium: modalTab,
      url: formUrl.trim() || undefined,
      fileName: formFileName.trim() || undefined,
      fileSize: formFileSize.trim() || undefined,
      contentSnippet: formSnippet.trim() || undefined,
      dateAdded: new Date().toLocaleDateString('en-ZA')
    };

    if (editingSourceId) {
      onUpdate(prev => ({
        ...prev,
        research: {
          ...prev.research,
          sources: prev.research.sources.map(s => (s.id === editingSourceId ? sourceData : s))
        }
      }));
    } else {
      onUpdate(prev => ({
        ...prev,
        research: {
          ...prev.research,
          sources: [sourceData, ...prev.research.sources]
        }
      }));
    }

    setShowAddModal(false);
  };

  const handleAddPreset = (preset: typeof PRESET_FRAMEWORKS[0]) => {
    const exists = sources.some(s => s.name.toLowerCase() === preset.name.toLowerCase());
    if (exists) {
      alert('This framework reference is already included in your sources.');
      return;
    }

    const newSource: ResearchSource = {
      id: `src-${Date.now()}`,
      name: preset.name,
      type: preset.type,
      reference: preset.reference,
      relevance: preset.relevance,
      status: 'Verified',
      medium: 'framework',
      dateAdded: new Date().toLocaleDateString('en-ZA')
    };

    onUpdate(prev => ({
      ...prev,
      research: {
        ...prev.research,
        sources: [...prev.research.sources, newSource]
      }
    }));
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

  const getSourceIcon = (src: ResearchSource) => {
    if (src.medium === 'url' || src.url) {
      return <Globe className="w-5 h-5 text-blue-600" />;
    }
    if (src.medium === 'framework' || src.type.includes('framework')) {
      return <Scale className="w-5 h-5 text-[#052B66]" />;
    }
    if (src.medium === 'text') {
      return <FileText className="w-5 h-5 text-purple-600" />;
    }
    return <FileCode className="w-5 h-5 text-[#45CC42]" />;
  };

  return (
    <div id="section-02-sources-container" className="space-y-6 max-w-6xl font-sora">
      {/* Slide Header */}
      <SlideHeader
        sectionNumber="02"
        title="Sources & Knowledge Grounding"
        subtitle="Manage uploaded documents, legislation, external URLs, and authoritative evidence (Google NotebookLM style)."
        slideNumber="06"
        totalSlides="39"
        badgeText={`${sources.length} Sources Linked`}
      />

      {/* Framework Requirement Callout */}
      <FrameworkCallout
        title="Authoritative Grounding Requirement"
        requirement="Minimum of 3 credible, traceable sources. All AI and regulatory references must cite specific applicable statutes (e.g. POPIA, FAIS, SAQA)."
        variant="requirement"
      />

      {/* Section View Tabs */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'sources'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#45CC42]" />
            <span>Sources ({sources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Learner Profile & Environment</span>
          </button>
        </div>

        {activeTab === 'sources' && (
          <button
            id="notebooklm-add-source-btn"
            onClick={() => handleOpenAdd('upload')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#45CC42] hover:bg-[#3ec23b] text-[#052B66] shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Sources</span>
          </button>
        )}
      </div>

      {activeTab === 'sources' ? (
        /* Google NotebookLM Style Sources View */
        <div className="space-y-6">
          {/* Top Quick-Add Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => handleOpenAdd('upload')}
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#45CC42] hover:shadow-xs transition-all flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-[#45CC42]/15 text-[#052B66] flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-[#052B66]" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-800 group-hover:text-[#052B66]">
                  Upload Documents
                </div>
                <div className="text-[10.5px] text-slate-400 truncate">PDF, DOCX, TXT</div>
              </div>
            </button>

            <button
              onClick={() => handleOpenAdd('url')}
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#45CC42] hover:shadow-xs transition-all flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-800 group-hover:text-[#052B66]">
                  Source URL / Web
                </div>
                <div className="text-[10.5px] text-slate-400 truncate">Website or portal</div>
              </div>
            </button>

            <button
              onClick={() => handleOpenAdd('text')}
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#45CC42] hover:shadow-xs transition-all flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-800 group-hover:text-[#052B66]">
                  Paste Text / Notes
                </div>
                <div className="text-[10.5px] text-slate-400 truncate">Policy excerpts, SOPs</div>
              </div>
            </button>

            <button
              onClick={() => handleOpenAdd('framework')}
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#45CC42] hover:shadow-xs transition-all flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#052B66] flex items-center justify-center shrink-0">
                <Scale className="w-4 h-4 text-[#45CC42]" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-800 group-hover:text-[#052B66]">
                  SA Regulations
                </div>
                <div className="text-[10.5px] text-slate-400 truncate">POPIA, FSCA, King IV</div>
              </div>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-[#45CC42]" />
              <span>{sources.length} Total Sources Grounding Course Synthesis</span>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search sources..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#052B66] outline-none"
              />
            </div>
          </div>

          {/* Source Cards List (NotebookLM Style) */}
          {filteredSources.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-[#052B66] mx-auto flex items-center justify-center">
                <BookOpen className="w-7 h-7 stroke-[1.75]" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-sm font-bold text-slate-800">
                  {searchQuery ? 'No sources match your search' : 'No Sources Added Yet'}
                </h4>
                <p className="text-xs text-slate-500">
                  Add documents, legislation, or web links to provide evidence grounding for AI course synthesis.
                </p>
              </div>
              <button
                onClick={() => handleOpenAdd('upload')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Source</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSources.map(src => (
                <div
                  key={src.id}
                  id={`notebook-source-${src.id}`}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-[#45CC42] transition-all flex flex-col justify-between space-y-3 group border-l-4 border-l-[#45CC42]"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          {getSourceIcon(src)}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {src.type}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold bg-[#45CC42]/20 text-[#052B66] border border-[#45CC42]/40 px-2 py-0.5 rounded-full">
                        {src.status === 'Verified' ? '✓ Verified' : src.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-[#052B66] group-hover:text-blue-900 transition-colors leading-snug">
                        {src.name}
                      </h4>
                      {src.reference && (
                        <p className="text-[11px] text-slate-500 mt-1 font-mono line-clamp-1">
                          Ref: {src.reference}
                        </p>
                      )}
                    </div>

                    {src.relevance && (
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {src.relevance}
                      </p>
                    )}

                    {src.fileName && (
                      <div className="flex items-center gap-2 text-[10.5px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                        <FileCode className="w-3.5 h-3.5 text-[#052B66]" />
                        <span className="truncate">{src.fileName}</span>
                        {src.fileSize && <span className="text-slate-400">({src.fileSize})</span>}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[10px]">
                      {src.dateAdded ? `Added ${src.dateAdded}` : 'Authoritative Grounding'}
                    </span>

                    <div className="flex items-center gap-1">
                      {src.url && (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Open external link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
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
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Slide 5: Learner Profile & Environment */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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
              onChange={val =>
                onUpdate(prev => ({
                  ...prev,
                  structure: { ...prev.structure, targetRoles: val }
                }))
              }
              placeholder="e.g. Operational analysts, client support consultants, departmental administrative leads"
              helperText="Detailed description of the learner cohort who will engage with this course."
              multiline
              rows={3}
              required
            />

            <EditorialField
              label="[CURRENT CAPABILITY / ENTRY LEVEL]"
              value={structure.experienceLevel}
              onChange={val =>
                onUpdate(prev => ({
                  ...prev,
                  structure: { ...prev.structure, experienceLevel: val }
                }))
              }
              placeholder="e.g. 1-3 years operational experience; intermediate computer literacy; basic familiarity with internal systems."
              helperText="Baseline skills and digital proficiency of learners before entering the course."
              multiline
              rows={3}
            />

            <EditorialField
              label="[PREREQUISITES & ENTRY ASSUMPTIONS]"
              value={structure.scopeSummary}
              onChange={val =>
                onUpdate(prev => ({
                  ...prev,
                  structure: { ...prev.structure, scopeSummary: val }
                }))
              }
              placeholder="e.g. Familiarity with standard workplace productivity software and basic enterprise email protocols."
              helperText="Mandatory prior knowledge, certifications, or internal onboarding required."
              multiline
              rows={2}
            />
          </div>

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
                onChange={val =>
                  onUpdate(prev => ({
                    ...prev,
                    structure: { ...prev.structure, workplaceRelevance: val }
                  }))
                }
                placeholder="e.g. Dual-screen desktop setup, web-based internal CRM, cloud office suite, and enterprise chat tools."
                helperText="The physical or digital setting where learners perform their daily workplace tasks."
                multiline
                rows={3}
              />

              <EditorialField
                label="[ACCESSIBILITY & LEARNING NEEDS]"
                value={structure.deliveryLanguages}
                onChange={val =>
                  onUpdate(prev => ({
                    ...prev,
                    structure: { ...prev.structure, deliveryLanguages: val }
                  }))
                }
                placeholder="e.g. English primary with plain language glossary; multi-device mobile LMS compatibility; WCAG 2.1 AA screen reader support."
                helperText="Language accessibility, Plain English writing standard, and assistive technology accommodations."
                multiline
                rows={3}
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={onBack}
          className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Problem Context</span>
        </button>

        <button
          id="section-02-continue-btn"
          onClick={onContinue}
          className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Course Architecture →</span>
        </button>
      </div>

      <SlideFooter currentSlide="06" totalSlides="39" />

      {/* Google NotebookLM Style Add Sources Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sora">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#45CC42]" />
                <h3 className="text-sm font-extrabold text-[#052B66]">
                  {editingSourceId ? 'Edit Source' : 'Add Source to Course Notebook'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Source Type Tabs */}
            <div className="flex gap-2 border-b border-slate-100 pb-2">
              <button
                type="button"
                onClick={() => setModalTab('upload')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  modalTab === 'upload'
                    ? 'bg-[#052B66] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-[#45CC42]" />
                <span>Upload Document</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('url')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  modalTab === 'url'
                    ? 'bg-[#052B66] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>Web URL</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('text')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  modalTab === 'text'
                    ? 'bg-[#052B66] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-purple-500" />
                <span>Paste Text</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('framework')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  modalTab === 'framework'
                    ? 'bg-[#052B66] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-[#45CC42]" />
                <span>SA Standards</span>
              </button>
            </div>

            {/* Modal Body */}
            {modalTab === 'framework' ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Quick-add authoritative South African regulatory frameworks:
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {PRESET_FRAMEWORKS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleAddPreset(preset)}
                      className="p-3 rounded-xl border border-slate-200 hover:border-[#45CC42] hover:bg-[#45CC42]/5 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="space-y-0.5 max-w-[85%]">
                        <div className="text-xs font-bold text-[#052B66] group-hover:text-blue-900">
                          {preset.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {preset.reference}
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-slate-400 group-hover:text-[#45CC42]" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveSource} className="space-y-4">
                {modalTab === 'upload' && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#45CC42] bg-slate-50/70 hover:bg-white text-center cursor-pointer transition-all space-y-2"
                  >
                    <Upload className="w-8 h-8 text-[#052B66] mx-auto" />
                    <div className="text-xs font-bold text-slate-800">
                      {formFileName ? `Selected: ${formFileName} (${formFileSize})` : 'Click to browse or drop document here'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Supported: PDF, DOCX, TXT, CSV, Markdown
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.docx,.txt,.csv,.md"
                    />
                  </div>
                )}

                {modalTab === 'url' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Website URL or Regulatory Link *
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.justice.gov.za/inforeg/..."
                      value={formUrl}
                      onChange={e => setFormUrl(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#052B66] outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Source Title / Legislation Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. POPIA Act No. 4 of 2013 / Company Internal AI Standard"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#052B66] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formType}
                      onChange={e => setFormType(e.target.value as SourceType)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="Regulatory framework">Regulatory framework</option>
                      <option value="Ethics framework">Ethics framework</option>
                      <option value="Internal policy">Internal policy</option>
                      <option value="Industry standard">Industry standard</option>
                      <option value="Academic research">Academic research</option>
                      <option value="Technology documentation">Technology documentation</option>
                      <option value="Case study">Case study</option>
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
                      <option value="Verified">Verified ✓</option>
                      <option value="Required">Required</option>
                      <option value="Review">Needs Review</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Citation / Official Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Section 19 Safeguards / Circular 2025-01"
                    value={formReference}
                    onChange={e => setFormReference(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#052B66] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Relevance to Course
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Why this source is required for learners and course outcomes..."
                    value={formRelevance}
                    onChange={e => setFormRelevance(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#052B66] outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] transition-all shadow-xs cursor-pointer"
                  >
                    {editingSourceId ? 'Save Changes' : 'Add Source'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
