import { Course, QACheckItem, SectionId } from '../types';

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

export interface QAResult {
  scorePercent: number;
  totalChecks: number;
  completedCount: number;
  statusLabel: 'Almost ready to generate' | 'Ready to generate' | 'Needs attention' | 'In progress';
  statusDescription: string;
  items: QACheckItem[];
  moduleScenarioBreakdown: ModuleScenarioCheck[];
  mandatoryRequirementsMet: boolean;
  sectionProgress: Record<SectionId, {
    total: number;
    completed: number;
    percent: number;
    status: 'Complete' | 'In progress' | 'Not started';
  }>;
}

export function evaluateCourseQA(course: Course): QAResult {
  const p = course.problem;
  const r = course.research;
  const s = course.structure;
  const ld = course.learningDesign;
  const e = course.ethics;
  const out = course.outputRequirements;
  const cust = course.customisation;

  // 1. Problem statement completed
  const hasProblemStatement = Boolean(
    p.targetGroup?.trim() &&
    p.taskOrSkill?.trim() &&
    p.operationalImpact?.trim()
  );

  // 2. Root cause & AI considerations
  const hasRootCauses = Boolean(
    p.rootCauses?.length >= 2 &&
    p.rootCauses[0]?.trim() &&
    p.aiLiteracyGap?.trim() &&
    p.aiEthicsComplianceRisk?.trim()
  );

  // 3. Sources & research
  const hasSources = Boolean(r.sources?.length >= 2);

  // 4. Regulatory framework
  const hasRegulatory = Boolean(r.regulatoryFramework?.trim());

  // 5. Course essentials
  const hasCourseEssentials = Boolean(
    s.title?.trim() &&
    s.estimatedDuration?.trim() &&
    s.targetRoles?.trim() &&
    s.deliveryFormat?.trim() &&
    s.purposeStatement?.trim()
  );

  // 6. Diagnostics included (min 5)
  const hasDiagnostics = Boolean(s.diagnosticQuestions?.length >= 5);

  // 7. Minimum 3 modules
  const hasMinModules = Boolean(course.modules?.length >= 3);

  // 8. Learning objectives defined per module (min 3 per module)
  const hasLearningObjectives = Boolean(
    course.modules.length >= 3 &&
    course.modules.every(m => m.learningObjectives && m.learningObjectives.length >= 3)
  );

  // 9. Per-Module Scenario Evaluation
  const moduleScenarioBreakdown: ModuleScenarioCheck[] = (course.modules || []).map(m => {
    const workplaceCount = m.requirements?.scenarios?.length || 0;
    const aiCount = m.requirements?.aiScenarios?.length || 0;
    const totalCount = workplaceCount + aiCount;
    // Each module should have at least 1 workplace scenario
    const isComplete = workplaceCount >= 1;
    return {
      moduleId: m.id,
      moduleNumber: m.moduleNumber,
      moduleTitle: m.title || `Module ${m.moduleNumber}`,
      workplaceCount,
      aiCount,
      totalCount,
      isComplete,
      summaryText: `Module ${m.moduleNumber}: ${workplaceCount} workplace + ${aiCount} AI (${isComplete ? '✓ Valid' : '⚠ Requires min 1 scenario'})`
    };
  });

  const totalScenarios = course.modules.reduce(
    (acc, m) => acc + (m.requirements?.scenarios?.length || 0),
    0
  );
  const totalAiScenarios = course.modules.reduce(
    (acc, m) => acc + (m.requirements?.aiScenarios?.length || 0),
    0
  );

  // All modules must have at least 1 scenario and total >= 3
  const allModulesHaveScenarios = moduleScenarioBreakdown.length >= 3 && moduleScenarioBreakdown.every(mb => mb.isComplete);
  const hasWorkplaceScenarios = allModulesHaveScenarios && totalScenarios >= 3;
  const hasAiScenarios = totalAiScenarios >= 2;

  // 11. Learning design standards
  const hasLearningDesign = Boolean(
    ld.instructionalApproach?.trim() &&
    ld.workplaceActivities?.length >= 2 &&
    ld.aiEvaluationTask?.trim()
  );

  // 12. Assessment structure
  const hasAssessments = Boolean(
    ld.assessments?.length >= 4 &&
    ld.assessments.some(a => a.type === 'Final Assessment' && a.passMark)
  );

  // 13. AI ethics requirements completed
  const completedEthicsCards = e.cards?.filter(c => c.status === 'Complete').length || 0;
  const hasAiEthics = completedEthicsCards >= 6 && Boolean(e.aiBiasRisk?.trim() && e.humanOverrideScenarios?.trim());

  // 14. Data Privacy / POPIA
  const hasPrivacy = Boolean(e.dataPrivacyFramework?.trim() && e.confidentialityRequirements?.trim());

  // 15. Output requirements & reading level
  const hasOutputRules = Boolean(
    out.outputFormat?.trim() &&
    out.accessibilityTargetReadingLevel?.trim()
  );

  // 16. Benchmark review
  const hasBenchmark = Boolean(course.qa?.benchmarkReviewed);

  // 17. Customisation planned
  const hasCustomisation = Boolean(
    cust.branding?.trim() &&
    cust.tone?.trim() &&
    cust.audienceContext?.trim()
  );

  const checks: QACheckItem[] = [
    {
      id: 'chk-req-fields',
      label: 'Required fields completed',
      targetSection: '01',
      isComplete: hasProblemStatement && hasRootCauses,
      issueDescription: !hasProblemStatement ? 'Problem statement or root causes need completing.' : undefined,
      actionLabel: 'Go to Problem & Challenge'
    },
    {
      id: 'chk-sources',
      label: 'Research sources & evidence standards',
      targetSection: '02',
      isComplete: hasSources && hasRegulatory,
      issueDescription: !hasSources ? 'At least 2 authoritative research sources are required.' : undefined,
      actionLabel: 'Go to Sources & Research'
    },
    {
      id: 'chk-min-modules',
      label: 'Minimum 3 modules',
      targetSection: '04',
      isComplete: hasMinModules,
      issueDescription: !hasMinModules ? `Course currently has ${course.modules.length} of 3 required modules.` : undefined,
      actionLabel: 'Go to Module Structure'
    },
    {
      id: 'chk-learning-objectives',
      label: 'Learning objectives defined (min 3 per module)',
      targetSection: '04',
      isComplete: hasLearningObjectives,
      issueDescription: !hasLearningObjectives ? 'Every module must have at least 3 measurable objectives.' : undefined,
      actionLabel: 'Go to Module Structure'
    },
    {
      id: 'chk-workplace-scenarios',
      label: 'Workplace scenarios per module (min 1 each, 3+ total)',
      targetSection: '04',
      isComplete: hasWorkplaceScenarios,
      issueDescription: !hasWorkplaceScenarios 
        ? `Each module must have at least 1 workplace scenario and total >= 3 (${moduleScenarioBreakdown.map(m => `M${m.moduleNumber}: ${m.workplaceCount}`).join(', ')}).`
        : undefined,
      actionLabel: 'Go to Module Scenarios'
    },
    {
      id: 'chk-ai-scenarios',
      label: 'AI application scenarios included (min 2 total)',
      targetSection: '04',
      isComplete: hasAiScenarios,
      issueDescription: !hasAiScenarios ? `Requires at least 2 AI tool application scenarios (current: ${totalAiScenarios}).` : undefined,
      actionLabel: 'Go to AI Scenarios'
    },
    {
      id: 'chk-ai-ethics',
      label: 'AI ethics requirements completed',
      targetSection: '06',
      isComplete: hasAiEthics,
      issueDescription: !hasAiEthics ? `Ethics cards require review (${completedEthicsCards} of 9 completed).` : undefined,
      actionLabel: 'Go to Ethics & AI Responsibility'
    },
    {
      id: 'chk-diagnostics',
      label: 'Diagnostics included (min 5)',
      targetSection: '03',
      isComplete: hasDiagnostics,
      issueDescription: !hasDiagnostics ? `Pre-course diagnostics must include 5-10 questions (current: ${s.diagnosticQuestions?.length || 0}).` : undefined,
      actionLabel: 'Go to Pre-Course Diagnostics'
    },
    {
      id: 'chk-assessments',
      label: 'Assessments structure & pass mark',
      targetSection: '05',
      isComplete: hasAssessments,
      issueDescription: !hasAssessments ? 'Confirm final assessment pass mark and practical task weighting.' : undefined,
      actionLabel: 'Go to Learning Design'
    },
    {
      id: 'chk-regulatory',
      label: 'Regulatory framework & POPIA alignment',
      targetSection: '02',
      isComplete: hasRegulatory && hasPrivacy,
      issueDescription: !hasRegulatory ? 'Specify the statutory and regulatory compliance framework.' : undefined,
      actionLabel: 'Go to Sources & Research'
    },
    {
      id: 'chk-accessibility',
      label: 'Accessibility requirements completed',
      targetSection: '07',
      isComplete: hasOutputRules,
      issueDescription: !hasOutputRules ? 'Specify target reading level (e.g. NQF 4 / Grade 12).' : undefined,
      actionLabel: 'Go to Output Requirements'
    },
    {
      id: 'chk-benchmark',
      label: 'Benchmark review against reference course',
      targetSection: '08',
      isComplete: hasBenchmark,
      issueDescription: !hasBenchmark ? 'Benchmark review is incomplete. Compare against the Financial Literacy reference course.' : undefined,
      actionLabel: 'Go to Benchmark Review'
    },
    {
      id: 'chk-customisation',
      label: 'Customisation & framework safeguards',
      targetSection: '09',
      isComplete: hasCustomisation,
      issueDescription: !hasCustomisation ? 'Review designer customisation parameters and framework rules.' : undefined,
      actionLabel: 'Go to Customisation'
    }
  ];

  const completedCount = checks.filter(c => c.isComplete).length;
  const totalChecks = checks.length;
  const scorePercent = Math.round((completedCount / totalChecks) * 100);

  const mandatoryRequirementsMet = (
    hasProblemStatement &&
    hasSources &&
    hasCourseEssentials &&
    hasMinModules &&
    hasLearningObjectives &&
    hasWorkplaceScenarios &&
    hasAiScenarios &&
    hasAssessments
  );

  let statusLabel: QAResult['statusLabel'] = 'In progress';
  let statusDescription = 'Complete all mandatory requirements before generating Master Prompt.';

  if (scorePercent === 100 && mandatoryRequirementsMet) {
    statusLabel = 'Ready to generate';
    statusDescription = 'All framework requirements complete, module scenarios verified, and benchmarked. Ready for AI generation.';
  } else if (scorePercent >= 80 && mandatoryRequirementsMet) {
    statusLabel = 'Almost ready to generate';
    const remaining = totalChecks - completedCount;
    statusDescription = `${remaining} minor issue${remaining > 1 ? 's' : ''} need attention before final generation.`;
  } else {
    statusLabel = 'Needs attention';
    const remaining = totalChecks - completedCount;
    statusDescription = `${remaining} mandatory requirement${remaining > 1 ? 's' : ''} remain incomplete.`;
  }

  // Calculate per-section progress
  const sec01Done = hasProblemStatement && hasRootCauses;
  const sec02Done = hasSources && hasRegulatory;
  const sec03Done = hasCourseEssentials && hasDiagnostics;
  const sec04Done = hasMinModules && hasLearningObjectives && hasWorkplaceScenarios && hasAiScenarios;
  const sec05Done = hasLearningDesign && hasAssessments;
  const sec06Done = hasAiEthics && hasPrivacy;
  const sec07Done = hasOutputRules;
  const sec08Done = hasBenchmark;
  const sec09Done = hasCustomisation;

  const sectionProgress: QAResult['sectionProgress'] = {
    '01': {
      total: 5,
      completed: (p.targetGroup ? 1 : 0) + (p.taskOrSkill ? 1 : 0) + (p.operationalImpact ? 1 : 0) + (p.rootCauses?.length >= 2 ? 1 : 0) + (p.aiLiteracyGap ? 1 : 0),
      percent: sec01Done ? 100 : 80,
      status: sec01Done ? 'Complete' : 'In progress'
    },
    '02': {
      total: 4,
      completed: (r.sources.length >= 2 ? 2 : 1) + (r.regulatoryFramework ? 1 : 0) + (r.evidenceStandards.length > 0 ? 1 : 0),
      percent: sec02Done ? 100 : 75,
      status: sec02Done ? 'Complete' : 'In progress'
    },
    '03': {
      total: 9,
      completed: (s.title ? 1 : 0) + (s.estimatedDuration ? 1 : 0) + (s.deliveryFormat ? 1 : 0) + (s.targetRoles ? 1 : 0) + (s.purposeStatement ? 1 : 0) + (s.diagnosticQuestions.length >= 5 ? 2 : 1) + (s.learningJourney.length > 0 ? 1 : 0) + (s.organisationalBenefits.length > 0 ? 1 : 0),
      percent: sec03Done ? 100 : 78,
      status: sec03Done ? 'Complete' : 'In progress'
    },
    '04': {
      total: 10,
      completed: Math.min(10, (hasMinModules ? 3 : 1) + (hasLearningObjectives ? 2 : 1) + (hasWorkplaceScenarios ? 3 : 1) + (hasAiScenarios ? 2 : 0)),
      percent: sec04Done ? 100 : 60,
      status: sec04Done ? 'Complete' : 'In progress'
    },
    '05': {
      total: 8,
      completed: (ld.instructionalApproach ? 1 : 0) + (ld.workplaceActivities.length > 0 ? 1 : 0) + (ld.aiEvaluationTask ? 1 : 0) + (ld.assessments.length >= 4 ? 2 : 1) + (ld.learningObjectivesList.length > 0 ? 1 : 0),
      percent: sec05Done ? 100 : 63,
      status: sec05Done ? 'Complete' : 'In progress'
    },
    '06': {
      total: 9,
      completed: completedEthicsCards,
      percent: Math.round((completedEthicsCards / 9) * 100),
      status: completedEthicsCards === 9 ? 'Complete' : completedEthicsCards > 0 ? 'In progress' : 'Not started'
    },
    '07': {
      total: 9,
      completed: (out.outputFormat ? 2 : 0) + (out.accessibilityTargetReadingLevel ? 2 : 0) + (out.plainLanguageApplied ? 2 : 0) + 2,
      percent: sec07Done ? 100 : 88,
      status: sec07Done ? 'Complete' : 'In progress'
    },
    '08': {
      total: 2,
      completed: (hasBenchmark ? 1 : 0) + (scorePercent >= 80 ? 1 : 0),
      percent: sec08Done ? 100 : 50,
      status: sec08Done ? 'Complete' : 'In progress'
    },
    '09': {
      total: 7,
      completed: (cust.branding ? 1 : 0) + (cust.tone ? 1 : 0) + (cust.audienceContext ? 1 : 0) + (cust.industryExamples ? 1 : 0) + 1,
      percent: sec09Done ? 100 : 57,
      status: sec09Done ? 'Complete' : 'In progress'
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
    mandatoryRequirementsMet,
    sectionProgress
  };
}

