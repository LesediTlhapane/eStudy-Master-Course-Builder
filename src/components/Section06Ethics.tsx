import React from 'react';
import { Course } from '../types';
import { ArrowLeft, ArrowRight, Shield, Check, Lock, AlertTriangle, UserCheck } from 'lucide-react';

interface Section06EthicsProps {
  course: Course;
  onUpdate: (updater: (prev: Course) => Course) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const Section06Ethics: React.FC<Section06EthicsProps> = ({
  course,
  onUpdate,
  onContinue,
  onBack
}) => {
  const ethics = course.ethics;

  const handleUpdateField = (field: keyof Course['ethics'], val: any) => {
    onUpdate(prev => ({
      ...prev,
      ethics: {
        ...prev.ethics,
        [field]: val
      }
    }));
  };

  return (
    <div id="section-06-ethics-container" className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold font-mono text-[#052B66]">06</span>
            <h2 className="text-2xl font-extrabold text-[#052B66] tracking-tight">
              Ethics, Compliance & AI Responsibility
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mandatory ethical safeguards, POPIA privacy constraints, and human oversight controls.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#45CC42]" />
          <span>POPIA / Ethical Standard Enforced</span>
        </span>
      </div>

      {/* 4 Pillars of Responsible AI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pillar 1: POPIA & Data Privacy */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#052B66]" />
            <h3 className="text-sm font-bold text-[#052B66]">
              1. Data Protection & POPIA Compliance
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Strict prohibition of entering personally identifiable information (PII), customer financial details, or confidential workplace data into unapproved public AI models.
          </p>
          <textarea
            rows={3}
            value={ethics.dataPrivacyFramework || ethics.confidentialityRequirements}
            onChange={e => {
              handleUpdateField('dataPrivacyFramework', e.target.value);
              handleUpdateField('confidentialityRequirements', e.target.value);
            }}
            className="w-full p-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-[#052B66] outline-none"
            placeholder="Specify data anonymisation rules and sanitisation checklists..."
          />
        </div>

        {/* Pillar 2: Human Oversight & Accountability */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#052B66]" />
            <h3 className="text-sm font-bold text-[#052B66]">
              2. Human Oversight & Accountability
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            AI is treated strictly as an augmentative co-pilot. Human employees retain 100% legal and operational accountability for all final decisions, communications, and deliverables.
          </p>
          <textarea
            rows={3}
            value={ethics.humanOverrideScenarios || ethics.accountabilityMechanism}
            onChange={e => {
              handleUpdateField('humanOverrideScenarios', e.target.value);
              handleUpdateField('accountabilityMechanism', e.target.value);
            }}
            className="w-full p-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-[#052B66] outline-none"
            placeholder="Define review workflows and final approval sign-offs..."
          />
        </div>

        {/* Pillar 3: Bias & Fairness Mitigation */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-[#052B66]">
              3. Bias Detection & Cultural Fairness
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Identifying demographic, linguistic, or institutional biases in model generations, especially within the South African multilingual and socio-economic context.
          </p>
          <textarea
            rows={3}
            value={ethics.aiBiasRisk}
            onChange={e => handleUpdateField('aiBiasRisk', e.target.value)}
            className="w-full p-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-[#052B66] outline-none"
            placeholder="Include bias audit questions and cross-checking steps..."
          />
        </div>

        {/* Pillar 4: Transparency & Disclosure */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#45CC42] stroke-[2.5]" />
            <h3 className="text-sm font-bold text-[#052B66]">
              4. Transparency & AI Disclosure
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Clear standards on when and how to disclose AI-assisted work to colleagues, managers, clients, and regulatory authorities.
          </p>
          <textarea
            rows={3}
            value={ethics.aiDisclosureRequirement}
            onChange={e => handleUpdateField('aiDisclosureRequirement', e.target.value)}
            className="w-full p-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-[#052B66] outline-none"
            placeholder="Define disclosure labels and communication protocols..."
          />
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
          id="section-06-continue-btn"
          onClick={onContinue}
          className="px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>Continue to Output Requirements →</span>
        </button>
      </div>
    </div>
  );
};
