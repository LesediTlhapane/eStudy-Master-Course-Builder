import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { Course } from '../types';
import { Check, Eye, Settings, LayoutDashboard, Sparkles, Download } from 'lucide-react';
import { AppView } from '../hooks/useCourseStore';

interface TopBarProps {
  course: Course;
  view: AppView;
  saveStatus: 'saved' | 'saving';
  onNavigateView: (view: AppView) => void;
  onOpenSettings: () => void;
  onUpdateTitle: (newTitle: string) => void;
  onOpenExportModal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  course,
  view,
  saveStatus,
  onNavigateView,
  onOpenSettings,
  onUpdateTitle,
  onOpenExportModal
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(course.name || course.structure.title);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onUpdateTitle(titleInput.trim());
    } else {
      setTitleInput(course.name);
    }
  };

  return (
    <header
      id="estudy-app-topbar"
      className="h-16 bg-[#052B66] border-b border-[#042150] px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-md font-sora text-white"
    >
      {/* Left: Brand logo & Dashboard link */}
      <div className="flex items-center gap-6">
        <button
          id="topbar-logo-btn"
          onClick={() => onNavigateView('dashboard')}
          className="focus:outline-none hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-2 group"
          title="Return to eStudy Course Builder Dashboard"
        >
          <BrandLogo variant="white" invertText={true} />
        </button>

        <div className="h-6 w-[1px] bg-white/15 hidden sm:block" />

        {/* Quick Dashboard link */}
        <button
          id="topbar-cover-btn"
          onClick={() => onNavigateView('cover')}
          className={`text-xs font-medium px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
            view === 'cover'
              ? 'bg-white/20 text-white font-semibold'
              : 'text-slate-200 hover:text-white hover:bg-white/10'
          }`}
        >
          <span>Cover</span>
        </button>

        <button
          id="topbar-dashboard-btn"
          onClick={() => onNavigateView('dashboard')}
          className={`text-xs font-medium px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
            view === 'dashboard'
              ? 'bg-white/20 text-white font-semibold'
              : 'text-slate-200 hover:text-white hover:bg-white/10'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-[#45CC42]" />
          <span>Dashboard</span>
        </button>

        {course.generatedCourse && (
          <button
            id="topbar-generated-view-btn"
            onClick={() => onNavigateView('generated')}
            className={`text-xs font-bold px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              view === 'generated'
                ? 'bg-[#45CC42] text-[#052B66]'
                : 'text-[#45CC42] bg-[#45CC42]/20 hover:bg-[#45CC42]/30 border border-[#45CC42]/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generated Course</span>
          </button>
        )}
      </div>

      {/* Centre: Current Course Name & Workspace Status */}
      <div className="flex-1 max-w-xl mx-4 text-center">
        {view === 'dashboard' ? (
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">
              eStudy Master Course Generation Workspace
            </h1>
            <p className="text-[11px] text-[#45CC42] font-semibold">
              Universal Framework v9.0
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            {isEditingTitle ? (
              <input
                id="topbar-title-inline-input"
                type="text"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={e => e.key === 'Enter' && handleTitleSubmit()}
                autoFocus
                className="text-sm font-bold text-white text-center border-b-2 border-[#45CC42] bg-white/15 px-2 py-0.5 outline-none rounded shadow-inner"
              />
            ) : (
              <button
                id="topbar-course-title-display"
                onClick={() => {
                  setTitleInput(course.name);
                  setIsEditingTitle(true);
                }}
                className="group flex items-center gap-1.5 cursor-pointer max-w-full"
                title="Click to rename course"
              >
                <span className="text-sm font-bold text-white truncate max-w-md group-hover:text-slate-200 transition-colors">
                  {course.name || course.structure.title || 'Untitled Course'}
                </span>
                <span className="text-[10px] text-slate-300 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                  (edit)
                </span>
              </button>
            )}
            <span className="text-[11px] text-[#45CC42] font-semibold tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#45CC42] shadow-[0_0_4px_rgba(69,204,66,0.8)]" />
              <span>Course workspace</span>
            </span>
          </div>
        )}
      </div>

      {/* Right: Saved status, Preview button, Export button, Settings */}
      <div className="flex items-center gap-2.5">
        {view !== 'dashboard' && (
          <div
            id="topbar-save-status"
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full text-slate-200 bg-white/10 border border-white/15 mr-1"
          >
            {saveStatus === 'saved' ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#45CC42] stroke-[2.5]" />
                <span className="text-white font-medium text-[11px]">Saved ✓</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-300 font-medium text-[11px]">Saving...</span>
              </>
            )}
          </div>
        )}

        {/* Word / PDF Export & AI Engine Selection Button */}
        {onOpenExportModal && (
          <button
            id="topbar-export-btn"
            onClick={onOpenExportModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] shadow-sm transition-all cursor-pointer"
            title="Export to Word (.docx), PDF or send to AI engine with ratings"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export / AI Engine</span>
          </button>
        )}

        {view !== 'preview' ? (
          <button
            id="topbar-preview-btn"
            onClick={() => onNavigateView('preview')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#45CC42]" />
            <span>Prompt Preview</span>
          </button>
        ) : (
          <button
            id="topbar-builder-btn"
            onClick={() => onNavigateView('builder')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#052B66]" />
            <span>Return to Builder</span>
          </button>
        )}

        <button
          id="topbar-settings-btn"
          onClick={onOpenSettings}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-colors cursor-pointer"
          title="Course Workspace Settings & Export"
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>
    </header>
  );
};
