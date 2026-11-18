import React from 'react';
import { Course } from '../types';
import { ArrowLeft, Shield, Lock, Scale } from 'lucide-react';
import { SlideHeader } from './SlideHeader';
import { SlideFooter } from './SlideFooter';
import { FrameworkCallout } from './FrameworkCallout';
import { EditorialField } from './EditorialField';

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
  const flagged = course.flaggedFields || {};

  const confirmFlag = (key: string) => {
    onUpdate(prev => {
      const next = { ...(prev.flaggedFields || {}) };
      delete next[key];
      return { ...prev, flaggedFields: next };
    });
  };

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
    <div id="section-06-ethics-container" className="space-y-8 max-w-6xl font-sora">
      {/* Slide Header */}
      <SlideHeader
        sectionNumber="06"
        title="6. ETHICAL & PROFESSIONAL STANDARDS"
        subtitle="Complete 6.1 Core Ethics Requirements and 6.2 AI Ethics & Responsible AI on a single page."
        slideNumber="06"
        totalSlides="09"
        badgeText="Section 6 · Ethics & POPIA"
      />

      {/* Framework Requirement Callout */}
      <FrameworkCallout
        title="South African Regulatory & Responsible AI Requirement"
        requirement="Every course must enforce South African statutory compliance (including POPIA Act No. 4 of 2013), human-in-the-loop accountability, bias mitigation, and clear escalation protocols."
        variant="ethics"
      />

      {/* ================================================================= */}
      {/* 6.1 CORE ETHICS REQUIREMENTS                                      */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs border-l-4 border-l-[#052B66]">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2.5 py-0.5 rounded-md border border-[#052B66]/20 inline-block mb-1">
            SUBSECTION 6.1
          </span>
          <h3 className="text-base font-extrabold text-[#052B66] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#45CC42]" />
            <span>6.1 Core Ethics Requirements</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Specify ethical decision-making, confidentiality (POPIA), professional accountability, and psychological safety requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <EditorialField
            label="Ethical Decision-Making & Escalation Framework"
            value={ethics.decisionMakingFramework}
            onChange={val => handleUpdateField('decisionMakingFramework', val)}
            placeholder="e.g. Tier 1 routine tasks verified by operator; Tier 2 client-facing outputs require supervisor sign-off; Tier 3 statutory issues escalated to Compliance."
            multiline
            rows={3}
            required
          />

          <EditorialField
            label="Confidentiality & Data Protection Requirements (POPIA)"
            value={ethics.confidentialityRequirements}
            onChange={val => handleUpdateField('confidentialityRequirements', val)}
            placeholder="e.g. Strict compliance with POPIA Act 4 of 2013; mandatory redaction of personal identifiers and client account details."
            multiline
            rows={3}
            required
            flaggedNote={flagged['ethics.confidentialityRequirements']}
            onConfirmFlag={() => confirmFlag('ethics.confidentialityRequirements')}
          />

          <EditorialField
            label="Professional Accountability Mechanism"
            value={ethics.accountabilityMechanism}
            onChange={val => handleUpdateField('accountabilityMechanism', val)}
            placeholder="e.g. Employees retain full professional and legal accountability for all work outputs, calculations, and client communications."
            multiline
            rows={3}
            required
          />

          <EditorialField
            label="Psychological Safety, Inclusivity & Error Reporting"
            value={ethics.psychologicalSafetyNotes}
            onChange={val => handleUpdateField('psychologicalSafetyNotes', val)}
            placeholder="e.g. Constructive, non-punitive error-reporting channel encouraging early escalation of process or system mistakes."
            multiline
            rows={3}
          />
        </div>
      </div>

      {/* ================================================================= */}
      {/* 6.2 AI ETHICS & RESPONSIBLE AI                                    */}
      {/* ================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-xs border-l-4 border-l-[#45CC42]">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#45CC42]/20 px-2.5 py-0.5 rounded-md border border-[#45CC42]/40 inline-block mb-1">
            SUBSECTION 6.2
          </span>
          <h3 className="text-base font-extrabold text-[#052B66] flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#052B66]" />
            <span>6.2 AI Ethics & Responsible AI</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete the official Section 6.2 AI Ethics dimensions: Bias & Fairness, Data Privacy, Transparency & Explainability, Human-in-the-Loop, Misuse Prevention, and Workforce Impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <EditorialField
            label="Bias & Fairness (Specific to course domain) [INSERT]"
            value={ethics.aiBiasRisk}
            onChange={val => handleUpdateField('aiBiasRisk', val)}
            placeholder="e.g. Auditing automated outputs for demographic, linguistic, or socio-economic bias in South African client contexts."
            multiline
            rows={3}
            required
          />

          <EditorialField
            label="Data Privacy & POPIA / GDPR Safeguards [INSERT]"
            value={ethics.dataPrivacyFramework}
            onChange={val => handleUpdateField('dataPrivacyFramework', val)}
            placeholder="e.g. Never input confidential, personal, or proprietary data into unapproved AI tools; enforce POPIA Condition 7 safeguards."
            multiline
            rows={3}
            required
            flaggedNote={flagged['ethics.dataPrivacyFramework']}
            onConfirmFlag={() => confirmFlag('ethics.dataPrivacyFramework')}
          />

          <EditorialField
            label="Transparency, Explainability & AI Disclosure [INSERT]"
            value={ethics.aiDisclosureRequirement}
            onChange={val => handleUpdateField('aiDisclosureRequirement', val)}
            placeholder="e.g. Learners must be able to explain how an AI-assisted output was reached and disclose AI assistance on internal reports."
            multiline
            rows={3}
            required
          />

          <EditorialField
            label="Human-in-the-Loop Override Scenarios [INSERT]"
            value={ethics.humanOverrideScenarios}
            onChange={val => handleUpdateField('humanOverrideScenarios', val)}
            placeholder="e.g. AI assists, humans decide: mandatory human review and override for financial approvals, HR decisions, and legal compliance."
            multiline
            rows={3}
            required
          />

          <EditorialField
            label="Data Sovereignty & Cross-Border Jurisdiction"
            value={ethics.dataSovereigntyContext}
            onChange={val => handleUpdateField('dataSovereigntyContext', val)}
            placeholder="e.g. Compliance with POPIA Section 72 cross-border data transfer restrictions when using cloud platforms."
            multiline
            rows={2}
          />

          <EditorialField
            label="Workforce Impact & Augmentation Narrative"
            value={ethics.aiWorkforceImpactNarrative}
            onChange={val => handleUpdateField('aiWorkforceImpactNarrative', val)}
            placeholder="e.g. Honest, constructive framing of how AI augments employee capability and reduces repetitive administrative rework."
            multiline
            rows={2}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={onBack}
          className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Section 5: Learning Design</span>
        </button>

        <button
          id="section-06-continue-btn"
          onClick={onContinue}
          className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Section 7: Output Format Requirements →</span>
        </button>
      </div>

      <SlideFooter currentSlide="06" totalSlides="09" />
    </div>
  );
};
