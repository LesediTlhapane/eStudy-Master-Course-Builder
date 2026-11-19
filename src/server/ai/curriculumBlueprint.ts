import type { Course, AIProvider } from '../../types.js';
import type { AIRequest, AIResponse } from './types.js';
import { aiRouter } from './aiRouter.js';

export type SubjectDomainCategory =
  | 'cloud_engineering'
  | 'generative_ai_business'
  | 'human_resource_management'
  | 'mechanical_engineering'
  | 'financial_services'
  | 'emotional_intelligence'
  | 'cybersecurity_it'
  | 'healthcare'
  | 'general';

export interface DomainRuleSpec {
  category: SubjectDomainCategory;
  label: string;
  positiveKeywords: string[];
  /** Signature terms unique to this domain that indicate cross-domain bleed when found in unrelated subjects */
  exclusiveBleedSignatures: string[];
  applicableSouthAfricanFrameworks: string[];
}

export const DOMAIN_SPECS: Record<SubjectDomainCategory, DomainRuleSpec> = {
  cloud_engineering: {
    category: 'cloud_engineering',
    label: 'Cloud Engineering, Infrastructure & DevOps',
    positiveKeywords: [
      'cloud', 'infrastructure', 'aws', 'azure', 'gcp', 'kubernetes', 'container',
      'terraform', 'iac', 'vpc', 'iam', 'serverless', 'compute', 'storage',
      'finops', 'cost optimisation', 'cost optimization', 'ci/cd', 'deployment',
      'observability', 'availability', 'subnet', 'load balancer', 'microservice', 'devops'
    ],
    exclusiveBleedSignatures: [],
    applicableSouthAfricanFrameworks: [
      'POPIA Act 4 of 2013 (where personal data is hosted or processed across cloud regions)',
      'King IV Principle 12 (Technology & Information Governance — Verify applicability)'
    ]
  },
  generative_ai_business: {
    category: 'generative_ai_business',
    label: 'Generative AI for Business & Enterprise Productivity',
    positiveKeywords: [
      'generative ai', 'llm', 'prompt', 'business', 'workflow', 'automation',
      'hallucination', 'rag', 'copilot', 'summarisation', 'summarization', 'productivity',
      'human-in-the-loop', 'enterprise ai', 'ai governance', 'knowledge work', 'use case'
    ],
    exclusiveBleedSignatures: [],
    applicableSouthAfricanFrameworks: [
      'POPIA Act 4 of 2013 (Personal Information & Section 71 automated decisions)',
      'King IV Principle 12 (Technology & Information Governance)'
    ]
  },
  human_resource_management: {
    category: 'human_resource_management',
    label: 'Human Resource Management & People Operations',
    positiveKeywords: [
      'human resource', 'hr', 'recruitment', 'talent', 'onboarding', 'performance',
      'appraisal', 'employee', 'labour', 'labor', 'ccma', 'disciplinary',
      'remuneration', 'payroll', 'retention', 'succession', 'skills development', 'workforce'
    ],
    exclusiveBleedSignatures: [],
    applicableSouthAfricanFrameworks: [
      'Labour Relations Act (LRA 66 of 1995 — Verify applicable sections with HR/Legal SME)',
      'Basic Conditions of Employment Act (BCEA 75 of 1997 — Verify applicability)',
      'Employment Equity Act (EEA 55 of 1998 — Verify applicability)',
      'POPIA Act 4 of 2013 (Employee Personal Information)'
    ]
  },
  mechanical_engineering: {
    category: 'mechanical_engineering',
    label: 'Mechanical Engineering, CAD/CAE & Asset Reliability',
    positiveKeywords: [
      'mechanical', 'cad', 'fea', 'cfd', 'topology', 'solidworks', 'ansys',
      'vibration', 'bearing', 'pump', 'cavitation', 'thermodynamic', 'stress',
      'fatigue', 'tolerance', 'welding', 'fmea', 'maintenance', 'millwright', 'machinery'
    ],
    exclusiveBleedSignatures: [
      'generative cad',
      'topology optimisation',
      'finite element analysis',
      'von mises stress',
      'rans cfd',
      'pressure vessel',
      'sans 347',
      'centrifugal pump',
      'bearing spalling',
      'pump cavitation',
      'jaw crusher',
      'vibration fft',
      'fft vibration',
      'millwright',
      'drawing office',
      'welding callouts',
      'ecsa pr eng',
      'sap pm'
    ],
    applicableSouthAfricanFrameworks: [
      'Engineering Council of South Africa (ECSA) Code of Conduct (Verify Pr Eng/CPD alignment)',
      'Occupational Health and Safety Act 85 of 1993 (Verify Driven Machinery / Pressure Equipment applicability)',
      'POPIA Act 4 of 2013 (Proprietary IP & staff records)'
    ]
  },
  financial_services: {
    category: 'financial_services',
    label: 'Financial Literacy, Banking & Risk Operations',
    positiveKeywords: [
      'financial', 'finance', 'budget', 'credit', 'lending', 'cash flow',
      'interest', 'investment', 'fraud', 'reconciliation', 'accounting', 'audit', 'banking'
    ],
    exclusiveBleedSignatures: [
      'robo-advisor',
      'national credit act',
      'nca act 34',
      'reckless credit',
      'reckless lending',
      'fsca market conduct',
      'voice cloning eft',
      'retail lending underwriting'
    ],
    applicableSouthAfricanFrameworks: [
      'Financial Sector Conduct Authority (FSCA — Verify regulatory alignment)',
      'National Credit Act 34 of 2005 (Verify applicability)',
      'POPIA Act 4 of 2013'
    ]
  },
  emotional_intelligence: {
    category: 'emotional_intelligence',
    label: 'Emotional Intelligence, Leadership & Communication',
    positiveKeywords: [
      'emotional intelligence', 'empathy', 'self-awareness', 'self-regulation',
      'conflict', 'de-escalation', 'interpersonal', 'leadership', 'psychological safety',
      'active listening', 'communication', 'goleman'
    ],
    exclusiveBleedSignatures: [
      'goleman emotional',
      'emotional trigger audit',
      'defensive reaction de-escalation'
    ],
    applicableSouthAfricanFrameworks: [
      'King IV Ethical Leadership Principles (Verify applicability)',
      'POPIA Act 4 of 2013 (Confidential HR/coaching notes)'
    ]
  },
  cybersecurity_it: {
    category: 'cybersecurity_it',
    label: 'Cybersecurity, Network & Information Security',
    positiveKeywords: [
      'cyber', 'security', 'zero trust', 'phishing', 'ransomware', 'firewall',
      'soc', 'siem', 'vulnerability', 'penetration', 'incident response', 'encryption'
    ],
    exclusiveBleedSignatures: [
      'ransomware containment',
      'siem correlation rule',
      'penetration test exploit'
    ],
    applicableSouthAfricanFrameworks: [
      'Cybercrimes Act 19 of 2020 (Verify applicability)',
      'POPIA Act 4 of 2013 (Section 19 & Section 22 breach notification)'
    ]
  },
  healthcare: {
    category: 'healthcare',
    label: 'Healthcare & Clinical Practice',
    positiveKeywords: [
      'healthcare', 'clinical', 'patient', 'hospital', 'nursing', 'diagnosis', 'medical', 'pharma'
    ],
    exclusiveBleedSignatures: [
      'clinical dosage',
      'patient triage',
      'surgical theatre',
      'hpcsa clinical'
    ],
    applicableSouthAfricanFrameworks: [
      'National Health Act (Verify applicability)',
      'POPIA Act 4 of 2013 (Special Personal Information — Health)'
    ]
  },
  general: {
    category: 'general',
    label: 'Applied Workplace & Professional Development',
    positiveKeywords: [],
    exclusiveBleedSignatures: [],
    applicableSouthAfricanFrameworks: [
      'POPIA Act 4 of 2013 (where personal information is processed)',
      'King IV Principle 12 (Technology Governance — where applicable)'
    ]
  }
};

