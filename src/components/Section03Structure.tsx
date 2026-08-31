import React, { useState } from 'react';
import { Course, LearningJourneyStep, DiagnosticQuestion } from '../types';
import { ArrowRight, ArrowLeft, ChevronRight, Check, Plus, Trash2, BookOpen, Target, Sparkles, HelpCircle } from 'lucide-react';

interface Section03StructureProps {
  course: Course;
  onUpdate: (updater: (prev: Course) => Course) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const Section03Structure: React.FC<Section03StructureProps> = ({
  course,
  onUpdate,
  onContinue,
  onBack
}) => {
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [showOutcomesModal, setShowOutcomesModal] = useState(false);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);

  const s = course.structure;

  const handleStructureChange = (field: keyof typeof s, value: any) => {
    onUpdate(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        [field]: value
      },
      name: field === 'title' ? value : prev.name
    }));
  };

  const handleJourneyStepChange = (index: number, field: keyof LearningJourneyStep, value: string) => {
    const updated = [...s.learningJourney];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      handleStructureChange('learningJourney', updated);
    }
  };

  // Add diagnostic question
  const [newDiagCategory, setNewDiagCategory] = useState<DiagnosticQuestion['category']>('AI / digital readiness');
  const [newDiagQuestion, setNewDiagQuestion] = useState('');

  const handleAddDiagnostic = () => {
    if (!newDiagQuestion.trim()) return;
    const newQ: DiagnosticQuestion = {
      id: `diag-${Date.now()}`,
      category: newDiagCategory,
      question: newDiagQuestion.trim()
    };
    handleStructureChange('diagnosticQuestions', [...s.diagnosticQuestions, newQ]);
    setNewDiagQuestion('');
  };

  const handleDeleteDiagnostic = (id: string) => {
    handleStructureChange(
      'diagnosticQuestions',
      s.diagnosticQuestions.filter(q => q.id !== id)
    );
  };

  return (
    <div id="section-03-structure-container" className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-mono text-[#052B66]">03</span>
            <h2 className="text-2xl font-extrabold text-[#052B66] tracking-tight">
              Course Structure
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Define the course architecture before you design individual modules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-[#45CC42]/15 text-[#052B66] rounded-full border border-[#45CC42]/30">
            7 of 9 complete
          </span>
        </div>
      </div>

      {/* Course Essentials Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-[#052B66] uppercase tracking-wider">
          Course essentials
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Row 1 */}
          <div className="space-y-1.5 md:col-span-1">
            <label className="block text-xs font-bold text-slate-700">
              Course title *
            </label>
            <input
              type="text"
              value={s.title || course.name}
              onChange={e => handleStructureChange('title', e.target.value)}
              placeholder="e.g. AI Literacy for the Modern Workplace"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 focus:border-[#052B66] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Estimated duration *
            </label>
            <input
              type="text"
              value={s.estimatedDuration}
              onChange={e => handleStructureChange('estimatedDuration', e.target.value)}
              placeholder="e.g. 6 hours / 10 CPD credits"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-[#052B66] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Delivery format *
            </label>
            <select
              value={s.deliveryFormat}
              onChange={e => handleStructureChange('deliveryFormat', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-[#052B66] outline-none bg-white"
            >
              <option value="Self-paced online">Self-paced online</option>
              <option value="Blended workshop + digital">Blended workshop + digital</option>
              <option value="Facilitator-led interactive">Facilitator-led interactive</option>
              <option value="Micro-learning sprint">Micro-learning sprint</option>
            </select>
          </div>

          {/* Row 2 */}
          <div className="space-y-1.5 md:col-span-1">
            <label className="block text-xs font-bold text-slate-700">
              Who is this course designed for? *
            </label>
            <input
              type="text"
              value={s.targetRoles}
              onChange={e => handleStructureChange('targetRoles', e.target.value)}
              placeholder="e.g. Employees who use digital tools in daily work."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-[#052B66] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Difficulty level *
            </label>
            <select
              value={s.difficultyLevel}
              onChange={e => handleStructureChange('difficultyLevel', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-[#052B66] outline-none bg-white"
            >
              <option value="Foundational">Foundational</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Number of modules *
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                Minimum 3
              </span>
            </div>
            <input
              type="number"
              min={3}
              max={10}
              value={course.modules.length}
              readOnly
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs font-bold text-[#052B66] bg-slate-50 outline-none cursor-default"
            />
          </div>
        </div>
      </div>

      {/* Learning Journey Pipeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#052B66] uppercase tracking-wider">
              Learning journey
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visual pedagogical progression through the 4 core competencies.
            </p>
          </div>
        </div>

        {/* 4-Step Interactive Visual Flow matching Mockup Page 4 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {s.learningJourney.map((step, idx) => (
            <div
              key={step.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-[#052B66]/30 transition-all space-y-2 relative group"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#052B66] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {step.stepNumber}
                </span>
                <span className="font-extrabold text-xs text-[#052B66] tracking-tight">
                  {step.title}
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-800">
                {step.subtitle}
              </p>
              <p className="text-[11px] text-slate-500 leading-snug">
                {step.description}
              </p>

              {/* Arrow divider for larger screens */}
              {idx < s.learningJourney.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Purpose, Outcomes & Diagnostics Summary Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Purpose */}
        <button
          onClick={() => setShowPurposeModal(true)}
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#45CC42] hover:shadow-xs transition-all text-left flex items-center justify-between group cursor-pointer border-l-4 border-l-[#45CC42]"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#052B66]">
              Course purpose
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete & aligned
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#45CC42] transition-colors" />
        </button>

        {/* Outcomes */}
        <button
          onClick={() => setShowOutcomesModal(true)}
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#45CC42] hover:shadow-xs transition-all text-left flex items-center justify-between group cursor-pointer border-l-4 border-l-[#45CC42]"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#052B66]">
              Course outcomes
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {s.organisationalBenefits.length + s.employeeBenefits.length} outcomes defined
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#45CC42] transition-colors" />
        </button>

        {/* Diagnostics */}
        <button
          onClick={() => setShowDiagnosticsModal(true)}
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#45CC42] hover:shadow-xs transition-all text-left flex items-center justify-between group cursor-pointer border-l-4 border-l-[#45CC42]"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#052B66]">
              Diagnostic questions
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {s.diagnosticQuestions.length} pre-course items
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#45CC42] transition-colors" />
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={onBack}
          className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            id="section-03-continue-btn"
            onClick={onContinue}
            className="px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Continue →</span>
          </button>
        </div>
      </div>

      {/* Course Purpose Modal */}
      {showPurposeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-[#052B66]">
              Course Purpose & Overview
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purpose of the Course *
                </label>
                <textarea
                  rows={3}
                  value={s.purposeStatement}
                  onChange={e => handleStructureChange('purposeStatement', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#052B66] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Workplace Relevance *
                </label>
                <textarea
                  rows={2}
                  value={s.workplaceRelevance}
                  onChange={e => handleStructureChange('workplaceRelevance', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#052B66] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expected Performance Improvement *
                </label>
                <textarea
                  rows={2}
                  value={s.performanceImprovement}
                  onChange={e => handleStructureChange('performanceImprovement', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-[#052B66] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowPurposeModal(false)}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] cursor-pointer"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Outcomes Modal */}
      {showOutcomesModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-[#052B66]">
              Course Benefits & Outcomes
            </h3>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Organisational Benefits
                </h4>
                <div className="space-y-1.5">
                  {s.organisationalBenefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded">
                      <Check className="w-3.5 h-3.5 text-[#45CC42] shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Employee Benefits
                </h4>
                <div className="space-y-1.5">
                  {s.employeeBenefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded">
                      <Check className="w-3.5 h-3.5 text-[#45CC42] shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowOutcomesModal(false)}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Course Diagnostics Modal */}
      {showDiagnosticsModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#052B66]">
                  Pre-Course Diagnostic Questions (3.8)
                </h3>
                <p className="text-xs text-slate-500">
                  Minimum 5 diagnostic questions required by Master Prompt v9.0.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                {s.diagnosticQuestions.length} questions
              </span>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {s.diagnosticQuestions.map((dq, idx) => (
                <div key={dq.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#052B66] bg-white px-2 py-0.5 rounded border border-slate-200">
                      {dq.category}
                    </span>
                    <p className="text-slate-800 font-medium pt-1">
                      {idx + 1}. {dq.question}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteDiagnostic(dq.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add question form */}
            <div className="p-3 bg-slate-100/70 rounded-lg space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={newDiagCategory}
                  onChange={e => setNewDiagCategory(e.target.value as any)}
                  className="col-span-1 px-2 py-1.5 rounded border border-slate-300 text-xs bg-white"
                >
                  <option value="General domain">General domain</option>
                  <option value="Problem awareness">Problem awareness</option>
                  <option value="Current practices">Current practices</option>
                  <option value="AI / digital readiness">AI / digital readiness</option>
                  <option value="Ethics & compliance">Ethics & compliance</option>
                </select>
                <input
                  type="text"
                  placeholder="Enter diagnostic question..."
                  value={newDiagQuestion}
                  onChange={e => setNewDiagQuestion(e.target.value)}
                  className="col-span-2 px-3 py-1.5 rounded border border-slate-300 text-xs bg-white"
                />
              </div>
              <button
                type="button"
                onClick={handleAddDiagnostic}
                className="w-full py-1.5 rounded bg-[#052B66] text-white text-xs font-semibold hover:bg-[#042150] cursor-pointer"
              >
                + Add Diagnostic Question
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDiagnosticsModal(false)}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
