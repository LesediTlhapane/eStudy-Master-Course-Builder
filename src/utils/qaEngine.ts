import { Course, QACheckItem, SectionId } from '../types';
import { FRAMEWORK_RULES } from './frameworkConfig';

export interface ModuleScenarioCheck {
  moduleId: string;
  moduleNumber: number;
  moduleTitle: string;
  workplaceCount: number;
  aiCount: number;
  totalCount: number;
  isComplete: boolean;
  summaryText: string;
}

export interface DiagnosticCheck {
  totalCount: number;
  aiCount: number;
  isCountValid: boolean; // between 5 and 10
  isAiCountValid: boolean; // at least 2
  isComplete: boolean;
  summaryText: string;
}

export interface QACategoryScore {
  category: string;
  score: number; // 0-100
  weight: number;
  passedCount: number;
  totalCount: number;
  status: 'passed' | 'warning' | 'failed';
}

export interface QAResult {
  scorePercent: number;
  totalChecks: number;
  completedCount: number;
  statusLabel: 'Almost ready to generate' | 'Ready to generate' | 'Needs attention' | 'In progress';
  statusDescription: string;
  items: QACheckItem[];
  moduleScenarioBreakdown: ModuleScenarioCheck[];
  diagnosticCheck: DiagnosticCheck;
  mandatoryRequirementsMet: boolean;
  categoryScores: QACategoryScore[];
  sectionProgress: Record<SectionId, {
    total: number;
    completed: number;
    percent: number;
    status: 'Complete' | 'In progress' | 'Not started';
  }>;
}