export interface BlueprintLessonPlan {
  id: string;
  title: string;
  purpose: string;
  progressionStage:
    | 'Foundation & Mental Model'
    | 'Core Architecture & Execution'
    | 'Applied Decision & Optimisation'
    | 'Governance & Verification';
  /** Legacy alias kept in sync with conceptsToExplain */
  conceptsToTeach: string[];
  /** Legacy alias kept in sync with subjectExamples[0] */
  workedExampleTopic: string;
  avoidRepeating: string[];
  // 7 mandatory lesson planning dimensions
  knowledgeToAcquire: string[];
  conceptsToExplain: string[];
  keyTerminology: string[];
  subjectExamples: string[];
  practicalSkills: string[];
  commonMisconceptions: string[];
  demonstrationMethod: string;
}

export interface BlueprintPracticalTaskSpec {
  title: string;
  // 10 mandatory practical task elements (plus legacy aliases)
  learningObjective: string;
  objective: string;
  scenarioOrTask: string;
  realisticScenario: string;
  requiredResources: string[];
  resourcesRequired: string[];
  clearInstructions: string;
  sequentialSteps: string[];
  expectedDeliverable: string;
  deliverable: string;
  successCriteria: string[];
  rubricCriteria: string[];
  reflectionPrompt: string;
}

export interface BlueprintModulePlan {
  moduleId: string;
  moduleNumber: number;
  title: string;
  purpose: string;
  learningObjectives: Array<{ id: string; code: string; statement: string; bloomLevel: string }>;
  lessonPlans: BlueprintLessonPlan[];
  scenarioContexts: Array<{
    title: string;
    type: 'Workplace' | 'AI Specific';
    organisationType: string;
    cityOrSetting: string;
    coreDilemma: string;
  }>;
  practicalTaskSpec: BlueprintPracticalTaskSpec;
  assessmentTargets: Array<{
    objectiveCode: string;
    conceptTested: string;
    cognitiveLevel: 'Recall' | 'Explanation' | 'Application';
  }>;
}

export interface CurriculumBlueprint {
  subjectTitle: string;
  courseCode: string;
  courseDescription: string;
  keyCompetencies: string;
  programmeOutcomes: string[];
  aiToolsPlatform: string;
  domainCategory: SubjectDomainCategory;
  domainLabel: string;
  targetAudience: string;
  learnerLevel: string;
  estimatedDuration: string;
  requiredDomainConcepts: string[];
  outOfScopeDomains: Array<{ domain: string; forbiddenTerms: string[] }>;
  regulatoryGrounding: {
    applicableFrameworks: string[];
    verifiedSourceNames: string[];
    strictTruthRule: string;
  };
  modules: BlueprintModulePlan[];
  alignmentChecksPassed: boolean;
  planningSource?: 'ai' | 'deterministic';
  validationNotes: string[];
}

interface DomainCurriculumSeed {
  coreConcepts: string[];
  terminology: string[];
  misconceptions: string[];
  exampleTopics: string[];
  practicalDeliverableNoun: string;
  practicalToolHint: string;
}

