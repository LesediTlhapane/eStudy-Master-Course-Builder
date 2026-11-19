import type { Course, CourseModule, ResearchSource, DiagnosticQuestion, AssessmentItem, EthicsCardData } from '../types.js';
import { createScratchCourse } from '../data/initialCourseData.js';
import { toSafeArray } from './promptGenerator.js';

/**
+ * Preserves user string values WITHOUT calling .trim(), so typing spaces
+ * in Course Title or any other input field is never interrupted.
+ */
function preserveStr(v: any, fallback: string = ''): string {
  if (v === null || v === undefined) return fallback;
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) {
    return v.map(item => preserveStr(item)).filter(Boolean).join(', ');
  }
  if (typeof v === 'object') {
    if (v.text) return preserveStr(v.text);
    if (v.title) return preserveStr(v.title);
    if (v.name) return preserveStr(v.name);
    if (v.content) return preserveStr(v.content);
    if (v.description) return preserveStr(v.description);
    try {
      return JSON.stringify(v);
    } catch {
      return fallback;
    }
  }
  return String(v);
}

/**
 * Ensures any course object (from localStorage, uploaded template, or partial AI generation)
 * is safely populated with valid array structures without overwriting empty user fields
 * or trimming spaces while typing.
 */
export function sanitizeCourse(raw: any, fallbackName: string = 'Untitled Course'): Course {
  if (!raw || typeof raw !== 'object') {
    return createScratchCourse(fallbackName === 'Untitled Course' ? '' : fallbackName);
  }

  const baseTitle = preserveStr(raw.structure?.title ?? (raw.name === 'Untitled Course' ? '' : raw.name), '');
  const scratch = createScratchCourse(baseTitle);

  const rawModulesList = toSafeArray(raw.modules);
  const safeModules: CourseModule[] = rawModulesList.length > 0
    ? rawModulesList.map((m: any, idx: number): CourseModule => {
        const defaultMod = scratch.modules[0] || {
          id: `module-${idx + 1}`,
          moduleNumber: idx + 1,
          title: '',
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
          id: preserveStr(m.id, `module-${idx + 1}`),
          moduleNumber: typeof m.moduleNumber === 'number' ? m.moduleNumber : (typeof m.number === 'number' ? m.number : idx + 1),
          title: preserveStr(m.title, ''),
          subtitle: preserveStr(m.subtitle, ''),
          purpose: preserveStr(m.purpose, ''),
          duration: preserveStr(m.duration, ''),
          keySkills: toSafeArray(m.keySkills).map(k => preserveStr(k)),
          learningObjectives: toSafeArray(m.learningObjectives).map(lo => preserveStr(lo)),
          status: m.status === 'Complete' || m.status === 'In progress' ? m.status : 'Not started',
          requirements: {
            ...scratch.modules[0]?.requirements,
            problemDefinition: preserveStr(req.problemDefinition),
            workplaceContext: preserveStr(req.workplaceContext),
            keyTerms: preserveStr(req.keyTerms),
            causes: preserveStr(req.causes),
            warningSigns: preserveStr(req.warningSigns),
            impactStatement: preserveStr(req.impactStatement),
            aiDemystification: preserveStr(req.aiDemystification),
            aiInThisDomain: preserveStr(req.aiInThisDomain),
            aiToolsOverview: preserveStr(req.aiToolsOverview),
            responsibleAiPrinciples: preserveStr(req.responsibleAiPrinciples),
            toolsAndTechniques: preserveStr(req.toolsAndTechniques),
            procedureSteps: preserveStr(req.procedureSteps),
            roleResponsibilities: preserveStr(req.roleResponsibilities),
            communicationApproach: preserveStr(req.communicationApproach),
            supportMechanisms: preserveStr(req.supportMechanisms),
            scenarios: toSafeArray(req.scenarios).map((sc: any, sIdx: number) => ({
              id: preserveStr(sc?.id, `sc-${sIdx + 1}`),
              title: preserveStr(sc?.title, ''),
              situation: preserveStr(sc?.situation),
              challenge: preserveStr(sc?.challenge),
              decisionPoint: preserveStr(sc?.decisionPoint),
              debrief: preserveStr(sc?.debrief || sc?.reflection),
              moduleRef: preserveStr(sc?.moduleRef),
              status: sc?.status === 'Complete' || sc?.status === 'In progress' ? sc.status : 'Not started'
            })),
            aiScenarios: toSafeArray(req.aiScenarios).map((sc: any, sIdx: number) => ({
              id: preserveStr(sc?.id, `ai-sc-${sIdx + 1}`),
              title: preserveStr(sc?.title, ''),
              situation: preserveStr(sc?.situation),
              challenge: preserveStr(sc?.challenge),
              decisionPoint: preserveStr(sc?.decisionPoint),
              debrief: preserveStr(sc?.debrief || sc?.reflection),
              moduleRef: preserveStr(sc?.moduleRef),
              status: sc?.status === 'Complete' || sc?.status === 'In progress' ? sc.status : 'Not started'
            })),
            implementationStrategy: preserveStr(req.implementationStrategy),
            rolloutMethod: preserveStr(req.rolloutMethod),
            meApproach: preserveStr(req.meApproach),
            improvementCycle: preserveStr(req.improvementCycle),
            implementationChecklistTitle: preserveStr(req.implementationChecklistTitle),
            rolloutFrameworkTitle: preserveStr(req.rolloutFrameworkTitle),
            riskComplianceSectionTitle: preserveStr(req.riskComplianceSectionTitle),
            continuousAiLearningApproach: preserveStr(req.continuousAiLearningApproach),
            aiGovernanceFramework: preserveStr(req.aiGovernanceFramework),
            aiFeedbackReviewMechanism: preserveStr(req.aiFeedbackReviewMechanism)
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
  const qa = raw.qa && typeof raw.qa === 'object' ? raw.qa : {};

  const safeSources: ResearchSource[] = toSafeArray(r.sources).map((src: any, idx: number): ResearchSource => ({
    id: preserveStr(src?.id, `src-${idx + 1}`),
    name: preserveStr(src?.name),
    type: (src?.type || 'Regulatory framework') as any,
    reference: preserveStr(src?.reference),
    relevance: preserveStr(src?.relevance),
    status: (src?.status || 'Verified') as any,
    notes: preserveStr(src?.notes),
    medium: src?.medium,
    url: preserveStr(src?.url),
    fileName: preserveStr(src?.fileName),
    fileSize: preserveStr(src?.fileSize),
    contentSnippet: preserveStr(src?.contentSnippet),
    dateAdded: preserveStr(src?.dateAdded)
  }));

  const safeDiagnostic: DiagnosticQuestion[] = toSafeArray(s.diagnosticQuestions).map((dq: any, idx: number): DiagnosticQuestion => ({
    id: preserveStr(dq?.id, `dq-${idx + 1}`),
    category: (dq?.category || 'General domain') as any,
    question: preserveStr(dq?.question ?? dq?.title),
    purpose: preserveStr(dq?.purpose ?? dq?.explanation),
    options: Array.isArray(dq?.options) ? dq.options.map((o: any) => preserveStr(o)) : undefined,
    correctAnswerIndex: typeof dq?.correctAnswerIndex === 'number' ? dq.correctAnswerIndex : undefined,
    explanation: preserveStr(dq?.explanation)
  }));

  const safeAssessments: AssessmentItem[] = toSafeArray(ld.assessments).map((a: any, idx: number): AssessmentItem => ({
    id: preserveStr(a?.id, `ass-${idx + 1}`),
    type: (a?.type || 'Practical Application Task') as any,
    description: preserveStr(a?.description),
    timing: preserveStr(a?.timing),
    weighting: preserveStr(a?.weighting),
    passMark: preserveStr(a?.passMark),
    notes: preserveStr(a?.notes)
  }));

  const safeCards: EthicsCardData[] = toSafeArray(e.cards).map((c: any, idx: number): EthicsCardData => ({
    id: preserveStr(c?.id, `eth-${idx + 1}`),
    title: preserveStr(c?.title, 'Ethical Safeguard'),
    subtitle: preserveStr(c?.subtitle, 'Compliance Safeguard'),
    status: (c?.status || 'Needs input') as any,
    guidingQuestion: preserveStr(c?.guidingQuestion),
    response: preserveStr(c?.response),
    exampleText: preserveStr(c?.exampleText),
    complianceRef: preserveStr(c?.complianceRef, 'POPIA')
  }));

  const validStatus: 'Draft' | 'In Review' | 'Completed' =
    raw.status === 'Completed' || raw.status === 'In Review' ? raw.status : 'Draft';

  const lp = r.learnerProfile && typeof r.learnerProfile === 'object' ? r.learnerProfile : {};

  return {
    ...scratch,
    id: preserveStr(raw.id, `course-${Date.now()}`),
    name: preserveStr(raw.name || s.title, fallbackName),
    code: preserveStr(raw.code ?? s.code, ''),
    status: validStatus,
    lastModified: preserveStr(raw.lastModified, 'Just now'),
    coverLogoUrl: raw.coverLogoUrl,
    coverVisualUrl: raw.coverVisualUrl,
    flaggedFields: raw.flaggedFields && typeof raw.flaggedFields === 'object' ? raw.flaggedFields : undefined,
    uploadedTemplateName: raw.uploadedTemplateName,
    approvalStatus: raw.approvalStatus,
    generatedCourse: raw.generatedCourse,
    problem: {
      ...scratch.problem,
      targetGroup: preserveStr(p.targetGroup),
      taskOrSkill: preserveStr(p.taskOrSkill),
      operationalImpact: preserveStr(p.operationalImpact),
      rootCauses: toSafeArray(p.rootCauses).length > 0 ? toSafeArray(p.rootCauses).map(rc => preserveStr(rc)) : scratch.problem.rootCauses,
      processFailures: preserveStr(p.processFailures),
      skillGaps: preserveStr(p.skillGaps),
      constraints: preserveStr(p.constraints),
      aiLiteracyGap: preserveStr(p.aiLiteracyGap),
      digitalReadinessLevel: preserveStr(p.digitalReadinessLevel),
      aiEthicsComplianceRisk: preserveStr(p.aiEthicsComplianceRisk)
    },
    research: {
      ...scratch.research,
      sources: safeSources,
      regulatoryFramework: preserveStr(r.regulatoryFramework),
      aiToolsPlatformName: preserveStr(r.aiToolsPlatformName),
      aiEthicsFramework: preserveStr(r.aiEthicsFramework),
      caseStudyUseCases: preserveStr(r.caseStudyUseCases),
      evidenceStandards: toSafeArray(r.evidenceStandards).map(es => preserveStr(es)),
      benchmarkingNotes: preserveStr(r.benchmarkingNotes),
      benchmarkCourseRef: preserveStr(r.benchmarkCourseRef),
      auditEvidence: preserveStr(r.auditEvidence),
      learnerProfile: {
        jobRoles: preserveStr(lp.jobRoles),
        departments: preserveStr(lp.departments),
        experienceLevels: preserveStr(lp.experienceLevels),
        existingKnowledge: preserveStr(lp.existingKnowledge),
        digitalLiteracy: preserveStr(lp.digitalLiteracy),
        aiFamiliarity: preserveStr(lp.aiFamiliarity),
        workplaceEnvironment: preserveStr(lp.workplaceEnvironment),
        organisationalConstraints: preserveStr(lp.organisationalConstraints),
        availableToolsAndTechnology: preserveStr(lp.availableToolsAndTechnology)
      }
    },
    structure: {
      ...scratch.structure,
      title: preserveStr(s.title ?? (raw.name === 'Untitled Course' ? '' : raw.name)),
      code: preserveStr(s.code ?? raw.code),
      industryDomain: preserveStr(s.industryDomain),
      targetRoles: preserveStr(s.targetRoles),
      targetAudience: preserveStr(s.targetAudience),
      deliveryModality: preserveStr(s.deliveryModality),
      assessmentRigour: preserveStr(s.assessmentRigour),
      aiIntegrationLevel: (s.aiIntegrationLevel || 'Applied') as any,
      setaNqfLevel: preserveStr(s.setaNqfLevel),
      deliveryLanguages: preserveStr(s.deliveryLanguages),
      estimatedDuration: preserveStr(s.estimatedDuration),
      deliveryFormat: preserveStr(s.deliveryFormat),
      difficultyLevel: (s.difficultyLevel || 'Intermediate') as any,
      purposeStatement: preserveStr(s.purposeStatement),
      workplaceRelevance: preserveStr(s.workplaceRelevance),
      performanceImprovement: preserveStr(s.performanceImprovement),
      aiTechAngle: preserveStr(s.aiTechAngle),
      scopeSummary: preserveStr(s.scopeSummary),
      aiEraRelevance: preserveStr(s.aiEraRelevance),
      performanceLink: preserveStr(s.performanceLink),
      organisationalBenefits: toSafeArray(s.organisationalBenefits).length > 0 ? toSafeArray(s.organisationalBenefits).map(b => preserveStr(b)) : scratch.structure.organisationalBenefits,
      employeeBenefits: toSafeArray(s.employeeBenefits).length > 0 ? toSafeArray(s.employeeBenefits).map(b => preserveStr(b)) : scratch.structure.employeeBenefits,
      riskReductionOutcomes: toSafeArray(s.riskReductionOutcomes).length > 0 ? toSafeArray(s.riskReductionOutcomes).map(b => preserveStr(b)) : scratch.structure.riskReductionOutcomes,
      scope: preserveStr(s.scope),
      keyCompetencies: preserveStr(s.keyCompetencies),
      realWorldApplication: preserveStr(s.realWorldApplication),
      aiSkillsDeveloped: preserveStr(s.aiSkillsDeveloped),
      jobRoles: preserveStr(s.jobRoles),
      departments: preserveStr(s.departments),
      experienceLevel: preserveStr(s.experienceLevel),
      aiFamiliarityBaseline: (s.aiFamiliarityBaseline || 'Basic') as any,
      aiFamiliarityExplanation: preserveStr(s.aiFamiliarityExplanation),
      prerequisiteKnowledge: preserveStr(s.prerequisiteKnowledge),
      prerequisiteExperience: preserveStr(s.prerequisiteExperience),
      toolsSystems: preserveStr(s.toolsSystems),
      digitalLiteracyLevel: preserveStr(s.digitalLiteracyLevel),
      diagnosticQuestions: safeDiagnostic.length > 0 ? safeDiagnostic : scratch.structure.diagnosticQuestions
    },
    modules: safeModules,
    learningDesign: {
      ...scratch.learningDesign,
      coreStandardsSummary: preserveStr(ld.coreStandardsSummary),
      instructionalApproach: preserveStr(ld.instructionalApproach),
      assessments: safeAssessments.length > 0 ? safeAssessments : scratch.learningDesign.assessments,
      aiDemoSimulationDescription: preserveStr(ld.aiDemoSimulationDescription),
      promptExerciseDescription: preserveStr(ld.promptExerciseDescription),
      aiEvaluationTask: preserveStr(ld.aiEvaluationTask),
      collaborationActivity: preserveStr(ld.collaborationActivity),
      workplaceActivities: toSafeArray(ld.workplaceActivities).map(wa => preserveStr(wa)),
      examplesAndRelevance: preserveStr(ld.examplesAndRelevance),
      knowledgeChecksDescription: preserveStr(ld.knowledgeChecksDescription),
      criticalThinkingDescription: preserveStr(ld.criticalThinkingDescription),
      reflectionPrompts: preserveStr(ld.reflectionPrompts),
      practicalTaskWeighting: preserveStr(ld.practicalTaskWeighting),
      finalAssessmentPassMark: preserveStr(ld.finalAssessmentPassMark)
    },
    ethics: {
      ...scratch.ethics,
      confidentialityRequirements: preserveStr(e.confidentialityRequirements),
      dataPrivacyFramework: preserveStr(e.dataPrivacyFramework),
      ethicsStandards: preserveStr(e.ethicsStandards),
      psychologicalSafetyNotes: preserveStr(e.psychologicalSafetyNotes),
      decisionMakingFramework: preserveStr(e.decisionMakingFramework),
      accountabilityMechanism: preserveStr(e.accountabilityMechanism),
      aiBiasRisk: preserveStr(e.aiBiasRisk),
      aiDisclosureRequirement: preserveStr(e.aiDisclosureRequirement),
      humanOverrideScenarios: preserveStr(e.humanOverrideScenarios),
      dataSovereigntyContext: preserveStr(e.dataSovereigntyContext),
      aiWorkforceImpactNarrative: preserveStr(e.aiWorkforceImpactNarrative),
      aiGovernanceReference: preserveStr(e.aiGovernanceReference),
      cards: safeCards.length > 0 ? safeCards : scratch.ethics.cards
    },
    outputRequirements: {
      ...scratch.outputRequirements,
      outputFormat: preserveStr(out.outputFormat),
      requiredSectionsNote: preserveStr(out.requiredSectionsNote),
      moduleRequirementsRule: preserveStr(out.moduleRequirementsRule),
      assessmentRequirementsRule: preserveStr(out.assessmentRequirementsRule),
      scenarioRequirementsRule: preserveStr(out.scenarioRequirementsRule),
      mandatoryDeliverablesRule: preserveStr(out.mandatoryDeliverablesRule),
      referencesRule: preserveStr(out.referencesRule),
      accessibilityTargetReadingLevel: preserveStr(out.accessibilityTargetReadingLevel),
      plainLanguageApplied: typeof out.plainLanguageApplied === 'boolean' ? out.plainLanguageApplied : true,
      culturalInclusivityNotes: preserveStr(out.culturalInclusivityNotes),
      formattingRequirements: preserveStr(out.formattingRequirements),
      accreditationBody: preserveStr(out.accreditationBody),
      qualificationOrUnitStandard: preserveStr(out.qualificationOrUnitStandard),
      nqfLevel: preserveStr(out.nqfLevel),
      accreditationRequirements: preserveStr(out.accreditationRequirements),
      requiredLearningStructure: preserveStr(out.requiredLearningStructure),
      accreditationAssessmentRequirements: preserveStr(out.accreditationAssessmentRequirements)
    },
    qa: {
      benchmarkReviewed: Boolean(qa.benchmarkReviewed),
      benchmarkReviewNotes: preserveStr(qa.benchmarkReviewNotes),
      qaChecklistConfirmed: Boolean(qa.qaChecklistConfirmed),
      checklistItems: qa.checklistItems && typeof qa.checklistItems === 'object' ? qa.checklistItems : {}
    },
    customisation: {
      ...scratch.customisation,
      branding: preserveStr(cust.branding),
      tone: preserveStr(cust.tone),
      audienceContext: preserveStr(cust.audienceContext),
      industryExamples: preserveStr(cust.industryExamples),
      terminology: preserveStr(cust.terminology),
      formatting: preserveStr(cust.formatting),
      deliveryPreferences: preserveStr(cust.deliveryPreferences),
      planningNotes: Array.isArray(cust.planningNotes) ? cust.planningNotes : [],
      historicalCourses: Array.isArray(cust.historicalCourses) ? cust.historicalCourses : []
    }
  };
}