export function evaluateCourseQA(course: Course): QAResult {
  const p = course.problem || {} as any;
  const r = course.research || {} as any;
  const s = course.structure || {} as any;
  const ld = course.learningDesign || {} as any;
  const e = course.ethics || {} as any;
  const out = course.outputRequirements || {} as any;
  const cust = course.customisation || {} as any;

  // 1. Problem statement completed (10 required fields)
  const hasProblemStatement = Boolean(
    p.targetGroup?.trim() &&
    p.taskOrSkill?.trim() &&
    p.operationalImpact?.trim()
  );

  const hasRootCauses = Boolean(
    p.rootCauses?.length >= FRAMEWORK_RULES.MIN_ROOT_CAUSES &&
    p.rootCauses[0]?.trim() &&
    p.rootCauses[1]?.trim() &&
    p.processFailures?.trim() &&
    p.skillGaps?.trim() &&
    p.constraints?.trim()
  );

  const hasAiProblemContext = Boolean(
    p.aiLiteracyGap?.trim() &&
    p.digitalReadinessLevel?.trim() &&
    p.aiEthicsComplianceRisk?.trim()
  );

  const sec01Complete = hasProblemStatement && hasRootCauses && hasAiProblemContext;

  // 2. Sources & Research
  const hasSources = Boolean((r.sources?.length || 0) >= FRAMEWORK_RULES.MIN_RESEARCH_SOURCES);
  const hasRegulatory = Boolean(r.regulatoryFramework?.trim());
  const sec02Complete = hasSources && hasRegulatory;

  // 3. Course Structure essentials
  const hasCourseEssentials = Boolean(
    s.title?.trim() &&
    s.estimatedDuration?.trim() &&
    s.targetRoles?.trim() &&
    s.deliveryFormat?.trim() &&
    s.purposeStatement?.trim()
  );

  // 3.8 Diagnostics: 5 to 10 questions, with at least 2 AI / technology readiness questions
  const totalDiagCount = s.diagnosticQuestions?.length || 0;
  const aiDiagCount = (s.diagnosticQuestions || []).filter(
    (dq: any) =>
      dq.category === 'AI / digital readiness' ||
      dq.question?.toLowerCase().includes('ai') ||
      dq.question?.toLowerCase().includes('technology') ||
      dq.question?.toLowerCase().includes('digital')
  ).length;

  const isDiagCountValid = totalDiagCount >= FRAMEWORK_RULES.MIN_DIAGNOSTIC_QUESTIONS && totalDiagCount <= FRAMEWORK_RULES.MAX_DIAGNOSTIC_QUESTIONS;
  const isDiagAiValid = aiDiagCount >= FRAMEWORK_RULES.MIN_AI_DIAGNOSTIC_QUESTIONS;
  const hasDiagnostics = isDiagCountValid && isDiagAiValid;

  const diagnosticCheck: DiagnosticCheck = {
    totalCount: totalDiagCount,
    aiCount: aiDiagCount,
    isCountValid: isDiagCountValid,
    isAiCountValid: isDiagAiValid,
    isComplete: hasDiagnostics,
    summaryText: `${totalDiagCount} questions (${aiDiagCount} AI readiness) · ${
      hasDiagnostics
        ? '✓ Valid (5-10 total, min 2 AI)'
        : totalDiagCount < FRAMEWORK_RULES.MIN_DIAGNOSTIC_QUESTIONS
        ? `⚠ Requires min ${FRAMEWORK_RULES.MIN_DIAGNOSTIC_QUESTIONS} questions`
        : totalDiagCount > FRAMEWORK_RULES.MAX_DIAGNOSTIC_QUESTIONS
        ? `⚠ Maximum ${FRAMEWORK_RULES.MAX_DIAGNOSTIC_QUESTIONS} questions`
        : `⚠ Requires min ${FRAMEWORK_RULES.MIN_AI_DIAGNOSTIC_QUESTIONS} AI readiness questions`
    }`
  };

  const sec03Complete = hasCourseEssentials && hasDiagnostics;

  // 4. Modules: Minimum 3 modules
  const hasMinModules = Boolean((course.modules?.length || 0) >= FRAMEWORK_RULES.MIN_MODULES);

  // Learning objectives defined per module (min 3 per module)
  const hasLearningObjectives = Boolean(
    hasMinModules &&
    course.modules.every(m => m.learningObjectives && m.learningObjectives.length >= FRAMEWORK_RULES.MIN_LEARNING_OBJECTIVES_PER_MODULE)
  );

  // Per-Module Scenario Evaluation: Minimum 3 workplace scenarios PER MODULE (target 3-5)
  const moduleScenarioBreakdown: ModuleScenarioCheck[] = (course.modules || []).map(m => {
    const workplaceCount = m.requirements?.scenarios?.length || 0;
    const aiCount = m.requirements?.aiScenarios?.length || 0;
    const totalCount = workplaceCount + aiCount;
    // Each module MUST have at least 3 workplace scenarios
    const isComplete = workplaceCount >= FRAMEWORK_RULES.MIN_WORKPLACE_SCENARIOS_PER_MODULE;
    return {
      moduleId: m.id,
      moduleNumber: m.moduleNumber,
      moduleTitle: m.title || `Module ${m.moduleNumber}`,
      workplaceCount,
      aiCount,
      totalCount,
      isComplete,
      summaryText: `Module ${m.moduleNumber}: ${workplaceCount} workplace scenarios (min ${FRAMEWORK_RULES.MIN_WORKPLACE_SCENARIOS_PER_MODULE} required) + ${aiCount} AI scenarios (${isComplete ? '✓ Compliant' : `⚠ Needs ${FRAMEWORK_RULES.MIN_WORKPLACE_SCENARIOS_PER_MODULE - workplaceCount} more`})`
    };
  });

  const totalAiScenarios = (course.modules || []).reduce(
    (acc, m) => acc + (m.requirements?.aiScenarios?.length || 0),
    0
  );

  // Every module must have at least MIN_WORKPLACE_SCENARIOS_PER_MODULE workplace scenarios
  const allModulesHaveMinScenarios = hasMinModules && moduleScenarioBreakdown.every(mb => mb.workplaceCount >= FRAMEWORK_RULES.MIN_WORKPLACE_SCENARIOS_PER_MODULE);
  const hasWorkplaceScenarios = allModulesHaveMinScenarios;
  const hasAiScenarios = totalAiScenarios >= FRAMEWORK_RULES.MIN_AI_SCENARIOS_TOTAL;

  const sec04Complete = hasMinModules && hasLearningObjectives && hasWorkplaceScenarios && hasAiScenarios;

  // 5. Learning design standards
  const hasLearningDesign = Boolean(
    ld.instructionalApproach?.trim() &&
    ld.workplaceActivities?.length >= 2 &&
    ld.aiEvaluationTask?.trim()
  );

  const hasAssessments = Boolean(
    ld.assessments?.length >= FRAMEWORK_RULES.MIN_ASSESSMENTS_COUNT &&
    ld.assessments.some((a: any) => a.type === 'Final Assessment' && a.passMark)
  );
  const sec05Complete = hasLearningDesign && hasAssessments;

  // 6. AI ethics & POPIA requirements
  const completedEthicsCards = e.cards?.filter((c: any) => c.status === 'Complete' || (c.response && c.response.trim().length > 0)).length || 0;
  const hasAiEthics = Boolean(
    e.aiBiasRisk?.trim() &&
    e.humanOverrideScenarios?.trim() &&
    e.aiDisclosureRequirement?.trim()
  );
  const hasPrivacy = Boolean(
    (e.dataPrivacyFramework?.trim() || e.confidentialityRequirements?.trim()) &&
    e.accountabilityMechanism?.trim()
  );
  const sec06Complete = hasAiEthics && hasPrivacy;

  // 7. Output format & reading level
  const hasOutputRules = Boolean(
    out.outputFormat?.trim() &&
    out.accessibilityTargetReadingLevel?.trim()
  );
  const sec07Complete = hasOutputRules;

  // 8. Benchmark review
  const hasBenchmark = Boolean(course.qa?.benchmarkReviewed);
  const sec08Complete = hasBenchmark;

  // 9. Customisation planned
  const hasCustomisation = Boolean(
    cust.branding?.trim() &&
    cust.tone?.trim() &&
    cust.audienceContext?.trim()
  );
  const sec09Complete = hasCustomisation;

  const checks: QACheckItem[] = [
    {
      id: 'chk-req-fields',
      label: 'Problem definition & 10 required fields',
      targetSection: '01',
      isComplete: sec01Complete,
      issueDescription: !sec01Complete ? 'Problem statement, root causes, process failures, and AI risk context need completing.' : undefined,
      actionLabel: 'Go to Problem / Challenge'
    },
    {
      id: 'chk-sources',
      label: 'Research sources & evidence standards',
      targetSection: '02',
      isComplete: sec02Complete,
      issueDescription: !hasSources ? `At least ${FRAMEWORK_RULES.MIN_RESEARCH_SOURCES} authoritative research sources are required.` : !hasRegulatory ? 'Specify regulatory/POPIA framework.' : undefined,
      actionLabel: 'Go to Sources / Research'
    },
    {
      id: 'chk-min-modules',
      label: `Minimum ${FRAMEWORK_RULES.MIN_MODULES} modules configured`,
      targetSection: '03',
      isComplete: hasMinModules,
      issueDescription: !hasMinModules ? `Course currently has ${course.modules?.length || 0} of ${FRAMEWORK_RULES.MIN_MODULES} required modules.` : undefined,
      actionLabel: 'Go to Course Structure'
    },
    {
      id: 'chk-diagnostics',
      label: `Pre-course diagnostics (${FRAMEWORK_RULES.MIN_DIAGNOSTIC_QUESTIONS}–${FRAMEWORK_RULES.MAX_DIAGNOSTIC_QUESTIONS} Qs, min ${FRAMEWORK_RULES.MIN_AI_DIAGNOSTIC_QUESTIONS} AI readiness)`,
      targetSection: '03',
      isComplete: hasDiagnostics,
      issueDescription: !isDiagCountValid
        ? `Pre-course diagnostics must contain ${FRAMEWORK_RULES.MIN_DIAGNOSTIC_QUESTIONS} to ${FRAMEWORK_RULES.MAX_DIAGNOSTIC_QUESTIONS} questions (current: ${totalDiagCount}).`
        : !isDiagAiValid
        ? `At least ${FRAMEWORK_RULES.MIN_AI_DIAGNOSTIC_QUESTIONS} AI/technology readiness diagnostic questions required (current: ${aiDiagCount}).`
        : undefined,
      actionLabel: 'Go to Pre-Course Diagnostics'
    },
    {
      id: 'chk-learning-objectives',
      label: `Learning objectives defined (min ${FRAMEWORK_RULES.MIN_LEARNING_OBJECTIVES_PER_MODULE} per module)`,
      targetSection: '04',
      isComplete: hasLearningObjectives,
      issueDescription: !hasLearningObjectives ? `Every module must have at least ${FRAMEWORK_RULES.MIN_LEARNING_OBJECTIVES_PER_MODULE} measurable Bloom-aligned objectives.` : undefined,
      actionLabel: 'Go to Module Structure'
    },
    {
      id: 'chk-workplace-scenarios',
      label: `Workplace scenarios (min ${FRAMEWORK_RULES.MIN_WORKPLACE_SCENARIOS_PER_MODULE} PER MODULE)`,
      targetSection: '04',
      isComplete: hasWorkplaceScenarios,
      issueDescription: !hasWorkplaceScenarios 
        ? `Every module must contain at least ${FRAMEWORK_RULES.MIN_WORKPLACE_SCENARIOS_PER_MODULE} workplace scenarios (${moduleScenarioBreakdown.map(m => `M${m.moduleNumber}: ${m.workplaceCount}/${FRAMEWORK_RULES.MIN_WORKPLACE_SCENARIOS_PER_MODULE}`).join(', ')}).`
        : undefined,
      actionLabel: 'Go to Module Scenarios'
    },
    {
      id: 'chk-ai-scenarios',
      label: `AI application scenarios included (min ${FRAMEWORK_RULES.MIN_AI_SCENARIOS_TOTAL} total)`,
      targetSection: '04',
      isComplete: hasAiScenarios,
      issueDescription: !hasAiScenarios ? `Requires at least ${FRAMEWORK_RULES.MIN_AI_SCENARIOS_TOTAL} AI application scenarios across the course (current: ${totalAiScenarios}).` : undefined,
      actionLabel: 'Go to AI Scenarios'
    },
    {
      id: 'chk-learning-design',
      label: 'Instructional progression & 5 knowledge checks standard',
      targetSection: '05',
      isComplete: sec05Complete,
      issueDescription: !sec05Complete ? 'Verify instructional progression model, assessment weightings, and 5 knowledge checks standard.' : undefined,
      actionLabel: 'Go to Learning Design'
    },
    {
      id: 'chk-ai-ethics',
      label: 'Ethics, compliance & POPIA requirements addressed',
      targetSection: '06',
      isComplete: sec06Complete,
      issueDescription: !sec06Complete ? 'Ethics safeguarding, human oversight, and data privacy framework require completion.' : undefined,
      actionLabel: 'Go to Ethics & AI Responsibility'
    },
    {
      id: 'chk-accessibility',
      label: 'Output formatting & plain language reading level',
      targetSection: '07',
      isComplete: sec07Complete,
      issueDescription: !sec07Complete ? 'Specify target reading level (e.g. NQF 4 / Grade 12) and LMS output structure.' : undefined,
      actionLabel: 'Go to Output Format Rules'
    },
    {
      id: 'chk-benchmark',
      label: 'Quality review against Financial Literacy benchmark',
      targetSection: '08',
      isComplete: sec08Complete,
      issueDescription: !sec08Complete ? 'Conduct quality review against the eStudy Financial Literacy benchmark reference.' : undefined,
      actionLabel: 'Go to Final Output / QA'
    },
    {
      id: 'chk-customisation',
      label: 'Customisation & framework safeguards locked',
      targetSection: '09',
      isComplete: sec09Complete,
      issueDescription: !sec09Complete ? 'Review enterprise brand tone and customisation parameters.' : undefined,
      actionLabel: 'Go to Customisation'
    }
  ];

  const completedCount = checks.filter(c => c.isComplete).length;
  const totalChecks = checks.length;
  const scorePercent = Math.round((completedCount / totalChecks) * 100);

  const mandatoryRequirementsMet = Boolean(
    hasProblemStatement &&
    hasSources &&
    hasCourseEssentials &&
    hasDiagnostics &&
    hasMinModules &&
    hasLearningObjectives &&
    hasWorkplaceScenarios &&
    hasAiScenarios &&
    hasAssessments &&
    sec06Complete
  );

  let statusLabel: QAResult['statusLabel'] = 'In progress';
  let statusDescription = 'Complete all mandatory framework requirements before generating course.';

  if (scorePercent === 100 && mandatoryRequirementsMet) {
    statusLabel = 'Ready to generate';
    statusDescription = 'All 9 sections compliant with Master Prompt v9.0 standards. Ready for AI generation.';
  } else if (scorePercent >= FRAMEWORK_RULES.READINESS_THRESHOLD_ALMOST && mandatoryRequirementsMet) {
    statusLabel = 'Almost ready to generate';
    const remaining = totalChecks - completedCount;
    statusDescription = `${remaining} minor item${remaining > 1 ? 's' : ''} remaining. Mandatory requirements are satisfied.`;
  } else {
    statusLabel = 'Needs attention';
    const remaining = totalChecks - completedCount;
    statusDescription = `${remaining} framework requirement${remaining > 1 ? 's' : ''} require completion.`;
  }

  // Calculate Explainable Category Scores
  const categoryScores: QACategoryScore[] = [
    {
      category: 'Problem & Research Grounding',
      weight: 25,
      passedCount: (sec01Complete ? 1 : 0) + (sec02Complete ? 1 : 0),
      totalCount: 2,
      score: Math.round(((sec01Complete ? 1 : 0) + (sec02Complete ? 1 : 0)) / 2 * 100),
      status: (sec01Complete && sec02Complete) ? 'passed' : (sec01Complete || sec02Complete) ? 'warning' : 'failed'
    },
    {
      category: 'Course Architecture & Scenarios',
      weight: 35,
      passedCount: (hasMinModules ? 1 : 0) + (hasDiagnostics ? 1 : 0) + (hasLearningObjectives ? 1 : 0) + (hasWorkplaceScenarios ? 1 : 0) + (hasAiScenarios ? 1 : 0),
      totalCount: 5,
      score: Math.round(((hasMinModules ? 1 : 0) + (hasDiagnostics ? 1 : 0) + (hasLearningObjectives ? 1 : 0) + (hasWorkplaceScenarios ? 1 : 0) + (hasAiScenarios ? 1 : 0)) / 5 * 100),
      status: (hasMinModules && hasDiagnostics && hasLearningObjectives && hasWorkplaceScenarios && hasAiScenarios) ? 'passed' : 'warning'
    },
    {
      category: 'Learning Design & Assessments',
      weight: 20,
      passedCount: sec05Complete ? 1 : 0,
      totalCount: 1,
      score: sec05Complete ? 100 : 0,
      status: sec05Complete ? 'passed' : 'failed'
    },
    {
      category: 'Ethics, Governance & Compliance',
      weight: 20,
      passedCount: (sec06Complete ? 1 : 0) + (sec07Complete ? 1 : 0) + (sec08Complete ? 1 : 0) + (sec09Complete ? 1 : 0),
      totalCount: 4,
      score: Math.round(((sec06Complete ? 1 : 0) + (sec07Complete ? 1 : 0) + (sec08Complete ? 1 : 0) + (sec09Complete ? 1 : 0)) / 4 * 100),
      status: (sec06Complete && sec07Complete && sec08Complete && sec09Complete) ? 'passed' : 'warning'
    }
  ];

  const sectionProgress: QAResult['sectionProgress'] = {
    '01': {
      total: 10,
      completed: (p.targetGroup ? 1 : 0) + (p.taskOrSkill ? 1 : 0) + (p.operationalImpact ? 1 : 0) + (p.rootCauses?.length >= 2 && p.rootCauses[0] && p.rootCauses[1] ? 2 : 0) + (p.processFailures ? 1 : 0) + (p.skillGaps ? 1 : 0) + (p.constraints ? 1 : 0) + (p.aiLiteracyGap ? 1 : 0) + (p.digitalReadinessLevel ? 1 : 0) + (p.aiEthicsComplianceRisk ? 1 : 0),
      percent: sec01Complete ? 100 : Math.round(((p.targetGroup ? 1 : 0) + (p.taskOrSkill ? 1 : 0) + (p.operationalImpact ? 1 : 0)) / 3 * 70),
      status: sec01Complete ? 'Complete' : (p.targetGroup || p.taskOrSkill) ? 'In progress' : 'Not started'
    },
    '02': {
      total: 4,
      completed: ((r.sources?.length || 0) >= 2 ? 2 : r.sources?.length === 1 ? 1 : 0) + (r.regulatoryFramework ? 1 : 0) + (r.evidenceStandards?.length > 0 ? 1 : 0),
      percent: sec02Complete ? 100 : Math.round(((r.sources?.length || 0) / 2) * 50),
      status: sec02Complete ? 'Complete' : ((r.sources?.length || 0) > 0 || r.regulatoryFramework) ? 'In progress' : 'Not started'
    },
    '03': {
      total: 9,
      completed: (s.title ? 1 : 0) + (s.estimatedDuration ? 1 : 0) + (s.deliveryFormat ? 1 : 0) + (s.targetRoles ? 1 : 0) + (s.purposeStatement ? 1 : 0) + (hasDiagnostics ? 2 : totalDiagCount > 0 ? 1 : 0) + (s.learningJourney?.length > 0 ? 1 : 0) + (s.organisationalBenefits?.length > 0 ? 1 : 0),
      percent: sec03Complete ? 100 : 70,
      status: sec03Complete ? 'Complete' : 'In progress'
    },
    '04': {
      total: 10,
      completed: Math.min(10, (hasMinModules ? 3 : 1) + (hasLearningObjectives ? 2 : 0) + (hasWorkplaceScenarios ? 3 : allModulesHaveMinScenarios ? 2 : 1) + (hasAiScenarios ? 2 : totalAiScenarios > 0 ? 1 : 0)),
      percent: sec04Complete ? 100 : Math.round((completedCount / 10) * 100),
      status: sec04Complete ? 'Complete' : 'In progress'
    },
    '05': {
      total: 8,
      completed: (ld.instructionalApproach ? 1 : 0) + (ld.workplaceActivities?.length > 0 ? 1 : 0) + (ld.aiEvaluationTask ? 1 : 0) + (ld.assessments?.length >= 4 ? 3 : 1) + (ld.learningObjectivesList?.length > 0 ? 2 : 1),
      percent: sec05Complete ? 100 : 65,
      status: sec05Complete ? 'Complete' : 'In progress'
    },
    '06': {
      total: 9,
      completed: Math.min(9, (hasPrivacy ? 4 : 2) + (hasAiEthics ? 4 : 2) + (completedEthicsCards > 0 ? 1 : 0)),
      percent: sec06Complete ? 100 : 60,
      status: sec06Complete ? 'Complete' : 'In progress'
    },
    '07': {
      total: 5,
      completed: (out.outputFormat ? 2 : 0) + (out.accessibilityTargetReadingLevel ? 2 : 0) + (out.plainLanguageApplied ? 1 : 0),
      percent: sec07Complete ? 100 : 75,
      status: sec07Complete ? 'Complete' : 'In progress'
    },
    '08': {
      total: 2,
      completed: (hasBenchmark ? 1 : 0) + (scorePercent >= 80 ? 1 : 0),
      percent: sec08Complete ? 100 : 50,
      status: sec08Complete ? 'Complete' : 'In progress'
    },
    '09': {
      total: 5,
      completed: (cust.branding ? 1 : 0) + (cust.tone ? 1 : 0) + (cust.audienceContext ? 1 : 0) + (cust.industryExamples ? 1 : 0) + 1,
      percent: sec09Complete ? 100 : 60,
      status: sec09Complete ? 'Complete' : 'In progress'
    }
  };

  return {
    scorePercent,
    totalChecks,
    completedCount,
    statusLabel,
    statusDescription,
    items: checks,
    moduleScenarioBreakdown,
    diagnosticCheck,
    mandatoryRequirementsMet,
    categoryScores,
    sectionProgress
  };
}