const DOMAIN_CURRICULUM_SEEDS: Record<SubjectDomainCategory, DomainCurriculumSeed> = {
  generative_ai_business: {
    coreConcepts: [
      'Large Language Models & Next-Token Prediction',
      'Context Windows, Tokens & Attention Limits',
      'Pre-Training vs Fine-Tuning vs Prompt Grounding',
      'Retrieval-Augmented Generation (RAG) & Grounded Answers',
      'Model Hallucinations & Confidence Calibration',
      'Structured Prompt Engineering & Output Constraints',
      'Data Privacy & Enterprise Governance (Section 71 / PII Redaction)'
    ],
    terminology: [
      'Tokenisation',
      'Context Window',
      'Temperature / Sampling',
      'Hallucination',
      'Grounding / RAG',
      'System Prompt & Few-Shot Examples',
      'Human-in-the-Loop (HITL)'
    ],
    misconceptions: [
      'Assuming LLMs retrieve verified facts from a live database rather than predicting statistically plausible token sequences',
      'Believing longer prompts or polite phrasing automatically eliminate factual hallucinations without external source grounding',
      'Treating high fluency or confident tone as proof of accuracy or legal validity'
    ],
    exampleTopics: [
      'Deconstructing how an LLM generates a plausible yet fabricated contract clause when context is underspecified',
      'Designing a constrained prompt with role, explicit schema, few-shot examples, and grounding passages for quarterly reporting',
      'Comparing zero-shot prompting against RAG-grounded synthesis over internal policy documents'
    ],
    practicalDeliverableNoun: 'Iterative Prompt & Grounded Output Evaluation Portfolio',
    practicalToolHint: 'Approved enterprise LLM workspace, sample domain brief, and evaluation rubric'
  },
  cloud_engineering: {
    coreConcepts: [
      'Shared Responsibility Model & Cloud Compute/Storage Primitives',
      'Virtual Private Clouds (VPC), Subnets, Routing & Availability Zones',
      'Infrastructure as Code (IaC) State, Modules & Drift Control',
      'CI/CD Deployment Pipelines, Canary Releases & Rollbacks',
      'IAM Least-Privilege Policies & Network Segmentation',
      'Observability Telemetry (Logs, Metrics, Traces) & FinOps Right-Sizing'
    ],
    terminology: [
      'CIDR Block & Subnetting',
      'Availability Zone vs Region',
      'Terraform State & Drift',
      'Least-Privilege IAM Policy',
      'Canary & Blue-Green Deployment',
      'FinOps Tagging & Right-Sizing'
    ],
    misconceptions: [
      'Assuming cloud high availability happens automatically without multi-AZ subnet design and health-checked load balancing',
      'Editing live console settings after Terraform deployment without reconciling state files (causing silent IaC drift)',
      'Over-provisioning compute sizes for safety instead of matching autoscaling policies and workload profiles'
    ],
    exampleTopics: [
      'Designing a two-tier VPC subnet layout across public and private availability zones with NAT gateway routing',
      'Tracing a Terraform state conflict and writing a clean deployment pipeline rollback stage',
      'Auditing an overly permissive wildcard IAM role and calculating monthly cloud savings via FinOps tagging'
    ],
    practicalDeliverableNoun: 'Cloud Architecture & IaC Deployment Specification',
    practicalToolHint: 'Cloud architecture diagramming workspace, sample Terraform module, and cost calculator'
  },
  human_resource_management: {
    coreConcepts: [
      'Competency-Based Job Analysis & Structured Recruitment',
      'Structured Behavioural Interviewing & Bias Mitigation',
      '90-Day Onboarding & Psychological Contract Alignment',
      'Continuous Performance Management & Objective Calibration',
      'Fair Workplace Discipline & Grievance Procedure',
      'Total Rewards Equity, Retention Diagnostics & Employee Data Privacy'
    ],
    terminology: [
      'Competency Framework',
      'Anchored Rating Scale',
      'Procedural vs Substantive Fairness',
      'Performance Improvement Plan (PIP)',
      'Pay Band Compression',
      'Informed Employee Consent'
    ],
    misconceptions: [
      'Relying on unstructured gut-feel interviews rather than standardised job-related behavioural rubrics',
      'Equating annual appraisal scores solely with coaching instead of ongoing clear expectations and documented support',
      'Assuming rapid dismissal is lawful without first establishing both substantive reason and fair procedure'
    ],
    exampleTopics: [
      'Converting vague job descriptions into a weighted behavioural interview scorecard for a mid-level hire',
      'Structuring a fair performance feedback conversation supported by observable role outcomes and coaching milestones',
      'Designing an ethical employee onboarding checklist protecting candidate personal records under applicable privacy rules'
    ],
    practicalDeliverableNoun: 'Structured Talent & Performance Decision Pack',
    practicalToolHint: 'Role competency matrix, interview scorecard template, and coaching guide'
  },
  mechanical_engineering: {
    coreConcepts: [
      'Structural Load Paths, Stress Concentration & Factor of Safety',
      'CAD Parametric Modelling & GD&T Tolerance Stack-Up',
      'Finite Element Analysis (FEA) Boundary Conditions & Mesh Convergence',
      'Fluid Systems, Pump Curves & Cavitation NPSH Margins',
      'Reliability-Centred Maintenance (FMEA & Condition Monitoring)'
    ],
    terminology: [
      'Von Mises Stress',
      'Mesh Convergence',
      'GD&T Datum Frame',
      'Net Positive Suction Head (NPSH)',
      'Failure Mode & Effects Analysis (FMEA)'
    ],
    misconceptions: [
      'Trusting colourful FEA stress contours without verifying boundary constraints, load units, and mesh independence',
      'Tightening machining tolerances uniformly instead of applying GD&T only to functional mating interfaces'
    ],
    exampleTopics: [
      'Evaluating mesh convergence and boundary fixity errors in a bracket load simulation',
      'Diagnosing centrifugal pump cavitation from suction piping losses and NPSH margins'
    ],
    practicalDeliverableNoun: 'Engineering Design & Verification Calculation Brief',
    practicalToolHint: 'CAD/FEA parameter sheet, pump/system curve data, and FMEA worksheet'
  },
  financial_services: {
    coreConcepts: [
      'Cash Flow Forecasting, Working Capital & Liquidity Ratios',
      'Time Value of Money, Interest Compounding & Credit Pricing',
      'Risk Underwriting, Affordability Assessment & Fraud Indicators',
      'Internal Controls, Reconciliation & Market Conduct Governance'
    ],
    terminology: [
      'Net Present Value (NPV)',
      'Debt-Service Coverage Ratio',
      'Working Capital Cycle',
      'Reconciliation Variance',
      'Conduct Risk'
    ],
    misconceptions: [
      'Confusing accounting profitability with positive operating cash flow timing',
      'Focusing exclusively on headline interest rate without total cost of credit and liquidity buffer stress'
    ],
    exampleTopics: [
      'Building a 13-week rolling cash flow projection to identify seasonal working capital strain',
      'Evaluating an SME credit application using cash-conversion ratios and stress sensitivity'
    ],
    practicalDeliverableNoun: 'Financial Risk & Cash-Flow Analysis Memorandum',
    practicalToolHint: 'Financial statement extract, cash-flow spreadsheet model, and ratio worksheet'
  },
  emotional_intelligence: {
    coreConcepts: [
      'Self-Awareness, Emotional Triggers & Cognitive Appraisal',
      'Self-Regulation & Constructive Impulse Management',
      'Empathy, Active Listening & Perspective Taking',
      'Psychological Safety, Conflict De-Escalation & Feedback Delivery'
    ],
    terminology: [
      'Emotional Trigger',
      'Cognitive Reappraisal',
      'Psychological Safety',
      'Non-Defensive Framing',
      'Active Reflective Listening'
    ],
    misconceptions: [
      'Confusing emotional intelligence with suppressing emotions or avoiding difficult accountability conversations',
      'Treating empathy as agreeing with every viewpoint rather than accurately understanding another person’s perspective'
    ],
    exampleTopics: [
      'Reframing a tense cross-team escalation using Situation-Behaviour-Impact feedback',
      'Mapping personal stress triggers before leading a high-stakes stakeholder alignment meeting'
    ],
    practicalDeliverableNoun: 'Applied Leadership & Difficult Conversation Playbook',
    practicalToolHint: 'Communication reflection journal, SBI feedback template, and scenario script'
  },
  cybersecurity_it: {
    coreConcepts: [
      'Threat Modelling, Attack Surface & CIA Triad',
      'Zero Trust Architecture, Identity & Access Hardening',
      'Vulnerability Triage, Patch Prioritisation & Network Defence',
      'Incident Response Lifecycle (Containment, Eradication, Recovery)'
    ],
    terminology: [
      'Zero Trust',
      'Lateral Movement',
      'Principle of Least Privilege',
      'Mean Time to Contain (MTTC)',
      'Security Telemetry'
    ],
    misconceptions: [
      'Treating perimeter firewalls alone as sufficient without identity segmentation and endpoint telemetry',
      'Prioritising raw CVSS scores blindly without considering exploitability and asset exposure'
    ],
    exampleTopics: [
      'Triaging a suspected credential phishing compromise through identity logs and session revocation',
      'Applying STRIDE threat modelling to an internet-facing API gateway'
    ],
    practicalDeliverableNoun: 'Threat Model & Incident Containment Playbook',
    practicalToolHint: 'Architecture diagram, sample security event log, and risk triage matrix'
  },
  healthcare: {
    coreConcepts: [
      'Evidence-Based Clinical Decision Making & Patient Safety',
      'Therapeutic Communication & Informed Patient Consent',
      'Clinical Handover Precision & Adverse Event Prevention',
      'Health Information Confidentiality & Ethical Recordkeeping'
    ],
    terminology: [
      'ISBAR Handover',
      'Informed Consent',
      'Triage Acuity',
      'Special Personal Health Information',
      'Clinical Audit'
    ],
    misconceptions: [
      'Relying on informal verbal ward handovers instead of structured ISBAR escalation checks',
      'Assuming digital clinical summaries replace direct verification of allergies and medication dosages'
    ],
    exampleTopics: [
      'Structuring an ISBAR clinical escalation for a deteriorating patient without omitting critical vitals',
      'Reviewing health data sharing boundaries before transferring patient referral summaries'
    ],
    practicalDeliverableNoun: 'Clinical Safety & Handover Protocol Brief',
    practicalToolHint: 'De-identified clinical case summary and ISBAR structured communication guide'
  },
  general: {
    coreConcepts: [
      'First-Principles Problem Framing & Scope Definition',
      'Core Domain Mechanics, Decision Criteria & Trade-Offs',
      'Practical Execution Techniques & Edge-Case Handling',
      'Outcome Evaluation, Stakeholder Alignment & Continuous Improvement'
    ],
    terminology: [
      'Decision Criterion',
      'Root Cause vs Symptom',
      'Trade-Off Analysis',
      'Quality Threshold',
      'Feedback Loop'
    ],
    misconceptions: [
      'Applying superficial rules-of-thumb without understanding the underlying domain mechanism or constraints',
      'Measuring activity volume rather than verified quality and real learner/stakeholder outcomes'
    ],
    exampleTopics: [
      'Working step by step through a realistic domain scenario showing both an effective approach and a common pitfall',
      'Evaluating trade-offs between speed, cost, and quality when selecting a solution approach'
    ],
    practicalDeliverableNoun: 'Applied Subject Portfolio Artefact',
    practicalToolHint: 'Subject reference guide, domain problem brief, and assessment rubric'
  }
};

