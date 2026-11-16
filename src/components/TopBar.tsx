import React, { useState, useRef, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { Course } from '../types';
import { 
  Check, 
  Eye, 
  Settings, 
  LayoutDashboard, 
  Sparkles, 
  Download, 
  ChevronDown, 
  CheckCircle2, 
  BookOpen, 
  ChevronRight,
  Edit2,
  FileText
} from 'lucide-react';
import { AppView } from '../hooks/useCourseStore';

interface TopBarProps {
  course: Course;
  courses?: Course[];
  onSelectCourse?: (id: string) => void;
  view: AppView;
  saveStatus: 'saved' | 'saving';
  onNavigateView: (view: AppView) => void;
  onOpenSettings: () => void;
  onUpdateTitle: (newTitle: string) => void;
  onOpenExportModal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  course,
  courses = [],
  onSelectCourse,
  view,
  saveStatus,
  onNavigateView,
  onOpenSettings,
  onUpdateTitle,
  onOpenExportModal
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(course.name || course.structure.title);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitleInput(course.name || course.structure?.title);
  }, [course.name, course.structure?.title]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCourseDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onUpdateTitle(titleInput.trim());
    } else {
      setTitleInput(course.name);
    }
  };

  const hasGeneratedCourse = Boolean(course.generatedCourse);

  return (
    <header
      id="estudy-app-topbar"
      className="h-16 bg-[#052B66] border-b border-[#042150] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-md font-sora text-white"
    >
      {/* Left: Brand logo & Navigation Tabs */}
      <div className="flex items-center gap-4 sm:gap-6">
        <button
          id="topbar-logo-btn"
          onClick={() => onNavigateView('cover')}
          className="focus:outline-none hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-2 group"
          title="Return to eStudy Course Builder Cover Page"
        >
          <BrandLogo variant="white" invertText={true} />
        </button>

        <div className="h-5 w-[1px] bg-white/20 hidden md:block" />

        {/* Commercial Pipeline Breadcrumb / Views */}
        <nav className="hidden lg:flex items-center gap-1 text-xs">
          <button
            id="topbar-dashboard-btn"
            onClick={() => onNavigateView('dashboard')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              view === 'dashboard'
                ? 'bg-white/20 text-white font-bold'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#45CC42]" />
            <span>Dashboard</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          <button
            id="topbar-builder-btn"
            onClick={() => onNavigateView('builder')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              view === 'builder'
                ? 'bg-white/20 text-white font-bold'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#45CC42]" />
            <span>1. Course Outline</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          <button
            id="topbar-preview-btn"
            onClick={() => onNavigateView('preview')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              view === 'preview'
                ? 'bg-white/20 text-white font-bold'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-[#45CC42]" />
            <span>2. Master Spec</span>
          </button>

          {hasGeneratedCourse && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <button
                id="topbar-generated-view-btn"
                onClick={() => onNavigateView('generated')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  view === 'generated'
                    ? 'bg-[#45CC42] text-[#052B66]'
                    : 'text-[#45CC42] bg-[#45CC42]/20 hover:bg-[#45CC42]/30 border border-[#45CC42]/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>3. Completed Course</span>
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Centre: Current Active Course Switcher */}
      <div className="flex-1 max-w-md mx-2 sm:mx-4 text-center">
        {view === 'dashboard' ? (
          <div className="hidden sm:block">
            <h2 className="text-xs font-bold text-white tracking-wide uppercase text-slate-300">
              Corporate Learning Workspace
            </h2>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center relative" ref={dropdownRef}>
            <div className="flex items-center gap-1.5 max-w-full">
              {isEditingTitle ? (
                <input
                  id="topbar-title-inline-input"
                  type="text"
                  value={titleInput}
                  onChange={e => setTitleInput(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={e => e.key === 'Enter' && handleTitleSubmit()}
                  autoFocus
                  className="text-xs sm:text-sm font-bold text-white text-center border-b-2 border-[#45CC42] bg-white/15 px-2 py-0.5 outline-none rounded shadow-inner"
                />
              ) : (
                <button
                  id="topbar-course-title-display"
                  onClick={() => {
                    setTitleInput(course.name);
                    setIsEditingTitle(true);
                  }}
                  className="group flex items-center gap-1.5 cursor-pointer max-w-[200px] sm:max-w-xs truncate"
                  title="Click to rename course"
                >
                  <span className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-slate-200 transition-colors">
                    {course.name || course.structure.title || 'Untitled Course'}
                  </span>
                  <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              )}

              {courses.length > 0 && onSelectCourse && (
                <button
                  type="button"
                  id="topbar-course-switcher-toggle"
                  onClick={() => setIsCourseDropdownOpen(prev => !prev)}
                  className="p-1 text-slate-300 hover:text-white hover:bg-white/15 rounded-md transition-colors cursor-pointer shrink-0"
                  title="Switch course"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-[#45CC42]" />
                </button>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[10.5px] text-[#45CC42] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#45CC42]" />
              <span>{course.code || 'EST-COURSE'}</span>
              <span className="text-slate-400 font-normal">·</span>
              <span className="text-slate-300 font-normal">{course.status || 'Draft'}</span>
            </div>

            {/* Course Switcher Dropdown */}
            {isCourseDropdownOpen && courses.length > 0 && (
              <div className="absolute top-full mt-2 w-72 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-left font-sora animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Course
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {courses.map(c => {
                    const isCurrent = c.id === course.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          if (onSelectCourse) onSelectCourse(c.id);
                          setIsCourseDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                          isCurrent ? 'bg-[#052B66]/5 font-bold text-[#052B66]' : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="truncate font-semibold">{c.name || c.structure?.title || 'Untitled Course'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{c.code || 'EST-COURSE'}</div>
                        </div>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-[#45CC42] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <div className="pt-1.5 border-t border-slate-100 px-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCourseDropdownOpen(false);
                      onNavigateView('dashboard');
                    }}
                    className="w-full text-center py-1.5 text-xs font-bold text-[#052B66] hover:text-blue-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    + Manage All in Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Save Status, Primary Action (Export / AI Engine), Settings */}
      <div className="flex items-center gap-2">
        {view !== 'dashboard' && (
          <div
            id="topbar-save-status"
            className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full text-slate-200 bg-white/10 border border-white/15"
          >
            {saveStatus === 'saved' ? (
              <>
                <Check className="w-3 h-3 text-[#45CC42] stroke-[3]" />
                <span className="text-white">Auto-saved</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-300">Saving...</span>
              </>
            )}
          </div>
        )}

        {/* Primary AI & Export Button */}
        {onOpenExportModal && (
          <button
            id="topbar-export-btn"
            onClick={onOpenExportModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] shadow-sm transition-all cursor-pointer"
            title="Generate with AI or Export Word / PDF"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#052B66]" />
            <span className="hidden sm:inline">AI Generation & Export</span>
            <span className="sm:hidden">Generate</span>
          </button>
        )}

        <button
          id="topbar-settings-btn"
          onClick={onOpenSettings}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Settings & Workspace Management"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
