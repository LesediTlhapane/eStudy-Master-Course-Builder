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
  Check,
  Award
} from 'lucide-react';
import { SlideHeader } from './SlideHeader';
import { SlideFooter } from './SlideFooter';
import { FrameworkCallout } from './FrameworkCallout';

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
  const [activeTab, setActiveTab] = useState<'checklist' | 'categories' | 'audit'>('checklist');

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
    <div id="section-08-qa-container" className="space-y-6 max-w-6xl">
      {/* Slide Header */}
      <SlideHeader
        sectionNumber="08"
        title="Quality Assurance, Scoring & Editorial Review"
        subtitle="Audit course parameters against the Master Course Generation Framework v9.0 standards across all 40 verification criteria."
        slideNumber="35"
        totalSlides="39"
        badgeText={`${qaResult.scorePercent}% Compliance Score`}
      />

      {/* Framework Requirement Callout */}
      <FrameworkCallout
        title="Framework Requirement"
        requirement="Target 100% compliance across all 40 criteria before publishing. Mandatory items (minimum 3 sources, 5 diagnostic questions, 3 scenarios per module, POPIA compliance) must be satisfied."
        variant="requirement"
      />

      {/* Top Hero Readiness Score Card */}
      <div
        id="course-readiness-hero-card"
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="flex items-center gap-6">
          {/* Big Score Gauge */}
          <div className="w-20 h-20 rounded-2xl bg-[#052B66] text-white flex flex-col items-center justify-center shrink-0 shadow-sm border-2 border-[#45CC42]">
            <span className="text-2xl font-extrabold font-mono tracking-tight leading-none text-[#45CC42]">
              {qaResult.scorePercent}%
            </span>
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider mt-1">
              Score
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#052B66] tracking-tight">
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
            className="px-6 py-3 rounded-xl text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] transition-all shadow hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Preview Master Prompt →</span>
          </button>
        </div>
      </div>

      {/* Slide Navigation Tabs */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Slide 35: Detailed QA Checklist ({passedCount}/{qaResult.items.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Slide 35: Category Scores</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Slide 36: Section Traceability Audit</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Checklist & Scenarios */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          {/* Per-Module Scenario Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#052B66]">
                  Per-Module Scenario & Practical Verification
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Framework v9.0 Requirement: Minimum {FRAMEWORK_RULES.MIN_WORKPLACE_SCENARIOS_PER_MODULE} workplace scenarios per module, plus at least {FRAMEWORK_RULES.MIN_AI_SCENARIOS_TOTAL} AI application scenarios across the course.
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
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-amber-50 border-amber-300'
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

                  <div className="space-y-1.5 text-[11px] border-t border-slate-200 pt-2 text-slate-600">
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
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Readiness Checklist by Category
            </h3>

            <div className="space-y-3">
              {categories.map(cat => {
                const items = getItemsForSection(cat.section);
                if (items.length === 0) return null;

                const catPassed = items.filter(i => i.isComplete).length;
                const allPassed = catPassed === items.length;

                return (
                  <div
                    key={cat.section}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
                  >
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-black font-mono text-[#052B66] bg-white border border-slate-200 px-2 py-0.5 rounded">
                          {cat.section}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {cat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          allPassed
                            ? 'bg-[#45CC42]/20 text-[#052B66]'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {catPassed} / {items.length} complete
                        </span>
                        <button
                          onClick={() => onNavigateSection(cat.section)}
                          className="text-xs font-bold text-[#052B66] hover:text-[#45CC42] flex items-center gap-1 cursor-pointer"
                        >
                          <span>Edit</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 p-2">
                      {items.map(item => (
                        <div
                          key={item.id}
                          className="p-3 flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start gap-2.5 flex-1">
                            {item.isComplete ? (
                              <CheckCircle2 className="w-4 h-4 text-[#45CC42] stroke-[2.5] shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            )}
                            <div className="space-y-0.5">
                              <div className="font-semibold text-slate-900 flex items-center gap-2">
                                <span>{item.label}</span>
                              </div>
                              {item.issueDescription && (
                                <p className="text-[11px] text-slate-500">{item.issueDescription}</p>
                              )}
                            </div>
                          </div>

                          {!item.isComplete && item.targetSection && (
                            <button
                              onClick={() => onNavigateSection(item.targetSection!)}
                              className="text-[11px] font-bold text-[#052B66] hover:bg-slate-100 px-2.5 py-1 rounded transition-colors shrink-0 cursor-pointer"
                            >
                              {item.actionLabel || 'Fix →'}
                            </button>
                          )}
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
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#052B66]">
            Explainable Framework Scoring Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(cat => {
              const items = getItemsForSection(cat.section);
              if (items.length === 0) return null;
              const catPassed = items.filter(i => i.isComplete).length;
              const pct = Math.round((catPassed / items.length) * 100);

              return (
                <div key={cat.section} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{cat.section} · {cat.name}</span>
                    <span className="text-xs font-mono font-bold text-[#052B66]">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${pct === 100 ? 'bg-[#45CC42]' : 'bg-[#052B66]'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Traceability Audit */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#052B66]">
            Section-by-Section Traceability & Verification Audit
          </h3>
          <p className="text-xs text-slate-600">
            Every input is traced directly to the prompt compiler engine and formatted to strict Universal Master Prompt v9.0 standards.
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={onBack}
          className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Output Format</span>
        </button>

        <button
          id="section-08-continue-btn"
          onClick={() => onNavigateSection('09')}
          className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Customisation & History (Section 09) →</span>
        </button>
      </div>

      {/* Slide Footer */}
      <SlideFooter currentSlide="35" totalSlides="39" />
    </div>
  );
};