export function classifySubjectDomain(course: Course): SubjectDomainCategory {
  const s = course.structure || ({} as any);
  const p = course.problem || ({} as any);
  const modText = (course.modules || []).map(m => `${m.title} ${m.purpose}`).join(' ');
  const haystack = `${s.title || course.name || ''} ${s.industryDomain || ''} ${s.industryContext || ''} ${p.taskOrSkill || ''} ${modText}`.toLowerCase();

  // Score each specialized domain carefully; prioritize title + industryDomain strongly
  const primaryText = `${s.title || course.name || ''} ${s.industryDomain || ''}`.toLowerCase();

  const scoreCategory = (cat: SubjectDomainCategory): number => {
    const spec = DOMAIN_SPECS[cat];
    let score = 0;
    for (const kw of spec.positiveKeywords) {
      if (primaryText.includes(kw)) score += 4;
      else if (haystack.includes(kw)) score += 1;
    }
    return score;
  };

  const candidates: SubjectDomainCategory[] = [
    'cloud_engineering',
    'generative_ai_business',
    'human_resource_management',
    'mechanical_engineering',
    'financial_services',
    'emotional_intelligence',
    'cybersecurity_it',
    'healthcare'
  ];

  let bestCat: SubjectDomainCategory = 'general';
  let bestScore = 0;

  for (const cat of candidates) {
    const sc = scoreCategory(cat);
    if (sc > bestScore) {
      bestScore = sc;
      bestCat = cat;
    }
  }

  return bestScore >= 4 ? bestCat : 'general';
}

export function extractSubjectKeywords(course: Course): string[] {
  const s = course.structure || ({} as any);
  const p = course.problem || ({} as any);
  const domainCat = classifySubjectDomain(course);
  const domainWords = DOMAIN_SPECS[domainCat].positiveKeywords;

  const stopWords = new Set([
    'course', 'module', 'lesson', 'training', 'programme', 'program', 'estudy',
    'south', 'africa', 'african', 'workplace', 'using', 'applied', 'introduction',
    'foundations', 'fundamentals', 'beginners', 'intermediate', 'advanced', 'practical',
    'with', 'from', 'into', 'that', 'this', 'their', 'these', 'those', 'about',
    'for', 'and', 'the', 'use', 'your', 'our', 'will', 'how', 'why', 'what'
  ]);

  const rawText = [
    s.title || course.name || '',
    s.industryDomain || '',
    s.keyCompetencies || '',
    p.taskOrSkill || '',
    ...(course.modules || []).map(m => `${m.title} ${Array.isArray(m.keySkills) ? m.keySkills.join(' ') : String(m.keySkills || '')}`)
  ].join(' ');

  const tokens = (rawText.toLowerCase().match(/[a-z][a-z0-9\-/]{2,}/g) || [])
    .filter(tok => !stopWords.has(tok));

  const counts = new Map<string, number>();
  for (const tok of tokens) {
    counts.set(tok, (counts.get(tok) || 0) + 1);
  }

  const ranked = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);

  return Array.from(new Set([...ranked.slice(0, 14), ...domainWords.slice(0, 10)]));
}

export function buildOutOfScopeRules(
  course: Course,
  domainCat: SubjectDomainCategory
): Array<{ domain: string; forbiddenTerms: string[] }> {
  const fullContext = `${course.structure?.title || course.name || ''} ${course.structure?.industryDomain || ''} ${course.problem?.taskOrSkill || ''}`.toLowerCase();

  const rules: Array<{ domain: string; forbiddenTerms: string[] }> = [];
  for (const [catKey, spec] of Object.entries(DOMAIN_SPECS)) {
    const cat = catKey as SubjectDomainCategory;
    if (cat === domainCat || spec.exclusiveBleedSignatures.length === 0) continue;

    // Only enforce exclusion if none of that domain's core title words appear legitimately in user's hybrid course
    const overlapsSubject = spec.positiveKeywords.slice(0, 3).some(kw => fullContext.includes(kw));
    if (!overlapsSubject) {
      rules.push({
        domain: spec.label,
        forbiddenTerms: spec.exclusiveBleedSignatures
      });
    }
  }
  return rules;
}

