import React, { useState } from 'react';
import { Course, SectionId, QACheckItem } from '../types';
import { QAResult } from '../utils/qaEngine';
import { FRAMEWORK_RULES } from '../utils/frameworkConfig';
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ClipboardList,
  AlertTriangle,
  Info,
  Check
} from 'lucide-react';

interface Section08QAProps {
  course: Course;
  qaResult: QAResult;
  onNavigateSection: (sectionId: SectionId, fieldId?: string) => void;
  onPreviewPrompt: () => void;
  onBack: () => void;
}

export const Section08QA: React.FC<Section08QAProps> = ({
  course,
  qaResult,
  onNavigateSection,
  onPreviewPrompt,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'audit' | 'categories'>('checklist');

  const passedCount = qaResult.items.filter(i => i.isComplete).length;
  const warningCount = qaResult.items.filter(i => !i.isComplete).length;

  const categories = [
    { name: 'Problem Definition', section: '01' as SectionId },
    { name: 'Sources & Evidence', section: '02' as SectionId },
    { name: 'Course Structure & Diagnostics', section: '03' as SectionId },
    { name: 'Module Architecture & Scenarios', section: '04' as SectionId },
    { name: 'Learning Design & Assessments', section: '05' as SectionId },
    { name: 'Ethics, POPIA & AI Responsibility', section: '06' as SectionId },
    { name: 'Output Format & Language', section: '07' as SectionId },
    { name: 'Benchmark QA Review', section: '08' as SectionId },
    { name: 'Customisation & Safeguards', section: '09' as SectionId }
  ];

  const getItemsForSection = (sectionId: SectionId): QACheckItem[] => {
    return qaResult.items.filter(item => item.targetSection === sectionId);
  };

  return (
    <div id="section-08-qa-container" className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-mono text-[#052B66]">08</span>
            <h2 className="text-2xl font-extrabold text-[#052B66] tracking-tight">
              Course Readiness & Quality Assurance
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Auditing course parameters against the Master Course Generation Framework v9.0 standards.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200 shrink-0">
          Master Prompt v9.0 Compliance
        </span>
      </div>

      {/* Top Hero Readiness Score Card */}
      <div
        id="course-readiness-hero-card"
        className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="flex items-center gap-6">
          {/* Big Score Gauge */}
          <div className="w-24 h-24 rounded-2xl bg-[#052B66] text-white flex flex-col items-center justify-center shrink-0 shadow-sm border-2 border-[#45CC42]">
            <span className="text-3xl font-extrabold font-mono tracking-tight leading-none text-[#45CC42]">
              {qaResult.scorePercent}%
            </span>
            <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mt-1">
              Score
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-[#052B66] tracking-tight">
                {qaResult.statusLabel}
              </h3>
              {qaResult.mandatoryRequirementsMet && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#45CC42]" title="Mandatory requirements satisfied" />
              )}
            </div>

            <p className="text-xs text-slate-600 font-medium">
              {passedCount} of {qaResult.items.length} requirements met ·{' '}
              {warningCount === 0 ? (
                <span className="text-[#45CC42] font-bold">All framework rules satisfied</span>
              ) : (
                <span className="text-amber-700 font-bold">{warningCount} pending items</span>
              )}
            </p>

            <p className="text-[11.5px] text-slate-500 max-w-xl">
              {qaResult.statusDescription}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2.5 shrink-0">
          <button
            id="qa-preview-master-prompt-cta"
            onClick={onPreviewPrompt}
            className="px-6 py-3 rounded-lg text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3db83a] transition-all shadow hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Preview Master Prompt →</span>
          </button>
        </div>
      </div>

      {/* Human-in-the-Loop Governance Notice */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3.5 text-xs text-blue-900">
        <ShieldCheck className="w-5 h-5 text-[#052B66] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-[#052B66]">eStudy Human-in-the-Loop Safeguard Notice:</span>
          <p className="text-blue-800 leading-relaxed">
            AI generation is a capability builder and draft accelerator. Per framework standards, all AI-generated curriculum items, workplace scenarios, and assessment rationales require human instructional sign-off before production LMS deployment.
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'checklist'
              ? 'bg-[#052B66] text-white'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          Detailed Checklist ({passedCount}/{qaResult.items.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-[#052B66] text-white'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          Explainable Category Scores
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-[#052B66] text-white'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          Section Traceability Audit
        </button>
      </div>

      {/* Tab 1: Checklist & Scenarios */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          {/* Per-Module Scenario Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#052B66]">
                  Per-Module Scenario & Practical Verification
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Framework v9.0 Requirement: Minimum {FRAMEWORK_RULES.MIN_WORKPLACE_SCENARIOS_PER_MODULE} workplace scenarios per module (target 3-5), plus at least {FRAMEWORK_RULES.MIN_AI_SCENARIOS_TOTAL} AI application scenarios across the course.
                </p>
              </div>
              <button
                onClick={() => onNavigateSection('04')}
                className="text-xs font-semibold text-[#052B66] hover:text-[#45CC42] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Manage Scenarios</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(qaResult.moduleScenarioBreakdown || []).map(mb => (
                <div
                  key={mb.moduleId}
                  className={`p-4 rounded-xl border transition-all ${
                    mb.isComplete
                      ? 'bg-slate-50/80 border-slate-200'
                      : 'bg-amber-50/80 border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#052B66]">
                      Module {mb.moduleNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        mb.isComplete
                          ? 'bg-[#45CC42]/20 text-[#052B66]'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {mb.isComplete ? '✓ Compliant' : '⚠ Action needed'}
                    </span>
                  </div>

                  <div className="text-xs font-medium text-slate-700 truncate mb-3" title={mb.moduleTitle}>
                    {mb.moduleTitle}
                  </div>

                  <div className="space-y-1.5 text-[11px] border-t border-slate-200/70 pt-2 text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Workplace Scenarios:</span>
                      <span className={`font-semibold ${mb.workplaceCount >= FRAMEWORK_RULES.MIN_WORKPLACE_SCENARIOS_PER_MODULE ? 'text-slate-900' : 'text-amber-700 font-bold'}`}>
                        {mb.workplaceCount} {mb.workplaceCount >= FRAMEWORK_RULES.MIN_WORKPLACE_SCENARIOS_PER_MODULE ? '✓' : `(min ${FRAMEWORK_RULES.MIN_WORKPLACE_SCENARIOS_PER_MODULE})`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>AI Application Scenarios:</span>
                      <span className="font-semibold text-slate-900">
                        {mb.aiCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grouped Requirement Cards List */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Readiness Checklist by Category
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map(cat => {
                const catItems = getItemsForSection(cat.section);
                if (catItems.length === 0) return null;

                return (
                  <div
                    key={cat.name}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#052B66]">
                          {cat.name}
                        </span>
                      </div>

                      <button
                        onClick={() => onNavigateSection(cat.section)}
                        className="text-[11px] font-semibold text-[#052B66] hover:text-[#45CC42] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Edit Section</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {catItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => onNavigateSection(item.targetSection)}
                          className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 transition-colors cursor-pointer ${
                            item.isComplete
                              ? 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70 text-slate-800'
                              : 'bg-amber-50/60 border-amber-200 hover:bg-amber-100/60 text-amber-900'
                          }`}
                        >
                          <span className="shrink-0 mt-0.5">
                            {item.isComplete ? (
                              <CheckCircle2 className="w-4 h-4 text-[#45CC42]" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                            )}
                          </span>

                          <div className="space-y-0.5 flex-1">
                            <div className="font-semibold">{item.label}</div>
                            {item.issueDescription && (
                              <div className="text-[11px] text-amber-700">
                                {item.issueDescription}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Explainable Category Scores */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#052B66]">
              Explainable Framework Scoring Model
            </h3>
            <p className="text-xs text-slate-500">
              The overall framework compliance score is derived from 4 core pedagogical pillars weighted by instructional impact.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {qaResult.categoryScores.map((cs, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#052B66]">{cs.category}</h4>
                      <span className="text-[10px] text-slate-500">Weight: {cs.weight}% of total</span>
                    </div>
                    <span className={`text-sm font-bold font-mono px-2.5 py-1 rounded-lg ${
                      cs.score === 100 ? 'bg-emerald-100 text-emerald-800' : cs.score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {cs.score}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        cs.score === 100 ? 'bg-[#45CC42]' : cs.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${cs.score}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>Passed criteria: {cs.passedCount} of {cs.totalCount}</span>
                    <span className="font-semibold">
                      {cs.status === 'passed' ? '✓ Fully Verified' : cs.status === 'warning' ? '⚠ Partially Complete' : '✕ Action Required'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Section Traceability Audit */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#052B66]">
                  Framework Section Traceability Matrix
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audit each of the 9 Master Prompt sections for completion status and parameter presence.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {categories.map(cat => {
                const prog = qaResult.sectionProgress[cat.section];
                if (!prog) return null;

                return (
                  <div
                    key={cat.section}
                    className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-bold px-2 py-1 bg-white border border-slate-200 rounded text-[#052B66]">
                        {cat.section}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{cat.name}</h4>
                        <span className="text-[11px] text-slate-500">
                          {prog.completed} of {prog.total} parameters populated
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        prog.status === 'Complete'
                          ? 'bg-emerald-100 text-emerald-800'
                          : prog.status === 'In progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {prog.status}
                      </span>

                      <button
                        onClick={() => onNavigateSection(cat.section)}
                        className="p-1.5 text-slate-500 hover:text-[#052B66] hover:bg-white rounded transition-colors cursor-pointer"
                        title="Jump to section"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={onBack}
          className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back</span>
        </button>

        <button
          id="section-08-continue-btn"
          onClick={() => onNavigateSection('09')}
          className="px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>Continue to Customisation →</span>
        </button>
      </div>
    </div>
  );
};
