import React, { useState } from 'react';
import { Course, CustomisationPlanningNote, TemplateCourseHistory } from '../types';
import { ArrowLeft, ArrowRight, Lock, ShieldCheck, Sparkles, FileText, Check, Plus, Trash2, Sliders, History, BookOpen } from 'lucide-react';
import { SlideHeader } from './SlideHeader';
import { SlideFooter } from './SlideFooter';
import { FrameworkCallout } from './FrameworkCallout';
import { EditorialField } from './EditorialField';

interface Section09CustomisationProps {
  course: Course;
  onUpdate: (updater: (prev: Course) => Course) => void;
  onPreviewPrompt: () => void;
  onBack: () => void;
}

export const Section09Customisation: React.FC<Section09CustomisationProps> = ({
  course,
  onUpdate,
  onPreviewPrompt,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'adaptation' | 'planning' | 'history'>('adaptation');
  const custom = course.customisation;

  const handleUpdate = (field: keyof Course['customisation'], val: any) => {
    onUpdate(prev => ({
      ...prev,
      customisation: {
        ...prev.customisation,
        [field]: val
      }
    }));
  };

  // Planning Notes Handlers
  const [newSection, setNewSection] = useState('Section 04: Modules');
  const [newChanges, setNewChanges] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleAddPlanningNote = () => {
    if (!newChanges.trim()) return;
    const note: CustomisationPlanningNote = {
      templateSection: newSection,
      whatChanges: newChanges.trim(),
      notes: newNotes.trim()
    };
    handleUpdate('planningNotes', [...(custom.planningNotes || []), note]);
    setNewChanges('');
    setNewNotes('');
  };

  const handleDeletePlanningNote = (idx: number) => {
    handleUpdate('planningNotes', (custom.planningNotes || []).filter((_, i) => i !== idx));
  };

  // History Version Handlers
  const [newHistTitle, setNewHistTitle] = useState(course.structure?.title || 'Master Course v9.0');
  const [newHistIndustry, setNewHistIndustry] = useState(course.structure?.industryDomain || 'Corporate Operations');
  const [newHistVersion, setNewHistVersion] = useState('v9.0');

  const handleAddHistory = () => {
    const historyItem: TemplateCourseHistory = {
      courseTitle: newHistTitle,
      industry: newHistIndustry,
      dateBuilt: new Date().toISOString().split('T')[0],
      version: newHistVersion
    };
    handleUpdate('historicalCourses', [...(custom.historicalCourses || []), historyItem]);
  };

  const handleDeleteHistory = (idx: number) => {
    handleUpdate('historicalCourses', (custom.historicalCourses || []).filter((_, i) => i !== idx));
  };

  return (
    <div id="section-09-customisation-container" className="space-y-6 max-w-6xl">
      {/* Slide Header */}
      <SlideHeader
        sectionNumber="09"
        title="Customisation, Adaptation Ledger & Version History"
        subtitle="Configure client-specific branding, tone, LMS preferences, adaptation notes, and audit version control."
        slideNumber="37"
        totalSlides="39"
        badgeText="Framework Safeguards Active"
      />

      {/* Framework Requirement Callout */}
      <FrameworkCallout
        title="Framework Requirement"
        requirement="Sections 01 through 08 represent the non-negotiable core pedagogical framework of eStudy South Africa. Customisations applied in Section 09 add client-specific adaptations without diluting the depth of the 9 master sections."
        variant="ethics"
      />

      {/* Slide Tab Navigation */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('adaptation')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'adaptation'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Slide 37: Brand & Tone Adaptation</span>
          </button>

          <button
            onClick={() => setActiveTab('planning')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'planning'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Slide 38: Customisation Planning Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Slide 39: Version History & Log</span>
          </button>
        </div>
      </div>

      {activeTab === 'adaptation' && (
        /* Slide 37: Brand & Tone Adaptation */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
                  SLIDE 37 · TONE & BRANDING
                </span>
                <h3 className="text-sm font-bold text-[#052B66]">
                  [BRAND TONE & COMMUNICATION STYLE]
                </h3>
              </div>

              <EditorialField
                label="[BRAND TONE & VOICE]"
                value={custom.tone || 'Professional, supportive, action-oriented, and accessible across corporate departments.'}
                onChange={val => handleUpdate('tone', val)}
                multiline
                rows={3}
                helperText="How the course communicates with learners (e.g. conversational, authoritative, encouraging)."
              />

              <EditorialField
                label="[CLIENT / ENTERPRISE BRANDING GUIDELINES]"
                value={custom.branding || 'Align with Corporate Operations Guide, reference internal risk policies, and maintain institutional terminology.'}
                onChange={val => handleUpdate('branding', val)}
                multiline
                rows={3}
                helperText="Brand styling, logos, and organizational policies to weave into content."
              />
            </div>

            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
                  SLIDE 37 · DELIVERY ENVIRONMENT
                </span>
                <h3 className="text-sm font-bold text-[#052B66]">
                  [DELIVERY ENVIRONMENT & INDUSTRY TERMINOLOGY]
                </h3>
              </div>

              <EditorialField
                label="[TARGET LMS & DELIVERY PREFERENCES]"
                value={custom.deliveryPreferences || 'SCORM 1.2 / Moodle / Canvas LMS / eStudy Platform with interactive micro-learning modules.'}
                onChange={val => handleUpdate('deliveryPreferences', val)}
                multiline
                rows={3}
                helperText="Technical LMS platform requirements and offline export needs."
              />

              <EditorialField
                label="[INDUSTRY EXAMPLES & TERMINOLOGY]"
                value={custom.industryExamples || 'Specific South African banking, insurance, telecom, and public sector terminology.'}
                onChange={val => handleUpdate('industryExamples', val)}
                multiline
                rows={3}
                helperText="Domain-specific jargon, abbreviations, and authentic operational nomenclature."
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'planning' && (
        /* Slide 38: Customisation Planning Ledger */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
                SLIDE 38 · ADAPTATION LEDGER
              </span>
              <h3 className="text-sm font-bold text-[#052B66]">
                [CUSTOMISATION PLANNING & ADAPTATION NOTES]
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {(custom.planningNotes || []).length} adaptations logged
            </span>
          </div>

          <div className="space-y-2.5">
            {(custom.planningNotes || []).map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <span className="text-[10px] font-black text-[#052B66] bg-white border border-slate-200 px-2 py-0.5 rounded uppercase">
                    {item.templateSection}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 pt-1">{item.whatChanges}</h4>
                  {item.notes && <p className="text-[11px] text-slate-600">{item.notes}</p>}
                </div>
                <button onClick={() => handleDeletePlanningNote(idx)} className="text-slate-400 hover:text-rose-600 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Adaptation Form */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="text-xs font-bold text-[#052B66] uppercase tracking-wide">
              + Log Framework Customisation
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <select
                  value={newSection}
                  onChange={e => setNewSection(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg outline-none"
                >
                  <option value="Section 01: Problem">Section 01: Problem</option>
                  <option value="Section 02: Sources">Section 02: Sources</option>
                  <option value="Section 03: Structure">Section 03: Structure</option>
                  <option value="Section 04: Modules">Section 04: Modules</option>
                  <option value="Section 05: Learning Design">Section 05: Learning Design</option>
                  <option value="Section 06: Ethics">Section 06: Ethics</option>
                  <option value="Section 07: Output">Section 07: Output</option>
                  <option value="Section 08: QA">Section 08: QA</option>
                </select>
              </div>

              <div>
                <input
                  type="text"
                  value={newChanges}
                  onChange={e => setNewChanges(e.target.value)}
                  placeholder="What is being adapted? (e.g. Add company data policy)"
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="Rationale / Impact notes"
                  className="flex-1 text-xs p-2.5 bg-white border border-slate-300 rounded-lg outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddPlanningNote}
                  className="px-4 py-2.5 bg-[#052B66] text-white text-xs font-bold rounded-lg hover:bg-[#042150] cursor-pointer"
                >
                  Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        /* Slide 39: Version History & Log */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
                SLIDE 39 · VERSION CONTROL
              </span>
              <h3 className="text-sm font-bold text-[#052B66]">
                [COURSE DEVELOPMENT HISTORY & VERSION CONTROL LOG]
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {(custom.historicalCourses || []).length} versions recorded
            </span>
          </div>

          <div className="space-y-2.5">
            {(custom.historicalCourses || []).map((h, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black font-mono text-[#052B66] bg-white border border-slate-200 px-2.5 py-1 rounded">
                    {h.version}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{h.courseTitle}</h4>
                    <p className="text-[11px] text-slate-500">{h.industry} · Logged: {h.dateBuilt}</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteHistory(idx)} className="text-slate-400 hover:text-rose-600 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="text-xs text-slate-700">
              <span className="font-bold text-[#052B66]">Current Build Version:</span> Master Course Generation Framework v9.0
            </div>
            <button
              type="button"
              onClick={handleAddHistory}
              className="px-4 py-2 bg-[#052B66] text-white text-xs font-bold rounded-lg hover:bg-[#042150] cursor-pointer"
            >
              + Snapshot Current Version
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
          <span>← Back to Quality Assurance</span>
        </button>

        <button
          id="section-09-preview-prompt-btn"
          onClick={onPreviewPrompt}
          className="px-8 py-3.5 rounded-xl text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate & Preview Master Prompt →</span>
        </button>
      </div>

      {/* Slide Footer */}
      <SlideFooter currentSlide="37" totalSlides="39" />
    </div>
  );
};