export function buildDeterministicBlueprint(course: Course): CurriculumBlueprint {
  const s = course.structure || ({} as any);
  const p = course.problem || ({} as any);
  const r = course.research || ({} as any);

  const subjectTitle = (s.title || course.name || 'Untitled Course').trim();
  const courseCode = (s.code || course.code || 'EST-COURSE-01').trim();
  const domainCategory = classifySubjectDomain(course);
  const domainSpec = DOMAIN_SPECS[domainCategory];
  const domainSeed = DOMAIN_CURRICULUM_SEEDS[domainCategory];
  const subjectKeywords = extractSubjectKeywords(course);

  const verifiedSourceNames = (r.sources || [])
    .filter((src: any) => src.status === 'Verified')
    .map((src: any) => src.name)
    .filter(Boolean);

  const outOfScopeDomains = buildOutOfScopeRules(course, domainCategory);
  const sourceModules = Array.isArray(course.modules) && course.modules.length > 0 ? course.modules : [];

  const settingsPool = [
    { org: 'Cape Town Digital Platform & Services Team', city: 'Cape Town' },
    { org: 'Johannesburg National Commercial Enterprise', city: 'Johannesburg' },
    { org: 'Pretoria Institutional & Public Operations Unit', city: 'Pretoria' },
    { org: 'Durban Logistics & Regional Operations Hub', city: 'Durban' },
    { org: 'Midrand Enterprise Shared Services Centre', city: 'Midrand' },
    { org: 'Gqeberha Regional Operations & Advisory Division', city: 'Gqeberha' }
  ];

  const progressionStages: BlueprintLessonPlan['progressionStage'][] = [
    'Foundation & Mental Model',
    'Core Architecture & Execution',
    'Applied Decision & Optimisation',
    'Governance & Verification'
  ];

  const modules: BlueprintModulePlan[] = sourceModules.map((mod: any, mIdx: number) => {
    const modNum = mod.number || mod.moduleNumber || mIdx + 1;
    const modTitle = (mod.title || `Module ${modNum}`).trim();
    const modObjectivesRaw: string[] =
      Array.isArray(mod.learningObjectives) && mod.learningObjectives.length > 0
        ? mod.learningObjectives.map((o: any) => (typeof o === 'string' ? o : o?.statement || '')).filter(Boolean)
        : [
            `Explain the core mechanisms and principles behind ${modTitle} in ${subjectTitle}`,
            `Apply domain techniques taught in ${modTitle} to solve realistic ${subjectTitle} tasks`,
            `Evaluate trade-offs, limitations, and quality criteria in ${modTitle}`
          ];

    const learningObjectives = modObjectivesRaw.map((stmt, oIdx) => ({
      id: `lo-${modNum}-${oIdx + 1}`,
      code: `LO ${modNum}.${oIdx + 1}`,
      statement: stmt,
      bloomLevel: oIdx === 0 ? 'Understand' : oIdx === 1 ? 'Apply' : 'Evaluate'
    }));

    const configuredLessons = Array.isArray(mod.lessons) && mod.lessons.length > 0 ? mod.lessons : null;
    const targetLessonCount = configuredLessons ? configuredLessons.length : 3;

    const defaultLessonTitles = [
      `${modTitle}: Core Mechanisms & Mental Models`,
      `${modTitle}: Applied Technique & Worked Practice`,
      `${modTitle}: Trade-Offs, Limitations & Critical Evaluation`
    ];

    const lessonPlans: BlueprintLessonPlan[] = Array.from({ length: targetLessonCount }).map((_, lIdx) => {
      const cfgLesson = configuredLessons?.[lIdx];
      const lTitle = (cfgLesson?.title || defaultLessonTitles[lIdx] || `${modTitle}: Part ${lIdx + 1}`).trim();
      const stage = progressionStages[lIdx % progressionStages.length];
      const seedIdx = (mIdx * targetLessonCount + lIdx) % domainSeed.coreConcepts.length;
      const conceptPair = [
        domainSeed.coreConcepts[seedIdx],
        domainSeed.coreConcepts[(seedIdx + 1) % domainSeed.coreConcepts.length]
      ];
      const modSkillHint = Array.isArray(mod.keySkills) && mod.keySkills[lIdx] ? mod.keySkills[lIdx] : conceptPair[0];
      const conceptsToExplain =
        Array.isArray(cfgLesson?.concepts) && cfgLesson.concepts.length > 0
          ? cfgLesson.concepts.map(String)
          : Array.from(new Set([modSkillHint, ...conceptPair])).slice(0, 3);
      const keyTerminology = [
        domainSeed.terminology[seedIdx % domainSeed.terminology.length],
        domainSeed.terminology[(seedIdx + 1) % domainSeed.terminology.length]
      ];
      const exampleTopic = domainSeed.exampleTopics[seedIdx % domainSeed.exampleTopics.length];
      const misconception = domainSeed.misconceptions[seedIdx % domainSeed.misconceptions.length];

      return {
        id: cfgLesson?.id || `lesson-${modNum}-${lIdx + 1}`,
        title: lTitle,
        purpose:
          cfgLesson?.purpose ||
          `Build ${stage.toLowerCase()} mastery of ${lTitle} through clear conceptual explanations, domain examples, and applied practice.`,
        progressionStage: stage,
        conceptsToTeach: conceptsToExplain,
        workedExampleTopic: exampleTopic,
        avoidRepeating: [],
        knowledgeToAcquire: [
          `Foundational principles and real-world role of ${conceptsToExplain[0]} within ${subjectTitle}`,
          `How ${conceptsToExplain[1] || modTitle} behaves under practical workplace constraints`
        ],
        conceptsToExplain,
        keyTerminology,
        subjectExamples: [exampleTopic],
        practicalSkills: [
          `Design and apply ${conceptsToExplain[0]} appropriately for ${s.targetRoles || p.targetGroup || 'target practitioners'}`,
          `Diagnose limitations and refine ${conceptsToExplain[1] || lTitle} outputs using evidence`
        ],
        commonMisconceptions: [misconception],
        demonstrationMethod: `Explain how ${conceptsToExplain[0]} works in own words and apply it to an authentic ${modTitle} scenario`
      };
    });

    for (let i = 0; i < lessonPlans.length; i++) {
      lessonPlans[i].avoidRepeating = lessonPlans
        .filter((_, j) => j !== i)
        .map(other => other.title);
    }

    const baseSettingA = settingsPool[(mIdx * 2) % settingsPool.length];
    const baseSettingB = settingsPool[(mIdx * 2 + 1) % settingsPool.length];
    const baseSettingC = settingsPool[(mIdx * 2 + 2) % settingsPool.length];
    const seedTerm = domainSeed.coreConcepts[mIdx % domainSeed.coreConcepts.length];

    const scenarioContexts = [
      {
        title: `${modTitle}: Conceptual & Design Trade-Off`,
        type: 'Workplace' as const,
        organisationType: baseSettingA.org,
        cityOrSetting: baseSettingA.city,
        coreDilemma: `Choosing an effective ${seedTerm} approach under realistic technical, resource, and stakeholder constraints`
      },
      {
        title: `${modTitle}: Applied Execution Bottleneck`,
        type: 'Workplace' as const,
        organisationType: baseSettingB.org,
        cityOrSetting: baseSettingB.city,
        coreDilemma: `Resolving practical failures or misunderstandings in ${modTitle} without sacrificing solution quality`
      },
      {
        title: `${modTitle}: Responsible Tooling & Critical Oversight`,
        type: 'AI Specific' as const,
        organisationType: baseSettingC.org,
        cityOrSetting: baseSettingC.city,
        coreDilemma: `Evaluating where automated/AI assistance adds genuine value to ${modTitle} versus where human domain judgement is essential`
      }
    ];

    const taskObjective = `Demonstrate applied mastery of ${learningObjectives[1]?.statement || modTitle} through an authentic ${subjectTitle} deliverable.`;
    const taskScenario = `Working as ${s.targetRoles || p.targetGroup || 'a practitioner'} in a ${baseSettingA.city} ${baseSettingA.org}, produce a solution applying ${seedTerm} and ${lessonPlans[0]?.conceptsToExplain[0] || modTitle}.`;
    const taskResources = [
      r.aiToolsPlatformName || s.toolsSystems || domainSeed.practicalToolHint,
      `Module ${modNum} reference concepts (${lessonPlans.map(l => l.title).join('; ')})`
    ];
    const sequentialSteps = [
      `Analyse the ${modTitle} problem brief and define target goals, constraints, and key assumptions for ${subjectTitle}.`,
      `Apply ${lessonPlans[0]?.conceptsToExplain[0] || modTitle} and ${lessonPlans[1]?.conceptsToExplain[0] || seedTerm} step by step to construct a working draft solution.`,
      `Test edge cases or evaluate outputs against the success criteria, refining weak areas with documented rationale.`
    ];
    const expectedDeliverable = `Module ${modNum} ${domainSeed.practicalDeliverableNoun}: ${modTitle}`;
    const successCriteria = [
      `Demonstrates accurate understanding of ${lessonPlans.map(l => l.conceptsToExplain[0]).join(' and ')}`,
      `Addresses the module constraints and explains key trade-offs clearly`,
      `Includes concrete evidence, worked reasoning, and personal reflection`
    ];
    const rubricCriteria = [
      `Conceptual accuracy & subject depth in ${modTitle} (40%)`,
      `Quality, completeness & practical feasibility of execution steps (35%)`,
      `Critical evaluation of trade-offs, limitations & learner reflection (25%)`
    ];
    const reflectionPrompt = `Which concept or misconception from ${modTitle} most changed how you will approach ${subjectTitle} in your role?`;

    const practicalTaskSpec: BlueprintPracticalTaskSpec = {
      title: `Module ${modNum} Applied Task: ${modTitle}`,
      learningObjective: taskObjective,
      objective: taskObjective,
      scenarioOrTask: taskScenario,
      realisticScenario: taskScenario,
      requiredResources: taskResources,
      resourcesRequired: taskResources,
      clearInstructions: `Complete the three sequential steps using the supplied module concepts and tools to produce ${expectedDeliverable}.`,
      sequentialSteps,
      expectedDeliverable,
      deliverable: expectedDeliverable,
      successCriteria,
      rubricCriteria,
      reflectionPrompt
    };

    const assessmentTargets = [
      { objectiveCode: learningObjectives[0]?.code || `LO ${modNum}.1`, conceptTested: lessonPlans[0]?.conceptsToExplain[0] || modTitle, cognitiveLevel: 'Recall' as const },
      { objectiveCode: learningObjectives[0]?.code || `LO ${modNum}.1`, conceptTested: lessonPlans[0]?.keyTerminology[0] || lessonPlans[0]?.title || modTitle, cognitiveLevel: 'Explanation' as const },
      { objectiveCode: learningObjectives[1]?.code || `LO ${modNum}.2`, conceptTested: lessonPlans[1]?.conceptsToExplain[0] || lessonPlans[1]?.title || modTitle, cognitiveLevel: 'Application' as const },
      { objectiveCode: learningObjectives[1]?.code || `LO ${modNum}.2`, conceptTested: lessonPlans[1]?.commonMisconceptions[0] || modTitle, cognitiveLevel: 'Application' as const },
      { objectiveCode: (learningObjectives[2] || learningObjectives[0])?.code || `LO ${modNum}.1`, conceptTested: lessonPlans[lessonPlans.length - 1]?.title || modTitle, cognitiveLevel: 'Application' as const }
    ];

    return {
      moduleId: mod.id || `module-${modNum}`,
      moduleNumber: modNum,
      title: modTitle,
      purpose: (mod.purpose || `Develop genuine conceptual mastery and applied skills in ${modTitle}.`).trim(),
      learningObjectives,
      lessonPlans,
      scenarioContexts,
      practicalTaskSpec,
      assessmentTargets
    };
  });

  const applicableFrameworks = r.regulatoryFramework?.trim()
    ? [r.regulatoryFramework.trim()]
    : verifiedSourceNames.length > 0
      ? domainSpec.applicableSouthAfricanFrameworks
      : ['To Be Confirmed (Requires SME Validation — no verified regulatory source supplied)'];

  const descriptionParts = [
    s.purposeStatement?.trim(),
    s.scopeSummary?.trim(),
    s.workplaceRelevance?.trim(),
    p.taskOrSkill?.trim() ? `Core workplace focus: ${p.taskOrSkill.trim()}.` : '',
    p.operationalImpact?.trim() ? `Operational need addressed: ${p.operationalImpact.trim()}.` : ''
  ].filter(Boolean);

  const baseBlueprint: CurriculumBlueprint = {
    subjectTitle,
    courseCode,
    courseDescription:
      descriptionParts.join(' ').trim() ||
      `Comprehensive workplace training programme on ${subjectTitle}.`,
    keyCompetencies: (s.keyCompetencies || p.skillGaps || '').trim(),
    programmeOutcomes: (course.learningDesign?.learningObjectivesList || []).filter(Boolean),
    aiToolsPlatform: (r.aiToolsPlatformName || r.aiToolsReferenced || s.toolsSystems || domainSeed.practicalToolHint).trim(),
    domainCategory,
    domainLabel: domainSpec.label,
    targetAudience: (s.targetRoles || p.targetGroup || 'Working professionals').trim(),
    learnerLevel: s.difficultyLevel || 'Intermediate',
    estimatedDuration: s.estimatedDuration || '16 Hours (Self-paced + Applied Practice)',
    requiredDomainConcepts: Array.from(
      new Set([
        ...domainSeed.coreConcepts,
        ...subjectKeywords,
        ...domainSpec.positiveKeywords.slice(0, 6)
      ])
    ).slice(0, 18),
    outOfScopeDomains,
    regulatoryGrounding: {
      applicableFrameworks,
      verifiedSourceNames,
      strictTruthRule:
        'Only cite South African legislation, NQF unit standards, CPD credits, or statistics that are directly relevant to the subject and supported by verified user sources; mark unverified external claims as "To Be Confirmed (Requires SME Validation)".'
    },
    modules,
    alignmentChecksPassed: true,
    planningSource: 'deterministic',
    validationNotes: []
  };

  const check = validateBlueprintAlignment(baseBlueprint, course);
  baseBlueprint.alignmentChecksPassed = check.valid;
  baseBlueprint.validationNotes = [...check.issues, ...check.warnings];
  return baseBlueprint;
}

