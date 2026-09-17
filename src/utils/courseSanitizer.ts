import { Course, CourseModule, ResearchSource, DiagnosticQuestion, AssessmentItem, EthicsCardData } from '../types';
import { createScratchCourse } from '../data/initialCourseData';
import { toSafeString, toSafeArray } from './promptGenerator';

/**
 * Ensures any course object (from localStorage, DeepSeek, or partial AI generation)
 * is fully populated with safe defaults and valid array structures.
 * Prevents runtime null-pointer and undefined errors across all app views.
 */
export function sanitizeCourse(raw: any, fallbackName: string = 'Untitled Course'): Course {
  if (!raw || typeof raw !== 'object') {
    return createScratchCourse(fallbackName);
  }

  const baseTitle = toSafeString(raw.name || raw.structure?.title || fallbackName);
  const scratch = createScratchCourse(baseTitle);

  // Parse raw modules safely
  const rawModulesList = toSafeArray(raw.modules);
  const safeModules: CourseModule[] = rawModulesList.length > 0
    ? rawModulesList.map((m: any, idx: number): CourseModule => {
        const defaultMod = scratch.modules[0] || {
          id: `module-${idx + 1}`,
          moduleNumber: idx + 1,
          title: `Module ${idx + 1}`,
          subtitle: '',
          purpose: '',
          keySkills: [],
          learningObjectives: [],
          status: 'Not started' as const,
          requirements: scratch.modules[0]?.requirements
        };

        if (!m || typeof m !== 'object') return defaultMod;

        const req = m.requirements && typeof m.requirements === 'object' ? m.requirements : {};

        return {
          id: toSafeString(m.id, `module-${idx + 1}`),
          moduleNumber: typeof m.moduleNumber === 'number' ? m.moduleNumber : (typeof m.number === 'number' ? m.number : idx + 1),
          title: toSafeString(m.title, `Module ${idx + 1}`),
          subtitle: toSafeString(m.subtitle),
          purpose: toSafeString(m.purpose),
          keySkills: toSafeArray(m.keySkills).map(k => toSafeString(k)).filter(Boolean),
          learningObjectives: toSafeArray(m.learningObjectives).map(lo => toSafeString(lo)).filter(Boolean),
          status: m.status === 'Complete' || m.status === 'In progress' ? m.status : 'Not started',
          requirements: {
            ...scratch.modules[0]?.requirements,
            problemDefinition: toSafeString(req.problemDefinition || req.workplaceContext),
            workplaceContext: toSafeString(req.workplaceContext || req.problemDefinition),
            keyTerms: toSafeString(req.keyTerms),
            causes: toSafeString(req.causes),
            warningSigns: toSafeString(req.warningSigns),
            impactStatement: toSafeString(req.impactStatement),
            aiDemystification: toSafeString(req.aiDemystification || req.aiInThisDomain),
            aiInThisDomain: toSafeString(req.aiInThisDomain || req.aiDemystification),
            aiToolsOverview: toSafeString(req.aiToolsOverview),
            responsibleAiPrinciples: toSafeString(req.responsibleAiPrinciples),
            toolsAndTechniques: toSafeString(req.toolsAndTechniques || req.procedureSteps),
            procedureSteps: toSafeString(req.procedureSteps || req.toolsAndTechniques),
            roleResponsibilities: toSafeString(req.roleResponsibilities),
            communicationApproach: toSafeString(req.communicationApproach),
            supportMechanisms: toSafeString(req.supportMechanisms),
            scenarios: toSafeArray(req.scenarios).map((sc: any, sIdx: number) => ({
              id: toSafeString(sc?.id, `sc-${sIdx + 1}`),
              title: toSafeString(sc?.title, `Scenario ${sIdx + 1}`),
              situation: toSafeString(sc?.situation),
              challenge: toSafeString(sc?.challenge),
              decisionPoint: toSafeString(sc?.decisionPoint),
              debrief: toSafeString(sc?.debrief || sc?.reflection),
              moduleRef: toSafeString(sc?.moduleRef),
              status: sc?.status === 'Complete' || sc?.status === 'In progress' ? sc.status : 'Not started'
            })),
            aiScenarios: toSafeArray(req.aiScenarios).map((sc: any, sIdx: number) => ({
              id: toSafeString(sc?.id, `ai-sc-${sIdx + 1}`),
              title: toSafeString(sc?.title, `AI Scenario ${sIdx + 1}`),
              situation: toSafeString(sc?.situation),
              challenge: toSafeString(sc?.challenge),
              decisionPoint: toSafeString(sc?.decisionPoint),
              debrief: toSafeString(sc?.debrief || sc?.reflection),
              moduleRef: toSafeString(sc?.moduleRef),
              status: sc?.status === 'Complete' || sc?.status === 'In progress' ? sc.status : 'Not started'
            })),
            implementationStrategy: toSafeString(req.implementationStrategy),
            rolloutMethod: toSafeString(req.rolloutMethod),
            meApproach: toSafeString(req.meApproach),
            improvementCycle: toSafeString(req.improvementCycle),
            implementationChecklistTitle: toSafeString(req.implementationChecklistTitle, '30-Day Action Plan'),
            rolloutFrameworkTitle: toSafeString(req.rolloutFrameworkTitle, 'Rollout SOP'),
            riskComplianceSectionTitle: toSafeString(req.riskComplianceSectionTitle, 'Risk & Compliance Matrix'),
            continuousAiLearningApproach: toSafeString(req.continuousAiLearningApproach),
            aiGovernanceFramework: toSafeString(req.aiGovernanceFramework),
            aiFeedbackReviewMechanism: toSafeString(req.aiFeedbackReviewMechanism)
          }
        };
      })
    : scratch.modules;

  const p = raw.problem && typeof raw.problem === 'object' ? raw.problem : {};
  const r = raw.research && typeof raw.research === 'object' ? raw.research : {};
  const s = raw.structure && typeof raw.structure === 'object' ? raw.structure : {};
  const ld = raw.learningDesign && typeof raw.learningDesign === 'object' ? raw.learningDesign : {};
  const e = raw.ethics && typeof raw.ethics === 'object' ? raw.ethics : {};
  const out = raw.outputRequirements && typeof raw.outputRequirements === 'object' ? raw.outputRequirements : {};
  const cust = raw.customisation && typeof raw.customisation === 'object' ? raw.customisation : {};

  const safeSources: ResearchSource[] = toSafeArray(r.sources).map((src: any, idx: number): ResearchSource => ({
    id: toSafeString(src?.id, `src-${idx + 1}`),
    name: toSafeString(src?.name, 'Source'),
    type: (src?.type || 'Regulatory framework') as any,
    reference: toSafeString(src?.reference),
    relevance: toSafeString(src?.relevance),
    status: (src?.status || 'Verified') as any
  }));

  const safeDiagnostic: DiagnosticQuestion[] = toSafeArray(s.diagnosticQuestions).map((dq: any, idx: number): DiagnosticQuestion => ({
    id: toSafeString(dq?.id, `dq-${idx + 1}`),
    category: (dq?.category || 'General domain') as any,
    question: toSafeString(dq?.question || dq?.title),
    purpose: toSafeString(dq?.purpose || dq?.explanation)
  }));

  const safeAssessments: AssessmentItem[] = toSafeArray(ld.assessments).map((a: any, idx: number): AssessmentItem => ({
    id: toSafeString(a?.id, `ass-${idx + 1}`),
    type: (a?.type || 'Practical Application Task') as any,
    description: toSafeString(a?.description),
    timing: toSafeString(a?.timing),
    weighting: toSafeString(a?.weighting),
    passMark: toSafeString(a?.passMark),
    notes: toSafeString(a?.notes)
  }));

  const safeCards: EthicsCardData[] = toSafeArray(e.cards).map((c: any, idx: number): EthicsCardData => ({
    id: toSafeString(c?.id, `eth-${idx + 1}`),
    title: toSafeString(c?.title, 'Ethical Safeguard'),
    subtitle: toSafeString(c?.subtitle, 'Compliance Safeguard'),
    status: (c?.status || 'Complete') as any,
    guidingQuestion: toSafeString(c?.guidingQuestion),
    response: toSafeString(c?.response),
    exampleText: toSafeString(c?.exampleText),
    complianceRef: toSafeString(c?.complianceRef, 'POPIA')
  }));

  const validStatus: 'Draft' | 'In Review' | 'Completed' =
    raw.status === 'Completed' || raw.status === 'In Review' ? raw.status : 'Draft';

  return {
    ...scratch,
    id: toSafeString(raw.id, `course-${Date.now()}`),
    name: toSafeString(raw.name || s.title, fallbackName),
    code: toSafeString(raw.code || s.code, 'EST-COURSE-01'),
    status: validStatus,
    lastModified: toSafeString(raw.lastModified, 'Just now'),
    approvalStatus: raw.approvalStatus,
    generatedCourse: raw.generatedCourse,
    problem: {
      ...scratch.problem,
      targetGroup: toSafeString(p.targetGroup || scratch.problem.targetGroup),
      taskOrSkill: toSafeString(p.taskOrSkill || scratch.problem.taskOrSkill),
      operationalImpact: toSafeString(p.operationalImpact || scratch.problem.operationalImpact),
      rootCauses: toSafeArray(p.rootCauses).length > 0 ? toSafeArray(p.rootCauses).map(rc => toSafeString(rc)) : scratch.problem.rootCauses,
      processFailures: toSafeString(p.processFailures || scratch.problem.processFailures),
      skillGaps: toSafeString(p.skillGaps || scratch.problem.skillGaps),
      constraints: toSafeString(p.constraints || scratch.problem.constraints),
      aiLiteracyGap: toSafeString(p.aiLiteracyGap || scratch.problem.aiLiteracyGap),
      digitalReadinessLevel: toSafeString(p.digitalReadinessLevel || scratch.problem.digitalReadinessLevel),
      aiEthicsComplianceRisk: toSafeString(p.aiEthicsComplianceRisk || scratch.problem.aiEthicsComplianceRisk)
    },
    research: {
      ...scratch.research,
      sources: safeSources.length > 0 ? safeSources : scratch.research.sources,
      regulatoryFramework: toSafeString(r.regulatoryFramework || scratch.research.regulatoryFramework),
      aiToolsPlatformName: toSafeString(r.aiToolsPlatformName || scratch.research.aiToolsPlatformName),
      aiEthicsFramework: toSafeString(r.aiEthicsFramework || scratch.research.aiEthicsFramework),
      caseStudyUseCases: toSafeString(r.caseStudyUseCases || scratch.research.caseStudyUseCases),
      evidenceStandards: toSafeArray(r.evidenceStandards).length > 0 ? toSafeArray(r.evidenceStandards).map(es => toSafeString(es)) : scratch.research.evidenceStandards,
      benchmarkingNotes: toSafeString(r.benchmarkingNotes || scratch.research.benchmarkingNotes),
      benchmarkCourseRef: toSafeString(r.benchmarkCourseRef || scratch.research.benchmarkCourseRef)
    },
    structure: {
      ...scratch.structure,
      title: toSafeString(s.title || raw.name, fallbackName),
      code: toSafeString(s.code || raw.code, 'EST-COURSE-01'),
      industryDomain: toSafeString(s.industryDomain || scratch.structure.industryDomain),
      targetRoles: toSafeString(s.targetRoles || scratch.structure.targetRoles),
      aiIntegrationLevel: (s.aiIntegrationLevel || 'Applied') as any,
      setaNqfLevel: toSafeString(s.setaNqfLevel || scratch.structure.setaNqfLevel),
      deliveryLanguages: toSafeString(s.deliveryLanguages || scratch.structure.deliveryLanguages),
      estimatedDuration: toSafeString(s.estimatedDuration || scratch.structure.estimatedDuration),
      deliveryFormat: toSafeString(s.deliveryFormat || scratch.structure.deliveryFormat),
      difficultyLevel: (s.difficultyLevel || 'Intermediate') as any,
      purposeStatement: toSafeString(s.purposeStatement || scratch.structure.purposeStatement),
      workplaceRelevance: toSafeString(s.workplaceRelevance || scratch.structure.workplaceRelevance),
      performanceImprovement: toSafeString(s.performanceImprovement || scratch.structure.performanceImprovement),
      aiTechAngle: toSafeString(s.aiTechAngle || scratch.structure.aiTechAngle),
      scopeSummary: toSafeString(s.scopeSummary || scratch.structure.scopeSummary),
      aiEraRelevance: toSafeString(s.aiEraRelevance || scratch.structure.aiEraRelevance),
      performanceLink: toSafeString(s.performanceLink || scratch.structure.performanceLink),
      organisationalBenefits: toSafeArray(s.organisationalBenefits).length > 0 ? toSafeArray(s.organisationalBenefits).map(b => toSafeString(b)) : scratch.structure.organisationalBenefits,
      employeeBenefits: toSafeArray(s.employeeBenefits).length > 0 ? toSafeArray(s.employeeBenefits).map(b => toSafeString(b)) : scratch.structure.employeeBenefits,
      riskReductionOutcomes: toSafeArray(s.riskReductionOutcomes).length > 0 ? toSafeArray(s.riskReductionOutcomes).map(b => toSafeString(b)) : scratch.structure.riskReductionOutcomes,
      prerequisiteKnowledge: toSafeString(s.prerequisiteKnowledge || scratch.structure.prerequisiteKnowledge),
      prerequisiteExperience: toSafeString(s.prerequisiteExperience || scratch.structure.prerequisiteExperience),
      toolsSystems: toSafeString(s.toolsSystems || scratch.structure.toolsSystems),
      diagnosticQuestions: safeDiagnostic.length > 0 ? safeDiagnostic : scratch.structure.diagnosticQuestions
    },
    modules: safeModules,
    learningDesign: {
      ...scratch.learningDesign,
      instructionalApproach: toSafeString(ld.instructionalApproach || scratch.learningDesign.instructionalApproach),
      assessments: safeAssessments.length > 0 ? safeAssessments : scratch.learningDesign.assessments,
      aiDemoSimulationDescription: toSafeString(ld.aiDemoSimulationDescription || scratch.learningDesign.aiDemoSimulationDescription),
      promptExerciseDescription: toSafeString(ld.promptExerciseDescription || scratch.learningDesign.promptExerciseDescription),
      criticalThinkingDescription: toSafeString(ld.criticalThinkingDescription || scratch.learningDesign.criticalThinkingDescription)
    },
    ethics: {
      ...scratch.ethics,
      confidentialityRequirements: toSafeString(e.confidentialityRequirements || scratch.ethics.confidentialityRequirements),
      psychologicalSafetyNotes: toSafeString(e.psychologicalSafetyNotes || scratch.ethics.psychologicalSafetyNotes),
      cards: safeCards.length > 0 ? safeCards : scratch.ethics.cards
    },
    outputRequirements: {
      ...scratch.outputRequirements,
      outputFormat: toSafeString(out.outputFormat || scratch.outputRequirements.outputFormat),
      accessibilityTargetReadingLevel: toSafeString(out.accessibilityTargetReadingLevel || scratch.outputRequirements.accessibilityTargetReadingLevel),
      formattingRequirements: toSafeString(out.formattingRequirements || scratch.outputRequirements.formattingRequirements)
    },
    customisation: {
      ...scratch.customisation,
      branding: toSafeString(cust.branding || scratch.customisation.branding),
      tone: toSafeString(cust.tone || scratch.customisation.tone),
      deliveryPreferences: toSafeString(cust.deliveryPreferences || scratch.customisation.deliveryPreferences)
    }
  };
}
