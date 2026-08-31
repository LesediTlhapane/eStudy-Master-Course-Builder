import React, { useState } from 'react';
import { Course } from '../types';
import { BrandLogo } from './BrandLogo';
import { Plus, ArrowRight, BookOpen, Clock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface DashboardProps {
  courses: Course[];
  onSelectCourse: (courseId: string) => void;
  onCreateNew: (title?: string) => void;
  onStartFromMasterTemplate: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  courses,
  onSelectCourse,
  onCreateNew,
  onStartFromMasterTemplate
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onCreateNew(newTitle.trim());
      setNewTitle('');
      setShowCreateModal(false);
    }
  };

  return (
    <div id="estudy-dashboard-view" className="min-h-[calc(100vh-4rem)] bg-white text-slate-900 py-12 px-6 lg:px-16 flex flex-col justify-between">
      <div className="max-w-6xl w-full mx-auto space-y-12">
        {/* Hero Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#052B66] tracking-tight sm:text-4xl">
              eStudy Course Builder
            </h1>
            <p className="mt-2 text-base text-slate-600 font-normal">
              Build complete, scenario-driven courses through one guided framework.
            </p>
          </div>

          <button
            id="dashboard-create-new-course-cta"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white bg-[#45CC42] hover:bg-[#3db83a] shadow-sm hover:shadow transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Create New Course</span>
          </button>
        </div>

        {/* Two-Column Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Recent Courses */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#052B66]">
                Recent Courses
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {courses.length} active course{courses.length !== 1 ? 's' : ''}
              </span>
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
                    className="p-5 rounded-xl border border-slate-200 bg-white hover:border-[#052B66]/30 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1 max-w-md">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#052B66] transition-colors">
                        {course.name || course.structure.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
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
                          {isDraft && ' · 86% complete'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {course.lastModified}
                        </span>
                      </div>
                    </div>

                    <button
                      id={`open-course-btn-${course.id}`}
                      onClick={() => onSelectCourse(course.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#052B66] hover:text-[#45CC42] transition-colors self-start sm:self-center cursor-pointer"
                    >
                      <span>
                        {isDraft ? 'Continue building →' : isInReview ? 'Open course →' : 'View course →'}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Master Template Card */}
          <div className="lg:col-span-5">
            <div
              id="master-template-highlight-card"
              className="bg-[#052B66] rounded-2xl p-7 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[300px]"
            >
              {/* Pin Logo in Top Right */}
              <div className="absolute top-6 right-6">
                <BrandLogo variant="icon" size="lg" />
              </div>

              <div className="space-y-4 max-w-xs z-10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  MASTER TEMPLATE
                </span>

                <h3 className="text-2xl font-extrabold tracking-tight leading-snug">
                  eStudy Master Course Generation Prompt <br />
                  <span className="text-[#45CC42]">v9.0</span>
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  The trusted structure behind every course you build.
                </p>
              </div>

              <div className="pt-8 z-10">
                <button
                  id="dashboard-start-master-template-cta"
                  onClick={onStartFromMasterTemplate}
                  className="w-full py-3.5 px-5 rounded-lg text-sm font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3db83a] transition-all flex items-center justify-center gap-2 shadow hover:shadow-md cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Start from master template</span>
                </button>
              </div>

              {/* Decorative Subtle Ring */}
              <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Principle Callout */}
      <div className="max-w-6xl w-full mx-auto pt-16 pb-4 border-t border-slate-100">
        <div className="space-y-1">
          <h4 className="text-base font-bold text-[#052B66]">
            Complex framework → simple workflow
          </h4>
          <p className="text-xs text-slate-500">
            Nine guided sections. One complete, generation-ready course specification.
          </p>
        </div>
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-5 border border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-[#052B66]">
                Create New Course
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your course title. You will be guided through the 9-section master framework.
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Generative AI for Customer Service Teams"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-[#052B66] focus:ring-2 focus:ring-[#052B66]/10 outline-none"
                />
              </div>

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
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] cursor-pointer"
                >
                  Create & Begin →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
