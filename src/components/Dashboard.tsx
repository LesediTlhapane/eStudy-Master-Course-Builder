import React, { useState, useRef } from 'react';
import { Course } from '../types';
import { BrandLogo } from './BrandLogo';
import { CourseTemplateOption, availableTemplates as defaultTemplates } from '../data/initialCourseData';
import { Plus, ArrowRight, BookOpen, Clock, Sparkles, Trash2, CheckCircle2, Layers, Download, Upload, Copy, BookmarkPlus } from 'lucide-react';

interface DashboardProps {
  courses: Course[];
  onSelectCourse: (courseId: string) => void;
  onCreateNew: (title?: string) => void;
  onStartFromMasterTemplate: () => void;
  onStartFromScratch?: (title?: string) => void;
  onContinueFromTemplate?: (templateId: string) => void;
  availableTemplates?: CourseTemplateOption[];
  onDeleteCourse?: (courseId: string) => void;
  onDuplicateCourse?: (courseId: string) => void;
  onSaveAsTemplate?: (courseId: string) => void;
  onExportWorkspace?: () => void;
  onImportWorkspace?: (content: string) => { success: boolean; message: string };
}

export const Dashboard: React.FC<DashboardProps> = ({
  courses,
  onSelectCourse,
  onCreateNew,
  onStartFromMasterTemplate,
  onStartFromScratch,
  onContinueFromTemplate,
  availableTemplates = defaultTemplates,
  onDeleteCourse,
  onDuplicateCourse,
  onSaveAsTemplate,
  onExportWorkspace,
  onImportWorkspace
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [createMode, setCreateMode] = useState<'scratch' | 'template'>('scratch');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(availableTemplates[0]?.id || 'emotional-intelligence-template');
  const [notification, setNotification] = useState<{ text: string; isError?: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (text: string, isError = false) => {
    setNotification({ text, isError });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportWorkspace) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = onImportWorkspace(content);
      showToast(res.message, !res.success);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (createMode === 'scratch') {
      if (onStartFromScratch) {
        onStartFromScratch(newTitle.trim() || undefined);
      } else {
        onCreateNew(newTitle.trim() || undefined);
      }
    } else {
      if (onContinueFromTemplate) {
        onContinueFromTemplate(selectedTemplateId);
      } else {
        onStartFromMasterTemplate();
      }
    }
    setNewTitle('');
    setShowCreateModal(false);
  };

  return (
    <div id="estudy-dashboard-view" className="min-h-[calc(100vh-4rem)] bg-white text-slate-900 py-10 px-4 sm:px-6 lg:px-16 flex flex-col justify-between font-sora">
      <div className="max-w-6xl w-full mx-auto space-y-10">
        {/* Hero Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold font-mono uppercase bg-blue-50 text-[#052B66] px-2.5 py-0.5 rounded border border-blue-200">
                COURSE DESIGN WORKSPACE
              </span>
              <span className="text-xs text-slate-400 font-mono">v9.0 Framework</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#052B66] tracking-tight sm:text-4xl">
              eStudy Course Builder
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 font-normal">
              Build complete, scenario-driven courses from scratch or continue on an existing master template.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="dashboard-start-scratch-header-cta"
              onClick={() => {
                if (onStartFromScratch) onStartFromScratch();
                else setShowCreateModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3db83a] shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>+ Start from Scratch</span>
            </button>

            <button
              id="dashboard-custom-title-btn"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Course Options</span>
            </button>
          </div>
        </div>

        {/* Two-Column Workspace Layout */}
        {notification && (
          <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            notification.isError
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            <span>{notification.text}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-xs opacity-60 hover:opacity-100 cursor-pointer font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".json,application/json"
          className="hidden"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Recent Courses in Workspace */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-[#052B66]">
                  Workspace Courses
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  {courses.length} active course{courses.length !== 1 ? 's' : ''} in workspace (persisted locally)
                </span>
              </div>

              {/* Workspace Backup & Restore Actions */}
              <div className="flex items-center gap-2">
                {onExportWorkspace && (
                  <button
                    onClick={onExportWorkspace}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                    title="Export all workspace courses to a downloadable JSON backup file"
                  >
                    <Download className="w-3.5 h-3.5 text-[#052B66]" />
                    <span>Backup (.json)</span>
                  </button>
                )}

                {onImportWorkspace && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                    title="Restore courses from a JSON backup file"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#052B66]" />
                    <span>Import Backup</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {courses.map(course => {
                const isDraft = course.status === 'Draft';
                const isInReview = course.status === 'In Review';
                const isCompleted = course.status === 'Completed';

                return (
                  <div
                    key={course.id}
                    id={`recent-course-card-${course.id}`}
                    className="p-5 rounded-xl border border-slate-200 bg-white hover:border-[#052B66]/30 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {course.code || 'COURSE'}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#052B66] transition-colors">
                          {course.name || course.structure?.title || 'Untitled Course'}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            isCompleted
                              ? 'text-[#45CC42]'
                              : isInReview
                              ? 'text-amber-600'
                              : 'text-slate-600'
                          }`}
                        >
                          {course.status}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {course.lastModified}
                        </span>
                        {course.structure?.industryDomain && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500 truncate max-w-[150px]">
                              {course.structure.industryDomain}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                      <button
                        id={`open-course-btn-${course.id}`}
                        onClick={() => onSelectCourse(course.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#052B66] bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200"
                      >
                        <span>Open Workspace →</span>
                      </button>

                      {onDuplicateCourse && (
                        <button
                          onClick={() => onDuplicateCourse(course.id)}
                          className="p-1.5 text-slate-400 hover:text-[#052B66] rounded hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Duplicate course into workspace"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onSaveAsTemplate && (
                        <button
                          onClick={() => {
                            onSaveAsTemplate(course.id);
                            showToast(`Saved "${course.name}" to your Course Templates!`);
                          }}
                          className="p-1.5 text-slate-400 hover:text-[#45CC42] rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Save as reusable workspace template"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {courses.length > 1 && onDeleteCourse && (
                        <button
                          onClick={() => onDeleteCourse(course.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Templates Card Options */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-lg font-bold text-[#052B66]">
              Course Templates
            </h2>

            {/* Template Highlight Cards */}
            <div className="space-y-4">
              {availableTemplates.map(tpl => (
                <div
                  key={tpl.id}
                  className="bg-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between border border-slate-800 hover:border-[#45CC42] transition-all"
                >
                  <div className="space-y-2 z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {tpl.badge}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Template</span>
                    </div>

                    <h3 className="text-lg font-extrabold tracking-tight text-white">
                      {tpl.name}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {tpl.description}
                    </p>
                  </div>

                  <div className="pt-5 z-10">
                    <button
                      onClick={() => {
                        if (onContinueFromTemplate) {
                          onContinueFromTemplate(tpl.id);
                        } else {
                          onStartFromMasterTemplate();
                        }
                      }}
                      className="w-full py-2.5 px-4 rounded-lg text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3db83a] transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Continue on this template</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Principle Callout */}
      <div className="max-w-6xl w-full mx-auto pt-14 pb-4 border-t border-slate-100">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-[#052B66]">
            Strict User Intent · Modular 9-Section Course Pipeline
          </h4>
          <p className="text-xs text-slate-500">
            Start completely from scratch or continue on an existing master template.
          </p>
        </div>
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-slate-200 text-slate-900">
            <div>
              <h3 className="text-lg font-bold text-[#052B66]">
                New Course Initiation
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Choose how you want to enter into your instructional workspace.
              </p>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setCreateMode('scratch')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  createMode === 'scratch'
                    ? 'bg-white text-[#052B66] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#45CC42]" />
                <span>Start from Scratch</span>
              </button>

              <button
                type="button"
                onClick={() => setCreateMode('template')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  createMode === 'template'
                    ? 'bg-white text-[#052B66] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#052B66]" />
                <span>Use Template</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {createMode === 'scratch' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course Title (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cybersecurity Incident Handling for Finance Teams"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:border-[#052B66] focus:ring-2 focus:ring-[#052B66]/10 outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Leaves all 9 sections 100% clean and unpopulated for your custom authoring.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Select Starting Template
                  </label>
                  {availableTemplates.map(tpl => (
                    <label
                      key={tpl.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedTemplateId === tpl.id
                          ? 'border-[#052B66] bg-blue-50/50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="templateSelection"
                        checked={selectedTemplateId === tpl.id}
                        onChange={() => setSelectedTemplateId(tpl.id)}
                        className="mt-0.5 text-[#052B66] focus:ring-[#052B66]"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 block">{tpl.name}</span>
                        <span className="text-slate-500 text-[11px]">{tpl.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] cursor-pointer flex items-center gap-1.5"
                >
                  <span>{createMode === 'scratch' ? 'Open Blank Workspace' : 'Load Template'} →</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
