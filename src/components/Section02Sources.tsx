import React, { useState, useRef } from 'react';
import { Course, ResearchSource, SourceType, SourceStatus, SourceMedium, LearnerProfileEnvironment } from '../types';
import {
  Plus,
  Trash2,
  Edit3,
  ArrowLeft,
  BookOpen,
  FileText,
  Globe,
  Upload,
  Search,
  Scale,
  Sparkles,
  ExternalLink,
  X,
  FileCode,
  Users,
  Cpu,
  Image as ImageIcon
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
  onStartAIGeneration?: () => void;
  onOpenPreview?: () => void;
  onOpenExportModal?: () => void;
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
    name: 'Financial Sector Conduct Authority (FSCA) Market Conduct & AI Circular',
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

const DEFAULT_LEARNER_PROFILE: LearnerProfileEnvironment = {
  jobRoles: '',
  departments: '',
  experienceLevels: '',
  existingKnowledge: '',
  digitalLiteracy: '',
  aiFamiliarity: '',
  workplaceEnvironment: '',
  organisationalConstraints: '',
  availableToolsAndTechnology: ''
};

export const Section02Sources: React.FC<Section02SourcesProps> = ({
  course,
  onUpdate,
  onContinue,
  onBack,
  onStartAIGeneration,
  onOpenPreview,
  onOpenExportModal
}) => {
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
  const logoUploadRef = useRef<HTMLInputElement | null>(null);
  const bannerUploadRef = useRef<HTMLInputElement | null>(null);

  const research = course.research;
  const sources = research.sources || [];
  const learnerProfile = research.learnerProfile || DEFAULT_LEARNER_PROFILE;
  const flagged = course.flaggedFields || {};

  const confirmFlag = (key: string) => {
    onUpdate(prev => {
      const next = { ...(prev.flaggedFields || {}) };
      delete next[key];
      return { ...prev, flaggedFields: next };
    });
  };

  const handleResearchFieldChange = (field: 'regulatorySources' | 'aiToolsReferenced' | 'ethicsFrameworks' | 'industryUseCases', val: string) => {
    onUpdate(prev => ({
      ...prev,
      research: {
        ...prev.research,
        [field]: val
      }
    }));
  };

  const handleLearnerProfileChange = (field: keyof LearnerProfileEnvironment, val: string) => {
    onUpdate(prev => ({
      ...prev,
      research: {
        ...prev.research,
        learnerProfile: {
          ...(prev.research.learnerProfile || DEFAULT_LEARNER_PROFILE),
          [field]: val
        }
      }
    }));
  };

  const handleImageAssetUpload = (field: 'coverLogoUrl' | 'coverVisualUrl', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdate(prev => ({
          ...prev,
          [field]: reader.result as string
        }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

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
    const tabToSet: 'upload' | 'url' | 'text' | 'framework' = src.medium === 'document' ? 'upload' : (src.medium || 'upload');
    setModalTab(tabToSet);
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

    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = evt => {
        const text = evt.target?.result as string;
        if (text) {
          setFormSnippet(text.slice(0, 2000));
        }
      };
      reader.readAsText(file);
    } else {
      setFormSnippet(`Uploaded supporting reference document: ${file.name} (${file.type || 'Document'})`);
    }
  };

  const handleSaveSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const sourceData: ResearchSource = {
      id: editingSourceId || `src-${Date.now()}`,
      name: formName,
      type: formType,
      reference: formReference || formUrl || formFileName || 'Internal Reference Document',
      relevance: formRelevance || 'Authoritative evidence referenced during instructional course synthesis.',
      status: formStatus,
      medium: modalTab,
      url: formUrl || undefined,
      fileName: formFileName || undefined,
      fileSize: formFileSize || undefined,
      contentSnippet: formSnippet || undefined,
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
      setShowAddModal(false);
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
    <div id="section-02-sources-container" className="space-y-8 max-w-6xl font-sora">
      {/* Slide Header */}
      <SlideHeader
        sectionNumber="02"
        title="2. SOURCES OF INFORMATION (RESEARCH LAYER)"
        subtitle="Provide a minimum of 3 credible, traceable sources, regulatory frameworks, AI & technology references, and learner environment profiles."
        slideNumber="02"
        totalSlides="09"
        badgeText={`${sources.length} Sources Linked`}
      />

      {/* Framework Requirement Callout */}
      <FrameworkCallout
        title="Authoritative Grounding Requirement"
        requirement="Provide a minimum of 3 credible, traceable sources. All AI and regulatory references must cite specific, named frameworks or statutes (e.g., POPIA, FSCA, King IV, SAQA)."
        variant="requirement"
      />

      {/* ================================================================= */}
      {/* PART A: SOURCES AND EVIDENCE (2.1, 2.2, 2.3)                      */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-6 shadow-xs border-l-4 border-l-[#052B66]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1.5">
              PART A · SOURCES AND EVIDENCE
            </span>
            <h3 className="text-base font-extrabold text-[#052B66]">
              2.1 Reference Links & Supporting Documents <span className="text-rose-600 font-black">*</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add reference URLs, upload supporting documents (PDF, DOCX, TXT), or paste policy excerpts for AI course synthesis.
            </p>
          </div>

          <button
            id="add-source-btn"
            onClick={() => handleOpenAdd('upload')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#45CC42] hover:bg-[#3ec23b] text-[#052B66] shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Reference / Upload Document</span>
          </button>
        </div>

        {/* Quick-Add Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => handleOpenAdd('upload')}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-[#45CC42] transition-all flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-[#45CC42]/15 text-[#052B66] flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4 text-[#052B66]" />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-slate-800 group-hover:text-[#052B66]">
                Upload Document
              </div>
              <div className="text-[10.5px] text-slate-400 truncate">PDF, DOCX, TXT</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAdd('url')}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-[#45CC42] transition-all flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-slate-800 group-hover:text-[#052B66]">
                Add Reference Link
              </div>
              <div className="text-[10.5px] text-slate-400 truncate">URL or Document Title</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAdd('text')}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-[#45CC42] transition-all flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-slate-800 group-hover:text-[#052B66]">
                Paste SOP / Policy
              </div>
              <div className="text-[10.5px] text-slate-400 truncate">Direct text excerpt</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAdd('framework')}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-[#45CC42] transition-all flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#052B66] flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4 text-[#45CC42]" />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-slate-800 group-hover:text-[#052B66]">
                SA Frameworks
              </div>
              <div className="text-[10.5px] text-slate-400 truncate">POPIA, FSCA, King IV</div>
            </div>
          </button>
        </div>

        {/* Search & Source List */}
        {sources.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-[#45CC42]" />
              <span>{sources.length} Reference Link(s) & Supporting Documents Added (Minimum 3 recommended)</span>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search sources..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:border-[#052B66] outline-none"
              />
            </div>
          </div>
        )}

        {filteredSources.length === 0 ? (
          <div className="bg-slate-50/70 rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-[#052B66] mx-auto flex items-center justify-center">
              <BookOpen className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="text-sm font-bold text-slate-800">
                {searchQuery ? 'No sources match your search' : 'No Reference Links or Supporting Documents Added Yet'}
              </h4>
              <p className="text-xs text-slate-500">
                Add Link 1, Link 2, and Link 3 (URLs, uploaded documents, or South African regulatory frameworks) to ground your course.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenAdd('upload')}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Source</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSources.map((src, idx) => (
              <div
                key={src.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-[#45CC42] transition-all flex flex-col justify-between space-y-3 group border-l-4 border-l-[#45CC42]"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        {getSourceIcon(src)}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2 py-0.5 rounded">
                        Link {idx + 1} · {src.type}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold bg-[#45CC42]/20 text-[#052B66] border border-[#45CC42]/40 px-2 py-0.5 rounded-full">
                      {src.status === 'Verified' ? '✓ Verified' : src.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#052B66] leading-snug">
                      {src.name}
                    </h4>
                    {src.reference && (
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono line-clamp-1">
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

                  {src.contentSnippet && (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-[11px] text-slate-600 font-mono line-clamp-2">
                      "{src.contentSnippet}"
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[10px]">
                    {src.dateAdded ? `Added ${src.dateAdded}` : 'Reference Source'}
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
                      type="button"
                      onClick={() => handleOpenEdit(src)}
                      className="p-1.5 text-slate-400 hover:text-[#052B66] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Source"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
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

        {/* 2.2 Industry / Regulatory Sources & 2.3 AI & Technology Sources */}
        <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-[#052B66] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#45CC42]" />
              <span>2.2 Industry / Regulatory Sources</span>
            </h4>

            <EditorialField
              label="[INSERT: REGULATORY FRAMEWORK]"
              value={research.regulatorySources || ''}
              onChange={val => handleResearchFieldChange('regulatorySources', val)}
              placeholder="e.g. POPIA Act 4 of 2013, FSCA Market Conduct Standards, National Credit Act (NCA), King IV Report, SAQA NQF Guidelines"
              example="POPIA (Protection of Personal Information Act), FSCA Conduct Standard 3 of 2020, and internal data protection policies."
              helperText="Specify the South African legislation, industry regulations, or statutory frameworks governing this topic."
              multiline
              rows={4}
              required
              flaggedNote={flagged['research.regulatorySources']}
              onConfirmFlag={() => confirmFlag('research.regulatorySources')}
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-[#052B66] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#45CC42]" />
              <span>2.3 AI & Technology Sources</span>
            </h4>

            <EditorialField
              label="AI Tools or Platforms Used in This Domain [INSERT]"
              value={research.aiToolsReferenced || ''}
              onChange={val => handleResearchFieldChange('aiToolsReferenced', val)}
              placeholder="e.g. Microsoft Copilot, ChatGPT Enterprise, Google Gemini Workspace, SAP Business AI"
              multiline
              rows={2}
              flaggedNote={flagged['research.aiToolsReferenced']}
              onConfirmFlag={() => confirmFlag('research.aiToolsReferenced')}
            />

            <EditorialField
              label="Relevant AI Ethics Framework [INSERT]"
              value={research.ethicsFrameworks || ''}
              onChange={val => handleResearchFieldChange('ethicsFrameworks', val)}
              placeholder="e.g. POPIA Section 71 Automated Decision-Making, UNESCO AI Ethics, NIST AI RMF, EU AI Act"
              multiline
              rows={2}
              flaggedNote={flagged['research.ethicsFrameworks']}
              onConfirmFlag={() => confirmFlag('research.ethicsFrameworks')}
            />

            <EditorialField
              label="Industry Case Studies or Use Cases [INSERT]"
              value={research.industryUseCases || ''}
              onChange={val => handleResearchFieldChange('industryUseCases', val)}
              placeholder="e.g. Automated customer query triage in retail banking; AI-assisted financial variance analysis"
              multiline
              rows={2}
              flaggedNote={flagged['research.industryUseCases']}
              onConfirmFlag={() => confirmFlag('research.industryUseCases')}
            />
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* PART B: LEARNER PROFILE AND ENVIRONMENT                           */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-6 shadow-xs border-l-4 border-l-[#45CC42]">
        <div className="border-b border-slate-100 pb-4">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#45CC42]/20 px-2.5 py-0.5 rounded-md border border-[#45CC42]/40 inline-block mb-1.5">
            PART B · LEARNER PROFILE AND ENVIRONMENT
          </span>
          <h3 className="text-base font-extrabold text-[#052B66] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#052B66]" />
            <span>Learner Cohort, Baseline Knowledge & Workplace Environment</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Define the learner profile and operational environment so the course content and scenarios match real workplace conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <EditorialField
            label="Learner Job Roles"
            value={learnerProfile.jobRoles}
            onChange={val => handleLearnerProfileChange('jobRoles', val)}
            placeholder="e.g. Junior to mid-level administrators, financial clerks, team supervisors"
            required
          />

          <EditorialField
            label="Departments"
            value={learnerProfile.departments}
            onChange={val => handleLearnerProfileChange('departments', val)}
            placeholder="e.g. Finance, Operations, Client Services, Human Resources"
            required
          />

          <EditorialField
            label="Experience Levels"
            value={learnerProfile.experienceLevels}
            onChange={val => handleLearnerProfileChange('experienceLevels', val)}
            placeholder="e.g. 1–4 years workplace experience"
          />

          <EditorialField
            label="Existing Knowledge"
            value={learnerProfile.existingKnowledge}
            onChange={val => handleLearnerProfileChange('existingKnowledge', val)}
            placeholder="e.g. Understands basic departmental workflows; limited formal compliance training"
            multiline
            rows={2}
          />

          <EditorialField
            label="Digital Literacy"
            value={learnerProfile.digitalLiteracy}
            onChange={val => handleLearnerProfileChange('digitalLiteracy', val)}
            placeholder="e.g. Proficient in email, spreadsheets, and web browsers"
            multiline
            rows={2}
          />

          <EditorialField
            label="AI Familiarity"
            value={learnerProfile.aiFamiliarity}
            onChange={val => handleLearnerProfileChange('aiFamiliarity', val)}
            placeholder="e.g. Basic awareness of consumer AI tools; no formal workplace prompting or verification skills"
            multiline
            rows={2}
          />

          <EditorialField
            label="Workplace Environment"
            value={learnerProfile.workplaceEnvironment}
            onChange={val => handleLearnerProfileChange('workplaceEnvironment', val)}
            placeholder="e.g. Fast-paced office or hybrid environment with strict SLA turnaround targets"
            multiline
            rows={2}
          />

          <EditorialField
            label="Organisational Constraints"
            value={learnerProfile.organisationalConstraints}
            onChange={val => handleLearnerProfileChange('organisationalConstraints', val)}
            placeholder="e.g. Limited study time during shifts; strict firewall restrictions on external tools"
            multiline
            rows={2}
          />

          <EditorialField
            label="Available Tools and Technology"
            value={learnerProfile.availableToolsAndTechnology}
            onChange={val => handleLearnerProfileChange('availableToolsAndTechnology', val)}
            placeholder="e.g. Microsoft 365, internal ERP/CRM system, LMS portal on desktop and mobile"
            multiline
            rows={2}
          />
        </div>
      </div>

      {/* ================================================================= */}
      {/* COURSE BRANDING ASSETS (LOGO & BANNER FOR EXPORTS)                */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#052B66] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#45CC42]" />
              <span>Course Logo & Banner Image (Included in Word & PDF Downloads)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Upload your organisation or course logo and cover banner. These images are automatically embedded into both the Completed Master Template and Generated Training Course exports.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {course.coverLogoUrl ? (
                <img
                  src={course.coverLogoUrl}
                  alt="Course Logo"
                  className="w-12 h-12 object-contain rounded-lg bg-white border border-slate-200 p-1 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-white border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#052B66]">Course / Organisation Logo</div>
                <div className="text-[11px] text-slate-500 truncate">
                  {course.coverLogoUrl ? 'Custom logo uploaded and ready for export' : 'Default eStudy header will be used if none uploaded'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => logoUploadRef.current?.click()}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-300 text-[#052B66] hover:border-[#052B66] cursor-pointer"
              >
                {course.coverLogoUrl ? 'Change Logo' : 'Upload Logo'}
              </button>
              <input
                ref={logoUploadRef}
                type="file"
                accept="image/*"
                onChange={e => handleImageAssetUpload('coverLogoUrl', e)}
                className="hidden"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {course.coverVisualUrl ? (
                <img
                  src={course.coverVisualUrl}
                  alt="Course Banner"
                  className="w-16 h-12 object-cover rounded-lg bg-white border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-16 h-12 rounded-lg bg-white border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#052B66]">Course Cover Banner Image</div>
                <div className="text-[11px] text-slate-500 truncate">
                  {course.coverVisualUrl ? 'Custom cover banner uploaded and ready for export' : 'Optional cover banner for PDF & Word exports'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => bannerUploadRef.current?.click()}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-300 text-[#052B66] hover:border-[#052B66] cursor-pointer"
              >
                {course.coverVisualUrl ? 'Change Banner' : 'Upload Banner'}
              </button>
              <input
                ref={bannerUploadRef}
                type="file"
                accept="image/*"
                onChange={e => handleImageAssetUpload('coverVisualUrl', e)}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={onBack}
          className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Section 1: Problem Statement</span>
        </button>

        <button
          id="section-02-continue-btn"
          onClick={onContinue}
          className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Section 3: Course Structure →</span>
        </button>
      </div>

      <SlideFooter currentSlide="02" totalSlides="09" />

      {/* Add / Edit Source Modal (with Backdrop Click-to-Close) */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sora"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#45CC42]" />
                <h3 className="text-sm font-extrabold text-[#052B66]">
                  {editingSourceId ? 'Edit Reference Source' : 'Add Reference Link or Supporting Document'}
                </h3>
              </div>
              <button
                type="button"
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
                  <div className="space-y-3">
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

                    {formSnippet && (
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                          <span>Extracted Content / Notes for AI Grounding</span>
                          <span className="text-[10px] text-slate-400 font-mono font-normal">Passed to AI engine prompt</span>
                        </div>
                        <textarea
                          rows={3}
                          value={formSnippet}
                          onChange={e => setFormSnippet(e.target.value)}
                          placeholder="Key excerpts, summary points, or chapters to feed into the AI engine..."
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#052B66] outline-none font-mono"
                        />
                      </div>
                    )}
                  </div>
                )}

                {modalTab === 'text' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <label>
                        Paste Excerpt, Policy Text, SOP or Knowledge Notes *
                      </label>
                      <span className="text-[10px] text-[#45CC42] font-mono font-bold bg-[#052B66] px-1.5 py-0.5 rounded">
                        Direct AI Input
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      required
                      placeholder="Paste training material, standard operating procedures, legislation excerpts, company policy, or curriculum notes here..."
                      value={formSnippet}
                      onChange={e => setFormSnippet(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-[#052B66] outline-none font-mono"
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
                    Source Title / Document Name *
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
