import React, { useState } from 'react';
import { Course, CustomisationPlanningNote, TemplateCourseHistory } from '../types';
import { ArrowLeft, Sparkles, Trash2, Sliders, History, FileText } from 'lucide-react';
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
  const [newSection, setNewSection] = useState('Section 1 – Problem Statement');
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
    handleUpdate(
      'planningNotes',
      (custom.planningNotes || []).filter((_, i) => i !== idx)
    );
  };

  // 9.1 Courses Built Using This Template Handlers
  const [newHistTitle, setNewHistTitle] = useState('');
  const [newHistIndustry, setNewHistIndustry] = useState('');
  const [newHistVersion, setNewHistVersion] = useState('v9.0');

  const handleAddHistory = () => {
    const titleToLog = newHistTitle.trim() || course.structure?.title || course.name || 'Master Course';
    const industryToLog = newHistIndustry.trim() || course.structure?.industryDomain || 'Corporate Training';
    const historyItem: TemplateCourseHistory = {
      courseTitle: titleToLog,
      industry: industryToLog,
      dateBuilt: new Date().toISOString().split('T')[0],
      version: newHistVersion || 'v9.0'
    };
    handleUpdate('historicalCourses', [...(custom.historicalCourses || []), historyItem]);
    setNewHistTitle('');
    setNewHistIndustry('');
  };

  const handleDeleteHistory = (idx: number) => {
    handleUpdate(
      'historicalCourses',
      (custom.historicalCourses || []).filter((_, i) => i !== idx)
    );
  };

  return (
    <div id="section-09-customisation-container" className="space-y-8 max-w-6xl font-sora">
      {/* Slide Header */}
      <SlideHeader
        sectionNumber="09"
        title="9. CUSTOMISATION GUIDE"
        subtitle="Record client-specific adaptations, tone, branding, and 9.1 Courses Built Using This Template on a single page."
        slideNumber="09"
        totalSlides="09"
        badgeText="Section 9 · Customisation Guide"
      />

      {/* Framework Requirement Callout */}
      <FrameworkCallout
        title="How to Adapt This Template for Any Course (Page 17 of PDF Template)"
        requirement="Sections 1–7 change per course (replace all [INSERT] fields with course-specific content). Sections 5, 6, 7 & 8 remain consistent across all courses (this is the quality backbone)."
        variant="ethics"
      />

      {/* ================================================================= */}
      {/* ORGANISATIONAL TONE, BRANDING & DELIVERY PREFERENCES              */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs border-l-4 border-l-[#052B66]">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
            SECTION 9 · ORGANISATIONAL ADAPTATION
          </span>
          <h3 className="text-base font-extrabold text-[#052B66] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#45CC42]" />
            <span>Brand Tone, Enterprise Guidelines & LMS Delivery Preferences</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <EditorialField
            label="Brand Tone & Communication Style"
            value={custom.tone}
            onChange={val => handleUpdate('tone', val)}
            placeholder="e.g. Professional, supportive, action-oriented, and accessible across South African corporate departments."
            multiline
            rows={3}
          />

          <EditorialField
            label="Client / Organisation Branding Guidelines"
            value={custom.branding}
            onChange={val => handleUpdate('branding', val)}
            placeholder="e.g. Align with internal Corporate Operations Guide, reference internal risk policies, and maintain institutional terminology."
            multiline
            rows={3}
          />

          <EditorialField
            label="Target LMS & Delivery Preferences"
            value={custom.deliveryPreferences}
            onChange={val => handleUpdate('deliveryPreferences', val)}
            placeholder="e.g. eStudy LMS / SCORM 1.2 / Moodle / Printable Word & PDF Workbooks."
            multiline
            rows={3}
          />

          <EditorialField
            label="Industry Examples & Terminology"
            value={custom.industryExamples}
            onChange={val => handleUpdate('industryExamples', val)}
            placeholder="e.g. South African banking, retail, manufacturing, mining, or public sector terminology."
            multiline
            rows={3}
          />
        </div>
      </div>

      {/* ================================================================= */}
      {/* CUSTOMISATION PLANNING TABLE                                      */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-[#052B66] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#45CC42]" />
              <span>Template Section Customisation Notes</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Optional notes on how specific sections of the Master Template were adapted for this course.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {(custom.planningNotes || []).length} note(s)
          </span>
        </div>

        {(custom.planningNotes || []).length > 0 && (
          <div className="space-y-2.5">
            {(custom.planningNotes || []).map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <span className="text-[10px] font-black text-[#052B66] bg-white border border-slate-200 px-2 py-0.5 rounded uppercase">
                    {item.templateSection}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 pt-1">{item.whatChanges}</h4>
                  {item.notes && <p className="text-[11px] text-slate-600">{item.notes}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeletePlanningNote(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <span className="text-xs font-bold text-[#052B66] uppercase tracking-wide block">
            + Add Customisation Note
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={newSection}
              onChange={e => setNewSection(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg outline-none"
            >
              <option value="Section 1 – Problem Statement">Section 1 – Problem Statement</option>
              <option value="Section 2 – Sources">Section 2 – Sources</option>
              <option value="Section 3 – Course Structure">Section 3 – Course Structure</option>
              <option value="Section 4 – Modules">Section 4 – Modules</option>
              <option value="Section 5 – Learning Design">Section 5 – Learning Design</option>
              <option value="Section 6 – Ethics">Section 6 – Ethics</option>
              <option value="Section 7 – Output Format">Section 7 – Output Format</option>
              <option value="Section 8 – QA">Section 8 – QA</option>
            </select>

            <input
              type="text"
              value={newChanges}
              onChange={e => setNewChanges(e.target.value)}
              placeholder="What changes? (e.g. Tailored scenarios for retail branches)"
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg outline-none"
            />

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                placeholder="Additional notes..."
                className="flex-1 text-xs p-2.5 bg-white border border-slate-300 rounded-lg outline-none"
              />
              <button
                type="button"
                onClick={handleAddPlanningNote}
                className="px-4 py-2.5 bg-[#052B66] text-white text-xs font-bold rounded-lg hover:bg-[#042150] cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 9.1 COURSES BUILT USING THIS TEMPLATE                             */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5 border-l-4 border-l-[#45CC42]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#45CC42]/20 px-2.5 py-0.5 rounded-md border border-[#45CC42]/40 inline-block mb-1">
              SUBSECTION 9.1
            </span>
            <h3 className="text-base font-extrabold text-[#052B66] flex items-center gap-2">
              <History className="w-4 h-4 text-[#052B66]" />
              <span>9.1 Courses Built Using This Template</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Official version log from page 17 of the PDF template (#, Course Title, Industry, Date Built, Version).
            </p>
          </div>
        </div>

        {(custom.historicalCourses || []).length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-[#052B66] text-white text-[11px] font-extrabold uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-12">#</th>
                  <th className="py-2.5 px-4">Course Title</th>
                  <th className="py-2.5 px-4">Industry</th>
                  <th className="py-2.5 px-4">Date Built</th>
                  <th className="py-2.5 px-4">Version</th>
                  <th className="py-2.5 px-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {(custom.historicalCourses || []).map((h, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="py-2.5 px-3 font-bold text-[#052B66]">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{h.courseTitle}</td>
                    <td className="py-2.5 px-4 text-slate-600">{h.industry}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{h.dateBuilt}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-[#052B66]">{h.version}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteHistory(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
          <input
            type="text"
            value={newHistTitle}
            onChange={e => setNewHistTitle(e.target.value)}
            placeholder={course.structure?.title || 'Course Title'}
            className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg outline-none"
          />
          <input
            type="text"
            value={newHistIndustry}
            onChange={e => setNewHistIndustry(e.target.value)}
            placeholder={course.structure?.industryDomain || 'Industry / Domain'}
            className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg outline-none"
          />
          <input
            type="text"
            value={newHistVersion}
            onChange={e => setNewHistVersion(e.target.value)}
            placeholder="Version (e.g. v9.0)"
            className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg outline-none"
          />
          <button
            type="button"
            onClick={handleAddHistory}
            className="px-4 py-2.5 bg-[#052B66] text-white text-xs font-bold rounded-lg hover:bg-[#042150] cursor-pointer"
          >
            + Log Course Version
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
          <span>← Back to Section 8: Quality Assurance</span>
        </button>

        <button
          id="section-09-preview-prompt-btn"
          onClick={onPreviewPrompt}
          className="px-8 py-3.5 rounded-xl text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Review Master Prompt & Generate Course →</span>
        </button>
      </div>

      <SlideFooter currentSlide="09" totalSlides="09" />
    </div>
  );
};