export function detectCrossDomainBleed(
  text: string,
  outOfScopeDomains: Array<{ domain: string; forbiddenTerms: string[] }>
): Array<{ domain: string; matchedTerms: string[] }> {
  const lower = (text || '').toLowerCase();
  const hits: Array<{ domain: string; matchedTerms: string[] }> = [];

  for (const rule of outOfScopeDomains) {
    const matched = rule.forbiddenTerms.filter(term => {
      const escaped = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escaped}\\b`, 'i').test(lower);
    });
    if (matched.length > 0) {
      hits.push({ domain: rule.domain, matchedTerms: matched });
    }
  }
  return hits;
}

export function validateBlueprintAlignment(
  blueprint: CurriculumBlueprint,
  sourceCourse: Course
): { valid: boolean; issues: string[]; warnings: string[] } {
  const issues: string[] = [];
  const warnings: string[] = [];

  const expectedTitle = (sourceCourse.structure?.title || sourceCourse.name || '').trim();
  if (expectedTitle && expectedTitle !== 'Untitled Course') {
    const bpTitleLower = blueprint.subjectTitle.toLowerCase();
    const expectedWords = expectedTitle
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3 && !/^(the|and|for|with|course|into|from)$/.test(w));
    const overlapCount = expectedWords.filter(w => bpTitleLower.includes(w)).length;
    if (expectedWords.length > 0 && overlapCount === 0) {
      issues.push(
        `Blueprint subject "${blueprint.subjectTitle}" does not match configured course title "${expectedTitle}".`
      );
    }
  }

  const expectedModCount = sourceCourse.modules?.length || 0;
  if (expectedModCount > 0 && blueprint.modules.length !== expectedModCount) {
    issues.push(
      `Blueprint has ${blueprint.modules.length} module(s), violating user template count of ${expectedModCount}.`
    );
  }

  for (let i = 0; i < Math.min(expectedModCount, blueprint.modules.length); i++) {
    const srcMod = sourceCourse.modules[i];
    const bpMod = blueprint.modules[i];
    if (srcMod.title?.trim() && bpMod.title.toLowerCase().trim() !== srcMod.title.toLowerCase().trim()) {
      warnings.push(`Blueprint Module ${i + 1} title "${bpMod.title}" differs from configured title "${srcMod.title}".`);
    }
    const lessonTitles = bpMod.lessonPlans.map(l => l.title.toLowerCase().trim());
    const uniqueLessonTitles = new Set(lessonTitles);
    if (uniqueLessonTitles.size < lessonTitles.length) {
      issues.push(`Module ${i + 1} ("${bpMod.title}") contains duplicate lesson titles in blueprint.`);
    }

    const combinedModText = [
      bpMod.title,
      bpMod.purpose,
      ...bpMod.lessonPlans.map(
        l => `${l.title} ${l.purpose} ${l.conceptsToExplain.join(' ')} ${l.keyTerminology.join(' ')}`
      ),
      bpMod.practicalTaskSpec.learningObjective,
      bpMod.practicalTaskSpec.scenarioOrTask
    ].join(' ');

    const bleedHits = detectCrossDomainBleed(combinedModText, blueprint.outOfScopeDomains);
    if (bleedHits.length > 0) {
      issues.push(
        `Module ${i + 1} blueprint contains out-of-scope domain bleed (${bleedHits
          .map(h => `${h.domain}: ${h.matchedTerms.join(', ')}`)
          .join('; ')}).`
      );
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings
  };
}

export async function generateCurriculumBlueprint(
  course: Course,
  provider: AIProvider,
  model: string,
  aiExecute: (req: AIRequest) => Promise<AIResponse> = req => aiRouter.execute(req)
): Promise<{ blueprint: CurriculumBlueprint; tokensUsed?: { input?: number; output?: number } }> {
  const deterministic = buildDeterministicBlueprint(course);

  const systemInstruction = `You are a Principal Curriculum Architect creating an internal Subject & Curriculum Blueprint BEFORE authoring full course lessons.
IDENTICAL MULTI-PROVIDER MANDATE: Teach the genuine intellectual and practical substance of "${deterministic.subjectTitle}" (${deterministic.domainLabel}).
STRICT RULES:
1. SUBJECT LOCK: Plan ONLY "${deterministic.subjectTitle}" for "${deterministic.targetAudience}" (${deterministic.learnerLevel}).
   FORBIDDEN OFF-TOPIC DOMAINS: ${
     deterministic.outOfScopeDomains.map(d => `${d.domain} (${d.forbiddenTerms.slice(0, 6).join(', ')})`).join('; ') || 'None'
   }.
2. Preserve EXACT module count (${deterministic.modules.length}), module titles, and module learning objectives.
3. For EVERY lesson in EVERY module, define all 7 lesson planning dimensions distinctly (never repeat the same lesson scope or example):
   - knowledgeToAcquire (what learners must know)
   - conceptsToExplain (specific domain mechanisms/principles — NOT generic checklists or SOP boilerplate)
   - keyTerminology (authentic domain terms)
   - subjectExamples (concrete subject-specific worked examples)
   - practicalSkills (how to apply the knowledge in practice)
   - commonMisconceptions (real learner misconceptions to prevent)
   - demonstrationMethod (how learners demonstrate understanding)
4. For EVERY module's practicalTaskSpec, design an authentic subject-specific task with all 10 elements:
   title, learningObjective, scenarioOrTask, requiredResources, clearInstructions, sequentialSteps (3-5 steps), expectedDeliverable, successCriteria, rubricCriteria (summing to 100%), reflectionPrompt.
   NEVER default to generic "audit workflow failures / corrective action plan / sign-off checklist" unless the module is explicitly about compliance auditing!
5. Do NOT invent South African NQF codes, Acts, CPD credits, or stats.
Return ONLY valid JSON:
{
  "requiredDomainConcepts": ["10-14 authentic concepts specific to ${deterministic.subjectTitle}"],
  "modules": [
    {
      "moduleNumber": 1,
      "title": "Exact supplied module title",
      "lessonPlans": [
        {
          "title": "Distinct lesson title (keep configured title if supplied)",
          "purpose": "Distinct lesson teaching goal",
          "progressionStage": "Foundation & Mental Model",
          "knowledgeToAcquire": ["..."],
          "conceptsToExplain": ["Concept A", "Concept B"],
          "keyTerminology": ["Term 1", "Term 2"],
          "subjectExamples": ["Concrete subject worked example"],
          "practicalSkills": ["Applied skill"],
          "commonMisconceptions": ["Common error learners make"],
          "demonstrationMethod": "How learner demonstrates mastery"
        }
      ],
      "scenarioContexts": [
        { "title": "Scenario title", "type": "Workplace", "organisationType": "Distinct SA org", "cityOrSetting": "City", "coreDilemma": "Subject-specific decision" }
      ],
      "practicalTaskSpec": {
        "title": "Subject-authentic practical task title",
        "learningObjective": "Specific LO-aligned goal",
        "scenarioOrTask": "Realistic subject-grounded task prompt",
        "requiredResources": ["Tool/Resource 1", "Resource 2"],
        "clearInstructions": "Clear overview instructions",
        "sequentialSteps": ["Step 1...", "Step 2...", "Step 3..."],
        "expectedDeliverable": "Concrete subject deliverable",
        "successCriteria": ["Criterion 1", "Criterion 2"],
        "rubricCriteria": ["Criterion 1 (40%)", "Criterion 2 (35%)", "Criterion 3 (25%)"],
        "reflectionPrompt": "Subject-grounded reflection question"
      }
    }
  ]
}`;

  const prompt = `Create the validated Subject & Curriculum Blueprint for:
Subject Title: ${deterministic.subjectTitle}
Course Description & Workplace Context: ${deterministic.courseDescription}
Industry Domain: ${course.structure?.industryDomain || deterministic.domainLabel}
Core Skill / Problem: ${course.problem?.taskOrSkill || ''}
Key Competencies: ${deterministic.keyCompetencies || 'Core practitioner execution and decision-making'}
Programme Outcomes: ${deterministic.programmeOutcomes.join(' | ') || 'Derived from module objectives'}
Target Audience: ${deterministic.targetAudience} (${deterministic.learnerLevel})
Modules to plan cleanly (${deterministic.modules.length}):
${JSON.stringify(
  deterministic.modules.map(m => ({
    moduleNumber: m.moduleNumber,
    title: m.title,
    purpose: m.purpose,
    learningObjectives: m.learningObjectives.map(o => `${o.code}: ${o.statement}`),
    configuredLessonTitles: m.lessonPlans.map(l => l.title)
  })),
  null,
  2
)}`;

  try {
    const res = await aiExecute({
      provider,
      model,
      prompt,
      systemInstruction,
      responseFormat: 'json',
      temperature: 0.2,
      maxTokens: 3200,
      timeoutMs: 40000
    });

    const cleaned = res.text.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    const parsed = JSON.parse(firstBrace !== -1 && lastBrace > firstBrace ? cleaned.slice(firstBrace, lastBrace + 1) : cleaned);

    const asStringArray = (val: any, fb: string[]): string[] =>
      Array.isArray(val) && val.length > 0 ? val.map(String).filter(Boolean) : fb;

    const merged: CurriculumBlueprint = {
      ...deterministic,
      requiredDomainConcepts:
        Array.isArray(parsed?.requiredDomainConcepts) && parsed.requiredDomainConcepts.length >= 4
          ? parsed.requiredDomainConcepts.map(String)
          : deterministic.requiredDomainConcepts,
      modules: deterministic.modules.map((baseMod, idx) => {
        const aiMod = Array.isArray(parsed?.modules)
          ? parsed.modules.find((m: any) => Number(m.moduleNumber) === baseMod.moduleNumber) || parsed.modules[idx]
          : null;
        if (!aiMod) return baseMod;

        const srcMod = (course.modules || [])[idx] as any;
        const hasConfiguredLessons = Array.isArray(srcMod?.lessons) && srcMod.lessons.length > 0;

        const lessonPlans: BlueprintLessonPlan[] = baseMod.lessonPlans.map((baseLesson, lIdx) => {
          const aiLesson = Array.isArray(aiMod.lessonPlans) ? aiMod.lessonPlans[lIdx] : null;
          if (!aiLesson) return baseLesson;
          const concepts = asStringArray(
            aiLesson.conceptsToExplain || aiLesson.conceptsToTeach,
            baseLesson.conceptsToExplain
          );
          const examples = asStringArray(
            aiLesson.subjectExamples || (aiLesson.workedExampleTopic ? [aiLesson.workedExampleTopic] : []),
            baseLesson.subjectExamples
          );
          return {
            ...baseLesson,
            title:
              hasConfiguredLessons && srcMod.lessons[lIdx]?.title?.trim()
                ? baseLesson.title
                : (typeof aiLesson.title === 'string' && aiLesson.title.trim() ? aiLesson.title.trim() : baseLesson.title),
            purpose:
              typeof aiLesson.purpose === 'string' && aiLesson.purpose.trim()
                ? aiLesson.purpose.trim()
                : baseLesson.purpose,
            conceptsToTeach: concepts,
            conceptsToExplain: concepts,
            knowledgeToAcquire: asStringArray(aiLesson.knowledgeToAcquire, baseLesson.knowledgeToAcquire),
            keyTerminology: asStringArray(aiLesson.keyTerminology, baseLesson.keyTerminology),
            subjectExamples: examples,
            workedExampleTopic: examples[0] || baseLesson.workedExampleTopic,
            practicalSkills: asStringArray(aiLesson.practicalSkills, baseLesson.practicalSkills),
            commonMisconceptions: asStringArray(aiLesson.commonMisconceptions, baseLesson.commonMisconceptions),
            demonstrationMethod:
              typeof aiLesson.demonstrationMethod === 'string' && aiLesson.demonstrationMethod.trim()
                ? aiLesson.demonstrationMethod.trim()
                : baseLesson.demonstrationMethod
          };
        });

        const repairedLessons = lessonPlans.map((lp, lIdx) => {
          const bleed = detectCrossDomainBleed(
            `${lp.title} ${lp.purpose} ${lp.conceptsToExplain.join(' ')} ${lp.keyTerminology.join(' ')} ${lp.subjectExamples.join(' ')}`,
            deterministic.outOfScopeDomains
          );
          return bleed.length > 0 ? baseMod.lessonPlans[lIdx] : lp;
        });

        const rawTask = aiMod.practicalTaskSpec;
        const taskText = rawTask ? JSON.stringify(rawTask) : '';
        const taskBleed = detectCrossDomainBleed(taskText, deterministic.outOfScopeDomains);

        const baseTask = baseMod.practicalTaskSpec;
        const rawObj = rawTask?.learningObjective || rawTask?.objective;
        const rawScenario = rawTask?.scenarioOrTask || rawTask?.realisticScenario;
        const rawDeliverable = rawTask?.expectedDeliverable || rawTask?.deliverable;
        const rawResources = rawTask?.requiredResources || rawTask?.resourcesRequired;

        const practicalTaskSpec: BlueprintPracticalTaskSpec =
          rawTask && taskBleed.length === 0 && rawObj && rawDeliverable
            ? {
                title: String(rawTask.title || baseTask.title),
                learningObjective: String(rawObj),
                objective: String(rawObj),
                scenarioOrTask: String(rawScenario || baseTask.scenarioOrTask),
                realisticScenario: String(rawScenario || baseTask.realisticScenario),
                requiredResources: asStringArray(rawResources, baseTask.requiredResources),
                resourcesRequired: asStringArray(rawResources, baseTask.resourcesRequired),
                clearInstructions: String(rawTask.clearInstructions || baseTask.clearInstructions),
                sequentialSteps: asStringArray(rawTask.sequentialSteps, baseTask.sequentialSteps),
                expectedDeliverable: String(rawDeliverable),
                deliverable: String(rawDeliverable),
                successCriteria: asStringArray(rawTask.successCriteria, baseTask.successCriteria),
                rubricCriteria: asStringArray(rawTask.rubricCriteria, baseTask.rubricCriteria),
                reflectionPrompt: String(rawTask.reflectionPrompt || baseTask.reflectionPrompt)
              }
            : baseTask;

        const scenarioContexts =
          Array.isArray(aiMod.scenarioContexts) && aiMod.scenarioContexts.length >= 3
            ? aiMod.scenarioContexts.slice(0, 4).map((sc: any, sIdx: number) => {
                const fb = baseMod.scenarioContexts[sIdx] || baseMod.scenarioContexts[0];
                const scBleed = detectCrossDomainBleed(JSON.stringify(sc), deterministic.outOfScopeDomains);
                if (scBleed.length > 0) return fb;
                return {
                  title: String(sc.title || fb.title),
                  type: sc.type === 'AI Specific' ? ('AI Specific' as const) : ('Workplace' as const),
                  organisationType: String(sc.organisationType || fb.organisationType),
                  cityOrSetting: String(sc.cityOrSetting || fb.cityOrSetting),
                  coreDilemma: String(sc.coreDilemma || fb.coreDilemma)
                };
              })
            : baseMod.scenarioContexts;

        return {
          ...baseMod,
          lessonPlans: repairedLessons,
          scenarioContexts,
          practicalTaskSpec
        };
      })
    };

    const alignment = validateBlueprintAlignment(merged, course);
    merged.alignmentChecksPassed = alignment.valid;
    merged.planningSource = alignment.valid ? 'ai' : 'deterministic';
    merged.validationNotes = [...alignment.issues, ...alignment.warnings];

    return {
      blueprint: alignment.valid ? merged : deterministic,
      tokensUsed: res.usage ? { input: res.usage.inputTokens, output: res.usage.outputTokens } : undefined
    };
  } catch (err: any) {
    const errMsg = String(err?.message || err || '');
    // Propagate provider configuration, auth, quota, and connectivity failures immediately — do NOT silently hide them!
    if (
      /not configured|api key|authentication|401|403|429|rate limit|quota|timed out|timeout|network|fetch failed|enotfound|econnrefused/i.test(
        errMsg
      )
    ) {
      throw err;
    }
    console.warn('[CurriculumBlueprint] Using validated deterministic blueprint due to parse/schema fallback:', errMsg);
    deterministic.validationNotes = [
      `Stage 1 AI blueprint response required deterministic repair: ${errMsg.slice(0, 140)}`,
      ...deterministic.validationNotes
    ];
    return {
      blueprint: deterministic
    };
  }
}
