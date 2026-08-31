import React from 'react';
import { Course } from '../types';
import { ArrowLeft, ArrowRight, Check, Sparkles, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

interface Section05LearningDesignProps {
  course: Course;
  onUpdate: (updater: (prev: Course) => Course) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const Section05LearningDesign: React.FC<Section05LearningDesignProps> = ({
  course,
  onUpdate,
  onContinue,
  onBack
}) => {
  const ld = course.learningDesign;

  const handleFieldChange = (field: keyof Course['learningDesign'], val: any) => {
    onUpdate(prev => ({
      ...prev,
      learningDesign: {
        ...prev.learningDesign,
        [field]: val
      }
    }));
  };

  return (
    <div id="section-05-learning-design-container" className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-mono text-[#052B66]">05</span>
            <h2 className="text-2xl font-extrabold text-[#052B66] tracking-tight">
              Learning Design & Instructional Model
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Establish pedagogical progression, cognitive load balance, and assessment validity.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-[#45CC42]/15 text-[#052B66] rounded-full border border-[#45CC42]/30">
          Pedagogy Standards Active
        </span>
      </div>

      {/* 3-Tier Instructional Progression Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#052B66] uppercase tracking-wider">
          Instructional Progression
        </h3>
        <p className="text-xs text-slate-600">
          Ensure content flows naturally from foundational mental models to workplace application.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#052B66] text-white text-[10px] font-bold flex items-center justify-center">
                1
              </span>
              <span className="text-xs font-bold text-[#052B66]">Tier 1: Foundational</span>
            </div>
            <p className="text-xs text-slate-600">
              Core concepts, terminology, demystification, and common risks.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#052B66] text-white text-[10px] font-bold flex items-center justify-center">
                2
              </span>
              <span className="text-xs font-bold text-[#052B66]">Tier 2: Applied</span>
            </div>
            <p className="text-xs text-slate-600">
              Tools, prompt templates, step-by-step procedures, and decision trees.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#052B66] text-white text-[10px] font-bold flex items-center justify-center">
                3
              </span>
              <span className="text-xs font-bold text-[#052B66]">Tier 3: Evaluative</span>
            </div>
            <p className="text-xs text-slate-600">
              Output verification, risk audits, governance, and institutional SOPs.
            </p>
          </div>
        </div>
      </div>

      {/* Formative & Summative Assessment Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#45CC42]" />
            <h4 className="text-sm font-bold text-slate-900">
              Formative Assessments
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Minimum 3 scenario-based knowledge checks per module with detailed rationales for correct and incorrect answer choices.
          </p>
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-lg text-xs text-emerald-800 font-medium">
            ✓ Scenario-linked multiple choice & diagnostic checkpoints
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#052B66]" />
            <h4 className="text-sm font-bold text-slate-900">
              Summative Assessment
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Comprehensive workplace capstone case study evaluating end-to-end task execution, error detection, and ethical compliance.
          </p>
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-lg text-xs text-[#052B66] font-medium">
            ✓ 30-Day implementation plan + risk matrix audit deliverable
          </div>
        </div>
      </div>

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
          id="section-05-continue-btn"
          onClick={onContinue}
          className="px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>Continue to Ethics & AI Responsibility →</span>
        </button>
      </div>
    </div>
  );
};
