import React, { useState, useRef, useMemo } from 'react';
import { Course } from '../types';
import { BrandLogo } from './BrandLogo';
import { CourseTemplateOption, availableTemplates as defaultTemplates } from '../data/initialCourseData';
import { 
  Plus, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  Sparkles, 
  Trash2, 
  CheckCircle2, 
  Layers, 
  Download, 
  Upload, 
  Copy, 
  BookmarkPlus,
  Search,
  SlidersHorizontal,
  Compass,
  Briefcase,
  ShieldCheck,
  Award,
  ChevronRight,
  FileText,
  Zap
} from 'lucide-react';
import { QuickAICourseModal, QuickCourseFormData } from './QuickAICourseModal';
import { AIProvider } from '../types';

interface DashboardProps {
  courses: Course[];
  onSelectCourse: (courseId: string) => void;
  onCreateNew: (title?: string) => void;
  onStartFromMasterTemplate: () => void;
  onStartFromScratch?: (title?: string) => void;
  onContinueFromTemplate?: (templateId: string) => void;
  onCreateQuickCourse?: (
    payload: {
      title: string;
      description: string;
      targetAudience: string;
      industryDomain: string;
      difficultyLevel: string;
      estimatedDuration: string;
      learningObjectives?: string[];
      templateId?: string;
    },
    options?: {
      generateImmediately?: boolean;
      provider?: AIProvider;
      model?: string;
    }
  ) => void;
  defaultProvider?: AIProvider;
  defaultModel?: string;
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
  onCreateQuickCourse,
  defaultProvider = 'gemini',
  defaultModel,
  availableTemplates = defaultTemplates,
  onDeleteCourse,
  onDuplicateCourse,
  onSaveAsTemplate,
  onExportWorkspace,
  onImportWorkspace
}) => {
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [quickModalTemplateId, setQuickModalTemplateId] = useState<string | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [industryDomain, setIndustryDomain] = useState('Corporate Enterprise & Operations');
  const [createMode, setCreateMode] = useState<'scratch' | 'template'>('scratch');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(availableTemplates[0]?.id || 'emotional-intelligence-template');
  const [notification, setNotification] = useState<{ text: string; isError?: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Draft' | 'In Review' | 'Completed'>('all');
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
    const finalTitle = newTitle.trim() || undefined;

    if (createMode === 'scratch') {
      if (onStartFromScratch) {
        onStartFromScratch(finalTitle);
      } else {
        onCreateNew(finalTitle);
      }
    } else {
      if (onContinueFromTemplate) {
        onContinueFromTemplate(selectedTemplateId);
      } else {
        onStartFromMasterTemplate();
      }
    }
    setNewTitle('');
    setTargetAudience('');
    setShowCreateModal(false);
  };

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = 
        (course.name && course.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (course.structure?.title && course.structure.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (course.code && course.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (course.structure?.industryDomain && course.structure.industryDomain.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [courses, searchQuery, statusFilter]);

  return (
    <div id="estudy-dashboard-view" className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-12 flex flex-col justify-between font-sora">
      <div className="max-w-7xl w-full mx-auto space-y-8">
        
        {/* Commercial Hero & Value Proposition */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#052B66] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                Enterprise AI Course Builder
              </span>
              <span className="text-xs text-slate-400 font-mono">v9.0 Master Architecture</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#052B66] tracking-tight">
              Create Structured, Accredited Corporate Learning in Minutes
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Design comprehensive, scenario-driven corporate courses with verified POPIA and regulatory compliance. Build from a tailored outline or generate immediately using high-performance AI engines.
            </p>

            {/* Natural 4-Step Client Journey Indicator */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-medium text-slate-600">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="w-4 h-4 rounded-full bg-[#052B66] text-white flex items-center justify-center font-bold text-[10px]">1</span>
                <span>Choose or Create</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="w-4 h-4 rounded-full bg-[#052B66] text-white flex items-center justify-center font-bold text-[10px]">2</span>
                <span>Set Key Details</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="w-4 h-4 rounded-full bg-[#45CC42] text-[#052B66] flex items-center justify-center font-bold text-[10px]">3</span>
                <span>AI Generates</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-[10px]">4</span>
                <span>Review & Export</span>
              </div>
            </div>
          </div>

          {/* Primary Call to Action */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 lg:w-72">
            <button
              id="dashboard-quick-ai-creator-cta"
              onClick={() => {
                setQuickModalTemplateId(undefined);
                setShowQuickModal(true);
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-xs font-black text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] shadow-md hover:shadow-lg transition-all cursor-pointer ring-2 ring-[#45CC42]/40"
            >
              <Sparkles className="w-4 h-4 text-[#052B66] stroke-[2.5]" />
              <div className="text-left flex-1">
                <div className="text-[12px] font-black uppercase tracking-tight flex items-center justify-between">
                  <span>Quick AI Creator</span>
                  <span className="text-[9px] bg-[#052B66] text-[#45CC42] px-1.5 py-0.2 rounded font-mono font-bold">Fast</span>
                </div>
                <div className="text-[10px] font-semibold text-[#052B66]/80 font-mono">Option A • Complete Course in 60s</div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#052B66]" />
            </button>

            <button
              id="dashboard-start-scratch-header-cta"
              onClick={() => setShowCreateModal(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-[#052B66]" />
              <span>Option B: Advanced 9-Section Builder</span>
            </button>

            <button
              onClick={onStartFromMasterTemplate}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Load Master Benchmark Course</span>
            </button>

            <div className="flex items-center justify-center gap-2 pt-0.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero-code, ready for LMS</span>
            </div>
          </div>
        </div>

        {/* Quick AI Course Creation Highlight Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-[#052B66] to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-blue-800/60 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#45CC42] bg-[#45CC42]/15 px-2.5 py-0.5 rounded border border-[#45CC42]/30">
                Recommended for Corporate Clients
              </span>
              <span className="text-xs text-blue-200/70 font-mono">Option A</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Need a Complete Accredited Course in One Click?
            </h2>
            <p className="text-xs text-slate-200 leading-relaxed">
              Enter your course title, target learners, and industry. Our AI automatically maps your inputs into the 9-section instructional design framework, creates workplace scenarios, and constructs comprehensive assessments.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => {
                setQuickModalTemplateId(undefined);
                setShowQuickModal(true);
              }}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#052B66] stroke-[2.5]" />
              <span>Launch Quick AI Creator</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#052B66]" />
            </button>
          </div>
        </div>

        {/* Global Notifications */}
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

        {/* Main Content: Workspace Courses & Templates */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Client Courses List with Search & Filtering */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Header with Search and Backup Actions */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-[#052B66]">
                    Your Course Workspace
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {courses.length} course{courses.length !== 1 ? 's' : ''} saved in your local workspace
                  </p>
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
                      <span>Backup</span>
                    </button>
                  )}

                  {onImportWorkspace && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                      title="Restore courses from a JSON backup file"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#052B66]" />
                      <span>Import</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Search Bar & Filter Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-slate-100">
                <div className="relative flex-1 w-full">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search courses by name, code or industry..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#052B66] focus:ring-1 focus:ring-[#052B66]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs self-stretch sm:self-auto">
                  <span className="text-[11px] text-slate-400 font-medium">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e: any) => setStatusFilter(e.target.value)}
                    className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#052B66]"
                  >
                    <option value="all">All</option>
                    <option value="Draft">Draft</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Courses List */}
            <div className="space-y-3">
              {filteredCourses.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-700">No matching courses found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try adjusting your search criteria or create a new course to get started.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Course</span>
                  </button>
                </div>
              ) : (
                filteredCourses.map(course => {
                  const isDraft = course.status === 'Draft';
                  const isInReview = course.status === 'In Review';
                  const isCompleted = course.status === 'Completed';
                  const hasGenerated = Boolean(course.generatedCourse);

                  return (
                    <div
                      key={course.id}
                      id={`recent-course-card-${course.id}`}
                      className="p-5 rounded-xl border border-slate-200/90 bg-white hover:border-[#052B66]/40 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="space-y-2 max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {course.code || 'COURSE'}
                          </span>

                          {hasGenerated ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>AI Generated</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#052B66] border border-blue-200">
                              Outline Ready
                            </span>
                          )}

                          <span className={`text-[11px] font-semibold ${
                            isCompleted ? 'text-emerald-700' : isInReview ? 'text-amber-600' : 'text-slate-500'
                          }`}>
                            {course.status}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#052B66] transition-colors">
                          {course.name || course.structure?.title || 'Untitled Course'}
                        </h3>

                        <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {course.lastModified}
                          </span>
                          <span>•</span>
                          <span>{course.modules?.length || 3} Modules</span>
                          {course.structure?.industryDomain && (
                            <>
                              <span>•</span>
                              <span className="text-slate-600 truncate max-w-[160px]">
                                {course.structure.industryDomain}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Course Card Actions */}
                      <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                        <button
                          id={`open-course-btn-${course.id}`}
                          onClick={() => onSelectCourse(course.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-[#052B66] bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200 shadow-2xs"
                        >
                          <span>{hasGenerated ? 'View Course' : 'Open Builder'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        {onDuplicateCourse && (
                          <button
                            onClick={() => onDuplicateCourse(course.id)}
                            className="p-2 text-slate-400 hover:text-[#052B66] rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Duplicate course"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onSaveAsTemplate && (
                          <button
                            onClick={() => {
                              onSaveAsTemplate(course.id);
                              showToast(`Saved "${course.name}" to your templates!`);
                            }}
                            className="p-2 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Save as reusable workspace template"
                          >
                            <BookmarkPlus className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {courses.length > 1 && onDeleteCourse && (
                          <button
                            onClick={() => onDeleteCourse(course.id)}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Pre-Configured Commercial Templates */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <div>
                <h2 className="text-base font-bold text-[#052B66]">
                  Pre-Built Course Templates
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Instant corporate frameworks ready to customize
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {availableTemplates.length} available
              </span>
            </div>

            {/* Template Highlight Cards */}
            <div className="space-y-3.5">
              {availableTemplates.map(tpl => (
                <div
                  key={tpl.id}
                  className="bg-white rounded-xl p-5 border border-slate-200 hover:border-[#052B66]/50 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#052B66] border border-blue-200">
                        {tpl.badge}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">Enterprise Ready</span>
                    </div>

                    <h3 className="text-sm font-extrabold text-[#052B66] group-hover:text-blue-900 transition-colors">
                      {tpl.name}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {tpl.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>POPIA & Bloom's Aligned</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setQuickModalTemplateId(tpl.id);
                          setShowQuickModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="Customize outline and generate complete course with AI"
                      >
                        <Sparkles className="w-3 h-3 text-[#052B66]" />
                        <span>Quick AI Generate</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onContinueFromTemplate) {
                            onContinueFromTemplate(tpl.id);
                          } else {
                            onStartFromMasterTemplate();
                          }
                        }}
                        className="px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Open directly in Advanced 9-Section Builder"
                      >
                        <span>Builder →</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Client-Friendly Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-6 border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#052B66] bg-blue-50 px-2 py-0.5 rounded">
                  New Course Wizard
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#052B66]">
                Create a New Course
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure basic parameters now. You can adjust details or immediately generate with AI.
              </p>
            </div>

            {/* Mode Switcher */}
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
                <span>Custom Course</span>
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
                <span>Start from Template</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {createMode === 'scratch' ? (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Course Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Workplace Cybersecurity & POPIA Data Protection"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      autoFocus
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-[#052B66] focus:ring-2 focus:ring-[#052B66]/10 outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Give your course a clear, business-oriented title.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target Audience / Department (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Finance team leads, customer consultants, and operational staff"
                      value={targetAudience}
                      onChange={e => setTargetAudience(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:border-[#052B66] focus:ring-1 focus:ring-[#052B66] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Industry / Sector
                    </label>
                    <select
                      value={industryDomain}
                      onChange={e => setIndustryDomain(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white focus:border-[#052B66] focus:ring-1 focus:ring-[#052B66] outline-none"
                    >
                      <option value="Corporate Enterprise & Operations">Corporate Enterprise & Operations</option>
                      <option value="Banking, Finance & Insurance">Banking, Finance & Insurance</option>
                      <option value="Information Technology & Cyber">Information Technology & Cyber</option>
                      <option value="Healthcare & Pharmaceutical">Healthcare & Pharmaceutical</option>
                      <option value="Retail, Supply Chain & Logistics">Retail, Supply Chain & Logistics</option>
                      <option value="Public Sector & Governance">Public Sector & Governance</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Select Corporate Template
                  </label>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {availableTemplates.map(tpl => (
                      <label
                        key={tpl.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedTemplateId === tpl.id
                            ? 'border-[#052B66] bg-blue-50/60 ring-2 ring-[#052B66]/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
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
                          <span className="text-slate-500 text-[11px] leading-tight block">{tpl.description}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>{createMode === 'scratch' ? 'Launch Course Workspace' : 'Load Template'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick AI Course Creation Modal (Option A) */}
      <QuickAICourseModal
        isOpen={showQuickModal}
        onClose={() => {
          setShowQuickModal(false);
          setQuickModalTemplateId(undefined);
        }}
        availableTemplates={availableTemplates}
        initialTemplateId={quickModalTemplateId}
        defaultProvider={defaultProvider}
        defaultModel={defaultModel}
        onCreateAndGenerate={data => {
          if (onCreateQuickCourse) {
            onCreateQuickCourse(data, {
              generateImmediately: true,
              provider: data.provider,
              model: data.model
            });
          } else if (onStartFromScratch) {
            onStartFromScratch(data.title);
          }
          setShowQuickModal(false);
        }}
        onOpenAdvancedBuilder={data => {
          if (onCreateQuickCourse) {
            onCreateQuickCourse(data, {
              generateImmediately: false
            });
          } else if (onStartFromScratch) {
            onStartFromScratch(data.title);
          }
          setShowQuickModal(false);
        }}
      />
    </div>
  );
};
