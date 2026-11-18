import React, { useState, useRef } from 'react';
import { Course } from '../types';
import { BrandLogo } from './BrandLogo';
import {
  ArrowRight,
  Upload,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  Plus,
  X,
  FolderOpen,
  FileUp
} from 'lucide-react';

interface CoverPageProps {
  activeCourse: Course;
  courses: Course[];
  onStartBuilding: () => void;
  onSelectCourse: (courseId: string) => void;
  onCreateNewCourse: (title: string, templateId?: string) => void;
  onUpdateCourse: (updater: (prev: Course) => Course) => void;
  onGoToDashboard: () => void;
  onOpenQuickAI?: () => void;
  onOpenUploadTemplate?: () => void;
}

export const CoverPage: React.FC<CoverPageProps> = ({
  activeCourse,
  courses,
  onStartBuilding,
  onSelectCourse,
  onCreateNewCourse,
  onUpdateCourse,
  onGoToDashboard,
  onOpenUploadTemplate
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(activeCourse.structure?.title || (activeCourse.name === 'Untitled Course' ? '' : activeCourse.name) || '');
  const [showContinueModal, setShowContinueModal] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const visualInputRef = useRef<HTMLInputElement>(null);

  const handleSaveTitle = () => {
    onUpdateCourse(prev => ({
      ...prev,
      name: titleInput || 'Untitled Course',
      structure: {
        ...prev.structure,
        title: titleInput
      }
    }));
    setIsEditingTitle(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      onUpdateCourse(prev => ({
        ...prev,
        coverLogoUrl: ev.target?.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleVisualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      onUpdateCourse(prev => ({
        ...prev,
        coverVisualUrl: ev.target?.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleStartNewCourseDirectly = () => {
    onCreateNewCourse('', 'master-template-v9');
  };

  return (
    <div
      id="cover-page-slide"
      className="min-h-screen bg-[#052B66] text-white flex flex-col justify-between relative overflow-hidden select-none font-sora"
    >
      {/* Subtle Architectural Grid & Glow Overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#45CC42 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '32px 32px, 64px 64px, 64px 64px'
        }}
      />
      <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-[#45CC42]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[520px] h-[520px] rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

      {/* Top Slide Header Bar */}
      <header className="relative z-10 px-6 sm:px-12 py-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#042150]/60 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {/* Client Logo Upload Slot */}
          <div className="flex items-center gap-3">
            {activeCourse.coverLogoUrl ? (
              <div className="relative group">
                <img
                  src={activeCourse.coverLogoUrl}
                  alt="Organisation Logo"
                  className="h-11 w-auto max-w-[160px] object-contain rounded-lg bg-white p-1.5 shadow-md"
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-[10px] font-bold text-white cursor-pointer"
                >
                  Change Logo
                </button>
              </div>
            ) : (
              <BrandLogo variant="white" size="md" />
            )}

            <button
              onClick={() => logoInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-semibold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Upload your organisation logo to embed in exported PDF and Word documents"
            >
              <Upload className="w-3.5 h-3.5 text-[#45CC42]" />
              <span>{activeCourse.coverLogoUrl ? 'Update Logo' : 'Upload Organisation Logo'}</span>
            </button>
            <input
              type="file"
              ref={logoInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Right Controls: Saved Courses & Workspace */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowContinueModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#45CC42]" />
            <span>Saved Courses ({courses.length})</span>
          </button>

          <button
            onClick={onGoToDashboard}
            className="px-4 py-2 rounded-xl bg-[#45CC42]/20 hover:bg-[#45CC42]/30 border border-[#45CC42]/50 text-xs font-bold text-[#45CC42] transition-all cursor-pointer"
          >
            All Courses Dashboard
          </button>
        </div>
      </header>

      {/* Main Cover Page Hero Split */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 sm:px-12 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Official Master Prompt v9.0 Identity & Simplified 3 Primary Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#45CC42]/15 border border-[#45CC42]/40 text-[#45CC42] text-xs font-extrabold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>eStudy South Africa · Official Master Course Template v9.0</span>
          </div>

          {/* Course Title */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-widest text-slate-300">
              ACTIVE WORKSPACE COURSE:
            </div>

            {isEditingTitle ? (
              <div className="flex items-center gap-2 max-w-xl">
                <input
                  type="text"
                  value={titleInput}
                  onChange={e => setTitleInput(e.target.value)}
                  className="flex-1 bg-white text-[#052B66] font-extrabold text-xl sm:text-2xl px-4 py-2.5 rounded-xl border-2 border-[#45CC42] outline-none"
                  placeholder="Enter course title (e.g. Ethical AI in HR Operations)..."
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  className="px-4 py-3 rounded-xl bg-[#45CC42] text-[#052B66] font-black text-xs cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="group flex items-baseline gap-3 flex-wrap">
                <h1
                  onClick={() => {
                    setTitleInput(activeCourse.structure?.title || (activeCourse.name === 'Untitled Course' ? '' : activeCourse.name) || '');
                    setIsEditingTitle(true);
                  }}
                  className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.12] cursor-pointer hover:text-[#45CC42] transition-colors"
                  title="Click to rename active course"
                >
                  {activeCourse.structure?.title || activeCourse.name || 'eStudy Master Course Builder'}
                </h1>
                <button
                  onClick={() => {
                    setTitleInput(activeCourse.structure?.title || (activeCourse.name === 'Untitled Course' ? '' : activeCourse.name) || '');
                    setIsEditingTitle(true);
                  }}
                  className="text-xs font-semibold text-[#45CC42] underline opacity-85 hover:opacity-100 cursor-pointer"
                >
                  [Edit Title]
                </button>
              </div>
            )}
          </div>

          {/* Green Accent Divider */}
          <div className="w-32 h-2 bg-[#45CC42] rounded-full shadow-[0_0_16px_rgba(69,204,66,0.6)]" />

          {/* Subtitle Description */}
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-normal">
            Complete the official <strong>eStudy Master Course Generation Template (v9.0)</strong> digitally, upload existing course documents to auto-populate fields, generate a comprehensive 22–30 page corporate training course using AI, and download both the completed template and generated training manual.
          </p>

          {/* 3 Clear, Focused Pathways (Requirement 2) */}
          <div className="pt-2 space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3.5">
              {/* Primary Action 1: Create New Course Directly in Master Template */}
              <button
                id="cover-create-new-course-btn"
                onClick={handleStartNewCourseDirectly}
                className="px-7 py-4 rounded-2xl bg-[#45CC42] hover:bg-[#3db83a] text-[#052B66] font-black text-sm tracking-wide shadow-[0_10px_30px_rgba(69,204,66,0.35)] hover:shadow-[0_12px_36px_rgba(69,204,66,0.5)] transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>Create New Course</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Action 2: Continue Existing Course */}
              <button
                id="cover-continue-course-btn"
                onClick={onStartBuilding}
                className="px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 text-[#052B66] font-extrabold text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#052B66]" />
                <span>Continue Active Course</span>
              </button>

              {/* Action 3: Upload Existing Course Template / Document */}
              {onOpenUploadTemplate && (
                <button
                  id="cover-upload-template-btn"
                  onClick={onOpenUploadTemplate}
                  className="px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FileUp className="w-4 h-4 text-[#45CC42]" />
                  <span>Upload Existing Template (PDF / DOCX)</span>
                </button>
              )}
            </div>

            {courses.length > 1 && (
              <div className="pt-1 flex items-center gap-2 text-xs text-slate-300">
                <span>Working on another course?</span>
                <button
                  type="button"
                  onClick={() => setShowContinueModal(true)}
                  className="text-[#45CC42] font-bold underline hover:opacity-90 cursor-pointer"
                >
                  Switch between your {courses.length} saved courses →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Course Cover Banner Visual & Framework Card */}
        <div className="lg:col-span-5">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#45CC42] font-bold block">
                  BRANDING & SPECIFICATION
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Course Cover Banner & Summary
                </h3>
              </div>

              <button
                onClick={() => visualInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer"
                title="Upload a course cover banner image to include in exported PDF and Word documents"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#45CC42]" />
                <span>{activeCourse.coverVisualUrl ? 'Change Banner' : 'Upload Course Banner'}</span>
              </button>
              <input
                type="file"
                ref={visualInputRef}
                onChange={handleVisualUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {activeCourse.coverVisualUrl ? (
              <div className="rounded-2xl overflow-hidden border border-white/20 bg-black/20 h-44 flex items-center justify-center relative group">
                <img
                  src={activeCourse.coverVisualUrl}
                  alt="Course Cover Banner"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => visualInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-white cursor-pointer"
                >
                  Replace Banner Image
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/15 bg-[#042150]/80 p-5 space-y-3">
                <div className="text-xs font-bold text-[#45CC42] uppercase tracking-wider">
                  Official 9-Section eStudy Architecture:
                </div>
                <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#45CC42] shrink-0" />
                    <span>1. Identify Problem / Challenge / Development Area</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#45CC42] shrink-0" />
                    <span>2. Sources of Information & Learner Profile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#45CC42] shrink-0" />
                    <span>3. Course Structure (Details, Benefits, Diagnostics)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#45CC42] shrink-0" />
                    <span>4. Module Content (Minimum 3 Modules & Scenarios)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#45CC42] shrink-0" />
                    <span>5–9. Learning Design, Ethics, Output, QA & Customisation</span>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Target Domain</span>
                <span className="font-bold text-white truncate block mt-0.5">
                  {activeCourse.structure?.industryDomain || 'Not specified yet'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">AI Integration</span>
                <span className="font-bold text-[#45CC42] truncate block mt-0.5">
                  {activeCourse.structure?.aiIntegrationLevel || 'Applied'} Level
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#45CC42]" />
                <span>POPIA Act 4 of 2013 & NQF Aligned</span>
              </span>
              <span className="font-mono text-slate-400">v9.0 Revised</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Slide Footer Bar */}
      <footer className="relative z-10 px-6 sm:px-12 py-4 border-t border-white/10 bg-[#042150]/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#45CC42]" />
          <span className="font-semibold text-white">eStudy South Africa</span>
          <span>· Master Course Generation Prompt Template v9.0 (Revised)</span>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          * All fields marked with a red star (*) inside the template are compulsory
        </div>
      </footer>

      {/* Modal: Continue Existing Course (closes on backdrop click) */}
      {showContinueModal && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowContinueModal(false)}
        >
          <div
            className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-fade-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#052B66]">
                  Continue an Existing Course
                </h3>
                <p className="text-xs text-slate-500">
                  Select a saved course from your workspace to continue editing
                </p>
              </div>
              <button
                onClick={() => setShowContinueModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {courses.map(c => {
                const isSelected = c.id === activeCourse.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCourse(c.id);
                      setShowContinueModal(false);
                      onStartBuilding();
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-[#052B66] bg-[#052B66]/5 ring-1 ring-[#052B66]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#052B66] truncate">
                          {c.structure?.title || c.name || 'Untitled Course'}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#45CC42]/20 text-[#052B66]">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {c.structure?.industryDomain || 'General Domain'} · Last modified: {c.lastModified}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#052B66] shrink-0" />
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowContinueModal(false);
                  handleStartNewCourseDirectly();
                }}
                className="text-xs font-bold text-[#052B66] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start a Blank New Course Instead</span>
              </button>
              <button
                onClick={() => setShowContinueModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
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
