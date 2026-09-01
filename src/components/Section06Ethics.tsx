import React, { useState } from 'react';
import { Course } from '../types';
import { ArrowLeft, ArrowRight, Shield, Check, Lock, AlertTriangle, UserCheck, Scale, FileText, Database, Eye, Globe } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'pillars' | 'cards' | 'governance'>('pillars');
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
    <div id="section-06-ethics-container" className="space-y-6 max-w-6xl">
      {/* Slide Header */}
      <SlideHeader
        sectionNumber="06"
        title="Ethics, Compliance & Responsible AI Governance"
        subtitle="Enforce POPIA compliance, human-in-the-loop oversight, bias mitigation, and clear escalation protocols."
        slideNumber="29"
        totalSlides="39"
        badgeText="POPIA & Ethics Enforced"
      />

      {/* Framework Requirement Callout */}
      <FrameworkCallout
        title="Framework Requirement"
        requirement="Mandatory South African statutory compliance (POPIA Act No. 4 of 2013). All 8 ethical dimensions and strict human-in-the-loop sign-off protocols must be configured."
        variant="ethics"
      />

      {/* Slide Tab Navigation */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('pillars')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pillars'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Slide 29: Core Governance Pillars</span>
          </button>

          <button
            onClick={() => setActiveTab('cards')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cards'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Slide 30: 8 Ethical Dimensions</span>
          </button>

          <button
            onClick={() => setActiveTab('governance')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'governance'
                ? 'bg-[#052B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Slide 31 & 32: Decision Gates & Sovereignty</span>
          </button>
        </div>
      </div>

      {activeTab === 'pillars' && (
        /* Slide 29: 4 Primary Pillars of Responsible AI */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Pillar 1: POPIA & Data Privacy */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                PILLAR 01 · DATA PRIVACY
              </span>
              <h3 className="text-sm font-bold text-[#052B66] flex items-center gap-1.5 mt-0.5">
                <Lock className="w-4 h-4 text-[#052B66]" />
                <span>POPIA & Client Confidentiality</span>
              </h3>
            </div>

            <EditorialField
              label="[DATA PRIVACY & POPIA SAFEGUARDS]"
              value={ethics.dataPrivacyFramework || ethics.confidentialityRequirements}
              onChange={val => {
                handleUpdateField('dataPrivacyFramework', val);
                handleUpdateField('confidentialityRequirements', val);
              }}
              placeholder="e.g. Mandatory zero-PII input rule, client data redaction protocols, and strict prohibition of non-enterprise AI instances."
              multiline
              rows={3}
              helperText="Strict prohibition of entering personal or sensitive corporate data."
            />
          </div>

          {/* Pillar 2: Human Oversight & Accountability */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                PILLAR 02 · ACCOUNTABILITY
              </span>
              <h3 className="text-sm font-bold text-[#052B66] flex items-center gap-1.5 mt-0.5">
                <UserCheck className="w-4 h-4 text-[#052B66]" />
                <span>Human-in-the-Loop Oversight</span>
              </h3>
            </div>

            <EditorialField
              label="[HUMAN-IN-THE-LOOP OVERSIGHT & SIGN-OFF]"
              value={ethics.humanOverrideScenarios || ethics.accountabilityMechanism}
              onChange={val => {
                handleUpdateField('humanOverrideScenarios', val);
                handleUpdateField('accountabilityMechanism', val);
              }}
              placeholder="e.g. Mandatory human review and sign-off for high-impact decisions, customer communications, and financial summaries."
              multiline
              rows={3}
              helperText="Human employees retain 100% legal and operational accountability."
            />
          </div>

          {/* Pillar 3: Bias & Fairness Mitigation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                PILLAR 03 · FAIRNESS
              </span>
              <h3 className="text-sm font-bold text-[#052B66] flex items-center gap-1.5 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Bias Detection & Cultural Fairness</span>
              </h3>
            </div>

            <EditorialField
              label="[BIAS DETECTION & FAIRNESS PROTOCOLS]"
              value={ethics.aiBiasRisk}
              onChange={val => handleUpdateField('aiBiasRisk', val)}
              placeholder="e.g. Screen for demographic or linguistic bias in AI resume ranking, marketing personas, and automated credit risk evaluations."
              multiline
              rows={3}
              helperText="Identifying demographic or institutional bias in the South African context."
            />
          </div>

          {/* Pillar 4: Transparency & Disclosure */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                PILLAR 04 · TRANSPARENCY
              </span>
              <h3 className="text-sm font-bold text-[#052B66] flex items-center gap-1.5 mt-0.5">
                <Check className="w-4 h-4 text-[#45CC42] stroke-[2.5]" />
                <span>Transparency & Attribution</span>
              </h3>
            </div>

            <EditorialField
              label="[AI DISCLOSURE & ATTRIBUTION STANDARD]"
              value={ethics.aiDisclosureRequirement}
              onChange={val => handleUpdateField('aiDisclosureRequirement', val)}
              placeholder="e.g. Include disclosure notice 'Drafted with AI assistance, verified and approved by [Employee Name]' on official reports."
              multiline
              rows={3}
              helperText="Clear standards on when and how to disclose AI-assisted work."
            />
          </div>
        </div>
      )}

      {activeTab === 'cards' && (
        /* Slide 30: 8 Ethical Dimensions Grid */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              SLIDE 30 · 8 ETHICAL DIMENSIONS
            </span>
            <h3 className="text-sm font-bold text-[#052B66]">
              [COMPREHENSIVE ETHICAL RESPONSIBILITY FRAMEWORK]
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-[10px] font-black text-[#052B66] uppercase">01 · Privacy & Data</span>
              <h4 className="text-xs font-bold text-slate-900">Zero-PII Input Rule</h4>
              <p className="text-[11px] text-slate-600">POPIA compliance, automatic redaction, and no public cloud data ingestion.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-[10px] font-black text-[#052B66] uppercase">02 · Human Agency</span>
              <h4 className="text-xs font-bold text-slate-900">Human Sign-Off Gate</h4>
              <p className="text-[11px] text-slate-600">No autonomous client-facing outputs without certified human review.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-[10px] font-black text-[#052B66] uppercase">03 · Bias Mitigation</span>
              <h4 className="text-xs font-bold text-slate-900">Cultural & Demographic</h4>
              <p className="text-[11px] text-slate-600">Auditing outputs for South African linguistic and socio-economic equity.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-[10px] font-black text-[#052B66] uppercase">04 · Transparency</span>
              <h4 className="text-xs font-bold text-slate-900">Attribution Notice</h4>
              <p className="text-[11px] text-slate-600">Explicit disclosure of synthetic generation in corporate publications.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-[10px] font-black text-[#052B66] uppercase">05 · Intellectual Property</span>
              <h4 className="text-xs font-bold text-slate-900">Copyright & Citations</h4>
              <p className="text-[11px] text-slate-600">Protecting proprietary IP and verifying external copyright limits.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-[10px] font-black text-[#052B66] uppercase">06 · System Integrity</span>
              <h4 className="text-xs font-bold text-slate-900">Hallucination Audits</h4>
              <p className="text-[11px] text-slate-600">Mandatory 3-point cross-reference of numerical and statutory data.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-[10px] font-black text-[#052B66] uppercase">07 · Psychological Safety</span>
              <h4 className="text-xs font-bold text-slate-900">Blameless Error Logging</h4>
              <p className="text-[11px] text-slate-600">Encouraging early error reporting without fear of punitive action.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-[10px] font-black text-[#052B66] uppercase">08 · Accountability</span>
              <h4 className="text-xs font-bold text-slate-900">Legal Responsibility</h4>
              <p className="text-[11px] text-slate-600">Clear chain of custody and signed approvals for all workflow assets.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'governance' && (
        /* Slide 31 & 32: Decision Gates & Sovereignty */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                SLIDE 31 · DECISION GATES
              </span>
              <h3 className="text-sm font-bold text-[#052B66]">
                [HUMAN-IN-THE-LOOP DECISION PROTOCOL]
              </h3>
            </div>

            <EditorialField
              label="[DECISION MAKING & ESCALATION PROTOCOL]"
              value={ethics.decisionMakingFramework || 'Tier 1 low-risk tasks self-certified by operator; Tier 2 customer-facing tasks require peer sign-off; Tier 3 legal/financial require department head sign-off.'}
              onChange={val => handleUpdateField('decisionMakingFramework', val)}
              multiline
              rows={3}
              helperText="Clear rules dictating when human review and escalation are required."
            />

            <EditorialField
              label="[PSYCHOLOGICAL SAFETY & ERROR DISCLOSURE]"
              value={ethics.psychologicalSafetyNotes || 'Non-punitive reporting channel for synthetic inaccuracies, prompt failures, and near-miss compliance incidents.'}
              onChange={val => handleUpdateField('psychologicalSafetyNotes', val)}
              multiline
              rows={3}
              helperText="Creating an open workplace culture around AI error discovery."
            />
          </div>

          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                SLIDE 32 · SOVEREIGNTY & WORKFORCE
              </span>
              <h3 className="text-sm font-bold text-[#052B66]">
                [DATA SOVEREIGNTY & WORKFORCE IMPACT]
              </h3>
            </div>

            <EditorialField
              label="[DATA SOVEREIGNTY & JURISDICTION]"
              value={ethics.dataSovereigntyContext || 'Adherence to South African cross-border data transfer regulations under POPIA Section 72.'}
              onChange={val => handleUpdateField('dataSovereigntyContext', val)}
              multiline
              rows={3}
              helperText="Legal jurisdiction and cloud data location boundaries."
            />

            <EditorialField
              label="[AI WORKFORCE IMPACT & AUGMENTATION]"
              value={ethics.aiWorkforceImpactNarrative || 'Positions AI as an augmentation tool to elevate professional capability, reduce tedious manual rework, and boost high-value strategic time.'}
              onChange={val => handleUpdateField('aiWorkforceImpactNarrative', val)}
              multiline
              rows={3}
              helperText="Constructive framing of automation impact on job roles."
            />
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={onBack}
          className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Learning Design</span>
        </button>

        <button
          id="section-06-continue-btn"
          onClick={onContinue}
          className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Continue to Output Format (Section 07) →</span>
        </button>
      </div>

      {/* Slide Footer */}
      <SlideFooter currentSlide="29" totalSlides="39" />
    </div>
  );
};
