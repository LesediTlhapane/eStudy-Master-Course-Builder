import React, { useState, useEffect, useRef } from 'react';
import { Course } from '../types';
import { QAResult } from '../utils/qaEngine';
import { BrandLogo } from './BrandLogo';
import {
  Check,
  ChevronRight,
  Settings,
  Eye,
  Edit3,
  BookOpen,
  Sparkles,
  FileUp,
  Download
} from 'lucide-react';

interface TopBarProps {
  activeView: 'cover' | 'dashboard' | 'builder' | 'preview' | 'ai_generating' | 'generated_course';
  activeCourse?: Course;
  qaResult?: QAResult;
  onNavigate: (view: 'cover' | 'dashboard' | 'builder' | 'preview' | 'ai_generating' | 'generated_course') => void;
  onOpenSettings: () => void;
  onUpdateCourseTitle?: (newTitle: string) => void;
  onStartAIGeneration?: () => void;
  onOpenUploadTemplate?: () => void;
  onOpenExportHub?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  activeCourse,
  qaResult,
  onNavigate,
  onOpenSettings,
  onUpdateCourseTitle,
  onStartAIGeneration,
  onOpenUploadTemplate,
  onOpenExportHub
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeCourse && !isEditingTitle) {
      setTitleValue(activeCourse.structure?.title || (activeCourse.name === 'Untitled Course' ? '' : activeCourse.name) || '');
    }
  }, [activeCourse, isEditingTitle]);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingTitle]);

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    if (onUpdateCourseTitle) {
      onUpdateCourseTitle(titleValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setTitleValue(activeCourse?.structure?.title || (activeCourse?.name === 'Untitled Course' ? '' : activeCourse?.name) || '');
      setIsEditingTitle(false);
    }
  };

  const hasGeneratedCourse = Boolean(activeCourse?.generatedCourse);

  return (
    <header
      id="app-top-bar"
      className="h-16 bg-[#052B66] border-b border-[#042150] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-md"
    >
      {/* Left: Brand Identity & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          id="brand-home-trigger"
          onClick={() => onNavigate('cover')}
          className="cursor-pointer group shrink-0"
          title="Return to Cover Page"
        >
          <BrandLogo variant="white" size="sm" />
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            activeView === 'dashboard'
              ? 'bg-white/15 text-[#45CC42]'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <span>All Courses</span>
        </button>

        {/* Active Course Inline Editable Title */}
        {activeView !== 'dashboard' && activeCourse && (
          <div className="flex items-center gap-2 min-w-0">
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />

            {isEditingTitle ? (
              <div className="flex items-center gap-1.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={titleValue}
                  onChange={e => setTitleValue(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter course title..."
                  className="text-sm font-bold text-[#052B66] bg-white border-2 border-[#45CC42] rounded-lg px-2.5 py-1 focus:outline-none w-48 sm:w-72 transition-all shadow-xs"
                />
              </div>
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                className="group flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/10 cursor-pointer transition-colors min-w-0"
                title="Click to edit course title"
              >
                <span className="text-sm font-bold text-white truncate max-w-[160px] sm:max-w-[260px]">
                  {activeCourse.structure?.title || activeCourse.name || 'Untitled Course'}
                </span>
                <Edit3 className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#45CC42] transition-colors shrink-0" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Upload Existing Template Button */}
        {onOpenUploadTemplate && activeView !== 'ai_generating' && (
          <button
            id="topbar-upload-template-btn"
            onClick={onOpenUploadTemplate}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Upload a PDF, Word (.docx), or Text document to auto-populate template fields"
          >
            <FileUp className="w-3.5 h-3.5 text-[#45CC42]" />
            <span className="hidden sm:inline">Upload Document</span>
          </button>
        )}

        {/* Export / Download Hub Button */}
        {onOpenExportHub && activeView !== 'dashboard' && activeView !== 'ai_generating' && (
          <button
            id="topbar-export-hub-btn"
            onClick={onOpenExportHub}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download Completed Template or Generated Course (PDF & Word)"
          >
            <Download className="w-3.5 h-3.5 text-[#45CC42]" />
            <span className="hidden lg:inline">Downloads</span>
          </button>
        )}

        {/* View Generated Course Button (if already generated) */}
        {activeView !== 'dashboard' && activeView !== 'ai_generating' && hasGeneratedCourse && (
          <button
            id="topbar-view-generated-course-btn"
            onClick={() => onNavigate(activeView === 'generated_course' ? 'builder' : 'generated_course')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeView === 'generated_course'
                ? 'bg-[#45CC42] text-[#052B66] border-[#45CC42] font-bold shadow-xs'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#45CC42]" />
            <span className="hidden md:inline">
              {activeView === 'generated_course' ? 'Back to Template' : 'Generated Course'}
            </span>
          </button>
        )}

        {/* Preview Master Prompt Button */}
        {activeView !== 'dashboard' && activeView !== 'ai_generating' && (
          <button
            id="topbar-preview-prompt-btn"
            onClick={() => onNavigate(activeView === 'preview' ? 'builder' : 'preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'preview'
                ? 'bg-white text-[#052B66] shadow-xs'
                : 'text-white bg-white/10 hover:bg-white/20 border border-white/15'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{activeView === 'preview' ? 'Edit Template' : 'Preview Prompt'}</span>
          </button>
        )}

        {/* Primary CTA: Generate Course with AI */}
        {activeView !== 'dashboard' && activeView !== 'ai_generating' && onStartAIGeneration && (
          <button
            id="topbar-generate-ai-course-btn"
            onClick={onStartAIGeneration}
            className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold text-[#052B66] bg-[#45CC42] hover:bg-[#3db83a] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#052B66]" />
            <span>Generate Course</span>
          </button>
        )}

        {/* Settings Button */}
        <button
          id="topbar-settings-btn"
          onClick={onOpenSettings}
          aria-label="Open Workspace Settings"
          title="Workspace Settings & Backup"
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
