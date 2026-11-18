import React, { useState } from 'react';
import { Course } from '../types';
import { evaluateCourseQA } from '../utils/qaEngine';
import {
  Plus,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Trash2,
  Sparkles,
  FileUp,
  FileText
} from 'lucide-react';

interface DashboardProps {
  courses: Course[];
  activeCourseId: string;
  customTemplates?: any[];
  onSelectCourse: (courseId: string) => void;
  onCreateNewCourse: (title: string, templateId?: string) => void;
  onSaveAsTemplate?: (course: Course, name: string, badge: string, description: string) => void;
  onDeleteCustomTemplate?: (id: string) => void;
  onDeleteCourse: (courseId: string) => void;
  onOpenBuilder: () => void;
  onOpenQuickAI?: () => void;
  onOpenUploadTemplate?: () => void;
  onViewGeneratedCourse?: (courseId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  courses,
  activeCourseId,
  onSelectCourse,
  onCreateNewCourse,
  onDeleteCourse,
  onOpenBuilder,
  onOpenUploadTemplate,
  onViewGeneratedCourse
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleCreateNewDirectly = () => {
    onCreateNewCourse('', 'master-template-v9');
  };

  return (
    <div id="dashboard-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sora">
      {/* Top Simplified Hero Banner (Requirement 2) */}
      <div className="bg-[#052B66] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-[#042150]">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#45CC42] backdrop-blur-xs border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-[#45CC42]" />
            <span>eStudy South Africa · Official Master Course Template v9.0</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            Master Course Builder Workspace
          </h1>

          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Start a new course directly in the official 9-section eStudy Master Course Template, upload an existing document (PDF or Word) to automatically populate template fields, or continue working on a saved course below.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {/* Primary Action: Create New Course Directly */}
            <button
              id="dashboard-create-course-btn"
              onClick={handleCreateNewDirectly}
              className="px-6 py-3.5 rounded-xl bg-[#45CC42] hover:bg-[#3db83a] text-[#052B66] font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create New Course</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Secondary Action: Upload Existing Course Template / Document */}
            {onOpenUploadTemplate && (
              <button
                id="dashboard-upload-template-btn"
                onClick={onOpenUploadTemplate}
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-[#052B66] font-extrabold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <FileUp className="w-4 h-4 text-[#052B66]" />
                <span>Upload Existing Course Document (PDF / DOCX)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Saved Courses List (Continue an Existing Course) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#052B66]">
              Saved Courses ({courses.length})
            </h2>
            <p className="text-xs text-slate-500">
              Select any course below to continue completing the template or view its generated training course
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map(course => {
            const qa = evaluateCourseQA(course);
            const isSelected = course.id === activeCourseId;

            return (
              <div
                key={course.id}
                onClick={() => {
                  onSelectCourse(course.id);
                  onOpenBuilder();
                }}
                className={`group bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between p-6 cursor-pointer relative ${
                  isSelected
                    ? 'border-[#052B66] ring-2 ring-[#052B66]/10 shadow-md'
                    : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Badges & Delete */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {course.code && (
                        <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {course.code}
                        </span>
                      )}
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          course.generatedCourse
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-[#052B66] border border-blue-200'
                        }`}
                      >
                        {course.generatedCourse ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-[#052B66]" />
                        )}
                        <span>{course.generatedCourse ? 'Course Generated' : 'Template in Progress'}</span>
                      </span>
                    </div>

                    {courses.length > 1 && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setConfirmDeleteId(course.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Course Title & Purpose */}
                  <div className="space-y-1.5">
                    <h3 className="text-base font-extrabold text-[#052B66] group-hover:text-[#042150] transition-colors line-clamp-2">
                      {course.structure?.title || course.name || 'Untitled Course'}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {course.structure?.purposeStatement ||
                        (course.problem?.taskOrSkill
                          ? `Addresses: ${course.problem.taskOrSkill}`
                          : 'Click to open and complete the 9-section master template.')}
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">Template Readiness</span>
                      <span className="font-bold font-mono text-[#052B66]">{qa.scorePercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#45CC42] rounded-full transition-all"
                        style={{ width: `${qa.scorePercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onSelectCourse(course.id);
                      onOpenBuilder();
                    }}
                    className="text-xs font-extrabold text-[#052B66] hover:text-[#45CC42] flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {course.generatedCourse && onViewGeneratedCourse && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onViewGeneratedCourse(course.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#45CC42]/20 hover:bg-[#45CC42]/30 text-[#052B66] font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      <span>View Generated Course</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal (closes on backdrop click) */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-extrabold text-slate-900">Delete Saved Course?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently remove this course from your workspace? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteCourse(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer"
              >
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
