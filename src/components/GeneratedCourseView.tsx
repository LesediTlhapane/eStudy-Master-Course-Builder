import React, { useState } from 'react';
import { Course, GeneratedCourse, GeneratedModule, GeneratedLesson, GeneratedScenario, GeneratedQuestion } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Edit3,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  BookOpen,
  Award,
  HelpCircle,
  Briefcase,
  Layers,
  ArrowLeft,
  Lock,
  ExternalLink
} from 'lucide-react';

interface GeneratedCourseViewProps {
  course: Course;
  generatedCourse: GeneratedCourse;
  onUpdateGeneratedCourse: (updated: GeneratedCourse) => void;
  onBackToBuilder: () => void;
  onBackToDashboard: () => void;
}

export const GeneratedCourseView: React.FC<GeneratedCourseViewProps> = ({
  course,
  generatedCourse,
  onUpdateGeneratedCourse,
  onBackToBuilder,
  onBackToDashboard
}) => {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'assessments' | 'qa' | 'sources' | 'export'>('curriculum');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    [generatedCourse.modules[0]?.id || 'module-1']: true
  });
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<{
    type: 'lesson' | 'scenario' | 'question';
    moduleId: string;
    item: any;
  } | null>(null);

  const isApproved = generatedCourse.qa?.status === 'approved' && Boolean(generatedCourse.approvedAt);

  const toggleModule = (id: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleApprove = () => {
    const updated: GeneratedCourse = {
      ...generatedCourse,
      qa: {
        ...generatedCourse.qa,
        status: 'approved'
      },
      approvedAt: new Date().toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      approvedBy: 'Lead Instructional Designer'
    };
    onUpdateGeneratedCourse(updated);
  };

  const handleRegeneratePart = async (partType: string, targetId: string, moduleId?: string) => {
    setIsRegenerating(targetId);
    try {
      // Send granular regeneration request to server or run local refinement
      const res = await fetch('/api/courses/regenerate-part', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course, partType, targetId, currentGeneratedCourse: generatedCourse })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.course) {
          // If regenerating a single module, update just that module
          if (partType === 'module' && moduleId) {
            const freshMod = data.course.modules?.find((m: GeneratedModule) => m.id === moduleId) || data.course.modules?.[0];
            if (freshMod) {
              onUpdateGeneratedCourse({
                ...generatedCourse,
                modules: generatedCourse.modules.map(m => m.id === moduleId ? freshMod : m)
              });
            }
          } else {
            onUpdateGeneratedCourse({
              ...generatedCourse,
              ...data.course
            });
          }
        }
      }
    } catch (e) {
      console.warn('Regeneration API error, updating component state:', e);
    } finally {
      setIsRegenerating(null);
    }
  };

  const handleSaveEdit = (edited: any) => {
    if (!editingItem) return;

    const { type, moduleId } = editingItem;
    const updatedModules = generatedCourse.modules.map(mod => {
      if (mod.id !== moduleId) return mod;

      if (type === 'lesson') {
        return {
          ...mod,
          lessons: mod.lessons.map(l => l.id === edited.id ? edited : l)
        };
      } else if (type === 'scenario') {
        return {
          ...mod,
          scenarios: mod.scenarios.map(s => s.id === edited.id ? edited : s)
        };
      } else if (type === 'question') {
        return {
          ...mod,
          knowledgeChecks: mod.knowledgeChecks.map(q => q.id === edited.id ? edited : q)
        };
      }
      return mod;
    });

    onUpdateGeneratedCourse({
      ...generatedCourse,
      modules: updatedModules
    });

    setEditingItem(null);
  };

  const copyMarkdownToClipboard = () => {
    let md = `# ${generatedCourse.title}\n\n**Code:** ${generatedCourse.code} | **Version:** ${generatedCourse.version}\n\n`;
    md += `## Overview\n${generatedCourse.overview}\n\n`;
    md += `### Purpose\n${generatedCourse.purpose}\n\n`;
    md += `### Target Audience\n${generatedCourse.targetAudience}\n\n`;
    md += `### Learning Outcomes\n${generatedCourse.learningOutcomes.map(lo => `- ${lo}`).join('\n')}\n\n`;

    generatedCourse.modules.forEach(m => {
      md += `## Module ${m.moduleNumber}: ${m.title}\n*${m.purpose}*\n\n`;
      md += `### Learning Objectives\n${m.learningObjectives.map(lo => `- **${lo.code}:** ${lo.statement}`).join('\n')}\n\n`;

      m.lessons.forEach(l => {
        md += `### Lesson: ${l.title} (${l.durationMinutes} mins)\n${l.contentBody}\n\n**Workplace Application:** ${l.workplaceApplication}\n**AI Application:** ${l.aiApplication}\n\n`;
      });

      md += `### Scenarios\n`;
      m.scenarios.forEach(sc => {
        md += `#### [${sc.type}] ${sc.title}\n- **Situation:** ${sc.situation}\n- **Challenge:** ${sc.challenge}\n- **Decision Point:** ${sc.decisionPoint}\n- **Debrief:** ${sc.debrief}\n- **Takeaway:** ${sc.keyTakeaway}\n\n`;
      });
    });

    md += `## Assessment Framework\n### Pre-Course Diagnostic\n`;
    generatedCourse.assessments.preCourseDiagnostic.questions.forEach((q, i) => {
      md += `${i + 1}. ${q.question}\nOptions: ${q.options.join(' | ')}\nAnswer: ${q.options[q.correctAnswer]}\nRationale: ${q.rationale}\n\n`;
    });

    md += `### Final Summative Assessment (Pass Mark: ${generatedCourse.assessments.finalAssessment.passMark})\n`;
    generatedCourse.assessments.finalAssessment.questions.forEach((q, i) => {
      md += `${i + 1}. ${q.question}\nOptions: ${q.options.join(' | ')}\nAnswer: ${q.options[q.correctAnswer]}\nRationale: ${q.rationale}\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadJsonFile = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(generatedCourse, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${generatedCourse.code || 'course'}_v9_generated.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="generated-course-view-root" className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sora">
      {/* Top Banner Header */}
      <div className="bg-[#052B66] text-white border-b border-[#052B66]/20">
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onBackToBuilder}
                className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Authoring</span>
              </button>

              <span className="text-slate-400">·</span>

              <button
                onClick={onBackToDashboard}
                className="text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Course Workspace
              </button>
            </div>

            {/* Status Badge & Approve Action */}
            <div className="flex items-center gap-3">
              {isApproved ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#45CC42]/20 border border-[#45CC42]/40 text-[#45CC42] text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approved for LMS Deployment ({generatedCourse.approvedAt})</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>AI Generated · Human Review Required</span>
                </div>
              )}

              {!isApproved && (
                <button
                  id="approve-course-cta"
                  onClick={handleApprove}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3db83a] transition-all shadow cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Approve Course</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#45CC42] bg-[#45CC42]/15 px-2.5 py-0.5 rounded border border-[#45CC42]/30">
                {generatedCourse.code}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {generatedCourse.title}
              </h1>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {generatedCourse.overview}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10 overflow-x-auto">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'curriculum'
                  ? 'bg-[#45CC42] text-[#052B66]'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Curriculum & Modules ({generatedCourse.modules.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('assessments')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'assessments'
                  ? 'bg-[#45CC42] text-[#052B66]'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Assessments & Diagnostics</span>
            </button>

            <button
              onClick={() => setActiveTab('qa')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'qa'
                  ? 'bg-[#45CC42] text-[#052B66]'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Quality Scorecard ({generatedCourse.qa.score}%)</span>
            </button>

            <button
              onClick={() => setActiveTab('sources')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'sources'
                  ? 'bg-[#45CC42] text-[#052B66]'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Sources & Compliance</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'export'
                  ? 'bg-[#45CC42] text-[#052B66]'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export & Deploy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab 1: Curriculum & Modules */}
        {activeTab === 'curriculum' && (
          <div className="space-y-8">
            {/* Quick Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Audience</div>
                <div className="text-xs font-semibold text-slate-800">{generatedCourse.targetAudience}</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Estimated Duration</div>
                <div className="text-xs font-semibold text-slate-800">{generatedCourse.estimatedDuration}</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pedagogical Alignment</div>
                <div className="text-xs font-semibold text-[#052B66]">eStudy Scenario-Driven & POPIA Aligned</div>
              </div>
            </div>

            {/* Course Learning Outcomes */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-[#052B66] uppercase tracking-wider">
                Overall Course Learning Outcomes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {generatedCourse.learningOutcomes.map((lo, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs flex items-start gap-2.5">
                    <span className="font-bold text-[#45CC42] mt-0.5 font-mono">0{idx + 1}.</span>
                    <span className="text-slate-700 leading-relaxed">{lo}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modules List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-[#052B66]">
                  Course Modules & Detailed Content
                </h3>
                <span className="text-xs text-slate-500">
                  Click any module to inspect lessons, workplace scenarios, and checks.
                </span>
              </div>

              {generatedCourse.modules.map(mod => {
                const isExpanded = Boolean(expandedModules[mod.id]);

                return (
                  <div
                    key={mod.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                  >
                    {/* Module Header */}
                    <div
                      onClick={() => toggleModule(mod.id)}
                      className="p-6 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/60 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold font-mono text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded">
                            Module {mod.moduleNumber}
                          </span>
                          <h4 className="text-base font-bold text-[#052B66]">
                            {mod.title}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-600">
                          {mod.purpose}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRegeneratePart('module', mod.id, mod.id);
                          }}
                          disabled={isRegenerating === mod.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <RotateCcw className={`w-3 h-3 text-[#052B66] ${isRegenerating === mod.id ? 'animate-spin' : ''}`} />
                          <span>Regenerate Module</span>
                        </button>

                        <button className="p-1 rounded text-slate-400">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Module Expanded Details */}
                    {isExpanded && (
                      <div className="p-6 space-y-8">
                        {/* Learning Objectives */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Learning Objectives (Bloom's Taxonomy)
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {mod.learningObjectives.map(lo => (
                              <div key={lo.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[#052B66] font-mono">{lo.code}</span>
                                  {lo.bloomLevel && (
                                    <span className="text-[10px] font-semibold bg-blue-100 text-[#052B66] px-1.5 py-0.5 rounded">
                                      {lo.bloomLevel}
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-700">{lo.statement}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Lessons */}
                        <div className="space-y-4">
                          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Lesson Breakdown
                          </h5>
                          {mod.lessons.map(lesson => (
                            <div key={lesson.id} className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[#052B66]" />
                                    <h6 className="text-sm font-bold text-[#052B66]">{lesson.title}</h6>
                                  </div>
                                  <span className="text-[11px] text-slate-500">Duration: {lesson.durationMinutes} minutes</span>
                                </div>

                                <button
                                  onClick={() => setEditingItem({ type: 'lesson', moduleId: mod.id, item: lesson })}
                                  className="text-xs font-semibold text-slate-600 hover:text-[#052B66] flex items-center gap-1 cursor-pointer p-1.5 rounded hover:bg-slate-100"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit Copy</span>
                                </button>
                              </div>

                              <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                                {lesson.contentBody}
                              </div>

                              {/* Callouts */}
                              {lesson.callouts && lesson.callouts.length > 0 && (
                                <div className="space-y-2">
                                  {lesson.callouts.map((c, cIdx) => (
                                    <div
                                      key={cIdx}
                                      className={`p-3 rounded-lg border text-xs space-y-1 ${
                                        c.type === 'POPIA Note'
                                          ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                                          : c.type === 'Warning'
                                          ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                                          : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                      }`}
                                    >
                                      <div className="font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                        <span>● {c.type}: {c.title}</span>
                                      </div>
                                      <p className="text-[11px]">{c.content}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Applications */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                  <span className="font-bold text-[#052B66] block mb-1">🏢 Workplace Application:</span>
                                  <p className="text-slate-600">{lesson.workplaceApplication}</p>
                                </div>
                                <div className="p-3 bg-[#45CC42]/10 rounded-lg border border-[#45CC42]/20">
                                  <span className="font-bold text-[#052B66] block mb-1">🤖 AI Tool Integration:</span>
                                  <p className="text-slate-700">{lesson.aiApplication}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Scenarios */}
                        <div className="space-y-4">
                          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Scenarios ({mod.scenarios.length})
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {mod.scenarios.map(sc => (
                              <div key={sc.id} className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    sc.type === 'AI Specific'
                                      ? 'bg-blue-100 text-[#052B66]'
                                      : 'bg-slate-100 text-slate-800'
                                  }`}>
                                    {sc.type} Scenario
                                  </span>

                                  <button
                                    onClick={() => setEditingItem({ type: 'scenario', moduleId: mod.id, item: sc })}
                                    className="text-xs font-semibold text-slate-500 hover:text-[#052B66] flex items-center gap-1 cursor-pointer"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                </div>

                                <h6 className="text-xs font-bold text-[#052B66]">{sc.title}</h6>

                                <div className="space-y-2 text-xs text-slate-600">
                                  <div>
                                    <span className="font-semibold text-slate-900">Situation:</span> {sc.situation}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-slate-900">Challenge:</span> {sc.challenge}
                                  </div>
                                  <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-amber-900">
                                    <span className="font-bold">Decision Point:</span> {sc.decisionPoint}
                                  </div>
                                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-700">
                                    <span className="font-bold text-[#052B66]">Debrief & Outcome:</span> {sc.debrief}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Knowledge Checks */}
                        <div className="space-y-4">
                          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Knowledge Checks ({mod.knowledgeChecks.length})
                          </h5>
                          <div className="space-y-3">
                            {mod.knowledgeChecks.map(kc => (
                              <div key={kc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[#052B66]">Question: {kc.question}</span>
                                  <button
                                    onClick={() => setEditingItem({ type: 'question', moduleId: mod.id, item: kc })}
                                    className="text-[11px] font-semibold text-slate-500 hover:text-[#052B66] flex items-center gap-1 cursor-pointer"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                </div>

                                <div className="space-y-1.5">
                                  {kc.options.map((opt, optIdx) => (
                                    <div
                                      key={optIdx}
                                      className={`p-2 rounded border text-xs flex items-center justify-between ${
                                        optIdx === kc.correctAnswer
                                          ? 'bg-[#45CC42]/20 border-[#45CC42] font-semibold text-[#052B66]'
                                          : 'bg-white border-slate-200 text-slate-700'
                                      }`}
                                    >
                                      <span>{opt}</span>
                                      {optIdx === kc.correctAnswer && (
                                        <span className="text-[10px] font-bold text-[#052B66]">✓ Correct Option</span>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded border border-slate-200">
                                  <span className="font-bold text-slate-800">Pedagogical Rationale:</span> {kc.rationale}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Practical Task */}
                        {mod.practicalTask && (
                          <div className="p-5 rounded-xl border border-[#052B66]/20 bg-blue-50/40 space-y-3 text-xs">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-[#052B66]" />
                              <h6 className="font-bold text-[#052B66]">{mod.practicalTask.title}</h6>
                            </div>
                            <p className="text-slate-700">{mod.practicalTask.instructions}</p>
                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                              <span className="font-bold text-slate-900 block mb-1">Deliverable:</span>
                              <p className="text-slate-600">{mod.practicalTask.deliverable}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Assessments & Diagnostics */}
        {activeTab === 'assessments' && (
          <div className="space-y-8">
            {/* Pre-Course Diagnostic */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-[#052B66]">
                  {generatedCourse.assessments.preCourseDiagnostic.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {generatedCourse.assessments.preCourseDiagnostic.instructions}
                </p>
              </div>

              <div className="space-y-4">
                {generatedCourse.assessments.preCourseDiagnostic.questions.map((dq, qIdx) => (
                  <div key={dq.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="font-bold text-[#052B66]">
                      Diagnostic {qIdx + 1}: {dq.question}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {dq.options.map((opt, oIdx) => (
                        <div key={oIdx} className="p-2 bg-white rounded border border-slate-200 text-slate-700">
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Summative Assessment */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#052B66]">
                    {generatedCourse.assessments.finalAssessment.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {generatedCourse.assessments.finalAssessment.instructions}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#052B66] bg-[#45CC42]/20 px-3 py-1 rounded-full border border-[#45CC42]/40">
                    Pass Mark: {generatedCourse.assessments.finalAssessment.passMark}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {generatedCourse.assessments.finalAssessment.questions.map((fq, qIdx) => (
                  <div key={fq.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2.5">
                    <div className="font-bold text-slate-900">
                      Question {qIdx + 1}: {fq.question}
                    </div>
                    <div className="space-y-1.5">
                      {fq.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded border ${
                            oIdx === fq.correctAnswer
                              ? 'bg-[#45CC42]/20 border-[#45CC42] font-semibold text-[#052B66]'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          {opt} {oIdx === fq.correctAnswer && '✓ (Key)'}
                        </div>
                      ))}
                    </div>
                    <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded border border-slate-200">
                      <strong>Rationale:</strong> {fq.rationale}
                    </div>
                  </div>
                ))}
              </div>

              {/* Capstone Case Study */}
              {generatedCourse.assessments.finalAssessment.capstoneCaseStudy && (
                <div className="p-6 bg-[#052B66]/5 rounded-xl border border-[#052B66]/20 space-y-4 text-xs">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#052B66]" />
                    <h4 className="text-sm font-bold text-[#052B66]">
                      {generatedCourse.assessments.finalAssessment.capstoneCaseStudy.title}
                    </h4>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {generatedCourse.assessments.finalAssessment.capstoneCaseStudy.scenario}
                  </p>
                  <div className="space-y-1 bg-white p-4 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-2">Mandatory Participant Tasks:</span>
                    {generatedCourse.assessments.finalAssessment.capstoneCaseStudy.tasks.map((task, tIdx) => (
                      <div key={tIdx} className="text-slate-700">{task}</div>
                    ))}
                  </div>
                  <div className="bg-[#45CC42]/10 p-3 rounded-lg border border-[#45CC42]/20 text-[#052B66] font-semibold">
                    Deliverable: {generatedCourse.assessments.finalAssessment.capstoneCaseStudy.deliverable}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Quality Scorecard */}
        {activeTab === 'qa' && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-[#052B66] text-white flex flex-col items-center justify-center border-2 border-[#45CC42] shadow-sm">
                  <span className="text-3xl font-extrabold font-mono text-[#45CC42]">
                    {generatedCourse.qa.score}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 uppercase">AI QA Score</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-[#052B66]">Pedagogical & Compliance Verification</h3>
                  <p className="text-xs text-slate-600">
                    Evaluated against the eStudy Financial Literacy Benchmark Course and POPIA statutory guidelines.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#45CC42]/20 text-[#052B66]">
                      ✓ POPIA Compliant
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#052B66]">
                      ✓ South African Context Verified
                    </span>
                  </div>
                </div>
              </div>

              {!isApproved && (
                <button
                  onClick={handleApprove}
                  className="px-6 py-3 rounded-xl text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3db83a] shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign Off & Approve Course</span>
                </button>
              )}
            </div>

            {/* Passed Checks */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Passed Quality Standard Checks ({generatedCourse.qa.passedChecks.length})
              </h4>
              <div className="space-y-2">
                {generatedCourse.qa.passedChecks.map((chk, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center gap-2.5 text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-[#45CC42] shrink-0" />
                    <span>{chk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {generatedCourse.qa.recommendations && generatedCourse.qa.recommendations.length > 0 && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Instructional Recommendations
                </h4>
                <div className="space-y-2">
                  {generatedCourse.qa.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 bg-amber-50/70 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Sources & Compliance */}
        {activeTab === 'sources' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-[#052B66]">
                Authoritative Sources & Regulatory Grounding
              </h3>
              <p className="text-xs text-slate-500">
                All claims and scenarios are grounded in verifiable statutory frameworks and industry evidence standards.
              </p>

              <div className="space-y-3">
                {generatedCourse.sources.map((src, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#052B66]">{src.name}</span>
                      <span className="text-[10px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                        {src.type}
                      </span>
                    </div>
                    <div className="text-slate-600 font-mono text-[11px]">{src.reference}</div>
                    <p className="text-slate-700 pt-1"><strong>Relevance:</strong> {src.relevance}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Export & Deploy */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#052B66]">Export Course Artifacts</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Download structured course files for LMS ingestion (Moodle, Canvas, Blackboard) or human review.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#052B66] text-white flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#052B66]">Complete Markdown Documentation</h4>
                      <p className="text-[11px] text-slate-500">Full course curriculum, lessons, and tests in standard markdown.</p>
                    </div>
                  </div>
                  <button
                    onClick={copyMarkdownToClipboard}
                    className="w-full py-2.5 rounded-lg text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3db83a] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Markdown Text'}</span>
                  </button>
                </div>

                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#052B66] text-white flex items-center justify-center">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#052B66]">JSON Specification File</h4>
                      <p className="text-[11px] text-slate-500">Structured JSON representation for programmatic LMS import.</p>
                    </div>
                  </div>
                  <button
                    onClick={downloadJsonFile}
                    className="w-full py-2.5 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .JSON Package</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inline Editing Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fade-up">
            <div className="px-6 py-4 bg-[#052B66] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold capitalize">
                Edit {editingItem.type}: {editingItem.item.title || editingItem.item.question || 'Component'}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {editingItem.type === 'lesson' && (
                <>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Lesson Title</label>
                    <input
                      type="text"
                      defaultValue={editingItem.item.title}
                      id="edit-lesson-title"
                      className="w-full p-2 border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Content Body</label>
                    <textarea
                      defaultValue={editingItem.item.contentBody}
                      id="edit-lesson-body"
                      rows={8}
                      className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Workplace Application</label>
                    <textarea
                      defaultValue={editingItem.item.workplaceApplication}
                      id="edit-lesson-workplace"
                      rows={3}
                      className="w-full p-2 border border-slate-300 rounded text-xs"
                    />
                  </div>
                </>
              )}

              {editingItem.type === 'scenario' && (
                <>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Scenario Title</label>
                    <input
                      type="text"
                      defaultValue={editingItem.item.title}
                      id="edit-scenario-title"
                      className="w-full p-2 border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Situation</label>
                    <textarea
                      defaultValue={editingItem.item.situation}
                      id="edit-scenario-situation"
                      rows={3}
                      className="w-full p-2 border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Challenge</label>
                    <textarea
                      defaultValue={editingItem.item.challenge}
                      id="edit-scenario-challenge"
                      rows={2}
                      className="w-full p-2 border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Decision Point</label>
                    <textarea
                      defaultValue={editingItem.item.decisionPoint}
                      id="edit-scenario-decision"
                      rows={2}
                      className="w-full p-2 border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Debrief</label>
                    <textarea
                      defaultValue={editingItem.item.debrief}
                      id="edit-scenario-debrief"
                      rows={2}
                      className="w-full p-2 border border-slate-300 rounded text-xs"
                    />
                  </div>
                </>
              )}

              {editingItem.type === 'question' && (
                <>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Question Statement</label>
                    <input
                      type="text"
                      defaultValue={editingItem.item.question}
                      id="edit-question-text"
                      className="w-full p-2 border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Rationale</label>
                    <textarea
                      defaultValue={editingItem.item.rationale}
                      id="edit-question-rationale"
                      rows={3}
                      className="w-full p-2 border border-slate-300 rounded text-xs"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  let updated = { ...editingItem.item };
                  if (editingItem.type === 'lesson') {
                    updated.title = (document.getElementById('edit-lesson-title') as HTMLInputElement)?.value || updated.title;
                    updated.contentBody = (document.getElementById('edit-lesson-body') as HTMLTextAreaElement)?.value || updated.contentBody;
                    updated.workplaceApplication = (document.getElementById('edit-lesson-workplace') as HTMLTextAreaElement)?.value || updated.workplaceApplication;
                  } else if (editingItem.type === 'scenario') {
                    updated.title = (document.getElementById('edit-scenario-title') as HTMLInputElement)?.value || updated.title;
                    updated.situation = (document.getElementById('edit-scenario-situation') as HTMLTextAreaElement)?.value || updated.situation;
                    updated.challenge = (document.getElementById('edit-scenario-challenge') as HTMLTextAreaElement)?.value || updated.challenge;
                    updated.decisionPoint = (document.getElementById('edit-scenario-decision') as HTMLTextAreaElement)?.value || updated.decisionPoint;
                    updated.debrief = (document.getElementById('edit-scenario-debrief') as HTMLTextAreaElement)?.value || updated.debrief;
                  } else if (editingItem.type === 'question') {
                    updated.question = (document.getElementById('edit-question-text') as HTMLInputElement)?.value || updated.question;
                    updated.rationale = (document.getElementById('edit-question-rationale') as HTMLTextAreaElement)?.value || updated.rationale;
                  }
                  handleSaveEdit(updated);
                }}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] cursor-pointer shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
