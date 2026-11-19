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
  progressionStage: 'Foundation & Mental Model' | 'Core Architecture & Execution' | 'Applied Decision & Optimisation' | 'Governance & Verification';
  conceptsToTeach: string[];
  workedExampleTopic: string;
  avoidRepeating: string[];
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
  practicalTaskSpec: {
    title: string;
    objective: string;
    realisticScenario: string;
    deliverable: string;
    resourcesRequired: string[];
    rubricCriteria: string[];
  };
  assessmentTargets: Array<{
    objectiveCode: string;
    conceptTested: string;
    cognitiveLevel: 'Recall' | 'Explanation' | 'Application';
  }>;
}

export interface CurriculumBlueprint {
  subjectTitle: string;
  courseCode: string;
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
  validationNotes: string[];
}

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
  const subjectKeywords = extractSubjectKeywords(course);

  const verifiedSourceNames = (r.sources || [])
    .filter((src: any) => src.status === 'Verified')
    .map((src: any) => src.name)
    .filter(Boolean);

  const outOfScopeDomains = buildOutOfScopeRules(course, domainCategory);
  const sourceModules = Array.isArray(course.modules) && course.modules.length > 0 ? course.modules : [];

  const settingsPool = [
    { org: 'Cape Town SaaS & Digital Platform Provider', city: 'Cape Town' },
    { org: 'Johannesburg National Retail & Logistics Group', city: 'Johannesburg' },
    { org: 'Pretoria Public Sector Digital Services Directorate', city: 'Pretoria' },
    { org: 'Durban Maritime & Supply Chain Operations Hub', city: 'Durban' },
    { org: 'Midrand Financial & Enterprise Shared Services Centre', city: 'Midrand' },
    { org: 'Gqeberha Regional Manufacturing & Operations Division', city: 'Gqeberha' }
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
            `Explain core principles and architecture of ${modTitle} in ${subjectTitle}`,
            `Apply structured techniques and tools taught in ${modTitle} to realistic workplace tasks`,
            `Evaluate quality, trade-offs, and governance controls in ${modTitle}`
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
      `${modTitle}: Core Concepts & Mental Models`,
      `${modTitle}: Applied Design, Configuration & Workflow`,
      `${modTitle}: Trade-Offs, Troubleshooting & Quality Governance`
    ];

    const lessonPlans: BlueprintLessonPlan[] = Array.from({ length: targetLessonCount }).map((_, lIdx) => {
      const cfgLesson = configuredLessons?.[lIdx];
      const lTitle = (cfgLesson?.title || defaultLessonTitles[lIdx] || `${modTitle}: Part ${lIdx + 1}`).trim();
      const stage = progressionStages[lIdx % progressionStages.length];
      return {
        id: cfgLesson?.id || `lesson-${modNum}-${lIdx + 1}`,
        title: lTitle,
        purpose:
          cfgLesson?.purpose ||
          `Teach ${stage.toLowerCase()} aspects of ${lTitle} in direct alignment with ${modTitle}.`,
        progressionStage: stage,
        conceptsToTeach:
          Array.isArray(cfgLesson?.concepts) && cfgLesson.concepts.length > 0
            ? cfgLesson.concepts
            : (mod.keySkills || subjectKeywords).slice(lIdx, lIdx + 3),
        workedExampleTopic: `Concrete worked example applying ${lTitle} in ${subjectTitle}`,
        avoidRepeating: []
      };
    });

    // Populate mutual avoid-repeating hints
    for (let i = 0; i < lessonPlans.length; i++) {
      lessonPlans[i].avoidRepeating = lessonPlans
        .filter((_, j) => j !== i)
        .map(other => other.title);
    }

    const baseSettingA = settingsPool[(mIdx * 2) % settingsPool.length];
    const baseSettingB = settingsPool[(mIdx * 2 + 1) % settingsPool.length];
    const baseSettingC = settingsPool[(mIdx * 2 + 2) % settingsPool.length];

    const scenarioContexts = [
      {
        title: `${modTitle}: Architecture & Operational Trade-Off`,
        type: 'Workplace' as const,
        organisationType: baseSettingA.org,
        cityOrSetting: baseSettingA.city,
        coreDilemma: `Selecting the right ${modTitle} approach under budget, reliability, and team-skill constraints`
      },
      {
        title: `${modTitle}: Cross-Team Delivery Bottleneck`,
        type: 'Workplace' as const,
        organisationType: baseSettingB.org,
        cityOrSetting: baseSettingB.city,
        coreDilemma: `Resolving hand-off failures or configuration defects while protecting service quality`
      },
      {
        title: `${modTitle}: AI-Assisted Verification & Oversight`,
        type: 'AI Specific' as const,
        organisationType: baseSettingC.org,
        cityOrSetting: baseSettingC.city,
        coreDilemma: `Auditing AI-assisted outputs for domain accuracy, privacy/security compliance, and human accountability`
      }
    ];

    const practicalTaskSpec = {
      title: `Module ${modNum} Applied Practical Task: ${modTitle}`,
      objective: `Demonstrate applied capability in ${learningObjectives[1]?.statement || modTitle}.`,
      realisticScenario: `Act as ${s.targetRoles || p.targetGroup || 'a practitioner'} at a ${baseSettingA.org} implementing ${modTitle}.`,
      deliverable: `A concrete, reviewed ${modTitle} implementation artefact aligned to module success criteria.`,
      resourcesRequired: [
        r.aiToolsPlatformName || s.toolsSystems || 'Standard domain tools and approved sandbox environment',
        `Module ${modNum} reference guide and verification checklist`
      ],
      rubricCriteria: [
        `Domain accuracy and application of ${modTitle} concepts (40%)`,
        'Completeness and feasibility of execution steps (35%)',
        'Verification evidence, security/governance awareness, and reflection (25%)'
      ]
    };

    const assessmentTargets = [
      { objectiveCode: learningObjectives[0]?.code || `LO ${modNum}.1`, conceptTested: lessonPlans[0]?.conceptsToTeach[0] || modTitle, cognitiveLevel: 'Recall' as const },
      { objectiveCode: learningObjectives[0]?.code || `LO ${modNum}.1`, conceptTested: lessonPlans[0]?.title || modTitle, cognitiveLevel: 'Explanation' as const },
      { objectiveCode: learningObjectives[1]?.code || `LO ${modNum}.2`, conceptTested: lessonPlans[1]?.title || modTitle, cognitiveLevel: 'Application' as const },
      { objectiveCode: learningObjectives[1]?.code || `LO ${modNum}.2`, conceptTested: lessonPlans[1]?.conceptsToTeach[0] || modTitle, cognitiveLevel: 'Application' as const },
      { objectiveCode: (learningObjectives[2] || learningObjectives[0])?.code || `LO ${modNum}.1`, conceptTested: lessonPlans[lessonPlans.length - 1]?.title || modTitle, cognitiveLevel: 'Application' as const }
    ];

    return {
      moduleId: mod.id || `module-${modNum}`,
      moduleNumber: modNum,
      title: modTitle,
      purpose: (mod.purpose || `Develop verified capability in ${modTitle}.`).trim(),
      learningObjectives,
      lessonPlans,
      scenarioContexts,
      practicalTaskSpec,
      assessmentTargets
    };
  });

  const baseBlueprint: CurriculumBlueprint = {
    subjectTitle,
    courseCode,
    domainCategory,
    domainLabel: domainSpec.label,
    targetAudience: (s.targetRoles || p.targetGroup || 'Working professionals').trim(),
    learnerLevel: s.difficultyLevel || 'Intermediate',
    estimatedDuration: s.estimatedDuration || '16 Hours / 2 CPD Credits',
    requiredDomainConcepts: Array.from(
      new Set([
        ...subjectKeywords,
        ...(domainSpec.positiveKeywords.slice(0, 6))
      ])
    ).slice(0, 16),
    outOfScopeDomains,
    regulatoryGrounding: {
      applicableFrameworks: [
        ...(r.regulatoryFramework ? [r.regulatoryFramework] : domainSpec.applicableSouthAfricanFrameworks)
      ],
      verifiedSourceNames,
      strictTruthRule:
        'Only cite South African legislation, NQF unit standards, or statistics that are directly relevant to the subject and supported by verified user sources; mark unverified external claims as "To Be Confirmed (Requires SME Validation)".'
    },
    modules,
    alignmentChecksPassed: true,
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
      ...bpMod.lessonPlans.map(l => `${l.title} ${l.purpose} ${l.conceptsToTeach.join(' ')}`),
      bpMod.practicalTaskSpec.objective,
      bpMod.practicalTaskSpec.realisticScenario
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

  const systemInstruction = `You are a Principal Curriculum Architect creating an internal Subject & Curriculum Blueprint before full course authoring.
STRICT SUBJECT LOCK:
- Subject: "${deterministic.subjectTitle}"
- Domain: "${deterministic.domainLabel}"
- Audience: "${deterministic.targetAudience}" (${deterministic.learnerLevel})
- FORBIDDEN OFF-TOPIC DOMAINS (NEVER mention these unless directly part of this subject): ${
    deterministic.outOfScopeDomains.map(d => `${d.domain} (${d.forbiddenTerms.slice(0, 6).join(', ')})`).join('; ') || 'None'
  }
- Preserve the EXACT module count (${deterministic.modules.length}), module titles, and module learning objectives supplied below.
- Give every lesson within every module a genuinely distinct scope, clear progression (foundation -> execution -> trade-offs/optimisation -> governance), specific technical/domain concepts, and a distinct worked example.
- Vary South African workplace contexts cleanly across scenarios (never reuse the exact same company/scenario across modules).
- Do not fabricate South African legislation, NQF unit standard IDs, or statistics.
Return ONLY valid JSON with:
{
  "requiredDomainConcepts": ["10-14 specific domain concepts for this subject"],
  "modules": [
    {
      "moduleNumber": 1,
      "title": "Exact supplied module title",
      "lessonPlans": [
        {
          "title": "Distinct lesson title (keep configured title if provided)",
          "purpose": "Distinct lesson teaching goal",
          "progressionStage": "Foundation & Mental Model",
          "conceptsToTeach": ["Concept A", "Concept B", "Concept C"],
          "workedExampleTopic": "Concrete domain-specific worked example"
        }
      ],
      "scenarioContexts": [
        { "title": "Scenario title", "type": "Workplace", "organisationType": "Distinct SA org", "cityOrSetting": "City", "coreDilemma": "Subject-specific decision" }
      ],
      "practicalTaskSpec": {
        "title": "Concrete task title",
        "objective": "Measurable task objective",
        "realisticScenario": "Specific domain scenario",
        "deliverable": "Concrete learner artefact",
        "resourcesRequired": ["Tool/Resource 1", "Tool/Resource 2"],
        "rubricCriteria": ["Criterion 1 (40%)", "Criterion 2 (35%)", "Criterion 3 (25%)"]
      }
    }
  ]
}`;

  const prompt = `Create the validated Subject & Curriculum Blueprint for:
Subject Title: ${deterministic.subjectTitle}
Industry Domain: ${course.structure?.industryDomain || deterministic.domainLabel}
Core Skill / Problem: ${course.problem?.taskOrSkill || ''}
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
      maxTokens: 2800,
      timeoutMs: 35000
    });

    const cleaned = res.text.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    const parsed = JSON.parse(firstBrace !== -1 && lastBrace > firstBrace ? cleaned.slice(firstBrace, lastBrace + 1) : cleaned);

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

        // Always keep user's exact module title & configured lesson count/titles if explicitly configured
        const srcMod = (course.modules || [])[idx] as any;
        const hasConfiguredLessons = Array.isArray(srcMod?.lessons) && srcMod.lessons.length > 0;

        const lessonPlans: BlueprintLessonPlan[] = baseMod.lessonPlans.map((baseLesson, lIdx) => {
          const aiLesson = Array.isArray(aiMod.lessonPlans) ? aiMod.lessonPlans[lIdx] : null;
          if (!aiLesson) return baseLesson;
          return {
            ...baseLesson,
            // Preserve user-configured lesson titles when present
            title:
              hasConfiguredLessons && srcMod.lessons[lIdx]?.title?.trim()
                ? baseLesson.title
                : (typeof aiLesson.title === 'string' && aiLesson.title.trim() ? aiLesson.title.trim() : baseLesson.title),
            purpose:
              typeof aiLesson.purpose === 'string' && aiLesson.purpose.trim()
                ? aiLesson.purpose.trim()
                : baseLesson.purpose,
            conceptsToTeach:
              Array.isArray(aiLesson.conceptsToTeach) && aiLesson.conceptsToTeach.length >= 2
                ? aiLesson.conceptsToTeach.map(String)
                : baseLesson.conceptsToTeach,
            workedExampleTopic:
              typeof aiLesson.workedExampleTopic === 'string' && aiLesson.workedExampleTopic.trim()
                ? aiLesson.workedExampleTopic.trim()
                : baseLesson.workedExampleTopic
          };
        });

        // Strip any cross-domain bleed back to deterministic if an AI lesson/task leaked off-topic terms
        const repairedLessons = lessonPlans.map((lp, lIdx) => {
          const bleed = detectCrossDomainBleed(
            `${lp.title} ${lp.purpose} ${lp.conceptsToTeach.join(' ')} ${lp.workedExampleTopic}`,
            deterministic.outOfScopeDomains
          );
          return bleed.length > 0 ? baseMod.lessonPlans[lIdx] : lp;
        });

        const rawTask = aiMod.practicalTaskSpec;
        const taskText = rawTask ? JSON.stringify(rawTask) : '';
        const taskBleed = detectCrossDomainBleed(taskText, deterministic.outOfScopeDomains);

        const practicalTaskSpec =
          rawTask && taskBleed.length === 0 && rawTask.objective && rawTask.deliverable
            ? {
                title: String(rawTask.title || baseMod.practicalTaskSpec.title),
                objective: String(rawTask.objective),
                realisticScenario: String(rawTask.realisticScenario || baseMod.practicalTaskSpec.realisticScenario),
                deliverable: String(rawTask.deliverable),
                resourcesRequired: Array.isArray(rawTask.resourcesRequired) && rawTask.resourcesRequired.length > 0
                  ? rawTask.resourcesRequired.map(String)
                  : baseMod.practicalTaskSpec.resourcesRequired,
                rubricCriteria: Array.isArray(rawTask.rubricCriteria) && rawTask.rubricCriteria.length >= 2
                  ? rawTask.rubricCriteria.map(String)
                  : baseMod.practicalTaskSpec.rubricCriteria
              }
            : baseMod.practicalTaskSpec;

        const scenarioContexts =
          Array.isArray(aiMod.scenarioContexts) && aiMod.scenarioContexts.length >= 3
            ? aiMod.scenarioContexts.slice(0, 4).map((sc: any, sIdx: number) => {
                const fb = baseMod.scenarioContexts[sIdx] || baseMod.scenarioContexts[0];
                const scBleed = detectCrossDomainBleed(JSON.stringify(sc), deterministic.outOfScopeDomains);
                if (scBleed.length > 0) return fb;
                return {
                  title: String(sc.title || fb.title),
                  type: sc.type === 'AI Specific' ? 'AI Specific' as const : 'Workplace' as const,
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
    merged.validationNotes = [...alignment.issues, ...alignment.warnings];

    return {
      blueprint: alignment.valid ? merged : deterministic,
      tokensUsed: res.usage ? { input: res.usage.inputTokens, output: res.usage.outputTokens } : undefined
    };
  } catch (err) {
    console.warn('[CurriculumBlueprint] Using validated deterministic blueprint fallback:', (err as Error)?.message);
    return {
      blueprint: deterministic
    };
  }
}
